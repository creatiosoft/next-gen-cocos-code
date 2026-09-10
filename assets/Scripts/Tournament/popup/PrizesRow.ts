const { ccclass, property } = cc._decorator;

@ccclass
export default class PrizesRow extends cc.Component {

    @property(cc.Label) rankLabel: cc.Label = null!;
    @property(cc.Label) prizeLabel: cc.Label = null!;
    @property(cc.Node) highlight: cc.Node = null!;

    setData(data: any, isHighlighted: boolean = false) {
        this.rankLabel.string = `${data.rank ?? data.ranking ?? ""}`;
        this.prizeLabel.string = `${data.prize ?? data.payoutAmount ?? ""}`;
        if (this.highlight) this.highlight.active = isHighlighted;
    }
}
