var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        rebuyAddOnButtonNode: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad() {
        this._onAddOnPopupBuy = this.onAddOnPopupBuy.bind(this);
        GameManager.off("AddOnPopupBuy", this._onAddOnPopupBuy);
        GameManager.on("AddOnPopupBuy", this._onAddOnPopupBuy);
    },

    onAddOnPopupBuy() {
        this.rebuyAddOnButtonNode.active = false;
    },

    onShow(data) {
        if (data.isObserver) {
            this.rebuyAddOnButtonNode.active = false;
        }
        else {
            this.rebuyAddOnButtonNode.active = true;
        }
        this.pokerPresenter = data.pokerPresenter;
        this.endTime = Date.now() + data.timeRemaining;
        this.unschedule(this.gameStartTimer);
        this.schedule(this.gameStartTimer, 1);
        this.gameStartTimer(); // 立即刷新一次
    },

    _updateLabels() {
        const totalSecs = Math.floor(this.remainingMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;

        const mStr = mins.toString().padStart(2, '0');
        const sStr = secs.toString().padStart(2, '0');

        cc.find('Timer/field1/t1/v', this.node).getComponent(cc.Label).string = mStr[0];
        cc.find('Timer/field1/t2/v', this.node).getComponent(cc.Label).string = mStr[1];
        cc.find('Timer/field2/t3/v', this.node).getComponent(cc.Label).string = sStr[0];
        cc.find('Timer/field2/t4/v', this.node).getComponent(cc.Label).string = sStr[1];

        return mStr + ':' + sStr;
    },

    gameStartTimer() {
        const now = Date.now();
        this.remainingMs = this.endTime - now;
        if (this.remainingMs <= 0) {
            this.remainingMs = 0;
            this.unschedule(this.gameStartTimer);
            this._updateLabels();
            GameManager.off("AddOnPopupBuy", this._onAddOnPopupBuy);
            this.closeSelf(function() {});
            console.log('[AboutToStart] timer end');
            return;
        }

        const timeRemaining = this._updateLabels();
        console.log('[AboutToStart] tick:', timeRemaining);
    },

    onShowAddon() {
        GameManager.popUpManager.showIn(PopUpType.AddOnPopup, null, null, this.pokerPresenter.getComponent("PokerPresenter").tablePopupHolder);
    }
});