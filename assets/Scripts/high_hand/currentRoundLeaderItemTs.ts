import { changeAvatar } from "../DataFormats/ResponseTypes";
import cardHighHand from "./cardHighHand";

const { ccclass, property } = cc._decorator;

@ccclass
export default class currentRoundLeaderItemTs extends cc.Component {

    @property(cc.Sprite) playerProfile!: cc.Sprite;
    @property(cc.Label)  playerName!: cc.Label;
    @property(cc.Label)  playerId!: cc.Label;
    @property(cc.Node)   currentlyLeadingBadge!: cc.Node;
    @property([cc.Node]) playerCardContent: cc.Node[] = [];

    urlImg: any = null;

    initViews(data: any) {
        const profileData = (data.profileImage == "" || data.profileImage == "undefined")
            ? 1
            : Number(data.profileImage) - 1;
        changeAvatar(profileData, this);
        if (this.playerProfile) this.playerProfile.spriteFrame = this.urlImg;

        if (this.playerName)            this.playerName.string            = data.userName || "";
        if (this.playerId)              this.playerId.string              = "ID : " + (data.playerId || "");
        if (this.currentlyLeadingBadge) this.currentlyLeadingBadge.active = true;

        for (let i = 0; i < this.playerCardContent.length; i++) {
            if (data.handSet && data.handSet[i]) {
                this.playerCardContent[i].active = true;
                this.playerCardContent[i].getComponent(cardHighHand).setCard(data.handSet[i]);
            } else {
                this.playerCardContent[i].active = false;
            }
        }
    }
}
