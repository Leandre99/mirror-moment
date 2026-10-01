# Mirror Moment: an AI skin coach for the moment you're in front of the mirror

People don't wonder about their skin in the abstract. They wonder right after a breakout, right before a purchase, or when they're deciding whether a product is working. Mirror Moment meets that moment:

1. **Pick your moment**: "Just broke out", "About to buy", "Is it working?" or a general check-in.
2. **Selfie**: YouCam **HD Skin Analysis** scores 12 concerns (acne, redness, oiliness, moisture, pores, texture, radiance, dark spots, wrinkles, dark circles, eye bags, firmness), with detection-mask overlays on your face.
3. **Agent plan**: the coach turns the scores and your moment into a verdict, a focused AM/PM routine, ingredients to avoid for now, and a ranked product shortlist.
4. **Shop smart**: paste any ingredient list or product name to get a buy / okay / skip verdict for *your* skin today.
5. **Coach chat**: ask things like "Can I use retinol right now?" The coach is a tool-calling agent (`get_scan`, `check_product`, `search_catalog`, `compare_progress`) when an LLM key is set, and runs on rules otherwise.
6. **Progress**: scans are saved on your device. Re-scan and get an "is it working?" verdict and trend chart.
7. **Shade match**: YouCam **Skin Tone Analysis** picks your foundation and lip shades, and **Makeup VTO** puts them on your selfie. Coverage and finish adapt to your skin scan (for example, more coverage when redness is high, and a dewy finish when skin is dry).

## YouCam APIs used

| Feature | Endpoint |
| --- | --- |
| File upload | `POST /s2s/v2.0/file` + pre-signed PUT |
| HD/SD Skin Analysis | `POST/GET /s2s/v2.1/task/skin-analysis` |
| Skin Tone Analysis | `POST/GET /s2s/v2.0/task/skin-tone-analysis` |
| Makeup VTO | `POST/GET /s2s/v2.0/task/makeup-vto` |

All YouCam calls go through Next.js API routes (`src/app/api`), so your API key never reaches the browser.

## Tech stack

- **Language:** TypeScript
- **Framework:** Next.js 14 (App Router, React 18), with API routes as the server-side proxy to YouCam
- **Styling:** Tailwind CSS, responsive from phone (360px) to desktop
- **No database:** scan history is stored in the browser (`localStorage`)

## Run it locally

**Requirements:** Node.js 18.17+ (Node 20 LTS recommended) and npm.

1. Clone and install:
   ```bash
   git clone https://github.com/Leandre99/mirror-moment.git
   cd mirror-moment
   npm install
   ```
2. Create your env file:
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` and set `YOUCAM_API_KEY` to your **API Key** from the [YouCam API console](https://yce.makeupar.com/api-console/en/api-keys/). Use the "API Key" value, not the "Secret Key". Leave it empty to use demo mode.
4. Start the app:
   ```bash
   npm run dev        # development, http://localhost:3000
   # or
   npm run build && npm start   # production
   ```

If `YOUCAM_API_KEY` is empty, the app runs in **demo mode** with deterministic mock results, so you can try the whole flow without spending credits. Set `YOUCAM_MOCK=1` to force demo mode. Each live scan uses YouCam credits (units), so check your balance in the console.

| Env var | Purpose |
| --- | --- |
| `YOUCAM_API_KEY` | YouCam API key ([get one](https://yce.makeupar.com/api-console/en/api-keys/)) |
| `YOUCAM_MOCK` | `1` = force demo mode |
| `OPENAI_API_KEY` | Optional. Turns on the LLM tool-calling coach |
| `OPENAI_BASE_URL`, `OPENAI_MODEL` | Optional. Any OpenAI-compatible endpoint (default `gpt-4o-mini`) |

### Tips

- **Camera:** browsers only allow the camera on `https://` or `localhost`. On another device over plain HTTP, use "Upload photo" instead.
- **HD analysis** needs a photo with a short side of at least 1080px. Smaller photos automatically use SD analysis.
- **Deploying (e.g. Vercel):** import the repo, add `YOUCAM_API_KEY` (and optionally `OPENAI_API_KEY`) as environment variables, and deploy. No other setup is needed.

## Code map

- `src/lib/youcam.ts`: server-side YouCam client (upload, start task, poll)
- `src/lib/concerns.ts`: normalizes skin-analysis output (HD/SD) and derives skin type
- `src/lib/agent.ts`: rules agent (priorities, routine, product check, progress)
- `src/lib/llm.ts`: optional LLM coach with tool calling
- `src/lib/color.ts`: Lab/Delta-E shade matching and makeup VTO effect builder
- `src/lib/catalog.ts`: demo product catalog and ingredient knowledge base

The product catalog is fictional demo data. The app gives cosmetic guidance, not medical advice.
