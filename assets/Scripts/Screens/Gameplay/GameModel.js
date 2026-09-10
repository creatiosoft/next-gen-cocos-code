/**
 * @namespace Screens.Gameplay
 */
var pokerModelType = require("PokerModel").PokerModel;
var lobbyModelType = require("LobbyHandler");
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var emitter = require('EventEmitter');

/**
 * @classdesc Maintain the record of games being played, and register/De-Register the broadcast of current game being played 
 * @class GameModel
 * @extends EventEmitter
 * @memberof Screens.Gameplay
 */
cc.Class({
    extends: emitter,

    properties: {

        activePokerModels: {
            default: [],
            type: [pokerModelType],
        },

        tilingFlag: {
            default: false,
        },

        popUpManager: {
            default: null,
            type: PopUpManager,
        },

    },

    /**
     * @description It is used for initialisation
     * @method onLoad
     * @memberof Screens.Gameplay.GameModel#
     */
    onLoad: function () {
        GameManager.gameModel = this;
    },

    /**
     * @description Register events from lobbyModel, like join event.
     * @method start
     * @memberof Screens.Gameplay.GameModel#
     */

    start: function () {
        //var cb = this.onGameJoined.bind(this);

        // register broadcasts
        this.listenPomeloBroadcasts();
    },

    /**
     * @description Register for all pomelo broadcasts - centralized listener
     * @method listenPomeloBroadcasts
     * @memberof Screens.Gameplay.GameModel#
     */

    listenPomeloBroadcasts: function () {
        for (var prop in K.BroadcastRoute) {
            ServerCom.pomeloBroadcast(K.BroadcastRoute[prop], this.onMessage.bind(this));
            TournamentServerCom.pomeloBroadcast(K.BroadcastRoute[prop], this.onMessage.bind(this));
        }
    },

    /**
     * @description It is used for adding a new game
     * @method addGame
     * @param {Object} pokerModel
     * @memberof Screens.Gameplay.GameModel#
     */

    addGame: function (pokerModel) {
        this.activePokerModels.push(pokerModel);
        GameScreen.node.opacity = 0;
        pokerModel.gameModel = this;
        if (this.activePokerModels.length == 2 && GameManager.isMobile) {
            this.emit("JOIN FOR TABLE SWIPE");
        }
    },

    /**
     * @description Destroys the pokerModel when player leaves the table
     * @method onLeave
     * @param {Object} pokerModel -Reference of pokermodel script!
     * @memberof Screens.Gameplay.GameModel#
     */
    onLeave: function (pokerModel) {
        for (var index = 0; index < this.activePokerModels.length; index++) {
            if (pokerModel === this.activePokerModels[index]) {
                this.activePokerModels.splice(index, 1);
                break;
            }
        }
        delete GameManager.playerRequestedToLeaveTable[pokerModel.gameData.channelId];
        
        GameManager.emit("LEAVE_CHAT_CHANNEL", pokerModel.gameData.channelId);

        if (this.activePokerModels.length < 2) {
            this.emit("LEAVE FOR TABLE SWIPE");
        }
        // // need delay for actual node destruction by engine
        this.scheduleOnce(function () {
            pokerModel.clear();

            GameScreen.gridParent.getComponent(cc.PageView).removePage(pokerModel.node);
            GameManager.updateActiveTables();
            
            GameManager.emit(K.GameEvents.OnTableClosed);

            cc.sys.garbageCollect();
        });
    },

    /**
     * @description Stores callBacks of individual poker models in JSON using chennelID, route
     * @method registerBroadcastCallbacks
     * @param {String} cheenelID -Unique Id distinguish a channel from other
     * @param {String} route - Broadcast route
     * @param {Object} callBack -Call back registerd with the broadcast
     * @memberof Screens.Gameplay.GameModel#
     */
    registerBroadcastCallbacks: function (channelID, route, callback) {
        this.callBacks = this.callBacks || {};
        this.callBacks[channelID] = this.callBacks[channelID] || {};
        this.callBacks[channelID][route] = callback;
    },

    /**
     * @description Removes callBacks of individual poker models in JSON using chennelID, route
     * @method removeBroadcastCallbacks
     * @param {String} cheenelID -Unique Id distinguish a channel from other
     * @param {String} route -Broadcast route
     * @memberof Screens.Gameplay.GameModel#
     */
    removeBroadcastCallbacks: function (channelID, route) {
        if (arguments.length === 0) {
            this.callBacks = {};
            return;
        }
        if (arguments.length === 1) {
            delete this.callBacks[channelID];
            return;
        }
        if (this.callBacks[channelID][route] !== null && this.callBacks[channelID][route] !== undefined) {
            delete this.callBacks[channelID][route];
        }
    },

    /**
     * @description Routes the data to respective models for each broadcast and execute it's callback!
     * @method onMessage
     * @param {Object} response -Data received from server during Broadcast!
     * @memberof Screens.Gameplay.GameModel#
     * @callback Shows popUp or calls next callback
     */
    onMessage: function (response) {
        if (response.route === null || response.route === undefined) {
            var param = {
                code: K.Error.KeyMissingBroadcasts,
                response: "route key missing in broadcast!"
            };
            // Shoot 
            GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function () {});
            return;
        }
        if (response.channelId === undefined || response.channelId === null) {
            return;
        }
        if (this.callBacks != null || this.callBacks != undefined) {
            if (!!this.callBacks && !!this.callBacks[response.channelId] && !!this.callBacks[response.channelId][response.route])
                this.callBacks[response.channelId][response.route](response);
        }
    },



});