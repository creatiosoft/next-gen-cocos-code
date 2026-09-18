// inherits Table.js
// 
var JoinData = require('PostTypes').JoinChannel;
var Table = require('Table');
var TableContent = require('TableContent');
var Advancefilter = require('Advancefilter');
// var Checkbox = require('Checkbox');
var DropDownType = require('DropDown');
var timerID = null;
var PopUpType = require('PopUpManager').PopUpType;

var Variation = cc.Enum({
    None: -1,
    TexasHoldem: 1,
    Omaha: 2,
    OmahaHiLo: 3,
    OpenFaceChinesePoker: 4,
});

var tabType = cc.Enum({
    CashGames: 1,
    SitAndGo: 2,
    Tournaments: 3,
});

/**
 * @class CashTablePresenter
 * @classdesc handles table view manipulation for cash 
 * @extends Table
 * @memberof Screens.Lobby.Table
 */
var CashRoom = cc.Class({
    extends: cc.Component,

    properties: {
        dblClk: false,
        roomsLbl: {
            default: null,
            type: cc.Label,
        },
        navNode: {
            default: null,
            type: cc.Node,
        },
        sortArrow: {
            default: null,
            type: cc.Node,
        },
        sortLabel: {
            default: null,
            type: cc.Label,
        },
        filter: {
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
        contentHolder: {
            default: null,
            type: cc.Node,
        },
        original: {
            default: null,
            type: cc.Node,
        },
        cashierTable: {
            default: null,
            type: cc.Node,
        },
        lowFilter: {
            default: null,
            type: cc.Button
        },
        midFilter: {
            default: null,
            type: cc.Button
        },
        highFilter: {
            default: null,
            type: cc.Button
        },
        variation: Variation.TexasHoldem,
        isShowHoldem: false,
        isShowMixed: false,
        isShowPLO: false,
        isShowMega: false,
        isShowAllIn: false,
        isShowFast: false,
        isShowBombpot: false,
        isShowAll: true,
        lockClick: false,

        roomData: null,

        hideFullTableToggle: {
            default: null,
            type: cc.Toggle,
        },

        sortByNode: {
            default: null,
            type: cc.Node
        },

        allFilterNode: {
            default: [],
            type: cc.Node
        },

        filterCountLabel: {
            default: null,
            type: cc.Label
        },

        sortToggleContainer: {
            default: null,
            type: cc.ToggleContainer
        },

        defaultAllFilterNode: {
            default: null,
            type: cc.Node
        },
        selectedToggleFilterIndex: 0,
    },

    statics: {
        init: false,
        prevSelection: null,
        isPriactice: false,
        sortPlayers: true,
        sortPlayersLH: false,
        sortBuyinLH: false,
        sortBuyinHL: false,
        sortBlindsLH: false,
        sortBlindsHL: false,
        hideFullTable: false,
    },

    onLoad: function() {
        ServerCom.pomeloBroadcast("newRoomAdd", this.onNewRoomAdd.bind(this));
        ServerCom.pomeloBroadcast("deleteRoom", this.onDeleteRoom.bind(this));
        GameManager.on("updateAutoSelect", this.onUpdateAutoSelect.bind(this));
        GameManager.on("roomSelected", this.onRoomSelected.bind(this));
        GameManager.on("removeAllHighlight", this.onRemoveAllHighlight.bind(this));
        GameManager.on("onRoomUpdate2", this.onRoomUpdate2.bind(this));
        GameManager.on("onDoSort", this.onDoSort.bind(this));
        GameManager.on("AdvancefilterUpdated", this.onAdvancefilterUpdated.bind(this));
        cc.systemEvent.on("leaveLobby", this.leaveLobby, this);

        this._syncBuyinFromButtons();
    },

    leaveLobby: function() {
        this.contentHolder.removeAllChildren(true);
        this.roomData = null;
        Advancefilter.config.buyin["Low"] = true;
        this.lowFilter.node.getChildByName("pressed").active = true;
        Advancefilter.config.buyin["Medium"] = true;
        this.midFilter.node.getChildByName("pressed").active = true;
        Advancefilter.config.buyin["High"] = true;
        this.highFilter.node.getChildByName("pressed").active = true;
        this.sortLabel.string = 1;
    },

    onClick: function(event) {},

    onNewRoomAdd: function(data) {
        let roomId = data._id;
        data = data.updated;
        let instance = cc.instantiate(this.original);
        instance.active = true;
        instance.setPosition(0, 0);
        instance.__data = data;
        cc.find('TableName', instance).getComponent(cc.Label).string = data.channelName;
        cc.find('avgPot', instance).getComponent(cc.Label).string = GameManager.convertChips(data.smallBlind) + "/" + GameManager.convertChips(data.bigBlind) + '';
        if (data.channelVariation == 'Texas Hold’em') {
            cc.loader.loadRes('assets/TAGS/holdem', cc.SpriteFrame, function(err, tex) {
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                }
            });
        } else if (data.channelVariation == 'Omaha') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function(err, tex) {
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = true;
                    ploTag.children[0].getComponent(cc.Label).string = 4;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO4";
                }
            });
        } else if (data.channelVariation == 'Omaha 5') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function(err, tex) {//assets/TAGS/plo5
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = true;
                    ploTag.children[0].getComponent(cc.Label).string = 5;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO5";
                }
            });
        } else if (data.channelVariation == 'Omaha 6') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function(err, tex) {//assets/TAGS/plo6c
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = true;
                    ploTag.children[0].getComponent(cc.Label).string = 6;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO6";
                }
            });
        } else if (data.channelVariation == 'Mega Hold’em') {
            cc.loader.loadRes('assets/TAGS/mega', cc.SpriteFrame, function(err, tex) {
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                }
            });
        } else if (data.channelVariation == 'Mixed Game') {
            cc.loader.loadRes('assets/TAGS/mixed', cc.SpriteFrame, function(err, tex) {
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "NLH+PLO";
                }
            });
        } else if (data.channelVariation == 'Big O') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function(err, tex) {//assets/TAGS/plo8
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = false;
                    ploTag.children[0].getComponent(cc.Label).string = 8;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "Big O";
                }
            });
        } else if (data.channelVariation == 'Bomb Pot 5') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function (err, tex) {//assets/TAGS/plo8
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = false;
                    ploTag.children[0].getComponent(cc.Label).string = 8;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO5";
                }
            });
        } else if (data.channelVariation == 'Bomb Pot 6') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function (err, tex) {//assets/TAGS/plo8
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = false;
                    ploTag.children[0].getComponent(cc.Label).string = 8;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO6";
                }
            });
        } else {
            cc.loader.loadRes('assets/TAGS/holdem', cc.SpriteFrame, function (err, tex) {
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                }
            });
        }

        if (data.blindsType == "Low") {
            cc.find('filterLow', instance).active = true;
            cc.find('filterMid', instance).active = false;
            cc.find('filterHigh', instance).active = false;
        } else if (data.blindsType == "Mid") {
            cc.find('filterLow', instance).active = false;
            cc.find('filterMid', instance).active = true;
            cc.find('filterHigh', instance).active = false;
        } else if (data.blindsType == "High") {
            cc.find('filterLow', instance).active = false;
            cc.find('filterMid', instance).active = false;
            cc.find('filterHigh', instance).active = true;
        }

        if (data.roomImage) {
            cc.find('icon', instance).roomImage = data.roomImage;
            cc.loader.load(K.ServerAddress.assets_server_s + data.roomImage, function(err, tex) {
                if (err) {} else {
                    cc.find('icon', instance).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
                }
            });
        }

        if (data.liveStreaming == true) {
            cc.find('tags/live', instance).active = true;
        } else {
            cc.find('tags/live', instance).active = false;
        }

        if (data.hasBombPot == true || data.hasBombPot == "true") {
            cc.find('tags/bomb', instance).active = true;
        } else {
            cc.find('tags/bomb', instance).active = false;
        }

        if (data.highHand == true || data.highHand == "true") {
            cc.find('tags/High Hands', instance).active = true;
        } else {
            cc.find('tags/High Hands', instance).active = false;
        }

        if (data.hasDoubleBoard == true || data.hasDoubleBoard == "true") {
            cc.find('tags/Double board', instance).active = true;
        } else {
            cc.find('tags/Double board', instance).active = false;
        }
        cc.find('go/Background/MinMax', instance).getComponent(cc.Label).string = GameManager.convertChips(data.minBuyIn);
        cc.find('players/plyrLbl', instance).getComponent(cc.Label).string = data.totalPlayer || 0;
        instance.getComponent(cc.Button).clickEvents[0].customEventData = roomId;
        instance.active = this._passesFilters(data);
        this.contentHolder.addChild(instance);
        this._updateRoomsLabel();
    },

    onRoomUpdate2: function(data) {
        for (var i = 0; i < this.contentHolder.children.length; i++) {
            let c = this.contentHolder.children[i];
            if (c.getComponent(cc.Button).clickEvents[0].customEventData == data._id) {

                if (data.updated && data.updated.playingPlayers != null && data.updated.playingPlayers != undefined) {
                    cc.find('players/plyrLbl', c).getComponent(cc.Label).string = data.updated.playingPlayers;

                    for (var j = 0; j < this.roomData.length; j++) {
                        if (this.roomData[j]._id == data._id) {
                            this.roomData[j].totalPlayer = data.updated.playingPlayers;
                            let tc = c.getComponent('TableContent');
                            if (tc && tc.progressBarSprite && this.roomData[j].maxPlayers > 0) {
                                tc.progressBarSprite.fillRange = (data.updated.playingPlayers || 0) / this.roomData[j].maxPlayers;
                            }
                            break;
                        }
                    }
                }
                if (data.updated && data.updated.highHand != null && data.updated.highHand != undefined) {
                    cc.find('tags/High Hands', c).active = (data.updated.highHand == true || data.updated.highHand == "true");
                }
                break;
            }
        }
        this._applyLocalFilters();
        this.onDoSort();
    },

    onUpdateAutoSelect: function() {
        this.autoGoto(null, GameManager.hightlightRoom);
    },

    onDeleteRoom: function(data) {
        for (var i = 0; i < this.contentHolder.children.length; i++) {
            let c = this.contentHolder.children[i];
            if (c.getComponent(cc.Button).clickEvents[0].customEventData == data._id) {
                c.removeFromParent(true);
                if (GameManager.hightlightRoom == data._id) {
                    GameManager.hightlightRoom = 0;
                    GameManager.hightlightTable = 0;
                    GameManager.emit("updateAutoSelect");
                }
                break;
            }
        }
        this._updateRoomsLabel();
    },

    /**
     * @method onEnable
     * @description Life Cycle callback, call super() method; 
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    onEnable: function() {},

    onEnable2: function(data, animated = true) {
        animated = false;
        this.populateTable(data, animated);
    },

    onGetTableData: function(channelType = null) {
        var inst = this;
        ServerCom.pomeloRequest("connector.entryHandler.getLobbyRooms", {
            isRealMoney: false,
            channelVariation: "All",
            playerId: GameManager.user.playerId,
            isLoggedIn: true,
            access_token: K.Token.access_token
        }, function(response) {
            if (response.success && response.result) {
                inst.populateTable(response.result);
            }
        }, null, 5000, false);
    },

    sort: function(data, sortRules) {
        return data.sort((x, y) => {
            for (const rule of sortRules) {
                const {
                    key,
                    order
                } = rule;
                const xValue = x[key];
                const yValue = y[key];

                if (xValue > yValue) {
                    return order === 'asc' ? 1 : -1;
                }
                if (xValue < yValue) {
                    return order === 'asc' ? -1 : 1;
                }
            }
            return 0;
        });
    },

    _passesVariation: function(room) {
        if (this.isShowAll) {
            return true;
        }
        if (!room || !room.gameInfo) {
            return false;
        }

        var isBombPot = room.hasBombPot == true || room.hasBombPot == "true";
        if (this.isShowBombpot && !isBombPot) {
            return false;
        }

        var hasVariationFilter = this.isShowHoldem || this.isShowPLO || this.isShowMixed || this.isShowMega || this.isShowFast || this.isShowAllIn;
        if (!hasVariationFilter) {
            return this.isShowBombpot && isBombPot;
        }

        var vari = room.gameInfo.GameVariation;
        if (this.isShowHoldem && vari == "Texas Hold’em" && !room.isAllInAndFold) {
            return true;
        }
        if (this.isShowPLO && (vari == "Omaha" || vari == "Omaha 5" || vari == "Omaha 6" || vari == "Big O" || vari == "Bomb Pot 5" || vari == "Bomb Pot 6")) {
            return true;
        }
        if (this.isShowMixed && vari == "Mixed Game") {
            return true;
        }
        if (this.isShowMega && vari == "Mega Hold’em") {
            return true;
        }
        if (this.isShowFast && room.turnTime == 10) {
            return true;
        }
        if (this.isShowAllIn && room.isAllInAndFold) {
            return true;
        }
        return false;
    },

    _passesAdvanceFilter: function(room) {
        if (!Advancefilter.config.enabled) {
            return true;
        }
        if (Advancefilter.config.players["2"] && room.maxPlayers == 2) return true;
        if (Advancefilter.config.players["3"] && room.maxPlayers == 3) return true;
        if (Advancefilter.config.players["4"] && room.maxPlayers == 4) return true;
        if (Advancefilter.config.players["5"] && room.maxPlayers == 5) return true;
        if (Advancefilter.config.players["6"] && room.maxPlayers == 6) return true;
        if (Advancefilter.config.players["7"] && room.maxPlayers == 7) return true;
        if (Advancefilter.config.players["8"] && room.maxPlayers == 8) return true;
        if (Advancefilter.config.players["9"] && room.maxPlayers == 9) return true;
        if (Advancefilter.config.limit["NoLimit"] && !room.isPotLimit) return true;
        if (Advancefilter.config.limit["PotLimit"] && room.isPotLimit) return true;
        if (Advancefilter.config.format["rit"] && room.isRunItTwice) return true;
        if (Advancefilter.config.stakes["min"] != "" && Advancefilter.config.stakes["max"] != "") {
            if (room.smallBlind >= Number(Advancefilter.config.stakes["min"]) &&
                room.smallBlind <= Number(Advancefilter.config.stakes["max"])) {
                return true;
            }
        } else if (Advancefilter.config.stakes["max"] != "" && room.smallBlind <= Number(Advancefilter.config.stakes["max"])) {
            return true;
        } else if (Advancefilter.config.stakes["min"] != "" && room.smallBlind >= Number(Advancefilter.config.stakes["min"])) {
            return true;
        }
        return false;
    },

    _syncBuyinFromButtons: function() {
        if (this.lowFilter) {
            Advancefilter.config.buyin["Low"] = this.lowFilter.node.getChildByName("pressed").active;
        }
        if (this.midFilter) {
            Advancefilter.config.buyin["Medium"] = this.midFilter.node.getChildByName("pressed").active;
        }
        if (this.highFilter) {
            Advancefilter.config.buyin["High"] = this.highFilter.node.getChildByName("pressed").active;
        }
    },

    _passesBuyin: function(room) {
        var low = Advancefilter.config.buyin["Low"];
        var mid = Advancefilter.config.buyin["Medium"];
        var high = Advancefilter.config.buyin["High"];
        if (!low && !mid && !high) {
            return true;
        }
        if (low && room.blindsType == "Low") {
            return true;
        }
        if (mid && room.blindsType == "Mid") {
            return true;
        }
        if (high && room.blindsType == "High") {
            return true;
        }
        return false;
    },

    _passesFilters: function(room) {
        if (!room) {
            return false;
        }
        if (!this._passesVariation(room)) {
            return false;
        }
        if (!this._passesAdvanceFilter(room)) {
            return false;
        }
        if (!this._passesBuyin(room)) {
            return false;
        }
        if (CashRoom.hideFullTable && room.totalPlayer >= room.maxPlayers) {
            return false;
        }
        return true;
    },

    _updateRoomsLabel: function() {
        if (!this.roomsLbl) {
            return;
        }
        var n = 0;
        var children = this.contentHolder.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i].active) {
                n++;
            }
        }
        this.roomsLbl.string = n + " Rooms";
    },

    _applyLocalFilters: function() {
        if (!this.contentHolder) {
            return;
        }
        var children = this.contentHolder.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.active = this._passesFilters(child.__data);
        }
        this._updateRoomsLabel();
    },

    _refreshFromCache: function() {
        if (this.roomData && this.roomData.length) {
            this._applyLocalFilters();
        } else {
            this.onGetTableData();
        }
    },

    populateTable: function(data, animated = true) {
        this.roomData = data;
        let sortRules = [];
        if (CashRoom.sortPlayers) {
            sortRules.push({
                key: 'totalPlayer',
                order: 'desc'
            });
        }
        if (CashRoom.sortPlayersLH) {
            sortRules.push({
                key: 'totalPlayer',
                order: 'asc'
            });
        }
        if (CashRoom.sortBlindsLH) {
            sortRules.push({
                key: 'smallBlind',
                order: 'asc'
            });
        }
        if (CashRoom.sortBlindsHL) {
            sortRules.push({
                key: 'smallBlind',
                order: 'desc'
            });
        }
        if (CashRoom.sortBuyinLH) {
            sortRules.push({
                key: 'minBuyIn',
                order: 'asc'
            });
        }
        if (CashRoom.sortBuyinHL) {
            sortRules.push({
                key: 'minBuyIn',
                order: 'desc'
            });
        }
        sortRules.push({
            key: 'roomName',
            order: 'asc'
        });
        data = this.sort(data, sortRules);
        animated = false;
        this.contentHolder.removeAllChildren(true);
        this.cashierTable.getComponent("Table").roomData = data;
        for (var i = 0; i < data.length; i++) {
            let instance = cc.instantiate(this.original);
            instance.active = true;
            instance.__data = data[i];
            if (animated) {
                instance.opacity = 0;
            }
            cc.find('TableName', instance).getComponent(cc.Label).string = data[i].roomName;
            cc.find('avgPot', instance).getComponent(cc.Label).string = GameManager.convertChips(data[i].smallBlind) + "/" + GameManager.convertChips(data[i].bigBlind) + "";
            let ploTag = cc.find('l/tag', instance);
            ploTag.active = false;
            if (data[i].liveStreaming == true) {
                cc.find('tags/live', instance).active = true;
            } else {
                cc.find('tags/live', instance).active = false;
            }

            if (data[i].hasBombPot == true || data[i].hasBombPot == "true") {
                cc.find('tags/bomb', instance).active = true;
            } else {
                cc.find('tags/bomb', instance).active = false;
            }

            if (data[i].highHand == true || data[i].highHand == "true") {
                cc.find('tags/High Hands', instance).active = true;
            } else {
                cc.find('tags/High Hands', instance).active = false;
            }

            if (data[i].hasDoubleBoard == true || data[i].hasDoubleBoard == "true") {
                cc.find('tags/Double board', instance).active = true;
            } else {
                cc.find('tags/Double board', instance).active = false;
            }

            if (data[i].gameInfo.GameVariation == 'Texas Hold’em') {
                cc.loader.loadRes('assets/TAGS/holdem', cc.SpriteFrame, function (err, tex) {
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Omaha') {
                cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function (err, tex) {
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                        ploTag.active = true;
                        ploTag.children[0].getComponent(cc.Label).string = 4;
                        cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO4";
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Omaha 5') {
                cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function (err, tex) {
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                        ploTag.active = true;
                        ploTag.children[0].getComponent(cc.Label).string = 5;
                        cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO5";
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Omaha 6') {
                cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function (err, tex) {//assets/TAGS/plo6c
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                        ploTag.active = true;
                        ploTag.children[0].getComponent(cc.Label).string = 6;
                        cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO6";
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Mega Hold’em') {
                cc.loader.loadRes('assets/TAGS/mega', cc.SpriteFrame, function (err, tex) {
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Mixed Game') {
                cc.loader.loadRes('assets/TAGS/mixed', cc.SpriteFrame, function (err, tex) {
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                        cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "NLH+PLO";
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Big O') {
                cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function (err, tex) {//assets/TAGS/plo8
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                        ploTag.active = false;
                        ploTag.children[0].getComponent(cc.Label).string = 8;
                        cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "BIG O";
                    }
                });
            } else if (data[i].gameInfo.GameVariation == 'Bomb Pot 5') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function(err, tex) {//assets/TAGS/plo8
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = false;
                    ploTag.children[0].getComponent(cc.Label).string = 8;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO5";
                }
            });
        }
        else if (data[i].gameInfo.GameVariation == 'Bomb Pot 6') {
            cc.loader.loadRes('assets/TAGS/plo', cc.SpriteFrame, function(err, tex) {//assets/TAGS/plo8
                if (!err) {
                    cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;
                    ploTag.active = false;
                    ploTag.children[0].getComponent(cc.Label).string = 8;
                    cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "PLO6";
                }
            });
        }
            
            else {
                cc.loader.loadRes('assets/TAGS/holdem', cc.SpriteFrame, function (err, tex) {
                    if (!err) {
                        cc.find('l/vari', instance).getComponent(cc.Sprite).spriteFrame = tex;

                        cc.find('l/vari/roomType', instance).getComponent(cc.Label).string = "NLH";
                    }
                });
            }
            cc.find('go/Background/MinMax', instance).getComponent(cc.Label).string = GameManager.convertChips(data[i].minBuyIn);
            cc.find('players/plyrLbl', instance).getComponent(cc.Label).string = data[i].totalPlayer;

            let tc = instance.getComponent('TableContent');
            if (tc) tc.setRoomData(data[i]);
            instance.getComponent(cc.Button).clickEvents[0].customEventData = data[i]._id;

            if (data[i].blindsType == "Low") {
                cc.find('filterLow', instance).active = true;
                cc.find('filterMid', instance).active = false;
                cc.find('filterHigh', instance).active = false;
            } else if (data[i].blindsType == "Mid") {
                cc.find('filterLow', instance).active = false;
                cc.find('filterMid', instance).active = true;
                cc.find('filterHigh', instance).active = false;
            } else if (data[i].blindsType == "High") {
                cc.find('filterLow', instance).active = false;
                cc.find('filterMid', instance).active = false;
                cc.find('filterHigh', instance).active = true;
            }

            if (data[i].roomImage) {

                let cachedRoomImageTexture = GameManager.cachedRoomImages[data[i].roomImage];
                if (cachedRoomImageTexture) {
                    cc.find('icon', instance).roomImage = data[i].roomImage;
                    cc.find('icon', instance).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(cachedRoomImageTexture);
                } else {
                    (function(roomImage, instance) {
                        if (cc.find('icon', instance).getComponent(cc.Sprite).spriteFrame) {
                            if (roomImage == cc.find('icon', instance).roomImage) {

                            } else {
                                cc.loader.load(K.ServerAddress.assets_server_s + roomImage, function(err, tex) {
                                    if (err) {} else {
                                        cc.find('icon', instance).roomImage = roomImage;
                                        cc.find('icon', instance).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
                                        GameManager.cachedRoomImages[roomImage] = tex;
                                    }
                                });
                            }
                        } else {
                            cc.find('icon', instance).roomImage = roomImage;
                            cc.loader.load(K.ServerAddress.assets_server_s + roomImage, function(err, tex) {
                                if (err) {} else {
                                    cc.find('icon', instance).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
                                    GameManager.cachedRoomImages[roomImage] = tex;
                                }
                            });
                        }
                    })(data[i].roomImage, instance);
                }
            }
            instance.active = this._passesFilters(data[i]);
            this.contentHolder.addChild(instance);
        }

        this._updateRoomsLabel();
    },

    populateTableUpdate: function(data) {
        let sortRules = [];
        if (CashRoom.sortPlayers) {
            sortRules.push({
                key: 'totalPlayer',
                order: 'desc'
            });
        }
        if (CashRoom.sortPlayersLH) {
            sortRules.push({
                key: 'totalPlayer',
                order: 'asc'
            });
        }
        if (CashRoom.sortBlindsLH) {
            sortRules.push({
                key: 'smallBlind',
                order: 'asc'
            });
        }
        if (CashRoom.sortBlindsHL) {
            sortRules.push({
                key: 'smallBlind',
                order: 'desc'
            });
        }
        if (CashRoom.sortBuyinLH) {
            sortRules.push({
                key: 'minBuyIn',
                order: 'asc'
            });
        }
        if (CashRoom.sortBuyinHL) {
            sortRules.push({
                key: 'minBuyIn',
                order: 'desc'
            });
        }

        data = this.sort(data, sortRules);

        this.cashierTable.getComponent("Table").roomData = data;

        let roomCount = 0;
        for (var i = 0; i < this.contentHolder.children.length; i++) {
            let child = this.contentHolder.children[i];
            let hit = false;
            if (this.isShowAll) {
                hit = true;
            } else {
                var childIsBombPot = child.__data.hasBombPot == true || child.__data.hasBombPot == "true";
                var childHasVariationFilter = this.isShowHoldem || this.isShowPLO || this.isShowMixed || this.isShowMega || this.isShowFast || this.isShowAllIn;

                if (!(this.isShowBombpot && !childIsBombPot)) {
                    if (!childHasVariationFilter) {
                        hit = this.isShowBombpot && childIsBombPot;
                    } else {
                        if (this.isShowHoldem && child.__data.gameInfo.GameVariation == "Texas Hold’em" && !child.__data.isAllInAndFold) {
                            hit = true;
                        }
                        if (this.isShowPLO && (child.__data.gameInfo.GameVariation == "Omaha" || child.__data.gameInfo.GameVariation == "Omaha 5" || child.__data.gameInfo.GameVariation == "Omaha 6")) {
                            hit = true;
                        }
                        if (this.isShowMixed && child.__data.gameInfo.GameVariation == "Mixed Game") {
                            hit = true;
                        }
                        if (this.isShowMega && child.__data.gameInfo.GameVariation == "Mega Hold’em") {
                            hit = true;
                        }
                        if (this.isShowFast && child.__data.turnTime == 10) {
                            hit = true;
                        }
                        if (this.isShowAllIn && child.__data.isAllInAndFold) {
                            hit = true;
                        }
                    }
                }

                if (!hit) {
                    child.active = false;
                    continue;
                }
            }

            let adHit = false;
            if (Advancefilter.config.enabled) {
                if (Advancefilter.config.players["2"] && child.__data.maxPlayers == 2) {
                    adHit = true;
                }
                if (Advancefilter.config.players["3"] && child.__data.maxPlayers == 3) {
                    adHit = true;
                }
                if (Advancefilter.config.players["4"] && child.__data.maxPlayers == 4) {
                    adHit = true;
                }
                if (Advancefilter.config.players["5"] && child.__data.maxPlayers == 5) {
                    adHit = true;
                }
                if (Advancefilter.config.players["6"] && child.__data.maxPlayers == 6) {
                    adHit = true;
                }
                if (Advancefilter.config.players["7"] && child.__data.maxPlayers == 7) {
                    adHit = true;
                }
                if (Advancefilter.config.players["8"] && child.__data.maxPlayers == 8) {
                    adHit = true;
                }
                if (Advancefilter.config.players["9"] && child.__data.maxPlayers == 9) {
                    adHit = true;
                }

                if (Advancefilter.config.limit["NoLimit"] && !child.__data.isPotLimit) {
                    adHit = true;
                }
                if (Advancefilter.config.limit["PotLimit"] && child.__data.isPotLimit) {
                    adHit = true;
                }
                if (Advancefilter.config.format["rit"] && child.__data.isRunItTwice) {
                    adHit = true;
                }

                if (Advancefilter.config.stakes["min"] != "" && Advancefilter.config.stakes["max"] != "") {
                    if (child.__data.smallBlind >= Number(Advancefilter.config.stakes["min"]) &&
                        child.__data.smallBlind <= Number(Advancefilter.config.stakes["max"])) {
                        adHit = true;
                    }
                } else if (Advancefilter.config.stakes["max"] != "" && child.__data.smallBlind <= Number(Advancefilter.config.stakes["max"])) {
                    adHit = true;
                } else if (Advancefilter.config.stakes["min"] != "" && child.__data.smallBlind >= Number(Advancefilter.config.stakes["min"])) {
                    adHit = true;
                }

                if (!adHit) {
                    child.active = false;
                    continue;
                }
            }

            if (Advancefilter.config.buyin["Low"]) {
                if (child.__data.blindsType == "Low") {
                    adHit = true;
                }
            }
            if (Advancefilter.config.buyin["Medium"]) {
                if (child.__data.blindsType == "Mid") {
                    adHit = true;
                }
            }
            if (Advancefilter.config.buyin["High"]) {
                if (child.__data.blindsType == "High") {
                    adHit = true;
                }
            }

            if (!Advancefilter.config.buyin["Low"] &&
                !Advancefilter.config.buyin["Medium"] &&
                !Advancefilter.config.buyin["High"]) {
                adHit = true;
            }
            if (!adHit) {
                child.active = false;
                continue;
            }

            if (CashRoom.hideFullTable && child.__data.totalPlayer >= child.__data.maxPlayers) {
                child.active = false;
                continue;
            }

            roomCount += 1;
            child.active = true;
        }

        if (this.roomsLbl) {
            this.roomsLbl.string = roomCount + " Rooms";
        }
    },


    /**
     * @method tableContentClick
     * @description Method called for everytime a table is clicked
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    tableContentClick: function() {},

    /**
     * @method addTable
     * @description Add Table From DashBoard to lobby!
     * @param {object} data -Table content data!
     * @memberof  CashTablePresenter#
     */
    addTable: function(data) {},

    /**
     * @method makeContent
     * @description Returns content array based on table data
     * @param {object} data -
     * @memberof Screens.Lobby.Table.CashTablePresenter#
     */
    makeContent: function(data) {
        if (this.variation == K.Variation.OpenFaceChinesePoker) {
            var content = [data.channelName, data.chipsPointRatio, data.channelVariation, GameManager.getGameTypeByValue(data.turnTime), data.minBuyIn, data.maxBuyIn, data.playingPlayers + "/" + data.maxPlayers, data.queuePlayers];
        } else {
            let variation = data.channelVariation;
            switch (data.channelVariation) {
                case K.Variation.TexasHoldem:
                    variation = "Hold'em";
                    break;
                case K.Variation.Omaha:
                    variation = "OMAHA";
                    break;
                case K.Variation.OmahaHiLo:
                    variation = "Omaha Hi-Lo";
                    break;
                default:
                    variation = data.channelVariation;
                    break;
            }
            var content = [data.channelName, data.smallBlind + "/" + data.bigBlind + ", " + variation, "Avg Pot" + ': ' + data.avgStack, data.minBuyIn + "/" + data.maxBuyIn, "Players", data.playingPlayers + "/" + data.maxPlayers];
        }
        return content;
    },

    getTableData2: function(roomId, filter, callback) {
        ServerCom.pomeloRequest("connector.entryHandler.getTableByRoomId", {
            isRealMoney: true,
            channelVariation: filter,
            playerId: GameManager.user.playerId,
            isLoggedIn: true,
            access_token: K.Token.access_token,
            roomId: roomId
        }, callback, null, 5000, false);
    },

    _openTableList: function(roomId) {
        var inst = this;
        var tableComp = inst.cashierTable.getComponent("Table");
        tableComp.roomId = roomId;
        tableComp.clearContents();
        inst.cashierTable.active = true;
        if (typeof tableComp.applyRoomHeader === "function") {
            tableComp.applyRoomHeader();
        }
        inst.node.scale = 0;
        inst.top.active = false;
        inst.navNode.active = false;
        inst.top2.active = true;
        this.getTableData2(roomId, 1, function(response) {
            if (!cc.isValid(inst.cashierTable)) {
                return;
            }
            var table = inst.cashierTable.getComponent("Table");
            if (table.roomId != roomId) {
                return;
            }
            if (response && response.result) {
                table.onEnable2(response.result);
            }
        });
    },

    autoGoto: function(event, msg) {
        let found = false;
        this.contentHolder.children.forEach((elem) => {
            cc.find("bg2", elem).active = false;
            if (elem.__data._id == msg) {
                found = true;
                cc.find("bg2", elem).active = true;
                this.selectedNode = elem;
            }
        });

        if (!found) {
            msg = GameManager.hightlightRoom = this.contentHolder.children[0].__data._id;
            GameManager.hightlightTable = 0;
            this.contentHolder.children.forEach((elem) => {
                cc.find("bg2", elem).active = false;
                if (elem.__data._id == msg) {
                    cc.find("bg2", elem).active = true;

                    this.selectedNode = elem;
                }
            });
        }

        const scrollView = this.contentHolder.parent.parent.getComponent(cc.ScrollView);
        const targetNode = this.selectedNode;
        const contentNode = this.contentHolder;

        const targetPos = targetNode.position;
        const contentPos = contentNode.position;

        const viewHeight = scrollView.node.height;
        const targetY = targetNode.y;
        const targetMiddle = targetY + targetNode.height / 2;

        const offset = targetMiddle - viewHeight / 2;
        scrollView.scrollToOffset(cc.v2(0, -offset), 0.01);

        this._openTableList(msg);
    },

    goto: function(event, msg) {
        var inst = this;
        if (this.lockClick) {
            return;
        }
        this.lockClick = true;
        this.scheduleOnce(() => {
            this.lockClick = false;
        }, 1);
        GameManager.hightlightRoom = msg;
        GameManager.emit("lockMain");
        GameManager.hightlightTable = 0;
        this._openTableList(msg);
    },

    onAdvancefilterUpdated: function() {
        if (Advancefilter.config.enabled) {
            cc.find("filter", this.filter).color = new cc.color(255, 166, 39);
        } else {
            cc.find("filter", this.filter).color = new cc.color(255, 255, 255);
        }
        this._refreshFromCache();
    },

    onLow: function() {
        this._syncBuyinFromButtons();
        var pressed = this.lowFilter.node.getChildByName("pressed");
        pressed.active = !pressed.active;
        Advancefilter.config.buyin["Low"] = pressed.active;
        this._refreshFromCache();
    },

    onMid: function() {
        this._syncBuyinFromButtons();
        var pressed = this.midFilter.node.getChildByName("pressed");
        pressed.active = !pressed.active;
        Advancefilter.config.buyin["Medium"] = pressed.active;
        this._refreshFromCache();
    },

    onHigh: function() {
        this._syncBuyinFromButtons();
        var pressed = this.highFilter.node.getChildByName("pressed");
        pressed.active = !pressed.active;
        Advancefilter.config.buyin["High"] = pressed.active;
        this._refreshFromCache();
    },

    onSort: function() {
        var ifSettingPopupOpening = GameManager.popUpManager.checkIfPopupTypeActive(PopUpType.SortPopup);

        if (ifSettingPopupOpening) {
            GameManager.popUpManager.hide(PopUpType.SortPopup);
        } else {
            GameManager.popUpManager.show(PopUpType.SortPopup, {}, function() {});
        }
    },

    onDoSort: function() {
        if (!GameManager.isMobile) {
            GameManager.popUpManager.hide(PopUpType.SortPopup);
        }
        const children = this.contentHolder.children;
        const sortedChildren = [...children];

        let sortRules = [];

        if (CashRoom.sortPlayers) {
            sortRules.push({
                key: 'totalPlayer',
                order: 'desc'
            });
        }
        if (CashRoom.sortPlayersLH) {
            sortRules.push({
                key: 'totalPlayer',
                order: 'asc'
            });
        }
        if (CashRoom.sortBlindsLH) {
            sortRules.push({
                key: 'smallBlind',
                order: 'asc'
            });
        }
        if (CashRoom.sortBlindsHL) {
            sortRules.push({
                key: 'smallBlind',
                order: 'desc'
            });
        }
        if (CashRoom.sortBuyinLH) {
            sortRules.push({
                key: 'minBuyIn',
                order: 'asc'
            });
        }
        if (CashRoom.sortBuyinHL) {
            sortRules.push({
                key: 'minBuyIn',
                order: 'desc'
            });
        }

        sortRules.push({
            key: 'roomName',
            order: 'asc'
        });

        let mysort = function(data, sortRules) {
            return data.sort((x, y) => {
                for (const rule of sortRules) {
                    const {
                        key,
                        order
                    } = rule;
                    const xValue = x.__data[key];
                    const yValue = y.__data[key];

                    if (xValue > yValue) {
                        return order === 'asc' ? 1 : -1;
                    }
                    if (xValue < yValue) {
                        return order === 'asc' ? -1 : 1;
                    }
                }
                return 0;
            });
        }

        mysort(sortedChildren, sortRules);

        for (let i = 0; i < sortedChildren.length; i++) {
            sortedChildren[i].setSiblingIndex(i);
        }

        let sortNum = 0;
        if (CashRoom.sortPlayers) {
            sortNum += 1;
        }
        if (CashRoom.sortPlayersLH) {
            sortNum += 1;
        }
        if (CashRoom.sortBlindsLH) {
            sortNum += 1;
        }
        if (CashRoom.sortBlindsHL) {
            sortNum += 1;
        }
        if (CashRoom.sortBuyinLH) {
            sortNum += 1;
        }
        if (CashRoom.sortBuyinHL) {
            sortNum += 1;
        }
        this.sortLabel.string = sortNum;
    },

    onHideFullTable: function(toggle) {
        CashRoom.hideFullTable = toggle.isChecked;
        this._refreshFromCache();
    },

    onRoomSelected: function() {},

    onRemoveAllHighlight: function() {
        this.contentHolder.children.forEach((elem) => {
            cc.find("bg2", elem).active = false;
            cc.find("bg", elem).active = true;
        });
    },

    getFilterCount(){
        let count= 0;
        for (let a = 0; a < this.allFilterNode.length; a++) {
            if (this.allFilterNode[a].active) {
                if (this.allFilterNode[a].getChildByName("pressed").active) {
                    count++;
                }
            }
            
        }
        this.filterCountLabel.node.parent.active = count > 0;
        this.filterCountLabel.string = count + "";
        // this.defaultAllFilterNode.active = count <= 0;
    },

    showSortByPopup(){       
        this.sortByNode.active = !this.sortByNode.active;
        if (this.sortByNode.active) {
            var toggles = this.sortToggleContainer.node.children;
            toggles[this.selectedToggleFilterIndex].getComponent(cc.Toggle).isChecked = true;
        }
       
    },

    hideSortByPopup(){       
        this.sortByNode.active = false;
    },

    onClickApplySortFilter() {
        var toggles = this.sortToggleContainer.node.children;

        CashRoom.sortPlayersLH = toggles[0].getComponent(cc.Toggle).isChecked;
        CashRoom.sortPlayers = toggles[1].getComponent(cc.Toggle).isChecked;
        CashRoom.sortBlindsLH = toggles[2].getComponent(cc.Toggle).isChecked;
        CashRoom.sortBlindsHL = toggles[3].getComponent(cc.Toggle).isChecked;

        CashRoom.sortBuyinLH = false;
        CashRoom.sortBuyinHL = false;
        for (let a = 0; a < toggles.length; a++) {
            if (toggles[a].getComponent(cc.Toggle).isChecked) {
                this.selectedToggleFilterIndex = a;
            }
        }
        this.hideSortByPopup();
        this.onDoSort();
    },

    onClickClearAllSortFilter() {
        var toggles = this.sortToggleContainer.node.children;
        toggles[0].getComponent(cc.Toggle).isChecked = true;
    },

    clearAllFilter(){
        this.lowFilter.node.getChildByName("pressed").active = false;
        this.midFilter.node.getChildByName("pressed").active = false;
        this.highFilter.node.getChildByName("pressed").active = false;
        this._syncBuyinFromButtons();
        this._refreshFromCache();
    }
});
