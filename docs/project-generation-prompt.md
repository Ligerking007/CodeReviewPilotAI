# Project Generation Prompt

This document stores the reference prompt/specification used to describe the intended architecture, features, security requirements, and delivery expectations for CodeReviewPilot AI.

It is included as documentation so the project scope and design intent are easy to review or reuse for future variants. Do not include secrets, private repository URLs, internal company data, or production credentials in this prompt.

```text
Create a production-style full-stack AI code review platform similar to CodeReviewPilot AI.

Project Name:
<YOUR_PROJECT_NAME>

Goal:
Build an AI-powered GitHub Pull Request review platform. Users can sign in with GitHub, paste a GitHub Pull Request URL, and the system will fetch PR details, changed files, patches, and commits from GitHub. The backend will send relevant PR context to OpenAI and generate structured code review feedback.

Tech Stack:
Frontend:
- React Native + Expo
- TypeScript
- Support Android, iOS, and Web
- Dark/light/system theme support
- English and Thai localization
- Responsive UI
- GitHub-inspired developer UI

Backend:
- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

AI:
- OpenAI API
- Default model: gpt-4.1-mini
- Model configurable by environment variable

Authentication:
- GitHub OAuth login
- Fine-grained GitHub Personal Access Token login
- Local GitHub CLI Auth for development only
- Backend app JWT session
- Store GitHub access token encrypted on backend

Core Features:

1. Authentication
- Login with GitHub OAuth
- Login with fine-grained PAT
- Login with Local GitHub CLI Auth for local development
- Store app JWT on frontend
- Store encrypted GitHub token on backend
- Logout support
- Show GitHub username in UI after login

2. GitHub Pull Request Input
- User can paste PR URL:
  https://github.com/owner/repo/pull/123
- Parse owner, repo, PR number
- Validate URL
- Fetch PR details

3. GitHub Integration
Use GitHub API to fetch:
- PR details
- Changed files
- File patches/diffs
- Annotated old/new line numbers from diff hunks
- Commits

Support:
- Public repositories
- Private repositories via OAuth/PAT
- Organization repositories when token has access

Required GitHub permissions:
- Metadata: Read
- Contents: Read
- Pull requests: Read

4. AI Review Engine
Send PR context/diff to OpenAI.

AI should analyze:
- Code quality
- Possible bugs
- Security risks
- Performance issues
- Architecture/design concerns
- Clean code suggestions
- Missing validation
- Async/concurrency risks
- Logging/error handling issues

Return structured JSON with:
- summary
- criticalIssues
- suggestions
- security
- performance
- bestPractices
- markdown

Each issue should include:
- severity: critical | high | medium | low | info
- title
- file
- line, using the annotated new-file line number from the diff when available
- description
- recommendation
- optional codeSuggestion with before and after snippets when a concrete code-level fix can be derived from the PR diff

Validate AI output with Zod.
Normalize incomplete AI output safely.

5. Review Result Screen
Frontend should show:
- Summary
- Expand/collapse sections
- Severity badges
- File-based issue cards
- Markdown rendering
- Copy review button
- Clean inline code and code block rendering

6. History
Save review history:
- backend database
- local frontend cache
- PR URL
- title
- review result
- review date

7. App Metadata
Show:
- App version
- Developer name
- Collapsible release notes
- Release notes grouped by version
- Support English and Thai release notes

8. Shared App Header
All pages should include:
- App name
- Gradient header background
- Theme toggle
- Language toggle
- History shortcut
- Browser page title format:
  Home - <APP_NAME>
  Review - <APP_NAME>
  History - <APP_NAME>

9. Backend Security
Implement:
- JWT guard for protected endpoints
- GitHub token encryption with AES-256-GCM
- GitHub username allowlist via env:
  GITHUB_ALLOWED_USERNAMES
- Global rate limit via env:
  RATE_LIMIT_TTL_MS
  RATE_LIMIT_MAX
- AI review specific rate limit via env:
  AI_REVIEW_RATE_LIMIT_TTL_MS
  AI_REVIEW_RATE_LIMIT_MAX
- HTTPS-only production guidance
- Never expose OpenAI API key in frontend
- Disable Local CLI Auth in production

10. Backend Architecture
NestJS modules:
- auth
- users
- github
- ai-review
- history
- common

11. Database Models
Use Prisma and PostgreSQL.

Create models:
- User
- GithubAccount
- GithubInstallation
- ReviewHistory
- ReviewResult

12. DevOps / Production Readiness
Add:
- README.md
- CHANGELOG.md
- docs/architecture.md
- docs/project-overview.md
- apps/api/.env.example
- apps/mobile/.env.example
- GitHub Actions CI:
  - lint
  - test
  - build API
  - typecheck mobile
- Docker Compose:
  - PostgreSQL
  - NestJS API
- API Dockerfile
- .dockerignore

13. Testing
Add basic unit tests for:
- GitHub PR URL parser
- AI review result schema normalization
- GitHub allowlist parser
- GitHub token encryption/decryption and invalid encryption key handling
- AI review prompt construction, language selection, binary patch fallback, and patch size limits
- app metadata/release notes
- session token username parsing

14. README Requirements
README should include:
- Project overview
- Architecture diagram using Mermaid
- Authentication/token flow sequence diagram
- Pull request review sequence diagram
- Backend module map diagram
- Code structure diagram for repository folders
- Backend request flow diagram
- Database ER diagram
- Deployment diagram
- Test coverage focus
- Auth/token flow
- Setup instructions
- GitHub OAuth/PAT setup
- Docker Compose instructions
- Backend access controls
- Production security considerations
- Test commands

Architecture Diagram:
Use Mermaid:

flowchart LR
  User[Developer] --> Expo[Expo App\nAndroid / iOS / Web]
  Expo -->|App JWT + PR URL| API[NestJS API]
  API -->|User GitHub token| GitHub[GitHub API\nPR details / files / commits]
  API -->|Review prompt| OpenAI[OpenAI API\ngpt-4.1-mini]
  API -->|Users / tokens / history| DB[(PostgreSQL)]
  API -->|Structured review JSON| Expo

Authentication Flow Diagram:
Use Mermaid:

sequenceDiagram
  autonumber
  actor User as Developer
  participant App as Expo App
  participant API as NestJS API
  participant GitHub as GitHub API
  participant DB as PostgreSQL

  User->>App: Select OAuth / PAT / Local CLI
  App->>API: Send auth request
  API->>GitHub: Validate GitHub identity/token
  GitHub-->>API: GitHub profile + token scopes
  API->>API: Check username allowlist
  API->>API: Encrypt GitHub access token
  API->>DB: Store user + encrypted token
  API-->>App: Return app JWT
  App->>App: Store app JWT only

Pull Request Review Flow Diagram:
Use Mermaid:

sequenceDiagram
  autonumber
  actor User as Developer
  participant App as Expo App
  participant API as NestJS API
  participant GitHub as GitHub API
  participant OpenAI as OpenAI API
  participant DB as PostgreSQL

  User->>App: Paste GitHub PR URL
  App->>API: POST /ai-review/reviews with app JWT
  API->>API: Verify JWT guard
  API->>API: Parse owner / repo / PR number
  API->>GitHub: Fetch PR details, files, patches, commits
  GitHub-->>API: PR context
  API->>OpenAI: Send review prompt with diff context
  OpenAI-->>API: Structured JSON review
  API->>API: Validate and normalize with Zod
  API->>DB: Save review history and result
  API-->>App: Return structured review
  App-->>User: Render sections, severity badges, Markdown

Code Structure Diagram:
Use Mermaid:

flowchart TB
  Root[<PROJECT_NAME>] --> Apps[apps]
  Root --> Docs[docs]
  Root --> CI[.github/workflows]
  Root --> Docker[docker-compose.yml]

  Apps --> API[apps/api]
  Apps --> Mobile[apps/mobile]

  API --> ApiSrc[src]
  API --> Prisma[prisma/schema.prisma]
  API --> ApiEnv[.env.example]
  API --> ApiDocker[Dockerfile]

  ApiSrc --> Auth[auth]
  ApiSrc --> Github[github]
  ApiSrc --> AIReview[ai-review]
  ApiSrc --> History[history]
  ApiSrc --> Users[users]
  ApiSrc --> Common[common]

  Mobile --> MobileSrc[src]
  Mobile --> ExpoConfig[app.json]
  Mobile --> MobileEnv[.env.example]

  MobileSrc --> Screens[screens]
  MobileSrc --> Components[components]
  MobileSrc --> Services[services]
  MobileSrc --> Store[store]
  MobileSrc --> Theme[theme]
  MobileSrc --> I18n[i18n]
  MobileSrc --> Utils[utils]
  MobileSrc --> Types[types]
  MobileSrc --> Constants[constants]

Backend Request Flow Diagram:
Use Mermaid:

sequenceDiagram
  autonumber
  participant Client as Expo App
  participant Controller as NestJS Controller
  participant Guard as JWT Guard / Throttler
  participant Service as Domain Service
  participant Prisma as Prisma Service
  participant GitHub as GitHub API
  participant OpenAI as OpenAI API

  Client->>Controller: Authenticated API request
  Controller->>Guard: Validate bearer JWT and rate limit
  Guard-->>Controller: Current user context
  Controller->>Service: Execute use case
  Service->>Prisma: Load encrypted GitHub token / history
  Prisma-->>Service: User data
  Service->>GitHub: Fetch PR details, files, commits
  GitHub-->>Service: PR bundle
  Service->>OpenAI: Send bounded review prompt
  OpenAI-->>Service: Structured JSON review
  Service->>Prisma: Persist history and review result
  Service-->>Controller: Response DTO
  Controller-->>Client: Review result

Database ER Diagram:
Use Mermaid:

erDiagram
  users ||--o{ github_accounts : owns
  users ||--o{ review_history : creates
  review_history ||--o| review_results : stores

Deployment Diagram:
Use Mermaid:

flowchart TB
  Developer[Developer Browser / Mobile Device] --> Web[Expo Web / Native App]
  Nginx[Mobile Web Container\nNginx static export]
  API[NestJS API Container]
  Postgres[(PostgreSQL)]
  Web -->|EXPO_PUBLIC_API_URL| API
  Developer -->|Web demo| Nginx
  API -->|DATABASE_URL| Postgres
  API -->|Read PR data| GitHub[GitHub API]
  API -->|Generate review| OpenAI[OpenAI API]

Document folder responsibilities:
- Backend `auth`: OAuth, PAT, Local CLI Auth, JWT, allowlist, token encryption.
- Backend `github`: PR URL parsing, GitHub REST API, PR bundle construction, GitHub App support.
- Backend `ai-review`: OpenAI prompt construction, review generation, Zod validation, normalization.
- Backend `history`: Review history retrieval.
- Backend `users`: User profile and GitHub account persistence.
- Backend `common`: Prisma service, decorators, shared backend types.
- Frontend `screens`: Home, Result, History, Auth callback screens.
- Frontend `components`: Shared UI primitives.
- Frontend `services`: API client and storage adapters.
- Frontend `store`: Auth context and app JWT state.
- Frontend `theme`: Dark/light/system theme.
- Frontend `i18n`: English and Thai translations.
- Frontend `utils`: PR URL and session token helpers with tests.
- Frontend `types`: Navigation and review response types.
- Frontend `constants`: App metadata and versioned release notes.

Environment Variables:
Backend:
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
APP_WEB_REDIRECT_URL
GITHUB_ALLOWED_USERNAMES
RATE_LIMIT_TTL_MS
RATE_LIMIT_MAX
AI_REVIEW_RATE_LIMIT_TTL_MS
AI_REVIEW_RATE_LIMIT_MAX
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL
GITHUB_TOKEN_ENCRYPTION_KEY
OPENAI_API_KEY
OPENAI_MODEL
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_APP_WEBHOOK_SECRET

Frontend:
EXPO_PUBLIC_API_URL

Implementation Requirements:
- Use clean architecture and scalable folders.
- Keep frontend secrets out of Expo env.
- Use TypeScript everywhere.
- Use environment variables for configurable behavior.
- Add concise comments only in important security or architecture points.
- Include practical error messages for GitHub permissions, OAuth restrictions, SSO, and private repos.
- Make the project runnable locally with npm and Docker Compose.
- After implementation, run lint, tests, API build, and mobile typecheck.
```
