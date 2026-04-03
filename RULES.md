# Focus App — Rules

## Rule 1: Design System Compliance
When generating, designing, or modifying **any** UI — components, pages, modals, empty states, etc. — always follow the design system defined in `DESIGN_SYSTEM.md`.
- Use the documented color tokens, typography scale, spacing patterns, border radius, and component patterns.
- Always use the `<Button>` component — never write raw `<button>` with manual styling.
- Always use the `<Modal>` wrapper — never create custom overlay markup.
- Use Lucide React for icons with documented default sizes and stroke widths.
- Before creating a new component, check if a pattern already exists in `DESIGN_SYSTEM.md`.
- If a new pattern is established, update `DESIGN_SYSTEM.md` to keep it current.

## Rule 2: Route Integrity
Before running or building the app, verify ALL page routes are linked and not broken.
- Never change a route unless explicitly asked by the user.
- Valid routes: `/today`, `/tasks`, `/sprint`, `/journal`, `/activity`
- Root `/` redirects to `/today`
- Each route maps to `app/<name>/page.tsx`
- Sidebar nav items in `components/layout/Sidebar.tsx` must match these routes exactly.
- Error boundary files must exist: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`
- After any code change, verify routes with: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/<route>`
- All routes must return HTTP 200 (except `/` which returns 307 redirect to `/today`)
