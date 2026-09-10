/****************************************************************************
 Copyright (c) 2013      cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

#import <AVFoundation/AVFoundation.h>
#import <AVKit/AVKit.h>


@class VideoFrameCapture;

@interface RootViewController : UIViewController {

}

@property (nonatomic, strong, readonly) VideoFrameCapture *videoFrameCapture;

- (BOOL)prefersStatusBarHidden;
- (void)onVideoFrame:(CVPixelBufferRef)buffer size:(CGSize)size trackId:(NSUInteger)trackId rotation:(int)rotation;

+(BOOL)initEngine:(NSString *) appId;
+(BOOL)joinChannel:(NSString *) appId channnel:(NSString *) channnel token:(NSString *)token uid:(NSString *)uid;
+(BOOL)joinChannelWithVideo:(NSString *) appId channnel:(NSString *) channnel token:(NSString *)token uid:(NSString *)uid;
+(BOOL)joinChannelWithAudio:(NSString *) appId channnel:(NSString *) channnel token:(NSString *)token uid:(NSString *)uid;
+(BOOL)leaveChannel:(NSString *) channel token:(NSString *)token;

+ (BOOL)isVideoCurrentlyEnabled:(NSString *)channel;
+ (BOOL)isAudioCurrentlyEnabled:(NSString *)channel;

+(BOOL)muteLocalAudioStream;
+(BOOL)unmuteLocalAudioStream;

+(BOOL)muteLocalVideoStream;
+(BOOL)unmuteLocalVideoStream;
+(BOOL)shareQR:(NSString *)urlString;
    
+(BOOL)isRemoteVideoMuted:(NSInteger)uid;
+(BOOL)isRemoteAudioMuted:(NSInteger)uid;
+(BOOL)isRemoteSelfVideoMuted:(NSInteger)uid;

+ (BOOL) muteRemoteAudioStream:(NSUInteger) uid;
+ (BOOL) unmuteRemoteAudioStream:(NSUInteger) uid;
+ (BOOL) muteRemoteVideoStream:(NSUInteger) uid;
+ (BOOL) unmuteRemoteVideoStream:(NSUInteger) uid;
+ (BOOL) isJoined;
+ (BOOL) isJoinedChannel:(NSString *)channel;
+ (BOOL) isRemoteJoined:(NSUInteger) uid;

+ (BOOL)JavaCopy:(NSString *)str;

+ (void) adjustVolumeForUser:(NSUInteger)uid volume:(float)volume;

+ (BOOL) updatePlayAudio:(BOOL)isMute;
+ (BOOL) updatePlayVideo:(BOOL)isMute;

+ (BOOL) startCameraCapture;
+ (BOOL) stopCameraCapture;

- (void)pauseAgoraAudioBeforeRecording;
- (void)resumeAgoraAudioAfterRecording;


+(NSInteger)getRemotePlayerVolumn:(NSInteger)uid;

+ (BOOL)sendLog;

@end
