var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var K = require("GameConfig").K;

cc.Class({
    extends: PopUpBase,

    properties: {
    },

    onClose: function() {
        this.pokerPresenter.getComponent("PokerPresenter").model.kickPlayerOutOfTheGame(this.pokerPresenter.getComponent("PokerPresenter").model);
        this.pokerPresenter.getComponent("PokerPresenter").leaveTable();
        this.closeSelf();
    },

    onShow:function (data) {
        this.data = data;
        this.pokerPresenter = data.pokerPresenter;
        cc.find('Title', this.node).getComponent(cc.Label).string = this.data.title;
        cc.find('Content', this.node).getComponent(cc.Label).string = this.data.content;
    },

});
