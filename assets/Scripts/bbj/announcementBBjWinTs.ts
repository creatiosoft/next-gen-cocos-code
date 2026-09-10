const { ccclass, property } = cc._decorator;
import { PopUpManager, PopUpType }
    from "../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");

@ccclass
export default class announcementBBjWinTs extends PopUpBase {

    @property(cc.Node) msgLabel: cc.Node = null;

    onShow(data) {
        let data = data;
        this.bbjNotifiy(data);
    }

    bbjNotifiy(data) {
        let widthMax = 300;
        // if (globalThis.K.BBJEnabled) {
        console.log("bbjNotifiy", data);
        if (!globalThis.K.highHandToast) {
            // widthMax = 300;
            // let playerName = data.playerName;
            // let amount = data.amount;
            // console.log("announcement bbj  " + playerName + "  -  " + amount);
            // this.msgLabel.getComponent(cc.RichText).string = `<color=#000000><b>Bad Beat Jackpot: ${playerName} </b></color><color=#808080> has won the Bad Beat Jackpot and received  </color><color=#000000><b>$${amount}</b></color>`;
            let msg = data.message;
            console.log("announcement bbj " + msg);
            this.msgLabel.getComponent(cc.RichText).string = `<color=#000000>${msg}</color>`;
            widthMax = (this.msgLabel.width + 50);
        } else {

            let msg = data.message;
            console.log("announcement high hand  " + msg);
            this.msgLabel.getComponent(cc.RichText).string = `<color=#000000>${msg}</color>`;
            widthMax = (this.msgLabel.width + 50);
        }


        this.msgLabel.parent.opacity = 0;
        this.msgLabel.parent.active = true;

        // this.msgLabel.parent.parent.active = true;
        let startingPoint = cc.view.getVisibleSize().width / 2 + 300
        this.msgLabel.parent.setPosition(startingPoint, this.msgLabel.parent.getPosition().y);
        cc.tween(this.msgLabel.parent)
            .delay(0.2)
            .call(() => {
                this.msgLabel.parent.opacity = 255;
            })
            .to(6, { position: cc.v3((widthMax * -1), this.msgLabel.parent.getPosition().y, 0) }) // .to(6, { position: cc.v3((startingPoint * -1) - widthMax, this.msgLabel.parent.getPosition().y, 0) })
            .call(() => {
                // this.msgLabel.parent.parent.active = false;
                // cc.find("Canvas").getComponent(PopUpManager).hide(PopUpType.BBJWinnerNotifiy, () => { });
                (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.BBJWinnerNotifiy);
                globalThis.K.highHandToastActive = false;
            })
            .start();
        // }
    }

    // update (dt) {}
}
