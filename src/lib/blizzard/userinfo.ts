// curl -X GET
//    'https://oauth.battle.net/userinfo'
//    -H 'Authorization: Bearer <access token>


export class UserInfo {

}

export async function userinfo(token: string): Promise<UserInfo> {
    return Promise.resolve(new UserInfo());
}
