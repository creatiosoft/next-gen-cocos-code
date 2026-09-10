var A2_10JQK = 'NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');

/**
 * @class CardTypes
 * @memberof Utilities.Cards
 */

/**
 * @constructor Card
 * @param {Number} point Possible values 1-13
 * @param {Suit} suit Possible suit
 * @memberof Utilities.Cards.CardTypes
 */
function Card (point, suit) {
    Object.defineProperties(this, {
        point: {
            value: point,
            writable: false
        },
        suit: {
            value: suit,
            writable: false
        },
        /**
         * @property {Number} id 
         * @memberof Utilities.Cards.CardTypes
         */
        id: {
            value: (suit - 1) * 13 + (point - 1),
            writable: false
        },
        //
        pointName: {
            get: function () {
                return A2_10JQK[this.point];
            }
        },
        suitName: {
            get: function () {
                return K.Suit[this.suit];
            }
        },
        isBlackSuit: {
            get: function () {
                return this.suit === K.Suit.Spade || this.suit === K.Suit.Club;
            }
        },
        isRedSuit: {
            get: function () {
                return this.suit === K.Suit.Heart || this.suit === K.Suit.Diamond;
            }
        },
    });
}

Card.prototype.toString = function () {
    return this.suitName + ' ' + this.pointName;
};

module.exports = {
    Card: Card,
};
