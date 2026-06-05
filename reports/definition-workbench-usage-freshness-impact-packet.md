# Definition Workbench Usage Freshness Impact Packet

Generated: 2026-06-01T20:26:27.957Z

## Boundary

- Lane: Agent 3 usage navigation.
- Source: existing freshness report and existing usage-navigation packet only.
- Source text read: 0.
- Target expansion: none.
- Promoted run targets: 0.
- Reader-facing rows: 0.
- Definition authority: false.

## Counts

- Source freshness status: stale
- Pending refresh files: 173
- Pending files with current usage overlap: 0
- Pending files without current usage overlap: 173
- Impacted navigation rows: 0
- Impacted selected support rows: 0
- Impacted supported / candidate / weak rows: 0/0/0
- Current navigation rows: 2390
- Current selected support rows: 49
- Review-only / promoted targets: 173/0
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Interpretation

Zero overlap means the current usage-navigation rows do not directly reference the pending modified source-file slugs. It does not make the corpus exhaustive or current.

## Checks

| check | status | detail |
|---|---|---|
| source_freshness_stale_visible | passed | status stale; pending 173 |
| pending_rows_match_source_freshness | passed | rows 173; freshness 173 |
| current_usage_direct_overlap_classified | passed | overlap/no-overlap/pending 0/173/173 |
| no_current_usage_overlap | passed | impacted navigation/selected/routeIds 0/0/0 |
| current_navigation_metadata_preserved | passed | rows/source/anchor/license/version 2390/2390/2390/2390/2390 |
| no_targets_promoted | passed | review-only/promoted/broad 173/0/0 |
| usage_only_boundary | passed | sourceText/reader/payload/forbidden 0/0/0/0 |
| queue_not_mutated | passed | queue mutations 0; submitted 0 |

## Pending Source Rows

| impact | source file | category hint | current usage rows | selected support rows | supported | candidate | weak | route ids | reason |
|---|---|---|---:|---:|---:|---:|---:|---|---|
| no_current_usage_overlap | data/sources/brief-commentary-on-yoma.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-yevamot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-terumot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-taanit.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-sotah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-sheviit.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-shekalim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-shabbat.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-rosh-hashanah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-peah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-orlah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-nedarim.json | kabbalah | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-nazir.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-moed-katan.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-megillah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-maasrot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-maaser-sheni.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-kilayim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-ketubot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-gittin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-eruvin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-demai.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-challah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-chagigah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-bikkurim.json | halakhah | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-berakhot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-beitzah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-bava-metzia.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-bava-kamma.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/brief-commentary-on-bava-batra.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-pirkei-avot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-zevachim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-yoma.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-terumot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-temurah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-tamid.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-tahorot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-taanit.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-sheviit.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-shabbat.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-rosh-hashanah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-pesachim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-peah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-parah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-orlah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-oholot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-niddah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-negaim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-moed-katan.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-mikvaot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-middot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-meilah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-megillah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-makkot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-maaser-sheni.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-kinnim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-kilayim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-kiddushin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-keritot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-kelim.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-gittin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-eruvin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-eduyot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-demai.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-chullin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-bikkurim.json | halakhah | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-berakhot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-bekhorot.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-beitzah.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-bava-metzia.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/boaz-on-mishnah-arakhin.json | mishnah-tosefta | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/bartenura-on-pirkei-avot.json | unknown | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/avot-derabbi-natan-recension-b.json | unknown | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/siddur-sefard.json | liturgy | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/shabbat-siddur-sefard-linear.json | liturgy | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/selichot-nusach-lita-linear.json | liturgy | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/machzor-yom-kippur-ashkenaz-linear.json | liturgy | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/machzor-rosh-hashanah-ashkenaz-linear.json | liturgy | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/machzor-rosh-hashanah-ashkenaz.json | liturgy | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |
| no_current_usage_overlap | data/sources/the-war-of-the-jews.json | unknown | 0 | 0 | 0 | 0 | 0 |  | Pending source file does not overlap current usage-navigation work IDs; keep stale freshness warning but do not promote a broad refresh target from this artifact. |

This packet narrows the stale-source warning for current usage rows only. It does not clear broad corpus freshness, source/provenance acceptance, definition authority, public UI acceptance, or publication readiness.
