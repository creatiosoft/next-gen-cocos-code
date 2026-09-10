// LogFileManager.m
#import "LogFileManager.h"
#import <MessageUI/MessageUI.h>

@interface LogFileManager () <MFMailComposeViewControllerDelegate>
@property (nonatomic, strong) NSURL *logFileURL;
@end

@implementation LogFileManager

+ (instancetype)sharedInstance {
    static LogFileManager *instance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[LogFileManager alloc] init];
        [instance setupLogFile];
    });
    return instance;
}

- (void)setupLogFile {
    NSString *fileName = [NSString stringWithFormat:@"log_%@.txt", [self timestampString]];
    NSURL *documentsDirectory = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] firstObject];
    self.logFileURL = [documentsDirectory URLByAppendingPathComponent:fileName];
    [[NSFileManager defaultManager] createFileAtPath:self.logFileURL.path contents:nil attributes:nil];
}

- (NSString *)timestampString {
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"d MMM yyyy h:mm:ss a";
    return [formatter stringFromDate:[NSDate date]];
}

- (void)logMessage:(NSString *)message {
    NSString *timestamp = [[NSDate date] descriptionWithLocale:[NSLocale currentLocale]];
    NSString *fullMessage = [NSString stringWithFormat:@"[%@] %@\n", timestamp, message];
    NSFileHandle *fileHandle = [NSFileHandle fileHandleForWritingAtPath:self.logFileURL.path];
    if (fileHandle) {
        [fileHandle seekToEndOfFile];
        [fileHandle writeData:[fullMessage dataUsingEncoding:NSUTF8StringEncoding]];
        [fileHandle closeFile];
    } else {
        [fullMessage writeToURL:self.logFileURL atomically:YES encoding:NSUTF8StringEncoding error:nil];
    }
}

- (NSURL *)currentLogFileURL {
    return self.logFileURL;
}

- (void)exportLogFileViaEmailFromViewController:(UIViewController *)viewController {
//    if (![MFMailComposeViewController canSendMail]) {
//        NSLog(@"📧 当前设备无法发送邮件");
//        return;
//    }
//
//    MFMailComposeViewController *mailVC = [[MFMailComposeViewController alloc] init];
//    mailVC.mailComposeDelegate = self;
//    [mailVC setSubject:@"游戏日志导出"];
//    [mailVC setMessageBody:@"附件包含本次运行的完整日志记录。" isHTML:NO];
//    [mailVC setToRecipients:@[@"supersuraccoon@gmail.com"]];
//
//    NSData *logData = [NSData dataWithContentsOfURL:self.logFileURL];
//    if (logData) {
//        [mailVC addAttachmentData:logData mimeType:@"text/plain" fileName:self.logFileURL.lastPathComponent];
//    }
//
//    [viewController presentViewController:mailVC animated:YES completion:nil];
    
    if (!self.logFileURL) {
            NSLog(@"⚠️ 当前没有日志文件可以分享");
            return;
        }

        NSArray *items = @[self.logFileURL];
        UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:items applicationActivities:nil];

        activityVC.excludedActivityTypes = @[]; // 可选：排除一些分享类型

        if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad) {
            activityVC.popoverPresentationController.sourceView = viewController.view;
            activityVC.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width/2, viewController.view.bounds.size.height/2, 1.0, 1.0);
        }

        [viewController presentViewController:activityVC animated:YES completion:nil];
}

#pragma mark - MFMailComposeViewControllerDelegate

- (void)mailComposeController:(MFMailComposeViewController *)controller didFinishWithResult:(MFMailComposeResult)result error:(NSError *)error {
    [controller dismissViewControllerAnimated:YES completion:nil];
}

@end
