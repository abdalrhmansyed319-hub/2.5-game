@echo off
setlocal
REM ============================================================================
REM VERDANT SIGNAL — Production V9.0 The Broken Shore + V8.0 Living Forest
REM Windows Godot 4.7.2 Verification & Runtime Proof Capture Harness
REM Target Hardware: Windows / Intel HD Graphics 3000 (GL Compatibility / ANGLE)
REM ============================================================================
REM Usage:
REM   run_production_v90_verification.bat "C:\Path\To\Godot_v4.7.2-stable_win64.exe"
REM   (If omitted, expects godot on PATH.)

set "GODOT_EXE=%~1"
if "%GODOT_EXE%"=="" set "GODOT_EXE=godot"

set "GAME_DIR=%~dp0.."

echo [1/3] Running headless production smoke & V9.0 + V8.0 unified integration assertions...
"%GODOT_EXE%" --headless --path "%GAME_DIR%" res://tests/smoke_runner.tscn
if errorlevel 1 (
    echo [ERROR] Headless smoke runner reported failures! Review output above.
    exit /b 1
)

echo.
echo [2/3] Capturing native 640x360 V9.0 Broken Shore + V8.0 Forest proofs & hardware FPS log...
"%GODOT_EXE%" --path "%GAME_DIR%" -- --capture-production-proofs
if errorlevel 1 (
    echo [ERROR] Automated production capture failed!
    exit /b 1
)
echo Captures saved to: %GAME_DIR%\godot_runtime_captures\

echo.
echo [3/3] Launching integrated VERDANT SIGNAL V9.0 production game interactively...
echo Controls: WASD Move ^| Shift Run ^| C Crouch ^| Q/RMB Lens ^| E Sample ^| 1-8 Shore+Forest Zones ^| T/F5 Mood ^| F6 Gust ^| F3 HUD ^| F4 Collision ^| F9 Screenshot
"%GODOT_EXE%" --path "%GAME_DIR%"
endlocal
