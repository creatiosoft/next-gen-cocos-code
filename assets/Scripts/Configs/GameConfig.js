/**
 * @namespace Configs
 */

/**
 * @class GameConfig
 * @memberof Configs
 */

/** 
 * @alias window
 * @name root
 * @memberof Configs.GameConfig#
 */
var root = window;

root.K = {};

// "cleanup" | "qa" | "prod"
root.K.ActiveServer = "cleanup";

root.K.AppVersion = {
    appVersion: "1.14",
    buildVersion: "1.7",
};

if (root.K.ActiveServer === "prod" || root.K.ActiveServer === "production") {
    console.warn = console.error = console.trace = console.log = cc.log = function () {};
}

var SERVER_PRESETS = {
    cleanup: {
        address: {
            ipAddress: "https://connector-nextgengames-dev.creatiosoft.dev",
            gameServer: "https://connector-nextgengames-dev.creatiosoft.dev",
            gamePort: 443,
            maintainanceIP: "https://maintenance-dashboard-api-nextgengames-dev.creatiosoft.dev",
            maintainancePort: 443,
            port: 443,
            wss: true,
            clientVer: "1.4",
            pokerVer: "0.0",
            assets_server: "https://cashgame-dashboard-api-nextgengames-dev.creatiosoft.dev",
            assets_server_s: "https://nextgengames-dev-assets.s3.us-east-1.amazonaws.com",
            otp_server: "https://auth-api-nextgengames-dev.creatiosoft.dev",
            otp_new_server: "https://auth-nextgengames-dev.creatiosoft.dev",
            ads_server: "https://cashgame-dashboard-api-nextgengames-dev.creatiosoft.dev",
            payment_html: "https://auth-api-nextgengames-dev.creatiosoft.dev/demo/payment-demo.html",
            agora_appid: "d19330a189e441b7b5bdf29ffb35b6d4",
            tournamentServer: "https://tournament-connector-nextgengames-dev.creatiosoft.dev"
        },
        token: {
            auth_server: "https://auth-api-nextgengames-dev.creatiosoft.dev/api/auth/login/",
            auth_refresh_server: "https://auth-api-nextgengames-dev.creatiosoft.dev/api/auth/refresh"
        }
    },
    qa: {
        address: {
            ipAddress: "https://connector-txsocial-qa.creatiosoft.dev",
            gameServer: "https://connector-txsocial-qa.creatiosoft.dev",
            gamePort: 443,
            maintainanceIP: "https://maintenance-dashboard-api-txsocial-qa.creatiosoft.dev",
            maintainancePort: 443,
            port: 443,
            wss: true,
            clientVer: "1.4",
            pokerVer: "0.0",
            assets_server: "https://cashgame-dashboard-api-txsocial-qa.creatiosoft.dev",
            assets_server_s: "https://txpoker-qa-assets.s3.us-east-1.amazonaws.com",
            otp_server: "https://auth-api-txsocial-qa.creatiosoft.dev",
            otp_new_server: "https://auth-txsocial-qa.creatiosoft.dev",
            ads_server: "https://cashgame-dashboard-api-txsocial-qa.creatiosoft.dev",
            payment_html: "https://auth-api-txsocial-qa.creatiosoft.dev/demo/payment-demo.html",
            agora_appid: "d19330a189e441b7b5bdf29ffb35b6d4",
            tournamentServer: "https://tournament-connector-txsocial-qa.creatiosoft.dev"
        },
        token: {
            auth_server: "https://auth-api-txsocial-qa.creatiosoft.dev/api/auth/login/",
            auth_refresh_server: "https://auth-api-txsocial-qa.creatiosoft.dev/api/auth/refresh"
        }
    },
    prod: {
        address: {
            ipAddress: "https://connector.txpokeronline.com",
            gameServer: "https://connector.txpokeronline.com",
            gamePort: 443,
            maintainanceIP: "https://maintenance-dashboard-api.txpokeronline.com",
            maintainancePort: 443,
            port: 443,
            wss: true,
            clientVer: "1.7",
            pokerVer: "0.0",
            assets_server: "https://cashgame-dashboard-api.txpokeronline.com",
            assets_server_s: "https://txpoker-production-assets.s3.us-east-1.amazonaws.com",
            otp_server: "https://auth-api.txpokeronline.com",
            otp_new_server: "https://auth.txpokeronline.com",
            ads_server: "https://cashgame-dashboard-api.txpokeronline.com",
            payment_html: "https://auth-api.txpokeronline.com/demo/payment-demo.html",
            agora_appid: "d19330a189e441b7b5bdf29ffb35b6d4",
            tournamentServer: "https://tournament-connector.txpokeronline.com"
        },
        token: {
            auth_server: "https://auth-api.txpokeronline.com/api/auth/login/",
            auth_refresh_server: "https://auth-api.txpokeronline.com/api/auth/refresh"
        }
    }
};

var _serverKey = root.K.ActiveServer === "production" ? "prod" : root.K.ActiveServer;
var _serverPreset = SERVER_PRESETS[_serverKey] || SERVER_PRESETS.qa;

root.K.ServerAddress = _serverPreset.address;
root.K.Token = {
    auth_server: _serverPreset.token.auth_server,
    auth_refresh_server: _serverPreset.token.auth_refresh_server,
    access_token: "",
    refresh_token: "",
    membershipToken: "",
    access_token_expire_at: 0,
    refresh_token_expire_at: 0,
};

root.K.disconnectRequestedByPlayer = false;
root.K.internetAvailable = true;
root.K.disconnectMultiLogin = false;
root.K.MaxTableCount = 4;


root.K.Error = cc.Enum({
    TimeOutError: 504,
    ConnectionError: 444,
    SuccessFalseError: 454,
    KeyMissingBroadcasts: 1001,
    ServerDown: 3001,
    PlayerSessionShiftedOnServer: 5001,
    FeatureComingSoon: 5010,
    UpdateAvailable: 5011,
    SessionError: 5015,

});

root.K.Variation = cc.Enum({
    None: -1,
    TexasHoldem: "Texas Hold’em",
    Omaha: "Omaha",
    OmahaHiLo: "Omaha Hi-Lo",
    OpenFaceChinesePoker: "Open Face Chinese Poker",
    All: "All"
});

root.K.ChannelType = {
    Normal: "NORMAL",
    Tournament: "TOURNAMENT"
};

root.K.TournamentType = {
    Normal: "NORMAL",
    SitNGo: "SIT N GO",
    Satellite: "SATELLITE",
};

root.K.CardColoring = {
    TwoCardColor: "TwoCardColor",
    FourCardColor: "FourCardColor"
};

root.K.ScreenEnum = new cc.Enum({
    SplashScreen: 0,
    SignupScreen: 1,
    LoginScreen: 2,
    LobbyScreen: 3,
    GamePlayScreen: 4,
    ForgotPasswordScreen: 5,
    None: 100
});

root.K.SeatState = {
    Free: "Free",
    Occupied: "Occupied",
    Hidden: "Hidden",
    Closed: "Closed",
};

root.K.PlayerState = {
    None: "",
    Waiting: "WAITING",
    Playing: "PLAYING",
    OutOfMoney: "OUTOFMONEY",
    OnBreak: "ONBREAK",
    Disconnected: "DISCONNECTED",
    Left: "ONLEAVE",
    AllIn: "ALLIN",
    Fold: "FOLD",
    Reserved: "RESERVED",
    Rebuy: "REBUYING",
};

root.K.GameState = {
    Idle: "IDLE",
    Running: "RUNNING",
    GameOver: "GAMEOVER",
};

root.K.PlayerMove = {
    Check: "CHECK",
    Call: "CALL",
    Bet: "BET",
    Raise: "RAISE",
    AllIn: "ALLIN",
    Fold: "FOLD",
};

root.K.GameEndType = {
    GameCompleted: "GAMECOMPLETED",
    EverybodyPacked: "EVERYBODYPACKED",
    OnePlayerLeft: "ONLYONEPLAYERLEFT",
};

root.K.Round = {
    Preflop: "PREFLOP",
    Flop: "FLOP",
    Turn: "TURN",
    River: "RIVER",
    Showdown: "SHOWDOWN",
};

root.K.GameEvents = {
    OnTableClosed: "TableClosed",
    OnAvatarChange: "AvatarChanged",
    OnTableColorChange: "TableColorChanged",
    onReset: "onReset",
};

root.K.PokerEvents = {
    OnJoin: "OnJoin",
    OnHoleCard: "HoleCard",
    OnPlayerCard: "PlayerCard",
    OnSit: "Sit",
    OnBlindDeduction: "BlindDeduction",
    OnGamePlayers: "GamePlayers",
    OnPlayerStateChange: "PlayerStateChange",
    OnDealerChat: "DealerChat",
    OnStartGame: "StartGame",
    OnTurn: "Turn",
    OnRoundOver: "RoundOver",
    OnGameOver: "GameOver",
    OnLeave: "Leave",
    OnChat: "Chat",
    onPlayerStandUp: "StandUp",
    onTimerTick: "TimerTick",
    onDisconnectTimerTick: "DisconnectTimerTick",
    onTableTabSelected: "TableTabSelected",
    onRotateView: "RotateView",
    onTurnInOtherRoom: "TurnInOtherRoom",
    OnClearHoleCards: "ClearHoleCards",
    onPreCheck: "onPreCheck",
    onSitnGoElimination: "sgoEliminated",
    onPlayerCoins: "onPlayerCoins",
    onDealerChatSettingsChanged: "onDealerChatSettingsChanged",
    onChatSettingsChanged: "onChatSettingsChanged",
    onBlindsChanged: "onBlindsChanged",
    onAddonChanged: "onAddonChanged",
    OnBankrupt: "OnBankrupt",
    onPlayerNotes: "onPlayerNotes",
    onHandTab: "onHandTab",
    onGameStateChange: "onGameStateChanged",
    onBreakTime: "onbreakTime",
    onBreakTimeStart: "onBreakTimeStart",
    onOfcFirstRoundCards: "onOfcFirstRoundCards",
    onRebuyStatus: "onRebuyStatus",
    onBestHand: "onBestHand",
    onTimeBank: "startTimeBank",
    onCardColorChange: "CardColorChanged",
    onChannelEvent: "onChannelEvent",
    onAddonTimeStart: "onAddonTimeStart",
    onAddonTimeEnd: "onAddonTimeEnd",
    onAddonCheckBox: "onAddonCheckBox",
    onRebuyCheckBox: "onRebuyCheckBox",
    onBreakTimeEnd: "onBreakTimeEnd",
    onPlayerRankChange: "onPlayerRankChange",
    onBlindsChangeStopped: "onBlindsChangeStopped",
    onSendSticker: "onSendSticker",
};

root.K.Suit = cc.Enum({
    Spade: 1,
    Heart: 2,
    Club: 3,
    Diamond: 4,
});

root.K.ServerAPI = {
    maintainance: "/maintainanceAndUpdate",
    freeChips: "/collectFreeChips",
    forgotPassword: "/forgotPassword",
    resetPassword: "/resetPassword",
    emailVerification: "/resendEmailVerificationLink",
    requestOTP: "/sendOtp",
    verifyOTP: "/verifyOtp",
    transactionHistory: "/getTransactionHistory",
    wallet: "/getWalletInfo",
    imageUpload: "/profileImage",
    sendotp: "/sendOtpSignUP",
    forgotPassword: "/forgotPasswordUser",
};

root.K.Sounds = {
    userTurn: 0,
    playerBet: 1,
    playerRaise: 2,
    playerAllIn: 3,
    playerCall: 4,
    playerFold: 5,
    endTimer: 6,
    cardOpening: 7,
    chipDistribution: 8,
    playerCheck: 9,
    playerCardFlip: 10,
    playerCardFlipSound: 11,
    turnSoundTopBar: 12,
    click: 13,
};

root.K.PomeloAPI = {
    gateLogin: "gate.gateHandler.getConnector",
    checkForMultiClient: "connector.entryHandler.enter",
    updateProfile: "connector.entryHandler.updateProfile",
    getTables: "connector.entryHandler.getLobbyTables",
    joinChannel: "room.channelHandler.joinChannel",
    autoSit: "room.channelHandler.autoSit",
    sitHere: "room.channelHandler.sitHere",
    makeMove: "room.channelHandler.makeMove",
    leaveTable: "room.channelHandler.leaveTable",
    connectionAck: "connector.entryHandler.isConnected",
    registerTournament: "connector.entryHandler.registerTournament",
    deRegisterTournament: "connector.entryHandler.deRegisterTournament",
    checkRegistration: "connector.entryHandler.isRegisteredUserInTournament",
    reportIssue: "connector.entryHandler.reportIssue",
    chatRequest: "room.channelHandler.chat",
    getProfile: "connector.entryHandler.getProfile",
    sitOutNextHand: "room.channelHandler.sitoutNextHand",
    sitOutNextBigBlind: "connector.entryHandler.sitoutNextBigBlind",
    addChips: "room.channelHandler.addChipsOnTable",
    resume: "room.channelHandler.resume",
    setAutoBuyIn: "connector.entryHandler.setAutoBuyIn",
    getTableStructure: "connector.entryHandler.getTableStructure",
    getUsers: "connector.entryHandler.getRegisteredTournamentUsers",
    resetSitout: "room.channelHandler.resetSitout",
    joinSimilar: "connector.entryHandler.joinSimilarTable",
    getBlindAndPrize: "connector.entryHandler.getBlindAndPrize",
    setFavTable: "connector.entryHandler.addFavourateTable",
    removeFavTable: "connector.entryHandler.removeFavourateTable",
    quickSeatCash: "connector.entryHandler.quickSeat",
    getPrizes: "connector.entryHandler.getPlayerPrize",
    collectPrize: "connector.entryHandler.collectPrize",
    getTableData: "connector.entryHandler.getTable",
    createNote: "connector.entryHandler.createNotes",
    getNote: "connector.entryHandler.getNotes",
    updateNote: "connector.entryHandler.updateNotes",
    deleteNote: "connector.entryHandler.deleteNotes",
    getBlindPrizeTournament: "connector.entryHandler.getBlindAndPrizeForNormalTournament",
    setPlayerValOnTable: "connector.entryHandler.setPlayerValueOnTable",
    getFilters: "connector.entryHandler.getFilters",
    quickSeatTournament: "connector.entryHandler.quickSeatInTournament",
    quickSeatSitNGo: "connector.entryHandler.quickSeatInSitNGo",
    getHandTab: "connector.entryHandler.getHandTab",
    getHandHistory: "connector.entryHandler.getHandHistory",
    lateRegistration: "connector.entryHandler.lateRegistration",
    joinWaitingList: "room.channelHandler.joinWaitingList",
    unJoinWaitingList: "room.channelHandler.leaveWaitingList",
    saveVideo: "room.channelHandler.insertVideoLog",
    getVideo: "room.channelHandler.getVideo",
    rebuyInTournament: "connector.entryHandler.rebuyInTournament",
    logout: "connector.entryHandler.logout",
    singleLogin: "connector.entryHandler.singleLogin",
    connectionAck2: "connector.entryHandler.acknowledgeIsConnected",
    getBlindAndPrizeForSatellite: "connector.entryHandler.getBlindAndPrizeForSatelliteTournament",
    updateTableSettings: "connector.entryHandler.updateTableSettings",
    fireChannelEvent: "room.channelHandler.channelBroadcast",
    //tournament
    addon: " connector.entryHandler.addOnInTournament",
    updateAutoRebuy: "connector.entryHandler.updateAutoRebuy",
    updateAutoAddon: "connector.entryHandler.updateAutoAddon",
    doubleRebuy: "connector.entryHandler.doubleRebuyInTournament",
    leaveTourney: "connector.entryHandler.leaveTournament",
    getCashDetails: "connector.entryHandler.getCashDetails",
    cashoutRequest: "connector.entryHandler.cashOutForPlayerAffilate",

    updatePreCheckOnServer: "room.channelHandler.updatePrecheck",

    //Free Roll API
    getFreeRollTables: "freeRoom.freeRollChannelHandler.getLobbyDetailsFreeRoll",
    getChannelId: "freeRoom.freeRollChannelHandler.getChannelId",
    joinFreeRoll: "freeRoom.freeRollChannelHandler.joinChannel",
    // sticker
    sendSticker: "room.channelHandler.sendSticker",
};

root.K.SocketIOAPI = {
    Lobby: {
        GetAllTableList: "tournamentListEvent|GetAllTableList",
        GetAllTournamentList: "tournamentListEvent|GetAllTournamentList",
        GetTournamentData: "tournamentLobbyEvent|GetTournamentData",
        GetSitNGoStages: "tournamentListEvent|GetSitNGoStages",
        GetSitNGoTournamentsInStage: "tournamentListEvent|GetSitNGoTournamentsInStage",
        RegisterSNG: "tournamentLobbyEvent|RegisterSNG",
        RegisterTournament: "tournamentLobbyEvent|Register",
        ReEntryTournament: "tournamentLobbyEvent|ReEntry",
        DeRegisterTournament: "tournamentLobbyEvent|Deregister",
        LateRegisterTournament: "tournamentLobbyEvent|LateRegister",
        TournamentJoinTable: "tournamentGameEvent|joinTable",
        TournamentEnterTable: "tournamentGameEvent|enterTable"
    },
    Game: {
        TournamentResume: "tournamentGameEvent|resume",
        TournamentMakeMove: "tournamentGameEvent|room.channelHandler.makeMove",
        TournamentPreAction: "tournamentGameEvent|room.channelHandler.updatePrecheck",
        TournamentChat: "tournamentGameEvent|chat",
        TournamentSitOut: "tournamentGameEvent|sitOut",
        TournamentResetSitout: "tournamentGameEvent|resetSitout",
        TournamentBestHands: "tournamentGameEvent|bestHands",
        TournamentFire: "tournamentGameEvent|channelBroadcast",
    }
};

root.K.SocketIOBroadcast = {
    Lobby: {
        TournamentList: "tournamentListResponseEvent",
        TournamentLobbyEvent: "tournamentLobbyEvent",
        TournamentUpdated: "Tournament:Update",
        TournamentRefresh: "Tournament:Refresh",
        TournamentClosed: "Tournament:Closed",
        TournamentBroadcast: "TournamentBroadcast",
        TournamentLobbyResponseEvent: "tournamentLobbyResponseEvent",
        TournamentNewTable: "<TournamentId>:NewTable:<PlayerId>",
        TournamentElimination: "<TournamentId>:Elimination:<PlayerId>",
    },
    Game: {

    }
};

root.K.SocketIOEvent = {
    Lobby: {
        TournamentSelect: "TournamentSelect"
    },
    Game: {
        Eliminated: "Eliminated",
        TournamentWinner: "TournamentWinner",
        BreakTime: "BreakTime",
        TournamentUpdated: "TournamentUpdated",
        TournamentClosed: "TournamentClosed",
        TableDestroyed: "TableDestroyed",
        DisconnectTime: "DisconnectTime",
    }
};

root.K.LobbyBroadcastRoute = {
    tableUpdate: "tableUpdate",
    tableView: "tableView",
    joinTableList: "joinTableList",
    updateProfile: "updateProfile",
    removeTable: "removeTable",
    addTable: "addTable",
    tournamentRoomChange: "tournamentRoomChange",
    tournamentTableUpdate: "tournamentTableUpdate",
    tournamentStateChange: "tournamentStateChange",
    tournamentRankUpdate: "tournamentRankUpdate",
    blindUpdated: "blindUpdated",
    tournamentLobby: "tournamentLobby",
    updateMegaPoints: "megaPoints",
    profileImageUpdated: "imageUpload",
};

root.K.BroadcastRoute = {
    sit: "sit",
    blindDeduction: "blindDeduction",
    gamePlayers: "gamePlayers",
    dealerrChat: "delaerChat",
    startGame: "startGame",
    turn: "turn",
    roundOver: "roundOver",
    gameOver: "gameOver",
    leave: "leave",
    chat: "chat",
    playerCards: "playerCards",
    playerState: "playerState",
    connectionAck: "connectionAck",
    preCheck: "preCheck",
    playerElimination: "playerElimination",
    playerCoins: "playerCoins",
    playerNewChannel: "playerNewChannelBroadcast",
    bankrupt: "bankrupt",
    avatarChange: "avatarChanged",
    autoJoinBroadcast: "autoJoinBroadcast",
    handTab: "handTab",
    breakTimerStart: "breakTimerStart",
    breakTime: "breakTime",
    ofcFirstRoundCards: "ofcFirstRoundCards",
    rebuyStatus: "rebuyStatus",
    bestHands: "bestHands",
    onTimeBank: "startTimeBank",
    onOnlinePlayers: "onlinePlayers",
    onFireEvent: "fireEvent",
    updateBlind: "updateBlind",
    addonTimeStarts: "addonTimeStarts",
    addonTimeEnds: "addonTimeEnds",
    antiBankingUpdatedData: "antiBankingUpdatedData",
    sendSticker: "sendSticker",
    eliminated: "eliminated",
    tournamentWinner: "tournamentWinner",
};

root.K.PlayerBroadcastRoute = {
    playerInfo: "playerInfo",
    connectionAck2: "isConnectedOnLogin",
};

root.K.KYC = {
    accessToken: "",
    password: "",
    state: "Pending"
};

root.K.AgoraEnabled = true;
root.K.BBJEnabled = true;
root.K.HighHandEnabled = false;
root.K.BBJAmount = 0;
root.K.highHandEnableInGame = false;
root.K.highHandToast = false;
root.K.highHandToastActive = false;
root.K.highHandToastData = [];
root.K.NewTournament = true;
root.K.SmartFocus = true;
root.K.androidBuildUrl = "";
root.K.iosBuildUrl = "";

module.exports = {
    K: K,
}

