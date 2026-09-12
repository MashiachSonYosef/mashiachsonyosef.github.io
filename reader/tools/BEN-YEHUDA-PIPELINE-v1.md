# Hebrew on Hebrew · the Ben Yehuda pipeline · v1 (2026-09-12)

How a dictionary that defines Hebrew in Hebrew gets from the corpus lane's
delivery to a panel on the card a word opens. Nothing of the dictionary's is
here yet; every part below is built and pressed against a fixture made of
our own verses, so the day the delivery lands the road is already walked.

The frame line that governs it: **we serve fire, we define only from the
floor.** The citations are fire (ancient, red); his own prose is his and is
marked as his; the European glosses and the comparanda are neither and are
not served; a coinage is never served.

## The record

`data/ben-yehuda-posture-v1.json` — what is declared and nothing more:

| field | says |
|---|---|
| `served_volumes` | 1–7, by the owner's ruling of 2026-09-12, with the reasons the owner gave recorded as reasons, not as a legal finding |
| `not_declared.volumes` | 8–16 · an entry from one of these is emitted HELD, by volume, with no text |
| `floor` | volume 7 ends at the headword whose key is recorded there (under nun); a headword whose first letter is past nun, or under nun and after the floor, cannot be in a served volume |
| `strata` | quote (served, fire) · prose (served, his, channel not yet ruled) · foreign (counted, never emitted) · comparandum (counted, never emitted) |
| `asterisk` | an asterisked headword is a coinage or reconstruction; emitted HELD as `ASTERISK_PENDING_READ` until the corpus lane's asterisk read is delivered and ruled on |
| `delivery.delivered` | `false` · until it is `true`, a sidecar may stand only beside a fixture (`check-hoh-sidecar-v1` L8) |

## The parts

| step | who | where | what it produces |
|---|---|---|---|
| 1 read | corpus lane | `r2:mishkan/moses-ledgers/ben-yehuda-v1/` (proposed) | `entries-v1.jsonl[.gz]`, one entry per line, strata typed at delivery; the per-volume letter ranges; the asterisk read |
| 2 rule | owner | the posture record | `served_volumes`, `delivery.delivered`, the channel for his prose, what the asterisk read found |
| 3 build | this lane | `tools/build-hoh-sidecar-v1.mjs` | `data/zones/<slug>.hoh.bin` — the entries this zone's words can ask for, served or held by the record, strata as keyed words, gloss + gloss_m from the store, spans from the sealed template when supplied |
| 4 shelf | this lane | `emit-zone-store-v1`, `emit-zone-shipment-v1`, `emit-store-manifest-v1` | the sidecar pinned; unpinned, the reader refuses it |
| 5 card | this lane | `zone.html` · `renderHoh` | the panel under the record: headword, volume, posture chip, each stratum as a run of blocks (a quote in a gold box with its citation), the source line; informative silence where there is no entry |
| 6 guard | this lane | `check-hoh-sidecar-v1` (the file) · `check-hoh-in-card-v1` (the browser) | volume, asterisk, floor, strata, licence, counts, standing; and that the panel draws, its words open, held entries print no text |

Then the door rebuild (`build-front-door-v1`, which excludes `.hoh.bin` from
the book list as it excludes `.commentary.bin`), the sync, the deploy.

## The delivered row

```json
{ "headword": "<pointed headword as printed>", "headword_key": "<exact K of it>",
  "volume": 3, "asterisk": false,
  "strata": [ { "kind": "quote", "text": "<the citation as printed>", "ref": "<its reference>" },
              { "kind": "prose", "text": "<his own Hebrew>" },
              { "kind": "foreign", "text": "<gloss>", "lang": "de" },
              { "kind": "comparandum", "text": "<cognate>", "lang": "ar" } ] }
```

`headword_key` must equal the K rule's key of `headword`
(`tools/k-normalization-v1.mjs`), or the builder refuses the row: two
keyings of one headword is how a word answers under the wrong entry.

## The join

A word asks under its **headword** first — `h`, the look-up-by projection
(`tools/project-toggle-headword-v1.mjs`), which is what a dictionary is keyed
by — and under its **form** `k` second. The sidecar carries only entries one
of this zone's words can ask for; the rest are counted, not carried.

On the Bible this join has a headword to ask under at most positions (Genesis:
19,893 of 20,612). On the shelf beyond the 39 canonical books the headword
projection does not exist yet, so the join is by form only, and the panel's
silence says so.

## What the card says when it has nothing

The panel never disappears once a sidecar rides beside a book. Where the
word has no entry it says which of two things is true, because they are
different: the headword begins past the floor of the served volumes (so it
stands in a volume that is not served), or it is under the floor and simply
not in what was delivered. Where the entry is held it prints the headword and
the volume and the reason, and no text.

## The fixture

`tools/make-hoh-fixture-v1.mjs --from genesis` writes `fixture-hoh.bin` (the
first chapter, as it is) and `build/fixtures/hoh-fixture-entries-v1.jsonl`:
six of that chapter's own headwords, each with one **quote** stratum that is a
verse of the chapter word for word, cited by its own label. No prose is
written — his prose is not here to copy and this project invents no Hebrew.
The volumes are the instrument's and say so: four serve, one holds by
volume, one holds by asterisk, and one carries an empty foreign stratum so
the withholding can be seen to count. `?b=fixture-hoh` opens it; the door
never lists it.

## Rulings still owed (the owner, when the delivery lands)

1. his prose: red (his Hebrew is Hebrew) or blue (a modern layer over the floor)?
2. the asterisk read: what it found, and whether any asterisked entry may ever serve
3. the per-volume letter ranges, so the panel can name a volume rather than "one of 1–7"
4. whether comparanda in Aramaic — the other fire — may serve as quotes once typed by language
