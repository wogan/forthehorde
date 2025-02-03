import type { ApiResponse, Asset, DefinedType, Entity, GenderString, SpellTooltip } from "../model"

export interface PlayableSpecializationIndex extends ApiResponse {
    character_specializations: Entity[]
    pet_specializations: Entity[]
}

export interface PlayableSpecialization extends ApiResponse {
    id: number
    playable_class: Entity
    name: string
    gender_description: GenderString
    media: Entity
    role: DefinedType<'DAMAGE' | 'TANK' | 'HEALER'>
    pvp_talents: {
        talent: Entity
        spell_tooltip: SpellTooltip
    }[]
    spec_talent_tree: Omit<Entity, 'id'>
    power_type: Entity
    primary_stat_type: DefinedType<'INTELLECT' | 'STRENGTH' | 'AGILITY'>
    hero_talent_trees: Entity[]
}

export interface PlayableSpecializationMedia extends ApiResponse {
    assets: Asset<'icon'>[]
    id: number
}