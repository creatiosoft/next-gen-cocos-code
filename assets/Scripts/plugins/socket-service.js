
const SocketService = function() {
    this.promiseData = {};
}

window.SocketService = SocketService;

SocketService.prototype.io = function(host, options) {
    this.socket = io(host, options);
    var self = this;
    this.socket.onAny((event, data) => {
        console.log('[SocketService onAny]', event, data. eventOrigin, data);
        if (event === 'commonEventResponse' && data.eventOrigin == "room.channelHandler.joinChannel") {
            if (self.promiseData[data.eventOrigin + '|' + data.data.channelId]?.resolve) {
                self.promiseData[data.eventOrigin + '|' + data.data.channelId].resolve(data);
            }
            delete self.promiseData[data.eventOrigin + '|' + data.data.channelId];
        }
        else {
            if (event === 'commonEventResponse' && data.eventOrigin == "bombPotTimer") {
                console.log(">>>>>>>>");
            }
            if (event === 'commonEventResponse' && self.promiseData[data.eventOrigin]) {
                if (self.promiseData[data.eventOrigin].resolve) {
                    self.promiseData[data.eventOrigin].resolve(data);
                }
                if (self.promiseData[data.eventOrigin]) {
                    delete self.promiseData[data.eventOrigin];
                }
                else {
                    if (data.data && data.data.channelId) {
                        delete self.promiseData[data.eventOrigin + '|' + data.data.channelId];
                    }
                }
            } else {
                if (typeof self.onAny === 'function') {
                    self.onAny(event,data);
                }
            }
        }
    });
}

// SocketService.prototype.onConnect = function(callback) {
//     this.socket.on("connect",callback);
// }

SocketService.prototype.emit = function(event, data, cb) {
    this.socket.emit(event,data,cb);
    var self =  this;
    let emitPromise = new Promise(function(resolve, reject) {
        if (data.eventName == "room.channelHandler.joinChannel") {
            self.promiseData[data.eventName + "|" + data.data.channelId] = {resolve, reject}
        }
        else {
            self.promiseData[data.eventName] = {resolve, reject}
        }
        setTimeout(()=>{
            if (self.promiseData[data.eventName] && self.promiseData[data.eventName].reject) {
                // self.promiseData[data.eventName].reject(data.eventName + ' Timed out!');
            }
        }, 10000);
    });

    return emitPromise;
    
}


SocketService.prototype.onAny = function (callback) {
    this.onAny = callback;
}
