$ErrorActionPreference = 'Stop'

$samples = @(
  [pscustomobject]@{
    Label = 'Tanakh HUD sample'
    WorkId = 'joshua'
    UnitId = 'joshua-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\tanakh\joshua\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\joshua.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\joshua.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Midrash HUD sample'
    WorkId = 'aggadat-bereshit'
    UnitId = 'aggadat-bereshit-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\midrash\aggadat-bereshit\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\aggadat-bereshit.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\aggadat-bereshit.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Talmud HUD sample'
    WorkId = 'jerusalem-talmud-taanit'
    UnitId = 'jerusalem-talmud-taanit-1-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\talmud\jerusalem-talmud-taanit\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\jerusalem-talmud-taanit.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\jerusalem-talmud-taanit.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Kabbalah HUD sample'
    WorkId = 'pri-etz-chaim'
    UnitId = 'pri-etz-chaim-gate-of-prayer-introduction-1'
    HtmlPath = Join-Path $PSScriptRoot '..\ari\pri-etz-chaim\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\pri-etz-chaim.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\pri-etz-chaim.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Commentary HUD sample'
    WorkId = 'beur-hagra-on-shulchan-arukh-orach-chayim'
    UnitId = 'beur-hagra-on-shulchan-arukh-orach-chayim-1-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\gra\beur-hagra-on-shulchan-arukh-orach-chayim\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\beur-hagra-on-shulchan-arukh-orach-chayim.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\beur-hagra-on-shulchan-arukh-orach-chayim.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Hebrew thought HUD sample'
    WorkId = 'maamar-hador'
    UnitId = 'maamar-hador-1'
    HtmlPath = Join-Path $PSScriptRoot '..\rav-kook\maamar-hador\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\maamar-hador.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\maamar-hador.manifest.json'
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
$sampleWorkIds = @{}
foreach ($sample in $samples) {
  $sampleWorkIds[[string]$sample.WorkId] = $true
}
$tokenIndexRows = @()
if ($tokenIndex.PSObject.Properties.Name -contains 'forms') {
  $tokenIndexRows = @($tokenIndex.forms)
}
if ($tokenIndexRows.Count -eq 0 -and $tokenIndex.PSObject.Properties.Name -contains 'work_indexes') {
  foreach ($indexFile in @($tokenIndex.work_indexes)) {
    if (-not $indexFile.path) { continue }
    if ($indexFile.PSObject.Properties.Name -contains 'work_id' -and -not $sampleWorkIds.ContainsKey([string]$indexFile.work_id)) {
      continue
    }
    $indexPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$indexFile.path)
    if (-not (Test-Path -LiteralPath $indexPath)) {
      throw "Required per-work token index file not found: $indexPath"
    }
    $workTokenIndex = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $tokenIndexRows += @($workTokenIndex.forms)
  }
}
$tokenRows = @{}
foreach ($row in @($tokenIndexRows)) {
  $tokenKey = [string]$row.token_index_id
  $tokenRows[$tokenKey] = $row
}

$lexicon = Get-Content -LiteralPath $lexiconPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lexiconEntries = @($lexicon.entries)
if ($lexiconEntries.Count -eq 0 -and $lexicon.PSObject.Properties.Name -contains 'layer_files') {
  foreach ($layer in @($lexicon.layer_files)) {
    if (-not $layer.path) { continue }
    $layerPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$layer.path)
    if (-not (Test-Path -LiteralPath $layerPath)) {
      throw "Required lexical source layer file not found: $layerPath"
    }
    $layerJson = Get-Content -LiteralPath $layerPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $lexiconEntries += @($layerJson.entries)
  }
}
$entryIds = @{}
foreach ($entry in @($lexiconEntries)) {
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

  if ($Sample.PSObject.Properties.Name -contains 'ManifestPath') {
    if (-not (Test-Path -LiteralPath $Sample.ManifestPath)) {
      throw "Required lexical manifest not found for $($Sample.Label): $($Sample.ManifestPath)"
    }
    $sampleManifest = Get-Content -LiteralPath $Sample.ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $firstTokenId = [string]$expectedTokenIndexIds[0]
    if ($sampleManifest.token_chunks.PSObject.Properties.Name -notcontains $firstTokenId) {
      throw "Manifest does not map first sample token to a chunk for $($Sample.Label): $firstTokenId"
    }
    $sampleChunkId = [string]$sampleManifest.token_chunks.$firstTokenId
    $sampleChunkMeta = @($sampleManifest.chunks | Where-Object { $_.chunk_id -eq $sampleChunkId }) | Select-Object -First 1
    if ($null -eq $sampleChunkMeta -or -not $sampleChunkMeta.url) {
      throw "Manifest chunk metadata missing for $($Sample.Label): $sampleChunkId"
    }
    $sampleChunkPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$sampleChunkMeta.url)
    if (-not (Test-Path -LiteralPath $sampleChunkPath)) {
      throw "Required lexical chunk not found for $($Sample.Label): $sampleChunkPath"
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

  foreach ($requiredPattern in @('data-lexical-occurrences', 'data-lexical-config', 'data-lexical-slot', 'data-lexical-hud', 'data-hud-breakdown', 'data-hud-lemma-strict', 'Strict Lemma', 'Potential options', 'Related options')) {
    if (-not $html.Contains($requiredPattern)) {
      throw "Generated page missing lexical renderer marker for $($Sample.Label): $requiredPattern"
    }
  }
  if (-not ($html.Contains('Show more') -or $html.Contains('Show potential options'))) {
    throw "Generated page missing lexical option expansion marker for $($Sample.Label)"
  }
  if (-not ($html.Contains('allowLowConfidenceFallback') -or $html.Contains('Show related options'))) {
    throw "Generated page missing lexical secondary expansion marker for $($Sample.Label)"
  }
  if (-not ($html.Contains('data-hud-hebrew-strict') -or $html.Contains('data-hud-surface-renderings'))) {
    throw "Generated page missing lexical strict-rendering marker for $($Sample.Label)"
  }
  foreach ($forbiddenHudPattern in @('data-hud-transliteration', 'data-hud-root', 'data-hud-root-transliteration', 'data-hud-root-meaning')) {
    if ($html.Contains($forbiddenHudPattern)) {
      throw "Generated page still foregrounds removed HUD field for $($Sample.Label): $forbiddenHudPattern"
    }
  }

  foreach ($requiredRendererText in @('.lexical-word { display: inline;', 'direction: inherit;', 'unicode-bidi: normal;', 'span.dataset.lexicalIndex = tokenIndexId || "";', 'const tokenRow = await loadTokenRow(button.dataset.lexicalIndex);', 'const groupedEntries = new Map();')) {
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
exit 0
