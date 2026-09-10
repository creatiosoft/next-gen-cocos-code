cc.Class({
    extends: cc.Component,

    properties: {
        longPressThreshold: 1.0, // Duration in seconds for a long press

        normalCallback: null,
        longpressCallback: null,
        pressEndCallback: null,
    },

    onLoad() {
        this._isPressing = false;
        this._pressStartTime = 0;

        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    },

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    },

    _onTouchStart(event) {
        this._isPressing = true;
        this._pressStartTime = Date.now();

        this.scheduleOnce(() => {
            if (this._isPressing) {
                this._onLongPress();
                this._isPressing = false; // Prevent further processing as a normal press
            }
        }, this.longPressThreshold);
    },

    _onTouchEnd(event) {
        if (this._isPressing) {
            const pressDuration = (Date.now() - this._pressStartTime) / 1000; // Convert to seconds
            if (pressDuration < this.longPressThreshold) {
                this._onNormalPress();
            }
        }
        this._isPressing = false; // Reset pressing state

        if (this.pressEndCallback) {
            this.pressEndCallback();
        }
    },

    _onTouchCancel(event) {
        this._isPressing = false; // Reset pressing state
        if (this.pressEndCallback) {
            this.pressEndCallback();
        }
    },

    _onLongPress() {
        cc.log('Long press detected');
        // Add your long press behavior here
        
        if (this.longpressCallback) {
            this.longpressCallback();
        }
    },

    _onNormalPress() {
        cc.log('Normal press detected');
        // Add your normal press behavior here
        if (this.normalCallback) {
            this.normalCallback();
        }
    },
});
