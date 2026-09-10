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
        infoLbl: {
            default: null,
            type: cc.Label,
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
        if (data != null) {
            this.infoLbl.string = data;
        }

        this.node.x = 0;
        this.node.y = cc.winSize.height / 2 + 100;

        this.node.runAction(
            cc.sequence(
                cc.moveBy(0.5, new cc.Vec2(0, -200)),
                cc.delayTime(1.8),
                cc.moveBy(0.5, new cc.Vec2(0, 180))
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
        GameManager.popUpManager.remove(PopUpType.NotificationPopup, function () {
        });
    },

});