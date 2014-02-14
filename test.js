var test = require('tape')
var through = require('through2')
var crypto = require('crypto')

var byteStream = require('./')

function batchTest(limit, cb) {
  var batcher = byteStream(limit)
  var writer = through(onBatch, onEnd)

  batcher.on('error', cb)
  batcher.pipe(writer)

  var batches = []
  
  function onBatch(batch, _, cb) {
    batches.push(batch)
    cb()
  }
  
  function onEnd(cb) {
    this.push(batches)
    cb()
  }

  return batcher
}

test('equal size batches + objects', function(t) {
  var batcher = batchTest(1024, function(err, batches) {
    if (err) throw err
    t.equals(batches.length, 10)
    t.end()
  })
  for (var i = 0; i < 10; i++) batcher.write(crypto.randomBytes(1024))
  batcher.end()
})

test('objects half the size of a batch', function(t) {
  var batcher = batchTest(1024, function(err, batches) {
    if (err) throw err
    t.equals(batches.length, 10)
    t.end()
  })
  for (var i = 0; i < 19; i++) batcher.write(crypto.randomBytes(512))
  batcher.end()
})

test('object objects', function(t) {
  var batcher = batchTest(50, function(err, batches) {
    if (err) throw err
    t.equals(batches.length, 3)
    t.end()
  })
  for (var i = 0; i < 11; i++) batcher.write({"fo": "o"})
  batcher.end()
})

test('first batch length is always one', function(t) {
  var batcher = batchTest(1024 * 1024, function(err, batches) {
    if (err) throw err
    t.equals(batches[0].length, 1)
    t.end()
  })
  for (var i = 0; i < 11; i++) batcher.write('hi')
  batcher.end()
})
