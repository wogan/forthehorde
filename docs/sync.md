# Account Syncing

An overview of how we fetch and update Blizzard account data and associated WoW characters.

## Authentication

The site uses Supabase Auth's custom OAuth2 provider (`custom:blizzard-oauth2`) to sign users in with Battle.net. Supabase obtains the identity from Blizzard's userinfo endpoint instead of validating an OIDC ID token: Blizzard's signing keys are not encoded in the Base64URL format required by Supabase's OIDC verifier. The callback uses the Supabase UUID as `profiles.id` and stores the Blizzard account identity in the server-only profile row.

The previous `custom:blizzard` OIDC provider is not replaced or deleted: changing provider identifiers can create distinct Supabase identities for existing users. Account migration must be planned before switching an existing deployment.

Configure these environment variables for the app:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it to browser code)
- `BATTLE_NET_CLIENT_ID`
- `BATTLE_NET_CLIENT_SECRET`
- `TRIGGER_SECRET_KEY`

For local development, copy `.env.example` to `.env` or `.env.local`, then fill in the API URL, publishable key, and secret/service-role key printed by `supabase status`, along with the Battle.net and Trigger credentials. Register the Supabase Auth callback with the Battle.net OAuth client:

- Local: `http://127.0.0.1:54321/auth/v1/callback`
- Hosted: `https://<project-ref>.supabase.co/auth/v1/callback`

Set the Supabase Auth Site URL to the app origin and allow the app callback URL (`http://localhost:5173/auth/callback` locally). After setting the local env vars and Battle.net credentials, run `npm run supabase:configure-auth` to create or update the local custom provider. The script does not print credentials. For production, create a custom OAuth2 provider with identifier `custom:blizzard-oauth2`, authorization URL `https://oauth.battle.net/authorize`, token URL `https://oauth.battle.net/token`, and userinfo URL `https://oauth.battle.net/userinfo`; enable PKCE and optional email, and request `openid` and `wow.profile`.

## Data sync

A user logs into the website via Battle.net OAuth, and we get an access token with the `openid` and `wow.profile` scopes.
The callback upserts the user's `profiles` row. If the last successful account sync was within the past hour, it redirects directly to `/warband`; otherwise it redirects to `/sync`. The sync page starts the account task and waits for it to finish before redirecting to `/warband`, which reads the saved data from Supabase. The task upserts characters, extended/protected data, media, professions, guilds, and sync state with the Supabase user UUID.

## Local Supabase

The local Supabase stack requires Docker and the Supabase CLI.

- `supabase start` starts the local services and applies pending migrations.
- `supabase status` prints local service URLs and development keys.
- Supabase Studio is available at `http://127.0.0.1:54323`; the API is at `http://127.0.0.1:54321`.
- `supabase stop` stops the services while retaining local database data.
- `supabase db reset` drops and recreates the local database, reapplies migrations, and runs `supabase/seed.sql`.

The initial migration snapshots `schema/schema.sql`; migrations are the source of truth for subsequent database changes. Create each change with `supabase migration new <description>` and treat applied migrations as immutable.

## Production deployment

On pushes to `main`, GitHub Actions validates the app, applies pending production migrations, deploys Trigger.dev tasks, then builds and deploys to Vercel. The Vercel Git integration is disabled for `main` by `vercel.json`; other branches can still produce previews. Keep automatic production deployments disabled in any Trigger.dev Git integration as well.

Configure these repository secrets under **Settings > Secrets and variables > Actions**:

- `SUPABASE_ACCESS_TOKEN`: a Supabase personal access token scoped to the production project, with read access to Project Settings, API Keys, and API Key Secrets.
- `SUPABASE_DB_PASSWORD`: the production project's database password.
- `SUPABASE_PROJECT_ID`: the project reference from its Supabase dashboard URL.
- `TRIGGER_ACCESS_TOKEN`: a Trigger.dev production deployment API key, distinct from the app's `TRIGGER_SECRET_KEY`.
- `VERCEL_TOKEN`: a Vercel access token with deployment access to this project.
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: the Vercel account/team and project IDs.

Set the production application variables listed above in Vercel, and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BATTLE_NET_CLIENT_ID`, and `BATTLE_NET_CLIENT_SECRET` in the Trigger.dev production environment. CI and Trigger.dev use Node 26; configure Vercel to use Node 26 as well. Keep `package-lock.json` up to date for reproducible installs and Trigger.dev deployments. The pinned `trigger.dev` CLI and `@trigger.dev/sdk` versions must match; Dependabot groups their version updates for review.

The first run expects a new project without conflicting application tables. Later migrations and task changes must be compatible with the currently deployed application, which remains live during deployment. A Vercel rollback does not revert database migrations or Trigger.dev deployments.

Character and guild data is read from Supabase after the sync task finishes. Guild member counts and achievement points remain nullable because the character profile endpoint does not provide those values.

If Blizzard returns 404 for a character's profile, protected data, media, or professions, the sync saves the basic character from the account profile, keeps any previously saved details, and records the unavailable resource. Other Blizzard or database errors still fail the sync.
