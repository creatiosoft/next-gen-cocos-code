var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

var ChatData = require('PostTypes').ChatData;

cc.Class({
    extends: PopUpBase,

    properties: {
        empty: {
            default: null,
            type: cc.Node,
        },
        chatLbl: {
            default: null,
            type: cc.EditBox,
        },
        chatGridParent: {
            default: null,
            type: cc.Node,
        },
        chatContent: {
            default: null,
            type: cc.Prefab
        },
        chatMeContent: {
            default: null,
            type: cc.Prefab
        },
        chat: [],
        pokerGame: null,
    },

    onShow(data) {
        this.pokerPresenter = data.pokerPresenter;
        this.pokerGame = this.pokerPresenter.getComponent('PokerPresenter').model.getComponent('PokerModel');

        this.registerBroadcast();
        this.empty.active = true;

        if (this.pokerGame.chat) {
            this.generateChat(this.pokerGame.chat);
            this.scrollToBottom();
        }
    },

    onEnable: function() {
        this.scheduleOnce(function() {
            this.scrollToBottom();
        }, 0.2);
        if (this.chatGridParent.children.length == 0) {
            this.empty.active = true;
        } else {
            this.empty.active = false;
        }
    },

    close: function() {
        this.hideSelf();
    },

    showMessages: function(chat) {
        this.unscheduleAllCallbacks();
        this.generateChat(chat);
        this.scrollToBottom();
    },

    generateChat: function(msg) {
        this.empty.active = false;
        var obj = null;
        if (msg.split("|")[3] == GameManager.user.playerId) {
            obj = cc.instantiate(this.chatMeContent);
        } else {
            obj = cc.instantiate(this.chatContent);
        }
        if (!obj.children[1].children[1].getComponent(cc.RichText)) {
            return;
        }
        obj.children[1].children[1].getComponent(cc.RichText).string = msg.split("|")[1];
        obj.children[1].children[0].children[0].getComponent(cc.Label).string = msg.split("|")[0];
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes();
        obj.children[1].children[0].children[1].getComponent(cc.Label).string = time;
        this.chatGridParent.addChild(obj);
        if (!msg.split("|")[2]) {
            var randomIndex = Math.round(Math.random() * GameManager.avatarImages.length - 1);
            obj.children[0].children[1].children[0].getComponent(cc.Sprite).spriteFrame = GameManager.avatarImages[randomIndex];
        } else {
            obj.children[0].children[1].children[0].getComponent(cc.Sprite).spriteFrame = GameManager.avatarImages[parseInt(msg.split("|")[2])];
        }
    },

    scrollToBottom: function() {
        var chatScroll = this.chatGridParent.parent.parent;
        var scrollView = chatScroll.getComponent(cc.ScrollView);
        scrollView.scrollToBottom(0.01);
    },

    /**
     * @description
     * @method onSubmit
     * @memberof Controllers.Gameplay.ChatPanel.ChatInfoPanel#
     */
    onSubmit: function() {
        if (!GameManager.user.settings.muteGameSound) {
            GameManager.playSound(K.Sounds.click);
        }

        // this.playAudio(K.Sounds.click);
        // this.emoticonBox.active = false;
        var tempData = this.chatLbl.string.trim();
        if (!this.pokerGame.gameData.settings.playerChat || this.pokerGame.isPlayerStandUp()) {
            this.chatLbl.string = "";
            this.chatLbl.string = this.chatLbl.string.trim();
            return;
        }

        if (tempData != "") {

            var chatString = tempData;
            var rightEmoji = chatString.split(">");
            if (rightEmoji.length > 0) {
                rightEmoji.forEach(function(element) {
                    if (!!element) {
                        var leftEmoji = element.split("<");
                        if (leftEmoji[1]) {
                            chatString = chatString.replace("<" + leftEmoji[1] + ">", "<img src = '" + leftEmoji[1] + "'/>");
                        }
                    }
                }, this);
            }

            if (this.pokerGame.presenter.isTournament()) {
                TournamentServerCom.socketIORequest("common|room.channelHandler.chat", {
                    playerId: GameManager.user.playerId,
                    channelId: this.pokerGame.gameData.channelId,
                    message: chatString,
                    playerName: GameManager.user.userName,
                    isRequested: true,
                }, function(response) {
                    if (response.success) {
                        // if (GameScreen.isMobile)//
                        //     this.enableotherPopup();
                    }
                }.bind(this), null, 5000, false);
            } else {
                var data = new ChatData(GameManager.user.playerId, GameManager.user.userName, this.pokerGame.gameData.channelId, chatString);
                ServerCom.pomeloRequest(K.PomeloAPI.chatRequest, data, function(response) {
                    if (response.success) {
                        // if (GameScreen.isMobile)// 
                        //     this.enableotherPopup();
                    }
                }.bind(this), null, 5000, false);
            }

            this.chatLbl.string = "";
            this.chatLbl.string = this.chatLbl.string.trim();
            if (!GameScreen.isMobile)
                this.chatLbl.setFocus();
        }
        this.pokerGame.presenter.onClose();
    },

    registerBroadcast: function() {
        if (!this.pokerGame) {
            this.pokerGame = this.pokerModel.getComponent('PokerModel');
        }
        this.pokerGame.off(K.PokerEvents.OnChat, this.onChat.bind(this));
        this.pokerGame.on(K.PokerEvents.OnChat, this.onChat.bind(this));
    },

    getPlayerName(playerId) {
        for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
            if (this.pokerGame.gameData.tableDetails.players[i].playerId == playerId) {
                return this.pokerGame.gameData.tableDetails.players[i].playerName;
            }
        }
        return "N/A";
    },

    getPlayerAvatar(playerId) {
        for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
            if (this.pokerGame.gameData.tableDetails.players[i].playerId == playerId) {
                return this.pokerGame.gameData.tableDetails.players[i].imageAvtar;
            }
        }
        return null;
    },

    onChat: function(response) {
        let message = this.getPlayerName(response.playerId) + "|" + response.message + "|" + (Number(response.profileImage)) + "|" + response.playerId;
        this.showMessages(message);
    },
});