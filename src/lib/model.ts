import type { Character as BlizzardCharacter } from "./blizzard/wow/profile";

export interface Character {
    name: string;
    realm: string;
    cls: string;
    race: string;
    level: number;
    gender: string;
    faction: string;
    spec?: string;
    guild?: string;
}

export function Character(c: BlizzardCharacter): Character {
    return {
        name: c.name,
        realm: c.realm.name,
        cls: c.playable_class.name,
        race: c.playable_race.name,
        level: c.level,
        gender: c.gender.name,
        faction: c.faction.name,
    }
}