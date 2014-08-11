
var console = require('console');
var util = require('util');
var events = require('events');

function Client(options) {

    this.url = options.url;

    this.webSocket = null;

    this.keepAliveTimer = null;

    this.keepAliveTimeout = 10000;

    this.keepAliveSendTimer = null;

    this.keepAliveSendTimeout = 5000;
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
    }
};

Client.prototype.close = function close() {

    this.stopKeepAliveTimer();
    this.stopKeepAliveSendTimer();

    this.webSocket.onopen = null;
    this.webSocket.onclose = null;
    this.webSocket.onerror = null;
    this.webSocket.onmessage = null;

    this.webSocket.close();
    this.webSocket = null;

    this.emit('close');
};

Client.prototype.getOpenHandler = function getOpenHandler() {

    var self = this;
    return function() {
        console.log('Client opened');
        self.emit('open');
        self.startKeepAliveTimer();
        self.startKeepAliveSendTimer();
    };
};

Client.prototype.getCloseHandler = function getCloseHandler() {

    var self = this;
    return function() {
        console.log('Client closed');
        self.emit('close');
    }
};

Client.prototype.getErrorHandler = function getErrorHandler() {

    var self = this;
    return function(err) {
        console.log(err);
        self.emit('error', err);
    }
};

Client.prototype.getMessageHandler = function getMessageHandler() {

    var self = this;
    return function(message) {
        console.log(message);
        self.emit('message', message);
        self.startKeepAliveTimer();
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
    self.stopKeepAliveTimer();
    self.keepAliveTimer = setTimeout(function() {
            self.close();
            self.open();
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

Client.prototype.sendKeepAlive = function sendKeepAlive() {
    this.send('');
};

Client.prototype.send = function send(message) {
    console.log('Send message %s', message);
    this.startKeepAliveSendTimer();
    this.webSocket.send(message);
};

module.exports.Client = Client;