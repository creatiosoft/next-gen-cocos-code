const { ccclass, property } = cc._decorator;

@ccclass
export default class BlindStructureRow extends cc.Component {

    @property(cc.Label) levelLabel: cc.Label = null!;
    @property(cc.Label) blindsLabel: cc.Label = null!;
    @property(cc.Label) anteLabel: cc.Label = null!;
    @property(cc.Node) rebuyIcon: cc.Node = null!;
    @property(cc.Node) addonIcon: cc.Node = null!;
    @property(cc.Node) highlight: cc.Node = null!;
    @property(cc.Node) currentHighlight: cc.Node = null!;  // current level highlight bg

    setData(data: any, isCurrent: boolean = false, isOdd: boolean = false) {

        if (data.isBreak) {
            this.levelLabel.string = "BREAK";
            this.blindsLabel.string = `${data.minutes} min`;
            this.anteLabel.string = "-";
        } else {
            this.levelLabel.string = `${data.level}`;
            this.blindsLabel.string = `${this.formatChips(data.smallBlind)}/${this.formatChips(data.bigBlind)}`;
            this.anteLabel.string = data.ante > 0 ? `${this.formatChips(data.ante)}` : "0";
        }

        if (this.rebuyIcon) this.rebuyIcon.active = !!data.isRebuy;
        if (this.addonIcon) this.addonIcon.active = !!data.isAddon;
        if (this.highlight) this.highlight.active = isOdd;
        // if (this.currentHighlight) this.currentHighlight.active = isCurrent;
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
