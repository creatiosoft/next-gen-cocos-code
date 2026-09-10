import roundWinnerTs from "./roundWinnerTs";
import rulesContentTs from "./rulesContentTs";
import currentRoundLeaderTs from "./currentRoundLeaderTs";
import noLeadTs from "./noLeadTs";
import { PopUpManager, PopUpType }
    from "../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");

const { ccclass, property } = cc._decorator;

@ccclass
export default class highHandPopup extends PopUpBase {

    @property(cc.Label) gamesType: cc.Label = null;
    @property(cc.Label) blindsValue: cc.Label = null;
    @property(cc.Label) buyinValue: cc.Label = null;
    @property(cc.Label) hourValue: cc.Label = null;
    @property(cc.Label) roundValue: cc.Label = null;
    @property(cc.Label) priceValue: cc.Label = null;
    @property(cc.Label) timerValue: cc.Label = null;
    @property(cc.Node) noWinner: cc.Node = null;
    @property(cc.Node) winnerContent: cc.Node = null;
    @property(cc.Prefab) winnerPlayer: cc.Prefab = null;
    @property(cc.Node) highHandPopUpNode: cc.Node = null;
    @property(cc.Node) tipsPopupNode: cc.Node = null;

    @property(cc.Node) tipsContentNode: cc.Node = null;
    @property(cc.Prefab) tipsContentPrefab: cc.Prefab = null;
    @property(cc.Prefab) currentLeaderPrefab: cc.Prefab = null!;
    @property(cc.Prefab) noLeadPrefab: cc.Prefab = null!;
    @property(cc.Prefab) noWinnerPrefab: cc.Prefab = null!;

    data: any = null;
    start() {
        this.tipsPopupNode.active = false;
    }

    setView() {
        this.initViews(this.data);
    }

    onShow(data) {
        this.data = data;
        this.setView();
    }

    initViews(data) {
        // this.gamesType.string = data.gameType;
        // return;
        if (data.data == undefined) {
            return;
        }
        data = data.data;
        let handVariants = "";
        for (let i = 0; i < data.event.eligibleVariations.length; i++) {
            handVariants = handVariants + (i == 0 ? "" : " / ") + data.event.eligibleVariations[i];
        }
        this.gamesType.string = handVariants;

        this.blindsValue.string = this.convertInto_K_Text(data.event.minSmallBlind) + "/" + this.convertInto_K_Text(data.event.minBigBlind);
        this.buyinValue.string = this.convertInto_K_Text(data.event.maxSmallBlind) + "/" + this.convertInto_K_Text(data.event.maxBigBlind);
        let totalTime = data.event.durationMinutes * data.event.totalRounds;
        let duration = this.convertTimeIntoMIn(totalTime);//totalRounds
        this.hourValue.string = duration;
        this.roundValue.string = data.event.currentRound + "/" + data.event.totalRounds;
        this.priceValue.string = `${data.event.prizePerRound}`;
        this.getCountdownString(data.event.round.endTime);
        this.winnerContent.removeAllChildren();

        this.schedule(() => {
            if (cc.isValid(this.node)) {
                this.getCountdownString(data.event.round.endTime);
            }
        }, 1);

        const currentRoundNumber = data.event?.round?.roundNumber ?? data.event?.currentRound ?? 0;
        if (data.currentRoundLeader?.leaders?.length > 0) {
            const node = cc.instantiate(this.currentLeaderPrefab);
            node.getComponent(currentRoundLeaderTs).initViews(data.currentRoundLeader, currentRoundNumber);
            this.winnerContent.insertChild(node, 0);
        } else {
            const node = cc.instantiate(this.noLeadPrefab);
            node.getComponent(noLeadTs).initViews(currentRoundNumber);
            this.winnerContent.addChild(node);
        }

        for (let a = 0; a < data.roundWinners.length; a++) {
            const round = data.roundWinners[a];
            if (round.winners.length === 0) {
                const node = cc.instantiate(this.noWinnerPrefab);
                node.getComponent(noLeadTs).initViews(round.roundNumber);
                this.winnerContent.addChild(node);
            } else {
                for (let i = 0; i < round.winners.length; i++) {
                    const winnerNode = cc.instantiate(this.winnerPlayer);
                    winnerNode.getComponent(roundWinnerTs).initViews(round.winners[i], round.roundNumber);
                    this.winnerContent.addChild(winnerNode);
                }
            }
        }

        this.noWinner.active = this.winnerContent.children.length == 0;
    }

    convertInto_K_Text(value) {
        let str = value;
        if (value > 999) {
            str = value / 1000 + "K"
        }
        return str;
    }

    convertTimeIntoMIn(value) {
        let hours = Math.floor(value / 60);
        let minutes = value % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}min`;
        }
    }

    getCountdownString(futureTime: string | number | Date): string {
        if (cc.isValid(this.node)) {
            // console.log("current Time = "+new Date()+".  coming Time.  "+new Date(futureTime));
            let targetTime = new Date(futureTime).getTime();
            let now = Date.now();

            let diff = targetTime - now;

            if (diff <= 0) {
                this.timerValue.string = "00:00:00";
                return;
            }

            let totalSeconds = Math.floor(diff / 1000);

            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = totalSeconds % 60;

            this.timerValue.string = `${(this.pad(hours))}:${(this.pad(minutes))}:${(this.pad(seconds))}`;
        }
    }

    pad(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    showTips() {
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
        this.tipsContentNode.removeAllChildren();
        let setUi = (data, hands, type) => {
            this.tipsPopupNode.active = true;

            // for (let i = 0; i < data.length; i++) {
            let tipNode = cc.instantiate(this.tipsContentPrefab);
            tipNode.getComponent(rulesContentTs).initViews(data, hands, type);
            this.tipsContentNode.addChild(tipNode);
            // }
            this.highHandPopUpNode.opacity = 0;
        };


        globalThis.ServerCom.httpGetRequest(globalThis.K.ServerAddress.otp_server + "/api/highHand/rules",
            null,
            (response) => {
                // response = {
                //     "success": true,
                //     "data": {
                //         "hasActiveEvent": true,
                //         "minQualifyingHand": {
                //             "name": "Four Of A Kind",
                //             "priority": 8,
                //             "cards": [
                //                 {
                //                     "type": "spade",
                //                     "rank": 1,
                //                     "name": "A",
                //                     "priority": 14
                //                 },
                //                 {
                //                     "type": "heart",
                //                     "rank": 1,
                //                     "name": "A",
                //                     "priority": 14
                //                 },
                //                 {
                //                     "type": "diamond",
                //                     "rank": 1,
                //                     "name": "A",
                //                     "priority": 14
                //                 },
                //                 {
                //                     "type": "club",
                //                     "rank": 1,
                //                     "name": "A",
                //                     "priority": 14
                //                 },
                //                 {
                //                     "type": "spade",
                //                     "rank": 13,
                //                     "name": "K",
                //                     "priority": 13
                //                 }
                //             ]
                //         },
                //         "rules": [
                //             "NLH: Any combination of 2 hole cards and community cards is valid. Omaha (PLO4, PLO5, PLO6, PLO8): Exactly 2 hole cards and 3 community cards must be used.",
                //             "The pot must be equal or bigger than 10 BBs in NLH and PLO.",
                //             "At least four players must be dealt in pre-flop for a hand to qualify.",
                //             "High Hand events apply to NLH, PLO4, PLO5, PLO6, and PLO8. Mixed Games are not supported.",
                //             "In PLO8, only the High hand portion is considered; Low hands are excluded.",
                //             "High Hand fee will be deducted."
                //         ],
                //         "payoutDetails": [
                //             "The player with the strongest valid hand during the active round timer is declared the winner.",
                //             "If no qualifying hand occurs within the round, the prize rolls over to the next round.",
                //             "If two or more players achieve the same highest-ranking hand, the prize is divided equally among them.",
                //             "A hand becomes ineligible for High Hand consideration if: The player folds before the showdown. The player disconnects before cards are revealed. The player's cards are mucked or hidden without being shown."
                //         ]
                //     }
                // }
                console.log("highHandTipsData", response);
                // K.HighHandEnabled = response.data.hasActiveEvent;
                if (response.data.rules && response.data.rules.length > 0) {
                    setUi(response.data.rules, response.data.minQualifyingHand, "HighHand");
                }
                if (response.data.payoutDetails && response.data.payoutDetails.length > 0) {
                    setUi(response.data.payoutDetails, response.data.minQualifyingHand, "PayoutDetails");
                }
            },
            (error) => {
                console.log("highHandTipsData error", error);
            }
        );
    }

    closeTips() {
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
        this.tipsPopupNode.active = false;
        this.highHandPopUpNode.opacity = 255;
    }

    goBack() {
        this.unscheduleAllCallbacks();
        this.closeSelf();
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
    }

    closeThisPopup() {
        this.closeSelf();
    }

    // update (dt) {}
}
