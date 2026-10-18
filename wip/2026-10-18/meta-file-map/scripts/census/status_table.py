# Writes status-table.tsv: one line per unit, status + role + the evidence for the status.
# Hand-made from what was read (site data in the ghp checkout, the corpus lane's relay inventory,
# the front pages of each build, the bucket listing).  Rules below say which; every hand call names its source.
# Run after census.py has written builds-extra.tsv once (it reads relay/newer-version columns from it).
import csv, re
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/census'
C = 'corpus-lane-builds/'
L = 'moses-ledgers/'

# ---- SERVED: the live site's data names this unit as the source of bytes it serves now
served = {
 C+'moses-hud-record-v1/': 'served: reader/data/hud-runs/<book>.json from.record = corpus-lane-builds/moses-hud-record-v1/v1.2/build/hud-record-v1.2/<book>.jsonl with record_sha256; relay FOR-ELIJAH-v64.2',
 C+'moses-megacompspan-toggles-v1/': 'served: reader/data/hud-toggles/<book>.json from.file = corpus-lane-builds/moses-megacompspan-toggles-v1/build/toggles-v1/<book>.json with sha256; relay v66',
 C+'moses-source-suggested-v1/': 'served: reader/data/source-suggested/<book>.json (39 books) from v1.1; toggle-queue r2_prefix corpus-lane-builds/moses-source-suggested-v1/v1.1/build/out/source-suggested-bsb/; relay v63.1 (v1 itself refuted, relay v63)',
 C+'moses-span-store-v1/': 'served: reader/data/span-store/<book>.json from "span-store-v1.4 (FOR-ELIJAH-v75.4.draft.md)"; R2 path corpus-lane-builds/moses-span-store-v1/build-v1.4/span-store-v1.4',
 C+'moses-piece-store-v2/': 'served: reader/data/piece-store/index.json build piece-store-v2, relay v77; R2 path corpus-lane-builds/moses-piece-store-v2/build/piece-store-v2/records',
 C+'moses-dictionary-store-v1/': 'served: reader/data/dictionary-store/index.json from.build = corpus-lane-builds/moses-dictionary-store-v1/v1.1/build/dictionary-store-v1.1/serve/shards/, relay v79',
 C+'moses-masoretic-marks-v1/': 'served: reader/data/masoretic-marks-v1.json relay FOR-ELIJAH-v72.2.1, ledger "moses-masoretic-marks-v1 build-v1.2"; 42 pinned files matched by name and size',
 C+'moses-jastrow-toggle-v1/': 'served: reader/data/overlays/jastrow (MANIFEST r2_path corpus-lane-builds/moses-jastrow-toggle-v1/overlay-store/); 257 overlay files matched by name and size; relay v34 READY',
 C+'moses-samaritan-toggle-v1/': 'served: reader/data/overlays/samaritan (MANIFEST r2_path corpus-lane-builds/moses-samaritan-toggle-v1/overlay-store/, store_version 32545d00f4fd); 253 files matched by name and size. Its relay v46 was later marked superseded by v57 (v1.3), but v1.1 to v1.4 were never served',
 C+'moses-year-repair-v1.1/': 'served: the served route store is store 3411c86e94e7 (moses-year-repair-v1.1/route-store) plus the site\'s own strike (now 7310e81ba017), per reader/data/route-store/index.json store_version_history; both overlays name corpus-lane-builds/moses-year-repair-v1.1/route-store as their base',
 C+'moses-compspan-v13.8/': 'served: zones (39 books) emitted_from.span_ledger relay "corpus lane v59.3"; <book>.spans-ledger-v5.json and <book>.pg-from-piece-gloss-v4.json are in moses-compspan-v13.8/build/spans-ledger and build/pg (same name and size; byte copies also sit in v13.5 to v13.7)',
 C+'moses-orders-rebase-v2.1/': 'served: zones emitted_from.witnessed_order.columns.*.build = moses-orders-rebase-v2.1 (order files v2.7, sha256 pinned); relay v52 READY',
 C+'moses-parse-source-and-declaration-v1/': 'served: toggle-queue entry declarations-branch, status served, r2_prefix moses-parse-source-and-declaration-v1/declaration-store-v7/ (served as data/route-store/source-declarations-v1.bin)',
 C+'moses-maqaf-weld-run-check-v1/': 'served: reader/data/run-cards from.ledger cards-v1.jsonl.gz sha256 e90116c9...; MEASURED: the sha256 of R2 key moses-maqaf-weld-run-check-v1/strand-run-card/outputs/cards-v1.jsonl.gz equals it; serving-rulings-v1.json names this build',
 L+'lattice-v12/': 'served: zones emitted_from.toggles.lattice.source.ledger = moses-ledgers/lattice-v12/; data/lane-state-v1.json lattice schema v12 on 39 books',
 L+'toggle-builds-v1/': 'served: zones emitted_from.toggles.headword.source.ledger = moses-ledgers/toggle-builds-v1/form-or-lemma-v2/word-lemma-v1.csv.gz',
 L+'toggle-ledgers-v1/': 'served: toggle-queue entry source-corpus, status served, r2_prefix moses-ledgers/toggle-ledgers-v1/ (data/source-corpus-v1.json); the jastrow overlay cites its OWNER-RULING-jastrow-and-coinage-toggles-v1.json',
 L+'v-ledger-v2/': 'served: toggle-queue entry v-counts, status served, r2_prefix moses-ledgers/v-ledger-v2/; data/v-volume-receipt-v1.json pins 3 of its files (name and size match)',
 L+'mam-restore-v5/': 'served: the 39 served Tanakh zones are served from the MAM restore v5 (zones emitted_from.walk.restore_oracle kind MAM_RESTORE_V5); MEASURED: sha256 of mam-amos-restored-v5.csv.gz equals zones/amos.bin restore_gz_sha256',
 'serving-lane/shelf/': 'served (backup): the serving lane\'s byte backup of the shelf\'s 3,594 zone bins; reader/tools/restore-shelf-from-history-v1.mjs restores from r2 serving-lane/shelf/zones/ (copy dated 2026-09-24 to 09-28; the local bins were rewritten 2026-10-17)',
}
# ---- CITED: the site names a file in this unit as a source, licence record, lineage or build input
cited = {
 'corpus-staging/corpus-refinement-v1/': 'cited: reader/data/workspace-manifest-v1.json pins 79 of its files (oracle contracts and outputs) that must be staged before the serves and builds run',
 'corpus-staging/ledgers/': 'cited: reader/data/workspace-manifest-v1.json pins 2 files under corpus-staging/ledgers/work/',
 C+'moses-intake-bsb-tables-v1/': 'cited: reader/data/source-suggested/index.json path {BUILDS}/moses-intake-bsb-tables-v1/raw/bsb_tables.tsv, the BSB source of the served toggle',
 C+'moses-licence-ledger-v1/': 'cited: reader/data/piece-store/index.json licensePointer moses-licence-ledger-v1/build-v1.1/licence-ledger-v1.1/sources-v1.1.jsonl; its newest relay v67.4.3 says NOT READY',
 C+'moses-samaritan-hebrew-search-v1/': 'cited: reader/data/overlays/samaritan/index.json licence_record moses-samaritan-hebrew-search-v1/check/candidates-check-v1.json',
 C+'moses-year-repair-v1/': 'cited: reader/data/overlays/jastrow/index.json names builds:moses-year-repair-v1/strand-1-the-ruled-table/fetch/JASTROW-ia-...djvu.txt as a row source; as a build it is superseded by v1.1 (relay v19 SUPERSEDED, front page SUPERSEDED)',
 C+'moses-pointing-store-v1/': 'cited: reader/data/pointing-store-verify-v1.json lane moses-pointing-store-v1; the served route store landed the pointing store on 2026-09-18 (store_version_history 94bc125695bf)',
 C+'moses-ben-yehuda-page-toggle-v2/': 'cited: reader/data/overlays/samaritan/index.json names builds:moses-ben-yehuda-page-toggle-v2/overlay-store/index.json; relay v41 READY; not itself served',
 L+'kq-reseal-v1/': 'cited: reader/data/rule-demonstrations-v1.json source moses-ledgers/kq-reseal-v1/streams/tanakh-nahum-kq-resealed-v1.tokens.csv.gz (sha256 named)',
 L+'maqaf-reseal-v1/': 'cited: reader/data/rule-demonstrations-v1.json and toggle-queue cite moses-ledgers/maqaf-reseal-v1/streams/ (e.g. tanakh-ruth-maqaf-split-v1.tokens.csv.gz); maqaf-reseal-v2 exists beside it',
 L+'frame/': 'cited: reader/data/serving-rulings-v1.json names moses-ledgers/frame/SERVING-RULINGS-2026-09-02.md; toggle-queue prefix moses-ledgers/frame/',
 L+'bridge-v2/': 'cited: reader/tools/build-zone.mjs and serve-from-stream-v2.mjs serve the shelf "under bridge-v2" (moses-ledgers/bridge-v2/c0-location-source-bridge-v2-maqaf-split.csv.gz)',
 L+'edition-door-v1/': 'cited: reader/tools/serve-edition-v1.mjs serves an edition "with the rights the edition door gives it"; the edition door is this ledger (inferred from the name)',
 L+'serve-set/': 'cited: reader/tools/serve-edition-v1.mjs reads the door list serve-set-v<N>-built.csv (v9 named; v11 and v12 are here)',
 L+'tanakh-successor-streams-v3/': 'cited: served zones carry title_he_from "... restore v5 -> successor streams v3" (lineage of the served Tanakh titles)',
 'editions-built-v1/[4,031 work folders]/': 'cited: reader/tools/serve-edition-v1.mjs serves one edition stream of editions-built-v1 (2026-09-02) verified against its receipt; the shelf\'s edition zones come from these streams',
 'editions-built-v1/h1-canon/': 'cited: same as the work folders: reader/tools/serve-edition-v1.mjs reads editions-built-v1 streams',
 'editions-built-v1/tanakh-editions/': 'cited: same as the work folders: reader/tools/serve-edition-v1.mjs reads editions-built-v1 streams',
 'editions-built-v1/pby-wave/': 'cited: same as the work folders: reader/tools/serve-edition-v1.mjs reads editions-built-v1 streams (the PBY wave sub-collection)',
}
# ---- BUILD FOLDERS OF SERVED LEDGERS: the served copy is elsewhere, but this folder's newest round is the same bytes
build_of_served = {
 C+'moses-lattice-ledger-v1/': 'build of served: the build folder of the lattice (rounds v6 to v12 under candidate/); MEASURED by md5: it holds a byte copy of all 0.330 GB of moses-ledgers/lattice-v12, which the zones serve; the older rounds are superseded',
 C+'moses-tanakh-mam-restore-v1/': 'build of served: the build folder of the MAM restore (candidate/ to candidate-v5/); MEASURED by md5: candidate-v5 holds the same bytes as moses-ledgers/mam-restore-v5, which the 39 Tanakh zones serve; candidate to candidate-v4 are superseded',
}
served.update(build_of_served)
# ---- CANDIDATES: the newest delivery of a layer, its newest own relay READY (or no status line), not served yet
candidate = {
 C+'moses-blob-ledger-v1/': 'candidate: newest own relay FOR-ELIJAH-v65.4.1 READY (blob ledger v1.3.1); not served (the site\'s blob is its own s1 drawing)',
 C+'moses-hebrew-defined-layer-v1.7/': 'candidate: relay v49 READY; v1 to v1.6 bannered HELD-SEE-next; not served',
 C+'moses-raise-ledger-v1/': 'candidate: newest own relay v69.1.4 READY; not served',
 C+'moses-set-apart-v1/': 'candidate: relay v73 READY (candidate_only); not served',
 C+'moses-tahot-rows-v2/': 'candidate: relay v62.2 READY (TAHOT rows overlay v2, run 4); not named by the site',
 C+'moses-word-numbering-v1/': 'candidate: newest own relay v71.1.1 READY; not served',
 C+'moses-word-order-v1/': 'candidate: relay v70 READY; not served',
 C+'moses-bundled-by-century-v2.1/': 'candidate: relay v16 (no status line; the corpus lane counts that as current); newest of its family; not named by the site',
 C+'moses-direction-ledger-v1/': 'candidate: relay v39 (no status line), "a layer over every toggle; five alternatives priced"; not named by the site',
 C+'moses-inplace-v2.3/': 'candidate: newest in-place order (2026-09-25, "M-A only", candidate_only); no relay; not named by the site',
}
# ---- SUPERSEDED by hand (the automatic rule already catches a newer version or a SUPERSEDED relay)
superseded_hand = {
 C+'moses-witnessed-order-v2.5/': 'superseded: relay v32 READY, but the served zones read the witnessed orders v2.7 from moses-orders-rebase-v2.1 (zones emitted_from.witnessed_order)',
 C+'moses-run-ledger-backwards-v1/': 'superseded: front page bannered SUPERSEDED (2 October 2026) by moses-run-ledger-v1.1/build/THE-RUN-CARD-v1.1.md',
 C+'moses-run-ledger-v1.1/': 'superseded: relay v60 SUPERSEDED (READY copy kept as withdrawn); the served run cards come from moses-maqaf-weld-run-check-v1',
 C+'moses-run-store-v1/': 'superseded (inferred): relay v61 NOT READY, READY copy withdrawn; served run cards come from moses-maqaf-weld-run-check-v1 and the per-part toggles the serving-lane spec asked for are served from moses-megacompspan-toggles-v1',
 C+'moses-era-metatoggle-v1/': 'superseded: front page RELABELLED 2026-09-22, read moses-bundled-by-century-v1 instead',
 C+'moses-inplace-order-v1/': 'superseded (inferred): the in-place order continued as moses-inplace-v2.2 (relay v53) and moses-inplace-v2.3',
 C+'moses-piece-gloss-v2/': 'superseded (inferred): served zones read piece gloss v4 (<book>.pg-from-piece-gloss-v4.json in the compspan builds) and mark piece_gloss replaced_by the span ledger',
 'moses-tanakh-mam-restore-v1/': 'superseded (inferred): top-level twin of the 2026-09-03 MAM restore candidate; the site serves restore v5 from moses-ledgers/mam-restore-v5',
 C+'moses-serve-set-v1/': 'superseded (inferred): serve-set v1 and v2; moses-ledgers/serve-set holds v11 and v12',
 C+'moses-search-ledger-v1.8/': 'superseded: NOTE-stopped-pushed-2026-10-09.txt: stopped 3 October before it sealed, never relayed, nothing served; pushed as the record. Search is to be reframed',
 C+'moses-search-ledger-v1.7/': 'superseded: refused by its checker on wording (NOTE in v1.8); v1.8 began after it; never relayed, nothing served',
 C+'moses-deploy-check-v2/': 'superseded: interrupted on 2026-09-25 and never sealed; re-checked by moses-deploy-check-v3 (its front page)',
 C+'moses-compspan-v13.5/': 'superseded: its READY line is in FOR-ELIJAH-v59-first-word.WITHDRAWN-not-sent.md; v13.6 to v13.8 followed; v13.8 is served',
 L+'lattice-v11/': 'superseded: lattice-v12 is served (zones emitted_from.toggles.lattice)',
}
NOT_SUPERSEDED = {  # a "newer version" by name that is not a successor
 'moses-ia-wave-v1/': 'raw source cache: wave 1 of the Internet Archive collection; v2 and v3 are later waves of other items, not replacements',
 'moses-ia-wave-v2/': 'raw source cache: wave 2 of the Internet Archive collection (a different batch from wave 1)',
 'moses-ia-wave-v3/': 'raw source cache: wave 3 of the Internet Archive collection',
 C+'moses-ia-wave-v1/': 'raw source cache: the corpus-lane-builds folder of wave 1 (scripts, census, small files); the 5.49 GB of collected items are at top-level moses-ia-wave-v1/',
 C+'moses-ia-wave-v2/': 'raw source cache: the corpus-lane-builds folder of wave 2 (small files); collected items at top-level moses-ia-wave-v2/',
 C+'moses-ia-wave-v3/': 'raw source cache: the corpus-lane-builds folder of wave 3',
}
unknown_hand = {
 'cas/': 'evidence: 15 archived agent-session logs (.jsonl.zst) named by sha256; disposition/r2-conveyor-closed-codex-child-batch01-a83b83d71608.json records that the local originals were disposed after a full remote rehash, so these are the only copies',
 C+'moses-samaritan-toggle-v1.4/': 'unknown: newest attempt of the Samaritan toggle; relay v57.1 NOT READY; the site serves the v1 overlay',
 C+'moses-inplace-v2.2/': 'unknown: relay v53 READY ("READY OR NOT ... if the owner and you select the column"); v2.3 is newer but says "M-A only", so whether it replaces v2.2 whole is not written',
 L+'maqaf-reseal-v2/': 'unknown: newer than the cited maqaf-reseal-v1; nothing on the site names v2',
}

# ---- roles by name (first match)
RAW = re.compile(r'(ia-wave|raws-v|intake-|-collect-|acquisition|pby-full-wave|tikkunei-zohar|bible-completion|delitzsch|gaster|sword-of-moses|ben-yehuda-v1$|uxlc)')
CENSUS = re.compile(r'(census|audit|probe|diagnosis|-gap-|gap-manifest|loose-ends|crisis|taxonomy|demand|denominator|liveness|external-diff|hygiene|path-scrub|payload-dedup|horizon-plan|acquisition-queue|counted-side|referee|registry|label-provenance|shelf-diagnosis|stream-variant)')
VERIFY = re.compile(r'(deploy-check|counter-verify|delete-ledger|retest-and-rank)')
ANALYSIS = re.compile(r'(fanout|which-order-leads|translit-flag|masoretic-pointing-ledger|prefix-stem|misfiled|row-year-provenance|works-own-stamp|old-witnesses|maqaf-one-hud|one-reading-one-pill|rule-ledgers|rule2-maqaf|rule6|rule8|toggle-ledgers-per-branch|vowel-fold|vowel-tier-cost|999-selection|mam-apparatus|mam-kq|mam-q-and|mam-restoration-source|masorah-finalis|nonword|frame-additions|frame-edges|frame-ship|licence-evidence|compspan-backwards|shelf-lattice|unmerged-cards|source-census|ledger-of-ledgers|say-it-plainly|three-things)')
RELAY = re.compile(r'(r2-backfill|w-ledger-shipment)')
def role_of(u):
    n = u.rstrip('/').split('/')[-1]
    if u in build_of_served: return 'store/ledger (build folder of a served ledger)'
    if u in served or u.startswith('editions-built-v1/'):
        if u.startswith('editions-built-v1/'): return 'built editions (text streams)'
        if u == 'serving-lane/shelf/': return 'serving-lane backup (zone bins)'
        return 'store/ledger (served)'
    if u.startswith('cold/'): return 'evidence (cold)'
    if u.startswith('retired/'): return 'retired record'
    if u.startswith(('serving-lane-handoffs/', 'mishkan/', 'r2-push-suite/', 'disposition/')): return 'relay/handoff/receipt'
    if u in ('MOSES-LEDGER-INDEX.md', C + '(own files)'): return 'index'
    if u == 'frame/': return 'owner frame (spec drafts)'
    if u == 'cas/': return 'content-addressed objects'
    if u.startswith('corpus-staging/'): return 'staging (2026-08-30 cargo)'
    if u == L + '(own files)': return 'relay/handoff/receipt'
    if RAW.search(n): return 'raw source cache'
    if VERIFY.search(n): return 'verification build'
    if CENSUS.search(n): return 'census/audit record'
    if RELAY.search(n): return 'relay/handoff/receipt'
    if ANALYSIS.search(n): return 'analysis ledger'
    return 'store/ledger'

extra = {r['unit_prefix']: r for r in csv.DictReader(open(OUT + '/builds-extra.tsv', encoding='utf-8'), delimiter='\t')}
out = []
for u, r in extra.items():
    role = role_of(u)
    nr = r['newest_own_relay']; nv = r['newer_versions_on_r2']
    if u in served: st, ev = 'current', served[u]
    elif u in cited: st, ev = 'current', cited[u]
    elif u in candidate: st, ev = 'current', candidate[u]
    elif u in superseded_hand: st, ev = 'superseded', superseded_hand[u]
    elif u in NOT_SUPERSEDED: st, ev = 'evidence', NOT_SUPERSEDED[u]
    elif u in unknown_hand: st, ev = (unknown_hand[u].split(':')[0] if unknown_hand[u].split(':')[0] in ('evidence', 'unknown') else 'unknown'), unknown_hand[u]
    elif u.startswith('corpus-staging/'): st, ev = 'evidence', 'staging record: disposition/transfer-shipped-packages-20260830.json names r2:mishkan/corpus-staging the trusted final copy of 210 shipped directories (local originals removed 2026-08-30)'
    elif nv: st, ev = 'superseded', 'newer version on R2: ' + nv + ((' ; newest own relay ' + nr) if nr else '')
    elif 'SUPERSEDED' in nr: st, ev = 'superseded', 'newest own relay ' + nr
    elif role in ('evidence (cold)', 'retired record', 'relay/handoff/receipt', 'index', 'owner frame (spec drafts)', 'staging (2026-08-30 cargo)'):
        st, ev = 'evidence', 'kept as record: ' + role + ('; ' + ('a later copy of serving-lane-handoffs/elijah-welds-v1 (same three file names)' if u.startswith('mishkan/') else '') if u.startswith('mishkan/') else '')
    elif role in ('census/audit record', 'verification build', 'analysis ledger', 'raw source cache'):
        st, ev = 'evidence', role + ': not served or cited by the site, no newer version' + ((' ; newest own relay ' + nr) if nr else '')
    else:
        st, ev = 'unknown', ('newest own relay ' + nr + '; ' if nr else 'no relay; ') + 'not served or cited by the site; no newer version on R2'
    if st == 'current' and role in ('census/audit record', 'analysis ledger', 'raw source cache', 'verification build'):
        pass
    out.append((u, st, role, ev))
with open(OUT + '/status-table.tsv', 'w', encoding='utf-8') as f:
    f.write('# unit_prefix\tstatus\trole\tevidence_for_status  (written by scripts/status_table.py)\n')
    for x in out: f.write('\t'.join(x) + '\n')
import collections
print(collections.Counter(x[1] for x in out))
print(collections.Counter(x[2] for x in out))
missing = [u for u in list(served) + list(cited) + list(candidate) + list(superseded_hand) + list(NOT_SUPERSEDED) + list(unknown_hand) if u not in extra]
print('hand entries naming no unit:', missing)
