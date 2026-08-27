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
| `handoff/` | **The port package.** The prototype split into CSS, markup, behaviour, catalogue and image files, plus `handoff/README.md` — what each file is, the two globals the theme prints, the submit payload, what to strip and what must not change. Start here when building the live section. |
| `tools/split.py` | Regenerates `handoff/` from the prototype. One source; edit the prototype, rerun this. |
| `tests/*.mjs` | Playwright scripts. See below. |

## Running the prototype

Open `prototype/hcf-builder.html` in any browser. That's it.

The catalogue, the product photographs, and every screen are inlined in the
single file. Progress is saved to `localStorage` under
`hcf-quote-builder-session-v1`; submitting is terminal and blocks further saves.

Two things are prototype scaffolding and come out at migration:

- the photo-swap tool, gated behind `?photos=1`
- two `alert()` stubs standing in for a real submit endpoint

Search the source for `SUBMIT SEAM` for the one place the live site differs.
Everything above it builds the payload; `window.HCF_QUOTE_LAST_PAYLOAD` holds
the last one built.

## Running the tests

The scripts drive the prototype in Chromium via Playwright.

```
node tests/final.mjs      # 39 assertions covering the audit findings and the data corrections
node tests/back.mjs       # back navigation, and its parity with the browser's own
node tests/phone.mjs      # the required phone field
node tests/added.mjs      # the confirmation panel after an add, on every family
node tests/run3.mjs       # horizontal-overflow sweep, 360–1440px, all five screens
node tests/regress.mjs    # session persistence and history behaviour
node tests/mob.mjs        # mobile layout measurements at 375px
```

`tests/handoff/` runs the same assertions against `handoff/preview.html`, which
reassembles the split files — so the split is verified rather than assumed.

They resolve their target relative to their own location, so they run from any
directory. They import Playwright by absolute path
(`/opt/node22/lib/node_modules/playwright/index.mjs`) — change that line if your
install lives elsewhere.

Current state: 39/39 in `final.mjs`, 15/15 in `back.mjs`, 15/15 in `phone.mjs`,
11/11 in `added.mjs`, against both the prototype and the split handoff files. No horizontal overflow
at any width on any screen, no console errors.

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

**Quantities move a whole case at a time.** Each *size* carries a `per` value
(its case size — see below for why it cannot sit on the product), so the stepper
can only land on multiples of it. The review screen says "5 cases of 1,000"
rather than a bare number.

## Real product data

| Product | Sizes | Minimum | Case | Turnaround |
| --- | --- | --- | --- | --- |
| Single Wall Paper Cup | 8 · 10 · 12 · 16 · 20 · 24 | 5,000 | 1,000 up to 16 oz, 500 at 20 & 24 | 4–6 weeks |
| Double Wall Paper Cup | 8 · 10 · 12 · 16 · 20 | 5,000 | 500 at every size | 4–6 weeks |
| Clear PET Cold Cup | 8 · 12 · 16 · 20 · 24 · 32 | 5,000 | 1,000, 500 at 32 oz | 4–6 weeks |
| Paper Cold Cup | 12 · 16 · 22 · 24 | 5,000 | 1,000 | 4–6 weeks |
| Cup Sleeve | one, fits 10–24 oz | 5,000 | 1,000 | 4–6 weeks |
| Plastic Mason Jar | 16 oz only | 1,029 (7 cases) | 147 | 4–6 weeks |

Measured from live products, not written from memory. Five of the six families
carried a wrong number before this pass.

**Case size sits on the size, not the family.** It changes mid-range on single
wall and PET, so it cannot live at family level. Told 1,000 where it is really
500, a shop ordering 5,000 cups expects five cases and takes delivery of ten.

**Quantity tiers carry savings badges, never prices.** The four cup families
share 5,000 / 10,000 / 30,000 / 50,000 with "save about 17/35/43%" on the three
upper tiers. The badges are keyed by quantity rather than parallel to the tier
list, because the failure mode of parallel arrays is not a missing badge, it is
"50,000 · save 17%" on a live page, which looks fine and so nobody catches it.

**Turnaround runs from design approval**, not from the order date, and every
screen that quotes it says so.

Three things are still open, all flagged in the source:

- **The jar minimum.** The stated minimum is 1,000 jars, but they ship 147 to a
  case, so the real floor is seven cases — 1,029. Quoting 1,000 would name a
  number nobody can order.
- **The jar quantity ladder** (`tiers: [1029, 2058, 4116, 8232]`) is whole case
  counts, not pricing. The cup ladder does not fit a family this size and no jar
  ladder has been supplied.
- **Whether the discount ladder is the same for every family.** 17/35/43 is
  applied to all four cup families; sleeves and jars carry none.

Screen `#b3` compares the customer's stated deadline against the slowest item on
their request and warns when it's tight, rather than letting them find out later.

---

## Still open

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
