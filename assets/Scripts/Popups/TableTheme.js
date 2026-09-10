var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
var CheckBoxType = require('Checkbox');
var GameScreen = require('GameScreen');
var JoinSimilar = require('PostTypes').JoinSimilar;
var Toggle = require('Toggle');

/**
 * @classdesc Manages gamepreferences popUp
 * @class GamePreferencesPopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {
        tablePreview: {
            default: null,
            type: cc.Sprite,
        },
        tableBgPreview: {
            default: null,
            type: cc.Sprite,
        },
        cardPreview: {
            default: null,
            type: cc.Sprite,
        },
        cardBackPreview1: {
            default: null,
            type: cc.Sprite,
        },
        cardBackPreview2: {
            default: null,
            type: cc.Sprite,
        },
        cardBackPreview3: {
            default: null,
            type: cc.Sprite,
        },
        cardBackPreview4: {
            default: null,
            type: cc.Sprite,
        },
        cardBackPreview5: {
            default: null,
            type: cc.Sprite,
        },
        tableTab: {
            default: null,
            type: cc.Node,
        },
        tableBgTab: {
            default: null,
            type: cc.Node,
        },
        cardBackTab: {
            default: null,
            type: cc.Node,
        },
        content: {
            default: null,
            type: cc.Node,
        },
        template: {
            default: null,
            type: cc.Node,
        },
        template2: {
            default: null,
            type: cc.Node,
        },
        template3: {
            default: null,
            type: cc.Node,
        },
        template4: {
            default: null,
            type: cc.Node,
        },
        tableImageSelected: 0,
        tableBgImageSelected: 0,
        cardBackImageSelected: 0,

        tableImageSelectedId: 0,
        tableBgImageSelectedId: 0,
        cardBackImageSelectedId: 0,
    },

    onTableTab: function() {
        var color = cc.Color.BLACK;

        this.tableTab.children[0].active = true;
        this.tableBgTab.children[0].active = false;
        this.cardBackTab.children[0].active = false;

        // this.tableTab.children[1].color = color.fromHEX("#ffffff");
        // this.tableBgTab.children[1].color = color.fromHEX("#000000");
        // this.cardBackTab.children[1].color = color.fromHEX("#000000");

        this.content.removeAllChildren(true);

        for (var i = 0; i < GameManager.tableImages.length; i++) {
            let stickerImages = GameManager.tableImages[i];
            let poolObject = cc.instantiate(this.template);
            poolObject.active = true;
            poolObject.y = 0;
            poolObject.children[0].getComponent(cc.Sprite).spriteFrame = stickerImages;
            poolObject.children[1].getComponent(cc.Label).string = stickerImages.___data.name;
            poolObject.getComponent(cc.Button).clickEvents[0].customEventData = stickerImages.___data;
            poolObject.parent = this.content;

            if (GameManager.user.defaultTheme != "" && GameManager.user.defaultTheme._id) {
                if (stickerImages.___data._id == GameManager.user.defaultTheme._id) {
                    poolObject.children[2].active = true;
                    this.tableImageSelected = i;
                    this.tableImageSelectedId = stickerImages.___data._id;
                };
            }
            else {
                if (i == 0) {
                    poolObject.children[2].active = true;
                    this.tableImageSelected = i;
                    this.tableImageSelectedId = stickerImages.___data._id;
                };
            }
        }
    },

    onTableBgTab: function() {
        var color = cc.Color.BLACK;

        this.tableTab.children[0].active = false;
        this.tableBgTab.children[0].active = true;
        this.cardBackTab.children[0].active = false;

        // this.tableTab.children[1].color = color.fromHEX("#000000");
        // this.tableBgTab.children[1].color = color.fromHEX("#ffffff");
        // this.cardBackTab.children[1].color = color.fromHEX("#000000");

        this.content.removeAllChildren(true);

        for (var i = 0; i < GameManager.tableBgImages.length; i++) {
            let stickerImages = GameManager.tableBgImages[i];
            let poolObject = cc.instantiate(this.template4);
            poolObject.active = true;
            poolObject.y = 0;
            poolObject.children[0].getComponent(cc.Sprite).spriteFrame = stickerImages;
            poolObject.children[1].getComponent(cc.Label).string = stickerImages.___data.name;
            poolObject.getComponent(cc.Button).clickEvents[0].customEventData = stickerImages.___data;
            poolObject.parent = this.content;

            if (GameManager.user.defaultGameBackground != "" && GameManager.user.defaultGameBackground._id) {
                if (stickerImages.___data._id == GameManager.user.defaultGameBackground._id) {
                    poolObject.children[2].active = true;
                    this.tableBgImageSelected = i;
                    this.tableBgImageSelectedId = stickerImages.___data._id;
                };
            }
            else {
                if (i == 0) {
                    poolObject.children[2].active = true;
                    this.tableBgImageSelected = i;
                    this.tableBgImageSelectedId = stickerImages.___data._id;
                };
            }
        }
    },

    onCardTab: function() {
        var color = cc.Color.BLACK;

        this.tableTab.children[0].active = false;
        this.tableBgTab.children[0].active = false;
        this.cardBackTab.children[0].active = false;

        // this.tableTab.children[1].color = color.fromHEX("#000000");
        // this.tableBgTab.children[1].color = color.fromHEX("#000000");
        // this.cardTab.children[1].color = color.fromHEX("#ffffff");
        // this.cardBackTab.children[1].color = color.fromHEX("#000000");
    },

    onCardBackTab: function() {
        var color = cc.Color.BLACK;

        this.tableTab.children[0].active = false;
        this.tableBgTab.children[0].active = false;
        this.cardBackTab.children[0].active = true;

        // this.tableTab.children[1].color = color.fromHEX("#000000");
        // this.tableBgTab.children[1].color = color.fromHEX("#000000");
        // this.cardTab.children[1].color = color.fromHEX("#000000");
        // this.cardBackTab.children[1].color = color.fromHEX("#ffffff");

        this.content.removeAllChildren(true);

        for (var i = 0; i < GameManager.cardBackImages.length; i++) {
            let stickerImages = GameManager.cardBackImages[i];
            let poolObject = cc.instantiate(this.template3);
            poolObject.active = true;
            poolObject.y = 0;
            poolObject.children[0].getComponent(cc.Sprite).spriteFrame = stickerImages;
            poolObject.children[1].getComponent(cc.Label).string = stickerImages.___data.name;
            poolObject.getComponent(cc.Button).clickEvents[0].customEventData = stickerImages.___data;
            poolObject.parent = this.content;

            if (GameManager.user.defaultCard != "" && GameManager.user.defaultCard._id) {
                if (stickerImages.___data._id == GameManager.user.defaultCard._id) {
                    poolObject.children[2].active = true;
                    this.cardBackImageSelected = i;
                    this.cardBackImageSelectedId = stickerImages.___data._id;
                };
            }
            else {
                if (i == 0) {
                    poolObject.children[2].active = true;
                    this.cardBackImageSelected = i;
                    this.cardBackImageSelectedId = stickerImages.___data._id;
                };
            }
        }
    },

    onSelectTable: function(event, msg) {
        this.content.children.forEach((elem) => {
            if (elem == event.target) {
                elem.children[2].active = true;
            }
            else {
                elem.children[2].active = false;
            }
        }, this);

        this.tablePreview.spriteFrame = GameManager.tableImages[msg.___id];
        this.tableImageSelected = msg.___id;
        this.tableImageSelectedId = msg._id;
    },

    onSelectTableBg: function(event, msg) {
        this.content.children.forEach((elem) => {
            if (elem == event.target) {
                elem.children[2].active = true;
            }
            else {
                elem.children[2].active = false;
            }
        }, this);

        this.tableBgPreview.spriteFrame = GameManager.tableBgImages[msg.___id];
        this.tableBgImageSelected = msg.___id;
        this.tableBgImageSelectedId = msg._id;
    },

    onSelectCard: function(event, msg) {

    },

    onSelectCardBack: function(event, msg) {
        this.content.children.forEach((elem) => {
            if (elem == event.target) {
                elem.children[2].active = true;
            }
            else {
                elem.children[2].active = false;
            }
        }, this);

        this.cardBackPreview1.spriteFrame = GameManager.cardBackImages[msg.___id];
        this.cardBackPreview2.spriteFrame = GameManager.cardBackImages[msg.___id];
        this.cardBackPreview3.spriteFrame = GameManager.cardBackImages[msg.___id];
        this.cardBackPreview4.spriteFrame = GameManager.cardBackImages[msg.___id];
        this.cardBackPreview5.spriteFrame = GameManager.cardBackImages[msg.___id];
        this.cardBackImageSelected = msg.___id;
        this.cardBackImageSelectedId = msg._id;
    },

    onApply: function() {
        let self = this;
        let count = 0;
        let request = this.isTournament ? TournamentServerCom.pomeloRequest.bind(TournamentServerCom) : ServerCom.pomeloRequest.bind(ServerCom);

        if (this.tableImageSelectedId != 0) {
            count += 1;
            request("connector.entryHandler.playerChangeTableTheme", {
                "playerId": GameManager.user.playerId,
                "themeId": this.tableImageSelectedId
            }, function (response) {
                console.log("playerChangeTableTheme", response);

                GameManager.user.defaultTheme = response.result;
                GameManager.tableImage = self.tableImageSelected;

                GameManager.emit("updateTableImage");

                count -= 1;
                if (count == 0) {
                    self.onClose();
                }
            });
        }

        if (this.tableBgImageSelectedId != 0) {
            count += 1;
            request("connector.entryHandler.playerChangeGameBackground", {
                "playerId": GameManager.user.playerId,
                "gameBGId": this.tableBgImageSelectedId
            }, function (response) {
                console.log("playerChangeGameBackground", response);

                GameManager.user.defaultGameBackground = response.result;
                GameManager.tableBgImage = self.tableBgImageSelected;

                GameManager.emit("updateTableBgImage");

                count -= 1;
                if (count == 0) {
                    self.onClose();
                }
            });
        }

        if (self.cardBackImageSelectedId != 0) {
            count += 1;
            request("connector.entryHandler.playerChangeCard", {
                "playerId": GameManager.user.playerId,
                "cardId": self.cardBackImageSelectedId
            }, function (response) {
                console.log("playerChangeCard", response);

                GameManager.user.defaultCard = response.result;
                GameManager.cardBackImage = self.cardBackImageSelected;

                GameManager.emit("updateCardBackImage");

                count -= 1;
                if (count == 0) {
                    self.onClose();
                }
            });
        }

    },

    onReset: function() {

        this.onLoad();
    },

    /**
     * @description Manage default states of buttons in popup.
     * @method onShow
     * @param{Object} data
     * @memberof Popups.GamePreferencesPopup#   
     */

    onShow: function (data) {
        GameManager.emit("disablePageView");
        this.pokerPresenter = data;
        this.isTournament = this.pokerPresenter.getComponent("PokerPresenter").isTournament();

        // this.tableLayout.active = !GameScreen.isMobile;
        this.onTableTab();
        // this.tablePreview.spriteFrame = GameManager.tableImages[0];
        this.tablePreview.spriteFrame = GameManager.tableImages[this.tableImageSelected];

        for (var i = 0; i < GameManager.cardBackImages.length; i++) {
            let stickerImages = GameManager.cardBackImages[i];

            if (GameManager.user.defaultCard != "" && GameManager.user.defaultCard._id) {
                if (stickerImages.___data._id == GameManager.user.defaultCard._id) {
                    this.cardBackImageSelected = i;
                    this.cardBackImageSelectedId = stickerImages.___data._id;
                };
            }
            else {
                if (i == 0) {
                    this.cardBackImageSelected = i;
                    this.cardBackImageSelectedId = stickerImages.___data._id;
                };
            }
        }

        this.cardBackPreview1.spriteFrame = GameManager.cardBackImages[this.cardBackImageSelected];
        this.cardBackPreview2.spriteFrame = GameManager.cardBackImages[this.cardBackImageSelected];
        this.cardBackPreview3.spriteFrame = GameManager.cardBackImages[this.cardBackImageSelected];
        this.cardBackPreview4.spriteFrame = GameManager.cardBackImages[this.cardBackImageSelected];
        this.cardBackPreview5.spriteFrame = GameManager.cardBackImages[this.cardBackImageSelected];

        for (var i = 0; i < GameManager.tableBgImages.length; i++) {
            let stickerImages = GameManager.tableBgImages[i];

            if (GameManager.user.defaultGameBackground != "" && GameManager.user.defaultGameBackground._id) {
                if (stickerImages.___data._id == GameManager.user.defaultGameBackground._id) {
                    this.tableBgImageSelected = i;
                    this.tableBgImageSelectedId = stickerImages.___data._id;
                };
            }
            else {
                if (i == 0) {
                    this.tableBgImageSelected = i;
                    this.tableBgImageSelectedId = stickerImages.___data._id;
                };
            }
        }

        this.tableBgPreview.spriteFrame = GameManager.tableBgImages[this.tableBgImageSelected];
    },

    onClose: function (data) {
        GameManager.emit("enablePageView");
        this.closeSelf();
    },
});
