
export type Locale = 'en_US' | 'es_MX' | 'pt_BR' | 'de_DE' | 
                     'en_GB' | 'es_ES' | 'fr_FR' | 'it_IT' | 
                     'ru_RU' | 'ko_KR' | 'zh_TW' | 'zh_CN'

export type Localized = 'Localized'
export type AllLocales = 'AllLocales'
export type ApiVariation = Localized | AllLocales
export type LocalizedString<T extends ApiVariation> = T extends Localized ? string : Record<Locale, string>

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
