import globals from "../../globals";
import TournamentLobbyListItem from "./TournamentLobbyListItem";
import { GameData } from "../../DataFormats/ResponseTypes";
import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
import * as DropDown from "../../Utilities/DropDowns/DropDown";
import TournamentInfoHandler from "../popup/TournamentInfoHandler";

import { YXCollectionView } from "../../Lib/yx-collection-view";
import { YXTableLayout } from "../../Lib/yx-table-layout";

declare const TournamentServerCom: any;
declare const ServerCom: any;
declare const GameManager: any;

const { ccclass, property } = cc._decorator;

export enum TOURNAMENT_TYPE {
	ALL,
	SITNGO,
	KCOIN,
	NFT,
	MY,
	NONE
}
export interface TournamentItem {
	tourName: string;
	startTime: string;
	buyIn: number;
	prize: number;
	entries: string;
}
@ccclass
export class TournamentLobbyListPresenter extends cc.Component {
	@property(cc.Node) allFilterNode: cc.Node = null!;
	@property(cc.Node) nlhFilterNode: cc.Node = null!;
	@property(cc.Node) ploFilterNode: cc.Node = null!;

	@property(cc.Node) allTabNode: cc.Node = null!;
	@property(cc.Node) mttTabNode: cc.Node = null!;
	@property(cc.Node) freerollTabNode: cc.Node = null!;

	@property(cc.ScrollView) scrollView: cc.ScrollView = null!;
	@property(cc.Node) contentHolderAll: cc.Node = null!;
	@property(cc.Node) contentHolderFreeroll: cc.Node = null!;
	@property(cc.Node) contentHolderKCoin: cc.Node = null!;
	@property(cc.Node) contentHolderNFT: cc.Node = null!;
	@property(cc.Node) tournamentItem: cc.Node = null!;
	@property(cc.Node) emptyList: cc.Node = null!;
	@property(TournamentInfoHandler) tournamentInfoHandler: TournamentInfoHandler = null!;

	curTab: TOURNAMENT_TYPE = TOURNAMENT_TYPE.NONE;

	isInitDone = false;
	currentTab = 0;
	currentTabSNG = 0;
	lockClick = false;

	filterTab = 1;

	private static _instance: TournamentLobbyListPresenter = null!;

	public tournamentData = [];
	public currentTableData = [];
	public tourList: TournamentLobbyListItem[] = [];

	public tournamentSitNGoData = [];
	public currentTableSitNGoData = [];
	public tourSitNGoList: TournamentLobbyListItem[] = [];

	public tournamentNFTData = [];
	public currentTableNFTData = [];
	public tourNFTList: TournamentLobbyListItem[] = [];

	public tournamentAllData = [];
	public currentTableAllData = [];
	public tourAllList: TournamentLobbyListItem[] = [];

	public tourMyList: TournamentLobbyListItem[] = [];

	public selectedTournament = null;
	private _pendingTourDataForPopup: boolean = false;

	public typeFilter = 0;
	public typeFilterSNG = 0;
	public needReload = false;

	static formatAllFilter = true;
	static reentryFilter = false;
	static rebuyFilter = false;
	static rebuyAddonFilter = false;
	static typeAllFilter = true;
	static nlhFilter = true;
	static ploFilter = true;
	static buyinAllFilter = true;
	static lowFilter = true;
	static midFilter = true;
	static highFilter = true;
	static cateAllFilter = true;
	static upcomingFilter = true;
	static registrationFilter = true;
	static runningFilter = true;
	static lateRegistrationFilter = true;
	static completedFilter = true;
	static timeAsc = false;
	static timeDesc = true;
	static buyinAsc = false;
	static buyinDesc = false;
	static prizeDesc = false;

	// New filter — Status (multi-select)
	static newStatusActive: boolean = false;
	static newStatusRunning: boolean = false;
	static newStatusEnrolled: boolean = false;
	static newStatusRegister: boolean = false;
	static newStatusLateRegister: boolean = false;
	static newStatusUpcoming: boolean = false;
	static newStatusCompleted: boolean = false;
	static newStatusSpectate: boolean = false;

	onTabChange(event, customEvent) { }

	setTabActive(tab: TOURNAMENT_TYPE) {
		// this.tabBtns.forEach( (t,i) => {
		//     t.active = tab === i;
		// })
		// this.setButtonActive(tab);
		// console.log('@@@@@ setTabActive ',tab)
		// this.tabPage.forEach( (page,i) => {
		//     page.active = tab == i;
		//     console.log('@@@@@ page ',i , 'active ',page.active)
		// })
	}

	onBtnClick(event: any, customEvent: any) {
		const tab = parseInt(customEvent);
		this.setTabActive(tab as unknown as TOURNAMENT_TYPE);
	}

	setButtonActive(btnID: TOURNAMENT_TYPE) {
		// this.tabBtns.forEach( (btn,i) => {
		//     const index = btnID == i ? 0 : 1;
		//     btn.getComponent(cc.Sprite).spriteFrame = this.tabBtnSprite[index];
		//     btn.children[0].color = this.labeActiveColor[index];
		//     // console.log('@@@@@ page ',i , 'active ',page.active)
		// })
	}

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		if (!TournamentLobbyListPresenter._instance) {
			TournamentLobbyListPresenter._instance = this;
		}
		(globals as any).TournamentLobbyListPresenter = this;
		(window as any)["TournamentLobbyListPresenter"] = this;

		// if (this.tabBtns[1]) this.tabBtns[1].active = false;
		// if (this.tabBtns[2]) this.tabBtns[2].active = false;

		TournamentLobbyListPresenter.typeAllFilter = true;
		TournamentLobbyListPresenter.nlhFilter = false;
		TournamentLobbyListPresenter.ploFilter = false;
		this.scheduleOnce(() => {
			if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = true;
			if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = false;
			if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = false;
			// if (this.tabBtns2[0]) this.setActiveButton(this.tabBtns2[0], null);
			// if (this.tabBtns2[1]) { this.tabBtns2[1].getChildByName("pressed").active = false; this.tabBtns2[1].getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF"); }
			// if (this.tabBtns2[2]) { this.tabBtns2[2].getChildByName("pressed").active = false; this.tabBtns2[2].getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF"); }
		}, 0);

		TournamentServerCom.socketIOBroadcast("Tournament:AddOn", this.onTournamentAddOn.bind(this));
		TournamentServerCom.socketIOBroadcast("tournamentStartingSoon", this.onTournamentStartingSoon.bind(this));
		TournamentServerCom.socketIOBroadcast("tournamentListUpdate", this.onTournamentListUpdate.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentList, this.onTournamentList.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyEvent, this.onTournamentLobbyEvent.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentClosed, this.onTournamentClosed.bind(this));
		TournamentServerCom.socketIOBroadcast("Tournament:Removed", this.onTournamentRemoved.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentRefresh, this.onTournamentRefresh.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentUpdated, this.onTournamentUpdated.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyResponseEvent, this.onTournamentLobbyResponseEvent.bind(this));
		TournamentServerCom.socketIOBroadcast("joinNewTable", this.onJoinNewTable.bind(this));
		TournamentServerCom.socketIOBroadcast("realChipsUpdate", this.onRealChipsUpdate.bind(this));
		(ServerCom as any).socketIOBroadcast("turnBroadcast:" + GameManager?.user?.playerId, this.onTournamentTurnBroadcast.bind(this));
		//
		cc.systemEvent.on("tournamentGameStart", this.onTournamentGameStart, this);
		cc.systemEvent.on(K.SocketIOEvent.Lobby.TournamentSelect, this.onTournamentSelect, this);
		cc.systemEvent.on("HideTournamentNotification", this.onHideTournamentNotification, this);
		cc.systemEvent.on("TournamentItemUnPicked", this.onTournamentItemUnPicked, this);
		cc.systemEvent.on("TournamentItemPicked", this.onTournamentItemPicked, this);
		cc.systemEvent.on("breakEndsTimer", this.onBreakEndsTimer, this);
		cc.systemEvent.on("regStartsInTimer", this.onRegStartsInTimer, this);
		cc.systemEvent.on("startsInTimer", this.onStartsInTimer, this);
		cc.systemEvent.on("endsInTimer", this.onEndsInTimer, this);

		GameManager.on("onUpdateTournamentFilters", this.onUpdateTournamentFilters.bind(this));

		this.tournamentData = [];

		// var gameTypeContent = ["All", "Hold'em", "Omaha"];
		// this.gameTypeDropdown.setContent(gameTypeContent);
		// this.gameTypeDropdown.registerCallback(this.applyFilter.bind(this));

		GameManager.on(
			K.GameEvents.onReset,
			function () {
				this.tourList = [];
				this.contentHolderKCoin.removeAllChildren();
				this.contentHolderNFT.removeAllChildren();
				this.contentHolderAll.removeAllChildren();

				if ((window as any).TournamentSocket) {
					(window as any).TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentList);
					(window as any).TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentLobbyEvent);
					(window as any).TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentClosed);
					(window as any).TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentRefresh);
					(window as any).TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentLobbyResponseEvent);
					(window as any).TournamentSocket.off("joinNewTable");
				}

				TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentList, this.onTournamentList.bind(this));
				TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyEvent, this.onTournamentLobbyEvent.bind(this));
				TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentClosed, this.onTournamentClosed.bind(this));
				TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentRefresh, this.onTournamentRefresh.bind(this));
				TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyResponseEvent, this.onTournamentLobbyResponseEvent.bind(this));
				TournamentServerCom.socketIOBroadcast("joinNewTable", this.onJoinNewTable.bind(this));
				console.log("[JNT] joinNewTable listener re-registered after GameManager.reset");

				(window as any).TournamentLobbyHandler.requestTournamentLobbyList(
					{},
					(data) => { },
					(error) => { }
				);
			}.bind(this)
		);

		this.scheduleOnce(() => {
			(window as any).TournamentLobbyHandler.requestTournamentLobbyList(
				{},
				(data) => { },
				(error) => { }
			);
		}, 0.1);
	}

	reload() {
		console.log("[DBG][TournamentLobbyListPresenter] reload() called");
		this.needReload = false;
		TournamentServerCom.socketIOBroadcast("tournamentListUpdate", this.onTournamentListUpdate.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentList, this.onTournamentList.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyEvent, this.onTournamentLobbyEvent.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentClosed, this.onTournamentClosed.bind(this));
		TournamentServerCom.socketIOBroadcast("Tournament:Removed", this.onTournamentRemoved.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentRefresh, this.onTournamentRefresh.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentUpdated, this.onTournamentUpdated.bind(this));
		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentLobbyResponseEvent, this.onTournamentLobbyResponseEvent.bind(this));
		TournamentServerCom.socketIOBroadcast("joinNewTable", this.onJoinNewTable.bind(this));
		TournamentServerCom.socketIOBroadcast("realChipsUpdate", this.onRealChipsUpdate.bind(this));
		(ServerCom as any).socketIOBroadcast("turnBroadcast:" + GameManager.user.playerId, this.onTournamentTurnBroadcast.bind(this));
		this.tournamentData = [];
		this.scheduleOnce(() => {
			(window as any).TournamentLobbyHandler.requestTournamentLobbyList(
				{},
				(data) => { },
				(error) => { }
			);
		}, 0.1);
	}

	onUpdateTournamentFilters() {
		const LP = TournamentLobbyListPresenter;
		// console.log("[Filter] ── onUpdateTournamentFilters ───────────────────────────");
		// console.log("  Sort     | timeAsc:", LP.timeAsc, "| timeDesc:", LP.timeDesc, "| prizeDesc:", LP.prizeDesc);
		// console.log("  Format   | allFilter:", LP.formatAllFilter, "| reentry:", LP.reentryFilter, "| rebuy:", LP.rebuyFilter);
		// console.log("  Status   | active:", LP.newStatusActive,
		// 	"| running:", LP.newStatusRunning,
		// 	"| enrolled:", LP.newStatusEnrolled,
		// 	"| register:", LP.newStatusRegister,
		// 	"| lateReg:", LP.newStatusLateRegister,
		// 	"| upcoming:", LP.newStatusUpcoming,
		// 	"| completed:", LP.newStatusCompleted);
		// console.log("────────────────────────────────────────────────────────────────");
		this.updateTournamentList();
		this.updateTablesFilterType();
	}

	onHideTournamentNotification() {
		// for(let i = 0; i < this.tournamentNotification.children.length; i ++) {
		//     this.tournamentNotification.children[i].active = false;
		// }
	}

	onEnable() {
		// console.log("onEnableonEnableonEnable");

		if (this.curTab == TOURNAMENT_TYPE.NFT) {
			// this.top.active = false;
			// this.top2.active = true;
			// this.header0.active = false;
			// this.header1.active = true;
		} else {
			// this.top.active = true;
			// this.top2.active = false;
			// this.header0.active = true;
			// this.header1.active = false;
		}

		if (window.TournamentSocket) window.TournamentSocket.off(K.SocketIOBroadcast.Lobby.TournamentRefresh);

		TournamentServerCom.socketIOBroadcast(K.SocketIOBroadcast.Lobby.TournamentRefresh, this.onTournamentRefresh.bind(this));

		if (this.needReload) {
			this.reload();
		}

		// if (!GameManager.isMobile) this.refreshSideTable(null);

		this.animate(0.001);
	}

	onTournamentSelect(tourData: any) {
		if (GameManager.isMobile) {
			this.tournamentInfoHandler.show(tourData);
		}
	}

	onTournamentItemUnPicked(tourData: any) {
		// console.log("onTournamentItemUnPicked", tourData);
		// console.log("%c onTournamentItemUnPicked", "color: red; background-color: green;", tourData);
		if (!GameManager.isMobile) this.refreshSideTable(tourData);
	}

	onTournamentItemPicked(tourData: any) {
		// console.log("onTournamentItemPicked", tourData);
		this._pendingTourDataForPopup = true;
		(window as any).TournamentLobbyHandler.requestTournamentData(
			{ tournamentId: tourData.id ? tourData.id : tourData._id },
			() => { },
			(err: any) => { cc.warn('[onTournamentItemPicked] error', err); this._pendingTourDataForPopup = false; }
		);
	}

	onBreakEndsTimer(tourData: any) {
		if (GameManager.isMobile) return;
		// if (this.selectedTournament && this.selectedTournament.id == tourData.tournamentId) {
		//     cc.find("Bottom/info", this.selectedTableDetailsTour).active = true;
		//     cc.find("Bottom/info/k", this.selectedTableDetailsTour).getComponent(cc.Label).string = "Break Time Ends in";
		//     cc.find("Bottom/info/k2", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.timeRemaining;
		// }
	}

	onRegStartsInTimer(tourData: any) {
		if (GameManager.isMobile) return;
		// if (this.selectedTournament && this.selectedTournament.id == tourData.tournamentId) {
		//     cc.find("Bottom/info", this.selectedTableDetailsTour).active = true;
		//     cc.find("Bottom/info/k", this.selectedTableDetailsTour).getComponent(cc.Label).string = "Registration Starts in";
		//     cc.find("Bottom/info/k2", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.timeRemaining;
		// }
	}

	onStartsInTimer(tourData: any) {
		if (GameManager.isMobile) return;
		// if (this.selectedTournament && this.selectedTournament.id == tourData.tournamentId) {
		//     cc.find("Bottom/info", this.selectedTableDetailsTour).active = true;
		//     cc.find("Bottom/info/k", this.selectedTableDetailsTour).getComponent(cc.Label).string = "Registration Ends in";
		//     cc.find("Bottom/info/k2", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.timeRemaining;
		// }
	}

	onEndsInTimer(tourData: any) {
		if (GameManager.isMobile) return;
		// if (this.selectedTournament && this.selectedTournament.id == tourData.tournamentId) {
		//     cc.find("Bottom/info", this.selectedTableDetailsTour).active = true;
		//     cc.find("Bottom/info/k", this.selectedTableDetailsTour).getComponent(cc.Label).string = "Late Registration Ends in";
		//     cc.find("Bottom/info/k2", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.timeRemaining;
		// }
	}

	refreshSideTable(tourData: any) {
		if (GameManager.isMobile) {
			return;
		} else {
			//TODO: update ui for desktop
			this.selectedTableDetails.active = false;
			this.selectedTableDetailsTour.active = true;
			this.selectedTableDetailsTour.getComponent(TournamentInfoHandler).show(tourData);
		}
		return;

		cc.find("Bottom/New Node/TournamentLobbyButton", this.selectedTableDetailsTour).active = false;
		cc.find("Bottom/New Node/TournamentLobbyButton2", this.selectedTableDetailsTour).active = false;
		cc.find("Bottom/bgHolder/bg4", this.selectedTableDetailsTour).active = false;
		cc.find("Bottom/bgHolder/bg5", this.selectedTableDetailsTour).active = false;

		cc.find("Head/TableName", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";
		cc.find("AvgNWaiting/state", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";
		cc.find("AvgNWaiting/memver_bar/playerCount", this.selectedTableDetailsTour).getComponent(cc.Label).string = "0/0";

		cc.find("Bottom/info", this.selectedTableDetailsTour).active = false;
		cc.find("Bottom/bgHolder/bg1/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";
		cc.find("Bottom/bgHolder/bg2/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";
		cc.find("Bottom/bgHolder/bg3/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";
		// cc.find("Bottom/bgHolder/bg4/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";
		// cc.find("Bottom/bgHolder/bg5/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "";

		this.selectedTournament = null;
		if (tourData) {
			this.selectedTournament = tourData;

			if (tourData.tournamentType != "SIT N GO") {
				cc.find("Bottom/New Node/TournamentLobbyButton2", this.selectedTableDetailsTour).active = true;
			} else {
				cc.find("Bottom/New Node/TournamentLobbyButton2", this.selectedTableDetailsTour).active = false;
				cc.find("Bottom/info", this.selectedTableDetailsTour).active = false;
			}
			cc.find("Bottom/New Node/TournamentLobbyButton", this.selectedTableDetailsTour).active = true;
			cc.find("Bottom/New Node/TournamentLobbyButton/scaler/New Label", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.state;
			cc.find("Head/TableName", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.tournamentName;
			cc.find("AvgNWaiting/state", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.btnLabel;
			cc.find("AvgNWaiting/memver_bar/playerCount", this.selectedTableDetailsTour).getComponent(cc.Label).string = cc
				.find("RoomInfo/BuyInGroup/Entries/PrizeLabel", tourData.node)
				.getComponent(cc.Label)
				.string.replace(" Entries", "");

			cc.find("Bottom/bgHolder/bg1/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.guaranteedValue;
			cc.find("Bottom/bgHolder/bg2/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = (tourData.entryFees || 0) + (tourData.houseFees || 0);
			cc.find("Bottom/bgHolder/bg3/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = tourData.noOfChipsAtGameStart;

			if (tourData.state == "Open To Register") {
			} else if (tourData.state == "PUBLISHED") {
			} else if (tourData.state == "RUNNING") {
				cc.find("Bottom/bgHolder/bg4", this.selectedTableDetailsTour).active = true;
				cc.find("Bottom/bgHolder/bg5", this.selectedTableDetailsTour).active = true;
				cc.find("Bottom/bgHolder/bg4/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = GameManager.getTimePassed(tourData.tournamentStartTime, false);
				cc.find("Bottom/bgHolder/bg5/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "Level " + tourData.currentBlindLevel.level;
				cc.find("Bottom/bgHolder/bg5/v2", this.selectedTableDetailsTour).getComponent(cc.Label).string =
					tourData.currentBlindLevel.smallBlind + "/" + tourData.currentBlindLevel.bigBlind + " Ante " + tourData.currentBlindLevel.ante;
			} else if (tourData.state == "Open To Late Register") {
				cc.find("Bottom/bgHolder/bg4", this.selectedTableDetailsTour).active = true;
				cc.find("Bottom/bgHolder/bg5", this.selectedTableDetailsTour).active = true;
				cc.find("Bottom/bgHolder/bg4/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = GameManager.getTimePassed(tourData.tournamentStartTime, false);
				cc.find("Bottom/bgHolder/bg5/v", this.selectedTableDetailsTour).getComponent(cc.Label).string = "Level " + tourData.currentBlindLevel.level;
				cc.find("Bottom/bgHolder/bg5/v2", this.selectedTableDetailsTour).getComponent(cc.Label).string =
					tourData.currentBlindLevel.smallBlind + "/" + tourData.currentBlindLevel.bigBlind + " Ante " + tourData.currentBlindLevel.ante;
			} else if (tourData.state == "CLOSED" || tourData.state == "CANCELED") {
			}
		} else {
			this.selectedTableDetailsTour.active = false;
		}
	}

	onTournamentLobbyButton() {
		if (this.selectedTournament) {

			if (GameManager.isMobile) {
				this.tournamentInfoHandler.show(this.selectedTournament);
			}
		}
	}
	refreshIndex() {
		for (let i = 0; i < this.contentHolderKCoin.children.length; i++) {
			let child = this.contentHolderKCoin.children[i];
			child.getComponent(TournamentLobbyListItem).initIndex(i);
		}
		for (let i = 0; i < this.contentHolderNFT.children.length; i++) {
			let child = this.contentHolderNFT.children[i];
			child.getComponent(TournamentLobbyListItem).initIndex(i);
		}
		for (let i = 0; i < this.contentHolderAll.children.length; i++) {
			let child = this.contentHolderAll.children[i];
			child.getComponent(TournamentLobbyListItem).initIndex(i);
		}
	}

	updateTournamentList() {
		// console.log("updateTournamentList");
		// this.rebuyFilterNode.active = true;
		// this.reentryFilterNode.active = true;
		if (this.allFilterNode) this.allFilterNode.active = true;
		this.nlhFilterNode.active = true;
		this.ploFilterNode.active = true;
		// this.buyinFilterNode.active = true;
		// this.upcomingFilterNode.active = true;
		// this.registrationFilterNode.active = true;
		// this.runningFilterNode.active = true;
		// this.lateRegistrationFilterNode.active = true;
		// this.completedFilterNode.active = true;

		// this.rebuyFilterNode.getChildByName("checkmark").active = false;
		// this.reentryFilterNode.getChildByName("checkmark").active = false;
		this.nlhFilterNode.getChildByName("checkmark").active = false;
		this.ploFilterNode.getChildByName("checkmark").active = false;
		// this.buyinFilterNode.getChildByName("checkmark").active = false;
		// this.upcomingFilterNode.getChildByName("checkmark").active = false;
		// this.registrationFilterNode.getChildByName("checkmark").active = false;
		// this.runningFilterNode.getChildByName("checkmark").active = false;
		// this.lateRegistrationFilterNode.getChildByName("checkmark").active = false;
		// this.completedFilterNode.getChildByName("checkmark").active = false;


		if (!GameManager.isMobile && this.selectedTableDetailsTour) {
			// this.selectedTableDetailsTour.active = false;
			// this.selectedTableDetails.active = false;
		}
		let count = 0;

		// if (TournamentLobbyListPresenter.formatAllFilter) {
		// 	this.rebuyFilterNode.getChildByName("checkmark").active = true;
		// 	this.reentryFilterNode.getChildByName("checkmark").active = true;
		// 	count += 2;
		// } else {
		// 	if (TournamentLobbyListPresenter.rebuyFilter) {
		// 		this.rebuyFilterNode.getChildByName("checkmark").active = true;
		// 		count += 1;
		// 	}
		// 	if (TournamentLobbyListPresenter.reentryFilter) {
		// 		this.reentryFilterNode.getChildByName("checkmark").active = true;
		// 		count += 1;
		// 	}
		// }

		// if (TournamentLobbyListPresenter.typeAllFilter) {
		// 	this.nlhFilterNode.getChildByName("checkmark").active = true;
		// 	this.ploFilterNode.getChildByName("checkmark").active = true;
		// 	count += 2;
		// } else {
		if (TournamentLobbyListPresenter.nlhFilter) {
			this.nlhFilterNode.getChildByName("checkmark").active = true;
			count += 1;
		}
		if (TournamentLobbyListPresenter.ploFilter) {
			this.ploFilterNode.getChildByName("checkmark").active = true;
			count += 1;
		}

		this.updateMyTournament();
	}

	private _tourIdOf(info: any): string {
		if (!info) return "";
		return String(info._id || info.id || "");
	}

	// Updates an existing tile in place (matched by tournamentId) or creates a new
	// one if none exists yet. Does NOT remove tiles for tournaments missing from
	// `data` — closed/cancelled tournaments are removed separately via the
	// dedicated Tournament:Removed / onTournamentRemoved flow, not here.
	private _addOrUpdate(holder: cc.Node, tournamentId: string, tournamentInfo: any): void {
		if (!holder || !tournamentId) return;
		for (let i = 0; i < holder.children.length; i++) {
			const child = holder.children[i];
			if (child === this.tournamentItem) continue;
			const comp = child.getComponent(TournamentLobbyListItem);
			if (this._tourIdOf(comp && comp.tourItemInfo) === String(tournamentId)) {
				comp.initInfo(tournamentInfo);
				return;
			}
		}
		const instance = cc.instantiate(this.tournamentItem);
		instance.setPosition(0, 0);
		instance.active = true;
		holder.insertChild(instance, 0);
		instance.getComponent(TournamentLobbyListItem).initInfo(tournamentInfo);
	}

	createTournamentList(data: any) {
		try {
			// console.log("[CTL] Res-GetAllTournamentList createTournamentList called, keys:", Object.keys(data || {}).length);

			// Clean up inactive editor-placed template/placeholder nodes baked directly
			// into these holders (no valid tourItemInfo — never went through
			// initInfo()). The old removeAllChildren() used to wipe these out
			// implicitly on every call. this.tournamentItem itself lives under
			// ScrollView directly, not inside these holders, but the `!== this.tournamentItem`
			// guard in _addOrUpdate/here is kept as a defensive safety net regardless.
			const _holders = [this.contentHolderAll, this.contentHolderKCoin, this.contentHolderNFT];
			_holders.forEach(holder => {
				// console.log("[CTL] Res-GetAllTournamentList foreach1");
				for (let i = holder.children.length - 1; i >= 0; i--) {
					const child = holder.children[i];
					if (child === this.tournamentItem) {
						console.log("[CTL] Res-GetAllTournamentList continue");
						continue;
					}
					// console.log("[CTL] Res-GetAllTournamentList foreach2");
					const comp = child.getComponent(TournamentLobbyListItem);
					// if (!comp?.tourItemInfo) {
					// 	console.log("[CTL] Res-GetAllTournamentList foreach3");
					// 	child.removeFromParent(true);
					// }
					// else {
					// 	console.log("[CTL] Res-GetAllTournamentList foreach4");
					// }
					child.removeFromParent(true);
				}
			});

			for (let tournamentId in data) {
				const tournamentInfo = data[tournamentId];
				// The dict key (e.g. "_6a69...") is prefixed with an underscore and does
				// NOT match tournamentInfo._id (e.g. "6a69...") — always match tiles by
				// the tournament's own _id, not the object key, or every refresh creates
				// a duplicate tile instead of finding the one it already made.
				const _tourId = tournamentInfo._id || tournamentId;
				const _tourType = tournamentInfo.tournamentType || tournamentInfo.gameType || "";
				try {
					// console.log("[CTL] Res-GetAllTournamentList _addOrUpdate");
					this._addOrUpdate(this.contentHolderAll, _tourId, tournamentInfo);
					if (_tourType !== "freeRoll" && _tourType !== "FREEROLL") {
						this._addOrUpdate(this.contentHolderKCoin, _tourId, tournamentInfo);
					} else {
						this._addOrUpdate(this.contentHolderNFT, _tourId, tournamentInfo);
					}
				} catch (itemErr) {
					console.error(`%c[CTL] ERROR on tournamentId: ${tournamentId}`, 'color: white; background-color: red; font-size: 14px;', itemErr, (itemErr as any)?.stack);
				}
			}

			this.tourAllList = this.contentHolderAll.children.map(n => n.getComponent(TournamentLobbyListItem));
			this.tourList = this.contentHolderKCoin.children.map(n => n.getComponent(TournamentLobbyListItem));
			this.tourNFTList = this.contentHolderNFT.children.map(n => n.getComponent(TournamentLobbyListItem));

			// console.log("[CTL] done — All:", this.contentHolderAll.children.length, "NFT:", this.contentHolderNFT.children.length, "KCoin:", this.contentHolderKCoin.children.length);
			this.refreshIndex();
			this.updateTournamentList();
			this.updateTablesFilterType();
			// console.log("[CTL] after filter — All active:", this.contentHolderAll.children.filter(c => c.active).length);
		} catch (error) {
			console.error("[CTL] FATAL createTournamentList error:", error);
		}
	}

	private _toStartMs(raw: any): number {
		const v = raw && raw.tournamentStartTime;
		if (!v) return 0;
		const n = Number(v);
		if (!isNaN(n) && n > 0) return n > 9999999999 ? n : n * 1000;
		const ms = new Date(String(v)).getTime();
		return ms || 0;
	}

	private _isRegistered(raw: any): boolean {
		if (!raw) return false;
		if (raw.playerStatus === 'REGISTERED') return true;
		if (raw.playerData && raw.playerData.status !== 'ELIMINATED') return true;
		return false;
	}

	sortByTimeAsc(node: cc.Node) {
		const children = node.children;
		if (!children || children.length === 0) return;
		const sortedChildren = [...children];
		sortedChildren.sort((a, b) => {
			const compA = a.getComponent(TournamentLobbyListItem).tourItemInfo;
			const compB = b.getComponent(TournamentLobbyListItem).tourItemInfo;
			const regDiff = (this._isRegistered(compB) ? 1 : 0) - (this._isRegistered(compA) ? 1 : 0);
			if (regDiff !== 0) return regDiff;
			return this._toStartMs(compA) - this._toStartMs(compB);
		});
		for (let i = 0; i < sortedChildren.length; i++) sortedChildren[i].setSiblingIndex(i);
	}

	sortByTimeDesc(node: cc.Node) {
		const children = node.children;
		if (!children || children.length === 0) return;
		const sortedChildren = [...children];
		sortedChildren.sort((a, b) => {
			const compA = a.getComponent(TournamentLobbyListItem).tourItemInfo;
			const compB = b.getComponent(TournamentLobbyListItem).tourItemInfo;
			const regDiff = (this._isRegistered(compB) ? 1 : 0) - (this._isRegistered(compA) ? 1 : 0);
			if (regDiff !== 0) return regDiff;
			return this._toStartMs(compB) - this._toStartMs(compA);
		});
		for (let i = 0; i < sortedChildren.length; i++) sortedChildren[i].setSiblingIndex(i);
	}

	sortByBuyinAsc(node: cc.Node) {
		const children = node.children;
		if (!children || children.length === 0) return;
		const sortedChildren = [...children];
		sortedChildren.sort((a, b) => {
			const compA = a.getComponent(TournamentLobbyListItem).tourItemInfo;
			const compB = b.getComponent(TournamentLobbyListItem).tourItemInfo;
			const regDiff = (this._isRegistered(compB) ? 1 : 0) - (this._isRegistered(compA) ? 1 : 0);
			if (regDiff !== 0) return regDiff;
			const feeA = (compA.entryFees || 0) + (compA.houseFees || 0);
			const feeB = (compB.entryFees || 0) + (compB.houseFees || 0);
			return feeA - feeB;
		});
		for (let i = 0; i < sortedChildren.length; i++) sortedChildren[i].setSiblingIndex(i);
	}

	sortByBuyinDesc(node: cc.Node) {
		const children = node.children;
		if (!children || children.length === 0) return;
		const sortedChildren = [...children];
		sortedChildren.sort((a, b) => {
			const compA = a.getComponent(TournamentLobbyListItem).tourItemInfo;
			const compB = b.getComponent(TournamentLobbyListItem).tourItemInfo;
			const regDiff = (this._isRegistered(compB) ? 1 : 0) - (this._isRegistered(compA) ? 1 : 0);
			if (regDiff !== 0) return regDiff;
			const feeA = (compA.entryFees || 0) + (compA.houseFees || 0);
			const feeB = (compB.entryFees || 0) + (compB.houseFees || 0);
			return feeB - feeA;
		});
		for (let i = 0; i < sortedChildren.length; i++) sortedChildren[i].setSiblingIndex(i);
	}

	sortByPrizeDesc(node: cc.Node) {
		const children = node.children;
		if (!children || children.length === 0) return;
		const sortedChildren = [...children];
		sortedChildren.sort((a, b) => {
			const compA = a.getComponent(TournamentLobbyListItem).tourItemInfo;
			const compB = b.getComponent(TournamentLobbyListItem).tourItemInfo;
			const regDiff = (this._isRegistered(compB) ? 1 : 0) - (this._isRegistered(compA) ? 1 : 0);
			if (regDiff !== 0) return regDiff;
			return (compB.guaranteedValue || 0) - (compA.guaranteedValue || 0);
		});
		for (let i = 0; i < sortedChildren.length; i++) sortedChildren[i].setSiblingIndex(i);
	}

	onTournamentTurnBroadcast(data: any) {
		// console.log("onTournamentTurnBroadcast", data);

		if (ScreenManager.currentScreen == K.ScreenEnum.GamePlayScreen) {
			return;
		}

		let tourData = null;
		for (let i = 0; i < this.tourList.length; i++) {
			// console.log("this.tourList", this.tourList[i].tourItemInfo);
			if (data.eventData.tournamentId == this.tourList[i].tourItemInfo._id) {
				tourData = this.tourList[i].tourItemInfo;
				break;
			}
		}
		if (!tourData) {
			for (let i = 0; i < this.tourSitNGoList.length; i++) {
				// console.log("this.tourSitNGoList", this.tourSitNGoList[i].tourItemInfo);
				if (data.eventData.tournamentId == this.tourSitNGoList[i].tourItemInfo._id) {
					tourData = this.tourSitNGoList[i].tourItemInfo;
					break;
				}
			}
		}

		if (tourData) {
			let target = null;
			// for(let i = 0; i < this.tournamentNotification.children.length; i ++) {
			//     let child = this.tournamentNotification.children[i];
			//     if (child.getComponent("TournamentNotification").data && child.getComponent("TournamentNotification").data.tournamentId == data.eventData.tournamentId) {
			//         target = child;
			//         break;
			//     }
			// }
			// if (!target) {
			//     for(let i = 0; i < this.tournamentNotification.children.length; i ++) {
			//         let child = this.tournamentNotification.children[i];
			//         if (child.getComponent("TournamentNotification").data == null) {
			//             target = child;
			//             break;
			//         }
			//     }
			// }

			// if (target) {
			//     target.getComponent("TournamentNotification").setData(data, tourData, 0);
			//     target.getComponent("TournamentNotification").show();
			// }
		}
	}

	onTournamentGameStart(broadcastData: any) {
		console.log("[TGS-Presenter] onTournamentGameStart received:", broadcastData);
		if (!broadcastData || !broadcastData.forceJoin) {
			console.warn("[TGS-Presenter] forceJoin missing — skipping");
			return;
		}

		// Set tableStartTime early so TournamentAboutToStart component shows countdown in game screen
		if (broadcastData.gameStartsIn != null && broadcastData.gameStartsIn > 0) {
			GameManager.tableStartTime = Date.now() + (broadcastData.gameStartsIn * 1000);
			console.log("[TGS-Presenter] tableStartTime set to:", GameManager.tableStartTime, "from gameStartsIn:", broadcastData.gameStartsIn);
		} else {
			GameManager.tableStartTime = 0;
		}

		if (!GameManager.isActive) {
			console.log('!onJoinNewTableonJoinNewTableonJoinNewTable');
			return;
		}

		// tournamentGameStart.tableId = the tournament's _id (confirmed from logs)
		const channelId = broadcastData.channelId;
		const tournamentId = broadcastData.tableId;
		console.log("[TGS-Presenter] tournamentId:", tournamentId, "channelId:", channelId);


		// Check if already inside the game
		const activeModels = (window as any).GameManager?.gameModel?.activePokerModels ?? [];
		for (let i = 0; i < activeModels.length; i++) {
			const m = activeModels[i];
			if (m?.gameData?.tournamentId === tournamentId || m?.gameData?.channelId === channelId) {
				console.log("[TGS-Presenter] already in game at index", i, "— navigating");
				const popup = cc.find("Canvas/TournamentLobbyDetail");
				if (popup) popup.active = false;
				GameManager.popUpManager.hideAllPopUps();
				(window as any).ScreenManager.showScreen((window as any).K?.ScreenEnum?.GamePlayScreen, i, () => { });
				return;
			}
		}

		// Find tourData for the game screen
		let tourData: any = null;
		for (const item of [...this.tourList, ...this.tourAllList]) {
			if (item?.tourItemInfo?._id === tournamentId) { tourData = item.tourItemInfo; break; }
		}
		console.log("[TGS-Presenter] tourData found:", !!tourData);

		// Show notification
		if (broadcastData.info) {
			console.log("[TGS-Presenter] showing notification:", broadcastData.info);
			GameManager.popUpManager.show(PopUpType.NotificationPopup, broadcastData.info, function () { });
		}

		// Use TournamentSocket for both request and response (fixes main-socket mismatch)
		cc.systemEvent.once("enterChannelResponse", (resData: any) => {
			console.log("[TGS-Presenter] enterChannelResponse success:", resData?.success, "tourId:", resData?.tournamentId, "expected:", tournamentId);
			if (!resData?.success) {
				if (resData.isMaxTable == true) {
					GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
				}
				return;
			}
			if (resData.tournamentId && resData.tournamentId !== tournamentId) {
				console.warn("[TGS-Presenter] tournamentId mismatch — skipping");
				return;
			}
			if (!resData.antibanking) resData.antibanking = { isAntiBanking: false, amount: 0, timeRemains: 0 };
			if (!resData.playerName) resData.playerName = GameManager?.user?.userName || "";
			try {
				let gameData = resData;
				const _rawTour3 = tourData;
				if (_rawTour3 && !_rawTour3.isInBreak && _rawTour3.currentTournamentBreak?.breakEndTime) {
					_rawTour3.isInBreak = true;
					_rawTour3.currentBreakDetails = { breakEndTime: _rawTour3.currentTournamentBreak.breakEndTime };
				}
				gameData.tourData = tourData;
				const popup = cc.find("Canvas/TournamentLobbyDetail");
				if (popup) popup.active = false;
				GameManager.popUpManager.hideAllPopUps();
				(window as any).ScreenManager.showScreen((window as any).K?.ScreenEnum?.GamePlayScreen, gameData, () => { });
				console.log("[TGS-Presenter] showScreen called");
			} catch (e) {
				console.error("[TGS-Presenter] showScreen error:", e);
			}
		});

		console.log("[TGS-Presenter] sending enterTable request for tournamentId:", tournamentId);
		(window as any).TournamentServerCom.socketIORequest(
			"tournamentGameEvent|enterTable",
			{ tournamentId },
			() => { },
			null, 5000, false
		);
	}

	onJoinNewTable(data: any) {

		console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', data);

		// data = { tournamentId, playerId, tableId } — flat, emitted on player's personal channel
		console.log("[JNT] onJoinNewTable received:", data);
		if (!data || !data.tableId || !data.tournamentId) {
			console.warn("[JNT] missing tableId or tournamentId — skipping");
			console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'missing tableId or tournamentId — skipping');
			return;
		}

		console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'emit onJoinNewTable');
		GameManager.emit("onJoinNewTable", data.tournamentId);
		const channelId = data.tableId;
		const tournamentId = data.tournamentId;

		// Already inside this exact channel — just navigate (same tableId means already joined)
		const activeModels = (window as any).GameManager?.gameModel?.activePokerModels ?? [];
		console.log("[JNT] activeModels count:", activeModels.length);
		console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'activeModels count: ' + activeModels.length);

		for (let i = 0; i < activeModels.length; i++) {
			const m = activeModels[i];
			console.log("[JNT] model[" + i + "] channelId:", m?.gameData?.channelId, "tournamentId:", m?.gameData?.tournamentId);

			console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'model: ' + m?.gameData?.channelId + ' ' + m?.gameData?.tournamentId);

			if (m?.gameData?.channelId === channelId) {
				console.log("[JNT] already on this exact table at index", i, "— navigating only");
				console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'already on this exact table at index');

				const popup = cc.find("Canvas/TournamentLobbyDetail");
				if (popup) popup.active = false;
				GameManager.popUpManager.hideAllPopUps();
				(window as any).ScreenManager.showScreen((window as any).K?.ScreenEnum?.GamePlayScreen, i, () => { });
				return;
			}
		}

		// Find tourData from list
		let tourData: any = null;
		for (const item of [...this.tourList, ...this.tourAllList]) {
			if (item?.tourItemInfo?._id === tournamentId) { tourData = item.tourItemInfo; break; }
		}
		console.log("[JNT] tourData found:", !!tourData);

		console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'tourData found', tourData);

		// Same raw joinChannel pattern as TablesHandler.onTableArrowClick — backend confirmed
		// the move uses room.channelHandler.joinChannel, not tournamentGameEvent|enterTable.
		const rawSocket = (window as any).TournamentSocket;
		if (!rawSocket) {
			console.warn("[JNT] TournamentSocket not available — cannot join new table");
			console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'TournamentSocket not available — cannot join new table');
			return;
		}

		if (typeof rawSocket.prependAny === "function") {
			const _joinHandler = (event: string, response: any) => {
				if (event !== "commonEventResponse" || response?.eventOrigin !== "room.channelHandler.joinChannel") return;
				rawSocket.offAny(_joinHandler);

				console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', '_joinHandler', response);

				console.log("[JNT] joinChannel response:", response);
				const res = response?.data;
				if (!res?.success) {
					console.warn("[JNT] joinChannel failed:", res);
					GameManager.popUpManager.show(PopUpType.MaxTablesJoinedPopup, null, function () { });
					return;
				}
				let gameData = res;
				if (!res.antibanking) res.antibanking = { isAntiBanking: false, amount: 0, timeRemains: 0 };
				if (!res.playerName) res.playerName = GameManager?.user?.userName || "";
				gameData.channelId = channelId;
				gameData.tourData = tourData;
				try {
					// Reuse existing game slot if player was already at a table for this tournament
					let existingIndex = -1;
					for (let i = 0; i < activeModels.length; i++) {
						if (activeModels[i]?.gameData?.tournamentId === tournamentId) {
							existingIndex = i;
							break;
						}
					}
					if (existingIndex !== -1) {
						gameData.isRejoin = true;
						gameData.indexFound = existingIndex;
					}

					gameData.__isReshuffle = true;

					console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', '_joinHandler showScreen', existingIndex);

					const popup = cc.find("Canvas/TournamentLobbyDetail");
					if (popup) popup.active = false;
					GameManager.popUpManager.hideAllPopUps();
					(window as any).ScreenManager.showScreen((window as any).K?.ScreenEnum?.GamePlayScreen, gameData, () => { });
					console.log("[JNT] showScreen called, existingIndex:", existingIndex);

				} catch (e) {
					console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', '_joinHandler error', e);
					// console.error("[JNT] showScreen error:", e);
				}
			};
			rawSocket.prependAny(_joinHandler);
		}
		else {
			console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'rawSocket.prependAny error');
		}

		console.log("[JNT] emitting joinChannel for new channelId:", channelId, "tournamentId:", tournamentId);

		console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'ready to joinChannel for new channelId: ' + channelId + ' ' + tournamentId);

		if (data.isReshuffling) {
			setTimeout(() => {
				console.log("[JNT] emitting joinChannel for new channelId: Delayed", channelId, "tournamentId:", tournamentId);
				console.log('[Reshuffle]', 'TournamentLobbyListPresenter/onJoinNewTable', 'emit joinChannel for new channelId: ' + channelId + ' ' + tournamentId);
				rawSocket.emit("common", {
					eventName: "room.channelHandler.joinChannel",
					data: {
						playerId: data.playerId,
						channelId,
						channelType: "TOURNAMENT",
						isRequested: true,
						tableId: "",
						isPrivateTable: "false",
						playerName: GameManager.user?.userName || "",
						networkIp: (window as any).LoginData?.ipV4Address || "",
						isRejoin: false,
						maxPlayers: 2,
					}
				});
			}, 3000);
		}
		else {
			rawSocket.emit("common", {
				eventName: "room.channelHandler.joinChannel",
				data: {
					playerId: data.playerId,
					channelId,
					channelType: "TOURNAMENT",
					isRequested: true,
					tableId: "",
					isPrivateTable: "false",
					playerName: GameManager.user?.userName || "",
					networkIp: (window as any).LoginData?.ipV4Address || "",
					isRejoin: false,
					maxPlayers: 2,
				}
			});
		}
	}

	createTournamentSitNGoList(data) {
	}

	removeHighlightAll() {
		this.tourList.forEach((t) => {
			t.setHighlight(false);
		});
		this.tourNFTList.forEach((t) => {
			t.setHighlight(false);
		});
		this.tourSitNGoList.forEach((t) => {
			t.setHighlight(false);
		});
		this.tourAllList.forEach((t) => {
			t.setHighlight(false);
		});
	}

	//
	onTournamentList(data: any) {
		console.log("%c onTournamentList : ", "color: red; background-color: green;", data);
		if (data.eventName === "Res-GetUserProfile") {
			if (data && data.data && data.data.response) {
				// console.log("Res-GetUserProfile");
			}
		} else if (data.eventName === "Res-GetAllTournamentList") {
			if (data && data.data && data.data.response) {
				console.log("Res-GetAllTournamentList : ", data.data.response);
				// this.tournamentData = data.data.response;
				this.isInitDone = true;
				this.createTournamentList(data.data.response);
				//
				// (window as any).TournamentLobbyHandler.requestTournamentSitAndGoStages(
				// 	{},
				// 	(data) => {
				// 		// console.log("requestTournamentLobbyList okokok");
				// 		// this.createTournamentList( this.tournamentData );
				// 	},
				// 	(error) => { }
				// );
			}
		} else if (data.eventName === "Res-GetSitNGoStages") {
			if (data && data.data && data.data.response) {
				console.log("Res-GetSitNGoStages");

				this.isInitDone = true;
				this.createTournamentSitNGoList(data.data.response);

				// this.animate(0.02);
			}
		}
	}

	onTournamentLobbyEvent(data) {
		// console.log("onTournamentLobbyEvent");
	}

	onRealChipsUpdate(data: any) {
		console.log("[TLL] onRealChipsUpdate", data);
		const chips = data?.data?.realChips ?? data?.realChips;
		if (chips == null) return;
		GameManager.user.realChips = chips;
		GameManager.emit("refreshPlayerChips");
	}

	onTournamentUpdated(data) {
		console.log(">>>>>>>>>> onTournamentUpdated in lobby", data);

		if (data?.eventName == "TournamentBlindUpdate") {
			const tournamentId = data.tournamentId;
			if (window.TournamentLobbyListPresenter.hasAddOnBreakAtLevel(data.tournamentId, data.data.level)) {
				this.scheduleOnce(() => {
					GameManager.emit('Tournament:Update', data);
				}, 0.5);
			}
			else {
				GameManager.emit('Tournament:Update', data);
			}
		}
		else {
			GameManager.emit('Tournament:Update', data);
		}

		if (data?.eventName === "realChipsUpdate") {
			this.onRealChipsUpdate(data);
			return;
		}
		if (data?.eventName !== "TournamentBlindUpdate" || !data.data) return;
		const tournamentId = data.tournamentId;
		if (!tournamentId) return;
		if (this.tournamentInfoHandler?.node?.active) {
			const _infoTour = (this.tournamentInfoHandler as any)._tourData;
			const _infoId = _infoTour?.id ?? _infoTour?._id;
			if (_infoId && _infoId === tournamentId) {
				const raw = _infoTour;
				if (raw) raw.currentBlindLevel = data.data;

				if (window.TournamentLobbyListPresenter.hasAddOnBreakAtLevel(data.tournamentId, data.data.level)) {
					this.scheduleOnce(() => {
						(this.tournamentInfoHandler as any).detailsHandler?.setData(_infoTour);
					}, 0.1);
				}
				else {
					(this.tournamentInfoHandler as any).detailsHandler?.setData(_infoTour);
				}
			}
		}
	}

	onTournamentAddOn(data) {
		console.log('onTournamentAddOn', data);
		// 
		if (data.eventType == 'TournamentAddonPeriodStart') {
			GameManager.emit('TournamentAddonPeriodStart', data);
		}
		else if (data.eventType == 'TournamentAddonPeriodOver') {
			GameManager.emit('TournamentAddonPeriodOver', data);
		}
	},

	onTournamentStartingSoon(data) {
		console.log('onTournamentStartingSoon', data);
		// 
		GameManager.popUpManager.show(PopUpType.TournamentStartingSoonPopup, data, function () { });
	},

	onTournamentListUpdate(arg1: any, arg2?: any) {
		const data = (arg1 && arg1.tournamentId) ? arg1 : (arg2 && arg2.tournamentId) ? arg2 : null;
		if (!data) return;
		const tournamentId = data.tournamentId;
		const updated = data.updated;
		if (!tournamentId || !updated) return;
		console.log("onTournamentListUpdate", tournamentId, updated);

		if (updated.state === "CANCELED" || updated.state === "CANCELLED") {
			const successNode = cc.find("Canvas/Tournament/TournamentRegistrationSucces");
			if (successNode && successNode.active) successNode.active = false;
		}

		let found = false;
		const holders = [this.contentHolderAll, this.contentHolderKCoin, this.contentHolderNFT];
		holders.forEach(holder => {
			if (!holder) return;
			for (let i = 0; i < holder.children.length; i++) {
				const comp = holder.children[i].getComponent(TournamentLobbyListItem);
				if (!comp || !comp.tourItemInfo) continue;
				if (this._tourIdOf(comp.tourItemInfo) !== String(tournamentId)) continue;
				found = true;
				Object.assign(comp.tourItemInfo, updated);
				if (updated.enrolledPlayers !== undefined) {
					comp.tourItemInfo.registeredCount = updated.enrolledPlayers;
				}
				comp.initInfo(comp.tourItemInfo);
			}
		});

		if (!found) {
			console.log('[TLU] not found, refreshing list:', tournamentId);
			(window as any).TournamentLobbyHandler.requestTournamentLobbyList({}, () => { }, () => { });
		}

		// auto-update info popup if open for this tournament
		if (GameManager.isMobile && this.tournamentInfoHandler?.node?.active) {
			const _infoTour = (this.tournamentInfoHandler as any)._tourData;
			const _infoId = _infoTour?.id ?? _infoTour?._id ?? _infoTour?._id;
			if (_infoId && _infoId === tournamentId) {
				(window as any).TournamentLobbyHandler.requestTournamentData({ tournamentId }, () => { }, () => { });
			}
		}
	}

	onTournamentClosed(data) {
		// console.log("onTournamentUpdated");
		this.onTournamentRefresh(data);
	}

	onTournamentRemoved(data) {
		if (!this.isInitDone) {
			return;
		}
		let isFound = false;
		const removedId = String(data.tournamentId || data._id || "");
		for (var i = 0; i < this.contentHolderAll.children.length; i++) {
			let instance = this.contentHolderAll.children[i];
			let tourItemInfo = instance.getComponent(TournamentLobbyListItem).tourItemInfo;
			if (removedId && removedId === this._tourIdOf(tourItemInfo)) {
				isFound = true;
				this.contentHolderAll.children[i].removeFromParent(true);
			}
		}
		if (GameManager.isMobile && this.tournamentInfoHandler?.node?.active) {
			const _infoTour = (this.tournamentInfoHandler as any)._tourData;
			const _infoId = _infoTour?.id ?? _infoTour?._id ?? _infoTour?._id;
			if (_infoId && _infoId === data.tournamentId) {
				this.tournamentInfoHandler.onClose();
			}
		}

		if (isFound) {
			// update
			for (var i = 0; i < this.contentHolderKCoin.children.length; i++) {
				let instance = this.contentHolderKCoin.children[i];
				let tourItemInfo = instance.getComponent(TournamentLobbyListItem).tourItemInfo;
				if (removedId && removedId === this._tourIdOf(tourItemInfo)) {
					this.contentHolderKCoin.children[i].removeFromParent(true);
					break;
				}
			}
			for (var i = 0; i < this.contentHolderNFT.children.length; i++) {
				let instance = this.contentHolderNFT.children[i];
				let tourItemInfo = instance.getComponent(TournamentLobbyListItem).tourItemInfo;
				if (removedId && removedId === this._tourIdOf(tourItemInfo)) {
					this.contentHolderNFT.children[i].removeFromParent(true);
					break;
				}
			}
		}
		this.updateEmptyLabel();
	}

	updateEmptyLabel() {
		if (this.contentHolderAll.active) {
			this.emptyList.active = (this.contentHolderAll.children.length <= 0 || !this.contentHolderAll.children.some(child => child.active));
		}
		else if (this.contentHolderKCoin.active) {
			this.emptyList.active = (this.contentHolderKCoin.children.length <= 0 || !this.contentHolderKCoin.children.some(child => child.active));
		}
		else if (this.contentHolderNFT.active) {
			this.emptyList.active = (this.contentHolderNFT.children.length <= 0 || !this.contentHolderNFT.children.some(child => child.active));
		}
	}

	onTournamentRefresh(data) {
		if (!this.isInitDone) {
			return;
		}
		cc.systemEvent.emit(K.SocketIOEvent.Lobby.TournamentRefresh, data);
		console.log(">>>>>>>>>> onTournamentRefresh in lobby");
		//
		let isFound = false;
		const refreshId = this._tourIdOf(data);
		const holdersToScan = [this.contentHolderAll, this.contentHolderKCoin, this.contentHolderNFT];
		for (let h = 0; h < holdersToScan.length; h++) {
			const holder = holdersToScan[h];
			if (!holder) continue;
			for (var i = 0; i < holder.children.length; i++) {
				let tourItemInfo = holder.children[i].getComponent(TournamentLobbyListItem).tourItemInfo;
				if (refreshId && refreshId === this._tourIdOf(tourItemInfo)) {
					isFound = true;
					break;
				}
			}
			if (isFound) break;
		}

		if (!isFound && data.tournamentName) {
			const _tourId = refreshId || data._id || data.id;
			const _tourType = data.tournamentType || data.gameType || "";
			if (_tourType != "SIT N GO") {
				this._addOrUpdate(this.contentHolderAll, _tourId, data);
				if (_tourType !== "freeRoll" && _tourType !== "FREEROLL") {
					this._addOrUpdate(this.contentHolderKCoin, _tourId, data);
				} else {
					this._addOrUpdate(this.contentHolderNFT, _tourId, data);
				}
			} else {
				this._addOrUpdate(this.contentHolderAll, _tourId, data);
			}
		} else {
			// re-fetch full list so all items get fresh playerStatus, state, late reg etc.
			(window as any).TournamentLobbyHandler.requestTournamentLobbyList({}, () => { }, () => { });
		}

		// TournamentInfoHandler._onTournamentRefresh handles itself via requestTournamentData
		// Res-GetTournamentData handler (line ~1594) calls tournamentInfoHandler.show(freshData) with full playerData

		this.updateTablesFilterType(true);
	}

	updateMyTournament() {
	},

	animate(interval = 0.05) {
		// for (let i = 0; i < this.scrollView.content.children.length; i++) {
		// 	let child = this.scrollView.content.children[i];
		// 	child.opacity = 0;
		// 	this.scheduleOnce(() => {
		// 		child.opacity = 255;
		// 		if (GameManager.isMobile) {
		// 			child.x = 1000;
		// 			child.runAction(
		// 				cc.sequence(
		// 					cc.moveTo(0.2, cc.v2(0, child.y)),
		// 					cc.callFunc(() => {
		// 						// child.x = 0;
		// 						console.log("animate done");
		// 					})
		// 				)
		// 			);
		// 		} else {
		// 			child.x = 0;
		// 		}
		// 	}, interval * i);
		// }
	}

	onShowAll() {
		if (this.curTab == TOURNAMENT_TYPE.ALL) {
			return;

		}
		if (!GameManager.isMobile && this.selectedTableDetails) {
			this.selectedTableDetails.active = false;
			this.removeHighlightAll();
		}
		if (!GameManager.isMobile && this.selectedTableDetailsTour) {
			this.selectedTableDetailsTour.active = false;
		}
		if (this.lockClick) {
			return;
		}
		this.lockClick = true;
		this.scheduleOnce(() => {
			this.lockClick = false;
		}, 0.1);

		if (GameManager.lobbyListType == 2) {
			return;
		}

		this.allTabNode.getChildByName("pressed").active = false;
		this.allTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		this.mttTabNode.getChildByName("pressed").active = false;
		this.mttTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		this.freerollTabNode.getChildByName("pressed").active = false;
		this.freerollTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");

		this.allTabNode.getChildByName("pressed").active = true;
		this.allTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#531400");

		this.curTab = TOURNAMENT_TYPE.ALL;
		this.contentHolderAll.active = true;
		this.contentHolderKCoin.active = false;
		this.contentHolderNFT.active = false;
		this.scrollView.content = this.contentHolderAll;
		GameManager.playSound(K.Sounds.click);

		this.updateEmptyLabel();

		this.animate();
	}

	onShowTournament() {
		if (this.curTab == TOURNAMENT_TYPE.KCOIN) {
			return;
		}

		if (!GameManager.isMobile && this.selectedTableDetails) {
			this.selectedTableDetails.active = false;
			this.removeHighlightAll();
		}
		if (!GameManager.isMobile && this.selectedTableDetailsTour) {
			this.selectedTableDetailsTour.active = false;
		}
		if (this.lockClick) {
			return;
		}
		this.lockClick = true;
		this.scheduleOnce(() => {
			this.lockClick = false;
		}, 0.1);

		// this.header1.active = true;
		// this.header2.active = false;
		// if (!GameManager.isMobile) {
		//     this.filterLabel.string = "Start time";
		// }
		if (this.gameTypeDropdown) {
			this.gameTypeDropdown.node.parent.active = true;
		}

		this.allTabNode.getChildByName("pressed").active = false;
		this.allTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		this.mttTabNode.getChildByName("pressed").active = false;
		this.mttTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		this.freerollTabNode.getChildByName("pressed").active = false;
		this.freerollTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");

		this.mttTabNode.getChildByName("pressed").active = true;
		this.mttTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#531400");

		// this.refreshSideTable(null);
		this.curTab = TOURNAMENT_TYPE.KCOIN;
		this.contentHolderAll.active = false;
		this.contentHolderKCoin.active = true;
		this.contentHolderNFT.active = false;
		this.scrollView.content = this.contentHolderKCoin;
		GameManager.playSound(K.Sounds.click);

		this.animate();

		this.updateEmptyLabel();
	}

	onShowMyournament() {
	}

	onShowSitNGo() {
	}

	onShowTournamentNFT() {
		if (this.curTab == TOURNAMENT_TYPE.NFT) {
			return;
		}

		if (this.selectedTableDetails) {
			this.selectedTableDetails.active = false;
			this.removeHighlightAll();
		}
		if (this.selectedTableDetailsTour) {
			this.selectedTableDetailsTour.active = false;
		}
		if (this.lockClick) {
			return;
		}
		this.lockClick = true;
		this.scheduleOnce(() => {
			this.lockClick = false;
		}, 0.1);

		// this.refreshSideTable(null);
		this.curTab = TOURNAMENT_TYPE.NFT;
		this.contentHolderAll.active = false;
		this.contentHolderKCoin.active = false;
		this.contentHolderNFT.active = true;
		this.scrollView.content = this.contentHolderNFT;
		GameManager.playSound(K.Sounds.click);

		this.allTabNode.getChildByName("pressed").active = false;
		this.allTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		this.mttTabNode.getChildByName("pressed").active = false;
		this.mttTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		this.freerollTabNode.getChildByName("pressed").active = false;
		this.freerollTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");

		this.freerollTabNode.getChildByName("pressed").active = true;
		this.freerollTabNode.getChildByName("Label").color = new cc.Color().fromHEX("#531400");

		this.animate();

		this.updateEmptyLabel();
	}

	onTournamentLobbyResponseEvent(data) {
		// Register/LateRegister/ReEntry/Deregister ACKs are unreliable under the new
		// tsocket promise-matching (only resolves when eventOrigin === request eventName).
		// Their real outcome arrives here on this broadcast channel instead — relay it
		// so callers (e.g. TournamentRegistrationPopup) can listen via cc.systemEvent.
		if (data.eventName === "Res-Register" || data.eventName === "Res-LateRegister" || data.eventName === "Res-ReEntry" || data.eventName === "Res-Deregister" || data.eventName === "Res-joinLeaderboard" || data.eventName === "Res-leaveLeaderboard" || data.eventName === "Res-GetTournamentData") {
			console.log("[TLP] relaying", data.eventName, data.data);
			cc.systemEvent.emit(data.eventName, data.data);
		}

		if (data.eventName === "Res-Register" && data.data && data.data.success) {
			(window as any).TournamentLobbyHandler.requestTournamentLobbyList({}, () => { }, () => { });
		}
		if (data.eventName === "Res-Deregister" && data.data && data.data.status === "success") {
			(window as any).TournamentLobbyHandler.requestTournamentLobbyList({}, () => { }, () => { });
		}
		if (data.eventName === "Res-GetTournamentData" && data.data && data.data.response) {
			const freshData = data.data.response;
			if (data.data.success) {
				this.onTournamentRefresh(freshData);
				if (this._pendingTourDataForPopup) {
					this._pendingTourDataForPopup = false;
					if (GameManager.isMobile) {
						if (this.tournamentInfoHandler) this.tournamentInfoHandler.show({ ...freshData, raw: freshData, id: freshData._id });
					} else {
						this.refreshSideTable(freshData);
					}
				} else if (GameManager.isMobile && this.tournamentInfoHandler?.node?.active) {
					const _infoTour = (this.tournamentInfoHandler as any)._tourData;
					const _infoId = _infoTour?.id ?? _infoTour?._id ?? _infoTour?._id;
					if (_infoId && _infoId === freshData._id) {
						this.tournamentInfoHandler.show({ ...freshData, raw: freshData, id: freshData._id });
					}
				}
			}
			else {
				if (GameManager.isMobile && this.tournamentInfoHandler?.node?.active) {
					this.tournamentInfoHandler.onClose();
				}
			}
		}
	},

	onAll() {
		this.typeFilter = 0;
		// this.setActiveButton(this.tabBtns[0], this.tabBtns[this.currentTab]);
		this.updateTablesFilterType();
		this.currentTab = 0;
	}
	onAllSNG() {
		this.typeFilterSNG = 0;
		TournamentLobbyListPresenter.typeAllFilter = true;
		TournamentLobbyListPresenter.nlhFilter = false;
		TournamentLobbyListPresenter.ploFilter = false;
		if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = true;
		if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = false;
		if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = false;
		// this.setActiveButton(this.tabBtns2[0], this.tabBtns2[this.currentTabSNG]);
		this.updateTablesFilterType();
		this.currentTabSNG = 0;
	}

	onHolemSNG() {
		this.typeFilterSNG = 1;
		TournamentLobbyListPresenter.typeAllFilter = false;
		TournamentLobbyListPresenter.nlhFilter = true;
		TournamentLobbyListPresenter.ploFilter = false;
		if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = false;
		if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = true;
		if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = false;
		// this.setActiveButton(this.tabBtns2[1], this.tabBtns2[this.currentTabSNG]);
		this.updateTablesFilterType();
		this.currentTabSNG = 1;
	}

	onOhamaSNG() {
		this.typeFilterSNG = 2;
		TournamentLobbyListPresenter.typeAllFilter = false;
		TournamentLobbyListPresenter.nlhFilter = false;
		TournamentLobbyListPresenter.ploFilter = true;
		if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = false;
		if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = false;
		if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = true;
		// this.setActiveButton(this.tabBtns2[2], this.tabBtns2[this.currentTabSNG]);
		this.updateTablesFilterType();
		this.currentTabSNG = 2;
	}

	updateTablesFilterType(isRefresh = false) {
		if (TournamentLobbyListPresenter.timeAsc) {
			this.sortByTimeAsc(this.contentHolderAll);
			this.sortByTimeAsc(this.contentHolderKCoin);
			this.sortByTimeAsc(this.contentHolderNFT);
		} else if (TournamentLobbyListPresenter.timeDesc) {
			this.sortByTimeDesc(this.contentHolderAll);
			this.sortByTimeDesc(this.contentHolderKCoin);
			this.sortByTimeDesc(this.contentHolderNFT);
		} else if (TournamentLobbyListPresenter.buyinAsc) {
			this.sortByBuyinAsc(this.contentHolderAll);
			this.sortByBuyinAsc(this.contentHolderKCoin);
			this.sortByBuyinAsc(this.contentHolderNFT);
		} else if (TournamentLobbyListPresenter.buyinDesc) {
			this.sortByBuyinDesc(this.contentHolderAll);
			this.sortByBuyinDesc(this.contentHolderKCoin);
			this.sortByBuyinDesc(this.contentHolderNFT);
		} else if (TournamentLobbyListPresenter.prizeDesc) {
			this.sortByPrizeDesc(this.contentHolderAll);
			this.sortByPrizeDesc(this.contentHolderKCoin);
			this.sortByPrizeDesc(this.contentHolderNFT);
		}

		for (let i = 0; i < this.contentHolderKCoin.children.length; i++) {
			let child = this.contentHolderKCoin.children[i];
			child.active = true;
			// let tourItemInfo = child.getComponent(TournamentLobbyListItem).tourItemInfo;

			// if (this.typeFilter == 1) {
			// 	if (tourItemInfo.tournamentType != "freeRoll") {
			// 		child.active = false;
			// 	}
			// } else if (this.typeFilter == 2) {
			// 	if (!tourItemInfo.isGtdEnabled) {
			// 		child.active = false;
			// 	}
			// }

			if (child.active) {
				this.filterOne(child);
			}
		}

		for (let i = 0; i < this.contentHolderNFT.children.length; i++) {
			let child = this.contentHolderNFT.children[i];
			child.active = true;
			// let tourItemInfo = child.getComponent(TournamentLobbyListItem).tourItemInfo;

			// if (this.typeFilter == 1) {
			// 	if (tourItemInfo.tournamentType != "freeRoll") {
			// 		child.active = false;
			// 	}
			// } else if (this.typeFilter == 2) {
			// 	if (!tourItemInfo.isGtdEnabled) {
			// 		child.active = false;
			// 	}
			// }

			if (child.active) {
				this.filterOne(child);
			}
		}

		for (let i = 0; i < this.contentHolderAll.children.length; i++) {
			let child = this.contentHolderAll.children[i];
			child.active = true;
			let tourItemInfo = child.getComponent(TournamentLobbyListItem).tourItemInfo;

			if (child.active) {
				this.filterOne(child);
			}
		}
		this.updateEmptyLabel();
	}

	filterOne(child) {
		let tourItemInfo = child.getComponent(TournamentLobbyListItem).tourItemInfo;
		const _name = tourItemInfo.tournamentName || (tourItemInfo && tourItemInfo.tournamentName) || "?";
		const _state = (tourItemInfo && tourItemInfo.state) || tourItemInfo.state || "?";
		const _prevActive = child.active;
		if (!TournamentLobbyListPresenter.formatAllFilter) {
			let fmtHit = false;
			const _raw = tourItemInfo;
			if (TournamentLobbyListPresenter.reentryFilter && _raw && _raw.isReentryAllowed) fmtHit = true;
			if (TournamentLobbyListPresenter.rebuyFilter && _raw && _raw.allowRebuys && !_raw.isAddOn) fmtHit = true;
			if (TournamentLobbyListPresenter.rebuyAddonFilter && _raw && _raw.allowRebuys && _raw.isAddOn) fmtHit = true;
			if (!fmtHit) child.active = false;
		}

		if (TournamentLobbyListPresenter.newStatusActive) {
			let stHit = false;
			const _raw = tourItemInfo;
			const st = (_raw && _raw.state) || tourItemInfo.state || "";
			const playerStatus = _raw && _raw.playerStatus;
			if (TournamentLobbyListPresenter.newStatusRunning && st === "RUNNING") stHit = true;
			if (TournamentLobbyListPresenter.newStatusEnrolled && (st === "Open To Register" || st === "REGISTER") && playerStatus === "REGISTERED") stHit = true;
			if (TournamentLobbyListPresenter.newStatusRegister && (st === "Open To Register" || st === "REGISTER") && playerStatus !== "REGISTERED") stHit = true;
			if (TournamentLobbyListPresenter.newStatusLateRegister && (st === "Open To Late Register" || _raw.lateRegistrationEndTime != "")) stHit = true;
			if (TournamentLobbyListPresenter.newStatusUpcoming && st === "PUBLISHED") stHit = true;
			if (TournamentLobbyListPresenter.newStatusCompleted && (st === "CLOSED" || st === "CANCELED" || st === "CANCELLED" || st === "COMPLETED")) stHit = true;
			if (TournamentLobbyListPresenter.newStatusSpectate && tourItemInfo.btnLabel && tourItemInfo.btnLabel === "Spectate") stHit = true;
			if (!stHit) child.active = false;
		}

		if (!TournamentLobbyListPresenter.typeAllFilter) {
			if (TournamentLobbyListPresenter.nlhFilter) {
				if (tourItemInfo.gameVariation != "NLH") {
					child.active = false;
				}
			}

			if (TournamentLobbyListPresenter.ploFilter) {
				const _ploVariants = ['PLO', 'PLO5', 'PLO6', 'PLO 5', 'PLO 6', 'Omaha', 'Omaha5', 'Omaha6', 'Omaha 5', 'Omaha 6'];
				if (_ploVariants.indexOf(tourItemInfo.gameVariation) === -1) {
					child.active = false;
				}
			}
		}

		if (!TournamentLobbyListPresenter.buyinAllFilter) {
			let fee = (tourItemInfo.entryFees || 0) + (tourItemInfo.houseFees || 0);
			let hit = false;
			if (TournamentLobbyListPresenter.lowFilter) {
				if (fee < 100) {
					hit = true;
				}
			}
			if (TournamentLobbyListPresenter.midFilter) {
				if (fee >= 100 && fee < 1000) {
					hit = true;
				}
			}
			if (TournamentLobbyListPresenter.highFilter) {
				if (fee >= 1000) {
					hit = true;
				}
			}

			if (!hit) {
				child.active = false;
			}
		}

		if (!TournamentLobbyListPresenter.cateAllFilter) {
			let hit = true;
			if (TournamentLobbyListPresenter.upcomingFilter) {
				if (tourItemInfo.state != "PUBLISHED") {
					hit = false;
				}
			}
			else if (TournamentLobbyListPresenter.registrationFilter) {
				if (tourItemInfo.state != "Open To Register") {
					hit = false;
				}
			}
			else if (TournamentLobbyListPresenter.runningFilter) {
				if (tourItemInfo.state != "RUNNING") {
					hit = false;
				}
			}
			else if (TournamentLobbyListPresenter.lateRegistrationFilter) {
				if (tourItemInfo.state != "Open To Late Register") {
					hit = false;
				}
			}
			else if (TournamentLobbyListPresenter.completedFilter) {
				if (tourItemInfo.state != "CLOSED") {
					hit = false;
				}
			}
			if (!hit) {
				child.active = false;
			}
		}


		// console.log("[Filter] filterOne |", _name, "| state:", _state,
		// 	"| was:", _prevActive, "→ now:", child.active);

		if (!GameManager.isMobile && this.selectedTableDetailsTour) {
			// this.selectedTableDetailsTour.active = false;
			// this.selectedTableDetails.active = false;
		}

		if (!GameManager.isMobile) {
			if (child.getComponent(TournamentLobbyListItem).highlightBg.active) {
				if (child.active) {
					this.selectedTableDetailsTour.active = true;
					this.selectedTableDetails.active = true;
				}
				else {
					this.selectedTableDetailsTour.active = false;
					this.selectedTableDetails.active = false;
				}
			}
		}
	}

	onOpenFilter() {
		GameManager.popUpManager.show(PopUpType.TournamentFiltersPopup, {}, function () { });
	}

	onFilter() {
		this.filterTab += 1;
		if (this.filterTab > 2) {
			this.filterTab = 1;
		}
		if (this.filterTab == 1) {
			this.header0.active = true;
			this.header1.active = false;
			this.header2.active = false;
		} else if (this.filterTab == 2) {
			this.header0.active = false;
			this.header1.active = true;
			this.header2.active = false;
		} else if (this.filterTab == 3) {
			this.header0.active = false;
			this.header1.active = false;
			this.header2.active = true;
		}
	}

	onFilterHoldem() { }

	onFilterOmaha() { }

	onFilterAll() { }

	setActiveButton(currBtn, prevBtn) {
		if (prevBtn !== null) {
			// prevBtn.getComponent(cc.Sprite).spriteFrame = this.inactiveSprite;
			prevBtn.getChildByName("pressed").active = false;
			// prevBtn.getChildByName("Label").color = this.inactiveColor;
			prevBtn.getChildByName("Label").color = new cc.Color().fromHEX("#FFFFFF");
		}
		// currBtn.getComponent(cc.Sprite).spriteFrame = this.activeSprite;
		// currBtn.getChildByName("Label").color = this.activeColor;
		currBtn.getChildByName("pressed").active = true;
		currBtn.getChildByName("Label").color = new cc.Color().fromHEX("#531400");
	}

	applyFilter() {
		// let game = this.gameTypeDropdown.getSelection();
		// console.log("game", game);
		this.updateTablesFilterType();
	}

	onSort() {
		GameManager.popUpManager.show(PopUpType.TournamentFiltersPopup, {}, function () { });
	}

	onAllTag() {
		TournamentLobbyListPresenter.typeAllFilter = true;
		TournamentLobbyListPresenter.nlhFilter = false;
		TournamentLobbyListPresenter.ploFilter = false;
		if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = true;
		if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = false;
		if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = false;
		this.onUpdateTournamentFilters();
	}

	onNLHTag() {
		TournamentLobbyListPresenter.typeAllFilter = false;
		TournamentLobbyListPresenter.nlhFilter = true;
		TournamentLobbyListPresenter.ploFilter = false;
		if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = false;
		if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = true;
		if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = false;
		this.onUpdateTournamentFilters();
	}

	onPLOTag() {
		TournamentLobbyListPresenter.typeAllFilter = false;
		TournamentLobbyListPresenter.nlhFilter = false;
		TournamentLobbyListPresenter.ploFilter = true;
		if (this.allFilterNode) this.allFilterNode.getChildByName("checkmark").active = false;
		if (this.nlhFilterNode) this.nlhFilterNode.getChildByName("checkmark").active = false;
		if (this.ploFilterNode) this.ploFilterNode.getChildByName("checkmark").active = true;
		this.onUpdateTournamentFilters();
	}

	hasAddOnBreakAtLevel(tournamentId, level) {
		for (let i = 0; i < this.tourList.length; i++) {
			if (tournamentId == this.tourList[i].tourItemInfo._id) {
				let tourData = this.tourList[i].tourItemInfo;
				const levels: number[] = tourData.addOn ? tourData.addOn.addOnAllowedBlindLevels : [];
				if (level in levels) {
					return true;
				}
				break;
			}
		}
		return false;
	}

}
