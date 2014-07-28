
var console = require('console');
var util = require('util');
var events = require('events');

function Client(options) {

    this.url = options.url;

    this.webSocket = null;
};

Client.prototype.open = function open() {

    if(this.webSocket === null && this.webSocket.readyState === 3) {
        this.webSocket = new WebSocket(this.url);
        this.webSocket.onopen = this.getOpenHandler();
        this.webSocket.onclose = this.getCloseHandler();
        this.webSocket.onerror = this.getErrorHandler();
        this.webSocket.onmessage = this.getMessageHandler();
    }
};

Client.prototype.getOpenHandler = function getOpenHandler() {

    return function() {
        console.log('Client opened');
    };
};

Client.prototype.getCloseHandler = function getCloseHandler() {

    return function() {
        console.log('Client closed');
    }
};

Client.prototype.getErrorHandler = function getErrorHandler() {

    return function(err) {
        console.error(err);
    }
};

Client.prototype.getMessageHandler = function getMessageHandler() {

    return function(message) {
        console.error(err);
    }
};

util.inherits(Client,
    events.EventEmitter);