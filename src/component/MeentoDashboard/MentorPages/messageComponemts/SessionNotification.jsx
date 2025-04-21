import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

const SessionNotification = ({ sessions }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkUpcomingSessions = () => {
      const now = new Date();
      const upcomingSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const timeDiff = sessionDate - now;
        // Check if session is within the next 5 minutes and hasn't been notified
        return timeDiff > 0 && timeDiff <= 5 * 60 * 1000 && session.status === 'accepted';
      });

      if (upcomingSessions.length > 0) {
        // Show notification for each upcoming session
        upcomingSessions.forEach(session => {
          if (!notifications.includes(session._id)) {
            const notification = new Notification('Upcoming Session', {
              body: `Your session "${session.topic}" is starting in 5 minutes!`,
              icon: '/logo.png'
            });

            notification.onclick = () => {
              window.open(`https://meet.jit.si/${session.jitsiRoomId}`, '_blank');
            };

            setNotifications(prev => [...prev, session._id]);
          }
        });
      }
    };

    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Check for upcoming sessions every minute
    const interval = setInterval(checkUpcomingSessions, 60 * 1000);

    // Initial check
    checkUpcomingSessions();

    return () => clearInterval(interval);
  }, [sessions, notifications]);

  return null; // This component doesn't render anything
};

export default SessionNotification; 