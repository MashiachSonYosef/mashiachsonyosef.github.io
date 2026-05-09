# HUD Readiness Report

Generated: 2026-05-09

## Scope

This pass audited the lexical HUD/workbench layer only. It did not import works, generate translations, alter Hebrew source data, alter anchors, alter overlays/exports, or change lexical meanings/source license metadata.

## Representative Works Sampled

| Work type | Path sampled | Result |
|---|---|---|
| Orot flagship | `/orot/` | HUD opens; project grammar source display normalized to `project-authored / CC0`. |
| Kol HaTor / Gra School | `/gra/kol-hator/` | HUD opens; source rows display cleanly. |
| Joshua / Tanakh | `/tanakh/joshua/` | HUD opens; unresolved rows show quiet empty state without fake source/license lines. |
| Midrash Rabbah | `/midrash/eikhah-rabbah/` | HUD opens; no console errors. |
| Midrash commentary | `/midrash/yefeh-toar-on-bereshit-rabbah/` | HUD opens; unresolved rows stay quiet. |
| Ari / Kabbalah | `/ari/pri-etz-chaim/` | HUD opens; source rows display cleanly. |
| Gra commentary | `/gra/beur-hagra-on-shulchan-arukh-orach-chayim/` | HUD opens; source rows display cleanly. |

## Bugs Found And Fixed

- Fixed unresolved HUD claim cards rendering misleading compact lines such as `Source: Source metadata incomplete` and `License: N/A`.
- Normalized legacy project-rule compact license display from `N/A - project lexical rule` to `project-authored / CC0` without changing the underlying metadata.
- Hardened clickable Hebrew word wrapping by adding `max-width`, `overflow-wrap: anywhere`, and `word-break: break-word` to `.lexical-word`.
- Extended lexical DOM validation so Orot must retain the new license display helper and wrapping markers.

## Integrity Checks

- Static lexical integrity audit: 170 lexical pages, 1,309 lexical chunks, 1,226,504 forms, 185,813 entries, 525,708 source rows.
- Missing source refs: 0.
- Missing source metadata rows: 0.
- Static local link/anchor audit: 173 HTML files, 532,713 links, 538 local links, 0 broken local links or anchors.
- Browser console during sampled HUD clicks: no console errors observed.

## Size Notes

Largest generated HTML pages observed:

| Path | Size |
|---|---:|
| `midrash/otzar-midrashim/index.html` | 21.85 MB |
| `midrash/midrash-lekach-tov/index.html` | 21.24 MB |
| `midrash/chafetz-chaim-on-sifra/index.html` | 20.25 MB |
| `gra/beur-hagra-on-shulchan-arukh-yoreh-deah/index.html` | 17.65 MB |
| `midrash/ein-yaakov/index.html` | 17.42 MB |

Largest lexical chunk observed:

| Path | Size |
|---|---:|
| `data/lexical/orot-chunks/orot-000.json` | 2.18 MB |

Largest source-layer files observed:

| Path | Size |
|---|---:|
| `data/lexical/source-layers/openscriptures-cc-by-4.json` | 32.24 MB |
| `data/lexical/source-layers/wikidata-cc0.json` | 6.08 MB |
| `data/lexical/source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json` | 0.85 MB |

## Remaining HUD Risks

- Several large work pages are still heavy because one work equals one HTML page. This is not a HUD correctness blocker, but future pagination or section-level pages would improve load time.
- Many tokens remain unresolved or caution-only. That is expected and preferable to unsafe definitions.
- Some source rows intentionally remain unavailable for unresolved rows; the HUD now avoids presenting missing metadata as if it were a source claim.
- Collapsed source/license sections still report no cached row for unresolved tokens. This is accurate, but could be visually softened later.

## Commands Run

```powershell
git status --short
git diff --name-only
git diff --check
git diff -- scripts/render_site.ps1 scripts/validate_lexical_dom.ps1
git diff --stat
```

Additional audits were run with local Node/browser tooling during the pass:

```text
Static lexical integrity audit
Static local HTML link/anchor audit
In-app browser HUD sampling against http://127.0.0.1:8765/
```

## Files Changed

- `scripts/render_site.ps1`
- `scripts/validate_lexical_dom.ps1`
- generated work `index.html` pages refreshed from the HUD renderer
- `reports/hud-readiness-report.md`

## Conclusion

The HUD is ready for slow human translation work from a UI/data-integrity perspective. Remaining issues are mostly coverage/content limitations and large-page performance, not source/license boundary problems.
