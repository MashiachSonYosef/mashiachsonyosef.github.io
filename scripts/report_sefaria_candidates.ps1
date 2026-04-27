param(
  [string]$ConfigPath = 'data/work-imports.json',
  [string]$SourceDir = 'data/sources',
  [string]$JsonOutputPath = 'data/catalog/candidate-check-kook-ari-gra.json',
  [string]$MarkdownOutputPath = 'data/catalog/candidate-check-kook-ari-gra.md'
)

$ErrorActionPreference = 'Stop'

function New-Slug {
  param([string]$Text)
  $slug = $Text.ToLowerInvariant()
  $slug = $slug -replace '&', ' and '
  $slug = $slug -replace "'", ''
  $slug = $slug -replace '[^a-z0-9]+', '-'
  $slug = $slug.Trim('-')
  if (-not $slug) { return 'text' }
  return $slug
}

function Read-Json {
  param([string]$Path)
  Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Write-Utf8 {
  param(
    [string]$Path,
    [string]$Content
  )
  $parent = Split-Path -Path $Path -Parent
  if ($parent) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    $resolved = (Resolve-Path -Path $parent).Path + '\' + (Split-Path $Path -Leaf)
  } else {
    $resolved = (Resolve-Path -Path '.').Path + '\' + $Path
  }
  [System.IO.File]::WriteAllText($resolved, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Write-Utf8Json {
  param(
    [string]$Path,
    [object]$Value
  )
  $json = $Value | ConvertTo-Json -Depth 20
  Write-Utf8 -Path $Path -Content $json
}

function Get-Utf8Json {
  param([string]$Uri)
  $attempt = 0
  while ($true) {
    $attempt += 1
    try {
      $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing
      $stream = $response.RawContentStream
      $stream.Position = 0
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
      $json = $reader.ReadToEnd()
      $reader.Dispose()
      return $json | ConvertFrom-Json
    } catch {
      if ($attempt -ge 3) { throw }
      Start-Sleep -Milliseconds (350 * $attempt)
    }
  }
}

function Get-NodeChildren {
  param([object]$Node)
  if ($null -eq $Node.nodes) { return @() }
  if ($Node.nodes -is [string]) { return @() }
  return @($Node.nodes)
}

function Get-LeafNodes {
  param([object]$Node)
  $children = Get-NodeChildren -Node $Node
  if ($children.Count -gt 0) {
    $results = @()
    foreach ($child in $children) {
      $results += @(Get-LeafNodes -Node $child)
    }
    return $results
  }
  return @([pscustomobject]@{
    depth = [int]$Node.depth
    address_types = @($Node.addressTypes)
    lengths = @($Node.lengths)
  })
}

function Get-FirstLeaf {
  param(
    [object]$Node,
    [string[]]$TitlePath = @()
  )
  $children = Get-NodeChildren -Node $Node
  if ($children.Count -gt 0) {
    foreach ($child in $children) {
      $title = if ($child.title) { $child.title } elseif ($child.key) { $child.key } else { '' }
      $leaf = Get-FirstLeaf -Node $child -TitlePath ($TitlePath + @($title))
      if ($leaf) { return $leaf }
    }
    return $null
  }

  return [pscustomobject]@{
    title_path = $TitlePath
    depth = [int]$Node.depth
    address_types = @($Node.addressTypes)
    lengths = @($Node.lengths)
  }
}

function Get-ProbeRef {
  param(
    [string]$WorkRef,
    [object]$Leaf
  )
  $leafRef = if ($Leaf.title_path.Count -eq 0) { $WorkRef } else { "$WorkRef, $($Leaf.title_path -join ', ')" }
  if ($Leaf.depth -eq 1) { return $leafRef }
  if ($Leaf.address_types.Count -gt 0 -and $Leaf.address_types[0] -eq 'Talmud') { return $null }
  return "$leafRef 1"
}

function Get-EstimatedUnitCount {
  param(
    [object]$Index,
    [string]$WorkId,
    [hashtable]$ImportedUnitCounts
  )
  if ($ImportedUnitCounts.ContainsKey($WorkId)) { return $ImportedUnitCounts[$WorkId] }

  $total = 0
  $unknown = $false
  foreach ($leaf in Get-LeafNodes -Node $Index.schema) {
    if ($leaf.lengths.Count -gt 0 -and $leaf.lengths[-1]) {
      $total += [int]$leaf.lengths[-1]
    } else {
      $unknown = $true
    }
  }

  if ($total -gt 0 -and -not $unknown) { return $total }
  if ($total -gt 0) { return "$total+" }
  return 'unknown'
}

function Test-HebrewText {
  param([object]$Value)
  if ($null -eq $Value) { return $false }
  if ($Value -is [string]) { return [bool]$Value.Trim() }
  foreach ($item in @($Value)) {
    if (Test-HebrewText -Value $item) { return $true }
  }
  return $false
}

function Get-WorkEntries {
  param(
    [object[]]$Items,
    [string[]]$CategoryPath = @()
  )

  $results = @()
  foreach ($item in @($Items)) {
    if ($item.title) {
      $categories = if ($item.categories) { @($item.categories) } else { $CategoryPath }
      $results += [pscustomobject]@{
        title = $item.title
        he_title = $item.heTitle
        categories = $categories
        category_text = ($categories -join ' > ')
      }
    } elseif ($item.contents) {
      $nextPath = if ($item.category) { $CategoryPath + @($item.category) } else { $CategoryPath }
      $results += @(Get-WorkEntries -Items $item.contents -CategoryPath $nextPath)
    }
  }
  return $results
}

function Get-Priority {
  param(
    [object]$Report,
    [string]$Reason
  )
  if ($Report.already_imported) { return 'low' }
  if (-not $Report.hebrew_available) { return 'low' }
  if (-not $Report.importable_cleanly) { return 'low' }
  if ($Reason -match 'Explicit|Rav Kook|Ari category') { return 'high' }
  if ($Reason -match 'Gra category|Vilna|Eliyahu Rabbah|Nuschah') { return 'medium' }
  return 'medium'
}

function Add-Candidate {
  param(
    [hashtable]$Candidates,
    [string]$Title,
    [string]$Reason
  )
  if (-not $Title) { return }
  if (-not $Candidates.ContainsKey($Title)) {
    $Candidates[$Title] = [ordered]@{
      title = $Title
      reasons = New-Object System.Collections.Generic.List[string]
    }
  }
  if ($Candidates[$Title].reasons -notcontains $Reason) {
    $Candidates[$Title].reasons.Add($Reason)
  }
}

$config = Read-Json -Path $ConfigPath
$importedRefs = @{}
$importedUnitCounts = @{}
foreach ($work in $config.works) {
  $importedRefs[$work.sefaria_ref] = $true
  $sourcePath = Join-Path $SourceDir "$($work.work_id).json"
  if (Test-Path $sourcePath) {
    $source = Read-Json -Path $sourcePath
    $importedUnitCounts[$work.work_id] = @($source.units).Count
  }
}

$library = Get-Utf8Json -Uri 'https://www.sefaria.org/api/index'
$works = @(Get-WorkEntries -Items $library)
$workByTitle = @{}
foreach ($work in $works) {
  $workByTitle[$work.title] = $work
}

$candidates = @{}
foreach ($title in @('Yahel Ohr on Zohar', 'Maaseh Rav', 'Kol HaTor', 'Nefesh HaChayim', 'Olat Reiyah', 'Shabbat HaAretz')) {
  Add-Candidate -Candidates $candidates -Title $title -Reason 'Explicit user candidate'
}

foreach ($work in $works) {
  if ($work.category_text -match 'Rav Kook') {
    Add-Candidate -Candidates $candidates -Title $work.title -Reason 'Rav Kook category'
  }
  if ($work.category_text -match 'Arizal and Chaim Vital') {
    Add-Candidate -Candidates $candidates -Title $work.title -Reason 'Ari category comparison'
  }
  if ($work.title -match '^Eliyahu Rabbah on Mishnah ') {
    Add-Candidate -Candidates $candidates -Title $work.title -Reason 'Eliyahu Rabbah on Seder Tahorot family'
  }
  if ($work.title -match "^Gra's Nuschah") {
    Add-Candidate -Candidates $candidates -Title $work.title -Reason "Gra's Nuschah on Minor Tractates"
  }
  if ($work.category_text -match 'Beur HaGra|Gra''s Nuschah' -or $work.title -match 'Vilna Gaon|HaGra|^Gra on |^Aderet Eliyahu$|^Maaseh Rav$|^Yahel Ohr|^Kol HaTor$|^Nefesh HaChayim$') {
    Add-Candidate -Candidates $candidates -Title $work.title -Reason 'Gra/Vilna Gaon catalog search'
  }
}

$reports = New-Object System.Collections.Generic.List[object]
foreach ($candidate in $candidates.GetEnumerator() | Sort-Object Name) {
  $title = $candidate.Key
  $reason = ($candidate.Value.reasons -join '; ')
  try {
    $encodedTitle = [System.Uri]::EscapeDataString($title)
    $index = Get-Utf8Json -Uri "https://www.sefaria.org/api/index/$encodedTitle"
    $leaf = Get-FirstLeaf -Node $index.schema
    $probeRef = if ($leaf) { Get-ProbeRef -WorkRef $index.title -Leaf $leaf } else { $null }
    $payload = $null
    if ($probeRef) {
      $encodedProbe = [System.Uri]::EscapeDataString($probeRef)
      $payload = Get-Utf8Json -Uri "https://www.sefaria.org/api/texts/$encodedProbe`?context=0&commentary=0"
    }

    $workId = New-Slug $index.title
    $license = if ($payload -and $payload.heLicense) { $payload.heLicense } else { 'unknown' }
    $hebrewAvailable = ($payload -and (Test-HebrewText -Value $payload.he))
    $cleanLicense = @('CC0', 'CC-BY', 'CC-BY-SA', 'Public Domain', 'PD') -contains $license
    $schemaImportable = ($leaf -and -not ($leaf.address_types.Count -gt 0 -and $leaf.address_types[0] -eq 'Talmud'))
    $alreadyImported = $importedRefs.ContainsKey($index.title)

    $report = [ordered]@{
      sefaria_ref = $index.title
      hebrew_title = $index.heTitle
      categories = @($index.categories)
      candidate_reason = $reason
      already_imported = $alreadyImported
      hebrew_available = [bool]$hebrewAvailable
      license = $license
      source_version_title = if ($payload) { $payload.heVersionTitle } else { '' }
      version_source = if ($payload) { $payload.heVersionSource } else { '' }
      probe_ref = if ($payload) { $payload.ref } else { $probeRef }
      estimated_unit_count = Get-EstimatedUnitCount -Index $index -WorkId $workId -ImportedUnitCounts $importedUnitCounts
      importable_cleanly = [bool]($hebrewAvailable -and $cleanLicense -and $schemaImportable)
      import_blocker = if (-not $hebrewAvailable) { 'No Hebrew probe text found' } elseif (-not $cleanLicense) { "License is $license" } elseif (-not $schemaImportable) { 'Talmud-addressed schema needs importer support' } else { '' }
      priority = ''
    }
    $report.priority = Get-Priority -Report $report -Reason $reason
    $reports.Add($report)
  } catch {
    $reports.Add([ordered]@{
      sefaria_ref = $title
      hebrew_title = ''
      categories = @()
      candidate_reason = $reason
      already_imported = $false
      hebrew_available = $false
      license = 'not found'
      source_version_title = ''
      version_source = ''
      probe_ref = ''
      estimated_unit_count = 'unknown'
      importable_cleanly = $false
      import_blocker = $_.Exception.Message
      priority = 'low'
    })
  }
}

$reportsByRef = [ordered]@{}
foreach ($report in $reports) {
  $key = $report.sefaria_ref
  if (-not $reportsByRef.Contains($key)) {
    $reportsByRef[$key] = $report
    continue
  }

  $existing = $reportsByRef[$key]
  $existingReasons = @($existing.candidate_reason -split '; ' | Where-Object { $_ })
  $newReasons = @($report.candidate_reason -split '; ' | Where-Object { $_ })
  $mergedReasons = @($existingReasons + $newReasons | Select-Object -Unique)
  $existing.candidate_reason = ($mergedReasons -join '; ')

  if ($report.importable_cleanly -and -not $existing.importable_cleanly) {
    $existing.importable_cleanly = $true
    $existing.import_blocker = ''
  }

  $rank = @{ high = 0; medium = 1; low = 2 }
  if ($rank[$report.priority] -lt $rank[$existing.priority]) {
    $existing.priority = $report.priority
  }
}
$reports = @($reportsByRef.Values)

$result = [ordered]@{
  generated_at = (Get-Date).ToString('yyyy-MM-dd')
  source = 'Sefaria API'
  candidate_count = $reports.Count
  candidates = $reports
}
Write-Utf8Json -Path $JsonOutputPath -Value $result

$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine('# Kook / Ari / Gra Candidate Check')
[void]$md.AppendLine()
[void]$md.AppendLine("Generated: $($result.generated_at)")
[void]$md.AppendLine()
[void]$md.AppendLine('| Priority | Sefaria ref | Hebrew | License | Version | Est. units | Imported | Clean import | Notes |')
[void]$md.AppendLine('|---|---|---|---|---|---:|---|---|---|')
foreach ($report in $reports | Sort-Object @{ Expression = { @{ high = 0; medium = 1; low = 2 }[$_.priority] } }, sefaria_ref) {
  $notes = if ($report.import_blocker) { $report.import_blocker } else { $report.candidate_reason }
  $line = '| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} |' -f `
    $report.priority,
    ($report.sefaria_ref -replace '\|', '\|'),
    ($(if ($report.hebrew_available) { 'yes' } else { 'no' })),
    ($report.license -replace '\|', '\|'),
    ($report.source_version_title -replace '\|', '\|'),
    $report.estimated_unit_count,
    ($(if ($report.already_imported) { 'yes' } else { 'no' })),
    ($(if ($report.importable_cleanly) { 'yes' } else { 'no' })),
    ($notes -replace '\|', '\|')
  [void]$md.AppendLine($line)
}
Write-Utf8 -Path $MarkdownOutputPath -Content $md.ToString()

Write-Host "Wrote candidate report: $JsonOutputPath"
Write-Host "Wrote candidate report: $MarkdownOutputPath"
