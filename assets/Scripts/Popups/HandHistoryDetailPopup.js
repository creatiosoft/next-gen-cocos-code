var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        itemPrefab: {
            default: null,
            type: cc.Prefab,
        },
        cardPrefab: {
            default: null,
            type: cc.Prefab,
        },
        winnerPrefab: {
            default: null,
            type: cc.Prefab,
        },
        actionPrefab: {
            default: null,
            type: cc.Prefab,
        },
        contentParent: {
            default: null,
            type: cc.Node,
        },
        historyText: {
            default: null,
            type: cc.Node
        },
        contentToMove: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.index = 0;
        this.items = [];
        this.data = [];
        this._historyNodes = [];
        this._scrollView = null;
    },

    start() {
        this.historyTextOpened = false;
        this.dataIndex = 0;
    },

    // ======================== 创建相关 ========================

    createHistory() {
        this._clearAllHistoryNodes();
        // Max 10 hands: build every page while the loading spinner is up so
        // arrow clicks only toggle visibility.
        for (let i = 0; i < this.data.length; i++) {
            this._ensureHistoryItem(i);
        }
    },

    _ensureHistoryItem(index) {
        if (index < 0 || index >= this.data.length) {
            return null;
        }

        if (this._historyNodes[index] && cc.isValid(this._historyNodes[index])) {
            return this._historyNodes[index];
        }

        let node = this._createOneHistoryItem(index);
        this._historyNodes[index] = node;
        return node;
    },

    /**
     * 创建单条历史记录（完整逻辑）
     */
    _createOneHistoryItem(z) {
        let data = this.data[z];
        if (!data) return null;

        var contentParent = cc.instantiate(this.itemPrefab);
        contentParent.x = 0;
        contentParent.active = false;
        contentParent.parent = this.contentToMove;

        cc.find("Cards/pot", contentParent).getComponent(cc.Label).string = data.handHistory.summary.totalPot.toFixed(2);
        var boardCardParent = cc.find("Cards/BoardCardContainer", contentParent);
        boardCardParent.removeAllChildren(true);
        this.createCards(data.handHistory.summary.boardCard, boardCardParent);

        // winners
        cc.find("Winners", contentParent).removeAllChildren(true);
        if (data.handHistory.summary.playersCards) {
            for (var i = 0; i < data.handHistory.summary.playersCards.length; i++) {
                let winner = data.handHistory.summary.playersCards[i];
                var winnerInstance = cc.instantiate(this.winnerPrefab);
                winnerInstance.x = 0;
                winnerInstance.active = true;
                cc.find("Winners", contentParent).addChild(winnerInstance);

                var boardCardParent = cc.find("MyCardContainer", winnerInstance);
                boardCardParent.removeAllChildren(true);

                for (var k = 0; k < winner.cards.length; k++) {
                    if (!winner.cards[k]) {
                        this.generateCard(boardCardParent, winner.cards[k]);
                    } else {
                        winner.cards[k].point = winner.cards[k].rank;
                        winner.cards[k].pointName = winner.cards[k].name;
                        winner.cards[k].suit = this.getSuit(winner.cards[k].type);
                        this.generateCard(boardCardParent, winner.cards[k]);
                    }
                }

                cc.find("name", winnerInstance).getComponent(cc.Label).string = winner.playerName ? winner.playerName : "???";
                let www = winner.winning.toFixed(2);
                cc.find("winning", winnerInstance).getComponent(cc.Label).string = (www > 0 ? "+" : "") + www;

                if (www >= 0) {
                    cc.find("winning", winnerInstance).color = new cc.Color().fromHEX("#0E632A");
                } else {
                    cc.find("winning", winnerInstance).color = new cc.Color().fromHEX("#FF0000");
                }

                cc.find("set", winnerInstance).getComponent(cc.Label).string = '';
            }
        }

        cc.find("Actions", contentParent).removeAllChildren(true);
        if (data.handHistory.PREFLOP) {
            if (data.handHistory.PREFLOP.actions) {
                this.makeActions(data.handHistory.PREFLOP.actions, cc.find("Actions", contentParent));
            }
        }

        // FLOP
        cc.find("Flop/BoardCardContainer", contentParent).removeAllChildren(true);
        cc.find("Actions1", contentParent).removeAllChildren(true);
        cc.find("Actions1", contentParent).height = 0;
        if (data.handHistory.FLOP) {
            this.createCards(data.handHistory.FLOP.boardCard, cc.find("Flop/BoardCardContainer", contentParent));
            if (data.handHistory.FLOP.actions) {
                this.makeActions(data.handHistory.FLOP.actions, cc.find("Actions1", contentParent));
            }
        }

        // TURN
        cc.find("Turn/BoardCardContainer", contentParent).removeAllChildren(true);
        cc.find("Actions2", contentParent).removeAllChildren(true);
        cc.find("Actions2", contentParent).height = 0;
        if (data.handHistory.TURN) {
            this.createCards(data.handHistory.TURN.boardCard, cc.find("Turn/BoardCardContainer", contentParent));
            if (data.handHistory.TURN.actions) {
                this.makeActions(data.handHistory.TURN.actions, cc.find("Actions2", contentParent));
            }
        }

        // RIVER
        cc.find("River/BoardCardContainer", contentParent).removeAllChildren(true);
        cc.find("Actions3", contentParent).removeAllChildren(true);
        cc.find("Actions3", contentParent).height = 0;
        if (data.handHistory.RIVER) {
            this.createCards(data.handHistory.RIVER.boardCard, cc.find("River/BoardCardContainer", contentParent));
            if (data.handHistory.RIVER.actions) {
                this.makeActions(data.handHistory.RIVER.actions, cc.find("Actions3", contentParent));
            }
        }

        return contentParent;
    },

    _clearAllHistoryNodes() {
        for (let i = 0; i < this._historyNodes.length; i++) {
            let node = this._historyNodes[i];
            if (node && cc.isValid(node)) {
                node.destroy();
            }
        }
        this._historyNodes = [];
        if (this.contentToMove) {
            this.contentToMove.removeAllChildren(true);
        }
    },

    _getScrollView() {
        if (this._scrollView && cc.isValid(this._scrollView.node)) {
            return this._scrollView;
        }
        let n = this.contentToMove;
        while (n) {
            let sv = n.getComponent(cc.ScrollView);
            if (sv) {
                this._scrollView = sv;
                return sv;
            }
            n = n.parent;
        }
        return null;
    },

    /**
     * Item / content were built while inactive, so Layout and Widget have not
     * run. Force them this frame so the page is already sized when it appears.
     */
    _refreshLayouts(root) {
        if (!root || !cc.isValid(root)) {
            return;
        }

        let widgets = root.getComponentsInChildren(cc.Widget);
        for (let i = 0; i < widgets.length; i++) {
            if (widgets[i].enabled) {
                widgets[i].updateAlignment();
            }
        }

        let layouts = root.getComponentsInChildren(cc.Layout);
        for (let i = layouts.length - 1; i >= 0; i--) {
            layouts[i].updateLayout();
        }

        let contentLayout = this.contentToMove.getComponent(cc.Layout);
        if (contentLayout) {
            contentLayout.updateLayout();
        }
    },

    // ======================== 显示 / 切换 ========================

    updateHistory() {
        let data = this.data[this.dataIndex];
        if (!data) {
            return;
        }

        this._ensureHistoryItem(this.dataIndex);

        for (let i = 0; i < this._historyNodes.length; i++) {
            let node = this._historyNodes[i];
            if (node && cc.isValid(node)) {
                node.active = (i === this.dataIndex);
            }
        }

        let current = this._historyNodes[this.dataIndex];
        if (current) {
            current.opacity = 255;
            this._refreshLayouts(current);
        }

        let sv = this._getScrollView();
        if (sv) {
            sv.stopAutoScroll();
            sv.scrollToTop(0);
        }

        cc.find("foot/hand", this.node).getComponent(cc.Label).string = "Hand: #" + data.handId;
        cc.find("foot/page", this.node).getComponent(cc.Label).string = (this.dataIndex + 1) + " of " + this.data.length;
    },

    // ======================== 原有工具方法 ========================

    makeActions(actions, parent) {
        for (var i = 0; i < actions.length; i++) {
            let action = actions[i];
            if (action.action == "startGame" ||
                action.action == "Join Channel" ||
                action.action == "leave" ||
                action.action == "roundOver" ||
                action.action == undefined ||
                action.action == null ||
                action.playerName == undefined) {
                continue;
            }
            var actionNode = cc.instantiate(this.actionPrefab);
            actionNode.x = 0;
            actionNode.active = true;
            parent.addChild(actionNode);

            cc.find("name", actionNode).getComponent(cc.Label).string = action.playerName;
            if (action.chips) {
                cc.find("v", actionNode).getComponent(cc.Label).string = (Number(action.chips).toFixed(2) > 0 ? "" + Number(action.chips).toFixed(2) : Number(action.chips).toFixed(2));
            } else {
                cc.find("v", actionNode).getComponent(cc.Label).string = '';
            }

            if (!action.title || action.title == "") {
                cc.find("title", actionNode).active = false;
            } else {
                cc.find("title", actionNode).active = true;
                cc.find("title/name", actionNode).getComponent(cc.Label).string = action.title;
            }

            cc.find("check", actionNode).active = false;
            cc.find("allin", actionNode).active = false;
            cc.find("call", actionNode).active = false;
            cc.find("fold", actionNode).active = false;
            cc.find("raise", actionNode).active = false;
            cc.find("bet", actionNode).active = false;
            cc.find("bb", actionNode).active = false;
            cc.find("sb", actionNode).active = false;
            if (action.action == "CHECK") {
                cc.find("check", actionNode).active = true;
            } else if (action.action == "ALLIN") {
                cc.find("allin", actionNode).active = true;
            } else if (action.action == "CALL") {
                cc.find("call", actionNode).active = true;
            } else if (action.action == "FOLD") {
                cc.find("fold", actionNode).active = true;
            } else if (action.action == "RAISE") {
                cc.find("raise", actionNode).active = true;
            } else if (action.action == "BET") {
                cc.find("bet", actionNode).active = true;
            } else if (action.action == "SB") {
                cc.find("sb", actionNode).active = true;
            } else if (action.action == "BB") {
                cc.find("bb", actionNode).active = true;
            }
        }
    },

    getSuit: function(suit) {
        if (suit === "spade") {
            return K.Suit.Spade;
        } else if (suit === "heart") {
            return K.Suit.Heart;
        } else if (suit === "club") {
            return K.Suit.Club;
        } else if (suit === "diamond") {
            return K.Suit.Diamond;
        } else {}
    },

    createCards(cardsArr, boardCardParent) {
        if (!!cardsArr) {
            let numCards = this.countCards(cardsArr);
            let numBoard1Cards = this.countBoard1Cards(cardsArr);
            let numBoard2Cards = this.countBoard2Cards(cardsArr);

            let isDouble = false;
            if (numBoard1Cards > 0 && numBoard1Cards == numBoard2Cards) {
                isDouble = true
            }

            if (isDouble) {
                for (var j = 0; j < cardsArr.length; j++) {
                    for (var l = 0; l < 5; l++) {
                        if (!!cardsArr[j][l]) {
                            this.generateCard(boardCardParent, this.pokerGame.getCardByData(cardsArr[j][l]), (j * cardsArr[j].length + l));
                        } else if (cardsArr[j][l] == null) {
                            if (cc.isValid(this.cardPrefab)) {
                                var cardInstance = cc.instantiate(this.cardPrefab);
                                cardInstance.getComponent("Card").onUpdateCardBackImagePatten2();
                                cardInstance.getComponent("Card").reveal(false);
                                cardInstance.opacity = 0;
                                boardCardParent.addChild(cardInstance);
                            }
                        }
                    }
                }
            } else {
                let counter = 0;
                for (var j = 0; j < cardsArr.length; j++) {
                    for (var l = 0; l < cardsArr[j].length; l++) {
                        if (numCards <= 5 && j == 1) {
                            break;
                        }
                        if (!!cardsArr[j][l]) {
                            this.generateCard(boardCardParent, this.pokerGame.getCardByData(cardsArr[j][l]), (j * cardsArr[j].length + l));
                            counter++;
                        } else if (cardsArr[j][l] == null) {
                            if (cc.isValid(this.cardPrefab)) {
                                var cardInstance = cc.instantiate(this.cardPrefab);
                                cardInstance.getComponent("Card").onUpdateCardBackImagePatten2();
                                cardInstance.getComponent("Card").reveal(false);
                                boardCardParent.addChild(cardInstance);
                            }
                        }
                    }
                }
            }
        }
    },

    onShow: function(data) {
        this.pokerGame = data.getComponent("PokerPresenter").model.getComponent('PokerModel');
        GameManager.emit("disablePageView");

        this.sound = data.playSound;

        cc.find('Center', this.node).active = false;
        cc.find('empty', this.node).active = false;
        cc.find('loading', this.node).active = true;
        cc.find('foot', this.node).active = false;

        this.items = [];
        this._clearAllHistoryNodes();

        var inst = this;
        var _data = {
            channelId: this.pokerGame.gameData.channelId,
            access_token: K.Token.access_token,
        };
        var _cb = function(response) {
            if (!inst.node.active) {
                return;
            }

            inst.data = response.data;
            inst.dataIndex = 0;

            if (inst.data.length > 0) {
                cc.find('empty', inst.node).active = false;
                inst.createHistory();
                inst.updateHistory();
                cc.find('Center', inst.node).active = true;
                cc.find('Center', inst.node).opacity = 255;
                cc.find('loading', inst.node).active = false;
                cc.find('foot', inst.node).active = true;
            } else {
                cc.find('Center', inst.node).active = false;
                cc.find('empty', inst.node).active = true;
                cc.find('loading', inst.node).active = false;
                cc.find('foot', inst.node).active = false;
            }
        };
        if (this.pokerGame.presenter && this.pokerGame.presenter.isTournament()) {
            TournamentServerCom.socketIORequest(
                "common|room.channelHandler.getHandHistory",
                _data,
                _cb,
                null, 5000, false
            );
        } else {
            ServerCom.pomeloRequest("room.channelHandler.getHandHistory", _data, _cb, null, 5000, false);
        }
    },

    generateCard: function(parent, card, i, flag = false) {
        if (cc.isValid(this.cardPrefab)) {
            var cardInstance = cc.instantiate(this.cardPrefab);
            cardInstance.getComponent('Card').init((card), this.pokerGame);
            cardInstance.getComponent('Card').reveal(card ? true : false);
            parent.addChild(cardInstance);
        }
    },

    countCards: function(cardsArr) {
        let count = 0;
        for (let i = 0; i < cardsArr.length; i++) {
            for (let j = 0; j < cardsArr[i].length; j++) {
                if (cardsArr[i][j] && cardsArr[i][j] != null) count++;
            }
        }
        return count;
    },

    countBoard1Cards: function(cardsArr) {
        let count = 0;
        let i = 0;
        if (!cardsArr[i]) {
            return 0;
        }
        for (let j = 0; j < cardsArr[i].length; j++) {
            if (cardsArr[i][j] && cardsArr[i][j] != null) count++;
        }
        return count;
    },

    countBoard2Cards: function(cardsArr) {
        let count = 0;
        let i = 1;
        if (!cardsArr[1]) {
            return 0;
        }
        for (let j = 0; j < cardsArr[i].length; j++) {
            if (cardsArr[i][j] && cardsArr[i][j] != null) count++;
        }
        return count;
    },

    onClose: function() {
        this._clearAllHistoryNodes();
        this.data = null;
        this.dataIndex = 0;

        this.closeSelf(function() {});
        if (!GameManager.user.settings.muteGameSound) {
            GameManager.playSound(K.Sounds.click);
        }
    },

    onLeft: function() {
        if (!this.data || this.dataIndex <= 0) {
            return;
        }
        this.dataIndex -= 1;
        this.updateHistory();
    },

    onRight: function() {
        if (!this.data || this.dataIndex >= this.data.length - 1) {
            return;
        }
        this.dataIndex += 1;
        this.updateHistory();
    },
});