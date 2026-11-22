#!/bin/bash
# The state of the sandbox's working tree in one hash: every changed tracked file's diff and every new file's bytes.
cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s12 || exit 1
{ git diff --binary; git ls-files --others --exclude-standard -z | sort -z | xargs -0 sha256sum; } | sha256sum | cut -c1-64
