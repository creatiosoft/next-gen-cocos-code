var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

/**
 * @classdesc
 * @class MaxTablePopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {
    }, 

    /**
     * @description This is used for initialisation
     * @method onLoad
     * @memberof Popups.MaxTablePopup#
     */
    onLoad: function () {

    },

    /**
     * @description Method called from popUpManager to set initial view of this popUp using some data
     * @method onShow
     * @param {Object} data
     * @memberof Popups.MaxTablePopup#
     */
    onShow: function (data) {
    },

    /**
     * @description Exit button callback
     * @method onClickEnter
     * @memberof Popups.MaxTablePopup#
     */
    onClickEnter: function () {
       this.onExit();
    },

    /**
     * @description Cancel button callback
     * @method onExit
     * @memberof Popups.MaxTablePopup#
     */
    onExit: function () {
        GameManager.playSound(K.Sounds.click);
        GameManager.popUpManager.remove(PopUpType.MaxTablesJoinedPopup, function () {  });
    },

  

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
