#!/bin/bash
# read-only: the sha256 of every file of a reader tree but its build folder, path by path. Usage: tree-manifest.sh <reader dir>
cd ${1:?reader dir} && find . -type f -not -path './build/*' -print0 | sort -z | xargs -0 sha256sum
