// THE DOOR FINDS A BOOK (the owner, 2026-10-18: "for books also by exact
// hebrew or english answers"; "the splash page one would more be like
// ezekiel"). The door's box finds a book by the name its row prints, in
// English or in Hebrew, and a Hebrew name by its letters, typed with its
// points or without.
//   F1  every book the door links is found by its English name typed whole:
//       its row is the one row the box still shows
//   F2  and by its Hebrew name as its row prints it, alone too, though one
//       book's Hebrew name may stand inside another's
//   F3  and by that name pointed and accented: the points are not its letters
//   F4  a book's number is typed every way hands type it ("1 kings",
//       "i kings", "I-Kings") and lands on that row alone
//   F7  a part of a name finds every book it is part of
//   F8  a book is found by what its name means, the reading its row prints
//       under the Hebrew name ("or 'beginning' could bring up genesis"):
//       the reading whole, or a word of it four letters or longer
//   F9  a family's own name shows the family whole, every row in it
//   F10 a Hebrew name typed with a medial letter where it ends in a final
//       finds its book, as the reader's own search does
//   F11 a part of a name is never found across the join of two names (a
//       row's English name and its Hebrew are apart)
//   F12 on the census, a family's key finds every row that carries it
//   F5  a name no book carries hides every row, and an emptied box brings
//       every row back
//   F6  Enter opens the first book the box shows
// The books and their names are read off the door's own rows, never named
// here (check-scope-derived S1).
// Usage: node tools/check-door-find-v1.mjs [origin]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  \u00b7  " + d : ""}`); };
const ORIGIN = (/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "http://127.0.0.1:8912").replace(/\/$/u, "");
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${ORIGIN}/`, { waitUntil: "networkidle" });
// the door's books: each linked row, its English name and its Hebrew name
const books = await p.evaluate(() => [...document.querySelectorAll(".atlas-row")].filter((x) => x.querySelector("a.aw")).map((x) => ({
  href: x.querySelector("a.aw").getAttribute("href"), en: x.querySelector("a.aw").textContent.trim(), he: ((x.querySelector(".he:not(.none)") || {}).textContent || "").trim(),
  meant: ((x.querySelector(".fam-he .g") || {}).textContent || "").trim(),
})));
const ask = async (q) => {
  await p.fill("#q", q);
  await p.dispatchEvent("#q", "input");
  return p.evaluate(() => {
    const rows = [...document.querySelectorAll(".atlas-row")].filter((x) => x.querySelector("a.aw"));
    const shown = rows.filter((x) => !x.hidden && x.offsetParent !== null).map((x) => x.querySelector("a.aw").getAttribute("href"));
    return { shown, hiddenFlags: rows.filter((x) => x.hidden).length };
  });
};
const firstIs = async (q, href) => { const r = await ask(q); return { ok: r.shown.length === 1 && r.shown[0] === href, got: r.shown.slice(0, 3).join(" ") || "none" }; };
const sweep = async (make) => {
  const miss = [];
  for (const bk of books) { const q = make(bk); if (!q) continue; const r = await firstIs(q, bk.href); if (!r.ok) miss.push(`${JSON.stringify(q)} -> ${r.got} (want ${bk.href})`); }
  return miss;
};

const m1 = await sweep((bk) => bk.en);
check(`F1  every book the door links (${books.length}) is found by its English name typed whole, its row alone`, books.length > 0 && !m1.length, m1.slice(0, 3).join("; ") || `${books.length} of ${books.length}`);
const withHe = books.filter((bk) => bk.he);
const m2 = await sweep((bk) => bk.he);
check(`F2  every book is found by its Hebrew name as its row prints it, alone (${withHe.length})`, withHe.length > 0 && !m2.length, m2.slice(0, 3).join("; ") || `${withHe.length} of ${withHe.length}`);
// a point under every letter, an accent and a meteg on the last: what a
// name copied from a pointed text carries
const [ALEF, TAV, SHEVA, ETNAHTA, METEG] = [0x5d0, 0x5ea, 0x5b0, 0x591, 0x5bd].map((n) => String.fromCodePoint(n));
const pointed = (s) => [...s].map((c) => (c >= ALEF && c <= TAV ? `${c}${SHEVA}` : c)).join("") + ETNAHTA + METEG;
const m3 = await sweep((bk) => (bk.he ? pointed(bk.he) : null));
check("F3  and by that name pointed and accented", withHe.length > 0 && !m3.length, m3.slice(0, 3).join("; ") || `${withHe.length} of ${withHe.length}`);
// every numbered book, its number written each way
const numbered = books.filter((bk) => /^(I{1,3}) /u.test(bk.en));
const m4 = [];
for (const bk of numbered) {
  const [, roman, rest] = /^(I{1,3}) (.*)$/u.exec(bk.en);
  const n = roman.length;
  for (const q of [`${n} ${rest.toLowerCase()}`, `${roman.toLowerCase()} ${rest.toLowerCase()}`, `${roman}-${rest}`]) { const r = await firstIs(q, bk.href); if (!r.ok) m4.push(`${JSON.stringify(q)} -> ${r.got} (want ${bk.href})`); }
}
check(`F4  a book's number lands every way it is typed (${numbered.length} numbered books, 3 ways each)`, numbered.length > 0 && !m4.length, m4.slice(0, 3).join("; ") || `${numbered.length * 3} of ${numbered.length * 3}`);
const shown0 = (await ask("")).shown.length;
const none = await ask("qqxzv vkq");
await ask(books[0].en);
const back = await ask("");
check("F5  a name no book carries hides every row, and an emptied box brings every row back, open as the door opened",
  none.shown.length === 0 && none.hiddenFlags === books.length && back.hiddenFlags === 0 && back.shown.length === shown0 && shown0 > 0,
  `${none.shown.length} shown, ${none.hiddenFlags} hidden for nonsense \u00b7 once emptied ${back.shown.length} shown of ${shown0} at rest`);
// F7: the first few letters of every English name, and every Hebrew name
// that stands inside another book's, find each book that holds them
const m7 = [];
for (const bk of books) {
  const part = bk.en.replace(/^I{1,3} /u, "").slice(0, 3);
  const holders = books.filter((x) => x.en.toLowerCase().includes(part.toLowerCase())).map((x) => x.href);
  const r = await ask(part);
  if (!holders.every((h) => r.shown.includes(h))) m7.push(`${JSON.stringify(part)} shows ${r.shown.length}, misses ${holders.filter((h) => !r.shown.includes(h)).join(" ")}`);
}
const inside = withHe.filter((bk) => withHe.some((x) => x !== bk && x.he.includes(bk.he)));
check(`F7  a part of a name finds every book it is part of (${books.length} beginnings; ${inside.length} Hebrew names stand inside another's)`, !m7.length, m7.slice(0, 3).join("; ") || "every holder shown");
// F8: what each name means, as its row prints it, and the last word of it
const m8 = [];
const meaning = books.filter((bk) => bk.meant);
for (const bk of meaning) {
  const word = bk.meant.split(/[\s/+,;:()[\]]+/u).filter((w) => w.replace(/[^a-z0-9]/giu, "").length >= 4).sort((a, b) => b.length - a.length)[0];
  for (const q of [bk.meant, word].filter(Boolean)) { const r = await ask(q); if (!r.shown.includes(bk.href)) m8.push(`${JSON.stringify(q)} -> ${r.shown.slice(0, 3).join(" ") || "none"} (want ${bk.href})`); }
}
const gen = books.find((bk) => /\bbeginning\b/u.test(bk.meant));
const the = await ask("the");
check(`F8  a book is found by what its name means, as its row prints it (${meaning.length} books, the reading whole and its longest word)${gen ? `; "beginning" finds ${gen.en}` : ""}; a short word of a meaning finds nothing by it`,
  meaning.length > 0 && !m8.length && the.shown.every((h) => books.find((x) => x.href === h && /the/iu.test(x.en + x.he))),
  `${m8.slice(0, 3).join("; ") || "every meaning finds its book"} \u00b7 "the" shows ${the.shown.length}`);
// F9: a family's own name
const fams = await p.evaluate(() => [...document.querySelectorAll("section.family")].map((fs) => ({ name: ((fs.querySelector("details.fam > summary .en") || {}).textContent || "").trim(), rows: fs.querySelectorAll(".atlas-row").length })).filter((f) => f.name && f.rows));
const m9 = [];
for (const f of fams) {
  const r = await p.evaluate(async (name) => { const q = document.getElementById("q"); q.value = name; q.dispatchEvent(new Event("input")); await new Promise((res) => setTimeout(res, 120)); const fs = [...document.querySelectorAll("section.family")].find((x) => ((x.querySelector("details.fam > summary .en") || {}).textContent || "").trim() === name); return { hidden: fs.hidden, open: (fs.querySelector("details.fam") || {}).open, shown: [...fs.querySelectorAll(".atlas-row")].filter((x) => !x.hidden).length, all: fs.querySelectorAll(".atlas-row").length }; }, f.name);
  if (r.hidden || !r.open || r.shown !== r.all) m9.push(`"${f.name}": ${r.shown} of ${r.all} rows${r.hidden ? ", the family hidden" : ""}`);
}
check(`F9  a family's own name shows the family whole (${fams.length} families with rows)`, fams.length > 0 && !m9.length, m9.slice(0, 3).join("; ") || "each whole");
// F10: a medial letter typed where the name ends in a final
const FINALS = new Map([[0x5da, 0x5db], [0x5dd, 0x5de], [0x5df, 0x5e0], [0x5e3, 0x5e4], [0x5e5, 0x5e6]]);
const endsFinal = withHe.filter((bk) => FINALS.has(bk.he.codePointAt(bk.he.length - 1)));
const m10 = await sweep((bk) => (endsFinal.includes(bk) ? bk.he.slice(0, -1) + String.fromCodePoint(FINALS.get(bk.he.codePointAt(bk.he.length - 1))) : null));
check(`F10 a Hebrew name typed with a medial letter where it ends in a final finds its book (${endsFinal.length} names)`, endsFinal.length > 0 && !m10.length, m10.slice(0, 3).join("; ") || `${endsFinal.length} of ${endsFinal.length}`);
// F11: a part found only inside one name, never across the join of two
const m11 = [];
for (const bk of books) {
  const tail = bk.en.toLowerCase().replace(/[^a-z]/gu, "").slice(-2), head = bk.en.toLowerCase().replace(/[^a-z]/gu, "").slice(0, 2);
  const q = tail + head;
  const holders = books.filter((x) => [x.en, x.href].some((n) => n.toLowerCase().replace(/[^a-z0-9]/gu, "").includes(q))).map((x) => x.href);
  const r = await ask(q);
  if (r.shown.includes(bk.href) && !holders.includes(bk.href)) m11.push(`"${q}" shows ${bk.href}`);
}
check("F11 a part of a name is never found across the join of two names", !m11.length, m11.slice(0, 3).join("; ") || `${books.length} joins tried`);
const target = books[Math.floor(books.length / 2)];
await p.fill("#q", target.en); await p.dispatchEvent("#q", "input");
await Promise.all([p.waitForNavigation({ timeout: 15000 }).catch(() => null), p.press("#q", "Enter")]);
const landed = new URL(p.url()).pathname.replace(/\/$/u, "");
check("F6  Enter opens the first book the box shows", landed === target.href.replace(/\/$/u, ""), `${JSON.stringify(target.en)} -> ${landed}`);
// F12: the census, a family's key
{
  const pc = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
  pc.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  const ok = await pc.goto(`${ORIGIN}/census/`, { waitUntil: "networkidle" }).then((r) => r && r.ok()).catch(() => false);
  if (!ok || !(await pc.$("#q"))) check("F12 on the census, a family's key finds every row that carries it", true, "no census page here");
  else {
    const fam = await pc.evaluate(() => { const c = new Map(); for (const r of document.querySelectorAll(".atlas-row[data-p]")) { const k = r.getAttribute("data-p").split(/[:/]/u)[0]; c.set(k, (c.get(k) || 0) + 1); } return [...c].sort((a, b) => b[1] - a[1])[0] || null; });
    const r = fam && await pc.evaluate(async (k) => { const q = document.getElementById("q"); q.value = k; q.dispatchEvent(new Event("input")); await new Promise((res) => setTimeout(res, 300)); const rows = [...document.querySelectorAll(".atlas-row")]; const holders = rows.filter((x) => (x.getAttribute("data-p") || "").toLowerCase().includes(k.toLowerCase())); return { holders: holders.length, shown: holders.filter((x) => !x.hidden).length }; }, fam[0]);
    check("F12 on the census, a family's key finds every row that carries it", !!r && r.holders > 0 && r.shown === r.holders, fam ? `"${fam[0]}": ${r.shown} of ${r.holders} rows carrying it shown` : "no family key");
  }
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
