'use client';

import { toast } from 'sonner';

/**
 * Request permission for browser Notifications
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    toast.error('Browser notifications are not supported in this environment.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Notifications enabled! We will alert you for quiz results and study reminders.');
      return true;
    } else if (permission === 'denied') {
      toast.error('Notification permission was denied in your browser settings.');
      return false;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

/**
 * Check if notification permission is granted
 */
export function isNotificationEnabled() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Trigger system notification with optional toast fallback
 */
export function sendBrainNotification(title, body, { showToast = true, icon = '/logo.png' } = {}) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'brainmate-reengage'
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('System notification failed', e);
    }
  }

  if (showToast) {
    toast.success(title, { description: body });
  }
}

/**
 * Special Quiz Completion Notification
 */
export function notifyQuizComplete(score, total) {
  const percentage = Math.round((score / total) * 100);
  sendBrainNotification(
    '🎉 Quiz Completed!',
    `You scored ${score}/${total} (${percentage}%) on your BrainMate pop quiz!`,
    { showToast: true }
  );
}

/**
 * Special Milestone / Achievement Notification
 */
export function notifySpecialAchievement(title, message) {
  sendBrainNotification(title, message, { showToast: true });
}

/**
 * 5-6 Minute Re-engagement Notification Timer
 * Triggers 5.5 minutes after user exits / switches tab away from the app
 */
let reengageTimer = null;

export function setupReengagementNotification() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const REENGAGE_DELAY_MS = 5.5 * 60 * 1000; // 5.5 minutes (5 min 30 sec)

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // User exited or switched tabs: schedule 5.5 min re-engagement notification
      if (reengageTimer) clearTimeout(reengageTimer);
      reengageTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const notif = new Notification('🧠 Ready for your next 2-minute insight?', {
              body: 'Come back to BrainMate! Ask any question or test your knowledge on a new topic.',
              icon: '/logo.png',
              badge: '/logo.png',
              tag: 'brainmate-reengage-reminder'
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch (e) {}
        }
      }, REENGAGE_DELAY_MS);
    } else if (document.visibilityState === 'visible') {
      // User returned to tab: cancel the re-engagement notification
      if (reengageTimer) {
        clearTimeout(reengageTimer);
        reengageTimer = null;
      }
    }
  };

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
}
