// src/hooks/useHomeData.js

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const HOME_ID = "my_home_id"; // Giữ nguyên ID

export function useHomeData() {
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "homes", HOME_ID);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          // Tạo document mẫu nếu chưa có (logic này không đổi)
          const sample = {
            name: "Nhà của tôi",
            security_status: "safe",
            sensors: { motion: false, light_level: 750, temperature: 28.5, humidity: 70, sound_detected: false },
            actuators: { fan_on: true, alarm_on: false, door_locked: true },
            last_updated: serverTimestamp(),
          };
          await setDoc(ref, sample);
          return;
        }
        setHome(snap.data());
        setLoading(false);
      },
      (err) => {
        console.error("Lỗi khi lắng nghe dữ liệu:", err);
        setLoading(false);
      }
    );

    // Hàm dọn dẹp sẽ được gọi khi component unmount
    return () => unsub();
  }, []); // Mảng phụ thuộc rỗng, chỉ chạy 1 lần

  return { home, loading };
}