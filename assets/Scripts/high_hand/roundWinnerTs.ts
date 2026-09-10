import { changeAvatar } from "../DataFormats/ResponseTypes";
import cardHighHand from "./cardHighHand";

const { ccclass, property } = cc._decorator;

@ccclass
export default class roundWinnerTs extends cc.Component {

    @property(cc.Label) roundValue: cc.Label = null;
    @property(cc.Sprite) playerProfile: cc.Sprite = null;
    @property(cc.Label) playerName: cc.Label = null;
    @property(cc.Label) playerId: cc.Label = null;
    @property(cc.Label) amountValue: cc.Label = null;
    @property(cc.Node) playerCardContent: cc.Node[] = [];


    urlImg: any = null;
    start() {

    }

    initViews(data, roundNumber) {
        let profileData: any = (data.profileImage == "" || data.profileImage == "undefined") ? (1) : (Number(data.profileImage) - 1);
        changeAvatar(profileData, this);
        this.playerProfile.spriteFrame = this.urlImg;
        this.roundValue.string = "Round " + roundNumber;
        this.playerName.string = data.userName;
        this.playerId.string = 'ID : ' + data.playerId;
        this.amountValue.string = `${data.prizeAmount}`;
        for (let i = 0; i < this.playerCardContent.length; i++) {
            // if (data.cards[i]) {          
            // this.playerCardContent[i].active = true;      
            let cardNode = this.playerCardContent[i];
            cardNode.getComponent(cardHighHand).setCard(data.handSet[i]);
            // } else {
            //     this.playerCardContent[i].active = false;
            // }
        }
    }

    // update (dt) {}
}
