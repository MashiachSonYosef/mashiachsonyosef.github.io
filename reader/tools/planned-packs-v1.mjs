// planned-packs-v1 · which commentary packs this lane holds, asked of the record
//
// A pack is a body of commentary fetched from outside the corpus. It carries
// no C0 identity, so it attaches by a map instead of by coordinate, and every
// claim that map makes is a suggestion.
//
// This exists because four tools each carried the answer as a default:
//
//   const PACK = arg("pack", "data/genesis-1-1-commentary-2026-07-17.js");
//
// which was a hand copy of a row in data/work-records-v1.js, and stayed a
// pointer at that pack after the pack was withdrawn. Run one of those tools
// without --pack and it would build a sidecar out of a proof of concept over
// one verse and attach it to whichever zone you named. Nothing would have
// said so: the filename is not a claim anybody reads twice.
//
// So the answer is asked of the record, and when the record names no pack the
// tools refuse instead of reaching for a name.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "data");

const parse = (raw) => {
  const at = raw.indexOf("{");
  if (at < 0) return null;
  try { return JSON.parse(raw.slice(at).replace(/\)\s*;?\s*$/u, "").replace(/;\s*$/u, "")); }
  catch { return null; }
};

/** Every commentary pack the record names, in the record's order. */
export function plannedPacks() {
  for (const f of readdirSync(DATA).filter((x) => x.endsWith(".js"))) {
    const j = parse(readFileSync(join(DATA, f), "utf8"));
    if (j && j.schema_version === "WORK_RECORDS_V1") return j.commentary_packs || [];
  }
  return [];
}

/**
 * The one pack, when there is exactly one. Callers pass whatever the operator
 * typed; a named pack always wins. With none named and none in the record the
 * caller gets null and is expected to say so rather than pick.
 */
export function thePack(named = null) {
  if (named) return { pack: named, carried_map: null, work_id: null, named_by: "the command line" };
  const packs = plannedPacks();
  if (packs.length === 1) return { ...packs[0], named_by: "data/work-records-v1.js" };
  return null;
}

/** The sentence a tool prints when it will not guess. */
export function refusal(what) {
  const packs = plannedPacks();
  if (!packs.length)
    return `NO_PACK_NAMED — ${what} needs --pack, and data/work-records-v1.js names no commentary pack. ` +
      `This tool will not fall back to a filename: the last default here pointed at a withdrawn proof of concept.`;
  return `MORE_THAN_ONE_PACK — ${what} needs --pack: the record names ${packs.length} ` +
    `(${packs.map((p) => p.pack).join(", ")}).`;
}
