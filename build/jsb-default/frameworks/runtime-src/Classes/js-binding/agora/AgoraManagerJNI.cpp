/******************************************************************
//fileName:C:\cocos2d22\cocos2d-x-2.2\projects\learnenglish\Classes\crosscall\crosscall.cpp	

//date:2014/3/14 0:10

//desc:java中调用2dx

//author:bs
******************************************************************/
#include "cocos2d.h"
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include <stdlib.h>
#include <jni.h>
#include <android/log.h>
#include <string>

#include "jsb_agoraCreator.h"

extern "C"
JNIEXPORT jboolean JNICALL
Java_org_cocos2dx_javascript_AppActivity_jni_1onRenderRemoteVideo(JNIEnv *env, jclass clazz,
                                                                  jint source_type,
                                                                  jint width,
                                                                  jint height,
                                                                  jobject buffer) {
//    CCLOG("jni_onRenderRemoteVideo");

    jbyte* bufferStart = static_cast<jbyte*>(env->GetDirectBufferAddress(buffer));
    jlong inputLength = env->GetDirectBufferCapacity(buffer);

    auto size = width * height * 4;
    uint8_t *data = new uint8_t[size];
    memcpy(data, bufferStart, inputLength);
    width = width;
    height = height;
    cacheVideoFrame(source_type, width, height, data);
    delete[] data;
    return true;
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_org_cocos2dx_javascript_AppActivity_jni_1onRenderLocalVideo(JNIEnv *env, jclass clazz,
                                                                 jint source_type, jint width,
                                                                 jint height, jobject buffer) {
//    CCLOG("onRenderLocalVideo");

    jbyte* bufferStart = static_cast<jbyte*>(env->GetDirectBufferAddress(buffer));
    jlong inputLength = env->GetDirectBufferCapacity(buffer);

    auto size = width * height * 4;
    uint8_t *data = new uint8_t[size];
    memcpy(data, bufferStart, inputLength);
    width = width;
    height = height;
    cacheVideoFrame(source_type, width, height, data);
    delete[] data;
    return true;
}


#endif