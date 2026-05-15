# Changelog

## 0.1.0 - 2026-05-15

### Added

- Architecture diagrams and auth/token flow documentation in README and docs.
- GitHub Actions CI for lint, test, API build, and mobile typecheck.
- Docker Compose setup for PostgreSQL and the NestJS API.
- Production security hardening notes for token encryption, JWT guards, allowlists, rate limits, HTTPS, Local CLI Auth, and frontend secrets.
- GitHub username allowlist for restricting who can create app sessions.
- Global backend rate limiting and stricter AI review generation throttling.
- Shared app header with theme, language, and history shortcuts on every screen.
- Gradient header styling for the CodeReviewPilot AI app shell.
- Browser tab titles using the pattern `Page - CodeReviewPilot AI`.
- GitHub username display beside the Logout button.
- App metadata panel with app version, developer name, and collapsible release notes.
- Versioned release notes in English and Thai.
- Unit tests for app metadata/release-note structure and session token username parsing.

### Changed

- Local GitHub CLI Auth is now the first Connect GitHub option for local development.
- AI review Markdown rendering has improved inline code and code block styling.
- App name usage is centralized through mobile app metadata.

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
