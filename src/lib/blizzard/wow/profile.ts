import type { Link, Entity, EntityWithSlug, ApiResponse, SpellTooltip, DefinedType } from "../model"

export interface Profile extends ApiResponse {
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

export type Gender = DefinedType<'MALE' | 'FEMALE'>

export type Faction = DefinedType<'HORDE' | 'ALLIANCE'>

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

export interface CharacterProfile extends ApiResponse {
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

export interface CharacterProfileProtected extends ApiResponse {
    _links: {
        self: Link
        user: Link
        profile: Link
    }
    id: number
    name: string
    money: number
    character: Entity & {
        realm: EntityWithSlug
    }
    protected_stats: {
        total_number_deaths: number
        total_gold_gained: 1664644810
        total_gold_lost: 1585296225
        total_item_value_gained: 339826078
        level_number_deaths: 13
        level_gold_gained: 910109970
        level_gold_lost: 1096460132
        level_item_value_gained: 146190446
    }
    position: Position
    bind_position: Position
    wow_account: number
}

export interface Position {
    zone: {
        name: string
        id: number
    }
    map: {
        name: string
        id: number
    }
    x: number
    y: number
    z: number
    facing: number
}


export interface SelectedTalent {
    id: number
    rank: number
    tooltip?: {
        talent: Entity
        spell_tooltip: SpellTooltip
    }
    default_points?: number
}

export interface CharacterSpecialization extends ApiResponse {
    specializations: {
        specialization: Entity
        pvp_talent_slots: {
            selected: {
                talent: Entity
                spell_tooltip: SpellTooltip
            }
            slot_number: number
        }[]
        loadouts: {
            is_active: boolean
            talent_loadout_code: string
            selected_class_talents: SelectedTalent[]
            selected_spec_talents: SelectedTalent[]
            selected_hero_talents: SelectedTalent[]
            selected_class_talent_tree: Omit<Entity, 'id'>
            selected_spec_talent_tree: Omit<Entity, 'id'>
            selected_hero_talent_tree: Entity
        }
    }[]
    active_specialization: Entity
    active_hero_talent_tree?: Entity
    character: Entity & {
        realm: EntityWithSlug
    }
}