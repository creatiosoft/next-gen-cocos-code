const { ccclass, property } = cc._decorator;
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

@ccclass
export default class TournamentCancelledPopup extends PopUpBase {

    @property(cc.Label) messageLabel: cc.Label = null!;

    onEnable() {
        cc.game.on(cc.game.EVENT_HIDE, this.onOk, this);
    }

    onDisable() {
        cc.game.off(cc.game.EVENT_HIDE, this.onOk, this);
    }
    onShow(refundAmount) {
        this.node.active = true;
        if (this.messageLabel) {
            this.messageLabel.string = refundAmount
                ? `Buy-in of ${refundAmount} has been refunded to your account`
                : "You have de-registered from the Tournament";
        }
    }

    onOk() {
        (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.TournamentCancelledPopup);
    }
}
