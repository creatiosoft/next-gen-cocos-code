import PrizesRow from "./PrizesRow";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PrizesHandler extends cc.Component {

    @property(cc.ScrollView) scrollView: cc.ScrollView = null!;
    @property(cc.Node) rowPrefabNode: cc.Node = null!;
    @property(cc.Node) toastNode: cc.Node = null!;
    @property(cc.Label) toastLabel: cc.Label = null!;

    setData(data: any) {
        if (!data) return;

        const prizes: any[] = data.prizes || data.prizeList || [];
        this.createPrizeList(prizes);
    }

    private createPrizeList(prizes: any[]) {
        const content = this.scrollView.content;
        content.removeAllChildren();

        prizes.forEach((item, index) => {
            const row = cc.instantiate(this.rowPrefabNode);
            content.addChild(row);
            row.getComponent(PrizesRow).setData(item, index % 2 === 1);
            row.active = true;
        });
    }
    onQuestionClicked() {
        cc.log("[PrizesHandler] question mark clicked");
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
