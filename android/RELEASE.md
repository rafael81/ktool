# K문서 PDF Google Play 출시 절차

이 문서는 `com.kdocumenttool.pdf`의 최초 Google Play 출시를 위한 실행 체크리스트입니다. Play Console 메뉴 이름은 2026년 7월 기준 공식 도움말과 일치하도록 작성했습니다.

별도 설명이 없는 셸 명령은 저장소의 `android/` 디렉터리에서 실행합니다.

## 1. 출시 전 고정값 확인

첫 AAB를 업로드하기 전에 다음 값을 확인합니다.

```text
applicationId: com.kdocumenttool.pdf
versionCode:   1
versionName:   1.0.0
minSdk:        24
targetSdk:     36
```

Google Play에서 패키지 이름은 고유하고 영구적이며 첫 업로드 후 변경하거나 재사용할 수 없습니다. 각 후속 릴리스에서는 `versionCode`를 반드시 증가시킵니다.

기능 기준도 함께 확인합니다.

- JPG, PNG, WebP만 선택 가능
- 이미지 최대 10장
- 순서 변경, 삭제, A4 세로/가로와 3단계 여백 설정 가능
- PDF가 사용자가 선택한 위치에 저장됨
- 로그인, 광고, 분석, 원격 로깅이 없음
- 매니페스트에 `uses-permission`이 없음
- 비행기 모드에서도 전체 변환 흐름이 동작함

### 2026-07-11 검증된 최초 출시 산출물

| 항목 | 결과 |
|---|---|
| AAB | `app/build/outputs/bundle/release/app-release.aab` |
| SHA-256 | `9491b3df9102bc1f4ed9aab4bf2a7641648f98405950ff180e065a752833900a` |
| 서명 | `jarsigner -verify` 통과, 위 업로드 인증서 지문과 일치 |
| JVM 테스트 | 9개 통과 |
| API 24 · 1GB RAM | 계측 테스트 24개 통과, EXIF 방향 2~8과 10장 PDF 포함 |
| API 36 | 계측 테스트 23개 통과 |
| 수동 저장 | 이미지 3장, A4 가로·좁은 여백 PDF 저장 및 3페이지/842×595pt 확인 |
| 개인정보처리방침 | `https://k-document-tool.pages.dev/privacy/` HTTP 200 및 앱 이름·패키지 ID 확인 |

소스 또는 릴리스 설정이 바뀌면 이 표의 AAB 해시와 테스트 결과를 새 산출물 기준으로 갱신합니다.

## 2. 테스트 실행

JDK와 Android SDK를 설정한 뒤 정적 검사와 단위 테스트를 실행합니다.

```sh
cd android
./gradlew --no-daemon clean :app:testDebugUnitTest :app:lintRelease
```

연결된 기기 또는 에뮬레이터에서 계측 테스트를 실행합니다.

```sh
adb devices
./gradlew --no-daemon :app:connectedDebugAndroidTest
```

수동 출시 점검도 수행합니다.

1. JPG, PNG, WebP를 각각 포함해 10장을 선택합니다.
2. 첫 장, 중간 장, 마지막 장의 순서를 바꾸고 한 장을 삭제합니다.
3. A4 세로/가로와 각 여백 옵션 조합으로 PDF를 생성합니다.
4. 같은 파일 이름이 있는 위치와 쓰기 불가능한 위치에서 취소/오류 처리를 확인합니다.
5. 생성된 PDF의 페이지 수, 이미지 순서, A4 크기, 열기 가능 여부를 확인합니다.
6. 화면 회전, 백그라운드 복귀, 저장 취소 후 앱이 정상 상태인지 확인합니다.
7. 비행기 모드에서 이미지 선택부터 PDF 저장까지 완료합니다.

## 3. 업로드 키 준비

Google Play의 Play App Signing은 배포용 앱 서명 키를 Google이 보관하고, 개발자는 업로드 키로 AAB에 서명하는 방식입니다. 업로드 키 저장소는 저장소 밖의 보안 위치에 만들고 별도 백업합니다.

현재 작업 환경에는 다음 업로드 키가 준비되어 있습니다.

| 항목 | 값 |
|---|---|
| Key store | `~/.android/keystores/kdocument-pdf-upload.jks` |
| Alias | `upload` |
| Keychain service | `com.kdocumenttool.pdf.upload-keystore` |
| Keychain account | `upload` |
| Public certificate | `release/upload_certificate.pem` |
| Certificate SHA-256 | `EC:90:70:6C:8F:11:2F:82:D6:51:A1:EE:84:20:1F:73:D5:A2:15:4E:11:4C:42:0E:BC:A8:45:33:5F:1F:C8:72` |

비밀값을 출력하지 않고 파일과 Keychain 항목을 확인합니다.

```sh
test -r "$HOME/.android/keystores/kdocument-pdf-upload.jks"
security find-generic-password \
  -a upload \
  -s com.kdocumenttool.pdf.upload-keystore >/dev/null
keytool -printcert -file release/upload_certificate.pem
```

Play Console에 등록된 인증서와 `release/upload_certificate.pem`의 SHA-256 지문이 같은지 확인합니다. 첫 업로드 후에는 임의로 새 키를 만들지 말고, 키 분실 또는 유출 시 Play Console의 업로드 키 재설정 절차를 사용합니다.

최초 Play 업로드 전이고 현재 키를 사용하지 않기로 명시적으로 결정했거나, Play Console에서 키 재설정을 승인받은 경우에만 다음 예시로 새 키를 생성합니다. `10000`일은 Google이 권장하는 최소 25년보다 긴 유효기간입니다.

```sh
mkdir -p "$HOME/.android/keystores"
keytool -genkeypair -v \
  -keystore "$HOME/.android/keystores/kdocument-pdf-upload.jks" \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

보안 원칙:

- `.jks` 파일과 암호를 서로 다른 보안 저장소에 백업합니다.
- 키 저장소와 암호를 Git, 이슈, CI 로그, 메신저에 올리지 않습니다.
- Play Console의 앱 서명 키와 로컬 업로드 키를 구분합니다.
- 업로드 키를 잃거나 유출하면 Play Console에서 업로드 키 재설정을 요청합니다.

## 4. 서명 환경 변수 설정

macOS의 기본 출시 경로는 Keychain 연동 도우미입니다.

```sh
cd android
./scripts/build-release.sh
```

도우미는 Keychain에서 암호를 읽고 다음 네 변수를 프로세스 안에서 설정한 뒤 `testDebugUnitTest`, `lintRelease`, `bundleRelease`를 실행합니다. 다른 운영체제 또는 CI에서 직접 빌드할 때는 같은 변수 이름을 사용합니다.

```sh
export KDOCUMENT_KEYSTORE_PATH="$HOME/.android/keystores/kdocument-pdf-upload.jks"
export KDOCUMENT_KEYSTORE_PASSWORD='<secret-manager value>'
export KDOCUMENT_KEY_ALIAS='upload'
export KDOCUMENT_KEY_PASSWORD='<secret-manager value>'
```

값을 출력하지 않고 누락 여부만 검사합니다.

```sh
for name in \
  KDOCUMENT_KEYSTORE_PATH \
  KDOCUMENT_KEYSTORE_PASSWORD \
  KDOCUMENT_KEY_ALIAS \
  KDOCUMENT_KEY_PASSWORD
do
  if [ -z "$(printenv "$name")" ]; then
    echo "missing: $name" >&2
    exit 1
  fi
done
```

현재 `app/build.gradle.kts`는 환경 변수만 읽습니다. `keystore.properties`, `gradle.properties` 또는 `./gradlew -P...` 값은 서명 설정으로 사용되지 않습니다.

네 변수 중 하나라도 없으면 릴리스 signing config가 생성되지 않습니다. `validateReleaseSigning`은 `bundleRelease`, `assembleRelease`와 실제 패키징 작업에 연결되어 있어 누락된 값이 있으면 즉시 실패합니다. 따라서 Gradle을 직접 실행해도 서명되지 않은 릴리스 AAB가 만들어지지 않습니다.

## 5. 서명된 AAB 생성 및 검증

```sh
./scripts/build-release.sh
```

출력 파일:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

AAB의 JAR 서명과 인증서를 확인합니다.

```sh
LC_ALL=C jarsigner -verify -verbose -certs \
  app/build/outputs/bundle/release/app-release.aab
shasum -a 256 app/build/outputs/bundle/release/app-release.aab
```

`jarsigner`가 `jar verified`를 출력하지 않으면 Play Console에 업로드하지 않습니다. 빌드 로그와 명령 기록에 비밀값이 노출되지 않았는지도 확인합니다.

## 6. Play Console에서 앱 생성

이 단계부터는 Play 개발자 계정 소유자가 직접 수행합니다.

먼저 계정의 **Developer account > About you**와 Dashboard에 남은 확인 작업이 없는지 봅니다.

- 개인 계정: 결제 프로필의 법적 이름·주소와 신분증 확인, 연락 이메일·전화번호 확인
- 한국 개인 개발자: 게시 차단을 피하도록 개발자 전화번호까지 확인
- 조직 계정: 법인 정보와 필요한 D-U-N-S 자료 확인
- 신규 개인 계정: 계정 소유자가 Play Console 모바일 앱을 사용해 루팅되지 않은 Android 10 이상 실제 기기를 확인

기기 확인 작업이 보이면 웹 Play Console의 QR 코드를 실제 기기로 스캔하고, Play Console 모바일 앱에 계정 소유자 Google 계정으로 로그인해 **Verify**를 완료합니다.

1. [Play Console](https://play.google.com/console/)에서 **All apps > Create app**을 선택합니다.
2. 기본 언어를 **Korean – ko-KR**로 선택하고 앱 이름을 **K문서 PDF**로 입력합니다.
3. **App**, **Free**를 선택합니다. 가격 정책은 계정 소유자가 최종 확인합니다.
4. 사용자가 연락할 수 있는 지원 이메일을 입력합니다.
5. Developer Program Policies, 미국 수출법 관련 선언을 확인하고 Play App Signing 약관에 동의합니다.
6. **Create app**을 선택합니다.

첫 AAB를 업로드하면 `com.kdocumenttool.pdf`가 해당 Play 앱에 영구적으로 연결됩니다.

공식 절차: [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)

계정 확인 안내:

- [Verify your developer identity information](https://support.google.com/googleplay/android-developer/answer/10841920?hl=en)
- [Device verification requirements for new developer accounts](https://support.google.com/googleplay/android-developer/answer/14316361?hl=en)

## 7. 스토어 등록정보 입력

**Grow users > Store presence > Main store listing**에서 다음 파일을 붙여 넣습니다.

| Play 필드 | 한국어 | 영어 |
|---|---|---|
| App name | `fastlane/metadata/android/ko-KR/title.txt` | `fastlane/metadata/android/en-US/title.txt` |
| Short description | `fastlane/metadata/android/ko-KR/short_description.txt` | `fastlane/metadata/android/en-US/short_description.txt` |
| Full description | `fastlane/metadata/android/ko-KR/full_description.txt` | `fastlane/metadata/android/en-US/full_description.txt` |

영어는 등록정보의 번역 관리에서 **English (United States) – en-US**를 추가합니다. Play 제한은 앱 이름 30자, 짧은 설명 80자, 자세한 설명 4,000자입니다.

필수 그래픽을 업로드합니다.

- Play 스토어 아이콘: 512×512, 32-bit PNG, 최대 1,024KB
- 기능 그래픽: 1,024×500, JPEG 또는 alpha 없는 24-bit PNG
- 휴대전화 스크린샷: 최소 2장, JPEG 또는 alpha 없는 24-bit PNG, 각 변 320–3,840px
- 권장: 실제 앱 화면을 보여주는 1,080×1,920 세로 스크린샷 4장 이상

추천 스크린샷 순서:

1. 이미지 선택 전 첫 화면: `artwork/screenshots/phone-01-home.jpg`
2. 여러 이미지와 순서 변경 화면: `artwork/screenshots/phone-02-images.jpg`
3. A4 여백 설정 화면: `artwork/screenshots/phone-03-options.jpg`
4. PDF 저장 완료 화면: `artwork/screenshots/phone-04-success.jpg`

위 네 파일은 모두 1,080×1,920 JPEG이며 알파 채널이 없습니다. 같은 폴더의 PNG는 제작 원본이므로 Play 업로드에 사용하지 않습니다.

공식 규격: [Add preview assets to showcase your app](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)

## 8. Store settings와 App content 완료

### Store settings

**Grow users > Store presence > Store settings**에서 다음을 설정합니다.

- Category: 문서 생성·변환 앱에 해당하는 **Productivity** 권장. 계정 소유자가 최종 확인
- 지원 이메일: 필수
- 웹사이트와 지원 전화번호: 보유한 경우 입력
- 국가/지역과 배포 가격: 계정 소유자가 결정

공식 분류 기준: [Choose a category and tags for your app or game](https://support.google.com/googleplay/android-developer/answer/9859673?hl=en)

### App content 권장 답변

**Policy and programs > App content**에서 각 항목을 실제 출시 빌드와 대조합니다.

| 항목 | 현재 빌드 기준 답변 | 근거 |
|---|---|---|
| Ads | **No, my app does not contain ads** | 광고 SDK와 광고 화면 없음 |
| App access | **All functionality is available without special access** | 로그인, 회원가입, 지역/멤버십 제한 없음 |
| Data safety | 아래 별도 표대로 **수집 또는 공유 없음** | 기기 밖 전송과 네트워크 권한 없음 |
| Content rating | Utility/Productivity 기능에 맞게 설문 작성 | 사용자 생성 이미지를 로컬 변환할 뿐 앱이 콘텐츠를 제공하지 않음 |
| Target audience | 실제 마케팅 대상 연령만 선택 | 어린이를 포함하면 Families 정책이 추가 적용될 수 있음 |
| Contains ads declaration | **No** | 광고 없음 |
| High-risk permissions | 해당 없음 | 선언된 Android 권한 없음 |

정부, 금융, 건강, 뉴스, 소셜 기능 관련 추가 선언이 나타나면 현재 앱에는 해당하지 않으므로 질문 문구를 읽고 사실대로 **No**를 선택합니다. Play Console 질문은 계정과 국가에 따라 달라질 수 있으므로 보이지 않는 항목을 억지로 찾을 필요는 없습니다.

### Data safety 정확한 답변

**Policy and programs > App content > Data safety > Start**에서 다음과 같이 답합니다.

| 질문 | 답변 |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Data types collected | **None** |
| Data types shared | **None** |

사진과 파일은 민감할 수 있지만, Google Play의 Data safety 정의에서 “collect”는 앱이 사용자 기기 밖으로 데이터를 전송하는 것을 뜻합니다. 기기에서만 접근하고 처리하는 데이터는 수집으로 신고하지 않아도 됩니다. 이 앱은 Android 사진 선택기로 사용자가 고른 이미지만 읽고, 시스템 문서 저장 화면에서 사용자가 지정한 위치로 PDF를 내보냅니다. 앱 자체에는 `INTERNET` 또는 저장소 권한이 없습니다.

사용자가 시스템 저장 화면에서 클라우드 문서 제공자를 직접 선택하는 경우에도 저장 대상과 전송은 사용자가 명시적으로 시작합니다. 기본 앱이 파일을 임의의 서버로 전송하지 않는다는 전제에서 위 답변을 사용하되, 저장 흐름이나 제공자 연동을 바꾸면 Google의 사용자 시작 전송 예외를 다시 검토합니다.

이 답변은 다음 조건이 모두 유지될 때만 유효합니다.

- 네트워크 권한이나 WebView가 없음
- 분석, 광고, 충돌 보고, 원격 설정 SDK가 없음
- 이미지, 파일명, 사용 이벤트 또는 기기 식별자를 서버로 전송하지 않음
- PDF 저장은 사용자가 명시적으로 시작한 시스템 저장 작업뿐임

향후 조건이 하나라도 바뀌면 AAB 업로드 전에 Data safety 양식을 다시 작성합니다. Play Console이 SDK 또는 데이터 유형을 감지해 경고하면 **No**를 강제로 제출하지 말고 의존성과 병합된 매니페스트를 다시 감사합니다.

공식 기준: [Provide information for Google Play's Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)

### 개인정보처리방침

데이터를 수집하지 않는 앱도 다음 두 위치에 개인정보처리방침이 필요합니다.

1. Play Console의 지정된 Privacy policy URL 필드: `https://k-document-tool.pages.dev/privacy/`
2. 앱 안의 **개인정보처리방침** 버튼과 외부 브라우저 실패 시 표시되는 앱 내 정책 요약

정책에는 최소한 다음을 포함합니다.

- Play 등록정보와 동일한 개발자/법인 이름
- 개인정보 문의 이메일 또는 연락 방법
- 앱이 사용자가 선택한 사진을 기기에서만 처리한다는 설명
- 개발자 서버에는 데이터를 수집, 전송, 공유하거나 보관하지 않으며, 선택 이미지 URI와 옵션은 Android 작업 복구를 위해 기기에만 일시 저장된다는 설명
- PDF는 사용자가 선택한 위치에 저장되고 이후 보관/삭제는 사용자가 관리한다는 설명
- 광고, 분석, 계정 기능이 없다는 설명
- 정책 시행일과 변경 연락 방법

현재 저장소의 앱 전용 정책 페이지를 웹사이트에 배포한 뒤 위 URL이 로그인 없이 HTTP 200으로 열리고 `K문서 PDF`와 `com.kdocumenttool.pdf`를 명시하는지 확인합니다. 기존의 일반 웹사이트 정책 페이지만 노출되거나 URL이 지역 제한·로그인을 요구하면 제출하지 않습니다. 개발자 법적 이름과 문의 연락처가 Play 등록정보 및 정책 페이지에서 일치하는지는 계정 소유자가 최종 확인해야 합니다.

공식 정책: [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)

## 9. 테스트 트랙에 첫 AAB 배포

먼저 내부 테스트를 권장합니다.

1. **Test and release > Testing > Internal testing**을 엽니다.
2. **Testers** 탭에서 이메일 목록을 만들고 테스터를 추가합니다.
3. **Releases > Create new release**를 선택합니다.
4. 첫 릴리스에서 Play App Signing을 설정합니다. 일반적인 선택은 Google이 앱 서명 키를 생성·보관하고, 로컬 키를 업로드 키로 사용하는 방식입니다.
5. `app-release.aab`를 업로드합니다.
6. 한국어와 영어 출시 노트는 각 로케일의 `changelogs/1.txt`를 사용합니다.
7. 오류를 모두 해결한 뒤 **Save as draft > Next > Start rollout to Internal testing**을 선택합니다.
8. 테스터 참여 링크를 공유하고 실제 Play 설치본으로 핵심 흐름을 다시 확인합니다.

개인 개발자 계정이 2023년 11월 13일 이후 생성됐다면 프로덕션 접근 전에 비공개 테스트에 최소 12명이 14일 연속으로 참여해야 합니다. 요건을 충족한 뒤 Dashboard에서 **Apply for production**을 선택하고 테스트 참여, 피드백, 수정 사항, 프로덕션 준비 근거를 제출합니다.

공식 안내:

- [Set up an open, closed, or internal test](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)
- [Testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)

## 10. 프로덕션 출시

스토어 등록정보, App content, 가격/국가 설정, 필요한 테스트가 모두 완료된 뒤 진행합니다.

1. **Test and release > Production**에서 **Create new release**를 선택합니다.
2. 검증한 AAB를 업로드하거나 App bundle explorer의 기존 빌드를 추가합니다.
3. Play App Signing 상태와 업로드 인증서를 확인합니다.
4. 버전 이름, 버전 코드, 지원 기기, 경고를 검토합니다.
5. `changelogs/1.txt`의 출시 노트를 각 언어에 입력합니다.
6. **Next**를 선택하고 Errors summary의 모든 오류를 해결합니다.
7. **Start rollout to production** 또는 Publishing overview의 **Send for review**를 선택합니다.
8. 심사 상태와 Policy status를 확인합니다. 승인 후 실제 Play 스토어 페이지와 설치본을 확인합니다.

첫 프로덕션 롤아웃은 선택한 모든 국가의 사용자에게 앱을 게시합니다. 이후 업데이트에는 단계적 출시 비율을 사용할 수 있습니다.

공식 절차: [Prepare and roll out a release](https://support.google.com/googleplay/android-developer/answer/9859348/prepare-and-roll-out-a-release?hl=en)

## 계정 소유자에게 남는 작업

다음 항목은 코드나 자동화만으로 완료할 수 없습니다.

- Play 개발자 계정 등록, 결제, 개인 또는 조직 신원 확인
- 신규 개인 계정의 실제 Android 기기 확인
- 조직 계정인 경우 D-U-N-S 등 계정 확인 자료
- 표시할 개발자 이름, 법적 이름, 지원 이메일/전화/웹사이트 확정
- 앱 전용 개인정보처리방침 배포·내용 확인 및 개발자 이름/연락처 일치 확인
- 앱 가격, 국가/지역, 카테고리, 태그, 목표 연령 선택
- Play 스토어 아이콘, 기능 그래픽, 실제 기기 스크린샷 제작
- Play App Signing 옵션 승인과 업로드 키의 안전한 보관
- 필요한 테스터 모집, 14일 비공개 테스트 및 피드백 기록
- 프로덕션 접근 신청 답변과 최종 **Send for review/Start rollout** 승인

## 문제 해결

### `JAVA_HOME` 또는 Java Runtime 오류

```sh
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
```

`java -version`이 JDK 17을 표시한 뒤 빌드를 다시 실행합니다.

### Keychain 항목을 찾지 못함

```sh
security find-generic-password \
  -a upload \
  -s com.kdocumenttool.pdf.upload-keystore >/dev/null
```

명령이 실패하면 계정 소유자의 보안 백업에서 기존 암호를 복구합니다. 이미 Play에 등록한 앱이라면 새 업로드 키를 임의로 만들지 말고 Play Console의 업로드 키 재설정 절차를 사용합니다.

### `bundleRelease`는 성공했지만 `jarsigner` 검증 실패

Gradle을 직접 실행하면서 네 서명 변수가 빠진 경우입니다. `./scripts/build-release.sh`를 사용하고, 네 변수를 모두 감지하는지 확인한 뒤 AAB를 다시 만듭니다. 검증에 실패한 AAB는 업로드하지 않습니다.

### Play가 version code 중복을 보고함

`app/build.gradle.kts`의 `versionCode`를 이전 Play 업로드보다 큰 값으로 올립니다. 같은 `versionCode`의 AAB는 다른 트랙에 있거나 보관된 빌드라도 다시 업로드할 수 없습니다.

### 프로덕션 메뉴가 비활성화됨

Dashboard에서 계정·실제 기기 확인 작업과 프로덕션 접근 요건을 확인합니다. 2023년 11월 13일 이후 생성된 개인 계정은 비공개 테스트 12명·14일 연속 요건과 **Apply for production** 승인이 필요할 수 있습니다.

### 개인정보처리방침 URL에 일반 웹 정책만 보임

현재 저장소의 앱 전용 `/privacy/` 페이지를 배포하고 CDN 반영을 기다린 뒤 다시 확인합니다. 페이지에 `K문서 PDF`, `com.kdocumenttool.pdf`, 개발자 연락 방법이 모두 표시되기 전에는 Play 심사를 제출하지 않습니다.

## 매 릴리스 체크리스트

- [ ] `versionCode` 증가, `versionName` 확인
- [ ] 단위 테스트, lint, 계측 테스트 통과
- [ ] 비행기 모드 수동 테스트 통과
- [ ] 권한·SDK·데이터 흐름 변경 여부 검토
- [ ] Data safety와 개인정보처리방침이 현재 빌드와 일치
- [ ] 네 서명 환경 변수 설정
- [ ] `bundleRelease` 성공 및 `jarsigner` 검증 통과
- [ ] AAB SHA-256 기록
- [ ] 한국어·영어 출시 노트 업데이트
- [ ] 내부/비공개 트랙 설치 검증
- [ ] Play Console 오류 0건 확인
- [ ] 계정 소유자가 최종 제출 승인
