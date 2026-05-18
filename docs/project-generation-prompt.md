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
- line
- description
- recommendation

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
- app metadata/release notes
- session token username parsing

14. README Requirements
README should include:
- Project overview
- Architecture diagram using Mermaid
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
