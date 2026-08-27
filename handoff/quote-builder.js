(function () {
  "use strict";

  /* Every silhouette gets a viewBox cropped to the drawing, so a CSS height
     renders the object at that height instead of scaling mostly-empty space. */
  function cupArt(w, h, band2) {
    var ry = Math.max(3, w * 0.11), i = w * 0.13;
    var W = w + 4, H = h + ry + 4, cx = W / 2, top = ry + 2, by = top + h;
    function wAt(y) { var t = (y - top) / h; return w - 2 * i * t; }
    var y1 = top + h * 0.30, y2 = top + h * 0.58, w1 = wAt(y1), w2 = wAt(y2);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path class="cup-body" d="M' + (cx - w / 2) + ',' + top + ' L' + (cx + w / 2) + ',' + top +
        ' L' + (cx + w / 2 - i) + ',' + by + ' L' + (cx - w / 2 + i) + ',' + by + ' Z"/>' +
      '<path class="' + (band2 ? "cup-band-2" : "cup-band") + '" d="M' + (cx - w1 / 2) + ',' + y1 +
        ' L' + (cx + w1 / 2) + ',' + y1 + ' L' + (cx + w2 / 2) + ',' + y2 + ' L' + (cx - w2 / 2) + ',' + y2 + ' Z"/>' +
      '<ellipse class="cup-rim" cx="' + cx + '" cy="' + top + '" rx="' + (w / 2) + '" ry="' + ry + '"/>' +
      '<ellipse class="cup-in" cx="' + cx + '" cy="' + top + '" rx="' + (w / 2 * 0.84) + '" ry="' + (ry * 0.8) + '"/>' +
      '</svg>';
  }

  function jarArt(w, h) {
    var W = w + 4, H = h + 4, cx = W / 2, top = 2, by = top + h;
    var lid = h * 0.10, ni = w * 0.19, sh = h * 0.14;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path class="cup-body" d="M' + (cx - w / 2 + ni) + ',' + (top + lid) +
        ' L' + (cx + w / 2 - ni) + ',' + (top + lid) +
        ' L' + (cx + w / 2) + ',' + (top + lid + sh) +
        ' L' + (cx + w / 2) + ',' + (by - 6) + ' Q' + (cx + w / 2) + ',' + by + ' ' + (cx + w / 2 - 6) + ',' + by +
        ' L' + (cx - w / 2 + 6) + ',' + by + ' Q' + (cx - w / 2) + ',' + by + ' ' + (cx - w / 2) + ',' + (by - 6) +
        ' L' + (cx - w / 2) + ',' + (top + lid + sh) + ' Z"/>' +
      '<path class="cup-band" d="M' + (cx - w / 2 + 2) + ',' + (top + h * 0.40) +
        ' L' + (cx + w / 2 - 2) + ',' + (top + h * 0.40) +
        ' L' + (cx + w / 2 - 2) + ',' + (top + h * 0.64) +
        ' L' + (cx - w / 2 + 2) + ',' + (top + h * 0.64) + ' Z"/>' +
      '<rect class="cup-rim" x="' + (cx - w / 2 + ni * 0.5) + '" y="' + top + '" width="' + (w - ni) + '" height="' + lid + '" rx="3"/>' +
      '</svg>';
  }

  function sleeveArt(w, h) {
    var ry = w * 0.08, i = w * 0.10;
    var W = w + 4, H = h + ry + 4, cx = W / 2, top = ry + 2, by = top + h;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path class="cup-body" d="M' + (cx - w / 2) + ',' + top + ' L' + (cx + w / 2) + ',' + top +
        ' L' + (cx + w / 2 - i) + ',' + by + ' L' + (cx - w / 2 + i) + ',' + by + ' Z"/>' +
      '<path class="cup-band" d="M' + (cx - w / 2 + 3) + ',' + (top + h * 0.26) +
        ' L' + (cx + w / 2 - 3) + ',' + (top + h * 0.26) +
        ' L' + (cx + w / 2 - i - 2) + ',' + (top + h * 0.62) +
        ' L' + (cx - w / 2 + i + 2) + ',' + (top + h * 0.62) + ' Z"/>' +
      '<ellipse class="cup-in" cx="' + cx + '" cy="' + top + '" rx="' + (w / 2) + '" ry="' + ry + '"/>' +
      '</svg>';
  }

  /* ── PRODUCT PHOTOGRAPHY ────────────────────────────────────────────
     Paste a data URI against a product id and the photograph replaces the
     drawn silhouette in the tile, the configurator, the quote rail and the
     review screen. Empty string = fall back to the drawing.
     The artifact CSP blocks remote hosts, so these must be inlined
     ("data:image/jpeg;base64,...") rather than linked.
     ─────────────────────────────────────────────────────────────────── */
  /* The prototype inlined six base64 photographs here because an artifact's CSP
     blocks remote hosts. On the theme they are product images: the section
     prints their CDN URLs and this reads them. Keys are product ids. */
  var IMAGES = window.HCF_QUOTE_IMAGES || {};

  function hasPhoto(pid) { return !!(IMAGES[pid] && IMAGES[pid].length); }

  /* Photos the viewer sets live in their own browser. Nothing is uploaded
     anywhere; "Copy for Claude" is how one gets back to me to be baked in. */
  var PHOTO_KEY = "hcf-quote-builder-photos-v1";

  /* Photos published into the artifact travel with the link; the local copy
     is this browser's unsaved work and takes precedence over it. */
  function loadPublishedPhotos() {
    return window.fetch("photos.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (saved) {
        if (!saved) return false;
        var got = false;
        Object.keys(IMAGES).forEach(function (k) {
          if (typeof saved[k] === "string" && saved[k]) { IMAGES[k] = saved[k]; got = true; }
        });
        return got;
      })
      .catch(function () { return false; });
  }

  function loadPhotos() {
    try {
      var raw = window.localStorage.getItem(PHOTO_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.keys(IMAGES).forEach(function (k) {
        if (typeof saved[k] === "string" && saved[k]) IMAGES[k] = saved[k];
      });
    } catch (e) { /* private window, blocked storage — carry on with drawings */ }
  }

  function savePhotos() {
    try { window.localStorage.setItem(PHOTO_KEY, JSON.stringify(IMAGES)); } catch (e) {}
  }

  /* Downscale in-browser: a 1024px original behind a 72px tile is pure weight,
     and a smaller data URI is small enough to paste back into chat. */
  function ingestPhoto(pid, file, done) {
    var reader = new window.FileReader();
    reader.onload = function () {
      var img = new window.Image();
      img.onload = function () {
        var max = 420;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        try { IMAGES[pid] = c.toDataURL("image/jpeg", 0.78); }
        catch (e) { IMAGES[pid] = reader.result; }
        savePhotos();
        done();
      };
      img.onerror = function () { done(); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* One call site for "show this product", so swapping a drawing for a photo
     never needs touching four renderers. */
  function shot(pid, shape, w, h, alt) {
    if (hasPhoto(pid)) {
      return '<img src="' + IMAGES[pid] + '" alt="' + (alt || "") + '" loading="lazy">';
    }
    return art(shape, w, h);
  }

  function art(shape, w, h) {
    if (shape === "jar") return jarArt(w, h);
    if (shape === "sleeve") return sleeveArt(w, h);
    return cupArt(w, h, shape === "pet");
  }

  /* One flat list, ordered warm-to-cool so the tile tints read as a
     progression rather than a scatter. `group` survives only to bucket
     the review screen. */
  /* `blurb` is the one line that lets someone choose between two products they
     cannot otherwise tell apart. `unit` gives every quantity a noun. `per` is
     the case size, so quantities can only move a whole case at a time. `lid`
     names an attach item the builder can actually quote — never mention one it
     cannot. */
  /* Measured from live products, not written from memory. Five of the six
     families carried a wrong number before this: wrong sizes, wrong case
     counts, wrong minimums. `per` is the expensive one — it sits on the SIZE,
     not the family, because case size changes mid-range on single wall and
     PET. Told 1,000 where it is 500, a shop ordering 5,000 cups expects five
     cases and takes delivery of ten. At integration each of these rows is a
     product and `per` is its my_fields.units_per_case. */
  /* Catalogue, not code. The theme prints this from the quote_family
     metaobjects in exactly this shape; handoff/catalogue.json is the same data
     as a file, and the fallback if nothing is printed.

     `per` is on the SIZE, not the family, because it changes mid-range. A size
     is [label, artWidth, artHeight, unitsPerCase]. */
  var DATA = window.HCF_QUOTE_DATA || {};
  var PRODUCTS = DATA.products || [];

  /* Case size lives on the size, so every read goes through here. */
  function perOf(p, i) { return p.sizes[i][3]; }

  var STEPS = [
    { id: "b1", label: "Products" },
    { id: "b2", label: "Review" },
    { id: "b3", label: "Details" },
    { id: "b4", label: "Contact" }
  ];

  /* Artwork replaces "how many colours": colour count is worth far more asked
     by a designer against a real file than guessed by someone who has never had
     to describe their logo in a printer's terms. */
  var QS = DATA.questions || [];

  /* A quote line holds an ARRAY of quantities. More than one means
     "price these alternatives", never "I want both" — the UI has to
     say so everywhere the numbers appear, or a rep reads 5,000 + 10,000
     as a 15,000 unit order. */
  var ALL = "All products";
  var state = {
    screen: "b1", tab: ALL, open: null, size: null, qtys: [], unsure: false,
    quote: [], answers: {}, note: "", lids: [],
    justAdded: null, sent: false
  };

  /* ── SESSION STATE ───────────────────────────────────────────────────
     The quote survives a reload, a closed tab and a Back gesture. This is
     what makes asking for an email at screen four safe rather than reckless:
     the work is not hostage to the contact details.
     ─────────────────────────────────────────────────────────────────── */
  var STATE_KEY = "hcf-quote-builder-session-v1";
  var SCREENS = ["b1", "b2", "b3", "b4", "b5"];

  function saveState() {
    /* Sending is terminal for persistence. Without this, walking Back off the
       confirmation screen writes the just-cleared session straight back and
       the next visit resumes a request that has already been submitted. */
    if (state.sent) return;
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify({
        quote: state.quote,
        answers: state.answers,
        note: state.note,
        lids: state.lids,
        tab: state.tab,
        open: state.open,
        screen: state.screen
      }));
    } catch (e) { /* private window or blocked storage — carry on unsaved */ }
  }

  function clearState() {
    try { window.localStorage.removeItem(STATE_KEY); } catch (e) {}
    /* Two keys, not one. Leaving the photo key behind starts the customer's
       next quote half-populated with the last one's uploads. */
    try { window.localStorage.removeItem(PHOTO_KEY); } catch (e) {}
  }

  function restoreState() {
    var saved = null;
    try {
      var raw = window.localStorage.getItem(STATE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (e) { return; }
    if (!saved || typeof saved !== "object") return;

    if (Array.isArray(saved.quote)) {
      /* Drop lines whose product no longer exists — the catalog can change
         under a saved session once this reads from Shopify. */
      state.quote = saved.quote.filter(function (q) {
        return q && prod(q.pid) && Array.isArray(q.qtys) && q.qtys.length;
      });
    }
    if (saved.answers && typeof saved.answers === "object") state.answers = saved.answers;
    if (typeof saved.note === "string") state.note = saved.note;
    if (Array.isArray(saved.lids)) {
      state.lids = saved.lids.filter(function (id) { return prod(id) && prod(id).lid; });
    }
    if (typeof saved.tab === "string" && CATEGORIES.some(function (c) { return c.label === saved.tab; })) {
      state.tab = saved.tab;
    }
    /* Only reopen a product the restored tab actually shows, or the
       configurator would show something the grid beside it does not. */
    var visible = cat().items;
    if (typeof saved.open === "string" && visible.some(function (x) { return x.id === saved.open; })) {
      state.open = saved.open;
    } else {
      autoOpen();
    }

    /* A screen is only restorable if its preconditions still hold. */
    var want = saved.screen;
    if (SCREENS.indexOf(want) > -1 && want !== "b5") {
      if (want !== "b1" && !state.quote.length) want = "b1";
      if (want === "b4" && !state.answers.when) want = "b3";
      state.screen = want;
    }
  }

  function screenFromHash() {
    var h = (window.location.hash || "").replace("#", "");
    return SCREENS.indexOf(h) > -1 ? h : null;
  }

  function qtyLabel(qtys) {
    return qtys.map(fmt).join(" or ");
  }

  var $ = function (s) { return document.querySelector(s); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };

  function prod(pid) {
    for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === pid) return PRODUCTS[i]; }
    return null;
  }

  /* Categories are derived rather than declared, so `group` on each product
     stays the single source of truth for both the tab bar and the review
     screen's bucketing. Order follows the product list: warm, then cool. */
  /* "All products" leads, because the question a stranger arrives with is
     "what can you actually make?" — and answering it used to mean tapping five
     pills one at a time and holding six products in your head. */
  var CATEGORIES = (function () {
    var out = [{ label: ALL, items: PRODUCTS.slice() }], seen = {};
    PRODUCTS.forEach(function (p) {
      if (!seen[p.group]) { seen[p.group] = { label: p.group, items: [] }; out.push(seen[p.group]); }
      seen[p.group].items.push(p);
    });
    return out;
  })();

  function cat(label) {
    var want = label || state.tab;
    for (var i = 0; i < CATEGORIES.length; i++) { if (CATEGORIES[i].label === want) return CATEGORIES[i]; }
    return CATEGORIES[0];
  }

  function autoOpen() {
    /* A category holding one product has already been chosen by choosing the
       tab, so open it straight away — the card below is then confirmation,
       not a decision. */
    var items = cat().items;
    state.open = items.length === 1 ? items[0].id : null;
  }

  function inQuote(pid, size) {
    for (var i = 0; i < state.quote.length; i++) {
      if (state.quote[i].pid === pid && state.quote[i].size === size) return i;
    }
    return -1;
  }
  function countFor(pid) {
    var n = 0;
    state.quote.forEach(function (q) { if (q.pid === pid) n++; });
    return n;
  }

  function renderSteps() {
    var rail = $("#stepRail");
    rail.innerHTML = "";
    var order = ["b1", "b2", "b3", "b4"];
    var cur = state.screen === "b5" ? 4 : order.indexOf(state.screen);
    STEPS.forEach(function (s, i) {
      var done = i < cur;
      var el = document.createElement(done ? "button" : "div");
      el.className = "step";
      el.setAttribute("data-state", i === cur ? "current" : (done ? "done" : "todo"));
      if (i === cur) el.setAttribute("aria-current", "step");
      if (done) {
        el.type = "button";
        el.setAttribute("aria-label", "Back to step " + (i + 1) + ", " + s.label);
        el.onclick = function () { goBack(s.id); };
      }
      el.innerHTML = '<span class="n">' + (done ? "✓" : i + 1) + "</span><span>" + s.label + "</span>";
      rail.appendChild(el);
    });
    /* On a phone "Contact" used to sit past the right edge — so the one fact
       that relaxes a wary person, that the personal bit is last and there are
       only four steps, was the fact the phone hid. */
    var now = rail.children[cur < 0 ? 0 : Math.min(cur, rail.children.length - 1)];
    if (now && rail.scrollWidth > rail.clientWidth + 1) {
      try { now.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {}
    }
  }

  /* The bar is a reward for the first add, not a checkout-shaped strip of
     zeroes waiting on arrival. */
  function syncBar() {
    var bar = $("#mobar");
    if (!bar) return;
    bar.hidden = !(state.screen === "b1" && state.quote.length);
    bar.classList.toggle("on", !bar.hidden);
  }

  /* Mirrors the history entries this page owns, one per screen pushed. Every
     in-page Back used to call show(), which pushed a NEW entry, so after two
     presses the browser's own Back button went forwards and the two controls
     disagreed. Popping the real stack keeps them saying the same thing. */
  var trail = [];   /* screen id at each history depth we own */
  var depth = 0;    /* where in it we currently stand */

  /* Each screen is rebuilt on arrival: handlers inside these renders close over
     the state they were built with, and a stale one writes old values back. */
  function enter(id) {
    if (id === "b1") { renderTiles(); renderConfig(); renderRail(); }
    if (id === "b2") renderReview();
    if (id === "b3") { renderQs(); syncB3(); }
  }

  /* Walk back to a screen already behind us instead of stacking another entry
     on top. A restored session has nothing behind it, so that falls forward. */
  function goBack(target) {
    for (var i = depth - 1; i >= 0; i--) {
      if (trail[i] === target) { window.history.go(i - depth); return; }
    }
    enter(target);
    show(target);
  }

  /* `push` is false when the move came FROM history (popstate) or from the
     initial render — pushing there would fight the browser. */
  function show(id, push) {
    state.screen = id;
    SCREENS.forEach(function (s) { $("#s-" + s).hidden = s !== id; });
    syncBar();
    $("#savenote").style.visibility = id === "b5" ? "hidden" : "visible";
    /* Once it's sent, the flow behind the confirmation is a record, not a
       draft — say so rather than letting it look editable. */
    $("#savenote").textContent = state.sent
      ? "Already sent. This is a copy of your request"
      : "Saved in this browser. Nothing is sent until you press send";
    renderSteps();
    window.scrollTo(0, 0);

    if (push !== false) {
      /* A push drops whatever was ahead of here, exactly as real history does. */
      depth += 1;
      trail.length = depth;
      trail[depth] = id;
      try { window.history.pushState({ screen: id, i: depth }, "", "#" + id); } catch (e) {}
    }
    if (id !== "b5") saveState();

    /* Focus the new screen's heading so keyboard users land somewhere and
       screen readers announce the change. Without this, focus stays on a
       button that is no longer on screen. */
    var h = document.querySelector("#s-" + id + " h1");
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  /* The products column changes height whenever a tab switches or the
     configurator opens, so watch it rather than guessing at call sites. */
  (function watchLeftColumn() {
    var left = document.querySelector(".b1-grid > div");
    if (!left) return;
    if (typeof window.ResizeObserver === "function") {
      new window.ResizeObserver(fitRail).observe(left);
    }
    window.addEventListener("resize", fitRail);
  })();

  window.addEventListener("popstate", function (e) {
    var want = (e.state && e.state.screen) || screenFromHash() || "b1";
    var id = SCREENS.indexOf(want) > -1 ? want : "b1";
    /* Guard the same preconditions a fresh restore would. */
    if (id !== "b1" && !state.quote.length) id = "b1";
    if (id === "b4" && !state.answers.when) id = "b3";
    /* If a precondition sent us somewhere other than the entry we landed on,
       rewrite that entry. Otherwise the URL names a screen that is not on
       screen and the next Back press looks like it did nothing. */
    depth = (e.state && typeof e.state.i === "number") ? e.state.i : 0;
    trail[depth] = id;
    if (id !== want) {
      try { window.history.replaceState({ screen: id, i: depth }, "", "#" + id); } catch (e2) {}
    }
    enter(id);
    show(id, false);
  });

  function renderTabs() {
    var t = $("#tabs");
    t.innerHTML = "";
    CATEGORIES.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "tab" + (c.label === ALL ? " tab--all" : "");
      b.type = "button";
      /* Deliberately NOT role="tab": there is no tabpanel and no arrow-key
         roving, and half-implemented ARIA promises behaviour that does not
         exist. These are toggle buttons that filter a grid. */
      b.setAttribute("aria-pressed", c.label === state.tab ? "true" : "false");
      b.textContent = c.label;
      b.onclick = function () {
        if (state.tab === c.label) return;
        switchTab(c.label);
      };
      t.appendChild(b);
    });
  }

  /* Looking at another category used to collapse the configurator and deselect
     the product, so you lost your place. Reopening the product fixes that.
     Deliberately NOT reopening the size and quantity with it: landing on a
     category with chips already lit that you did not just tap reads as "have I
     already added this?", which costs more than one tap to re-choose. */
  function setOpen(id) {
    if (id === state.open) return;
    state.open = id;
    state.size = null; state.qtys = []; state.unsure = false;
  }

  /* Picking a category clears what is open, unless that category holds exactly
     one product — choosing that tab WAS choosing the product, and leaving it
     shut would be a decision with one option.
     The rule this replaces reopened whatever you last had open if the new
     category happened to contain it, which meant switching to Cold Cups
     cleared but switching back to Coffee Cups did not. Nobody can infer that,
     so it read as arbitrary. Tabs browse; tiles choose. */
  function switchTab(label) {
    state.tab = label;
    var here = cat().items;
    setOpen(here.length === 1 ? here[0].id : null);
    state.justAdded = null;
    saveState();
    renderTabs(); renderTiles(true); renderConfig();
  }

  function openProduct(p, scroll) {
    setOpen(p.id);
    state.justAdded = null;
    saveState();
    renderTiles(); renderConfig();
    if (scroll) scrollConfigIntoView();
  }

  /* After switching category, show whichever of the two is the decision: the
     configurator if a product opened, otherwise the products themselves. */
  function revealCategory() {
    var tiles = $("#tiles");
    scrollIntoViewBelowHeader(state.open ? $("#config") : (tiles.hidden ? $("#config") : tiles));
  }

  /* On a phone the configurator opens roughly 650px down, so without this the
     one interaction the whole builder rests on produces no visible response. */
  function scrollConfigIntoView() { scrollIntoViewBelowHeader($("#config")); }

  function scrollIntoViewBelowHeader(d) {
    if (!d) return;
    var r = d.getBoundingClientRect();
    var bar = $("#mobar");
    var fold = window.innerHeight - (bar && !bar.hidden ? bar.offsetHeight : 0);
    if (r.top >= 60 && r.bottom <= fold) return;      /* already in view */
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var top = window.scrollY + r.top - 74;             /* clear the sticky header */
    try { window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" }); }
    catch (e) { window.scrollTo(0, top); }
  }

  function renderTiles(animate) {
    var g = $("#tiles");
    g.innerHTML = "";
    var items = cat().items;
    /* A category holding one product has already been chosen by choosing the
       tab, and the configurator below repeats the same photo, name, minimum and
       lead time. Showing the tile as well is a decision with one option. */
    g.hidden = items.length < 2;
    if (g.hidden) return;
    items.forEach(function (p, i) {
      var b = document.createElement("button");
      b.className = "tile" + (animate ? " enter" : "");
      if (animate) b.style.animationDelay = (i * 0.07) + "s";
      b.setAttribute("data-cold", p.cold ? "1" : "0");
      b.setAttribute("aria-pressed", state.open === p.id ? "true" : "false");
      var n = countFor(p.id);
      var big = p.sizes[p.sizes.length - 1];
      b.innerHTML =
        '<div class="shot' + (hasPhoto(p.id) ? " shot--photo" : "") + '">' +
          shot(p.id, p.shape, big[1], big[2], p.name + " with custom printing") +
          (n ? '<span class="badge-in">' + n + " on your quote</span>" : "") + "</div>" +
        '<div class="meat">' +
          '<div class="nm">' + p.name + "</div>" +
          '<div class="blurb">' + p.blurb + "</div>" +
          '<div class="specs">' +
            '<div class="specs__item"><div class="specs__label">Minimum order</div>' +
              '<div class="specs__value">' + fmt(p.moq) + " " + p.unit + "</div>" +
              '<div class="specs__caption">' + (p.sizes.length > 1 ? "per size" : "one size") + "</div></div>" +
            '<div class="specs__item"><div class="specs__label">Ready in</div>' +
              '<div class="specs__value">' + p.lead + "</div>" +
              '<div class="specs__caption">from design approval</div></div>' +
          "</div>" +
        "</div>";
      b.onclick = function () { openProduct(p, true); };
      g.appendChild(b);
    });
  }

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) { if (b.indexOf(a[i]) < 0) return false; }
    return true;
  }

  function addLabel(n) {
    if (n <= 1) return "Add to my quote";
    if (n === 2) return "Add both to my quote";
    return "Add these " + n + " to my quote";
  }

  function renderConfig() {
    var d = $("#config");
    d.innerHTML = "";
    var p = state.open ? prod(state.open) : null;

    if (!p) {
      d.removeAttribute("data-cold");
      d.innerHTML = '<div class="config-empty">' +
        '<p class="ce-lede"><b>Pick a product above</b> to choose sizes and quantities.</p>' +
        '<div class="ce-facts">' +
          '<div><b>Minimums are per size</b><span>5,000 cups of one size and one design. ' +
            'Two sizes means two lots of 5,000.</span></div>' +
          '<div><b>Quantities go up a case at a time</b><span>Cups go up in 1,000s, sleeves in 2,500s ' +
            'and jars in cases of 147.</span></div>' +
          '<div><b>Your proof is free</b><span>We redraw your logo for print and show you the cup ' +
            'before anything is made. Nothing prints until you approve it.</span></div>' +
          '<div><b>Nothing here is a purchase</b><span>This builds a spec so we can email you a real ' +
            'price. No payment, no obligation.</span></div>' +
        "</div>" +
        '<p class="ce-alt">Not ready to spec anything? ' +
          '<button type="button" class="linkish" id="sampleRail">Get a free sample box first</button>' +
        ". Real cups, no obligation.</p></div>";
      return;
    }
    d.setAttribute("data-cold", p.cold ? "1" : "0");

    var head = document.createElement("div");
    head.className = "ctitle";
    head.innerHTML =
      '<div class="cphoto' + (hasPhoto(p.id) ? " cphoto--photo" : "") + '">' +
        shot(p.id, p.shape, p.sizes[p.sizes.length - 1][1], p.sizes[p.sizes.length - 1][2], p.name) +
      "</div>" +
      '<div class="ctext"><h3 class="h-card">' + p.name + "</h3>" +
      '<span class="lead">Minimum ' + fmt(p.moq) + " " + p.unit +
      (p.sizes.length > 1 ? " per size" : "") + " · ready in " +
      p.lead + " from design approval</span></div>";
    d.appendChild(head);

    var fields = document.createElement("div");
    fields.className = "config-fields";   /* --single is added below once the size count is known */

    /* Sleeves and jars each come in one size now, so the step is a question
       with one answer. Pick it for them and render nothing. */
    var oneSize = p.sizes.length === 1;
    if (oneSize && state.size === null) state.size = 0;

    var f1 = document.createElement("div");
    f1.innerHTML = '<div class="fieldlabel">Size</div>';
    var sizes = document.createElement("div");
    sizes.className = "sizes";
    p.sizes.forEach(function (sz, i) {
      var onq = inQuote(p.id, sz[0]) > -1;
      var b = document.createElement("button");
      b.className = "size";
      b.setAttribute("aria-pressed", state.size === i ? "true" : "false");
      /* A visible micro-label, not a 6px dot explained only in a title
         attribute that never fires on a phone. */
      b.innerHTML = '<span class="lab">' + sz[0] + "</span>" +
        (onq ? '<span class="onq" aria-hidden="true"></span>' : "");
      if (onq) b.setAttribute("aria-label", sz[0] + ", already on your quote");
      b.onclick = function () {
        state.size = i;
        state.justAdded = null;
        var ex = inQuote(p.id, sz[0]);
        if (ex > -1) {
          /* Editing a size already on the quote starts from what is on it, so
             there is no add-versus-replace decision left to explain. */
          state.qtys = state.quote[ex].qtys.slice();
          state.unsure = !!state.quote[ex].unsure;
        }
        /* Otherwise keep whatever quantities are already staged. A reset is
           only warranted when the second control's options depend on the
           first, and every size of a product offers the same tiers — so
           picking quantity before size, or changing size after picking
           quantity, used to destroy work for no reason. */
        renderConfig();
      };
      sizes.appendChild(b);
    });
    f1.appendChild(sizes);
    if (oneSize) fields.className += " config-fields--single";
    else fields.appendChild(f1);

    var existingIdx = state.size !== null ? inQuote(p.id, p.sizes[state.size][0]) : -1;
    var existing = existingIdx > -1 ? state.quote[existingIdx] : null;

    var f2 = document.createElement("div");
    /* Case size used to sit in the header as one number for the whole family.
       It cannot: single wall ships 1,000 up to 16 oz and 500 above it. It
       belongs here, where it changes with the size that was just picked. */
    var qtyHint = existing ? "Editing what's on your quote"
      : state.size === null ? "Minimum " + fmt(p.moq) + ". Pick more than one to compare."
      : "Minimum " + fmt(p.moq) + ", in cases of " + fmt(perOf(p, state.size)) + ".";
    f2.innerHTML = '<div class="fieldlabel">How many?' +
      '<span class="hintnote">' + qtyHint + "</span></div>";
    var qs = document.createElement("div");
    qs.className = "qtys";
    p.tiers.forEach(function (v, i) {
      var b = document.createElement("button");
      b.className = "qty";
      b.setAttribute("aria-pressed", (!state.unsure && state.qtys.indexOf(v) > -1) ? "true" : "false");
      /* The case count restated the same number in the factory's unit. What a
         first-time buyer needs is how long it lasts at their counter. */
      /* Keyed lookup, never tiers.indexOf(): the failure mode of parallel
         arrays is not a missing badge, it is "50,000 · save 17%" on a live
         page, which looks fine and so nobody catches it. The baseline tier
         carries no entry and therefore no badge, which is correct. */
      var pct = p.disc && p.disc[v];
      b.innerHTML = '<span class="n">' + fmt(v) + "</span>" +
        (pct ? '<span class="save">save about ' + pct + "%</span>" : "");
      b.onclick = function () {
        state.justAdded = null;
        if (state.unsure) { state.unsure = false; state.qtys = []; }
        var at = state.qtys.indexOf(v);
        if (at > -1) { state.qtys.splice(at, 1); }
        else { state.qtys.push(v); state.qtys.sort(function (x, y) { return x - y; }); }
        renderConfig();
      };
      qs.appendChild(b);
    });
    /* Every route forward was behind a number they cannot supply. The next
       screen already offers an "I don't know" on a far easier question. */
    var uns = document.createElement("button");
    uns.className = "qty qty--unsure";
    uns.setAttribute("aria-pressed", state.unsure ? "true" : "false");
    uns.innerHTML = '<span class="n n--word">Not sure yet</span>';
    uns.title = "We'll start from the minimum and help you size it";
    uns.onclick = function () {
      state.justAdded = null;
      state.unsure = !state.unsure;
      state.qtys = state.unsure ? [p.moq] : [];
      renderConfig();
    };
    qs.appendChild(uns);
    f2.appendChild(qs);
    fields.appendChild(f2);
    d.appendChild(fields);

    var info = document.createElement("div");
    info.className = "infoline";
    info.innerHTML = '<span class="dot"></span><span>' + p.note + "</span>";
    d.appendChild(info);

    /* Never name a companion product in copy the builder cannot add. */
    if (p.lid) {
      var lidWrap = document.createElement("label");
      lidWrap.className = "lidrow";
      var lidBox = document.createElement("input");
      lidBox.type = "checkbox";
      lidBox.checked = state.lids.indexOf(p.id) > -1;
      lidBox.onchange = function () {
        var at = state.lids.indexOf(p.id);
        if (lidBox.checked && at < 0) state.lids.push(p.id);
        if (!lidBox.checked && at > -1) state.lids.splice(at, 1);
        saveState(); renderRail();
      };
      lidWrap.appendChild(lidBox);
      lidWrap.appendChild(document.createTextNode(p.lid + ". We'll price them alongside, no obligation"));
      d.appendChild(lidWrap);
    }

    var foot = document.createElement("div");
    foot.className = "config-foot";

    function mkBtn(cls, label) {
      var b = document.createElement("button");
      b.className = "btn " + cls;
      b.textContent = label;
      return b;
    }
    function stage(added) {
      state.size = null; state.qtys = []; state.unsure = false;
      state.justAdded = added || null;
      saveState();
      renderTiles(); renderConfig(); renderRail();
    }

    var staged = state.qtys.slice();
    var hintText = "";

    if (!existing) {
      var add = mkBtn("btn--primary", state.unsure ? "Add to my quote" : addLabel(staged.length));
      add.disabled = state.size === null || !staged.length;
      add.onclick = function () {
        var line = {
          pid: p.id, name: p.name, shape: p.shape,
          size: p.sizes[state.size][0], qtys: staged,
          per: perOf(p, state.size), cold: p.cold, unsure: state.unsure
        };
        state.quote.push(line);
        stage({ name: line.size + " " + line.name, qtys: line.qtys.slice(), unsure: line.unsure });
      };
      foot.appendChild(add);
      hintText = state.size === null ? "Pick a size"
        : (!staged.length ? "Pick one or more quantities"
        : (state.unsure ? "We'll start from the " + fmt(p.moq) + " minimum and help you size it"
        : (staged.length > 1 ? "We'll price each of these separately"
        /* The compare feature exists because buyers don't know. It has to speak
           at the moment of doubt, not after they have already used it. */
        : "Not sure? Tap another and we'll price both. It costs you nothing.")));
    } else {
      /* One control. Toggling tiers edits the set directly, so there is no
         add-versus-replace decision and no grey sentence to read. */
      var unchanged = sameSet(staged, existing.qtys) && state.unsure === !!existing.unsure;
      var empty = !staged.length;
      var save = mkBtn("btn--primary", empty ? "Remove from my quote" : "Save changes");
      save.disabled = unchanged;
      save.onclick = function () {
        if (empty) { state.quote.splice(existingIdx, 1); stage(); return; }
        existing.qtys = staged; existing.unsure = state.unsure;
        stage({ name: existing.size + " " + existing.name, qtys: staged.slice(), unsure: state.unsure, updated: true });
      };
      foot.appendChild(save);
      hintText = unchanged
        ? "Tap a quantity to change it"
        : (empty ? "Saving with nothing selected removes this size" : "");
    }

    /* The moment after a successful add is the moment to confirm it and to ask
       for the next line. Showing a greyed button that reads "Pick a size" —
       the words that were there before they did anything — makes the one action
       the builder exists for look like it failed. So it REPLACES the foot. */
    if (state.justAdded && state.size === null) {
      var done = document.createElement("div");
      done.className = "added";
      done.innerHTML =
        '<div class="added__head">' +
          '<span class="added__tick" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" ' +
            'stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 L9.5 18 L20 6"/></svg>' +
          "</span>" +
          '<p class="added__line"><b>' +
            (state.justAdded.updated ? "Updated" : "Added") + ": " + state.justAdded.name + ", " +
            (state.justAdded.unsure ? "quantity to be advised" : qtyLabel(state.justAdded.qtys)) +
            ".</b> Anything else for the same request?</p>" +
        "</div>";
      var pills = document.createElement("div");
      pills.className = "added__pills";
      CATEGORIES.forEach(function (c) {
        if (c.label === ALL || c.label === state.tab) return;
        var b = document.createElement("button");
        b.className = "tab";
        b.type = "button";
        b.textContent = c.label;
        b.onclick = function () { switchTab(c.label); revealCategory(); };
        pills.appendChild(b);
      });
      done.appendChild(pills);
      var more = document.createElement("p");
      more.className = "added__more";
      more.textContent = "Or pick another size above to add one more of these.";
      done.appendChild(more);
      d.appendChild(done);
      return;
    }

    var hint = document.createElement("span");
    hint.className = "foothint";
    hint.textContent = hintText;
    foot.appendChild(hint);
    d.appendChild(foot);
  }

  /* The rail grows with its content and stops at whichever ceiling it meets
     first: the bottom of the products column, or the viewport. The viewport
     one matters because a sticky element taller than the screen stops pinning,
     which would carry the continue button off-screen. */
  function fitRail() {
    var left = document.querySelector(".b1-grid > div");
    var rail = document.querySelector(".rail");
    if (!left || !rail) return;

    /* Stacked layout: the rail is in normal flow, no ceiling needed. */
    if (window.matchMedia("(max-width: 62rem)").matches) {
      rail.style.maxHeight = "";
      return;
    }
    var STICKY_TOP = 74, BREATHING = 38;
    var viewport = window.innerHeight - STICKY_TOP - BREATHING;
    var ceiling = Math.min(left.offsetHeight, viewport);
    rail.style.maxHeight = Math.max(200, Math.round(ceiling)) + "px";
  }

  /* Says what HCF has to do, in units that cannot be mistaken for money. */
  /* A lid is an attachment, not a line. Ticking it and then never adding the
     cup — or removing the cup later — must not leave "Matching 90mm lids" on a
     request that has no cups on it. */
  function activeLids() {
    return state.lids.filter(function (id) { return countFor(id) > 0; });
  }

  function tallyText() {
    if (!state.quote.length) return "Nothing to price yet";
    var lines = state.quote.length;
    var qs = 0;
    state.quote.forEach(function (q) { qs += q.unsure ? 1 : q.qtys.length; });
    return lines + (lines === 1 ? " product · " : " products · ") +
      qs + (qs === 1 ? " quantity to price" : " quantities to price");
  }

  function renderRail() {
    var body = $("#railBody");
    body.innerHTML = "";
    if (!state.quote.length) {
      body.innerHTML = '<div class="rail-empty"><div class="rail-drop">' +
        "<p><b>Nothing added yet</b></p>" +
        "<p>The products you pick collect here.</p>" +
        "</div></div>";
    } else {
      state.quote.forEach(function (q, i) {
        var r = document.createElement("div");
        r.className = "line";
        r.setAttribute("data-cold", q.cold ? "1" : "0");
        r.innerHTML = '<div class="thumb' + (hasPhoto(q.pid) ? " thumb--photo" : "") + '">' +
          shot(q.pid, q.shape, 19, 32, "") + "</div>" +
          '<div><div class="t">' + q.size + " " + q.name + '</div><div class="q">' +
            (q.unsure
              ? "Quantity to be advised" + '<span class="qtag">help me size it</span>'
              : qtyLabel(q.qtys) + " " + prod(q.pid).unit +
                (q.qtys.length > 1 ? '<span class="qtag">price both</span>' : "")) + "</div></div>";
        var x = document.createElement("button");
        x.className = "rm-btn";
        x.setAttribute("aria-label", "Remove " + q.size + " " + q.name);
        x.innerHTML = "&times;";
        x.onclick = function () { state.quote.splice(i, 1); saveState(); renderRail(); renderTiles(); renderConfig(); };
        r.appendChild(x);
        body.appendChild(r);
      });
      activeLids().forEach(function (id) {
        var lp = prod(id);
        var r = document.createElement("div");
        r.className = "line line--extra";
        /* Same three-column track as a product row, with the thumb slot left
           empty, so the lid text lines up under the products it belongs to. */
        r.innerHTML = '<div class="thumb thumb--none" aria-hidden="true"></div>' +
          '<div><div class="t">' + lidLabel(lp) + '</div>' +
          '<div class="q">priced with your order</div></div>';
        var x = document.createElement("button");
        x.className = "rm-btn";
        x.setAttribute("aria-label", "Remove " + lidLabel(lp));
        x.innerHTML = "&times;";
        x.onclick = function () {
          var at = state.lids.indexOf(id);
          if (at > -1) state.lids.splice(at, 1);
          saveState(); renderRail(); renderConfig();
        };
        r.appendChild(x);
        body.appendChild(r);
      });
    }
    /* Cups, sleeves and jars are unlike goods, and a line offering "5,000 or
       10,000" is one decision, not two. Adding them produced a bold figure in
       the exact slot a checkout puts the money — which meant nothing and read
       as a price. Count the work instead. */
    /* A "0" pill, "Nothing added yet" and "Nothing to price yet" were three
       ways of saying the same thing. Only the sentence survives. */
    $("#railCount").textContent = state.quote.length;
    $("#railCount").hidden = !state.quote.length;
    $("#railReady").hidden = !state.quote.length;
    $("#railAlt").hidden = !!state.quote.length;
    $("#tally").textContent = tallyText();
    /* Before anything is added, "add any of these to the same request" is a
       promise about a request that does not exist yet. */
    $("#tabsLede").textContent = state.quote.length
      ? "Add any of these to the same request"
      : "Everything we print";
    $("#toB2").disabled = !state.quote.length;

    /* The bar arrives with the first line, so its appearance is the reward for
       the add rather than a checkout-shaped bar full of zeroes on arrival. */
    syncBar();
    if (state.quote.length) {
      $("#moUnits").textContent = tallyText();
      $("#moProds").textContent = "We'll email your price";
    }
    fitRail();
  }

  /* Removals are undoable for eight seconds. A grey glyph that silently
     deletes a whole product, with no confirmation and no way back, is the one
     control on this screen that can lose real work. */
  var undoTimer = null;
  function offerUndo(text, restore) {
    var bar = $("#undoBar");
    bar.hidden = false;
    bar.innerHTML = "";
    bar.appendChild(document.createTextNode(text + " "));
    var b = document.createElement("button");
    b.type = "button";
    b.className = "linkish";
    b.textContent = "Undo";
    b.onclick = function () {
      window.clearTimeout(undoTimer);
      bar.hidden = true;
      restore();
      saveState(); renderReview(); renderRail(); renderTiles(); renderConfig();
      if (state.quote.length && state.screen !== "b2") show("b2");
    };
    bar.appendChild(b);
    window.clearTimeout(undoTimer);
    undoTimer = window.setTimeout(function () { bar.hidden = true; }, 8000);
  }

  function renderReview() {
    var host = $("#reviewList");
    host.innerHTML = "";
    if (!state.quote.length) {
      /* Emptying the list used to replace this screen with the build screen,
         scrolled to top, with no explanation of what had happened. */
      host.innerHTML = '<div class="review-empty"><p><b>Your request is empty.</b></p>' +
        '<p>Everything has been removed. Add a product and it will show up here.</p></div>';
      var back = document.createElement("button");
      back.className = "btn btn--primary";
      back.textContent = "Add products";
      back.onclick = function () { renderTiles(true); renderConfig(); renderRail(); show("b1"); };
      host.querySelector(".review-empty").appendChild(back);
      $("#toB3").disabled = true;
      return;
    }
    $("#toB3").disabled = false;
    var groups = {}, orderKeys = [];
    state.quote.forEach(function (q) {
      var label = prod(q.pid).group;
      if (!groups[label]) { groups[label] = []; orderKeys.push(label); }
      groups[label].push(q);
    });
    orderKeys.forEach(function (label) {
      var h = document.createElement("div");
      h.className = "rgroup-head";
      h.textContent = label;
      host.appendChild(h);
      groups[label].forEach(function (q) {
        var p = prod(q.pid);
        var r = document.createElement("div");
        r.className = "rline";
        r.setAttribute("data-cold", q.cold ? "1" : "0");

        var thumb = document.createElement("div");
        thumb.className = "thumb" + (hasPhoto(q.pid) ? " thumb--photo" : "");
        thumb.innerHTML = shot(q.pid, q.shape, 25, 44, "");
        r.appendChild(thumb);

        var main = document.createElement("div");
        main.className = "rmain";
        main.innerHTML = '<div class="nm">' + q.size + " " + q.name +
          (!q.unsure && q.qtys.length > 1 ? '<span class="qtag">price both</span>' : "") +
          (q.unsure ? '<span class="qtag">help me size it</span>' : "") + "</div>" +
          '<div class="mt">' + (q.unsure
            ? "We'll start from the " + fmt(p.moq) + " minimum and advise"
            : (q.qtys.length > 1
              ? "We'll price each of these separately"
              : "Minimum " + fmt(p.moq) + " " + p.unit + " · ready in " + p.lead + " from design approval")) + "</div>";

        var rows = document.createElement("div");
        rows.className = "rqtys";
        q.qtys.forEach(function (val, qi) {
          var row = document.createElement("div");
          row.className = "rqty";

          /* Two alternatives must stay two distinct alternatives. Stop the
             step that would land on a quantity already being compared, rather
             than letting the row silently become a duplicate of its neighbour. */
          var down = Math.max(p.moq, val - q.per);
          var up = val + q.per;
          var taken = function (n) { return n !== val && q.qtys.indexOf(n) > -1; };
          var step = function (to) {
            q.qtys[qi] = to;
            q.qtys.sort(function (a, b) { return a - b; });
            q.unsure = false;
            saveState(); renderReview(); renderRail();
          };

          var st = document.createElement("div");
          st.className = "stepper";
          var minus = document.createElement("button");
          minus.setAttribute("aria-label", "Decrease quantity");
          minus.innerHTML = "&minus;";
          var minusOff = val - q.per < p.moq, minusTaken = taken(down);
          minus.disabled = minusOff || minusTaken;
          minus.onclick = function () { step(down); };

          /* Seven precise taps on a sub-thumb target is not a way to change a
             number. The figure itself is the control. */
          var v = document.createElement("input");
          v.className = "v";
          v.type = "text";
          v.inputMode = "numeric";
          v.setAttribute("aria-label", "Quantity for " + q.size + " " + q.name);
          v.value = fmt(val);
          v.onfocus = function () { v.value = String(q.qtys[qi]); v.select(); };
          v.onblur = function () {
            var n = parseInt(String(v.value).replace(/[^0-9]/g, ""), 10);
            if (!n || isNaN(n)) { v.value = fmt(q.qtys[qi]); return; }
            n = Math.max(p.moq, Math.round(n / q.per) * q.per);   /* whole cases only */
            if (n !== q.qtys[qi] && q.qtys.indexOf(n) > -1) { v.value = fmt(q.qtys[qi]); return; }
            step(n);
          };
          v.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); v.blur(); } };

          var plus = document.createElement("button");
          plus.setAttribute("aria-label", "Increase quantity");
          plus.textContent = "+";
          var plusTaken = taken(up);
          plus.disabled = plusTaken;
          plus.onclick = function () { step(up); };
          st.appendChild(minus); st.appendChild(v); st.appendChild(plus);
          row.appendChild(st);

          var cases = document.createElement("span");
          cases.className = "cases";
          cases.textContent = fmt(val / q.per) + (val / q.per === 1 ? " case" : " cases") +
            " of " + fmt(q.per);
          row.appendChild(cases);

          if (q.qtys.length > 1) {
            /* Relabelled, not a second identical glyph: this drops one
               alternative, the control on the right deletes the product. */
            var dropQ = document.createElement("button");
            dropQ.className = "dropq";
            dropQ.type = "button";
            dropQ.textContent = "Stop comparing " + fmt(val);
            dropQ.onclick = function () {
              var was = q.qtys.slice();
              q.qtys.splice(qi, 1);
              saveState(); renderReview(); renderRail();
              offerUndo("Stopped comparing " + fmt(val) + " on " + q.size + " " + q.name + ".",
                        function () { q.qtys = was; });
            };
            row.appendChild(dropQ);
          }
          rows.appendChild(row);

          /* Never a dead control with no stated reason. */
          var why = "";
          if (minusTaken || plusTaken) {
            why = (plusTaken ? fmt(val) + " is as high as this row can go" : fmt(val) + " is as low as this row can go") +
              ". " + fmt(plusTaken ? up : down) + " is your other option.";
          } else if (minusOff) {
            why = fmt(p.moq) + " " + p.unit + " is the minimum we can print.";
          }
          if (why) {
            var note = document.createElement("p");
            note.className = "rwhy";
            note.textContent = why;
            rows.appendChild(note);
          }
        });
        main.appendChild(rows);
        r.appendChild(main);

        var x = document.createElement("button");
        x.className = "rm-line";
        x.type = "button";
        x.textContent = "Remove";
        x.setAttribute("aria-label", "Remove " + q.size + " " + q.name + " from your request");
        x.onclick = function () {
          var at = state.quote.indexOf(q);
          if (at < 0) return;
          state.quote.splice(at, 1);
          saveState(); renderRail(); renderTiles(); renderConfig(); renderReview();
          offerUndo("Removed " + q.size + " " + q.name + ".",
                    function () { state.quote.splice(at, 0, q); });
        };
        r.appendChild(x);

        host.appendChild(r);
      });
    });

    /* Lids were ticked next to a product; the request has to show them. */
    var lids = activeLids();
    if (lids.length) {
      var lh = document.createElement("div");
      lh.className = "rgroup-head";
      lh.textContent = "Also quote";
      host.appendChild(lh);
      lids.forEach(function (id) {
        var lp = prod(id);
        var lr = document.createElement("div");
        lr.className = "rline rline--extra";
        lr.innerHTML = '<div class="rmain"><div class="nm">' + lidLabel(lp) +
          '</div><div class="mt">Priced to match your ' + lp.name + " order</div></div>";
        var lx = document.createElement("button");
        lx.className = "rm-line";
        lx.type = "button";
        lx.textContent = "Remove";
        lx.setAttribute("aria-label", "Remove " + lp.lid);
        lx.onclick = function () {
          var at = state.lids.indexOf(id);
          if (at < 0) return;
          state.lids.splice(at, 1);
          saveState(); renderReview(); renderRail(); renderConfig();
          offerUndo("Removed the lids.", function () { state.lids.splice(at, 0, id); });
        };
        lr.appendChild(lx);
        host.appendChild(lr);
      });
    }
  }

  /* Weeks the customer is actually promising us, against the slowest thing on
     their quote. "Just planning ahead" is not a deadline, so it never clashes. */
  var WHEN_WEEKS = { "2–3 weeks": 3, "About a month": 4, "2–3 months": 12 };

  function leadVerdict(answer) {
    if (!state.quote.length) return null;
    var want = WHEN_WEEKS[answer];
    if (!want) return null;
    var slowest = null, slowName = "";
    state.quote.forEach(function (q) {
      var pr = prod(q.pid);
      if (slowest === null || pr.leadMax > slowest) { slowest = pr.leadMax; slowName = pr.name.toLowerCase(); }
    });
    if (slowest === null) return null;
    if (slowest > want) {
      return { clash: true, text: "Heads up: your " + slowName + " runs " + slowest +
        " weeks from design approval, so " + answer.toLowerCase() +
        " is tight. Keep the date and we'll come back with rush options, or call (480) 428-1999." };
    }
    return { clash: false, text: "That works for everything on your list." };
  }

  function renderQs(keep) {
    var host = $("#qBlock");
    host.innerHTML = "";
    QS.forEach(function (item) {
      var w = document.createElement("div");
      w.className = "qitem";
      w.setAttribute("data-q", item.id);
      w.innerHTML = '<div class="qh"><h3 class="h-sm">' + item.q + "</h3>" +
        (item.req ? '<span class="req">Required</span>' : '<span class="opt">Optional</span>') +
        '</div><p class="qs">' + item.s + "</p>";
      var row = document.createElement("div");
      row.className = "chips";
      item.o.forEach(function (opt, oi) {
        var val = item.wide ? opt[0] : opt;
        var b = document.createElement("button");
        b.className = "chip" + (item.wide ? " wide" : "");
        b.type = "button";
        b.setAttribute("data-i", oi);
        b.setAttribute("aria-pressed", state.answers[item.id] === val ? "true" : "false");
        b.innerHTML = item.wide ? "<span>" + opt[0] + '</span><span class="cs">' + opt[1] + "</span>" : opt;
        b.onclick = function () {
          state.answers[item.id] = val; saveState();
          renderQs(item.id + ":" + oi); syncB3();
        };
        row.appendChild(b);
      });
      w.appendChild(row);
      /* "Tells us right here if that's tight" was a promise the screen never
         kept: you could pick 2–3 weeks with 4–5 week jars on the quote and
         nothing happened. The tool already knows the slowest lead time. */
      if (item.id === "when" && state.answers.when) {
        var verdict = leadVerdict(state.answers.when);
        if (verdict) {
          var vn = document.createElement("p");
          vn.className = "qverdict" + (verdict.clash ? " qverdict--clash" : "");
          vn.textContent = verdict.text;
          w.appendChild(vn);
        }
      }
      host.appendChild(w);
    });
    if (keep) {
      var parts = keep.split(":");
      var again = host.querySelector('[data-q="' + parts[0] + '"] .chip[data-i="' + parts[1] + '"]');
      if (again) { try { again.focus({ preventScroll: true }); } catch (e) { again.focus(); } }
    }
  }
  /* The button stays live and explains itself on click. A disabled control
     with no stated reason is the most reliable way to strand someone. */
  function syncB3() {
    if (state.answers.when) { $("#b3Gate").hidden = true; }
    var note = $("#qNote");
    if (note && note.value !== state.note) note.value = state.note;
  }

  function b3Blocked() {
    var gate = $("#b3Gate");
    gate.hidden = false;
    var first = document.querySelector("#qBlock .qitem");
    if (!first) return;

    first.classList.add("qitem--wanted");
    window.setTimeout(function () { first.classList.remove("qitem--wanted"); }, 2000);

    /* Focus first, with preventScroll — a plain focus() both jumps the page and
       cancels the smooth scroll we are about to ask for. */
    var chip = first.querySelector(".chip");
    if (chip) { try { chip.focus({ preventScroll: true }); } catch (e) { chip.focus(); } }

    /* "nearest" rather than "center": centring the question pushes the gate
       message that just appeared at the foot of the screen back out of view,
       so the explanation vanishes at the moment it is needed. */
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    first.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }

  /* "Also quote matching 90mm lids" is an instruction to us; on a line of the
     request it has to read as the thing itself. */
  function lidLabel(p) {
    var t = String(p.lid).replace(/^Also quote /, "");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* A reference the customer can quote back, generated from the session rather
     than the clock so it stays stable if this screen re-renders. */
  var reqRef = null;
  function requestRef() {
    if (!reqRef) {
      var n = 0, seed = (state.quote.length * 977) + state.quote.reduce(function (a, q) {
        return a + q.pid.length + q.qtys.length + Math.max.apply(null, q.qtys);
      }, 0);
      n = 1000 + (seed % 9000);
      reqRef = "HCF-" + n;
    }
    return reqRef;
  }

  function renderRecap() {
    var host = $("#recap");
    host.innerHTML = "";

    function row(label, value, strong) {
      var r = document.createElement("div");
      r.className = "r";
      r.innerHTML = "<span>" + label + "</span><b" + (strong ? '' : ' class="plain"') + ">" + value + "</b>";
      host.appendChild(r);
      return r;
    }

    state.quote.forEach(function (q) {
      row(esc(q.size + " " + q.name) +
        (!q.unsure && q.qtys.length > 1 ? ' <span class="qtag">price both</span>' : "") +
        (q.unsure ? ' <span class="qtag">help me size it</span>' : ""),
        q.unsure ? "To be advised" : qtyLabel(q.qtys) + " " + prod(q.pid).unit, true);
    });
    activeLids().forEach(function (id) {
      row(esc(lidLabel(prod(id))), "To be priced", true);
    });
    /* No grand total. Cups plus sleeves plus jars was never a number anyone
       could use, and it sat exactly where a checkout puts the money. */

    var labels = { when: "Needed by", artwork: "Artwork", use: "Used for", cadence: "Order type" };
    ["when", "artwork", "use", "cadence"].forEach(function (k) {
      if (!state.answers[k]) return;
      row(labels[k], esc(state.answers[k]), false);
    });
    if (state.note && state.note.trim()) {
      var n = document.createElement("div");
      n.className = "r r--note";
      n.innerHTML = "<span>Your note</span><b class=\"plain\">" + esc(state.note.trim()) + "</b>";
      host.appendChild(n);
    }

    row("Reference", requestRef(), false);
    row("Sent to", esc(($("#f-email").value || "").trim()), false);
    row("Contact", esc(($("#f-name").value || "").trim() + " · " + ($("#f-biz").value || "").trim()), false);
    row("Phone", esc(($("#f-phone").value || "").trim()), false);

    $("#sentTo").innerHTML = "Copy sent to <b>" + esc(($("#f-email").value || "").trim()) +
      "</b>. Check your inbox in the next few minutes. Your reference is <b>" + requestRef() + "</b>.";
  }

  $("#toB2").onclick = function () { renderReview(); show("b2"); };
  $("#moNext").onclick = function () { renderReview(); show("b2"); };
  $("#backB1").onclick = function () { goBack("b1"); };
  $("#backB2").onclick = function () { goBack("b2"); };
  $("#backB3").onclick = function () { goBack("b3"); };
  $("#backFootB1").onclick = function () { goBack("b1"); };
  $("#backFootB2").onclick = function () { goBack("b2"); };
  $("#toB3").onclick = function () { renderQs(); syncB3(); show("b3"); };
  $("#toB4").onclick = function () {
    if (!state.answers.when) { b3Blocked(); return; }
    show("b4");
  };
  /* The old failure path set the border to var(--rm) — the brand orange, the
     same colour as the button just pressed — and said nothing. It read as a
     highlight, so the form looked broken at the moment it mattered most. */
  var FIELDS = [
    { id: "f-name",  err: "e-name",  msg: "We need a name to put on the quote." },
    { id: "f-biz",   err: "e-biz",   msg: "Your shop's name is fine, whatever's on the sign." },
    { id: "f-email", err: "e-email", msg: "Add your email so we can send the quote.",
      re: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      bad: "That doesn't look like an email address. Check it and we'll send your quote there." },
    /* Forgiving on shape, strict on substance: people type (480) 428-1999,
       480.428.1999 and +1 480 428 1999, and all three are the same number.
       Count the digits instead of policing the punctuation. */
    { id: "f-phone", err: "e-phone", msg: "Add a number in case we need to check a detail.",
      re: /^\D*(\d\D*){10,15}$/,
      bad: "That doesn't look like a phone number. Ten digits is enough." }
  ];

  function clearErrors() {
    FIELDS.forEach(function (f) {
      document.getElementById(f.id).classList.remove("input--bad");
      var e = document.getElementById(f.err);
      e.hidden = true; e.textContent = "";
    });
    $("#formGate").hidden = true;
  }

  function markError(f, text) {
    var el = document.getElementById(f.id);
    var e = document.getElementById(f.err);
    el.classList.add("input--bad");
    el.setAttribute("aria-describedby", f.err);
    e.textContent = text;
    e.hidden = false;
  }

  FIELDS.forEach(function (f) {
    document.getElementById(f.id).oninput = function () {
      document.getElementById(f.id).classList.remove("input--bad");
      document.getElementById(f.err).hidden = true;
    };
  });

  /* The whole request as one object, in the shape a submit endpoint wants.
     Quantities stay an ARRAY on every line: they are alternatives to price
     against each other, never a sum, so nothing downstream may add them up. */
  function buildPayload() {
    var val = function (id) { return ($("#" + id).value || "").trim(); };
    return {
      ref: requestRef(),
      contact: {
        name: val("f-name"),
        business: val("f-biz"),
        email: val("f-email"),
        phone: val("f-phone")
      },
      lines: state.quote.map(function (q) {
        var p = prod(q.pid);
        return {
          productId: q.pid,
          product: q.name,
          size: q.size,
          quantities: q.qtys.slice(),      /* alternatives, never a total */
          unitsPerCase: q.per,
          cases: q.qtys.map(function (n) { return n / q.per; }),
          quantityUnknown: !!q.unsure,
          alsoQuoteLids: state.lids.indexOf(q.pid) > -1,
          leadTime: p ? p.lead : ""
        };
      }),
      answers: {
        needBy: state.answers.when || "",
        artwork: state.answers.artwork || "",
        useCase: state.answers.use || "",
        cadence: state.answers.cadence || ""
      },
      note: (state.note || "").trim()
    };
  }

  $("#contactForm").onsubmit = function (e) {
    e.preventDefault();
    if (state.sent) return;   /* Back onto this form must not send a second copy */

    clearErrors();
    var bad = [];
    FIELDS.forEach(function (f) {
      var el = document.getElementById(f.id);
      var v = el.value.trim();
      if (!v) { markError(f, f.msg); bad.push(f); return; }
      /* Non-blank was the only test, so "jane@" sent happily and died silently. */
      if (f.re && !f.re.test(v)) { markError(f, f.bad); bad.push(f); }
    });
    if (bad.length) {
      var gate = $("#formGate");
      gate.textContent = bad.length === 1 ? "One thing missing above." : bad.length + " things missing above.";
      gate.hidden = false;
      var first = document.getElementById(bad[0].id);
      /* Scroll it clear of the sticky header rather than relying on focus,
         which on a phone raises the keyboard over the button instead. */
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var top = window.scrollY + first.getBoundingClientRect().top - 110;
      try { window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" }); }
      catch (e2) { window.scrollTo(0, top); }
      try { first.focus({ preventScroll: true }); } catch (e3) { first.focus(); }
      return;
    }

    /* ──────────────────────────────────────────────────────────────────
       SUBMIT SEAM — the one place the live site differs.

       Everything above this line builds `payload`. On the theme, POST it to
       your server-side route and only advance to b5 once that resolves; the
       route holds the HubSpot private-app token, which must never reach the
       browser. Nothing here leaves the page.
       ────────────────────────────────────────────────────────────────── */
    var payload = buildPayload();
    window.HCF_QUOTE_LAST_PAYLOAD = payload;      /* inspectable in the console */
    if (typeof window.HCF_QUOTE_SUBMIT === "function") {
      try { window.HCF_QUOTE_SUBMIT(payload); } catch (e4) {}
    }

    state.sent = true;        /* set before clearing so nothing can re-save it */
    renderRecap();
    clearState();             /* the request is sent; a resumed copy would be a ghost */
    var send = $("#sendBtn");
    send.disabled = true;
    send.textContent = "Request sent";
    show("b5");
  };
  $("#talkBtn").onclick = function () {
    window.alert("Prototype: this opens the Talk to us route: phone, booking calendar, and a short note form.\n\nWe'll keep everything you've built: a rep sees exactly this screen.");
  };
  function sampleRoute() {
    window.alert("Prototype: this hands off to your existing free sample box flow.\n\nWhatever is already in the quote request travels with it, so nothing they've built is lost.");
  }
  $("#sampleBtn").onclick = sampleRoute;
  /* The empty-rail button is rebuilt on every render, so it is bound there. */
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "sampleRail") sampleRoute();
  });

  $("#qNote").oninput = function () { state.note = $("#qNote").value; saveState(); };

  autoOpen();
  renderTabs();
  function renderPhotoRows() {
    var host = $("#photoRows");
    host.innerHTML = "";
    PRODUCTS.forEach(function (p) {
      var row = document.createElement("div");
      row.className = "prow";

      var pv = document.createElement("div");
      pv.className = "prow__pv" + (hasPhoto(p.id) ? " prow__pv--photo" : "");
      pv.innerHTML = shot(p.id, p.shape, p.sizes[p.sizes.length - 1][1], p.sizes[p.sizes.length - 1][2], "");
      row.appendChild(pv);

      var main = document.createElement("div");
      main.className = "prow__main";
      main.innerHTML = '<div class="prow__nm">' + p.name + "</div>";

      var acts = document.createElement("div");
      acts.className = "prow__acts";

      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.id = "file-" + p.id;
      input.onchange = function () {
        if (!input.files || !input.files[0]) return;
        ingestPhoto(p.id, input.files[0], function () {
          renderPhotoRows(); renderTiles(); renderConfig(); renderRail();
        });
      };

      var pick = document.createElement("label");
      pick.setAttribute("for", input.id);
      pick.textContent = hasPhoto(p.id) ? "Replace" : "Choose image";
      acts.appendChild(pick);
      acts.appendChild(input);

      if (hasPhoto(p.id)) {
        var copy = document.createElement("button");
        copy.type = "button";
        copy.textContent = "Copy for Claude";
        copy.onclick = function () {
          offerText(JSON.stringify({ id: p.id, src: IMAGES[p.id] }),
            p.name + ", " + Math.round(IMAGES[p.id].length / 1024) + " KB.");
        };
        acts.appendChild(copy);

        var clear = document.createElement("button");
        clear.type = "button";
        clear.textContent = "Remove";
        clear.onclick = function () {
          IMAGES[p.id] = "";
          savePhotos();
          renderPhotoRows(); renderTiles(); renderConfig(); renderRail();
        };
        acts.appendChild(clear);

        var kb = document.createElement("span");
        kb.className = "muted";
        kb.textContent = Math.round(IMAGES[p.id].length / 1024) + " KB";
        acts.appendChild(kb);
      }

      main.appendChild(acts);
      row.appendChild(main);
      host.appendChild(row);
    });

    var total = 0, count = 0;
    Object.keys(IMAGES).forEach(function (k) { if (IMAGES[k]) { total += IMAGES[k].length; count++; } });
    var tally = document.createElement("p");
    tally.style.cssText = "grid-column:1/-1;margin:4px 0 0;font-size:12px;color:var(--g5)";
    tally.textContent = count
      ? count + " of " + PRODUCTS.length + " products have a photo · " + Math.round(total / 1024) + " KB total"
      : "No photos set — every product is showing its illustration.";
    host.appendChild(tally);
  }

  /* Prototype tooling. There is no button for this anywhere in the interface —
     it opens only for ?photos=1, so nobody arriving at the page can fall into
     a developer utility that overwrites the catalogue photography. */
  var PHOTO_TOOL = /(^|[?&])photos=1(&|$)/.test(window.location.search);
  if (PHOTO_TOOL) {
    var pb = document.createElement("button");
    pb.className = "btn btn--quiet";
    pb.id = "photoBtn";
    pb.style.fontSize = "13px";
    pb.textContent = "Product photos";
    document.querySelector(".head-right").insertBefore(pb, $("#talkBtn"));
  }

  if (PHOTO_TOOL) $("#photoBtn").onclick = function () {
    var panel = $("#photoSet");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      /* The panel lives inside screen one, so opening it from a later screen
         has to bring screen one with it or the click looks like a no-op. */
      if (state.screen !== "b1") { renderTiles(); renderConfig(); renderRail(); show("b1"); }
      renderPhotoRows();
      panel.scrollIntoView({ block: "nearest" });
    }
  };
  $("#photoClose").onclick = function () { $("#photoSet").hidden = true; };

  /* Files-form publish: index.html carries over untouched and only the photo
     data file changes, so the page source never has to be rebuilt in JS. */
  $("#photoSave").onclick = function () {
    var btn = $("#photoSave");
    var out = {}, n = 0;
    Object.keys(IMAGES).forEach(function (k) { if (IMAGES[k]) { out[k] = IMAGES[k]; n++; } });
    if (!n) { flashBtn(btn, "Nothing to save", "Save to the page"); return; }

    var payload = JSON.stringify(out);
    btn.disabled = true;
    btn.textContent = "Saving\u2026";

    function report(msg) {
      $("#photoOutNote").textContent = msg;
      $("#photoOut").hidden = false;
      $("#photoOutText").value = "";
    }

    var api = (window.claude && window.claude.use)
      ? window.claude.use("artifact")
      : Promise.resolve(null);

    api.then(function (artifact) {
      if (!artifact) throw { code: "not_granted" };
      return artifact.publish({ "photos.json": payload });
    }).then(function () {
      btn.disabled = false;
      flashBtn(btn, "Saved \u2713", "Save to the page");
      report("Published. Anyone with the link now sees these photos.");
    }).catch(function (e) {
      btn.disabled = false;
      var code = (e && e.code) || "upstream_error";
      var msg = (code === "not_writer" || code === "not_granted")
          ? "This view is read-only \u2014 photos stay in your browser."
        : code === "too_large"
          ? "Too large to publish. Remove a photo and try again."
        : code === "conflict"
          ? "Someone published first \u2014 reloading to their version."
        : "Couldn't publish (" + code + "). Photos are still saved in your browser.";
      flashBtn(btn, "Not saved", "Save to the page");
      report(msg);
    });
  };

  /* Photos live in this browser only. Getting them into the published page —
     so anyone with the link sees them — means handing the encoded text back
     to Claude to write into the source. */
  $("#photoExport").onclick = function () {
    var btn = $("#photoExport");
    var out = {}, n = 0;
    Object.keys(IMAGES).forEach(function (k) { if (IMAGES[k]) { out[k] = IMAGES[k]; n++; } });
    if (!n) { flashBtn(btn, "Nothing to copy", "Copy all for Claude"); return; }
    var txt = JSON.stringify(out);
    offerText(txt, n + (n === 1 ? " photo" : " photos") + ", " + Math.round(txt.length / 1024) + " KB.");
    flashBtn(btn, "Ready below \u2193", "Copy all for Claude");
  };

  function flashBtn(btn, msg, revert) {
    btn.textContent = msg;
    window.setTimeout(function () { btn.textContent = revert; }, 2200);
  }

  /* Artifacts run in a sandboxed frame where the async clipboard API is
     usually denied. Put the text on screen, selected, and treat an actual
     clipboard write as a bonus rather than the mechanism. */
  function offerText(txt, note) {
    var box = $("#photoOut");
    var ta = $("#photoOutText");
    box.hidden = false;
    ta.value = txt;
    ta.focus();
    ta.select();
    try { ta.setSelectionRange(0, txt.length); } catch (e) {}

    var copied = false;
    try { copied = document.execCommand("copy"); } catch (e) {}

    var keys = /Mac|iPhone|iPad/.test(window.navigator.platform || "") ? "\u2318C" : "Ctrl+C";
    $("#photoOutNote").textContent = copied
      ? "Copied to your clipboard. " + note + " Paste it into the chat."
      : "Selected below \u2014 press " + keys + " to copy. " + note + " Then paste it into the chat.";

    if (!copied && window.navigator.clipboard && window.navigator.clipboard.writeText) {
      window.navigator.clipboard.writeText(txt).then(function () {
        $("#photoOutNote").textContent = "Copied to your clipboard. " + note + " Paste it into the chat.";
      }, function () {});
    }
    box.scrollIntoView({ block: "nearest" });
  }

  restoreState();

  /* A hash wins over the saved screen: an inbound link is a fresh intent. */
  var deep = screenFromHash();
  if (deep && deep !== "b5") {
    if (deep === "b1" || state.quote.length) {
      if (!(deep === "b4" && !state.answers.when)) state.screen = deep;
    }
  }

  loadPhotos();
  loadPublishedPhotos().then(function (found) {
    if (!found) return;
    loadPhotos();               /* unsaved local edits win over the published set */
    renderTiles(); renderConfig(); renderRail();
    if (!$("#photoSet").hidden) renderPhotoRows();
  });
  /* renderTabs runs again here, after restoreState: the first pass stamped the
     default category, and a restored session may be sitting on another one. */
  renderTabs();
  renderTiles(true);
  renderConfig();
  renderRail();
  renderQs();
  syncB3();
  renderReview();

  /* Seed history so the first Back has somewhere to go, then render the
     screen we resolved to without pushing a second entry for it. */
  trail = [state.screen];
  depth = 0;
  try { window.history.replaceState({ screen: state.screen, i: 0 }, "", "#" + state.screen); } catch (e) {}
  show(state.screen, false);
})();
