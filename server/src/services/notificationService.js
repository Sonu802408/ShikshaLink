import { Notification } from '../models/Notification.js';

export const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'system',
  link = ''
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      link
    });

    // In local development / test mode, log the notification clearly
    console.log(`[TEST NOTIFICATION SERVICE] [${type.toUpperCase()}] To User ID: ${recipient}`);
    console.log(`  Title: ${title}`);
    console.log(`  Message: ${message}`);
    if (link) console.log(`  Action Link: ${link}`);

    return notification;
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
};
