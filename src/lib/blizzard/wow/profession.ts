import type { ApiEntityResponse, ApiIndex, ApiResponse, Asset, DefinedType, Entity, Link, Media } from "../model";

export type ProfessionIndex = ApiIndex<'professions'>
export type ProfessionMedia = Media<'icon'>
export type RecipeMedia = Media<'icon'>

export interface Profession extends ApiEntityResponse {
    description: string
    type: DefinedType<'PRIMARY' | 'SECONDARY'>
    media: Omit<Entity, 'name'>
    skill_tiers?: Entity[]
    minimum_skill_level?: number
    maximum_skill_level?: number
}

export interface ProfessionSkillTier extends ApiEntityResponse {
    minimum_skill_level: number
    maximum_skill_level: number
    categories: {
        name: string
        recipes: Entity[]
    }[]
}

export interface Recipe extends ApiEntityResponse {
    media: Omit<Entity, 'name'>
    crafted_item?: Entity
    reagents?: {
        reagent: Entity
        quantity: number
    }
    rank?: number
    crafted_quantity?: {
        value: number
    }
    modified_crafting_slots?: {
        slot_type: Entity
        display_order: number
    }
}
