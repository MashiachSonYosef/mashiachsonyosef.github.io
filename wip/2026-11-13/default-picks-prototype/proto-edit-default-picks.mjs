// PROTOTYPE for the owner to look at, never shipped as is: the card's reading row says whose default leads it
// ("STEP default"), and a row of each source's own pick at this place (the corpus lane's default picks, relays v180
// and v180.1) lets the reader choose another source's default. A source with several picks shows them 1, 2, 3 in its
// own order. The choice is the reader's and is kept (fh.default); the line under the word follows it on this word.
// node proto-edit-default-picks.mjs <reader dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const R = process.argv[2];
const f = join(R, "zone.html");
let s = readFileSync(f, "utf8");
const swap = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error(`expected one of ${a.slice(0, 80)}, found ${n}`); s = s.replace(a, b); };

// the styles
swap(`  #hud .r-now .v.none { color: var(--argaman-dim); font-style: italic; }
`, `  #hud .r-now .v.none { color: var(--argaman-dim); font-style: italic; }
  /* PROTOTYPE · each source's default at this place */
  #hud .r-now .k .dflt { font: inherit; letter-spacing: inherit; text-transform: inherit; color: var(--gold-ink, var(--faint)); background: none;
    border: 0; border-bottom: 1px dotted currentColor; padding: 0; cursor: pointer; }
  #hud.tight .r-now .k:has(> .dflt) { display: block; }
  #hud .dflt-row { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.15rem 0 0.4rem; }
  #hud .dflt-row[hidden] { display: none; }
  #hud .dflt-row button { font: inherit; font-size: 0.74rem; line-height: 1.25; padding: 0.12rem 0.45rem; border-radius: 0.8rem; border: 1px solid var(--gold-dim);
    background: transparent; color: var(--tekhelet-ink); cursor: pointer; text-align: start; }
  #hud .dflt-row button[aria-pressed="true"] { border-color: var(--gold); font-weight: 700; }
  #hud .dflt-row button .who { display: block; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); font-weight: 400; }
  #hud .dflt-row button .sense { color: var(--faint); font-weight: 400; }
  .g .g-src { font-size: 0.55em; letter-spacing: 0.08em; color: var(--faint); }
`);

// the picks, fetched the first time a card asks, as the source suggested's file is
swap(`  const WORD_N = new WeakMap();`, `  // PROTOTYPE · each source's own picks at each place (data/default-picks/<book>.json)
  let PICKS = null, picksWait = null;
  const picksReady = () => {
    if (PICKS) return Promise.resolve(PICKS);
    if (!picksWait) picksWait = fetch(\`\${ROOT}data/default-picks/\${BOOK}.json\`).then((r) => (r.ok ? r.json() : null))
      .then((f) => { PICKS = f && f.book === BOOK ? f : null; return PICKS; }).catch(() => null);
    return picksWait;
  };
  const DEFAULT_KEY = "fh.default";
  let defaultOf = (() => { try { return ["step", "ubs", "macula", "bdb"].includes(localStorage.getItem(DEFAULT_KEY)) ? localStorage.getItem(DEFAULT_KEY) : "step"; } catch { return "step"; } })();
  const DEFAULT_NAMES = { step: "STEP", ubs: "UBS", macula: "MACULA", bdb: "BDB" };
  // a source's picks at a place as the card prints them, in its own order
  const picksOf = (rec, who) => {
    if (!rec) return [];
    if (who === "step") return (rec.step || []).map((p) => ({ n: p.n, text: String(p.words).split("/").map((x) => x.trim()).filter(Boolean).join(" + "), kind: p.kind === "r" ? "its reading here" : p.kind === "v" ? "a meaning variant" : "another number" }));
    if (who === "macula") return rec.macula ? [{ n: 1, text: rec.macula.words }] : [];
    if (who === "ubs") {
      const pieces = rec.ubs || [];
      const main = pieces.reduce((a, p) => (p.picks.length > (a ? a.picks.length : 0) ? p : a), null);
      return main ? main.picks.map((p) => ({ n: p.n, text: pieces.length > 1 ? pieces.map((q) => (q === main ? p.words : (q.picks[0] || {}).words)).filter(Boolean).join(" + ") : p.words })) : [];
    }
    if (who === "bdb") return (rec.bdb || []).map((p) => ({ n: p.n, text: p.entry_words || p.words, sense: \`sense \${p.point}\`, note: p.words }));
    return [];
  };
  // PROTOTYPE · the line under each drawn word reads by the chosen default; STEP's is the line as it stands
  const paintDefaultLines = () => picksReady().then((P) => {
    if (!P) return;
    for (const sec of document.querySelectorAll("section.seg")) {
      const label = sec.__sec && sec.__sec.label;
      const row = label ? P.places[label] : null;
      [...sec.querySelectorAll(".he-text .wb:not(.mark)")].forEach((wb, i) => {
        const g = wb.querySelector(":scope > .g");
        if (!g) return;
        if (!g.__orig) g.__orig = [...g.childNodes].map((x) => x.cloneNode(true));
        const rec = row ? row[String(i + 1)] : null;
        const pick = defaultOf !== "step" && rec ? picksOf(rec, defaultOf)[0] : null;
        if (!pick) { g.replaceChildren(...g.__orig.map((x) => x.cloneNode(true))); return; }
        g.replaceChildren(document.createTextNode(pick.text), Object.assign(document.createElement("span"), { className: "g-src", textContent: \` \${DEFAULT_NAMES[defaultOf]}\` }));
      });
    }
  });
  window.__paintDefaults = paintDefaultLines;
  const WORD_N = new WeakMap();`);

// on the card: the reading row says whose default leads, and the row of defaults under it
swap(`    paintNow(coverText(), pendingNow() ? ASKING : undefined);
`, `    paintNow(coverText(), pendingNow() ? ASKING : undefined);
    // PROTOTYPE · the defaults at this place
    const dRow = document.createElement("div"); dRow.className = "dflt-row"; dRow.hidden = true;
    if (atPlace) {
      const sec0 = el && el.closest ? el.closest("section.seg") : null;
      const all0 = sec0 ? [...sec0.querySelectorAll(".he-text .wb:not(.mark)")] : [];
      const host0 = el && el.closest ? el.closest(".wb") : null;
      const n0 = host0 ? all0.indexOf(host0) + 1 : 0;
      const label0 = sec0 && sec0.__sec ? sec0.__sec.label : null;
      if (label0 && n0 > 0) picksReady().then((P) => {
        const rec = P && P.places[label0] ? P.places[label0][String(n0)] : null;
        if (!rec) return;
        const have = ["step", "ubs", "macula", "bdb"].filter((w) => picksOf(rec, w).length);
        if (!have.length) return;
        const paint = () => {
          const who = have.includes(defaultOf) ? defaultOf : have[0];
          const lead = picksOf(rec, who)[0];
          nowK.replaceChildren();
          const dk = document.createElement("button"); dk.type = "button"; dk.className = "dflt";
          dk.textContent = \`reading \\u00b7 \${DEFAULT_NAMES[who]} default \\u25BE\`;
          dk.title = "each source's own pick at this place: choose whose leads";
          dk.addEventListener("click", (ev) => { ev.stopPropagation(); dRow.hidden = !dRow.hidden; });
          nowK.append(dk);
          paintNow(lead.text);
          dRow.replaceChildren();
          for (const w of have) picksOf(rec, w).forEach((p, i, list) => {
            const b = document.createElement("button"); b.type = "button";
            b.setAttribute("aria-pressed", String(w === who && i === 0));
            const k = document.createElement("span"); k.className = "who";
            k.textContent = \`\${DEFAULT_NAMES[w]} default\${list.length > 1 ? \` \${p.n}\` : ""}\${p.kind && p.n > 1 ? \` \\u00b7 \${p.kind}\` : ""}\`;
            b.append(k, document.createTextNode(p.text));
            if (p.sense) { const sn = document.createElement("span"); sn.className = "sense"; sn.textContent = \` \\u00b7 \${p.sense}\`; b.append(sn); b.title = \`BDB files this verse under \${p.sense}, which it opens with: \${p.note}\`; }
            b.addEventListener("click", (ev) => { ev.stopPropagation(); defaultOf = w; try { localStorage.setItem(DEFAULT_KEY, w); } catch (e) { /* the choice holds for this visit */ } paint(); paintDefaultLines(); });
            dRow.append(b);
          });
        };
        paint();
      });
    }
`);
swap(`hud.replaceChildren(...(opts.back ? [backButton(opts.back)] : []), head, now, rows,`, `hud.replaceChildren(...(opts.back ? [backButton(opts.back)] : []), head, now, dRow, rows,`);
writeFileSync(f, s);
console.log("zone.html: prototype in");
