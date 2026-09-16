// inherits Table.js
// 
var JoinData = require('PostTypes').JoinChannel;
var Table = require('Table');
var TableContent = require('TableContent');
var DropDownType = require('DropDown');
var timerID = null;
var LoginData = require('PostTypes').Login;
var PopUpType = require('PopUpManager').PopUpType;

/**
 * @class CashTablePresenter
 * @classdesc handles table view manipulation for cash 
 * @extends Table
 * @memberof Screens.Lobby.Table
 */
var CashTablePresenter = cc.Class({
    extends: Table,

    properties: {
        doubleBoardFilterButton: {
            default: null,
            type: cc.Button,
        },
        bombPotFilterButton: {
            default: null,
            type: cc.Button,
        },
        navNode: {
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
        room: {
            default: null,
            type: cc.Label,
        },
        tables: {
            default: null,
            type: cc.Label,
        },
        blinds: {
            default: null,
            type: cc.Label,
        },
        players: {
            default: null,
            type: cc.Label,
        },
        minbuyin: {
            default: null,
            type: cc.Label,
        },
        buyCounter: {
            default: 0,
            visible: false,
        },
        playerCounter: {
            default: 0,
            visible: false,
        },
        gameTypeDropdown: {
            default: null,
            type: DropDownType,
        },
        stakesDropdown: {
            default: null,
            type: DropDownType,
        },
        maxPlayersDropdown: {
            default: null,
            type: DropDownType,
        },
        sideTableInfoPrefab: {
            default: null,
            type: cc.Node,
        },
        tableInfoHolder: {
            default: null,
            type: cc.Node,
        },
        // tempSelection: null,
        favPrimaryCB: {
            default: null,
            type: cc.Toggle,
        },
        sideTableNameLbl: {
            default: null,
            type: cc.Label,
        },
        sideTableInfo: {
            default: null,
            type: cc.Node,
        },
        selectedTableDetails: {
            default: null,
            type: cc.Node,
        },
        selectedTableDetailsTour: {
            default: null,
            type: cc.Node,
        },
        joinWaitingListBtn: {
            default: null,
            type: cc.Button,
        },

        joinBtn: {
            default: null,
            type: cc.Node,
        },

        avgPotLbl: {
            default: null,
            type: cc.Label,
        },
        numWaitingPlayers: {
            default: null,
            type: cc.Label,
        },
        totalPlayers: {
            default: null,
            type: cc.Label,
        },
        totalTables: {
            default: null,
            type: cc.Label,
        },

        roomBlindsValue: {
            default: null,
            type: cc.Label,
        },
        roomTag: {
            default: null,
            type: cc.Label,
        },

        roomTagIcon: {
            default: null,
            type: cc.Sprite,
        },
        roomTagIconsSpriteFrame: {
            default: [],
            type: cc.SpriteFrame,
        },

        isAll: true,
        isRit: false,
        isDoubleBoard: false,
        isBombPot: false,
        isTurbo: false,
    },

    statics: {
        init: false,
    },

    /**
     * @method onEnable
     * @description Life Cycle callback, call super() method; 
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onEnable: function () {
        this._super();

        GameManager.on("TableSelected", this.onTableSelected.bind(this));

        GameManager.on("waiting_List_Event", function (channelId, flag) {
            if (TableContent.prevSelection !== null && TableContent.prevSelection.channelData._id == channelId) {
                this.onAlreadyJoined(flag);
            }
        }.bind(this));

        this.applyRoomHeader();
        this.updateTotalStats();
    },

    /**
     * @method applyFilter
     * @description Extends Table.js applyFilter to also refresh the room header's
     * total tables/players stats whenever table data is (re)loaded or filtered.
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    applyFilter: function (isRequested) {
        this._super(isRequested);
        this.updateTotalStats();
    },

    /**
     * @method updateTotalStats
     * @description Updates the room header's total table count and total playing-players count
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    updateTotalStats: function () {
        if (!this.totalTables && !this.totalPlayers) {
            return;
        }
        var contents = (this.handler && this.handler.contents) ? this.handler.contents : [];
        if (this.totalTables) {
            this.totalTables.string = contents.length + "";
        }
        if (this.totalPlayers) {
            var totalPlaying = 0;
            for (var i = 0; i < contents.length; i++) {
                totalPlaying += (contents[i].playingPlayers || 0);
            }
            this.totalPlayers.string = totalPlaying + "";
        }

        if (this.roomData) {
            let room = null;
            for (var i = 0; i < this.roomData.length; i++) {
                if (this.roomData[i]._id == this.roomId) {
                    room = this.roomData[i];
                    break;
                }
            }
            this.roomBlindsValue.string = room.smallBlind + "/" + room.bigBlind;

            if (room.channelVariation == 'Texas Hold’em') {
                this.roomTag.string = "NLH";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[0];                
            } else if (room.channelVariation == 'Omaha') {
                this.roomTag.string = "PLO";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[1];
            } else if (room.channelVariation == 'Omaha 5') {
                this.roomTag.string = "PLO5";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[1];
            } else if (room.channelVariation == 'Omaha 6') {
                this.roomTag.string = "PLO6";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[1];
            } else if (room.channelVariation == 'Mega Hold’em') {
                this.roomTag.string = "MEGA";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[0];
            } else if (room.channelVariation == 'Mixed Game') {
                this.roomTag.string = "MIXED";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[0];
            } else if (room.channelVariation == 'Big O') {
                this.roomTag.string = "BIG O";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[1];
            } else {
                this.roomTag.string = "NLH";
                this.roomTagIcon.SpriteFrame = this.roomTagIconsSpriteFrame[0];
            }
            this.room.string = this.roomTag.string;
        }
    },

    applyRoomHeader: function () {
        if (!this.room) {
            return;
        }
        if (this.roomData) {
            let room = null;
            for (var i = 0; i < this.roomData.length; i++) {
                if (this.roomData[i]._id == this.roomId) {
                    room = this.roomData[i];
                    break;
                }
            }
            if (!room) {
                // this.room.string = "";
                return;
            }
            // this.room.string = room.roomName;

            this.ritFilterButton.node.getChildByName("pressed").active = room.isRunItTwice;
            this.turboFilterButton.node.getChildByName("pressed").active = room.turnTime == 10;

            if (room.hasBombPot == true || room.hasBombPot == "true") {
                this.bombFilterButton.node.getChildByName("pressed").active = true;
            } else {
                this.bombFilterButton.node.getChildByName("pressed").active = false;
            }

            if (room.hasDoubleBoard == true || room.hasDoubleBoard == "true") {
                this.doubleBombFilterButton.node.getChildByName("pressed").active = true;
            } else {
                this.doubleBombFilterButton.node.getChildByName("pressed").active = false;
            }
        } else {
            // this.room.string = "";
        }
    },

    onRoomUpdate: function (eventData) {
        GameManager.emit("onRoomUpdate2", eventData);
    },


    /**
     * @method tableContentClick
     * @description Method called for everytime a table is clicked
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    tableContentClick: function () {
        if (TableContent.prevSelection !== null) {
            this.tempSelection = this.contentPool.indexOf(TableContent.prevSelection.node);
        }
    },

    /**
     * @method addTable
     * @description Add Table From DashBoard to lobby!
     * @param {object} data -Table content data!
     * @memberof  CashTablePresenter#
     */
    addTable: function (data) {
        if (data.updated.channelType == K.ChannelType.Normal) {
            this._super(data);
        }
    },


    onHFTSound: function () {
        GameManager.playSound(K.Sounds.click);
        this.applyFilter();
    },

    /**
     * @method makeContent
     * @description Returns content array based on table data
     * @param {object} data -
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    makeContent: function (data) {
        if (this.variation == K.Variation.OpenFaceChinesePoker) {
            var content = [data.channelName, data.chipsPointRatio, data.channelVariation, GameManager.getGameTypeByValue(data.turnTime), data.minBuyIn, data.maxBuyIn, data.playingPlayers + "/" + data.maxPlayers, data.queuePlayers];
        } else {
            if (data && data.avgPot) {
                data.avgStack = data.avgPot;
            }
            var content = [
                data.channelName,
                GameManager.convertChips(data.smallBlind) + "/" + GameManager.convertChips(data.bigBlind),
                GameManager.convertChips(data.avgStack),
                GameManager.convertChips(data.minBuyIn),
                data.playingPlayers + "/" + data.maxPlayers
            ];
        }

        return content;
    },

    /**
     * @method onJoinTable
     * @description Join button callback(Observe btn)
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onJoinTable: function () {
        if (TableContent.prevSelection === null) {
            return;
        }
        var data = new JoinData(TableContent.prevSelection.channelData);
        console.log('onJoinTable ', data);
        var route = K.PomeloAPI.joinChannel;
        if (this.variation == window.K.Variation.OpenFaceChinesePoker) {
            route = require("OFCConfigs").PomeloAPI.joinChannel;
        }
        GameManager.join(TableContent.prevSelection.channelData._id, route, data);
    },

    /**
     * @method onJoinWaitinList
     * @description Show Join Waiting List String over join Button and call joinWaitingList  of TableHandler
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onJoinWaitingList: function () {
        if (TableContent.prevSelection === null) {
            return;
        }
        var flag = this.joinWaitingListBtn.node.children[0].children[2].getComponent(cc.Label).string == "Join Wait List";
        if (TableContent.prevSelection.channelData.isPrivateTabel == "true" && flag) {
            let func = function (response, closePopupFunc) {
                if (response.success) {
                    GameManager.emit("waiting_List_Event", response.channelId, flag);
                    closePopupFunc();
                }
            }.bind(this);

            let privateData = {
                type: "WAITING_LIST",
                flag: flag,
                id: TableContent.prevSelection.channelData._id,
                cb: func,
                toCallFunction: this.handler.joinWaitingList,
            };
            GameManager.popUpManager.show(30, privateData, function () { });

        } else {
            this.handler.joinWaitingList(flag, TableContent.prevSelection.channelData._id, function (response) {
                if (response.success) {
                    GameManager.emit("waiting_List_Event", response.channelId, flag);
                }
            }.bind(this), function (errorResponse) { });
        }
    },

    /**
     * @method onAlreadyJoined
     * @description set join/unjoin value of join button!
     * @param {boolean} flag -
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onAlreadyJoined: function (flag) { },


    /**
     * @method onAutoSit
     * @description Autosit callback(join button)
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onAutoSit: function () {
        // GameManager.playSound(K.Sounds.click);
        if (TableContent.prevSelection === null) {
            return;
        }
        var data = new JoinData(TableContent.prevSelection.channelData);
        data.seatIndex = GameManager.getPreferredSeat(data.maxPlayers);
        data.imageAvtar = ""; //GameManager.user.profileImage;
        var route = K.PomeloAPI.autoSit;
        if (this.variation == window.K.Variation.OpenFaceChinesePoker) {
            route = require("OFCConfigs").PomeloAPI.autoSit;
        }
        GameManager.join(TableContent.prevSelection.channelData._id, route, data)
    },

    /**
     * @method onSideTableUpdate
     * @description Update the side table of Cash
     * @param {object} data -Data for side table update
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onSideTableUpdate: function (data) {
        GameManager.emit("updateWaitingPlayers", data);
        if (TableContent.prevSelection == null || this.contentPool.length == 0) {
            return;
        }
        if (!data.tournamentId) {
            if (TableContent.prevSelection.channelData._id == data._id && this.currentSideTableData) {
                switch (data.event) {
                    case "TABLEVIEWNEWPLAYER":
                        data.updated.playerId = data.playerId;
                        this.currentSideTableData.players.push(data.updated);
                        this.currentSideTableData.isTableFull = TableContent.prevSelection.channelData.maxPlayers == this.currentSideTableData.players.length;
                        if (!this.currentSideTableData.isAlreadyPlaying)
                            this.currentSideTableData.isAlreadyPlaying = (data.playerId == GameManager.user.playerId);
                        break;
                    case "TABLEVIEWLEFTPLAYER":
                        this.removePlayer(data.playerId, this.currentSideTableData.players);
                        this.currentSideTableData.isTableFull = TableContent.prevSelection.channelData.maxPlayers == this.currentSideTableData.players.length;
                        if (data.playerId == GameManager.user.playerId)
                            this.currentSideTableData.isAlreadyPlaying = false;
                        break;
                    case "TABLEVIEWCHIPSUPDATE":
                        this.updateChips(data.playerId, data.updated.chips);
                        break;
                    case "TABLEVIEWNEWWAITINGPLAYER":
                        data.updated.playerId = data.playerId;
                        this.currentSideTableData.waitingPlayer.push(data.updated);
                        if (!this.currentSideTableData.isJoinedWaitingList)
                            this.currentSideTableData.isJoinedWaitingList = (data.playerId == GameManager.user.playerId);
                        break;
                    case "TABLEVIEWLEFTWAITINGPLAYER":
                        this.removePlayer(data.playerId, this.currentSideTableData.waitingPlayer);
                        if (data.playerId == GameManager.user.playerId)
                            this.currentSideTableData.isJoinedWaitingList = false;
                        break;
                }
            }
        }
    },

    /**
     * @method setSideTableData
     * @description setSideTableData
     * @param {object} response - Data received from server to set in side table!
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    setSideTableData: function (response) {
        GameManager.removeAllChildren(this.tableInfoHolder);
        if (TableContent.prevSelection != null && !GameManager.isMobile) {
            this.sideTableNameLbl.string = TableContent.prevSelection.channelData.channelName;
        }
        if (response.success) {
            this.currentSideTableData = response;
            this.joinWaitingListBtn.node.active = response.isTableFull;
            this.onAlreadyJoined(response.isJoinedWaitingList);
            this.joinBtn.active = !response.isAlreadyPlaying;

            this.avgPotLbl.string = response.avgStack;
            this.numWaitingPlayers.string = response.waitingPlayer.length;

            if (response.isAlreadyPlaying) {
                this.joinWaitingListBtn.node.active = response.isAlreadyPlaying ? false : true;
            }
            if (TableContent.prevSelection != null && TableContent.prevSelection.channelData.isPrivateTabel == "true") { }
            if (!GameManager.isMobile) {
                if (response.players.length > 0) {
                    for (var i = 0; i < response.players.length; i++) {
                        this.addPlayerInView(response.players[i]);
                    }
                }
                if (response.waitingPlayer.length > 0) {
                    for (var i = 0; i < response.waitingPlayer.length; i++) {
                        this.addPlayerInView(response.waitingPlayer[i], true);
                    }
                }
            }
        }
    },

    /**
     * @method addPlayerInView
     * @description  Display player's name in side table
     * @param {object} player -Player's data
     * @param {boolean} isWaiting -flag to show if player is waiting or not
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    addPlayerInView: function (player, isWaiting = false) { },


    /**
     * @method removePLayer
     * @description Remove player from data.
     * @param {String} playerId -Id to check
     * @param {Array} playerArray -List of all players!   
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    removePlayer: function (playerId, playersArray) {
        if (playersArray.length > 0) {
            var index = -1;
            for (var i = 0; i < playersArray.length; i++) {
                if (playersArray[i].playerId == playerId) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                playersArray.splice(index, 1);
            }
        }
    },

    /**
     * @method updateChips
     * @description updateChips of any player
     * @param {String} playerId -Id to check
     * @param {Array} playerArray -List of players!
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    updateChips: function (playerId, chips) {
        if (this.currentSideTableData.players.length > 0) {
            var index = -1;
            for (var i = 0; i < this.currentSideTableData.players.length; i++) {
                if (this.currentSideTableData.players[i].playerId == playerId) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                this.currentSideTableData.players[index].chips = chips;
            }
        }
    },

    onBuyInConfirm: function (index, amount) {
        let self = this;
        ServerCom.pomeloRequest(
            'room.channelHandler.quickSeat', {
            roomId: this.roomId,
            isLoggedIn: true,
            access_token: K.Token.access_token,
            imageAvtar: '',
            chips: Number(amount),
            playerId: GameManager.user.playerId,
            playerName: GameManager.user.userName,
            isRequested: true,

        },
            function (response) {
                var route = K.PomeloAPI.joinChannel;
                GameManager.join2(response.data.channelId, route, {
                    "channelId": response.data.channelId,
                    "isRequested": true,
                    "channelType": response.data.channelType,
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

    quickSeat: function () {
        let room = null;
        for (var i = 0; i < this.roomData.length; i++) {
            if (this.roomData[i]._id == this.roomId) {
                room = this.roomData[i];
                break;
            }
        }
        if (!room) {
            return;
        }
        if (GameScreen != null) {
            GameManager.activeTableCount = GameScreen.gridParent.getComponent(cc.PageView).getPages().length;
        } else {
            GameManager.activeTableCount = 0;
        }

        if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
            GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
            return;
        }

        var data = {};
        data.minValue = room.minBuyIn;
        data.maxValue = room.maxBuyIn;
        const text_chips = "Available Chips" + ':';
        if (GameManager.user.category == "DIAMOND") {
            data.totalChips = GameManager.user.realChips;
        } else {
            data.totalChips = GameManager.user.freeChips;
        }
        data.dialogHeadingText = text_chips;
        data.autoBuyIn = GameManager.user.autoBuyIn;
        data.confirm = this.onBuyInConfirm.bind(this);
        data.channelId = room._id;
        data.isRealMoney = true;
        data.autoConfirm = true;
        data.config = {};
        data.config.channelName = room.roomName;
        data.config.smallBlind = room.smallBlind;
        data.config.bigBlind = room.bigBlind;
        data.isAllInAndFold = room.isAllInAndFold;
        data.topHeading = "Buy In";
        data.quickSeat = true;
        GameManager.popUpManager.show(PopUpType.BuyInPopup, data, function () { });
    },

    leaveLobby: function () {
        this.contentHolder.removeAllChildren();
    },


    onRitFilterButton: function () {
        if (this.isRit) {
            this.isRit = false;
            this.ritFilterButton.node.getChildByName("pressed").active = false;
        } else {
            this.isRit = true;
            this.ritFilterButton.node.getChildByName("pressed").active = true;
            this.isAll = false;
        }

        if (!this.isRit &&
            !this.isDoubleBoard &&
            !this.isBombPot &&
            !this.isTurbo) {
            this.isAll = true;
        }
    },

    onDoubleBoardFilterButton: function () {
        if (this.isDoubleBoard) {
            this.isDoubleBoard = false;
            this.doubleBoardFilterButton.node.getChildByName("pressed").active = false;
        } else {
            this.isDoubleBoard = true;
            this.doubleBoardFilterButton.node.getChildByName("pressed").active = true;
            this.isAll = false;
        }

        if (!this.isRit &&
            !this.isDoubleBoard &&
            !this.isBombPot &&
            !this.isTurbo) {
            this.isAll = true;
        }
    },

    onBombPotFilterButton: function () {
        if (this.isBombPot) {
            this.isBombPot = false;
            this.bombPotFilterButton.node.getChildByName("pressed").active = false;
        } else {
            this.isBombPot = true;
            this.bombPotFilterButton.node.getChildByName("pressed").active = true;
            this.isAll = false;
        }

        if (!this.isRit &&
            !this.isDoubleBoard &&
            !this.isBombPot &&
            !this.isTurbo) {
            this.isAll = true;
        }
    },

    onTurboFilterButton: function () {
        if (this.isTurbo) {
            this.isTurbo = false;
            this.turboFilterButton.node.getChildByName("pressed").active = false;
        } else {
            this.isTurbo = true;
            this.turboFilterButton.node.getChildByName("pressed").active = true;
            this.isAll = false;
        }

        if (!this.isRit &&
            !this.isDoubleBoard &&
            !this.isBombPot &&
            !this.isTurbo) {
            this.isAll = true;
        }
    },

    resetAllFilters: function () {
        if (this.isRit) {
            this.isRit = false;
            this.ritFilterButton.node.getChildByName("pressed").active = false;
        }
        if (this.isTurbo) {
            this.isTurbo = false;
            this.turboFilterButton.node.getChildByName("pressed").active = false;
        }
        this.isAll = true;
    },

    onTableSelected: function (data) {
        if (this.cashTablePreview) {
            this.cashTablePreview.showPreview(data);
        }
    }

});