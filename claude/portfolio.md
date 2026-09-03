# Portfolio manifest

Every surface `/portfolio-critique` renders and rates. A surface is one thing a
person looks at: a marketing site, an app, a backoffice, a mobile screen, a
desktop window. Products with more than one surface get a brand-identity pass
comparing their surfaces against each other.

Regenerate with the recipe in `/portfolio-critique` Step 0. Edit this file in
`~/code/dotfiles/claude/portfolio.md`, never through the `~/.claude` symlink.

Columns:

- **Render**: a URL, or `local:<recipe>` for anything that has to boot first.
- **Genre**: what it gets ranked against. Surfaces in the same genre share a
  reference set, so the scores inside a genre are comparable.
- **Interior**: `public` means the URL renders the real product. `wall` means it
  stops at a login and the critic is judging a login screen. `?` means nobody
  has checked; Step 1 resolves it and writes the answer back here.

## Deployed

`Overflow` is `scrollWidth - clientWidth` at iPhone 14 Pro (393 CSS px), measured
2026-09-03. Zero means the page fits its viewport.

| Product | Surface | Kind | Render | Genre | Interior | Overflow | Repo |
|---|---|---|---|---|---|---|---|
| Protasca | protasca.com | marketing | https://protasca.com | saas-marketing | public | 0 | personal/protasca |
| Protasca | demo tenant | product | https://demo.protasca.com | restaurant-site | public | 0 | personal/protasca |
| Protasca | admin | backoffice | https://admin.protasca.com | admin-console | wall | 0 | personal/protasca |
| MyAgentWebsite | myagentwebsite.com | marketing | https://myagentwebsite.com | saas-marketing | public | **141px** | personal/real_estate_scraper |
| MyAgentWebsite | backoffice | backoffice | https://app.myagentwebsite.com | admin-console | wall | 0 | personal/real_estate_scraper |
| MyAgentWebsite | SGG tenant | product | https://sofiagalvaogroup.com | real-estate-site | public | 0 | personal/real_estate_scraper |
| Basketball Stats | basketballstatsapp.com | product | https://www.basketballstatsapp.com | sports-app | public | 0 | personal/basketball-stats-app |
| Basketball Video Analyzer | website | marketing | https://basketballvideoanalyzer.com | desktop-app-marketing | public | **17px** | personal/basketball-video-analyzer |
| Basketball Video Analyzer | desktop app | desktop | local:electron | desktop-app | n/a | n/a | personal/basketball-video-analyzer/app |
| Bitola | bitola.app | marketing | https://bitola.app | car-marketplace-marketing | public | 0 | personal/bitola/landing |
| Bitola | app | product | https://app.bitola.app | car-marketplace-app | public | **128px** | personal/bitola |
| Delivered Photos | delivered.photos | marketing | https://delivered.photos | saas-marketing | public | 0 | personal/delivered-photos |
| Delivered Photos | app | product | https://app.delivered.photos | gallery-app | wall | 0 | personal/delivered-photos |
| Cadence Studio | cadence-studio | product | https://cadence-studio-theta.vercel.app | writing-tool | public | 0 | personal/cadence-studio |
| KidShare | kidshare.app | product | https://kidshare.app | family-app | public | 0 | personal/kidshare |
| Therapy Resources | therapyresources.app | product | https://therapyresources.app | ai-tool | public | 0 | personal/therapy-resources |
| CoinSprout | coin-sprout.com | product | https://www.coin-sprout.com | fintech-app | public | 0 | personal/finance_tracker |
| Analytics Hub | analytics-hub | product | https://analytics-hub-phi.vercel.app | dashboard | public | 0 | personal/analytics-hub |
| CADIn | clinic-management | product | https://clinic-management-phi.vercel.app | booking-app | wall | 0 | personal/clinic-management |
| Vasco KF | vascokf.com | portfolio | https://www.vascokf.com | personal-site | public | 0 | personal/cv-page |
| Francisco Catarro | kiko-personal | portfolio | https://kiko-personal.vercel.app | personal-site | public | 0 | personal/kiko-personal |
| STARS Study | cbsa-study | product | https://cbsa-study.vercel.app | research-tool | did not render | 0 | none linked |
| SINAIA Suite | sinaia-demo | product | https://sinaia-demo.vercel.app | forms-app | wall | 0 | ~/code/sinaia-suite-formularios |

## Boots locally

| Product | Surface | Kind | Render | Genre | Repo |
|---|---|---|---|---|---|
| Loadwell | mobile app | mobile | local:expo | mobile-app | personal/loadwell |
| Agents for Agents | web | product | local:rails | ai-tool | personal/agents-for-agents |
| FPB Calendar | web | product | local:rails | sports-app | personal/fpb-calendar |
| D&D Project | web | product | local:node | game-tool | personal/dnd-project |
| D&D Riders | web | product | local:node | game-tool | personal/dnd-riders |
| Marketing | web | marketing | local:node | saas-marketing | personal/marketing |

## Skipped

| Repo | Why |
|---|---|
| personal/kauredo | README only, nothing to render |
| personal/protasca-ship | Working copy of Protasca, same surfaces |
| personal/basketball-stats-app-full-court | Working copy of Basketball Stats, same surfaces |
| personal/agents-for-agents-drafter | Working copy of Agents for Agents |
| personal/basketball-video-analyzer/worker | Background job runner, no interface |
| personal/protasca/api, real_estate_scraper/api | APIs, no interface |
