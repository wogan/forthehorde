create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    public_id uuid not null unique default gen_random_uuid(),
    blizzard_account_id text not null unique,
    display_name text,
    battle_tag text not null,
    locale text not null,
    created_at timestamptz not null default now(),
    last_login_at timestamptz not null default now(),
    unique (id, public_id)
);

create table public.guilds (
    id uuid primary key default gen_random_uuid(),
    region text not null,
    realm_id bigint not null,
    blizzard_guild_id bigint not null,
    name text not null,
    realm text not null,
    member_count integer not null check (member_count >= 0),
    achievement_points integer not null check (achievement_points >= 0),
    crest_emblem_id integer,
    crest_emblem_color jsonb,
    unique (region, realm_id, blizzard_guild_id)
);

create table public.characters (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    public_profile_id uuid not null,
    blizzard_character_id bigint not null,
    region text not null,
    realm_id bigint not null,
    name text not null,
    realm text not null,
    class text not null,
    race text not null,
    gender text not null,
    faction text not null,
    level integer not null check (level >= 0),
    foreign key (user_id, public_profile_id)
        references public.profiles (id, public_id) on delete cascade,
    unique (user_id, region, realm_id, blizzard_character_id)
);

create index characters_user_id_idx on public.characters (user_id);

create table public.character_extended (
    character_id uuid primary key references public.characters (id) on delete cascade,
    active_spec text,
    guild_id uuid references public.guilds (id) on delete set null,
    experience integer not null,
    achievement_points integer not null,
    item_level integer not null,
    title text,
    last_login_at timestamptz
);

create table public.character_protected (
    character_id uuid primary key references public.characters (id) on delete cascade,
    money bigint not null,
    deaths integer not null,
    location_zone text not null,
    location_map text not null,
    hearth_zone text not null,
    hearth_map text not null
);

create table public.character_media (
    character_id uuid primary key references public.characters (id) on delete cascade,
    avatar text not null,
    inset text not null,
    main_raw text not null
);

create table public.character_professions (
    character_id uuid primary key references public.characters (id) on delete cascade,
    primary_one text,
    primary_two text
);

create table public.user_sync_state (
    user_id uuid not null references public.profiles (id) on delete cascade,
    resource text not null,
    last_attempt_at timestamptz,
    last_successful_sync_at timestamptz,
    etag text,
    source_last_modified_at timestamptz,
    last_error text,
    primary key (user_id, resource)
);

create table public.character_sync_state (
    character_id uuid not null references public.characters (id) on delete cascade,
    resource text not null,
    last_attempt_at timestamptz,
    last_successful_sync_at timestamptz,
    etag text,
    source_last_modified_at timestamptz,
    last_error text,
    primary key (character_id, resource)
);

alter table public.profiles enable row level security;
alter table public.guilds enable row level security;
alter table public.characters enable row level security;
alter table public.character_extended enable row level security;
alter table public.character_protected enable row level security;
alter table public.character_media enable row level security;
alter table public.character_professions enable row level security;
alter table public.user_sync_state enable row level security;
alter table public.character_sync_state enable row level security;

create policy "Profiles are publicly readable"
    on public.profiles for select to anon, authenticated
    using (true);

create policy "Characters are publicly readable"
    on public.characters for select to anon, authenticated
    using (true);

create policy "Guilds are publicly readable"
    on public.guilds for select to anon, authenticated
    using (true);

create policy "Extended character data is publicly readable"
    on public.character_extended for select to anon, authenticated
    using (true);

create policy "Protected character data is publicly readable"
    on public.character_protected for select to anon, authenticated
    using (true);

create policy "Character media is publicly readable"
    on public.character_media for select to anon, authenticated
    using (true);

create policy "Character professions are publicly readable"
    on public.character_professions for select to anon, authenticated
    using (true);

revoke all on table
    public.profiles,
    public.guilds,
    public.characters,
    public.character_extended,
    public.character_protected,
    public.character_media,
    public.character_professions,
    public.user_sync_state,
    public.character_sync_state
from anon, authenticated;

grant select (public_id, display_name)
    on public.profiles to anon, authenticated;

grant select (
    id,
    public_profile_id,
    blizzard_character_id,
    region,
    realm_id,
    name,
    realm,
    class,
    race,
    gender,
    faction,
    level
) on public.characters to anon, authenticated;

grant select on table
    public.guilds,
    public.character_extended,
    public.character_protected,
    public.character_media,
    public.character_professions
to anon, authenticated;