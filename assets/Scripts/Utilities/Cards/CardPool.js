/**
 * @classdesc Handles Background process of CardPool like generation, destruction etc.
 * @class CardPool
 * @memberof Utiulities.Cards
 */
cc.Class({
    extends: cc.Component,

    properties: {

        cardPrefabs: {
            default: [],
            type: cc.Prefab
        },
        cardPPrefabs: {
            default: [],
            type: cc.Prefab
        },
        usedCardList: {
            default: [],
            type: cc.Node,
            visible: false
        },
        // cardPool: {
        //     default: [],
        //     type: cc.Node,
        //     visible: false
        // },
        handCardPool: {
            default: [],
            type: cc.Node,
            visible: false
        },
        poolSize: 100
    },

    // use this for initialization
    onLoad: function() {

        this.poolSize = 100;
        window.CardPool = this;
        this.cardPools = new Array(2);
        this.cardPPools = new Array(2);
        this.createPool();
    },
    /**
     * @description Create Card Pool
     * @method createPool
     * @memberof Utiulities.Cards.CardPool#
     */
    createPool: function() {
        this.cardPools[0] = [];
        this.cardPools[1] = [];
        for (var i = 0; i < this.poolSize; i++) {
            // this.scheduleOnce(function () {
            // console.log("Pool initiated times ", i)
            var card = cc.instantiate(this.cardPrefabs[0]);
            card.parent = GameManager.node;
            card.name = this.cardPrefabs[0].name;
            card.active = false;
            this.cardPools[0].push(card);
            var handCard = cc.instantiate(this.cardPrefabs[1]);
            handCard.name = this.cardPrefabs[1].name;
            handCard.parent = GameManager.node;
            handCard.active = false;
            this.cardPools[1].push(handCard);
        }
    },

    /**
     * @description Returns a card from pool
     * @method generateCard
     * @param {prefabName} prefabName card prefab
     * @param {callback} callback
     * @memberof Utiulities.Cards.cardPool#
     * @returns {Object} card 
     */
    generateCard: function(prefabName, callBack) {
        if (!!callBack) {
            callBack();
        }
        if (prefabName == this.cardPrefabs[0].name) {
            if (this.cardPools[0].length == 0) {
                var card = cc.instantiate(this.cardPrefabs[0]);
                card.parent = GameManager.node;
                card.name = this.cardPrefabs[0].name;
                card.active = true;
                this.usedCardList.push(card);
                card.setPosition(cc.Vec2.ZERO);
                card.setScale(1.0);
                for (var i = 0; i < GameManager.cardBackImages.length; i++) {
                    let stickerImages = GameManager.cardBackImages[i];
                    if (GameManager.user.defaultCard != "" && GameManager.user.defaultCard._id) {
                        if (stickerImages.___data._id == GameManager.user.defaultCard._id) {
                            card.getChildByName("BackFace").getComponent(cc.Sprite).spriteFrame = GameManager.cardBackImages[i];
                        };
                    }
                }
                return card;
            }
            var card = this.cardPools[0].pop();
            this.usedCardList.push(card);
            card.active = true;
            card.setPosition(cc.Vec2.ZERO);
            card.getChildByName("FrontFace").color = cc.Color.WHITE;
            card.getChildByName("FrontFace").getChildByName("Big_Suit").color = cc.Color.WHITE;
            card.getChildByName("CardGlow").active = false;
            card.opacity = 255;
            card.setScale(1.0);
            card.rotation = 0;
            card.skewX = 0;
            card.skewY = 0;
            for (var i = 0; i < GameManager.cardBackImages.length; i++) {
                let stickerImages = GameManager.cardBackImages[i];
                if (GameManager.user.defaultCard != "" && GameManager.user.defaultCard._id) {
                    if (stickerImages.___data._id == GameManager.user.defaultCard._id) {
                        card.getChildByName("BackFace").getComponent(cc.Sprite).spriteFrame = GameManager.cardBackImages[i];
                    };
                }
            }
            return card;
        } else if (prefabName == this.cardPrefabs[1].name) {
            var handCard = this.cardPools[1].pop();
            this.usedCardList.push(handCard);
            handCard.active = true;
            return handCard;
        }
    },
    /**
     * @description Destroy Card
     * @method destroyCard
     * @param {Object} card
     * @param {callback} callback 
     * @memberof Utiulities.Cards.CardPool#
     */
    destroyCard: function(card, callBack) {
        if (!!card && (card.name == this.cardPrefabs[0].name || card.name == this.cardPrefabs[1].name)) {
            if (!!callBack) {
                callBack();
                card.getComponent('Card').resetCardColor();
                if (card.__y != undefined) {
                    card.y = card.__y;
                    delete card.__y;
                }
                card.parent = GameManager.node;
                card.opacity = 255;
                card.active = false;
                var cardIndex = this.usedCardList.indexOf(card);
                if (cardIndex !== -1) {
                    if (card.name == this.cardPrefabs[0].name) {
                        this.usedCardList.splice(cardIndex, 1);
                        this.cardPools[0].push(card);

                    } else if (card.name == this.cardPrefabs[1].name) {
                        this.usedCardList.splice(cardIndex, 1);
                        this.cardPools[1].push(card);
                    }
                }
            }
        }
    },
    /**
     * @description Destroy All Cards 
     * @memberof Utiulities.Cards.CadPool#
     * @method destroyAllCards
     * @param {callback} callBack 
     */
    destroyAllCards: function(callBack) {
        if (!!callBack) {
            callBack();
        }
        for (var i = 0; i < this.usedCardList.length; i++) {
            this.usedCardList[i].getComponent('Card').resetCardColor();
            this.usedCardList[i].parent = GameManager.node;
            this.usedCardList[i].active = false;
            if (this.usedCardList[i].name == this.cardPrefabs[0].name) {
                this.cardPools[0].push(this.usedCardList[i]);
            } else if (this.usedCardList[i].name == this.cardPrefabs[1].name) {
                this.cardPools[1].push(this.usedCardList[i]);
            }
        }
        this.usedCardList = [];
    },

    /**
     * @description Handles destruction of all hand card from view
     * @method destroyAllCards
     * @memberof Utiulities.Cards.CardPool#
     * @param {callback} callback
     */
    destroyAllHandCards: function(callBack) {
        if (!!callBack) {
            callBack();
        }
        for (var i = 0; i < this.usedCardList.length; i++) {
            if (this.usedCardList[i].name == this.cardPrefabs[1].name) {
                this.usedCardList[i].getComponent('Card').resetCardColor();
                this.usedCardList[i].parent = GameManager.node;
                this.usedCardList[i].active = false;
                this.cardPools[1].push(this.usedCardList[i]);
                this.usedCardList.splice(i, 1);
            }
        }
    }

});