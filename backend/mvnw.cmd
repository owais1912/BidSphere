@REM Maven Wrapper Script for Windows
@REM Generated for BidSphere project

@echo off
setlocal

set MAVEN_VERSION=3.9.6
set MAVEN_HOME_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin
set MAVEN_JAR=%MAVEN_HOME_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd

if not exist "%MAVEN_JAR%" (
    echo Downloading Maven %MAVEN_VERSION%...
    mkdir "%MAVEN_HOME_DIR%" 2>nul
    powershell -Command "& {Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile '%MAVEN_HOME_DIR%\maven.zip'}"
    powershell -Command "& {Expand-Archive -Path '%MAVEN_HOME_DIR%\maven.zip' -DestinationPath '%MAVEN_HOME_DIR%' -Force}"
    del "%MAVEN_HOME_DIR%\maven.zip"
)

"%MAVEN_HOME_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd" %*
