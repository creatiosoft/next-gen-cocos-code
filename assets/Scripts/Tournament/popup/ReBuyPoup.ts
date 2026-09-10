import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

@ccclass
export default class ReBuyPoup extends PopUpBase {

    @property(cc.Label) rebuyChanceLabel: cc.Label = null!;    // "Rebuy Chance: 2"
    @property(cc.Label) timerLabel: cc.Label = null!;          // "149s"

    @property(cc.Label) costLabel: cc.Label = null!;           // "200"
    @property(cc.Label) chipsLabel: cc.Label = null!;          // "24,000"
    @property(cc.Label) balanceLabel: cc.Label = null!;        // "2,600"

    @property(cc.Label) activeEntriesLabel: cc.Label = null!;  // "4/4"
    @property(cc.Label) avgStackLabel: cc.Label = null!;       // "6,000"
    @property(cc.Label) currentLvLateRegLabel: cc.Label = null!; // "Lv2/Lv3"

    @property(cc.Node) confirmBtn: cc.Node = null!;
    @property(cc.Node) insufficientFundsNode: cc.Node = null!;

    private _tourData: any = null;
    private _remainingMs: number = 0;

    onShow(data) {
    	this.pokerPresenter = data.pokerPresenter;

        const gm = (globalThis as any).GameManager;
        if (gm) gm.emit("hideJoinSimlar");
        this.setData(data.tourData);
    }

    setData(tourData: any) {
        console.log("[RebuyPopup] setData | data:", tourData);
        if (!tourData) return;
        const raw = tourData.raw || tourData;
        const gm = (globalThis as any).GameManager;

        this._tourData = tourData;

        // Rebuy chance
        // const rebuyChance = raw.rebuysRemaining ?? raw.reentry?.rebuysRemaining ?? raw.reentry?.reentryCount ?? raw.rebuyCount ?? 0;
        const rebuyChance = tourData.rebuysRemaining;
        if (this.rebuyChanceLabel) {
            this.rebuyChanceLabel.string = `${rebuyChance}`;
        }

        // Cost & chips — new flat payload fields take priority
        const cost = raw.rebuyTotalFees ?? raw.rebuyFees ?? raw.reentry?.reentryPrice?.reentryAmount ?? raw.rebuyAmount ?? 0;
        const chips = raw.rebuyChips ?? raw.reentry?.reentryChips ?? 0;
        if (this.costLabel) this.costLabel.string = `${cost}`;
        if (this.chipsLabel) this.chipsLabel.string = `${chips.toLocaleString()}`;

        // Balance
        if (this.balanceLabel) {
            this.balanceLabel.string = `${Number((gm?.user?.realChips ?? 0).toFixed(2))}`;
        }

        if (this.insufficientFundsNode) {
            const canAfford = (gm?.user?.realChips ?? 0) >= cost;
            this.insufficientFundsNode.active = !canAfford;
        }
        // Confirm button
        if (this.confirmBtn) this.confirmBtn.active = (gm?.user?.realChips ?? 0) >= cost;

        // Active/Entries — new payload sends "2/2" string directly
        if (this.activeEntriesLabel) {
            if (raw.activeVsEntries) {
                this.activeEntriesLabel.string = raw.activeVsEntries;
            } else {
                const active = raw.activePlayers ?? raw.uniqueEntries ?? 0;
                const entries = raw.totalEntries ?? raw.maxPlayers ?? active;
                this.activeEntriesLabel.string = `${active}/${entries}`;
            }
        }

        // Avg Stack
        const avgStack = raw.avgStack ?? 0;
        if (this.avgStackLabel) this.avgStackLabel.string = `${avgStack.toLocaleString()}`;

        // Current Level / Late Reg Level — currentBlindLevel may be a number (level) or object {level}
        const currentLv = typeof raw.currentBlindLevel === 'object'
            ? (raw.currentBlindLevel?.level ?? 0)
            : (raw.currentBlindLevel ?? raw.currentLevel ?? 0);
        const lateRegLv = raw.lateRegLevel ?? raw.lateRegistrationTime ?? 0;
        if (this.currentLvLateRegLabel) {
            this.currentLvLateRegLabel.string = `Lv${currentLv}/Lv${lateRegLv}`;
        }

        // Countdown timer — deadline/rebuyEndTime (epoch ms) > timeRemaining/rebuyTimer (s) > breakTime
        this.unschedule(this.tickTimer);
        const deadline = raw.deadline ?? raw.rebuyEndTime ?? 0;
        const timeRemaining = raw.timeRemaining ?? raw.rebuyTimer ?? 0;
        if (deadline > 0) {
            this._remainingMs = Math.max(0, deadline - Date.now());
        } else if (timeRemaining > 0) {
            this._remainingMs = timeRemaining * 1000;
        } else {
            const breakTime = raw.breakTime ?? raw.rebuyTime ?? 0;
            this._remainingMs = typeof breakTime === 'number' && breakTime > 1000000
                ? Math.max(0, breakTime - Date.now())
                : breakTime;
        }
        this.tickTimer();
        if (this._remainingMs > 0) {
            this.schedule(this.tickTimer, 1);
        }
    }

    private tickTimer() {
        if (!this.timerLabel) return;
        if (this._remainingMs <= 0) {
            this.timerLabel.string = '0s';
            this.unschedule(this.tickTimer);
            if (this.confirmBtn) this.confirmBtn.active = false;
            this.scheduleOnce(() => this.onClose(), 1);
            return;
        }
        const secs = Math.ceil(this._remainingMs / 1000);
        this.timerLabel.string = `${secs}s`;
        this._remainingMs -= 1000;
    }

    private _getTournamentId(): string {
        if (!this._tourData) return '';
        const raw = this._tourData.raw || this._tourData;
        return this._tourData.id ?? raw.tournamentId ?? raw._id ?? '';
    }

    onConfirm() {
        const tournamentId = this._getTournamentId();
        console.log("[RebuyPopup] onConfirm | tournamentId:", tournamentId);
        if (!tournamentId) return;
        if (this.confirmBtn) this.confirmBtn.active = false;
        console.log("[RebuyPopup] onConfirm | emitting ReBuy | tournamentId:", tournamentId);
        TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|ReBuy",
            { tournamentId },
            (res: any) => { console.log("[RebuyPopup] ReBuy success", res); },
            (err: any) => {
                console.warn("[RebuyPopup] ReBuy error", err);
                if (this.confirmBtn) this.confirmBtn.active = true;
            }
        );
        
        this.closeSelf();
    }

    onCancel() {
        const tournamentId = this._getTournamentId();
        console.log("[RebuyPopup] onCancel | emitting CancelRebuy | tournamentId:", tournamentId);
        if (tournamentId) {
            TournamentServerCom.socketIORequest(
                "tournamentLobbyEvent|CancelRebuy",
                { tournamentId },
                (res: any) => { console.log("[RebuyPopup] CancelRebuy success", res); },
                (err: any) => { console.warn("[RebuyPopup] CancelRebuy error", err); }
            );
        }
		this.closeSelf();
    }

    // Server-driven close (rebuyWindowEnded / timer expired) — no socket message.
    onClose() {
        console.log("[RebuyPopup] onClose");
        this.unschedule(this.tickTimer);
        
        const gm = (globalThis as any).GameManager;
        if (gm) gm.emit("showJoinSimlar");

        this.closeSelf();
    }
}
