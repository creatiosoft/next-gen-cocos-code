import { PopUpType } from "../../Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;

const { ccclass, property } = cc._decorator;

@ccclass
export default class RebuyAddOnToast extends PopUpBase {

    onShow(data: any) {
    }
}
