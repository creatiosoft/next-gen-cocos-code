import bbjOpponentWinnerDetailsTs from "./bbjOpponentWinnerDetailsTs";
import bbjWinnerDetailsTs from "./bbjWinnerDetailsTs";
import { PopUpManager, PopUpType }
    from "../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");

const { ccclass, property } = cc._decorator;

@ccclass
export default class bbjWinnerPopupTs extends PopUpBase {

    @property(cc.Node) winnerContent: cc.Node = null;
    @property(cc.Prefab) winnerDetailsPrefab: cc.Prefab = null;
    @property(cc.Prefab) winnerOpponentDet_Pre: cc.Prefab = null;

    data: any = null;
    start() {
        // this.data = this.node.getComponent("PopUpBase").data;
        // if (this.data != null) {
        //     this.setWinnersList(this.data);
        // }
    }

    onEnable() {
        // this.scheduleOnce(() => {
        //     this.data = this.node.getComponent("PopUpBase").data;
        //     if (this.data != null) {
        //         this.setWinnersList(this.data);
        //     }
        // }, 0.001);
    }

    onShow(winnersData) {

        this.winnerContent.removeAllChildren();
        // this.tabWinnerContent.node.getChildByName("noPlayer").active = !winnersData || winnersData.length == 0;
        if (!winnersData || winnersData.winner.length == 0) {
            return;
        }
        for (let i = 0; i < winnersData.winner.length; i++) {

            let updatedData = {
                playerId: winnersData.winner[i].playerId,
                userName: winnersData.winner[i].playerName,
                profileImage: winnersData.winner[i].profileImage,
                handRank: winnersData.winner[i].stakeLevel,
                payoutAmount: winnersData.winner[i].amountWon,
                cards: winnersData.winner[i].cardsToShow || []
            }

            let winnerNode = cc.instantiate(this.winnerDetailsPrefab);
            winnerNode.getComponent(bbjWinnerDetailsTs).setWinnerDetails(updatedData, updatedData.handRank, "highlightBg");
            this.winnerContent.addChild(winnerNode);
        }

        for (let i = 0; i < winnersData.opponent.length; i++) {
            // if (winnersData.opponent[i].winningPlayer) {
            let updatedData = {
                playerId: winnersData.opponent[i].playerId,
                userName: winnersData.opponent[i].playerName,
                profileImage: winnersData.opponent[i].profileImage,
                handRank: winnersData.opponent[i].stakeLevel,
                payoutAmount: winnersData.opponent[i].amountWon,
                cards: winnersData.opponent[i].cardsToShow || [],
                bgType:"high",
            }

            let winnerNode = cc.instantiate(this.winnerOpponentDet_Pre);
            winnerNode.getComponent(bbjOpponentWinnerDetailsTs).setOpponentWinnerDetails(updatedData, updatedData.handRank, winnersData.others.otherPlayers);
            this.winnerContent.addChild(winnerNode);
        }
    }

    closePopup() {
        this.closeSelf();
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
    }
}
