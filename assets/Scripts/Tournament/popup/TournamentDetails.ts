const { ccclass, property } = cc._decorator;

@ccclass
export default class TournamentDetails extends cc.Component {

    @property(cc.Label) eventNameLabel: cc.Label = null!;
    @property(cc.Label) startTimeLabel: cc.Label = null!;
    @property(cc.Label) countdownLabel: cc.Label = null!;

    @property(cc.Label) blindsUpLabel: cc.Label = null!;
    @property(cc.Label) currentLevelLabel: cc.Label = null!;
    @property(cc.Label) currentLevelLabelHeading: cc.Label = null!;
    @property(cc.Label) lateRegLabel: cc.Label = null!;

    @property(cc.Label) entriesCountLabel: cc.Label = null!;// activePlayer
    @property(cc.Label) entriesCountLabelHeading: cc.Label = null!;
    @property(cc.Label) prizePoolLabel: cc.Label = null!;
    @property(cc.Label) totalBuyinsLabel: cc.Label = null!;

    @property(cc.Label) buyinLabel: cc.Label = null!;
    @property(cc.Label) startingChipsLabel: cc.Label = null!;
    @property(cc.Label) avgStackLabel: cc.Label = null!;
    @property(cc.Label) rebuyLabel: cc.Label = null!;
    @property(cc.Label) entryRangeLabel: cc.Label = null!;
    @property(cc.Label) addonLabel: cc.Label = null!;
    @property(cc.Label) reentryLabel: cc.Label = null!;
    @property(cc.Label) breakLabel: cc.Label = null!;
    @property(cc.Node) breakNode: cc.Node = null!;
    @property(cc.Node) animNode: cc.Node = null!;



    private _countdownTarget: number = 0;
    private _blindsUpTarget: number = 0;
    private _isRunning: boolean = false;
    private _isInBreak: boolean = false;

    onLoad() {

        this._onTournamentAddonPeriodOver = this.onTournamentAddonPeriodOver.bind(this);
        GameManager.off("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);
        GameManager.on("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);

        this._onTournamentAddonPeriodStart = this.onTournamentAddonPeriodStart.bind(this);
        GameManager.off("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
        GameManager.on("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
    }

    onTournamentAddonPeriodStart(data) {
        const tournamentId = this.t._id;
        if (data.data.eventData.tournamentId == tournamentId) {
            this.t.isAddOn = true;
        }
    }

    onTournamentAddonPeriodOver(data) {
        const tournamentId = this.t._id;
        if (data.data.eventData.tournamentId == tournamentId) {
            this.t.isAddOn = false;
        }
    }

    private _tsMs(v: any): number {
        if (!v) return 0;
        const n = Number(v);
        if (!isNaN(n) && n > 0) return n > 9999999999 ? n : n * 1000;
        return new Date(String(v)).getTime();
    }

    private _isEliminated(raw: any): boolean {
        if (raw.playerData?.status === 'ELIMINATED') return true;
        if (raw.playerStatus === 'ELIMINATED') return true;
        const myId = (window as any).GameManager?.user?.playerId;
        if (myId && raw.player_list) {
            const entry = raw.player_list[`_${myId}`]
                ?? (Object.values(raw.player_list as object) as any[]).find((p: any) => p.playerId == myId);
            if (entry?.status === 'ELIMINATED') return true;
        }
        return false;
    }
    
    private _isEnrolled(raw: any): boolean {
        if (this._isEliminated(raw)) return false;
        const myId = (window as any).GameManager?.user?.playerId;
        let inList = false;
        if (myId && raw.player_list) {
            if (raw.player_list[`_${myId}`]?.status === 'ACTIVE') {
                inList = true;
            } else {
                inList = Object.values(raw.player_list as object).some(
                    (p: any) => p.playerId == myId && p.status === 'ACTIVE'
                );
            }
        }
        return !!(raw.playerData || raw.playerStatus === 'REGISTERED' || inList);
    }

    setData(t: any) {
        if (!t) return;
        this.t = t;
        const raw = t;
        const state: string = t.state || raw.state || "";

        this._isRunning = state === "RUNNING";

        if (this.eventNameLabel) this.eventNameLabel.string = raw.tournamentName || "";

        const _lateRegOpen = state === "RUNNING" && !!(raw.isLateEntryOpen || (raw.lateRegistrationAllowed && raw.lateRegistrationEndTime > Date.now()));

        if (this.startTimeLabel) {
            if (state === "RUNNING") {
                if (_lateRegOpen) {
                    this.startTimeLabel.string = "Late Registration Closes in";
                } else {
                    const _isEliminated = raw.playerData?.status === "ELIMINATED";
                    if (_isEliminated && raw.isReentryAllowed) {
                        this.startTimeLabel.string = "Start Time : " + this.formatDate(raw.tournamentStartDetails?.startTime);
                    } else {
                        this.startTimeLabel.string = "Running Since";
                    }
                }
            } else if (state === "CLOSED" || state === "Closed" || state === "COMPLETED" || state === "Completed") {
                this.startTimeLabel.string = "Tournament Completed";
            } else if (state === "CANCELED" || state === "CANCELLED") {
                this.startTimeLabel.string = "Tournament Cancelled";
            } else if (state === "Registration Freezed" || state === "FREEZED") {
                this.startTimeLabel.string = "Registration Freezed";
            } else if (_lateRegOpen || state === "Open To Register" || state === "REGISTER") {
                if (this._isEnrolled(raw)) {
                    this.startTimeLabel.string = "Tournament Starts In";
                }
                else {
                    this.startTimeLabel.string = "Registration Closes in";
                }
            } else {
                // this.startTimeLabel.string = "Start Time : " + this.formatDate(raw.tournamentStartDetails?.startTime);
                this.startTimeLabel.string = "Registration Starts in : ";
            }
        }
        if (this.currentLevelLabel) {
            const _sb = raw.currentBlindLevel?.smallBlind ?? 0;
            const _bb = raw.currentBlindLevel?.bigBlind ?? 0;
            const _ante = raw.currentBlindLevel?.ante ?? 0;
            this.currentLevelLabel.string = `${_sb}/${_bb}/${_ante}`;
        }
        if (this.currentLevelLabelHeading) {
            const _lvl = raw.currentBlindLevel?.level ?? raw.currentBlindLevel?.levelNumber ?? raw.currentBlindLevel?.blindLevelNo ?? raw.currentLevel ?? 0;
            this.currentLevelLabelHeading.string = `Current Level ${_lvl}`;
        }
        if (this.lateRegLabel) this.lateRegLabel.string = raw.lateRegistrationAllowed ? `Level ${raw.lateRegistration?.lateRegistrationTillBlind ?? 0}` : "N/A";
        if (this.entriesCountLabel) {
            const _isCompleted = state === "CLOSED" || state === "Closed" || state === "COMPLETED" || state === "Completed";
            const _isCancelled = state === "CANCELED" || state === "CANCELLED";
            if (_isCompleted || _isCancelled) {
                this.entriesCountLabel.string = "0";
            } else if (state === "RUNNING") {
                this.entriesCountLabel.string = `${raw.activePlayerCount ?? 0}/${raw.uniqueEntries ?? 0}`;
            } else {
                this.entriesCountLabel.string = `${raw.activePlayerCount ?? 0}`;
            }
        }
        if (this.entriesCountLabelHeading) {
            this.entriesCountLabelHeading.string = `${raw.reentriesCount ?? 0} Re-Entries`;
        }
        // if (this.prizePoolLabel) this.prizePoolLabel.string = `${raw.guaranteedValue ?? 0}`;
        const value = raw.guaranteedValue ?? 0;
        const roundedUp = Math.ceil(value * 100) / 100;
        if (this.prizePoolLabel) this.prizePoolLabel.string = `${roundedUp}`;
        if (this.totalBuyinsLabel) this.totalBuyinsLabel.string = `${(raw.uniqueEntries ?? 0) + (raw.reentriesCount ?? 0)}`;
        if (this.buyinLabel) {
            const entry = raw.entryFees || 0;
            const house = raw.houseFees || 0;
            const entryStr = entry >= 1000 ? `${Math.round(entry / 1000)}k` : `${entry}`;
            this.buyinLabel.string = house > 0 ? `${entryStr}+${house}` : entryStr;
        }
        if (this.startingChipsLabel) this.startingChipsLabel.string = `${raw.noOfChipsAtGameStart ?? 0}`;

        if (this.avgStackLabel) {
            const _isPreGame = state === 'PUBLISHED' || state === 'Open To Register' || state === 'REGISTER';
            this.avgStackLabel.string = _isPreGame ? '0' : `${raw.alltableStack?.avgStack ?? 0}`;
        }

        if (this.rebuyLabel) {
            const rebuy = raw.rebuy;
            console.log("[TDetails] rebuy | raw.rebuy:", rebuy, "| raw.entryFees:", raw.entryFees, "| raw.allowRebuys:", raw.allowRebuys);
            // const hasRebuy = rebuy?.rebuyMultiplier > 0 || rebuy?.rebuyPrice?.rebuyAmount > 0;
            const hasRebuy = rebuy ? true : false;
            if (hasRebuy) {
                const lastLv = rebuy?.lastRebuy ?? "";
                let multiplierVal = 0;
                if (rebuy.rebuyMultiplier > 0) {
                    multiplierVal = rebuy.rebuyMultiplier;
                    const multiplierStr = Number.isInteger(multiplierVal) ? `${multiplierVal}` : `${parseFloat(multiplierVal.toFixed(1))}`;
                    this.rebuyLabel.string = `till Lv. ${lastLv} / ${multiplierStr}x`;
                } else {
                    this.rebuyLabel.string = `till Lv. ${lastLv} / ${rebuy.rebuyPrice?.rebuyAmount}+${rebuy.rebuyPrice?.rebuyHouseFee}`;
                }
                console.log("[TDetails] rebuy label set:", this.rebuyLabel.string, "| multiplierVal:", multiplierVal, "| lastLv:", lastLv, "| source:", rebuy.rebuyMultiplier > 0 ? "rebuyMultiplier" : "rebuyPrice.rebuyAmount");
            } else {
                this.rebuyLabel.string = "N/A";
                console.log("[TDetails] rebuy label N/A — rebuyMultiplier:", rebuy?.rebuyMultiplier, "| rebuyPrice:", rebuy?.rebuyPrice);
            }
        }

        if (this.entryRangeLabel) {
            this.entryRangeLabel.string = `${raw.capacity?.minPlayersToStart ?? 0}-${raw.capacity?.maxPlayersAllowed ?? 0}`;
        }

        if (this.addonLabel) {

            // {
            //     "addOnAllowedBlindLevels": [
            //         3,
            //         5
            //     ],
            //     "addOnAmount": 250,
            //     "addOnChip": 1000,
            //     "addOnHouseFee": 50,
            //     "addOnTime": [
            //         {
            //             "blindLevel": "3",
            //             "duration": "100"
            //         },
            //         {
            //             "blindLevel": "5",
            //             "duration": "100"
            //         }
            //     ],
            //     "numberOfAddOn": 2,
            //     "addOnPrice": 250
            // }

            
            // {
            //     "addOnAllowedBlindLevels": [
            //         3,
            //         5
            //     ],
            //     "addOnAmount": 660,
            //     "addOnChip": 1000,
            //     "addOnHouseFee": 60,
            //     "addOnTime": [
            //         {
            //             "blindLevel": "3",
            //             "duration": "100"
            //         },
            //         {
            //             "blindLevel": "5",
            //             "duration": "100"
            //         }
            //     ],
            //     "numberOfAddOn": 2,
            //     "addOnPrice": 660
            // }

            const ao = raw.addOn;
            const levels: number[] = ao?.addOnAllowedBlindLevels ?? [];
            if (levels.length > 0) {
                const multiplierVal = raw.entryFees > 0 ? (ao?.addOnAmount ?? 0) / raw.entryFees : 0;
                const multiplierStr = Number.isInteger(multiplierVal) ? `${multiplierVal}` : `${parseFloat(multiplierVal.toFixed(1))}`;
                const aoChip = ao?.addOnChip ?? 0;
                const chipsStr = aoChip >= 1000 ? `${parseFloat((aoChip / 1000).toFixed(1))}k` : `${aoChip}`;

                let multiplierVal = 0;
                if (ao.addOnMultiplier > 0) {
                    multiplierVal = ao.addOnMultiplier;
                    const multiplierStr = Number.isInteger(multiplierVal) ? `${multiplierVal}` : `${parseFloat(multiplierVal.toFixed(1))}`;
                    this.addonLabel.string = `${multiplierStr}x/Lv. ${levels.join("/")}`;
                } else {
                    this.addonLabel.string = `${ao?.addOnAmount}+${ao.addOnHouseFee}/Lv. ${levels.join("/")}`;
                }
            } else {
                this.addonLabel.string = "N/A";
            }
        }

        if (this.reentryLabel) {
            const rp = raw.reentryPrice;
            if (rp ? true : false) {
                const lastLv = rp.reentryAllowedBlindLevels?.slice(-1)[0] ?? "";
                const multiplierVal = rp.reentryMultiplier ? rp.reentryMultiplier : 0;
                if (multiplierVal > 0) {
                    const multiplierStr = Number.isInteger(multiplierVal) ? `${multiplierVal}` : `${parseFloat(multiplierVal.toFixed(1))}`;
                    this.reentryLabel.string = `till Lv. ${lastLv} / ${multiplierStr}x`;
                }
                else {
                    this.reentryLabel.string = `till Lv. ${lastLv} / ${rp.reentryAmount}+${rp?.reentryHouseFee}`;
                }
            } else {
                this.reentryLabel.string = "N/A";
            }
        }

        if (this.breakLabel) {
            this.breakLabel.string = raw.breakDuration;
        }

        this.nextBreakTimestamp = raw.nextBreakDetails.breakStartTime;

        const _breakEndMs = raw.currentBreakDetails?.breakEndTime ?? raw.currentTournamentBreak?.breakEndTime ?? 0;
        this._isInBreak = !!(raw.isInBreak && _breakEndMs > Date.now());
        if (this.breakNode) this.breakNode.active = this._isInBreak;
        if (this.animNode) {
            const anim = this.animNode.getComponent(cc.Animation);
            if (anim) { if (this._isInBreak) anim.play(); else anim.stop(); }
        }
        if (this.breakLabel && this._isInBreak) this.breakLabel.string = "-- min";

        const _nextBlindRaw = raw.currentBlindLevel?.nextBlindLevelTime;
        const _nextBlindAbsMs = _nextBlindRaw ? this._tsMs(_nextBlindRaw) : 0;
        const _blindsSecs = raw.nextBlindLevelIn ?? 0;
        this._blindsUpTarget = (_nextBlindAbsMs > Date.now())
            ? _nextBlindAbsMs
            : (_blindsSecs > 0 ? Date.now() + _blindsSecs * 1000 : 0);

        const _startMs = raw.tournamentStartDetails?.startTime ?? 0;
        if (state === "CLOSED" || state === "Closed" || state === "COMPLETED" || state === "Completed" || state === "CANCELED" || state === "CANCELLED" || state === "Registration Freezed") {
            this.stopCountdown();
            if (this.countdownLabel) this.countdownLabel.string = "00:00:00";
            if (this.breakLabel) this.breakLabel.string = "--";
            if (this.blindsUpLabel) this.blindsUpLabel.string = "N/A";
        } else if (_lateRegOpen && raw.lateRegistrationEndTime) {
            this.startCountdown(raw.lateRegistrationEndTime);
        } else if (state === "PUBLISHED") {
            const _regOpenMs = this._tsMs(raw.schedule?.registrationBeforeStarttime ?? raw.registrationBeforeStarttime ?? _startMs);
            this.startCountdown(_regOpenMs || _startMs);
        } else {
            this.startCountdown(_startMs);
        }
    }

    stopCountdown() {
        this.unschedule(this.tickCountdown);
    }

    private formatDate(ts: any): string {
        if (!ts) return "";
        const d = new Date(ts);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${mm}/${dd} ${hh}:${min}`;
    }

    private startCountdown(targetMs: number) {
        this.unschedule(this.tickCountdown);
        this._countdownTarget = targetMs;
        this.tickCountdown();
        this.schedule(this.tickCountdown, 0.5);
    }

    private tickCountdown() {
        const now = Date.now();

        if (this.countdownLabel) {
            let display: number;
            if (this._countdownTarget <= 0) {
                display = 0;
            } else if (this._countdownTarget > now) {
                display = this._countdownTarget - now;
            } else {
                display = now - this._countdownTarget;
            }
            const h = Math.floor(display / 3600000);
            const m = Math.floor((display % 3600000) / 60000);
            const s = Math.floor((display % 60000) / 1000);
            this.countdownLabel.string =
                `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }

        if (this.blindsUpLabel && this._isRunning) {
            if (this._isInBreak) {
                this.blindsUpLabel.string = "BREAK";
            } 
            else if (this.t.isAddOn) {
                this.blindsUpLabel.string = "ADDON BREAK";
            } 
            else if (this._blindsUpTarget <= 0) {
                this.blindsUpLabel.string = "Max";
            } 
            else {
                const remaining = Math.max(0, this._blindsUpTarget - now);
                const bm = Math.floor(remaining / 60000);
                const bs = Math.floor((remaining % 60000) / 1000);
                this.blindsUpLabel.string = `${String(bm).padStart(2, "0")}:${String(bs).padStart(2, "0")}`;
            }
        }

        if (this.breakLabel && !this._isInBreak) {
            // const nextBreak = new Date(now);

            // // 使用 UTC 方法，保证所有时区计算结果一致
            // nextBreak.setUTCMinutes(25, 0, 0);

            // if (nextBreak.getTime() <= now) {
            //     nextBreak.setUTCHours(nextBreak.getUTCHours() + 1);
            // }

            // const breakMs = Math.max(0, nextBreak.getTime() - now);
            // const breakMins = Math.ceil(breakMs / 60000);
            // this.breakLabel.string = `${breakMins} minutes`;

            const breakMs = Math.max(0, this.nextBreakTimestamp - Date.now());
            const breakMins = Math.ceil(breakMs / 60000);
            this.breakLabel.string = `${breakMins} minutes`;
        }
    }

}
