var net = require('net');
var config = require('./config');
var Protocol = require('../lib/index.js');

var server = net.createServer();

function start() {
  server
  .on('listening', function () {
    console.log('listening on port 8124');
  })
  .on('connection', function (socket) {
    Protocol(socket)
    .on('message', function (message) {
      socket.sendMessage(message);
    })
    .on('close', function () {
      console.log('client closed connection');
    })
    .on('error', function (error) {
      console.log('error: ' + error);
    })
    .on('close',function () {
      console.log('connection is closed');
    });
  })
  .on('close', function () {
    console.log('close');
  })
  .on('error', function (error) {
    console.log('error: ' + error);
  })
  .listen(config.port);

  return server;
}

module.exports = exports = server;
exports.start = start;