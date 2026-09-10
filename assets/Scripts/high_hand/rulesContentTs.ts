import cardHighHand from "./cardHighHand";

const { ccclass, property } = cc._decorator;

@ccclass
export default class rulesContentTs extends cc.Component {

    @property(cc.Label) title: cc.Label = null;
    @property(cc.Node) quali_Hands: cc.Node = null;
    @property(cc.Node) quali_Cards: cc.Node[] = [];
    @property(cc.Node) tipsContent: cc.Node = null;
    @property(cc.Prefab) tipsPrefab: cc.Prefab = null;

    start() {

    }

    initViews(data, hands, type) {
        let isHandRules = type == "HighHand";
        this.title.string = isHandRules ? "High Hand Rules" : "Payout Details";
        this.quali_Hands.active = isHandRules;
        this.tipsContent.removeAllChildren();
        // for(let i=0; i<data.length; i++){
        //     let handNode = cc.instantiate(this.quali_Hands);
        //     handNode.getComponent(cc.Label).string = data.quali_Hands[i];
        //     this.quali_Hands.addChild(handNode);
        // }

        for (let i = 0; i < this.quali_Cards.length; i++) {
            this.quali_Cards[i].getComponent(cardHighHand).setCard(hands.cards[i]);

        }

        for (let i = 0; i < data.length; i++) {
            let tipNode = cc.instantiate(this.tipsPrefab);
            tipNode.getComponent(cc.Label).string = data[i];
            tipNode.children[0].getComponent(cc.Label).string = (i + (isHandRules ? 2 : 1)).toString();
            this.tipsContent.addChild(tipNode);
        }
    }

    // update (dt) {}
}
