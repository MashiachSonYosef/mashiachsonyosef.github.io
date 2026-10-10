From Elijah (the serving lane), relayed by the owner, 10 October 2026 AD. About `moses-licence-ledger-v1`: the ledger v1.1.1 (FOR-ELIJAH-v67.1.1), the map v1.1.1 (FOR-ELIJAH-v67.2.2) and the pill text v1.2 (FOR-ELIJAH-v67.3.2). This replaces the shorter prompt of the same date: it adds the wrong pills in section 1 and the headword readings in section 3.

The owner's purpose for this ledger, in the owner's words: "the license ledger main purpose is to try to politely shove you into showing the license when i change the english showing", and for the blob, "same with blobs it should apply when changed too". So the test is this: every reading a reader can switch the English to must resolve to a line, and that line's pill must state that source's license. Section 1 fails the second half of that test; sections 2 and 3 fail the first. Each finding is read from your own files. Please mend each one, or say why not.

## 1. Three pills state a license the source does not give these readings

The pick in S8 v1.2 (the shortest own text that carries a version, else the shortest own text) takes any license name found in the statement bytes. Where those bytes hold more than one license, the shortest one wins, whatever it is.

- **PanLex, M21 and M42 (38,270 served rows): the pill reads "CC0 1.0".** Their licence_label says the materials "are shared under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License", and their short label is cc_by_nc_sa_4_0_conservative_current. The CC0 text comes from `FOOT/ledgers/work/ldmprs/source-cache/panlex-hebrew-english-2026-07-14/panlex-meanings-README.md` line 31, byte 62,920. The pill would tell a reader that a non-commercial, share-alike source is a public-domain dedication.
- **OmegaWiki, M32 (5,363 served rows): the pill reads "cc0-1.0".** Its licence_label says "OmegaWiki licences are CC-BY and GFDL.", and its short label is cc_by_chosen_from_dual_cc_by_and_gfdl. The CC0 text is a field at `FOOT/ledgers/work/ldmprs/source-cache/omegawiki-lexical-2026-07-14/dataset-README.md` line 2, byte 13.
- **Kaikki, M11, M13, M25, M34, M50, M60, M69, M72 and M177 (127,108 served rows): the pill reads "GFDL".** Their licence_label says the data is available "under the same licenses as Wiktionary - both CC-BY-SA and GFDL." The own texts are "CC-BY-SA" and "GFDL" apart, so the pick keeps the shorter one and drops CC-BY-SA. No own text names both, so I2 cannot give the dual license either.
- Asked: choose the pill from the text that states the license of these rows (the licence_label first, as the ledger already reads it), never from another document's license that happens to sit in the statement bytes; and where a source gives two licenses together, let the pill carry both in the source's own words (your tag table already holds "CC-BY-SA and GFDL", PROSE, for cc_by_sa_gfdl). Name every row whose pill changes.

## 2. A license stated as a Creative Commons deed title gets no pill (MUSE)

- `sources-v1.1.jsonl`: M6 and M62 (MUSE large-scale ground-truth Hebrew-English bilingual dictionary) are SERVED, evidence_class SOURCE_OWN_STATEMENT, branch NON_COMMERCIAL. Their licence_label is "Attribution-NonCommercial 4.0 International", declared at `FOOT/ledgers/work/ldmprs/source-cache/muse-hebrew-english-2026-07-14/LICENSE` line 1, byte 0.
- `pill-text-v1.2.json`: M6 and M62 have pill_rule NONE, pill_text null and no own_texts. That is 23,065 and 1,449 by-key readings, 24,514 served rows.
- The cause is OPEN PATTERN v1.2 (S6 v1.2). It takes only "CC", "Creative Commons", "GFDL", "GNU", "WordNet" or "public domain". A Creative Commons deed title begins with "Attribution", so the source's own statement is never seen. Your tag table already writes this same text for cc_by_nc_4_0, form TITLE, SOURCE_WRITES_IT.
- Today the page shows "CC BY-NC 4.0" on these readings, from the index's short label. Under I3 they would show no license at all. They are non-commercial readings, the ones a reader most needs to see marked.
- Asked: widen the open pattern to take a Creative Commons deed title with its version (Attribution, Attribution-ShareAlike, Attribution-NonCommercial, Attribution-NoDerivatives and their combinations, each followed by its version), or rule why a deed title is not an own text.

## 3. Readings the page shows that resolve to no pill row

- **The BSB.** `sources-v1.1.jsonl` has a BSB line (Berean Standard Bible translation tables): kind BSB, status NOT_IN_STORE, readings.places 280,884; its licence_label begins "The Berean Bible and Majority Bible texts are officially" and links the CC0 1.0 deed. Neither map index holds a BSB state, and `pill-text-v1.2.json` has no BSB row (331 rows against 362 ledger lines). The page serves the BSB as the source-suggested reading from your relay v63.1, a line on the word's card when the reader turns it on.
- **The Jastrow and Samaritan overlays.** The page serves two overlays that a reader switches on from the sources row. `reader/data/overlays/jastrow/index.json` names M12, M39, M49, M65, M75 and M106, each a Marcus Jastrow Dictionary source via Sefaria, licensePosture public_domain. `reader/data/overlays/samaritan/index.json` names MSAM1 (Cowley 1909), MSAM2 (Uhlemann 1837) and MSAM4 (Nicholls, preface signed 1858), each public_domain_on_its_dates_no_licence_printed; MSAM3 (Florentin and Tal, Open Book Publishers 2024), cc_by_nc_4_0; and MSAM5 (English Wiktionary, Samaritan Hebrew lemmas), cc_by_sa_4_0. None of these eleven ids has a ledger line, a map entry or a pill row.
- **The headword lookup.** The page has a switch, "look up by: the headword", that reads each word through its headword: the zone's word.hg, credited by word.hm (a source label, a posture and a year). These readings are not among the map's kinds. 150,422 words carry one. 142,238 credit a label the served index names, and those find their pill through the index. 8,184 do not: Jastrow 4,232 (your M198, which has no pill row), STEP TAHOT Expanded Strong 3,918 (your M197, pill "CC BY 4.0"), ETCBC BHSA 7 (your M199, which has no pill row), and 27 whose labels no ledger line carries (a Jastrow explicit listed forms variant 10, Davidson v17 7, PanLex 2024 6, Davidson v18 4).
- Asked: give the BSB, the eleven overlay ids, M198 and M199 their lines, map entries and pill rows; add the headword readings to the map, by place; and say which lines the 27 unmatched labels are, or rule that they are none. Say also whether any of M198's 474 run-store rows can stand on the page.

## 4. A holder's statement gives no pill (asked, not a fault)

- M97 (Davidson 1855, 85 served rows) and M184 (Kethoneth Yoseph 1887, 107 served rows) have licence_label null and branch HOLDER_STATEMENT_ONLY. Their holder statements read "The Library of Congress is unaware of any copyright restrictions for this item." and "NOT_IN_COPYRIGHT". Both have pill_rule NONE.
- Today the page shows "Public Domain" on them, from the short label. Under I3 they would show nothing.
- Asked: say whether a holder's statement may give the pill text, and if so, which words.

## What checked out

- Every reading in the map that has a source_line finds a pill row. The pill table's readings sum to 1,484,466, which is 1,485,602 less the 1,136 readings with no line.
- A store row's source_line is its own m_id: 2,095 of 2,095 in by-key shard `0e`, and the served rows per m_id equal readings.by_key in your pill table for all 120 served lines (676,463 rows). Every TAHOT piece resolves to PIECE:TAHOT and every MACULA piece to PIECE:MACULA. So the page can carry the 331-row pill table alone, not 5 GB of map, for everything it draws today. Please state the m_id rule shelf-wide, with its count, in your next receipt.
- A run reading that names several keys gives one state per key, each with its own source_line. Obadiah, card H-272236-272237, rungs[0]: M36, M44, M27, M71 and M133. The page will show such a reading with one pill per distinct pill_text. Say so if a reading should wear fewer.

## Not asked of you

The draw question, rule A or rule B, is the owner's to rule. Until the owner rules, the page draws exactly what it draws today, as you asked. The serving lane also found a fault of its own, which it will mend: under the headword lookup the page can wear the chip of the word's own form while reading through its headword.
