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
//      PUBLISHED but has NO Y ledger yet. NO WORK IS IN THAT STATE, and none
//      may be: the owner ruled on 2026-08-30 that no hand-done book is
//      published at all, the four entries that stood here were deleted, and
//      typed_awaiting_ledger_emptied carries that ruling in his words. The
//      register stays empty so the law it carries stays legible.
//
//      What it was for, kept because it says why the ruling exists: these
//      works' c0 ranges, ids and English titles used to be typed into
//      build.sh, which hid what they were — copies of a record this lane does
//      not hold. Typed here in the open they at least said so. Not typed at
//      all is better, and that is now the rule. plan-build-v1 still refuses
//      to run while a work has both, so the two sources of one fact can never
//      quietly drift apart.
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
  "typed_awaiting_ledger": {},
  "typed_awaiting_ledger_emptied": "2026-08-30, the owner's ruling: no hand-done books at all. The four entries that stood here (both Kings, both Ruths) are deleted — every published book is built by the fleet from the bridge and the verified body, coordinates derived from the sealed ids, never typed. The register stays so the law it carries stays legible; it must remain empty.",
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
    "these_are": "works this lane is not serving, typed here because no hold ledger on this disk carries them yet. Basis TYPED_AWAITING_HOLD_LEDGER — the same law typed_awaiting_ledger stands under, and the same death: the day a hold ledger carries the row, this entry is deleted, and plan-build-v1 refuses while both exist.",
    "where_it_belongs": "a row in a hold ledger — any CSV in data/ carrying hold_id, base_work_id and status, found by shape and never by filename, exactly as the commentary holds already are. A work-level row is one whose status begins HOLD_WORK__ or whose current_effect is WORK_WITHHELD. tools/work-holds-v1.mjs reads them; plan-build-v1 prefers them over anything typed here.",
    "why_it_is_written_down_at_all": "the front door used to work out which works were held by noticing that no zone answered for them. An absence is not a record: a zone deleted by accident printed the identical page to a work deliberately held, and build.sh — which had no idea any work was held — would have re-served all five on one run.",
    "the_reason_below_is_ours": "each reason is a sentence this lane wrote, not a status a ledger issued. A ledger row's reason is its status string, verbatim. Until these are ledger rows, the reader is being told why a work is held by us and not by the record, and that is the whole of what is still owed here.",
    "dies_when": "a hold ledger carries the work — delete the entry the same day"
  },
  "withheld": {
    "tanakh/genesis": {
      "basis": "TYPED_AWAITING_HOLD_LEDGER",
      "since": "2026-08-23",
      "reason": "Its transmission apparatus is not verified. The source-marked sites in this book are not yet carried as records, so the text cannot be shown without the reader quietly choosing for you between the forms its sources attest.",
      "ends_when": "the Q sites for this work are issued and the reader can present every attested form"
    },
    "tanakh/i-kings": {
      "basis": "TYPED_AWAITING_HOLD_LEDGER",
      "since": "2026-08-23",
      "reason": "Its transmission apparatus is not verified. The source-marked sites in this book are not yet carried as records, so the text cannot be shown without the reader quietly choosing for you between the forms its sources attest.",
      "ends_when": "the Q sites for this work are issued and the reader can present every attested form"
    },
    "tanakh/ruth": {
      "basis": "TYPED_AWAITING_HOLD_LEDGER",
      "since": "2026-08-23",
      "reason": "Its transmission apparatus is not verified. The source-marked sites in this book are not yet carried as records, so the text cannot be shown without the reader quietly choosing for you between the forms its sources attest.",
      "ends_when": "the Q sites for this work are issued and the reader can present every attested form"
    },
    "tanakh/esther": {
      "basis": "TYPED_AWAITING_HOLD_LEDGER",
      "since": "2026-08-30",
      "reason": "Its stream reached the build gates carrying no transmission apparatus at all — zero ketiv/qere structure where the tradition attests it (measured 2026-08-30; Leviticus, Numbers and Ruth measured the same). A text with its apparatus silently flattened has already chosen between the forms its sources attest, which is exactly what this register exists to refuse.",
      "ends_when": "the work's stream is reissued with its ketiv/qere sites as structured records"
    },
    "tanakh/leviticus": {
      "basis": "TYPED_AWAITING_HOLD_LEDGER",
      "since": "2026-08-30",
      "reason": "Its stream reached the build gates carrying no transmission apparatus at all — zero ketiv/qere structure where the tradition attests it. A flattened apparatus is a choice already made; this register refuses it.",
      "ends_when": "the work's stream is reissued with its ketiv/qere sites as structured records"
    },
    "tanakh/numbers": {
      "basis": "TYPED_AWAITING_HOLD_LEDGER",
      "since": "2026-08-30",
      "reason": "Its stream reached the build gates carrying no transmission apparatus at all — zero ketiv/qere structure where the tradition attests it. A flattened apparatus is a choice already made; this register refuses it.",
      "ends_when": "the work's stream is reissued with its ketiv/qere sites as structured records"
    }
  },
  "commentary_packs_basis": {
    "what_a_pack_is": "a body of commentary fetched from outside the corpus, carrying no C0 identity, which therefore attaches by a map rather than by coordinate. Every claim such a map makes is a suggestion and says so.",
    "why_the_list_is_empty": "the one pack this lane ever held was a proof of concept over a single verse. It was withdrawn on 2026-08-24 along with its four generations of attachment map. The stages that serve packs remain, and refuse rather than guess when no pack is named."
  },
  "commentary_packs": []
});
