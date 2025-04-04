import { wow } from 'blizzard.js'
import { slugify } from '../src/lib/model'
import type { PlayableClassMedia, PlayableClassIndex } from '../src/lib/blizzard/wow/playable_class'

/*
At the moment this script just gets the official icon url for each class and prints the result
as a JSON document - slugifying the `name` to use as the key.

In the future, we should actually download the icons and save it to the `static` folder.
In addition, we should download the blizzard class names (`gender_name`) and save to our l10n
bundle for each supported locale.
*/


const CLIENT_ID = process.env.BATTLE_NET_CLIENT_ID
const CLIENT_SECRET = process.env.BATTLE_NET_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing BATTLE_NET_CLIENT_ID or BATTLE_NET_CLIENT_SECRET environment variables');
    process.exit(1);
}

const wowClient = await wow.createInstance({
    key: CLIENT_ID,
    secret: CLIENT_SECRET,
    origin: 'us',
    locale: 'en_US'
});

interface ClassData {
    slug: string
    name: string
    id: number
    icon: string
}

async function callApi() {
    try {
        const response = await wowClient.playableClass<PlayableClassIndex>();
        const result: Record<string, string> = {}
        for (let cls of response.data.classes) {
            const media = await wowClient.playableClass<PlayableClassMedia>({ id: cls.id, media: true })
            result[slugify(cls.name)] = media.data.assets.find(a => a.key == 'icon')?.value!!
        }
        console.log(JSON.stringify(result, null, 2))
    } catch (error) {
        console.error('Error calling API:', error);
    }
}

callApi();