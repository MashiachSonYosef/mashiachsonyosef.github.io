// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. Readers shared by the entries' builder, its check and its
// printers; it writes nothing (the writers stand in the builder, the one
// program that writes).
//
// place-answers-entries-lib-v1
//
// Shared parts of the fresh build's entries and bridges (builder E):
// reading a source file with its size and sha256, a small reader of marked-up
// text that loses nothing, the tables that turn a source's book names into
// ours, and STEP's tags. (The two writers of compact files stand in the
// builder: a module other tools import writes nothing.)
//
// Why one file: the builder and the check must agree on what "the same bytes"
// means, and the as-words script must read what the builder wrote. The check
// uses only the WRITING half of the markup code (tree back to bytes); the
// builder uses only the READING half (bytes to tree). A slip in either shows
// as a difference against the source file.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, inflateRawSync, crc32 } from "node:zlib";
import { resolve } from "node:path";

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** A source file as bytes, with what a pin needs. */
export function readSource(path) {
  const buf = readFileSync(path);
  return { path, buf, bytes: buf.length, sha256: sha256(buf) };
}

export const readGzJson = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

/** The sources map with every path made whole. A path written relative is
 *  read against the folder the map stands in, so that a folder of sources
 *  carries its own map (sources.json), can be moved, and takes a newer file
 *  of a source by dropping it in. A map that names no folder of zones reads
 *  the one given (the tree's own). Nothing else of the map is touched: the
 *  facts it states about each source go into the entries as written. */
export function sourcesResolved(cfg, base, zonesDefault) {
  const abs = (p) => (typeof p === "string" ? resolve(base, p) : p);
  const c = JSON.parse(JSON.stringify(cfg));
  if (c.step) c.step.dir = abs(c.step.dir);
  if (c.open_scriptures) c.open_scriptures.dir = abs(c.open_scriptures.dir);
  if (c.unabridged_bdb) { c.unabridged_bdb.zip = abs(c.unabridged_bdb.zip); if (c.unabridged_bdb.readme) c.unabridged_bdb.readme = abs(c.unabridged_bdb.readme); }
  if (c.wikisource) for (const p of c.wikisource.pages || []) p.path = abs(p.path);
  if (c.ubs) { c.ubs.json = abs(c.ubs.json); for (const x of c.ubs.also || []) x.path = abs(x.path); if (c.ubs.earlier_json) c.ubs.earlier_json = abs(c.ubs.earlier_json); }
  if (c.uhal) c.uhal.zip = abs(c.uhal.zip);
  if (c.macula) c.macula.tsv = abs(c.macula.tsv);
  c.zones_dir = c.zones_dir ? abs(c.zones_dir) : zonesDefault;
  return c;
}

/** One member of a zip archive, inflated. The unabridged BDB comes as a zip;
 *  this reads its central directory and inflates the member named, so the
 *  build needs no unzip program and never writes the 33 MB text to disk. */
export function zipMember(buf, wanted) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 65557; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("zip: no end record");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const names = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("zip: bad directory");
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nlen).toString("utf8");
    names.push(name);
    if (name === wanted) {
      const lnlen = buf.readUInt16LE(local + 26), lxlen = buf.readUInt16LE(local + 28);
      const data = buf.subarray(local + 30 + lnlen + lxlen, local + 30 + lnlen + lxlen + csize);
      const out = method === 0 ? Buffer.from(data) : inflateRawSync(data);
      if (out.length !== usize) throw new Error("zip: size differs for " + name);
      return out;
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error("zip: no member " + wanted + " among " + names.join(", "));
}

/** Every member of a zip archive, inflated, in the order of its central
 *  directory, and the archive's own comment (the end record's last field).
 *  unfoldingWord's lexicon comes as the repository zip its host packs, one
 *  file per entry, and the host writes the commit in that comment. Each
 *  member is held to the size and CRC-32 its directory entry states, so a
 *  slip in the archive stops the reading. A member that is a folder (its name
 *  ends with «/») is listed with no bytes. Nothing is written to disk. */
export function zipMembers(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 65557; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("zip: no end record");
  const count = buf.readUInt16LE(eocd + 10);
  const commentLength = buf.readUInt16LE(eocd + 20);
  const comment = buf.subarray(eocd + 22, eocd + 22 + commentLength).toString("utf8");
  let p = buf.readUInt32LE(eocd + 16);
  const members = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("zip: bad directory");
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nlen).toString("utf8");
    const lnlen = buf.readUInt16LE(local + 26), lxlen = buf.readUInt16LE(local + 28);
    const data = buf.subarray(local + 30 + lnlen + lxlen, local + 30 + lnlen + lxlen + csize);
    const out = method === 0 ? Buffer.from(data) : inflateRawSync(data);
    if (out.length !== usize) throw new Error("zip: size differs for " + name);
    if (crc32(out) !== crc) throw new Error("zip: CRC-32 differs for " + name);
    members.push({ name, bytes: out });
    p += 46 + nlen + xlen + clen;
  }
  return { comment, members };
}

// ---------------------------------------------------------------- markup

/** READ. Marked-up text (XML, or the unabridged BDB's HTML) into a tree that
 *  loses nothing. The text is taken as bytes (one character of the working
 *  string is one byte), so every offset is a byte offset in the source file,
 *  and tags are found without decoding anything.
 *
 *  A node is a string (text, as the file's bytes read as UTF-8, with the
 *  file's own character references left as written) or an element
 *  [name, attributes, children]:
 *    attributes: null, or an object in the file's order;
 *    children:   null for a tag closed in itself (<page p="1"/>), 0 for a tag
 *                the file never closes (<br>, <hr>), else an array.
 *  A tag whose bytes are not exactly what the writer below would make keeps
 *  them whole under the attribute name "<" (none in the files of 27 November
 *  2026; counted by the build).
 *
 *  latin: the file as a latin1 string; from, to: byte offsets of the part
 *  to read; opts.voids: names of tags the file never closes.
 *  Returns { nodes, odd } where odd counts what did not nest. */
export function readMarkup(latin, from, to, opts = {}) {
  const voids = opts.voids || new Set();
  const utf = (a, b) => Buffer.from(latin.slice(a, b), "latin1").toString("utf8");
  const root = [];
  const stack = [{ name: null, kids: root }];
  let odd = 0;
  let i = from;
  while (i < to) {
    const lt = latin.indexOf("<", i);
    if (lt < 0 || lt >= to) { stack[stack.length - 1].kids.push(utf(i, to)); break; }
    if (lt > i) stack[stack.length - 1].kids.push(utf(i, lt));
    if (latin.startsWith("<!--", lt)) {
      const end = latin.indexOf("-->", lt) + 3;
      stack[stack.length - 1].kids.push(["!", null, [utf(lt + 4, end - 3)]]);
      i = end; continue;
    }
    const gt = latin.indexOf(">", lt);
    if (gt < 0 || gt >= to) { stack[stack.length - 1].kids.push(utf(lt, to)); odd++; break; }
    const raw = latin.slice(lt, gt + 1);
    if (raw[1] === "/") {
      const name = raw.slice(2, -1);
      if (stack.length > 1 && stack[stack.length - 1].name === name) stack.pop();
      else { stack[stack.length - 1].kids.push(["/", { "<": utf(lt, gt + 1) }, null]); odd++; }
      i = gt + 1; continue;
    }
    const selfClosed = raw.endsWith("/>");
    const inner = raw.slice(1, selfClosed ? -2 : -1);
    const m = /^([A-Za-z][A-Za-z0-9:]*)/.exec(inner);
    if (!m) { stack[stack.length - 1].kids.push(utf(lt, gt + 1)); odd++; i = gt + 1; continue; }
    const name = m[1];
    let attrs = null;
    const re = / ([A-Za-z:][A-Za-z0-9:]*)="([^"]*)"/y;
    let pos = name.length;
    for (;;) {
      re.lastIndex = pos;
      const a = re.exec(inner);
      if (!a) break;
      (attrs ||= {})[a[1]] = Buffer.from(a[2], "latin1").toString("utf8");
      pos = re.lastIndex;
    }
    if (pos !== inner.length) attrs = { "<": utf(lt, gt + 1) }; // not regular: keep the tag's bytes
    if (selfClosed) stack[stack.length - 1].kids.push([name, attrs, null]);
    else if (voids.has(name)) stack[stack.length - 1].kids.push([name, attrs, 0]);
    else {
      const el = [name, attrs, []];
      stack[stack.length - 1].kids.push(el);
      stack.push({ name, kids: el[2] });
    }
    i = gt + 1;
  }
  odd += stack.length - 1; // tags left open at the end
  return { nodes: root, odd };
}

/** WRITE. The tree back to the file's bytes (as a UTF-8 string). The check
 *  holds every entry to its source with this and nothing else. */
export function writeMarkup(nodes) {
  let out = "";
  for (const n of nodes) {
    if (typeof n === "string") { out += n; continue; }
    const [name, attrs, kids] = n;
    if (name === "!") { out += "<!--" + kids[0] + "-->"; continue; }
    if (attrs && attrs["<"] !== undefined) {
      out += attrs["<"];
      if (name === "/" || kids === null || kids === 0) continue;
      out += writeMarkup(kids) + "</" + name + ">";
      continue;
    }
    out += "<" + name;
    if (attrs) for (const k of Object.keys(attrs)) out += " " + k + '="' + attrs[k] + '"';
    if (kids === null) { out += "/>"; continue; }
    out += ">";
    if (kids === 0) continue;
    out += writeMarkup(kids) + "</" + name + ">";
  }
  return out;
}

/** The text of a tree with the tags taken out (nothing else changed). */
export function textOf(nodes) {
  let out = "";
  for (const n of nodes) {
    if (typeof n === "string") out += n;
    else if (n[0] !== "!" && Array.isArray(n[2])) out += textOf(n[2]);
  }
  return out;
}

/** For printing only: the file's own character references resolved. The
 *  entries keep them as written (&amp; stays &amp;) so that every string is
 *  the file's bytes; a reader that prints runs a string through this. */
export function printable(s) {
  return s.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|amp|lt|gt|quot|apos|emsp|nbsp);/g, (all, r) => {
    if (r[0] === "#") return String.fromCodePoint(r[1] === "x" ? parseInt(r.slice(2), 16) : parseInt(r.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", emsp: String.fromCodePoint(0x2003), nbsp: String.fromCodePoint(0xa0) }[r];
  });
}

// ---------------------------------------------------------------- books

/** Our 39 books, by the slug the zones use, in the order of the Hebrew Bible
 *  as the tree's data/book-order-v1.json gives it is NOT assumed here: this
 *  list is only the key set. Each source's own names are mapped to these in
 *  the tables below, and every table is written into the bridge files. */
export const OUR_BOOKS = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges", "ruth",
  "i-samuel", "ii-samuel", "i-kings", "ii-kings", "i-chronicles", "ii-chronicles", "ezra", "nehemiah", "esther",
  "job", "psalms", "proverbs", "ecclesiastes", "song-of-songs", "isaiah", "jeremiah", "lamentations", "ezekiel", "daniel",
  "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",
];

/** Book number 1 to 39 in the order of the English Bible (Genesis 1 …
 *  Malachi 39). The unabridged BDB's <ref b="…"> and the UBS dictionary's
 *  references (BBB) both count books this way; each says so in its own file. */
export const BY_ENGLISH_NUMBER = [null,
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges", "ruth",
  "i-samuel", "ii-samuel", "i-kings", "ii-kings", "i-chronicles", "ii-chronicles", "ezra", "nehemiah", "esther",
  "job", "psalms", "proverbs", "ecclesiastes", "song-of-songs", "isaiah", "jeremiah", "lamentations", "ezekiel", "daniel",
  "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",
];

/** The Open Scriptures BDB's book names (<ref r="Job.8.12">): OSIS names. */
export const BY_OSIS = {
  Gen: "genesis", Exod: "exodus", Lev: "leviticus", Num: "numbers", Deut: "deuteronomy", Josh: "joshua", Judg: "judges", Ruth: "ruth",
  "1Sam": "i-samuel", "2Sam": "ii-samuel", "1Kgs": "i-kings", "2Kgs": "ii-kings", "1Chr": "i-chronicles", "2Chr": "ii-chronicles",
  Ezra: "ezra", Neh: "nehemiah", Esth: "esther", Job: "job", Ps: "psalms", Prov: "proverbs", Eccl: "ecclesiastes", Song: "song-of-songs",
  Isa: "isaiah", Jer: "jeremiah", Lam: "lamentations", Ezek: "ezekiel", Dan: "daniel", Hos: "hosea", Joel: "joel", Amos: "amos",
  Obad: "obadiah", Jonah: "jonah", Mic: "micah", Nah: "nahum", Hab: "habakkuk", Zeph: "zephaniah", Hag: "haggai", Zech: "zechariah", Mal: "malachi",
};

/** STEP's book names (Gen.1.1#01=L). */
export const BY_STEP = {
  Gen: "genesis", Exo: "exodus", Lev: "leviticus", Num: "numbers", Deu: "deuteronomy", Jos: "joshua", Jdg: "judges", Rut: "ruth",
  "1Sa": "i-samuel", "2Sa": "ii-samuel", "1Ki": "i-kings", "2Ki": "ii-kings", "1Ch": "i-chronicles", "2Ch": "ii-chronicles",
  Ezr: "ezra", Neh: "nehemiah", Est: "esther", Job: "job", Psa: "psalms", Pro: "proverbs", Ecc: "ecclesiastes", Sng: "song-of-songs",
  Isa: "isaiah", Jer: "jeremiah", Lam: "lamentations", Ezk: "ezekiel", Dan: "daniel", Hos: "hosea", Jol: "joel", Amo: "amos",
  Oba: "obadiah", Jon: "jonah", Mic: "micah", Nam: "nahum", Hab: "habakkuk", Zep: "zephaniah", Hag: "haggai", Zec: "zechariah", Mal: "malachi",
};

/** UHAL's book names (rc://he/uhb/book/exo/6/24). */
export const BY_UHB = {
  gen: "genesis", exo: "exodus", lev: "leviticus", num: "numbers", deu: "deuteronomy", jos: "joshua", jdg: "judges", rut: "ruth",
  "1sa": "i-samuel", "2sa": "ii-samuel", "1ki": "i-kings", "2ki": "ii-kings", "1ch": "i-chronicles", "2ch": "ii-chronicles",
  ezr: "ezra", neh: "nehemiah", est: "esther", job: "job", psa: "psalms", pro: "proverbs", ecc: "ecclesiastes", sng: "song-of-songs",
  isa: "isaiah", jer: "jeremiah", lam: "lamentations", ezk: "ezekiel", dan: "daniel", hos: "hosea", jol: "joel", amo: "amos",
  oba: "obadiah", jon: "jonah", mic: "micah", nam: "nahum", hab: "habakkuk", zep: "zephaniah", hag: "haggai", zec: "zechariah", mal: "malachi",
};

/** The Hebrew Wikisource edition's book names ([[<book> <chapter>, <verse>]]),
 *  written as code points because a tool carries no Hebrew letters. */
const H = (...cps) => String.fromCodePoint(...cps);
export const BY_HEBREW_NAME = new Map([
  [H(0x5d1, 0x5e8, 0x5d0, 0x5e9, 0x5d9, 0x5ea), "genesis"],
  [H(0x5e9, 0x5de, 0x5d5, 0x5ea), "exodus"],
  [H(0x5d5, 0x5d9, 0x5e7, 0x5e8, 0x5d0), "leviticus"],
  [H(0x5d1, 0x5de, 0x5d3, 0x5d1, 0x5e8), "numbers"],
  [H(0x5d3, 0x5d1, 0x5e8, 0x5d9, 0x5dd), "deuteronomy"],
  [H(0x5d9, 0x5d4, 0x5d5, 0x5e9, 0x5e2), "joshua"],
  [H(0x5e9, 0x5d5, 0x5e4, 0x5d8, 0x5d9, 0x5dd), "judges"],
  [H(0x5e8, 0x5d5, 0x5ea), "ruth"],
  [H(0x5e9, 0x5de, 0x5d5, 0x5d0, 0x5dc, 0x20, 0x5d0), "i-samuel"],
  [H(0x5e9, 0x5de, 0x5d5, 0x5d0, 0x5dc, 0x20, 0x5d1), "ii-samuel"],
  [H(0x5de, 0x5dc, 0x5db, 0x5d9, 0x5dd, 0x20, 0x5d0), "i-kings"],
  [H(0x5de, 0x5dc, 0x5db, 0x5d9, 0x5dd, 0x20, 0x5d1), "ii-kings"],
  [H(0x5d3, 0x5d1, 0x5e8, 0x5d9, 0x20, 0x5d4, 0x5d9, 0x5de, 0x5d9, 0x5dd, 0x20, 0x5d0), "i-chronicles"],
  [H(0x5d3, 0x5d1, 0x5e8, 0x5d9, 0x20, 0x5d4, 0x5d9, 0x5de, 0x5d9, 0x5dd, 0x20, 0x5d1), "ii-chronicles"],
  [H(0x5e2, 0x5d6, 0x5e8, 0x5d0), "ezra"],
  [H(0x5e0, 0x5d7, 0x5de, 0x5d9, 0x5d4), "nehemiah"],
  [H(0x5d0, 0x5e1, 0x5ea, 0x5e8), "esther"],
  [H(0x5d0, 0x5d9, 0x5d5, 0x5d1), "job"],
  [H(0x5ea, 0x5d4, 0x5d9, 0x5dc, 0x5d9, 0x5dd), "psalms"],
  [H(0x5de, 0x5e9, 0x5dc, 0x5d9), "proverbs"],
  [H(0x5e7, 0x5d4, 0x5dc, 0x5ea), "ecclesiastes"],
  [H(0x5e9, 0x5d9, 0x5e8, 0x20, 0x5d4, 0x5e9, 0x5d9, 0x5e8, 0x5d9, 0x5dd), "song-of-songs"],
  [H(0x5d9, 0x5e9, 0x5e2, 0x5d9, 0x5d4, 0x5d5), "isaiah"],
  [H(0x5d9, 0x5e8, 0x5de, 0x5d9, 0x5d4, 0x5d5), "jeremiah"],
  [H(0x5d0, 0x5d9, 0x5db, 0x5d4), "lamentations"],
  [H(0x5d9, 0x5d7, 0x5d6, 0x5e7, 0x5d0, 0x5dc), "ezekiel"],
  [H(0x5d3, 0x5e0, 0x5d9, 0x5d0, 0x5dc), "daniel"],
  [H(0x5d4, 0x5d5, 0x5e9, 0x5e2), "hosea"],
  [H(0x5d9, 0x5d5, 0x5d0, 0x5dc), "joel"],
  [H(0x5e2, 0x5de, 0x5d5, 0x5e1), "amos"],
  [H(0x5e2, 0x5d5, 0x5d1, 0x5d3, 0x5d9, 0x5d4), "obadiah"],
  [H(0x5d9, 0x5d5, 0x5e0, 0x5d4), "jonah"],
  [H(0x5de, 0x5d9, 0x5db, 0x5d4), "micah"],
  [H(0x5e0, 0x5d7, 0x5d5, 0x5dd), "nahum"],
  [H(0x5d7, 0x5d1, 0x5e7, 0x5d5, 0x5e7), "habakkuk"],
  [H(0x5e6, 0x5e4, 0x5e0, 0x5d9, 0x5d4), "zephaniah"],
  [H(0x5d7, 0x5d2, 0x5d9), "haggai"],
  [H(0x5d6, 0x5db, 0x5e8, 0x5d9, 0x5d4), "zechariah"],
  [H(0x5de, 0x5dc, 0x5d0, 0x5db, 0x5d9), "malachi"],
]);

/** A Hebrew numeral (letters as numbers, as the Wikisource edition writes a
 *  chapter and a verse) to a number; null if a character is no letter. */
export function hebrewNumber(s) {
  const val = { 0x5d0: 1, 0x5d1: 2, 0x5d2: 3, 0x5d3: 4, 0x5d4: 5, 0x5d5: 6, 0x5d6: 7, 0x5d7: 8, 0x5d8: 9, 0x5d9: 10, 0x5db: 20, 0x5da: 20,
    0x5dc: 30, 0x5de: 40, 0x5dd: 40, 0x5e0: 50, 0x5df: 50, 0x5e1: 60, 0x5e2: 70, 0x5e4: 80, 0x5e3: 80, 0x5e6: 90, 0x5e5: 90,
    0x5e7: 100, 0x5e8: 200, 0x5e9: 300, 0x5ea: 400 };
  let n = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp === 0x22 || cp === 0x27 || cp === 0x5f3 || cp === 0x5f4) continue; // the numeral's own marks
    if (!(cp in val)) return null;
    n += val[cp];
  }
  return n || null;
}

/** Only the Hebrew letters of a string (points, accents and marks dropped).
 *  Used to COUNT how often two files' headwords agree where a bridge is by
 *  number; it never decides a bridge. */
export function lettersOnly(s) {
  let out = "";
  for (const ch of s.normalize("NFD")) { const cp = ch.codePointAt(0); if (cp >= 0x5d0 && cp <= 0x5ea) out += ch; }
  return out;
}

// ---------------------------------------------------------------- STEP

export const TAHOT_PREFIXES = ["TAHOT_Gen-Deu", "TAHOT_Jos-Est", "TAHOT_Job-Sng", "TAHOT_Isa-Mal"];
const TAHOT_REF = /^([1-3]?[A-Za-z]{2,3})\.(\d+)\.(\d+)(?:\(([^)]*)\))?#(\d+)(?:\.(\d+))?=(.*)$/;

/** Every word row of one TAHOT file: its reference, and the tags of its
 *  dStrongs column part by part. STEP divides a word by "/" (prefixes and
 *  suffixes) and "\" (punctuation), puts the root in curly brackets, and
 *  writes "+" where a tag also covers the next word. */
export function* tahotRows(buf) {
  const text = buf.toString("utf8");
  let lineNo = 0;
  for (const line0 of text.split("\n")) {
    lineNo++;
    if (!line0 || line0[0] === "#" || !line0.includes("\t")) continue;
    const cols = line0.replace(/\r$/, "").split("\t");
    const m = TAHOT_REF.exec(cols[0]);
    if (!m) continue;
    const parts = [];
    for (const piece of (cols[4] || "").split(/[/\\]/)) {
      const t = piece.trim();
      if (!t) continue;
      const root = t.startsWith("{");
      const tag = t.replace(/[{}+]/g, "");
      parts.push({ tag, root, covers_next: t.includes("+"), raw: t });
    }
    yield { line: lineNo, ref: cols[0], book: m[1], chapter: +m[2], verse: +m[3], word: +m[5], type: m[7], cols, parts };
  }
}

/** A STEP tag read apart: "H1254A" is number 1254 with letter "A". */
export function tagParts(tag) {
  const m = /^H(\d{4})([A-Za-z]?)$/.exec(tag);
  return m ? { number: +m[1], digits: m[1], letter: m[2] } : null;
}

export { existsSync };
