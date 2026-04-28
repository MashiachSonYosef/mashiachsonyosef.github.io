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

  foreach ($field in @('work_id', 'work_title', 'work_slug', 'sefaria_ref', 'source_system', 'import_date')) {
    if (-not $source.$field) {
      $errors.Add("Missing work field $field in $($_.Name)")
    }
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

    if ($anchorIds.ContainsKey($unit.anchor_id)) {
      $errors.Add("Duplicate anchor_id: $($unit.anchor_id)")
    } else {
      $anchorIds[$unit.anchor_id] = $true
    }
  }

  $workPagePath = Join-Path $source.work_slug 'index.html'
  if (Test-Path $workPagePath) {
    $workPage = Get-Content -Path $workPagePath -Raw -Encoding UTF8
    foreach ($requiredText in @('License', 'CC0 1.0 Universal', 'Translation', 'Translator&rsquo;s Notes')) {
      if (-not $workPage.Contains($requiredText)) {
        $errors.Add("Generated work page missing required text '$requiredText' for $($source.work_id)")
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
  foreach ($requiredText in @('CC0 1.0 Universal', 'Full overlay export:', 'data-work-filter="done"', 'data-work-filter="not-done"')) {
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

$lexicalSamplePath = Join-Path $LexicalDir 'genesis-1-1.json'
if (Test-Path $lexicalSamplePath) {
  $lexical = Get-Content -Path $lexicalSamplePath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($lexical.source_ref -ne 'Genesis 1:1') {
    $errors.Add('Lexical proof of concept is not scoped to Genesis 1:1')
  }
  if (@($lexical.words).Count -ne 7) {
    $errors.Add("Genesis 1:1 lexical proof of concept should contain 7 words, found $(@($lexical.words).Count)")
  }
  foreach ($word in @($lexical.words)) {
    foreach ($field in @('token_id', 'hebrew_word', 'transliteration', 'strict_renderings', 'root', 'root_transliteration', 'root_meaning', 'source_rows')) {
      if (-not $word.$field) {
        $errors.Add("Lexical word missing $field`: $($word.token_id)")
      }
    }
    foreach ($row in @($word.source_rows)) {
      foreach ($field in @('source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url', 'fields_used', 'notes')) {
        if (-not $row.$field) {
          $errors.Add("Lexical source row missing $field for $($word.token_id)")
        }
      }
      if ($row.source_family -eq 'wiktionary' -or $row.source_family -eq 'kaikki') {
        $errors.Add("Lexical proof of concept includes disallowed Wiktionary/Kaikki row for $($word.token_id)")
      }
    }
  }

  $lexicalPagePath = 'lexical/genesis-1-1/index.html'
  if (Test-Path $lexicalPagePath) {
    $lexicalPage = Get-Content -Path $lexicalPagePath -Raw -Encoding UTF8
    foreach ($requiredText in @('Genesis 1:1 Lexical HUD Proof of Concept', 'Hebrew word', 'Transliteration', 'Strict renderings', 'Root', 'Root transliteration', 'Root meaning', 'CC BY 4.0', 'CC0')) {
      if (-not $lexicalPage.Contains($requiredText)) {
        $errors.Add("Lexical proof page missing required text '$requiredText'")
      }
    }
    foreach ($badText in @('Kaikki', 'Wiktionary', 'machine_draft_translation', 'Translatorâ')) {
      if ($lexicalPage.Contains($badText)) {
        $errors.Add("Lexical proof page contains disallowed text '$badText'")
      }
    }
  } else {
    $errors.Add("Missing lexical proof page: $lexicalPagePath")
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
