/**
 * @namespace Utilities.DropDowns
 */
/**
 * @classdesc DropDown.js manages dropDown in Project.
 * @class DropDown
 * @memberof Utilities.DropDowns
 */
cc.Class({
    extends: cc.Component,

    properties: {
        optionLabel: {
            default: null,
            type: cc.Label,
        },
        optionColor: {
            default: null,
            type: cc.Node,
        },
        prevSelection: {
            default: null,
        },
        callback: {
            default: null,
        },
        original: {
            default: null,
            type: cc.Node,
        },
        contentHolder: {
            default: null,
            type: cc.Node,
        },
        isColor: {
            default: false,
        }
    },

    /**
     * @description use this for initialization
     * @method onLoad
     * @memberof Utilities.DropDowns.DropDown#
     */ 
    onLoad: function() {
        if (this.contentHolder.children.length > 0) {
            this.showDefault();
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    /*
     * Button click callback 
     * 
     */
    onClick: function() {
        GameManager.playSound(K.Sounds.click);
        // Dummy as of now
    },
    
/**
 * @description reset label String
 * @method reset
 * @memberof Utilities.DropDowns.DropDown#
 */
    reset: function() {
        if (!this.isColor) {
            this.optionLabel.string = "";
        }
    },
/**
 * @description shows the default value in dropdonw label
 * @method showDefatuls
 * @param {boolean} isApplicable -Boolean value for validation
 * @memberof Utilities.DropDowns.DropDown#
 */
    showDefault: function (isApplicable = true) {
     this.reset();

        if (isApplicable) {
            if (this.prevSelection !== null && this.prevSelection.node != null) {
                this.onOptionSelect(this.prevSelection);
            } else {
                var c = this.contentHolder.children[0];
                if (c != undefined) {
                    var obj = {
                        option: this.isColor ? c.children[0].color : c.getComponentInChildren(cc.Label).string,
                        node: c,
                    };
                    this.onOptionSelect(obj);
                } else {
                    this.reset();
                }
            }
        }
    },

    /**
     * @description Sets the color of the row
     * @method setColor
     * @param {Object} color
     * @param {callback} invokeCallBack
     * @memberof Utilities.DropDowns.DropDown#
     */
    setColor: function(color, invokeCallBack) {
        for (var i = 0; i < this.contentHolder.children.length; i++) {
            // this.contentHolder.children.forEach(function(element) {
            var element = this.contentHolder.children[i].children[0];
            if (element.color.r == color.r && element.color.g == color.g && element.color.b == color.b) {
                var obj = {
                    option: color,
                    node: element,
                };
                if (invokeCallBack) {
                    this.onOptionSelect(obj);
                } else {
                    this.optionColor.color = object.option;
                    this.prevSelection = object; // object.node;
                }
            }
        }
    },

    /**
     * @description Option selection callback
     * @method onOptionSelect
     * @param {Object} object -Object having color/String values;
     * @memberof Utilities.DropDowns.DropDown#
     */
    onOptionSelect: function(object) {
        if (this.isColor)
            this.optionColor.color = object.option;
        else
            this.optionLabel.string = object.option;
        this.prevSelection = object; // object.node;
        if (this.callback !== null && this.prevSelection.node !== undefined) {
            this.callback(object.option); // use generic event?
        }
    },

    /**
     * @description Set the contents of the dropdown dynamically
     * @method setContent 
     * @param {Object} setContent  - array of string
     * @param {boolean} apply 
     * @memberof Utilities.DropDowns.DropDown#
     */
    setContent: function(content, apply = true) {
        this.unscheduleAllCallbacks();
        this.contentHolder.parent.parent.scaleY = 0.001;
        this.contentHolder.parent.parent.opacity = 0;

        this.clearContent();
        // content.forEach(function (element) {
        //     // clone content, add parent 
        //     var newContent = this.createContent(element);
        //     newContent.active = true;
        //     this.contentHolder.addChild(newContent);
        // }, this);
        var i = 0;
        var newContent = null;
        for (i = 0; i < content.length; i++) {
            newContent = this.createContent(content[i]);
            newContent.active = true;
            this.contentHolder.addChild(newContent);
        }

        this.scheduleOnce(function() {
            this.contentHolder.parent.parent.scaleY = 0;
            this.contentHolder.parent.parent.opacity = 255;
        }.bind(this), 0.5);
        // if (i == content.length) {
        //     this.contentHolder.parent.parent.scaleY = 0;
        // }
        if (i == content.length && i > 0) {
            this.showDefault(apply);
        }
    },

    /**
     * @description Clears the existing contents/options of the dropdown
     * @method clearContent
     * @memberof Utilities.DropDowns.DropDown#
     * 
     */
    clearContent: function() {
        var childs = this.contentHolder.children;
        // GameManager.removeAllChildren(this.contentHolder);
        this.contentHolder.removeAllChildren();
        this.reset();
        // childs.forEach(function (element) {
        //     element.destroy();
        // }, this);
    },

    /**
     * @description Creates clones of original content and returns the instance
     * @method createContent
     * @param {String} name -name of option!
     * @return  {Object} 
     * @memberof Utilities.DropDowns.DropDown#
     */
    createContent: function(name) {
        // instantitate, set label string & return instance
        var instance = cc.instantiate(this.original);
        var sa = typeof name;
        if (this.isColor) {
            instance.getComponent('DropDownOption').setOptionColor(name);
        } else {
            instance.getComponent('DropDownOption').setOptionLabel(name);
        }
        return instance;
    },

    /**
     * @description Set onValueChange callback
     * @method registerCallback
     * @param {callback} func
     * @memberof Utilities.DropDowns.DropDown#
     */
    registerCallback: function(func) {
        this.callback = func;
    },

    /**
     * @description Remove all callback
     * @method removeAllCallbacks
     * @memberof Utilities.DropDowns.DropDown#
     */
    removeAllCallbacks: function() {
        this.callback = null;
    },

    /**
     * @description Retuns current selection in drop down list - string
     * @method getSelection
     * @memberof Utilities.DropDowns.DropDown#
     */
    getSelection: function() {
        return this.isColor ? this.optionColor.color : this.optionLabel.string;
    },

});