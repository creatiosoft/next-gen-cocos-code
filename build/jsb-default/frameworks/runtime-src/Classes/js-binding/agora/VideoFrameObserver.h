//
// Created by LXH on 2020/10/13.
//

#pragma once

#include <map>
#include <mutex>
#include <vector>

namespace agora {
namespace cocos {

class CacheVideoFrame {
public:
  void resetVideoFrame(int vwidth, int vheight, uint8_t *vdata);

public:
  int width;
  int height;
  uint8_t *data;
};

class VideoFrameObserver {
public:
  void bindTextureId(unsigned int textureId, unsigned int uid);
  void unbindTextureId(unsigned int textureId, unsigned int uid);

public:
  void cacheVideoFrame(unsigned int uid, int vwidth, int vheight, uint8_t *vdata);
  void renderTexture(unsigned int textureId, const CacheVideoFrame &frame);
  void unrenderTexture(unsigned int textureId, const CacheVideoFrame &frame);

private:
  std::map<unsigned int, CacheVideoFrame> _map;
  std::mutex mtx;
};
} // namespace cocos
} // namespace agora
