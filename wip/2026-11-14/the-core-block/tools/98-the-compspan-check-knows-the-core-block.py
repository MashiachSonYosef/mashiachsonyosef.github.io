# check-compspan-coverage-v1, C3, after core-block-rule-v1 (the owner, 14 November 2026): a card whose line reads
# the source's set, the set having one core piece, opens on the set's division with the core block pressed; the
# source's line says the set above the readings of every block of that division; the set is never one of a block's
# pills; the division pressed again stands on the set whole; and the whole form and the other divisions carry
# neither a divided reading nor the source's line, as before. A set with no core piece, or more than one, opens on
# the set whole, as before. Each edit is refused unless its text stands exactly once.
# python3 -I 98-the-compspan-check-knows-the-core-block.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""//       under "the source here" the card opens on the division that is the
//       set's pieces, standing on it whole: no block pressed, one reading,
//       the set, pressed, and the source's line the set; a block pressed
//       alone carries neither the set nor the source's line, and pressing the
//       division again stands on the set again; the whole form, pressed,
//       offers no reading carrying the division's mark; and on any other
//       division no block carries the source's line
""", """//       under "the source here" the card opens on the division that is the
//       set's pieces. Where the set has one core piece the card opens with
//       that block pressed, its own readings below and the source's line, the
//       set, above them (core-block-rule-v1, the owner, 14 November 2026:
//       "open them on the part that carries the meaning, the place's reading
//       still on top"); a set with no core piece, or more than one, stands
//       whole, its one reading the set, pressed. Every block of the set's
//       division keeps the source's line, the set, on top, and none offers the
//       set as one of its pills; pressing the division again stands on the set
//       whole; the whole form, pressed, offers no reading carrying the
//       division's mark and no source's line; and on any other division no
//       block carries the source's line
""")
one("""      out.push({ si, wi, n: w.pg.length, row, chain, label: z.sections[si].label, s: w.s, k: w.k, pieces: w.pg.map((x) => x.k), glosses: w.pg.map((x) => String(x.g).trim()) });
""", """      const cores = w.pg.map((x, i) => (x.r === "core" ? i : -1)).filter((i) => i >= 0);
      out.push({ si, wi, n: w.pg.length, row, chain, label: z.sections[si].label, s: w.s, k: w.k, pieces: w.pg.map((x) => x.k), glosses: w.pg.map((x) => String(x.g).trim()), core: cores.length === 1 ? cores[0] : -1 });
""")
one("""      const opened = await p.evaluate(() => ({
        cut: (document.querySelector('#hud .b-cut .s-pills button[aria-pressed="true"]') || {}).textContent || null,
        blocks: document.querySelectorAll('#hud .b-cell .s-pills button[aria-pressed="true"]').length,
        pills: [...document.querySelectorAll("#hud .r-pills button")].map((x) => (x.getAttribute("aria-pressed") === "true" ? "*" : "") + x.textContent.trim()),
        line: (document.querySelector("#hud .r-piece:not(.r-sug) b") || {}).textContent || null }));
      if (opened.cut !== finest) notLed.push(`${c.label} ${c.s}: opens on ${opened.cut}, owed ${finest}`);
      else if (opened.blocks) notLed.push(`${c.label} ${c.s}: opens with a block pressed`);
      else if (opened.pills.length !== 1 || opened.pills[0] !== `*${set}`) notLed.push(`${c.label} ${c.s}: opens on ${opened.pills.slice(0, 3).join(", ")}, owed the one pill *${set}`);
      else if (opened.line !== set) notLed.push(`${c.label} ${c.s}: the source's line reads ${opened.line}, owed the set ${set}`);
      else {
        // a block alone: neither the set nor the source's line
        for (let i = 0; i < c.n; i += 1) {
          await p.evaluate((i2) => { const x = document.querySelectorAll("#hud .b-cell .s-pills button")[i2]; if (x) x.click(); }, i);
          try { await p.waitForFunction((k) => (document.querySelector("#hud .b-read .r-label") || {}).textContent?.includes(`· ${k} ·`), c.pieces[i], { timeout: 15000 }); } catch { /* read below */ }
          await p.waitForTimeout(150);
          const blk = await p.evaluate(() => ({ line: (document.querySelector("#hud .r-piece:not(.r-sug)") || {}).textContent || null, pills: [...document.querySelectorAll("#hud .r-pills button")].map((x) => x.textContent.trim()) }));
          if (blk.line) notLed.push(`${c.label} ${c.s} block ${c.pieces[i]} alone: "${blk.line.trim()}"`);
          if (blk.pills.includes(set)) notLed.push(`${c.label} ${c.s} block ${c.pieces[i]} alone offers the set`);
        }
""", """      // a card that opens on its core block is read once its block's readings have come
      if (c.core >= 0) { try { await p.waitForFunction((k) => (document.querySelector("#hud .b-read .r-label") || {}).textContent?.includes(`· ${k} ·`), c.pieces[c.core], { timeout: 15000 }); } catch { /* read below */ } await p.waitForTimeout(150); }
      const opened = await p.evaluate(() => ({
        cut: (document.querySelector('#hud .b-cut .s-pills button[aria-pressed="true"]') || {}).textContent || null,
        blocks: [...document.querySelectorAll("#hud .b-cell .s-pills button")].map((x, i) => (x.getAttribute("aria-pressed") === "true" ? i : -1)).filter((i) => i >= 0),
        pills: [...document.querySelectorAll("#hud .r-pills button")].map((x) => (x.getAttribute("aria-pressed") === "true" ? "*" : "") + x.textContent.trim()),
        line: (document.querySelector("#hud .r-piece:not(.r-sug) b") || {}).textContent || null }));
      if (opened.cut !== finest) notLed.push(`${c.label} ${c.s}: opens on ${opened.cut}, owed ${finest}`);
      else if (c.core >= 0 && (opened.blocks.length !== 1 || opened.blocks[0] !== c.core)) notLed.push(`${c.label} ${c.s}: opens with ${opened.blocks.length ? `block ${opened.blocks.map((i) => c.pieces[i]).join(", ")}` : "no block"} pressed, owed the core block ${c.pieces[c.core]}`);
      else if (c.core < 0 && opened.blocks.length) notLed.push(`${c.label} ${c.s}: a set with no one core piece opens with a block pressed`);
      else if (c.core < 0 && (opened.pills.length !== 1 || opened.pills[0] !== `*${set}`)) notLed.push(`${c.label} ${c.s}: opens on ${opened.pills.slice(0, 3).join(", ")}, owed the one pill *${set}`);
      else if (c.core >= 0 && opened.pills.some((x) => x.replace(/^\\*/u, "") === set)) notLed.push(`${c.label} ${c.s}: the core block offers the set as one of its pills`);
      else if (opened.line !== set) notLed.push(`${c.label} ${c.s}: the source's line reads ${opened.line}, owed the set ${set}`);
      else {
        // every block of the set's division: the set on top, never one of its pills
        for (let i = 0; i < c.n; i += 1) {
          await p.evaluate((i2) => { const x = document.querySelectorAll("#hud .b-cell .s-pills button")[i2]; if (x) x.click(); }, i);
          try { await p.waitForFunction((k) => (document.querySelector("#hud .b-read .r-label") || {}).textContent?.includes(`· ${k} ·`), c.pieces[i], { timeout: 15000 }); } catch { /* read below */ }
          await p.waitForTimeout(150);
          const blk = await p.evaluate(() => ({ line: (document.querySelector("#hud .r-piece:not(.r-sug) b") || {}).textContent || null, pills: [...document.querySelectorAll("#hud .r-pills button")].map((x) => x.textContent.trim()) }));
          if (blk.line !== set) notLed.push(`${c.label} ${c.s} block ${c.pieces[i]}: the source's line reads ${blk.line === null ? "nothing" : `"${blk.line.trim()}"`}, owed the set ${set} on top`);
          if (blk.pills.includes(set)) notLed.push(`${c.label} ${c.s} block ${c.pieces[i]} alone offers the set`);
        }
""")
one("""check("C3  the source's set is one reading of its division, never fanned out, never on the whole form",
  picks.length > 0 && notLed.length === 0,
  notLed.length ? notLed.slice(0, 3).join("; ") : "every card opened on the set's division whole, the set its one pill; no block alone carried the set or the source's line; no whole form offered a divided reading");
""", """check("C3  the source's set is one reading of its division, never fanned out, never on the whole form; its card opens on the core block, the set on top",
  picks.length > 0 && notLed.length === 0,
  notLed.length ? notLed.slice(0, 3).join("; ") : `${picks.filter((c) => c.core >= 0).length} cards opened on the set's core block and ${picks.filter((c) => c.core < 0).length} on the set whole; every block of the set's division kept the set on top and none offered it; no whole form offered a divided reading or the source's line`);
""")
open(p, "w", encoding="utf-8").write(s)
print("check-compspan-coverage-v1.mjs: 4 edits")
