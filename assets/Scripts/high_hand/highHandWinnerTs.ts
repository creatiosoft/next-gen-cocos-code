import bbjWinnerDetailsTs from "../bbj/bbjWinnerDetailsTs";
import { PopUpManager, PopUpType }
    from "../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");

const { ccclass, property } = cc._decorator;

@ccclass
export default class highHandWinnerTs extends PopUpBase {

    @property(cc.Label) numbersofWinner: cc.Label = null;
    @property(cc.Label) dateAndTime: cc.Label = null;
    @property(cc.Label) winningAmount: cc.Label = null;
    @property(cc.Node) winnerContent: cc.Node = null;
    @property(cc.Prefab) winnerPrefab: cc.Prefab = null;

    @property
    text: string = 'hello';

    setDetails(data) {
        this.numbersofWinner.string = data.winners.length == 1 ? "HIGH HAND WINNER" : `HIGH HAND – ${data.winners.length} WINNERS`;
        this.dateAndTime.string = this.formatDateTime(data.roundEndTime ?? "2026-02-19T19:00:00.000Z");
        this.winningAmount.string = `$${data.totalPrize}`;
    }

    onShow(winnersData) {
        this.setDetails(winnersData);
        this.winnerContent.removeAllChildren();
        for (let i = 0; i < winnersData.winners.length; i++) {
            // let winnerData = winnersData[i];  winnersData.winners[i]
            let updatedData = {
                playerId: winnersData.winners[i].playerId,
                userName: winnersData.winners[i].userName,
                profileImage: winnersData.winners[i].profileImage,
                handRank: winnersData.winners[i].handText,
                payoutAmount: winnersData.winners[i].prizeAmount,
                cards: winnersData.winners[i].handSet || []
            }
            let winnerNode = cc.instantiate(this.winnerPrefab);
            winnerNode.getComponent(bbjWinnerDetailsTs).setWinnerDetails(updatedData, updatedData.handRank, "highlightBg");//highlightBg
            this.winnerContent.addChild(winnerNode);
        }
    }

    closePopup() {
        this.closeSelf();
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
    }

    formatDateTime(isoString: string): string {
        const date = new Date(isoString);

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 → 12

        return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    }
}
