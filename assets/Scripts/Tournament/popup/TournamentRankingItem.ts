const { ccclass, property } = cc._decorator;

@ccclass
export default class TournamentRankingItem extends cc.Component {

    @property(cc.Node) itemBg: cc.Node = null!;
    @property(cc.Node) rankParent: cc.Node = null!;
    @property(cc.Label) rankLabel: cc.Label = null!;
    @property(cc.Sprite) rankBadgeSprite: cc.Sprite = null!;
    @property(cc.Sprite) rankSprite: cc.Sprite = null!;
    @property(cc.Sprite) rankBgSprite: cc.Sprite = null!;
    @property([cc.SpriteFrame]) badgeFrames: cc.SpriteFrame[] = []; // [0]=gold [1]=silver [2]=bronze [3]=default
    @property([cc.SpriteFrame]) rankFrames: cc.SpriteFrame[] = []; // [0]=gold [1]=silver [2]=bronze [3]=default
    @property([cc.SpriteFrame]) rankBgFrames: cc.SpriteFrame[] = []; // [0]=gold [1]=silver [2]=bronze [3]=default
    @property([cc.SpriteFrame]) itemBgFrames: cc.SpriteFrame[] = []; // [0]=gold [1]=silver [2]=bronze [3]=default

    @property(cc.Node) ribbonNode: cc.Node = null!;   // shown only for rank 1/2/3
    @property(cc.Node) rankNode: cc.Node = null!;   // shown only for rank 1/2/3
    @property(cc.Node) rankbgNode: cc.Node = null!;   // shown only for rank 1/2/3


    @property(cc.Sprite) avatarSprite: cc.Sprite = null!;
    @property(cc.Label) playerNameLabel: cc.Label = null!;
    @property(cc.Label) playerIdLabel: cc.Label = null!;
    @property(cc.Label) chipsLabel: cc.Label = null!;

    setData(data: { rank: number; playerName: string; playerId: string; chips: number; avatar?: cc.SpriteFrame | null; avatarId?: number }) {
        const rank = data.rank;
        if (this.rankParent) this.rankParent.active = rank > 3; // Show numeric rank only for ranks > 3
        if (this.rankLabel) this.rankLabel.string = `${rank}`;
        if (this.ribbonNode) this.ribbonNode.active = rank <= 3;
        if (this.rankNode) this.rankNode.active = rank <= 3;
        if (this.rankbgNode) this.rankbgNode.active = rank <= 3;


        if (rank <= 3) {
            const frameIndex = rank - 1;
            if (this.rankBadgeSprite && this.badgeFrames[frameIndex]) {
                this.rankBadgeSprite.spriteFrame = this.badgeFrames[frameIndex];
            }
            if (this.rankSprite && this.rankFrames[frameIndex]) {
                this.rankSprite.spriteFrame = this.rankFrames[frameIndex];
            }
            if (this.rankBgSprite && this.rankBgFrames[frameIndex]) {
                this.rankBgSprite.spriteFrame = this.rankBgFrames[frameIndex];
            }
        }

        if (this.itemBg) {
            const frameIndex = rank <= 3 ? rank - 1 : 3;
            if (this.itemBgFrames[frameIndex]) {
                this.itemBg.getComponent(cc.Sprite).spriteFrame = this.itemBgFrames[frameIndex];
            }
        }

        if (this.playerNameLabel) this.playerNameLabel.string = data.playerName;
        if (this.playerIdLabel) this.playerIdLabel.string = `ID: ${data.playerId}`;
        if (this.chipsLabel) this.chipsLabel.string = this.formatChips(data.chips);

        if (this.avatarSprite) {
            const gm = (globalThis as any).GameManager;
            if (data.avatar) {
                this.avatarSprite.spriteFrame = data.avatar;
            } else {
                const idx = data.avatarId;
                this.avatarSprite.spriteFrame = gm?.avatarImages?.[idx] ?? gm?.avatarImages?.[0] ?? null;
            }
        }
    }

    private formatChips(amount: number): string {
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}m`;
        if (amount >= 1000) return amount.toLocaleString();
        return `${amount}`;
    }
}
