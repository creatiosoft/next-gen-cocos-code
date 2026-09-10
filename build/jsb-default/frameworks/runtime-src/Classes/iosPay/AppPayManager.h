#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <StoreKit/StoreKit.h>


@interface AppPayManager : NSObject<SKPaymentTransactionObserver,SKProductsRequestDelegate>
{
    NSString *orderID;
    NSString *orderPrice;    
}
@property (nonatomic,copy) NSString *currentProId;

+(AppPayManager*) sharedInstance;
-(void) createPay:(NSString*)payIndex tid:(NSString*)tid;
-(void) serverFinish:(NSString *)data;
- (void) addObserverIAP;
@end
