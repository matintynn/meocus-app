# Focus App — Rules

## Rule 1: Route Integrity
Before running or building the app, verify ALL page routes are linked and not broken.
- Never change a route unless explicitly asked by the user.
- Valid routes: `/today`, `/tasks`, `/sprint`, `/journal`, `/activity`
- Root `/` redirects to `/today`
- Each route maps to `app/<name>/page.tsx`
- Sidebar nav items in `components/layout/Sidebar.tsx` must match these routes exactly.
- Error boundary files must exist: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`
- After any code change, verify routes with: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/<route>`
- All routes must return HTTP 200 (except `/` which returns 307 redirect to `/today`)
