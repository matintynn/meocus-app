# Focus App — Rules

## Rule 1: Design System Compliance
When generating, designing, or modifying **any** UI — components, pages, modals, empty states, etc. — always follow the design system defined in `DESIGN_SYSTEM.md`.
- Use the documented color tokens, typography scale, spacing patterns, border radius, and component patterns.
- Always use the `<Button>` component — never write raw `<button>` with manual styling.
- Always use the `<Modal>` wrapper — never create custom overlay markup.
- Use Lucide React for icons with documented default sizes and stroke widths.
- Before creating a new component, check if a pattern already exists in `DESIGN_SYSTEM.md`.
- If a new pattern is established, update `DESIGN_SYSTEM.md` to keep it current.

## Rule 2: Versioning
Every time a meaningful change is made to the app, update the `version` field in `package.json` following Semantic Versioning (SemVer):
- **Major** (`x.0.0`): Breaking changes, full feature overhauls, or significant UX restructures.
- **Minor** (`1.x.0`): New features, new pages, new modals, or additive functionality.
- **Patch** (`1.0.x`): Bug fixes, copy changes, style tweaks, or small improvements.

Rules:
- Always bump the version in `package.json` as part of the same commit/change that introduces the update.
- Never leave the version stale after a meaningful change.
- When in doubt between minor and patch, prefer minor if the user would notice the difference.
- After every version bump, add an entry to `CHANGELOG.md` under the new version number with a short description of what changed.
- The `[Unreleased]` section in `CHANGELOG.md` is the staging area — move items there while working, then archive under the version when shipped.
- If an item from `TODO.md` is completed as part of the change, note it in the changelog and it can be removed from `TODO.md`.

## Rule 3: Route Integrity
Before running or building the app, verify ALL page routes are linked and not broken.
- Never change a route unless explicitly asked by the user.
- Valid routes: `/today`, `/tasks`, `/sprint`, `/journal`, `/activity`
- Root `/` redirects to `/today`
- Each route maps to `app/<name>/page.tsx`
- Sidebar nav items in `components/layout/Sidebar.tsx` must match these routes exactly.
- Error boundary files must exist: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`
- After any code change, verify routes with: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/<route>`
- All routes must return HTTP 200 (except `/` which returns 307 redirect to `/today`)
