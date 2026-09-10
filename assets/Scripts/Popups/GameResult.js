var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        contentParent: {
            default: null,
            type: cc.Node,
        },
        players: {
            default: null,
            type: cc.Label,
        },
        playerListContainer: {
            default: null,
            type: cc.Node,
        },

        headerNode: {
            default: null,
            type: cc.Node,
        },

        activePlaer: {
            default: null,
            type: cc.Node,
        },

        bbjHeaderNode: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    start() {
        GameManager.emit("disablePageView");
    },

    render(data) {
        this.bbjHeaderNode.active = K.BBJEnabled;
        
        // this.headerNode.getComponent(cc.Widget).top = K.BBJEnabled ? 272 : 171;
        // this.headerNode.getComponent(cc.Widget).updateAlignment();

        // this.contentParent.getComponent(cc.Widget).top = K.BBJEnabled ? 338 : 238;
        // this.contentParent.getComponent(cc.Widget).updateAlignment();

        // this.activePlaer.getComponent(cc.Widget).top = K.BBJEnabled ? 220 : 119;
        // this.activePlaer.getComponent(cc.Widget).updateAlignment();
        
        if (K.BBJEnabled) {
            this.bbjHeaderNode.children[0].children[0].getComponent(cc.Label).string = `$${K.BBJAmount}`;
        }

        this.contentParent.children.forEach(function(element, i) {
            element.active = false;
        }, this);
        this.playerListContainer.children.forEach(function(element, i) {
            element.active = false;
        }, this);
        if (data && data[0] && data[0].playersResults) {
            this.players.node.parent.active = true;
            let da = data[0].playersResults;
            this.players.string = Object.keys(da).length;
            if (GameManager.isMobile) {
                this.players.string = Object.keys(da).length;
            } else {
                this.players.string = `Players(${Object.keys(da).length})`;
            }
            let i = 0;
            for (var key in da) {
                let d = da[key];
                this.contentParent.children[i].active = true;

                cc.find('name', this.contentParent.children[i]).color = new cc.Color().fromHEX("#FFFFFF");
                cc.find('buy', this.contentParent.children[i]).color = new cc.Color().fromHEX("#FFFFFF");
                cc.find('w', this.contentParent.children[i]).color = new cc.Color().fromHEX("#FFFFFF");

                cc.find('name', this.contentParent.children[i]).getComponent(cc.Label).string = d.playerName || "???";
                cc.find('buy', this.contentParent.children[i]).getComponent(cc.Label).string = d.buyIn.toFixed(2);
                cc.find('w', this.contentParent.children[i]).getComponent(cc.Label).string = (d.winning.toFixed(2) > 0 ? "+" : "") + d.winning.toFixed(2);

                if (d.winning.toFixed(2) >= 0) {
                    cc.find('w', this.contentParent.children[i]).color = new cc.Color().fromHEX("#15DE41");
                } else {
                    cc.find('w', this.contentParent.children[i]).color = new cc.Color().fromHEX("#FF0000");
                }

                if (!GameManager.isMobile && this.playerListContainer) {
                    let playerNode = this.playerListContainer.children[i];
                    playerNode.active = true;
                    playerNode.getChildByName("name").getComponent(cc.Label).string = d.playerName || "???";
                }

                if (GameManager.user.userName == d.playerName) {
                    cc.find('name', this.contentParent.children[i]).color = new cc.Color().fromHEX("#F7C546");
                    cc.find('buy', this.contentParent.children[i]).color = new cc.Color().fromHEX("#F7C546");
                    cc.find('w', this.contentParent.children[i]).color = new cc.Color().fromHEX("#F7C546");
                }

                i += 1;
            }
        } else {
            this.players.string = "";
            this.players.node.parent.active = false;
        }
    },

    onShow: function(data) {
        ServerCom.pomeloRequest("room.channelHandler.getCurrentGameResult", {
            channelId: data,
            access_token: K.Token.access_token,
        }, (response) => {
            this.data = response.data;
            this.render(this.data);
        }, null, 5000, false);
    },

    onClose: function() {
        GameManager.emit("enablePageView");
        this.closeSelf();
        GameManager.emit("showJoinSimlar");
    }

});