var K = require("GameConfig").K;
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
    },

    onShow:function (data) {

        GameManager.emit("showJoinSimlar");

        this.data = data;

        if (this.data.currentBreakDetails) {
            let timeRemaining = GameManager.getMTimeDuration(Number(this.data.currentBreakDetails.breakEndTime));
            cc.find('Timer/field1/t1/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][0];
            cc.find('Timer/field1/t2/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][1];
            cc.find('Timer/field2/t3/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][0];
            cc.find('Timer/field2/t4/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][1];
            this.updateBreakEndsTimer();
        }
        else {
            let timeRemaining = GameManager.getMTimeDuration(Number(this.data.currentTournamentBreak.breakEndTime));
            cc.find('Timer/field1/t1/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][0];
            cc.find('Timer/field1/t2/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][1];
            cc.find('Timer/field2/t3/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][0];
            cc.find('Timer/field2/t4/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][1];
            this.updateBreakEndsTimer();
        }
    },

    updateBreakEndsTimer() {
        this.unschedule(this.breakEndsTimer);
        this.breakEndsTimer();
        this.schedule(this.breakEndsTimer, 1);
    },

    breakEndsTimer() {
        if (this.data.currentBreakDetails) {
            let timeRemaining = GameManager.getMTimeDuration(Number(this.data.currentBreakDetails.breakEndTime));
            cc.find('Timer/field1/t1/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][0];
            cc.find('Timer/field1/t2/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][1];
            cc.find('Timer/field2/t3/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][0];
            cc.find('Timer/field2/t4/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][1];
            if (timeRemaining == "00:00") {
                this.unschedule(this.breakEndsTimer);
                this.closeSelf();
            }
        }
        else {
            let timeRemaining = GameManager.getMTimeDuration(Number(this.data.currentTournamentBreak.breakEndTime));
            cc.find('Timer/field1/t1/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][0];
            cc.find('Timer/field1/t2/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[0][1];
            cc.find('Timer/field2/t3/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][0];
            cc.find('Timer/field2/t4/v', this.node).getComponent(cc.Label).string = timeRemaining.split(":")[1][1];
            if (timeRemaining == "00:00") {
                this.unschedule(this.breakEndsTimer);
                this.closeSelf();
            }
        }
    }
});
