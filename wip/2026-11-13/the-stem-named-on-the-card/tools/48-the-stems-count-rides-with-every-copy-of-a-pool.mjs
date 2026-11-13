// What a pool says was withheld rides with every copy of it. The card keeps a filtered copy of a pool in two
// places: the whole form of a word its place divides (the readings of the word in its parts are filed under the
// division), and the written half of a pair. Each copied the counts by name, and the stem's count was not among
// the names, so on the whole form of a divided verb the card stopped saying what the stem withheld (a reader of the
// page's code, 10 November 2026, finding 7; proven 13 November at Amos 4:2, word 10: "14 records withheld by the
// pointing ... No record is left to read here", with 7 more rows withheld by the stem and unsaid). One function
// carries them all now, the stems named with them.
// The gate's check gets a law for it: a divided word whose whole form the stem filters is found in the data, its
// whole-form division is pressed, and the card must say the stem's count there.
// node 48-the-stems-count-rides-with-every-copy-of-a-pool.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`    pool.withheld = withheld; pool.withheldBySources = withheldBySources; pool.withheldByStem = withheldByStem; pool.stems = stemsHere; pool.rows = asked;
    return pool;
  };
`,
   `    pool.withheld = withheld; pool.withheldBySources = withheldBySources; pool.withheldByStem = withheldByStem; pool.stems = stemsHere; pool.rows = asked;
    return pool;
  };
  // WHAT A POOL SAYS WAS WITHHELD RIDES WITH EVERY COPY OF IT. The card keeps
  // a filtered copy of a pool in two places (the whole form of a word its
  // place divides; the written half of a pair), and each copied the counts by
  // name. The stem's count was not among the names, so on the whole form of a
  // divided verb the card stopped saying what the stem withheld (a reader of
  // this code, 10 November 2026; fixed 13 November). Every count a pool
  // carries is named here once, and a copy takes them all.
  const carryWithheld = (to, from) => {
    to.withheld = from.withheld; to.withheldBySources = from.withheldBySources; to.withheldByStem = from.withheldByStem; to.stems = from.stems; to.rows = from.rows;
    return to;
  };
`],
  [`      out.withheld = pool.withheld; out.withheldBySources = pool.withheldBySources; out.rows = pool.rows;
`,
   `      carryWithheld(out, pool);
`],
  [`            const kept = got.filter((g) => !isDividedReading(g));
            kept.withheld = got.withheld; kept.withheldBySources = got.withheldBySources; kept.rows = got.rows;
            got = kept;
`,
   `            got = carryWithheld(got.filter((g) => !isDividedReading(g)), got);
`],
]);

edit(join(R, "tools", "check-pointing-gate-v1.mjs"), [
  [`//   G4  a word no record of the store points as the text does: under the
//       default its card withholds nothing for the pointing, and has readings
`,
   `//   G4  a word no record of the store points as the text does: under the
//       default its card withholds nothing for the pointing, and has readings
//   G5  a word its place divides, whose whole form carries records of another
//       stem: with its whole-form division pressed, the card says the stem's
//       count there too (the page keeps a filtered copy of the pool on that
//       division, and until 13 November 2026 the copy dropped this count)
`],
  [`let ledgered = 0, verb = null, unattested = null, any = null;`,
   `let ledgered = 0, verb = null, unattested = null, any = null, divided = null;`],
  [`  if (unattested && any && (verb || !hasLedger)) continue;
  const zone = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${z}.bin\`)).toString("utf8"));`,
   `  if (unattested && any && ((verb && divided) || !hasLedger)) continue;
  const zone = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${z}.bin\`)).toString("utf8"));`],
  [`        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: attested ? grades.filter((x) => x === "x").length : 0 };
      }
`,
   `        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: attested ? grades.filter((x) => x === "x").length : 0 };
      }
      // G5's word: one its place divides into pieces that spell it, whose whole form's records the stem filters
      if (hasLedger && !divided && g && Array.isArray(g.st) && g.st.length && side.stems[w.k] && Array.isArray(w.pg) && w.pg.length > 1 && w.pg.map((x) => (x && x.k) || "").join("") === w.k) {
        const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) divided = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other };
      }
`],
  [`    if (unattested && any && (verb || !hasLedger)) break;`,
   `    if (unattested && any && ((verb && divided) || !hasLedger)) break;`],
  [`const open = async (w, masorah) => {`,
   `const open = async (w, masorah, wholeForm = false) => {`],
  [`  const r = await p.evaluate(async ({ s, label }) => {`,
   `  const r = await p.evaluate(async ({ s, label, wholeForm }) => {`],
  [`    await new Promise((x) => setTimeout(x, 600));
    const pills = document.querySelector("#hud .r-pills");
    return {`,
   `    await new Promise((x) => setTimeout(x, 600));
    // the whole-form division of a word its place divides: the one button of the divisions' row that joins nothing
    if (wholeForm) {
      const whole = [...document.querySelectorAll("#hud > .rows > .b-cut .s-pills button")].find((x) => !x.textContent.includes("+"));
      if (!whole) return { error: "the card offers no whole-form division" };
      whole.click();
      const settled = () => { const read = document.querySelector("#hud > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
      const t1 = Date.now(); while (Date.now() - t1 < 15000 && !settled()) await new Promise((x) => setTimeout(x, 50));
      await new Promise((x) => setTimeout(x, 600));
    }
    const pills = document.querySelector("#hud .r-pills");
    return {
      none: (document.querySelector("#hud > .rows > .b-read > p.sources-withheld") || {}).textContent || "",`],
  [`  }, { s: w.s, label: w.label });`,
   `  }, { s: w.s, label: w.label, wholeForm });`],
  [`await b.close();
console.log(bad ? \`\\n\${bad} FAILED\` : "\\nall checks passed");`,
   `if (ledgered && !withdrawnIn.length) {
  if (!divided) check("G5  a divided word's whole form says what the stem withheld", false, "no served word its place divides has a record of another stem on its whole form");
  else {
    const d = await open(divided, null, true);
    // with pills left the count stands on the withheld line; with none left, in the sentence that says why
    const named = \`than \${divided.st.join(" or ")}\`;
    const onLine = d.stem === divided.other && d.line.includes(\`\${divided.other} of another stem \${named}, withheld\`);
    const inWords = d.pills === 0 && d.none.includes(\`\${divided.other} record\${divided.other === 1 ? "" : "s"} withheld by the stem\`) && d.none.includes(named);
    check("G5  a divided word's whole form says what the stem withheld, on its withheld line or in the sentence that says no record is left", !d.error && (onLine || inWords),
      d.error || \`\${divided.zone} \${divided.label} \${divided.k} (\${divided.st.join(", ")}) · the store's \${divided.other} · \${d.pills} readings · stem \${d.stem} · "\${d.line || d.none}"\`);
  }
}
await b.close();
console.log(bad ? \`\\n\${bad} FAILED\` : "\\nall checks passed");`],
]);
