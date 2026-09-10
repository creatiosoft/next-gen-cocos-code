var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var TXForgotPassword = cc.Class({
    extends: PopUpBase,

    editor: {
        menu: 'tx/TXForgotPassword',
    },

    properties: {
        txReSendOTPButton: {
            default: null,
            type: cc.Button,
        },
        txOTPLabel1: {
            default: null,
            type: cc.Label,
        },
        txOTPLabel2: {
            default: null,
            type: cc.Label,
        },
        finishPopup: {
            default: null,
            type: cc.Node,
        },
        step1: {
            default: null,
            type: cc.Node,
        },
        step2: {
            default: null,
            type: cc.Node,
        },
        step3: {
            default: null,
            type: cc.Node,
        },
        txErrorMessageStep1: {
            default: null,
            type: cc.Label,
        },
        txErrorMessageStep2: {
            default: null,
            type: cc.Label,
        },
        txErrorMessageStep3: {
            default: null,
            type: cc.Label,
        },
        txOTPDebug: {
            default: null,
            type: cc.Label,
        },
        txEmailId: {
            default: null,
            type: cc.EditBox,
        },
        txPassword: {
            default: null,
            type: cc.EditBox,
        },
        txConfirmPassword: {
            default: null,
            type: cc.EditBox,
        },
        txOptNumber: {
            default: null,
            type: cc.EditBox,
        },
        txVerifyOTPButton: {
            default: null,
            type: cc.Button,
        },
        txSendOTPButton: {
            default: null,
            type: cc.Button,
        },
        txChangePasswordButton: {
            default: null,
            type: cc.Button,
        },
        txEmailIdHead: {
            default: null,
            type: cc.Label,
        },
        txOTPLabelExp: {
            default: null,
            type: cc.Label,
        },
    },

    onLoad: function() {
        if (GameManager.isZFold()) {
            this.node.scale = 0.8;
        }

        this.token = "";
    },

    onShow: function() {
        this.token = "";
        this.txEmailIdHead.string = "";
        this.step1.active = true;
        this.step2.active = false;
        this.step3.active = false;
        this.txErrorMessageStep1.string = "";
        this.txErrorMessageStep2.string = "";
        this.txErrorMessageStep3.string = "";
        this.txOTPLabelExp.string = ""
        this.finishPopup.active = false;
        this.txOTPDebug.string = "";
        this.txEmailId.string = "";
        this.txPassword.string = "";
        this.txConfirmPassword.string = "";
        this.txOptNumber.string = "";
        this.txEmailId.node.getChildByName("red").active = false;
        this.txOptNumber.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;
        this.txConfirmPassword.node.getChildByName("red").active = false;
    },

    onClose: function() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
        if (this.otpExpTimer) {
            clearInterval(this.otpExpTimer);
        }
        GameManager.popUpManager.remove(PopUpType.TXForgotPassword);
    },

    onCheckSendOTP: function() {
        this.txSendOTPButton.interactable = false;
        if (this.txEmailId.string === "") {
            return;
        }
        this.txSendOTPButton.interactable = true;
    },

    onCheckVerifyOTP: function() {
        this.txVerifyOTPButton.interactable = false;
        if (this.txOptNumber.string === "") {
            return;
        }
        this.txVerifyOTPButton.interactable = true;
    },

    onCheckChangePassword: function() {
        this.txChangePasswordButton.interactable = false;
        if (this.txPassword.string === "") {
            return;
        }
        if (this.txConfirmPassword.string === "") {
            return;
        }
        this.txChangePasswordButton.interactable = true;
    },

    formatSeconds: function(seconds) {
        const totalSeconds = Math.floor(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const formattedMins = mins.toString().padStart(2, '0');
        const formattedSecs = secs.toString().padStart(2, '0');

        return `${formattedMins}:${formattedSecs} mins`;
    },

    onSend: function() {
        this.txOTPDebug.string = "";

        this.txEmailId.node.getChildByName("red").active = false;
        this.txOptNumber.node.getChildByName("red").active = false;
        this.txOptNumber.string = "";
        this.txErrorMessageStep1.string = "";
        this.txErrorMessageStep2.string = "";
        this.txErrorMessageStep3.string = "";

        this.txOTPLabel1.string = "";
        this.txOTPLabel2.string = "";
        this.txOTPLabelExp.string = "";

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(this.txEmailId.string)) {
            this.txErrorMessageStep1.string = "Invalid email address";
            this.txEmailId.node.getChildByName("red").active = true;
            return;
        }

        this.txReSendOTPButton.interactable = false;
        GameManager.loginHandler.txForgotPassword(this.txEmailId.string, (data) => {
            console.log("txForgotPassword", data);

            if (!data.success || data.status == "fail") {
                if (data.message) {
                    this.txErrorMessageStep1.string = data.message;
                } else {
                    this.txErrorMessageStep1.string = data.error[0].message;
                }

                if (this.txErrorMessageStep1.string.toLowerCase().indexOf("email") != -1) {
                    this.txEmailId.node.getChildByName("red").active = true;
                }

            } else {
                this.txOTPDebug.string = data.data.otpNumber;
                this.txOTPLabel1.string = "Didn’t get a code? Resend OTP in ";
                this.txOTPLabel2.string = data.data.resendCooldownSeconds + "s";
                this.resendCooldownSeconds = data.data.resendCooldownSeconds;
                this.otpExpiresIn = data.data.otpExpiresIn;

                this.otpTimer = setInterval(function() {
                    this.resendCooldownSeconds -= 1;
                    this.txOTPLabel2.string = this.resendCooldownSeconds + "s";
                    if (this.resendCooldownSeconds <= 0) {
                        this.txOTPLabel1.string = "Didn’t get a code? ";
                        this.txOTPLabel2.string = "Resend OTP";
                        this.txReSendOTPButton.interactable = true;
                        clearInterval(this.otpTimer);
                    }
                }.bind(this), 1000);

                this.otpExpTimer = setInterval(function() {
                    this.otpExpiresIn -= 1;
                    this.txOTPLabelExp.string = "OTP expires in " + this.formatSeconds(this.otpExpiresIn);
                    this.txOTPLabelExp.node.color = cc.Color.WHITE;
                    if (this.otpExpiresIn <= 0) {
                        this.txOTPLabelExp.string = "OTP expired";
                        this.txOTPLabelExp.node.color = cc.Color.RED;
                        clearInterval(this.otpExpTimer);
                    }
                }.bind(this), 1000);

                this.token = data.data.token;

                this.txEmailIdHead.string = this.txEmailId.string;
                this.step1.active = false;
                this.step2.active = true;
                this.step3.active = false;
            }
        });
    },

    onVerify: function() {
        this.txOTPDebug.string = "";
        this.txErrorMessageStep2.string = "";
        this.txOptNumber.node.getChildByName("red").active = false;
        GameManager.loginHandler.txVerifyOtp(this.token, this.txOptNumber.string, (data) => {
            console.log("txVerifyOtp", data);

            if (!data.success || data.status == "fail") {
                if (data.message) {
                    this.txErrorMessageStep2.string = data.message;
                } else {
                    this.txErrorMessageStep2.string = data.error[0].message;
                }
                this.txOptNumber.node.getChildByName("red").active = true;
            } else {
                this.step1.active = false;
                this.step2.active = false;
                this.step3.active = true;
            }
        });
    },

    onChange: function() {
        this.txErrorMessageStep3.string = ""
        this.txPassword.node.getChildByName("red").active = false;
        this.txConfirmPassword.node.getChildByName("red").active = false;

        GameManager.loginHandler.txResetPassword(this.token, this.txPassword.string, this.txConfirmPassword.string, (data) => {
            console.log("txResetPassword", data);

            if (!data.success || data.status == "fail") {
                if (data.message) {
                    this.txErrorMessageStep3.string = data.message;
                } else {
                    this.txErrorMessageStep3.string = data.error[0].message;
                }

                this.txPassword.node.getChildByName("red").active = true;
                this.txConfirmPassword.node.getChildByName("red").active = true;
            } else {
                this.finishPopup.active = true;
            }
        });
    },

    gotoLogin: function() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
        if (this.otpExpTimer) {
            clearInterval(this.otpExpTimer);
        }
        GameManager.popUpManager.remove(PopUpType.TXForgotPassword);
    },

    onTogglePassword: function(target) {
        if (target.isChecked) {
            this.txPassword.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.txPassword.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },

    onTogglePasswordConfirm: function(target) {
        if (target.isChecked) {
            this.txConfirmPassword.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.txConfirmPassword.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },

});