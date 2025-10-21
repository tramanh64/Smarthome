import { useState, useEffect, useRef } from 'react';

// Hàm tiện ích để tạo số ngẫu nhiên trong khoảng
const r = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

/**
 * Hook để tạo dữ liệu giả lập hoàn toàn ở phía client (local).
 * Hoạt động offline và không phụ thuộc vào Firestore.
 * @param {boolean} enabled - Bật/tắt chế độ giả lập.
 * @param {number} periodMs - Tần suất tạo dữ liệu mới (ms).
 * @param {number} historySize - Số lượng điểm dữ liệu lịch sử cần lưu giữ.
 * @returns {{currentSensors: object, history: object[]}} - Trả về dữ liệu cảm biến hiện tại và lịch sử.
 */
export function useSimulation(enabled, periodMs = 2000, historySize = 120) {
  // State lưu giá trị cảm biến hiện tại
  const [currentSensors, setCurrentSensors] = useState({
    motion: false,
    light_level: 300,
    temperature: 28,
    humidity: 65,
    sound_detected: false,
  });

  // State lưu mảng dữ liệu lịch sử cho biểu đồ
  const [history, setHistory] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    // Hàm tạo ra một mẫu dữ liệu mới
    const makeSample = () => {
      // Dùng giá trị trước đó làm cơ sở để dao động tự nhiên hơn
      setCurrentSensors(prev => ({
        motion: Math.random() < 0.1,
        light_level: Math.max(50, Math.min(900, prev.light_level + r(-50, 50))),
        temperature: Math.max(20, Math.min(36, prev.temperature + r(-0.5, 0.5))),
        humidity: Math.max(40, Math.min(90, prev.humidity + r(-2, 2))),
        sound_detected: Math.random() < 0.05,
      }));
    };

    if (enabled) {
      makeSample();
      timer.current = setInterval(makeSample, periodMs);
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [enabled, periodMs]);

  useEffect(() => {
    if (enabled) {
      const now = new Date();
      const newHistoryPoint = {
        ts: now,
        temperature: currentSensors.temperature,
        humidity: currentSensors.humidity,
      };
      setHistory(prev => [...prev, newHistoryPoint].slice(-historySize));
    }
  }, [currentSensors, enabled, historySize]);

  if (!enabled) {
    return { currentSensors: {}, history: [] };
  }

  return { currentSensors, history };
}