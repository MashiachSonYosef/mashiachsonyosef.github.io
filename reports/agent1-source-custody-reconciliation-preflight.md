# Agent 1 Source Custody Reconciliation Preflight

Generated: 2026-06-04T00:13:43.492Z

## Boundary

- Dry-run preflight only.
- No files were staged, committed, deleted, rendered, accepted, or published by this artifact.
- Publication state: blocked_no_render.

## Summary

- Track-candidate untracked source files: 23
- Track-candidate downstream direct paths: 189
- Missing-manifest source files: 0
- Missing-manifest expected manifest paths: 0
- Modified tracked source files requiring label review: 6

## Dry-Run Git Status Buckets

### track_candidate_source_files_only

Action boundary: Candidate source-only tracking list for Agent 6 review; not staged by this preflight.

- `data/sources/beer-hagolah.json` | git status: `??`
- `data/sources/brief-commentary-on-peah.json` | git status: `??`
- `data/sources/brief-commentary-on-rosh-hashanah.json` | git status: `??`
- `data/sources/brief-commentary-on-shabbat.json` | git status: `??`
- `data/sources/brief-commentary-on-shekalim.json` | git status: `??`
- `data/sources/brief-commentary-on-sheviit.json` | git status: `??`
- `data/sources/brief-commentary-on-sotah.json` | git status: `??`
- `data/sources/brief-commentary-on-taanit.json` | git status: `??`
- `data/sources/brief-commentary-on-terumot.json` | git status: `??`
- `data/sources/brief-commentary-on-yevamot.json` | git status: `??`
- `data/sources/brief-commentary-on-yoma.json` | git status: `??`
- `data/sources/derashat-shabbat-hagadol.json` | git status: `??`
- `data/sources/derush-al-hatorah.json` | git status: `??`
- `data/sources/gevurot-hashem.json` | git status: `??`
- `data/sources/machzor-rosh-hashanah-ashkenaz-linear.json` | git status: `??`
- `data/sources/machzor-rosh-hashanah-ashkenaz.json` | git status: `??`
- `data/sources/machzor-yom-kippur-ashkenaz-linear.json` | git status: `??`
- `data/sources/ner-mitzvah.json` | git status: `??`
- `data/sources/netivot-olam.json` | git status: `??`
- `data/sources/netzach-yisrael.json` | git status: `??`
- `data/sources/selichot-nusach-lita-linear.json` | git status: `??`
- `data/sources/shabbat-siddur-sefard-linear.json` | git status: `??`
- `data/sources/siddur-sefard.json` | git status: `??`

### track_candidate_downstream_direct_paths

Action boundary: Downstream paths that remain blocked until source custody is accepted; not staged by this preflight.

- `data/lexical/beer-hagolah-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/beer-hagolah.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-peah-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-peah.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-rosh-hashanah-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-rosh-hashanah.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-shabbat-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-shabbat.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-shekalim-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-shekalim.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-sheviit-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-sheviit.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-sotah-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-sotah.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-taanit-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-taanit.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-terumot-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-terumot.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-yevamot-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-yevamot.manifest.json` | git status: `??`
- `data/lexical/brief-commentary-on-yoma-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/brief-commentary-on-yoma.manifest.json` | git status: `??`
- `data/lexical/derashat-shabbat-hagadol-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/derashat-shabbat-hagadol.manifest.json` | git status: `??`
- `data/lexical/derush-al-hatorah-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/derush-al-hatorah.manifest.json` | git status: `??`
- `data/lexical/gevurot-hashem-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/gevurot-hashem.manifest.json` | git status: `??`
- `data/lexical/machzor-rosh-hashanah-ashkenaz-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/machzor-rosh-hashanah-ashkenaz-linear-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/machzor-rosh-hashanah-ashkenaz-linear.manifest.json` | git status: `??`
- `data/lexical/machzor-rosh-hashanah-ashkenaz.manifest.json` | git status: `??`
- `data/lexical/machzor-yom-kippur-ashkenaz-linear-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/machzor-yom-kippur-ashkenaz-linear.manifest.json` | git status: `??`
- `data/lexical/ner-mitzvah-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/ner-mitzvah.manifest.json` | git status: `??`
- `data/lexical/netivot-olam-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/netivot-olam.manifest.json` | git status: `??`
- `data/lexical/netzach-yisrael-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/netzach-yisrael.manifest.json` | git status: `??`
- `data/lexical/occurrences/beer-hagolah.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-peah.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-rosh-hashanah.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-shabbat.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-shekalim.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-sheviit.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-sotah.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-taanit.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-terumot.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-yevamot.json` | git status: `??`
- `data/lexical/occurrences/brief-commentary-on-yoma.json` | git status: `??`
- `data/lexical/occurrences/derashat-shabbat-hagadol.json` | git status: `??`
- `data/lexical/occurrences/derush-al-hatorah.json` | git status: `??`
- `data/lexical/occurrences/gevurot-hashem.json` | git status: `??`
- `data/lexical/occurrences/machzor-rosh-hashanah-ashkenaz-linear.json` | git status: `??`
- `data/lexical/occurrences/machzor-rosh-hashanah-ashkenaz.json` | git status: `??`
- `data/lexical/occurrences/machzor-yom-kippur-ashkenaz-linear.json` | git status: `??`
- `data/lexical/occurrences/ner-mitzvah.json` | git status: `??`
- `data/lexical/occurrences/netivot-olam.json` | git status: `??`
- `data/lexical/occurrences/netzach-yisrael.json` | git status: `??`
- `data/lexical/occurrences/selichot-nusach-lita-linear.json` | git status: `??`
- `data/lexical/occurrences/shabbat-siddur-sefard-linear.json` | git status: `??`
- `data/lexical/occurrences/siddur-sefard.json` | git status: `??`
- `data/lexical/selichot-nusach-lita-linear-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/selichot-nusach-lita-linear.manifest.json` | git status: `??`
- `data/lexical/shabbat-siddur-sefard-linear-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/shabbat-siddur-sefard-linear.manifest.json` | git status: `??`
- `data/lexical/siddur-sefard-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/siddur-sefard.manifest.json` | git status: `??`
- `data/lexical/token-indexes/liturgy/machzor-rosh-hashanah-ashkenaz-linear.json` | git status: `??`
- `data/lexical/token-indexes/liturgy/machzor-rosh-hashanah-ashkenaz.json` | git status: `??`
- `data/lexical/token-indexes/liturgy/machzor-yom-kippur-ashkenaz-linear.json` | git status: `??`
- `data/lexical/token-indexes/liturgy/selichot-nusach-lita-linear.json` | git status: `??`
- `data/lexical/token-indexes/liturgy/shabbat-siddur-sefard-linear.json` | git status: `??`
- `data/lexical/token-indexes/liturgy/siddur-sefard.json` | git status: `??`
- `data/lexical/token-indexes/other/beer-hagolah.json` | git status: `??`
- `data/lexical/token-indexes/other/derashat-shabbat-hagadol.json` | git status: `??`
- `data/lexical/token-indexes/other/derush-al-hatorah.json` | git status: `??`
- `data/lexical/token-indexes/other/gevurot-hashem.json` | git status: `??`
- `data/lexical/token-indexes/other/ner-mitzvah.json` | git status: `??`
- `data/lexical/token-indexes/other/netivot-olam.json` | git status: `??`
- `data/lexical/token-indexes/other/netzach-yisrael.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-peah.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-rosh-hashanah.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-shabbat.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-shekalim.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-sheviit.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-sotah.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-taanit.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-terumot.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-yevamot.json` | git status: `??`
- `data/lexical/token-indexes/tosefta/brief-commentary-on-yoma.json` | git status: `??`
- `data/overlays/beer-hagolah.json` | git status: `??`
- `data/overlays/brief-commentary-on-peah.json` | git status: `??`
- `data/overlays/brief-commentary-on-rosh-hashanah.json` | git status: `??`
- `data/overlays/brief-commentary-on-shabbat.json` | git status: `??`
- `data/overlays/brief-commentary-on-shekalim.json` | git status: `??`
- `data/overlays/brief-commentary-on-sheviit.json` | git status: `??`
- `data/overlays/brief-commentary-on-sotah.json` | git status: `??`
- `data/overlays/brief-commentary-on-taanit.json` | git status: `??`
- `data/overlays/brief-commentary-on-terumot.json` | git status: `??`
- `data/overlays/brief-commentary-on-yevamot.json` | git status: `??`
- `data/overlays/brief-commentary-on-yoma.json` | git status: `??`
- `data/overlays/derashat-shabbat-hagadol.json` | git status: `??`
- `data/overlays/derush-al-hatorah.json` | git status: `??`
- `data/overlays/gevurot-hashem.json` | git status: `??`
- `data/overlays/machzor-rosh-hashanah-ashkenaz-linear.json` | git status: `??`
- `data/overlays/machzor-rosh-hashanah-ashkenaz.json` | git status: `??`
- `data/overlays/machzor-yom-kippur-ashkenaz-linear.json` | git status: `??`
- `data/overlays/ner-mitzvah.json` | git status: `??`
- `data/overlays/netivot-olam.json` | git status: `??`
- `data/overlays/netzach-yisrael.json` | git status: `??`
- `data/overlays/selichot-nusach-lita-linear.json` | git status: `??`
- `data/overlays/shabbat-siddur-sefard-linear.json` | git status: `??`
- `data/overlays/siddur-sefard.json` | git status: `??`
- `liturgy/machzor-rosh-hashanah-ashkenaz-linear/index.html` | git status: `??`
- `liturgy/machzor-rosh-hashanah-ashkenaz/index.html` | git status: `??`
- `liturgy/machzor-yom-kippur-ashkenaz-linear/index.html` | git status: `??`
- `liturgy/selichot-nusach-lita-linear/index.html` | git status: `??`
- `liturgy/shabbat-siddur-sefard-linear/index.html` | git status: `??`
- `liturgy/siddur-sefard/index.html` | git status: `??`
- `other/beer-hagolah/index.html` | git status: `??`
- `other/beer-hagolah/overlay-export.csv` | git status: `??`
- `other/beer-hagolah/overlay-export.json` | git status: `??`
- `other/beer-hagolah/overlay-export.md` | git status: `??`
- `other/derashat-shabbat-hagadol/index.html` | git status: `??`
- `other/derashat-shabbat-hagadol/overlay-export.csv` | git status: `??`
- `other/derashat-shabbat-hagadol/overlay-export.json` | git status: `??`
- `other/derashat-shabbat-hagadol/overlay-export.md` | git status: `??`
- `other/derush-al-hatorah/index.html` | git status: `??`
- `other/derush-al-hatorah/overlay-export.csv` | git status: `??`
- `other/derush-al-hatorah/overlay-export.json` | git status: `??`
- `other/derush-al-hatorah/overlay-export.md` | git status: `??`
- `other/gevurot-hashem/index.html` | git status: `??`
- `other/gevurot-hashem/overlay-export.csv` | git status: `??`
- `other/gevurot-hashem/overlay-export.json` | git status: `??`
- `other/gevurot-hashem/overlay-export.md` | git status: `??`
- `other/ner-mitzvah/index.html` | git status: `??`
- `other/ner-mitzvah/overlay-export.csv` | git status: `??`
- `other/ner-mitzvah/overlay-export.json` | git status: `??`
- `other/ner-mitzvah/overlay-export.md` | git status: `??`
- `other/netivot-olam/index.html` | git status: `??`
- `other/netivot-olam/overlay-export.csv` | git status: `??`
- `other/netivot-olam/overlay-export.json` | git status: `??`
- `other/netivot-olam/overlay-export.md` | git status: `??`
- `other/netzach-yisrael/index.html` | git status: `??`
- `other/netzach-yisrael/overlay-export.csv` | git status: `??`
- `other/netzach-yisrael/overlay-export.json` | git status: `??`
- `other/netzach-yisrael/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-peah/index.html` | git status: `??`
- `tosefta/brief-commentary-on-peah/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-peah/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-peah/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-rosh-hashanah/index.html` | git status: `??`
- `tosefta/brief-commentary-on-rosh-hashanah/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-rosh-hashanah/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-rosh-hashanah/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-shabbat/index.html` | git status: `??`
- `tosefta/brief-commentary-on-shabbat/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-shabbat/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-shabbat/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-shekalim/index.html` | git status: `??`
- `tosefta/brief-commentary-on-shekalim/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-shekalim/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-shekalim/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-sheviit/index.html` | git status: `??`
- `tosefta/brief-commentary-on-sheviit/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-sheviit/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-sheviit/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-sotah/index.html` | git status: `??`
- `tosefta/brief-commentary-on-sotah/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-sotah/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-sotah/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-taanit/index.html` | git status: `??`
- `tosefta/brief-commentary-on-taanit/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-taanit/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-taanit/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-terumot/index.html` | git status: `??`
- `tosefta/brief-commentary-on-terumot/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-terumot/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-terumot/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-yevamot/index.html` | git status: `??`
- `tosefta/brief-commentary-on-yevamot/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-yevamot/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-yevamot/overlay-export.md` | git status: `??`
- `tosefta/brief-commentary-on-yoma/index.html` | git status: `??`
- `tosefta/brief-commentary-on-yoma/overlay-export.csv` | git status: `??`
- `tosefta/brief-commentary-on-yoma/overlay-export.json` | git status: `??`
- `tosefta/brief-commentary-on-yoma/overlay-export.md` | git status: `??`

### missing_manifest_source_files

Action boundary: Sources requiring missing lexical manifest remediation or explicit downstream exclusion before custody closure.


### missing_manifest_expected_paths

Action boundary: Expected manifest paths currently missing by custody evidence; generation is not performed by this preflight.


### modified_tracked_license_label_sources

Action boundary: Modified tracked sources requiring Agent 6 source-drift review; not accepted by this preflight.

- `data/sources/abarbanel-on-guide-for-the-perplexed.json` | git status: ` M`
- `data/sources/crescas-on-guide-for-the-perplexed.json` | git status: ` M`
- `data/sources/efodi-on-guide-for-the-perplexed.json` | git status: ` M`
- `data/sources/narboni-on-guide-for-the-perplexed.json` | git status: ` M`
- `data/sources/shem-tov-on-guide-for-the-perplexed.json` | git status: ` M`
- `data/sources/yahel-ohr-on-zohar.json` | git status: ` M`

### modified_tracked_downstream_direct_paths

Action boundary: Downstream paths relying on modified tracked sources; remain blocked until source-drift review.

- `data/lexical/abarbanel-on-guide-for-the-perplexed-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/abarbanel-on-guide-for-the-perplexed.manifest.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/crescas-on-guide-for-the-perplexed-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/crescas-on-guide-for-the-perplexed.manifest.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/efodi-on-guide-for-the-perplexed-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/efodi-on-guide-for-the-perplexed.manifest.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/narboni-on-guide-for-the-perplexed-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/narboni-on-guide-for-the-perplexed.manifest.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/occurrences/abarbanel-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/occurrences/crescas-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/occurrences/efodi-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/occurrences/narboni-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/occurrences/shem-tov-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/occurrences/yahel-ohr-on-zohar.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/shem-tov-on-guide-for-the-perplexed-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/shem-tov-on-guide-for-the-perplexed.manifest.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/token-indexes/gra/yahel-ohr-on-zohar.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/token-indexes/jewish-thought/abarbanel-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/token-indexes/jewish-thought/crescas-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/token-indexes/jewish-thought/efodi-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/token-indexes/jewish-thought/narboni-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/token-indexes/other/shem-tov-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/lexical/yahel-ohr-on-zohar-chunks` | git status: `clean_or_directory_expansion_required`
- `data/lexical/yahel-ohr-on-zohar.manifest.json` | git status: `clean_or_directory_expansion_required`
- `data/overlays/abarbanel-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/overlays/crescas-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/overlays/efodi-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/overlays/narboni-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/overlays/shem-tov-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/overlays/yahel-ohr-on-zohar.json` | git status: `clean_or_directory_expansion_required`
- `data/reports/coverage/abarbanel-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/reports/coverage/crescas-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/reports/coverage/efodi-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/reports/coverage/narboni-on-guide-for-the-perplexed.json` | git status: `clean_or_directory_expansion_required`
- `data/reports/coverage/yahel-ohr-on-zohar.json` | git status: `clean_or_directory_expansion_required`
- `gra/yahel-ohr-on-zohar/index.html` | git status: ` M`
- `gra/yahel-ohr-on-zohar/overlay-export.csv` | git status: `clean_or_directory_expansion_required`
- `gra/yahel-ohr-on-zohar/overlay-export.json` | git status: `clean_or_directory_expansion_required`
- `gra/yahel-ohr-on-zohar/overlay-export.md` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/abarbanel-on-guide-for-the-perplexed/index.html` | git status: ` M`
- `jewish-thought/abarbanel-on-guide-for-the-perplexed/overlay-export.csv` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/abarbanel-on-guide-for-the-perplexed/overlay-export.json` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/abarbanel-on-guide-for-the-perplexed/overlay-export.md` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/crescas-on-guide-for-the-perplexed/index.html` | git status: ` M`
- `jewish-thought/crescas-on-guide-for-the-perplexed/overlay-export.csv` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/crescas-on-guide-for-the-perplexed/overlay-export.json` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/crescas-on-guide-for-the-perplexed/overlay-export.md` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/efodi-on-guide-for-the-perplexed/index.html` | git status: ` M`
- `jewish-thought/efodi-on-guide-for-the-perplexed/overlay-export.csv` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/efodi-on-guide-for-the-perplexed/overlay-export.json` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/efodi-on-guide-for-the-perplexed/overlay-export.md` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/narboni-on-guide-for-the-perplexed/index.html` | git status: ` M`
- `jewish-thought/narboni-on-guide-for-the-perplexed/overlay-export.csv` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/narboni-on-guide-for-the-perplexed/overlay-export.json` | git status: `clean_or_directory_expansion_required`
- `jewish-thought/narboni-on-guide-for-the-perplexed/overlay-export.md` | git status: `clean_or_directory_expansion_required`
- `other/shem-tov-on-guide-for-the-perplexed/index.html` | git status: ` M`
- `other/shem-tov-on-guide-for-the-perplexed/overlay-export.csv` | git status: `??`
- `other/shem-tov-on-guide-for-the-perplexed/overlay-export.json` | git status: `??`
- `other/shem-tov-on-guide-for-the-perplexed/overlay-export.md` | git status: `??`

## Must Not Be Accepted From This Preflight

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
