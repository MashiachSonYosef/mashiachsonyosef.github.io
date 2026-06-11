# Source Scope Public Visibility Validation

Generated: 2026-06-01T08:28:01.081Z

Verdict: pass_with_warnings

Input: reports/untracked-source-scope-audit.json

## Summary

- Untracked source rows: 13
- Public pages: 7
- Public pages with visible source/license rows: 7
- Missing public pages: 6
- Downstream quarantined rows: 13

## Rows

| source | public page | visible source/license rows | downstream quarantine | issues |
|---|---|---:|---:|---|
| data/sources/beer-hagolah.json | other/beer-hagolah/index.html | yes | yes | none |
| data/sources/derashat-shabbat-hagadol.json | other/derashat-shabbat-hagadol/index.html | yes | yes | none |
| data/sources/derush-al-hatorah.json | other/derush-al-hatorah/index.html | yes | yes | none |
| data/sources/gevurot-hashem.json | other/gevurot-hashem/index.html | yes | yes | none |
| data/sources/machzor-rosh-hashanah-ashkenaz-linear.json | liturgy/machzor-rosh-hashanah-ashkenaz-linear/index.html | no | yes | none |
| data/sources/machzor-rosh-hashanah-ashkenaz.json | liturgy/machzor-rosh-hashanah-ashkenaz/index.html | no | yes | none |
| data/sources/machzor-yom-kippur-ashkenaz-linear.json | liturgy/machzor-yom-kippur-ashkenaz-linear/index.html | no | yes | none |
| data/sources/ner-mitzvah.json | other/ner-mitzvah/index.html | yes | yes | none |
| data/sources/netivot-olam.json | other/netivot-olam/index.html | yes | yes | none |
| data/sources/netzach-yisrael.json | other/netzach-yisrael/index.html | yes | yes | none |
| data/sources/selichot-nusach-lita-linear.json | liturgy/selichot-nusach-lita-linear/index.html | no | yes | none |
| data/sources/shabbat-siddur-sefard-linear.json | liturgy/shabbat-siddur-sefard-linear/index.html | no | yes | none |
| data/sources/siddur-sefard.json | liturgy/siddur-sefard/index.html | no | yes | none |

## Issues

- none

## Warnings

- data/sources/machzor-rosh-hashanah-ashkenaz-linear.json: page_path provided but page_exists false
- data/sources/machzor-rosh-hashanah-ashkenaz.json: page_path provided but page_exists false
- data/sources/machzor-yom-kippur-ashkenaz-linear.json: page_path provided but page_exists false
- data/sources/selichot-nusach-lita-linear.json: page_path provided but page_exists false
- data/sources/shabbat-siddur-sefard-linear.json: page_path provided but page_exists false
- data/sources/siddur-sefard.json: page_path provided but page_exists false

## Boundary

- This validates current public/workbench visibility only for rows already listed in the untracked source-scope audit.
- It does not resolve the source/provenance blocker; untracked source files remain quarantined until tracked, audited, or explicitly quarantined by policy.
- It does not accept publication readiness.

