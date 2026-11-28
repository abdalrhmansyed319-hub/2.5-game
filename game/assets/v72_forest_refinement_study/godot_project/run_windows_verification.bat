@echo off
REM VERDANT SIGNAL V7.2 — Real Godot 4.7.2 Local Windows Verification Launcher
REM Usage:
REM   run_windows_verification.bat                -> Launches playable V7.2 forest in Godot 4.7.2
REM   run_windows_verification.bat capture        -> Auto-captures all 6 native 480x270 PNG proofs from Godot!
REM   (Set GODOT_EXE env var if godot is not on PATH, e.g. set GODOT_EXE=C:\Godot\Godot_v4.7.2-stable_win64.exe)

if "%GODOT_EXE%"=="" set GODOT_EXE=godot
set PROJ_DIR=%~dp0

if /I "%1"=="capture" (
  echo [V7.2] Running automated Godot 4.7.2 native 480x270 screenshot capture...
  "%GODOT_EXE%" --path "%PROJ_DIR%" -- --capture-proofs
) else (
  echo [V7.2] Launching playable Godot 4.7.2 V7.2 Forest Refinement Study...
  echo        Controls: WASD / Arrows to walk, 1/2/3/4/5 jump zones, F9 screenshot
  "%GODOT_EXE%" --path "%PROJ_DIR%"
)
