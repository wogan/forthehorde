<script>
    /*

Flow:
-> Land on /auth page
-> If we already have an auth token, redirect to /warband
-> Check for query parameters: if not present, we are tring to log in
  -> Create state and put it into session storage
  -> Redirect to https://oauth.battle.net/authorize



client_id=BATTLE_NET_CLIENT_ID
scope=wow.profile
state=random blob
redirect_uri={hostname}/auth
response_type=code

// &scope=openid for access to https://oauth.battle.net/userinfo if we want to get emails etc


*/
</script>