"use strict";

function Array1(data, shape, stride) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
}

Array1.prototype.get = function(i) {
  return this.data[i * stride[0]];
}
Array1.prototype.set = function(i, v) {
  this.data[i * stride[0]] = v;
  return v;
}
Array1.prototype.view = function() {
  return new Array1(this.data, this.shape, this.stride);
}
Array1.prototype.clone = function() {
  var nd = this.data.slice(0, this.shape[0]);
  if(this.stride[0] === 1) {
    return new Array(nd, this.shape.slice(0), [1]);
  }
  for(var i=0, ptr=0; i<shape[0]; ++i) {
    nd[i] = this.data[ptr];
    ptr += this.stride[0];
  }
  return new Array1(nd, shape.slice(0), [1]);
}
Array1.prototype.assign = function(other) {
  if(this.shape.length !== other.shape.length ||
     this.shape[0] !== other.shape[0]) {
    return this;
  }
  for(var i=this.shape[0], aptr=0, bptr=0; i>=0; --i) {
    this.data[aptr] = other.data[bptr];
    aptr += this.stride[0];
    bptr += other.stride[0];
  }
  return this;
}
Array1.prototype.lo = function(i) {
  this.data = this.data.subarray(i * stride[0]);
  this.shape[0] -= i;
  return this;
}
Array1.prototype.hi = function(i) {
  this.shape[0] = i;
  return this;
}
Array1.prototype.transpose = function() {
  return this;
}

module.exports = Array1;