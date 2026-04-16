# Counter

A customizable countdown counter built with Next.js and Ant Design.

It is designed for a large full-screen counter view with a shrinking progress bar, configurable milestones, local persistence, and Docker-based deployment behind a reverse proxy such as Caddy.

## Features

- Configurable total duration with hours, minutes, and seconds
- Named milestones with individual time values
- Progress bar that shrinks based on remaining time
- Large active milestone label display
- Optional 2-digit millisecond display
- Light and dark mode
- Custom bar color
- Adjustable counter text scale
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
HOST_PORT=8080
```

If `APP_TITLE` is not set, the default title is `카운터`.
If `HOST_PORT` is not set, Docker binds to `127.0.0.1:8080`.

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

Example with a custom localhost port:

```bash
HOST_PORT=9090 docker compose up -d --build
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
- `APP_TITLE` optional, overrides the remote title during deployment
- `HOST_PORT` optional, defaults to `8080`

### Deployment Flow

1. Push to `main`, or run the workflow manually.
2. The workflow uploads a release archive to the remote server.
3. The app is deployed to `~/apps/<repo-name>`.
4. The server runs `docker compose up -d --build --remove-orphans`.

If `APP_TITLE` or `HOST_PORT` is set as a GitHub Actions secret, that value is applied during deployment.

### Remote Configuration

To override the app title or port on the server without changing GitHub secrets, add values like these to either `~/apps/<repo-name>/.env` or `~/apps/<repo-name>/.env.production`:

```bash
APP_TITLE=Your Title
HOST_PORT=9090
```
