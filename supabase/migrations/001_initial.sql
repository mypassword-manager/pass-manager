-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Vault entries table for encrypted user data
create table public.vault_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('personal', 'login')),
  encrypted_payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.vault_entries enable row level security;

-- RLS Policies: Users can only CRUD their own vault entries
create policy "Users can view their own vault entries"
  on public.vault_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vault entries"
  on public.vault_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vault entries"
  on public.vault_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own vault entries"
  on public.vault_entries for delete
  using (auth.uid() = user_id);
