var through = require('through')

module.exports = function(limit, getValueByteLength) {
  limit = limit || 4096 // 4KB, arbitrary
  getValueByteLength = getValueByteLength || getByteLength
  var currentBatch, size, started
  var margaretBatcher = through(batch, finish)
  
  function reset() {
    currentBatch = []
    size = 0
  }

  reset()
  
  // call this from consumer stream to get next batch
  margaretBatcher.next = function() {
    process.nextTick(function() {
      // resume immediately gives us all data buffered during the pause
      margaretBatcher.resume()
      // now, write any buffered data that resume just gave to us
      write()
    })
  }
  
  return margaretBatcher
  
  function batch(obj) {
    
    // instead of waiting until a batch fills up,
    // batch-stream should emit data as soon as possible.
    if (!started) {
      margaretBatcher.queue([obj])
      margaretBatcher.pause()
      started = true
      return
    }
    
    var len = getValueByteLength(obj)

    // keep batches under limit
    if ((size + len) > limit) {
      // if single obj is bigger than limit
      if (size === 0) currentBatch.push(obj)
      write()
    }
    
    currentBatch.push(obj)
    size += len
  }
  
  function finish() {
    if (currentBatch) write()
    margaretBatcher.queue(null)
  }
  
  function write() {
    if (currentBatch.length === 0) return
    margaretBatcher.queue(currentBatch)
    margaretBatcher.pause()
    reset()
  }
  
  function getByteLength (obj) {
    var len = obj.length
    if (len) return len
    return JSON.stringify(obj).length
  } 
}
