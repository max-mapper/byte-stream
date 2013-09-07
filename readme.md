# byte-stream

A stream that you write individual things to, and it emits batches (arrays) of things that are under a byte size limit.

[![NPM](https://nodei.co/npm/byte-stream.png)](https://nodei.co/npm/byte-stream/)

## usage

```
var batcher = require('byte-stream')
```

Returns a stream. You can `.pipe` other streams to it or `.write` them yourself (if you `.write` don't forget to `.end`)

For more examples of usage see `test.js`

#### batcher.next()

Call this to get the next batch. `byte-stream` will buffer data indefinitely until you call `.next`. While it is buffering data it will also send the proper backpressure events to upstream streams so that they know to back off a bit.

The reasoning behind the semantics of `.next` is due to the use case in which `byte-stream` was originally written: Loading data into a database without overloading the database with too much data at once. For example, if a large file is being read at a rate of 200MB/s but the data store it is being copied into can only accept data at 50MB/s, *and* it is advantageous for you to insert data in batches (as opposed to single round trips for each piece of data), then you would want to get a batch from `level-batcher`, put it into the store, and as soon as you're read for the next one call `.next` to get a new batch.

### license

BSD

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

