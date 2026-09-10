var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
var SliderTouchType = require('SliderTouch');
// var CheckBoxType = require('Checkbox');
var EditBoxType = require('CustomEditBox');
var UtilEditBoxType = require('EditBoxUtil');
var SetPlayerValData = require('PostTypes').SetPlayerValData;

/**
 * @classdesc Manages Buyin popup
 * @class BuyInPopup
 * @memberof Popups
 */
var Advancefilter = cc.Class({
    extends: PopUpBase,

    properties: {
        minStake: {
            default: null,
            type: cc.EditBox,
        },
        maxStake: {
            default: null,
            type: cc.EditBox,
        },
        buyInUltraLow: {
            default: null,
            type: cc.Node,
        },
        buyInLow: {
            default: null,
            type: cc.Node,
        },
        buyInMedium: {
            default: null,
            type: cc.Node,
        },
        buyInHigh: {
            default: null,
            type: cc.Node,
        },
        player2: {
            default: null,
            type: cc.Node,
        },
        player3: {
            default: null,
            type: cc.Node,
        },
        player4: {
            default: null,
            type: cc.Node,
        },
        player5: {
            default: null,
            type: cc.Node,
        },
        player6: {
            default: null,
            type: cc.Node,
        },
        player7: {
            default: null,
            type: cc.Node,
        },
        player8: {
            default: null,
            type: cc.Node,
        },
        player9: {
            default: null,
            type: cc.Node,
        },
        rit: {
            default: null,
            type: cc.Node,
        },
        noLimit: {
            default: null,
            type: cc.Node,
        },
        limit: {
            default: null,
            type: cc.Node,
        },
        activeSprite: {
            default: null,
            type: cc.SpriteFrame,
        },
        inactiveSprite: {
            default: null,
            type: cc.SpriteFrame,
        },
        activeColor: {
            default: new cc.Color(),
        },
        inactiveColor: {
            default: new cc.Color(),
        },
    },
    statics: {
        config: {
            "stakes": {
                "min": "",
                "max": ""
            },
            "players": {
                "2": false,
                "3": false,
                "4": false,
                "5": false,
                "6": false,
                "7": false,
                "8": false,
                "9": false,
            },
            "buyin": {
                "UltraLow": false,
                "Low": false,
                "Medium": false,
                "High": false,
            },
            "format": {
                "rit": false
            },
            "limit": {
                "NoLimit": false,
                "PotLimit": false
            },
            "enabled": false
        }
    },

    onDestroy: function () {
    },

    onEnable: function () {
    },

    onLoad: function () {
    },

    onPlayers: function(event, msg) {
        if (Advancefilter.config.players[msg] == true) {
            Advancefilter.config.players[msg] = false;
        }
        else {
            Advancefilter.config.players[msg] = true;
        }
        this.updateFilters();
    },

    onBuyin: function(event, msg) {
        if (Advancefilter.config.buyin[msg] == true) {
            Advancefilter.config.buyin[msg] = false;
        }
        else {
            Advancefilter.config.buyin[msg] = true;
        }
        this.updateFilters();
    },

    onFormat: function(event, msg) {
        if (Advancefilter.config.format[msg] == true) {
            Advancefilter.config.format[msg] = false;
        }
        else {
            Advancefilter.config.format[msg] = true;
        }
        this.updateFilters();
    },

    onLimitTypes: function(event, msg) {
        if (Advancefilter.config.limit[msg] == true) {
            Advancefilter.config.limit[msg] = false;
        }
        else {
            Advancefilter.config.limit[msg] = true;
        }
        this.updateFilters();
    },

    onMin: function() {
        Advancefilter.config.stakes.min = this.minStake.string;
    },

    onMax: function() {
        Advancefilter.config.stakes.max = this.maxStake.string;
    },
    
    onShow: function (data) {
        this.updateFilters();
    },

    updateFilters() {
        this.minStake.string = Advancefilter.config.stakes.min;
        this.maxStake.string = Advancefilter.config.stakes.max;
        // 
        if (Advancefilter.config.buyin.UltraLow) {
            this.setActiveButton(this.buyInUltraLow);
        }
        else {
            this.setInActiveButton(this.buyInUltraLow);
        }
        if (Advancefilter.config.buyin.Low) {
            this.setActiveButton(this.buyInLow);
        }
        else {
            this.setInActiveButton(this.buyInLow);
        }
        if (Advancefilter.config.buyin.Medium) {
            this.setActiveButton(this.buyInMedium);
        }
        else {
            this.setInActiveButton(this.buyInMedium);
        }
        if (Advancefilter.config.buyin.High) {
            this.setActiveButton(this.buyInHigh);
        }
        else {
            this.setInActiveButton(this.buyInHigh);
        }
        // 
        if (Advancefilter.config.players["2"]) {
            this.setActiveButton(this.player2);
        }
        else {
            this.setInActiveButton(this.player2);
        }
        if (Advancefilter.config.players["3"]) {
            this.setActiveButton(this.player3);
        }
        else {
            this.setInActiveButton(this.player3);
        }
        if (Advancefilter.config.players["4"]) {
            this.setActiveButton(this.player4);
        }
        else {
            this.setInActiveButton(this.player4);
        }
        if (Advancefilter.config.players["5"]) {
            this.setActiveButton(this.player5);
        }
        else {
            this.setInActiveButton(this.player5);
        }
        if (Advancefilter.config.players["6"]) {
            this.setActiveButton(this.player6);
        }
        else {
            this.setInActiveButton(this.player6);
        }
        if (Advancefilter.config.players["7"]) {
            this.setActiveButton(this.player7);
        }
        else {
            this.setInActiveButton(this.player7);
        }
        if (Advancefilter.config.players["8"]) {
            this.setActiveButton(this.player8);
        }
        else {
            this.setInActiveButton(this.player8);
        }
        if (Advancefilter.config.players["9"]) {
            this.setActiveButton(this.player9);
        }
        else {
            this.setInActiveButton(this.player9);
        }
        // 
        if (Advancefilter.config.format.rit) {
            this.setActiveButton(this.rit);
        }
        else {
            this.setInActiveButton(this.rit);
        }
        // 
        
        if (Advancefilter.config.limit.NoLimit) {
            this.setActiveButton(this.noLimit);
        }
        else {
            this.setInActiveButton(this.noLimit);
        }
        if (Advancefilter.config.limit.PotLimit) {
            this.setActiveButton(this.limit);
        }
        else {
            this.setInActiveButton(this.limit);
        }
    },

    setActiveButton: function (currBtn) {
        // currBtn.getChildByName("scaler").getChildByName("base").getComponent(cc.Sprite).spriteFrame = this.activeSprite;
        // currBtn.getChildByName("scaler").getChildByName("New Node").color = this.activeColor;

        currBtn.getChildByName("scaler").getChildByName("off").active = false;
        // currBtn.getChildByName("scaler").getChildByName("New Node copy").active = false;
        currBtn.getChildByName("scaler").getChildByName("on").active = true;
    },

    setInActiveButton: function (currBtn) {
        // currBtn.getChildByName("scaler").getChildByName("base").getComponent(cc.Sprite).spriteFrame = this.inactiveSprite;
        // currBtn.getChildByName("scaler").getChildByName("New Node").color = this.inactiveColor;

        currBtn.getChildByName("scaler").getChildByName("off").active = true;
        // currBtn.getChildByName("scaler").getChildByName("New Node copy").active = true;
        currBtn.getChildByName("scaler").getChildByName("on").active = false;
    },

    onClearAll: function (data) {
        Advancefilter.config = {
            "stakes": {
                "min": "",
                "max": ""
            },
            "players": {
                "2": false,
                "3": false,
                "4": false,
                "5": false,
                "6": false,
                "7": false,
                "8": false,
                "9": false,
            },
            "buyin": {
                "UltraLow": false,
                "Low": false,
                "Medium": false,
                "High": false,
            },
            "format": {
                "rit": false
            },
            "limit": {
                "NoLimit": false,
                "PotLimit": false
            },
            "enabled": false
        };
        this.updateFilters();
    },

    onApply: function () {
        // var inst = this;
        // ServerCom.pomeloRequest("connector.entryHandler.getLobbyTables", {
        //     minimun: 10,
        //     maximun: 200,
        //     buyIn: "Medium",
        //     maxPlayers: 9,
        //     format: true,
        //     limitTypes: false,
        //     isRealMoney: true,
        //     channelVariation: "All",
        //     playerId: GameManager.user.playerId,
        //     isLoggedIn: true,
        //     access_token: K.Token.access_token
        // }, function (response) {
        //     console.log("getLobbyTables", response);
        // }, null, 5000, false);

        if (Advancefilter.config.players["2"] == false &&
            Advancefilter.config.players["3"] == false &&
            Advancefilter.config.players["4"] == false &&
            Advancefilter.config.players["5"] == false &&
            Advancefilter.config.players["6"] == false &&
            Advancefilter.config.players["7"] == false &&
            Advancefilter.config.players["8"] == false &&
            Advancefilter.config.players["9"] == false &&
            Advancefilter.config.buyin["UltraLow"] == false &&
            Advancefilter.config.buyin["Low"] == false &&
            Advancefilter.config.buyin["Medium"] == false &&
            Advancefilter.config.buyin["High"] == false &&
            Advancefilter.config.format["rit"] == false &&
            Advancefilter.config.limit["NoLimit"] == false &&
            Advancefilter.config.limit["PotLimit"] == false &&
            Advancefilter.config.stakes["min"] == '' &&
            Advancefilter.config.stakes["max"] == '') {
            Advancefilter.config.enabled = false;
        }
        else {
            Advancefilter.config.enabled = true;
        }

        GameManager.emit("AdvancefilterUpdated");
        this.node.active = false;
    },

    onClose: function () {
        this.node.active = false;
    },

});



