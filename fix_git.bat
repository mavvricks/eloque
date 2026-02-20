@echo off
echo Cleaning up old git setup...
rmdir /s /q .git

echo Initializing new repository...
git init

echo Configuring temporary git user...
git config user.email "temp@eloquente.com"
git config user.name "Eloquente Setup"

echo Adding files (this might take a few seconds)...
git add .

echo Creating initial commit...
git commit -m "Initial commit"

echo Setting up main branch...
git branch -M main

echo Linking to GitHub...
git remote add origin https://github.com/mavvricks/eloque

echo.
echo ==========================================
echo SUCCESS! Repository is ready.
echo ==========================================
echo Now type this command to upload:
echo.
echo git push -u origin main
echo.
pause
