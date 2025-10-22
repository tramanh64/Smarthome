/*
 * HỆ THỐNG GIÁM SÁT AN TOÀN PHÒNG NGỦ CHO TRẺ NHỎ
 * Sử dụng ESP32 + Firebase + Cảm biến PIR, DHT11, Microphone, OLED
 * 
 * Chức năng:
 * - Giám sát nhiệt độ, độ ẩm (DHT11)
 * - Phát hiện chuyển động (PIR)
 * - Phát hiện tiếng khóc (Microphone + MAX4466)
 * - Điều khiển quạt (Relay)
 * - Mô phỏng khóa cửa (Servo)
 * - Còi báo động (Buzzer)
 * - Hiển thị trạng thái (OLED)
 * - Kết nối Firebase real-time
 */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP32Servo.h>

// ==================== CẤU HÌNH WIFI ====================
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"

// ==================== CẤU HÌNH FIREBASE ====================
#define FIREBASE_HOST "ten-du-an.firebaseio.com"
#define FIREBASE_AUTH "firebase-auth-token-cua-ban"

FirebaseData firebaseData;
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;

// ==================== ĐỊNH NGHĨA CHÂN ESP32 ====================
#define DHT_PIN 4           // Cảm biến DHT11
#define PIR_PIN 5           // Cảm biến PIR
#define MIC_PIN 34          // Cảm biến âm thanh (ADC)
#define RELAY_PIN 25        // Module Relay (điều khiển quạt)
#define SERVO_PIN 26        // Động cơ Servo (khóa cửa)
#define BUZZER_PIN 27       // Còi báo động
#define OLED_SDA 21         // OLED I2C Data
#define OLED_SCL 22         // OLED I2C Clock

// ==================== CẤU HÌNH CẢM BIẾN ====================
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

Servo doorServo;

// ==================== BIẾN TOÀN CỤC ====================
// Dữ liệu cảm biến
float temperature = 0;
float humidity = 0;
bool motionDetected = false;
int soundLevel = 0;
bool cryingDetected = false;

// Trạng thái thiết bị
bool fanOn = false;
bool doorLocked = true;
bool buzzerOn = false;
bool systemArmed = true;

// Ngưỡng cảnh báo
const float TEMP_MAX = 30.0;      // Nhiệt độ tối đa (°C)
const float TEMP_MIN = 20.0;      // Nhiệt độ tối thiểu (°C)
const float HUMIDITY_MAX = 70.0;  // Độ ẩm tối đa (%)
const int SOUND_THRESHOLD = 2000; // Ngưỡng phát hiện tiếng khóc
const int CRY_DURATION = 3000;    // Thời gian khóc liên tục (ms)

// Thời gian
unsigned long lastSensorRead = 0;
unsigned long lastFirebaseUpdate = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long cryingStartTime = 0;
const unsigned long SENSOR_INTERVAL = 2000;    // 2 giây
const unsigned long FIREBASE_INTERVAL = 3000;  // 3 giây
const unsigned long DISPLAY_INTERVAL = 1000;   // 1 giây

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== HỆ THỐNG GIÁM SÁT PHÒNG NGỦ TRẺ EM ===");
  
  // Khởi tạo chân GPIO
  pinMode(PIR_PIN, INPUT);
  pinMode(MIC_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(RELAY_PIN, HIGH);  // Relay kích mức thấp - HIGH = tắt
  digitalWrite(BUZZER_PIN, LOW);
  
  // Khởi tạo DHT11
  dht.begin();
  Serial.println("✓ DHT11 khởi tạo");
  
  // Khởi tạo Servo
  doorServo.attach(SERVO_PIN);
  doorServo.write(0);  // Vị trí khóa
  Serial.println("✓ Servo khởi tạo");
  
  // Khởi tạo OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("✗ Lỗi OLED!");
  } else {
    Serial.println("✓ OLED khởi tạo");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("He thong dang");
    display.println("khoi dong...");
    display.display();
  }
  
  // Kết nối WiFi
  connectWiFi();
  
  // Kết nối Firebase
  connectFirebase();
  
  // Hiển thị thông báo sẵn sàng
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("HE THONG SAN SANG");
  display.println("==================");
  display.display();
  delay(2000);
  
  Serial.println("=== HỆ THỐNG ĐÃ SẴN SÀNG ===\n");
}

// ==================== LOOP CHÍNH ====================
void loop() {
  unsigned long currentMillis = millis();
  
  // Đọc cảm biến định kỳ
  if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = currentMillis;
    readSensors();
    checkAlerts();
  }
  
  // Cập nhật Firebase định kỳ
  if (currentMillis - lastFirebaseUpdate >= FIREBASE_INTERVAL) {
    lastFirebaseUpdate = currentMillis;
    updateFirebase();
    checkFirebaseCommands();
  }
  
  // Cập nhật màn hình OLED định kỳ
  if (currentMillis - lastDisplayUpdate >= DISPLAY_INTERVAL) {
    lastDisplayUpdate = currentMillis;
    updateDisplay();
  }
  
  delay(10);  // Tránh watchdog reset
}

// ==================== KẾT NỐI WIFI ====================
void connectWiFi() {
  Serial.print("Đang kết nối WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi đã kết nối!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ Không thể kết nối WiFi!");
  }
}

// ==================== KẾT NỐI FIREBASE ====================
void connectFirebase() {
  firebaseConfig.host = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("✓ Firebase đã kết nối");
}

// ==================== ĐỌC CẢM BIẾN ====================
void readSensors() {
  // Đọc DHT11
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (!isnan(temp) && !isnan(hum)) {
    temperature = temp;
    humidity = hum;
  }
  
  // Đọc PIR
  motionDetected = digitalRead(PIR_PIN);
  
  // Đọc Microphone
  soundLevel = analogRead(MIC_PIN);
  
  // Phát hiện tiếng khóc
  if (soundLevel > SOUND_THRESHOLD) {
    if (cryingStartTime == 0) {
      cryingStartTime = millis();
    } else if (millis() - cryingStartTime > CRY_DURATION) {
      cryingDetected = true;
    }
  } else {
    cryingStartTime = 0;
    cryingDetected = false;
  }
  
  // In dữ liệu ra Serial
  Serial.printf("Nhiệt độ: %.1f°C | Độ ẩm: %.1f%% | Chuyển động: %s | Âm thanh: %d | Khóc: %s\n",
                temperature, humidity, motionDetected ? "CÓ" : "KHÔNG",
                soundLevel, cryingDetected ? "CÓ" : "KHÔNG");
}

// ==================== KIỂM TRA CẢNH BÁO ====================
void checkAlerts() {
  bool alertTriggered = false;
  
  // Cảnh báo nhiệt độ
  if (temperature > TEMP_MAX || temperature < TEMP_MIN) {
    alertTriggered = true;
    Serial.println("⚠ CẢNH BÁO: Nhiệt độ bất thường!");
  }
  
  // Cảnh báo độ ẩm
  if (humidity > HUMIDITY_MAX) {
    alertTriggered = true;
    Serial.println("⚠ CẢNH BÁO: Độ ẩm cao!");
  }
  
  // Cảnh báo chuyển động (khi hệ thống được kích hoạt)
  if (systemArmed && motionDetected) {
    alertTriggered = true;
    Serial.println("⚠ CẢNH BÁO: Phát hiện chuyển động!");
  }
  
  // Cảnh báo tiếng khóc
  if (cryingDetected) {
    alertTriggered = true;
    Serial.println("⚠ CẢNH BÁO: Trẻ đang khóc!");
  }
  
  // Kích hoạt buzzer nếu có cảnh báo
  if (alertTriggered && buzzerOn) {
    soundBuzzer();
  }
}

// ==================== CẬP NHẬT FIREBASE ====================
void updateFirebase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi mất kết nối!");
    return;
  }
  
  // Gửi dữ liệu cảm biến
  Firebase.setFloat(firebaseData, "/sensors/temperature", temperature);
  Firebase.setFloat(firebaseData, "/sensors/humidity", humidity);
  Firebase.setBool(firebaseData, "/sensors/motion", motionDetected);
  Firebase.setInt(firebaseData, "/sensors/soundLevel", soundLevel);
  Firebase.setBool(firebaseData, "/sensors/crying", cryingDetected);
  
  // Gửi trạng thái thiết bị
  Firebase.setBool(firebaseData, "/devices/fan", fanOn);
  Firebase.setBool(firebaseData, "/devices/doorLocked", doorLocked);
  Firebase.setBool(firebaseData, "/devices/buzzer", buzzerOn);
  Firebase.setBool(firebaseData, "/system/armed", systemArmed);
  
  // Timestamp
  Firebase.setInt(firebaseData, "/system/lastUpdate", millis() / 1000);
}

// ==================== NHẬN LỆNH TỪ FIREBASE ====================
void checkFirebaseCommands() {
  // Kiểm tra lệnh bật/tắt quạt
  if (Firebase.getBool(firebaseData, "/commands/fan")) {
    bool newFanState = firebaseData.boolData();
    if (newFanState != fanOn) {
      fanOn = newFanState;
      controlFan(fanOn);
    }
  }
  
  // Kiểm tra lệnh khóa/mở cửa
  if (Firebase.getBool(firebaseData, "/commands/doorLock")) {
    bool newDoorState = firebaseData.boolData();
    if (newDoorState != doorLocked) {
      doorLocked = newDoorState;
      controlDoor(doorLocked);
    }
  }
  
  // Kiểm tra lệnh buzzer
  if (Firebase.getBool(firebaseData, "/commands/buzzer")) {
    buzzerOn = firebaseData.boolData();
  }
  
  // Kiểm tra trạng thái hệ thống
  if (Firebase.getBool(firebaseData, "/commands/systemArmed")) {
    systemArmed = firebaseData.boolData();
    Serial.printf("Hệ thống: %s\n", systemArmed ? "KÍCH HOẠT" : "TẮT");
  }
}

// ==================== ĐIỀU KHIỂN THIẾT BỊ ====================
void controlFan(bool state) {
  // Relay kích mức thấp: LOW = bật, HIGH = tắt
  digitalWrite(RELAY_PIN, state ? LOW : HIGH);
  Serial.printf("Quạt: %s\n", state ? "BẬT" : "TẮT");
}

void controlDoor(bool locked) {
  // Servo: 0° = khóa, 90° = mở
  doorServo.write(locked ? 0 : 90);
  Serial.printf("Cửa: %s\n", locked ? "KHÓA" : "MỞ");
}

void soundBuzzer() {
  // Kêu buzzer 3 tiếng ngắn
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
}

// ==================== CẬP NHẬT MÀN HÌNH OLED ====================
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  
  // Tiêu đề
  display.println("GIAM SAT PHONG NGU");
  display.println("==================");
  
  // Dữ liệu cảm biến
  display.printf("Nhiet do: %.1fC\n", temperature);
  display.printf("Do am  : %.1f%%\n", humidity);
  display.printf("Am thanh: %d\n", soundLevel);
  
  // Trạng thái
  display.println("------------------");
  display.printf("Quat: %s | ", fanOn ? "ON " : "OFF");
  display.printf("Cua: %s\n", doorLocked ? "KHOA" : "MO  ");
  
  // WiFi status
  display.printf("WiFi: %s", WiFi.status() == WL_CONNECTED ? "OK" : "ERR");
  
  display.display();
}

// ==================== HÀM TRỢ GIÚP ====================
// Reset hệ thống về trạng thái mặc định
void resetSystem() {
  fanOn = false;
  doorLocked = true;
  buzzerOn = false;
  systemArmed = true;
  
  controlFan(false);
  controlDoor(true);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("✓ Hệ thống đã reset");
}