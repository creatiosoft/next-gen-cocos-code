/**
 * @namespace Screens.Lobby 
 */
var LobbyHandler = require('LobbyHandler');
var Checkbox = require('Checkbox');
var Table = require('Table');
var abstractScreen = require('AbstractScreen');
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var DropDownType = require('DropDown');
var GetPrize = require('PostTypes').GetPrizeData;
var LoginHandler = require('LoginHandler');
var CashRoom = require('CashRoom');
const { K } = require('../../Configs/GameConfig');
const { default: bannerHandler } = require('../../bannerAds/bannerHandler');
var changeAvatar = require('ResponseTypes').changeAvatar;
/**
 * @class LobbyPresenter
 * @classdesc Manage view of Lobby
 * @memberof Screens.Lobby
 */
cc.Class({
    extends: abstractScreen,
    properties: {
        version: {
            default: null,
            type: cc.Label,
        },
        comingSoon: {
            default: null,
            type: cc.Node,
        },
        navNode: {
            default: null,
            type: cc.Node,
        },
        tournamentLobbyDetail: {
            default: null,
            type: cc.Node,
        },
        top: {
            default: null,
            type: cc.Node,
        },
        top2: {
            default: null,
            type: cc.Node,
        },
        centerNode: {
            default: null,
            type: cc.Node,
        },
        mainButtons: {
            default: null,
            type: cc.Node,
        },
        bottomNode: {
            default: null,
            type: cc.Node,
        },
        tournamentTable: {
            default: null,
            type: cc.Node,
        },
        cashierTable: {
            default: null,
            type: cc.Node,
        },
        roomTable: {
            default: null,
            type: cc.Node,
        },
        loginHandler: {
            default: null,
            type: LoginHandler,
        },
        handler: {
            default: null,
            type: LobbyHandler,
        },
        tables: {
            default: [],
            type: Table,
        },
        tabButtons2: {
            default: [],
            type: cc.Sprite,
        },
        playerName: {
            default: null,
            type: cc.Label,
        },
        playerId: {
            default: null,
            type: cc.Label,
        },
        playerImg: {
            default: null,
            type: cc.Sprite,
        },
        balance: {
            default: null,
            type: cc.Label,
        },
        balance2: {
            default: null,
            type: cc.Label,
        },
        imageLoadedRef: {
            default: {},
        },
        jackPotNode: {
            default: null,
            type: cc.Node,
        },

        jackpotAmount: {
            default: null,
            type: cc.Label,
        },

        highHandIcon: {
            default: [],
            type: cc.SpriteFrame,
        },

        bannerAdsNode: {
            default: null,
            type: cc.Node
        },

        gamePreferencesPopup: {
            default: null,
            type: cc.Node
        },
        homeScreenNode: {
            default: null,
            type: cc.Node
        },

        lockClick: false,
    },

    /**
     * @method onShow
     * @description Called every time the screen is enabled
     * @param {object} data 
     * @memberof Screens.Lobby.LobbyPresenter#
     */
    onShow: function (data) {
        this.tournamentLobbyDetail.active = false;
        this.onBackLobby(null, null, false);

        this.onGetTableData((res) => {
            this.roomTable.getComponent('CashRoom').onEnable2(res, false);
        });

        if (GameManager.isConnected) {
            GameManager.popUpManager.hideAllPopUps();
        }
        GameManager.processLoginNotification();
        this.refreshDetails();
        this.refreshPlayerChips();

        this.playerImg.spriteFrame = GameManager.user.urlImg;
        if (GameManager.isCashgameMaintenance) {
            let cashgame = cc.find("Canvas").getChildByName("LobbyHandlerNew").getChildByName("Center").getChildByName("TournamentLobbyList");
            if (cashgame && !cashgame.active) {
                GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                    message: GameManager.cashgameMaintenanceMsg || "Cash game services are currently under maintenance.",
                    action: "cashgameMaintenance",
                    sticky: true
                }, function () { });
            }
        }
        this.scheduleOnce(() => {
            if (GameManager.isCashgameMaintenance) {
                let cashgame = cc.find("Canvas").getChildByName("LobbyHandlerNew").getChildByName("Center").getChildByName("TournamentLobbyList");
                if (cashgame && !cashgame.active) {
                    GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                        message: GameManager.cashgameMaintenanceMsg || "Cash game services are currently under maintenance.",
                        action: "cashgameMaintenance",
                        sticky: true
                    }, function () { });
                }
            }
        }, 0.5);

        cc.systemEvent.emit("LaunchOver");
    },

    /**
     * @method refreshPlayerChips
     * @description Method to keep player chips updated
     * @memberof Screens.Lobby.LobbyPresenter#
     */
    refreshPlayerChips: function () {
        this.balance2.string = this.balance.string = Number((GameManager.user.category == "GOLD" ? GameManager.user.freeChips : GameManager.user.realChips).toFixed(2));
        this.balance.string = GameManager.convertChips(this.balance.string);
        this.balance2.string = GameManager.convertChips(this.balance2.string);
    },

    updatePlayerProfileLogout: function (data) {
        this.onLogOut();
    },

    /**
     * @method updatePlayerProfile
     * @description Method to Update Player Chips and Loyalty Stars on BroadCast
     * @param {object} data 
     * @memberof Screens.Lobby.LobbyPresenter#
     */
    updatePlayerProfile: function (data) {
        // console.log("diggie required data", data);
        if (data.event == "REALCHIPSUPDATE") {
            let delta = Number(data.updated.realChips) - Number(GameManager.user.realChips);
            if (delta > 0) {

                if (data.transactionType && data.transactionType == "withdrawalRejected") {
                    GameManager.popUpManager.show(
                        PopUpType.CommonDialog,
                        {
                            "title": "Notice",
                            "content": "Withdrawal request rejected"
                        },
                        function () { }
                    );
                }
                else {
                    GameManager.popUpManager.show(
                        PopUpType.CommonDialog,
                        {
                            "title": "Congratulations!",
                            "content": "You have received " + delta.toFixed(2) + " chips."
                        },
                        function () { }
                    );
                }
            }
        }
        for (var key in data.updated) {
            GameManager.user[key] = data.updated[key];

            if (String(key).includes("profileImage")) {
                // console.log("[Avatar] LobbyPresenter.updatePlayerProfile broadcast: raw value from server=", data.updated[key]);
                GameManager.user.profileImage = Number(data.updated[key]) - 1;
                GameManager.user.urlImg = GameManager.avatarImages[Number(GameManager.user.profileImage)];
                // console.log("[Avatar] LobbyPresenter.updatePlayerProfile: set profileImage (0-indexed)=", GameManager.user.profileImage, "urlImg=", GameManager.user.urlImg);
                GameManager.emit("image-loaded", GameManager.user);
                // console.log("[Avatar] LobbyPresenter.updatePlayerProfile: emitted image-loaded");
            }
            // }
        }
        this.refreshPlayerChips();

        if (data.event == "REALCHIPSUPDATE") {
            GameManager.emit("REALCHIPSUPDATE");
        }
    },


    onLoad: function () {
        this.handleBannerAds();
        if (this.version) {
            this.version.string = "v" + K.AppVersion.buildVersion;
        }

        this.scheduleOnce(() => {
            this.tournamentTable.active = false;
        }, 0.5);
        let self = this;


        ServerCom.inGame = true;
        this.imageLoadedRef = this.imageLoaded.bind(this);
        GameManager.on("lockMain", this.onLockMain.bind(this));
        GameManager.on("image-loaded", this.imageLoadedRef);
        GameManager.on("refreshPlayerChips", this.refreshPlayerChips.bind(this));
        ServerCom.pomeloBroadcast(K.LobbyBroadcastRoute.updateProfile, this.updatePlayerProfile.bind(this));
        ServerCom.pomeloBroadcast("playerLogout", this.updatePlayerProfileLogout.bind(this));
        this.onShowAll(true);
        ServerCom.pomeloBroadcast("banPLayer", this.onBan.bind(this));
        ServerCom.socketIOBroadcast(GameManager.user.playerId, this.onPlayerEvent.bind(this));

        if (GameManager.isP) {
            this.privNFav.forEach((elem) => {
                elem.active = false;
            }, this);

        }

        GameManager.startRefreshTokenTimer(() => {
            ServerCom.refreshConnectToServer("", () => { }, () => { });
        });
        this.handleBBj();
        this.handleHighHand(false);
        ServerCom.pomeloBroadcast("increaseCurrentJackpotPool", this.updateJackpotAmount.bind(this));
        GameManager.handlePopupBanners();
    },

    updateJackpotAmount(data) {
        K.BBJAmount = Math.round(data.badBeatpool * 100) / 100;
        this.showJackpotAmount();
    },


    onBan: function (data) {
        var param = {
            code: 8888,
            response: data.info
        };
        GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function () { });
    },

    onPlayerEvent: function (response) {
        let delta = Number(response.data.realChips) - Number(GameManager.user.realChips);
        GameManager.user.realChips = response.data.realChips;
        this.refreshPlayerChips();
        if (delta > 0) {
            GameManager.popUpManager.show(
                PopUpType.CommonDialog,
                {
                    "title": "Congratulations!",
                    "content": "You have received " + delta.toFixed(2) + " chips."
                },
                function () { }
            );
        }
    },

    imageLoaded: function (user) {
        if (GameManager.user && GameManager.user.playerId === user.playerId) {
            this.playerImg.spriteFrame = GameManager.user.urlImg || user.urlImg;
        }
    },

    refreshDetails: function () {
        this.playerName.string = GameManager.user.userName;
        this.playerImg.spriteFrame = GameManager.user.urlImg;
        this.playerId.string = + GameManager.user.playerId;
    },

    _setVariationTabButtons: function (room) {
        var activeStates = [room.isShowAll, room.isShowHoldem, room.isShowPLO, room.isShowMixed];
        for (var i = 0; i < this.tabButtons2.length && i < 4; i++) {
            if (activeStates[i]) {
                this.setActiveButton(this.tabButtons2[i]);
            } else {
                this.setInActiveButton(this.tabButtons2[i]);
            }
        }
    },

    /**
     * ALL / NLH / PLO / MIXED behave as independent checkboxes, same as Low/Mid/High.
     * Picking "All" clears the other three; picking any of NLH/PLO/MIXED toggles that
     * one on/off and clears "All". No filter selected falls back to showing everything.
     * Uses cached CashRoom.roomData when present — no lobby refetch.
     */
    _applyRoomVariation: function (mode, fromMainMenu, cb) {
        if (fromMainMenu == true) {
            CashRoom.isPriactice = false;
        }

        if (this.roomTable.active) {
            var room = this.roomTable.getComponent('CashRoom');

            if (mode === 'all') {
                room.isShowAll = true;
                room.isShowHoldem = false;
                room.isShowPLO = false;
                room.isShowMixed = false;
            } else {
                if (mode === 'holdem') {
                    room.isShowHoldem = !room.isShowHoldem;
                } else if (mode === 'omaha') {
                    room.isShowPLO = !room.isShowPLO;
                } else if (mode === 'mixed') {
                    room.isShowMixed = !room.isShowMixed;
                }
                room.isShowAll = !room.isShowHoldem && !room.isShowPLO && !room.isShowMixed;
            }
            room.isShowMega = false;
            room.isShowAllIn = false;
            room.isShowFast = false;

            this._setVariationTabButtons(room);

            if (room.roomData && room.roomData.length) {
                room._refreshFromCache();
                if (cb) {
                    cb();
                }
                if (!GameManager.isMobile) {
                    this.cashierTable.active = false;
                }
            } else {
                this.onGetTableData((data) => {
                    if (cb) {
                        cb();
                    }
                    room.onEnable2(data);
                    if (!GameManager.isMobile) {
                        this.cashierTable.active = false;
                    }
                });
            }
        } else {
            var variation = K.Variation.All;
            if (mode === 'holdem') {
                variation = K.Variation.TexasHoldem;
            } else if (mode === 'omaha') {
                variation = K.Variation.Omaha;
            }
            this.tables.forEach(function (element) {
                element.variation = variation;
            }, this);
        }
        GameManager.playSound(K.Sounds.click);
    },

    onShowAll: function (fromMainMenu = false, cb = null) {
        this._applyRoomVariation('all', fromMainMenu, cb);
    },


    /**
     * @method onShowHoldem
     * @description Show Holdem button handler
     * @memberof Screens.Lobby.LobbyPresenter#
     */
    onShowHoldem: function (fromMainMenu = false, cb = null) {
        this._applyRoomVariation('holdem', fromMainMenu, cb);
    },

    forceKeepLoadingTimer() {
        ServerCom.forceKeepLoading = true;
    },

    onGetTableData: function (cb) {
        var inst = this;

        this.scheduleOnce(this.forceKeepLoadingTimer, 1);

        ServerCom.pomeloRequest("connector.entryHandler.getLobbyRooms", {
            isRealMoney: false,
            channelVariation: "All",
            playerId: GameManager.user.playerId,
            isLoggedIn: true,
            access_token: K.Token.access_token
        }, function (response) {
            console.log("TABLE DATA IS ", JSON.parse(JSON.stringify(response)));

            inst.unschedule(inst.forceKeepLoadingTimer);

            if (cb) {
                ServerCom.forceKeepLoading = false;
                cb(response.result);
            }

        }, null, 5000, false);
    },

    /**
     * @method onShowOmaha
     * @description Show Omaha button handler
     * @memberof Screens.Lobby.LobbyPresenter#
     */
    onShowOmaha: function (fromMainMenu = false, cb = null) {
        this._applyRoomVariation('omaha', fromMainMenu, cb);
    },

    onShowMixed: function (fromMainMenu = false, cb = null) {
        this._applyRoomVariation('mixed', fromMainMenu, cb);
    },

    onShowLobbySettings: function () {
        var maintenancePopup = GameManager.popUpManager.popUps[PopUpType.MaintenancePopup];
        if (maintenancePopup && maintenancePopup.node.active) {
            GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });
        }
        this.gamePreferencesPopup.active = true;
        GameManager.playSound(K.Sounds.click);
    },

    setActiveButton: function (currBtn) {
        if (currBtn.node.getChildByName("pressed")) {
            currBtn.node.getChildByName("pressed").active = true;
        }
    },

    setInActiveButton: function (currBtn) {
        if (currBtn.node.getChildByName("pressed")) {
            currBtn.node.getChildByName("pressed").active = false;
        }
    },

    onShowGameplay: function () {
        if (GameManager.activeTableCount > 0) {
            ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, null, function () { }, false);
        }
    },

    onTableClick: function (data, custom) {
        GameManager.playSound(K.Sounds.click);
        ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, custom, function () { });
    },

    onCashierGame: function () {
        this.tournamentTable.active = false;
        this.cashierTable.active = false;
        this.roomTable.scale = 1;
        if (!GameManager.isMobile) {
            this.roomTable.scale = 0.8;
        }
    },

    onCashierGame2: function () {
        if (this.cashierTable.active) {
            this.top.active = true;
            this.top2.active = false;
        }
        this.comingSoon.active = false;
        this.tournamentTable.active = false;
        // this.cashierTable.active = false;
        this.cashierTable.active = true;
        this.roomTable.scale = 1;
        if (!GameManager.isMobile) {
            this.roomTable.scale = 0.8;
        }
    },

    onTournamentList: function () {
        if (GameManager.isCashgameMaintenance) {
            GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });
        }

        if (!K.NewTournament) {
            this.comingSoon.active = true;
        }

        if (!GameManager.isMobile) {
        }

        if (this.lockClick) {
            return;
        }
        this.lockClick = true;
        this.scheduleOnce(() => {
            this.lockClick = false;
        }, 0.1);

        this.cashierTable.active = false;
        this.tournamentTable.active = true;
        this.tournamentTable.opacity = 255;
        this.roomTable.scale = 0;
    },

    onBackLobby: function (event, msg, animated = true) {
        if (this.roomTable.scale == 0 && !this.tournamentTable.active) {
            this.onBackLobby2(event, msg, animated && this.roomTable.scale != 0);
            return;
        }
        this.top.active = true;
        this.navNode.active = true;
        this.top2.active = false;

        if (GameManager.isMobile) {
            this.cashierTable.active = false;
        }
    },

    onBackLobby2: function (event, msg, animated = true) {
        this.cashierTable.getComponent("CashTablePresenter").resetAllFilters();
        this.navNode.active = true;
        this.top.active = true;
        this.top2.active = false;

        this.cashierTable.active = false;
        this.roomTable.active = true;
        this.roomTable.scale = 1;
        if (!GameManager.isMobile) {
            this.roomTable.scale = 0.8;
        }
    },

    onLockMain() {
        this.mainButtons.children.forEach((elem) => {
            elem.getComponent(cc.Button).interactable = false;
        }, this);
        this.scheduleOnce(() => {
            this.mainButtons.children.forEach((elem) => {
                elem.getComponent(cc.Button).interactable = true;
            }, this);
        }, 0.2);
    },

    onHome(isFromLogout = false) {
        if (isFromLogout !== true) {
            if (GameManager.isCashgameMaintenance) {
                GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                    message: GameManager.cashgameMaintenanceMsg || "Cash game services are currently under maintenance. Please try again later.",
                    action: "cashgameMaintenance",
                    sticky: true
                }, function () { });
            }
        }
        if (GameManager.isTournamentMaintenance && !GameManager.isCashgameMaintenance) {
            GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });
        }
        this.mainButtons.children.forEach((elem) => {
            elem.getChildByName("Background").color = cc.Color.WHITE;
            elem.getChildByName("Label").color = new cc.Color().fromHEX("#7B7B7B");
            elem.getChildByName("Shade").active = false;
            elem.getChildByName("star").active = false;

            if (!GameManager.isMobile) {
                elem.getChildByName("selected").active = false;
            }
        }, this);

        // this.mainButtons.children.forEach((elem) => {
        //     elem.getComponent(cc.Button).interactable = false;
        // }, this);
        // this.scheduleOnce(() => {
        //     this.mainButtons.children.forEach((elem) => {
        //         elem.getComponent(cc.Button).interactable = true;
        //     }, this);
        // }, 1);

        this.mainButtons.children[0].getChildByName("Background").color = cc.Color.WHITE;
        this.mainButtons.children[0].getChildByName("Label").color = new cc.Color().fromHEX("#FDAB2E");
        this.mainButtons.children[0].getChildByName("Shade").active = true;
        this.mainButtons.children[0].getChildByName("star").active = true;

        if (!GameManager.isMobile) {
            this.mainButtons.children[0].getChildByName("selected").active = true;
            this.mainButtons.children[0].getChildByName("Background").active = true;
            this.mainButtons.children[0].getChildByName("Background2").active = false;
            this.mainButtons.children[1].getChildByName("Background").active = false;
            this.mainButtons.children[1].getChildByName("Background2").active = true;
        }
    },

    onTournament() {
        this.top.active = true;
        this.top2.active = false;
        this.mainButtons.children.forEach((elem) => {
            elem.getChildByName("Background").color = cc.Color.WHITE;
            elem.getChildByName("Label").color = new cc.Color().fromHEX("#7B7B7B");
            elem.getChildByName("Shade").active = false;
            elem.getChildByName("star").active = false;
            if (!GameManager.isMobile) {
                elem.getChildByName("selected").active = false;
            }
        }, this);

        if (GameManager.isTournamentMaintenance) {
            GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                message: GameManager.tournamentMaintenanceMsg || "Tournament services are currently under maintenance. Please try again later.",
                action: "tournamentMaintenance",
                sticky: true
            }, function () { });
        }
        // this.mainButtons.children.forEach((elem) => {
        //     elem.getComponent(cc.Button).interactable = false;
        // }, this);
        // this.scheduleOnce(() => {
        //     this.mainButtons.children.forEach((elem) => {
        //         elem.getComponent(cc.Button).interactable = true;
        //     }, this);
        // }, 1);

        this.mainButtons.children[1].getChildByName("Background").color = cc.Color.WHITE;
        this.mainButtons.children[1].getChildByName("Label").color = new cc.Color().fromHEX("#FDAB2E");
        this.mainButtons.children[1].getChildByName("Shade").active = true;
        this.mainButtons.children[1].getChildByName("star").active = true;
        if (!GameManager.isMobile) {
            this.mainButtons.children[1].getChildByName("selected").active = true;

            this.mainButtons.children[1].getChildByName("Background").active = true;
            this.mainButtons.children[1].getChildByName("Background2").active = false;

            this.mainButtons.children[0].getChildByName("Background").active = false;
            this.mainButtons.children[0].getChildByName("Background2").active = true;
        }
    },

    onLogOut: function () {
        GameManager.popUpManager.show(PopUpType.OnLogOutPopup, null, function () { });
        GameManager.playSound(K.Sounds.click);
    },

    handleBBj() {
        var setUi = () => {
            this.showJackpotAmount();
            let isJackpotActive = K.BBJEnabled;
            this.jackPotNode.active = isJackpotActive;
            if (isJackpotActive) {
                this.jackPotNode.off(cc.Node.EventType.TOUCH_END);
                this.jackPotNode.on(cc.Node.EventType.TOUCH_END, () => {

                    GameManager.playSound(K.Sounds.click);
                    callApi((data) => {
                        GameManager.popUpManager.show(PopUpType.JackpotPopup, data, function () { });// JackpotPopup  BBJWinnerPopup
                    });
                });
            }
        };
        let callApi = (cb) => {
            ServerCom.httpGetRequest(K.ServerAddress.otp_server + "/api/bbj/client-info",
                null,
                (response) => {
                    console.log("bbjData", response);
                    K.BBJAmount = Math.round(response.result.poolBalance * 100) / 100;
                    cb && cb(response.result);
                },
                (error) => {
                    console.log("bbjData error", error);
                }
            );
        };
        setUi();
    },

    showJackpotAmount() {
        let amount = K.BBJAmount;
        this.jackpotAmount.string = `${amount}`;
    },

    handleHighHand(updateType) {
        let setUi = () => {
            let highHandEnableInGame = K.highHandEnableInGame;
            let highHandNode = this.top?.getChildByName("Cashier")?.getChildByName("Highhand");
            console.log("HighHand : 000000000", highHandNode);
            if (highHandNode) {
                highHandNode.active = K.HighHandEnabled;
                if (K.HighHandEnabled) {
                    highHandNode.getComponent(cc.Sprite).spriteFrame = highHandEnableInGame ? this.highHandIcon[0] : this.highHandIcon[1];
                    if (highHandEnableInGame) {
                        highHandNode.children[0].off(cc.Node.EventType.TOUCH_START);
                        highHandNode.children[0].on(cc.Node.EventType.TOUCH_START, () => {
                            GameManager.playSound(K.Sounds.click);

                            callApi((data) => {
                                if (K.highHandEnableInGame) {
                                    GameManager.popUpManager.remove(PopUpType.HighHandPopup, function () { });
                                    GameManager.popUpManager.show(PopUpType.HighHandPopup, data, function () { });
                                }
                            });

                        });
                    }

                }
            }
        }
        let callApi = (cb) => {
            ServerCom.httpGetRequest(K.ServerAddress.otp_server + "/api/highHand/status",
                null,
                (response) => {
                    console.log("highHandData", response);
                    K.highHandEnableInGame = response.data.hasActiveEvent;
                    cb && cb(response);
                },
                (error) => {
                    console.log("highHandData error", error);
                }
            );
        };
        if (updateType) {
            setUi();
        } else {
            callApi((data) => {
                setUi();
            });
        }
    },

    highHandEnableHandle(data) {
        if (data.event == "EVENT_BEGIN") {
            K.highHandEnableInGame = true;
            this.handleHighHand(true);
        }
        if (data.event == "EVENT_COMPLETED") {
            K.highHandEnableInGame = false;
            this.handleHighHand(true);
        }
    },

    handleBannerAds() {
        this.bannerAdsNode.active = false;
        this.scheduleOnce(() => {
            ServerCom.httpGetRequest(K.ServerAddress.otp_server + "/api/promotional-banners",
                null,
                (response) => {
                    console.log("bannerData", response);
                    this.bannerAdsNode.active = true;
                    this.scheduleOnce(() => {
                        let handler = this.bannerAdsNode.getComponent(bannerHandler);
                        handler.setData(response.data.promotionalBanners);
                    }, 0);
                },
                (error) => {
                    console.log("bannerData", error);
                }
            );
        }, 0);
    }
});
