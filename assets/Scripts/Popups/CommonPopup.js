var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

/**
 * @classdesc 
 * @class DissconnectPopup
 * @extends PopUpBase
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {

        title: {
            default: null,
            type: cc.Label,
        },

        label: {
            default: null,
            type: cc.Label,
        },
    },


    /**
     * @description Method called from popUpManager to set initial view of this popUp using some data
     * @method onShow
     * @param {Object} data
     * @memberof Popups.DisconnectPopup#
     */
    onShow: function (data) {
        console.log("onShow", data);
        this.title.string = data.title;
        this.label.string = data.content;
        this.callback = data.callback;
    },

    onLoad: function () {
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.CommonDialog, function () {});
        if (this.callback) {
            this.callback();
        }
    }

});