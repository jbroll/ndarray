ndarray
=======
Multidimensional arrays for JavaScript.

Basic Usage
===========
First, install the library using npm:

```sh
npm install ndarray
```

Then you can use it in your projects as follows:

```javascript
var ndarray = require("ndarray")
```
    
To create an array full of zeros, you just call `ndarray.zeros()`.  For example, this makes a 128x128 array of floats:

```javascript
var img = ndarray.zeros([128, 128], ndarray.FLOAT32)
```

You can also wrap existing typed arrays in ndarrays.  For example, here is how you can turn a length 4 typed array into an nd-array:

```javascript
var mat = ndarray(new Float64Array([1, 0, 0, 1]), [2,2])
```

Once you have an nd-array you can access elements using `.set` and `.get`.  For example, here is some code to apply a box filter to an image using these routines:

```javascript
var A = ndarray.zeros([128,128])
var B = ndarray.zeros([128,128])

for(var i=1; i<127; ++i) {
  for(var j=1; j<127; ++j) {
    var s = 0;
    for(var dx=-1; dx<=1; ++dx) {
      for(var dy=-1; dy<=1; ++dy) {
        s += A.get(i+dx, j+dy)
      }
    }
    B.set(i,j,s/9.0)
  }
}
```

You can also pull out views of ndarrays without copying the underlying elements.  Here is an example showing how to update part of a subarray:

```javascript
var x = ndarray.zeros([5, 5])
var y = x.hi(4,4).lo(1,1)

for(var i=0; i<y.shape[0]; ++i) {
  for(var j=0; j<y.shape[1]; ++j) {
    y.set(i,j) = 1
  }
}

//Now:
//    x = 0 0 0 0 0
//        0 1 1 1 0
//        0 1 1 1 0
//        0 1 1 1 0
//        0 0 0 0 0
```

It is also possible to do bulk assignment to views of ndarrays:


```javascript
var x = ndarray.zeros([5,5])
var y = ndarray.zeros([3,3])
for(var i=0; i<y.shape[0]; ++i) {
  for(var j=0; j<y.shape[1]; ++j) {
    y.set(i,j,1)
  }
}

x.hi(3,3).assign(y)
x.lo(2,2).assign(y)

//Now:
//    x = 1 1 1 0 0
//        1 1 1 0 0
//        1 1 1 1 1
//        0 0 1 1 1
//        0 0 1 1 1
```

And you can also make copies of arrays:

```javascript
var x = ndarray.zeros([1])
var z = x.clone()
z.set(0, 1)

//Now:
//      x = 0
//
//      z = 1
```

API
===



FAQ
===

## What are the goals of this library?

To expose a simple, low level interface for working with contiguous blocks of memory.  The intended applications for this code are:

* WebGL interoperability
* Image processing
* Volume graphics
* Mesh processing
* Scientific computing (ie finite difference based PDE solvers)

This is **not** a linear algebra library, and does not implement things like component-wise arithmetic or tensor operations.  (Though it should be possible to build such features on top of this library as separate module.)  For now, the best option if you need those features would be to use [numeric.js](http://www.numericjs.com/).

## How does it work?

The central concept in ndarray is the idea of a `view`.  A view is basically an [ArrayBufferView](https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/ArrayBufferView) together with a shape and a stride.  The `shape` of an ndarray is basically its dimensions, while the `stride` describes how it is arranged in memory.  To compute an index in a view, you would use the following recipe:

```javascript
this.data[i0 * this.stride[0] + i1 * this.stride[1] + i2 * this.stide[2] ....]
```

Where `i0, i1, ...` is the index of the element we are accessing.

**Note**: You should *not* assume that `this.stride[this.stride-length-1]=1`.  In general, a view can be arranged as either a C-like array (or [row major order](http://en.wikipedia.org/wiki/Row-major_order)) or a FORTRAN-like array (aka column major order(http://en.wikipedia.org/wiki/Row-major_order#Column-major_order)) or anything in between.  Also, the contents of a view may not be packed tightly, as it could represent some view of a subarray.

## Why use this library instead of manual management of flat typed arrays?

While you can recreate the functionality of this library using typed arrays and manual index arithmetic, in practice doing that is very tedious and error prone.  It also means that you need to pass around extra semantic information, like the shape of the multidimensional array and it's striding.  Using a view, you can get nearly the same performance as a flat typed array, while still maintaining all of the relevant semantic information.

## Why use this library instead of numeric.js?

Numeric.js is a fantastic library, and has many useful features for numerical computing.  If you are working with sparse linear systems, need to do quadratic programming or solve some other complicated problem it should be your go-to library.  However, numeric.js uses arrays-of-native-arrays to encode multidimensional arrays.  Doing this presents several problems:

* Native arrays are much slower than typed arrays. [Proof](https://github.com/mikolalysenko/ndarray-experiments)
* Allocating an array of native-arrays induces an overhead of O(shape.length^2) extra independent JavaScript objects.  Not only does this greatly increase the amount of memory they consume, but it also prevents them from scaling with block size (leading to cache performance problems).
* Slicing arrays-of-arrays is an O(n) operation, while resizing a view is only O(1) and can be done without allocating any intermediate objects.
* Arrays-of-arrays can not be directly uploaded to WebGL, and instead require a costly "unboxing" step to convert them into a typed array.

## What optimizations does this library use?

The following optimizations are planned:

* Typed array back storage
* 0-allocation accessor interface
* In place slicing (ie `subarray()` like semantics)
* Optimized classes for low dimensional views (shape.length <= 4)
* Cache oblivious view assignment and copying

## What are the downsides?

The main problem with using views is that they are not a native part of JavaScript.  If you want to use multidimensional views in your code, you need to decide on a set of interfaces and conventions for accessing elements and specifying slices.  This means that if you have two different view libraries, code written for one or the other won't be able to interoperate without performing some type of conversion step.  One of the higher level goals of this library is to move towards a standard way of doing this in the language.

Credits
=======
(c) 2013 Mikola Lysenko. MIT License