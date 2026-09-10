import EntriesHandler from "./EntriesHandler";
import TablesHandler from "./TablesHandler";
import PrizesHandler from "./PrizesHandler";
import TournamentDetails from "./TournamentDetails";
import { IResTournamentData } from "../Interfaces/TournamentDataInterface";
import { GameData } from "../../DataFormats/ResponseTypes";
import BlindStructurePopup from "./BlindStructurePopup";
import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";

const { ccclass, property } = cc._decorator;

export enum INFO_TAB {
    DETAILS = 0,
    ENTRIES,
    TABLES,
    PRIZES
}

@ccclass
export default class TournamentInfoHandler extends cc.Component {

    // ── Tab UI ──────────────────────────────────────────────────────────────
    @property([cc.Node]) tabBtns: cc.Node[] = [];
    @property([cc.Node]) tabPages: cc.Node[] = [];
    @property(cc.Color) labelActiveColor: cc.Color = new cc.Color(0, 0, 0, 255);
    @property(cc.Color) labelInactiveColor: cc.Color = new cc.Color(255, 255, 255, 255);

    // ── Sub-handlers ────────────────────────────────────────────────────────
    @property(TournamentDetails) detailsHandler: TournamentDetails = null!;
    @property(EntriesHandler) entriesHandler: EntriesHandler = null!;
    @property(TablesHandler) tablesHandler: TablesHandler = null!;
    @property(PrizesHandler) prizesHandler: PrizesHandler = null!;

    // ── Action buttons ───────────────────────────────────────────────────────
    @property(cc.Node) registerBtn: cc.Node = null!;
    @property(cc.Node) lateRegisterBtn: cc.Node = null!;
    @property(cc.Node) deregisterBtn: cc.Node = null!;
    @property(cc.Node) enterTableBtn: cc.Node = null!;
    @property(cc.Node) reentryBtn: cc.Node = null!;
    // @property(cc.Node) stateBtn: cc.Node = null!;
    @property(cc.Node) upcomingBtn: cc.Node = null!;
    @property(cc.Node) spectateBtn: cc.Node = null!;
    @property(cc.Node) freezedBtn: cc.Node = null!;
    @property(cc.Node) cancelledBtn: cc.Node = null!;
    @property(cc.Node) completedBtn: cc.Node = null!;

    // ── Popups ───────────────────────────────────────────────────────────────
    @property(cc.Node) blindStructurePopup: cc.Node = null!;
    @property(cc.Node) payoutStructurePopup: cc.Node = null!;

    private _tourData: any = null;

    // Converts any server timestamp (UTC ISO string, ms epoch, or s epoch) to ms epoch
    private _tsMs(v: any): number {
        const n = Number(v);
        if (!isNaN(n) && n > 0) return n > 9999999999 ? n : n * 1000;
        return new Date(String(v)).getTime();
    }

    onLoad() {
        cc.systemEvent.on("Tournament:Refresh", this._onTournamentRefresh, this);
        cc.systemEvent.on("TournamentReload", this.onReload, this);
        // const TournamentServerCom = (window as any).TournamentServerCom;
        // if (TournamentServerCom) {
        //     TournamentServerCom.socketIOBroadcast("Tournament:Update", this._onTournamentUpdate.bind(this));
        // }

        this.onTournamentUpdate = this._onTournamentUpdate.bind(this);
        GameManager.off("Tournament:Update", this.onTournamentUpdate);
        GameManager.on("Tournament:Update", this.onTournamentUpdate);

        this._onRegistrationSuccess = this.onRegistrationSuccess.bind(this);
        GameManager.off("RegistrationSuccess", this._onRegistrationSuccess);
        GameManager.on("RegistrationSuccess", this._onRegistrationSuccess);
    }

    onDestroy() {
        cc.systemEvent.off("Tournament:Refresh", this._onTournamentRefresh, this);
        cc.systemEvent.off("Tournament:TournamentReload", this.onReload, this);
    }

    private _

    private _onTournamentUpdate(data: any) {
        console.log("[TIH] _onTournamentUpdate received:", data);
        if (!this.node.active || !this._tourData) {
            console.log("[TIH] _onTournamentUpdate skipped: node.active=", this.node.active, "| _tourData=", this._tourData);
            return;
        }
        if (data?.eventName !== "TournamentBlindUpdate" || !data.data) {
            console.log("[TIH] _onTournamentUpdate skipped: eventName=", data?.eventName);
            return;
        }
        const tournamentId = data.tournamentId;
        const raw = this._tourData;
        const myId = (this._tourData as any).id ?? raw?._id;
        console.log("[TIH] _onTournamentUpdate | myId:", myId, "| eventTournamentId:", tournamentId, "| match:", myId === tournamentId);
        if (!myId || myId !== tournamentId) return;
        raw.currentBlindLevel = data.data;
        console.log("[TIH] _onTournamentUpdate | updating currentBlindLevel:", data.data);
        if (this.detailsHandler) this.detailsHandler.setData(this._tourData);
    }

    private _onTournamentRefresh(data: any) {
        if (!this.node.active || !this._tourData) return;
        const raw = this._tourData;
        const tournamentId = (this._tourData as any).id ?? raw?._id;
        if (!tournamentId || data._id !== tournamentId) return;
        (window as any).TournamentLobbyHandler.requestTournamentData(
            { tournamentId },
            (res: any) => {
                const freshRaw = res?.response ?? res?.data?.response ?? res?.data ?? res;
                if (freshRaw?._id && this.node.active) {
                    const refreshed = { ...this._tourData, raw: freshRaw, id: freshRaw._id, state: freshRaw.state };
                    this.setData(refreshed);
                }
            },
            () => { }
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // Public API
    // ════════════════════════════════════════════════════════════════════════

    show(tourData: any) {
        const wasActive = this.node.active;
        this.node.active = true;
        this.setData(tourData);
        if (!wasActive) {
            this.setTabActive(INFO_TAB.DETAILS);
        }
    }

    setData(tourData: any) {
        if (!tourData) return;
        this._tourData = tourData;

        this.feedDetails(tourData);
        this.feedEntries(tourData);
        this.feedTables(tourData);
        this.feedPrizes(tourData);

        const raw = tourData;
        this.updateActionButtons(tourData, raw);
    }

    onReload() {
        console.log('onReload1');
        if (!cc.isValid(this.node) || !this.node.active || !this._tourData) return;
        console.log('onReload2');
        const raw = this._tourData;
        const tournamentId = (this._tourData as any).id ?? raw?._id;
        if (!tournamentId) return;
        (window as any).TournamentLobbyHandler.requestTournamentData(
            { tournamentId },
            (res: any) => {
                console.log('onReload3');
                console.log(res);
                const refreshed = { ...this._tourData, raw: freshRaw, id: freshRaw._id, state: freshRaw.state };
                this.setData(refreshed);
            },
            () => { 
                this.onClose();
            }
        );
    }

    onClose() {
        if (this.detailsHandler) this.detailsHandler.stopCountdown();
        this._leaveTournamentLobby();
        this.node.active = false;
    }

    private _leaveTournamentLobby() {
        const raw = this._tourData;
        const tournamentId = (this._tourData as any)?.id ?? raw?._id;
        if (!tournamentId) return;
        (window as any).TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|leaveTournamentLobby",
            { tournamentId },
            () => { },
            () => { }
        );
    }

    // Called by inspector Button (customEventData = "0" / "1" / "2" / "3")
    switchTab(event: cc.Event, customEventData: string) {
        this.setTabActive(parseInt(customEventData) as INFO_TAB);
    }

    onStructureBtnClicked() {
        if (!this.blindStructurePopup) return;
        const raw = this._tourData;
        const popup = this.blindStructurePopup.getComponent(BlindStructurePopup);
        if (popup) {
            const lastRebuy = raw?.rebuy?.lastRebuy ?? 0;
            const rebuyLevels = lastRebuy > 0
                ? Array.from({ length: lastRebuy }, (_, i) => i + 1)
                : (raw?.rebuy?.rebuyAllowedBlindLevels ?? []);
            const ao = raw?.addOn;
            const lastAddon = ao?.lastAddon ?? 0;
            const addonLevels: number[] = ao?.addOnAllowedBlindLevels?.length > 0
                ? ao.addOnAllowedBlindLevels
                : (lastAddon > 0 ? [lastAddon] : []);
            console.log("[TIH] onStructureBtnClicked | raw.rebuy:", JSON.stringify(raw?.rebuy), "| raw.addOn:", JSON.stringify(raw?.addOn), "| rebuyLevels:", JSON.stringify(rebuyLevels), "| addonLevels:", JSON.stringify(addonLevels));
            popup.show({
                blindRuleArr: raw?.blindRule?.blindRuleArr ?? [],
                currentBlindLevel: raw?.currentBlindLevel,
                rebuyLevels,
                addonLevels,
            });
        }
        else this.blindStructurePopup.active = true;
    }

    onPayoutStructureBtnClicked() {
        if (!this.payoutStructurePopup) return;
        const raw = this._tourData;
        const popup = this.payoutStructurePopup.getComponent("PayoutStructurePopup") as any;
        if (popup) popup.show(raw);
        else this.payoutStructurePopup.active = true;
    }

    onRegisterBtn(event?: any, customEventData?: string) {
        const type = (typeof event === 'number') ? event : (parseInt(customEventData ?? '1') || 1);
        if (!this._tourData) return;
        GameManager.popUpManager.show(PopUpType.TournamentRegistrationPopup, {"tourData": this._tourData, "type": type});
    }

    onReEntryBtn() {
        this.onRegisterBtn(3);
    }

    onRegistrationSuccess() {
        if (this.registerBtn) this.registerBtn.active = false;
        if (this.lateRegisterBtn) this.lateRegisterBtn.active = false;
        if (this.reentryBtn) this.reentryBtn.active = false;

        const raw = this._tourData;
        const state = (this._tourData as any)?.state ?? raw?.status;
        if (state === "RUNNING") {
            // Late register into running tournament — show enterTableBtn, server will send tournamentGameStart for auto-enter
            if (this.enterTableBtn) this.enterTableBtn.active = true;
        } else {
            if (this.deregisterBtn) this.deregisterBtn.active = true;
        }

        const tournamentId = (this._tourData as any)?.id ?? raw?._id;
        if (tournamentId) {
            (window as any).TournamentLobbyHandler.requestTournamentData(
                { tournamentId },
                (res: any) => {
                    const tourRaw = res?.response ?? res?.data?.response ?? res?.data ?? res;
                    if (tourRaw?._id) {
                        const refreshed = { ...this._tourData, raw: tourRaw, id: tourRaw._id };
                        this.setData(refreshed);
                    }
                },
                () => { }
            );
        }
    }

    onDeRegisterBtn() {
        if (!this._tourData) return;
        const raw = this._tourData;

        const onSuccess = () => {
            const refund = (raw.entryFees || 0) + (raw.houseFees || 0);
            GameManager.popUpManager.show(PopUpType.TournamentCancelledPopup, refund);

            if (this.deregisterBtn) this.deregisterBtn.active = false;
            if (this.registerBtn) this.registerBtn.active = true;

            const tournamentId = (this._tourData as any)?.id ?? raw?._id;
            if (tournamentId) {
                (window as any).TournamentLobbyHandler.requestTournamentData(
                    { tournamentId },
                    () => { },
                    () => { }
                );
            }
        };
        const tournamentId = (this._tourData as any).id ?? raw._id;
        // Real outcome arrives via tournamentLobbyResponseEvent broadcast (relayed to
        // cc.systemEvent), not the request ACK — same reason as TournamentRegistrationPopup.
        cc.systemEvent.once("Res-Deregister", (resData: any) => {
            console.log("[TIH] Res-Deregister", resData);
            if (resData?.success || resData?.status === "success") onSuccess();
        });
        (window as any).TournamentLobbyHandler.requestTournamentDeRegister(
            { tournamentId },
            () => { },
            (error: any) => { cc.log("[DeRegister] error", error); }
        );
    }

    updateActionButtons(t: any, raw: any) {
        if (this.registerBtn) this.registerBtn.active = false;
        if (this.lateRegisterBtn) this.lateRegisterBtn.active = false;
        if (this.deregisterBtn) this.deregisterBtn.active = false;
        if (this.enterTableBtn) this.enterTableBtn.active = false;
        if (this.reentryBtn) this.reentryBtn.active = false;
        if (this.upcomingBtn) this.upcomingBtn.active = false;
        if (this.spectateBtn) this.spectateBtn.active = false;
        if (this.freezedBtn) this.freezedBtn.active = false;
        if (this.cancelledBtn) this.cancelledBtn.active = false;
        if (this.completedBtn) this.completedBtn.active = false;

        if (t.state === "CANCELED" || t.state === "CANCELLED") {
            (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.TournamentRegistrationPopup);
            (globalThis as any).GameManager?.popUpManager?.remove(PopUpType.TournamentRegistrationSuccess);
            if (this.cancelledBtn) this.cancelledBtn.active = true;
            return;
        }

        if (t.state === "CLOSED" || t.state === "Closed" || t.state === "COMPLETED" || t.state === "Completed") {
            if (this.completedBtn) this.completedBtn.active = true;
            return;
        }

        if (t.state === "Registration Freezed" || t.state === "FREEZED") {
            if (this.freezedBtn) this.freezedBtn.active = true;
            return;
        }

        if (t.state === "PUBLISHED") {
            if (this.upcomingBtn) this.upcomingBtn.active = true;
            return;
        }

        const isEnrolled = !!(raw.playerData || raw.playerStatus === "REGISTERED");
        const isEliminated = raw.playerData?.status === "ELIMINATED" || raw.playerStatus === "ELIMINATED";
        const _reentryLevels: number[] = raw.reentryPrice?.reentryAllowedBlindLevels ?? [];
        const _currentLevel: number = raw.currentBlindLevel?.level ?? 0;
        const _hasLevelRestriction = _reentryLevels.length > 0 && raw.currentBlindLevel != null;
        const _hasTimeRestriction = !!(raw.lateRegistrationEndTime);
        const _reentryEndValid =
            (!_hasLevelRestriction || _reentryLevels.includes(_currentLevel)) &&
            (!_hasTimeRestriction || this._tsMs(raw.lateRegistrationEndTime) > Date.now());
        const reentryOpen = t.state === "RUNNING"
            && isEliminated
            && raw.isReentryAllowed
            && (raw.playerData?.reentries ?? 0) < (raw.numberOfReentry ?? Infinity)
            && _reentryEndValid;

        if (reentryOpen) {
            if (this.reentryBtn) this.reentryBtn.active = true;
        } else if (isEliminated) {
            if (this.spectateBtn) this.spectateBtn.active = true;
        } else if (raw.playerData?.tableId) {
            // enrolled + table assigned
            if (this.enterTableBtn) {
                // this.enterTableBtn.active = true;
                this.scheduleOnce(() => { this.enterTableBtn.active = true; }, 1);
            }
        } else if (raw.playerData) {
            if (t.state === "RUNNING") {
                if (this.enterTableBtn) {
                    // this.enterTableBtn.active = true;
                    this.scheduleOnce(() => { this.enterTableBtn.active = true; }, 1);
                }
            } else {
                if (this.deregisterBtn) this.deregisterBtn.active = true;
            }
        } else if (isEnrolled && t.state === "RUNNING") {
            // playerStatus: "REGISTERED" from list data, no playerData yet
            if (this.enterTableBtn) {
                this.scheduleOnce(() => { this.enterTableBtn.active = true; }, 1);
            }
        } else {
            // not enrolled
            if (t.state === "RUNNING") {
                const _lateRegOpen = raw.isLateEntryOpen || ((raw.isLateReg || raw.lateRegistrationAllowed) && this._tsMs(raw.lateRegistrationEndTime) > Date.now());
                if (_lateRegOpen) {
                    if (this.lateRegisterBtn) this.lateRegisterBtn.active = true;
                } else {
                    if (this.spectateBtn) this.spectateBtn.active = true;
                }
            } else if (t.state === "Open To Register" || t.state === "REGISTER") {
                if (this.registerBtn) this.registerBtn.active = true;
            } else {
                if (this.upcomingBtn) this.upcomingBtn.active = true;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // Other tabs data feed
    // ════════════════════════════════════════════════════════════════════════

    private feedDetails(t: any) {
        if (!this.detailsHandler) return;
        this.detailsHandler.setData(t);
    }

    private feedEntries(t: any) {
        if (!this.entriesHandler) return;
        const raw = t;
        const entries = (raw.entries
            || []).map((p: any) => ({
                playerName: p.playerName || "",
                playerId: p.playerId || "",
                profileImage: p.profileImage || "",
                avatarId: p.avatarId ?? 0,
            }));
        this.entriesHandler.setData({
            entries,
            enrolledCount: raw.uniqueEntries ?? entries.length,
        });
    }

    private feedTables(t: any) {
        if (!this.tablesHandler) return;
        this.tablesHandler.setEnterTableHandler(this.enterTable.bind(this));
        const raw = t;

        const _isEnrolled = !!(raw.playerData || raw.playerStatus === "REGISTERED");
        const _isEliminated = raw.playerData?.status === "ELIMINATED" || raw.playerStatus === "ELIMINATED";
        const isActiveParticipant = _isEnrolled && !_isEliminated;
        const myTableId: string | null = raw.playerData?.tableId ?? null;

        const tables = (raw.tableList || [])
            .filter((s: any) => (s.countOfPlayers ?? s.playersCount ?? 0) > 0)
            .map((s: any, i: number) => ({
                tableNumber: s.tableMockName ?? s.id ?? (i + 1),
                tableId: s.channelId ?? s.id,
                playerCount: s.countOfPlayers ?? s.playersCount ?? 0,
                chips: `${s.minStack}/${s.maxStack}`,
                maxStack: s.maxStack,
                minStack: s.minStack,
            }));
        this.tablesHandler.setData({ tables, tablesLeft: tables.length, raw: t, ...t, isActiveParticipant, myTableId });
    }

    private feedPrizes(t: any) {
        if (!this.prizesHandler) return;
        const raw = t;
        const guaranteed = raw.guaranteedValue ?? 0;
        const prizes = (raw.playersPayout || []).map((p: any) => ({
            rank: p.rank,
            prize: p.payoutAmount,
        }));
        this.prizesHandler.setData({ prizes });
    }
    onBackBtnClicked() {
        this.setTabActive(INFO_TAB.DETAILS);
        this.detailsHandler.stopCountdown();
        this._leaveTournamentLobby();
        this.node.active = false;
    }

    enterTable() {

        console.log("[TIH] enterTable called");
        if (!this._tourData) return;

        const raw = this._tourData;
        const tournamentId = this._tourData.id ?? raw._id;
        if (!tournamentId) return;

        const _disableBtn = (node: cc.Node) => {
            const btn = node?.getComponent(cc.Button);
            if (!btn) return;
            btn.interactable = false;
            this.scheduleOnce(() => { btn.interactable = true; }, 1.5);
        };
        _disableBtn(this.enterTableBtn);
        _disableBtn(this.spectateBtn);

        const tableId = raw.playerData?.tableId;
        const activeModels = (window as any).GameManager?.gameModel?.activePokerModels ?? [];
        let existingIndex = -1;
        for (let i = 0; i < activeModels.length; i++) {
            const m = activeModels[i];
            const matchChannel = tableId && m?.gameData?.channelId === tableId;
            const matchTournament = m?.gameData?.tournamentId === tournamentId;
            console.log("[TIH] model", i, "channelId:", m?.gameData?.channelId, "tableId:", tableId, "tourId:", m?.gameData?.tournamentId, "expected:", tournamentId);
            if (matchChannel || matchTournament) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex !== -1) {
            const popup = cc.find("Canvas/TournamentLobbyDetail");
            if (popup) popup.active = false;
            (window as any).GameManager.popUpManager.hideAllPopUps();
            (window as any).ScreenManager.showScreen((window as any).K.ScreenEnum.GamePlayScreen, existingIndex, () => { });
            return;
        }

        if (GameManager.activeTableCount > 0) {
            if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
                GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                return;
            }
        }

        cc.systemEvent.once("enterChannelResponse", (resData: any) => {
            console.log("[TIH] enterChannelResponse fired success:", resData?.success, "tid:", resData?.tournamentId, "expected:", tournamentId);
            if (!resData?.success) {
                // console.warn("[TIH] no success"); 
                if (resData.isMaxTable == true) {
                    GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                }
                return;
            }
            if (resData.tournamentId !== tournamentId) { console.warn("[TIH] tournamentId mismatch", resData.tournamentId, tournamentId); return; }
            cc.systemEvent.emit("HideTournamentNotification");
            (window as any).GameManager.popUpManager.hideAllPopUps();
            if (!resData.antibanking) resData.antibanking = { isAntiBanking: false, amount: 0, timeRemains: 0 };
            if (!resData.playerName) resData.playerName = (window as any).GameManager?.user?.userName || "";

            let gameData = resData;
            console.log("[TIH] calling showScreen");
            try {
                const td = this._tourData;
                gameData.tourData = td;
                const popup = cc.find("Canvas/TournamentLobbyDetail");
                if (popup) popup.active = false;
                (window as any).ScreenManager.showScreen((window as any).K.ScreenEnum.GamePlayScreen, gameData, () => { });
                console.log("[TIH] showScreen done");
            } catch (e) {
                console.error("[TIH] showScreen error:", e);
            }
        });

        (window as any).TournamentServerCom.socketIORequest(
            "tournamentGameEvent|enterTable",
            { tournamentId },
            () => { },
            null, 5000, false
        );
    }
    lateRegister() {
        this.onRegisterBtn(2);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Tab switching
    // ════════════════════════════════════════════════════════════════════════

    private setTabActive(tab: INFO_TAB) {
        this.tabPages.forEach((page, i) => { page.active = i === tab; });

        this.tabBtns.forEach((btn, i) => {
            const isActive = i === tab;
            const tabSelected = btn.getChildByName("TabSelected");
            if (tabSelected) tabSelected.active = isActive;
            const lbl = btn.getChildByName("Label")?.getComponent(cc.Label);
            if (lbl) lbl.node.color = isActive ? this.labelActiveColor : this.labelInactiveColor;
        });
    }
}


