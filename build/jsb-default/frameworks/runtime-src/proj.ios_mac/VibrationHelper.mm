#import "VibrationHelper.h"
#import <UIKit/UIKit.h>
#import <AudioToolbox/AudioToolbox.h>
#import <CoreHaptics/CoreHaptics.h>

@implementation VibrationHelper

static CHHapticEngine *_hapticEngine = nil;

+ (void)initializeHapticEngine {
    if (@available(iOS 13.0, *)) {
        if (_hapticEngine) {
//            [_hapticEngine stopWithError:nil];
            _hapticEngine = nil;
        }
        
        NSError *error = nil;
        _hapticEngine = [[CHHapticEngine alloc] initAndReturnError:&error];
        if (error) {
            NSLog(@"[Haptic] Engine init failed: %@", error);
        } else {
            [_hapticEngine startAndReturnError:nil];
            NSLog(@"[Haptic] Core Haptics engine restarted");
        }
    }
}

+ (void)appDidBecomeActive {
    [self initializeHapticEngine];
}

+ (void)vibrateWithStyle:(NSString *)style duration:(CGFloat)duration {
    if (@available(iOS 13.0, *)) {
        if (_hapticEngine == nil || !CHHapticEngine.capabilitiesForHardware.supportsHaptics) {
            [self initializeHapticEngine];
        }
        
        NSError *error = nil;
        
        // 调弱震动：降低强度 (0.4~0.6 比较柔和)
        CGFloat intensity = 0.55;     // ← 这里调弱（原来是1.0）
        CGFloat sharpness = 0.3;      // 降低 sharpness 让感觉更柔和
        
        CHHapticEvent *hapticEvent = [[CHHapticEvent alloc] initWithEventType:CHHapticEventTypeHapticContinuous
                                                                   parameters:@[
            [[CHHapticEventParameter alloc] initWithParameterID:CHHapticEventParameterIDHapticIntensity value:intensity],
            [[CHHapticEventParameter alloc] initWithParameterID:CHHapticEventParameterIDHapticSharpness value:sharpness]
        ]
                                                                      relativeTime:0.0
                                                                          duration:duration];
        
        CHHapticPattern *pattern = [[CHHapticPattern alloc] initWithEvents:@[hapticEvent] parameters:@[] error:&error];
        
        if (pattern && !error) {
            id<CHHapticPatternPlayer> player = [_hapticEngine createPlayerWithPattern:pattern error:&error];
            if (player) {
                [player startAtTime:0 error:nil];
                NSLog(@"[Haptic] Playing weak haptic for %.2fs (intensity: %.2f)", duration, intensity);
                return;
            }
        }
    }
    
    // 回退方案（也调弱）
    NSInteger count = (NSInteger)(duration / 0.25) + 1;
    for (NSInteger i = 0; i < count; i++) {
        UIImpactFeedbackGenerator *gen = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleLight];  // 改成 Light 更弱
        [gen impactOccurred];
        if (i < count - 1) [NSThread sleepForTimeInterval:0.25];
    }
}

@end
