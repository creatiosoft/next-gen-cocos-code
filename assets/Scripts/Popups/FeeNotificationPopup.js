var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

/**
 * @classdesc
 * @class NotificationPopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {
        headerLbl: {
            default: null,
            type: cc.Label,
        },
        infoLbl: {
            default: null,
            type: cc.Label,
        },
        icon1: {
            default: null,
            type: cc.Node,
        },
        icon2: {
            default: null,
            type: cc.Node,
        },
        timer: 3,
    },

    /**
     * @description Method called from popUpManager to set initial view of this popUp using some data
     * @method onShow
     * @param {Object} data
     * @memberof Popups.NotificationPopup#
     */
    onShow: function (data) {
        // if (data != null) {
        //     this.infoLbl.string = data;
        // }

        // {
        //     "playerId": "70888096",
        //     "channelId": "697232db73b7530880f7e2a5",
        //     "event": "FEE_INFO",
        //     "feeAmount": 1.25,
        //     "info": "A table fee of $1.25 will be deducted at the start of the hand from your main balance.",
        //     "route": "seatFee"
        // }

        // FEE_INFO - Fee information sent when player sits at table and state is waiting.
        // FEE_CHARGED - Fee was successfully deducted from player's balance
        // FEE_WARNING_BALANCE - Warning before next fee deduction.
        // FEE_INSUFFICIENT_BALANCE - Player moved to observer mode due to insufficient balance.

        this.node.y = 200;

        if (data.event == "FEE_INFO") {
            this.headerLbl.string = "Table Fee Notice";
            this.infoLbl.string = data.info;
            this.icon1.active = true;
            this.icon2.active = false;
        }
        else if (data.event == "FEE_CHARGED") {
            this.headerLbl.string = "Table Fee Charged";
            this.infoLbl.string = data.info;
            this.icon1.active = true;
            this.icon2.active = false;
        }
        else if (data.event == "FEE_WARNING_BALANCE") {
            this.headerLbl.string = "Table Fee Reminder";
            this.infoLbl.string = data.info;
            this.icon1.active = false;
            this.icon2.active = true;
        }
        // else if (data.event == "FEE_INSUFFICIENT_BALANCE") {
        //     this.headerLbl.string = "Table Fee Notice";
        // }

        this.node.runAction(
            cc.sequence(
                cc.moveTo(0.5, new cc.Vec2(0, 185)),
                cc.delayTime(1.8),
                cc.moveTo(0.5, new cc.Vec2(0, 285))
            )
        );

        this.scheduleOnce(function () {
            this.onClose();
        }, this.timer);
    },

    /**
     * @description Cancel button callback
     * @method onClose
     * @memberof Popups.NotificationPopup#
     */
    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.FeeNotificationPopup, function () {
        });
    },

});