const {ccclass, property} = cc._decorator;

@ccclass
export default class Home extends cc.Component {

    // @property(cc.Label) playerName: cc.Label = null!;
    // @property(cc.Label) playerId: cc.Label = null!;
    // @property(cc.Sprite) playerAvatar: cc.Sprite = null!;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    onClickCashGame(){
        this.node.active = false;
    }

    onClickShowHome(){
        this.node.active = true;
    }

    // update (dt) {}
}
