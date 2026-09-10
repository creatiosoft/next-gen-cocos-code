#import <Foundation/Foundation.h>

typedef void (^AWSUploadCompletionHandler)(BOOL success, NSError * _Nullable error);

@interface AWSUploadManager : NSObject

+ (void)uploadVideoFileAtPath:(NSString *)filePath
           presignedUploadURL:(NSURL *)presignedURL
                   completion:(AWSUploadCompletionHandler)completion;

+ (void)uploadFileAtPath:(NSString *)filePath
      presignedUploadURL:(NSURL *)presignedURL
              completion:(AWSUploadCompletionHandler)completion;

@end
