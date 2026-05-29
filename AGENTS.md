# CodeReviewPilot AI Agent Guide

This file defines project-specific instructions for AI agents and contributors working in this repository.

## Project Context

CodeReviewPilot AI is a full-stack AI code review platform.

- Frontend: Expo React Native app in `apps/mobile`, supporting Android, iOS, and Web.
- Backend: NestJS API in `apps/api`.
- Database: PostgreSQL through Prisma.
- External services: GitHub API and OpenAI API.
- Documentation: `README.md`, `CHANGELOG.md`, and files under `docs/`.

## Required Workflow

Before changing code, inspect the existing implementation and follow the local patterns already used in the affected module.

For every meaningful change:

- Update or add unit tests for the behavior being changed.
- Update relevant `.md` documentation when behavior, setup, architecture, security, UI flow, or developer workflow changes.
- Update `CHANGELOG.md` under `## Unreleased`.
- Keep changes scoped to the request.
- Do not commit secrets, tokens, `.env` values, generated build output, or local machine paths.

## Testing Expectations

Use focused tests for the code you touch.

- Backend logic: add or update `*.spec.ts` near the changed service, parser, schema, guard, or utility.
- Mobile logic: add or update tests near changed utilities, constants, storage/session helpers, or non-visual logic.
- Security-sensitive behavior must have tests, especially token handling, auth checks, allowlists, rate limits, GitHub access, and AI prompt boundaries.
- AI response parsing should be schema-validated and tested against incomplete or malformed model output.

Useful commands:

```bash
npm run test -w apps/api
npm run test -w apps/mobile
npm run lint -w apps/api
npm run lint -w apps/mobile
npm run build -w apps/api
npm run typecheck -w apps/mobile
```

Run the smallest relevant command first. Before finishing a broad change, run the related lint/test commands and report what passed or what could not be run.

## Documentation Expectations

Update docs based on the type of change:

- `README.md`: setup, commands, feature list, environment variables, deployment, security notes, or high-level project links.
- `docs/project-overview.md`: interview-friendly product explanation, demo flow, trade-offs, and portfolio talking points.
- `docs/architecture.md`: technical diagrams, backend/frontend structure, database, auth flow, deployment, and test coverage focus.
- `docs/project-generation-prompt.md`: reusable project specification when the expected generated project shape changes.
- `CHANGELOG.md`: user-visible or portfolio-relevant changes, always under `## Unreleased` unless preparing a release.

Keep `project-overview.md` and `architecture.md` separate:

- `project-overview.md` is for explaining the project quickly to an interviewer.
- `architecture.md` is for technical deep dive and implementation structure.

## Code Style

- Use TypeScript consistently.
- Prefer existing helpers and module boundaries over new abstractions.
- Add comments only where they explain important security, architecture, or AI-boundary decisions.
- Keep frontend UI consistent with the existing developer-tool style.
- Preserve English and Thai localization when visible text changes.
- Keep app metadata centralized in `apps/mobile/src/constants/app-info.ts`.

## Security Rules

- Never expose `OPENAI_API_KEY`, GitHub OAuth client secret, database credentials, token encryption keys, or PAT values in frontend code or docs.
- Keep GitHub tokens server-side and encrypted at rest.
- Keep JWT guards on protected backend endpoints.
- Keep Local GitHub CLI Auth documented as local-development only.
- Maintain allowlist and rate-limit behavior when touching auth or AI review endpoints.

## Git And Delivery

- Check `git status -sb` before and after edits.
- Do not revert unrelated user changes.
- Use clear commit messages when asked to commit or push.
- If pushing, verify the branch state after `git push`.
