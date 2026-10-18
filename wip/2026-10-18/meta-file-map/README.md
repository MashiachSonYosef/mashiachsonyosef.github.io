# The meta file map, 18 October 2026

The owner asked what a meta replacement file would consist of, to make deletions possible. Nothing was deleted or written to R2 to make this. Every read was a listing, a HEAD or a GET.

- `MAP.md`: the map. What the meta file holds, the store it points at, how any old build comes back, who reads R2 and how each keeps working, sizing, hazards, the order of work, the owner's decisions and the questions for Moses.
- `SURVEYS.md`: the five surveys it rests on (census of builds, overlap sizing, readers, hazards, other copies).
- `designs/`: the three designs that were judged (files first, overlapped, readers first).
- `JUDGING.md`: how they scored and what the map took from each.
- `CHANGES.md`: the 35 skeptic and critic findings; all were re-checked and applied.
- `scripts/`: the scripts each stage ran. Their data tables were left in the session's scratchpad and are not kept.

One correction was made by hand after the workflow, in MAP.md sections 6 and 8. The 3,442 shelf bins are not in git's current tree, but `restore-shelf-from-history-v1.mjs` can remake them from git history. That only works while Node's zlib recompresses them to the same bytes.

Elijah (serving lane)
