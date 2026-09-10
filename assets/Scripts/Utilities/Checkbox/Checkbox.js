/**
 * @classdesc CheckBox class used to manage the checkBoxes and corresponding call.
 * @class Checkbox
 * @memberof Utilities
 */
var Checkbox = cc.Class({
    extends: cc.Component,

    properties: {
        tickNode: {
            default: null,
            type: cc.Node,
        },
        isSelected: {
            default: false,
            visible: false,
        },
        initValue: {
            default: false,
        },
        group: {
            default: [],
            type: cc.Node,
        },
        callbackNode: {
            default: null,
            type: cc.Node,
        },
        callbackComponent: {
            default: "",
        },
        callbacks: {
            default: [],
            visible: false,
        },
        valForced: {
            visible: false,
            default: false,
        },
    },
    onLoad: function () {
        this.isSelected = this.initValue;
    },


    start: function () {
        if (!this.valForced)
            this.setSelection(this.initValue);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    /**
     * @description Handle checkbox click callback
     * @method onClick
     * @memberof Utilities.Checkbox#
     */
    onClick: function () {
        // this.playAudio(K.Sounds.click);
        if (this.isSelected) {
            this.isSelected = false;
            this.tickNode.active = false;
        }
        else {
            this.isSelected = true;
            this.tickNode.active = true;
        }
        this.updateGroup(this.isSelected);
        this.onValueChange();
    },
    /**
     * @description AddListener
     * @method registerCallback
     * @param {callback} callback
     * @memberof Utilities.Checkbox# 
     */

    registerCallback: function (callback) {
        this.callbacks.push(callback);
    },

    /**
     * @description Remove listener
     * @method deregisterCallback
     * @param {callback} callback
     * @memberof Utilities.Checkbox#
     */
    deregisterCallback: function (callback) {
        var i = this.callbacks.indexOf(callback);
        this.callbacks.splice(i, 1);
    },

    /**
     * @description Morphs behaviour into radio buttons in a group
     * @method updateGroup
     * @param {boolean} value -To Active Deactive radio Button
     * @memberof Utilities.Checkbox#
     */
    updateGroup: function (value) {
        if (this.group.length > 0) {
            if (value) {
                this.group.forEach(function (element) {
                    element.getComponent('Checkbox').setSelection(!value);
                }, this);
            }
            else {
                this.isSelected = true;
                this.tickNode.active = true;
            }
        }
    },

    /**
     * @description Value change callback
     * @method onValueChange
     * @param {boolean} value -To Active Deactive radio Button 
     * @memberof Utilities.Checkbox#
     */
    onValueChange: function (value) {
        if (this.callbackNode !== null) {
            this.callbackNode.getComponent(this.callbackComponent).onValueChange();
        }
        // if(this.callback !== null && this.prevSelection !== undefined)
        // {
        //     callback(value); // use generic event?
        // }
        if (this.callbacks.length > 0) {
            this.callbacks.forEach(function (callback) {
                callback(this.tickNode);
            }, this);
        }
    },

    /**
     * @description Set selection - initialization
     * @method setSelection
     * @param {boolean} value -To Active Deactive Tick
     * @memberof Utilities.Checkbox#
    */
    setSelection: function (value) {
        this.valForced = true;
        this.isSelected = !!value;
        this.tickNode.active = !!value;
    },

    /**
     * @description Retuns the current state - user selection
     * @method getSelection
     * @memberof Utilities.Checkbox#
    */
    getSelection: function () {
        return this.isSelected;
    },
});
