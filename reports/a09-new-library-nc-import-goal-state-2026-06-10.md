# A09 New Library / NC Import Goal State - 2026-06-10

Status: `candidate_set_finished_or_blocked`

Goal: finish or prove the remaining new-library import and NC/noncommercial lane work for the Hebrew workbench, producing usable output or exact blockers without acceptance overclaim.

## Current Answer

No, the full new-library + NC work is not finished.

The correct current shape is broader than the first pass: some new library lanes are already imported/rendered, some missing libraries were identified as importable but not configured, and several NC / unknown-license / schema / OCR lanes remain blocked.

## Imported / Present Library Lanes

- `midrash/alphabet-of-ben-sira/` exists with rendered/import artifacts:
  - `midrash/alphabet-of-ben-sira/index.html`
  - `midrash/alphabet-of-ben-sira/overlay-export.csv`
  - `midrash/alphabet-of-ben-sira/overlay-export.json`
  - `midrash/alphabet-of-ben-sira/overlay-export.md`
- `reports/hebrew-source-intake-inventory.md` records multiple imported Hebrew source lanes:
  - remaining Midrash Rabbah commentaries: 19 works / 2685 source units / 127690 token occurrences.
  - Perush Maharzu on Midrash Rabbah commentaries: 10 works / 4181 source units / 130442 token occurrences.
  - Matnot Kehunah on Midrash Rabbah commentaries: 10 works / 5481 source units / 72160 token occurrences.
  - Etz Yosef on Midrash Rabbah commentaries: 10 works / 8228 source units / 250533 token occurrences.
  - core Midrash commentary / notes: 9 works / 29966 source units / 1397734 token occurrences.
  - base Midrash / Aggadah / Halakhah: 14 works / 6960 source units / 722466 token occurrences.
  - older lanes include 35 Tanakh books from `Miqra according to the Masorah` and Torah Midrash / Aggadah works including Midrash Tanchuma Buber, Midrash Aggadah, Seder Olam Rabbah, and Midrash Sekhel Tov.
- `reports/tosefta-source-import-report.md` records the Public Domain Tosefta lane imported under Full Library:
  - 61 works / 4062 source units.
  - 96013 unique surface forms, 36561 matched, 59452 unmatched.
- `reports/minor-tractates-source-import-report.md` records imported Public Domain minor tractates / Avot:
  - Pirkei Avot, Avot DeRabbi Natan, Derekh Eretz Rabbah, Derekh Eretz Zuta, Kallah, Semachot, Soferim.
  - 765 total imported units across the seven listed works.
- `reports/kabbalah-source-import-report.md` records imported Kabbalah works:
  - Derech Etz Chayim (Ramchal), Maaseh Rokeach on Mishnah, Mitpachat Sefarim, The Beginning of Wisdom, The Wars of God.
  - 1932 total imported units across the five listed works, all Hebrew-only with `CC-BY-SA` metadata.
- `reports/sefaria-safe-candidate-halakhah-small-continuation-report.md` records a safe Halakhah small continuation batch:
  - 158 works imported/tokenized.
  - 1823 estimated source units.
  - licenses: 157 Public Domain, 1 CC0.
- `reports/sefaria-safe-candidate-halakhah-xl-continuation-report.md` records a safe Halakhah XL continuation batch:
  - 61 works imported/tokenized.
  - 7238 actual source units.
  - licenses: 60 Public Domain, 1 CC-BY-SA.

## Importable Candidate Follow-Up

- `reports/sefaria-safe-candidate-kabbalah-report.md` identifies 5 Kabbalah candidates as importable now but not configured:
  - BePardes HaChasidut VeHakabbalah, Public Domain: imported/rendered now; `data/sources/bepardes-hachasidut-vehakabbalah.json`, 1031 units, `chasidut/bepardes-hachasidut-vehakabbalah/index.html`.
  - Ohr Ne'erav, Public Domain: `data/sources/ohr-neerav.json` exists with 959 units and `kabbalah/ohr-neerav/index.html` exists.
  - Ohr Penimi on Talmud Eser HaSefirot, Public Domain: imported/rendered now; `data/sources/ohr-penimi-on-talmud-eser-hasefirot.json`, 1655 units, `kabbalah/ohr-penimi-on-talmud-eser-hasefirot/index.html`.
  - Shuvi Shuvi HaShulamit, Public Domain, estimated 123 units: imported/rendered now; `data/sources/shuvi-shuvi-hashulamit.json`, 123 units, `kabbalah/shuvi-shuvi-hashulamit/index.html`.
  - Talmud Eser HaSefirot, Public Domain: still blocked; scoped single-work import timed out after 10 minutes with no source/overlay artifact.
- `reports/sefaria-safe-candidate-oral-law-report.md` identifies 3 Oral Law candidates as importable now but not configured:
  - A New Israeli Commentary on Pirkei Avot, CC-BY: imported/rendered now; `data/sources/a-new-israeli-commentary-on-pirkei-avot.json`, 1564 units, `mishnah/a-new-israeli-commentary-on-pirkei-avot/index.html`.
  - Amudei Yerushalayim on Jerusalem Talmud Nedarim, Public Domain, estimated 18 units: imported/rendered now; `data/sources/amudei-yerushalayim-on-jerusalem-talmud-nedarim.json`, 18 units, `other/amudei-yerushalayim-on-jerusalem-talmud-nedarim/index.html`.
  - Avot DeRabbi Natan, Recension B, Public Domain: `data/sources/avot-derabbi-natan-recension-b.json` exists with 626 units and `midrash/avot-derabbi-natan-recension-b/index.html` exists.

Live file check result:

- present/imported/rendered from this candidate set: 7 works.
- remaining source blocker from this candidate set: 1 work, `talmud-eser-hasefirot`.

## Not Finished / Blocked

- Grimoire Hebrew source work is inventory-only, not imported:
  - `reports/grimoire-hebrew-source-inventory.md`
  - `Sepher Maphteah Shelomo` is potentially safe only after OCR/transcription against the Wellcome facsimile.
  - Lesser Key / Goetia is not a Hebrew-source-text import candidate from the checked sources.
- Midrash and Oral Law deferred candidates remain blocked or pending:
  - Midrash Rabbah base texts with `unknown` probe license remain blocked.
  - `Ein Yaakov (Glick Edition)` was not imported because the version title indicates a translated edition and needs separate review.
  - `Ruth Rabbah (Lerner)` was not imported because the modern 1971 edition metadata needs separate review.
  - Otzar subrefs that failed Sefaria API fetch were skipped; only fetched Public Domain Hebrew units were retained.
  - root `Mishnah` did not probe cleanly through the existing discovery script and was not imported in the minor-tractates pass.
- Kabbalah deferred candidates remain blocked or pending:
  - unknown-license Kabbalah works remain blocked.
  - `Reshit Chokhmah` is `CC-BY-NC` and remains an NC lane, not a commercial-clean import.
  - `Tikkunei Zohar` needs Talmud-addressed schema importer support.
  - Mitpachat Sefarim sections with Sefaria-reported `unknown` license were skipped.
  - Maaseh Rokeach on Mishnah, Seder Tahorot did not fetch cleanly and was skipped.
- Halakhah continuation skipped-after-attempt blockers:
  - small batch: `annotations-of-maharatz-chajes-on-mishneh-torah-foreign-worship-and-customs-of-the-nations`, `annotations-of-minchat-chinukh-on-mishneh-torah-daily-offerings-and-additional-offerings`, and `yitzchak-yeranen-on-mishneh-torah-the-sanhedrin-and-the-penalties-within-their-jurisdiction` produced no usable source units/token index.
  - XL batch: `kiryat-sefer-on-mishneh-torah-the-sanhedrin-and-the-penalties-within-their-jurisdiction` and `kiryat-sefer-on-mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary` produced zero source units.
- NC / Klein / noncommercial old-dictionary lane is classified but not usable for commercial export, candidate text, Definition, answer, runtime, public display, staging, render, or release:
  - `reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.md`
  - commercial+NC overlap: 197 rows / 4185 occurrences
  - commercial+NC without BDB Augmented Strong: 57 rows / 818 occurrences
  - triple overlap: 140 rows / 3367 occurrences
  - Klein-only excluded: 17 rows / 259 occurrences
  - blockers include `commercial_nc_overlap_requires_agent6_source_family_selection_boundary`, `klein_nc_content_not_commercially_authorized`, and `metadata_only_no_definition_or_candidate_text`.
- Daniel actual page work is still blocked from visibility/feature use:
  - `reports/agent10-daniel-actual-page-prehud-blocker-callback-2026-06-06.md`

## Process Notes

Two broad searches across `reports`, `data/control`, and `data` timed out at 30 seconds. They were not treated as proof.

Next checks were narrowed to known artifacts and direct paths.

Additional timeout rows:

- `process_timeout | powershell -ExecutionPolicy Bypass -File scripts/import_sefaria_sources.ps1 -ConfigPath data/catalog/sefaria-safe-candidate-kabbalah-imports.json -SkipExisting | 10m | partial artifacts created for BePardes, Ohr Penimi, and Shuvi; Talmud Eser absent | next_safe_action: rerun only changed scope, single-work Talmud Eser`
- `process_timeout | powershell -ExecutionPolicy Bypass -File scripts/import_sefaria_sources.ps1 -ConfigPath data/catalog/sefaria-safe-candidate-kabbalah-imports.json -OnlyWorkIds talmud-eser-hasefirot -SkipExisting | 10m | no source or overlay artifact for Talmud Eser | next_safe_action: do not retry same importer; needs segmented importer/cache/checkpoint strategy`
- `process_timeout | npm run build | 10m | no completion output, new pages were not produced | next_safe_action: use targeted lexical/render pipeline`
- `process_timeout | node scripts/validate_sources.mjs | 10m | no completion output | next_safe_action: targeted route-page and overlay-row validation for candidate set`

Successful bounded commands:

- `powershell -ExecutionPolicy Bypass -File scripts/import_sefaria_sources.ps1 -ConfigPath data/catalog/sefaria-safe-candidate-oral-law-imports.json -SkipExisting`
- `node scripts/build_lexical_cache.mjs --work-id ... --report-path reports/a09-new-library-targeted-lexical-build-2026-06-10.md`
- `powershell -ExecutionPolicy Bypass -File scripts/render_site.ps1 -WorkIds <single-work-id>` for BePardes, Ohr Penimi, Shuvi, A New Israeli Commentary, and Amudei Yerushalayim.
- `node scripts/validate_route_hud_page.mjs --page ...` passed for 7 candidate pages.
- targeted source-unit to overlay-row count check passed for 7 candidate pages.

## Recommended Next Work

1. Do not rerun the same Talmud Eser importer command. The next useful action is a segmented/checkpointed importer or a bounded cached import strategy for `talmud-eser-hasefirot`.
2. For more usable output soon, continue prioritizing clear PD / CC-BY / CC0 metadata with schema support before NC / unknown-license / OCR lanes.
3. A1-source lane should own any source/license/custody decision for candidate imports and NC/noncommercial classifications.
4. A2 should only transform/readiness-package rows after exact A1/A7/A6/A10 boundary state exists; current NC/Klein rows remain zero-output.
5. The immediate missing-library docket is reduced to one source blocker: `talmud-eser-hasefirot`.

## Stop Condition

Stop only when each candidate has one of:

- rendered/imported usable output path;
- exact source/license/custody blocker;
- exact OCR/transcription prerequisite;
- exact A7 approval gate blocker;
- exact zero-output NC/noncommercial blocker.

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no NC commercial authorization, no public/runtime mutation, no staging, no release action.
