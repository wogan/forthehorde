import type { ApiEntityResponse, ApiIndex, Entity, Faction, GenderString } from "../model";

export type PlayableRaceIndex = ApiIndex<'races'>

export interface PlayableRace extends ApiEntityResponse {
    gender_name: GenderString
    faction: Faction
    is_selectable: boolean
    is_allied_race: boolean
    playable_classes: Entity[]
}
