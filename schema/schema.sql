
CREATE TABLE user (
    id bigint not null primary key, -- battle net id
    name text not null unique,
    battle_tag text not null,
    locale text not null,
    created timestamp not null,
    last_login timestamp not null
);

create table guild (
    id bigint not null primary key, -- battle net id
    name text not null,
    realm text not null,
    member_count int not null,
    achievement_points int not null,
    crest_emblem_id int null,
    crest_emblem_color color null,
)

create table character ( -- /profile/user/wow
    id bigint not null primary key, -- battle net
    user_id bigint not null references user,
    name text not null,
    realm text not null,
    class text not null,
    race text not null,
    gender text not null,
    faction text not null,
    level int not null,

    last_modified timestamp not null -- from blizzard response headers
);

create table character_extended ( --
    character_id not null primary key references character,

    active_spec text null,
    guild text null,
    experience int not null,
    achievement_points int not null,
    item_level int not null, -- equipped item level
    title text null,
    last_login timestamp not null

    last_modified timestamp not null -- from blizzard response headers
);

create table character_protected ( -- /profile/user/wow/protected-character/{realmId}-{characterId}
    character_id not null primary key references character,
    money bigint not null,
    deaths int not null,
    location_zone text not null,
    location_map text not null,
    hearth_zone text not null,
    hearth_map text not null,


    last_modified timestamp not null -- from blizzard response headers
);

create table character_media ( -- /profile/wow/character/{realmSlug}/{characterName}/character-media
    character_id not null primary key references character,
    avatar text not null,
    inset text not null,
    main_raw text not null,

    last_modified timestamp not null, -- from blizzard response headers
);

create table character_professions ( -- /profile/wow/character/{realmSlug}/{characterName}/professions
    character_id not null primary key references character,
    primary_one text null,
    primary_two text null,
    archaeology int null, -- no tiers?
    cooking int null, -- tiers? recipes known?
    fishing int null, -- tiers?





    last_modified timestamp not null, -- from blizzard response headers
)