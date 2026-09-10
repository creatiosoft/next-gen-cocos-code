// LogFileManager.h
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface LogFileManager : NSObject

+ (instancetype)sharedInstance;

- (void)logMessage:(NSString *)message;
- (NSURL *)currentLogFileURL;
- (void)exportLogFileViaEmailFromViewController:(UIViewController *)viewController;

@end
