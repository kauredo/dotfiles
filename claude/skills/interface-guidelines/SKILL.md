---
name: interface-guidelines
description: Accessibility and interaction rules for building UIs. Use when building forms, buttons, navigation, animations, or any interactive elements.
---

# Interface Guidelines

Concise rules for building accessible, fast, delightful UIs. Use MUST/SHOULD/NEVER to guide decisions.

## Interactions

### Keyboard
- MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- MUST: Visible focus rings (`:focus-visible`)
- MUST: Manage focus (trap, move, return) per APG patterns
- NEVER: `outline: none` without visible focus replacement

### Targets & Input
- MUST: Hit target ≥24px (mobile ≥44px)
- MUST: Mobile `<input>` font-size ≥16px to prevent iOS zoom
- NEVER: Disable browser zoom
- MUST: `touch-action: manipulation` to prevent double-tap zoom

### Forms
- MUST: Hydration-safe inputs (no lost focus/value)
- NEVER: Block paste in inputs
- MUST: Loading buttons show spinner and keep original label
- MUST: Enter submits focused input; in textarea, ⌘/Ctrl+Enter submits
- MUST: Errors inline next to fields; on submit, focus first error
- MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
- MUST: Compatible with password managers & 2FA
- NEVER: Autofocus on touch devices (it opens the keyboard and scrolls the page)
- SHOULD: Prefill fields from what the app already knows
- MUST: No dead zone between a checkbox/radio and its label; the label is part of the hit target
- SHOULD: Show a button's keyboard shortcut in its tooltip
- SHOULD: Validate on blur, not on each keystroke. CSS `:user-invalid` (see `good-css`) does this without JS
- MUST: Disable submit while a request is in flight

### State & Navigation
- MUST: URL reflects state (deep-link filters/tabs/pagination)
- MUST: Back/Forward restores scroll position
- MUST: Links use `<a>` for navigation (support Cmd/Ctrl/middle-click)
- NEVER: Use `<div onClick>` for navigation

### Feedback
- SHOULD: Optimistic UI; reconcile on response
- MUST: Confirm destructive actions or provide Undo
- MUST: Use polite `aria-live` for toasts/inline validation

### Overlays & Panels
- SHOULD: Once one tooltip is open, neighbouring tooltips open with no delay
- SHOULD: Submenus keep a safe triangle so diagonal pointer paths don't close them
- MUST: Hidden panels get `inert` so focus and assistive tech skip them
- MUST: Time-limited UI (auto-dismiss toasts, timers) pauses on `visibilitychange`

## Animation

- MUST: Honor `prefers-reduced-motion`
- MUST: Animate `transform` and `opacity`. Animate size or position only through a `good-css` technique (accordion height via `interpolate-size`, a sliding indicator)
- NEVER: `transition: all`, list properties explicitly
- SHOULD: Use ease-out-quart/quint/expo for natural deceleration
- MUST: Animations interruptible and input-driven. `apple-design` has the how: springs, velocity handoff, momentum projection, rubber-banding
- MUST: On a theme switch, suppress per-element transitions so every color flips together. When the brightness jump is large (dark to light), add one whole-page fade (`apple-design` covers brightness jumps)
- SHOULD: Paired elements (trigger and popover, icon and label) share one easing and duration
- SHOULD: framer-motion `AnimatePresence mode="popLayout"` when exits must not shift surrounding layout

## Component APIs

React components.

- SHOULD: Compound components for multi-part widgets (`Tabs.Root`, `Tabs.Trigger`, `Tabs.Panel`)
- SHOULD: Explicit `variant`/`size` props over piles of booleans
- SHOULD: Take `children` over a prop per slot
- MUST: Accept `className` as an escape hatch and merge it last
- SHOULD: React 19 passes `ref` as a plain prop; skip `forwardRef`
- MUST: Inputs work both controlled (`value`/`onChange`) and uncontrolled (`defaultValue`)
- SHOULD: Context providers expose `state`, `actions` and `meta`
- SHOULD: Extract an abstraction only after 2 or 3 real copies
- MUST: `type="button"` on every non-submit `<button>`

## Layout

- SHOULD: Optical alignment; adjust ±1px when perception beats geometry
- MUST: Verify mobile, laptop, ultra-wide
- MUST: Respect safe areas (`env(safe-area-inset-*)`)
- MUST: Avoid unwanted scrollbars

## Content & Accessibility

- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- MUST: `font-variant-numeric: tabular-nums` for number comparisons
- MUST: Redundant status cues (not color-only)
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics before ARIA

## Performance

- MUST: Track and minimize re-renders
- MUST: Mutations target <500ms
- MUST: Virtualize large lists (>50 items)
- MUST: Preload above-fold images; lazy-load the rest
- MUST: Prevent CLS (explicit image dimensions)

## Dark Mode & Theming

- MUST: `color-scheme: dark` on `<html>` for dark themes
- SHOULD: `<meta name="theme-color">` matches page background
- MUST: Native `<select>`: explicit background-color and color

## Design

- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Tint borders/shadows/text toward bg hue
- MUST: Meet contrast, prefer APCA over WCAG 2
- MUST: Increase contrast on hover/active/focus
