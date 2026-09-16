// Base class for all server API handlers

var root = window;
var EventEmitter = require('EventEmitter');
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
/**
 * @classdesc After some data handling, Communicate with server through pomelo-client.js
 * @class ServerCom
 * @extends EventEmitter
 * @memberof Utilities
 */

cc.Class({
    extends: EventEmitter,
    properties: {
        // count : 0,
        tracker: {
            default: {},
        },
        reconnecting: {
            default: null,
            type: cc.Node,
        },
        trackerCount: 0,
        cconnectCB: null,
        forceKeepLoading: false,
        // 
        inGame: false,
        sessionExpired: false,
        pomeloConnected: true,
        socketConnected: true,
        pomeloReconnecting: true,
        socketReconnecting: true,
        pomeloReconnectedCount: 0,
        socketReconnectedCount: 0,
        socketReconnected: false,
        pomeloReconnected: false,
        reconncetTimer: null,
        reconnectionDelay: 1000,
        reconnectMaxAttempts: 3,
        refreshTokenExpired: false,
    },

    // use this for initialization
    onLoad: function() {
        // this.socketReconnectedCount = 0;
        root.ServerCom = this;
        window.MGR_AGORA.initEngine();
    },

    /**
     * @method httpPostRequest
     * @description HTTP request - POST data 
     * @param {String} address -address of Server 
     * @param {Object} data -Data/PayLoad to be sent
     * @param {method} callback -Callback to be executed if response.succss is true!
     * @param {method} error -Callback to be executed if response.success is false!
     * @param {Number} timeout -value in milli seconds, Specify request timeout time! 
     * @memberof Utilities.ServerCom#
     */
    httpPostRequest: function(address, data, callback, error, timeout) {
        console.log("httpPostRequest", address);
        var inst = this;
        var xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        xhr.onreadystatechange = function() {
            K.internetAvailable = true;
            // if (xhr.status == 403) {
            //     GameManager.popUpManager.hideAllPopUps();
            //     var param = {
            //         code: K.Error.SessionError,
            //         response: "Session error, please reload the game."
            //     };
            //     GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function () {});
            //     return;
            // }

            // console.log("xhr", JSON.stringify(xhr));
            // console.log("xhr.status", xhr.status);
            // console.log("xhr.readyState", xhr.readyState);

            console.log("httpPostRequest onreadystatechange 1");

            if (xhr.readyState == 4 && (xhr.status == 400 || xhr.status == 401 || xhr.status == 429 || xhr.status == 403)) {
                console.log("httpPostRequest onreadystatechange 2");
                if (callback !== null && callback !== undefined && xhr.responseText) {
                    callback(JSON.parse(xhr.responseText));
                }
                return;
            }
            if (xhr.readyState == 4 && xhr.status >= 500 && xhr.responseText) {
                console.log("httpPostRequest onreadystatechange 3");
                if (callback !== null && callback !== undefined) {
                    callback(JSON.parse(xhr.responseText));
                }
                return;
            }
            // if (xhr.status == 0) {
            //     if (callback !== null && callback !== undefined) {
            //         callback();
            //     }
            //     return;
            // }
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                console.log("httpPostRequest onreadystatechange 4");
                var response = xhr.responseText;
                if (callback !== null && callback !== undefined) {
                    var data = JSON.parse(response);

                    if (data.success != undefined) {
                        if (!data.success) {
                            var param = {
                                code: K.Error.SuccessFalseError,
                                response: data.info,
                                errorType: data.errorType || "",
                                isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                            };
                            var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : true;
                            if (isDisplay) {
                                inst.emit('error', param);
                            }
                            if (error !== null && error !== undefined) {
                                error(param);
                            }
                        }
                    } else if (data.status != undefined) {
                        if (!data.status) {
                            var param = {
                                code: K.Error.SuccessFalseError,
                                response: data.info,
                                errorType: data.errorType || "",
                                isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                            };
                            var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : true;
                            if (isDisplay) {
                                inst.emit('error', param);
                            }
                            if (error !== null && error !== undefined) {
                                error(param);
                            }
                        }
                    }

                    if (callback !== null && callback !== undefined) {
                        callback(data);
                    }
                }
            }
        };
        xhr.onerror = function(err) {
            K.disconnectRequestedByPlayer = false;
            K.internetAvailable = false;
            console.log("httpPostRequest onreadystatechange 5");

            inst.emit('error', {
                code: K.Error.ConnectionError,
                response: err,
            });
            if (error !== null && error !== undefined) {
                error({
                    code: K.Error.ConnectionError,
                    response: err,
                });
            }

            GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please check your\n Internet Connection.", function() {});
        };
        xhr.ontimeout = function(timeout) {
            // console.error("ON_timeout ", timeout)
            K.disconnectRequestedByPlayer = false;
            K.internetAvailable = false;
            console.log("httpPostRequest onreadystatechange 6");
            inst.emit('error', {
                code: K.Error.TimeOutError,
                response: "Timeout" + address
            });
            if (error !== null && error !== undefined) {
                error({
                    code: K.Error.TimeOutError,
                    response: "Timeout" + address,
                });
            }
            GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please check your\n Internet Connection.", function() {});
        };
        xhr.open("POST", address, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("x-platform-type", GameManager.getPlatformType());
        if (address.indexOf("accept-membership-agreement") != -1 ||
            address.indexOf("accept-terms-and-conditions") != -1) {
            let token = K.Token.membershipToken;
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        } else if (K.Token.access_token != "") {
            let token = K.Token.access_token;
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(JSON.stringify(data));
    },

    httpPatchRequest: function(address, data, callback, error, timeout) {
        var inst = this;
        var xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        xhr.onreadystatechange = function() {
            K.internetAvailable = true;
            if (xhr.status == 403) {
                GameManager.popUpManager.hideAllPopUps();
                var param = {
                    code: K.Error.SessionError,
                    response: "Session error, please reload the game."
                };
                GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                return;
            }
            if (xhr.status == 400 || xhr.status == 401 || xhr.status == 429) {
                if (callback !== null && callback !== undefined && xhr.responseText) {
                    callback(JSON.parse(xhr.responseText));
                }
                return;
            }
            // if (xhr.status == 0) {
            //     if (callback !== null && callback !== undefined) {
            //         callback();
            //     }
            //     return;
            // }
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                if (callback !== null && callback !== undefined) {
                    var data = JSON.parse(response);
                    if (!data.success && (!data.status || data.status != "success")) {
                        var param = {
                            code: K.Error.SuccessFalseError,
                            response: data.info,
                            errorType: data.errorType || "",
                            isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                        };
                        var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : true;
                        if (isDisplay) {
                            inst.emit('error', param);
                        }
                        if (error !== null && error !== undefined) {
                            error(param);
                        }
                    }
                    if (callback !== null && callback !== undefined) {
                        callback(data);
                    }
                }
            }
        };
        xhr.onerror = function(err) {
            K.disconnectRequestedByPlayer = false;
            K.internetAvailable = false;
            // console.error("ON_ERROR ", err)

            inst.emit('error', {
                code: K.Error.ConnectionError,
                response: err,
            });
            if (error !== null && error !== undefined) {
                error({
                    code: K.Error.ConnectionError,
                    response: err,
                });
            }
        };
        xhr.ontimeout = function(timeout) {
            // console.error("ON_timeout ", timeout)
            K.disconnectRequestedByPlayer = false;
            K.internetAvailable = false;
            inst.emit('error', {
                code: K.Error.TimeOutError,
                response: "Timeout" + address
            });
            if (error !== null && error !== undefined) {
                error({
                    code: K.Error.TimeOutError,
                    response: "Timeout" + address,
                });
            }
        };
        xhr.open("PATCH", address, true);
        xhr.setRequestHeader("x-platform-type", GameManager.getPlatformType());
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        if (K.Token.access_token != "") {
            let token = K.Token.access_token;
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(JSON.stringify(data));
    },

    httpGetRequest: function(address, data, callback, error, timeout) {
        var inst = this;
        var xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        xhr.onreadystatechange = function() {
            K.internetAvailable = true;
            if (xhr.status == 403) {
                ServerCom.refreshTokenExpired = true;
                GameManager.popUpManager.hideAllPopUps();
                if (xhr.statusText == "Forbidden") {
                    var param = {
                        code: 8888,
                        response: "You have been banned."
                    };
                    GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                }
                else {
                    var param = {
                        code: K.Error.SessionError,
                        response: "Session error, please reload the game."
                    };
                    GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                }
                return;
            }

            if ((xhr.readyState == 2 || xhr.readyState == 4) && (xhr.status == 401)) {
                if (error !== null && error !== undefined) {
                    error();
                }
                return;
            }

            if (xhr.readyState == 4 && xhr.status >= 500 && xhr.responseText) {
                if (callback !== null && callback !== undefined) {
                    callback(JSON.parse(xhr.responseText));
                }
                return;
            }

            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                if (callback !== null && callback !== undefined) {
                    var data = JSON.parse(response);
                    if (!data.success && (!data.status || data.status != "success")) {
                        var param = {
                            code: K.Error.SuccessFalseError,
                            response: data.info,
                            errorType: data.errorType || "",
                            isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                        };
                        var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : true;
                        if (isDisplay) {
                            inst.emit('error', param);
                        }
                        if (error !== null && error !== undefined) {
                            error(param);
                        }
                    }
                    if (callback !== null && callback !== undefined) {
                        callback(data);
                    }
                }
            }
        };
        xhr.onerror = function(err) {
            K.disconnectRequestedByPlayer = false;
            K.internetAvailable = false;
            // console.error("ON_ERROR ", err)

            inst.emit('error', {
                code: K.Error.ConnectionError,
                response: err,
            });
            if (error !== null && error !== undefined) {
                error({
                    code: K.Error.ConnectionError,
                    response: err,
                });
            }
        };
        xhr.ontimeout = function(timeout) {
            // console.error("ON_timeout ", timeout)
            K.disconnectRequestedByPlayer = false;
            K.internetAvailable = false;
            inst.emit('error', {
                code: K.Error.TimeOutError,
                response: "Timeout" + address
            });
            if (error !== null && error !== undefined) {
                error({
                    code: K.Error.TimeOutError,
                    response: "Timeout" + address,
                });
            }
        };
        xhr.open("GET", address, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.setRequestHeader("x-platform-type", GameManager.getPlatformType());

        if (K.Token.access_token != "") {
            let token = K.Token.access_token;
            if (address.indexOf("/api/auth/refresh") != "-1") {
                token = K.Token.refresh_token;
            }
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send();
    },

    /**
     * 
     * @method pomeloRequest
     * @description this method calls pomelo.request() method of pomelo-client after some data handling!
     * @param {String} address - Pomelo API route
     * @param {Object} data -PayLoad/Data to be sent with Request to server
     * @param {callback} callback -Callback to be called after successful response
     * @param {callback} error -Callback to be executed if response.success is false!
     * @param {Number} timeout - Value in milli seconds, Specify request timeout time!
     * @param {boolean} showLoading - boolean value used for active/deactive Loading Node!
     * @param {boolean} showError - boolean value used to decide if error event to be fired or not if response.success is false!
     * @memberof Utilities.ServerCom#
     */
    pomeloRequest: function(address, data, callback, error, timeout, showLoading = true, showError = true, callback2) {

        ServerCom.socketIORequest("common|" + address, data, callback, error, timeout, showLoading, showError, "", callback2);

        return;

        var inst = this;

        if (typeof data != 'object') {
            let dat = {};
            dat.data = data;
            data = dat;
        }

        if (!data) {
            data = {};
        }

        if (typeof data == 'object') {
            if (data.isLoggedIn == null || data.isLoggedIn == undefined)
                data.isLoggedIn = true;
            if (data.isLoggedIn) {
                if (!GameManager.isConnected) {
                    inst.emit('error', {
                        code: K.Error.ConnectionError,
                        response: "You are not logged in !!",
                    });
                    return;
                }
            }
        } else {
            if (!GameManager.isConnected) {
                inst.emit('error', {
                    code: K.Error.ConnectionError,
                    response: "You are not logged in !!",
                });
                return;
            }
        }

        var timeoutFlag = false;
        /* Used only for game request - Start */

        this.tracker = this.tracker || {};
        var key = data.channelId || "";
        if (data.channelId == "") {
            key = data.tableId || "";
        }
        key = key + address;
        //  console.log("request key " + key);
        if (this.tracker[key] !== undefined) {
            if (this.tracker[key]) {
                //console.log("false " + key);
                // return;
            } else {
                this.updateTracker(true, key, showLoading);
            }
        } else {
            //TODO 
            this.updateTracker(true, key, showLoading);
        }
        /** Used only for game request - End */

        var timer = setTimeout(function() {
            // console.log("uno pakda, ", address);
            // inst.emit('error', {
            //     code: K.Error.TimeOutError,
            //     response: "Timeout at " + address
            // });
            // timeoutFlag = true;
            // if (error !== null && error !== undefined) {
            //     error({
            //         code: K.Error.TimeOutError,
            //         response: "Timeout at " + address,
            //     });
            // }

            // reset multi request block
            inst.tracker[key] = false;
            this.updateTracker(false, key, showLoading);

        }.bind(this), timeout || 5000); // Discuss timeout

        if (!data.access_token && K.Token.access_token) {
            data.access_token = K.Token.access_token;
        }
        console.log("pomelo.request", address, data);
        pomelo.request(address, data, function(response) {
            console.log("%c[response] \n%o", 'color: Blue;', response);
            // console.log("response : " + response.route);
            //   console.log(JSON.stringify(response));
            clearTimeout(timer);
            // reset multi request block
            var respKey = response.channelId || "";
            if (!!response.tableId) {
                respKey = response.tableId || "";
            }
            respKey = respKey + response.route;
            //console.log('reponse key : ' + respKey);
            inst.updateTracker(false, respKey, showLoading);
            var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : !response.success;
            var param = {
                code: K.Error.SuccessFalseError,
                response: response.info,
                errorType: response.errorType || "",
                channelId: response.channelId || "",
                isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
            };
            if (!response.success) {
                if (showError && isDisplay) {
                    inst.emit('error', param);
                }
                if (error !== null && error !== undefined) {
                    error(param);
                }
            } else {
                if (isDisplay) {
                    inst.emit('error', param);
                }
            }
            if (callback !== null && callback !== undefined && !timeoutFlag) {
                // console.log("LP request", JSON.parse(JSON.stringify(response)), data);
                // callback(response, data);
                // console.log("LP request", JSON.stringify(response), data);
            }
        });
    },
    //https://blogs.sap.com/2014/05/21/how-to-modify-an-apk-file/
    /**
     * 
     * @method pomeloBroadcast
     * @description Pomelo broadcast listener
     * @param {string} address - Pomelo API route
     * @param {method} callback -callback to be execute when the broadcast is fired from server!
     * @memberof Utilities.ServerCom#
     * 
     */
    pomeloBroadcast: function(address, callback) {


        // pomelo.on(address, function (data) {

        //     console.log("%c[broadcast] \n%o", 'color: Green;', data);
        //     if (callback !== null && callback !== undefined) {
        //         callback(data);
        //     }
        // });

        cc.systemEvent.on(address, function(data, from) {
            console.log("%c[broadcast] %s\n%o", 'color: Green;', from, data);
            if (callback !== null && callback !== undefined) {
                if (!data) {
                    return;
                }
                if (from == 'TournamentSocket') {
                    return;
                }
                
                if (!data.route) {
                    data.route = address;
                }
                callback(data);
            }
        });
    },

    /**
     * @method updateTracker
     * @description Maintain and track the record of request and their response!
     * @param {boolean} val -status of request whether sent or not
     * @param {String} key - Unique key for each request
     * @param {boolean} showLoading -sets Loading screen either active or De-Active
     * @memberof Utilities.ServerCom#
     */
    updateTracker: function(val, key, showLoading) {
        var incr = val ? +1 : -1;
        this.trackerCount = this.trackerCount + incr;
        this.tracker[key] = val;
    },


    /*********************************************************************************************************/
    refreshConnectToServer: function(serverURL, onSuccessCB, onFailCB) {
        console.log('socket.io refreshConnectToServer')
        socketIO.emit("RefreshToken", K.Token.access_token, function(response) {
            console.log(response);
        });
    },

    refreshConnectToPomelo: function(onSuccessCB, onFailCB) {
        console.log('pomelo refreshConnectToServer')
        var data = {
            access_token: K.Token.access_token
        };
        // pomelo.request("connector.entryHandler.updateAccessTokenForSession", data, function (response) {
        //     console.log(response);
        // }.bind(this));
    },

    socketIOConnectTable: function(host, accesstoken, channelid, cb) {},

    clearConnectCB() {
        this.cconnectCB = null;
    },

    socketIOConnectAfterDisconnection: function() {
        if (!cc.sys.isNative) {
            root.socketIO.io(this.host, {
                reconnection: false,
                pingTimeout: 500,
                pingInterval: 100,
                auth: {
                    access_token: K.Token.access_token,
                },
                transports: ["websocket", "polling"]
            });
        } else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                root.socketIO.io(this.host, {
                    reconnection: false,
                    rejectUnauthorized: false,
                    pingTimeout: 500,
                    pingInterval: 100,
                    timeout: (K.ServerAddress.ipAddress == "https://connector-txsocial-qa.creatiosoft.dev" ? 20000 : 1000),
                    auth: {
                        access_token: K.Token.access_token,
                    },
                    transports: ["websocket", "polling"]
                });
            } 
            else if (cc.sys.os === cc.sys.OS_IOS) {
                root.socketIO.io(this.host, {
                    reconnection: false,
                    rejectUnauthorized: false,
                    pingTimeout: 500,
                    pingInterval: 100,
                    timeout: 1000,
                    auth: {
                        access_token: K.Token.access_token,
                    }
                });
            }
        }

        socketIO.socket.on("connect", (arg) => {
            GameManager.isSocketIOConnected = true;
            GameManager.isConnected = true;
            ServerCom.socketConnected = true;
            clearTimeout(this.reconncetTimer);

            ServerCom.reconnecting.active = false;
            // this.isLoading = false;
            if (this.cconnectCB) {
                this.cconnectCB();
            }
            if (this.socketReconnectedCount > 0) {
                this.socketReconnected = true;
                var data = {};
                data.playerId = GameManager.user.playerId;
                data.channelId = '';
                data.isBackground = false;
                data.access_token = K.Token.access_token;
                data.isLoggedIn = false;
                ServerCom.pomeloRequest('connector.entryHandler.playerBackground', data, function (response) {
                    console.log('EVENT_SHOW playerBackground');
                    console.log(JSON.stringify(response));
                }.bind(this), null, 5000, false);
            }
            this.socketReconnectedCount = 0;
            // 
            // GameManager.startRefreshTokenTimer(() => {
            //     console.log("startRefreshTokenTimer");
            //     this.refreshConnectToServer("", () => {}, () => {});
            //     // this.refreshConnectToPomelo();
            // }); 
        });
        socketIO.socket.on("disconnect", (reason) => {
            console.log(GameManager.getCurrentTimestamp());
            console.log("disconnect", reason);
            GameManager.emit("socket_disconnected");
            GameManager.isSocketIOConnected = false;
            ServerCom.socketConnected = false;
            ServerCom.socketReconnected = false;
            K.disconnectRequestedByPlayer = false;

            if (K.disconnectMultiLogin) {
                K.disconnectMultiLogin = false
                return;
            }

            if (GameManager.isConnected && this.socketReconnectedCount < this.reconnectMaxAttempts && !this.sessionExpired) {
                this.socketReconnectedCount += 1;
                if (this.socketReconnectedCount > 2) {
                    ServerCom.reconnecting.active = true;
                }
                this.reconncetTimer = setTimeout(function() {
                    console.log("socket retry: ", this.socketReconnectedCount);
                    socketIO.socket.disconnect();
                    socketIO.socket.connect();
                }.bind(this), this.reconnectionDelay);
            } else {
                ServerCom.reconnecting.active = false;
                clearTimeout(this.reconncetTimer);
                this.socketReconnectedCount = 0;
                console.log("socket retry over");
            }
        });
        socketIO.socket.on('connect_error', (error) => {
            if (ServerCom.refreshTokenExpired) {
                ServerCom.reconnecting.active = false;
                // ServerCom.refreshTokenExpired = false;
                return;
            }
            console.log("connect_error");
            console.log(JSON.stringify(error));
            GameManager.isSocketIOConnected = false;
            ServerCom.socketConnected = false;
            ServerCom.reconnecting.active = false;

            GameManager.isConnected = true;
            K.disconnectRequestedByPlayer = false;

            if (!this.inGame) {
                cc.sys.localStorage.removeItem("tx_auto_login_token");
                cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
                cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
                cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
                cc.sys.localStorage.removeItem("tx_auto_login_username");
            }

            if (error.message == "jwt expired" || error.message == "Invalid Session") {
                this.sessionExpired = true;
                GameManager.popUpManager.hideAllPopUps();
                var param = {
                    code: K.Error.SessionError,
                    response: "Session error, please reload the game."
                };
                GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
            } else {
                if (LoginHandler.isLoading) {
                    GameManager.popUpManager.remove(PopUpType.NotificationPopup, function() {});

                    // if (!!GameScreen && GameScreen.tabRetrying) {
                    //     return;
                    // }

                    // console.error("GAME CONNECTED EXCEPTION WHILE LOADING", K.disconnectRequestedByPlayer);
                    if (K.disconnectRequestedByPlayer) {
                        K.disconnectRequestedByPlayer = false;
                    } else {

                        GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please check your\n Internet Connection.", function() {});
                        LoginHandler.isLoading = false;
                    }
                    // console.error("DISCONNECTION RESOLVED AND BOOL IS IS_LOADING", K.disconnectRequestedByPlayer);
                }
                console.log(this.socketReconnectedCount, this.reconnectMaxAttempts);
                // console.log(GameManager.isConnected)
                if (GameManager.isConnected && !GameManager.isSocketIOConnected && this.socketReconnectedCount >= this.reconnectMaxAttempts) {
                    ServerCom.reconnecting.active = false;
                    // console.log("uno 1")
                    GameManager.isConnected = false;
                    var param = {
                        code: K.Error.ConnectionError,
                        response: "Connection error",
                    };
                    GameManager.popUpManager.hideAllPopUps();
                    // if (!!GameScreen && GameScreen.tabRetrying) {
                    //     return;
                    // }
                    // console.error("GAME CONNECTED EXCEPTION", K.disconnectRequestedByPlayer);
                    if (K.disconnectRequestedByPlayer) {
                        K.disconnectRequestedByPlayer = false;
                    } else {
                        if ((ScreenManager.currentScreen === K.ScreenEnum.LoginScreen || ScreenManager.currentScreen === K.ScreenEnum.SignupScreen)) {

                        } else {
                            GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                        }
                    }
                    // console.error("DISCONNECTION RESOLVED AND BOOL IS IS_CONNECTED", K.disconnectRequestedByPlayer);
                } else {
                    if (GameManager.isConnected && this.socketReconnectedCount < this.reconnectMaxAttempts && !this.sessionExpired) {
                        this.socketReconnectedCount += 1;
                        ServerCom.reconnecting.active = true;
                        this.reconncetTimer = setTimeout(function() {
                            console.log("socket retry: ", this.socketReconnectedCount);
                            // socketIO.socket.disconnect();
                            socketIO.socket.connect();
                        }.bind(this), this.reconnectionDelay);
                    } else {
                        ServerCom.reconnecting.active = false;
                        clearTimeout(this.reconncetTimer);
                        this.socketReconnectedCount = 0;
                        console.log("socket retry over");

                        var param = {
                            code: K.Error.ConnectionError,
                            response: "Connection error",
                        };
                        GameManager.popUpManager.hideAllPopUps();
                        // if (!!GameScreen && GameScreen.tabRetrying) {
                        //     return;
                        // }
                        // console.error("GAME CONNECTED EXCEPTION", K.disconnectRequestedByPlayer);
                        if (K.disconnectRequestedByPlayer) {
                            K.disconnectRequestedByPlayer = false;
                        } else {
                            if ((ScreenManager.currentScreen === K.ScreenEnum.LoginScreen || ScreenManager.currentScreen === K.ScreenEnum.SignupScreen)) {
                            } else {
                                GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                            }
                        }
                    }
                }
                if (!GameManager.isConnected && !LoginHandler.isLoading && K.disconnectRequestedByPlayer) {
                    K.disconnectRequestedByPlayer = false;
                    // console.error("DISCONNECTION RESOLVED AND BOOL IS IS_LOADING", K.disconnectRequestedByPlayer);
                }
            }
        });
        socketIO.onAny((event, ...args) => {
            if (args[0] == undefined) {
                return;
            }
            // if (event != "Tournament:Refresh") {
            console.log("%c[socketIO/onAny] %s\n%o", 'color: Tomato;', event, args);
            // }

            if (event == "commonEventResponse" && args[0].eventOrigin) {
                if (args[0].eventName == "revealCards") {
                    cc.systemEvent.emit("revealCards", args[0].data, 'Socket');
                } else if (args[0].eventName == "revealCards") {
                    cc.systemEvent.emit("refundChips", args[0].data, 'Socket');
                } else {

                    console.log("onAny", args[0].eventOrigin);
                    cc.systemEvent.emit(args[0].eventOrigin, args[0].data, 'Socket');
                }

            } else {
                if (args[0].channelId) {
                    // console.log("!!!!!!!!", args, args[0].channelId);
                    // 668bf41ed55da2200ae8c90e
                    // 0bc6fa18-02b1-4de9-b5ec-cb05daf409dc
                    if (args[0].channelId.length > 30 && args[0].channelId.indexOf("-") != -1) {
                        console.log("!!!!!!!! filter");
                    } else {
                        if (!args[0].eventName) {
                            if (args[0].route && args[0].route == "playerCoins") {
                                cc.systemEvent.emit(args[0].route, args[0].data, 'Socket');
                            }
                            // if (args[0].route && args[0].route == "reserveSeat") {
                            //     cc.systemEvent.emit(args[0].route, args[0].data);
                            // }
                        } else {
                            cc.systemEvent.emit(args[0].eventName, args[0].data, 'Socket');
                        }
                    }
                } else if (args[0].data && args[0].data.channelId) {
                    cc.systemEvent.emit(args[0].route, args[0].data, 'Socket');
                } else if (!args[0].data && event.indexOf('Tournament') != -1) {
                    cc.systemEvent.emit(args[0].eventName, args, 'Socket');
                } else if (event == "forcedisconnect") {
                    K.disconnectMultiLogin = true;
                    cc.systemEvent.emit("forcedisconnect", args, 'Socket');
                } else if (event == "buddyResponseEvent") {
                    cc.systemEvent.emit("buddyResponseEvent", args[0], 'Socket');
                }
            }
            // else if (args[0].data.eventName) {
            //     cc.systemEvent.emit(args[0].eventName, args[0].data);
            // }
        });
    },

    attachPingLog(socket, tag) {
        function getLocalTimeString() {
            const now = new Date(); // 等价于 Date.now()
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        if (!socket || !socket.io || !socket.io.engine) {
            console.log('[HB] engine not ready', tag);
            return;
        }

        const engine = socket.io.engine;

        // 将要发出去的包（看有没有 ping）
        engine.on('packetCreate', (packet) => {
            if (packet && (packet.type === 'ping' || packet.type === 2)) {
                console.log('[HB] SEND PING', Date.now(), tag, packet);
            }
        });

        // 收到的包（看有没有 pong / ping）
        engine.on('packet', (packet) => {
            if (!packet) return;
            if (packet.type === 'ping' || packet.type === 2) {
                console.log('[HB] RECV PING', Date.now(), tag, packet);
            }
            if (packet.type === 'pong' || packet.type === 3) {
                console.log('[HB] RECV PONG', Date.now(), tag, packet.data);
            }
        });

        // 部分版本还有这两个
        if (engine.on) {
            engine.on('ping', () => console.log('[HB] engine ping', Date.now()));
            engine.on('pong', () => {
                console.log('[HB] engine pong', Date.now());
            });
        }

        // Manager 层（v3/v4 较常见）
        socket.io.on('ping', () => console.log('[HB] manager ping', Date.now(), tag));
        socket.io.on('pong', (ms) => console.log('[HB] manager pong', Date.now(), 'rtt=', ms, tag));
    },

    socketIOConnect: function(host, cb) {
        console.log("[Socket / ServerCom] Connecting to Tournament Server:", host);

        this.isLoading = true;
        this.cconnectCB = cb;

        var root = window;
        var socketIO = new window.SocketService();
        this.host = host;

        if (!cc.sys.isNative) {
            socketIO.io(host, {
                reconnection: false,
                pingTimeout: 5000,
                pingInterval: 15000,
                auth: {
                    access_token: K.Token.access_token,
                },
                transports: ["websocket", "polling"]
            });
        } else {

            if (cc.sys.os === cc.sys.OS_ANDROID) {
                socketIO.io(host, {
                    // autoConnect: false,
                    reconnection: false,
                    rejectUnauthorized: false,
                    pingTimeout: 5000,
                    pingInterval: 15000,
                    timeout: (K.ServerAddress.ipAddress == "https://connector-txsocial-qa.creatiosoft.dev" ? 20000 : 1000),
                    auth: {
                        access_token: K.Token.access_token,
                    },
                    transports: ["websocket", "polling"]
                });
            } 
            else if (cc.sys.os === cc.sys.OS_IOS) {
                socketIO.io(host, {
                    // autoConnect: false,
                    reconnection: false,
                    rejectUnauthorized: false,
                    pingTimeout: 5000,
                    pingInterval: 15000,
                    timeout: 1000,
                    auth: {
                        access_token: K.Token.access_token,
                    }
                });
            }
        }
        root.socketIO = socketIO;
        //
        socketIO.socket.on("connect", (arg) => {
            console.log('[Socket / ServerCom] Connected to:', host);
            // this.attachPingLog(socketIO.socket, 'ios');

            GameManager.isSocketIOConnected = true;
            GameManager.isConnected = true;
            ServerCom.socketConnected = true;
            clearTimeout(this.reconncetTimer);

            ServerCom.reconnecting.active = false;
            
            if (this.cconnectCB) {
                this.cconnectCB();
            }
            if (this.socketReconnectedCount > 0) {
                this.socketReconnected = true;

                var data = {};
                data.playerId = GameManager.user.playerId;
                data.channelId = '';
                data.isBackground = false;
                data.access_token = K.Token.access_token;
                data.isLoggedIn = false;
                ServerCom.pomeloRequest('connector.entryHandler.playerBackground', data, function (response) {
                    console.log('EVENT_SHOW playerBackground');
                    console.log(JSON.stringify(response));
                }.bind(this), null, 5000, false);
            }
            this.socketReconnectedCount = 0;
            // 
            // GameManager.startRefreshTokenTimer(() => {
            //     console.log("startRefreshTokenTimer");
            //     this.refreshConnectToServer("", () => {}, () => {});
            //     // this.refreshConnectToPomelo();
            // }); 
        });
        socketIO.socket.on("disconnect", (reason) => {
            console.log(GameManager.getCurrentTimestamp());
            console.log("disconnect", reason);
            GameManager.emit("socket_disconnected");
            GameManager.isSocketIOConnected = false;
            ServerCom.socketConnected = false;
            ServerCom.socketReconnected = false;
            K.disconnectRequestedByPlayer = false;

            if (K.disconnectMultiLogin) {
                K.disconnectMultiLogin = false
                return;
            }

            if (GameManager.isConnected && this.socketReconnectedCount < this.reconnectMaxAttempts && !this.sessionExpired) {
                this.socketReconnectedCount += 1;
                if (this.socketReconnectedCount > 1) {
                    ServerCom.reconnecting.active = true;
                }
                this.reconncetTimer = setTimeout(function() {
                    console.log("socket retry: ", this.socketReconnectedCount);
                    socketIO.socket.disconnect();
                    socketIO.socket.connect();
                }.bind(this), this.reconnectionDelay);
            } else {
                ServerCom.reconnecting.active = false;
                clearTimeout(this.reconncetTimer);
                this.socketReconnectedCount = 0;
                console.log("socket retry over");
            }
        });
        socketIO.socket.on('connect_error', (error) => {
            if (ServerCom.refreshTokenExpired) {
                // ServerCom.refreshTokenExpired = false;
                return;
            }
            console.log(GameManager.getCurrentTimestamp());
            console.log("connect_error");
            console.log(JSON.stringify(error));
            GameManager.isSocketIOConnected = false;
            ServerCom.socketConnected = false;
            ServerCom.reconnecting.active = false;

            GameManager.isConnected = true;
            K.disconnectRequestedByPlayer = false;

            if (!this.inGame) {
                cc.sys.localStorage.removeItem("tx_auto_login_token");
                cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
                cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
                cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
                cc.sys.localStorage.removeItem("tx_auto_login_username");
            }

            if (error.message == "jwt expired" || error.message == "Invalid Session") {
                this.sessionExpired = true;
                GameManager.popUpManager.hideAllPopUps();
                var param = {
                    code: K.Error.SessionError,
                    response: "Session error, please reload the game."
                };
                GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
            } else {
                if (LoginHandler.isLoading) {
                    GameManager.popUpManager.remove(PopUpType.NotificationPopup, function() {});

                    // if (!!GameScreen && GameScreen.tabRetrying) {
                    //     return;
                    // }

                    // console.error("GAME CONNECTED EXCEPTION WHILE LOADING", K.disconnectRequestedByPlayer);
                    if (K.disconnectRequestedByPlayer) {
                        K.disconnectRequestedByPlayer = false;
                    } else {

                        GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please check your\n Internet Connection.", function() {});
                        LoginHandler.isLoading = false;
                    }
                    // console.error("DISCONNECTION RESOLVED AND BOOL IS IS_LOADING", K.disconnectRequestedByPlayer);
                }
                console.log(this.socketReconnectedCount, this.reconnectMaxAttempts);
                // console.log(GameManager.isConnected)
                if (GameManager.isConnected && !GameManager.isSocketIOConnected && this.socketReconnectedCount >= this.reconnectMaxAttempts) {
                    ServerCom.reconnecting.active = false;
                    // console.log("uno 1")
                    GameManager.isConnected = false;
                    var param = {
                        code: K.Error.ConnectionError,
                        response: "Connection error",
                    };
                    GameManager.popUpManager.hideAllPopUps();
                    // if (!!GameScreen && GameScreen.tabRetrying) {
                    //     return;
                    // }
                    // console.error("GAME CONNECTED EXCEPTION", K.disconnectRequestedByPlayer);
                    if (K.disconnectRequestedByPlayer) {
                        K.disconnectRequestedByPlayer = false;
                    } else {
                        if ((ScreenManager.currentScreen === K.ScreenEnum.LoginScreen || ScreenManager.currentScreen === K.ScreenEnum.SignupScreen)) {

                        } else {
                            GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                        }
                    }
                    // console.error("DISCONNECTION RESOLVED AND BOOL IS IS_CONNECTED", K.disconnectRequestedByPlayer);
                } else {
                    console.log(this.socketReconnectedCount, this.reconnectMaxAttempts);
                    console.log("GameManager.isConnected", GameManager.isConnected);
                    console.log("this.sessionExpired", this.sessionExpired);
                    if (GameManager.isConnected && this.socketReconnectedCount < this.reconnectMaxAttempts && !this.sessionExpired) {
                        this.socketReconnectedCount += 1;
                        ServerCom.reconnecting.active = true;
                        this.reconncetTimer = setTimeout(function() {
                            console.log("socket retry: ", this.socketReconnectedCount);
                            // socketIO.socket.disconnect();
                            socketIO.socket.connect();
                        }.bind(this), this.reconnectionDelay);
                    } else {
                        ServerCom.reconnecting.active = false;
                        clearTimeout(this.reconncetTimer);
                        this.socketReconnectedCount = 0;
                        console.log("socket retry over");

                        var param = {
                            code: K.Error.ConnectionError,
                            response: "Connection error",
                        };
                        GameManager.popUpManager.hideAllPopUps();
                        // if (!!GameScreen && GameScreen.tabRetrying) {
                        //     return;
                        // }
                        // console.error("GAME CONNECTED EXCEPTION", K.disconnectRequestedByPlayer);
                        if (K.disconnectRequestedByPlayer) {
                            K.disconnectRequestedByPlayer = false;
                        } else {
                            if ((ScreenManager.currentScreen === K.ScreenEnum.LoginScreen || ScreenManager.currentScreen === K.ScreenEnum.SignupScreen)) {
                            } else {
                                GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function() {});
                            }
                        }
                    }
                }
                if (!GameManager.isConnected && !LoginHandler.isLoading && K.disconnectRequestedByPlayer) {
                    K.disconnectRequestedByPlayer = false;
                    // console.error("DISCONNECTION RESOLVED AND BOOL IS IS_LOADING", K.disconnectRequestedByPlayer);
                }
            }
        });
        socketIO.onAny((event, ...args) => {
            if (args[0] == undefined) {
                return;
            }
            // if (event != "Tournament:Refresh") {
            console.log("%c[socketIO/onAny] %s\n%o", 'color: Tomato;', event, args);
            // }

            if (event == "commonEventResponse" && args[0].eventOrigin) {
                // cc.systemEvent.emit(args[0].eventOrigin, args[0].data);

                // if (args[0].eventOrigin == "jackpotWin") {
                //     console.log("jackpotWin", args[0].data);
                //     GameManager.popUpManager.show(PopUpType.BBJWinnerPopup, args[0].data, function () { });
                // }
                // if (args[0].eventOrigin == "jackpotWinNotify") {
                //     GameManager.popUpManager.show(PopUpType.BBJ_HighHandToast, args[0].data, function () { });
                // }
                if (args[0].eventName == "revealCards") {
                    cc.systemEvent.emit("revealCards", args[0].data, 'Socket');
                } else if (args[0].eventName == "revealCards") {
                    cc.systemEvent.emit("refundChips", args[0].data, 'Socket');
                } else {
                    cc.systemEvent.emit(args[0].eventOrigin, args[0].data, 'Socket');
                }

            } else {
                if (args[0].channelId) {
                    // console.log("!!!!!!!!", args, args[0].channelId);
                    // 668bf41ed55da2200ae8c90e
                    // 0bc6fa18-02b1-4de9-b5ec-cb05daf409dc
                    if (args[0].channelId.length > 30 && args[0].channelId.indexOf("-") != -1) {
                        console.log("!!!!!!!! filter");
                    } else {
                        if (!args[0].eventName) {
                            if (args[0].route && args[0].route == "playerCoins") {
                                cc.systemEvent.emit(args[0].route, args[0].data, 'Socket');
                            }
                            // if (args[0].route && args[0].route == "reserveSeat") {
                            //     cc.systemEvent.emit(args[0].route, args[0].data);
                            // }
                        } else {
                            cc.systemEvent.emit(args[0].eventName, args[0].data, 'Socket');
                        }
                    }
                } else if (args[0].data && args[0].data.channelId) {
                    cc.systemEvent.emit(args[0].route, args[0].data, 'Socket');
                } else if (!args[0].data && event.indexOf('Tournament') != -1) {
                    cc.systemEvent.emit(args[0].eventName, args, 'Socket');
                } else if (event == "forcedisconnect") {
                    K.disconnectMultiLogin = true;
                    cc.systemEvent.emit("forcedisconnect", args, 'Socket');
                } else if (event == "buddyResponseEvent") {
                    cc.systemEvent.emit("buddyResponseEvent", args[0], 'Socket');
                }
            }
            // else if (args[0].data.eventName) {
            //     cc.systemEvent.emit(args[0].eventName, args[0].data);
            // }
        });

    },

    socketIORequest: function(address, data, callback, error, timeout, showLoading = true, showError = true, showLabel = "", callback2) {
        if (window.SharedSocket) {
            window.SharedSocket.request(address, data, callback, error, timeout, showLoading, callback2);
            return;
        }

        var inst = this;
        // console.log("socketIORequest1");
        if (typeof data != 'object') {
            let dat = {};
            dat.data = data;
            data = dat;
        }

        if (!data) {
            data = {};
        }

        if (typeof data == 'object') {
            if (data.isLoggedIn == null || data.isLoggedIn == undefined)
                data.isLoggedIn = true;
            if (data.isLoggedIn) {
                // console.log("socketIORequest2");
                if (!GameManager.isConnected) {
                    inst.emit('error', {
                        code: K.Error.ConnectionError,
                        response: "You are not logged in !!",
                    });
                    return;
                }
            }
        } else {
            if (!GameManager.isConnected) {
                // console.log("socketIORequest3");
                inst.emit('error', {
                    code: K.Error.ConnectionError,
                    response: "You are not logged in !!",
                });
                return;
            }
        }

        if (!GameManager.isSocketIOConnected) {
            inst.emit('error', {
                code: K.Error.ConnectionError,
                response: "socket.io connection error",
            });

            return;
        }

        var timeoutFlag = false;
        /* Used only for game request - Start */

        this.tracker = this.tracker || {};
        // var key = "";
        var key = data.channelId || "";
        if (key == "") {
            key = data.tableId || "";
        }
        key = key + address;
        console.log("%c[R]Request Key: %s", 'color: Purple;', key);
        if (this.tracker[key] !== undefined) {
            if (this.tracker[key]) {
                console.log("false " + key);
                // return;
            } else {
                this.updateTracker(true, key, showLoading, showLabel);
            }
        } else {
            //TODO 
            this.updateTracker(true, key, showLoading, showLabel);
        }
        /** Used only for game request - End */

        var timer = setTimeout(function() {
            // console.log("uno pakda, ", address);
            // inst.emit('error', {
            //     code: K.Error.TimeOutError,
            //     response: "Timeout at " + address
            // });
            // timeoutFlag = true;
            // if (error !== null && error !== undefined) {
            //     error({
            //         code: K.Error.TimeOutError,
            //         response: "Timeout at " + address,
            //     });
            // }

            // reset multi request block
            inst.tracker[key] = false;
            this.updateTracker(false, key, showLoading);

        }.bind(this), timeout || 5000); // Discuss timeout

        delete data.isLoggedIn;

        console.log("%c[REQ] %s\n%o", 'color: Purple;', address, data);
        socketIO.emit(address.split("|")[0], {
                eventName: address.split("|")[1],
                data: data
            },
            function(response) {
                console.log("%c[RES] %s\n%o", 'color: Purple;', address, response);
                // console.log(JSON.stringify(response));
                // 
                // clearTimeout(timer);
                // reset multi request block
                var respKey = response.channelId || "";
                if (respKey == "") {
                    respKey = response.tableId || "";
                }
                respKey = respKey + address;
                console.log("%c[R/CB] Key: %s", 'color: Purple;', respKey);
                inst.updateTracker(false, respKey, showLoading, showLabel);
                var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : !response.success;
                var param = {
                    code: K.Error.SuccessFalseError,
                    response: response.info,
                    errorType: response.errorType || "",
                    channelId: response.channelId || "",
                    isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                };
                if (!response.success) {
                    if (showError && isDisplay) {
                        inst.emit('error', param);
                    }
                    if (error !== null && error !== undefined) {
                        error(param);
                    }
                } else {
                    if (isDisplay) {
                        inst.emit('error', param);
                    }
                }
                if (callback !== null && callback !== undefined && !timeoutFlag) {

                    if ((response.action == "resume" || response.action == "preCheck" || response.action == "sitOut") && response.success) {
                        callback(response, data);
                    }
                    // console.log("LP request", JSON.parse(JSON.stringify(response)), data);
                    // callback(response, data);
                    // console.log("LP request", JSON.stringify(response), data);
                }

                if (callback2 !== null && callback2 !== undefined && !timeoutFlag) {
                    // console.log("LP request", JSON.parse(JSON.stringify(response)), data);
                    callback2(response, data);
                    // console.log("LP request", JSON.stringify(response), data);
                }
            }
        ).then(data => {
            console.log("then", data);
            clearTimeout(timer);
            if (callback !== null && callback !== undefined && !timeoutFlag) {
                callback(data.data, data);
            }
        });
    },

    socketIOBroadcast: function(address, callback) {
        if (window.SharedSocket) {
            window.SharedSocket.socketIOBroadcast(address, callback);
            return;
        }

        if (!window.socketIO || !window.socketIO.socket) {
            cc.warn('[ServerCom] socketIOBroadcast: socket not ready for', address);
            return;
        }

        console.log("%c[B/ON] %s", 'color: green;', address);
        window.socketIO.socket.on(address, function(data) {
            if (address != "Tournament:Refresh") {
                console.log("%c[B/REV] %s\n%o", 'color: blue;', address, data);
            }
            if (callback !== null && callback !== undefined) {
                callback(data);
            }
        });
    },

});

//user data in getConnector
//remove online players number
//table update relevent broadcasts
//side table broadcasts