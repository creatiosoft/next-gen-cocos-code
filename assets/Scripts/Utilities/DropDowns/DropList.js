/** @class DropList
 * @classdesc Handles animation for drop down list
 * @memberof Utilities.DropDowns
 */

cc.Class({
    extends: cc.Component,

    properties: {
        reverse: {
            default: false,
            visible: false,
        },
        ifClicked: false,
        listener: null,
    },

    /**
     * @description Initialise drop and lift animation and listen for touch outside dropdown to close dropdown.
     * @method onLoad
     * @memberof Utilities.DropDowns.DropList#
     */
    onLoad: function () {
        this.dropAct = this.dropAction();
        this.liftAct = this.liftAction();
        GameManager.node.on("dropdown-out", function (data) {
            if (data != this) {
                this.popIn();
            }
        }.bind(this));

        // GameManager.on("posClicked", this.closeDropdown.bind(this));
        var inst = this;
        this.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: (touch, event) => {
                var touchLoc = touch.getLocation();
                if (inst.ifClicked && !inst.testNodeClicked(inst.node, touchLoc, true) && !inst.testNodeClicked(inst.node.parent.getChildByName('Button'), touchLoc, false)) {
                    inst.popIn();
                    event.stopPropagation();
                }
            },
        });

        cc.eventManager.addListener(this.listener, this.node);
    },

    /**
     * If Click is outside the dropdown area, close the dropdown if already opened.
     */
    // closeDropdown: function (point) {
    //     if (this.ifClicked && !this.testNodeClicked(this.node, point, true) && !this.testNodeClicked(this.node.parent.getChildByName('Button'), point, false)) {
    //         this.popIn();
    //     }
    // },

    /**
     * @description Return true if point is inside the passed node.
     * @method testNodeClicked
     * @param {Object} node
     * @param {Object} point
     * @param {boolean} addParentHeight
     * @memberof Utilities.DropDowns.DropList#
     */
    testNodeClicked(node, point, addParentHeight) {
        var w = node.width,
            h = addParentHeight ? node.height + this.node.parent.height : node.height;
        var rect = cc.rect(0, 0, w, h);
        // let mat4 = cc.mat4();
        // var trans = node.getWorldMatrix(mat4);
        // rect= this.rectApplyAffineTransformIn(rect, trans);
        var left = point.x - rect.x,
            right = rect.x + rect.width - point.x,
            bottom = point.y - rect.y,
            top = rect.y + rect.height - point.y;
        if (left >= 0 && right >= 0 && top >= 0 && bottom >= 0) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * @description Drop animation - Using Action Interval
     * @method dropAction
     * @memberof Utilities.DropDowns.DropList#
     */
    dropAction: function () {
        var scaleOut = cc.scaleBy(0.35, 1, 100).easing(cc.easeCubicActionOut());
        // let x = cc.sequence(cc.callFunc(() => {
        //     this.node.active = true;
        // }), scaleOut);
        return scaleOut;
    },

    /**
     * @description Close animation - Using Action Interval
     * @method liftAction
     * @memberof Utilities.DropDowns.DropList#
     */
    liftAction: function () {
        var scaleIn = cc.scaleBy(0.35, 1, 0).easing(cc.easeCubicActionOut());
        let x = cc.sequence(scaleIn, cc.callFunc(() => {
            this.node.active = false;
        }));
        return x;
    },

    /**
     * @description Drop down button callback
     * @method popOut
     * @memberof Utilities.DropDowns.DropList#
     */
    popOut: function () {
        this.node.stopAllActions();
        if (!this.reverse) {
            // open
            GameManager.node.emit("dropdown-out", this);

            this.node.scaleY = 0.01;
            this.node.active = true;
            this.node.runAction(this.dropAct);
            this.reverse = true;
            this.ifClicked = true;
        } else {
            // close
            this.popIn();
        }

    },

    /**
     * @description Runs close animation
     * @method popIn
     * @memberof Utilities.DropDowns.DropList#
     */
    popIn: function () {
        if (this.reverse) {
            this.ifClicked = false;
            this.node.scaleY = 1;
            this.node.runAction(this.liftAct);
            this.reverse = false;
        }
    },

    rectApplyAffineTransformIn: function (rect, t) {
        var ol = rect.x;
        var ob = rect.y;
        var or = ol + rect.width;
        var ot = ob + rect.height;
        var lbx = t.a * ol + t.c * ob + t.tx;
        var lby = t.b * ol + t.d * ob + t.ty;
        var rbx = t.a * or + t.c * ob + t.tx;
        var rby = t.b * or + t.d * ob + t.ty;
        var ltx = t.a * ol + t.c * ot + t.tx;
        var lty = t.b * ol + t.d * ot + t.ty;
        var rtx = t.a * or + t.c * ot + t.tx;
        var rty = t.b * or + t.d * ot + t.ty;
        var minX = Math.min(lbx, rbx, ltx, rtx);
        var maxX = Math.max(lbx, rbx, ltx, rtx);
        var minY = Math.min(lby, rby, lty, rty);
        var maxY = Math.max(lby, rby, lty, rty);
        rect.x = minX;
        rect.y = minY;
        rect.width = maxX - minX;
        rect.height = maxY - minY;
        return rect;
    },
});