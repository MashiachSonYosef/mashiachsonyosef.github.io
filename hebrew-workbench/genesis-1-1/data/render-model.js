const U_LEDGER_GENESIS_1_1 = window.HEBREW_U_LEDGER_GENESIS_1_1 || {};
const U_TOKEN_USES = (
  U_LEDGER_GENESIS_1_1.passage &&
  U_LEDGER_GENESIS_1_1.passage.tokenUses
) || [];
const U_RENDER_DEFAULTS = U_LEDGER_GENESIS_1_1.renderDefaults || {};
const U_DEFAULT_WORD_USE = (
  U_TOKEN_USES.find((token) => token.id === U_RENDER_DEFAULTS.wordUseId) ||
  U_TOKEN_USES[0] ||
  {
    id: 'gen-1-1-1',
    c0OccurrenceId: 'C0-BERESHIT-POC-GENESIS-1-1-0001',
    visibleWId: 'W-BERESHIT-POC-0001',
    hebrew: 'בראשית',
    transliteration: 'bereshit'
  }
);

window.HEBREW_RENDER_MODEL = {
  usageLedger: U_LEDGER_GENESIS_1_1,
  defaultCompSpanId: U_RENDER_DEFAULTS.compSpanId || 'B6-R173-BERESHIT-COMPSPAN-0001-WHOLE',
  word: {
    id: U_DEFAULT_WORD_USE.id,
    c0OccurrenceId: U_DEFAULT_WORD_USE.c0OccurrenceId,
    visibleWId: U_DEFAULT_WORD_USE.visibleWId,
    hebrew: U_DEFAULT_WORD_USE.hebrew,
    transliteration: U_DEFAULT_WORD_USE.transliteration
  },
  passage: {
    id: (U_LEDGER_GENESIS_1_1.passage && U_LEDGER_GENESIS_1_1.passage.id) || 'u-genesis-1-1',
    ref: U_LEDGER_GENESIS_1_1.passageRef || 'Genesis 1:1',
    tokens: U_TOKEN_USES.map((token) => ({
      id: token.id,
      c0OccurrenceId: token.c0OccurrenceId,
      visibleWId: token.visibleWId,
      hebrew: token.hebrew,
      transliteration: token.transliteration,
      active: token.renderMaterialized === true,
      defaultCompSpanId: token.defaultCompSpanId,
      compSpanIds: token.compSpanIds || [],
      useStatus: token.renderMaterialized === true ? 'materialized' : 'held',
      materializationReason: token.materializationReason || ''
    })),
    sections: (U_LEDGER_GENESIS_1_1.passage && U_LEDGER_GENESIS_1_1.passage.sections) || []
  },
  compSpans: [
    {
      id: 'B6-R173-BERESHIT-COMPSPAN-0001-WHOLE',
      selectLabel: 'בראשית',
      kindLabel: 'whole span',
      displayLabel: 'בראשית',
      cells: [
        {
          id: 'B6-R173-BERESHIT-CELL-0001-WHOLE',
          hebrew: 'בראשית',
          transliteration: 'bereshit',
          spanKind: 'whole span',
          defaultLBundleId: 'B6-R173-BERESHIT-LBUNDLE-0001',
          lBundles: [
            {
              id: 'B6-R173-BERESHIT-LBUNDLE-0001',
              label: 'in the beginning / initially / at first',
              defaultRouteId: 'B6-R173-BERESHIT-LBUNDLE-0001-R-001',
              routes: [
                { id: 'B6-R173-BERESHIT-LBUNDLE-0001-R-001', text: 'in the beginning' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0001-R-002', text: 'initially' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0001-R-003', text: 'at first' }
              ],
              pProof: {
                id: 'B6-R173-BERESHIT-LBUNDLE-0001-P-001',
                label: 'Exact R-member set',
                relation: 'exact-d-route-set',
                bucketKey: 'at first | in the beginning | initially',
                matchMode: 'Normalize R members as an exact set; ignore separator/order only.',
                mSupportIds: [
                  'B6-R173-BERESHIT-LBUNDLE-0001-M-001',
                  'B6-R173-BERESHIT-LBUNDLE-0001-M-002'
                ]
              },
              mSupports: [
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0001-M-001',
                  label: 'Wiktionary בראשית',
                  title: 'CC BY-SA | Wiktionary בראשית',
                  copy: 'oldid=89472033; entry lines 139-146; license lines 253-254; attribution required; ShareAlike required.'
                },
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0001-M-002',
                  label: 'Exact D repeat proof',
                  title: 'M repeat proof | same D bundle',
                  copy: 'Exact-D repeat proof row for this render: same D bundle, second M support, no derivation and no D text alteration.'
                }
              ]
            },
            {
              id: 'B6-R173-BERESHIT-LBUNDLE-0002',
              label: 'Genesis',
              defaultRouteId: 'B6-R173-BERESHIT-LBUNDLE-0002-R-001',
              routes: [
                { id: 'B6-R173-BERESHIT-LBUNDLE-0002-R-001', text: 'Genesis' }
              ],
              pProof: {
                id: 'B6-R173-BERESHIT-LBUNDLE-0002-P-001',
                label: 'Exact R-member set',
                relation: 'exact-d-route-set',
                bucketKey: 'genesis',
                matchMode: 'Normalize R members as an exact set; ignore separator/order only.',
                mSupportIds: ['B6-R173-BERESHIT-LBUNDLE-0002-M-001']
              },
              mSupports: [
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0002-M-001',
                  label: 'Wiktionary בראשית',
                  title: 'CC BY-SA | Wiktionary בראשית',
                  copy: 'oldid=89472033; entry lines 157-163; license lines 253-254; attribution required; ShareAlike required.'
                }
              ]
            },
            {
              id: 'B6-R173-BERESHIT-LBUNDLE-0006',
              label: 'in the beginning when',
              defaultRouteId: 'B6-R173-BERESHIT-LBUNDLE-0006-R-001',
              routes: [
                { id: 'B6-R173-BERESHIT-LBUNDLE-0006-R-001', text: 'in the beginning when' }
              ],
              pProof: {
                id: 'B6-R173-BERESHIT-LBUNDLE-0006-P-001',
                label: 'Exact R-member set',
                relation: 'exact-d-route-set',
                bucketKey: 'in the beginning when',
                matchMode: 'Normalize R members as an exact set; ignore separator/order only.',
                mSupportIds: ['B6-R173-BERESHIT-LBUNDLE-0006-M-001']
              },
              mSupports: [
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0006-M-001',
                  label: 'Brown-Driver-Briggs H7225',
                  title: 'Public domain | Brown-Driver-Briggs',
                  copy: 'Brown-Driver-Briggs via eliranwong/unabridged-BDB-Hebrew-lexicon; README lines 229-231; raw DictBDB top=H7225; Gen.1.1 note; source attribution retained.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'B6-R173-BERESHIT-COMPSPAN-0002-SPLIT',
      selectLabel: 'ב־ + ראשית',
      kindLabel: 'split span',
      displayLabel: 'ב־ + ראשית',
      isSplit: true,
      cells: [
        {
          id: 'B6-R173-BERESHIT-CELL-0002-CELL1',
          hebrew: 'ב־',
          transliteration: 'b-',
          spanKind: 'prefix span',
          defaultLBundleId: 'B6-R173-BERESHIT-LBUNDLE-0003',
          lBundles: [
            {
              id: 'B6-R173-BERESHIT-LBUNDLE-0003',
              label: 'in / with / during / among',
              defaultRouteId: 'B6-R173-BERESHIT-LBUNDLE-0003-R-001',
              routes: [
                { id: 'B6-R173-BERESHIT-LBUNDLE-0003-R-001', text: 'in' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0003-R-002', text: 'with' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0003-R-003', text: 'during' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0003-R-004', text: 'among' }
              ],
              pProof: {
                id: 'B6-R173-BERESHIT-LBUNDLE-0003-P-001',
                label: 'Exact R-member set',
                relation: 'exact-d-route-set',
                bucketKey: 'among | during | in | with',
                matchMode: 'Normalize R members as an exact set; ignore separator/order only.',
                mSupportIds: ['B6-R173-BERESHIT-LBUNDLE-0003-M-001']
              },
              mSupports: [
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0003-M-001',
                  label: 'Wiktionary ב־',
                  title: 'CC BY-SA | Wiktionary ב־',
                  copy: 'oldid=89024058; entry lines 165-168, 172-178, 179-193, 196-199; license lines 417-418; attribution required; ShareAlike required.'
                }
              ]
            }
          ]
        },
        {
          id: 'B6-R173-BERESHIT-CELL-0003-CELL2',
          hebrew: 'ראשית',
          transliteration: 'reshit',
          spanKind: 'base span',
          defaultLBundleId: 'B6-R173-BERESHIT-LBUNDLE-0005',
          lBundles: [
            {
              id: 'B6-R173-BERESHIT-LBUNDLE-0004',
              label: 'beginning / first / chief / firstfruit',
              defaultRouteId: 'B6-R173-BERESHIT-LBUNDLE-0004-R-001',
              routes: [
                { id: 'B6-R173-BERESHIT-LBUNDLE-0004-R-001', text: 'beginning' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0004-R-002', text: 'first' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0004-R-003', text: 'chief' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0004-R-004', text: 'firstfruit' }
              ],
              pProof: {
                id: 'B6-R173-BERESHIT-LBUNDLE-0004-P-001',
                label: 'Exact R-member set',
                relation: 'exact-d-route-set',
                bucketKey: 'beginning | chief | first | firstfruit',
                matchMode: 'Normalize R members as an exact set; ignore separator/order only.',
                mSupportIds: ['B6-R173-BERESHIT-LBUNDLE-0004-M-001']
              },
              mSupports: [
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0004-M-001',
                  label: 'Wiktionary ראשית',
                  title: 'CC BY-SA | Wiktionary ראשית',
                  copy: 'oldid=88955940; entry lines 137-139 and 137-153; license lines 217-218; attribution required; ShareAlike required.'
                }
              ]
            },
            {
              id: 'B6-R173-BERESHIT-LBUNDLE-0005',
              label: 'beginning / chief',
              defaultRouteId: 'B6-R173-BERESHIT-LBUNDLE-0005-R-001',
              routes: [
                { id: 'B6-R173-BERESHIT-LBUNDLE-0005-R-001', text: 'beginning' },
                { id: 'B6-R173-BERESHIT-LBUNDLE-0005-R-002', text: 'chief' }
              ],
              pProof: {
                id: 'B6-R173-BERESHIT-LBUNDLE-0005-P-001',
                label: 'Exact R-member set',
                relation: 'exact-d-route-set',
                bucketKey: 'beginning | chief',
                matchMode: 'Normalize R members as an exact set; ignore separator/order only.',
                mSupportIds: ['B6-R173-BERESHIT-LBUNDLE-0005-M-001']
              },
              mSupports: [
                {
                  id: 'B6-R173-BERESHIT-LBUNDLE-0005-M-001',
                  label: 'Brown-Driver-Briggs H7225',
                  title: 'Public domain | Brown-Driver-Briggs',
                  copy: 'Brown-Driver-Briggs via eliranwong/unabridged-BDB-Hebrew-lexicon; README lines 229-231; raw DictBDB top=H7225; source attribution retained.'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  ledgerContracts: {
    formula: 'C0 -> W -> COMPspan -> L -> ((D + R) <- P) -> M',
    ledgers: {
      v: 'v-c0-lane-index-2026-07-04.md',
      x: 'a4-x-render-state-ledger-2026-07-04-v12.csv',
      y: 'a5-y-portable-model-ledger-2026-07-03-v11.csv',
      z: 'z-single-agent-a6-crawl-pipeline-2026-07-03-v2.md'
    },
    commentary: {
      defaultMode: 'base_only',
      readinessSource: 'v-x-commentary-render-readiness-summary-2026-07-04.csv',
      summary: {
        commentaryEdgesAudited: 28,
        sourceAndLicenseCleanEdges: 28,
        baseWithCommentarySplitReady: 0,
        commentedSectionsOnlySplitReady: 0,
        commentaryOnlyReady: 0,
        alignmentArtifactRequiredRows: 28,
        sourceTextRowsAppended: 0,
        cleanroomTouched: 0
      },
      modes: [
        {
          id: 'base_only',
          label: 'Base only',
          statusLabel: 'Render enabled',
          enabled: true,
          copy: 'Base text and the selected Bereshit route can render from this local model.'
        },
        {
          id: 'base_with_commentary_split',
          label: 'Base + commentary',
          statusLabel: 'Held: alignment required',
          enabled: false,
          copy: 'Source and license edges are clean, but no accepted alignment artifact is ready for split render.'
        },
        {
          id: 'commented_sections_only_split',
          label: 'Commented sections',
          statusLabel: 'Held: alignment required',
          enabled: false,
          copy: 'The contract has clean commentary edges, but commented-section slicing is not render-ready.'
        },
        {
          id: 'commentary_only',
          label: 'Commentary only',
          statusLabel: 'Held: no materialized text',
          enabled: false,
          copy: 'No commentary source text is materialized into this render repo.'
        }
      ],
      availableEdges: [
        {
          id: 'commentary-rashi-genesis',
          work: 'Rashi on Genesis',
          sectionIds: ['gen-1-1'],
          status: 'source/license clean; alignment held'
        },
        {
          id: 'commentary-ibn-ezra-genesis',
          work: 'Ibn Ezra on Genesis',
          sectionIds: ['gen-1-1'],
          status: 'source/license clean; alignment held'
        },
        {
          id: 'commentary-targum-jonathan-genesis',
          work: 'Targum Jonathan on Genesis',
          sectionIds: ['gen-1-1'],
          status: 'source/license clean; alignment held'
        },
        {
          id: 'commentary-targum-onkelos-genesis',
          work: 'Targum Onkelos on Genesis',
          sectionIds: ['gen-1-1'],
          status: 'source/license clean; alignment held'
        }
      ],
      contractNotes: [
        'Machine summary reports 28 audited commentary edges; contract prose references 51. Treat the machine summary as current until reconciled.',
        'Z is a mutable A6 crawl/control sidecar, not render truth and not a runtime source.'
      ]
    }
  }
};
