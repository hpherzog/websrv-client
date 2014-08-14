


var console = require('console');
var util = require('util');
var events = require('events');



function Client(options) {

    this.url = options.url;

    this.webSocket = null;

    this.reconnectTimer = null;

    this.reconnectTimeout = 3000;

    this.keepAliveTimer = null;

    this.keepAliveTimeout = 10000;

    this.keepAliveSendTimer = null;

    this.keepAliveSendTimeout = 6000;
};

util.inherits(Client,
    events.EventEmitter);

Client.prototype.open = function open() {

    if(this.webSocket === null) {

        this.webSocket = new WebSocket(this.url);
        this.webSocket.onopen = this.getOpenHandler();
        this.webSocket.onclose = this.getCloseHandler();
        this.webSocket.onerror = this.getErrorHandler();
        this.webSocket.onmessage = this.getMessageHandler();

        this.emit('connecting');
        this.startReconnectTimer();
    }
};

Client.prototype.destroyWebSocket = function destroyWebSocket() {

    if(this.webSocket !== null) {

        this.webSocket.onopen = null;
        this.webSocket.onclose = null;
        this.webSocket.onerror = null;
        this.webSocket.onmessage = null;

        this.webSocket.close();
        this.webSocket = null;
    }
};

Client.prototype.close = function close() {

    this.stopKeepAliveTimer();
    this.stopKeepAliveSendTimer();

    this.destroyWebSocket();

    this.emit('offline');
    this.open();
};

Client.prototype.getOpenHandler = function getOpenHandler() {

    var self = this;
    return function() {
        self.emit('online');
        self.stopReconnectTimer();
        self.startKeepAliveTimer();
        self.startKeepAliveSendTimer();
    };
};

Client.prototype.getCloseHandler = function getCloseHandler() {
    return function() {}
};

Client.prototype.getErrorHandler = function getErrorHandler() {

    var self = this;
    return function(err) {
        self.emit('error', err);
    }
};

Client.prototype.getMessageHandler = function getMessageHandler() {

    var self = this;
    return function(message) {
        self.startKeepAliveTimer();
        self.emit('message', message);
    }
};

Client.prototype.stopKeepAliveTimer = function stopKeepAliveTimer() {

    if(this.keepAliveTimer !== null) {
        clearTimeout(this.keepAliveTimer);
        this.keepAliveTimer = null;
    }
};

Client.prototype.startKeepAliveTimer = function startKeepAliveTimer() {

    var self = this;

    if(self.webSocket.readyState === 1) {
        self.emit('alive');
    }

    self.stopKeepAliveTimer();
    self.keepAliveTimer = setTimeout(function () {
            self.close();
        },
        self.keepAliveTimeout);
};

Client.prototype.stopKeepAliveSendTimer = function stopKeepAliveSendTimer() {

    if(this.keepAliveSendTimer !== null) {
        clearTimeout(this.keepAliveSendTimer);
        this.keepAliveSendTimer = null;
    }
};

Client.prototype.startKeepAliveSendTimer = function startKeepAliveSendTimer() {

    var self = this;
    self.stopKeepAliveSendTimer();
    self.keepAliveSendTimer = setTimeout(function() {
            self.sendKeepAlive();
        },
        self.keepAliveSendTimeout);
};

Client.prototype.stopReconnectTimer = function stopReconnectTimer() {

    if(this.reconnectTimer !== null) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
    }
};

Client.prototype.startReconnectTimer = function startReconnectTimer() {

    var self = this;
    self.stopReconnectTimer();
    self.reconnectTimer = setInterval(function() {
            self.destroyWebSocket();
            self.open();
        },
        self.reconnectTimeout);
};

Client.prototype.sendKeepAlive = function sendKeepAlive() {
    this.send('');
};

Client.prototype.send = function send(message) {

    if(this.webSocket.readyState === 1) {

        this.startKeepAliveSendTimer();
        this.webSocket.send(message);
    }
};

module.exports.Client = Client;