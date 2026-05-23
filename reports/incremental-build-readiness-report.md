# Incremental Build Readiness Report

Generated: 2026-05-23T02:04:13.675Z

## Summary

- Works: 849
- Source units: 407743
- Source bytes: 1012373223
- HTML bytes: 1226021428
- Lexical chunk bytes: 5155846331
- Global artifacts tracked: 6
- Artifacts at/above 50 MB: 13
- Artifacts at/above 45 MB: 14

## Large Artifact Risks

| Work | Artifact | Path | Bytes | Level |
| --- | --- | --- | ---: | --- |
| sitewide | global | data/public-lexical | 670776546 | warning |
| sitewide | global | data/search | 355963048 | warning |
| beit-yosef | occurrence | data/lexical/occurrences/beit-yosef.json | 67358262 | warning |
| arukh-hashulchan | lexical_chunks | data/lexical/arukh-hashulchan-chunks | 66569263 | warning |
| arukh-hashulchan | occurrence | data/lexical/occurrences/arukh-hashulchan.json | 62224943 | warning |
| arukh-hashulchan | source | data/sources/arukh-hashulchan.json | 61719663 | warning |
| beit-yosef | lexical_chunks | data/lexical/beit-yosef-chunks | 59992744 | warning |
| ein-yaakov | lexical_chunks | data/lexical/ein-yaakov-chunks | 59791041 | warning |
| akeidat-yitzchak | lexical_chunks | data/lexical/akeidat-yitzchak-chunks | 59635665 | warning |
| ohr-hachammah-on-zohar | lexical_chunks | data/lexical/ohr-hachammah-on-zohar-chunks | 59018952 | warning |
| beit-yosef | html | halakhah/beit-yosef/index.html | 54999587 | warning |
| arukh-hashulchan | html | halakhah/arukh-hashulchan/index.html | 54968476 | warning |
| shenei-luchot-haberit | lexical_chunks | data/lexical/shenei-luchot-haberit-chunks | 52616309 | warning |
| beit-yosef | source | data/sources/beit-yosef.json | 49513193 | near_warning |

## Missing Artifact Phases

| Work | Missing / Invalidated Phases |
| --- | --- |

## Next Infrastructure Moves

1. Split large source files into source manifests plus source-unit chunks while preserving public URLs.
2. Split large rendered work pages into route shells plus source-unit hydration chunks or route-local section pages with anchor compatibility.
3. Split root overlay exports into per-work/indexed downloads to avoid root files crossing GitHub warning thresholds.
4. Add work-id queue files generated from this graph for source, overlay, lexical payload, render, and public export phases.
5. Add a persistent token/claim DB or deterministic JSONL shards keyed by work/token/claim hashes.
