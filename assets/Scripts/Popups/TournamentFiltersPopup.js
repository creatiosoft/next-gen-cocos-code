var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
const TournamentLobbyListPresenter = require("TournamentLobbyListPresenter").TournamentLobbyListPresenter;

/**
 * @classdesc 
 * @class DissconnectPopup
 * @extends PopUpBase
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {
        sortBy: {
            default: null,
            type: cc.Toggle
        },
        format: {
            default: null,
            type: cc.Toggle
        },
        type: {
            default: null,
            type: cc.Toggle
        },
        cate: {
            default: null,
            type: cc.Toggle
        },
        buyin: {
            default: null,
            type: cc.Toggle
        },

        sortByContent: {
            default: null,
            type: cc.Node
        },
        formatContent: {
            default: null,
            type: cc.Node
        },
        typeContent: {
            default: null,
            type: cc.Node
        },
        cateContent: {
            default: null,
            type: cc.Node
        },
        buyinContent: {
            default: null,
            type: cc.Node
        },

        sortByCountLabel: {
            default: null,
            type: cc.Label
        },
        formatCountLabel: {
            default: null,
            type: cc.Label
        },
        typeCountLabel: {
            default: null,
            type: cc.Label
        },
        cateCountLabel: {
            default: null,
            type: cc.Label
        },
        buyinCountLabel: {
            default: null,
            type: cc.Label
        },

        timeAsc: {
            default: null,
            type: cc.Toggle
        },
        timeDesc: {
            default: null,
            type: cc.Toggle
        },
        buyinAsc: {
            default: null,
            type: cc.Toggle
        },
        buyinDesc: {
            default: null,
            type: cc.Toggle
        },
        prizeDesc: {
            default: null,
            type: cc.Toggle
        },

        formatAll: {
            default: null,
            type: cc.Toggle
        },
        rebuy: {
            default: null,
            type: cc.Toggle
        },
        reentry: {
            default: null,
            type: cc.Toggle
        },

        typeAll: {
            default: null,
            type: cc.Toggle
        },
        nlh: {
            default: null,
            type: cc.Toggle
        },
        plo: {
            default: null,
            type: cc.Toggle
        },

        buyinAll: {
            default: null,
            type: cc.Toggle
        },
        low: {
            default: null,
            type: cc.Toggle
        },
        mid: {
            default: null,
            type: cc.Toggle
        },
        high: {
            default: null,
            type: cc.Toggle
        },

        cateAll: {
            default: null,
            type: cc.Toggle
        },
        upcoming: {
            default: null,
            type: cc.Toggle
        },
        registration: {
            default: null,
            type: cc.Toggle
        },
        running: {
            default: null,
            type: cc.Toggle
        },
        lateRegistration: {
            default: null,
            type: cc.Toggle
        },
        completed: {
            default: null,
            type: cc.Toggle
        },
    },


    /**
     * @description Method called from popUpManager to set initial view of this popUp using some data
     * @method onShow
     * @param {Object} data
     * @memberof Popups.DisconnectPopup#
     */
    onShow: function (data) {
        this.updateAll();
    },

    updateAll: function() {
        this.sortBy.check();

        this.buyinAll.isChecked = TournamentLobbyListPresenter.buyinAllFilter;
        this.low.isChecked = TournamentLobbyListPresenter.lowFilter;
        this.mid.isChecked = TournamentLobbyListPresenter.midFilter;
        this.high.isChecked = TournamentLobbyListPresenter.highFilter;

        this.rebuy.isChecked = TournamentLobbyListPresenter.rebuyFilter;
        this.reentry.isChecked = TournamentLobbyListPresenter.reentryFilter;
        this.formatAll.isChecked = TournamentLobbyListPresenter.formatAllFilter;

        this.nlh.isChecked = TournamentLobbyListPresenter.nlhFilter;
        this.plo.isChecked = TournamentLobbyListPresenter.ploFilter;
        this.typeAll.isChecked = TournamentLobbyListPresenter.typeAllFilter;

        this.upcoming.isChecked = TournamentLobbyListPresenter.upcomingFilter;
        this.registration.isChecked = TournamentLobbyListPresenter.registrationFilter;
        this.running.isChecked = TournamentLobbyListPresenter.runningFilter;
        this.lateRegistration.isChecked = TournamentLobbyListPresenter.lateRegistration;
        this.completed.isChecked = TournamentLobbyListPresenter.completedFilter;
        this.cateAll.isChecked = TournamentLobbyListPresenter.cateAllFilter;


        let count = 0;
        if (this.low.isChecked) {
            count += 1;
        }
        if (this.mid.isChecked) {
            count += 1;
        }
        if (this.high.isChecked) {
            count += 1;
        }
        if (this.buyinAll.isChecked) {
            count = 3;

            this.low.isChecked = true;
            this.mid.isChecked = true;
            this.high.isChecked = true;
        }
        this.buyinCountLabel.string = count + " Selected";

        count = 0;
        if (this.rebuy.isChecked) {
            count += 1;
        }
        if (this.reentry.isChecked) {
            count += 1;
        }
        if (this.formatAll.isChecked) {
            count = 2;

            this.rebuy.isChecked = true;
            this.reentry.isChecked = true;
        }

        this.formatCountLabel.string = count + " Selected";
        count = 0;
        if (this.nlh.isChecked) {
            count += 1;
        }
        if (this.plo.isChecked) {
            count += 1;
        }
        if (this.typeAll.isChecked) {
            count = 2;

            this.nlh.isChecked = true;
            this.plo.isChecked = true;
        }

        this.typeCountLabel.string = count + " Selected";
        count = 0;
        if (this.upcoming.isChecked) {
            count += 1;
        }
        if (this.registration.isChecked) {
            count += 1;
        }
        if (this.running.isChecked) {
            count += 1;
        }
        if (this.lateRegistration.isChecked) {
            count += 1;
        }
        if (this.completed.isChecked) {
            count += 1;
        }
        if (this.cateAll.isChecked) {
            count = 5;

            this.upcoming.isChecked = true;
            this.registration.isChecked = true;
            this.running.isChecked = true;
            this.lateRegistration.isChecked = true;
            this.completed.isChecked = true;
        }

        this.cateCountLabel.string = count + " Selected";
    },

    onLoad: function () {
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.TournamentFiltersPopup, function () {});
        if (this.callback) {
            this.callback();
        }
    },

    onSortBy: function () {
        this.sortByContent.active = true;
        this.formatContent.active = false;
        this.typeContent.active = false;
        this.cateContent.active = false;
        this.buyinContent.active = false;
    },

    onFormat: function () {
        this.sortByContent.active = false;
        this.formatContent.active = true;
        this.typeContent.active = false;
        this.cateContent.active = false;
        this.buyinContent.active = false;
    },

    onType: function () {
        this.sortByContent.active = false;
        this.formatContent.active = false;
        this.typeContent.active = true;
        this.cateContent.active = false;
        this.buyinContent.active = false;
    },

    onCate: function () {
        this.sortByContent.active = false;
        this.formatContent.active = false;
        this.typeContent.active = false;
        this.cateContent.active = true;
        this.buyinContent.active = false;
    },

    onBuyin: function () {
        this.sortByContent.active = false;
        this.formatContent.active = false;
        this.typeContent.active = false;
        this.cateContent.active = false;
        this.buyinContent.active = true;
    },


    onTimeAscToggle: function() {
        this.sortByCountLabel.string = "Time: Ascending";
    },

    onTimeDescToggle: function() {
        this.sortByCountLabel.string = "Time: Descending";
    },

    onBuyinAscToggle: function() {
        this.sortByCountLabel.string = "Buy-in: Low to High";
    },

    onBuyinDescToggle: function() {
        this.sortByCountLabel.string = "Buy-in: High to Low";
    },

    onPrizeDescToggle: function() {
        this.sortByCountLabel.string = "Prize: High to Low";
    },

    onFormatAllToggle: function() {
        // if (!this.rebuy.isChecked &&
        //     !this.reentry.isChecked) {
        //     this.formatAll.isChecked = true;
        // }
        this.formatAll.isChecked = true;
        this.rebuy.isChecked = true;
        this.reentry.isChecked = true;
        this.formatCountLabel.string = "2 Selected";
    },

    onRebuyToggle: function() {
        if (!this.rebuy.isChecked) {
            this.formatAll.isChecked = false;
        }
        if (this.rebuy.isChecked && this.reentry.isChecked) {
            this.formatAll.isChecked = true;
        } 

        // if (!this.rebuy.isChecked &&
        //     !this.reentry.isChecked) {
        //     this.formatAll.isChecked = true;
        // }
        // if (this.rebuy.isChecked &&
        //     this.reentry.isChecked) {
        //     this.formatAll.isChecked = true;
        //     this.rebuy.isChecked = false;
        //     this.reentry.isChecked = false;
        // }
        // else if (this.rebuy.isChecked ||
        //     this.reentry.isChecked) {
        //     this.formatAll.isChecked = false;
        // }

        let count = 0;
        if (this.rebuy.isChecked) {
            count += 1;
        }
        if (this.reentry.isChecked) {
            count += 1;
        }

        this.formatCountLabel.string = count + " Selected";
    },

    onReentryToggle: function() {
        if (!this.reentry.isChecked) {
            this.formatAll.isChecked = false;
        }
        if (this.rebuy.isChecked && this.reentry.isChecked) {
            this.formatAll.isChecked = true;
        } 

        // if (!this.rebuy.isChecked &&
        //     !this.reentry.isChecked) {
        //     this.formatAll.isChecked = true;
        // }
        // if (this.rebuy.isChecked &&
        //     this.reentry.isChecked) {
        //     this.formatAll.isChecked = true;
        //     this.rebuy.isChecked = false;
        //     this.reentry.isChecked = false;
        // }
        // else if (this.rebuy.isChecked ||
        //     this.reentry.isChecked) {
        //     this.formatAll.isChecked = false;
        // }

        let count = 0;
        if (this.rebuy.isChecked) {
            count += 1;
        }
        if (this.reentry.isChecked) {
            count += 1;
        }

        this.formatCountLabel.string = count + " Selected";
    },

    onTypeAllToggle: function() {
        // if (!this.nlh.isChecked &&
        //     !this.plo.isChecked) {
        //     this.typeAll.isChecked = true;
        // }

        this.typeAll.isChecked = true;
        this.nlh.isChecked = true;
        this.plo.isChecked = true;

        this.typeCountLabel.string = "2 Selected";
    },

    onNlhToggle: function() {

        if (!this.nlh.isChecked) {
            this.typeAll.isChecked = false;
        }
        if (this.nlh.isChecked && this.plo.isChecked) {
            this.typeAll.isChecked = true;
        } 

        let count = 0;
        if (this.nlh.isChecked) {
            count += 1;
        }
        if (this.plo.isChecked) {
            count += 1;
        }

        this.typeCountLabel.string = count + " Selected";
    },

    onpPloToggle: function() {
        if (!this.plo.isChecked) {
            this.typeAll.isChecked = false;
        }
        if (this.nlh.isChecked && this.plo.isChecked) {
            this.typeAll.isChecked = true;
        } 

        let count = 0;
        if (this.nlh.isChecked) {
            count += 1;
        }
        if (this.plo.isChecked) {
            count += 1;
        }

        this.typeCountLabel.string = count + " Selected";
    },

    onBuyInAllToggle: function() {
        // if (!this.buyinAll.isChecked &&
        //     !this.low.isChecked &&
        //     !this.mid.isChecked &&
        //     !this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        // }

        this.buyinAll.isChecked = true;
        this.low.isChecked = true;
        this.mid.isChecked = true;
        this.high.isChecked = true;

        this.typeCountLabel.string = "3 Selected";
    },

    onLowToggle: function() {
        if (!this.low.isChecked) {
            this.buyinAll.isChecked = false;
        }
        if (this.low.isChecked && this.mid.isChecked && this.high.isChecked) {
            this.buyinAll.isChecked = true;
        } 

        // if (!this.buyinAll.isChecked &&
        //     !this.low.isChecked &&
        //     !this.mid.isChecked &&
        //     !this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        // }
        // if (this.low.isChecked &&
        //     this.mid.isChecked &&
        //     this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        //     this.low.isChecked = false;
        //     this.mid.isChecked = false;
        //     this.high.isChecked = false;
        // }
        // else if (this.low.isChecked ||
        //     this.mid.isChecked ||
        //     this.high.isChecked) {
        //     this.buyinAll.isChecked = false;
        // }

        let count = 0;
        if (this.low.isChecked) {
            count += 1;
        }
        if (this.mid.isChecked) {
            count += 1;
        }
        if (this.high.isChecked) {
            count += 1;
        }

        this.buyinCountLabel.string = count + " Selected";
    },

    onMidToggle: function() {
        if (!this.mid.isChecked) {
            this.buyinAll.isChecked = false;
        }
        if (this.low.isChecked && this.mid.isChecked && this.high.isChecked) {
            this.buyinAll.isChecked = true;
        } 

        // if (!this.low.isChecked &&
        //     !this.mid.isChecked &&
        //     !this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        // }
        // if (this.low.isChecked &&
        //     this.mid.isChecked &&
        //     this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        //     this.low.isChecked = false;
        //     this.mid.isChecked = false;
        //     this.high.isChecked = false;
        // }
        // else if (this.low.isChecked ||
        //     this.mid.isChecked ||
        //     this.high.isChecked) {
        //     this.buyinAll.isChecked = false;
        // }

        let count = 0;
        if (this.low.isChecked) {
            count += 1;
        }
        if (this.mid.isChecked) {
            count += 1;
        }
        if (this.high.isChecked) {
            count += 1;
        }

        this.buyinCountLabel.string = count + " Selected";
    },

    onHighToggle: function() {
        if (!this.high.isChecked) {
            this.buyinAll.isChecked = false;
        }
        if (this.low.isChecked && this.mid.isChecked && this.high.isChecked) {
            this.buyinAll.isChecked = true;
        } 

        // if (!this.low.isChecked &&
        //     !this.mid.isChecked &&
        //     !this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        // }
        // if (this.low.isChecked &&
        //     this.mid.isChecked &&
        //     this.high.isChecked) {
        //     this.buyinAll.isChecked = true;
        //     this.low.isChecked = false;
        //     this.mid.isChecked = false;
        //     this.high.isChecked = false;
        // }
        // else if (this.low.isChecked ||
        //     this.mid.isChecked ||
        //     this.high.isChecked) {
        //     this.buyinAll.isChecked = false;
        // }

        let count = 0;
        if (this.low.isChecked) {
            count += 1;
        }
        if (this.mid.isChecked) {
            count += 1;
        }
        if (this.high.isChecked) {
            count += 1;
        }

        this.buyinCountLabel.string = count + " Selected";
    },

    onCateAllToggle: function() {
        // if (!this.upcoming.isChecked &&
        //     !this.registration.isChecked &&
        //     !this.running.isChecked &&
        //     !this.lateRegistration.isChecked &&
        //     !this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        // }

        this.cateAll.isChecked = true;
        this.upcoming.isChecked = true;
        this.registration.isChecked = true;
        this.running.isChecked = true;
        this.lateRegistration.isChecked = true;
        this.completed.isChecked = true;

        this.cateCountLabel.string = "5 Selected";
    },

    onUpcomingToggle: function() {
        if (!this.upcoming.isChecked) {
            this.cateAll.isChecked = false;
        }
        if (this.upcoming.isChecked && this.registration.isChecked && this.running.isChecked && this.lateRegistration.isChecked && this.completed.isChecked) {
            this.cateAll.isChecked = true;
        } 

        // if (!this.upcoming.isChecked &&
        //     !this.registration.isChecked &&
        //     !this.running.isChecked &&
        //     !this.lateRegistration.isChecked &&
        //     !this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        // }
        // if (this.upcoming.isChecked &&
        //     this.registration.isChecked &&
        //     this.running.isChecked &&
        //     this.lateRegistration.isChecked &&
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        //     this.upcoming.isChecked = false;
        //     this.registration.isChecked = false;
        //     this.running.isChecked = false;
        //     this.lateRegistration.isChecked = false;
        //     this.completed.isChecked = false;
        // }
        // else if (this.upcoming.isChecked ||
        //     this.registration.isChecked ||
        //     this.running.isChecked ||
        //     this.lateRegistration.isChecked ||
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = false;
        // }

        let count = 0;
        if (this.upcoming.isChecked) {
            count += 1;
        }
        if (this.registration.isChecked) {
            count += 1;
        }
        if (this.running.isChecked) {
            count += 1;
        }
        if (this.lateRegistration.isChecked) {
            count += 1;
        }
        if (this.completed.isChecked) {
            count += 1;
        }

        this.cateCountLabel.string = count + " Selected";
    },

    onRegistrationToggle: function() {
        if (!this.registration.isChecked) {
            this.cateAll.isChecked = false;
        }
        if (this.upcoming.isChecked && this.registration.isChecked && this.running.isChecked && this.lateRegistration.isChecked && this.completed.isChecked) {
            this.cateAll.isChecked = true;
        } 

        // if (!this.upcoming.isChecked &&
        //     !this.registration.isChecked &&
        //     !this.running.isChecked &&
        //     !this.lateRegistration.isChecked &&
        //     !this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        // }
        // if (this.upcoming.isChecked &&
        //     this.registration.isChecked &&
        //     this.running.isChecked &&
        //     this.lateRegistration.isChecked &&
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        //     this.upcoming.isChecked = false;
        //     this.registration.isChecked = false;
        //     this.running.isChecked = false;
        //     this.lateRegistration.isChecked = false;
        //     this.completed.isChecked = false;
        // }
        // else if (this.upcoming.isChecked ||
        //     this.registration.isChecked ||
        //     this.running.isChecked ||
        //     this.lateRegistration.isChecked ||
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = false;
        // }

        let count = 0;
        if (this.upcoming.isChecked) {
            count += 1;
        }
        if (this.registration.isChecked) {
            count += 1;
        }
        if (this.running.isChecked) {
            count += 1;
        }
        if (this.lateRegistration.isChecked) {
            count += 1;
        }
        if (this.completed.isChecked) {
            count += 1;
        }

        this.cateCountLabel.string = count + " Selected";
    },

    onRunningToggle: function() {
        if (!this.running.isChecked) {
            this.cateAll.isChecked = false;
        }
        if (this.upcoming.isChecked && this.registration.isChecked && this.running.isChecked && this.lateRegistration.isChecked && this.completed.isChecked) {
            this.cateAll.isChecked = true;
        } 

        // if (!this.upcoming.isChecked &&
        //     !this.registration.isChecked &&
        //     !this.running.isChecked &&
        //     !this.lateRegistration.isChecked &&
        //     !this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        // }
        // if (this.upcoming.isChecked &&
        //     this.registration.isChecked &&
        //     this.running.isChecked &&
        //     this.lateRegistration.isChecked &&
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        //     this.upcoming.isChecked = false;
        //     this.registration.isChecked = false;
        //     this.running.isChecked = false;
        //     this.lateRegistration.isChecked = false;
        //     this.completed.isChecked = false;
        // }
        // else if (this.upcoming.isChecked ||
        //     this.registration.isChecked ||
        //     this.running.isChecked ||
        //     this.lateRegistration.isChecked ||
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = false;
        // }

        let count = 0;
        if (this.upcoming.isChecked) {
            count += 1;
        }
        if (this.registration.isChecked) {
            count += 1;
        }
        if (this.running.isChecked) {
            count += 1;
        }
        if (this.lateRegistration.isChecked) {
            count += 1;
        }
        if (this.completed.isChecked) {
            count += 1;
        }

        this.cateCountLabel.string = count + " Selected";
    },

    onLateRegistrationToggle: function() {
        if (!this.lateRegistration.isChecked) {
            this.cateAll.isChecked = false;
        }
        if (this.upcoming.isChecked && this.registration.isChecked && this.running.isChecked && this.lateRegistration.isChecked && this.completed.isChecked) {
            this.cateAll.isChecked = true;
        } 

        // if (!this.upcoming.isChecked &&
        //     !this.registration.isChecked &&
        //     !this.running.isChecked &&
        //     !this.lateRegistration.isChecked &&
        //     !this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        // }
        // if (this.upcoming.isChecked &&
        //     this.registration.isChecked &&
        //     this.running.isChecked &&
        //     this.lateRegistration.isChecked &&
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        //     this.upcoming.isChecked = false;
        //     this.registration.isChecked = false;
        //     this.running.isChecked = false;
        //     this.lateRegistration.isChecked = false;
        //     this.completed.isChecked = false;
        // }
        // else if (this.upcoming.isChecked ||
        //     this.registration.isChecked ||
        //     this.running.isChecked ||
        //     this.lateRegistration.isChecked ||
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = false;
        // }

        let count = 0;
        if (this.upcoming.isChecked) {
            count += 1;
        }
        if (this.registration.isChecked) {
            count += 1;
        }
        if (this.running.isChecked) {
            count += 1;
        }
        if (this.lateRegistration.isChecked) {
            count += 1;
        }
        if (this.completed.isChecked) {
            count += 1;
        }

        this.cateCountLabel.string = count + " Selected";
    },

    onCompletedToggle: function() {
        if (!this.completed.isChecked) {
            this.cateAll.isChecked = false;
        }
        if (this.upcoming.isChecked && this.registration.isChecked && this.running.isChecked && this.lateRegistration.isChecked && this.completed.isChecked) {
            this.cateAll.isChecked = true;
        } 
        
        // if (!this.upcoming.isChecked &&
        //     !this.registration.isChecked &&
        //     !this.running.isChecked &&
        //     !this.lateRegistration.isChecked &&
        //     !this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        // }
        // if (this.upcoming.isChecked &&
        //     this.registration.isChecked &&
        //     this.running.isChecked &&
        //     this.lateRegistration.isChecked &&
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = true;
        //     this.upcoming.isChecked = false;
        //     this.registration.isChecked = false;
        //     this.running.isChecked = false;
        //     this.lateRegistration.isChecked = false;
        //     this.completed.isChecked = false;
        // }
        // else if (this.upcoming.isChecked ||
        //     this.registration.isChecked ||
        //     this.running.isChecked ||
        //     this.lateRegistration.isChecked ||
        //     this.completed.isChecked) {
        //     this.cateAll.isChecked = false;
        // }

        let count = 0;
        if (this.upcoming.isChecked) {
            count += 1;
        }
        if (this.registration.isChecked) {
            count += 1;
        }
        if (this.running.isChecked) {
            count += 1;
        }
        if (this.lateRegistration.isChecked) {
            count += 1;
        }
        if (this.completed.isChecked) {
            count += 1;
        }

        this.cateCountLabel.string = count + " Selected";
    },

    onResetAll: function() {

        // TournamentLobbyListPresenter.formatAllFilter = true;
        // TournamentLobbyListPresenter.rebuyFilter = false;
        // TournamentLobbyListPresenter.reentryFilter = false;
        // TournamentLobbyListPresenter.typeAllFilter = true;
        // TournamentLobbyListPresenter.nlhFilter = false;
        // TournamentLobbyListPresenter.ploFilter = false;
        // TournamentLobbyListPresenter.buyinAllFilter = true;
        // TournamentLobbyListPresenter.lowFilter = false;
        // TournamentLobbyListPresenter.midFilter = false;
        // TournamentLobbyListPresenter.highFilter = false;
        // TournamentLobbyListPresenter.cateAllFilter = true;
        // TournamentLobbyListPresenter.upcomingFilter = false;
        // TournamentLobbyListPresenter.registrationFilter = false;
        // TournamentLobbyListPresenter.runningFilter = false;
        // TournamentLobbyListPresenter.lateRegistrationFilter = false;
        // TournamentLobbyListPresenter.completedFilter = false;
        // TournamentLobbyListPresenter.timeAsc = false;
        // TournamentLobbyListPresenter.timeDesc = true;
        // TournamentLobbyListPresenter.buyinAsc = false;
        // TournamentLobbyListPresenter.buyinDesc = false;
        // TournamentLobbyListPresenter.prizeDesc = false;

        this.timeDesc.check();
        this.formatAll.check();
        this.typeAll.check();
        this.cateAll.check();
        this.buyinAll.check();

        this.onApply();
    },

    onApply: function() {
        TournamentLobbyListPresenter.formatAllFilter = this.formatAll.isChecked;
        TournamentLobbyListPresenter.rebuyFilter = this.rebuy.isChecked;
        TournamentLobbyListPresenter.reentryFilter = this.reentry.isChecked;
        TournamentLobbyListPresenter.typeAllFilter = this.typeAll.isChecked;
        TournamentLobbyListPresenter.nlhFilter = this.nlh.isChecked;
        TournamentLobbyListPresenter.ploFilter = this.plo.isChecked;
        TournamentLobbyListPresenter.buyinAllFilter = this.buyinAll.isChecked;
        TournamentLobbyListPresenter.lowFilter = this.low.isChecked;
        TournamentLobbyListPresenter.midFilter = this.mid.isChecked;
        TournamentLobbyListPresenter.highFilter = this.high.isChecked;
        TournamentLobbyListPresenter.cateAllFilter = this.cateAll.isChecked;
        TournamentLobbyListPresenter.upcomingFilter = this.upcoming.isChecked;
        TournamentLobbyListPresenter.registrationFilter = this.registration.isChecked;
        TournamentLobbyListPresenter.runningFilter = this.running.isChecked;
        TournamentLobbyListPresenter.lateRegistrationFilter = this.lateRegistration.isChecked;
        TournamentLobbyListPresenter.completedFilter = this.completed.isChecked;
        TournamentLobbyListPresenter.timeAsc = this.timeAsc.isChecked;
        TournamentLobbyListPresenter.timeDesc = this.timeDesc.isChecked;
        TournamentLobbyListPresenter.buyinAsc = this.buyinAsc.isChecked;
        TournamentLobbyListPresenter.buyinDesc = this.buyinDesc.isChecked;
        TournamentLobbyListPresenter.prizeDesc = this.prizeDesc.isChecked;

        GameManager.emit("onUpdateTournamentFilters");
        GameManager.popUpManager.remove(PopUpType.TournamentFiltersPopup, function () {});
    }
});
