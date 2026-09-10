/**
 * @class EditBoxUtil
 * @classdesc This utility handles edit box callbacks
 * @memberof Utilities
 */
cc.Class({
    extends: cc.Component,

    properties: {
        editBox: {
            default: null,
            type: cc.EditBox,
        },
        defaultString: {
            default: null,
            type: cc.Label,
        },
        default: {
            default: "",
        },
        // //numeric edit box not working so manually implementing
        isNumericOnly: false,
        isModifyLabel: false,//if to modify the label after editing is done and erase the edit value and copy to label 
        callbacks: [],
        callbacksMinCheck: [],//to set min value in label if edit box value is less thn minimum
    },
    onLoad: function(){
    //    console.log("this called...");
       if(!!this.defaultString && this.defaultString.string == ""){
           this.defaultString.string = this.default.string;
       }
    },

    /**
    * @description EditStarted callback
    * @method onEditStarted
    * @memberof Utilities.EditBoxUtil#
    */
    onEditStarted: function () {
        this.defaultString.string = "";
    },

    /**
    * @description TextChanged callback
    * @method onTextChanged
    * @memberof Utilities.EditBoxUtil#
    */
    onTextChanged: function () {
        // console.log("TEXT CHANGED CALLED ");
        if (this.isNumericOnly) {
            if (isNaN(this.editBox.string)) {
                var t = this.editBox.string;
                t = t.slice(0, t.length - 1);
                this.editBox.string = t;
            }
            else {
                /**
                 * to not allow spaces to be entered.
                 */
                this.editBox.string = this.editBox.string.toString().trim();
                /**
                 * isNaN accepts decimal, so to avoid it.
                 */
                var t = ".";
                if (this.editBox.string.indexOf(t) != -1) {
                    var x = this.editBox.string;
                    x = x.slice(0, x.length - 1);
                    this.editBox.string = x;
                }
                /**
                 * To not allow first character to be 0.
                 */
                var patt = /[1-9]/;
                if (this.editBox.string.length > 1) {
                    patt = /[0-9]/;
                }
                if (patt.test(this.editBox.string)) {
                } else {
                    var x = this.editBox.string;
                    x = x.slice(0, x.length - 1);
                    this.editBox.string = x;
                }
            }
            this.onValueChange();
        }
    },

    /**
    * @description EditEnd callback
    * @method onEditEnd
    * @memberof Utilities.EditBoxUtil#
    */
    onEditEnd: function () {
        if (this.editBox.string === "" && !!this.default) {
            this.defaultString.string = this.default;
        }
        else {
            if (this.isModifyLabel) {
                // this.editBox.node.setTag(this.editBox.string);
                this.defaultString.string = this.editBox.string;
                this.editBox.string = "";
            }
        }
        this.onValueChangeEnd();
    },

    /**
     * @description Value change callback 
     * @method onValueChange
     * @memberof Utilities.EditBoxUtil#
     */
    onValueChange: function () {
        this.callbacks.forEach(function (callback) {
            if (callback != null || callback != undefined) {
                callback();
            }
        }, this);
    },

    /**
     * @description Registers callback
     * @method registerCallbacks
     * @param {callback} callback
     * @memberof Utilities.EditBoxUtil#
     */
    registerCallbacks: function (callback) {
        if (callback != null || callback != undefined) {
            this.callbacks.push(callback);
        }
    },

    /**
     * @description Value change callback 
     * @method onValueChangeEnd
     * @memberof Utilities.EditBoxUtil#
     */
    onValueChangeEnd: function () {
        this.callbacksMinCheck.forEach(function (callback) {
            if (callback != null || callback != undefined) {
                callback();
            }
        }, this);
    },

    /**
     * @description Registers callback 
     * @method registerCallbacksEnd
     * @param {callback} callback -Callback to execute
     * @memberof Utilities.EditBoxUtil#
     */
    registerCallbacksEnd: function (callback) {
        if (callback != null || callback != undefined) {
            this.callbacksMinCheck.push(callback);
        }
    },


});
