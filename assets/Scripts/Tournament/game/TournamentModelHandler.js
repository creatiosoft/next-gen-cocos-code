var PopUpType = require('PopUpManager').PopUpType;
var sitOutData = require('../../DataFormats/PostTypes').SitOutData;

var SitOutMode = cc.Enum({
    SitOutNextHand: 1,
    SitOueNextBB: 2,
    None: -1,
});

function TournamentModelHandler() {

}

TournamentModelHandler.prototype.setModel = function(pokerModel) {

    pokerModel.resetGameForReshuffle = function(isReshuffle = false) {

        console.log('[Debug] TournamentModelHandler.resetGameForReshuffle');

        if (isReshuffle) {
            console.log('[Reshuffle]', 'TournamentModelHandler/resetGameForReshuffle', pokerModel.gameData);
        }


        pokerModel.gameModel.removeBroadcastCallbacks(pokerModel.gameData.channelId);
        //
        TournamentSocket.off(pokerModel.gameData.channelId);
        TournamentSocket.off(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId);
        // TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentUpdated);
        cc.systemEvent.off(K.SocketIOEvent.Lobby.TournamentRefresh);
    };

    pokerModel.clear = function() {
        TournamentSocket.off(pokerModel.gameData.channelId);
        TournamentSocket.off(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId);
        // TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentUpdated);
        TournamentSocket.off("Tournament:ITM");
        var _h = pokerModel._socketHandlers || {};
        if (_h.tournamentWinner) TournamentSocket.off("tournamentWinner", _h.tournamentWinner);
        if (_h.eliminated) TournamentSocket.off("eliminated", _h.eliminated);
        if (_h.finalLeaderboard) TournamentSocket.off("FinalLeaderboard", _h.finalLeaderboard);
        if (_h.tableBreakStarted) TournamentSocket.off("Tournament:TableBreakStarted", _h.tableBreakStarted);
        if (_h.breakAfterThisHand) TournamentSocket.off("Tournament:BreakAfterThisHand", _h.breakAfterThisHand);
        if (_h.tournamentCancelledInGame) TournamentSocket.off("tournamentCancelled", _h.tournamentCancelledInGame);
        if (_h.rebuyOffer) TournamentSocket.off("rebuyOffer", _h.rebuyOffer);
        if (_h.rebuyStarted) TournamentSocket.off("rebuyStarted", _h.rebuyStarted);
        if (_h.rebuyWindowEnded) TournamentSocket.off("rebuyWindowEnded", _h.rebuyWindowEnded);
        if (_h.playerRebuy) TournamentSocket.off("playerRebuy", _h.playerRebuy);
        if (_h.addOnOffer) TournamentSocket.off("addOnOffer", _h.addOnOffer);
        if (_h.tournamentAddOnUpcoming) TournamentSocket.off("tournamentAddOnUpcoming", _h.tournamentAddOnUpcoming);
        if (_h.playerAddon) TournamentSocket.off("playerAddon", _h.playerAddon);
        // if (_h.tournamentAddOn) TournamentSocket.off("tournamentAddOn", _h.tournamentAddOn);

        cc.systemEvent.off(K.SocketIOEvent.Lobby.TournamentRefresh);
        cc.systemEvent.off(pokerModel.gameData.channelId);
        cc.systemEvent.off(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId);
    }

    pokerModel.onDestroy = function() {
        pokerModel.kickPlayerOutOfTheGame(pokerModel);
        cc.director.getActionManager().removeAllActions();
        pokerModel.gameModel.removeBroadcastCallbacks(pokerModel.gameData.channelId);
        //
        TournamentSocket.off(pokerModel.gameData.channelId);
        TournamentSocket.off(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId);
        // TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentUpdated);
        TournamentSocket.off("Tournament:ITM");
        var _h = pokerModel._socketHandlers || {};
        if (_h.tournamentWinner) TournamentSocket.off("tournamentWinner", _h.tournamentWinner);
        if (_h.eliminated) TournamentSocket.off("eliminated", _h.eliminated);
        if (_h.finalLeaderboard) TournamentSocket.off("FinalLeaderboard", _h.finalLeaderboard);
        if (_h.tableBreakStarted) TournamentSocket.off("Tournament:TableBreakStarted", _h.tableBreakStarted);
        if (_h.breakAfterThisHand) TournamentSocket.off("Tournament:BreakAfterThisHand", _h.breakAfterThisHand);
        if (_h.tournamentCancelledInGame) TournamentSocket.off("tournamentCancelled", _h.tournamentCancelledInGame);
        if (_h.rebuyOffer) TournamentSocket.off("rebuyOffer", _h.rebuyOffer);
        if (_h.rebuyStarted) TournamentSocket.off("rebuyStarted", _h.rebuyStarted);
        if (_h.rebuyWindowEnded) TournamentSocket.off("rebuyWindowEnded", _h.rebuyWindowEnded);
        if (_h.playerRebuy) TournamentSocket.off("playerRebuy", _h.playerRebuy);
        if (_h.addOnOffer) TournamentSocket.off("addOnOffer", _h.addOnOffer);
        if (_h.tournamentAddOnUpcoming) TournamentSocket.off("tournamentAddOnUpcoming", _h.tournamentAddOnUpcoming);
        // if (_h.tournamentAddOn) TournamentSocket.off("tournamentAddOn", _h.tournamentAddOn);
        if (_h.playerAddon) TournamentSocket.off("playerAddon", _h.playerAddon);
        cc.systemEvent.off(K.SocketIOEvent.Lobby.TournamentRefresh);
        cc.systemEvent.off(pokerModel.gameData.channelId);
        cc.systemEvent.off(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId);
        // TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentRefresh);
    };

    pokerModel.sitOutNextHand = function(callback) {
        TournamentServerCom.socketIORequest(
            K.SocketIOAPI.Game.TournamentSitOut, {
                channelId: pokerModel.gameData.channelId,
                playerId: pokerModel.gameData.playerId,
                isRequested: true,
            },
            (response) => {
                if (response.success) {
                    pokerModel.sitOutValue = SitOutMode.SitOutNextHand;
                }
                if (callback !== null && callback !== undefined) {
                    callback(response);
                }
            },
            null,
            5000,
            false
        );
    };

    pokerModel.resetSitout = function(callback) {
        TournamentServerCom.socketIORequest(
            K.SocketIOAPI.Game.TournamentResetSitout, {
                channelId: pokerModel.gameData.channelId,
                playerId: pokerModel.gameData.playerId,
                isRequested: true,
            },
            (response) => {
                if (response.success) {
                    pokerModel.sitOutValue = SitOutMode.None;
                }
                if (callback !== null && callback !== undefined) {
                    callback(response);
                }
            },
            null,
            5000,
            false
        );
    };

    var _applyMakeMove = function() {
        pokerModel.makeMove = function(amount, action) {
            console.log("[TournamentModelHandler] makeMove:", action, amount);
            TournamentServerCom.socketIORequest(
                "common|room.channelHandler.makeMove", {
                    channelId: pokerModel.gameData.channelId,
                    playerId: pokerModel.gameData.playerId,
                    playerName: pokerModel.gameData.playerName,
                    amount: amount,
                    action: action,
                    isRequested: true,
                    access_token: K.Token.access_token,
                },
                null, null, 5000, false
            );
        };
    };

    var _origInitiliazePoker = pokerModel.initiliazePoker.bind(pokerModel);
    pokerModel.initiliazePoker = function(data) {
        console.log('[Debug] TournamentModelHandler.initiliazePoker');
        _origInitiliazePoker(data);
        _applyMakeMove();
    };
    _applyMakeMove();

    pokerModel.getHandTab = function() {
        pokerModel.handTabs = [];
        TournamentServerCom.socketIORequest(
            "common|room.channelHandler.getHandTab", {
                channelId: pokerModel.gameData.channelId,
                access_token: K.Token.access_token,
            },
            function(response) {
                if (response.success) {
                    response.handHistory.forEach(function(element) {
                        pokerModel.handTabs.push(element);
                    });
                    pokerModel.emit(K.PokerEvents.onHandTab, pokerModel);
                }
            },
            null, 5000, false
        );
    };

    pokerModel.getHandHistory = function(handHistoryId, callback) {
        TournamentServerCom.socketIORequest(
            "common|room.channelHandler.getHandHistory", {
                channelId: pokerModel.gameData.channelId,
                access_token: K.Token.access_token,
            },
            function(response) {
                if (response.success) {
                    var newData = {
                        heading: "Hand History",
                        info: response.handHistory.historyLog,
                    };
                    pokerModel.popUpManager.show(PopUpType.HandHistoryPopup, newData, function() {});
                    if (!!callback) {
                        callback(newData);
                    }
                }
            },
            null, 5000, false
        );
    };

    pokerModel.fireMuckHandEvent = function(cb) {
        var input = {};
        input.channelId = pokerModel.gameData.channelId;
        input.data = {
            seatIdx: pokerModel.getMyPlayer().seatIndex,
            playerId: pokerModel.gameData.playerId,
            channelType: "TOURNAMENT",
            isRequested: true

        };
        input.route = "fireEvent";

        TournamentServerCom.socketIORequest(
            "common|room.channelHandler.channelBroadcast",
            input,
            function(response) {
                if (response && response.success && cb) {
                    cb();
                }
            },
            null,
            5000,
            false
        );
    };

    pokerModel.resume = function(callback) {
        TournamentServerCom.socketIORequest(
            'common|room.channelHandler.resume', {
                channelId: pokerModel.gameData.channelId,
                playerId: pokerModel.gameData.playerId,
                isRequested: true
            },
            (response) => {
                if (response.success) {
                    pokerModel.sitOutValue = 3;
                    var playerData = pokerModel.gameData.tableDetails.players[pokerModel.getPlayerById(pokerModel.gameData.playerId)];
                    // playerData.state = response.state;
                    // if (playerData.isTournamentSitout) {
                    playerData.isTournamentSitout = false;
                    playerData.state = K.PlayerState.Playing;
                    // }
                    // process response
                    if (callback !== null && callback !== undefined) {
                        callback();
                    }
                }
            },
            null,
            5000,
            false
        );
    };

    pokerModel.onTournamentRefresh = function(data) {
        console.log("%c[pokerModel.onTournamentRefresh] %s %o", 'color: blue;', data);
        if (!pokerModel.gameData) {
            return;
        }
        if (data._id == pokerModel.gameData.tournamentId && data.state == "CLOSED") {
            console.log("[DBG] onTournamentRefresh | state=CLOSED detected, emitting TournamentClosed | time:", Date.now());
            // pokerModel.onTournamentRefresh(data.data);
            pokerModel.emit(K.SocketIOEvent.Game.TournamentClosed, data);
        }

        if (data.lastTableId &&
            data.lastTableId != "" &&
            pokerModel.gameData.channelId == data.lastTableId) {
            pokerModel.gameData.tourData.lastTableId = data.lastTableId;
        }

        if (data._id == pokerModel.gameData.tournamentId) {
            pokerModel.gameData.tourData.currentBlindLevel = data.currentBlindLevel;
            pokerModel.gameData.tableDetails.currentBlindLevel = data.currentBlindLevel;
        }
    };

    pokerModel.onTournamentTableBroadcast = function(data) {
        console.log("%c[pokerModel.onTournamentTableBroadcast] %s %o", 'color: blue;', data.eventName, data);
        if (data.eventName == K.BroadcastRoute.dealerrChat) {
            pokerModel.onDealerChat(data.data);
        } else if (data.eventName == K.BroadcastRoute.blindDeduction) {
            pokerModel.onBlindDeducted(data.data);
        } else if (data.eventName == K.BroadcastRoute.gamePlayers) {
            pokerModel.onGamePlayers(data.data);
        } else if (data.eventName == K.LobbyBroadcastRoute.tableView) {
            if (data.data && data.data.players && pokerPresenter._postBreakResync) {
                pokerPresenter._postBreakResync = false;
                pokerModel.onGamePlayers(data.data);
            }
        } else if (data.eventName == K.BroadcastRoute.startGame) {
            pokerModel.onGameStart(data.data);
        } else if (data.eventName == K.BroadcastRoute.turn) {
            pokerModel.onMoveMade(data.data);
        } else if (data.eventName == K.BroadcastRoute.roundOver) {
            pokerModel.onRoundOver(data.data);
        } else if (data.eventName == K.BroadcastRoute.gameOver) {
            pokerModel.onGameOver(data.data);
        } else if (data.eventName == K.BroadcastRoute.playerState) {
            pokerModel.onPlayerStateChange(data.data);
        } else if (data.eventName == K.BroadcastRoute.breakTime) {
            pokerModel.onBreakTime(data.data);
        } else if (data.eventName == "Tournament:TableBreakStarted" || data.eventName == "TournamentsBreakStarts") {
            var _bd = data.data || {};
            pokerPresenter.onBreakTime(Object.assign({
                isInBreak: true
            }, _bd));
        } else if (data.eventName == "TournamentsBreakEnds") {
            pokerPresenter.onBreakTime({
                isInBreak: false
            });
        } else if (data.eventName == "Tournament:BreakAfterThisHand") {
            pokerModel.onBreakAfterThisHand(data.data);
        } else if (data.eventName == K.BroadcastRoute.sit) {
            pokerModel.onSit(data.data);
        } else if (data.eventName == K.BroadcastRoute.onTimeBank) {
            pokerModel.onTimeBank(data.data);
        } else if (data.eventName == K.BroadcastRoute.handTab) {
            pokerModel.onHandTab(data.data);
        } else if (data.eventName == "emoji") {
            pokerModel.onSendSticker(data.data);
        } else if (data.eventName == "message") {
            pokerModel.onChat(data.data);
        } else if (data.eventName == K.BroadcastRoute.chat) {
            pokerModel.onChat(data.data);
        } else if (data.eventName == "startDisconnectTime") {
            pokerModel.onDisconnectTime(data.data);
        } else if (data.eventName == "tableDestroyed") {
            console.log("[DBG] raw tableDestroyed event received | time:", Date.now(), "| data:", JSON.stringify(data.data));
            pokerModel.onTableDestroyed(data.data);
        } else if (data.eventName == "revealCards") {
            pokerModel.onRevealCards(data.data);
        } else if (data.eventName == K.BroadcastRoute.playerCards) {
            pokerModel.onPlayerCards(data.data);
        } else if (data.eventName == "fireEvent") {
            pokerModel.onFireEvent(data.data);
        } else if (data.eventName == "addonBreakTime") {
            pokerModel.onAddonBreakTime(data.data);
        } else if (data.eventName == "addonBreakTimeOver") {
            pokerModel.onAddonBreakTimeOver(data.data);
        } else if (data.eventName == "refundChips") {
            pokerModel.onRefundChips(data.data);
        } else if (data.eventName == "returnUncalledBet") {
            pokerModel.onReturnUncalledBet(data.data);
        } else if (data.eventName == "leave") {
            var player = null;
            console.log("[DBG][leave] received on model for channelId:", this.gameData.channelId, "| envelope.channelId:", data.channelId, "| leavingPlayerId:", data.data && data.data.playerId, "| myPlayerId:", GameManager.user.playerId, "| this.gameData.tableDetails.players:", this.gameData.tableDetails.players);
            var index = this.getPlayerById(data.data.playerId);
            if (index !== -1) {
                console.log("leave found");
                player = this.gameData.tableDetails.players.splice(index, 1);
                pokerModel.emit(K.PokerEvents.OnLeave, player);
            } else {
                console.log("leave not found");
                if (data.data.playerId == GameManager.user.playerId) {
                    if (GameManager.popUpManager.isPopupActive(PopUpType.TournamentWinner)) {
                        return;
                    }
                    // observer received leave
                    console.warn("[DBG][leave] calling leaveClosedTable() on model for channelId:", this.gameData.channelId, "— this DESTROYS this table's page/model. envelope.channelId was:", data.channelId);
                    if (pokerModel.switchObserverTable) {
                        // pokerModel.leaveClosedTable();
                    } else {
                        pokerModel.leaveClosedTable();
                    }
                    console.log("leave not found self");
                } else {
                    console.log("leave not found others");
                }
            }
        }
    };


    // {
    //     "eventTo": "b1aa1d94-9f23-48bc-a7d9-7b9a746b1b5c:69220e63-e9bd-49d1-8b32-a3a8d98324fe",
    //     "eventName": "rebuyActivated",
    //     "playerId": "69220e63-e9bd-49d1-8b32-a3a8d98324fe",
    //     "channelId": "b1aa1d94-9f23-48bc-a7d9-7b9a746b1b5c",
    //     "data": {
    //         "tableId": "b1aa1d94-9f23-48bc-a7d9-7b9a746b1b5c",
    //         "playerId": "69220e63-e9bd-49d1-8b32-a3a8d98324fe",
    //         "tournamentId": "6646bbb6320775728a661255",
    //         "expiry": "2024-05-17T02:11:36.885Z"
    //     }
    // }
    pokerModel.onTournamentTableUserBroadcast = function(data) {
        console.log("%c[pokerModel.onTournamentTableUserBroadcast] %s %o", 'color: blue;', data.eventName, data);
        if (data.eventName == K.BroadcastRoute.connectionAck) {
            pokerModel.onConnectionAck(data.data);
        } else if (data.eventName == K.BroadcastRoute.playerCards) {
            pokerModel.onPlayerCards(data.data);
        } else if (data.eventName == K.BroadcastRoute.preCheck) {
            pokerModel.onPreCheck(data.data);
        } else if (data.eventName == K.BroadcastRoute.eliminated) {
            pokerModel.onEliminated(data.data);
        } else if (data.eventName == K.BroadcastRoute.tournamentWinner) {
            pokerModel.onTournamentWinner(data.data);
        } else if (data.eventName == K.BroadcastRoute.bestHands) {
            pokerModel.onBestHands(data.data);
        } else if (data.eventName == 'rebuyOffer') {
            console.warn("[Rebuy] rebuyOffer via commonEventResponse — unexpected path, handled by named TournamentSocket listener");
        } else if (data.eventName == 'rebuyActivated') {
            console.log("[Rebuy] rebuyActivated | suppressed — handled by rebuyOffer");
        } else if (data.eventName == 'rebuyDeactivated') {
            pokerModel.onRebuyDeactivated(data.data);
        } else if (data.eventName == 'Res-Rebuy') {
            pokerModel.onResRebuy(data);
        } else if (data.eventName == 'Res-AddOn') {
            pokerModel.onResAddon(data.data);
        } else if (data.eventName == 'inactiveKicked') {
            pokerModel.onInactiveKicked(data.data);
        } else if (data.eventName == 'tournamentCancelled') {
            pokerModel.onTournamentCancelled(data.data);
        } else if (data.eventName == K.BroadcastRoute.turn) {
            pokerModel.onMoveMade(data.data);
        }

    };

    pokerModel.onEliminatedBroadcast = function(data) {
        pokerModel.onEliminated(data.data);
    };

    pokerModel.onInitializePoker = function(isRejoin = false) {

        console.log('[Debug] TournamentModelHandler.onInitializePoker', isRejoin);

        if (!pokerModel._boundBroadcast) {
            pokerModel._boundBroadcast = this.onTournamentTableBroadcast.bind(this);
        }
        if (!pokerModel._boundUserBroadcast) {
            pokerModel._boundUserBroadcast = this.onTournamentTableUserBroadcast.bind(this);
        }

        if (!pokerModel._onTournamentUpdated) {
            pokerModel._onTournamentUpdated = this.onTournamentUpdated.bind(this);
        }


        cc.systemEvent.off(pokerModel.gameData.channelId, pokerModel._boundBroadcast, this.node);
        cc.systemEvent.off(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId, pokerModel._boundUserBroadcast, this.node);

        cc.systemEvent.on(pokerModel.gameData.channelId, pokerModel._boundBroadcast, this.node);
        cc.systemEvent.on(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId, pokerModel._boundUserBroadcast, this.node);

        // if (isRejoin) {
        //     return;
        // }

        // console.log("%conInitializePoker %o", 'color: green;', pokerModel.gameData);
        // cc.systemEvent.on(pokerModel.gameData.channelId, this.onTournamentTableBroadcast.bind(this), this.node);
        // cc.systemEvent.on(pokerModel.gameData.channelId + ":" + pokerModel.gameData.playerId, this.onTournamentTableUserBroadcast.bind(this), this.node);
        // TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentRefresh, this.onTournamentRefresh.bind(this));

        // TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentUpdated, this.onTournamentUpdated.bind(this));

        GameManager.off("Tournament:Update", pokerModel._onTournamentUpdated);
        GameManager.on("Tournament:Update", pokerModel._onTournamentUpdated);

        TournamentServerCom.socketIOBroadcast("Tournament:ITM", function(data) {
            console.log("[TournamentModelHandler] Tournament:ITM", data);
            pokerModel.emit("Tournament:ITM", data);
        });
        if (isRejoin) {
            return;
        }

        cc.systemEvent.on(K.SocketIOEvent.Lobby.TournamentRefresh, this.onTournamentRefresh.bind(this), this.node);
        var _myTournamentId = pokerModel.gameData.tournamentId;
        pokerModel._socketHandlers = {};

        pokerModel._socketHandlers.tournamentWinner = function(data) {
            if (data && data.tournamentId && data.tournamentId !== _myTournamentId) return;
            pokerModel.onTournamentWinner(data);
        };
        TournamentSocket.on("tournamentWinner", pokerModel._socketHandlers.tournamentWinner);

        pokerModel._socketHandlers.eliminated = function(data) {
            //  console.log("[DBG][eliminated] raw data:", JSON.stringify(data), "| myPlayerId:", pokerModel.gameData.playerId, "| myChannelId:", pokerModel.gameData.channelId, "| myTournamentId:", _myTournamentId);
            if (data && data.tournamentId && data.tournamentId !== _myTournamentId) return;
            console.log("[pokerModel.onEliminated] data:", data);

            GameManager.popUpManager.remove(PopUpType.RebuyAddOnToast, null, pokerModel.presenter.tablePopupHolder);
            GameManager.popUpManager.remove(PopUpType.RebuyAddOnCountdown, null, pokerModel.presenter.breakAndAddonHolder);
            GameManager.popUpManager.remove(PopUpType.AddOnPopup, null, pokerModel.presenter.tablePopupHolder);
            pokerModel.onEliminated(data);
        };
        TournamentSocket.on("eliminated", pokerModel._socketHandlers.eliminated);

        pokerModel._socketHandlers.finalLeaderboard = function(data) {
            console.log("[DBG] raw FinalLeaderboard socket event received | time:", Date.now(), "| data.tournamentId:", data && data.tournamentId, "| _myTournamentId:", _myTournamentId, "| has leaderboard:", !!(data && data.leaderboard), "| leaderboard.length:", data && data.leaderboard && data.leaderboard.length);
            if (data && data.leaderboard && (!data.tournamentId || data.tournamentId === _myTournamentId)) {
                pokerModel.onFinalLeaderboard(data);
            } else {
                console.log("[DBG] raw FinalLeaderboard | condition failed, NOT calling onFinalLeaderboard");
            }
        };
        TournamentSocket.on("FinalLeaderboard", pokerModel._socketHandlers.finalLeaderboard);

        pokerModel._socketHandlers.tableBreakStarted = function(socketData) {
            console.log("[TournamentModelHandler] Tournament:TableBreakStarted", socketData);
            var inner = (socketData && socketData.data) ? socketData.data : socketData;
            if (inner && inner.tableId && inner.tableId !== pokerModel.gameData.channelId) return;
            pokerModel.onTournamentsBreakStarts(inner);
        };
        TournamentSocket.on("Tournament:TableBreakStarted", pokerModel._socketHandlers.tableBreakStarted);

        pokerModel._socketHandlers.breakAfterThisHand = function(socketData) {
            console.log("[TournamentModelHandler] Tournament:BreakAfterThisHand", socketData);
            var inner = (socketData && socketData.data) ? socketData.data : socketData;
            if (inner && inner.tableId && inner.tableId !== pokerModel.gameData.channelId) return;
            pokerModel.onBreakAfterThisHand(inner);
        };
        TournamentSocket.on("Tournament:BreakAfterThisHand", pokerModel._socketHandlers.breakAfterThisHand);

        pokerModel._socketHandlers.tournamentBreak = function(socketData) {
            console.log("[TournamentModelHandler] Tournament:Break", socketData);
            if (socketData.eventType == 'TournamentsBreakEnds') {
                GameManager.popUpManager.remove(PopUpType.TournamentBreakTime, null, pokerModel.presenter.breakAndAddonHolder);
                pokerModel.presenter.model.gameData.tourData.isInBreak = false;
                pokerModel.presenter.model.gameData.break = false;

                // if (pokerModel.presenter.tournamentTableInfo) {
                //     var _tti = pokerModel.presenter.tournamentTableInfo.getComponent("TournamentTableInfo");
                //     if (_tti && _tti.refresh) _tti.tournamentsBreakEnds();
                // }
            }
            // var inner = (socketData && socketData.data) ? socketData.data : socketData;
            // if (inner && inner.tableId && inner.tableId !== pokerModel.gameData.channelId) return;
        };
        TournamentSocket.on("Tournament:Break", pokerModel._socketHandlers.tournamentBreak);

        pokerModel._socketHandlers.tournamentCancelledInGame = function(socketData) {
            console.log("[TournamentModelHandler] tournamentCancelled in-game", socketData);
            if (socketData && socketData.tournamentId && socketData.tournamentId !== _myTournamentId) return;
            pokerModel.emit('TournamentCancelledInGame', socketData);
        };
        TournamentSocket.on("tournamentCancelled", pokerModel._socketHandlers.tournamentCancelledInGame);

        pokerModel._socketHandlers.rebuyOffer = function(data) {
            console.log("[Rebuy] rebuyOffer HANDLER | tableId:", data && data.tableId, "| channelId:", pokerModel.gameData.channelId, "| data.tournamentId:", data && data.tournamentId);
            if (data && data.tableId && data.tableId !== pokerModel.gameData.channelId) return;
            if (data && data.playerId && data.playerId !== pokerModel.gameData.playerId) return;
            var _pp = pokerModel.presenter;
            if (_pp) {
                // server's live rebuyOffer push may omit tournamentId — fall back to gameData so Confirm/Cancel resolve it
                if (data && !data.tournamentId) {
                    data.tournamentId = pokerModel.gameData.tournamentId;
                }
                GameManager.popUpManager.showIn(PopUpType.ReBuyPoup, { 
                    "tourData": data,
                    "pokerPresenter": _pp
                }, null, pokerModel.presenter.tablePopupHolder);
            } else {
                console.warn("[Rebuy] rebuyOffer | mttRebuyPopup not wired — popup will not show");
            }
        };
        TournamentSocket.on("rebuyOffer", pokerModel._socketHandlers.rebuyOffer);

        pokerModel._socketHandlers.rebuyStarted = function(data) {
            if (data && data.tableId && data.tableId !== pokerModel.gameData.channelId) return;
            console.log("[Rebuy] rebuyStarted (named event) | playerId:", data && data.playerId, "| type:", data && data.type);
            var _pp = pokerModel.presenter;
            var _rsIdx = pokerModel.getPlayerById(data.playerId);
            console.log("[Rebuy] rebuyStarted | playerIdx:", _rsIdx);
            if (_rsIdx !== -1 && _pp) {
                var _rsSeat = _pp.getPlayerByIdx(_rsIdx);
                console.log("[Rebuy] rebuyStarted | seat found:", !!_rsSeat, "| showRebuyIndicator:", !!(_rsSeat && _rsSeat.showRebuyIndicator));
                if (_rsSeat && _rsSeat.showRebuyIndicator) _rsSeat.showRebuyIndicator();
            }
        };
        TournamentSocket.on("rebuyStarted", pokerModel._socketHandlers.rebuyStarted);

        pokerModel._socketHandlers.rebuyWindowEnded = function(data) {
            if (data && data.tableId && data.tableId !== pokerModel.gameData.channelId) return;
            console.log("[Rebuy] rebuyWindowEnded (named event) | data:", data);
            var _pp = pokerModel.presenter;
            // close only MY OWN popup — this event is broadcast table-wide, not just to the busted player
            if (_pp && data.playerId == GameManager.user.playerId) {
                GameManager.popUpManager.remove(PopUpType.ReBuyPoup, null, pokerModel.presenter.tablePopupHolder);
            }
            // hide the seat indicator regardless of whose seat it is — every client watching this table needs this
            var _rwIdx = pokerModel.getPlayerById(data.playerId);
            if (_rwIdx !== -1 && _pp) {
                var _rwSeat = _pp.getPlayerByIdx(_rwIdx);
                console.log("[Rebuy] rebuyWindowEnded | hiding indicator on seat:", _rwIdx);
                if (_rwSeat && _rwSeat.hideRebuyIndicator) _rwSeat.hideRebuyIndicator();
            }
        };
        TournamentSocket.on("rebuyWindowEnded", pokerModel._socketHandlers.rebuyWindowEnded);

        pokerModel._socketHandlers.playerRebuy = function(data) {
            if (data && data.tableId && data.tableId !== pokerModel.gameData.channelId) return;
            console.log("[Rebuy] playerRebuy (named event) | playerId:", data && data.playerId, "| playerName:", data && data.playerName, "| chips:", data && data.chips, "| rebuyCount:", data && data.rebuyCount);
            var _pp = pokerModel.presenter;
            var _prIdx = pokerModel.getPlayerById(data.playerId);
            console.log("[Rebuy] playerRebuy | playerIdx:", _prIdx);
            if (_prIdx !== -1 && _pp) {
                var _prSeat = _pp.getPlayerByIdx(_prIdx);
                if (_prSeat) {
                    if (_prSeat.hideRebuyIndicator) _prSeat.hideRebuyIndicator();
                    if (data.chips != null) {
                        _prSeat.playerData.chips = data.chips;
                        if (_prSeat.amountLabel) _prSeat.amountLabel.string = Number(data.chips.toFixed(2));
                        console.log("[Rebuy] playerRebuy | updated chips to:", data.chips);
                    }
                }
            }
        };
        TournamentSocket.on("playerRebuy", pokerModel._socketHandlers.playerRebuy);

        pokerModel._socketHandlers.addOnOffer = function(data) {
            console.log("pokerModel._socketHandlers.addOnOffer", data);
            if (data && data.tableId && data.tableId !== pokerModel.gameData.channelId) return;
            GameManager.popUpManager.remove(PopUpType.RebuyAddOnToast, null, pokerModel.presenter.tablePopupHolder);

            if (pokerModel.presenter.isObserver()) {

            } else {
                GameManager.popUpManager.showIn(PopUpType.AddOnPopup, data, null, pokerModel.presenter.tablePopupHolder);
            }

            pokerModel.presenter.clearTable();
            pokerModel.presenter.hideMoves();
            for (var index = 0; index < pokerModel.presenter.playerHand.length; index++) {
                pokerModel.presenter.playerHand[index].resetSeat();
            }
            pokerModel.presenter.resetGame();
            let popup = GameManager.popUpManager.showIn(PopUpType.RebuyAddOnCountdown, {
                'timeRemaining': data.timeRemaining * 1000,
                'isObserver': pokerModel.presenter.isObserver(),
                'pokerPresenter': pokerModel.presenter.node
            }, null, pokerModel.presenter.breakAndAddonHolder);
        };
        TournamentSocket.on("addOnOffer", pokerModel._socketHandlers.addOnOffer);

        pokerModel._socketHandlers.tournamentAddOnUpcoming = function(data) {
            // {
            //     "tournamentId": "6a8479c2e9d37aaf441fde0c",
            //     "tableId": "6a8479e21ce2848ff014a968",
            //     "message": "Add-on available after this hand",
            //     "addonBreakEndTime": 1787066985204,
            //     "addOnAmount": 0,
            //     "addOnHouseFee": 0,
            //     "addOnChips": 1000,
            //     "addOnMultiplier": 5,
            //     "addOnPaymentType": "multiplier",
            //     "activeVsEntries": "2/2",
            //     "avgStack": 1000,
            //     "currentBlindLevel": 2,
            //     "lateRegLevel": 0,
            //     "totalAddons": 0
            // }
            console.log("pokerModel._socketHandlers.tournamentAddOnUpcoming", data);
            if (data && data.tableId && data.tableId !== pokerModel.gameData.channelId) return;
            GameManager.popUpManager.showIn(PopUpType.RebuyAddOnToast, null, null, pokerModel.presenter.tablePopupHolder);
        };
        TournamentSocket.on("Tournament:AddOnUpcoming", pokerModel._socketHandlers.tournamentAddOnUpcoming);

        pokerModel._socketHandlers.playerAddon = function(data) {
            console.log("pokerModel._socketHandlers.playerAddon", data);
            // {
            //     "playerId": "59648602",
            //     "playerName": "su2",
            //     "chips": 2050,
            //     "channelId": "6a8720bf6e55960747b5a021"
            // }

            if (data.playerId == GameManager.user.playerId) {
                if (GameManager.popUpManager.isPopupActive(PopUpType.RebuyAddOnCountdown, pokerModel.presenter.breakAndAddonHolder)) {
                    GameManager.popUpManager.getPopupNode(PopUpType.RebuyAddOnCountdown, pokerModel.presenter.breakAndAddonHolder).getComponent("RebuyAddOnCountdown").rebuyAddOnButtonNode.active = false;
                }
            }

            var _pp = pokerModel.presenter;
            var _prIdx = pokerModel.getPlayerById(data.playerId);
            if (_prIdx !== -1 && _pp) {
                var _prSeat = _pp.getPlayerByIdx(_prIdx);
                if (_prSeat) {
                    if (data.chips != null) {
                        _prSeat.playerData.chips = data.chips;
                        if (_prSeat.amountLabel) _prSeat.amountLabel.string = Number(data.chips.toFixed(2));
                    }
                }
            }
        };
        TournamentSocket.on("playerAddon", pokerModel._socketHandlers.playerAddon);
    };

    pokerModel.onTournamentsBreakStarts = function(data) {
        pokerModel.emit('TournamentsBreakStarts', data);
    };

    pokerModel.onTableDestroyed = function(data) {
        pokerModel.emit(K.SocketIOEvent.Game.TableDestroyed, data);
    };

    pokerModel.onDisconnectTime = function(data) {
        // console.log("pokerModel.onDisconnectTime");
        pokerModel.emit(K.SocketIOEvent.Game.DisconnectTime, data);
    };

    pokerModel.onEliminated = function(data) {
        console.log("pokerModel.onEliminated");
        pokerModel.emit(K.SocketIOEvent.Game.Eliminated, data);
    };

    pokerModel.onInactiveKicked = function(data) {
        console.log("[pokerModel.onInactiveKicked]", data);
        pokerModel.emit('inactiveKicked', data);
    };

    pokerModel.onFinalLeaderboard = function(data) {
        console.log("[pokerModel.onFinalLeaderboard]", data);
        pokerModel.emit("FinalLeaderboard", data);
    };

    pokerModel.onTournamentWinner = function(data) {
        console.log("[pokerModel.onTournamentWinner] data:", data);
        pokerModel.emit(K.SocketIOEvent.Game.TournamentWinner, data);
        console.log("[pokerModel.onTournamentWinner] emit done");
    };

    pokerModel.onBreakTime = function(data) {
        // console.log("pokerModel.onBreakTime");
        pokerModel.emit(K.SocketIOEvent.Game.BreakTime, data);
    };

    pokerModel.onBreakAfterThisHand = function(data) {
        pokerModel.emit("BreakAfterThisHand", data);
    };

    pokerModel.onAddonBreakTime = function(data) {
        pokerModel.emit("addonBreakTime", data);
    };

    pokerModel.onAddonBreakTimeOver = function(data) {
        pokerModel.emit("addonBreakTimeOver", data);
    };

    pokerModel.onTournamentUpdated = function(data) {
        // console.log("pokerModel.onTournamentUpdated");
        pokerModel.emit(K.SocketIOEvent.Game.TournamentUpdated, data);
    };

    pokerModel.leave = function(kick) {
        GameManager.playerRequestedToLeaveTable[pokerModel.gameData.tournamentId] = true
        pokerModel.alreadyKickingOut = true;
        if (kick) {
            pokerModel.kickPlayerOutOfTheGame(pokerModel);
        }
    };
}

TournamentModelHandler.prototype.setPresenter = function(pokerPresenter) {

    pokerPresenter.onTournamentUpdated = function(data) {
        if (data.eventName == "TournamentBlindUpdate") {
            if (data.tournamentId == pokerPresenter.model.gameData.tournamentId) {
                if (pokerPresenter.node.getChildByName("winnerBannerBg2")) {
                    let tmp = pokerPresenter.node.getChildByName("winnerBannerBg2");
                    tmp.active = true;
                    tmp.getChildByName("winningText").getComponent(cc.Label).string = "New Blind Level - " + data.data.smallBlind + "/" + data.data.bigBlind;

                    setTimeout(() => {
                        if (cc.isValid(tmp)) {
                            tmp.active = false;
                        }
                    }, 1300);
                    // cc.director.getScheduler().schedule((dt) => { tmp.active = false; }, pokerPresenter, 1.3);
                }
                pokerPresenter.model.gameData.tourData.currentBlindLevel = data.data;
                if (pokerPresenter.model.gameData.tableDetails) {
                    pokerPresenter.model.gameData.tableDetails.currentBlindLevel = data.data;
                    pokerPresenter.model.gameData.tableDetails.nextBlindLevelAt = data.data.nextBlindLevelAt ??
                        (data.data.nextBlindLevelTime > 0 ? data.data.nextBlindLevelTime * 1000 : null);
                    pokerPresenter.model.gameData.tableDetails.nextBlindLevelInSec = data.data.nextBlindLevelInSec ??
                        (data.data.minutes > 0 ? data.data.minutes * 60 : null);

                    // Server doesn't send nextBlindLevel in TournamentBlindUpdate — compute from blindRuleArr using level
                    if ('nextBlindLevel' in data.data) {
                        pokerPresenter.model.gameData.tableDetails.nextBlindLevel = data.data.nextBlindLevel;
                    } else {
                        var _tourRaw = pokerPresenter.model.gameData.tourData;
                        var _rules = (_tourRaw.blindRule && _tourRaw.blindRule.blindRuleArr) || [];
                        var _curLvl = data.data.level ?? data.data.levelIndex;
                        var _foundInRules = false;
                        for (var _ri = 0; _ri < _rules.length; _ri++) {
                            var _rl = _rules[_ri].level ?? _rules[_ri].levelIndex;
                            if (String(_rl) === String(_curLvl)) {
                                pokerPresenter.model.gameData.tableDetails.nextBlindLevel = _rules[_ri + 1] || null;
                                _foundInRules = true;
                                break;
                            }
                        }
                        if (!_foundInRules) {
                            delete pokerPresenter.model.gameData.tableDetails['nextBlindLevel'];
                        }
                    }
                }
                if (pokerPresenter.tournamentTableInfo) {
                    var _tti = pokerPresenter.tournamentTableInfo.getComponent("TournamentTableInfo");
                    if (_tti && _tti.refresh) _tti.refresh();
                }
                pokerPresenter.updateBlind();
            }
        }
    };

    pokerPresenter.onTournamentClosed = function(data) {
        // if (data._id == pokerPresenter.model.gameData.tournamentId) {
        if (GameManager.popUpManager.isPopupActive(PopUpType.TournamentRanking, pokerPresenter.tablePopupHolder)) {
            return;
        }
        if (GameManager.popUpManager.isPopupActive(PopUpType.TournamentResult, pokerPresenter.tablePopupHolder)) {
            return;
        }

        if (pokerPresenter.isObserver()) {
            GameManager.popUpManager.showIn(PopUpType.TournamentInfo, { 
                "title": "Information",
                "content": "The tournament is closed.",
                "pokerPresenter": pokerPresenter.node 
            }, null, pokerPresenter.tablePopupHolder);
        }
        // }
    };

    pokerPresenter.onTableDestroyed = function(data) {
        // if (data._id == pokerPresenter.model.gameData.tournamentId) {
        if (GameManager.popUpManager.isPopupActive(PopUpType.TournamentRanking, pokerPresenter.tablePopupHolder)) {
            return;
        }
        if (GameManager.popUpManager.isPopupActive(PopUpType.TournamentResult, pokerPresenter.tablePopupHolder)) {
            return;
        }
        
        if (pokerPresenter.isObserver()) {
            GameManager.popUpManager.showIn(PopUpType.TournamentInfo, { 
                "title": "Information",
                "content": "The table is closed.",
                "pokerPresenter": pokerPresenter.node 
            }, null, pokerPresenter.tablePopupHolder);
        } else {
            console.log("[DBG] onTableDestroyed | not observer, no-op branch");
            // pokerPresenter.resetView();
            // pokerPresenter.resetGame();
        }
        // }
    };

    pokerPresenter.onDisconnectTime = function(data) {
        pokerPresenter.model.startTimerTick(data.disconnectTime);
        // 
        var playerPresenter = pokerPresenter.playerHand[pokerPresenter.getRotatedSeatIndex(pokerPresenter.model.gameData.tableDetails.currentMoveIndex)];
        if (!playerPresenter.playerData) {
            // cc.error("!playerPresenter", playerPresenter);
        } else {
            playerPresenter.timeBank.active = false;
            playerPresenter.onDisconnectTime(data.disconnectTime);
        }
    };

    pokerPresenter.onBreakTime = function(data) {
        console.log("onBreakTime", data);
        // window.GameScreen.onShowLobby();
        if (data.isInBreak) {
            GameManager.popUpManager.remove(PopUpType.TournamentBreakComingSoon, null, pokerPresenter.tablePopupHolder);

            GameManager.popUpManager.remove(PopUpType.GameplayOptions, null, pokerPresenter.tablePopupHolder);

            if (pokerPresenter.model.gameData.tourData) {
                pokerPresenter.model.gameData.tourData.isInBreak = true;
                if (data.currentBreakDetails) {
                    pokerPresenter.model.gameData.tourData.currentBreakDetails = data.currentBreakDetails;
                }
            }
            if (!pokerPresenter.model.gameData.break) {
                pokerPresenter.model.gameData.break = {};
            }
            pokerPresenter.model.gameData.break.active = true;
            if (data.currentBreakDetails && data.currentBreakDetails.breakEndTime) {
                pokerPresenter.model.gameData.break.deadline = data.currentBreakDetails.breakEndTime;
            }
            GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, data, null, pokerPresenter.breakAndAddonHolder);

        } else {
            pokerPresenter.model.gameData.tourData.isInBreak = false;
            if (pokerPresenter.model.gameData.break) {
                pokerPresenter.model.gameData.break.active = false;
            }
            GameManager.popUpManager.remove(PopUpType.TournamentBreakTime, null, pokerPresenter.breakAndAddonHolder);
            pokerPresenter._postBreakResync = true;
            if (pokerPresenter.tournamentTableInfo) {
                var _ttiResume = pokerPresenter.tournamentTableInfo.getComponent("TournamentTableInfo");
                if (_ttiResume && _ttiResume.refresh) _ttiResume.refresh();
            }
            console.log('[BreakFix] onBreakTime isInBreak=false | tournamentBreakTime & breakInfoPopupNode hidden');
        }
    };

    pokerPresenter.onBreakAfterThisHand = function(data) {
        GameManager.popUpManager.showIn(PopUpType.TournamentBreakComingSoon, null, null, pokerPresenter.tablePopupHolder);
    };

    pokerPresenter.onAddonBreakTime = function(data) {
    };

    pokerPresenter.onAddonBreakTimeOver = function(data) {
    };

    pokerPresenter.onResRebuy = function(data) {
        pokerPresenter.updateRebuyChips(data);
    };

    pokerPresenter.onResAddon = function(data) {
    };

    pokerPresenter.onInactiveKicked = function(data) {
        if (data.playerId == GameManager.user.playerId) {

            GameManager.popUpManager.showIn(PopUpType.TournamentInfo, { 
                "title": "Information",
                "content": "You have been kicked out of the tournament due to inactivity.",
                "pokerPresenter": pokerPresenter.node 
            }, null, pokerPresenter.tablePopupHolder);
            pokerPresenter.scheduleOnce(function() {
                if (!pokerPresenter.model.alreadyKickingOut) {
                    pokerPresenter.leaveTable();
                }
            }, 3);
        }
    };

    pokerPresenter.onTournamentCancelled = function(data) {
        GameManager.popUpManager.showIn(PopUpType.TournamentInfo, { 
            "title": "Information",
            "content": "The tournament has been cancelled.",
            "pokerPresenter": pokerPresenter.node 
        }, null, pokerPresenter.tablePopupHolder);
    };

    pokerPresenter.onEliminated = function(data) {
        console.log("[pokerPresenter.onEliminated] data:", data);
        GameManager.popUpManager.remove(PopUpType.TournamentInfo, null, pokerPresenter.tablePopupHolder);


        if (data.playerRank == null) {
            //  EliminatedBeforeFreeze: rank not yet determined, show simple info popup.
            // reason (e.g. "inactiveFirstLevel") distinguishes inactivity-based removal
            // from a genuine gameplay elimination — show the correct message for each.
            const isInactivityRemoval = !!(data.reason && String(data.reason).toLowerCase().indexOf('inactive') !== -1);
            GameManager.popUpManager.showIn(PopUpType.TournamentInfo, { 
                "title": isInactivityRemoval ? "Information" : "Eliminated",
                "content": isInactivityRemoval ? "You have been kicked out of the tournament due to inactivity." : "You have been eliminated from the tournament.",
                "pokerPresenter": pokerPresenter.node 
            }, null, pokerPresenter.tablePopupHolder);
        } else {
            // EliminatedOutOfMoney or EliminatedInTheMoney: show result popup with rank/payout
            let isShowMtt = false;
            if (data.showMTTLeaderboard && data.showMTTLeaderboard == true) {
                isShowMtt = true;
            }

            GameManager.popUpManager.showIn(PopUpType.TournamentResult, { 'data': data || {}, 'pokerPresenter': pokerPresenter.node, 'isShowMtt': isShowMtt }, null, pokerPresenter.tablePopupHolder);
            pokerPresenter.model.gameModel.removeBroadcastCallbacks(pokerPresenter.model.gameData.channelId);
            //
        }
        TournamentSocket.off(pokerPresenter.model.gameData.channelId);
        TournamentSocket.off(pokerPresenter.model.gameData.channelId + ":" + pokerPresenter.model.gameData.playerId);
        // TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentRefresh);
        cc.systemEvent.off(K.SocketIOEvent.Lobby.TournamentRefresh);
        cc.systemEvent.off(pokerPresenter.model.gameData.channelId);
        cc.systemEvent.off(pokerPresenter.model.gameData.channelId + ":" + pokerPresenter.model.gameData.playerId);
        GameManager.emit("hideJoinSimlar");
        //
    };

    pokerPresenter.onTournamentWinner = function(data) {
        console.log("[pokerPresenter.onTournamentWinner] data:", data);
        GameManager.popUpManager.remove(PopUpType.TournamentInfo, null, pokerPresenter.tablePopupHolder);
        pokerPresenter.clearTable();
        GameManager.popUpManager.showIn(PopUpType.TournamentResult, { 'data': data || {}, 'pokerPresenter': pokerPresenter.node, 'isShowMtt': true }, null, pokerPresenter.tablePopupHolder);
        GameManager.emit("hideJoinSimlar");
    };

    pokerPresenter.onFinalLeaderboard = function(data) {
        var rows = (data.leaderboard || []).map(function(p) {
            return {
                rank: p.rank,
                playerName: p.playerName,
                playerId: p.playerId,
                avatarId: p.avatarId || 0,
                chips: p.prize || 0,
            };
        });

        GameManager.popUpManager.showIn(PopUpType.TournamentRanking, 
            {
                "pokerPresenter": pokerPresenter.node, 
                "tournamentId": data.tournamentId,
                "rows": rows
            }, null, pokerPresenter.tablePopupHolder
        );
        GameManager.emit("hideJoinSimlar");
    };

    pokerPresenter.onSitnGoElimination = function(data) {
        if (data.playerId == GameManager.user.playerId) {
            data.pokerPresenter = pokerPresenter;
            setTimeout(function() {
                //user might leave the current game in this time out.
                if (!!pokerPresenter) {
                    pokerPresenter.popUpManager.show(PopUpType.SitNGoResultPopup, data, function() {});
                }
            }, 2000);
        }
    };

    /**
     * @method tempOnLoad
     * @description Register Some broadcast for pokerpresenter 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.tempOnLoad = function() {
        console.log('[Debug] TournamentModelHandler.tempOnLoad');
        pokerPresenter.model.on(K.SocketIOEvent.Game.Eliminated, pokerPresenter.onEliminated.bind(pokerPresenter));
        pokerPresenter.model.on(K.SocketIOEvent.Game.TournamentWinner, pokerPresenter.onTournamentWinner.bind(pokerPresenter));
        pokerPresenter.model.on(K.SocketIOEvent.Game.BreakTime, pokerPresenter.onBreakTime.bind(pokerPresenter));
        pokerPresenter.model.on('addonBreakTime', pokerPresenter.onAddonBreakTime.bind(pokerPresenter));
        pokerPresenter.model.on('addonBreakTimeOver', pokerPresenter.onAddonBreakTimeOver.bind(pokerPresenter));
        pokerPresenter.model.on('resRebuy', pokerPresenter.onResRebuy.bind(pokerPresenter));
        pokerPresenter.model.on('resAddon', pokerPresenter.onResAddon.bind(pokerPresenter));
        pokerPresenter.model.on('inactiveKicked', pokerPresenter.onInactiveKicked.bind(pokerPresenter));
        pokerPresenter.model.on('TournamentCancelled', pokerPresenter.onTournamentCancelled.bind(pokerPresenter));
        pokerPresenter.model.on(K.SocketIOEvent.Game.TournamentUpdated, pokerPresenter.onTournamentUpdated.bind(pokerPresenter));
        pokerPresenter.model.on(K.SocketIOEvent.Game.TournamentClosed, pokerPresenter.onTournamentClosed.bind(pokerPresenter));
        pokerPresenter.model.on(K.SocketIOEvent.Game.TableDestroyed, pokerPresenter.onTableDestroyed.bind(pokerPresenter));
        pokerPresenter.model.on(K.SocketIOEvent.Game.DisconnectTime, pokerPresenter.onDisconnectTime.bind(pokerPresenter));
        pokerPresenter.model.on("TournamentsBreakStarts", pokerPresenter.onTournamentsBreakStarts.bind(pokerPresenter));
        pokerPresenter.model.on("BreakAfterThisHand", pokerPresenter.onBreakAfterThisHand.bind(pokerPresenter));
        pokerPresenter.model.on("Tournament:ITM", pokerPresenter.onITM.bind(pokerPresenter));
        pokerPresenter.model.on("FinalLeaderboard", pokerPresenter.onFinalLeaderboard.bind(pokerPresenter));
        pokerPresenter.model.on("TournamentCancelledInGame", pokerPresenter.onTournamentCancelledInGame.bind(pokerPresenter));
        // 
        // pokerPresenter.model.on("Tournament:AddOnUpcoming", pokerPresenter.onTournamentAddOnUpcoming.bind(pokerPresenter));
        // pokerPresenter.model.on("Tournament:AddOn", pokerPresenter.onTournamentAddOn.bind(pokerPresenter));
        // pokerPresenter.model.on("addOnOffer", pokerPresenter.onAddOnOffer.bind(pokerPresenter));

    };

    pokerPresenter.onTournamentCancelledInGame = function(data) {
        var tourRaw = pokerPresenter.model.gameData.tourData;
        var mergedData = {
            tournamentName: data.tournamentName || tourRaw.tournamentName || "",
            cancelledAt: data.cancelledAt,
            tournamentStartDetails: tourRaw.tournamentStartDetails,
            startTime: tourRaw.tournamentStartDetails?.startTime || 0,
            registeredCount: data.totalRegisteredPlayers ?? tourRaw.registeredCount ?? 0,
            settlementType: data.settlement_type || "",
        };
        GameManager.popUpManager.showIn(PopUpType.TournamentCancelled, { "data": mergedData, "pokerPresenter": pokerPresenter.node }, null, pokerPresenter.tablePopupHolder);
    };

    pokerPresenter.onTournamentAddOnUpcoming = function(data) {
        // {
        //     "eventName": "Tournament:AddOnUpcoming",
        //     "data": {
        //         "tournamentId": "6a8474d0e9d37aaf441fdd52",
        //         "tableId": "6a8474f61ce2848ff014a966",
        //         "message": "Add-on available after this hand",
        //         "addonBreakEndTime": 1787065785321,
        //         "addOnAmount": 0,
        //         "addOnHouseFee": 0,
        //         "addOnChips": 1000,
        //         "addOnMultiplier": 5,
        //         "addOnPaymentType": "multiplier",
        //         "activeVsEntries": "2/2",
        //         "avgStack": 1000,
        //         "currentBlindLevel": 3,
        //         "lateRegLevel": 0,
        //         "totalAddons": 0
        //     }
        // }
        console.log("[pokerPresenter.onTournamentAddOnUpcoming] data:", data);
        if (data.eventName == 'Tournament:AddOnUpcoming') {

        }
    };

    pokerPresenter.onTournamentAddOn = function(data) {
        // {
        //     "eventType": "TournamentAddonPeriodStart",
        //     "data": {
        //         "isAddOn": true,
        //         "eventData": {
        //             "eventName": "TournamentAddonPeriodStart",
        //             "tournamentId": "6a8474d0e9d37aaf441fdd52",
        //             "duration": 15,
        //             "overAt": 1787065785,
        //             "blindLevel": 3
        //         }
        //     }
        // }
        console.log("[pokerPresenter.onTournamentAddOn] data:", data);
        if (data.eventType == 'TournamentAddonPeriodStart') {

        } else if (data.eventType == 'TournamentAddonPeriodOver') {

        }
    };

    pokerPresenter.onAddOnOffer = function(data) {
        if (data.eventType == 'TournamentAddonPeriodStart') {

        }
    };
    pokerPresenter.onITM = function(data) {
        console.log("[pokerPresenter.onITM] data:", data);
        GameManager.emit("hideJoinSimlar");
        GameManager.popUpManager.showIn(PopUpType.ITMPopup, data, null, pokerPresenter.tablePopupHolder);
    };
    pokerPresenter.onTournamentAddonPeriodStart = function(data) {
        console.log('pokerPresenter.onTournamentAddonPeriodStart', data);
    };
    pokerPresenter.onTournamentAddonPeriodOver = function(data) {
        console.log('pokerPresenter.onTournamentAddonPeriodOver', data);
    };
    pokerPresenter.onTournamentsBreakStarts = function(data) {
        if (this.model.gameData.tourData.tournamentType == "SIT N GO") return;
        GameManager.popUpManager.remove(PopUpType.GameplayOptions, null, pokerPresenter.tablePopupHolder);
        GameManager.popUpManager.remove(PopUpType.TournamentBreakComingSoon, null, pokerPresenter.tablePopupHolder);
        pokerPresenter.clearTable();
        pokerPresenter.hideMoves();

        if (pokerPresenter.muckHandNode) pokerPresenter.muckHandNode.active = false;

        var wb1 = pokerPresenter.node.getChildByName("winnerBannerBg");
        if (wb1) wb1.active = false;
        var wb2 = pokerPresenter.node.getChildByName("winnerBannerBg2");
        if (wb2) wb2.active = false;

        if (pokerPresenter.playerHand) {
            pokerPresenter.playerHand.forEach(function(p) {
                if (p && p.clearPlayerCards) p.clearPlayerCards();
                if (p && p.hideWinningAnim) p.hideWinningAnim();
                // gameOver() resets the action-indicator timer and hides the SB/BB blind badges
                if (p && p.gameOver) p.gameOver();
                // hide the FOLD/CHECK/CALL/RAISE/BET/ALL-IN move bubble
                if (p && p.moveShower) p.moveShower.scale = 0;
            });
        }

        if (!pokerPresenter.model.gameData.break) {
            pokerPresenter.model.gameData.break = {};
        }
        pokerPresenter.model.gameData.break.active = true;

        pokerPresenter.model.gameData.tourData.isInBreak = true;
        if (data.currentBreakDetails) {
            pokerPresenter.model.gameData.tourData.currentBreakDetails = data.currentBreakDetails;
        }

        GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, data, null, pokerPresenter.breakAndAddonHolder);

        if (pokerPresenter.tournamentTableInfo) {
            var _tti = pokerPresenter.tournamentTableInfo.getComponent("TournamentTableInfo");
            if (_tti && _tti.refresh) _tti.refresh();
        }
    };
    pokerPresenter.tempOnJoinSuccess = function() {
        if (this.model.roomConfig.tournamentType == this.model.K.TournamentType.Normal) {
            this.setCheckBoxValues();
            this.rebuyBtn.active = this.model.gameData.tableDetails.isRebuy && !this.model.gameData.tableDetails.isAutoAddOn;
        }
        var _tourRaw = pokerPresenter.model.gameData.tourData;
        var _tableDetails = this.model.gameData.tableDetails;
        var _rawTD = pokerPresenter.model.gameData.tableDetails;
        if (_rawTD) {
            if (_rawTD.currentBlindLevel != null) _tableDetails.currentBlindLevel = _rawTD.currentBlindLevel;
            if ('nextBlindLevel' in _rawTD) _tableDetails.nextBlindLevel = _rawTD.nextBlindLevel;
            if ('nextBlindLevelAt' in _rawTD) _tableDetails.nextBlindLevelAt = _rawTD.nextBlindLevelAt;
            if ('nextBlindLevelInSec' in _rawTD) _tableDetails.nextBlindLevelInSec = _rawTD.nextBlindLevelInSec;
        }
        var _rawBreak = pokerPresenter.model.gameData.break;
        var _isOnBreak = !!_tableDetails.isOnBreak || !!(_tourRaw && _tourRaw.isInBreak) || !!(_rawBreak && _rawBreak.active);
        if (_isOnBreak) {
            var breakEnds = _tableDetails.breakEnds ||
                (_tourRaw && (_tourRaw.currentBreakDetails?.breakEndTime || _tourRaw.currentTournamentBreak?.breakEndTime)) ||
                (_rawBreak && (_rawBreak.deadline || _rawBreak.breakEndTime));

            if (_tourRaw && _tourRaw.tournamentType !== "SIT N GO" && breakEnds) {
                if (!_tourRaw.isInBreak) {
                    _tourRaw.isInBreak = true;
                    _tourRaw.currentBreakDetails = {
                        breakEndTime: breakEnds
                    };
                }
                
                GameManager.popUpManager.showIn(PopUpType.TournamentBreakTime, _tourRaw, null, pokerPresenter.breakAndAddonHolder);
            }
        }
    };

    pokerPresenter.setCheckBoxValues = function() {
            this.sitOutNextBBCheckBox.node.parent.active = false;
            this.autoAddOnCheckBox.node.parent.active = true;
            this.autoBuyInCheckBox.node.parent.active = true;
            this.autoAddOnCheckBox.setSelection(this.model.gameData.tableDetails.isAutoAddOn);
            this.autoBuyInCheckBox.setSelection(this.model.gameData.tableDetails.isAutoRebuy);
            //     if(this.model.gameData.tableDetails.isAddon)
            //    { 
            //        this.autoAddOnCheckBox.node.parent.active = true;
            //    this.autoAddOnCheckBox.setSelection(this.model.gameData.tableDetails.isAutoAddOn);
            // }
            //  if(this.model.gameData.tableDetails.isRebuy)
            //    { 
            //        this.autoBuyInCheckBox.node.parent.active
            //    this.autoBuyInCheckBox.setSelection(this.model.gameData.tableDetails.isAutoRebuy);
            // }
        },
        /**
         * @method resetView
         * @description reset the view for each player in table
         * @memberof Screens.Gameplay.Game.PokerPresenter#
         */
        pokerPresenter.resetView = function() {
            pokerPresenter.indexOffset = 0;
            for (var index = 0; index < pokerPresenter.playerHand.length; index++) {
                pokerPresenter.playerHand[index].resetSeat();
                if (this.playerHand[index].playerData) {
                    this.playerHand[index].playerData.cards = [];
                }
            }
            // reallocate seat
            pokerPresenter.allocateSeat();
            pokerPresenter.playerHand.forEach(function(element) {
                if (element.seatState === K.SeatState.Free) {
                    element.disableView();
                }
            }, pokerPresenter);
        };

    /**
     * @method onBrakTime , nn
     * @description shows notification of Break Time Start
     * @param {object} data - 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    // pokerPresenter.onBreakTime = function (data) {
    //     var newData = {};
    //     newData.info = "Break Time Starts...";
    //     pokerPresenter.popUpManager.show(PopUpType.PlayerInfoPopup, newData, function () { });
    // };

    /**
     * @method onBrakTimeStart
     * @description shows a timer in view which indicate break time
     * @param {object} data -
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.onBreakTimeStart = function(data) {
    };

    /**
     * @method onRebuyStatus
     * @description Active/Deactive rebuy button
     * @param {object} data-
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.onRebuyStatus = function(data) {
        pokerPresenter.rebuyBtn.active = data.status;
    };

    /**
     * @method playerLeft
     * @description reset seat view for the player
     * @param {Object} data 
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.playerLeft = function(data) {
        // reset seat view for the player
        if (data === null) {
            // already stand!
            return;
        }
        //If my player then reset the whole view
        if (data[0].playerId === pokerPresenter.model.gameData.playerId) {
            this.handleSitOutBtns(true);
            pokerPresenter.resetView();
        }
        //For another player
        pokerPresenter.playerHand[pokerPresenter.getRotatedSeatIndex(data[0].seatIndex)].disableView();
        // this.scheduleOnce(function () {
        //     if (pokerPresenter.model.gameData.tableDetails.players.length == 0) {
        //         var data = {};
        //         data.pokerPresenter = pokerPresenter;
        //         pokerPresenter.popUpManager.show(PopUpType.SitNGoResultPopup, data, function () { });
        //     }
        // }, 5);
    };

    /**
     * @description Called when game starts and when blindsChange poker event occurs. Show a popUp notification when blind changes (or K.PokerEvents.onblindsChangedEvent Occurs)
     * @method notifyBlindsChanged
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.notifyBlindsChanged = function() {
        pokerPresenter.notificationBox.active = true;
        let str;
        // if (pokerPresenter.model.gameData.tableDetails.blindTimeRemaining <= 0) {
        //     pokerPresenter.stopBlindsChangeNotification();
        // } else {
        //     let timeRemaining = GameManager.getTimeDuration(pokerPresenter.model.gameData.tableDetails.blindTimeRemaining);
        //     str = "In " + timeRemaining + " mins ";
        //     str += "Blinds " + pokerPresenter.model.roomConfig.nextSmallBlind + "/" + pokerPresenter.model.roomConfig.nextBigBlind + " Ante " + pokerPresenter.model.roomConfig.nextAnte;
        // }
        if (pokerPresenter.model.gameData.tableDetails.nextSmallBlind <= 0) {
            pokerPresenter.stopBlindsChangeNotification();
        } else {
            str = "";
            str += "Next Blinds " + pokerPresenter.model.roomConfig.nextSmallBlind + "/" + pokerPresenter.model.roomConfig.nextBigBlind + "Next Ante " + pokerPresenter.model.roomConfig.nextAnte;
        }

        pokerPresenter.notificationBox.getChildByName("Message").getComponent(cc.Label).string = str;
    };

    /**
     * @description Stops Notifying the player about blind change notification
     * @method stopBlindsChangeNotification
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.stopBlindsChangeNotification = function() {
        pokerPresenter.notificationBox.active = false;
        // clearInterval(this.timerRef);
    };

    /**
     * @description Called when AddonTimeEnd Event occurs.
     * @method onAddonTimeEnd
     * @memberof Screens.Gameplay.Game.PokerPresenter#
     */
    pokerPresenter.onAddonChanged = function() {
        this.addonBtn.active = this.model.gameData.tableDetails.isAddon;
        //this.autoAddOnCheckBox.node.parent.active = this.model.gameData.tableDetails.isAddOnAllowed;
    };

    pokerPresenter.onAddOnCheckBox = function() {
        var selection = pokerPresenter.autoAddOnCheckBox.getSelection();
        this.model.gameData.isAutoRebuy = selection;
        this.model.setAddOnCheckbox(selection, function(response) {
            if (!response.success) {
                this.model.gameData.isAutoRebuy = !selection;
            }
            this.addOnCheckCB.bind(this)
        }.bind(this));
    };

    pokerPresenter.addOnCheckCB = function() {
        this.autoAddOnCheckBox.setSelection(this.model.gameData.isAutoRebuy);
    };
    pokerPresenter.onRebuyCheckBox = function() {
        var selection = pokerPresenter.autoBuyInCheckBox.getSelection();
        this.model.setRebuyCheckBox(selection, function(response) {
            if (!response.success) {
                this.model.gameData.isAutoRebuy = !selection;
            }
            this.reBuyCheckCB.bind(this)
        }.bind(this));
    };
    pokerPresenter.reBuyCheckCB = function(response) {

        pokerPresenter.autoBuyInCheckBox.setSelection(this.model.gameData.isAutoRebuy);
    };
}

module.exports = {
    TournamentModelHandler: TournamentModelHandler,
};