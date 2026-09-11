const {ccclass, property} = cc._decorator;

@ccclass
export default class Home extends cc.Component {

    @property(cc.Label) playerName: cc.Label = null!;
    @property(cc.Label) playerId: cc.Label = null!;
    @property(cc.Sprite) playerAvatar: cc.Sprite = null!;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        this.playerName.string = GameManager.user.userName;
        this.playerAvatar.spriteFrame = GameManager.user.urlImg;
        this.playerId.string = "ID: " + GameManager.user.playerId;
    }

    onClickCashGame(){
        this.node.active = false;
    }

    onClickShowHome(){
        this.node.active = true;
    }

    // update (dt) {}
}
