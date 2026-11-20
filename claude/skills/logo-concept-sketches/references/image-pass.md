# Image pass

A sixth sketch agent that prompts image models (Recraft v3, Ideogram v3) through the fal MCP server. Image models draw rough marks with an instinct for overall form that hand-typed SVG lacks; their output is raw material, rebuilt as vector in step 4 and never shipped as drawn. The pass sends the brand name and brief to fal, a paid outside service, so the user approves it first.

## Setup, before the agent starts

- **Auto-open.** The server (`fal-image-video-mcp`) opens every result in Preview unless its env carries `AUTOOPEN=false`. Check the `fal-ai` server's `env` in `~/.claude.json` (and in `$CLAUDE_CONFIG_DIR/.claude.json` when that is set). When the key is missing, add it and have the user reconnect the server in `/mcp`: the server reads its env only at start. On SINAIA a pass without it opened dozens of Preview windows and was stopped midway.
- **File names.** Results land in `~/Downloads` (or the server's `DOWNLOAD_PATH`) as `fal_*.jpg` whatever the format: Recraft sends WebP, or SVG in its vector styles, and Preview refuses both under that name. Each tool names its files differently (`fal_fal_ai_recraft_v3_…`, `fal_recraft_v3_…`, `fal_ideogram_v3_…`). `scripts/collect-images.mjs` moves every one of them, names each by its real type, converts WebP to PNG, and prints the count per model.
- **Calling fal directly.** A Node script can call `fal.subscribe("fal-ai/ideogram/v3", { input: { prompt, image_size: "square_hd", num_images: 2 } })` from `@fal-ai/client` (it ships inside the MCP package in the npx cache), reading the key from the server's env without printing it. Nothing auto-opens and the files keep their real type; `data.images[].url` holds the results. When calls start returning `Forbidden` partway through a batch after earlier ones succeeded, the fal account has most likely run out of credit: stop, tell the user, and go on with what arrived.
- **Settings and cost.** Pass `rendering_speed: "TURBO"` ($0.03 an image; the default BALANCED is $0.06, QUALITY $0.09) and `enable_prompt_expansion: false`: Ideogram's MagicPrompt is on by default and rewrites the prompt. On SINAIA the same six prompts with it on came back with glossy 3D spheres, plinths and horizon lines; with it off all 58 images were flat solid marks, every one the letter asked for. The grey paper ground stayed either way: that is Ideogram's own look. Recraft v3 is $0.04 an image, $0.08 in a vector style. The whole SINAIA image pass (about 120 images) cost roughly $7; the Opus sketch agents and viewers cost far more.
- **The count is the check.** The agent reports how many images it generated per model; the collect's counts must match. On SINAIA a collect that matched only Recraft's file names left all 64 Ideogram images in Downloads, the strongest of the pass among them, and the user found them there.

## Prompting

On SINAIA the first 30 prompts described the brand and its story, and came back as badges, roundels and illustrated scenes (a hiker on a peak, a crow on a branch, a lighthouse). The last 14 asked for one flat shape and were usable. Write every prompt in that shape:

```
A single flat solid black logo mark centred on white, built from at most three shapes: <the idea in one line>. Minimal geometric identity mark, no background, no border, no scene, no text other than the letters <letters>.
```

One idea per prompt; vary the idea, never just the adjectives. **Ideogram v3 carries the pass**: on SINAIA its 64 images held the run's strongest marks (a three-curve fan unfolding over a peak, an S built from two ball terminals, real-weight ligatures), while most of Recraft's were badges and scenes. Spend about three quarters of the budget on Ideogram and use Recraft for pure silhouettes. Ideogram draws on grey paper whatever the prompt or settings say, so tell the viewers to read those cells' drawn and upside-down views hardest.

## Agent prompt

```
You are a logo designer using image models to produce rough logo marks, as raw material a designer will pick from and rebuild as vector. Read <loop dir>/brief.md first (its shell rules are mandatory), then <skill dir>/references/image-pass.md for the prompt shape that works.

Load the fal tools with ToolSearch ("fal recraft ideogram") and check each schema before calling it. Generate 40 to 60 images, about three quarters on Ideogram v3 and the rest on Recraft v3, one idea per prompt, built from the brief's kept words and seeds. Seed: <hex>; use it to vary the order you try ideas in.

Count your successful generations per model as you go. Then run: node <skill dir>/scripts/collect-images.mjs <loop dir>/imagegen --match=<today's date, YYYY-MM-DD>
Its per-model counts must equal yours; find any missing files before going on. Render <loop dir>/imagegen/all-cells.json with sheet.mjs and render.mjs to <loop dir>/imagegen/all.png (the full contact sheet the user also sees), look at it, and keep the best 20: marks a strong identity designer could have drawn, simple enough for 24px, with a second reading in the silhouette. Write the keepers to <loop dir>/imagegen/cells.json, each with a label naming its idea, and write prompts.md: the model and exact prompt behind each keeper.

Finish with: your generation counts per model beside the collect's, the paths of all.png and the keepers' sheet, your 5 strongest cells with one line each on the double reading, and any existing logo a keeper resembles.
```
