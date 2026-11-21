#!/usr/bin/env python3
"""Ship 14, patch 01: the source ledger is named at its address in the store's v2 layout.

data/source-corpus-v1.json named the corpus lane's ledger at its old address
(moses-ledgers/toggle-ledgers-v1/). The same bytes stand at v2/ledgers/all/toggle-ledgers/ (sha256 681b2524...,
43,121 bytes; data/store-path-map-v1.json gives the folder's move). The old layout goes when the store is cleared, so
the record names the address that stays. Run the emit again after this patch.

Usage: python3 patch-01-source-ledger-v2-address.py <reader dir>
"""
import sys
from pathlib import Path

path = Path(sys.argv[1]) / "tools" / "emit-source-corpus-v1.mjs"
src = path.read_text(encoding="utf-8")
old = 'const LEDGER_AT = "r2:mishkan/moses-ledgers/toggle-ledgers-v1/source-corpus-v1.json";'
new = 'const LEDGER_AT = "r2:mishkan/v2/ledgers/all/toggle-ledgers/source-corpus-v1.json";'
assert src.count(old) == 1, src.count(old)
path.write_text(src.replace(old, new), encoding="utf-8")
print("patched", path)
