# THE FRAME · canonical review standard · v1 · 2026-08-27

The owner's pipeline frame, recorded so every lane ships against ideas, not
containers. Order is dependency order: bytes may exist in custody unadmitted, but nothing
is ADMITTED or DISPLAYED until its permission exists, nothing navigates until
its identity exists, nothing means until its witness exists. Authored from the owner's own account; corrections are the
owner's to make.

| layer | the idea | current artifact | custody (website lane) | need (website lane) |
|---|---|---|---|---|
| **A** | Acquisition — the raw fact that bytes were obtained, before any claim about them | `ledgers/work/a/` (1MB) | ✗ | NOT NEEDED FOR SERVE — serve reads the verified body and the bridge; acquisition history stays corpus-side |
| **N** | Permission + source identity — licensor, license, custody, display right, forbidden effect. Acquired bytes may exist in custody before N; N gates ADMISSION and DISPLAY, not raw existence | `ledgers/work/n/` (337MB, 241 files; batch-shaped) + derived current: `corpus-refinement-v1/output/active-rights-resolution-v2/` | ✗ — the live launch blocker | **NEEDED — the one open row.** Either shape serves: `active-rights-resolution-v2` (3,986 rows + 9 profiles, kilobyte-scale) or the full binding composite (its seal is already held for counter-verification) |
| **B** | Admission to the corpus spine — the census of works | `ledgers/work/b/`, `b-corpus-spine/` | ✗ | NOT NEEDED FOR SERVE — the bridge in custody carries the census the fleet walks |
| **Y** | REFINED 2026-08-27 (owner, accepted by construction): Hebrew title bytes belong to C0 — Y never owns them. Y survives as two things: (1) a CHECKER — it marks "this word is a title" (book/chapter grain) and carries the cardinality law: the count of common-English readings in Y must EXACTLY equal the count of titles in C0; (2) the ENGLISH rider — the small force-read (commonly_force_read_as). The refined cardinality/provenance law is with Oholiab so the migration preserves Y's checker role | `ledgers/work/y/` (1.3GB, pre-repair) | ✗ | NEEDED ONLY as the English rider (commonly_force_read_as), null lawful — exactly the ruling: the site already derives navigation from C0 and the bridge; the pre-repair ledger is not needed on this disk |
| **Q** | Pure pointer, no content — points a C0 site at its MAM form for display: full carrier renders unchanged; the card's lattice (above the COMPspan) shows qere and ketiv separately; clicking underlines that half in the C0, marking which written form the current English defines | Q pointers in the MAM candidate (57 shipped) | ✓ in candidate | NEEDED — held; the lattice, the underline, and their gates are live |
| **K** | The key — normalized lexical identity that routes to definitions | route store, site-side (140,532 keys / 774,277 routes) | ✓ | NEEDED — held |
| **W** | The witnessed form — word-forms as written, the inventory the validator cross-checks (1,485,250 forms) | `ledgers/work/w/` (146MB) | ✗ | NOT NEEDED FOR SERVE — an audit inventory; wanted for the deferred W-grain check, never for serving |
| **W/K on MAM** | Both halves of a pair are real words: ketiv and qere EACH walk the definitional pipeline and each gets its English (the 103 pairs) | MAM candidate (shipped) | ✓ in candidate | NEEDED — held; both halves serve |
| **COMPspan** | Spans — how occurrences compose into readable structure; the reader's component system draws from the span table | `ledgers/work/compspan/` (100MB) | ✗ | NEEDED as the span template the zone builder reads — held site-side; the 100MB ledger stays corpus-side |
| **COMPcell** | Cells of composition | `ledgers/work/compcell/` (181MB) | ✗ | NOT NEEDED — derived on site, never stored |
| **L** | NOT_MATERIALIZED — vestigial bundle label, recorded not deleted | — | n/a | n/a — agreed |
| **X** | PROPOSED (owner, 2026-08-27), not ruled: a force-read license binding — "this force read uses this force license," a license picked per Y rider. Alternatives on the table: treat the Y rider like an R pill instead. Letter unassigned in the frame; `ledgers/work/x/` exists (6 files) with unrelated content to be checked before the letter is claimed | — | — |
| **D** | A definition — the English definitional record for a form | in `ledgers/work/ldmprs/` | ✗ | NEEDED in serving form — held as the route store; `ldmprs/` itself is not needed on this disk |
| **M** | The dictionary — the source work a D comes from | in `ldmprs/` | ✗ | NEEDED in serving form — held (a source per reading, via the route store) |
| **P** | The bundler — RULED 2026-08-27 (owner's P fix, law with Oholiab): P groups at the R-PILL grain, byte-perfect — not at the whole-D grain. All M's matching that exact pill are clickable-through, each D displayed byte-exact in its own source's hand. No fold, no normalization, semantics still ignored: the exactness ethic is unchanged, only the match unit moved to the pill | in `ldmprs/` | ✗ | NEEDED as the byte-perfect rule — held site-side; the OPEN expansion awaits the owner's ruling |
| **R** | The ROUTE — the selectable definition route (the "R pill") a reader cycles among. Licensing is not the pill: rights accompany the witness, they never define the route. (The separate rights mapping `work_id → rights_profile_id` lives at `active-rights-resolution-v2/` — 3,986 rows + 9 profiles, unshipped; its catalog half is already in the 89) | routes in `ldmprs/`; rights mapping in `output/` | ✗ | NEEDED — routes held via the route store; the rights mapping in this row is N's cargo: needed, not held |
| **S** | Source year — antiquity as provenance and sort law: the oldest witness leads (the owner's standing rule v4). A sort key, never an inclusion gate | in `ldmprs/` | ✗ | NEEDED — held (a year per reading; the sort law runs on every card) |
| — | the body — C0 occurrences, the text itself | R2 `body/c0-rebuilt-20260827/` | ✓ verified 4,646/4,646 on the website lane's disk | NEEDED — held |
| — | c0 bridge (unit → C0 ranges) | in the 89 | ✓ | NEEDED — held |

`ldmprs/` totals 8.4GB / 29,039 files and carries D, M, P, R, S together.

## The standing rule this document creates

Shipping is reviewed **by frame, not by container**: a layer is either in the
website lane's custody, or explicitly marked not-needed-for-serve by the lane
that reads it. Any layer in neither state is a finding. The corpus lane's
sweep checks this table's custody column; the website lane annotates the
need column; the owner corrects the ideas.

## The need column, read whole (website lane, 2026-08-28)

Annotated, the table closes: every layer is held, or marked not-needed-for-serve,
or it is N. The finding count is one. And N's own row now names its smallest
sufficient shape — `active-rights-resolution-v2`, 3,986 rows and 9 profiles,
kilobytes, already built and merely unshipped — so the launch blocker is no
longer a gigabyte ask. The fleet's join is written against whichever shape
arrives first; the composite's seal is held either way, and a work-grain
table will be counter-verified against its own row count and the bridge's
census before a single work builds on it.

— recorded by the corpus lane from the owner's account of the frame
— need column annotated by the website lane, 2026-08-28
