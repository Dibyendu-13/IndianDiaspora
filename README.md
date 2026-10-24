# The Indian Diaspora

A responsive React + Vite editorial blog with category filters, story search, article dialogs, and a demo reading-list form.

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

Editorial stories are illustrative samples. The signup form is a client-side demonstration and does not send emails. Photography is loaded from Unsplash and fonts from Google Fonts.

## Private Community voices submissions

Set `MONGODB_URL` in `.env` (server-only). Optional `MONGODB_DATABASE` defaults to `indian_diaspora`. Never use a `VITE_` prefix for credentials. Restart Vite after adding the backend configuration.

`npm run dev` serves the UI and same-origin POST `/api/submissions`. For production: `npm run build` then `npm start` (Node server, port 3000 by default). Static hosting alone cannot run this API. Use HTTPS and authenticated operational access for database reviewers before public launch; there is intentionally no public read/list endpoint.

Each submission stores one pending-review record containing location, final edited entry, permission and optional audio (max 8 MB). Anonymous publication permission does not publish anything. MongoDB TTL expires the whole record after 30 days (cleanup is asynchronous). No name, IP, or contact details are added to the record. Database provider backups and access settings are configured separately. Receipt IDs support retry without duplicate writes.

Live browser transcription is optional and English-language; browser providers may process audio. The editable text is beside the recorder and remains editable during recording. Unsupported browsers can still record and type. No server transcription provider is configured.

Run `npm test` for validation and API tests (uses injected test storage; no real stories are sent to MongoDB).
# IndianDiaspora
