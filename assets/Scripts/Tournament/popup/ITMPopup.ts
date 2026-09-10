import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;
const { ccclass } = cc._decorator;

@ccclass
export default class ITMPopup extends PopUpBase {

    onDestroy() {
        this.unschedule(this._autoHide);
    }

    onShow(data) {
        this.unschedule(this._autoHide);
        this.scheduleOnce(this._autoHide, 5);
    }

    _autoHide() {
        GameManager.popUpManager.remove(PopUpType.ITMPopup);
    }
}
