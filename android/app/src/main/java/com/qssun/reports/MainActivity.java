package com.qssun.reports;

import com.getcapacitor.BridgeActivity;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    createDefaultFcmChannelWithCustomSound();
  }
  private void createDefaultFcmChannelWithCustomSound() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      String channelId = "fcm_default_channel";
      String channelName = "General Notifications";
      NotificationChannel channel = notificationManager.getNotificationChannel(channelId);
      if (channel == null) {
        channel = new NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_DEFAULT);
      }
      // Try to use sound file at: android/app/src/main/res/raw/notification_sound.(ogg|wav|mp3)
      int soundResId = getResources().getIdentifier("notification_sound", "raw", getPackageName());
      if (soundResId != 0) {
        Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/notification_sound");
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
          .build();
        channel.setSound(soundUri, audioAttributes);
      }
      notificationManager.createNotificationChannel(channel);
    }
  }
}
