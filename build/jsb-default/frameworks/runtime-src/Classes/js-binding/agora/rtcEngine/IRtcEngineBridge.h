#pragma once

#include <string>
#include "../common/IBridgeCommon.h"

namespace agora {
namespace common {
class IRtcEngineBridge {
public:
  virtual ~IRtcEngineBridge() = default;

  virtual void release(bool sync = false, bool del = true) = 0;
};

CROSS_PLATFORM_EXPORT IRtcEngineBridge *createRtcEngineBridge();
} // namespace common
} // namespace agora
