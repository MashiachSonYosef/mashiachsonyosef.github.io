// BEFORE-AND-AFTER SCREENSHOTS for the owner: the license chip and the blob
// follow the reading shown (the owner, 2026-10-10: "the license ledger main
// purpose is to try to politely shove you into showing the license when i
// change the english showing" and "same with blobs it should apply when
// changed too").
//
// "before" is the reader as it stood before this work
// (follow/zone-before-follow.html, served in place of reader/zone.html by
// intercepting the request, so the working tree is not touched); "after" is
// reader/zone.html as it stands now. Each shot drives the same change path
// with the reader's own controls in both, and saves one picture per reader:
// the word as it stood just before the action, an arrow, and the word just
// after it, each cropped tight to the word, its English line and its chip.
// The pages run at deviceScaleFactor 2 with ?blobs=every.
//
// Run:  node shots.mjs [--only 1,2] [--explore ruth:1:1:17]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = "http://127.0.0.1:8912";
const BEFORE_HTML = readFileSync(join(HERE, "zone-before-follow.html"));
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ONLY = arg("only", "") ? new Set(arg("only", "").split(",")) : null;
const EXPLORE = arg("explore", "");

// ---- in the page ----------------------------------------------------------------
const LIB = () => {
  const sh = {};
  window.__sh = sh;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  sh.load = async () => {
    if (sh.MS) return;
    const j = async (u) => { try { const r = await fetch(u); return r.ok ? r.json() : null; } catch { return null; } };
    const post = await j("data/license-postures-v1.json");
    const ix = await j("data/route-store/index.json");
    sh.POST = post; sh.MS = { ...((ix && ix.m_sources) || {}) };
    for (const o of ["jastrow", "samaritan"]) { const x = await j(`data/overlays/${o}/index.json`); for (const [id, s] of Object.entries((x && x.m_sources) || {})) sh.MS[id] = { ...s, overlay: o }; }
  };
  sh.licOf = (id) => { const s = sh.MS[id]; const p = s ? s.licensePosture : ""; const r = p && sh.POST && sh.POST.postures && sh.POST.postures[p]; return p ? (r && r.name) || p : "License unrecorded"; };
  sh.word = (label, i) => { const z = window.__zone; const s = z.sections.find((x) => x.label === label); return s ? s.words[i] : null; };
  sh.wb = (w) => [...document.querySelectorAll(".he-text .wb")].find((x) => x.__word === w) || null;
  sh.host = (label, i, whole) => {
    const wb = sh.wb(sh.word(label, i));
    if (!wb) return null;
    const run = wb.closest(".wjoin");
    return run && (whole || run.__ink) ? run : wb;
  };
  // the line under the word, its chip and its blob, as they stand
  sh.read = (label, i) => {
    const wb = sh.wb(sh.word(label, i));
    if (!wb) return { missing: true };
    const run = wb.closest(".wjoin");
    let g = wb.querySelector(":scope > .g");
    let host = wb;
    if (run && run.__ink) {
      host = run;
      const wi = [...run.__ink.querySelectorAll(":scope > .wb")].indexOf(wb);
      const rg = run.querySelector(":scope > .g");
      g = rg && rg.classList.contains("parts") ? rg.querySelector(`:scope > .g-part[data-wi="${wi}"]`) : rg;
    }
    const chip = g ? g.querySelector(":scope > .g-lic") : null;
    const c = g ? g.cloneNode(true) : null;
    if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
    const svg = host.querySelector(":scope > svg.wj-tie");
    const pcs = g ? g.querySelector(":scope > .g-pcs") : null;
    return { shown: c ? c.textContent.replace(/\s+/g, " ").trim() : null, chip: chip ? chip.textContent.replace(/\s+/g, " ").trim() : null,
      chipTitle: chip ? chip.title : null, chipLine: chip ? chip.dataset.line || null : null,
      blob: svg ? svg.querySelectorAll("path[data-wi]").length : 0, pcs: pcs ? [...pcs.querySelectorAll(":scope > .g-pc")].map((x) => x.textContent.trim()) : null };
  };
  // the box to crop: the word (or its whole chain or run), its English, its
  // chip and the blob behind them, padded a little
  // (several words: the box around all of them, for a chain or run whose
  // words stand apart once the switch has parted them)
  sh.box = (label, is, whole, pad = 7) => {
    const hosts = [...new Set((Array.isArray(is) ? is : [is]).map((i) => sh.host(label, i, whole)).filter(Boolean))];
    if (!hosts.length) return null;
    const els = hosts.flatMap((host) => [host, ...host.querySelectorAll(":scope > svg.wj-tie, .g, .g-lic, .w")]);
    let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
    for (const el of els) for (const r of el.getClientRects()) {
      if (!r.width || !r.height) continue;
      L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom);
    }
    if (!Number.isFinite(L)) return null;
    const x = Math.max(0, Math.floor(L - pad)), y = Math.max(0, Math.floor(T - pad));
    return { x, y, width: Math.min(window.innerWidth, Math.ceil(R + pad)) - x, height: Math.ceil(B + pad) - y };
  };
  sh.center = async (label, i) => {
    const host = sh.host(label, i, true);
    if (!host) return false;
    host.scrollIntoView({ block: "center", inline: "center" });
    await sleep(250);
    return true;
  };
  // ---- the card ------------------------------------------------------------
  sh.pills = () => [...document.querySelectorAll("#hud .r-pills button")].map((b, j) => {
    const label = String(b.title || "").split(" · ").slice(1).join(" · ");
    const by = String(b.dataset.by || "").split(" ").filter(Boolean);
    const ids = Object.entries(sh.MS).filter(([id, s]) => s.label === label && by.includes(id)).map(([id]) => id);
    return { j, text: b.textContent.replace(/\s+/g, " ").trim(), label, ids, lic: ids.length ? sh.licOf(ids[0]) : null, pressed: b.getAttribute("aria-pressed") === "true" };
  });
  sh.cuts = () => [...document.querySelectorAll("#hud .b-cut button")].map((b, j) => ({ j, text: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") === "true" }));
  sh.waitPills = async (ms = 12000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const hud = document.getElementById("hud"); if (hud && !hud.hidden && document.querySelector("#hud .r-pills button")) break; await sleep(80); }
    await sleep(300);
    return sh.pills();
  };
  sh.open = async (label, i) => {
    const wb = sh.wb(sh.word(label, i));
    if (!wb) return null;
    wb.scrollIntoView({ block: "center" });
    await sleep(200);
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    return sh.waitPills();
  };
  sh.pressCut = async (j) => {
    const b = document.querySelectorAll("#hud .b-cut button")[j];
    if (!b) return null;
    const sig = () => [...document.querySelectorAll("#hud .r-pills button")].map((x) => x.textContent).join("\u0001");
    const was = sig();
    b.click();
    const t0 = Date.now();
    while (Date.now() - t0 < 10000 && sig() === was) await sleep(100);
    await sleep(300);
    return sh.pills();
  };
  sh.press = async (j) => { const b = document.querySelectorAll("#hud .r-pills button")[j]; if (!b) return false; b.click(); await sleep(600); return true; };
  // the corroboration chips on the card (the same record carried by more
  // witnesses, or the same wording under another reading)
  sh.also = () => [...document.querySelectorAll("#hud .d-also-m")].map((b, j) => {
    const label = String(b.title || "").split(" — ")[0];
    const lc = b.querySelector(".lic-chip");
    return { j, label, lic: lc ? lc.textContent.trim() : null, text: b.textContent.trim(), kind: (b.closest(".d-also") && b.closest(".d-also").querySelector(".d-also-lab") || {}).textContent || "" };
  });
  sh.pressAlso = async (j) => { const b = document.querySelectorAll("#hud .d-also-m")[j]; if (!b) return false; b.click(); await sleep(700); return true; };
  sh.close = async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await sleep(300); };
  sh.rail = (toggle, lab) => {
    const row = document.querySelector(`.rail .row[data-toggle="${toggle}"]`);
    if (!row) return `no rail row ${toggle}`;
    const b = [...row.querySelectorAll(".dfp")].find((x) => x.textContent.trim() === lab);
    if (!b) return `no button "${lab}" in ${toggle}`;
    if (b.disabled) return `"${lab}" is drawn dead in ${toggle}`;
    b.click();
    return null;
  };
  return sh;
};

// ---- the shots --------------------------------------------------------------------
// Each shot: the book, the word (verse label and word index), whether to crop
// the whole chain or run, setup steps (taken before the "start" picture) and
// the action (taken between "start" and "end").
const SHOTS = [
  { n: 1, book: "ruth", at: "1:1", i: 17, say: "Ruth 1:1 וּשְׁנֵי: on the word's card, press a reading from another source under another license",
    action: [{ card: "otherLicense" }] },
  { n: 2, book: "ruth", at: "1:1", i: 1, say: "Ruth 1:1 בִּימֵי: rail \"look up by\" -> \"the headword\"; the line reads the headword's reading",
    action: [{ rail: ["lookup", "the headword"] }] },
  { n: 3, book: "ruth", at: "1:1", i: 1, say: "Ruth 1:1 בִּימֵי: rail \"the line reads\" -> \"oldest first\"; \"in + [the] days of\" becomes \"in + days\", split anew",
    action: [{ rail: ["reads", "oldest first"] }] },
  { n: 4, book: "genesis", at: "1:2", i: 6, with: [5], whole: true, say: "Genesis 1:2 עַל־פְּנֵי (maqaf chain), under the headword lookup: rail \"joined words\" -> \"as separate words\"",
    setup: [{ rail: ["lookup", "the headword"] }], action: [{ rail: ["maqaf", "as separate words"] }] },
  { n: 5, book: "ruth", at: "1:1", i: 17, say: "Ruth 1:1 וּשְׁנֵי: after shot 1, press back TAHOT's own reading \"and + [the] two\" on the card",
    setup: [{ card: "otherLicense" }], action: [{ card: "text", text: "and + [the] two" }] },
  { n: 6, book: "ruth", at: "1:6", i: 14, whole: true, say: "Ruth 1:6 אֶת־עַמּוֹ (maqaf chain): rail \"the line reads\" -> \"oldest first\"; \"people + his\" becomes \"Amaw\" under another license",
    action: [{ rail: ["reads", "oldest first"] }] },
  { n: 8, book: "genesis", at: "1:5", i: 0, say: "Genesis 1:5 \u05d5\u05b7\u05d9\u05bc\u05b4\u05e7\u05b0\u05e8\u05b8\u05d0, under oldest first, a reading chosen on the card: press the corroboration chip of the second witness, under another license",
    setup: [{ rail: ["reads", "oldest first"] }, { card: "alsoPill" }], action: [{ card: "also" }] },
  { n: 7, book: "ruth", at: "1:13", i: 3, with: [4], whole: true, say: "Ruth 1:13 (a named license run): rail \"license runs\" -> \"off\"",
    action: [{ rail: ["runs", "off"] }] },
];

const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());

const openPage = async (which, book) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(LIB);
  if (which === "before") await ctx.route(/\/reader\/zone\.html(\?|$)/, (route) => route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: BEFORE_HTML }));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let inflight = 0;
  page.on("request", () => { inflight += 1; });
  page.on("requestfinished", () => { inflight = Math.max(0, inflight - 1); });
  page.on("requestfailed", () => { inflight = Math.max(0, inflight - 1); });
  page.settle = async () => {
    await page.waitForTimeout(350);
    await page.waitForFunction(() => !window.__livePending, null, { timeout: 60000 }).catch(() => {});
    const t0 = Date.now(); while (inflight > 0 && Date.now() - t0 < 30000) await page.waitForTimeout(100);
    await page.waitForTimeout(600);
  };
  await page.goto(`${SITE}/reader/zone.html?b=${book}&blobs=every`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.evaluate(() => window.__sh.load());
  page.errors = errors;
  return { ctx, page };
};

// one step of a shot, the same in both readers; the card's choice is made in
// the "after" reader and repeated by its words and source in the "before"
const doStep = async (page, shot, st, memo) => {
  const note = {};
  if (st.rail) { const e = await page.evaluate(([t, l]) => window.__sh.rail(t, l), st.rail); if (e) note.err = e; }
  else if (st.card === "alsoPill") {
    // the first pill whose record a second witness under another license
    // carries; the "before" reader presses the same pill by its words and source
    await page.evaluate(([a, i]) => window.__sh.open(a, i), [shot.at, shot.i]);
    const tried = new Set();
    for (let n = 0; n < 12; n += 1) {
      const ps = await page.evaluate(() => window.__sh.pills());
      const p = memo.alsoPill ? ps.find((q) => q.text === memo.alsoPill.text && q.label === memo.alsoPill.label && !tried.has(q.text)) : ps.find((q) => !tried.has(`${q.text}|${q.label}`));
      if (!p) break;
      tried.add(memo.alsoPill ? p.text : `${p.text}|${p.label}`);
      await page.evaluate((jj) => window.__sh.press(jj), p.j);
      const also = await page.evaluate(() => window.__sh.also());
      if (memo.alsoPill || also.some((x) => /same record/.test(x.kind) && x.lic && x.lic !== p.lic)) { memo.alsoPill = { text: p.text, label: p.label }; note.pressed = `${p.text} [${p.ids.join("|")}, ${p.lic}]`; break; }
    }
    if (!memo.alsoPill) note.err = "no pill whose record a witness under another license carries";
    await page.evaluate(() => window.__sh.close());
  } else if (st.card === "also") {
    await page.evaluate(([a, i]) => window.__sh.open(a, i), [shot.at, shot.i]);
    const now = await page.evaluate(([a, i]) => window.__sh.read(a, i), [shot.at, shot.i]);
    const also = await page.evaluate(() => window.__sh.also());
    const x = also.find((q) => /same record/.test(q.kind) && q.lic && q.lic !== now.chip);
    if (!x) note.err = "no corroboration chip under another license";
    else { note.pressed = `the corroboration chip of ${x.label} (${x.lic})`; await page.evaluate((jj) => window.__sh.pressAlso(jj), x.j); }
    await page.evaluate(() => window.__sh.close());
  } else if (st.card) {
    let pills = await page.evaluate(([a, i]) => window.__sh.open(a, i), [shot.at, shot.i]);
    const now = await page.evaluate(([a, i]) => window.__sh.read(a, i), [shot.at, shot.i]);
    const want = (ps) => {
      if (st.card === "text") return ps.findIndex((p) => p.text.toLowerCase() === st.text.toLowerCase());
      if (memo.pill) return ps.findIndex((p) => p.text === memo.pill.text && p.label === memo.pill.label);
      // a store reading whose license is not the one the line wears now
      return ps.findIndex((p) => p.lic && now.chip && p.lic !== now.chip && p.text.toLowerCase() !== String(now.shown || "").toLowerCase());
    };
    let j = want(pills);
    if (j < 0) {
      const cuts = await page.evaluate(() => window.__sh.cuts());
      for (const c of cuts.filter((x) => !x.pressed)) {
        const ps = await page.evaluate((cj) => window.__sh.pressCut(cj), c.j);
        if (!ps) continue;
        pills = ps; note.division = c.text; j = want(pills);
        if (j >= 0) break;
      }
    }
    if (j < 0) note.err = `no pill to press (${st.card})`;
    else {
      if (!memo.pill && st.card === "otherLicense") memo.pill = { text: pills[j].text, label: pills[j].label };
      note.pressed = `${pills[j].text} [${pills[j].ids.join("|") || "?"}, ${pills[j].lic}]`;
      await page.evaluate((jj) => window.__sh.press(jj), j);
    }
    await page.evaluate(() => window.__sh.close());
  }
  await page.settle();
  return note;
};

const crop = async (page, shot) => {
  await page.mouse.move(2, 2);
  await page.evaluate(([a, i]) => window.__sh.center(a, i), [shot.at, shot.i]);
  await page.waitForTimeout(300);
  const box = await page.evaluate(([a, is, w]) => window.__sh.box(a, is, w), [shot.at, [shot.i, ...(shot.with || [])], !!shot.whole]);
  const read = await page.evaluate(([a, i]) => window.__sh.read(a, i), [shot.at, shot.i]);
  if (!box) return { read, png: null };
  const png = await page.screenshot({ clip: box });
  return { read, png, box };
};

// start, an arrow, end: one picture, at the pages' own resolution
const compose = async (start, end, file) => {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 400 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const img = (c) => `<img src="data:image/png;base64,${c.png.toString("base64")}" style="width:${c.box.width}px;height:${c.box.height}px;display:block">`;
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff"><div id="o" style="display:inline-flex;align-items:center;gap:10px;padding:6px;background:#fff">${img(start)}<span style="font:20px sans-serif;color:#777">→</span>${img(end)}</div></body></html>`);
  await page.locator("#o").screenshot({ path: file });
  await ctx.close();
};

if (EXPLORE) {
  const [book, ch, v, i] = EXPLORE.split(":");
  const { ctx, page } = await openPage("after", book);
  const at = `${ch}:${v}`;
  await page.evaluate(async (a) => { const sh = window.__sh; for (let g = 0; g < 4000; g += 1) { if (sh.wb(sh.word(a, 0))) break; const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 8)); } }, at);
  await page.settle();
  const pills = await page.evaluate(([a, j]) => window.__sh.open(a, Number(j)), [at, i]);
  const cuts = await page.evaluate(() => window.__sh.cuts());
  console.log(JSON.stringify({ read: await page.evaluate(([a, j]) => window.__sh.read(a, Number(j)), [at, i]), cuts, pills, also: await page.evaluate(() => window.__sh.also()) }, null, 1));
  for (const c of cuts.filter((x) => !x.pressed)) {
    const ps = await page.evaluate((cj) => window.__sh.pressCut(cj), c.j);
    console.log(JSON.stringify({ cut: c.text, pills: ps, also: await page.evaluate(() => window.__sh.also()) }, null, 1));
  }
  await ctx.close(); await browser.close();
  process.exit(0);
}

const report = [];
for (const shot of SHOTS) {
  if (ONLY && !ONLY.has(String(shot.n))) continue;
  const memo = {};
  const out = { n: shot.n, say: shot.say };
  for (const which of ["after", "before"]) {
    const { ctx, page } = await openPage(which, shot.book);
    // build sections until the word stands
    await page.evaluate(async ([a, i]) => {
      const sh = window.__sh;
      for (let g = 0; g < 4000; g += 1) { if (sh.wb(sh.word(a, i))) break; const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 8)); }
    }, [shot.at, shot.i]);
    await page.settle();
    const notes = [];
    for (const st of shot.setup || []) notes.push(await doStep(page, shot, st, memo));
    const start = await crop(page, shot);
    for (const st of shot.action) notes.push(await doStep(page, shot, st, memo));
    const end = await crop(page, shot);
    const file = join(HERE, `shot-${shot.n}-${which}.png`);
    if (start.png && end.png) await compose(start, end, file);
    out[which] = { start: start.read, end: end.read, notes, errors: page.errors.slice(0, 3), file: start.png && end.png ? file : null };
    await ctx.close();
  }
  report.push(out);
  console.log(JSON.stringify(out, null, 1));
}
writeFileSync(join(HERE, "shots-report.json"), JSON.stringify(report, null, 1));
await browser.close();
