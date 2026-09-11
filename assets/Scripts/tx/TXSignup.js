var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var TXSignup = cc.Class({
    extends: PopUpBase,

    editor: {
        menu: 'tx/TXSignup',
    },

    properties: {
        step1: {
            default: null,
            type: cc.Node,
        },
        step2: {
            default: null,
            type: cc.Node,
        },
        txUserName: {
            default: null,
            type: cc.EditBox,
        },
        txFirstName: {
            default: null,
            type: cc.EditBox,
        },
        txLastName: {
            default: null,
            type: cc.EditBox,
        },
        txEmailId: {
            default: null,
            type: cc.EditBox,
        },
        txPassword: {
            default: null,
            type: cc.EditBox,
        },
        txRef: {
            default: null,
            type: cc.EditBox,
        },
        txConfirmPassword: {
            default: null,
            type: cc.EditBox,
        },
        txMobileNumber: {
            default: null,
            type: cc.EditBox,
        },
        txOptNumber: {
            default: null,
            type: cc.EditBox,
        },
        txSignupButton: {
            default: null,
            type: cc.Button,
        },
        txVerifyOTPButton: {
            default: null,
            type: cc.Button,
        },
        txSendOTPButton: {
            default: null,
            type: cc.Button,
        },
        txReSendOTPButton: {
            default: null,
            type: cc.Button,
        },
        txErrorMessageStep1: {
            default: null,
            type: cc.Label,
        },
        txErrorMessageStep2: {
            default: null,
            type: cc.Label,
        },
        txOTPDebug: {
            default: null,
            type: cc.Label,
        },
        txOTPLabel1: {
            default: null,
            type: cc.Label,
        },
        txOTPLabel2: {
            default: null,
            type: cc.Label,
        },
        txOTPLabelExp: {
            default: null,
            type: cc.Label,
        },
        step2Email: {
            default: null,
            type: cc.Label,
        },
    },

    onLoad: function () {

        if (GameManager.isZFold()) {
            var size = cc.size(cc.Canvas.instance.node.width, cc.Canvas.instance.node.height);
            var aspect = size.height / size.width; // 1.333
            let designAspect = 1704 / 786; // 2.1679389313
            this.node.scale = 0.8;
            cc.find("Step1/InputFields", this.node).scale = 0.85;
            cc.find("Step1/Heading", this.node).scale = 0.4;
            cc.find("Step1/EnterDetails", this.node).scale = 0.4;
            // cc.find("Step1/Logo", this.node).scale = 0.8;
            // cc.find("Step1/Logo", this.node).getComponent(cc.Widget).left = 180;
            //cc.find("Step1/Heading", this.node).getComponent(cc.Widget).left = 180;
            // cc.find("Step1/Heading", this.node).getComponent(cc.Widget).top = 200;
            // cc.find("Step2", this.node).scale = 0.85;

        }

        this.playerId = "";
    },

    onShow: function (data) {
        if (data) {
            this.onShowVerify(data.playerId, data.emailId, data.password, data.userName);
            return;
        }
        this.txOptNumber.string = "";
        this.txOTPDebug.string = "";
        this.txUserName.string = "";
        this.txFirstName.string = "xx";
        this.txLastName.string = "yy";
        this.txPassword.string = "";
        this.txConfirmPassword.string = "";
        this.txOTPLabel1.string = "";
        this.txOTPLabel2.string = "";
        this.txOTPLabelExp.string = "";
        this.txEmailId.string = "";
        this.txMobileNumber.string = "";
        this.txRef.string = "";
        this.txErrorMessageStep1.string = "";
        this.txErrorMessageStep2.string = "";
        this.step1.active = true;
        this.step2.active = false;
        this.txVerifyOTPButton.node.active = false;
        this.txSendOTPButton.node.active = true;
        this.txUserName.node.getChildByName("red").active = false;
        this.txFirstName.node.getChildByName("red").active = false;
        this.txLastName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;
        this.txConfirmPassword.node.getChildByName("red").active = false;
        this.txEmailId.node.getChildByName("red").active = false;
        this.txMobileNumber.node.getChildByName("red").active = false;
        this.txOptNumber.node.getChildByName("red").active = false;
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
        this.onCheck();
    },

    formatSeconds: function (seconds) {
        const totalSeconds = Math.floor(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const formattedMins = mins.toString().padStart(2, '0');
        const formattedSecs = secs.toString().padStart(2, '0');

        return `${formattedMins}:${formattedSecs} mins`;
    },

    onShowVerify: function (playerId, txEmailId, txPassword, txUserName) {
        this.node.active = true;
        this.txOptNumber.string = "";
        this.txOTPDebug.string = "";
        this.txUserName.string = "";
        this.txFirstName.string = "xx";
        this.txLastName.string = "yy";
        this.txPassword.string = "";
        this.txConfirmPassword.string = "";
        this.txEmailId.string = "";
        this.txMobileNumber.string = "";
        this.txRef.string = "";
        this.txErrorMessageStep1.string = "";
        this.txErrorMessageStep2.string = "";
        this.step1.active = true;
        this.step2.active = false;
        this.txVerifyOTPButton.node.active = false;
        this.txSendOTPButton.node.active = true;
        this.txUserName.node.getChildByName("red").active = false;
        this.txFirstName.node.getChildByName("red").active = false;
        this.txLastName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;
        this.txConfirmPassword.node.getChildByName("red").active = false;
        this.txEmailId.node.getChildByName("red").active = false;
        this.txMobileNumber.node.getChildByName("red").active = false;
        this.txOptNumber.node.getChildByName("red").active = false;
        this.onCheck();

        this.step1.active = false;
        this.step2.active = true;

        this.playerId = playerId;
        this.txEmailId.string = txEmailId;
        this.txPassword.string = txPassword;
        this.txUserName.string = txUserName;
        this.step2Email.string = txEmailId;

        this.txOTPLabel1.string = "";
        this.txOTPLabel2.string = "";
        this.txOTPLabelExp.string = "";
        this.txReSendOTPButton.interactable = false;

        GameManager.loginHandler.txSendEmailOtp(this.playerId, txEmailId, (data) => {
            if (data.success) {
                this.emailToken = data.data.emailToken;
                this.txOTPDebug.string = data.data.otpNumber;
                this.resendCooldownSeconds = data.data.resendCooldownSeconds;
                this.otpExpiresIn = data.data.otpExpiresIn;

                this.otpTimer = setInterval(function () {
                    this.resendCooldownSeconds -= 1;
                    this.txOTPLabel2.string = this.resendCooldownSeconds + "s";
                    if (this.resendCooldownSeconds <= 0) {
                        this.txOTPLabel1.string = "Didn’t get a code? ";
                        this.txOTPLabel2.string = "Resend OTP";
                        this.txReSendOTPButton.interactable = true;
                        clearInterval(this.otpTimer);
                    }
                }.bind(this), 1000);

                this.otpExpTimer = setInterval(function () {
                    this.otpExpiresIn -= 1;
                    this.txOTPLabelExp.string = "OTP expires in " + this.formatSeconds(this.otpExpiresIn);
                    this.txOTPLabelExp.node.color = cc.Color.WHITE;
                    if (this.otpExpiresIn <= 0) {
                        this.txOTPLabelExp.string = "OTP expired";
                        this.txOTPLabelExp.node.color = cc.Color.RED;
                        clearInterval(this.otpExpTimer);
                    }
                }.bind(this), 1000);
            }
            else {
                this.resendCooldownSeconds = data.data.remainingCooldown;
                this.txOTPLabelExp.string = data.message;
                this.txOTPLabel1.string = "Didn’t get a code? Resend OTP in ";
                this.otpTimer = setInterval(function () {
                    this.resendCooldownSeconds -= 1;
                    this.txOTPLabel2.string = this.resendCooldownSeconds + "s";
                    if (this.resendCooldownSeconds <= 0) {
                        this.txOTPLabel1.string = "Didn’t get a code? ";
                        this.txOTPLabel2.string = "Resend OTP";
                        this.txReSendOTPButton.interactable = true;
                        clearInterval(this.otpTimer);
                    }
                }.bind(this), 1000);
            }
        });
    },

    onClose: function () {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
        if (this.otpExpTimer) {
            clearInterval(this.otpExpTimer);
        }
        GameManager.popUpManager.remove(PopUpType.TXSignup);
    },

    gotoLogin: function () {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
        if (this.otpExpTimer) {
            clearInterval(this.otpExpTimer);
        }
        GameManager.popUpManager.remove(PopUpType.TXSignup);
    },

    onCheck: function () {
        this.txSignupButton.interactable = false;
        if (this.txUserName.string === "") {
            return;
        }
        if (this.txFirstName.string === "") {
            return;
        }
        if (this.txLastName.string === "") {
            return;
        }
        if (this.txPassword.string === "") {
            return;
        }
        if (this.txConfirmPassword.string === "") {
            return;
        }
        if (this.txEmailId.string === "") {
            return;
        }
        if (this.txMobileNumber.string === "") {
            return;
        }

        this.txSignupButton.interactable = true;
    },

    onCheckVerify: function () {
        this.txVerifyOTPButton.node.active = false;
        this.txSendOTPButton.node.active = true;

        if (this.txOptNumber.string.length < 6) {
            return;
        }

        this.txVerifyOTPButton.node.active = true;
        this.txSendOTPButton.node.active = false;
    },

    onSignup: function () {
        this.txErrorMessageStep1.string = "";

        this.txUserName.node.getChildByName("red").active = false;
        this.txFirstName.node.getChildByName("red").active = false;
        this.txLastName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;
        this.txConfirmPassword.node.getChildByName("red").active = false;
        this.txEmailId.node.getChildByName("red").active = false;
        this.txMobileNumber.node.getChildByName("red").active = false;

        if (this.txPassword.string != this.txConfirmPassword.string) {
            this.txErrorMessageStep1.string = "Password unmatched";
            this.txPassword.node.getChildByName("red").active = true;
            this.txConfirmPassword.node.getChildByName("red").active = true;
            return;
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(this.txEmailId.string)) {
            this.txErrorMessageStep1.string = "Invalid email address";
            this.txEmailId.node.getChildByName("red").active = true;
            return;
        }

        let self = this;

        GameManager.loginHandler.txRegister(
            this.txUserName.string,
            this.txFirstName.string,
            this.txLastName.string,
            this.txEmailId.string,
            this.txPassword.string,
            this.txConfirmPassword.string,
            this.txMobileNumber.string,
            this.txRef.string,
            (data) => {
                console.log("txRegister", data);
                console.log("txRegister", JSON.stringify(data, null, 4));

                if (!data.success || data.status == "fail") {
                    if (data.message) {
                        self.txErrorMessageStep1.string = data.message;
                    } else {
                        self.txErrorMessageStep1.string = data.error[0].message;
                    }

                    if (self.txErrorMessageStep1.string.toLowerCase().indexOf("agent") != -1) {
                        self.txRef.node.getChildByName("red").active = true;
                    }
                    else if (self.txErrorMessageStep1.string.toLowerCase().indexOf("email") != -1) {
                        self.txEmailId.node.getChildByName("red").active = true;
                    }
                    else if (self.txErrorMessageStep1.string.toLowerCase().indexOf("username") != -1) {
                        self.txUserName.node.getChildByName("red").active = true;
                    }
                    else if (self.txErrorMessageStep1.string.toLowerCase().indexOf("first name") != -1) {
                        self.txFirstName.node.getChildByName("red").active = true;
                    }
                    else if (self.txErrorMessageStep1.string.toLowerCase().indexOf("last name") != -1) {
                        self.txLastName.node.getChildByName("red").active = true;
                    }
                    else if (self.txErrorMessageStep1.string.toLowerCase().indexOf("password") != -1) {
                        self.txPassword.node.getChildByName("red").active = true;
                        self.txConfirmPassword.node.getChildByName("red").active = true;
                    }
                    else if (self.txErrorMessageStep1.string.toLowerCase().indexOf("mobile") != -1) {
                        self.txMobileNumber.node.getChildByName("red").active = true;
                    }


                    if (data.status == "region_restricted") {
                        GameManager.popUpManager.show(PopUpType.AccessRestrictedPopup, self.txErrorMessageStep1.string, function () { });
                        self.txErrorMessageStep1.string = ""
                        self.gotoLogin();
                    }
                } else {

                    self.step1.active = false;
                    self.step2.active = true;

                    self.playerId = data.data.playerId;
                    self.step2Email.string = self.txEmailId.string;

                    self.txOTPLabel1.string = "";
                    self.txOTPLabel2.string = "";
                    self.txOTPLabelExp.string = "";
                    self.txReSendOTPButton.interactable = false;

                    GameManager.loginHandler.txSendEmailOtp(self.playerId, self.txEmailId.string, (data) => {
                        console.log("txSendEmailOtp", data.data.otpNumber);
                        self.emailToken = data.data.emailToken;
                        self.txOTPDebug.string = data.data.otpNumber;


                        self.txOTPLabel1.string = "Didn’t get a code? Resend OTP in ";
                        self.txOTPLabel2.string = data.data.resendCooldownSeconds + "s";
                        self.resendCooldownSeconds = data.data.resendCooldownSeconds;
                        self.otpExpiresIn = data.data.otpExpiresIn;

                        self.otpTimer = setInterval(function () {
                            self.resendCooldownSeconds -= 1;
                            self.txOTPLabel2.string = self.resendCooldownSeconds + "s";
                            if (self.resendCooldownSeconds <= 0) {
                                self.txOTPLabel1.string = "Didn’t get a code? ";
                                self.txOTPLabel2.string = "Resend OTP";
                                self.txReSendOTPButton.interactable = true;
                                clearInterval(self.otpTimer);
                            }
                        }.bind(self), 1000);

                        self.otpExpTimer = setInterval(function () {
                            self.otpExpiresIn -= 1;
                            self.txOTPLabelExp.string = "OTP expires in " + self.formatSeconds(self.otpExpiresIn);
                            self.txOTPLabelExp.node.color = cc.Color.WHITE;
                            if (self.otpExpiresIn <= 0) {
                                self.txOTPLabelExp.string = "OTP expired";
                                self.txOTPLabelExp.node.color = cc.Color.RED;
                                clearInterval(self.otpExpTimer);
                            }
                        }.bind(self), 1000);
                    });
                }
            }
        );
    },

    onResend: function () {
        this.txReSendOTPButton.interactable = false;
        this.txOTPDebug.string = "";
        this.txErrorMessageStep1.string = "";
        this.txErrorMessageStep2.string = "";
        this.txOTPLabelExp.string = "";
        this.txOptNumber.string = "";
        this.txOptNumber.node.getChildByName("red").active = false;
        GameManager.loginHandler.txSendEmailOtp(this.playerId, this.txEmailId.string, (data) => {
            console.log("txSendEmailOtp", data);
            this.emailToken = data.data.emailToken;
            this.txOTPDebug.string = data.data.otpNumber;
            this.resendCooldownSeconds = data.data.resendCooldownSeconds;
            this.otpExpiresIn = data.data.otpExpiresIn;

            this.otpTimer = setInterval(function () {
                this.resendCooldownSeconds -= 1;
                this.txOTPLabel2.string = this.resendCooldownSeconds + "s";
                if (this.resendCooldownSeconds <= 0) {
                    this.txOTPLabel1.string = "Didn’t get a code? ";
                    this.txOTPLabel2.string = "Resend OTP";
                    this.txReSendOTPButton.interactable = true;
                    clearInterval(this.otpTimer);
                }
            }.bind(this), 1000);

            this.otpExpTimer = setInterval(function () {
                this.otpExpiresIn -= 1;
                this.txOTPLabelExp.string = "OTP expires in " + this.formatSeconds(this.otpExpiresIn);
                this.txOTPLabelExp.node.color = cc.Color.WHITE;
                if (this.otpExpiresIn <= 0) {
                    this.txOTPLabelExp.string = "OTP expired";
                    this.txOTPLabelExp.node.color = cc.Color.RED;
                    clearInterval(this.otpExpTimer);
                }
            }.bind(this), 1000);
        });
    },

    onVerify: function () {
        this.txOTPDebug.string = "";
        this.txErrorMessageStep2.string = "";
        this.txOptNumber.node.getChildByName("red").active = false;
        GameManager.loginHandler.txVerifyEmail(this.emailToken, this.txEmailId.string, this.txOptNumber.string, (data) => {
            console.log("txVerifyEmail", data);

            if (!data.success || data.status == "fail") {
                if (data.message) {
                    this.txOptNumber.node.getChildByName("red").active = true;
                    this.txErrorMessageStep2.string = data.message;
                }
            } else {
                cc.sys.localStorage.setItem('txUserName', this.txUserName.string);
                // cc.sys.localStorage.setItem('txPassword', this.txPassword.string);
                K.KYC.password = this.txPassword.string;

                let txLoginNode = GameManager.popUpManager.getPopupNode(PopUpType.TXLogin);
                if (txLoginNode) {
                    txLoginNode.getComponent("TXLogin").doLogin(this.txUserName.string, this.txPassword.string);
                }

                this.gotoLogin();
            }
        });
    },

    onTogglePassword: function (target) {
        if (target.isChecked) {
            this.txPassword.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.txPassword.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },

    onTogglePasswordConfirm: function (target) {
        if (target.isChecked) {
            this.txConfirmPassword.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.txConfirmPassword.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },
    onTestStep2: function () {
        this.step1.active = false;
        this.step2.active = true;
        this.playerId = "testPlayerId";
        this.txEmailId.string = ""
        this.step2Email.string = this.txEmailId.string;
    },
    onBackFromOtp: function () {
        this.step1.active = true;
        this.step2.active = false;
    }

});