#ifndef __AGORA_MANAGER_H__
#define __AGORA_MANAGER_H__

class AgoraManager {
public:
  static AgoraManager *getInstance();

  static void registerJSBCallback();

private:
  AgoraManager();

  virtual ~AgoraManager();

  static AgoraManager *_pInstance;
};

#endif
