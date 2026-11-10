// RUN: page
// CARD NUMBERING (the owner, 2026-10-18: the numbers pill is "card
// numbering" and the concordance pill "concordance hud"; "each card should
// get its own number, no 3-4, and id not add extra space"; "for english
// toggle we want center left"; 2026-10-19: "1. back to the bottom, 2. if
// the card has 2 words put their corresponding numbers in each corner, 3. if
// the card has a 3rd or more words put them aligned to the bottom left side
// of the hebrew word, 4. make them take precedence over underline ... but
// without making the card any bigger"; then of point 2: "we should just
// forget rule 2 the opposite corner thing and align all per rule 3"). With
// the pill on, every card on the
// page wears its own number in its verse, a run's words each theirs, drawn by
// the card itself (its ::after, from the card's --cn), in the corner of the
// edge its letters stand at, in both readers.
//   N1  the pills read "card numbering" (#numsPill) and "concordance hud"
//       (#dictPill), and ?nums=on presses the first
//   N2  with numbers on, every word that is not a mark carries its number in
//       its verse, first word 1, marks not counted; sections built after the
//       page opened as well
//   N3  each number is the word's own place number as the dictionary store
//       numbers it (w_page): wherever the store places a word at that number
//       in that verse, it is this word
//   N4  every card its own number: a run's words each show their own, and
//       the run no number of its own (no "3-4")
//   N5  each number stands ON ITS CARD, on the edge its letters stand at (the
//       owner, 2026-11-10: "i would still do somewhere on the card just you
//       know like a corner or edge, the key is no overlap with other gold";
//       2026-10-19: "on hebrew toggle id put numbers at the top, on english
//       toggle id put them at the card bottom"): its box inside its card's,
//       within 3px of the card's foot in the English reader and of its head
//       in the Hebrew, in the left corner of its card (a run's word: at its
//       own word's left) unless the page seated it elsewhere on that edge
//       (--cn-x: ink or a frame stood in the corner) or hung it just outside
//       the corner (cn-out: ink stood along the whole edge). The seated and
//       the hung are counted, and on a phone's width the hung are at most
//       one in a hundred. Until 2026-11-10 the number stood by its letters'
//       box, on the line under them; for a few hours of that day it hung
//       outside every card.
//   N12 no number touches other gold or a letter, by the page's own pixels:
//       the page is photographed with the numbers drawn and again with their
//       ink unseen (everything else as it stands, a line that gave way still
//       parted), and what the numbers' drawing changed stands a pixel or
//       more from every other gold pixel (a frame's line, a point, an
//       accent; a run wore a line too until 2026-11-10) and from every
//       letter's and reading's ink ("the
//       key is no overlap with other gold"); and no number lies on another
//       number or in another card of its verse
//   N6  numbering takes no room: every word cell's box (.wb and .wjoin) is
//       the same with numbers on and off, on the same page, blobs drawn
//   N7  the blobs drawn with numbers on are the blobs drawn with numbers off
//       (every svg.wj-tie path's d the same): on the same page, and on a page
//       opened afresh with numbers off, blob by blob where both drew it
//   N8  with numbers off, every badge is hidden
//   N9  the arrow the way the reader reads: before the number (U+25C2) in
//       the Hebrew reader, after it (U+25B8) in the English reader; this
//       reader and the other one both
//   N10 no page errors
//   N11 numbering leaves the letters' own ink alone: every gold-mark leaf
//       (.mg, .mg-all) draws the same ::before, and the letters the same
//       color, with numbers on and off (a number drawn in a leaf's ::before
//       once turned every word gold)
// Run it on a page with a run card (exodus has one at 1:1, words 3-4), in
// each reader: zone.html?b=exodus and zone.html?b=exodus&mode=en. The words
// are found on the page, never named here (check-scope-derived S1).
// Usage: node tools/check-card-numbering-v1.mjs [url]
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zoneIdOf } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL0 = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
// a built book page names its book and its reader's home in its own metas;
// the bare reader names the book in its address and keeps its data beside it
const META = await (async () => {
  try {
    const html = await (await fetch(URL0)).text();
    const meta = (n) => { const m = new RegExp(`<meta name="${n}" content="([^"]*)"`, "u").exec(html); return m ? m[1] : ""; };
    return { book: meta("reader-book"), home: meta("reader-home") };
  } catch { return { book: "", home: "" }; }
})();
const BOOK = zoneIdOf(URL0) || META.book;
const withParams = (u, kv) => { const x = new URL(u); for (const [k, v] of Object.entries(kv)) x.searchParams.set(k, v); return x.href; };
const ARROW_HE = String.fromCodePoint(0x25c2), ARROW_EN = String.fromCodePoint(0x25b8), DASH = String.fromCodePoint(0x2013);
const isLetter = (n) => n >= 0x5d0 && n <= 0x5ea;
const letters = (s) => [...String(s || "").normalize("NFD")].filter((c) => isLetter(c.codePointAt(0))).join("");
const SCROLL = 14000;   // how far down the page is walked, so sections build after it opened

// ---- the dictionary store, read in node: what stands at each place of this
// book, by every letters it is known by (its key, its text, a ketiv's and a
// qere's)
const DATA = new URL(META.home ? `${META.home}data/` : "data/", URL0).href;
const gz = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status}`); return JSON.parse(gunzipSync(Buffer.from(await r.arrayBuffer())).toString("utf8")); };
const storeAt = new Map();   // "c:v|w" -> Set(letters)
let storeOk = false;
try {
  const dix = await (await fetch(`${DATA}dictionary-store/index.json`)).json();
  const hexes = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  for (let i = 0; i < hexes.length; i += 16) {
    const shards = await Promise.all(hexes.slice(i, i + 16).map((h) => gz(`${DATA}dictionary-store/shards/${h}.bin?v=${dix.store_version}`)));
    for (const shard of shards) for (const [L, v] of Object.entries(shard)) for (const g of v.readings || []) for (const q of g.places || []) {
      if (q.book !== BOOK) continue;
      const k = `${q.ref}|${q.w_page}`;
      if (!storeAt.has(k)) storeAt.set(k, new Set());
      const s = storeAt.get(k);
      s.add(L); s.add(letters(q.pointed));
      for (const m of String(q.pointed).matchAll(/[([]([^)\]]*)[)\]]/gu)) s.add(letters(m[1]));
    }
  }
  storeOk = true;
} catch (e) { console.log(`the dictionary store did not answer: ${e.message}`); }

// ---- the page ------------------------------------------------------------------
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const errors = [];
const open = async (u) => {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); errors.push(e.message); });
  await p.goto(u, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await ties(p);
  return p;
};
// the blobs drawn: every word the page owes a blob has one
const ties = async (p) => {
  for (let i = 0; i < 2; i += 1) {
    await p.waitForTimeout(400);
    await p.waitForFunction(() => (window.__tiePending || 0) === 0, null, { timeout: 120000 }).catch(() => null);
  }
};
await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });

const p = await open(withParams(URL0, { nums: "on" }));
// walk down the page, so sections are built after it opened, on until a run
// card is built (or the page ends), and back up
for (let y = 0; ; y += 700) {
  await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60);
  if (y < SCROLL) continue;
  const more = await p.evaluate((y) => !document.querySelector(".he-text .wjoin") && y < document.documentElement.scrollHeight, y);
  if (!more || y > 40 * SCROLL) break;
}
await p.evaluate(() => window.scrollTo(0, 0));
await ties(p);
const english = await p.evaluate(() => document.body.classList.contains("en"));

// N1
const n1 = await p.evaluate(() => ({ nums: (document.getElementById("numsPill") || {}).textContent, dict: (document.getElementById("dictPill") || {}).textContent, pressed: (document.getElementById("numsPill") || { getAttribute: () => null }).getAttribute("aria-pressed") }));
check("N1  the pills read \"card numbering\" and \"concordance hud\", and ?nums=on presses the first",
  (n1.nums || "").trim() === "card numbering" && (n1.dict || "").trim() === "concordance hud" && n1.pressed === "true", JSON.stringify(n1));

// every built verse: its words in order, each word's badge, its run
const verses = await p.evaluate(() => [...document.querySelectorAll("section.seg")].filter((s) => s.querySelector(".he-text .wb")).map((sec) => {
  const wbs = [...sec.querySelectorAll(".he-text .wb:not(.mark)")];
  return {
    ref: ((sec.querySelector(".vnum") || {}).textContent || "").trim(),
    words: wbs.map((wb) => { const w = wb.querySelector(":scope > .w"); const own = wb.style.getPropertyValue("--cn"); const cn = own ? JSON.parse(own) : null; const drawn = getComputedStyle(wb, "::after").content; return { cn, span: !wb.querySelector(".cn"), ink: w ? w.textContent : "", inRun: !!wb.closest(".wjoin"), shown: drawn !== "none" && drawn !== "normal", drawn: (drawn.match(/\d+/u) || [""])[0] }; }),
    runs: [...sec.querySelectorAll(".he-text .wjoin")].map((run) => { const own = run.style.getPropertyValue("--cn"); return { badges: (own ? 1 : 0) + run.querySelectorAll(":scope > .cn").length, at: [...run.querySelectorAll(".wb:not(.mark)")].map((wb) => wbs.indexOf(wb) + 1) }; }),
  };
}));
const builtFirst = await p.evaluate(() => document.querySelectorAll("section.seg").length);

// N2: the number of each word in its verse, counted here
let words = 0; const wrong2 = [];
for (const v of verses) v.words.forEach((w, i) => { words += 1; if (w.cn !== String(i + 1) || !w.span || !w.shown || w.drawn !== w.cn) wrong2.push(`${v.ref}#${i + 1}=${w.cn} drawn ${w.shown ? w.drawn : "none"}`); });
check("N2  with numbers on, every word not a mark wears its number in its verse, drawn by its card, first word 1, marks not counted, sections built later as well",
  words > 0 && !wrong2.length && verses.length > 3,
  `${words} words in ${verses.length} verses built (of ${builtFirst} sections) · ${wrong2.length ? `wrong: ${wrong2.slice(0, 5).join(", ")}` : "every number its place"}`);

// N3: the store's own numbering of the same places
let placed = 0, unplaced = 0; const wrong3 = [];
for (const v of verses) v.words.forEach((w) => {
  const s = storeAt.get(`${v.ref}|${w.cn}`);
  if (!s) { unplaced += 1; return; }
  if (s.has(letters(w.ink))) placed += 1; else wrong3.push(`${v.ref}:${w.cn} ${letters(w.ink)} (store: ${[...s].filter(Boolean).join("/")})`);
});
// a work the store places no word of has no store numbering to agree with,
// and is said to be one
check("N3  each number is the word's own place number as the dictionary store numbers it (w_page), wherever the store places a word there",
  storeOk && !wrong3.length && (!storeAt.size || placed >= 0.9 * words),
  !storeOk ? "the dictionary store did not answer" : !storeAt.size ? `the dictionary store places no word of ${BOOK}: nothing to agree with`
    : `${placed} of ${words} words the store places at their number in ${BOOK}, ${unplaced} where it places none · ${wrong3.length ? `another word there: ${wrong3.slice(0, 3).join("; ")}` : "none disagree"}`);

// N4: every card its own number, a run's words each theirs
const runs = verses.flatMap((v) => v.runs.map((r) => ({ ...r, ref: v.ref, inner: r.at.map((n) => v.words[n - 1]) })));
const wrong4 = runs.filter((r) => r.badges !== 0 || r.inner.some((w, i) => !w || !w.shown || w.cn !== String(r.at[i])));
const run0 = runs[0];
check("N4  every card its own number: a run's words each show their own, and the run no number of its own",
  runs.length > 0 && !wrong4.length,
  `${runs.length} runs${run0 ? `, the first at ${run0.ref} words ${run0.at.join(",")} shows ${run0.inner.map((w) => w && w.cn).join(" and ")}` : " on this page: open one with a run card"} · ${wrong4.length ? `wrong: ${wrong4.slice(0, 3).map((r) => `${r.ref} (${r.badges} run badges, words ${r.at.join(",")})`).join("; ")}` : "each as it should"}`);

// N5: where each number stands, read off its used offsets from its card's own
// box (a pseudo-element has no box of its own to ask)
const n5 = await p.evaluate(() => {
  const en = document.body.classList.contains("en");
  const off = [], hit = { number: [], card: [] };
  let n = 0, inRuns = 0, moved = 0, hung = 0, worst = 0;
  const nums = [];
  for (const wb of document.querySelectorAll(".he-text .wb:not(.mark)")) {
    if (!wb.getClientRects().length) continue;
    const a = getComputedStyle(wb, "::after");
    if (a.content === "none" || a.content === "normal") continue;
    const r = wb.getBoundingClientRect();
    const width = parseFloat(a.width), height = parseFloat(a.height);
    const left = r.left + parseFloat(a.left), right = left + width;
    const top = en ? r.bottom - parseFloat(a.bottom) - height : r.top + parseFloat(a.top), foot = top + height;
    const join = wb.closest(".wjoin"), cardEl = join || wb, card = cardEl.getBoundingClientRect();
    const seated = !!wb.style.getPropertyValue("--cn-x"), out = wb.classList.contains("cn-out");
    n += 1; if (join) inRuns += 1; if (seated) moved += 1; if (out) hung += 1;
    const tag = `#${a.content.replace(/\D+/gu, "")}`;
    // how far inside the card's foot (the English reader) or head (the Hebrew) the number's box ends
    const edge = en ? card.bottom - foot : top - card.top;
    const dx = left - (join ? r.left : card.left);   // from the corner it stands in when nothing moved it
    if (out) {
      // hung just outside its corner: against the card's edge, at its corner still
      const gap = en ? top - card.bottom : card.top - foot;
      if (gap < -0.5 || gap > 2.5 || (join ? Math.abs(dx) > 1 : dx < 0 || dx > 5)) off.push(`${tag} hung ${gap.toFixed(1)}px from its card's ${en ? "foot" : "head"}, ${dx.toFixed(1)}px from its corner`);
    } else {
      worst = Math.max(worst, Math.abs(edge));
      if (left < card.left - 0.5 || right > card.right + 0.5 || top < card.top - 0.5 || foot > card.bottom + 0.5) off.push(`${tag} stands past its card (${(left - card.left).toFixed(1)}px from its left, ${edge.toFixed(1)}px inside its ${en ? "foot" : "head"})`);
      else if (edge > 3) off.push(`${tag} ${edge.toFixed(1)}px from its card's ${en ? "foot" : "head"}`);
      else if (!seated && (join ? Math.abs(dx) > 1 : dx < 0 || dx > 5)) off.push(`${tag} ${dx.toFixed(1)}px from its ${join ? "word's" : "card's"} left with nothing said to stand in its way`);
      else if (seated && width <= r.width + 0.5 && (left < r.left - 0.5 || right > r.right + 0.5)) off.push(`${tag} seated past its own ${join ? "word" : "card"}`);
    }
    nums.push({ tag, cardEl, sec: wb.closest("section.seg"), R: { L: left, R: right - 0.4, T: top + height * 0.12, B: top + height * 0.88 } });
  }
  // a number on another number; a number in another card of its verse
  const cardsOf = new Map();
  const cardsIn = (sec) => { if (!cardsOf.has(sec)) cardsOf.set(sec, [...sec.querySelectorAll(".he-text > .wb, .he-text .wjoin")].map((el) => ({ el, q: el.getBoundingClientRect() }))); return cardsOf.get(sec); };
  for (const x of nums) {
    const R = x.R;
    for (const y of nums) if (y !== x && y.sec === x.sec && R.L < y.R.R && R.R > y.R.L && R.T < y.R.B && R.B > y.R.T) { hit.number.push(x.tag); break; }
    if (x.sec && cardsIn(x.sec).some((c) => c.el !== x.cardEl && R.L < c.q.right && R.R > c.q.left && R.T < c.q.bottom && R.B > c.q.top)) hit.card.push(x.tag);
  }
  return { en, n, inRuns, moved, hung, worst, off, hit, parted: document.querySelectorAll(".he-text svg.wj-tie > mask.cn-mask").length, tied: document.querySelectorAll(".he-text svg.wj-tie").length, width: innerWidth };
});
check(`N5  each number stands on its card, at the edge its letters stand at (${n5.en ? "its foot: the English reader" : "its head: the Hebrew reader"}), in its left corner, a run's word's at its own word's left, unless the page seated it elsewhere on that edge or hung it just outside`,
  n5.n > 0 && n5.inRuns > 0 && !n5.off.length && (n5.width > 640 || n5.hung <= n5.n / 100),
  `${n5.n} numbers, ${n5.inRuns} on a run's words, the furthest ${n5.worst.toFixed(2)}px inside ${n5.en ? "its card's foot" : "its card's head"} · ${n5.moved} seated away from their corner, ${n5.parted} cards part a frame's line for one, ${n5.hung} hung just outside${n5.off.length ? ` · ${n5.off.slice(0, 3).join("; ")}` : ""}`);

// N12: the page's own pixels. One page, two photographs: the numbers drawn,
// and their ink unseen with everything else as it stands. A pixel is an
// ink's where it lies on the line from the linen to that ink.
const n12 = await (async () => {
  const c2 = await b.newContext({ viewport: { width: 412, height: 2600 }, deviceScaleFactor: 2 });
  await c2.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
  const q = await c2.newPage();
  q.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); errors.push(e.message); });
  await q.goto(withParams(URL0, { nums: "on" }), { waitUntil: "networkidle" });
  await q.waitForSelector("section.seg .he-text .wb");
  await ties(q);
  const cells = await q.evaluate(() => [...document.querySelectorAll("section.seg .he-text > .wb:not(.mark), section.seg .he-text .wjoin")].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, run: c.classList.contains("wjoin"), cn: getComputedStyle(c.classList.contains("wjoin") ? c.querySelector(".wb:not(.mark)") : c).getPropertyValue("--cn").replace(/"/gu, "") }; }).filter((c) => c.y > 0 && c.y + c.h < innerHeight - 12));
  const on = await q.screenshot();
  await q.addStyleTag({ content: "body.nums .he-text .wb::after { color: transparent !important; -webkit-text-fill-color: transparent !important; }" });
  await q.waitForTimeout(300);
  const bare = await q.screenshot();
  const res = await q.evaluate(async ({ a, c, cells }) => {
    const DSF = 2;
    const load = async (d) => { const im = new Image(); im.src = `data:image/png;base64,${d}`; await im.decode(); const cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0); return g.getImageData(0, 0, cv.width, cv.height); };
    const A = await load(a), B = await load(c), W = A.width, H = A.height;
    const probe = (v) => { const x = document.createElement("span"); x.style.color = v; document.documentElement.append(x); const k = getComputedStyle(x).color.match(/\d+/gu).slice(0, 3).map(Number); x.remove(); return k; };
    const GROUNDS = [probe("var(--bg)"), probe("var(--press-wash)")];
    const INKS = [["gold", probe("var(--gold-dim)")], ["gold", probe("var(--gold)")], ["ink", probe("var(--shani)")], ["ink", probe("var(--shani-dim)")], ["ink", probe("var(--tekhelet)")], ["ink", probe("var(--tekhelet-dim)")], ["ink", probe("var(--argaman)")]];
    const kindOf = (d, i) => {
      let best = 0, br = 34;
      for (const g of GROUNDS) for (const [kind, k] of INKS) {
        const vx = k[0] - g[0], vy = k[1] - g[1], vz = k[2] - g[2], px = d[i] - g[0], py = d[i + 1] - g[1], pz = d[i + 2] - g[2];
        const t = (px * vx + py * vy + pz * vz) / (vx * vx + vy * vy + vz * vz);
        if (t < 0.4) continue;
        const tt = Math.min(t, 1.15), r = Math.hypot(px - tt * vx, py - tt * vy, pz - tt * vz);
        if (r < br) { br = r; best = kind === "gold" ? 2 : 3; }
      }
      return best;
    };
    // 1 a number's ink (what its drawing changed, gold), 2 other gold, 3 a letter's or a reading's ink
    const K = new Uint8Array(W * H);
    for (let i = 0, n = 0; n < W * H; i += 4, n += 1) {
      const changed = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 24;
      const was = kindOf(A.data, i);
      K[n] = changed && kindOf(B.data, i) === 2 ? 1 : was;
    }
    const out = []; const RAD = 6;
    for (const cell of cells) {
      // a hung number stands a few pixels outside its cell: the cell and a margin the height of a number
      const X0 = Math.max(0, Math.floor((cell.x - 1) * DSF)), Y0 = Math.max(0, Math.floor((cell.y - 10) * DSF)), X1 = Math.min(W, Math.ceil((cell.x + cell.w + 1) * DSF)), Y1 = Math.min(H, Math.ceil((cell.y + cell.h + 10) * DSF));
      let ink = 0, gold = 99, letter = 99;
      for (let y = Y0; y < Y1; y += 1) for (let x = X0; x < X1; x += 1) {
        if (K[y * W + x] !== 1) continue;
        ink += 1;
        for (let dy = -RAD; dy <= RAD; dy += 1) for (let dx = -RAD; dx <= RAD; dx += 1) {
          const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const k = K[yy * W + xx]; if (k < 2) continue;
          const d = Math.hypot(dx, dy) / DSF;
          if (k === 2) { if (d < gold) gold = d; } else if (d < letter) letter = d;
        }
      }
      out.push({ cn: cell.cn, run: cell.run, ink, gold, letter });
    }
    return out;
  }, { a: bare.toString("base64"), c: on.toString("base64"), cells });
  await c2.close();
  return res;
})();
{
  const drawn = n12.filter((c) => c.ink > 0), runs = drawn.filter((c) => c.run);
  const touch = drawn.filter((c) => c.gold < 1 || c.letter < 1);
  const least = (k) => (drawn.length ? Math.min(...drawn.map((c) => c[k])) : 0);
  const say = (v) => (v >= 99 ? "nothing within 3px" : `${v.toFixed(1)}px`);
  const hits = Object.entries(n5.hit).filter(([, v]) => v.length);
  check("N12 no number touches other gold (a frame's line, a point) or a letter, by the page's own pixels; none lies on another number or in another card",
    drawn.length > 0 && runs.length > 0 && n5.tied > 0 && !touch.length && !hits.length,
    `${drawn.length} cards photographed with their numbers, ${runs.length} of them runs · the nearest other gold ${say(least("gold"))}, the nearest letter ${say(least("letter"))}`
      + `${touch.length ? ` · within a pixel: ${touch.slice(0, 5).map((c) => `#${c.cn} (gold ${say(c.gold)}, letter ${say(c.letter)})`).join(", ")}` : ""}`
      + `${hits.length ? ` · ${hits.map(([k, v]) => `on ${k === "card" ? "another card" : "another number"}: ${v.length} (${v.slice(0, 4).join(", ")})`).join("; ")}` : ""}`);
}

// N6, N7, N8: the same page with numbers on, off, and on again
const snap = () => p.evaluate(() => {
  const sx = window.scrollX, sy = window.scrollY;
  return {
    boxes: [...document.querySelectorAll(".he-text .wb, .he-text .wjoin")].map((x) => { const r = x.getBoundingClientRect(); return [r.left + sx, r.top + sy, r.width, r.height]; }),
    blobs: [...document.querySelectorAll("svg.wj-tie path")].map((x) => x.getAttribute("d")),
    badges: [...document.querySelectorAll(".he-text .wb:not(.mark)")].map((x) => getComputedStyle(x, "::after").content),
    ink: [...document.querySelectorAll(".he-text .mg, .he-text .mg-all, .he-text .wb:not(.mark) > .w")].map((x) => [getComputedStyle(x, "::before").content, getComputedStyle(x).webkitTextFillColor, getComputedStyle(x).color].join("|")),
    on: document.body.classList.contains("nums"),
  };
});
const toggle = async () => { await p.click("#numsPill"); await ties(p); };
const on1 = await snap();
await toggle();
const off = await snap();
await toggle();
const on2 = await snap();
const boxDiff = (a, c) => { if (a.boxes.length !== c.boxes.length) return { n: Infinity, worst: Infinity }; let n = 0, worst = 0; a.boxes.forEach((x, i) => { const d = Math.max(...x.map((v, j) => Math.abs(v - c.boxes[i][j]))); if (d > 0.01) n += 1; worst = Math.max(worst, d); }); return { n, worst }; };
const d1 = boxDiff(on1, off), d2 = boxDiff(off, on2);
check("N6  numbering takes no room: every word cell's box is the same with numbers on and off, on the same page, blobs drawn",
  on1.on && !off.on && on2.on && on1.boxes.length > 0 && d1.n === 0 && d2.n === 0,
  `${on1.boxes.length} cells · on to off: ${d1.n} moved (worst ${d1.worst.toFixed(3)}px) · off to on: ${d2.n} moved (worst ${d2.worst.toFixed(3)}px)`);
const blobDiff = (a, c) => a.blobs.length !== c.blobs.length ? Infinity : a.blobs.filter((d, i) => d !== c.blobs[i]).length;
// a page opened afresh with numbers off: each blob by its section and its
// place there, against the same blob on this page with numbers on
const blobsByPlace = (pg) => pg.evaluate(() => { const o = {}; for (const sec of document.querySelectorAll("section.seg")) [...sec.querySelectorAll("svg.wj-tie")].forEach((svg, i) => { o[`${sec.id}|${i}`] = [...svg.querySelectorAll("path")].map((x) => x.getAttribute("d")).join(" "); }); return o; });
const onAt = await blobsByPlace(p);
const pOff = await open(withParams(URL0, { nums: "off" }));
await ties(pOff);
const offAt = await blobsByPlace(pOff);
const both = Object.keys(onAt).filter((k) => k in offAt);
const freshDiff = both.filter((k) => onAt[k] !== offAt[k]);
check("N7  the blobs drawn with numbers on are the blobs drawn with numbers off, on this page and on a page opened afresh with numbers off",
  on1.blobs.length > 0 && blobDiff(on1, off) === 0 && blobDiff(off, on2) === 0 && both.length > 0 && !freshDiff.length,
  `${on1.blobs.length} blob paths with numbers on, ${off.blobs.length} off · ${blobDiff(on1, off)} differ on to off, ${blobDiff(off, on2)} off to on · afresh: ${freshDiff.length} of ${both.length} blobs differ`);
const shownOff = off.badges.filter((x) => x !== "none" && x !== "normal").length;
check("N8  with numbers off, every number is hidden",
  off.badges.length > 0 && shownOff === 0, `${off.badges.length} numbers, ${shownOff} shown`);

// N9: the arrow, this reader and the other one
const arrows = (pg) => pg.evaluate(() => {
  const w = [...document.querySelectorAll(".he-text .wb:not(.mark)")].find((x) => !["none", "normal"].includes(getComputedStyle(x, "::after").content));
  if (!w) return null;
  // the number drawn: the arrow before its digits, or after them
  const c = getComputedStyle(w, "::after").content, at = c.search(/\d/u);
  return { en: document.body.classList.contains("en"), before: c.slice(0, at), after: c.slice(c.search(/\d\D*$/u) + 1) };
});
const rightWay = (a) => !!a && (a.en
  ? a.after.includes(ARROW_EN) && !a.before.includes(ARROW_HE) && !a.before.includes(ARROW_EN)
  : a.before.includes(ARROW_HE) && !a.after.includes(ARROW_EN) && !a.after.includes(ARROW_HE));
const a1 = await arrows(p);
const p2 = await open(withParams(URL0, { nums: "on", mode: english ? "he" : "en" }));
const a2 = await arrows(p2);
const say = (a) => (a ? `${a.en ? "English" : "Hebrew"} reader: before ${a.before}, after ${a.after}` : "no number shown");
check("N9  the arrow the way the reader reads: before the number in the Hebrew reader, after it in the English reader, in both readers",
  rightWay(a1) && rightWay(a2) && !!a1 && !!a2 && a1.en !== a2.en, `${say(a1)} · ${say(a2)}`);

const inkDiff = (a, c) => a.ink.length !== c.ink.length ? Infinity : a.ink.filter((x, i) => x !== c.ink[i]).length;
check("N11 numbering leaves the letters' own ink alone: every gold-mark leaf and word draws the same with numbers on and off",
  on1.ink.length > 0 && inkDiff(on1, off) === 0 && inkDiff(off, on2) === 0,
  `${on1.ink.length} leaves and words · ${inkDiff(on1, off)} differ on to off, ${inkDiff(off, on2)} off to on`);
check("N10 no page errors", !errors.length, errors.length ? errors.slice(0, 3).join(" | ") : `${english ? "English" : "Hebrew"} reader at ${URL0}`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
