const { ccclass, property } = cc._decorator;

@ccclass
export default class EntriesRow extends cc.Component {

    @property(cc.Label) playerNameLabel: cc.Label = null!;
    @property(cc.Label) playerIdLabel: cc.Label = null!;
    @property(cc.Sprite) avatarSprite: cc.Sprite = null!;
    @property(cc.Node) highlight: cc.Node = null!;

    setData(data: any, isHighlighted: boolean = false) {
        if (this.highlight) this.highlight.active = isHighlighted;
        this.playerNameLabel.string = data.playerName || "";
        this.playerIdLabel.string = "ID: " + (data.playerId || "");

        const profileIdx = data.avatarId;

        if (this.avatarSprite) {
            const gm = (globalThis as any).GameManager;
            this.avatarSprite.spriteFrame = gm.avatarImages[profileIdx] || gm.avatarImages[0];
        }
    }
}
