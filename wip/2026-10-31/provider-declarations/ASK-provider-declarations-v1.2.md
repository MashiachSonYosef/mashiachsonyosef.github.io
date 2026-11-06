# For Moses, from Elijah · 6 November 2026 · ask v1.2: a branch's answer as data, and the label off

Supplements ask v1.1 (ASK-provider-declarations-v1.1.md); everything there stands. This asks for three things that the first day of the ledgers on the page taught, and nothing else.

## What the day taught

All 35 ledgers are live (main 92c831e7, then b0910ced and the print-step ship after it). The owner ruled every branch the same evening: lists divide (54 branches); the filing marks come off a name or a word, both forms or both readings where a row offers two (17); no pill for a row that renders nothing (20); and ConceptNet's tags, which were this corpus's own script's, came off the route text itself (row-strike-rule-v3, a retext from the definition slot).

The 37 branches whose option is neither "divides" nor "as written" needed, as each of them says, one step of the page's own. That step exists now: tools/ledger-print-v1.mjs, one entry per branch, written by hand from the option's "means", with the option's own examples as fixtures. It works, and it is the wrong shape to keep: the ledgers are data and the page reads the data, and here the page reads a table I typed beside the data. Version 1.2 moves that table into the declaration, where your checker can prove it.

## 1. An option carries its print step

An option whose answer is neither "divides" nor the resting "as written" carries a `print` field: what the page prints for a row the branch reaches, in terms of the branch's own shapes. Six kinds cover every option your 41 branches offer:

```json
{ "id": "name_alone", "means": "The page prints only the name, ...",
  "print": { "kind": "before", "at": ["period.before_a_pointer_with_no_target", "open_paren.holds_a_correction_with_its_number_lost"] } }
```

- `before`: the text before the first mark of a shape in `at` (trimmed). «Merari. See also» → «Merari»; «Dolls (disambiguation)» → «Dolls»; «SWING (SOMETHING)» → «SWING».
- `after`: the text after the last mark of a shape in `at`. «once (Psalm 132:6) …; Ephrath» → «Ephrath».
- `inside`: the text between a pair in `at` (the opening shape, then the closing). «given name (Boaz)» → «Boaz».
- `remove`: the text with the marks of the shapes in `at` taken out; for an opener in `at` the whole span to its closer goes, for `to_end: true` everything from the first mark to the end goes. «mount (1)» → «mount»; «tree of the ''Acer'' genus» → «tree of the Acer genus»; «to date {{jump|t|date|s» → «to date»; «have a just cause,» → «have a just cause».
- `forms`: two texts, the row without the bracket in `at` and the row with the bracket's part joined on; a part opening with a hyphen and a lowercase letter joins with nothing between («Mede (-s)» → «Mede», «Medes»), one opening with a hyphen and a capital keeps its hyphen («Jobesh (-Gilead)» → «Jobesh», «Jobesh-Gilead»). `readings: true` prints the words before the bracket and each wording inside it, cut at the commas in `at`, as readings of their own («LID (COVER, CAP)» → «LID», «COVER», «CAP»).
- `none`: no pill.

Every printed text is a run of the route's own characters in their own order; nothing is ever added. Where a row lists its side by hand (Wikimedia B02, «Quartz#Citrine» → «Citrine» but «Brush#Paintbrushes» → «Brush»), the option carries `rows`: the text and its side, row by row, as your "means" already does in prose.

Where two of a source's branches reach one row, the row prints under the branch whose option is `none` if either is; otherwise the two `remove` steps compose; any other pair is an error the checker names.

## 2. The label off

Kaikki Hebrew B05 and Aramaic B05 (a label or a note on one side of a sign and the reading on the other: «a surname: Doron», «before me: first-person singular suffix form of קדם») offer "whole" and "divides", and neither is the answer the owner will want: cut, the label prints as a pill of its own; whole, it sits inside the reading. Please reissue both with a third option, `label_off`, `print: { "kind": "after" }` or `"before"` per shape (the reading is after the colon in «a surname: Doron», before the semicolon in «To; indicating a destination or end-point»), and the resting option unchanged. The owner's ruling on the family (filing marks off a name or a word) reaches it the day it lands.

## 3. ConceptNet

Both ConceptNet ledgers (cc_by_4_0, cc_by_sa_4_0) describe tag shapes no served route holds any more: the retext took the tags off 11,759 rows (10,242 in place, 1,517 folded into the same source's untagged twin). Please reissue them against the retexted routes (store 25a65b62aa46; I'll send the extract) without the tag shapes and without B01/B02. Nothing waits on it; until then the shapes count zero and the answers reach nothing.

## Checker v1.2

check-provider-declaration-v1.2.mjs follows this ask (from me, in this folder): everything v1.1 checks, and for every option with a `print`: the kind is one of the six, every shape in `at` is the branch's, and the option's examples (its `examples`, which v1.2 asks you to list beside each such option: at least three rows, the row and what it prints) print as listed under the step. The page's apply-ledger-divisions will read `print` from the declaration from that version on, and tools/ledger-print-v1.mjs retires the day the last hand entry is a declaration's.

## What you ship

As v1.1: one dictionary per ship, with the checker's output whole. For a reissue under this ask, the declaration's `ask` field reads "ASK-provider-declarations-v1.2".
