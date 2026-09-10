#import <Foundation/Foundation.h>

@interface AudioUploader : NSObject

- (void)uploadAudioWithURL:(NSURL *)audioURL toServerURL:(NSString *)serverURL completion:(void(^)(BOOL success, NSError *error))completion;

@end
