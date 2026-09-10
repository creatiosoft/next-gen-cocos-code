package org.cocos2dx.javascript;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import android.util.Log;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "FCMService";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "FCM Token: " + token);
        // TODO: 如果后面需要把 Token 传给 JS，这里可以处理
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Log.d("FCMService", "✅✅✅ 消息到达设备！");           // 这行必须有
        super.onMessageReceived(remoteMessage);

        if (remoteMessage.getNotification() != null) {
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            Log.d("FCMService", "标题: " + title);
            Log.d("FCMService", "内容: " + body);
            showDefaultNotification(title, body);
        } else {
            Log.d("FCMService", "收到的是 Data 消息（没有 Notification 部分）");
        }
    }

    // 使用系统默认样式显示通知（最简单版本）
    private void showDefaultNotification(String title, String body) {
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        String channelId = "fcm_default_channel";

        // Android 8.0 及以上必须创建通知渠道
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "游戏通知",
                    NotificationManager.IMPORTANCE_HIGH   // 重要性调高
            );
            channel.setDescription("接收游戏推送消息");
            channel.enableLights(true);
            channel.enableVibration(true);
            notificationManager.createNotificationChannel(channel);
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_MAX)           // 最高优先级
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)       // 消息类别
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);   // 锁屏也可见

        notificationManager.notify((int) System.currentTimeMillis(), builder.build());
    }
}