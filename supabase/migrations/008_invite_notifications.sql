-- Allow invitees (matched by email) to update their own invites (accept/decline)
create policy "Invitees can update own invites" on public.invites
  for update using (
    email = (select email from auth.users where id = auth.uid())
  );
