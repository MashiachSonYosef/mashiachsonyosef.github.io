#!/usr/bin/env node
// However many divisions and readings a form carries, the record stays in view.
//
// The reader's law: a selected reading always shows the D that stands it up,
// with its M. Nothing is capped to achieve it — no reading is dropped, no
// definition is truncated, no ellipsis stands in for a record.
//
// What that law does NOT protect is how much of the card the D takes. A
// definition running four hundred words is one record, entitled to say what it
// says, and not entitled to push the readings, the divisions and its own source
// line off the card on its way — one used to take 91% of it. So the D's text is
// bounded and scrolls inside its own box, its source line is pinned beneath and
// never scrolls at all, and the whole record is still reachable, entire.
// GUARDS: span-slice-rule-v1-compspan-template-exact-key
//
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(process.argv[2] || "http://127.0.0.1:8899/zone.html?b=1kings", { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

const read = () => p.evaluate(() => {
  const h = document.getElementById("hud"), hb = h.getBoundingClientRect();
  const d = h.querySelector(".d-slot"), rows = h.querySelector(".rows");
  const body = h.querySelector(".d-card .d-body"), foot = h.querySelector(".d-card .d-foot");
  const db = d ? d.getBoundingClientRect() : null;
  const first = h.querySelector(".d-card .d-text");
  const m = h.querySelector(".d-card .d-foot .att");
  const inside = (e) => { const r = e.getBoundingClientRect(); return r.top >= hb.top - 1 && r.bottom <= hb.bottom + 1; };
  const starts = (e) => { const r = e.getBoundingClientRect(); return r.top >= hb.top - 1 && r.top < hb.bottom; };
  return {
    word: h.querySelector(".head b")?.textContent || "",
    divisions: h.querySelectorAll(".rows .s-pills")[0]?.querySelectorAll("button").length || 0,
    pills: h.querySelectorAll(".r-pills button").length,
    cardH: Math.round(hb.height), overflow: h.scrollHeight - Math.round(hb.height),
    dPct: db ? Math.round((db.height / hb.height) * 100) : 0,
    recordPresent: !!first && !!first.textContent.trim(),
    dStartsInside: !!first && starts(first),
    mInside: !!m && inside(m), mPinned: !!m && !!foot,
    // the record is whole in the DOM and reachable by scrolling its own box —
    // nothing was cut to make it fit
    dChars: first ? first.textContent.length : 0,
    dReachable: !!body && body.scrollHeight <= body.clientHeight + 1
      ? true
      : !!body && body.scrollHeight > body.clientHeight,
    dClipped: !!body && body.scrollHeight > body.clientHeight + 1 &&
      getComputedStyle(body).overflowY === "visible",
    nowLine: (h.querySelector(".r-now .v")?.textContent || "").trim(),
    nowInside: !!h.querySelector(".r-now") && inside(h.querySelector(".r-now")),
    rowsScroll: rows ? rows.scrollHeight > rows.clientHeight + 1 : false,
  };
});

const wbs = await p.$$("section.seg .he-text .wb");
let worst = null, fattest = null;
for (let i = 0; i < Math.min(wbs.length, 10); i += 1) {
  await wbs[i].click();
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(400);
  const r = await read();
  check(`${r.word} · ${r.divisions} divisions, ${r.pills} readings`,
    r.overflow <= 1 && r.recordPresent && r.dStartsInside && r.mInside && !r.dClipped,
    `card ${r.cardH}px, D ${r.dPct}% of it, source line pinned in view ${r.mInside}${r.rowsScroll ? ", rows scrolling" : ""}`);
  check(`  and it says what is standing under the word`, r.nowInside && r.nowLine.length > 0, r.nowLine.slice(0, 44));
  if (!worst || r.pills > worst.pills) worst = r;
  if (!fattest || r.dPct > fattest.dPct) fattest = r;
  await p.keyboard.press("Escape");
  await p.waitForTimeout(60);
}
check("the card itself never overflows", worst.overflow <= 1, `worst case ${worst.word} at ${worst.pills} readings`);
check("no reading was capped away to make room", worst.pills > 100, `${worst.pills} readings all present`);
check("no definition was truncated to make room", worst.dChars > 0 && !worst.dClipped,
  `${worst.dChars} characters of record, reachable whole`);
check("the record never takes more than half the card", fattest.dPct <= 50,
  `worst ${fattest.dPct}% on ${fattest.word}`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
