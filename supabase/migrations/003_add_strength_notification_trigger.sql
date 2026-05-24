create or replace function public.handle_new_strength()
returns trigger as $$
declare
  sender_name text;
  item_title text;
begin
  select full_name into sender_name from public.users where id = new.sender_id;
  select title into item_title from public.accountability_items where id = new.item_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    new.receiver_id,
    'strength',
    coalesce(sender_name, 'Someone') || ' sent you strength',
    'On your goal "' || coalesce(item_title, 'a goal') || '"',
    jsonb_build_object(
      'strength_id', new.id,
      'item_id', new.item_id,
      'sender_id', new.sender_id,
      'sender_name', coalesce(sender_name, 'Someone'),
      'item_title', coalesce(item_title, 'a goal')
    )
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_strength_created
  after insert on public.strengths
  for each row execute function public.handle_new_strength();
