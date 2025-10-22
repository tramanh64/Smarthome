## Firmware cho Hệ thống Giám sát Phòng Ngủ Trẻ Em (ESP32)

### Mô tả
Code Arduino cho ESP32, kết nối cảm biến (DHT11, PIR, Microphone), actuator (Relay, Servo, Buzzer, OLED), và Firebase Realtime Database.

### Dependencies (Thư viện cần install qua Arduino Library Manager)
- WiFi
- FirebaseESP32 (hoặc Firebase ESP Client nếu update)
- DHT sensor library (by Adafruit)
- Adafruit GFX Library
- Adafruit SSD1306
- ESP32Servo

### Pinout (dựa code)
- DHT11: Pin 4
- PIR: Pin 5
- Microphone: Pin 34 (ADC)
- Relay (quạt): Pin 25
- Servo (cửa): Pin 26
- Buzzer: Pin 27
- OLED: SDA 21, SCL 22

### Build & Upload
1. Mở folder này trong Arduino IDE (file .ino sẽ load tự động).
2. Chọn board: ESP32 Dev Module (Tools > Board).
3. Chọn port COM của ESP32 (Tools > Port).
4. Update WiFi/Firebase credentials trong code.
5. Verify (compile) rồi Upload.

Nếu dùng PlatformIO: Mở project trong VS Code, run `pio run -t upload`.

### Test
- Connect hardware theo pinout.
- Mở Serial Monitor (115200 baud) để xem log.
- Kiểm tra data trên Firebase Realtime Database (path /sensors, /devices).