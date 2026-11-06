# Branch audit · 6 November 2026, after the print-step ship (main 7078bab6)

A data-level read of what the page prints, branch by branch, against each ledger's own words. The code review of the day's diff checks the code; this checks the outcome: for every branch the owner answered, the branch's question, the option's "means" prose, and the served rows it reaches with what the page prints for them.

## What was read

- **audit-prints.txt** (from audit-prints.mjs): every branch whose answer carries a print step (ledger-print-v1). All 36 that reach a row, every distinct route under each (2,019 rows; the four ConceptNet tag-off branches and one no-pill branch reach no row after the retext). Each line is the route as the store holds it, then what the page prints: the texts of row[8], or no pill.
- **audit-divides.txt** (from audit-divides.mjs): every branch the owner answered "divides" (54; 66,955 rows). Rows grouped by the pattern of shapes they divide at, four rows shown per pattern, up to fourteen per branch. Each line is the route, then the pieces row[7] cuts it into.

Both scripts are read-only and take the reader root and an output path: `node audit-prints.mjs reader/ out.txt`.

## What it found

Every branch matches its ledger's prose on every row read. In particular:

- A sign at a cut is left out and a sign at the very end stays, where the ledger says so (unabridged BDB B03 «lo! behold!» prints «lo», «behold!»; Kaikki Hebrew B08 «boy, physically able young man. Also, a servant.» prints three, the full stop at the cut gone).
- A bracket, a label or a tail stays with the piece it touches, even where it speaks of all (Classical Hebrew B02, Kaikki B03, unabridged BDB B04 «top, summit, of tree»).
- A later piece prints without the small verb it leans on, as the ledgers say (unabridged BDB B02/B05, Kaikki B02, Wikidata forms B02).
- The print steps keep only the route's own characters in their own order: 933 Wikimedia rows «X (disambiguation)» print «X»; the two forms of «Mede (-s)» print «Mede», «Medes»; PanLex's doubled CSV quotes come off («"personal pronoun ""he"""» prints «personal pronoun "he"»).
- A row where two branches meet prints under the one whose answer is no pill (PanLex definitions «''(physics)''»).

Twenty-five rows cut into a piece that repeats inside the row (Kaikki «to recruit, … to recruit, …» on 22 forms of גיס; TBESH «to profane/begin: begin»; BDB «cut, cut» and «god, God»). The page folds a card's pills by their lowercased text, so each prints once, as the TBESH and BDB ledgers say it should.

Nothing here is a finding against the code or the data. It is the record the owner can read to see what each answer did.
