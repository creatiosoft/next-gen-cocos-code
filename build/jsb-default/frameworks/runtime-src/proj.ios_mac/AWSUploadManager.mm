#import "AWSUploadManager.h"

@implementation AWSUploadManager

//+ (void)uploadVideoFileAtPath:(NSString *)filePath
//           presignedUploadURL:(NSURL *)presignedURL
//                   completion:(AWSUploadCompletionHandler)completion {
//    
//    // 1. Force using video/quicktime (standard MIME type for MOV)
//    NSURLComponents *components = [NSURLComponents componentsWithURL:presignedURL resolvingAgainstBaseURL:NO];
//    NSMutableArray *queryItems = [components.queryItems mutableCopy];
//    
//    __block NSInteger contentTypeIndex = NSNotFound;
//    [queryItems enumerateObjectsUsingBlock:^(NSURLQueryItem *item, NSUInteger idx, BOOL *stop) {
//        if ([item.name isEqualToString:@"Content-Type"]) {
//            contentTypeIndex = idx;
//            *stop = YES;
//        }
//    }];
//    
//    if (contentTypeIndex != NSNotFound) {
//        queryItems[contentTypeIndex] = [NSURLQueryItem queryItemWithName:@"Content-Type" value:@"video/quicktime"];
//    } else {
//        [queryItems addObject:[NSURLQueryItem queryItemWithName:@"Content-Type" value:@"video/quicktime"]];
//    }
//    
//    components.queryItems = queryItems;
//    NSURL *correctedURL = components.URL;
//    
//    // 2. Validate file type
//    NSString *fileExtension = [[filePath pathExtension] lowercaseString];
//    if (![fileExtension isEqualToString:@"mov"]) {
//        NSError *error = [NSError errorWithDomain:@"AWSUploadErrorDomain"
//                                             code:-2
//                                         userInfo:@{NSLocalizedDescriptionKey: @"Only .mov files are supported"}];
//        if (completion) completion(NO, error);
//        return;
//    }
//    
//    // 3. Perform upload (reuse existing implementation)
//    [self uploadFileAtPath:filePath
//        presignedUploadURL:correctedURL
//                completion:^(BOOL success, NSError * _Nullable error) {
//        
//        // 4. Special handling for 403 errors
//        if (!success && [error.domain isEqualToString:@"AWSUploadErrorDomain"] && error.code == 403) {
//            NSError *enhancedError = [NSError errorWithDomain:error.domain
//                                                         code:error.code
//                                                     userInfo:@{
//                NSLocalizedDescriptionKey: @"Video upload rejected (403). Please check:\n1. Presigned URL expiration\n2. File type is MOV\n3. S3 bucket permissions",
//                @"OriginalError": error
//            }];
//            if (completion) completion(NO, enhancedError);
//            return;
//        }
//        
//        if (completion) completion(success, error);
//    }];
//}

+ (void)uploadVideoFileAtPath:(NSString *)filePath
           presignedUploadURL:(NSURL *)presignedURL
                   completion:(AWSUploadCompletionHandler)completion {
    
    // 1. 验证文件类型
    NSString *fileExtension = [[filePath pathExtension] lowercaseString];
    if (![fileExtension isEqualToString:@"mov"]) {
        NSError *error = [NSError errorWithDomain:@"AWSUploadErrorDomain"
                                             code:-2
                                         userInfo:@{NSLocalizedDescriptionKey: @"仅支持.mov文件"}];
        if (completion) completion(NO, error);
        return;
    }
    
    // 2. 关键修复：不再修改URL！直接使用原始预签名URL
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:presignedURL];
    request.HTTPMethod = @"PUT";
    
    // 3. 在请求头设置Content-Type（不在URL中修改）
    [request setValue:@"video/quicktime" forHTTPHeaderField:@"Content-Type"];
    
    // 4. 流式上传
    NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:filePath];
    request.HTTPBodyStream = inputStream;
    
    // 5. 配置会话
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    config.timeoutIntervalForRequest = 120.0; // 延长到2分钟
    config.timeoutIntervalForResource = 600.0;
    config.allowsCellularAccess = YES;
    config.networkServiceType = NSURLNetworkServiceTypeResponsiveData; // 更高优先级
    // 添加重试机制
    config.waitsForConnectivity = YES; // iOS 11+ 等待网络恢复
    config.connectionProxyDictionary = @{}; // 避免代理干扰
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
    
    // 6. 创建上传任务
    NSURLSessionUploadTask *uploadTask = [session uploadTaskWithRequest:request
                                                             fromFile:[NSURL fileURLWithPath:filePath]
                                                    completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        // 7. 增强错误处理
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        if (httpResponse.statusCode == 403) {
            NSString *serverMsg = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"无详情";
            error = [NSError errorWithDomain:@"AWSUploadErrorDomain"
                                        code:403
                                    userInfo:@{
                NSLocalizedDescriptionKey: @"S3拒绝上传(403)",
                @"调试信息": @{
                    @"文件大小": @([NSData dataWithContentsOfFile:filePath].length),
                    @"服务器响应": serverMsg,
                    @"原始URL": presignedURL.absoluteString
                }
            }];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if (completion) completion(!error && httpResponse.statusCode == 200, error);
        });
        
        [inputStream close];
    }];
    
    [uploadTask resume];
}

+ (void)uploadFileAtPath:(NSString *)filePath
      presignedUploadURL:(NSURL *)presignedURL
              completion:(AWSUploadCompletionHandler)completion {
    
    // 1. Verify file exists
    if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
        NSError *error = [NSError errorWithDomain:@"AWSUploadErrorDomain"
                                             code:-1
                                         userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"File not found at path: %@", filePath]}];
        if (completion) completion(NO, error);
        return;
    }
    
    // 2. Determine Content-Type from file extension
    NSString *fileExtension = [[filePath pathExtension] lowercaseString];
    NSString *contentType = [self mimeTypeForFileExtension:fileExtension];
    
    // 3. Prepare request
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:presignedURL];
    request.HTTPMethod = @"PUT";
    
    // 添加断点续传支持
    NSDictionary *fileAttrs = [[NSFileManager defaultManager] attributesOfItemAtPath:filePath error:nil];
    NSNumber *fileSize = fileAttrs[NSFileSize];
    [request setValue:[NSString stringWithFormat:@"%lld", fileSize.longLongValue] forHTTPHeaderField:@"Content-Length"];
    [request setValue:contentType forHTTPHeaderField:@"Content-Type"];
    [request setValue:@"identity" forHTTPHeaderField:@"Content-Encoding"]; // No compression
    
    // 4. Use stream-based upload (better for large files)
    NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:filePath];
    request.HTTPBodyStream = inputStream;
    
    // 5. Configure session (with detailed errors)
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    config.timeoutIntervalForRequest = 60.0; // 60-second timeout
    config.timeoutIntervalForResource = 600.0; // 10-minute resource timeout
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
    
    // 6. Create upload task
    NSURLSessionUploadTask *uploadTask = [session uploadTaskWithRequest:request
                                                             fromFile:[NSURL fileURLWithPath:filePath]
                                                    completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        
        // 7. Unified error handling
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        NSError *finalError = error;
        NSInteger statusCode = httpResponse.statusCode;
        
        if (!error && statusCode >= 400) {
            NSString *serverMessage = [[NSString alloc] initWithData:data ?: [NSData data] encoding:NSUTF8StringEncoding] ?: @"No server message";
            
            finalError = [NSError errorWithDomain:@"AWSUploadErrorDomain"
                                             code:statusCode
                                         userInfo:@{
                                             NSLocalizedDescriptionKey: [NSString stringWithFormat:@"Upload failed with status %ld", (long)statusCode],
                                             @"ServerResponse": serverMessage,
                                             @"ContentType": contentType,
                                             @"FileExtension": fileExtension
                                         }];
        }
        
        BOOL success = (finalError == nil) && (statusCode >= 200 && statusCode < 300);
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if (completion) completion(success, finalError);
        });
        
        [inputStream close];
    }];
    
    // 8. Start upload
    [uploadTask resume];
}

// Returns MIME type for file extension
+ (NSString *)mimeTypeForFileExtension:(NSString *)extension {
    NSDictionary *mimeTypes = @{
        @"m4a": @"audio/mp4",
        @"mp4": @"video/mp4",
        @"mov": @"video/quicktime",
        @"avi": @"video/x-msvideo",
        @"wav": @"audio/wav",
        @"mp3": @"audio/mpeg",
        @"jpg": @"image/jpeg",
        @"png": @"image/png"
    };
    
    return mimeTypes[extension] ?: @"application/octet-stream";
}

@end
