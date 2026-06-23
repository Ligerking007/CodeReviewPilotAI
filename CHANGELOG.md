# Changelog

## Unreleased

### Added

- Unit tests for GitHub token encryption/decryption, random IV usage, and invalid encryption key handling.
- Unit tests for AI review prompt construction, including language selection, PR metadata, binary patch fallback, and patch size limits.
- Architecture documentation describing the test coverage focus for security-sensitive and AI-boundary code paths.
- Additional Mermaid diagrams for interview demo flow, auth method comparison, backend request flow, database ERD, and deployment topology.
- `AGENTS.md` with repository-specific workflow rules for tests, documentation, changelog updates, security, and delivery.
- GitHub Pages public app URL updated to `https://ligerking007.github.io/CodeReviewPilotAI`.
- Expo Web linking now uses `EXPO_PUBLIC_APP_BASE_URL` so GitHub Pages keeps the `/CodeReviewPilotAI` repository path.
- Removed the root-domain web linking fallback when a GitHub Pages app base URL is configured.
- Explicit agent localization rules for keeping English and Thai UI text, release notes, and related tests aligned.
- Explicit agent UI rules for responsive layouts and light/dark/system theme support.
- Current app version display in the shared UI header across screens.
- Optional before/after code suggestions in AI review issue cards when concrete fixes are available.

### Changed

- Added focused comments around token encryption, AI result normalization, and OpenAI prompt size boundaries.
- AI review schema and prompt now support optional `codeSuggestion` snippets for actionable issues.
- AI review prompts now annotate diff hunks with old and new file line numbers so issue locations are closer to the changed code.

## 0.1.0 - 2026-05-15

### Added

- Architecture diagrams and auth/token flow documentation in README and docs.
- GitHub Actions CI/CD for lint, test, API build, mobile typecheck, and GHCR image publishing.
- Docker Compose setup for PostgreSQL, the NestJS API, and the Expo Web mobile container.
- Docker image publishing for `ghcr.io/ligerking007/codereviewpilotai-api` and `ghcr.io/ligerking007/codereviewpilotai-mobile`.
- Expo Web Docker image served by Nginx.
- Root `.env.example` for Docker Compose runtime configuration.
- Production security hardening notes for token encryption, JWT guards, allowlists, rate limits, HTTPS, Local CLI Auth, and frontend secrets.
- GitHub username allowlist for restricting who can create app sessions.
- Global backend rate limiting and stricter AI review generation throttling.
- Shared app header with theme, language, and history shortcuts on every screen.
- Gradient header styling for the CodeReviewPilot AI app shell.
- Browser tab titles using the pattern `Page - CodeReviewPilot AI`.
- Custom browser tab favicon for Expo Web.
- GitHub username display beside the Logout button.
- App metadata panel with app version, developer name, and collapsible release notes.
- Versioned release notes in English and Thai.
- Unit tests for app metadata/release-note structure and session token username parsing.

### Changed

- Local GitHub CLI Auth is now the first Connect GitHub option for local development.
- AI review Markdown rendering has improved inline code and code block styling.
- App name usage is centralized through mobile app metadata.
- Docker Compose now reads runtime secrets from environment variables instead of hardcoded placeholder values.

## 0.0.4 - 2026-05-14

### Added

- Local GitHub CLI Auth for development machines that already use `gh auth`.
- Login method selector for OAuth, fine-grained PAT, and Local CLI.
- Manual light, dark, and system theme switching.

### Changed

- Improved private repository error messages for OAuth restrictions, SSO, and PAT permissions.

## 0.0.3 - 2026-05-14

### Added

- Tests for AI review result normalization.

### Changed

- AI review parsing now tolerates incomplete model output.
- Backend errors are clearer when OpenAI generation or JSON formatting fails.
- Review issues are normalized so missing severity or recommendation fields still render safely.

## 0.0.2 - 2026-05-13

### Added

- GitHub OAuth login and encrypted GitHub token storage.
- Fine-grained personal access token login for private repositories.
- GitHub PR URL parsing, validation, changed files, patches, and commits fetching.
- Backend and local review history.

## 0.0.1 - 2026-05-13

### Added

- Initial Expo React Native app for Android, iOS, and Web.
- Initial NestJS backend with `auth`, `github`, `ai-review`, `history`, and `users` modules.
- OpenAI-powered PR review generation with summary, issues, security, performance, and best-practice sections.
- English and Thai localization with GitHub-inspired dark and light UI foundations.
