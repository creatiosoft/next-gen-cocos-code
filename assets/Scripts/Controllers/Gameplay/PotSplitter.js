/**
 * @classdesc Fly awarded pot chips to winning seats.
 * Chip / pot UI updates are mandatory. The fly animation is best-effort.
 * @class PotSplitter
 * @memberof Controllers.Gameplay
 */
cc.Class({
    extends: cc.Component,

    properties: {
        centralPot: {
            default: null,
            type: cc.Node,
        },
        potPosRef: {
            default: [],
            type: cc.Node,
        },
    },

    onLoad: function () {
        this._resetState();
    },

    onDestroy: function () {
        this.clearRunningSplits(true);
    },

    resetApplyKeys: function () {
        this._appliedKeys = {};
    },

    /**
     * Stop leftover flights.
     * @param {boolean} discard If true, destroy clones without applying chips
     *   (next hand / table teardown). If false, apply remaining chip updates
     *   so a background interrupt cannot leave stacks stale.
     */
    clearRunningSplits: function (discard) {
        this.unscheduleAllCallbacks();
        var flying = this._flying || [];
        for (var i = 0; i < flying.length; i++) {
            var item = flying[i];
            if (!discard) {
                this._applyWinnerChips(item.element);
            }
            if (item.node && cc.isValid(item.node)) {
                item.node.stopAllActions();
                item.node.destroy();
            }
        }
        var cb = this._finishCallback;
        this._resetState();
        if (discard) {
            this._appliedKeys = {};
        }
        if (!discard && typeof cb === "function") {
            cb();
        }
    },

    /**
     * @param {Array} data winner rows: targetNode, winningAmount, totalChips, potIndex, type, winType
     * @param {cc.Node} potInstance source pot label to hide when this group owns it
     * @param {Function} callback fired once after this group settles
     */
    runPotSplitter: function (data, potInstance, callback) {
        if (cc.isValid(potInstance) && cc.isValid(potInstance.parent)) {
            potInstance.parent.active = false;
        }

        if (!data || !data.length) {
            if (typeof callback === "function") {
                callback();
            }
            return;
        }

        this._finishCallback = typeof callback === "function" ? callback : null;
        this._remaining = data.length;
        this._flying = [];

        var canAnimate = GameManager.isActive
            && !GameManager.androidFromBackground
            && cc.isValid(this.centralPot);

        for (var i = 0; i < data.length; i++) {
            this._splitOne(data[i], canAnimate);
        }

        if (!canAnimate) {
            this._finishIfDone(true);
            return;
        }

        var self = this;
        this.scheduleOnce(function () {
            self.clearRunningSplits(false);
        }, 0.7);
    },

    _resetState: function () {
        this._flying = [];
        this._appliedKeys = this._appliedKeys || {};
        this._finishCallback = null;
        this._remaining = 0;
    },

    _splitOne: function (element, canAnimate) {
        if (!element || !cc.isValid(element.targetNode)) {
            this._remaining--;
            return;
        }

        var presenter = element.targetNode.getComponent("PlayerPresenter");
        if (presenter && element.type != "REFUND" && presenter.showWinnerBanner) {
            presenter.showWinnerBanner(element.winType, element.type);
        }

        if (!canAnimate) {
            if (presenter && presenter.showWinningChips) {
                presenter.showWinningChips(element.winningAmount);
            }
            this._applyWinnerChips(element);
            this._remaining--;
            return;
        }

        var instance = cc.instantiate(this.centralPot);
        instance.active = true;
        instance.parent = element.targetNode.parent.parent.parent;
        instance.setPosition(this._startPos(element.potIndex || 0));
        this._writeAmountLabel(instance, element, presenter);

        if (presenter && presenter.showWinningChips) {
            presenter.showWinningChips(element.winningAmount);
        }

        var item = { node: instance, element: element };
        this._flying.push(item);

        var endPos = element.targetNode.parent.getPosition();
        var self = this;
        instance.runAction(cc.sequence(
            cc.moveTo(0.45, cc.v2(endPos.x, endPos.y)),
            cc.callFunc(function () {
                self._onFlightDone(item);
            })
        ));
    },

    _startPos: function (potIndex) {
        var ref = this.potPosRef[potIndex];
        var pos = cc.isValid(ref) ? ref.getPosition() : cc.v2(0, 0);
        return cc.v2(pos.x + Math.random() * 2, pos.y - 50);
    },

    _writeAmountLabel: function (instance, element, presenter) {
        var amountNode = instance.getChildByName("PotAmount");
        if (!cc.isValid(amountNode)) {
            return;
        }
        var label = amountNode.getComponent(cc.Label);
        if (!label) {
            return;
        }
        var model = presenter && presenter.pokerPresenter && presenter.pokerPresenter.model;
        if (GameManager.isBB && model && model.roomConfig) {
            var bigBlind = model.roomConfig.bigBlind;
            label.string = (Math.roundOff(element.winningAmount, 2) / bigBlind).toFixed(1) + "BB";
        } else {
            label.string = Math.roundOff(element.winningAmount, 2) + "";
        }
    },

    /**
     * Apply stack text once per winner-row. Safe across animation retry / foreground resume.
     */
    _applyWinnerChips: function (element) {
        if (!element || !cc.isValid(element.targetNode)) {
            return;
        }
        var key = [
            element.playerId,
            element.potIndex,
            element.internalPotSplitIndex,
            element.winningAmount,
            element.type
        ].join(":");
        if (this._appliedKeys[key]) {
            return;
        }
        this._appliedKeys[key] = true;

        var presenter = element.targetNode.getComponent("PlayerPresenter");
        if (!presenter || !presenter.amountLabel) {
            return;
        }

        var prevAmount = Math.roundOff(presenter.amountLabel.string, 2);
        var nextAmount = (prevAmount + element.winningAmount).roundOff(2);
        if (nextAmount <= element.totalChips) {
            presenter.amountLabel.string = nextAmount;
        } else if (element.totalChips != null) {
            presenter.amountLabel.string = GameManager.convertChips
                ? GameManager.convertChips(element.totalChips)
                : String(element.totalChips);
        }

        if (presenter.playerData && element.totalChips != null) {
            presenter.playerData.chips = element.totalChips;
        }
        if (presenter.updateBB) {
            presenter.updateBB();
        }
    },

    _onFlightDone: function (item) {
        this._applyWinnerChips(item.element);
        if (item.node && cc.isValid(item.node)) {
            item.node.stopAllActions();
            item.node.destroy();
        }
        this._remaining--;
        this._finishIfDone(false);
    },

    _finishIfDone: function (force) {
        if (!force && this._remaining > 0) {
            return;
        }
        var cb = this._finishCallback;
        this._finishCallback = null;
        this._flying = [];
        this._remaining = 0;
        if (typeof cb === "function") {
            cb();
        }
    },
});
