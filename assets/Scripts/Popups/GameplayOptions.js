var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
var Checkbox = require('Checkbox');

cc.Class({
    extends: PopUpBase,
    properties: {

        sitOutNextHandCheckBox: {
            default: null,
            type: Checkbox,
        },

        straddleCheckBox: {
            default: null,
            type: Checkbox,
        },

        leaveNextHandTag: {
            default: null,
            type: cc.Node,
        },

        leaveBtn: {
            default: null,
            type: cc.Button,
        },

        gameDetails: {
            default: null,
            type: cc.Node,
        },

    },


    onShow: function (data) {
        this.pokerPresenter = data.pokerPresenter;
        this.updateSitOutNextHandCheckBox(data.sitOutNextHandCheckBox);
        this.setSelectionSitOutNextHandCheckBox(data.sitOutNextHandCheckBoxSelection);
        this.updateStraddleCheckBox(data.straddleCheckBox);
        this.setSelectionStraddleCheckBox(data.straddleCheckBoxSelection);
        this.leaveNextHandTag.active = data.leaveNextHandTag;

        this.sitOutNextHandCheckBox.registerCallback(this.onSitOutNextHand.bind(this));
        this.straddleCheckBox.registerCallback(this.onStraddle.bind(this));

        if (this.pokerPresenter.getComponent("PokerPresenter").isTournament()) {
            this.leaveBtn.node.active = false;
            this.gameDetails.active = false;
        } else {
            this.leaveBtn.node.active = true;
            this.gameDetails.active = true;
        }
    },

    onClose: function () {
        this.closeSelf();
    },

    // 
    onLobby: function () {
        this.onClose();
        this.pokerPresenter.getComponent("PokerPresenter").onLobby();
    },

    onInfoBtn: function () {
        this.onClose();
        this.pokerPresenter.getComponent("PokerPresenter").onInfoBtn();
    },

    onChangeTheme: function () {
        this.onClose();
        this.pokerPresenter.getComponent("PokerPresenter").onChangeTheme();
    },

    onSettingsBtn: function () {
        this.onClose();
        this.pokerPresenter.getComponent("PokerPresenter").onSettingsBtn();
    },

    OnLeaveJohny: function () {
        this.onClose();
        this.pokerPresenter.getComponent("PokerPresenter").OnLeaveJohny();
    },

    onSitOutNextHand: function () {
        this.onClose();
        this.pokerPresenter.getComponent("PokerPresenter").onSitOutNextHand();
    },
    
    onStraddle: function () {
        var selection = this.straddleCheckBox.getSelection();
        this.pokerPresenter.getComponent("PokerPresenter").onStraddle(selection);
        this.onClose();
    },

    updateSitOutNextHandCheckBox: function(val) {
        this.sitOutNextHandCheckBox.node.parent.active = val;
    },

    setSelectionSitOutNextHandCheckBox: function(val) {
        this.sitOutNextHandCheckBox.setSelection(val);
    },

    updateStraddleCheckBox: function(val) {
        this.straddleCheckBox.node.parent.active = val;
    },

    setSelectionStraddleCheckBox: function(val) {
        this.straddleCheckBox.setSelection(val);
    },

});




