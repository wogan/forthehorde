import type { ApiIndex, ApiResponse, DefinedType, Entity, GenderString } from "../model";

export type TitleIndex = ApiIndex<'titles'>

export interface Title extends ApiResponse {
    id: number
    name: string
    // gender_name includes the {name} template
    gender_name: GenderString
    source?: Source
}

type Source = {
    type: DefinedType<'ACHIEVEMENT'>
    achievements: Entity[]
} | {
    type: DefinedType<'QUEST'>
    quests: Entity[]
}
