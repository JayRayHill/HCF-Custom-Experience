# Quote builder — handoff package

This is the prototype split into the four layers a Shopify theme actually wants.
Hand this folder to whoever is building the live section.

`prototype/hcf-builder.html` is one 300KB file because an artifact has to be
CSS, markup, behaviour, catalogue and six base64 photographs in a single
document. None of that survives contact with a theme. These files are the same
build, carved apart.

**Do not edit these by hand.** They are generated from the prototype by
`python3 tools/split.py`. Edit the prototype, rerun the splitter. If the live
section has diverged far enough that this stops being true, say so and stop
regenerating — but until then, one source.

---

## The files

| File | What it is | Where it goes |
| --- | --- | --- |
| `quote-builder.css` | 43KB. Every style, in HCF/Canopy tokens. | `assets/quote-builder.css` |
| `quote-builder.html` | 228 lines of markup: five screens plus chrome. | the section's Liquid, minus the parts noted below |
| `quote-builder.js` | 75KB. All behaviour. Vanilla, no framework, no build step, ES5. | `assets/quote-builder.js` |
| `catalogue.json` | The six families and the four questions, as data. | the shape your metaobjects print |
| `images/*.jpg` | The six product photographs, 13–30KB each. | Shopify product images (see below) |
| `preview.html` | Reassembles the four so you can open and test them. | nowhere — local only |

Open `preview.html` in a browser. It behaves exactly like the prototype, which
is the point: the split is verified, not assumed. The full suite runs against it
green (39 + 15 + 15 assertions).

---

## The two globals

The section prints two globals before loading the JS. That is the entire
contract.

```html
<script>
  window.HCF_QUOTE_DATA   = { products: [...], questions: [...] };
  window.HCF_QUOTE_IMAGES = { sw: "https://cdn.shopify.com/...", ... };
</script>
```

`preview.html` sets both from literals. On the theme, `HCF_QUOTE_DATA` is JSON
printed from the `quote_family` metaobjects in the same shape, and
`HCF_QUOTE_IMAGES` maps each product id to its Shopify CDN URL. No fetch, no
loading state, no API call from the browser.

If neither is printed the builder renders an empty catalogue rather than
throwing — useful while you wire it up, and worth an explicit check before you
ship, because an empty picker looks like a styling bug rather than a data one.

---

## The catalogue shape

```jsonc
{
  "id": "sw",                      // stable key: images and lids are keyed to it
  "group": "Coffee Cups",          // the category tab it appears under
  "name": "Single Wall Paper Cup",
  "shape": "cup",                  // cup | pet | sleeve | jar — picks the fallback drawing
  "cold": 0,                       // 1 tints the card toward the iced palette
  "unit": "cups",                  // the noun every quantity gets
  "blurb": "Standard hot cup...",  // the one line that separates two similar products
  "moq": 5000,                     // minimum, in units
  "lead": "4–6 weeks",             // printed verbatim
  "leadMax": 6,                    // integer weeks, for the deadline-clash maths only
  "note": "Standard 90mm rim...",  // the info line under the configurator
  "lid": "Also quote matching 90mm lids",   // omit entirely if there is no lid to quote
  "sizes": [["8 oz", 34, 58, 1000], ["20 oz", 42, 104, 500]],
  "tiers": [5000, 10000, 30000, 50000],
  "disc": { "10000": 17, "30000": 35, "50000": 43 }
}
```

A size is `[label, artWidth, artHeight, unitsPerCase]`. The two middle numbers
size the fallback line drawing and are ignored when a photograph exists.

**`unitsPerCase` is on the size, not the family.** This is the one that bites.
It changes mid-range — single wall ships 1,000 up to 16 oz and 500 above it,
double wall ships 500 throughout. Told 1,000 where it is really 500, a shop
ordering 5,000 cups expects five cases and takes delivery of ten. At integration
it comes from each size's own `my_fields.units_per_case`, so nothing is typed
twice and the exception maintains itself.

**`disc` is keyed by quantity, never parallel to `tiers`.** The failure mode of
parallel arrays is not a missing badge, it is `50,000 · save 17%` rendering on a
live page, which looks fine and so nobody catches it. A tier with no entry gets
no badge, which is correct for the baseline.

---

## The submit seam

Search `quote-builder.js` for `SUBMIT SEAM`. Everything above it builds
`payload`; the seam is the only line that changes.

```json
{
  "ref": "HCF-2981",
  "contact": { "name": "...", "business": "...", "email": "...", "phone": "..." },
  "lines": [{
    "productId": "sw",
    "product": "Single Wall Paper Cup",
    "size": "16 oz",
    "quantities": [5000, 10000],
    "unitsPerCase": 1000,
    "cases": [5, 10],
    "quantityUnknown": false,
    "alsoQuoteLids": true,
    "leadTime": "4–6 weeks"
  }],
  "answers": { "needBy": "...", "artwork": "...", "useCase": "...", "cadence": "..." },
  "note": "Logo is on our Instagram."
}
```

`window.HCF_QUOTE_LAST_PAYLOAD` holds the last one built, so you can check it in
the console. Define `window.HCF_QUOTE_SUBMIT(payload)` and it gets called.

For the real thing, POST to a server-side route and advance to the confirmation
only once it resolves. **The HubSpot private-app token must never reach the
browser.** The Forms API cannot create a Deal on its own.

`quantities` is an array of **alternatives**, never a sum. `[5000, 10000]` means
"price both of these", not 15,000. Nothing downstream may add them up, and there
is deliberately no total anywhere in the interface — a total would name an order
quantity the customer never committed to.

---

## What to strip

- **`.announce`, `header.site`, `footer.site-foot`** (markup lines 1–23 and
  214–221). Canopy provides all three. Keep `nav.steps`, `main` and `.mobar`.
- **The photo tool.** `?photos=1` in the JS, plus `PHOTO_KEY` and the
  `hcf-quote-builder-photos-v1` reads and writes. Prototype scaffolding for
  swapping product shots without a round trip.
- **Two `window.alert()` stubs** — the "talk to us" route and the free sample
  box. Both should point at the flows those already have on the site.
- **The Google Fonts `<link>`s**, if the theme already loads Fraunces and
  DM Sans. It does.

## What must not change

Each of these took a round of user testing to land, and each looks like an
arbitrary detail until it is removed:

- **Quantities are alternatives, not a sum.** Covered above. This one shapes
  the data model, the review screen and the payload.
- **Quantities move a whole case at a time**, and the review screen says how
  many cases that is. The stepper cannot land between cases.
- **No prices anywhere.** Percentages on the tier badges, nothing else. A
  per-unit figure that later moves for ink coverage or a plate charge is
  exactly the surprise their buyers already complain about.
- **The five screens have real URLs** (`#b1`–`#b5`) with working back and
  forward and restorable state. In-page Back pops the history stack rather
  than pushing to it, so the page's Back and the browser's Back agree. If the
  section is ever dropped into a modal this all goes, and it should not be.
- **Submit is terminal.** `state.sent` blocks every further save, so walking
  Back off the confirmation cannot re-send or resurrect a spent draft.
- **Both storage keys clear on submit** — session *and* photos. Leaving the
  second behind starts the customer's next quote half-populated with the
  first one's uploads.
- **Turnaround is quoted from design approval**, not from the order date, on
  every screen that mentions it.
- **The minimum is stated before the click**, on the collection CTA. A shop
  that cannot clear 5,000 should learn that in three seconds, not after
  building a full spec.

---

## Traps

- **`--section-gap` is unitless.** It is stored as `24`, not `24px`.
  `margin: var(--section-gap)` is invalid CSS and the browser drops the whole
  declaration silently — no console error, no warning, just no margin. It has
  to be `calc(var(--section-gap) * var(--space-unit))`.
- **`--space-unit` is declared on `body`, not `:root`.** Anything that resolves
  it above `body` gets nothing.
- **The new form name must be added to the "Lead From Form" workflow.** That
  workflow enrols on four hardcoded form names. A form outside that list
  creates a Contact, no Lead, and no sign anything went wrong: the thank-you
  screen renders, HubSpot logs a submission, every dashboard reports success,
  and no BDR ever sees the customer. **This is the only step whose failure is
  invisible**, so verify it with a real submission before launch.
- **Don't assign an owner, stamp Offensive Play, or set a stage other than
  New.** The BDR queue filters on all three being untouched. A lead that
  breaks any one exists, looks healthy, and is invisible to everybody who
  would call it.
- **The spec belongs on the Contact, not the Lead.** The Lead carries a name,
  the Hot label, a stage and an association; it is the pointer that puts the
  Contact in the queue.

## Still to decide

- Whether the discount ladder is the same for every family. 17/35/43 is applied
  to all four cup families; sleeves and jars carry none.
- The jar quantity ladder. `[1029, 2058, 4116, 8232]` is whole case counts, not
  pricing — the cup ladder does not fit a family this size.
- The jar minimum. Stated as 1,000, but they ship 147 to a case and part cases
  do not exist, so the builder uses seven cases (1,029). Quoting 1,000 would
  name a number nobody can order.

`docs/integration-spec.html` in the repo root has the wider picture: data flow,
metafields, the three-layer HubSpot storage, and a dependency-ordered build list.
