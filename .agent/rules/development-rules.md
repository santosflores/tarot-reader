---
trigger: always_on
---

# Development Rules

Create a new commit each time a single logical change is finished.

## Commit Standards (Conventional Commits)

- **Format**: `<type>(<scope>): <subject>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(auth): add google login support`
- **Scope**: Optional but recommended (e.g., `auth`, `ui`, `api`).
- **Subject**: Imperative mood, no period at end (e.g., "add google login" not "added google login").

## Workflow

1.  **Atomic Changes**: Keep commits focused on a single logical change. Do not bundle unrelated fixes.
2.  **Verify First**: Run builds/tests (`npm run build` or equivalent) _before_ committing.
3.  **Linting**: Use `npm run lint` to ensure code is linted and formatted before committing.
4.  **Message Quality**: Provide a concise summary in the first line. Use the body for explanation if needed.

## General

- Always prefer clear, readable code over clever one-liners.
- Update relevant documentation/tasks when code changes.
