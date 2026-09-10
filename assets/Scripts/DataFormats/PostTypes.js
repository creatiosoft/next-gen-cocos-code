/**
 * @class PostTypes
 * @classdesc Class defines data members and constructors which are used to create request objects.
 * @memberof DataFormats
 */

var login = {
    loginType: "registration",
    deviceType: "browser",
    loginMode: "normal",
    userName: "kumarsushil",
    emailId: "sushil@creatiosoft.com",
    password: "abcd",
    ipV4Address: "324324",
    ipV6Address: "123123",
    regotp:"",
    mobileNumber:"",
    appVersion:"",
    access_token:"",
    refresh_token:"",
    client:"",
    os:"",
    userAgent:"",
    deviceId:""
};

var loginData = null;

var forgotPassword = {
    userName: "sdfdsfsdfdsf",
    emailId: "sushil@creatiosoft.com",
};

var tableFilter = {
    "isRealMoney": true,  // required field
    // "channelVariation": "Omaha Hi-Lo" // optional field
};

var resetPassword = {
    passwordResetToken: "dhjsahdd",
    password: "fjdshfjd",
};

var userID = {
    playerId: "fdsfdsfdsf",
};

var OTP = {
    playerId: "fdsfdsfdsf",
    otp: 324234,
};

var transactionHistory = {
    playerId: "dshfkdhf",
    lowerLimit: 10,
    upperLimit: 20,
};

/**
 * @description 
 * @method tournament
 * @param {String} tournamentId
 * @param {String} playerId
 * @param {String} gameVersionCount
 * @memberof DataFormats.PostTypes
 */
function tournament(tournamentId, playerId, gameVersionCount) {
    this.playerId = playerId;
    this.tournamentId = tournamentId;
    this.gameVersionCount = gameVersionCount;
};

/**
 * @description Creates JoinChannel request object
 * @method joinChannel
 * @param {Object} data
 * @memberof DataFormats.PostTypes
 */
function joinChannel(data) {
    this.playerId = data.playerId || "";
    this.channelId = data.channelId || data._id || "";
    this.channelType = data.channelType;
    this.tableId = data.tableId || "";
    this.maxPlayers = data.maxPlayers;
    this.isRequested = true;
    this.isPrivateTable = data.isPrivateTabel;    
    // return this;
};

/**
 * @description 
 * @method openTable
 * @param {Object} data
 * @memberof DataFormats.PostTypes
 */
function openTable(data) {
    this.playerId = data.playerId || "";
    this.channelId = data._id || "";
    this.channelType = data.channelType;
    this.tableId = data.tableId || "";
    this.isRequested = true;
    this.playerName = data.playerName || "";
    this.networkIp = login.ipV4Address;
    // return this;
};

/**
 * @description Creates object for sit here request
 * @method sitData
 * @param {String} channelId
 * @param {String} playerId
 * @param {Object} chips
 * @param {Number} seatIndex
 * @param {String} playerName
 * @param {Object} imageAvtar
 * @param {boolean} isAutoReBuy
 * @memberof DataFormats.PostTypes
 */
function sitData(channelId, playerId, chips, seatIndex, playerName, imageAvtar, isAutoReBuy) {
    this.channelId = channelId;
    this.playerId = playerId;
    this.chips = chips;
    this.seatIndex = seatIndex;
    this.playerName = playerName;
    this.imageAvtar = "";//imageAvtar;
    this.isRequested = true;
    this.isAutoReBuy = isAutoReBuy;
    this.networkIp = login.ipV4Address;
    // return this;
};

/**
 * @description Creates object for sitout requests i.e. sitOutNextHnad and sitOutNextBigBlind
 * @method sitOutData
 * @param {String} channelId
 * @param {String} playerId
 * @memberof DataFormats.PostTypes
 */
function sitOutData(channelId, playerId) {
    this.channelId = channelId;
    this.playerId = playerId;
    this.isRequested = true;
}

/**
 * @description Creates object for resetSitout request 
 * @method resetSitout
 * @param {String} channelId
 * @param {String} playerId
 * @memberof DataFormats.PostTypes
 */
function resetSitout(channelId, playerId) {
    this.channelId = channelId;
    this.playerId = playerId;
    this.isRequested = true;
}

/**
 * @description Creates object for addChips request 
 * @method addChipsData
 * @param {String} channelId
 * @param {String} playerId
 * @param {Number} amount
 * @memberof DataFormats.PostTypes
 */
function addChipsData(channelId, playerId, amount) {
    this.channelId = channelId;
    this.playerId = playerId;
    this.amount = amount;
    this.isRequested = true;
}

/**
 * @description Creates request object when player makes a move 
 * @method moveData
 * @param {String} channelId
 * @param {String} playerId
 * @param {String} playerName
 * @param {Number} amount
 * @param {Object} action
 * @memberof DataFormats.PostTypes
 */
function moveData(channelId, playerId, playerName, amount, action) {
    this.channelId = channelId;
    this.playerId = playerId;
    this.playerName = playerName;
    this.amount = amount;
    this.action = action;
    this.isRequested = true;
    // return this;
};

/**
 * @description Creates object for leaveTable request
 * @method leaveData
 * @param {String} playerId
 * @param {String} channelId
 * @param {boolean} isStandup
 * @param {String} playerName
 * @memberof DataFormats.PostTypes
 */
function leaveData(playerId, channelId, isStandup, playerName) {
    this.playerId = playerId;
    this.channelId = channelId;
    this.isStandup = isStandup;
    this.playerName = playerName;
    this.isRequested = true;
    // return this;
};

/**
 * @description Creates object for connectionAck request
 * @method ConnectAckData
 * @param {String} channelId
 * @param {String} playerName 
 * @memberof DataFormats.PostTypes
 */
function connectAckData(channelId, playerId) {
    this.playerId = playerId;
    this.channelId = channelId;
};

/**
 * @description Creates object for reportIssue request
 * @method reportIssue
 * @param {String} playerId
 * @param {String} issue
 * @memberof DataFormats.PostTypes
 */
function reportIssue(playerId, issue) {
    this.playerId = playerId;
    this.issue = issue;
};

/**
 * @description 
 * @method chatData
 * @param {String} playerId
 * @param {String} playerName
 * @param {String} channelId
 * @param {String} msg
 * @memberof DataFormats.PostTypes
 */
function chatData(playerId, playerName, channelId, msg) {
    this.playerId = playerId;
    this.channelId = channelId;
    this.message = msg;
    this.playerName = playerName;
    this.isRequested = true;
    // return this;
};

/**
 * @description 
 * @method getRegisteredUsersData
 * @param {String} playerId
 * @param {String} tournamentId
 * @param {Number} gameVersionCount
 * @memberof DataFormats.PostTypes
 */
function getRegisteredUsersData(playerId, tournmanentId, gameVersionCount) {
    this.playerId = playerId;
    this.tournamentId = tournmanentId;
    this.gameVersionCount = gameVersionCount;

};

/**
 * @description Create object for getTableStructure request
 * @method getTableStructure
 * @param {String} tournamentId
 * @param {Number} gameVersionCount
 * @memberof DataFormats.PostTypes
 */
function getTableStructure(tournamentId, gameVersionCount) {
    this.tournamentId = tournamentId;
    this.gameVersionCount = gameVersionCount;
}

/**
 * @description Creates Object for getBlindAndPrize request.
 * @method blindAndPrize
 * @param {String} blindRule
 * @param {Number} gameVersionCount
 * @param {String} prizeRule
 * @memberof DataFormats.PostTypes
 */
function blindAndPrize(blindRule, gameVersionCount, prizeRule) {
    this.blindRule = blindRule;
    this.gameVersionCount = gameVersionCount;
    this.prizeRule = prizeRule;
}

/**
 * @description Creates Object for getBlindAndPrize request.
 * @description Used in case of normal tournament.
 * @method blindAndPrizeTournament
 * @param {String} tournamentId
 * @param {Number} noOfPlayers
 * @memberof DataFormats.PostTypes
 */
function blindAndPrizeTournament(tournamentId, noOfPlayers) {
    this.tournamentId = tournamentId;
    this.noOfPlayers = noOfPlayers;
}

/**
 * @description Creates Object for getBlindAndPrize request.
 * @description Used in case of satellite tournament.
 * @method blindAndPrizeSatellite
 * @param {String} tournamentId
 * @param {Number} gameVersionCount
 * @memberof DataFormats.PostTypes
 */
function blindAndPrizeSatellite(tournamentId, gameVersionCount) {
    this.tournamentId = tournamentId;
    this.gameVersionCount = gameVersionCount;
}

/**
 * @description
 * @method favTableData
 * @param {String} playerId
 * @param {String} channelId
 * @param {String} gameType
 * @memberof DataFormats.PostTypes
 */
function favTableData(playerId, channelId, gameType) {
    this.playerId = playerId;
    this.favourateTable = {
        channelId: channelId,
        type: gameType,
    };
}

/**
 * @description 
 * @method removeFavTableData
 * @param {String} playerId
 * @param {String} channelId
 * @memberof DataFormats.PostTypes
 */
function removeFavTableData(playerId, channelId) {
    this.playerId = playerId;
    this.channelId = channelId;
}

/**
 * @description Creates object for joinSimilar request
 * @method JoinSimilar
 * @param {boolean} isRealMoney
 * @param {String} gameType
 * @param {Number} smallBlind
 * @param {Number} bigBlind
 * @param {Number} maxPlayers
 * @param {Number} speed
 * @param {String} playerId
 * @memberof DataFormats.PostTypes
 */
function JoinSimilar(isRealMoney, gameType, smallBlind, bigBlind, maxPlayers, speed, playerId) {
    this.searchParams = {};
    this.searchParams.isRealMoney = isRealMoney;
    this.searchParams.channelVariation = gameType;
    this.searchParams.smallBlind = smallBlind;
    this.searchParams.bigBlind = bigBlind;
    this.searchParams.maxPlayers = maxPlayers;
    this.searchParams.turnTime = speed;
    this.playerId = playerId;
    this.isRequested = true;
}


/**
 * @description
 * @method getPrizeData
 * @param {String} playerId
 * @memberof DataFormats.PostTypes
 */
function getPrizeData(playerId) {
    this.playerId = playerId;
}

/**
 * @description Creates request object for createNotes request
 * @method createNote
 * @param {String} playerId
 * @param {String} forPlayerId
 * @param {String} notes
 * @param {String} color
 * @memberof DataFormats.PostTypes
 */
function createNote(playerId, forPlayerId, notes, color) {
    this.playerId = playerId;
    this.forPlayerId = forPlayerId;
    this.notes = notes;
    this.color = color;
}

/**
 * @description Creates request object for getNotes request
 * @method getNote
 * @param {String} playerId
 * @param {String} forPlayerId
 * @memberof DataFormats.PostTypes
 */
function getNote(playerId, forPlayerId) {
    this.playerId = playerId;
    this.forPlayerId = forPlayerId;
}
/**
 * @description Creates request object for QuickSeatSitNGo request
 * @method QuickSeatSitNGo
 * @param {boolean} isRealMoney 
 * @param {String} gameType 
 * @param {Number} buyIn 
 * @param {Number} maxPlayers 
 * @param {Number} speed 
 * @memberof DataFormats.PostTypes
 */
function QuickSeatSitNGo(isRealMoney, gameType, buyIn, maxPlayers, speed) {
    this.isRealMoney = isRealMoney;
    this.gameVariation = gameType;
    this.buyIn = buyIn;
    this.maxPlayersForTournament = maxPlayers;
    this.turnTime = speed;
}
/**
 * @description Creates request object for quickSeatTournament request 
 * @method QuickSeatTourn
 * @param {boolean} isRealMoney 
 * @param {String} gameType 
 * @param {Number} buyIn 
 * @param {Number} type 
 * @param {Number} starting 
 * @memberof DataFormats.PostTypes
 */
function QuickSeatTourn(isRealMoney, gameType, buyIn, type, starting) {
    this.isRealMoney = isRealMoney;
    this.gameVariation = gameType;
    this.buyIn = buyIn;
    this.tournamentType = type;
    this.timeSpan = starting;
}

/**
 * @description
 * @method setPlayerValData
 * @param {String} channelId
 * @param {String} playerId
 * @param {String} key
 * @param {Number} value
 * @memberof DataFormats.PostTypes
 */
function setPlayerValData(channelId, playerId, key, value) {
    this.isRequested = true;
    this.channelId = channelId;
    this.playerId = playerId;
    this.key = key;
    this.value = value;
}

/**
 * @description Creates object for saveVideo request
 * @method ReplayData
 * @param {String} channelId
 * @param {String} roundId
 * @param {Object} logData
 * @memberof DataFormats.PostTypes
 */
function ReplayData(channelId, roundId, logData) {
    this.channelId = channelId;
    this.roundId = roundId;
    this.logData = logData;
}

function FreeRollTableData(data) {
    this.raceId = data.raceId || "abcd";
    this.configId = data._id || "";
    this.channelVariation = data.variation || "";
    this.isRequested = true;
    this.playerId = data.playerId || "";
    this.channelType = data.channelType || "";
    this.tableId = data.tableId || "";
};

module.exports = {
    Login: login,
    ForgotPassword: forgotPassword,
    ResetPassword: resetPassword,
    UserID: userID,
    OTP: OTP,
    TransactionHistory: transactionHistory,
    TableFilter: tableFilter,
    JoinChannel: joinChannel,
    SitData: sitData,
    MoveData: moveData,
    LeaveData: leaveData,
    ConnectAckData: connectAckData,
    Tournament: tournament,
    reportIssue: reportIssue,
    ChatData: chatData,
    SitOutData: sitOutData,
    ResetSitout: resetSitout,
    AddChipsData: addChipsData,
    GetRegisteredUsersData: getRegisteredUsersData,
    GetTournamentLobbyInfo: getTableStructure,
    BlindAndPrize: blindAndPrize,
    FavTableData: favTableData,
    RemoveFavTableData: removeFavTableData,
    JoinSimilar: JoinSimilar,
    GetPrizeData: getPrizeData,
    CreateNote: createNote,
    GetNote: getNote,
    OpenTable: openTable,
    QuickSeatSitNGo: QuickSeatSitNGo,
    QuickSeatTourn: QuickSeatTourn,
    BlindAndPrizeTournament: blindAndPrizeTournament,
    SetPlayerValData: setPlayerValData,
    ReplayData: ReplayData,
    BlindAndPrizeSatellite:blindAndPrizeSatellite,
    FreeRoll : FreeRollTableData,
};
