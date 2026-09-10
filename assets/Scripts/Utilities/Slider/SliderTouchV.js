/**
 * @class SliderTouchV
 * @classdesc This module handles slider touch and respective UI update
 */
cc.Class({
    extends: require('./SliderTouch'),

    properties: {
        id: {
            default: 0,
            visible: false,
            override: true
        },
        initValue: {
            default: 0,
            override: true
        },
        knob: {
            default: null,
            type: cc.Node,
            override: true
        },
        fillColor: {
            default: null,
            type: cc.Sprite,
            override: true
        },
        width: {
            default: 0,
            visible: false,
            override: true
        },
        value: {
            default: 0,
            visible: false,
            override: true
        },
        progressBar: {
            default: null,
            type: cc.ProgressBar,
            override: true
        },
        callback: {
            default: null,
            visible: false,
            override: true
        },
    },

    // use this for initialization
    onLoad: function() {
    //     this.isMobile = (cc.sys.platform == cc.sys.MOBILE_BROWSER) || cc.sys.isMobile;
    //   //  this.isMobile = true;
    //     this.offset = this.isMobile && this.node.name == "TouchMat_Mobile" ? 40 : 15;
        this.height = this.node.height; // accomodate knob projection - set width accordingly in editor
        this.bound = this.height / 2;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            event.stopPropagation();
        }, this);


        this.offset = 0;
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
        this.updateFill(newVec2.y);
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
        this.updateFill(newVec2.y);
        event.stopPropagation();
    },

    /**
     * @description Updates slider UI based on touch position
     * @method updateFill
     * @param: {Object} value
     * @memberof SliderTouch# 
     */
    updateFill: function(value) {
        this.bound = this.height / 2;
        if (this.knob != null) {
            if (value > this.bound - this.offset) {
                this.knob.y=(this.bound - this.offset) + this.node.height / 2;
            } else if (value < -this.bound + this.offset) {
                this.knob.y=(-this.bound + this.offset) + this.node.height / 2;
            } else {
                this.knob.y=(value) + this.node.height / 2;
            }
        }

        value += this.bound;
        value = value / this.height;
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
    setSliderValue: function(value, callback = true, round=false) {
        this.bound = this.height / 2;
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
            this.callback(value,round); // use generic event?
        }

        value = value * this.height;
        value -= this.bound;
        if (this.knob != null) {
            if (value > this.bound - this.offset) {
                value = this.bound - this.offset;
            } else if (value < -this.bound + this.offset) {
                value = -this.bound + this.offset;
            }
            this.knob.y=(value) + this.node.height / 2;
        }
    },

    setSliderValue2: function(value, callback = true, round=false) {
        this.bound = this.height / 2;
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
            this.callback(value,round); // use generic event?
        }

        value = value * this.height;
        value -= this.bound;
        if (this.knob != null) {
            if (value > this.bound - this.offset) {
                value = this.bound - this.offset;
            } else if (value < -this.bound + this.offset) {
                value = -this.bound + this.offset;
            }
            this.knob.y=(value) + this.node.height / 2;
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