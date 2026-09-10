//
//  jsb_agoraCreator.h
//
//  Created by becklee on 18/3/3.
//

#ifndef jsb_Agora_h
#define jsb_Agora_h

#include "base/ccConfig.h"

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT ||                                \
     CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID ||                              \
     CC_TARGET_PLATFORM == CC_PLATFORM_IOS ||                                  \
     CC_TARGET_PLATFORM == CC_PLATFORM_MAC ||                                  \
     CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)

#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "VideoFrameObserver.h"

extern se::Class *js_cocos2dx_agoraCreator_class;

bool js_register_cocos2dx_extension_agoraCreator(se::Object *obj);

bool register_jsb_agoraCreator(se::Object *obj);

bool cacheVideoFrame(int uid, int vwidth, int vheight, uint8_t *vdata);

#endif //#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM ==
       // CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS ||
       // CC_TARGET_PLATFORM == CC_PLATFORM_MAC || CC_TARGET_PLATFORM ==
       // CC_PLATFORM_WIN32)

#endif /* jsb_Agora_h */
