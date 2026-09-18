const { ccclass, property } = cc._decorator;

@ccclass
export default class Home extends cc.Component {

    @property(cc.Label) cashRoomTitle: cc.Label = null!;
    @property(cc.Node) lobbyPresenter: cc.Node = null!;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
    }

    onClickCashGame() {
        this.node.active = false;
        this.cashRoomTitle.string = "Cash Games";
        this.lobbyPresenter.getComponent("LobbyPresenter").setCashGamesView();
    }

    onClickBombPotGame() {
        this.node.active = false;
        this.cashRoomTitle.string = "Bomb Pot";
        this.lobbyPresenter.getComponent("LobbyPresenter").setBombpotGamesView(false, null);
    }

    onClickShowHome() {
        this.node.active = true;
    }

    // update (dt) {}
}
