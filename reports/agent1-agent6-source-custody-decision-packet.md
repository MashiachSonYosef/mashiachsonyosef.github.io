# Agent 1 -> Agent 6 Source Custody Decision Packet

Generated: 2026-06-04T00:13:43.656Z

## Boundary

- This is an Agent 6 decision-input packet only.
- It does not stage, track, delete, render, publish, or accept any source/provenance state.
- Publication state: blocked_no_render.

## Decision Questions

- Can the 17 untracked source files with lexical manifests proceed to source-file tracking review, with downstream artifacts still blocked until separate acceptance?
- For the 6 untracked source files missing lexical manifests, should Agent 1 generate missing manifests or explicitly exclude/quarantine downstream reliance?
- Can the 6 modified tracked source files be accepted as PD-to-Public-Domain license-label normalization drift only?
- Which downstream direct artifacts and content references must remain blocked after each source decision?

## Decision Inputs

- Track-candidate untracked sources: 23
- Missing-manifest untracked sources: 0
- Modified tracked license-label sources: 6
- Blocked downstream direct artifact paths: 248
- Blocked downstream content-reference paths: 183

### Track-Candidate Untracked Sources

| Source | Work | Units | Licenses | Direct artifacts | Content refs |
| --- | --- | ---: | --- | ---: | ---: |
| `data/sources/beer-hagolah.json` | beer-hagolah | 529 | Public Domain: 529 | 9 | 66 |
| `data/sources/brief-commentary-on-peah.json` | brief-commentary-on-peah | 158 | CC-BY: 158 | 9 | 1 |
| `data/sources/brief-commentary-on-rosh-hashanah.json` | brief-commentary-on-rosh-hashanah | 85 | CC-BY: 85 | 9 | 1 |
| `data/sources/brief-commentary-on-shabbat.json` | brief-commentary-on-shabbat | 493 | CC-BY: 493 | 9 | 1 |
| `data/sources/brief-commentary-on-shekalim.json` | brief-commentary-on-shekalim | 114 | CC-BY: 114 | 9 | 1 |
| `data/sources/brief-commentary-on-sheviit.json` | brief-commentary-on-sheviit | 337 | CC-BY: 337 | 9 | 1 |
| `data/sources/brief-commentary-on-sotah.json` | brief-commentary-on-sotah | 158 | CC-BY: 158 | 9 | 1 |
| `data/sources/brief-commentary-on-taanit.json` | brief-commentary-on-taanit | 66 | CC-BY: 66 | 9 | 1 |
| `data/sources/brief-commentary-on-terumot.json` | brief-commentary-on-terumot | 486 | CC-BY: 486 | 9 | 1 |
| `data/sources/brief-commentary-on-yevamot.json` | brief-commentary-on-yevamot | 228 | CC-BY: 228 | 9 | 1 |
| `data/sources/brief-commentary-on-yoma.json` | brief-commentary-on-yoma | 139 | CC-BY: 139 | 9 | 1 |
| `data/sources/derashat-shabbat-hagadol.json` | derashat-shabbat-hagadol | 271 | Public Domain: 271 | 9 | 1 |
| `data/sources/derush-al-hatorah.json` | derush-al-hatorah | 257 | Public Domain: 257 | 9 | 1 |
| `data/sources/gevurot-hashem.json` | gevurot-hashem | 1863 | Public Domain: 1863 | 9 | 1 |
| `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json` | machzor-rosh-hashanah-ashkenaz-linear | 14761 | CC-BY: 14761 | 6 | 1 |
| `data/sources/machzor-rosh-hashanah-ashkenaz.json` | machzor-rosh-hashanah-ashkenaz | 1488 | CC-BY: 1488 | 6 | 1 |
| `data/sources/machzor-yom-kippur-ashkenaz-linear.json` | machzor-yom-kippur-ashkenaz-linear | 17895 | CC-BY: 17895 | 6 | 1 |
| `data/sources/ner-mitzvah.json` | ner-mitzvah | 90 | Public Domain: 90 | 9 | 33 |
| `data/sources/netivot-olam.json` | netivot-olam | 1248 | Public Domain: 1248 | 9 | 1 |
| `data/sources/netzach-yisrael.json` | netzach-yisrael | 970 | Public Domain: 970 | 9 | 1 |
| `data/sources/selichot-nusach-lita-linear.json` | selichot-nusach-lita-linear | 22257 | CC-BY: 22257 | 6 | 1 |
| `data/sources/shabbat-siddur-sefard-linear.json` | shabbat-siddur-sefard-linear | 14718 | CC-BY: 14718 | 6 | 1 |
| `data/sources/siddur-sefard.json` | siddur-sefard | 6799 | CC-BY: 1300; Public Domain: 5499 | 6 | 1 |

### Missing Lexical Manifest Sources

| Source | Work | Missing manifest paths |
| --- | --- | --- |

### Modified Tracked License-Label Drift Sources

| Source | Work | Diff count | Current licenses | HEAD licenses |
| --- | --- | ---: | --- | --- |
| `data/sources/abarbanel-on-guide-for-the-perplexed.json` | abarbanel-on-guide-for-the-perplexed | 633 | Public Domain: 633 | PD: 633 |
| `data/sources/crescas-on-guide-for-the-perplexed.json` | crescas-on-guide-for-the-perplexed | 70 | Public Domain: 70 | PD: 70 |
| `data/sources/efodi-on-guide-for-the-perplexed.json` | efodi-on-guide-for-the-perplexed | 151 | Public Domain: 151 | PD: 151 |
| `data/sources/narboni-on-guide-for-the-perplexed.json` | narboni-on-guide-for-the-perplexed | 182 | Public Domain: 182 | PD: 182 |
| `data/sources/shem-tov-on-guide-for-the-perplexed.json` | shem-tov-on-guide-for-the-perplexed | 132 | Public Domain: 132 | PD: 132 |
| `data/sources/yahel-ohr-on-zohar.json` | yahel-ohr-on-zohar | 238 | Public Domain: 238 | PD: 238 |

## Must Not Be Accepted From This Packet

- source/provenance acceptance
- publication readiness
- future publication support
- public/runtime acceptance
- Definition authority
- route publication support
- product/data gate acceptance
- accepted translation text
- page/render acceptance
- acceptance of the six modified tracked source files
