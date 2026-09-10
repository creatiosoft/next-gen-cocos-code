const { ccclass, property } = cc._decorator;
import { GameData } from "../../DataFormats/ResponseTypes";
import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");

import { YXCollectionView } from "../../Lib/yx-collection-view";
import { YXTableLayout } from "../../Lib/yx-table-layout";

declare const TournamentServerCom: any;

export enum INGAME_TAB { RANKING = 0, PRIZES, TABLES, BLINDS }

@ccclass
export class TournamentInGameInfo extends PopUpBase {

    // ── Header ───────────────────────────────────────────────────────────────
    @property(cc.Label) tournamentNameLabel: cc.Label = null!;
    @property(cc.Label) currentLevelLabelHeading: cc.Label = null!;   // "level 1"
    @property(cc.Label) currentLevelLabel: cc.Label = null!;   // "25/50"
    @property(cc.Label) nextLevelLabelHeading: cc.Label = null!;      //Level 2
    @property(cc.Label) nextLevelLabel: cc.Label = null!;      // "50/100"
    @property(cc.Label) timerLabel: cc.Label = null!;          // "04:40"

    // ── Stats row 1 ──────────────────────────────────────────────────────────
    @property(cc.Label) myPositionLabel: cc.Label = null!;
    @property(cc.Label) entriesLabel: cc.Label = null!;        // "11/122"
    @property(cc.Label) prizePoolLabel: cc.Label = null!;
    @property(cc.Label) statusLabel: cc.Label = null!;         // "Running" / "01:26:40"

    // ── Stats row 2 ──────────────────────────────────────────────────────────
    @property(cc.Label) avgStackLabel: cc.Label = null!;
    @property(cc.Label) totalBuyInsLabel: cc.Label = null!;
    @property(cc.Label) addOnsLabel: cc.Label = null!;

    // ── Stats row 3 ──────────────────────────────────────────────────────────
    @property(cc.Label) largestStackLabel: cc.Label = null!;
    @property(cc.Label) smallerStackLabel: cc.Label = null!;
    @property(cc.Label) rebuysLabel: cc.Label = null!;

    // ── Tabs ─────────────────────────────────────────────────────────────────
    @property([cc.Node]) tabBtns: cc.Node[] = [];
    @property([cc.Node]) tabPages: cc.Node[] = [];
    @property(cc.Color) tabActiveColor: cc.Color = new cc.Color(253, 171, 46, 255);   // gold
    @property(cc.Color) tabInactiveColor: cc.Color = new cc.Color(255, 255, 255, 255);

    // ── Ranking tab ──────────────────────────────────────────────────────────
    @property(cc.Node) rankingContent: cc.Node = null!;
    @property(cc.Prefab) rankingItemTemplate: cc.Prefab = null!;
    @property(cc.Node) myEntryNode: cc.Node = null!;  // bottom bar — InGamingRankingTemplate component

    // ── Prizes tab ───────────────────────────────────────────────────────────
    @property(cc.Node) prizesContent: cc.Node = null!;
    @property(cc.Prefab) prizeItemTemplate: cc.Prefab = null!;

    // ── Tables tab ───────────────────────────────────────────────────────────
    @property(cc.Node) tablesContent: cc.Node = null!;
    @property(cc.Prefab) tableItemTemplate: cc.Prefab = null!;
    @property(cc.Label) tablesLeftLabel: cc.Label = null!;
    @property(cc.Node) cannotViewToast: cc.Node = null!;
    @property(cc.Label) cannotViewToastLabel: cc.Label = null!;
    @property(cc.Node) toastNode: cc.Node = null!;
    @property(cc.Label) toastLabel: cc.Label = null!;

    // ── Blinds tab ───────────────────────────────────────────────────────────
    @property(cc.Node) blindsContent: cc.Node = null!;
    @property(cc.Prefab) blindItemTemplate: cc.Prefab = null!;

    // ─────────────────────────────────────────────────────────────────────────
    private _tourData: any = null;
    private _pokerModel: any = null;
    private _countdownTarget: number = 0;
    private _breakStartRemaining: number = 0;
    private _runningStart: number = 0;
    private _leaderboardJoined: boolean = false;
    private _hasLiveLeaderboardData: boolean = false;
    private _fetchPending: boolean = false;
    private _myPosition: number = 0;
    private _boundBlindUpdate: ((data: any) => void) | null = null;
    private _navCleanupTimer: number = -1;
    private _breakEndTimer: number = -1;
    private _switchGuardTimer: number = -1;

    // True while an observer table switch (_navigateToTable) is in flight. The old
    // table's "leave" ack can tear its model down before the new table's join
    // completes, briefly zeroing activePokerModels and tripping GameScreen's
    // refreshGrid "no tables -> show Lobby" fallback. Rather than touching that
    // shared GameScreen logic, we suppress just the LobbyScreen hop it would trigger
    // during this window — see _installScreenManagerGuard below.
    private static isSwitchingTables: boolean = false;
    private static _screenManagerGuardInstalled: boolean = false;


    private _itemNodes: cc.Node[] = [];          // 已创建的节点，按当前显示顺序
    private _itemPool: cc.Node[] = [];           // 备用池（一般用不上，因为数量固定）
    private _pendingRows: any[] = [];
    private _createIndex = 0;
    private _batchSize = 20;
    private _isCreating = false;
    private _hasCreatedItems = false;            // 标记是否已经完成首次创建
    private readonly ITEM_HEIGHT = 60;           // 改成你实际的行高

    private _installScreenManagerGuard() {
        if (TournamentInGameInfo._screenManagerGuardInstalled) return;
        const sm = (window as any).ScreenManager;
        if (!sm || typeof sm.showScreen !== "function") return;
        TournamentInGameInfo._screenManagerGuardInstalled = true;
        
        // const originalShowScreen = sm.showScreen.bind(sm);
        // sm.showScreen = (screen: any, optionalData: any, callBack: any) => {
        //     const K = (window as any).K;
        //     if (TournamentInGameInfo.isSwitchingTables && screen === K?.ScreenEnum?.LobbyScreen) {
        //         console.warn("[TII] suppressed LobbyScreen showScreen during table switch");
        //         if (callBack) callBack();
        //         return;
        //     }
        //     return originalShowScreen(screen, optionalData, callBack);
        // };
    }

    // ════════════════════════════════════════════════════════════════════════

    onLoad() {
        const K = (globalThis as any).K;
        
        this._onTournamentAddonPeriodOver = this.onTournamentAddonPeriodOver.bind(this);
        GameManager.off("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);
        GameManager.on("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);

        this._onTournamentAddonPeriodStart = this.onTournamentAddonPeriodStart.bind(this);
        GameManager.off("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
        GameManager.on("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);

        this.setTabActive(INGAME_TAB.RANKING);
    }

    onTournamentAddonPeriodStart(data) {
////        console.log('this._tourData.isAddon onTournamentAddonPeriodStart1');
        const raw = this._tourData;
        const tournamentId = this._tourData.id ?? raw._id;
        if (!tournamentId) return;
////        console.log('this._tourData.isAddon onTournamentAddonPeriodStart2');
        if (data.data.eventData.tournamentId == tournamentId) {
////            console.log('this._tourData.isAddon onTournamentAddonPeriodStart3');
            this._tourData.isAddOn = true;
        }
    }

    onTournamentAddonPeriodOver(data) {
////        console.log('this._tourData.isAddon onTournamentAddonPeriodOver1');
        const raw = this._tourData;
        const tournamentId = this._tourData.id ?? raw._id;
        if (!tournamentId) return;
////        console.log('this._tourData.isAddon onTournamentAddonPeriodOver2');
        if (data.data.eventData.tournamentId == tournamentId) {
////            console.log('this._tourData.isAddon onTournamentAddonPeriodOver3');
            this._tourData.isAddOn = false;

            if (this._countdownTarget <= 0) {
                this.timerLabel.string = "MAX";
            }
        }
    }

    onDestroy() {
        const K = (globalThis as any).K;
        cc.systemEvent.off(K?.SocketIOEvent?.Lobby?.TournamentRefresh, this.onTournamentRefresh, this);
        this.unschedule(this.tickTimer);
        this._clearBreakEndTimer();
        if (this._boundBlindUpdate) {
            // (window as any).TournamentSocket?.off("Tournament:Update", this._boundBlindUpdate);
            // this._boundBlindUpdate = null;
        }
        if (this._leaderboardJoined) {
            this.leaveLeaderboard();
            (window as any).TournamentSocket?.off("TournamentLeaderboard");
            this._leaderboardJoined = false;
            this._hasLiveLeaderboardData = false;
        }
    }

    onShow(data) {
        this.node.opacity = 0;
        this.pokerPresenter = data;
        // 
        const K = (globalThis as any).K;
        cc.systemEvent.off(K?.SocketIOEvent?.Lobby?.TournamentRefresh, this.onTournamentRefresh, this);
        cc.systemEvent.on(K?.SocketIOEvent?.Lobby?.TournamentRefresh, this.onTournamentRefresh, this);

        // (window as any).TournamentServerCom?.socketIOBroadcast("Tournament:Update", this._boundBlindUpdate);
        this._boundBlindUpdate = this._onBlindUpdate.bind(this);
        GameManager.off("Tournament:Update", this._boundBlindUpdate);
        GameManager.on("Tournament:Update", this._boundBlindUpdate);

        const listComp = cc.find("Bg/MainNode/TabPage/Ranking/Rank/ScrollView", this.node).getComponent(YXCollectionView);
        listComp.numberOfItems = () => 0;
        listComp.cellForItemAt = (indexPath, collectionView) => {
            const cell = collectionView.dequeueReusableCell(`cell-ranking`)
            const p = this._pendingRows[indexPath.row];
            
            const gm = (globalThis as any).GameManager;
            const isMe = String(p.playerId) === String(gm?.user?.playerId);
            const comp = cell.getComponent("InGamingRankingTemplate") as any;
            if (comp?.setData) {
                comp.setData({
                    rank: p.rank,
                    playerName: p.playerName,
                    chips: p.chips,
                    rebuys: p.rebuys,
                    addons: p.addons,
                    isMe,
                    highlight: indexPath.row % 2 === 1,
                });
            }

            return cell;
        };

        let layout = new YXTableLayout();
        layout.spacing = 0;
        layout.rowHeight = 60;
        listComp.layout = layout;

        // 
        const listComp2 = cc.find("Bg/MainNode/TabPage/Tables/scrollView", this.node).getComponent(YXCollectionView);
        listComp2.numberOfItems = () => 0;
        listComp2.cellForItemAt = (indexPath, collectionView) => {
            const cell = collectionView.dequeueReusableCell(`cell-table`)
            const s = this.tables[indexPath.row];
            
            const tableData = Object.assign({}, s, { tableNumber: s.tableNumber ?? (indexPath.row + 1) });
            const comp = cell.getComponent("TablesRow") as any;
            const rowClickHandler = (data: any) => {
                const rowChannelId = s.tableId ?? s.channelId ?? s.id;
                if (this.isMyTable) {
                    this.onBackBtnClick();
                } else if (this.isActivePlayer) {
                    this.showCannotViewToast();
                } else {
                    const gm = (window as any).GameManager;
                    const alreadyWatching = (gm?.gameModel?.activePokerModels ?? [])
                        .some((m: any) => m?.gameData?.channelId === rowChannelId);
                    if (!alreadyWatching) {
                        GameManager.off("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);
                        GameManager.off("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
                        GameManager.off("Tournament:Update", this._boundBlindUpdate);
                        this.closeSelf();
                        this._navigateToTable(data);
                    } else {
                        this.onBackBtnClick();
                    }
                }
            };
            if (comp?.setData) {
                comp.setData(tableData, rowClickHandler, this.isMyTable, indexPath.row % 2 === 1);
            }

            cell.on(cc.Node.EventType.TOUCH_END, () => {
                rowClickHandler(tableData);
            }, this);

            return cell;
        };

        let layout2 = new YXTableLayout();
        layout2.spacing = 0;
        layout2.rowHeight = 90;
        listComp2.layout = layout2;

        const pokerModel = this.pokerPresenter.getComponent("PokerPresenter").model.getComponent("PokerModel");
        this._pokerModel = pokerModel;
        this._tourData = pokerModel?.tourData;
        this.updateData();
        this.joinLeaderboard();
        this._fetchFreshTourData();
    }

    private _fetchFreshTourData() {
        if (!this._tourData || this._fetchPending) return;
        const raw = this._tourData;
        const tournamentId = this._tourData.id ?? raw._id;
        if (!tournamentId) return;

        const sock = (window as any).TournamentSocket;
        if (!sock) return;

        this._fetchPending = true;
        let handled = false;

        const onData = (data: any) => {
            if (data.eventName !== "Res-GetTournamentData") return;
            if (handled) return;
            handled = true;
            sock.off("tournamentLobbyResponseEvent", onData);
            this._fetchPending = false;
            const inner = data.data || {};
            const tourRaw = inner.response || inner;
            if (!tourRaw || !tourRaw._id) return;
            this._tourData = tourRaw;
            // if (this._pokerModel?.gameData?.tourData) {
            //     this._pokerModel.gameData.tourData = tourRaw;
            // }
            // if (this._pokerModel) {
            //     this._pokerModel.tourData = this._tourData;
            // }
            this._presenter?.model?.gameData?.tourData = tourRaw;
            this.updateHeader();
            this.updateTables();
            this.updatePrizes();
            this.updateBlinds();

            this.node.opacity = 255;
        };

        sock.on("tournamentLobbyResponseEvent", onData);

        (window as any).TournamentLobbyHandler.requestTournamentData(
            { tournamentId },
            () => { /* ack only — real data via tournamentLobbyResponseEvent */ },
            () => {
                if (handled) return;
                handled = true;
                sock.off("tournamentLobbyResponseEvent", onData);
                this._fetchPending = false;
            }
        );
    }

    onDisable() {
        const K = (globalThis as any).K;
        cc.systemEvent.off(K?.SocketIOEvent?.Lobby?.TournamentRefresh, this.onTournamentRefresh, this);
        this.unschedule(this.tickTimer);
        this.unschedule(this.tickRunningTimer);
        this.onCannotViewToastClose();
        this._clearBreakEndTimer();
        this._countdownTarget = 0;
        if (this._boundBlindUpdate) {
            // (window as any).TournamentSocket?.off("Tournament:Update", this._boundBlindUpdate);
            this._boundBlindUpdate = null;
        }
        if (this._leaderboardJoined) {
            this.leaveLeaderboard();
            (window as any).TournamentSocket?.off("TournamentLeaderboard");
            this._leaderboardJoined = false;
            this._hasLiveLeaderboardData = false;
        }

        if (this.toastNode) this.toastNode.active = false;

        this.switchTab(null, 0);
    }

    private _onBlindUpdate(data: any) {
        if (!this.node.active || !this._tourData) return;
        if (data?.eventName !== "TournamentBlindUpdate" || !data.data) return;
        const raw =  this._tourData;
        const myId = this._tourData.id ?? raw?._id;
        if (!myId || myId !== data.tournamentId) return;
        raw.currentBlindLevel = data.data;
        this.updateHeader();
    }

    private joinLeaderboard() {
        if (this._leaderboardJoined || !this._tourData) return;
        const raw = this._tourData;
        const tournamentId = this._tourData.id ?? raw._id;
        if (!tournamentId) return;
        this._leaderboardJoined = true;

        TournamentServerCom.socketIOBroadcast("TournamentLeaderboard", this.onLeaderboardBroadcast.bind(this));

//////        // console.log("[TII] joinLeaderboard for tournamentId:", tournamentId);
        TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|joinLeaderboard",
            { tournamentId },
            () => { },
            () => { }
        );
    }

    private leaveLeaderboard() {
        const raw = this._tourData;
        const tournamentId = this._tourData?.id ?? raw?._id;
        if (!tournamentId) return;

//////        // console.log("[TII] leaveLeaderboard for tournamentId:", tournamentId);
        TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|leaveLeaderboard",
            { tournamentId },
            () => { },
            () => { }
        );
    }

    private onLeaderboardBroadcast(envelope: any) {
        try {
//////            // console.log("[TII] TournamentLeaderboard envelope:", envelope?.phase, "n:", envelope?.n);
            if (!envelope?.data) return;
            const pako = (window as any).pako;
            if (!pako) {
                console.warn("[TII] pako not loaded — cannot decode leaderboard");
                return;
            }
            const bytes = this.base64ToUint8Array(envelope.data);
            const jsonStr = pako.ungzip(bytes, { to: "string" });
            const columnar = JSON.parse(jsonStr);
//////            // console.log("[TII] decoded columnar leaderboard:", columnar);
            this.renderLiveLeaderboard(columnar);
        } catch (e) {
            console.error("[TII] failed to decode TournamentLeaderboard", e);
        }
    }

    private base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }


    private renderLiveLeaderboard(columnar: any) {
////        // console.log("renderLiveLeaderboard", columnar);
        // if (!this.rankingContent || !this.rankingItemTemplate) {
        //     console.warn("[TII] renderLiveLeaderboard aborted");
        //     return;
        // }

        this._hasLiveLeaderboardData = true;
        const gm = (globalThis as any).GameManager;
        const isOver = columnar.phase === "over";
        const n = columnar.id?.length ?? 0;

        // 组装数据（永远按 rank 顺序）
        const rows: any[] = [];
        for (let i = 0; i < n; i++) {
            rows.push({
                rank: columnar.rk?.[i] ?? (i + 1),
                playerId: columnar.id?.[i],
                playerName: columnar.nm?.[i] ?? "",
                chips: isOver ? 0 : (columnar.c?.[i] ?? 0),
                rebuys: isOver ? 0 : (columnar.rb?.[i] ?? 0),
                addons: isOver ? 0 : (columnar.ad?.[i] ?? 0),
            });
        }

        // 更新自己的位置（同步做）
        const me = rows.find(p => String(p.playerId) === String(gm?.user?.playerId));
        if (me && (me.rank ?? 0) > 0) this._myPosition = me.rank;
        if (this.myPositionLabel) {
            this.myPositionLabel.string = this._myPosition > 0 ? `${this._myPosition}` : "0";
        }
        if (this.myEntryNode) {
            this.myEntryNode.active = !!me;
            if (me) {
                const comp = this.myEntryNode.getComponent("InGamingRankingTemplate") as any;
                if (comp?.setData) {
                    comp.setData({
                        rank: me.rank,
                        playerName: me.playerName,
                        chips: me.chips,
                        rebuys: me.rebuys,
                        addons: me.addons,
                        isMe: true
                    });
                }
            }
        }

        this._pendingRows = rows;

        const listComp = cc.find("Bg/MainNode/TabPage/Ranking/Rank/ScrollView", this.node).getComponent(YXCollectionView);
        listComp.numberOfItems = () => this._pendingRows.length;
        listComp.reloadData();

        // // ========== 关键分支 ==========
        // if (!this._hasCreatedItems) {
        //     // 第一次：分帧创建
            
        //     this._createIndex = 0;
        //     if (!this._isCreating) {
        //         this._isCreating = true;
        //         this.startCreateItems();
        //     }
        // } else {
        //     // 以后每次：只更新数据 + 重排位置
        //     this.updateExistingItems(rows);
        // }
    }

    private startCreateItems() {
        // 回收旧节点（防御性）
        const children = this.rankingContent.children.slice();
        for (const node of children) {
            node.removeFromParent(false);
            this._itemPool.push(node);
        }
        this._itemNodes = [];

        // 提前设高度
        const totalHeight = this._pendingRows.length * this.ITEM_HEIGHT;
        this.rankingContent.height = Math.max(totalHeight, this.rankingContent.parent.height);

        this.createNextBatch();
    }

    private createNextBatch() {
        if (this._createIndex >= this._pendingRows.length) {
            this._isCreating = false;
            this._hasCreatedItems = true;
            return;
        }

        const end = Math.min(this._createIndex + this._batchSize, this._pendingRows.length);
        const gm = (globalThis as any).GameManager;

        for (let i = this._createIndex; i < end; i++) {
            const p = this._pendingRows[i];
            let item: cc.Node;

            if (this._itemPool.length > 0) {
                item = this._itemPool.pop()!;
            } else {
                item = cc.instantiate(this.rankingItemTemplate);
            }

            item.active = true;
            this.rankingContent.addChild(item);
            this._itemNodes.push(item);          // 按创建顺序存进去

            // 设置位置
            item.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
            item.x = 0;

            const isMe = String(p.playerId) === String(gm?.user?.playerId);
            const comp = item.getComponent("InGamingRankingTemplate") as any;
            if (comp?.setData) {
                comp.setData({
                    rank: p.rank,
                    playerName: p.playerName,
                    chips: p.chips,
                    rebuys: p.rebuys,
                    addons: p.addons,
                    isMe,
                    highlight: i % 2 === 1,
                });
            }
        }

        this._createIndex = end;
        this.scheduleOnce(() => this.createNextBatch(), 0);
    }

    // private updateExistingItems(rows: any[]) {
    //     const gm = (globalThis as any).GameManager;
    //     const count = Math.min(rows.length, this._itemNodes.length);

    //     for (let i = 0; i < count; i++) {
    //         const p = rows[i];
    //         const item = this._itemNodes[i];

    //         // 重新设置位置（实现重排）
    //         item.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
    //         item.x = 0;

    //         const isMe = String(p.playerId) === String(gm?.user?.playerId);
    //         const comp = item.getComponent("InGamingRankingTemplate") as any;
    //         if (comp?.setData) {
    //             comp.setData({
    //                 rank: p.rank,
    //                 playerName: p.playerName,
    //                 chips: p.chips,
    //                 rebuys: p.rebuys,
    //                 addons: p.addons,
    //                 isMe,
    //                 highlight: i % 2 === 1,
    //             });
    //         }
    //     }

    //     // 防御：万一服务端偶尔少给/多给（虽然你说不会），做个保护
    //     // 这里一般不会走到
    // }

    private updateExistingItems(rows: any[]) {
        const gm = (globalThis as any).GameManager;
        const content = this.rankingContent;

        // 1. 先更新已有节点
        const existCount = Math.min(rows.length, this._itemNodes.length);
        for (let i = 0; i < existCount; i++) {
            const p = rows[i];
            const item = this._itemNodes[i];

            item.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
            item.x = 0;
            item.active = true;

            const isMe = String(p.playerId) === String(gm?.user?.playerId);
            const comp = item.getComponent("InGamingRankingTemplate") as any;
            if (comp?.setData) {
                comp.setData({
                    rank: p.rank,
                    playerName: p.playerName,
                    chips: p.chips,
                    rebuys: p.rebuys,
                    addons: p.addons,
                    isMe,
                    highlight: i % 2 === 1,
                });
            }
        }

        // 2. 如果新数据比原来多（LateRegister 等情况），补创建节点
        if (rows.length > this._itemNodes.length) {
            for (let i = this._itemNodes.length; i < rows.length; i++) {
                const p = rows[i];
                let item: cc.Node;

                if (this._itemPool.length > 0) {
                    item = this._itemPool.pop()!;
                } else {
                    item = cc.instantiate(this.rankingItemTemplate);
                }

                item.active = true;
                content.addChild(item);
                this._itemNodes.push(item);

                item.y = -i * this.ITEM_HEIGHT - this.ITEM_HEIGHT * 0.5;
                item.x = 0;

                const isMe = String(p.playerId) === String(gm?.user?.playerId);
                const comp = item.getComponent("InGamingRankingTemplate") as any;
                if (comp?.setData) {
                    comp.setData({
                        rank: p.rank,
                        playerName: p.playerName,
                        chips: p.chips,
                        rebuys: p.rebuys,
                        addons: p.addons,
                        isMe,
                        highlight: i % 2 === 1,
                    });
                }
            }
        }
        // 3. 如果新数据比原来少，多余的节点隐藏（一般不会发生）
        else if (rows.length < this._itemNodes.length) {
            for (let i = rows.length; i < this._itemNodes.length; i++) {
                this._itemNodes[i].active = false;
            }
        }

        // 4. 更新 content 高度
        content.height = Math.max(rows.length * this.ITEM_HEIGHT, content.parent.height);
    }

    // private renderLiveLeaderboard(columnar: any) {
//////    //     // console.log("[TII] renderLiveLeaderboard | rankingContent:", !!this.rankingContent, "| rankingItemTemplate:", !!this.rankingItemTemplate, "| columnar.id length:", columnar?.id?.length);
    //     if (!this.rankingContent || !this.rankingItemTemplate) {
    //         console.warn("[TII] renderLiveLeaderboard aborted — rankingContent or rankingItemTemplate not wired in inspector");
    //         return;
    //     }
    //     this._hasLiveLeaderboardData = true;
    //     const gm = (globalThis as any).GameManager;
    //     const isOver = columnar.phase === "over";
    //     const n = columnar.id?.length ?? 0;

    //     const rows: any[] = [];
    //     for (let i = 0; i < n; i++) {
    //         rows.push({
    //             rank: columnar.rk?.[i] ?? (i + 1),
    //             playerId: columnar.id?.[i],
    //             playerName: columnar.nm?.[i] ?? "",
    //             chips: isOver ? 0 : (columnar.c?.[i] ?? 0),
    //             rebuys: isOver ? 0 : (columnar.rb?.[i] ?? 0),
    //             addons: isOver ? 0 : (columnar.ad?.[i] ?? 0),
    //         });
    //     }

//////    //     // console.log("[TII] renderLiveLeaderboard rows:", rows);
    //     this.rankingContent.removeAllChildren();
    //     rows.forEach((p, i) => {
    //         const item = cc.instantiate(this.rankingItemTemplate);
    //         item.active = true;
    //         this.rankingContent.addChild(item);
    //         const isMe = String(p.playerId) === String(gm?.user?.playerId);
    //         const comp = item.getComponent("InGamingRankingTemplate") as any;
    //         if (comp?.setData) {
    //             comp.setData({
    //                 rank: p.rank,
    //                 playerName: p.playerName,
    //                 chips: p.chips,
    //                 rebuys: p.rebuys,
    //                 addons: p.addons,
    //                 isMe,
    //                 highlight: i % 2 === 1,
    //             });
    //         }
    //     });
    //     const me = rows.find((p) => String(p.playerId) === String(gm?.user?.playerId));
    //     if (me && (me.rank ?? 0) > 0) this._myPosition = me.rank;
    //     if (this.myPositionLabel) this.myPositionLabel.string = this._myPosition > 0 ? `${this._myPosition}` : "0";

    //     if (this.myEntryNode) {
    //         this.myEntryNode.active = !!me;
    //         if (me) {
    //             const comp = this.myEntryNode.getComponent("InGamingRankingTemplate") as any;
    //             if (comp?.setData) {
    //                 comp.setData({ rank: me.rank, playerName: me.playerName, chips: me.chips, rebuys: me.rebuys, addons: me.addons, isMe: true });
    //             }
    //         }
    //     }
    // }

    // ── Tab switching ────────────────────────────────────────────────────────

    switchTab(_event: cc.Event, customData: string) {
        this.setTabActive(parseInt(customData) as INGAME_TAB);
    }

    private setTabActive(tab: INGAME_TAB) {
        this.tabPages.forEach((page, i) => { page.active = i === tab; });
        this.tabBtns.forEach((btn, i) => {
            const lbl = btn.getComponent(cc.Label) ?? btn.getChildByName("Label")?.getComponent(cc.Label);
            const isActive = i === tab;
            if (lbl) lbl.node.color = isActive ? this.tabActiveColor : this.tabInactiveColor;
            const underline = btn.getChildByName("Underline") ?? btn.getChildByName("TabSelected");
            if (underline) underline.active = isActive;
        });
    }

    onBackBtnClick() {
        GameManager.off("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);
        GameManager.off("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
        GameManager.off("Tournament:Update", this._boundBlindUpdate);
        this.closeSelf();
        GameManager.emit("showJoinSimlar");
    }

    setData(tourData: any) {
        if (!tourData) return;
        this._tourData = tourData;
        this._breakStartRemaining = 0;
        this.updateData();
    }

    reset() {
        this.unschedule(this.tickTimer);
        this._clearBreakEndTimer();
        // if (this.rankingContent) this.rankingContent.removeAllChildren();
        if (this.prizesContent) this.prizesContent.removeAllChildren();
        // if (this.tablesContent) this.tablesContent.removeAllChildren();
        if (this.blindsContent) this.blindsContent.removeAllChildren();
        this._tourData = null;
        this._countdownTarget = 0;
        this._breakStartRemaining = 0;
    }

    // ── Data ─────────────────────────────────────────────────────────────────

    private onTournamentRefresh(data: any) {
        if (!data || !this._tourData || data._id !== this._tourData.id) return;
        this._tourData = data;
        this.updateData();
        this._fetchFreshTourData();
    }

    updateData() {
        const K = (globalThis as any).K;
//////        // console.log("[TII] updateData | GoToTable:", K?.GoToTable, "| tourData:", !!this._tourData);
        if (K?.GoToTable) return;
        if (!this._tourData) return;
        const t2 = this._tourData;
        const raw2 = t2;
//////        // console.log("[TII] data check | leaderBoard:", (t2.leaderBoard ?? raw2.leaderBoard ?? []).length,
        // "| payouts:", (raw2.playersPayout ?? t2.playersPayout ?? []).length,
        //     "| blindRules:", (t2.blindRule?.blindRuleArr ?? raw2.blindRule?.blindRuleArr ?? []).length,
        //     "| tableList:", (raw2.tableList ?? t2.tablesStack ?? []).length,
        //     "| tabPages:", this.tabPages.length
        // );
        this.updateHeader();
        this.updateRanking();
        this.updatePrizes();
        this.updateTables();
        this.updateBlinds();
    }

    // ── Header ───────────────────────────────────────────────────────────────

    private updateHeader() {
        const t = this._tourData;
        const raw = t;
//////        // console.log("[TII] updateHeader | tournamentName:", raw.tournamentName ?? t.tournamentName ?? "", "| alltableStack:", raw.alltableStack, "| currentBlindLevel:", raw.currentBlindLevel);
        if (this.tournamentNameLabel) this.tournamentNameLabel.string = raw.tournamentName ?? t.tournamentName ?? "";

        const cur = raw.currentBlindLevel;
        if (this.currentLevelLabelHeading) {
            this.currentLevelLabelHeading.string = `Current Level: Level ${cur?.level ?? 0}`;
        }
        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = `${cur?.smallBlind ?? 0}/${cur?.bigBlind ?? 0}/${cur?.ante ?? 0}`;
        }

        const nextBlind = this.getNextBlindLevel(raw);
        if (this.nextLevelLabelHeading) {
            this.nextLevelLabelHeading.string = `Next Level: Level ${nextBlind?.level ?? 0}`;
        }
        if (this.nextLevelLabel && nextBlind) {
            this.nextLevelLabel.string = `${nextBlind.smallBlind}/${nextBlind.bigBlind}/${nextBlind.ante ?? 0}`;
        }

        // Stats row 1
        if (this.myPositionLabel) {
            if (this._myPosition <= 0) {
                const myRank = this.getMyRank(t.leaderBoard ?? []);
                if (myRank > 0) this._myPosition = myRank;
            }
            this.myPositionLabel.string = this._myPosition > 0 ? `${this._myPosition}` : "0";
        }
        if (this.entriesLabel) this.entriesLabel.string = `${raw.activePlayerCount ?? 0}/${raw.totalBuyins ?? 0}`;
        if (this.prizePoolLabel) this.prizePoolLabel.string = this.formatChips(t.guaranteedValue ?? 0);
        if (this.statusLabel) {
            const _startRaw = raw.tournamentStartDetails?.startTime ?? raw.tournamentStartTime ?? 0;
            const _startN = Number(_startRaw);
            const _startMs = (!isNaN(_startN) && _startN > 0)
                ? (_startN > 9999999999 ? _startN : _startN * 1000)
                : new Date(String(_startRaw)).getTime();
            this.startRunningTimer(_startMs);
        }

        // Stats row 2
        const avgStack = raw.alltableStack?.avgStack ?? t.avgStack ?? 0;
        const maxStack = raw.alltableStack?.maxStack ?? t.maxStack ?? 0;
        const minStack = raw.alltableStack?.minStack ?? t.minStack ?? 0;

        if (this.avgStackLabel) this.avgStackLabel.string = this.formatChips(avgStack);
        if (this.totalBuyInsLabel) this.totalBuyInsLabel.string = `${(raw.uniqueEntries ?? 0) + (raw.reentriesCount ?? 0)}`;
        if (this.addOnsLabel) this.addOnsLabel.string = `${raw.totalAddons ?? 0}`;

        // Stats row 3
        if (this.largestStackLabel) this.largestStackLabel.string = this.formatChips(maxStack);
        if (this.smallerStackLabel) this.smallerStackLabel.string = this.formatChips(minStack);
        if (this.rebuysLabel) this.rebuysLabel.string = `${raw.totalRebuys ?? 0}`;

        // table-level break (gameData.break) is a fallback source — server sometimes
        // reflects break state there before tourData.currentBreakDetails is refreshed
        const tableBreak = this._pokerModel?.gameData?.break;
        const breakEndTimeMs = raw.breakEndsAt
            ? Number(raw.breakEndsAt)
            : typeof raw.currentBreakDetails?.breakEndTime === 'number'
                ? raw.currentBreakDetails.breakEndTime
                : Number(raw.currentBreakDetails?.breakEndTime ?? tableBreak?.breakEndTime ?? 0);
        const isBreakActive = breakEndTimeMs > 0 && breakEndTimeMs > Date.now();
        const ctbEndTimeMs = typeof raw.currentTournamentBreak?.breakEndTime === 'number'
            ? raw.currentTournamentBreak.breakEndTime
            : Number(raw.currentTournamentBreak?.breakEndTime ?? 0);
        const isCtbActive = ctbEndTimeMs > 0 && ctbEndTimeMs > Date.now();
        const tableBreakEndMs = typeof tableBreak?.breakEndTime === 'number' ? tableBreak.breakEndTime : Number(tableBreak?.breakEndTime ?? 0);
        const isTableBreakActive = !!tableBreak?.active && tableBreakEndMs > Date.now();
        const isInBreak = !!(
            (raw.isInBreak && isBreakActive) ||
            (raw.breakEndsAt && breakEndTimeMs > Date.now()) ||
            (raw.currentTournamentBreak && Object.keys(raw.currentTournamentBreak).length > 0 && isCtbActive) ||
            isTableBreakActive
        );
//////        // console.log("[TII] updateHeader break check | isInBreak:", isInBreak,
        //     "| raw.isInBreak:", raw.isInBreak, "| isBreakActive:", isBreakActive, "| breakEndTimeMs:", breakEndTimeMs,
        //     "| isCtbActive:", isCtbActive, "| ctbEndTimeMs:", ctbEndTimeMs,
        //     "| tableBreak.active:", tableBreak?.active, "| isTableBreakActive:", isTableBreakActive,
        //     "| _breakStartRemaining:", this._breakStartRemaining, "| _countdownTarget:", this._countdownTarget);
        if (isInBreak) {
            this._pauseBlindTimerForBreak(cur, tableBreak);
        } else {
            if (this._breakStartRemaining > 0) {
                const _pbtNextRaw = cur?.nextBlindLevelTime ?? 0;
                const _pbtNextMs = _pbtNextRaw > 1000000000 ? _pbtNextRaw * 1000 : _pbtNextRaw;
//////                // console.log("[TII] updateHeader | break ended — resuming | _breakStartRemaining:", this._breakStartRemaining, "| _pbtNextMs:", _pbtNextMs, "| now:", Date.now(), "| _pbtNextMs future?", _pbtNextMs > Date.now());
                if (_pbtNextMs > 0 && _pbtNextMs > Date.now()) {
                    this._breakStartRemaining = 0;
                    this.startTimer(_pbtNextMs);
                } else {
                    this._resumeBlindTimerAfterBreak();
                }
                // Do NOT close panel — user intentionally opened it after break ended.
                // Auto-close is handled by _breakEndTimer when break ends while panel is open.
            } else {
                const rules: any[] = raw.blindRule?.blindRuleArr ?? [];
                const curLevel = cur?.level ?? 0;
                const isLastLevel = rules.length === 0 || (rules.length > 0 && String(rules[rules.length - 1].level ?? 0) === String(curLevel));
                if (isLastLevel) {
                    this._countdownTarget = 0;
                    this.unschedule(this.tickTimer);
                    this.tickTimer();
                } else {
                    const nextBlindTime = cur?.nextBlindLevelTime ?? 0;
                    const nextBlindMs = nextBlindTime > 1000000000 ? nextBlindTime * 1000 : nextBlindTime;
//////                    // console.log("[TII] updateHeader | normal countdown | level:", cur?.level, "| nextBlindTime:", nextBlindTime, "| nextBlindMs:", nextBlindMs, "| now:", Date.now());
                    if (nextBlindMs > 0 && nextBlindMs > Date.now()) {
//////                        // console.log("[TII] updateHeader | startTimer | nextBlindMs:", nextBlindMs, "| remaining:", nextBlindMs - Date.now());
                        this.startTimer(nextBlindMs);
                    } else if (nextBlindMs > 0) {
                        // nextBlindMs is in the past — only kill timer if nothing else is running.
                        // If timer was resumed from break (_countdownTarget still future), keep it.
                        if (this._countdownTarget > 0 && this._countdownTarget > Date.now()) {
//////                            // console.log("[TII] updateHeader | nextBlindMs past BUT timer running — keeping | _countdownTarget:", this._countdownTarget, "| remaining:", this._countdownTarget - Date.now());
                        } else {
//////                            // console.log("[TII] updateHeader | nextBlindMs in the past & no running timer — 00:00");
                            this.unschedule(this.tickTimer);
                            this._countdownTarget = 0;
                            if (this.timerLabel) this.timerLabel.string = "00:00";
                        }
                    } else {
                        // nextBlindLevelTime = 0 — only show 00:00 if nothing running.
//////                        // console.log("[TII] updateHeader | nextBlindLevelTime=0 | _countdownTarget:", this._countdownTarget);
                        if (this._countdownTarget <= 0 && this.timerLabel) this.timerLabel.string = "00:00";
                    }
                }
            }
        }
    }

    // Entry point 1: player already in gameplay with a live blind countdown when the
    // break event/broadcast arrives — freeze the display at whatever it currently shows.
    private _freezeLiveBlindCountdown() {
        this._breakStartRemaining = Math.max(0, this._countdownTarget - Date.now());
//////        // console.log("[TII] _freezeLiveBlindCountdown | _countdownTarget:", this._countdownTarget, "| captured _breakStartRemaining:", this._breakStartRemaining);
    }

    // Entry point 2: player opens panel while break is already in progress — no live
    // countdown to freeze. The server extends nextBlindLevelAt by the break duration, so:
    //   remaining_blind_time = nextBlindLevelAt - breakEndTime
    private _freezeBlindCountdownOnReload(cur: any, tableBreak: any) {
        const raw = this._tourData;
        const tableDetails = this._pokerModel?.gameData?.tableDetails;
        const breakEndMs: number = Number(
            raw?.breakEndsAt                            // Res-GetTournamentData
            ?? tableBreak?.breakEndTime                 // joinChannel / enterTable / break events
            ?? raw?.currentBreakDetails?.breakEndTime
            ?? raw?.currentTournamentBreak?.breakEndTime
            ?? 0
        );

        // nextBlindLevelTime from server is seconds when ~10 digits (e.g. 1784727850).
        // Threshold 10_000_000_000 separates seconds (≤10 digits) from ms (13 digits).
        const nextBlindRaw: number = cur?.nextBlindLevelTime ?? 0;
        const nextBlindFromCur: number = nextBlindRaw > 10_000_000_000
            ? nextBlindRaw          // already ms
            : nextBlindRaw > 0
                ? nextBlindRaw * 1000   // seconds → ms
                : 0;

        const nextBlindAtMs: number = tableDetails?.nextBlindLevelAt ?? 0;

        // Prefer whichever source is >= breakEndMs — that's the server-extended value.
        let nextBlindMs = 0;
        if (nextBlindFromCur >= breakEndMs && nextBlindFromCur > 0) {
            nextBlindMs = nextBlindFromCur;
        } else if (nextBlindAtMs >= breakEndMs && nextBlindAtMs > 0) {
            nextBlindMs = nextBlindAtMs;
        } else if (nextBlindFromCur > 0) {
            nextBlindMs = nextBlindFromCur;
        } else {
            nextBlindMs = nextBlindAtMs;
        }

        const result = breakEndMs > 0 && nextBlindMs > 0 ? Math.max(0, nextBlindMs - breakEndMs) : 0;
//////        // console.log("[TII] _freezeBlindCountdownOnReload | breakEndMs:", breakEndMs,
        //     "| nextBlindFromCur (ms):", nextBlindFromCur,
        //     "| nextBlindAtMs:", nextBlindAtMs,
        //     "| nextBlindMs chosen:", nextBlindMs,
        //     "| result _breakStartRemaining:", result > 0 ? result : "NOT SET");
        if (result > 0) {
            this._breakStartRemaining = result;
        }
    }

    private _pauseBlindTimerForBreak(cur: any, tableBreak: any) {
        this.unschedule(this.tickTimer);
        const raw = this._tourData;
        const breakEndMs: number = Number(
            raw?.breakEndsAt                            // Res-GetTournamentData
            ?? tableBreak?.breakEndTime                 // joinChannel / enterTable / break events
            ?? raw?.currentBreakDetails?.breakEndTime
            ?? raw?.currentTournamentBreak?.breakEndTime
            ?? 0
        );

        const alreadyFrozen = this._breakStartRemaining > 0;
        if (!alreadyFrozen) {
            this._freezeBlindCountdownOnReload(cur, tableBreak);
            if (this._breakStartRemaining === 0 && this._countdownTarget > 0) {
                this._freezeLiveBlindCountdown();
            }
        }

//////        // console.log("[TII] _pauseBlindTimerForBreak | alreadyFrozen:", alreadyFrozen,
        //     "| _breakStartRemaining:", this._breakStartRemaining,
        //     "| _countdownTarget:", this._countdownTarget,
        //     "| breakEndMs:", breakEndMs);

        this._countdownTarget = 0;
        if (this.timerLabel) {
            if (this._breakStartRemaining > 0) {
                const m = Math.floor(this._breakStartRemaining / 60000);
                const s = Math.floor((this._breakStartRemaining % 60000) / 1000);
                this.timerLabel.string = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

                this.timerLabel.string = 'BREAK TIME';
//////                // console.log("[TII] _pauseBlindTimerForBreak | showing frozen blind time:", this.timerLabel.string);
            } else if (breakEndMs > 0 && breakEndMs > Date.now()) {
                // Fallback: blind remaining unknown — show break countdown.
                // breakEndMs is a server timestamp, so it's identical across all devices.
                this._countdownTarget = breakEndMs;
                this.tickTimer();
                this.schedule(this.tickTimer, 0.5);
//////                // console.log("[TII] _pauseBlindTimerForBreak | no freeze data — showing break countdown:", this.timerLabel.string);
            } else {
//////                // console.log("[TII] _pauseBlindTimerForBreak | no data — showing MAX");
                this.tickTimer();
            }
        }

        this._clearBreakEndTimer();
        const delay = breakEndMs > 0 ? breakEndMs - Date.now() : 0;
//////        // console.log("[TII] _pauseBlindTimerForBreak | delay ms:", delay, "| auto-close timer set:", delay > 0);
        if (delay > 0) {
            this._breakEndTimer = setTimeout(() => {
                this._breakEndTimer = -1;
//////                // console.log("[TII] _breakEndTimer fired — resuming blind timer and closing panel");
                this._resumeBlindTimerAfterBreak();
                this.onBackBtnClick();
            }, delay) as unknown as number;
        }
    }

    private _clearBreakEndTimer() {
        if (this._breakEndTimer !== -1) {
            clearTimeout(this._breakEndTimer);
            this._breakEndTimer = -1;
        }
    }

    private _resumeBlindTimerAfterBreak() {
        this._clearBreakEndTimer();
        const remaining = this._breakStartRemaining;
        this._countdownTarget = Date.now() + remaining;
        this._breakStartRemaining = 0;
//////        // console.log("[TII] _resumeBlindTimerAfterBreak | resuming with remaining ms:", remaining, "| new _countdownTarget:", this._countdownTarget);
        this.tickTimer();
        this.schedule(this.tickTimer, 0.5);
    }

    private startTimer(targetMs: number) {
        this.unschedule(this.tickTimer);
        this._countdownTarget = targetMs;
        this.tickTimer();
        this.schedule(this.tickTimer, 0.5);
    }

    private tickTimer() {
        if (!this.timerLabel) {
            console.warn("[TII] timerLabel is null — not wired in inspector?");
            return;
        }
        if (this._countdownTarget <= 0) {
            this.timerLabel.string = "MAX";
            if (this._tourData.isAddOn) {
                this.timerLabel.string = "ADDON BREAK";
            }
            return;
        }
        const remaining = Math.max(0, this._countdownTarget - Date.now());
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        this.timerLabel.string = display;

////        console.log('this._tourData.isAddon3');
        if (this._tourData.isAddOn) {
            this.timerLabel.string = "ADDON BREAK";
        }


        if (remaining === 0) {
            this.unschedule(this.tickTimer);
            this._countdownTarget = 0;
        }
    }

    private startRunningTimer(startMs: number) {
//////        console.log('startRunningTimer');
        this.unschedule(this.tickRunningTimer);
        this._runningStart = startMs;
        this.tickRunningTimer();
        this.schedule(this.tickRunningTimer, 1);
    }

    private tickRunningTimer() {
//////        console.log('tickRunningTimer');
        if (!this.statusLabel) return;
        const elapsed = this._runningStart > 0 ? Math.max(0, Date.now() - this._runningStart) : 0;
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        this.statusLabel.string = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    // ── Ranking tab ──────────────────────────────────────────────────────────

    private updateRanking() {
        if (!this.rankingContent || !this.rankingItemTemplate) return;
        // Live TournamentLeaderboard pushes supersede this static snapshot —
        // skip so periodic Tournament:Refresh doesn't wipe the live render.
        if (this._hasLiveLeaderboardData) return;
        const t = this._tourData;
        const leaderBoard: any[] = t.leaderBoard ?? [];
        const gm = (globalThis as any).GameManager;

        // this.rankingContent.removeAllChildren();

        leaderBoard.forEach((p: any, i: number) => {
            const item = cc.instantiate(this.rankingItemTemplate);
            item.active = true;
            this.rankingContent.addChild(item);

            const rank = t.state === "Open To Register" ? 1 : i + 1;
            const isMe = String(p.playerId) === String(gm?.user?.playerId);

            const comp = item.getComponent("InGamingRankingTemplate") as any;
            if (comp?.setData) {
                comp.setData({
                    rank,
                    playerName: p.playerName,
                    chips: p.chips ?? 0,
                    rebuys: p.rebuys ?? 0,
                    addons: p.addons ?? 0,
                    isMe,
                    highlight: i % 2 === 1
                });
            }
        });

        // bottom my-entry bar
        if (this.myEntryNode) {
            const myRank = this.getMyRank(leaderBoard);
            const me = leaderBoard.find((p: any) => String(p.playerId) === String(gm?.user?.playerId));
            const found = !!me && myRank > 0;
            this.myEntryNode.active = found;
            if (found) {
                const comp = this.myEntryNode.getComponent("InGamingRankingTemplate") as any;
                if (comp?.setData) {
                    comp.setData({ rank: myRank, playerName: me.playerName, chips: me.chips ?? 0, rebuys: me.rebuys ?? 0, addons: me.addons ?? 0, isMe: true });
                }
            }
        }
    }

    // ── Prizes tab ───────────────────────────────────────────────────────────

    private updatePrizes() {
        if (!this.prizesContent || !this.prizeItemTemplate) return;
        const t = this._tourData;
        const raw = t;
        const payoutRecord: any[] = raw.playersPayout ?? t.playersPayout ?? [];
        const guaranteed: number = raw.guaranteedValue ?? t.guaranteedValue ?? 0;

        this.prizesContent.removeAllChildren();
        payoutRecord.forEach((p: any, i: number) => {
            const item = cc.instantiate(this.prizeItemTemplate);
            item.active = true;
            this.prizesContent.addChild(item);

            const pct = p.payoutAmount;
            const prizeAmount = pct;
            const rankRaw = p.playerRank ?? p.rank ?? "";
            const rankDisplay = typeof rankRaw === "string" ? rankRaw.replace(/\D/g, "") : `${rankRaw}`;
            const comp = item.getComponent("PrizesRow") as any;
            if (comp?.setData) {
                comp.setData({ rank: rankDisplay, prize: this.formatChips(prizeAmount) }, i % 2 === 1);
            }
        });
    }

    // ── Tables tab ───────────────────────────────────────────────────────────

    private updateTables() {
//////        // console.log("[TII] updateTables | tablesContent:", !!this.tablesContent, "| tableItemTemplate:", !!this.tableItemTemplate);
        // if (!this.tablesContent || !this.tableItemTemplate) return;
        const t = this._tourData;
        const raw = t;
        const tables: any[] = (t.tables?.length ? t.tables : null) ?? raw.tableList ?? (t.tablesStack?.length ? t.tablesStack : null) ?? [];
//////        // console.log("[TII] updateTables | t.tables:", t.tables?.length, "| raw.tableList:", raw.tableList?.length, "| t.tablesStack:", t.tablesStack?.length, "| final tables:", tables.length, "| raw:", raw === t ? "same" : "separate");

        if (this.tablesLeftLabel) this.tablesLeftLabel.string = `${tables.length}`;

        const _activeModels: any[] = (window as any).GameManager?.gameModel?.activePokerModels ?? [];
        // Only consider a model "active in THIS tournament" if its channelId is one of
        // this tournament's known tables — prevents a different-tournament table in slot 1
        // from blocking an observer from switching within this tournament.
        const _thisTourChannelIds = new Set(tables.map((s: any) => s.tableId ?? s.channelId ?? s.id));
        const _mySeatedModel = _activeModels.find((m: any) => {
            const pres = m?.presenter;
            // roomConfig.channelType is set directly from the join response in PokerModel
            // (this.roomConfig = data.roomConfig) — unlike gameData.channelType, it doesn't
            // depend on a manual patch that only runs for specific join paths, so it's
            // reliably correct regardless of how this model's table was joined.
            const isTournamentTable = m?.roomConfig?.channelType === "TOURNAMENT";
            const isThisTournament = _thisTourChannelIds.has(m?.gameData?.channelId);
            return isTournamentTable && isThisTournament && pres && typeof pres.isObserver2 === "function" && !pres.isObserver2();
        });
        this.isActivePlayer = !!_mySeatedModel;
        this.myTableId = _mySeatedModel?.gameData?.channelId;

        this.tables = tables;



        const listComp = cc.find("Bg/MainNode/TabPage/Tables/scrollView", this.node).getComponent(YXCollectionView);
        listComp.numberOfItems = () => this.tables.length;
        listComp.reloadData();
    }

    private _navigateToTable(tableData: any) {
//////        // console.log("[TII] _navigateToTable ENTRY | tableData:", tableData);
        if (!tableData) { console.warn("[TII] _navigateToTable | no tableData, abort"); return; }
        if (this._navCleanupTimer !== -1) {
            clearTimeout(this._navCleanupTimer);
            this._navCleanupTimer = -1;
        }
        const channelId = tableData.channelId ?? tableData.tableId;
        const gm = (window as any).GameManager;
        const playerId = gm?.user?.playerId;
//////        // console.log("[TII] _navigateToTable | channelId:", channelId, "playerId:", playerId);
        if (!channelId || !playerId) { console.warn("[TII] _navigateToTable | missing channelId or playerId, abort"); return; }

        const gms = (window as any).GameScreen;
        const pageView = gms?.gridParent?.getComponent?.(cc.PageView);
        const modList: any[] = gm?.gameModel?.activePokerModels ?? [];
//////        // console.log("[TII] _navigateToTable | pageView:", !!pageView, "modList count:", modList.length);

        // Scan for existing slot with this channelId — remove if stale, switch to if valid
        let indexFound = 0;
        for (let i = modList.length - 1; i >= 0; i--) {
            const m = modList[i];
            const mChannelId = m?.gameData?.channelId;
            const mValid = cc.isValid(m?.node) && m?.node?.active;
//////            // console.log("[TII] _navigateToTable | model[", i, "] channelId:", mChannelId, "valid+active:", mValid);
            if (m == this._pokerModel) {
                indexFound = i;
            }
            if (mChannelId === channelId) {
                if (mValid) {
//////                    // console.log("[TII] _navigateToTable | valid existing slot at", i, "— switching PageView to it");
                    const popup = cc.find("Canvas/TournamentLobbyDetail");
                    if (popup) popup.active = false;
                    gm.popUpManager?.hideAllPopUps();
                    if (pageView) pageView.setCurrentPageIndex(i);
                    return;
                } else {
//////                    // console.log("[TII] _navigateToTable | stale slot for target channelId at", i, "— removing");
                    try { if (pageView && cc.isValid(m?.node)) pageView.removePage(m.node); } catch (e) { console.error("[TII] removePage stale error:", e); }
                    modList.splice(i, 1);
                }
            }
        }

        const rawSocket = (window as any).TournamentSocket;
//////        // console.log("[TII] _navigateToTable | rawSocket:", !!rawSocket);
        if (!rawSocket) return;

        this._installScreenManagerGuard();
        TournamentInGameInfo.isSwitchingTables = true;
        if (this._switchGuardTimer !== -1) clearTimeout(this._switchGuardTimer);
        this._switchGuardTimer = setTimeout(() => {
            this._switchGuardTimer = -1;
            TournamentInGameInfo.isSwitchingTables = false;
        }, 8000);

        const t = this._tourData;
        const tourDataRef = t;
//////        // console.log("[TII] _navigateToTable | tourDataRef.raw exists:", !!(tourDataRef?.raw));

        if (typeof rawSocket.prependAny === "function") {
            const joinHandler = (event: string, response: any) => {
//////                // console.log("[TII] joinHandler | event:", event, "eventOrigin:", response?.eventOrigin);
                if (event !== "commonEventResponse" || response?.eventOrigin !== "room.channelHandler.switchObserverTable") return;
                rawSocket.offAny(joinHandler);
                const res = response?.data;
                let gameData = res;
//////                // console.log("[TII] joinHandler | success:", res?.success, "channelId:", res?.channelId);

                this._pokerModel.switchObserverTable = false;

                if (!res?.success) {
                    console.warn("[TII] joinHandler | join failed");
                    if (this._switchGuardTimer !== -1) { clearTimeout(this._switchGuardTimer); this._switchGuardTimer = -1; }
                    TournamentInGameInfo.isSwitchingTables = false;
                    GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                    return;
                }
                if (!res.antibanking) res.antibanking = { isAntiBanking: false, amount: 0, timeRemains: 0 };
                if (!res.playerName) res.playerName = (window as any).GameManager?.user?.userName || "";
                gameData.channelId = channelId;
                gameData.tourData = tourDataRef;
                try {
                    // res.gameData = new GameData(res);
                    if (res.roomConfig) gameData.channelType = gameData.roomConfig.channelType;
                } catch (e) { cc.warn("[TII] GameData error", e); }
                const _pvBefore = (window as any).GameScreen?.gridParent?.getComponent?.(cc.PageView);
//////                // console.log("[TII] joinHandler | calling showScreen | pageCount before:", _pvBefore?.getPages()?.length, "| activePokerModels:", ((window as any).GameManager?.gameModel?.activePokerModels ?? []).map((m: any) => m?.gameData?.channelId));
                gameData.isRejoin = true;
                gameData.__isReshuffle = true;
                gameData.indexFound = indexFound;
                (window as any).ScreenManager.showScreen((window as any).K?.ScreenEnum?.GamePlayScreen, gameData, () => { });
            };
            rawSocket.prependAny(joinHandler);
//////            // console.log("[TII] _navigateToTable | prependAny joinHandler registered");
        } else {
            console.warn("[TII] _navigateToTable | prependAny not available");
        }

        // Send observerLeave for current observer table BEFORE joining the new one
        for (let i = 0; i < modList.length; i++) {
            const m = modList[i];
            const mChannelId = m?.gameData?.channelId;
            if (!mChannelId || mChannelId === channelId) continue;
            let mIsObs = false;
            try { mIsObs = m?.presenter?.isObserver?.() ?? false; } catch (e) { }
            if (mIsObs) {
//////                // console.log("[TII] _navigateToTable | observerLeave BEFORE join →", mChannelId);

                // rawSocket.prependAny(function onJoinResponse(event, response) {
                //     if (event !== "commonEventResponse" || response?.eventOrigin !== "room.channelHandler.observerLeave") return;
//////                //     console.log('caught');
                //     rawSocket.emit("common", {
                //         eventName: "room.channelHandler.joinChannel",
                //         data: {
                //             playerId,
                //             channelId,
                //             channelType: "TOURNAMENT",
                //             isRequested: true,
                //             tableId: "",
                //             isPrivateTable: "false",
                //             playerName: gm?.user?.userName || "",
                //             networkIp: (window as any).LoginData?.ipV4Address || "",
                //             isRejoin: false,
                //             maxPlayers: 2,
                //         }
                //     });
                // });

                // rawSocket.emit("common", {
                //     eventName: "room.channelHandler.observerLeave",
                //     data: {
                //         playerId,
                //         channelId: mChannelId,
                //         isStandup: false,
                //         playerName: gm?.user?.userName || "",
                //         isRequested: true,
                //     }
                // });

                this._pokerModel.switchObserverTable = true;
                rawSocket.emit("common", {
                    eventName: "room.channelHandler.switchObserverTable",
                    data: {
                        channelId: channelId,
                        fromChannelId: mChannelId,
                        channelType: "TOURNAMENT",
                        tableId: channelId,
                        playerId,
                        playerName: gm?.user?.userName || "",
                        isRequested: true,
                    }
                });
            }
        }

//////        // console.log("[TII] _navigateToTable | emitting joinChannel for:", channelId);
        // rawSocket.emit("common", {
        //     eventName: "room.channelHandler.joinChannel",
        //     data: {
        //         playerId,
        //         channelId,
        //         channelType: "TOURNAMENT",
        //         isRequested: true,
        //         tableId: "",
        //         isPrivateTable: "false",
        //         playerName: gm?.user?.userName || "",
        //         networkIp: (window as any).LoginData?.ipV4Address || "",
        //         isRejoin: false,
        //         maxPlayers: 2,
        //     }
        // });
    }

    private showCannotViewToast() {
        if (!this.cannotViewToast) return;
        if (this.cannotViewToastLabel) this.cannotViewToastLabel.string = "Cannot view other table while playing";
        this.cannotViewToast.active = true;
        this.scheduleOnce(() => {
            if (this.cannotViewToast) this.cannotViewToast.active = false;
        }, 2);
    }

    onCannotViewToastClose() {
        if (this.cannotViewToast) this.cannotViewToast.active = false;
    }

    // ── Blinds tab ───────────────────────────────────────────────────────────

    private updateBlinds() {
        if (!this.blindsContent || !this.blindItemTemplate) return;
        const t = this._tourData;
        const raw = t;
        const blindRules: any[] = t.blindRule?.blindRuleArr ?? raw.blindRule?.blindRuleArr ?? [];
        const currentLevel = raw.currentBlindLevel?.level ?? 0;
        // rebuy/addOn levels are usually sent as a single "last allowed level" number
        // (lastRebuy/lastAddon), meaning rebuy/addon is allowed for every level up to
        // and including it — not as an explicit array — so build that range instead of
        // trusting rebuyAllowedBlindLevels/addOnAllowedBlindLevels to be populated.
        const lastRebuy: number = raw.rebuy?.lastRebuy ?? 0;
        const rebuyLevels: number[] = lastRebuy > 0
            ? Array.from({ length: lastRebuy }, (_, i) => i + 1)
            : (raw.rebuy?.rebuyAllowedBlindLevels ?? []);
        const lastAddon: number = raw.addOn?.lastAddon ?? 0;
        const addOnLevels: number[] = raw.addOn?.addOnAllowedBlindLevels?.length > 0
            ? raw.addOn.addOnAllowedBlindLevels
            : (lastAddon > 0 ? [lastAddon] : []);
//////        // console.log("[TII] updateBlinds | raw.rebuy:", JSON.stringify(raw.rebuy), "| raw.addOn:", JSON.stringify(raw.addOn), "| rebuyLevels:", JSON.stringify(rebuyLevels), "| addOnLevels:", JSON.stringify(addOnLevels), "| blindRules.length:", blindRules.length);

        this.blindsContent.removeAllChildren();
        blindRules.forEach((b: any, i: number) => {
            const item = cc.instantiate(this.blindItemTemplate);
            item.active = true;
            this.blindsContent.addChild(item);

            const comp = item.getComponent("BlindStructureRow") as any;
            if (comp?.setData) {
                const rowData = Object.assign({}, b, {
                    isRebuy: rebuyLevels.includes(b.level),
                    isAddon: addOnLevels.includes(b.level)
                });
//////                // console.log("[TII] updateBlinds row | level:", b.level, "| isRebuy:", rowData.isRebuy, "| isAddon:", rowData.isAddon, "| comp found:", !!comp, "| rebuyIcon wired:", !!comp?.rebuyIcon, "| addonIcon wired:", !!comp?.addonIcon);
                comp.setData(rowData, b.level === currentLevel, i % 2 === 1);
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private getNextBlindLevel(raw: any): any {
        const rules: any[] = raw?.blindRule?.blindRuleArr ?? [];
        const curLevel = raw?.currentBlindLevel?.level;
        const idx = rules.findIndex((b: any) => b.level === curLevel);
        if (idx === -1) return null;
        return rules[Math.min(idx + 1, rules.length - 1)];
    }

    private getMyRank(leaderBoard: any[]): number {
        const gm = (globalThis as any).GameManager;
        const idx = leaderBoard.findIndex((p: any) => String(p.playerId) === String(gm?.user?.playerId));
        return idx >= 0 ? idx + 1 : 0;
    }

    private formatChips(amount: number): string {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(2)}M`;
        }
        if (amount >= 1000) {
            const v = amount / 1000;
            return `${Number.isInteger(v) ? v : parseFloat(v.toFixed(2))}K`;
        }
        return `${amount}`;
    }
    private showToast(message: string, duration: number = 2) {
        if (!this.toastNode || !this.toastLabel) return;
        //  this.toastLabel.string = message;
        this.toastNode.active = true;
        this.scheduleOnce(() => {
            if (this.toastNode) this.toastNode.active = false;
        }, duration);
    }
}
