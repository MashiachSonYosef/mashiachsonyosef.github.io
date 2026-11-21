#!/usr/bin/env python3
"""Mends of 21 November 2026 to the reader page, findings 5, 6, 7, 10 and 11 of the first reader's report.

usage: python3 patch.py <reader dir>

Edits <reader dir>/zone.html by exact-string replacement. Every old string must occur exactly once in the
page it is given; nothing is written unless every one does.
"""
import sys

EDITS = []


def edit(finding, old, new):
    EDITS.append((finding, old, new))


# ---- finding 11: a fault is not an absence -------------------------------------------------------------------
# the two helpers, beside fetchBin
edit("11 helpers", r'''    return JSON.parse(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
  };
''', r'''    return JSON.parse(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
  };
  // A FAULT IS NOT AN ABSENCE (21 November 2026; a shard that did not arrive
  // is not an empty shard, routesFor, and neither is anything else). A file
  // the shelf does not hold is an answer, and it is kept: fetchBin's own word
  // for a bin the record does not pin, or the shelf's 404. A fetch that
  // failed on the way, or that the shelf answered with anything else, is no
  // answer: the load said «No book is published on this page yet» of a
  // dropped connection and of a 503, and the lattice, the source-suggested
  // file, the map of pointers and the toggle ledger each kept one failed
  // fetch as an absence for the rest of the visit. So binAbsent says which
  // of fetchBin's refusals is an absence, and fetchJson gives a file's JSON,
  // null where the shelf holds none, and throws where it did not arrive; a
  // loader that keeps its fetch lets go of one that threw, and what needs
  // the file next asks for it again
  const binAbsent = (e) => /: (?:not on this shelf|404)$/u.test(String((e && e.message) || ""));
  const fetchJson = (url) => fetch(url).then((r) => { if (r.ok) return r.json(); if (r.status === 404) return null; throw new Error(`${url}: ${r.status}`); });
''')

# the lattice: a fault is asked again, and the lines follow when it lands
edit("11 lattice", r'''  let latticeStore = null, latticePromise = null;
  const latticeReady = () => {
    if (!latticePromise) latticePromise = fetchBin(`${BOOK}.lattice`)
      .then((s) => { latticeStore = s; window.__latticeStore = s; return s; })
      .catch((e) => { if (String((e && e.message) || "").startsWith("REFUSED")) { window.__latticeRefused = e.message; console.error(e.message); } return null; });
''', r'''  // (a fetch that failed on the way is not kept: A FAULT IS NOT AN ABSENCE,
  // beside fetchBin. A refusal, and a book with no lattice on the shelf, are
  // answers and stay. The next pool, card or switch that needs the lattice
  // asks again (poolFor, openHud), and when it lands after a fault the lines
  // drawn without it are drawn again under it, as they are when it lands at
  // the load)
  let latticeStore = null, latticePromise = null, latticeMissed = false;
  const latticeReady = () => {
    if (!latticePromise) latticePromise = fetchBin(`${BOOK}.lattice`)
      .then((s) => { latticeStore = s; window.__latticeStore = s; if (latticeMissed) { latticeMissed = false; setTimeout(() => repaintGlossOrder(), 0); } return s; })
      .catch((e) => { if (String((e && e.message) || "").startsWith("REFUSED")) { window.__latticeRefused = e.message; console.error(e.message); } else if (!binAbsent(e)) { latticePromise = null; latticeMissed = true; } return null; });
''')

# the source-suggested file: the next card asks again (its own guard reads suggestedWait)
edit("11 suggested", r'''    if (!suggestedWait) suggestedWait = fetch(`${ROOT}data/source-suggested/${BOOK}.json`).then((r) => (r.ok ? r.json() : null))
      .then((f) => { SUGGESTED = f && f.book === BOOK && Array.isArray(f.places) ? f : null; window.__suggested = { on: suggested, laid: SUGGESTED ? SUGGESTED.counts.laid : 0 }; return SUGGESTED; }).catch(() => null);
''', r'''    // (a fetch that failed is let go, and the next card asks again: A FAULT IS NOT AN ABSENCE, beside fetchBin)
    if (!suggestedWait) suggestedWait = fetchJson(`${ROOT}data/source-suggested/${BOOK}.json`)
      .then((f) => { SUGGESTED = f && f.book === BOOK && Array.isArray(f.places) ? f : null; window.__suggested = { on: suggested, laid: SUGGESTED ? SUGGESTED.counts.laid : 0 }; return SUGGESTED; }).catch(() => { suggestedWait = null; return null; });
''')

# the map of pointers: asked once after the first paint, so a fault is asked again by the next card
edit("11 form-of", r'''  let FORM_OF = null, formOfWait = null;
  const formOfReady = () => {
    if (FORM_OF) return Promise.resolve(FORM_OF);
    if (!formOfWait) formOfWait = fetch(`${ROOT}data/form-of-pills-v1.json`).then((r) => (r.ok ? r.json() : null))
      .then((f) => { FORM_OF = f && f.keys ? f : null; window.__formOf = FORM_OF ? { keys: Object.keys(FORM_OF.keys).length, pills: FORM_OF.counts.pills, resolved: FORM_OF.counts.resolved } : null; return FORM_OF; }).catch(() => { window.__formOf = null; return null; });
''', r'''  // (a fetch that failed is let go: A FAULT IS NOT AN ABSENCE, beside
  // fetchBin. The map is asked for once, after the first paint, so nothing
  // would ask again: the next card that opens does, formOfAsk, and the lines
  // and that card follow as they do when the map lands the first time)
  let FORM_OF = null, formOfWait = null, formOfMissed = false, formOfAsk = null;
  const formOfReady = () => {
    if (FORM_OF) return Promise.resolve(FORM_OF);
    if (!formOfWait) formOfWait = fetchJson(`${ROOT}data/form-of-pills-v1.json`)
      .then((f) => { FORM_OF = f && f.keys ? f : null; window.__formOf = FORM_OF ? { keys: Object.keys(FORM_OF.keys).length, pills: FORM_OF.counts.pills, resolved: FORM_OF.counts.resolved } : null; return FORM_OF; }).catch(() => { window.__formOf = null; formOfWait = null; formOfMissed = true; return null; });
''')

edit("11 form-of asked by a card", r'''    closeHud(false);
    const myGen = ++hudGen;
    activeEl = el;
''', r'''    closeHud(false);
    const myGen = ++hudGen;
    activeEl = el;
    // what a fault kept away is asked for again by the next card (A FAULT IS
    // NOT AN ABSENCE, beside fetchBin): the map of pointers (formOfReady), and
    // the lattice, since under «the letters only», or a lattice order with
    // the pointing kept, no pool waits for it and nothing else would ask; the
    // card is sorted again when it lands
    if (formOfMissed && !FORM_OF && !formOfWait && formOfAsk) formOfAsk();
    if (latticeMissed && !latticeStore && !latticePromise) latticeReady().then((s) => { if (s && redrawReadings) redrawReadings(); });
''')

edit("11 form-of ask", r'''    later(() => formOfReady().then((f) => { if (!f) return; applyGlossOrder(defOrder); repaintGlossOrder(); if (!hud.hidden) reopenCardFree(); else if (redrawReadings) redrawReadings(); })); }
''', r'''    formOfAsk = () => formOfReady().then((f) => { if (!f) return; applyGlossOrder(defOrder); repaintGlossOrder(); if (!hud.hidden) reopenCardFree(); else if (redrawReadings) redrawReadings(); });
    later(() => formOfAsk()); }
''')

# the toggle ledger: the next lay that needs it asks again
edit("11 toggle ledger", r'''    if (!hudTogglesWait) hudTogglesWait = fetch(`${ROOT}data/hud-toggles/${BOOK}.json`).then((r) => (r.ok ? r.json() : null))
      .then((f) => { HUD_TOGGLES = f && f.book === BOOK && Array.isArray(f.runs) && f.sets ? f : null; return HUD_TOGGLES; }).catch(() => null);
''', r'''    // (a fetch that failed is let go, and the next lay that needs the file asks again: A FAULT IS NOT AN ABSENCE, beside fetchBin)
    if (!hudTogglesWait) hudTogglesWait = fetchJson(`${ROOT}data/hud-toggles/${BOOK}.json`)
      .then((f) => { HUD_TOGGLES = f && f.book === BOOK && Array.isArray(f.runs) && f.sets ? f : null; return HUD_TOGGLES; }).catch(() => { hudTogglesWait = null; return null; });
''')

# the load: a fault is said as a fault; a book the shelf does not hold is said as before
edit("11 the load", r'''    document.getElementById("meta").textContent =
      String((e && e.message) || "").startsWith("REFUSED")
        ? e.message
        : "No book is published''', r'''    // and a fault is not an absence (beside fetchBin, 21 November 2026):
    // only a book the shelf does not hold is said to be unpublished. Whatever
    // else stopped the load, a dropped connection, a 503, a file that could
    // not be read, is said as a fault, with its own words
    const said = String((e && e.message) || "");
    document.getElementById("meta").textContent =
      said.startsWith("REFUSED")
        ? e.message
        : !binAbsent(e)
        ? `This book could not be loaded: something the page asked for did not arrive, or could not be read (${said || "no reason given"}). That is a fault on the way, not the shelf: nothing here says the book is not published. Nothing is shown; load the page again.`
        : "No book is published''')

# ---- finding 7: the defaults are stamped once every source they name could be met ----------------------------
edit("7", r'''        for (const [id, m] of Object.entries(index.m_sources)) if (m && SOURCE_DEFAULTS.off[m.key]) sourcesOff.add(id);
        try { localStorage.setItem(SOURCES_KEY, JSON.stringify([...sourcesOff])); localStorage.setItem(DEFAULTS_KEY, ver); } catch { /* the choice still stands on this page */ }
''', r'''        for (const [id, m] of Object.entries(index.m_sources)) if (m && SOURCE_DEFAULTS.off[m.key]) sourcesOff.add(id);
        // THE DEFAULTS ARE STAMPED AS GIVEN ONCE EVERY SOURCE THEY NAME COULD BE
        // MET (21 November 2026). An overlay's sources join the index from the
        // overlay's own file (above), and the version was stamped as given
        // whether or not that file had arrived: on a first visit where the
        // Samaritan overlay's index failed once, Uhlemann's Latin met no id,
        // the stamp was written all the same, and it never rested off for
        // that reader again. So while a source the record rests off has met
        // no id and an overlay's index did not arrive, the stamp waits and the
        // next visit gives the defaults again. A source no file carries does
        // not hold the stamp back once every overlay's index is here
        const met = new Set(Object.values(index.m_sources).map((m) => m && m.key));
        const owed = Object.keys(SOURCE_DEFAULTS.off).some((k) => SOURCE_DEFAULTS.off[k] && !met.has(k)) && OVERLAY_IX.some((ix) => !ix);
        try { localStorage.setItem(SOURCES_KEY, JSON.stringify([...sourcesOff])); if (!owed) localStorage.setItem(DEFAULTS_KEY, ver); } catch { /* the choice still stands on this page */ }
''')

# ---- finding 6: the run files are asked for when a run is to be laid ------------------------------------------
edit("6 run cards", r'''    if (RUN_CARDS && RUN_CARDS.books && RUN_CARDS.books[BOOK])
      RUN_CARDS = await fetch(`${ROOT}data/run-cards/${BOOK}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    else RUN_CARDS = null;
''', r'''    // THE RUN FILES ARE ASKED FOR WHEN A RUN IS TO BE LAID (21 November 2026).
    // The book's run cards and its HUD runs were both asked for here, before
    // the first word was drawn, and at rest neither is laid: the license runs
    // rest off, and off lays no run of either file (HUD_LANES.lay, below).
    // Genesis asked for 22,708 and 53,278 bytes on every visit and laid none
    // of them. So only whether the indexes list the book is kept here; the
    // lay asks for the two files the first time the switches call for a run
    // of them (runFilesReady, below) and waits for them, so a reader who
    // kept the runs on has them under the first paint as before
    const runCardsListed = !!(RUN_CARDS && RUN_CARDS.books && RUN_CARDS.books[BOOK]);
    RUN_CARDS = null;
''')

edit("6 HUD runs", r'''    HUD_RUNS = HUD_RUNS && HUD_RUNS.books && HUD_RUNS.books[BOOK] && HUD_RUNS.books[BOOK].runs
      ? await fetch(`${ROOT}data/hud-runs/${BOOK}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null) : null;
    const hudRunCards = HUD_RUNS && HUD_RUNS.book === BOOK && Array.isArray(HUD_RUNS.cards) ? HUD_RUNS.cards : [];
''', r'''    const hudRunsListed = !!(HUD_RUNS && HUD_RUNS.books && HUD_RUNS.books[BOOK] && HUD_RUNS.books[BOOK].runs);
    HUD_RUNS = null;
    let hudRunCards = [];
    // the two run files, asked for together the first time a lay needs them
    // (THE RUN FILES, above). A fetch that failed is let go, neither file is
    // taken, and the next lay that needs them asks again (A FAULT IS NOT AN
    // ABSENCE, beside fetchBin); until then no run of them is laid
    let runFilesHere = !(runCardsListed || hudRunsListed), runFilesWait = null;
    const runFilesReady = () => {
      if (!runFilesWait) runFilesWait = Promise.all([
        runCardsListed ? fetchJson(`${ROOT}data/run-cards/${BOOK}.json`) : null,
        hudRunsListed ? fetchJson(`${ROOT}data/hud-runs/${BOOK}.json`) : null,
      ]).then(([rc, hr]) => { RUN_CARDS = rc; HUD_RUNS = hr; hudRunCards = HUD_RUNS && HUD_RUNS.book === BOOK && Array.isArray(HUD_RUNS.cards) ? HUD_RUNS.cards : []; runFilesHere = true; })
        .catch(() => { runFilesWait = null; });
      return runFilesWait;
    };
''')

edit("6 the lay", r'''    HUD_LANES.lay = async () => {
      const name = hudSetFor();
      let cards = hudRunCards;
''', r'''    HUD_LANES.lay = async () => {
      // the run files, where a run of them is to be laid and they are not
      // here yet (THE RUN FILES, above): the run cards stand with the license
      // runs on, or on a book the toggle ledger does not reach, and the HUD
      // runs with the license runs on. At rest nothing is waited for, and the
      // lanes are laid within the call (cellsFollow)
      if (!runFilesHere && (runsPref !== "off" || !hudSetFor())) await runFilesReady();
      const name = hudSetFor();
      let cards = hudRunCards;
''')

# ---- finding 5: the exporter's whole pool is asked for no word ------------------------------------------------
edit("5", r'''          const r = await attributionFor(k, asked, (ruled && ruledMadeAt(k, w)) || at, named, every);
''', r'''          // THE WHOLE POOL IS ASKED FOR NO WORD (21 November 2026). This ask
          // named no word, and a pool asked with no word named reads the open
          // card's from the page's memory (askedWord), which a closed card
          // leaves standing: the file was gated by the pointing of whichever
          // card was opened last on the same letters. With Amos 4:10's third
          // word ruled «plague» and the card at 3:7's sixth word, the same
          // letters pointed otherwise, opened and shut, the file listed the
          // ruled reading as withheld, matching no record in the store. So
          // the ask says it is for no word, and no card's pointing, entry or
          // name gates it, as on a visit where no card was opened
          const r = await attributionFor(k, asked, (ruled && ruledMadeAt(k, w)) || at, named, every, NO_WORD);
''')

# ---- finding 10: a still press is not a drag -------------------------------------------------------------------
edit("10 the press", r'''    drag = { dx: e.clientX - (parseFloat(hud.style.left) || 0),
             dy: e.clientY - (parseFloat(hud.style.top) || 0) };
''', r'''    drag = { dx: e.clientX - (parseFloat(hud.style.left) || 0),
             dy: e.clientY - (parseFloat(hud.style.top) || 0),
             x: e.clientX, y: e.clientY, far: false };
''')

edit("10 the move", r'''  hud.addEventListener("pointermove", (e) => {
    if (!drag) return;
    hud.style.left = ''', r'''  // A STILL PRESS IS NOT A DRAG (21 November 2026). Every press on the head
  // ended as a move: the card was marked as taken hold of, and the next
  // word's card opened where this one stood and not under its word (one
  // press on the head's Hebrew word, by mouse or by finger, and the next
  // card stood 161px under its word). The card follows the pointer, and is
  // the reader's to park, only once the pointer has traveled DRAG_SLOP
  // pixels from where it went down; a press that never does moves nothing
  // and parks nothing, and a card already parked stays parked
  const DRAG_SLOP = 6;
  hud.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.far && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < DRAG_SLOP) return;
    drag.far = true;
    hud.style.left = ''')

edit("10 the release", r'''    if (!drag) return;
    drag = null; justDragged = true;
''', r'''    if (!drag) return;
    const far = drag.far; drag = null;
    // a still press: nothing moved, so nothing is parked (above)
    if (!far) return;
    justDragged = true;
''')


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: python3 patch.py <reader dir>")
    path = sys.argv[1].rstrip("/") + "/zone.html"
    with open(path, encoding="utf-8", newline="") as f:
        page = f.read()
    for finding, old, new in EDITS:
        n = page.count(old)
        assert n == 1, f"finding {finding}: the old string occurs {n} times in {path}, not once; nothing written"
    out = page
    for finding, old, new in EDITS:
        assert out.count(old) == 1, f"finding {finding}: an earlier edit disturbed this one's old string; nothing written"
        out = out.replace(old, new)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(out)
    print(f"{len(EDITS)} edits applied to {path}")


if __name__ == "__main__":
    main()
