var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: cc.Component,

    properties: {
        progress: {
            default: null,
            type: cc.ProgressBar,
        },
        logo: {
            default: null,
            type: cc.Node,
        },
        bg: {
            default: null,
            type: cc.Node,
        },
    },

    start () {

        cc.systemEvent.on("LaunchOver", this.toGame.bind(this));

        cc.macro.ENABLE_MULTI_TOUCH = false;

        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "removeSplash", "()V");
        }

        this.timer = 0;
        var size = cc.size(cc.Canvas.instance.node.width, cc.Canvas.instance.node.height);
        var aspect = size.height / size.width;
        // console.log("aspect", aspect);
        if (aspect > 1.5) {
        }
        else {
            this.node.scale = 0.8;
        }

        // this.toGame();
        this.schedule(this.updateProgress);

        // 
        GameManager.popUpManager.show(PopUpType.TXLogin);
    },

    updateProgress(dt) {
        this.timer += dt / 10;
        if (this.timer >= 1) {
            this.timer = 1;
            this.unschedule(this.updateProgress);
        }
        this.progress.progress = this.timer;
    },

    toGame () {
        this.unschedule(this.updateProgress);
        this.progress.progress = 1;
        this.scheduleOnce(() => {
            this.node.removeFromParent(true);
        }, 1);
    }

});
