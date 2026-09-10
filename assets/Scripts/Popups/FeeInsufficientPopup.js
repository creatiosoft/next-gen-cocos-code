var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,
    properties: {
    },

    onShow: function (info) {
    },

    onLoad: function () {
    },

    onDeposite: function () {
        GameManager.popUpManager.remove(PopUpType.FeeInsufficientPopup, function () {});
        // GameManager.emit("onToLobby");
        // GameManager.popUpManager.show(PopUpType.GamePreferencesPopup, 1, function () { });
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.FeeInsufficientPopup, function () {});
    }

});