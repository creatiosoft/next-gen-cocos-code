/**
 * @classdesc Implementing custom input box for windows build.
 * @class CustomEditBox
 * @memberof Utilities
 * @extends EventEmitter
 */
var kbInput = null;
var mouseInput = null;
//var ref = null;
var blinks = null;
var Emitter = require('EventEmitter');
var CustomEditBox = cc.Class({
    extends: Emitter,
    properties: {
        displayLbl: {
            default: null,
            type: cc.Label,
        },
        cancelBtn: {
            default: null,
            type: cc.Node,
        },
        isNumeric: false,
        isPassword: false,
        pwd: "",
        isEmail: false,
        limit: 50,
      
        /**
         * so that listener is added only once even if the editor is clicked multiple times in scene.
         */
        isEditing: false,
        callbacks: [],
        callbacksMaxCheck: [],
        isSelected: false,
    },

    /**
     * @description Initialise components.
     * @method onLoad
     * @memberof Utilities.CustomEditBox#
     */
    onLoad: function onLoad() {
        this.rgstrKbInput();
        GameManager.on("registerInput", this.registerThisInput.bind(this));
        GameManager.on("posClicked", this.test.bind(this));
        this.cursorAdded = false;
        this.editorClicked = false;
        blinks = this.blink;
    },

    /**
     * @description Check for multiple references of editor in same screen.
     * @method registerThisInput
     * @param {Object} ref
     * @memberof Utilities.CustomEditBox#
     */
    registerThisInput: function registerThisInput(ref) {
        this.isSelected = ref == this;
    },

    /**
     * @description Called When Editor is Clicked.
     * @method onClick
     * @memberof Utilities.CustomEditBox#
     */
    onCLick: function onCLick() {
        this.editorClicked = true;
        this.schedule(blinks, 0.6, cc.macro.REPEAT_FOREVER, 0);
        GameManager.emit("registerInput", this);
    },



    /**
     * @description Blink for cusrsor character
     * @method blink
     * @memberof Utilities.CustomEditBox#
     */
    blink: function () {
        if (!this.removeCursor()) {
            this.displayLbl.string += "|";
            this.cursorAdded = true;
        }
    },

    /**
     * @description Blink for cusrsor character
     * @method blink
     * @memberof Utilities.CustomEditBox#
     */
    removeCursor: function () {
        if (this.cursorAdded) {
            this.displayLbl.string = this.displayLbl.string.slice(0, this.displayLbl.string.length - 1);//+ this.displayLbl.string.slice(x + 1, this.displayLbl.string.length);
            this.cursorAdded = false;
            return true;
        }
        return false;
    },

    /**
     * @description If a click is outside the editor, stop registering keyboard inputs.
     * @method test
     * @param {Object} point
     * @memberof Utilities.CustomEditBox#
     */
    test: function (point) {
        if (this.editorClicked) {
            var w = this.node.width, h = this.node.height;
            var rect = cc.rect(0, 0, w, h);
            var trans = this.node.getNodeToWorldTransform();
            cc._rectApplyAffineTransformIn(rect, trans);
            var left = point.x - rect.x, right = rect.x + rect.width - point.x, bottom = point.y - rect.y, top = rect.y + rect.height - point.y;
            if (left >= 0 && right >= 0 && top >= 0 && bottom >= 0) {
            }
            else {
                this.removeKbInput();
            }
        }
    },

    /**
     * @description Listen Keyboard input and update label according to input.
     * @method rgstrKbInput
     * @memberof Utilities.CustomEditBox#
     */
    rgstrKbInput: function rgstrKbInput() {
        if (!this.isEditing) {
            var inst = this;
            kbInput = cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function onKeyPressed(kcode, e) {
                    inst.removeCursor();
                    if (inst.isSelected) {
                        inst.isEditing = true;
                        var values = kcode.split('!+');
                        // If backspace or delete is pressed, slice last character.
                        if (values[1] == 'Backspace' || values[1] == 'Delete') {
                            var t = inst.displayLbl.string;
                            inst.displayLbl.string = t.toString().slice(0, t.length - 1);
                            if (inst.isPassword) {
                                inst.pwd = inst.pwd.slice(0, inst.pwd.length - 1);
                            }
                        }
                        // To avoid undesirable button input eg control,shift etc
                        else if (values[1].length < 2) {
                            if (inst.isNumeric) {
                                var patt = /[1-9]/;
                                if (inst.displayLbl.string.length > 0) {
                                    patt = /[0-9]/;
                                }
                                if (patt.test(values[1]) && inst.displayLbl.string.toString().length < inst.limit) {
                                    inst.displayLbl.string += values[1];
                                }
                                inst.onValueChange();
                            } else {
                                if (inst.isEmail && inst.displayLbl.string.toString().length < inst.limit) {
                                    inst.displayLbl.string += values[1];
                                } else if (inst.isPassword && inst.displayLbl.string.toString().length < inst.limit) {
                                    inst.displayLbl.string += "*";
                                    inst.pwd += values[1];
                                    //inst.onValueChange();
                                } else if (inst.displayLbl.string.toString().length < inst.limit) {
                                    inst.displayLbl.string += values[1];
                                }
                            }
                        } else if (values[1] == 'Enter') {
                            inst.removeKbInput();
                        }
                    }
                },
                // onKeyReleased: function onKeyReleased(kcode, e) {
                // }
            }, this.node);
        }
    },

    /**
     * @description
     * @method onValueChangeEnd
     * @memberof Utilities.CustomEditBox#
     */
    onValueChangeEnd: function onValueChangeEnd() {
        this.callbacks.forEach(function (callback) {
            if (callback != null || callback != undefined) {
                callback();
            }
        }, this);
    },

    /**
     * @description
     * @method registerCallbacksEnd
     * @memberof Utilities.CustomEditBox#
     */
    registerCallbacksEnd: function registerCallbacksEnd(callback) {
        if (callback != null || callback != undefined) {
            this.callbacks.push(callback);
        }
    },

    /**
      * @description Stop Registering keyboard inputs.
      * @method removeKbInput
      * @memberof Utilities.CustomEditBox#
      */
    removeKbInput: function removeKbInput() {
        this.removeCursor();
        this.cursorAdded = false;
        this.unschedule(blinks);
        this.isEditing = false;
        this.isSelected = false;
        this.onValueChangeEnd();
        this.editorClicked = false;
        // cc.eventManager.removeListener(kbInput);
    },

    /**
     * @description 
     * @method onValueChange
     * @memberof Utilities.CustomEditBox#
     */
    onValueChange: function onValueChange() {
        this.callbacksMaxCheck.forEach(function (callback) {
            if (callback != null || callback != undefined) {
                callback();
            }
        }, this);
    },

    /**
     * @description
     * @method registerCallbacks
     * @param {callback} callback
     * @memberof Utilities.CustomEditBox#
     */
    registerCallbacks: function registerCallbacks(callback) {
        if (callback != null || callback != undefined) {
            this.callbacksMaxCheck.push(callback);
        }
    },

    /**
     * @description
     * @method onDisable
     * @memberof Utilities.CustomEditBox#
     */
    onDisable: function onDisable() {
        this.isEditing = false;
        this.isSelected = false;
    },

    /**
     * @description 
     * @method getPassword
     * @memberof Utilities.CustomEditBox#
     */
    getPassword: function () {
        return this.pwd;
    },

    /**
     * @description 
     * @method setPassword
     * @param {String} psd
     * @memberof Utilities.CustomEditBox#
     */
    setPassword: function (psd) {
        this.pwd = psd;
    }

});