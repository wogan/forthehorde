interface Link {
    href: string
}

interface Profile {
    _links: {
        self: Link
        user: Link
        profile: Link
    }
    id: number
    wow_accounts: WowAccount[]
    collections: Link
}

interface WowAccount {
    id: number
    characters: Character[]
}

interface Character {

}