import bbjOpponentWinnerDetailsTs from "./bbjOpponentWinnerDetailsTs";
import bbjWinnerDetailsTs from "./bbjWinnerDetailsTs";
import { PopUpManager, PopUpType }
    from "../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
import cardHighHand from "../high_hand/cardHighHand";
const PopUpBase = require("PopUpBase");

const { ccclass, property } = cc._decorator;

@ccclass
export default class bbjPopupTs extends PopUpBase {


    //tab Nodes
    @property(cc.Node) ena_Tab1: cc.Node = null;
    @property(cc.Node) ena_Tab2: cc.Node = null;
    @property(cc.Node) ena_Tab3: cc.Node = null;
    @property(cc.SpriteFrame) tab_Glow_Sprite: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame) tab1_Normal_Sprite: cc.SpriteFrame[] = [];


    @property(cc.ScrollView) tabWinnerContent: cc.ScrollView = null;
    @property(cc.Prefab) winnerDetailsPrefab: cc.Prefab = null;
    @property(cc.Prefab) winnerOpponentDet_Pre: cc.Prefab = null;

    @property(cc.Node) tabRulesDetail: cc.Node = null;
    @property(cc.Node) rulesContent: cc.Node = null;
    @property(cc.Prefab) rules_Pre: cc.Prefab = null;
    @property(cc.Node) stakeContent: cc.Node = null;
    @property(cc.Prefab) stake_Pre: cc.Prefab = null;

    @property(cc.Node) qualifyingHandsDetails: cc.Node = null;
    @property(cc.Label) qualifyingHandsGames: cc.Label = null;
    @property(cc.Node) qualifyingHandsCards: cc.Node[] = [];
    @property(cc.Node) qualifyingHandsRulesCon: cc.Node = null;

    data: any = null;
    start() {
        // this.data = this.node.getComponent("PopUpBase").data;
    }

    setView() {
        // this.data = this.node.getComponent("PopUpBase").data;
        this.setWinnersList(this.data.winners);
        this.setRules(this.data.rules);
        this.setStakes(this.data.rules.stakeLevels);
        this.setQualifyingHands(this.data.qualifyingHands);
    }

    // protected onEnable(): void {
    //     this.scheduleOnce(() => {
    //         this.setView();
    //     }, 0.001);
    //     this.switchTab(null, "tab1");
    // }

    onShow(data) {
        this.data = data;
        this.setView();
        this.switchTab(null, "tab1");
    }

    switchTab(event, customEventData) {
        if (event != null) {
            globalThis.GameManager.playSound(globalThis.K.Sounds.click);
        }
        this.resetAllTabs();
        switch (customEventData) {
            case "tab1":
                this.ena_Tab1.getChildByName("glow").active = true;
                this.ena_Tab1.getChildByName("normal").active = false;
                this.tabWinnerContent.node.active = true;
                this.ena_Tab1.getComponent(cc.Sprite).spriteFrame = this.tab_Glow_Sprite[0];
                break;
            case "tab2":
                this.ena_Tab2.getChildByName("glow").active = true;
                this.ena_Tab2.getChildByName("normal").active = false;
                this.tabRulesDetail.active = true;
                this.ena_Tab2.getComponent(cc.Sprite).spriteFrame = this.tab_Glow_Sprite[1];
                break;
            case "tab3":
                this.ena_Tab3.getChildByName("glow").active = true;
                this.ena_Tab3.getChildByName("normal").active = false;
                this.qualifyingHandsDetails.active = true;
                this.ena_Tab3.getComponent(cc.Sprite).spriteFrame = this.tab_Glow_Sprite[2];
                break;
        }
    }

    resetAllTabs() {
        this.ena_Tab1.getComponent(cc.Sprite).spriteFrame = this.tab1_Normal_Sprite[0];
        this.ena_Tab2.getComponent(cc.Sprite).spriteFrame = this.tab1_Normal_Sprite[1];
        this.ena_Tab3.getComponent(cc.Sprite).spriteFrame = this.tab1_Normal_Sprite[2];

        this.ena_Tab1.getChildByName("glow").active = false;
        this.ena_Tab2.getChildByName("glow").active = false;
        this.ena_Tab3.getChildByName("glow").active = false;
        this.ena_Tab1.getChildByName("normal").active = true;
        this.ena_Tab2.getChildByName("normal").active = true;
        this.ena_Tab3.getChildByName("normal").active = true;

        this.tabWinnerContent.node.active = false;
        this.tabRulesDetail.active = false;
        this.qualifyingHandsDetails.active = false;
    }

    closePopup() {
        this.closeSelf();
        globalThis.GameManager.playSound(globalThis.K.Sounds.click);
    }

    setWinnersList(winnersData) {        
        this.tabWinnerContent.content.removeAllChildren();
        this.tabWinnerContent.node.getChildByName("noPlayer").active = !winnersData || winnersData.length == 0;
        if (!winnersData || winnersData.length == 0) {
            return;
        }
        // for (let i = 0; i < winnersData.length; i++) {
        //     if (winnersData[i].losingPlayer) {
        //         let winnerNode = cc.instantiate(this.winnerDetailsPrefab);
        //         winnerNode.getComponent(bbjWinnerDetailsTs).setWinnerDetails(winnersData[i].losingPlayer, winnersData[i].stakeLevel, "darkBg");
        //         this.tabWinnerContent.content.addChild(winnerNode);

        //         if (winnersData[i].winningPlayer) {
        //             // let winnerNode = cc.instantiate(this.winnerOpponentDet_Pre);
        //             winnerNode.getChildByName("bbjOpponentDetails").getComponent(bbjOpponentWinnerDetailsTs).setOpponentWinnerDetails(winnersData[i].winningPlayer, winnersData[i].stakeLevel, winnersData[i].sharedPlayers);
        //             // this.tabWinnerContent.content.addChild(winnerNode);
        //         }
        //     }


        // }

        for (let i = 0; i < winnersData.length; i++) {

            let losingPlayers = winnersData[i].losingPlayer;
            let winningPlayers = winnersData[i].winningPlayer;

            // normalize to array
            if (losingPlayers && !Array.isArray(losingPlayers)) {
                losingPlayers = [losingPlayers];
            }

            if (winningPlayers && !Array.isArray(winningPlayers)) {
                winningPlayers = [winningPlayers];
            }

            if (losingPlayers && losingPlayers.length > 0) {

                let winnerNode = cc.instantiate(this.winnerDetailsPrefab);

                winnerNode.getComponent(bbjWinnerDetailsTs).setWinnerDetails(losingPlayers[0], winnersData[i].stakeLevel, "darkBg");

                this.tabWinnerContent.content.addChild(winnerNode);

                if (winningPlayers && winningPlayers.length > 0) {
                    winnerNode.getChildByName("bbjOpponentDetails").getComponent(bbjOpponentWinnerDetailsTs).setOpponentWinnerDetails(winningPlayers[0],winnersData[i].stakeLevel,winnersData[i].sharedPlayers);
                }
            }
        }
    }

    setRules(rulesData) {
        this.rulesContent.removeAllChildren();
        for (let i = 0; i < rulesData.ruleTexts.length; i++) {
            let ruleNode = cc.instantiate(this.rules_Pre);
            ruleNode.getComponent(cc.Label).string = rulesData.ruleTexts[i];
            this.rulesContent.addChild(ruleNode);
        }
    }

    setStakes(data) {
        this.stakeContent.removeAllChildren();
        for (let i = 0; i < data.length; i++) {
            let stakeNode = cc.instantiate(this.stake_Pre);
            let stake = stakeNode.getChildByName("stake");
            stake.getChildByName("stakeLevel").children[0].getComponent(cc.Label).string = `${data[i].name} \n (${data[i].blindRangeFrom} - ${data[i].blindRangeTo})`;
            stake.getChildByName("totalJackpot").children[0].getComponent(cc.Label).string = `${data[i].totalJackpotPercent}%`;
            stake.getChildByName("losingPlayer").children[0].getComponent(cc.Label).string = `${data[i].loserPercent}%`;
            stake.getChildByName("winningPlayer").children[0].getComponent(cc.Label).string = `${data[i].winnerPercent}%`;
            stake.getChildByName("sharePool").children[0].getComponent(cc.Label).string = `${data[i].sharedPoolPercent}%`;
            this.stakeContent.addChild(stakeNode);
        }
    }

    setQualifyingHands(data) {
        this.qualifyingHandsRulesCon.removeAllChildren();
        let handVariants = "";
        for (let i = 0; i < data.eligibleVariants.length; i++) {
            handVariants = handVariants + (i == 0 ? "" : ", ") + data.eligibleVariants[i];
        }
        this.qualifyingHandsGames.string = handVariants;

        for (let a = 0; a < data.exampleCards.cards.length; a++) {
            this.qualifyingHandsCards[a].getComponent(cardHighHand).setCard(data.exampleCards.cards[a]);
        }

        for (let k = 0; k < data.ruleTexts.length; k++) {
            let ruleNode = cc.instantiate(this.rules_Pre);
            ruleNode.getComponent(cc.Label).string = data.ruleTexts[k];
            this.qualifyingHandsRulesCon.addChild(ruleNode);
        }
    }
}