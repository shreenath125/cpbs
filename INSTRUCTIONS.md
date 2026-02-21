
# CPBS - Bhajans App Build Instructions

This guide is organized into three phases to take you from the code provided here to a running Android app.

---

## Phase 1: Design & Code Generation (Completed Here)

**Status:** You have currently completed this phase.
*   The React/Vite web application code is generated.
*   Capacitor configuration (`capacitor.config.json`) is ready.
*   Assets and logic are in place.

**Next Step:** Download the files to your local computer.

---

## Phase 2: Local Setup (Your PC Terminal)

Perform these steps in your computer's terminal (Command Prompt, PowerShell, or Terminal) inside the project folder.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build the Web App:**
    ```bash
    npm run build
    ```

3.  **Create/Sync Android Project:**
    *(Note: If you receive an error about the android platform missing, 
    run `npm install @capacitor/android` and `npx cap add android` first)*
    ```bash
    npx cap sync
    ```

4.  **Generate App Icons:**
    *(Ensure you have a 1024x1024 `icon.png` in a `resources` folder at the root, or skip this if you want to do it manually later)*
    ```bash
    npx capacitor-assets generate --android
    ```

5.  **Open Android Studio:**
    ```bash
    npx cap open android
    ```

---

## Phase 3: Android Configuration (For Android Studio's Gemini)

Once Android Studio opens, wait for the project to index. Then, open the **Gemini** assistant window (usually on the right sidebar). 

**Copy and paste the exact text below** into the chat. This prompt now includes the specific fix for closing background notifications, network security for downloads, and file access paths.

### 📋 COPY THE TEXT BELOW FOR GEMINI:

> I am building a **Capacitor React App** named "CPBS - Bhajans". I need to configure native files for background audio, notifications, and file downloads.
>
> Please help me create/update the following files in `android/app/src/main/`:
>
> ### 1. Create `res/xml/network_security_config.xml`
> This is required to allow cleartext traffic for PDF downloads if needed.
> **Content:**
> ```xml
> <?xml version="1.0" encoding="utf-8"?>
> <network-security-config>
>     <base-config cleartextTrafficPermitted="true">
>         <trust-anchors>
>             <certificates src="system" />
>         </trust-anchors>
>     </base-config>
> </network-security-config>
> ```
>
> ### 2. Create/Update `res/xml/file_paths.xml`
> This ensures downloaded files can be accessed/shared correctly.
> **Content:**
> ```xml
> <?xml version="1.0" encoding="utf-8"?>
> <paths xmlns:android="http://schemas.android.com/apk/res/android">
>     <external-path name="external_files" path="."/>
>     <external-files-path name="external_files_path" path="."/>
>     <files-path name="files" path="."/>
>     <cache-path name="cache" path="."/>
>     <external-cache-path name="external_cache" path="."/>
> </paths>
> ```
>
> ### 3. Update `AndroidManifest.xml`
> Please generate the **full XML code** for the Manifest that includes:
> *   **Package Name:** Ensure it is `com.cpbs.bhajans`.
> *   **Permissions:** (Add outside `<application>` tag)
>     *   `android.permission.INTERNET`
>     *   `android.permission.WAKE_LOCK`
>     *   `android.permission.FOREGROUND_SERVICE`
>     *   `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK`
>     *   `android.permission.READ_EXTERNAL_STORAGE`
>     *   `android.permission.WRITE_EXTERNAL_STORAGE`
>     *   `android.permission.POST_NOTIFICATIONS`
> *   **Attributes in `<application>` tag:**
>     *   `android:requestLegacyExternalStorage="true"`
>     *   `android:usesCleartextTraffic="true"`
>     *   `android:networkSecurityConfig="@xml/network_security_config"`
> *   **Service:** Insert this specific service entry inside the `<application>` tag (crucial for the audio plugin):
>     ```xml
>     <service
>         android:name="de.appplant.cordova.plugin.background.ForegroundService"
>         android:foregroundServiceType="mediaPlayback"
>         android:exported="false" />
>     ```
> *   **Provider:** Ensure the `<provider>` for `androidx.core.content.FileProvider` (if it exists or if you generate it) points `android:resource` to `@xml/file_paths`.
>
> ### 4. Update `MainActivity.java`
> Please generate the **full Java code** for `MainActivity.java` (in `java/com/cpbs/bhajans/`).
> **Crucial:** You must override the `onDestroy` method to forcefully stop the background service and clear notifications when the app closes. Use this logic:
>
> ```java
> package com.cpbs.bhajans; // Ensure this matches the actual package
>
> import android.content.Intent;
> import android.os.Bundle;
> import android.app.NotificationManager;
> import android.content.Context;
> import com.getcapacitor.BridgeActivity;
>
> public class MainActivity extends BridgeActivity {
>     @Override
>     public void onDestroy() {
>         // Stop the BackgroundMode ForegroundService to kill the notification
>         try {
>             Intent intent = new Intent(this, Class.forName("de.appplant.cordova.plugin.background.ForegroundService"));
>             stopService(intent);
>         } catch (ClassNotFoundException e) {
>             e.printStackTrace();
>         }
>
>         // Cancel all notifications
>         NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
>         if (notificationManager != null) {
>             notificationManager.cancelAll();
>         }
>
>         super.onDestroy();
>     }
> }
> ```

---

### After Gemini responds:
1.  **Create XML Files:** Create the `network_security_config.xml` and `file_paths.xml` files in the `res/xml/` directory as instructed.
2.  **AndroidManifest.xml**: Copy the XML and paste it into `android/app/src/main/AndroidManifest.xml`.
3.  **MainActivity.java**: Copy the Java code and paste it into `android/app/src/main/java/com/cpbs/bhajans/MainActivity.java`.
4.  Click the **"Sync Project with Gradle Files"** button (Elephant icon) in the top right.
5.  Connect your phone via USB and click the **Green Play Button** to install!
