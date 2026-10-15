---
name: design-polish
description: Perform a meticulous final pass on UI code. Use when polishing components, doing a final review before shipping, or when asked to polish or refine the UI.
---

# Design Polish

Perform a meticulous final pass to catch all the small details that separate good work from great work.

For CSS technique, use `good-css`. For a full audit, critique or redesign, use `impeccable`; this skill is the last-mile checklist.

## Pre-Polish Assessment

1. **Is it functionally complete?** Don't polish incomplete work.
2. **What's the quality bar?** MVP vs flagship feature?
3. **When does it ship?** How much time for polish?

## Polish Systematically

### Visual Alignment & Spacing
- Pixel-perfect alignment to grid
- Consistent spacing using scale (no random 13px gaps)
- Optical alignment (adjust for visual weight)
- Responsive consistency at all breakpoints

### Typography
- Hierarchy consistency (same elements use same sizes/weights)
- Line length: 45-75 characters for body text
- No widows & orphans
- Font loading: no FOUT/FOIT flashes

### Color & Contrast
- All text meets WCAG contrast standards
- Consistent token usage (no hard-coded colors)
- Works in all theme variants
- Accessible focus indicators
- Tinted neutrals (no pure gray)
- No gray text on colored backgrounds

### Interaction States

Every interactive element needs:
- Default (resting)
- Hover (subtle feedback)
- Focus (keyboard indicator)
- Active (click/tap feedback)
- Disabled (clearly non-interactive)
- Loading (async feedback)
- Error (validation state)

### Micro-interactions
Check every transition and animation against the Animation rules in `interface-guidelines`.

### Content & Copy
- Consistent terminology
- Consistent capitalization
- No typos
- Punctuation consistency

### Icons & Images
- Consistent icon style and sizing
- Proper alignment with text
- Alt text on all images
- No layout shift on load
- Retina support (2x assets)

### Forms
- All inputs labeled
- Clear required indicators
- Helpful error messages
- Logical tab order
- Validation timing follows the Forms rules in `interface-guidelines`

### Edge Cases
- Loading states for all async actions
- Helpful empty states
- Clear error messages with recovery
- Handles long content gracefully
- Handles missing data gracefully

## Polish Checklist

- [ ] Visual alignment perfect at all breakpoints
- [ ] Spacing uses design tokens consistently
- [ ] Typography hierarchy consistent
- [ ] All interactive states implemented
- [ ] All transitions smooth (60fps)
- [ ] Copy is consistent and polished
- [ ] Icons consistent and properly sized
- [ ] All forms properly labeled
- [ ] Error states are helpful
- [ ] Loading states are clear
- [ ] Empty states are welcoming
- [ ] Hit targets meet `interface-guidelines` (24px desktop, 44px mobile)
- [ ] Contrast ratios meet WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] No console errors
- [ ] No layout shift on load
- [ ] Respects reduced motion preference

## Final Verification

- **Use it yourself**: Actually interact with the feature
- **Test on real devices**: Not just DevTools
- **Check all states**: Don't just test happy path

**NEVER**:
- Polish before functionally complete
- Introduce bugs while polishing
- Perfect one thing while leaving others rough
