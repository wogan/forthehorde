alter table public.guilds
    alter column member_count drop not null,
    alter column achievement_points drop not null;