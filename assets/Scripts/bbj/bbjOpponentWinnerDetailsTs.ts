import { changeAvatar } from "../DataFormats/ResponseTypes";
import cardHighHand from "../high_hand/cardHighHand";

const { ccclass, property } = cc._decorator;

@ccclass
export default class bbjOpponentWinnerDetailsTs extends cc.Component {

    @property(cc.Sprite) profilePic: cc.Sprite = null;
    @property(cc.Label) playerName: cc.Label = null;
    @property(cc.Label) stakeType: cc.Label = null;
    @property(cc.Label) winningAmount: cc.Label = null;

    // @property(cc.Node) bgNode: cc.Node[] = [];
    @property(cc.Node) cards: cc.Node[] = [];

    @property(cc.Node) restOfPlayerNode: cc.Node = null;
    @property(cc.Node) restOfPlayerContent: cc.Node = null;
    @property(cc.Prefab) restOfPlayerPrefab: cc.Prefab = null;

    @property(cc.Sprite) stakeTypeBg: cc.Sprite = null;
    @property(cc.SpriteFrame) bgSpriteFrames: cc.SpriteFrame[] = [];
    urlImg: any = null;
    start() {

    }

    setOpponentWinnerDetails(opponentData, stakeLevel, sharedPlayersData) {
        // let data: any = (opponentData.profileImage == "" || opponentData.profileImage == "undefined") ? (1) : (Number(opponentData.profileImage) - 1);
        // changeAvatar(data, this);
        this.profilePic.spriteFrame = GameManager.avatarImages[Number(opponentData.profileImage)];
        this.playerName.string = opponentData.userName;
        this.stakeType.string = `${stakeLevel} `;//Stake Winner
        let amount = Math.round(opponentData.payoutAmount * 100) / 100;
        this.winningAmount.string = `$${amount}`;
        for (let i = 0; i < opponentData.cards.length; i++) {
            this.cards[i].getComponent(cardHighHand).setCard(opponentData.cards[i]);
        }

        this.stakeTypeBg.spriteFrame = stakeLevel == "high" ? this.bgSpriteFrames[0] : this.bgSpriteFrames[1];
        if(opponentData.bgType != undefined){
            this.stakeTypeBg.spriteFrame = this.bgSpriteFrames[0];
        }



        this.restOfPlayerContent.removeAllChildren();
        for (let i = 0; i < sharedPlayersData.length; i++) {
            let player = cc.instantiate(this.restOfPlayerPrefab);
            let playerName = "";

            if (sharedPlayersData[i].userName) {
                playerName = sharedPlayersData[i].userName;
            } else if (sharedPlayersData[i].playerName) {
                playerName = sharedPlayersData[i].playerName;
            }

            player.getChildByName("playerName").getComponent(cc.Label).string = this.shortName(playerName);

            // let data: any = (sharedPlayersData[i].profileImage == "" || sharedPlayersData[i].profileImage == "undefined") ? (1) : (Number(sharedPlayersData[i].profileImage) - 1);
            // changeAvatar(data, this);
            player.children[0].children[0].getComponent(cc.Sprite).spriteFrame = GameManager.avatarImages[Number(sharedPlayersData[i].profileImage)];
            this.restOfPlayerContent.addChild(player);
        }
        this.restOfPlayerNode.active = this.restOfPlayerContent.children.length > 0;
    }

    shortName(text: string, maxLength: number = 7): string {
        if (!text) return "";

        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }

        return text;
    }

    showRestOfPlayers() {
        return;
        if (this.restOfPlayerContent.childrenCount == 0) {
            return;
        }
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
        this.restOfPlayerNode.active = !this.restOfPlayerNode.active;
    }

    // setRestOfPlayers(restOfPlayersData) {
    //     this.restOfPlayerContent.removeAllChildren();
    //     for (let i = 0; i < restOfPlayersData.length; i++) {
    //         let playerData = restOfPlayersData[i];

    //         let playerNode = cc.instantiate(this.restOfPlayerPrefab);
    //         playerNode.getChildByName("").getComponent(cc.Label).string = playerData.playerName;
    //         playerNode.getChildByName("").getComponent(cc.Sprite).spriteFrame = playerData.playerName;
    //         this.restOfPlayerContent.addChild(playerNode);

    //     }
    //    this.restOfPlayerNode.active = this.restOfPlayerContent.children.length > 0;
    // }

    onEnable() {
        this.restOfPlayerNode.active = this.restOfPlayerContent.children.length > 0;
    }

    // update (dt) {}
}
