---
trigger: always_on
---

# Development Rules

When all sub-tasks under a task are complete:

1. Run `npm run build` and `npm run lint`
2. Stage changes: `git add .`
3. Clean up temporary files
4. Commit with conventional format:

## Commit Standards (Conventional Commits)

- **Atomic Changes**: Keep commits focused on a single logical change. Do not bundle unrelated fixes.
- **Message Quality**: Provide a concise summary in the first line. Use the body for explanation if needed.
- **Format**: `<type>(<scope>): <subject>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(auth): add google login support`
- **Scope**: Optional but recommended (e.g., `auth`, `ui`, `api`).
- **Subject**: Imperative mood, no period at end (e.g., "add google login" not "added google login").

## Workflow

## General

- Always prefer clear, readable code over clever one-liners.
- Update relevant documentation/tasks when code changes.
