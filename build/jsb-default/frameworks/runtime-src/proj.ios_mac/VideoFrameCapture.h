#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import "cocos2d.h"

@interface VideoFrameCapture : NSObject

@property (nonatomic, strong) NSTimer *captureTimer;
@property (nonatomic, assign) BOOL hasAddedPlayerItemObserver;


- (instancetype)initWithURL:(NSURL *)videoURL;
- (void)startPlaying:(BOOL)isMute;
- (void)stopPlaying;
- (void)stopPlayingForce;

- (void)muteNow;
- (void)unmuteNow;

- (void)pauseNow;
- (void)resumeNow;

@end
