import React, { useEffect, useState } from "react";
import axios from "axios";
import { BellIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const studentId = userInfo?._id;
        if (!studentId) return console.error("No student ID found");

        const { data } = await axios.get(`/api/notifications/${studentId}`);
        if (data.success) {
          setNotifications(data.notifications);
        } else {
          setError("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        const { data } = await axios.put(
          `/api/notifications/read/${notification._id}`
        );
        if (data.success) {
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notification._id ? { ...n, isRead: true } : n
            )
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    if (notification.link) {
      window.open(notification.link, "_blank");
    }
  };

const handleDelete = async (notification) => {
  try {
    console.log("Deleting notification with ID:", notification._id); // Log the ID
    await axios.delete(`/api/notifications/${notification._id}`);
    // Handle success (e.g., remove notification from state)
    setNotifications((prev) =>
      prev.filter((n) => n._id !== notification._id)
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};





  return (
    <div className="p-6 min-h-screen font-[Poppins] bg-gradient-to-br from-white via-slate-100 to-slate-200">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800 tracking-tight">
        🔔 Notifications
      </h2>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading notifications...</p>
      ) : error ? (
        <div className="text-red-500 font-medium">{error}</div>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`relative p-5 rounded-2xl shadow-md flex gap-4 items-start transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border ${
                notification.isRead
                  ? "bg-white border-gray-200"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
              }`}
            >
              {/* Icon */}
              <div className="mt-1 flex-shrink-0">
                {notification.isRead ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <BellIcon className="w-6 h-6 text-blue-600 animate-bounce" />
                )}
              </div>

              {/* Content */}
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <p
                  className={`text-sm ${
                    notification.isRead
                      ? "text-gray-700"
                      : "text-blue-900 font-medium"
                  }`}
                >
                  {notification.message}
                </p>

                {notification.link && (
                  <span className="inline-block mt-2 text-sm text-blue-700 font-medium underline hover:text-blue-900 transition">
                    📄 Download Offer Letter
                  </span>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              {/* New badge */}
              {!notification.isRead && (
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  New
                </span>
              )}

              {/* 3-dot menu */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() =>
                    setOpenMenuId((prev) =>
                      prev === notification._id ? null : notification._id
                    )
                  }
                  className="text-gray-600 hover:text-gray-800"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>

                {openMenuId === notification._id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {notification.link && (
                      <>
                        <button
                          onClick={() => window.open(notification.link, "_blank")}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = notification.link;
                            link.download = "";
                            link.click();
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Download
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(notification)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
