var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var TXSignup = require('TXSignup');
var TXForgotPassword = require('TXForgotPassword');

var TXLogin = cc.Class({
    extends: PopUpBase,

    editor: {
        menu: 'tx/TXLogin',
    },

    properties: {
        kycPrefab: cc.Prefab,
        txKYCLoading: {
            default: null,
            type: cc.Node,
        },
        txKYCApproved: {
            default: null,
            type: cc.Node,
        },
        txKYCRejected: {
            default: null,
            type: cc.Node,
        },
        txKYCUnderReview: {
            default: null,
            type: cc.Node,
        },
        txKYCSubmitted: {
            default: null,
            type: cc.Node,
        },
        txUserName: {
            default: null,
            type: cc.EditBox,
        },
        txPassword: {
            default: null,
            type: cc.EditBox,
        },
        txLoginButton: {
            default: null,
            type: cc.Button,
        },
        txErrorMessage: {
            default: null,
            type: cc.Label,
        },
        blocker: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad: function() {
        if (GameManager.isZFold()) {
            this.node.scale = 0.8;
        }
        
        this.playerId = "";
        cc.systemEvent.on("KYCManager_Completed", this.onKYCManagerCompleted.bind(this));
        cc.systemEvent.on("KYCManager_Pending", this.onKYCManagerPending.bind(this));
        cc.systemEvent.on("KYCManager_Error", this.onKYCManagerError.bind(this));
        cc.systemEvent.on("RESTORE_LOGIN", this.oRestoreLogin.bind(this));
    },

    oRestoreLogin: function() {
        this.txLoginButton.interactable = true;
        this.blocker.active = false;
    },

    onShow: function(data) {
        this.node.active = true;
        this.txErrorMessage.string = "";
        this.txUserName.string = "";
        this.txPassword.string = "";
        this.txUserName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;

        if (cc.sys.localStorage.getItem('txUserName')) {
            this.txUserName.string = cc.sys.localStorage.getItem('txUserName');
        }
    },

    onClose: function() {
        GameManager.popUpManager.hide(PopUpType.TXLogin);
    },

    gotoSignup: function() {
        this.txUserName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;
        this.txUserName.string = "";
        this.txPassword.string = "";
        this.txErrorMessage.string = "";
        GameManager.popUpManager.show(PopUpType.TXSignup);
    },

    gotoForgotPassword: function() {
        GameManager.popUpManager.show(PopUpType.TXForgotPassword);
    },

    onLogin: function() {
        this.txErrorMessage.string = "";

        this.txUserName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;

        this.doLogin(this.txUserName.string, this.txPassword.string);
    },

    doLogin: function(txUserName, txPassword) {
        this.txUserName.node.getChildByName("red").active = false;
        this.txPassword.node.getChildByName("red").active = false;
        this.txErrorMessage.string = "";

        this.txLoginButton.interactable = false;
        this.blocker.active = true;
        GameManager.loginHandler.txLogin(
            txUserName,
            txPassword,
            (data) => {
                console.log("txLogin", data);
                console.log("txLogin", JSON.stringify(data, null, 4));

                GameManager.retryGetAllAssets();

                if (!data.success || data.status == "fail") {
                    this.scheduleOnce(() => {
                        this.txLoginButton.interactable = true;
                        this.blocker.active = false;
                        this.txLoginButton.node.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = 'Login';
                    }, 1);
                    if (data.message) {
                        this.txErrorMessage.string = data.message;
                    } else {
                        this.txErrorMessage.string = data.error[0].message;
                    }

                    if (this.txErrorMessage.string.toLowerCase().indexOf("email") != -1) {
                        this.txUserName.node.getChildByName("red").active = true;
                    }
                    if (this.txErrorMessage.string.toLowerCase().indexOf("username") != -1) {
                        this.txUserName.node.getChildByName("red").active = true;
                    }
                    if (this.txErrorMessage.string.toLowerCase().indexOf("password") != -1) {
                        this.txPassword.node.getChildByName("red").active = true;
                    }
                    if (this.txErrorMessage.string.toLowerCase().indexOf("credentials") != -1) {
                        this.txPassword.node.getChildByName("red").active = true;
                        this.txUserName.node.getChildByName("red").active = true;
                    }

                    if (data.data) {
                        K.Token.membershipToken = data.data.membershipToken;
                    }

                    if (data.errorCode === "MaintenanceImminent" || data.errorCode === "MaintenanceStarted") {
                        this.txErrorMessage.string = "";
                        GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                            message: data.message || "Server is under maintenance.\nPlease come back later.",
                            action: "checkServerStatus"
                        }, function() {});
                    } else if (data.status == "region_restricted") {
                        this.txErrorMessage.string = "";
                        GameManager.popUpManager.show(PopUpType.AccessRestrictedPopup, data.message, function() {});
                    } else if (data.status == "email_not_verified") {
                        GameManager.popUpManager.show(PopUpType.TXSignup, {
                            "playerId": data.playerId, 
                            "emailId": data.emailId, 
                            "password": txPassword,
                            "userName": txUserName
                        });

                    } else if (data.data) {
                        this.playerId = data.data.playerId;
                        if (!data.data.acceptMembershipAgreement) {
                            this.txErrorMessage.string = "";
                            GameManager.popUpManager.show(PopUpType.TXMembershipAgreement, this.playerId);
                        } else if (!data.data.acceptTermsAndConditions) {
                            this.txErrorMessage.string = "";
                            GameManager.popUpManager.show(PopUpType.TXTermsAndCondition, this.playerId);
                        } else if (data.data.kycState == "not_initiated" || data.data.kycState == "initiated") {
                            this.txErrorMessage.string = "";
                            this.doKYC(data.data.playerId);
                        } else if (data.data.kycState == "pending" || data.data.kycState == "processing") {
                            this.txErrorMessage.string = "";
                            this.txKYCUnderReview.active = true;
                        } else if (data.data.kycState == "rejected") {
                            this.txErrorMessage.string = "";
                            this.txKYCRejected.active = true;
                        }
                    }

                    if (data.message && data.message.indexOf("deactivated") != -1) {
                        this.txErrorMessage.string = "";
                        GameManager.popUpManager.show(PopUpType.AccountDeletedLoginError, data.message, function() {});
                    }

                } else {
                    cc.sys.localStorage.setItem('txUserName', txUserName);
                    // cc.sys.localStorage.setItem('txPassword', txPassword);

                    K.Token.access_token = data.access_token;
                    K.Token.refresh_token = data.refresh_token;
                    K.Token.access_token_expire_at = data.access_token_expire_at;
                    K.Token.refresh_token_expire_at = data.refresh_token_expire_at;
                    K.Token.membershipToken = data.membershipToken;

                    this.txErrorMessage.string = "";
                    this.txUserName.string = txUserName;
                    this.txPassword.string = txPassword;

                    if (!data.acceptMembershipAgreement) {
                        this.scheduleOnce(() => {
                            this.txLoginButton.interactable = true;
                            this.blocker.active = false;
                        }, 1);
                        GameManager.popUpManager.show(PopUpType.TXMembershipAgreement, data.user.playerId);
                    } else if (!data.acceptTermsAndConditions) {
                        this.scheduleOnce(() => {
                            this.txLoginButton.interactable = true;
                            this.blocker.active = false;
                        }, 1);
                        GameManager.popUpManager.show(PopUpType.TXTermsAndCondition, data.user.playerId);
                    } else {

                        K.SmartFocus = data.user.settings.smartFocus;
                        K.BBJEnabled = data.isBbjEnabled;
                        K.BBJAmount = Math.round(data.jackpotCurrentPool.currentAmount * 100) / 100;
                        K.HighHandEnabled = data.isHighHandEnabled;

                        K.AgoraEnabled = data.isLiveStreamingEnabled;
                        if (data.notification) {
                            GameManager.notification = data.notification;
                        }

                        GameManager.isTournamentMaintenance = !!data.isTournamentMaintenance &&
                            !!data.tournamentMaintenance && data.tournamentMaintenance.status !== "PENDING";
                        if (data.tournamentMaintenance && data.tournamentMaintenance.message) {
                            GameManager.tournamentMaintenanceMsg = data.tournamentMaintenance.message;
                            GameManager.tournamentMaintenanceTaskId = data.tournamentMaintenance.taskId;
                        } else {
                            GameManager.tournamentMaintenanceMsg = null;
                            GameManager.tournamentMaintenanceTaskId = null;
                        }

                        GameManager.isCashgameMaintenance = !!data.isCashgameMaintenance;

                        LoginScreen.postLogin(data.user);
                    }
                }
            },
            (err) => {
                this.txLoginButton.interactable = true;
                this.blocker.active = false;
            }
        );
    },

    doKYC: function(playerId) {
        this.txKYCLoading.active = true;
        GameManager.loginHandler.txKYCInitiate(playerId, (data) => {
            GameManager.loginHandler.txKYCAccessToken(playerId, (data) => {
                this.txKYCLoading.active = false;
                K.KYC.accessToken = data.data.accessToken;
                const kycNode = cc.instantiate(this.kycPrefab);
                cc.Canvas.instance.node.addChild(kycNode);
                kycNode.getComponent("KYCManager").initKYC(K.KYC.accessToken, playerId);
            });
        });
    },

    doKYCRetry: function(playerId) {
        this.txKYCLoading.active = true;
        GameManager.loginHandler.txKYCRetry(playerId, (data) => {
            GameManager.loginHandler.txKYCAccessToken(playerId, (data) => {
                this.txKYCLoading.active = false;
                K.KYC.accessToken = data.data.accessToken;
                const kycNode = cc.instantiate(this.kycPrefab);
                cc.Canvas.instance.node.addChild(kycNode);
                kycNode.getComponent("KYCManager").initKYC(K.KYC.accessToken, playerId);
            });
        });
    },

    onCheck: function() {
        this.txLoginButton.interactable = false;
        if (this.txUserName.string === "") {
            return;
        }
        if (this.txPassword.string === "") {
            return;
        }
        this.txLoginButton.interactable = true;
    },

    onTogglePassword: function(target) {
        if (target.isChecked) {
            this.txPassword.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.txPassword.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },

    onKYCManagerCompleted: function() {
        this.txKYCSubmitted.active = true;
    },

    onKYCManagerPending: function() {
        console.log("onKYCManagerPending", this.playerId);
    },

    onKYCManagerError: function() {
        this.scheduleOnce(() => {
            GameManager.popUpManager.show(
                PopUpType.CommonDialog, {
                    "title": "Error",
                    "content": "Loading KYC failed, kindly retry."
                },
                function() {}
            );
        }, 0.5);
    },

    closeKYCUnderReview: function() {
        this.txKYCUnderReview.active = false;
    },

    closeKYCApproved: function() {
        this.txKYCApproved.active = false;
    },

    closeKYCSubmitted: function() {
        this.txKYCSubmitted.active = false;

        GameManager.loginHandler.txKYCRetryStatus(this.playerId, (data) => {
            if (data.data.status == "approved") {
                this.txKYCApproved.active = true;
            } else {
                this.kycStatusTimer = this.schedule(() => {
                    ServerCom.httpGetRequest(
                        (K.ServerAddress.otp_server + "/api/kyc/status/" + this.playerId), null, (data) => {
                            console.log(data.data.status);
                            if (data.data.status == "approved") {
                                this.unschedule(this.kycStatusTimer);
                                this.txKYCApproved.active = true;
                            }
                        }
                    );
                }, 2, 20);
            }
        });
    },

    closeKYCRejected: function() {
        this.txKYCRejected.active = false;
        this.doKYCRetry(this.playerId);
    },

});