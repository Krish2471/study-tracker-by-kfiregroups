import { useEffect, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { useGameStore } from '../store/useGameStore';

export function useNotificationService() {
  const events = usePlannerStore((s) => s.events);
  const streak = useGameStore((s) => s.streak);
  const lastStudyDate = useGameStore((s) => s.lastStudyDate);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // We'll request on user action, not on mount
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'hash-notification',
      });
    }
  };

  // Check for upcoming study sessions
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      // Check for events starting in 15 minutes
      events
        .filter((e) => e.date === todayStr && !e.isCompleted)
        .forEach((event) => {
          const [eventHour, eventMin] = event.startTime.split(':').map(Number);
          const eventMinutes = eventHour * 60 + eventMin;
          const currentMinutes = currentHour * 60 + currentMin;
          const diff = eventMinutes - currentMinutes;

          if (diff === 15) {
            showNotification(
              '📚 Study Reminder',
              `"${event.title}" (${event.subject}) starts in 15 minutes!`
            );
          } else if (diff === 0) {
            showNotification(
              '🎯 Time to Study!',
              `"${event.title}" (${event.subject}) is starting now!`
            );
          }
        });

      // Streak at risk notification (check at 8 PM)
      if (currentHour === 20 && currentMin === 0) {
        const today = new Date().toDateString();
        if (lastStudyDate !== today && streak > 0) {
          showNotification(
            '🔥 Streak at Risk!',
            `You haven't studied today! Your ${streak}-day streak is at risk. Open Hash to keep it going!`
          );
        }
      }
    };

    // Check every minute
    intervalRef.current = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [events, streak, lastStudyDate]);

  return { requestPermission, showNotification };
}
