/**
 * @namespace Controllers.Gameplay
 */
var sliderType = require('SliderTouch');
// var pokerPresenterType = require('PokerPresenter');
// var UtilEditBoxType = require('EditBoxUtil');
// var EditBoxType = require('CustomEditBox');

/**
 * @class BetBtnUtil
 * @classdesc Manages all the button of game turn as call, raise.
 * @memberof Controllers.Gameplay
 */
cc.Class({
    extends: cc.Component,

    properties: {
        pokerPresenter: {
            default: null,
            // type: cc.Node,
        },

        betSlider: {
            default: null,
            type: sliderType,
        },

        // amount: {
        //     default: null,
        //     type: cc.Label,
        // },

        minAmount: {
            default: 0,
        },

        maxAmount: {
            default: 0,
        },

        potAmount: {
            default: 0,
        },

        // defaultRaiseEdit: {
        //     default: null,
        //     type: UtilEditBoxType,
        // },

        // editBoxCustom: {
        //     default: null,
        //     type: EditBoxType,
        // },

        // amountEditLbl: {
        //     default: null,
        //     type: cc.Label,
        // },

        allinmaxLbl: {
            default: null,
            type: cc.Label,
        },

        editBox: {
            default: null,
            type: cc.EditBox,
        },

        isWindows: false,

        minButton: {
            default: null,
            type: cc.Button,
        },
        halfPotButton: {
            default: null,
            type: cc.Button,
        },
        potButton: {
            default: null,
            type: cc.Button,
        },
        fullPotButton: {
            default: null,
            type: cc.Button,
        },
        bbButton: {
            default: null,
            type: cc.Button,
        },
        playerChips: {
            default: 0,
        },
        bb: 0,
        last: "",
        blured: false,
        _allowDecimal: false,
        roundName: "",
        raiseBtn: {
            default: null,
            type: cc.Button,
        },
        betBtn: {
            default: null,
            type: cc.Button,
        },
        raiseLbl: {
            default: null,
            type: cc.Label,
        },
        betLbl: {
            default: null,
            type: cc.Label,
        },
        mobEditBox: {
            default: null,
            type: cc.EditBox,
        },

        holdemBtns: {
            default: null,
            type: cc.Node,
        },

        omahaBtns: {
            type: cc.Node,
            default: null,
        },
        holdemPreflopBtns: {
            type: cc.Node,
            default: null,
        }
    },


    /**
     * @method onLoad
     * @description Check if the game running device is mobile or Browser and changes editBox's state(active/deactive) accordingly..
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onLoad: function() {
        this.isMobile = cc.sys.isMobile && !cc.sys.isBrowser;
        // this.isMobile = true;
        if (this.isMobile) {
            this.editBox.InputFlag = cc.EditBox.InputFlag.SENSITIVE;
            this.editBox.InputMode = cc.EditBox.InputMode.NUMERIC;
        }

        if (this.pokerPresenter.isTournament()) {
            // this.editBox.InputMode  = cc.EditBox.InputMode.NUMERIC;
            this._allowDecimal = false;
        } else {
            // this.editBox.InputMode  = cc.EditBox.InputMode.DECIMAL;
            this._allowDecimal = true;
        }

        this.betSlider.callback = this.onSliderChange.bind(this);

        GameManager.on("switchBB", this.switchBBNow.bind(this));

    },

    start() {
        setTimeout(() => {
            if (cc.isValid(this.node)) {
                // console.error(this.editBox._textLabel, this.editBox._placeholderLabel);
                if (this.editBox._textLabel) {
                    this.editBox._textLabel.overflow = cc.Label.Overflow.SHRINK;
                    this.editBox._placeholderLabel.overflow = cc.Label.Overflow.SHRINK;
                }
            }
        }, 100);
    },

    /**
     * @method updateDefaultEditMax
     * @description To check if no. not allowed at first place in editbox
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    updateDefaultEditMax: function() {
        /**
         * To not allow first character to be 0.
         */
        if (isNaN(this.editBox.string)) {
            var pat = /\d+/g;
            var x = this.editBox.string.match(pat);
            var t = "";
            if (x) {
                for (var count = 0; count < x.length; count++) {
                    t += x[count];
                }
            }
            this.editBox.string = t;
            // this.editBox.proto.value = t;
        } else {
            /**
             * to not allow spaces to be entered.
             */
            if (/\s/.test(this.editBox.string)) {
                var temp = this.editBox.string.toString().trim();
                this.editBox.string = temp;
                // this.editBox.proto.value = temp;
            }
            /**
             * isNaN accepts decimal, so to avoid it.
             */
            // var t = ".";
            // if (this.editBox.string.indexOf(t) != -1) {
            //     var x = this.editBox.string;
            //     x = x.replace('.', '');
            //     this.editBox.string = x;
            //     // this.editBox.proto.value = x;
            // }
            /**
             * to avoid character 'e' in between.
             */
            var t = "e";
            if (this.editBox.string.indexOf(t) != -1) {
                var x = this.editBox.string;
                x = x.replace('e', '');
                this.editBox.string = x;
                // this.editBox.proto.value = x;
            }
            var t = "-";
            if (this.editBox.string.indexOf(t) != -1) {
                var x = this.editBox.string;
                x = x.replace('-', '');
                this.editBox.string = x;
                // this.editBox.proto.value = x;
            }

            // var patt = (this.editBox.string.length > 1) ? (/[0-9]/) : (/[1-9]/);
            // if (patt.test(this.editBox.string)) {} else {
            //     var x = this.editBox.string;
            //     x = x.replace('0', '');
            //     this.editBox.string = x;
            //     // this.editBox.proto.value = x;
            // }
        }

        if (this.editBox.string.trim() == '') {
            this.editBox.string = this.minAmount + '';
        }

        if (Number(this.editBox.string) >= this.minAmount && Number(this.editBox.string) <= this.maxAmount) {
            this.betBtn.interactable = true;
            this.raiseBtn.interactable = true;
            this.betLbl.string = this.editBox.string;
            this.raiseLbl.string = this.editBox.string;
            // this.msgLbl.string = "";
        }
        if (Number(this.editBox.string) > this.maxAmount) {
            this.editBox.string = this.maxAmount + '';
            // this.msgLbl.string = "You cannot add more than maximum allowed chips";
            this.betBtn.interactable = false;
            this.raiseBtn.interactable = false;
            this.betLbl.string = this.maxAmount + '';
            this.raiseLbl.string = this.maxAmount + '';

        } else if (Number(this.editBox.string) < this.minAmount) {
            this.betBtn.interactable = false;
            this.raiseBtn.interactable = false;
            this.betLbl.string = this.minAmount + '';
            this.raiseLbl.string = this.minAmount + '';
            // this.msgLbl.string = "You cannot add less than minimum allowed chips";
        }
        // console.log("EDIT BOX INPUT IS ", this.editBox.string);

    },
    /**
     * @method updateDefaultEditMin
     * @description Validation for minimum amount!
     * @memberof Controllers.Gameplay.BetBtnUtil# */
    updateDefaultEditMin: function() {
        if (this.blured) {
            this.blured = false;
            return;
        }
        if (this.editBox.string < this.minAmount) {
            this.editBox.string = this.minAmount.toString();
        }
        if (this.maxAmount == this.minAmount)
            this.betSlider.setSliderValue(1);
        else
            // this.betSlider.setSliderValue(this.amount.string / (this.maxAmount + this.minAmount));
            this.betSlider.setSliderValue((this.editBox.string - this.minAmount) / (this.maxAmount - this.minAmount));
    },
    /**
     * @method updateMobEditMax
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    updateMobEditMax: function() {
        // console.log(this.editBox.node.name)
        // console.log(this.editBox.string," ",isNaN(this.editBox.string))
        if (isNaN(this.editBox.string)) {
            // this.msgLbl.string = "Please enter valid amount of chips";
            this.betBtn.interactable = false;
            this.raiseBtn.interactable = false;
            return;
        }

        if (this.editBox.string >= this.minAmount && this.editBox.string <= this.maxAmount) {
            this.betBtn.interactable = true;
            this.raiseBtn.interactable = true;
            this.betLbl.string = this.editBox.string;
            this.raiseLbl.string = this.editBox.string;
            // this.msgLbl.string = "";
        }
        if (this.editBox.string > this.maxAmount) {
            // this.msgLbl.string = "You cannot add more than maximum allowed chips";
            this.betBtn.interactable = false;
            this.raiseBtn.interactable = false;
            this.betLbl.string = this.maxAmount;
            this.raiseLbl.string = this.maxAmount;

        } else if (this.editBox.string < this.minAmount) {
            this.betBtn.interactable = false;
            this.raiseBtn.interactable = false;
            this.betLbl.string = this.minAmount;
            this.raiseLbl.string = this.minAmount;
            // this.msgLbl.string = "You cannot add less than minimum allowed chips";
        }
    },

    /**
     * @method updateMobEditMin
     * @description 
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    updateMobEditMin: function() {
        if (isNaN(this.editBox.string)) {
            this.betBtn.interactable = false;
            this.raiseBtn.interactable = false;
            return;
        } else {
            var t = "e";
            if (this.editBox.string.indexOf(t) != -1) {
                var x = this.editBox.string;
                x = x.replace('e', '');
                this.editBox.string = x;
            }
        }
        if (this.editBox.string < this.minAmount) {
            this.editBox.string = this.minAmount.toString();
        }
        if (this.maxAmount == this.minAmount)
            this.betSlider.setSliderValue(1);
        else
            // this.betSlider.setSliderValue(this.amount.string / (this.maxAmount + this.minAmount));
            this.betSlider.setSliderValue((this.editBox.string - this.minAmount) / (this.maxAmount - this.minAmount));
    },

    /**
     * @method updateData
     * @description Set all datas for the bet slider
     * @param {Object} data
     * @param {boolean} activeNLBtns
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    updateData: function(data, activateNLBtns, flagForNLPreflopOptions, moves) {

        this.step = 0;
        this.minAmount = data.minAmount;
        this.maxAmount = data.maxAmount;
        this.potAmount = data.potAmount || 0;
        this.editBox.string = this.minAmount.toString();
        this.roundName = data.roundName;
        this.bb = data.bb;
        var rName = this.roundName.toUpperCase();
        this.roundMaxBet = data.roundMaxBet;
        this.fullPotButton.node.active = activateNLBtns;
        // if (rName == ("PREFLOP")) {
        //     this.bbButton.node.active = true && activateNLBtns;
        // } else {
        // this.bbButton.node.active = false;
        // }

        this.omahaBtns.active = activateNLBtns;
        this.holdemBtns.active = !activateNLBtns;

        this.playerChips = data.playerChips;
        this.roundBet = data.roundBet;
        this.holdemPreflopBtns.active = flagForNLPreflopOptions;
        // if (this.holdemPreflopBtns.active) {
        //     this.holdemBtns.active = false;
        // } else {

        //     this.holdemBtns.active = true;
        // }

        if (moves.includes(3)) {
            // bet
        }
        if (moves.includes(4)) {
            // raise
            this.holdemPreflopBtns.active = true;
            this.omahaBtns.active = false;
            this.holdemBtns.active = false;
        }

        this.adjustBtns();
        this.betSlider.setSliderValue(0);
    },
    /**
     * @method adjustBtns
     * @description Activates or deactivates buttons, sets button labels
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    adjustBtns: function() {
        //this.minAmount.active = 
        var flag = this.minAmount < this.maxAmount;
        var selectedNode = this.omahaBtns.active ? this.omahaBtns : this.holdemBtns;

        // this.potButton.interactable = ((this.potAmount * 3) / 4) >= this.minAmount && ((this.potAmount * 3) / 4) <= this.playerChips && ((this.potAmount * 3) / 4) <= this.maxAmount && flag;
        // this.halfPotButton.interactable = (this.potAmount / 2) >= this.minAmount && (this.potAmount / 2) <= this.playerChips && (this.potAmount / 2) <= this.maxAmount && flag;
        // this.bbButton.interactable = (3 * this.bb) >= this.minAmount && (3 * this.bb) <= this.playerChips && (3 * this.bb) <= this.maxAmount && flag;
        // this.fullPotButton.interactable = (this.potAmount) >= this.minAmount && (this.potAmount) <= this.playerChips && (this.potAmount) <= this.maxAmount && flag;

        //Pot is same as max button but in case of insufficient amount, pot button is disabled.
        if (selectedNode.children[0].name == "FullButton") {
            selectedNode.children[0].getComponent(cc.Button).interactable = (this.maxAmount) >= this.minAmount && (this.maxAmount) <= this.playerChips && (this.maxAmount) <= this.maxAmount && flag;
        }
        selectedNode.children[1].getComponent(cc.Button).interactable = (this.potAmount / 2) >= this.minAmount && (this.potAmount / 2) <= this.playerChips && (this.potAmount / 2) <= this.maxAmount && flag;
        selectedNode.children[2].getComponent(cc.Button).interactable = ((this.potAmount * 3) / 4) >= this.minAmount && ((this.potAmount * 3) / 4) <= this.playerChips && ((this.potAmount * 3) / 4) <= this.maxAmount && flag;
    },

    onIncrementSlider: function() {
        if (this.holdemPreflopBtns.active || true) {
            cc.log(this.betSlider.getSliderValue());
            // this.betSlider.setSliderValue(this.betSlider.getSliderValue() + this.bb, true, true);
            var value = parseFloat(this.editBox.string) + this.bb;
            if (value > this.maxAmount) {
                value = this.maxAmount;
            }
            this.betSlider.setSliderValue(
                (value - this.minAmount) / (this.maxAmount - this.minAmount),
                true,
                true
            );
        } else {
            this.step++;
            if (this.step > 3) {
                this.step = 3;
                return;
            }
            if (this.step == 0) {
                this.onMin();
            } else if (this.step == 1) {
                this.onHalfPot();
            } else if (this.step == 2) {
                this.onPot();
            } else if (this.step == 3) {
                this.onMax();
            }
        }
    },
    onDecrementSlider: function() {
        if (this.holdemPreflopBtns.active || true) {
            // this.betSlider.setSliderValue(this.betSlider.getSliderValue() - this.bb, true, true);
            var value = parseFloat(this.editBox.string) - this.bb;
            if (value < this.minAmount) {
                value = this.minAmount;
            }
            this.betSlider.setSliderValue(
                (value - this.minAmount) / (this.maxAmount - this.minAmount),
                true,
                true
            );
        } else {
            this.step--;
            if (this.step < 0) {
                this.step = 0;
                return;
            }
            if (this.step == 0) {
                this.onMin();
            } else if (this.step == 1) {
                this.onHalfPot();
            } else if (this.step == 2) {
                this.onPot();
            } else if (this.step == 3) {
                this.onMax();
            }
        }
    },

    /**
     * @memberof Controllers.Gameplay.onMin
     * @description Min button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onMin: function() {
        // update slider & set amount
        this.betSlider.setSliderValue(0);

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },


    /**
     * @method onMax
     * @description Max button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onMax: function() {
        // update slider & set amount
        this.betSlider.setSliderValue(1);

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },

    /**
     * @method onPot
     * @description Pot button callback (3/4)
     * @memberof Controllers.Gameplay.BetBtnUtil#
     * 
     */
    onPot: function() {
        if (this.maxAmount == this.minAmount)
            this.betSlider.setSliderValue(1);
        else
            // update slider & set amount 
            this.betSlider.setSliderValue((((this.potAmount * 3) / 4) - this.minAmount) / (this.maxAmount - this.minAmount));

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },

    /**
     * @method onHalfPot
     * @description Half-Pot button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onHalfPot: function() {
        if (this.maxAmount == this.minAmount)
            this.betSlider.setSliderValue(1);
        else
            // update slider & set amount
            this.betSlider.setSliderValue(((this.potAmount / 2) - this.minAmount) / ((this.maxAmount - this.minAmount)));

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },


    /**
     * @method on3BB
     * @description 3/4 pot amount button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    on3BB: function() {
        if (this.maxAmount == this.minAmount)
            this.betSlider.setSliderValue(1);
        else
            this.betSlider.setSliderValue(((3 * this.bb) - this.minAmount) / ((this.maxAmount - this.minAmount)));

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },
    /**
     * @method onFullPot
     * @description Full amount button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onFullPot: function() {

        this.onMax();

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );

        // if (this.maxAmount == this.minAmount)
        //     this.betSlider.setSliderValue(1);
        // else
        //     this.betSlider.setSliderValue(((this.potAmount) - this.minAmount) / ((this.maxAmount - this.minAmount)));
    },

    /**
     * @method onTwiceBet
     * @description Twice amount button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onTwiceBet: function() {
        this.betSlider.setSliderValue(((this.roundMaxBet * 2) - this.minAmount) / ((this.maxAmount - this.minAmount)));

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },

    /**
     * @method onThriceBet
     * @description Thrice amount button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onThriceBet: function() {
        this.betSlider.setSliderValue(((this.roundMaxBet * 3) - this.minAmount) / ((this.maxAmount - this.minAmount)));

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },

    /**
     * @method onQuintupleBet
     * @description 5 times button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onQuintupleBet: function() {
        this.betSlider.setSliderValue(((this.roundMaxBet * 5) - this.minAmount) / ((this.maxAmount - this.minAmount)));

        // this.editBox.node.parent.stopAllActions();
        // this.editBox.node.parent.scale = 1.0;
        // this.editBox.node.parent.runAction(
        //     cc.sequence(
        //         cc.scaleTo(0.1, 0.9),
        //         cc.scaleTo(0.1, 1.1),
        //         cc.scaleTo(0.1, 1.0)
        //     )
        // );
    },

    /**
     * @method onBet
     * @description Bet button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onBet: function() {
        // console.log("onbet node...",this.node, K.PlayerMove.Bet)
        // console.log("##########",K.PlayerMove.onBet)
        // console.log("BetBtnUtil onbet presenter is...",this.pokerPresenter);
        // check amount for min bet
        // trigger PokerPresenter -> onBet(amount) 
        // handle anim - reset?
        // TODO: change bet key based on server moves
        if (this.editBox.string < this.minAmount) {
            this.editBox.string = this.minAmount;
        }
        if (this.editBox.string > this.maxAmount) {
            this.editBox.string = this.minAmount;
        }

        this.pokerPresenter.onBet(this.editBox.string, K.PlayerMove.Bet);
    },


    onTextChanged: function(text, editbox, customEventData) {
        this.filterText(text);


        this.updateDefaultEditMax();
        this.betSlider.setSliderValue((this.editBox.string - this.minAmount) / (this.maxAmount - this.minAmount));
    },

    filterText: function(text) {
        let filtered = text;

        if (this._allowDecimal) {
            // 允许整数 + 小数（最多一个小数点）
            // 先去掉非法字符
            filtered = filtered.replace(/[^\d.]/g, '');

            // 保证最多只有一个小数点
            const parts = filtered.split('.');
            if (parts.length > 2) {
                filtered = parts[0] + '.' + parts.slice(1).join('');
            }

            // 可选：限制小数位数（例如最多2位）
            // if (parts.length === 2 && parts[1].length > 2) {
            //     filtered = parts[0] + '.' + parts[1].substring(0, 2);
            // }
        } else {
            // 只允许整数
            filtered = filtered.replace(/[^\d]/g, '');
        }

        // 只有真正变化时才重新赋值，减少光标跳动
        if (this.editBox.string !== filtered) {
            this.editBox.string = filtered;
        }
    },

    onTextBegan: function(text, editbox, customEventData) {
        this.blured = false;
        this.last = this.editBox.string;
    },


    /**
     * @method onRaise 
     * @description Raise button callback
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onRaise: function() {
        if (this.editBox.string < this.minAmount) {
            this.editBox.string = this.minAmount;
        }
        if (this.editBox.string > this.maxAmount) {
            this.editBox.string = this.minAmount;
        }
        this.pokerPresenter.onBet(this.editBox.string, K.PlayerMove.Raise);
    },
    /**
     * @method onSubmitRaiseOrBet
     * @description callback for bet and raise button.
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onSubmitRaiseOrBet: function() {

        // this.updateDefaultEditMax();

        this.scheduleOnce(function() {
            if (this.betBtn.node.active) {
                // console.log("bet btn");
                this.onBet();
            } else if (this.raiseBtn.node.active) {
                // console.log("raise btn");
                this.onRaise();
            } else {
                //console.log("both btn deactive");
            }
        }, 0.1);
    },

    /**
     * @method onSliderChange
     * @description On slider value change callback
     * @param {Number} range - Range for slider
     * @memberof Controllers.Gameplay.BetBtnUtil#
     */
    onSliderChange: function(range, round) {
        range = range < 0 ? 0 : range;
        range = range > 1 ? 1 : range;
        var amount = 0;
        if (this._allowDecimal) {
            amount = (range * (this.maxAmount - this.minAmount) + this.minAmount).roundOff(2);
        } else {
            amount = Math.round((range * (this.maxAmount - this.minAmount) + this.minAmount));
        }

        // amount = parseInt(amount);
        if (amount <= this.minAmount) {
            amount = this.minAmount;
        }
        if (amount >= this.maxAmount) {
            amount = this.maxAmount;
        }
        if (this.holdemPreflopBtns.active) {
            if (amount == this.maxAmount) {
                this.editBox.string = amount.toString();
            } else {
                // this.editBox.string = Math.ceil(amount.toString());
                this.editBox.string = amount.toString();
            }
        } else {
            // this.editBox.string = amount.toString();
            // this.editBox.string = Math.ceil(amount.toString());
            if (amount == this.maxAmount) {
                this.editBox.string = amount.toString();
            } else {
                // this.editBox.string = Math.ceil(amount.toString());
                this.editBox.string = amount.toString();
            }
        }

        this.betBtn.interactable = true;
        this.raiseBtn.interactable = true;
        this.raiseLbl.string = amount.toString();
        this.betLbl.string = amount.toString();
        // this.amountEditLbl.string = amount;

        this.updateBB();

        if (amount == this.maxAmount) {
            this.editBox.node.active = false;
            this.allinmaxLbl.node.active = true;
            if (this.playerChips <= amount) {
                this.allinmaxLbl.string = "All in";
            } else {
                this.allinmaxLbl.string = "Max";
            }
        } else {
            this.allinmaxLbl.node.active = false;
            this.editBox.node.active = true;
        }
    },

    onSliderChange2: function(value, round) {
        if (this.holdemPreflopBtns.active) {
            if (round) {
                this.editBox.string = Math.ceil(value.toString());
            } else {
                this.editBox.string = value.toString();
            }
        } else {
            this.editBox.string = value.toString();
        }

        this.betBtn.interactable = true;
        this.raiseBtn.interactable = true;
        this.raiseLbl.string = value.toString();
        this.betLbl.string = value.toString();
    },

    updateBB: function() {
        if (!this.pokerPresenter) {
            return;
        }
        this.raiseLbl.node.parent.getChildByName('bb').getComponent(cc.Label).string = (Number(this.raiseLbl.string) / this.pokerPresenter.model.gameData.tableDetails.bigBlind).toFixed(1) + 'BB';
        this.betLbl.node.parent.getChildByName('bb').getComponent(cc.Label).string = (Number(this.betLbl.string) / this.pokerPresenter.model.gameData.tableDetails.bigBlind).toFixed(1) + 'BB';
        this.editBox.node.getChildByName('bb').getComponent(cc.Label).string = (Number(this.editBox.string) / this.pokerPresenter.model.gameData.tableDetails.bigBlind).toFixed(1) + 'BB';
        if (GameManager.isBB && GameManager.user.settings.stackInBB) {
            this.raiseLbl.node.scale = 0;
            this.betLbl.node.scale = 0;
            this.editBox.node.getChildByName('TEXT_LABEL').scale = 0;
            this.raiseLbl.node.parent.getChildByName('bb').scale = 0.5;
            this.betLbl.node.parent.getChildByName('bb').scale = 0.5;
            this.editBox.node.getChildByName('bb').scale = 0.5;
        } else {
            this.raiseLbl.node.scale = 0.5;
            this.betLbl.node.scale = 0.5;
            this.editBox.node.getChildByName('TEXT_LABEL').scale = 0.5;
            this.raiseLbl.node.parent.getChildByName('bb').scale = 0;
            this.betLbl.node.parent.getChildByName('bb').scale = 0;
            this.editBox.node.getChildByName('bb').scale = 0;
        }
    },

    switchBBNow() {
        this.updateBB();
    },
});