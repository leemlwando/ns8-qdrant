import { writable } from 'svelte/store';

export const notification = writable(null);

/**
 * Shows a notification for a limited time.
 * @param {string} kind - 'success', 'error', 'info', 'warning'
 * @param {string} title - The title of the notification
 * @param {string} subtitle - The subtitle or message
 * @param {number} [duration=5000] - Duration in milliseconds
 */
export const showNotification = (kind, title, subtitle, duration = 5000) => {
  notification.set({ kind, title, subtitle });
  setTimeout(() => notification.set(null), duration);
};