import type { ApiIndex, ApiResponse, Asset, DefinedType, Entity, GenderString, Media, SpellTooltip } from "../model"

export type PlayableSpecializationIndex = ApiIndex<'character_specializations' | 'pet_specializations'>
export type PlayableSpecializationMedia = Media<'icon'>

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

