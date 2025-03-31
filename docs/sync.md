# Account Syncing

An overview of how we fetch and update Blizzard account data and associated WoW characters.

## Prequisites

A user logs into the website via Battle.net OAuth, and we get an access token with the `openid` and `wow.profile` scopes.


### scratch
* set up supabase db
* connect trigger db to supabase
* task to sync an account
* change login to trigger task
* change load scripts to load from db
* make sync task message client so it reloads from db?
