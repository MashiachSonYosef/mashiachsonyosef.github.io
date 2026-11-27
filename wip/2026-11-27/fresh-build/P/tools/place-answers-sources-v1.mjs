// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. The readers of the fresh build's three inputs: our zones
// (the text and its addresses), STEP's word-by-word files (TAHOT) and
// MACULA's table. They read and decide nothing; each hands a source over in
// the source's own order and under the source's own address, every cell a
// string exactly as the file holds it.
//
// WHY THIS IS A FILE. The fresh build (27 November 2026) derives what each
// source says at each word from the source's own file and from nothing the
// site serves. The builder, the check and the printer must read a source
// the same way, so the reading is written once, here.
//
// No Hebrew letter stands in this file: a letter is named by its code point.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";

/** The 39 books: our zone's name, STEP's book code, MACULA's book code. The
 *  order is STEP's and MACULA's own (the order of their files). */
export const BOOKS = [
  ["genesis", "Gen", "GEN"], ["exodus", "Exo", "EXO"], ["leviticus", "Lev", "LEV"], ["numbers", "Num", "NUM"], ["deuteronomy", "Deu", "DEU"],
  ["joshua", "Jos", "JOS"], ["judges", "Jdg", "JDG"], ["ruth", "Rut", "RUT"], ["i-samuel", "1Sa", "1SA"], ["ii-samuel", "2Sa", "2SA"],
  ["i-kings", "1Ki", "1KI"], ["ii-kings", "2Ki", "2KI"], ["i-chronicles", "1Ch", "1CH"], ["ii-chronicles", "2Ch", "2CH"], ["ezra", "Ezr", "EZR"],
  ["nehemiah", "Neh", "NEH"], ["esther", "Est", "EST"], ["job", "Job", "JOB"], ["psalms", "Psa", "PSA"], ["proverbs", "Pro", "PRO"],
  ["ecclesiastes", "Ecc", "ECC"], ["song-of-songs", "Sng", "SNG"], ["isaiah", "Isa", "ISA"], ["jeremiah", "Jer", "JER"], ["lamentations", "Lam", "LAM"],
  ["ezekiel", "Ezk", "EZK"], ["daniel", "Dan", "DAN"], ["hosea", "Hos", "HOS"], ["joel", "Jol", "JOL"], ["amos", "Amo", "AMO"],
  ["obadiah", "Oba", "OBA"], ["jonah", "Jon", "JON"], ["micah", "Mic", "MIC"], ["nahum", "Nam", "NAM"], ["habakkuk", "Hab", "HAB"],
  ["zephaniah", "Zep", "ZEP"], ["haggai", "Hag", "HAG"], ["zechariah", "Zec", "ZEC"], ["malachi", "Mal", "MAL"],
];

const ALEF = 0x5d0, TAV = 0x5ea;
/** The Hebrew letters of a string, in order, and nothing else: no point, no
 *  accent, no maqaf, no bracket. Two editions are compared on these. */
export const lettersOf = (s) => {
  let o = "";
  for (const ch of String(s || "")) { const c = ch.codePointAt(0); if (c >= ALEF && c <= TAV) o += ch; }
  return o;
};

/** The letters with the five end-of-word shapes read as their plain letters
 *  (final kaf, mem, nun, pe, tsadi). Two editions that cut a word at another
 *  place, or spell it a letter longer, write the same letter in another
 *  shape; the meeting compares letters, not shapes. */
const FINALS = new Map([[0x5da, 0x5db], [0x5dd, 0x5de], [0x5df, 0x5e0], [0x5e3, 0x5e4], [0x5e5, 0x5e6]]);
export const foldFinals = (letters) => {
  let o = "";
  for (const ch of letters) { const c = ch.codePointAt(0); o += FINALS.has(c) ? String.fromCodePoint(FINALS.get(c)) : ch; }
  return o;
};
/** The letters two editions are compared on. */
export const meetLetters = (s) => foldFinals(lettersOf(s));

export const sha256Of = (buf) => createHash("sha256").update(buf).digest("hex");

/** A file's text, read as UTF-8 and proven to be the file's bytes: a byte
 *  that is not UTF-8 would be replaced silently by the decoder, and a
 *  source's text would then not be the source's. */
export function readTextExact(path) {
  const buf = readFileSync(path);
  const text = buf.toString("utf8");
  if (Buffer.byteLength(text, "utf8") !== buf.length || !Buffer.from(text, "utf8").equals(buf)) throw new Error(`not UTF-8 byte for byte: ${path}`);
  return { text, bytes: buf.length, sha256: sha256Of(buf) };
}

// ---------------------------------------------------------------- our zones

/** A book's zone: its sections in order, each with its entries in order. An
 *  entry is a mark (not a word) or a word; a word written one way and read
 *  another carries its forms, each with its role. Only the text and its
 *  addresses are taken: the surface of each entry, its mark, its forms.
 *  Nothing the zone carries from a dictionary or from STEP is read. */
export function readZone(path) {
  const buf = readFileSync(path);
  const z = JSON.parse(gunzipSync(buf).toString("utf8"));
  const sections = [];
  for (const sec of z.sections || []) {
    const m = /^(\d+):(\d+)$/.exec(sec.label || "");
    if (!m) throw new Error(`a section label that is not chapter:verse: ${sec.label} in ${path}`);
    const entries = (sec.words || []).map((w) => {
      if (w.mark) return { mark: w.mark.kind || true, s: w.s };
      if (Array.isArray(w.w)) {
        return { s: w.s, forms: w.w.map((f) => ({ s: f.s, role: f.role === "QERE" ? "read" : f.role === "KETIV" ? "written" : String(f.role) })), order: (w.kq && w.kq.order) || null, trivial: !!w.kq_trivial };
      }
      return { s: w.s, forms: null, trivial: !!w.kq_trivial };
    });
    sections.push({ label: sec.label, ch: Number(m[1]), vs: Number(m[2]), entries });
  }
  return { work: z.work, sections, bytes: buf.length, sha256: sha256Of(buf) };
}

// ------------------------------------------------------------ STEP's TAHOT

/** STEP's twelve named columns, in the file's order (the heading row of each
 *  file: «Eng (Heb) Ref & Type», «Hebrew», …). The file carries five more
 *  tab stops after them, empty on every row. */
export const STEP_COLUMNS = ["ref", "hebrew", "transliteration", "translation", "dstrongs", "grammar", "meaning_variants", "spelling_variants", "root_dstrong_instance", "alternative_strongs_instance", "conjoin_word", "expanded_strong_tags"];
const TAHOT_ORDER = ["TAHOT_Gen-Deu", "TAHOT_Jos-Est", "TAHOT_Job-Sng", "TAHOT_Isa-Mal"];
const STEP_REF = /^([1-3]?[A-Z][a-z]{1,2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(.+)$/;

/** Every word row of STEP's four files, in the files' order. A row is a line
 *  whose first cell is a reference «Book.chapter.verse(Hebrew chapter.verse)
 *  #word=type»; every other line (headings, the interlinear lines that begin
 *  «#») is not a row. `cells` are the twelve named columns exactly as the
 *  line holds them. */
export function readTahot(dir) {
  const names = readdirSync(dir).filter((n) => n.startsWith("TAHOT_")).sort((a, b) => TAHOT_ORDER.findIndex((p) => a.startsWith(p)) - TAHOT_ORDER.findIndex((p) => b.startsWith(p)));
  if (names.length !== 4 || names.some((n) => !TAHOT_ORDER.some((p) => n.startsWith(p)))) throw new Error(`expected STEP's four TAHOT files in ${dir}, found: ${names.join(", ")}`);
  const files = [], books = new Map(), odd = [];
  let extraCells = 0;
  names.forEach((name, fi) => {
    const { text, bytes, sha256 } = readTextExact(join(dir, name));
    files.push({ name, bytes, sha256 });
    const lines = text.split("\n");
    for (let li = 0; li < lines.length; li += 1) {
      const line = lines[li];
      if (!line || line.indexOf("\t") < 0) continue;
      const p = line.split("\t");
      const m = STEP_REF.exec(p[0]);
      if (!m) { if (/^[1-3]?[A-Z][a-z]{1,2}\.\d+\.\d+/.test(p[0])) odd.push(`${name}:${li + 1}:${p[0]}`); continue; }
      const cells = []; for (let c = 0; c < 12; c += 1) cells.push(p[c] === undefined ? "" : p[c]);
      for (let c = 12; c < p.length; c += 1) if (p[c] !== "") extraCells += 1;
      const row = { file: fi, line: li + 1, cells, code: m[1], ch: Number(m[2]), vs: Number(m[3]), hch: m[4] === undefined ? Number(m[2]) : Number(m[4]), hvs: m[5] === undefined ? Number(m[3]) : Number(m[5]), otherNumber: m[4] !== undefined, word: m[6], type: m[7] };
      if (!books.has(row.code)) books.set(row.code, []);
      books.get(row.code).push(row);
    }
  });
  return { files, books, odd, extraCells };
}

const MAQAF = "\u05be", PE = "\u05e4", SAMEKH = "\u05e1";

/** A cell cut at STEP's own marks: «/» opens a part, «\» opens a mark that
 *  hangs on the part before it (a maqaf, a verse end, a bar, a paragraph
 *  letter). Each token keeps the mark that opened it; joined again they are
 *  the cell, byte for byte. */
export function stepTokens(cell) {
  const out = []; let cur = "", sep = "";
  for (const ch of cell) {
    if (ch === "/" || ch === "\\") { out.push({ sep, text: cur }); sep = ch; cur = ""; } else cur += ch;
  }
  out.push({ sep, text: cur });
  return out;
}
export const joinTokens = (toks) => toks.map((t) => t.sep + t.text).join("");

/** STEP's own seams inside one row: a row that holds two words marks where
 *  the second begins by an empty part («//»: no space is written), a space
 *  («/ /») or a maqaf («/ maqaf /»). In the Hebrew cell. */
const hebSeam = (t) => t.sep === "/" && (t.text === "" || t.text === " " || t.text === MAQAF);
export const seamName = (text) => (text === "" ? "//" : text === " " ? "/ /" : text === MAQAF ? "/\u05be/" : `/${text}/`);

/** The Hebrew cell (a row's, or a variant's) as STEP cuts it: the words the
 *  cell holds (one, or more where STEP marks a seam), each word's parts, and
 *  the marks that hang on it. `letters` is a part's or a word's letters; a
 *  paragraph letter (a lone pe or samekh after «\») is a mark and no letter
 *  of the word. One row writes a maqaf inside a word with «\» and goes on
 *  (Genesis 14:17, «Kedor\-laomer»; STEP's heading: «counted as one word
 *  despite the maqaf»): the letters after it belong to the part before it.
 *  Token indexes are kept so that the other cells can be read beside. */
export function hebrewShape(cell) {
  const toks = stepTokens(cell);
  const words = []; const seams = [];
  let cur = null;
  const open = () => { cur = { parts: [], marks: [], letters: "" }; words.push(cur); };
  for (let i = 0; i < toks.length; i += 1) {
    const t = toks[i];
    if (t.sep === "\\") {
      const L = lettersOf(t.text);
      if (L && t.text.startsWith(MAQAF) && cur && cur.parts.length) {
        const last = cur.parts[cur.parts.length - 1];
        last.text += "\\" + t.text; last.letters += L; last.inner = i; cur.letters += L;
      } else {
        if (!cur) open();
        cur.marks.push({ i, text: t.text });
      }
      continue;
    }
    if (hebSeam(t) && cur && cur.parts.length) { seams.push({ i, text: t.text }); cur = null; continue; }
    if (!cur) open();
    const L = lettersOf(t.text);
    cur.parts.push({ i, text: t.text, letters: L }); cur.letters += L;
  }
  let p = 0;
  for (const w of words) { w.from = p; p += w.parts.length; w.to = p; }
  return { toks, words, seams, parts: p };
}

/** A reading of STEP's (a row's four cells, or a variant's four fields) with
 *  the pieces of the four standing beside one another: every word of the
 *  reading, each part with its Hebrew, its English exactly as STEP writes it
 *  (spaces, brackets and signs kept), its tag, whether it is the root, and
 *  its grammar; the marks that hang on the word (a maqaf, a verse end) with
 *  their tags; the seams between words. `regular` is false where the four do
 *  not cut into the same number of pieces, or where only the Hebrew is given
 *  (`hebrewOnly`: a written form STEP records by its spelling alone): then
 *  only the Hebrew cut stands. */
export function stepReading(heb, eng, tags, gram) {
  const H = hebrewShape(heb);
  const tgT = stepTokens(tags || "");
  const enT = (eng || "").split("/");
  const lang = gram ? gram[0] : "";
  const grT = gram ? gram.slice(1).split("/") : [];
  const slashN = H.toks.filter((t) => t.sep !== "\\").length;
  const sameSeps = H.toks.length === tgT.length && H.toks.every((t, i) => t.sep === tgT[i].sep);
  // a variant that gives a form's Hebrew and nothing else («;K= …») has no English, tag or grammar to stand beside it
  const hebrewOnly = eng === undefined || eng === null;
  const regular = !hebrewOnly && heb !== "" && sameSeps && slashN === enT.length && (!gram || slashN === grT.length);
  const nOf = new Map(); let n = 0; H.toks.forEach((t, i) => { if (t.sep !== "\\") { nOf.set(i, n); n += 1; } });
  const words = H.words.map((w) => ({
    from: w.from, to: w.to, letters: w.letters,
    parts: w.parts.map((p) => {
      const o = { he: p.text, letters: p.letters };
      if (regular) {
        const k = nOf.get(p.i);
        o.en = enT[k]; o.tagRaw = tgT[p.i].text; Object.assign(o, readTag(tgT[p.i].text)); o.gram = gram ? grT[k] : "";
        if (p.inner !== undefined) o.innerMarkTag = tgT[p.inner].text;
      }
      return o;
    }),
    marks: w.marks.map((m) => ({ he: m.text, tag: regular ? tgT[m.i].text : undefined })),
  }));
  const seams = H.seams.map((sm) => {
    const o = { he: sm.text, mark: seamName(sm.text) };
    if (regular) { const k = nOf.get(sm.i); o.en = enT[k]; o.tag = tgT[sm.i].text; o.gram = gram ? grT[k] : ""; }
    return o;
  });
  return { regular, hebrewOnly, lang, words, seams, parts: H.parts };
}

/** One of STEP's variants: «K= translit (Hebrew) "English" (tags=grammar)»
 *  in the meaning column, or «L= Hebrew» / «;K= Hebrew» in the spelling
 *  column. Items stand between « ¦ ». Each item is handed over whole (`raw`)
 *  and, where it has the shape, read into its fields. */
const VAR_FULL = /^\s*([A-Za-z+]+)=\s?(.*?) \((.*)\) "(.*)" \((.*)\)\s*$/;
const VAR_HEB = /^\s*;?([A-Za-z+]+)=\s?(.*?)\s*$/;
export function stepVariants(meaning, spelling) {
  const items = [];
  const cut = (cell, col) => {
    if (!cell || !cell.trim()) return;
    for (const raw of cell.split(" ¦ ")) {
      if (!raw.trim() || raw.trim() === ";") { items.push({ col, raw, kind: "empty" }); continue; }
      const f = VAR_FULL.exec(raw);
      if (f) {
        const tg = f[5]; const eq = tg.lastIndexOf("=");
        items.push({ col, raw, kind: "full", who: f[1], translit: f[2], hebrew: f[3], english: f[4], tags: eq < 0 ? tg : tg.slice(0, eq), grammar: eq < 0 ? "" : tg.slice(eq + 1) });
        continue;
      }
      const h = VAR_HEB.exec(raw);
      if (h) { items.push({ col, raw, kind: "hebrew", who: h[1], hebrew: h[2] }); continue; }
      items.push({ col, raw, kind: "unread" });
    }
  };
  cut(meaning, "meaning"); cut(spelling, "spelling");
  return items;
}

/** A row's parts as STEP gives them: the Hebrew and the tags cut at «/» and
 *  «\», the English and the grammar at «/». Where the four cells cut into
 *  the same number of pieces the pieces stand beside one another (`regular`);
 *  where they do not, each cell's pieces are given on their own and no piece
 *  of one cell is said to belong to a piece of another. The root is the
 *  part whose tag STEP wraps in curly brackets. */
export function stepRowShape(cells) {
  const heb = cells[1], eng = cells[3], tags = cells[4], gram = cells[5];
  const H = hebrewShape(heb);
  const heT = H.toks, tgT = stepTokens(tags);
  const enT = eng.split("/");
  const lang = gram ? gram[0] : "";
  const grT = gram ? gram.slice(1).split("/") : [];
  const slashIdx = []; heT.forEach((t, i) => { if (t.sep !== "\\") slashIdx.push(i); });
  const tgSlash = []; tgT.forEach((t, i) => { if (t.sep !== "\\") tgSlash.push(i); });
  const sameSeps = heT.length === tgT.length && heT.every((t, i) => t.sep === tgT[i].sep);
  const regular = heb !== "" && sameSeps && slashIdx.length === enT.length && (gram === "" || slashIdx.length === grT.length);
  const partial = { hebTags: sameSeps, hebEng: slashIdx.length === enT.length, hebGram: gram !== "" && slashIdx.length === grT.length, tagsEng: tgSlash.length === enT.length, tagsGram: gram !== "" && tgSlash.length === grT.length };
  return { H, heT, tgT, enT, grT, lang, slashIdx, tgSlash, regular, partial };
}

/** A tag as STEP writes it on a part: curly brackets mark the root; a «+»
 *  after it says the same tag also covers the next Hebrew word. */
export function readTag(text) {
  let t = text; let coversNext = false, root = false;
  if (t.endsWith("+")) { coversNext = true; t = t.slice(0, -1); }
  if (t.startsWith("{") && t.endsWith("}")) { root = true; t = t.slice(1, -1); }
  return { tag: t, root, coversNext };
}

// ------------------------------------------------------- MACULA's table

/** MACULA's table: its heading row's column names, and every morph row in
 *  the file's order, grouped by the word it belongs to (the `ref` column:
 *  «GEN 1:1!1» is book, chapter:verse, word). `cells` are the row's cells
 *  exactly as the line holds them. */
export function readMacula(path) {
  const { text, bytes, sha256 } = readTextExact(path);
  const lines = text.split("\n");
  const columns = lines[0].split("\t");
  const iRef = columns.indexOf("ref"), iText = columns.indexOf("text");
  if (iRef < 0 || iText < 0 || columns[0] !== "xml:id") throw new Error(`not MACULA's table (no xml:id, ref, text columns): ${path}`);
  const books = new Map(); const odd = [];
  let rows = 0;
  for (let li = 1; li < lines.length; li += 1) {
    const line = lines[li]; if (!line) continue;
    const cells = line.split("\t");
    if (cells.length !== columns.length) { odd.push(`line ${li + 1}: ${cells.length} cells`); while (cells.length < columns.length) cells.push(""); }
    const m = /^([1-3]?[A-Z]{2,3}) (\d+):(\d+)!(\d+)$/.exec(cells[iRef]);
    if (!m) { odd.push(`line ${li + 1}: ref ${cells[iRef]}`); continue; }
    rows += 1;
    if (!books.has(m[1])) books.set(m[1], []);
    const list = books.get(m[1]);
    const last = list[list.length - 1];
    if (last && last.ref === cells[iRef]) { last.rows.push({ line: li + 1, cells }); last.letters += lettersOf(cells[iText]); }
    else list.push({ ref: cells[iRef], code: m[1], ch: Number(m[2]), vs: Number(m[3]), word: Number(m[4]), rows: [{ line: li + 1, cells }], letters: lettersOf(cells[iText]) });
  }
  return { file: { name: path.split("/").pop(), bytes, sha256 }, columns, books, rows, odd };
}

export const fileFacts = (path) => { const buf = readFileSync(path); return { bytes: statSync(path).size, sha256: sha256Of(buf) }; };
