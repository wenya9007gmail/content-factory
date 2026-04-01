create extension if not exists "pgcrypto";

create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  tagline text,
  bio text,
  tone jsonb not null default '{}'::jsonb,
  target_platforms text[] not null default '{}',
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid references personas(id) on delete cascade,
  platform text not null,
  handle text not null,
  auth jsonb not null default '{}'::jsonb,
  daily_limit integer not null default 10,
  status text not null default 'active',
  created_at timestamptz default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid references personas(id) on delete cascade,
  source text not null,
  title text not null,
  brief text,
  priority int default 0,
  status text default 'queued',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid references personas(id),
  account_id uuid references accounts(id),
  platform text not null,
  topic_id uuid references topics(id),
  current_step int default 1,
  steps jsonb not null,
  status text not null default 'pending',
  cost_estimate_cents int default 0,
  cost_actual_cents int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists contents (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  structure jsonb not null,
  rendered text,
  media jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists cost_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  provider text not null,
  model text not null,
  tokens int default 0,
  amount_cents int not null,
  occurred_at timestamptz default now()
);

create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  platform text not null,
  impressions int default 0,
  clicks int default 0,
  interactions jsonb default '{}'::jsonb,
  collected_at timestamptz default now()
);

create table if not exists monetization_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id),
  event_type text not null,
  amount_cents int default 0,
  payload jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);
