server = require('./testserver');
client = require('./testclient');

server
.on('listening', function () {
  client.start();
})
.start();