-- HoldMe Database Schema
-- Initial migration: core tables with RLS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  interests text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Spaces table
create table public.spaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references public.users(id) on delete cascade not null,
  visibility text default 'private' check (visibility in ('private', 'members_only')) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Space members
create table public.space_members (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text default 'partner' check (role in ('owner', 'partner')) not null,
  permissions jsonb default '{"view_items": true, "send_strength": true, "comment": true}'::jsonb,
  joined_at timestamptz default now() not null,
  unique(space_id, user_id)
);

-- Accountability items
create table public.accountability_items (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  type text default 'goal' check (type in ('goal', 'task', 'habit', 'commitment')) not null,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'monthly', 'one_time')) not null,
  status text default 'active' check (status in ('active', 'in_progress', 'completed', 'missed', 'paused')) not null,
  due_date timestamptz,
  reminder_schedule jsonb,
  is_visible boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Check-ins
create table public.item_checkins (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.accountability_items(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('completed', 'skipped', 'missed')) not null,
  note text,
  proof_url text,
  checked_in_at timestamptz default now() not null
);

-- Strengths (encouragement)
create table public.strengths (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.accountability_items(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  receiver_id uuid references public.users(id) on delete cascade not null,
  message text,
  created_at timestamptz default now() not null
);

-- Comments
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.accountability_items(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text check (type in ('strength', 'comment', 'reminder', 'invite', 'checkin', 'missed')) not null,
  title text not null,
  body text not null,
  data jsonb,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

-- Invites
create table public.invites (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  inviter_id uuid references public.users(id) on delete cascade not null,
  email text,
  token text default uuid_generate_v4()::text unique not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')) not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null
);

-- Reports
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.users(id) on delete cascade not null,
  reported_user_id uuid references public.users(id) on delete set null,
  space_id uuid references public.spaces(id) on delete set null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')) not null,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index idx_space_members_space on public.space_members(space_id);
create index idx_space_members_user on public.space_members(user_id);
create index idx_accountability_items_space on public.accountability_items(space_id);
create index idx_accountability_items_user on public.accountability_items(user_id);
create index idx_item_checkins_item on public.item_checkins(item_id);
create index idx_item_checkins_user on public.item_checkins(user_id);
create index idx_strengths_receiver on public.strengths(receiver_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id) where read = false;
create index idx_invites_token on public.invites(token);
create index idx_invites_email on public.invites(email);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.accountability_items enable row level security;
alter table public.item_checkins enable row level security;
alter table public.strengths enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.invites enable row level security;
alter table public.reports enable row level security;

-- RLS Policies

-- Users: can read own profile, update own profile, read others for display
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can view others in shared spaces" on public.users
  for select using (
    id in (
      select sm.user_id from public.space_members sm
      where sm.space_id in (
        select sm2.space_id from public.space_members sm2
        where sm2.user_id = auth.uid()
      )
    )
  );

-- Spaces: owners and members can view
create policy "Space members can view spaces" on public.spaces
  for select using (
    id in (
      select space_id from public.space_members
      where user_id = auth.uid()
    )
  );

create policy "Users can create spaces" on public.spaces
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update spaces" on public.spaces
  for update using (auth.uid() = owner_id);

create policy "Owners can delete spaces" on public.spaces
  for delete using (auth.uid() = owner_id);

-- Space members
create policy "Members can view space members" on public.space_members
  for select using (
    space_id in (
      select space_id from public.space_members
      where user_id = auth.uid()
    )
  );

create policy "Owners can manage members" on public.space_members
  for insert with check (
    space_id in (
      select id from public.spaces where owner_id = auth.uid()
    )
  );

create policy "Owners can remove members" on public.space_members
  for delete using (
    space_id in (
      select id from public.spaces where owner_id = auth.uid()
    )
    or user_id = auth.uid()
  );

-- Accountability items
create policy "Members can view visible items" on public.accountability_items
  for select using (
    (user_id = auth.uid())
    or (
      is_visible = true
      and space_id in (
        select space_id from public.space_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can create items in their spaces" on public.accountability_items
  for insert with check (
    auth.uid() = user_id
    and space_id in (
      select space_id from public.space_members
      where user_id = auth.uid()
    )
  );

create policy "Users can update own items" on public.accountability_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own items" on public.accountability_items
  for delete using (auth.uid() = user_id);

-- Check-ins
create policy "Users can view checkins for visible items" on public.item_checkins
  for select using (
    item_id in (
      select id from public.accountability_items
      where user_id = auth.uid()
        or (is_visible = true and space_id in (
          select space_id from public.space_members where user_id = auth.uid()
        ))
    )
  );

create policy "Users can create own checkins" on public.item_checkins
  for insert with check (
    auth.uid() = user_id
    and item_id in (
      select id from public.accountability_items where user_id = auth.uid()
    )
  );

-- Strengths
create policy "Users can view received strengths" on public.strengths
  for select using (receiver_id = auth.uid() or sender_id = auth.uid());

create policy "Members can send strength" on public.strengths
  for insert with check (
    auth.uid() = sender_id
    and item_id in (
      select id from public.accountability_items
      where is_visible = true
        and space_id in (
          select space_id from public.space_members where user_id = auth.uid()
        )
    )
  );

-- Comments
create policy "Members can view comments" on public.comments
  for select using (
    item_id in (
      select id from public.accountability_items
      where user_id = auth.uid()
        or (is_visible = true and space_id in (
          select space_id from public.space_members where user_id = auth.uid()
        ))
    )
  );

create policy "Members can create comments" on public.comments
  for insert with check (
    auth.uid() = user_id
    and item_id in (
      select id from public.accountability_items
      where is_visible = true
        and space_id in (
          select space_id from public.space_members where user_id = auth.uid()
        )
    )
  );

-- Notifications
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Invites
create policy "Inviters can view own invites" on public.invites
  for select using (inviter_id = auth.uid() or email = (select email from auth.users where id = auth.uid()));

create policy "Space owners can create invites" on public.invites
  for insert with check (
    space_id in (
      select id from public.spaces where owner_id = auth.uid()
    )
  );

create policy "Inviters can update invites" on public.invites
  for update using (inviter_id = auth.uid());

-- Reports
create policy "Users can create reports" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "Users can view own reports" on public.reports
  for select using (auth.uid() = reporter_id);

-- Function: automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create profile on auth signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function: update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers: auto-update updated_at
create trigger update_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

create trigger update_spaces_updated_at
  before update on public.spaces
  for each row execute function public.update_updated_at();

create trigger update_accountability_items_updated_at
  before update on public.accountability_items
  for each row execute function public.update_updated_at();

-- Enable realtime for key tables
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.strengths;
alter publication supabase_realtime add table public.item_checkins;
