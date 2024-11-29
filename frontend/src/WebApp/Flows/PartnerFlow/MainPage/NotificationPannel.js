// import React, { useEffect, useState } from 'react';

// const NotificationPanel = () => {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     async function fetchNotifications() {
//       try {
//         const response = await fetch('/api/notifications/partnerId');
//         if (!response.ok) throw new Error('Failed to fetch notifications');
//         const data = await response.json();
//         setNotifications(data);
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//         setNotifications([]); // Fallback to an empty array on error
//       }
//     }
//     fetchNotifications();
//   }, []);

//   return (
//     <div>
//       {Array.isArray(notifications) && notifications.length > 0 ? (
//         notifications.map(notification => (
//           <div key={notification.id}>
//             <p>{notification.message}</p>
//             <small>{new Date(notification.timestamp).toLocaleString()}</small>
//           </div>
//         ))
//       ) : (
//         <p>No notifications to display</p>
//       )}
//     </div>
//   );
// };

// export default NotificationPanel;
