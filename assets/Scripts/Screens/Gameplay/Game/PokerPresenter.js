var PokerModelType = require('PokerModel').PokerModel;
var BetBtnUtilType = require('BetBtnUtil');
var PlayerPresenterType = require('PlayerPresenter');
var PopupManagerType = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var card = require('CardTypes').Card;
var suit = require('CardTypes').Suit;
var OptionalPlayerInputManager = require('OptionalPlayerInput');
var PotSplitterType = require('PotSplitter');
var CardDistributerType = require('CardDistributer');
var Checkbox = require('Checkbox');
var SitOutMode = require('PokerModel').SitOutMode;
var prevDelay = 0;
var Toggle = require('Toggle');
const {
    default: bbjWinnerPopupTs
} = require('../../../bbj/bbjWinnerPopupTs');
const {
    default: highHandWinnerTs
} = require('../../../high_hand/highHandWinnerTs');
var LoginData = require('PostTypes').Login;

/**
 * @class PokerPresenter
 * @classdesc This class used to manage all the view(Presentation) in Game!
 * @memberof Screens.Gameplay.Game
 */
cc.Class({
    extends: cc.Component,

    properties: {
        breakAndAddonHolder: {
            default: null,
            type: cc.Node,
        },
        tablePopupHolder: {
            default: null,
            type: cc.Node,
        },
        chatCloseBtn: {
            default: null,
            type: cc.Node
        },
        refundPotTemplate: {
            default: null,
            type: cc.Node,
        },
        commnityCards: {
            default: null,
            type: cc.Node,
        },
        mixedNotice: {
            default: null,
            type: cc.Node,
        },
        reshufflingNotice: {
            default: null,
            type: cc.Node,
        },
        isBombPotGame: {
            default: null,
            type: cc.Node,
        },
        agoraEnvNode: {
            default: null,
            type: cc.Node,
        },
        handidLabel: {
            default: null,
            type: cc.Label,
        },
        bombInfoLabel: {
            default: null,
            type: cc.Label,
        },
        addChipsButton: {
            default: null,
            type: cc.Node,
        },
        realBetBtn: {
            default: null,
            type: cc.Node,
        },
        realRaiseBtn: {
            default: null,
            type: cc.Node,
        },
        gameOptionButton: {
            default: null,
            type: cc.Node,
        },
        gameResultButton: {
            default: null,
            type: cc.Node,
        },
        gameLeaveButton: {
            default: null,
            type: cc.Node,
        },
        model: {
            default: null,
            type: PokerModelType,
        },
        ninePlayerView: {
            default: null,
            type: cc.Prefab,
        },
        eightPlayerView: {
            default: null,
            type: cc.Prefab,
        },
        sevenPlayerView: {
            default: null,
            type: cc.Prefab,
        },
        sixPlayerView: {
            default: null,
            type: cc.Prefab,
        },
        fivePlayerView: {
            default: null,
            type: cc.Prefab,
        },
        fourPlayerView: {
            default: null,
            type: cc.Prefab,
        },
        threePlayerView: {
            default: null,
            type: cc.Prefab,
        },
        twoPlayerView: {
            default: null,
            type: cc.Prefab,
        },
        rightSeatPrefab: {
            default: null,
            type: cc.Prefab,
        },
        leftSeatPrefab: {
            default: null,
            type: cc.Prefab,
        },
        placeholderParent: {
            default: null,
            type: cc.Node,
        },
        callAmountLabel: {
            default: null,
            type: cc.Label,
        },
        playerInputNode: {
            default: null,
            type: cc.Node,
        },
        raisePanelNode: {
            default: null,
            type: cc.Node,
        },

        playerInput: {
            default: [],
            type: cc.Node,
        },
        optionalPlayerInput: {
            default: null,
            type: OptionalPlayerInputManager,
        },

        betBtnSlider: {
            default: null,
            type: BetBtnUtilType,
        },

        cardPrefab: {
            default: null,
            type: cc.Prefab,
        },

        holeCardHolder: {
            default: null,
            type: cc.Node,
        },

        runItTwiceHolder: {
            default: null,
            type: cc.Node,
        },

        holeCardsWithTwiceHolder: {
            default: null,
            type: cc.Node,
        },

        playerHand: {
            default: [],
            type: [PlayerPresenterType],
        },

        potAmount: {
            default: [],
            type: cc.Node,
        },

        gameOverLabel: {
            default: null,
            type: cc.Label,
        },

        potAnimator: {
            default: null,
            type: PotSplitterType,
        },

        cardDistributer: {
            default: null,
            type: CardDistributerType,
        },

        indexOffset: {
            default: 0,
        },
        maxSeatIndex: {
            default: 9,
        },
        selfSeatIndex: {
            default: 5,
        },

        roomNameLbl: {
            default: null,
            type: cc.Label,
        },
        roomNameLbl2: {
            default: null,
            type: cc.Label,
        },
        table: {
            default: null,
            type: cc.Sprite,
        },
        unTiledView: {
            default: null,
            type: cc.Node,
        },
        resumeBtn: {
            default: null,
            type: cc.Node,
        },
        totalPotLbl: {
            default: null,
            type: cc.Label,
        },
        postBigBlindCheckBox: {
            default: null,
            type: Checkbox,
        },
        tournamentTableInfo: {
            default: null,
            type: cc.Node,
        },
        bestHand: {
            default: null,
            type: cc.Label,
        },
        joinBtn: {
            default: null,
            type: cc.Label,
        },
        unjoinBtn: {
            default: null,
            type: cc.Label,
        },
        showRaisePanel: {
            default: null,
            type: cc.Node
        },

        hideRaisePanel: {
            default: null,
            type: cc.Node
        },
        isTournament2: false,

        highHandNode: {
            default: null,
            type: cc.Sprite
        },

        highHandIcons: {
            default: [],
            type: cc.SpriteFrame
        },
    },

    /**
     * If Mobile view then disabling chat pannel when user switches tabs.
     */
    onEnable: function () {
        if (this.model && this.model.roomConfig) {
            if (this.isTournament()) {
                if (this.model.gameData.tourData.tournamentType != "SIT N GO") {
                    var _rawBreakFlag = this.model.gameData.break;
                    var _isBreakActive = _rawBreakFlag ?
                        !!_rawBreakFlag.active :
                        !!this.model.gameData.tourData.isInBreak;
                    console.log('[onEnable] tourData.isInBreak:', this.model.gameData.tourData.isInBreak,
                        '| break.active:', _rawBreakFlag ? _rawBreakFlag.active : 'NO FIELD',
                        '| _isBreakActive:', _isBreakActive,
                        '| tableDetails.state:', this.model.gameData.tableDetails && this.model.gameData.tableDetails.state);
                    if (_isBreakActive) {
                        this.scheduleOnce(() => {
                            GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, this.model.gameData.tourData, null, this.breakAndAddonHolder);
                        }, 0.2);
                    } else {
                        GameManager.popUpManager.remove(PopUpType.TournamentBreakTime, null, this.breakAndAddonHolder);
                        GameManager.popUpManager.remove(PopUpType.TournamentBreakComingSoon, null, this.tablePopupHolder);
                    }
                }
            }
            this.setHighHandIcon();
        }
    },

    /**
     * @description Return the no of Player in the current Table! 
     * @method getNumPlayerInTable
     * @return {Number} -Number of Player
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    getNumPlayerInTable: function () {
        var count = 0;
        this.model.gameData.tableDetails.players.forEach(function (element) {
            if (element.state == K.PlayerState.Playing)
                count++;
        }, this);
        return count;
    },

    /**
     * @description handles btn for stand up and seated player
     * @method manageBtns
     * @param {Object} 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    manageBtns: function (val) {
        if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateSitOutNextHandCheckBox(val);
        }
        this.sitOutNextHandCheckBox = val;

        var playerPresenter = this.getMyPlayer();
        if (playerPresenter && playerPresenter.sitoutNextHand && this.getMyPlayer().state == K.PlayerState.Playing) {
            if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateSitOutNextHandCheckBox(true);
            }
            this.sitOutNextHandCheckBox = true
        }
        if (this.isTournament() || this.model.roomConfig.isAllInAndFold) {
            if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateStraddleCheckBox(false);
            }
            this.straddleCheckBox = false;

            if (this.isTournament()) {
                if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                    GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateSitOutNextHandCheckBox(false);
                }
                this.sitOutNextHandCheckBox = false;
            }
        }
        this.isStraddleAllowed();
        this.checkInBetweenBlinds();
        this.gameResultButton.active = true;
        if (this.isTournament() || this.model.roomConfig.isAllInAndFold) { } else {
            if (playerPresenter) {
                var seat = this.playerHand[this.getRotatedSeatIndex(playerPresenter.seatIndex)];
                if (seat) {
                    seat.updateAddChipsBtn(this.model.gameData.tableDetails.players.length);
                }
            }
        }
    },

    /**
     * @description use this for initialization -  call instantiateSeats() method.
     * @method loadSeats
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    loadSeats: function () {
        if (this.model.roomConfig.maxPlayers == 2) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.twoPlayerView), this.twoPlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 3) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.threePlayerView), this.threePlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 4) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.fourPlayerView), this.fourPlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 5) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.fivePlayerView), this.fivePlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 6) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.sixPlayerView), this.sixPlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 7) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.sevenPlayerView), this.sevenPlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 8) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.eightPlayerView), this.eightPlayerView, "PlayerPresenter");
        } else if (this.model.roomConfig.maxPlayers == 9) {
            this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.ninePlayerView), this.ninePlayerView, "PlayerPresenter");
        }

        // this.instantiateSeats(5, this.model.roomConfig.maxPlayers, cc.instantiate(this.ninePlayerView), this.ninePlayerView, "PlayerPresenter");
    },

    /**
     * @method isSeatAllowed
     * @param {Number} seatIdx -Index to allocate
     * @param {Number} maxSeats - Maximum allowed seats
     * @param {Number} maxSeatsInView -Maximum seats allowed in view.
     * @return {boolean}
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    isSeatAllowed: function (seatIdx, maxSeats, maxSeatsInView) {
        // return true;
        if (seatIdx > 0 && maxSeatsInView == 10) {
            var allowedSeats = [];
            // if (GameManager.isMobile) {
            switch (maxSeats) {
                case 2:
                    allowedSeats = [3, 7];
                    break;
                case 3:
                    allowedSeats = [2, 5, 8];
                    break;
                case 4:
                    allowedSeats = [1, 4, 6, 9];
                    break;
                case 5:
                    allowedSeats = [1, 4, 5, 6, 9];
                    break;
                case 6:
                    allowedSeats = [1, 3, 4, 6, 7, 9];
                    break;
                case 7:
                    allowedSeats = [1, 2, 3, 5, 7, 8, 9];
                    break;
                case 8:
                    allowedSeats = [1, 2, 3, 4, 6, 7, 8, 9];
                    break;
                default:
                    return true;
            }
            if (allowedSeats.indexOf(seatIdx) != -1) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    },
    /**
     * @description It decides the position of user position in game
     * @method getSelfSeatIdx
     * @param {Number} maxSeats -
     * @return {Number}
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    getSelfSeatIdx: function (maxSeats) {
        // if (GameManager.isMobile) {
        switch (maxSeats) {
            case 2:
                return 1;
            case 3:
                return 2;
            case 4:
                return 2;
            case 5:
                return 3;
            case 6:
                if (!GameManager.isMobile) {
                    return 3;
                } else {
                    return 2;
                }
            case 7:
                return 4;
            case 8:
                return 3;
            case 9:
                return 5;
        }
    },

    /**
     * @method instantiateSeats
     * @param {param} selfSeatIndex -
     * @param {param} maxSeatIndex
     * @param {Object} placeHolder -Node where to put/add the child
     * @param {Object} prefab
     * @param {Object} presenter
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    instantiateSeats: function (selfSeatIndex, maxSeatIndex, placeHolder, prefab, presenter) {
        this.placeHolder = placeHolder;
        this.selfSeatIndex = this.getSelfSeatIdx(maxSeatIndex);
        this.maxSeatIndex = (maxSeatIndex);
        this.placeholderParent.addChild(placeHolder);
        var children = placeHolder.children;
        var seatCounter = 0;
        for (var i = 0; i < children.length; i++) {
            if (this.isSeatAllowed(i, maxSeatIndex, children.length)) {
                var seat = null;
                var betPos = null;
                var dealerPos = null;
                if (i < ((children.length) / 2)) {
                    seat = cc.instantiate(this.rightSeatPrefab);
                    prefab = this.rightSeatPrefab;
                } else {
                    seat = cc.instantiate(this.leftSeatPrefab);
                    prefab = this.leftSeatPrefab;
                }
                seat.setPosition(0, 0);
                betPos = children[i].children[0];
                dealerPos = children[i].children[1];
                var playerPresenter = seat.getComponent(presenter);
                playerPresenter.seatIndex = seatCounter;
                playerPresenter.sitHerePanel.active = !(this.isTournament());
                playerPresenter.occupiedPanel.active = !playerPresenter.sitHerePanel.active;

                if (!!betPos) {
                    if (i == 4 || i == 6) {
                        betPos.setPosition(betPos.x, betPos.y);

                        playerPresenter.playerBetLabel.parent.anchorX = 0;
                        playerPresenter.playerBetLabelForAnte.parent.anchorX = 0;
                    } else if (i == 1 || i == 9) {
                        betPos.setPosition(betPos.x, betPos.y);

                        playerPresenter.playerBetLabel.parent.anchorX = 1;
                        playerPresenter.playerBetLabelForAnte.parent.anchorX = 1;
                    } else if (i == 3) {
                        betPos.setPosition(betPos.x, betPos.y);

                        playerPresenter.playerBetLabel.parent.anchorX = 0.5;
                        playerPresenter.playerBetLabelForAnte.parent.anchorX = 0.5;
                    } else if (i == 7) {
                        betPos.setPosition(betPos.x, betPos.y);

                        playerPresenter.playerBetLabel.parent.anchorX = 0.5;
                        playerPresenter.playerBetLabelForAnte.parent.anchorX = 0.5;
                    }
                    playerPresenter.setBetPosition(betPos.getPosition());
                }
                if (!!dealerPos)
                    if (GameManager.isMobile) { }
                    else {
                        dealerPos.setPosition(dealerPos.x / 0.55, dealerPos.y / 0.55);
                    }

                if (i == 4 || i == 6) {
                    if (i == 4) {
                        dealerPos.setPosition(dealerPos.x, dealerPos.y);
                    }
                    if (i == 6) {
                        dealerPos.setPosition(dealerPos.x, dealerPos.y);
                    }
                } else if (i == 1 || i == 9) {
                    if (i == 1) {
                        dealerPos.setPosition(dealerPos.x, dealerPos.y);
                    }
                    if (i == 9) {
                        dealerPos.setPosition(dealerPos.x, dealerPos.y);
                    }
                } else if (i == 3) {
                    dealerPos.setPosition(dealerPos.x, dealerPos.y);
                } else if (i == 7) {
                    dealerPos.setPosition(dealerPos.x, dealerPos.y);
                }
                playerPresenter.setDealerPosition(dealerPos.getPosition());

                if (this.model.roomConfig.maxPlayers == 8) {
                    if (!!betPos) {

                        if (i == 4 || i == 6 || i == 7) {
                            if (i == 6) {
                                betPos.setPosition(betPos.x - 60, betPos.y + 20);
                            } else if (i == 7) {
                                betPos.setPosition(betPos.x - 40, betPos.y);
                            } else if (i == 4) {
                                betPos.setPosition(betPos.x - 60, betPos.y);
                            }

                            playerPresenter.playerBetLabel.parent.anchorX = 0;
                            playerPresenter.playerBetLabelForAnte.parent.anchorX = 0;

                        } else if (i == 1 || i == 2 || i == 9) {
                            if (i == 1) {
                                betPos.setPosition(betPos.x + 60, betPos.y + 20);
                            } else if (i == 9) {
                                betPos.setPosition(betPos.x + 40, betPos.y);
                            } else if (i == 2) {
                                betPos.setPosition(betPos.x + 60, betPos.y);
                            }

                            playerPresenter.playerBetLabel.parent.anchorX = 1;
                            playerPresenter.playerBetLabelForAnte.parent.anchorX = 1;
                        } else if (i == 3) {
                            betPos.setPosition(betPos.x, betPos.y);

                            playerPresenter.playerBetLabel.parent.anchorX = 0.5;
                            playerPresenter.playerBetLabelForAnte.parent.anchorX = 0.5;
                        } else if (i == 8) {
                            betPos.setPosition(betPos.x, betPos.y);

                            playerPresenter.playerBetLabel.parent.anchorX = 0.5;
                            playerPresenter.playerBetLabelForAnte.parent.anchorX = 0.5;
                        }
                        playerPresenter.setBetPosition(betPos.getPosition());
                    }
                    if (!!dealerPos)
                        if (GameManager.isMobile) { }
                        else {
                            dealerPos.setPosition(dealerPos.x / 0.55, dealerPos.y / 0.55);
                        }

                    if (i == 4 || i == 6 || i == 7) {
                        if (i == 4) {
                            dealerPos.setPosition(dealerPos.x, dealerPos.y);
                        }
                        if (i == 6) {
                            dealerPos.setPosition(dealerPos.x, dealerPos.y);
                        }
                        if (i == 7) {
                            dealerPos.setPosition(dealerPos.x, dealerPos.y);
                        }
                    } else if (i == 1 || i == 2 || i == 9) {
                        if (i == 1) {
                            dealerPos.setPosition(dealerPos.x, dealerPos.y);
                        }
                        if (i == 2) {
                            dealerPos.setPosition(dealerPos.x, dealerPos.y);
                        }
                        if (i == 9) {
                            dealerPos.setPosition(dealerPos.x, dealerPos.y);
                        }
                    } else if (i == 3) {
                        dealerPos.setPosition(dealerPos.x, dealerPos.y);
                    } else if (i == 8) {
                        dealerPos.setPosition(dealerPos.x, dealerPos.y);
                    }
                    playerPresenter.setDealerPosition(dealerPos.getPosition());
                }

                if (this.selfSeatIndex == playerPresenter.seatIndex) {
                    this.addChipsButton = playerPresenter.addChipsNode;
                    if (GameManager.isMobile) {
                        if (GameManager.isShorter()) {
                            seat.scale = 1.1;
                        } else {
                            seat.scale = 1.1;
                        }
                    } else {
                        seat.scale = 0.6;

                        cc.find("HandSitHere", seat).scale = 1.0;
                        cc.find("HandReserve", seat).scale = 1.0;
                        cc.find("HandEmpty", seat).scale = 1.0;
                    }

                    if (GameManager.isMobile) {
                        if (GameManager.isShorter()) {
                            if (maxSeatIndex == 2 && i == 3) {
                                seat.y += 55;
                                cc.find("HandSitHere", seat).y -= 55;
                                cc.find("HandReserve", seat).y -= 55;
                                cc.find("HandEmpty", seat).y -= 55;
                            }
                        }
                        if (GameManager.isZFold()) {
                            if (maxSeatIndex == 2 && i == 3) {
                                seat.y += 55;
                                cc.find("HandSitHere", seat).y -= 55;
                                cc.find("HandReserve", seat).y -= 55;
                                cc.find("HandEmpty", seat).y -= 55;
                            }
                        }
                    }

                } else {
                    if (GameManager.isMobile) {
                        if (GameManager.isShorter() || GameManager.isZFold()) {
                            seat.scale = 1.066;
                        } else {
                            seat.scale = 1.18;
                        }
                        if (GameManager.isShorter()) {
                            if (children[i].x < -50) {
                                seat.x -= 45;
                            } else if (children[i].x > 50) {
                                seat.x += 45;
                            }

                            if ((maxSeatIndex == 8 && i == 8) ||
                                (maxSeatIndex == 6 && i == 7) ||
                                (maxSeatIndex == 4 && i == 9)) {
                                cc.find("HandSitHere", seat).y += 65;
                                cc.find("HandReserve", seat).y += 65;
                                cc.find("HandEmpty", seat).y += 65;
                            }

                            if (maxSeatIndex == 2 && i == 3) {
                                seat.y += 55;
                            }
                        }

                        if (GameManager.isZFold()) {
                            if ((maxSeatIndex == 8 && i == 8) ||
                                (maxSeatIndex == 6 && i == 7) ||
                                (maxSeatIndex == 4 && i == 9)) {
                                cc.find("HandSitHere", seat).y -= 30;
                                cc.find("HandReserve", seat).y -= 30;
                                cc.find("HandEmpty", seat).y -= 30;
                            }
                        }
                    } else {
                        seat.scale = 0.6;

                        cc.find("HandSitHere", seat).scale = 1.0;
                        cc.find("HandReserve", seat).scale = 1.0;
                        cc.find("HandEmpty", seat).scale = 1.0;
                    }
                }


                children[i].addChild(seat);
                seatCounter++;
            }
        }

        this.playerHand = placeHolder.getComponentsInChildren(PlayerPresenterType);
        this.playerHand.forEach(function (element) {
            element.pokerPresenter = this;
        }, this);
        if (!!this.betBtnSlider)
            this.betBtnSlider.pokerPresenter = this;
        this.setDealer();
    },

    /**
     * @method resetGame 
     * @description Resets Game
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    resetGame: function () {
        if (this.node.getChildByName("winnerBannerBg")) {
            this.node.getChildByName("winnerBannerBg").active = false;
        }
        this.totalPotLbl.node.parent.getChildByName("potBomb").active = false;
        this.checkInBetweenBlinds();
        this.hideMoves();
        this.muckHand = false;
        if (GameManager.popUpManager.isPopupActive(PopUpType.InGamePreferencesPopup, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.InGamePreferencesPopup, this.tablePopupHolder).getComponent("InGamePreferencesPopup").muckHandCheckbox.node.parent.active = false;
        }

        this.playerHand.forEach((element, i) => {
            element.hideWinningAnim();
        }, this);

        this.manageBtns(!this.model.isPlayerStandUp() && this.getMyPlayer().state == K.PlayerState.Playing);
        if (!this.model.isPlayerStandUp() && this.getMyPlayer().state == K.PlayerState.Playing) {
            this.resumeBtn.active = false;
        }
    },

    resetGameForReshuffle: function (isRejoin = false, isReshuffle = false) {
        if (isRejoin) {
            cc.director.getActionManager().removeAllActions();
            this.mixedNotice.stopAllActions();
            this.mixedNotice.active = false;
            this.reshufflingNotice.active = false;
            this.playerHand.forEach((element, i) => {
                element.hideWinningAnim();
            }, this);
            this.model.gameModel.removeBroadcastCallbacks(this.model.gameData.channelId);
            this.cardDistributer.clearTimers();
            this.killTimers();
        }
        this.cardDistributer.clearTimers();
        if (this.node.getChildByName("winnerBannerBg")) {
            this.node.getChildByName("winnerBannerBg").active = false;
        }
        this.checkInBetweenBlinds();
        this.hideMoves();
        this.clearHoleCards();
        this.handleSitOutBtns(true);
        this.resetView();
        this.muckHand = false;
        if (GameManager.popUpManager.isPopupActive(PopUpType.InGamePreferencesPopup, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.InGamePreferencesPopup, this.tablePopupHolder).getComponent("InGamePreferencesPopup").muckHandCheckbox.node.parent.active = false;
        }
        if (this.placeHolder) {
            this.placeHolder.removeFromParent(true);
            this.placeHolder = null;
        }
    },

    onLoad: function () {
        this.ignoreNextGameStart = false;
        this.startGameTimer = null;

        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);

        this.checkForWindowScene = false;
        if (cc.sys.os === cc.sys.OS_WINDOWS && !cc.sys.isBrowser) {
            this.checkForWindowScene = true;
        }

        this.timersToKill = [];
        this.preCheckCounter = 0;
        this._potSplitTasks = [];
        this._pendingPotGroups = null;
        this._potSplitSettled = true;
        this.CardStartingPositionOnTable = 226;
        this.CardsPositionOffset = 108;
        this.winnerBannerDeactivateTimerDelay = 1.3;
        this.potDistributionTimerDelay = 1;
        this.potSplitterMoveActionDelay = 0.6;
        this.runItTwiceLowerCardDelay = 0.5;
        this.runItTwiceSlideToOpenDelay = .3;
        this.playerInput[0].active = false;

        this._onLeaveChatChannel = this.onLeaveChatChannel.bind(this);

        GameManager.off("LEAVE_CHAT_CHANNEL", this._onLeaveChatChannel);
        GameManager.on("LEAVE_CHAT_CHANNEL", this._onLeaveChatChannel);

        this._onTournamentAddonPeriodOver = this.onTournamentAddonPeriodOver.bind(this);

        GameManager.off("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);
        GameManager.on("TournamentAddonPeriodOver", this._onTournamentAddonPeriodOver);

        this._onTournamentAddonPeriodStart = this.onTournamentAddonPeriodStart.bind(this);
        GameManager.off("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);
        GameManager.on("TournamentAddonPeriodStart", this._onTournamentAddonPeriodStart);

        this._onJoinNewTable = this.onJoinNewTable.bind(this);
        GameManager.off("onJoinNewTable", this._onJoinNewTable);
        GameManager.on("onJoinNewTable", this._onJoinNewTable);

        this._onCancelReserveSeat = this.onCancelReserveSeat.bind(this);
        GameManager.off("cancelReserveSeat", this._onCancelReserveSeat);
        GameManager.on("cancelReserveSeat", this._onCancelReserveSeat);

        GameManager.on("updateTableImage", this.onUpdateTableImage.bind(this));
        GameManager.on("switchBB", this.switchBBNow.bind(this));
        GameManager.on("removeTable", this.onRemoveTable.bind(this));
        GameManager.on("handStrengthOff", this.onHandStrengthOff.bind(this));

        this._onToLobby = this.onToLobby.bind(this);
        GameManager.off("onToLobby", this._onToLobby);
        GameManager.on("onToLobby", this._onToLobby);

        cc.systemEvent.on("bombPotTimer", this.onBombPotTimerStarted.bind(this));
        cc.systemEvent.on("bombPotAnimation", this.onBombPotAnimation.bind(this));

        this._onUpdateWaitingPlayers = this.onUpdateWaitingPlayers.bind(this);
        GameManager.off("updateWaitingPlayers", this._onUpdateWaitingPlayers);
        GameManager.on("updateWaitingPlayers", this._onUpdateWaitingPlayers);

        this.model.on('leaveNextHand', this.onleaveNextHand.bind(this));
        this.model.on(K.PokerEvents.OnJoin, this.onJoinSuccess.bind(this));
        this.model.on(K.PokerEvents.OnHoleCard, this.addHoleCard.bind(this));
        this.model.on(K.PokerEvents.OnSit, this.sitSuccess.bind(this));
        this.model.on(K.PokerEvents.OnBlindDeduction, this.deductBlind.bind(this));
        this.model.on(K.PokerEvents.OnPlayerStateChange, this.playerStateChange.bind(this));
        this.model.on(K.PokerEvents.OnGamePlayers, this.resetGame.bind(this));
        this.model.on(K.PokerEvents.OnStartGame, this.startGame.bind(this));
        this.model.on(K.PokerEvents.OnTurn, this.nextTurn.bind(this));
        this.model.on(K.PokerEvents.OnRoundOver, this.roundOver.bind(this));
        this.model.on(K.PokerEvents.OnGameOver, this.gameOver.bind(this));
        this.model.on(K.PokerEvents.OnLeave, this.playerLeft.bind(this));
        this.model.on(K.PokerEvents.OnChat, this.chat.bind(this));
        this.model.on(K.PokerEvents.OnPlayerCard, this.playerCards.bind(this));
        this.model.on(K.PokerEvents.onPlayerStandUp, this.onStandUp.bind(this));
        this.model.on(K.PokerEvents.onRotateView, this.rotateView.bind(this));
        this.model.on(K.PokerEvents.OnClearHoleCards, this.clearTable.bind(this));
        this.model.on(K.PokerEvents.onPreCheck, this.onPreCheck.bind(this));
        this.model.on(K.PokerEvents.onPlayerCoins, this.onPlayerCoins.bind(this));
        this.model.on(K.PokerEvents.onTimeBank, this.onTimeBank.bind(this));
        this.model.on('rebuyActivated', this.onRebuyActivated.bind(this));
        this.model.on('rebuyDeactivated', this.onRebuyDeactivated.bind(this));
        this.model.on(K.PokerEvents.onChannelEvent, this.showWinnerCards.bind(this));
        this.model.on("revealAllInCards", this.showAllInCards.bind(this));
        this.model.on("refundChips", this.onRefundChips.bind(this));
        this.model.on("returnUncalledBet", this.onReturnUncalledBet.bind(this));
        this.model.on(K.PokerEvents.OnBankrupt, function (data) {
            if (this.isTournament()) return;
            this.model.sitOutValue = SitOutMode.None;
            this.onAddChips(this.model.roomConfig.minBuyIn);
        }.bind(this));
        this.model.on("ReservedState", function (data) {
            let arg = (data.extraAntiBankCase) ? "extraAntiBankCase" : this.model.roomConfig.minBuyIn;
            this.onAddChips(arg, undefined, data.extraAntiBankCase);
        }.bind(this));
        this.model.on("clearTimers", function (data) {
            this.killTimers();
        }.bind(this));
        this.tempOnLoad();

        GameManager.on("socket_disconnected", () => {
            GameManager.popUpManager.remove(PopUpType.BuyInPopup, function () { }, this.tablePopupHolder);
        });

        GameManager.on("openBuyInPopup", function (response) {
            if (!!this.model && response == this.model.gameData.channelId && !this.isTournament()) {
                var data = {};
                data.minValue = this.model.roomConfig.minBuyIn;
                data.maxValue = this.model.roomConfig.maxBuyIn;
                const text_chips = "Available Chips" + ':';
                if (GameManager.user.category == "DIAMOND") {
                    data.totalChips = GameManager.user.realChips;
                    data.dialogHeadingText = text_chips;
                } else {
                    data.totalChips = GameManager.user.freeChips;
                    data.dialogHeadingText = text_chips;
                }
                data.dialogHeadingText = text_chips;
                data.autoBuyIn = GameManager.user.autoBuyIn;
                data.index = response.seatIndex;
                data.confirm = this.onBuyInConfirm.bind(this);
                data.onSitHere = true;
                data.channelId = this.model.gameData.channelId;
                data.playerStandUp = this.model.isPlayerStandUp();
                data.isRealMoney = this.model.roomConfig.isRealMoney;
                data.isAllInAndFold = this.model.roomConfig.isAllInAndFold;
                data.config = this.model.roomConfig;
                if (this.isTournament()) {
                    data.autoConfirm = true;
                } else {
                    data.autoConfirm = this.model.roomConfig.extraAntiBankCase;
                }
                data.topHeading = "Buy In";
                data.playSound = this.playAudio.bind(this);
                GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);
            }
        }.bind(this));

        GameManager.on("waiting_List_Event", function (channelId, flag) {
            if (!!this.model && this.model.gameData.channelId == channelId) {
                this.model.gameData.isJoinWaiting = flag;
                this.enableJoinBtn();
            }
        }.bind(this));
        this.postBigBlindCheckBox.registerCallback(this.onPostBigBlind.bind(this));
        GameScreen.node.on("grid-refreshed", this.checkNotification.bind(this));

        this.singleTime = false;
        GameManager.on("connectionAcknowledged", function (data) {
            if (!!this.model && data == this.model.gameData.channelId) {
                this.hideMoves();
            }
        }.bind(this));

        this.scheduleOnce(() => {
            if (this.isObserver2()) {
                this.chatCloseBtn.active = false;
            }
            else {
                this.chatCloseBtn.active = true;
            }

            GameManager.emit("updateTableBgImage");
            this.gameResultButton.active = true;
            if (this.isTournament()) {
                var _sOnceTourRaw = this.model.gameData.tourData;
                var _sOnceDetails = this.model.gameData.tableDetails;
                var _sOnceIsOnBreak = _sOnceTourRaw.isInBreak || _sOnceDetails.isOnBreak;
                var _sOnceChannelBreak = this.model.gameData && this.model.gameData['break'];
                var _sOnceBreakActive = _sOnceChannelBreak ?
                    !!_sOnceChannelBreak.active :
                    (_sOnceDetails.state !== K.GameState.Running);
                console.log('[onLoad-singleTime] isInBreak:', _sOnceTourRaw.isInBreak,
                    '| isOnBreak:', _sOnceDetails.isOnBreak,
                    '| break.active:', _sOnceChannelBreak ? _sOnceChannelBreak.active : 'NO FIELD',
                    '| tableDetails.state:', _sOnceDetails.state,
                    '| _sOnceBreakActive:', _sOnceBreakActive);
                if (_sOnceTourRaw.tournamentType != "SIT N GO" && _sOnceIsOnBreak && _sOnceBreakActive) {
                    if (!_sOnceTourRaw.isInBreak && _sOnceDetails.breakEnds) {
                        _sOnceTourRaw.isInBreak = true;
                        _sOnceTourRaw.currentBreakDetails = {
                            breakEndTime: _sOnceDetails.breakEnds
                        };
                    }
                    GameManager.popUpManager.remove(PopUpType.TournamentBreakComingSoon, null, this.tablePopupHolder);
                    GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, _sOnceTourRaw, null, this.breakAndAddonHolder);
                } else if (_sOnceTourRaw.isInRebuy) {
                    this.onRebuyActivated(this.model.gameData.tourData.currentRebuy || {
                        "rebuyTimer": parseInt((this.model.gameData.tourData.currentRebuy.rebuyEndTime - Date.now()) / 1000)
                    });
                }

                if (this.model.addOn) {
                    if (this.model.addOn.active) {

                        if (this.model.addOn.showPopup && !this.isObserver()) {
                            GameManager.popUpManager.showIn(PopUpType.AddOnPopup, this.model.addOn, null, this.tablePopupHolder);
                        }
                        GameManager.popUpManager.showIn(PopUpType.RebuyAddOnCountdown, {
                            'timeRemaining': this.model.addOn.timeRemaining * 1000,
                            'isObserver': this.isObserver(),
                            'pokerPresenter': this.node
                        }, null, this.breakAndAddonHolder);
                    }
                }
                GameManager.emit("showJoinSimlar");
                var _td = this.model && this.model.gameData && this.model.gameData.tableDetails;
                var _effectiveStartTime = GameManager.tableStartTime;
                if (_effectiveStartTime == 0 && _td && _td.tournamentStartTime) {
                    _effectiveStartTime = _td.tournamentStartTime;
                }
                if (_effectiveStartTime) {
                    var now = new Date().getTime();
                    if (_effectiveStartTime > now) {
                        GameManager.popUpManager.showIn(PopUpType.TournamentAboutTostart, {
                            endTime: _effectiveStartTime
                        }, null, this.tablePopupHolder);
                    }
                }
            }
            ServerCom.forceKeepLoading = false;
        }, 1);

        this.onUpdateTableImage();
        ServerCom.pomeloBroadcast("jackpotWin", this.showJackpotWin.bind(this));
        ServerCom.pomeloBroadcast("highHandUpdate", this.showHighHandWin.bind(this));
        this.getHighHandStatus(null);
    },

    updateBlind: function () {
        if (this.tournamentTableInfo) {
            var tti = this.tournamentTableInfo.getComponent("TournamentTableInfo");
            if (tti) tti.refresh();
        }
    },

    start() {
        this.isBombPotGame.active = false;
    },

    checkNotification: function () {
        if (!!(this.playerInput) && this.unTiledView.active && ((this.playerInput[0].active) && GameManager.activeTableCount >= 1)) {
            this.model.emit(K.PokerEvents.onTurnInOtherRoom, this.model, true);
        }

    },

    /**
     * @method onTimeBank
     * @description It's enable/disable TimeBank
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onTimeBank: function (data) {
        var playerPresenter = this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.currentMoveIndex)];
        if (!!data && !!this.selfLastMoveData && data.playerId === this.model.gameData.playerId) {
            if (!!this.optionalPlayerInput) {
                this.optionalPlayerInput.selectedValue = null;
            }
            this.enableSelfTurn(playerPresenter, this.selfLastMoveData);
        }
        playerPresenter.enableTimeBank();
    },

    tempOnLoad: function () { },
    onDestroy2: function () {
        GameManager.off("LEAVE_CHAT_CHANNEL", this._onLeaveChatChannel);
    },

    onDestroy: function () {
        this.model.removeAllListeners();
        this.killTimers();
        if (this.tablePopupHolder) {
            GameManager.popUpManager.removePopupsIn(this.tablePopupHolder);
        }
        if (this.isTournament()) {
            GameManager.popUpManager.remove(PopUpType.TournamentInGameInfo, null, this.tablePopupHolder);
        }
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
    },

    /**
     * @description Set seatIndex offset for rotating the seats
     * @param {Number} desiredIndex -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    setIndexOffset: function (desiredIndex) {
        this.indexOffset = desiredIndex - this.selfSeatIndex;
    },

    /**
     * @description Get the rotatedSeatIndex
     * @param {Number} seatIndex
     * @returns: rotatedSeatIndex
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    getRotatedSeatIndex: function (seatIndex) {
        var index = 0;
        index = seatIndex - this.indexOffset;
        if (index < 1) {
            index = index + this.maxSeatIndex;
        }
        if (index > this.maxSeatIndex) {
            index = index - this.maxSeatIndex;
        }
        return index;
    },

    /**
     * @description Called when a player's turn come.
     * @method enableCurrentPlayerTurn
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    enableCurrentPlayerTurn: function () {
        if (this.model.gameData.tableDetails.currentMoveIndex !== -1) {
            this.displayPots();
            var playerPresenter = this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.currentMoveIndex)];
            var remainingMoveTime = this.model.gameData.tableDetails.remainingMoveTime;
            if (playerPresenter.playerData &&
                playerPresenter.playerData.state === K.PlayerState.Disconnected &&
                remainingMoveTime > 0) {
                playerPresenter.onDisconnectTime(remainingMoveTime);
                this.model.startDisconnectTimerTick(remainingMoveTime);
                playerPresenter.reconnectionTimer.node.active = true;
                playerPresenter.reconnectionTimer.string = Math.ceil(remainingMoveTime);
                playerPresenter.startReconnectionCountdown(Math.ceil(remainingMoveTime));
            } else {
                playerPresenter.onTurn(this.model.gameData.tableDetails.turnTime);
                if (this.checkForSelfTurn(playerPresenter.playerData.playerId)) {
                    this.selfLastMoveData = playerPresenter.playerData.moves;
                    this.enableSelfTurn(playerPresenter, playerPresenter.playerData.moves);
                } else {
                    this.model.emit(K.PokerEvents.onTurnInOtherRoom, this.model, false);
                }
            }
        }
    },
    /**
     * @method setDealer
     * @description set Dealer position
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    setDealer: function () {
        this.playerHand.forEach(function (element) {
            element.setDealer(false);
        }, this);
        if (this.model.gameData.tableDetails.dealerIndex >= 0) {
            this.getPlayerBySeat(this.model.gameData.tableDetails.dealerIndex).setDealer(true);
        }
    },

    /**
     * @method placeDummyCards
     * @description place the dummy card in specified position
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    placeDummyCards: function (id = null) {
        for (var index = 0; index < this.playerHand.length; index++) {
            if (this.playerHand[index].playerData != null && !this.playerHand[index].playerData.isPartOfGame) {
                continue;
            }
            if (this.model.gameData.tableDetails.canApplyBombPot) {
                if (this.model.roomConfig.channelVariation == "Bomb Pot 5") {
                    this.playerHand[index].displayDummyCards(5, id);
                } else if (this.model.roomConfig.channelVariation == "Bomb Pot 6") {
                    this.playerHand[index].displayDummyCards(6, id);
                } else {
                    this.playerHand[index].displayDummyCards(4, id);
                }
            } else {
                if (this.model.roomConfig.channelVariation == "Mixed Game") {
                    if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Texas Hold’em') {
                        this.playerHand[index].displayDummyCards(2, id);
                    } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Omaha') {
                        this.playerHand[index].displayDummyCards(4, id);
                    } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Omaha 5') {
                        this.playerHand[index].displayDummyCards(5, id);
                    } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Omaha 6') {
                        this.playerHand[index].displayDummyCards(6, id);
                    } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Big O') {
                        this.playerHand[index].displayDummyCards(5, id);
                    }
                } else {
                    this.playerHand[index].displayDummyCards(this.model.dummyCardsCount, id);
                }
            }
        }
    },

    enableAgoraWhenSit: function () {
        var selfIndex = this.model.getPlayerById(this.model.gameData.playerId);
        if (selfIndex != -1) {
            for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
                var playerIndex = this.model.getPlayerById(this.model.gameData.tableDetails.players[index].playerId);
                if (playerIndex != -1) {
                    this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].backFromLobby();
                }
            }
        }
    },
    /**
     * @description Updates the seat view
     * @param {array} playerData
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    allocateSeat: function () {
        // seat players based on seat index 
        for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
            this.getPlayerByIdx(index).playerData = this.model.gameData.tableDetails.players[index];
            this.getPlayerByIdx(index).enablePlayerView(this.model.gameData.playerId);

            if (this.model.gameData.playerId == this.getPlayerByIdx(index).playerData.playerId) {
                this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(index).playerData.seatIndex)].enableAgoraWhenSit(true);
            }
        }
        if (this.model.gameData.tableDetails.state === K.GameState.Running) {
            this.enableCurrentPlayerTurn();
            this.placeDummyCards(this.model.gameData.playerId);
            for (var fi = 0; fi < this.playerHand.length; fi++) {
                var pp = this.playerHand[fi];
                if (pp.playerData && pp.playerData.state == K.PlayerState.Playing && pp.playerData.lastMove == "FOLD") {
                    pp.cardHolder.children.forEach(function (element) {
                        element.getComponent('Card').gray();
                    });
                    pp.cardHolderMy.children.forEach(function (element) {
                        element.getComponent('Card').gray();
                    });
                }
            }
            this.setDealer();
            this.enablePrecheckAfterRetry();
        }
    },
    enablePrecheckAfterRetry: function () {
        if (this.model.gameData.tableDetails.currentMoveIndex !== -1) {
            var playerPresenter = this.getMyPlayer();
            if (!!playerPresenter) {
                if (playerPresenter.seatIndex == this.model.gameData.tableDetails.currentMoveIndex) { } else {
                    let state = playerPresenter.state;
                    if (playerPresenter.chips < 0 || state == K.PlayerState.Waiting || state == K.PlayerState.OutOfMoney || state == K.PlayerState.OnBreak || state == K.PlayerState.Reserved || playerPresenter.lastMove == K.PlayerState.AllIn || playerPresenter.lastMove == K.PlayerState.Fold) { } else {
                        let data = {
                            channelId: playerPresenter.channelId,
                            playerId: playerPresenter.playerId,
                            set: playerPresenter.preCheck,
                            precheckValue: playerPresenter.precheckValue,
                            route: "preCheck"
                        }
                        this.onPreCheck(data);
                    }
                }
            }
        }
    },
    /**
     * @method getPlayerByIdx
     * @return {Number}
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    getPlayerByIdx: function (idx) {
        return this.getPlayerBySeat(this.model.gameData.tableDetails.players[idx].seatIndex);
    },

    /**
     * @method getPlayerBySeat
     * @param {Number} 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    getPlayerBySeat: function (seatIdx) {
        return this.playerHand[this.getRotatedSeatIndex(seatIdx)];
    },

    isObserver: function () {
        if (!this.isTournament()) return false;
        if (!this.model.gameData || !this.model.gameData.tableDetails) return false;
        for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
            if (this.model.gameData.tableDetails.players[index].playerId === GameManager.user.playerId) {
                return false;
            }
        }
        return true;
    },

    isObserver2: function () {
        if (!this.model.gameData || !this.model.gameData.tableDetails) return false;
        for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
            if (this.model.gameData.tableDetails.players[index].playerId === GameManager.user.playerId) {
                return false;
            }
        }
        return true;
    },


    /**
     * @description Event handler for OnJoin Event
     * @param {Object} tableData
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onJoinSuccess: function (data) {
        this.preCheckCounter = 0;
        this.muckHand = false;
        if (GameManager.popUpManager.isPopupActive(PopUpType.InGamePreferencesPopup, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.InGamePreferencesPopup, this.tablePopupHolder).getComponent("InGamePreferencesPopup").muckHandCheckbox.node.parent.active = false;
        }
        this.loadSeats();
        this.clearPots();
        this.enableTempPlayerInput(false);
        var selfIndex = this.model.getPlayerById(this.model.gameData.playerId);
        this.onJoinExtras();
        this.tempOnJoinSuccess();
        this.enableJoinBtn();
        if (selfIndex !== -1) {
            this.model.gameData.isJoinWaiting = false;
            for (var index = 0; index < this.playerHand.length; index++) {
                if (this.playerHand[index].seatState === K.SeatState.Free) {
                    this.playerHand[index].disableView();
                }
            }
            if (this.getMyPlayer().state == K.PlayerState.Playing || this.getMyPlayer().state == K.PlayerState.OnBreak) {
                this.rotateView({
                    seatIndex: this.model.gameData.tableDetails.players[selfIndex].seatIndex
                });
            } else {
                this.allocateSeat();
            }
            if (this.model.gameData.tableDetails.players[selfIndex].state === K.PlayerState.OnBreak) {
                this.handleSitOutBtns(false);
            }
            this.manageBtns(!this.model.isPlayerStandUp() && this.getMyPlayer().state == K.PlayerState.Playing);
        } else {
            this.allocateSeat();
            this.manageBtns(false);
        }

        this.handleRunItTwice(true, true, this.model.gameData.isRunItTwice);
        if (this.model.gameData.bestHands !== "") {
            if (this.getMyPlayer() !== null) {
                this.getMyPlayer().bestHand = this.model.gameData.bestHands;
                this.getMyPlayer().lowBestHand = this.model.gameData.lowBestHand;
                this.getMyPlayer().board2BestHand = this.model.gameData.board2BestHand;
            }
            this.onBestHand();
        }

        if (this.agoraEnvNode) {
            this.agoraEnvNode.active = K.AgoraEnabled && this.model.roomConfig.liveStreaming;
        }

        let players = this.model.gameData.tableDetails.players;
        for (var index = 0; index < players.length; index++) {
            var presenter = this.playerHand[this.getRotatedSeatIndex(players[index].seatIndex)];
            presenter.node.getChildByName("BB").active = false;
            presenter.node.getChildByName("SB").active = false;
            presenter.node.getChildByName("BB2").active = false;
            presenter.node.getChildByName("SB2").active = false;

            if (players[index].seatIndex == data.tableDetails.bigBlindIndex) {
                presenter.node.getChildByName("BB").active = true;
            } else if (players[index].seatIndex == data.tableDetails.smallBlindIndex) {
                presenter.node.getChildByName("SB").active = true;
            }
        }

        if (this.isTournament()) {
            if (this.isObserver()) {
                for (var index = 0; index < this.playerHand.length; index++) {
                    if (this.playerHand[index].seatState === K.SeatState.Free) {
                        this.playerHand[index].disableView();
                    }
                }
            }
        }

        if (this.isTournament()) {
            cc.find("TableName", this.node).active = true;
        }

        if (this.model.gameData.seatsReserved) {
            for (var i = 0; i < this.model.gameData.seatsReserved.length; i++) {
                this.playerHand[this.getRotatedSeatIndex(this.model.gameData.seatsReserved[i].seatIndex)].enableReservedView();
            }
        }

        if (this.isObserver2()) {
            this.chatCloseBtn.active = false;
        }
        else {
            this.chatCloseBtn.active = true;
        }
    },


    tempOnJoinSuccess: function () { },

    /**
     * @method enableJoinBtn
     * @description enable/disable / set string value on join button accordingly.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    enableJoinBtn: function () {
        var isTour = this.isTournament();

        if (this.model.gameData.isJoinWaiting) {
            this.joinBtn.node.parent.parent.active = false;
            this.unjoinBtn.node.parent.parent.active = true;

        } else {
            this.unjoinBtn.node.parent.parent.active = false;
        }

        this.joinBtn.node.parent.parent.active = !isTour && this.getMyPlayer() == null && this.model.gameData.tableDetails.players.length == this.model.roomConfig.maxPlayers;

        if (this.joinBtn.node.parent.parent.active) {
            this.joinBtn.node.parent.getChildByName('position').getChildByName('th').getComponent(cc.Label).string = this.model.gameData.waitingListCount;
            if (this.model.gameData.isJoinWaiting) {
                this.joinBtn.node.parent.parent.parent.getChildByName('FindGame').active = false;
            } else {
                this.joinBtn.node.parent.parent.parent.getChildByName('FindGame').active = true;
            }
        } else {
            this.joinBtn.node.parent.parent.parent.getChildByName('FindGame').active = false;
        }
    },
    /**
     * @method onJoinWaitingListBtnClick
     * @description Change the string value of Join Button.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onJoinWaitingListBtnClick: function () {
        this.playAudio(K.Sounds.click);
        var flag = this.joinBtn.node.parent.getChildByName("tick").active;
        TableHandler.joinWaitingList(true, this.model.gameData.channelId, function (response) {
            if (response.success) {
                GameManager.emit("waiting_List_Event", response.channelId, true);

                function getOrdinalSuffix(n) {
                    const j = n % 10,
                        k = n % 100;
                    if (j === 1 && k !== 11) return "st";
                    if (j === 2 && k !== 12) return "nd";
                    if (j === 3 && k !== 13) return "rd";
                    return "th";
                }
                this.unjoinBtn.node.parent.getChildByName('position').getChildByName('pos').getComponent(cc.Label).string = 'My Position ' + response.queuePosition;
                this.unjoinBtn.node.parent.getChildByName('position').getChildByName('th').getComponent(cc.Label).string = getOrdinalSuffix(response.queuePosition);
            } else {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, response.info, function () { });
            }
        }.bind(this), function (error) { });
    },

    updateQueueIndex: function (queuePosition) {
        function getOrdinalSuffix(n) {
            const j = n % 10,
                k = n % 100;
            if (j === 1 && k !== 11) return "st";
            if (j === 2 && k !== 12) return "nd";
            if (j === 3 && k !== 13) return "rd";
            return "th";
        }

        this.unjoinBtn.node.parent.getChildByName('position').getChildByName('pos').getComponent(cc.Label).string = 'My Position ' + queuePosition;
        this.unjoinBtn.node.parent.getChildByName('position').getChildByName('th').getComponent(cc.Label).string = getOrdinalSuffix(queuePosition);
    },

    onUnJoinWaitingListBtnClick: function () {
        this.playAudio(K.Sounds.click);
        var flag = this.joinBtn.node.parent.getChildByName("tick").active;
        TableHandler.joinWaitingList(false, this.model.gameData.channelId, function (response) {
            if (response.success) {
                GameManager.emit("waiting_List_Event", response.channelId, false);
            }
        }.bind(this), function (error) { });
    },

    updateBombPotTimer: function () {
        this.unschedule(this.bombPotTimer);
        if (this.model.gameData.tableDetails.bombPotRemainingTime > 0) {
            this.bombPotTimer();
            this.schedule(this.bombPotTimer, 1);
        } else {
            this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + GameManager.formatRemainingSeconds(0) + " minutes";
        }
    },

    bombPotTimer() {
        this.model.gameData.tableDetails.bombPotRemainingTime -= 1;
        if (this.model.gameData.tableDetails.bombPotRemainingTime <= 0) {
            this.unschedule(this.bombPotTimer);
            this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + GameManager.formatRemainingSeconds(0) + " minutes";
        } else {
            this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + GameManager.formatRemainingSeconds(this.model.gameData.tableDetails.bombPotRemainingTime) + " minutes";
        }
    },

    /**
     * @method onJoinExtras
     * @description 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onJoinExtras: function () {
        if (!this.model.gameData || !this.model.gameData || !this.model.gameData.tableDetails) {
            if (this.bombInfoLabel) this.bombInfoLabel.node.active = false;
            return;
        }
        if (this.model.gameData.tableDetails.hasBombPot) {
            this.bombInfoLabel.node.active = true;
            if (this.model.gameData.tableDetails.bombPotDurationType == "hands") {
                if (this.model.roomConfig.channelVariation == 'Bomb Pot 5' ||
                    this.model.roomConfig.channelVariation == 'Bomb Pot 6') {
                    this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB";
                } else {
                    this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + this.model.gameData.tableDetails.currentBombPotHand + "/" + this.model.gameData.tableDetails.bombPotDuration + " hands";
                }
            } else {
                this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + GameManager.formatRemainingSeconds(this.model.gameData.tableDetails.bombPotRemainingTime) + " minutes";
                this.updateBombPotTimer()
            }
        } else {
            this.bombInfoLabel.node.active = false;
        }

        if (this.model.gameData.tableDetails.canApplyBombPot) {
            this.totalPotLbl.node.parent.getChildByName("potBomb").active = true;
        } else {
            this.totalPotLbl.node.parent.getChildByName("potBomb").active = false;
        }

        if (this.roomNameLbl) {
            this.roomNameLbl.string = GameManager.getVariName(this.model.roomConfig.channelVariation, this.model.gameData.tableDetails.canApplyBombPot);
            if (this.isTournament()) {
                if (this.model.gameData.tourData.tournamentType != "SIT N GO") {
                    this.roomNameLbl.string = "MTT";
                } else {
                    this.roomNameLbl.string = this.model.gameData.tourData.stageName;
                }
                if (this.handidLabel) this.handidLabel.node.active = false;
                if (this.tournamentTableInfo) {
                    var tti = this.tournamentTableInfo.getComponent("TournamentTableInfo");
                    if (tti) tti.setData(this);
                }
            } else {
                if (this.handidLabel) {
                    this.handidLabel.node.active = true;
                    this.handidLabel.string = "ID: " + (this.model.gameData.tableDetails.roundId ? this.model.gameData.tableDetails.roundNumber : "N/A");
                }
            }

            if (this.model.roomConfig.channelVariation == "Mixed Game") {
                this.roomNameLbl.string = GameManager.getVariNameForMixedGame(this.model.gameData.tableDetails.currentMixedGameVariant, this.model.gameData.tableDetails.canApplyBombPot);
            }
            let stakes = GameManager.convertChips(this.model.roomConfig.smallBlind) + "/" + GameManager.convertChips(this.model.roomConfig.bigBlind);
            if (!this.isTournament()) {
                this.roomNameLbl2.string = "Blinds: " + stakes;
            }

        }
        this.playerInput[0].active = false;

        if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionStraddleCheckBox(false);
        }
        this.straddleCheckBoxSelection = false;
        this.checkInBetweenBlinds(true);
    },


    /**
     * @method onSitHere
     * @description Makes the player sit on the seat
     * @param {Number} index -Index of seat
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onSitHere: function (index) {
        var data = {};
        data.minValue = this.model.roomConfig.minBuyIn;
        data.maxValue = this.model.roomConfig.maxBuyIn;
        const text_chips = "Available Chips" + ':';
        if (GameManager.user.category == "DIAMOND") {
            data.totalChips = GameManager.user.realChips;
            data.dialogHeadingText = text_chips;
        } else {
            data.totalChips = GameManager.user.freeChips;
            data.dialogHeadingText = text_chips;
        }
        data.dialogHeadingText = text_chips;
        data.autoBuyIn = GameManager.user.autoBuyIn;
        data.index = index;
        data.confirm = this.onBuyInConfirm.bind(this);
        data.onSitHere = true;
        data.channelId = this.model.gameData.channelId;
        data.playerStandUp = this.model.isPlayerStandUp();
        data.isRealMoney = this.model.roomConfig.isRealMoney;
        data.isAllInAndFold = this.model.roomConfig.isAllInAndFold;
        data.config = this.model.roomConfig;
        if (this.isTournament()) {
            data.autoConfirm = true;
        } else {
            data.autoConfirm = this.model.roomConfig.extraAntiBankCase;
        }
        data.topHeading = "Buy In";
        data.playSound = this.playAudio.bind(this);

        ServerCom.pomeloRequest('room.channelHandler.reserveSeat', {
            "channelId": this.model.gameData.channelId,
            "playerId": this.model.gameData.playerId,
            "seatIndex": index,
            "isRequested": true
        }, function (response) {
            if (response.success) {
                if (response.autoSeated) { } else {
                    data.secondsRemaining = response.secondsRemaining;
                    if (data.autoConfirm) {
                        this.onBuyInConfirm(data.index, data.minValue.toString());
                    } else {
                        GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);
                    }
                }
            } else {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, response.info, function () { });
                data.secondsRemaining = response.secondsRemaining;
                if (data.autoConfirm) {
                    this.onBuyInConfirm(data.index, data.minValue.toString());
                } else {
                    GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);
                }
            }
        }.bind(this), null, 5000, false);
    },

    onSitHereNew: function (index, secondsRemaining) {
        this.unjoinBtn.node.parent.parent.active = false;
        if (this.isTournament()) {
            return;
        }
        var data = {};
        data.minValue = this.model.roomConfig.minBuyIn;
        data.maxValue = this.model.roomConfig.maxBuyIn;
        const text_chips = "Available Chips" + ':';
        if (GameManager.user.category == "DIAMOND") {
            data.totalChips = GameManager.user.realChips;
            data.dialogHeadingText = text_chips;
        } else {
            data.totalChips = GameManager.user.freeChips;
            data.dialogHeadingText = text_chips;
        }
        // if (GameManager.isMobile) {
        data.dialogHeadingText = text_chips;
        // }

        data.autoBuyIn = GameManager.user.autoBuyIn;
        data.index = index;
        data.confirm = this.onBuyInConfirm.bind(this);
        data.onSitHere = true;
        data.channelId = this.model.gameData.channelId;
        data.playerStandUp = this.model.isPlayerStandUp();
        data.isRealMoney = this.model.roomConfig.isRealMoney;
        data.isAllInAndFold = this.model.roomConfig.isAllInAndFold;
        data.config = this.model.roomConfig;
        if (this.isTournament()) {
            data.autoConfirm = true;
        } else {
            data.autoConfirm = this.model.roomConfig.extraAntiBankCase;
        }
        data.topHeading = "Buy In";
        data.playSound = this.playAudio.bind(this);
        data.secondsRemaining = secondsRemaining;
        GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);
    },

    /**
     * @method onBuyInConfirm
     * @description Mehtod called when user select a seat and then confirm BuyIn Amount
     * @param {Number} index - Seat Index
     * @param {Number} amount - BuyIn Amount
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onBuyInConfirm: function (index, amount) {
        this.model.sitHere(index, amount, function () { }.bind(this));
    },

    onLeaveNextHand: function () {
        this.model.leaveNextHand(function (response) { }.bind(this));
    },
    /**
     * @method onSitOutNextHand
     * @description called when sitOutNextHand is selected.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onSitOutNextHand: function () {
        if (this.model.sitOutValue == SitOutMode.None) {
            this.model.sitOutNextHand(function (response) {
                this.handleSitoutResponse(response);
            }.bind(this));

        } else if (this.model.sitOutValue == SitOutMode.SitOueNextBB) {
            this.onResetSitout(function (callback) {
                if (callback) {
                    this.model.sitOutNextHand(function (response) {
                        this.handleSitoutResponse(response);
                    }.bind(this));
                }
            }.bind(this));
        } else if (this.model.sitOutValue == SitOutMode.SitOutNextHand) {
            if (this.getMyPlayer() != null && this.getMyPlayer().state == K.PlayerState.OnBreak) {
                this.onResume();
            } else {
                this.onResetSitout(function () { }.bind(this));
            }
        }
        this.handleRunItTwice();
    },
    /**
     * @method handleSitoutResponse
     * @description Disable sitOutNextBigBlind CheckBox when sitOutNextHand is selected!
     * @param {Object} response -Data Received from Server
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    handleSitoutResponse: function (response) {
        if (response.success) {
            if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionSitOutNextHandCheckBox(true);
            }
            this.sitOutNextHandCheckBoxSelection = true;
        } else {
            if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionSitOutNextHandCheckBox(false);
            }
            this.sitOutNextHandCheckBoxSelection = false;
        }
    },
    /**
     * @method onSitOutNextBB
     * @description called when sitOutNextBigBlind is selected
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onSitOutNextBB: function () {
        if (this.model.sitOutValue == SitOutMode.None) {

            this.model.sitOutNextBB(function (response) {
                this.handleSitoutBBResponse(response);
            }.bind(this));
        } else if (this.model.sitOutValue == SitOutMode.SitOueNextBB) {

            if (this.getMyPlayer() != null && this.getMyPlayer().state == K.PlayerState.OnBreak) {
                this.onResume();
            } else {
                this.onResetSitout(function () { }.bind(this));
            }
        }
        this.handleRunItTwice();
    },

    /**
     * @method checkSitoutStatus
     * @description local level status of sitout btns 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    checkSitoutStatus: function () {
        if (this.model.gameData.channelType == K.ChannelType.Tournament || this.model.isPlayerStandUp()) { } else {
            switch (this.model.sitOutValue) {
                case SitOutMode.SitOutNextHand:
                    if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                        GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionSitOutNextHandCheckBox(true);
                    }
                    this.sitOutNextHandCheckBoxSelection = true;
                    break;
                case SitOutMode.SitOueNextBB:
                    if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                        GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionSitOutNextHandCheckBox(false);
                    }
                    this.sitOutNextHandCheckBoxSelection = false;
                    break;
                case SitOutMode.None:
                    if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                        GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionSitOutNextHandCheckBox(false);
                    }
                    this.sitOutNextHandCheckBoxSelection = fals;
                    e
                    break;
            }
        }
    },

    onResetSitout: function (callback) {
        this.model.resetSitout(function (response) {
            if (callback != null) {
                callback(response.success);
                if (response.success) {
                    this.handleSitOutBtns(true);
                }
            }
        }.bind(this));
    },

    /**
     * @method onAddChipsConfirm
     * @description Called form buyIn popup when amout is confiremed
     * @param {Number} index -SeatIndex
     * @param {Number} amount - BuyIn Amout
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onAddChipsConfirm: function (index, amount) {
        this.model.addChips(amount, function () { });

    },
    /**
     * @method onResume
     * @description called when a player in sitOut mode and then select to sit in on the table.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onResume: function () {
        this.playAudio(K.Sounds.click)
        this.resumeBtn.active = false;
        this.resumeBtn.active = false;
        this.model.resume(function () {
            // this.resumeBtn.active = false;
            this.handleSitOutBtns(true);
            var playerPresenter = this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.currentMoveIndex)];
            if (playerPresenter.playerData && this.model.gameData.tableDetails.state === K.GameState.Running) {
                if (this.model.gameData.tableDetails.currentMoveIndex !== -1) {
                    if (this.checkForSelfTurn(playerPresenter.playerData.playerId)) {
                        this.enableSelfTurn(playerPresenter, playerPresenter.playerData.moves);
                    } else {
                        this.model.emit(K.PokerEvents.onTurnInOtherRoom, this.model, false);
                    }
                }
            }
        }.bind(this));
    },
    /**
     * @method onResumeAll 
     * @description called when sitall button is selected
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onResumeAll: function () {
        this.playAudio(K.Sounds.click)
        GameScreen.resumeAll();
    },

    /**
     * @method onStraddle
     * @description CallBack for straddle button
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onStraddle: function (selection) {
        this.straddleCheckBoxSelection = selection;
        this.model.setStraddleSelection(selection);
    },
    /**
     * @method onPostBigBlind
     * @description callBack for onPostBigBlind checkBox
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onPostBigBlind: function () {
        var selection = this.postBigBlindCheckBox.getSelection();
        this.model.setPostBigBlind(selection);

        if (selection) {
            this.postBigBlindCheckBox.node.parent.getChildByName("message").active = false;
        } else {
            this.postBigBlindCheckBox.node.parent.getChildByName("message").active = true;
        }
    },
    /**
     * @method onRunItTwice 
     * @description callback for runItTwice checkBox
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onRunItTwice: function () { },
    /**
     * @method handleRunItTwice
     * @description Handles run it twice checkbox
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    handleRunItTwice: function (forceVal = true, forceSelection = false, showSelection = false) { },

    /**
     * @method onAddChips
     * @description this is called only when the button is clicked 
     * @param {Number} minVal - minimum value that must be added in order to add chips.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onAddChips: function (minVal, joinWaitingCase = false, extraAntiBankCase) {
        // console.error(2, minVal)
        if (!this.model.isPlayerStandUp() || joinWaitingCase) {
            var data = {};
            var playerChips = 0;
            if (!joinWaitingCase) {
                playerChips = (this.model.roomConfig.channelVariation === "Open Face Chinese Poker") ? this.model.getMyPlayer().points : this.model.getMyPlayer().chips;
            }
            data.minValue = this.model.roomConfig.originalMinBuyIn - playerChips;
            data.maxValue = this.model.roomConfig.originalMaxBuyIn - playerChips;

            if (data.minValue < 1) {
                data.minValue = 1;
            }

            if (extraAntiBankCase == false) {

                data.minValue = this.model.roomConfig.minBuyIn - playerChips;
                data.maxValue = this.model.roomConfig.maxBuyIn - playerChips
            }

            if (this.model.gameData.antibanking.isAntiBanking && this.model.roomConfig.minBuyIn < this.model.gameData.antibanking.amount) {

            }

            if (joinWaitingCase) {
                data.minValue = this.model.roomConfig.minBuyIn - playerChips;
                data.maxValue = this.model.roomConfig.maxBuyIn - playerChips
            }

            if (this.model.roomConfig.originalMaxBuyIn < playerChips) {
                data.maxValue = 0;
                data.minVal = 0;
            }
            const text_chips = "Available Chips" + ':';
            if (GameManager.user.category == "DIAMOND") {
                data.totalChips = GameManager.user.realChips;
                data.dialogHeadingText = text_chips;
            } else {
                data.totalChips = GameManager.user.freeChips;
                data.dialogHeadingText = text_chips;
            }
            data.dialogHeadingText = text_chips;
            data.autoBuyIn = GameManager.user.autoBuyIn;
            data.index = this.model.getPlayerById(this.model.gameData.playerId);
            data.confirm = this.onAddChipsConfirm.bind(this);
            data.onSitHere = false;
            data.cancelCallback = this.onCancelBuyIn.bind(this);
            data.playerStandUp = this.model.isPlayerStandUp();
            data.channelId = this.model.gameData.channelId;
            data.isRealMoney = this.model.roomConfig.isRealMoney;
            data.topHeading = "Add Chips";
            data.playSound = this.playAudio.bind(this);
            data.config = this.model.roomConfig;
            if (joinWaitingCase) {
                data.topHeading = "Buy In";
            } else {
                data.isAddChips = true;
            }
            if (minVal === "extraAntiBankCase") {
                this.onAddChipsConfirm(data.index, (this.model.roomConfig.minBuyIn - playerChips).toString());
            } else {
                GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);
            }
        }
        this.playAudio(K.Sounds.click);
    },
    /**
     * @method onCancelBuyIn
     * @description cancel button callback
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onCancelBuyIn: function () {
        if ((!!this.model.getMyPlayer()) && this.model.getMyPlayer().state == K.PlayerState.Reserved) {
            GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] = false;
            this.standUp();
        }
        if (this.model.getMyPlayer().state != K.PlayerState.Playing) {
            this.resumeBtn.active = true;
            if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateSitOutNextHandCheckBox(false);
            }
            this.sitOutNextHandCheckBox = false;
        }
    },

    /**
     * @method onAllIn
     * @description Send user action - allin to server
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onAllIn: function () {
        this.model.makeMove("0", K.PlayerMove.AllIn);
        this.hideMoves();
        this.playAudio(K.Sounds.click);
    },

    /**
     * @method onCheck 
     * @description  Send user action - check to server
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onCheck: function (data, custom) {
        this.model.makeMove("0", K.PlayerMove.Check);
        this.hideMoves();
        if (custom == "checkAction") {
            this.onCloseSureToFold();
            this.playAudio(K.Sounds.click);
        }

    },

    /**
     * @method onBet 
     * @description onBetBtn callback, send user action to server
     * @param {Number} amont - Betting Amont
     * @param {Number} action - 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onBet: function (amount, action) {
        this.model.makeMove(amount, action);
        this.hideMoves();
    },

    /**
     * @method onFold
     * @description Fold Button Callback
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onFold: function (data, custom) {
        if (this.sureToFold && custom != "confirmAction") {
            GameManager.popUpManager.showIn(PopUpType.SureToFoldPopup, this.node, null, this.tablePopupHolder);
            GameManager.emit("hideJoinSimlar");
            return;
        }
        this.model.makeMove("0", K.PlayerMove.Fold);
        this.hideMoves();
        if (custom == "confirmAction") {
            this.onCloseSureToFold();
            this.playAudio(K.Sounds.click);
        }
    },
    /**
     * @method onCloseSureToFold
     * @description Close Button Callback
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onCloseSureToFold: function () {
        GameManager.popUpManager.remove(PopUpType.SureToFoldPopup, null, this.tablePopupHolder);
        GameManager.emit("showJoinSimlar");
    },

    /**
     * @method onCall
     * @description  callBtn callBack
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onCall: function () {
        this.model.makeMove("0", K.PlayerMove.Call);
        this.hideMoves();
    },


    /**
     * @method leaveTable 
     * @description leaveButton callBack
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    leaveTable: function (data, c) {
        this.playAudio(K.Sounds.click);
        if (GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] === false) {
            GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] = true;
        }

        // this.unscheduleAllCallbacks();
        let cb = function () {
            for (var index = 0; index < this.playerHand.length; index++) {
                this.playerHand[index].clearPlayerCards();
            }
            this.clearHoleCards();
            this.clearPots();
        }
        this.model.leave(this.isObserver());
    },

    /**
     * @method onLeaveTableClicked called when player clicks on Leave button on Table 
     * @description onleaveButtonClicked callBack
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onLeaveTableClicked: function (data) {
        if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
            if (GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").leaveNextHandTag.active) {
                GameManager.popUpManager.show(PopUpType.NotificationPopup, "You will leave the game after this hand.", function () { });
                return;
            }
        }

        if (this.getMyPlayer() != null) {
            if (this.getMyPlayer().state == K.PlayerState.Playing) {
                GameManager.popUpManager.showIn(PopUpType.SureToLeavePopup, {
                    "info": 'Are you sure you want to leave the table?\nIf you leave the table your current hand will be folded.',
                    "pokerPresenter": this.node
                }, null, this.tablePopupHolder);
            } else {
                GameManager.popUpManager.showIn(PopUpType.SureToLeavePopup, {
                    "info": 'Are you sure you want to leave the table?',
                    "pokerPresenter": this.node
                }, null, this.tablePopupHolder);
            }
        } else {
            this.leaveTable();
        }
    },


    leaveTournament: function () { },

    /**
     * @method standUp
     * @description  Stand up from current seat
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    standUp: function () {
        this.model.leave(true);
    },

    /**
     * @method onSettingsBtn 
     * @description Enable InGamePreferencesPopUp(Setting) popUp in game
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onSettingsBtn: function () {
        GameManager.popUpManager.showIn(PopUpType.InGamePreferencesPopup, this.node, null, this.tablePopupHolder);
        this.playAudio(K.Sounds.click);
    },

    onInfoBtn: function () {
        if (!this.isTournament()) {
            var data = {};
            data.playSound = this.playAudio.bind(this);
            data.info = this.model.roomConfig
            GameManager.popUpManager.showIn(PopUpType.GameInfoPopup, data, null, this.tablePopupHolder);
            this.playAudio(K.Sounds.click);
        }
    },
    /**
     * @method onSettingsBtnClose 
     * @description Hides Prefereneces PopUp 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onSettingsBtnClose: function () { },

    runFlopCardsAction: function (card, index, board = 1, delayBeforeAction = 0) {
        let delayBeforeMoveRight = 0.8;
        let moveToPositionTime = 0.25;

        let cardPlaceHolder0 = cc.find("placeHolder/board" + board + "/1", this.commnityCards);
        let cardPlaceHolder = cc.find(("placeHolder/board" + board + "/" + index), this.commnityCards);
        card.position = cardPlaceHolder0.position;
        card.opacity = 0;
        card.runAction(
            cc.sequence(
                cc.delayTime(delayBeforeAction),
                cc.callFunc(() => {
                    card.opacity = 255;
                }),
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    card.getComponent('Card').flipWithAction();
                }),
                cc.delayTime(delayBeforeMoveRight),
                cc.moveTo(moveToPositionTime, cardPlaceHolder.x, cardPlaceHolder.y)
            )
        );
    },

    runTurnCardAction: function (card, index, board = 1, delayBeforeAction = 0) {
        let delayBeforeReveal = 0.5;
        let cardPlaceHolder = cc.find(("placeHolder/board" + board + "/" + index), this.commnityCards);
        card.position = cardPlaceHolder.position;
        card.opacity = 0;
        card.runAction(
            cc.sequence(
                cc.delayTime(delayBeforeAction),
                cc.callFunc(() => {
                    card.opacity = 255;
                }),
                cc.delayTime(delayBeforeReveal),
                cc.callFunc(() => {
                    card.getComponent('Card').flipWithAction();
                })
            )
        );
    },

    runCardMoveRITAction: function (card, index, delayBeforeAction = 0) {
        let moveToPositionTime = 0.5;
        let cardPlaceHolder = cc.find(("placeHolder/board1/" + index), this.commnityCards);
        let cardPlaceHolder2 = cc.find(("placeHolder/board2/" + index), this.commnityCards);
        card.runAction(
            cc.sequence(
                cc.delayTime(delayBeforeAction),
                cc.spawn(
                    cc.scaleTo(moveToPositionTime, cardPlaceHolder2.scale),
                    cc.moveTo(moveToPositionTime, cardPlaceHolder2.x, cardPlaceHolder2.y)
                )
            )
        );
    },

    runRiverCardAction: function (card, index, board = 1, delayBeforeAction = 0) {
        let delayBeforeReveal = 0.5;
        let cardPlaceHolder = cc.find(("placeHolder/board" + board + "/" + index), this.commnityCards);
        card.position = cardPlaceHolder.position;
        card.opacity = 0;
        card.runAction(
            cc.sequence(
                cc.delayTime(delayBeforeAction),
                cc.callFunc(() => {
                    card.opacity = 255;
                }),
                cc.delayTime(delayBeforeReveal),
                cc.callFunc(() => {
                    card.getComponent('Card').flipWithAction();
                })
            )
        );
    },

    countCards: function (cards) {
        let count = 0;
        for (var i = 0; i < cards[0].length; i++) {
            if (cards[0][i] != null) {
                count += 1;
            }
        }
        for (var i = 0; i < cards[1].length; i++) {
            if (cards[1][i] != null) {
                count += 1;
            }
        }
        return count;
    },

    addCommnityCards: function (cards, ifAnimateHoleCards) {
        let hasDoubleBoard = (this.model.gameData.tableDetails.canApplyBombPot && this.model.gameData.tableDetails.hasDoubleBoard);
        if (hasDoubleBoard && this.model.roomConfig.maxPlayers == 8) {
            this.commnityCards.scale = 0.75;
        } else {
            this.commnityCards.scale = 0.8;
        }
        if (GameManager.isActive) { } else {
            ifAnimateHoleCards = false;
        }

        let cardsInBoard = this.countCards(cards);
        let revealCardCountsInArea = cc.find("realHolder", this.commnityCards).children.length;

        if (cardsInBoard == 0 || cardsInBoard == revealCardCountsInArea) {
            return;
        }

        if (this.model.gameData.tableDetails.roundName == null) {
            return;
        }
        if (this.model.gameData.tableDetails.roundName == K.Round.Preflop) {
            return;
        }
        if (this.model.gameData.tableDetails.roundName == K.Round.Showdown && cc.find("realHolder", this.commnityCards).children.length == 5) {
            return;
        }

        if (!ifAnimateHoleCards) {
            if (hasDoubleBoard) {
                for (var i = 0; i < cards[0].length; i++) {
                    let cardData = cards[0][i];
                    let card = this.generateCommnityCard(cardData);
                    let cardPlaceHolder = null;
                    cardPlaceHolder = cc.find(("placeHolder/board1/" + (i + 1)), this.commnityCards);
                    card.parent = cc.find("realHolder", this.commnityCards);
                    card.getComponent("Card").reveal(true);
                    card.position = cardPlaceHolder.position;
                }
                for (var i = 0; i < cards[1].length; i++) {
                    let cardData = cards[1][i];
                    let card = this.generateCommnityCard(cardData);
                    let cardPlaceHolder = null;
                    cardPlaceHolder = cc.find(("placeHolder/board3/" + (i + 1)), this.commnityCards);
                    card.parent = cc.find("realHolder", this.commnityCards);
                    card.getComponent("Card").reveal(true);
                    card.position = cardPlaceHolder.position;
                }
            } else {
                let revealCardCounts = cc.find("realHolder", this.commnityCards).children.length;
                let count = this.countCards(cards);
                if (count <= 5) {
                    for (var i = 0; i < cards[0].length; i++) {
                        let cardData = cards[0][i];
                        let card = this.generateCommnityCard(cardData);
                        card.parent = cc.find("realHolder", this.commnityCards);
                        let cardPlaceHolder = cc.find(("placeHolder/board1/" + (i + 1)), this.commnityCards);
                        card.position = cardPlaceHolder.position;
                        card.getComponent("Card").reveal(true);
                    }
                } else {
                    // RIT
                    for (var i = 0; i < cards[0].length; i++) {
                        let cardData = cards[0][i];
                        let card = this.generateCommnityCard(cardData);
                        let cardPlaceHolder = null;
                        cardPlaceHolder = cc.find(("placeHolder/board2/" + (i + 1)), this.commnityCards);
                        card.parent = cc.find("realHolder", this.commnityCards);
                        card.getComponent("Card").reveal(true);
                        card.position = cardPlaceHolder.position;
                        card.scale = cardPlaceHolder.scale;
                    }
                    for (var i = 0; i < cards[1].length; i++) {
                        let cardData = cards[1][i];
                        if (cards[1][i] != null) {
                            let card = this.generateCommnityCard(cardData);
                            let cardPlaceHolder = null;
                            cardPlaceHolder = cc.find(("placeHolder/board1/" + (i + 1)), this.commnityCards);
                            card.parent = cc.find("realHolder", this.commnityCards);
                            card.getComponent("Card").reveal(true);
                            card.position = cardPlaceHolder.position;
                            card.scale = cardPlaceHolder.scale;
                        }
                    }
                }
            }
            return;
        }

        if (this.model.gameData.tableDetails.roundName == K.Round.Flop) {
            for (var i = 0; i < cards[0].length; i++) {
                let cardData = cards[0][i];
                let card = this.generateCommnityCard(cardData);
                card.parent = cc.find("realHolder", this.commnityCards);
                this.runFlopCardsAction(card, i + 1, 1);
            }

            if (hasDoubleBoard) {
                for (var i = 0; i < cards[1].length; i++) {
                    let cardData = cards[1][i];
                    let card = this.generateCommnityCard(cardData);
                    card.parent = cc.find("realHolder", this.commnityCards);
                    this.runFlopCardsAction(card, i + 1, 3);
                }
            }
        }
        if (this.model.gameData.tableDetails.roundName == K.Round.Turn) {
            let cardData = cards[0][3];
            let card = this.generateCommnityCard(cardData);
            card.parent = cc.find("realHolder", this.commnityCards);
            this.runTurnCardAction(card, 4, 1);

            if (hasDoubleBoard) {
                let cardData2 = cards[1][3];
                let card2 = this.generateCommnityCard(cardData2);
                card2.parent = cc.find("realHolder", this.commnityCards);
                this.runTurnCardAction(card2, 4, 3);
            }
        }
        if (this.model.gameData.tableDetails.roundName == K.Round.River) {
            let cardData = cards[0][4];
            let card = this.generateCommnityCard(cardData);
            card.parent = cc.find("realHolder", this.commnityCards);
            this.runRiverCardAction(card, 5, 1);

            if (hasDoubleBoard) {
                let cardData2 = cards[1][4];
                let card2 = this.generateCommnityCard(cardData2);
                card2.parent = cc.find("realHolder", this.commnityCards);
                this.runRiverCardAction(card2, 5, 3);
            }
        }
        if (this.model.gameData.tableDetails.roundName == K.Round.Showdown) {
            if (hasDoubleBoard) {
                let revealCardCounts = cc.find("realHolder", this.commnityCards).children.length;
                let is22 = (revealCardCounts == 6) ? true : false;
                let is11 = (revealCardCounts == 8) ? true : false;
                if (is22) {
                    let cardData = cards[0][3];
                    let card = this.generateCommnityCard(cardData);
                    card.parent = cc.find("realHolder", this.commnityCards);
                    this.runTurnCardAction(card, 4, 1);

                    let cardData2 = cards[1][3];
                    let card2 = this.generateCommnityCard(cardData2);
                    card2.parent = cc.find("realHolder", this.commnityCards);
                    this.runTurnCardAction(card2, 4, 3);

                    let cardData3 = cards[0][4];
                    let card3 = this.generateCommnityCard(cardData3);
                    card3.parent = cc.find("realHolder", this.commnityCards);
                    this.runRiverCardAction(card3, 5, 1, 1.5);

                    let cardData4 = cards[1][4];
                    let card4 = this.generateCommnityCard(cardData4);
                    card4.parent = cc.find("realHolder", this.commnityCards);
                    this.runRiverCardAction(card4, 5, 3, 1.5);
                } else if (is11) {
                    let cardData3 = cards[0][4];
                    let card3 = this.generateCommnityCard(cardData3);
                    card3.parent = cc.find("realHolder", this.commnityCards);
                    this.runRiverCardAction(card3, 5, 1);

                    let cardData4 = cards[1][4];
                    let card4 = this.generateCommnityCard(cardData4);
                    card4.parent = cc.find("realHolder", this.commnityCards);
                    this.runRiverCardAction(card4, 5, 3);
                } else {
                    // 5/5
                    for (var i = 0; i < 3; i++) {
                        let cardData = cards[0][i];
                        let card = this.generateCommnityCard(cardData);
                        card.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card, i + 1, 1);
                    }

                    for (var i = 0; i < 3; i++) {
                        let cardData = cards[1][i];
                        let card = this.generateCommnityCard(cardData);
                        card.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card, i + 1, 3);
                    }

                    let cardData = cards[0][3];
                    let card = this.generateCommnityCard(cardData);
                    card.parent = cc.find("realHolder", this.commnityCards);
                    this.runTurnCardAction(card, 4, 1, 2.5);

                    let cardData2 = cards[1][3];
                    let card2 = this.generateCommnityCard(cardData2);
                    card2.parent = cc.find("realHolder", this.commnityCards);
                    this.runTurnCardAction(card2, 4, 3, 2.5);

                    let cardData3 = cards[0][4];
                    let card3 = this.generateCommnityCard(cardData3);
                    card3.parent = cc.find("realHolder", this.commnityCards);
                    this.runRiverCardAction(card3, 5, 1, 1.5 + 2.5);

                    let cardData4 = cards[1][4];
                    let card4 = this.generateCommnityCard(cardData4);
                    card4.parent = cc.find("realHolder", this.commnityCards);
                    this.runRiverCardAction(card4, 5, 3, 1.5 + 2.5);
                }
            } else {
                let revealCardCounts = cc.find("realHolder", this.commnityCards).children.length;

                let runItTwiceCaseRunning = (cards[1].length > 0 && cards[1].some(function (el) {
                    return el !== null;
                })) ? true : false;

                if (!runItTwiceCaseRunning) {
                    // NO RIT
                    let is5 = (revealCardCounts == 0) ? true : false;
                    let is1 = (revealCardCounts == 4) ? true : false;
                    let is2 = (revealCardCounts == 3) ? true : false;
                    if (is5) {
                        console.log("addCommnityCards", "NO RIT +5");

                        let cardData1 = cards[0][0];
                        let card1 = this.generateCommnityCard(cardData1);
                        card1.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card1, 1, 1);

                        let cardData2 = cards[0][1];
                        let card2 = this.generateCommnityCard(cardData2);
                        card2.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card2, 2, 1);

                        let cardData3 = cards[0][2];
                        let card3 = this.generateCommnityCard(cardData3);
                        card3.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card3, 3, 1);

                        let cardData4 = cards[0][3];
                        let card4 = this.generateCommnityCard(cardData4);
                        card4.parent = cc.find("realHolder", this.commnityCards);
                        this.runTurnCardAction(card4, 4, 1, 2.5);

                        let cardData5 = cards[0][4];
                        let card5 = this.generateCommnityCard(cardData5);
                        card5.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card5, 5, 1, 4);

                    } else if (is1) {
                        console.log("addCommnityCards", "NO RIT +1");

                        let cardData5 = cards[0][4];
                        let card5 = this.generateCommnityCard(cardData5);
                        card5.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card5, 5, 1);
                    } else if (is2) {
                        console.log("addCommnityCards", "NO RIT +2");

                        let cardData4 = cards[0][3];
                        let card4 = this.generateCommnityCard(cardData4);
                        card4.parent = cc.find("realHolder", this.commnityCards);
                        this.runTurnCardAction(card4, 4, 1);

                        let cardData5 = cards[0][4];
                        let card5 = this.generateCommnityCard(cardData5);
                        card5.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card5, 5, 1, 1.5);
                    }
                } else {
                    // RIT
                    let is55 = (revealCardCounts == 0) ? true : false;
                    let is322 = (revealCardCounts == 3) ? true : false;
                    let is411 = (revealCardCounts == 4) ? true : false;

                    if (this.node.getChildByName("winnerBannerBg")) {
                        let tmp = this.node.getChildByName("winnerBannerBg");
                        tmp.active = true;
                        // tmp.width = 400;
                        tmp.getChildByName("winningText").getComponent(cc.Label).string = "Running it Twice...";
                    }

                    if (is55) {
                        console.log("addCommnityCards", "RIT 0 +5/5");

                        let cardData1 = cards[0][0];
                        let card1 = this.generateCommnityCard(cardData1);
                        card1.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card1, 1, 1);

                        let cardData2 = cards[0][1];
                        let card2 = this.generateCommnityCard(cardData2);
                        card2.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card2, 2, 1);

                        let cardData3 = cards[0][2];
                        let card3 = this.generateCommnityCard(cardData3);
                        card3.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card3, 3, 1);

                        let cardData4 = cards[0][3];
                        let card4 = this.generateCommnityCard(cardData4);
                        card4.parent = cc.find("realHolder", this.commnityCards);
                        this.runTurnCardAction(card4, 4, 1, 2.5);

                        let cardData5 = cards[0][4];
                        let card5 = this.generateCommnityCard(cardData5);
                        card5.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card5, 5, 1, 4);

                        this.runCardMoveRITAction(card1, 1, 6);
                        this.runCardMoveRITAction(card2, 2, 6);
                        this.runCardMoveRITAction(card3, 3, 6);
                        this.runCardMoveRITAction(card4, 4, 6);
                        this.runCardMoveRITAction(card5, 5, 6);

                        let cardData6 = cards[1][0];
                        let card6 = this.generateCommnityCard(cardData6);
                        card6.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card6, 1, 1, 8);

                        let cardData7 = cards[1][1];
                        let card7 = this.generateCommnityCard(cardData7);
                        card7.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card7, 2, 1, 8);

                        let cardData8 = cards[1][2];
                        let card8 = this.generateCommnityCard(cardData8);
                        card8.parent = cc.find("realHolder", this.commnityCards);
                        this.runFlopCardsAction(card8, 3, 1, 8);

                        let cardData9 = cards[1][3];
                        let card9 = this.generateCommnityCard(cardData9);
                        card9.parent = cc.find("realHolder", this.commnityCards);
                        this.runTurnCardAction(card9, 4, 1, 2.5 + 8);

                        let cardData10 = cards[1][4];
                        let card10 = this.generateCommnityCard(cardData10);
                        card10.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card10, 5, 1, 4 + 8);
                    } else if (is322) {
                        console.log("addCommnityCards", "RIT 3 +2/2");

                        let cardData4 = cards[0][3];
                        let card4 = this.generateCommnityCard(cardData4);
                        card4.parent = cc.find("realHolder", this.commnityCards);
                        this.runTurnCardAction(card4, 4, 1);

                        let cardData5 = cards[0][4];
                        let card5 = this.generateCommnityCard(cardData5);
                        card5.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card5, 5, 1, 1.5);

                        this.runCardMoveRITAction(card4, 4, 2.5);
                        this.runCardMoveRITAction(card5, 5, 2.5);

                        let cardData9 = cards[1][3];
                        let card9 = this.generateCommnityCard(cardData9);
                        card9.parent = cc.find("realHolder", this.commnityCards);
                        this.runTurnCardAction(card9, 4, 1, 4);

                        let cardData10 = cards[1][4];
                        let card10 = this.generateCommnityCard(cardData10);
                        card10.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card10, 5, 1, 5.5);

                    } else if (is411) {
                        console.log("addCommnityCards", "RIT 4 +1/1");

                        let cardData5 = cards[0][4];
                        let card5 = this.generateCommnityCard(cardData5);
                        card5.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card5, 5, 1);

                        this.runCardMoveRITAction(card5, 5, 2);

                        let cardData10 = cards[1][4];
                        let card10 = this.generateCommnityCard(cardData10);
                        card10.parent = cc.find("realHolder", this.commnityCards);
                        this.runRiverCardAction(card10, 5, 1, 1.5 + 2);
                    }
                }
            }
        }
    },

    clearCommnityCards: function () {
        var children = cc.find("realHolder", this.commnityCards).children;
        while (children.length > 0) {
            children[0].stopAllActions();
            CardPool.destroyCard(children[0], function () { });
        }
        this.commnityCards.scale = 0.8;
    },

    generateCommnityCard: function (cardData) {
        var card = CardPool.generateCard(this.cardPrefab.name, function () { });
        var cardComponent = card.getComponent('Card');
        cardComponent.init(cardData, this.model);
        cardComponent.isMyCard = false;
        cardComponent.isCommunityCard = true;
        cardComponent.reveal(false);
        return card;
    },

    /**
     * @method addHoleCard
     * @description shows community card in Game
     * @param {Object} cardType - Array
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    addHoleCard: function (cardType, ifAnimateHoleCards) {
        this.addCommnityCards(cardType, ifAnimateHoleCards);
    },

    /**
     * @method clearHoleCards
     * @description Clears the existing community cards on the table
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    clearHoleCards: function () {
        if (this.holeCardHolder === null) {
            return;
        }
        var children = this.holeCardHolder.children;
        while (children.length > 0) {
            CardPool.destroyCard(children[0], function () { });
        }

        var children = this.runItTwiceHolder.children;
        for (var index = 0; index < children.length; index++) {
            while (children[index].children.length > 0) {
                CardPool.destroyCard(children[index].children[0], function () { });
            }
        }
        var children = this.holeCardsWithTwiceHolder.children;
        for (var index = 0; index < children.length; index++) {
            while (children[index].children.length > 0) {
                CardPool.destroyCard(children[index].children[0], function () { });
            }
        }

        this.clearCommnityCards();
    },

    /**
     * @method clearTable
     * @description Clears the table
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    clearTable: function () {
        this.ignoreNextGameStart = false;
        this.node.stopAllActions();
        this.isBombPotGame.stopAllActions();
        this.unscheduleAllCallbacks();
        // this.updateBombPotTimer();
        if (this.model.gameData.tableDetails.bombPotDurationType == "hands") {

        } else {
            this.updateBombPotTimer();
        }
        GameManager.popUpManager.remove(PopUpType.TournamentAboutTostart, null, this.tablePopupHolder);
        this.clearHoleCards();
        this.clearPots();
        this.killTimers();
        this.forceAddPlayercardsData = null;
        this.forceAddPlayercardsSeatIndex = null;
        this.isBombPotGame.active = false;

        if (this.totalPotLbl) {
            this.totalPotLbl.node.parent.active = false;

            this.totalPotLbl.string = "0";
            this.totalPotLbl.__string = "0";
        }
        this.model.gameData.tableDetails.totalPot = 0;
    },

    /** 
     * @method sitSuccess 
     * @description  OnSit event callback
     * @param {Object} data -Data received from Broadcast
     * @param {Number} playerIndex -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    sitSuccess: function (data, playerIndex) {
        if (data.playerId === this.model.gameData.playerId) {
            for (var index = 0; index < this.playerHand.length; index++) {
                if (this.playerHand[index].seatState === K.SeatState.Free) {
                    this.playerHand[index].disableView();
                }
            }
            this.handleSitOutBtns(true);
            this.manageBtns(true);
            this.model.gameData.isJoinWaiting = false; //TODO : Should be done in PokerModel
        }
        // set data
        var index = this.model.getPlayerById(data.playerId);
        this.playerHand[this.getRotatedSeatIndex(data.seatIndex)].playerData = this.model.gameData.tableDetails.players[index];
        this.playerHand[this.getRotatedSeatIndex(data.seatIndex)].enablePlayerView(this.model.gameData.playerId);
        if (this.model.gameData.tableDetails.state === K.GameState.Running) {
            this.setDealer();
            if (data.playerId === this.model.gameData.playerId) {
                this.checkInBetweenBlinds(true);
            }
        }
        this.isStraddleAllowed(); // ||true;
        this.enableJoinBtn();

        if (data.playerId == GameManager.user.playerId) {
            this.playerHand[this.getRotatedSeatIndex(data.seatIndex)].enableAgoraWhenSit(true);

            this.addChipsButton = this.playerHand[this.getRotatedSeatIndex(data.seatIndex)].addChipsNode;
        }

        if (this.isObserver2()) {
            this.chatCloseBtn.active = false;
        }
        else {
            this.chatCloseBtn.active = true;
        }
    },
    /** 
     * @method checkInBetweenBlinds
     * @description  Check if player wil sit between small blind and big blind.
     * @param {Object} data -Data received from Broadcast
     * @param {Number} playerIndex -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    checkInBetweenBlinds: function () {
        if (this.isTournament()) {
            this.postBigBlindCheckBox.node.parent.active = false;
            return;
        }
        var data = this.getMyPlayer();
        if (this.model.gameData.tableDetails.state === K.GameState.Running && data != null && data.state == K.PlayerState.Waiting) {
            var sb = (this.model.gameData.tableDetails.smallBlindIndex);
            var bb = (this.model.gameData.tableDetails.bigBlindIndex) - sb;
            if (bb < 0) {
                bb += this.maxSeatIndex;
            }
            var p = (data.seatIndex) - sb;
            if (p < 0) {
                p += this.maxSeatIndex;
            }
            sb = 0;
            if (!this.postBigBlindCheckBox.node.parent.active) {
                this.postBigBlindCheckBox.node.parent.active = true;
                this.postBigBlindCheckBox.setSelection(this.model.postBigBlindUserFlake);
            }
        } else {
            if (!!data && data.state !== K.PlayerState.Waiting) {
                this.postBigBlindCheckBox.node.parent.active = false;
            }
        }
        if (this.model.gameData.tableDetails.state != K.GameState.Running && data != null && data.state == K.PlayerState.Waiting) {
            this.postBigBlindCheckBox.node.parent.active = false;
            this.postBigBlindCheckBox.setSelection(false);
        }

        if (this.postBigBlindCheckBox.getSelection()) {
            this.postBigBlindCheckBox.node.parent.getChildByName("message").active = false;
        } else {
            this.postBigBlindCheckBox.node.parent.getChildByName("message").active = true;
        }
    },


    /** 
     * @method deductBlind 
     * @description  DeductBlind pokerModel event callback
     * @param {Object} data -Data received from Broadcast
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    deductBlind: function (data) {
        if (this.node.getChildByName("winnerBannerBg")) {
            this.node.getChildByName("winnerBannerBg").active = false;
        }
        this.timersToKill.push(setTimeout(function () {
            this.displayPots();
        }.bind(this), 1800));


        var totalAnte = 0;
        var players = this.model.gameData.tableDetails.players;
        for (var index = 0; index < players.length; index++) {
            var presenter = this.playerHand[this.getRotatedSeatIndex(players[index].seatIndex)];
            presenter.node.getChildByName("BB").active = false;
            presenter.node.getChildByName("SB").active = false;

            if (players[index].seatIndex == data.bigBlindIndex) {
                presenter.node.getChildByName("BB").active = true;
            } else if (players[index].seatIndex == data.smallBlindIndex) {
                presenter.node.getChildByName("SB").active = true;
            }

            var anteAmt = (this.isTournament() && data.ante) ?
                (data.ante[players[index].playerId] || data.ante[String(players[index].playerId)] || 0) :
                (presenter.playerData.ante || 0);
            if (anteAmt > 0) {
                presenter.displayAnte(anteAmt);
                presenter.activatePlayerBetForAnte(false, true);
            }
            totalAnte += anteAmt;
        }

        if (totalAnte > 0) {
            this.timersToKill.push(setTimeout(function () {
                this.totalPotLbl.string = GameManager.convertChips(totalAnte);
                this.totalPotLbl.__string = totalAnte;
                this.totalPotLbl.node.parent.active = true;
            }.bind(this), 800));
        }
    },

    /** 
     * @method sitSuccess 
     * @description  Rotate the seat view after setting offset
     * @param {Object} data -Data received from Broadcast
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    rotateView: function (data) {
        this.setIndexOffset(data.seatIndex);
        for (var index = 0; index < this.playerHand.length; index++) {
            this.playerHand[index].resetSeat();
        }

        this.allocateSeat();
        this.playerHand.forEach(function (element) {
            if (element.seatState === K.SeatState.Free) {
                element.disableView();
            }
        }, this);
    },

    /** 
     * @method resetView 
     * @description  Reset seat view
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    resetView: function () {
        this.indexOffset = 0;
        for (var index = 0; index < this.playerHand.length; index++) {
            this.playerHand[index].resetSeat();
        }
        // reallocate seat
        this.allocateSeat();

        this.playerHand.forEach(function (element) {
            if (element.seatState !== K.SeatState.Occupied) {
                element.disablePlayerView();
            }
        }, this);
    },

    /** 
     * @method playerStateChange 
     * @description  GamePlayers pokerModel event callback 
     * @param {Object} data -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    playerStateChange: function (data) {
        if (this.gameOverLabel !== null) {
            this.gameOverLabel.string = "";
        }
        if (this.getMyPlayer() != null && this.getMyPlayer().seatIndex == data.seatIndex) {
            if (data.state === K.PlayerState.OnBreak) {
                this.handleSitOutBtns(false);
                if (!this.isTournament()) {
                    this.postBigBlindCheckBox.node.parent.active = false;
                }
                this.singleTime = false;
            } else {
                if (this.model.sitOutValue == SitOutMode.None) {
                    this.handleSitOutBtns(true);
                }

            }

            if (data.state === K.PlayerState.Waiting) {
                this.resumeBtn.active = false;
            }
            this.getPlayerByIdx(this.model.getPlayerById(this.getMyPlayer().playerId)).updateTimeBank2(data.timeBankSec);
        }
        var playerSlot = this.playerHand[this.getRotatedSeatIndex(data.seatIndex)];
        playerSlot.onStateChange();
        playerSlot.playerData.isPartOfGame = data.isPartOfGame;
        if (data.state === K.PlayerState.Disconnected && data.remainingDisconnectedTime > 0) {
            playerSlot.onDisconnectTime(data.remainingDisconnectedTime);
            this.model.startDisconnectTimerTick(data.remainingDisconnectedTime);
            playerSlot.reconnectionTimer.node.active = true;
            playerSlot.reconnectionTimer.string = data.remainingDisconnectedTime;
            playerSlot.startReconnectionCountdown(data.remainingDisconnectedTime);
        } else if (data.state === K.PlayerState.Playing &&
            this.model.gameData.tableDetails.currentMoveIndex == data.seatIndex) {
            this.model.clearDisconnectTimerTick();
            if (data.resetTimer) {
                this.model.startTimerTick(this.model.gameData.tableDetails.turnTime);
                playerSlot.onTurn(this.model.gameData.tableDetails.turnTime);
            }
        }
        if (!!this.optionalPlayerInput) {
            this.optionalPlayerInput.selectedValue = null;
        }
        this.checkInBetweenBlinds();
        this.isStraddleAllowed();
        this.handleRunItTwice();
    },
    /**
     * @method handleSitOutBtns
     * @description Enable/Disable other sitOut checkBoxes Accordingly
     * @param {boolean} val - Value 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    handleSitOutBtns: function (val) {
        this.resumeBtn.active = !val;
        this.handleSitAllBtn();
        if (!this.isTournament()) {
            if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateSitOutNextHandCheckBox(val);
                GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").setSelectionSitOutNextHandCheckBox(false);
            }
            this.sitOutNextHandCheckBox = val;
            this.sitOutNextHandCheckBoxSelection = false;
        }
    },
    /**
     * @method handleSitAllBtn
     * @description Active the Resume Button in all PokerPresenter
     * @param {boolean} val - Value 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    handleSitAllBtn: function () {
        var count = 0;
        for (var index = 0; index < GameScreen.gameModel.activePokerModels.length; index++) {
            var presenter = GameScreen.gameModel.activePokerModels[index].node.children[0].getComponent('PokerPresenter');
            if (presenter.resumeBtn.active) {
                count++;
                if (count > 1)
                    break;
            }
        }
        for (var index = 0; index < GameScreen.gameModel.activePokerModels.length; index++) {
            GameScreen.gameModel.activePokerModels[index].node.children[0].getComponent('PokerPresenter').resumeBtn.children[1].active = count > 1;
        }
    },
    /**
     * @method dealerChat
     * @description dummy methdo as of now
     * @param {boolean} val - Value 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    dealerChat: function (data) {

    },
    /**
     * @method chat
     * @description  Shows Last chat sent by any Player on it's position
     * @param {Object} val - Data/Message received from server 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    chat: function (data) {
        var index = this.model.getPlayerById(data.playerId);
        this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.players[index].seatIndex)].showChat(data.message);
    },
    /**
     * @method onBestHand
     * @description Shows the best matches of a player/user hand card with against community card
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onBestHand: function () {
        if (this.getMyPlayer() != null && this.getMyPlayer().state === K.PlayerState.Playing && !!this.getMyPlayer().bestHand && this.model.gameData.tableDetails.state !== K.GameState.GameOver) {
            var playerPresenter = this.getMyPlayer();
            if (!playerPresenter) {
                return;
            }
            var presenter = this.playerHand[this.getRotatedSeatIndex(playerPresenter.seatIndex)];
            if (!presenter) {
                return;
            }
            presenter.onBestHand(this.getMyPlayer().bestHand, this.getMyPlayer().lowBestHand, this.getMyPlayer().board2BestHand);

        }
    },

    onReBuyInConfirm: function () {
        this.model.rebuy(
            this.model.gameData.channelId,
            GameManager.user.playerId,
            this.model.gameData.tournamentId,
            (res) => { },
            (error) => { }
        );
    },

    onRebuyDeactivated: function (data) {
        GameManager.popUpManager.remove(PopUpType.BuyInPopup, function () { }, this.tablePopupHolder);
    },

    onRebuyActivated: function (data) {
        if (this.isTournament()) {
            if (data) {
                if (!data.tournamentId) {
                    data.tournamentId = this.model.gameData.tournamentId;
                }
                GameManager.emit("hideJoinSimlar");
                GameManager.popUpManager.showIn(PopUpType.BuyInPopup, {
                    "data": data,
                    "pokerPresenter": this.node
                }, null, this.tablePopupHolder);
            }
            return;
        }
        const text_chips = "Available Chips" + ':';
        if (GameManager.user.category == "DIAMOND") {
            data.totalChips = GameManager.user.realChips;
        } else {
            data.totalChips = GameManager.user.freeChips;
        }

        data.isRebuy = true;
        data.rebuyChips = this.model.gameData.tourData.rebuyChips;
        data.rebuyAmount = this.model.gameData.tourData.rebuy.rebuyPrice.rebuyAmount;
        data.rebuyHoursFee = this.model.gameData.tourData.rebuy.rebuyPrice.rebuyHouseFee;
        data.rebuyTotalChips = this.model.gameData.tourData.rebuy.rebuyPrice.totalRebuyChip;

        if (data.rebuyTimer) { } else {
            data.rebuyTimer = this.model.gameData.tourData.timeToRebuy;
        }


        data.confirm = this.onReBuyInConfirm.bind(this);
        data.channelId = this.model.gameData.channelId;
        data.playSound = this.playAudio.bind(this);
        GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);
    },

    /**
     * @method checkForSelfTurn
     * @description  Check if current player is self using playerId
     * @param {Number} playerId -playerId of the player whose current turn it is.  
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    checkForSelfTurn: function (playerId) {
        if (this.model && this.model.gameData.playerId === playerId) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * @method getMyPlayer
     * @description 
     * @param {boolean} val - Value 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    getMyPlayer: function () {
        var index = this.model.getPlayerById(this.model.gameData.playerId);
        var myPlayer = this.model.gameData.tableDetails.players[index];
        return (!!myPlayer) ? myPlayer : null;
    },

    getPlayer: function (playerId) {
        var index = this.model.getPlayerById(playerId);
        var player = this.model.gameData.tableDetails.players[index];
        return (!!player) ? player : null;
    },

    /**
     * @method clearPots
     * @description Disables all table pots 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    clearPots: function () {
        if (this.potAmount) {
            this.potAmount.forEach(function (element) {
                element.getComponent(cc.Label).string = "0";
                element.parent.active = false;
            }, this);
        }
    },

    /**
     * @method displayPots
     * @description  Show pot amounts on view
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    displayPots: function () {
        if (!this.totalPotLbl) {
            return;
        }
        this.totalPotLbl.node.parent.active = true;
        this.totalPotLbl.string = GameManager.convertChips(this.model.gameData.tableDetails.totalPot);
        this.totalPotLbl.__string = this.model.gameData.tableDetails.totalPot;
        this.updateBB();
        if (this.model.gameData.tableDetails.roundName !== K.Round.Preflop) {
            for (var index = 0; index < this.model.gameData.tableDetails.pot.length; index++) {
                this.potAmount[index].getComponent(cc.Label).string = GameManager.convertChips(this.model.gameData.tableDetails.pot[index]);
                this.potAmount[index].getComponent(cc.Label).__string = this.model.gameData.tableDetails.pot[index];
                this.potAmount[index].parent.active = true;
                this.updateBB();
            }
        } else {
            if (this.isTournament() && this.model.gameData.tableDetails.players.length > 1) {
                var tourDataForAnte = this.model.gameData.tourData;
                var ante = (tourDataForAnte.currentBlindLevel || tourDataForAnte && tourDataForAnte.currentBlindLevel || {}).ante || 0;
                var totalAnte = ante * this.model.gameData.tableDetails.players.length;
                if (totalAnte > 0) {
                    if (!this.totalPotLbl) {
                        return;
                    }
                    totalAnte = this.model.gameData.tableDetails.totalPot;
                    this.totalPotLbl.node.parent.active = true;
                    this.totalPotLbl.string = GameManager.convertChips(totalAnte);
                    this.totalPotLbl.__string = totalAnte;
                }
            }
        }
        if (this.model.gameData.tableDetails.totalPot == 0) {
            this.totalPotLbl.node.parent.active = false;
        }
    },

    /**
     * @method startGame
     * @description  gameStart pokerModel event callback
     * @param {Object} data -Data received from server
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    startGame: function (data) {
        this._cancelPotSplitTasks();
        this._pendingPotGroups = null;
        this._potSplitSettled = true;
        if (this.potAnimator && this.potAnimator.clearRunningSplits) {
            this.potAnimator.clearRunningSplits(true);
        }

        this.model.gameData.tableDetails.currentBombPotHand = data.currentBombPotHand;
        var moves = data.moves;
        this.playerInput[0].active = false;
        var players = this.model.gameData.tableDetails.players;
        for (var index = 0; index < players.length; index++) {
            var presenter = this.playerHand[this.getRotatedSeatIndex(players[index].seatIndex)];
            presenter.enablePlayerView(this.model.gameData.playerId, false);
        }

        this.startGameTimer = setTimeout(function () {
            var players = this.model.gameData.tableDetails.players;
            for (var index = 0; index < players.length; index++) {
                var presenter = this.playerHand[this.getRotatedSeatIndex(players[index].seatIndex)];
                if (presenter.playerData.totalRoundBet > 0) {
                    presenter.displayBlind(presenter.playerData.totalRoundBet);
                }
            }
        }.bind(this), 1000);
        this.timersToKill.push(this.startGameTimer);

        this.clearHoleCards();
        this.setDealer();

        if (data.currentMixedGameVariant && data.currentMixedGameVariant != "") {
            this.model.gameData.tableDetails.currentMixedGameVariant = data.currentMixedGameVariant;

            if (this.model.gameData.tableDetails.currentMixedGameVariant === "Omaha" || this.model.gameData.tableDetails.currentMixedGameVariant === "Omaha Hi-Lo") {
                this.model.dummyCardsCount = 4;
            } else if (this.model.gameData.tableDetails.currentMixedGameVariant === "Omaha 5" || this.model.gameData.tableDetails.currentMixedGameVariant === "Big O") {
                this.model.dummyCardsCount = 5;
            } else if (this.model.gameData.tableDetails.currentMixedGameVariant === "Omaha 6") {
                this.model.dummyCardsCount = 6;
            } else if (this.model.gameData.tableDetails.currentMixedGameVariant === "Mega Hold’em") {
                this.model.dummyCardsCount = 3;
            } else {
                this.model.dummyCardsCount = 2;
            }

            this.reshufflingNotice.active = false;
            if (GameManager.isActive) {
                this.mixedNotice.getChildByName("vari").getComponent(cc.Label).string = GameManager.getVariName(data.currentMixedGameVariant, this.model.gameData.tableDetails.canApplyBombPot);
                this.mixedNotice.stopAllActions();
                this.mixedNotice.active = true;
                this.mixedNotice.runAction(cc.sequence(
                    cc.delayTime(2),
                    cc.callFunc(() => {
                        this.mixedNotice.active = false;
                    })
                ));

                this.roomNameLbl.string = GameManager.getVariNameForMixedGame(this.model.gameData.tableDetails.currentMixedGameVariant, this.model.gameData.tableDetails.canApplyBombPot);

            } else { }
        }
        this.placeDummyCards();
        this.cardAnimation(this.model.gameData.tableDetails.players);
        this.handleRunItTwice();
        this.checkInBetweenBlinds();
        this.displayRoundNumber();
    },

    onBombPotAnimation: function (data) {
        if (!!this.model && this.model.gameData.channelId == data.channelId) {
            if (GameManager.isActive) {
                if (data.canApplyBombPot) {
                    this.totalPotLbl.node.parent.getChildByName("potBomb").active = true;
                    if (!this.ignoreNextGameStart) {
                        this.isBombPotGame.stopAllActions();
                        this.bombAnimationTimer = setTimeout(() => {
                            this.isBombPotGame.active = data.canApplyBombPot;
                            this.isBombPotGame.scale = 1.5;
                            this.isBombPotGame.getChildByName("BB").getComponent(cc.Label).string = this.model.gameData.tableDetails.bombPotAmount + " BB";
                            this.isBombPotGame.getChildByName("BB").active = false;
                            this.isBombPotGame.getChildByName("Bombpot").active = false;
                            this.isBombPotGame.getComponent(cc.Animation).play();
                            this.isBombPotGame.runAction(
                                cc.sequence(
                                    cc.delayTime(2),
                                    cc.callFunc(() => {
                                        this.isBombPotGame.getChildByName("BB").active = true;
                                        this.isBombPotGame.getChildByName("BB").rotation = 15;
                                        this.isBombPotGame.getChildByName("BB").runAction(
                                            cc.sequence(
                                                cc.delayTime(0.2),
                                                cc.rotateTo(0.2, 0),
                                                cc.callFunc(() => {
                                                    this.isBombPotGame.getChildByName("Bombpot").active = true;
                                                    this.isBombPotGame.runAction(
                                                        cc.sequence(
                                                            cc.delayTime(0.5),
                                                            cc.scaleTo(0.3, 0),
                                                        )
                                                    );
                                                })
                                            )
                                        );
                                    })
                                )
                            );
                        }, 1000);
                    }
                } else {
                    this.totalPotLbl.node.parent.getChildByName("potBomb").active = false;
                }
            }
        }
    },

    cardAnimation: function (players) {
        var params = [];
        for (var index = 0; index < players.length; index++) {
            if (players[index].state === K.PlayerState.Playing || this.isTournament()) {
                if (players[index].state == "REBUYING" || (this.isTournament() && !players[index].isPartOfGame)) {
                    continue;
                }
                // add data
                var cardData = {};
                cardData.targetNode = this.playerHand[this.getRotatedSeatIndex(players[index].seatIndex)].node;
                params.push(cardData);
            }
        }

        if (this.model.gameData.tableDetails.canApplyBombPot) {
            if (this.model.roomConfig.channelVariation == "Bomb Pot 5") {
                this.cardDistributer.distributeCards(5, params, this);
            } else if (this.model.roomConfig.channelVariation == "Bomb Pot 6") {
                this.cardDistributer.distributeCards(6, params, this);
            } else {
                this.cardDistributer.distributeCards(4, params, this);
            }

        } else {
            if (this.model.roomConfig.channelVariation == "Mixed Game") {
                if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Texas Hold’em') {
                    this.cardDistributer.distributeCards(2, params, this);
                } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Omaha') {
                    this.cardDistributer.distributeCards(4, params, this);
                } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Omaha 5') {
                    this.cardDistributer.distributeCards(5, params, this);
                } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Omaha 6') {
                    this.cardDistributer.distributeCards(6, params, this);
                } else if (this.model.gameData.tableDetails.currentMixedGameVariant == 'Big O') {
                    this.cardDistributer.distributeCards(5, params, this);
                }
            } else {
                this.cardDistributer.distributeCards(this.model.dummyCardsCount, params, this);
            }
        }
    },

    /**
     * @method onStandUp
     * @description  onStandUp pokerModel event callback
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onStandUp: function () {
        this.hideMoves();
        this.enableTempPlayerInput(false);
        this.handleSitOutBtns(true);
        this.manageBtns(false);
        this.enableJoinBtn();
    },

    /**
     * @method nextTurn
     * @description turn pokerModel event callback
     * @param {Object} data - 
     * @param {Number} previousIndex -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    nextTurn: function (data, previousIndex) {
        this.onHideRaisePanel();
        var moves = data.moves;
        if (data.action.toUpperCase() == "RAISE" && this.optionalPlayerInput.selectedValue != null && this.optionalPlayerInput.selectedValue.toUpperCase() == "CALL") {
            this.optionalPlayerInput.selectedValue = null;
        }
        if ((data.action.toUpperCase() == "RAISE" || data.action.toUpperCase() == "BET" || data.action.toUpperCase() == "ALLIN") && this.optionalPlayerInput.selectedValue != null && (this.optionalPlayerInput.selectedValue.toUpperCase() == "CHECK" || this.optionalPlayerInput.selectedValue.toUpperCase() == "CALL")) {
            this.optionalPlayerInput.selectedValue = null;
        }
        if (data.action.toUpperCase() == "ALLIN" && GameManager.user.playerId == data.playerId) {
            this.handleRunItTwice(false);
        }
        this.playerInput[0].active = false;
        if (previousIndex != null && data.action != 'none') {

            this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.players[previousIndex].seatIndex)].displayMove(data.action);
        }
        if (data.currentMoveIndex == -1) {
            this.hideMoves();
            this.enableTempPlayerInput(false);
            return;
        }
        if (data.currentMoveIndex === "") {
            return;
        }
        if (data.isRoundOver) {
            if (!this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)]) {
                return;
            }
            this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)].onTurn(this.model.gameData.tableDetails.turnTime);
            var playerPresenter = this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)];
            if (this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)] &&
                this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)].playerData &&
                this.checkForSelfTurn(this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)].playerData.playerId)) {

                this.enableTempPlayerInput(false);

                this.timersToKill.push(setTimeout(function () {
                    this.selfLastMoveData = moves;
                    if (data.currentMoveIndex == this.model.gameData.tableDetails.currentMoveIndex) {
                        this.optionalPlayerInput.selectedValue = null;
                        this.enableSelfTurn(playerPresenter, moves);
                    }
                }.bind(this), 1400));
            } else {
                this.onCloseSureToFold();
                this.model.emit(K.PokerEvents.onTurnInOtherRoom, this.model, false);
                if (playerPresenter.playerData.state === K.PlayerState.Disconnected && data.remainingDisconnectedTime > 0) {
                    playerPresenter.onDisconnectTime(data.remainingDisconnectedTime);
                    this.model.startDisconnectTimerTick(data.remainingDisconnectedTime);
                    playerPresenter.reconnectionTimer.node.active = true;
                    playerPresenter.reconnectionTimer.string = data.remainingDisconnectedTime;
                    playerPresenter.startReconnectionCountdown(data.remainingDisconnectedTime);
                }
            }
        } else {
            this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)].onTurn(this.model.gameData.tableDetails.turnTime);
            var playerPresenter = this.playerHand[this.getRotatedSeatIndex(data.currentMoveIndex)];
            if (!playerPresenter.playerData) {
                cc.error("!playerPresenter", playerPresenter);
            } else {
                playerPresenter.onTurn(this.model.gameData.tableDetails.turnTime);
                if (this.checkForSelfTurn(playerPresenter.playerData.playerId)) {
                    this.selfLastMoveData = moves;
                    this.enableTempPlayerInput(false);
                    this.enableSelfTurn(playerPresenter, moves);
                } else {
                    this.onCloseSureToFold();
                    this.model.emit(K.PokerEvents.onTurnInOtherRoom, this.model, false);
                }

                if (playerPresenter.playerData.state === K.PlayerState.Disconnected && data.remainingDisconnectedTime > 0) {
                    playerPresenter.onDisconnectTime(data.remainingDisconnectedTime);
                    this.model.startDisconnectTimerTick(data.remainingDisconnectedTime);
                    playerPresenter.reconnectionTimer.node.active = true;
                    playerPresenter.reconnectionTimer.string = data.remainingDisconnectedTime;
                    playerPresenter.startReconnectionCountdown(data.remainingDisconnectedTime);
                }
            }
        }
        if (data.runBy == "precheck" && (data.currentMoveIndex == this.model.gameData.tableDetails.currentMoveIndex)) {
            this.optionalPlayerInput.selectedValue = null;
        }
        if (data.isPrecheckAction) {
            this.playerInput[0].active = false;
        }
    },
    /**
     * @method playAudio
     * @description turn pokerModel event callback
     * @param {index} sound -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    playAudio: function (sound) {
        if (ScreenManager.currentScreen != K.ScreenEnum.GamePlayScreen) {
            return;
        }
        if (!GameManager.user.settings.muteGameSound)
            GameManager.playSound(sound);
    },

    onSecondEventClickSoud: function () {
        this.playAudio(K.Sounds.click);
    },

    /**
     * @method enableSelfTurn
     * @description  called to initialise values for self player on turn
     * @param {Object} playerPresenter - current player's playerPresenter script 
     * @param {Number} previousIndex - current player index
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    enableSelfTurn: function (playerPresenter, moves) {
        if (this.getMyPlayer() == null) {
            return;
        }
        if (playerPresenter.playerData.state == K.PlayerState.Playing || playerPresenter.playerData.state == K.PlayerState.Disconnected) {
            this.playAudio(K.Sounds.userTurn);
            this.model.emit(K.PokerEvents.onTurnInOtherRoom, this.model, true);
            this.playerInput[0].active = true;
            this.hideMoves();
            var sliderData = {};
            var currentPlayerId = playerPresenter.playerData.playerId;
            var playerIndex = this.model.getPlayerById(currentPlayerId);
            sliderData.maxAmount = (this.model.gameData.tableDetails.maxRaiseAmount).roundOff(2);
            sliderData.minAmount = (this.model.gameData.tableDetails.minRaiseAmount).roundOff(2);
            sliderData.playerChips = this.getMyPlayer().chips;
            sliderData.roundBet = this.getMyPlayer().totalRoundBet || 0;
            sliderData.potAmount = this.model.gameData.tableDetails.totalPot;
            sliderData.roundName = this.model.gameData.tableDetails.roundName;
            sliderData.bb = this.model.gameData.tableDetails.bigBlind;
            sliderData.roundMaxBet = this.model.gameData.tableDetails.roundMaxBet;
            let flag = this.model.roomConfig.channelVariation === "Omaha" || this.model.roomConfig.channelVariation === "Omaha Hi-Lo" || this.model.roomConfig.channelVariation === "Omaha 5" || this.model.roomConfig.channelVariation === "Omaha 6" || this.model.roomConfig.channelVariation === "Big O";
            let flag2 = !this.model.roomConfig.isPotLimit && this.model.roomConfig.channelVariation === K.Variation.TexasHoldem && this.model.gameData.tableDetails.roundName === K.Round.Preflop;
            if (this.model.gameData.tableDetails.canApplyBombPot) {
                flag = true;
            }
            this.betBtnSlider.updateData(sliderData, flag, flag2, moves);

            this.enableTempPlayerInput(false);
            this.sureToFold = (moves.includes(1) && moves.includes(6));
            this.displayMoves(moves, playerIndex);
            if (GameScreen.viewType == 1) {
                if (GameManager.gameModel.activePokerModels.length >= 2) {
                    if (this.playerInput[0].active) {
                        this.playerInput[0].active = false;
                    }

                } else {
                    if (!!this.playerInput[0])
                        this.playerInput[0].active = true;
                }
            } else {
                this.playerInput[0].active = true;
            }
        }
    },

    /**
     * @method displayMoves 
     * @description Display inputs
     * @param {Object} moves -
     * @param {Number} playerIndex -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    displayMoves: function (moves, playerIndex) {
        var selectedValue;
        selectedValue = this.optionalPlayerInput.selectedValue;
        if (selectedValue != null) {
            this.optionalPlayerInput.selectedValue = null;
        }
        this.enableInputs(moves, playerIndex);

        if (GameScreen.gameModel.activePokerModels[GameScreen.prevSelection] &&
            GameScreen.gameModel.activePokerModels[GameScreen.prevSelection] &&
            GameScreen.gameModel.activePokerModels[GameScreen.prevSelection].gameData.channelId == this.model.gameData.channelId) {
            GameManager.emit("disablePageView");
        }
    },

    /**
     * @method enableInputs
     * @description Enable Inputs according to moves data.
     * @param {Object} data - 
     * @param {Number} previousIndex -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    enableInputs: function (moves, playerIndex, input = this.playerInput) {
        this.realBetBtn.active = false;
        this.realRaiseBtn.active = false;
        moves.forEach(function (element) {
            input[element].active = true; //true;
            if (element === 3 || element === 4) {
                if (element === 3) {
                    this.realBetBtn.active = true;
                } else if (element === 4) {
                    this.realRaiseBtn.active = true;
                }
            }
            if (element === 2) {
                this.callAmountLabel.string = (this.model.gameData.tableDetails.roundMaxBet - this.model.gameData.tableDetails.players[playerIndex].totalRoundBet).roundOff(2);
                this.updateBB();
            }
            if (element === 5 && (input[3].active || input[4].active)) {
                input[element].active = false;
            }
        }, this);
    },

    hideMoves: function () {
        this.playerInput.forEach(function (element) {
            element.active = false;
        }, this);

        if (GameScreen.gameModel.activePokerModels[GameScreen.prevSelection] &&
            GameScreen.gameModel.activePokerModels[GameScreen.prevSelection] &&
            GameScreen.gameModel.activePokerModels[GameScreen.prevSelection].gameData.channelId == this.model.gameData.channelId) {
            GameManager.emit("enablePageView");
        }
    },


    /**
     * @method roundOver
     * @param {Object} data
     * @description roundOver pokerModel event callback;
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    roundOver: function (data) {
        if (this.startGameTimer) {
            clearTimeout(this.startGameTimer);
            this.startGameTimer = null;
        }
        for (var index = 0; index < this.playerHand.length; index++) {
            this.playerHand[index].activatePlayerBet(false, true);

            if (this.playerHand[index].playerData &&
                this.playerHand[index].playerData.lastMove != "FOLD" &&
                this.playerHand[index].playerData.lastMove != "ALLIN") {
                this.playerHand[index].moveShower.scale = 0;
            }
        }
        this.timersToKill.push(setTimeout(function () {
            this.displayPots();
        }.bind(this), 300));
    },

    /**
     * @method gameOver
     * @param {Object} data -
     * @param {Number} playerIndex -
     * @description callBack called on gameOver
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    gameOver: function (data, playerIndex) {
        GameManager.popUpManager.remove(PopUpType.RebuyAddOnToast, null, this.tablePopupHolder);
        if (!cc.isValid(this.node) || !data || !data.winners) {
            return;
        }

        this.preCheckCounter = 0;
        this.optionalPlayerInput.requestMappings = {};
        this.runItTwiceCaseRunning = false;
        this.handleRunItTwice(false);
        this.enableTempPlayerInput(false);
        this.optionalPlayerInput.selectedValue = null;

        var groups = this._buildPotSplitGroups(data);
        var shareCount = this._buildPotShareCount(groups);
        this._pendingPotGroups = groups;
        this._livePotShareCount = shareCount;
        this._potSplitCursor = 0;
        this._potSplitSettled = false;
        this._cancelPotSplitTasks();
        if (this.potAnimator && this.potAnimator.resetApplyKeys) {
            this.potAnimator.resetApplyKeys();
        }
        var canAnimate = GameManager.isActive && !GameManager.androidFromBackground;
        if (canAnimate) {
            this._schedulePotSplitGroups(groups, shareCount);
        } else {
            this._applyAllPotSplitGroups(groups, shareCount);
        }

        this.model.gameData.tableDetails.players.forEach(function (element) {
            var seat = this.playerHand[this.getRotatedSeatIndex(element.seatIndex)];
            if (seat && seat.gameOver) {
                seat.gameOver();
            }
        }, this);
        this.hideMoves();
    },

    _buildPotSplitGroups: function (data) {
        var myObj = {};
        var refundPot = {};
        for (var i = 0; i < data.winners.length; i++) {
            var winner = data.winners[i];
            var index = this.model.getPlayerById(winner.playerId);
            if (winner.playerId == GameManager.user.playerId) {
                var isMuck = GameManager.user.isMuckHand;
                var myPlayer = this.getMyPlayer();
                var isSittingOut = myPlayer && myPlayer.state == K.PlayerState.OnBreak;
                if (!isMuck && data.endingType == K.GameEndType.EverybodyPacked && !isSittingOut) {
                    this.muckHand = true;
                    if (GameManager.popUpManager.isPopupActive(PopUpType.InGamePreferencesPopup, this.tablePopupHolder)) {
                        GameManager.popUpManager.getPopupNode(PopUpType.InGamePreferencesPopup, this.tablePopupHolder).getComponent("InGamePreferencesPopup").muckHandCheckbox.node.parent.active = true;
                    }
                }
            }
            if (!this.model.gameData.tableDetails.players[index]) {
                continue;
            }

            var splitData = {
                amount: winner.amount,
                totalChips: winner.chips,
                potIndex: winner.potIndex,
                internalPotSplitIndex: winner.internalPotSplitIndex,
                targetNode: this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.players[index].seatIndex)].node,
                set: winner.set,
                playerId: winner.playerId,
                winningAmount: winner.winningAmount,
                type: winner.type,
                text: winner.text,
                winType: winner.winType
            };

            if (!winner.isRefund) {
                if (!myObj[winner.internalPotSplitIndex]) {
                    myObj[winner.internalPotSplitIndex] = [];
                }
                myObj[winner.internalPotSplitIndex].push(splitData);
            } else if (!refundPot.playerId) {
                refundPot = splitData;
                refundPot.set = [];
                refundPot.type = "REFUND";
            } else {
                refundPot.winningAmount += winner.winningAmount;
            }
        }

        var groups = [];
        if (refundPot.playerId) {
            groups.push([refundPot]);
        }
        for (var property in myObj) {
            if (myObj.hasOwnProperty(property)) {
                groups.push(myObj[property]);
            }
        }
        return groups;
    },

    _buildPotShareCount: function (groups) {
        var shareCount = new Array(9);
        shareCount.fill(0);
        for (var t = 0; t < groups.length; t++) {
            if (groups[t] && groups[t][0]) {
                shareCount[groups[t][0].potIndex] = shareCount[groups[t][0].potIndex] + 1;
            }
        }
        return shareCount;
    },

    _cancelPotSplitTasks: function () {
        var tasks = this._potSplitTasks || [];
        for (var i = 0; i < tasks.length; i++) {
            this.unschedule(tasks[i]);
        }
        this._potSplitTasks = [];
    },

    _schedulePotSplitGroups: function (groups, shareCount) {
        this._potSplitTasks = [];
        for (var m = 0; m < groups.length; m++) {
            this._queuePotGroup(groups[m], shareCount, m);
        }
    },

    _queuePotGroup: function (group, shareCount, groupIndex) {
        var bannerDelay = groupIndex * this.potDistributionTimerDelay;
        var flyDelay = bannerDelay + this.potSplitterMoveActionDelay;
        var bannerTask = this._showPotGroupVisual.bind(this, group);
        var flyTask = this._flyPotGroup.bind(this, group, shareCount);
        this._potSplitTasks.push(bannerTask);
        this._potSplitTasks.push(flyTask);
        this.scheduleOnce(bannerTask, bannerDelay);
        this.scheduleOnce(flyTask, flyDelay);
    },

    _showPotGroupVisual: function (group) {
        if (!cc.isValid(this.node) || !group || !group.length) {
            return;
        }
        this._showTableWinnerBanner(group[0]);
        this._highlightGroupCards(group);
    },

    _flyPotGroup: function (group, shareCount) {
        if (!cc.isValid(this.node) || !group || !group.length) {
            return;
        }
        var potIndex = group[0].potIndex || 0;
        var potInstance = null;
        if (shareCount[potIndex] > 1) {
            shareCount[potIndex] = shareCount[potIndex] - 1;
        } else {
            potInstance = this.potAmount[potIndex];
        }
        if (!potInstance) {
            this._deductSharedPotLabel(group);
        }
        this.playAudio(K.Sounds.chipDistribution);
        this.potAnimator.runPotSplitter(group, potInstance, null);
        this._potSplitCursor = (this._potSplitCursor || 0) + 1;
        this._markPotSplitSettledIfLast(group);
    },

    _applyAllPotSplitGroups: function (groups, shareCount) {
        if (!groups) {
            return;
        }
        var counts = shareCount ? shareCount.slice() : this._buildPotShareCount(groups);
        var start = this._potSplitCursor || 0;
        for (var i = start; i < groups.length; i++) {
            var group = groups[i];
            this._showPotGroupVisual(group);
            var potIndex = group[0].potIndex || 0;
            var potInstance = null;
            if (counts[potIndex] > 1) {
                counts[potIndex] = counts[potIndex] - 1;
            } else {
                potInstance = this.potAmount[potIndex];
            }
            if (!potInstance) {
                this._deductSharedPotLabel(group);
            }
            this.potAnimator.runPotSplitter(group, potInstance, null);
        }
        this._potSplitSettled = true;
        this._pendingPotGroups = null;
    },

    _deductSharedPotLabel: function (group) {
        var potIndex = group[0].potIndex || 0;
        var potLabel = this.potAmount[potIndex] && this.potAmount[potIndex].getComponent(cc.Label);
        if (!potLabel) {
            return;
        }
        var sumAmount = 0;
        for (var n = 0; n < group.length; n++) {
            sumAmount += group[n].winningAmount;
        }
        sumAmount = (potLabel.__string - sumAmount.roundOff(2));
        potLabel.string = GameManager.convertChips(sumAmount);
        potLabel.__string = sumAmount;
        this.updateBB();
    },

    _showTableWinnerBanner: function (row) {
        if (!row || row.type == "Every Body Else Folded" || row.type == "REFUND") {
            return;
        }
        var tmp = this.node.getChildByName("winnerBannerBg");
        if (!tmp) {
            return;
        }
        tmp.active = true;
        tmp.width = 400;
        tmp.getChildByName("winningText").getComponent(cc.Label).string = row.text;
        if (row.winType == "high") {
            tmp.getChildByName("lowW").active = false;
            tmp.getChildByName("highW").active = true;
        } else if (row.winType == "low") {
            tmp.getChildByName("lowW").active = true;
            tmp.getChildByName("highW").active = false;
        } else {
            tmp.getChildByName("lowW").active = false;
            tmp.getChildByName("highW").active = false;
        }
    },

    _highlightGroupCards: function (group) {
        if (!group) {
            return;
        }
        var tableCards = this.commnityCards.getChildByName("realHolder").getComponentsInChildren("Card");
        for (var j = 0; j < group.length; j++) {
            this.dullAllCards(tableCards);
            var aPlayer = group[j].targetNode.getComponent(PlayerPresenterType);
            if (!aPlayer) {
                continue;
            }
            var handRootName = aPlayer.isSelf() ? "MyCardsShow" : "CardsShow";
            var handPlayer = group[j].targetNode.getChildByName("HandPlayer");
            var handRoot = handPlayer && handPlayer.getChildByName(handRootName);
            var playerHandCards = handRoot ? handRoot.getComponentsInChildren("Card") : [];
            if (group[j].set && group[j].set.length != 0) {
                this.dullAllCards(playerHandCards);
                this.highlightWinningCards(group[j].set, tableCards, playerHandCards);
            }
        }
    },

    _markPotSplitSettledIfLast: function (group) {
        if (!this._pendingPotGroups || !this._pendingPotGroups.length) {
            this._potSplitSettled = true;
            return;
        }
        if (group === this._pendingPotGroups[this._pendingPotGroups.length - 1]) {
            this._potSplitSettled = true;
            this._pendingPotGroups = null;
        }
    },

    _flushPendingPotSplitOnForeground: function () {
        this._cancelPotSplitTasks();
        if (this.potAnimator && this.potAnimator.clearRunningSplits) {
            this.potAnimator.clearRunningSplits(false);
        }
        if (!this._potSplitSettled && this._pendingPotGroups && this._pendingPotGroups.length) {
            this._applyAllPotSplitGroups(this._pendingPotGroups, this._livePotShareCount);
        }
    },

    /**
     * @method highlight Winning Cards of Player
     * @param {Number} winnerSet - set of winner cards combinations provided by server 
     * @param {Number} cardsOnTable - cards on Table visible to all, HOLECARDS
     * @param {Number} playerHandCards - Player Hand cards which he holds
     * @description Method to highlight players cards who won.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    highlightWinningCards: function (winnerSet, cardsOnTable, playerHandCards) {
        var array = cardsOnTable.concat(playerHandCards);
        var temp = winnerSet;
        for (var i = 0; i < temp.length; i++) {
            var c = 0;
            switch (temp[i].type) {
                case "spade":
                    c = 1;
                    break;
                case "heart":
                    c = 2;
                    break;
                case "club":
                    c = 3;
                    break;
                case "diamond":
                    c = 4;
                    break;
            }
            array.forEach(function (element) {
                if (element.cardRank == temp[i].rank && element.suit == c) {
                    if (!element.node.getChildByName("CardGlow").active) {
                        element.node.getChildByName("CardGlow").active = true;
                        element.node.__y = element.node.y;
                        element.node.y = (element.node.y + 10);
                        element.node.getChildByName("FrontFace").color = cc.Color.WHITE;
                    }
                }
            }, this);
        }
    },


    /**
     * @method Reset highlight Winning Cards of Player
     * @param {Number} winnerSet - set of winner cards combinations provided by server 
     * @param {Number} cardsOnTable - cards on Table visible to all, HOLECARDS
     * @param {Number} playerHandCards - Player Hand cards which he holds
     * @description Method to reset highlight players cards who won.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    dullAllCards: function (cardsToReset, unDull) {
        cardsToReset.forEach((e) => {
            var element = e.node;
            // element.y = (0);
            element.getChildByName("FrontFace").color = new cc.Color(170, 161, 161);
            element.getChildByName("CardGlow").active = false;
            // element.y = 0;
            if (element.__y != undefined) {
                element.y = element.__y;
                delete element.__y;
            }
            if (unDull) {
                element.getChildByName("FrontFace").color = cc.Color.WHITE;
            }
        });
    },

    /**
     * @method showWinnerCards
     * @param {Number} seatIndex -
     * @description Method to reveal winers hand card
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    showWinnerCards: function (seatIndex) {
        if (this.getRotatedSeatIndex(seatIndex) && this.playerHand[this.getRotatedSeatIndex(seatIndex)]) {
            this.playerHand[this.getRotatedSeatIndex(seatIndex)].winningRevealCardsMuckHand();
        }
    },

    showAllInCards: function (data) {
        for (var i = 0; i < data.length; i++) {
            var index = this.model.getPlayerById(data[i].playerId);
            if (index == -1) {
                continue;
            }
            this.playerHand[this.getRotatedSeatIndex(this.model.gameData.tableDetails.players[index].seatIndex)].showAllInCards(data[i].cards);
        }
    },

    /**
     * @method playerLeft
     * @param {Object} data -
     * @description  leave pokerModel event callback
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    playerLeft: function (data) {
        if (data === null) {
            return;
        }

        if (data[0].playerId === this.model.gameData.playerId && !data[0].isStandup) {

            if (GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] === true) {
                GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] = false;
            } else {
                this.handleSitOutBtns(true);
                this.resetView();
                this.manageBtns(false);
                GameManager.popUpManager.remove(PopUpType.BuyInPopup, function () { }, this.tablePopupHolder);
                this.handleRunItTwice(true, true);
                this.singleTime = false;
            }
        }
        var playerIndex = this.model.getPlayerById(this.model.gameData.playerId);

        if (playerIndex !== -1) {
            this.playerHand[this.getRotatedSeatIndex(data[0].seatIndex)].disableView();
        } else {
            this.playerHand[this.getRotatedSeatIndex(data[0].seatIndex)].disablePlayerView();
        }


        this.playerHand[this.getRotatedSeatIndex(data[0].seatIndex)].clearTimers();
        this.isStraddleAllowed();
        this.enableJoinBtn();

        if (data[0].playerId == GameManager.user.playerId) {
            this.postBigBlindCheckBox.node.parent.active = false;
        }

        if (data[0].playerId == GameManager.user.playerId && !data[0].isStandup) {
            this.onTableCloseLeave();
        }

        if (data[0].playerId == GameManager.user.playerId && data[0].isStandup) {
            this.resetView();
        }

        if (data[0].playerId == GameManager.user.playerId && !data[0].isStandup) {
            this.playerHand.forEach(function (element) {
                element.sitHerePanel.active = false;
            }, this);
        }

        if (this.isObserver2()) {
            this.chatCloseBtn.active = false;
        }
        else {
            this.chatCloseBtn.active = true;
        }
    },

    /**
     * @method isAutoAddOnAllowed
     * @param {Object} data -
     * @param {Number} playerIndex -
     * @description will be used later
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    isAutoAddOnAllowed: function () {
        var val = (this.model.gameData.channelType == K.ChannelType.Tournament);
        val = val && !(!!this.getMyPlayer()) && (!this.model.roomConfig.isAutoAddOnEnable) && (this.getMyPlayer().state == K.PlayerState.Playing);
        return val;


    },
    isAutoRebuyAllowed: function () {
        var val = (this.model.gameData.channelType == K.ChannelType.Tournament);

        return val;
    },
    /**
     * @method isStraddleAllowed   
     * @description straddle checkBox callback
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    isStraddleAllowed: function () {
        if (this.isTournament()) {
            return false;
        }
        var val = !(this.model.gameData.channelType == K.ChannelType.Tournament);
        val = val && (!!this.getMyPlayer()) && (!this.model.roomConfig.isStraddleEnable) && (this.getMyPlayer().state == K.PlayerState.Playing) && (this.getNumPlayerInTable() > 3);
        if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateStraddleCheckBox(val);
        }
        this.straddleCheckBox = val;
        return val;
    },

    playerCards: function (data, seatIndex) {
        this.forceAddPlayercardsData = data;
        this.forceAddPlayercardsSeatIndex = seatIndex;
    },

    forceAddPlayerCards: function () {
        if (cc.isValid(this.node)) {
            if (!!this.forceAddPlayercardsData) {
                this.playerHand[this.getRotatedSeatIndex(this.forceAddPlayercardsSeatIndex)].addPlayerCards(this.forceAddPlayercardsData);
            }
        }
    },


    /**
     * @method onPreCheck
     * @param {Object} data -
     * @description It Enable specified prechecks accordingly.
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onPreCheck: function (data) {
        this.preCheckCounter++;
        var value = (this.model.gameData.tableDetails.roundMaxBet - this.model.gameData.tableDetails.players[this.model.getPlayerById(GameManager.user.playerId)].totalRoundBet).roundOff(2);
        var myPlayer = this.getMyPlayer();
        var isMyTurn = myPlayer && (myPlayer.seatIndex === this.model.gameData.tableDetails.currentMoveIndex);
        if (!isMyTurn) {
            this.optionalPlayerInput.selectedValue = (data.precheckValue == "NONE") ? null : data.precheckValue;
        }
        this.enableTempPlayerInput(true, data.set, value, data.precheckValue);

        this.scheduleOnce(
            function () {
                var value = (this.model.gameData.tableDetails.roundMaxBet - this.model.gameData.tableDetails.players[this.model.getPlayerById(GameManager.user.playerId)].totalRoundBet).roundOff(2);
                this.optionalPlayerInput.tempTestFunction(value);

            }.bind(this), 1.0
        );
    },
    /**
     * @method onPlayerCoins
     * @param {Object} player -
     * @description Update players coin!
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onPlayerCoins: function (player) {
        this.playerHand[this.getRotatedSeatIndex(player.seatIndex)].updateCoins();
    },

    /**
     * @method enableTempPlayerInput
     * @param {} enable -
     * @param {} set -
     * @param {} val -
     * @description  handles input checkboxes to preselect the move player wants
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    enableTempPlayerInput: function (enable, set, val, selectedPreCheckValue = 'NONE') {
        this.optionalPlayerInput.enableTempPlayerInput(enable, set, val, selectedPreCheckValue); //uncomment when implemented with data
    },

    onToLobby: function () {
        this.toLobby();
    },

    onCancelReserveSeat: function () {
        this.unjoinBtn.node.parent.parent.active = false;
    },

    onJoinNewTable: function (tournamentId) {
        if (this.model.gameData.tournamentId == tournamentId) {
            var tti2 = this.tournamentTableInfo.getComponent("TournamentTableInfo");
            if (tti2) tti2.clear(this);

            this.resetGame();
            this.clearHoleCards();
            this.clearPots();
            if (this.totalPotLbl) {
                this.totalPotLbl.node.parent.active = false;

                this.totalPotLbl.string = "0";
                this.totalPotLbl.__string = "0";
            }
            this.model.gameData.tableDetails.totalPot = 0;
            // 
            this.reshufflingNotice.active = true;
        }
    },

    toLobby: function () {
        for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
            var playerIndex = this.model.getPlayerById(this.model.gameData.tableDetails.players[index].playerId);
            if (playerIndex != -1) {
                this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].backToLobby();
            }
        }
        GameScreen.onShowLobby();
        this.playAudio(K.Sounds.click);
    },

    /**
     * @method onRebuyTournament
     * @param {Number} amount -
     * @description  
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    onRebuyTournament: function (amount) {
        var popUp = PopUpType.PlayerInfoPopup;

        if (amount) {
            popUp = Pop
        }
        var data = {
            playerId: GameManager.user.playerId,
            tournamentId: this.model.roomConfig.tableId,
            // gameVersionCount: this.model.roomConfig.gameVersionCount,
        };
        TournamentHandler.rebuyInTournament(data, function (response) {
            if (response.success) {

            } else {
                var data = {};
                data.info = response.info;
                // data.disableTimer = true;
                GameManager.popUpManager.show(PopUpType.PlayerInfoPopup, data, function () { });
            }
        }.bind(this), null);
        this.playAudio(K.Sounds.click);
    },

    /**
     * @method showMuchHand
     * @param {object} eventData -
     * @param {boolean} flag -
     * @description  handles input checkboxes to preselect the move player wants
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    showMuchHand: function (eventData, flag) {
        this.playAudio(K.Sounds.click);
        this.muckHand = false;

        if (GameManager.popUpManager.isPopupActive(PopUpType.InGamePreferencesPopup, this.tablePopupHolder)) {
            GameManager.popUpManager.getPopupNode(PopUpType.InGamePreferencesPopup, this.tablePopupHolder).getComponent("InGamePreferencesPopup").muckHandCheckbox.node.parent.active = false;
        }

        if (flag == "true") {
            this.model.fireMuckHandEvent(() => {
                var _data = {
                    "channelId": this.model.gameData.channelId,
                    "playerId": this.model.gameData.playerId,
                    "roundId": this.model.gameData.tableDetails.roundId,
                    "isRequested": true
                };
                var _cb = function (response) {
                    // console.log("showWinnerHiddenCards", response);
                }.bind(this);
                if (this.isTournament()) {
                    TournamentServerCom.socketIORequest('common|room.channelHandler.showWinnerHiddenCards', _data, _cb, null, 5000, false);
                } else {
                    ServerCom.pomeloRequest('room.channelHandler.showWinnerHiddenCards', _data, _cb, null, 5000, false);
                }
            });
        }
    },
    addOnBtnCallBack: function () {

    },
    /**
     * @method activeDeactiveReBuyInBtn
     * @description  
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    activeDeactiveReBuyInBtn: function (value) {
        this.reBuyBtn2.active = value;
    },
    onReBuyBtn2: function () {
        this.model.onReBuyCall();
    },

    reBuyBtnCallBack: function () {

    },
    killTimers: function () {
        this.timersToKill.forEach(function (element) {
            clearTimeout(element);
        }, this);
        this.timersToKill = [];
        this._cancelPotSplitTasks();
        if (this.potAnimator && this.potAnimator.clearRunningSplits) {
            this.potAnimator.clearRunningSplits(true);
        }
        this.playerHand.forEach(function (element) {
            element.clearTimers();
        }, this);
    },

    displayRoundNumber: function () {
        if (this.model.gameData.tableDetails.hasBombPot) {
            this.bombInfoLabel.node.active = true;
            if (this.model.gameData.tableDetails.bombPotDurationType == "hands") {
                if (this.model.roomConfig.channelVariation == 'Bomb Pot 5' ||
                    this.model.roomConfig.channelVariation == 'Bomb Pot 6') {
                    this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB";
                } else {
                    this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + this.model.gameData.tableDetails.currentBombPotHand + "/" + this.model.gameData.tableDetails.bombPotDuration + " hands";
                }
            } else {
                this.bombInfoLabel.string = "Bomb Pot " + this.model.gameData.tableDetails.bombPotAmount + "BB  " + GameManager.formatRemainingSeconds(this.model.gameData.tableDetails.bombPotRemainingTime) + " minutes";
            }
        } else {
            this.bombInfoLabel.node.active = false;
        }

        this.roomNameLbl.string = GameManager.getVariName(this.model.roomConfig.channelVariation, this.model.gameData.tableDetails.canApplyBombPot);
        if (this.isTournament()) {
            if (this.model.gameData.tourData.tournamentType != "SIT N GO") {
                this.roomNameLbl.string = "MTT";
                if (!this._mttLblYAdjusted) {
                    this.roomNameLbl.node.y = this.roomNameLbl.node.y - 10;
                    this._mttLblYAdjusted = true;
                }
            } else {
                this.roomNameLbl.string = this.model.gameData.tourData.stageName;
            }
            if (this.handidLabel) this.handidLabel.node.active = false;
            if (this.tournamentTableInfo) {
                var tti2 = this.tournamentTableInfo.getComponent("TournamentTableInfo");
                if (tti2) tti2.setData(this);
            }
        } else {
            if (this.handidLabel) {
                this.handidLabel.node.active = true;
                this.handidLabel.string = "ID: " + this.model.gameData.tableDetails.roundNumber;
            }
        }

        if (this.model.roomConfig.channelVariation == "Mixed Game") {
            this.roomNameLbl.string = GameManager.getVariNameForMixedGame(this.model.gameData.tableDetails.currentMixedGameVariant, this.model.gameData.tableDetails.canApplyBombPot);
        }
        let stakes = GameManager.convertChips(this.model.roomConfig.smallBlind) + "/" + GameManager.convertChips(this.model.roomConfig.bigBlind);
        if (!this.isTournament()) {
            this.roomNameLbl2.string = "Blinds: " + stakes;
        }
    },

    onLobby: function () {
        for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
            var playerIndex = this.model.getPlayerById(this.model.gameData.tableDetails.players[index].playerId);
            if (playerIndex != -1) {
                this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].backToLobby();
            }
        }
        if (this.isObserver()) {
            var rawSocket = window.TournamentSocket;
            if (rawSocket) {
                rawSocket.emit("common", {
                    eventName: "room.channelHandler.observerLeave",
                    data: {
                        playerId: GameManager.user.playerId,
                        channelId: this.model.gameData.channelId,
                        isStandup: false,
                        playerName: GameManager.user.userName || "",
                        isRequested: true,
                    }
                });
            }
        }
        GameScreen.onShowLobby();
        this.playAudio(K.Sounds.click);
    },

    tryLeaveAgora: function () {
        for (var index = 0; index < this.model.gameData.tableDetails.players.length; index++) {
            var playerIndex = this.model.getPlayerById(this.model.gameData.tableDetails.players[index].playerId);
            if (playerIndex != -1) {
                this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].backToLobby();
            }
        }
    },

    OnLeaveJohny: function () {
        this.onLeaveTableClicked();
        this.playAudio(K.Sounds.click);
    },

    mobileGamePlayOptions: function () {
        GameManager.popUpManager.showIn(PopUpType.GameplayOptions, {
            'sitOutNextHandCheckBox': this.sitOutNextHandCheckBox,
            'sitOutNextHandCheckBoxSelection': this.sitOutNextHandCheckBoxSelection,
            'straddleCheckBox': this.straddleCheckBox,
            'straddleCheckBoxSelection': this.straddleCheckBoxSelection,
            'leaveNextHandTag': this.leaveNextHandTag,
            'pokerPresenter': this.node
        }, null, this.tablePopupHolder);

        this.scheduleOnce(function () {
            GameManager.emit("showJoinSimlar");
        }, 0);
    },

    mobileChatOptions: function () {
        GameManager.popUpManager.showIn(PopUpType.ChatInfoPanel, {
            'pokerPresenter': this.node
        }, null, this.tablePopupHolder);
        GameManager.emit("hideJoinSimlar");
    },

    onClose: function () {
        GameManager.popUpManager.hide(PopUpType.ChatInfoPanel, null, this.tablePopupHolder);
        GameManager.emit("showJoinSimlar");
    },

    onMobileHistoryClick: function () {
        GameManager.emit("hideJoinSimlar");
        this.model.showHandHistoryDetail();
        this.playAudio(K.Sounds.click);
    },

    onTournamentResultWinner: function (data) {
        this.playAudio(K.Sounds.click);
        GameManager.popUpManager.showIn(PopUpType.TournamentResult, {
            'data': data || {},
            'pokerPresenter': this.node
        }, null, this.tablePopupHolder);
        GameManager.emit("hideJoinSimlar");
    },

    onHideTournamentDetail: function () {
        GameManager.popUpManager.remove(PopUpType.TournamentInGameInfo, null, this.tablePopupHolder);
        GameManager.emit("showJoinSimlar");
    },

    isTournament: function () {
        if (!this.model || !this.model.roomConfig)
            return !!this.isTournament2;
        return this.model.roomConfig.channelType !== "NORMAL";
    },

    onShowRaisePanel() {
        if (GameManager.isMobile) {
            this.playerInputNode.active = false;
        }
        this.raisePanelNode.active = true;
    },

    onHideRaisePanel() {
        if (GameManager.isMobile) {
            this.playerInputNode.active = true;
        }
        this.raisePanelNode.active = false;
    },

    onGameResult() {
        let inst = this;
        if (this.isTournament()) {
            GameManager.popUpManager.showIn(PopUpType.TournamentInGameInfo, this.node, null, this.tablePopupHolder);
            GameManager.emit("showJoinSimlar");
            return;
        }
        GameManager.popUpManager.showIn(PopUpType.GameResult, this.model.gameData.channelId, null, this.tablePopupHolder);
        GameManager.emit("hideJoinSimlar");
    },

    updateBB() {
        this.potAmount.forEach(function (element) {
            element.parent.getChildByName("bb").getComponent(cc.Label).string = (Number(element.getComponent(cc.Label).__string) / this.model.gameData.tableDetails.bigBlind).toFixed(1) + 'BB';
        }, this);

        this.totalPotLbl.node.parent.getChildByName("bb").getComponent(cc.Label).string = (Number(this.totalPotLbl.__string) / this.model.gameData.tableDetails.bigBlind).toFixed(1) + 'BB';

        this.callAmountLabel.node.parent.getChildByName("bb").getComponent(cc.Label).string = (Number(this.callAmountLabel.string) / this.model.gameData.tableDetails.bigBlind).toFixed(1) + 'BB';

        if (GameManager.isBB && GameManager.user.settings.stackInBB) {
            this.potAmount.forEach(function (element) {
                element.opacity = 0;
                element.parent.getChildByName("bb").opacity = 255;
            }, this);

            this.totalPotLbl.node.scale = 0;
            this.totalPotLbl.node.parent.getChildByName("bb").scale = 0.5;

            this.callAmountLabel.node.scale = 0;
            this.callAmountLabel.node.parent.getChildByName("bb").scale = GameManager.isMobile ? 0.5 : 0.3;
        } else {
            this.potAmount.forEach(function (element) {
                element.opacity = 255;
                element.parent.getChildByName("bb").opacity = 0;
            }, this);

            this.totalPotLbl.node.scale = 0.5;
            this.totalPotLbl.node.parent.getChildByName("bb").scale = 0;

            this.callAmountLabel.node.scale = GameManager.isMobile ? 0.5 : 0.3;
            this.callAmountLabel.node.parent.getChildByName("bb").scale = 0;
        }

        this.betBtnSlider.updateBB();
    },

    switchBBNow() {
        this.updateBB();
    },

    onleaveNextHand: function () {
        if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
            GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder).leaveNextHandTag.active = true;
        }
        this.leaveNextHandTag = true;
    },

    onRemoveTable: function (data) {
        if (this.model && this.model.gameData && (data.channelId == this.model.gameData.channelId || data._id == this.model.gameData.channelId)) {
            GameManager.popUpManager.showIn(PopUpType.TableClosed, this.node, null, this.tablePopupHolder);
        }
    },

    onTableCloseLeave: function () {
        if (GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] === false) {
            GameManager.playerRequestedToLeaveTable[this.model.gameData.channelId] = true;
        }
        let cb = function () {
            for (var index = 0; index < this.playerHand.length; index++) {
                this.playerHand[index].clearPlayerCards();
            }
            this.clearHoleCards();
            this.clearPots();
        }
        this.model.leaveClosedTable();
    },

    onUpdateTableImage: function () {
        for (var i = 0; i < GameManager.tableImages.length; i++) {
            let stickerImages = GameManager.tableImages[i];
            if (GameManager.user.defaultTheme != "" && GameManager.user.defaultTheme._id) {
                if (stickerImages.___data._id == GameManager.user.defaultTheme._id) {
                    if (GameManager.isMobile) {
                        this.node.getChildByName('TableBg').getComponent(cc.Sprite).spriteFrame = GameManager.tableImages[i];
                    }
                };
            }
        }
    },

    updateRebuyChips: function (data) {
        var playerIndex = this.model.getPlayerById(data.playerId);
        if (playerIndex !== -1) {
            const receiver = this.getPlayerByIdx(playerIndex);
            receiver.playerData.chips = data.data.chips;
            receiver.amountLabel.string = Number(data.data.chips.toFixed(2));
        }
    },

    onChangeTheme: function () {
        GameManager.popUpManager.showIn(PopUpType.TableTheme, this.node, null, this.tablePopupHolder);
        GameManager.emit("enablePageView");
        GameManager.emit("showJoinSimlar");
    },

    onBuyInConfirmQuick: function (index, amount) {
        let self = this;
        ServerCom.pomeloRequest(
            'room.channelHandler.quickSeat', {
            roomId: this.model.gameData.tableDetails.roomId,
            isLoggedIn: true,
            access_token: K.Token.access_token,
            imageAvtar: '',
            chips: Number(amount),
            playerId: GameManager.user.playerId,
            playerName: GameManager.user.userName,
            isRequested: true,
        },
            function (response, data) {
                if (!response) {
                    GameManager.popUpManager.show(PopUpType.NotificationPopup, data.err.info, function () { });
                    return;
                }
                var route = K.PomeloAPI.joinChannel;
                GameManager.join2(response.data.channelId, route, {
                    "channelId": response.data.channelId,
                    "isRequested": true,
                    "channelType": response.data.channelType,
                    "tableId": '',
                    "playerId": GameManager.user.playerId,
                    "playerName": GameManager.user.userName,
                    "networkIp": LoginData.ipV4Address,
                    'maxPlayers': 5,
                    'isPrivateTable': false
                });
            }, null, 5000, false
        );
    },

    quickSeat: function () {
        GameManager.activeTableCount = GameScreen.gridParent.getComponent(cc.PageView).getPages().length;
        if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
            GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
            return;
        }

        var data = {};
        data.minValue = this.model.roomConfig.minBuyIn;
        data.maxValue = this.model.roomConfig.maxBuyIn;
        const text_chips = "Available Chips" + ':';
        if (GameManager.user.category == "DIAMOND") {
            data.totalChips = GameManager.user.realChips;
        } else {
            data.totalChips = GameManager.user.freeChips;
        }
        data.dialogHeadingText = text_chips;
        data.autoBuyIn = GameManager.user.autoBuyIn;
        data.confirm = this.onBuyInConfirmQuick.bind(this);
        data.channelId = this.model.gameData.tableDetails.roomId;
        data.isRealMoney = true;
        data.autoConfirm = true;
        data.config = this.model.roomConfig;
        data.isAllInAndFold = this.model.roomConfig.isAllInAndFold;
        data.topHeading = "Buy In";
        GameManager.popUpManager.showIn(PopUpType.BuyInPopup, data, null, this.tablePopupHolder);

    },
    onLeaveChatChannel: function (channelId) {
        if (channelId == this.model.gameData.channelId) {
            GameManager.off("LEAVE_CHAT_CHANNEL", this._onLeaveChatChannel);

            if (!K.AgoraEnabled || !this.model.roomConfig.liveStreaming) {
                return;
            }
            if (this.model && this.model.gameData) {
                window.MGR_AGORA.leaveRoom(
                    K.ServerAddress.agora_appid,
                    this.model.gameData.agoraChannelName,
                    this.model.gameData.agoraToken,
                    0
                );
            }
        }
    },

    onTournamentAddonPeriodOver: function (data) {
        if (this.model.gameData.tournamentId == data.data.eventData.tournamentId) {
            GameManager.popUpManager.remove(PopUpType.RebuyAddOnToast, null, this.tablePopupHolder);
            GameManager.popUpManager.remove(PopUpType.RebuyAddOnCountdown, null, this.breakAndAddonHolder);
            GameManager.popUpManager.remove(PopUpType.AddOnPopup, null, this.tablePopupHolder);

            this.model.gameData.tourData.isAddOn = false;
            this.model.tourData.isAddOn = false;
        }
    },

    onTournamentAddonPeriodStart: function (data) {
        if (this.model.gameData.tournamentId == data.data.eventData.tournamentId) {
            this.model.gameData.tourData.isAddOn = true;
            this.model.tourData.isAddOn = true;
        }
    },

    onEnv: function () {
        GameManager.popUpManager.showIn(PopUpType.VoiceControlSettings, this.node, null, this.tablePopupHolder);
    },

    onToggleSound: function () {
        GameManager.playSound(K.Sounds.click);
        var data = {};
        data.query = {};
        data.query.playerId = GameManager.user.playerId;
        data.updateKeys = {};
        GameManager.user.muteGameSound = !GameManager.user.muteGameSound;
        data.updateKeys["settings.muteGameSound"] = GameManager.user.muteGameSound;
        if (GameManager.user.muteGameSound) {
            cc.audioEngine.stopAll();
        }
        GameManager.playMusic(!GameManager.user.muteGameSound);
        ServerCom.pomeloRequest(K.PomeloAPI.updateProfile, data, function (data) {
            if (data.success) { } else { }
        }.bind(this), null, 5000, false);
    },

    onToggleAutoPlayAudioMute: function () {
        jsb.reflection.callStaticMethod("RootViewController", "updatePlayAudio:", this.recordAudioToggle.state);
    },

    onToggleAutoPlayVideoMute: function () {
        jsb.reflection.callStaticMethod("RootViewController", "updatePlayVideo:", this.recordVideoToggle.state);
    },

    showMyCards: function () {
        var playerPresenter = this.getMyPlayer();
        if (!playerPresenter) {
            return;
        }
        var presenter = this.playerHand[this.getRotatedSeatIndex(playerPresenter.seatIndex)];
        if (!presenter) {
            return;
        }
        presenter.cardHolderMy.children.forEach(function (e) {
            e.getComponent("Card").reveal(true);
        });
    },

    onBombPotTimerStarted: function (data) {
        if (!!this.model && this.model.gameData.channelId == data.channelId) {
            this.model.gameData.tableDetails.bombPotRemainingTime = data.remainingSeconds;
            this.updateBombPotTimer();
        }
    },

    hideMyCards: function () {
        var playerPresenter = this.getMyPlayer();
        if (!playerPresenter) {
            return;
        }
        var presenter = this.playerHand[this.getRotatedSeatIndex(playerPresenter.seatIndex)];
        if (!presenter) {
            return;
        }
        presenter.cardHolderMy.children.forEach(function (e) {
            e.getComponent("Card").reveal(false);
        });
    },

    leavePage: function () {
        if (this.enterPageTimer) {
            this.unschedule(this.enterPageTimer);
            this.enterPageTimer = null;
        }

        var selfIndex = this.model.getPlayerById(this.model.gameData.playerId);
        if (selfIndex != -1) {
            this.playerHand[selfIndex].leaveRoom();
        }
    },

    enterPage: function () {
        var selfIndex = this.model.getPlayerById(this.model.gameData.playerId);
        if (selfIndex != -1) {
            this.enterPageTimer = this.scheduleOnce(function () {
                if (this.getPlayerByIdx(selfIndex) && this.getPlayerByIdx(selfIndex).playerData) {
                    this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(selfIndex).playerData.seatIndex)].enableAgoraWhenSit();
                }
            }.bind(this), 2);
        }
    },

    restoreTournament: function (isReshuffle = false) {
        if (!this.isTournament()) {
            return;
        }

        if (isReshuffle) {
            console.log('[Reshuffle]', 'PokerPresenter/restoreTournament');
        }

        GameManager.popUpManager.remove(PopUpType.BuyInPopup, function () { }, this.tablePopupHolder);
        var _tourRaw = this.model.gameData.tourData;
        var _tableDetails = this.model.gameData.tableDetails;
        var _isOnBreak = _tourRaw.isInBreak || _tableDetails.isOnBreak;
        var _channelBreak = this.model.gameData && this.model.gameData['break'];
        var _tableBreakActive = _channelBreak ?
            !!_channelBreak.active :
            (_tableDetails.state !== K.GameState.Running);
        if (_tourRaw.tournamentType != "SIT N GO" && _isOnBreak && _tableBreakActive) {
            if (!_tourRaw.isInBreak && _tableDetails.breakEnds) {
                _tourRaw.isInBreak = true;
                _tourRaw.currentBreakDetails = {
                    breakEndTime: _tableDetails.breakEnds
                };
            }
            GameManager.popUpManager.remove(PopUpType.TournamentBreakComingSoon, null, this.tablePopupHolder);
            GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, _tourRaw, null, this.breakAndAddonHolder);

        } else if (_tourRaw.isInRebuy) {
            this.onRebuyActivated(_tourRaw.currentRebuy || {
                "rebuyTimer": parseInt((_tourRaw.currentRebuy.rebuyEndTime - Date.now()) / 1000)
            });
        }
        var _rawRebuy = this.model.gameData.rebuy;
        if (_rawRebuy && _rawRebuy.active && _rawRebuy.tableOffers && _rawRebuy.tableOffers.length) {
            var _myPlayerId = this.model.gameData.playerId;
            var _myOffer = _rawRebuy.tableOffers.find(function (o) {
                return String(o.playerId) === String(_myPlayerId);
            });
            if (_myOffer) {
                var _tourRawForOffer = this.model.gameData.tourData;
                var _offerData = Object.assign({}, _rawRebuy, _myOffer, {
                    tournamentId: this.model.gameData.tournamentId,
                    activePlayers: _tourRawForOffer && _tourRawForOffer.activePlayerCount,
                    totalEntries: _tourRawForOffer && _tourRawForOffer.uniqueEntries,
                    avgStack: _tourRawForOffer && _tourRawForOffer.alltableStack && _tourRawForOffer.alltableStack.avgStack,
                    currentBlindLevel: _tourRawForOffer && _tourRawForOffer.currentBlindLevel,
                    lateRegLevel: _tourRawForOffer && _tourRawForOffer.lateRegistration && _tourRawForOffer.lateRegistration.lateRegistrationTillBlind
                });
                GameManager.emit("hideJoinSimlar");

                GameManager.popUpManager.showIn(PopUpType.ReBuyPoup, {
                    "tourData": _offerData,
                    "pokerPresenter": this.node
                }, null, this.tablePopupHolder);
            }
        }
        if (_rawRebuy && _rawRebuy.tableOffers && _rawRebuy.tableOffers.length) {
            var _presenterForSeats = this;
            _rawRebuy.tableOffers.forEach(function (offer) {
                var _idx = _presenterForSeats.model.getPlayerById(offer.playerId);
                if (_idx !== -1) {
                    var _seat = _presenterForSeats.getPlayerByIdx(_idx);
                    if (_seat && _seat.showRebuyIndicator) _seat.showRebuyIndicator();
                }
            });
        }
    },

    joinSimilarTable() {
        GameManager.joinSimilar();
    },

    onHandStrengthOff() {
        this.bestHand.node.parent.active = false;
    },

    onGameShow: function () {
        this.ignoreNextGameStart = true;

        this.scheduleOnce(() => {
            this.ignoreNextGameStart = false;
        }, 1.0);

        this._flushPendingPotSplitOnForeground();

        if (this.bombAnimationTimer) {
            clearTimeout(this.bombAnimationTimer);
            this.bombAnimationTimer = null;
        }
        this.isBombPotGame.getComponent(cc.Animation).stop();
        this.isBombPotGame.active = false;

        this.scheduleOnce(() => {
            if (this.model && !this.model.isPlayerStandUp()) {
                let myPlayer = this.getMyPlayer();
                if (myPlayer) {
                    let chips = (this.model.roomConfig.channelVariation === "Open Face Chinese Poker") ? myPlayer.points : myPlayer.chips;
                    if (chips <= 0 && (myPlayer.state === K.PlayerState.OnBreak || myPlayer.state === K.PlayerState.OutOfMoney)) {
                        this.resumeBtn.active = true;
                        if (GameManager.popUpManager.isPopupActive(PopUpType.GameplayOptions, this.tablePopupHolder)) {
                            GameManager.popUpManager.getPopupNode(PopUpType.GameplayOptions, this.tablePopupHolder).getComponent("GameplayOptions").updateSitOutNextHandCheckBox(false);
                        }
                        this.sitOutNextHandCheckBox = false;
                        this.handleSitAllBtn();
                    }
                }
            }
        }, 3.0);
    },

    onGameHide: function () { },

    showJackpotWin: function (data) {
        if (K.BBJEnabled) {
            console.log("bbjWin", data);
            if (!!this.model && this.model.gameData.channelId == data.channelId) {
                console.log("IdMatch poker Table for bbj " + this.model.gameData.channelId + "  or  " + data.channelId);
                GameManager.popUpManager.showIn(PopUpType.bbjWinnerPopup, data, null, this.tablePopupHolder);
            }

        }
    },

    showHighHandWin: function (data) {
        console.log("highHandWin 1 ", data);
        if (data.event == "ROUND_ENDED") {
            if (data.winners.length > 0) {
                console.log("highHandWin", data);
                let last_player = data.winners.length - 1;
                if (!!this.model && this.model.gameData.channelId == data.winners[0].channelId) {
                    console.log("IdMatch poker Table for highHand " + this.model.gameData.channelId + "  or  " + data.winners[0].channelId);
                    GameManager.popUpManager.showIn(PopUpType.HighHandWinner, data, null, this.tablePopupHolder);
                }
            }
        }
        if (data.event == "EVENT_BEGIN") {
            K.highHandEnableInGame = true;
            this.setHighHandIcon();
        }

        if (data.event == "EVENT_COMPLETED") {
            K.highHandEnableInGame = false;
            this.setHighHandIcon();
        }
    },

    showHighHand() {
        this.getHighHandStatus((response) => {
            if (K.highHandEnableInGame) {
                GameManager.popUpManager.showIn(PopUpType.HighHandPopup, response, null, this.tablePopupHolder);
            }
        });
    },

    getHighHandStatus(cb) {
        ServerCom.httpGetRequest(K.ServerAddress.otp_server + "/api/highHand/status",
            null,
            (response) => {
                console.log("highHandData", response);
                K.highHandEnableInGame = response.data.hasActiveEvent;
                if (cb) {
                    cb(response);
                }
                this.setHighHandIcon();

            },
            (error) => {
                console.log("highHandData error", error);
            }
        );
    },

    setHighHandIcon() {
        if (this.isTournament()) return;
        this.highHandNode.node.active = K.HighHandEnabled;
        this.highHandNode.spriteFrame = K.highHandEnableInGame ? this.highHandIcons[0] : this.highHandIcons[1];
    },

    onReturnUncalledBet(data) {
        var playerIndex = this.model.getPlayerById(data.playerId);
        if (playerIndex != -1) {
            let player = this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].node;

            console.log("player", player);

            let refundPot = cc.instantiate(this.refundPotTemplate);
            refundPot.active = true;
            refundPot.parent = player.parent.parent;
            if (GameManager.isBB) {
                var bigBlind = this.model.roomConfig.bigBlind;
                refundPot.getChildByName("PotAmount").getComponent(cc.Label).string = (data.uncalledAmount / bigBlind).toFixed(1) + 'BB';
            } else {
                refundPot.getChildByName("PotAmount").getComponent(cc.Label).string = data.uncalledAmount;
            }
            refundPot.runAction(
                cc.sequence(
                    cc.moveTo(1, player.parent.x, player.parent.y),
                    cc.delayTime(0.5),
                    cc.callFunc(() => {
                        refundPot.removeFromParent(true);
                        this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].amountLabel.string = GameManager.convertChips(data.totalChips);
                        const playerPresenter = this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)];
                        playerPresenter.amountLabel.string = GameManager.convertChips(data.totalChips);
                        playerPresenter.playerData.chips = data.totalChips;
                        playerPresenter.updateBB();
                    })
                )
            );
        }
    },

    onRefundChips(data) {
        var playerIndex = this.model.getPlayerById(data.playerId);
        if (playerIndex != -1) {
            let player = this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].node;

            console.log("player", player);

            let refundPot = cc.instantiate(this.refundPotTemplate);
            refundPot.active = true;
            refundPot.parent = player.parent.parent;
            if (GameManager.isBB) {
                var bigBlind = this.model.roomConfig.bigBlind;
                refundPot.getChildByName("PotAmount").getComponent(cc.Label).string = (data.refundAmount / bigBlind).toFixed(1) + 'BB';
            } else {
                refundPot.getChildByName("PotAmount").getComponent(cc.Label).string = data.refundAmount;
            }
            refundPot.runAction(
                cc.sequence(
                    cc.moveTo(1, player.parent.x, player.parent.y),
                    cc.delayTime(0.5),
                    cc.callFunc(() => {
                        refundPot.removeFromParent(true);

                        if (this.model.gameData.tableDetails.players[playerIndex]) {
                            this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)].amountLabel.string = GameManager.convertChips(data.totalChips);
                            const playerPresenter = this.playerHand[this.getRotatedSeatIndex(this.getPlayerByIdx(playerIndex).playerData.seatIndex)];
                            playerPresenter.amountLabel.string = GameManager.convertChips(data.totalChips);
                            playerPresenter.playerData.chips = data.totalChips;
                            playerPresenter.updateBB();
                        }
                    })
                )
            );
        }
    },

    onSideTableUpdate: function (data) {
        if (data._id != this.model.gameData.channelId) {
            return;
        }
        switch (data.event) {
            case "TABLEVIEWNEWPLAYER":
                break;
            case "TABLEVIEWLEFTPLAYER":
                break;
            case "TABLEVIEWCHIPSUPDATE":
                break;
            case "TABLEVIEWNEWWAITINGPLAYER":
                this.model.gameData.waitingListCount = data.queuePlayers;
                this.joinBtn.node.parent.getChildByName('position').getChildByName('th').getComponent(cc.Label).string = data.queuePlayers;
                break;
            case "TABLEVIEWLEFTWAITINGPLAYER":
                this.model.gameData.waitingListCount = data.queuePlayers;
                this.joinBtn.node.parent.getChildByName('position').getChildByName('th').getComponent(cc.Label).string = data.queuePlayers;
                break;
        }
    },

    onUpdateWaitingPlayers: function (data) {
        this.onSideTableUpdate(data);
    },
});