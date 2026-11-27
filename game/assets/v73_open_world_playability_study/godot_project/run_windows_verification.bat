@echo off
REM VERDANT SIGNAL V7.3 — Real Godot 4.7.2 Open-World Playability Verification Launcher (Windows)
REM Usage:
REM   run_windows_verification.bat         -> Launches playable V7.3 open world (WASD+Shift, F3 ColDebug, F4 PerfHUD, 1-8 Biomes)
REM   run_windows_verification.bat capture -> Auto-captures 9 native 640x360 gameplay, boundary & collision-debug PNGs from Godot!
setlocal
if "%GODOT_EXE%"=="" set GODOT_EXE=godot
if /i "%1"=="capture" (
  echo Running Godot 4.7.2 V7.3 automated native 640x360 capture...
  "%GODOT_EXE%" --path "%~dp0." -- --capture-proofs
) else (
  echo Launching Godot 4.7.2 V7.3 Open-World Forest Study...
  "%GODOT_EXE%" --path "%~dp0."
)
endlocal
