-- E2EE User Schema for Likes/Bookmarks Only
-- This provides encrypted user accounts without storing plaintext PII

-- 1) Users table (no plaintext PII)
create table if not exists public.e2ee_users (
  user_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  
  -- Login credentials (server can store safely)
  username text unique not null, -- unique identifier for login
  password_salt bytea not null,
  password_verifier bytea not null,
  password_verifier_nonce bytea not null,
  
  -- Encrypted profile (email, name, etc.)
  profile_cipher bytea not null,
  profile_nonce bytea not null,
  profile_aad text not null,
  
  -- Master key for decrypting user data
  master_key_cipher bytea not null,
  master_key_nonce bytea not null,
  
  -- KDF parameters
  kdf_params jsonb not null,
  version int not null default 1
);

-- 2) User likes and bookmarks (encrypted)
create table if not exists public.e2ee_user_data (
  record_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.e2ee_users(user_id) on delete cascade,
  type text not null check (type in ('like', 'bookmark')),
  target_id text not null, -- ID of the poem/poet being liked/bookmarked
  target_type text not null check (target_type in ('poem', 'poet', 'couplet')),
  
  -- Encrypted metadata (notes, tags, etc.)
  metadata_cipher bytea not null,
  metadata_nonce bytea not null,
  metadata_aad text not null,
  
  created_at timestamptz not null default now(),
  version int not null default 1
);

-- 3) Enable RLS
alter table public.e2ee_users enable row level security;
alter table public.e2ee_user_data enable row level security;

-- 4) RLS Policies
create policy "users own their data"
on public.e2ee_users
for all using (auth.jwt() ->> 'sub' = user_id::text)
with check (auth.jwt() ->> 'sub' = user_id::text);

create policy "users own their likes/bookmarks"
on public.e2ee_user_data
for all using (auth.jwt() ->> 'sub' = user_id::text)
with check (auth.jwt() ->> 'sub' = user_id::text);

-- 5) Indexes for performance
create index idx_e2ee_user_data_user_type on public.e2ee_user_data(user_id, type);
create index idx_e2ee_user_data_target on public.e2ee_user_data(target_type, target_id);
create index idx_e2ee_users_username on public.e2ee_users(username);

-- 6) Grant permissions (adjust based on your Supabase setup)
grant usage on schema public to anon, authenticated;
grant all on public.e2ee_users to anon, authenticated;
grant all on public.e2ee_user_data to anon, authenticated;
