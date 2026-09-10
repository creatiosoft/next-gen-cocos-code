import globals from "../../globals";
import { GameData } from "../../DataFormats/ResponseTypes";
import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
import { Login } from "../../DataFormats/PostTypes";

const { ccclass, property } = cc._decorator;
export enum TOURNAMENT_ITEM_TYPE {
    NONE = 0,
    ANNOUNCED,
    REGISTERING,
    LATE_REG,
    RUNNING,
    COMPLETED,
    CANCELLED,
}
enum BTN {
    REGISTER,
    ENROLLED,
    ENTER_TABLE,
    DEREGISTER,
    LATE_REG,
    REENTRY,
    RUNNING,
    SPECTATE,
    UPCOMING,
    FREEZED,
    COMPLETED,
    CANCELLED,
}

@ccclass
export default class TournamentLobbyListItem extends cc.Component {

    @property(cc.Label)
    tournamentName: cc.Label = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    buyIn: cc.Label = null;

    @property(cc.Label)
    prize: cc.Label = null;

    @property(cc.Label)
    btnLabel: cc.Label = null;

    @property(cc.Sprite)
    btnSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    btnFrame: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    bgFrame: cc.SpriteFrame[] = [];

    // @property(cc.Node)
    // tournamentBuyin: cc.Node = null;

    @property(cc.Node)
    enterTableBtn: cc.Node = null;

    @property(cc.Node)
    deRegisterTableBtn: cc.Node = null;

    @property(cc.Node)
    lateRegisterBtn: cc.Node = null;

    @property(cc.Node)
    registerBtn: cc.Node = null;

    @property(cc.Node)
    registeredBtn: cc.Node = null;

    @property(cc.Node)
    reentryBtn: cc.Node = null;

    @property(cc.Node)
    runningBtn: cc.Node = null;

    @property(cc.Node)
    closedBtn: cc.Node = null;

    @property(cc.Node)
    upcomingBtn: cc.Node = null;

    @property(cc.Node)
    breaktimeBtn: cc.Node = null;

    @property(cc.Node)
    cancelBtn: cc.Node = null;

    @property(cc.Node)
    eliminatedBtn: cc.Node = null;

    @property(cc.Node)
    tournamentFullBtn: cc.Node = null;

    @property(cc.Node)
    freezedBtn: cc.Node = null;

    @property(cc.Node)
    spectateBtn: cc.Node = null!;

    // LIFE-CYCLE CALLBACKS:
    public dblClk = false;
    public tourItemInfo: any = null;
    isTableExisting = false;
    isTournamentExisting = false;
    tournamentIndexFound = -1;
    indexFound = -1;
    onLoad() {
        this.setHighlight(false);
        const inst = this;
        if (GameManager.isMobile) {
            this.node.on('touchstart', function (event) {
                if (inst.dblClk) {
                    inst.dblClk = false;
                } else {
                    inst.dblClk = true;

                    setTimeout(function () {
                        inst.dblClk = false;
                    }, 300);
                }
            }, this.node);
        }
    }

    start() {

    }

    initIndex(index) {
        // if (!GameManager.isMobile) {
        //     this.bg_1.active = index % 2 == 0;
        //     this.bg_2.active = index % 2 != 0;
        // }
    }

    // Converts any server timestamp (UTC ISO string, ms epoch, or s epoch) to ms epoch
    private _tsMs(v: any): number {
        const n = Number(v);
        if (!isNaN(n) && n > 0) return n > 9999999999 ? n : n * 1000;
        return new Date(String(v)).getTime();
    }

    private _fmtTime(ts: any): { date: string; time: string } {
        const ms = this._tsMs(ts);
        if (!ms) return { date: '', time: '' };
        const d = new Date(ms);
        const now = new Date();
        const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = isToday ? 'Today' : `${d.getDate()} ${months[d.getMonth()]}`;
        const h = d.getHours(), m = d.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const time = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
        return { date, time };
    }

    private _setCD(label: string, value: string) {
        let path: string;
        if (GameManager.isMobile) {
            if (label === 'info') path = 'icon/Status';
            else if (label === 'heading') path = 'icon/CountDown/Heading';
            else path = 'icon/CountDown/time';
        } else {
            path = `RoomInfo/BuyInGroup/CountDown/${label}`;
        }
        const n = cc.find(path, this.node);
        if (!n) { cc.warn('[TLI] _setCD path NOT found:', path, 'on node:', this.node.name); return; }
        n.getComponent(cc.Label).string = value;
    }

    initInfo(data: any) {
        const _prevState = this.tourItemInfo ? this.tourItemInfo.state : null;
        this.tourItemInfo = data;

        this._applyBasicInfo(data);

        const btn = this._computeBtn(data);
        this._applyMobileBadge(btn, data);
        this._applyTimers(btn, data, _prevState);

        if (this.btnSprite?.node) {
            const isSNG = data.tournamentType === 'SIT N GO';
            const clickable = new Set([BTN.REGISTER, BTN.ENTER_TABLE, BTN.DEREGISTER, BTN.LATE_REG, BTN.REENTRY, BTN.RUNNING, BTN.SPECTATE]);
            this.btnSprite.node.getComponent(cc.Button).interactable = isSNG || clickable.has(btn);
        }
    }

    private _computeBtn(data: any): BTN {
        const raw = data;
        const state: string = data.state || raw?.state || raw?.status || '';
        const isSNG = raw.tournamentType === 'SIT N GO';
        // console.log('[TLI] _computeBtn | name:', raw?.tournamentName, '| data.state:', data.state, '| raw.state:', raw?.state, '| raw.status:', raw?.status, '| resolved:', state);

        if (state === 'CANCELED' || state === 'CANCELLED') return BTN.CANCELLED;
        if (state === 'CLOSED' || state === 'Closed' || state === 'COMPLETED' || state === 'Completed') return BTN.COMPLETED;
        if (state === 'Registration Freezed' || state === 'FREEZED') return BTN.FREEZED;

        if (state === 'PUBLISHED') return isSNG ? BTN.REGISTER : BTN.UPCOMING;

        if (state === 'Open To Register' || state === 'REGISTER') {
            if (!this._isEnrolled(raw)) return BTN.REGISTER;
            if (isSNG) return raw.playerData?.tableId ? BTN.ENTER_TABLE : BTN.DEREGISTER;
            return BTN.ENROLLED;
        }

        if (state === 'Open To Late Register') {
            if (this._isEliminated(raw)) return BTN.SPECTATE;
            if (!isSNG && raw.playerData?.tableId) return BTN.ENTER_TABLE;
            return BTN.LATE_REG;
        }

        if (state === 'RUNNING') {
            const _enrolled = this._isEnrolled(raw);
            const _eliminated = this._isEliminated(raw);
            const _reentryLevels: number[] = raw.reentryPrice?.reentryAllowedBlindLevels ?? [];
            const _currentLevel: number = raw.currentBlindLevel?.level ?? 0;
            const _hasLevelRestriction = _reentryLevels.length > 0 && raw.currentBlindLevel != null;
            const _hasTimeRestriction = !!(raw.lateRegistrationEndTime);
            const _reentryEndValid =
                (!_hasLevelRestriction || _reentryLevels.includes(_currentLevel)) &&
                (!_hasTimeRestriction || this._tsMs(raw.lateRegistrationEndTime) > Date.now());
            const _reentryOpen = _eliminated && raw.isReentryAllowed
                && (raw.playerData?.reentries ?? 0) < (raw.numberOfReentry ?? Infinity)
                && _reentryEndValid;
            const _lateRegEndMs = this._tsMs(raw.lateRegistrationEndTime);
            const _lateRegOpen = !_enrolled
                && (_lateRegEndMs > 0 && _lateRegEndMs > Date.now())
                && !isSNG;
            if (_reentryOpen) return BTN.REENTRY;
            if (_eliminated) return BTN.SPECTATE;
            if (_lateRegOpen) return BTN.LATE_REG;
            if (_enrolled) return BTN.RUNNING;
            return BTN.SPECTATE;
        }

        cc.warn('[TLI] _computeBtn: unhandled state:', state, 'for:', raw?.tournamentName);
        return BTN.UPCOMING;
    }

    private _isEliminated(raw: any): boolean {
        if (raw.playerData?.status === 'ELIMINATED') return true;
        if (raw.playerStatus === 'ELIMINATED') return true;
        const myId = (window as any).GameManager?.user?.playerId;
        if (myId && raw.player_list) {
            const entry = raw.player_list[`_${myId}`]
                ?? (Object.values(raw.player_list as object) as any[]).find((p: any) => p.playerId == myId);
            if (entry?.status === 'ELIMINATED') return true;
        }
        return false;
    }

    private _isEnrolled(raw: any): boolean {
        if (this._isEliminated(raw)) return false;
        const myId = (window as any).GameManager?.user?.playerId;
        let inList = false;
        if (myId && raw.player_list) {
            if (raw.player_list[`_${myId}`]?.status === 'ACTIVE') {
                inList = true;
            } else {
                inList = Object.values(raw.player_list as object).some(
                    (p: any) => p.playerId == myId && p.status === 'ACTIVE'
                );
            }
        }
        return !!(raw.playerData || raw.playerStatus === 'REGISTERED' || inList);
    }

    private _applyMobileBadge(btn: BTN, data: any) {
        const raw = data;
        let label = '', heading = '', btnF = 0, bgF = 0;

        switch (btn) {
            case BTN.REGISTER: label = 'Register'; heading = 'Closing In'; btnF = 1; bgF = 1; break;
            case BTN.ENROLLED: label = 'Enrolled'; heading = 'Start In'; btnF = 1; bgF = 1; break;
            case BTN.ENTER_TABLE: label = 'Enter Table'; heading = ''; btnF = 1; bgF = 1; break;
            case BTN.DEREGISTER: label = 'Deregister'; heading = ''; btnF = 1; bgF = 1; break;
            case BTN.LATE_REG: label = 'Late Reg'; heading = 'Closing In'; btnF = 3; bgF = 3; break;
            case BTN.REENTRY: label = 'Register'; heading = 'Closing In'; btnF = 1; bgF = 1; break;
            case BTN.RUNNING:
                // console.log('[TLI] BTN.RUNNING | playerStatus:', raw.playerStatus, '| playerData:', !!raw.playerData, '| playerData.status:', raw.playerData?.status);
                label = raw.playerStatus === 'REGISTERED' ? 'Enter' : 'Running';
                heading = 'Running Since'; btnF = 1; bgF = 1; break;
            case BTN.SPECTATE: label = 'Spectate'; heading = 'Running Since'; btnF = 5; bgF = 5; break;
            case BTN.UPCOMING: {
                label = raw.tournamentType === 'SIT N GO' ? 'Register' : 'Upcoming';
                const _upRegEnd = this._tsMs(raw.registrationStartTime ?? raw.tournamentStartTime);
                heading = (_upRegEnd - Date.now()) < 24 * 60 * 60 * 1000 ? 'Will Start in' : 'Will Start on';
                btnF = 0; bgF = 0; break;
            }
            case BTN.FREEZED: label = 'Freeze'; heading = ''; btnF = 2; bgF = 2; break;
            case BTN.COMPLETED: label = 'Completed'; heading = 'Closed at'; btnF = 0; bgF = 0; break;
            case BTN.CANCELLED: label = 'Cancelled'; heading = 'Cancelled at'; btnF = 4; bgF = 4; break;
        }

        if (this.btnLabel) this.btnLabel.string = label;
        if (this.btnSprite && this.btnFrame[btnF]) this.btnSprite.spriteFrame = this.btnFrame[btnF];

        if (GameManager.isMobile) {
            const _isRunningState = btn === BTN.RUNNING || btn === BTN.SPECTATE || btn === BTN.LATE_REG || btn === BTN.REENTRY;
            this._setCD('info', _isRunningState ? 'Running' : label);
            const iconNode = cc.find('icon', this.node);
            if (iconNode && this.bgFrame[bgF]) iconNode.getComponent(cc.Sprite).spriteFrame = this.bgFrame[bgF];

            const _startTs = raw.tournamentStartDetails?.startTime ?? raw.tournamentStartTime;
            const _endTs = raw.closedAt ?? raw.tournamentEndTime ?? _startTs;
            const _endLateTs = raw.lateRegistrationEndTime;

            if (btn === BTN.RUNNING || btn === BTN.SPECTATE || btn === BTN.REENTRY) {
                const { time } = this._fmtTime(_startTs);
                this._setCD('heading', 'Running Since');
                this._setCD('time', time);
            } else if (btn === BTN.LATE_REG) {
                const { time } = this._fmtTime(_endLateTs);
                this._setCD('info', 'Late Reg');
                this._setCD('heading', heading);
                this._setCD('time', time);
            } else if (btn === BTN.COMPLETED || btn === BTN.CANCELLED) {
                const { time } = this._fmtTime(_endTs);
                this._setCD('heading', heading);
                this._setCD('time', time);
            } else {
                const { date, time } = this._fmtTime(_startTs);
                this._setCD('heading', date);
                this._setCD('time', time);
            }
        }
    }

    private _applyBasicInfo(data: any) {
        const raw = data;
        const isSNG = raw.tournamentType === 'SIT N GO';

        this.tournamentName.string = isSNG ? raw.stageName : data.tournamentName;
        if (isSNG) ServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyResponseEvent, this.onTournamentLobbyResponseEvent.bind(this));

        // cc.find('RoomInfo/TimeGroup/Layout/Label1', this.node).getComponent(cc.Label).string = data.gameVariation;
        // cc.find('RoomInfo/TimeGroup/Layout/Label2', this.node).getComponent(cc.Label).string = data.isReentryAllowed ? 'RE' : ' ';
        // cc.find(GameManager.isMobile ? 'RoomInfo/TimeGroup/Layout/Label3' : 'RoomInfo/TimeGroup/Layout2/Label3', this.node).getComponent(cc.Label).string = data.maxPlayers || raw.maxPlayersAllowed || '';
        // cc.find(GameManager.isMobile ? 'RoomInfo/TimeGroup/Layout/Label4' : 'RoomInfo/TimeGroup/Layout2/Label4', this.node).getComponent(cc.Label).string = data.actionTypeFullName;

        const _nlhNode = cc.find('NLH', this.node);
        const _ploNode = cc.find('PLO', this.node);
        const _isPLO = ['PLO', 'PLO5', 'PLO6', 'PLO 5', 'PLO 6', 'Omaha', 'Omaha5', 'Omaha6', 'Omaha 5', 'Omaha 6'].indexOf(data.gameVariation) !== -1;
        if (_nlhNode) _nlhNode.active = !_isPLO;
        if (_ploNode) {
            _ploNode.active = _isPLO;
            if (_isPLO) {
                const _map: { [k: string]: string } = { PLO: 'PLO', PLO5: 'PLO 5', PLO6: 'PLO 6', 'PLO 5': 'PLO 5', 'PLO 6': 'PLO 6', Omaha: 'PLO', Omaha5: 'PLO', Omaha6: 'PLO 6', 'Omaha 5': 'PLO 5', 'Omaha 6': 'PLO 6' };
                const lbl = _ploNode.getComponent(cc.Label) || _ploNode.getComponentInChildren(cc.Label);
                if (lbl) lbl.string = _map[data.gameVariation] || 'PLO';
                else console.warn('[TLI] PLO label not found');
            }
        }

        cc.find('RoomInfo/BuyInGroup/BuyInLayout/Label', this.node).getComponent(cc.Label).string = GameManager.convertChips((raw.entryFees || 0) + (raw.houseFees || 0));
        cc.find('RoomInfo/NameGroup/Layout/PrizeLabel', this.node).getComponent(cc.Label).string = GameManager.convertChips(data.guaranteedValue);

        const _rebuyNode = cc.find('RoomInfo/NameGroup/Layout/AddNRe/ReBuy', this.node);
        const _addonNode = cc.find('RoomInfo/NameGroup/Layout/AddNRe/AddOn', this.node);
        if (_rebuyNode) _rebuyNode.active = !!raw.allowRebuys;
        if (_addonNode) _addonNode.active = !!raw.addOn;

        if (isSNG) {
            cc.find('RoomInfo/NameGroup/Layout/Entries/PrizeLabel', this.node).getComponent(cc.Label).string = raw.playerRemainingRatio.inGamePlayers + '/' + raw.maxPlayers;
            // cc.find('RoomInfo/TimeGroup/TimeLabel', this.node).getComponent(cc.Label).string = 'N/A';
            // cc.find('RoomInfo/TimeGroup/TimeLabel', this.node).active = true;
        } else {
            const _state = data.state || raw?.state || '';
            const _isRunning = _state === 'RUNNING';
            const _isEndedState = _state === 'CLOSED' || _state === 'Closed' || _state === 'COMPLETED' || _state === 'Completed' || _state === 'CANCELED' || _state === 'CANCELLED';
            const _st = raw.tournamentStartDetails?.startTime ?? raw.tournamentStartTime;
            const _displayTs = _isEndedState ? (raw.closedAt ?? raw.tournamentEndTime ?? _st) : _st;
            const { date: _fDate, time: _fTime } = this._fmtTime(_displayTs);
            const _timeLabelStr = _isRunning ? 'Running' : `${_fDate} ${_fTime}`;
            // cc.find('RoomInfo/TimeGroup/TimeLabel', this.node).getComponent(cc.Label).string = _timeLabelStr;
            const _isRegPhase = data.state === 'PUBLISHED' || data.state === 'Open To Register' || data.state === 'REGISTER' || data.state === 'Registration Freezed' || data.state === 'FREEZED';
            // console.log("")
            const _entriesNode = cc.find('RoomInfo/NameGroup/Layout/Entries', this.node);
            const _entriesLayout = _entriesNode.getComponent(cc.Layout);
            const _entriesWidget = _entriesNode.getComponent(cc.Widget);
            _entriesLayout.enabled = false;
            if (_entriesWidget) _entriesWidget.enabled = false;
            cc.find('RoomInfo/NameGroup/Layout/Entries/PrizeLabel', this.node).getComponent(cc.Label).string =
                _isRegPhase ? `${raw.registeredCount}`
                    : _isRunning ? `${raw.activePlayerCount}/${raw.registeredCount}`
                        : _isEndedState ? `0`
                            : `${raw.registeredCount}/${raw.maxPlayersAllowed}`;
            this.scheduleOnce(() => {
                _entriesLayout.enabled = true;
                if (_entriesWidget) _entriesWidget.enabled = true;
            }, 0.001)
            if (data.state === 'Canceled' || data.state === 'CANCELLED') {
                const _regSuccess = cc.find("Canvas/Tournament/TournamentRegistrationSucces");
                if (_regSuccess && _regSuccess.active) _regSuccess.active = false;
            }
        }

        if (!GameManager.isMobile) {
            const firstPrize = (raw.payoutStructure?.payoutRecord?.[0])
                ? Math.floor(raw.guaranteedValue * raw.payoutStructure.payoutRecord[0].playerPayout / 100) + ''
                : '';
            cc.find('RoomInfo/TimeGroup/FirstPrize', this.node).getComponent(cc.Label).string = firstPrize;
            this._setCD('info', '');
            this._setCD('time', '');
        }

        const fee = (raw.entryFees || 0) + (raw.houseFees || 0);

        this.tourItemInfo.btnLabel = this.btnLabel.string;
        // this.tourItemInfo.node = this.node;

        if (raw.roomImage && cc.find('icon', this.node).getComponent(cc.Sprite).spriteFrame == null) {
            cc.find('icon', this.node).active = false;
            (function (roomImage, instance) {
                cc.loader.load(K.ServerAddress.assets_server_s + roomImage, function (err, tex) {
                    if (!err) {
                        cc.find('icon', instance).active = true;
                        cc.find('icon', instance).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
                    }
                });
            })(raw.roomImage, this.node);
        }
    }

    private _applyTimers(_btn: BTN, _data: any, _prevState: string | null) {
        this.unschedule(this.breakEndsTimer);
        this.unschedule(this.startsInTimer);
        this.unschedule(this.endsInTimer);
        this.unschedule(this.regStartsInTimer);
        this.unschedule(this.upcomingStartTimer);
        this.unschedule(this.sinceTimer);
        // 
        if (_btn == BTN.LATE_REG) {
            this.updateEndsInTimer();
        }
    }



    updateBreakEndsTimer() {
        this.unschedule(this.startsInTimer);
        this.unschedule(this.endsInTimer);
        this.unschedule(this.regStartsInTimer);
        this.unschedule(this.breakEndsTimer);
        this.unschedule(this.sinceTimer);
        this.breakEndsTimer();
        this.schedule(this.breakEndsTimer, 1);
    }

    breakEndsTimer() {
        let timeRemaining = GameManager.getMTimeDuration(this._tsMs(this.tourItemInfo.currentTournamentBreak.breakEndTime));
        if (GameManager.isMobile) {
            this._setCD('heading', 'Ends in');
            this._setCD('time', timeRemaining);
        } else {
            this._setCD('info', "Ends in:");
            this._setCD('time', timeRemaining);
        }
    }

    upcomingStartTimer() {
        const raw = this.tourItemInfo;
        const _gm = (window as any).GameManager;
        const _targetMs = this._tsMs(raw.registrationStartTime ?? raw.tournamentStartTime);
        const timeRemaining = _gm.getMTimeDuration(_targetMs);
        if (_gm.isMobile) {
            this._setCD('heading', 'Will Start in');
            this._setCD('time', timeRemaining);
        }
    }

    updateRegStartsInTimer() {
        this.unschedule(this.startsInTimer);
        this.unschedule(this.endsInTimer);
        this.unschedule(this.regStartsInTimer);
        this.unschedule(this.breakEndsTimer);
        this.unschedule(this.sinceTimer);
        this.regStartsInTimer();
        this.schedule(this.regStartsInTimer, 1);
    }

    regStartsInTimer() {
        const _regOpenTime = this.tourItemInfo.registrationBeforeStarttime;
        const _startFallback = (this.tourItemInfo.tournamentStartDetails && this.tourItemInfo.tournamentStartDetails.startTime)
            ? this.tourItemInfo.tournamentStartDetails.startTime
            : this.tourItemInfo.tournamentStartTime;
        let timeRemaining = GameManager.getMTimeDuration(this._tsMs(_regOpenTime || _startFallback));
        if (GameManager.isMobile) {
            this._setCD('heading', 'Reg Opens In');
            this._setCD('time', timeRemaining);
        } else {
            let date = new Date(this._tsMs(_regOpenTime || _startFallback));
            timeRemaining = (date.toDateString().split(' ')[1]) + " " + (date.getDate()) + " " + timeRemaining;
            this._setCD('info', "Reg opens in:");
            this._setCD('time', timeRemaining);
        }
    }

    updateStartsInTimer() {
        this.unschedule(this.startsInTimer);
        this.unschedule(this.endsInTimer);
        this.unschedule(this.regStartsInTimer);
        this.unschedule(this.breakEndsTimer);
        this.unschedule(this.sinceTimer);
        this.startsInTimer();
        this.schedule(this.startsInTimer, 1);
    }

    startsInTimer() {
        const raw = this.tourItemInfo;
        const _isEnrolled = !!(raw.playerData || raw.playerStatus === 'REGISTERED');
        let _targetTime: any;
        if (_isEnrolled) {
            // enrolled → countdown to tournament start
            _targetTime = (raw.tournamentStartDetails && raw.tournamentStartDetails.startTime)
                ? raw.tournamentStartDetails.startTime
                : raw.tournamentStartTime;
        } else {
            // not enrolled → countdown to registration close
            _targetTime = raw.registrationEndTime
                ?? raw.registrationBeforeStarttime
                ?? raw.tournamentStartTime;
        }
        let timeRemaining = GameManager.getMTimeDuration(this._tsMs(_targetTime));
        if (GameManager.isMobile) {
            const heading = _isEnrolled ? 'Start In' : 'Closing In';
            this._setCD('heading', heading);
            this._setCD('time', timeRemaining);
        } else {
            let date = new Date(this._tsMs(_targetTime));
            timeRemaining = (date.toDateString().split(' ')[1]) + " " + (date.getDate()) + " " + timeRemaining;
            this._setCD('info', _isEnrolled ? "Start in:" : "Reg ends in:");
            this._setCD('time', timeRemaining);
        }
    }

    updateEndsInTimer() {
        this.unschedule(this.startsInTimer);
        this.unschedule(this.endsInTimer);
        this.unschedule(this.regStartsInTimer);
        this.unschedule(this.breakEndsTimer);
        this.unschedule(this.sinceTimer);
        this.endsInTimer();
        this.schedule(this.endsInTimer, 1);
    }

    endsInTimer() {
        let ts = this._tsMs(this.tourItemInfo.lateRegistrationEndTime);
        let ts2 = this._tsMs(this.tourItemInfo.lateRegistrationEndTime);
        var date = new Date();
        ts2 = ts2 - date.getTime();

        let timeRemaining = GameManager.getMTimeDuration(ts);
        if (GameManager.isMobile) {
            this._setCD('heading', 'Ends In');
            this._setCD('time', timeRemaining);

            console.log('endsInTimer1');
            if (ts2 < 0) {
                console.log('endsInTimer2');
                this.unschedule(this.endsInTimer);
                const _prevState = this.tourItemInfo ? this.tourItemInfo.state : null;
                const btn = this._computeBtn(this.tourItemInfo);
                console.log('btn', btn);
                this._applyMobileBadge(btn, this.tourItemInfo);
                this._applyTimers(btn, this.tourItemInfo, _prevState);
            }
        } else {
            let date = new Date(this._tsMs(this.tourItemInfo.lateRegistrationEndTime));
            timeRemaining = (date.toDateString().split(' ')[1]) + " " + (date.getDate()) + " " + timeRemaining;
            this._setCD('info', "Reg ends in:");
            this._setCD('time', timeRemaining);
        }
    }

    freezeTimer() {
        const raw = this.tourItemInfo;
        const _targetTime = raw.tournamentStartDetails?.startTime ?? raw.tournamentStartTime;
        const timeRemaining = GameManager.getMTimeDuration(this._tsMs(_targetTime));
        if (GameManager.isMobile) {
            this._setCD('heading', 'Start In');
            this._setCD('time', timeRemaining);
        } else {
            this._setCD('info', 'Start in:');
            this._setCD('time', timeRemaining);
        }
    }

    sinceTimer() {
        const _startTime = (this.tourItemInfo.tournamentStartDetails && this.tourItemInfo.tournamentStartDetails.startTime)
            ? this.tourItemInfo.tournamentStartDetails.startTime
            : this.tourItemInfo.tournamentStartTime;
        if (!_startTime) return;
        const elapsed = Date.now() - this._tsMs(_startTime);
        const h = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
        this._setCD('time', `${h}:${m}:${s}`);
    }

    setHighlight(highlight: boolean) {
    }

    onTournamentItemSecondClick() {
        cc.systemEvent.emit(K.SocketIOEvent.Lobby.TournamentSelect, this.tourItemInfo);
    }

    onClick() {
        // Tapping the card row always navigates into the tournament lobby, regardless
        // of state (register/late-reg/re-entry/etc.) — only the explicit button
        // (onClickButton) opens registration-related popups.
        if (!GameManager.isMobile) {
            globals.TournamentLobbyListPresenter.removeHighlightAll();
            this.setHighlight(true);
            cc.systemEvent.emit('TournamentItemPicked', this.tourItemInfo);
        }
        else {
            // if (this.highlightBg.active) {
            //     if (this.tourItemInfo.tournamentType == "SIT N GO") {
            //         return;
            //     }
            //     this.onTournamentItemSecondClick();
            // } else {
            //     globals.TournamentLobbyListPresenter.removeHighlightAll();
            //     this.setHighlight(true);
            // }
            cc.systemEvent.emit('TournamentItemPicked', this.tourItemInfo);
        }
    }

    onClickButton(sender: any) {
        // console.log("onClickButton", this.tourItemInfo);

        if (!this.tourItemInfo) return;

        // SIT N GO "Enter Table" — handled separately via label text because SIT N GO
        // uses a shared button node that changes label depending on player state.
        if (this.tourItemInfo.tournamentType == "SIT N GO" && sender.target.children[0].getComponent(cc.Label).string == "Enter Table") {
            let tableId = "";
            for (let id in this.tourItemInfo.player_list) {
                if (this.tourItemInfo.player_list[id].playerId == GameManager.user.playerId) {
                    tableId = this.tourItemInfo.player_list[id].tableId;
                    break;
                }
            }
            if (tableId == "" && this.tourItemInfo.playerData) {
                tableId = this.tourItemInfo.playerData.tableId;
            }

            this.isTableExisting = false;
            this.isTournamentExisting = false;
            this.indexFound = -1;
            this.tournamentIndexFound = -1;
            for (var index = 0; index < GameManager.gameModel.activePokerModels.length; index++) {
                var id = GameManager.gameModel.activePokerModels[index].roomConfig._id;
                if ((tableId ? tableId : this.tourItemInfo.playerData.tableId) === id) {
                    this.indexFound = index;
                    this.isTableExisting = true;
                    break;
                }
            }
            if (this.isTableExisting) {
                ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, this.indexFound, function () { });
                return;
            }
            ServerCom.socketIOBroadcast(tableId + ":" + GameManager.user.playerId, this.onTournamentTableUserBroadcast.bind(this));
            window.TournamentLobbyHandler.requestTournamentEnterTable(
                { tournamentId: this.tourItemInfo._id },
                (data) => { },
                (error) => { },
                "Enter table, please wait ......"
            );
            return;
        }

        // For all other cases, derive the correct action from _computeBtn so that the
        // click behaviour always matches what the button label is showing.
        const btn = this._computeBtn(this.tourItemInfo);
        // console.log("[TLI] onClickButton btn:", BTN[btn], "state:", this.tourItemInfo.state);

        switch (btn) {
            case BTN.REGISTER:
                GameManager.popUpManager.show(PopUpType.TournamentRegistrationPopup, {"tourData": this.tourItemInfo, "type": 4});
                break;

            case BTN.LATE_REG:
                GameManager.popUpManager.show(PopUpType.TournamentRegistrationPopup, {"tourData": this.tourItemInfo, "type": 2});
                break;

            case BTN.REENTRY:
                GameManager.popUpManager.show(PopUpType.TournamentRegistrationPopup, {"tourData": this.tourItemInfo, "type": 3});
                break;

            case BTN.ENTER_TABLE:
            case BTN.RUNNING:
            case BTN.SPECTATE: {
                const _btn = this.btnSprite?.node?.getComponent(cc.Button);
                if (_btn) {
                    _btn.interactable = false;
                    this.scheduleOnce(() => { _btn.interactable = true; }, 1.5);
                }
                this.enterTable();
                break;
            }

            case BTN.ENROLLED:
            case BTN.DEREGISTER:
            case BTN.FREEZED:
            case BTN.UPCOMING:
            case BTN.COMPLETED:
            case BTN.CANCELLED:
            default:
                break;
        }
    }

    onTournamentLobbyResponseEvent(data: any) {
        if (data.eventName === "Res-RegisterSNG") {
            ServerCom.forceKeepLoading = false;
            if (data && data.data && data.data.success && data.data.requestedTournamentId == this.tourItemInfo._id) {
                var newTableEvent = K.SocketIOBroadcast.Lobby.TournamentNewTable.replace("<TournamentId>", data.data.requestedTournamentId).replace("<PlayerId>", data.data.requesterPlayerId);

                socketIO.socket.off(newTableEvent);
                ServerCom.socketIOBroadcast(newTableEvent, this.onTournamentNewTable.bind(this));

                if (this.tourItemInfo.tournamentType == "SIT N GO") {
                    GameManager.popUpManager.show(PopUpType.NotificationPopup, "Congratulations! Your registration for the " + this.tourItemInfo.stageName + " has been confirmed", function () { });
                }
                else {
                    GameManager.popUpManager.show(PopUpType.NotificationPopup, "Congratulations! Your registration for the " + this.tourItemInfo.tournamentName + " has been confirmed", function () { });
                }
            }
        }
    }

    onTournamentTableUserBroadcast(data: any) {
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>onTournamentTableUserBroadcast", data);
        if (data.eventName == "joinChannelResponse" || data.eventName == "enterChannelResponse") {

            // for (let tableId in this.tourItemInfo.tablesStack) {
            //     tableId = tableId.slice(1);
            //     socketIO.off(tableId + ":" + GameManager.user.playerId);
            //     break;
            // }

            if (data.data.success) {
                GameManager.popUpManager.hideAllPopUps();
                cc.systemEvent.emit("HideTournamentNotification");

                // socketIO.off(this.newTableData.eventData.tableId + ":" + this.newTableData.eventData.playerId);
                // socketIO.off(this.tourData.playerData.tableId + ":" + this.tourData.playerData.playerId);
                socketIO.socket.off(data.eventTo);
                socketIO.socket.off(data.channelId + ":" + data.playerId);
                var newTableEvent2 = K.SocketIOBroadcast.Lobby.TournamentElimination.replace("<TournamentId>", this.tourItemInfo._id).replace("<PlayerId>", data.playerId);
                socketIO.socket.off(newTableEvent2);

                if (!GameManager.isActive) {
                    // console.log("?????????");
                    ServerCom.forceKeepLoading = false;
                    return;
                }

                let gameData = new data.data;
                const _rawTour1 = this.tourItemInfo;
                if (_rawTour1 && !_rawTour1.isInBreak && _rawTour1.currentTournamentBreak?.breakEndTime) {
                    _rawTour1.isInBreak = true;
                    _rawTour1.currentBreakDetails = { breakEndTime: _rawTour1.currentTournamentBreak.breakEndTime };
                }
                gameData.tourData = this.tourItemInfo;

                if (this.isTournamentExisting) {
                    // GameManager.gameModel.activePokerModels[this.tournamentIndexFound];
                    GameManager.gameModel.activePokerModels[this.tournamentIndexFound].initiliazePoker(gameData);
                }
                else {
                    ScreenManager.showScreen(K.ScreenEnum.GamePlayScreen, gameData, function () { });
                }
                // 
                this.scheduleOnce(function () {
                    ServerCom.forceKeepLoading = false;
                }, 1.2);

            }
            else {
                ServerCom.forceKeepLoading = false;
                // 
                GameManager.popUpManager.show(
                    PopUpType.CommonDialog,
                    {
                        "title": "Error!",
                        "content": (data.data.info ? data.data.info : data.data.response)
                    },
                    function () { }
                );
            }
        }
    }

    onTournamentNewTable(data: any) {
        // console.log("onTournamentNewTable", data);
        // cc.find('RoomInfoMobile/endTime', this.tabPage[0]).active = true;
        // this.newTableData.eventData.tableId

        ServerCom.socketIOBroadcast(data.eventData.tableId + ":" + GameManager.user.playerId, this.onTournamentTableUserBroadcast.bind(this));
        //

        GameManager.tableStartTime = data.eventData.tableStartTime;

        if (GameManager.isActive) {
            window.TournamentLobbyHandler.requestTournamentEnterTable(
                {
                    tournamentId: this.tourItemInfo._id
                },
                (data) => {
                },
                (error) => {
                },
                "Enter table, please wait ......"
            );
        }
    }

    enterTable() {
        if (!this.tourItemInfo) return;

        const raw = this.tourItemInfo;
        const tournamentId = this.tourItemInfo._id;
        if (!tournamentId) return;
        const popup = cc.find("Canvas/Tournament/TournamentRegistrationSucces");
        if (popup) popup.active = false;
        const tableId = raw.playerData?.tableId;
        const activeModels = (window as any).GameManager?.gameModel?.activePokerModels ?? [];
        let existingIndex = -1;
        for (let i = 0; i < activeModels.length; i++) {
            const m = activeModels[i];
            const matchChannel = tableId && m?.gameData?.channelId === tableId;
            const matchTournament = m?.gameData.tournamentId === tournamentId;
            if (matchChannel || matchTournament) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex !== -1) {
            const popup = cc.find("Canvas/TournamentLobbyDetail");
            if (popup) popup.active = false;
            (window as any).GameManager.popUpManager.hideAllPopUps();
            (window as any).ScreenManager.showScreen((window as any).K.ScreenEnum.GamePlayScreen, existingIndex, () => { });
            return;
        }

        if (GameManager.activeTableCount > 0) {
            if (GameManager.activeTableCount >= GameManager.maxTableCounts) {
                GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                return;
            }
        }


        cc.systemEvent.once("enterChannelResponse", (resData: any) => {
            if (!resData?.success) {
                if (resData.isMaxTable == true) {
                    GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
                }
                return;
            }
            if (resData.tournamentId !== tournamentId) return;
            cc.systemEvent.emit("HideTournamentNotification");
            (window as any).GameManager.popUpManager.hideAllPopUps();
            if (!resData.antibanking) resData.antibanking = { isAntiBanking: false, amount: 0, timeRemains: 0 };
            if (!resData.playerName) resData.playerName = (window as any).GameManager?.user?.userName || "";
            try {
                let gameData = resData;
                const _rawTour2 = this.tourItemInfo;
                if (_rawTour2 && !_rawTour2.isInBreak && _rawTour2.currentTournamentBreak?.breakEndTime) {
                    _rawTour2.isInBreak = true;
                    _rawTour2.currentBreakDetails = { breakEndTime: _rawTour2.currentTournamentBreak.breakEndTime };
                }
                gameData.tourData = this.tourItemInfo;
                const popup = cc.find("Canvas/TournamentLobbyDetail");
                if (popup) popup.active = false;
                (window as any).ScreenManager.showScreen((window as any).K.ScreenEnum.GamePlayScreen, gameData, () => { });
            } catch (e) {
                console.error("[LobbyListItem] enterTable showScreen error:", e);
            }
        });

        (window as any).TournamentServerCom.socketIORequest(
            "tournamentGameEvent|enterTable",
            { tournamentId },
            () => { },
            null, 5000, false
        );
    }
}
