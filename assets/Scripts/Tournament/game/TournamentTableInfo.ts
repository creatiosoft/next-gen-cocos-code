const { ccclass, property } = cc._decorator;

@ccclass
export default class TournamentTableInfo extends cc.Component {

    @property(cc.Label) infoLabel: cc.Label = null!;

    private _presenter: any = null;
    private _blindsUpTarget: number = 0;
    private _breakStartRemaining: number = 0;
    private _fetchedFreshTourData: boolean = false;

    onLoad() {

        this._onTournamentAddonPeriodOver = this.onTournamentAddonPeriodOver.bind(this);
        GameManager.off("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);
        GameManager.on("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);

        this._onTournamentAddonPeriodStart = this.onTournamentAddonPeriodStart.bind(this);
        GameManager.off("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
        GameManager.on("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
    }

    onTournamentAddonPeriodStart(data) {
        const tourRaw = this._presenter?.model?.gameData?.tourData;
        const tournamentId = tourRaw._id;
        if (data.data.eventData.tournamentId == tournamentId) {
            this._presenter?.model?.gameData.tourData?.isAddOn = true;
        }
    }

    onTournamentAddonPeriodOver(data) {
        const tourRaw = this._presenter?.model?.gameData?.tourData;
        const tournamentId = tourRaw._id;
        if (data.data.eventData.tournamentId == tournamentId) {
            this._presenter?.model?.gameData?.tourData?.isAddOn = false;
        }
    }

    setData(presenter: any) {
        this._presenter = presenter;
        const tourRaw = presenter?.model?.gameData?.tourData;
        // console.log('[I2551]', 'setData', 'tourRaw', tourRaw);
        if (tourRaw && this._blindRules(tourRaw).length === 0) {
            // console.log('[I2551]', 'setData', '_fetchFreshTourDataOnce');
            this._fetchFreshTourDataOnce(tourRaw);
        }
        const isInBreak = !!(
            tourRaw?.isInBreak ||
            (tourRaw?.currentTournamentBreak && Object.keys(tourRaw.currentTournamentBreak).length > 0)
        );

        // console.log('[I2551]', 'setData', 'isInBreak', isInBreak);

        if (!this._isGameIdle()) {
            if (isInBreak) {
                this._freezeForReloadDuringBreak(tourRaw);
            } else {
                this._updateBlindTarget();
            }
            this._updateLabel();
        }
        this.unschedule(this._tick);
        this.schedule(this._tick, 1);
    }

    clear() {
        this._fetchedFreshTourData = false;
    }

    private _fetchFreshTourDataOnce(tourRaw: any) {
        if (this._fetchedFreshTourData) return;
        this._fetchedFreshTourData = true;
        const tournamentId = tourRaw?._id ?? this._presenter?.model?.gameData?.tournamentId;
        const sock = (window as any).TournamentSocket;
        if (!tournamentId || !sock) return;

        let handled = false;
        const onFreshData = (data: any) => {
            if (data.eventName !== "Res-GetTournamentData") return;
            if (handled) return;
            handled = true;
            sock.off("tournamentLobbyResponseEvent", onFreshData);
            const inner = data.data || {};
            const freshRaw = inner.response || inner;
            if (!freshRaw || !freshRaw._id) return;;
            this._presenter?.model?.gameData?.tourData = freshRaw;
            this.refresh();
        };
        sock.on("tournamentLobbyResponseEvent", onFreshData);
        (window as any).TournamentLobbyHandler.requestTournamentData(
            { tournamentId },
            () => { },
            () => { sock.off("tournamentLobbyResponseEvent", onFreshData); }
        );
    }

    private _isGameIdle(): boolean {
        const gm = (window as any).GameManager;
        return !!(gm && gm.tableStartTime && gm.tableStartTime > Date.now());
    }

    refresh() {
        if (!this._presenter) return;
        // console.log('[I2551]', 'refresh', '1');
        if (this._isGameIdle()) {
            // console.log('[I2551]', 'refresh', '2');
            this.unschedule(this._tick);
            this.schedule(this._tick, 1);
            return;
        }
        // console.log('[I2551]', 'refresh', '3');
        const tourRaw = this._presenter?.model?.gameData?.tourData;
        const isInBreak = !!(
            tourRaw?.isInBreak ||
            (tourRaw?.currentTournamentBreak && Object.keys(tourRaw.currentTournamentBreak).length > 0)
        );
        // console.log('[I2551]', 'refresh', 'isInBreak', isInBreak);
        if (isInBreak) return;
        // console.log('[I2551]', 'refresh', '_breakStartRemaining', this._breakStartRemaining);
        if (this._breakStartRemaining > 0) {
            // console.log('[I2551]', 'refresh', '4');
            this._blindsUpTarget = Date.now() + this._breakStartRemaining;
            this._breakStartRemaining = 0;
        } else {
            // console.log('[I2551]', 'refresh', '5');
            this._updateBlindTarget();
        }
        this._updateLabel();
        this.unschedule(this._tick);
        this.schedule(this._tick, 1);
    }

    private _blindRules(tourRaw: any): any[] {
        return tourRaw.blindRule?.blindRuleArr
            ?? tourRaw.blindRule?.blindStructure
            ?? tourRaw.blindStructure
            ?? tourRaw.blindRuleArr
            ?? [];
    }

    private _currentLevelNum(tourRaw: any): any {
        const tableDetails = this._presenter.model.gameData.tableDetails;
        const bl = tableDetails?.currentBlindLevel || tourRaw.currentBlindLevel || {};
        return bl.level ?? bl.levelNumber ?? bl.blindLevelNo ?? null;
    }

    private _ruleLevelNum(rule: any): any {
        return rule.level ?? rule.levelNumber ?? rule.blindLevelNo;
    }

    private _ruleNextBlindLevelTimeMs(tourRaw: any): number {
        // const rules = this._blindRules(tourRaw);
        // const cur = this._currentLevelNum(tourRaw);
        // for (let i = 0; i < rules.length; i++) {
        //     if (String(this._ruleLevelNum(rules[i])) === String(cur) && rules[i].nextBlindLevelTime) {
        //         return rules[i].nextBlindLevelTime * 1000;
        //     }
        // }
        // return 0;
        return tourRaw.currentBlindLevel?.nextBlindLevelTime ?? 0;
    }

    private _freezeForReloadDuringBreak(tourRaw: any) {
        const tableBreak = this._presenter?.model?.gameData?.break;
        const breakStartMs = tourRaw?.currentBreakDetails?.breakStartTime
            ?? tourRaw?.currentTournamentBreak?.breakStartTime
            ?? tableBreak?.breakStartTime
            ?? 0;
        const nextBlindMs = this._ruleNextBlindLevelTimeMs(tourRaw);
        const remaining = (breakStartMs > 0 && nextBlindMs > 0) ? Math.max(0, nextBlindMs - breakStartMs) : 0;
        this._breakStartRemaining = remaining;
        this._blindsUpTarget = Date.now() + remaining;
    }

    private _updateBlindTarget() {
        console.log('[I2551]', '_updateBlindTarget');

        const tableDetails = this._presenter.model.gameData.tableDetails;
        const tourRaw = this._presenter.model.gameData.tourData;

        console.log('[I2551]', '_updateBlindTarget', 'tableDetails', tableDetails);
        console.log('[I2551]', '_updateBlindTarget', 'tourRaw', tourRaw);

        const nextAt: number = tableDetails?.nextBlindLevelAt ?? 0;
        if (nextAt > 0) {
            this._blindsUpTarget = nextAt;
            console.log('[I2551]', '_updateBlindTarget', '1');
            console.log('[I2551]', '_blindsUpTarget', this._blindsUpTarget);
            return;
        }

        const nextInSec: number = tableDetails?.nextBlindLevelInSec ?? 0;
        if (nextInSec > 0) {
            console.log('[I2551]', '_updateBlindTarget', '2');
            console.log('[I2551]', '_blindsUpTarget', this._blindsUpTarget);
            this._blindsUpTarget = Date.now() + nextInSec * 1000;
            return;
        }

        const ruleTarget = this._ruleNextBlindLevelTimeMs(tourRaw);
        this._blindsUpTarget = ruleTarget > 0 ? ruleTarget : 0;

        console.log('[I2551]', '_updateBlindTarget', '3');
        console.log('[I2551]', '_blindsUpTarget', this._blindsUpTarget);
    }

    private _buildString(): string {
        const tourRaw = this._presenter.model.gameData.tourData;
        const tableDetails = this._presenter.model.gameData.tableDetails;

        // console.log('[I2551]', '_buildString', 'tableDetails', tableDetails);
        // console.log('[I2551]', '_buildString', 'tourRaw', tourRaw);

        // Line 1: tournament name
        const name: string = tourRaw.tournamentName || "";

        // Line 2: Level X: SB/BB(ante)
        const bl = tableDetails?.currentBlindLevel || tourRaw.currentBlindLevel || {};
        const roomCfg = this._presenter.model.roomConfig || {};
        const level = bl.level ?? bl.levelNumber ?? bl.blindLevelNo ?? "";
        const sb = bl.smallBlind ?? roomCfg.smallBlind ?? tableDetails?.smallBlind ?? 0;
        const bb = bl.bigBlind ?? roomCfg.bigBlind ?? tableDetails?.bigBlind ?? 0;
        const ante = bl.ante ?? roomCfg.ante ?? tableDetails?.ante ?? 0;
        const anteStr = ante > 0 ? `(${ante})` : "";
        let levelLine = "";
        if (sb > 0 || bb > 0) {
            levelLine = level !== "" ? `Level ${level}: ${sb}/${bb}${anteStr}` : `${sb}/${bb}${anteStr}`;
        }

        // Line 3: MM:SS  Next: SB/BB(ante)  (or "Next: MAX" at last level)
        const rules = this._blindRules(tourRaw);
        const next = this._getNextBlind(tourRaw);
        let nextLine = "";
        if (next) {
            const nsb = next.smallBlind ?? 0;
            const nbb = next.bigBlind ?? 0;
            const nante = next.ante ?? 0;
            const nanteStr = nante > 0 ? `(${nante})` : "";
            const remaining = this._blindsUpTarget > 0 ? Math.max(0, this._blindsUpTarget - Date.now()) : 0;

            // console.log('[I2551]', '_buildString', 'remaining', remaining);

            if (remaining > 0) {
                // console.log('[I2551]', '_buildString', 'remaining1');
                const m = Math.floor(remaining / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                const timer = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                nextLine = `${timer}  Next: ${nsb}/${nbb}${nanteStr}`;
            } else {
                // console.log('[I2551]', '_buildString', 'remaining2');
                nextLine = `Next: ${nsb}/${nbb}${nanteStr}`;
            }
        } else if (rules.length > 0) {
            nextLine = "Next: MAX";
        }

        if (tourRaw.isAddOn) {
            nextLine = "ADDON BREAK";
        }

        // Line 4: ID
        const roundNum = tableDetails?.roundNumber ?? "";
        const idLine = roundNum ? `ID: ${roundNum}` : "";

        return [name, levelLine, nextLine, idLine].filter(Boolean).join("\n");
    }

    private _getNextBlind(tourRaw: any): any {
        const rules = this._blindRules(tourRaw);
        const cur = this._currentLevelNum(tourRaw);
        if (rules.length === 0 || cur == null) return null;

        for (let i = 0; i < rules.length; i++) {
            if (String(this._ruleLevelNum(rules[i])) === String(cur)) {
                return rules[i + 1] ?? null;
            }
        }
        return null;
    }

    private _updateLabel() {
        if (!this.infoLabel || !this._presenter) return;
        this.infoLabel.string = this._buildString();
    }

    private _tick() {
        if (this._isGameIdle()) return;
        // console.log('[I2551]', '_tick');
        const tourRaw = this._presenter?.model?.gameData?.tourData;

        // console.log('[I2551]', '_tick', 'tourRaw', tourRaw);

        const isInBreak = !!(
            tourRaw?.isInBreak ||
            (tourRaw?.currentTournamentBreak && Object.keys(tourRaw.currentTournamentBreak).length > 0)
        );
        // console.log('[I2551]', '_tick', 'isInBreak', isInBreak);
        if (isInBreak) {
            if (this._breakStartRemaining === 0 && this._blindsUpTarget > 0) {
                this._breakStartRemaining = Math.max(0, this._blindsUpTarget - Date.now());
            }
            // console.log('[I2551]', '_tick', '1');
            this.unschedule(this._tick);
            return;
        }
        // console.log('[I2551]', '_tick', '2');
        this._updateBlindTarget();
        this._updateLabel();
    }

    onDestroy() {
        this.unschedule(this._tick);
    }
}
