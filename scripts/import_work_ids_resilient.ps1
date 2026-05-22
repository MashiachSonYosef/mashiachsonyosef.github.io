param(
  [Parameter(Mandatory = $true)]
  [string]$ConfigPath,
  [Parameter(Mandatory = $true)]
  [string]$WorkIdsPath,
  [string]$ReportPath = '.codex-tmp/import-work-ids-resilient-report.json',
  [switch]$UseImportCache,
  [switch]$RefreshImportCache,
  [switch]$SkipExisting
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$importScript = Join-Path $PSScriptRoot 'import_sefaria_sources.ps1'
$ids = Get-Content -Path $WorkIdsPath -Encoding UTF8 | Where-Object { $_.Trim() } | ForEach-Object { $_.Trim() }
$results = New-Object System.Collections.Generic.List[object]

foreach ($id in $ids) {
  Write-Host "Import attempt: $id"
  $args = @(
    '-ExecutionPolicy', 'Bypass',
    '-File', $importScript,
    '-ConfigPath', $ConfigPath,
    '-OnlyWorkIds', $id
  )
  if ($UseImportCache) { $args += '-UseImportCache' }
  if ($RefreshImportCache) { $args += '-RefreshImportCache' }
  if ($SkipExisting) { $args += '-SkipExisting' }

  $output = ''
  try {
    $output = & powershell @args 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
      throw "Importer exited with code $LASTEXITCODE"
    }
    $results.Add([pscustomobject]@{
      work_id = $id
      status = 'imported'
      message = ''
    })
  } catch {
    $message = $_.Exception.Message
    if ($output) {
      $message = ($message + "`n" + $output).Trim()
    }
    Write-Warning "Skipping $id after import failure: $($message.Split("`n")[0])"
    $results.Add([pscustomobject]@{
      work_id = $id
      status = 'failed'
      message = $message
    })
  }
}

$reportFullPath = if ([System.IO.Path]::IsPathRooted($ReportPath)) {
  $ReportPath
} else {
  Join-Path $repoRoot $ReportPath
}
$reportDir = Split-Path -Parent $reportFullPath
if ($reportDir -and -not (Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

[pscustomobject]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  config_path = $ConfigPath
  work_ids_path = $WorkIdsPath
  total = $ids.Count
  imported = @($results | Where-Object { $_.status -eq 'imported' }).Count
  failed = @($results | Where-Object { $_.status -eq 'failed' }).Count
  results = $results
} | ConvertTo-Json -Depth 5 | Set-Content -Path $reportFullPath -Encoding UTF8

Write-Host "Resilient import complete. Report: $ReportPath"
