# Portfolio critique, 2026-09-03

22 deployed surfaces across 16 products. Every surface rendered at 1440x900 and
at 393pt on an iPhone 14 Pro profile, then judged by a fresh opus critic that saw
the screenshots and the rubric and nothing else: no code, no repo, no reasoning
about why anything was built the way it was. A separate critic ranked all 21
desktop shots blind, with no product names, no genres, and no scores.

**The bar was self-supplied.** Nobody handed the critics reference images, so each
ranked against its own memory of real products in the same genre. That is softer
than ranking against pasted references. Read the individual scores as a band.

**The individual scores barely discriminate.** Nineteen of 21 landed on 5 or 6.
That spread is noise, and it is the expected result when 21 separate critics each
invent their own bar. The blind ranking is the number to trust, because every
surface faced the same judge in the same sitting.

## Read this first: the mobile bug that was not there

The first pass reported broken mobile layouts on all 22 surfaces: text cut
mid-word, right padding gone, CTAs running off the edge. It was wrong.

Chrome's `--screenshot` flag never applies a page's meta viewport tag, so
`--window-size=390,844` lays the page out at desktop width and crops the result
at 390px. Every responsive site looks broken. Running stripe.com through the
identical recipe produced the identical defect, which is what exposed it.

Re-measured with Playwright device emulation, two different things, because they
are not the same defect:

**Document overflow** (`scrollWidth` vs `clientWidth`, the page scrolls sideways):

| Surface | Overflow |
|---|---|
| myagentwebsite.com | 141px |
| app.bitola.app | 128px |
| basketballvideoanalyzer.com | 17px |
| The other 19 | 0 |

**Element clipping** (an element's right edge past the viewport while the document
still fits, so nothing scrolls and the content is simply cut):

| Surface | What is cut |
|---|---|
| myagentwebsite.com | Features, Pricing, Case Studies, Help, all 117px |
| sofiagalvaogroup.com | A listing card and its image, 336px |
| therapyresources.app | "Get started free", 29px |
| delivered.photos | "Get started", 24px |
| The other 18 | clean |

Five surfaces with a real mobile defect, not 22. The control was clean on both
checks. Every score below comes from a second critic pass against corrected
screenshots. The Playwright recipe and a standing "shoot one control surface per
run" rule are now in `/portfolio-critique` Step 1.

## Leaderboard

Ordered by the blind ranking. `Critic` is the per-surface score, `Brand` is the
per-product score from the cross-surface pass.

| # | Product | Surface | Critic | Brand | Worst tell |
|---|---|---|---|---|---|
| 1 | Cadence Studio | app | 6 | — | Eyebrow restates the headline under it |
| 2 | Bitola | landing | 6 | 6 | White headline panel dropped on the render |
| 3 | MyAgentWebsite | backoffice login | 6 | 8 | `01 /` numbering a one-step form |
| 4 | MyAgentWebsite | marketing | 6 | 8 | Product screenshot too small to read |
| 5 | Protasca | demo tenant | 6 | 5 | Flat brown wash over the food photo |
| 6 | Vasco KF | portfolio | 6 | — | Invented apparatus: VOL. VI, Fig. 01, 38°N |
| 7 | Protasca | marketing | 6.5 | 5 | Em dash at 80px in the headline |
| 8 | Basketball Video Analyzer | website | 5 | — | Empty right half of the hero |
| 9 | Therapy Resources | app | 5 | — | Browser mockup framing an empty product |
| 10 | Delivered Photos | marketing | 5 | 4 | A photographer's site with no photograph |
| 11 | KidShare | landing | 6 | — | Blob people and skeleton bars as illustration |
| 12 | Basketball Stats | app | 6 | — | Accent colour used six times in one viewport |
| 13 | Francisco Catarro | portfolio | 6 | — | Six unlabelled icons; piano geometry is wrong |
| 14 | MyAgentWebsite | SGG tenant | 6 | 8 | Desktop and mobile disagree on the theme |
| 15 | CoinSprout | landing | 6 | — | Three brand metaphors: pig, sprout, oak |
| 16 | Delivered Photos | app login | 6 | 4 | Unmodified Tailwind `stone` ramp, no accent |
| 17 | Protasca | admin login | 6 | 5 | Lucide icon in a tinted squircle |
| 18 | Bitola | app | 6 | 6 | One 1px border for every role on the page |
| 19 | CADIn | clinic login | 5 | — | Multicolour logo against a navy default form |
| 20 | SINAIA Suite | login | 5 | — | Wordmark is the body font with tracking on it |
| 21 | Analytics Hub | dashboard | 5 | — | Skeletons at 1.05:1 against the page |

**Did not render:** STARS Study (`cbsa-study.vercel.app`) never left its loading
spinner across three attempts at up to 30s of virtual time.

**Not attempted this run:** the Basketball Video Analyzer Electron app, the
Loadwell Expo app, and the six local-only projects in the manifest.

## What the blind critic saw

Its own words, not knowing whose work any of it was:

> The top surfaces make a small number of decisions and then apply them
> everywhere. The bottom surfaces have no decisions in them at all, so the
> browser makes the decisions instead, which is why S10, S18 and S21 all end up
> with the same native select box and the same centered card.

That is the whole finding. The bottom of this leaderboard is not bad taste. It is
absent taste: screens where nobody chose, so Tailwind and the OS chose.

It also caught one thing no per-surface critic did, and it matters because the
element is the entire idea of that page: on the musician's site, the piano's
black keys do not align to the white keys underneath them.

## Recurring habits

Counted across all 21 ranked surfaces.

**Framework defaults left unstyled** (5 surfaces: Bitola app, CADIn, SINAIA,
Protasca admin, delivered.photos app). Native `<select>` boxes with the OS
chevron sitting beside hand-styled buttons, centered cards on a tinted ground,
Tailwind `stone`/`gray` ramps used unmodified. This is the single habit
separating the bottom five from the top five, and it is the cheapest to fix.

**Hero occupies the left half, nothing in the right** (7 surfaces: Protasca
marketing at 29%, BVA at 45%, delivered.photos at 49%, Cadence at 37%, plus
KidShare, Therapy Resources, SGG). Every critic independently asked for the same
filler: a real product screenshot. Four of these products sell something visual
and show none of it above the fold.

**Eyebrow restating the heading below it** (6 surfaces). The most common single
tell in the set.

**Cream ground, serif display, sans body, one warm accent** (4 surfaces: Protasca
marketing, Cadence, KidShare, Therapy Resources). Each is defensible alone. Four
in one portfolio is a preset.

**Cookie banner covering live content** (4 surfaces). myagentwebsite.com buries
its own feature row; Basketball Stats overlaps its primary CTA on mobile; also
Therapy Resources and CoinSprout.

**Login screens with no password recovery** (3 of 5: Protasca admin,
MyAgentWebsite backoffice, SINAIA). A locked-out user has no next step.

**Contrast failures on real controls** (5 surfaces). Cadence's email placeholder
at 2.01:1, Analytics Hub's skeletons at 1.05:1, Protasca admin's input borders
under 1.5:1, BVA's CTA label at 2.84:1, Bitola app's placeholders.

## Copy

Every critic reached the same verdict independently: on all 21 surfaces the copy
is still in the form a model produced it. Not one has been rewritten by a person.
Several critics said this is the fastest change available and the one that most
decides whether a page reads as considered.

The recurring shapes: em dashes in headlines, the "not X, Y" antithesis,
rule-of-three feature lists, and aphoristic closers ("That's it.", "Ready in
minutes, not weeks.").

Two Portuguese defects that are bugs rather than taste:

- **Protasca admin mixes locales.** "Gerencie o seu restaurante" is Brazilian;
  the label "Palavra-passe" directly below it is European. Five words apart.
- **MyAgentWebsite backoffice mixes register.** The left panel says *tu* ("Gere os
  **teus** imóveis"), the right panel says *você* ("**Inicie** sessão"). Standardise
  on the formal, which means "Gere" becomes "Gira".

The strings the critics said to keep, because a person clearly wrote them:

- Cadence: "Private beta. Bring your own API keys; nothing publishes without your
  say-so."
- Basketball Stats: "Analytics stay off unless you accept."
- BVA: "I got tired of scrubbing through game tapes in VLC." Two critics said this
  should be the headline instead of buried in the sub.
- Bitola: the Negócio scale, "Ótimo negócio" through "Muito acima".
- delivered.photos: "48 photos · 12 favorited", the only string on the page that
  says what the product does.

## Brand verdicts

**MyAgentWebsite, 8/10.** The strongest in the portfolio. Marketing and backoffice
share one token set, one type system, and the same `01 /` eyebrow device applied
verbatim across both. The critic ruled that SGG looking nothing like the parent is
correct, because white-labelling is the product. Deductions are the language split
(English marketing to Portuguese-only admin), the backoffice never printing the
product name, and the logo mark changing colour between breakpoints.

**Bitola, 6/10.** One wordmark, one cream ground, one typeface, radius-0
throughout. Then the deal-colour system dies at the door: the landing sells green
for below-market and red for above, and the app draws all five Negócio chips in
identical grey while spending its only green on source-freshness dots. A visitor
who learned green means "good deal" reads those dots as two great deals.

**Protasca, 5/10.** Three accent values for one role (#9A4A2E marketing, #C2613D
admin, #D4794E demo), three radius systems, three button philosophies. On the
generated site the primary action is not a button at all, just "Ver ementa →" as
bare text. Marketing and admin alone would score 7.5.

**Delivered Photos, 4/10.** The lowest. Marketing establishes a dark, warm,
serif-led room; the login is a light-mode default with no serif and no
photograph. Ground colour, headline face, button polarity and copy voice all
invert at the handoff, and the logo is doing all the work of connecting them. The
critic's fix is a token swap plus one font import, which it estimated would move
the score to 8.

## Where to start

The blind ranking's bottom five are all logins and one empty dashboard, and four
of the five share one cause: nobody styled the form controls. That is a single
afternoon across four repos, and it would lift the bottom of the portfolio more
than any amount of work on the top.

After that, in order of return:

1. **Fix the five real mobile defects** listed at the top. Four are a clipped
   header CTA or nav.
2. **Put the product in the empty hero half** on the seven surfaces that have one.
   Four of those products sell something visual.
3. **Rewrite the copy.** Twenty-one surfaces, none touched since generation.
   Start with the headlines, and start with the ones that already contain a good
   line buried in the sub, which is BVA and delivered.photos.
4. **Unify the Delivered Photos and Protasca button primitives**, which are the
   two worst brand scores and the two cheapest to repair.
