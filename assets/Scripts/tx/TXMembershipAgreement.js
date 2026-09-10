var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var TXMembershipAgreement = cc.Class({
    extends: PopUpBase,

    editor: {
        menu: 'tx/TXMembershipAgreement',
    },

    properties: {
        agreeToggle: {
            default: null,
            type: cc.Toggle,
        },
        acceptEnabledButton: {
            default: null,
            type: cc.Button,
        },
        acceptDisabledButton: {
            default: null,
            type: cc.Button,
        },
    },

    onLoad: function() {
        if (GameManager.isZFold()) {
            this.node.scale = 0.8;
        }
    },

    onShow: function(data) {
        this.data = data;
        this.agreeToggle.isChecked = false;
        this.acceptEnabledButton.node.active = false;
        this.acceptDisabledButton.node.active = true;
    },

    onClose: function() {
        GameManager.popUpManager.remove(PopUpType.TXMembershipAgreement);
    },

    onToggle: function() {
        if (this.agreeToggle.isChecked) {
            this.acceptEnabledButton.node.active = true;
            this.acceptDisabledButton.node.active = false;
        }
        else {
            this.acceptEnabledButton.node.active = false;
            this.acceptDisabledButton.node.active = true;
        }
    },

    onAccept: function() {
        this.acceptEnabledButton.interactable = false;
        GameManager.loginHandler.txAcceptMembershipAgreement((data) => {
            this.acceptEnabledButton.interactable = true;
            if (data.success) {
                GameManager.popUpManager.remove(PopUpType.TXMembershipAgreement);
                GameManager.popUpManager.show(PopUpType.TXTermsAndCondition, this.data);
            }
        }, () => {
            this.acceptEnabledButton.interactable = true;
        });
    },

});