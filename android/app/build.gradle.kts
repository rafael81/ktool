plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.compose.compiler)
}

val releaseStoreFile = providers.environmentVariable("KDOCUMENT_KEYSTORE_PATH").orNull
val releaseStorePassword = providers.environmentVariable("KDOCUMENT_KEYSTORE_PASSWORD").orNull
val releaseKeyAlias = providers.environmentVariable("KDOCUMENT_KEY_ALIAS").orNull
val releaseKeyPassword = providers.environmentVariable("KDOCUMENT_KEY_PASSWORD").orNull
val hasReleaseSigning =
  listOf(releaseStoreFile, releaseStorePassword, releaseKeyAlias, releaseKeyPassword)
    .all { !it.isNullOrBlank() }

android {
    namespace = "com.kdocumenttool.pdf"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.kdocumenttool.pdf"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
      if (hasReleaseSigning) {
        create("release") {
          storeFile = file(releaseStoreFile!!)
          storePassword = releaseStorePassword
          keyAlias = releaseKeyAlias
          keyPassword = releaseKeyPassword
        }
      }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (hasReleaseSigning) {
              signingConfig = signingConfigs.getByName("release")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
      compose = true
      aidl = false
      buildConfig = false
      shaders = false
    }

    packaging {
      resources {
        excludes += "/META-INF/{AL2.0,LGPL2.1}"
      }
    }

    lint {
      abortOnError = true
      checkReleaseBuilds = true
    }
}

kotlin {
    jvmToolchain(17)
}

dependencies {
  val composeBom = platform(libs.androidx.compose.bom)
  implementation(composeBom)
  androidTestImplementation(composeBom)

  // Core Android dependencies
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.exifinterface)
  implementation(libs.kotlinx.coroutines.android)

  // Arch Components
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.viewmodel.compose)

  // Compose
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.compose.material3)
  // Tooling
  debugImplementation(libs.androidx.compose.ui.tooling)
  // Instrumented tests
  androidTestImplementation(libs.androidx.compose.ui.test.junit4)
  debugImplementation(libs.androidx.compose.ui.test.manifest)

  // Local tests: jUnit, coroutines, Android runner
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)

  // Instrumented tests: jUnit rules and runners
  androidTestImplementation(libs.androidx.test.core)
  androidTestImplementation(libs.androidx.test.ext.junit)
  androidTestImplementation(libs.androidx.test.runner)
  androidTestImplementation(libs.androidx.test.espresso.core)
  androidTestImplementation(libs.kotlinx.coroutines.test)

}

val validateReleaseSigning =
  tasks.register("validateReleaseSigning") {
    group = "verification"
    description = "Fails release packaging when upload-key environment variables are missing."
    inputs.property("releaseSigningConfigured", hasReleaseSigning)
    doLast {
      check(inputs.properties["releaseSigningConfigured"] == true) {
        "Release signing is required. Set KDOCUMENT_KEYSTORE_PATH, " +
          "KDOCUMENT_KEYSTORE_PASSWORD, KDOCUMENT_KEY_ALIAS, and KDOCUMENT_KEY_PASSWORD."
      }
    }
  }

tasks
  .matching {
    it.name in
      setOf(
        "assembleRelease",
        "bundleRelease",
        "packageRelease",
        "packageReleaseBundle",
        "signReleaseBundle",
      )
  }
  .configureEach { dependsOn(validateReleaseSigning) }
