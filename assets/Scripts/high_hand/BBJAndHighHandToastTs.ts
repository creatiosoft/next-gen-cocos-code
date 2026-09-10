const { ccclass, property } = cc._decorator;
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

@ccclass
export default class BBJAndHighHandToastTs extends PopUpBase {

    @property(cc.Label) msg1: cc.Label = null;
    @property(cc.Label) msg2: cc.Label = null;
    @property(cc.Label) timer: cc.Label = null;
    @property(cc.Sprite) icon: cc.Sprite = null;
    @property(cc.SpriteFrame) iconSpriteFrames: cc.SpriteFrame[] = [];
    @property(cc.Node) msgWithTimer: cc.Node = null;
    @property(cc.Node) msgWithOutTimer: cc.Node = null;

    data: any = null;
    // start() {
    //     this.data = this.node.getComponent("PopUpBase").data;
    //     this.setView();
    // }

    // onEnable() {
    //     this.scheduleOnce(() => {
    //         this.data = this.node.getComponent("PopUpBase").data;
    //         this.setView();
    //     }, 0.001);
    // }

    onShow (data) {
        
        this.data = data;

        this.node.x = 0;
        this.node.y = cc.winSize.height / 2 + 100;

        this.node.runAction(
            cc.sequence(
                cc.moveBy(0.5, new cc.Vec2(0, -150)),
                cc.delayTime(1.8),
                // cc.moveBy(0.5, new cc.Vec2(0, 300))
            )
        );

        this.scheduleOnce(function () {
            this.onClose();
        }, 6);

        this.setView();
    },

    setView() {

        // let withTimer = false;
        // let isBBJ = false;
        // if (this.data.type == "BAD_BEAT_JACKPOT") {
        //     withTimer = false;
        //     isBBJ = true;
        //     this.setMsg(this.data.message);
        // } else 
        // if (this.data.eventOrigin == "highHandUpdate") {
        // if (this.data.event == "EVENT_STARTED" || this.data.event == "ROUND_STARTED" || this.data.event == "ROUND_ENDED" || this.data.event == "EVENT_COMPLETED") {
        //     withTimer = true;
        // }
        // isBBJ = false;
        this.setMsg(this.data.message);
        // }

        this.data = this.node.getComponent("PopUpBase").data;

        this.msgWithTimer.active = false;//withTimer;
        this.msgWithOutTimer.active = true;//!withTimer;

        //0  bbj 1 high hand   icon 
        this.icon.spriteFrame = this.iconSpriteFrames[1]; //isBBJ ? this.iconSpriteFrames[0] : 
    }

    setMsg(data) {
        this.msg1.string = data;
        this.msg2.string = data;
    }

    onClose () {
        GameManager.popUpManager.remove(PopUpType.BBJ_HighHandToast, function () {});
    },

    // update (dt) {}
}
