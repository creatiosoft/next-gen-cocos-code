/**
 * @namespace Utilities.ScreensAndPopUps
 */
var emitter = require('EventEmitter');
var PopUpManager = require('PopUpManager').PopUpManager;
/**
 * @classdesc Base Class for All Pop Ups
 * @class PopUpBase
 * @memberof Utilities.ScreensAndPopUps.PopUps
 * @extends EventEmitter
 */
cc.Class({
    extends: emitter,

    properties: {
        data: {
            default: null,
            visible: false,
        },
        popUpManager: {
            default: null,
            type: PopUpManager,
            visible: false,
        },
    },

    onLoad: function() {

    },

    /**
     * Close this instance only. Use for showIn table-scoped panels so
     * table A does not close table B's copy of the same PopUpType.
     */
    closeSelf: function(callback) {
        if (this.popUpManager && this._popupType != null) {
            this.popUpManager.remove(this._popupType, callback, this._popupHost);
        }
    },

    hideSelf: function(callback) {
        if (this.popUpManager && this._popupType != null) {
            this.popUpManager.hide(this._popupType, callback, this._popupHost);
        }
    },

    onShow: function(data) {
        this.data = data;
    },

    onHide: function() {

    },
    onButtonClickEvent: function() {

    },
    onDestroy: function() {

    },
    onClickEnter : function(){
        
    },
   
});