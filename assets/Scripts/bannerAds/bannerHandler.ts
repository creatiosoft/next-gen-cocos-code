import PageViewIndicatoHandl from "../Utilities/PageViewIndicatoHandl";
import bannerAds_Page from "./bannerAds_Page";

const { ccclass, property } = cc._decorator;

@ccclass
export default class bannerHandler extends cc.Component {

    @property(cc.Node) bannerContent: cc.Node = null;
    @property(cc.Prefab) bannerPrefab: cc.Prefab = null;

    @property(cc.PageView) pageView: cc.PageView = null;

    @property
    autoScrollInterval: number = 3;

    private _currentIndex: number = 0;
    private _logicalIndex: number = 0; // indicator ke liye real page number
    private _totalPages: number = 0;
    private _intervalId: any = null;
    private _isInitialized: boolean = false;
    private _isWrapping: boolean = false;
    private _touchStartX: number = 0;

    start() { }

    scrollToIndex(index: number, duration: number) {
        // console.log("[Banner] scrollToIndex", index, "duration:", duration);
        this.pageView.scrollToPage(index, duration);
    }

    setData(data) {
        // console.log("[Banner] setData called, data.length:", data?.length);
        if (!this.pageView) {
            // console.warn("[Banner] setData aborted: pageView is not assigned");
            return;
        }
        if (this._isInitialized) {
            // console.log("[Banner] setData skipped: already initialized");
            return;
        }

        if (this.pageView.node.width === 0) {
            // console.log("[Banner] pageView width is 0, retrying setData in 0.1s");
            this.scheduleOnce(() => this.setData(data), 0.1);
            return;
        }

        this._isInitialized = true;
        this.pageView.node.off('page-turning', this.onPageTurn, this);
        this.pageView.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.pageView.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.pageView.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.initView(data);
        this._currentIndex = 0;
        this._logicalIndex = 0;
        this.pageView.node.on('page-turning', this.onPageTurn, this);
        this.pageView.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.pageView.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.pageView.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.scheduleOnce(() => {
            this.scrollToIndex(this._currentIndex, 0);
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
        // console.log("[Banner] initView start, pageW:", pageW, "pageH:", pageH, "bannerCount:", data.length);

        if (!this.bannerPrefab) {
            // console.warn("[Banner] initView aborted: bannerPrefab is not assigned");
            return;
        }

        this.pageView.removeAllPages();

        let logicalIdx = 0;

        if (data.length > 0) {
            let first = cc.instantiate(this.bannerPrefab);
            first.getComponent(bannerAds_Page).setBanner(data[0]);
            first.setContentSize(pageW, pageH);
            first.name = `banner_page_${logicalIdx++}`;
            this.pageView.addPage(first);
            // console.log("[Banner] added page", first.name);
        }

        for (let i = 1; i < data.length; i++) {
            let bannerItem = cc.instantiate(this.bannerPrefab);
            bannerItem.getComponent(bannerAds_Page).setBanner(data[i]);
            bannerItem.setContentSize(pageW, pageH);
            bannerItem.name = `banner_page_${logicalIdx++}`;
            this.pageView.addPage(bannerItem);
            // console.log("[Banner] added page", bannerItem.name);
        }

        this._totalPages = this.pageView.content.children.length;
        // console.log("[Banner] initView done, totalPages:", this._totalPages);

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
        // console.log("[Banner] startAutoScroll, pages:", this._totalPages);
        clearInterval(this._intervalId);
        this._intervalId = setInterval(this.autoScrollNext, this.autoScrollInterval * 1000);
    }

    // GameScreen jaisi trick: sibling reorder se infinite loop
    _wrapForward() {
        const pages = this.pageView.content.children;
        pages[0].setSiblingIndex(pages.length - 1);

        this.scheduleOnce(() => {
            this._currentIndex = pages.length - 2;
            this.scrollToIndex(this._currentIndex, 0);

            this.scheduleOnce(() => {
                this._currentIndex = pages.length - 1;
                this.scrollToIndex(this._currentIndex, 0.5);
                this._logicalIndex = this._getLogicalIndex(this._currentIndex);
                this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                this._isWrapping = false;
                // console.log("[Banner] wrapForward done, domIdx:", this._currentIndex, "logicalIdx:", this._logicalIndex);
            }, 0.05);
        }, 0);
    }

    _wrapBackward() {
        const pages = this.pageView.content.children;
        pages[pages.length - 1].setSiblingIndex(0);

        this.scheduleOnce(() => {
            this._currentIndex = 1;
            this.scrollToIndex(this._currentIndex, 0);

            this.scheduleOnce(() => {
                this._currentIndex = 0;
                this.scrollToIndex(this._currentIndex, 0.5);
                this._logicalIndex = this._getLogicalIndex(this._currentIndex);
                this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                this._isWrapping = false;
                // console.log("[Banner] wrapBackward done, domIdx:", this._currentIndex, "logicalIdx:", this._logicalIndex);
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
            this.scrollToIndex(this._currentIndex, 0.5);
            this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
        }
        // console.log("[Banner] currentPage:", this._currentIndex, "logicalIndex:", this._logicalIndex, "totalPages:", this._totalPages);
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
                    this.scrollToIndex(this._currentIndex, 0.3);
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
                    this.scrollToIndex(this._currentIndex, 0.3);
                    this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
                }, 0);
            }
        }
    }

    onEnable() {
        // console.log("[Banner] onEnable, initialized:", this._isInitialized, "pages:", this.pageView?.content?.children.length);
        if (this._isInitialized && this.pageView?.content?.children.length > 0) {
            this._currentIndex = 0;
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
                this.scrollToIndex(this._currentIndex, 0);
                this.pageView.getComponent(PageViewIndicatoHandl)?.updateIndicator(this._logicalIndex);
            }, 0);
        }
    }

    onDisable() {
        // console.log("[Banner] onDisable");
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
