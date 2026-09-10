var Login = require('PostTypes').Login;
var userID = require('PostTypes').UserID;
var forgotPassword = require('PostTypes').ForgotPassword;
var resetPassword = require('PostTypes').ResetPassword;
var OTP = require('PostTypes').OTP;
var transactionHistory = require('PostTypes').TransactionHistory;
var EventEmitter = require('EventEmitter');
var PopUpType = require('PopUpManager').PopUpType;

var profileData = {
    query: {
        playerId: "hsdfhd"
    },
    updateKeys: {
        mobileNumber: "012345",
    },
};

/**
 * @classdesc Handles background process for login
 * @class LoginHandler
 * @extends EventEmitter
 * @memberof Screens.Login
 */
cc.Class({
    extends: EventEmitter,

    properties: {
        clientIPv4: {
            default: "",
            visible: false,
        },
        clientIPv6: {
            default: "",
            visible: false,
        },
        login: {
            default: null,
            visible: false,
        },
        isLoading: false,
    },

    onLoad: function() {
        window.LoginHandler = this;
    },

    init: function(deviceType) {
        this.login = Login;
        this.login.deviceType = deviceType;
        this.login.appVersion = K.ServerAddress.clientVer;
    },

    checkServerStatus: function(callback, error) {
        console.log("checkServerStatus1");
        var address = K.ServerAddress.maintainanceIP + ":" + K.ServerAddress.maintainancePort + K.ServerAPI.maintainance;
        var data = K.AppVersion;
        data.appVersion = K.ServerAddress.clientVer;
        data.deviceType = this.login.deviceType;
        ServerCom.httpPostRequest(address, data, callback, error);
    },

    checkForMultiClient: function(callback, error) {
        var data = {};
        data.playerId = GameManager.user.playerId;
        data.isRequested = true;
        data.isLoggedIn = false;
        data.playerName = GameManager.user.userName;
        data.deviceType = this.login.deviceType;
        data.appVersion = K.ServerAddress.clientVer;
        ServerCom.socketIORequest("common|" + K.PomeloAPI.checkForMultiClient, data, callback, null, 5000, false);
    },

    checkForMultiClientTour: function(callback, error) {
        var data = {};
        data.playerId = GameManager.user.playerId;
        data.isRequested = true;
        data.isLoggedIn = false;
        data.playerName = GameManager.user.userName;
        data.deviceType = this.login.deviceType;
        data.appVersion = K.ServerAddress.clientVer;
        TournamentServerCom.socketIORequest("common|" + K.PomeloAPI.checkForMultiClient, data, callback, null, 5000, false);
    },

    setAddress: function(v4, v6) {
        this.clientIPv4 = v4;
        this.clientIPv6 = v6;
        window.ipV4Address = Login.ipV4Address = v4;
        Login.ipV6Address = v6;
    },

    // tx
    txKYCInitiate: function(playerId, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_server + "/api/kyc/initiate", {
                "playerId": playerId,
            },
            callback
        );
    },

    txKYCRetry: function(playerId, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_server + "/api/kyc/retry", {
                "playerId": playerId,
            },
            callback
        );
    },

    txKYCAccessToken: function(playerId, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_server + "/api/kyc/access-token", {
                "playerId": playerId,
            },
            callback
        );
    },

    txLogin: function(account, password, callback, error) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(account)) {
            ServerCom.httpPostRequest(
                K.ServerAddress.otp_new_server + "/api/auth/login", {
                    "userName": account,
                    "password": password,
                },
                callback, error
            );
        } else {
            ServerCom.httpPostRequest(
                K.ServerAddress.otp_new_server + "/api/auth/login", {
                    "emailId": account,
                    "password": password,
                },
                callback, error
            );
        }
    },

    txLoginWithToken: function(callback, error) {
        ServerCom.httpGetRequest(
            K.ServerAddress.otp_server + "/api/users/me", null, callback, error
        );
    },

    txKYCRetryStatus: function(playerId, callback) {
        ServerCom.httpGetRequest(
            (K.ServerAddress.otp_server + "/api/kyc/status/" + playerId), null, callback, null
        );
    },

    txResetPassword: function(token, newPassword, confirmPassword, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_new_server + "/api/auth/reset-password", {
                "token": token,
                "newPassword": newPassword,
                "confirmPassword": confirmPassword
            },
            callback
        );
    },

    txForgotPassword: function(emailId, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_new_server + "/api/auth/forgot-password", {
                "email": emailId
            },
            callback
        );
    },

    txVerifyOtp: function(token, otpNumber, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_new_server + "/api/auth/verify-otp", {
                "token": token,
                "otpNumber": otpNumber
            },
            callback
        );
    },

    txAcceptMembershipAgreement: function(callback, error) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_server + "/api/users/accept-membership-agreement", {},
            callback,
            error
        );
    },

    txRegister: function(userName, firstName, lastName, emailId, password, confirmPassword, mobileNumber, ref, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_new_server + "/api/auth/register", {
                "userName": userName,
                "firstName": firstName,
                "lastName": lastName,
                "emailId": emailId,
                "mobileNumber": mobileNumber,
                "password": password,
                "confirmPassword": confirmPassword,
                "inviteCode": ref
            },
            callback
        );
    },

    txSendEmailOtp: function(playerId, emailId, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_new_server + "/api/auth/send-email-otp", {
                "playerId": playerId,
                "emailId": emailId
            },
            callback
        );
    },

    txVerifyEmail: function(emailToken, emailId, otpNumber, callback) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_new_server + "/api/auth/verify-email", {
                "emailToken": emailToken,
                "emailId": emailId,
                "otpNumber": otpNumber
            },
            callback
        );
    },

    txAcceptTermsAndConditions: function(callback, error) {
        ServerCom.httpPostRequest(
            K.ServerAddress.otp_server + "/api/users/accept-terms-and-conditions", {},
            callback, 
            error
        );
    },

});