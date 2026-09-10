var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {

        message: {
            default: null,
            type: cc.Label,
        },

        dismissNode: {
            default: null,
            type: cc.Node,
        },

        dismissToggle: {
            default: null,
            type: cc.Toggle,
        },

    },

    _formatISODate: function (isoStr) {
        var d = new Date(isoStr);
        if (isNaN(d.getTime())) return isoStr;
        var now = new Date();
        var isToday = d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) hours = 12;
        var minStr = minutes < 10 ? "0" + minutes : "" + minutes;
        var timeStr = hours + ":" + minStr + " " + ampm;
        if (isToday) return timeStr;
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " " + timeStr;
    },

    _formatMessage: function (msg) {
        if (!msg) return msg;
        var self = this;
        return msg.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, function (match) {
            return self._formatISODate(match);
        });
    },

    onShow: function (data) {
        // data can be a plain string (from LoginScreen) or an object (from broadcasts)
        if (typeof data === "string") {
            data = {
                message: data,
                action: "checkServerStatus"
            };
        }
        this.data = data;

        var rawMsg = this.data.message || this.data.info || "Server is under maintenance.\nPlease come back later.";
        this.message.string = (this.data.action === "tournamentMaintenance") ? this._formatMessage(rawMsg) : rawMsg;
        this.dismissNode.active = false;

        if (this.data.showDismiss) {
            this.dismissNode.active = true;
        }

        var isSticky = !!this.data.sticky;
        var closeNode = cc.find("Background/Close", this.node);
        if (closeNode) closeNode.active = !isSticky;
        var confirmNode = cc.find("Background/ConfirmButton", this.node);
        if (confirmNode) confirmNode.active = !isSticky;
        if (!confirmNode.active) this.message.node.y = 0;


        if (isSticky && GameManager.activeTables) {
            GameManager.activeTables.active = false;
        }
    },

    onLoad: function () { },

    onDismiss: function () { },

    onHide: function () {
        if (GameManager.updateActiveTables) {
            GameManager.updateActiveTables();
        }
    },

    onClose: function () {
        GameManager.popUpManager.remove(PopUpType.MaintenancePopup, function () { });

        if (this.data.showDismiss && this.dismissToggle.isChecked) {
            if (this.data.action === "tournamentMaintenance") {
                GameManager.api_tournament_maintenance_dismiss(this.data.taskId);
            } else {
                GameManager.api_notification_dismiss(this.data.taskId);
            }
        }

        if (this.data.action === "checkServerStatus") {
            GameManager.logout();
        } else if (this.data.action === "tournamentMaintenance") {
            // just close — no logout
        } else if (this.data.action === "warning") {
            if (this.data.logout) {
                ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);

            }
        } else if (this.data.action === "kick") {
            if (this.data.logout) {
                ScreenManager.showScreen(K.ScreenEnum.LobbyScreen, 10, function () { }, false);
            }
        }
    },
})