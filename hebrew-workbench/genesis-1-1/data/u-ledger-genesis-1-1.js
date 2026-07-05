window.HEBREW_U_LEDGER_GENESIS_1_1 = {
  id: 'U-GENESIS-1-1-RENDER-POINTER-0001',
  ledgerKind: 'render_usage_pointer',
  version: '2026-07-05-v4',
  passageRef: 'Genesis 1:1',
  contractFormula: 'C0 -> W -> COMPspan -> L -> ((D + R) <- P) -> M',
  ownership: {
    repo: 'hebrew workbench - render1',
    role: 'derived render pointer',
    authorityRepoMode: 'read_only',
    createsAuthorityRows: false,
    importsSourceText: false,
    acceptsLicenseOrDisplay: false,
    mutatesD: false,
    derivesDefinitions: false
  },
  sourcePointers: {
    xRenderState: {
      pointer: '.agents/a4-x-render-state-ledger-current.json',
      currentPointer: '.agents/a4-x-render-state-ledger-2026-07-04-v12.json',
      status: 'PASS_A4_X_RENDER_STATE_LEDGER_V12',
      validation: 'ledgers/work/bosser6/validations/a4-x-render-state-ledger-2026-07-04-v12-validation.json'
    },
    bereshitActiveModelSidecar: {
      pointer: '.agents/bosser-6-round173-bereshit-active-model-sidecar-current.json',
      currentPointer: '.agents/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1.json',
      status: 'PASS_BOSSER6_ROUND173_BERESHIT_ACTIVE_MODEL_SIDECAR',
      validation: 'ledgers/work/bosser6/validations/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-validation.json'
    },
    bereshitControlContract: {
      pointer: '.agents/bosser-6-round245-bereshit-sidecar-current-control-contract-current.json',
      currentPointer: '.agents/bosser-6-round245-bereshit-sidecar-current-control-contract-2026-07-03-v1.json',
      status: 'PASS_BOSSER6_ROUND245_BERESHIT_SIDECAR_CURRENT_CONTROL_CONTRACT',
      validation: 'ledgers/work/bosser6/validations/bosser-6-round245-bereshit-sidecar-current-control-contract-2026-07-03-v1-validation.json'
    }
  },
  sidecarInputs: {
    bereshit: {
      c0OccurrenceId: 'C0-BERESHIT-POC-GENESIS-1-1-0001',
      visibleWId: 'W-BERESHIT-POC-0001',
      compSpansCsv: 'ledgers/work/bosser6/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-comp-spans.csv',
      compCellsCsv: 'ledgers/work/bosser6/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-comp-cells.csv',
      lBundlesCsv: 'ledgers/work/bosser6/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-l-bundles.csv',
      dComponentsCsv: 'ledgers/work/bosser6/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-d-components.csv',
      rRoutesCsv: 'ledgers/work/bosser6/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-r-routes.csv',
      mSupportsCsv: 'ledgers/work/bosser6/bosser-6-round173-bereshit-active-model-sidecar-2026-07-03-v1-m-supports.csv',
      exactDCollapseAuditCsv: 'ledgers/work/bosser6/bosser-6-round245-bereshit-sidecar-current-control-contract-2026-07-03-v1-exact-d-collapse-audit.csv',
      mDropdownProofCsv: 'ledgers/work/bosser6/bosser-6-round245-bereshit-sidecar-current-control-contract-2026-07-03-v1-m-dropdown-proof.csv',
      selectedGlossContractCsv: 'ledgers/work/bosser6/bosser-6-round245-bereshit-sidecar-current-control-contract-2026-07-03-v1-selected-gloss-r-contract.csv',
      counts: {
        compSpans: 2,
        compCells: 3,
        lBundles: 6,
        dComponents: 15,
        rRoutes: 15,
        mSupports: 6,
        exactDCollapseGroups: 6,
        currentMultiMExamples: 0
      }
    }
  },
  passage: {
    id: 'u-genesis-1-1',
    ref: 'Genesis 1:1',
    sections: [
      {
        id: 'gen-1-1',
        ref: 'Genesis 1:1',
        label: 'GENESIS 1:1',
        commentaryEdgeIds: [
          'commentary-rashi-genesis',
          'commentary-ibn-ezra-genesis',
          'commentary-targum-jonathan-genesis',
          'commentary-targum-onkelos-genesis'
        ]
      }
    ],
    tokenUses: [
      {
        id: 'gen-1-1-1',
        anchorId: 'word-section-gen-1-1-1',
        c0OccurrenceId: 'C0-BERESHIT-POC-GENESIS-1-1-0001',
        visibleWId: 'W-BERESHIT-POC-0001',
        hebrew: 'בראשית',
        transliteration: 'bereshit',
        renderMaterialized: true,
        defaultCompSpanId: 'B6-R173-BERESHIT-COMPSPAN-0001-WHOLE',
        compSpanIds: [
          'B6-R173-BERESHIT-COMPSPAN-0001-WHOLE',
          'B6-R173-BERESHIT-COMPSPAN-0002-SPLIT'
        ],
        materializationReason: 'Validated Bereshit sidecar has COMPspan/L/D/R/M rows.'
      },
      {
        id: 'gen-1-1-2',
        anchorId: 'word-section-gen-1-1-2',
        hebrew: 'ברא',
        transliteration: 'bara',
        renderMaterialized: false,
        compSpanCandidateIds: ['U-GEN-1-1-CAND-0002-WHOLE'],
        materializationReason: 'This word is waiting for a validated ledger card before it can render.'
      },
      {
        id: 'gen-1-1-3',
        anchorId: 'word-section-gen-1-1-3',
        hebrew: 'אלהים',
        transliteration: 'elohim',
        renderMaterialized: false,
        compSpanCandidateIds: ['U-GEN-1-1-CAND-0003-WHOLE'],
        materializationReason: 'This word is waiting for a validated ledger card before it can render.'
      },
      {
        id: 'gen-1-1-4',
        anchorId: 'word-section-gen-1-1-4',
        hebrew: 'את',
        transliteration: 'et',
        renderMaterialized: false,
        compSpanCandidateIds: ['U-GEN-1-1-CAND-0004-WHOLE'],
        materializationReason: 'This word is waiting for a validated ledger card before it can render.'
      },
      {
        id: 'gen-1-1-5',
        anchorId: 'word-section-gen-1-1-5',
        hebrew: 'השמים',
        transliteration: 'hashamayim',
        renderMaterialized: false,
        compSpanCandidateIds: [
          'U-GEN-1-1-CAND-0005-WHOLE',
          'U-GEN-1-1-CAND-0005-SPLIT-ARTICLE-BASE'
        ],
        materializationReason: 'This word is waiting for a validated ledger card before it can render.'
      },
      {
        id: 'gen-1-1-6',
        anchorId: 'word-section-gen-1-1-6',
        hebrew: 'ואת',
        transliteration: 've-et',
        renderMaterialized: false,
        compSpanCandidateIds: [
          'U-GEN-1-1-CAND-0006-WHOLE',
          'U-GEN-1-1-CAND-0006-SPLIT-CONJUNCTION-MARKER'
        ],
        materializationReason: 'This word is waiting for a validated ledger card before it can render.'
      },
      {
        id: 'gen-1-1-7',
        anchorId: 'word-section-gen-1-1-7',
        hebrew: 'הארץ:',
        transliteration: 'haaretz',
        renderMaterialized: false,
        compSpanCandidateIds: [
          'U-GEN-1-1-CAND-0007-WHOLE',
          'U-GEN-1-1-CAND-0007-SPLIT-ARTICLE-BASE'
        ],
        materializationReason: 'This word is waiting for a validated ledger card before it can render.'
      }
    ]
  },
  compSpanCandidateScaffold: {
    lane: 'render_pointer_gap',
    authorityStatus: 'candidate_only_not_accepted',
    rule: 'Whole-word slots are mechanical from W; split slots are shape candidates pending importer validation.',
    blocksD: true,
    blocksR: true,
    blocksM: true,
    candidateIdsAreAuthorityRows: false,
    candidates: [
      {
        id: 'U-GEN-1-1-CAND-0002-WHOLE',
        tokenUseId: 'gen-1-1-2',
        displayLabel: 'ברא',
        status: 'mechanical_whole_slot_pending_card',
        compSpanKind: 'whole',
        cells: [
          { role: 'whole', hebrew: 'ברא', transliteration: 'bara' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0003-WHOLE',
        tokenUseId: 'gen-1-1-3',
        displayLabel: 'אלהים',
        status: 'mechanical_whole_slot_pending_card',
        compSpanKind: 'whole',
        cells: [
          { role: 'whole', hebrew: 'אלהים', transliteration: 'elohim' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0004-WHOLE',
        tokenUseId: 'gen-1-1-4',
        displayLabel: 'את',
        status: 'mechanical_whole_slot_pending_card',
        compSpanKind: 'whole',
        cells: [
          { role: 'whole', hebrew: 'את', transliteration: 'et' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0005-WHOLE',
        tokenUseId: 'gen-1-1-5',
        displayLabel: 'השמים',
        status: 'mechanical_whole_slot_pending_card',
        compSpanKind: 'whole',
        cells: [
          { role: 'whole', hebrew: 'השמים', transliteration: 'hashamayim' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0005-SPLIT-ARTICLE-BASE',
        tokenUseId: 'gen-1-1-5',
        displayLabel: 'ה־ + שמים',
        status: 'split_shape_candidate_pending_validation',
        compSpanKind: 'split',
        cells: [
          { role: 'article', hebrew: 'ה־', transliteration: 'ha-' },
          { role: 'base', hebrew: 'שמים', transliteration: 'shamayim' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0006-WHOLE',
        tokenUseId: 'gen-1-1-6',
        displayLabel: 'ואת',
        status: 'mechanical_whole_slot_pending_card',
        compSpanKind: 'whole',
        cells: [
          { role: 'whole', hebrew: 'ואת', transliteration: 've-et' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0006-SPLIT-CONJUNCTION-MARKER',
        tokenUseId: 'gen-1-1-6',
        displayLabel: 'ו־ + את',
        status: 'split_shape_candidate_pending_validation',
        compSpanKind: 'split',
        cells: [
          { role: 'conjunction', hebrew: 'ו־', transliteration: 've-' },
          { role: 'object-marker', hebrew: 'את', transliteration: 'et' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0007-WHOLE',
        tokenUseId: 'gen-1-1-7',
        displayLabel: 'הארץ',
        status: 'mechanical_whole_slot_pending_card',
        compSpanKind: 'whole',
        cells: [
          { role: 'whole', hebrew: 'הארץ', transliteration: 'haaretz' }
        ]
      },
      {
        id: 'U-GEN-1-1-CAND-0007-SPLIT-ARTICLE-BASE',
        tokenUseId: 'gen-1-1-7',
        displayLabel: 'ה־ + ארץ',
        status: 'split_shape_candidate_pending_validation',
        compSpanKind: 'split',
        cells: [
          { role: 'article', hebrew: 'ה־', transliteration: 'ha-' },
          { role: 'base', hebrew: 'ארץ', transliteration: 'eretz' }
        ]
      }
    ],
    summary: {
      pendingTokenUses: 6,
      candidateCompSpans: 9,
      mechanicalWholeSlots: 6,
      splitShapeCandidates: 3,
      acceptedPendingCompSpans: 0
    }
  },
  importerGapReport: {
    lane: 'genesis_1_1_render_pointer_gap',
    status: 'needs_c0_importer_outputs',
    missingTokenUseIds: [
      'gen-1-1-2',
      'gen-1-1-3',
      'gen-1-1-4',
      'gen-1-1-5',
      'gen-1-1-6',
      'gen-1-1-7'
    ],
    requiredOutputsPerToken: [
      'c0OccurrenceId',
      'visibleWId',
      'acceptedCompSpanRows',
      'defaultCompSpanId',
      'lBundleRows',
      'dBundleRows',
      'rRouteRows',
      'pExactRouteSetProof',
      'mSourceLicenseRows',
      'renderCardSidecarPointer',
      'validationPointerAndStatus'
    ],
    nonDerivationRules: [
      'Do not derive English from Hebrew shape candidates.',
      'Do not accept split candidates without importer validation.',
      'Do not render L/D/R/M from candidate-only COMPspan rows.',
      'D remains immutable; R selects exactly one D member; P proves exact R inventory; M attaches source/license.'
    ]
  },
  renderDefaults: {
    wordUseId: 'gen-1-1-1',
    compSpanId: 'B6-R173-BERESHIT-COMPSPAN-0001-WHOLE',
    wholeCompSpanId: 'B6-R173-BERESHIT-COMPSPAN-0001-WHOLE',
    splitCompSpanId: 'B6-R173-BERESHIT-COMPSPAN-0002-SPLIT'
  },
  materializationSummary: {
    totalTokenUses: 7,
    materializedTokenUses: 1,
    heldTokenUses: 6,
    materializedUseIds: ['gen-1-1-1'],
    heldUseIds: [
      'gen-1-1-2',
      'gen-1-1-3',
      'gen-1-1-4',
      'gen-1-1-5',
      'gen-1-1-6',
      'gen-1-1-7'
    ]
  }
};

window.HEBREW_U_LEDGER = window.HEBREW_U_LEDGER_GENESIS_1_1;
