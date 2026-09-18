var PopUpBase = require('PopUpBase');

var PopUpType = cc.Enum({
    GameplayOptions: -1,
    GamePreferencesPopup: -1,
    ChatInfoPanel: -1,
    Permission: -1,
    OnLogOutPopup: -1,
    CommonDialog: -1,
    AccountDeleteError: -1,
    AccountDeleted: -1,
    AccountDeletedLoginError: -1,
    AccountDeleteConfirm: -1,
    BannerPopup: -1,

    TXLogin: -1,
    TXSignup: -1,
    TXForgotPassword: -1,
    TXMembershipAgreement: -1,
    TXTermsAndCondition: -1,

    BuyInPopup: -1,
    HandHistoryDetailPopup: -1,
    GameInfoPopup: -1,
    VoiceControlSettings: -1,
    FeeNotificationPopup: -1,
    FeeInsufficientPopup: -1,
    JackpotPopup: -1,
    HighHandPopup: -1,
    BBJ_HighHandToast: -1,
    BBJWinnerNotifiy: -1,
    bbjWinnerPopup: -1,
    TableTheme: -1,
    GameResult: -1,
    TableClosed: -1,
    SureToLeavePopup: -1,
    SureToFoldPopup: -1,
    InGamePreferencesPopup: -1,
    HighHandWinner: -1,

    TournamentFiltersPopup: -1,
    TournamentStartingSoonPopup: -1,
    TournamentRegistrationPopup: -1,
    TournamentRegistrationSuccess: -1,
    TournamentAboutTostart: -1,
    ITMPopup: -1,
    RebuyAddOnToast: -1,
    ReBuyPoup: -1,
    RebuyAddOnCountdown: -1,
    AddOnPopup: -1,
    TournamentBreakComingSoon: -1,
    TournamentBreakTime: -1,
    TournamentInfo: -1,
    TournamentInGameInfo: -1,
    TournamentResult: -1,
    TournamentRanking: -1,
    TournamentCancelledPopup: -1,
    TournamentCancelled: -1,

    MaintenancePopup: -1,
    MultiLoginPopup: -1,
    RegionRestrictionDetectedPopup: -1,
    AccessRestrictedPopup: -1,
    MaxTablesJoinedPopup: -1,
    DisconnectDialog: -1,
    AdminNoticePopup: -1,
    NewVersionPopup: -1,
    NotificationPopup: -1,
    NewLaunch: -1,
    GameplayPlayerProfile: -1,

    None: -1,
});

var PopUpManager = cc.Class({
    extends: cc.Component,

    properties: {
        popUps: {
            default: [],
            type: PopUpBase,
            visible: false
        },
        popupParent: {
            default: null,
            type: cc.Node
        },
        currentPopUp: {
            default: PopUpType.None,
            type: PopUpType
        },
        currentOverLayedPopUps: {
            default: [],
            type: PopUpType,
        },
        PopupType: {
            visible: false,
            get() {
                return PopUpType;
            },
        },
    },

    onLoad: function () {
        window.PopupManager = this;
        // prefab: 资源路径
        // mutexHide: 打开本弹窗时 hide（节点保留，下次可直接再开）
        // mutexRemove: 打开本弹窗时 remove（销毁节点，prefab 缓存仍在）
        // persist: true 时 hideAllPopUps / removeAllPopUps 不会关掉它（默认 false）
        this.popupPrefabPaths = {
            // common
            [PopUpType.MaxTablesJoinedPopup]: {
                prefab: 'prefabs/PopUps/common/MaxTablePopup',
                mutexHide: [
                    PopUpType.AccessRestrictedPopup,
                ],
                mutexRemove: [
                    PopUpType.FeeNotificationPopup,
                ],
            },
            [PopUpType.DisconnectDialog]: {
                prefab: 'prefabs/PopUps/common/DiscconectPopup',
                persist: true
            },
            [PopUpType.NotificationPopup]: {
                prefab: 'prefabs/PopUps/common/NotificationPopup'
            },
            [PopUpType.OnLogOutPopup]: {
                prefab: 'prefabs/PopUps/common/OnLogOupPopUp'
            },
            [PopUpType.CommonDialog]: {
                prefab: 'prefabs/PopUps/common/CommonPopup'
            },
            [PopUpType.NewVersionPopup]: {
                prefab: 'prefabs/PopUps/common/NewVersionPopup'
            },
            [PopUpType.AccessRestrictedPopup]: {
                prefab: 'prefabs/PopUps/common/AccessRestricted'
            },
            [PopUpType.AdminNoticePopup]: {
                prefab: 'prefabs/PopUps/common/AdminNoticePopup'
            },
            [PopUpType.RegionRestrictionDetectedPopup]: {
                prefab: 'prefabs/PopUps/common/RegionRestrictionDetected'
            },
            [PopUpType.AccountDeleteError]: {
                prefab: 'prefabs/PopUps/common/AccountDeleteError'
            },
            [PopUpType.AccountDeleted]: {
                prefab: 'prefabs/PopUps/common/AccountDeleted'
            },
            [PopUpType.AccountDeletedLoginError]: {
                prefab: 'prefabs/PopUps/common/AccountDeletedLoginError'
            },
            [PopUpType.AccountDeleteConfirm]: {
                prefab: 'prefabs/PopUps/common/AccountDeleteConfirm'
            },
            [PopUpType.MultiLoginPopup]: {
                prefab: 'prefabs/PopUps/common/MultiLoginPopup'
            },
            [PopUpType.MaintenancePopup]: {
                prefab: 'prefabs/PopUps/common/ServerMaintenancePopup',
                persist: true
            },
            [PopUpType.BannerPopup]: {
                prefab: 'prefabs/PopUps/common/BannerPopup'
            },
            [PopUpType.Permission]: {
                prefab: 'prefabs/PopUps/common/Permission',
                persist: true
            },
            [PopUpType.NewLaunch]: {
                prefab: 'prefabs/PopUps/common/NewLaunch'
            },
            [PopUpType.TXLogin]: {
                prefab: 'prefabs/tx/Login/TXLogin'
            },
            [PopUpType.TXSignup]: {
                prefab: 'prefabs/tx/Signup/TXSignup'
            },
            [PopUpType.TXForgotPassword]: {
                prefab: 'prefabs/tx/ForgotPassword/TXForgotPassword'
            },
            [PopUpType.TXMembershipAgreement]: {
                prefab: 'prefabs/tx/MembershipAgreement/TXMembershipAgreement'
            },
            [PopUpType.TXTermsAndCondition]: {
                prefab: 'prefabs/tx/TermsAndCondition/TXTermsAndCondition'
            },

            // gameplay
            [PopUpType.BuyInPopup]: {
                prefab: 'prefabs/PopUps/gameplay/BuyInPopup'
            },
            [PopUpType.GameInfoPopup]: {
                prefab: 'prefabs/PopUps/gameplay/InfoPopup'
            },
            [PopUpType.FeeNotificationPopup]: {
                prefab: 'prefabs/PopUps/gameplay/FeeNotificationPopup'
            },
            [PopUpType.FeeInsufficientPopup]: {
                prefab: 'prefabs/PopUps/gameplay/FeeInsufficient'
            },
            [PopUpType.BBJ_HighHandToast]: {
                prefab: 'prefabs/bbj/BBJAndHighHandToast'
            },
            [PopUpType.bbjWinnerPopup]: {
                prefab: 'prefabs/bbj/bbjWinnerPopup'
            },
            [PopUpType.JackpotPopup]: {
                prefab: 'prefabs/bbj/bbjPopup'
            },
            [PopUpType.BBJWinnerNotifiy]: {
                prefab: 'prefabs/bbj/BBJWinnerNotifiy'
            },
            [PopUpType.HighHandPopup]: {
                prefab: 'prefabs/HighHand/highHandPopup'
            },
            [PopUpType.TableTheme]: {
                prefab: 'prefabs/PopUps/gameplay/TableTheme'
            },
            [PopUpType.GameResult]: {
                prefab: 'prefabs/PopUps/gameplay/GameResult'
            },
            [PopUpType.VoiceControlSettings]: {
                prefab: 'prefabs/PopUps/gameplay/VoiceControlSettings'
            },
            [PopUpType.TableClosed]: {
                prefab: 'prefabs/PopUps/gameplay/TableClosed'
            },
            [PopUpType.SureToLeavePopup]: {
                prefab: 'prefabs/PopUps/gameplay/SureToLeavePopup'
            },
            [PopUpType.SureToFoldPopup]: {
                prefab: 'prefabs/PopUps/gameplay/SureToFoldPopup'
            },
            [PopUpType.HighHandWinner]: {
                prefab: 'prefabs/HighHand/highHandWinner'
            },
            [PopUpType.HandHistoryDetailPopup]: {
                prefab: 'prefabs/PopUps/gameplay/HandHistoryDetail'
            },
            [PopUpType.InGamePreferencesPopup]: {
                prefab: 'prefabs/PopUps/gameplay/InGamePreferencesPopup'
            },
            [PopUpType.GameplayOptions]: {
                prefab: 'prefabs/PopUps/gameplay/GameplayOptions'
            },
            [PopUpType.ChatInfoPanel]: {
                prefab: 'prefabs/PopUps/gameplay/ChatInfoPanel'
            },
            [PopUpType.GameplayPlayerProfile]: {
                prefab: 'prefabs/nextGen/gameplayPlayerProfile'
            },

            // tournament
            [PopUpType.TournamentFiltersPopup]: {
                prefab: 'prefabs/PopUps/tournament/TournamentFilters'
            },
            [PopUpType.TournamentStartingSoonPopup]: {
                prefab: 'prefabs/PopUps/tournament/TournamentStartingSoonPopup'
            },
            [PopUpType.TournamentRegistrationPopup]: {
                prefab: 'prefabs/PopUps/tournament/TournamentRegistrationPopup'
            },
            [PopUpType.TournamentRegistrationSuccess]: {
                prefab: 'prefabs/PopUps/tournament/TournamentRegistrationSuccess'
            },
            [PopUpType.TournamentCancelledPopup]: {
                prefab: 'prefabs/PopUps/tournament/TournamentCancelledPopup'
            },
            [PopUpType.TournamentAboutTostart]: {
                prefab: 'prefabs/PopUps/tournament/TournamentAboutTostart'
            },
            [PopUpType.ITMPopup]: {
                prefab: 'prefabs/PopUps/tournament/ITMPopup'
            },
            [PopUpType.TournamentCancelled]: {
                prefab: 'prefabs/PopUps/tournament/TournamentCancelled'
            },
            [PopUpType.TournamentRanking]: {
                prefab: 'prefabs/PopUps/tournament/MttRankingPopup'
            },
            [PopUpType.TournamentResult]: {
                prefab: 'prefabs/PopUps/tournament/TournamentResult'
            },
            [PopUpType.ReBuyPoup]: {
                prefab: 'prefabs/PopUps/tournament/ReBuyPoup'
            },
            [PopUpType.AddOnPopup]: {
                prefab: 'prefabs/PopUps/tournament/AddOnPopup'
            },
            [PopUpType.RebuyAddOnCountdown]: {
                prefab: 'prefabs/PopUps/tournament/RebuyAddOnCountdown'
            },
            [PopUpType.RebuyAddOnToast]: {
                prefab: 'prefabs/PopUps/tournament/RebuyAddOnToast'
            },
            [PopUpType.TournamentInGameInfo]: {
                prefab: 'prefabs/PopUps/tournament/TournamentInGameInfo'
            },
            [PopUpType.TournamentBreakTime]: {
                prefab: 'prefabs/PopUps/tournament/TournamentBreakTime'
            },
            [PopUpType.TournamentBreakComingSoon]: {
                prefab: 'prefabs/PopUps/tournament/TournamentBreakComingSoon'
            },
            [PopUpType.TournamentInfo]: {
                prefab: 'prefabs/PopUps/tournament/TournamentInfo'
            },
        };

        this.preloadPopupList = [
            PopUpType.BuyInPopup,
            PopUpType.TournamentRegistrationPopup,
            PopUpType.TournamentRegistrationSuccess,
            PopUpType.TournamentAboutTostart,
            PopUpType.TournamentRanking,
            PopUpType.TournamentResult,
        ];

        // prefab 资源缓存：preload / 首次 load 后放这里，不挂节点
        this.loadedPrefabs = {};
        // 已实例化的节点：hide 后复用，remove 后删除
        this.loadedPopups = {};
        this.preloadPopups(this.preloadPopupList);
    },

    /**
     * True popup: unique per type, parented under popupParent (above normal UI).
     */
    show: function (popUp, data, callback) {
        // console.trace('[PopupManager/show]', this.getPopupName(popUp), data);
        return this._showInternal(popUp, data, callback, this._getDefaultParent());
    },

    /**
     * Table-scoped panel: unique per (type, parent). Two tables can each
     * hold their own HandHistory / BuyIn / BreakTime at the same time.
     * Empty parent falls back to the global popupParent (same as show).
     */
    showIn: function (popUp, data, callback, parent) {
        console.trace('[PopupManager/showIn]', this.getPopupName(popUp), data);
        return this._showInternal(popUp, data, callback, parent || this._getDefaultParent());
    },

    _showInternal: function (popUp, data, callback, parent) {
        this._applyMutexPopups(popUp);
        var key = this._instanceKey(popUp, parent);
        if (this._isKeyOpen(key)) {
            this._applyParentAndZIndexByKey(key, parent);
            return this.loadedPopups[key];
        }
        this.currentOverLayedPopUps.push(key);

        if (this._getCachedNodeByKey(key)) {
            return this._activateByKey(key, popUp, data, callback, parent, false);
        }
        if (this.loadedPrefabs[popUp]) {
            return this._instantiateAndShow(popUp, this.loadedPrefabs[popUp], data, callback, parent);
        }
        return this._loadAndShowPopup(popUp, data, callback, parent);
    },

    _getDefaultParent: function () {
        return this.popupParent || this.node;
    },

    /**
     * show() → "12". showIn(tableA) → "12#<uuid>". Prefab cache stays per type.
     */
    _instanceKey: function (popUp, parent) {
        var host = parent || this._getDefaultParent();
        var def = this._getDefaultParent();
        if (!host || host === def) {
            return String(popUp);
        }
        var id = host.uuid || host._id;
        if (!id) {
            return String(popUp);
        }
        return String(popUp) + '#' + id;
    },

    _typeFromKey: function (key) {
        var s = String(key);
        var hash = s.indexOf('#');
        return Number(hash === -1 ? s : s.substring(0, hash));
    },

    _keysForType: function (popUp) {
        var prefix = String(popUp);
        var out = [];
        for (var i = 0; i < this.currentOverLayedPopUps.length; i++) {
            var key = this.currentOverLayedPopUps[i];
            if (key === prefix || String(key).indexOf(prefix + '#') === 0) {
                out.push(key);
            }
        }
        return out;
    },

    _isKeyOpen: function (key) {
        return this.currentOverLayedPopUps.indexOf(key) !== -1;
    },

    _getCachedNodeByKey: function (key) {
        const node = this.loadedPopups[key];
        return (node && cc.isValid(node)) ? node : null;
    },

    _getCachedNode: function (popUp, parent) {
        if (parent) {
            return this._getCachedNodeByKey(this._instanceKey(popUp, parent));
        }
        var def = this._getCachedNodeByKey(String(popUp));
        if (def) return def;
        var keys = this._keysForType(popUp);
        if (keys.length === 1) {
            return this._getCachedNodeByKey(keys[0]);
        }
        return null;
    },

    _getPopupConfig: function (popUp) {
        return this.popupPrefabPaths[popUp] || null;
    },

    _getPrefabPath: function (popUp) {
        const cfg = this._getPopupConfig(popUp);
        if (!cfg) return null;
        return typeof cfg === 'string' ? cfg : cfg.prefab;
    },

    _isPersistPopup: function (popUp) {
        const cfg = this._getPopupConfig(popUp);
        return !!(cfg && typeof cfg === 'object' && cfg.persist);
    },

    /**
     * 打开 popUp 前处理互斥项。单向，不会反关自己。
     */
    _applyMutexPopups: function (popUp) {
        const cfg = this._getPopupConfig(popUp);
        if (!cfg) return;
        this._forEachMutex(cfg.mutexHide, popUp, this.hide);
        this._forEachMutex(cfg.mutexRemove, popUp, this.remove);
    },

    _forEachMutex: function (list, selfType, action) {
        if (!list || !list.length) return;
        for (var i = 0; i < list.length; i++) {
            if (list[i] === selfType) continue;
            action.call(this, list[i]);
        }
    },

    /**
     * 枚举值即 zIndex。可在这里单独覆盖某个类型，不必改枚举。
     */
    getPopupZIndex: function (popUp) {
        return popUp;
    },

    _applyParentAndZIndexByKey: function (key, parent) {
        const popupNode = this._getCachedNodeByKey(key);
        if (!popupNode) return;

        const targetParent = parent || this._getDefaultParent();
        if (popupNode.parent !== targetParent) {
            popupNode.parent = targetParent;
        }

        const z = this.getPopupZIndex(this._typeFromKey(key));
        if (popupNode.zIndex !== z) {
            popupNode.zIndex = z;
        }
    },

    _loadAndShowPopup: function (popUp, data, callback, parent) {
        const path = this._getPrefabPath(popUp);
        const key = this._instanceKey(popUp, parent);
        if (!path) {
            console.error("No prefab path defined for popup:", popUp);
            this._removeKeyFromOverlay(key);
            return;
        }

        cc.resources.load(path, cc.Prefab, (err, prefab) => {
            if (err || !prefab) {
                console.error("Failed to load popup prefab at path:", path, err);
                this._removeKeyFromOverlay(key);
                return;
            }
            this.loadedPrefabs[popUp] = prefab;

            if (!this._isKeyOpen(key)) return;
            if (this._getCachedNodeByKey(key)) {
                return this._activateByKey(key, popUp, data, callback, parent, false);
            }
            this._instantiateAndShow(popUp, prefab, data, callback, parent);
        });
    },

    _instantiateAndShow: function (popUp, prefab, data, callback, parent) {
        const popupNode = cc.instantiate(prefab);
        const targetParent = parent || this._getDefaultParent();
        const key = this._instanceKey(popUp, targetParent);
        popupNode.parent = targetParent;
        popupNode.zIndex = this.getPopupZIndex(popUp);

        const base = popupNode.getComponent('PopUpBase');
        if (base) {
            base.popUpManager = this;
            base._popupType = popUp;
            base._popupHost = targetParent;
        }

        this.loadedPopups[key] = popupNode;
        return this._activateByKey(key, popUp, data, callback, targetParent, true);
    },

    /**
     * @param {Boolean} needOnShow true on first instantiate; hide then show only restores visibility.
     */
    _activateByKey: function (key, popUp, data, callback, parent, needOnShow) {
        const popupNode = this._getCachedNodeByKey(key);
        if (!popupNode) return;

        this._applyParentAndZIndexByKey(key, parent);
        popupNode.opacity = 255;
        popupNode.active = true;
        this.currentPopUp = this._getTopOverlaidPopup();

        const popupScript = popupNode.getComponent('PopUpBase');
        if (popupScript) {
            popupScript._popupType = popUp;
            popupScript._popupHost = parent || this._getDefaultParent();
        }

        if (needOnShow) {
            if (popupScript && popupScript.onShow) {
                popupScript.onShow(data);
            }
        }
        callback && callback();
        GameManager.emit("hideJoinSimlar");
        return popupNode;
    },

    /**
     * @param parent optional. Omit = global (default parent) instance only.
     *   Pass the same parent used in showIn to close that table's copy.
     *   From a popup script, prefer closeSelf().
     */
    hide: function (popUp, callback, parent) {
        try {
            console.trace('[PopupManager/hide]', this.getPopupName(popUp));
            var keys = parent ? [this._instanceKey(popUp, parent)] : this._keysForTypeOnDefaultOrSingle(popUp);
            var last = keys.length - 1;
            for (var i = 0; i < keys.length; i++) {
                this._hideByKey(keys[i], i === last ? callback : null);
            }
        } catch (err) {
            console.error("error in hiding ", err);
        }
    },

    /**
     * @param parent optional. Same rules as hide().
     */
    remove: function (popUp, callback, parent) {
        console.trace('[PopupManager/remove]', this.getPopupName(popUp));
        var keys = parent ? [this._instanceKey(popUp, parent)] : this._keysForTypeOnDefaultOrSingle(popUp);
        var last = keys.length - 1;
        for (var i = 0; i < keys.length; i++) {
            this._removeByKey(keys[i], i === last ? callback : null);
        }
    },

    /**
     * Without parent: the global instance (key === type). If that is missing
     * and only one table-scoped copy exists, close that copy (legacy callers).
     */
    _keysForTypeOnDefaultOrSingle: function (popUp) {
        var defKey = String(popUp);
        if (this._isKeyOpen(defKey) || this._getCachedNodeByKey(defKey)) {
            return [defKey];
        }
        var keys = this._keysForType(popUp);
        if (keys.length === 1) {
            return keys;
        }
        return keys.length ? [] : [defKey];
    },

    _hideByKey: function (key, callback) {
        if (!this._isKeyOpen(key)) {
            callback && callback();
            return;
        }
        this._removeKeyFromOverlay(key);

        const popupNode = this._getCachedNodeByKey(key);
        if (!popupNode) {
            delete this.loadedPopups[key];
            callback && callback();
            this.currentPopUp = this._getTopOverlaidPopup();
            return;
        }

        const popupScript = popupNode.getComponent('PopUpBase');
        if (popupScript && popupScript.onHide) {
            popupScript.onHide();
        }
        popupNode.active = false;
        callback && callback();
        this.currentPopUp = this._getTopOverlaidPopup();
        GameManager.emit("showJoinSimlar");
    },

    _removeByKey: function (key, callback) {
        this._removeKeyFromOverlay(key);

        const popupNode = this._getCachedNodeByKey(key);
        if (popupNode) {
            const popupScript = popupNode.getComponent('PopUpBase');
            if (popupScript && popupScript.onHide) {
                popupScript.onHide();
            }
            popupNode.removeFromParent(true);
            popupNode.destroy();
        }
        delete this.loadedPopups[key];

        callback && callback();
        this.currentPopUp = this._getTopOverlaidPopup();
        GameManager.emit("showJoinSimlar");
    },

    _isPopupCurrentlyOpen: function (popUp, parent) {
        if (parent) {
            return this._isKeyOpen(this._instanceKey(popUp, parent));
        }
        return this._keysForType(popUp).length > 0;
    },

    _removeKeyFromOverlay: function (key) {
        const index = this.currentOverLayedPopUps.indexOf(key);
        if (index !== -1) {
            this.currentOverLayedPopUps.splice(index, 1);
        }
    },

    _removePopupFromOverlay: function (popUp) {
        var keys = this._keysForType(popUp);
        for (var i = 0; i < keys.length; i++) {
            this._removeKeyFromOverlay(keys[i]);
        }
    },

    /**
     * 栈顶按枚举值（zIndex）取最大的，而不是「最后 push 的」。
     * 这样 currentPopUp 始终指向当前视觉上最上面的那个。
     */
    _getTopOverlaidPopup: function () {
        if (!this.currentOverLayedPopUps.length) {
            return PopUpType.None;
        }
        var topKey = this.currentOverLayedPopUps[0];
        var topType = this._typeFromKey(topKey);
        for (var i = 1; i < this.currentOverLayedPopUps.length; i++) {
            var t = this._typeFromKey(this.currentOverLayedPopUps[i]);
            if (this.getPopupZIndex(t) >= this.getPopupZIndex(topType)) {
                topKey = this.currentOverLayedPopUps[i];
                topType = t;
            }
        }
        return topType;
    },

    /**
     * @description Hide all Popups
     */
    hideAllPopUps: function () {
        const list = this.currentOverLayedPopUps.slice();
        for (var i = 0; i < list.length; i++) {
            if (this._isPersistPopup(this._typeFromKey(list[i]))) continue;
            this._hideByKey(list[i]);
        }
    },

    removeAllPopUps: function () {
        const list = this.currentOverLayedPopUps.slice();
        for (var i = 0; i < list.length; i++) {
            if (this._isPersistPopup(this._typeFromKey(list[i]))) continue;
            this._removeByKey(list[i]);
        }
    },

    /**
     * Destroy every showIn instance parented under `parent` (leave table).
     */
    removePopupsIn: function (parent) {
        if (!parent) return;
        var suffix = '#' + (parent.uuid || parent._id);
        const list = this.currentOverLayedPopUps.slice();
        for (var i = 0; i < list.length; i++) {
            var key = list[i];
            if (String(key).indexOf(suffix) !== -1) {
                this._removeByKey(key);
            }
        }
        for (var cacheKey in this.loadedPopups) {
            if (String(cacheKey).indexOf(suffix) !== -1 && this.loadedPopups[cacheKey]) {
                this._removeByKey(cacheKey);
            }
        }
    },

    checkIfPopupActive: function () {
        return this.currentOverLayedPopUps.length > 0;
    },

    checkIfPopupTypeActive: function (popup, parent) {
        return this._isPopupCurrentlyOpen(popup, parent);
    },

    getPopupNode: function (popUp, parent) {
        return this._getCachedNode(popUp, parent);
    },

    /**
     * 只预加载 prefab 资源，不 instantiate、不挂 parent。
     * 之后第一次 show / showIn 会直接用缓存实例化，避免 IO 卡顿。
     */
    preloadPopups: function (popupList) {
        if (!popupList || !popupList.length) return;
        const self = this;
        popupList.forEach(function (popUp) {
            if (self.loadedPrefabs[popUp]) return;

            const path = self._getPrefabPath(popUp);
            if (!path) {
                console.warn("No path defined for PopUpType:", popUp);
                return;
            }
            cc.resources.load(path, cc.Prefab, function (err, prefab) {
                if (err || !prefab) {
                    console.error("Failed to preload:", path, err);
                    return;
                }
                self.loadedPrefabs[popUp] = prefab;
            });
        });
    },

    isPopupActive: function (popUp, parent) {
        if (parent) {
            var key = this._instanceKey(popUp, parent);
            if (!this._isKeyOpen(key)) return false;
            var node = this._getCachedNodeByKey(key);
            return !!(node && node.activeInHierarchy);
        }
        var keys = this._keysForType(popUp);
        for (var i = 0; i < keys.length; i++) {
            var n = this._getCachedNodeByKey(keys[i]);
            if (n && n.activeInHierarchy) return true;
        }
        return false;
    },

    isAnyOfPopupsActive: function () {
        let popupList = [
            // common
            PopUpType.MaxTablesJoinedPopup,
            PopUpType.DisconnectDialog,
            PopUpType.OnLogOutPopup,
            PopUpType.CommonDialog,
            PopUpType.NewVersionPopup,
            PopUpType.AccessRestrictedPopup,
            PopUpType.AdminNoticePopup,
            PopUpType.RegionRestrictionDetectedPopup,
            PopUpType.AccountDeleteError,
            PopUpType.AccountDeleted,
            PopUpType.AccountDeletedLoginError,
            PopUpType.AccountDeleteConfirm,
            PopUpType.MultiLoginPopup,
            PopUpType.MaintenancePopup,
            PopUpType.BannerPopup,

            // gameplay
            PopUpType.BuyInPopup,
            PopUpType.GameInfoPopup,
            PopUpType.FeeNotificationPopup,
            PopUpType.FeeInsufficientPopup,
            PopUpType.BBJ_HighHandToast,
            PopUpType.JackpotPopup,
            PopUpType.BBJWinnerNotifiy,
            PopUpType.HighHandPopup,
            PopUpType.TableTheme,
            PopUpType.GameResult,
            PopUpType.VoiceControlSettings,
            PopUpType.TableClosed,
            PopUpType.SureToLeavePopup,
            PopUpType.SureToFoldPopup,
            PopUpType.HighHandWinner,
            PopUpType.HandHistoryDetailPopup,
            PopUpType.InGamePreferencesPopup,
            PopUpType.GameplayOptions,
            PopUpType.ChatInfoPanel,

            // tournament
            PopUpType.TournamentFiltersPopup,
            PopUpType.TournamentStartingSoonPopup,
            PopUpType.TournamentRegistrationPopup,
            PopUpType.TournamentRegistrationSuccess,
            PopUpType.TournamentCancelledPopup,
            PopUpType.TournamentAboutTostart,
            PopUpType.ITMPopup,
            PopUpType.TournamentCancelled,
            PopUpType.TournamentRanking,
            PopUpType.TournamentResult,
            PopUpType.ReBuyPoup,
            PopUpType.AddOnPopup,
            PopUpType.RebuyAddOnCountdown,
            PopUpType.RebuyAddOnToast,
            PopUpType.TournamentInGameInfo,
            PopUpType.TournamentBreakTime,
            PopUpType.TournamentInfo,
        ];
        for (var i = 0; i < popupList.length; i++) {
            if (this.isPopupActive(popupList[i])) return true;
        }
        return false;
    },

    getPopupName: function (popUp) {
        if (popUp == null) return '';
        var name = PopUpType[popUp];
        if (typeof name === 'string') return name;
        if (cc.Enum && typeof cc.Enum.getName === 'function') {
            name = cc.Enum.getName(PopUpType, popUp);
            if (name) return name;
        }
        return '';
    },

});

module.exports = {
    PopUpManager: PopUpManager,
    PopUpType: PopUpType
};