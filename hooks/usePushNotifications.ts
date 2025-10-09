
import { useState, useEffect } from 'react';
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
      // FIX: Replaced JSX with React.createElement calls to be compatible with a .ts file extension.
      // The original code used JSX, which is not supported in .ts files and caused numerous parsing errors.
      toast.custom(
        (t) => React.createElement('div', {
          className: `${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-700 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`,
          onClick: () => {
            toast.dismiss(t.id);
            if (notification.data.link) navigate(notification.data.link);
          }
        },
          React.createElement('div', { className: 'flex-1 w-0 p-4' },
            React.createElement('div', { className: 'flex items-start' },
              React.createElement('div', { className: 'ml-3 flex-1' },
                React.createElement('p', { className: 'text-sm font-medium text-slate-900 dark:text-slate-100' },
                  notification.title
                ),
                React.createElement('p', { className: 'mt-1 text-sm text-slate-500 dark:text-slate-300' },
                  notification.body
                )
              )
            )
          )
        ),
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
        registrationListener.remove();
        registrationErrorListener.remove();
        pushNotificationReceivedListener.remove();
        pushNotificationActionPerformedListener.remove();
    };
  }, [userId, navigate]);

};
