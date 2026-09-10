#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import "cocos2d.h"

@interface CameraFrameCapture : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate, AVCaptureFileOutputRecordingDelegate>

@property (strong, nonatomic) AVCaptureSession *captureSession;
@property (strong, nonatomic) AVCaptureVideoDataOutput *videoOutput;
@property (assign, nonatomic) BOOL isSetupComplete;
@property (assign, nonatomic) BOOL isUsingFrontCamera;
@property (nonatomic, assign, readonly) BOOL isRecording;

@property (assign, nonatomic) BOOL isPopupShowing;

@property (nonatomic, strong) CIContext *ciContext;
@property (nonatomic) CGColorSpaceRef colorSpace;

@property (strong, nonatomic) AVCaptureMovieFileOutput *movieFileOutput;
@property (strong, nonatomic) NSURL *videoURL;

@property (nonatomic, strong) AVCaptureSession *recordingSession;
@property (nonatomic, strong) AVCaptureDeviceInput *recordingVideoInput;

+ (instancetype)sharedInstance; // 单例访问方法

- (void)startCapture;
- (void)stopCapture;
- (void)checkCameraPermission;
- (void)switchCamera;

+ (BOOL) videoRecordStart;
+ (BOOL) videoRecordStop;

@end
