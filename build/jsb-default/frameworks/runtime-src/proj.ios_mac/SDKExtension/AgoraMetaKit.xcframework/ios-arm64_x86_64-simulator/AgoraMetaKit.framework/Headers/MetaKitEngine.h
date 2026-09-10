//
//  MetaKitEngine.h
//  MetaKit
//
//  Created by ZCY on 2022/12/1.
//




#import <Foundation/Foundation.h>
#import <Foundation/NSObjCRuntime.h>
#import <UIKit/UIKit.h>
#import <CoreVideo/CoreVideo.h>

#pragma once

typedef NS_ENUM(NSUInteger, MetaKitAvatarMode) {
    MetaKitAvatarModeVirtualHuman = 0,
    MetaKitAvatarModeHeadMask = 1,
    MetaKitAvatarModeVideoCapture = 2,
};

typedef NS_ENUM(NSUInteger, MetaKitSceneIndex) {
    MetaKitSceneIndexMeta = 0,
    MetaKitSceneIndexChat = 1,
};

__attribute__((visibility("default")))
@protocol MetaKitEngineDelegate <NSObject>
- (void)onFrameResolved:(UIView*)view pixelBuffer:(CVPixelBufferRef)pixelBuffer;
- (void)onReceiveMessage:(NSString *)key message:(NSString *)message;
- (void)onErrorMessage:(NSString *)message;
- (void)onValueChange:(NSString *)key value:(id)value;
@end

__attribute__((visibility("default")))
@interface MetaKitEngine : NSObject<MetaKitEngineDelegate>

@property(nonatomic, weak) id<MetaKitEngineDelegate> delegate;

+ (MetaKitEngine *)sharedInstance NS_SWIFT_NAME(sharedInstance());
- (int)initialize;
- (int)destroy;
- (int)sendMsgToMetaKit:(NSString *)key jsonMessage:(NSString *)jsonMessage;
- (UIView *)createSceneView:(CGRect)frame NS_SWIFT_NAME(createSceneView(_:));
- (int)addSceneView:(UIView *)view NS_SWIFT_NAME(addSceneView(_:));
- (int)removeSceneView:(UIView *)view  NS_SWIFT_NAME(removeSceneView(_:));
- (int)enableVideoFrame:(UIView *)view enable:(BOOL)enable NS_SWIFT_NAME(enableVideoFrame(_:enable:));
@end
