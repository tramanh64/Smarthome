#include <WiFi.h>
#include <DHT.h>
#include <FirebaseESP32.h>
#include "credentials.h" // Import các thông tin nhạy cảm từ file riêng

// --- Định nghĩa chân cắm ---
#define DHT_PIN 26                  // Chân cảm biến DHT22
#define DHT_TYPE DHT22              // Loại cảm biến là DHT22
#define LIGHT_SENSOR_PIN 34         // Chân cảm biến ánh sáng (photoresistor)
#define AIR_CONDITIONER_PIN 12      // Chân điều khiển Máy lạnh
#define FAN_PIN 14                  // Chân điều khiển Quạt
#define LAMP_PIN 27                 // Chân điều khiển Đèn

// --- Khởi tạo các đối tượng ---
DHT dht(DHT_PIN, DHT_TYPE);
FirebaseData firebaseData;
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;

// --- Biến toàn cục ---
float temperature = 0;
float humidity = 0;
int lightValue = 0;
bool airConditionerState = false;
bool fanState = false;
bool lampState = false;

// --- Hàm thiết lập ban đầu ---
void setup() {
    Serial.begin(115200);

    // Khởi động cảm biến
    dht.begin();

    // Cấu hình các chân điều khiển là OUTPUT
    pinMode(AIR_CONDITIONER_PIN, OUTPUT);
    pinMode(FAN_PIN, OUTPUT);
    pinMode(LAMP_PIN, OUTPUT);

    // Kết nối WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");

    // Cấu hình Firebase
    firebaseConfig.host = FIREBASE_HOST;
    firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH;
    Firebase.begin(&firebaseConfig, &firebaseAuth);
    Firebase.reconnectWiFi(true);
}

// --- Vòng lặp chính ---
void loop() {
    // Đọc và gửi dữ liệu cảm biến
    readAndSendSensorData();

    // Lắng nghe và cập nhật trạng thái thiết bị từ Firebase
    updateDeviceStates();

    delay(5000); // Đợi 5 giây cho lần lặp tiếp theo
}

// --- Các hàm chức năng ---

/**
 * @brief Đọc dữ liệu từ các cảm biến và gửi lên Firebase.
 */
void readAndSendSensorData() {
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();
    
    // Đọc giá trị ADC (0-4095) và chuyển đổi sang thang đo ánh sáng (0-1000) để dễ hình dung hơn
    lightValue = 1000 - (analogRead(LIGHT_SENSOR_PIN) * 1000) / 4095;

    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read from DHT sensor!");
        return;
    }

    // In giá trị ra Serial Monitor để debug
    Serial.printf("Temp: %.2f°C, Humidity: %.2f%%, Light: %d lux\n", temperature, humidity, lightValue);

    // Gửi dữ liệu lên Firebase
    if (!Firebase.setFloat(firebaseData, "sensors/temperature", temperature)) {
        Serial.println("Firebase error (temperature): " + firebaseData.errorReason());
    }
    if (!Firebase.setFloat(firebaseData, "sensors/humidity", humidity)) {
        Serial.println("Firebase error (humidity): " + firebaseData.errorReason());
    }
    if (!Firebase.setInt(firebaseData, "sensors/light", lightValue)) {
        Serial.println("Firebase error (light): " + firebaseData.errorReason());
    }
}

/**
 * @brief Cập nhật trạng thái của tất cả thiết bị bằng cách đọc từ Firebase.
 */
void updateDeviceStates() {
    updateSingleDeviceState("sensors/devices/airConditioner", AIR_CONDITIONER_PIN, airConditionerState, "Air Conditioner");
    updateSingleDeviceState("sensors/devices/fan", FAN_PIN, fanState, "Fan");
    updateSingleDeviceState("sensors/devices/lamp", LAMP_PIN, lampState, "Lamp");
}

/**
 * @brief Hàm chung để đọc trạng thái và điều khiển một thiết bị.
 * @param path Đường dẫn đến node trạng thái trên Firebase.
 * @param pin Chân GPIO điều khiển thiết bị.
 * @param state Biến lưu trạng thái của thiết bị.
 * @param deviceName Tên của thiết bị để in ra log.
 */
void updateSingleDeviceState(const String& path, int pin, bool& state, const String& deviceName) {
    if (Firebase.get(firebaseData, path)) {
        if (firebaseData.dataType() == "int") {
            bool newState = (firebaseData.intData() == 1);
            if (newState != state) {
                state = newState;
                digitalWrite(pin, state ? HIGH : LOW);
                Serial.printf("%s turned %s\n", deviceName.c_str(), state ? "ON" : "OFF");
            }
        }
    } else {
         Serial.println("Firebase error (get " + deviceName + "): " + firebaseData.errorReason());
    }
}