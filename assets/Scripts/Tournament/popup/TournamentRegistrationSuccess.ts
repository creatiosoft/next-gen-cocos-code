const { ccclass, property } = cc._decorator;
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

@ccclass
export default class TournamentRegistrationSuccess extends PopUpBase {

    @property(cc.Label) tournamentName
        : cc.Label = null!;
    @property(cc.RichText) warningRichText: cc.RichText = null!;

    private _fmtDuration(totalSeconds: number): string {
        const s = Math.abs(Math.round(totalSeconds));
        if (s < 60) {
            return s === 1 ? '1 second' : `${s} seconds`;
        }
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) {
            let r = h === 1 ? '1 hour' : `${h} hours`;
            if (m > 0) r += ` ${m === 1 ? '1 minute' : `${m} minutes`}`;
            if (sec > 0) r += ` ${sec === 1 ? '1 second' : `${sec} seconds`}`;
            return r;
        }
        let r = m === 1 ? '1 minute' : `${m} minutes`;
        if (sec > 0) r += ` ${sec === 1 ? '1 second' : `${sec} seconds`}`;
        return r;
    }

    onEnable() {
        cc.game.on(cc.game.EVENT_HIDE, this.onOk, this);
    }

    onDisable() {
        cc.game.off(cc.game.EVENT_HIDE, this.onOk, this);
    }

    onShow(data) {
        let tourData = data.tourData;
        let serverRes = data.serverRes;
        this.node.active = true;
        const raw = tourData;

        if (this.tournamentName) {
            const name = serverRes?.tournamentName || tourData?.tournamentName || raw?.tournamentName || "";
            this.tournamentName.string = `"${name}"`;
        }

        if (this.warningRichText) {
            const freezTime = serverRes?.freezTime;
            const startTime = serverRes?.tournamentStartTime;
            let totalSeconds: number;
            if (freezTime && startTime) {
                totalSeconds = (new Date(startTime).getTime() - new Date(freezTime).getTime()) / 1000;
            } else {
                totalSeconds = raw?.unregisterBeforeStartTime ?? raw?.lateRegistrationTime ?? 60;
            }
            const formatted = this._fmtDuration(totalSeconds);
            this.warningRichText.string =
                `<color=#FFFFFF>Cannot unregister within </c><color=#4CAF50>${formatted}</c><color=#FFFFFF> before tournament starts.</c>`;
        }
    }

    onOk() {
        (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.TournamentRegistrationSuccess);        
    }
}
