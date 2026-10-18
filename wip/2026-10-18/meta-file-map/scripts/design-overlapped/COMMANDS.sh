# Run order for the design-overlapped prototype (18 October 2026). R2 access was READ ONLY: GET and HEAD.
# Credentials were loaded inside each shell command with:  set -a; . $S/r2.env; set +a   (never printed).
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
D=$S/meta/design-overlapped

# 1. Download one key per distinct old-witness table (5 contents, 205,739,625 bytes) and 3 small examples (GET only)
#    node $S/r2get.mjs $D/dl <keys...>                         (see out/list.tsv and out/example-keys.txt)
# 2. HEAD the example keys for their stored metadata (HEAD only)
#    node $S/meta/hazards/scripts/r2head.mjs $D/out/example-keys.txt $D/out/example-heads.jsonl 4
# 3. Prototype store, first-seen chunk order (writes out/proto)
python3 -I $D/scripts/10-ingest-proto.py $D/out/proto $D/out/list.tsv
# 4. Variants: chunk size and pack order
python3 -I $D/scripts/11-ingest-variants.py $D/out/v-m31-pos   $D/out/list.tsv 31 4096 65536 pos   6
python3 -I $D/scripts/11-ingest-variants.py $D/out/v-m7-first  $D/out/list.tsv 7  1024 65536 first 6
python3 -I $D/scripts/11-ingest-variants.py $D/out/v-m7-pos    $D/out/list.tsv 7  1024 65536 pos   6
# 5. Baseline: each table inflated and xz -6 on its own
#    for f in <the 5 local .gz>; do gzip -dc "$f" | xz -6 -T1 -c | wc -c; done > $D/out/baseline-xz6.tsv
# 6. Independent rebuild in Node of all 5 contents from the store, byte for byte
node $D/scripts/20-rebuild-proto.mjs $D/out/v-m31-pos
# 7. Codec: Node brotli in independent 8 MiB blocks, against xz in 8 MiB blocks
node $D/scripts/21-codec-test.mjs $D/out/v-m31-pos 8 > $D/out/codec-brotli.json
#    xz -dc $D/out/v-m31-pos/pack.xz | xz -6 --block-size=8MiB -T1 -c | wc -c > $D/out/codec-xz-blocks.txt
# 8. Row diffs: full-file (12) and read off the store's recipes (13)
#    python3 -I $D/scripts/12-row-diff.py $D/out/diff-v2-to-v2.4.json <v2.gz> <v2.4.gz>     (and v2->v2.1, v2.1->v2.2)
python3 -I $D/scripts/13-diff-from-recipes.py $D/out/v-m31-pos 49a605e92f25bd12a06dacdfe1d53e7f2948fb59fd153d7c929f3f83b5c8a2a2 ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad $D/out/recipe-diff-v2-to-v2.4.json
python3 -I $D/scripts/13-diff-from-recipes.py $D/out/v-m31-pos 8141d06e3c63c0813b2119cd034ac806007f888ad38b8b2ddf048258a6860a5d 1cae3e5aaac21112664150a59dc27bc330718523f0623c09f6c70b9805841ddc $D/out/recipe-diff-v2.1-to-v2.2.json
# 9. Draft of the per-key part of the meta file for all 512,809 keys (no network)
python3 -I $D/scripts/30-keys-draft.py $D/out/keys $S/meta/hazards/bucket-etag.tsv \
  $S/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv \
  $S/meta/census/nested-copies.tsv $S/meta/census/builds.tsv
# 10. Clean-up: dl/ (197 MB) deleted; packs and chunk tables of proto, v-m7-first, v-m7-pos deleted.
#     out/v-m31-pos (27 MB) kept so steps 6-8 can be rerun; it may be deleted.
