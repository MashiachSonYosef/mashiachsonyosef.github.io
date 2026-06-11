param(
  [int] $IntervalMinutes = 60,
  [switch] $RunImmediately
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptPath = $MyInvocation.MyCommand.Path
$root = Split-Path -Parent (Split-Path -Parent $scriptPath)
$reportsDir = Join-Path $root "reports"
$pidPath = Join-Path $reportsDir "agent10-it-loop.pid"
$heartbeatPath = Join-Path $reportsDir "agent10-it-loop-heartbeat.md"
$stopPath = Join-Path $reportsDir "agent10-it-loop.stop"
$runner = Join-Path $root "scripts\run_agent10_it_pulse_scheduled.cmd"

function Write-Heartbeat {
  param(
    [string] $Status,
    [string] $Detail = ""
  )

  $now = Get-Date
  $lines = @(
    '# Agent 10 IT Loop Heartbeat',
    "",
    "Updated: $($now.ToString('yyyy-MM-ddTHH:mm:ssK'))",
    "Process ID: $PID",
    "Interval minutes: $IntervalMinutes",
    "Status: $Status",
    "Detail: $Detail",
    "",
    'Stop command:',
    "",
    '```powershell',
    'scripts\stop_agent10_it_pulse_loop.ps1',
    '```',
    "",
    'Boundary: Agent 10 loop only invokes scripts\run_agent10_it_pulse_scheduled.cmd; it must not edit Agent 6 dockets, Agent 6 queue/status files, public/generated pages, source/lexical/route/control data, or Agent 6/7 validator scripts.'
  )
  Set-Content -LiteralPath $heartbeatPath -Value $lines -Encoding UTF8
}

if ($IntervalMinutes -lt 1) {
  throw "IntervalMinutes must be at least 1."
}

Set-Location $root
if (Test-Path -LiteralPath $stopPath) {
  Remove-Item -LiteralPath $stopPath -Force
}

Set-Content -LiteralPath $pidPath -Value $PID -Encoding ASCII
Write-Heartbeat -Status "starting" -Detail "Loop starting."

$first = $true
while ($true) {
  if (Test-Path -LiteralPath $stopPath) {
    Write-Heartbeat -Status "stopped" -Detail "Stop file detected."
    Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $stopPath -Force -ErrorAction SilentlyContinue
    exit 0
  }

  if ($RunImmediately -or -not $first) {
    Write-Heartbeat -Status "running pulse" -Detail "Invoking Agent 10 pulse runner."
    $process = Start-Process `
      -FilePath "cmd.exe" `
      -ArgumentList @("/c", $runner) `
      -WorkingDirectory $root `
      -WindowStyle Hidden `
      -PassThru `
      -Wait
    Write-Heartbeat -Status "sleeping" -Detail "Last pulse exit code: $($process.ExitCode)."
  } else {
    Write-Heartbeat -Status "sleeping" -Detail "Initial run skipped; waiting for first interval."
  }

  $first = $false
  Start-Sleep -Seconds ($IntervalMinutes * 60)
}
