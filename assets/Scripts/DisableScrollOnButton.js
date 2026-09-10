cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        this.node.on('touchstart', this.onTouchStart, this);
        this.node.on('touchmove', this.onTouchMove, this);
        this.node.on('touchend', this.onTouchEnd, this);
        this.node.on('touchcancel', this.onTouchCancel, this);
    },

    onTouchStart(event) {

        GameScreen.gridParent.getComponent(cc.PageView)._unregisterEvent();

        // 阻止触摸事件的传播，防止 ScrollView 滑动
        // event.stopPropagation();
        // this.pageview.off(cc.Node.EventType.TOUCH_START, this.pageview._onTouchBegan, this.pageview, true);
        // this.pageview.off(cc.Node.EventType.TOUCH_MOVE, this.pageview._onTouchMoved, this.pageview, true);
        // this.pageview.off(cc.Node.EventType.TOUCH_END, this.pageview._onTouchEnded, this.pageview, true);
        // this.pageview.off(cc.Node.EventType.TOUCH_CANCEL, this.pageview._onTouchCancelled, this.pageview, true);
    },

    onTouchMove(event) {
        // 阻止触摸事件的传播，防止 ScrollView 滑动
        // event.stopPropagation();
        // this.pageview.off(cc.Node.EventType.TOUCH_START, this.pageview._onTouchBegan, this.pageview, true);
        // this.pageview.off(cc.Node.EventType.TOUCH_MOVE, this.pageview._onTouchMoved, this.pageview, true);
        // this.pageview.off(cc.Node.EventType.TOUCH_END, this.pageview._onTouchEnded, this.pageview, true);
        // this.pageview.off(cc.Node.EventType.TOUCH_CANCEL, this.pageview._onTouchCancelled, this.pageview, true);
    },

    onTouchEnd(event) {
        // 阻止触摸事件的传播，防止 ScrollView 滑动
        GameScreen.gridParent.getComponent(cc.PageView)._registerEvent();
        // event.stopPropagation();
        // this.pageview.on(cc.Node.EventType.TOUCH_START, this.pageview._onTouchBegan, this.pageview, true);
        // this.pageview.on(cc.Node.EventType.TOUCH_MOVE, this.pageview._onTouchMoved, this.pageview, true);
        // this.pageview.on(cc.Node.EventType.TOUCH_END, this.pageview._onTouchEnded, this.pageview, true);
        // this.pageview.on(cc.Node.EventType.TOUCH_CANCEL, this.pageview._onTouchCancelled, this.pageview, true);
    },

    onTouchCancel(event) {
        // 阻止触摸事件的传播，防止 ScrollView 滑动
        GameScreen.gridParent.getComponent(cc.PageView)._registerEvent();
        // event.stopPropagation();
        // this.pageview.on(cc.Node.EventType.TOUCH_START, this.pageview._onTouchBegan, this.pageview, true);
        // this.pageview.on(cc.Node.EventType.TOUCH_MOVE, this.pageview._onTouchMoved, this.pageview, true);
        // this.pageview.on(cc.Node.EventType.TOUCH_END, this.pageview._onTouchEnded, this.pageview, true);
        // this.pageview.on(cc.Node.EventType.TOUCH_CANCEL, this.pageview._onTouchCancelled, this.pageview, true);
    },
});