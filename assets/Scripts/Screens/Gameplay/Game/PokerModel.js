var login = require('PostTypes').Login;
var leaveData = require('PostTypes').LeaveData;
var addChipsData = require('PostTypes').AddChipsData;
var connectAckData = require('PostTypes').ConnectAckData;
var sitOutData = require('PostTypes').SitOutData;
var ResetSitoutData = require('PostTypes').ResetSitout;
var SetPlayerValData = require('PostTypes').SetPlayerValData;
var GetNote = require('PostTypes').GetNote;
var ReplayData = require('PostTypes').ReplayData;
var emitter = require('EventEmitter');
var changeAvatar = require('ResponseTypes').changeAvatar;
var card = require('CardTypes').Card;
var suit = require('CardTypes').Suit;
var PopUpType = require('PopUpManager').PopUpType;


/**
 * @description Possible ways a player can sitout
 * @enum {Number}
 * @memberof Screens.Gameplay.Game.PokerModel#
 */
var SitOutMode = cc.Enum({
    SitOutNextHand: 1,
    SitOueNextBB: 2,
    None: -1,
});

/**
 * @classdesc Handles active poker game
 * @class PokerModel
 * @extends EventEmitter
 * @memberof Screens.Gameplay.Game
 */
var PokerModel = cc.Class({
    extends: emitter,

    properties: {
        gameModel: null,
        gameData: null,
        tourData: null,
        roomConfig: null,
        handTabs: [],
        timer: null,
        timeOut: null,
        chat: "",
        sitOutValue: null,
        dummyCardsCount: 2,
        forceBlind: [],
        gameChatInfo: [],
        chatLimit: 1,
        chatCount: 0,
        myCards: [],
        K: null,
        moveData: null,
        sitData: null,
        player: null,
        popUpManager: null,
        antiBankingTimer: null,
        number0: 0,
        number1: null,
    },

    /**
     * @description initialization of variables
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @method onLoad
     */
    onLoad: function () {
        this.postBigBlindUserFlake = true;
        this.chatLimit = 20;
        this.K = K;
        this.moveData = require('PostTypes').MoveData;
        this.sitData = require('PostTypes').SitData;
        this.player = {};
        this.valueChange = true;
        let child = this.node.children[0];
        this.presenter = child.getComponent("PokerPresenter") || child.getComponent('OFCPresenter');
    },

    /**
     * @description removes broadcasts from poker model when the game ends
     * @method onDestroy
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onDestroy: function () {
        this.kickPlayerOutOfTheGame(this);
        cc.director.getActionManager().removeAllActions();
        this.gameModel.removeBroadcastCallbacks(this.gameData.channelId);
    },

    onDestroy2: function () {
        this.presenter.onDestroy2();
        this.gameModel.removeBroadcastCallbacks(this.gameData.channelId);
    },

    clear: function () {

    },

    /**
     * @description Use this method to register for gameplay broadcasts like startGame or gameOver
     * @method initializePoker
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {Object} data holds data used to initialize the game 
     */
    initiliazePoker: function (data, isRejoin = false) {

        console.log('[Debug] PokerModel.initiliazePoker', data);
        if (isRejoin) {
            console.log('[Reshuffle]', 'PokerModel/initiliazePoker', data);
        }
        this.gameData = data;
        this.addOn = data.addOn;
        if (data.tourData) {
            this.tourData = data.tourData;
        }
        this.isPrivateTable = data.tableDetails.isPrivate;
        this.roomConfig = data.roomConfig;
        this.gameData.channelType = this.roomConfig.channelType;
        this.roomConfig.tournamentType = data.roomConfig.tournamentType;
        this.roomConfig.originalMinBuyIn = this.roomConfig.minBuyIn;
        this.roomConfig.originalMaxBuyIn = this.roomConfig.maxBuyIn;
        this.roomConfig.extraAntiBankCase = false;
        this.postBigBlindUserFlake = data.isForceBlindEnable;
        this.alreadyKickingOut = false;

        if (isRejoin) {
            this.gameData.tableDetails.players = data.tableDetails.players;
        }

        if (data.roomConfig.channelVariation != this.K.Variation.OpenFaceChinesePoker) {
            if (this.gameData.antibanking.isAntiBanking && this.roomConfig.minBuyIn < this.gameData.antibanking.amount) {
                this.antiBankingTimer = setTimeout(function () {

                    if (this.gameData && this.roomConfig) {

                        this.gameData.antibanking.isAntiBanking = false;
                        this.roomConfig.extraAntiBankCase = false;
                        this.roomConfig.minBuyIn = this.roomConfig.originalMinBuyIn;
                        this.roomConfig.maxBuyIn = this.roomConfig.originalMaxBuyIn;
                    }

                }.bind(this), this.gameData.antibanking.timeRemains * 1000);

                this.roomConfig.minBuyIn = this.gameData.antibanking.amount;

                if (this.roomConfig.minBuyIn >= this.roomConfig.maxBuyIn) {
                    this.roomConfig.extraAntiBankCase = true;
                    this.roomConfig.maxBuyIn = this.roomConfig.minBuyIn;
                }
            }
        }
        this.sitOutValue = SitOutMode.None;
        if (GameManager.user) {
            GameManager.user.autoBuyIn = false;
        }

        let isTournament = false;
        if (this.roomConfig.channelType == "NORMAL") {
            isTournament = false;
        } else {
            isTournament = true;
        }
        this.registerBroadcasts(isTournament);
        this.onInitializePoker(data.isRejoin);


        if (!this.gameData.isRunItTwice && !this.gameData.tableDetails.hasDoubleBoard) {
            this.gameData.tableDetails.boardCard[1] = [];
        }
        if (this.gameData.cards && this.gameData.cards.length > 0) {
            this.onPlayerCards({
                cards: this.gameData.cards,
                playerId: this.gameData.playerId
            });
        }
        
        if (data.pendingShowdown) {
            console.log('pendingShowdown', data.pendingShowdown.boardCard);
            this.gameData.tableDetails.boardCard = data.pendingShowdown.boardCard;
            this.gameData.tableDetails.roundName = K.Round.Showdown;

            this.scheduleOnce(() => {
                this.onGameOver(data.pendingShowdown);
            });
        }
        this.generateHoleCards(this.gameData.tableDetails.boardCard, false);

        this.onGameStateChange();
        if (this.getPlayerById(this.gameData.playerId) != -1) {
            this.myCards = this.getMyPlayer().cards;
            if (this.getMyPlayer().isTournamentSitout) {
                this.getMyPlayer().state = K.PlayerState.OnBreak;
                this.sitOutValue = SitOutMode.SitOutNextHand;
            }
            if (this.getMyPlayer().state === K.PlayerState.Reserved) {
                this.emit("ReservedState", {
                    extraAntiBankCase: this.roomConfig.extraAntiBankCase
                });
            }
        }

        this.emit(K.PokerEvents.OnJoin, this.gameData);
        if (this.gameData.tableDetails.state === K.GameState.Running) {
            if (this.gameData.tableDetails.currentMoveIndex !== -1) {
                if (!this.gameData.tableDetails.isTimeBankUsed) {
                    var totalTime = this.gameData.tableDetails.additionalTurnTime;
                    this.startTimerTick(totalTime, totalTime - this.gameData.tableDetails.remainingMoveTime);

                } else {
                    var totalTime = this.gameData.tableDetails.totalTimeBank;
                    this.startTimerTick(totalTime, totalTime - this.gameData.tableDetails.timeBankLeft);
                    this.emit(K.PokerEvents.onTimeBank);
                }
            }
            this.emit(K.PokerEvents.onBestHand);

        }
        GameManager.playerRequestedToLeaveTable[this.gameData.channelId] = false;
    },

    /**
     * @description updates antibanking data when server stands up this player
     * @method onAntiBankingUpdate
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onAntiBankingUpdate: function (data) {
        if (this.antiBankingTimer != null) {
            clearTimeout(this.antiBankingTimer);
            this.antiBankingTimer = null;
        }
        if (data.isAntiBanking) {
            this.roomConfig.minBuyIn = data.amount;
            this.antiBankingTimer = setTimeout(function () {
                this.gameData.antibanking.isAntiBanking = false;
                this.roomConfig.extraAntiBankCase = false;
                this.roomConfig.minBuyIn = this.roomConfig.originalMinBuyIn;
                this.roomConfig.maxBuyIn = this.roomConfig.originalMaxBuyIn;
            }.bind(this), data.timeRemains * 1000);
        } else {
            this.gameData.antibanking.isAntiBanking = false;
            this.roomConfig.extraAntiBankCase = false;
            this.roomConfig.minBuyIn = this.roomConfig.originalMinBuyIn;
            this.roomConfig.maxBuyIn = this.roomConfig.originalMaxBuyIn;
        }

        if (this.roomConfig.minBuyIn >= this.roomConfig.maxBuyIn) {
            this.roomConfig.extraAntiBankCase = true;
            this.roomConfig.maxBuyIn = this.roomConfig.minBuyIn;
        } else {
            this.roomConfig.extraAntiBankCase = false;
        }
    },

    /**
     * @description fetches my player object
     * @method getMyPlayer
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @returns {Object} player -my player object
     */
    getMyPlayer: function () {
        if (this.getPlayerById(this.gameData.playerId) != -1) {
            return this.gameData.tableDetails.players[this.getPlayerById(this.gameData.playerId)];
        } else {
            return null;
        }
    },

    /**
     * @description determines player is in stand up state or not and returns the result
     * @method isPlayerStandUp
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @returns {bool} expression -true if player is in stand up state otherwise false
     */
    isPlayerStandUp: function () {
        return this.getPlayerById(this.gameData.playerId) == -1;
    },

    /**
     * @description determines if player is my player
     * @method isMe
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @returns {bool} - true if player is my player otherwise false
     */
    isMe: function (playerId) {
        return (playerId == this.gameData.playerId);
    },

    /**
     * @description determines if seat is empty
     * @method isSeatEmpty
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @returns {bool} -true if seat is empty otherwise false
     */
    isSeatEmpty: function () {
        return (this.roomConfig.maxPlayers > this.gameData.tableDetails.players.length);
    },

    /**
     * @method onInitializePoker
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onInitializePoker: function () {
        this.isOptionalPlayerInputActive = false;
        this.optionalPlayerInput = this.node.getParent().children[0].getChildByName("OptionalPlayerInput");
        if (!this.optionalPlayerInput) {
            this.optionalPlayerInput = this.node.getParent().children[1].getChildByName("OptionalPlayerInput");
        }
        this.optionalPlayerInput.children.forEach(function (element) {
            element.children.forEach(function (childs) {
                if (childs.active == true)
                    this.isOptionalPlayerInputActive = true;
            }, this)
        }, this)
    },

    /**
     * @description fetches player index of player sitting on a given seat
     * @method getPlayerBySeat
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {number} seatIndex - seat index of the player
     * @returns {number} playerIndex - player index
     */
    getPlayerBySeat: function (seatIndex) {
        var playerIndex = -1;
        for (var index = 0; index < this.gameData.tableDetails.players.length; index++) {
            if (this.gameData.tableDetails.players[index].seatIndex === seatIndex) {
                playerIndex = index;
                break;
            }
        }
        return playerIndex;
    },

    /**
     * @description fetches the player index of a given player id
     * @method getPlayerById
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param  {String} playerId -player Id
     * @returns {number} playerIndex - player index 
     */
    getPlayerById: function (playerId) {
        var playerIndex = -1;
        for (var index = 0; index < this.gameData.tableDetails.players.length; index++) {
            if (this.gameData.tableDetails.players[index].playerId === playerId) {
                playerIndex = index;
                break;
            }
        }
        return playerIndex;
    },

    /**
     * @description Makes the player sit on particular seat
     * @method sitHere
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {number} Index -index of the seat
     * @param {number} buyIn -number of seats player buys
     * @param {Object} callback - Callback to execute after successful sit in
     */
    sitHere: function (index, buyIn, callback) {
        var data = new this.sitData(this.gameData.channelId, this.gameData.playerId, buyIn, index, this.gameData.playerName, GameManager.user.profileImage, GameManager.user.autoBuyIn);
        ServerCom.pomeloRequest(this.K.PomeloAPI.sitHere, data, function (response) {
            if (response.success) {
                // process response
                if (callback !== null && callback !== undefined) {
                    callback();
                }
                this.sitOutValue = SitOutMode.None;
            }
            else {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, response.info, function () { });
            }
        }.bind(this), null, 5000, false);
    },

    leaveNextHand: function (callback) {
        ServerCom.pomeloRequest('room.channelHandler.leaveNextHand', {
            "channelId": this.gameData.channelId,
            "playerId": this.gameData.playerId,
            "isRequested": true
        }, function (response) {
            // console.log('leaveNextHand', response);
            if (response.success) {
                // process response
                if (callback !== null && callback !== undefined) {
                    callback();
                }
            }
        }.bind(this), null, 5000, false);
    },

    rebuy: function (newTableId, playerId, tournamentId, callback, error) {
        ServerCom.socketIORequest(
            "tournamentGameEvent|reBuy",
            {
                "channelId": newTableId,
                "playerId": playerId,
                "tournamentId": tournamentId
            },
            callback,
            error,
            null,
            false
        );
    },

    addon: function (newTableId, playerId, tournamentId, callback, error) {
        ServerCom.socketIORequest(
            "tournamentGameEvent|addOn",
            {
                "channelId": newTableId,
                "playerId": playerId,
                "tournamentId": tournamentId
            },
            callback,
            error,
            null,
            false
        );
    },

    /**
     * @description sits out player on the next hand
     * @method sitOutNextHand
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {Object} callback - Callback to execute after successful sitOUt next hand
     */
    sitOutNextHand: function (callback) {
        var data = new sitOutData(this.gameData.channelId, this.gameData.playerId);
        ServerCom.pomeloRequest(this.K.PomeloAPI.sitOutNextHand, data, function (response) {
            if (response.success) {
                this.sitOutValue = SitOutMode.SitOutNextHand;
            } else {
                this.sitOutValue = SitOutMode.None;
            }
            // process response
            if (callback !== null && callback !== undefined) {
                callback(response);
            } else { }
            // }
        }.bind(this), null, 5000, false);
    },

    /**
     * @description sit out player on the next big blind turn
     * @method sitOutNextBB
     * @memberof Screens.Gameplay.Game.PokerModel#
     *@param {Object} callback - Callback to execute after successful next big blind
     */
    sitOutNextBB: function (callback) {
        var data = new sitOutData(this.gameData.channelId, this.gameData.playerId);
        ServerCom.pomeloRequest(this.K.PomeloAPI.sitOutNextBigBlind, data, function (response) {
            if (response.success) {
                this.sitOutValue = SitOutMode.SitOueNextBB;
            }
            if (callback !== null && callback !== undefined) {
                callback(response);
            }
        }.bind(this), null, 5000, false);
    },

    /**
     * @description Resets Sit out 
     * @method resetSitout
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {Object} callback - Callback to execute after successful response
     */
    resetSitout: function (callback) {
        var data = new ResetSitoutData(this.gameData.channelId, this.gameData.playerId);
        ServerCom.pomeloRequest(this.K.PomeloAPI.resetSitout, data, function (response) {
            if (response.success) {
                this.sitOutValue = SitOutMode.None;
            }
            if (callback !== null && callback !== undefined) {
                callback(response);
            }
        }.bind(this), null, 5000, false);
    },

    /**
     * @description In game buy in request
     * @method addChips
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {number} chips -chips value
     *  @param {Object} callback - Callback to execute after successful
     */
    addChips: function (chips, callback) {
        var data = new addChipsData(this.gameData.channelId, this.gameData.playerId, chips);
        ServerCom.pomeloRequest(this.K.PomeloAPI.addChips, data, function (response) {
            if (response.success) {
                // process response
                if (callback !== null && callback !== undefined) {
                    callback();
                }
            }
        }, null, 5000, false);
    },

    /**
     * @description Resumes player after sitout mode
     * @method resume
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {Object} callback
     */
    resume: function (callback) {
        var data = new sitOutData(this.gameData.channelId, this.gameData.playerId);
        ServerCom.pomeloRequest(this.K.PomeloAPI.resume, data, function (response) {
            if (response.success) {
                this.sitOutValue = SitOutMode.None;
                var playerData = this.gameData.tableDetails.players[this.getPlayerById(this.gameData.playerId)];
                playerData.state = response.state;
                if (playerData.isTournamentSitout) {
                    playerData.isTournamentSitout = false;
                    playerData.state = K.PlayerState.Playing;
                }
                if (callback !== null && callback !== undefined) {
                    callback();
                }
            }
        }.bind(this), null, 5000, false);
    },

    /**
     * @description Submits player input to server
     * @method makeMove
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {number} amount - bet amount
     * @param {String} action -Describes what move user has made
     */
    makeMove: function (amount, action) {
        var data = new this.moveData(this.gameData.channelId, this.gameData.playerId, this.gameData.playerName, amount, action);
        data.access_token = K.Token.access_token;
        ServerCom.pomeloRequest(this.K.PomeloAPI.makeMove, data, function (response) {
        }, null, 5000, false);
    },

    /**
     * @description Leave current table
     * @method leave
     * @param {bool} leave || standUp
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    leave: function (leave) {
        clearInterval(this.timerRef);
        var inst = this;
        var data = new leaveData(this.gameData.playerId, this.gameData.channelId, leave);
        data.playerName = this.gameData.playerName;
        ServerCom.pomeloRequest(this.K.PomeloAPI.leaveTable, data, function (response) {
            if (response.success || inst.gameData.channelType == K.ChannelType.Tournament) {
                inst.emit(K.PokerEvents.onPlayerStandUp);
                inst.sitOutValue = SitOutMode.None;
                if (!leave) {
                    inst.alreadyKickingOut = true;
                    inst.kickPlayerOutOfTheGame(inst);
                }
            } else {
                GameManager.playerRequestedToLeaveTable[inst.gameData.channelId] = false;

            }

            if (!response.success && response.info) {
                inst.leaveNextHand(() => {
                    GameManager.popUpManager.show(PopUpType.NotificationPopup, "You will leave the game after this hand.", function () { });
                    inst.emit('leaveNextHand');
                });
            }
        }, null, 5000, false, inst.gameData.channelType != K.ChannelType.Tournament);
    },

    leaveClosedTable: function () {
        clearInterval(this.timerRef);
        var inst = this;
        inst.emit(K.PokerEvents.onPlayerStandUp);
        inst.sitOutValue = SitOutMode.None;
        inst.alreadyKickingOut = true;
        inst.kickPlayerOutOfTheGame(inst);
    },

    /**
     * @description Callback after player is removed from the game
     * @method kickPlayerOutOfTheGame
     * @param {Object} inst
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    kickPlayerOutOfTheGame: function (inst) {
        clearTimeout(inst.antiBankingTimer);
        this.emit("clearTimers", null);
        if (inst.gameModel) {
            inst.gameModel.onLeave(inst);
        }
    },

    /**
     * @description Post acknowledgement for is Connected broadcast from server
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @method postConnectedAck
     */
    postConnectedAck: function () {
        var data = new connectAckData(this.gameData.channelId, this.gameData.playerId);
        ServerCom.pomeloRequest(this.K.PomeloAPI.connectionAck, data, function (response) {
            if (response.success) { } else { }
        }, null, 5000, false);
    },

    /**
     * @description Updates server when player selects straddle checkbox
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param selection
     * @method setStraddleSelection
     */
    setStraddleSelection: function (selection) {
        var data = new SetPlayerValData(this.gameData.channelId, this.gameData.playerId, "isStraddleOpted", selection);
        ServerCom.pomeloRequest(this.K.PomeloAPI.setPlayerValOnTable, data, function (response) {
            if (response.success) { } else { }
        }, null, 5000, false);
    },

    /**
     * @description 
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param selection
     * @method setPostBigBlind
     */
    setPostBigBlind: function (selection) {
        var data = new SetPlayerValData(this.gameData.channelId, this.gameData.playerId, "isForceBlindEnable", selection);
        this.postBigBlindUserFlake = selection;
        ServerCom.pomeloRequest(this.K.PomeloAPI.setPlayerValOnTable, data, function (response) {
            if (response.success) { } else { }
        }, null, 5000, false);
    },

    /**
     * @description updates server when player selects/deselects run it twice checkbox
     * @memberof Screens.Gameplay.Game.PokerModel#
     * @param {bool} selection -true when player selects run it twice checkbox other false
     * @param {Object} callback -Callback to execute after response received is a success
     * @method setRunItTwice
     */
    setRunItTwice: function (selection, callback) {
        var data = new SetPlayerValData(this.gameData.channelId, this.gameData.playerId, "isRunItTwice", selection);
        ServerCom.pomeloRequest(this.K.PomeloAPI.setPlayerValOnTable, data, function (response) {
            if (!!callback) {
                callback(response);
            }
            if (response.success) { } else { }
        }, null, 5000, false);
    },

    showHandHistoryDetail: function () {
        GameManager.popUpManager.showIn(PopUpType.HandHistoryDetailPopup, this.presenter.node, null, this.presenter.tablePopupHolder);
    },
   
    /**
     * @description 
     * @method fireMuckHandEvent
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    fireMuckHandEvent: function (cb) {
        var input = {};
        input.channelId = this.gameData.channelId;
        input.data = {
            seatIdx: this.getMyPlayer().seatIndex
        };
        input.route = this.K.BroadcastRoute.onFireEvent;
        ServerCom.pomeloRequest(this.K.PomeloAPI.fireChannelEvent, input, function (response) {
            if (response.success) {
                if (cb) {
                    cb();
                }
            }
        }.bind(this), null, 5000, false, true);
    },

    /**
     * @description Registers listeners for all broadcasts
     * @method registerBroadcasts
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    registerBroadcasts: function (isTournament = false) {
        cc.systemEvent.on("revealCards", this.onRevealCards.bind(this));
        cc.systemEvent.on("refundChips", this.onRefundChips.bind(this));
        cc.systemEvent.on("returnUncalledBet", this.onReturnUncalledBet.bind(this));
        cc.systemEvent.on("reserveSeat", this.onReserveSeat.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, "room.channelHandler.addChipsOnTable", this.onAddChipsOnTable.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.sit, this.onSit.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.blindDeduction, this.onBlindDeducted.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.bankrupt, this.onBankrupt.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.gamePlayers, this.onGamePlayers.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.dealerrChat, this.onDealerChat.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.startGame, this.onGameStart.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.turn, this.onMoveMade.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.roundOver, this.onRoundOver.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.gameOver, this.onGameOver.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.leave, this.onLeft.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.chat, this.onChat.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.playerCards, this.onPlayerCards.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.playerState, this.onPlayerStateChange.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.connectionAck, this.onConnectionAck.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.preCheck, this.onPreCheck.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.playerCoins, this.onPlayerCoins.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.avatarChange, this.onAvatarChange.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.handTab, this.onHandTab.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.bestHands, this.onBestHands.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.onTimeBank, this.onTimeBank.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.onFireEvent, this.onFireEvent.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.antiBankingUpdatedData, this.onAntiBankingUpdate.bind(this));
        this.gameModel.registerBroadcastCallbacks(this.gameData.channelId, this.K.BroadcastRoute.sendSticker, this.onSendSticker.bind(this));
    },

    onSeatFee: function (data) {
    },

    /**
     * @description 
     * @method onTimeBank
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onFireEvent: function (response) {
        if (response.seatIdx == undefined || response.seatIdx == null) {
            response.seatIdx = response.seatIndex;
        }
        if (!this.getMyPlayer() || response.seatIdx != this.getMyPlayer().seatIndex)
            this.emit(K.PokerEvents.onChannelEvent, response.seatIdx);
    },

    /**
     * @description Time bank callback. Start timer if player has time bank.
     * @method onTimeBank
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onTimeBank: function (data) {
        var playerIndex = this.getPlayerById(data.playerId);
        if (playerIndex === -1) {
            return;
        }
        var playerData = this.gameData.tableDetails.players[playerIndex];
        if (this.gameData.tableDetails.currentMoveIndex == playerData.seatIndex) {
            this.startTimerTick(data.totalTimeBank);
        }
        this.emit(K.PokerEvents.onTimeBank, data);
    },

    /**
     * @description GameOver broadcast callback
     * @method onGameOver
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onGameOver: function (data) {
        let temp = {};
        for (let i = 0; i < data.cardsToShow.length; i++) {
            temp[data.cardsToShow[i].playerId] = data.cardsToShow[i].cards;
        }
        data.cardsToShow = temp;
        var cardsToShowPlayers = [];
        data.winners.forEach(function (element) {
            if (!this.gameData.tableDetails.players[this.getPlayerById(element.playerId)]) {
                return;
            }
            if (!this.isVideo)
                this.gameData.tableDetails.players[this.getPlayerById(element.playerId)].chips = element.chips;
        }, this);
        var id = null;
        if (data.endingType != K.GameEndType.OnePlayerLeft) {
            for (id in data.cardsToShow) {
                var player = null;
                if (this.gameData.tableDetails.players[this.getPlayerById(id)]) {

                    player = this.gameData.tableDetails.players[this.getPlayerById(id)];
                    cardsToShowPlayers.push(player.seatIndex);
                    player.cards = data.cardsToShow[id];
                }
            }
        }

        if (data.gameOverBestHands) {
            this.onBestHandsGameOver(data.gameOverBestHands);
        }

        this.clearTotalRoundBet();
        this.gameData.tableDetails.roundMaxBet = 0;
        this.gameData.tableDetails.state = K.GameState.GameOver;
        this.onGameStateChange();
        this.clearTimerTick();
        this.emit(K.PokerEvents.onTurnInOtherRoom, this, false);
        this.emit(K.PokerEvents.OnGameOver, data, cardsToShowPlayers);

    },

    /**
     * @description Sit broadcast callback
     * @method onSit
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onSit: function (data) {
        // update data
        if (this.getPlayerById(data.playerId) == -1) {
            if (!data.totalRoundBet) {
                data.totalRoundBet = 0;
            }
            var index = this.gameData.tableDetails.players.push(data);
            this.emit(K.PokerEvents.OnSit, data, index - 1);
        }
    },

    onAddChipsOnTable: function (data) {
        if (this.getPlayerById(data.playerId) == -1) {
        }
        else {
            this.sitOutValue = SitOutMode.None;
        }
    },

    onReserveSeat: function (data) {
        if (data.channelId != this.gameData.channelId) {
            return;
        }
        if (data.autoSeated === true) {
            return;
        }

        if (data.state == "RESERVED") {
            this.presenter.playerHand[this.presenter.getRotatedSeatIndex(data.seatIndex)].enableReservedView();
            if (this.isMe(data.playerId)) {
                this.presenter.onSitHereNew(data.seatIndex, data.secondsRemaining);
                // 
                GameManager.emit('reserveSeat', data.channelId)
            }
        }
        else {
            this.gameData.isJoinWaiting = false;
            this.presenter.playerHand[this.presenter.getRotatedSeatIndex(data.seatIndex)].disableReservedView();
            if (!!this.getMyPlayer()) {
                this.presenter.playerHand[this.presenter.getRotatedSeatIndex(data.seatIndex)].disableView();
            }
        }
    },

    onBombPotTimerStarted: function (data) {
        this.emit("BombPotTimerStarted", data);
    },

    /**
     * @description Updates the total pot value
     * @method updateTotalPot
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    updateTotalPot: function () {
        this.gameData.tableDetails.totalPot = 0;
        for (var index = 0; index < this.gameData.tableDetails.pot.length; index++) {
            this.gameData.tableDetails.totalPot += this.gameData.tableDetails.pot[index];
        }
    },

    /**
     * @description BlindDeducted broadcast callback
     * @method onBlindDeducted
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onBlindDeducted: function (data) {
        let temp = {};
        for (let i = 0; i < data.forceBlind.length; i++) {
            temp[data.forceBlind[i].playerId] = data.forceBlind[i].chips;
        }
        data.forceBlind = temp;
        var id = "";
        for (id in data.forceBlind) {
            let player = this.gameData.tableDetails.players[this.getPlayerById(id)];
            if (player.seatIndex != data.smallBlindIndex && player.seatIndex != data.bigBlindIndex && player.seatIndex != data.straddleIndex) {
                this.gameData.tableDetails.players[this.getPlayerById(id)].totalRoundBet = data.forceBlind[id];
                this.gameData.tableDetails.players[this.getPlayerById(id)].chips = this.gameData.tableDetails.players[this.getPlayerById(id)].chips - data.forceBlind[id];
            }
        }

        this.roomConfig.smallBlind = data.tableSmallBlind;
        this.roomConfig.bigBlind = data.tableBigBlind;
        this.gameData.tableDetails.pot = data.pot;
        this.gameData.tableDetails.totalPot = data.totalPot;
        this.gameData.tableDetails.players.forEach(function (player) {
            if (data.ante) {
                player.ante = data.ante[player.playerId] || 0;
                player.chips -= data.ante[player.playerId] || 0;
            }
            if (data.bomb) {
                player.bomb = data.bomb[player.playerId] || 0;
                player.chips -= data.bomb[player.playerId] || 0;
            }
            if (player.seatIndex === data.smallBlindIndex && (!data.bomb || Object.keys(data.bomb).length === 0)) {
                player.totalRoundBet = data.smallBlind;
                player.chips = data.smallBlindChips;
            }
            else if (player.seatIndex === data.bigBlindIndex && (!data.bomb || Object.keys(data.bomb).length === 0)) {
                player.totalRoundBet = data.bigBlind;
                player.chips = data.bigBlindChips;
            }
            else if (player.seatIndex === data.straddleIndex) {
                if (data.straddleChips === -1) {
                    return;
                }
                player.totalRoundBet = player.chips - data.straddleChips;
                player.chips = data.straddleChips;
            }
        }, this);

        this.emit(K.PokerEvents.OnBlindDeduction, data);
    },

    /**
     * @description Bankrupt broadcast callback
     * @method onBankrupt
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onBankrupt: function (data) {
        if (data.playerId === this.gameData.playerId) {
            this.emit(K.PokerEvents.OnBankrupt, {});
        }
    },

    /**
     * @description Turn broadcast callback
     * @method onMoveMade
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onMoveMade: function (data) {
        if (data.playerId != "" && this.gameData.tableDetails.players[this.getPlayerById(data.playerId)]) {
            this.gameData.tableDetails.players[this.getPlayerById(data.playerId)].totalRoundLastBet = data.lastPlayerBet + this.gameData.tableDetails.players[this.getPlayerById(data.playerId)].totalRoundBet;
        }

        if (data.isRoundOver) {
            this.clearTotalRoundBet();
        }
        this.gameData.tableDetails.currentMoveIndex = data.currentMoveIndex === "" ? -1 : data.currentMoveIndex;
        this.gameData.tableDetails.roundMaxBet = data.roundMaxBet;
        this.gameData.tableDetails.pot = data.pot;
        this.gameData.tableDetails.totalPot = data.totalPot;
        this.gameData.tableDetails.minRaiseAmount = data.minRaiseAmount;
        this.gameData.tableDetails.maxRaiseAmount = data.maxRaiseAmount;
        var index;
        if (data.playerId != "" && this.gameData.tableDetails.players[this.getPlayerById(data.playerId)]) {
            index = this.getPlayerById(data.playerId);
            this.gameData.tableDetails.players[index].chips = data.chips;
            this.gameData.tableDetails.players[index].lastMove = data.action;
            this.gameData.tableDetails.players[index].lastBet = data.amount;
            this.gameData.tableDetails.players[index].moves = data.moves;
            this.gameData.tableDetails.players[index].totalRoundBet = data.totalRoundBet;
        } else {
            index = null;
        }
        this.gameData.tableDetails.roundName = data.roundName;
        if (this.gameData.tableDetails.currentMoveIndex != -1) {
            if (data.isRoundOver) {
                this.clearTimerTick();
                setTimeout(function () {
                    if (cc.isValid(this.node)) {

                        this.startTimerTick(this.gameData.tableDetails.turnTime);
                    }
                }.bind(this), 1400);
            } else {
                this.startTimerTick(this.gameData.tableDetails.turnTime);
            }
        } else {
            this.clearTimerTick();
        }
        this.emit(K.PokerEvents.OnTurn, data, index)
    },

    /**
     * @description Reset player round total bet made
     * @method clearTotalRoundBet
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    clearTotalRoundBet: function () {
        for (var index = 0; index < this.gameData.tableDetails.players.length; index++) {
            this.gameData.tableDetails.players[index].totalRoundBet = 0;
        }
    },

    /**
     * @description Display current game state on view
     * @method onGameStateChange
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onGameStateChange: function () {
        if (this.timeOut !== null) {
            clearTimeout(this.timeOut);
        }
        this.emit(K.PokerEvents.onGameStateChange, this.gameData.tableDetails.state);
    },

    /**
     * @description GamePlayers broadcast callback
     * @method onGamePlayers
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onGamePlayers: function (data) {
        if (this.isVideo) {
            return;
        }
        this.gameData.tableDetails.boardCard = [
            [],
            []
        ];
        for (var index = 0; index < data.players.length; index++) {
            var playerIndex = this.getPlayerById(data.players[index].playerId);
            var playerData = this.gameData.tableDetails.players[playerIndex];
            if (playerData) {
                this.gameData.tableDetails.players[playerIndex].lastMove = "";
                this.gameData.tableDetails.players[playerIndex].roundMove = "";
                this.gameData.tableDetails.players[playerIndex].cards = [];
                this.gameData.tableDetails.players[playerIndex].bestHand = null;
                this.gameData.tableDetails.players[playerIndex].timeBankSec = 0;
                if (this.gameData.tableDetails.players[playerIndex].timeBankSec < 0) {
                    this.gameData.tableDetails.players[playerIndex].timeBankSec = 0;
                }
                var existing = this.gameData.tableDetails.players[playerIndex];
                Object.assign(existing, data.players[index]);
                this.emit(K.PokerEvents.OnPlayerStateChange, playerData);
            }
        }
        this.gameData.tableDetails.state = K.GameState.Idle;
        this.onGameStateChange();
        for (var playerIndex = this.gameData.tableDetails.players.length - 1; playerIndex >= 0; playerIndex--) {
            var isContinuing = false;
            for (var index = 0; index < data.players.length; index++) {
                if (this.gameData.tableDetails.players[playerIndex].playerId === data.players[index].playerId) {
                    isContinuing = true;
                }
            }
            if (!isContinuing) {
                var params = {};
                params.playerId = this.gameData.tableDetails.players[playerIndex].playerId;
                console.log("!isContinuing", params.playerId);
                this.onLeft(params);
            }
        }
        this.clearTotalRoundBet();
        this.emit(K.PokerEvents.OnClearHoleCards);
        this.gameData.tableDetails.roundMaxBet = 0;
        for (var index = 0; index < data.removed.length; index++) {
            if (!!data.removed[index]) {
                var params = {};
                params.playerId = data.removed[index];
                this.onLeft(params);
            }
        }

        if (!!this.getMyPlayer()) {
            var playerData = this.getMyPlayer();
            if (playerData.state === K.PlayerState.Playing) {
                var params = {};
                params.seatIndex = playerData.seatIndex;
                this.emit(K.PokerEvents.onRotateView, params);
            } else if (playerData.state === K.PlayerState.OutOfMoney) {
                if (this.roomConfig.channelType === "NORMAL") {
                    this.roomConfig.minBuyIn = this.roomConfig.originalMinBuyIn;
                    this.roomConfig.maxBuyIn = this.roomConfig.originalMaxBuyIn;
                    this.emit(K.PokerEvents.OnBankrupt, {});
                }
            }
            if (playerData.isTournamentSitout) {
                playerData.state = K.PlayerState.OnBreak;
                this.sitOutValue = SitOutMode.SitOutNextHand;
            }
            if (playerData.state === K.PlayerState.OnBreak) {
                this.sitOutValue = SitOutMode.SitOutNextHand;
            }
        }
        this.emit(K.PokerEvents.OnGamePlayers);
    },

    /**
     * @description Starts new timer
     * @method startTimerTick
     * @param {Number} duration
     * @param {Number} startTime
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    startTimerTick: function (duration, startTime) {
        this.clearTimerTick();
        var currentTime = new Date();
        var offset = 0;
        if (arguments.length > 1) {
            var offset = startTime * 1000;
        }
        var endTime = currentTime.getTime() + (1000 * duration);
        var time;
        this.timer = setInterval(function () {
            currentTime = new Date();
            var elapsed = (endTime - currentTime - offset) / 1000;

            time = (elapsed / (duration));

            if (time <= 0) {
                if (GameManager.user) {
                    this.emit(K.PokerEvents.onTimerTick, time, elapsed);
                }
                this.clearTimerTick();
                return;
            }
            elapsed = Math.floor(elapsed);
            if (GameManager.user) {
                this.emit(K.PokerEvents.onTimerTick, time, elapsed);
            }
        }.bind(this), 10);
    },

    /**
     * @description Clears existing timer
     * @method clearTimerTick
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    clearTimerTick: function () {
        if (this.timer !== null && this.timer !== undefined) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },

    startDisconnectTimerTick: function (duration) {
        this.clearDisconnectTimerTick();
        var endTime = new Date().getTime() + (1000 * duration);
        this.disconnectTimer = setInterval(function () {
            var elapsed = (endTime - new Date().getTime()) / 1000;
            var time = elapsed / duration;
            if (time <= 0) {
                if (GameManager.user) { this.emit(K.PokerEvents.onDisconnectTimerTick, 0); }
                this.clearDisconnectTimerTick();
                return;
            }
            if (GameManager.user) { this.emit(K.PokerEvents.onDisconnectTimerTick, time); }
        }.bind(this), 10);
    },

    clearDisconnectTimerTick: function () {
        if (this.disconnectTimer) {
            clearInterval(this.disconnectTimer);
            this.disconnectTimer = null;
        }
    },

    /**
     * @description player state broadcast callback
     * @method onPlayerStateChange
     * @param {} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onPlayerStateChange: function (data) {
        var playerIndex = this.getPlayerById(data.playerId);
        if (playerIndex === -1) {
            return;
        }
        var playerData = this.gameData.tableDetails.players[playerIndex];
        playerData.state = data.state;
        playerData.remainingDisconnectedTime = data.remainingDisconnectedTime || 0;
        playerData.resetTimer = data.resetTimer;
        if (data.playerId == this.gameData.playerId && playerData.state == K.PlayerState.OnBreak) {
            this.sitOutValue = SitOutMode.SitOutNextHand;
        }
        if (playerData.state == K.PlayerState.Disconnected) {
            if (this.gameData.tableDetails.currentMoveIndex == this.gameData.tableDetails.players[playerIndex].seatIndex) {
                if (!data?.remainingDisconnectedTime || data.remainingDisconnectedTime <= 0) {
                    this.clearTimerTick();
                }
            }
        }
        this.emit(K.PokerEvents.OnPlayerStateChange, playerData);
    },

    /**
     * @description Leave broadcast callback
     * @method onLeft
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onLeft: function (data) {
        if (this.alreadyKickingOut) {
            return;
        }
        var player = null;
        var index = this.getPlayerById(data.playerId);
        if (index !== -1) {
            player = this.gameData.tableDetails.players.splice(index, 1);
        } else {
            if (this.isMe(data.playerId)) {
                this.kickPlayerOutOfTheGame(this);
            }
        }
        if (player && player[0]) {
            player[0].isStandup = data.isStandup;
        }
        this.emit(K.PokerEvents.OnLeave, player);
        //}
    },

    /**
     * @description GameStart broadcast callback
     * @method onGameStart
     * @param {Object} data -Stores data required to start the game 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onGameStart: function (data) {
        this.gameData.tableDetails.dealerIndex = data.dealerIndex;
        this.gameData.tableDetails.smallBlindIndex = data.smallBlindIndex;
        this.gameData.tableDetails.bigBlindIndex = data.bigBlindIndex;
        this.gameData.tableDetails.straddleIndex = data.straddleIndex;
        this.gameData.tableDetails.currentMoveIndex = (data.currentMoveIndex == undefined) ? -1 : data.currentMoveIndex;
        this.gameData.tableDetails.bigBlind = data.bigBlind;
        this.gameData.tableDetails.smallBlind = data.smallBlind;
        this.gameData.tableDetails.roundMaxBet = data.roundMaxBet;
        this.gameData.tableDetails.state = data.state;
        this.gameData.tableDetails.roundName = data.roundName;
        this.gameData.tableDetails.minRaiseAmount = data.minRaiseAmount;
        this.gameData.tableDetails.maxRaiseAmount = data.maxRaiseAmount;
        this.gameData.tableDetails.roundId = data.roundId;
        this.gameData.tableDetails.roundNumber = data.roundNumber;
        this.gameData.tableDetails.canApplyBombPot = data.canApplyBombPot;
        this.onGameStateChange();
        this.emit(K.PokerEvents.OnStartGame, data);
    },

   /**
     * @description Generates player cards and pushes into respective data
     * @method handlePlayerCards
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    handlePlayerCards: function (playerCards) {
        this.gameData.tableDetails.players.forEach(function (element) {
            var card = playerCards[element.playerId];
            var array = card;
            element.cards = array;
        }, this);
    },

    /**
     * @description Returns suit enum based on server data
     * @method getSuit
     * @param {String} suit
     * @returns {root.K.Suit}
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    getSuit: function (suit) {
        if (suit === "spade") {
            return K.Suit.Spade;
        } else if (suit === "heart") {
            return K.Suit.Heart;
        } else if (suit === "club") {
            return K.Suit.Club;
        } else if (suit === "diamond") {
            return K.Suit.Diamond;
        } else { }
    },

    /**
     * @description Popultes the community cards
     * @method generateHoleCards
     * @param {Object} boardCards
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    generateHoleCards: function (boardCards, ifAnimateHoleCards = true) {
        var array = [
            [],
            []
        ];
        console.log("GENERATE HOLE CARDS WITH DATA ", boardCards);

        var i = 0;
        boardCards.forEach(function (element) {
            element.forEach(function (element1) {
                if (!!element1) {
                    var suit = this.getSuit(element1.type);
                    var cardType = new card(element1.rank, suit);
                    array[i].push(cardType);
                } else {
                    array[i].push(null);
                }
            }, this);
            i++;
        }, this);
        this.emit(K.PokerEvents.OnHoleCard, array, ifAnimateHoleCards);
    },

    /**
     * @description Round Over broadcast callback
     * @method onRoundOver
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onRoundOver: function (data) {
        var t = 1;
        // console.log("On Round Over ", data);

        // console.log("DATA BOARD ROOM ", data.boardCard[0].length);

        this.number0 = data.boardCard[0].length;

        // console.log("Number 0 ", this.number0);

        this.number1 = data.boardCard[1].length;

        // console.log("Number 1 ",this.number1);
        // update boardCards in gameData
        // console.log("ro", JSON.parse(JSON.stringify(data)));
        // console.log("model data=", JSON.parse(JSON.stringify(this.gameData.tableDetails.boardCard)));
        this.gameData.tableDetails.roundName = data.roundName;
        this.emit(K.PokerEvents.OnRoundOver, data);

        //Changes to push null in run it twice case after 2g compression changes ,server is not sending in required manner.
        if (data.roundName == K.Round.Showdown && data.boardCard[1].length != 0 && !this.gameData.tableDetails.hasDoubleBoard) {
            this.gameData.tableDetails.boardCard[0].forEach(element => {
                this.gameData.tableDetails.boardCard[1].push(null);
            });
        }
        var i = 0;

        data.boardCard.forEach(function (element) {
            element.forEach(function (card) {

                this.gameData.tableDetails.boardCard[i].push(card);

            }, this)
            i++;
        }, this);

        //////////////////// REMOVING DUPLICATES FROM BOTH THE ARRAYS IF ANY DUPLICATE COMES DUE TO BOARDCAST OVERLAPS

        // console.log("BEFORE SHORTING ", JSON.parse(JSON.stringify(this.gameData.tableDetails.boardCard)));
        let tmpArray = this.gameData.tableDetails.boardCard[0].filter(function (item, index, arr) {
            if (!item) {
                return true;
            } else {
                return index === arr.findIndex(function (secondItem) {
                    return !!secondItem && secondItem.rank == item.rank && secondItem.type == item.type;
                })
            }
        });
        this.gameData.tableDetails.boardCard[0].length = 0;
        tmpArray.forEach(function (element) {
            this.gameData.tableDetails.boardCard[0].push(element);
        }, this)

        let tmpArray2 = this.gameData.tableDetails.boardCard[1].filter(function (item, index, arr) {
            if (!item) {
                return true;
            } else {
                return index === arr.findIndex(function (secondItem) {
                    return !!secondItem && secondItem.rank == item.rank && secondItem.type == item.type;
                })
            }
        });
        this.gameData.tableDetails.boardCard[1].length = 0;
        tmpArray2.forEach(function (element) {
            this.gameData.tableDetails.boardCard[1].push(element);
        }, this)

        // console.log("AFTER SHORTING ", this.gameData.tableDetails.boardCard);
        // console.log("model data after=", JSON.parse(JSON.stringify(this.gameData.tableDetails.boardCard)));
        if ((this.number0 == 5) && (this.number1 == 5)) {

            t = 5500 - 2500;
        } else if ((this.number0 == 5) && (this.number1 == 0)) {

            t = 4500 - 2500;
        }
        // console.log("T ", t);

        if (GameManager.isActive) {
            setTimeout(function () {
                if (cc.isValid(this.node)) {

                    if (!!this.gameData)
                        this.generateHoleCards(this.gameData.tableDetails.boardCard);
                }
            }.bind(this), 1);
        }
        else {
            if (cc.isValid(this.node)) {
                if (!!this.gameData)
                    this.generateHoleCards(this.gameData.tableDetails.boardCard);
            }
        }

        // 
        if (data.allInPlayerIds) {
            for (var i = 0; i < data.allInPlayerIds.length; i++) {
                var playerIndex = this.getPlayerById(data.allInPlayerIds[i]);
                let player = this.presenter.getPlayerByIdx(playerIndex);
                if (player) {
                    player.onRoundOverBombPotForcedAllIn();
                }
            }
        }
    },


    /**
     * @description Manages Game chat
     * @method gameChat
     * @param {String} event -String describes event
     * @param {Object} richTextCode -used to display emoticons
     * @param {String} chatterName -Name of the player 
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    gameChat: function (event, richTextCode1, richTextCode2, chatterName, data) {
        if (event == K.PokerEvents.OnChat)
            this.chat = data.message + "|" + "" + "|" + (Number(data.profileImage) - 1);
        data.orgMsg = data.message;
        data.message = richTextCode1 + chatterName + ": " + richTextCode2 + data.message + "</c>"; //\n";
        this.emit(event, data);
    },



    /**
     * @description DealerChat broadcast callback
     * @method onDealerChat
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onDealerChat: function (data) {
        if (this.gameData.settings.dealerChat) {
            this.emit(K.PokerEvents.OnDealerChat, data);
        }
    },

    /**
     * @description Chat broadcast callback
     * @method onChat
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onChat: function (data) {
        if (this.gameData.settings.playerChat && !this.isPlayerStandUp()) {
            this.emit(K.PokerEvents.OnChat, data);
        }
    },

    /**
     * @description playerCards broadcast callback
     * @method onPlayerCards
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onPlayerCards: function (data) {
        var index = this.getPlayerById(data.playerId);
        var array = data.cards;
        this.gameData.tableDetails.players[index].cards = array;
        var cardType = []
        array.forEach(function (cardData) {
            var suit = this.getSuit(cardData.type);
            cardType.push(new card(cardData.rank, suit));
        }, this);

        if (data.playerId == this.gameData.playerId) {
            this.myCards = array;
        }
        this.emit(K.PokerEvents.OnPlayerCard, cardType, this.gameData.tableDetails.players[index].seatIndex);
    },

    /**
     * @description connectionAck broadcast callback
     * @method onConnectionAck
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onConnectionAck: function (data) {
        this.postConnectedAck();
    },

    /**
     * @description Broadcast callback on precheck
     * @method onPreCheck
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onPreCheck: function (data) {
        // console.error("PRECHECK SERVER ", data);
        this.emit(K.PokerEvents.onPreCheck, data);
    },

    /**
     * @description Updates Player's chips and emits the event
     * @method onPlayerCoins
     * @param {Object} data -channelId, playerId, amount
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onPlayerCoins: function (data) {
        var index = this.getPlayerById(data.playerId);
        this.gameData.tableDetails.players[index].chips = data.amount;
        this.emit(K.PokerEvents.onPlayerCoins, this.gameData.tableDetails.players[index]);
    },

    onReturnUncalledBet: function (data) {
        if (data.channelId != this.gameData.channelId) {
            return;
        }
        this.emit("returnUncalledBet", data);
    },

    onRefundChips: function (data) {
        if (data.channelId != this.gameData.channelId) {
            return;
        }
        this.emit("refundChips", data);
    },

    onRevealCards: function (data) {
        if (data.channelId != this.gameData.channelId) {
            return;
        }
        this.emit("revealAllInCards", data.revealCards);
    },

    /**
     * @description Avatar change callback
     * @method onAvatarChange
     * @param {Object} data
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onAvatarChange: function (data) {
        // console.log("AVATAR CHANGE DATA POKER MODEL ", data)
        var player = this.gameData.tableDetails.players[this.getPlayerById(data.playerId)];
        if (player) {
            changeAvatar(data.avtarImage, player);
        }
    },

    /**
    * @description Avatar change callback
    * @method onSendSticker
    * @param {Object} data
    * @memberof Screens.Gameplay.Game.PokerModel#
    */
    onSendSticker: function (data) {
        GameManager.emit(K.PokerEvents.onSendSticker, data)
    },

    /**
     * @description 
     * @method onHandTab
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onHandTab: function (data) {
        if (!this.handTabs) {
            this.handTabs = [];
        }
        if (this.handTabs.length > 10) {
            this.handTabs.shift();
        }
        data.handTab.myCards = this.myCards;
        this.myCards = [];
        this.handTabs.push(data.handTab);
        this.emit(K.PokerEvents.onHandTab, this);
    },

    /**
     * @description Broadcast callback received after the round is over.
     * @method onBestHands
     * @param {Object} data -data object stores the best hand of the player
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    onBestHands: function (data) {
        if (!GameManager.user.settings.handStrength) {
            return;
        }
        if (!!this.getMyPlayer()) {
            this.getMyPlayer().bestHand = data.bestHand;
            var playerIndex = this.getPlayerById(data.playerId);
            this.presenter.getPlayerByIdx(playerIndex).onBestHand(data.bestHand, data.lowBestHand || "", data.board2BestHand || "");
            this.emit(K.PokerEvents.onBestHand);
        }
    },

    onBestHandsGameOver: function (data) {
        if (!GameManager.user.settings.handStrength) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var playerIndex = this.getPlayerById(data[i].playerId);
            if (playerIndex != -1) {
                let player = this.presenter.getPlayerByIdx(playerIndex);
                if (player) {
                    player.onBestHand(data[i].bestHand, data[i].lowBestHand || "", data[i].board2BestHand || "");
                }
            }
        }
    },

    onRebuyActivated: function (data) {
        this.emit('rebuyActivated', data);
    },

    onRebuyDeactivated: function (data) {
        this.emit('rebuyDeactivated', data);
    },

    onResRebuy: function (data) {
        this.emit('resRebuy', data);
    },

    onResAddon: function (data) {
        this.emit('resAddon', data);
    },

    onInactiveKicked: function (data) {
        this.emit('inactiveKicked', data);
    },

    onTournamentCancelled: function (data) {
        this.emit('TournamentCancelled', data);
    },

    /**
     * @description creates and returns the card based on inputs
     * @method getCardByData
     * @param {Object} cardData -holds card value and suit
     * @memberof Screens.Gameplay.Game.PokerModel#
     */
    getCardByData: function (cardData) {
        var suit = this.getSuit(cardData.type);
        return (new card(cardData.rank, suit));
    },

    onPlayerRankChange: function (response) {
        this.emit(K.PokerEvents.onPlayerRankChange, response);
    },

    setMuckHand: function (selection, callback) {
        let isTournament = false;
        var data = new SetPlayerValData(this.gameData.channelId, this.gameData.playerId, "isMuckHand", selection);
        if (this.roomConfig.channelType == "NORMAL") {
            ServerCom.pomeloRequest(K.PomeloAPI.updateTableSettings, data, function (response) {
                if (response.success) {
                    GameManager.user.isMuckHand = !GameManager.user.isMuckHand;
                }
                if (!!callback) {
                    callback(response);
                }
            }.bind(this), null, 5000, false);
        } else {
            TournamentServerCom.pomeloRequest(K.PomeloAPI.updateTableSettings, data, function (response) {
                if (response.success) {
                    GameManager.user.isMuckHand = !GameManager.user.isMuckHand;
                }
                if (!!callback) {
                    callback(response);
                }
            }.bind(this), null, 5000, false);
        }
    },
});

module.exports = {
    SitOutMode: SitOutMode,
    PokerModel: PokerModel,
};
