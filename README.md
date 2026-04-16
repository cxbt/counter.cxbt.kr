# Counter

A customizable countdown timer built with Next.js and Ant Design.

It is designed for a large full-screen timer view with a shrinking progress bar, configurable milestones, local persistence, and Docker-based deployment behind a reverse proxy such as Caddy.

## Features

- Configurable total duration with hours, minutes, and seconds
- Named milestones with individual time values
- Progress bar that shrinks based on remaining time
- Large active milestone label display
- Optional 2-digit millisecond display
- Light and dark mode
- Custom bar color
- Adjustable timer text scale
- Adjustable progress bar height
- Settings saved to `localStorage`
- App title configurable through `APP_TITLE`

## Tech Stack

- Next.js
- React
- Ant Design
- Docker

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
npm run start
```

The app runs on port `3000` by default.

## Environment Variables

```bash
APP_TITLE=카운터
```

If `APP_TITLE` is not set, the default title is `카운터`.

## Docker

Build and run:

```bash
docker compose up -d --build
```

Open:

```text
http://127.0.0.1:8080
```

Example with a custom title:

```bash
APP_TITLE=My Counter docker compose up -d --build
```

Health check:

```bash
curl http://127.0.0.1:8080/api/healthz
```

## Deployment

The GitHub Actions workflow is defined in `.github/workflows/deploy.yml`.

### Required GitHub Secrets

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY` or `DEPLOY_SSH_KEY_B64`
- `DEPLOY_PORT` optional, defaults to `22`

### Deployment Flow

1. Push to `main`, or run the workflow manually.
2. The workflow uploads a release archive to the remote server.
3. The app is deployed to `~/apps/<repo-name>`.
4. The server runs `docker compose up -d --build --remove-orphans`.

### Remote Configuration

To override the app title on the server, add this to either `~/apps/<repo-name>/.env` or `~/apps/<repo-name>/.env.production`:

```bash
APP_TITLE=Your Title
```
