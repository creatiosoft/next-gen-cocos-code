#import <Foundation/Foundation.h>

@interface AudioUploader : NSObject

- (void)uploadAudioWithURL:(NSURL *)audioURL toServerURL:(NSString *)serverURL completion:(void(^)(BOOL success, NSError *error))completion;

@end

@implementation AudioUploader

- (void)uploadAudioWithURL:(NSURL *)audioURL toServerURL:(NSString *)serverURL completion:(void(^)(BOOL success, NSError *error))completion {
    NSData *audioData = [NSData dataWithContentsOfURL:audioURL];
    if (!audioData) {
        NSError *error = [NSError errorWithDomain:@"AudioUploaderErrorDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"Failed to load audio data"}];
        completion(NO, error);
        return;
    }
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:serverURL]];
    [request setHTTPMethod:@"POST"];
    
    NSString *boundary = @"Boundary-7MA4YWxkTrZu0gW";
    NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
    [request setValue:contentType forHTTPHeaderField: @"Content-Type"];
    
    NSMutableData *body = [NSMutableData data];
    [body appendData:[[NSString stringWithFormat:@"--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
    [body appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"file\"; filename=\"%@\"\r\n", [audioURL lastPathComponent]] dataUsingEncoding:NSUTF8StringEncoding]];
    [body appendData:[@"Content-Type: audio/m4a\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
    [body appendData:audioData];
    [body appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
    
    [request setHTTPBody:body];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            completion(NO, error);
        } else {
            NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
            if (httpResponse.statusCode == 200) {
                completion(YES, nil);
            } else {
                NSError *uploadError = [NSError errorWithDomain:@"AudioUploaderErrorDomain" code:httpResponse.statusCode userInfo:nil];
                completion(NO, uploadError);
            }
        }
    }];
    [dataTask resume];
}

@end
