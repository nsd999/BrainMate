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
      toast.success('Notifications enabled! We will notify you when explanations or quiz results are ready.');
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
 * Trigger system notification with toast fallback
 */
export function sendBrainNotification(title, body, icon = '/logo.png') {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'brainmate-notification'
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('System notification failed, falling back to toast', e);
    }
  }

  // Always show a polished toast as well
  toast.success(title, { description: body });
}

/**
 * Preset notifications for key app milestones
 */
export function notifyExplanationComplete(topic) {
  sendBrainNotification(
    '✨ Explanation Ready!',
    `BrainMate finished breaking down "${topic}". Check it out now!`
  );
}

export function notifyQuizComplete(score, total) {
  const percentage = Math.round((score / total) * 100);
  sendBrainNotification(
    '🎉 Quiz Completed!',
    `You scored ${score}/${total} (${percentage}%) on your BrainMate quiz!`
  );
}
