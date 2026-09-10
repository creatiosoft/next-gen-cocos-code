//
//  jsb_agoraCreator.cpp
//  Created by on 20/8/3
//

#include "jsb_agoraCreator.h"

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT ||                                \
     CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID ||                              \
     CC_TARGET_PLATFORM == CC_PLATFORM_IOS ||                                  \
     CC_TARGET_PLATFORM == CC_PLATFORM_MAC ||                                  \
     CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)

#include <cstdarg>
#include <cstddef>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#include "base/CCScheduler.h"
#include "cocos2d.h"
#include "platform/CCApplication.h"
#include "scripting/js-bindings/manual/jsb_conversions.hpp"
#include "scripting/js-bindings/manual/jsb_global.h"

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#define AGORA_CALL __cdecl
#if defined(AGORARTC_EXPORT)
#define AGORA_API extern "C" __declspec(dllexport)
#else
#define AGORA_API extern "C" __declspec(dllimport)
#endif
#elif defined(__APPLE__)
#define AGORA_API __attribute__((visibility("default"))) extern "C"
#define AGORA_CALL
#elif defined(__ANDROID__) || defined(__linux__) || defined(__linux)
#define AGORA_API extern "C" __attribute__((visibility("default")))
#define AGORA_CALL
#else
#define AGORA_API extern "C"
#define AGORA_CALL
#endif

#include "rtcEngine/RtcEngineBridge.h"

using namespace cocos2d;
using namespace agora::common;

se::Class *js_cocos2dx_agoraCreator_class = nullptr;
agora::cocos::VideoFrameObserver *videoFrameObserver;

bool cacheVideoFrame(int uid, int vwidth, int vheight, uint8_t *vdata) {
    if (videoFrameObserver) {
        videoFrameObserver->cacheVideoFrame(uid, vwidth, vheight, vdata);
    }
    return true;
}

static bool js_cocos2dx_extension_agoraCreator_bindTextureId(se::State &s) {
//    CCLOG("[Agora] js_cocos2dx_extension_agoraCreator_bindTextureId");
  const auto &args = s.args();
  size_t argc = args.size();
  CC_UNUSED bool ok = true;
  if (argc == 2) {
    uint32_t textureId;
    ok &= seval_to_uint32(args[0], &textureId);

    uint32_t uid;
    ok &= seval_to_uint32(args[1], &uid);

    if (videoFrameObserver) {
      videoFrameObserver->bindTextureId(textureId, uid);
    }

    SE_PRECONDITION2(ok, false,
                     "js_cocos2dx_extension_agoraCreator_"
                     "bindTextureId: Error processing arguments");
    return true;
  }

  SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc,
                  0);
  return false;
}

SE_BIND_FUNC(js_cocos2dx_extension_agoraCreator_bindTextureId)

static bool js_cocos2dx_extension_agoraCreator_unbindTextureId(se::State &s) {
//    CCLOG("[Agora] js_cocos2dx_extension_agoraCreator_unbindTextureId");
  const auto &args = s.args();
  size_t argc = args.size();
  CC_UNUSED bool ok = true;
  if (argc == 2) {
    uint32_t textureId;
    ok &= seval_to_uint32(args[0], &textureId);

    uint32_t uid;
    ok &= seval_to_uint32(args[1], &uid);

    if (videoFrameObserver) {
      videoFrameObserver->unbindTextureId(textureId, uid);
    }

    SE_PRECONDITION2(ok, false,
                     "js_cocos2dx_extension_agoraCreator_"
                     "unbindTextureId: Error processing arguments");
    return true;
  }

  SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc,
                  0);
  return false;
}

SE_BIND_FUNC(js_cocos2dx_extension_agoraCreator_unbindTextureId)

static bool js_cocos2dx_extension_agoraCreator_finalize(se::State &s) {
  auto *cobj = (RtcEngineBridge *)s.nativeThisObject();
  if (cobj) {
    cobj->release(true);
  }

  if (videoFrameObserver) {
    delete videoFrameObserver;
    videoFrameObserver = nullptr;
  }
  return true;
}

SE_BIND_FINALIZE_FUNC(js_cocos2dx_extension_agoraCreator_finalize)

static bool js_cocos2dx_extension_agoraCreator_constructor(se::State &s) {
    CCLOG("[Agora] js_cocos2dx_extension_agoraCreator_constructor");
  auto *obj = s.thisObject();

  if (!videoFrameObserver) {
    videoFrameObserver = new agora::cocos::VideoFrameObserver;
  }

  auto *mAgoraEngine = new RtcEngineBridge();

  if (obj) {
    obj->setPrivateData(mAgoraEngine);
    se::Value func;
    if (obj->getProperty("_ctor", &func)) {
      func.toObject()->call(se::EmptyValueArray, obj);
    }
  }

  return true;
}

SE_BIND_CTOR(js_cocos2dx_extension_agoraCreator_constructor,
             js_cocos2dx_agoraCreator_class,
             js_cocos2dx_extension_agoraCreator_finalize)

bool js_register_cocos2dx_extension_agoraCreator(se::Object *obj) {
  CCLOG("[Agora] js_register_cocos2dx_extension_agoraCreator");

  auto cls =
      se::Class::create("agoraCreator", obj, nullptr,
                        _SE(js_cocos2dx_extension_agoraCreator_constructor));

  cls->defineFunction("bindTextureId",
                  _SE(js_cocos2dx_extension_agoraCreator_bindTextureId));

  cls->defineFunction("unbindTextureId",
                  _SE(js_cocos2dx_extension_agoraCreator_unbindTextureId));

  cls->defineFinalizeFunction(_SE(js_cocos2dx_extension_agoraCreator_finalize));
  cls->install();

  js_cocos2dx_agoraCreator_class = cls;

  se::ScriptEngine::getInstance()->clearException();
  return true;
}

bool register_jsb_agoraCreator(se::Object *obj) {
  CCLOG("[Agora] register_jsb_agoraCreator");
  return js_register_cocos2dx_extension_agoraCreator(obj);
}

#endif
