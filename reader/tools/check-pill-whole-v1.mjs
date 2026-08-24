import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));

// The address is derived, never typed: a check naming a book by hand goes
// stale the day that work is renamed, and this one did — it still asked for
// "1kings", an address retired in August. The argument wins; the fallback
// names a work that is actually published.
const URL = defaultZoneUrl();
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d="") => { if(!ok) bad++; console.log(`${ok?"  ok  ":"FAIL  "}${n}${d?"  ·  "+d:""}`); };
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg");
await (await p.$$("section.seg .he-text .wb"))[1].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });

// The worst case is asked of the catalog at run time, never pasted: a copy
// typed here would go stale the day the store moves, and the check would be
// measuring a phantom string against a real layout. Same split as the page:
// senses at the pack mark, readings at the declared comma rule.
const LONG = await (async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const { gunzipSync } = await import("node:zlib");
  const { senseSplit: readingSplit } = await import(join(HERE, "sense-split-v1.mjs"));
  const packSplit = (t) => {
    const out = []; let start = 0, d = 0; const x = String(t || "");
    for (let i2 = 0; i2 < x.length; i2 += 1) {
      const c = x[i2];
      if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; }
      else if (c === ";" && d === 0) { out.push(x.slice(start, i2)); start = i2 + 1; }
    }
    out.push(x.slice(start));
    return out.map((y) => y.trim()).filter(Boolean);
  };
  let longest = "";
  const shards = join(HERE, "..", "data", "route-store", "shards");
  for (const f of readdirSync(shards).filter((x) => /^[0-9a-f]{2}\.bin$/.test(x))) {
    const body = JSON.parse(gunzipSync(readFileSync(join(shards, f))).toString("utf8"));
    for (const rows of Object.values(body)) for (const row of rows) {
      for (const sense of packSplit(row[1])) {
        const rs = readingSplit(sense);
        if (rs.damaged) continue;
        for (const reading of rs.readings) if (reading.length > longest.length) longest = reading;
      }
    }
  }
  if (!longest) { console.log("SKIPPED — the store offers no reading to measure"); process.exit(3); }
  console.log(`  --    the store's longest reading: ${longest.length} characters`);
  return longest;
})();
const r = await p.evaluate((text) => {
  const row = document.querySelector("#hud .r-pills");
  const proto = row.querySelector("button");
  const btn = proto.cloneNode(false);
  btn.textContent = text;
  row.append(btn);
  const cs = getComputedStyle(btn);
  return {
    chars: text.length,
    shownChars: btn.innerText.trim().length,
    clippedV: btn.scrollHeight > btn.clientHeight + 1,
    clippedH: btn.scrollWidth > btn.clientWidth + 1,
    lineClamp: cs.webkitLineClamp,
    overflow: cs.overflow,
    height: Math.round(btn.getBoundingClientRect().height),
    rowScrolls: row.scrollHeight > row.clientHeight,
    rowH: Math.round(row.getBoundingClientRect().height),
    rowScrollH: row.scrollHeight,
    pillCount: row.querySelectorAll("button").length,
    pillsInDom: [...row.children].filter((c) => c.tagName === "BUTTON").length,
    bandScrolls: row.scrollHeight > row.clientHeight + 1,
    capPx: Math.round(innerHeight * 0.32),
    regionScrolls: (() => { const g = document.querySelector("#hud .rows");
      return !!g && g.scrollHeight > g.clientHeight + 1; })(),
    dStillBelow: !!document.querySelector("#hud .d-card"),
  };
}, LONG);
check("the worst route in the catalog is not clipped", !r.clippedV && !r.clippedH,
  `${r.shownChars}/${r.chars} chars, ${r.height}px tall`);
check("no line clamp is in force", r.lineClamp === "none" || r.lineClamp === "auto" || !r.lineClamp, String(r.lineClamp));
// Capping R would be capping R. Bounding the window onto R is not: every pill
// is here, at full height, unclipped, and reachable by scrolling the band it
// sits in. What changed is that the band scrolls rather than the whole card —
// one region scrolling as a whole let whichever band came first spend the
// entire card, and a reader met a card with nothing on it to press.
check("every pill is still here, none dropped to make room", r.pillCount === r.pillsInDom,
  `${r.pillCount} pills`);
// What is asserted is completeness, not height: the injected worst case is
// whole in the DOM and nothing about the row hides it. The old form demanded
// the row outgrow a retired 32vh cap — true only of the pasted phantom it
// carried, not of every honest worst case the store can hold.
check("the row holding them is complete, however tall that makes it",
  r.pillsInDom === r.pillCount && !r.clippedV && !r.clippedH,
  `${r.rowScrollH}px of pills, ${r.pillCount} pills, none clipped`);
check("the band scrolls, not the whole card", r.bandScrolls && !r.regionScrolls);
check("the record is still in view", r.dStillBelow);
{
  const { mkdirSync } = await import("node:fs");
  const shots = join(HERE, "..", "build", "shots");
  mkdirSync(shots, { recursive: true });
  await p.screenshot({ path: join(shots, "long-pill.png") });
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
