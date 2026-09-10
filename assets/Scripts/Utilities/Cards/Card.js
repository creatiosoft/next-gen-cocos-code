/**
 * @namespace Utilities.Cards
 */

/**
 * @classdesc Card Class Generate the cards.
 * @class Card
 * @extends EventEmitter
 * @memberof Utilities.Cards
 */
var EventEmitter = require('EventEmitter');
cc.Class({
    extends: EventEmitter,

    properties: {
        // nodes
        point: {
            default: null,
            type: cc.Label
        },

        bigSuit: {
            default: null,
            type: cc.Sprite
        },

        smallSuit: {
            default: null,
            type: cc.Sprite
        },

        backFace: {
            default: null,
            type: cc.Sprite
        },


        frontFace: {
            default: null,
            type: cc.Sprite
        },

        texFaces: {
            default: [],
            type: cc.SpriteFrame
        },

        texRedFaces: {
            default: [],
            type: cc.SpriteFrame
        },

        texBlueFaces: {
            default: [],
            type: cc.SpriteFrame
        },

        texGreenFaces: {
            default: [],
            type: cc.SpriteFrame
        },

        texSuitBig: {
            default: [],
            type: cc.SpriteFrame
        },

        texSuitSmall: {
            default: [],
            type: cc.SpriteFrame
        },

        suit: {
            default: null,
        },
        suitName: {
            default: null,
        },
        isFaceCard: {
            default: false,
        },
        cardColorChangeCb: {
            default: null,
        },

        selectedNode: {
            default: null,
            type: cc.Node
        },

        cardRank: 0,

        redTextColor: cc.Color.WHITE,
        blackTextColor: cc.Color.WHITE,
        blueTextColor: cc.Color.WHITE,
        greenTextColor: cc.Color.WHITE,
        cardData: null,
        model: null,
        isSelected: false,
        isMyCard: false,
        isCommunityCard: false,
    },

    onLoad: function() {
        this.setOriginalPosition();
        this.selectedEnable(false);
        this.registerHoverEvents();
    },

    registerHoverEvents: function() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touch.bind(this), this);
    },

    unregisterHoverEvents: function() {
        if (this.node && this.node.targetOff) {
            this.node.targetOff(this.node);
        }
    },

    /**
     * @description Actions to be taken after the node is destroyed
     * @method onDestroy
     * @memberof Utilities.Cards.Card#
     */
    onDestroy: function() {
        if (this.model)
            this.model.off(K.GameEvents.onCardColorChange, this.cardColorChangeCb);
        this.selectedEnable(false);

        GameManager.off("updateCardBackImage", this.onUpdateCardBackImage.bind(this));
    },

    /**
     * @description Initialize card
     * @method init
     * @param {Object} card -Object having value of card
     * @param {Object} model -Game Model
     * @memberof Utilities.Cards.Card#
     */
    init: function(card, model, toBePlayerCards = false) {
        this.isMyCard = false;
        this.isCommunityCard = false;
        this.model = model;
        this.toBePlayerCards = toBePlayerCards;
        this.cardColorChangeCb = function(arg, model) {
            if (this.model == model) {
                this.setCardColor(arg);
            }
        }.bind(this);
        if (this.model) {
            this.model.off(K.GameEvents.onCardColorChange, this.cardColorChangeCb);
            this.model.on(K.PokerEvents.onCardColorChange, this.cardColorChangeCb);
        }
        this.onUpdateCardBackImage();
        if (!card) {
            return;
        }
        this.isFaceCard = card.point > 10;
        this.isFaceCard = false;
        this.cardRank = card.point;
        this.suit = card.suit;
        this.suitName = card.suitName;

        if (this.isFaceCard && !this.toBePlayerCards) {
            if (this.suit === K.Suit.Heart || this.suit === K.Suit.Diamond)
                this.bigSuit.spriteFrame = this.texRedFaces[card.point - 10 - 1];
            else {
                this.bigSuit.spriteFrame = this.texFaces[card.point - 10 - 1];
            }
            this.bigSuit.node.setPosition(0, -17.8);
            this.bigSuit.node.getComponent(cc.Widget).left = -0.0015;
            this.bigSuit.node.getComponent(cc.Widget).right = -0.0015;
            this.bigSuit.node.getComponent(cc.Widget).top = 0.2599;
            this.bigSuit.node.getComponent(cc.Widget).bottom = 0;
        } else {
            this.bigSuit.spriteFrame = this.texSuitBig[card.suit - 1];
            this.bigSuit.node.setPosition(10.8, -23.5);
            this.bigSuit.node.getComponent(cc.Widget).left = 0.2530;
            this.bigSuit.node.getComponent(cc.Widget).right = 0.0391;
            this.bigSuit.node.getComponent(cc.Widget).top = 0.3962;
            this.bigSuit.node.getComponent(cc.Widget).bottom = 0.0531;
        }
        this.point.string = card.pointName;
        this.smallSuit.spriteFrame = this.texSuitSmall[card.suit - 1];
        if (this.model && this.model.gameData.settings.cardColor) {
            this.setCardColor(K.CardColoring.FourCardColor);
        } else {
            this.setCardColor(K.CardColoring.TwoCardColor);
        }

        GameManager.off("updateCardBackImage", this.onUpdateCardBackImage.bind(this));
        GameManager.on("updateCardBackImage", this.onUpdateCardBackImage.bind(this));
        this.onUpdateCardBackImage();
        this.smallSuit.node.active = false;
    },

    /**
     * @description Reveal Card
     * @method reveal
     * @param {boolean} isFaceUp 
     * @memberof Utilities.Cards.Card#
     */
    reveal: function(isFaceUp) {
        this.point.node.active = isFaceUp;
        this.bigSuit.node.active = isFaceUp;
        this.smallSuit.node.active = isFaceUp;
        this.frontFace.node.active = isFaceUp;
        this.backFace.node.active = !isFaceUp;
        if (this.backFace.node.active && this.selectedNode) {
            this.selectedNode.active = false;
        }
    },

    /**
     * @description Sets the color of the card
     * @method setCardColor
     * @param {Object} deckSettings - CardColoring values
     * @memberof Utilities.Cards.Card#
     */
    setCardColor: function(deckSettings, pokerModel) {
        if (this.suit === null) {
            return;
        }
        if (deckSettings === K.CardColoring.TwoCardColor) {
            if (!this.isFaceCard || this.toBePlayerCards) {
                if (this.suit === K.Suit.Heart || this.suit === K.Suit.Diamond) {
                    this.bigSuit.node.color = this.redTextColor;
                } else {
                    this.bigSuit.node.color = this.blackTextColor;
                }
            } else {
                if (this.suit === K.Suit.Heart || this.suit === K.Suit.Diamond) {
                    this.bigSuit.spriteFrame = this.texRedFaces[this.cardRank - 10 - 1];
                } else {
                    this.bigSuit.spriteFrame = this.texFaces[this.cardRank - 10 - 1];
                }
            }
            if (this.suit === K.Suit.Heart || this.suit === K.Suit.Diamond) {
                this.point.node.color = this.redTextColor;
                this.smallSuit.node.color = this.redTextColor;
            } else {
                this.point.node.color = this.blackTextColor;
                this.smallSuit.node.color = this.blackTextColor;
            }
        } else {
            if (!this.isFaceCard || this.toBePlayerCards) {
                if (this.suit === K.Suit.Heart) {
                    this.bigSuit.node.color = this.redTextColor;
                } else if (this.suit === K.Suit.Diamond) {
                    this.bigSuit.node.color = this.blueTextColor;
                } else if (this.suit === K.Suit.Spade) {
                    this.bigSuit.node.color = this.blackTextColor;
                } else {
                    this.bigSuit.node.color = this.greenTextColor;
                }
            } else {
                if (this.suit === K.Suit.Heart) {
                    this.bigSuit.spriteFrame = this.texRedFaces[this.cardRank - 10 - 1];
                } else if (this.suit === K.Suit.Diamond) {
                    this.bigSuit.spriteFrame = this.texBlueFaces[this.cardRank - 10 - 1];
                } else if (this.suit === K.Suit.Spade) {
                    this.bigSuit.spriteFrame = this.texFaces[this.cardRank - 10 - 1];
                } else {
                    this.bigSuit.spriteFrame = this.texGreenFaces[this.cardRank - 10 - 1];
                }
            }
            if (this.suit === K.Suit.Heart) {
                this.point.node.color = this.redTextColor;
                this.smallSuit.node.color = this.redTextColor;
            } else if (this.suit === K.Suit.Diamond) {
                this.point.node.color = this.blueTextColor;
                this.smallSuit.node.color = this.blueTextColor;
            } else if (this.suit === K.Suit.Spade) {
                this.point.node.color = this.blackTextColor;
                this.smallSuit.node.color = this.blackTextColor;
            } else {
                this.point.node.color = this.greenTextColor;
                this.smallSuit.node.color = this.greenTextColor;

            }
        }
    },

    touch: function(event) {
        if (this.isCommunityCard || !this.isMyCard) {
            return;
        }
        if (cc.isValid(this.node)) {
            if (GameManager.user.settings.cardSqueeze) {
                GameManager.emit("SQUEEZE_CARDS");
            }
        }
    },

    /**
     * @description Reset the color of card(White).
     * @method resetCardColor
     * @memberof Utilities.Cards.Card#
     */
    resetCardColor: function() {
        this.unregisterHoverEvents();

        this.node.stopAllActions();
        this.frontFace.node.stopAllActions();
        this.backFace.node.stopAllActions();

        this.point.node.color = cc.Color.WHITE;
        this.smallSuit.node.color = cc.Color.WHITE;
        this.bigSuit.node.color = cc.Color.WHITE;
        this.frontFace.node.scaleX = 1;
        this.backFace.node.scaleX = 1;

        this.node.scale = 1;
        this.node.opacity = 255;
        this.node.children[0].getComponent(cc.Sprite).enabled = true;

        this.restoreGray();
        this.reveal(false);
    },

    /**
     * @description Set Cards Original Position
     * @method setOriginalPosition
     * @param {Object|Vec2} pos - Position of card
     * @memberof Utilities.Cards.Card# 
     */
    setOriginalPosition: function(pos) {
        this.originalPosition = this.node.position;
        //  this.originalZorder = this.node.getLocalZOrder();
        this.originalScale = 1;
    },

    /**
     * @description Return Card To Its Original Position
     * @method returnToOriginalPosition
     * @memberof Utilities.Cards.Card#
     */
    returnToOriginalPosition: function() {
        // var mov = cc.moveTo(0.2, new cc.v2(this.originalPosition.x, this.originalPosition.y));
        // this.node.runAction(mov);
        this.node.position = this.originalPosition;
        // this.node.scale = this.originalScale;
        //  this.node.setLocalZOrder(this.originalZorder);
    },

    onUpdateCardBackImage: function() {
        if (this.backFace) {
            for (var i = 0; i < GameManager.cardBackImages.length; i++) {
                let stickerImages = GameManager.cardBackImages[i];
                if (GameManager.user.defaultCard != "" && GameManager.user.defaultCard._id) {
                    if (stickerImages.___data._id == GameManager.user.defaultCard._id) {
                        this.backFace.spriteFrame = GameManager.cardBackImages[i];
                    };
                }
            }
        }
    },

    onUpdateCardBackImagePatten2: function() {
        if (this.backFace) {
            for (var i = 0; i < GameManager.cardBackImages.length; i++) {
                let stickerImages = GameManager.cardBackImages[i];
                if (GameManager.user.defaultCard != "" && GameManager.user.defaultCard._id) {
                    if (stickerImages.___data._id == GameManager.user.defaultCard._id) {
                        this.backFace.spriteFrame = GameManager.cardBackImages[i];
                    };
                }
            }
        }
    },

    selectOnClick() {
        this.isSelected = !this.isSelected;
        this.selectedNode.active = this.isSelected;
    },

    selectedEnable(canSelect) {
        if (canSelect) {
            this.node.off(cc.Node.EventType.TOUCH_END, this.selectOnClick, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.selectOnClick, this);
            this.isSelected = false;
        } else {
            this.node.off(cc.Node.EventType.TOUCH_END, this.selectOnClick, this);
        }
        if (this.frontFace && this.frontFace.node && this.selectedNode) {
            this.selectedNode.active = false;
        }

    },

    flipWithAction() {
        this.point.node.active = true;
        this.bigSuit.node.active = true;
        this.smallSuit.node.active = true;
        this.frontFace.node.scaleX = 0;
        let scaleToZero = cc.scaleTo(0.15, 0, 1);
        let hideBack = cc.callFunc(() => {
            this.backFace.node.active = false;
            this.frontFace.node.active = true;

            let delay = cc.delayTime(0.01);
            let scaleToNormal = cc.scaleTo(0.15, 1, 1);
            let seqFront = cc.sequence(delay, scaleToNormal);
            this.frontFace.node.runAction(seqFront);
        });
        let seqBack = cc.sequence(scaleToZero, hideBack);
        this.backFace.node.runAction(seqBack);
    },

    gray() {
        this.point.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.bigSuit.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.smallSuit.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.backFace.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.frontFace.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
    },

    restoreGray() {
        this.point.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.bigSuit.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.smallSuit.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.backFace.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.frontFace.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
    }

});