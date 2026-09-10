var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,
    properties: {
        toggle: {
            default: null,
            type: cc.Toggle,
        },
        enabledButton: {
            default: null,
            type: cc.Button,
        },
        disabledButton: {
            default: null,
            type: cc.Button,
        },
    },

    onShow: function(info) {
        this.toggle.isChecked = false;
        this.onToggle();
    },

    onLoad: function() {},

    onClose: function() {
        GameManager.popUpManager.remove(PopUpType.AccountDeleteConfirm, function() {});
    },

    onToggle: function() {
        if (this.toggle.isChecked) {
            this.enabledButton.node.active = true;
            this.disabledButton.node.active = false;
        } else {
            this.enabledButton.node.active = false;
            this.disabledButton.node.active = true;
        }
    },

    onDelete: function() {
        this.enabledButton.interactable = false;

        ServerCom.pomeloRequest("connector.entryHandler.checkPlayerOnTable", {
            playerId: GameManager.user.playerId
        }, (response) => {
            console.log(response);
            this.enabledButton.interactable = true;
            if (response.success) {
                if (response.isOnTable) {
                    GameManager.popUpManager.remove(PopUpType.AccountDeleteConfirm, function() {});
                    GameManager.popUpManager.show(PopUpType.AccountDeleteError, null, function() {});
                } else {
                    ServerCom.httpPostRequest(
                        K.ServerAddress.otp_server + "/api/users/deactivate-account",
                        {},
                        (result) => {
                            console.log(result);
                            if (result.success) {
                                GameManager.logout();
                                GameManager.delayShowDeleted();
                            }
                            else {

                            }
                        }
                    );
                }
            }
        }, null, 5000, false);
    },
});