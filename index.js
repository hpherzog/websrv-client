
var client = require('./src/client');

var websrv = {};

websrv.Client = client.Client;

if(window.websrv === void(0)) {
    window.websrv = websrv;
} else {
    console.error('window.websrv is already in use!');
}