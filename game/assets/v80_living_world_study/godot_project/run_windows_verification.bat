@echo off
REM VERDANT SIGNAL V8.0 — Real Godot 4.7.2 Living World Verification Launcher (Windows / Intel HD 3000)
REM Usage:
REM   run_windows_verification.bat         -> Launches playable V8.0 Living World (WASD+Shift, F3 ColDebug, F4 PerfHUD, F5 Mood, F6 Gust, 1-8 Biomes)
REM   run_windows_verification.bat capture -> Auto-captures 7 native 640x360 PNGs across moods & Collision-Debug directly from Godot!
setlocal
if "%GODOT_EXE%"=="" set GODOT_EXE=godot
if /i "%1"=="capture" (
  echo Running Godot 4.7.2 V8.0 automated native 640x360 capture...
  "%GODOT_EXE%" --path "%~dp0." -- --capture-proofs
) else (
  echo Launching Godot 4.7.2 V8.0 Living World Forest Study...
  "%GODOT_EXE%" --path "%~dp0."
)
endlocal
