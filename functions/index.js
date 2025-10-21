const functions = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.logSensorHistory = functions.firestore
    .document("homes/{homeId}")
    .onUpdate(async (change, context) => {
      const afterData = change.after.data();
      const homeId = context.params.homeId;

      const currentSensors = afterData.sensors;
      if (!currentSensors) {
        console.log("No sensor data found, skipping history log.");
        return null;
      }

      const historyRef = db.collection("homes")
          .doc(homeId)
          .collection("history");

      const lastLogQuery = await historyRef
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();

      if (!lastLogQuery.empty) {
        const lastLogTimestamp = lastLogQuery.docs[0].data().timestamp.toDate();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (lastLogTimestamp > fiveMinutesAgo) {
          console.log("Last log was less than 5 minutes ago, skipping.");
          return null;
        }
      }

      const historyEntry = {
        timestamp: new Date(),
        temperature: currentSensors.temperature ?? null,
        humidity: currentSensors.humidity ?? null,
        light_level: currentSensors.light_level ?? null,
      };

      try {
        await historyRef.add(historyEntry);
        console.log(`History logged for home ${homeId}:`, historyEntry);
        return {status: "success"};
      } catch (error) {
        console.error("Error logging history:", error);
        return {status: "error"};
      }
    });
