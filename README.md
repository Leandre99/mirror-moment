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

## Run it

```bash
npm install
cp .env.example .env.local   # add YOUCAM_API_KEY (and optionally OPENAI_API_KEY)
npm run dev                  # http://localhost:3000
```

If `YOUCAM_API_KEY` is empty, the app runs in **demo mode** with deterministic mock results, so you can try the whole flow without spending credits. Set `YOUCAM_MOCK=1` to force demo mode.

| Env var | Purpose |
| --- | --- |
| `YOUCAM_API_KEY` | YouCam API key ([get one](https://yce.makeupar.com/api-console/en/api-keys/)) |
| `YOUCAM_MOCK` | `1` = force demo mode |
| `OPENAI_API_KEY` | Optional. Turns on the LLM tool-calling coach |
| `OPENAI_BASE_URL`, `OPENAI_MODEL` | Optional. Any OpenAI-compatible endpoint (default `gpt-4o-mini`) |

## Code map

- `src/lib/youcam.ts`: server-side YouCam client (upload, start task, poll)
- `src/lib/concerns.ts`: normalizes skin-analysis output (HD/SD) and derives skin type
- `src/lib/agent.ts`: rules agent (priorities, routine, product check, progress)
- `src/lib/llm.ts`: optional LLM coach with tool calling
- `src/lib/color.ts`: Lab/Delta-E shade matching and makeup VTO effect builder
- `src/lib/catalog.ts`: demo product catalog and ingredient knowledge base

The product catalog is fictional demo data. The app gives cosmetic guidance, not medical advice.
