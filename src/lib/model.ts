import type { Character as BlizzardCharacter } from "./blizzard/wow/profile";

type Media = {
    main: string
    inset: string
    avatar: string
}

type Extra = { spec?: string, guild?: string }

export interface Character {
    name: string
    realm: string
    cls: string
    race: string
    level: number
    gender: string
    faction: string
    account: number
    extra: Promise<Extra>
    media: Promise<Media>
}

export function Character(c: BlizzardCharacter, account: number, extra: Promise<Extra>, media: Promise<Media>): Character {
    return {
        name: c.name,
        realm: c.realm.name,
        cls: c.playable_class.name,
        race: c.playable_race.name,
        level: c.level,
        gender: c.gender.name,
        faction: c.faction.name,
        account,
        extra,
        media
    }
}

export const slugify = (string: string): string => string.replaceAll(/\W/g, '').toLowerCase()
