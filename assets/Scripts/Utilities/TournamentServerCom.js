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
        preLogin: {
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
        root.TournamentServerCom = this;

        cc.game.on(cc.game.EVENT_SHOW, () => {
            if (!window.TournamentSocket) return;

            if (!window.TournamentSocket.connected) {
                console.log("[Socket] 回到前台且未连接，执行手动重连");
                window.TournamentSocket.connect();
            }
            else {
                console.log("[Socket] 回到前台，已经连接，跳过");
            }
        });
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

        TournamentServerCom.socketIORequest("common|" + address, data, callback, error, timeout, showLoading, showError, "", callback2);

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
        // console.log("pomelo.request", address, data);
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

        cc.systemEvent.on(address, function(data, from) {
            console.log("%c[broadcast] %s\n%o", 'color: Green;', from, data);
            if (callback !== null && callback !== undefined) {
                if (!data) {
                    return;
                }

                if (from == 'Socket') {
                    return;
                }

                if (!data.route) {
                    data.route = address;
                }
                callback(data);
            }
        });
    },


    updateTracker: function(val, key, showLoading) {
        var incr = val ? +1 : -1;
        this.trackerCount = this.trackerCount + incr;
        this.tracker[key] = val;
    },

    clearConnectCB() {
        this.cconnectCB = null;
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

        if (!window.TournamentSocket || !window.TournamentSocket.connected) {
            if (window.TournamentSocket) {
                // console.log("socketIORequest4 - tournament socket not yet connected, queuing:", address);
                window.TournamentSocket.once('connect', function() {
                    inst.socketIORequest(address, data, callback, error, timeout, showLoading, showError, showLabel, callback2);
                });
            } else {
                // console.log("socketIORequest4 - tournament socket not initialized");
                inst.emit('error', {
                    code: K.Error.ConnectionError,
                    response: "Tournament socket not connected",
                });
            }
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

        if (address == 'tournamentGameEvent|enterTable') {
            // console.trace('tournamentGameEvent|enterTable');
        }

        console.log("%c[TSC/REQ] %s\n%o", 'color: Purple;', address, data);
        window.tTournamentSocket.emit(address.split("|")[0], {
                eventName: address.split("|")[1],
                data: data
            },
            function(response) {
                console.log("%c[TSC/RES] %s\n%o", 'color: Purple;', address, response);
                clearTimeout(timer);
                var respKey = response.channelId || "";
                if (respKey == "") {
                    respKey = response.tableId || "";
                }
                respKey = respKey + address;
                console.log("%c[TSC/R/CB] Key: %s", 'color: Purple;', respKey);
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
                // if (callback !== null && callback !== undefined && !timeoutFlag) {
                //     callback(response, data);
                // }
                // if (callback2 !== null && callback2 !== undefined && !timeoutFlag) {
                //     callback2(response, data);
                // }
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
        console.log("%c[TSC/ON] %s", 'color: green;', address);
        if (!window.TournamentSocket) {
            cc.warn('[TournamentServerCom] socketIOBroadcast: socket not ready for', address);
            return;
        }
        window.TournamentSocket.on(address, function() {
            var args = Array.prototype.slice.call(arguments);
            if (address != "Tournament:Refresh") {
                console.log("%c[TSC/ON/REV] %s\n%o", 'color: blue;', address, args[0]);
            }
            if (callback !== null && callback !== undefined) {
                callback.apply(null, args);
            }
        });
    },

    getAuth: function() {
        return K.Token.access_token;
    },

    connectTournamentSocket: function(onConnectCb) {

        if (!K.NewTournament) return;

        if (window.TournamentSocket && window.TournamentSocket.connected) {
            console.log("[TournamentServerCom] Already connected.");
            if (onConnectCb) onConnectCb();
            return;
        }

        if (window.TournamentSocket) {
            // Still connecting — just queue the callback, don't create another socket
            if (onConnectCb) window.TournamentSocket.once('connect', onConnectCb);
            return;
        }

        console.log("[Socket / TournamentServerCom] Connecting to Tournament Server:", K.ServerAddress.tournamentServer);

        var tSocket = new window.SocketService();
        if (!cc.sys.isNative) {
            tSocket.io(K.ServerAddress.tournamentServer, {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 10000,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                auth: {
                    access_token: this.getAuth(),
                },
            });
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                tSocket.io(K.ServerAddress.tournamentServer, {
                    transports: ["websocket", "polling"],
                    reconnection: true,
                    reconnectionAttempts: 10000,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    auth: {
                        access_token: this.getAuth(),
                    },
                });
            } 
            else if (cc.sys.os === cc.sys.OS_IOS) {
                tSocket.io(K.ServerAddress.tournamentServer, {
                    reconnection: true,
                    reconnectionAttempts: 10000,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    auth: {
                        access_token: this.getAuth(),
                    },
                });
            }
        }

        window.TournamentSocket = tSocket.socket;
        window.tTournamentSocket = tSocket;

        tSocket.onAny(function(event, data) {
            if (event !== "commonEventResponse" || !data) return;
            console.log("%c[TSC/onAny] %s\n%o", 'color: DodgerBlue;', event, data);

            if (data.eventOrigin) {
                cc.systemEvent.emit(data.eventOrigin, data.data, 'TournamentSocket');
            }
            if (!data.channelId) return;
            if (data.eventName && data.eventName == 'leave') return;
            // https://sprints.zoho.in/workspace/creatiosoft#P44/itemdetails/I2233
            var name = data.eventName || data.route;
            var target = data.eventTo || data.channelId;
            if (!name) return;
            cc.systemEvent.emit(target, data.eventTo ? data : {
                eventName: name,
                data: data.data,
                channelId: data.channelId
            }, 'TournamentSocket');
        });

        tSocket.socket.once('connect', function() {
            console.log('[Socket / TournamentServerCom] Connected to:', K.ServerAddress.tournamentServer);
            if (onConnectCb) onConnectCb();
        });

        tSocket.socket.on('disconnect', function(reason) {
            cc.log('[TournamentServerCom] Disconnected:', reason);
        });

        tSocket.socket.on('connect_error', function(err) {
            cc.warn('[TournamentServerCom] Connection error:', err.message);
        });

        tSocket.socket.on('forcedisconnect', function(data) {
            cc.warn('[TournamentServerCom] Force disconnected by server:', data);
            tSocket.socket.disconnect();
            window.TournamentSocket = null;
        });

    },

});

//user data in getConnector
//remove online players number
//table update relevent broadcasts
//side table broadcasts