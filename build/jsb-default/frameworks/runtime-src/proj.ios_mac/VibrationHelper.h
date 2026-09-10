#import <Foundation/Foundation.h>

@interface VibrationHelper : NSObject
+ (void)vibrateWithStyle:(NSString *)style duration:(CGFloat)duration;  // duration 单位：秒
@end
