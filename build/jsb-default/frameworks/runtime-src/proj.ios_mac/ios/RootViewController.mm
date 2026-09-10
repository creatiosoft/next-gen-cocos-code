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

#import "RootViewController.h"
#import "cocos2d.h"

#include "platform/CCApplication.h"
#include "platform/ios/CCEAGLView-ios.h"

#import <AgoraRtcKit/AgoraRtcKit.h>

#import "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "base/CCScheduler.h"
#include "base/CCThreadPool.h"
#include "platform/CCApplication.h"
#import <CoreImage/CoreImage.h>

#import "MediaUtils.h"
#include "jsb_agoraCreator.h"

#import "VideoFrameCapture.h"
#import "CameraFrameCapture.h"

#import <AVFoundation/AVFoundation.h>

#import "AWSUploadManager.h"
#import "LogFileManager.h"

//AgoraMediaFilterEventDelegate
@interface RootViewController () <AgoraRtcEngineDelegate, AgoraVideoFrameDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate>
@property (nonatomic, strong)AgoraRtcEngineKit *agoraKit;

@property (strong, nonatomic) AVCaptureSession *captureSession;
@property (strong, nonatomic) NSURL *videoURL;

@property (nonatomic, strong) VideoFrameCapture *videoFrameCapture;  // ✅ 从实现文件移到 extension 中（保持封装）
@property (nonatomic, strong) CameraFrameCapture *cameraFrameCapture;

//@property (strong, nonatomic) AVPlayer *audioPlayer;
@property (copy, nonatomic) void (^playbackFinishedHandler)(void);


@end

@implementation RootViewController {
    UIImagePickerController *_picker;
}

static NSString* JOINED_CHANNEL = @"";
NSInteger UID = 0;
bool JOINED = false;
bool isVideoEnabled = false;
bool isAudioEnabled = false;
NSMutableDictionary<NSNumber*, NSNumber*> *remoteVideoMuteStatus = [[NSMutableDictionary alloc] init];
NSMutableDictionary<NSNumber*, NSNumber*> *remoteSelfVideoMuteStatus = [[NSMutableDictionary alloc] init];
NSMutableDictionary<NSNumber*, NSNumber*> *remoteAudioMuteStatus = [[NSMutableDictionary alloc] init];
NSMutableDictionary<NSNumber*, NSNumber*> *remotePlayers = [[NSMutableDictionary alloc] init];

NSMutableDictionary<NSNumber*, NSNumber*> *remotePlayersVolumn = [[NSMutableDictionary alloc] init];

AVAudioRecorder *_audioRecorder;
NSURL *_audioURL;


+(NSInteger)getRemotePlayerVolumn:(NSInteger)uid {
    if ([remotePlayersVolumn objectForKey:@(uid)]) {
        NSNumber *volume = [remotePlayersVolumn objectForKey:@(uid)];
        NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  getRemotePlayerVolumn: %@", volume);
        return [volume integerValue];
    } else {
        NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  getRemotePlayerVolumn: 100");
        return 100;
    }
    
}

+(BOOL)isRemoteVideoMuted:(NSInteger)uid {
    if ([remotePlayers objectForKey:@(uid)] != nil) {
    }
    else {
        return YES;
    }
    NSNumber *mutedStatus = [remoteVideoMuteStatus objectForKey:@(uid)];
    BOOL mutedStatusBool = [mutedStatus boolValue];
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  isRemoteVideoMuted: %@", mutedStatus);
    if (mutedStatusBool) {
        return YES;
    }
    else {
        NSNumber *mutedSelfStatus = [remoteSelfVideoMuteStatus objectForKey:@(uid)];
        BOOL mutedSelfStatusBool = [mutedSelfStatus boolValue];
        if (mutedSelfStatusBool) {
            return YES;
        }
        else {
            return NO;
        }
    }
}

+(BOOL)isRemoteSelfVideoMuted:(NSInteger)uid {
    if ([remotePlayers objectForKey:@(uid)] != nil) {
    }
    else {
        return YES;
    }
    NSNumber *mutedStatus = [remoteSelfVideoMuteStatus objectForKey:@(uid)];
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  isRemoteSelfVideoMuted: %@", mutedStatus);
    if (mutedStatus == nil) {
        return NO;
    }
    else {
        return mutedStatus ? [mutedStatus boolValue] : NO;
    }
}

+ (BOOL)isRemoteAudioMuted:(NSInteger)uid {
    NSNumber *mutedStatus = [remoteAudioMuteStatus objectForKey:@(uid)];
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  isRemoteAudioMuted: %@", mutedStatus);
    return mutedStatus ? [mutedStatus boolValue] : NO;
}


+ (BOOL) muteRemoteAudioStream:(NSUInteger) uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  muteRemoteAudioStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    remoteAudioMuteStatus[@(uid)] = @(1);
    [topRootViewController.agoraKit muteRemoteAudioStream:uid mute:YES];
    return YES;
}

+ (BOOL) unmuteRemoteAudioStream:(NSUInteger) uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  unmuteRemoteAudioStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    remoteAudioMuteStatus[@(uid)] = @(0);
    [topRootViewController.agoraKit muteRemoteAudioStream:uid mute:NO];
    return YES;
}

+ (BOOL) muteRemoteVideoStream:(NSUInteger) uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  muteRemoteVideoStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    remoteVideoMuteStatus[@(uid)] = @(1);
    [topRootViewController.agoraKit muteRemoteVideoStream:uid mute:YES];
    return YES;
}

+ (BOOL) unmuteRemoteVideoStream:(NSUInteger) uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  unmuteRemoteVideoStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    remoteVideoMuteStatus[@(uid)] = @(0);
    [topRootViewController.agoraKit muteRemoteVideoStream:uid mute:NO];
    return YES;
}

+ (BOOL) isRemoteJoined:(NSUInteger) uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  isRemoteJoined: %@", [remotePlayers objectForKey:@(uid)]);
    return ([remotePlayers objectForKey:@(uid)] != nil);
}

+ (BOOL) isJoined {
    return JOINED;
}

+ (BOOL) isJoinedChannel:(NSString *)channel
{
    return [channel isEqualToString:JOINED_CHANNEL];
}

// Implement loadView to create a view hierarchy programmatically, without using a nib.
- (void)loadView {
    // Set EAGLView as view of RootViewController
    self.view = (__bridge CCEAGLView *)cocos2d::Application::getInstance()->getView();
}

+ (BOOL)isVideoCurrentlyEnabled:(NSString *)channel {
    if (![channel isEqualToString:JOINED_CHANNEL]) {
        return NO;
    }
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  isVideoCurrentlyEnabled: %d", isVideoEnabled);
    return isVideoEnabled;
}

+ (BOOL)isAudioCurrentlyEnabled:(NSString *)channel {
    if (![channel isEqualToString:JOINED_CHANNEL]) {
        return NO;
    }
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  isAudioCurrentlyEnabled: %d", isAudioEnabled);
    return isAudioEnabled;
}

// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void)viewDidLoad {
    [super viewDidLoad];
    AgoraRtcEngineConfig *config = [[AgoraRtcEngineConfig alloc] init];
    config.appId = @"d19330a189e441b7b5bdf29ffb35b6d4";
    config.channelProfile = AgoraChannelProfileLiveBroadcasting;
    self.agoraKit = [AgoraRtcEngineKit sharedEngineWithConfig:config delegate:self];
    
}

// 监听用户点击完成按钮的事件

+ (BOOL)JavaCopy:(NSString *)str {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = str;
    return YES;
}

+(BOOL)muteLocalAudioStream {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  muteLocalAudioStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    [topRootViewController.agoraKit muteLocalAudioStream:YES];
    isAudioEnabled = false;
    return YES;
}

+(BOOL)unmuteLocalAudioStream {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  unmuteLocalAudioStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    [topRootViewController.agoraKit muteLocalAudioStream:NO];
    isAudioEnabled = true;
    return YES;
}
+(BOOL)muteLocalVideoStream {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  muteLocalVideoStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    [topRootViewController.agoraKit muteLocalVideoStream:YES];
    isVideoEnabled = false;
    return YES;
}

+(BOOL)unmuteLocalVideoStream {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  unmuteLocalVideoStream");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    [topRootViewController.agoraKit muteLocalVideoStream:NO];
    isVideoEnabled = true;
    return YES;
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    
    [self.agoraKit disableAudio];
    [self.agoraKit disableVideo];
    [self.agoraKit stopPreview];
    [self.agoraKit leaveChannel:nil];
    [AgoraRtcEngineKit destroy];
}

// MARK: - AgoraVideoFrameDelegate
- (BOOL)onCaptureVideoFrame:(AgoraOutputVideoFrame *)videoFrame sourceType:(AgoraVideoSourceType)sourceType {
    UIImage *image = [MediaUtils pixelBufferToImage:videoFrame.pixelBuffer];
    if (!image || !image.CGImage) return YES; // 加强容错
    CGDataProviderRef provider = CGImageGetDataProvider(image.CGImage);
    NSData* data = (id)CFBridgingRelease(CGDataProviderCopyData(provider));
    uint8_t *bytes = (uint8_t*)[data bytes];
    cacheVideoFrame((int)UID, image.size.width, image.size.height, bytes);
    [image release];
    return YES;
}


- (BOOL)onRenderVideoFrame:(AgoraOutputVideoFrame *)videoFrame uid:(NSUInteger)uid channelId:(NSString *)channelId {
    UIImage *image = [MediaUtils pixelBufferToImage:videoFrame.pixelBuffer];    
    CGDataProviderRef provider = CGImageGetDataProvider(image.CGImage);
    NSData* data = (id)CFBridgingRelease(CGDataProviderCopyData(provider));
    uint8_t *bytes = (uint8_t*)[data bytes];
    cacheVideoFrame((int)uid, image.size.width, image.size.height, bytes);
    [image release];
    return YES;
}

- (AgoraVideoFormat)getVideoFormatPreference {
    return AgoraVideoFormatCVPixelBGRA;
}

- (void)rtcEngine:(AgoraRtcEngineKit *)engine didOccurError:(AgoraErrorCode)errorCode {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  didOccurError: %@", [NSString stringWithFormat:@"Error %ld occur",errorCode]);
}

- (void)rtcEngine:(AgoraRtcEngineKit *)engine didJoinChannel:(NSString *)channel withUid:(NSUInteger)uid elapsed:(NSInteger)elapsed {
    
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  didJoinChannel: %lu", uid);
    
    UID = uid;
    
    NSString *nsuid = [NSString stringWithFormat:@"%ld", uid];
    NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"doLogin\", \"%@\", \"%@\");", nsuid, JOINED_CHANNEL];
    const char *script_= [script UTF8String];
    NSLog(@"%@", script);
    se::ScriptEngine::getInstance()->evalString(script_);
}

- (void)rtcEngine:(AgoraRtcEngineKit *)engine didLeaveChannelWithStats:(AgoraChannelStats * _Nonnull)stats
{
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  didLeaveChannelWithStats");
    
    NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"doLogout\", \"%@\", \"%@\");", @"0", JOINED_CHANNEL];
    const char *script_= [script UTF8String];
    NSLog(@"%@", script);
    se::ScriptEngine::getInstance()->evalString(script_);
    
    JOINED_CHANNEL = @"";
}


/// callback when a remote user is joinning the channel, note audience in live broadcast mode will NOT trigger this event
/// @param uid uid of remote joined user
/// @param elapsed time elapse since current sdk instance join the channel in ms
- (void)rtcEngine:(AgoraRtcEngineKit *)engine didJoinedOfUid:(NSUInteger)uid elapsed:(NSInteger)elapsed {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  didJoinedOfUid: %lu", uid);
    remotePlayers[@(uid)] = @(1);
    
    remoteAudioMuteStatus[@(uid)] = @(0);
    remoteVideoMuteStatus[@(uid)] = @(0);
    
    remoteSelfVideoMuteStatus[@(uid)] = @(0);
    
    NSString *nsuid = [NSString stringWithFormat:@"%ld", uid];
    NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onUserVideoOn\", \"%@\", \"%@\");", nsuid, JOINED_CHANNEL];
    const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
    NSLog(@"%@", script);
    se::ScriptEngine::getInstance()->evalString(script_);
}

/// callback when a remote user is leaving the channel, note audience in live broadcast mode will NOT trigger this event
/// @param uid uid of remote joined user
/// @param reason reason why this user left, note this event may be triggered when the remote user
/// become an audience in live broadcasting profile
- (void)rtcEngine:(AgoraRtcEngineKit *)engine didOfflineOfUid:(NSUInteger)uid reason:(AgoraUserOfflineReason)reason {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  didOfflineOfUid: %lu", uid);

    NSString *nsuid = [NSString stringWithFormat:@"%ld", uid];
    NSLog(@"%@", nsuid);
    NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onUserOffline\", \"%@\", \"%@\");", nsuid, JOINED_CHANNEL];
    const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
    NSLog(@"%@", script);
    se::ScriptEngine::getInstance()->evalString(script_);
    
    [remoteAudioMuteStatus removeObjectForKey:@(uid)];
    [remoteVideoMuteStatus removeObjectForKey:@(uid)];
    [remoteSelfVideoMuteStatus removeObjectForKey:@(uid)];
    [remotePlayers removeObjectForKey:@(uid)];
    [remotePlayersVolumn removeObjectForKey:@(uid)];
}

- (void)rtcEngine:(AgoraRtcEngineKit *)engine didVideoMuted:(BOOL)muted byUid:(NSUInteger)uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  didVideoMuted: %lu, %d", uid, muted);
    
    NSString *nsuid = [NSString stringWithFormat:@"%ld", uid];
    NSLog(@"%@", nsuid);
    
    if (muted) {
        remoteSelfVideoMuteStatus[@(uid)] = @(1);
        
        NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onUserVideoOff\", \"%@\", \"%@\");", nsuid, JOINED_CHANNEL];
        const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
        NSLog(@"%@", script);
        se::ScriptEngine::getInstance()->evalString(script_);
    }
    else {
        [remoteSelfVideoMuteStatus removeObjectForKey:@(uid)];
        
        if ([RootViewController isRemoteVideoMuted:uid]) {
            return;
        }
        NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onUserVideoOn\", \"%@\", \"%@\");", nsuid, JOINED_CHANNEL];
        const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
        NSLog(@"%@", script);
        se::ScriptEngine::getInstance()->evalString(script_);
    }
}

// For ios6, use supportedInterfaceOrientations & shouldAutorotate instead
#ifdef __IPHONE_6_0
- (NSUInteger) supportedInterfaceOrientations{
    return UIInterfaceOrientationMaskAll;
}
#endif

- (BOOL) shouldAutorotate {
    return YES;
}

//fix not hide status on ios7
- (BOOL)prefersStatusBarHidden {
    return NO;
}

// Controls the application's preferred home indicator auto-hiding when this view controller is shown.
- (BOOL)prefersHomeIndicatorAutoHidden {
    return YES;
}

- (void)didReceiveMemoryWarning {
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];

    // Release any cached data, images, etc that aren't in use.
}

+(BOOL)initEngine:(NSString *) appId {
    return YES;
}

+(BOOL)leaveChannel:(NSString *) channel token:(NSString *)token {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  leaveChannel");
    
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    
    [topRootViewController.agoraKit disableAudio];
    [topRootViewController.agoraKit disableVideo];
    [topRootViewController.agoraKit stopPreview];
    [topRootViewController.agoraKit leaveChannel:nil];
    JOINED = false;
//    JOINED_CHANNEL = @"";
    isAudioEnabled = false;
    isVideoEnabled = false;
    [remotePlayers removeAllObjects];
    [remoteAudioMuteStatus removeAllObjects];
    [remoteVideoMuteStatus removeAllObjects];
    [remoteSelfVideoMuteStatus removeAllObjects];
    
//    [topRootViewController stopPlayAudio];
//    [topRootViewController.videoFrameCapture stopPlayingForce];
    
    return YES;
}

+(BOOL)joinChannel:(NSString *) appId channnel:(NSString *) channel token:(NSString *)token uid:(NSString *)uid {
    NSLog(@">>>>>>>>>> [AGORA] >>>>>>>>>>  joinChannel");
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    if (JOINED) {
//        if (channel != JOINED_CHANNEL) {
//            [RootViewController leaveChannel:JOINED_CHANNEL token:token];
//            return YES;
//        }
        
        if (isVideoEnabled) {
//            [topRootViewController.agoraKit disableAudio];
//            [topRootViewController.agoraKit disableVideo];
            [topRootViewController.agoraKit muteLocalAudioStream:YES];
            [topRootViewController.agoraKit muteLocalVideoStream:YES];
            isAudioEnabled = false;
            isVideoEnabled = false;
        }
        else {
//            [topRootViewController.agoraKit enableAudio];
//            [topRootViewController.agoraKit enableVideo];
            [topRootViewController.agoraKit muteLocalAudioStream:NO];
            [topRootViewController.agoraKit muteLocalVideoStream:NO];
            isAudioEnabled = true;
            isVideoEnabled = true;
        }
    }
    else {
        NSString *channelName = channel;
        
        JOINED_CHANNEL = [channel copy];
        
        [topRootViewController.agoraKit setClientRole:(AgoraClientRoleBroadcaster)];
               // enable video module and set up video encoding configs
        [topRootViewController.agoraKit enableAudio];
        [topRootViewController.agoraKit enableVideo];
        [topRootViewController.agoraKit setEnableSpeakerphone:YES];
        [topRootViewController.agoraKit setVideoFrameDelegate:topRootViewController];
        AgoraVideoEncoderConfiguration *encoderConfig = [[AgoraVideoEncoderConfiguration alloc] initWithSize:CGSizeMake(300, 300)
                                                                                                       frameRate:(AgoraVideoFrameRateFps15)
                                                                                                         bitrate:15
                                                                                                 orientationMode:(AgoraVideoOutputOrientationModeFixedPortrait)
                                                                                                      mirrorMode:(AgoraVideoMirrorModeAuto)];
        [topRootViewController.agoraKit setVideoEncoderConfiguration:encoderConfig];
        [topRootViewController.agoraKit setParameters:@"{\"che.audio.mix_with_others\":true}"];
        [topRootViewController.agoraKit setParameters:@"{\"che.audio.keep.audiosession\":true}"];
            
            
        AgoraRtcVideoCanvas *videoCanvas = [[AgoraRtcVideoCanvas alloc] init];
        videoCanvas.uid = 1;
        videoCanvas.renderMode = AgoraVideoRenderModeHidden;
        [topRootViewController.agoraKit setupLocalVideo:videoCanvas];

        AgoraRtcChannelMediaOptions *options = [[AgoraRtcChannelMediaOptions alloc] init];
        options.autoSubscribeAudio = YES;
        options.autoSubscribeVideo = YES;
        options.publishMicrophoneTrack = YES;
        options.publishCameraTrack = YES;
        options.clientRoleType = AgoraClientRoleBroadcaster;
        
        int result = [topRootViewController.agoraKit joinChannelByToken:token channelId:channelName uid:[uid intValue] mediaOptions:options joinSuccess:nil];
        if (result != 0) {
            // Usually happens with invalid parameters
            // Error code description can be found at:
            // en: https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agoraerrorcode
            // cn: https://doc.shengwang.cn/api-ref/rtc/ios/error-code
            NSLog(@"joinChannel call failed: %d, please check your params", result);
            return YES;
        }
        
        [topRootViewController.agoraKit startPreview];
        
        isVideoEnabled = true;
        isAudioEnabled = true;
        
        JOINED = true;
    }
    
    return YES;
}


- (void)onVideoFrame:(CVPixelBufferRef)buffer size:(CGSize)size trackId:(NSUInteger)trackId rotation:(int)rotation {
}

+ (UIImage *)generateQRCodeFromURL:(NSString *)urlString {
    NSData *urlData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    CIFilter *filter = [CIFilter filterWithName:@"CIQRCodeGenerator"];
    [filter setValue:urlData forKey:@"inputMessage"];
    [filter setValue:@"H" forKey:@"inputCorrectionLevel"];
    
    CIImage *outputImage = filter.outputImage;
    CIContext *context = [CIContext contextWithOptions:nil];
    CGImageRef cgImage = [context createCGImage:outputImage fromRect:outputImage.extent];
    UIImage *qrCodeImage = [UIImage imageWithCGImage:cgImage];
    CGImageRelease(cgImage);
    
    return qrCodeImage;
}

+ (BOOL)shareQR:(NSString *)urlString {
    NSArray *itemsToShare = @[urlString, [RootViewController generateQRCodeFromURL:urlString]];
    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:itemsToShare applicationActivities:nil];
    
    // 排除不支持的分享方式
    NSArray *excludedActivities = @[
        UIActivityTypePostToWeibo,
        UIActivityTypePrint,
        UIActivityTypeAssignToContact,
        UIActivityTypeSaveToCameraRoll,
        UIActivityTypeAddToReadingList,
        UIActivityTypePostToFlickr,
        UIActivityTypePostToVimeo,
        UIActivityTypePostToTencentWeibo
    ];
    activityVC.excludedActivityTypes = excludedActivities;
    
    // 在当前视图控制器中展示分享弹框
    auto rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
//    UIViewController *viewController = rootViewController.viewController; // 假设你有一个指向当前视图控制器的引用
    [rootViewController presentViewController:activityVC animated:YES completion:nil];
    
    return YES;
}

- (NSURL *)getDocumentsDirectory {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    return [NSURL fileURLWithPath:[paths firstObject]];
}

//
+ (void)pickImageFromGallery {
    RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
    if (rootVC) {
        [rootVC _presentImagePickerController];
    }
}

- (void)_presentImagePickerController {
    _picker = [[UIImagePickerController alloc] init];
    _picker.delegate = self;
    _picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    [self presentViewController:_picker animated:YES completion:nil];
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary<UIImagePickerControllerInfoKey,id> *)info {
    UIImage *image = info[UIImagePickerControllerOriginalImage];
    NSData *imageData = UIImagePNGRepresentation(image);
    NSString *base64String = [imageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
    base64String = [base64String stringByReplacingOccurrencesOfString:@"\n" withString:@""];
    base64String = [base64String stringByReplacingOccurrencesOfString:@"\r" withString:@""];

    if (imageData.length > 5 * 1024 * 1024) {
        NSString *script = [NSString stringWithFormat:@"onImageSelected(\"%@\");", @""];
        const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
        se::ScriptEngine::getInstance()->evalString(script_);
    }
    else {
        NSString *script = [NSString stringWithFormat:@"onImageSelected(\"%@\");", base64String];
        const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
        se::ScriptEngine::getInstance()->evalString(script_);
    }
    
    [picker dismissViewControllerAnimated:YES completion:nil];
}

+ (void)adjustVolumeForUser:(NSUInteger)uid volume:(float)volume {
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    
    if (uid == UID) {
        int result = [topRootViewController.agoraKit adjustRecordingSignalVolume:volume];
//        NSLog(@"adjustRecordingSignalVolume %d", result);
    }
    else {
        int result = [topRootViewController.agoraKit adjustUserPlaybackSignalVolume:uid volume:volume];
//        NSLog(@"adjustUserPlaybackSignalVolume %d", result);
    }
    remotePlayersVolumn[@(uid)] = @(volume);
}


+ (BOOL) startPlayVideoWithCustomRender:(NSString *)url isMute:(BOOL)isMute
{
    NSURL *videoURL = [NSURL URLWithString:url];
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    topRootViewController.videoFrameCapture = [[VideoFrameCapture alloc] initWithURL:videoURL];
    [topRootViewController.videoFrameCapture startPlaying:isMute];
    return YES;
}

+ (BOOL) updatePlayVideo:(BOOL)isMute
{
    RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
    if (isMute) {
        [rootVC.videoFrameCapture muteNow];
    }
    else {
        [rootVC.videoFrameCapture unmuteNow];
    }
    return YES;
}

+ (BOOL) stopPlayAudioNow
{
    RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
    [rootVC stopPlayAudio];
    return YES;
}

+ (BOOL) startCameraCapture
{
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    topRootViewController.cameraFrameCapture = [[CameraFrameCapture alloc] init];
    [topRootViewController.cameraFrameCapture startCapture];
    return YES;
}

+ (BOOL) stopCameraCapture
{
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    [topRootViewController.cameraFrameCapture stopCapture];
    return YES;
}

- (void)pauseAgoraAudioBeforeRecording {
    NSLog(@"📴 暂停 Agora 音频");
    [self.agoraKit muteLocalAudioStream:YES];
//    [self.agoraKit muteAllRemoteAudioStreams:YES];
}

- (void)resumeAgoraAudioAfterRecording {
    NSLog(@"📢 恢复 Agora 音频");
    if (isAudioEnabled) {
        [self.agoraKit muteLocalAudioStream:NO];
    }
    else {
        [self.agoraKit muteLocalAudioStream:YES];
    }
//    [self.agoraKit muteAllRemoteAudioStreams:NO];
    
    // 确保音频会话恢复为Agora需要的配置
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord
                   mode:AVAudioSessionModeVoiceChat
                options:AVAudioSessionCategoryOptionMixWithOthers
                  error:nil];
    [session setActive:YES error:nil];
}

+ (BOOL)sendLog
{
    RootViewController *topRootViewController = (RootViewController *)[[UIApplication sharedApplication] keyWindow].rootViewController;
    [LogFileManager.sharedInstance exportLogFileViaEmailFromViewController:topRootViewController];
    return YES;
}

@end
    
