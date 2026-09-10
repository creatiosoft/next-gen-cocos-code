import { changeAvatar } from "../DataFormats/ResponseTypes";
import cardHighHand from "../high_hand/cardHighHand";

const { ccclass, property } = cc._decorator;

@ccclass
export default class bbjWinnerDetailsTs extends cc.Component {

    @property(cc.Sprite) profilePic: cc.Sprite = null;
    @property(cc.Label) playerName: cc.Label = null;
    @property(cc.Label) stakeType: cc.Label = null;
    @property(cc.Label) winningAmount: cc.Label = null;


    @property(cc.Node) cards: cc.Node[] = [];
    // @property(cc.Node) bgNode: cc.Node[] = [];
    @property(cc.Node) bg: cc.Node[] = [];

    @property(cc.Sprite) stakeTypeBg: cc.Sprite = null;
    @property(cc.SpriteFrame) bgSpriteFrames: cc.SpriteFrame[] = [];

    urlImg: any = null;
    start() {

    }

    setWinnerDetails(data, stakeLevel, themeType) {
        this.bg[0].active = themeType == "darkBg";
        this.bg[1].active = themeType == "highlightBg";

        //stakeLevel == "small" && themeType == "darkBg"

        this.stakeTypeBg.spriteFrame = stakeLevel == "high" ? this.bgSpriteFrames[0] : this.bgSpriteFrames[1];
        if (themeType == "highlightBg") {
            this.winningAmount.node.color = cc.Color.WHITE;
            this.stakeTypeBg.spriteFrame = this.bgSpriteFrames[0];
        }
        // let profileData: any = (data.profileImage == "" || data.profileImage == "undefined") ? (1) : (Number(data.profileImage) - 1);
        // changeAvatar(profileData, this);
        // this.profilePic.spriteFrame = this.urlImg;

        this.profilePic.spriteFrame = GameManager.avatarImages[Number(data.profileImage)];

        // this.profilePic.spriteFrame = data.profileImage;
        this.playerName.string = data.userName;
        this.stakeType.string = `${stakeLevel}`;//Stake Winner
        let amount = Math.round(data.payoutAmount * 100) / 100;
        this.winningAmount.string = `$${amount}`;
        for (let i = 0; i < data.cards.length; i++) {
            this.cards[i].getComponent(cardHighHand).setCard(data.cards[i]);
        }
    }

    showOpponent(){
        if(this.node.getChildByName("bbjOpponentDetails")){
            this.node.getChildByName("bbjOpponentDetails").active = !this.node.getChildByName("bbjOpponentDetails").active;
        }
    }
}
