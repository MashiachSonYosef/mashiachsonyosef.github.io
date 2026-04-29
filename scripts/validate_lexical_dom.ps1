$ErrorActionPreference = 'Stop'

$unitId = 'orot-lights-from-darkness-lights-of-rebirth-70-5'
$htmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
$occurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
$tokenIndexPath = Join-Path $PSScriptRoot '..\data\lexical\token-index.json'
$lexiconPath = Join-Path $PSScriptRoot '..\data\lexical\lexicon.json'

foreach ($path in @($htmlPath, $occurrencePath, $tokenIndexPath, $lexiconPath)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Required lexical validation file not found: $path"
  }
}

$occurrences = Get-Content -LiteralPath $occurrencePath -Raw -Encoding UTF8 | ConvertFrom-Json
$unitOccurrence = $occurrences.units.PSObject.Properties[$unitId].Value
if ($null -eq $unitOccurrence) {
  throw "Unit occurrence not found: $unitId"
}

$expectedTokenIndexIds = @()
foreach ($paragraph in @($unitOccurrence.paragraphs)) {
  if ($paragraph.PSObject.Properties.Name -contains 'tokens') {
    throw "Unit occurrence still contains verbose token objects: $unitId"
  }
  if ($paragraph.PSObject.Properties.Name -notcontains 'token_index_ids') {
    throw "Unit occurrence paragraph missing token_index_ids: $unitId"
  }
  foreach ($tokenIndexId in @($paragraph.token_index_ids)) {
    $expectedTokenIndexIds += [string]$tokenIndexId
  }
}
if ($expectedTokenIndexIds.Count -eq 0) {
  throw "Unit occurrence has no lexical tokens: $unitId"
}

$tokenIndex = Get-Content -LiteralPath $tokenIndexPath -Raw -Encoding UTF8 | ConvertFrom-Json
$tokenIds = @{}
$tokenRows = @{}
foreach ($row in @($tokenIndex.forms)) {
  $tokenKey = [string]$row.token_index_id
  $tokenIds[$tokenKey] = $true
  $tokenRows[$tokenKey] = $row
}

$lexicon = Get-Content -LiteralPath $lexiconPath -Raw -Encoding UTF8 | ConvertFrom-Json
$entryIds = @{}
foreach ($entry in @($lexicon.entries)) {
  $entryIds[[string]$entry.entry_id] = $true
}

foreach ($tokenIndexId in $expectedTokenIndexIds) {
  if (-not $tokenIds.ContainsKey($tokenIndexId)) {
    throw "Unit occurrence references missing token_index_id $tokenIndexId`: $unitId"
  }
  $tokenRow = $tokenRows[$tokenIndexId]
  if ($tokenRow.status -eq 'matched' -and -not $entryIds.ContainsKey([string]$tokenRow.lexicon_entry_id)) {
    throw "Matched token index row references missing lexicon_entry_id $($tokenRow.lexicon_entry_id): $tokenIndexId"
  }
}

$html = Get-Content -LiteralPath $htmlPath -Raw -Encoding UTF8
$escapedUnitId = [regex]::Escape($unitId)
$unitPattern = "(?s)<section class=""unit"" id=""$escapedUnitId""[\s\S]*?(?=<section class=""unit"" id=""|</main>)"
$unitMatch = [regex]::Match($html, $unitPattern)
if (-not $unitMatch.Success) {
  throw "Unit section not found in generated Orot page: $unitId"
}

if (-not $unitMatch.Value.Contains('data-lexical-paragraph')) {
  throw "Generated unit is missing lexical paragraph markers: $unitId"
}

if ($unitMatch.Value.Contains('data-lexical-token')) {
  throw "Generated HTML contains pre-rendered lexical token spans; wrapping should happen client-side."
}

foreach ($requiredPattern in @('data-lexical-occurrences', 'data-lexical-token-index', 'data-lexical-lexicon', 'data-lexical-slot', 'data-lexical-hud')) {
  if (-not $html.Contains($requiredPattern)) {
    throw "Generated page missing lexical renderer marker: $requiredPattern"
  }
}

if ($html.Contains('data-lexical-json')) {
  throw 'Generated page still contains stale per-occurrence lexical JSON.'
}

Write-Host "Lexical DOM validation passed for $unitId with $($expectedTokenIndexIds.Count) indexed token occurrences."
