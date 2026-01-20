-- SQL para crear la tabla de usuarios en Supabase
-- Copia y pega esto en el SQL Editor de tu Dashboard de Supabase

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security
alter table public.users enable row level security;

-- Política para permitir acceso total en desarrollo (ajustar en producción)
create policy "Allow public access for development" on public.users
  for all using (true) with check (true);
