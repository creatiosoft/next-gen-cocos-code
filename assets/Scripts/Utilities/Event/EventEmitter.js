
/**
 * @classdesc base class for all classes that need events/broadcasts
 * @class EventEmitter
 * @memberof Utilities.Event
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {

    },

    /**
     * Register listener
     * @param {String} event -event Name
     * @param {Callback} fn -Callback to be execute!
     * @memberof Utilities.EventEmitter#
     */
    on: function (event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks[event] = this._callbacks[event] || [])
            .push(fn);
        return this;
    },

    /**
     * Register listener - once (auto removal)
     * @method once 
     * @param {String} event -event Name
     * @param {Callback} fn -Callback to be execute!
     * @memberof Utilitiese.Event.EventEmitter#
     */
    once: function (event, fn) {
        var self = this;
        this._callbacks = this._callbacks || {};

        function on() {
            self.off(event, on);
            fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
    },

    /**
     * Removes all listeners registered in the node
     * @method removeAllListeners
     * @memberof Utilities.Event.EventEmitter#
     */
    removeAllListeners: function () {
        // console.trace("removeAllListeners");
        // all   
        this._callbacks = this._callbacks || {};
        this._callbacks = {};
    },

    /**
     * Removes particular listener || all listeners for particular event
     * @method off
     * @param {String} event -event Name
     * @param {Callback} fn -Callback to be execute!
     * @memberof Utilities.Event.EventEmitter#
     */
    off: function (event, fn) {
        // console.trace("off", event);
        this._callbacks = this._callbacks || {};
        // specific event
        var callbacks = this._callbacks[event];
        if (!callbacks) return this;

        // remove all handlers
        if (1 === arguments.length) {
            delete this._callbacks[event];
            return this;
        }

        // remove specific handler
        var cb;
        // var removed = null;
        for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
                callbacks.splice(i, 1);
                break;
            }
        }
        return this;
    },

    /**
     * Fires the event notifying all the listeners
     * @method emit
     * @param {String} event -event Name
     * @memberof Utilities.Evvent.EventEmitter#
     */
    emit: function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1)
            , callbacks = this._callbacks[event];

        if (callbacks) {
            callbacks = callbacks.slice(0);
            for (var i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
            }
        }
        return this;
    },

    /**
     * @method listeners
     * @param {String} event -event Name
     * @return {array} _callbacks -Returns array of listeners for an event
     * @memberof Utilities.Event.EventEmitter#
     */
    listeners: function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks[event] || [];
    },

    /**
     * @description Checks if event has any listeners
     * @method hasListeners 
     * @param {String} event -event Name
     * @return {bool}
     * @memberof Utilities.Event.EventEmitter#
     */
    hasListeners: function (event) {
        return !!this.listeners(event).length;
    },
});