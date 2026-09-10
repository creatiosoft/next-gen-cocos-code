var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,
    properties: {
        message: {
            default: null,
            type: cc.Label
        },
    },

    onShow: function (info) {
        this.message.string = info;
    },

    onLoad: function () {
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.AccountDeletedLoginError, function () {});
    }

});