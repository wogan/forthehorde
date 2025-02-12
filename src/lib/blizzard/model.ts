export type Locale = 'en_US' | 'es_MX' | 'pt_BR' | 'de_DE' |
    'en_GB' | 'es_ES' | 'fr_FR' | 'it_IT' |
    'ru_RU' | 'ko_KR' | 'zh_TW' | 'zh_CN'

export interface Link {
    href: string
}

export interface Entity {
    key: Link
    name: string
    id: number
}

export interface EntityWithSlug extends Entity {
    slug: string
}

export interface DefinedType<T extends string> {
    type: T
    name: string
}

export interface GenderString {
    male: string
    female: string
}

export interface ApiResponse<Links extends string = 'self'> {
    _links: {
        [link in Links]: Link
    }
}

export type ApiIndex<T extends string, E = Entity> = ApiResponse & {
    [key in T]: E[]
}

export interface ApiEntityResponse extends ApiResponse {
    id: number
    name :string
}

export type Media<T extends string> = ApiResponse & {
    id: number
    assets: Asset<T>[]
}

export interface SpellTooltip {
    spell: Entity
    description: string
    cast_time: string
    power_cost?: string
    range?: string
    cooldown?: string
}

export interface Asset<K extends string> {
    key: K
    value: string // url
    file_data_id: number
}

export type Faction = DefinedType<'HORDE' | 'ALLIANCE'>
