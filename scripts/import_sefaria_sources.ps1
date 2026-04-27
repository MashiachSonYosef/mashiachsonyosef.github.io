param(
  [string]$AllowlistPath = 'data/import-allowlist.json',
  [string]$OutputDir = 'data/sources'
)

$ErrorActionPreference = 'Stop'

function New-Slug {
  param([string]$Text)
  $slug = $Text.ToLowerInvariant()
  $slug = $slug -replace '&', ' and '
  $slug = $slug -replace '[^a-z0-9]+', '-'
  return $slug.Trim('-')
}

function Get-SourceRefNumber {
  param([string]$Ref)
  $match = [regex]::Match($Ref, '(\d+)$')
  if ($match.Success) { return [int]$match.Groups[1].Value }
  return $null
}

function Get-SefariaText {
  param([string]$Ref)
  $encodedRef = [System.Uri]::EscapeDataString($Ref)
  $uri = "https://www.sefaria.org/api/texts/$encodedRef`?context=0&commentary=0"
  return Invoke-RestMethod -Uri $uri
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$allowlist = Get-Content -Path $AllowlistPath -Raw -Encoding UTF8 | ConvertFrom-Json
$importDate = (Get-Date).ToString('yyyy-MM-dd')

foreach ($work in $allowlist.works) {
  $units = New-Object System.Collections.Generic.List[object]
  $toc = New-Object System.Collections.Generic.List[object]

  foreach ($section in $work.sections) {
    $toc.Add([ordered]@{
      section_title = $section.section_title
      section_slug = $section.section_slug
      units = @()
    })

    foreach ($ref in $section.refs) {
      Write-Host "Importing $ref"
      $payload = Get-SefariaText -Ref $ref
      $hebrew = @($payload.he) | Where-Object { $_ -and $_.Trim() }
      if ($hebrew.Count -eq 0) {
        throw "No Hebrew returned for $ref"
      }

      $number = Get-SourceRefNumber -Ref $ref
      $numberPart = if ($null -ne $number) { "-$number" } else { '' }
      $unitId = "$($work.work_id)-$($section.section_slug)$numberPart"
      $version = @($payload.versions | Where-Object { $_.language -eq 'he' } | Select-Object -First 1)[0]

      $unit = [ordered]@{
        work_id = $work.work_id
        work_title = $work.work_title
        section_title = $section.section_title
        section_slug = $section.section_slug
        unit_id = $unitId
        anchor_id = $unitId
        source_ref = $payload.ref
        sefaria_ref = $payload.ref
        hebrew = $hebrew
        license = if ($payload.heLicense) { $payload.heLicense } elseif ($version.license) { $version.license } else { 'unknown' }
        version_title = if ($payload.heVersionTitle) { $payload.heVersionTitle } elseif ($version.versionTitle) { $version.versionTitle } else { 'unknown' }
        version_source = if ($payload.heVersionSource) { $payload.heVersionSource } elseif ($version.versionSource) { $version.versionSource } else { '' }
        source_url = "https://www.sefaria.org/$($payload.ref -replace ' ', '_' -replace ',', '%2C')"
        import_date = $importDate
      }

      $units.Add($unit)
      $toc[$toc.Count - 1].units += @([ordered]@{
        unit_id = $unitId
        source_ref = $payload.ref
        label = if ($null -ne $number) { "$($section.section_title) $number" } else { $section.section_title }
      })
    }
  }

  $source = [ordered]@{
    work_id = $work.work_id
    work_title = $work.work_title
    work_slug = $work.work_slug
    source_system = $work.source_system
    source_base_url = $work.source_base_url
    import_date = $importDate
    units = $units
    toc = $toc
  }

  $outPath = Join-Path $OutputDir "$($work.work_id).json"
  $json = $source | ConvertTo-Json -Depth 20
  [System.IO.File]::WriteAllText((Resolve-Path -Path (Split-Path $outPath -Parent)).Path + '\' + (Split-Path $outPath -Leaf), $json, [System.Text.UTF8Encoding]::new($false))
}
