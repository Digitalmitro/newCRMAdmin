// hooks/useGlobalNotification.js
import { useEffect } from "react";
import { onNotificationReceived } from "../utils/socket";

export const useGlobalNotification = () => {
  useEffect(() => {
    const unsubscribe = onNotificationReceived((notification) => {
      console.log("🔔 Notification received globally:", notification);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);
};
