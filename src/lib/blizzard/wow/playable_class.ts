import type { Link, Entity, ApiResponse, Asset, GenderString } from "../model"

export interface PlayableClassesIndex extends ApiResponse {
    classes: Entity[]
}

export interface PlayableClass extends ApiResponse {
    id: number
    name: string
    gender_name: GenderString
    power_type: Entity
    specializations: Entity[]
    media: {
        id: number
        key: Link
    }
    pvp_talent_slots: Link
    playable_races: Entity[]
    additional_power_types?: Entity[]
}



export interface PlayableClassMedia extends ApiResponse {
    id: number
    assets: Asset[]
}

export interface PvpTalentSlots extends ApiResponse {
    talent_slots: {
        slot_number: number
        unlock_player_level: number
    }[]
}
