var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        content: {
            default: null,
            type: cc.Label
        }
    },

    onShow: function (data) {
        GameManager.emit("disablePageView");
        this.pokerPresenter = data.pokerPresenter;
        this.content.string = data.info;
    },

    onClose: function (data) {
        GameManager.emit("enablePageView");
        this.closeSelf();
    },

    onLeave: function (data) {
        GameManager.emit("enablePageView");
        this.pokerPresenter.getComponent("PokerPresenter").leaveTable();
        this.closeSelf();
    }
});
