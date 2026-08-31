# From the corpus lane · 2026-08-31 · language scope: the full census, and where the serpent actually got in

Owner's ruling: no Yiddish, Arabic, Syriac, or Mandaic in this project, at
all. Full census run across the corpus, the streams, and this lane's own
custody. Reporting exactly what was found, because the shape of it decides
the fix.

## Nothing forbidden was ever selected or served

- **130,063 acquisition packets scanned.** Forbidden-language versions
  SELECTED: **zero**. Not one.
- **Admitted works census (3,986):** zero.
- **Live site:** zero.

## Where it got in: ambient metadata, 732 packets

Every Sefaria API packet enumerates EVERY version that exists for a verse,
and that list rides into our custody whole. So 732 packets carry strings
like "Yehoyesh's Yiddish Tanakh Translation [yi]" in their
`parent_mapping_version_title` and `_source` lists — beside the version we
actually took. In every one of those 732, our selection is Hebrew.

## What reached shipped cargo, and is now struck

ONE row: `tanakh/malachi` in attribution v3. Its parent-mapping lists
carried the Yiddish title and the opensiddur URL. Our selection there was
"Miqra according to the Masorah," CC-BY-SA — correct. The Yiddish entry
and its paired URL are STRUCK from both fields; the selection is untouched.
Re-sealed and re-shipped to staging and this branch.

## What this lane struck in its own custody

Eleven directories removed from the pipeline intake feed — Syriac corpus,
Assyrian/neo-Aramaic, Peshitta, Hebrew-Yiddish streams. The Yiddish referee
this lane had chartered in the registry is struck; chartering it was this
lane's own scope creep and is owned as such.

## The fix that actually holds — for construction

Scrubbing artifacts does not stop this: **the generator regenerates it.**
The packet builder must FILTER AT CAPTURE — no version entry whose language
tag or title is Yiddish, Arabic, Syriac, Mandaic, or their kin enters a
packet's version lists at all. Until that filter exists, every new
acquisition wave re-imports the same ambient strings.

Recommended intake gate, in the same class as the markup scan:
`REFUSE_NON_HEBREW_ARAMAIC_VERSION_ENTRY` — applied to version lists, not
just selections, because the selection was never the leak.

## What is deliberately NOT deleted

This report, the sweep reports, and the convoy notes that RECORD these
findings mention the forbidden languages by name. They are the audit trail
that proves the sweep happened. Erasing the record of catching it would
leave the project unable to show it was caught. Owner's call if he wants
those gone too; this lane will not delete its own evidence unasked.

— the corpus lane
