/** 
  * @classdesc Handles individual DropDown options
  * @class DropDownOption
  * @memberof Utilities.DropDowns
  */
var DropDown = require('DropDown');
var DropList = require('DropList');

cc.Class({
    extends: cc.Component,

    properties: {
        dropDownRef: {
            default: null,
            type: DropDown,
        },
        dropListRef: {
            default: null,
            type: DropList,
        },
        label: {
            default: null,
            type: cc.Label,
        },
    },

    /** @description Used for initializations
      * @method onLoad
      * @memberof Utilities.DropDowns.DropDownOption#
      */
    onLoad: function () {
        this.label = this.node.getComponentInChildren(cc.Label);
        this.setMouseEventListeners();
        this.node.color = new cc.Color(36, 36, 36);
    },

    /**
    * @description Adds event listeners for mouse enter & leave
    * @method setMouseEventListeners
    * @memberof Utilities.DropDowns.DropDownOption#
    */
    setMouseEventListeners: function () {
        this.node.on('mouseenter', function (event) {
            this.node.color = new cc.Color(167, 24, 25);
        }, this);

        this.node.on('mouseleave', function (event) {
            this.node.color = new cc.Color(36, 36, 36);
        }, this);
    },

    /**
    * @description Button click callback
    * @method onClick
    * @memberof Utilities.DropDowns.DropDownOption#
    */
    onClick: function () {
        // set the selected option in drop down
        var obj = {
            option: (this.dropDownRef.isColor) ? this.node.children[0].color : this.label.string,
            node: this.node,
        };
        this.dropDownRef.onOptionSelect(obj);
        this.dropListRef.popOut();
    },

    /**
    * @description Set the label - options
    * @method setOptionLabel
    * @param {string} name
    * @memberof Utilities.DropDowns.DropDownOption#
    */
    setOptionLabel: function (name) {
        if (this.label === null) {
            this.label = this.node.getComponentInChildren(cc.Label);
        }
        this.label.string = name;
    },


    /**
   * @description Set the color - options
   * @method setOptionColor
   * @param {string} color
   * @memberof Utilities.DropDowns.DropDownOption#
   */
    setOptionColor: function (color) {

        this.node.children[0].color = color;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
