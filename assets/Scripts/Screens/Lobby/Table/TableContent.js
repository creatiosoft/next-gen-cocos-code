// attached to table row prefab
var JoinData = require('PostTypes').JoinChannel;
var PopupManagerType = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var LoginData = require('PostTypes').Login;

/**
 * @class TableContent
 * @classdesc This class is used in content node to manage view and maintain the selection / update records. 
 * @memberof Screens.Lobby.Table
 */
var TableContent = cc.Class({
    extends: cc.Component,

    properties: {
        textFields: {
            default: [],
            type: cc.Label,
        },
        playerSprite: {
            default: null,
            type: cc.Sprite,
        },
        normalColor: {
            default: cc.Color.WHITE,
            // type: cc.Color,
            // visible: false,
        },
        selectedColor: {
            default: cc.Color.WHITE,
            // type: cc.Color,
        },
        channelData: {
            default: {},
            visible: false,
        },
        bg: {
            default: null,
            type: cc.Node,
        },
        bg2: {
            default: null,
            type: cc.Node,
        },
        dblClk: false,
        popUpManager: {
            default: null,
            type: PopupManagerType,
        },
        turbo: {
            default: null,
            type: cc.Node
        },
        rit: {
            default: null,
            type: cc.Node
        },
        plyrText: {
            default: null,
            type: cc.Label,
        },

        runItTwiceIcon: {
            default: null,
            type: cc.Node
        },
        progressBarSprite: {
            default: null,
            type: cc.Sprite,
        },
        gameType: {
            default: null,
            type: cc.Label,
        },
        totalPlayerIcon: {
            default: null,
            type: cc.Sprite,
        },
        totalPlayerIcons: {
            default: [],
            type: cc.SpriteFrame,
        },
    },

    statics: {
        prevSelection: null,
        callback: null,
        registered: false,
    },

    /**
     * @method onLoad 
     * @description Use this for initialization
     * @memberof Screens.Lobby.Table.TableContent#
     */
    onLoad: function() {
        var inst = this;
        this._onTableSelected = this.onTableSelected.bind(this);
        GameManager.on("TableSelected", this._onTableSelected);
        if (inst.node.parent.parent.parent.parent.parent.name != "SideTable") {
            this.tableListChange = this.onTableListChanged.bind(this);
            this.onTableUpdate = this.onTableUpdated.bind(this);
            ServerCom.pomeloBroadcast(K.LobbyBroadcastRoute.tableUpdate, this.onTableUpdate);
            ServerCom.pomeloBroadcast(K.LobbyBroadcastRoute.joinTableList, this.tableListChange);
            if (!GameManager.isMobile) {
                this.node.on('touchstart', function(event) {
                    if (inst.dblClk) {
                        if (TableContent.prevSelection === null) {
                            return;
                        }

                        var data = new JoinData(TableContent.prevSelection.channelData);
                        var route = K.PomeloAPI.joinChannel;

                        if (TableContent.prevSelection.channelData.channelVariation === "Open Face Chinese Poker") {
                            route = require("OFCConfigs").PomeloAPI.joinChannel;
                        }
                        if (TableContent.prevSelection.channelData.channelType == K.ChannelType.Normal) {
                            GameManager.join(TableContent.prevSelection.channelData._id, route, data);
                        } else if (TableContent.prevSelection.channelData.channelType == K.ChannelType.Tournament) {
                            TournamentHandler.tournamentLobbyInfo(TableContent.prevSelection.channelData, function(response) {
                                if (!!response.tableData) {
                                    GameManager.popUpManager.show(PopUpType.TournamentLobbyInfoPopup, response, function() {});
                                }
                            }.bind(this), function(response) {}.bind(this));
                        }
                        inst.dblClk = false;
                    } else {
                        inst.dblClk = true;
                        TableContent.prevSelection = inst;
                        setTimeout(function() {
                            inst.dblClk = false;
                        }, 300);
                    }
                }, this.node);
            }
        }
    },

    /**
     * @method onDestroy
     * @description called When the node is destroyed, De-Regiter Broadcast
     * @memberof Screens.Lobby.Table.TableContent#
     */
    onDestroy: function() {
        GameManager.off("TableSelected", this._onTableSelected);
    },

    /**
     * @method onClick
     * @description Click handler
     * @memberof Screens.Lobby.Table.TableContent#
     */
    onClick: function() {
        TableContent.prevSelection = this;
        if (TableContent.callback !== null) {
            TableContent.callback();
        }
    },

    /**
     * @method setContentText
     * @description Set content of each label in a row
     * @param {Object} data 
     * @param {bool} textColor -Display text in Black if true else display in white
     * @memberof Screens.Lobby.Table.TableContent#
     */
    setRoomData: function(data) {
        if (this.progressBarSprite && data.maxPlayers > 0) {
            this.progressBarSprite.fillRange = (data.playingPlayers || 0) / data.maxPlayers;
        }
        if (this.gameType) {
            let variation = data.channelVariation || (data.gameInfo && data.gameInfo.GameVariation) || '';
            let gameTypeStr = 'NLH';
            if (variation === 'Omaha' || variation === 'Omaha 5' || variation === 'Omaha 6' || variation === 'Big O') {
                gameTypeStr = 'PLO';
            } 
            else if (variation === 'Mixed Game') {
                gameTypeStr = 'MIXED';
            }
            else if (variation === 'Bomb Pot 5') {
                gameTypeStr = 'PLO';
            }
            else if (variation === 'Bomb Pot 6') {
                gameTypeStr = 'PLO';
            }
            else if (data.isPotLimit) {
                gameTypeStr = 'PLH';
            }
            this.gameType.string = gameTypeStr;
        }
    },

    setContentText: function(data, textColor = true) {
        var count = 0;
        // console.log('setContentText ', data)
        this.textFields.forEach(function(element) {
            if (element) element.string = data[count];
            count++;
        }, this);
        let totalActivePlayers = this.plyrText.string.split("/")[0];
        for (let i = 0; i < this.totalPlayerIcons.length; i++) {
            if (i == totalActivePlayers) {
                this.totalPlayerIcon.spriteFrame = this.totalPlayerIcons[i];
            }
        }
    },

    /**
     * @method onTableListChanged
     * @description control view of table in lobby joined by player
     * @param {object} eventData 
     * @memberof Screens.Lobby.Table.TableContent#
     */
    onTableListChanged: function(eventData) {},

    /**
     * @method onTableUpdated
     * @description Update any Data of contend
     * @param {Object} eventData
     * @memberof Screens.Lobby.Table.TableContent#
     */
    onTableUpdated: function(eventData) {
        if (this.channelData && eventData._id == this.channelData._id) {
            for (var key in eventData.updated) {
                this.channelData[key] = eventData.updated[key];
                var selected = (TableContent.prevSelection) && TableContent.prevSelection._id == this.channelData._id;
                this.setContentText(this.table.makeContent(this.channelData), !selected);
            }
        }
    },

    onGo() {
        let now = new Date().getTime();
        console.log("onGo", now - GameManager.lastClickTime);
        if (now - GameManager.lastClickTime < GameManager.clickInterval) {
            console.log("onGo1");
            return;
        }
        console.log("onGo2");
        GameManager.lastClickTime = now;
        GameManager.join(this.channelData._id, K.PomeloAPI.joinChannel, new JoinData(this.channelData));
    },

    onTableSelected(data) {
    }
});