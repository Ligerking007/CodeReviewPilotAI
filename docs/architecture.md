# Architecture

CodeReviewPilot AI uses a small monorepo with separated delivery concerns.

## Frontend

The Expo app owns presentation, local settings, local history cache, authentication token storage, language selection, and theme selection.

Key folders:

- `src/screens`: feature screens.
- `src/components`: reusable UI primitives.
- `src/services`: API client and storage adapters.
- `src/i18n`: English and Thai translations.
- `src/theme`: light/dark color tokens.

## Backend

The NestJS API owns authentication, GitHub integration, AI review generation, and database persistence.

Modules:

- `auth`: GitHub OAuth, JWT issuance, logout.
- `users`: user account lookup and token storage.
- `github`: PR URL parsing and GitHub API integration.
- `github-app.service`: GitHub App JWT and installation token support.
- `ai-review`: OpenAI prompt construction and structured review generation.
- `history`: review history retrieval.

## Database

Prisma models:

- `users`
- `github_accounts`
- `review_history`
- `review_results`
- `github_installations`

GitHub tokens are encrypted before storage with AES-256-GCM.
