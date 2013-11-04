var assert = require('assert');
var net = require('net');
var config = require('./config.js');
var Protocol = require('../lib/index');

var client = Protocol(new net.Socket());
var testMessage = new Buffer(config.TEST_DATA_LENGTH_IN_BYTES);

testMessage.fill(0, 5, testMessage.length - 5);
testMessage.fill(1, 0, 5);
testMessage.fill(1, testMessage.length - 5, testMessage.length);

function start() {
  client
  .on('connect', function () {
    setInterval(function () {
      client.sendMessage(testMessage);
    }, config.SEND_DATA_INTERVAL_IN_MS);
  })
  .on('error', function (error) {
    console.log('error: ', error);
  })
  .on('message', function (message) {
    assert.deepEqual(testMessage, message);
  })
  .on('close',function () {
    console.log('connection is closed');
  })
  .connect(config.port, config.host);

  return client;
}

module.exports = exports = client;
exports.start = start;