import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d="") => { if(!ok) bad++; console.log(`${ok?"  ok  ":"FAIL  "}${n}${d?"  ·  "+d:""}`); };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto("http://127.0.0.1:8899/zone.html?b=1kings", { waitUntil: "networkidle" });
await p.waitForSelector("section.seg");
await (await p.$$("section.seg .he-text .wb"))[1].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });

// the real worst case in the catalog: the 492-character Strong's route on בא
const LONG = "abide, apply, attain, X be, befall, + besiege, bring (forth, in, into, to pass), call, carry, X certainly, (cause, let, thing for) to come (against, in, out, upon, to pass), depart, X doubtless again, + eat, + employ, (cause to) enter (in, into, -tering, -trance, -try), be fallen, fetch, + follow, get, give, go (down, in, to war), grant, + have, X indeed, (in-)vade, lead, lift (up), mention, pull in, put, resort, run (down), send, set, X (well) stricken (in age), X surely, take (in), way";
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
check("the row holding them is complete, however tall that makes it",
  r.rowScrollH > r.capPx, `${r.rowScrollH}px of pills, past what used to be a ${r.capPx}px cap`);
check("the band scrolls, not the whole card", r.bandScrolls && !r.regionScrolls);
check("the record is still in view", r.dStillBelow);
await p.screenshot({ path: "/home/claude/k3/shots/long-pill.png" });
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
