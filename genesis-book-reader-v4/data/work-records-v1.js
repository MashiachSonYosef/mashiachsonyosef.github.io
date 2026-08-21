// Work records · typed, with the basis of every fact declared · 2026-08-21
//
// What this file is. The build derives each work's parameters from its Y
// ledger — that is the rule, and tools/plan-build-v1.mjs is where it happens.
// This file holds the two things a ledger does not settle:
//
//   1. `descriptors` — plain-English lines for usability: a byline, the
//      coordinate labels, a display family name. These are the one kind of
//      hand typing this project allows, and keeping them here, per work,
//      keeps them out of the build script.
//
//   2. `typed_awaiting_ledger` — the full parameters of a work that is
//      PUBLISHED but has NO Y ledger yet. Two works are in that state. Their
//      c0 ranges, work ids and English titles used to be typed into build.sh,
//      which hid what they were: copies of a record this lane does not yet
//      hold. Here they are typed in the open, under a basis that says exactly
//      that — and the day a work's ledger lands, its entry here must be
//      DELETED. plan-build-v1 refuses to run while a work has both, so the
//      two sources of one fact can never quietly drift apart.
//
//   `attachments` records the coordinate-attached commentary pair the same
//   way, until the works' own ledgers carry attachment_y_node_id — the Y
//   schema already has the field. Coordinate identity is symmetric, so one
//   pair builds both directions. `commentary_packs` names the one pack that
//   arrived from outside the corpus with no C0 identity; its attachment map
//   is a suggestion and says so on every claim it makes.
//
// No corpus text lives here. The two ledger-less works have no recorded
// Hebrew title, and that absence is the truth of the record — the masthead
// says none is recorded, which is correct until a ledger arrives, and
// nothing here may fill it sooner.
window.WORK_RECORDS_V1 = Object.freeze({
  "schema_version": "WORK_RECORDS_V1",
  "recorded_on": "2026-08-21",
  "rule": "work-record-rule-v1-a-ledger-wins-and-a-typed-entry-dies-the-day-one-lands",
  "descriptors": {
    "tanakh/genesis": {
      "byline": "Miqra according to the Masorah · served from the sealed terminal artifacts",
      "coord_labels": "chapter,verse",
      "family_en": "Genesis",
      "license_links": "data/license-links-tanakh.json"
    },
    "tanakh/i-kings": {
      "byline": "Nevi'im · Miqra according to the Masorah · served from the sealed terminal artifacts",
      "coord_labels": "chapter,verse",
      "family_en": "I Kings",
      "license_links": "data/license-links-tanakh.json"
    },
    "targum/targum-jonathan-on-i-kings": {
      "byline": "Aramaic · served from the sealed terminal artifacts, attached to I Kings by the coordinates both works carry",
      "coord_labels": "chapter,verse",
      "family_en": "Targum Jonathan"
    }
  },
  "typed_awaiting_ledger": {
    "tanakh/i-kings": {
      "basis": "TYPED_AWAITING_LEDGER",
      "title_en": "I Kings",
      "c0_first": 69859535,
      "c0_last": 69870902,
      "unit_count": 817,
      "published_as": "1kings",
      "typed_because": "no Y ledger for this work is on this disk; these values were previously typed into build.sh and are the same values, moved into the open",
      "dies_when": "the work's Y ledger lands — delete this entry; plan-build-v1 refuses while both exist"
    },
    "targum/targum-jonathan-on-i-kings": {
      "basis": "TYPED_AWAITING_LEDGER",
      "title_en": "Targum Jonathan on I Kings",
      "c0_first": 70513734,
      "c0_last": 70527384,
      "unit_count": 817,
      "published_as": "targum-1kings",
      "typed_because": "no Y ledger for this work is on this disk; these values were previously typed into build.sh and are the same values, moved into the open",
      "dies_when": "the work's Y ledger lands — delete this entry; plan-build-v1 refuses while both exist"
    }
  },
  "attachments": [
    {
      "pair": ["tanakh/i-kings", "targum/targum-jonathan-on-i-kings"],
      "by": "SHARED_UNIT_COORDINATES",
      "basis": "TYPED_AWAITING_LEDGER"
    }
  ],
  "commentary_packs": [
    {
      "work_id": "tanakh/genesis",
      "pack": "data/genesis-1-1-commentary-2026-07-17.js",
      "carried_map": "data/v2-genesis-1-1-attachment-map-2026-07-22.js",
      "note": "fetched from outside the corpus with no C0 identity; the attachment map is a suggestion and says so on every claim"
    }
  ]
});
