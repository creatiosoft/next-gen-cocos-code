/**
 * @namespace Controllers
 */
var root = window;
var userData = require('ResponseTypes').User;
var Emitter = require('EventEmitter');
var AvatarSelection = require('AvatarSelection');
var PopUpType = require('PopUpManager').PopUpType;
var PopUpManager = require('PopUpManager').PopUpManager;
var LoginData = require('PostTypes').Login;
var JoinData = require('PostTypes').JoinChannel;
var changeAvatar = require('ResponseTypes').changeAvatar;
var LoginHandler = require('LoginHandler');
var CashRoom = require('CashRoom');
var Advancefilter = require('Advancefilter');

var BuildType = cc.Enum({
    Android: 0,
    iOS: 1,
    Mac: 2,
    WebMobile: 3,
    WebDesktop: 4,
    Windows: 5,
    None: 100,
});

/**
 * @classdesc GameManager class manages the common behaviour/functionality of the game! 
 * @classdesc It manages join/joinSuccess Request, verifyTable and having common function which may be needed any where in the Game Application! 
 * @class GameManager
 * @extends EventEmitter
 * @memberof Controllers
 */
cc.Class({
    extends: Emitter,

    properties: {
        paymentWebViewNode: {
            default: null,
            type: cc.Node,
        },
        paymentWebView: {
            default: null,
            type: cc.WebView,
        },
        activeTables: {
            default: null,
            type: cc.Node,
        },
        loginHandler: {
            default: null,
            type: LoginHandler,
        },
        user: {
            default: null,
            visible: false,
        },
        gameModel: {
            default: null,
            visible: false,
        },
        activeTableCount: {
            default: 0,
        },
        maxTableCounts: 4,
        sounds: {
            default: [],
            type: cc.AudioClip,
        },
        avatarPool: {
            default: [],
            type: cc.Node,
        },
        avatarPrefab: {
            default: null,
            type: cc.Prefab,
        },
        cardDefault: {
            default: null,
            type: cc.SpriteFrame,
        },
        popUpManager: {
            default: null,
            type: PopUpManager,
        },
        isConnected: false,
        onlinePlayers: 0,
        isMobile: false,
        isActive: true,
        isBB: false,
        isLoaded: false,
        isForceDisconnection: false,
        needResetUser: false,
        firstLogin: true,
        lastClickTime: 0,
        clickInterval: 1000,
        getAllAssetsFinished: false,
        hideTime: 0,
        tableStartTime: 0,
        tableImage: 0,
        tableBgImage: 0,
        cardBackImage: 0,
        hightlightRoom: 0,
        hightlightTable: 0,
        refreshTokenLock: false,
        refreshTokenCB: null,
        getAllAssets: null,
        avatarDefault: {
            default: null,
            type: cc.SpriteFrame,
            visible: false,
        },
        stickerDefault: {
            default: null,
            type: cc.SpriteFrame,
            visible: false,
        },
        tableDefault: {
            default: null,
            type: cc.SpriteFrame,
            visible: false,
        },
        tableActDefault: {
            default: null,
            type: cc.SpriteFrame,
            visible: false,
        },
        tableDeactDefault: {
            default: null,
            type: cc.SpriteFrame,
            visible: false,
        },
        tableBgDefault: {
            default: null,
            type: cc.SpriteFrame,
            visible: false,
        },
        avatarImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        stickerImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tableImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tabActImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tabDeactImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tabActImagesTour: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tabDeactImagesTour: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tableBgImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        cardBackImages: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tableImagesTour: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        tableBgImagesTour: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        cardBackImagesTour: {
            default: [],
            type: cc.SpriteFrame,
            visible: false,
        },
        highHandAnnTime: 0,
    },

    /**
     * @description Play sound Effects in game
     * @method playSound
     * @param {Number} index -Identifies the sound effect in sounds Array
     * @memberof Controllers.GameManager#
     */
    playSound: function (index) {
        if (!GameManager.isActive) {
            return;
        }
        if (!!GameManager.user && !GameManager.user.muteGameSound && ScreenManager.currentScreen != K.ScreenEnum.LoginScreen) {
            cc.audioEngine.playEffect(this.sounds[index], false);
        }
    },
    onEventSound: function () {
        this.playSound(K.Sounds.click);

    },

    /**
     * @description Play music in game, Not being used now.
     * @method playMusic
     * @param {bool} flag 
     * @memberof Controllers.GameManager#
     */
    playMusic: function (flag) { },

    _orientationCheck: function () { },

    _orientationChange: function (isPotrait) { },

    onLoad: function () {

        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                cc.game.setFrameRate(45);
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                cc.game.setFrameRate(45);
            }
        }
        else {
            cc.game.setFrameRate(60);
        }

        cc.debug.setDisplayStats(false);

        root.GameManager = this;
        root.GameScreen = null;
        GameManager.needResetUser = true;
        GameManager.cachedRoomImages = {};

        this.playerRequestedToLeaveTable = {};

        this.initPaymentWebViewBridge();

        if (cc.sys.isNative) {
            ServerCom.reconnectMaxAttempts = 8;
        } else {
            ServerCom.reconnectMaxAttempts = 8;
        }

        if (GameManager.isZFold()) {
            var size = cc.size(cc.Canvas.instance.node.width, cc.Canvas.instance.node.height);
            var aspect = size.height / size.width; // 1.333
            let designAspect = 1704 / 786; // 2.1679389313

            cc.find("LobbyHandlerNew", cc.Canvas.instance.node).scale = 0.7;
            cc.find("LobbyHandlerNew/Center", cc.Canvas.instance.node).getComponent(cc.Widget).left = 120;
            cc.find("LobbyHandlerNew/Center", cc.Canvas.instance.node).getComponent(cc.Widget).right = 120;
            cc.find("Popups/Johnny", cc.Canvas.instance.node).scale = 0.7;
            cc.find("Reconnecting", cc.Canvas.instance.node).scale = 0.45;
            
            cc.find("TournamentLobbyDetail", cc.Canvas.instance.node).scale = 0.7;
            cc.find("TournamentLobbyDetail/Bg/TabPage", cc.Canvas.instance.node).getComponent(cc.Widget).right = 120;
            cc.find("TournamentLobbyDetail/Bg/TabPage", cc.Canvas.instance.node).getComponent(cc.Widget).left = 120;
            cc.find("TournamentLobbyDetail/Bg/TopBase", cc.Canvas.instance.node).getComponent(cc.Widget).right = 120;
            cc.find("TournamentLobbyDetail/Bg/TopBase", cc.Canvas.instance.node).getComponent(cc.Widget).left = 120;
            cc.find("TournamentLobbyDetail/Bg/PayoutStructurePopup/PayoutStructure", cc.Canvas.instance.node).getComponent(cc.Widget).right = 180;
            cc.find("TournamentLobbyDetail/Bg/PayoutStructurePopup/PayoutStructure", cc.Canvas.instance.node).getComponent(cc.Widget).left = 180;
            cc.find("TournamentLobbyDetail/Bg/BlindStructurePopup/BlindStruct", cc.Canvas.instance.node).getComponent(cc.Widget).right = 180;
            cc.find("TournamentLobbyDetail/Bg/BlindStructurePopup/BlindStruct", cc.Canvas.instance.node).getComponent(cc.Widget).left = 180;
        }

        if (!cc.sys.isNative) {
            let isCleanupComplete = false;
            window.onbeforeunload = function () {
                window.MGR_AGORA.leaveBeforeReload();
            };
            window.addEventListener('pagehide', function (event) {
                if (!isCleanupComplete) {
                    window.MGR_AGORA.leaveBeforeReload();
                    event.preventDefault();
                    setTimeout(() => {
                        isCleanupComplete = true;
                        window.location.reload();
                    }, 1000);
                }
            });
        }
        ServerCom.pomeloBroadcast("jackpotWinNotify", this.bbjNotifiy.bind(this));
        ServerCom.pomeloBroadcast("increaseCurrentJackpotPool", this.updateJackpotAmount.bind(this));
        ServerCom.pomeloBroadcast("highHandUpdate", this.highHandNotifiy.bind(this));
        ServerCom.pomeloBroadcast(K.LobbyBroadcastRoute.tableView, this.onSideTableUpdate.bind(this));
    },

    retryGetAllAssets: function () {
        if (!this.getAllAssetsFinished) {
            ServerCom.httpGetRequest(K.ServerAddress.assets_server + "/getAllAssets",
                null,
                (response) => {
                    this.getAllAssetsFinished = true;
                    this.getAllAssets = response.result;
                    this.generateAvatarPool();
                    this.generateTablePool();
                    this.generateTableBgPool();
                    this.generateCardBackPool();
                },
                (error) => {
                    console.log("getAllAssets error", error);
                    this.getAllAssetsFinished = false;

                    this.scheduleOnce(function () {
                        this.retryGetAllAssets();
                    }, 1);
                }
            );
        }
    },

    /**
     * @description Generate avatarPool, Registered broadcast to get information about players.
     * @method init
     * @memberof Controllers.GameManager#
     */
    init: function () {
        ServerCom.httpGetRequest(K.ServerAddress.assets_server + "/getAllAssets",
            null,
            (response) => {
                console.log("getAllAssets", response);
                this.getAllAssetsFinished = true;
                this.getAllAssets = response.result;
                this.generateAvatarPool();
                this.generateTablePool();
                this.generateTableBgPool();
                this.generateCardBackPool();
            },
            (error) => {
                this.getAllAssetsFinished = false;
                this.retryGetAllAssets();
            }
        );

        GameManager.on("reserveSeat", this.onReserveSeat.bind(this));
        cc.systemEvent.on("forcedisconnect", this.onForcedisconnect.bind(this));
        ServerCom.pomeloBroadcast("refreshAccessToken", this.onRefreshAccessToken.bind(this));
        ServerCom.pomeloBroadcast("updatePlayerCategory", this.onUpdatePlayerCategory.bind(this));
        ServerCom.pomeloBroadcast(K.PlayerBroadcastRoute.playerInfo, this.onPlayerInfo.bind(this));
        ServerCom.pomeloBroadcast(K.BroadcastRoute.onOnlinePlayers, this.saveOnlinePlayers.bind(this));
        ServerCom.pomeloBroadcast("updatePlayerImageInTable", this.updatePlayerImageInTable.bind(this));
        ServerCom.pomeloBroadcast("regionRestricted", this.onRegionRestrictedBroadcast.bind(this));
        ServerCom.pomeloBroadcast("seatFee", this.onSeatFee.bind(this));
        ServerCom.pomeloBroadcast("notice", this.onAdminNotice.bind(this));
        ServerCom.pomeloBroadcast("adminBroadcast", this.onAdminNotice.bind(this));
        ServerCom.pomeloBroadcast("maintenanceUpdate", this.onMaintenanceUpdate.bind(this));
        ServerCom.pomeloBroadcast("maintenance-notification", this.onMaintenanceNotification.bind(this));
        cc.systemEvent.on("tournament-maintenance-notification", this.onTournamentMaintenanceNotification, this);
        ServerCom.pomeloBroadcast(K.PlayerBroadcastRoute.connectionAck2, function (response) {
            if (!GameManager.user) {
                return;
            }
            if (!!response.data && !!response.data.channelId) {
                GameManager.emit("connectionAcknowledged", response.data.channelId);
            }
            response.data.access_token = K.Token.access_token;
            ServerCom.pomeloRequest(K.PomeloAPI.connectionAck2, {
                playerId: GameManager.user.playerId,
                data: response.data,
                access_token: K.Token.access_token
            }, function (response) {
            }, null, 5000, false);
        });

        ServerCom.pomeloBroadcast(K.BroadcastRoute.autoJoinBroadcast, function (data) {
            var val = (!GameScreen || !GameScreen.node.active) ? true : !GameScreen.isAlreadyJoined(data.channelId);
            if (val) {
                var newData = new JoinData(data);
                data.callback = function () {
                    if (!!newData.channelId) {
                        newData.tableId = "";
                        let pop = GameManager.join(newData.channelId, K.PomeloAPI.joinChannel, newData);
                        if (pop) {
                            GameManager.emit("openBuyInPopup", data.channelId);
                        }
                    } else {
                        let pop = GameManager.join(newData.tableId, K.PomeloAPI.joinChannel, newData);
                        if (pop) {
                            GameManager.emit("openBuyInPopup", data.channelId);
                        }
                    }

                };
                data.joinData = newData;
                GameManager.popUpManager.show(PopUpType.JoinGamePopup, data, function () { });
            } else {
                if (!!GameScreen && GameScreen.isAlreadyJoined(data.channelId)) {
                    GameManager.emit("openBuyInPopup", data.channelId);
                }
            }
        });

        this.maxTableCounts = 2;

        this.playerRequestedToLeaveTable = {};

        if (this.isMobile || cc.sys.isNative) {

            cc.game.on(cc.game.EVENT_HIDE, function () {

                if (GameManager.user) {
                    var data = {};
                    data.playerId = GameManager.user.playerId;
                    data.channelId = '';
                    data.isBackground = true;
                    data.access_token = K.Token.access_token;
                    data.isLoggedIn = true;
                    ServerCom.pomeloRequest('connector.entryHandler.playerBackground', data, function (response) {}.bind(this), null, 5000, false);
                    GameManager.isActive = false;
                    GameManager.hideTime = Date.now();
                    
                }
            }.bind(this));

            cc.game.on(cc.game.EVENT_SHOW, function () {
                if (GameManager.user) {
                    var data = {};
                    data.playerId = GameManager.user.playerId;
                    data.channelId = '';
                    data.isBackground = false;
                    data.access_token = K.Token.access_token;
                    data.isLoggedIn = false;
                    ServerCom.pomeloRequest('connector.entryHandler.playerBackground', data, function (response) {}.bind(this), null, 5000, false);
                }

                if (GameManager.isActive) {
                    return;
                }
                if (ScreenManager.currentScreen == K.ScreenEnum.LoginScreen ||
                    ScreenManager.currentScreen == K.ScreenEnum.SignupScreen) {
                    return;
                }

                GameManager.isActive = true;

                if (!ServerCom.socketConnected) {
                    if (GameManager.user && GameManager.user.playerId) {
                        socketIO.socket.disconnect();
                        socketIO.socket.connect();
                        return;
                    } else {
                        LoginScreen.checkForMultiClient();
                        return;
                    }
                } 
            }.bind(this));

            if (GameManager.isMobile) {
                window.BackPressed = {
                    javaCallJs: function (param) {
                        if (ScreenManager.currentScreen == K.ScreenEnum.GamePlayScreen) {
                            const text = "Please click on Lobby Button to go back to Lobby";
                            GameManager.popUpManager.show(PopUpType.NotificationPopup, text, function () { });
                        } else if (ScreenManager.currentScreen == K.ScreenEnum.LobbyScreen) {
                            let lobbyPresenter = ScreenManager.screens[ScreenManager.currentScreen];
                            if (!lobbyPresenter.scrollViewNode.active && lobbyPresenter.roomTable.scale != 0) {
                                lobbyPresenter.onBackLobby();
                            } else if (lobbyPresenter.cashierTable.active) {
                                lobbyPresenter.onBackLobby2();
                            } else if (lobbyPresenter.tournamentLobbyDetail.active) {
                                lobbyPresenter.tournamentLobbyDetail.active = false;
                            } else {
                                GameManager.popUpManager.show(PopUpType.OnLogOutPopup, false, function () { });
                            }
                        } else if (ScreenManager.currentScreen == K.ScreenEnum.LoginScreen) {
                            GameManager.popUpManager.show(PopUpType.OnLogOutPopup, true, function () { });
                        } else if (ScreenManager.currentScreen == K.ScreenEnum.SignupScreen) {

                            ScreenManager.showScreen(K.ScreenEnum.LoginScreen, 10, function () { });
                        } else if (GameManager.popUpManager.currentPopUp == PopUpType.ForgotPasswordPopUp) {
                            GameManager.popUpManager.remove(PopUpType.ForgotPasswordPopUp, function () { });
                        }
                    },
                    sms: function (text) {
                        console.log("sms", text);
                    }
                }

                cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
                    switch (event.keyCode) {
                        case cc.macro.KEY.back:
                        case cc.macro.KEY.escape:
                            if (ScreenManager.currentScreen == K.ScreenEnum.GamePlayScreen) {
                                const text = "Please click on Lobby Button to go back to Lobby";
                                GameManager.popUpManager.show(PopUpType.NotificationPopup, text, function () { });
                            } else if (ScreenManager.currentScreen == K.ScreenEnum.LobbyScreen) {

                                let lobbyPresenter = ScreenManager.screens[ScreenManager.currentScreen];
                                console.log(lobbyPresenter);

                                if (lobbyPresenter.cashierTable.active) {
                                    lobbyPresenter.onBackLobby2();
                                } else if (lobbyPresenter.tournamentLobbyDetail.active) {
                                    lobbyPresenter.tournamentLobbyDetail.active = false;
                                } else {
                                    GameManager.popUpManager.show(PopUpType.OnLogOutPopup, false, function () { });
                                }
                            } else if (ScreenManager.currentScreen == K.ScreenEnum.LoginScreen) {
                                GameManager.popUpManager.show(PopUpType.OnLogOutPopup, true, function () { });
                            } else if (ScreenManager.currentScreen == K.ScreenEnum.SignupScreen) {
                                ScreenManager.showScreen(K.ScreenEnum.LoginScreen, 10, function () { });
                            } else if (GameManager.popUpManager.currentPopUp == PopUpType.ForgotPasswordPopUp) {
                                GameManager.popUpManager.remove(PopUpType.ForgotPasswordPopUp, function () { });
                            }
                        default:
                            break;
                    }
                }.bind(this), this);
            }
        }
    },

    onUpdatePlayerCategory: function (data) {
        GameManager.popUpManager.show(PopUpType.UpdateCategory, data);
    },

    saveOnlinePlayers: function (playersdata) {
        this.onlinePlayers = playersdata.data.onlinePlayers;
        GameManager.emit("onlinePlayers", null);
    },

    onRefreshAccessToken: function (response) {
        if (response.data) {
            K.Token.access_token = response.data.access_token;
        } else {
            K.Token.access_token = response.access_token;
        }
    },

    onForcedisconnect: function (response) {
        cc.sys.localStorage.removeItem("tx_auto_login_token");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
        cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");

        var param = {
            code: K.Error.PlayerSessionShiftedOnServer,
            errorType: 9999,
            response: "You have logged in from another device."
        };
        // console.log("SHOWING LOGOUT POPUP WITH PARAM ELSE", param)
        GameManager.popUpManager.hideAllPopUps();
        GameManager.popUpManager.show(PopUpType.MultiLoginPopup, param, function () { });
    },

    onPlayerInfo: function (response) {
        GameManager.emit("playerInfo", response);
        if (!!response.serverDown && response.serverDown) {
            var param = {
                code: K.Error.ServerDown,
                response: response.info,
                heading: response.heading,
                preserveState: true,
            };
            GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function () { });
            return;
        }

        if (!!response.channelId && !!GameScreen && ScreenManager.currentScreen == K.ScreenEnum.GamePlayScreen) {
            for (var index = 0; index < GameScreen.gameModel.activePokerModels.length; index++) {
                if (response.channelId === GameScreen.gameModel.activePokerModels[index].gameData.channelId) {
                    if (GameScreen.gameModel.activePokerModels[index].presenter) {
                        GameScreen.gameModel.activePokerModels[index].presenter.updateQueueIndex(response.buttonCode);
                    }
                    return;
                }
            }
        }
        GameManager.popUpManager.show(PopUpType.PlayerInfoPopup, response, function () { });
    },

    loadAvatar: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            let poolObject = cc.instantiate(self.avatarPrefab);
            if (!!err) {
                self.avatarImages[index] = self.avatarDefault;
                poolObject.getComponent(AvatarSelection).setAvatarImg(self.avatarImages[index], data.index);
            } else {
                self.avatarImages[index] = new cc.SpriteFrame(tex);
                poolObject.getComponent(AvatarSelection).setAvatarImg(new cc.SpriteFrame(tex), data.index);
            }
            poolObject.active = false;
            poolObject__data = data;
            self.avatarPool.push(poolObject);

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadNext: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + data[index].path;
            this.loadAvatar(avatarUrl, this.loadNext.bind(this), index, data);
        }
    },

    loadEmoji: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.stickerImages[index] = self.stickerDefault;
                self.stickerImages[index].___id = 1;
                self.stickerImages[index].___data = data[index];
            } else {
                self.stickerImages[index] = new cc.SpriteFrame(tex);
                self.stickerImages[index].___id = data[index]._id;
                self.stickerImages[index].___data = data[index];
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadNextEmoji: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + data[index].path;
            this.loadEmoji(avatarUrl, this.loadNextEmoji.bind(this), index, data);
        }
    },

    loadTable: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.tableImages[index] = self.tableDefault;
                self.tableImages[index].___id = 0;
                self.tableImages[index].___data = data[index];
                self.tableImages[index].___data.___id = 0;
            } else {
                self.tableImages[index] = new cc.SpriteFrame(tex);
                self.tableImages[index].___id = data[index]._id;
                self.tableImages[index].___data = data[index];
                self.tableImages[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadTableAct: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.tabActImages[index] = self.tableActDefault;
                self.tabActImages[index].___id = 0;
                self.tabActImages[index].___data = data[index];
                self.tabActImages[index].___data.___id = 0;
            } else {
                self.tabActImages[index] = new cc.SpriteFrame(tex);
                self.tabActImages[index].___id = data[index]._id;
                self.tabActImages[index].___data = data[index];
                self.tabActImages[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadTableDeact: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.tabDeactImages[index] = self.tableDeactDefault;
                self.tabDeactImages[index].___id = 0;
                self.tabDeactImages[index].___data = data[index];
                self.tabDeactImages[index].___data.___id = 0;
            } else {
                self.tabDeactImages[index] = new cc.SpriteFrame(tex);
                self.tabDeactImages[index].___id = data[index]._id;
                self.tabDeactImages[index].___data = data[index];
                self.tabDeactImages[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadTourTable: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.tableImagesTour[index] = self.tableDefault;
                self.tableImagesTour[index].___id = 0;
                self.tableImagesTour[index].___data = data[index];
                self.tableImagesTour[index].___data.___id = 0;
            } else {
                self.tableImagesTour[index] = new cc.SpriteFrame(tex);
                self.tableImagesTour[index].___id = data[index]._id;
                self.tableImagesTour[index].___data = data[index];
                self.tableImagesTour[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadNextTable: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? data[index].path : data[index].pathDesktop);
            this.loadTable(avatarUrl, this.loadNextTable.bind(this), index, data);
        }
    },

    loadNextTableAct: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + (data[index].tabActive);
            this.loadTableAct(avatarUrl, this.loadNextTableAct.bind(this), index, data);
        }
    },

    loadNextTableDeact: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + (data[index].tabDeactive);
            this.loadTableDeact(avatarUrl, this.loadNextTableDeact.bind(this), index, data);
        }
    },

    loadNextTourTable: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? data[index].path : data[index].pathDesktop);
            this.loadTourTable(avatarUrl, this.loadNextTourTable.bind(this), index, data);
        }
    },

    loadTableBg: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.tableBgImages[index] = self.tableBgDefault;
                self.tableBgImages[index].___id = 0;
                self.tableBgImages[index].___data = data[index];
                self.tableBgImages[index].___data.___id = 0;
            } else {
                self.tableBgImages[index] = new cc.SpriteFrame(tex);
                self.tableBgImages[index].___id = data[index]._id;
                self.tableBgImages[index].___data = data[index];
                self.tableBgImages[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadTourTableBg: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.tableBgImagesTour[index] = self.tableBgDefault;
                self.tableBgImagesTour[index].___id = 0;
                self.tableBgImagesTour[index].___data = data[index];
                self.tableBgImagesTour[index].___data.___id = 0;
            } else {
                self.tableBgImagesTour[index] = new cc.SpriteFrame(tex);
                self.tableBgImagesTour[index].___id = data[index]._id;
                self.tableBgImagesTour[index].___data = data[index];
                self.tableBgImagesTour[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadNextTableBg: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? data[index].path : data[index].pathDesktop);
            this.loadTableBg(avatarUrl, this.loadNextTableBg.bind(this), index, data);
        }
    },

    loadNextTourTableBg: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? data[index].path : data[index].pathDesktop);
            this.loadTourTableBg(avatarUrl, this.loadNextTourTableBg.bind(this), index, data);
        }
    },

    loadCardBack: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.cardBackImages[index] = self.cardDefault;
                self.cardBackImages[index].___id = 0;
                self.cardBackImages[index].___data = data[index];
                self.cardBackImages[index].___data.___id = 0;
            } else {
                self.cardBackImages[index] = new cc.SpriteFrame(tex);
                self.cardBackImages[index].___id = data[index]._id;
                self.cardBackImages[index].___data = data[index];
                self.cardBackImages[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadTourCardBack: function (avatarUrl, cb, index, data) {
        let self = this;
        cc.loader.load(avatarUrl + "", function (err, tex) {
            if (!!err) {
                self.cardBackImagesTour[index] = self.cardDefault;
                self.cardBackImagesTour[index].___id = 0;
                self.cardBackImagesTour[index].___data = data[index];
                self.cardBackImagesTour[index].___data.___id = 0;
            } else {
                self.cardBackImagesTour[index] = new cc.SpriteFrame(tex);
                self.cardBackImagesTour[index].___id = data[index]._id;
                self.cardBackImagesTour[index].___data = data[index];
                self.cardBackImagesTour[index].___data.___id = index;
            }

            if (cb) {
                cb(index + 1, data);
            }
        });
    },

    loadNextCardBack: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + data[index].path;
            this.loadCardBack(avatarUrl, this.loadNextCardBack.bind(this), index, data);
        }
    },

    loadNextTourCardBack: function (index, data) {
        if (data[index]) {
            let avatarUrl = K.ServerAddress.assets_server_s + data[index].path;
            this.loadTourCardBack(avatarUrl, this.loadNextTourCardBack.bind(this), index, data);
        }
    },

    generateAvatarPool: function () {
        let self = this;
        let response = this.getAllAssets.getAllPlayerAvatar;

        if (!response || response.length === 0) {
            console.warn("getAllPlayerAvatar is empty");
            return;
        }

        const total = response.length;
        self.avatarImages.length = total;
        self.avatarPool.length = 0;

        // 用来按 index 存放已加载好的节点，保证顺序
        let orderedPool = new Array(total);
        let finishedCount = 0;
        let currentIndex = 0;
        const maxConcurrent = 6;   // 并发数，可按需要调整

        const loadOne = (index) => {
            if (index >= total) return;

            const avatarUrl = K.ServerAddress.assets_server_s + response[index].path;

            cc.loader.load(avatarUrl + "", (err, tex) => {
                let poolObject = cc.instantiate(self.avatarPrefab);
                poolObject.active = false;

                if (err || !tex) {
                    console.warn("Avatar load failed:", response[index].name, err);
                    self.avatarImages[response[index].index] = self.avatarDefault;
                    poolObject.getComponent(AvatarSelection).setAvatarImg(self.avatarDefault, response[index].index);
                } else {
                    const sf = new cc.SpriteFrame(tex);
                    self.avatarImages[response[index].index] = sf;
                    poolObject.getComponent(AvatarSelection).setAvatarImg(sf, response[index].index);
                }

                // 关键：按 index 放进有序数组，而不是直接 push
                poolObject.__data = response[index];
                orderedPool[response[index].index] = poolObject;

                finishedCount++;

                // 启动下一个任务
                if (currentIndex < total) {
                    loadOne(currentIndex++);
                }

                // 全部完成 → 按顺序写入 avatarPool
                if (finishedCount === total) {
                    self.avatarPool = orderedPool;
                    // console.log("All avatars loaded & ordered. Total:", total);
                    // self.emit("avatarPoolReady"); // 需要的话可以发事件
                }
            });
        };

        // 启动第一批并发
        const firstBatch = Math.min(maxConcurrent, total);
        for (let i = 0; i < firstBatch; i++) {
            loadOne(currentIndex++);
        }
    },

    generateStickerPool: function () {
        let self = this;
        let response = this.getAllAssets.getAllEmojis;
        let avatarUrl = K.ServerAddress.assets_server_s + response[0].path;
        self.loadEmoji(avatarUrl, self.loadNextEmoji.bind(self), 0, response);
    },

    generateTablePool: function () {
        let self = this;
        let response = this.getAllAssets.getAllTableTheme;

        let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? response[0].path : response[0].pathDesktop);
        self.loadTable(avatarUrl, self.loadNextTable.bind(self), 0, response);
    },

    generateTableBgPool: function () {
        let self = this;
        let response = this.getAllAssets.getAllGamePlayerBG;
        let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? response[0].path : response[0].pathDesktop);
        self.loadTableBg(avatarUrl, self.loadNextTableBg.bind(self), 0, response);
    },

    generateCardBackPool: function () {
        let self = this;
        let response = this.getAllAssets.getAllBackCard;
        let avatarUrl = K.ServerAddress.assets_server_s + response[0].path;
        self.loadCardBack(avatarUrl, self.loadNextCardBack.bind(self), 0, response);
    },


    generateTourTablePool: function () {
        let self = this;
        let response = this.getAllAssets.getAllTourTableTheme;
        if (response && response.length == 0) {
            response = this.getAllAssets.getAllTableTheme;
        }
        let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? response[0].path : response[0].pathDesktop);
        self.loadTourTable(avatarUrl, self.loadNextTourTable.bind(self), 0, response);
    },

    generateTourTableBgPool: function () {
        let self = this;
        let response = this.getAllAssets.getAllTourGamePlayBG;
        if (response && response.length == 0) {
            response = this.getAllAssets.getAllGamePlayerBG;
        }
        let avatarUrl = K.ServerAddress.assets_server_s + (GameManager.isMobile ? response[0].path : response[0].pathDesktop);
        self.loadTourTableBg(avatarUrl, self.loadNextTourTableBg.bind(self), 0, response);
    },

    generateTourCardBackPool: function () {
        let self = this;
        let response = this.getAllAssets.getAllTourBackCard;
        if (response && response.length == 0) {
            response = this.getAllAssets.getAllBackCard;
        }
        let avatarUrl = K.ServerAddress.assets_server_s + response[0].path;
        self.loadTourCardBack(avatarUrl, self.loadNextTourCardBack.bind(self), 0, response);
    },

    /**
     * @description Set user data (called from LoginScreen.js/SignupScreen.js)
     * @method setUserData
     * @param {Object} data - Data needed to be stored
     * @memberof Controllers.GameManager#
     */
    setUserData: function (data) {
        if (GameManager.needResetUser) {
            this.user = new userData(data);
            GameManager.needResetUser = false;
        }

        GameManager.api_addPlayerFcmToken();

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
    },

    verifyTable: function (_id, checkExisting = true, checkTournament = false, isRejoin = false, data = null) {

        if (root.GameScreen != null) {
            GameManager.activeTableCount = root.GameScreen.gridParent.getComponent(cc.PageView).getPages().length;
        }

        var isExisting = false;
        var indexFound = -1;
        for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
            var id = this.gameModel.activePokerModels[index].roomConfig._id;
            if (checkTournament)
                id = this.gameModel.activePokerModels[index].roomConfig.tableId;
            if (_id === id) {
                indexFound = index;
                isExisting = true;
            }
        }

        isExisting = isExisting && checkExisting;

        if (isRejoin && isExisting) {
            data.isRejoin = true;
            return true;
        }
        data.isRejoin = false;

        if (isExisting) {
            ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, indexFound, function () { });
            return false;
        }

        // check for live game count
        if (_id === null || _id === undefined) {
            return false;
        }
        if (GameManager.activeTableCount > 0) {
            if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
                GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                return false;
            }
        }
        return true;
    },

    
    getTimeByMilli: function (milli) {
        var date = new Date(milli);
        return (date.toDateString().split(" ")[1] + " " + date.toDateString().split(" ")[2] + " " + (date.toTimeString().split(" ")[0]).slice(0, date.toTimeString().lastIndexOf(':')));
    },

    
    getTimeDuration: function (milli, showSeconds = true) {
        var date = new Date();
        milli = parseInt(milli);
        if (date.getTime() < milli) {
            milli = milli - date.getTime();
        }
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        if (days > 0) {
            result += parseInt(days) + " days ";
        }
        if (hours > 0) {
            result += parseInt(hours) + " hours ";
        }
        if (mins > 0) {
            result += parseInt(mins) + " mins ";
        }
        if (showSeconds) {
            result += parseInt(secs) + " secs ";
        }
        return result;
    },

    getMTimeDurationEx: function (milli, showSeconds = true) {
        var date = new Date();
        milli = parseInt(milli);
        if (date.getTime() < milli) {
            milli = milli - date.getTime();
        } else {
            milli = 0;
        }
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        result += parseInt(secs).toString().padStart(2, '0');
        return result;
    },

    getMTimeDuration: function (milli, showSeconds = true) {
        var date = new Date();
        milli = parseInt(milli);
        if (date.getTime() < milli) {
            milli = milli - date.getTime();
        } else {
            milli = 0;
        }
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        if (days > 0) {
            result += parseInt(days) + ":";
        }
        if (hours > 0) {
            result += parseInt(hours) + ":";
        }
        if (mins > 0 || true) {
            result += parseInt(mins).toString().padStart(2, '0') + ":";
        }
        if (showSeconds) {
            // result += parseInt(secs);
            result += parseInt(secs).toString().padStart(2, '0');
        }
        return result;
    },

    getMTimeDuration2: function (milli, showSeconds = true) {
        var date = new Date();
        milli = parseInt(milli);
        if (date.getTime() < milli) {
            milli = milli - date.getTime();
        } else {
            milli = 0;
        }
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        if (days > 0) {
            result += parseInt(days) + ":";
        }
        if (hours > 0) {
            result += parseInt(hours) + ":";
        }
        if (mins > 0 || true) {
            result += parseInt(mins).toString().padStart(2, '0') + ":";
        }
        if (showSeconds) {
            // result += parseInt(secs);
            result += parseInt(secs).toString().padStart(2, '0');
        }
        return result;
    },

    getMTimeDuration3: function (milli, showSeconds = true) {
        var date = new Date();
        milli = parseInt(milli);
        if (date.getTime() > milli) {
            milli = date.getTime() - milli;
        } else {
            milli = 0;
        }
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        if (days > 0) {
            result += parseInt(days) + ":";
        }
        if (hours > 0) {
            result += parseInt(hours) + ":";
        }
        if (mins > 0 || true) {
            result += parseInt(mins).toString().padStart(2, '0') + ":";
        }
        if (showSeconds) {
            // result += parseInt(secs);
            result += parseInt(secs).toString().padStart(2, '0');
        }
        return result;
    },

    getTimePassed: function (milli, showSeconds = true) {
        milli = new Date(milli);
        var date = new Date();
        // milli = parseInt(milli);
        if (date.getTime() < milli) {
            return "0 second";
        }
        milli = date.getTime() - milli;
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        if (days > 0) {
            result += parseInt(days) + " days ";
        }
        if (hours > 0) {
            result += parseInt(hours) + " hours ";
        }
        if (mins > 0) {
            result += parseInt(mins) + " mins ";
        }
        // if (showSeconds) {
        //     result += parseInt(secs) + " secs ";
        // }
        if (result == "") {
            result += "Less than 1 min ";
        }
        return result.trim();
    },

    getTimePassed2: function (milli) {
        milli = new Date(milli);
        var date = new Date();
        if (date.getTime() < milli) {
            return "00:00:00";
        }
        milli = date.getTime() - milli;
        var secs = milli / 1000;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);

        // Format each component to two digits with leading zeros
        var hoursStr = hours.toString().padStart(2, '0');
        var minsStr = mins.toString().padStart(2, '0');
        var secsStr = secs.toString().padStart(2, '0');

        return hoursStr + ":" + minsStr + ":" + secsStr;
    },

    getJohnnyTimeDuration: function (milli, showSeconds = true) {
        var date = new Date();
        milli = parseInt(milli);
        if (date.getTime() < milli) {
            milli = milli - date.getTime();
        }
        var secs = milli / 1000;
        var days = parseInt(secs / 86400);
        secs = secs % 86400;
        var hours = parseInt(secs / 3600);
        secs = secs % 3600;
        var mins = parseInt(secs / 60);
        secs = parseInt(secs % 60);
        var result = "";
        if (days > 0) {
            result += parseInt(days) + ":";
        }
        if (hours > 0) {
            result += parseInt(hours) + ":";
        }
        if (mins > 0 || true) {
            result += parseInt(mins).toString().padStart(2, '0') + ":";
        }
        if (showSeconds) {
            // result += parseInt(secs);
            result += parseInt(secs).toString().padStart(2, '0');
        }
        return result;
    },

    join: function (_id, route, data, onSuccess, onFail, iterationOfJoinsFromLoginScreen = null, totalJoinsFromLoginScreen = null, isRejoin = false) {

        GameManager.iterationOfJoinsFromLoginScreen = iterationOfJoinsFromLoginScreen;
        GameManager.totalJoinsFromLoginScreen = totalJoinsFromLoginScreen;

        if (GameManager.verifyTable(_id, true, data.tableId == _id, isRejoin, data)) {
            onSuccess = onSuccess || (data.isRejoin ? this.onJoinSuccess2 : this.onJoinSuccess);
            onFail = onFail || this.onJoinFail;
            data.playerId = GameManager.user.playerId;
            data.playerName = GameManager.user.userName;
            data.networkIp = LoginData.ipV4Address;
            if (iterationOfJoinsFromLoginScreen != null && iterationOfJoinsFromLoginScreen === 1) {
                GameManager.joinResponseCounter = totalJoinsFromLoginScreen;
                GameManager.joinSuccessResponseCounter = 0;
                GameManager.joinFailResponseCounter = 0;
                GameManager.joinFailResponses = [];
            }
            if (data.isPrivateTable == "true") {
                let privateData = {
                    route: route,
                    data: data,
                    onSuccess: onSuccess,
                    onFail: onFail,
                };
                GameManager.popUpManager.show(PopUpType.EnterPasswordPopup, privateData, function () { });
                return false;
            } else {
                ServerCom.forceKeepLoading = false;
                ServerCom.pomeloRequest(route, data, onSuccess, onFail, null, false);
                return false;
            }
        } else {
            return true;
        }
    },

    join2: function (_id, route, data) {
        ServerCom.forceKeepLoading = true;
        ServerCom.pomeloRequest(route, data, this.onJoinSuccess.bind(this), this.onJoinFail.bind(this), null, false);
    },

    /**
     * @description It is Called when join method request handled successfully
     * @method onJoinSucess
     * @param {Object} response - Object/Data received from server.
     * @param {Object} data -
     * @memberof Controllers.GameManager#
     */
    onJoinSuccess: function (response, data) {
        // ServerCom.launch.active = false;
        if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
            GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
            ServerCom.forceKeepLoading = false;
            return;
        }
        if (!!GameManager.iterationOfJoinsFromLoginScreen) {
            GameManager.joinResponseCounter--;
        }

        var isDisplay = (response.isDisplay !== undefined && response.isDisplay !== null) ? response.isDisplay : true;
        if (response.success) {
            // console.error("JOIN SUCESS DATA 2");
            if (!!GameManager.iterationOfJoinsFromLoginScreen) {
                GameManager.joinSuccessResponseCounter++;
            }
            if (response.roomConfig) {
                // response.gameData = new GameData(response);
                let gameData = JSON.parse(JSON.stringify(response));
                gameData.channelType = response.roomConfig.channelType;
                // response.roomConfig.isRealMoney = GameManager.isRealMoney == true;
                if (response.roomConfig.channelType == K.ChannelType.Tournament) {
                    gameData.type = 1;
                    gameData.roomConfig.isRebuyOpened = ((!!data) && (!!data.isRebuyOpened)) ? data.isRebuyOpened : false;
                }
                // console.error("JOIN SUCESS DATA 3");
                ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, gameData, function () { });
                return;
            } else {
                ServerCom.forceKeepLoading = false;
            }
        } else if (isDisplay) {
            ServerCom.forceKeepLoading = false;
            // console.error("JOIN SUCESS DATA 4");
            if (!!GameManager.iterationOfJoinsFromLoginScreen) {
                GameManager.joinFailResponseCounter++;
                GameManager.joinFailResponses.push(response);
            }

        } else {
            ServerCom.forceKeepLoading = false;
            if (!!GameManager.iterationOfJoinsFromLoginScreen) {
                GameManager.joinFailResponseCounter++;
                GameManager.joinFailResponses.push(response);
            }
            ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);
        }


        ServerCom.forceKeepLoading = false;

        if (!!GameManager.iterationOfJoinsFromLoginScreen && (!!GameManager.joinResponseCounter == !!0)) {
            if (GameManager.joinSuccessResponseCounter == GameManager.totalJoinsFromLoginScreen) {


            } else if (GameManager.joinSuccessResponseCounter > 0) {
                if (GameManager.joinFailResponses.length == 1) {
                    var param = {
                        code: K.Error.SuccessFalseError,
                        response: GameManager.joinFailResponses[0].info,
                        channelId: GameManager.joinFailResponses[0].channelId || "",
                        isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                    };
                    ServerCom.emit('error', param);
                } else if (GameManager.joinFailResponses.length > 1) {
                    var param = {
                        code: K.Error.SuccessFalseError,
                        response: GameManager.joinFailResponses[0].info,
                        channelId: GameManager.joinFailResponses[0].channelId || "",
                        isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                    };
                    ServerCom.emit('error', param);
                }
            } else if (!!GameManager.joinSuccessResponseCounter == !!0) {
                var param = {
                    code: K.Error.SuccessFalseError,
                    response: GameManager.joinFailResponses[0].info,
                    channelId: GameManager.joinFailResponses[0].channelId || "",
                    isRetry: (response.isRetry !== undefined && response.isRetry !== null) ? response.isRetry : false
                };
                // GameManager.emit('error', param);
                ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () {
                    ServerCom.emit('error', param);
                }, false);
            }
        }
    },

    onJoinSuccess2: function (response, data) {
        // console.error("JOIN SUCESS DATA ", JSON.stringify(data));

        // ServerCom.launch.active = false;

        if (response.success) {
            // console.error("JOIN SUCESS DATA 2");
            if (response.roomConfig) {
                // GameManager
                let gameData = JSON.parse(JSON.stringify(response));
                gameData.channelType = response.roomConfig.channelType;
                // response.roomConfig.isRealMoney = GameManager.isRealMoney == true;
                if (response.roomConfig.channelType == K.ChannelType.Tournament) {
                    gameData.type = 1;
                    gameData.roomConfig.isRebuyOpened = ((!!data) && (!!data.isRebuyOpened)) ? data.isRebuyOpened : false;
                }
                gameData.isRejoin = true;

                var indexFound = -1;
                for (var index = 0; index < GameScreen.gameModel.activePokerModels.length; index++) {
                    var id = GameScreen.gameModel.activePokerModels[index].roomConfig._id;
                    if (data.data.roomConfig._id === id) {
                        gameData.indexFound = index;
                        break;
                    }
                    // else {
                    //     response.indexFound = GameScreen.gameModel.activePokerModels[index].roomConfig.tableId;
                    //     break;
                    // }
                }
                // console.error("JOIN SUCESS DATA 3");
                ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, gameData, function () { });
                return;
            } else {
                ServerCom.forceKeepLoading = false;
            }
        } else {
            console.log("onJoinSuccess2");
        }
    },

    /**
     * @description It is Called when join method request handled successfully
     * @method onJoinFail 
     * @param {Object} response - response received from server
     * @memberof Controllers.GameManager#
     */
    onJoinFail: function (response) {
        // ServerCom.launch.active = false;
        ServerCom.forceKeepLoading = false;
        console.log("JOIN FAIL RESPONSE", response);

        if (response.info) {
            GameManager.popUpManager.show(PopUpType.NotificationPopup, response.info, function () { });
        }
    },

    /**
     * @description It enables user to get his preffer seat
     * @method getPreferredSeat
     * @param {Number} maxPlayers - Maximum number of player in a table
     * @memberof Controllers.GameManager#
     */
    getPreferredSeat: function (maxPlayers) {
        var seatId = null;
        switch (maxPlayers) {
            case 2:
                seatId = GameManager.user.seatPreferancesTwo;
                break;
            case 3:
                seatId = 2;
                break;
            case 6:
                seatId = GameManager.user.seatPreferancesSix;
                break;
            case 9:
                seatId = GameManager.user.seatPreferances;
                break;
            default:
                seatId = GameManager.user.seatPreferancesTwo;
                break;
        }
        return seatId;
    },

    /**
     * @description Returns Game name depending on passed value
     * @method getGameTypeByValue
     * @param {Number} val - Numerical value represent turn time!
     * @memberof Controllers.GameManager#
     */
    getGameTypeByValue: function (val) {
        var returnVal = "";
        if (val == 10) {
            returnVal = "Hyper-Turbo";
        } else if (val == 20) {
            returnVal = "Turbo";
        } else if (val == 30) {
            returnVal = "Standard";
        }
        return (returnVal);
    },

    /**
     * @description It removes all the children from an Node
     * @method removeAllChildren
     * @param {Object} contentHolder - Node whose children will be removed
     * @memberof Controllers.GameManager#
     */
    removeAllChildren: function (contentHolder) {
        if (!!contentHolder) {
            var childs = contentHolder.children;
            childs.forEach(function (element) {
                element.destroy();
            }, this);
            // contentHolder.removeAllChildren();
        }
    },

    /**
     * @method getValueByGameType
     * @description Returns gameType/String value in numerical value, represent a turn time!
     * @param {String} gameType - String represent turn speed!
     * @memberof Controllers.GameManager#
     */
    getValueByGameType: function (gameType) {
        var returnVal = null;
        switch (gameType) {
            case "Hyper-Turbo":
                returnVal = 10;
                break;
            case "Turbo":
                returnVal = 20;
                break;
            case "Standard":
                returnVal = 30;
                break;
            default:
                returnVal = 30;
        }
        return (returnVal);
    },

    /**
     * @description  Reset/clear all the  game if any running and fire an event to reset data!
     * @method reset
     * @memberof Controllers.GameManager#
     */
    reset: function (isCashier = true) {
        // GameManager.user = null;
        console.log("rajatk to be destroyed GameManager.reset");
        // GameManager.activeTableCount = 0;
        TableHandler.joinTableList = [];
        GameManager.emit(K.GameEvents.onReset, null);
        if (!!GameScreen) {

            for (var i = GameScreen.gameModel.activePokerModels.length - 1; i >= 0; i--) {
                let element = GameScreen.gameModel.activePokerModels[i];
                if (element.roomConfig.channelType == 'NORMAL') {
                    if (isCashier) {
                        element.clear();
                        GameScreen.gridParent.getComponent(cc.PageView).removePage(element.node);
                        GameScreen.gameModel.activePokerModels.splice(i, 1);

                        GameManager.activeTableCount -= 1;
                    }
                }
                else {
                    if (!isCashier) {
                        element.clear();
                        GameScreen.gridParent.getComponent(cc.PageView).removePage(element.node);
                        GameScreen.gameModel.activePokerModels.splice(i, 1);

                        GameManager.activeTableCount -= 1;
                    }
                }
            }
            if (GameManager.isMobile) {
                this.gameModel.emit("LEAVE FOR TABLE SWIPE");
            }
        }

        this.updateActiveTables();
    },

    /**
     * @description It is used for logging out from game, disconnet the pomelo and request is sent to server!
     * @method logout
     * @memberof Controllers.GameManager#
     */
    logout: function () {
        GameManager.reset();
        GameManager.reset(false);
        ServerCom.refreshTokenExpired = false;
        TournamentSocket.isConnected = false;
        tTournamentSocket.socket.disconnect();
        TournamentSocket = null;
        window.TournamentLobbyListPresenter.needReload = true;
        GameManager.firstLogin = true;
        GameManager.popUpManager.removeAllPopUps();
        if (GameManager.isConnected) {
            GameManager.isConnected = false;
            var data = {
                playerId: GameManager.user.playerId,
                isLoggedIn: false
            };
            ServerCom.pomeloRequest(K.PomeloAPI.logout, data, null, null, null, true, true, function (response) {
                K.disconnectRequestedByPlayer = true;
                GameManager.popUpManager.hideAllPopUps();

                cc.systemEvent.emit("leaveLobby");

                GameManager.isLoaded = false;

                cc.sys.localStorage.removeItem("tx_auto_login_token");
                cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
                cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
                cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
                cc.sys.localStorage.removeItem("tx_auto_login_username");

                GameManager.hightlightRoom = 0;
                GameManager.hightlightTable = 0;

                ServerCom.inGame = false;
                GameManager.needResetUser = true;
                ServerCom.clearConnectCB();

                CashRoom.sortPlayers = true;
                CashRoom.sortBuyinLH = false;
                CashRoom.sortBuyinHL = false;
                CashRoom.sortBlindsLH = false;
                CashRoom.sortBlindsHL = false;

                Advancefilter.config.buyin["Low"] = true;
                Advancefilter.config.buyin["Medium"] = true;
                Advancefilter.config.buyin["High"] = true;

                let lobbyPresenter = ScreenManager.screens[K.ScreenEnum.LobbyScreen];
                if (lobbyPresenter) {
                    lobbyPresenter.onHome(true);
                    lobbyPresenter.onCashierGame2();
                    lobbyPresenter.gamePreferencesPopup.active = false;

                    if (lobbyPresenter.tournamentLobbyDetail.active) {
                        lobbyPresenter.tournamentLobbyDetail.active = false;
                    }

                    if (lobbyPresenter.roomTable.active) {
                        lobbyPresenter.roomTable.getComponent('CashRoom').isShowAll = true;
                        lobbyPresenter.roomTable.getComponent('CashRoom').isShowHoldem = false;
                        lobbyPresenter.roomTable.getComponent('CashRoom').isShowPLO = false;
                        lobbyPresenter.roomTable.getComponent('CashRoom').isShowMega = false;
                        lobbyPresenter.roomTable.getComponent('CashRoom').isShowAllIn = false;
                        lobbyPresenter.roomTable.getComponent('CashRoom').isShowFast = false;
                        lobbyPresenter.setActiveButton(lobbyPresenter.tabButtons2[0], lobbyPresenter.tabButtons2[0]);
                        lobbyPresenter.setInActiveButton(lobbyPresenter.tabButtons2[1], lobbyPresenter.tabButtons2[1]);
                        lobbyPresenter.setInActiveButton(lobbyPresenter.tabButtons2[2], lobbyPresenter.tabButtons2[2]);
                    }
                    GameManager.user = null;
                }

                ScreenManager.showScreen(K.ScreenEnum.LoginScreen, false, function () {
                    if (((!(cc.sys.os === cc.sys.OS_WINDOWS)) || cc.sys.isBrowser) && !!self) {
                        // ServerCom.inGame = false;
                        // self.close();
                    }
                });

                if (window.SharedSocket) {
                    window.WindowManager.closeAllChildWindows();
                    return;
                }
            }.bind(this));
        } else {
            this.scheduleOnce(function () {
                GameManager.popUpManager.hideAllPopUps();
                cc.systemEvent.emit("leaveLobby");
                if (ScreenManager.currentScreen != K.ScreenEnum.LoginScreen) {
                    ScreenManager.showScreen(K.ScreenEnum.LoginScreen, true, function () {
                    });
                }
            }, 0.5);
        }
    },

    logoutAfterSessionExpire: function () {
        if (ScreenManager.currentScreen == K.ScreenEnum.LoginScreen) {
            GameManager.popUpManager.hideAllPopUps();
            return;
        }
        GameManager.reset();
        ServerCom.refreshTokenExpired = false;
        GameManager.isConnected = false;
        var data = {
            playerId: GameManager.user.playerId,
            isLoggedIn: false
        };
        K.disconnectRequestedByPlayer = true;
        GameManager.popUpManager.removeAllPopUps();

        cc.systemEvent.emit("leaveLobby");

        GameManager.isLoaded = false;

        cc.sys.localStorage.removeItem("tx_auto_login_token");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
        cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_username");

        GameManager.hightlightRoom = 0;
        GameManager.hightlightTable = 0;

        ServerCom.inGame = false;
        GameManager.needResetUser = true;
        GameManager.firstLogin = true;
        ServerCom.clearConnectCB();

        CashRoom.sortPlayers = true;
        CashRoom.sortBuyinLH = false;
        CashRoom.sortBuyinHL = false;
        CashRoom.sortBlindsLH = false;
        CashRoom.sortBlindsHL = false;

        Advancefilter.config.buyin["Low"] = true;
        Advancefilter.config.buyin["Medium"] = true;
        Advancefilter.config.buyin["High"] = true;

        let lobbyPresenter = ScreenManager.screens[K.ScreenEnum.LobbyScreen];
        if (lobbyPresenter) {
            lobbyPresenter.onHome(true);
            lobbyPresenter.onCashierGame2();
            lobbyPresenter.gamePreferencesPopup.active = false;

            if (lobbyPresenter.roomTable.active) {
                lobbyPresenter.roomTable.getComponent('CashRoom').isShowAll = true;
                lobbyPresenter.roomTable.getComponent('CashRoom').isShowHoldem = false;
                lobbyPresenter.roomTable.getComponent('CashRoom').isShowPLO = false;
                lobbyPresenter.roomTable.getComponent('CashRoom').isShowMega = false;
                lobbyPresenter.roomTable.getComponent('CashRoom').isShowAllIn = false;
                lobbyPresenter.roomTable.getComponent('CashRoom').isShowFast = false;
                lobbyPresenter.setActiveButton(lobbyPresenter.tabButtons2[0], lobbyPresenter.tabButtons2[0]);
                lobbyPresenter.setInActiveButton(lobbyPresenter.tabButtons2[1], lobbyPresenter.tabButtons2[1]);
                lobbyPresenter.setInActiveButton(lobbyPresenter.tabButtons2[2], lobbyPresenter.tabButtons2[2]);
            }
            GameManager.user = null;
        }

        ScreenManager.showScreen(K.ScreenEnum.LoginScreen, false, function () {
            if (((!(cc.sys.os === cc.sys.OS_WINDOWS)) || cc.sys.isBrowser) && !!self) {
                // ServerCom.inGame = false;
                // self.close();
            }
        });

    },

    logout3: function () {

        window.TournamentLobbyListPresenter.needReload = true;
        GameManager.reset();
        K.disconnectRequestedByPlayer = true;
        GameManager.popUpManager.removeAllPopUps();

        cc.systemEvent.emit("leaveLobby");

        GameManager.isLoaded = false;

        cc.sys.localStorage.removeItem("tx_auto_login_token");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token");
        cc.sys.localStorage.removeItem("tx_auto_login_access_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_refresh_token_expire_at");
        cc.sys.localStorage.removeItem("tx_auto_login_username");

        let lobbyPresenter = ScreenManager.screens[K.ScreenEnum.LobbyScreen];
        if (lobbyPresenter) {
            lobbyPresenter.onHome(true);
            lobbyPresenter.onCashierGame2();
            lobbyPresenter.gamePreferencesPopup.active = false;

            if (lobbyPresenter.tournamentLobbyDetail.active) {
                lobbyPresenter.tournamentLobbyDetail.active = false;
            }
        }

        GameManager.needResetUser = true;

        ScreenManager.showScreen(K.ScreenEnum.LoginScreen, false, function () {});
    },
    //window.alert('My Window is closing');

    getToken(userName, password, cb) {
        let inst = this;
        ServerCom.httpPostRequest(K.Token.auth_server, {
            "userName": userName,
            "password": password,
        },
            function (response) {
                console.log("getToken", response);
                if (response.status == "success") {
                    K.Token.access_token = response.access_token;
                    K.Token.refresh_token = response.refresh_token;
                    K.Token.access_token_expire_at = response.access_token_expire_at;
                    K.Token.refresh_token_expire_at = response.refresh_token_expire_at;
                    cb(response);
                } else {
                    cb(response);
                }
            }
        );
    },

    startRefreshTokenTimer(cb) {
        // console.log("startRefreshTokenTimer");
        this.refreshTokenCB = cb;
        this.unschedule(this.refreshTokenTimer);
        this.schedule(this.refreshTokenTimer, 1);
    },

    stopRefreshTokenTimer() {
        this.refreshTokenCB = cb;
        this.unschedule(this.refreshTokenTimer);
    },

    refreshTokenTimer(dt) {
        let diff = (K.Token.access_token_expire_at - Date.now() / 1000);
        if (diff < 30 && !this.refreshTokenLock) {
            // do refresh
            this.refreshTokenLock = true;
            this.refreshToken();
        } else {

        }
    },

    forceRefreshToken(cb) {
        this.refreshTokenLock = true;
        this.refreshToken(cb);
    },

    refreshToken(cb) {
        let inst = this;
        if (K.Token.refresh_token && K.Token.refresh_token != "") {
            ServerCom.httpGetRequest(K.Token.auth_refresh_server + "?refresh_token=" + K.Token.refresh_token,
                null,
                function (response) {
                    inst.refreshTokenLock = false;
                    console.log("refreshToken", response);
                    if (response.success) {
                        K.Token.access_token = response.data.access_token;
                        // K.Token.refresh_token = response.refresh_token;
                        K.Token.access_token_expire_at = response.data.access_token_expire_at;
                        // K.Token.refresh_token_expire_at = response.refresh_token_expire_at;

                        cc.sys.localStorage.setItem("tx_auto_login_token", K.Token.access_token);
                        cc.sys.localStorage.setItem("tx_auto_login_refresh_token", K.Token.refresh_token);
                        cc.sys.localStorage.setItem("tx_auto_login_access_token_expire_at", K.Token.access_token_expire_at);
                        cc.sys.localStorage.setItem("tx_auto_login_refresh_token_expire_at", K.Token.refresh_token_expire_at);
                        // cb(response);
                        // 
                        if (inst.refreshTokenCB) {
                            inst.refreshTokenCB();
                        } else if (cb) {
                            cb();
                        }
                    } else {
                        GameManager.popUpManager.show(PopUpType.DisconnectDialog, {
                            code: K.Error.Whitelisting,
                            response: "Token refresh timeout please relogin."
                        });
                        // cb(response);
                    }
                },
                function () {
                    GameManager.logout();

                    inst.scheduleOnce(function () {
                        GameManager.popUpManager.show(PopUpType.NotificationPopup, "Token expired, please login again", function () { });
                    }, 0.5);
                },
                function () {
                    GameManager.logout();

                    inst.scheduleOnce(function () {
                        GameManager.popUpManager.show(PopUpType.NotificationPopup, "Token expired, please login again", function () { });
                    }, 0.5);
                }
            );
        } else {
            this.refreshTokenLock = false;
        }
    },

    joinSimilar() {
        let self = this;
        ServerCom.pomeloRequest(
            'connector.entryHandler.joinSimilarTable', {
            channelId: this.gameModel.activePokerModels[GameScreen.prevSelection].gameData.channelId,
            playerId: GameManager.user.playerId,
            isLoggedIn: true,
            access_token: K.Token.access_token

        },
            function (response) {
                console.log(response.similarChannelId);
                // var data = new JoinData(TableContent.prevSelection.channelData);
                var route = K.PomeloAPI.joinChannel;
                GameManager.join2(response.similarChannelId, route, {
                    "channelId": response.similarChannelId,
                    "isRequested": true,
                    "channelType": response.similarChannelType,
                    "tableId": '',
                    "playerId": GameManager.user.playerId,
                    "playerName": GameManager.user.userName,
                    "networkIp": LoginData.ipV4Address,
                    'maxPlayers': 5,
                    'isPrivateTable': false
                });
            }
        );
    },

    updateActiveTables() {
        if (window.SharedSocket) {
            this.activeTables.active = false;
            return;
        }
        if (!GameScreen || !GameScreen.gridParent) {
            return
        }
        var children = 0;
        children = GameScreen.gridParent.getComponent(cc.PageView).getPages().length;
        if (children == 0) {
            this.activeTables.active = false;
        } else {
            this.activeTables.children[1].getComponent(cc.Label).string = (children > 1 ? children + " Active Tables" : "1 Active Table");
            this.activeTables.active = true;
        }

        if (children < GameManager.maxTableCounts) {
            GameManager.popUpManager.remove(PopUpType.TournamentStartingSoonPopup, function () { });
        }

        GameManager.activeTableCount = children;
    },

    gotoActiveTables() {
        if (window.SharedSocket) {
            for (var i = window.WindowManager._childWindows.length - 1; i >= 0; i--) {
                window.WindowManager.bringToFront(window.WindowManager._childWindows[i].id);
            }
        } else {
            ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, 0, function () { });
        }
    },

    isZFold: function () {
        var size = cc.size(cc.Canvas.instance.node.width, cc.Canvas.instance.node.height);
        var aspect = size.height / size.width;
        if (aspect > 1.5) {
            return false;
        } else {
            return true;
        }
    },

    isShorter: function () {
        var size = cc.size(cc.Canvas.instance.node.width, cc.Canvas.instance.node.height);
        var aspect = size.height / size.width;
        // console.log("aspect", aspect);
        if (aspect > 1.8) {
            return false;
        } else {
            return true;
        }
    },

    updatePlayerImageInTable: function (data) {
        GameManager.emit("updatePlayerImageInTable", data.player);
    },

    convertChips: function (num) {
        const number = parseFloat(num);
        if (isNaN(number)) return num;

        if (Number.isInteger(number)) {
            return number;
        }

        const fixed = number.toFixed(2);
        return parseFloat(fixed);
        // return num;
        num = Number(num);
        if (num < 1000) {
            let value = num;
            return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
        }
        if (num < 1000000) {
            if (num == 1000) {
                return '1K';
            }
            let value = num / 1000;
            let formatted = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
            return formatted + 'K';
        }
        if (num < 1000000000) {
            if (num == 1000000) {
                return '1M';
            }
            let value = num / 1000000;
            let formatted = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
            return formatted + 'M';
        }
        let value = num / 1000000000;
        let formatted = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
        return formatted + 'B';
    },

    muteAll: function (pokerPresenter) {
        for (var i = 0; i < pokerPresenter.model.gameData.tableDetails.players.length; i++) {
            let player = pokerPresenter.model.gameData.tableDetails.players[i];
            var playerIndex = pokerPresenter.model.getPlayerById(player.playerId);
            if (playerIndex !== -1) {
                const receiver = pokerPresenter.getPlayerByIdx(playerIndex);
            } else {
                continue;
            }

            let uid = Number(player.playerId.substr(0, 5));
            if (player.playerId == GameManager.user.playerId) {
                window.MGR_AGORA.muteLocalVideoStream(true);
                window.MGR_AGORA.muteLocalAudioStream(true);
                var playerPresenter = pokerPresenter.getMyPlayer();
                if (playerPresenter) {
                    playerPresenter.__muteStateBackToLobby = true;
                }
                cc.systemEvent.emit("onVideoOff", uid, pokerPresenter.model.gameData.agoraChannelName);
            } else {
                window.MGR_AGORA.muteRemoteVideoStream(uid, true);
                window.MGR_AGORA.muteRemoteAudioStream(uid, true);

                var playerPresenter = pokerPresenter.getPlayer(Number(player.playerId));
                if (playerPresenter) {
                    playerPresenter.__muteStateBackToLobby = true;
                }
                cc.systemEvent.emit("onVideoOff", uid, pokerPresenter.model.gameData.agoraChannelName);
            }
        }
    },

    getPlatformType() {
        const isElectron = () => {
            if (typeof window !== 'undefined' && window.process && window.process.type) {
                return true;
            }
            if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Electron') >= 0) {
                return true;
            }
            if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
                return true;
            }
            return false;
        };

        var device = "";
        if (isElectron()) {
            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                device = "windows-app";
            } else if (cc.sys.os === cc.sys.OS_OSX) {
                device = "mac-app";
            }
        } else {
            if (cc.sys.isNative) {
                if (cc.sys.os === cc.sys.OS_ANDROID) {
                    device = "android-native";
                } else if (cc.sys.os === cc.sys.OS_IOS) {
                    device = "ios-native";
                }
            } else {
                if (cc.sys.os === cc.sys.OS_ANDROID) {
                    device = "android-browser";
                } else if (cc.sys.os === cc.sys.OS_IOS) {
                    device = "ios-browser";
                } else {
                    device = "desktop-browser";
                }
            }
        }
        return device;
    },

    getCurrentTimestamp: function () {
        const now = new Date();

        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

        return `${hours}:${minutes}:${seconds}:${milliseconds}`;
    },

    onRegionRestrictedBroadcast: function (data) {
        let info = "";
        if (data.data) {
            info = data.data.info;
        } else {
            info = data.info;
        }
        GameManager.popUpManager.show(PopUpType.RegionRestrictionDetectedPopup, info, function () { });
    },

    onSeatFee: function (data) {
        console.log("onSeatFee", data);
        if (data.event == "FEE_INSUFFICIENT_BALANCE") {
            GameManager.popUpManager.show(PopUpType.FeeInsufficientPopup, data, function () { });
        } else {
            GameManager.popUpManager.show(PopUpType.FeeNotificationPopup, data, function () { });
        }
    },

    formatRemainingSeconds: function (seconds) {
        const totalSeconds = Math.floor(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const formattedSeconds = secs.toString().padStart(2, '0');
        return `${minutes}:${formattedSeconds}`;
    },

    delayShowDeleted: function () {
        this.scheduleOnce(function () {
            GameManager.popUpManager.show(PopUpType.AccountDeleted, null, function () { });
        }, 0.5);
    },

    getVariName: function (channelVariation, isBombPot) {
        if (channelVariation == 'Bomb Pot 5') {
            return "5 Card Bomb Pot";
        } else if (channelVariation == 'Bomb Pot 6') {
            return "6 Card Bomb Pot";
        }
        
        if (isBombPot) {
            return "BombPot";
        }
        if (channelVariation == 'Texas Hold’em') {
            return "Texas Hold’em";
        } else if (channelVariation == 'Omaha') {
            return "PLO 4";
        } else if (channelVariation == 'Omaha 5') {
            return "PLO 5";
        } else if (channelVariation == 'Omaha 6') {
            return "PLO 6";
        } else if (channelVariation == 'Mixed Game') {
            return "Mixed Game";
        } else if (channelVariation == 'Big O') {
            return "Big O";
        }
    },

    getVariNameForMixedGame: function (channelVariation, isBombPot) {
        if (isBombPot) {
            return "Mixed-BombPot";
        }
        if (channelVariation == 'Texas Hold’em') {
            return "Mixed-NLH";
        } else if (channelVariation == 'Omaha') {
            return "Mixed-PLO4";
        } else if (channelVariation == 'Omaha 5') {
            return "Mixed-PLO5";
        } else if (channelVariation == 'Omaha 6') {
            return "Mixed-PLO6";
        } else if (channelVariation == 'Big O') {
            return "Mixed-Big O";
        } else {
            return "Mixed Game";
        }
    },

    initPaymentWebViewBridge() {
        const SCHEME = "paymentcallback";
        if (cc.sys.isNative) {
            this.paymentWebView.setJavascriptInterfaceScheme(SCHEME);
            this.paymentWebView.setOnJSCallback((webview, url) => {
                this.closeFiatPayment();
            });
        } else {
            window.addEventListener('message', this.onWebViewMessage.bind(this));
        }
    },

    onWebViewMessage(event) {
        const data = event.data;
        if (!data || data.type !== "closeWebView") {
            return;
        }
        this.closeFiatPayment();
    },

    openFiatPayment: function () {
        this.paymentWebViewNode.active = true;
        if (cc.sys.isNative) {
            this.paymentWebView.url = K.ServerAddress.payment_html + "?env=1&token=" + K.Token.access_token + "&refresh_token=" + K.Token.refresh_token;
        }
        else {
            this.paymentWebView.url = K.ServerAddress.payment_html + "?env=0&token=" + K.Token.access_token + "&refresh_token=" + K.Token.refresh_token;
        }
    },

    closeFiatPayment: function () {
        this.paymentWebView.url = "about:blank";
        this.paymentWebViewNode.active = false;
    },

    updateJackpotAmount(data) {
        K.BBJAmount = Math.round(data.badBeatpool * 100) / 100;
    },

    bbjNotifiy: function (data) {
        if (K.BBJEnabled) {

            let callFun = () => {
                if (!K.highHandToastActive) {
                    K.highHandToast = false;
                    K.highHandToastActive = true;
                    GameManager.popUpManager.show(PopUpType.BBJWinnerNotifiy, data, function () { });
                } else {
                    this.scheduleOnce(() => {
                        K.highHandToast = false;
                        K.highHandToastActive = true;
                        GameManager.popUpManager.show(PopUpType.BBJWinnerNotifiy, data, function () { });
                    }, 8)
                }
            };
            callFun();
            this.scheduleOnce(() => {
                callFun();
            }, 8);

        }
    },

    highHandNotifiy: function (data) {
        console.log("highHand Data coming announcement 44 " + data.event)
        if (data.event == "ROUND_ENDED") {
            let callFun = () => {
                if (!K.highHandToastActive) {
                    K.highHandToast = true;
                    K.highHandToastActive = true;
                    GameManager.popUpManager.show(PopUpType.BBJWinnerNotifiy, data, function () { });
                } else {
                    this.scheduleOnce(() => {
                        K.highHandToast = true;
                        K.highHandToastActive = true;
                        GameManager.popUpManager.show(PopUpType.BBJWinnerNotifiy, data, function () { });
                    }, 8)
                }
            };
            callFun();
            this.scheduleOnce(() => {
                callFun();
            }, 8);
        } else {
            GameManager.popUpManager.show(PopUpType.BBJ_HighHandToast, data, function () { });
            this.scheduleOnce(() => {
                GameManager.popUpManager.remove(PopUpType.BBJ_HighHandToast, function () { });
            }, 7);
        }

        let canvas = cc.find("Canvas");
        if (!canvas) return;

        let lobbyNode = canvas.getChildByName("LobbyHandlerNew");
        if (!lobbyNode) return;

        let lobbyPresenter = lobbyNode.getComponent("LobbyPresenter");
        if (!lobbyPresenter) return;

        lobbyPresenter.highHandEnableHandle(data);
    },

    onAdminNotice: function (data) {
        GameManager.popUpManager.remove(PopUpType.AdminNoticePopup, function () { });
        GameManager.popUpManager.show(
            PopUpType.AdminNoticePopup,
            {
                "title": data.heading,
                "content": data.broadcastMessage
            },
            function () { }
        );
    },

    _isInCashGameplay: function () {
        if (ScreenManager.currentScreen !== K.ScreenEnum.GamePlayScreen) return false;
        var models = GameManager.gameModel && GameManager.gameModel.activePokerModels;
        if (!models || !models.length) return false;
        for (var i = 0; i < models.length; i++) {
            var presenter = models[i] && models[i].presenter;
            if (presenter && !presenter.isTournament()) return true;
        }
        return false;
    },

    _isInTournamentGameplay: function () {
        if (ScreenManager.currentScreen !== K.ScreenEnum.GamePlayScreen) return false;
        var models = GameManager.gameModel && GameManager.gameModel.activePokerModels;
        if (!models || !models.length) return false;
        for (var i = 0; i < models.length; i++) {
            var presenter = models[i] && models[i].presenter;
            if (presenter && presenter.isTournament()) return true;
        }
        return false;
    },

    onMaintenanceUpdate: function (response) {
        console.log("onMaintenanceUpdate GameManager: ", response);
        if (this._isInTournamentGameplay()) return;
        var action = response && response.action;
        if (action === "maintenanceCancelled" || action === "maintenanceCompleted" || action === "cancelled" || action === "completed") {
            GameManager.isCashgameMaintenance = false;
            GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });
        } else if (action === "warning") {
            GameManager.isCashgameMaintenance = true;
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, response);
        } else {
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, response);
        }
    },

    onMaintenanceNotification: function (response) {
        console.log("onMaintenanceNotification GameManager: ", response);
        if (this._isInTournamentGameplay()) return;
        var action = response && response.action;
        if (action === "maintenanceCancelled" || action === "maintenanceCompleted" || action === "cancelled" || action === "completed") {
            GameManager.isCashgameMaintenance = false;
            GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });
        } else if (action === "warning") {
            GameManager.isCashgameMaintenance = true;
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, response);
        } else {
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, response);
        }
    },

    onTournamentMaintenanceNotification: function (data) {
        console.log("[TournamentMaintenance] action:", data && data.action, data);
        if (!data || !data.action) return;

        var action = data.action;

        if (action === "maintenanceCancelled" || action === "maintenanceCompleted" || action === "cancelled" || action === "completed") {
            GameManager.isTournamentMaintenance = false;
            GameManager.tournamentMaintenanceMsg = null;
            GameManager.tournamentMaintenanceTaskId = null;
            GameManager._tournamentMaintenanceLoginShown = false;
            GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });
        } else if (action === "maintenanceStarted") {
            GameManager.isTournamentMaintenance = true;
            GameManager._tournamentMaintenanceLoginShown = false;
            if (data.message) GameManager.tournamentMaintenanceMsg = data.message;
            if (data.taskId) GameManager.tournamentMaintenanceTaskId = data.taskId;

            if (this._isInCashGameplay()) return;

            GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                message: data.message || "Tournament services are under maintenance.",
                action: "tournamentMaintenance",
                taskId: data.taskId || null,
                sticky: true
            }, function () { });
        } else {
            if (this._isInCashGameplay()) return;
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                message: data.message || "Tournament services are under maintenance.",
                action: "tournamentMaintenance",
                taskId: data.taskId || null
            }, function () { });
        }
    },

    api_notification_dismiss: function (taskId) {
        ServerCom.httpPostRequest(K.ServerAddress.otp_server + "/api/notifications/dismiss",
            { "taskId": taskId },
            function (response) { }
        );
    },

    api_tournament_maintenance_dismiss: function (taskId) {
        ServerCom.httpPostRequest(K.ServerAddress.otp_server + "/api/notifications/dismiss",
            { "type": "tournamentMaintenance", "taskId": taskId },
            function (response) { }
        );
    },

    processLoginNotification: function () {
        console.log("[processLoginNotification] called, notification:", GameManager.notification);
        console.log("[processLoginNotification] popUpManager:", GameManager.popUpManager);
        console.log("[processLoginNotification] popUps[29]:", GameManager.popUpManager && GameManager.popUpManager.popUps[29]);
        if (GameManager.notification) {
            GameManager.notification.data.showDismiss = true;
            console.log("[processLoginNotification] showing popup with data:", GameManager.notification.data);
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, GameManager.notification.data);
            GameManager.notification = null;
        }

        if (GameManager.tournamentMaintenanceMsg && !GameManager._tournamentMaintenanceLoginShown) {
            console.log("[processLoginNotification] tournament maintenance active, showing popup");
            GameManager._tournamentMaintenanceLoginShown = true;
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                message: GameManager.tournamentMaintenanceMsg,
                action: "tournamentMaintenance",
                taskId: GameManager.tournamentMaintenanceTaskId || null,
                showDismiss: !!GameManager.tournamentMaintenanceTaskId
            }, function () { });
        }
    },

    updateAPK: function () {
        const downloadUrl = K.androidBuildUrl;
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/AppActivity",
            "updateApp",
            "(Ljava/lang/String;)V",
            downloadUrl
        );
    },

    onUpdateProgress: function (progress) {
        console.log("onUpdateProgress", progress);
        if (GameManager.popUpManager.isPopupActive(PopUpType.NewVersionPopup)) {
            GameManager.popUpManager.getPopupNode(PopUpType.NewVersionPopup).getComponent("NewVersionPopup").onUpdateProgress(progress);
        }
    },

    changeVibration(vibration) {
        let self = this;
        ServerCom.pomeloRequest(
            'connector.entryHandler.changeVibration', {
            'playerId': GameManager.user.playerId,
            'vibration': vibration,
            'isLoggedIn': true,
            'access_token': K.Token.access_token
        },
            function (response) {
                console.log('connector.entryHandler.changeVibration', response);
            }
        );
    },

    vibrate() {
        if (!GameManager.user.settings.vibration) {
            return;
        }
        if (cc.sys.os === cc.sys.OS_IOS && cc.sys.isNative) {
            try {
                jsb.reflection.callStaticMethod(
                    "VibrationHelper",
                    "vibrateWithStyle:duration:",
                    "medium",
                    0.5
                );
            } catch (e) {
                console.error("[Vibration] failed:", e);
            }
        }
        if (cc.sys.os === cc.sys.OS_ANDROID && cc.sys.isNative) {
            jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/VibrationHelper",
                "vibrateWithStyle",
                "(Ljava/lang/String;F)V",
                "medium",
                0.5
            );
        }
    },

    handlePopupBanners() {
        ServerCom.httpGetRequest(K.ServerAddress.otp_server + "/api/popup-banners",
            null,
            (response) => {
                console.log("popup-banners", response);
                const activeTables = GameManager.gameModel && GameManager.gameModel.activePokerModels;
                if (activeTables && activeTables.length > 0) return;
                if (GameManager.isTournamentRestoring) return;
                if (response.data && response.data.popupBanners.length > 0) {
                    if (GameManager.isCashgameMaintenance || GameManager.isTournamentMaintenance) return;
                    GameManager.popUpManager.show(PopUpType.BannerPopup, response.data.popupBanners, function () { });
                }
            },
            (error) => {
                console.log("popup-banners", error);
            }
        );
    },

    api_banner_dismiss(bannerId) {
        ServerCom.httpPostRequest(K.ServerAddress.otp_server + "/api/popup-banners/dismiss",
            {},
            function (response) { }
        );
    },

    onReserveSeat(channelId) {
        var isExisting = false;
        var indexFound = -1;
        for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
            var id = this.gameModel.activePokerModels[index].roomConfig._id;
            if (channelId === id) {
                indexFound = index;
                isExisting = true;
            }
        }
        if (isExisting) {
            ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, indexFound, function () { });
        }
    },

    api_addPlayerFcmToken: function () {
        if (!cc.sys.isNative) {
            return;
        }
        console.log("api_addPlayerFcmToken");
        let fcmToken = "";
        let platform = "";

        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            // Set up a listener to handle the data sent from native code
            fcmToken = jsb.reflection.callStaticMethod("AppController", "getFCM");
            console.log("fcmToken", fcmToken);
            platform = "ios"
        }
        else if (cc.sys.os === cc.sys.OS_ANDROID) {
            fcmToken = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getFCM", "()Ljava/lang/String;");
            platform = "android";
        }

        console.log("platform", platform);
        console.log("fcmToken", fcmToken);

        if (fcmToken == '') {
            this.scheduleOnce(function () {
                this.api_addPlayerFcmToken();
            }, 5);
            return;
        }

        ServerCom.httpPostRequest(K.ServerAddress.otp_server + "/api/device-token/register",
            { "deviceToken": fcmToken, "platform": platform },
            function (response) {
                console.log("response >>>>>>>>>>>>>>>>>>>>> ");
                console.log(JSON.stringify(response));
            }
        );
    },

    onSideTableUpdate: function (data) {
        GameManager.emit("updateWaitingPlayers", data);
    },

    getAvatar: function(index) {
        for (var i = 0; i < GameManager.avatarPool.length; i++) {
            if (GameManager.avatarPool[i].__data == index) {
                return GameManager.avatarPool[i];
            }
        }
        return GameManager.avatarPool[0];
    },

});
