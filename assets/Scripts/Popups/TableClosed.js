var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        pokerPresenter: {
            default: null,
            type: cc.Node,
            visible: false
        }
    },

    onShow: function (data) {
        GameManager.emit("disablePageView");
        this.pokerPresenter = data;
    },

    onClose: function (data) {
        GameManager.emit("enablePageView");
        this.pokerPresenter.getComponent("PokerPresenter").onTableCloseLeave();
        this.closeSelf();
    },
});
