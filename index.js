var Transform = require('readable-stream').Transform
var util = require('util')

module.exports = MargaretBatcher

util.inherits(MargaretBatcher, Transform)

function getLength(obj) {
  return obj.length || 1
}

function MargaretBatcher(opts) {
  if (!(this instanceof MargaretBatcher)) {
    return new MargaretBatcher(opts)
  }
  if (typeof opts !== 'object') opts = {limit:opts} // backward compat
  Transform.call(this, {objectMode:true})
  this.limit = opts.limit || 4096 // 4KB, arbitrary
  this.time = opts.time
  this.getLength = opts.length || getLength
  this.currentTime = Date.now()
  this.currentBatch = []
  this.size = 0
}

MargaretBatcher.prototype._transform = function(obj, _, cb) {
  var len = this.getLength(obj)

  // we are overflowing - drain first
  if (this.size + len > this.limit) this._push()

  this.currentBatch.push(obj)
  this.size += len

  // bigger than limit - just drain
  if (this.size >= this.limit || (this.time && Date.now() - this.currentTime >= this.time)) this._push()

  cb()
}

MargaretBatcher.prototype._push = function() {
  if (!this.currentBatch.length) return
  var batch = this.currentBatch
  this.size = 0
  this.currentBatch = []
  this.currentTime = Date.now()
  this.push(batch)
}

MargaretBatcher.prototype._flush = function(cb) {
  this._push()
  cb()
}
