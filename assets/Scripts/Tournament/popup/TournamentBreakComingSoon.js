var K = require("GameConfig").K;
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
    },

    onShow:function (data) {
        this.scheduleOnce(function() {
            this.closeSelf();
        }, 3);
    },
});
