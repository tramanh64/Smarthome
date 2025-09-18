# SmartHome Project

A full-stack IoT SmartHome system including:

- **Web Dashboard** (`/web`): React + Vite + Firebase Auth/Firestore.
- **Mobile App** (`/mobile`): Flutter app (coming soon).
- **Firmware** (`/firmware/esp32`): ESP32 code to read sensors & control devices.
- **Cloud Functions** (`/functions`): Firebase backend logic (alerts, fake sensors, etc.).

## Run Web Dashboard
```bash
cd web
npm install
npm run dev
