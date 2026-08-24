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
  "descriptors_basis": {
    "these_are": "presentation strings typed in this file by the synthesis lane — the byline (including its canon-division words like Nevi'im and Ketuvim), the English family label, the coordinate vocabulary, and the licence-link pointer. None is corpus text and none traces to a record yet.",
    "dies_when": "a ledger carries the fact — a work's Y node retires its byline's structure claims and its coordinate vocabulary; a family-names record retires family_en; until then every one of these is a typed value standing in the open, same law as typed_awaiting_ledger"
  },
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
    },
    "tanakh/ruth": {
      "byline": "Ketuvim · Miqra according to the Masorah · served from the sealed terminal artifacts",
      "coord_labels": "chapter,verse",
      "family_en": "Ruth",
      "license_links": "data/license-links-tanakh.json"
    },
    "targum/aramaic-targum-to-ruth": {
      "byline": "Aramaic · served from the sealed terminal artifacts, attached to Ruth by the coordinates both works carry",
      "coord_labels": "chapter,verse",
      "family_en": "Aramaic Targum"
    }
  },
  "typed_awaiting_ledger": {
    "tanakh/i-kings": {
      "basis": "TYPED_AWAITING_LEDGER",
      "title_en": "I Kings",
      "c0_first": 69859535,
      "c0_last": 69870902,
      "unit_count": 817,
      "typed_because": "no Y ledger for this work is on this disk; these values were previously typed into build.sh and are the same values, moved into the open",
      "dies_when": "the work's Y ledger lands — delete this entry; plan-build-v1 refuses while both exist"
    },
    "targum/targum-jonathan-on-i-kings": {
      "basis": "TYPED_AWAITING_LEDGER",
      "title_en": "Targum Jonathan on I Kings",
      "c0_first": 70513734,
      "c0_last": 70527384,
      "unit_count": 817,
      "typed_because": "no Y ledger for this work is on this disk; these values were previously typed into build.sh and are the same values, moved into the open",
      "dies_when": "the work's Y ledger lands — delete this entry; plan-build-v1 refuses while both exist"
    },
    "tanakh/ruth": {
      "basis": "TYPED_AWAITING_LEDGER",
      "title_en": "Ruth",
      "c0_first": 70326655,
      "c0_last": 70327786,
      "unit_count": 85,
      "typed_because": "no Y ledger for this work is on this disk; these values are read off the bridge by tools/plan-work-shards-v1.mjs and stand here in the open",
      "dies_when": "the work's Y ledger lands — delete this entry; plan-build-v1 refuses while both exist"
    },
    "targum/aramaic-targum-to-ruth": {
      "basis": "TYPED_AWAITING_LEDGER",
      "title_en": "Aramaic Targum to Ruth",
      "c0_first": 70392152,
      "c0_last": 70394290,
      "unit_count": 85,
      "typed_because": "no Y ledger for this work is on this disk; these values are read off the bridge by tools/plan-work-shards-v1.mjs and stand here in the open",
      "dies_when": "the work's Y ledger lands — delete this entry; plan-build-v1 refuses while both exist"
    }
  },
  "attachments_basis": {
    "dies_when": "the commentary work's Y fixture lands carrying attachment_y_node_id — the ledger's own statement of what stands on what retires the typed pair, the same day, entry for entry"
  },
  "attachments": [
    {
      "pair": ["tanakh/i-kings", "targum/targum-jonathan-on-i-kings"],
      "by": "SHARED_UNIT_COORDINATES",
      "basis": "TYPED_AWAITING_LEDGER"
    },
    {
      "pair": ["tanakh/ruth", "targum/aramaic-targum-to-ruth"],
      "by": "SHARED_UNIT_COORDINATES",
      "basis": "TYPED_AWAITING_LEDGER"
    }
  ],
  "withheld_basis": {
    "these_are": "works this lane holds a record for and is not serving. A withholding is a decision made here, not a fact the corpus states, so it is typed in the open with the reason and the condition that ends it — the same law as typed_awaiting_ledger.",
    "why_it_is_written_down": "the front door used to work out which works were withheld by noticing that no zone answered for them. An absence is not a record. A zone deleted by accident printed the identical page to a work deliberately held, and build.sh — which had no idea any work was held — went on serving all five. The state is declared here now, and a served work with no zone is an error rather than a quiet hold.",
    "dies_when": "the work is served: delete its entry the same day its zone is published"
  },
  "withheld": {
    "tanakh/genesis": {
      "since": "2026-08-23",
      "reason": "Its transmission apparatus is not verified. The source-marked sites in this book are not yet carried as records, so the text cannot be shown without the reader quietly choosing for you between the forms its sources attest.",
      "ends_when": "the Q sites for this work are issued and the reader can present every attested form"
    },
    "tanakh/i-kings": {
      "since": "2026-08-23",
      "reason": "Its transmission apparatus is not verified. The source-marked sites in this book are not yet carried as records, so the text cannot be shown without the reader quietly choosing for you between the forms its sources attest.",
      "ends_when": "the Q sites for this work are issued and the reader can present every attested form"
    },
    "tanakh/ruth": {
      "since": "2026-08-23",
      "reason": "Its transmission apparatus is not verified. The source-marked sites in this book are not yet carried as records, so the text cannot be shown without the reader quietly choosing for you between the forms its sources attest.",
      "ends_when": "the Q sites for this work are issued and the reader can present every attested form"
    }
  },
  "commentary_packs_basis": {
    "what_a_pack_is": "a body of commentary fetched from outside the corpus, carrying no C0 identity, which therefore attaches by a map rather than by coordinate. Every claim such a map makes is a suggestion and says so.",
    "why_the_list_is_empty": "the one pack this lane ever held was a proof of concept over a single verse. It was withdrawn on 2026-08-24 along with its four generations of attachment map. The stages that serve packs remain, and refuse rather than guess when no pack is named."
  },
  "commentary_packs": []
});
