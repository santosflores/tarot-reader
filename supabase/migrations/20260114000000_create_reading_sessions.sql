-- Create reading_sessions table
create table if not exists public.reading_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    elevenlabs_conversation_id text unique not null,
    started_at timestamptz not null,
    ended_at timestamptz not null,
    transcript jsonb not null default '{}'::jsonb,
    metadata jsonb default '{}'::jsonb,
    summary text,
    created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.reading_sessions enable row level security;

-- Policies
create policy "Users can view their own reading sessions"
    on public.reading_sessions
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own reading sessions"
    on public.reading_sessions
    for insert
    with check (auth.uid() = user_id);

-- Create index on user_id for faster lookups
create index if not exists reading_sessions_user_id_idx on public.reading_sessions(user_id);
