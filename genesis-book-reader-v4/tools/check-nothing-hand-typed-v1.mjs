#!/usr/bin/env node
// hand-typing-rule-v1-plain-english-descriptors-and-nothing-else
//
// What may be typed into these files by hand is plain English that names a
// thing — "book title", "export", "right to left" — the way a search box is
// labelled "search". Everything else the page shows is corpus text and arrives
// from the chain: the zones, the route store, the commentary sidecars.
//
// The rule has been broken three times, each time by me, each time with a
// string that happened to be correct: a title copied into a link, a title
// copied onto the front door, a Hebrew letter used as an icon meaning
// "Hebrew". Correct is not the point. A copy is not a source, and on the page
// a copy is indistinguishable from something the chain carried — which makes
// it the one string with nothing behind it.
//
// Two rules, because two kinds of file:
//
//   Served files — the reader and the pages around it — carry no character of
//   any script the corpus is written in, anywhere, for any reason. Where the
//   page must draw one (the maqaf between two regions of a word) it takes it
//   off the word it just split, and names the codepoint rather than typing the
//   glyph.
//
//   Tools may reason about those scripts in their comments, because an
//   argument about the corpus is not a copy standing in for it. They may not
//   put a glyph in a string literal: a literal can become output, a comment
//   cannot. Character classes are written as codepoints.
//
// Reads the files off disk. Takes no URL.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// Hebrew, Hebrew presentation forms, Arabic, Syriac, Samaritan — every script
// the corpus is or may be written in. Latin and the punctuation English shares
// with it are ours to type.
const isCorpusScript = (cp) =>
  (cp >= 0x0590 && cp <= 0x05ff) || (cp >= 0x0600 && cp <= 0x06ff) ||
  (cp >= 0x0700 && cp <= 0x074f) || (cp >= 0x0800 && cp <= 0x083f) ||
  (cp >= 0xfb1d && cp <= 0xfb4f);

/**
 * Every glyph of a corpus script that sits inside a string literal.
 *
 * A real scanner rather than a regex, because a comment may contain quotes and
 * a string may contain slashes, and guessing either way makes the rule either
 * unenforceable or a nuisance.
 */
const glyphsInLiterals = (src, isJson) => {
  const out = [];
  let i = 0, line = 1;
  const push = (ch) => out.push({ ch, line });
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") { line += 1; i += 1; continue; }
    if (!isJson && c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (!isJson && c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line += 1; i += 1; }
      i += 2;
      continue;
    }
    if (!isJson && c === "#" && line === 1) {           // a shebang
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === '"' || c === "'" || (!isJson && c === "`")) {
      const quote = c; i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "\n") line += 1;
        const cp = src.codePointAt(i);
        if (isCorpusScript(cp)) push(String.fromCodePoint(cp));
        i += cp > 0xffff ? 2 : 1;
      }
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
};

// ---- served files: none at all ---------------------------------------
const SERVED = ["zone.html", "deploy-root/index.html", "deploy-root/genesis/index.html",
  "deploy-root/1kings/index.html"].filter((f) => existsSync(join(K3, f)));
check("there are served files to read", SERVED.length > 0, SERVED.join(" ") || "none found");
for (const f of SERVED) {
  const src = readFileSync(join(K3, f), "utf8");
  const hits = [];
  for (let i = 0; i < src.length; i += 1) {
    const cp = src.codePointAt(i);
    if (isCorpusScript(cp)) hits.push(`line ${src.slice(0, i).split("\n").length}`);
    if (hits.length > 5) break;
  }
  check(`  ${f} types no character of the text, anywhere`, hits.length === 0,
    hits.length ? `${hits.length}${hits.length > 5 ? "+" : ""} at ${hits.slice(0, 3).join(", ")}` : "clean");
}

// ---- tools: none in anything that can become output -------------------
const TOOLS = join(K3, "tools");
if (existsSync(TOOLS)) {
  const offenders = [];
  for (const f of readdirSync(TOOLS).filter((x) => /\.(mjs|js|json|sh)$/.test(x))) {
    const src = readFileSync(join(TOOLS, f), "utf8");
    const hits = glyphsInLiterals(src, f.endsWith(".json"));
    if (hits.length) offenders.push(`${f}: ${hits.length} (line ${hits[0].line})`);
  }
  check("  no tool puts a glyph of the text in a string literal",
    offenders.length === 0, offenders.join(" · ") || "clean");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
