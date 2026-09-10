var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
    },

    onShow: function (data) {
        GameManager.emit("disablePageView");
        this.pokerPresenter = data;
    },

    onClose: function (data) {
        GameManager.emit("enablePageView");
        this.closeSelf();
    },

    onFold: function (data) {
        GameManager.emit("enablePageView");
        this.pokerPresenter.getComponent("PokerPresenter").onFold(null, 'confirmAction');
        this.closeSelf();
    },

    onCheck: function (data) {
        GameManager.emit("enablePageView");
        this.pokerPresenter.getComponent("PokerPresenter").onCheck();
        this.closeSelf();
    },
});
