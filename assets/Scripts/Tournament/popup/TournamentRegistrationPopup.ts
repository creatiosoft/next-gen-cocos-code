import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

@ccclass
export default class TournamentRegistrationPopup extends PopUpBase {

    @property(cc.Label) balanceLabel: cc.Label = null!;
    @property(cc.Label) regAmountLabel: cc.Label = null!;
    @property(cc.Label) feeAmountLabel: cc.Label = null!;
    @property(cc.Label) countdownLabel: cc.Label = null!;   // "20 mins" / "2 hours" / "3 days"
    @property(cc.Node) messageNode: cc.Node = null!;        // "left to start the game"

    @property(cc.Node) confirmBtn: cc.Node = null!;
    @property(cc.Node) addCashBtn: cc.Node = null!;
    @property(cc.Node) addCashNode: cc.Node = null!;

    private _tourData: any = null;
    private _type: number = 1;
    public testingMode: boolean = false;

    // 倒计时相关
    private _countdownStartTime: number = 0;      // 比赛开始的时间戳(ms)
    private _countdownCallback: Function | null = null;

    // type: 1=Register  2=LateRegister  3=ReEntry  4=DirectRegister
    // setData(tourData: any, type: number) {
    onShow(data) {
        let tourData = data.tourData;
        let type = data.type;

        if (!tourData) return;
        this._tourData = tourData;
        this._type = type;

        const raw = tourData;
        const gm = (globalThis as any).GameManager;

        if (this.balanceLabel) {
            this.balanceLabel.string = `${Number(gm.user.realChips.toFixed(2))}`;
        }

        let regAmount = 0;
        let feeAmount = 0;

        if (type === 3) {
            regAmount = raw.reentryPrice?.reentryAmount ?? 0;
            feeAmount = raw.reentryPrice?.reentryHouseFee ?? 0;
        } else {
            regAmount = raw.entryFees ?? 0;
            feeAmount = raw.houseFees ?? 0;
        }
        console.log("[TournamentRegistrationPopup] setData", regAmount, feeAmount, raw);

        if (this.regAmountLabel) this.regAmountLabel.string = `${regAmount} (Reg.)`;
        if (this.feeAmountLabel) this.feeAmountLabel.string = `${feeAmount} (Fee)`;

        const canAfford = gm.user.realChips >= (regAmount + feeAmount);
        if (this.confirmBtn) this.confirmBtn.active = canAfford;
        if (this.addCashBtn) this.addCashBtn.active = !canAfford;
        if (this.addCashNode) this.addCashNode.active = !canAfford;

        const _st = raw.tournamentStartDetails?.startTime ?? raw.tournamentStartTime ?? 0;
        const startTimeMs = _st ? new Date(_st).getTime() : 0;

        // 启动动态倒计时
        if (type == 1 || type == 4) {
            this.startCountdown(startTimeMs);
        }
        else {
            this.countdownLabel.string = "";
            this.messageNode.active = false;
        }
    }

    /**
     * 启动倒计时定时器
     * @param startTime 比赛开始的时间戳(ms)
     */
    private startCountdown(startTime: number) {
        // 先停掉旧的（防止重复 setData 导致多个定时器）
        this.stopCountdown();

        this._countdownStartTime = startTime;

        // 立即刷新一次，避免第一帧空白
        this.refreshCountdown();

        // 每 0.5 秒刷新一次，切后台回来也能正确显示
        this._countdownCallback = () => {
            this.refreshCountdown();
        };
        this.schedule(this._countdownCallback, 0.5);
    }

    /**
     * 停止倒计时定时器
     */
    private stopCountdown() {
        if (this._countdownCallback) {
            this.unschedule(this._countdownCallback);
            this._countdownCallback = null;
        }
    }

    /**
     * 根据当前时间计算剩余时间并更新 label
     */
    private refreshCountdown() {
        if (!this.countdownLabel) return;

        const remaining = Math.max(0, this._countdownStartTime - Date.now());

        if (remaining <= 0) {
            // 倒计时结束
            this.countdownLabel.string = "";
            if (this.messageNode) this.messageNode.active = false;
            this.stopCountdown();
            this.onClose();
            return;
        }

        if (this.messageNode) this.messageNode.active = true;

        const totalSeconds = Math.floor(remaining / 1000);
        const totalDays = Math.floor(totalSeconds / 86400);
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        if (totalDays >= 2) {
            this.countdownLabel.string = `${totalDays} days`;
        } else if (totalHours >= 2) {
            this.countdownLabel.string = `${totalHours} hours`;
        } else if (totalMins >= 1) {
            this.countdownLabel.string = secs > 0 ? `${totalMins} min ${secs} sec` : `${totalMins} min`;
        } else {
            this.countdownLabel.string = `${secs} sec`;
        }
    }

    onConfirm() {
        console.log("[TournamentRegistrationPopup] onConfirm", this._tourData, this._type);
        if (!this._tourData) return;
        const raw = this._tourData;
        const tournamentId = this._tourData.id ?? raw._id;
        const handler = (globalThis as any).TournamentLobbyHandler;

        const onSuccess = (data: any) => {
            console.log("[TournamentRegistrationPopup] success", data);
            // LateRegister responds with { status: "success" | ... } instead of { success }
            if (data && typeof data.status === 'string' && !('success' in data)) {
                data.success = (data.status === 'success');
                if (!data.info) data.info = data.status;
            }
            if (data?.success === false) {
                const msg = data?.info || data?.response || "Registration failed";
                console.warn("[TournamentRegistrationPopup] failed:", msg);
                (globalThis as any).GameManager?.popUpManager?.show(
                    PopUpType.NotificationPopup, msg, function () { }
                );
                return;
            }
            this.onClose();
            if (this._type !== 2 && this._type !== 3) {
                GameManager.popUpManager.show(PopUpType.TournamentRegistrationSuccess, {"tourData": this._tourData, "serverRes": data});
            }
            GameManager.emit("RegistrationSuccess");
        };
        const onError = (err: any) => {
            console.log("[TournamentRegistrationPopup] error", err);
        };

        // Testing mode — skip API call, show success directly
        if (this.testingMode || !handler) {
            onSuccess({});
            return;
        }

        // Real outcome arrives via tournamentLobbyResponseEvent broadcast (relayed to
        // cc.systemEvent by TournamentLobbyListPresenter), not the request ACK — the
        // ACK only resolves when eventOrigin matches the request's eventName exactly,
        // which these APIs don't satisfy.
        let resEventName = "";
        switch (this._type) {
            case 1:
            case 4:
                resEventName = "Res-Register";
                break;
            case 2:
                resEventName = "Res-LateRegister";
                break;
            case 3:
                resEventName = "Res-ReEntry";
                break;
        }
        if (resEventName) {
            cc.systemEvent.once(resEventName, onSuccess);
        }

        switch (this._type) {
            case 1:
            case 4:
                handler.requestTournamentRegister({ tournamentId }, () => { }, onError);
                break;
            case 2:
                handler.requestTournamentLateRegister({ tournamentId }, () => { }, onError);
                break;
            case 3:
                handler.requestTournamentReEntry({ tournamentId }, () => { }, onError);
                break;
        }
    }

    onAddCash() {

    }

    onClose() {
        // 关闭时停掉定时器，防止泄漏
        this.stopCountdown();
        // this.node.active = false;
        (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.TournamentRegistrationPopup);
    }

    onDestroy() {
        // 兜底清理
        this.stopCountdown();
    }
}
