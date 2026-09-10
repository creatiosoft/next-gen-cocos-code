/**
 * @classdesc Toggle class for toggle button!!
 * @class  Toggle
 * @memberof Utilities
 */
var isInsideSetting = false;
cc.Class({
    extends: cc.Component,

    properties: {
        state: false,
        defaultState: false,
        on: {
            default: null,
            type: cc.Node,
        },
        off: {
            default: null,
            type: cc.Node,
        },
        callbacks: [],
    
    },


    onLoad: function () {
        if (this.defaultState != this.state) {
            this.onToggle();
        }
    },
    /**
      * @description Used to toggle
      * @method onToggle
      * @memberof Utilities.Toggle#
      */
    onToggle: function () {
        this.state = !this.state;
        this.on.active = this.state;
        this.off.active = !this.state;
        this.callbacks.forEach(function (callback) {
            callback(this.state);
        }, this);
        if(!this.node.parent.parent.parent.parent.parent.parent.parent.name == "JohnnyMobilePokerModel"){
            GameManager.playSound(K.Sounds.click);

            this.isInsideSetting = true;
        }
        // this.isInsideSetting = true
        // console.log(this.isInsideSetting);

    },

    /**
      * @description Registers callback
      * @method registerCallback
      * @param {callback} callback
      * @memberof Utilities.Toggle#
      */
    registerCallback: function (callback) {
        this.callbacks.push(callback);
    },

    /**
      * @description Deregisters callback
      * @method deregisterCallback
      * @param {callback} callback
      * @memberof Utilities.Toggle#
      */

    deregisterCallback: function (callback) {
        var index = this.callbacks.indexOf(callback);
        this.callbacks.splice(index, 1);
    }

});