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
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <UserNotifications/UserNotifications.h>

@class RootViewController;

@interface AppController : NSObject <UIApplicationDelegate, FIRMessagingDelegate, UNUserNotificationCenterDelegate>
{
}

@property(nonatomic, readonly) RootViewController* viewController;

+ (NSString *)getGameID;
+ (NSString *)getGameID2;
+ (void)setGameID:(NSString *)gameID;

+ (NSString *)getFCM;
+ (void)setFCM:(NSString *)newFCM;

+ (NSString *)getInviteCode;
+ (void)setInviteCode:(NSString *)newInviteCode;

+(BOOL)SendEmail:(NSString *) content;
+(BOOL)MakeCall:(NSString *) content;
+ (NSString *) getSchemaData;
+ (void)shareText:(NSString *)text;


+ (AVAuthorizationStatus)checkVideoPermission;
+ (void)requestVideoPermission;
+ (void)requestGuideVideoPermission;
        
+ (AVAuthorizationStatus)checkAudioPermission;
+ (void)requestAudioPermission;
+ (void)requestGuideAudioPermission;

+ (BOOL)createPay:(NSString *) productID;

@property (nonatomic, assign) UIBackgroundTaskIdentifier mqttBackgroundTask;
@property (nonatomic, strong) NSTimer *backgroundPingTimer;

@end

