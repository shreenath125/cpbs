
<div align="center">
  <h1>CPBS - Chaitanya Prem Bhakti Sangh</h1>
  <p>Offline-First Bhajan & Kirtan Application</p>
</div>

## Project Structure

This project uses a **flat structure**. All source files (`App.tsx`, `index.tsx`) are located in the root directory, with organized subfolders for `components`, `context`, `data`, and `utils`.

## Run Locally

**Prerequisites:** Node.js (v18 or higher recommended)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open the local URL (usually `http://localhost:3000`) in your browser.

## Build for Android (Optional)

If you want to create the APK:

1.  **Build the web assets:**
    ```bash
    npm run build
    ```

2.  **Sync with Capacitor:**
    ```bash
    npx cap sync
    ```

3.  **Open in Android Studio:**
    ```bash
    npx cap open android
    ```
