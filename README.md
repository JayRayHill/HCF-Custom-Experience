# HCF Custom Experience

A standalone, guided quote builder for Hot Cup Factory's custom products — the
replacement for the HubSpot form currently linked from each custom-product
collection page.

Everything here is a **prototype**. Nothing is wired to Shopify, HubSpot, or any
backend. It was built design-first so the flow could be settled before any
integration work started.

---

## What's in here

| Path | What it is |
| --- | --- |
| `prototype/hcf-builder.html` | The working prototype. One self-contained file — open it in a browser, no build step, no server. |
| `docs/flow-map.html` | Stage 1 — the flow map. Every screen and every branch. |
| `docs/builder-ux.html` | Stage 2 — wireframes. |
| `docs/build-review.html` | Stage 3 — visual design review. |
| `docs/ux-audit.html` | A seven-lens UX audit run in persona (a coffee-shop owner who has never heard of HCF). 36 findings, all implemented. |
| `docs/integration-spec.html` | How this connects to the real site: data flow, Shopify metafields, HubSpot storage, build order. |
| `tests/*.mjs` | Playwright scripts. See below. |

## Running the prototype

Open `prototype/hcf-builder.html` in any browser. That's it.

The catalogue, the product photographs, and every screen are inlined in the
single file. Progress is saved to `localStorage` under
`hcf-quote-builder-session-v1`; submitting is terminal and blocks further saves.

Two things are prototype scaffolding and come out at migration:

- the photo-swap tool, gated behind `?photos=1`
- two `alert()` stubs standing in for a real submit endpoint

## Running the tests

The scripts drive the prototype in Chromium via Playwright.

```
node tests/final.mjs      # 33 assertions covering the audit findings
node tests/run3.mjs       # horizontal-overflow sweep, 360–1440px, all five screens
node tests/regress.mjs    # session persistence and history behaviour
node tests/mob.mjs        # mobile layout measurements at 375px
```

They resolve the prototype relative to their own location, so they run from any
directory. They import Playwright by absolute path
(`/opt/node22/lib/node_modules/playwright/index.mjs`) — change that line if your
install lives elsewhere.

Current state: 33/33 pass, no horizontal overflow at any width on any screen, no
console errors.

---

## How the builder works

Five screens, each with a real URL, working back/forward, and restorable state:

1. **`#b1` — Build the request.** Pick a product, a size, and one or more
   quantities. Products accumulate in a rail on the right.
2. **`#b2` — Review.** Edit any line, adjust quantities, add matching lids.
3. **`#b3` — Four quick questions.** Timing, artwork, use case, cadence.
4. **`#b4` — Contact details.**
5. **`#b5` — Confirmation.**

Two rules shape everything downstream, and both are easy to get wrong:

**Quantities on a line are alternatives, never a sum.** `[5000, 10000]` means
"price both of these", not 15,000. It renders as "5,000 or 10,000" with a
`PRICE BOTH` pill. There is deliberately no grand total anywhere in the
interface — a total would imply a single order quantity that the customer never
committed to.

**Quantities move a whole case at a time.** Each product carries a `per` value
(its case size), so the stepper can only land on multiples of it. The review
screen says "5 cases of 1,000" rather than a bare number.

## Real product data

| Product | Minimum | Case | Turnaround |
| --- | --- | --- | --- |
| Single Wall Paper Cup | 5,000 | 1,000 | 3–4 weeks |
| Double Wall Paper Cup | 5,000 | 1,000 | 3–4 weeks |
| Clear PET Cold Cup | 5,000 | 1,000 | 3–4 weeks |
| Paper Cold Cup | 5,000 | 1,000 | 3–4 weeks |
| Cup Sleeve | 2,500 | 2,500 | 3–4 weeks |
| Plastic Mason Jar | 147 (one case) | 147 | 4–6 weeks |

Minimums and turnarounds are confirmed. **The case sizes for cups (1,000) and
sleeves (2,500) are assumptions and still need confirming** — only the jar's 147
came from HCF. These print on the review screen, so an error is
customer-visible.

Turnaround is quoted from proof approval, not from order date. Screen `#b3`
compares the customer's stated deadline against the slowest item on their
request and warns when it's tight rather than letting them find out later.

---

## Still open

- Confirm the two case sizes above.
- Theme spacing parity: to make the prototype's margins match the live site
  exactly, the theme's `.container` padding at mobile, the real `--space-unit`,
  `.section--padded` top/bottom at mobile, and the two-up grid `gap` at mobile.
- Whether HubSpot custom objects are available on this portal (Settings →
  Objects). None are defined today.
- Whether a Shopify draft order gets created alongside the HubSpot record.
- How the request actually reaches HubSpot. The Forms API cannot create a Deal;
  that needs either a Workflow (Professional tier and up) or a server-side route
  holding the private-app token. **The token must never reach the browser.**

See `docs/integration-spec.html` for the full picture.
