#import "AppPayManager.h"
#import "cocos2d.h"
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"

@implementation AppPayManager

static AppPayManager* _sharedInstance = nil;

+(AppPayManager*)sharedInstance
{
    @synchronized([AppPayManager class])
    {
        if (!_sharedInstance)
        {
            [[self alloc] init];
            NSLog(@"app pay init");
            [_sharedInstance addObserverIAP];
            
        }
        
        
        return _sharedInstance;
    }
    return nil;
}

+(id)alloc
{
    @synchronized([AppPayManager class])
    {
        NSAssert(_sharedInstance == nil, @"Attempted to allocate a second instance of a singleton.\n");
        _sharedInstance = [super alloc];
        return _sharedInstance;
    }
    return nil;
}

- (void) addObserverIAP
{
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
}

- (void)createPay:(NSString*)payIndex tid:(NSString*)tid
{
    NSString* product = [NSString stringWithFormat:@"%@", payIndex];
    _currentProId = product;
    self->orderPrice = @"0";
    self->orderID = [[NSString alloc] initWithString: tid];
    if([SKPaymentQueue canMakePayments]){
        [self requestProductData:product];
    }else{
        NSLog(@"!!createPay");
    }
}

- (void)requestProductData:(NSString *)type{
    NSLog(@"-------------requestProductData----------------");
    NSArray *product = [[NSArray alloc] initWithObjects:type,nil];
    NSSet *nsset = [NSSet setWithArray:product];
    SKProductsRequest *request = [[SKProductsRequest alloc] initWithProductIdentifiers:nsset];
    request.delegate = self;
    [request start];
    
}

- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response{
    
    NSLog(@"--------------didReceiveResponse---------------------");
    NSArray *product = response.products;
    if([product count] == 0){
        NSLog(@"--------------[product count] == 0------------------");
        return;
    }
    
    NSLog(@"productID:%@", response.invalidProductIdentifiers);
    NSLog(@"[product count] == :%lu",(unsigned long)[product count]);
    
    SKProduct *p = nil;
    for (SKProduct *pro in product) {
        NSLog(@"%@", [pro description]);
        NSLog(@"%@", [pro localizedTitle]);
        NSLog(@"%@", [pro localizedDescription]);
        NSLog(@"price = %@", [pro price]);
        NSLog(@"%@", [pro productIdentifier]);
        
        if([pro.productIdentifier isEqualToString:_currentProId]){
            p = pro;
        }
    }
    
    if (p != nil)
    {
        SKMutablePayment* payment = [SKMutablePayment paymentWithProduct:p];
        payment.applicationUsername = self->orderID;
        self->orderPrice = p.price.description;
        [[SKPaymentQueue defaultQueue] addPayment:payment];
    }
}

- (void)request:(SKRequest *)request didFailWithError:(NSError *)error{
    NSString* func = [NSString stringWithFormat:@"0,%@", self->orderID];
    [self hideLoading];
    NSLog(@"------------------error-----------------:%@", error);
}

- (void)requestDidFinish:(SKRequest *)request{
    NSLog(@"------------requestDidFinish-----------------");
}

#define SANDBOX @"https://sandbox.itunes.apple.com/verifyReceipt"
#define AppStore @"https://buy.itunes.apple.com/verifyReceipt"

-(void)verifyPurchaseWithPaymentTransaction: (NSString*) orderID transactions:(SKPaymentTransaction *)transaction
{
    NSURL *receiptUrl=[[NSBundle mainBundle] appStoreReceiptURL];
    NSData *receiptData=[NSData dataWithContentsOfURL:receiptUrl];
    NSString *receiptString=[receiptData base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
    NSString *bodyString = [NSString stringWithFormat:@"{\"receipt-data\" : \"%@\"}", receiptString];
    NSData *bodyData = [bodyString dataUsingEncoding:NSUTF8StringEncoding];
    NSLog(@"OC >> receiptString = %@", receiptString);
    
    NSString * str = [[NSString alloc]initWithData:transaction.transactionReceipt encoding:NSUTF8StringEncoding];
    NSString *environment = [self environmentForReceipt:str];
    NSURL *StoreURL = nil;
    if ([environment isEqualToString:@"environment=Sandbox"]) {
        StoreURL= [[NSURL alloc] initWithString: @"https://sandbox.itunes.apple.com/verifyReceipt"];
    } else {
        StoreURL= [[NSURL alloc] initWithString: @"https://buy.itunes.apple.com/verifyReceipt"];
    }
    NSLog(@"verifyPurchaseWithPaymentTransaction %@", StoreURL);
    NSMutableURLRequest *requestM=[NSMutableURLRequest requestWithURL:StoreURL];
    requestM.HTTPBody=bodyData;
    requestM.HTTPMethod=@"POST";
    NSError *error=nil;
    NSData *responseData=[NSURLConnection sendSynchronousRequest:requestM returningResponse:nil error:&error];
    if (error) {
        NSLog(@"verifyPurchaseWithPaymentTransaction error: %@",error.localizedDescription);
        return;
    }
    NSDictionary *dic=[NSJSONSerialization JSONObjectWithData:responseData options:NSJSONReadingAllowFragments error:nil];
    NSLog(@"%@",dic);
    if([dic[@"status"] intValue]==0){
        NSLog(@"transaction:%@,orderID:%@",transaction.transactionIdentifier, orderID);
        for (NSString *key in dic.allKeys ) {
            NSLog(@"all key dic :key:%@, value:%@", key, [dic objectForKey:key]);
        }
        
        NSDictionary *dicReceipt= dic[@"receipt"];
        NSDictionary *dicInApp=[dicReceipt[@"in_app"] firstObject];
                for (NSString *key in dicInApp.allKeys ) {
                    NSLog(@"111 all key dic :key:%@, value:%@", key, [dicInApp objectForKey:key]);
                }
        NSString *productIdentifier= dicInApp[@"product_id"];
        NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
        NSLog(@"productIdentifier！%@",productIdentifier);
        if ([productIdentifier isEqualToString:orderID]) {
            int purchasedCount=[defaults integerForKey:productIdentifier];
             NSLog(@"productIdentifier count！%d",purchasedCount);
            [[NSUserDefaults standardUserDefaults] setInteger:(purchasedCount+1) forKey:productIdentifier];
        }else{
            [defaults setBool:YES forKey:productIdentifier];
        }
        NSString* func = [NSString stringWithFormat:@"1,%@,%@,%@,%@", orderID,transaction.transactionIdentifier, receiptString, self->orderPrice];
        [self sendPayResult:func];
    }else{
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        NSString* func = [NSString stringWithFormat:@"0,%@,%@,%@,%@", orderID,transaction.transactionIdentifier, receiptString, self->orderPrice];

    }
}


- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transaction
{
    for(SKPaymentTransaction *tran in transaction) {
        switch (tran.transactionState) {
            case SKPaymentTransactionStatePurchased:{
                if (tran.payment.applicationUsername != nil) {
                    NSString *orderID = [[NSString alloc] initWithString: tran.payment.applicationUsername];
                    NSLog(@"paymentQueue = %@",orderID);
                    [self verifyPurchaseWithPaymentTransaction:orderID transactions:tran];
//                    [[SKPaymentQueue defaultQueue] finishTransaction:tran];//test
                }
            }
                break;
            case SKPaymentTransactionStatePurchasing:
                NSLog(@"SKPaymentTransactionStatePurchasing");
                break;
            case SKPaymentTransactionStateRestored:{
                NSLog(@"SKPaymentTransactionStateRestored");
                [[SKPaymentQueue defaultQueue] finishTransaction:tran];
            }
                break;
            case SKPaymentTransactionStateFailed:{
                NSLog(@"SKPaymentTransactionStateFailed");
                NSString *orderID = nil;
                if (tran.payment.applicationUsername != nil) {
                    orderID = [[NSString alloc] initWithString: tran.payment.applicationUsername];
                }
                NSString* func = [NSString stringWithFormat:@"0,%@,%@", orderID,tran.transactionIdentifier];
                [[SKPaymentQueue defaultQueue] finishTransaction:tran];
            }
                break;
            default:
                break;
        }
    }
}


-(NSString * )environmentForReceipt:(NSString * )str
{
    str= [str stringByReplacingOccurrencesOfString:@"\r\n" withString:@""];
    
    str = [str stringByReplacingOccurrencesOfString:@"\n" withString:@""];
    
    str = [str stringByReplacingOccurrencesOfString:@"\t" withString:@""];
    
    str=[str stringByReplacingOccurrencesOfString:@" " withString:@""];
    
    str=[str stringByReplacingOccurrencesOfString:@"\"" withString:@""];
    
    NSArray * arr=[str componentsSeparatedByString:@";"];
    
    NSString * environment=arr[2];
    return environment;
}

-(void) serverFinish:(NSString *)data
{
    NSLog(@"app pay finish：%@", data);
    for(SKPaymentTransaction *tran in [[SKPaymentQueue defaultQueue] transactions]) {
        if(tran.transactionState){
            if (tran.payment.applicationUsername != nil) {
//                NSString *orderID = [[NSString alloc] initWithString: tran.payment.applicationUsername];
                NSString *orderID = [[NSString alloc] initWithString: tran.transactionIdentifier];
                if([data isEqualToString:orderID]){
                    [self hideLoading];
                    [[SKPaymentQueue defaultQueue] finishTransaction:tran];
                    break;
                }
            }
        }
    }
}

- (void)completeTransaction:(SKPaymentTransaction *)transaction
{
    NSLog(@"completeTransaction");
    [self hideLoading];
    [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
}

- (void) hideLoading
{
}

- (void)sendPayResult:(NSString *)data
{
    NSLog(@"sendPayResult %@", data);
    NSString *bodyString = [NSString stringWithFormat:@"cc.onRewardPurchase('%@');", self->orderID];
    se::ScriptEngine::getInstance()->evalString(bodyString.UTF8String);
}

- (void)dealloc
{
    NSLog(@"app pay dealloc");
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
    [super dealloc];
}

@end
