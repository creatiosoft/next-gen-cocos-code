var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
cc.Class({
    extends: PopUpBase,

    properties: {
        keyLabels: {
            default: [],
            type: cc.Label
        },

        valueLabels: {
            default: [],
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    onShow: function (data) {
        GameManager.emit("disablePageView");
        console.log(data);
        this.sound = data.playSound;
        let count = 0;
        // for (let key in data.info) {

        //     if (count < this.keyLabels.length) {
        //         this.keyLabels[count].string = key;
        //         this.valueLabels[count].string = data.info[key];
        //     }
        //     count++;
        // }

        data.info.info["Fees/Interval(mins.)"] = (data.info.billingConfig.feeAmount + "/" + data.info.billingConfig.intervalMinutes + " min");

        let properties = {
            "GameVariation" : "Game Variation",
            "ChipsType" : "Chips Type",
            "BuyIn" : "Buy-in",
            "Stakes" : "Stakes",
            "Fees/Interval(mins.)" : "Fees/Interval(mins.)",
            "TurnTime" : "Turn Timer",
            "MaxPlayers" : "Max Players",
            "Straddle" : "Straddle",
            "Anti-Banking" : "Anti-Banking Time",
        };
        for (let key in properties) {

            if (count < this.keyLabels.length && key.indexOf("Rake") == -1 && key.indexOf("Cap") == -1) {
                this.keyLabels[count].string = properties[key];
                this.valueLabels[count].string = data.info.info[key];
                count++;
            }
        }

        this.keyLabels.forEach((elem) => {
            if (elem.string == "keys") {
                elem.node.active = false;
            }
            else {
                 elem.node.active = true;   
            }
        });

        this.valueLabels.forEach((elem) => {
            if (elem.string == "values") {
                elem.node.active = false;
            }
            else {
                 elem.node.active = true;   
            }
        });
    },

    onQuit: function () {
        GameManager.emit("enablePageView");
        this.closeSelf(function () { });
        this.sound(K.Sounds.click)
        // GameManager.playSound(K.Sounds.click);
    }
}); 