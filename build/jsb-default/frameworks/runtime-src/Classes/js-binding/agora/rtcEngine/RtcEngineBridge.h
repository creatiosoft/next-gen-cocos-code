#pragma once

#include "IRtcEngineBridge.h"

namespace agora {
namespace common {

class RtcEngineBridge : public IRtcEngineBridge {
public:
  RtcEngineBridge();

protected:
  virtual ~RtcEngineBridge();

private:

public:
  virtual void release(bool sync = false, bool del = true) override;

};

CROSS_PLATFORM_EXPORT IRtcEngineBridge *createRtcEngineBridge();
} // namespace common
} // namespace agora
