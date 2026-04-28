# Phase 6 Lexical Source Report

Date: 2026-04-28

Scope: report only. No Hebrew word HUD implementation, no machine draft translation implementation, and no lexical data import.

## Recommendation summary

Use a two-track lexical strategy later:

- Biblical Hebrew / Tanakh HUD: OpenScriptures Hebrew Bible plus OpenScriptures Hebrew Lexicon is the cleanest first path.
- Broad Hebrew lookup HUD: Kaikki/Wiktionary or Wikidata Lexemes are possible supplements, but should remain clearly license-separated from CC0 overlays.

Do not use unclear or non-commercial datasets for automatic HUD data.

## Candidate datasets

| Dataset | URL | License | Format | Fields available | Coverage | Import difficulty | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OpenScriptures Hebrew Bible / morphhb | https://github.com/openscriptures/morphhb | CC BY 4.0 for lemma/morphology; WLC text public domain | OSIS XML; scripts for JSON conversion | Hebrew tokens, immutable word IDs, lemma attributes, morphology codes | Biblical Hebrew | Medium | Use for Tanakh word identity, morphology, and lemma mapping. Not enough by itself for English HUD glosses. |
| OpenScriptures Hebrew Lexicon | https://github.com/openscriptures/HebrewLexicon | CC BY 4.0; underlying BDB/Strong material noted as public domain | XML files: BrownDriverBriggs, HebrewStrong, LexicalIndex, AugIndex | Lexical entries, Strong/BDB mapping, gloss/definition material, augmented Strong mapping | Biblical Hebrew | Medium | Use with morphhb for Biblical Hebrew strict renderings and root/lemma support. |
| MACULA Hebrew Linguistic Datasets | https://github.com/Clear-Bible/macula-hebrew | CC BY 4.0 with source-specific notices | TSV, XML-like trees, lowfat/nodes formats | Morphology, syntax, Strong numbers, semantic domains, glosses, senses, participant references | Biblical Hebrew | Medium/high | Maybe. Very useful, but field-level source notices should be reviewed before importing glosses/senses. |
| Kaikki / Wiktextract Hebrew dictionary | https://kaikki.org/dictionary/Hebrew/index.html | Derived from Wiktionary; Wiktionary text is CC BY-SA 4.0 and GFDL | JSONL download | Headwords, forms, POS, senses/glosses, tags, categories; roots where Wiktionary has them | Mixed Biblical / Rabbinic / Modern, uneven | Medium | Maybe. Good broad dictionary candidate, but keep attribution/share-alike obligations isolated from CC0 overlays. |
| Raw Wiktionary dumps | https://dumps.wikimedia.org/hewiktionary/latest/ and https://dumps.wikimedia.org/enwiktionary/latest/ | CC BY-SA 4.0 and GFDL for entry text | XML dumps | Full wiki pages/templates/modules; needs extraction | Mixed; depends on edition | High | Maybe. Prefer Kaikki first unless we need direct dump reproducibility. |
| Wikidata Lexeme dumps | https://dumps.wikimedia.org/wikidatawiki/entities/ | CC0 for structured Lexeme namespace data | JSON, RDF, N-Triples, Turtle | Lemmas, forms, senses, glosses, grammatical statements, external IDs | All languages; Hebrew coverage uneven | High | Maybe. Best CC0 supplement, but likely not enough coverage by itself. |
| Hspell | http://hspell.ivrix.org.il/ | AGPL-3.0-only in package metadata | Source package / morphology tooling | Modern Hebrew spelling and morphology; no English definitions | Modern Hebrew | Medium/high | Skip for HUD meanings. Maybe later for local morphology tooling only if AGPL constraints are acceptable. |
| MILA Hebrew resources | http://mila.cs.technion.ac.il/ and related mirrors | Public license clarity is inconsistent; related resources appear GPLv3 or non-commercial in secondary indexes | XML/tools/corpora depending resource | Morphological analysis, transliteration, gender/number/definiteness/person in some tools | Modern Hebrew | High | Skip until an official compatible license file is identified for the exact dataset. |
| gregarkhipov/milon | https://github.com/gregarkhipov/milon | Repository is MIT, but dictionary-data provenance needs manual review | JSON | Hebrew-English and English-Hebrew entries | Modern Hebrew | Low/medium | Manual review. Do not import until the dictionary content provenance is clear, not only the app license. |

## Next approved implementation path

If HUD work is later approved, start with a tiny Biblical-Hebrew proof of concept:

1. Import OpenScriptures morphhb for one Tanakh book.
2. Import OpenScriptures Hebrew Lexicon mapping for the same lemmas.
3. Build a local lexical table separate from source text and overlays.
4. Add word-level HUD only for that test book.
5. Validate license/attribution display before expanding.

This avoids contaminating the owner's CC0 overlay layer with CC BY-SA or unclear dictionary data.

