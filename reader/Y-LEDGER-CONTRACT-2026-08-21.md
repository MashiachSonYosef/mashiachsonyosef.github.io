# What the reader does with a Y ledger, the moment one lands

Written 2026-08-21, measured against the one real Y ledger in existence —
`y-genesis-navigation-v1.js` — so the lane making Y real for the other works
can see exactly what each field buys, which fields the build refuses without,
and which parts of the ledger the reader does not read yet.

The one requirement above all: `status` must be `PASS`. A ledger that is not
PASS is reported and not derived from, everywhere.

## Consumed the moment the ledger is put in data/ — zero code edits

**From the WORK node**, by `plan-build-v1` and the build it drives:

    content_work_id      the work's identity, and its address (last segment)
    public_ref           the English title
    label_hebrew         the Hebrew title, printed openable in the masthead
    content_first_c0_id  the serve range — these two numbers replace a typed
    content_last_c0_id     c0 range in what used to be build.sh
    content_unit_count   asserted against the sealed serve, not trusted
    order_path           the work's place on the front door
    label_basis          printed with the title, so the page can say whose it is

A work with a ledger must have no entry in `work-records-v1.js`'s
typed_awaiting_ledger — the plan refuses to run while both exist. Landing the
ledger and deleting the typed entry is one act.

**From the CHAPTER nodes**, by `extract-y-nodes` → the zone:

    label_hebrew + its tokens   the chapter's own name — each token carries the
                                ledger's normalized_key, so a title word opens
                                the same catalog as the text
    token_role *_NUMBER         honored: a numeral token gets no lexical key,
                                so the catalog is never asked about a word
                                nobody wrote
    label_unresolved_token_count  if any, the extractor refuses — no partial
                                titles are ever printed
    public_ref                  the chapter's English line
    content_unit_prefix/count   asserted against the sealed unit ids

Proof this works with no edits: Genesis's 50 chapters print the ledger's own
numerals today; I Kings' 22 print "Chapter n" from coordinates alone and will
take their names the moment its ledger lands.

## Carried by the real ledger and NOT read yet — the reader's debt, not the ledger's

`extract-y-nodes` now counts what it drops instead of dropping silently, and
the Genesis receipt reads: SECTION ×1,533 · COMMENTARY_WORK ×1 ·
COMMENTARY_SEGMENT ×1. In order of what wiring them buys:

**SECTION nodes** — one per sealed unit, already carrying `dom_anchor` equal to
the anchor the page generates for itself (genesis-1-1), a Hebrew numeral label
with its token, `collapsed_summary`, and `default_open_layers`. The page
currently regenerates all four. Because the anchors already agree, wiring this
is a read swap, not a migration.

**COMMENTARY_WORK nodes** — the answer to how a commentary gets its own three
masthead rows. Y-GEN-COMM-RASHI carries the Hebrew title with tokens, the
public_ref, the work id, and `attachment_y_node_id` + `attachment_grain`
naming what it stands on. Today the sidecar prints whatever the pack called
itself; this node is the record that should stand behind that line.

**COMMENTARY_SEGMENT nodes** — attachment at the grain the chain proved:
`SECTION_WITH_EXPLICIT_WORD_HEADWORD_PROOF`, with a `v_id` pointing into V.
One exists, as the worked example of the shape.

**Top level** — `view_presets` (hebrew / read / study) against which the
page's own three-layer state should be checked; `commentary_path`;
`color_contract`, which check-colour-roles already enforces.

## Two questions for the lane making Y and B real

The Genesis WORK node's `b_id` is `B2-BK-000958`; the same work's bridge
receipt says `B-000436 / N-000436`. Two schemes, one work, no reconciliation
record this lane can read. Which is current — and should the zone's
work_receipts carry the Y ledger's B id once ledgers are the source?

SECTION nodes and the W question are different facts: a SECTION node locates a
unit; the W list says which entries inside it are W (surface, normalized key,
compspanTemplateId — the shape `genesis-1-1-full-hud-2026-07-19.js` already
uses, proven for one section, owed for 3,983). If making Y real and making the
W lists real are one effort, the reader is ready for both; if not, the W list
is the one the component layer stands on.
