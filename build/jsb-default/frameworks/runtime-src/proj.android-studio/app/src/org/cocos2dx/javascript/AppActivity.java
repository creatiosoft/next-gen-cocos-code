/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.cocos2dx.lib.Cocos2dxWebViewHelper;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Environment;
import android.util.Log;
import androidx.core.content.FileProvider;

import android.view.Gravity;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import java.io.File;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.game.txpoker.R;
import com.google.firebase.messaging.FirebaseMessaging;

import io.agora.base.VideoFrame;
import io.agora.rtc2.ChannelMediaOptions;
import io.agora.rtc2.Constants;
import io.agora.rtc2.IRtcEngineEventHandler;
import io.agora.rtc2.RtcEngine;
import io.agora.rtc2.RtcEngineConfig;
import io.agora.rtc2.video.IVideoFrameObserver;
import io.agora.rtc2.video.VideoEncoderConfiguration;

public class AppActivity extends Cocos2dxActivity {
    private static String fcmToken = "";

    // ==================== Token 保存和获取方法（和 iOS 一致） ====================
    public static String getFCM() {
        String temp = fcmToken;
//        fcmToken = "";           // 清空，和 iOS 行为一致
        return temp;
    }

    public static void setFCM(String newFCM) {
        if (newFCM != null && !newFCM.equals(fcmToken)) {
            fcmToken = newFCM;
        }
    }

    private static ImageView splashView;  // 静态，便于从 JS 调用
    private static ImageView backgroundView;   // 背景图（新增）
    private static AppActivity instance;  // 用于静态方法访问

    
    private static native boolean jni_onRenderRemoteVideo(int sourceType, int width, int height, ByteBuffer buffer);
    private static native boolean jni_onRenderLocalVideo(int sourceType, int width, int height, ByteBuffer buffer);

    private static RtcEngine mRtcEngine;

    private static boolean joined = false;
    private static boolean isAudioEnabled = false;
    private static boolean isVideoEnabled = false;

    // 权限请求代码
    private static final int REQUEST_CODE_CAMERA = 1001;
    private static final int REQUEST_CODE_MICROPHONE = 1002;

    private static Map<Integer, Boolean> remoteVideoMuteStatus = new HashMap<>();
    private static Map<Integer, Boolean> remoteSelfVideoMuteStatus = new HashMap<>();
    private static Map<Integer, Boolean> remoteAudioMuteStatus = new HashMap<>();
    private static Map<Integer, Boolean> remotePlayers = new HashMap<>();

    public static AppActivity activity = null;
    public static String TAG = "AppActivity";
    public static String ChannelName = "";
    public static int uid = 0;
    public static Context dpApp;
    String[] permissions = new String[]{
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_NETWORK_STATE,
            Manifest.permission.ACCESS_WIFI_STATE,
//            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.MANAGE_EXTERNAL_STORAGE,
            Manifest.permission.ACCESS_MEDIA_LOCATION,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.POST_NOTIFICATIONS
    };
    List<String> mPermissionList = new ArrayList<>();

    public static void JavaCopy(final String str){
        activity.runOnUiThread(new Runnable(){
        @Override
            public void run() {
                ClipboardManager cm = (ClipboardManager)activity.getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("", str);
                cm.setPrimaryClip(clip);
            }
        });
    }

    public static void agoraBridgeCall(final String method, final String data, final String msg) {
        Cocos2dxGLSurfaceView.getInstance().queueEvent(
                new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString("cc.AgoraBridgeCall.nativeCallback(\"" + method + "\",\"" + data + "\",\"" + msg + "\")");
//                        Cocos2dxJavascriptJavaBridge.evalString("cc.AgoraBridgeCall.nativeCallback(\"" + method + "\",\"" + data + "\")");
                    }
                }
        );
    }

    private static final IRtcEngineEventHandler mRtcEventHandler = new IRtcEngineEventHandler() {
        // 成功加入频道回调
        @Override
        public void onJoinChannelSuccess(String channel, int uid, int elapsed) {
            Log.d(TAG, "onJoinChannelSuccess " + channel + " " + uid + " " + elapsed);
            joined = true;
            isVideoEnabled = true;
            super.onJoinChannelSuccess(channel, uid, elapsed);

            agoraBridgeCall("doLogin", String.valueOf(uid), ChannelName);
        }

        // 远端用户或主播加入当前频道回调
        @Override
        public void onUserJoined(int uid, int elapsed) {
            Log.d(TAG, "onUserJoined " + uid + " " + elapsed);
            super.onUserJoined(uid, elapsed);

            if (!remotePlayers.containsKey(uid)) {
                remotePlayers.put(uid, true);
            }

//            JSONObject json = new JSONObject();
//            try {
//                json.put("uid", String.valueOf( uid));
                agoraBridgeCall("onUserJoined", String.valueOf(uid), ChannelName);
//            } catch (JSONException e) {
//                throw new RuntimeException(e);
//            }
        }

        @Override
        public void onConnectionStateChanged(int state, int reason) {
            super.onConnectionStateChanged(state, reason);

            String stateMessage = getConnectionStateMessage(state);
            String reasonMessage = getConnectionChangeReasonMessage(reason);

            Log.d(TAG, "onConnectionStateChanged " + stateMessage + " " + reasonMessage);
        }

        // 远端用户或主播离开当前频道回调
        @Override
        public void onUserOffline(int uid, int reason) {
            Log.d(TAG, "onUserOffline " + uid + " " + reason);
            super.onUserOffline(uid, reason);

            if (remotePlayers.containsKey(uid)) {
                remotePlayers.remove(uid);
            }

            agoraBridgeCall("onUserOffline", String.valueOf(uid), ChannelName);

            remoteAudioMuteStatus.remove(uid);
            remoteVideoMuteStatus.remove(uid);
            remoteSelfVideoMuteStatus.remove(uid);

        }

        @Override
        public void onUserMuteVideo(int uid, boolean muted) {
            super.onUserMuteVideo(uid, muted);

            Log.d("Agora onUserMuteVideo", "User " + uid + "'s video is xxmuted.");

//            remoteVideoMuteStatus.put(uid, muted);

            if (muted) {
                remoteSelfVideoMuteStatus.put(uid, true);
                agoraBridgeCall("onUserVideoOff", String.valueOf(uid), ChannelName);
            }
            else {
                remoteSelfVideoMuteStatus.remove(uid);

                if (isRemoteVideoMuted(uid)) {
                    return;
                }
                agoraBridgeCall("onUserVideoOn", String.valueOf(uid), ChannelName);
            }
        }

        @Override
        public void onUserMuteAudio(int uid, boolean muted) {
//            remoteAudioMuteStatus.put(uid, muted);
            if (muted) {
                Log.d("Agora", "User " + uid + "'s audio is muted.");
            } else {
                Log.d("Agora", "User " + uid + "'s audio is unmuted.");
            }
        }
    };

    static IVideoFrameObserver videoFrameObserver = new IVideoFrameObserver() {
        @Override
        public boolean onCaptureVideoFrame(int sourceType, VideoFrame videoFrame) {
//            Log.d(TAG, "onCaptureVideoFrame: " + "  buffer: " + videoFrame.getBuffer());
            if (videoFrame.getBuffer() instanceof VideoFrame.RgbaBuffer) {
                final VideoFrame.RgbaBuffer textureBuffer = (VideoFrame.RgbaBuffer) videoFrame.getBuffer();
                jni_onRenderLocalVideo(uid, textureBuffer.getWidth(), textureBuffer.getHeight(), textureBuffer.getData());
            }
            return false;
        }

        @Override
        public boolean onPreEncodeVideoFrame(int sourceType, VideoFrame videoFrame) {
//            Log.d(TAG, "onPreEncodeVideoFrame");
            return false;
        }

        @Override
        public boolean onMediaPlayerVideoFrame(VideoFrame videoFrame, int i) {
//            Log.d(TAG, "onMediaPlayerVideoFrame: " + i + "  buffer: " + videoFrame.getBuffer());
            return false;
        }

        @Override
        public boolean onRenderVideoFrame(String s, int i, VideoFrame videoFrame) {
//            Log.d(TAG, "onRenderVideoFrame: " + s + " " + i + "  buffer: " + videoFrame.getBuffer());

            if (videoFrame.getBuffer() instanceof VideoFrame.RgbaBuffer) {
                final VideoFrame.RgbaBuffer textureBuffer = (VideoFrame.RgbaBuffer) videoFrame.getBuffer();
                jni_onRenderRemoteVideo(i, textureBuffer.getWidth(), textureBuffer.getHeight(), textureBuffer.getData());
            }
            return false;
        }

        @Override
        public int getVideoFrameProcessMode() {
//            Log.d(TAG, "getVideoFrameProcessMode");
            return PROCESS_MODE_READ_ONLY;
        }

        @Override
        public int getVideoFormatPreference() {
//            Log.d(TAG, "getVideoFormatPreference");
            return VIDEO_PIXEL_RGBA;
//            return 0;
        }

        @Override
        public boolean getRotationApplied() {
//            Log.d(TAG, "getRotationApplied");
            return true;
        }

        @Override
        public boolean getMirrorApplied() {
//            Log.d(TAG, "getMirrorApplied");
            return false;
        }

        @Override
        public int getObservedFramePosition() {
//            Log.d(TAG, "getObservedFramePosition");
            return 0;
        }
    };

    private static Cocos2dxGLSurfaceView sSurfaceView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        activity = this;
        dpApp = AppActivity.this;
        reqPermission();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        instance = this;

        // 先添加背景
        backgroundView = new ImageView(this);
        backgroundView.setBackgroundColor(Color.BLACK);
        backgroundView.setImageResource(R.drawable.background);
        backgroundView.setScaleType(ImageView.ScaleType.CENTER_CROP);

        FrameLayout.LayoutParams bgParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        );
        mFrameLayout.addView(backgroundView, bgParams);

// 再添加 Logo
        splashView = new ImageView(this);
        splashView.setBackgroundColor(Color.TRANSPARENT);
        splashView.setImageResource(R.drawable.logo);
        splashView.setScaleType(ImageView.ScaleType.CENTER);
        splashView.setTranslationY(-90f);

        FrameLayout.LayoutParams logoParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        );
        mFrameLayout.addView(splashView, logoParams);

        // ==================== 主动获取 FCM Token ====================
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        Log.w("FCM", "获取 FCM Token 失败", task.getException());
                        return;
                    }

                    String token = task.getResult();
                    Log.d("FCM", "✅✅✅ FCM Token: " + token);
                    AppActivity.setFCM(token);
                    // TODO: 把 token 传给 JS 层（后面我们再处理）
                    // 例如：调用你之前写的 setFCM 方法
                });
        // =========================================================
    }

    // 静态方法，从 JS 调用移除 splash
    public static void removeSplash() {
        if (instance != null) {
            instance.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    // 移除 Logo
                    if (splashView != null && splashView.getParent() != null) {
                        ((ViewGroup) splashView.getParent()).removeView(splashView);
                        splashView = null;
                    }

                    // 移除背景图（关键！）
                    if (backgroundView != null && backgroundView.getParent() != null) {
                        ((ViewGroup) backgroundView.getParent()).removeView(backgroundView);
                        backgroundView = null;
                    }
                }
            });
        }
    }

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);
        sSurfaceView = glSurfaceView;
        return glSurfaceView;
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (!isTaskRoot()) {
            return;
        }

        if (mRtcEngine != null) {
            mRtcEngine.registerVideoFrameObserver(null);
            mRtcEngine.leaveChannel();
            mRtcEngine = null;
            RtcEngine.destroy();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        Cocos2dxWebViewHelper.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    public void onBackPressed() {
        Cocos2dxHelper.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString("BackPressed.javaCallJs();");
            }
        });
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    public static void exitGame() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // 1. 首先结束所有 Activity
                    if (activity != null) {
                        // 如果是主 Activity，先结束其他 Activity
                        activity.finishAffinity(); // 结束所有同一任务栈中的 Activity

                        // 2. 根据版本使用不同方法
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            activity.finishAndRemoveTask();
                        }

                        // 3. 确保退出
                        System.exit(0);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    // 4. 异常情况强制退出
                    int pid = android.os.Process.myPid();
                    android.os.Process.killProcess(pid);
                }
            }
        });
    }

    public static void reqPermission() {

        Log.d("permission", "reqPermission");
        activity.mPermissionList.clear();
        for (int i = 0; i < activity.permissions.length; i++) {
            Log.d("permission", activity.permissions[i].toString());
            if (ContextCompat.checkSelfPermission(activity, activity.permissions[i]) != PackageManager.PERMISSION_GRANTED) {
                activity.mPermissionList.add(activity.permissions[i]);
            }
        }
        if (!activity.mPermissionList.isEmpty()) {//请求权限方法
            Log.d("permission", "!app.mPermissionList.isEmpty()");
            Log.d("permission", "requestPermissions");
            String[] permissions = activity.mPermissionList.toArray(new String[activity.mPermissionList.size()]);//将List转为数组
            ActivityCompat.requestPermissions(activity, permissions, 1);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        Log.d("permission", "onRequestPermissionsResult");
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1) {
            if (grantResults.length > 0) {
                //被用户拒绝的权限集合
                List<String> deniedPermissions = new ArrayList<>();
                //用户通过的权限集合
                List<String> grantedPermissions = new ArrayList<>();
                for (int i = 0; i < grantResults.length; i++) {
                    //获取授权结果，这是一个int类型的值
                    int grantResult = grantResults[i];
                    if (grantResult != PackageManager.PERMISSION_GRANTED) { //用户拒绝授权的权限
                        String permission = permissions[i];
                        deniedPermissions.add(permission);
                    } else {  //用户同意的权限
                        String permission = permissions[i];
                        grantedPermissions.add(permission);
                    }
                }
                if (deniedPermissions.isEmpty()) {
                } else {
                }
            }
        }
        else if (requestCode == REQUEST_CODE_CAMERA) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "Camera permission granted.");
                agoraBridgeCall("requestVideoPermission", "3", "");
            } else {
                Log.d(TAG, "Camera permission denied.");
                agoraBridgeCall("requestVideoPermission", "2", "");
            }
        } else if (requestCode == REQUEST_CODE_MICROPHONE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "Microphone permission granted.");
                agoraBridgeCall("requestAudioPermission", "3", "");
            } else {
                Log.d(TAG, "Microphone permission denied.");
                agoraBridgeCall("requestAudioPermission", "2", "");
            }
        }
    }

    public static void initEngine() {
        RtcEngineConfig config = new RtcEngineConfig();
        config.mContext = (AppActivity) getContext();
        config.mAppId = "d19330a189e441b7b5bdf29ffb35b6d4";
        config.mEventHandler = mRtcEventHandler;
        try {
            mRtcEngine = RtcEngine.create(config);
            Log.d(TAG, "RtcEngine.create");
        } catch (Exception e) {
            Log.d(TAG, "RtcEngine.create Exception " + e.toString());
            throw new RuntimeException(e);
        }
    }

    public static void joinChannel(String room, String token, String userId) {
        Log.d(TAG, "joinChannel: " + room);
        Log.d(TAG, "joinChannel: " + token);
        Log.d(TAG, "joinChannel: " + userId);

        ChannelName = room;
        if (joined) {
            if (isVideoEnabled) {
                mRtcEngine.disableAudio();
                mRtcEngine.disableVideo();
                muteLocalVideoStream();
                muteLocalAudioStream();
                isAudioEnabled = false;
                isVideoEnabled = false;
            }
            else {
                mRtcEngine.enableAudio();
                mRtcEngine.enableVideo();
                unmuteLocalVideoStream();
                unmuteLocalAudioStream();
                isAudioEnabled = true;
                isVideoEnabled = true;
            }
        }
        else {
            final AppActivity app = (AppActivity) getContext();
            // 创建 ChannelMediaOptions 对象，并进行配置
            ChannelMediaOptions options = new ChannelMediaOptions();
            // 设置用户角色为 BROADCASTER (主播) 或 AUDIENCE (观众)
            options.clientRoleType = Constants.CLIENT_ROLE_BROADCASTER;
            // 设置频道场景为 BROADCASTING (直播场景)
            options.channelProfile = Constants.CHANNEL_PROFILE_LIVE_BROADCASTING;
            // 发布麦克风采集的音频
            options.publishMicrophoneTrack = true;
            options.publishCameraTrack = true;
            // 自动订阅所有音频流
            options.autoSubscribeAudio = true;
            options.autoSubscribeVideo = true;

            mRtcEngine.enableVideo();
            mRtcEngine.enableAudio();

            isAudioEnabled = true;
            isVideoEnabled = true;
            // Setting orientation mode on Android for video encoder
            mRtcEngine.setVideoEncoderConfiguration(new VideoEncoderConfiguration(
                    new VideoEncoderConfiguration.VideoDimensions(300, 300),
                    VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_15,
                    VideoEncoderConfiguration.STANDARD_BITRATE,
                    VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_PORTRAIT));  // Portrait mode


            mRtcEngine.registerVideoFrameObserver(videoFrameObserver);
            uid = Integer.parseInt(userId);
            mRtcEngine.joinChannel(token, room, uid, options);

            joined = true;
        }
    }

    public static void leaveChannel(String room, String token) {
        mRtcEngine.leaveChannel();
        joined = false;
        isAudioEnabled = false;
        isVideoEnabled = false;
        remoteVideoMuteStatus.clear();
        remoteSelfVideoMuteStatus.clear();
        remoteAudioMuteStatus.clear();
        remotePlayers.clear();
        ChannelName = "";
    }

    public static void muteLocalAudioStream() {
        mRtcEngine.disableAudio();
    }

    public static void unmuteLocalAudioStream() {
        mRtcEngine.enableAudio();
    }

    public static void muteLocalVideoStream() {
        isVideoEnabled = false;
//        mRtcEngine.disableVideo();
        mRtcEngine.muteLocalVideoStream(true);
    }

    public static void unmuteLocalVideoStream() {
        isVideoEnabled = true;
//        mRtcEngine.enableVideo();
        mRtcEngine.muteLocalVideoStream(false);
    }

    public static void muteRemoteAudioStream(int uid) {
        remoteAudioMuteStatus.put(uid, true);
//        mRtcEngine.muteRemoteAudioStream(uid, true);
        mRtcEngine.muteRemoteAudioStream(uid, true);
    }

    public static void unmuteRemoteAudioStream(int uid) {
        remoteAudioMuteStatus.put(uid, false);
//        mRtcEngine.muteRemoteAudioStream(uid, false);
        mRtcEngine.muteRemoteAudioStream(uid, false);
    }

    public static void muteRemoteVideoStream(int uid) {
        remoteVideoMuteStatus.put(uid, true);
        mRtcEngine.muteRemoteVideoStream(uid, true);
    }

    public static void unmuteRemoteVideoStream(int uid) {
        remoteVideoMuteStatus.put(uid, false);
        mRtcEngine.muteRemoteVideoStream(uid, false);
    }

    private static String getConnectionStateMessage(int state) {
        switch (state) {
            case Constants.CONNECTION_STATE_DISCONNECTED:
                return "Disconnected";
            case Constants.CONNECTION_STATE_CONNECTING:
                return "Connecting";
            case Constants.CONNECTION_STATE_CONNECTED:
                return "Connected";
            case Constants.CONNECTION_STATE_RECONNECTING:
                return "Reconnecting";
            case Constants.CONNECTION_STATE_FAILED:
                return "Failed";
            default:
                return "Unknown State";
        }
    }

    private static String getConnectionChangeReasonMessage(int reason) {
        switch (reason) {
            case Constants.CONNECTION_CHANGED_CONNECTING:
                return "Connecting";
            case Constants.CONNECTION_CHANGED_JOIN_SUCCESS:
                return "Join Success";
            case Constants.CONNECTION_CHANGED_INTERRUPTED:
                return "Connection Interrupted";
            case Constants.CONNECTION_CHANGED_BANNED_BY_SERVER:
                return "Banned by Server";
            case Constants.CONNECTION_CHANGED_JOIN_FAILED:
                return "Join Failed";
            case Constants.CONNECTION_CHANGED_LEAVE_CHANNEL:
                return "Leave Channel";
            case Constants.CONNECTION_CHANGED_INVALID_APP_ID:
                return "Invalid App ID";
            case Constants.CONNECTION_CHANGED_INVALID_CHANNEL_NAME:
                return "Invalid Channel Name";
            case Constants.CONNECTION_CHANGED_INVALID_TOKEN:
                return "Invalid Token";
            case Constants.CONNECTION_CHANGED_TOKEN_EXPIRED:
                return "Token Expired";
            case Constants.CONNECTION_CHANGED_REJECTED_BY_SERVER:
                return "Rejected by Server";
            case Constants.CONNECTION_CHANGED_SETTING_PROXY_SERVER:
                return "Setting Proxy Server";
            case Constants.CONNECTION_CHANGED_RENEW_TOKEN:
                return "Renew Token";
            case Constants.CONNECTION_CHANGED_CLIENT_IP_ADDRESS_CHANGED:
                return "Client IP Address Changed";
            case Constants.CONNECTION_CHANGED_KEEP_ALIVE_TIMEOUT:
                return "Keep Alive Timeout";
            default:
                return "Unknown Reason";
        }
    }

    public static boolean isVideoCurrentlyEnabled() {
        Log.d(TAG, "isVideoCurrentlyEnabled " + isVideoEnabled);
        return isVideoEnabled;
    }

    public static boolean isAudioCurrentlyEnabled() {
        return isAudioEnabled;
    }

    public static boolean isJoined() {
        Log.d("agora isJoined", String.valueOf(joined));
        return joined;
    }

    public static boolean isJoinedChannel(String channel) {
        Log.d("agora isJoinedChannel", String.valueOf(channel.equals(ChannelName)));
        return channel.equals(ChannelName);
    }

    public static boolean isRemoteJoined(int uid) {
        return remotePlayers.containsKey(uid);
    }

    public static boolean isRemoteVideoMuted(int uid) {
        if (!remotePlayers.containsKey(uid)) {
            return true;
        }
        // Check if the key exists, return default value (false) if not
        return remoteVideoMuteStatus.containsKey(uid) ? remoteVideoMuteStatus.get(uid) : false;
    }

    public static boolean isRemoteSelfVideoMuted(int uid) {
        if (!remotePlayers.containsKey(uid)) {
            return true;
        }
        // Check if the key exists, return default value (false) if not
        return remoteSelfVideoMuteStatus.containsKey(uid) ? remoteSelfVideoMuteStatus.get(uid) : false;
    }

    public static boolean isRemoteAudioMuted(int uid) {
        // Check if the key exists, return default value (false) if not
        return remoteAudioMuteStatus.containsKey(uid) ? remoteAudioMuteStatus.get(uid) : false;
    }

    // 检查摄像头权限
    public static int checkVideoPermission() {
        int status = ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA);
        if (status == PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "Camera permission is authorized.");
            return 3; // AVAuthorizationStatusAuthorized
        } else if (ActivityCompat.shouldShowRequestPermissionRationale(activity, Manifest.permission.CAMERA)) {
            Log.d(TAG, "Camera permission is denied (can request again).");
            return 2; // AVAuthorizationStatusDenied
        } else {
            Log.d(TAG, "Camera permission is not determined.");
            return 0; // AVAuthorizationStatusNotDetermined
        }
    }

    // 请求摄像头权限
    public static void requestVideoPermission() {
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.CAMERA}, REQUEST_CODE_CAMERA);
        } else {
            Log.d(TAG, "Camera permission already granted.");
            agoraBridgeCall("requestVideoPermission", "3", "");
        }
    }

    // 引导用户到系统设置（摄像头）
    public static void requestGuideVideoPermission() {
        Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", activity.getPackageName(), null);
        intent.setData(uri);
        try {
            activity.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Log.e(TAG, "Failed to open settings for camera permission: " + e.getMessage());
        }
    }

    // 检查麦克风权限
    public static int checkAudioPermission() {
        int status = ContextCompat.checkSelfPermission(activity, Manifest.permission.RECORD_AUDIO);
        if (status == PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "Microphone permission is authorized.");
            return 3; // AVAuthorizationStatusAuthorized
        } else if (ActivityCompat.shouldShowRequestPermissionRationale(activity, Manifest.permission.RECORD_AUDIO)) {
            Log.d(TAG, "Microphone permission is denied (can request again).");
            return 2; // AVAuthorizationStatusDenied
        } else {
            Log.d(TAG, "Microphone permission is not determined.");
            return 0; // AVAuthorizationStatusNotDetermined
        }
    }

    // 请求麦克风权限
    public static void requestAudioPermission() {
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_CODE_MICROPHONE);
        } else {
            Log.d(TAG, "Microphone permission already granted.");
            agoraBridgeCall("requestAudioPermission", "3", "");
        }
    }

    // 引导用户到系统设置（麦克风）
    public static void requestGuideAudioPermission() {
        Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", activity.getPackageName(), null);
        intent.setData(uri);
        try {
            activity.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Log.e(TAG, "Failed to open settings for microphone permission: " + e.getMessage());
        }
    }

    // AppActivity.java
    public static void updateApp(String downloadUrl) {
        if (downloadUrl == null || downloadUrl.isEmpty()) {
            android.util.Log.e("Cocos", "updateApp: downloadUrl is empty!");
            return;
        }
        Intent intent = new Intent(dpApp.getApplicationContext(), DownloadService.class);
        intent.putExtra("url", downloadUrl);
        dpApp.startService(intent);
    }

    public static void updateProgressToCocos(final int progress) {
        final int prog = Math.max(0, Math.min(100, progress));
        Cocos2dxHelper.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                try {
                    String jsCode = "GameManager.onUpdateProgress && GameManager.onUpdateProgress(" + prog + ");";
                    Cocos2dxJavascriptJavaBridge.evalString(jsCode);
                } catch (Exception e) {
                    android.util.Log.e("Cocos", "updateProgressToCocos error: " + e.getMessage());
                }
            }
        });
    }

    // ===================== 日志分享 =====================
    public static void shareLogFile(final String filePath) {
        final AppActivity activity = (AppActivity) Cocos2dxHelper.getActivity();
        if (activity == null) {
            Log.e("LogCapture", "activity is null");
            return;
        }

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    File file = new File(filePath);
                    if (!file.exists()) {
                        Log.e("LogCapture", "log file not exist: " + filePath);
                        Toast.makeText(activity, "日志文件不存在", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    // 使用 FileProvider 生成安全的 content:// URI
                    Uri contentUri = FileProvider.getUriForFile(
                            activity,
                            activity.getPackageName() + ".fileprovider",  // 注意这个 authority
                            file
                    );

                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType("text/plain");
                    shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Game Log");
                    shareIntent.putExtra(Intent.EXTRA_TEXT, "游戏日志文件");
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                    // 兼容部分老系统
                    shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                    activity.startActivity(Intent.createChooser(shareIntent, "分享游戏日志"));
                } catch (Exception e) {
                    Log.e("LogCapture", "share failed", e);
                    Toast.makeText(activity, "分享失败: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            }
        });
    }
}
