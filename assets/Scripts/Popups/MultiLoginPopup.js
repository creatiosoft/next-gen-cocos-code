var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

/**
 * @classdesc
 * @class MultiLoginPopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    /**
     * @description 
     * @method onOk
     * @memberof Popups.MultiLoginPopup#
     */

    onOk: function () {
        GameManager.popUpManager.remove(PopUpType.MultiLoginPopup, function () {
            // this.disconnectAndOpenLoginScreen();
            GameManager.logout3();
        }.bind(this));
        GameManager.playSound(K.Sounds.click);

    },

    /**
     * @description 
     * @method onSingleLogin
     * @memberof Popups.MultiLoginPopup#
     */
    onSingleLogin: function () {
        // LoginHandler.singleLogin(function (response) {
        //    this.onOk();
        // }.bind(this), function (error) {
        //    this.onOk();
        // }.bind(this));
        // GameManager.playSound(K.Sounds.click);

    },

    /**
     * @description 
     * @method disconnectAndOpenLoginScreen
     * @memberof Popups.MultiLoginPopup#
     */
    disconnectAndOpenLoginScreen: function () {
        // ScreenManager.showScreen(K.ScreenEnum.LoginScreen, 10, function () {
        // }, false);
        // K.disconnectRequestedByPlayer = true;
        // // pomelo.disconnect();
        // setTimeout(function () {
        //     LoginHandler.startPomelo(K.ServerAddress.gameServer, K.ServerAddress.gamePort);
        // }, 100);
    },
});