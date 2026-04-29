$ErrorActionPreference = 'Stop'

$samples = @(
  [pscustomobject]@{
    Label = 'Orot 70:5 HUD canary'
    UnitId = 'orot-lights-from-darkness-lights-of-rebirth-70-5'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
  },
  [pscustomobject]@{
    Label = 'Orot punctuation sample'
    UnitId = 'orot-lights-from-darkness-war-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
  },
  [pscustomobject]@{
    Label = 'Gra abbreviation sample'
    UnitId = 'beur-hagra-on-jerusalem-talmud-bikkurim-1-1-4-2'
    HtmlPath = Join-Path $PSScriptRoot '..\gra\beur-hagra-on-jerusalem-talmud-bikkurim\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\beur-hagra-on-jerusalem-talmud-bikkurim.json'
  }
)

$tokenIndexPath = Join-Path $PSScriptRoot '..\data\lexical\token-index.json'
$lexiconPath = Join-Path $PSScriptRoot '..\data\lexical\lexicon.json'

foreach ($path in @($tokenIndexPath, $lexiconPath)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Required lexical validation file not found: $path"
  }
}

$tokenIndex = Get-Content -LiteralPath $tokenIndexPath -Raw -Encoding UTF8 | ConvertFrom-Json
$tokenRows = @{}
foreach ($row in @($tokenIndex.forms)) {
  $tokenKey = [string]$row.token_index_id
  $tokenRows[$tokenKey] = $row
}

$lexicon = Get-Content -LiteralPath $lexiconPath -Raw -Encoding UTF8 | ConvertFrom-Json
$entryIds = @{}
foreach ($entry in @($lexicon.entries)) {
  $entryIds[[string]$entry.entry_id] = $true
}

function Test-LexicalSample {
  param([object]$Sample)

  foreach ($path in @($Sample.HtmlPath, $Sample.OccurrencePath)) {
    if (-not (Test-Path -LiteralPath $path)) {
      throw "Required lexical validation file not found for $($Sample.Label): $path"
    }
  }

  $occurrences = Get-Content -LiteralPath $Sample.OccurrencePath -Raw -Encoding UTF8 | ConvertFrom-Json
  $unitOccurrence = $occurrences.units.PSObject.Properties[$Sample.UnitId].Value
  if ($null -eq $unitOccurrence) {
    throw "Unit occurrence not found for $($Sample.Label): $($Sample.UnitId)"
  }

  $expectedTokenIndexIds = @()
  foreach ($paragraph in @($unitOccurrence.paragraphs)) {
    if ($paragraph.PSObject.Properties.Name -contains 'tokens') {
      throw "Unit occurrence still contains verbose token objects for $($Sample.Label): $($Sample.UnitId)"
    }
    if ($paragraph.PSObject.Properties.Name -notcontains 'token_index_ids') {
      throw "Unit occurrence paragraph missing token_index_ids for $($Sample.Label): $($Sample.UnitId)"
    }
    foreach ($tokenIndexId in @($paragraph.token_index_ids)) {
      $expectedTokenIndexIds += [string]$tokenIndexId
    }
  }
  if ($expectedTokenIndexIds.Count -eq 0) {
    throw "Unit occurrence has no lexical tokens for $($Sample.Label): $($Sample.UnitId)"
  }

  foreach ($tokenIndexId in $expectedTokenIndexIds) {
    if (-not $tokenRows.ContainsKey($tokenIndexId)) {
      throw "Unit occurrence references missing token_index_id $tokenIndexId for $($Sample.Label): $($Sample.UnitId)"
    }
    $tokenRow = $tokenRows[$tokenIndexId]
    if ($tokenRow.status -eq 'matched' -and -not $entryIds.ContainsKey([string]$tokenRow.lexicon_entry_id)) {
      throw "Matched token index row references missing lexicon_entry_id $($tokenRow.lexicon_entry_id): $tokenIndexId"
    }
  }

  $html = Get-Content -LiteralPath $Sample.HtmlPath -Raw -Encoding UTF8
  $escapedUnitId = [regex]::Escape($Sample.UnitId)
  $unitPattern = "(?s)<section class=""unit"" id=""$escapedUnitId""[\s\S]*?(?=<section class=""unit"" id=""|</main>)"
  $unitMatch = [regex]::Match($html, $unitPattern)
  if (-not $unitMatch.Success) {
    throw "Unit section not found in generated page for $($Sample.Label): $($Sample.UnitId)"
  }

  if (-not $unitMatch.Value.Contains('data-lexical-paragraph')) {
    throw "Generated unit is missing lexical paragraph markers for $($Sample.Label): $($Sample.UnitId)"
  }

  if ($unitMatch.Value.Contains('data-lexical-token')) {
    throw "Generated HTML contains pre-rendered lexical token spans for $($Sample.Label); wrapping should happen client-side."
  }

  foreach ($requiredPattern in @('data-lexical-occurrences', 'data-lexical-token-index', 'data-lexical-lexicon', 'data-lexical-slot', 'data-lexical-hud')) {
    if (-not $html.Contains($requiredPattern)) {
      throw "Generated page missing lexical renderer marker for $($Sample.Label): $requiredPattern"
    }
  }

  foreach ($requiredRendererText in @('.lexical-word { display: inline;', 'direction: inherit;', 'unicode-bidi: normal;', 'span.dataset.lexicalIndex = tokenIndexId || "";', 'const tokenRow = tokenRows.get(button.dataset.lexicalIndex) || {};')) {
    if (-not $html.Contains($requiredRendererText)) {
      throw "Generated page missing global bidi-safe lexical renderer rule for $($Sample.Label): $requiredRendererText"
    }
  }

  foreach ($forbiddenRendererText in @('.lexical-word { display: inline-block;', 'unicode-bidi: isolate;', 'span.dir = "rtl";', 'white-space: nowrap;')) {
    if ($html.Contains($forbiddenRendererText)) {
      throw "Generated page still contains token-level bidi isolating renderer rule for $($Sample.Label): $forbiddenRendererText"
    }
  }

  if ($html.Contains('data-lexical-json')) {
    throw "Generated page still contains stale per-occurrence lexical JSON for $($Sample.Label)."
  }

  return [pscustomobject]@{
    Label = $Sample.Label
    UnitId = $Sample.UnitId
    TokenCount = $expectedTokenIndexIds.Count
  }
}

$results = foreach ($sample in $samples) {
  Test-LexicalSample -Sample $sample
}

$summary = ($results | ForEach-Object { "$($_.Label): $($_.TokenCount) indexed token occurrences" }) -join '; '
Write-Host "Lexical DOM validation passed. $summary."
