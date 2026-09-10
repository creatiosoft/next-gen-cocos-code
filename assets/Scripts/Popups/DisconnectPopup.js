var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

/**
 * @classdesc 
 * @class DissconnectPopup
 * @extends PopUpBase
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {
        popUpHeading: {
            default: null,
            type: cc.Label,
        },
        infoLbl: {
            default: null,
            type: cc.Label,
        },
        code: {
            default: 0,
        },

        retryNode: {
            default: null,
            type: cc.Node,
        },

        simpleNode: {
            default: null,
            type: cc.Node,
        },

        quitNode: {
            default: null,
            type: cc.Node,
        },
    },

    /**
     * @description Method called from popUpManager to set initial view of this popUp using some data
     * @method onShow
     * @param {Object} data
     * @memberof Popups.DisconnectPopup#
     */
    onShow: function(data) {
        console.log("max disconnect", JSON.stringify(data));

        if (this.holdSessionPopup) {
            return;
        }
        this.preserveState = false;
        if (data != null) {
            this.code = data.code || 0;
            this.errorType = data.errorType || "";
            this.simpleNode.active = false;
            this.retryNode.active = true;
            this.quitNode.active = true;

            this.popUpHeading.string = "Connection lost!";
            this.infoLbl.string = "Please check your internet connection.";
            switch (this.code) {
                case 9999:
                    break;
                case 8888:
                    this.infoLbl.string = data.response;
                    this.popUpHeading.string = "Warning!";
                    this.simpleNode.active = true;
                    break;
                case 6666:
                case 3333:
                    break;
                case K.Error.TimeOutError:
                    break;
                case K.Error.ConnectionError:
                    break;
                case K.Error.SuccessFalseError:
                    break;
                case K.Error.KeyMissingBroadcasts:
                    break;
                case K.Error.PlayerSessionShiftedOnServer:
                    this.holdSessionPopup = true;
                    break;
                case K.Error.FeatureComingSoon:
                    break;
                case K.Error.ServerDown:
                    this.holdSessionPopup = true;
                    this.preserveState = data.preserveState;
                    break;

                case K.Error.SessionError:
                    this.retryNode.active = false;
                    this.simpleNode.active = true;
                    this.quitNode.active = false;
                    this.infoLbl.string = data.response;
                    this.errorType = K.Error.SessionError;
                    break;
                default:
                    break;
            }
        }
    },

    onLoad: function() {
        this.holdSessionPopup = false;
        this.preserveState = false;
    },
    /**
     * @description Called when enter button is clicked
     * @method onClickEnter
     * @memberof Popups.DisconnectPopup#
     */
    onClickEnter: function() {
    },

    onLogoutAfterSessionExpire:function() {
        GameManager.logoutAfterSessionExpire();
    },

    /**
     * @description Cancel button callback
     * @method onCancel
     * @memberof Popups.DisconnectPopup#
     */
    onCancel: function() {
        GameManager.logout();
    },

    /**
     * @description Hides disconnect popUp
     * @method onIgnore
     * @memberof Popups.DisconnectPopup#
     */
    onIgnore: function() {
        //console.log("onIgnore function called");
        GameManager.playSound(K.Sounds.click);
        GameManager.popUpManager.remove(PopUpType.DisconnectDialog, function() {});

        if (this.errorType == K.Error.UpdateAvailable) {

            if (GameManager.isMobile) {
                cc.sys.openURL(K.ServerAddress.update_Required_URL);
            } else {
                GameManager.logout();
            }
        }

        if (this.errorType == 9999 || this.errorType == 3333) {
            if (this.holdSessionPopup) {
                this.holdSessionPopup = false;
            }
            GameManager.logout3();
            return;
        }

        if (this.errorType == K.Error.SessionError) {
            if (this.holdSessionPopup) {
                this.holdSessionPopup = false;
            }
            // GameManager.logout();

            GameManager.popUpManager.hideAllPopUps();

            cc.systemEvent.emit("leaveLobby");

            cc.sys.localStorage.removeItem("tx_auto_login_token");
            cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
            cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
            cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
            cc.sys.localStorage.removeItem("tx_auto_login_username");

            ScreenManager.showScreen(K.ScreenEnum.LoginScreen, false, function() {
                // socketIO.socket.disconnect();
                if (((!(cc.sys.os === cc.sys.OS_WINDOWS)) || cc.sys.isBrowser) && !!self) {
                    ServerCom.inGame = true;
                    // self.close();
                }
            });
            return;
        }

        if (this.holdSessionPopup && !this.preserveState) {

            this.holdSessionPopup = false;

            if (GameManager.isMobile) {
                GameManager.logout();
            } else {
                // cc.game.end();
                GameManager.logout();

            }
        }

        if (this.holdSessionPopup) {
            this.holdSessionPopup = false;
        }
        if (this.code == K.Error.SessionError) {
            window.location.reload();
        }

        if (this.code == 9999) {
            GameManager.logout();
        }
    },

    onDownload: function() {
        //console.log("onIgnore function called");
        GameManager.playSound(K.Sounds.click);
        GameManager.popUpManager.remove(PopUpType.DisconnectDialog, function() {});
        cc.sys.openURL("https://metamask.io/download/");
    },

    onWhite: function() {
        //console.log("onIgnore function called");
        GameManager.playSound(K.Sounds.click);
        GameManager.popUpManager.remove(PopUpType.DisconnectDialog, function() {});
        // window.location.reload();
        GameManager.logout();
    },


    /**
     * @description Calls for logout internally
     * @method onRetryCancel
     * @memberof Popups.DisconnectPopup#
     */
    onRetryCancel: function() {
        GameManager.popUpManager.remove(PopUpType.DisconnectDialog, function() {});
        cc.sys.localStorage.removeItem("tx_auto_login_token");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
        cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_username");
        GameManager.logout();
    },

    /**
     * @description Retry for login again in case of disconnection
     * @method onRetry
     * @memberof Popups.DisconnectPopup#
     */
    onRetry: function() {
        GameManager.popUpManager.remove(PopUpType.DisconnectDialog, function() {});
        socketIO.socket.removeAllListeners();
        socketIO.socket.disconnect();
        ServerCom.socketIOConnectAfterDisconnection();
    }

});