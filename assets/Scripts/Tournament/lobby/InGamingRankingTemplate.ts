const { ccclass, property } = cc._decorator;

@ccclass
export default class InGamingRankingTemplate extends cc.Component {

    @property(cc.Label) rankLabel: cc.Label = null!;
    @property(cc.Label) nameLabel: cc.Label = null!;
    @property(cc.Label) stackLabel: cc.Label = null!;
    @property(cc.Label) raLabel: cc.Label = null!;
    @property(cc.Node) highlightNode: cc.Node = null!;

    setData(data: { rank: number; playerName: string; chips: number; rebuys?: number; addons?: number; isMe?: boolean, highlight?: boolean }) {
        if (this.rankLabel) this.rankLabel.string = `${data.rank}`;
        if (this.nameLabel) this.nameLabel.string = data.playerName ?? "";

        const chips = data.chips ?? 0;
        if (this.stackLabel) this.stackLabel.string = this.formatChips(chips);

        const ra = (data.rebuys ?? 0) + (data.addons ?? 0);
        if (this.raLabel) this.raLabel.string = ra > 0 ? `${data.rebuys ?? 0}R+${data.addons ?? 0}A` : "0";
        if (this.highlightNode) this.highlightNode.active = data.highlight ?? false;

        if (data.isMe) {
            this.node.color = new cc.Color(253, 171, 46, 255);
        } else {
            this.node.color = new cc.Color(255, 255, 255, 255);
        }
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
}
