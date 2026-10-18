# Run order for the files-first design's numbers (all read-only on R2; 02 needs the 17 example objects
# fetched first with r2get.mjs and HEADed with meta/hazards/scripts/r2head.mjs, then the downloads deleted).
python3 -I 01-tables.py        # out/01-numbers.json, out/01-examples.tsv
python3 -I 02-hash-examples.py # out/02-examples-hashed.json, out/02-build-digest.json
python3 -I 03-model-meta.py    # out/03-model-numbers.json (model file deleted after measuring)
python3 -I 04-keep-sets.py     # out/04-keep-sets.json (needs _units.py)
