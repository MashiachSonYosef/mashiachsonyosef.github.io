param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays',
  [string]$LexicalDir = 'data/lexical'
)

$ErrorActionPreference = 'Stop'

$errors = New-Object System.Collections.Generic.List[string]
$unitIds = @{}
$anchorIds = @{}
$sourceByWorkId = @{}
$unitCountByWorkId = @{}
$slugByWorkId = @{}
$unitIdsByWorkId = @{}

$sourceFiles = @(Get-ChildItem -Path $SourceDir -Filter '*.json')

function Test-ExportFiles {
  param(
    [string]$ExportDir,
    [int]$ExpectedRows,
    [string]$Label
  )

  $csvPath = Join-Path $ExportDir 'overlay-export.csv'
  $jsonPath = Join-Path $ExportDir 'overlay-export.json'
  $mdPath = Join-Path $ExportDir 'overlay-export.md'
  $expectedCsvHeader = '"work_id","work_title","source_ref","anchor_id","translation","translator_notes","done_status","updated_at"'
  $expectedMarkdownHeader = '| work_id | work_title | source_ref | anchor_id | translation | translator_notes | done_status | updated_at |'

  foreach ($path in @($csvPath, $jsonPath, $mdPath)) {
    if (-not (Test-Path $path)) {
      $errors.Add("Missing overlay export for $Label`: $path")
      return
    }
  }

  $csvHeader = Get-Content -Path $csvPath -TotalCount 1 -Encoding UTF8
  if ($csvHeader -ne $expectedCsvHeader) {
    $errors.Add("Unexpected CSV overlay export header for $Label")
  }

  $markdownHeader = Get-Content -Path $mdPath -TotalCount 1 -Encoding UTF8
  if ($markdownHeader -ne $expectedMarkdownHeader) {
    $errors.Add("Unexpected Markdown overlay export header for $Label")
  }

  foreach ($path in @($csvPath, $jsonPath, $mdPath)) {
    $text = Get-Content -Path $path -Raw -Encoding UTF8
    foreach ($placeholder in @('[Awaiting translation]', '[Awaiting notes]', 'Translation pending')) {
      if ($text.Contains($placeholder)) {
        $errors.Add("Overlay export contains placeholder text in $Label`: $placeholder")
      }
    }
    if ($text -match '\bhebrew\b' -or $text -match '\bhebrew_source\b' -or $text -match '\bsource_hebrew\b') {
      $errors.Add("Overlay export appears to include Hebrew/source-body field in $Label`: $path")
    }
  }

  $parsedRows = Get-Content -Path $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $rows = if ($parsedRows -is [array]) { $parsedRows } else { @($parsedRows) }
  if ($rows.Count -ne $ExpectedRows) {
    $errors.Add("Overlay JSON row count mismatch for $Label`: expected $ExpectedRows, found $($rows.Count)")
  }

  $requiredFields = @('work_id', 'work_title', 'source_ref', 'anchor_id', 'translation', 'translator_notes', 'done_status', 'updated_at')
  foreach ($row in $rows) {
    foreach ($field in $requiredFields) {
      if ($row.PSObject.Properties.Name -notcontains $field) {
        $errors.Add("Overlay export row missing $field in $Label")
      }
    }

    foreach ($forbiddenField in @('hebrew', 'english', 'status')) {
      if ($row.PSObject.Properties.Name -contains $forbiddenField) {
        $errors.Add("Overlay export row contains forbidden field $forbiddenField in $Label")
      }
    }

    $translation = if ($null -ne $row.translation) { $row.translation.ToString().Trim() } else { '' }
    $expectedDoneStatus = if ($translation) { 'done' } else { 'not_done' }
    if ($row.done_status -ne $expectedDoneStatus) {
      $errors.Add("Overlay export done_status mismatch for $Label / $($row.anchor_id)")
    }
  }
}

$sourceFiles | ForEach-Object {
  $source = Get-Content -Path $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  $overlayPath = Join-Path $OverlayDir "$($source.work_id).json"
  $sourceByWorkId[$source.work_id] = $source
  $unitCountByWorkId[$source.work_id] = @($source.units).Count
  $slugByWorkId[$source.work_id] = $source.work_slug
  $workUnitIds = @{}

  foreach ($field in @('work_id', 'work_title', 'work_slug', 'sefaria_ref', 'source_system', 'import_date', 'work_type')) {
    if (-not $source.$field) {
      $errors.Add("Missing work field $field in $($_.Name)")
    }
  }

  if ($source.work_type -eq 'commentary') {
    foreach ($field in @('base_work_id', 'base_work_title', 'display_label')) {
      if (-not $source.$field) {
        $errors.Add("Commentary work missing $field in $($source.work_id)")
      }
    }
  } elseif ($source.work_type -ne 'primary_text' -and $source.work_type -ne 'base_text') {
    $errors.Add("Unexpected work_type '$($source.work_type)' in $($source.work_id)")
  }

  if (-not (Test-Path $overlayPath)) {
    $errors.Add("Missing overlay file for $($source.work_id)")
  }

  if (-not $source.outline -or @($source.outline).Count -eq 0) {
    $errors.Add("Missing outline in $($source.work_id)")
  }

  foreach ($unit in $source.units) {
    foreach ($field in @('unit_id', 'anchor_id', 'source_ref', 'license', 'version_title', 'import_date', 'group_title', 'section_title')) {
      if (-not $unit.$field) {
        $errors.Add("Missing $field in $($unit.unit_id)")
      }
    }

    if (-not $unit.hebrew -or @($unit.hebrew).Count -eq 0) {
      $errors.Add("Missing Hebrew in $($unit.unit_id)")
    }

    foreach ($paragraph in @($unit.hebrew)) {
      if (-not $paragraph -or -not $paragraph.ToString().Trim()) {
        $errors.Add("Blank Hebrew paragraph in $($unit.unit_id)")
      }
    }

    if ($unit.PSObject.Properties.Name -contains 'translation' -or
        $unit.PSObject.Properties.Name -contains 'english' -or
        $unit.PSObject.Properties.Name -contains 'strict_translation' -or
        $unit.PSObject.Properties.Name -contains 'clean_translation') {
      $errors.Add("Source unit contains English/translation field: $($unit.unit_id)")
    }

    if ($unitIds.ContainsKey($unit.unit_id)) {
      $errors.Add("Duplicate unit_id: $($unit.unit_id)")
    } else {
      $unitIds[$unit.unit_id] = $true
    }
    $workUnitIds[[string]$unit.unit_id] = $true

    if ($anchorIds.ContainsKey($unit.anchor_id)) {
      $errors.Add("Duplicate anchor_id: $($unit.anchor_id)")
    } else {
      $anchorIds[$unit.anchor_id] = $true
    }
  }
  $unitIdsByWorkId[[string]$source.work_id] = $workUnitIds

  $workPagePath = Join-Path $source.work_slug 'index.html'
  if (Test-Path $workPagePath) {
    $workPage = Get-Content -Path $workPagePath -Raw -Encoding UTF8
    foreach ($badUi in @('progress-panel', 'progress-meter', 'progress-controls', 'filter-button', 'data-filter=', 'data-next-not-done', 'data-complete=', 'Next not done', '% complete')) {
      if ($workPage.Contains($badUi)) {
        $errors.Add("Generated work page contains removed progress UI '$badUi' for $($source.work_id)")
      }
    }
    foreach ($requiredText in @('License')) {
      if (-not $workPage.Contains($requiredText)) {
        $errors.Add("Generated work page missing required text '$requiredText' for $($source.work_id)")
      }
    }
    foreach ($badOverlayText in @('<span class="overlay-label">Translation</span>', '<span class="overlay-label">Translator&rsquo;s Notes</span>', 'English overlay license')) {
      if ($workPage.Contains($badOverlayText)) {
        $errors.Add("Generated work page contains removed overlay UI '$badOverlayText' for $($source.work_id)")
      }
    }
    if ($source.work_type -eq 'commentary') {
      $encodedDisplayLabel = [System.Net.WebUtility]::HtmlEncode($source.display_label)
      if (-not $workPage.Contains($encodedDisplayLabel)) {
        $errors.Add("Generated commentary page missing display label '$($source.display_label)' for $($source.work_id)")
      }
      foreach ($commentaryText in @('Base Text', 'Commentary')) {
        if (-not $workPage.Contains($commentaryText)) {
          $errors.Add("Generated commentary page missing paired panel text '$commentaryText' for $($source.work_id)")
        }
      }
      if (-not ($workPage.Contains('[Base text not imported or not linked yet]') -or $workPage.Contains('Base text is imported. Exact paired ref linking is not implemented yet.'))) {
        $errors.Add("Generated commentary page missing base text paired status for $($source.work_id)")
      }
    }
    if (-not ($workPage.Contains('Hebrew version:') -or $workPage.Contains('Hebrew Version'))) {
      $errors.Add("Generated work page missing Hebrew version metadata for $($source.work_id)")
    }
    foreach ($badText in @('Translatorâ', 'Translation pending', 'Notes / Pressure Words', '[Awaiting translation]', '[Awaiting notes]')) {
      if ($workPage.Contains($badText)) {
        $errors.Add("Generated work page contains disallowed text '$badText' for $($source.work_id)")
      }
    }
  } else {
    $errors.Add("Missing generated work page for $($source.work_id): $workPagePath")
  }
}

$homePagePath = 'index.html'
if (Test-Path $homePagePath) {
  $homePage = Get-Content -Path $homePagePath -Raw -Encoding UTF8
  foreach ($badUi in @('progress-controls', 'filter-button', 'data-work-filter', 'data-work-complete', 'Progress:', 'Not done')) {
    if ($homePage.Contains($badUi)) {
      $errors.Add("Homepage contains removed progress UI '$badUi'")
    }
  }
  foreach ($requiredText in @('Hebrew Source Workbench', 'lexical HUD support')) {
    if (-not $homePage.Contains($requiredText)) {
      $errors.Add("Homepage missing required text '$requiredText'")
    }
  }
  if ($homePage.Contains('Translatorâ')) {
    $errors.Add('Homepage contains raw encoding bug text: Translatorâ')
  }
} else {
  $errors.Add('Missing homepage index.html')
}

$lexiconEntryIds = @{}
$lexiconPath = Join-Path $LexicalDir 'lexicon.json'
if (Test-Path $lexiconPath) {
  $lexicon = Get-Content -Path $lexiconPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $lexiconEntries = @($lexicon.entries)
  if ($lexiconEntries.Count -eq 0 -and $lexicon.PSObject.Properties.Name -contains 'layer_files') {
    foreach ($layer in @($lexicon.layer_files)) {
      if (-not $layer.path) {
        $errors.Add("Lexicon layer missing path: $($layer.layer_id)")
        continue
      }
      $layerPath = Join-Path $LexicalDir ([string]$layer.path)
      if (-not (Test-Path $layerPath)) {
        $errors.Add("Missing lexical source layer file: $layerPath")
        continue
      }
      $layerJson = Get-Content -Path $layerPath -Raw -Encoding UTF8 | ConvertFrom-Json
      foreach ($field in @('schema_version', 'layer_id', 'source_family', 'license', 'entries')) {
        if ($layerJson.PSObject.Properties.Name -notcontains $field) {
          $errors.Add("Lexical source layer missing $field`: $layerPath")
        }
      }
      $lexiconEntries += @($layerJson.entries)
    }
  }
  foreach ($entry in @($lexiconEntries)) {
    foreach ($field in @('entry_id', 'hebrew_word', 'transliteration', 'strict_renderings', 'root', 'root_transliteration', 'root_meaning', 'source_rows')) {
      if ($entry.PSObject.Properties.Name -notcontains $field) {
        $errors.Add("Lexicon entry missing property $field`: $($entry.entry_id)")
      }
    }
    if (-not $entry.entry_id -or -not $entry.hebrew_word) {
      $errors.Add("Lexicon entry missing required identity fields: $($entry.entry_id)")
    }
    if (-not $entry.source_rows -or @($entry.source_rows).Count -eq 0) {
      $errors.Add("Lexicon entry missing source rows: $($entry.entry_id)")
    }
    $lexiconEntryIds[[string]$entry.entry_id] = $true
    foreach ($row in @($entry.source_rows)) {
      foreach ($field in @('source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url', 'fields_used', 'notes')) {
        if (-not $row.$field) {
          $errors.Add("Lexical source row missing $field for $($entry.entry_id)")
        }
      }
      if ($row.source_family -eq 'wiktionary' -or $row.source_family -eq 'kaikki') {
        if ($row.source_name -ne 'Wiktionary via Kaikki') {
          $errors.Add("Kaikki/Wiktionary row has unexpected source_name for $($entry.entry_id): $($row.source_name)")
        }
        if ($row.license -ne 'CC BY-SA 4.0 / GFDL') {
          $errors.Add("Kaikki/Wiktionary row has unexpected license for $($entry.entry_id): $($row.license)")
        }
        if (-not $row.source_url -or -not $row.source_url.ToString().Contains('kaikki.org/dictionary/Hebrew')) {
          $errors.Add("Kaikki/Wiktionary row missing Kaikki source URL for $($entry.entry_id)")
        }
      }
    }
  }
}

$tokenIndexPath = Join-Path $LexicalDir 'token-index.json'
$tokenIndexIds = @{}
if (Test-Path $tokenIndexPath) {
  $tokenIndex = Get-Content -Path $tokenIndexPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $tokenIndexRows = @()
  if ($tokenIndex.PSObject.Properties.Name -contains 'forms') {
    $tokenIndexRows = @($tokenIndex.forms)
  }
  if ($tokenIndexRows.Count -eq 0 -and $tokenIndex.PSObject.Properties.Name -contains 'work_indexes') {
    foreach ($indexFile in @($tokenIndex.work_indexes)) {
      if (-not $indexFile.path) {
        $errors.Add("Token index manifest work index missing path: $($indexFile.work_id)")
        continue
      }
      $indexPath = Join-Path $LexicalDir ([string]$indexFile.path)
      if (-not (Test-Path -LiteralPath $indexPath)) {
        $errors.Add("Missing per-work token index: $indexPath")
        continue
      }
      $workTokenIndex = Get-Content -Path $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
      foreach ($field in @('schema_version', 'work_id', 'work_title', 'work_slug', 'forms')) {
        if ($workTokenIndex.PSObject.Properties.Name -notcontains $field) {
          $errors.Add("Per-work token index missing $field`: $indexPath")
        }
      }
      $tokenIndexRows += @($workTokenIndex.forms)
    }
  }
  foreach ($row in @($tokenIndexRows)) {
    foreach ($field in @('token_index_id', 'surface_word', 'normalized_word', 'status', 'occurrence_count')) {
      if (-not $row.$field) {
        $errors.Add("Token index row missing $field`: $($row.token_index_id)")
      }
    }
    $tokenIndexIds[[string]$row.token_index_id] = $true
    if ($row.status -eq 'matched' -and -not $lexiconEntryIds.ContainsKey([string]$row.lexicon_entry_id)) {
      $errors.Add("Matched token index row references missing lexicon_entry_id $($row.lexicon_entry_id): $($row.token_index_id)")
    }
  }
} else {
  $errors.Add("Missing lexical token index: $tokenIndexPath")
}

$occurrenceDir = Join-Path $LexicalDir 'occurrences'
$lexicalFiles = if (Test-Path $occurrenceDir) { @(Get-ChildItem -Path $occurrenceDir -Filter '*.json') } else { @() }
if ($lexicalFiles.Count -ne $sourceByWorkId.Keys.Count) {
  $errors.Add("Lexical HUD occurrence scope should cover every imported work. Expected $($sourceByWorkId.Keys.Count), found $($lexicalFiles.Count)")
}
$lexicalWorkIds = @{}
foreach ($lexicalFile in $lexicalFiles) {
  $lexical = Get-Content -Path $lexicalFile.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($field in @('schema_version', 'work_id', 'work_title', 'work_slug', 'total_occurrences', 'units')) {
    if (-not $lexical.$field) {
      $errors.Add("Lexical occurrence file missing $field`: $($lexicalFile.Name)")
    }
  }
  if (-not $sourceByWorkId.ContainsKey($lexical.work_id)) {
    $errors.Add("Lexical occurrence file references unknown work_id: $($lexical.work_id)")
    continue
  }
  $lexicalWorkIds[[string]$lexical.work_id] = $true
  $source = $sourceByWorkId[$lexical.work_id]
  $workUnitIds = $unitIdsByWorkId[[string]$lexical.work_id]
  $occurrenceCount = @($lexical.units.PSObject.Properties).Count
  if ($occurrenceCount -ne $unitCountByWorkId[[string]$lexical.work_id]) {
    $errors.Add("Lexical occurrence count mismatch for $($lexical.work_id): expected $($unitCountByWorkId[[string]$lexical.work_id]), found $occurrenceCount")
  }
  $manifestPath = Join-Path $LexicalDir "$($lexical.work_id).manifest.json"
  if (-not (Test-Path $manifestPath)) {
    $errors.Add("Missing external lexical payload manifest for $($lexical.work_id): $manifestPath")
  } else {
    $manifest = Get-Content -Path $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $chunks = @($manifest.chunks)
    if ($chunks.Count -lt 1) {
      $errors.Add("Lexical payload should have at least one external chunk for $($lexical.work_id)")
    }
    if ($lexical.work_id -eq 'orot' -and $chunks.Count -lt 2) {
      $errors.Add("Orot lexical payload should be split into multiple external chunks")
    }
    foreach ($chunk in $chunks) {
      $chunkPath = Join-Path $LexicalDir ([string]$chunk.url)
      if (-not (Test-Path $chunkPath)) {
        $errors.Add("Missing external lexical payload chunk for $($lexical.work_id): $chunkPath")
        continue
      }
      $chunkJson = Get-Content -Path $chunkPath -Raw -Encoding UTF8 | ConvertFrom-Json
      foreach ($field in @('schema_version', 'chunk_id', 'token_index', 'lexicon', 'source_rows')) {
        if ($chunkJson.PSObject.Properties.Name -notcontains $field) {
          $errors.Add("Lexical chunk missing $field for $($lexical.work_id): $chunkPath")
        }
      }
    }
  }
  foreach ($unitProperty in @($lexical.units.PSObject.Properties)) {
    $unitOccurrence = $unitProperty.Value
    if ($null -eq $workUnitIds -or -not $workUnitIds.ContainsKey([string]$unitOccurrence.unit_id)) {
      $errors.Add("Lexical occurrence references missing source unit: $($unitOccurrence.unit_id)")
      continue
    }
    foreach ($field in @('unit_id', 'anchor_id', 'source_ref', 'paragraphs')) {
      if (-not $unitOccurrence.$field) {
        $errors.Add("Lexical unit occurrence missing $field`: $($unitProperty.Name)")
      }
    }
    foreach ($paragraph in @($unitOccurrence.paragraphs)) {
      if ($paragraph.PSObject.Properties.Name -contains 'tokens') {
        $errors.Add("Lexical paragraph still contains verbose token objects: $($unitOccurrence.unit_id)")
      }
      if ($paragraph.PSObject.Properties.Name -notcontains 'token_index_ids') {
        $errors.Add("Lexical paragraph missing token_index_ids: $($unitOccurrence.unit_id)")
        continue
      }
      foreach ($tokenIndexId in @($paragraph.token_index_ids)) {
        if (-not $tokenIndexIds.ContainsKey([string]$tokenIndexId)) {
          $errors.Add("Lexical paragraph references missing token_index_id $tokenIndexId`: $($unitOccurrence.unit_id)")
        }
      }
    }
  }

  $lexicalPagePath = Join-Path $source.work_slug 'index.html'
  if (Test-Path $lexicalPagePath) {
    $lexicalPage = Get-Content -Path $lexicalPagePath -Raw -Encoding UTF8
    foreach ($requiredText in @('data-lexical-occurrences', 'data-lexical-config', 'data-lexical-slot', 'data-lexical-hud', 'Clicked Hebrew form', 'Breakdown', 'Potential options', 'Related options', 'Sources / licenses', 'No lexical entry yet.')) {
      if (-not $lexicalPage.Contains($requiredText)) {
        $errors.Add("Lexical target page missing required text '$requiredText' for $($lexical.work_id)")
      }
    }
    if (-not ($lexicalPage.Contains('Show more') -or $lexicalPage.Contains('Show potential options'))) {
      $errors.Add("Lexical target page missing option expansion text for $($lexical.work_id)")
    }
    if (-not ($lexicalPage.Contains('allowLowConfidenceFallback') -or $lexicalPage.Contains('Show related options'))) {
      $errors.Add("Lexical target page missing secondary expansion text for $($lexical.work_id)")
    }
    if (-not ($lexicalPage.Contains('Strict Hebrew') -or $lexicalPage.Contains('Strict renderings'))) {
      $errors.Add("Lexical target page missing strict-rendering label for $($lexical.work_id)")
    }
    if (-not $lexicalPage.Contains('Potential options')) {
      $errors.Add("Lexical target page missing potential-options label for $($lexical.work_id)")
    }
    foreach ($embeddedPayloadMarker in @('data-lexical-token-index>', 'data-lexical-lexicon>')) {
      if ($lexicalPage.Contains($embeddedPayloadMarker)) {
        $errors.Add("Lexical target page still embeds full lexical payload marker '$embeddedPayloadMarker' for $($lexical.work_id)")
      }
    }
    if ($lexical.work_id -eq 'orot' -and -not $lexicalPage.Contains('<span class="hud-badge">Lexical layer active</span>')) {
      $errors.Add("Orot page missing visible HUD coverage indicators")
    }
    if ($lexicalPage.Contains('data-lexical-json')) {
      $errors.Add("Lexical target page contains stale per-occurrence lexical JSON for $($lexical.work_id)")
    }
    foreach ($badText in @('Genesis 1:1 Lexical HUD', 'lexical/genesis-1-1', 'machine_draft_translation', 'Translatorâ')) {
      if ($lexicalPage.Contains($badText)) {
        $errors.Add("Lexical proof target page contains disallowed text '$badText'")
      }
    }
  } else {
    $errors.Add("Missing lexical proof target page: $lexicalPagePath")
  }
}

foreach ($workId in $sourceByWorkId.Keys) {
  if (-not $lexicalWorkIds.ContainsKey([string]$workId)) {
    $errors.Add("Missing lexical occurrence file for imported work: $workId")
  }
}

foreach ($workId in $sourceByWorkId.Keys) {
  Test-ExportFiles -ExportDir $slugByWorkId[$workId] -ExpectedRows $unitCountByWorkId[$workId] -Label $workId
}

Test-ExportFiles -ExportDir '.' -ExpectedRows $unitIds.Count -Label 'full-site'

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "Validation passed. $($unitIds.Count) source units checked."
