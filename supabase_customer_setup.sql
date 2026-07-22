-- Create a table for public customer profiles
create table public.customer_profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  phone text,
  gov_address text,
  
  primary key (id)
);

-- Turn on Row Level Security
alter table public.customer_profiles enable row level security;

-- Policies

-- 1. Users can view ONLY their own profile.
create policy "Users can view own profile"
  on public.customer_profiles for select
  to authenticated
  using ( auth.uid() = id );

-- 2. Users can insert their own profile.
create policy "Users can insert own profile"
  on public.customer_profiles for insert
  to authenticated
  with check ( auth.uid() = id );

-- 3. Users can update their own profile.
create policy "Users can update own profile"
  on public.customer_profiles for update
  to authenticated
  using ( auth.uid() = id )
  with check ( auth.uid() = id );
