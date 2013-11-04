var constants = require('./constants.js');

var messageCount = 0;
var messagePartCount = 1;

module.exports = function (socket) {
  var messagePartsBuffer = socket.messagePartsBuffer = null;
  var totalMessageLength = socket.messageLength = 0;

  socket.sendMessage = function (message) {
    var header = new Buffer(constants.HEADER_LENGTH_IN_BYTES);
    header.writeUInt32BE(message.length, 0);
    var transportMessageLength = constants.HEADER_LENGTH_IN_BYTES + message.length;
    var transportMessage = Buffer.concat([header, message], transportMessageLength);
    return socket.write(transportMessage);
  };

  socket
  .on('data', function (data) {
    // What is that data?
    if (messagePartsBuffer) {
      // It's part of a current message.
      messagePartCount++;
      var newBufferLength = messagePartsBuffer.length + data.length;
      messagePartsBuffer = Buffer.concat([messagePartsBuffer, data], newBufferLength);
    } else {
      // It's part of a new message.
      messageCount++;
      messagePartCount = 1;
      totalMessageLength = data.readUInt32BE(0) + constants.HEADER_LENGTH_IN_BYTES;
      messagePartsBuffer = data;
    }

    if (totalMessageLength === messagePartsBuffer.length) {
      // Message received!
      writeToLog(messageCount, messagePartCount, messagePartsBuffer.length, totalMessageLength);
      messagePartCount = 1;

      var message = messagePartsBuffer.slice(constants.HEADER_LENGTH_IN_BYTES, totalMessageLength);
      socket.emit('message', message);

      messagePartsBuffer = null;
      totalMessageLength = 0;
    } else if(messagePartsBuffer.length > totalMessageLength) {
      // messagePartsBuffer = currentMessage + newMessage
      // — Oh, need to split the data.
      // — What time is it?
      // — Adventure time!
      // | ∩___∩ five
      // | (• ◡•)|/ \(❍ᴥ❍ʋ)
      writeToLog(messageCount, messagePartCount, totalMessageLength, totalMessageLength);
      messageCount++;
      messagePartCount = 1;

      var message = messagePartsBuffer.slice(constants.HEADER_LENGTH_IN_BYTES, totalMessageLength);
      socket.emit('message', message);

      messagePartsBuffer = messagePartsBuffer.slice(totalMessageLength, messagePartsBuffer.length);
      totalMessageLength = messagePartsBuffer.readUInt32BE(0) + constants.HEADER_LENGTH_IN_BYTES;
      writeToLog(messageCount, messagePartCount, messagePartsBuffer.length, totalMessageLength);
    } else {
      writeToLog(messageCount, messagePartCount, messagePartsBuffer.length, totalMessageLength);
    }
  })
  .on('close', function () {
    messagePartsBuffer = null;
    totalMessageLength = 0;
  });

  return socket;
};

function writeToLog(num, part, current, total) {
  console.log('[%d][%d] Received %d/%d bytes.', num, part, current, total);
}