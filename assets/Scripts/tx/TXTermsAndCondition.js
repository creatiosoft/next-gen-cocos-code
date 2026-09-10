var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var TXTermsAndCondition = cc.Class({
    extends: PopUpBase,

    editor: {
        menu: 'tx/TXTermsAndCondition',
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

    onShow: function (data) {
        this.data = data;
        this.agreeToggle.isChecked = false;
        this.acceptEnabledButton.node.active = false;
        this.acceptDisabledButton.node.active = true;
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.TXTermsAndCondition);
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
        GameManager.loginHandler.txAcceptTermsAndConditions((data) => {
            this.acceptEnabledButton.interactable = true;
            if (data.success) {
                // if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
                if (cc.sys.isNative) {
                    let txLoginNode = GameManager.popUpManager.getPopupNode(PopUpType.TXLogin);
                    if (txLoginNode) {
                        txLoginNode.getComponent("TXLogin").doKYC(this.data);
                    }
                }
                else {
                    let txLoginNode = GameManager.popUpManager.getPopupNode(PopUpType.TXLogin);
                    if (txLoginNode) {
                        txLoginNode.getComponent("TXLogin").doLogin(cc.sys.localStorage.getItem('txUserName'), K.KYC.password);
                    }
                }
                GameManager.popUpManager.remove(PopUpType.TXTermsAndCondition);
            }
        }, () => {
            this.acceptEnabledButton.interactable = true;
        });
    },

});
