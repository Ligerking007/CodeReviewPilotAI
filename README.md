# CodeReviewPilot AI

AI-powered GitHub Pull Request review platform built with Expo, React Native, NestJS, Prisma, GitHub OAuth, and OpenAI.

## Apps

- `apps/mobile`: Expo app for Android, iOS, and Web.
- `apps/api`: NestJS backend API.

## Project Overview

For an English walkthrough that explains the product idea, architecture, trade-offs, security decisions, demo script, and talking points for job interviews, see [docs/project-overview.md](docs/project-overview.md).

For versioned product changes, see [CHANGELOG.md](CHANGELOG.md).

## Features

- GitHub OAuth login and logout.
- Local GitHub CLI Auth and fine-grained PAT login for local/private repository workflows.
- Paste a GitHub PR URL like `https://github.com/owner/repo/pull/123`.
- Fetch PR metadata, changed files, commits, and patches from GitHub.
- Generate AI review sections: summary, critical issues, suggestions, security, performance, and best practices.
- Store review history in the backend and locally on the device.
- English and Thai UI with versioned release notes.
- Dark/light mode, a shared gradient app header, and browser tab titles like `Home - CodeReviewPilot AI`.
- Backend GitHub username allowlist and rate limiting for safer shared deployments.

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

## Backend Access Controls

Set `GITHUB_ALLOWED_USERNAMES` to restrict who can create an app session. Leave it empty to allow any valid GitHub user, or set a comma-separated list:

```env
GITHUB_ALLOWED_USERNAMES="Ligerking007,JakapanK"
```

The API also applies a global IP-based rate limit. Defaults are `120` requests per `60000` ms and can be changed with:

```env
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX=120
```

AI review creation is additionally limited to 5 requests per hour per client IP because it calls OpenAI.

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
 Web
  <img width="800" height="552" alt="image" src="https://github.com/user-attachments/assets/c7c12b42-8e96-4b3d-be2f-7c60c5232710" />
  <img width="800" height="558" alt="image" src="https://github.com/user-attachments/assets/59607896-c1a7-49d9-91a2-00c36073c18a" />
  <img width="2004" height="1404" alt="image" src="https://github.com/user-attachments/assets/c1248296-612a-4982-9325-7355f3c5b724" />
  <img width="2010" height="1412" alt="image" src="https://github.com/user-attachments/assets/b95c22ab-2e5c-4def-84bb-3a40d029a0ab" />
<img width="2008" height="1006" alt="image" src="https://github.com/user-attachments/assets/3f4eaace-8795-4bdc-a791-eb8dfc43b75e" />

Mobile
<img width="450" height="954" alt="image" src="https://github.com/user-attachments/assets/a5de1c4c-4577-4274-b0f1-488e2483f17e" />
<img width="484" height="968" alt="image" src="https://github.com/user-attachments/assets/d5c987ec-622f-442b-a803-7bbbb63f0199" />
<img width="462" height="970" alt="image" src="https://github.com/user-attachments/assets/a6d9ac6a-e36e-44b2-85af-bed8173547e9" />







 

