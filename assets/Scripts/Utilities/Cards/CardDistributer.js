/**
 * @classdesc Handles hole-card deal fly animation from the dealer node.
 * Animation is best-effort. Revealing cards via forceAddPlayerCards is mandatory.
 * @class CardDistributer
 * @memberof Utilities.CardDistributer
 */
cc.Class({
    extends: cc.Component,

    properties: {
        dealer: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad: function () {
        this._resetDealState();
    },

    onDestroy: function () {
        this.unscheduleAllCallbacks();
        this._pendingCards = [];
        this._pokerPresenter = null;
    },

    /**
     * Fly already-created (hidden) card nodes from dealer to each seat, then
     * reveal them through pokerPresenter.forceAddPlayerCards().
     * @param {number} noOfCards
     * @param {Array<{targetNode: cc.Node}>} data
     * @param {Object} pokerPresenter
     */
    distributeCards: function (noOfCards, data, pokerPresenter) {
        this._cancelScheduledWork();
        this._resetDealState();
        this._pokerPresenter = pokerPresenter || null;

        var slots = this._collectCardSlots(noOfCards, data);
        if (!slots.length) {
            this._ensureCardsShown();
            return;
        }

        this._pendingCards = slots;
        this._dealInProgress = true;

        var canAnimate = GameManager.isActive && this._hasDealer();
        if (!canAnimate) {
            this._snapCardsToFinal(slots);
            this._ensureCardsShown();
            return;
        }

        this._playDealAnimation(slots, pokerPresenter);
    },

    /**
     * Stop in-flight deal work. If a deal was running, snap remaining cards
     * and still reveal hands so a background/interrupt cannot leave empty seats.
     */
    clearTimers: function () {
        this._cancelScheduledWork();
        if (!this._dealInProgress) {
            return;
        }
        this._snapCardsToFinal(this._pendingCards);
        this._ensureCardsShown();
    },

    _resetDealState: function () {
        this._dealInProgress = false;
        this._forceAddCalled = false;
        this._pendingCards = [];
        this._remainingFlights = 0;
        this._pokerPresenter = null;
    },

    _cancelScheduledWork: function () {
        this.unscheduleAllCallbacks();
        var pending = this._pendingCards;
        if (!pending) {
            return;
        }
        for (var i = 0; i < pending.length; i++) {
            var node = pending[i].node;
            if (cc.isValid(node)) {
                node.stopAllActions();
            }
        }
    },

    _hasDealer: function () {
        return cc.isValid(this.dealer) && cc.isValid(this.dealer.parent);
    },

    _collectCardSlots: function (noOfCards, data) {
        var slots = [];
        if (!data || !noOfCards) {
            return slots;
        }
        for (var i = 0; i < noOfCards; i++) {
            for (var p = 0; p < data.length; p++) {
                var element = data[p];
                if (!element || !cc.isValid(element.targetNode)) {
                    continue;
                }
                var handPlayer = element.targetNode.getChildByName("HandPlayer");
                if (!cc.isValid(handPlayer)) {
                    continue;
                }
                var cardsRoot = handPlayer.getChildByName("Cards");
                var targets = cc.isValid(cardsRoot) ? cardsRoot.children : [];
                if (!targets.length) {
                    var myCardsRoot = handPlayer.getChildByName("MyCards");
                    targets = cc.isValid(myCardsRoot) ? myCardsRoot.children : [];
                }
                var instance = targets[i];
                if (!cc.isValid(instance)) {
                    continue;
                }
                slots.push({
                    node: instance,
                    targetPos: instance.getPosition(),
                });
            }
        }
        return slots;
    },

    _dealerLocalPosFor: function (instance) {
        var worldPos = this.dealer.parent.convertToWorldSpaceAR(this.dealer.getPosition());
        return instance.parent.convertToNodeSpaceAR(worldPos);
    },

    _snapCardToFinal: function (slot) {
        var node = slot.node;
        if (!cc.isValid(node)) {
            return;
        }
        node.stopAllActions();
        node.setPosition(slot.targetPos);
        node.setScale(1);
        node.opacity = 255;
        node.skewX = 0;
        node.skewY = 0;
        node.angle = 0;
    },

    _snapCardsToFinal: function (slots) {
        if (!slots) {
            return;
        }
        for (var i = 0; i < slots.length; i++) {
            this._snapCardToFinal(slots[i]);
        }
    },

    _playDealAnimation: function (slots, pokerPresenter) {
        var stagger = 0.121;
        var flyDuration = 0.2;
        var scaleDuration = 0.15;
        var snapBuffer = 0.5;
        var self = this;

        this._remainingFlights = slots.length;

        for (var i = 0; i < slots.length; i++) {
            this._animateOneCard(slots[i], stagger * i, flyDuration, scaleDuration, pokerPresenter);
        }

        // Hard fallback: never leave hands hidden if a flight callback is dropped.
        var safetyDelay = snapBuffer + stagger * Math.max(slots.length - 1, 0) + 0.05;
        this.scheduleOnce(function () {
            self._snapCardsToFinal(self._pendingCards);
            self._ensureCardsShown();
        }, safetyDelay);
    },

    _animateOneCard: function (slot, delay, flyDuration, scaleDuration, pokerPresenter) {
        var instance = slot.node;
        var target = slot.targetPos;
        var self = this;

        instance.setPosition(this._dealerLocalPosFor(instance));
        instance.setScale(0.4);
        instance.opacity = 0;
        instance.skewX = 0;
        instance.skewY = 0;

        var takeoff = cc.callFunc(function () {
            if (!cc.isValid(instance)) {
                return;
            }
            instance.opacity = 145;
            if (pokerPresenter && pokerPresenter.playAudio) {
                pokerPresenter.playAudio(K.Sounds.playerCardFlip);
            }
        });

        var flight = cc.spawn(
            cc.moveTo(flyDuration, target).easing(cc.easeCubicActionOut()),
            cc.scaleTo(scaleDuration, 1).easing(cc.easeCubicActionOut()),
            cc.fadeTo(flyDuration, 255).easing(cc.easeCubicActionOut())
        );

        var landed = cc.callFunc(function () {
            self._onCardFlightDone(slot);
        });

        instance.runAction(cc.sequence(cc.delayTime(delay), takeoff, flight, landed));
    },

    _onCardFlightDone: function (slot) {
        if (cc.isValid(slot.node)) {
            this._snapCardToFinal(slot);
        }
        this._remainingFlights--;
        if (this._remainingFlights <= 0) {
            this._ensureCardsShown();
        }
    },

    /**
     * Single exit for revealing pre-created hidden hole cards.
     * Safe to call repeatedly; only the first call reaches the presenter.
     */
    _ensureCardsShown: function () {
        if (this._forceAddCalled) {
            return;
        }
        this._forceAddCalled = true;
        this._dealInProgress = false;

        var presenter = this._pokerPresenter;
        this._pendingCards = [];
        this._remainingFlights = 0;

        if (presenter && typeof presenter.forceAddPlayerCards === "function") {
            presenter.forceAddPlayerCards();
        }
    },
});
