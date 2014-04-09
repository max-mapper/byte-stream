var Transform = require('readable-stream').Transform
var util = require('util')

module.exports = MargaretBatcher

util.inherits(MargaretBatcher, Transform)

function MargaretBatcher(opts) {
  if (!(this instanceof MargaretBatcher)) {
    return new MargaretBatcher(opts)
  }
  if (typeof opts !== 'object') opts = {limit:opts} // backward compat
  Transform.call(this)
  this.limit = opts.limit || 4096 // 4KB, arbitrary
  this.time = opts.time
  this.currentTime = Date.now()
  this.currentBatch = new Buffer(0)
  this.size = 0
}

MargaretBatcher.prototype._transform = function(obj, _, cb) {
  this.size += obj.length
  this.currentBatch = Buffer.concat([this.currentBatch, obj], this.size)

  // keep batches under limit
  while (this.size >= this.limit) {
    this._push();
  }
  if (this.time && Date.now() - this.currentTime >= this.time) {
    this._push();
  }
  cb()
}

MargaretBatcher.prototype._push = function() {
    this.push(this.currentBatch.slice(0, this.limit))
    this.currentBatch = this.currentBatch.slice(this.limit)
    this.size = this.currentBatch.length
    this.currentTime = Date.now();
};

MargaretBatcher.prototype._flush = function(cb) {
  this.push(this.currentBatch)
  cb()
}
