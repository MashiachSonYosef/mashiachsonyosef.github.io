#!/bin/bash
# The tools this round changed, and the page script, linted for faults: undefined names, unused names, unreachable code.
# bash lint-changed.sh <reader dir> <reference reader dir>
# Lists every finding in a file this round changed that the reference copy of that file did not have.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R="$1"; REF="$2"
cd "$S/v29" || exit 1
rm -rf lint/tools lint/tools-ref && mkdir -p lint/tools lint/tools-ref
changed=$(cd "$R" && { git diff --relative --name-only HEAD -- tools; git ls-files --others --exclude-standard -- tools; } | grep '\.mjs$' | sort -u)
for f in $changed; do
  cp "$R/$f" "lint/tools/$(basename "$f")"
  [ -f "$REF/$f" ] && cp "$REF/$f" "lint/tools-ref/$(basename "$f")"
done
# the config lints lint/tools/**: the reference copies are linted from the same folder name, in turn
npx eslint -c eslint.config.mjs "lint/tools/*.mjs" -f json -o lint/changed-now.json 2>/dev/null
mv lint/tools lint/tools-now && mv lint/tools-ref lint/tools
if ls lint/tools/*.mjs > /dev/null 2>&1; then npx eslint -c eslint.config.mjs "lint/tools/*.mjs" -f json -o lint/changed-ref.json 2>/dev/null; else echo "[]" > lint/changed-ref.json; fi
mv lint/tools lint/tools-ref && mv lint/tools-now lint/tools
node -e '
const fs=require("fs"),path=require("path");
const load=(p)=>{const m=new Map();for(const r of JSON.parse(fs.readFileSync(p,"utf8")))m.set(path.basename(r.filePath),r.messages);return m;};
const now=load("lint/changed-now.json"),ref=load("lint/changed-ref.json");
let files=0,neu=0;
for(const [f,ms] of [...now].sort()){files+=1;
  const had=new Map();for(const m of ref.get(f)||[]){const k=(m.ruleId||"parse")+"|"+m.message;had.set(k,(had.get(k)||0)+1);}
  for(const m of ms){const k=(m.ruleId||"parse")+"|"+m.message;if(had.get(k)){had.set(k,had.get(k)-1);continue;}neu+=1;console.log("  NEW "+f+":"+m.line+" · "+(m.ruleId||"parse")+" · "+m.message.slice(0,150));}}
console.log(files+" changed tools linted · "+neu+" findings the reference copies did not have");'
