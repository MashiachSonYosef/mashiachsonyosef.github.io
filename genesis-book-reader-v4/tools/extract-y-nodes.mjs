#!/usr/bin/env node
// Synthesis lane · read a work's titles out of the Y ledger, verbatim
//
// A title is corpus text. The Y ledger is where a work's own title words live,
// each with its exact surface, the ledger's own normalized key, and the C0 it
// points at. This reads them; it does not compose them. Where the ledger has
// no node, the caller gets nothing and the page shows a locator instead — the
// one thing that must never happen is a title assembled here out of parts.
//
// Two properties are taken from the ledger rather than recomputed:
//   · the normalized key of a title token (`normalized_key`). The Y lane
//     already decided it — for the numeral א׳ the key is א — and a builder
//     that re-derived it would be substituting its own rule for the ledger's.
//   · the chapter number, read from `content_unit_prefix` (genesis-1-), which
//     is the same sealed unit id the zone's own coordinates come from.
//
// Usage:
//   node tools/extract-y-nodes.mjs --fixture data/y-genesis-navigation-v1.js \
//        --work tanakh/genesis --out build/y-genesis.json

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const fixturePath = arg("--fixture");
const workId = arg("--work");
const outPath = arg("--out");
if (!fixturePath || !workId || !outPath) throw new Error("--fixture, --work and --out are required");

const raw = readFileSync(fixturePath, "utf8");
const fixture = JSON.parse(raw.slice(raw.indexOf("{")).replace(/;\s*$/u, ""));
const sha256 = createHash("sha256").update(readFileSync(fixturePath)).digest("hex");
if (fixture.status !== "PASS") throw new Error(`Y fixture status is ${fixture.status} — refusing to take titles from it`);

const slug = workId.split("/").pop();
const tokensByNode = new Map();
for (const t of fixture.tokens || []) {
  if (!tokensByNode.has(t.y_node_id)) tokensByNode.set(t.y_node_id, []);
  tokensByNode.get(t.y_node_id).push(t);
}
// A title token gets a lexical key only when the ledger treats it as a word.
// The ledger is explicit about the ones that are not: a CHAPTER_NUMBER token
// carries `selected_gloss: ""` and a pointer_basis of
// REUSED_EXACT_NORMALIZED_W_C0_POINTER__NOT_A_NEW_C0_OCCURRENCE — it reuses
// the letter's identity to name a number, and it is not an occurrence of that
// letter in the text. Handing it to the catalog would print "the" under
// chapter א׳: the catalog answering correctly about a word nobody wrote.
const IS_NUMBER = /_NUMBER$/u;
const tokensOf = (id) =>
  (tokensByNode.get(id) || [])
    .sort((a, b) => a.token_order - b.token_order)
    .map((t) => {
      const tok = { s: t.label_surface, role: t.token_role, c0: t.contextual_c0_id, w: t.w_unique_id };
      if (!IS_NUMBER.test(t.token_role || "")) tok.k = t.normalized_key;
      return tok;
    });

const nodes = fixture.nodes || [];
const workNode = nodes.find((n) => n.node_kind === "WORK" && n.content_work_id === workId);
if (!workNode) throw new Error(`Y ledger carries no WORK node for ${workId}`);

const chapters = {};
let unresolved = 0;
for (const n of nodes) {
  if (n.node_kind !== "CHAPTER" || n.content_work_id !== workId) continue;
  const m = new RegExp(`^${slug}-(\\d+)-$`, "u").exec(n.content_unit_prefix || "");
  if (!m) throw new Error(`chapter node ${n.y_node_id} has unit prefix ${n.content_unit_prefix}, which does not read as ${slug}-<chapter>-`);
  unresolved += Number(n.label_unresolved_token_count || 0);
  chapters[Number(m[1])] = {
    y: n.y_node_id,
    name_he: n.label_hebrew,
    name_en: n.public_ref,
    name_tokens: tokensOf(n.y_node_id),
    label_basis: n.label_basis,
    sections_declared: Number(n.content_unit_count || 0),
    c0_first: n.content_first_c0_id,
    c0_last: n.content_last_c0_id,
  };
}
if (!Object.keys(chapters).length) throw new Error(`Y ledger carries no CHAPTER nodes for ${workId}`);
if (unresolved) throw new Error(`${unresolved} title tokens are unresolved in the Y ledger — refusing to print a partial title`);

const out = {
  schema_version: "Y_NODES_V1",
  fixture: fixturePath.split("/").pop(),
  fixture_id: fixture.fixture_id,
  fixture_sha256: sha256,
  fixture_generated_on: fixture.generated_on,
  work: workId,
  work_node: {
    y: workNode.y_node_id,
    name_he: workNode.label_hebrew,
    name_en: workNode.public_ref,
    name_tokens: tokensOf(workNode.y_node_id),
    label_basis: workNode.label_basis,
  },
  chapter_label_basis: Object.values(chapters)[0].label_basis,
  numeral_tokens_left_unglossed: Object.values(chapters).reduce(
    (n, c) => n + c.name_tokens.filter((t) => !t.k).length, 0,
  ),
  chapters,
};
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(
  `${outPath}: ${Object.keys(chapters).length} chapter titles from ${fixture.fixture_id} ` +
  `(${out.chapter_label_basis}) · work title "${out.work_node.name_he}" · fixture sha256 ${sha256.slice(0, 16)}…`,
);
