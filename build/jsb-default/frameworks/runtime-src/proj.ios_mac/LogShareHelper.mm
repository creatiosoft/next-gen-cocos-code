#import "LogShareHelper.h"
#import <UIKit/UIKit.h>

@implementation LogShareHelper

+ (void)shareLogFile:(NSString *)filePath {
    if (!filePath || filePath.length == 0) {
        NSLog(@"[LogShareHelper] filePath is empty");
        return;
    }

    NSURL *fileURL = [NSURL fileURLWithPath:filePath];
    if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
        NSLog(@"[LogShareHelper] file not exist: %@", filePath);
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootVC = [UIApplication sharedApplication].keyWindow.rootViewController;
        if (!rootVC) {
            NSLog(@"[LogShareHelper] rootViewController is nil");
            return;
        }

        // 使用系统分享面板（用户可以选择「邮件」）
        UIActivityViewController *activityVC = [[UIActivityViewController alloc]
                                               initWithActivityItems:@[fileURL]
                                               applicationActivities:nil];

        // iPad 需要设置 popover
        if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
            activityVC.popoverPresentationController.sourceView = rootVC.view;
            activityVC.popoverPresentationController.sourceRect = CGRectMake(rootVC.view.bounds.size.width/2, rootVC.view.bounds.size.height/2, 1, 1);
        }

        [rootVC presentViewController:activityVC animated:YES completion:nil];
    });
}

@end
