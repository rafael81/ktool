#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [[ -z "${JAVA_HOME:-}" && -d /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ]]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
  export PATH="$JAVA_HOME/bin:$PATH"
fi

if [[ -z "${KDOCUMENT_KEYSTORE_PATH:-}" && "$(uname -s)" == "Darwin" ]]; then
  KEYCHAIN_PASSWORD="$(
    security find-generic-password \
      -w \
      -a upload \
      -s com.kdocumenttool.pdf.upload-keystore
  )"
  export KDOCUMENT_KEYSTORE_PATH="$HOME/.android/keystores/kdocument-pdf-upload.jks"
  export KDOCUMENT_KEYSTORE_PASSWORD="$KEYCHAIN_PASSWORD"
  export KDOCUMENT_KEY_ALIAS=upload
  export KDOCUMENT_KEY_PASSWORD="$KEYCHAIN_PASSWORD"
fi

: "${KDOCUMENT_KEYSTORE_PATH:?Set KDOCUMENT_KEYSTORE_PATH to the upload keystore.}"
: "${KDOCUMENT_KEYSTORE_PASSWORD:?Set KDOCUMENT_KEYSTORE_PASSWORD.}"
: "${KDOCUMENT_KEY_ALIAS:?Set KDOCUMENT_KEY_ALIAS.}"
: "${KDOCUMENT_KEY_PASSWORD:?Set KDOCUMENT_KEY_PASSWORD.}"

./gradlew testDebugUnitTest lintRelease bundleRelease "$@"
