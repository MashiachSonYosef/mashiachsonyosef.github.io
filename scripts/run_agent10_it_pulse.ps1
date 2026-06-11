Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptPath = $MyInvocation.MyCommand.Path
$root = Split-Path -Parent (Split-Path -Parent $scriptPath)
$reportsDir = Join-Path $root "reports"
Set-Location $root

function Invoke-TimedCommand {
  param(
    [Parameter(Mandatory=$true)]
    [string] $Command,
    [int] $TimeoutSeconds = 60
  )

  $id = [guid]::NewGuid().ToString("N")
  $outPath = Join-Path $env:TEMP "agent10-$id.out"
  $errPath = Join-Path $env:TEMP "agent10-$id.err"
  $process = Start-Process `
    -FilePath "cmd.exe" `
    -ArgumentList @("/c", $Command) `
    -WorkingDirectory $root `
    -RedirectStandardOutput $outPath `
    -RedirectStandardError $errPath `
    -WindowStyle Hidden `
    -PassThru

  $finished = $process.WaitForExit($TimeoutSeconds * 1000)
  if (-not $finished) {
    & taskkill.exe /PID $process.Id /T /F | Out-Null
    return @{
      ExitCode = 124
      Output = "timed out after $TimeoutSeconds second(s): $Command"
      TimedOut = $true
    }
  }

  $process.Refresh()
  $exitCode = 0
  try {
    if ($null -ne $process.ExitCode) {
      $exitCode = [int]$process.ExitCode
    }
  } catch {
    $exitCode = 0
  }

  $stdout = ""
  $stderr = ""
  if (Test-Path -LiteralPath $outPath) {
    $stdout = Get-Content -LiteralPath $outPath -Raw
  }
  if (Test-Path -LiteralPath $errPath) {
    $stderr = Get-Content -LiteralPath $errPath -Raw
  }

  Remove-Item -LiteralPath $outPath,$errPath -ErrorAction SilentlyContinue

  $combined = (($stdout + "`n" + $stderr).Trim())
  return @{
    ExitCode = $exitCode
    Output = $combined
    TimedOut = $false
  }
}

function Get-HealthField {
  param(
    [Parameter(Mandatory=$true)]
    [string] $Path,
    [Parameter(Mandatory=$true)]
    [string] $Field
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }
  $raw = Get-Content -LiteralPath $Path -Raw
  $pattern = "(?m)^- " + [regex]::Escape($Field) + ":\s*(.+?)\s*$"
  $match = [regex]::Match($raw, $pattern)
  if ($match.Success) {
    return $match.Groups[1].Value.Trim()
  }
  return ""
}

function Add-NotAccepted {
  param([System.Collections.Generic.List[string]] $Lines)

  $items = @(
    "publication readiness",
    "source/provenance custody",
    "public/runtime clearance",
    "old-HUD public use",
    "Reader Workbench broad rollout",
    "Definition authority",
    "route publication support",
    "usage-as-definition authority",
    "accepted translation text"
  )

  $Lines.Add("")
  $Lines.Add("## Not Accepted")
  $Lines.Add("")
  foreach ($item in $items) {
    $Lines.Add("- $item")
  }
}

$now = Get-Date
$iso = $now.ToString("yyyy-MM-ddTHH:mm:ssK")
$date = $now.ToString("yyyy-MM-dd")
$stamp = $now.ToString("yyyy-MM-dd-HHmm")
$pulsePath = Join-Path $reportsDir "agent10-it-pulse-$stamp.md"
$ledgerPath = Join-Path $reportsDir "agent10-it-change-ledger-$date.md"

$previousPulse = Get-ChildItem -LiteralPath $reportsDir -Filter "agent10-it-pulse-*.md" -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$previousPulseTime = $null
if ($previousPulse -ne $null) {
  $previousPulseTime = $previousPulse.LastWriteTime
}

$statusResult = Invoke-TimedCommand -Command "git status --porcelain=v1" -TimeoutSeconds 90
$dirtyLines = @()
if ($statusResult.ExitCode -eq 0) {
  $dirtyLines = @($statusResult.Output -split "\r?\n" | Where-Object { $_ -ne "" })
}
$dirtyTotal = $dirtyLines.Count
$modifiedCount = 0
$untrackedCount = 0
$otherCount = 0
foreach ($line in $dirtyLines) {
  if ($line -match "^\?\?") {
    $untrackedCount++
  } elseif ($line -match "^ M|^M |^MM") {
    $modifiedCount++
  } else {
    $otherCount++
  }
}

$aheadBehindResult = Invoke-TimedCommand -Command "git rev-list --left-right --count origin/main...HEAD" -TimeoutSeconds 30
$aheadBehind = $aheadBehindResult.Output.Trim()
$latestCommitResult = Invoke-TimedCommand -Command "git log --oneline --decorate -1" -TimeoutSeconds 30
$latestCommit = $latestCommitResult.Output.Trim()

$agent6Result = Invoke-TimedCommand -Command "node scripts\validate_agent6_validation_queue.mjs" -TimeoutSeconds 180
$agent7Result = Invoke-TimedCommand -Command "node scripts\validate_agent7_governance_control.mjs" -TimeoutSeconds 180

$agent6Health = Join-Path $reportsDir "agent6-validation-queue-health.md"
$agent7Health = Join-Path $reportsDir "agent7-governance-control-health.md"
$agent6Status = Get-HealthField -Path $agent6Health -Field "Status"
$agent6WarningsText = Get-HealthField -Path $agent6Health -Field "Warnings"
$agent7Status = Get-HealthField -Path $agent7Health -Field "Status"
$agent7IssuesText = Get-HealthField -Path $agent7Health -Field "Issues"
$agent7WarningsText = Get-HealthField -Path $agent7Health -Field "Warnings"

$agent6Warnings = 0
[void][int]::TryParse($agent6WarningsText, [ref]$agent6Warnings)
$agent7Issues = 0
[void][int]::TryParse($agent7IssuesText, [ref]$agent7Issues)
$agent7Warnings = 0
[void][int]::TryParse($agent7WarningsText, [ref]$agent7Warnings)

$behind = 0
$ahead = 0
$parts = $aheadBehind -split "\s+"
if ($parts.Count -ge 2) {
  [void][int]::TryParse($parts[0], [ref]$behind)
  [void][int]::TryParse($parts[1], [ref]$ahead)
}

$newReports = @()
if ($previousPulseTime -ne $null) {
  $newReports = Get-ChildItem -LiteralPath $reportsDir -File |
    Where-Object {
      $_.LastWriteTime -gt $previousPulseTime -and
      ($_.Name -match "^agent[167]-" -or $_.Name -match "^agent10-")
    } |
    Sort-Object LastWriteTime
}

$actionItems = New-Object System.Collections.Generic.List[string]
if ($agent6Result.ExitCode -ne 0 -or $agent6Status -ne "passed" -or $agent6Warnings -gt 0) {
  $actionItems.Add("Agent 6 validation queue health is not clean: status=$agent6Status warnings=$agent6Warnings command_exit=$($agent6Result.ExitCode).")
}
if ($agent7Result.ExitCode -ne 0 -or $agent7Status -ne "passed" -or $agent7Issues -gt 0) {
  $actionItems.Add("Agent 7 governance control health has issues: status=$agent7Status issues=$agent7Issues command_exit=$($agent7Result.ExitCode).")
}
if ($agent7Warnings -gt 1) {
  $actionItems.Add("Agent 7 governance warning count is above the known baseline: warnings=$agent7Warnings.")
}
if ($behind -gt 0) {
  $actionItems.Add("Local branch is behind origin/main: behind=$behind ahead=$ahead.")
}
if ($statusResult.ExitCode -eq 124) {
  $actionItems.Add("Git dirty-path count timed out, so repo health could not be fully counted within the IT runner timeout.")
}
if ($aheadBehindResult.ExitCode -ne 0) {
  $actionItems.Add("Git ahead/behind check failed or timed out: exit=$($aheadBehindResult.ExitCode).")
}
if ($latestCommitResult.ExitCode -ne 0) {
  $actionItems.Add("Git latest-commit check failed or timed out: exit=$($latestCommitResult.ExitCode).")
}

$pulse = New-Object System.Collections.Generic.List[string]
$pulse.Add("# Agent 10 IT Pulse")
$pulse.Add("")
$pulse.Add("Generated: $iso")
$pulse.Add("Agent: Agent 10 / ITer-10")
$pulse.Add("Cadence: scheduled/manual IT runner")
$pulse.Add("Workspace: ``$root``")
$pulse.Add("")
$pulse.Add("## Scope")
$pulse.Add("")
$pulse.Add("Organizational and non-destructive IT pulse only.")
$pulse.Add("")
$pulse.Add("No public pages, source files, lexical data, route data, control-state JSON files, Agent 6 queue statuses, Agent 6 dockets, Agent 7 decisions, or Agent 6/7 validator scripts were intentionally edited.")
$pulse.Add("")
$pulse.Add("## Commands Run")
$pulse.Add("")
$pulse.Add("- ``git status --porcelain=v1``")
$pulse.Add("- ``git rev-list --left-right --count origin/main...HEAD``")
$pulse.Add("- ``git log --oneline --decorate -1``")
$pulse.Add("- ``node scripts\validate_agent6_validation_queue.mjs``")
$pulse.Add("- ``node scripts\validate_agent7_governance_control.mjs``")
$pulse.Add("")
$pulse.Add("## File Changes Made By This IT Pulse")
$pulse.Add("")
$pulse.Add("Directly authored by Agent 10 runner:")
$pulse.Add("")
$pulse.Add("- ``reports/agent10-it-pulse-$stamp.md``")
$pulse.Add("- ``reports/agent10-it-change-ledger-$date.md``")
if ($actionItems.Count -gt 0) {
  $pulse.Add("- ``reports/agent10-agent7-it-actionable-findings-$stamp.md``")
}
$pulse.Add("")
$pulse.Add("Generated/refreshed by validators run during this pulse:")
$pulse.Add("")
$pulse.Add("- ``reports/agent6-validation-queue-health.md``")
$pulse.Add("- ``reports/agent7-governance-control-health.md``")
$pulse.Add("")
$pulse.Add("## Repo State Observed")
$pulse.Add("")
$pulse.Add("- Branch relation: ``origin/main...HEAD`` = ``$aheadBehind``.")
$pulse.Add("- Latest commit observed: ``$latestCommit``.")
$pulse.Add("- Dirty paths counted before this report creation: $dirtyTotal total.")
$pulse.Add("- Dirty-path breakdown before this report creation:")
$pulse.Add("  - modified: $modifiedCount")
$pulse.Add("  - untracked: $untrackedCount")
$pulse.Add("  - other: $otherCount")
$pulse.Add("")
$pulse.Add("## Validator Results")
$pulse.Add("")
$pulse.Add("- Agent 6 validation queue: status=$agent6Status warnings=$agent6Warnings command_exit=$($agent6Result.ExitCode).")
$pulse.Add("- Agent 7 governance control: status=$agent7Status issues=$agent7Issues warnings=$agent7Warnings command_exit=$($agent7Result.ExitCode).")
$pulse.Add("- Git status command exit: $($statusResult.ExitCode).")
$pulse.Add("- Git ahead/behind command exit: $($aheadBehindResult.ExitCode).")
$pulse.Add("- Git latest-commit command exit: $($latestCommitResult.ExitCode).")
$pulse.Add("")
$pulse.Add("Known Agent 7 warning baseline:")
$pulse.Add("")
$pulse.Add("- Legacy workbench ``handoff-index.json`` has 0 manifests; ``public-handoff-index.json`` remains current authority.")
$pulse.Add("")
$pulse.Add("## New Relevant Reports Since Previous IT Pulse")
$pulse.Add("")
if ($newReports.Count -eq 0) {
  $pulse.Add("- None detected.")
} else {
  foreach ($report in $newReports) {
    $rel = "reports/" + $report.Name
    $pulse.Add("- ``$rel`` ($($report.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ssK")))")
  }
}
$pulse.Add("")
$pulse.Add("## Agent 7 Actionable Memo")
$pulse.Add("")
if ($actionItems.Count -eq 0) {
  $pulse.Add("No new Agent 10-to-Agent 7 memo was created in this pulse.")
  $pulse.Add("")
  $pulse.Add("Reason: no machine-detected IT escalation condition changed beyond the known Agent 7 handoff warning baseline.")
} else {
  $memoName = "agent10-agent7-it-actionable-findings-$stamp.md"
  $pulse.Add("Created:")
  $pulse.Add("")
  $pulse.Add("- ``reports/$memoName``")
  $pulse.Add("")
  $pulse.Add("Reason:")
  $pulse.Add("")
  foreach ($item in $actionItems) {
    $pulse.Add("- $item")
  }
}
$pulse.Add("")
$pulse.Add("## IT Interpretation")
$pulse.Add("")
$pulse.Add("This pulse is monitoring and reporting only. Validator pass output is not treated as QA acceptance.")
Add-NotAccepted -Lines $pulse

Set-Content -LiteralPath $pulsePath -Value $pulse -Encoding UTF8

if (-not (Test-Path -LiteralPath $ledgerPath)) {
  $ledger = New-Object System.Collections.Generic.List[string]
  $ledger.Add("# Agent 10 IT Change Ledger")
  $ledger.Add("")
  $ledger.Add("Generated: $iso")
  $ledger.Add("Agent: Agent 10 / ITer-10")
  $ledger.Add("Workspace: ``$root``")
  $ledger.Add("Status: IT-side change disclosure")
  $ledger.Add("")
  $ledger.Add("## Purpose")
  $ledger.Add("")
  $ledger.Add("This ledger records Agent 10 file changes and validator-refresh side effects.")
  Set-Content -LiteralPath $ledgerPath -Value $ledger -Encoding UTF8
}

$entry = New-Object System.Collections.Generic.List[string]
$entry.Add("")
$entry.Add("## $iso Entry")
$entry.Add("")
$entry.Add("Directly authored by Agent 10 runner:")
$entry.Add("")
$entry.Add("- ``reports/agent10-it-pulse-$stamp.md``")
if ($actionItems.Count -gt 0) {
  $entry.Add("- ``reports/agent10-agent7-it-actionable-findings-$stamp.md``")
}
$entry.Add("")
$entry.Add("Validator-refreshed files caused by Agent 10 checks:")
$entry.Add("")
$entry.Add("- ``reports/agent6-validation-queue-health.md``")
$entry.Add("- ``reports/agent7-governance-control-health.md``")
$entry.Add("")
$entry.Add("Purpose:")
$entry.Add("")
$entry.Add("- Run scheduled/manual IT pulse.")
$entry.Add("- Record repo health, validator state, new Agent 6/7/10 reports, and any Agent 7 escalation condition.")
$entry.Add("")
$entry.Add("Boundaries:")
$entry.Add("")
$entry.Add("- No Agent 6 queue/status edits.")
$entry.Add("- No Agent 6 docket edits.")
$entry.Add("- No public/generated page edits.")
$entry.Add("- No source, lexical, route, or control-state JSON edits.")
$entry.Add("- No Agent 6/7 validator script edits.")
Add-Content -LiteralPath $ledgerPath -Value $entry -Encoding UTF8

if ($actionItems.Count -gt 0) {
  $memoPath = Join-Path $reportsDir "agent10-agent7-it-actionable-findings-$stamp.md"
  $memo = New-Object System.Collections.Generic.List[string]
  $memo.Add("# Agent 10 To Agent 7: IT Actionable Findings")
  $memo.Add("")
  $memo.Add("Generated: $iso")
  $memo.Add("From: Agent 10 / ITer-10")
  $memo.Add("To: Agent 7")
  $memo.Add("Scope: machine-detected IT escalation")
  $memo.Add("")
  $memo.Add("## Findings")
  $memo.Add("")
  foreach ($item in $actionItems) {
    $memo.Add("- $item")
  }
  $memo.Add("")
  $memo.Add("## Evidence")
  $memo.Add("")
  $memo.Add("- ``reports/agent10-it-pulse-$stamp.md``")
  $memo.Add("- ``reports/agent6-validation-queue-health.md``")
  $memo.Add("- ``reports/agent7-governance-control-health.md``")
  $memo.Add("")
  $memo.Add("## Boundary")
  $memo.Add("")
  $memo.Add("Agent 10 is not adding a QA verdict. This memo is an IT escalation for Agent 7 attention only.")
  Add-NotAccepted -Lines $memo
  Set-Content -LiteralPath $memoPath -Value $memo -Encoding UTF8
}

Write-Output "Agent 10 IT pulse written: $pulsePath"
if ($actionItems.Count -gt 0) {
  Write-Output "Agent 7 actionable memo created."
} else {
  Write-Output "No Agent 7 actionable memo created."
}
