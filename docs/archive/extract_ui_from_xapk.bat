@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: =========[ Self-elevate to Admin if needed ]=========
>nul 2>&1 "%SystemRoot%\system32\cacls.exe" "%SystemRoot%\system32\config\system"
if '%errorlevel%' NEQ '0' (
  echo [*] Elevating privileges...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo.
echo ==============================================
echo   Java (Temurin 21) + apktool Auto Installer
echo ==============================================
echo.

:: =========[ Check winget ]=========
where winget >nul 2>&1
if errorlevel 1 (
  echo [!] winget غير متوفر. سنكمل بدونه، لكن يُفضّل تثبيته (Microsoft Store: App Installer).
  set "HAS_WINGET=0"
) else (
  set "HAS_WINGET=1"
)

:: =========[ 1) Install Java (Temurin 21) ]=========
java -version >nul 2>&1
if errorlevel 1 (
  echo [*] Java not found. Installing Temurin 21 (OpenJDK)...
  if "%HAS_WINGET%"=="1" (
    winget install --id EclipseAdoptium.Temurin.21.JDK -e --silent --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
      echo [!] winget install failed. ستحتاج تثبيت الجافا يدويًا (Temurin 21).
      echo     حمل من: https://adoptium.net/temurin/releases/?version=21
      pause
    )
  ) else (
    echo [!] winget غير متوفر. ثبّت جافا 21 يدويًا ثم أعد تشغيل السكربت.
    echo     Temurin 21: https://adoptium.net/temurin/releases/?version=21
    pause
  )
) else (
  echo [*] Java already installed.
)

:: =========[ Ensure java in PATH and set JAVA_HOME ]=========
where java >nul 2>&1
if errorlevel 1 (
  echo [!] java.exe still not found in PATH. أعد فتح نافذة جديدة بعد تثبيت الجافا ثم أعد التشغيل.
  pause
  goto :SKIP_JAVA_HOME
)

for /f "usebackq delims=" %%J in (`where java`) do set "JAVA_BIN=%%~dpJ"
:: JAVA_BIN ends with "\"
for /f "delims=" %%D in ("!JAVA_BIN:~0,-1!") do set "JAVA_DIR=%%~dpD"
:: JAVA_DIR usually ends with \bin\ .. we need parent (JAVA_HOME)
for %%P in ("!JAVA_DIR!..\") do set "JAVA_HOME=%%~fP"

echo [*] Detected JAVA_HOME = %JAVA_HOME%
setx /M JAVA_HOME "%JAVA_HOME%" >nul

:: Add %JAVA_HOME%\bin to PATH if missing
echo %PATH% | find /i "%JAVA_HOME%\bin" >nul
if errorlevel 1 (
  echo [*] Adding JAVA to system PATH...
  set "NEWPATH=%PATH%;%JAVA_HOME%\bin"
  setx /M PATH "%NEWPATH%" >nul
)

:SKIP_JAVA_HOME

:: =========[ 2) Download apktool (jar + bat) ]=========
set "TOOLS_DIR=%ProgramData%\apktool"
if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"

echo [*] Downloading apktool.jar and apktool.bat to %TOOLS_DIR% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference='SilentlyContinue';" ^
  "Invoke-WebRequest -Uri 'https://github.com/iBotPeaches/Apktool/releases/latest/download/apktool.jar' -OutFile '%TOOLS_DIR%\apktool.jar';" ^
  "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/windows/apktool.bat' -OutFile '%TOOLS_DIR%\apktool.bat'"

if not exist "%TOOLS_DIR%\apktool.jar" (
  echo [!] Failed to download apktool.jar
  pause & exit /b 1
)
if not exist "%TOOLS_DIR%\apktool.bat" (
  echo [!] Failed to download apktool.bat
  pause & exit /b 1
)

:: =========[ 3) Add apktool folder to PATH (system) ]=========
echo %PATH% | find /i "%TOOLS_DIR%" >nul
if errorlevel 1 (
  echo [*] Adding apktool folder to system PATH...
  set "NEWPATH=%PATH%;%TOOLS_DIR%"
  setx /M PATH "%NEWPATH%" >nul
)

:: =========[ 4) Verify ]=========
echo.
echo [*] Verifying installations...
for /f "tokens=1,2*" %%a in ('java -version 2^>^&1') do (
  echo     Java: %%a %%b %%c
  goto :AFTER_JAVA_ECHO
)
:AFTER_JAVA_ECHO

call "%TOOLS_DIR%\apktool.bat" -version
if errorlevel 1 (
  echo [!] apktool failed to run.
  echo     جرّب إغلاق وفتح PowerShell/Command Prompt جديد (لتحديث PATH).
  pause & exit /b 1
)

echo.
echo ==============================================
echo   All set! Java + apktool are ready.
echo   Close and reopen your terminal if needed.
echo ==============================================
echo.

endlocal
exit /b 0
