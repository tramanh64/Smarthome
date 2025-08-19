import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase, ref, onValue, set } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js';

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "YOUR_FIREBASE_MEASUREMENT_ID"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Application State
let isConnected = false;
let sensorData = {
    temperature: '--',
    humidity: '--',
    light: '--'
};

// DOM Elements
const elements = {
    time: document.getElementById('time'),
    temperature: document.getElementById('nhietdo'),
    humidity: document.getElementById('humidity'),
    lightValue: document.getElementById('light_value'),
    fahrenheit: document.getElementById('fahrenheit'),
    connectionStatus: document.getElementById('connectionStatus'),
    temperatureCircle: document.getElementById('temperatureCircle'),
    toggleIcon: document.getElementById('toggle-icon'),
    nightshift: document.getElementById('nightshift'),
    lightSwitch: document.getElementById('lightSwitch'),
    acSwitch: document.getElementById('acSwitch'),
    fanSwitch: document.getElementById('fanSwitch'),
    background: document.getElementById('background'),
    lastUpdate: document.getElementById('lastUpdate'),
    deviceCount: document.getElementById('deviceCount'),
    systemStatus: document.getElementById('systemStatus')
};

// Clock Function
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    elements.time.textContent = `${hours}:${minutes}:${seconds}`;
    elements.lastUpdate.textContent = `${hours}:${minutes}`;
}

// Temperature Functions
function convertToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function updateTemperatureDisplay(temp) {
    const tempNum = parseFloat(temp);
    if (isNaN(tempNum)) return;

    elements.temperature.textContent = `${temp}°C`;
    const fahrenheit = convertToFahrenheit(tempNum);
    elements.fahrenheit.textContent = `${fahrenheit.toFixed(1)}°F`;

    // Update temperature circle
    const percentage = Math.min(Math.max(tempNum / 50 * 100, 0), 100);
    const color = tempNum > 30 ? '#ff4444' : tempNum > 20 ? '#ffaa00' : '#4444ff';
    elements.temperatureCircle.style.background = 
        `conic-gradient(${color} ${percentage}%, #333 0%)`;
}

// Connection Status
function updateConnectionStatus(connected) {
    isConnected = connected;
    elements.connectionStatus.className = `connection-status ${connected ? 'connected' : ''}`;
    elements.connectionStatus.innerHTML = connected 
        ? '<i class="fas fa-wifi"></i> Connected'
        : '<i class="fas fa-wifi"></i> Disconnected';

    // Update status indicators
    document.querySelectorAll('.status-indicator').forEach(indicator => {
        indicator.className = `status-indicator ${connected ? 'online' : ''}`;
    });

    elements.systemStatus.textContent = connected ? 'Active' : 'Offline';
}

// Firebase Database Listeners
function setupFirebaseListeners() {
    // Connection status
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snap) => {
        updateConnectionStatus(snap.val());
    });

    // Sensor data listeners
    onValue(ref(database, 'sensors/temperature'), (snapshot) => {
        const temp = snapshot.val();
        if (temp !== null) {
            sensorData.temperature = temp;
            updateTemperatureDisplay(temp);
        }
    });

    onValue(ref(database, 'sensors/humidity'), (snapshot) => {
        const humidity = snapshot.val();
        if (humidity !== null) {
            sensorData.humidity = humidity;
            elements.humidity.textContent = `${humidity}%`;
        }
    });

    onValue(ref(database, 'sensors/light'), (snapshot) => {
        const light = snapshot.val();
        if (light !== null) {
            sensorData.light = light;
            elements.lightValue.textContent = light;
        }
    });

    // Device state listeners
    onValue(ref(database, 'devices/lamp'), (snapshot) => {
        const state = snapshot.val();
        if (state !== null) {
            elements.lightSwitch.checked = state;
        }
    });

    onValue(ref(database, 'devices/fan'), (snapshot) => {
        const state = snapshot.val();
        if (state !== null) {
            elements.fanSwitch.checked = state;
        }
    });

    onValue(ref(database, 'devices/ac'), (snapshot) => {
        const state = snapshot.val();
        if (state !== null) {
            elements.acSwitch.checked = state;
        }
    });
}

// Control Functions
async function sendControlCommand(device, state) {
    if (!isConnected) {
        console.warn('Not connected to Firebase');
        return;
    }

    try {
        await set(ref(database, `devices/${device}`), state);
        console.log(`${device} set to ${state}`);
    } catch (error) {
        console.error(`Error controlling ${device}:`, error);
    }
}

// Event Listeners
function setupEventListeners() {
    // Device controls
    elements.lightSwitch.addEventListener('change', function() {
        sendControlCommand('lamp', this.checked);
    });

    elements.fanSwitch.addEventListener('change', function() {
        sendControlCommand('fan', this.checked);
    });

    elements.acSwitch.addEventListener('change', function() {
        sendControlCommand('ac', this.checked);
    });

    // Night mode
    elements.nightshift.addEventListener('change', function() {
        if (this.checked) {
            elements.background.classList.add('night');
            elements.toggleIcon.className = 'fas fa-moon';
        } else {
            elements.background.classList.remove('night');
            elements.toggleIcon.className = 'fas fa-sun';
        }
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => 
                nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Initialize Application
function initApp() {
    console.log('Initializing SmartHome Dashboard...');
    
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Setup Firebase
    setupFirebaseListeners();
    
    // Setup event listeners
    setupEventListeners();

    console.log('SmartHome Dashboard initialized successfully!');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Simulate some initial data for demo
setTimeout(() => {
    if (!isConnected) {
        // Demo data
        updateTemperatureDisplay(25);
        elements.humidity.textContent = '60%';
        elements.lightValue.textContent = '750 lux';
        elements.deviceCount.textContent = '3';
        console.log('Using demo data - configure Firebase for real data');
    }
}, 2000);