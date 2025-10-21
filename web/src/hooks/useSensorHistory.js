// src/hooks/useSensorHistory.js
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

/**
 * Lấy N bản ghi lịch sử sensor gần nhất ở:
 * homes/{homeId}/sensor_history
 * Trả về mảng [{ ts, temperature, humidity, light_level, sound, motion }]
 */
export function useSensorHistory(homeId = "my_home_id", take = 120) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const ref = collection(db, "homes", homeId, "sensor_history");
    const q = query(ref, orderBy("ts", "desc"), limit(take));

    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => {
        const x = d.data();
        // đảm bảo có ts dạng Firestore Timestamp
        if (x.ts) {
          arr.push({
            ts: x.ts,
            temperature: x.temperature,
            humidity: x.humidity,
            light_level: x.light_level,
            sound: x.sound,
            motion: x.motion,
          });
        }
      });
      // đảo lại để thời gian tăng dần (trái -> phải)
      setData(arr.reverse());
    });

    return () => unsub();
  }, [homeId, take]);

  return data;
}
