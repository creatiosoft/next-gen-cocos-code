import currentRoundLeaderItemTs from "./currentRoundLeaderItemTs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class currentRoundLeaderTs extends cc.Component {

    @property(cc.Label) roundLabel!: cc.Label;
    @property(cc.Label) currentBestLabel!: cc.Label;
    @property(cc.Node) playerListContent!: cc.Node;
    @property(cc.Prefab) playerItemPrefab!: cc.Prefab;

    initViews(currentRoundLeader: any, roundNumber: number) {
        if (this.roundLabel) this.roundLabel.string = "Round " + roundNumber;
        const firstLeader = currentRoundLeader?.leaders?.[0];
        if (this.currentBestLabel) this.currentBestLabel.string = (firstLeader?.handText || "");

        if (!this.playerListContent || !this.playerItemPrefab) return;
        this.playerListContent.removeAllChildren();

        const leaders = currentRoundLeader?.leaders || [];
        leaders.forEach((leader: any) => {
            const node = cc.instantiate(this.playerItemPrefab);
            node.getComponent(currentRoundLeaderItemTs).initViews(leader);
            this.playerListContent.addChild(node);
        });
    }
}
