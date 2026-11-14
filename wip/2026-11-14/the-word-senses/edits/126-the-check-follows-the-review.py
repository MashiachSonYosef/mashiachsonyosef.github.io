# tools/check-word-senses-v1.mjs: the review of 14 November 2026, held. W2 asks the page whether the record was baked
# against the served overlay; W3 asks that no blue pill on Jastrow's records alone prints a word sense's words while
# the word sense is held back (its twin, Obadiah 1:8 «retentive»); W5 presses a word sense over a reading on the word
# beside it and asks for that reading back when the switch goes off; W7 holds every served row that prints a listed
# word sense's words under its key and source id to the record. Refused unless each text stands once.
# python3 -I 126-the-check-follows-the-review.py <check-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//   W2  on a first visit the switch rests off, and nothing on the device says otherwise
""", """//   W2  on a first visit the switch rests off, and nothing on the device says otherwise; and the page reads the
//       record as baked against the overlay it serves (a record of another version marks nothing)
""")
one("""//   W4  the reset pill puts the switch back where it rests
""", """//       Nor does a blue pill on Jastrow's records alone print a word sense's words while it is held back (its
//       bare twin: the review of 14 November 2026, Obadiah 1:8 «retentive»).
//   W4  the reset pill puts the switch back where it rests
""")
one("""//   W6  the owner's legend""", """//   W7  every served Jastrow row that prints a listed word sense's words under its key and source id is in the
//       record, listed or as its twin, so none stands at rest as a definition
//   W6  the owner's legend""")
one("""      if (w2.said === null) { w2.said = await p.evaluate(() => window.__senses); w2.kept = await p.evaluate(() => { try { return localStorage.getItem("fh.senses"); } catch { return null; } }); }""",
    """      if (w2.said === null) { w2.said = await p.evaluate(() => window.__senses); w2.fit = await p.evaluate(() => window.__sensesFit); w2.kept = await p.evaluate(() => { try { return localStorage.getItem("fh.senses"); } catch { return null; } }); }""")
one("""check("W2  on a first visit the switch rests off", w2.said === "off" && w2.kept === null,
  w2.said === null ? "no page was opened" : `the page says ${w2.said}; the device keeps ${w2.kept === null ? "nothing" : w2.kept}`);""",
    """check("W2  on a first visit the switch rests off, and the record is the served overlay's", w2.said === "off" && w2.kept === null && w2.fit === true,
  w2.said === null ? "no page was opened" : `the page says ${w2.said}; the device keeps ${w2.kept === null ? "nothing" : w2.kept}; the record ${w2.fit === true ? "is" : "is NOT"} of the served overlay's version`);""")
one("""        if (shown.length !== n) w3.faults.push""", """        // a word sense's words on a blue pill of Jastrow's records alone, while held back (its twin)
        const twinAtRest = rest.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS) && x.by && x.by.split(" ").every((mid) => OWN.has(mid)) && shown.some((y) => y.t.slice(WORD_SENSE_PRINTS.length) === x.t));
        if (twinAtRest.length) w3.faults.push(`${where}: at rest «${twinAtRest[0].t}» prints as a definition on ${twinAtRest[0].by}, while its word sense is held back`);
        if (shown.length !== n) w3.faults.push""")
one("""            nb = q; nbRest = rest0; nbRuled = await lineAt(p, q);
            break;""", """            nb = q; nbRest = rest0; nbRuled = await lineAt(p, q);
            // and a word sense pressed over it, where the block offers one: the switch off gives the reading back
            nbSense = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
            if (nbSense) { await p.waitForTimeout(800); nbSensed = await lineAt(p, q); }
            break;""")
one("""          let nb = null, nbRest = null, other = null, nbRuled = null;""", """          let nb = null, nbRest = null, other = null, nbRuled = null, nbSense = null, nbSensed = null;""")
one("""          else if (nbAfter !== nbRuled) faults.push""", """          else if (nbSense && !String(nbSensed || "").startsWith(WORD_SENSE_PRINTS)) faults.push(`pressed «${nbSense}» over «${other}» at ${nb.label}:${nb.n}, its line read «${nbSensed}»`);
          else if (nbAfter !== nbRuled) faults.push""")
one("""          w5.said = faults.length ? faults.join(" · ") : `${where}: pressed «${took}», the line read it; switched off, the line reads «${after}» again · ${nb.label}:${nb.n} pressed «${other}», and it stands`;""",
    """          w5.said = faults.length ? faults.join(" · ") : `${where}: pressed «${took}», the line read it; switched off, the line reads «${after}» again · ${nb.label}:${nb.n} pressed «${other}»${nbSense ? `, then «${nbSense}» over it` : ""}, and «${nbAfter}» stands`;""")
one("""// ---- W6: the legend, on its own cards ----""", """// ---- W7: every served row that prints a listed word sense's words is in the record ----------------------------
const w7 = { senses: 0, rows: 0, outside: [] };
{
  const pin = JSON.parse(readFileSync(join(K3, "data", "word-senses", "jastrow-word-senses-v1", "PIN.json"), "utf8"));
  const listed = readFileSync(join(K3, "data", "word-senses", "jastrow-word-senses-v1", pin.word_senses.file), "utf8").split("\\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.branch === "WORD_SENSE");
  const shards = new Map();
  const rowsOf = (k) => {
    const sh = createHash("sha256").update(Buffer.from(k, "utf8")).digest("hex").slice(0, 2);
    if (!shards.has(sh)) { const f = join(K3, "data", "overlays", "jastrow", "shards", `${sh}.bin`); shards.set(sh, existsSync(f) ? JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) : {}); }
    return shards.get(sh)[k] || [];
  };
  for (const r of listed) {
    w7.senses += 1;
    for (const x of rowsOf(r.k)) {
      if (x[3] !== r.m || x[1] !== r.route) continue;
      w7.rows += 1;
      if (!(record.rows[r.k] || []).some(([rk, m]) => rk === x[0] && m === x[3])) w7.outside.push(`${r.k} rank ${x[0]} ${x[3]} «${x[1]}»`);
    }
  }
}

// ---- W6: the legend, on its own cards ----""")
one("""check("W6  the owner's legend""", """check("W7  every served Jastrow row that prints a listed word sense's words under its key and source id is in the record", w7.senses > 0 && !w7.outside.length,
  w7.outside.length ? `${w7.outside.length} row(s) outside it, standing at rest as definitions · ${first(w7.outside)}` : `${w7.rows} served row(s) print the words of the ${w7.senses} listed word senses, every one in the record (${record.counts.twins} as a twin)`);
check("W6  the owner's legend""")
open(p, "w", encoding="utf-8").write(s); print("check-word-senses-v1: the review's findings held")
# (then, by hand on the same tree: W5 asks that the line under the word beside it holds the word sense pressed over its
# reading anywhere among its pieces, «in + word sense, not definition: innermost + his», not that it begins with it)
