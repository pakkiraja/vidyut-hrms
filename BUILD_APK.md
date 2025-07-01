# Generating Android APK for Vidyut Attendance Application

This guide outlines the steps to generate a debug and release APK for the Vidyut Attendance Application (React Native Android).

## Prerequisites

*   Node.js and npm installed (as per `HOSTING.md` or similar setup).
*   Java Development Kit (JDK) installed (version 11 or higher recommended).
*   Android SDK installed and configured (Android Studio is recommended for this).
*   `ANDROID_HOME` environment variable set to your Android SDK path.
*   Basic understanding of command line.

## 1. Navigate to the Android Project Directory

Open your terminal and navigate to the `android/VidyutAttendanceApp` directory:

```bash
cd android/VidyutAttendanceApp
```

## 2. Install JavaScript Dependencies

Ensure all JavaScript dependencies for the React Native project are installed:

```bash
npm install
```

## 3. Generate Debug APK

A debug APK is useful for testing and development.

```bash
npx react-native run-android --variant=debug
# This command will build and install the debug APK on a connected device/emulator.
# To just build the APK without installing:
cd android
./gradlew assembleDebug
# The debug APK will be located at android/app/build/outputs/apk/debug/app-debug.apk
```

## 4. Generate Release APK (for Production)

Generating a release APK requires signing your application.

### 4.1 Generate a Keystore (if you don't have one)

If you already have a keystore, skip this step. Otherwise, generate a new one.
Replace `my-upload-key.keystore`, `my-key-alias`, and `your_company_name` with your desired values. Remember the passwords you set!

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Move the generated `my-upload-key.keystore` file to the `android/app` directory:

```bash
mv my-upload-key.keystore android/app/
```

### 4.2 Configure `gradle.properties`

Create or edit the `~/.gradle/gradle.properties` file (this is a global Gradle properties file, not inside your project) to store your keystore credentials securely.

```bash
vi ~/.gradle/gradle.properties
```

Add the following lines, replacing the placeholders with your actual keystore details:

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

### 4.3 Configure `build.gradle` for Release Signing

Edit the `android/app/build.gradle` file to use the signing configuration.

```bash
vi android/app/build.gradle
```

Locate the `android { ... }` block and modify the `signingConfigs` and `buildTypes` sections as follows:

```gradle
// ... inside android { ... } block
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.release // Change from signingConfigs.debug to signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
// ... rest of the file
```

### 4.4 Build the Release APK

Navigate back to the `android` directory within your React Native project:

```bash
cd android/VidyutAttendanceApp/android
```

Then, run the Gradle command to build the release APK:

```bash
./gradlew assembleRelease
```

The release APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

## Troubleshooting

*   **JDK Version:** Ensure you are using a compatible JDK version (e.g., JDK 11). You can check with `java -version`.
*   **Android SDK:** Verify `ANDROID_HOME` is set correctly and SDK components are installed.
*   **Keystore Passwords:** Double-check your keystore and key passwords in `~/.gradle/gradle.properties`.
*   **Gradle Sync Issues:** If you encounter issues, try `cd android && ./gradlew clean` before building again.