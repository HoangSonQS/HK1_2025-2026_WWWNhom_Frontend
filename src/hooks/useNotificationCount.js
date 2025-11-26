import { useState, useEffect } from "react";
import { getUnreadCount } from "../features/notification/api/notificationService";

export const useNotificationCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCount = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getUnreadCount();
      setCount(response.data || 0);
    } catch (error) {
      // Nếu lỗi 401, user chưa đăng nhập
      if (error.response?.status === 401) {
        setCount(0);
      } else {
        // Nếu lỗi khác (500, etc), vẫn set 0 để tránh hiển thị lỗi
        console.error("Error loading notification count:", error);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCount();

    // Lắng nghe event để cập nhật count khi có thay đổi
    const handleNotificationUpdate = () => {
      loadCount();
    };

    window.addEventListener("notificationUpdated", handleNotificationUpdate);

    // Reload count mỗi 30 giây
    const interval = setInterval(loadCount, 30000);

    return () => {
      window.removeEventListener("notificationUpdated", handleNotificationUpdate);
      clearInterval(interval);
    };
  }, []);

  return { count, loading, refresh: loadCount };
};

