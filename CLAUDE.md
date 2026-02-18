# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository. Update this file as the project evolves.

---

## Repository Status

**Current state:** Freshly initialized — no source files exist yet.

This CLAUDE.md was generated on 2026-02-18 as a foundational template. As code is added, each section below should be filled in to reflect the actual project.

---

## Project Overview

<!-- Fill in when project purpose is established -->
- **Project name:** project_aileader
- **Description:** _To be documented_
- **Type:** _e.g., web app, API server, CLI tool, library_
- **Primary language(s):** _To be documented_
- **Primary framework(s):** _To be documented_

---

## Repository Structure

<!-- Update this tree as directories and files are added -->
```
project_aileader/
├── CLAUDE.md          # This file — AI assistant guidance
└── .git/              # Git metadata
```

When the project grows, document each top-level directory's purpose here:

| Directory / File | Purpose |
|------------------|---------|
| `src/` or `app/` | Main application source code |
| `tests/`         | Test suites |
| `docs/`          | Documentation |
| `scripts/`       | Developer utility scripts |
| `config/`        | Configuration files |

---

## Getting Started

### Prerequisites

<!-- List required tools, runtimes, and versions once known -->
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd project_aileader

# Install dependencies (update command for your stack)
# npm install          # Node.js
# pip install -e .     # Python
# go mod download      # Go
# bundle install       # Ruby
```

### Environment Variables

<!-- Document required env vars here as they are introduced -->
Copy `.env.example` to `.env` and populate the values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| _None yet_ | — | — |

---

## Development Workflow

### Branching Convention

- `main` / `master` — stable, production-ready code
- `develop` — integration branch (if used)
- `feature/<description>` — new features
- `fix/<description>` — bug fixes
- `chore/<description>` — maintenance tasks
- `claude/<description>` — AI-assisted work sessions

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**
```
feat(auth): add JWT-based authentication
fix(api): handle null response from upstream service
docs: update installation instructions
```

### Pull Request Process

1. Branch off `main` (or `develop` if used).
2. Make focused, atomic commits.
3. Ensure all tests pass and linting is clean before opening a PR.
4. Write a clear PR description explaining *why*, not just *what*.
5. Request at least one review.
6. Squash-merge or rebase onto the target branch.

---

## Commands Reference

<!-- Update with actual commands once the stack is established -->

### Running the Application

```bash
# Development mode
# npm run dev / python -m app / go run ./cmd/...

# Production build
# npm run build / python -m build / go build ./...
```

### Running Tests

```bash
# Run all tests
# npm test / pytest / go test ./...

# Run a specific test file
# npm test -- src/foo.test.ts
# pytest tests/test_foo.py
# go test ./pkg/foo/...

# Run tests with coverage
# npm test -- --coverage
# pytest --cov=src
# go test -cover ./...
```

### Linting & Formatting

```bash
# Lint
# npm run lint
# ruff check .
# golangci-lint run

# Format
# npm run format
# ruff format .
# gofmt -w .
```

### Type Checking

```bash
# npm run typecheck   (TypeScript)
# mypy src/           (Python)
```

---

## Key Conventions

### Code Style

- Follow the style enforced by the project's linter/formatter (see above).
- Prefer explicit over implicit; avoid magic values.
- Keep functions small and single-purpose.
- Write self-documenting code; add comments only where intent is non-obvious.

### Testing

- Write tests for all new features and bug fixes.
- Aim for high coverage on business logic; avoid testing framework internals.
- Use descriptive test names that explain the expected behavior:
  `test_user_login_fails_with_wrong_password` not `test_login_2`.
- Prefer unit tests for logic; use integration/e2e tests for workflows.

### Error Handling

- Never swallow errors silently.
- Log errors with enough context to diagnose the problem.
- Return meaningful error messages to callers; avoid leaking internal details to end users.

### Security

- Never commit secrets, credentials, or API keys — use environment variables.
- Validate and sanitize all user-supplied input.
- Keep dependencies up to date; review security advisories.
- Follow the principle of least privilege for service accounts and IAM roles.

### Dependencies

- Add new dependencies deliberately — evaluate size, maintenance status, and license.
- Pin versions (or use lock files) to ensure reproducible builds.
- Remove unused dependencies promptly.

---

## Architecture Notes

<!-- Document key architectural decisions here as they are made -->

_No architecture established yet. Document decisions using [Architecture Decision Records (ADRs)](https://adr.github.io/) in a `docs/adr/` directory as the project grows._

---

## CI/CD

<!-- Document pipeline stages and tooling once configured -->

_No CI/CD pipeline configured yet. When added, document:_
- CI provider (GitHub Actions, GitLab CI, CircleCI, etc.)
- Stages: lint → test → build → deploy
- Required secrets/environment variables in the pipeline
- Deployment targets and environments (staging, production)

---

## Troubleshooting

<!-- Add common issues and their solutions as they are discovered -->

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| _None documented yet_ | — | — |

---

## AI Assistant Guidelines

When working in this repository, AI assistants should:

1. **Read before writing** — always read relevant files before modifying them.
2. **Stay focused** — make only the changes needed to address the current task; do not refactor unrelated code.
3. **Follow conventions** — use the commit message format, branching strategy, and code style described above.
4. **Run checks** — after making code changes, run linting and tests to verify correctness.
5. **Update this file** — if you discover something important about the codebase that isn't documented here, add it.
6. **Avoid over-engineering** — prefer the simplest solution that satisfies the requirements.
7. **Prefer editing over creating** — modify existing files rather than creating new ones when possible.
8. **Do not commit secrets** — never include credentials, tokens, or private keys in commits.
9. **Branch correctly** — all AI-assisted work should land on a `claude/<description>` branch before being reviewed and merged.
10. **Document decisions** — leave a short comment or ADR when making a non-obvious architectural choice.
