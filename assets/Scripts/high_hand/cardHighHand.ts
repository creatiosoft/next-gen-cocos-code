const { ccclass, property } = cc._decorator;

@ccclass
export default class cardHighHand extends cc.Component {

    @property(cc.Label) point: cc.Label = null;
    @property(cc.Sprite) bigSuit: cc.Sprite = null;
    @property(cc.Sprite) smallSuit: cc.Sprite = null;

    // Suit sprites
    @property(cc.SpriteFrame) spade: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) heart: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) diamond: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) club: cc.SpriteFrame = null;

    start(): void {
        
    }

    /**
     * rank: 1–10 (1 = Ace)
     * suit: "spade" | "heart" | "diamond" | "club"
     */
    setCard(data) {

        let rank: string = data.name;
        let suit: string = data.type;
        // ✅ Point text (NO K Q J)
        // if (rank === 1) {
        //     this.point.string = "A";
        // } else {
        this.point.string = rank.toString();
        // }

        // ✅ Suit arrangement
        let suitFrame: cc.SpriteFrame = null;

        switch (suit) {
            case "spade":
                suitFrame = this.spade;
                break;
            case "heart":
                suitFrame = this.heart;
                break;
            case "diamond":
                suitFrame = this.diamond;
                break;
            case "club":
                suitFrame = this.club;
                break;
        }

        // Apply suit to both icons
        this.bigSuit.spriteFrame = suitFrame;
        this.smallSuit.node.color = cc.Color.WHITE; // Reset color before applying new one
        this.smallSuit.spriteFrame = suitFrame;

        // Optional: red / black color
        if (suit === "heart" || suit === "diamond") {
            this.point.node.color = cc.Color.RED;
        } else {
            this.point.node.color = cc.Color.BLACK;
        }
    }
}
