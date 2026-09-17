/**
 * @namespace Screens.Gameplay.Player
 */

var card = require('CardTypes').Card;
var suit = require('CardTypes').Suit;
var SliderTouchType = require('SliderTouch');
var LongPressDetection = require('LongPressDetection');
var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var changeAvatar = require('ResponseTypes').changeAvatar;

var HAND_STRENGTH_RANK = {
    "High Card": 0,
    "One Pair": 1,
    "Two Pair": 2,
    "Three Of A Kind": 3,
    "Straight": 4,
    "Flush": 5,
    "Full House": 6,
    "Four Of A Kind": 7,
    "Straight Flush": 8,
    "Royal Flush": 9,
};

/**
 * @classdesc Handles player View
 * @class PlayerPresenter
 * @memberof Screens.Gameplay.Player
 */
var PlayerPresenter = cc.Class({
    extends: cc.Component,

    properties: {
        pokerPresenter: {
            default: null,
        },
        addChipsNode: {
            default: null,
            type: cc.Node,
        },
        longPressDetection: {
            default: null,
            type: LongPressDetection,
        },
        agoraVideoRender: {
            default: null,
            type: cc.Node,
        },
        winningChips: {
            default: null,
            type: cc.Label,
        },
        bestHandNode: {
            default: null,
            type: cc.Node,
        },
        seatIndex: {
            default: -1,
        },
        cardHolder: {
            default: null,
            type: cc.Node,
        },
        cardHolderShow: {
            default: null,
            type: cc.Node,
        },
        cardHolderMyShow: {
            default: null,
            type: cc.Node,
        },
        cardHolderMy: {
            default: null,
            type: cc.Node,
        },
        cardHolder2: {
            default: null,
            type: cc.Node,
        },
        cardHolder3: {
            default: null,
            type: cc.Node,
        },
        cardHolder4: {
            default: null,
            type: cc.Node,
        },
        cardHolder5: {
            default: null,
            type: cc.Node,
        },
        cardHolder6: {
            default: null,
            type: cc.Node,
        },
        cardHolder2R: {
            default: null,
            type: cc.Node,
        },
        cardHolder3R: {
            default: null,
            type: cc.Node,
        },
        cardHolder4R: {
            default: null,
            type: cc.Node,
        },
        cardHolder5R: {
            default: null,
            type: cc.Node,
        },
        cardHolder6R: {
            default: null,
            type: cc.Node,
        },
        cardHolder2My: {
            default: null,
            type: cc.Node,
        },
        cardHolder3My: {
            default: null,
            type: cc.Node,
        },
        cardHolder4My: {
            default: null,
            type: cc.Node,
        },
        cardHolder5My: {
            default: null,
            type: cc.Node,
        },
        cardHolder6My: {
            default: null,
            type: cc.Node,
        },
        seatState: {
            default: "Free",
            visible: false,
        },

        sitHerePanel: {
            default: null,
            type: cc.Node,
        },
        occupiedPanel: {
            default: null,
            type: cc.Node,
        },
        avatarBtn: {
            default: null,
            type: cc.Button,
        },
        timerSprite: {
            default: null,
            type: cc.Sprite,
        },
        timerPSprite: {
            default: null,
            type: cc.Sprite,
        },
        turnTimerLabel: {
            default: null,
            type: cc.Label,
        },
        turnTimerStar: {
            default: null,
            type: cc.Node,
        },
        turmTimerGray: {
            default: null,
            type: cc.Node,
        },

        baseSprite: {
            default: null,
            type: cc.Sprite,
        },
        amountLabel: {
            default: null,
            type: cc.Label,
        },
        nameLabel: {
            default: null,
            type: cc.Label,
        },
        image: {
            default: null,
            type: cc.Sprite,
        },
        dealerSprite: {
            default: null,
            type: cc.Node,
        },
        dealerSprite2: {
            default: null,
            type: cc.Node,
        },
        dealerSprite3: {
            default: null,
            type: cc.Node,
        },
        playerBetLabel: {
            default: null,
            type: cc.Node,
        },
        playerBetLabelForAnte: {
            default: null,
            type: cc.Node,
        },

        moveDisplayTime: {
            default: -1,
            visible: false,
        },
        currentTurnDisplayTime: {
            default: -1,
            visible: false,
        },
        turnDisplayTime: {
            default: 0.5,
            visible: false,
        },
        playerData: {
            default: null,
            visible: false,
        },
        timer: {
            default: null,
            visible: false,
        },
        foldView: {
            default: null,
            type: cc.Node,
        },

        reservedPanel: {
            default: null,
            type: cc.Node,
        },

        chatHead: {
            default: null,
            type: cc.Node,
        },
        chatLbl: {
            default: null,
            type: cc.RichText,
        },
        emptyPanel: {
            default: null,
            type: cc.Node
        },
        imageLoadedRef: null,
        extra: {
            type: cc.Node,
            default: null,
        },
        timeBank: {
            type: cc.Node,
            default: null,
        },
        timeBankV: {
            default: null,
            type: SliderTouchType,
        },

        winnerBanner: {
            default: null,
            type: cc.Node,
        },
        imgHider: {
            default: null,
            type: cc.Node
        },
        winningNode: {
            default: null,
            type: cc.Node
        },
        moveShower: {
            default: null,
            type: cc.Node
        },
        grayer: {
            default: null,
            type: cc.Node
        },
        grayer2: {
            default: null,
            type: cc.Node
        },
        reconnectionTimer: {
            default: null,
            type: cc.Label
        },
        rebuyIndicatorNode: {
            default: null,
            type: cc.Node,
        },
        timersToKill: []
    },

    onLoad: function () {

        this.longPressDetection.normalCallback = this.normalCallback.bind(this);

        this.imageLoadedRef = this.imageLoaded.bind(this);
        GameManager.on("image-loaded", this.imageLoadedRef);
        GameManager.on("updatePlayerImageInTable", this.updatePlayerImageInTable.bind(this));
        GameManager.on("switchBB", this.switchBBNow.bind(this));
        GameManager.on("backToLobby", this.backToLobby.bind(this));
        GameManager.on("backFromLobby", this.backFromLobby.bind(this));
        this.clearPlayerCards();
        this.isPlaying = false;
        this.displayDefaultTimer = this.resetBetTimer = 0;
        if (cc.isValid(this.winningNode)) {
            this.winningNode.children[1].active = false;
        }
        if (cc.isValid(this.winningNode)) {
            this.winningNode.children[2].active = this.winningNode.children[4].active = true;
        }
    },

    /**
     * @description Loads the image choosen by user
     * @method imageLoaded
     * @param {user} user
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    imageLoaded: function (user) {
        if (this.playerData != null && this.playerData.playerId == user.playerId) {
            this.image.spriteFrame = GameManager.avatarImages[this.playerData.imageAvtar];
        }
    },

    resetSeat: function () {
        if (!!this.chatHead.active) {
            this.chatHead.active = false;
        }
        this.resetTimer();
        this.activatePlayerBet(false);

        if (this.playerData && this.playerData.state == K.PlayerState.OutOfMoney) {
        }
        else {
            this._isRebuying = false;
            if (this.rebuyIndicatorNode) this.rebuyIndicatorNode.active = false;
        }
        this.seatState = K.SeatState.Free;
        this.dealerSprite.active = false;
        this.dealerSprite2.active = false;
        this.dealerSprite3.active = false;
        this.moveShower.scale = 0;

        this.winningChips.node.stopAllActions();
        this.winningChips.node.opacity = 0;
        this.bestHandNode.active = false;

        this.timeBank.active = false;
        this.extra.active = false;
        if (this.isSelf() && this.playerData.state != K.PlayerState.Waiting) {
            this.timeBank.active = true;
        }
        this.timeBank.children[1].getComponent(cc.Label).string = "";
        this.image.node.active = true;
        this.timerSprite.node.active = true;
        this.timerPSprite.node.active = true;
        this.clearPlayerCards();
        this.setSelfPlayerView(false);
        this.unscheduleAllCallbacks();

        if (!this.isSelf()) {
            this.addChipsNode.active = false;
        }


        this.image.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.amountLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.amountLabel.node.parent.getChildByName("bb").getComponent(cc.Label).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.nameLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));

    },

    /**
     * @description  Sets all data and activates seat UI
     * @method enablePlayerView
     * @param {String} selfPlayerId
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enablePlayerView: function (selfPlayerId, revealForSelfAtStartGame = true) {
        this.resetSeat();

        this.addChipsNode.scale = 0.8;

        if ((this.node.parent.x < 0 && GameManager.isMobile) || this.isSelf()) {
            if (GameManager.isMobile) {
                //this.amountLabel.node.x = -195;
                //   this.nameLabel.node.x = -195;
                // this.amountLabel.node.parent.getChildByName("bb").x = -195;
                // this.node.getChildByName("BB").x = 94 - 10;
                // this.node.getChildByName("SB").x = 94 - 10;
                //this.moveShower.x = -44;
            }
        } else {
            if (GameManager.isMobile) {
                // this.amountLabel.node.x = -135;
                // this.nameLabel.node.x = -135;
                // this.amountLabel.node.parent.getChildByName("bb").x = -135;

                this.node.getChildByName("BB").x = -55;
                this.node.getChildByName("SB").x = -55;

                //  this.moveShower.x = 44;
            }
        }

        this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
        this.updateBB();
        this.nameLabel.string = (this.playerData.playerName.length > 8) ? this.playerData.playerName.substring(0, 8) + ".." : this.playerData.playerName;
        this.sitHerePanel.active = false;
        this.emptyPanel.active = false;
        this.occupiedPanel.active = true;
        this.onStateChange();
        this.seatState = K.SeatState.Occupied;
        if (this.playerData.totalRoundBet !== 0) {
            this.displayBet(this.playerData.totalRoundBet.roundOff(2));
        }
        var self = (selfPlayerId === this.playerData.playerId);

        if (self) {
            this.avatarBtn.interactable = false;
            this.updateTimeBank2(this.playerData.timeBankSec);

            this.cardHolderMyShow.active = true;
        } else {
            this.cardHolderMyShow.active = false;
            this.avatarBtn.interactable = true;
        }
        this.setSelfPlayerView(self, revealForSelfAtStartGame);

        if (this.playerData.state == K.PlayerState.Playing && this.playerData.roundMove != "" && this.playerData.roundMove != undefined) {
            this.disPlayMoveUtil(this.playerData.playerName, this.playerData.roundMove);
        }
        if (this.playerData.state == K.PlayerState.Playing && this.playerData.lastMove == "FOLD") {
            this.disPlayMoveUtil(this.playerData.playerName, this.playerData.lastMove);
        }

        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        var isJoined = window.MGR_AGORA.isJoinedChannel(this.pokerPresenter.model.gameData.agoraChannelName);

        if (self) {
            let agoraVideoRender = this.agoraVideoRender.getComponent("AgoraVideoRender");
            let uid = Number(this.playerData.playerId.substr(0, 5));

            if (uid != agoraVideoRender.uid) {
                agoraVideoRender.clear();
                agoraVideoRender.setup(uid, this.pokerPresenter.model.gameData.agoraChannelName);
            }
        } else {
            let agoraVideoRender = this.agoraVideoRender.getComponent("AgoraVideoRender");
            let uid = Number(this.playerData.playerId.substr(0, 5));
            window.MGR_AGORA.testRender = agoraVideoRender;
            agoraVideoRender.clear();
            agoraVideoRender.setup(uid, this.pokerPresenter.model.gameData.agoraChannelName);
            if (!isJoined) {
                cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            } else {
                let isRemoteVideoMuted = window.MGR_AGORA.isRemoteVideoMuted(uid);
                let isRemoteSelfAudioMuted = window.MGR_AGORA.isRemoteSelfVideoMuted(uid);
                // console.log("isRemoteVideoMuted", isRemoteVideoMuted);
                // console.log("isRemoteSelfAudioMuted", isRemoteSelfAudioMuted);
                if (isRemoteVideoMuted || isRemoteSelfAudioMuted) {
                    cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                } else {
                    cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                }
            }
        }
    },

    /**
     * @description Displays self or other players view on table
     * @method setSelfPlayerView
     * @param {bool} state if true sets my player's view otherwise sets other player's view
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    setSelfPlayerView: function (state, revealForSelfAtStartGame) {
        if (state) {
            this.image.spriteFrame = GameManager.user.urlImg;
            if (this.playerData.state === K.PlayerState.Playing ||
                this.playerData.state === K.PlayerState.OnBreak ||
                this.playerData.state === K.PlayerState.Disconnected) {
                if (revealForSelfAtStartGame) {
                    this.revealCards(revealForSelfAtStartGame);
                }
            }

        } else {
            if (this.playerData != null) {
                this.image.spriteFrame = GameManager.avatarImages[this.playerData.imageAvtar];
            }
        }
    },

    /**
     * @description Displays player bet
     * @method displayBet
     * @param {number} bet
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    displayBet: function (bet) {
        if (bet < 0) {
            console.warn("bet", bet);
        }

        if (isNaN(bet)) {
            return;
        }

        this.playerBetLabel.getComponent(cc.Label).string = GameManager.convertChips(bet);
        this.playerBetLabel.getComponent(cc.Label).__string = bet;
        this.updateBB();
        this.activatePlayerBet(true);
    },

    /**
     * @description Sets player's bet amount label
     * @method setBetPosition
     * @param {Vec2} position 2D Vector
     * @memberof creens.Gameplay.Player.PlayerPresenter#
     */
    setBetPosition: function (position) {
        this.playerBetLabel.parent.setPosition(position);
        this.playerBetLabelForAnte.parent.setPosition(position);
    },

    /**
     * @description Sets dealer button on table
     * @method setDealerPosition
     * @param {Vec2} position 2D Vector
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    setDealerPosition: function (position) {
        this.dealerSprite.setPosition(position);
    },

    /**
     * @description Reset player turn timer
     * @method resetTimer
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    resetTimer: function () {
        this.timerSprite.fillRange = 0;
        this.timerPSprite.fillRange = 0;
        this.timerPSprite.node.children[0].active = false;
        if (this.turnTimerLabel) {
            this.turnTimerLabel.string = "";
        }
        if (this.turnTimerStar) {
            this.turnTimerStar.active = false;
        }
        if (this.turmTimerGray) {
            this.turmTimerGray.active = false;
        }
        this.timeBank.active = false;
        this.extra.active = false;
        if (this.isSelf() && this.playerData.state != K.PlayerState.Waiting) {
            this.timeBank.active = true;
        }
        this.image.node.active = true;
        this.timerSprite.node.active = true;
        this.timerPSprite.node.active = true;
        this.imgHider.active = false;
    },

    /**
     * @description Resets timer on when round completes
     * @method activatePlayerBet
     * @param {bool} flag -active/deactive playerBetLabel
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    activatePlayerBet: function (flag, animateToCenter) {
        if (animateToCenter) {
            let initPos = this.playerBetLabel.parent.getPosition();
            let worldPos = this.pokerPresenter.potAmount[0].parent.parent.convertToWorldSpaceAR(this.pokerPresenter.potAmount[0].parent.getPosition());
            let finalPos = this.playerBetLabel.parent.parent.convertToNodeSpaceAR(worldPos);

            let func = cc.callFunc(() => {
                this.playerBetLabel.parent.active = flag;
                this.playerBetLabel.parent.setPosition(initPos);
            });

            if (this.playerBetLabel.parent.anchorX == 0.5) {

            }
            else if (this.playerBetLabel.parent.anchorX == 0) {
                finalPos.x = finalPos.x - this.playerBetLabel.parent.width / 2;
            }
            else if (this.playerBetLabel.parent.anchorX == 1) {
                finalPos.x = finalPos.x + this.playerBetLabel.parent.width / 2;
            }

            let moveToCenter = cc.moveTo(1, finalPos).easing(cc.easeCircleActionInOut());

            this.playerBetLabel.parent.runAction(cc.sequence(moveToCenter, func));


            this.resetBetTimer = setTimeout(function () {
                if (cc.isValid(this.node)) {
                    this.playerBetLabel.parent.active = flag;
                    this.playerBetLabel.parent.stopAllActions();
                    this.playerBetLabel.parent.setPosition(initPos);
                }
            }.bind(this), 1000);
        } else {
            this.playerBetLabel.parent.active = flag;
        }

    },

    /**
     * @description View handling after game is over
     * @method gameOver
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    gameOver: function () {
        this.amountLabel.node.stopAllActions();
        this.resetTimer();
        this.timersToKill.push(setTimeout(function () {
            if (cc.isValid(this.node)) {
                if (!!this.playerData && this.amountLabel !== null && this.amountLabel !== undefined) {
                    this.activatePlayerBet(false);
                }
            }
        }.bind(this), 550));
        this.node.getChildByName("BB").active = false;
        this.node.getChildByName("SB").active = false;
    },

    /**
     * @description Displays player blind
     * @method displayBlind
     * @param {Number} amount
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    displayBlind: function (amount) {
        this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
        this.updateBB();
        this.displayBet(amount.roundOff(2));
    },

    activatePlayerBetForAnte: function (flag, animateToCenter) {
        if (animateToCenter) {
            let initPos = this.playerBetLabelForAnte.parent.getPosition();
            let worldPos = this.pokerPresenter.totalPotLbl.node.parent.parent.convertToWorldSpaceAR(this.pokerPresenter.totalPotLbl.node.parent.getPosition());
            let finalPos = this.playerBetLabelForAnte.parent.parent.convertToNodeSpaceAR(worldPos);
            if (this.playerBetLabelForAnte.parent.anchorX == 0.5) {

            }
            else if (this.playerBetLabelForAnte.parent.anchorX == 0) {
                finalPos.x = finalPos.x - this.playerBetLabelForAnte.parent.width / 2;
            }
            else if (this.playerBetLabelForAnte.parent.anchorX == 1) {
                finalPos.x = finalPos.x + this.playerBetLabelForAnte.parent.width / 2;
            }

            this.playerBetLabelForAnte.parent.active = true;
            let func = cc.callFunc(() => {
                this.playerBetLabelForAnte.parent.active = flag;
                this.playerBetLabelForAnte.parent.setPosition(initPos);
            });
            let moveToCenter = cc.moveTo(0.7, finalPos).easing(cc.easeCircleActionInOut());
            this.playerBetLabelForAnte.parent.runAction(cc.sequence(moveToCenter, func));
            this.resetBetTimer = setTimeout(function () {
                if (cc.isValid(this.node)) {
                    this.playerBetLabelForAnte.parent.active = flag;
                    this.playerBetLabelForAnte.parent.stopAllActions();
                }
            }.bind(this), 800);
        } else {
            this.playerBetLabelForAnte.parent.active = flag;
        }
    },

    displayAnte: function (amount) {
        this.displayBetForAnte(amount.roundOff(2));
    },

    displayBetForAnte: function (bet) {
        if (isNaN(bet)) {
            return;
        }
        this.playerBetLabelForAnte.getComponent(cc.Label).string = bet;
    },

    /**
     * @description Sets dealer sprite
     * @method setDealer
     * @param {bool} state
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    setDealer: function (state) {
        this.dealerSprite.active = state;
        this.dealerSprite2.active = false;
        this.dealerSprite3.active = false;
        if (!this.playerData) {
            this.dealerSprite.active = false;
            this.dealerSprite2.active = false;
            this.dealerSprite3.active = false;
        }
    },

    /**
     * @description Clears seat on player leave
     * @method disablePlayerView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    disablePlayerView: function () {
        this.resetTimer();
        this.sitHerePanel.active = true;
        this.setDealer(false);
        this.bestHandNode.active = false;
        this.node.getChildByName("BB").active = false;
        this.node.getChildByName("SB").active = false;
        this.reservedPanel.active = false;
        this.occupiedPanel.active = false;
        this.emptyPanel.active = false;
        this.seatState = K.SeatState.Free;
        this.avatarBtn.node.active = false;
        this.playerData = null;
    },

    /**
     * @description Hides the seat UI
     * @method disableView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    disableView: function () {
        this.bestHandNode.active = false;
        this.node.getChildByName("BB").active = false;
        this.node.getChildByName("SB").active = false;
        this.emptyPanel.active = true;
        this.sitHerePanel.active = false;
        this.emptyPanel.children[1].getComponent(cc.Label).string = "Empty";
        this.occupiedPanel.active = false;
        this.reservedPanel.active = false;
        this.seatState = K.SeatState.Hidden;
        this.avatarBtn.node.active = false;
        this.setDealer(false);
        this.playerData = null;
    },

    /**
     * @description Utility method for displayMove 
     * @method displayMoveUtil
     * @param {String} playerName Name of the player
     * @param {String} move Move of the player
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    disPlayMoveUtil: function (playerName, move) {
        this.moveShower.setScale(0, 0);
        this.moveShower.stopAllActions();
        this.moveShower.active = true;
        let moveText = '';
        switch (move) {
            case "FOLD":
                moveText = "FOLD";
                break;
            case "ALLIN":
                moveText = "ALL IN";
                break;
            case "CHECK":
                moveText = "CHECK";
                break;
            case "RAISE":
                moveText = "RAISE";
                break;
            case "BET":
                moveText = "BET";
                break;
            case "CALL":
                moveText = "CALL";
                break;
        }

        this.moveShower.children.forEach(function (element) {
            element.active = false;
        }, this);
        this.moveShower.getChildByName(move).active = true;
        this.moveShower.scale = 1;
    },
    /**
     * @description Called from PokerPresenter, when this player makes the turn
     * @method displayMove
     * @param {String} move Player's Move while playing game
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    displayMove: function (move) {
        this.clearReconnectionCountdown();
        if (this.reconnectionTimer) {
            this.reconnectionTimer.node.active = false;
        }

        if (this._isRebuying) {
            this.amountLabel.string = "";
            return;
        }
        this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
        this.updateBB();
        this.disPlayMoveUtil(this.playerData.playerName, move);

        if (move !== "FOLD" && move !== "ALLIN") {
            if (this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
                if (move == "CALL") {
                    this.pokerPresenter.playAudio(K.Sounds.playerCall);
                } else if (move == "CHECK") {
                    this.pokerPresenter.playAudio(K.Sounds.playerCheck);
                } else if (move == "RAISE") {
                    this.pokerPresenter.playAudio(K.Sounds.playerRaise);
                } else if (move == "BET") {
                    this.pokerPresenter.playAudio(K.Sounds.playerBet);
                }
            }
            this.displayDefault();
        } else {
            if (move === "FOLD") {
                if (this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
                    this.pokerPresenter.playAudio(K.Sounds.playerFold);
                    this.graySelf();
                }
                this.enableFoldView();
            } else if (move === "ALLIN") {
                if (this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
                    this.pokerPresenter.playAudio(K.Sounds.playerAllIn);
                }
                this.enableAllInView();

            }
        }

        let totalRoundBet = 0;
        if (this.playerData.totalRoundBet < 1) {
            totalRoundBet = Math.ceil(this.playerData.totalRoundBet);
        } else {
            if (this.pokerPresenter.isTournament()) {
                totalRoundBet = Math.floor(this.playerData.totalRoundBet);
            } else {
                totalRoundBet = Math.floor(this.playerData.totalRoundBet);
            }
        }

        if (totalRoundBet <= 0) {
            if (move === "CALL" && (totalRoundBet == 0) || move === "ALLIN" && (totalRoundBet == 0) && (this.playerData.totalRoundLastBet != undefined)) {
                this.displayBet(this.playerData.totalRoundLastBet.roundOff(2));
            }
        } else {
            this.displayBet(this.playerData.totalRoundBet.roundOff(2));
        }
        this.resetTimer();
    },

    /**
     * @description Enables fold view
     * @method enableFoldView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableFoldView: function () {
        if (this.playerData != null && this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
            this.pokerPresenter.model.emit("FoldEvent");
        }
        this.image.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.amountLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.amountLabel.node.parent.getChildByName("bb").getComponent(cc.Label).setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.nameLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this.cardHolder.children.forEach(function (element) {
            element.getComponent('Card').gray();
        }, this);
        this.cardHolderMy.children.forEach(function (element) {
            element.getComponent('Card').gray();
        }, this);
    },

    /**
     * @description Enables fold view
     * @method displayDefault
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    displayDefault: function () {
        this.displayDefaultTimer = setTimeout(function () {
            if (cc.isValid(this.node)) {
                if (!!this.playerData) {
                    this.onStateChange();
                }
            }
        }.bind(this), 2500);
    },

    /**
     * @description Called at the time  when this player leaves the table to clear pending timers
     * @method clearTimers
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    showRebuyIndicator: function () {
        this._isRebuying = true;
        if (this.amountLabel) {
            this.amountLabel.string = "";
            this.amountLabel.node.active = false;
        }
        if (this.rebuyIndicatorNode) this.rebuyIndicatorNode.active = true;
        this.clearPlayerCards();
    },

    hideRebuyIndicator: function () {
        this._isRebuying = false;
        if (this.rebuyIndicatorNode) this.rebuyIndicatorNode.active = false;
        if (this.amountLabel) this.amountLabel.node.active = true;
        this.onStateChange();
    },

    clearTimers: function () {
        clearTimeout(this.displayDefaultTimer);
        clearTimeout(this.resetBetTimer);
        if (this.timersToKill && this.timersToKill.length > 0) {
            this.timersToKill.forEach(function (element) {
                clearTimeout(element);
            }, this);
        }
        this.timersToKill = [];
        this.clearReconnectionCountdown();
    },

    startReconnectionCountdown: function (seconds) {
        if (!this.playerData.isPartOfGame) return;
        if (this.reconnectionInterval) return;
        var remaining = seconds;
        this.reconnectionInterval = setInterval(function () {
            remaining--;
            if (!cc.isValid(this.reconnectionTimer.node)) {
                this.clearReconnectionCountdown();
                return;
            }
            if (remaining <= 0) {
                this.clearReconnectionCountdown();
                this.reconnectionTimer.node.active = false;
                return;
            }
            this.reconnectionTimer.string = remaining;
        }.bind(this), 1000);
    },

    clearReconnectionCountdown: function () {
        if (this.reconnectionInterval) {
            clearInterval(this.reconnectionInterval);
            this.reconnectionInterval = null;
        }
    },

    /**
     * @description Enables all in view
     * @method enableAllInView
     * @memberof PlayerPresenter#
     */
    enableAllInView: function () {
    },

    /**
     * @description Enables Waiting view
     * @method enableWaitingView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableWaitingView: function () {
        this.nameLabel.string = "Waiting";
        if (this.playerData != null && this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
            this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
            this.updateBB();
            this.nameLabel.string = (this.playerData.playerName.length > 8) ? this.playerData.playerName.substring(0, 8) + ".." : this.playerData.playerName;
        } else {
            this.amountLabel.string = (this.playerData.playerName.length > 8) ? this.playerData.playerName.substring(0, 8) + ".." : this.playerData.playerName;
        }
        this.clearPlayerCards();
        this.moveShower.scale = 0;
        this.dealerSprite.active = false;
        this.dealerSprite2.active = false;
        this.dealerSprite3.active = false;
        this.image.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.amountLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.amountLabel.node.parent.getChildByName("bb").getComponent(cc.Label).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.nameLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
    },

    /**
     * @description Enables OnBreak view
     * @method enableOnbreakView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableOnbreakView: function () {
        if (this._isRebuying) {
            this.amountLabel.string = "";
            return;
        }
        this.grayer.active = true;
        this.nameLabel.string = "Sitting Out";
        if (this.playerData != null && this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
            this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
            this.updateBB();
        } else {
            this.amountLabel.string = (this.playerData.playerName.length > 8) ? this.playerData.playerName.substring(0, 8) + ".." : this.playerData.playerName;;
        }
        this.moveShower.scale = 0;
    },

    enableRebuyingView: function () {
        this.nameLabel.string = "Rebuying";
        this.amountLabel.string = "";
        this.updateBB();
        this.clearPlayerCards();
    },

    /**
     * @description Enables Disconnected view
     * @method enableDisconnectedView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableDisconnectedView: function () {
        this.grayer2.active = true;
        this.reconnectionTimer.string = "";
        this.amountLabel.string = "Reconnecting";
    },

    /**
     * @description Enables Out Of Money view
     * @method enableOutOfMoneyView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableOutOfMoneyView: function () {
        if (this._isRebuying) {
            this.amountLabel.string = "";
            return;
        }
        this.nameLabel.string = "Sitting Out";
        if (this.playerData != null && this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
            this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
            this.updateBB();
        } else {
            this.amountLabel.string = (this.playerData.playerName.length > 8) ? this.playerData.playerName.substring(0, 8) + ".." : this.playerData.playerName;;
        }
        this.activatePlayerBet(false);
    },

    /**
     * @description Enables Playing View
     * @method enablePlayingView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enablePlayingView: function () {
        this.amountLabel.node.stopAllActions();
        this.image.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.amountLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.amountLabel.node.parent.getChildByName("bb").getComponent(cc.Label).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.nameLabel.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this.nameLabel.string = (this.playerData.playerName.length > 8) ? this.playerData.playerName.substring(0, 8) + ".." : this.playerData.playerName;
        if (this.playerData.lastMove === "FOLD") {
            this.enableFoldView();
        } else if (this.playerData.lastMove === "ALLIN") {
            this.enableAllInView();
        }
    },

    /**
     * @description Enables Reserved view
     * @method enableReservedView
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableReservedView: function () {
        this.reservedPanel.active = true;
        this.emptyPanel.active = false;
        this.sitHerePanel.active = false;
    },

    disableReservedView: function () {
        this.reservedPanel.active = false;
        this.emptyPanel.active = false;
        this.sitHerePanel.active = true;
    },

    /**
     * @description Called from PokerPresenter when there is turn of this player 
     * @method onTurn
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    onTurn: function (turnDisplayTime) {
        this.isTurned = false;
        this.pokerPresenter.model.off(K.PokerEvents.onTimerTick);
        this.pokerPresenter.model.off(K.PokerEvents.onDisconnectTimerTick);
        this.imgHider.active = true;
        if (this.turmTimerGray) {
            this.turmTimerGray.active = true;
        }
        if (this.playerData && this.playerData.state === K.PlayerState.Disconnected) {
            return;
        }
        if (this.isSelf()) {
            GameManager.vibrate();
        }
        this.pokerPresenter.model.on(K.PokerEvents.onTimerTick, function (time, elapsed) {
            if (!GameManager.user) {
                return;
            }
            if (!this.playerData) {
                return;
            }
            if (this.extra.active) {
                this.timeBank.children[1].getComponent(cc.Label).string = Math.abs(parseInt(elapsed));

                if (this.timeBank.children[1].getComponent(cc.Label).string.length == 1) {
                    this.timeBank.children[1].getComponent(cc.Label).string = "0" + this.timeBank.children[1].getComponent(cc.Label).string;
                }
            }
            if (this.turnTimerLabel) {
                let remainingSeconds = Math.max(0, Math.ceil(elapsed));
                this.turnTimerLabel.string = remainingSeconds < 10 ? "0" + remainingSeconds : "" + remainingSeconds;
            }
            if (this.turnTimerStar) {
                this.turnTimerStar.active = time > 0;
                let radius = this.turnTimerStar.parent.width / 2;
                let angleDegrees = (time + 0.25) * 360;
                let angleRadians = angleDegrees * Math.PI / 180;
                this.turnTimerStar.x = radius * Math.cos(angleRadians);
                this.turnTimerStar.y = radius * Math.sin(angleRadians);
            }
            this.timerSprite.fillRange = time;
            // this.timerSprite.node.color = new cc.Color().fromHEX("#00FF1D");
            // this.timerPSprite.node.children[0].color = new cc.Color().fromHEX("#00FF1D");
            // if (this.timerSprite.fillRange >= 0.5) {
            //     this.timerSprite.node.color = new cc.Color().fromHEX("#00FF1D");
            //     this.timerPSprite.node.children[0].color = new cc.Color().fromHEX("#00FF1D");
            // } else if (this.timerSprite.fillRange >= 0.25) {
            //     this.timerSprite.node.color = new cc.Color().fromHEX("#FFFF00");
            //     this.timerPSprite.node.children[0].color = new cc.Color().fromHEX("#FFFF00");
            // } else if (this.timerSprite.fillRange >= 0.125) {
            //     this.timerSprite.node.color = new cc.Color().fromHEX("#FF9D00");
            //     this.timerPSprite.node.children[0].color = new cc.Color().fromHEX("#FF9D00");
            // } else {
            //     this.timerSprite.node.color = new cc.Color().fromHEX("#FF0000");
            //     this.timerPSprite.node.children[0].color = new cc.Color().fromHEX("#FF0000");
            // }
            this.timerPSprite.node.children[0].active = true;
            this.timerPSprite.fillRange = time;

            const angleDegrees = (this.timerPSprite.fillRange + 0.25) * 360;
            const angleRadians = angleDegrees * Math.PI / 180;
            const x = 60 * Math.cos(angleRadians);
            const y = 60 * Math.sin(angleRadians);

            this.timerPSprite.node.children[0].x = x;
            this.timerPSprite.node.children[0].y = y;

            if (time <= 0) {
                this.timerPSprite.node.children[0].active = false;
            }
            if (time < 0.4 && this.playerData.playerId == GameManager.user.playerId) {
                if (!this.isPlaying) {
                    this.timersToKill.push(setTimeout(function () {
                        if (cc.isValid(this.node)) {
                            this.isPlaying = false
                        }
                    }.bind(this), 900));
                    this.pokerPresenter.playAudio(K.Sounds.endTimer);
                    this.isPlaying = true;
                }

                if (!this.isTurned && !cc.sys.isBrowser) {
                    this.isTurned = true;
                    GameScreen.selectTable(this.pokerPresenter.model.gameData.channelId);
                }
            }
        }.bind(this));
        if (this.playerData) {
            if (this.playerData.state !== K.PlayerState.Disconnected) {
                this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
                this.updateBB();
            }
        }
    },

    /**
     * @description Enables Time Bank
     * @method enableTimeBank
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    enableTimeBank: function () {
        this.timeBank.active = true;
        if (this.isSelf()) {
            this.timeBank.opacity = 255;
            GameManager.vibrate();
        } else {
            this.timeBank.opacity = 0;
        }
        this.extra.active = true;
        this.timeBank.children[0].scaleY = 0;
        let act = cc.scaleTo(0.2, 1, 1);
        this.timeBank.children[0].runAction(act);
        this.timerSprite.node.active = false;
        this.timerPSprite.node.active = false;
    },

    /**
     * @description Sync UI on state change
     * @method onStateChange
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    onStateChange: function () { //console.trace("state", this.playerData.state);
        if (!!this.playerData.state) {
            if (this.playerData.state !== K.PlayerState.Disconnected) {
                this.clearReconnectionCountdown();
                if (this.reconnectionTimer) {
                    this.reconnectionTimer.node.active = false;
                }
            }
            this.reservedPanel.active = false;
            this.grayer.active = false;
            this.grayer2.active = false;

            if (this._isRebuying) {
                this.amountLabel.string = "";
                return;
            }
            // handle state change here
            switch (this.playerData.state) {
                case K.PlayerState.Waiting:
                    this.enableWaitingView();
                    break;
                case K.PlayerState.Playing:
                    this.enablePlayingView();
                    this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
                    this.updateBB();
                    break;
                case K.PlayerState.OutOfMoney:
                    this.enableOutOfMoneyView();
                    break;
                case K.PlayerState.OnBreak:
                    this.enableOnbreakView();
                    break;
                case K.PlayerState.Disconnected:
                    this.enableDisconnectedView();
                    break;
                case K.PlayerState.Left:
                    break;
                case K.PlayerState.None:
                    this.disableView();
                    break;
                case K.PlayerState.Reserved:
                    this.enableReservedView();
                    break;
                case K.PlayerState.Rebuy:
                    this.enableRebuyingView();
                    break;
                default:
                    break;
            }
        }
    },

    isLeftPlayer: function (rIndex) {
        if (this.pokerPresenter.model.roomConfig.maxPlayers == 2) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 3) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 4) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 5) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 6) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 7) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 8) { } else if (this.pokerPresenter.model.roomConfig.maxPlayers == 9) { }
    },

    /**
     * @description Generates cards and passed control to poker presenter
     * @method addPlayerCards
     * @param {Card[]} card Array of cards representing player's cards
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    addPlayerCards: function (card, fromDisonnection = false) {
        if (card === null || card.length === 0) {
            return;
        }
        this.cardHolder.children.forEach(function (e) {
            e.active = false;
        })
        if (this.cardHolderMy) {
            this.cardHolderMy.children.forEach(function (e) {
                e.active = false;
            })
        }

        this.cardHolderShow.children.forEach(function (e) {
            e.active = false;
        })
        if (this.cardHolderMyShow) {
            this.cardHolderMyShow.children.forEach(function (e) {
                e.active = false;
            })
        }
        card.forEach(function (element, i) {
            var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
            var cardComponent = instance.getComponent('Card');
            cardComponent.init(element, this.pokerPresenter.model, true);
            cardComponent.reveal(true);
            cardComponent.isMyCard = (this.playerData.playerId == GameManager.user.playerId);
            cardComponent.isCommunityCard = false;
            instance.parent = this.cardHolderMy;
            let x = 0;
            let y = 0;

            if (card.length == 2) {
                if (this.isSelf()) {
                    if (i == 1) {
                        x = this.cardHolder2My.children[1].x;
                        y = this.cardHolder2My.children[1].y;
                        instance.setRotation(this.cardHolder2My.children[1].getRotation());
                    } else {
                        x = this.cardHolder2My.children[0].x;
                        y = this.cardHolder2My.children[0].y;
                        instance.setRotation(this.cardHolder2My.children[0].getRotation());
                    }
                } else {
                    if (i == 1) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].getRotation());
                    } else {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].getRotation());
                    }
                }
            } else if (card.length == 3) {
                if (this.isSelf()) {
                    if (i == 0) {
                        x = this.cardHolder3My.children[0].x;
                        y = this.cardHolder3My.children[0].y;
                        instance.setRotation(this.cardHolder3My.children[0].getRotation());
                    } else if (i == 1) {
                        x = this.cardHolder3My.children[1].x;
                        y = this.cardHolder3My.children[1].y;
                        instance.setRotation(this.cardHolder3My.children[1].getRotation());
                    } else {
                        x = this.cardHolder3My.children[2].x;
                        y = this.cardHolder3My.children[2].y;
                        instance.setRotation(this.cardHolder3My.children[2].getRotation());
                    }
                } else {
                    if (i == 0) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].getRotation());
                    } else if (i == 1) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].getRotation());
                    } else {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].getRotation());
                    }
                }
            } else if (card.length == 4) {
                if (this.isSelf()) {
                    if (i == 1) {
                        x = this.cardHolder4My.children[1].x;
                        y = this.cardHolder4My.children[1].y;
                        instance.setRotation(this.cardHolder4My.children[1].getRotation());
                    } else if (i == 3) {
                        x = this.cardHolder4My.children[3].x;
                        y = this.cardHolder4My.children[3].y;
                        instance.setRotation(this.cardHolder4My.children[3].getRotation());
                    } else if (i == 2) {
                        x = this.cardHolder4My.children[2].x;
                        y = this.cardHolder4My.children[2].y;
                        instance.setRotation(this.cardHolder4My.children[2].getRotation());
                    } else if (i == 0) {
                        x = this.cardHolder4My.children[0].x;
                        y = this.cardHolder4My.children[0].y;
                        instance.setRotation(this.cardHolder4My.children[0].getRotation());
                    }
                } else {
                    if (i == 1) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].getRotation());
                    } else if (i == 3) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].getRotation());
                    } else if (i == 2) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].getRotation());
                    } else if (i == 0) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].getRotation());
                    }
                }
            } else if (card.length == 5) {
                if (this.isSelf()) {
                    if (i == 1) {
                        x = this.cardHolder5My.children[1].x;
                        y = this.cardHolder5My.children[1].y;
                        instance.setRotation(this.cardHolder5My.children[1].getRotation());
                    } else if (i == 3) {
                        x = this.cardHolder5My.children[3].x;
                        y = this.cardHolder5My.children[3].y;
                        instance.setRotation(this.cardHolder5My.children[3].getRotation());
                    } else if (i == 2) {
                        x = this.cardHolder5My.children[2].x;
                        y = this.cardHolder5My.children[2].y;
                        instance.setRotation(this.cardHolder5My.children[2].getRotation());
                    } else if (i == 0) {
                        x = this.cardHolder5My.children[0].x;
                        y = this.cardHolder5My.children[0].y;
                        instance.setRotation(this.cardHolder5My.children[0].getRotation());
                    } else if (i == 4) {
                        x = this.cardHolder5My.children[4].x;
                        y = this.cardHolder5My.children[4].y;
                        instance.setRotation(this.cardHolder5My.children[4].getRotation());
                    }
                } else {
                    if (i == 1) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].getRotation());
                    } else if (i == 3) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].getRotation());
                    } else if (i == 2) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].getRotation());
                    } else if (i == 0) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].getRotation());
                    } else if (i == 4) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].getRotation());
                    }
                }
            } else if (card.length == 6) {
                if (this.isSelf()) {
                    if (i == 1) {
                        x = this.cardHolder6My.children[1].x;
                        y = this.cardHolder6My.children[1].y;
                        instance.setRotation(this.cardHolder6My.children[1].getRotation());
                    } else if (i == 3) {
                        x = this.cardHolder6My.children[3].x;
                        y = this.cardHolder6My.children[3].y;
                        instance.setRotation(this.cardHolder6My.children[3].getRotation());
                    } else if (i == 2) {
                        x = this.cardHolder6My.children[2].x;
                        y = this.cardHolder6My.children[2].y;
                        instance.setRotation(this.cardHolder6My.children[2].getRotation());
                    } else if (i == 0) {
                        x = this.cardHolder6My.children[0].x;
                        y = this.cardHolder6My.children[0].y;
                        instance.setRotation(this.cardHolder6My.children[0].getRotation());
                    } else if (i == 4) {
                        x = this.cardHolder6My.children[4].x;
                        y = this.cardHolder6My.children[4].y;
                        instance.setRotation(this.cardHolder6My.children[4].getRotation());
                    } else if (i == 5) {
                        x = this.cardHolder6My.children[5].x;
                        y = this.cardHolder6My.children[5].y;
                        instance.setRotation(this.cardHolder6My.children[5].getRotation());
                    }
                } else {
                    if (i == 1) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[1].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[1].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[1].getRotation());
                    } else if (i == 3) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[3].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[3].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[3].getRotation());
                    } else if (i == 2) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[2].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[2].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[2].getRotation());
                    } else if (i == 0) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[0].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[0].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[0].getRotation());
                    } else if (i == 4) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[4].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[4].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[4].getRotation());
                    } else if (i == 5) {
                        x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[5].x;
                        y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[5].y;
                        instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[5].getRotation());
                    }
                }
            }
            instance.setPosition(x, y);
            if (cardComponent.isMyCard) {
                instance.scale = 1.25;
            }
        }, this);
    },

    addWinningPlayerCards: function (card, fromDisonnection) {
        this.bestHandNode.active = false;

        if (card === null || card.length === 0) {
            return;
        }

        this.cardHolder.children.forEach(function (e) {
            e.active = false;
        })
        if (this.cardHolderMy) {
            this.cardHolderMy.children.forEach(function (e) {
                e.active = false;
            })
        }

        if (this.cardHolderMyShow) {
            this.cardHolderMyShow.children.forEach(function (e) {
                e.active = false;
            })
        }

        if (this.isSelf()) {
            this.cardHolderShow.children.forEach(function (e) {
                e.active = false;
            })
            card.forEach(function (element, i) {
                var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
                var cardComponent = instance.getComponent('Card');
                cardComponent.init(element, this.pokerPresenter.model, true);
                cardComponent.reveal(true);
                if (this.isSelf()) {
                    instance.parent = this.cardHolderMyShow;
                }
                else {
                    instance.setPosition(0, cardComponent.node.height / 2);
                    instance.parent = this.cardHolderShow;
                }
            }, this);

        } else {
            if (card.length == 2) {
                this.cardHolderShow.scale = 1.35;
            } else if (card.length == 4) {
                this.cardHolderShow.scale = 1.25;
            } else if (card.length == 5) {
                this.cardHolderShow.scale = 1.16;
            } else if (card.length == 6) {
                this.cardHolderShow.scale = 1;
            }
        }
    },

    isSelf() {
        return (this.playerData && this.playerData.playerId && this.playerData.playerId == GameManager.user.playerId);
    },

    onSitHere: function () {
        this.pokerPresenter.onSitHere(this.seatIndex);
    },

    revealCards: function (fromDisonnection) {
        var cardType = [];
        if (this.playerData.cards !== undefined && this.playerData.cards !== null && this.playerData.cards.length > 0) {
            this.playerData.cards.forEach(function (cardData) {

                var suit = this.pokerPresenter.model.getSuit(cardData.type);
                cardType.push(new card(cardData.rank, suit));
            }, this);
            this.addPlayerCards(cardType, fromDisonnection);
            this.playerData.cards = [];
        }
    },

    winningRevealCards: function (fromDisonnection) {
        var cardType = [];
        if (this.playerData.cards !== undefined && this.playerData.cards !== null && this.playerData.cards.length > 0) {
            this.showAllInCards(this.playerData.cards);
            this.playerData.cards = [];
        }
    },

    winningRevealCardsMuckHand: function () {
        var cardType = [];
        if (this.playerData.cards !== undefined && this.playerData.cards !== null && this.playerData.cards.length > 0) {
            this.showMuckCards(this.playerData.cards);
            this.playerData.cards = [];
        }
    },

    showMuckCards: function (card) {
        if (card === null || card.length === 0) {
            return;
        }
        if (this.isSelf()) {
            return;
        }
        this.cardHolderShow.children.forEach(function (e) {
            e.active = false;
        })
        this.cardHolder.children.forEach(function (e) {
            e.active = false;
        })

        if (card.length == 2) {
            this.cardHolderShow.scale = 1.1;
        } else if (card.length == 4) {
            this.cardHolderShow.scale = 0.9;
        } else if (card.length == 5) {
            this.cardHolderShow.scale = 0.7;
        } else if (card.length == 6) {
            this.cardHolderShow.scale = 0.6;
        }

        card.forEach(function (element, i) {
            var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
            var cardComponent = instance.getComponent('Card');
            element.point = element.rank;
            element.pointName = element.name;
            element.suit = this.pokerPresenter.model.getSuit(element.type);
            cardComponent.init(element, this.pokerPresenter.model, true);
            cardComponent.reveal(false);
            instance.runAction(
                cc.sequence(
                    cc.delayTime(0.01),
                    cc.callFunc(() => {
                        cardComponent.flipWithAction();
                    })
                )
            );
            instance.setPosition(0, 0);
            instance.parent = this.cardHolderShow;
            instance.setPosition(0, cardComponent.node.height / 2);
        }, this);

        this.winningNode.y = 10;
    },

    showAllInCards: function (card) {
        this.hideBBSBAddChips();

        if (card === null || card.length === 0) {
            return;
        }

        if (this.isSelf()) {
            this.cardHolder.children.forEach(function (e) {
                e.active = false;
            })
        }

        if (this.cardHolderMy) {
            this.cardHolderMy.children.forEach(function (e) {
                e.active = false;
            })
        }

        this.cardHolderShow.children.forEach(function (e) {
            e.active = false;
        })
        if (this.cardHolderMyShow) {
            this.cardHolderMyShow.children.forEach(function (e) {
                e.active = false;
            })
        }

        if (this.isSelf()) {
            card.forEach(function (element, i) {
                var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
                var cardComponent = instance.getComponent('Card');
                element.point = element.rank;
                element.pointName = element.name;
                element.suit = this.pokerPresenter.model.getSuit(element.type);
                cardComponent.init(element, this.pokerPresenter.model, true);
                cardComponent.reveal(true);
                instance.setPosition(0, 0);
                instance.parent = this.cardHolderMyShow;
                if (!this.isSelf() && this.pokerPresenter.model.roomConfig.channelVariation == "Omaha") {
                    instance.scale = 0.82;
                    this.cardHolderMyShow.getComponent(cc.Layout).spacingX = -55;
                } else {
                    instance.scale = 1;
                    this.cardHolderMyShow.getComponent(cc.Layout).spacingX = -50;
                }
            }, this);
        }
        else {
            this.cardHolder.children.forEach(function (e) {
                e.active = false;
            })

            if (card.length == 2) {
                this.cardHolderShow.scale = 1.1;
            } else if (card.length == 4) {
                this.cardHolderShow.scale = 0.9;
            } else if (card.length == 5) {
                this.cardHolderShow.scale = 0.7;
            } else if (card.length == 6) {
                this.cardHolderShow.scale = 0.6;
            }

            card.forEach(function (element, i) {
                var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
                var cardComponent = instance.getComponent('Card');
                element.point = element.rank;
                element.pointName = element.name;
                element.suit = this.pokerPresenter.model.getSuit(element.type);
                cardComponent.init(element, this.pokerPresenter.model, true);
                cardComponent.reveal(false);
                instance.runAction(
                    cc.sequence(
                        cc.delayTime(0.01),
                        cc.callFunc(() => {
                            cardComponent.flipWithAction();
                        })
                    )
                );
                instance.setPosition(0, 0);
                instance.parent = this.cardHolderShow;
                instance.setPosition(0, cardComponent.node.height / 2);
            }, this);
        }
    },

    /**
     * @description Reset player cards to show back face
     * @method resetCards
     * @param {bool} flag
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    resetCards: function (flag, fadeView) {
        var children = this.cardHolder.children;
        for (var index = 0; index < children.length; index++) {
            children[index].getComponent('Card').reveal(flag);
            if (this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
                children[index].children[0].getComponent(cc.Sprite).enabled = flag;
            }
        }

        if (this.cardHolderMy) {
            children = this.cardHolderMy.children;
            for (var index = 0; index < children.length; index++) {
                children[index].getComponent('Card').reveal(flag);
                if (this.pokerPresenter.checkForSelfTurn(this.playerData.playerId)) {
                    children[index].children[0].getComponent(cc.Sprite).enabled = flag;
                }
            }
        }
    },

    /**
     * @description Fill dummy cards for players other than self
     * @method displayDummyCards
     * @param {Number} noOfCards
     * @param {String} selfPlayerId
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    displayDummyCards: function (noOfCards, selfPlayerId) {
        if (this.seatState !== K.SeatState.Occupied) {
            return;
        }
        if (this.playerData && this.playerData.state == "REBUYING") {
            return;
        }
        this.cardHolder.getComponent(cc.Layout).spacingX = (noOfCards == 4) ? -37 : 20;

        if (this.isSelf()) { } else {
            if (GameManager.isMobile) {
                if ((this.node.parent.x < 0)) {
                    this.cardHolder.x = 70;
                } else {
                    this.cardHolder.x = -70;
                }
            }
        }

        if (this.pokerPresenter.isTournament()) {
            if (((!!selfPlayerId && selfPlayerId !== this.playerData.playerId) || (!selfPlayerId))) {
                this.clearPlayerCards();
                for (var index = 0; index < noOfCards; index++) {
                    var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
                    var cardComponent = instance.getComponent('Card');
                    cardComponent.reveal(false);
                    cardComponent.isMyCard = (this.playerData.playerId == GameManager.user.playerId);
                    cardComponent.isCommunityCard = false;
                    this.cardHolder.getComponent(cc.Layout).enabled = false;
                    instance.parent = (this.isSelf() || !GameManager.isMobile) ? this.cardHolderMy : this.cardHolder;
                    let x = 0;
                    let y = 0;

                    if (noOfCards == 2) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder2My.children[1].x;
                                y = this.cardHolder2My.children[1].y;
                                instance.setRotation(this.cardHolder2My.children[1].getRotation());
                            } else {
                                x = this.cardHolder2My.children[0].x;
                                y = this.cardHolder2My.children[0].y;
                                instance.setRotation(this.cardHolder2My.children[0].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].getRotation());
                            } else {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].getRotation());
                            }
                        }
                    } else if (noOfCards == 3) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 0) {
                                x = this.cardHolder3My.children[0].x;
                                y = this.cardHolder3My.children[0].y;
                                instance.setRotation(this.cardHolder3My.children[0].getRotation());
                            } else if (index == 1) {
                                x = this.cardHolder3My.children[1].x;
                                y = this.cardHolder3My.children[1].y;
                                instance.setRotation(this.cardHolder3My.children[1].getRotation());
                            } else {
                                x = this.cardHolder3My.children[2].x;
                                y = this.cardHolder3My.children[2].y;
                                instance.setRotation(this.cardHolder3My.children[2].getRotation());
                            }
                        } else {
                            if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].getRotation());
                            } else if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].getRotation());
                            } else {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].getRotation());
                            }
                        }
                    } else if (noOfCards == 4) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder4My.children[1].x;
                                y = this.cardHolder4My.children[1].y;
                                instance.setRotation(this.cardHolder4My.children[1].getRotation());
                            } else if (index == 3) {
                                x = this.cardHolder4My.children[3].x;
                                y = this.cardHolder4My.children[3].y;
                                instance.setRotation(this.cardHolder4My.children[3].getRotation());
                            } else if (index == 2) {
                                x = this.cardHolder4My.children[2].x;
                                y = this.cardHolder4My.children[2].y;
                                instance.setRotation(this.cardHolder4My.children[2].getRotation());
                            } else if (index == 0) {
                                x = this.cardHolder4My.children[0].x;
                                y = this.cardHolder4My.children[0].y;
                                instance.setRotation(this.cardHolder4My.children[0].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].getRotation());
                            } else if (index == 3) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].getRotation());
                            } else if (index == 2) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].getRotation());
                            } else if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].getRotation());
                            }
                        }
                    } else if (noOfCards == 5) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder5My.children[1].x;
                                y = this.cardHolder5My.children[1].y;
                                instance.setRotation(this.cardHolder5My.children[1].getRotation());
                            } else if (index == 3) {
                                x = this.cardHolder5My.children[3].x;
                                y = this.cardHolder5My.children[3].y;
                                instance.setRotation(this.cardHolder5My.children[3].getRotation());
                            } else if (index == 2) {
                                x = this.cardHolder5My.children[2].x;
                                y = this.cardHolder5My.children[2].y;
                                instance.setRotation(this.cardHolder5My.children[2].getRotation());
                            } else if (index == 0) {
                                x = this.cardHolder5My.children[0].x;
                                y = this.cardHolder5My.children[0].y;
                                instance.setRotation(this.cardHolder5My.children[0].getRotation());
                            } else if (index == 4) {
                                x = this.cardHolder5My.children[4].x;
                                y = this.cardHolder5My.children[4].y;
                                instance.setRotation(this.cardHolder5My.children[4].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].getRotation());
                            } else if (index == 3) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].getRotation());
                            } else if (index == 2) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].getRotation());
                            } else if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].getRotation());
                            } else if (index == 4) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].getRotation());
                            }
                        }
                    } else if (noOfCards == 6) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder6My.children[1].x;
                                y = this.cardHolder6My.children[1].y;
                                instance.setRotation(this.cardHolder6My.children[1].getRotation());
                            } else if (index == 3) {
                                x = this.cardHolder6My.children[3].x;
                                y = this.cardHolder6My.children[3].y;
                                instance.setRotation(this.cardHolder6My.children[3].getRotation());
                            } else if (index == 2) {
                                x = this.cardHolder6My.children[2].x;
                                y = this.cardHolder6My.children[2].y;
                                instance.setRotation(this.cardHolder6My.children[2].getRotation());
                            } else if (index == 0) {
                                x = this.cardHolder6My.children[0].x;
                                y = this.cardHolder6My.children[0].y;
                                instance.setRotation(this.cardHolder6My.children[0].getRotation());
                            } else if (index == 4) {
                                x = this.cardHolder6My.children[4].x;
                                y = this.cardHolder6My.children[4].y;
                                instance.setRotation(this.cardHolder6My.children[4].getRotation());
                            } else if (index == 5) {
                                x = this.cardHolder6My.children[5].x;
                                y = this.cardHolder6My.children[5].y;
                                instance.setRotation(this.cardHolder6My.children[5].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[1].getRotation());
                            } else if (index == 3) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[3].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[3].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[3].getRotation());
                            } else if (index == 2) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[2].getRotation());
                            } else if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[0].getRotation());
                            } else if (index == 4) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[4].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[4].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[4].getRotation());
                            } else if (index == 5) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[5].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[5].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[5].getRotation());
                            }
                        }
                    }
                    instance.x = (x);
                    instance.y = (y);
                }
            } else { }
        } else {
            if (((!!selfPlayerId && selfPlayerId !== this.playerData.playerId) || (!selfPlayerId)) && (this.playerData.state === K.PlayerState.Playing || this.playerData.state === K.PlayerState.Disconnected)) {
                this.clearPlayerCards();
                for (var index = 0; index < noOfCards; index++) {
                    var instance = CardPool.generateCard(this.pokerPresenter.cardPrefab.name, function () { });
                    var cardComponent = instance.getComponent('Card');
                    cardComponent.reveal(false);
                    cardComponent.isMyCard = (this.playerData.playerId == GameManager.user.playerId);
                    cardComponent.isCommunityCard = false;
                    this.cardHolder.getComponent(cc.Layout).enabled = false;
                    instance.parent = (this.isSelf() || !GameManager.isMobile) ? this.cardHolderMy : this.cardHolder;
                    let x = 0;
                    let y = 0;

                    if (noOfCards == 2) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder2My.children[1].x;
                                y = this.cardHolder2My.children[1].y;
                                instance.setRotation(this.cardHolder2My.children[1].getRotation());
                            } else {
                                x = this.cardHolder2My.children[0].x;
                                y = this.cardHolder2My.children[0].y;
                                instance.setRotation(this.cardHolder2My.children[0].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[1].getRotation());
                            } else {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder2 : this.cardHolder2R).children[0].getRotation());
                            }
                        }
                    } else if (noOfCards == 3) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 0) {
                                x = this.cardHolder3My.children[0].x;
                                y = this.cardHolder3My.children[0].y;
                                instance.setRotation(this.cardHolder3My.children[0].getRotation());
                            } else if (index == 1) {
                                x = this.cardHolder3My.children[1].x;
                                y = this.cardHolder3My.children[1].y;
                                instance.setRotation(this.cardHolder3My.children[1].getRotation());
                            } else {
                                x = this.cardHolder3My.children[2].x;
                                y = this.cardHolder3My.children[2].y;
                                instance.setRotation(this.cardHolder3My.children[2].getRotation());
                            }
                        } else {
                            if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[0].getRotation());
                            } else if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[1].getRotation());
                            } else {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder3 : this.cardHolder3R).children[2].getRotation());
                            }
                        }
                    } else if (noOfCards == 4) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder4My.children[1].x;
                                y = this.cardHolder4My.children[1].y;
                                instance.setRotation(this.cardHolder4My.children[1].getRotation());
                            } else if (index == 3) {
                                x = this.cardHolder4My.children[3].x;
                                y = this.cardHolder4My.children[3].y;
                                instance.setRotation(this.cardHolder4My.children[3].getRotation());
                            } else if (index == 2) {
                                x = this.cardHolder4My.children[2].x;
                                y = this.cardHolder4My.children[2].y;
                                instance.setRotation(this.cardHolder4My.children[2].getRotation());
                            } else if (index == 0) {
                                x = this.cardHolder4My.children[0].x;
                                y = this.cardHolder4My.children[0].y;
                                instance.setRotation(this.cardHolder4My.children[0].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[1].getRotation());
                            } else if (index == 3) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[3].getRotation());
                            } else if (index == 2) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[2].getRotation());
                            } else if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder4 : this.cardHolder4R).children[0].getRotation());
                            }
                        }
                    } else if (noOfCards == 5) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder5My.children[1].x;
                                y = this.cardHolder5My.children[1].y;
                                instance.setRotation(this.cardHolder5My.children[1].getRotation());
                            } else if (index == 3) {
                                x = this.cardHolder5My.children[3].x;
                                y = this.cardHolder5My.children[3].y;
                                instance.setRotation(this.cardHolder5My.children[3].getRotation());
                            } else if (index == 2) {
                                x = this.cardHolder5My.children[2].x;
                                y = this.cardHolder5My.children[2].y;
                                instance.setRotation(this.cardHolder5My.children[2].getRotation());
                            } else if (index == 0) {
                                x = this.cardHolder5My.children[0].x;
                                y = this.cardHolder5My.children[0].y;
                                instance.setRotation(this.cardHolder5My.children[0].getRotation());
                            } else if (index == 4) {
                                x = this.cardHolder5My.children[4].x;
                                y = this.cardHolder5My.children[4].y;
                                instance.setRotation(this.cardHolder5My.children[4].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[1].getRotation());
                            } else if (index == 3) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[3].getRotation());
                            } else if (index == 2) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[2].getRotation());
                            } else if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[0].getRotation());
                            } else if (index == 4) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder5R).children[4].getRotation());
                            }
                        }
                    } else if (noOfCards == 6) {
                        if (this.isSelf() || !GameManager.isMobile) {
                            if (index == 1) {
                                x = this.cardHolder6My.children[1].x;
                                y = this.cardHolder6My.children[1].y;
                                instance.setRotation(this.cardHolder6My.children[1].getRotation());
                            } else if (index == 3) {
                                x = this.cardHolder6My.children[3].x;
                                y = this.cardHolder6My.children[3].y;
                                instance.setRotation(this.cardHolder6My.children[3].getRotation());
                            } else if (index == 2) {
                                x = this.cardHolder6My.children[2].x;
                                y = this.cardHolder6My.children[2].y;
                                instance.setRotation(this.cardHolder6My.children[2].getRotation());
                            } else if (index == 0) {
                                x = this.cardHolder6My.children[0].x;
                                y = this.cardHolder6My.children[0].y;
                                instance.setRotation(this.cardHolder6My.children[0].getRotation());
                            } else if (index == 4) {
                                x = this.cardHolder6My.children[4].x;
                                y = this.cardHolder6My.children[4].y;
                                instance.setRotation(this.cardHolder6My.children[4].getRotation());
                            } else if (index == 5) {
                                x = this.cardHolder6My.children[5].x;
                                y = this.cardHolder6My.children[5].y;
                                instance.setRotation(this.cardHolder6My.children[5].getRotation());
                            }
                        } else {
                            if (index == 1) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[1].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[1].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[1].getRotation());
                            } else if (index == 3) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[3].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[3].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[3].getRotation());
                            } else if (index == 2) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[2].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[2].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[2].getRotation());
                            } else if (index == 0) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[0].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[0].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[0].getRotation());
                            } else if (index == 4) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[4].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[4].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder5 : this.cardHolder6R).children[4].getRotation());
                            } else if (index == 5) {
                                x = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[5].x;
                                y = ((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[5].y;
                                instance.setRotation(((this.node.parent.x < 0 && GameManager.isMobile) ? this.cardHolder6 : this.cardHolder6R).children[5].getRotation());
                            }
                        }
                    }
                    instance.x = (x);
                    instance.y = (y);
                }
            } else { }
        }
    },

    /**
     * @description Discard player hand on gameover
     * @method clearPlayerCards
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    clearPlayerCards: function () {
        var children = this.cardHolder.children;
        while (children.length > 0) {
            CardPool.destroyCard(children[0], function () { });
        }

        children = this.cardHolderShow.children;
        while (children.length > 0) {
            CardPool.destroyCard(children[0], function () { });
        }

        if (this.cardHolderMy) {
            children = this.cardHolderMy.children;
            while (children.length > 0) {
                CardPool.destroyCard(children[0], function () { });
            }
        }

        if (this.cardHolderMyShow) {
            children = this.cardHolderMyShow.children;
            while (children.length > 0) {
                CardPool.destroyCard(children[0], function () { });
            }
        }

        this.bestHandNode.active = false;
    },

    /**
     * @description Updates number of chips in view
     * @method updateCoins
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    updateCoins: function () {
        this.amountLabel.string = GameManager.convertChips(this.playerData.chips);
        this.updateBB();
    },

    /**
     * @description Stops listening events
     * @method onDestroy
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    onDestroy: function () {
        GameManager.off("image-loaded", this.imageLoadedRef);
    },

    //not in use
    showChatOldie: function (message) {
        this.chatHead.active = true;
        var posY = this.chatLbl.node.position.y;

        let tempMsg = message;
        if (tempMsg.length > 12) {
            message = message.substring(0, 9) + "...";
        }

        this.chatLbl.string = message;
        this.scheduleOnce(function () {
            this.chatHead.active = false;
        }.bind(this), 1);
    },

    /**
     * @description shows chatHead
     * @method showChat
     * @param {String} message - message string from broadcast
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    showChat: function (message) {
        message = message.trim();
        this.chatHead.active = true;
        var showChatTime = 5;
        if (message.indexOf("<img src") == -1) {
            this.chatLbl.string = message.substring(0, 25);
            if (message.length >= 25) {
                this.chatLbl.string += "...";
            }
        } else {
            let string = this.determineString(message);
            if (message.length > 320)
                this.chatLbl.string = string + "...";
            else
                this.chatLbl.string = string;
        }
        this.scheduleOnce(function () {
            this.chatLbl.string = "";
            this.chatHead.active = false;
        }.bind(this), showChatTime);
    },

    /**
     * @description utility method for showChat
     * @method determineString
     * @param {String} message - message string
     * @return {String} String to be displayed in chatHead
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    determineString: function (message) {
        //Emojis and text case 
        let limit = message.length > 320 ? 320 : message.length;
        let finalstr = "";
        let inEmoji = false;
        let que = "";
        let start = -1;
        for (let i = 0; i < limit; i++) {
            if (message[i] == "<") {
                inEmoji = true;
                start = i;
            }
            if (message[i] == ">") {
                inEmoji = false;
                finalstr += que;
                start = -1;
            }
            if (inEmoji) {
                que += message[i];
            } else {
                que = "";
                finalstr += message[i];
            }
        }

        if (que) { //que not empty
            if (!this.isEmoji(start, message)) { // string in the que is emoji
                finalstr += que;
            }
        }
        return finalstr;
    },

    /**
     * @description utility method for determingString. Checks if the string in the que is emoji?
     * @method isEmoji
     * @param {String} message - message string
     * @param {number} index - index of character '<'
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    isEmoji: function (index, message) {
        let temp = message.substring(index);
        return (temp.indexOf("<img") != -1) && (temp.indexOf("/>") != -1);
    },

    /**
     * @description  Showing Winner Banner to Player only. Will be called whever a player wins a pot.
     * @method showWinnerBanner
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    showWinnerBanner: function (winType, type) {
        this.bestHandNode.active = false;
        // console.log("showingwinner", winType, type);
        this.winningNode.active = true;
        this.winningNode.children[1].active = true;
        this.winningNode.children[2].active = true;
        this.winningNode.children[3].active = true;
        this.winningNode.children[4].active = true;

        this.winningNode.children[3].getChildByName("WINNERFOLD").active = false;
        this.winningNode.children[3].getChildByName("WINNELFOLD").active = false;
        this.winningNode.children[3].getChildByName("WINNEHFOLD").active = false;
        this.winningNode.children[3].getChildByName("Winner").active = true;
        this.winningNode.children[3].getChildByName("WinnerFOLD").active = false;

        if (winType == "high") {
            this.winningNode.children[3].getChildByName("WINNER").active = false;
            this.winningNode.children[3].getChildByName("WINNEL").active = false;
            this.winningNode.children[3].getChildByName("WINNEH").active = true;
        }
        else if (winType == "low") {
            this.winningNode.children[3].getChildByName("WINNER").active = false;
            this.winningNode.children[3].getChildByName("WINNEL").active = true;
            this.winningNode.children[3].getChildByName("WINNEH").active = false;
        }
        else {
            this.winningNode.children[3].getChildByName("WINNER").active = true;
            this.winningNode.children[3].getChildByName("WINNEL").active = false;
            this.winningNode.children[3].getChildByName("WINNEH").active = false;
        }
        if (type == "Every Body Else Folded") {
            this.winningNode.children[3].getChildByName("WINNER").active = false;
            this.winningNode.children[3].getChildByName("WINNEL").active = false;
            this.winningNode.children[3].getChildByName("WINNEH").active = false;

            this.winningNode.children[3].getChildByName("Winner").active = false;
            this.winningNode.children[3].getChildByName("WinnerFOLD").active = true;

            if (winType == "high") {
                this.winningNode.children[3].getChildByName("WINNERFOLD").active = false;
                this.winningNode.children[3].getChildByName("WINNELFOLD").active = false;
                this.winningNode.children[3].getChildByName("WINNEHFOLD").active = true;
            }
            else if (winType == "low") {
                this.winningNode.children[3].getChildByName("WINNERFOLD").active = false;
                this.winningNode.children[3].getChildByName("WINNELFOLD").active = true;
                this.winningNode.children[3].getChildByName("WINNEHFOLD").active = false;
            }
            else {
                this.winningNode.children[3].getChildByName("WINNERFOLD").active = true;
                this.winningNode.children[3].getChildByName("WINNELFOLD").active = false;
                this.winningNode.children[3].getChildByName("WINNEHFOLD").active = false;
            }
        }

        if (this.isSelf()) {
            this.winningNode.y = 160;
        }
        else {
            if (type == "Every Body Else Folded") {
                this.winningNode.y = 10;
            }
            else {
                this.winningNode.y = 10;
            }
        }
    },

    hideWinningAnim: function () {
        this.winningNode.active = false;
        this.winningNode.children[1].active = this.winningNode.children[2].active = this.winningNode.children[3].active = this.winningNode.children[4].active = false;
    },

    showSelf: function () {
        if (this.playerData && this.playerData.playerId && this.playerData.playerId == GameManager.user.playerId) {
            if (this.selfPlayerHand) {
                this.selfPlayerHand.active = true;
                this.selfTimerBox.active = true;
                this.timerSprite2.node.active = true;
            }
            this.occupiedPanel.getChildByName("Player").active = false;
            this.occupiedPanel.getChildByName("Timer").active = false;

            this.cardHolder.children.forEach(function (element) {
                cc.find('FrontFace/Gray', element).active = true;
            }, this);
            this.playerBetLabel.parent.setPosition(this.playerBetHolder.position);
        }
    },

    hideSelf: function () {
        if (this.playerData && this.playerData.playerId && this.playerData.playerId == GameManager.user.playerId) {
            if (this.selfPlayerHand) {
                this.selfPlayerHand.active = false;
                this.selfTimerBox.active = false;
                this.timerSprite2.node.active = false;
            }
            this.occupiedPanel.getChildByName("Player").active = true;
            this.occupiedPanel.getChildByName("Timer").active = true;
            this.playerBetLabel.parent.setPosition(this.oldPlayerBetLabelPosition);
            this.cardHolder.children.forEach(function (element) {
                cc.find('FrontFace/Gray', element).active = false;
            }, this);
        }
    },

    graySelf: function () {
        if (this.playerData && this.playerData.playerId && this.playerData.playerId == GameManager.user.playerId) {
            if (this.selfPlayerHand && this.selfPlayerHand.active) {
                this.cardHolder.children.forEach(function (element) {
                    element.opacity = 150;
                }, this);
            }
        }
    },

    graySelf2: function () {
        if (this.playerData && this.playerData.playerId && this.playerData.playerId == GameManager.user.playerId) {
            if (this.selfPlayerHand && this.selfPlayerHand.active) {
                cc.find('Timer/PFPAvatar', this.selfPlayerHand).getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
                cc.find('Timer/PlayerImageMask/PlayerImage', this.selfPlayerHand).getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
                this.cardHolder.children.forEach(function (element) {
                    element.opacity = 150;
                }, this);
            }
        }
    },

    ungraySelf: function () {
        if (this.playerData && this.playerData.playerId && this.playerData.playerId == GameManager.user.playerId) {
            if (this.selfPlayerHand) {
                cc.find('Timer/PFPAvatar', this.selfPlayerHand).getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
                cc.find('Timer/PlayerImageMask/PlayerImage', this.selfPlayerHand).getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));

                this.cardHolder.children.forEach(function (element) {
                    element.opacity = 255;
                }, this);
            }
        }
    },

    onDisconnectTime: function (turnDisplayTime) {
        this.pokerPresenter.model.off(K.PokerEvents.onDisconnectTimerTick);
        if (!this.playerData) {
            return;
        }
        this.extra.active = false;
        this.timerSprite.node.parent.getChildByName("Base").active = true;
        this.imgHider.active = true;
    },

    switchBB() {
        if (GameManager.isBB) {
            GameManager.isBB = false;
        } else {
            GameManager.isBB = true;
        }
        GameManager.emit("switchBB");
    },

    updateBB() {
        if (!this.pokerPresenter.model) {
            return;
        }
        if (this.playerData) {
            this.amountLabel.node.parent.getChildByName("bb").getComponent(cc.Label).string = (Number(this.playerData.chips) / this.pokerPresenter.model.roomConfig.bigBlind).toFixed(1) + 'BB';
        }
        this.playerBetLabel.parent.getChildByName("bb").getComponent(cc.Label).string = (Number(this.playerBetLabel.getComponent(cc.Label).__string) / this.pokerPresenter.model.roomConfig.bigBlind).toFixed(1) + 'BB';
        if (GameManager.isBB && GameManager.user.settings.stackInBB) {
            this.playerBetLabel.active = false;
            this.playerBetLabel.parent.getChildByName("bb").active = true;

            this.amountLabel.node.active = false;
            this.amountLabel.node.parent.getChildByName("bb").active = true;
        } else {
            this.playerBetLabel.active = true;
            this.playerBetLabel.parent.getChildByName("bb").active = false;

            this.amountLabel.node.active = true;
            this.amountLabel.node.parent.getChildByName("bb").active = false;
        }
    },

    switchBBNow() {
        this.updateBB();
    },

    updateTimeBank() {
        if (this.isSelf() && this.playerData.state != K.PlayerState.Waiting) {
            let elapsed = this.pokerPresenter.model.gameData.timeBankLeft;
            this.timeBank.children[1].getComponent(cc.Label).string = Math.abs(parseInt(elapsed));
            if (this.timeBank.children[1].getComponent(cc.Label).string.length == 1) {
                this.timeBank.children[1].getComponent(cc.Label).string = "0" + this.timeBank.children[1].getComponent(cc.Label).string;
            }
        }
    },

    updateTimeBank2(val) {
        if (this.isSelf() && this.playerData.state != K.PlayerState.Waiting) {
            let elapsed = val;
            this.timeBank.children[1].getComponent(cc.Label).string = Math.abs(parseInt(elapsed));
            if (this.timeBank.children[1].getComponent(cc.Label).string.length == 1) {
                this.timeBank.children[1].getComponent(cc.Label).string = "0" + this.timeBank.children[1].getComponent(cc.Label).string;
            }
        }
    },
    enableAgoraWhenSit(forceMute = false) {
        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            let status = jsb.reflection.callStaticMethod("AppController", "checkVideoPermission");
            if (status != 3) {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please allow camera permission in the system settings.", function () { });
                return;
            }
        }

        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            let status = jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "checkVideoPermission",
                "()I"
            );
            if (status != 3) {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, "Please allow camera permission in the system settings.", function () { });
                return;
            }
        }

        if (!GameScreen.isActiveTable(this.pokerPresenter.model.gameData.channelId)) {
            return;
        }

        if (!GameScreen.isGameplayActive()) {
            return;
        }

        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        let agoraVideoRender = this.agoraVideoRender.getComponent("AgoraVideoRender");
        let uid = Number(this.playerData.playerId.substr(0, 5));
        window.MGR_AGORA.localRender = agoraVideoRender;
        window.MGR_AGORA.remoteRenders = [];

        var isJoined = window.MGR_AGORA.isJoinedChannel(this.pokerPresenter.model.gameData.agoraChannelName);
        agoraVideoRender.setup(uid, this.pokerPresenter.model.gameData.agoraChannelName);

        if (isJoined) {
            var isVideoCurrentlyEnabled = window.MGR_AGORA.isVideoCurrentlyEnabled(this.pokerPresenter.model.gameData.agoraChannelName);
            var isAudioCurrentlyEnabled = window.MGR_AGORA.isAudioCurrentlyEnabled(this.pokerPresenter.model.gameData.agoraChannelName);
            if (this.playerData.__muteStateBackToLobby == true) {
                cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            } else {
                if (isVideoCurrentlyEnabled) {
                    cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                } else {
                    cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                }
            }
        } else {
            let isJoinedChannel = window.MGR_AGORA.isJoined();
            if (isJoinedChannel) {
                window.MGR_AGORA.leaveRoom(
                    K.ServerAddress.agora_appid,
                    this.pokerPresenter.model.gameData.agoraChannelName,
                    "",
                    uid
                );
                this.scheduleOnce(function () {
                    window.MGR_AGORA.joinRoom(
                        K.ServerAddress.agora_appid,
                        this.pokerPresenter.model.gameData.agoraChannelName,
                        this.pokerPresenter.model.gameData.agoraToken,
                        uid
                    );

                    if (forceMute) {
                        GameManager.muteAll(this.pokerPresenter);
                    }
                }, 0.5);
            } else {
                window.MGR_AGORA.joinRoom(
                    K.ServerAddress.agora_appid,
                    this.pokerPresenter.model.gameData.agoraChannelName,
                    this.pokerPresenter.model.gameData.agoraToken,
                    uid,
                    this.playerData.__muteStateBackToLobby
                );

                if (forceMute) {
                    GameManager.muteAll(this.pokerPresenter);
                }

                if (this.playerData.__muteStateBackToLobby == true) {
                    cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                    this.scheduleOnce(function () {
                        window.MGR_AGORA.muteLocalVideoStream(true);
                        window.MGR_AGORA.muteLocalAudioStream(true);
                    }, 2);
                }
            }
        }
    },

    onVideoToggle(target, msg) {
        if (!this.playerData) {
            return;
        }

        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        let uid = Number(this.playerData.playerId.substr(0, 5));
        if (this.isSelf()) {
            var isVideoCurrentlyEnabled = window.MGR_AGORA.isVideoCurrentlyEnabled(this.pokerPresenter.model.gameData.agoraChannelName);
            if (isVideoCurrentlyEnabled) {
                window.MGR_AGORA.muteLocalVideoStream(true);
                window.MGR_AGORA.muteLocalAudioStream(true);
                this.playerData.__muteStateBackToLobby = true;
                cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            } else {
                window.MGR_AGORA.muteLocalVideoStream(false);
                window.MGR_AGORA.muteLocalAudioStream(false);
                this.playerData.__muteStateBackToLobby = false;
                cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            }
        } else {
            let isRemoteAudioMuted = window.MGR_AGORA.isRemoteVideoMuted(uid);
            let isRemoteSelfAudioMuted = window.MGR_AGORA.isRemoteSelfVideoMuted(uid);

            if (isRemoteAudioMuted) {
                window.MGR_AGORA.muteRemoteVideoStream(uid, false);
                window.MGR_AGORA.muteRemoteAudioStream(uid, false);
                this.playerData.__muteStateBackToLobby = false;
                if (!isRemoteSelfAudioMuted) {
                    cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                }
            } else {
                window.MGR_AGORA.muteRemoteVideoStream(uid, true);
                window.MGR_AGORA.muteRemoteAudioStream(uid, true);
                this.playerData.__muteStateBackToLobby = true;
                cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            }

        }
        return;
    },

    onVideo(target, msg) {
        if (this.playerData) { }
    },

    backToLobby: function () {
        if (!this.playerData) {
            return;
        }

        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        var isVideoCurrentlyEnabled = false;
        let uid = Number(this.playerData.playerId.substr(0, 5));
        if (this.isSelf()) {
            isVideoCurrentlyEnabled = !window.MGR_AGORA.isVideoCurrentlyEnabled(this.pokerPresenter.model.gameData.agoraChannelName);
        } else {
            isVideoCurrentlyEnabled = window.MGR_AGORA.isRemoteVideoMuted(uid);
        }
        this.playerData.__muteStateBackToLobby = isVideoCurrentlyEnabled;
        if (this.isSelf()) {
            window.MGR_AGORA.muteLocalVideoStream(true);
            window.MGR_AGORA.muteLocalAudioStream(true);
        } else {
            window.MGR_AGORA.muteRemoteVideoStream(uid, true);
            window.MGR_AGORA.muteRemoteAudioStream(uid, true);
        }
    },

    backFromLobby: function () {
        if (!this.playerData) {
            return;
        }

        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        let uid = Number(this.playerData.playerId.substr(0, 5));
        var isJoined = window.MGR_AGORA.isJoinedChannel(this.pokerPresenter.model.gameData.agoraChannelName);
        if (isJoined) {
            if (this.isSelf()) {
                if (!this.playerData.__muteStateBackToLobby) {
                    window.MGR_AGORA.muteLocalVideoStream(false);
                    window.MGR_AGORA.muteLocalAudioStream(false);
                }
            } else {
                if (!this.playerData.__muteStateBackToLobby) {
                    window.MGR_AGORA.muteRemoteVideoStream(uid, false);
                    window.MGR_AGORA.muteRemoteAudioStream(uid, false);
                }
            }
        } else {
            let agoraVideoRender = this.agoraVideoRender.getComponent("AgoraVideoRender");
            window.MGR_AGORA.localRender = agoraVideoRender;
            window.MGR_AGORA.remoteRenders = [];
            agoraVideoRender.setup(uid, this.pokerPresenter.model.gameData.agoraChannelName);

            let isJoinedChannel = window.MGR_AGORA.isJoined();
            if (isJoinedChannel) {
                window.MGR_AGORA.leaveRoom(
                    K.ServerAddress.agora_appid,
                    this.pokerPresenter.model.gameData.agoraChannelName,
                    "",
                    uid
                );
                this.scheduleOnce(function () {
                    window.MGR_AGORA.joinRoom(
                        K.ServerAddress.agora_appid,
                        this.pokerPresenter.model.gameData.agoraChannelName,
                        this.pokerPresenter.model.gameData.agoraToken,
                        uid
                    );
                }, 0.5);
            } else {
                window.MGR_AGORA.joinRoom(
                    K.ServerAddress.agora_appid,
                    this.pokerPresenter.model.gameData.agoraChannelName,
                    this.pokerPresenter.model.gameData.agoraToken,
                    uid
                );
            }
        }
    },

    leaveRoom: function () {
        if (!K.AgoraEnabled || !this.pokerPresenter.model.roomConfig.liveStreaming) {
            return;
        }

        window.MGR_AGORA.leaveRoom(
            K.ServerAddress.agora_appid,
            this.pokerPresenter.model.gameData.agoraChannelName,
            this.pokerPresenter.model.gameData.agoraToken,
            0
        );

        if (!cc.isValid(this.agoraVideoRender)) {
            return;
        }

        window.MGR_AGORA.localRender = null;
        window.MGR_AGORA.remoteRenders = [];
        let agoraVideoRender = this.agoraVideoRender.getComponent("AgoraVideoRender");
        agoraVideoRender.clear();
    },

    normalCallback() {
        var data = {};
        data.playerId = GameManager.user.playerId;
        data.stackInBB = !GameManager.isBB;
        data.access_token = K.Token.access_token;
        data.isLoggedIn = true;
        ServerCom.pomeloRequest('connector.entryHandler.changeStackInBB', data, function (response) {
            if (response.success) {
                GameManager.user.settings.stackInBB = !GameManager.user.settings.stackInBB;
                GameManager.isBB = GameManager.user.settings.stackInBB;
                GameManager.emit("switchBB");
            }
        }.bind(this), null, 5000, false);
    },

    updatePlayerImageInTable(data) {
        if (this.playerData != null && this.playerData.playerId == data.playerId) {
            this.playerData.imageAvtar = Number(data.imageAvtar) - 1;
            this.playerData.urlImg = GameManager.avatarImages[this.playerData.imageAvtar];
            this.imageLoaded(this.playerData);
        }
    },

    onBestHand(bestHand, lowBestHand = "", board2BestHand = "") {
        console.log("onBestHand", bestHand, board2BestHand);
        if (!GameManager.user.settings.handStrength) {
            return;
        }
        if (this.pokerPresenter.model.gameData.tableDetails.roundName == K.Round.Preflop ||
            this.pokerPresenter.model.gameData.tableDetails.roundName == K.Round.Showdown) {
            return;
        }

        if (!this.isSelf()) {
            return;
        }

        this.bestHandNode.active = true;
        function extractMiddle(str) {
            let afterColon = str.includes(':') ? str.split(':')[0] : str;
            const lastCommaIndex = afterColon.lastIndexOf(',');
            const result = lastCommaIndex === -1 ? afterColon : afterColon.slice(0, lastCommaIndex);
            return result.trim();
        }

        let bg = this.bestHandNode.getChildByName("bg");
        let info = bg.getChildByName("info");

        if (board2BestHand != "") {
            info.getComponent(cc.Label).string = extractMiddle(bestHand) + "," + extractMiddle(board2BestHand);
        } else {
            info.getComponent(cc.Label).string = extractMiddle(bestHand);
            bg.height = 80;
            info.y = 10.803;
        }

        this.applyHandStrengthBar("HandStrenth", extractMiddle(bestHand));
        let handStrenthCopy = this.bestHandNode.getChildByName("HandStrenth copy");
        if (handStrenthCopy) {
            if (board2BestHand != "") {
                handStrenthCopy.active = true;
                this.applyHandStrengthBar("HandStrenth copy", extractMiddle(board2BestHand));
            } else {
                handStrenthCopy.active = false;
            }
        }
    },

    /**
     * @description Enables the hand-strength bar segments (0-9) up to the reached rank
     * @method applyHandStrengthBar
     * @param {String} barNodeName -"HandStrenth" or "HandStrenth copy"
     * @param {String} handName -extracted hand name, e.g. "Two Pair"
     * @memberof Screens.Gameplay.Player.PlayerPresenter#
     */
    applyHandStrengthBar: function (barNodeName, handName) {
        let barNode = this.bestHandNode.getChildByName(barNodeName);
        if (!barNode) {
            console.warn("applyHandStrengthBar: bar node not found", barNodeName);
            return;
        }
        let segmentsRoot = barNode.getChildByName("bg");
        if (!segmentsRoot) {
            console.warn("applyHandStrengthBar: 'bg' segments root not found under", barNodeName);
            return;
        }
        let rank = HAND_STRENGTH_RANK[handName];
        if (rank === undefined) {
            console.warn("applyHandStrengthBar: no rank mapping for hand name", JSON.stringify(handName));
            rank = -1;
        }
        for (let i = 0; i < 10; i++) {
            let segment = segmentsRoot.getChildByName(i + "");
            if (!segment) {
                console.warn("applyHandStrengthBar: segment node not found", i, "under", barNodeName);
                continue;
            }
            segment.active = (i <= rank);
        }
    },

    showWinningChips: function (amount) {
        this.winningChips.string = "+" + GameManager.convertChips(amount);
        if (GameManager.isBB) {
            this.winningChips.string = "+" + (Number(amount) / this.pokerPresenter.model.roomConfig.bigBlind).toFixed(1) + 'BB';
        }

        if (GameManager.isActive) {
            this.winningChips.node.active = true;
            this.winningChips.node.opacity = 0;
            this.winningChips.node.runAction(
                cc.sequence(
                    cc.fadeIn(0.2),
                    cc.delayTime(1),
                    cc.fadeOut(0.3),
                )
            );
        }
        else {
            this.winningChips.node.opacity = 0;
        }
    },

    addChip: function () {
        this.pokerPresenter.onAddChips();
    },

    updateAddChipsBtn: function (players) {
        if (players > 1 && this.playerData && this.playerData.state === K.PlayerState.Playing) {
            this.addChipsNode.active = true;
        } else {
            this.addChipsNode.active = false;
        }
    },

    updateMyMuteState: function (state) {
        this.playerData.__muteStateBackToLobby = state;
    },

    hideBBSBAddChips: function () {
        this.node.getChildByName("BB").active = false;
        this.node.getChildByName("SB").active = false;
        this.addChipsNode.scale = 0;
    },

    onRoundOverBombPotForcedAllIn() {
        this.disPlayMoveUtil(this.playerData.playerName, "ALLIN");
    }
});