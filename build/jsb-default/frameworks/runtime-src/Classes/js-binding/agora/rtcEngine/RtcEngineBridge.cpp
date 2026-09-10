#include "RtcEngineBridge.h"

namespace agora {
namespace common {

RtcEngineBridge::RtcEngineBridge() { }

RtcEngineBridge::~RtcEngineBridge() {
}

void RtcEngineBridge::release(bool sync, bool del) {
  if (del) {
    delete this;
  } else {
  }
}

CROSS_PLATFORM_EXPORT IRtcEngineBridge *createRtcEngineBridge() {
  return new RtcEngineBridge();
}
} // namespace common
} // namespace agora
