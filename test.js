var test = require('tape')
var through = require('through2')
var crypto = require('crypto')

var byteStream = require('./')

function batchTest(limit, getSize, cb) {
  if (!cb) {
    cb = getSize
    getSize = undefined
  }
  var batcher = byteStream(limit, getSize)
  var writer = through(onBatch, onEnd)

  batcher.on('error', cb)
  batcher.pipe(writer)

  var batches = []

  function onBatch(batch, _, callback) {
    batches.push(batch)
    callback();
  }

  function onEnd(callback) {
    cb(false, batches)
    callback()
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

test('objects twice the size of a batch', function(t) {
  var batcher = batchTest(512, function(err, batches) {
    if (err) throw err
    t.equals(batches.length, 40)
    t.end()
  })
  for (var i = 0; i < 20; i++) batcher.write(crypto.randomBytes(1024))
  batcher.end()
})

test('object objects', function(t) {
  var batcher = batchTest(50, function(err, batches) {
    if (err) throw err
    t.equals(batches.length, 3)
    t.end()
  })
  for (var i = 0; i < 11; i++) batcher.write(JSON.stringify({"fo": "o"}))
  batcher.end()
})

test('first batch length is always one', function(t) {
  var batcher = batchTest(1024 * 1024, function(err, batches) {
    if (err) throw err
    t.equals(batches[0].length, 22)
    t.end()
  })
  for (var i = 0; i < 11; i++) batcher.write('hi')
  batcher.end()
})

test('batch after time', function(t) {
  var batcher = batchTest({time:100}, function(err, batches) {
    if (err) throw err
    t.equals(batches.length, 2)
    t.equals(batches[0].toString(), 'hello')
    t.equals(batches[1].toString(), 'world')
    t.end()
  })
  batcher.write('hel')

  setTimeout(function() {
    batcher.write('lo')
    batcher.write('world')
    batcher.end()
  }, 250)
})