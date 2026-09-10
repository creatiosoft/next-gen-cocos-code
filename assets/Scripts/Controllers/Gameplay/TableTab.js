var emitter = require('EventEmitter');
/**
 * @class TableTab
 * @classdesc Manages the TableTab during Tiled mode!
 * @memberof Controllers.Gameplay
 */
cc.Class({
    extends: emitter,
    properties: {
        tabId: -1,
        tabNode: {
            default: null,
            type: cc.Node,
        },
        tabActiveNode: {
            default: null,
            type: cc.Node,
        },
        addButton: {
            default: null,
            type: cc.Node,
        },
        activeView: {
            default: null,
            type: cc.Node,
        },
        deactiveView: {
            default: null,
            type: cc.Node,
        },
        activeTableNameLbl: {
            default: null,
            type: cc.Label,
        },
        deactiveTableNameLbl: {
            default: null,
            type: cc.Label,
        },
        turnAlert: {
            default: null,
            type: cc.Node,
        },
        cardPrefab: {
            default: null,
            type: cc.Prefab,
        },
        cardPPrefab: {
            default: null,
            type: cc.Prefab,
        },
        cardParent: {
            default: null,
            type: cc.Node,
        },
        tableColors: {
            default: [],
            type: [cc.SpriteFrame]
        },
        selectedTableColors: {
            default: [],
            type: [cc.SpriteFrame]
        },
        model: null,
        cards: null,
    },

    /**
     * @description  Register callback!
     * @method onLoad
     * @memberof Controllers.Gameplay.TableTab#
     */
    onLoad: function() {
        this.tableColorChange = this.setTableColor.bind(this);
        this.playerCardsChange = this.showCards2.bind(this);
        this.gameOverChange = this.removeCards.bind(this);

        GameManager.on("SQUEEZE_CARDS_ON", this.hideMyCards.bind(this));
        GameManager.on("SQUEEZE_CARDS_OFF", this.showMyCards.bind(this));
    },

    showMyCards: function() {
        this.showCards();
    },

    showCards2: function() {
        this.scheduleOnce(function() {
            this.showCards();
        }, 3);
    },

    hideMyCards: function() {
        this.showCards();
    },

    /**
     * @description Fire event when any Tab is selected!
     * @method onClick
     * @memberof Controllers.Gameplay.TableTab#
     */
    onClick: function() {
        GameManager.playSound(K.Sounds.click);
        //console.log("Clicked " + this.tabId);
        this.emit(K.PokerEvents.onTableTabSelected, this.tabId);
    },

    /**
     * @description Highlight the tab, which is currently being selected;
     * @method onClick
     * @param {Object} data - Object holding the data of table that is to be displayed
     * @memberof Controllers.Gameplay.TableTab#
     */
    setActiveView: function(data, bigBlind, smallBlind) {
        // console.log("TABLE TAB DATA ", data);
        this.scheduleOnce(function() {
            // this.activeTableNameLbl.string = data + ", \n" + smallBlind + "/" + bigBlind;
            this.activeView.active = true;
            this.deactiveView.active = false;
            // console.log("Activating " + data + " " + this.tabId);
        }, 0.1);

    },

    /**
     * @description setDeactive view! switches view
     * @method setDeactiveView
     * @param {Object} data
     * @memberof Controllers.Gameplay.TableTab#
     */
    setDeactiveView: function(data, bigBlind, smallBlind) {
        // console.log("TABLE TAB DATA ", data);
        this.scheduleOnce(function() {
            // this.deactiveTableNameLbl.string = data + ", \n" + smallBlind + "/" + bigBlind;
            this.activeView.active = false;
            this.deactiveView.active = true;
            //console.log("Deactivating " + data + " " + this.tabId);
        }, 0.1);

    },

    /**
     * @description set Model according to current Tab.
     * @method setModel
     * @param {Object} model - Holds the model that is to be displayed. active or deactive model 
     * @memberof Controllers.Gameplay.TableTab#
     */
    setModel: function(model) {
        this.model = model;
        if (!model) return;
        // if (GameScreen.isMobile) {
        this.model.off("FoldEvent", this.gameOverChange);
        this.model.on("FoldEvent", this.gameOverChange);
        this.model.off(K.GameEvents.OnTableColorChange, this.tableColorChange);
        this.model.on(K.GameEvents.OnTableColorChange, this.tableColorChange);
        this.model.off(K.PokerEvents.OnPlayerCard, this.playerCardsChange); // Comment this line in par with changes in CardDistribution to implement TableTab display with forcePlayer cards
        this.model.on(K.PokerEvents.OnPlayerCard, this.playerCardsChange); // Comment this line in par with changes in CardDistribution to implement TableTab display with forcePlayer cards
        this.model.off(K.PokerEvents.OnGameOver, this.gameOverChange);
        this.model.on(K.PokerEvents.OnGameOver, this.gameOverChange);
        this.showCards();
        this.setTableColor();
        // }
    },

    /**
     * @description  display card in Table Tab!
     * @method showCards
     * @param {Object} cards 
     * @memberof Controllers.Gameplay.TableTab#
     */
    showCards: function(cards) {
        this.node.getChildByName("vari").string = "";
        if (this.model && this.model.myCards) {
            GameManager.removeAllChildren(this.cardParent);
            let cardArray = this.model.myCards;
            for (var k = 0; k < cardArray.length; k++) {
                var card = this.model.getCardByData(cardArray[k]);
                var cardInstance = cc.instantiate(this.cardPrefab);
                cardInstance.getComponent('Card').init((card), this.model);
                if (GameManager.user.settings.cardSqueeze) {
                    cardInstance.getComponent('Card').reveal(false);
                } else {
                    cardInstance.getComponent('Card').reveal(true);
                }
                this.cardParent.addChild(cardInstance);
            }

            if (cardArray.length == 0) {
                if (this.model && this.model.gameData) {
                    this.node.getChildByName("vari").getComponent(cc.Label).string = this.model.gameData.roomConfig.channelVariation;
                } else {
                    this.node.getChildByName("vari").getComponent(cc.Label).string = "";
                }
            } else {
                this.node.getChildByName("vari").getComponent(cc.Label).string = "";
            }
        } else {
            if (this.model && this.model.gameData) {
                this.node.getChildByName("vari").getComponent(cc.Label).string = this.model.gameData.roomConfig.channelVariation;
            } else {
                this.node.getChildByName("vari").getComponent(cc.Label).string = "";
            }
        }
    },

    /**
     * @description  Remove cards from grid!
     * @method removeCards
     * @memberof Controllers.Gameplay.TableTab#
     */
    removeCards: function(data) {
        GameManager.removeAllChildren(this.cardParent);

        if (this.model && this.model.gameData) {
            this.node.getChildByName("vari").getComponent(cc.Label).string = this.model.gameData.roomConfig.channelVariation;
        } else {
            this.node.getChildByName("vari").getComponent(cc.Label).string = "";
        }
    },

    playAudio: function(sound) {
        if (!GameManager.user.settings.muteGameSound) {

            GameManager.playSound(sound);
        }
    },



    /**
     * @description show alert in specific Tab!
     * @method showAlert 
     * @param {boolean} val - boolean value to show alert!
     * @memberof Controllers.Gameplay.TableTab#
     */
    showAlert: function(val) {

        if (this.turnAlert)
            this.turnAlert.active = val;
        if (val) {
            this.turnAlert.runAction(cc.repeatForever(cc.blink(1, 1)));
            this.playAudio(K.Sounds.turnSoundTopBar);
        } else {
            if (this.turnAlert)
                this.turnAlert.stopAllActions();
        }
        // console.log("alert sound working")
    },

    /**
     * @description set the table color of Table Tab in  
     * @method setTableColor 
     * @memberof Controllers.Gameplay.TableTab#
     */
    setTableColor: function() {
        if (!!this.model && !!this.model.gameData) {
            var col = this.model.gameData.settings.tableColor + "";
            if (col !== undefined || col !== null) {

                // this.activeView.children[0].getComponent(cc.Sprite).spriteFrame = this.selectedTableColors[col];
                // this.deactiveView.children[0].getComponent(cc.Sprite).spriteFrame = this.tableColors[col];
            }
        }
    },

    joinSimilarTable() {
        GameManager.joinSimilar();
    },
});