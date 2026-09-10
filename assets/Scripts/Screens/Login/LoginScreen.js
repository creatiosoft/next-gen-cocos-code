var AbstractScreen = require('AbstractScreen');
var LoginHandler = require('LoginHandler');
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var JoinData = require('PostTypes').JoinChannel;

var TXLogin = require('TXLogin');
var TXMembershipAgreement = require('TXMembershipAgreement');
var TXTermsAndCondition = require('TXTermsAndCondition');

/**
 * @classdesc Handles User Login View/Screen
 * @class Screens.Login.LoginScreen
 * @extends AbstractScreen
 */
var inst;
cc.Class({
    extends: AbstractScreen,

    properties: {
        loginHandler: {
            default: null,
            type: LoginHandler,
        },
    },

    tourData: null,

    onLoad: function() {
        GameManager.init();
    },

    start: function() {
        inst = this;
        window.LoginScreen = this;
        inst.clientInit();
    },

    onShow: function() {
        GameManager.popUpManager.show(PopUpType.TXLogin);
    },

    /**
     * @description Determines the client being used fr login and checks server status
     * @method clientInit
     * @param {bool} autoLogin -default value false
     * @memberof Screens.Login.LoginScreen#
     */
    clientInit: function(autoLogin = false, noLoginSHow = false) {
        // console.log("client init")

        var device = "";
        if (cc.sys.isBrowser) {
            device = "browser";
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                device = "androidApp";
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                device = "iosApp";
            } else if (cc.sys.os === cc.sys.OS_OSX) {

                device = "mac";
            }

        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            device = "androidApp";
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            device = "iosApp";
        } else if (cc.sys.os === cc.sys.OS_WINDOWS) {
            device = "windows";
        } else if (cc.sys.os === cc.sys.OS_OSX) {
            device = "mac";
        }

        this.loginHandler.init(device);

        if (cc.sys.localStorage.getItem("tx_auto_login_token") != null && cc.sys.localStorage.getItem("txUserName") != null) {

            K.Token.access_token = cc.sys.localStorage.getItem("tx_auto_login_token");
            K.Token.refresh_token = cc.sys.localStorage.getItem("tx_auto_login_refresh_token");
            K.Token.access_token_expire_at = Number(cc.sys.localStorage.getItem("tx_auto_login_access_token_expire_at"));
            K.Token.refresh_token_expire_at = Number(cc.sys.localStorage.getItem("tx_auto_login_refresh_token_expire_at"));

            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS && K.AgoraEnabled) {
                let status = jsb.reflection.callStaticMethod("AppController", "checkVideoPermission");
                if (status != 3) {
                    GameManager.popUpManager.show(PopUpType.Permission);
                }
            }
            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID && K.AgoraEnabled) {
                let status = jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "checkVideoPermission",
                    "()I"
                );
                if (status != 3) {
                    GameManager.popUpManager.show(PopUpType.Permission);
                }
            }
            this.loginHandler.checkServerStatus((response) => {
                if (response.success) {
                    var result = response.result;
                    K.androidBuildUrl = response.androidBuildUrl || '';
                    K.iosBuildUrl = response.iosBuildUrl || '';
                    GameManager.serverStatus = result;
                    if (result.isUpdateRequired) {
                        GameManager.popUpManager.show(PopUpType.NewVersionPopup, "Please update the game.", function() {});
                    } else if (result.isInMaintainance) {
                        GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                            message: result.maintenanceMessage || "Server is under maintenance.\nPlease come back later.",
                            action: "checkServerStatus"
                        }, function() {});
                    } else {
                        GameManager.loginHandler.txLoginWithToken(
                            (data) => {
                                if (!data) {
                                    return;
                                }
                                if (data.errorCode === "MaintenanceImminent" || data.errorCode === "MaintenanceStarted") {
                                    GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                                        message: data.message || "Server is under maintenance.\nPlease come back later.",
                                        action: "checkServerStatus"
                                    }, function() {});
                                    return;
                                }
                                if (data.status == "success") {

                                    K.BBJEnabled = data.user.isBbjEnabled;
                                    K.SmartFocus = data.user.settings.smartFocus;
                                    K.BBJAmount = Math.round(data.user.jackpotCurrentPool.currentAmount * 100) / 100;
                                    K.HighHandEnabled = data.user.isHighHandEnabled;
                                    K.AgoraEnabled = data.isLiveStreamingEnabled;

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

                                    if (data.notification) {
                                        GameManager.notification = data.notification;
                                    }

                                    K.Token.access_token = cc.sys.localStorage.getItem("tx_auto_login_token");
                                    K.Token.refresh_token = cc.sys.localStorage.getItem("tx_auto_login_refresh_token");
                                    K.Token.access_token_expire_at = cc.sys.localStorage.getItem("tx_auto_login_access_token_expire_at");
                                    K.Token.refresh_token_expire_at = cc.sys.localStorage.getItem("tx_auto_login_refresh_token_expire_at");

                                    inst.pauseLogin = false;

                                    if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS && K.AgoraEnabled) {
                                        let status = jsb.reflection.callStaticMethod("AppController", "checkVideoPermission");

                                        if (status != 3) {
                                            GameManager.popUpManager.show(PopUpType.Permission);
                                        }
                                    }
                                    if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID && K.AgoraEnabled) {
                                        let status = jsb.reflection.callStaticMethod(
                                            "org/cocos2dx/javascript/AppActivity",
                                            "checkVideoPermission",
                                            "()I"
                                        );
                                        if (status != 3) {
                                            GameManager.popUpManager.show(PopUpType.Permission);
                                        }
                                    }

                                    ServerCom.socketIOConnect(K.ServerAddress.gameServer + ":" + K.ServerAddress.gamePort, () => {
                                        if (!ServerCom.socketConnected) {
                                            return;
                                        }
                                        GameManager.setUserData(data.user);
                                        setTimeout(function() {
                                            inst.onSuccessfullLogin(inst);
                                        }, 100);
                                    });
                                } else {
                                    if (data.status == "region_restricted") {
                                        GameManager.popUpManager.show(PopUpType.AccessRestrictedPopup, data.message, function() {});
                                    }
                                }
                            },
                            (err) => {
                                cc.systemEvent.emit("LaunchOver");
                            });
                    }
                } else {
                    GameManager.popUpManager.show(PopUpType.NewVersionPopup, "Please update the game.", function() {});
                }
            }, function(error) {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please check your\nInternet Connection.", function() {});
                cc.systemEvent.emit("RESTORE_LOGIN");
            });
        } else {
            GameManager.isForceDisconnection = false;
            setTimeout(() => {
                this.loginHandler.checkServerStatus(function(response) {

                    console.log("checkServerStatus 111", response);

                    if (response.success) {

                        console.log("checkServerStatus 222");

                        var result = response.result;
                        GameManager.serverStatus = result;
                        K.androidBuildUrl = response.androidBuildUrl || '';
                        K.iosBuildUrl = response.iosBuildUrl || '';
                        inst.loginHandler.setAddress(result.ipV4Address, result.ipV6Address);

                        if (result.isUpdateRequired) {
                            GameManager.popUpManager.show(PopUpType.NewVersionPopup, "Please update the game.", function() {});
                        } else if (result.isInMaintainance) {
                            GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                                message: result.maintenanceMessage || "Server is under maintenance.\nPlease come back later.",
                                action: "checkServerStatus"
                            }, function() {});
                        } else {
                            if (noLoginSHow) return;
                            if (autoLogin) {
                                console.log("checkServerStatus 333");
                                inst.onSuccessfullLogin(inst);
                                return;
                            } else {
                                console.log("checkServerStatus 444");
                                cc.systemEvent.emit("LaunchOver");
                            }
                        }
                    } else {
                        GameManager.popUpManager.show(PopUpType.NewVersionPopup, "Please update the game.", function() {});
                    }
                }, function(error) {
                    GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please check your\nInternet Connection.", function() {});
                    cc.systemEvent.emit("RESTORE_LOGIN");
                });
            }, 1);
        }
    },

    /**
     * @description Successfull login callback - multi-client check API
     * @method onSuccessfullLogin
     * @param {} inst
     * @memberof Screens.Login.LoginScreen#
     */
    onSuccessfullLogin: function(inst) {
        GameManager.isConnected = false;
        console.log("onSuccessfullLogin", ServerCom.inGame);

        cc.sys.localStorage.setItem("tx_auto_login_token", K.Token.access_token);
        cc.sys.localStorage.setItem("tx_auto_login_refresh_token", K.Token.refresh_token);
        cc.sys.localStorage.setItem("tx_auto_login_access_token_expire_at", K.Token.access_token_expire_at);
        cc.sys.localStorage.setItem("tx_auto_login_refresh_token_expire_at", K.Token.refresh_token_expire_at);

        inst.loginHandler.checkForMultiClient(function(response) {
            if (response.success) {
                GameManager.isConnected = true;

                let hit = false;
                let cashGameActive = false;

                if (response.activeNotifications && response.activeNotifications.length > 0) {
                    for (var i = 0; i < response.activeNotifications.length; i++) {
                        if (response.activeNotifications[i].remainingSeconds > 0) {
                            GameManager.scheduleOnce(function() {
                                GameManager.popUpManager.show(PopUpType.TournamentStartingSoonPopup, response.activeNotifications[i], function() {});
                            }, 2);
                            break;
                        }
                    }
                }

                if (K.NewTournament && window.TournamentServerCom) {
                    // hit = true;
                    window.TournamentServerCom.connectTournamentSocket(function() {
                        inst.loginHandler.checkForMultiClientTour(function(response) {
                            console.log('checkForMultiClientTour', response);
                            inst.restoreTournamentChannels(response.tournamentChannels, cashGameActive);
                            window.TournamentLobbyHandler.requestTournamentLobbyList({}, function() {}, function() {});
                            cc.systemEvent.emit("TournamentReload");
                        });
                    });
                }

                if (response.chips && GameManager.user) {
                    GameManager.user.freeChips = response.chips.freeChips;
                    GameManager.user.realChips = response.chips.realChips;
                    GameManager.emit("refreshPlayerChips");
                }

                if (!!response.joinChannels && response.joinChannels.length > 0) {
                    hit = true;
                    cashGameActive = true;
                    GameManager.scheduleOnce(function() {
                        var joinCount = response.joinChannels.length;
                        console.log("response.joinChannels", response.joinChannels);
                        response.joinChannels.forEach(function(element, index) {
                            var newData = new JoinData(element);
                            if (!!newData.channelId) {
                                TableHandler.joinTableList.push(newData.channelId);
                                newData.tableId = "";
                                GameManager.join(newData.channelId, K.PomeloAPI.joinChannel, newData, null, null, index + 1, joinCount, true);
                            } else {
                                GameManager.join(newData.tableId, K.PomeloAPI.joinChannel, newData, null, null, index + 1, joinCount, true);
                            }
                        }, this);
                    }, 0.1);
                }
                if (!!response.joinChannels && response.joinChannels.length == 0 && GameManager.activeTableCount > 0) {
                    GameManager.reset(true);
                }

                if (hit) {

                }
                else {
                    // ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function() {}, false);
                }
            } else {
                K.disconnectRequestedByPlayer = true;
                ScreenManager.showScreen(K.ScreenEnum.LoginScreen, 10, function() {}, false);
            }
        }.bind(this));
    },

    postLogin(user) {
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS && K.AgoraEnabled) {
            let status = jsb.reflection.callStaticMethod("AppController", "checkVideoPermission");
            console.log("postLogin checkVideoPermission1", status);

            if (status != 3) {
                console.log("postLogin checkVideoPermission3 Permission");
                GameManager.popUpManager.show(PopUpType.Permission);
            }
        }
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID && K.AgoraEnabled) {
            let status = jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "checkVideoPermission",
                "()I"
            );
            console.log("checkVideoPermission", status);

            if (status != 3) {
                GameManager.popUpManager.show(PopUpType.Permission);
            }
        }

        ServerCom.socketIOConnect(K.ServerAddress.gameServer + ":" + K.ServerAddress.gamePort, () => {
            if (!ServerCom.socketConnected) {
                return;
            }
            GameManager.setUserData(user);
            setTimeout(function() {
                inst.onSuccessfullLogin(inst);
            }, 1);
        });
    },

    restoreTournamentChannels: function(tournamentChannels, cashGameHit) {
        // BE's tournamentChannels is a join history — it doesn't cover observer-only
        // sessions, so it comes back empty even while a table is actively being
        // observed. Skip the Lobby flash in that case; _restoreObserverChannels below
        // (which knows about the locally-tracked observer table) will redirect straight
        // back to it. If that restore turns out to fail (stale/closed channel), its
        // onFail handler falls back to showing Lobby then, so we don't strand the player.
        var hasObserverTable = ((GameManager.gameModel && GameManager.gameModel.activePokerModels) || []).some(function(m) {
            return m.roomConfig && m.roomConfig.channelType !== 'NORMAL';
        });
        if (!tournamentChannels) {
            if (!cashGameHit && !hasObserverTable && ScreenManager.currentScreen !== K.ScreenEnum.LobbyScreen) {
                cc.systemEvent.emit("RESTORE_LOGIN");
                ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function() {}, false);
            }
            return;
        }
        if (tournamentChannels.length == 0) {
            if (!cashGameHit && ScreenManager.currentScreen !== K.ScreenEnum.LobbyScreen) {
                cc.systemEvent.emit("RESTORE_LOGIN");
                // ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);

                GameManager.reset(false);

                if (ScreenManager.currentScreen !== K.ScreenEnum.LobbyScreen) {
                    ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function() {}, false);
                }
            }
            // this._restoreObserverChannels([]);
            return;
        }


        if (GameManager.firstLogin) {
            // ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);
            GameManager.firstLogin = false;

            let lobbyPresenter = ScreenManager.screens[K.ScreenEnum.LobbyScreen];
            lobbyPresenter.node.active = true;
            lobbyPresenter.node.opacity = 0;
        }

        var inst = this;
        GameManager.isTournamentRestoring = true;
        var channels = tournamentChannels.slice();

        function processNext() {
            if (channels.length === 0) {
                inst._restoreObserverChannels(tournamentChannels);
                return;
            }
            inst.enterTournamentChannel(channels.shift(), processNext);
        }
        processNext();
    },

    _restoreObserverChannels: function(coveredChannels) {
        var inst = this;
        var activeModels = (GameManager.gameModel && GameManager.gameModel.activePokerModels) || [];

        var observerModels = activeModels.filter(function(m) {
            return m.roomConfig && m.roomConfig.channelType !== 'NORMAL';
        });

        if (observerModels.length === 0 || coveredChannels.length == 0) {
            // No observer tables — original reset logic when BE returned empty.
            // coveredChannels may be [] (BE explicitly returned no channels), not just
            // null/undefined — treat both as "nothing covered".
            if ((!coveredChannels || coveredChannels.length === 0) && GameManager.activeTableCount > 0) {
                GameManager.reset(false);

                if (ScreenManager.currentScreen !== K.ScreenEnum.LobbyScreen) {
                    ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function() {}, false);
                }
            }
            return;
        }

        observerModels.forEach(function(m) {
            var channelId = m.gameData.channelId;
            if (coveredChannels && coveredChannels.some(function(tc) {
                    return tc.channelId === channelId;
                })) {
                return; // Already handled by enterTournamentChannel
            }
            var tournamentId = (m.tourData && m.tourData._id) ||
                (m.gameData && m.gameData.tournamentId);
            inst._joinTournamentChannel({
                    playerId: GameManager.user.playerId
                },
                channelId, tournamentId, window.TournamentSocket, m.tourData || null,
                null,
                function(info) {
                    inst._removeStaleTableModel(m);
                    if (info.indexOf('Channel not found in database') != -1 || info.indexOf('No active table found for this tournament') != -1) {
                        // The locally-remembered observer table was actually stale (closed
                        // while backgrounded) — restoreTournamentChannels skipped showing
                        // Lobby assuming this restore would succeed, so fall back to it now
                        // instead of stranding the player on the old screen.
                        if (ScreenManager.currentScreen !== K.ScreenEnum.LobbyScreen) {
                            ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function() {}, false);
                        }
                    } else {
                        GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function() {});
                    }
                }
            );
        });
    },

    _removeStaleTableModel: function(m) {
        if (!GameScreen || !GameScreen.gameModel) return;
        var idx = GameScreen.gameModel.activePokerModels.indexOf(m);
        if (idx === -1) return;
        if (cc.isValid(m.node)) {
            var pageView = GameScreen.gridParent.getComponent(cc.PageView);
            if (pageView) pageView.removePage(m.node);
        }
        GameScreen.gameModel.activePokerModels.splice(idx, 1);
        GameManager.activeTableCount = Math.max(0, GameManager.activeTableCount - 1);
        GameManager.updateActiveTables();
    },

    enterTournamentChannel: function(entry, onDone) {
        var channelId = entry.channelId;
        var tournamentId = entry.tournamentId;
        var rawSocket = window.TournamentSocket;
        if (!channelId || !rawSocket) {
            if (onDone) onDone();
            return;
        }

        var inst = this;
        var handled = false;

        function onTournamentData(data) {
            if (data.eventName !== "Res-GetTournamentData") return;
            var inner = data.data || {};
            var tourRaw = inner.response || inner;
            if (tourRaw && tourRaw._id && tourRaw._id !== tournamentId) return;
            if (handled) return;
            handled = true;
            rawSocket.off("tournamentLobbyResponseEvent", onTournamentData);
            var tourData = tourRaw;
            inst._joinTournamentChannel(entry, channelId, tournamentId, rawSocket, tourData, onDone, (info) => {
                // GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
            });
        }

        rawSocket.on("tournamentLobbyResponseEvent", onTournamentData);

        TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|GetTournamentData", {
                tournamentId: entry.tournamentId
            },
            function() {},
            function() {
                if (handled) return;
                handled = true;
                rawSocket.off("tournamentLobbyResponseEvent", onTournamentData);
                inst._joinTournamentChannel(entry, channelId, tournamentId, rawSocket, null, onDone, () => {
                    GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function() {});
                });
            }
        );
    },

    _joinTournamentChannel: function(entry, channelId, tournamentId, rawSocket, tourData, onDone, onFail) {
        rawSocket.prependAny(function onJoinResponse(event, response) {
            if (event !== "commonEventResponse" || response?.eventOrigin !== "room.channelHandler.joinChannel") return;
            if (response?.data?.tournamentId && response.data.tournamentId !== tournamentId) return;
            rawSocket.offAny(onJoinResponse);
            GameManager.isTournamentRestoring = false;
            var res = response?.data;
            if (!res?.success) {
                if (onFail) onFail(res.info);
                if (onDone) onDone();
                return;
            }
            res.antibanking = res.antibanking || {
                isAntiBanking: false,
                amount: 0,
                timeRemains: 0
            };
            res.playerName = res.playerName || GameManager.user.userName || "";
            res.channelId = channelId;
            res.tourData = tourData;
            let isTournamentExisting = false;
            let tournamentIndexFound = -1;
            for (var index = 0; index < GameManager.gameModel.activePokerModels.length; index++) {
                if (!GameManager.gameModel.activePokerModels[index].tourData) {
                    continue;
                }
                var id = GameManager.gameModel.activePokerModels[index].tourData._id;
                if (id === response.data.tournamentId) {
                    isTournamentExisting = true;
                    tournamentIndexFound = index;
                    break;
                }
            }

            let gameData = res;
            gameData.isRejoin = isTournamentExisting;
            gameData.indexFound = tournamentIndexFound;
            GameManager.popUpManager.hideAllPopUps();
            ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, gameData, function() {
                if (onDone) onDone();
            });
        });

        rawSocket.emit("common", {
            eventName: "room.channelHandler.joinChannel",
            data: {
                playerId: entry.playerId || GameManager.user.playerId,
                channelId: channelId,
                channelType: "TOURNAMENT",
                isRequested: true,
                tableId: "",
                isPrivateTable: "false",
                playerName: GameManager.user.userName || "",
                networkIp: window.LoginData?.ipV4Address || "",
                isRejoin: false,
                maxPlayers: 2,
            }
        });
    },

    checkForMultiClient: function() {
        inst.loginHandler.checkForMultiClient(function(response) {
            if (response.success) {
                GameManager.isConnected = true;
                let hit = false;
                let cashGameActive = false;
                if (K.NewTournament && window.TournamentServerCom) {
                    window.TournamentServerCom.connectTournamentSocket(function() {
                        inst.loginHandler.checkForMultiClientTour(function(response) {
                            inst.restoreTournamentChannels(response.tournamentChannels, cashGameActive);
                            window.TournamentLobbyHandler.requestTournamentLobbyList({}, function() {}, function() {});
                            cc.systemEvent.emit("TournamentReload");
                        });
                    });
                }
                if (response.activeNotifications && response.activeNotifications.length > 0) {
                    for (var i = 0; i < response.activeNotifications.length; i++) {
                        if (response.activeNotifications[i].remainingSeconds > 0) {
                            GameManager.scheduleOnce(function() {
                                GameManager.popUpManager.show(PopUpType.TournamentStartingSoonPopup, response.activeNotifications[i], function() {});
                            }, 2);
                            break;
                        }
                    }
                }
                let currentActiveIds = [];
                let currentActiveTableIds = [];
                let prevSelection = GameScreen ? GameScreen.prevSelection : 0;
                GameManager.gameModel.activePokerModels.forEach(function(element, index) {
                    if (element.gameData.tournamentId) {
                        currentActiveIds.push(element.gameData.tournamentId);
                        currentActiveTableIds.push(element.gameData.channelId);
                    }

                    if (currentActiveTableIds.length == 1) {
                        this.tourData = element.gameData.tourData;
                    }
                }, this);

                if (response.chips && GameManager.user) {
                    GameManager.user.freeChips = response.chips.freeChips;
                    GameManager.user.realChips = response.chips.realChips;
                    GameManager.emit("refreshPlayerChips");
                }

                if (GameManager.activeTableCount > 0 && response.joinChannels.length == 0) {
                    GameManager.reset(true);
                }

                if (!!response.joinChannels && response.joinChannels.length > 0) {
                    hit = true;
                    cashGameActive = true;
                    GameManager.scheduleOnce(function() {
                        var joinCount = response.joinChannels.length;
                        response.joinChannels.forEach(function(element, index) {
                            var newData = new JoinData(element);
                            if (!!newData.channelId) {
                                TableHandler.joinTableList.push(newData.channelId);
                                newData.tableId = "";
                                GameManager.join(newData.channelId, K.PomeloAPI.joinChannel, newData, null, null, index + 1, joinCount, true);
                            } else {
                                GameManager.join(newData.tableId, K.PomeloAPI.joinChannel, newData, null, null, index + 1, joinCount, true);
                            }
                        }, this);
                    }, 0.1);
                }
                if (currentActiveIds.length > 0) {
                    hit = true;
                    GameManager.scheduleOnce(function() {
                        if (!GameManager.isSocketIOConnected) {
                            return;
                        }
                        ServerCom.socketIOBroadcast(currentActiveTableIds[0] + ":" + GameManager.user.playerId, this.onTournamentTableUserBroadcast.bind(this));
                        window.TournamentLobbyHandler.requestTournamentEnterTable({
                                tournamentId: currentActiveIds[0]
                            },
                            (data) => {},
                            (error) => {},
                            "Enter table, please wait ......"
                        );
                    }.bind(this), 1);
                } else {
                    if (ScreenManager.currentScreen == K.ScreenEnum.LobbyScreen) {
                        GameManager.emit("forceReloadTable");
                    } else if (ScreenManager.currentScreen == K.ScreenEnum.LoginScreen ||
                        ScreenManager.currentScreen == K.ScreenEnum.SignupScreen) {
                        ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function() {}, false);
                    }
                }
            } else {
                K.disconnectRequestedByPlayer = true;
                ScreenManager.showScreen(K.ScreenEnum.LoginScreen, 10, function() {}, false);
            }
        }.bind(this));
    }
});