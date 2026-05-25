-- Circles feature: group accountability with shared goals

-- Circles table
create table public.circles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  emoji text default '🎯',
  created_by uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Circle members
create table public.circle_members (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'member')) not null,
  joined_at timestamptz default now() not null,
  unique(circle_id, user_id)
);

-- Circle goals (shared goals anyone can check in on)
create table public.circle_goals (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  title text not null,
  created_by uuid references public.users(id) on delete cascade not null,
  status text default 'active' check (status in ('active', 'completed', 'archived')) not null,
  created_at timestamptz default now() not null
);

-- Circle check-ins (any member can check in on any goal)
create table public.circle_checkins (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.circle_goals(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  note text,
  checked_in_at timestamptz default now() not null
);

-- Circle invites (reuse invite pattern)
create table public.circle_invites (
  id uuid default uuid_generate_v4() primary key,
  circle_id uuid references public.circles(id) on delete cascade not null,
  inviter_id uuid references public.users(id) on delete cascade not null,
  token text default uuid_generate_v4()::text unique not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')) not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null
);

-- Indexes
create index idx_circle_members_circle on public.circle_members(circle_id);
create index idx_circle_members_user on public.circle_members(user_id);
create index idx_circle_goals_circle on public.circle_goals(circle_id);
create index idx_circle_checkins_goal on public.circle_checkins(goal_id);
create index idx_circle_checkins_user on public.circle_checkins(user_id);
create index idx_circle_invites_token on public.circle_invites(token);

-- Enable RLS
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.circle_goals enable row level security;
alter table public.circle_checkins enable row level security;
alter table public.circle_invites enable row level security;

-- RLS: Circles
create policy "Circle members can view circles" on public.circles
  for select using (
    id in (select circle_id from public.circle_members where user_id = auth.uid())
  );

create policy "Users can create circles" on public.circles
  for insert with check (auth.uid() = created_by);

create policy "Circle owners can update" on public.circles
  for update using (auth.uid() = created_by);

create policy "Circle owners can delete" on public.circles
  for delete using (auth.uid() = created_by);

-- RLS: Circle members
create policy "Members can view circle members" on public.circle_members
  for select using (
    circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
  );

create policy "Owners can add members" on public.circle_members
  for insert with check (
    circle_id in (select id from public.circles where created_by = auth.uid())
    or user_id = auth.uid()
  );

create policy "Owners can remove members or self-leave" on public.circle_members
  for delete using (
    circle_id in (select id from public.circles where created_by = auth.uid())
    or user_id = auth.uid()
  );

-- RLS: Circle goals
create policy "Members can view circle goals" on public.circle_goals
  for select using (
    circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
  );

create policy "Members can create goals" on public.circle_goals
  for insert with check (
    auth.uid() = created_by
    and circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
  );

create policy "Goal creator or circle owner can update" on public.circle_goals
  for update using (
    auth.uid() = created_by
    or circle_id in (select id from public.circles where created_by = auth.uid())
  );

create policy "Goal creator or circle owner can delete" on public.circle_goals
  for delete using (
    auth.uid() = created_by
    or circle_id in (select id from public.circles where created_by = auth.uid())
  );

-- RLS: Circle check-ins
create policy "Members can view circle checkins" on public.circle_checkins
  for select using (
    goal_id in (
      select id from public.circle_goals
      where circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
    )
  );

create policy "Members can check in" on public.circle_checkins
  for insert with check (
    auth.uid() = user_id
    and goal_id in (
      select id from public.circle_goals
      where circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
    )
  );

-- RLS: Circle invites
create policy "Circle members can view invites" on public.circle_invites
  for select using (
    inviter_id = auth.uid()
    or circle_id in (select circle_id from public.circle_members where user_id = auth.uid())
  );

create policy "Circle owners can create invites" on public.circle_invites
  for insert with check (
    circle_id in (select id from public.circles where created_by = auth.uid())
  );

create policy "Inviters can update invites" on public.circle_invites
  for update using (inviter_id = auth.uid());

-- Add 'circle_checkin' to notifications type check
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('strength', 'comment', 'reminder', 'invite', 'checkin', 'missed', 'circle_checkin'));

-- Trigger: notify circle members on check-in
create or replace function public.handle_circle_checkin()
returns trigger as $$
declare
  _circle_id uuid;
  _goal_title text;
  _user_name text;
  _member record;
begin
  select cg.circle_id, cg.title into _circle_id, _goal_title
  from public.circle_goals cg where cg.id = new.goal_id;

  select coalesce(u.full_name, 'Someone') into _user_name
  from public.users u where u.id = new.user_id;

  for _member in
    select user_id from public.circle_members
    where circle_id = _circle_id and user_id != new.user_id
  loop
    insert into public.notifications (user_id, type, title, body, data)
    values (
      _member.user_id,
      'circle_checkin',
      _user_name || ' completed a goal',
      _user_name || ' checked in on "' || _goal_title || '"',
      jsonb_build_object('circle_id', _circle_id, 'goal_id', new.goal_id, 'url', '/circles/' || _circle_id)
    );
  end loop;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_circle_checkin
  after insert on public.circle_checkins
  for each row execute function public.handle_circle_checkin();

-- Auto-update updated_at on circles
create trigger update_circles_updated_at
  before update on public.circles
  for each row execute function public.update_updated_at();

-- Enable realtime for circle check-ins
alter publication supabase_realtime add table public.circle_checkins;

-- Allow members to view users in shared circles
create policy "Users can view others in shared circles" on public.users
  for select using (
    id in (
      select cm.user_id from public.circle_members cm
      where cm.circle_id in (
        select cm2.circle_id from public.circle_members cm2
        where cm2.user_id = auth.uid()
      )
    )
  );
