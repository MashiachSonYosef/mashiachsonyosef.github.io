@echo off
cd /d C:\Users\owner\Documents\translations
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts\run_agent10_it_pulse.ps1 > reports\agent10-scheduled-task-last.md 2>&1
exit /b %ERRORLEVEL%
