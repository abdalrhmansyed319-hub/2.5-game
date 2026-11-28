@echo off
setlocal
REM VERDANT SIGNAL — One-Step Windows Godot 4.7.2 Error Capture Wrapper
REM Usage:
REM   tools\run_windows_diagnostics.bat "C:\path\to\Godot_v4.7.2-stable_win64_console.exe"
REM Or drag-and-drop your Godot console .exe onto this script!

if "%~1"=="" (
    echo Running auto-detect diagnostic capture...
    python "%~dp0collect_godot_diagnostics.py"
) else (
    echo Running diagnostic capture with: "%~1"
    python "%~dp0collect_godot_diagnostics.py" --godot "%~1"
)

echo.
echo Diagnostic report saved to: docs\quality\GODOT_DIAGNOSTIC_CAPTURE.md
echo You can paste docs\quality\GODOT_DIAGNOSTIC_CAPTURE.md directly into chat!
pause
