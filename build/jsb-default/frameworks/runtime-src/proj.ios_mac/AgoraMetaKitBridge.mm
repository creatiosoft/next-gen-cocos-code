//#import "AgoraMetaKitBridge.h"
//
//@interface AgoraMetaKitBridge ()
//@property (strong, nonatomic) MetaKitEngine *metaKitEngine;
//@property (strong, nonatomic) UIView *sceneView;
//@end
//
//@implementation AgoraMetaKitBridge
//
//+ (instancetype)sharedInstance {
//    static AgoraMetaKitBridge *instance = nil;
//    static dispatch_once_t onceToken;
//    dispatch_once(&onceToken, ^{
//        instance = [[AgoraMetaKitBridge alloc] init];
//    });
//    return instance;
//}
//
//- (instancetype)init {
//    if (self = [super init]) {
//        _metaKitEngine = [MetaKitEngine sharedInstance];
//        _metaKitEngine.delegate = self;
//    }
//    return self;
//}
//
//- (void)initializeMetaKit {
//    [self.metaKitEngine initialize];
//}
//
//- (void)destroyMetaKit {
//    [self.metaKitEngine destroy];
//    self.sceneView = nil;
//}
//
//- (UIView *)createSceneViewWithFrame:(CGRect)frame {
//    if (!self.sceneView) {
//        self.sceneView = [self.metaKitEngine createSceneView:frame];
//        [self.metaKitEngine addSceneView:self.sceneView];
//    }
//    return self.sceneView;
//}
//
//- (void)enableVideoFrameForView:(UIView *)view enable:(BOOL)enable {
//    [self.metaKitEngine enableVideoFrame:view enable:enable];
//}
//
//#pragma mark - MetaKitEngineDelegate
//
//- (void)onFrameResolved:(UIView *)view pixelBuffer:(CVPixelBufferRef)pixelBuffer {
//    // 处理视频帧回调
//}
//
//- (void)onReceiveMessage:(NSString *)key message:(NSString *)message {
//    // 处理接收到的消息
//    NSLog(@"Received message - Key: %@, Message: %@", key, message);
//}
//
//- (void)onErrorMessage:(NSString *)message {
//    // 处理错误消息
//    NSLog(@"MetaKit Error: %@", message);
//}
//
//- (void)onValueChange:(NSString *)key value:(id)value {
//    // 处理值变化
//    NSLog(@"Value changed - Key: %@, Value: %@", key, value);
//}
//
//@end
