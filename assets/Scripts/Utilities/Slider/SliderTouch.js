/**
 * @class SliderTouch
 * @classdesc This module handles slider touch and respective UI update
 */
cc.Class({
    extends: cc.Component,

    properties: {
        id: {
            default: 0,
            visible: false,
        },
        initValue: {
            default: 0,
        },
        knob: {
            default: null,
            type: cc.Node,
        },
        fillColor: {
            default: null,
            type: cc.Sprite,
        },
        width: {
            default: 0,
            visible: false,
        },
        value: {
            default: 0,
            visible: false,
        },
        progressBar: {
            default: null,
            type: cc.ProgressBar,
        },
        callback: {
            default: null,
            visible: false,
        },
        offset: 15,
    },

    // use this for initialization
    onLoad: function() {
    //     this.isMobile = (cc.sys.platform == cc.sys.MOBILE_BROWSER) || cc.sys.isMobile;
    //   //  this.isMobile = true;
    //     this.offset = this.isMobile && this.node.name == "TouchMat_Mobile" ? 40 : 15;
        this.width = this.node.width; // accomodate knob projection - set width accordingly in editor
        this.bound = this.width / 2;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            event.stopPropagation();
        }, this);


        this.setSliderValue(this.initValue);
    },


    /**
     * @description Touch Start event callback
     * @method onTouchStart
     * @param {Object} event -response of Touch
     * @memberof SliderTouch# 
     */
    onTouchStart: function(event) {

        var newVec2 = this.node.convertToNodeSpaceAR(event.getLocation());
        this.updateFill(newVec2.x);
        event.stopPropagation();
    },

    /**
     * @description Touch Move event callback
     * @method onTouchMove
     * @param {Object} event -response of Touch
     * @memberof SliderTouch# 
     */
    onTouchMove: function(event) {
        var newVec2 = this.node.convertToNodeSpaceAR(event.getLocation());
        this.updateFill(newVec2.x);
        event.stopPropagation();
    },

    /**
     * @description Updates slider UI based on touch position
     * @method updateFill
     * @param: {Object} value
     * @memberof SliderTouch# 
     */
    updateFill: function(value) {
        this.bound = this.width / 2;
        if (this.knob != null) {
            if (value > this.bound - this.offset) {
                this.knob.x=(this.bound - this.offset);
            } else if (value < -this.bound + this.offset) {
                this.knob.x=(-this.bound + this.offset);
            } else {
                this.knob.x=(value);
            }
        }

        value += this.bound;
        value = value / this.width;
        // this.fillColor.fillRange = value;
        this.progressBar.progress = value;
        this.value = value;
        if (this.callback !== null && this.callback !== undefined) {
            this.callback(value); // use generic event?
        }
    },

    /**
     * @description Set slider position/value
     * @method setSliderValue
     * @param {Number} value
     * @param {boolean} callback
     * @memberof SliderTouch# 
     */
    setSliderValue: function(value, callback = true) {
        this.bound = this.width / 2;
        if (value < 0) {
            this.progressBar.progress = 0;
            this.value = 0;
            value = 0;
        } else if (value > 1) {
            this.progressBar.progress = 1;
            this.value = 1;
            value = 1;
        } else {
            this.progressBar.progress = value;
            this.value = value;
        }

        if (callback && this.callback !== null && this.callback !== undefined) {
            this.callback(value); // use generic event?
        }

        value = value * this.width;
        value -= this.bound;
        if (this.knob != null) {
            if (value > this.bound - this.offset) {
                value = this.bound - this.offset;
            } else if (value < -this.bound + this.offset) {
                value = -this.bound + this.offset;
            }
            this.knob.x=(value);
        }
    },

    /**
     * @description Retuns slider's current value
     * @method getSliderValue
     * @returns {Number} 
     * @memberof SliderTouch# 
     */
    getSliderValue: function() {
        return this.value;
    },

    /**
     * @description Set onValueChange callback
     * @method registerCallback
     * @param {Object} func -callback function
     * @memberof SliderTouch# 
     */
    registerCallback: function(func) {
        this.callback = func;
    },

    /**
     * @description Remove all callback
     * @method removeAllCallbacks
     * @memberof SliderTouch# 
     */
    removeAllCallbacks: function() {
        this.callback = null;
    },
});