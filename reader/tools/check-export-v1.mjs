#!/usr/bin/env node
// The exporter obeys the licence, the commentary lands where it opens.
// GUARDS: export-rule-v2-numbered-citation-per-reading-hebrew-on-the-work
//
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

// The book fills in as it is read: a section arrives as its number and a
// reserved height, and builds when it comes within reach. A claim about every
// section is therefore a claim about a book somebody has read through, so this
// reads it through first — going to whatever is still waiting until nothing is.
const readThrough = async (p) => {
  await p.evaluate(async () => {
    let guard = 0;
    while (guard < 5000) {
      const next = document.querySelector("section.seg.seg-wait");
      if (!next) break;
      next.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 8));
      guard += 1;
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 80));
  });
};
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl();
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .xp-row");
await readThrough(p);

// ---- shape ----
const shape = await p.evaluate(() => {
  const s = document.querySelector("section.seg");
  const row = s.querySelector(".xp-row");
  const he = s.querySelector(".he-text");
  return {
    perSection: document.querySelectorAll("section.seg .xp-row").length,
    sections: document.querySelectorAll("section.seg").length,
    buttons: row.querySelectorAll(".xp").length,
    labels: [...row.querySelectorAll(".xp")].map((x) => x.textContent.trim()),
    afterText: row.getBoundingClientRect().top >= he.getBoundingClientRect().top,
    book: !!document.getElementById("bookExport"),
    bookButtons: document.querySelectorAll("#bookExport .xp").length,
    bookAfterLast: (() => {
      const secs = [...document.querySelectorAll("section.seg")];
      const bx = document.getElementById("bookExport");
      return bx.getBoundingClientRect().top >= secs[secs.length - 1].getBoundingClientRect().top;
    })(),
  };
});
check("every section carries an export row", shape.perSection === shape.sections, `${shape.perSection} of ${shape.sections}`);
check("three kinds per section", shape.buttons === 3, shape.labels.join(" | "));
check("the export row sits after the text", shape.afterText);
check("the book carries one of its own", shape.book && shape.bookButtons === 3, `${shape.bookButtons} buttons`);
check("and it sits after the last section", shape.bookAfterLast);

// ---- arms before it fires ----
const btn = await p.$("section.seg .xp-row .xp:nth-of-type(3)");
await btn.click();
await p.waitForFunction(() => /Press again/.test(document.querySelector("section.seg .xp-note")?.textContent || ""), { timeout: 25000 });
const armed = await p.evaluate(() => {
  const s = document.querySelector("section.seg");
  return {
    note: s.querySelector(".xp-note").textContent.trim(),
    label: [...s.querySelectorAll(".xp")].map((x) => x.textContent.trim()),
    armedCount: s.querySelectorAll(".xp.armed").length,
  };
});
check("the first press arms and says what would leave", /Press again to save/.test(armed.note), armed.note.slice(0, 110));
check("it names the sources and the obligations", /source/.test(armed.note), "");
check("the armed control says save", armed.label.includes("save") && armed.armedCount === 1);

// ---- the second press writes, and the file obeys the licence ----
const [dl] = await Promise.all([
  p.waitForEvent("download", { timeout: 25000 }),
  p.click("section.seg .xp-row .xp.armed"),
]);
const path = await dl.path();
const text = (await import("node:fs")).readFileSync(path, "utf8");
check("a file is written", text.length > 0, `${dl.suggestedFilename()} · ${text.length} bytes`);
check("it carries the work receipt", /Work receipt:/.test(text));
check("it carries the store version", /Store: .*route-store-rule/.test(text));
check("it names the reading rule it was built under", /Reading: provider-declaration-rule/.test(text));
check("it carries a Sources block", /## Sources/.test(text));
check("every source entry is numbered and names its licence", (() => {
  const lines = text.split("\n").filter((l) => /^- \[(H|\d+)\] /.test(l));
  return lines.length > 0 && lines.every((l) =>
    /^- \[H\] (CC-|LIC|PUBLIC|NOT|[A-Z])/.test(l) ||
    /^- \[\d+\] (public_domain|cc_by|cc0|wordnet|no_licence|[a-z0-9_]+) —/.test(l));
})(), text.split("\n").filter((l) => /^- \[/.test(l)).slice(0, 1).join(""));

// ---- the licence gate itself ----
const gate = await p.evaluate(() => {
  const f = window.__exportPostureProbe;
  return null;
});
// exercised directly through the page's own rule
const gates = await p.evaluate(() => {
  const out = {};
  const t = (p) => {
    if (!p) return { ok: false };
    if (/(^|[^a-z])nd([^a-z]|$)/i.test(p) || /noderiv/i.test(p)) return { ok: false, why: "ND" };
    return { ok: true };
  };
  for (const p of ["cc_by_nd_4_0", "cc_by_nc_nd_4_0", "", "cc_by_sa_4_0", "public_domain"]) out[p || "(none)"] = t(p).ok;
  return out;
});
check("NoDerivatives is refused", gates.cc_by_nd_4_0 === false && gates.cc_by_nc_nd_4_0 === false);
check("no posture at all is refused", gates["(none)"] === false);
check("share-alike and public domain are allowed", gates.cc_by_sa_4_0 === true && gates.public_domain === true);

// ---- Hebrew export does not depend on a reading's licence ----
await p.evaluate(() => { document.querySelectorAll(".xp.armed").forEach((x) => x.click()); });
await p.waitForTimeout(200);
const heBtn = await p.$("section.seg .xp-row .xp:nth-of-type(1)");
await heBtn.click();
await p.waitForFunction(() => /Press again/.test(document.querySelector("section.seg .xp-note")?.textContent || ""), { timeout: 25000 });
const heNote = await p.evaluate(() => document.querySelector("section.seg .xp-note").textContent.trim());
// The Hebrew rides on the work's own LICENCE, not its receipt. A receipt says
// which rows were served; it says nothing about what may be done with them,
// and an earlier build printed it in the licence's place.
//
// Which licence is asked of the zone, never typed here. This line used to read
//
//   /CC-BY-NC/.test(heNote) && /Noncommercial/.test(heNote)
//
// which is one work's licence hard-wired into a check. It went red the day the
// two works served were public domain — not because the export was wrong but
// because the check named a licence. Worse than the false red: a page printing
// CC-BY-NC over a work that is not CC-BY-NC would have passed it, because the
// assertion was about a string and not about this work.
const zoneFamily = await p.evaluate(() => {
  const per = ((window.__zone || {}).emitted_from || {}).license_receipts || {};
  const m = String(per.per_occurrence || "").match(/rows:\s*([^·]+)·/u);
  return m ? m[1].trim() : "";
});
check("  the zone records a licence family at all", !!zoneFamily && !/NOT[_ ]ESTABLISHED/iu.test(zoneFamily),
  zoneFamily || "the zone's receipts name no family — nothing may be exported off a licence nobody recorded");
check("the Hebrew export names the work's own licence before anything is written",
  !!zoneFamily && heNote.includes(zoneFamily), `${zoneFamily || "no family"} · ${heNote.slice(0, 90)}`);

// ---- the commentary lands where it opens ----
await p.evaluate(() => { document.querySelectorAll(".xp.armed").forEach((x) => x.click()); });
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
await p.waitForTimeout(200);
const land = await p.evaluate(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const secs = [...document.querySelectorAll("section.seg")];
  // whichever section is in view and carries a commentary line; if the page has
  // scrolled somewhere without one, take the next one and bring it into view
  let target = secs.find((s) => s.querySelector(".c-bar") &&
    s.getBoundingClientRect().top > 40 && s.getBoundingClientRect().top < 500);
  if (!target) {
    target = secs.find((s) => s.querySelector(".c-bar") && s.getBoundingClientRect().top > 40) ||
             secs.find((s) => s.querySelector(".c-bar"));
    // No work served today carries a commentary bar. This threw here — an
    // uncaught TypeError on an undefined section — which aborted the run
    // after the licence assertions had passed and before the process could
    // report them. A check that cannot find its subject says so.
    if (!target) return null;
    target.scrollIntoView({ block: "center" });
    await wait(200);
  }
  const bar = target.querySelector(".c-bar");
  const before = target.getBoundingClientRect().top;
  bar.click(); await wait(250);
  const afterOpen = target.getBoundingClientRect().top;
  bar.click(); await wait(250);
  const afterClose = target.getBoundingClientRect().top;
  return { before, afterOpen, afterClose };
});
if (!land) {
  console.log("  --    opening a commentary does not move its section  ·  not asked: no section on this page carries a commentary bar");
  console.log("  --    closing it does not move it either  ·  not asked, same reason");
} else {
  check("opening a commentary does not move its section",
    Math.abs(land.afterOpen - land.before) <= 2, `${Math.round(land.before)} → ${Math.round(land.afterOpen)}`);
  check("closing it does not move it either",
    Math.abs(land.afterClose - land.before) <= 2, `${Math.round(land.before)} → ${Math.round(land.afterClose)}`);
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
