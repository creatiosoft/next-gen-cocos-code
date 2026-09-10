#import "AudioRecorderManager.h"
#import <Photos/Photos.h>

@implementation AudioRecorderManager

+ (instancetype)sharedInstance {
    static AudioRecorderManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        [self setupAudioSession];
    }
    return self;
}

- (void)setupAudioSession {
    NSError *error;
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setCategory:AVAudioSessionCategoryPlayAndRecord error:&error];
    if (error) {
        NSLog(@"Error setting up audio session: %@", error);
    }
    [audioSession setActive:YES error:&error];
    if (error) {
        NSLog(@"Error activating audio session: %@", error);
    }
}

+ (BOOL)startRecording {
    AudioRecorderManager *manager = [AudioRecorderManager sharedInstance];
    NSError *error;
    NSURL *documentsDirectory = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:nil];
    manager.audioURL = [documentsDirectory URLByAppendingPathComponent:[NSString stringWithFormat:@"recording_%f.m4a", [[NSDate date] timeIntervalSince1970]]];
    
    NSDictionary *settings = @{
                               AVFormatIDKey: @(kAudioFormatMPEG4AAC),
                               AVSampleRateKey: @22050,
                               AVNumberOfChannelsKey: @1,
                               AVEncoderAudioQualityKey: @(AVAudioQualityHigh)
                               };
    
    manager.audioRecorder = [[AVAudioRecorder alloc] initWithURL:manager.audioURL settings:settings error:&error];
    if (error) {
        NSLog(@"Error initializing audio recorder: %@", error);
        return NO;
    }
    manager.audioRecorder.delegate = manager;
    [manager.audioRecorder prepareToRecord];
    [manager.audioRecorder record];
    return YES;
}

+ (BOOL)stopRecording {
    AudioRecorderManager *manager = [AudioRecorderManager sharedInstance];
    if (manager.audioRecorder) {
        [manager.audioRecorder stop];
        manager.audioRecorder = nil;
        
        // Save the recorded audio to the photo library
        [self saveAudioToPhotoLibraryWithURL:manager.audioURL completion:^(BOOL success, NSError *error) {
            if (success) {
                NSLog(@"Audio saved successfully to photo library");
            } else {
                NSLog(@"Failed to save audio to photo library: %@", error);
            }
        }];
    }
    return YES;
}

- (void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully:(BOOL)flag {
    if (flag) {
        NSLog(@"Recording finished successfully");
    } else {
        NSLog(@"Recording did not finish successfully");
    }
}

- (void)audioRecorderEncodeErrorDidOccur:(AVAudioRecorder *)recorder error:(NSError *)error {
    NSLog(@"Error occurred during recording: %@", error);
}

+ (void)saveAudioToPhotoLibraryWithURL:(NSURL *)audioURL completion:(void(^)(BOOL success, NSError *error))completion {
    // 请求相册权限
    [PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelAddOnly handler:^(PHAuthorizationStatus status) {
        if (status == PHAuthorizationStatusAuthorized) {
            // 用户已授权，可以保存音频文件
            [[PHPhotoLibrary sharedPhotoLibrary] performChanges:^{
                [PHAssetChangeRequest creationRequestForAssetFromVideoAtFileURL:audioURL];
            } completionHandler:^(BOOL success, NSError *error) {
                if (error) {
                    NSLog(@"Error saving audio to photo library: %@", error);
                    completion(NO, error);
                } else {
                    NSLog(@"Audio saved successfully to photo library");
                    completion(YES, nil);
                }
            }];
        } else {
            // 用户未授权
            NSLog(@"User did not authorize access to photo library");
            completion(NO, [NSError errorWithDomain:@"PhotoLibraryErrorDomain" code:1 userInfo:nil]);
        }
    }];
}

@end
