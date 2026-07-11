# K문서 PDF Android

K문서 PDF는 JPG, PNG, WebP 이미지 최대 10장을 한 개의 A4 PDF로 만드는 네이티브 Android 앱입니다. 사용자는 이미지 순서와 페이지 여백을 정한 뒤 Android 시스템 저장 화면에서 PDF의 이름과 위치를 선택합니다.

앱의 핵심 원칙은 로컬 처리입니다. 선택한 이미지와 생성한 PDF를 서버로 보내지 않으며, 앱 자체는 인터넷 연결, 로그인, 광고, 분석 SDK를 사용하지 않습니다.

## 앱 사양

| 항목 | 값 |
|---|---|
| 앱 이름 | K문서 PDF |
| 패키지 ID | `com.kdocumenttool.pdf` |
| 최소 Android | API 24 (Android 7.0) |
| 대상/컴파일 SDK | API 36 |
| 최초 버전 | `versionCode 1`, `versionName 1.0.0` |
| 입력 | JPG, PNG, WebP 이미지, 최대 10장 |
| 출력 | 사용자 지정 위치에 저장하는 A4 PDF |
| 권한 | 선언된 Android 권한 없음 |
| 네트워크 | `INTERNET` 권한 없음, 평문 트래픽 차단 |

패키지 ID는 첫 Play 업로드 이후 변경하거나 다시 사용할 수 없으므로 업로드 전에 반드시 확인합니다.

## 지원 기능

- Android 시스템 사진 선택기로 최대 10장의 이미지 선택
- 선택한 이미지의 페이지 순서 변경 및 삭제
- A4 세로/가로 방향과 보통(12.7mm), 좁게(6.4mm), 없음 여백 설정
- 모든 이미지를 기기 안에서 PDF로 변환
- Storage Access Framework의 시스템 저장 화면으로 파일 이름과 저장 위치 선택
- 앱 전체 사진·동영상 또는 저장소 권한 없이 동작

## 개발 환경

- Android Studio와 Android SDK 36
- JDK 17 이상. Gradle 빌드는 JVM 17 툴체인을 사용합니다.
- 프로젝트에 포함된 Gradle Wrapper 9.1.0
- 테스트 기기 또는 API 24 이상 에뮬레이터

이 작업 환경의 macOS/Homebrew JDK 17은 다음과 같이 설정합니다.

```sh
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
```

다른 환경에서는 Android Studio의 Gradle JDK를 17로 설정하거나 동등한 JDK 17 경로를 `JAVA_HOME`에 지정합니다.

## 빌드와 테스트

저장소 루트에서 Android 프로젝트로 이동한 뒤 실행합니다.

```sh
cd android
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest :app:lintDebug
```

연결된 기기 또는 실행 중인 에뮬레이터가 있으면 계측 테스트도 실행합니다.

```sh
adb devices
./gradlew :app:connectedDebugAndroidTest
```

디버그 APK는 `app/build/outputs/apk/debug/app-debug.apk`에 생성됩니다.

설치된 Android CLI로 API 36 에뮬레이터를 시작하고 APK를 실행할 수도 있습니다.

```sh
export PATH="$HOME/.local/bin:$PATH"
android emulator start Medium_Phone_API_36
android run --apks=app/build/outputs/apk/debug/app-debug.apk
```

Android CLI 설치와 명령은 [Android CLI 공식 문서](https://developer.android.com/tools/agents/android-cli?hl=ko)를 참고합니다.

## 릴리스 빌드

현재 macOS 작업 환경에서는 릴리스 도우미가 `~/.android/keystores/kdocument-pdf-upload.jks`와 macOS Keychain의 암호를 읽어 테스트, lint, 서명된 AAB 생성을 한 번에 실행합니다.

```sh
cd android
./scripts/build-release.sh
```

Keychain 항목은 service `com.kdocumenttool.pdf.upload-keystore`, account `upload`을 사용합니다. 공개 업로드 인증서는 `release/upload_certificate.pem`에 있으며 Play Console 등록 또는 인증서 대조에 사용할 수 있습니다.

다른 개발 환경이나 CI에서는 다음 네 환경 변수를 모두 직접 설정해야 릴리스 서명이 활성화됩니다.

- `KDOCUMENT_KEYSTORE_PATH`
- `KDOCUMENT_KEYSTORE_PASSWORD`
- `KDOCUMENT_KEY_ALIAS`
- `KDOCUMENT_KEY_PASSWORD`

현재 빌드는 `keystore.properties`, `gradle.properties` 또는 임의의 `-P` 서명 속성을 읽지 않습니다. 네 값 중 하나라도 없으면 `validateReleaseSigning`이 `bundleRelease`, `assembleRelease`와 실제 패키징 작업을 중단하므로 서명되지 않은 릴리스가 만들어지지 않습니다. 키 저장소, 암호 또는 실제 비밀값을 Git에 커밋하지 마세요.

전체 서명, 검증, Play Console 절차는 [RELEASE.md](RELEASE.md)를 따릅니다.

## 주요 경로

| 경로 | 역할 |
|---|---|
| `app/src/main/AndroidManifest.xml` | 앱 구성과 권한 없는 매니페스트 |
| `app/src/main/java/com/kdocumenttool/pdf/` | Compose UI와 PDF 처리 코드 |
| `app/src/test/` | JVM 단위 테스트 |
| `app/src/androidTest/` | 기기/에뮬레이터 계측 테스트 |
| `app/build.gradle.kts` | 버전, SDK, 축소, 릴리스 서명 설정 |
| `scripts/build-release.sh` | Keychain 기반 테스트·lint·서명 AAB 빌드 |
| `release/upload_certificate.pem` | Play Console에 등록할 수 있는 공개 업로드 인증서 |
| `fastlane/metadata/android/` | 한국어·영어 Google Play 등록 문구 |

## 개인정보 및 보안 기준

- 사진과 문서는 기능 수행을 위해 기기에서만 읽고 처리합니다.
- PDF는 사용자가 명시적으로 선택한 문서 위치에만 기록합니다.
- 앱은 계정을 만들거나 사용자 식별자를 생성하지 않습니다.
- 광고, 분석, 원격 로깅, 충돌 수집 SDK를 추가하지 않습니다.
- 백업을 비활성화하고 앱 데이터가 클라우드 백업에 포함되지 않게 합니다.
- 앱의 개인정보처리방침 버튼은 `https://k-document-tool.pages.dev/privacy/`를 열며, 외부 브라우저를 열 수 없을 때 핵심 정책을 앱 안에 표시합니다.

라이브러리, 권한, 네트워크 기능 또는 데이터 처리 방식이 바뀌면 Play Console의 Data safety 답변과 개인정보처리방침을 릴리스 전에 다시 검토해야 합니다.

## 스토어 메타데이터

Fastlane 호환 텍스트는 다음 로케일에 있습니다.

- `fastlane/metadata/android/ko-KR/`
- `fastlane/metadata/android/en-US/`

각 로케일은 `title.txt`, `short_description.txt`, `full_description.txt`, `changelogs/1.txt`를 포함합니다. 그래픽 자산과 개발자 연락처는 계정 소유자가 Play Console에서 별도로 입력하고, 배포된 개인정보처리방침 URL이 공개 접근 가능한지 확인해야 합니다.
