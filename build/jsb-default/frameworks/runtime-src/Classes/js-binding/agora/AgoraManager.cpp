#include "AgoraManager.h"

#include "cocos2d.h"
#include "jsb_agoraCreator.h"

USING_NS_CC;

AgoraManager *AgoraManager::_pInstance = nullptr;

AgoraManager::AgoraManager() = default;

AgoraManager::~AgoraManager() = default;

AgoraManager *AgoraManager::getInstance() {
  if (_pInstance == nullptr) {
    _pInstance = new AgoraManager();
  }
  return _pInstance;
}

void AgoraManager::registerJSBCallback() {
  se::ScriptEngine *se = se::ScriptEngine::getInstance();
  se->addRegisterCallback(register_jsb_agoraCreator);
}
