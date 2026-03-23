#!/bin/bash
set -e

echo "▶ Building frontend..."
npm run build

echo "▶ Building Android APK..."
cargo tauri android build --debug --target aarch64

APK=/Users/nikitaf/development/projects/personalities/src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk

echo "▶ Installing on emulator..."
adb install -r "$APK"

echo "▶ Launching app..."
adb shell am start -n ru.nikmobdev.personadev/.MainActivity

echo "✅ Done"
