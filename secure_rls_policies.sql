-- Helper Function: Check if user is Admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- Helper Function: Check if psychologist owns the record
create or replace function public.is_own_psychologist(psych_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.psychologists
    where user_id = auth.uid()
    and id = psych_id
  );
$$;

-- ### RLS POLICIES ###

-- USERS
alter table "public"."users" enable row level security;
drop policy if exists "Admins have full access" on "public"."users";
drop policy if exists "Users can view own profile" on "public"."users";
drop policy if exists "Users can update own profile" on "public"."users";
create policy "Admins have full access" on "public"."users" for all to authenticated using (public.is_admin());
create policy "Users can view own profile" on "public"."users" for select to authenticated using (id = auth.uid());
create policy "Users can update own profile" on "public"."users" for update to authenticated using (id = auth.uid());

-- PSYCHOLOGISTS
alter table "public"."psychologists" enable row level security;
drop policy if exists "Admins have full access" on "public"."psychologists";
drop policy if exists "Public can view psychologists" on "public"."psychologists";
drop policy if exists "Psychologists can update own profile" on "public"."psychologists";
create policy "Admins have full access" on "public"."psychologists" for all to authenticated using (public.is_admin());
create policy "Public can view psychologists" on "public"."psychologists" for select to public using (true);
create policy "Psychologists can update own profile" on "public"."psychologists" for update to authenticated using (user_id = auth.uid());

-- APPOINTMENTS
alter table "public"."appointments" enable row level security;
drop policy if exists "Admins have full access" on "public"."appointments";
drop policy if exists "Patients can manage own appointments" on "public"."appointments";
drop policy if exists "Psychologists can view and update own appointments" on "public"."appointments";
create policy "Admins have full access" on "public"."appointments" for all to authenticated using (public.is_admin());
create policy "Patients can manage own appointments" on "public"."appointments" for all to authenticated using (patient_id = auth.uid());
create policy "Psychologists can view and update own appointments" on "public"."appointments" for all to authenticated using (public.is_own_psychologist(psychologist_id));

-- SUPPORT TICKETS
alter table "public"."support_tickets" enable row level security;
drop policy if exists "Admins have full access" on "public"."support_tickets";
drop policy if exists "Users can manage own tickets" on "public"."support_tickets";
create policy "Admins have full access" on "public"."support_tickets" for all to authenticated using (public.is_admin());
create policy "Users can manage own tickets" on "public"."support_tickets" for all to authenticated using (user_id = auth.uid());

-- COACH APPLICATIONS
alter table "public"."coach_applications" enable row level security;
drop policy if exists "Admins have full access" on "public"."coach_applications";
drop policy if exists "Users can view and create own applications" on "public"."coach_applications";
create policy "Admins have full access" on "public"."coach_applications" for all to authenticated using (public.is_admin());
create policy "Users can view and create own applications" on "public"."coach_applications" for all to authenticated using (user_id = auth.uid());

-- WITHDRAWALS
alter table "public"."withdrawals" enable row level security;
drop policy if exists "Admins have full access" on "public"."withdrawals";
drop policy if exists "Psychologists can view and create own withdrawals" on "public"."withdrawals";
create policy "Admins have full access" on "public"."withdrawals" for all to authenticated using (public.is_admin());
create policy "Psychologists can view and create own withdrawals" on "public"."withdrawals" for all to authenticated using (public.is_own_psychologist(psychologist_id));

-- AVAILABILITY SLOTS
alter table "public"."availability_slots" enable row level security;
drop policy if exists "Admins have full access" on "public"."availability_slots";
drop policy if exists "Public can view slots" on "public"."availability_slots";
drop policy if exists "Psychologists can manage own slots" on "public"."availability_slots";
create policy "Admins have full access" on "public"."availability_slots" for all to authenticated using (public.is_admin());
create policy "Public can view slots" on "public"."availability_slots" for select to public using (true);
create policy "Psychologists can manage own slots" on "public"."availability_slots" for all to authenticated using (public.is_own_psychologist(psychologist_id));

-- SESSION FILES
alter table "public"."session_files" enable row level security;
drop policy if exists "Admins have full access" on "public"."session_files";
drop policy if exists "Uploader can manage own files" on "public"."session_files";
drop policy if exists "Participants can view session files" on "public"."session_files";
create policy "Admins have full access" on "public"."session_files" for all to authenticated using (public.is_admin());
create policy "Uploader can manage own files" on "public"."session_files" for all to authenticated using (uploader_id = auth.uid());
create policy "Participants can view session files" on "public"."session_files" for select to authenticated using (
  exists (
    select 1 from public.appointments 
    where id = session_files.appointment_id 
    and (patient_id = auth.uid() or public.is_own_psychologist(psychologist_id))
  )
);

-- DISCOUNT CODES
alter table "public"."discount_codes" enable row level security;
drop policy if exists "Admins have full access" on "public"."discount_codes";
drop policy if exists "Anyone can view active discount codes" on "public"."discount_codes";
create policy "Admins have full access" on "public"."discount_codes" for all to authenticated using (public.is_admin());
create policy "Anyone can view active discount codes" on "public"."discount_codes" for select to public using (active = true);
