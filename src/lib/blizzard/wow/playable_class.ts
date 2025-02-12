import type { Link, Entity, ApiResponse, Asset, GenderString, ApiIndex, Media, ApiEntityResponse } from "../model"

export type PlayableClassIndex = ApiIndex<'classes'>
export type PlayableClassMedia = Media<'icon'>
export type PvpTalentSlots = ApiIndex<'talent_slots', { slot_number: number, unlock_player_level: number }>

export interface PlayableClass extends ApiEntityResponse {
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
