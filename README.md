<div align="center">
  <img src="public/branding/indian-diaspora-transparent.png" alt="The Indian Diaspora logo" width="140" />

  <h1>The Indian Diaspora</h1>
  <p><strong>Across borders. Never alone.</strong></p>
  <p>Connecting Indian and Hindu communities through shared experiences,<br />community support, and solidarity against racism.</p>

  <a href="https://discord.gg/rGpPfeTzp">Join our Discord</a>
</div>

---

## About

The Indian Diaspora is a community platform connecting people across the United States, United Kingdom, Canada, Australia, New Zealand, Europe, and India.

The project begins with a shared belief: what happens to one of us should matter to all of us. It welcomes stories of kindness and belonging alongside experiences of discrimination, racism, and anti-Hindu hate.

**Status:** working local application with private MongoDB submissions. Community directories, an editorial review interface, and public story publishing are not implemented yet. The platform does not claim to represent every Indian or Hindu voice.

## Features

- **Interactive diaspora graphic:** animated connections between India and six diaspora regions, with selectable community panels.
- **Discord community:** direct invitations throughout the site.
- **Community voices:** a three-step experience for location, recording and transcript editing, and publication preferences.
- **Voice recording:** microphone capture, playback, re-recording, deletion, and private audio download.
- **Editable transcripts:** optional browser speech recognition displays text beside the recorder; contributors can correct it or add context before submitting.
- **Private submissions:** location, final journal entry, optional recording, and permission are saved together in MongoDB for review.
- **Submission receipts:** a receipt appears after a successful save; retrying the same submission ID does not create another record.
- **Responsive design:** layouts for mobile and desktop, with reduced-motion support for the connection animation.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 6, CSS, Lucide icons |
| Recording | Browser MediaRecorder API |
| Live transcription | Browser SpeechRecognition API, when available |
| Backend | Node.js HTTP server and Vite development middleware |
| Database | MongoDB using the official Node.js driver |
| Tests | Node.js built-in test runner |

## Get started

### Prerequisites

- Node.js **20.19 or newer** and npm. Node.js 22 is used for local development.
- A MongoDB instance reachable from your server, with credentials permitted to insert records and create an expiry index.
- Microphone permission for recording. Remote deployments need HTTPS; localhost works for development.

### 1. Install

```bash
git clone https://github.com/Dibyendu-13/IndianDiaspora.git
cd IndianDiaspora
npm install
```

### 2. Configure the environment

Create a `.env` file in the project root:

```dotenv
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DATABASE=indian_diaspora
PORT=3000
```

Replace the example URL with your MongoDB connection string. `.env` is ignored by Git. Keep database credentials server-side and never give them a `VITE_` prefix.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URL` | Yes, for submissions | MongoDB connection string |
| `MONGODB_DATABASE` | No | Database name; defaults to `indian_diaspora` |
| `PORT` | No | Production Node server port; defaults to `3000` |

### 3. Start development

```bash
npm run dev
```

Open the local URL printed by Vite, usually **http://localhost:5173**. The same development server handles `/api/submissions`. Restart it after changing backend configuration or environment variables.

The homepage works without MongoDB, but submissions require a working database connection.

## Community voices: how it works

1. **Location:** choose a country, enter a city, and describe the type of experience. No name is requested.
2. **Story and transcript:** record your experience and optionally enable live transcription. Edit the transcript or write additional details in the same journal field. Text-only stories are supported too.
3. **Permission and submission:** choose private review or permission for anonymous written publication after review, confirm consent, and submit privately.

A successful submission saves the entry with `pending_review` status and returns a receipt. **Neither permission option publishes a story automatically.**

### Transcription support

Live transcription is optional, currently configured for English, and depends on the browser's speech recognition support. The browser provider may process audio when transcription is enabled; the form explains this before opt-in.

When recognition is unavailable or fails, audio recording and manual journal editing remain available. There is no server-side transcription service or automatic transcription of uploaded recordings.

Re-recording replaces the audio but preserves the editable text. Contributors should check that their final entry matches what they want to share.

## Privacy and review

**Anonymous publication is different from complete anonymity.** A voice, location, or story detail can identify someone.

- Draft text and recordings remain in page memory until submission or download; refreshing clears the unsubmitted session.
- Submissions store city, country, experience category, final entry, permission, consent version, timestamps, and optional audio.
- The application does not add names, contact details, or IP addresses to submission records. Hosting and database infrastructure may keep their own logs.
- Audio is stored privately with the submission and is never authorized for public publication by this flow.
- All accounts are initially marked unverified and pending review.
- A MongoDB TTL index expires the whole submission after **30 days**. Cleanup is asynchronous; database backups have their own retention settings.
- There is no public endpoint for reading or listing submissions.
- Downloaded files remain on the contributor's device until deleted.

Before public publication, an editorial review process must remove identifying details and distinguish personal accounts from independently verified reporting.

## API

### `POST /api/submissions`

Accepts a JSON body with:

| Field | Description |
| --- | --- |
| `submissionId` | UUID v4 generated for the submission; reused on retries |
| `city`, `country` | Non-empty location strings, up to 100 characters each |
| `experience` | One of the categories offered by the form |
| `entry` | Final edited journal entry, 20–12,000 characters |
| `publicationPreference` | `private` or `anonymous` |
| `consent` | Must be `true` |
| `audio` | Optional object containing `base64` and `mimeType` |

Audio is limited to **8 MB**; total request size is limited to **12 MB**. Supported MIME types are WebM, Ogg, MP4, and WAV audio.

The server validates input, rejects mismatched browser origins, and assigns review status and expiry itself. Database failures return a retryable error without exposing connection details.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend and submission API for development |
| `npm run build` | Generate frontend production assets in `dist/` |
| `npm start` | Serve the built frontend and submission API with Node.js |
| `npm run preview` | Preview frontend build only; does **not** provide the submission API |
| `npm test` | Run validation and HTTP API tests with injected test storage |

Tests do not upload stories to your MongoDB database.

## Production

```bash
npm run build
npm start
```

The Node server listens on **127.0.0.1:3000** by default. Put it behind an HTTPS reverse proxy, or adapt its listening address to your hosting platform's requirements. Supply environment variables through your hosting provider's secret configuration.

**Static hosting alone is insufficient:** the submission endpoint requires a Node.js runtime with access to MongoDB.

Before opening submissions publicly, add abuse controls and rate limiting, establish authenticated reviewer access and deletion procedures, and review infrastructure logging and backup retention. The current implementation has no moderation dashboard, public publishing pipeline, user authentication, or automated content verification.

## Project structure

```text
IndianDiaspora/
├── public/branding/          # Logo assets
├── src/
│   ├── main.jsx             # Homepage, animated network, Discord CTAs
│   ├── CommunityVoices.jsx   # Recording, transcript editing, submissions
│   └── style.css            # Responsive styles
├── server/
│   ├── index.js             # Production HTTP server
│   ├── submissions.js       # Validation, MongoDB storage, API handler
│   └── submissions.test.js  # Validation and endpoint tests
├── index.html
├── vite.config.js           # Development API integration
└── package.json
```

## Community

[Join the Discord community](https://discord.gg/rGpPfeTzp) to connect and discuss the project. Treat contributors with respect and keep private recordings, identifying information, and sensitive accounts out of public channels.
