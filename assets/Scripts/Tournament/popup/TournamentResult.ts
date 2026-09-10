import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

@ccclass
export default class TournamentResult extends PopUpBase {

    // ── Medal / Rank display ─────────────────────────────────────────────────
    @property(cc.Node) medalNode: cc.Node = null!;        // shown for rank 1/2/3
    @property(cc.Node) bgNode: cc.Node = null!;        // shown for rank 1/2/3
    @property(cc.Sprite) medalSprite: cc.Sprite = null!;   // sprite inside medalNode
    @property([cc.SpriteFrame]) medalFrames: cc.SpriteFrame[] = []; // [0]=gold [1]=silver [2]=bronze
    @property([cc.SpriteFrame]) playerInfoBg: cc.SpriteFrame[] = []; // [0]=gold [1]=silver [2]=bronze [3]=default

    @property(cc.Node) rankNode: cc.Node = null!;         // shown for rank 4+
    @property(cc.Label) rankNumLabel: cc.Label = null!;    // "10
    @property(cc.Label) rankNumLabelSuperscript: cc.Label = null!;    // "^th"


    // ── Player info ──────────────────────────────────────────────────────────
    @property(cc.Sprite) avatarSprite: cc.Sprite = null!;
    @property(cc.Sprite) playerInfoSprite: cc.Sprite = null!;
    @property(cc.Label) playerNameLabel: cc.Label = null!;
    @property(cc.Label) playerIdLabel: cc.Label = null!;
    @property(cc.Label) chipsLabel: cc.Label = null!;
    @property(cc.Node) messageNode: cc.Node = null!;

    @property(cc.Material) disableMaterial: cc.Material = null!;
    @property(cc.Material) enabledMaterial: cc.Material = null!;
    isShowMtt: boolean = false;
    leaderboard = [];
    // ════════════════════════════════════════════════════════════════════════

    private base64ToUint8Array(base64: string): Uint8Array {
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

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
                this.leaderboard = rows;
            } catch (e) {
            }
        };

        rawSocket.on("TournamentLeaderboard", onLeaderboard);

        TournamentServerCom.socketIORequest(
            "tournamentLobbyEvent|joinLeaderboard",
            { tournamentId },
            () => { },
            () => {
            }
        );
    }

    onShow(data) {
        this.pokerPresenter = data.pokerPresenter;

        this.isShowMtt = data.isShowMtt;

        let data = data.data;
        console.log("[TournamentResult] setData", data);

        const rank: number = data.playerRank ?? 0;
        const payout: number = data.playerPayoutAmount ?? 0;

        const pp = this.pokerPresenter?.getComponent("PokerPresenter") as any;
        const tournamentId = pp?.model?.gameData?.tournamentId;

        this.fetchAndShow(tournamentId);

        this.setRankDisplay(rank);
        if (rank && !payout) {
            if (this.messageNode) this.messageNode.active = true;
            this.chipsLabel.node.parent.active = false;
        } else {
            if (this.messageNode) this.messageNode.active = false;
            this.chipsLabel.node.parent.active = true;
        }

        if (this.chipsLabel) this.chipsLabel.string = `${payout.toLocaleString()}`;

        const gm = (globalThis as any).GameManager;
        if (this.avatarSprite) {
            const avatarIdx = gm?.user?.settings?.avatarId ?? 0;
            this.avatarSprite.spriteFrame = gm?.user?.urlImg || gm?.avatarImages?.[avatarIdx] || gm?.avatarImages?.[0];
        }
        if (this.playerNameLabel) this.playerNameLabel.string = gm?.user?.userName ?? "";
        if (this.playerIdLabel) this.playerIdLabel.string = `ID: ${gm?.user?.playerId ?? ""}`;
    }

    private setRankDisplay(rank: number) {
        const isMedal = rank >= 1 && rank <= 3;

        if (this.medalNode) this.medalNode.active = isMedal;
        if (this.rankNode) this.rankNode.active = rank > 3;

        if (isMedal) {
            if (this.medalSprite && this.medalFrames[rank - 1]) {
                this.medalSprite.spriteFrame = this.medalFrames[rank - 1];
            }
            if (this.playerInfoSprite) this.playerInfoSprite.spriteFrame = this.playerInfoBg[rank - 1];
        } else {
            if (this.rankNumLabel) this.rankNumLabel.string = `${rank}`;
            if (this.rankNumLabelSuperscript) this.rankNumLabelSuperscript.string = this.getOrdinalSuffix(rank);
            if (this.playerInfoSprite) this.playerInfoSprite.spriteFrame = this.playerInfoBg[3];
        }
    }

    private getOrdinalSuffix(n: number): string {
        const j = n % 10, k = n % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    }

    onOkay() {
        console.log("[TournamentResult] onOkay");

        if (!this.isShowMtt) {
            this.closeSelf();
            const pp = this.pokerPresenter?.getComponent("PokerPresenter") as any;
            pp?.model?.leaveClosedTable?.();
            return;
        }

        const pp = this.pokerPresenter?.getComponent("PokerPresenter") as any;
        const tournamentId = pp?.model?.gameData?.tournamentId;
        const doLeave = () => { pp?.model?.leaveClosedTable?.(); };
        if (tournamentId) {
            GameManager.popUpManager.showIn(PopUpType.TournamentRanking, {"pokerPresenter": this.pokerPresenter, "tournamentId": tournamentId, "rows": this.leaderboard}, null, pp.tablePopupHolder);
            return;
        }

        this.closeSelf();
        doLeave();
    }
}
