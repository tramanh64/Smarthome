# SmartHome Project

A full-stack IoT SmartHome system built with React and Firebase.

## Features

- **Real-time Dashboard:** View live sensor data and control actuators.
- **Sensor History:** View historical data for temperature, humidity, and light levels in charts.
- **Actuator Control:** Toggle devices like fans, alarms, and door locks.
- **Simulation Mode:** A built-in simulator generates mock sensor data for easy development and testing without physical hardware.
- **Secure:** Uses Firebase Authentication for user login.

## Tech Stack

- **Frontend:**
    - React 19 (with Vite)
    - Material-UI (MUI) for components
    - Recharts for data visualization
    - Firebase Client SDK for auth and database access
- **Backend:**
    - Firebase Cloud Functions (Node.js)
    - Firestore Triggers for automated tasks
- **Database:**
    - Cloud Firestore (NoSQL)
- **Firmware:**
    - ESP32 (C/C++ with Arduino framework) - *Code in `/firmware`*

## Project Structure

```
smarthome/
├── web/                # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── hooks/      # Custom hooks for data fetching and logic
│   │   ├── pages/      # Main pages (Login, Dashboard)
│   │   └── services/   # Auth and other services
│   └── package.json
├── functions/          # Firebase Cloud Functions (backend)
│   ├── index.js        # Main backend logic
│   └── package.json
├── firmware/           # Code for ESP32 microcontroller
├── mobile/             # (Coming Soon) Flutter mobile app
└── firebase.json       # Firebase project configuration
```

## Setup and Running

### 1. Web Dashboard (Frontend)

The web dashboard is a React application built with Vite.

1.  **Navigate to the web directory:**
    ```bash
    cd web
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

### 2. Cloud Functions (Backend)

The backend logic runs on Firebase Cloud Functions. You can test it locally using the Firebase Emulator Suite.

1.  **Navigate to the functions directory:**
    ```bash
    cd functions
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the Firebase emulator:**
    ```bash
    npm run serve
    ```
    This will start the functions emulator, allowing the frontend to interact with a local version of the backend logic.