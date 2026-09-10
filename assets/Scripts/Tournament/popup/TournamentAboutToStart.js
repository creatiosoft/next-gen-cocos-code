var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');


cc.Class({
    extends: PopUpBase,

    properties: {},

    onShow: function (data) {
        this.endTime = data.endTime;
        this._updateLabels();
        this.unschedule(this.gameStartTimer);
        this.schedule(this.gameStartTimer, 1);
    },

    _updateLabels: function () {
        var remainingMs = Math.max(0, this.endTime - new Date().getTime());
        var totalSecs = Math.floor(remainingMs / 1000);
        var mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        var secs = (totalSecs % 60).toString().padStart(2, '0');
        cc.find('Timer/field1/t1/v', this.node).getComponent(cc.Label).string = mins[0];
        cc.find('Timer/field1/t2/v', this.node).getComponent(cc.Label).string = mins[1];
        cc.find('Timer/field2/t3/v', this.node).getComponent(cc.Label).string = secs[0];
        cc.find('Timer/field2/t4/v', this.node).getComponent(cc.Label).string = secs[1];
        return mins + ":" + secs;
    },

    gameStartTimer: function () {
        var now = new Date().getTime();
        if (this.endTime - now <= 0) {
            console.log("[AboutToStart] countdown done — hiding node");
            this.unschedule(this.gameStartTimer);
            this.node.active = false;
            return;
        }
        var timeRemaining = this._updateLabels();
        console.log("[AboutToStart] tick:", timeRemaining);
    }
});
