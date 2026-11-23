# forthehorde

World of Warcraft related website

## Development

Use the Node version in `.nvmrc` and install dependencies with `npm ci`.

Start a development server (runs the app and the trigger.dev local worker concurrently):

```bash
npm run dev

# or start just the app server and open it in a new browser tab
npm run dev:app -- --open
```

Create a production build:

```bash
npm run build
```

Preview the production build with `npm run preview`.
