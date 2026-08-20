#!/usr/bin/env node
// GUARDS: attachment-authorship-rule-v1-the-placement-is-ours-and-says-so
//
// A placement this project made says so.
//
// Two things bring a commentary to a word, and only one of them is anybody
// else's. Which comment of which work is the chain's. Where inside the section
// it sits is, for 180 of the 181 attachments on Genesis 1:1, not recorded
// anywhere: no source states it, no ledger carries it, and no licence covers
// it — a licence governs the text of a commentary, and a placement is not text.
// It was computed by tools/generate-attachment-map-v2.mjs, by choosing to
// honour the convention that a commentary opens by quoting what it is about.
//
// The page said "the chain records" over the top of that in six places. That
// took credit from a source that never gave it and hid an opinion inside a
// receipt, which is the failure this whole project exists to avoid. So: a card
// showing a placement we made must name us as having made it, and a card
// showing an attachment nobody had to place must not.
//
// Run: node tools/check-whose-claim-v1.mjs [url]

import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
const BASE = (process.argv[2] || "http://127.0.0.1:8899/zone.html").split("?")[0];
let bad = 0;
const check = (name, ok, detail = "") => {
  if (!ok) bad += 1;
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}${detail ? "  ·  " + detail : ""}`);
};
const b = await chromium.launch();

// ---- a placement we made, on the card ---------------------------------
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=genesis`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .c-mark");
  await p.waitForTimeout(800);
  console.log("— a placement this reader made says so —");
  await p.evaluate(() => document.querySelector("section.seg .c-mark").click());
  await p.waitForTimeout(400);
  // Ramban is one of the 180 placed by the rule rather than proven
  const i = await p.evaluate(() => [...document.querySelectorAll(".c-choice")]
    .findIndex((x) => x.textContent.includes("Ramban")));
  await p.evaluate((k) => document.querySelectorAll(".c-choice")[k].click(), i);
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const pan = document.querySelector("section.seg .c-mark-slot:not(.c-choose)");
    const said = (pan.querySelector(".c-how-said")?.textContent || "").replace(/\s+/g, " ");
    let basis = null;
    const units = (window.__commentaryStore || {}).units || {};
    for (const u of Object.values(units))
      for (const list of Object.values(u.words || {}))
        for (const e of list) if (e.ref === pan.dataset.unit) basis = e.basis;
    return { said, basis };
  });
  check("  it is one of the ones we placed", r.basis === "DIBBUR_HAMATCHIL_SUGGESTION_NOT_PROVEN", r.basis);
  check("  and the card says this reader put it here",
    /this reader put it here/i.test(r.said), r.said.slice(0, 70) + "…");
  check("  and says nobody licenses the convention it honoured",
    /licenc?e/i.test(r.said) && /convention/i.test(r.said));
  check("  and says nothing recorded the placement",
    /nothing recorded this placement/i.test(r.said));
  check("  and does not credit the chain for the placement",
    !/the chain records|the chain recorded/i.test(r.said),
    /chain/i.test(r.said) ? "mentions the chain — check it is only for the coordinate" : "no such claim");
  // Said short. The claim is the point; sixty words of it is a paragraph a
  // reader skips, and a claim nobody reads is not being made.
  check("  and says it in a line, not a paragraph", r.said.split(/\s+/).length <= 45,
    `${r.said.split(/\s+/).length} words`);
  await p.close();
}

// ---- an attachment nobody had to place --------------------------------
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=1kings`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .c-bar");
  await p.waitForTimeout(700);
  console.log("— an attachment nobody had to place says that too —");
  await p.evaluate(() => document.querySelector("section.seg .c-bar").click());
  await p.waitForTimeout(600);
  const said = await p.evaluate(() =>
    (document.querySelector("section.seg .c-inline .c-att")?.textContent || "").replace(/\s+/g, " "));
  // The chain numbers both works; reading two identical numbers as one place
  // is this project's rule, not the chain's. A page that says "the chain
  // matched it" has handed its own smallest claim to somebody else.
  check("  it stands on a coordinate the chain gives, not a placement",
    /same number/i.test(said) && /numbers are the chain/i.test(said), said.slice(0, 80) + "…");
  check("  and says that reading them as an attachment is ours",
    /reading them as an attachment is ours/i.test(said));
  check("  and still says nothing inside the section was placed",
    /nothing inside the section was placed/i.test(said));
  await p.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
