/**
 * @class ResponsesTypes
 * @classdesc Methods to set user and game data
 * @memberof DataFormats
 */

/**
 * @method user 
 * @param {Object} data -All the data related to user!!!
 * @memberof DataFormats.ResponseTypes#
 */
function user(data) {
    this.category = "DIAMOND";
    this.claimedFreeChipsAt = data.claimedFreeChipsAt;
    this.nextClaimBonusTime = data.nextClaimBonusTime;
    this.defaultTheme = data.defaultTheme || "";
    this.defaultCard = data.defaultCard || "";
    this.defaultGameBackground = data.defaultGameBackground || "";

    this.defaultTourCard = data.defaultTourCard || "";
    this.defaultTourGameBackground = data.defaultTourGameBackground || "";
    this.defaultTourTheme = data.defaultTourTheme || "";

    this.tableCountAllowed = data.tableCountAllowed || {
        "browser": 6,
        "phone": 2,
        "androidApp": 2,
        "iosApp": 2,
        "windows": 6,
        "mac": 6
    };

    var device = "";
    if (cc.sys.isBrowser) {
        device = "browser";
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            device = "androidApp";
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            device = "iosApp";
        } else if (cc.sys.os === cc.sys.OS_OSX) {

            device = "mac";
        }

    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        device = "androidApp";
    } else if (cc.sys.os === cc.sys.OS_IOS) {
        device = "iosApp";
    } else if (cc.sys.os === cc.sys.OS_WINDOWS) {
        device = "windows";
    } else if (cc.sys.os === cc.sys.OS_OSX) {
        device = "mac";
    }

    GameManager.maxTableCounts = 2;
    this.mobileNumber = data.mobileNumber;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.emailId = data.emailId;
    this.playerId = data.playerId;
    this.userName = data.userName;
    this.settings = data.settings || {};
    this.profileImage = data.profileImage;
    changeAvatar(this.profileImage, this);
    this.muteGameSound = data.settings.muteGameSound;
    GameManager.playMusic(!this.muteGameSound);
    this.runItTwice = (data.settings.runItTwice !== undefined && data.settings.runItTwice != null) ? data.settings.runItTwice : false;
    this.isMuckHand = (data.isMuckHand !== undefined && data.isMuckHand != null) ? data.isMuckHand : false;
    this.dealerChat = (data.settings.dealerChat !== undefined && data.settings.dealerChat != null) ? data.settings.dealerChat : true;
    this.playerChat = (data.settings.playerChat !== undefined && data.settings.playerChat != null) ? data.settings.playerChat : true;
    this.autoBuyIn = data.autoBuyIn;
    this.autoBuyInAmountInPercent = data.autoBuyInAmountInPercent;
    this.isEmailVerified = data.isEmailVerified;
    this.isMobileNumberVerified = data.isMobileNumberVerified;
    this.freeChips = data.freeChips;
    this.realChips = data.realChips;
    this.host = data.host;
    this.port = data.port;
    this.password = "";
    GameManager.isBB = data.settings.stackInBB;
    GameManager.scheduleOnce(function() {
        GameManager.emit("updateTableImage");
        GameManager.emit("updateTableBgImage");
    }, 0.3);
};

/**
 * @method changeAvatar 
 * @param {Object} avatarUrl
 * @param {Object} user
 * @memberof DataFormats.ResponseTypes#
 */
function changeAvatar(avatarUrl, user) {
    if (isNaN(avatarUrl) && isNaN(parseInt(avatarUrl)) && avatarUrl != "") {
        cc.loader.load(avatarUrl + "?w=125&h=125", function(err, tex) {
            if (!!err) {
                this.profileImage = Math.round(Math.random() * GameManager.avatarImages.length - 1);
                user.urlImg = GameManager.avatarImages[this.profileImage];
            } else {
                user.urlImg = new cc.SpriteFrame(tex);
            }
            GameManager.emit("image-loaded", user);
        });
    } else {
        if (!GameManager.avatarImages[avatarUrl]) {
            var randomIndex = Math.round(Math.random() * GameManager.avatarImages.length - 1);
            user.urlImg = GameManager.avatarImages[randomIndex];
        } else {
            user.urlImg = GameManager.avatarImages[avatarUrl];
        }

        GameManager.scheduleOnce(function() {
            GameManager.emit("image-loaded", user);
        }, 0.5);
    }
};



module.exports = {
    User: user,
    changeAvatar: changeAvatar
};