param(
  [string]$OutputPath = 'data/catalog/sefaria-cc-by-sa.json',
  [string[]]$IncludeCategories = @(),
  [int]$MaxWorks = 50
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

function Write-Utf8Json {
  param(
    [string]$Path,
    [object]$Value
  )
  $parent = Split-Path -Path $Path -Parent
  if ($parent) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  $json = $Value | ConvertTo-Json -Depth 20
  [System.IO.File]::WriteAllText((Resolve-Path -Path $parent).Path + '\' + (Split-Path $Path -Leaf), $json, [System.Text.UTF8Encoding]::new($false))
}

function Get-Utf8Json {
  param([string]$Uri)
  $response = Invoke-WebRequest -Uri $Uri
  $stream = $response.RawContentStream
  $stream.Position = 0
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
  $json = $reader.ReadToEnd()
  $reader.Dispose()
  return $json | ConvertFrom-Json
}

function Get-PrimaryTitle {
  param(
    [object]$Node,
    [string]$Lang
  )
  $match = @($Node.titles | Where-Object { $_.lang -eq $Lang -and $_.primary } | Select-Object -First 1)[0]
  if ($match) { return $match.text }
  $fallback = @($Node.titles | Where-Object { $_.lang -eq $Lang } | Select-Object -First 1)[0]
  if ($fallback) { return $fallback.text }
  if ($Lang -eq 'he' -and $Node.heTitle) { return $Node.heTitle }
  if ($Node.title) { return $Node.title }
  return ''
}

function Get-NodeChildren {
  param([object]$Node)
  if ($null -eq $Node.nodes) { return @() }
  if ($Node.nodes -is [string]) { return @() }
  return @($Node.nodes)
}

function Get-FirstLeaf {
  param(
    [object]$Node,
    [string[]]$TitlePath = @()
  )
  $children = Get-NodeChildren -Node $Node
  if ($children.Count -gt 0) {
    foreach ($child in $children) {
      $title = Get-PrimaryTitle -Node $child -Lang 'en'
      $leaf = Get-FirstLeaf -Node $child -TitlePath ($TitlePath + @($title))
      if ($leaf) { return $leaf }
    }
    return $null
  }

  [pscustomobject]@{
    title_path = $TitlePath
    depth = [int]$Node.depth
    address_types = @($Node.addressTypes)
  }
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
      }
    } elseif ($item.contents) {
      $nextPath = if ($item.category) { $CategoryPath + @($item.category) } else { $CategoryPath }
      foreach ($child in Get-WorkEntries -Items $item.contents -CategoryPath $nextPath) {
        $results += $child
      }
    }
  }
  return $results
}

function Test-IncludedCategory {
  param(
    [object]$Work,
    [string[]]$IncludeCategories
  )
  if ($IncludeCategories.Count -eq 0) { return $true }
  foreach ($category in @($Work.categories)) {
    if ($IncludeCategories -contains $category) { return $true }
  }
  return $false
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

$library = Get-Utf8Json -Uri 'https://www.sefaria.org/api/index'
$works = Get-WorkEntries -Items $library
$matches = New-Object System.Collections.Generic.List[object]
$scanned = 0

foreach ($work in $works) {
  if (-not (Test-IncludedCategory -Work $work -IncludeCategories $IncludeCategories)) { continue }
  if ($matches.Count -ge $MaxWorks) { break }

  $scanned += 1
  try {
    $encodedTitle = [System.Uri]::EscapeDataString($work.title)
    $index = Get-Utf8Json -Uri "https://www.sefaria.org/api/index/$encodedTitle"
    $leaf = Get-FirstLeaf -Node $index.schema
    if (-not $leaf) { continue }
    $probeRef = Get-ProbeRef -WorkRef $work.title -Leaf $leaf
    if (-not $probeRef) { continue }

    $encodedProbe = [System.Uri]::EscapeDataString($probeRef)
    $payload = Get-Utf8Json -Uri "https://www.sefaria.org/api/texts/$encodedProbe`?context=0&commentary=0"
    if ($payload.heLicense -eq 'CC-BY-SA') {
      $matches.Add([ordered]@{
        work_id = New-Slug $work.title
        work_title = $work.title
        he_title = $work.he_title
        work_slug = New-Slug $work.title
        sefaria_ref = $work.title
        categories = @($work.categories)
        probe_ref = $payload.ref
        license = $payload.heLicense
        version_title = $payload.heVersionTitle
        version_source = $payload.heVersionSource
        source_system = 'Sefaria API'
        source_base_url = 'https://www.sefaria.org/api/'
      })
    }
  } catch {
    Write-Warning "Skipping $($work.title): $($_.Exception.Message)"
  }
}

Write-Utf8Json -Path $OutputPath -Value ([ordered]@{
  generated_at = (Get-Date).ToString('yyyy-MM-dd')
  include_categories = $IncludeCategories
  scanned = $scanned
  match_count = $matches.Count
  works = $matches
})

Write-Host "Discovered $($matches.Count) CC-BY-SA Hebrew works."
