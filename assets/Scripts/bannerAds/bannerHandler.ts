import PageViewIndicatoHandl from "../Utilities/PageViewIndicatoHandl";
import bannerAds_Page from "./bannerAds_Page";

const { ccclass, property } = cc._decorator;

@ccclass
export default class bannerHandler extends cc.Component {

    @property(cc.Node) bannerContent: cc.Node = null;
    @property(cc.Prefab) bannerPrefab: cc.Prefab = null;
    @property(cc.Node) jackpotPage: cc.Node = null;

    @property(cc.PageView) pageView: cc.PageView = null;

    @property
    autoScrollInterval: number = 3;

    private _currentIndex: number = 0;
    private _logicalIndex: number = 0; // indicator ke liye real page number
    private _totalPages: number = 0;
    private _intervalId: any = null;
    private _effectiveW: number = 0;
    private _peekOffset: number = 150;
    private _isInitialized: boolean = false;
    private _isWrapping: boolean = false;
    private _touchStartX: number = 0;

    start() { }

    scrollToIndexWithPeek(index: number, duration: number) {
        const offset = Math.max(0, index * this._effectiveW - this._peekOffset / 2);
        (this.pageView as any)['_curPageIdx'] = index;
        this.pageView.scrollToOffset(cc.v2(offset, 0), duration);
    }

    setData(data) {
        if (!this.pageView) return;
        if (this._isInitialized) { return; }

        if (this.pageView.node.width === 0) {
            this.scheduleOnce(() => this.setData(data), 0.1);
            return;
        }

        this._isInitialized = true;
        this.pageView.node.off('page-turning', this.onPageTurn, this);
        this.pageView.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.pageView.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.pageView.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.initView(data);
        this._currentIndex = this.jackpotPage ? 1 : 0;
        this._logicalIndex = 0;
        this.pageView.node.on('page-turning', this.onPageTurn, this);
        this.pageView.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.pageView.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.pageView.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.scheduleOnce(() => {
            this.scrollToIndexWithPeek(this._currentIndex, 0);
            this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
        }, 0);
    }

    onTouchStart(event: cc.Touch) {
        clearInterval(this._intervalId);
        this._intervalId = null;
        this._touchStartX = event.getLocationX();
    }

    onTouchEnd(event: cc.Touch) {
        const deltaX = event.getLocationX() - this._touchStartX;
        const threshold = 30;
        const pages = this.pageView.content.children;

        if (!this._isWrapping) {
            if (deltaX < -threshold && this._currentIndex >= pages.length - 1) {
                // Last page par left swipe — wrap forward
                this._isWrapping = true;
                this._wrapForward();
            } else if (deltaX > threshold && this._currentIndex <= 0) {
                // First page par right swipe — wrap backward
                this._isWrapping = true;
                this._wrapBackward();
            }
        }

        this.scheduleOnce(() => { this.startAutoScroll(); }, 1);
    }

    initView(data) {
        const pageW = this.pageView.node.width;
        const pageH = this.pageView.node.height;
        this._peekOffset = 150;
        this._effectiveW = pageW - this._peekOffset;
        const effectiveW = this._effectiveW;

        this.pageView['_pageWidth'] = effectiveW;
        this.pageView['_pageHeight'] = pageH;
        this.pageView.removeAllPages();

        let logicalIdx = 0;

        if (data.length > 0) {
            let first = cc.instantiate(this.bannerPrefab);
            first.getComponent(bannerAds_Page).setBanner(data[0]);
            first.setContentSize(effectiveW, pageH);
            first.name = `banner_page_${logicalIdx++}`;
            this.pageView.addPage(first);
        }

        if (this.jackpotPage) {
            this.jackpotPage.removeFromParent(false);
            this.jackpotPage.setContentSize(effectiveW, pageH);
            this.jackpotPage.active = true;
            this.jackpotPage.name = `banner_page_${logicalIdx++}`;
            this.pageView.addPage(this.jackpotPage);
        }

        for (let i = 1; i < data.length; i++) {
            let bannerItem = cc.instantiate(this.bannerPrefab);
            bannerItem.getComponent(bannerAds_Page).setBanner(data[i]);
            bannerItem.setContentSize(effectiveW, pageH);
            bannerItem.name = `banner_page_${logicalIdx++}`;
            this.pageView.addPage(bannerItem);
        }

        this._totalPages = this.pageView.content.children.length;
        // cc.log("[Banner] initView done, totalPages=", this._totalPages);

        this.scheduleOnce(() => { this.startAutoScroll(); }, 2);
    }

    _getLogicalIndex(domIndex: number): number {
        const pages = this.pageView.content.children;
        if (!pages[domIndex]) return 0;
        const name = pages[domIndex].name; // "banner_page_2"
        const idx = parseInt(name.replace('banner_page_', ''));
        return isNaN(idx) ? 0 : idx;
    }

    startAutoScroll() {
        // cc.log("[Banner] startAutoScroll, pages=", this._totalPages);
        clearInterval(this._intervalId);
        this._intervalId = setInterval(this.autoScrollNext, this.autoScrollInterval * 1000);
    }

    // GameScreen jaisi trick: sibling reorder se infinite loop
    _wrapForward() {
        const pages = this.pageView.content.children;
        pages[0].setSiblingIndex(pages.length - 1);

        this.scheduleOnce(() => {
            this._currentIndex = pages.length - 2;
            this.scrollToIndexWithPeek(this._currentIndex, 0);

            this.scheduleOnce(() => {
                this._currentIndex = pages.length - 1;
                this.scrollToIndexWithPeek(this._currentIndex, 0.5);
                this._logicalIndex = this._getLogicalIndex(this._currentIndex);
                this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                this._isWrapping = false;
                // cc.log("[Banner] wrapForward done, domIdx:", this._currentIndex, "logicalIdx:", this._logicalIndex);
            }, 0.05);
        }, 0);
    }

    _wrapBackward() {
        const pages = this.pageView.content.children;
        pages[pages.length - 1].setSiblingIndex(0);

        this.scheduleOnce(() => {
            this._currentIndex = 1;
            this.scrollToIndexWithPeek(this._currentIndex, 0);

            this.scheduleOnce(() => {
                this._currentIndex = 0;
                this.scrollToIndexWithPeek(this._currentIndex, 0.5);
                this._logicalIndex = this._getLogicalIndex(this._currentIndex);
                this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                this._isWrapping = false;
                // cc.log("[Banner] wrapBackward done, domIdx:", this._currentIndex, "logicalIdx:", this._logicalIndex);
            }, 0.05);
        }, 0);
    }

    autoScrollNext = () => {
        if (!this.pageView || this._isWrapping) return;
        const pages = this.pageView.content.children;
        if (!pages || pages.length <= 1) return;

        if (this._currentIndex >= pages.length - 1) {
            this._isWrapping = true;
            this._wrapForward();
        } else {
            this._currentIndex++;
            this._logicalIndex = this._getLogicalIndex(this._currentIndex);
            this.scrollToIndexWithPeek(this._currentIndex, 0.5);
            this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
        }
        // cc.log("[Banner] currentPage:", this._currentIndex, "logicalIndex:", this._logicalIndex, "totalPages:", this._totalPages);
    }

    onPageTurn() {
        if (this._isWrapping) return;
        const idx = this.pageView.getCurrentPageIndex();
        const pages = this.pageView.content.children;

        if (idx > this._currentIndex) {
            if (idx >= pages.length - 1) {
                this._isWrapping = true;
                this._currentIndex = idx;
                this._wrapForward();
            } else {
                this._currentIndex = idx;
                this._logicalIndex = this._getLogicalIndex(this._currentIndex);
                this.scheduleOnce(() => {
                    this.scrollToIndexWithPeek(this._currentIndex, 0.3);
                    this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                }, 0);
            }
        } else if (idx < this._currentIndex) {
            if (idx <= 0) {
                this._isWrapping = true;
                this._currentIndex = idx;
                this._wrapBackward();
            } else {
                this._currentIndex = idx;
                this._logicalIndex = this._getLogicalIndex(this._currentIndex);
                this.scheduleOnce(() => {
                    this.scrollToIndexWithPeek(this._currentIndex, 0.3);
                    this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                }, 0);
            }
        }
    }

    onEnable() {
        // cc.log("[Banner] onEnable — initialized:", this._isInitialized);
        if (this._isInitialized && this.pageView?.content?.children.length > 0) {
            this._currentIndex = this.jackpotPage ? 1 : 0;
            this._logicalIndex = 0;
            this._isWrapping = false;
            this.startAutoScroll();
            this.pageView.node.off('page-turning', this.onPageTurn, this);
            this.pageView.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.pageView.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.pageView.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.pageView.node.on('page-turning', this.onPageTurn, this);
            this.pageView.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.pageView.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.pageView.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.scheduleOnce(() => {
                this.scrollToIndexWithPeek(this._currentIndex, 0);
                this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
            }, 0);
        }
    }

    onDisable() {
        // cc.log("[Banner] onDisable");
        clearInterval(this._intervalId);
        this._intervalId = null;
        this._isWrapping = false;
        this.unscheduleAllCallbacks();
        this.pageView?.node.off('page-turning', this.onPageTurn, this);
        this.pageView?.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.pageView?.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.pageView?.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
