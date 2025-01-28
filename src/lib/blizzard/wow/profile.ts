import type { Link, Entity, EntityWithSlug } from "../model"

export interface Profile {
    _links: {
        self: Link
        user: Link
        profile: Link
    }
    id: number
    wow_accounts: WowAccount[]
    collections: Link
}

export interface WowAccount {
    id: number
    characters: Character[]
}

export interface Gender {
    type: 'MALE' | 'FEMALE'
    name: string
}

export interface Faction {
    type: 'HORDE' | 'ALLIANCE'
    name: 'Horde'
}

export interface Character {
    character: Link,
    protected_character: Link
    name: string
    id: number
    realm: EntityWithSlug
    playable_class: Entity
    playable_race: Entity
    gender: Gender
    faction: Faction
    level: number
}


export interface Guild extends Entity {
    realm: EntityWithSlug
    faction: Faction
}

export interface CharacterProfile {
    _links: {
        self: Link
    }
    id: number
    name: string
    gender: Gender
    faction: Faction
    race: Entity
    character_class: Entity
    active_spec?: Entity | null
    realm: EntityWithSlug
    guild?: Guild | null
    level: number
    experience: number
    achievement_points: number
    achievements: Link
    titles: Link
    pvp_summary: Link
    encounters: Link
    media: Link
    last_login_timestamp: number
    average_item_level: number
    equipped_item_level: number
    specializations: Link
    statistics: Link
    mythic_keystone_profile: Link
    equipment: Link
    appearance: Link
    collections: Link
    active_title?: {
        key: Link
        name: string
        id: number
        display_string: string
    } | null
    reputations: Link
    quests: Link
    achievements_statistics: Link
    professions: Link
    name_search: string
}
