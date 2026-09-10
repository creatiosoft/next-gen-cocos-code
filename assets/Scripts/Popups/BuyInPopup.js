var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
var SliderTouchType = require('SliderTouch');
// var CheckBoxType = require('Checkbox');
var EditBoxType = require('CustomEditBox');
var UtilEditBoxType = require('EditBoxUtil');
var SetPlayerValData = require('PostTypes').SetPlayerValData;
var timeCountDown = 10;

/**
 * @classdesc Manages Buyin popup
 * @class BuyInPopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {

        timeDonw: {
            default: null,
            type: cc.Label
        },
        goldSprite: {
            default: null,
            type: cc.SpriteFrame,
        },
        diamondSprite: {
            default: null,
            type: cc.SpriteFrame,
        },
        autoBuyIn: {
            default: null,
            type: cc.Node,
        },
        disable: {
            default: null,
            type: cc.Node,
        },
        buyinContent: {
            default: null,
            type: cc.Node,
        },

        totalChipsLbl: {
            default: null,
            type: cc.Label,
        },

        buyInLbl: {
            default: null,
            type: cc.Label,
        },

        defaultBuyInLbl: {
            default: null,
            type: cc.Label,
        },
        
        sliderTouch: {
            default: null,
            type: SliderTouchType,
        },

        checkBox: {
            default: null,
            type: cc.Toggle,
        },

        editBox: {
            default: null,
            type: cc.EditBox,
        },

        defaultBuyInEdit: {
            default: null,
            type: UtilEditBoxType,
        },

        callback: {
            default: null,
            visible: false,
        },

        index: {
            default: 0,
            visible: false,
        },

        minAmount: {
            default: 0,
            visible: false,
        },

        maxAmount: {
            default: 10,
            visible: false,
        },
        onSitHere: false,
        isWindows: false,

        checkMinUpdatedInAndroid: false,
        playerStandUp: false,
        disableUI: {
            default: null,
            type: cc.Node,
        },

        msgLbl: {
            default: null,
            type: cc.Label,
        },
        confirmBtn: {
            default: null,
            type: cc.Button
        },
        buyChipsButton: {
            default: null,
            type: cc.Button
        },
        cancelCallback: null,
        // gridRefreshedRef: null,
        playerInfoRef: null,
        lbs: {
            default: [],
            type: [cc.Label],
        },
        tiledSize: 0,
        untiledSize: 0,
        isMobile: false,
        mobEditBox: {
            default: null,
            type: cc.EditBox,
        },

        dialogHeadingText: {
            default: null,
            type: cc.Label
        },
        topHeadingLbl: {
            default: null,
            type: cc.Label
        },

        // 新增：倒计时相关属性
        countdownStartTime: 0, // 开始时的真实时间戳 (ms)
        countdownDuration: 0, // 初始倒计时秒数
        isCountdownRunning: false,
    },

    /**
     * @description This is used for resizing of node (Grid)
     * @method gridRefreshed
     * @memberof Popups.BuyInPopup#
     */
    gridRefreshed: function() {
        // var flag = (GameManager.activeTableCount == 1 || GameScreen.viewType == 2);
        // this.lbs.forEach(function (element) {
        //     if (flag) {
        //         element.node.scale = 0.8;
        //     } else {
        //         element.node.scale = 1;
        //     }
        // }, this);
    },

    /**
     * @description Destroy Callback method
     * @method onDestroy
     * @memberof Popups.BuyInPopup#
     */
    onDestroy: function() {
        // GameScreen.node.off("grid-refreshed", this.gridRefreshedRef);
        GameManager.off("playerInfo", this.playerInfoRef);

        // 新增：清理事件监听和倒计时
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        this.stopCountdown();
    },

    /**
     * @description Calls gridRefreshed method
     * @method onEnable
     * @memberof Popups.BuyInPopup#
     */
    onEnable: function() {
        // this.gridRefreshed();
    },

    /** 
     * @method onPlayerInfo
     * @param {Object} response
     * @memberof Popups.BuyInPopup#
     */
    onPlayerInfo: function(response = null) {

        if (!!response.channelId && !!GameScreen && ScreenManager.currentScreen == K.ScreenEnum.GamePlayScreen) {
            for (var index = 0; index < GameScreen.gameModel.activePokerModels.length; index++) {
                // console.log("ACTIVE CHANNELS : -  ", GameScreen.gameModel.activePokerModels[index].gameData.channelId);
                if (response.channelId === GameScreen.gameModel.activePokerModels[index].gameData.channelId) {
                    //In channels popupmanager, at 2nd index PlayerInfoPopup is stored.
                    // GameScreen.gameModel.activePokerModels[index].popUpManager.hide(PopUpType.BuyInPopup, function () { });
                    return;
                }
            }
        } else {
            // GameManager.popUpManager.remove(PopUpType.BuyInPopup, function () { });
        }

    },

    /**
     * @description Calls onConfirm method when enter button is clicked
     * @method onClickEnter
     * @memberof Popups.BuyInPopup#
     */
    onClickEnter: function() {
        this.onConfirm();
    },

    /**
     * @description This is used for Initialisation
     * @method onLoad
     * @memberof Popups.BuyInPopup#
     */
    onLoad: function() {
        this.isMobile = cc.sys.isMobile && !cc.sys.isBrowser;
        if (this.isMobile) {
            this.editBox.InputFlag = cc.EditBox.InputFlag.SENSITIVE;
            this.editBox.InputMode = cc.EditBox.InputMode.NUMERIC;
        }
        // this.gridRefreshedRef = this.gridRefreshed.bind(this);
        this.playerInfoRef = this.onPlayerInfo.bind(this);
        // GameScreen.node.on("grid-refreshed", this.gridRefreshedRef);
        GameManager.on("playerInfo", this.playerInfoRef);
        this.sliderTouch.registerCallback(this.onSliderValueChange.bind(this));

        // 新增：监听前后台切换事件
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
    },

    // 前后台切换回调
    onGameShow: function() {
        if (this.isCountdownRunning) {
            this.updateCountdownDisplay();
        }
    },

    onGameHide: function() {
        // 进入后台无需特别处理，时间戳会继续前进
    },

    // 倒计时相关方法
    startCountdown: function(duration) {
        if (this.isCountdownRunning) return;

        this.countdownDuration = duration;
        this.countdownStartTime = Date.now();
        this.isCountdownRunning = true;

        // 立即更新一次显示
        this.updateCountdownDisplay();

        // 每0.3秒刷新一次 UI（平滑且性能友好）
        this.schedule(this.updateCountdownDisplay, 0.3);
    },

    updateCountdownDisplay: function() {
        if (!this.isCountdownRunning || !this.timeDonw) return;

        let elapsedMs = Date.now() - this.countdownStartTime;
        let elapsedSec = Math.floor(elapsedMs / 1000);
        let remainSec = Math.max(0, this.countdownDuration - elapsedSec);

        this.timeDonw.string = remainSec + "s";

        if (remainSec <= 0) {
            this.stopCountdown();
            this.onCancel();
        }
    },

    stopCountdown: function() {
        if (!this.isCountdownRunning) return;

        this.isCountdownRunning = false;
        this.unschedule(this.updateCountdownDisplay);
    },

    onShow: function(data) {
        this.data = data;
        GameManager.emit("disablePageView");
        this.stopCountdown();
        if (data.secondsRemaining) {
            timeCountDown = data.secondsRemaining;
        } else {
            timeCountDown = 10;
        }

        // if (GameManager.user.category == "GOLD") {
        //     cc.find('Container/header/r2/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.goldSprite;
        //     cc.find('Container/Cashier/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.goldSprite;
        //     cc.find('Container/Center/InputBox/editbox/chips', this.node).getComponent(cc.Sprite).spriteFrame = this.goldSprite;
        //     cc.find('Container/min/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.goldSprite;
        //     cc.find('Container/max/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.goldSprite;
        // }
        // else {
        //     cc.find('Container/header/r2/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.diamondSprite;
        //     cc.find('Container/Cashier/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.diamondSprite;
        //     cc.find('Container/Center/InputBox/editbox/chips', this.node).getComponent(cc.Sprite).spriteFrame = this.diamondSprite;
        //     cc.find('Container/min/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.diamondSprite;
        //     cc.find('Container/max/icon', this.node).getComponent(cc.Sprite).spriteFrame = this.diamondSprite;
        // }

        this.buyinContent.active = true;

        cc.find('Container/header/r1/vari', this.node).getComponent(cc.Label).string = data.config.channelName;
        cc.find('Container/header/r2/blind', this.node).getComponent(cc.Label).string = "$" + GameManager.convertChips(data.config.smallBlind) + "/" + "$" + GameManager.convertChips(data.config.bigBlind);

        cc.find('Container/min/realMoney', this.node).getComponent(cc.Label).string = GameManager.convertChips(data.minValue);
        cc.find('Container/max/realMoney', this.node).getComponent(cc.Label).string = GameManager.convertChips(data.maxValue);

        this.sound = data.playSound;

        if (data.minValue <= 0) {
            data.minValue = 1;
        }
        if (data.maxValue > 0) {
            data.maxValue = data.maxValue < data.totalChips ? data.maxValue : data.totalChips;
        }

        var info;
        if (data.maxValue <= 0) {
            info = "";
        } else if (data.maxValue < data.minValue) {
            // maxValue > 0 but less than minimum (1) — player is near max chips, not an insufficient balance issue
            info = "Minimum top-up amount is " + data.minValue;
        } else {
            info = "You don’t have enough chips";
        }

        this.disableView((data.maxValue < data.minValue), info, data.maxValue <= 0 && !data.quickSeat);
        if (data.maxValue < data.minValue) {
            data.minValue = 0;
            data.maxValue = 0;
        }

        data.minValue = Math.floor(data.minValue);
        data.maxValue = Math.floor(data.maxValue);

        this.editBox.string = data.minValue.toString();
        this.minAmount = data.minValue;
        this.maxAmount = data.maxValue;
        var midVal = (this.minAmount + this.maxAmount) / 2;
        if (data.isAllInAndFold) {
            midVal = this.minAmount
        }
        if (midVal > 0) {
            if (data.isAllInAndFold) {
                this.sliderTouch.setSliderValue(0);
            } else {
                this.sliderTouch.setSliderValue(midVal / (this.maxAmount + this.minAmount));
            }
        }

        if (this.editBox.string == "0") {
            this.editBox.node.getChildByName("TEXT_LABEL").color = new cc.Color().fromHEX("#FE3333");
        } else {
            this.editBox.node.getChildByName("TEXT_LABEL").color = new cc.Color().fromHEX("#FFB600");
        }

        this.totalChipsLbl.string = data.totalChips.toFixed(2);
        this.callback = data.confirm;
        this.index = data.index;
        this.onSitHere = data.onSitHere;
        this.cancelCallback = data.cancelCallback;
        this.channelId = data.channelId;
        this.playerStandUp = data.playerStandUp;

        this.disableUI.active = (data.maxValue == data.minValue);
        this.checkBox.node.parent.active = !this.disableUI.active && !data.isAddChips;
        this.checkBox.isChecked = !!data.autoBuyIn;

        if (data.isAllInAndFold) {
            this.disable.active = true;
            this.msgLbl.string = "You can not change buyin amount in this room";
            this.checkBox.node.parent.active = false;
        } else {
            this.disable.active = false;
        }

        this.startCountdown(timeCountDown);
    },

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
        } else {
            /**
             * to not allow spaces to be entered.
             */
            if (/\s/.test(this.editBox.string)) {
                var temp = this.editBox.string.toString().trim();
                this.editBox.string = temp;
            }
            /**
             * isNaN accepts decimal, so to avoid it.
             */
            var t = ".";
            if (this.editBox.string.indexOf(t) != -1) {
                var x = this.editBox.string;
                x = x.replace('.', '');
                this.editBox.string = x;
            }
            /**
             * to avoid character 'e' in between.
             */
            var t = "e";
            if (this.editBox.string.indexOf(t) != -1) {
                var x = this.editBox.string;
                x = x.replace('e', '');
                this.editBox.string = x;
            }
            var t = "-";
            if (this.editBox.string.indexOf(t) != -1) {
                var x = this.editBox.string;
                x = x.replace('-', '');
                this.editBox.string = x;
            }
            var patt = (this.editBox.string.length > 1) ? (/[0-9]/) : (/[1-9]/);
            if (patt.test(this.editBox.string)) {} else {
                var x = this.editBox.string;
                x = x.replace('0', '');
                this.editBox.string = x;
            }
        }

        if (this.editBox.string >= this.minAmount && this.editBox.string <= this.maxAmount) {
            this.confirmBtn.interactable = true;
            this.msgLbl.string = "";
        }
        if (this.editBox.string > this.maxAmount) {
            this.msgLbl.string = "You cannot add more than maximum allowed chips";
        } else if (this.editBox.string < this.minAmount) {
            this.confirmBtn.interactable = false;
            this.msgLbl.string = "You cannot add less than minimum allowed chips";
        }
    },

    updateDefaultEditMin: function() {
        if (this.editBox.string < this.minAmount) {
            this.msgLbl.string = "You cannot add less than minimum allowed chips";
            this.confirmBtn.interactable = false;
        } else if (this.editBox.string > this.maxAmount) {
            this.msgLbl.string = "You cannot add more than maximum allowed chips";
            this.confirmBtn.interactable = false;
        } else {
            this.msgLbl.string = "";
        }
        this.sliderTouch.setSliderValue((this.editBox.string - this.minAmount) / (this.maxAmount - this.minAmount));
    },

    updateMobEditMax: function() {
        if (isNaN(this.editBox.string)) {
            this.msgLbl.string = "Please enter valid amount of chips";
            this.confirmBtn.interactable = false;
            return;
        }

        if (this.editBox.string >= this.minAmount && this.editBox.string <= this.maxAmount) {
            this.confirmBtn.interactable = true;
            this.msgLbl.string = "";
        }
        if (this.editBox.string > this.maxAmount) {
            this.msgLbl.string = "You cannot add more than maximum allowed chips";
            this.confirmBtn.interactable = false;
        } else if (this.editBox.string < this.minAmount) {
            this.confirmBtn.interactable = false;
            this.msgLbl.string = "You cannot add less than minimum allowed chips";
        }
    },

    updateMobEditMin: function() {
        if (isNaN(this.editBox.string)) {
            this.msgLbl.string = "Please enter valid amount of chips";
            this.confirmBtn.interactable = false;
            return;
        }
        if (this.editBox.string < this.minAmount) {
            this.msgLbl.string = "You cannot add less than minimum allowed chips";
            this.confirmBtn.interactable = false;
        } else if (this.editBox.string > this.maxAmount) {
            this.msgLbl.string = "You cannot add more than maximum allowed chips";
            this.confirmBtn.interactable = false;
        } else {
            this.msgLbl.string = "";
        }
        this.sliderTouch.setSliderValue((this.editBox.string - this.minAmount) / (this.maxAmount - this.minAmount + 1));
    },

    onSliderValueChange: function(value) {
        value = value < 0 ? 0 : value;
        value = value > 1 ? 1 : value;
        var amount = Math.floor(value * (this.maxAmount - this.minAmount + 1) + this.minAmount);
        amount = amount > this.maxAmount ? this.maxAmount : amount;
        this.editBox.string = isNaN(amount.toString()) ? "0" : amount.toString();
        this.confirmBtn.interactable = true;
    },

    onAutoBuySelected: function() {
        GameManager.user.autoBuyIn = this.checkBox.isChecked;
        if (!this.playerStandUp) {
            var data = new SetPlayerValData(this.channelId, GameManager.user.playerId, "isAutoReBuy", GameManager.user.autoBuyIn);
            ServerCom.pomeloRequest(K.PomeloAPI.setPlayerValOnTable, data, function(response) {
                if (response.success) {} else {}
            }, null, 5000, false, false);
        }

        if (this.sound) {
            this.sound(K.Sounds.click);
        }
    },

    onMin: function() {
        this.sliderTouch.setSliderValue(0);
        this.editBox.string = this.minAmount.toString();
    },

    onMax: function() {
        this.sliderTouch.setSliderValue(1);
        this.editBox.string = this.maxAmount.toString();
    },

    onIncrementSlider: function() {
        this.sliderTouch.setSliderValue(this.sliderTouch.getSliderValue() + 0.1);
        if (this.sound) {
            this.sound(K.Sounds.click);
        }
    },

    onDecrementSlider: function() {
        this.sliderTouch.setSliderValue(this.sliderTouch.getSliderValue() - 0.1);
        if (this.sound) {
            this.sound(K.Sounds.click);
        }
    },

    onConfirm: function() {
        if (this.checkVal()) {
            this.callback(this.index, this.editBox.string);
            GameManager.emit("enablePageView");
            this.stopCountdown();
            this.closeSelf(function() {});
            if (this.sound) {
                this.sound(K.Sounds.click);
            }
        }
    },

    onCancel: function() {
        if (this.cancelCallback != null) {
            this.cancelCallback();
        }
        GameManager.emit("enablePageView");
        this.stopCountdown();
        this.closeSelf(function() {});
        if (this.sound) {
            this.sound(K.Sounds.click);
        }
        // 
        ServerCom.pomeloRequest('room.channelHandler.cancelReserveSeat', {
            "channelId": this.channelId,
            "playerId": GameManager.user.playerId,
            "isRequested": true
        }, function(response) {
            console.log("room.channelHandler.cancelReserveSeat", response);
            if (response.success) {
                GameManager.emit("cancelReserveSeat");
            }
        }.bind(this), null, 5000, false);
    },

    checkVal: function() {
        var value = this.editBox.string;

        this.disableView(false);

        if (isNaN(value)) {
            this.msgLbl.string = "Please enter valid amount of chips";
            return false;
        }

        if (value >= this.minAmount) {
            if (value <= this.maxAmount) {
                return true;
            } else {
                this.msgLbl.string = "You cannot add more than maximum allowed chips";
                return false;
            }
        } else {
            this.msgLbl.string = "You cannot add less than minimum allowed chips";
            return false;
        }
    },

    disableView: function(val, msg = "", promptBuy = false) {
        this.disableUI.active = val;
        this.checkBox.node.parent.active = !val;
        if (promptBuy) {
            this.confirmBtn.interactable = false;
        } else {
            this.confirmBtn.interactable = true;
        }
        msg = !!msg ? msg : "You already have the maximum allowed chips";

        this.msgLbl.string = val ? msg : "";
        this.confirmBtn.interactable = !val;
        if (this.confirmBtn.interactable) {
            this.confirmBtn.node.color = cc.Color.WHITE;
        } else {
            var color2 = new cc.Color(27, 53, 15);
            this.confirmBtn.node.color = color2;
        }
    },

    onBuyMoreChips: function() {
        this.closeSelf(function() {});
    }
});