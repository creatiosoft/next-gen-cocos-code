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

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.AccountDeleteError, function () {});
    }

});