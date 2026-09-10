var gameModelType = require("GameModel");
var pokerPresenterType = require("PokerPresenter");
var popUpManagerType = require("PopUpManager").PopUpManager;
var abstractScreen = require('AbstractScreen');
var tableTab = require('TableTab');
var TournamentModelHandler = require('TournamentModelHandler').TournamentModelHandler;
var PopUpType = require('PopUpManager').PopUpType;

var root = window;

/** 
 * @enum {Number} 
 * @description Used to represent Tiled/untiled view 
 * @memberof Screens.Gameplay.GameScreen#
 */
window.LayoutType = new cc.Enum({
    Tiled: 1,
    UnTiled: 2,
});

/**
 * @classdesc Manges the game view, Used on the node where game is instatntiated, Manages size of game during tiled/Untiled view
 * @class GameScreen
 * @extends AbstractScreen
 * @memberof Screens.Gameplay
 */
cc.Class({
    extends: abstractScreen,

    properties: {
        preLogin: {
            default: null,
            type: cc.Node,
        },
        verticleBorder: {
            default: null,
            type: cc.Node,
        },
        horizontalBorder: {
            default: null,
            type: cc.Node,
        },

        gameModel: {
            default: null,
            type: gameModelType,
        },

        popUpManager: {
            default: null,
            type: popUpManagerType,
        },

        texasHoldemPrefab: {
            default: null,
            type: cc.Prefab,
        },

        omahaHiLoPrefab: {
            default: null,
            type: cc.Prefab,
        },

        omahaPrefab: {
            default: null,
            type: cc.Prefab,
        },

        gridParent: {
            default: null,
            type: cc.Node,
        },

        tableTabs: {
            default: [],
            type: [cc.Node],
        },
        viewType: LayoutType.UnTiled,
        prevSelection: {
            default: null,
        },
        unTiledView: {
            default: null,
            type: cc.Node,
        },
        tiledView: {
            default: null,
            type: cc.Node,
        },
        chatBtn: {
            default: null,
            type: cc.Button,
        },
        isMobile: false,
        isWindows: false,

        preferences: {
            default: null,
            type: cc.Node,
        },
        pageView: {
            default: null,
            type: cc.PageView,
        },
        gridRefreshing: false,
        horizontalMovement: false,
        startY: 0,
        startX: 0,
        tableTurnArray: [],
    },
    /**
     * @method onLoad
     * @description Register Event of table close!
     * @memberof Screens.Gameplay.GameScreen#
     */
    onLoad: function () {
        cc.systemEvent.emit("RESTORE_LOGIN");
        this.checkForWindowScene = false;
        if (cc.sys.os === cc.sys.OS_WINDOWS && !cc.sys.isBrowser) {
            this.checkForWindowScene = true;
        }

        root.GameScreen = this;

        GameManager.on(K.GameEvents.OnTableClosed, this.onRemove.bind(this));

        GameManager.on("updateTableBgImage", this.onUpdateTableBgImage.bind(this));
        GameManager.on("showJoinSimlar", this.showJoinSimlar.bind(this));
        GameManager.on("hideJoinSimlar", this.hideJoinSimlar.bind(this));

        if (!GameManager.isMobile && (cc.sys.isBrowser || cc.sys.os === cc.sys.OS_WINDOWS)) {
            cc.view.on('canvas-resize', () => {
                clearTimeout(this.resizeId);
                // this.resizeId = setTimeout(this.refreshGrid(), 100);
            });
        }

        if (GameManager.isMobile) {
            this.gridParent.on('scroll-ended', () => {
                // this.horizontalMovement = false;
                // console.log("Touch Move End ");
                console.log('scroll-ended', this.gridParent.getComponent(cc.PageView).getCurrentPageIndex());
                GameScreen.onTabSelection(this.gridParent.getComponent(cc.PageView).getCurrentPageIndex());
                this.selectTabSelection();

                for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
                    var presenter = this.gameModel.activePokerModels[index].node.children[0].getComponent('PokerPresenter');
                    presenter.gameOptionButton.active = true;
                    presenter.gameResultButton.active = true;
                    if (!presenter.isTournament2) {
                        presenter.gameLeaveButton.active = true;
                    }
                }
            }, this);

            this.gridParent.on('scrolling', () => {

                for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
                    var presenter = this.gameModel.activePokerModels[index].node.children[0].getComponent('PokerPresenter');
                    presenter.gameOptionButton.active = false;
                    presenter.gameResultButton.active = false;
                    presenter.gameLeaveButton.active = false;
                }

            }, this);
        } else {
            this.gridParent.getComponent(cc.PageView).enabled = false;
        }


        this.gridParent.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.gridParent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchEnd, this);
    },

    onTouchStart(event) {
        console.log("Touch Start");
        this.pageView.enabled = false;
        this.horizontalMovement = false;
        this.startY = event.getLocationY();
        this.startX = event.getLocationX();
    },

    onTouchEnd(event) {
        if (this.horizontalMovement) return;

        let pos = event.getLocation();
        let deltaX = pos.x - this.startX;
        let horizontalTolerance = 30;

        if (Math.abs(deltaX) > horizontalTolerance) {
            this.pageView.enabled = true;
            let totalPages = this.pageView.getPages().length;
            if (totalPages !== 2) return;
            if (this.startX > pos.x) {
                let _currentIndex = this.pageView.getCurrentPageIndex();
                let children = this.pageView.content.children;
                this.horizontalMovement = true;
                this.scheduleOnce(() => {
                    if (_currentIndex == 0) return;
                    console.log("Touch Move Horizontal right ");
                    children[0].setSiblingIndex(1);
                    this.pageView.scrollToPage(0, 0.001);
                }, 0.001);
            } else {
                let _currentIndex = this.pageView.getCurrentPageIndex();
                let children = this.pageView.content.children;
                this.horizontalMovement = true;
                this.scheduleOnce(() => {
                    if (_currentIndex == 1) return;
                    console.log("Touch Move Horizontal left ");
                    children[1].setSiblingIndex(0);
                    this.pageView.scrollToPage(1, 0.001);
                }, 0.001);
            }
        }
    },

    /**
     * @description Sets tiled view on desktop
     * @method setTiledView
     * @memberof Screens.Gameplay.GameScreen#
     */
    setTiledView: function () {
        if (this.isMobile) {
            return;
        }
        this.viewType = LayoutType.Tiled;
        // this.viewType = LayoutType.UnTiled;
        this.refreshGrid();
    },

    /**
     * @description Sets untiled view
     * @method setUnTiledView
     * @memberof Screens.Gameplay.GameScreen#
     */
    setUnTiledView: function () {
        this.viewType = LayoutType.UnTiled;
        this.refreshGrid();
    },

    /**
     * @description Callback from ScreenManager, check for view and instantiate game!
     * @method onShow
     * @callback show screen callback
     * @memberof Screens.Gameplay.GameScreen#
     * @param {Object} data -Data
     */
    onShow: function (data) {
        this.onUpdateTableBgImage();

        console.trace('onshow', data);

        // console.log("onshow called game screen");

        const _regSuccess = cc.find("Canvas/Tournament/TournamentRegistrationSucces");
        if (_regSuccess && _regSuccess.active) _regSuccess.active = false;

        GameManager.playMusic(false);
        if (this.isMobile) {
            this.viewType = LayoutType.UnTiled;
        }
        if (GameManager.isConnected) {
            GameManager.popUpManager.hideAllPopUps();
        }
        if (!isNaN(data)) {
            this.prevSelection = data;
            ServerCom.forceKeepLoading = false;

            if (GameManager.gameModel.activePokerModels[this.prevSelection]) {
                GameManager.gameModel.activePokerModels[this.prevSelection].presenter.enableAgoraWhenSit();
                GameManager.gameModel.activePokerModels[this.prevSelection].presenter.gameOptionButton.active = true;
                if (!GameManager.gameModel.activePokerModels[this.prevSelection].presenter.isTournament2) {
                    GameManager.gameModel.activePokerModels[this.prevSelection].presenter.gameResultButton.active = true;
                    GameManager.gameModel.activePokerModels[this.prevSelection].presenter.gameLeaveButton.active = true;
                } else {
                    var _pp = GameManager.gameModel.activePokerModels[this.prevSelection].presenter;
                    var _tr = _pp.model.gameData.tourData && _pp.model.gameData.tourData.raw;
                    if (_tr && (_tr.isInBreak || _tr.currentTournamentBreak || _tr.currentBreakDetails)) {
                        GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, _tr, null, _pp.tablePopupHolder);
                    }
                }
            }
            return;
        }

        if (data.isRejoin) {

            if (data.__isReshuffle) {
                console.log('[Reshuffle]', 'GameScreen/onShow', '__isReshuffle', data.indexFound);
            }
            // this.prevSelection = data;
            GameManager.gameModel.activePokerModels[data.indexFound].presenter.resetGameForReshuffle(true, data.__isReshuffle);
            if (GameManager.gameModel.activePokerModels[data.indexFound].resetGameForReshuffle) {
                GameManager.gameModel.activePokerModels[data.indexFound].resetGameForReshuffle(data.__isReshuffle);
            }
            GameManager.gameModel.activePokerModels[data.indexFound].initiliazePoker(data);
            GameManager.gameModel.activePokerModels[data.indexFound].presenter.restoreTournament(data.__isReshuffle);
            // this.refreshGrid();
            ServerCom.forceKeepLoading = false;
            return;
        }

        var instance = null;
        var model = null;
        var presenter = null;
        instance = cc.instantiate(this.texasHoldemPrefab);
        model = instance.getComponent('PokerModel');
        presenter = instance.children[0].getComponent('PokerPresenter');
        if (data.roomConfig.channelVariation === "Omaha" || data.roomConfig.channelVariation === "Omaha Hi-Lo") {
            model.dummyCardsCount = 4;
        } else if (data.roomConfig.channelVariation === "Omaha 5" || data.roomConfig.channelVariation === "Big O") {
            model.dummyCardsCount = 5;
        } else if (data.roomConfig.channelVariation === "Omaha 6") {
            model.dummyCardsCount = 6;
        } else if (data.roomConfig.channelVariation === "Mega Hold’em") {
            model.dummyCardsCount = 3;
        } else {
            model.dummyCardsCount = 2;
        }
        presenter.isTournament2 = false;
        if (data.roomConfig.channelType == K.ChannelType.Tournament) {
            this.tournamentModelHandler = new TournamentModelHandler();
            this.tournamentModelHandler.setModel(model);
            this.tournamentModelHandler.setPresenter(presenter);

            presenter.isTournament2 = true;
        }


        // if (GameManager.isMobile) {
        this.gridParent.getComponent(cc.PageView).addPage(instance);
        // }
        // else {
        //     this.gridParent.addChild(instance);
        // }

        this.gameModel.addGame(model);
        model.initiliazePoker(data);
        // MTT rebuy popup on fresh restore — rejoin path calls restoreTournament() which handles this;
        // here we handle it for the first-load (isRejoin=false) path without touching any other UI state.
        if (data.roomConfig && data.roomConfig.channelType == K.ChannelType.Tournament) {
            var _rawRebuy = data.rebuy;
            console.log('[GameScreen][RebuyRestore] channelType=TOURNAMENT | active:', _rawRebuy && _rawRebuy.active, '| showPopup:', _rawRebuy && _rawRebuy.showPopup, '| tableOffers.length:', _rawRebuy && _rawRebuy.tableOffers && _rawRebuy.tableOffers.length, '| mttRebuyPopup:', !!presenter.mttRebuyPopup, '| playerId:', data.playerId);
            if (_rawRebuy && _rawRebuy.active && _rawRebuy.showPopup && _rawRebuy.tableOffers) {
                var _myOffer = _rawRebuy.tableOffers.find(function (o) {
                    return String(o.playerId) === String(data.playerId);
                });
                console.log('[GameScreen][RebuyRestore] myOffer:', JSON.stringify(_myOffer));
                if (_myOffer && presenter.mttRebuyPopup) {
                    // merge parent rebuy fields so RebuyPopup has cost/chips/chance data;
                    // tournamentId and entries/avgStack/level stats live on tourData.raw, not inside rebuy/tableOffers
                    var _tourRaw = data.tourData && data.tourData.raw;
                    var _offerData = Object.assign({}, _rawRebuy, _myOffer, {
                        tournamentId: data.tournamentId,
                        activePlayers: _tourRaw && _tourRaw.activePlayerCount,
                        totalEntries: _tourRaw && _tourRaw.uniqueEntries,
                        avgStack: _tourRaw && _tourRaw.alltableStack && _tourRaw.alltableStack.avgStack,
                        currentBlindLevel: _tourRaw && _tourRaw.currentBlindLevel,
                        lateRegLevel: _tourRaw && _tourRaw.lateRegistration && _tourRaw.lateRegistration.lateRegistrationTillBlind
                    });
                    presenter.mttRebuyPopup.getComponent('RebuyPopup').show(_offerData);
                    console.log('[GameScreen][RebuyRestore] popup shown');
                } else {
                    console.warn('[GameScreen][RebuyRestore] NOT shown | myOffer:', !!_myOffer, '| mttRebuyPopup:', !!presenter.mttRebuyPopup);
                }
            }
            // seat-level "Rebuying" indicator on reload — tableOffers can list every player
            // currently pending rebuy at this table, not just the requesting player, so any
            // seat still in that window (self or observed) needs the indicator restored too;
            // this is independent of showPopup, which only gates whether MY OWN popup opens
            if (_rawRebuy && _rawRebuy.tableOffers && _rawRebuy.tableOffers.length) {
                _rawRebuy.tableOffers.forEach(function (offer) {
                    var _idx = model.getPlayerById(offer.playerId);
                    console.log('[GameScreen][RebuyRestore] seat-indicator | playerId:', offer.playerId, '| idx:', _idx);
                    if (_idx !== -1) {
                        var _seat = presenter.getPlayerByIdx(_idx);
                        if (_seat && _seat.showRebuyIndicator) _seat.showRebuyIndicator();
                    }
                });
            }
        }
        GameManager.activeTableCount = this.gridParent.getComponent(cc.PageView).getPages().length;
        this.prevSelection = GameManager.activeTableCount - 1;
        instance.width = ScreenManager.node.width;
        this.refreshGrid();
        model.on(K.PokerEvents.onTurnInOtherRoom, this.onTurn.bind(this));
        GameManager.emit("updateTableImage");
        ServerCom.forceKeepLoading = false;

        cc.systemEvent.emit("LaunchOver");
    },

    /**
     * @description Life cycle call back dummy as of now
     * @method start
     * @memberof Screens.Gameplay.GameScreen#
     */
    start: function () { },

    /**
     * @description Stops playing sound effects 
     * @method onHide
     * @callback Hide screen callback
     * @memberof Screens.Gameplay.GameScreen#
     */
    onHide: function () {
        if (!!GameManager.user)
            GameManager.playMusic(!GameManager.user.muteGameSound);

    },

    /**
     * @description Updates pokermodel on  player's turn and show notification if game in tiled mode and It's User's Turn!
     * @method onTurn
     * @callback Player turn callback
     * @memberof Screens.Gameplay.GameScreen#
     * @param {Object} pokerModel -current poker model
     * @param {boolean} selfTurn -Specify it is my player's turn!
     */
    onTurn: function (pokerModel, selfTurn) {
        if (this.viewType == LayoutType.UnTiled) {
            var pokerModelIndex = -1;
            for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
                if (pokerModel === this.gameModel.activePokerModels[index]) {
                    pokerModelIndex = index;
                    break;
                }
            }
            //Will not be activated if only one table is joined.
            if (this.tableTabs[pokerModelIndex] != undefined) {

                if (selfTurn && this.gameModel.activePokerModels.length > 1) {
                    this.tableTabs[pokerModelIndex].getComponent(tableTab).showAlert(selfTurn);

                    if (GameManager.isMobile) {
                        // GameScreen.gridParent.getComponent(cc.PageView).scrollToPage(pokerModelIndex, 0);
                        if (pokerModelIndex != this.prevSelection) { }
                    }
                } else if (!selfTurn && this.gameModel.activePokerModels.length >= 1) {
                    this.tableTabs[pokerModelIndex].getComponent(tableTab).showAlert(selfTurn);
                }

                let totalTables = this.gameModel?.activePokerModels?.length || 0;

                if (totalTables >= 1) {
                    this.addOrUpdateTableTurn(pokerModelIndex, selfTurn);
                }
                if (totalTables > 1) {
                    this.handleSmartFocus();
                }
            }
        }

    },

    handleSmartFocus() {
        console.log("SmartFocus __active __", K.SmartFocus);
        if (K.SmartFocus) {
            let currentIndex = this.pageView.getCurrentPageIndex();
            let currentPageNode = this.pageView.content.children[currentIndex];

            if (!currentPageNode) return;

            let roomConfig = currentPageNode.getComponent("PokerModel").roomConfig;
            let currentTableId = roomConfig._id;

            let currentItem = this.tableTurnArray.find(item => item.key === currentTableId);
            let isCurrentTableTurn = currentItem ? currentItem.value : false;

            if (isCurrentTableTurn) {
                // console.log("Turn on Current table");
                return;
            }

            for (let i = 0; i < this.gameModel.activePokerModels.length; i++) {
                let roomConfig = this.gameModel.activePokerModels[i].roomConfig;

                if (roomConfig._id !== currentTableId) {
                    let tableItem = this.tableTurnArray.find(item => item.key === roomConfig._id);
                    let hasTurn = tableItem ? tableItem.value : false;

                    if (hasTurn) {
                        let ind = currentIndex == 0 ? 1 : 0;
                        this.pageView.scrollToPage(ind, 0.3);
                        break;
                    }
                }
            }
        }
    },

    addOrUpdateTableTurn(index, value) {
        // Get current active table ids
        let activeTableIds = this.gameModel.activePokerModels.map(
            model => model.roomConfig._id
        );

        // Remove old inactive tables
        this.tableTurnArray = this.tableTurnArray.filter(item =>
            activeTableIds.includes(item.key)
        );
        for (var i = 0; i < this.gameModel.activePokerModels.length; i++) {
            let tab = this.tableTabs[index].getComponent(tableTab);
            let roomConfig = this.gameModel.activePokerModels[i].roomConfig;
            if (roomConfig._id == tab.model.gameData.roomConfig._id) {
                let gameModelKey = roomConfig._id;
                let ind = this.tableTurnArray.findIndex(item => item.key === gameModelKey);
                if (ind !== -1) {
                    this.tableTurnArray[ind].value = value;
                } else {
                    this.tableTurnArray.push({ key: gameModelKey, value });
                }
            }
        }
    },

    /**
     * @description Realign gameplay view when player leaves a table
     * @method onRemove
     * @param {Object} pokerModel - Reference of poker model!
     * @memberof Screens.Gameplay.GameScreen#
     */
    onRemove: function (pokerModel) {
        // TODO: listen event
        // TODO: destroy object
        this.refreshGrid();
    },

    /**
     * @description Set scale for any children
     * @method setScale
     * @memberof Screens.Gameplay.GameScreen#
     * @param {Number} scale -scale value!
     * @param {String} name - child node name!
     * @param {number} scaleY -default value -1
     */
    setScale: function (scale, name, scaleY = -1) {
        var children = null;
        // if (GameManager.isMobile) {
        children = this.gridParent.getComponent(cc.PageView).getPages().length;
        // }
        // else {
        //     children = this.gridParent.children.length;
        // }
        children.forEach(function (element) {
            // element = element.children[0];
            var target = element.getChildByName(name);
            if (!!target) {
                target.scale = scale;
                if (!!target) {
                    target.scale = scale;
                    if (scaleY != -1) {
                        target.scaleY = scaleY;
                    }
                }
            } else { }
        }, this);
    },

    /**
     * @description Hack for using widget inside layout(turn on only when required)
     * @method switchWidgets
     * @memberof Screens.Gameplay.GameScreen#
     * @param {boolean} toState - boolean value to switch widgets for tiled and untiled view!
     */
    switchWidgets: function (toState) {
        var children = null;
        // if (GameManager.isMobile) {
        children = this.gridParent.getComponent(cc.PageView).getPages().length;
        // }
        // else {
        //     children = this.gridParent.children.length;
        // }
        // if (!GameManager.isMobile) {
        //     children.forEach(function (element) {
        //         element.getComponent(cc.Widget).enabled = toState;
        //     }, this);
        // }

        this.unTiledView.active = toState;
        this.tiledView.active = !toState;
        for (var i = 0; i < this.gameModel.activePokerModels.length; i++) {
            var component = "PokerPresenter";
            this.gameModel.activePokerModels[i].node.children[0].getComponent(component).setTiledView(!toState);
        }
        if (!this.isMobile) {
            // this.repositionPlayerInput(!toState);
            this.repositionHandStrength(!toState);
        }

    },

    /**
     * @description Redraws grid size based on game count 
     * @method refreshGrid 
     * @memberof Screens.Gameplay.GameScreen#
     */
    refreshGrid: function () {
        GameManager.updateActiveTables();
        if (ScreenManager.currentScreen != K.ScreenEnum.GamePlayScreen) {
            return;
        }
        this.gridRefreshing = true;
        this.node.opacity = 0;

        GameManager.activeTableCount = this.gridParent.getComponent(cc.PageView).getPages().length;
        this.viewType = LayoutType.UnTiled;
        // }
        var layout = this.gridParent.getComponent(cc.Layout);
        for (var k = 0; k < GameManager.activeTableCount; k++) {
            if (!!this.gameModel.activePokerModels[k])
                this.gameModel.activePokerModels[k].node.active = false;
        }
        for (var j = 0; j < this.tableTabs.length; j++) {
            this.tableTabs[j].active = false;
        }
        if (this.prevSelection == null || ((this.prevSelection == GameManager.activeTableCount) && GameManager.activeTableCount > 0)) {
            this.prevSelection = GameManager.activeTableCount - 1;
        }
        if (this.viewType == LayoutType.UnTiled || (this.viewType == LayoutType.Tiled && GameManager.activeTableCount == 1)) {
            this.setViewForOneTable();
        }
        GameManager.activeTableCount = this.gridParent.getComponent(cc.PageView).getPages().length;
        this.gridRefreshing = false;

        var screenSize = cc.size(this.gridParent.width, this.gridParent.height);
        for (var k = 0; k < GameManager.activeTableCount; k++) {
            let model = this.gameModel.activePokerModels[k];
            if (!!model && cc.isValid(model.node)) {
                model.node.active = true;
            }
        }
        this.viewType == LayoutType.UnTiled
        if (GameManager.activeTableCount == 0) {
            ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);
        } else {
            for (var k = 0; k < GameManager.activeTableCount; k++) {
                let model = this.gameModel.activePokerModels[k];
                if (!!model && cc.isValid(model.node)) {
                    model.node.active = true;
                }
            }
            //Tanuj
            this.viewType == LayoutType.UnTiled

            if (GameManager.activeTableCount == 0) {
                ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);
            } else {
                this.scaleGroup();
                this.onTabSelection(this.prevSelection);
            }
            this.scaleGroup();
            this.onTabSelection(this.prevSelection);
        }
        // }
        this.node.opacity = 255;
        GameScreen.node.emit("grid-refreshed");
    },

    /**
     * @description set view when the selection is unTiled!
     * @method setViewForOneTable
     * @memberof Screens.Gameplay.GameScreen#
     */
    setViewForOneTable: function () {
        var tabInstance, tableTabComp;
        for (var i = 0; i < GameManager.activeTableCount; i++) {
            tabInstance = this.tableTabs[i];
            tabInstance.active = true;
            tableTabComp = tabInstance.getComponent(tableTab);
            tableTabComp.tabId = i;
            tableTabComp.removeAllListeners();
            tableTabComp.showAlert(false);
            tableTabComp.on(K.PokerEvents.onTableTabSelected, this.selectTableonTabClick.bind(this));
            if (!!this.gameModel.activePokerModels[i]) {
                tableTabComp.setModel(this.gameModel.activePokerModels[i]);
            }
            this.tableTabs[i] = tabInstance;
        }
    },

    scaleGroup: function (factor1, factor2, factor3, factor4, factor5, factor6, factor7, factor8, switchWidg) {
        if (GameManager.isZFold()) {
            this.gridParent.parent.getChildByName("TableTabs").scale = 0.65;
            this.gridParent.parent.getChildByName("TableTabs2").scale = 0.65;
            var children = this.gridParent.getComponent(cc.PageView).getPages();
            children.forEach(function (element) {
                element.getChildByName("PokerPresenter").scale = 0.70;
                element.getChildByName("PokerPresenter").getChildByName("TableBg").scale = 1.05;
                element.getChildByName("PlayerInput").scale = 0.5;
                element.getChildByName("RaisePanel").scale = 0.5;
                element.getChildByName("OptionalPlayerInput").scale = 0.5;
                element.getChildByName("HandHistoryButton").scale = 0.7;
                element.getChildByName("PostBigBlindOption").scale = 0.7;
                element.getChildByName("ChatButton").scale = 0.7;
                element.getChildByName("Popups").scale = 0.6;
                element.getChildByName("UntiledView").scale = 0.7;
                element.getChildByName("Tournament").scale = 0.7;
            }, this);

        } else if (GameManager.isShorter()) {
            if (cc.sys.os == cc.sys.OS_IOS || true) {
                this.gridParent.parent.getChildByName("TableTabs").scale = 0.8;
                this.gridParent.parent.getChildByName("TableTabs2").scale = 0.8;
                var children = this.gridParent.getComponent(cc.PageView).getPages();
                children.forEach(function (element) {
                    console.log("scaleGroup", element);

                    element.getChildByName("PokerPresenter").scale = 0.878;
                    element.getChildByName("PokerPresenter").getChildByName("TableBg").scale = 1.1;
                    element.getChildByName("PokerPresenter").getChildByName("TableBg").y = -20;
                    element.getChildByName("PokerPresenter").getChildByName("HandHolder").y = 0;

                    element.getChildByName("PlayerInput").scale = 0.7;
                    element.getChildByName("RaisePanel").scale = 0.7;
                    element.getChildByName("OptionalPlayerInput").scale = 0.7;
                    element.getChildByName("HandHistoryButton").scale = 1;
                    element.getChildByName("PostBigBlindOption").scale = 1;
                    element.getChildByName("ChatButton").scale = 1;
                    element.getChildByName("GameplayOptions").scale = 0.9;
                    element.getChildByName("Popups").scale = 0.9;
                    element.getChildByName("UntiledView").scale = 0.8;

                    element.getChildByName("PokerPresenter").getChildByName("HoleCards").scale = 0.9;
                    element.getChildByName("PokerPresenter").getChildByName("HoleCardWhenRunItTwice").scale = 0.9;
                    element.getChildByName("PokerPresenter").getChildByName("RunItTwiceCards").scale = 0.9;
                }, this);
            }
        }
    },

    /**
     * @description Move up or down player input and gameplay options node according to tile view selected or untiled view.
     * @method repositionPlayerInput
     * @memberof Screens.Gameplay.GameScreen#
     * @param {boolean} val -Used to set the position of player input
     */
    repositionPlayerInput: function (val) {
        var children = null;
        children = this.gridParent.getComponent(cc.PageView).getPages().length;
        children.forEach(function (element) {
            var target2 = element.getChildByName('GameplayOptions');
            if (!!target2) {
                target2.getComponent(cc.Widget).left = val ? 0.4956 : 0.004;
                target2.getComponent(cc.Widget).bottom = val ? 0.0123 : 0.204;
                target2.getComponent(cc.Widget).right = val ? 0.3622 : 0.8539;
            }
            let target3 = element.getChildByName('PokerPresenter').getChildByName("HandStrength");
            if (!!target3) {
                target3.getComponent(cc.Widget).right = val ? 0.0309 : 0.4111;
                target3.getComponent(cc.Widget).bottom = val ? 0.2830 : 0.0725;
            }
        }, this);
    },
    repositionHandStrength: function (val) {
        var children = null;
        children = this.gridParent.getComponent(cc.PageView).getPages().length;
        children.forEach(function (element) {

            let target3 = element.getChildByName('PokerPresenter').getChildByName("HandStrength");
            if (!!target3) {
                target3.getComponent(cc.Widget).right = val ? 0.0309 : 0.4111;
                target3.getComponent(cc.Widget).bottom = val ? 0.2830 : 0.0725;
            }
        }, this);
    },

    /**
     * @description View Handling after player joins a table
     * @method onTabSelection
     * @memberof Screens.Gameplay.GameScreen#
     * @param {number} index -show Selected tab's Game/Model! 
     */
    onTabSelection: function (index) {
        console.log("!!!!!!onTabSelection", index, this.gameModel.activePokerModels);
        for (var i = 0; i < this.gameModel.activePokerModels.length; i++) {
            if (i == index) {
                console.log("ROMM CONFIG ", this.gameModel.activePokerModels[i])

                GameManager.emit("onTabSelection", (this.gameModel.activePokerModels[i].roomConfig.channelType != K.ChannelType.Tournament));
                // this.tableTabs[i].getComponent(tableTab).setActiveView(this.gameModel.activePokerModels[i].roomConfig.channelName, this.gameModel.activePokerModels[i].roomConfig.bigBlind, this.gameModel.activePokerModels[i].roomConfig.smallBlind);
                this.gameModel.activePokerModels[i].node.active = true;
                this.gameModel.activePokerModels[i].node.y = 0;
                this.prevSelection = i;
                if (this.gameModel.activePokerModels[i].roomConfig.channelType == "NORMAL") {


                    GameManager.hightlightRoom = this.gameModel.activePokerModels[i].gameData.tableDetails.roomId;
                    GameManager.hightlightTable = this.gameModel.activePokerModels[i].gameData.channelId;

                    if (this.unTiledView.getChildByName('LeaveButton')) {
                        this.unTiledView.getChildByName('LeaveButton').active = true;
                    }

                    this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
                    if (this.gameModel.activePokerModels[i].isPrivateTable) {
                        this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
                    } else {
                        let popups = this.gameModel.activePokerModels[i].node.getChildByName("Popups").children[0].children;
                        console.log(popups);

                        let popupOn = false;
                        for (var z = 0; z < popups.length; z++) {
                            if (popups[z].active && popups[z].name != "DummyStickerPop") {
                                popupOn = true;
                                break;
                            }
                        }

                        let popups2 = this.gameModel.activePokerModels[i].node.getChildByName("Tournament").children;
                        console.log(popups2);

                        let popupOn2 = false;
                        for (var z = 0; z < popups2.length; z++) {
                            if (popups2[z].active) {
                                popupOn2 = true;
                                break;
                            }
                        }

                        if (!popupOn && !popupOn2) {
                            this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = true;
                        }
                    }
                } else {
                    if (this.unTiledView.getChildByName('LeaveButton')) {
                        this.unTiledView.getChildByName('LeaveButton').active = false;
                    }

                    var presenter2 = this.gameModel.activePokerModels[i].presenter;
                    var popups3 = this.gameModel.activePokerModels[i].node.getChildByName("Popups").children[0].children;
                    var popupOn3 = false;
                    for (var z = 0; z < popups3.length; z++) {
                        if (popups3[z].active && popups3[z].name != "DummyStickerPop") {
                            popupOn3 = true;
                            break;
                        }
                    }
                    var anyOverlayOpen2 = !!(presenter2 && presenter2.tournamentDetailInfo && presenter2.tournamentDetailInfo.active)
                        || !!(presenter2 && presenter2.tournamentResultWinner && presenter2.tournamentResultWinner.active)
                        || !!(presenter2 && presenter2.tournamentResultPlacement && presenter2.tournamentResultPlacement.active)
                        || !!(presenter2 && presenter2.mttRankingPopup && presenter2.mttRankingPopup.active)
                        || popupOn3;
                    this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = this.gameModel.activePokerModels.length < 2 && !anyOverlayOpen2;
                    // this.gameModel.activePokerModels[i].presenter.tiledView.getChildByName('LeaveButton').active = false;
                }

                if (this.gameModel.activePokerModels[i].presenter.playerInput[0].active) {
                    GameManager.emit("disablePageView");
                }

                this.gameModel.activePokerModels[i].presenter.enterPage();

            } else {
                // this.tableTabs[i].getComponent(tableTab).setDeactiveView(this.gameModel.activePokerModels[i].roomConfig.channelName, this.gameModel.activePokerModels[i].roomConfig.bigBlind, this.gameModel.activePokerModels[i].roomConfig.smallBlind);
                this.gameModel.activePokerModels[i].node.active = true;
                this.gameModel.activePokerModels[i].presenter.leavePage();
            }
        }
        GameScreen.gridParent.getComponent(cc.PageView).scrollToPage(index, 0);
        console.log("OnTabSelection : ", this.gameModel.activePokerModels.length);

        if (this.gameModel.activePokerModels.length == 2) {
            this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
        }

        this.onUpdateTableBgImage();
    },

    selectTableonTabClick(index) {
        if (this.gameModel.activePokerModels.length == 1) return;
        for (var i = 0; i < this.gameModel.activePokerModels.length; i++) {
            let tab = this.tableTabs[index].getComponent(tableTab);
            let roomConfig = this.gameModel.activePokerModels[i].roomConfig;
            if (roomConfig._id == tab.model.gameData.roomConfig._id) {
                this.onTabSelection(i)
            }
        }
        this.selectTabSelection();
    },

    selectTabSelection() {
        this.scheduleOnce(() => {
            let currentIndex = this.pageView.getCurrentPageIndex();
            let currentPageNode = this.pageView.content.children[currentIndex];
            let roomConfig = currentPageNode.getComponent("PokerModel").roomConfig;
            for (var i = 0; i < this.tableTabs.length; i++) {
                let tab = this.tableTabs[i].getComponent(tableTab);
                if (tab.model && tab.model.gameData && roomConfig._id == tab.model.gameData.roomConfig._id) {
                    tab.setActiveView(roomConfig.channelName, roomConfig.bigBlind, roomConfig.smallBlind);
                } else {
                    tab.setDeactiveView(roomConfig.channelName, roomConfig.bigBlind, roomConfig.smallBlind);
                }
            }
        }, 0.15);
    },

    delayedSwitchRoom: function () {

    },

    /**
     * @description Player is seated on a given table
     * @method selectTable
     * @param {String} channelId -Uniquely identifies a game
     * @memberof Screens.Gameplay.GameScreen#
     */
    selectTable: function (channelId) {
        var i = -1;
        for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
            if (channelId === this.gameModel.activePokerModels[index].gameData.channelId) {
                i = index;
                break;
            }
        }
        if (i != -1) {
            this.onTabSelection(i);
        }
    },

    isActiveTable: function (channelId) {
        if (this.gameModel.activePokerModels.length < 2) {
            console.log("isActiveTable true1");
            return true;
        }
        for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
            if (this.prevSelection == index) {
                if (this.gameModel.activePokerModels[this.prevSelection].gameData.channelId == channelId) {
                    console.log("isActiveTable true2");
                    return true;
                }
            }
        }
        console.log("isActiveTable false");
        return false;
    },

    isGameplayActive: function () {
        console.log("isGameplayActive", ScreenManager.currentScreen);
        if (ScreenManager.currentScreen == K.ScreenEnum.GamePlayScreen) {
            console.log("isGameplayActive true");
            return true;
        } else {
            console.log("isGameplayActive false");
            return false;
        }
    },

    /**
     * @description Show the lobby button callback
     * @method onShowLobby
     * @memberof Screens.Gameplay.GameScreen#
     */
    onShowLobby: function () {
        console.trace('onShowLobby', this.gameModel, "GM", this.prevSelection)
        // this.playAudio(K.Sounds.click);
        if (this.gameModel.activePokerModels[0] && 
            this.gameModel.activePokerModels[0].node.children[0] &&
            this.gameModel.activePokerModels[0].node.children[0].getComponent('PokerPresenter') && 
            this.gameModel.activePokerModels[0].node.children[0].getComponent('PokerPresenter').isObserver()) {
            this.leaveCurrent(0);
        }
        if (this.gameModel.activePokerModels[1] &&
            this.gameModel.activePokerModels[1].node.children[0] &&
            this.gameModel.activePokerModels[1].node.children[0].getComponent('PokerPresenter') &&
            this.gameModel.activePokerModels[1].node.children[0].getComponent('PokerPresenter').isObserver()) {
            this.leaveCurrent(1);
        }

        this.scheduleOnce(() => {
            ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);
        }, 0.1);
        if (this.gameModel.activePokerModels[this.prevSelection]) {
            this.gameModel.activePokerModels[this.prevSelection].node.children[0].getComponent('PokerPresenter').tryLeaveAgora();
        }
        // this.gameModel.activePokerModels[this.prevSelection].node.children[0].getComponent('PokerPresenter').playAudio(K.Sounds.click)
    },

    /**
     * @description Handling view when player leaves current Game
     * @method leaveCurrent
     * @memberof Screens.Gameplay.GameScreen#
     */
    leaveCurrent: function (selection) {
        if (selection == undefined || selection == null) {
            selection = this.prevSelection;
        }

        var model = this.gameModel.activePokerModels[selection];
        if (model && model.roomConfig.channelType == K.ChannelType.Tournament && window.TournamentSocket) {
            window.TournamentSocket.emit("common", {
                eventName: "room.channelHandler.observerLeave",
                data: {
                    playerId: model.gameData.playerId,
                    channelId: model.gameData.channelId,
                    isStandup: false,
                    playerName: model.gameData.playerName || "",
                    isRequested: true,
                }
            });
        }

        this.gameModel.activePokerModels[this.prevSelection].node.children[0].getComponent('PokerPresenter').playAudio(K.Sounds.click)
        if (!this.gridRefreshing && this.gameModel.activePokerModels.length > 0 && !!this.gameModel.activePokerModels[this.prevSelection]) {
            this.tableTabs[this.prevSelection].getComponent(tableTab).showAlert(false);
            this.onTabSelection(0);
        }
    },

    /**
     * @description Player stands up in previously joined games
     * @method standUp
     * @memberof Screens.Gameplay.GameScreen#
     */
    standUp: function () {
        this.gameModel.activePokerModels[this.prevSelection].node.children[0].getComponent('PokerPresenter').standUp();
    },

    /**
     * @description Shows video player popUp to replay moves
     * @method onReplay
     * @memberof Screens.Gameplay.GameScreen#
     * @param {Object} data -
     */
    onReplay: function (data) {

        GameManager.popUpManager.show(PopUpType.VideoPlayerPopup, data, function () { });
        //GameManager.popUpManager.show(PopUpType.VideoPlayerPopup, data, function () {});
    },

    /**
     * @description Determines if player has already joined the game
     * @method isAlreadyJoined
     * @memberof Screens.Gameplay.GameScreen#
     * @param {String} channelId -ChannelId of the game
     * @returns {bool} true if player has already join the given table otherwise false
     */
    isAlreadyJoined: function (channelId) {
        if (this.viewType == LayoutType.Tiled) {
            var isPresent = false;
            for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
                if (channelId === this.gameModel.activePokerModels[index].gameData.channelId) {
                    isPresent = true;
                    break;
                }
            }
            return isPresent;
        } else {
            if (this.gameModel.activePokerModels.length > 0) {
                return (channelId == this.gameModel.activePokerModels[this.prevSelection].gameData.channelId);
            } else {
                return false;
            }
        }
    },

    /**
     * @description Resumes game from the point where the popup showed up
     * @method resumeAll
     * @memberof Screens.Gameplay.GameScreen#
     */
    resumeAll: function () {
        for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
            var presenter = this.gameModel.activePokerModels[index].node.children[0].getComponent('PokerPresenter');
            if (presenter.resumeBtn.active) {
                presenter.onResume();
            }
        }
    },

    onUpdateTableBgImage: function () {
        for (var z = 0; z < this.gameModel.activePokerModels.length; z++) {
            if (z == this.prevSelection) {
                var presenter = this.gameModel.activePokerModels[z].node.children[0].getComponent('PokerPresenter');
                for (var i = 0; i < GameManager.tableBgImages.length; i++) {
                    let stickerImages = GameManager.tableBgImages[i];
                    if (GameManager.user.defaultGameBackground != "" && GameManager.user.defaultGameBackground._id) {
                        if (stickerImages.___data._id == GameManager.user.defaultGameBackground._id) {
                            this.node.getChildByName('Bg').getComponent(cc.Sprite).spriteFrame = GameManager.tableBgImages[i];
                        };
                    }
                }
            }
        }
    },


    showJoinSimlar: function () {
        let index = this.prevSelection;
        for (var i = 0; i < this.gameModel.activePokerModels.length; i++) {
            if (i == index || this.prevSelection == -1) {
                this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
                if (this.gameModel.activePokerModels[i].roomConfig.channelType == "NORMAL") {
                    if (this.gameModel.activePokerModels[i].isPrivateTable) {
                        this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
                    } else {
                        let popups = this.gameModel.activePokerModels[i].node.getChildByName("Popups").children[0].children;
                        console.log(popups);

                        let popupOn = false;
                        for (var z = 0; z < popups.length; z++) {
                            if (popups[z].active && popups[z].name != "DummyStickerPop") {
                                popupOn = true;
                                break;
                            }
                        }

                        let popups2 = this.gameModel.activePokerModels[i].node.getChildByName("Tournament").children;
                        console.log(popups2);

                        let popupOn2 = false;
                        for (var z = 0; z < popups2.length; z++) {
                            if (popups2[z].active) {
                                popupOn2 = true;
                                break;
                            }
                        }

                        if (!popupOn &&
                            !popupOn2) {
                            this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = true;
                        }
                    }
                } else {
                    var presenter = this.gameModel.activePokerModels[i].presenter;
                    var popups4 = this.gameModel.activePokerModels[i].node.getChildByName("Popups").children[0].children;
                    var popupOn4 = false;
                    for (var z = 0; z < popups4.length; z++) {
                        if (popups4[z].active && 
                            popups4[z].name != "DummyStickerPop" &&
                            popups4[z].name != "TournamentBreakTime" &&
                            popups4[z].name != "TournamentBreakComingSoon" &&
                            popups4[z].name != "ReBuyPoup" &&
                            popups4[z].name != "RebuyAddOnToast" &&
                            popups4[z].name != "RebuyAddOnCountdown" &&
                            popups4[z].name != "ITMPopup" &&
                            popups4[z].name != "AddOnPopup") {
                            popupOn4 = true;
                            break;
                        }
                    }
                    var anyOverlayOpen = !!(presenter && presenter.tournamentDetailInfo && presenter.tournamentDetailInfo.active)
                        || !!(presenter && presenter.tournamentResultWinner && presenter.tournamentResultWinner.active)
                        || !!(presenter && presenter.tournamentResultPlacement && presenter.tournamentResultPlacement.active)
                        || !!(presenter && presenter.mttRankingPopup && presenter.mttRankingPopup.active)
                        || !!(presenter && presenter.mttRebuyPopup && presenter.mttRebuyPopup.active)
                        || popupOn4;
                    this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = this.gameModel.activePokerModels.length < 2 && !anyOverlayOpen;
                }
            }
        }


        if (this.gameModel.activePokerModels.length == 2) {
            this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
        }
        this.unTiledView.getChildByName('DummyTabs').active = true;
    },

    hideJoinSimlar: function () {
        this.unTiledView.getChildByName('TableTabs2').getChildByName('TabsContainer').getChildByName('AddButton').active = false;
        this.unTiledView.getChildByName('DummyTabs').active = false;
    },

    updateTabImage: function (isTournament, act, deact) {
        for (var index = 0; index < this.gameModel.activePokerModels.length; index++) {
            let pokerModel = this.gameModel.activePokerModels[index];
            var presenter = pokerModel.node.children[0].getComponent('PokerPresenter');
            if (isTournament) {
                if (presenter.isTournament2) {
                    this.tableTabs[index].getChildByName("Active").getChildByName("Base").getComponent(cc.Sprite).spriteFrame = act;
                    this.tableTabs[index].getChildByName("Deactive").getChildByName("Base").getComponent(cc.Sprite).spriteFrame = deact;
                }
            } else {
                if (!presenter.isTournament2) {
                    this.tableTabs[index].getChildByName("Active").getChildByName("Base").getComponent(cc.Sprite).spriteFrame = act;
                    this.tableTabs[index].getChildByName("Deactive").getChildByName("Base").getComponent(cc.Sprite).spriteFrame = deact;
                }
            }
        }
    }
});
