# CodeReviewPilot AI

AI-powered GitHub Pull Request review platform built with Expo, React Native, NestJS, Prisma, GitHub OAuth, and OpenAI.

## Apps

- `apps/mobile`: Expo app for Android, iOS, and Web.
- `apps/api`: NestJS backend API.

## Project Overview

For an English walkthrough that explains the product idea, architecture, trade-offs, security decisions, demo script, and talking points for job interviews, see [docs/project-overview.md](docs/project-overview.md).

## Features

- GitHub OAuth login and logout.
- Paste a GitHub PR URL like `https://github.com/owner/repo/pull/123`.
- Fetch PR metadata, changed files, commits, and patches from GitHub.
- Generate AI review sections: summary, critical issues, suggestions, security, performance, and best practices.
- Store review history in the backend and locally on the device.
- English and Thai UI.
- Dark and light mode.

## Requirements

- Node.js 20+
- PostgreSQL 15+
- Expo CLI through `npx expo`
- GitHub OAuth app
- OpenAI API key

## Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
npm run prisma:generate -w apps/api
npm run prisma:migrate -w apps/api
```

Start the API:

```bash
npm run dev:api
```

Start the Expo app:

```bash
npm run dev:mobile
```

## GitHub OAuth

Create a GitHub OAuth app with:

- Homepage URL: `http://localhost:8081`
- Authorization callback URL: `http://localhost:3000/auth/github/callback`

Required repository permissions for the GitHub app/OAuth flow:

- Pull requests: Read
- Contents: Read
- Metadata: Read

For GitHub App installation tokens, set `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_APP_WEBHOOK_SECRET`. The backend includes `GithubAppService` for creating app JWTs and installation access tokens.

## Fine-Grained Personal Access Token

For local development or users who do not want to configure OAuth, the app also supports GitHub fine-grained personal access tokens.

Create a token at GitHub Developer Settings with repository permissions:

- Metadata: Read
- Contents: Read
- Pull requests: Read

Then use the frontend "Fine-grained personal access token" form. The token is sent to the backend once, validated with GitHub, encrypted with AES-256-GCM, and stored server-side. The mobile app only stores the app JWT.

## Local GitHub CLI Auth

For local development only, the frontend also supports "Local CLI" login. The backend runs:

```bash
gh auth token
```

and uses that GitHub CLI token to create an app session. This gives the app the same GitHub identity as the machine running the backend. Do not use this as a production authentication method.

## API Flow

1. Mobile opens `GET /auth/github`.
2. GitHub redirects to `GET /auth/github/callback`.
3. API exchanges the code, stores the encrypted GitHub access token, and redirects back to the Expo deep link with an app JWT.
4. Mobile calls `POST /ai-review/reviews` with a PR URL.
5. API fetches GitHub PR data and asks OpenAI to generate structured review output.

## Tests

```bash
npm test
```
