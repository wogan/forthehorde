import type { Link, Entity, ApiResponse, Asset, GenderString, ApiIndex, Media } from "../model"

export type PlayableClassIndex = ApiIndex<'classes'>
export type PlayableClassMedia = Media<'icon'>

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

export interface PvpTalentSlots extends ApiResponse {
    talent_slots: {
        slot_number: number
        unlock_player_level: number
    }[]
}
