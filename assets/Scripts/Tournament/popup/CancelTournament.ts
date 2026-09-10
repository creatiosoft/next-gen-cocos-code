import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

@ccclass
export default class CancelTournament extends PopUpBase {

    @property(cc.Label) tournamentNameLabel: cc.Label = null!;
    @property(cc.Label) dateLabel: cc.Label = null!;
    @property(cc.Label) timeLabel: cc.Label = null!;
    @property(cc.Label) registeredLabel: cc.Label = null!;
    @property(cc.Label) settlementLabel: cc.Label = null!;
    @property(cc.Label) infoMessageLabel: cc.Label = null!;

    private static readonly MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    private _formatDate(ts: number): string {
        const d = new Date(ts);
        return `${d.getDate()} ${CancelTournament.MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }

    private _formatTime(ts: number): string {
        const d = new Date(ts);
        const h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
    }

    onShow(data: any) {
        this.pokerPresenter = data.pokerPresenter
        data = data.data;
        const gm = (window as any).GameManager;
        if (gm) gm.emit("hideJoinSimlar");

        if (this.tournamentNameLabel) {
            this.tournamentNameLabel.string = data.tournamentName || "";
        }

        const cancelledMs: number = data.cancelledAt ? new Date(data.cancelledAt).getTime() : 0;
        if (this.dateLabel) {
            this.dateLabel.string = cancelledMs ? this._formatDate(cancelledMs) : "";
        }
        if (this.timeLabel) {
            this.timeLabel.string = cancelledMs ? this._formatTime(cancelledMs) : "";
        }

        if (this.registeredLabel) {
            const count = data.registeredCount ?? data.totalRegisteredPlayers ?? 0;
            this.registeredLabel.string = `${count} Registered`;
        }

        const settlement: string = (data.settlementType ?? data.settlement_type ?? "").toLowerCase();
        const isEqualPrize = settlement.includes("equal");

        if (this.settlementLabel) {
            this.settlementLabel.string = isEqualPrize ? "Equal Prize Distribution" : "Fully Refunded";
        }

        if (this.infoMessageLabel) {
            this.infoMessageLabel.string = isEqualPrize
                ? "Your payout is being processed and will be credited to your account shortly."
                : "Your refund is being processed and will be credited to your account shortly.";
        }
    }

    onOk() {
        (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.TournamentCancelled);        
        const gm = (window as any).GameManager;
        if (gm) gm.emit("showJoinSimlar");
        const gs = (window as any).GameScreen;
        this.pokerPresenter.getComponent("PokerPresenter").model.kickPlayerOutOfTheGame(this.pokerPresenter.getComponent("PokerPresenter").model);
        this.pokerPresenter.getComponent("PokerPresenter").leaveTable();
    }
}
