var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,
    properties: {
        info: {
            default: null,
            type: cc.Label
        },
    },


    onShow: function (info) {
        this.info.string = info;
    },

    onLoad: function () {
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.AccessRestrictedPopup, function () {});
        GameManager.logout();
    }

});