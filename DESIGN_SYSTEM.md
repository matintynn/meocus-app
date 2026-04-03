# Focus — Design System & Style Guide

> Canonical reference for all UI decisions. Every new component, page, or feature **must** follow these patterns.

---

## 1 · Color Tokens

All colors are defined in `tailwind.config.ts` as semantic tokens. **Never use raw hex values** — always use the token name.

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0F0F0F` | App / page background |
| `surface` | `#1C1C1E` | Cards, panels, sidebar background |
| `surface/50` | — | Kanban lanes (50 % opacity variant) |
| `surface2` | `#2C2C2E` | Inputs, hover fills, secondary panels |
| `surface3` | `#3A3A3C` | Progress-bar tracks, counter badges, dropdown hovers |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text` | `#F5F5F7` | Primary headings & body |
| `text2` | `#AEAEB2` | Secondary / muted |
| `text3` | `#6D6D72` | Tertiary – labels, placeholders, inactive tabs |
| `text4` | `#4B4B4F` | Rarely used (reserved) |
| `text5` | `#2C2C2E` | Inverted text on light badges |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border` | `rgba(255,255,255,0.10)` | Default borders |
| `border2` | `rgba(255,255,255,0.18)` | Focus / hover / active borders |

### Bucket Colors

Each bucket has three tokens: **main** (dot / accent), **bg** (tag / badge background), **text** (tag / badge foreground).

| Bucket | Main | Background | Text |
|--------|------|------------|------|
| work | `#3B82F6` | `#1D3461` | `#93C5FD` |
| learn | `#F59E0B` | `#3D2B0A` | `#FCD34D` |
| life | `#D946EF` | `#2E1336` | `#E879F9` |

### Status Colors

| Token | Main | Background | Text |
|-------|------|------------|------|
| urgent | `#EF4444` | `#3B1212` | `#FCA5A5` |
| someday | `#71717A` | `#27272A` | `#A1A1AA` |
| carried | `#D97706` | `#292008` | `#FCD34D` |

### One-Off Accents

| Context | Colors |
|---------|--------|
| Check-in banner | bg `#2a2520`, border `#3d3328`, accent `#f0b060` |
| Journal date badge | bg `#f0f0f0`, text `#1a1a1a` |
| Toast | bg `#F5F5F7`, text `#0F0F0F` (inverted) |
| Done badge | `bg-green-900/60 text-green-400` |

---

## 2 · Typography

### Scale

Use arbitrary `text-[Xpx]` classes — **not** the default Tailwind scale.

| Size | Role | Example |
|------|------|---------|
| `text-[10px]` | Tiny labels, sidebar section headers, counter badges | `"TOOLS"`, `"85%"` |
| `text-[11px]` | Section headers, form labels, tags (`Tag.tsx`), small actions | `"CARRIED OVER"`, `"(optional)"` |
| `text-[12px]` | Timestamps, filter chips, notes, secondary actions | `"See more"`, `"Done"` |
| `text-[13px]` | **Body default** — nav items, buttons, tabs, inputs, toasts | `"Add Task"`, tab labels |
| `text-[14px]` | Task titles, form input values, reflection body text | Task row title |
| `text-[15px]` | Empty-state headings (medium), summary card headings | `"All done for today!"` |
| `text-[17px]` | Sidebar greeting | `"Hi Matin!"` |
| `text-[18px]` | Large empty-state headings | `"No reflections here"` |
| `text-[22px]` | **Page headings & modal titles** | `"All tasks"`, `"Sprint"` |
| `text-3xl` | Empty-state decorative emoji | ✨ 🎉 ☀️ |

### Weights

| Class | When |
|-------|------|
| `font-bold` | Sidebar greeting only |
| `font-semibold` | Headings (`text-[22px]`), modal titles, counter badges, sprint labels |
| `font-medium` | Nav items, buttons, section headers, tabs, form labels, tags, toasts |
| *(normal)* | Body text, descriptions, input values |

### Line Height

| Class | When |
|-------|------|
| `leading-tight` | All headings (`text-[22px]`), modal titles |
| `leading-relaxed` | Body paragraphs, task titles, descriptions, textarea content |
| `leading-snug` | Checklist item labels |

### Section Headers

```
text-[11px] font-medium text-text3 uppercase tracking-wider
```

Sidebar variant uses `text-[10px] tracking-[0.08em]`.

---

## 3 · Spacing

### Page Padding (via AppShell)

- Mobile: `px-4 py-4`  
- Desktop: `md:px-7 md:py-6`

### Topbar

- Bottom margin: `mb-[26px]`

### Common Gaps

| Gap | Where |
|-----|-------|
| `gap-0.5` | Nav item lists, task list rows, checklist items |
| `gap-1` | Tab groups, filter pill rows |
| `gap-1.5` | Bucket/urgency button rows, tag rows |
| `gap-2` | Button groups (modal footer) |
| `gap-2.5` | Nav icon↔label, sidebar logo row |
| `gap-3` | Topbar icon↔title, task checkbox↔content, reflection card sections |
| `gap-4` | Kanban lane grid, sprint header grid |

### Card Internal Padding

| Padding | Where |
|---------|-------|
| `p-3` | Small cards (sidebar sprint mini-card) |
| `px-4 py-4` | Standard cards (sprint header, goal cards) |
| `p-5` | Large cards (journal reflection cards) |
| `p-7` | Modals |
| `px-3 py-2.5` | Form inputs, task rows, template cards |

---

## 4 · Border Radius

| Class | px ≈ | Usage |
|-------|------|-------|
| `rounded` / `4px` | 4 | Inline tag chips (`Tag.tsx`), deadline chips |
| `rounded-md` | 6 | Small icon buttons (`w-6 h-6`) |
| `rounded-lg` / `rounded-[10px]` | 8–10 | Nav items, form inputs, filter buttons, tabs, dropdowns |
| `rounded-xl` | 12 | **Primary radius** — buttons, kanban lanes, task rows, toast, sprint cards, notification banners |
| `rounded-2xl` | 16 | **Large radius** — modals, goal cards, reflection cards |
| `rounded-full` | 9999 | Counter pills, dots, progress bars, avatars, toggles |

---

## 5 · Components

### Button (`components/ui/Button.tsx`)

Base classes:
```
inline-flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-medium
px-4 py-2 transition-all duration-150 active:scale-[0.98]
disabled:opacity-50 disabled:pointer-events-none
```

| Variant | Classes |
|---------|---------|
| **primary** (default) | `bg-text text-bg hover:opacity-85` |
| **secondary** | `bg-transparent border border-border text-text2 hover:bg-surface2 hover:text-text hover:border-border2` |

Always use the `<Button>` component — **never** write raw `<button>` with manual styling.

### Tabs

```
h-[34px] text-[13px] font-medium px-3 rounded-lg transition-all duration-150
```
- Active: `bg-surface2 text-text`
- Inactive: `text-text3 hover:text-text2`

### Cards / Panels

```
bg-surface border border-border rounded-xl px-4 py-4
```
- Semi-transparent variant: `bg-surface/50` (kanban lanes)
- Hover effect: `hover:border-border2`
- Large variant: `rounded-2xl p-5` (reflection cards, goal cards)

### Badges / Counter Pills

```
bg-surface3 text-text font-semibold text-[10px] px-1.5 py-px rounded-full
```

### Tags (`components/ui/Tag.tsx`)

Inline-style component. Default: `fontSize: 11px`, `padding: 3px 8px`, `borderRadius: 4px`, `fontWeight: 500`, `letterSpacing: 0.02em`.  
Small: `fontSize: 10px`, `padding: 2px 6px`.

### Modal (`components/ui/Modal.tsx`)

- Overlay: `fixed inset-0 z-50 bg-black/70`
- Panel: `bg-surface border border-border2 rounded-2xl p-7 w-[90vw] max-w-[480px] max-h-[90vh] overflow-y-auto`
- Animate in: `fadeIn 0.15s` + `slideUp 0.2s cubic-bezier(0.4,0,0.2,1)`
- Title: `font-semibold text-[22px] leading-tight text-text mb-1`
- Subtitle: `text-[13px] text-text2 leading-relaxed mb-5`
- Footer: `flex justify-end gap-2`

### Form Inputs

```
w-full bg-surface2 border border-border rounded-lg px-3 py-2.5
text-[14px] text-text placeholder:text-text3
focus:border-border2 focus:outline-none
```
- Textarea: same + `resize-none`
- Date input: same + `style={{ colorScheme: 'dark' }}`

### Form Labels

```
text-[11px] font-medium text-text3 uppercase tracking-wider block mb-1.5
```
- Optional suffix: `<span className="text-text3/60 normal-case tracking-normal">(optional)</span>`

### Checkbox (`components/ui/Checkbox.tsx`)

- 16 × 16, `rounded-[5px]`, border `border-border2`
- Checked: `bg-text border-text`, checkmark color `#0F0F0F`

### Toast (`components/ui/Toast.tsx`)

```
bg-[#F5F5F7] text-[#0F0F0F] text-[13px] font-medium rounded-xl px-4 py-2.5
```
Animate: `toastIn 0.2s` → `toastOut 0.2s`.

### Empty States

```
flex flex-col items-center justify-center pb-[15%] text-center
```
1. Icon: `text-3xl` emoji **or** `w-12 h-12 rounded-full bg-surface2` with `text-[20px]` emoji inside
2. Heading: `text-[15px] font-medium text-text mb-1`
3. Subtext: `text-[13px] text-text3 max-w-[220px]` → `max-w-[300px]` (vary by content length)
4. CTA: `<Button>` with `mt-1` to `mt-4` spacing

---

## 6 · Interactive Patterns

### Hover

| Element | Effect |
|---------|--------|
| Cards / banners | `hover:border-border2` |
| Nav items | `hover:bg-surface2 hover:text-text` |
| Task rows | `hover:bg-white/[0.04]` |
| Text links | `text-text3 → hover:text-text2` or `text-text2 → hover:text-text` |
| Primary button | `hover:opacity-85` |
| Secondary button | `hover:bg-surface2 hover:text-text hover:border-border2` |
| Icon buttons | `hover:bg-surface2 hover:border-border2 hover:text-text` |

### Transitions

| Class | Usage |
|-------|-------|
| `transition-all duration-150` | **Default** — nearly every interactive element |
| `transition-colors duration-150` | Color-only changes |
| `transition-opacity duration-150` | Fade in/out (group-hover action buttons) |
| `transition-transform duration-150` | Chevron rotation |
| `transition-all duration-200` | Strikethrough on done tasks, toggle slide |

### Active / Press

| Class | Usage |
|-------|-------|
| `active:scale-[0.98]` | Buttons, filter pills |
| `active:scale-[0.97]` | Urgency selector buttons |

### Group Hover (reveal-on-hover)

- Task action buttons: `md:opacity-0 md:group-hover:opacity-100`
- Reflection edit: `opacity-0 group-hover:opacity-100`
- Desktop-only pattern — always visible on mobile.

---

## 7 · Layout

### Page Structure (every page)

```tsx
<div className="flex flex-col h-full overflow-hidden">
  {/* Fixed header */}
  <div className="flex-shrink-0">
    <Topbar ... />
    {/* optional: tabs, filters, banners */}
  </div>

  {/* Scrollable body */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    ...
  </div>
</div>
```

### App Shell

```
h-screen bg-bg flex overflow-hidden
```
- Sidebar: `fixed top-0 left-0 h-full w-[220px]`
- Main: `md:ml-[220px] flex-1 h-screen flex flex-col overflow-hidden`

### Kanban Lane Grid

| Lanes | Grid class |
|-------|-----------|
| 1 | `grid-cols-1` |
| 2 | `md:grid-cols-2` |
| 3 | `md:grid-cols-3` |

Gap: `gap-4`. Each lane: `flex flex-col min-h-0 bg-surface/50 rounded-xl border border-border`.

### Sprint Page Grid

```
grid grid-cols-1 md:grid-cols-3 gap-4
```
Header card `md:col-span-2`, notes card 1 col.

---

## 8 · Icons

### Library

**Lucide React** (`lucide-react`) — the only icon library.

### Default Props

| Prop | Default |
|------|---------|
| `size` | `14` – `16` for inline / button icons, `12` for chevrons, `20` for decorative |
| `strokeWidth` | `1.5` (standard), `2` for emphasis (check marks) |

### Common Icons

`ListTodo`, `CalendarDays`, `BookOpen`, `ClipboardList`, `Settings`, `ChevronRight`, `ChevronDown`, `Menu`, `Plus`, `X`, `Check`, `Pencil`, `AlertCircle`, `MoreHorizontal`, `Clock`, `Layers`, `Zap`

---

## 9 · Animations (CSS keyframes)

Defined inline via `@keyframes` in component style blocks:

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `fadeIn` | 0.15s | ease | Modal overlay |
| `slideUp` | 0.2s | `cubic-bezier(0.4,0,0.2,1)` | Modal panel |
| `checkScale` | 0.15s | ease | Checkbox check icon |
| `taskIn` | 0.2s | ease | Task row entrance |
| `toastIn` | 0.2s | ease | Toast enter (`translateY 12px → 0`) |
| `toastOut` | 0.2s | ease | Toast exit (`translateY 0 → 8px`) |

---

## 10 · Do's & Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `<Button>` component for all buttons | Write raw `<button>` with manual classes |
| Use semantic color tokens (`text-text2`) | Use raw hex colors (`text-[#AEAEB2]`) |
| Use `text-[Xpx]` arbitrary size classes | Use default Tailwind size scale (`text-sm`) |
| Use `rounded-xl` for standard cards | Mix border-radius sizes on the same surface type |
| Use `transition-all duration-150` as default | Omit transitions on interactive elements |
| Keep page structure: fixed header + scrollable body | Use `overflow-scroll` on the whole page |
| Use `<Modal>` wrapper for all dialogs | Create custom overlay/dialog markup |
| Use Lucide icons with `size={14}` default | Import icons from other libraries |
| Follow the spacing scale above | Invent new arbitrary spacing values |
