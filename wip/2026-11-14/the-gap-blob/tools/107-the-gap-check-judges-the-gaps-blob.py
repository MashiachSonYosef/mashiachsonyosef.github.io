# check-sign-gap-joiner-v1, G4, for gap-blob-rule-v1 (the owner, 14 November 2026: "spacing looks better but blobs
# will need updated"): on the pages G3 opens, and once more under the English reader, every hidden sign's letters
# wear a blob marked as the gap's, standing in its letters' columns and stopping short of the English row, and every
# other blob reaches over its English whole. Each edit is refused unless its text stands exactly once.
# python3 -I 107-the-gap-check-judges-the-gaps-blob.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)

one("""// GUARDS: sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap
""", """// GUARDS: sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap, gap-blob-rule-v1-a-hidden-signs-letters-wear-a-blob-of-their-own-ink-and-tie-to-nothing
""")
one("""//       was counted as a second row of its run, and every run that holds a gap was drawn at four fifths of its size)
//
""", """//       was counted as a second row of its run, and every run that holds a gap was drawn at four fifths of its size)
//   G4  a hidden sign's letters wear a blob of their own, closed around their ink, and it ties to nothing (the owner,
//       14 November 2026, once the joiner beside the gap went: "spacing looks better but blobs will need updated").
//       On the pages G3 opens, once their blobs are all drawn, and on the first of them again under the English
//       reader: every gap the page lays in a word or a run that wears blobs has a blob marked as the gap's, on its
//       own word; that blob stands within its letters' columns and stops short of the English row (it never reaches
//       the middle of the gap's slot); and every other blob reaches over its English whole. Until 14 November the
//       gap's blob ran down to its empty slot, a stalk pressed against the blob beside it, crossing it in the
//       English reader
//
""")
one("""const g3 = { opened: [], runs: 0,""", """/** IN THE PAGE. Every blob drawn, judged: a gap's (data-gap) closed on its letters, every other reaching its English. */
const blobsInPage = () => {
  const r = { en: document.body.classList.contains("en"), hosts: 0, gapPieces: 0, gapBlobs: 0, ties: 0, faults: [] };
  const where = (el) => { const sec = el.closest("section.seg"); return (sec && sec.querySelector(".vnum") || {}).textContent || "?"; };
  const nums = (v) => String(v || "").split(",").map(Number);
  for (const svg of document.querySelectorAll(".he-text svg.wj-tie")) {
    const host = svg.parentElement; r.hosts += 1;
    const paths = [...svg.querySelectorAll("path[data-wi]")];
    for (const g of host.querySelectorAll(".g-pc.gap, .g-part.gap")) {
      r.gapPieces += 1;
      const part = g.closest(".g-part"), wi = part ? String(part.dataset.wi) : "0";
      if (!paths.some((x) => x.dataset.gap === "1" && x.dataset.wi === wi) && r.faults.length < 6) r.faults.push(`${where(host)}: a gap whose letters wear no blob of their own`);
    }
    for (const x of paths) {
      const bb = x.getBBox(), [hL, hR] = nums(x.dataset.he), [, , eT, eB] = nums(x.dataset.en);
      const top = bb.y, bottom = bb.y + bb.height, mid = (eT + eB) / 2;
      if (x.dataset.gap === "1") {
        r.gapBlobs += 1;
        const inColumns = bb.x >= hL - 1.5 && bb.x + bb.width <= hR + 1.5;
        const short = r.en ? top > mid : bottom < mid;
        if ((!inColumns || !short) && r.faults.length < 6) r.faults.push(`${where(host)}: a gap's blob ${!inColumns ? "leaves its letters' columns" : "reaches the English row"} (${Math.round(top)}..${Math.round(bottom)}, its slot ${Math.round(eT)}..${Math.round(eB)})`);
      } else {
        r.ties += 1;
        if (!(top <= eT + 1.5 && bottom >= eB - 1.5) && r.faults.length < 6) r.faults.push(`${where(host)}: a blob that does not reach over its English (${Math.round(top)}..${Math.round(bottom)}, its English ${Math.round(eT)}..${Math.round(eB)})`);
      }
    }
  }
  return r;
};
const g4 = { readers: [], hosts: 0, gapPieces: 0, gapBlobs: 0, ties: 0, faults: [] };
const addBlobs = (r, work) => {
  g4.readers.push(`${work} ${r.en ? "English on top" : "Hebrew on top"}: ${nf(r.gapBlobs)} gap blobs`);
  for (const k of ["hosts", "gapPieces", "gapBlobs", "ties"]) g4[k] += r[k];
  for (const x of r.faults) if (g4.faults.length < 12) g4.faults.push(`${work}${r.en ? " (English on top)" : ""} ${x}`);
};
const blobsDrawn = async (p) => {
  await p.evaluate(() => { window.__tieMs = null; window.__drawAllTies(); });
  await p.waitForFunction(() => !!window.__tieMs, null, { timeout: 30000 });
  await p.waitForFunction(() => !window.__tiePending, null, { timeout: 60000 });
  return p.evaluate(blobsInPage);
};
const g3 = { opened: [], runs: 0,""")
one("""        const withThem = await fitted();
""", """        const withThem = await fitted();
        addBlobs(await blobsDrawn(p), work);
""")
one("""      for (const x of got.faults) if (g3.faults.length < 12) g3.faults.push(`${work} ${x}`);
    } finally { await ctx.close(); }
  }
""", """      for (const x of got.faults) if (g3.faults.length < 12) g3.faults.push(`${work} ${x}`);
    } finally { await ctx.close(); }
  }
  // the first work again, under the English reader: its English stands over the letters
  if (g3.opened.length && !g3.noRedraw.length) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      await p.goto(`${tree.base}/zone.html?b=${g3.opened[0]}&mode=en`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await linesOnPage(p);
      addBlobs(await blobsDrawn(p), g3.opened[0]);
    } finally { await ctx.close(); }
  }
""")
one("""
console.log(bad ? `\\n${bad} FAILED` : "\\nall checks passed");""", """check("G4  a hidden sign's letters wear a blob of their own, closed around their ink, tied to no English; every other blob reaches over its English",
  g4.readers.length >= 2 && g4.gapBlobs > 0 && g4.gapPieces > 0 && !g4.faults.length,
  g4.readers.length < 2 ? `blobs were judged under ${g4.readers.length} reader(s), not both: ${first(g4.readers)}`
    : g4.faults.length ? `${g4.faults.length}${g4.faults.length >= 12 ? " or more" : ""} · ${first(g4.faults, 3)}`
    : `${g4.readers.join(" · ")} · ${nf(g4.gapPieces)} gaps laid where blobs are worn, each with its own blob · ${nf(g4.ties)} other blobs, each over its English`);

console.log(bad ? `\\n${bad} FAILED` : "\\nall checks passed");""")
open(p, "w", encoding="utf-8").write(s); print("check-sign-gap-joiner-v1.mjs: 6 edits")
