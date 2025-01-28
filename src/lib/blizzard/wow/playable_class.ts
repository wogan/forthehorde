import type { Link, Entity } from "../model"

export interface PlayableClassesIndex {
    _links: {
        self: Link
    }
    classes: Entity[]
}

export interface PlayableClass {
    _links: {
        self: Link
    }
    id: number
    name: string
    gender_name: {
        male: string
        female: string
    }
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

export interface Asset {
    key: string
    value: string // url
    file_data_id: number
}

export interface PlayableClassMedia {
    _links: {
        self: Link
    }
    id: number
    assets: Asset[]
}

export interface PvpTalentSlots {
    _links: {
        self: Link
    }
    talent_slots: {
        slot_number: number
        unlock_player_level: number
    }[]

}