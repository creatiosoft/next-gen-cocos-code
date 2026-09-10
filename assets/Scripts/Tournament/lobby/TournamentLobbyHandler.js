var TableHandler = require('TableHandler');
var TourData = require('PostTypes').Tournament;
var joinChannel = require('PostTypes').JoinChannel;
var TableInfo = require('PostTypes').GetRegisteredUsersData;
var TournamentLobbyInfo = require('PostTypes').GetTournamentLobbyInfo;
var blindAndPrizeData = require('PostTypes').BlindAndPrize;
var blindAndPrizeTourData = require('PostTypes').BlindAndPrizeTournament;
var blindAndPrizeSatelliteData = require('PostTypes').BlindAndPrizeSatellite;
/**
 * @class TournamentLobbyHandler
 * @classdesc Handles the communication with server in three tournaments
 * @extends TableHandler
 * @memberof Screens.Lobby.Table
 */
cc.Class({
    extends: TableHandler,

    onLoad: function () {
        window.TournamentLobbyHandler = this;
    },

    init: function () {
        console.log("init");
    },

    requestTournamentLobbyList: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.GetAllTournamentList, data, callback, error, null, false);
    },

    requestTableLobbyList: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.GetAllTableList, data, callback, error, null, false);
    },

    requestTournamentFreeRoll: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.GetAllTournamentList, { isFreeRoll: true }, callback, error, null, false);
    },

    requestTournamentSitAndGoStages: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.GetSitNGoStages, data, callback, error, null, false);
    },

    requestTournamentSitAndGoInStage: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.GetSitNGoTournamentsInStage, data, callback, error, null, false);
    },

    requestTournamentSitAndGoRegister: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.RegisterSNG, data, callback, error, null, false, true);
    },

    requestTournamentRegister: function (data, callback, error) {
        console.log("[TLH] requestTournamentRegister", data);
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.RegisterTournament, data, function (res) {
            console.log("[TLH] Res-Register", res);
            if (callback) callback(res);
        }, error, null, false, false);
    },

    requestTournamentDeRegister: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.DeRegisterTournament, data, callback, error, null, false, false);
    },

    requestTournamentLateRegister: function (data, callback, error) {
        console.log("[TLH] requestTournamentLateRegister", data);
        TournamentServerCom.socketIORequest(
            K.SocketIOAPI.Lobby.LateRegisterTournament,
            data,
            function (response) {
                console.log("[TLH] Res-LateRegister raw", response);
                // Server responds with { status: "success" | "Insufficient Balance" | ... }
                if (response && typeof response.status === 'string' && !('success' in response)) {
                    response.success = (response.status === 'success');
                    if (!response.info) response.info = response.status;
                }
                console.log("[TLH] Res-LateRegister normalized", response);
                if (callback) callback(response);
            },
            error,
            null, false, false
        );
    },

    requestTournamentJoinTable: function (data, callback, error) {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.TournamentJoinTable, data, callback, error);
    },

    requestTournamentEnterTable: function (data, callback, error, label = "") {
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.TournamentEnterTable, data, callback, error, null, true, true, label);
    },

    requestTournamentReEntry: function (data, callback, error) {
        console.log("[TLH] requestTournamentReEntry", data);
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.ReEntryTournament, data, function (res) {
            console.log("[TLH] Res-ReEntry", res);
            if (callback) callback(res);
        }, error, null, false, false);
    },

    requestTournamentData: function (data, callback, error) {
        console.trace('requestTournamentData');
        TournamentServerCom.socketIORequest(K.SocketIOAPI.Lobby.GetTournamentData, data, callback, error, null, false);
    },

    requestTournamentAddon: function (data, callback, error) {
        TournamentServerCom.socketIORequest('tournamentLobbyEvent|AddOn', data, function (res) {
            if (callback) callback(res);
        }, error, null, false, false);
    },

});
