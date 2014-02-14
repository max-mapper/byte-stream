var Transform = require('readable-stream').Transform;
var util = require('util');

module.exports = MargaretBatcher;
util.inherits(MargaretBatcher, Transform);
function MargaretBatcher(limit) {
  if (!(this instanceof MargaretBatcher)) {
    return new MargaretBatcher(limit);
  }
  Transform.call(this);
  this.limit = limit || 4096;// 4KB, arbitrary
  this.currentBatch = new Buffer(0);
  this.size = 0;
}
MargaretBatcher.prototype._transform = function(obj, _, cb) {
  this.size += obj.length;
  this.currentBatch = Buffer.concat([this.currentBatch, obj], this.size);
  // keep batches under limit
  while (this.size >= this.limit) {
    this.push(currentBatch.slice(0, this.limit));
    this.currentBatch = this.currentBatch.slice(this.limit);
    this.size = this.currentBatch.length;
  }
  cb();
};
  
MargaretBatcher.prototype._flush = function(cb) {
  this.push(this.currentBatch);
  cb();
};
