#import "CameraFrameCapture.h"
#import <Accelerate/Accelerate.h>
#import "MediaUtils.h"
#include "jsb_agoraCreator.h"
#import "RootViewController.h"
#import "LogFileManager.h"


@implementation CameraFrameCapture {
    dispatch_queue_t _captureQueue;
}

+ (instancetype)sharedInstance {
    static CameraFrameCapture *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[CameraFrameCapture alloc] init];
    });
    return instance;
}

// 在初始化时添加版本检测
- (instancetype)init {
    self = [super init];
    if (self) {
        _captureSession = [[AVCaptureSession alloc] init];
        _captureQueue = dispatch_queue_create("com.poker.capturequeue", DISPATCH_QUEUE_SERIAL);
        
        // 设置全局音频策略（兼容iOS 16+）
        if (@available(iOS 16.0, *)) {
            [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord
                                                   mode:AVAudioSessionModeDefault
                                                options:AVAudioSessionCategoryOptionMixWithOthers
                                                  error:nil];
        }
        
        [self setupCaptureSession];
    }
    return self;
}

- (void)dealloc {
    [super dealloc];
    if (_colorSpace) {
        CGColorSpaceRelease(_colorSpace);
    }
}

- (void)setupCaptureSession {
    [LogFileManager.sharedInstance logMessage:@"setupCaptureSession"];
    if (_isSetupComplete) return;
    
    NSError *error = nil;
    
    // 1. 配置视频输入（前置摄像头）
    AVCaptureDevice *videoDevice = [self cameraWithPosition:AVCaptureDevicePositionFront];
    AVCaptureDeviceInput *videoInput = [AVCaptureDeviceInput deviceInputWithDevice:videoDevice error:&error];
    if (error) {
        NSLog(@"Failed to initialize video input device: %@", error.localizedDescription);
        [LogFileManager.sharedInstance logMessage:@"Failed to initialize video input device:"];
        [LogFileManager.sharedInstance logMessage:error.localizedDescription];
        return;
    }
    
    // 2. 配置音频输入（麦克风）
    AVCaptureDevice *audioDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeAudio];
    AVCaptureDeviceInput *audioInput = [AVCaptureDeviceInput deviceInputWithDevice:audioDevice error:&error];
    if (error) {
        NSLog(@"Failed to initialize audio input device: %@", error.localizedDescription);
        [LogFileManager.sharedInstance logMessage:@"Failed to initialize audio input device:"];
        [LogFileManager.sharedInstance logMessage:error.localizedDescription];
    }
    
    // 3. 开始配置会话
    [_captureSession beginConfiguration];
    
    // 4. 添加视频输入
    if ([_captureSession canAddInput:videoInput]) {
        [_captureSession addInput:videoInput];
    } else {
        NSLog(@"Unable to add video input device");
        [_captureSession commitConfiguration];
        [LogFileManager.sharedInstance logMessage:@"Unable to add video input device"];
        return;
    }
    
    // 5. 添加音频输入（如果可用）
    if (audioInput && [_captureSession canAddInput:audioInput]) {
        [_captureSession addInput:audioInput];
        NSLog(@"Audio input device added");
        [LogFileManager.sharedInstance logMessage:@"Audio input device added"];
    } else {
        NSLog(@"Unable to add audio input device");
        [LogFileManager.sharedInstance logMessage:@"Unable to add audio input device"];
    }
    
    // 6. 配置视频输出
    _videoOutput = [[AVCaptureVideoDataOutput alloc] init];
    _videoOutput.videoSettings = @{
        (__bridge NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
//        (__bridge NSString *)kCVPixelBufferOpenGLESCompatibilityKey: @YES
    };
    [_videoOutput setSampleBufferDelegate:self queue:_captureQueue];
    
    if ([_captureSession canAddOutput:_videoOutput]) {
        [_captureSession addOutput:_videoOutput];
    }
    
    // 7. 配置音频+视频录制输出
    self.movieFileOutput = [[AVCaptureMovieFileOutput alloc] init];
    if ([_captureSession canAddOutput:self.movieFileOutput]) {
        [_captureSession addOutput:self.movieFileOutput];
        NSLog(@"movieFileOutput added (supports audio and video recording)");
        [LogFileManager.sharedInstance logMessage:@"movieFileOutput added (supports audio and video recording)"];
    } else {
        NSLog(@"Unable to add movieFileOutput");
        [LogFileManager.sharedInstance logMessage:@"Unable to add movieFileOutput"];
    }
    
    // 8. 设置视频方向（竖屏）
    AVCaptureConnection *videoConnection = [_videoOutput connectionWithMediaType:AVMediaTypeVideo];
    if ([videoConnection isVideoOrientationSupported]) {
        [videoConnection setVideoOrientation:AVCaptureVideoOrientationPortrait];
    }
    
    // 9. 前置摄像头镜像处理
    if (_isUsingFrontCamera && [videoConnection isVideoMirroringSupported]) {
        [videoConnection setVideoMirrored:YES];
    }
    
    // 10. 设置合适的录制质量
    _captureSession.sessionPreset = AVCaptureSessionPresetLow;
    
    [_captureSession commitConfiguration];
    _isSetupComplete = YES;
    
    NSLog(@"CaptureSession configuration complete (video + audio)");
    [LogFileManager.sharedInstance logMessage:@"CaptureSession configuration complete (video + audio)"];
}

- (AVCaptureDevice *)cameraWithPosition:(AVCaptureDevicePosition)position {
    NSArray *devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
    for (AVCaptureDevice *device in devices) {
        if (device.position == position) {
            return device;
        }
    }
    return [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
}

- (void)captureOutput:(AVCaptureOutput *)output
didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
       fromConnection:(AVCaptureConnection *)connection {
    @autoreleasepool {
        CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
        if (!pixelBuffer) return;
        
        CVPixelBufferLockBaseAddress(pixelBuffer, kCVPixelBufferLock_ReadOnly);
        
        // 直接访问像素数据
        void *baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer);
        size_t width = CVPixelBufferGetWidth(pixelBuffer);
        size_t height = CVPixelBufferGetHeight(pixelBuffer);
        size_t bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer);
        
        if (baseAddress) {
            // 计算实际需要的数据大小（去掉padding）
            size_t bufferSize = width * height * 4;
            uint8_t *copiedBytes = (uint8_t *)malloc(bufferSize);
            
            if (copiedBytes) {
                // 逐行拷贝，跳过可能的padding
                for (size_t row = 0; row < height; row++) {
                    memcpy(copiedBytes + row * width * 4,
                           (uint8_t *)baseAddress + row * bytesPerRow,
                           width * 4);
                }
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    cacheVideoFrame(99999, (int)width, (int)height, copiedBytes);
                    free(copiedBytes);
                });
            }
        }
        
        CVPixelBufferUnlockBaseAddress(pixelBuffer, kCVPixelBufferLock_ReadOnly);
    }
}

//- (void)startCapture {
//    dispatch_async(_captureQueue, ^{
//        if (!self->_captureSession.isRunning) {
//            if (!self->_isSetupComplete) {
//                [self setupCaptureSession];
//            }
//            [self->_captureSession startRunning];
//        }
//    });
//}

// 检查是否会影响播放（可选）
- (BOOL)willInterruptPlayback {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    return session.otherAudioPlaying &&
           ![_captureSession.outputs containsObject:self.movieFileOutput]; // 非录制状态
}

//- (void)startCapture {
//    dispatch_async(_captureQueue, ^{
//        if (!self->_isSetupComplete) {
//            [self setupCaptureSession];
//        }
//
//        if (!self->_captureSession.isRunning) {
//            // 新增：保护正在播放的音频会话
//            AVAudioSession *session = [AVAudioSession sharedInstance];
//            BOOL otherAudioPlaying = session.otherAudioPlaying;
//
//            if (otherAudioPlaying) {
//                NSLog(@"🔇 Detected other audio is playing, using mix mode");
//                [session setCategory:AVAudioSessionCategoryPlayAndRecord
//                               mode:AVAudioSessionModeDefault
//                            options:AVAudioSessionCategoryOptionMixWithOthers
//                              error:nil];
//            }
//
//            [self->_captureSession startRunning];
//
//            if (otherAudioPlaying) {
//                // 延迟恢复默认配置
//                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//                    [session setCategory:AVAudioSessionCategoryPlayAndRecord
//                                   mode:AVAudioSessionModeVideoRecording
//                                options:0
//                                  error:nil];
//                });
//            }
//        }
//    });
//}

//- (void)startCapture {
//    dispatch_async(_captureQueue, ^{
//        if (!self->_isSetupComplete) {
//            [self setupCaptureSession];
//        }
//
//        if (!self->_captureSession.isRunning) {
//            // iOS 16/18+ 兼容方案
//            if (@available(iOS 16.0, *)) {
//                // 步骤1：保存当前音频会话状态
//                AVAudioSession *session = [AVAudioSession sharedInstance];
//                NSString *originalCategory = session.category;
//                AVAudioSessionMode originalMode = session.mode;
//
//                // 步骤2：临时切换为不会中断的配置
//                [session setCategory:AVAudioSessionCategoryPlayAndRecord
//                               mode:AVAudioSessionModeDefault
//                            options:AVAudioSessionCategoryOptionMixWithOthers |
//                                    AVAudioSessionCategoryOptionAllowBluetooth
//                              error:nil];
//
//                // 步骤3：启动摄像头
//                [self->_captureSession startRunning];
//
//                // 步骤4：延迟恢复原始配置（500ms足够摄像头启动）
//                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//                    [session setCategory:originalCategory
//                                   mode:originalMode
//                                options:AVAudioSessionCategoryOptionMixWithOthers
//                                  error:nil];
//                });
//            } else {
//                // iOS 15及以下保持原逻辑
//                [self->_captureSession startRunning];
//            }
//        }
//    });
//}

//- (void)startCapture {
//    dispatch_async(_captureQueue, ^{
//        if (!self->_isSetupComplete) {
//            [self setupCaptureSession];
//        }
//
//        if (!self->_captureSession.isRunning) {
//            // 关键修改：使用支持混合的音频会话配置
//            AVAudioSession *session = [AVAudioSession sharedInstance];
//            [session setCategory:AVAudioSessionCategoryPlayAndRecord
//                           mode:AVAudioSessionModeVideoRecording
//                        options:AVAudioSessionCategoryOptionMixWithOthers |
//                                AVAudioSessionCategoryOptionAllowBluetooth
//                          error:nil];
//
//            [self->_captureSession startRunning];
//        }
//    });
//}

//- (void)startCapture {
//    dispatch_async(_captureQueue, ^{
//        if (!self->_isSetupComplete) {
//            [self setupCaptureSession];
//        }
//
//        if (!self->_captureSession.isRunning) {
//            AVAudioSession *session = [AVAudioSession sharedInstance];
//            NSString *originalCategory = session.category;
//            AVAudioSessionMode originalMode = session.mode;
//            AVAudioSessionCategoryOptions originalOptions = session.categoryOptions;
//
//            // iOS 17/18 兼容逻辑：先设置非打断性配置
//            if (@available(iOS 17.0, *)) {
//                [session setCategory:AVAudioSessionCategoryPlayAndRecord
//                               mode:AVAudioSessionModeVideoRecording
//                            options:AVAudioSessionCategoryOptionMixWithOthers | AVAudioSessionCategoryOptionAllowBluetooth
//                              error:nil];
//            }
//
//            // 启动 capture session
//            [self->_captureSession startRunning];
//
//            // 延迟恢复原始播放配置（防止打断 VideoFrameCapture）
//            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//                if (@available(iOS 17.0, *)) {
//                    [session setCategory:originalCategory
//                                   mode:originalMode
//                                options:originalOptions
//                                  error:nil];
//                }
//            });
//        }
//    });
//}

- (void)startCapture {
    NSLog(@"startCapture");
    self.isPopupShowing = YES;
    [LogFileManager.sharedInstance logMessage:@"startCapture"];
    dispatch_async(_captureQueue, ^{
        if (!self->_isSetupComplete) {
            [self setupCaptureSession];
        }

        if (!self->_captureSession.isRunning) {
            [self rebuildSessionIfNeeded]; // ✅ 修复 session 死锁
            
            dispatch_async(dispatch_get_main_queue(), ^{
                RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
                if ([rootVC respondsToSelector:@selector(videoFrameCapture)] && rootVC.videoFrameCapture) {
                    [rootVC.videoFrameCapture pauseNow];
                    NSLog(@"⏸ Paused remote video playback");
                    
                    [LogFileManager.sharedInstance logMessage:@"Paused remote video playback"];
                }
            });

            // 启动会话（略）
            dispatch_async(dispatch_get_main_queue(), ^{
                AVAudioSession *session = [AVAudioSession sharedInstance];
                NSError *error = nil;
                [session setCategory:AVAudioSessionCategoryPlayAndRecord
                              mode:AVAudioSessionModeVideoRecording
                           options:AVAudioSessionCategoryOptionMixWithOthers
                             error:&error];
                [session setActive:YES error:&error];
            });
            
            [LogFileManager.sharedInstance logMessage:@"startRunning"];
            [self->_captureSession startRunning];
        }
    });
}





//- (void)stopCapture {
//    dispatch_async(_captureQueue, ^{
//        if (self->_captureSession.isRunning) {
//            [self->_captureSession stopRunning];
//        }
//    });
//}
- (BOOL)isRecording {
//    return self.movieFileOutput.isRecording;
//    return self->_captureSession.isRunning;
    return self.isPopupShowing;
}

- (void)stopCapture {
    NSLog(@"stopCapture");
    self.isPopupShowing = NO;
    [LogFileManager.sharedInstance logMessage:@"stopCapture"];
    dispatch_async(_captureQueue, ^{
        if (self->_captureSession.isRunning) {
            [self->_captureSession stopRunning];
        }
        
        // 👉 Resumed remote video playback
        dispatch_async(dispatch_get_main_queue(), ^{
            RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
            if ([rootVC respondsToSelector:@selector(videoFrameCapture)] && rootVC.videoFrameCapture) {
                [rootVC.videoFrameCapture resumeNow];
                NSLog(@"▶️ Resumed remote video playback");
                [LogFileManager.sharedInstance logMessage:@"Resumed remote video playback"];
            }
        });
    });
}



- (void)checkCameraPermission {
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    if (status == AVAuthorizationStatusDenied || status == AVAuthorizationStatusRestricted) {
        NSLog(@"Camera access denied");
        return;
    }
    
    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
        if (!granted) {
            NSLog(@"Camera access not granted");
        return;
        }
        // Setup session once permission is granted
        dispatch_async(self->_captureQueue, ^{
            [self setupCaptureSession];
        });
    }];
}
+ (BOOL)videoRecordStart
{
    [[self sharedInstance] startVideoRecording];
    return YES;
}

+ (BOOL)videoRecordStop
{
    [[self sharedInstance] stopVideoRecording];
    return YES;
}

- (void)startVideoRecording {
    // 在录制开始/结束时添加
    [LogFileManager.sharedInstance logMessage:@"\n------------------------------"];
    [LogFileManager.sharedInstance logMessage:@"startVideoRecording"];
    NSLog(@"Current audio session category: %@", [AVAudioSession sharedInstance].category);
    NSLog(@"Is other audio playing: %@", [AVAudioSession sharedInstance].isOtherAudioPlaying ? @"YES" : @"NO");
    [LogFileManager.sharedInstance logMessage:@"Current audio session category:"];
    [LogFileManager.sharedInstance logMessage:[AVAudioSession sharedInstance].category];
    [LogFileManager.sharedInstance logMessage:@"Is other audio playing:"];
    [LogFileManager.sharedInstance logMessage:[AVAudioSession sharedInstance].isOtherAudioPlaying ? @"YES" : @"NO"];
    // 1. 确保会话已运行
    if (!_captureSession.isRunning) {
        [self startCapture]; // 主动启动会话
        NSLog(@"Trying to start captureSession...");
        [LogFileManager.sharedInstance logMessage:@"Trying to start captureSession..."];
        
        // 添加短暂延迟确保会话启动完成（仅调试用，实际需异步回调）
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            if (!self->_captureSession.isRunning) {
                NSLog(@"captureSession failed to start, recording unavailable");
                [LogFileManager.sharedInstance logMessage:@"captureSession failed to start, recording unavailable"];
                return;
            }
//            if (self.isStopCalled) {
//
//            }
//            else {
                [self realStartRecording]; // 实际录制逻辑
//            }
        });
        return;
    }
    [self realStartRecording];
}

// 拆分录制逻辑到独立方法
//
- (void)realStartRecording {
    [LogFileManager.sharedInstance logMessage:@"realStartRecording"];

    dispatch_async(_captureQueue, ^{
        // Step 1: Pause Agora audio on main thread
        dispatch_async(dispatch_get_main_queue(), ^{
            RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
            if ([rootVC respondsToSelector:@selector(pauseAgoraAudioBeforeRecording)]) {
                [LogFileManager.sharedInstance logMessage:@"pauseAgoraAudioBeforeRecording"];
                [rootVC pauseAgoraAudioBeforeRecording];
            }
        });

        // Step 2: Setup AVAudioSession
        @try {
            AVAudioSession *session = [AVAudioSession sharedInstance];
            NSError *audioError = nil;
            BOOL success = [session setCategory:AVAudioSessionCategoryPlayAndRecord
                                          mode:AVAudioSessionModeVideoRecording
                                       options:AVAudioSessionCategoryOptionMixWithOthers
                                         error:&audioError];
            if (!success) {
                NSString *errorDesc = audioError ? [NSString stringWithFormat:@"%@", audioError] : @"Unknown";
                [LogFileManager.sharedInstance logMessage:@"Audio configuration failed:"];
                [LogFileManager.sharedInstance logMessage:errorDesc];
            } else {
                [session setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:nil];
            }
        } @catch (NSException *exception) {
            [LogFileManager.sharedInstance logMessage:@"‼️ Audio configuration exception:"];
            [LogFileManager.sharedInstance logMessage:exception.description];
        }

        // Step 3: Start recording
        NSURL *documentsDirectory = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] firstObject];
        NSURL *outputFileURL = [documentsDirectory URLByAppendingPathComponent:@"recording.mov"];
        [[NSFileManager defaultManager] removeItemAtURL:outputFileURL error:nil];

        if (!self.movieFileOutput.isRecording) {
            self.movieFileOutput.movieFragmentInterval = CMTimeMake(1, 1);
            [self.movieFileOutput startRecordingToOutputFileURL:outputFileURL recordingDelegate:self];
            [LogFileManager.sharedInstance logMessage:@"✅ Start recording (on _captureQueue)"];
        }
    });
}


// 4. 停止录制方法保持不变
- (void)stopVideoRecording {
    [LogFileManager.sharedInstance logMessage:@"stopVideoRecording"];
//    self.isStopCalled = YES;
    // 在录制开始/结束时添加
    NSLog(@"Current audio session category: %@", [AVAudioSession sharedInstance].category);
    NSLog(@"Is other audio playing: %@", [AVAudioSession sharedInstance].isOtherAudioPlaying ? @"YES" : @"NO");
    [LogFileManager.sharedInstance logMessage:@"Current audio session category:"];
    [LogFileManager.sharedInstance logMessage:[AVAudioSession sharedInstance].category];
    [LogFileManager.sharedInstance logMessage:@"Is other audio playing:"];
    [LogFileManager.sharedInstance logMessage:[AVAudioSession sharedInstance].isOtherAudioPlaying ? @"YES" : @"NO"];
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self.movieFileOutput) {
            NSLog(@"movieFileOutput not initialized");
            [LogFileManager.sharedInstance logMessage:@"movieFileOutput not initialized"];
            NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoRecordCancel\", \"%@\");", @"0"];
            const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
            se::ScriptEngine::getInstance()->evalString(script_);
            return;
        }

        if (self.movieFileOutput.isRecording) {
            [self.movieFileOutput stopRecording];
            NSLog(@"Stop recording command sent");
            [LogFileManager.sharedInstance logMessage:@"Stop recording command sent"];
            
            // 延迟恢复音频会话（避免立即影响播放）
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [[AVAudioSession sharedInstance] setActive:NO
                                             withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation
                                                   error:nil];
            });
        } else {
            NSLog(@"Not currently recording. Possible reasons:");
            NSLog(@"1. movieFileOutput was not properly added to captureSession");
            NSLog(@"2. captureSession is not running");
            NSLog(@"3. startVideoRecording was not called or failed");
            
            [LogFileManager.sharedInstance logMessage:@"Not currently recording. Possible reasons:"];
            [LogFileManager.sharedInstance logMessage:@"1. movieFileOutput was not properly added to captureSession"];
            [LogFileManager.sharedInstance logMessage:@"2. captureSession is not running"];
            [LogFileManager.sharedInstance logMessage:@"3. startVideoRecording was not called or failed"];
            
            NSURL *documentsDirectory = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] firstObject];
            NSURL *outputFileURL = [documentsDirectory URLByAppendingPathComponent:@"recording.mov"];
            [[NSFileManager defaultManager] removeItemAtURL:outputFileURL error:nil];
            
            NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoRecordCancel\", \"%@\");", @"0"];
            const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
            se::ScriptEngine::getInstance()->evalString(script_);
            
//            NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoRecordStop\", \"%@\");", @"0"];
//            const char *script_= [script cStringUsingEncoding:NSUTF8StringEncoding];
//            se::ScriptEngine::getInstance()->evalString(script_);
        }
    });
}

- (void)rebuildSessionIfNeeded {
    if (_captureSession && !_captureSession.isRunning) {
        NSLog(@"⚠️ Detected captureSession inactive, rebuilding...");
        [LogFileManager.sharedInstance logMessage:@"Detected captureSession inactive, rebuilding..."];
        _isSetupComplete = NO;
        
        [_captureSession beginConfiguration];
        for (AVCaptureInput *input in _captureSession.inputs) {
            [_captureSession removeInput:input];
        }
        for (AVCaptureOutput *output in _captureSession.outputs) {
            [_captureSession removeOutput:output];
        }
        [_captureSession commitConfiguration];
        
        _captureSession = [[AVCaptureSession alloc] init]; // 彻底新建
        [self setupCaptureSession];
    }
}

- (void)captureOutput:(AVCaptureFileOutput *)output
didFinishRecordingToOutputFileAtURL:(NSURL *)outputFileURL
      fromConnections:(NSArray<AVCaptureConnection *> *)connections
                error:(nullable NSError *)error {
    
    [self.captureSession stopRunning];
    
    [LogFileManager.sharedInstance logMessage:@"didFinishRecordingToOutputFileAtURL"];
    
    // 恢复Agora音频
    dispatch_async(dispatch_get_main_queue(), ^{
        RootViewController *rootVC = (RootViewController *)[UIApplication sharedApplication].keyWindow.rootViewController;
        if ([rootVC respondsToSelector:@selector(resumeAgoraAudioAfterRecording)]) {
            [rootVC resumeAgoraAudioAfterRecording];
            [LogFileManager.sharedInstance logMessage:@"resumeAgoraAudioAfterRecording"];
        }
    });

    // 🧱 如果失败，删除文件并重建 movieFileOutput
    if (error) {
        NSLog(@"Recording failed: %@", error.localizedDescription);
        
        [LogFileManager.sharedInstance logMessage:@"Recording failed"];
        [LogFileManager.sharedInstance logMessage:error.localizedDescription];
        
        if (error.code != AVErrorMaximumDurationReached && error.code != AVErrorDiskFull) {
            [[NSFileManager defaultManager] removeItemAtURL:outputFileURL error:nil];
        }

        // 🔁 关键：重建 movieFileOutput，防止后续永久失效
        NSLog(@"⚠️ Rebuilding movieFileOutput (to avoid permanent recording failure)");
        [LogFileManager.sharedInstance logMessage:@"Rebuilding movieFileOutput (to avoid permanent recording failure)"];
        
        [self.captureSession beginConfiguration];
        if (self.movieFileOutput) {
            [self.captureSession removeOutput:self.movieFileOutput];
        }
        self.movieFileOutput = [[AVCaptureMovieFileOutput alloc] init];
        if ([self.captureSession canAddOutput:self.movieFileOutput]) {
            [self.captureSession addOutput:self.movieFileOutput];
            NSLog(@"✅ Successfully rebuilt movieFileOutput");
            [LogFileManager.sharedInstance logMessage:@"Successfully rebuilt movieFileOutput"];
        } else {
            NSLog(@"❌ Failed to re-add movieFileOutput");
            [LogFileManager.sharedInstance logMessage:@"Failed to re-add movieFileOutput"];
        }
        [self.captureSession commitConfiguration];

        return;
    }

    self.videoURL = outputFileURL;
    NSLog(@"Recording succeeded and saved to: %@", outputFileURL.path);
    [LogFileManager.sharedInstance logMessage:@"Video recording succeeded"];
    
    // 检查文件是否存在
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if ([fileManager fileExistsAtPath:outputFileURL.path]) {
        NSDictionary *attrs = [fileManager attributesOfItemAtPath:outputFileURL.path error:nil];
        NSLog(@"File size: %@ 字节", attrs[NSFileSize]);
        
        [LogFileManager.sharedInstance logMessage:@"File size:"];
        [LogFileManager.sharedInstance logMessage:attrs[NSFileSize]];
        
        NSNumber *fileSize = attrs[NSFileSize];
        if (fileSize != nil) {
            if ([fileSize unsignedLongLongValue] == 0) {
                NSLog(@"File size is 0 bytes");
                return;
            } else {
                NSLog(@"File size: %@ 字节", fileSize);
                
                AVAsset *videoAsset = [AVAsset assetWithURL:outputFileURL];
                CMTime duration = videoAsset.duration;
                Float64 durationSeconds = CMTimeGetSeconds(duration);

                NSLog(@"📹 Video recording duration: %.2f 秒", durationSeconds);
                [LogFileManager.sharedInstance logMessage:@"Video recording duration:"];
                
                NSString *stringValue = [NSString stringWithFormat:@"%.2f", durationSeconds];
                [LogFileManager.sharedInstance logMessage:stringValue];
                if (durationSeconds < 0.5) {
                    NSLog(@"⚠️ Video shorter than 1 second, deleting automatically");
                    [LogFileManager.sharedInstance logMessage:@"Video shorter than 1 second, deleting automatically"];
                    return;
                }
                
                NSString *script = [NSString stringWithFormat:@"cc.nativeCallback(\"onVideoRecordStop\", \"%@\");", @"1"];
                const char *script_ = [script cStringUsingEncoding:NSUTF8StringEncoding];
                se::ScriptEngine::getInstance()->evalString(script_);
            }
        } else {
            NSLog(@"Failed to retrieve file size");
            [LogFileManager.sharedInstance logMessage:@"Failed to retrieve file size"];
            return;
        }
    }
    else {
        NSLog(@"??????????????");
    }
}


@end
