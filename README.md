# Counter

A customizable countdown counter built with Next.js and Ant Design.

It is designed for a large full-screen counter view with a shrinking progress bar, configurable milestones, local persistence, and static deployment to GitHub Pages.

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
- App title configurable at build time through `APP_TITLE`

## Tech Stack

- Next.js
- React
- Ant Design
- GitHub Pages

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

`npm run start` serves the exported `out/` directory on port `3000`.

## Environment Variables

```bash
APP_TITLE=카운터
```

If `APP_TITLE` is not set, the default title is `카운터`.
Because this app is statically exported, `APP_TITLE` is applied at build time.

## Docker

Build and run:

```bash
docker compose up -d --build
```

Open:

```text
http://127.0.0.1:8080
```

Example with a custom title baked into the exported files:

```bash
APP_TITLE=My Counter docker compose up -d --build
```

Example with a custom localhost port:

```bash
HOST_PORT=9090 docker compose up -d --build
```

## Deployment

The GitHub Actions workflow is defined in `.github/workflows/deploy.yml`.

### GitHub Pages Setup

1. In GitHub, open `Settings > Pages`.
2. Set `Build and deployment` to `GitHub Actions`.
3. Push to `main`, or run the workflow manually.

### Deployment Flow

1. The workflow installs dependencies and runs `npm run build`.
2. Next.js exports the static site into `out/`.
3. The workflow uploads `out/` and deploys it to GitHub Pages.
4. For project repositories, asset paths are automatically published under `/<repo-name>/`.

### Optional Repository Variable

If you want to customize the production build, add repository variables:

- `APP_TITLE`
- `CUSTOM_DOMAIN`

When `CUSTOM_DOMAIN` is set, the build omits the project-repository base path so the site works correctly at the root of your custom domain.
