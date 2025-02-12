import type { ApiEntityResponse, ApiIndex, DefinedType, Entity, EntityWithSlug, Link } from "../model";

export type RealmIndex = ApiIndex<'realms', EntityWithSlug>
export type RegionIndex = ApiIndex<'regions', Link>

export interface Realm extends ApiEntityResponse {
    slug: string
    region: Entity
    connected_realm: Link
    category: string
    locale: string
    timezone: string
    type: DefinedType<'NORMAL'>
    is_tournament: boolean
}

export interface Region extends ApiEntityResponse {
    tag: string
    patch_string: string
}
