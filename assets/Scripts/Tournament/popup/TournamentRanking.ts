import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

declare const TournamentServerCom: any;

@ccclass
export default class TournamentRanking extends PopUpBase {

    @property(cc.Node) listContent: cc.Node = null!;
    @property(cc.Prefab) itemNode: cc.Prefab = null!;

    fetchAndShow(tournamentId) {
        const rawSocket = (window as any).TournamentSocket;
        if (!rawSocket) {
            onGotoLobby();
            return;
        }

        const onLeaderboard = (envelope: any) => {
            rawSocket.off("TournamentLeaderboard", onLeaderboard);
            try {
                const pako = (window as any).pako;
                const bytes = this.base64ToUint8Array(envelope.data);
                const jsonStr = pako.ungzip(bytes, { to: "string" });
                const col = JSON.parse(jsonStr);
                const n: number = col.id?.length ?? 0;
                const rows: any[] = [];
                for (let i = 0; i < n; i++) {
                    rows.push({
                        rank: col.rk?.[i] ?? (i + 1),
                        playerId: col.id?.[i] ?? "",
                        playerName: col.nm?.[i] ?? "",
                        playerPayoutAmount: col.pz?.[i] ?? 0,
                        avatarId: col.av?.[i] ?? 0,
                    });
                }
                this.populateList(rows);
            } catch (e) {
                cc.error("[TournamentRanking] decode error", e);
                const pp = this.pokerPresenter?.getComponent("PokerPresenter") as any;
                pp?.model?.leaveClosedTable?.();
            }
        };

        rawSocket.on("TournamentLeaderboard", onLeaderboard);

        TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|joinLeaderboard",
            { tournamentId },
            () => { },
            () => {
                rawSocket.off("TournamentLeaderboard", onLeaderboard);
                const pp = this.pokerPresenter?.getComponent("PokerPresenter") as any;
                pp?.model?.leaveClosedTable?.();
            }
        );
    }

    onShow(data) {
        GameManager.popUpManager.remove(PopUpType.TournamentResult, null, this._popupHost);
        this.pokerPresenter = data.pokerPresenter;
        if (data.rows) {
            this.populateList(data.rows);
        }
        else {
            this.fetchAndShow(data.tournamentId);
        }
    }

    private populateList(leaderBoard: any[]) {
        if (!this.listContent || !this.itemNode) return;

        this.listContent.removeAllChildren();

        const itemH = this.itemNode.height;
        leaderBoard.forEach((p, index) => {
            const item = cc.instantiate(this.itemNode);
            this.listContent.addChild(item);
            item.active = true;
            const comp = item.getComponent("TournamentRankingItem") as any;
            if (comp) {
                comp.setData({
                    rank: p.rank ?? (index + 1),
                    playerName: p.playerName ?? p.name ?? "",
                    playerId: p.playerId ?? p.id ?? "",
                    chips: p.playerPayoutAmount ?? p.chips ?? p.prize ?? 0,
                    avatarId: p.avatarId ?? 0,
                });
            }
        });

        // recalculate content height so ScrollView can scroll to last item
        const layout = this.listContent.getComponent(cc.Layout);
        const spacing = layout ? layout.spacingY : 0;
        this.listContent.height = leaderBoard.length * itemH + Math.max(0, leaderBoard.length - 1) * spacing;
    }

    private base64ToUint8Array(base64: string): Uint8Array {
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    gotoLobby() {
        const pp = this.pokerPresenter?.getComponent("PokerPresenter") as any;
        pp?.model?.leaveClosedTable?.();
        this.scheduleOnce(() => {
            this.closeSelf();
        }, 0.5);
    }
}
