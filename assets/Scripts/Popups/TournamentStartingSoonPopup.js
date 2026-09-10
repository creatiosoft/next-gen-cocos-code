var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');


cc.Class({
    extends: PopUpBase,

    properties: {
        infoLbl: {
            default: null,
            type: cc.RichText,
        },
    },

    onShow: function (data) {
        this.data = data;
        this.node.y = 200;
        this.node.runAction(cc.moveTo(0.5, new cc.Vec2(0, 185)));

        // 倒计时总秒数
        this.totalSeconds = data.remainingSeconds;
        // 当前剩余秒数（带小数，用于精确计算）
        this.remainingSeconds = this.totalSeconds;
        // 上次更新时间戳
        this.lastUpdateTime = Date.now();

        // 更新显示
        this.updateCountdownDisplay(Math.ceil(this.remainingSeconds));

        // 每帧检测时间差（比每秒回调更可靠）
        this.schedule(this.tickUpdate.bind(this), 0.1);
    },

    tickUpdate: function () {
        var now = Date.now();
        var elapsed = (now - this.lastUpdateTime) / 1000; // 转换为秒
        this.lastUpdateTime = now;

        // 减少剩余时间
        this.remainingSeconds -= elapsed;

        if (this.remainingSeconds <= 0) {
            // 倒计时结束
            this.remainingSeconds = 0;
            this.updateCountdownDisplay(0);
            this.unscheduleAllCallbacks();
            this.onClose();
            return;
        }

        // 向上取整显示（比如还剩 30.1 秒就显示 31s）
        var displaySeconds = Math.ceil(this.remainingSeconds);
        this.updateCountdownDisplay(displaySeconds);
    },

    updateCountdownDisplay: function (seconds) {
        if (seconds > 0) {
            this.infoLbl.string = this.data.message + ' <color=#FDAB2E>(' + seconds + 's)</color>';
        } else {
            this.infoLbl.string = this.data.message + ' <color=#FDAB2E>(0s)</color>';
        }
    },

    onClose: function () {
        this.unscheduleAllCallbacks();
        GameManager.popUpManager.remove(PopUpType.TournamentStartingSoonPopup, function () {});
    },

    onJoin: function() {
        this.onClose();
        if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
            GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
        }  
    }
});