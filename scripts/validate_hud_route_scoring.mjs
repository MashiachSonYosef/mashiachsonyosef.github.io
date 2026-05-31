#!/usr/bin/env node
import assert from 'node:assert/strict';

import { compareCards, rankCard } from './build_hud_route_lookup.mjs';

function card({
  id,
  displaySection,
  routeType = displaySection,
  rawScore,
  adjustedScore,
  answerScore,
  confidencePercent,
}) {
  return {
    card_id: id,
    display_section: displaySection,
    route_type: routeType,
    raw_score: rawScore,
    adjusted_score: adjustedScore,
    answer_score: answerScore,
    confidence_percent: confidencePercent,
  };
}

const strictWeak = card({
  id: 'strict-73',
  displaySection: 'strict_hebrew',
  rawScore: 73,
  adjustedScore: 73,
});

const paraphraseStrong = card({
  id: 'paraphrase-98-minus-20',
  displaySection: 'biblical_paraphrase_evidence',
  routeType: 'biblical_paraphrase_evidence',
  rawScore: 98,
  adjustedScore: 78,
});

const strictStrong = card({
  id: 'strict-90',
  displaySection: 'strict_hebrew',
  rawScore: 90,
  adjustedScore: 90,
});

const lemmaPerfect = card({
  id: 'lemma-100-minus-20',
  displaySection: 'lemma',
  rawScore: 100,
  adjustedScore: 80,
});

const phraseEvidence = card({
  id: 'phrase-evidence-no-score',
  displaySection: 'phrase_evidence',
  routeType: 'phrase_evidence',
  confidencePercent: 100,
});

assert.equal(
  [strictWeak, paraphraseStrong].sort(compareCards)[0].card_id,
  'paraphrase-98-minus-20',
  'a 98 raw paraphrase should beat a 73 strict route after the 20 point handicap',
);

assert.equal(
  [lemmaPerfect, strictStrong].sort(compareCards)[0].card_id,
  'strict-90',
  'a 90 strict route should beat a 100 raw lemma after the 20 point handicap',
);

assert.equal(
  [phraseEvidence, strictWeak].sort(compareCards)[0].card_id,
  'strict-73',
  'unscored phrase evidence should not outrank scored definition routes',
);

assert.deepEqual(
  rankCard(paraphraseStrong).slice(0, 2),
  [-78, -98],
  'rank should sort adjusted score first, then raw score',
);

console.log('HUD route scoring validation passed.');
