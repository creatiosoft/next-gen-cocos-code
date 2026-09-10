const { ccclass, property } = cc._decorator;

@ccclass
export default class noLeadTs extends cc.Component {

    @property(cc.Label) roundLabel!: cc.Label;

    initViews(roundNumber: number) {
        if (this.roundLabel) this.roundLabel.string = "Round " + roundNumber;
    }
}
