import { messaging } from '../firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';

class NotificationService {
  private vapidKey = 'your-vapid-key'; // You'll need to generate this in Firebase Console

  async requestPermission(): Promise<string | null> {
    try {
      if (!messaging) {
        console.log('Messaging not supported');
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return await this.getToken();
      } else {
        console.log('Unable to get permission to notify.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!messaging) return null;
      
      const currentToken = await getToken(messaging, {
        vapidKey: this.vapidKey,
      });
      
      if (currentToken) {
        console.log('Registration token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return null;
    }
  }

  setupMessageListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      
      // Show notification toast
      toast.success(
        payload.notification?.title || 'New notification',
        {
          duration: 5000,
        }
      );

      // You can also show browser notification
      if (payload.notification) {
        new Notification(payload.notification.title || 'Queue Away', {
          body: payload.notification.body,
          icon: '/favicon.ico',
        });
      }
    });
  }
}

export const notificationService = new NotificationService();