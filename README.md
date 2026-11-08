![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-4377cb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-B73BFE?logo=vite&logoColor=white)
![Nginx](https://img.shields.io/badge/NGINX-009639?logo=nginx&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=white)

# Stream-overlay - Spotify overlay for streamers

A streaming companion with a NestJS backend and a React frontend. It displays Spotify track information in an OBS browser source, records track changes during stream sessions, and accepts track requests through DonationAlerts. The dashboard provides session controls and links to the overlay and track history.

## Track requests

After a streamer connects DonationAlerts, the backend listens for donation events through Centrifugo. If a donation message contains an `open.spotify.com/track/...` link, it extracts the track ID, attempts to add the track to the streamer's Spotify queue, and broadcasts a request notification to the overlay.

The minimum donation amount check is currently disabled. A request notification is not proof that the track was queued: the backend logs queue errors but can still send the notification. Playback and queue access depend on the connected Spotify account and its API permissions.

## Features

### For streamers

- Spotify OAuth login and an application JWT stored in an HTTP-only cookie.
- A dashboard for starting and ending stream sessions.
- Spotify polling every three seconds, with track-change events sent through Socket.IO.
- An overlay showing album artwork, track title, and artists.
- Track history recorded when the track changes during an active session.
- DonationAlerts connection controls and track-request notifications.
- Copyable overlay and history URLs.

### For viewers

- A public, paginated track-history page for the active session, or the latest completed session if none is active.
- Track requests by including a Spotify track link in a DonationAlerts message.
- Request notifications displayed on the overlay for eight seconds when track information is available.

## Technologies

- Backend: TypeScript, NestJS 11 (Express), JWT, and Swagger.
- Frontend: React 19, Vite 8, React Router, and MobX.
- Real-time communication: Socket.IO and the Centrifuge client for DonationAlerts.
- Database: PostgreSQL 16 with Prisma 7.
- External services: Spotify Web API and DonationAlerts.
- Token storage: AES-256-GCM encryption for Spotify and DonationAlerts tokens.
- Containers: Docker Compose, Bun 1.3.14 build images, and Nginx for the frontend.

## Demo

No recorded application demo is included. After setup, open `/login` to access the dashboard, then use the overlay link in OBS as described below.

## Installation and setup

The steps below target local use on the same machine as the browser and OBS. Install Git, Bun 1.3.14, Docker, and Docker Compose first. You also need Spotify application credentials; DonationAlerts application credentials are needed for track requests.

These instructions have been checked against the repository configuration, but a clean installation and live OAuth flows have not been tested as part of this documentation update.

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/selli73/Stream-overlay.git
cd Stream-overlay

cd backend
bun install
cd ../frontend
bun install
cd ..
```

The frontend Dockerfile requires `frontend/bun.lock`, which is ignored by Git. Installing frontend dependencies creates it before the image is built. Run the following setup commands from the repository root.

### 2. Create the environment files

Copy the templates (use `Copy-Item` instead of `cp` in PowerShell if preferred):

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill the root `.env` with your PostgreSQL database name, username, and a strong password. In `backend/.env`, use the same values in the connection string:

```env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@db:5432/YOUR_DB_NAME?schema=public"
FRONTEND_URL="http://127.0.0.1"
REDIRECT_URI="http://127.0.0.1:3000/auth/callback"
REDIRECT_URI_DONATIONALERTS="http://127.0.0.1:3000/donation-alerts/callback"
```

Use `db`, the Compose service name, as the database hostname inside containers. A backend running directly on the host would use `127.0.0.1` instead. URL-encode special characters in connection-string credentials.

Fill in the OAuth client IDs, secrets, and scope strings for your registered applications. The redirect URIs must match the applications' registered callbacks and the addresses accepted by each provider. The callback paths above are the routes implemented by this backend; they are not a guarantee that a provider accepts every local HTTP configuration. Keep the frontend, login, and callback hostnames consistent so cookies are available to the application.

Set `ENCRYPTION_KEY` to a randomly generated 32-byte key encoded as 64 hexadecimal characters. Keep it private and stable: changing it makes existing encrypted tokens unreadable. Use a different value for the JWT secret in step 3.

The frontend template contains only a variable name. Replace its contents with a complete assignment:

```env
VITE_API_BACKEND_URL=http://127.0.0.1:3000
```

For the current Docker build, also create `frontend/.env.production` containing **only that public URL assignment**. `frontend/.dockerignore` excludes `.env`, while the Dockerfile copies `.env.production` into the build context. This supplies the DonationAlerts login URL during `vite build`; Compose's runtime `env_file` alone cannot change the already-built frontend. Never put secrets in a `VITE_` variable or this public build file. Rebuild the frontend after changing the URL.

### 3. Create the local configuration files

Two required backend files are ignored by Git and must be created after cloning.

Create `backend/src/user/user.constants.ts`:

```typescript
export const jwt = {
  secret: 'REPLACE_WITH_A_LONG_RANDOM_PRIVATE_SECRET',
};
```

Replace the placeholder before starting the backend. Do not commit this file.

Create `backend/src/socket/frontend.constant.ts` with the exact frontend origins allowed for HTTP and Socket.IO connections:

```typescript
export const frontendIp = 'http://127.0.0.1';
export const frontendUrl = 'http://localhost';
export const frontendIpNg = frontendIp;
export const frontendUrlNg = frontendUrl;
```

The last two exports can remain aliases for local use. If you configure a tunnel or another deployment origin, replace them with its actual frontend origins. Do not use a wildcard for credentialed requests.

### 4. Start the containers

From the repository root:

```bash
docker compose build
docker compose up
```

The backend image generates the Prisma client during its build and applies existing migrations before starting. Compose waits for PostgreSQL's health check before starting the backend.

- Frontend login: `http://127.0.0.1/login` (there is no `/` application route).
- Backend: `http://127.0.0.1:3000`.
- PostgreSQL: port `5432`, with data stored in the `db-data` volume.

**Current deployment limitations:** the frontend uses `/api` for HTTP requests and Spotify login, which Nginx proxies to `backend:3000`. The overlay socket uses the hard-coded `http://127.0.0.1:3000` in `frontend/src/http/index.ts`; setting `VITE_API_BACKEND_URL` does not replace it. Remote hosting therefore requires source/configuration changes, consistent OAuth callbacks and CORS origins, and a suitable HTTPS/WebSocket setup. The Vite development configuration also has no `/api` proxy, so `bun run dev` alone is not an equivalent full-stack setup.

## API documentation

After starting the backend, open Swagger at:

`http://127.0.0.1:3000/api/docs`

The application uses cookie-based authentication. Public overlay and history routes are separate from the protected dashboard and session controls.

## Environment variables

### Root `.env`

| Variable | Purpose |
| --- | --- |
| `DB_NAME` | Database created by the PostgreSQL container. |
| `DB_USER` | PostgreSQL username. |
| `DB_PASSWORD` | PostgreSQL password; also used in `DATABASE_URL`. |

### `backend/.env`

| Variable | Purpose |
| --- | --- |
| `CLIENT_ID` | Spotify application client ID. |
| `CLIENT_SECRET` | Spotify application client secret. |
| `REDIRECT_URI` | Registered Spotify callback URL ending in `/auth/callback`. |
| `SCOPES` | Spotify OAuth scope string for the profile, playback, and queue operations used by the app. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `FRONTEND_URL` | Frontend origin used to redirect back to `/dashboard`. |
| `NGROK_AUTHTOKEN` | Present in the template, but not used by the application code; no tunnel starts automatically. |
| `DONATIONALERTS_CLIENT_ID` | DonationAlerts application client ID. |
| `DONATIONALERTS_CLIENT_SECRET` | DonationAlerts application client secret. |
| `REDIRECT_URI_DONATIONALERTS` | Registered DonationAlerts callback URL ending in `/donation-alerts/callback`. |
| `SCOPER_DONATIONALERTS` | DonationAlerts OAuth scope string. Keep this spelling: it is what the code reads. |
| `ENCRYPTION_KEY` | Private 32-byte AES key encoded as 64 hexadecimal characters. |
| `PORT` | Optional backend listening port; defaults to `3000`. Compose and frontend configuration assume `3000`. |

### `frontend/.env` and `frontend/.env.production`

| Variable | Purpose |
| --- | --- |
| `VITE_API_BACKEND_URL` | Public backend URL used by the DonationAlerts connect button. Supply it at frontend build time for Docker. |

## Using the overlay

1. Open `http://127.0.0.1/login` and sign in with Spotify.
2. Start a stream session in the dashboard to record subsequent track changes.
3. Copy the overlay URL and paste it into an OBS **Browser Source**. Its route is `/overlay/<spotifyUserId>`.
4. Play music in Spotify. A newly connected overlay can remain empty until the next track change: the server broadcasts changes rather than sending the current track on connection.
5. Share `/history/<spotifyUserId>` to let viewers browse the active or latest completed session. It is not an archive selector for arbitrary past sessions.
6. Optionally connect DonationAlerts in the dashboard to receive track requests, then end the stream session when finished.

The overlay and history URLs are public and do not require viewers to sign in. Local `127.0.0.1` links only work on the machine running the app; sharing them with remote viewers requires addressing the deployment limitations above.

## About the project

Stream-overlay connects playback data, stream sessions, and viewer requests in one application. The backend stores users, sessions, tracks, and artists in PostgreSQL; the frontend provides dashboard controls and public display pages. Session history is captured from polling, not imported as a complete Spotify listening history.

Before public deployment, review the disabled donation threshold, remote URL configuration, and external-service behavior described above.

[Project roadmap](https://app.notion.com/p/Spotify-API-3c8ce807cb8380bf8279e744b4cbffcc)
