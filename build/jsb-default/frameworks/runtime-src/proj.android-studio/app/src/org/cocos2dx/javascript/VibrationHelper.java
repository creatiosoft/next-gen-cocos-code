package org.cocos2dx.javascript;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import org.cocos2dx.lib.Cocos2dxHelper;

public class VibrationHelper {
    private static final String TAG = "VibrationHelper";

    public static void vibrateWithStyle(String style, float duration) {
        try {
            Context context = Cocos2dxHelper.getActivity();
            if (context == null) {
                Log.e(TAG, "Context is null");
                return;
            }

            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator == null || !vibrator.hasVibrator()) {
                Log.w(TAG, "Device does not support vibration");
                return;
            }

            long millis = (long) (duration * 1000);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // Android 8.0+：调弱震动强度（0-255，255是最大）
                int amplitude = 120;   // ← 这里调弱（原来是 DEFAULT_AMPLITUDE ≈ 255）
                
                VibrationEffect effect = VibrationEffect.createOneShot(millis, amplitude);
                vibrator.vibrate(effect);
                Log.i(TAG, "Vibrating with weak VibrationEffect for " + millis + "ms, amplitude=" + amplitude);
            } else {
                // 老版本兼容（无法精确控制强度，只能缩短一点时长）
                long weakMillis = (long) (millis * 0.75);  // 适当缩短
                vibrator.vibrate(weakMillis);
                Log.i(TAG, "Vibrating with legacy weak method for " + weakMillis + "ms");
            }
        } catch (Exception e) {
            Log.e(TAG, "Vibration failed: " + e.getMessage());
        }
    }
}