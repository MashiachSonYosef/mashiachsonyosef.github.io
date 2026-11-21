// Finding 10: one press on the card's head (its big Hebrew word), no movement, with a real pointer (a mouse, or a
// finger on a touch screen); then another word pressed. Does the card count as moved, and where does it open?
// "none" is the same walk without the press on the head.
// node f10-head-press.mjs mouse|touch|none
import { open, waitCard } from "./lib.mjs";
const how = process.argv[2] || "mouse";
const { b, p, errors } = await open("amos", "", { touch: how === "touch" });
const rectOf = (sel) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }, sel);
const tapAt = async (x, y) => { if (how === "touch") await p.touchscreen.tap(x, y); else { await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.up(); } };
const press = async (sel) => { const r = await rectOf(`${sel} .w`); await tapAt(r.x + r.w / 2, r.y + r.h / 2); await waitCard(p); };
const hudState = () => p.evaluate(() => { const h = document.getElementById("hud"); const r = h.getBoundingClientRect(); const a = document.querySelector(".wb.active"); const ar = a ? a.getBoundingClientRect() : null; return { open: !h.hidden, moved: h.classList.contains("moved"), top: Math.round(r.top), bottom: Math.round(r.bottom), on: a ? a.dataset.probe || "another word" : null, word: ar ? { top: Math.round(ar.top), bottom: Math.round(ar.bottom) } : null }; });
// word A: a word in the upper part of the screen, so its card opens under it and leaves the lines above it free
await p.evaluate(() => document.getElementById("s3").scrollIntoView({ block: "start" })); await p.waitForTimeout(1500);
await p.evaluate(() => { const wbs = [...document.querySelectorAll("section.seg .he-text .wb")].filter((x) => { const r = x.getBoundingClientRect(); return r.top > 60 && r.bottom < 900; }); const tops = [...new Set(wbs.map((x) => Math.round(x.getBoundingClientRect().top)))].sort((a, c) => a - c); const row = (n) => wbs.filter((x) => Math.round(x.getBoundingClientRect().top) === tops[n]); row(1)[0].dataset.probe = "A"; });
// a first card of the visit, opened and shut: the book's source-suggested file arrives with it and builds that
// card again (11816-11829), which would let go of a moved card once and hide what is being asked here
await p.evaluate(() => { const wbs = [...document.querySelectorAll("section.seg .he-text .wb")].filter((x) => { const r = x.getBoundingClientRect(); return r.top > 60 && r.bottom < 900 && !x.dataset.probe && !x.closest(".wjoin"); }); wbs[wbs.length - 1].dataset.probe = "W"; });
await press('[data-probe="W"]'); await p.waitForTimeout(1500); await p.keyboard.press("Escape"); await p.waitForTimeout(600);
await press('[data-probe="A"]');
const s0 = await hudState();
console.log("card on word A:", JSON.stringify(s0));
if (how !== "none") {
  const r = await rectOf("#hud .head b");
  const x = r.x + r.w / 2, y = r.y + r.h / 2;
  const tag = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return `${e.tagName}${e.getAttribute("role") ? `[role=${e.getAttribute("role")}]` : ""} in ${e.closest(".head") ? "the head" : "?"}`; }, { x, y });
  await tapAt(x, y);
  await p.waitForTimeout(500);
  console.log(`one ${how === "touch" ? "tap" : "press"} on the head's Hebrew word (${tag}), no movement:`, JSON.stringify(await hudState()));
}
// word B: a word still in view that the card does not cover, the farthest from the card
const okB = await p.evaluate(() => { const h = document.getElementById("hud").getBoundingClientRect(); let best = null, far = -1; for (const x of document.querySelectorAll("section.seg .he-text .wb")) { if (x.dataset.probe) continue; const w = x.querySelector(".w"); const r = w.getBoundingClientRect(); if (r.top < 4 || r.bottom > window.innerHeight - 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const e = document.elementFromPoint(cx, cy); if (!e || !x.contains(e)) continue; const d = cy < h.top ? h.top - cy : cy - h.bottom; if (d > far) { far = d; best = x; } } if (best) best.dataset.probe = "B"; return !!best; });
if (!okB) { console.log("no uncovered word in view"); await b.close(); process.exit(0); }
if (process.argv[3] === "trace") await p.evaluate(() => { const h = document.getElementById("hud"); const rm = h.classList.remove.bind(h.classList); h.classList.remove = (...a) => { if (a.includes("moved") && h.classList.contains("moved")) (window.__trace = window.__trace || []).push(new Error("moved removed").stack.split("\n").slice(1, 7).map((l) => l.trim().replace(/http:\/\/[^ )]*zone\.html[^:]*:/u, "zone.html:")).join(" < ")); return rm(...a); }; });
await press('[data-probe="B"]');
if (process.argv[3] === "trace") console.log("who took «moved» off:", JSON.stringify(await p.evaluate(() => window.__trace || [])));
const s = await hudState();
console.log("then word B pressed:", JSON.stringify(s));
console.log(s.word && s.open ? `the card is on ${s.on}; it stands ${s.top >= s.word.bottom ? `${s.top - s.word.bottom}px under` : s.bottom <= s.word.top ? `${s.word.top - s.bottom}px above` : "OVER"} that word; it ${s.top === s0.top ? "did not move" : `moved from top ${s0.top} to ${s.top}`}` : "no card on a word");
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
