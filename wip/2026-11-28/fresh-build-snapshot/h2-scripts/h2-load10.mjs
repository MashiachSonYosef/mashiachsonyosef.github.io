// Scratch (builder H2): readers-faults-load's law 10 walked step by step on the sandbox, saying where it stands at
// each step and taking a picture where a step does not come. Read only.
// node h2-load10.mjs <site root> <out dir> [touch]
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const [SITE, OUT, TOUCH] = process.argv.slice(2);
const touch = TOUCH === "touch";
mkdirSync(OUT, { recursive: true });
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: touch });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("check")) { localStorage.clear(); sessionStorage.setItem("check", "1"); } } catch { /* none */ } });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${tree.base}/reader/zone.html?b=amos${process.env.CARD ? `&card=${process.env.CARD}` : ""}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb"); await p.waitForTimeout(1200);
  const rectOf = (sel) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
  const tapAt = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else { await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.up(); } };
  const state = (tag) => p.evaluate((tag) => { const h = document.getElementById("hud"); const r = h.getBoundingClientRect(); const a = document.querySelector(".wb.active"); const t = document.querySelector(`[data-check="${tag}"]`); const tr = t ? t.querySelector(".w").getBoundingClientRect() : null; const at = tr ? document.elementFromPoint(tr.left + tr.width / 2, tr.top + tr.height / 2) : null; return { open: !h.hidden, hud: [Math.round(r.top), Math.round(r.bottom)], active: a ? a.dataset.check || "(untagged)" : null, target: tr ? [Math.round(tr.top), Math.round(tr.bottom)] : null, hit: at ? `${at.tagName}.${at.className}`.slice(0, 60) : null, inTarget: !!(t && at && t.contains(at)) }; }, tag);
  const tapWord = async (tag) => {
    const r = await rectOf(`[data-check="${tag}"] .w`); console.log(`tap ${tag} at`, Math.round(r.y), "before:", JSON.stringify(await state(tag)));
    await tapAt(r.x + r.w / 2, r.y + r.h / 2);
    const ok = await p.waitForFunction((tag) => { const a = document.querySelector(".wb.active"); return !document.getElementById("hud").hidden && !!a && a.dataset.check === tag; }, tag, { timeout: 8000 }).then(() => true, () => false);
    console.log(`  after tap ${tag}: ${ok ? "opened" : "NOT OPENED"}`, JSON.stringify(await state(tag)));
    if (!ok) await p.screenshot({ path: join(OUT, `load10-${touch ? "touch" : "mouse"}-${tag}.png`) });
    await p.waitForTimeout(1800); return ok;
  };
  const farWord = (name) => p.evaluate((name) => { const h = document.getElementById("hud").getBoundingClientRect(); let best = null, far = -1; for (const x of document.querySelectorAll("section.seg .he-text .wb:not(.mark)")) { if (x.dataset.check) continue; const w = x.querySelector(".w"); if (!w) continue; const r = w.getBoundingClientRect(); if (r.top < 4 || r.bottom > window.innerHeight - 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const e = document.elementFromPoint(cx, cy); if (!e || !x.contains(e)) continue; const d = cy < h.top ? h.top - cy : cy - h.bottom; if (d > far) { far = d; best = x; } } if (best) best.dataset.check = name; return !!best; }, name);
  await p.evaluate(() => document.getElementById("s3").scrollIntoView({ block: "start" })); await p.waitForTimeout(1500);
  await p.evaluate(() => { const wbs = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")].filter((x) => { const r = x.getBoundingClientRect(); return r.top > 60 && r.bottom < 900; }); const tops = [...new Set(wbs.map((x) => Math.round(x.getBoundingClientRect().top)))].sort((a, c) => a - c); wbs.filter((x) => Math.round(x.getBoundingClientRect().top) === tops[1])[0].dataset.check = "A"; const rest = wbs.filter((x) => !x.dataset.check && !x.closest(".wjoin")); rest[rest.length - 1].dataset.check = "W"; });
  if (!(await tapWord("W"))) throw new Error("W");
  await p.waitForTimeout(1500); await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__fitLog = []; });
  if (!(await tapWord("A"))) throw new Error("A");
  console.log("after A:", JSON.stringify(await p.evaluate(() => { const h = document.getElementById("hud"); return { maxH: h.style.maxHeight, top: h.style.top, h: h.offsetHeight, tight: h.classList.contains("tight"), scrollY: window.scrollY }; })));
  console.log("hud box", JSON.stringify(await p.evaluate(() => { const h = document.getElementById("hud"); const cs = getComputedStyle(h); const kids = [...h.children].map((k) => `${k.className || k.tagName}:${Math.round(k.getBoundingClientRect().top)}-${Math.round(k.getBoundingClientRect().bottom)}`); return { scrollTop: h.scrollTop, scrollH: h.scrollHeight, clientH: h.clientHeight, overflow: cs.overflowY, maxH: cs.maxHeight, kids }; })));
  const hw = await rectOf("#hud .head b"); console.log("head b at", JSON.stringify(hw), "scrollY", await p.evaluate(() => window.scrollY), "hit", await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}.${e.className}` : null; }, [hw.x + hw.w / 2, hw.y + hw.h / 2]));
  await tapAt(hw.x + hw.w / 2, hw.y + hw.h / 2); await p.waitForTimeout(500);
  console.log("scrollY now", await p.evaluate(() => window.scrollY), "focus", await p.evaluate(() => { const e = document.activeElement; return e ? `${e.tagName}.${e.className}#${e.id}` : null; }));
  console.log("after the still press:", JSON.stringify(await state("A")), await p.evaluate(() => document.getElementById("hud").classList.contains("moved")));
  console.log("far word B found:", await farWord("B"));
  if (!(await tapWord("B"))) throw new Error("B");
  console.log("errors:", errs.slice(0, 3));
} catch (e) { console.log("stopped at", e.message); } finally { await browser.close(); await tree.close(); }
