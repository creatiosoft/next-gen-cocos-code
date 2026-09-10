const { ccclass, property } = cc._decorator;

@ccclass
export default class TablesRow extends cc.Component {

    @property(cc.Label) tableNumberLabel: cc.Label = null!;
    @property(cc.Label) playerCountLabel: cc.Label = null!;
    @property(cc.Label) chipsLabel: cc.Label = null!;
    @property(cc.Node) highlight: cc.Node = null!;      // odd row bg
    @property(cc.Node) myTableHighlight: cc.Node = null!;  // highlight bg for the table with user in it

    private _onArrowClick: ((data: any) => void) | null = null;
    private _data: any = null;

    setData(data: any, onArrowClick?: (data: any) => void, isHighlighted: boolean = false, isOdd: boolean = false) {
        this._data = data;
        this._onArrowClick = onArrowClick || null;

        this.tableNumberLabel.string = `No.${data.tableNumber ?? ""}`;
        this.playerCountLabel.string = `${data.playerCount ?? data.players ?? data.countOfPlayers ?? 0}`;
        const maxS = this.formatChips(data.maxStack ?? 0);
        const minS = this.formatChips(data.minStack ?? 0);
        this.chipsLabel.string = (maxS !== "" && minS !== "") ? `${maxS}/${minS}` : `${maxS || minS}`;
        if (this.highlight) this.highlight.active = isOdd;
        if (this.myTableHighlight) this.myTableHighlight.active = isHighlighted;
    }

    onArrowClicked() {
        try {
            if (this._onArrowClick && this._data) {
                this._onArrowClick(this._data);
            }
        } catch (error) {
            console.error("Error occurred while clicking arrow:", error);
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
