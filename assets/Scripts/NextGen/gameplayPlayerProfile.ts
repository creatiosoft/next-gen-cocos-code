const PopUpBase = require("PopUpBase");

const { ccclass, property } = cc._decorator;

@ccclass
export default class gameplayPlayerProfile extends PopUpBase {

    @property(cc.Label) playerName: cc.Label = null!;
    @property(cc.Label) playerChips: cc.Label = null!;
    @property(cc.Label) playerChipsInBB: cc.Label = null!;
    @property(cc.Sprite) playerProfileIcon: cc.Sprite = null!;

    @property(cc.Node) selfPlayerNodes: cc.Node [] = [];
    @property(cc.Node) otherPlayerNodes: cc.Node [] = [];
    

    data: any = null;
    start() {
       
    }

    onShow(data:any) {
        this.data = data;
        this.setView();
    }

    setView() {
        let nodes = this.otherPlayerNodes;
        if (this.data.isSelf) {
            nodes = this.selfPlayerNodes;
        }
        for (let a = 0; a < nodes.length; a++) {
            nodes[a].active = true;
        }

        this.playerName.string = this.data.playerName;
        this.playerChips.string = globalThis.GameManager.convertChips(this.data.chips).toString();
        this.playerChipsInBB.string = "(" + this.data.chipsInBB + "bb)";
        if (this.data.avatarSpriteFrame) {
            this.playerProfileIcon.spriteFrame = this.data.avatarSpriteFrame;
        }
    }

    goBack() {
        this.closeSelf();
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
    }

    closeThisPopup() {
        this.closeSelf();
    }
}
