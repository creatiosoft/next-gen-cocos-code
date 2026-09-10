import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddOnPopup extends PopUpBase {

    @property(cc.Label) addonCountLabel: cc.Label = null!;
    @property(cc.Label) timerLabel: cc.Label = null!;
    @property(cc.Label) costLabel: cc.Label = null!;
    @property(cc.Label) chipsLabel: cc.Label = null!;
    @property(cc.Label) balanceLabel: cc.Label = null!;
    @property(cc.Label) activeEntriesLabel: cc.Label = null!;
    @property(cc.Label) avgStackLabel: cc.Label = null!;
    @property(cc.Label) addonsCountLabel: cc.Label = null!;
    @property(cc.Node) confirmBtn: cc.Node = null!;

    private data: any = null;
    private _endTime: number = 0;  // ⬅️ 改为存储目标结束时间戳

    onShow(data: any) {
        if (data == undefined) {

        }
        else {
            this.setData(data);
        }
    }

    setData(data: any) {
        const gm = (globalThis as any).GameManager;
        this.data = data;

        // Add-On count

        const multiplierVal = data.addOnAmount
        const multiplierStr = Number.isInteger(multiplierVal) ? `${multiplierVal}` : `${parseFloat(multiplierVal.toFixed(1))}`;
        const aoChip = data.addOnChip;
        const chipsStr = aoChip >= 1000 ? `${parseFloat((aoChip / 1000).toFixed(1))}k` : `${aoChip}`;

        let multiplierVal = 0;
        if (data.addOnMultiplier > 0) {
            multiplierVal = data.addOnMultiplier;
            const multiplierStr = Number.isInteger(multiplierVal) ? `${multiplierVal}` : `${parseFloat(multiplierVal.toFixed(1))}`;
            this.addonCountLabel.string = `${multiplierStr}x`;
            this.costLabel.string = `${data.addOnTotalFees}`;
        } else {
            this.addonCountLabel.string = `${data?.addOnAmount}+${data.addOnHouseFee}`;
            this.costLabel.string = data.addOnAmount + data.addOnHouseFee;
        }

        // Cost & chips
        this.chipsLabel.string = `${data.addOnChips.toLocaleString()}`;

        // Balance
        this.balanceLabel.string = `${Number(gm.user.realChips.toFixed(2))}`;

        // Confirm button
        const canAfford = gm.user.realChips >= data.addOnAmount;
        if (this.confirmBtn) this.confirmBtn.active = canAfford;

        // Stats
        this.activeEntriesLabel.string = `${data.activeVsEntries}`;
        this.avgStackLabel.string = `${data.avgStack}`;
        this.addonsCountLabel.string = `${data.totalAddons}`;

        // ⬇️⬇️⬇️ 倒计时改为时间戳方式 ⬇️⬇️⬇️
        this.unschedule(this.tickTimer);
        this._endTime = Date.now() + data.timeRemaining * 1000;
        this.tickTimer();
        if (data.timeRemaining > 0) {
            this.schedule(this.tickTimer, 1);
        }
    }

    private tickTimer() {
        if (!this.timerLabel) return;

        const remainingMs = this._endTime - Date.now();

        if (remainingMs <= 0) {
            this.timerLabel.string = '0s';
            this.unschedule(this.tickTimer);
            if (this.confirmBtn) this.confirmBtn.active = false;
            this.scheduleOnce(() => this.onClose(), 1);
            return;
        }

        const secs = Math.ceil(remainingMs / 1000);
        this.timerLabel.string = `${secs}s`;
    }

    onConfirm() {
        const handler = (globalThis as any).TournamentLobbyHandler;
        if (!handler) return;

        if (this.confirmBtn) this.confirmBtn.active = false;

        handler.requestTournamentAddon(
            { tournamentId: this.data.tournamentId },
            (data: any) => {
                console.log("[AddOnPopup] addon success", data);
                // this.closeSelf();
            },
            (err: any) => {
                console.log("[AddOnPopup] addon error", err);
                if (this.confirmBtn) this.confirmBtn.active = true;
            }
        );

        GameManager.emit("AddOnPopupBuy");

        this.unschedule(this.tickTimer);
        this.closeSelf();
    }

    onClose() {
        this.hideSelf();
    }
}
