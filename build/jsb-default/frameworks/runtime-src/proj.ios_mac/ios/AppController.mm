/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
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

#import "AppController.h"
#import "cocos2d.h"
#import "AppDelegate.h"
#import "RootViewController.h"
#import "SDKWrapper.h"
#import "platform/ios/CCEAGLView-ios.h"

#import "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "base/CCScheduler.h"
#include "base/CCThreadPool.h"
#import "VibrationHelper.h"

//#import "Cocos2dHelper.h"

using namespace cocos2d;

static NSString *gameID = @"";
static NSString *privateGameID = @"";
static NSString *fcm = @"";
static NSString *inviteCode = @"";


@interface AppController ()
@end

@implementation AppController

Application* app = nullptr;
@synthesize window;

#pragma mark -
#pragma mark Application lifecycle

// Getter method for gameID
+ (NSString *)getGameID {
    NSString *tempGameID = gameID;
    gameID = @"";
    return tempGameID;
}

+ (NSString *)getGameID2 {
    return gameID;
}

// Setter method for gameID
+ (void)setGameID:(NSString *)newGameID {
    if (newGameID != gameID) {
        gameID = [newGameID copy]; // Copy to retain the value
    }
}

+ (NSString *)getPrivateGameID {
    NSString *tempGameID = privateGameID;
    privateGameID = @"";
    return tempGameID;
}

+ (NSString *)getPrivateGameID2 {
    return privateGameID;
}

// Setter method for gameID
+ (void)setPrivateGameID:(NSString *)newGameID {
    if (newGameID != privateGameID) {
        privateGameID = [newGameID copy]; // Copy to retain the value
    }
}

+ (NSString *)getFCM {
    NSString *tempFcm = fcm;
//    fcm = @"";
    return tempFcm;
}

+ (void)setFCM:(NSString *)newFCM {
    if (newFCM != fcm) {
        fcm = [newFCM copy]; // Copy to retain the value
    }
}

+ (NSString *)getInviteCode {
    NSString *tempInviteCode = inviteCode;
    inviteCode = @"";
    return tempInviteCode;
}

+ (void)setInviteCode:(NSString *)newInviteCode {
    if (newInviteCode != inviteCode) {
        inviteCode = [newInviteCode copy]; // Copy to retain the value
    }
}


- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    NSString *urlString = [url absoluteString];
    
    if ([urlString containsString:@"txpoker://"]) {
        // Handle the deep link (extract info from the URL)
        NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:NO];
        NSArray *queryItems = [components queryItems];
        
        NSMutableDictionary *params = [NSMutableDictionary dictionary];
        
        // Extract query parameters
        for (NSURLQueryItem *item in queryItems) {
            params[item.name] = item.value;
        }

        // Send extracted data to Cocos Creator
//        userID = params[@"userID"];
//        gameID = params[@"gameID"];
        
//        gameID = @"6773f0deadcfafa366979049";
        
        [AppController setGameID:params[@"gameID"]];
        [AppController setPrivateGameID:params[@"privateGame"]];
        [AppController setInviteCode:params[@"playerId"]];
        
        return YES;
    }
    return NO;
}

+ (NSString *) getSchemaData {
    if (gameID == nil) {
        return @"";
    }
    else {
        return gameID;
    }
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // ==================== 必须放在最最前面！ ====================
    // ==================== Firebase 初始化（必须最最前面） ====================
    if ([FIRApp defaultApp] == nil) {
        [FIRApp configure];
        NSLog(@"✅ Firebase 已成功初始化");
    }
    // =====================================================================
    
    [[SDKWrapper getInstance] application:application didFinishLaunchingWithOptions:launchOptions];
    
    [FIRMessaging messaging].delegate = self;
    
    // 请求推送权限
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
    UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert |
                                         UNAuthorizationOptionSound |
                                         UNAuthorizationOptionBadge;
    [[UNUserNotificationCenter currentNotificationCenter]
        requestAuthorizationWithOptions:authOptions
                      completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            NSLog(@"✅ 用户已授权推送通知");
        }
    }];
    
    [application registerForRemoteNotifications];
    
    // Add the view controller's view to the window and display.
    float scale = [[UIScreen mainScreen] scale];
    CGRect bounds = [[UIScreen mainScreen] bounds];
    window = [[UIWindow alloc] initWithFrame: bounds];
    
    // cocos2d application instance
    app = new AppDelegate(bounds.size.width * scale, bounds.size.height * scale);
    app->setMultitouch(true);
    
    // Use RootViewController to manage CCEAGLView
    _viewController = [[RootViewController alloc]init];
#ifdef NSFoundationVersionNumber_iOS_7_0
    _viewController.automaticallyAdjustsScrollViewInsets = NO;
    _viewController.extendedLayoutIncludesOpaqueBars = NO;
    _viewController.edgesForExtendedLayout = UIRectEdgeAll;
#else
    _viewController.wantsFullScreenLayout = YES;
#endif
    // Set RootViewController to window
    if ( [[UIDevice currentDevice].systemVersion floatValue] < 6.0)
    {
        // warning: addSubView doesn't work on iOS6
        [window addSubview: _viewController.view];
    }
    else
    {
        // use this method on ios6
        [window setRootViewController:_viewController];
    }
    
    [window makeKeyAndVisible];
    
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayAndRecord
                   mode:AVAudioSessionModeVideoRecording
                options:AVAudioSessionCategoryOptionMixWithOthers | AVAudioSessionCategoryOptionAllowBluetoothA2DP
                  error:nil];

    //
    
    //run the cocos2d-x game scene
    app->start();
    
//    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {}];
//    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeAudio completionHandler:^(BOOL granted) {}];    

    return YES;
}


+ (AVAuthorizationStatus)checkVideoPermission {
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    switch (status) {
        case AVAuthorizationStatusAuthorized:
            NSLog(@"Video permission is authorized.");
            break;
        case AVAuthorizationStatusDenied:
            NSLog(@"Video permission is denied.");
            break;
        case AVAuthorizationStatusNotDetermined:
            NSLog(@"Video permission is not determined. Requesting...");
            break;
        case AVAuthorizationStatusRestricted:
            NSLog(@"Video permission is restricted.");
            break;
        default:
            NSLog(@"Unknown video permission status.");
            break;
    }
    return status;
}

+ (void)requestVideoPermission {
    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
        if (granted) {
            NSLog(@"Video permission granted.");
            
            NSString *script = @"cc.nativeCallback(\"requestVideoPermission\", 3);";
            const char *script_= [script UTF8String];
            NSLog(@"%@", script);
            cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(script_);
            });
        } else {
            NSLog(@"Video permission denied.");
            
            NSString *script = @"cc.nativeCallback(\"requestVideoPermission\", 2);";
            const char *script_= [script UTF8String];
            NSLog(@"%@", script);
            cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(script_);
            });
        }
    }];
}

+ (void)requestGuideVideoPermission {
    NSURL *settingsURL = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
    if ([[UIApplication sharedApplication] canOpenURL:settingsURL]) {
        [[UIApplication sharedApplication] openURL:settingsURL options:@{} completionHandler:nil];
    }
}

+ (AVAuthorizationStatus)checkAudioPermission {
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeAudio];
    switch (status) {
        case AVAuthorizationStatusAuthorized:
            NSLog(@"Audio permission is authorized.");
            break;
        case AVAuthorizationStatusDenied:
            NSLog(@"Audio permission is denied.");
            break;
        case AVAuthorizationStatusNotDetermined:
            NSLog(@"Audio permission is not determined. Requesting...");
            break;
        case AVAuthorizationStatusRestricted:
            NSLog(@"Audio permission is restricted.");
            break;
        default:
            NSLog(@"Unknown audio permission status.");
            break;
    }
    return status;
}

+ (void)requestGuideAudioPermission {
    NSURL *settingsURL = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
    if ([[UIApplication sharedApplication] canOpenURL:settingsURL]) {
        [[UIApplication sharedApplication] openURL:settingsURL options:@{} completionHandler:nil];
    }
}

+ (void)requestAudioPermission {
    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeAudio completionHandler:^(BOOL granted) {
        if (granted) {
            NSLog(@"Audio permission granted.");
            
            NSString *script = @"cc.nativeCallback(\"requestAudioPermission\", 3);";
            const char *script_= [script UTF8String];
            NSLog(@"%@", script);
            cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(script_);
            });
        } else {
            NSLog(@"Audio permission denied.");
            
            NSString *script = @"cc.nativeCallback(\"requestAudioPermission\", 2);";
            const char *script_= [script UTF8String];
            NSLog(@"%@", script);
            cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=](){
                se::ScriptEngine::getInstance()->evalString(script_);
            });
        }
    }];
}

- (void)applicationWillResignActive:(UIApplication *)application {
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
    app->onPause();
    [[SDKWrapper getInstance] applicationWillResignActive:application];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
    app->onResume();
    [[SDKWrapper getInstance] applicationDidBecomeActive:application];
    
    [VibrationHelper appDidBecomeActive];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
     If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     */
    [[SDKWrapper getInstance] applicationDidEnterBackground:application];
    
    NSLog(@"[App] === Background Task ===");
    self.mqttBackgroundTask = [application beginBackgroundTaskWithName:@"MQTT_Ping_Task" expirationHandler:^{
//        NSLog(@"[App] Background Task 即将过期，立即结束任务");
        [self endMQTTBackgroundTask];
    }];
    
    if (self.mqttBackgroundTask != UIBackgroundTaskInvalid) {
        NSLog(@"[App] Background Task started，ID = %lu", (unsigned long)self.mqttBackgroundTask);
        [self performBackgroundPing];
        [self startBackgroundPingTimer];
    } else {
//        NSLog(@"[App] 无法启动 Background Task");
    }
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    /*
     Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
     */
    [[SDKWrapper getInstance] applicationWillEnterForeground:application];
    
    [self endMQTTBackgroundTask];
}

- (void)endMQTTBackgroundTask {
    if (self.mqttBackgroundTask != UIBackgroundTaskInvalid) {
        [[UIApplication sharedApplication] endBackgroundTask:self.mqttBackgroundTask];
        self.mqttBackgroundTask = UIBackgroundTaskInvalid;
    }
    
    if (self.backgroundPingTimer) {
        [self.backgroundPingTimer invalidate];
        self.backgroundPingTimer = nil;
    }
}

// 启动 NSTimer
- (void)startBackgroundPingTimer {
    if (self.backgroundPingTimer) {
        [self.backgroundPingTimer invalidate];
    }
    
    self.backgroundPingTimer = [NSTimer timerWithTimeInterval:10.0   // 每25秒一次
                                                      target:self
                                                    selector:@selector(performBackgroundPing)
                                                    userInfo:nil
                                                     repeats:YES];
    
    [[NSRunLoop currentRunLoop] addTimer:self.backgroundPingTimer forMode:NSDefaultRunLoopMode];
}

- (void)performBackgroundPing {
    NSLog(@"[App] /*执行后台 */PING");
//    NSString *jsCode = @"if (window.sendMQTTBackgroundPing) { window.sendMQTTBackgroundPing(); }";
//    se::ScriptEngine::getInstance()->evalString(jsCode.UTF8String);
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    [[SDKWrapper getInstance] applicationWillTerminate:application];
    delete app;
    app = nil;
}

+ (BOOL)SendEmail:(NSString *)content {
    NSLog(@"SendEmail");
    UIApplication *application = [UIApplication sharedApplication];
    [application openURL:[NSURL URLWithString: content] options:@{} completionHandler:nil];
    return YES;
}

+ (BOOL)MakeCall:(NSString *)content {
    NSLog(@"MakeCall");
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:content]  options:@{} completionHandler:nil];
    return YES;
}

#pragma mark -
#pragma mark Memory management

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    /*
     Free up as much memory as possible by purging cached data objects that can be recreated (or reloaded from disk) later.
     */
}

// Objective-C code for sharing
// In your Objective-C class, change the method to a class method:
+ (void)shareText:(NSString *)text {
    // Create the activity view controller
    UIActivityViewController *activityViewController = [[UIActivityViewController alloc] initWithActivityItems:@[text] applicationActivities:nil];
    
    // Present the view controller on the main screen
    activityViewController.popoverPresentationController.sourceView = [UIApplication sharedApplication].keyWindow.rootViewController.view;
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:activityViewController animated:YES completion:nil];
}

+(BOOL)createPay:(NSString *) productID {
    return YES;
}

// 获取 FCM Token（关键！）
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    
    NSLog(@"✅ 收到 APNs Device Token");
    
    // 必须先设置 APNs Token
    [FIRMessaging messaging].APNSToken = deviceToken;
    
    // 然后再获取 FCM Token
    [[FIRMessaging messaging] tokenWithCompletion:^(NSString * _Nullable token, NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"❌ 获取 FCM Token 失败: %@", error.localizedDescription);
        } else if (token != nil) {
            NSLog(@"✅✅✅ 成功获取 FCM Token: %@", token);
            [AppController setFCM:token];   // 存起来，JS 可以调用 getFCM() 获取
        }
    }];
}

// 接收推送通知
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
      fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [[FIRMessaging messaging] appDidReceiveMessage:userInfo];
    completionHandler(UIBackgroundFetchResultNewData);
}

@end
