-- Enable pg_cron for scheduled reminders
create extension if not exists pg_cron schema extensions;

-- Function to process reminders every minute
create or replace function public.process_reminders()
returns void as $$
declare
  item record;
  user_tz text;
  current_time_in_tz time;
  current_dow int;
  reminder_times jsonb;
  reminder_days jsonb;
  t text;
begin
  for item in
    select ai.id, ai.user_id, ai.title, ai.reminder_schedule
    from public.accountability_items ai
    where ai.status = 'active'
      and ai.reminder_schedule is not null
      and (ai.reminder_schedule->>'enabled')::boolean = true
  loop
    user_tz := coalesce(item.reminder_schedule->>'timezone', 'UTC');
    current_time_in_tz := (now() at time zone user_tz)::time;
    current_dow := extract(isodow from now() at time zone user_tz)::int;

    reminder_days := item.reminder_schedule->'days';
    if reminder_days is not null and jsonb_array_length(reminder_days) > 0 then
      if not reminder_days ? current_dow::text then
        continue;
      end if;
    end if;

    reminder_times := item.reminder_schedule->'times';
    if reminder_times is null or jsonb_array_length(reminder_times) = 0 then
      continue;
    end if;

    for t in select jsonb_array_elements_text(reminder_times)
    loop
      if current_time_in_tz between t::time and (t::time + interval '1 minute') then
        -- Dedup: skip if reminder for this item was sent in the last hour
        if not exists (
          select 1 from public.notifications
          where user_id = item.user_id
            and type = 'reminder'
            and (data->>'item_id')::text = item.id::text
            and created_at > now() - interval '1 hour'
        ) then
          insert into public.notifications (user_id, type, title, body, data)
          values (
            item.user_id,
            'reminder',
            'Time to check in!',
            'Don''t forget: "' || item.title || '"',
            jsonb_build_object('item_id', item.id, 'item_title', item.title)
          );
        end if;
      end if;
    end loop;
  end loop;
end;
$$ language plpgsql security definer;

-- Schedule to run every minute
select cron.schedule(
  'process-reminders',
  '* * * * *',
  $$select public.process_reminders()$$
);
