import TablesRow from "./TablesRow";
import { GameData } from "../../DataFormats/ResponseTypes";
var PopUpType = require('../../Utilities/ScreensAndPopUps/PopUps/PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

declare const GameManager: any;

@ccclass
export default class TablesHandler extends cc.Component {

    @property(cc.Label) tablesLeftLabel: cc.Label = null!;
    @property(cc.ScrollView) scrollView: cc.ScrollView = null!;
    @property(cc.Node) rowPrefabNode: cc.Node = null!;

    private _tourData: any = null;
    // Set by TournamentInfoHandler.feedTables() to TournamentInfoHandler.enterTable.bind(this) —
    // reused as-is (existing-model match + server fallback) to send an active participant back
    // to their own assigned table, instead of duplicating that logic here.
    private _enterTable: (() => void) | null = null;

    // Guards onTableArrowClick's joinChannel round trip: without this, rapid repeat clicks each
    // register their own raw-socket listener, and the first response satisfies all of them
    // (matching is by generic eventOrigin, not per-request), firing ScreenManager.showScreen
    // multiple times with mismatched channel data and leaving the screen transition stuck.
    private _joinRequestPending = false;
    private _resetJoinLock = () => {
        this._joinRequestPending = false;
    };

    setEnterTableHandler(fn: () => void) {
        this._enterTable = fn;
    }

    setData(data: any) {
        if (!data) return;

        this._tourData = data;

        const tables: any[] = data.tables || data.tableList || [];
        const tablesLeft = data.tablesLeft ?? data.totalTables ?? tables.length;

        if (this.tablesLeftLabel) {
            this.tablesLeftLabel.string = `${tablesLeft}`;
        }

        this.createTables(tables);
    }

    private createTables(tables: any[]) {
        const content = this.scrollView.content;
        content.removeAllChildren();

        tables.forEach((item, index) => {
            const row = cc.instantiate(this.rowPrefabNode);
            content.addChild(row);
            row.getComponent(TablesRow).setData(item, this.onTableArrowClick.bind(this), index % 2 === 1, index % 2 === 1);
            row.active = true;
        });
    }

    private onTableArrowClick(tableData: any) {
        const channelId = tableData.channelId ?? tableData.tableId;
        const playerId = GameManager.user?.playerId;
        cc.log("[TablesHandler] onTableArrowClick", { channelId, playerId, tableData });
        if (!channelId || !playerId) return;

        const _isActiveParticipant: boolean = this._tourData?.isActiveParticipant ?? false;
        const myTableId: string | null = this._tourData?.myTableId ?? null;

        const activeModels = (window as any).GameManager?.gameModel?.activePokerModels ?? [];

        if (this._tourData.state == "Registration Freezed" || this._tourData.state == "FREEZED") {
            GameManager.popUpManager.show(PopUpType.NotificationPopup, "Tournament is not started yet, please wait.", function () { });
            return;   
        }

        if (_isActiveParticipant && myTableId !== channelId) {
            // Active participant clicked a different table in this tournament — send them
            // back to their own assigned table instead of letting them spectate another one.
            cc.log("[TablesHandler] onTableArrowClick | active participant, blocking spectate of other table", { myTableId, channelId });
            if (this._enterTable) this._enterTable();
            return;
        }

        for (let i = 0; i < activeModels.length; i++) {
            if (activeModels[i]?.gameData?.channelId === channelId) {
                const popup = cc.find("Canvas/TournamentLobbyDetail");
                if (popup) popup.active = false;
                (window as any).GameManager.popUpManager.hideAllPopUps();
                (window as any).ScreenManager.showScreen((window as any).K.ScreenEnum.GamePlayScreen, i, () => { });
                return;
            }
        }

        if (this._joinRequestPending) {
            cc.log("[TablesHandler] onTableArrowClick | join already in flight, ignoring click");
            return;
        }

        if (GameManager.activeTableCount > 0) {
            if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
                GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                return;
            }
        }

        const rawSocket = (window as any).TournamentSocket;
        if (!rawSocket) return;

        this._joinRequestPending = true;
        this.unschedule(this._resetJoinLock);
        this.scheduleOnce(this._resetJoinLock, 5);

        if (typeof rawSocket.prependAny === "function") {
            const _joinHandler = (event: string, response: any) => {
                if (event !== "commonEventResponse" || response?.eventOrigin !== "room.channelHandler.joinChannel") return;
                rawSocket.offAny(_joinHandler);
                this.unschedule(this._resetJoinLock);
                this._joinRequestPending = false;
                cc.log("[TablesHandler] joinChannel response", response);
                const res = response?.data;
                if (!res?.success) {
                    GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                    return;
                }
                if (!res.antibanking) res.antibanking = { isAntiBanking: false, amount: 0, timeRemains: 0 };
                // Use the channelId we originally requested (matches game event channelId from tournament socket)
                let gameData = res; 
                gameData.channelId = channelId;
                gameData.tourData = this._tourData;
                const popup = cc.find("Canvas/TournamentLobbyDetail");
                if (popup) popup.active = false;
                (window as any).ScreenManager.showScreen((window as any).K?.ScreenEnum?.GamePlayScreen, gameData, function () { });
            };
            rawSocket.prependAny(_joinHandler);
        }

        rawSocket.emit("common", {
            eventName: "room.channelHandler.joinChannel",
            data: {
                playerId,
                channelId,
                channelType: "TOURNAMENT",
                isRequested: true,
                tableId: "",
                isPrivateTable: "false",
                playerName: GameManager.user?.userName || "",
                networkIp: (window as any).LoginData?.ipV4Address || "",
                isRejoin: false,
                maxPlayers: 2,
            }
        });
    }
}
