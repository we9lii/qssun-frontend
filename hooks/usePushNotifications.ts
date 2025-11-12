import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { NotificationToast } from '../components/common/NotificationToast';

export const usePushNotifications = (userId: string | undefined) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || Capacitor.getPlatform() === 'web') {
      return;
    }

    const register = () => {
      PushNotifications.checkPermissions().then(res => {
        if (res.receive !== 'granted') {
          PushNotifications.requestPermissions().then(res => {
            if (res.receive === 'granted') {
              PushNotifications.register();
            } else {
              toast.error('تم رفض إذن الإشعارات.');
            }
          });
        } else {
          PushNotifications.register();
        }
      });
    };

    register();

    const registrationListener = PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      try {
        await fetch(`${API_BASE_URL}/fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token: token.value }),
        });
        console.log("Successfully sent FCM token to server.");
      } catch (error) {
        console.error('Failed to send FCM token to server:', error);
        toast.error('فشل إرسال معرّف الإشعارات للخادم.');
      }
    });

    const registrationErrorListener = PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on push registration:', error);
      toast.error(`فشل تسجيل الإشعارات: ${error.error}`);
    });

    const pushNotificationReceivedListener = PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
      toast.custom(
        (t) => React.createElement(NotificationToast, {
          t: t,
          title: notification.title,
          body: notification.body,
          link: notification.data.link,
        }),
        {
          duration: 6000,
        }
      );
    });

    const pushNotificationActionPerformedListener = PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push action performed:', action);
      const url = action.notification.data.link;
      if (url) {
        navigate(url);
      }
    });

    // Cleanup on unmount
    return () => {
        registrationListener.then(listener => listener.remove());
        registrationErrorListener.then(listener => listener.remove());
        pushNotificationReceivedListener.then(listener => listener.remove());
        pushNotificationActionPerformedListener.then(listener => listener.remove());
    };
  }, [userId, navigate]);

};