## Message protocol
**— So… why do it this protocol?**

Look at this. Alice sends these binary data to Bob through TCP socket:
 
- Part #1: `0010 1010 0000 0000`.
- Part #2: `0000 0000 0010 1010`.

What data will get Bob?

Case #1: 

  - Part #1: `0010 1010 0000 0000`.
  - Part #2: `0000 0000 0010 1010`.

Case #2:

  - Part #1: `0010 1010`.
  - Part #2: `0000 0000 0000 0000`.
  - Part #3: `0010 1010`.

Case #3:

  - Part #1: `0010 1010 0000 0000 0000 0000 0010 1010`.

etc.

**— But I need to send messages!**

Use this module!

```js
var net = require('net');
var Protocol = require('message-protocol');

var client = Protocol(new net.Socket())
  .on('connect', function () {
    client.sendMessage(new Buffer(100000));
  })
  .on('error', function (error) {
    console.log('error: ', error);
  })
  .on('message', function (message) {
    console.log(message);
  })
  .on('close', function () {
    console.log('connection is closed');
  })
  .connect(8124, 'localhost');
```

## Installation

via npm:

```bash
$ npm install message-protocol
```

## Testing

via npm:

```bash
$ npm run-script test
```

## Log format

\[ `№ message` \]\[ `№ part` \] Received `received`/`total` bytes.

```
[108][1] Received 4804/100004 bytes.
[108][2] Received 94400/100004 bytes.
[108][3] Received 31068/100004 bytes.
[108][4] Received 100004/100004 bytes.
[109][1] Received 23848/100004 bytes.
[109][2] Received 53580/100004 bytes.
[109][3] Received 50112/100004 bytes.
[109][4] Received 76092/100004 bytes.
[109][5] Received 76376/100004 bytes.
[109][6] Received 100004/100004 bytes.
[110][1] Received 1788/100004 bytes.
[110][2] Received 100004/100004 bytes.
```

## Algorithm

The first 4 bytes of every message — message length. It allows to distinguish messages in the data stream.
