import type { ApiIndex, ApiResponse, DefinedType, Entity, EntityWithSlug, Link } from "../model";

export type RealmIndex = ApiIndex<'realms', EntityWithSlug>
export type RegionIndex = ApiIndex<'regions', Link>

export interface Realm extends ApiResponse {
    id: number
    name: string
    slug: string
    region: Entity
    connected_realm: Link
    category: string
    locale: string
    timezone: string
    type: DefinedType<'NORMAL'>
    is_tournament: boolean
}

export interface Region extends ApiResponse {
    id: number
    name: string
    tag: string
    patch_string: string
}
