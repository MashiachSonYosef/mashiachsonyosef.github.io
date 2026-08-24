#!/usr/bin/env node
// A card that opens with nothing on it to press is a card that does nothing.
//
// The reader's law, stated plainly: whatever the shape of the form — eight
// divisions, two hundred readings, a four-hundred-word definition — the card
// opens showing the reading that is standing under the word, at least one
// reading they can press, and the source it stands on. Everything longer than
// its share scrolls inside its own band. Nothing is dropped to achieve any of
// it: every division, every block, every reading is present and reachable.
//
// This runs the whole first chapter's worth of words at three window sizes,
// because the failure it exists to catch only showed on some shapes of form.
// GUARDS: span-slice-rule-v1-compspan-template-exact-key
//
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const URL = defaultZoneUrl();
const VIEWPORTS = [
  { width: 412, height: 915, name: "a phone" },
  { width: 412, height: 690, name: "a short phone" },
  { width: 1440, height: 900, name: "a desktop" },
  { width: 900, height: 440, name: "a desktop window squashed flat" },
];
const WORDS = 24;

const b = await chromium.launch(launchOptions());
for (const vp of VIEWPORTS) {
  const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const wbs = await p.$$("section.seg .he-text .wb");

  const seen = [];
  for (let i = 0; i < Math.min(wbs.length, WORDS); i += 1) {
    await wbs[i].click();
    await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
    await p.waitForTimeout(90);
    seen.push(await p.evaluate(() => {
      const h = document.getElementById("hud"), hb = h.getBoundingClientRect();
      // "on the card" means a reader can put a finger on it and hit it. Testing
      // the pill's rect against the card's edges is not that test and it passed
      // a build where the readings were rendering behind the record: present,
      // on screen, and dead. This asks the page what is actually at that point.
      const pressable = (e) => {
        const r = e.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return false;
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
        const t = document.elementFromPoint(x, y);
        return !!t && (t === e || e.contains(t));
      };
      const inside = (e) => { const r = e.getBoundingClientRect(); return !!e && r.top >= hb.top - 1 && r.bottom <= hb.bottom + 1; };
      const pills = [...h.querySelectorAll(".r-pills button")];
      const divs = [...h.querySelectorAll(".b-cut .s-pills button")];
      const band = (q) => { const e = h.querySelector(q); return e ? { h: Math.round(e.getBoundingClientRect().height), all: e.scrollHeight } : null; };
      return {
        word: h.querySelector(".head b")?.textContent || "",
        readings: pills.length, pressable: pills.filter(pressable).length,
        divisions: divs.length, divisionsPressable: divs.filter(pressable).length,
        nowIn: inside(h.querySelector(".r-now")),
        nowText: (h.querySelector(".r-now .v")?.textContent || "").trim(),
        mIn: inside(h.querySelector(".d-foot .att")),
        // the same hit-test on the structural bands: a division you can see
        // but cannot hit is a division that is not there
        blocks: [...h.querySelectorAll(".b-cell .s-pills button")].length,
        blocksPressable: [...h.querySelectorAll(".b-cell .s-pills button")].filter(pressable).length,
        // A band cut mid-pill reads as something broken. A band that stops on a
        // row boundary reads as something that scrolls — which is what it is.
        sliced: [".b-cut .s-pills", ".b-cell .s-pills", ".b-read .r-pills"].reduce((n, q) => {
          const box = h.querySelector(q); if (!box) return n;
          const r = box.getBoundingClientRect();
          return n + [...box.children].filter((c) => {
            const cr = c.getBoundingClientRect();
            return cr.top < r.bottom - 0.5 && cr.bottom > r.bottom + 0.5;
          }).length;
        }, 0),
        // and how the two bands compare, which is the thing being normalised
        divRows: (() => { const box = h.querySelector(".b-cut .s-pills");
          if (!box || !box.children.length) return 0;
          return new Set([...box.children].filter((c) => {
            const cr = c.getBoundingClientRect(), r = box.getBoundingClientRect();
            return cr.bottom <= r.bottom + 0.5;
          }).map((c) => Math.round(c.getBoundingClientRect().top))).size; })(),
        divRowsAll: (() => { const box = h.querySelector(".b-cut .s-pills");
          if (!box || !box.children.length) return 0;
          return new Set([...box.children].map((c) => Math.round(c.getBoundingClientRect().top))).size; })(),
        dStarts: (() => { const d = h.querySelector(".d-text"); if (!d) return false;
          const r = d.getBoundingClientRect(); return r.top >= hb.top - 1 && r.top < hb.bottom; })(),
        cardIn: hb.top >= -1 && hb.bottom <= innerHeight + 1,
        // the card gives up height to stay under its word; a band's share is
        // read against the height it actually got, not the one it might have had
        constrained: !!h.style.maxHeight,
        overflow: h.scrollHeight - Math.round(hb.height),
        readBand: band(".b-read .r-pills"), cutBand: band(".b-cut .s-pills"), dBody: band(".d-body"),
      };
    }));
    await p.keyboard.press("Escape");
    await p.waitForTimeout(40);
  }

  const noPress = seen.filter((s) => s.pressable < 1);
  const noDiv = seen.filter((s) => s.divisions > 0 && s.divisionsPressable < 1);
  const noNow = seen.filter((s) => !s.nowIn || !s.nowText);
  const noM = seen.filter((s) => !s.mIn);
  const noD = seen.filter((s) => !s.dStarts);
  const spill = seen.filter((s) => s.overflow > 1 || !s.cardIn);
  const worst = seen.reduce((a, s) => (a && a.pressable <= s.pressable ? a : s), null);
  const fattest = seen.reduce((a, s) => (a && a.readings >= s.readings ? a : s), null);

  console.log(`— ${vp.name}, ${vp.width}×${vp.height}, ${seen.length} words —`);
  check("  every card opens with a reading the reader can press", noPress.length === 0,
    noPress.length ? noPress.slice(0, 2).map((s) => s.word).join(", ")
                   : `fewest ${worst.pressable} on ${worst.word} (${worst.readings} readings)`);
  check("  a form that divides shows a division to press", noDiv.length === 0,
    noDiv.slice(0, 2).map((s) => `${s.word}: ${s.divisions} divisions, none pressable`).join("; ") || "all showing");
  const noBlock = seen.filter((s) => s.blocks > 0 && s.blocksPressable < 1);
  check("  a division with blocks shows a block to press", noBlock.length === 0,
    noBlock.slice(0, 2).map((s) => `${s.word}: ${s.blocks} blocks, none pressable`).join("; ") || "all showing");
  const sliced = seen.filter((s) => s.sliced > 0);
  check("  no band is cut through a pill", sliced.length === 0,
    sliced.slice(0, 2).map((s) => `${s.word}: ${s.sliced} half-shown`).join("; ") || "every band stops on a row");
  // How many whole rows of divisions a window is entitled to. Three where there
  // is room, fewer on a short one — the point is that the band is a share of the
  // card rather than a token, and that the share is a decision rather than
  // whatever was left over.
  const owed = vp.height >= 660 ? 3 : vp.height >= 480 ? 2 : 1;
  const divided = seen.filter((s) => s.divisions > 3);
  // either all of them, or the whole share the window owes — a band showing
  // four divisions on one row is showing four divisions, not a token
  const thin = divided.filter((s) =>
    s.divRows < Math.min(s.constrained ? 1 : owed, s.divRowsAll));
  check("  a form with many divisions shows its share of them, not a token row",
    thin.length === 0,
    thin.length ? thin.slice(0, 2).map((s) => `${s.word}: ${s.divisions} divisions over ${s.divRows} rows, owed ${owed}`).join("; ")
      : divided.length ? `${divided[0].divisions} divisions over ${divided[0].divRows} whole rows, ${owed} owed here`
                       : "no form here divides more than three ways");
  check("  every card says what is standing under the word", noNow.length === 0,
    noNow.slice(0, 2).map((s) => s.word).join(", ") || "all saying it");
  check("  every card shows the record and its source", noD.length === 0 && noM.length === 0,
    [...noD, ...noM].slice(0, 2).map((s) => s.word).join(", ") || "all showing");
  check("  no card spills off its own edges", spill.length === 0,
    spill.slice(0, 2).map((s) => `${s.word} by ${s.overflow}px`).join(", ") || "none");
  check("  a long band scrolls inside itself rather than taking the card",
    !fattest.readBand || fattest.readBand.all > fattest.readBand.h,
    `${fattest.word}: ${fattest.readings} readings, ${fattest.readBand?.all}px of pills in a ${fattest.readBand?.h}px band, ${fattest.pressable} pressable at once`);
  // ---- the shape the corpus has not reached yet -----------------------
  //
  // Eight divisions is what 1 Kings happens to carry. The structure is not
  // bounded at eight, and a band that holds today because the number is small
  // is a band that has not been tested. So: two hundred divisions and two
  // hundred blocks, cloned onto a real card, and the readings must still be
  // there to press.
  {
    await wbs[0].click();
    await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
    await p.waitForTimeout(150);
    await p.evaluate(() => {
      const bs = [...document.querySelectorAll("#hud .b-cut .s-pills button")];
      const many = bs.find((x) => (x.textContent.match(/\+/g) || []).length >= 2) || bs[1];
      if (many) many.click();
    });
    await p.waitForTimeout(400);
    const stressed = await p.evaluate(() => {
      const h = document.getElementById("hud");
      for (const q of [".b-cut .s-pills", ".b-cell .s-pills"]) {
        const row = h.querySelector(q); if (!row) continue;
        const proto = row.querySelector("button"); if (!proto) continue;
        while (row.querySelectorAll("button").length < 200) {
          const c = proto.cloneNode(true); c.setAttribute("aria-pressed", "false"); row.append(c);
        }
      }
      // cloning pills straight into the DOM skips the render path that would
      // normally re-fit the bands, so say so the way a window resize does
      window.dispatchEvent(new Event("resize"));
      const hb = h.getBoundingClientRect();
      const press = (e) => {
        const r = e.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return false;
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
        const t = document.elementFromPoint(x, y);
        return !!t && (t === e || e.contains(t));
      };
      const inside = (e) => { if (!e) return false; const r = e.getBoundingClientRect();
        return r.top >= hb.top - 1 && r.bottom <= hb.bottom + 1; };
      const P = (q) => [...h.querySelectorAll(q)];
      return {
        divisions: P(".b-cut .s-pills button").length, divPress: P(".b-cut .s-pills button").filter(press).length,
        blocks: P(".b-cell .s-pills button").length, blockPress: P(".b-cell .s-pills button").filter(press).length,
        readings: P(".r-pills button").length, readPress: P(".r-pills button").filter(press).length,
        m: inside(h.querySelector(".d-foot .att")),
        d: (() => { const x = h.querySelector(".d-text"); if (!x) return false;
          const r = x.getBoundingClientRect(); return r.top >= hb.top - 1 && r.top < hb.bottom; })(),
      };
    });
    check("  with 200 divisions and 200 blocks, a reading is still there to press",
      stressed.readPress > 0,
      `${stressed.readPress} of ${stressed.readings} readings, ${stressed.divPress} of ${stressed.divisions} divisions, ${stressed.blockPress} of ${stressed.blocks} blocks`);
    check("  and the record and its source are still in view",
      stressed.d && stressed.m, `record ${stressed.d}, source ${stressed.m}`);
    await p.keyboard.press("Escape");
  }
  // ---- the card carries no commentary at all --------------------------
  //
  // It used to. A commentary attached at a word was appended to the card as a
  // sibling of the bands, and a word carrying a full Rashi — every word of
  // Genesis 1:1 — flattened the readings region to nothing and its pills
  // rendered behind the record. Commentary is the section's other text and now
  // opens in the section, in the line, at the words it covers. Nothing about a
  // commentary belongs in the box that holds the readings and the record.
  {
    await wbs[1].click();
    await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
    await p.waitForTimeout(200);
    const onCard = await p.evaluate(() => {
      const h = document.getElementById("hud");
      return { band: h.querySelectorAll(".c-band").length,
        pills: h.querySelectorAll(".c-pills").length,
        card: h.querySelectorAll(".c-card").length,
        kinds: [...h.children].map((e) => e.className || e.tagName).join(", ") };
    });
    check("  the card holds the readings and the record, and no commentary",
      onCard.band === 0 && onCard.pills === 0 && onCard.card === 0, onCard.kinds);
    await p.keyboard.press("Escape");
  }
  await p.close();
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
