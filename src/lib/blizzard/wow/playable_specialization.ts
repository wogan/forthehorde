import type { Entity, Link } from "../model"

export interface PlayableSpecializationIndex {
    _links: {
        self: Link
    }
    character_specializations: Entity[]
    pet_specializations: Entity[]
}
