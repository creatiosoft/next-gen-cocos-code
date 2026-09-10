const { ccclass, property } = cc._decorator;

@ccclass
export default class PageViewIndicatoHandl extends cc.Component {

    @property(cc.PageView) pageView: cc.PageView = null;
    @property(cc.Node) indicatorNode: cc.Node = null;
    // @property(cc.Node) indicatorNodePrefa: cc.Node = null;
    @property(cc.SpriteFrame) activeSpriteframe: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) inactiveSpriteframe: cc.SpriteFrame = null;

    private _dotTemplate: cc.Node = null;

    onLoad() {
        if (this.indicatorNode && this.indicatorNode.childrenCount > 0) {
            this._dotTemplate = cc.instantiate(this.indicatorNode.children[0]);
            this.indicatorNode.removeAllChildren();
        }
    }

    updateIndicator(activeIndex?: number) {
        if (!this.pageView || !this.indicatorNode || !this._dotTemplate) return;

        const pageCount = this.pageView.content ? this.pageView.content.children.length : 0;
        const pageIndex = activeIndex !== undefined ? activeIndex : this.pageView.getCurrentPageIndex();

        const currentCount = this.indicatorNode.childrenCount;
        for (let i = currentCount; i < pageCount; i++) {
            this.indicatorNode.addChild(cc.instantiate(this._dotTemplate));
        }
        for (let i = currentCount - 1; i >= pageCount; i--) {
            this.indicatorNode.removeChild(this.indicatorNode.children[i], true);
        }

        for (let i = 0; i < pageCount; i++) {
            this.indicatorNode.children[i].getComponent(cc.Sprite).spriteFrame =
                (i === pageIndex) ? this.activeSpriteframe : this.inactiveSpriteframe;
        }
    }
}
