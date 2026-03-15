# Atomity Frontend Challenge

## Live Demo
🔗 atomity-challenge-nu.vercel.app

## GitHub Repository
🔗 https://github.com/SahilArate/atomity-challenge

---

## Which Feature I Chose and Why

I went with **Option B** — the multi-cloud infrastructure topology map (0:45–0:55).

Honestly, the moment I saw it I knew it was the more interesting problem. Option A was a cost breakdown table with bar charts — useful, but I've seen that pattern a hundred times. Option B had this network diagram with cloud providers connected to a central resource view, and I immediately started thinking about how the connection lines could animate, how the nodes could spring into place, how clicking a provider could make the whole chart respond.

The topology concept also maps directly to how engineers actually think about multi-cloud infrastructure — not as rows in a table, but as a network of interconnected systems. That mental model made the design decisions feel natural rather than forced.

So I picked Option B because it gave me more to work with creatively, and because I thought I could build something that felt genuinely useful — not just visually interesting.

---

## Approach to Animation

My guiding principle was: **every animation should have a reason to exist.**

If something moves, it should either help the user understand something, confirm an interaction, or guide their attention. Nothing moves just because it can.

Here is how that played out in practice:

**Provider nodes spring in on scroll** — When the topology section enters the viewport, each node pops in with spring physics, staggered by index. The stagger means your eye naturally moves across the layout rather than everything hitting at once. I used `stiffness: 90, damping: 14` which gives a natural feel without excessive bounce.

**Connection lines draw themselves** — The dotted lines between nodes and the central chart animate from `scaleX: 0` to `scaleX: 1` when they enter the viewport. This mimics the feeling of a connection being established. A small pulse dot then travels along each line on a loop — subtle enough not to be distracting, but it keeps the diagram feeling alive.

**Number count-up on the bars** — The cost values in the resource chart count up from zero using `requestAnimationFrame` with ease-out cubic easing. This draws your attention to the numbers as they settle, making the data feel like it just arrived rather than being static.

**Node click interaction** — Selecting a provider node immediately updates the central chart to show only that provider's resources. The transition is fast and direct — no delay, no loading spinner. The selected node gets a green border and elevated shadow, the chart header updates, and a savings percentage slides in at the bottom. The whole interaction feels like cause and effect.

**`prefers-reduced-motion` throughout** — Every single animated component checks `useReducedMotion()` from Framer Motion. If someone has reduced motion enabled in their OS settings, all animations are disabled and content appears instantly. This was non-negotiable for me.

---

## How I Structured Tokens and Styles

I used a two-layer token system.

**Layer 1 is CSS custom properties** defined in `globals.css`. These are the actual values — hex colors, shadow definitions, and so on. Dark mode is handled here by redefining the same variable names under `[data-theme="dark"]`:
```css
:root {
  --color-bg-primary: #f4f5f7;
  --color-accent-success: #22c55e;
  --color-border-accent: color-mix(in srgb, #22c55e 40%, transparent);
}

[data-theme="dark"] {
  --color-bg-primary: #0a0b0d;
  --color-accent-success: #22c55e;
}
```

**Layer 2 is a TypeScript token object** in `src/tokens/index.ts`. This wraps the CSS variable references so components import from tokens rather than writing raw `var(--...)` strings everywhere:
```ts
export const tokens = {
  colors: {
    accentSuccess: "var(--color-accent-success)",
  },
  spacing: { sm: "0.5rem", md: "1rem" },
  radius: { lg: "1.25rem" },
  font: { sm: "clamp(0.75rem, 1.5vw, 0.875rem)" },
} as const;
```

The result is that no component file contains a single hardcoded hex value. If I want to change the success color across the entire app, I change one line in `globals.css`.

---

## How I Handled Data Fetching and Caching

Data comes from the DummyJSON public API:
```
GET https://dummyjson.com/products?limit=4&select=title,price,stock,rating,category
```

I fetch 4 products and transform them in `src/lib/dataMapper.ts` into cloud topology data. The mapping works like this:
- `price` → resource costs (CPU takes 40%, RAM takes 25%, etc.)
- `stock` → pod count running on the provider
- `rating` (0–5) → health status and savings percentage

This keeps the data layer completely separate from the UI. If Atomity ever wanted to swap in a real Kubernetes metrics API, only `dataMapper.ts` would need to change.

For caching I used **TanStack Query** because it is the standard for async state management in modern React. My configuration:
```ts
staleTime: 5 * 60 * 1000   // data stays fresh for 5 minutes
gcTime: 10 * 60 * 1000     // cache persists for 10 minutes after last use
retry: 2                    // retries twice on failure
refetchOnWindowFocus: false // no redundant requests on tab switch
```

On first visit the network tab shows exactly one request. On every subsequent render or navigation the data is served instantly from cache. The loading skeleton shows on first fetch, and the error state with a retry button shows if the request fails after both retries.

---

## Libraries Used and Why

| Library | Why I chose it |
|---|---|
| **Next.js 16** | App Router gives server components, built-in fetch caching, and clean file-based routing |
| **TypeScript** | Strict typing caught several bugs during development and makes the codebase much easier to reason about |
| **Framer Motion** | Best animation library for React — spring physics feel natural, `useReducedMotion` is built in, and the `variants` API keeps animation logic readable |
| **TanStack Query v5** | Industry standard for async state — handles loading, error, caching, and background refresh with minimal boilerplate |
| **Tailwind CSS v4** | Used for utility classes and layout — integrates cleanly with CSS custom properties |

No pre-built component libraries were used. Every UI element — Badge, ResourceBar, ProviderNode, ConnectionLine, ResourceChart — was built from scratch.

---

## Modern CSS Features Used

I tried to reach for modern CSS where it genuinely made sense rather than forcing it in.

**`color-mix()`** — Used for muted accent backgrounds throughout. Instead of hardcoding `rgba(34, 197, 94, 0.12)` I write `color-mix(in srgb, #22c55e 12%, transparent)`. This means the muted color always stays proportional to the base accent even if the accent changes.

**`clamp()` for fluid typography** — Font sizes scale smoothly between viewport sizes without any media queries. `clamp(0.75rem, 1.5vw, 0.875rem)` means text is never too small on mobile or too large on desktop.

**CSS nesting** — Component-level styles in `globals.css` use native CSS nesting. The `.provider-node` block nests its hover, focus, and status variants inside itself — readable and co-located.

**`@container` queries** — Node cards use `container-type: inline-size` so they respond to their own width rather than the viewport. This means the same card component works correctly whether it is in a wide desktop grid or a narrow mobile column.

**`:has()` selector** — When any provider node has focus, sibling nodes dim using pure CSS with no JavaScript. This is handled entirely in `globals.css`.

**Logical properties** — `padding-inline`, `max-inline-size`, and `margin-inline` used throughout the section wrapper for better internationalisation support.

---

## Project Structure
```
src/
  app/
    globals.css          CSS variables, tokens, modern CSS, dark mode
    layout.tsx           Root layout, inline theme script (no flash)
    page.tsx             Entry point, QueryClientProvider wrapper
  tokens/
    index.ts             TypeScript token object
  types/
    index.ts             All shared TypeScript interfaces
  lib/
    dataMapper.ts        API response → topology data transformation
  hooks/
    useCloudData.ts      TanStack Query fetch and cache hook
  components/
    FeatureSection.tsx   Top-level section, nav, loading and error states
    ui/
      Badge.tsx          Status badge with variant system
      ResourceBar.tsx    Animated bar with count-up and IntersectionObserver
      ThemeToggle.tsx    Dark/light toggle using useSyncExternalStore
    chart/
      ResourceChart.tsx  Central resource breakdown chart
    topology/
      ConnectionLine.tsx Animated dotted line with traveling pulse dot
      ProviderNode.tsx   Cloud provider card, SVG icons, pod grid
      TopologyMap.tsx    Full layout, responsive breakpoints, node selection
```

---

## Tradeoffs and Decisions

**CSS Grid topology vs SVG canvas** — I considered drawing the entire topology on an SVG canvas with calculated path coordinates for diagonal connection lines, like a real network diagram tool. I chose CSS Grid instead because it gives better responsive behaviour and accessibility out of the box. The tradeoff is that connections are horizontal rather than diagonal.

**DummyJSON instead of a real cloud API** — A real Kubernetes or cloud metrics API would need authentication, CORS setup, and paid access. DummyJSON is publicly accessible and consistent, which lets me demonstrate the async state handling and data transformation patterns the challenge asked for. The mapper layer means switching to a real API is a one-file change.

**`useSyncExternalStore` for theme** — I originally tried managing theme with `useState` and `useEffect` but kept hitting ESLint warnings about setState in effects. The correct React pattern for reading external DOM state is `useSyncExternalStore` with a `MutationObserver`. It handles server and client rendering correctly with no warnings.

**Inline theme script in `<head>`** — Theme is applied via a small inline script that runs before the first paint. This prevents any flash of wrong theme on load — a common problem with localStorage-based theming in server-rendered apps.

---

## What I Would Improve With More Time

**Real SVG connection lines** — Diagonal paths calculated from actual DOM element positions, updating on resize with a `ResizeObserver`. This would make the topology feel much more like a real infrastructure diagram.

**Animated data refresh** — A visible countdown showing when data will next refresh, with a smooth transition when new data arrives rather than a hard swap.

**Node drill-down** — Clicking a provider could expand into a namespace view, matching the drill-down behaviour shown earlier in the Atomity product video (Option A at 0:35).

**Unit tests** — The `dataMapper.ts` transformation logic is pure and deterministic, making it straightforward to test. I would add Jest tests for the mapping functions to make sure the data transformation stays correct as the code evolves.

**Performance profiling** — I would run Lighthouse and React DevTools Profiler to identify any unnecessary re-renders, particularly around the `useScreenSize` hook which fires on every window resize event.