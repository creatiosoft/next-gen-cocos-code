var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
var CheckBoxType = require('Checkbox');
var JoinSimilar = require('PostTypes').JoinSimilar;
var Toggle = require('Toggle');
var gameScreen = require('GameScreen');
var pokerModel = require('PokerModel').PokerModel;
var Checkbox = require('Checkbox');

/**
 * @classdesc 
 * @class InGamePreferencesPopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {

        soundToggle: {
            default: null,
            type: Toggle,
        },
        vibrationToggle: {
            default: null,
            type: Toggle,
        },
        muckHandCheckbox: {
            default: null,
            type: Checkbox
        },

        handSToggle: {
            default: null,
            type: Toggle,
        },

        BBToggle: {
            default: null,
            type: Toggle,
        },

        squeezeCards: {
            default: null,
            type: Toggle,
        },

        smartFocusToggle: {
            default: null,
            type: cc.Toggle,
        },
    },

    onLoad: function () {
        this.muckHandCheckbox.registerCallback(this.onMuckHand.bind(this));
    },

    /**
     * @description Manage default states of buttons in popup.
     * @method onShow
     * @param {Object} data
     * @memberof Popups.InGamePreferencesPopup#
     */
    onShow: function (data) {
        //  console.error('ONSHOW', data);
        this.pokerPresenter = data;
        this.activeModel = this.pokerPresenter.getComponent("PokerPresenter").model.getComponent('PokerModel');

        if (GameManager.user.settings.muteGameSound == this.soundToggle.state) {
            this.soundToggle.onToggle();
        }

        if (GameManager.user.settings.vibration !== this.vibrationToggle.state) {
            this.vibrationToggle.onToggle();
        }

        if (GameManager.user.isMuckHand) {
            this.muckHandCheckbox.setSelection(true);
        } else {
            this.muckHandCheckbox.setSelection(false);
        }

        if (GameManager.user.settings.stackInBB !== this.BBToggle.state) {
            this.BBToggle.onToggle();
        }

        if (GameManager.user.settings.handStrength !== this.handSToggle.state) {
            this.handSToggle.onToggle();
        }
        
        if (GameManager.user.settings.cardSqueeze !== this.squeezeCards.state) {
            this.squeezeCards.onToggle();
        }

        if (K.SmartFocus != this.smartFocusToggle.isChecked) {
            this.smartFocusToggle.isChecked = K.SmartFocus;
        }

        this.muckHandCheckbox.setSelection(GameManager.user.isMuckHand);

        var myPlayer = this.pokerPresenter.getComponent("PokerPresenter").getMyPlayer();
        var isSittingOut = myPlayer && myPlayer.state == K.PlayerState.OnBreak;

        this.muckHandCheckbox.node.parent.active = false;
        if (this.pokerPresenter.getComponent("PokerPresenter").muckHand) {
            this.muckHandCheckbox.node.parent.active = true;
        }

        GameManager.emit("disablePageView");
    },

   
    onToggleSound: function () {

        var data = {};
        data.channelId = this.activeModel.gameData.channelId;
        data.playerId = GameManager.user.playerId;
        data.key = 'muteGameSound';
        if (!GameManager.user.settings.muteGameSound) {
            GameManager.playSound(K.Sounds.click);
        }
        // GameManager.user.settings.muteGameSound = !GameManager.user.settings.muteGameSound;

        GameManager.user.settings.muteGameSound = !GameManager.user.settings.muteGameSound;

        // console.log("val changed from", GameManager.user.settings.muteGameSound, "to", !GameManager.user.settings.muteGameSound);
        data.value = GameManager.user.settings.muteGameSound;
        // if (GameManager.user.settings.muteGameSound) {
        //     cc.audioEngine.stopAll();
        // }
        // GameManager.playMusic(!GameManager.user.settings.muteGameSound);
        ServerCom.pomeloRequest(K.PomeloAPI.updateTableSettings, data, function (data) {
            if (data.success) {} else {}
        }.bind(this), null, 5000, false);
        // GameManager.playSound(K.Sounds.click);

    },

    onToggleVibration: function () {

        if (!GameManager.user.settings.muteGameSound) {
            GameManager.playSound(K.Sounds.click);
        }
        GameManager.user.settings.vibration = !GameManager.user.settings.vibration;
        GameManager.changeVibration(GameManager.user.settings.vibration, () => {

        });
    },

    /**
     * @description Toggle Muck Hand and update player settings.
     * @method onToggleMuckHand
     * @memberof Popups.InGamePreferencesPopup#
     */
    onToggleMuckHand: function () {

        var data = {};
        data.channelId = this.activeModel.gameData.channelId;
        data.playerId = GameManager.user.playerId;
        data.key = 'isMuckHand';
        data.value = this.muckHandToggle.state;
        ServerCom.pomeloRequest(K.PomeloAPI.updateTableSettings, data, function (response) {
            if (response.success) {
                this.activeModel.gameData.settings.isMuckHand = !this.activeModel.gameData.settings.isMuckHand;
            } else {
                this.muckHandToggle.onToggle();
            }
        }.bind(this), null, 5000, false);
        // GameManager.playSound(K.Sounds.click);


    },

    /**
     * @description Cancel button callback
     * @method onSettingsClose
     * @memberof Popups.InGamePreferencesPopup#
     */
    onSettingsClose: function () {
        if (!this.activeModel.gameData.settings.muteGameSound) {
            GameManager.playSound(K.Sounds.click);
        }
        GameManager.emit("enablePageView");
        this.closeSelf();
        // GameManager.playSound(K.Sounds.click);

    },

    
    onToggleHandS: function () {

        this.handSToggle.node.getComponent(cc.Button).interactable = false;

        var data = {};
        data.playerId = GameManager.user.playerId;
        data.handStrength = this.handSToggle.state;
        data.access_token = K.Token.access_token;
        data.isLoggedIn = true;
        ServerCom.pomeloRequest('connector.entryHandler.changeHandStrength', data, function (response) {
            this.handSToggle.node.getComponent(cc.Button).interactable = true;
            if (response.success) {
                GameManager.user.settings.handStrength = !GameManager.user.settings.handStrength;

                if (GameManager.user.settings.handStrength) {
                    GameManager.popUpManager.show(PopUpType.NotificationPopup, "Hand strength feature will be applied from the next hand.", function () { });
                }
                else {
                    GameManager.emit("handStrengthOff");
                }
            } else {
                this.handSToggle.onToggle();
            }
        }.bind(this), null, 5000, false);


    },

    onToggleBB: function () {

        this.BBToggle.node.getComponent(cc.Button).interactable = false;
        var data = {};
        // data.channelId = this.activeModel.gameData.channelId;
        data.playerId = GameManager.user.playerId;
        // data.handStrength = 'isMuckHand';
        data.stackInBB = this.BBToggle.state;
        data.access_token = K.Token.access_token;
        data.isLoggedIn = true;
        ServerCom.pomeloRequest('connector.entryHandler.changeStackInBB', data, function (response) {
            this.BBToggle.node.getComponent(cc.Button).interactable = true;
            if (response.success) {
                GameManager.user.settings.stackInBB = !GameManager.user.settings.stackInBB;
                GameManager.isBB = GameManager.user.settings.stackInBB;
                GameManager.emit("switchBB");
            } else {
                this.BBToggle.onToggle();
            }
        }.bind(this), null, 5000, false);
        // GameManager.playSound(K.Sounds.click);



    },

    onToggleSqueezeCards: function () {
        var data = {};
        data.playerId = GameManager.user.playerId;
        data.cardSqueeze = this.squeezeCards.state;
        data.access_token = K.Token.access_token;
        data.isLoggedIn = true;
        ServerCom.pomeloRequest('connector.entryHandler.changeCardSqueeze', data, function (response) {

            GameManager.user.settings.cardSqueeze = !GameManager.user.settings.cardSqueeze;

            if (this.squeezeCards.state) {
                GameManager.emit("SQUEEZE_CARDS_ON");
            }
            else {
                GameManager.emit("SQUEEZE_CARDS_OFF");
            }

        }.bind(this), null, 5000, false);
    },

    handleSmartFocus(event){

        this.smartFocusToggle.interactable = false;
        var data = {};
        data.playerId = GameManager.user.playerId;
        data.smartFocus = event.isChecked;
        data.access_token = K.Token.access_token;
        data.isLoggedIn = true;
        ServerCom.pomeloRequest('connector.entryHandler.changeSmartFocus', data, function (response) {
            K.SmartFocus = GameManager.user.settings.smartFocus = !K.SmartFocus;

            this.smartFocusToggle.interactable = true;
        }.bind(this), null, 5000, false);

    },

    onMuckHand: function () {
        var selection = this.muckHandCheckbox.getSelection();
        this.activeModel.setMuckHand(selection, function (response) {
            if (response.success) {
                this.muckHandCheckbox.setSelection(selection);
            } else {
                this.muckHandCheckbox.setSelection(!selection);
            }
        }.bind(this));
    },
});
