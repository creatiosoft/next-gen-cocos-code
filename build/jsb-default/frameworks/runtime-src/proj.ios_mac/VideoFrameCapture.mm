#import "VideoFrameCapture.h"

#import <Accelerate/Accelerate.h>
#import "RootViewController.h"
#import "MediaUtils.h"
#include "jsb_agoraCreator.h"

@interface VideoFrameCapture () <AVPlayerItemOutputPullDelegate>
@property (nonatomic, strong) AVPlayer *player;
@property (nonatomic, strong) AVPlayerItem *playerItem;
@property (nonatomic, strong) AVPlayerItemVideoOutput *output;
@property (nonatomic, strong) dispatch_queue_t renderQueue;
@end

@implementation VideoFrameCapture

- (instancetype)initWithURL:(NSURL *)videoURL {
    self = [super init];
    if (self) {
        self.renderQueue = dispatch_queue_create("videoRenderQueue", DISPATCH_QUEUE_SERIAL);
        self.playerItem = [[AVPlayerItem alloc] initWithURL:videoURL];
        self.player = [[AVPlayer alloc] initWithPlayerItem:self.playerItem];
        
        // 设置输出
        NSDictionary *pbOptions = @{
            (__bridge NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
            (__bridge NSString *)kCVPixelBufferOpenGLESCompatibilityKey: @YES
        };
        self.output = [[AVPlayerItemVideoOutput alloc] initWithPixelBufferAttributes:pbOptions];
        [self.playerItem addOutput:self.output];
    }
    return self;
}

- (void)startPlaying:(BOOL)isMute {
    
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    dateFormatter.dateFormat = @"yyyy-MM-dd HH:mm:ss";  // 格式：年-月-日 时:分:秒
    NSString *timestamp = [dateFormatter stringFromDate:[NSDate date]];

    NSLog(@"[%@] Video startPlaying started", timestamp);

    
//    return;
//    // 1. 配置音频会话（与Agora兼容）
//    AVAudioSession *session = [AVAudioSession sharedInstance];
//    NSError *sessionError;
//    
//    // 关键配置：允许混合+优先扬声器
//    [session setCategory:AVAudioSessionCategoryPlayback
//                   mode:AVAudioSessionModeMoviePlayback
//                options:AVAudioSessionCategoryOptionMixWithOthers |
//                        AVAudioSessionCategoryOptionAllowBluetoothA2DP |
//                        AVAudioSessionCategoryOptionOverrideMutedMicrophoneInterruption
//                  error:&sessionError];
//    
//    if (!sessionError) {
//        [session setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation
//                    error:&sessionError];
//    }
    // 1. 配置音频会话（与Agora兼容）
//    AVAudioSession *session = [AVAudioSession sharedInstance];
//    NSError *sessionError;
//    
//    // 关键配置：允许混合+优先扬声器
//    [session setCategory:AVAudioSessionCategoryPlayAndRecord
//                   mode:AVAudioSessionModeVideoRecording
//                options:AVAudioSessionCategoryOptionMixWithOthers | AVAudioSessionCategoryOptionAllowBluetooth
//                  error:&sessionError];
//
//    
//    if (!sessionError) {
//        [session setActive:YES error:&sessionError];
//    }
    
    // 2. 设置播放器音量（增强处理）
    if (isMute) {
        self.player.volume = 0.0;
    } else {
        self.player.volume = 1.5; // 超过标准音量
        
//        // 强制扬声器输出
//        [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];
//        
//        // 音频轨道增强（针对视频中的音频轨道）
//        AVAsset *asset = self.playerItem.asset;
//        NSArray *audioTracks = [asset tracksWithMediaType:AVMediaTypeAudio];
//        if (audioTracks.count > 0) {
//            AVMutableAudioMix *audioMix = [AVMutableAudioMix audioMix];
//            AVMutableAudioMixInputParameters *params = [AVMutableAudioMixInputParameters audioMixInputParametersWithTrack:audioTracks[0]];
//            [params setVolume:1.8 atTime:kCMTimeZero]; // 增强音轨音量
//            audioMix.inputParameters = @[params];
//            self.playerItem.audioMix = audioMix;
//        }
    }
    
    // 3. 开始播放
    [self.player play];
    
    // 4. 添加观察者和输出
    [self.playerItem addOutput:self.output];
    
    if (!self.hasAddedPlayerItemObserver) {
        [self.playerItem addObserver:self forKeyPath:@"status" options:NSKeyValueObservingOptionNew context:nil];
        self.hasAddedPlayerItemObserver = YES;
    }
    
    // 6. 注册播放完成通知
    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(playerItemDidReachEnd:)
                                               name:AVPlayerItemDidPlayToEndTimeNotification
                                             object:self.playerItem];
}

- (void)muteNow
{
    self.player.volume = 0.0;
}

- (void)unmuteNow
{
    self.player.volume = 1.0;
}

- (void)stopPlayingForce {
    
    NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoPlaybackEnd\", \"88888\");"];
    const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
    se::ScriptEngine::getInstance()->evalString(script_);
    
    // 1. 停止播放
    [self.player pause];

    // 2. 清除输出和观察者
    [self.playerItem removeOutput:self.output];
    if (self.hasAddedPlayerItemObserver) {
        @try {
            [self.playerItem removeObserver:self forKeyPath:@"status"];
            self.hasAddedPlayerItemObserver = NO;
        }
        @catch (NSException *exception) {
            NSLog(@"⚠️ Tried to remove unregistered observer: %@", exception.reason);
        }
    }

    // 3. 移除播放结束通知
    [[NSNotificationCenter defaultCenter] removeObserver:self name:AVPlayerItemDidPlayToEndTimeNotification object:self.playerItem];

    // 4. 停止帧捕捉
    [self.captureTimer invalidate];
    self.captureTimer = nil;

    // 5. 彻底释放 player/playerItem
    self.player = nil;
    self.playerItem = nil;
    self.output = nil;

    NSLog(@"🛑 Video playback fully stopped and cleared");
}


- (void)stopPlaying {
    [self.player pause];
    [self.playerItem removeOutput:self.output];
    if (self.hasAddedPlayerItemObserver) {
        @try {
            [self.playerItem removeObserver:self forKeyPath:@"status"];
            self.hasAddedPlayerItemObserver = NO;
        }
        @catch (NSException *exception) {
            NSLog(@"⚠️ 尝试移除未注册的 observer: %@", exception.reason);
        }
    }
    
    // 3. 移除播放结束通知
    [[NSNotificationCenter defaultCenter] removeObserver:self name:AVPlayerItemDidPlayToEndTimeNotification object:self.playerItem];

    
    [self.captureTimer invalidate];
    self.captureTimer = nil;
}

- (void)playerItemDidReachEnd:(NSNotification *)notification {
    [self.captureTimer invalidate];
    self.captureTimer = nil;
    [self stopPlaying];
    NSLog(@"Video playback completed.");
    
    NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoPlaybackEnd\", \"88888\");"];
    const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
    se::ScriptEngine::getInstance()->evalString(script_);
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
//    NSLog(@"startPlaying2");
    if ([keyPath isEqualToString:@"status"] && [object isKindOfClass:[AVPlayerItem class]]) {
        AVPlayerItem *playerItem = (AVPlayerItem *)object;
        if (playerItem.status == AVPlayerItemStatusReadyToPlay) {
            NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
            dateFormatter.dateFormat = @"yyyy-MM-dd HH:mm:ss";  // 格式：年-月-日 时:分:秒
            NSString *timestamp = [dateFormatter stringFromDate:[NSDate date]];

            NSLog(@"[%@] Video is ready to play", timestamp);
            
//            NSLog(@"Video is ready to play.");
            // 🔒 Check with rootVC if recording is in progress
            
            RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
            if ([rootVC respondsToSelector:@selector(isRecordingVideo)] && [rootVC isRecordingVideo]) {
                NSLog(@"🔇 Recording in progress, pausing playback immediately");
                [self pauseNow];
            }
            NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoPlaybackStart\", \"88888\");"];
            const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
//            NSLog(@"%@", script);
            se::ScriptEngine::getInstance()->evalString(script_);
            self.captureTimer = [NSTimer scheduledTimerWithTimeInterval:1.0 / 30.0 target:self selector:@selector(captureFrame) userInfo:nil repeats:YES];
        }
    }
}

- (void)captureFrame {
    CMTime itemTime = [self.output itemTimeForHostTime:CACurrentMediaTime()];
    if ([self.output hasNewPixelBufferForItemTime:itemTime]) {
        CVPixelBufferRef pixelBuffer = [self.output copyPixelBufferForItemTime:itemTime itemTimeForDisplay:nil];
        if (pixelBuffer) {
            UIImage *image = [MediaUtils pixelBufferToImage:pixelBuffer];
            CGDataProviderRef provider = CGImageGetDataProvider(image.CGImage);
            NSData* data = (id)CFBridgingRelease(CGDataProviderCopyData(provider));
            uint8_t *bytes = (uint8_t*)[data bytes];
            cacheVideoFrame(88888, image.size.width, image.size.height, bytes);
            [image release];
            CVPixelBufferRelease(pixelBuffer);
            
//            NSLog(@"startPlaying3");
        }
    }
}

- (void)pauseNow {
    if (self.player && self.player.rate > 0.0) {
        [self.player pause];
        NSLog(@"⏸ Paused remote video playback");
    } else {
        NSLog(@"ℹ️ No video is playing, no need to pause");
    }
}


- (void)recreatePlayer {
    NSURL *videoURL = [(AVURLAsset *)self.playerItem.asset URL];
    self.playerItem = [AVPlayerItem playerItemWithURL:videoURL];
    self.player = [AVPlayer playerWithPlayerItem:self.playerItem];

    [self.playerItem addOutput:self.output];
    self.player.volume = 1.0;
    [self.player play];

    NSLog(@"✅ Player recreated and playback resumed");
}


- (void)resumeNow {
    if (!self.player || !self.player.currentItem) {
        NSLog(@"❌ Cannot resume — player or item is nil (was fully stopped)");
        return;
    }
    if (self.player && self.player.currentItem) {
        AVPlayerItemStatus status = self.player.currentItem.status;
        if (status == AVPlayerItemStatusReadyToPlay) {
            [self.player play];
            NSLog(@"▶️ Resumed remote video playback");
        } else if (status == AVPlayerItemStatusFailed) {
            NSLog(@"⚠️ AVPlayerItem failed, recreating player...");
            [self recreatePlayer];
        } else {
            NSLog(@"ℹ️ AVPlayerItem not ready, delaying retry...");
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [self resumeNow];
            });
        }
    }
}




@end

