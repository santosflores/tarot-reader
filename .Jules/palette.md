## 2026-01-20 - [Menu Drawer Accessibility]
**Learning:** Hidden content (via CSS transform) must be explicitly hidden from assistive technology using `aria-hidden` or by conditionally rendering ARIA attributes (`role`, `aria-modal`). Statically applying `role="dialog"` to a visually hidden element creates a "ghost" modal that traps screen reader users.
**Action:** When animating visibility using transforms, ensure `aria-hidden` toggles with the visual state, or conditionally apply semantic roles.
