# Agent 7 Session Shape Rule

Generated: 2026-06-01T09:45:00-04:00

## Decision

Adopt the user's session-shape rule:

- Agent 7: about 20-minute CEO mission sessions.
- Agent 6: chooses his own validation session length.
- Agent 5: chooses his own coordinator session length.
- Agents 1-4: no scheduled pulses; when Agent 5 prompts them, that prompt should be treated as an 8-hour work assignment.

## Interpretation

This cannot guarantee a literal wall-clock runtime, but it changes the operating contract. Short prompts are avoided. Workers 1-4 should receive rare, durable assignments that carry a long work block. Agent 5 should not send quick follow-ups. Agent 7 should stay short and decisive.

## Cost Policy

- Agent 5 sends no prompt to an already-active worker.
- Agent 1-4 prompts should be written so the worker can continue without new prompting until blocked or done.
- Agent 6 validates as much as needed, but does not approve unvalidated evidence.
- Agent 7 avoids broad file reading unless a CEO decision requires it.

## Current Gates

- Publication remains blocked_no_render.
- Source/provenance remains blocked by direct 55 untracked source JSON files vs audit 13.
- Reader Workbench remains accepted only for eight included pages.
- Definition Workbench remains blocked for UI/authority until machine-derived verified is renamed or split from reviewed authority.
