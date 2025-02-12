import type { ApiEntityResponse, ApiIndex, DefinedType, Entity, GenderString } from "../model";

export type TitleIndex = ApiIndex<'titles'>

export interface Title extends ApiEntityResponse {
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
