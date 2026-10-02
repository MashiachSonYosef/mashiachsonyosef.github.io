# Conventions

- American English spelling in everything we author: docs, UI strings, code, comments, metadata, commit messages. Write license, catalog, analyze, color, -ize. Never licence, catalogue, analyse, colour, -ise.
- Source texts are never respelled. Text imported from Sefaria or any other source keeps its original spelling byte for byte.
- Displayed work titles use Title Case exactly as the source catalog gives them, e.g. "Pri Etz Chaim", "Sha'ar HaGilgulim". Never lowercase a display title.
- Slugs, IDs, paths, and JSON keys are lowercase kebab-case, e.g. tanakh/genesis, genesis-1-1. These are identifiers, not titles.
- A name that appears in more than one file must match exactly everywhere: same spelling, same casing, same punctuation. Searchability depends on it.
- The site is the `main` branch: the pages at the root, the reader and its pipeline under `reader/`. `gh-pages` is frozen as a pointer since 2026-10-02 and `workbench-archive` holds the retired workbench. Work on `main`.
