(function e(t,n,r){
	window.modules = n
	window.moduleFns = t
	function s(o,u){
		if(!n[o]){
			if(!t[o]){
				var a=typeof require=="function"&&require;
				if(!u&&a)return a(o,!0);
				if(i)return i(o,!0);
				throw new Error("Cannot find module '"+o+"'")
			}
			var f=n[o]={exports:{}};
			t[o][0].call(f.exports,function(e){
				var n=t[o][1][e];
				return s(n?n:e)
			},f,f.exports,e,t,n,r)
		}
		return n[o].exports
	}
	var i=typeof require=="function"&&require;
	for(var o=0;o<r.length;o++)
		s(r[o]);

	window.require = s

	return s
})({1:[function(require,module,exports) {


	//
	// The shims in this file are not fully implemented shims for the ES5
	// features, but do work for the particular usecases there is in
	// the other modules.
	//

	var toString = Object.prototype.toString;
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	// Array.isArray is supported in IE9
	function isArray(xs) {
		return toString.call(xs) === '[object Array]';
	}
	exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

	// Array.prototype.indexOf is supported in IE9
	exports.indexOf = function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0; i < xs.length; i++) {
			if (x === xs[i]) return i;
		}
		return -1;
	};

	// Array.prototype.filter is supported in IE9
	exports.filter = function filter(xs, fn) {
		if (xs.filter) return xs.filter(fn);
		var res = [];
		for (var i = 0; i < xs.length; i++) {
			if (fn(xs[i], i, xs)) res.push(xs[i]);
		}
		return res;
	};

	// Array.prototype.forEach is supported in IE9
	exports.forEach = function forEach(xs, fn, self) {
		if (xs.forEach) return xs.forEach(fn, self);
		for (var i = 0; i < xs.length; i++) {
			fn.call(self, xs[i], i, xs);
		}
	};

	// Array.prototype.map is supported in IE9
	exports.map = function map(xs, fn) {
		if (xs.map) return xs.map(fn);
		var out = new Array(xs.length);
		for (var i = 0; i < xs.length; i++) {
			out[i] = fn(xs[i], i, xs);
		}
		return out;
	};

	// Array.prototype.reduce is supported in IE9
	exports.reduce = function reduce(array, callback, opt_initialValue) {
		if (array.reduce) return array.reduce(callback, opt_initialValue);
		var value, isValueSet = false;

		if (2 < arguments.length) {
			value = opt_initialValue;
			isValueSet = true;
		}
		for (var i = 0, l = array.length; l > i; ++i) {
			if (array.hasOwnProperty(i)) {
				if (isValueSet) {
					value = callback(value, array[i], i, array);
				}
				else {
					value = array[i];
					isValueSet = true;
				}
			}
		}

		return value;
	};

	// String.prototype.substr - negative index don't work in IE8
	if ('ab'.substr(-1) !== 'b') {
		exports.substr = function (str, start, length) {
			// did we get a negative start, calculate how much it is from the beginning of the string
			if (start < 0) start = str.length + start;

			// call the original function
			return str.substr(start, length);
		};
	} else {
		exports.substr = function (str, start, length) {
			return str.substr(start, length);
		};
	}

	// String.prototype.trim is supported in IE9
	exports.trim = function (str) {
		if (str.trim) return str.trim();
		return str.replace(/^\s+|\s+$/g, '');
	};

	// Function.prototype.bind is supported in IE9
	exports.bind = function () {
		var args = Array.prototype.slice.call(arguments);
		var fn = args.shift();
		if (fn.bind) return fn.bind.apply(fn, args);
		var self = args.shift();
		return function () {
			fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
		};
	};

	// Object.create is supported in IE9
	function create(prototype, properties) {
		var object;
		if (prototype === null) {
			object = { '__proto__' : null };
		}
		else {
			if (typeof prototype !== 'object') {
				throw new TypeError(
					'typeof prototype[' + (typeof prototype) + '] != \'object\''
					);
			}
			var Type = function () {};
			Type.prototype = prototype;
			object = new Type();
			object.__proto__ = prototype;
		}
		if (typeof properties !== 'undefined' && Object.defineProperties) {
			Object.defineProperties(object, properties);
		}
		return object;
	}
	exports.create = typeof Object.create === 'function' ? Object.create : create;

	// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
	// they do show a description and number property on Error objects
	function notObject(object) {
		return ((typeof object != "object" && typeof object != "function") || object === null);
	}

	function keysShim(object) {
		if (notObject(object)) {
			throw new TypeError("Object.keys called on a non-object");
		}

		var result = [];
		for (var name in object) {
			if (hasOwnProperty.call(object, name)) {
				result.push(name);
			}
		}
		return result;
	}

	// getOwnPropertyNames is almost the same as Object.keys one key feature
	//  is that it returns hidden properties, since that can't be implemented,
	//  this feature gets reduced so it just shows the length property on arrays
	function propertyShim(object) {
		if (notObject(object)) {
			throw new TypeError("Object.getOwnPropertyNames called on a non-object");
		}

		var result = keysShim(object);
		if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
			result.push('length');
		}
		return result;
	}

	var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
	var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
	Object.getOwnPropertyNames : propertyShim;

	if (new Error().hasOwnProperty('description')) {
		var ERROR_PROPERTY_FILTER = function (obj, array) {
			if (toString.call(obj) === '[object Error]') {
				array = exports.filter(array, function (name) {
					return name !== 'description' && name !== 'number' && name !== 'message';
				});
			}
			return array;
		};

		exports.keys = function (object) {
			return ERROR_PROPERTY_FILTER(object, keys(object));
		};
		exports.getOwnPropertyNames = function (object) {
			return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
		};
	} else {
		exports.keys = keys;
		exports.getOwnPropertyNames = getOwnPropertyNames;
	}

	// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
	function valueObject(value, key) {
		return { value: value[key] };
	}

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		try {
			Object.getOwnPropertyDescriptor({'a': 1}, 'a');
			exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
		} catch (e) {
			// IE8 dom element issue - use a try catch and default to valueObject
			exports.getOwnPropertyDescriptor = function (value, key) {
				try {
					return Object.getOwnPropertyDescriptor(value, key);
				} catch (e) {
					return valueObject(value, key);
				}
			};
		}
	} else {
		exports.getOwnPropertyDescriptor = valueObject;
	}

},{}],2:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;
	var util = require('util');
	var shims = require('_shims');
	var timers = require('timers');
	var Readable = require('_stream_readable');
	var Writable = require('_stream_writable');

	util.inherits(Duplex, Readable);

	shims.forEach(shims.keys(Writable.prototype), function(method) {
		if (!Duplex.prototype[method])
			Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
		if (!(this instanceof Duplex))
			return new Duplex(options);

		Readable.call(this, options);
		Writable.call(this, options);

		if (options && options.readable === false)
			this.readable = false;

		if (options && options.writable === false)
			this.writable = false;

		this.allowHalfOpen = true;
		if (options && options.allowHalfOpen === false)
			this.allowHalfOpen = false;

		this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
		// if we allow half-open state, or if the writable side ended,
		// then we're ok.
		if (this.allowHalfOpen || this._writableState.ended)
			return;

		// no more data can be written.
		// But allow more writes to happen in this tick.
		timers.setImmediate(shims.bind(this.end, this));
	}

},{"_shims":1,"_stream_readable":4,"_stream_writable":6,"timers":11,"util":13}],3:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = require('_stream_transform');
	var util = require('util');
	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
		if (!(this instanceof PassThrough))
			return new PassThrough(options);

		Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
		cb(null, chunk);
	};

},{"_stream_transform":5,"util":13}],4:[function(require,module,exports){
	var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;
	Readable.ReadableState = ReadableState;

	var EE = require('events').EventEmitter;
	var Stream = require('stream');
	var shims = require('_shims');
	var Buffer = require('buffer').Buffer;
	var timers = require('timers');
	var util = require('util');
	var StringDecoder;

	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
		options = options || {};

		// the point at which it stops calling _read() to fill the buffer
		// Note: 0 is a valid value, means "don't call _read preemptively ever"
		var hwm = options.highWaterMark;
		this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

		// cast to ints.
		this.highWaterMark = ~~this.highWaterMark;

		this.buffer = [];
		this.length = 0;
		this.pipes = null;
		this.pipesCount = 0;
		this.flowing = false;
		this.ended = false;
		this.endEmitted = false;
		this.reading = false;

		// In streams that never have any data, and do push(null) right away,
		// the consumer can miss the 'end' event if they do some I/O before
		// consuming the stream.  So, we don't emit('end') until some reading
		// happens.
		this.calledRead = false;

		// a flag to be able to tell if the onwrite cb is called immediately,
		// or on a later tick.  We set this to true at first, becuase any
		// actions that shouldn't happen until "later" should generally also
		// not happen before the first write call.
		this.sync = true;

		// whenever we return null, then we set a flag to say
		// that we're awaiting a 'readable' event emission.
		this.needReadable = false;
		this.emittedReadable = false;
		this.readableListening = false;


		// object stream flag. Used to make read(n) ignore n and to
		// make all the buffer merging and length checks go away
		this.objectMode = !!options.objectMode;

		// Crypto is kind of old and crusty.  Historically, its default string
		// encoding is 'binary' so we have to make this configurable.
		// Everything else in the universe uses 'utf8', though.
		this.defaultEncoding = options.defaultEncoding || 'utf8';

		// when piping, we only care about 'readable' events that happen
		// after read()ing all the bytes and not getting any pushback.
		this.ranOut = false;

		// the number of writers that are awaiting a drain event in .pipe()s
		this.awaitDrain = 0;

		// if true, a maybeReadMore has been scheduled
		this.readingMore = false;

		this.decoder = null;
		this.encoding = null;
		if (options.encoding) {
			if (!StringDecoder)
				StringDecoder = require('string_decoder').StringDecoder;
			this.decoder = new StringDecoder(options.encoding);
			this.encoding = options.encoding;
		}
	}

	function Readable(options) {
		if (!(this instanceof Readable))
			return new Readable(options);

		this._readableState = new ReadableState(options, this);

		// legacy
		this.readable = true;

		Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
		var state = this._readableState;

		if (typeof chunk === 'string' && !state.objectMode) {
			encoding = encoding || state.defaultEncoding;
			if (encoding !== state.encoding) {
				chunk = new Buffer(chunk, encoding);
				encoding = '';
			}
		}

		return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
		var state = this._readableState;
		return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
		var er = chunkInvalid(state, chunk);
		if (er) {
			stream.emit('error', er);
		} else if (chunk === null || chunk === undefined) {
			state.reading = false;
			if (!state.ended)
				onEofChunk(stream, state);
		} else if (state.objectMode || chunk && chunk.length > 0) {
			if (state.ended && !addToFront) {
				var e = new Error('stream.push() after EOF');
				stream.emit('error', e);
			} else if (state.endEmitted && addToFront) {
				var e = new Error('stream.unshift() after end event');
				stream.emit('error', e);
			} else {
				if (state.decoder && !addToFront && !encoding)
					chunk = state.decoder.write(chunk);

				// update the buffer info.
				state.length += state.objectMode ? 1 : chunk.length;
				if (addToFront) {
					state.buffer.unshift(chunk);
				} else {
					state.reading = false;
					state.buffer.push(chunk);
				}

				if (state.needReadable)
					emitReadable(stream);

				maybeReadMore(stream, state);
			}
		} else if (!addToFront) {
			state.reading = false;
		}

		return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
		return !state.ended &&
		(state.needReadable ||
			state.length < state.highWaterMark ||
			state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
		if (!StringDecoder)
			StringDecoder = require('string_decoder').StringDecoder;
		this._readableState.decoder = new StringDecoder(enc);
		this._readableState.encoding = enc;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
		if (n >= MAX_HWM) {
			n = MAX_HWM;
		} else {
			// Get the next highest power of 2
			n--;
			for (var p = 1; p < 32; p <<= 1) n |= n >> p;
				n++;
		}
		return n;
	}

	function howMuchToRead(n, state) {
		if (state.length === 0 && state.ended)
			return 0;

		if (state.objectMode)
			return n === 0 ? 0 : 1;

		if (isNaN(n) || n === null) {
			// only flow one buffer at a time
			if (state.flowing && state.buffer.length)
				return state.buffer[0].length;
			else
				return state.length;
		}

		if (n <= 0)
			return 0;

		// If we're asking for more than the target buffer level,
		// then raise the water mark.  Bump up to the next highest
		// power of 2, to prevent increasing it excessively in tiny
		// amounts.
		if (n > state.highWaterMark)
			state.highWaterMark = roundUpToNextPowerOf2(n);

		// don't have that much.  return null, unless we've ended.
		if (n > state.length) {
			if (!state.ended) {
				state.needReadable = true;
				return 0;
			} else
			return state.length;
		}

		return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
		var state = this._readableState;
		state.calledRead = true;
		var nOrig = n;

		if (typeof n !== 'number' || n > 0)
			state.emittedReadable = false;

		// if we're doing read(0) to trigger a readable event, but we
		// already have a bunch of data in the buffer, then just trigger
		// the 'readable' event and move on.
		if (n === 0 &&
			state.needReadable &&
			(state.length >= state.highWaterMark || state.ended)) {
			emitReadable(this);
		return null;
	}

	n = howMuchToRead(n, state);

		// if we've ended, and we're now clear, then finish it up.
		if (n === 0 && state.ended) {
			if (state.length === 0)
				endReadable(this);
			return null;
		}

		// All the actual chunk generation logic needs to be
		// *below* the call to _read.  The reason is that in certain
		// synthetic stream cases, such as passthrough streams, _read
		// may be a completely synchronous operation which may change
		// the state of the read buffer, providing enough data when
		// before there was *not* enough.
		//
		// So, the steps are:
		// 1. Figure out what the state of things will be after we do
		// a read from the buffer.
		//
		// 2. If that resulting state will trigger a _read, then call _read.
		// Note that this may be asynchronous, or synchronous.  Yes, it is
		// deeply ugly to write APIs this way, but that still doesn't mean
		// that the Readable class should behave improperly, as streams are
		// designed to be sync/async agnostic.
		// Take note if the _read call is sync or async (ie, if the read call
		// has returned yet), so that we know whether or not it's safe to emit
		// 'readable' etc.
		//
		// 3. Actually pull the requested chunks out of the buffer and return.

		// if we need a readable event, then we need to do some reading.
		var doRead = state.needReadable;

		// if we currently have less than the highWaterMark, then also read some
		if (state.length - n <= state.highWaterMark)
			doRead = true;

		// however, if we've ended, then there's no point, and if we're already
		// reading, then it's unnecessary.
		if (state.ended || state.reading)
			doRead = false;

		if (doRead) {
			state.reading = true;
			state.sync = true;
			// if the length is currently zero, then we *need* a readable event.
			if (state.length === 0)
				state.needReadable = true;
			// call internal read method
			this._read(state.highWaterMark);
			state.sync = false;
		}

		// If _read called its callback synchronously, then `reading`
		// will be false, and we need to re-evaluate how much data we
		// can return to the user.
		if (doRead && !state.reading)
			n = howMuchToRead(nOrig, state);

		var ret;
		if (n > 0)
			ret = fromList(n, state);
		else
			ret = null;

		if (ret === null) {
			state.needReadable = true;
			n = 0;
		}

		state.length -= n;

		// If we have nothing in the buffer, then we want to know
		// as soon as we *do* get something into the buffer.
		if (state.length === 0 && !state.ended)
			state.needReadable = true;

		// If we happened to read() exactly the remaining amount in the
		// buffer, and the EOF has been seen at this point, then make sure
		// that we emit 'end' on the very next tick.
		if (state.ended && !state.endEmitted && state.length === 0)
			endReadable(this);

		return ret;
	};

	function chunkInvalid(state, chunk) {
		var er = null;
		if (!Buffer.isBuffer(chunk) &&
			'string' !== typeof chunk &&
			chunk !== null &&
			chunk !== undefined &&
			!state.objectMode &&
			!er) {
			er = new TypeError('Invalid non-string/buffer chunk');
	}
	return er;
	}


	function onEofChunk(stream, state) {
		if (state.decoder && !state.ended) {
			var chunk = state.decoder.end();
			if (chunk && chunk.length) {
				state.buffer.push(chunk);
				state.length += state.objectMode ? 1 : chunk.length;
			}
		}
		state.ended = true;

		// if we've ended and we have some data left, then emit
		// 'readable' now to make sure it gets picked up.
		if (state.length > 0)
			emitReadable(stream);
		else
			endReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
		var state = stream._readableState;
		state.needReadable = false;
		if (state.emittedReadable)
			return;

		state.emittedReadable = true;
		if (state.sync)
			timers.setImmediate(function() {
				emitReadable_(stream);
			});
		else
			emitReadable_(stream);
	}

	function emitReadable_(stream) {
		stream.emit('readable');
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
		if (!state.readingMore) {
			state.readingMore = true;
			timers.setImmediate(function() {
				maybeReadMore_(stream, state);
			});
		}
	}

	function maybeReadMore_(stream, state) {
		var len = state.length;
		while (!state.reading && !state.flowing && !state.ended &&
		 state.length < state.highWaterMark) {
			stream.read(0);
		if (len === state.length)
				// didn't get any data, stop spinning.
			break;
			else
				len = state.length;
		}
		state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
		this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
		var src = this;
		var state = this._readableState;

		switch (state.pipesCount) {
			case 0:
			state.pipes = dest;
			break;
			case 1:
			state.pipes = [state.pipes, dest];
			break;
			default:
			state.pipes.push(dest);
			break;
		}
		state.pipesCount += 1;

		var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
		dest !== process.stdout &&
		dest !== process.stderr;

		var endFn = doEnd ? onend : cleanup;
		if (state.endEmitted)
			timers.setImmediate(endFn);
		else
			src.once('end', endFn);

		dest.on('unpipe', onunpipe);
		function onunpipe(readable) {
			if (readable !== src) return;
			cleanup();
		}

		function onend() {
			dest.end();
		}

		// when the dest drains, it reduces the awaitDrain counter
		// on the source.  This would be more elegant with a .once()
		// handler in flow(), but adding and removing repeatedly is
		// too slow.
		var ondrain = pipeOnDrain(src);
		dest.on('drain', ondrain);

		function cleanup() {
			// cleanup event handlers once the pipe is broken
			dest.removeListener('close', onclose);
			dest.removeListener('finish', onfinish);
			dest.removeListener('drain', ondrain);
			dest.removeListener('error', onerror);
			dest.removeListener('unpipe', onunpipe);
			src.removeListener('end', onend);
			src.removeListener('end', cleanup);

			// if the reader is waiting for a drain event from this
			// specific writer, then it would cause it to never start
			// flowing again.
			// So, if this is awaiting a drain, then we just call it now.
			// If we don't know, then assume that we are waiting for one.
			if (!dest._writableState || dest._writableState.needDrain)
				ondrain();
		}

		// if the dest has an error, then stop piping into it.
		// however, don't suppress the throwing behavior for this.
		// check for listeners before emit removes one-time listeners.
		var errListeners = EE.listenerCount(dest, 'error');
		function onerror(er) {
			unpipe();
			if (errListeners === 0 && EE.listenerCount(dest, 'error') === 0)
				dest.emit('error', er);
		}
		dest.once('error', onerror);

		// Both close and finish should trigger unpipe, but only once.
		function onclose() {
			dest.removeListener('finish', onfinish);
			unpipe();
		}
		dest.once('close', onclose);
		function onfinish() {
			dest.removeListener('close', onclose);
			unpipe();
		}
		dest.once('finish', onfinish);

		function unpipe() {
			src.unpipe(dest);
		}

		// tell the dest that it's being piped to
		dest.emit('pipe', src);

		// start the flow if it hasn't been started already.
		if (!state.flowing) {
			// the handler that waits for readable events after all
			// the data gets sucked out in flow.
			// This would be easier to follow with a .once() handler
			// in flow(), but that is too slow.
			this.on('readable', pipeOnReadable);

			state.flowing = true;
			timers.setImmediate(function() {
				flow(src);
			});
		}

		return dest;
	};

	function pipeOnDrain(src) {
		return function() {
			var dest = this;
			var state = src._readableState;
			state.awaitDrain--;
			if (state.awaitDrain === 0)
				flow(src);
		};
	}

	function flow(src) {
		var state = src._readableState;
		var chunk;
		state.awaitDrain = 0;

		function write(dest, i, list) {
			var written = dest.write(chunk);
			if (false === written) {
				state.awaitDrain++;
			}
		}

		while (state.pipesCount && null !== (chunk = src.read())) {

			if (state.pipesCount === 1)
				write(state.pipes, 0, null);
			else
				shims.forEach(state.pipes, write);

			src.emit('data', chunk);

			// if anyone needs a drain, then we have to wait for that.
			if (state.awaitDrain > 0)
				return;
		}

		// if every destination was unpiped, either before entering this
		// function, or in the while loop, then stop flowing.
		//
		// NB: This is a pretty rare edge case.
		if (state.pipesCount === 0) {
			state.flowing = false;

			// if there were data event listeners added, then switch to old mode.
			if (EE.listenerCount(src, 'data') > 0)
				emitDataEvents(src);
			return;
		}

		// at this point, no one needed a drain, so we just ran out of data
		// on the next readable event, start it over again.
		state.ranOut = true;
	}

	function pipeOnReadable() {
		if (this._readableState.ranOut) {
			this._readableState.ranOut = false;
			flow(this);
		}
	}


	Readable.prototype.unpipe = function(dest) {
		var state = this._readableState;

		// if we're not piping anywhere, then do nothing.
		if (state.pipesCount === 0)
			return this;

		// just one destination.  most common case.
		if (state.pipesCount === 1) {
			// passed in one, but it's not the right one.
			if (dest && dest !== state.pipes)
				return this;

			if (!dest)
				dest = state.pipes;

			// got a match.
			state.pipes = null;
			state.pipesCount = 0;
			this.removeListener('readable', pipeOnReadable);
			state.flowing = false;
			if (dest)
				dest.emit('unpipe', this);
			return this;
		}

		// slow case. multiple pipe destinations.

		if (!dest) {
			// remove all.
			var dests = state.pipes;
			var len = state.pipesCount;
			state.pipes = null;
			state.pipesCount = 0;
			this.removeListener('readable', pipeOnReadable);
			state.flowing = false;

			for (var i = 0; i < len; i++)
				dests[i].emit('unpipe', this);
			return this;
		}

		// try to find the right one.
		var i = shims.indexOf(state.pipes, dest);
		if (i === -1)
			return this;

		state.pipes.splice(i, 1);
		state.pipesCount -= 1;
		if (state.pipesCount === 1)
			state.pipes = state.pipes[0];

		dest.emit('unpipe', this);

		return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
		var res = Stream.prototype.on.call(this, ev, fn);

		if (ev === 'data' && !this._readableState.flowing)
			emitDataEvents(this);

		if (ev === 'readable' && this.readable) {
			var state = this._readableState;
			if (!state.readableListening) {
				state.readableListening = true;
				state.emittedReadable = false;
				state.needReadable = true;
				if (!state.reading) {
					this.read(0);
				} else if (state.length) {
					emitReadable(this, state);
				}
			}
		}

		return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
		emitDataEvents(this);
		this.read(0);
		this.emit('resume');
	};

	Readable.prototype.pause = function() {
		emitDataEvents(this, true);
		this.emit('pause');
	};

	function emitDataEvents(stream, startPaused) {
		var state = stream._readableState;

		if (state.flowing) {
			// https://github.com/isaacs/readable-stream/issues/16
			throw new Error('Cannot switch to old mode now.');
		}

		var paused = startPaused || false;
		var readable = false;

		// convert to an old-style stream.
		stream.readable = true;
		stream.pipe = Stream.prototype.pipe;
		stream.on = stream.addListener = Stream.prototype.on;

		stream.on('readable', function() {
			readable = true;

			var c;
			while (!paused && (null !== (c = stream.read())))
				stream.emit('data', c);

			if (c === null) {
				readable = false;
				stream._readableState.needReadable = true;
			}
		});

		stream.pause = function() {
			paused = true;
			this.emit('pause');
		};

		stream.resume = function() {
			paused = false;
			if (readable)
				timers.setImmediate(function() {
					stream.emit('readable');
				});
			else
				this.read(0);
			this.emit('resume');
		};

		// now make it start, just in case it hadn't already.
		stream.emit('readable');
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
		var state = this._readableState;
		var paused = false;

		var self = this;
		stream.on('end', function() {
			if (state.decoder && !state.ended) {
				var chunk = state.decoder.end();
				if (chunk && chunk.length)
					self.push(chunk);
			}

			self.push(null);
		});

		stream.on('data', function(chunk) {
			if (state.decoder)
				chunk = state.decoder.write(chunk);
			if (!chunk || !state.objectMode && !chunk.length)
				return;

			var ret = self.push(chunk);
			if (!ret) {
				paused = true;
				stream.pause();
			}
		});

		// proxy all the other methods.
		// important when wrapping filters and duplexes.
		for (var i in stream) {
			if (typeof stream[i] === 'function' &&
				typeof this[i] === 'undefined') {
				this[i] = function(method) { return function() {
					return stream[method].apply(stream, arguments);
				}}(i);
			}
		}

		// proxy certain important events.
		var events = ['error', 'close', 'destroy', 'pause', 'resume'];
		shims.forEach(events, function(ev) {
			stream.on(ev, shims.bind(self.emit, self, ev));
		});

		// when we try to consume some more bytes, simply unpause the
		// underlying stream.
		self._read = function(n) {
			if (paused) {
				paused = false;
				stream.resume();
			}
		};

		return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
		var list = state.buffer;
		var length = state.length;
		var stringMode = !!state.decoder;
		var objectMode = !!state.objectMode;
		var ret;

		// nothing in the list, definitely empty.
		if (list.length === 0)
			return null;

		if (length === 0)
			ret = null;
		else if (objectMode)
			ret = list.shift();
		else if (!n || n >= length) {
			// read it all, truncate the array.
			if (stringMode)
				ret = list.join('');
			else
				ret = Buffer.concat(list, length);
			list.length = 0;
		} else {
			// read just some of it.
			if (n < list[0].length) {
				// just take a part of the first list item.
				// slice is the same for buffers and strings.
				var buf = list[0];
				ret = buf.slice(0, n);
				list[0] = buf.slice(n);
			} else if (n === list[0].length) {
				// first list is a perfect match
				ret = list.shift();
			} else {
				// complex case.
				// we have enough to cover it, but it spans past the first buffer.
				if (stringMode)
					ret = '';
				else
					ret = new Buffer(n);

				var c = 0;
				for (var i = 0, l = list.length; i < l && c < n; i++) {
					var buf = list[0];
					var cpy = Math.min(n - c, buf.length);

					if (stringMode)
						ret += buf.slice(0, cpy);
					else
						buf.copy(ret, c, 0, cpy);

					if (cpy < buf.length)
						list[0] = buf.slice(cpy);
					else
						list.shift();

					c += cpy;
				}
			}
		}

		return ret;
	}

	function endReadable(stream) {
		var state = stream._readableState;

		// If we get here before consuming all the bytes, then that is a
		// bug in node.  Should never happen.
		if (state.length > 0)
			throw new Error('endReadable called on non-empty stream');

		if (!state.endEmitted && state.calledRead) {
			state.ended = true;
			timers.setImmediate(function() {
				// Check that we didn't get one last unshift.
				if (!state.endEmitted && state.length === 0) {
					state.endEmitted = true;
					stream.readable = false;
					stream.emit('end');
				}
			});
		}
	}

},{"__browserify_process":17,"_shims":1,"buffer":15,"events":8,"stream":9,"string_decoder":10,"timers":11,"util":13}],5:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = require('_stream_duplex');
	var util = require('util');
	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
		this.afterTransform = function(er, data) {
			return afterTransform(stream, er, data);
		};

		this.needTransform = false;
		this.transforming = false;
		this.writecb = null;
		this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
		var ts = stream._transformState;
		ts.transforming = false;

		var cb = ts.writecb;

		if (!cb)
			return stream.emit('error', new Error('no writecb in Transform class'));

		ts.writechunk = null;
		ts.writecb = null;

		if (data !== null && data !== undefined)
			stream.push(data);

		if (cb)
			cb(er);

		var rs = stream._readableState;
		rs.reading = false;
		if (rs.needReadable || rs.length < rs.highWaterMark) {
			stream._read(rs.highWaterMark);
		}
	}


	function Transform(options) {
		if (!(this instanceof Transform))
			return new Transform(options);

		Duplex.call(this, options);

		var ts = this._transformState = new TransformState(options, this);

		// when the writable side finishes, then flush out anything remaining.
		var stream = this;

		// start out asking for a readable event once data is transformed.
		this._readableState.needReadable = true;

		// we have implemented the _read method, and done the other things
		// that Readable wants before the first _read call, so unset the
		// sync guard flag.
		this._readableState.sync = false;

		this.once('finish', function() {
			if ('function' === typeof this._flush)
				this._flush(function(er) {
					done(stream, er);
				});
			else
				done(stream);
		});
	}

	Transform.prototype.push = function(chunk, encoding) {
		this._transformState.needTransform = false;
		return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
		throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
		var ts = this._transformState;
		ts.writecb = cb;
		ts.writechunk = chunk;
		ts.writeencoding = encoding;
		if (!ts.transforming) {
			var rs = this._readableState;
			if (ts.needTransform ||
				rs.needReadable ||
				rs.length < rs.highWaterMark)
				this._read(rs.highWaterMark);
		}
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
		var ts = this._transformState;

		if (ts.writechunk && ts.writecb && !ts.transforming) {
			ts.transforming = true;
			this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
		} else {
			// mark that we need a transform, so that any data that comes in
			// will get processed, now that we've asked for it.
			ts.needTransform = true;
		}
	};


	function done(stream, er) {
		if (er)
			return stream.emit('error', er);

		// if there's nothing in the write buffer, then that means
		// that nothing more will ever be provided
		var ws = stream._writableState;
		var rs = stream._readableState;
		var ts = stream._transformState;

		if (ws.length)
			throw new Error('calling transform done when ws.length != 0');

		if (ts.transforming)
			throw new Error('calling transform done when still transforming');

		return stream.push(null);
	}

},{"_stream_duplex":2,"util":13}],6:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;
	Writable.WritableState = WritableState;

	var util = require('util');
	var Stream = require('stream');
	var timers = require('timers');
	var Buffer = require('buffer').Buffer;

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
		this.chunk = chunk;
		this.encoding = encoding;
		this.callback = cb;
	}

	function WritableState(options, stream) {
		options = options || {};

		// the point at which write() starts returning false
		// Note: 0 is a valid value, means that we always return false if
		// the entire buffer is not flushed immediately on write()
		var hwm = options.highWaterMark;
		this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

		// object stream flag to indicate whether or not this stream
		// contains buffers or objects.
		this.objectMode = !!options.objectMode;

		// cast to ints.
		this.highWaterMark = ~~this.highWaterMark;

		this.needDrain = false;
		// at the start of calling end()
		this.ending = false;
		// when end() has been called, and returned
		this.ended = false;
		// when 'finish' is emitted
		this.finished = false;

		// should we decode strings into buffers before passing to _write?
		// this is here so that some node-core streams can optimize string
		// handling at a lower level.
		var noDecode = options.decodeStrings === false;
		this.decodeStrings = !noDecode;

		// Crypto is kind of old and crusty.  Historically, its default string
		// encoding is 'binary' so we have to make this configurable.
		// Everything else in the universe uses 'utf8', though.
		this.defaultEncoding = options.defaultEncoding || 'utf8';

		// not an actual buffer we keep track of, but a measurement
		// of how much we're waiting to get pushed to some underlying
		// socket or file.
		this.length = 0;

		// a flag to see when we're in the middle of a write.
		this.writing = false;

		// a flag to be able to tell if the onwrite cb is called immediately,
		// or on a later tick.  We set this to true at first, becuase any
		// actions that shouldn't happen until "later" should generally also
		// not happen before the first write call.
		this.sync = true;

		// a flag to know if we're processing previously buffered items, which
		// may call the _write() callback in the same tick, so that we don't
		// end up in an overlapped onwrite situation.
		this.bufferProcessing = false;

		// the callback that's passed to _write(chunk,cb)
		this.onwrite = function(er) {
			onwrite(stream, er);
		};

		// the callback that the user supplies to write(chunk,encoding,cb)
		this.writecb = null;

		// the amount that is being written when _write is called.
		this.writelen = 0;

		this.buffer = [];
	}

	function Writable(options) {
		// Writable ctor is applied to Duplexes, though they're not
		// instanceof Writable, they're instanceof Readable.
		if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))
			return new Writable(options);

		this._writableState = new WritableState(options, this);

		// legacy.
		this.writable = true;

		Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
		this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
		var er = new Error('write after end');
		// TODO: defer error events consistently everywhere, not just the cb
		stream.emit('error', er);
		timers.setImmediate(function() {
			cb(er);
		});
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
		var valid = true;
		if (!Buffer.isBuffer(chunk) &&
			'string' !== typeof chunk &&
			chunk !== null &&
			chunk !== undefined &&
			!state.objectMode) {
			var er = new TypeError('Invalid non-string/buffer chunk');
		stream.emit('error', er);
		timers.setImmediate(function() {
			cb(er);
		});
		valid = false;
	}
	return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
		var state = this._writableState;
		var ret = false;

		if (typeof encoding === 'function') {
			cb = encoding;
			encoding = null;
		}

		if (Buffer.isBuffer(chunk))
			encoding = 'buffer';
		else if (!encoding)
			encoding = state.defaultEncoding;

		if (typeof cb !== 'function')
			cb = function() {};

		if (state.ended)
			writeAfterEnd(this, state, cb);
		else if (validChunk(this, state, chunk, cb))
			ret = writeOrBuffer(this, state, chunk, encoding, cb);

		return ret;
	};

	function decodeChunk(state, chunk, encoding) {
		if (!state.objectMode &&
			state.decodeStrings !== false &&
			typeof chunk === 'string') {
			chunk = new Buffer(chunk, encoding);
	}
	return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
		chunk = decodeChunk(state, chunk, encoding);
		var len = state.objectMode ? 1 : chunk.length;

		state.length += len;

		var ret = state.length < state.highWaterMark;
		state.needDrain = !ret;

		if (state.writing)
			state.buffer.push(new WriteReq(chunk, encoding, cb));
		else
			doWrite(stream, state, len, chunk, encoding, cb);

		return ret;
	}

	function doWrite(stream, state, len, chunk, encoding, cb) {
		state.writelen = len;
		state.writecb = cb;
		state.writing = true;
		state.sync = true;
		stream._write(chunk, encoding, state.onwrite);
		state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
		if (sync)
			timers.setImmediate(function() {
				cb(er);
			});
		else
			cb(er);

		stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
		state.writing = false;
		state.writecb = null;
		state.length -= state.writelen;
		state.writelen = 0;
	}

	function onwrite(stream, er) {
		var state = stream._writableState;
		var sync = state.sync;
		var cb = state.writecb;

		onwriteStateUpdate(state);

		if (er)
			onwriteError(stream, state, sync, er, cb);
		else {
			// Check if we're actually ready to finish, but don't emit yet
			var finished = needFinish(stream, state);

			if (!finished && !state.bufferProcessing && state.buffer.length)
				clearBuffer(stream, state);

			if (sync) {
				timers.setImmediate(function() {
					afterWrite(stream, state, finished, cb);
				});
			} else {
				afterWrite(stream, state, finished, cb);
			}
		}
	}

	function afterWrite(stream, state, finished, cb) {
		if (!finished)
			onwriteDrain(stream, state);
		cb();
		if (finished)
			finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
		if (state.length === 0 && state.needDrain) {
			state.needDrain = false;
			stream.emit('drain');
		}
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
		state.bufferProcessing = true;

		for (var c = 0; c < state.buffer.length; c++) {
			var entry = state.buffer[c];
			var chunk = entry.chunk;
			var encoding = entry.encoding;
			var cb = entry.callback;
			var len = state.objectMode ? 1 : chunk.length;

			doWrite(stream, state, len, chunk, encoding, cb);

			// if we didn't call the onwrite immediately, then
			// it means that we need to wait until it does.
			// also, that means that the chunk and cb are currently
			// being processed, so move the buffer counter past them.
			if (state.writing) {
				c++;
				break;
			}
		}

		state.bufferProcessing = false;
		if (c < state.buffer.length)
			state.buffer = state.buffer.slice(c);
		else
			state.buffer.length = 0;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
		cb(new Error('not implemented'));
	};

	Writable.prototype.end = function(chunk, encoding, cb) {
		var state = this._writableState;

		if (typeof chunk === 'function') {
			cb = chunk;
			chunk = null;
			encoding = null;
		} else if (typeof encoding === 'function') {
			cb = encoding;
			encoding = null;
		}

		if (typeof chunk !== 'undefined' && chunk !== null)
			this.write(chunk, encoding);

		// ignore unnecessary end() calls.
		if (!state.ending && !state.finished)
			endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
		return (state.ending &&
			state.length === 0 &&
			!state.finished &&
			!state.writing);
	}

	function finishMaybe(stream, state) {
		var need = needFinish(stream, state);
		if (need) {
			state.finished = true;
			stream.emit('finish');
		}
		return need;
	}

	function endWritable(stream, state, cb) {
		state.ending = true;
		finishMaybe(stream, state);
		if (cb) {
			if (state.finished)
				timers.setImmediate(cb);
			else
				stream.once('finish', cb);
		}
		state.ended = true;
	}

},{"buffer":15,"stream":9,"timers":11,"util":13}],7:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// UTILITY
	var util = require('util');
	var shims = require('_shims');
	var pSlice = Array.prototype.slice;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
		this.name = 'AssertionError';
		this.actual = options.actual;
		this.expected = options.expected;
		this.operator = options.operator;
		this.message = options.message || getMessage(this);
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
		if (util.isUndefined(value)) {
			return '' + value;
		}
		if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
			return value.toString();
		}
		if (util.isFunction(value) || util.isRegExp(value)) {
			return value.toString();
		}
		return value;
	}

	function truncate(s, n) {
		if (util.isString(s)) {
			return s.length < n ? s : s.slice(0, n);
		} else {
			return s;
		}
	}

	function getMessage(self) {
		return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
		self.operator + ' ' +
		truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
		throw new assert.AssertionError({
			message: message,
			actual: actual,
			expected: expected,
			operator: operator,
			stackStartFunction: stackStartFunction
		});
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
		if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
		if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
		if (actual == expected) {
			fail(actual, expected, message, '!=', assert.notEqual);
		}
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
		if (!_deepEqual(actual, expected)) {
			fail(actual, expected, message, 'deepEqual', assert.deepEqual);
		}
	};

	function _deepEqual(actual, expected) {
		// 7.1. All identical values are equivalent, as determined by ===.
		if (actual === expected) {
			return true;

		} else if (util.isBuffer(actual) && util.isBuffer(expected)) {
			if (actual.length != expected.length) return false;

			for (var i = 0; i < actual.length; i++) {
				if (actual[i] !== expected[i]) return false;
			}

			return true;

		// 7.2. If the expected value is a Date object, the actual value is
		// equivalent if it is also a Date object that refers to the same time.
	} else if (util.isDate(actual) && util.isDate(expected)) {
		return actual.getTime() === expected.getTime();

		// 7.3 If the expected value is a RegExp object, the actual value is
		// equivalent if it is also a RegExp object with the same source and
		// properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	} else if (util.isRegExp(actual) && util.isRegExp(expected)) {
		return actual.source === expected.source &&
		actual.global === expected.global &&
		actual.multiline === expected.multiline &&
		actual.lastIndex === expected.lastIndex &&
		actual.ignoreCase === expected.ignoreCase;

		// 7.4. Other pairs that do not both pass typeof value == 'object',
		// equivalence is determined by ==.
	} else if (!util.isObject(actual) && !util.isObject(expected)) {
		return actual == expected;

		// 7.5 For all other Object pairs, including Array objects, equivalence is
		// determined by having the same number of owned properties (as verified
		// with Object.prototype.hasOwnProperty.call), the same set of keys
		// (although not necessarily the same order), equivalent values for every
		// corresponding key, and an identical 'prototype' property. Note: this
		// accounts for both named and indexed properties on Arrays.
	} else {
		return objEquiv(actual, expected);
	}
	}

	function isArguments(object) {
		return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
		if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
			return false;
		// an identical 'prototype' property.
		if (a.prototype !== b.prototype) return false;
		//~~~I've managed to break Object.keys through screwy arguments passing.
		//   Converting to array solves the problem.
		if (isArguments(a)) {
			if (!isArguments(b)) {
				return false;
			}
			a = pSlice.call(a);
			b = pSlice.call(b);
			return _deepEqual(a, b);
		}
		try {
			var ka = shims.keys(a),
			kb = shims.keys(b),
			key, i;
		} catch (e) {//happens when one is a string literal and the other isn't
		return false;
	}
		// having the same number of owned properties (keys incorporates
		// hasOwnProperty)
	if (ka.length != kb.length)
		return false;
		//the same set of keys (although not necessarily the same order),
		ka.sort();
		kb.sort();
		//~~~cheap key test
		for (i = ka.length - 1; i >= 0; i--) {
			if (ka[i] != kb[i])
				return false;
		}
		//equivalent values for every corresponding key, and
		//~~~possibly expensive deep test
		for (i = ka.length - 1; i >= 0; i--) {
			key = ka[i];
			if (!_deepEqual(a[key], b[key])) return false;
		}
		return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
		if (_deepEqual(actual, expected)) {
			fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
		}
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
		if (actual !== expected) {
			fail(actual, expected, message, '===', assert.strictEqual);
		}
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
		if (actual === expected) {
			fail(actual, expected, message, '!==', assert.notStrictEqual);
		}
	};

	function expectedException(actual, expected) {
		if (!actual || !expected) {
			return false;
		}

		if (Object.prototype.toString.call(expected) == '[object RegExp]') {
			return expected.test(actual);
		} else if (actual instanceof expected) {
			return true;
		} else if (expected.call({}, actual) === true) {
			return true;
		}

		return false;
	}

	function _throws(shouldThrow, block, expected, message) {
		var actual;

		if (util.isString(expected)) {
			message = expected;
			expected = null;
		}

		try {
			block();
		} catch (e) {
			actual = e;
		}

		message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
		(message ? ' ' + message : '.');

		if (shouldThrow && !actual) {
			fail(actual, expected, 'Missing expected exception' + message);
		}

		if (!shouldThrow && expectedException(actual, expected)) {
			fail(actual, expected, 'Got unwanted exception' + message);
		}

		if ((shouldThrow && actual && expected &&
			!expectedException(actual, expected)) || (!shouldThrow && actual)) {
			throw actual;
	}
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
		_throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
		_throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":1,"util":13}],8:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var util = require('util');

	function EventEmitter() {
		this._events = this._events || {};
		this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
		if (!util.isNumber(n) || n < 0)
			throw TypeError('n must be a positive number');
		this._maxListeners = n;
		return this;
	};

	EventEmitter.prototype.emit = function(type) {
		var er, handler, len, args, i, listeners;

		if (!this._events)
			this._events = {};

		// If there is no 'error' event listener then throw.
		if (type === 'error') {
			if (!this._events.error ||
				(util.isObject(this._events.error) && !this._events.error.length)) {
				er = arguments[1];
			if (er instanceof Error) {
					throw er; // Unhandled 'error' event
				} else {
					throw TypeError('Uncaught, unspecified "error" event.');
				}
				return false;
			}
		}

		handler = this._events[type];

		if (util.isUndefined(handler))
			return false;

		if (util.isFunction(handler)) {
			switch (arguments.length) {
				// fast cases
				case 1:
				handler.call(this);
				break;
				case 2:
				handler.call(this, arguments[1]);
				break;
				case 3:
				handler.call(this, arguments[1], arguments[2]);
				break;
				// slower
				default:
				len = arguments.length;
				args = new Array(len - 1);
				for (i = 1; i < len; i++)
					args[i - 1] = arguments[i];
				handler.apply(this, args);
			}
		} else if (util.isObject(handler)) {
			len = arguments.length;
			args = new Array(len - 1);
			for (i = 1; i < len; i++)
				args[i - 1] = arguments[i];

			listeners = handler.slice();
			len = listeners.length;
			for (i = 0; i < len; i++)
				listeners[i].apply(this, args);
		}

		return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
		var m;

		if (!util.isFunction(listener))
			throw TypeError('listener must be a function');

		if (!this._events)
			this._events = {};

		// To avoid recursion in the case that type === "newListener"! Before
		// adding it to the listeners, first emit "newListener".
		if (this._events.newListener)
			this.emit('newListener', type,
				util.isFunction(listener.listener) ?
				listener.listener : listener);

		if (!this._events[type])
			// Optimize the case of one listener. Don't need the extra array object.
		this._events[type] = listener;
		else if (util.isObject(this._events[type]))
			// If we've already got an array, just append.
		this._events[type].push(listener);
		else
			// Adding the second element, need to change to array.
		this._events[type] = [this._events[type], listener];

		// Check for listener leak
		if (util.isObject(this._events[type]) && !this._events[type].warned) {
			var m;
			if (!util.isUndefined(this._maxListeners)) {
				m = this._maxListeners;
			} else {
				m = EventEmitter.defaultMaxListeners;
			}

			if (m && m > 0 && this._events[type].length > m) {
				this._events[type].warned = true;
				console.error('(node) warning: possible EventEmitter memory ' +
					'leak detected. %d listeners added. ' +
					'Use emitter.setMaxListeners() to increase limit.',
					this._events[type].length);
				console.trace();
			}
		}

		return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
		if (!util.isFunction(listener))
			throw TypeError('listener must be a function');

		function g() {
			this.removeListener(type, g);
			listener.apply(this, arguments);
		}

		g.listener = listener;
		this.on(type, g);

		return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
		var list, position, length, i;

		if (!util.isFunction(listener))
			throw TypeError('listener must be a function');

		if (!this._events || !this._events[type])
			return this;

		list = this._events[type];
		length = list.length;
		position = -1;

		if (list === listener ||
			(util.isFunction(list.listener) && list.listener === listener)) {
			delete this._events[type];
		if (this._events.removeListener)
			this.emit('removeListener', type, listener);

	} else if (util.isObject(list)) {
		for (i = length; i-- > 0;) {
			if (list[i] === listener ||
				(list[i].listener && list[i].listener === listener)) {
				position = i;
			break;
		}
	}

	if (position < 0)
		return this;

	if (list.length === 1) {
		list.length = 0;
		delete this._events[type];
	} else {
		list.splice(position, 1);
	}

	if (this._events.removeListener)
		this.emit('removeListener', type, listener);
	}

	return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
		var key, listeners;

		if (!this._events)
			return this;

		// not listening for removeListener, no need to emit
		if (!this._events.removeListener) {
			if (arguments.length === 0)
				this._events = {};
			else if (this._events[type])
				delete this._events[type];
			return this;
		}

		// emit removeListener for all listeners on all events
		if (arguments.length === 0) {
			for (key in this._events) {
				if (key === 'removeListener') continue;
				this.removeAllListeners(key);
			}
			this.removeAllListeners('removeListener');
			this._events = {};
			return this;
		}

		listeners = this._events[type];

		if (util.isFunction(listeners)) {
			this.removeListener(type, listeners);
		} else {
			// LIFO order
			while (listeners.length)
				this.removeListener(type, listeners[listeners.length - 1]);
		}
		delete this._events[type];

		return this;
	};

	EventEmitter.prototype.listeners = function(type) {
		var ret;
		if (!this._events || !this._events[type])
			ret = [];
		else if (util.isFunction(this._events[type]))
			ret = [this._events[type]];
		else
			ret = this._events[type].slice();
		return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
		var ret;
		if (!emitter._events || !emitter._events[type])
			ret = 0;
		else if (util.isFunction(emitter._events[type]))
			ret = 1;
		else
			ret = emitter._events[type].length;
		return ret;
	};
},{"util":13}],9:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Stream;

	var EE = require('events').EventEmitter;
	var util = require('util');

	util.inherits(Stream, EE);
	Stream.Readable = require('_stream_readable');
	Stream.Writable = require('_stream_writable');
	Stream.Duplex = require('_stream_duplex');
	Stream.Transform = require('_stream_transform');
	Stream.PassThrough = require('_stream_passthrough');

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
		EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
		var source = this;

		function ondata(chunk) {
			if (dest.writable) {
				if (false === dest.write(chunk) && source.pause) {
					source.pause();
				}
			}
		}

		source.on('data', ondata);

		function ondrain() {
			if (source.readable && source.resume) {
				source.resume();
			}
		}

		dest.on('drain', ondrain);

		// If the 'end' option is not supplied, dest.end() will be called when
		// source gets the 'end' or 'close' events.  Only dest.end() once.
		if (!dest._isStdio && (!options || options.end !== false)) {
			source.on('end', onend);
			source.on('close', onclose);
		}

		var didOnEnd = false;
		function onend() {
			if (didOnEnd) return;
			didOnEnd = true;

			dest.end();
		}


		function onclose() {
			if (didOnEnd) return;
			didOnEnd = true;

			if (typeof dest.destroy === 'function') dest.destroy();
		}

		// don't leave dangling pipes when there are errors.
		function onerror(er) {
			cleanup();
			if (EE.listenerCount(this, 'error') === 0) {
				throw er; // Unhandled stream error in pipe.
			}
		}

		source.on('error', onerror);
		dest.on('error', onerror);

		// remove all the event listeners that were added.
		function cleanup() {
			source.removeListener('data', ondata);
			dest.removeListener('drain', ondrain);

			source.removeListener('end', onend);
			source.removeListener('close', onclose);

			source.removeListener('error', onerror);
			dest.removeListener('error', onerror);

			source.removeListener('end', cleanup);
			source.removeListener('close', cleanup);

			dest.removeListener('close', cleanup);
		}

		source.on('end', cleanup);
		source.on('close', cleanup);

		dest.on('close', cleanup);

		dest.emit('pipe', source);

		// Allow for unix-like usage: A.pipe(B).pipe(C)
		return dest;
	};

},{"_stream_duplex":2,"_stream_passthrough":3,"_stream_readable":4,"_stream_transform":5,"_stream_writable":6,"events":8,"util":13}],10:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = require('buffer').Buffer;

	function assertEncoding(encoding) {
		if (encoding && !Buffer.isEncoding(encoding)) {
			throw new Error('Unknown encoding: ' + encoding);
		}
	}

	var StringDecoder = exports.StringDecoder = function(encoding) {
		this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
		assertEncoding(encoding);
		switch (this.encoding) {
			case 'utf8':
				// CESU-8 represents each of Surrogate Pair by 3-bytes
				this.surrogateSize = 3;
				break;
				case 'ucs2':
				case 'utf16le':
				// UTF-16 represents each of Surrogate Pair by 2-bytes
				this.surrogateSize = 2;
				this.detectIncompleteChar = utf16DetectIncompleteChar;
				break;
				case 'base64':
				// Base-64 stores 3 bytes in 4 chars, and pads the remainder.
				this.surrogateSize = 3;
				this.detectIncompleteChar = base64DetectIncompleteChar;
				break;
				default:
				this.write = passThroughWrite;
				return;
			}

			this.charBuffer = new Buffer(6);
			this.charReceived = 0;
			this.charLength = 0;
		};


		StringDecoder.prototype.write = function(buffer) {
			var charStr = '';
			var offset = 0;

		// if our last write ended with an incomplete multibyte character
		while (this.charLength) {
			// determine how many remaining bytes this buffer has to offer for this char
			var i = (buffer.length >= this.charLength - this.charReceived) ?
			this.charLength - this.charReceived :
			buffer.length;

			// add the new bytes to the char buffer
			buffer.copy(this.charBuffer, this.charReceived, offset, i);
			this.charReceived += (i - offset);
			offset = i;

			if (this.charReceived < this.charLength) {
				// still not enough chars in this buffer? wait for more ...
				return '';
			}

			// get the character that was split
			charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

			// lead surrogate (D800-DBFF) is also the incomplete character
			var charCode = charStr.charCodeAt(charStr.length - 1);
			if (charCode >= 0xD800 && charCode <= 0xDBFF) {
				this.charLength += this.surrogateSize;
				charStr = '';
				continue;
			}
			this.charReceived = this.charLength = 0;

			// if there are no more bytes in this buffer, just emit our char
			if (i == buffer.length) return charStr;

			// otherwise cut off the characters end from the beginning of this buffer
			buffer = buffer.slice(i, buffer.length);
			break;
		}

		var lenIncomplete = this.detectIncompleteChar(buffer);

		var end = buffer.length;
		if (this.charLength) {
			// buffer the incomplete character bytes we got
			buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);
			this.charReceived = lenIncomplete;
			end -= lenIncomplete;
		}

		charStr += buffer.toString(this.encoding, 0, end);

		var end = charStr.length - 1;
		var charCode = charStr.charCodeAt(end);
		// lead surrogate (D800-DBFF) is also the incomplete character
		if (charCode >= 0xD800 && charCode <= 0xDBFF) {
			var size = this.surrogateSize;
			this.charLength += size;
			this.charReceived += size;
			this.charBuffer.copy(this.charBuffer, size, 0, size);
			this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);
			return charStr.substring(0, end);
		}

		// or just emit the charStr
		return charStr;
	};

	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
		// determine how many bytes we have to check at the end of this buffer
		var i = (buffer.length >= 3) ? 3 : buffer.length;

		// Figure out if one of the last i bytes of our buffer announces an
		// incomplete char.
		for (; i > 0; i--) {
			var c = buffer[buffer.length - i];

			// See http://en.wikipedia.org/wiki/UTF-8#Description

			// 110XXXXX
			if (i == 1 && c >> 5 == 0x06) {
				this.charLength = 2;
				break;
			}

			// 1110XXXX
			if (i <= 2 && c >> 4 == 0x0E) {
				this.charLength = 3;
				break;
			}

			// 11110XXX
			if (i <= 3 && c >> 3 == 0x1E) {
				this.charLength = 4;
				break;
			}
		}

		return i;
	};

	StringDecoder.prototype.end = function(buffer) {
		var res = '';
		if (buffer && buffer.length)
			res = this.write(buffer);

		if (this.charReceived) {
			var cr = this.charReceived;
			var buf = this.charBuffer;
			var enc = this.encoding;
			res += buf.slice(0, cr).toString(enc);
		}

		return res;
	};

	function passThroughWrite(buffer) {
		return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
		var incomplete = this.charReceived = buffer.length % 2;
		this.charLength = incomplete ? 2 : 0;
		return incomplete;
	}

	function base64DetectIncompleteChar(buffer) {
		var incomplete = this.charReceived = buffer.length % 3;
		this.charLength = incomplete ? 3 : 0;
		return incomplete;
	}

},{"buffer":15}],11:[function(require,module,exports){
	try {
		// Old IE browsers that do not curry arguments
		if (!setTimeout.call) {
			var slicer = Array.prototype.slice;
			exports.setTimeout = function(fn) {
				var args = slicer.call(arguments, 1);
				return setTimeout(function() {
					return fn.apply(this, args);
				})
			};

			exports.setInterval = function(fn) {
				var args = slicer.call(arguments, 1);
				return setInterval(function() {
					return fn.apply(this, args);
				});
			};
		} else {
			exports.setTimeout = setTimeout;
			exports.setInterval = setInterval;
		}
		exports.clearTimeout = clearTimeout;
		exports.clearInterval = clearInterval;

		if (window.setImmediate) {
			exports.setImmediate = window.setImmediate;
			exports.clearImmediate = window.clearImmediate;
		}

		// Chrome and PhantomJS seems to depend on `this` pseudo variable being a
		// `window` and throws invalid invocation exception otherwise. If this code
		// runs in such JS runtime next line will throw and `catch` clause will
		// exported timers functions bound to a window.
		exports.setTimeout(function() {});
	} catch (_) {
		function bind(f, context) {
			return function () { return f.apply(context, arguments) };
		}

		if (typeof window !== 'undefined') {
			exports.setTimeout = bind(setTimeout, window);
			exports.setInterval = bind(setInterval, window);
			exports.clearTimeout = bind(clearTimeout, window);
			exports.clearInterval = bind(clearInterval, window);
			if (window.setImmediate) {
				exports.setImmediate = bind(window.setImmediate, window);
				exports.clearImmediate = bind(window.clearImmediate, window);
			}
		} else {
			if (typeof setTimeout !== 'undefined') {
				exports.setTimeout = setTimeout;
			}
			if (typeof setInterval !== 'undefined') {
				exports.setInterval = setInterval;
			}
			if (typeof clearTimeout !== 'undefined') {
				exports.clearTimeout = clearTimeout;
			}
			if (typeof clearInterval === 'function') {
				exports.clearInterval = clearInterval;
			}
		}
	}

	exports.unref = function unref() {};
	exports.ref = function ref() {};

	if (!exports.setImmediate) {
		var currentKey = 0, queue = {}, active = false;

		exports.setImmediate = (function () {
			function drain() {
				active = false;
				for (var key in queue) {
					if (queue.hasOwnProperty(currentKey, key)) {
						var fn = queue[key];
						delete queue[key];
						fn();
					}
				}
			}

			if (typeof window !== 'undefined' && window.postMessage && window.addEventListener) {
				window.addEventListener('message', function (ev) {
					if (ev.source === window && ev.data === 'browserify-tick') {
						ev.stopPropagation();
						drain();
					}
				}, true);

				return function setImmediate(fn) {
					var id = ++currentKey;
					queue[id] = fn;
					if (!active) {
						active = true;
						window.postMessage('browserify-tick', '*');
					}
					return id;
				};
			} else {
				return function setImmediate(fn) {
					var id = ++currentKey;
					queue[id] = fn;
					if (!active) {
						active = true;
						setTimeout(drain, 0);
					}
					return id;
				};
			}
		})();

		exports.clearImmediate = function clearImmediate(id) {
			delete queue[id];
		};
	}

},{}],12:[function(require,module,exports){

		exports.isatty = function () { return false; };

		function ReadStream() {
			throw new Error('tty.ReadStream is not implemented');
		}
		exports.ReadStream = ReadStream;

		function WriteStream() {
			throw new Error('tty.ReadStream is not implemented');
		}
		exports.WriteStream = WriteStream;

},{}],13:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var shims = require('_shims');

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
		if (!isString(f)) {
			var objects = [];
			for (var i = 0; i < arguments.length; i++) {
				objects.push(inspect(arguments[i]));
			}
			return objects.join(' ');
		}

		var i = 1;
		var args = arguments;
		var len = args.length;
		var str = String(f).replace(formatRegExp, function(x) {
			if (x === '%%') return '%';
			if (i >= len) return x;
			switch (x) {
				case '%s': return String(args[i++]);
				case '%d': return Number(args[i++]);
				case '%j':
				try {
					return JSON.stringify(args[i++]);
				} catch (_) {
					return '[Circular]';
				}
				default:
				return x;
			}
		});
		for (var x = args[i]; i < len; x = args[++i]) {
			if (isNull(x) || !isObject(x)) {
				str += ' ' + x;
			} else {
				str += ' ' + inspect(x);
			}
		}
		return str;
	};

	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	 /* legacy: obj, showHidden, depth, colors*/
	 function inspect(obj, opts) {
		// default options
		var ctx = {
			seen: [],
			stylize: stylizeNoColor
		};
		// legacy...
		if (arguments.length >= 3) ctx.depth = arguments[2];
		if (arguments.length >= 4) ctx.colors = arguments[3];
		if (isBoolean(opts)) {
			// legacy...
			ctx.showHidden = opts;
		} else if (opts) {
			// got an "options" object
			exports._extend(ctx, opts);
		}
		// set default options
		if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
		if (isUndefined(ctx.depth)) ctx.depth = 2;
		if (isUndefined(ctx.colors)) ctx.colors = false;
		if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
		if (ctx.colors) ctx.stylize = stylizeWithColor;
		return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
		'bold' : [1, 22],
		'italic' : [3, 23],
		'underline' : [4, 24],
		'inverse' : [7, 27],
		'white' : [37, 39],
		'grey' : [90, 39],
		'black' : [30, 39],
		'blue' : [34, 39],
		'cyan' : [36, 39],
		'green' : [32, 39],
		'magenta' : [35, 39],
		'red' : [31, 39],
		'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
		'special': 'cyan',
		'number': 'yellow',
		'boolean': 'yellow',
		'undefined': 'grey',
		'null': 'bold',
		'string': 'green',
		'date': 'magenta',
		// "name": intentionally not styling
		'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
		var style = inspect.styles[styleType];

		if (style) {
			return '\u001b[' + inspect.colors[style][0] + 'm' + str +
			'\u001b[' + inspect.colors[style][1] + 'm';
		} else {
			return str;
		}
	}


	function stylizeNoColor(str, styleType) {
		return str;
	}


	function arrayToHash(array) {
		var hash = {};

		shims.forEach(array, function(val, idx) {
			hash[val] = true;
		});

		return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
		// Provide a hook for user-specified inspect functions.
		// Check that value is an object with an inspect function on it
		if (ctx.customInspect &&
			value &&
			isFunction(value.inspect) &&
				// Filter out the util module, it's inspect function is special
				value.inspect !== exports.inspect &&
				// Also filter out any prototype objects using the circular check.
				!(value.constructor && value.constructor.prototype === value)) {
			var ret = value.inspect(recurseTimes);
		if (!isString(ret)) {
			ret = formatValue(ctx, ret, recurseTimes);
		}
		return ret;
	}

		// Primitive types cannot have properties
		var primitive = formatPrimitive(ctx, value);
		if (primitive) {
			return primitive;
		}

		// Look up the keys of the object.
		var keys = shims.keys(value);
		var visibleKeys = arrayToHash(keys);

		if (ctx.showHidden) {
			keys = shims.getOwnPropertyNames(value);
		}

		// Some type of object without properties can be shortcutted.
		if (keys.length === 0) {
			if (isFunction(value)) {
				var name = value.name ? ': ' + value.name : '';
				return ctx.stylize('[Function' + name + ']', 'special');
			}
			if (isRegExp(value)) {
				return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
			}
			if (isDate(value)) {
				return ctx.stylize(Date.prototype.toString.call(value), 'date');
			}
			if (isError(value)) {
				return formatError(value);
			}
		}

		var base = '', array = false, braces = ['{', '}'];

		// Make Array say that they are Array
		if (isArray(value)) {
			array = true;
			braces = ['[', ']'];
		}

		// Make functions say that they are functions
		if (isFunction(value)) {
			var n = value.name ? ': ' + value.name : '';
			base = ' [Function' + n + ']';
		}

		// Make RegExps say that they are RegExps
		if (isRegExp(value)) {
			base = ' ' + RegExp.prototype.toString.call(value);
		}

		// Make dates with properties first say the date
		if (isDate(value)) {
			base = ' ' + Date.prototype.toUTCString.call(value);
		}

		// Make error with message first say the error
		if (isError(value)) {
			base = ' ' + formatError(value);
		}

		if (keys.length === 0 && (!array || value.length == 0)) {
			return braces[0] + base + braces[1];
		}

		if (recurseTimes < 0) {
			if (isRegExp(value)) {
				return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
			} else {
				return ctx.stylize('[Object]', 'special');
			}
		}

		ctx.seen.push(value);

		var output;
		if (array) {
			output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
		} else {
			output = keys.map(function(key) {
				return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
			});
		}

		ctx.seen.pop();

		return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
		if (isUndefined(value))
			return ctx.stylize('undefined', 'undefined');
		if (isString(value)) {
			var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
			.replace(/'/g, "\\'")
			.replace(/\\"/g, '"') + '\'';
			return ctx.stylize(simple, 'string');
		}
		if (isNumber(value))
			return ctx.stylize('' + value, 'number');
		if (isBoolean(value))
			return ctx.stylize('' + value, 'boolean');
		// For some reason typeof null is "object", so special case here.
		if (isNull(value))
			return ctx.stylize('null', 'null');
	}


	function formatError(value) {
		return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
		var output = [];
		for (var i = 0, l = value.length; i < l; ++i) {
			if (hasOwnProperty(value, String(i))) {
				output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
					String(i), true));
			} else {
				output.push('');
			}
		}

		shims.forEach(keys, function(key) {
			if (!key.match(/^\d+$/)) {
				output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
					key, true));
			}
		});
		return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
		var name, str, desc;
		desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
		if (desc.get) {
			if (desc.set) {
				str = ctx.stylize('[Getter/Setter]', 'special');
			} else {
				str = ctx.stylize('[Getter]', 'special');
			}
		} else {
			if (desc.set) {
				str = ctx.stylize('[Setter]', 'special');
			}
		}

		if (!hasOwnProperty(visibleKeys, key)) {
			name = '[' + key + ']';
		}
		if (!str) {
			if (shims.indexOf(ctx.seen, desc.value) < 0) {
				if (isNull(recurseTimes)) {
					str = formatValue(ctx, desc.value, null);
				} else {
					str = formatValue(ctx, desc.value, recurseTimes - 1);
				}
				if (str.indexOf('\n') > -1) {
					if (array) {
						str = str.split('\n').map(function(line) {
							return '  ' + line;
						}).join('\n').substr(2);
					} else {
						str = '\n' + str.split('\n').map(function(line) {
							return '   ' + line;
						}).join('\n');
					}
				}
			} else {
				str = ctx.stylize('[Circular]', 'special');
			}
		}
		if (isUndefined(name)) {
			if (array && key.match(/^\d+$/)) {
				return str;
			}
			name = JSON.stringify('' + key);
			if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
				name = name.substr(1, name.length - 2);
				name = ctx.stylize(name, 'name');
			} else {
				name = name.replace(/'/g, "\\'")
				.replace(/\\"/g, '"')
				.replace(/(^"|"$)/g, "'");
				name = ctx.stylize(name, 'string');
			}
		}

		return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
		var numLinesEst = 0;
		var length = shims.reduce(output, function(prev, cur) {
			numLinesEst++;
			if (cur.indexOf('\n') >= 0) numLinesEst++;
			return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
		}, 0);

		if (length > 60) {
			return braces[0] +
			(base === '' ? '' : base + '\n ') +
			' ' +
			output.join(',\n  ') +
			' ' +
			braces[1];
		}

		return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
		return shims.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
		return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
		return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
		return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
		return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
		return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
		return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
		return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
		return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
		return typeof arg === 'object' && arg;
	}
	exports.isObject = isObject;

	function isDate(d) {
		return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
		return isObject(e) && objectToString(e) === '[object Error]';
	}
	exports.isError = isError;

	function isFunction(arg) {
		return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
		return arg === null ||
		typeof arg === 'boolean' ||
		typeof arg === 'number' ||
		typeof arg === 'string' ||
					 typeof arg === 'symbol' ||  // ES6 symbol
					 typeof arg === 'undefined';
				 }
				 exports.isPrimitive = isPrimitive;

				 function isBuffer(arg) {
					return arg && typeof arg === 'object'
					&& typeof arg.copy === 'function'
					&& typeof arg.fill === 'function'
					&& typeof arg.binarySlice === 'function'
					;
				}
				exports.isBuffer = isBuffer;

				function objectToString(o) {
					return Object.prototype.toString.call(o);
				}


				function pad(n) {
					return n < 10 ? '0' + n.toString(10) : n.toString(10);
				}


				var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
				'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
		var d = new Date();
		var time = [pad(d.getHours()),
		pad(d.getMinutes()),
		pad(d.getSeconds())].join(':');
		return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
		console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	 exports.inherits = function(ctor, superCtor) {
		ctor.super_ = superCtor;
		ctor.prototype = shims.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

	exports._extend = function(origin, add) {
		// Don't do anything if add isn't an object
		if (!add || !isObject(add)) return origin;

		var keys = shims.keys(add);
		var i = keys.length;
		while (i--) {
			origin[keys[i]] = add[keys[i]];
		}
		return origin;
	};

	function hasOwnProperty(obj, prop) {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}

},{"_shims":1}],14:[function(require,module,exports){
	exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
		var e, m,
		eLen = nBytes * 8 - mLen - 1,
		eMax = (1 << eLen) - 1,
		eBias = eMax >> 1,
		nBits = -7,
		i = isBE ? 0 : (nBytes - 1),
		d = isBE ? 1 : -1,
		s = buffer[offset + i];

		i += d;

		e = s & ((1 << (-nBits)) - 1);
		s >>= (-nBits);
		nBits += eLen;
		for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

			m = e & ((1 << (-nBits)) - 1);
		e >>= (-nBits);
		nBits += mLen;
		for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

			if (e === 0) {
				e = 1 - eBias;
			} else if (e === eMax) {
				return m ? NaN : ((s ? -1 : 1) * Infinity);
			} else {
				m = m + Math.pow(2, mLen);
				e = e - eBias;
			}
			return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
		};

		exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
			var e, m, c,
			eLen = nBytes * 8 - mLen - 1,
			eMax = (1 << eLen) - 1,
			eBias = eMax >> 1,
			rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
			i = isBE ? (nBytes - 1) : 0,
			d = isBE ? -1 : 1,
			s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

			value = Math.abs(value);

			if (isNaN(value) || value === Infinity) {
				m = isNaN(value) ? 1 : 0;
				e = eMax;
			} else {
				e = Math.floor(Math.log(value) / Math.LN2);
				if (value * (c = Math.pow(2, -e)) < 1) {
					e--;
					c *= 2;
				}
				if (e + eBias >= 1) {
					value += rt / c;
				} else {
					value += rt * Math.pow(2, 1 - eBias);
				}
				if (value * c >= 2) {
					e++;
					c /= 2;
				}

				if (e + eBias >= eMax) {
					m = 0;
					e = eMax;
				} else if (e + eBias >= 1) {
					m = (value * c - 1) * Math.pow(2, mLen);
					e = e + eBias;
				} else {
					m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
					e = 0;
				}
			}

			for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

				e = (e << mLen) | m;
			eLen += mLen;
			for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

				buffer[offset + i - d] |= s * 128;
		};

},{}],15:[function(require,module,exports){
	var assert;
	exports.Buffer = Buffer;
	exports.SlowBuffer = Buffer;
	Buffer.poolSize = 8192;
	exports.INSPECT_MAX_BYTES = 50;

	function stringtrim(str) {
		if (str.trim) return str.trim();
		return str.replace(/^\s+|\s+$/g, '');
	}

	function Buffer(subject, encoding, offset) {
		if(!assert) assert= require('assert');
		if (!(this instanceof Buffer)) {
			return new Buffer(subject, encoding, offset);
		}
		this.parent = this;
		this.offset = 0;

		// Work-around: node's base64 implementation
		// allows for non-padded strings while base64-js
		// does not..
		if (encoding == "base64" && typeof subject == "string") {
			subject = stringtrim(subject);
			while (subject.length % 4 != 0) {
				subject = subject + "="; 
			}
		}

		var type;

		// Are we slicing?
		if (typeof offset === 'number') {
			this.length = coerce(encoding);
			// slicing works, with limitations (no parent tracking/update)
			// check https://github.com/toots/buffer-browserify/issues/19
			for (var i = 0; i < this.length; i++) {
				this[i] = subject.get(i+offset);
			}
		} else {
			// Find the length
			switch (type = typeof subject) {
				case 'number':
				this.length = coerce(subject);
				break;

				case 'string':
				this.length = Buffer.byteLength(subject, encoding);
				break;

				case 'object': // Assume object is an array
				this.length = coerce(subject.length);
				break;

				default:
				throw new Error('First argument needs to be a number, ' +
					'array or string.');
			}

			// Treat array-ish objects as a byte array.
			if (isArrayIsh(subject)) {
				for (var i = 0; i < this.length; i++) {
					if (subject instanceof Buffer) {
						this[i] = subject.readUInt8(i);
					}
					else {
						this[i] = subject[i];
					}
				}
			} else if (type == 'string') {
				// We are a string
				this.length = this.write(subject, 0, encoding);
			} else if (type === 'number') {
				for (var i = 0; i < this.length; i++) {
					this[i] = 0;
				}
			}
		}
	}

	Buffer.prototype.get = function get(i) {
		if (i < 0 || i >= this.length) throw new Error('oob');
		return this[i];
	};

	Buffer.prototype.set = function set(i, v) {
		if (i < 0 || i >= this.length) throw new Error('oob');
		return this[i] = v;
	};

	Buffer.byteLength = function (str, encoding) {
		switch (encoding || "utf8") {
			case 'hex':
			return str.length / 2;

			case 'utf8':
			case 'utf-8':
			return utf8ToBytes(str).length;

			case 'ascii':
			case 'binary':
			return str.length;

			case 'base64':
			return base64ToBytes(str).length;

			default:
			throw new Error('Unknown encoding');
		}
	};

	Buffer.prototype.utf8Write = function (string, offset, length) {
		var bytes, pos;
		return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
	};

	Buffer.prototype.asciiWrite = function (string, offset, length) {
		var bytes, pos;
		return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
	};

	Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

	Buffer.prototype.base64Write = function (string, offset, length) {
		var bytes, pos;
		return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
	};

	Buffer.prototype.base64Slice = function (start, end) {
		var bytes = Array.prototype.slice.apply(this, arguments)
		return require("base64-js").fromByteArray(bytes);
	};

	Buffer.prototype.utf8Slice = function () {
		var bytes = Array.prototype.slice.apply(this, arguments);
		var res = "";
		var tmp = "";
		var i = 0;
		while (i < bytes.length) {
			if (bytes[i] <= 0x7F) {
				res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
				tmp = "";
			} else
			tmp += "%" + bytes[i].toString(16);

			i++;
		}

		return res + decodeUtf8Char(tmp);
	}

	Buffer.prototype.asciiSlice = function () {
		var bytes = Array.prototype.slice.apply(this, arguments);
		var ret = "";
		for (var i = 0; i < bytes.length; i++)
			ret += String.fromCharCode(bytes[i]);
		return ret;
	}

	Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

	Buffer.prototype.inspect = function() {
		var out = [],
		len = this.length;
		for (var i = 0; i < len; i++) {
			out[i] = toHex(this[i]);
			if (i == exports.INSPECT_MAX_BYTES) {
				out[i + 1] = '...';
				break;
			}
		}
		return '<Buffer ' + out.join(' ') + '>';
	};


	Buffer.prototype.hexSlice = function(start, end) {
		var len = this.length;

		if (!start || start < 0) start = 0;
		if (!end || end < 0 || end > len) end = len;

		var out = '';
		for (var i = start; i < end; i++) {
			out += toHex(this[i]);
		}
		return out;
	};


	Buffer.prototype.toString = function(encoding, start, end) {
		encoding = String(encoding || 'utf8').toLowerCase();
		start = +start || 0;
		if (typeof end == 'undefined') end = this.length;

		// Fastpath empty strings
		if (+end == start) {
			return '';
		}

		switch (encoding) {
			case 'hex':
			return this.hexSlice(start, end);

			case 'utf8':
			case 'utf-8':
			return this.utf8Slice(start, end);

			case 'ascii':
			return this.asciiSlice(start, end);

			case 'binary':
			return this.binarySlice(start, end);

			case 'base64':
			return this.base64Slice(start, end);

			case 'ucs2':
			case 'ucs-2':
			return this.ucs2Slice(start, end);

			default:
			throw new Error('Unknown encoding');
		}
	};


	Buffer.prototype.hexWrite = function(string, offset, length) {
		offset = +offset || 0;
		var remaining = this.length - offset;
		if (!length) {
			length = remaining;
		} else {
			length = +length;
			if (length > remaining) {
				length = remaining;
			}
		}

		// must be an even number of digits
		var strLen = string.length;
		if (strLen % 2) {
			throw new Error('Invalid hex string');
		}
		if (length > strLen / 2) {
			length = strLen / 2;
		}
		for (var i = 0; i < length; i++) {
			var byte = parseInt(string.substr(i * 2, 2), 16);
			if (isNaN(byte)) throw new Error('Invalid hex string');
			this[offset + i] = byte;
		}
		Buffer._charsWritten = i * 2;
		return i;
	};


	Buffer.prototype.write = function(string, offset, length, encoding) {
		// Support both (string, offset, length, encoding)
		// and the legacy (string, encoding, offset, length)
		if (isFinite(offset)) {
			if (!isFinite(length)) {
				encoding = length;
				length = undefined;
			}
		} else {  // legacy
			var swap = encoding;
			encoding = offset;
			offset = length;
			length = swap;
		}

		offset = +offset || 0;
		var remaining = this.length - offset;
		if (!length) {
			length = remaining;
		} else {
			length = +length;
			if (length > remaining) {
				length = remaining;
			}
		}
		encoding = String(encoding || 'utf8').toLowerCase();

		switch (encoding) {
			case 'hex':
			return this.hexWrite(string, offset, length);

			case 'utf8':
			case 'utf-8':
			return this.utf8Write(string, offset, length);

			case 'ascii':
			return this.asciiWrite(string, offset, length);

			case 'binary':
			return this.binaryWrite(string, offset, length);

			case 'base64':
			return this.base64Write(string, offset, length);

			case 'ucs2':
			case 'ucs-2':
			return this.ucs2Write(string, offset, length);

			default:
			throw new Error('Unknown encoding');
		}
	};

	// slice(start, end)
	function clamp(index, len, defaultValue) {
		if (typeof index !== 'number') return defaultValue;
		index = ~~index;  // Coerce to integer.
		if (index >= len) return len;
		if (index >= 0) return index;
		index += len;
		if (index >= 0) return index;
		return 0;
	}

	Buffer.prototype.slice = function(start, end) {
		var len = this.length;
		start = clamp(start, len, 0);
		end = clamp(end, len, len);
		return new Buffer(this, end - start, +start);
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function(target, target_start, start, end) {
		var source = this;
		start || (start = 0);
		if (end === undefined || isNaN(end)) {
			end = this.length;
		}
		target_start || (target_start = 0);

		if (end < start) throw new Error('sourceEnd < sourceStart');

		// Copy 0 bytes; we're done
		if (end === start) return 0;
		if (target.length == 0 || source.length == 0) return 0;

		if (target_start < 0 || target_start >= target.length) {
			throw new Error('targetStart out of bounds');
		}

		if (start < 0 || start >= source.length) {
			throw new Error('sourceStart out of bounds');
		}

		if (end < 0 || end > source.length) {
			throw new Error('sourceEnd out of bounds');
		}

		// Are we oob?
		if (end > this.length) {
			end = this.length;
		}

		if (target.length - target_start < end - start) {
			end = target.length - target_start + start;
		}

		var temp = [];
		for (var i=start; i<end; i++) {
			assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
			temp.push(this[i]);
		}

		for (var i=target_start; i<target_start+temp.length; i++) {
			target[i] = temp[i-target_start];
		}
	};

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill(value, start, end) {
		value || (value = 0);
		start || (start = 0);
		end || (end = this.length);

		if (typeof value === 'string') {
			value = value.charCodeAt(0);
		}
		if (!(typeof value === 'number') || isNaN(value)) {
			throw new Error('value is not a number');
		}

		if (end < start) throw new Error('end < start');

		// Fill 0 bytes; we're done
		if (end === start) return 0;
		if (this.length == 0) return 0;

		if (start < 0 || start >= this.length) {
			throw new Error('start out of bounds');
		}

		if (end < 0 || end > this.length) {
			throw new Error('end out of bounds');
		}

		for (var i = start; i < end; i++) {
			this[i] = value;
		}
	}

	// Static methods
	Buffer.isBuffer = function isBuffer(b) {
		return b instanceof Buffer || b instanceof Buffer;
	};

	Buffer.concat = function (list, totalLength) {
		if (!isArray(list)) {
			throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
				list should be an Array.");
		}

		if (list.length === 0) {
			return new Buffer(0);
		} else if (list.length === 1) {
			return list[0];
		}

		if (typeof totalLength !== 'number') {
			totalLength = 0;
			for (var i = 0; i < list.length; i++) {
				var buf = list[i];
				totalLength += buf.length;
			}
		}

		var buffer = new Buffer(totalLength);
		var pos = 0;
		for (var i = 0; i < list.length; i++) {
			var buf = list[i];
			buf.copy(buffer, pos);
			pos += buf.length;
		}
		return buffer;
	};

	Buffer.isEncoding = function(encoding) {
		switch ((encoding + '').toLowerCase()) {
			case 'hex':
			case 'utf8':
			case 'utf-8':
			case 'ascii':
			case 'binary':
			case 'base64':
			case 'ucs2':
			case 'ucs-2':
			case 'utf16le':
			case 'utf-16le':
			case 'raw':
			return true;

			default:
			return false;
		}
	};

	// helpers

	function coerce(length) {
		// Coerce length to a number (possibly NaN), round up
		// in case it's fractional (e.g. 123.456) then do a
		// double negate to coerce a NaN to 0. Easy, right?
		length = ~~Math.ceil(+length);
		return length < 0 ? 0 : length;
	}

	function isArray(subject) {
		return (Array.isArray ||
			function(subject){
				return {}.toString.apply(subject) == '[object Array]'
			})
		(subject)
	}

	function isArrayIsh(subject) {
		return isArray(subject) || Buffer.isBuffer(subject) ||
		subject && typeof subject === 'object' &&
		typeof subject.length === 'number';
	}

	function toHex(n) {
		if (n < 16) return '0' + n.toString(16);
		return n.toString(16);
	}

	function utf8ToBytes(str) {
		var byteArray = [];
		for (var i = 0; i < str.length; i++)
			if (str.charCodeAt(i) <= 0x7F)
				byteArray.push(str.charCodeAt(i));
			else {
				var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
				for (var j = 0; j < h.length; j++)
					byteArray.push(parseInt(h[j], 16));
			}

			return byteArray;
		}

		function asciiToBytes(str) {
			var byteArray = []
			for (var i = 0; i < str.length; i++ )
			// Node's code seems to be doing this and not & 0x7F..
		byteArray.push( str.charCodeAt(i) & 0xFF );

		return byteArray;
	}

	function base64ToBytes(str) {
		return require("base64-js").toByteArray(str);
	}

	function blitBuffer(src, dst, offset, length) {
		var pos, i = 0;
		while (i < length) {
			if ((i+offset >= dst.length) || (i >= src.length))
				break;

			dst[i + offset] = src[i];
			i++;
		}
		return i;
	}

	function decodeUtf8Char(str) {
		try {
			return decodeURIComponent(str);
		} catch (err) {
			return String.fromCharCode(0xFFFD); // UTF 8 invalid char
		}
	}

	// read/write bit-twiddling

	Buffer.prototype.readUInt8 = function(offset, noAssert) {
		var buffer = this;

		if (!noAssert) {
			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset < buffer.length,
				'Trying to read beyond buffer length');
		}

		if (offset >= buffer.length) return;

		return buffer[offset];
	};

	function readUInt16(buffer, offset, isBigEndian, noAssert) {
		var val = 0;


		if (!noAssert) {
			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 1 < buffer.length,
				'Trying to read beyond buffer length');
		}

		if (offset >= buffer.length) return 0;

		if (isBigEndian) {
			val = buffer[offset] << 8;
			if (offset + 1 < buffer.length) {
				val |= buffer[offset + 1];
			}
		} else {
			val = buffer[offset];
			if (offset + 1 < buffer.length) {
				val |= buffer[offset + 1] << 8;
			}
		}

		return val;
	}

	Buffer.prototype.readUInt16LE = function(offset, noAssert) {
		return readUInt16(this, offset, false, noAssert);
	};

	Buffer.prototype.readUInt16BE = function(offset, noAssert) {
		return readUInt16(this, offset, true, noAssert);
	};

	function readUInt32(buffer, offset, isBigEndian, noAssert) {
		var val = 0;

		if (!noAssert) {
			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 3 < buffer.length,
				'Trying to read beyond buffer length');
		}

		if (offset >= buffer.length) return 0;

		if (isBigEndian) {
			if (offset + 1 < buffer.length)
				val = buffer[offset + 1] << 16;
			if (offset + 2 < buffer.length)
				val |= buffer[offset + 2] << 8;
			if (offset + 3 < buffer.length)
				val |= buffer[offset + 3];
			val = val + (buffer[offset] << 24 >>> 0);
		} else {
			if (offset + 2 < buffer.length)
				val = buffer[offset + 2] << 16;
			if (offset + 1 < buffer.length)
				val |= buffer[offset + 1] << 8;
			val |= buffer[offset];
			if (offset + 3 < buffer.length)
				val = val + (buffer[offset + 3] << 24 >>> 0);
		}

		return val;
	}

	Buffer.prototype.readUInt32LE = function(offset, noAssert) {
		return readUInt32(this, offset, false, noAssert);
	};

	Buffer.prototype.readUInt32BE = function(offset, noAssert) {
		return readUInt32(this, offset, true, noAssert);
	};


	/*
	 * Signed integer types, yay team! A reminder on how two's complement actually
	 * works. The first bit is the signed bit, i.e. tells us whether or not the
	 * number should be positive or negative. If the two's complement value is
	 * positive, then we're done, as it's equivalent to the unsigned representation.
	 *
	 * Now if the number is positive, you're pretty much done, you can just leverage
	 * the unsigned translations and return those. Unfortunately, negative numbers
	 * aren't quite that straightforward.
	 *
	 * At first glance, one might be inclined to use the traditional formula to
	 * translate binary numbers between the positive and negative values in two's
	 * complement. (Though it doesn't quite work for the most negative value)
	 * Mainly:
	 *  - invert all the bits
	 *  - add one to the result
	 *
	 * Of course, this doesn't quite work in Javascript. Take for example the value
	 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
	 * course, Javascript will do the following:
	 *
	 * > ~0xff80
	 * -65409
	 *
	 * Whoh there, Javascript, that's not quite right. But wait, according to
	 * Javascript that's perfectly correct. When Javascript ends up seeing the
	 * constant 0xff80, it has no notion that it is actually a signed number. It
	 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
	 * binary negation, it casts it into a signed value, (positive 0xff80). Then
	 * when you perform binary negation on that, it turns it into a negative number.
	 *
	 * Instead, we're going to have to use the following general formula, that works
	 * in a rather Javascript friendly way. I'm glad we don't support this kind of
	 * weird numbering scheme in the kernel.
	 *
	 * (BIT-MAX - (unsigned)val + 1) * -1
	 *
	 * The astute observer, may think that this doesn't make sense for 8-bit numbers
	 * (really it isn't necessary for them). However, when you get 16-bit numbers,
	 * you do. Let's go back to our prior example and see how this will look:
	 *
	 * (0xffff - 0xff80 + 1) * -1
	 * (0x007f + 1) * -1
	 * (0x0080) * -1
	 */
	 Buffer.prototype.readInt8 = function(offset, noAssert) {
		var buffer = this;
		var neg;

		if (!noAssert) {
			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset < buffer.length,
				'Trying to read beyond buffer length');
		}

		if (offset >= buffer.length) return;

		neg = buffer[offset] & 0x80;
		if (!neg) {
			return (buffer[offset]);
		}

		return ((0xff - buffer[offset] + 1) * -1);
	};

	function readInt16(buffer, offset, isBigEndian, noAssert) {
		var neg, val;

		if (!noAssert) {
			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 1 < buffer.length,
				'Trying to read beyond buffer length');
		}

		val = readUInt16(buffer, offset, isBigEndian, noAssert);
		neg = val & 0x8000;
		if (!neg) {
			return val;
		}

		return (0xffff - val + 1) * -1;
	}

	Buffer.prototype.readInt16LE = function(offset, noAssert) {
		return readInt16(this, offset, false, noAssert);
	};

	Buffer.prototype.readInt16BE = function(offset, noAssert) {
		return readInt16(this, offset, true, noAssert);
	};

	function readInt32(buffer, offset, isBigEndian, noAssert) {
		var neg, val;

		if (!noAssert) {
			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 3 < buffer.length,
				'Trying to read beyond buffer length');
		}

		val = readUInt32(buffer, offset, isBigEndian, noAssert);
		neg = val & 0x80000000;
		if (!neg) {
			return (val);
		}

		return (0xffffffff - val + 1) * -1;
	}

	Buffer.prototype.readInt32LE = function(offset, noAssert) {
		return readInt32(this, offset, false, noAssert);
	};

	Buffer.prototype.readInt32BE = function(offset, noAssert) {
		return readInt32(this, offset, true, noAssert);
	};

	function readFloat(buffer, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset + 3 < buffer.length,
				'Trying to read beyond buffer length');
		}

		return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
			23, 4);
	}

	Buffer.prototype.readFloatLE = function(offset, noAssert) {
		return readFloat(this, offset, false, noAssert);
	};

	Buffer.prototype.readFloatBE = function(offset, noAssert) {
		return readFloat(this, offset, true, noAssert);
	};

	function readDouble(buffer, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset + 7 < buffer.length,
				'Trying to read beyond buffer length');
		}

		return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
			52, 8);
	}

	Buffer.prototype.readDoubleLE = function(offset, noAssert) {
		return readDouble(this, offset, false, noAssert);
	};

	Buffer.prototype.readDoubleBE = function(offset, noAssert) {
		return readDouble(this, offset, true, noAssert);
	};


	/*
	 * We have to make sure that the value is a valid integer. This means that it is
	 * non-negative. It has no fractional component and that it does not exceed the
	 * maximum allowed value.
	 *
	 *      value           The number to check for validity
	 *
	 *      max             The maximum value
	 */
	 function verifuint(value, max) {
		assert.ok(typeof (value) == 'number',
			'cannot write a non-number as a number');

		assert.ok(value >= 0,
			'specified a negative value for writing an unsigned value');

		assert.ok(value <= max, 'value is larger than maximum value for type');

		assert.ok(Math.floor(value) === value, 'value has a fractional component');
	}

	Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
		var buffer = this;

		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset < buffer.length,
				'trying to write beyond buffer length');

			verifuint(value, 0xff);
		}

		if (offset < buffer.length) {
			buffer[offset] = value;
		}
	};

	function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 1 < buffer.length,
				'trying to write beyond buffer length');

			verifuint(value, 0xffff);
		}

		for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
			buffer[offset + i] =
			(value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
			(isBigEndian ? 1 - i : i) * 8;
		}

	}

	Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
		writeUInt16(this, value, offset, false, noAssert);
	};

	Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
		writeUInt16(this, value, offset, true, noAssert);
	};

	function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 3 < buffer.length,
				'trying to write beyond buffer length');

			verifuint(value, 0xffffffff);
		}

		for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
			buffer[offset + i] =
			(value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
		}
	}

	Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
		writeUInt32(this, value, offset, false, noAssert);
	};

	Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
		writeUInt32(this, value, offset, true, noAssert);
	};


	/*
	 * We now move onto our friends in the signed number category. Unlike unsigned
	 * numbers, we're going to have to worry a bit more about how we put values into
	 * arrays. Since we are only worrying about signed 32-bit values, we're in
	 * slightly better shape. Unfortunately, we really can't do our favorite binary
	 * & in this system. It really seems to do the wrong thing. For example:
	 *
	 * > -32 & 0xff
	 * 224
	 *
	 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
	 * this aren't treated as a signed number. Ultimately a bad thing.
	 *
	 * What we're going to want to do is basically create the unsigned equivalent of
	 * our representation and pass that off to the wuint* functions. To do that
	 * we're going to do the following:
	 *
	 *  - if the value is positive
	 *      we can pass it directly off to the equivalent wuint
	 *  - if the value is negative
	 *      we do the following computation:
	 *         mb + val + 1, where
	 *         mb   is the maximum unsigned value in that byte size
	 *         val  is the Javascript negative integer
	 *
	 *
	 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
	 * you do out the computations:
	 *
	 * 0xffff - 128 + 1
	 * 0xffff - 127
	 * 0xff80
	 *
	 * You can then encode this value as the signed version. This is really rather
	 * hacky, but it should work and get the job done which is our goal here.
	 */

	/*
	 * A series of checks to make sure we actually have a signed 32-bit number
	 */
	 function verifsint(value, max, min) {
		assert.ok(typeof (value) == 'number',
			'cannot write a non-number as a number');

		assert.ok(value <= max, 'value larger than maximum allowed value');

		assert.ok(value >= min, 'value smaller than minimum allowed value');

		assert.ok(Math.floor(value) === value, 'value has a fractional component');
	}

	function verifIEEE754(value, max, min) {
		assert.ok(typeof (value) == 'number',
			'cannot write a non-number as a number');

		assert.ok(value <= max, 'value larger than maximum allowed value');

		assert.ok(value >= min, 'value smaller than minimum allowed value');
	}

	Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
		var buffer = this;

		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset < buffer.length,
				'Trying to write beyond buffer length');

			verifsint(value, 0x7f, -0x80);
		}

		if (value >= 0) {
			buffer.writeUInt8(value, offset, noAssert);
		} else {
			buffer.writeUInt8(0xff + value + 1, offset, noAssert);
		}
	};

	function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 1 < buffer.length,
				'Trying to write beyond buffer length');

			verifsint(value, 0x7fff, -0x8000);
		}

		if (value >= 0) {
			writeUInt16(buffer, value, offset, isBigEndian, noAssert);
		} else {
			writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
		}
	}

	Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
		writeInt16(this, value, offset, false, noAssert);
	};

	Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
		writeInt16(this, value, offset, true, noAssert);
	};

	function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 3 < buffer.length,
				'Trying to write beyond buffer length');

			verifsint(value, 0x7fffffff, -0x80000000);
		}

		if (value >= 0) {
			writeUInt32(buffer, value, offset, isBigEndian, noAssert);
		} else {
			writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
		}
	}

	Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
		writeInt32(this, value, offset, false, noAssert);
	};

	Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
		writeInt32(this, value, offset, true, noAssert);
	};

	function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 3 < buffer.length,
				'Trying to write beyond buffer length');

			verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
		}

		require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
			23, 4);
	}

	Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
		writeFloat(this, value, offset, false, noAssert);
	};

	Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
		writeFloat(this, value, offset, true, noAssert);
	};

	function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
		if (!noAssert) {
			assert.ok(value !== undefined && value !== null,
				'missing value');

			assert.ok(typeof (isBigEndian) === 'boolean',
				'missing or invalid endian');

			assert.ok(offset !== undefined && offset !== null,
				'missing offset');

			assert.ok(offset + 7 < buffer.length,
				'Trying to write beyond buffer length');

			verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
		}

		require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
			52, 8);
	}

	Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
		writeDouble(this, value, offset, false, noAssert);
	};

	Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
		writeDouble(this, value, offset, true, noAssert);
	};

},{"./buffer_ieee754":14,"assert":7,"base64-js":16}],16:[function(require,module,exports){
	(function (exports) {
		'use strict';

		var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

		function b64ToByteArray(b64) {
			var i, j, l, tmp, placeHolders, arr;

			if (b64.length % 4 > 0) {
				throw 'Invalid string. Length must be a multiple of 4';
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			placeHolders = b64.indexOf('=');
			placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

			// base64 is 4/3 + up to two characters of the original data
			arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length;

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
				arr.push((tmp & 0xFF0000) >> 16);
				arr.push((tmp & 0xFF00) >> 8);
				arr.push(tmp & 0xFF);
			}

			if (placeHolders === 2) {
				tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
				arr.push(tmp & 0xFF);
			} else if (placeHolders === 1) {
				tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
				arr.push((tmp >> 8) & 0xFF);
				arr.push(tmp & 0xFF);
			}

			return arr;
		}

		function uint8ToBase64(uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length;

				function tripletToBase64 (num) {
					return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
				};

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
				output += tripletToBase64(temp);
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
				case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
			}

			return output;
		}

		module.exports.toByteArray = b64ToByteArray;
		module.exports.fromByteArray = uint8ToBase64;
	}());

},{}],17:[function(require,module,exports){
	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
		var canSetImmediate = typeof window !== 'undefined'
		&& window.setImmediate;
		var canPost = typeof window !== 'undefined'
		&& window.postMessage && window.addEventListener
		;

		if (canSetImmediate) {
			return function (f) { return window.setImmediate(f) };
		}

		if (canPost) {
			var queue = [];
			window.addEventListener('message', function (ev) {
				if (ev.source === window && ev.data === 'process-tick') {
					ev.stopPropagation();
					if (queue.length > 0) {
						var fn = queue.shift();
						fn();
					}
				}
			}, true);

			return function nextTick(fn) {
				queue.push(fn);
				window.postMessage('process-tick', '*');
			};
		}

		return function nextTick(fn) {
			setTimeout(fn, 0);
		};
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	process.binding = function (name) {
		throw new Error('process.binding is not supported');
	}

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
		throw new Error('process.chdir is not supported');
	};

},{}],18:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var ldata, log, App, exports;
		ldata = require('./live-data');
		log = require('./log');
		App = (function(){
			App.displayName = 'App';
			var prototype = App.prototype, constructor = App;
			function App(opts){
				var ref$;
				this.opts = opts != null
				? opts
				: {};
				if (!(this instanceof App)) {
					return (function(func, args, ctor) {
						ctor.prototype = func.prototype;
						var child = new ctor, result = func.apply(child, args), t;
						return (t = typeof result)  == "object" || t == "function" ? result || child : child;
					})(App, arguments, function(){});
				}
				(ref$ = this.opts).logger == null && (ref$.logger = log.logger({
					level: 'debug'
				}));
				this.log = this.opts.logger;
				this.store = new ldata.Map({
					prefix: 'app'
				});
			}
			return App;
		}());
		exports = module.exports = App;
	}).call(this);

},{"./live-data":25,"./log":30}],19:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var through, Primus, Client, slice$ = [].slice;
		through = require('through');
		Primus = require('./library');
		Client = require('./client');
		exports.App = require('./app');
		exports.Client = Client;
		exports.connect = function(app){
			var a, primus, stream, client;
			a = slice$.call(arguments, 1);
			primus = new Primus();
			stream = through(function(data){
				return primus.write(data);
			});
			primus.on('data', function(data){
				return stream.queue(data);
			});
			client = new Client(app, stream);
			client.primus = primus;
			return client;
		};
	}).call(this);

},{"./app":18,"./client":20,"./library":22,"through":46}],20:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var ldata, Client, exports;
		ldata = require('./live-data');
		Client = (function(){
			Client.displayName = 'Client';
			var prototype = Client.prototype, constructor = Client;
			function Client(app, stream){
				this.app = app;
				this.stream = stream;
				if (!(this instanceof Client)) {
					return (function(func, args, ctor) {
						ctor.prototype = func.prototype;
						var child = new ctor, result = func.apply(child, args), t;
						return (t = typeof result)  == "object" || t == "function" ? result || child : child;
					})(Client, arguments, function(){});
				}
				this.rawStore = new ldata.Map;
				this.store = new ldata.MapView(this.rawStore, {
					prefix: 'client'
				});
				this.stream.on('data', function(d){
					return console.log('data:', d);
				});
				this.rawStore.on('_update', function(u){
					return console.log('raw-store updated:', u);
				});
				this.rawStore.pipe(this.app.store).pipe(this.rawStore);
				this.stream.pipe(this.rawStore.createStream()).pipe(this.stream);
			}
			return Client;
		}());
	exports = module.exports = Client;
	}).call(this);

},{"./live-data":25}],21:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		module.exports = require('../live-data');
	}).call(this);

},{"../live-data":25}],22:[function(require,module,exports){
	(function (name, context, definition) {  context[name] = definition();  if (typeof module !== "undefined" && module.exports) {    module.exports = context[name];  } else if (typeof define == "function" && define.amd) {    define(definition);  }})("Primus", this, function PRIMUS() {/*globals require, define */
		'use strict';

		/**
		 * Minimal EventEmitter interface that is molded against the Node.js
		 * EventEmitter interface.
		 *
		 * @constructor
		 * @api public
		 */
		function EventEmitter() {
			this._events = {};
		}

		/**
		 * Return a list of assigned event listeners.
		 *
		 * @param {String} event The events that should be listed.
		 * @returns {Array}
		 * @api public
		 */
		EventEmitter.prototype.listeners = function listeners(event) {
			return (this._events[event] || []).slice(0);
		};

		/**
		 * Emit an event to all registered event listeners.
		 *
		 * @param {String} event The name of the event.
		 * @returns {Boolean} Indication if we've emitted an event.
		 * @api public
		 */
		EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
			if (!this._events[event]) return false;

			var listeners = this._events[event]
			, length = listeners.length
			, handler = listeners[0]
			, len = arguments.length
			, args
			, i;

			if (1 === length) {
				switch (len) {
					case 1:
					handler.call(this);
					break;
					case 2:
					handler.call(this, a1);
					break;
					case 3:
					handler.call(this, a1, a2);
					break;
					case 4:
					handler.call(this, a1, a2, a3);
					break;
					case 5:
					handler.call(this, a1, a2, a3, a4);
					break;
					case 6:
					handler.call(this, a1, a2, a3, a4, a5);
					break;

					default:
					for (i = 1, args = new Array(len -1); i < len; i++) {
						args[i - 1] = arguments[i];
					}

					handler.apply(this, args);
				}
			} else {
				for (i = 1, args = new Array(len -1); i < len; i++) {
					args[i - 1] = arguments[i];
				}

				for (i = 0; i < length; i++) {
					listeners[i].apply(this, args);
				}
			}

			return true;
		};

		/**
		 * Register a new EventListener for the given event.
		 *
		 * @param {String} event Name of the event.
		 * @param {Functon} fn Callback function.
		 * @api public
		 */
		 EventEmitter.prototype.on = function on(event, fn) {
			if (!this._events[event]) this._events[event] = [];
			this._events[event].push(fn);

			return this;
		};

		/**
		 * Add an EventListener that's only called once.
		 *
		 * @param {String} event Name of the event.
		 * @param {Function} fn Callback function.
		 * @api public
		 */
		 EventEmitter.prototype.once = function once(event, fn) {
			var ee = this;

			function eject() {
				ee.removeListener(event, eject);
				fn.apply(ee, arguments);
			}

			eject.fn = fn;
			return ee.on(event, eject);
		};

		/**
		 * Remove event listeners.
		 *
		 * @param {String} event The event we want to remove.
		 * @param {Function} fn The listener that we need to find.
		 * @api public
		 */
		 EventEmitter.prototype.removeListener = function removeListener(event, fn) {
			if (!this._events || !this._events[event]) return this;

			var listeners = this._events[event]
			, events = [];

			for (var i = 0, length = listeners.length; i < length; i++) {
				if (!(!fn || listeners[i] === fn || listeners[i].fn === fn)) {
					events.push(listeners[i]);
				}
			}

			//
			// Reset the array, or remove it completely if we have no more listeners.
			//
			if (events.length) this._events[event] = events;
			else this._events[event] = null;

			return this;
		};

		/**
		 * Remove all listeners or only the listeners for the specified event.
		 *
		 * @param {String} event The event want to remove all listeners for.
		 * @api public
		 */
		 EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
			if (event) this._events[event] = null;
			else this._events = {};

			return this;
		};

		/**
		 * Context assertion, ensure that some of our public Primus methods are called
		 * with the correct context to ensure that
		 *
		 * @param {Primus} self The context of the function.
		 * @param {String} method The method name.
		 * @api private
		 */
		 function context(self, method) {
			if (self instanceof Primus) return;

			var failure = new Error('Primus#'+ method + '\'s context should called with a Primus instance');

			if (!self.listeners('error').length) throw failure;
			self.emit('error', failure);
		}

		/**
		 * Primus in a real-time library agnostic framework for establishing real-time
		 * connections with servers.
		 *
		 * Options:
		 * - reconnect, configuration for the reconnect process.
		 * - manual, don't automatically call `.open` to start the connection.
		 * - websockets, force the use of WebSockets, even when you should avoid them.
		 * - timeout, connect timeout, server didn't respond in a timely manner.
		 * - ping, The heartbeat interval for sending a ping packet to the server.
		 * - pong, The heartbeat timeout for receiving a response to the ping.
		 * - network, Use network events as leading method for network connection drops.
		 * - strategy, Reconnection strategies.
		 *
		 * @constructor
		 * @param {String} url The URL of your server.
		 * @param {Object} options The configuration.
		 * @api private
		 */
		 function Primus(url, options) {
			if (!(this instanceof Primus)) return new Primus(url, options);

			var primus = this;

			options = options || {};
			options.timeout = +options.timeout || 10e3;   // Connection timeout duration.
			options.reconnect = options.reconnect || {};  // Stores the back off configuration.
			options.ping = +options.ping || 25e3;         // Heartbeat ping interval.
			options.pong = +options.pong || 10e3;         // Heartbeat pong response timeout.
			options.strategy = options.strategy || [];    // Reconnect strategies.

			primus.buffer = [];                           // Stores premature send data.
			primus.writable = true;                       // Silly stream compatibility.
			primus.readable = true;                       // Silly stream compatibility.
			primus.url = primus.parse(url);               // Parse the URL to a readable format.
			primus.readyState = Primus.CLOSED;            // The readyState of the connection.
			primus.options = options;                     // Reference to the supplied options.
			primus.timers = {};                           // Contains all our timers.
			primus.attempt = null;                        // Current back off attempt.
			primus.socket = null;                         // Reference to the internal connection.
			primus.transformers = {                       // Message transformers.
				outgoing: [],
				incoming: []
			};

			//
			// Parse the reconnection strategy. It can have the following strategies:
			//
			// - timeout: Reconnect when we have a network timeout.
			// - disconnect: Reconnect when we have an unexpected disconnect.
			// - online: Reconnect when we're back online.
			//
			if ('string' === typeof options.strategy) {
				options.strategy = options.strategy.split(/\s?\,\s?/g);
			}

			if (!options.strategy.length) {
				options.strategy.push('disconnect', 'online');

				//
				// Timeout based reconnection should only be enabled conditionally. When
				// authorization is enabled it could trigger.
				//
				if (!this.authorization) options.strategy.push('timeout');
			}

			options.strategy = options.strategy.join(',').toLowerCase();

			//
			// Only initialise the EventEmitter interface if we're running in a plain
			// browser environment. The Stream interface is inherited differently when it
			// runs on browserify and on Node.js.
			//
			if (!Stream) EventEmitter.call(primus);

			//
			// Force the use of WebSockets, even when we've detected some potential
			// broken WebSocket implementation.
			//
			if ('websockets' in options) {
				primus.AVOID_WEBSOCKETS = !options.websockets;
			}

			//
			// Force or disable the use of NETWORK events as leading client side
			// disconnection detection.
			//
			if ('network' in options) {
				primus.NETWORK_EVENTS = options.network;
			}

			//
			// Check if the user wants to manually initialise a connection. If they don't,
			// we want to do it after a really small timeout so we give the users enough
			// time to listen for `error` events etc.
			//
			if (!options.manual) primus.timers.open = setTimeout(function open() {
				primus.clearTimeout('open').open();
			}, 0);

				primus.initialise(options);
			}

		/**
		 * Simple require wrapper to make browserify, node and require.js play nice.
		 *
		 * @param {String} name The module to require.
		 * @api private
		 */
		 Primus.require = function requires(name) {
			if ('function' !== typeof require) return undefined;

			return !('function' === typeof define && define.amd)
			? require(name)
			: undefined;
		};

		//
		// It's possible that we're running in Node.js or in a Node.js compatible
		// environment such as browserify. In these cases we want to use some build in
		// libraries to minimize our dependence on the DOM.
		//
		var Stream, parse;

		try {
			Primus.Stream = Stream = Primus.require('stream');
			parse = Primus.require('url').parse;

			//
			// Normally inheritance is done in the same way as we do in our catch
			// statement. But due to changes to the EventEmitter interface in Node 0.10
			// this will trigger annoying memory leak warnings and other potential issues
			// outlined in the issue linked below.
			//
			// @see https://github.com/joyent/node/issues/4971
			//
			Primus.require('util').inherits(Primus, Stream);
		} catch (e) {
			Primus.Stream = EventEmitter;
			Primus.prototype = new EventEmitter();

			//
			// In the browsers we can leverage the DOM to parse the URL for us. It will
			// automatically default to host of the current server when we supply it path
			// etc.
			//
			parse = function parse(url) {
				var a = document.createElement('a');
				a.href = url;

				//
				// Browsers do not parse authorization information, so we need to extract
				// that from the URL.
				//
				if (~a.href.indexOf('@') && !a.auth) {
					a.auth = a.href.slice(a.protocol.length + 2, a.href.indexOf(a.pathname)).split('@')[0];
				}

				return a;
			};
		}

		/**
		 * Primus readyStates, used internally to set the correct ready state.
		 *
		 * @type {Number}
		 * @private
		 */
		Primus.OPENING = 1;   // We're opening the connection.
		Primus.CLOSED  = 2;   // No active connection.
		Primus.OPEN    = 3;   // The connection is open.

		/**
		 * Are we working with a potentially broken WebSockets implementation? This
		 * boolean can be used by transformers to remove `WebSockets` from their
		 * supported transports.
		 *
		 * @type {Boolean}
		 * @api private
		 */
		 Primus.prototype.AVOID_WEBSOCKETS = false;

		/**
		 * Some browsers support registering emitting `online` and `offline` events when
		 * the connection has been dropped on the client. We're going to detect it in
		 * a simple `try {} catch (e) {}` statement so we don't have to do complicated
		 * feature detection.
		 *
		 * @type {Boolean}
		 * @api private
		 */
		 Primus.prototype.NETWORK_EVENTS = false;
		 Primus.prototype.online = true;

		 try {
			if (Primus.prototype.NETWORK_EVENTS = 'onLine' in navigator && (window.addEventListener || document.body.attachEvent)) {
				if (!navigator.onLine) {
					Primus.prototype.online = false;
				}
			}
		} catch (e) { }

		/**
		 * The Ark contains all our plugins definitions. It's namespaced by
		 * name => plugin.
		 *
		 * @type {Object}
		 * @private
		 */
		 Primus.prototype.ark = {};

		/**
		 * Return the given plugin.
		 *
		 * @param {String} name The name of the plugin.
		 * @returns {Mixed}
		 * @api public
		 */
		 Primus.prototype.plugin = function plugin(name) {
			context(this, 'plugin');

			if (name) return this.ark[name];

			var plugins = {};

			for (name in this.ark) {
				plugins[name] = this.ark[name];
			}

			return plugins;
		};

		/**
		 * Initialise the Primus and setup all parsers and internal listeners.
		 *
		 * @param {Object} options The original options object.
		 * @api private
		 */
		 Primus.prototype.initialise = function initalise(options) {
			var primus = this;

			primus.on('outgoing::open', function opening() {
				primus.readyState = Primus.OPENING;
			});

			primus.on('incoming::open', function opened() {
				if (primus.attempt) primus.attempt = null;

				primus.readyState = Primus.OPEN;
				primus.emit('open');
				primus.clearTimeout('ping', 'pong').heartbeat();

				if (primus.buffer.length) {
					for (var i = 0, length = primus.buffer.length; i < length; i++) {
						primus.write(primus.buffer[i]);
					}

					primus.buffer.length = 0;
				}
			});

			primus.on('incoming::pong', function pong(time) {
				primus.online = true;
				primus.clearTimeout('pong').heartbeat();
			});

			primus.on('incoming::error', function error(e) {
				var connect = primus.timers.connect;

				//
				// We're still doing a reconnect attempt, it could be that we failed to
				// connect because the server was down. Failing connect attempts should
				// always emit an `error` event instead of a `open` event.
				//
				if (primus.attempt) return primus.reconnect();
				if (primus.listeners('error').length) primus.emit('error', e);

				//
				// We received an error while connecting, this most likely the result of an
				// unauthorized access to the server. But this something that is only
				// triggered for Node based connections. Browsers trigger the error event.
				//
				if (connect) {
					if (~primus.options.strategy.indexOf('timeout')) primus.reconnect();
					else primus.end();
				}
			});

			primus.on('incoming::data', function message(raw) {
				primus.decoder(raw, function decoding(err, data) {
					//
					// Do a "save" emit('error') when we fail to parse a message. We don't
					// want to throw here as listening to errors should be optional.
					//
					if (err) return primus.listeners('error').length && primus.emit('error', err);

					//
					// The server is closing the connection, forcefully disconnect so we don't
					// reconnect again.
					//
					if ('primus::server::close' === data) return primus.end();

					//
					// We received a pong message from the server, return the id.
					//
					if ('string' === typeof data && data.indexOf('primus::pong::') === 0) {
						return primus.emit('incoming::pong', data.slice(14));
					}

					for (var i = 0, length = primus.transformers.incoming.length; i < length; i++) {
						var packet = { data: data };

						if (false === primus.transformers.incoming[i].call(primus, packet)) {
							//
							// When false is returned by an incoming transformer it means that's
							// being handled by the transformer and we should not emit the `data`
							// event.
							//
							return;
						}

						data = packet.data;
					}

					//
					// We always emit 2 arguments for the data event, the first argument is the
					// parsed data and the second argument is the raw string that we received.
					// This allows you to do some validation on the parsed data and then save
					// the raw string in your database or what ever so you don't have the
					// stringify overhead.
					//
					primus.emit('data', data, raw);
				});
		});

		primus.on('incoming::end', function end(intentional) {
			var readyState = primus.readyState;

				//
				// Always set the readyState to closed, and if we're still connecting, close
				// the connection so we're sure that everything after this if statement block
				// is only executed because our readyState is set to `open`.
				//
				primus.readyState = Primus.CLOSED;
				if (primus.timers.connect) primus.end();
				if (readyState !== Primus.OPEN) return;

				//
				// Some transformers emit garbage when they close the connection. Like the
				// reason why it closed etc. we should explicitly check if WE send an
				// intentional message.
				//
				if ('primus::server::close' === intentional) {
					return primus.emit('end');
				}

				//
				// Always, call the `close` event as an indication of connection disruption.
				// This also emitted by `primus#end` so for all cases above, it's still
				// emitted.
				//
				primus.emit('close');

				//
				// The disconnect was unintentional, probably because the server shut down.
				// So we should just start a reconnect procedure.
				//
				if (~primus.options.strategy.indexOf('disconnect')) primus.reconnect();
			});

			//
			// Setup the real-time client.
			//
			primus.client();

			//
			// Process the potential plugins.
			//
			for (var plugin in primus.ark) {
				primus.ark[plugin].call(primus, primus, options);
			}

			//
			// NOTE: The following code is only required if we're supporting network
			// events as it requires access to browser globals.
			//
			if (!primus.NETWORK_EVENTS) return primus;

			/**
			 * Handler for offline notifications.
			 *
			 * @api private
			 */
			 function offline() {
				primus.online = false;
				primus.emit('offline');
				primus.end();
			}

			/**
			 * Handler for online notifications.
			 *
			 * @api private
			 */
			 function online() {
				primus.online = true;
				primus.emit('online');

				if (~primus.options.strategy.indexOf('online')) primus.reconnect();
			}

			if (window.addEventListener) {
				window.addEventListener('offline', offline, false);
				window.addEventListener('online', online, false);
			} else if (document.body.attachEvent){
				document.body.attachEvent('onoffline', offline);
				document.body.attachEvent('ononline', online);
			}

			return primus;
		};

		/**
		 * Establish a connection with the server. When this function is called we
		 * assume that we don't have any open connections. If you do call it when you
		 * have a connection open, it could cause duplicate connections.
		 *
		 * @api public
		 */
		 Primus.prototype.open = function open() {
			context(this, 'open');

			//
			// Only start a `connection timeout` procedure if we're not reconnecting as
			// that shouldn't count as an initial connection. This should be started
			// before the connection is opened to capture failing connections and kill the
			// timeout.
			//
			if (!this.attempt && this.options.timeout) this.timeout();

			return this.emit('outgoing::open');
		};

		/**
		 * Send a new message.
		 *
		 * @param {Mixed} data The data that needs to be written.
		 * @returns {Boolean} Always returns true.
		 * @api public
		 */
		 Primus.prototype.write = function write(data) {
			var primus = this
			, packet;

			context(primus, 'write');

			if (Primus.OPEN === primus.readyState) {
				for (var i = 0, length = primus.transformers.outgoing.length; i < length; i++) {
					packet = { data: data };

					if (false === primus.transformers.outgoing[i].call(primus, packet)) {
						//
						// When false is returned by an incoming transformer it means that's
						// being handled by the transformer and we should not emit the `data`
						// event.
						//
						return;
					}

					data = packet.data;
				}

				primus.encoder(data, function encoded(err, packet) {
					//
					// Do a "save" emit('error') when we fail to parse a message. We don't
					// want to throw here as listening to errors should be optional.
					//
					if (err) return primus.listeners('error').length && primus.emit('error', err);
					primus.emit('outgoing::data', packet);
				});
			} else {
				primus.buffer.push(data);
			}

			return true;
		};

		/**
		 * Send a new heartbeat over the connection to ensure that we're still
		 * connected and our internet connection didn't drop. We cannot use server side
		 * heartbeats for this unfortunately.
		 *
		 * @api private
		 */
		 Primus.prototype.heartbeat = function heartbeat() {
			var primus = this;

			if (!primus.options.ping) return primus;

			/**
			 * Exterminate the connection as we've timed out.
			 *
			 * @api private
			 */
			 function pong() {
				primus.clearTimeout('pong');

				//
				// The network events already captured the offline event.
				//
				if (primus.online) return;

				primus.online = false;
				primus.emit('offline');
				primus.emit('incoming::end');
			}

			/**
			 * We should send a ping message to the server.
			 *
			 * @api private
			 */
			 function ping() {
				primus.clearTimeout('ping').write('primus::ping::'+ (+new Date));
				primus.emit('outgoing::ping');
				primus.timers.pong = setTimeout(pong, primus.options.pong);
			}

			primus.timers.ping = setTimeout(ping, primus.options.ping);
		};

		/**
		 * Start a connection timeout.
		 *
		 * @api private
		 */
		 Primus.prototype.timeout = function timeout() {
			var primus = this;

			/**
			 * Remove all references to the timeout listener as we've received an event
			 * that can be used to determine state.
			 *
			 * @api private
			 */
			 function remove() {
				primus.removeListener('error', remove)
				.removeListener('open', remove)
				.removeListener('end', remove)
				.clearTimeout('connect');
			}

			primus.timers.connect = setTimeout(function setTimeout() {
				remove(); // Clean up old references.

				if (Primus.readyState === Primus.OPEN || primus.attempt) return;

				primus.emit('timeout');

				//
				// We failed to connect to the server.
				//
				if (~primus.options.strategy.indexOf('timeout')) primus.reconnect();
				else primus.end();
			}, primus.options.timeout);

			return primus.on('error', remove)
			.on('open', remove)
			.on('end', remove);
		};

		/**
		 * Properly clean up all `setTimeout` references.
		 *
		 * @param {String} ..args.. The names of the timeout's we need clear.
		 * @api private
		 */
		 Primus.prototype.clearTimeout = function clear() {
			for (var args = arguments, i = 0, l = args.length; i < l; i++) {
				if (this.timers[args[i]]) clearTimeout(this.timers[args[i]]);
				delete this.timers[args[i]];
			}

			return this;
		};

		/**
		 * Exponential back off algorithm for retry operations. It uses an randomized
		 * retry so we don't DDOS our server when it goes down under pressure.
		 *
		 * @param {Function} callback Callback to be called after the timeout.
		 * @param {Object} opts Options for configuring the timeout.
		 * @api private
		 */
		 Primus.prototype.backoff = function backoff(callback, opts) {
			opts = opts || {};

			var primus = this;

			//
			// Bailout when we already have a backoff process running. We shouldn't call
			// the callback then as it might cause an unexpected `end` event as another
			// reconnect process is already running.
			//
			if (opts.backoff) return primus;

			opts.maxDelay = opts.maxDelay || Infinity;  // Maximum delay.
			opts.minDelay = opts.minDelay || 500;       // Minimum delay.
			opts.retries = opts.retries || 10;          // Amount of allowed retries.
			opts.attempt = (+opts.attempt || 0) + 1;    // Current attempt.
			opts.factor = opts.factor || 2;             // Back off factor.

			//
			// Bailout if we are about to make to much attempts. Please note that we use
			// `>` because we already incremented the value above.
			//
			if (opts.attempt > opts.retries) {
				callback(new Error('Unable to retry'), opts);
				return primus;
			}

			//
			// Prevent duplicate back off attempts using the same options object.
			//
			opts.backoff = true;

			//
			// Calculate the timeout, but make it randomly so we don't retry connections
			// at the same interval and defeat the purpose. This exponential back off is
			// based on the work of:
			//
			// http://dthain.blogspot.nl/2009/02/exponential-backoff-in-distributed.html
			//
			opts.timeout = opts.attempt !== 1
			? Math.min(Math.round(
				(Math.random() + 1) * opts.minDelay * Math.pow(opts.factor, opts.attempt)
				), opts.maxDelay)
			: opts.minDelay;

			//
			// Emit a `reconnecting` event with current reconnect options. This allows
			// them to update the UI and provide their users with feedback.
			//
			primus.emit('reconnecting', opts);

			primus.timers.reconnect = setTimeout(function delay() {
				opts.backoff = false;
				primus.clearTimeout('reconnect');

				callback(undefined, opts);
			}, opts.timeout);

			return primus;
		};

		/**
		 * Start a new reconnect procedure.
		 *
		 * @api private
		 */
		 Primus.prototype.reconnect = function reconnect() {
			var primus = this;

			//
			// Try to re-use the existing attempt.
			//
			primus.attempt = primus.attempt || primus.clone(primus.options.reconnect);

			primus.backoff(function attempt(fail, backoff) {
				if (fail) {
					primus.attempt = null;
					return primus.emit('end');
				}

				//
				// Try to re-open the connection again.
				//
				primus.emit('reconnect', backoff);
				primus.emit('outgoing::reconnect');
			}, primus.attempt);

			return primus;
		};

		/**
		 * Close the connection.
		 *
		 * @param {Mixed} data last packet of data.
		 * @api public
		 */
		 Primus.prototype.end = function end(data) {
			context(this, 'end');

			if (this.readyState === Primus.CLOSED && !this.timers.connect) return this;
			if (data) this.write(data);

			this.writable = false;
			this.readyState = Primus.CLOSED;

			for (var timeout in this.timers) {
				this.clearTimeout(timeout);
			}

			this.emit('outgoing::end');
			this.emit('close');
			this.emit('end');

			return this;
		};

		/**
		 * Create a shallow clone of a given object.
		 *
		 * @param {Object} obj The object that needs to be cloned.
		 * @returns {Object} Copy.
		 * @api private
		 */
		 Primus.prototype.clone = function clone(obj) {
			return this.merge({}, obj);
		};

		/**
		 * Merge different objects in to one target object.
		 *
		 * @param {Object} target The object where everything should be merged in.
		 * @returns {Object} Original target with all merged objects.
		 * @api private
		 */
		 Primus.prototype.merge = function merge(target) {
			var args = Array.prototype.slice.call(arguments, 1);

			for (var i = 0, l = args.length, key, obj; i < l; i++) {
				obj = args[i];

				for (key in obj) {
					if (obj.hasOwnProperty(key)) target[key] = obj[key];
				}
			}

			return target;
		};

		/**
		 * Parse the connection string.
		 *
		 * @param {String} url Connection URL.
		 * @returns {Object} Parsed connection.
		 * @api public
		 */
		 Primus.prototype.parse = parse;

		/**
		 * Parse a query string.
		 *
		 * @param {String} query The query string that needs to be parsed.
		 * @returns {Object} Parsed query string.
		 * @api public
		 */
		 Primus.prototype.querystring = function querystring(query) {
			var parser = /([^=?&]+)=([^&]*)/g
			, result = {}
			, part;

			//
			// Little nifty parsing hack, leverage the fact that RegExp.exec increments
			// the lastIndex property so we can continue executing this loop until we've
			// parsed all results.
			//
			for (; part = parser.exec(query); result[part[1]] = part[2]);

				return result;
		};

		/**
		 * Generates a connection URI.
		 *
		 * @param {String} protocol The protocol that should used to crate the URI.
		 * @param {Boolean} querystring Do we need to include a query string.
		 * @returns {String|options} The URL.
		 * @api private
		 */
		 Primus.prototype.uri = function uri(options, querystring) {
			var url = this.url
			, server = [];

			//
			// Backwards compatible with Primus 1.4.0
			// @TODO Remove me for Primus 2.0
			//
			if ('string' === typeof options) {
				options = { protocol: options };
				if (querystring) options.query = querystring;
			}

			options = options || {};
			options.protocol = 'protocol' in options ? options.protocol : 'http';
			options.query = url.search && 'query' in options ? (url.search.charAt(0) === '?' ? url.search.slice(1) : url.search) : false;
			options.secure = 'secure' in options ? options.secure : url.protocol === 'https:';
			options.auth = 'auth' in options ? options.auth : url.auth;
			options.pathname = 'pathname' in options ? options.pathname : this.pathname.slice(1);
			options.port = 'port' in options ? options.port : url.port || (options.secure ? 443 : 80);
			options.host = 'host' in options ? options.host : url.hostname || url.host.replace(':'+ url.port, '');

			//
			// Automatically suffix the protocol so we can supply `ws` and `http` and it gets
			// transformed correctly.
			//
			server.push(options.secure ? options.protocol +'s:' : options.protocol +':', '');

			if (options.auth) server.push(options.auth +'@'+ url.host);
			else server.push(url.host);

			//
			// Pathnames are optional as some Transformers would just use the pathname
			// directly.
			//
			if (options.pathname) server.push(options.pathname);

			//
			// Optionally add a search query, again, not supported by all Transformers.
			// SockJS is known to throw errors when a query string is included.
			//
			if (options.query) server.push('?'+ options.query);

			if (options.object) return options;
			return server.join('/');
		};

		/**
		 * Simple emit wrapper that returns a function that emits an event once it's
		 * called. This makes it easier for transports to emit specific events. The
		 * scope of this function is limited as it will only emit one single argument.
		 *
		 * @param {String} event Name of the event that we should emit.
		 * @param {Function} parser Argument parser.
		 * @api public
		 */
		 Primus.prototype.emits = function emits(event, parser) {
			var primus = this;

			return function emit(arg) {
				var data = parser ? parser.apply(primus, arguments) : arg;

				//
				// Timeout is required to prevent crashes on WebSockets connections on
				// mobile devices. We need to handle these edge cases in our own library
				// as we cannot be certain that all frameworks fix these issues.
				//
				setTimeout(function timeout() {
					primus.emit('incoming::'+ event, data);
				}, 0);
			};
		};

		/**
		 * Register a new message transformer. This allows you to easily manipulate incoming
		 * and outgoing data which is particularity handy for plugins that want to send
		 * meta data together with the messages.
		 *
		 * @param {String} type Incoming or outgoing
		 * @param {Function} fn A new message transformer.
		 * @api public
		 */
		 Primus.prototype.transform = function transform(type, fn) {
			context(this, 'transform');

			if (!(type in this.transformers)) throw new Error('Invalid transformer type');

			this.transformers[type].push(fn);
			return this;
		};

		/**
		 * A critical error has occurred, if we have an `error` listener, emit it there.
		 * If not, throw it, so we get a stack trace + proper error message.
		 *
		 * @param {Error} err The critical error.
		 * @api private
		 */
		 Primus.prototype.critical = function critical(err) {
			if (this.listeners('error').length) return this.emit('error', err);

			throw err;
		};

		/**
		 * Syntax sugar, adopt a Socket.IO like API.
		 *
		 * @param {String} url The URL we want to connect to.
		 * @param {Object} options Connection options.
		 * @returns {Primus}
		 * @api public
		 */
		 Primus.connect = function connect(url, options) {
			return new Primus(url, options);
		};

		//
		// Expose the EventEmitter so it can be re-used by wrapping libraries we're also
		// exposing the Stream interface.
		//
		Primus.EventEmitter = EventEmitter;

		//
		// These libraries are automatically are automatically inserted at the
		// server-side using the Primus#library method.
		//
		Primus.prototype.client = function client() {
			var primus = this
			, socket;

			//
			// Selects an available Engine.IO factory.
			//
			var Factory = (function Factory() {
				if ('undefined' !== typeof SockJS) return SockJS;

				try { return Primus.require('sockjs-client-node'); }
				catch (e) {}

				return undefined;
			})();

			if (!Factory) return primus.critical(new Error('Missing required `sockjs-client-node` module. Please run `npm install --save sockjs-client-node`'));

			//
			// Connect to the given URL.
			//
			primus.on('outgoing::open', function opening() {
				if (socket) socket.close();

				primus.socket = socket = new Factory(primus.uri({ protocol: 'http' }), null, {
					websocket: !primus.AVOID_WEBSOCKETS
				});

				//
				// Setup the Event handlers.
				//
				socket.onopen = primus.emits('open');
				socket.onerror = primus.emits('error');
				socket.onclose = function (e) {
					var event = e && e.code === 1002 ? 'error' : 'end';

					//
					// The timeout replicates the behaviour of primus.emits so we're not
					// affected by any timing bugs.
					//
					setTimeout(function timeout() {
						primus.emit('incoming::'+ event, e);
					}, 0);
				};
				socket.onmessage = primus.emits('data', function parse(evt) {
					return evt.data;
				});
			});

			//
			// We need to write a new message to the socket.
			//
			primus.on('outgoing::data', function write(message) {
				if (socket) socket.send(message);
			});

			//
			// Attempt to reconnect the socket. It assumes that the `close` event is
			// called if it failed to disconnect.
			//
			primus.on('outgoing::reconnect', function reconnect() {
				if (socket) primus.emit('outgoing::close');
				primus.emit('outgoing::open');
			});

			//
			// We need to close the socket.
			//
			primus.on('outgoing::end', function close() {
				if (socket) {
					socket.close();
					socket = null;
				}
			});
		};
		Primus.prototype.authorization = false;
		Primus.prototype.pathname = "/primus";
		Primus.prototype.encoder = function encoder(data, fn) {
			var err;

			try { data = JSON.stringify(data); }
			catch (e) { err = e; }

			fn(err, data);
		};
		Primus.prototype.decoder = function decoder(data, fn) {
			var err;

			try { data = JSON.parse(data); }
			catch (e) { err = e; }

			fn(err, data);
		};
		Primus.prototype.version = "1.4.6";

		//
		// Hack 1: \u2028 and \u2029 are allowed inside string in JSON. But JavaScript
		// defines them as newline separators. Because no literal newlines are allowed
		// in a string this causes a ParseError. We work around this issue by replacing
		// these characters with a properly escaped version for those chars. This can
		// cause errors with JSONP requests or if the string is just evaluated.
		//
		// This could have been solved by replacing the data during the "outgoing::data"
		// event. But as it affects the JSON encoding in general I've opted for a global
		// patch instead so all JSON.stringify operations are save.
		//
		if (
			'object' === typeof JSON
			&& 'function' === typeof JSON.stringify
			&& JSON.stringify(['\u2028\u2029']) === '["\u2028\u2029"]'
			) {
			JSON.stringify = function replace(stringify) {
				var u2028 = /\u2028/g
				, u2029 = /\u2029/g;

				return function patched(value, replacer, spaces) {
					var result = stringify.call(this, value, replacer, spaces);

					//
					// Replace the bad chars.
					//
					if (result) {
						if (~result.indexOf('\u2028')) result = result.replace(u2028, '\\u2028');
						if (~result.indexOf('\u2029')) result = result.replace(u2029, '\\u2029');
					}

					return result;
				};
			}(JSON.stringify);
		}

		if (
		 'undefined' !== typeof document
		 && 'undefined' !== typeof navigator
		 ) {
			//
			// Hack 2: If you press ESC in FireFox it will close all active connections.
			// Normally this makes sense, when your page is still loading. But versions
			// before FireFox 22 will close all connections including WebSocket connections
			// after page load. One way to prevent this is to do a `preventDefault()` and
			// cancel the operation before it bubbles up to the browsers default handler.
			// It needs to be added as `keydown` event, if it's added keyup it will not be
			// able to prevent the connection from being closed.
			//
			if (document.addEventListener) {
				document.addEventListener('keydown', function keydown(e) {
					if (e.keyCode !== 27 || !e.preventDefault) return;

					e.preventDefault();
				}, false);
			}

			//
			// Hack 3: This is a Mac/Apple bug only, when you're behind a reverse proxy or
			// have you network settings set to `automatic proxy discovery` the safari
			// browser will crash when the WebSocket constructor is initialised. There is
			// no way to detect the usage of these proxies available in JavaScript so we
			// need to do some nasty browser sniffing. This only affects Safari versions
			// lower then 5.1.4
			//
			var ua = (navigator.userAgent || '').toLowerCase()
			, parsed = ua.match(/.+(?:rv|it|ra|ie)[\/: ](\d+)\.(\d+)(?:\.(\d+))?/) || []
			, version = +[parsed[1], parsed[2]].join('.');

			if (
			 !~ua.indexOf('chrome')
			 && ~ua.indexOf('safari')
			 && version < 534.54
			 ) {
				Primus.prototype.AVOID_WEBSOCKETS = true;
		}
		}
		 return Primus; });/* SockJS client, version 0.3.4, http://sockjs.org, MIT License

	Copyright (c) 2011-2012 VMware, Inc.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	// JSON2 by Douglas Crockford (minified).
	var JSON;JSON||(JSON={}),function(){function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i&&typeof i=="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g;return e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g;return e}}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function f(a){return a<10?"0"+a:a}"use strict",typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver=="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")})}()


	//     [*] Including lib/index.js
	// Public object
	SockJS = (function(){
		var _document = document;
		var _window = window;
		var utils = {};


	//         [*] Including lib/reventtarget.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	/* Simplified implementation of DOM2 EventTarget.
	 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
	 */
	 var REventTarget = function() {};
	 REventTarget.prototype.addEventListener = function (eventType, listener) {
		if(!this._listeners) {
		 this._listeners = {};
	 }
	 if(!(eventType in this._listeners)) {
		this._listeners[eventType] = [];
	}
	var arr = this._listeners[eventType];
	if(utils.arrIndexOf(arr, listener) === -1) {
		arr.push(listener);
	}
	return;
	};

	REventTarget.prototype.removeEventListener = function (eventType, listener) {
		if(!(this._listeners && (eventType in this._listeners))) {
			return;
		}
		var arr = this._listeners[eventType];
		var idx = utils.arrIndexOf(arr, listener);
		if (idx !== -1) {
			if(arr.length > 1) {
				this._listeners[eventType] = arr.slice(0, idx).concat( arr.slice(idx+1) );
			} else {
				delete this._listeners[eventType];
			}
			return;
		}
		return;
	};

	REventTarget.prototype.dispatchEvent = function (event) {
		var t = event.type;
		var args = Array.prototype.slice.call(arguments, 0);
		if (this['on'+t]) {
			this['on'+t].apply(this, args);
		}
		if (this._listeners && t in this._listeners) {
			for(var i=0; i < this._listeners[t].length; i++) {
				this._listeners[t][i].apply(this, args);
			}
		}
	};
	//         [*] End of lib/reventtarget.js


	//         [*] Including lib/simpleevent.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var SimpleEvent = function(type, obj) {
		this.type = type;
		if (typeof obj !== 'undefined') {
			for(var k in obj) {
				if (!obj.hasOwnProperty(k)) continue;
				this[k] = obj[k];
			}
		}
	};

	SimpleEvent.prototype.toString = function() {
		var r = [];
		for(var k in this) {
			if (!this.hasOwnProperty(k)) continue;
			var v = this[k];
			if (typeof v === 'function') v = '[function]';
			r.push(k + '=' + v);
		}
		return 'SimpleEvent(' + r.join(', ') + ')';
	};
	//         [*] End of lib/simpleevent.js


	//         [*] Including lib/eventemitter.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var EventEmitter = function(events) {
		var that = this;
		that._events = events || [];
		that._listeners = {};
	};
	EventEmitter.prototype.emit = function(type) {
		var that = this;
		that._verifyType(type);
		if (that._nuked) return;

		var args = Array.prototype.slice.call(arguments, 1);
		if (that['on'+type]) {
			that['on'+type].apply(that, args);
		}
		if (type in that._listeners) {
			for(var i = 0; i < that._listeners[type].length; i++) {
				that._listeners[type][i].apply(that, args);
			}
		}
	};

	EventEmitter.prototype.on = function(type, callback) {
		var that = this;
		that._verifyType(type);
		if (that._nuked) return;

		if (!(type in that._listeners)) {
			that._listeners[type] = [];
		}
		that._listeners[type].push(callback);
	};

	EventEmitter.prototype._verifyType = function(type) {
		var that = this;
		if (utils.arrIndexOf(that._events, type) === -1) {
			utils.log('Event ' + JSON.stringify(type) +
				' not listed ' + JSON.stringify(that._events) +
				' in ' + that);
		}
	};

	EventEmitter.prototype.nuke = function() {
		var that = this;
		that._nuked = true;
		for(var i=0; i<that._events.length; i++) {
			delete that[that._events[i]];
		}
		that._listeners = {};
	};
	//         [*] End of lib/eventemitter.js


	//         [*] Including lib/utils.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var random_string_chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
	 utils.random_string = function(length, max) {
		max = max || random_string_chars.length;
		var i, ret = [];
		for(i=0; i < length; i++) {
			ret.push( random_string_chars.substr(Math.floor(Math.random() * max),1) );
		}
		return ret.join('');
	};
	utils.random_number = function(max) {
		return Math.floor(Math.random() * max);
	};
	utils.random_number_string = function(max) {
		var t = (''+(max - 1)).length;
		var p = Array(t+1).join('0');
		return (p + utils.random_number(max)).slice(-t);
	};

	// Assuming that url looks like: http://asdasd:111/asd
	utils.getOrigin = function(url) {
		url += '/';
		var parts = url.split('/').slice(0, 3);
		return parts.join('/');
	};

	utils.isSameOriginUrl = function(url_a, url_b) {
			// location.origin would do, but it's not always available.
			if (!url_b) url_b = _window.location.href;

			return (url_a.split('/').slice(0,3).join('/')
				===
				url_b.split('/').slice(0,3).join('/'));
		};

		utils.getParentDomain = function(url) {
			// ipv4 ip address
			if (/^[0-9.]*$/.test(url)) return url;
			// ipv6 ip address
			if (/^\[/.test(url)) return url;
			// no dots
			if (!(/[.]/.test(url))) return url;

			var parts = url.split('.').slice(1);
			return parts.join('.');
		};

		utils.objectExtend = function(dst, src) {
			for(var k in src) {
				if (src.hasOwnProperty(k)) {
					dst[k] = src[k];
				}
			}
			return dst;
		};

		var WPrefix = '_jp';

		utils.polluteGlobalNamespace = function() {
			if (!(WPrefix in _window)) {
				_window[WPrefix] = {};
			}
		};

		utils.closeFrame = function (code, reason) {
			return 'c'+JSON.stringify([code, reason]);
		};

		utils.userSetCode = function (code) {
			return code === 1000 || (code >= 3000 && code <= 4999);
		};

	// See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
	// and RFC 2988.
	utils.countRTO = function (rtt) {
		var rto;
		if (rtt > 100) {
					rto = 3 * rtt; // rto > 300msec
				} else {
					rto = rtt + 200; // 200msec < rto <= 300msec
				}
				return rto;
			}

			utils.log = function() {
				if (_window.console && console.log && console.log.apply) {
					console.log.apply(console, arguments);
				}
			};

			utils.bind = function(fun, that) {
				if (fun.bind) {
					return fun.bind(that);
				} else {
					return function() {
						return fun.apply(that, arguments);
					};
				}
			};

			utils.flatUrl = function(url) {
				return url.indexOf('?') === -1 && url.indexOf('#') === -1;
			};

			utils.amendUrl = function(url) {
				var dl = _document.location;
				if (!url) {
					throw new Error('Wrong url for SockJS');
				}
				if (!utils.flatUrl(url)) {
					throw new Error('Only basic urls are supported in SockJS');
				}

			//  '//abc' --> 'http://abc'
			if (url.indexOf('//') === 0) {
				url = dl.protocol + url;
			}
			// '/abc' --> 'http://localhost:80/abc'
			if (url.indexOf('/') === 0) {
				url = dl.protocol + '//' + dl.host + url;
			}
			// strip trailing slashes
			url = url.replace(/[/]+$/,'');
			return url;
		};

	// IE doesn't support [].indexOf.
	utils.arrIndexOf = function(arr, obj){
		for(var i=0; i < arr.length; i++){
			if(arr[i] === obj){
				return i;
			}
		}
		return -1;
	};

	utils.arrSkip = function(arr, obj) {
		var idx = utils.arrIndexOf(arr, obj);
		if (idx === -1) {
			return arr.slice();
		} else {
			var dst = arr.slice(0, idx);
			return dst.concat(arr.slice(idx+1));
		}
	};

	// Via: https://gist.github.com/1133122/2121c601c5549155483f50be3da5305e83b8c5df
	utils.isArray = Array.isArray || function(value) {
		return {}.toString.call(value).indexOf('Array') >= 0
	};

	utils.delay = function(t, fun) {
		if(typeof t === 'function') {
			fun = t;
			t = 0;
		}
		return setTimeout(fun, t);
	};


	// Chars worth escaping, as defined by Douglas Crockford:
	//   https://github.com/douglascrockford/JSON-js/blob/47a9882cddeb1e8529e07af9736218075372b8ac/json2.js#L196
	var json_escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	json_lookup = {
		"\u0000":"\\u0000","\u0001":"\\u0001","\u0002":"\\u0002","\u0003":"\\u0003",
		"\u0004":"\\u0004","\u0005":"\\u0005","\u0006":"\\u0006","\u0007":"\\u0007",
		"\b":"\\b","\t":"\\t","\n":"\\n","\u000b":"\\u000b","\f":"\\f","\r":"\\r",
		"\u000e":"\\u000e","\u000f":"\\u000f","\u0010":"\\u0010","\u0011":"\\u0011",
		"\u0012":"\\u0012","\u0013":"\\u0013","\u0014":"\\u0014","\u0015":"\\u0015",
		"\u0016":"\\u0016","\u0017":"\\u0017","\u0018":"\\u0018","\u0019":"\\u0019",
		"\u001a":"\\u001a","\u001b":"\\u001b","\u001c":"\\u001c","\u001d":"\\u001d",
		"\u001e":"\\u001e","\u001f":"\\u001f","\"":"\\\"","\\":"\\\\",
		"\u007f":"\\u007f","\u0080":"\\u0080","\u0081":"\\u0081","\u0082":"\\u0082",
		"\u0083":"\\u0083","\u0084":"\\u0084","\u0085":"\\u0085","\u0086":"\\u0086",
		"\u0087":"\\u0087","\u0088":"\\u0088","\u0089":"\\u0089","\u008a":"\\u008a",
		"\u008b":"\\u008b","\u008c":"\\u008c","\u008d":"\\u008d","\u008e":"\\u008e",
		"\u008f":"\\u008f","\u0090":"\\u0090","\u0091":"\\u0091","\u0092":"\\u0092",
		"\u0093":"\\u0093","\u0094":"\\u0094","\u0095":"\\u0095","\u0096":"\\u0096",
		"\u0097":"\\u0097","\u0098":"\\u0098","\u0099":"\\u0099","\u009a":"\\u009a",
		"\u009b":"\\u009b","\u009c":"\\u009c","\u009d":"\\u009d","\u009e":"\\u009e",
		"\u009f":"\\u009f","\u00ad":"\\u00ad","\u0600":"\\u0600","\u0601":"\\u0601",
		"\u0602":"\\u0602","\u0603":"\\u0603","\u0604":"\\u0604","\u070f":"\\u070f",
		"\u17b4":"\\u17b4","\u17b5":"\\u17b5","\u200c":"\\u200c","\u200d":"\\u200d",
		"\u200e":"\\u200e","\u200f":"\\u200f","\u2028":"\\u2028","\u2029":"\\u2029",
		"\u202a":"\\u202a","\u202b":"\\u202b","\u202c":"\\u202c","\u202d":"\\u202d",
		"\u202e":"\\u202e","\u202f":"\\u202f","\u2060":"\\u2060","\u2061":"\\u2061",
		"\u2062":"\\u2062","\u2063":"\\u2063","\u2064":"\\u2064","\u2065":"\\u2065",
		"\u2066":"\\u2066","\u2067":"\\u2067","\u2068":"\\u2068","\u2069":"\\u2069",
		"\u206a":"\\u206a","\u206b":"\\u206b","\u206c":"\\u206c","\u206d":"\\u206d",
		"\u206e":"\\u206e","\u206f":"\\u206f","\ufeff":"\\ufeff","\ufff0":"\\ufff0",
		"\ufff1":"\\ufff1","\ufff2":"\\ufff2","\ufff3":"\\ufff3","\ufff4":"\\ufff4",
		"\ufff5":"\\ufff5","\ufff6":"\\ufff6","\ufff7":"\\ufff7","\ufff8":"\\ufff8",
		"\ufff9":"\\ufff9","\ufffa":"\\ufffa","\ufffb":"\\ufffb","\ufffc":"\\ufffc",
		"\ufffd":"\\ufffd","\ufffe":"\\ufffe","\uffff":"\\uffff"};

	// Some extra characters that Chrome gets wrong, and substitutes with
	// something else on the wire.
	var extra_escapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
	extra_lookup;

	// JSON Quote string. Use native implementation when possible.
	var JSONQuote = (JSON && JSON.stringify) || function(string) {
		json_escapable.lastIndex = 0;
		if (json_escapable.test(string)) {
			string = string.replace(json_escapable, function(a) {
				return json_lookup[a];
			});
		}
		return '"' + string + '"';
	};

	// This may be quite slow, so let's delay until user actually uses bad
	// characters.
	var unroll_lookup = function(escapable) {
		var i;
		var unrolled = {}
		var c = []
		for(i=0; i<65536; i++) {
			c.push( String.fromCharCode(i) );
		}
		escapable.lastIndex = 0;
		c.join('').replace(escapable, function (a) {
			unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			return '';
		});
		escapable.lastIndex = 0;
		return unrolled;
	};

	// Quote string, also taking care of unicode characters that browsers
	// often break. Especially, take care of unicode surrogates:
	//    http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
	utils.quote = function(string) {
		var quoted = JSONQuote(string);

			// In most cases this should be very fast and good enough.
			extra_escapable.lastIndex = 0;
			if(!extra_escapable.test(quoted)) {
				return quoted;
			}

			if(!extra_lookup) extra_lookup = unroll_lookup(extra_escapable);

			return quoted.replace(extra_escapable, function(a) {
				return extra_lookup[a];
			});
		}

		var _all_protocols = ['websocket',
		'xdr-streaming',
		'xhr-streaming',
		'iframe-eventsource',
		'iframe-htmlfile',
		'xdr-polling',
		'xhr-polling',
		'iframe-xhr-polling',
		'jsonp-polling'];

		utils.probeProtocols = function() {
			var probed = {};
			for(var i=0; i<_all_protocols.length; i++) {
				var protocol = _all_protocols[i];
					// User can have a typo in protocol name.
					probed[protocol] = SockJS[protocol] &&
					SockJS[protocol].enabled();
				}
				return probed;
			};

			utils.detectProtocols = function(probed, protocols_whitelist, info) {
				var pe = {},
				protocols = [];
				if (!protocols_whitelist) protocols_whitelist = _all_protocols;
				for(var i=0; i<protocols_whitelist.length; i++) {
					var protocol = protocols_whitelist[i];
					pe[protocol] = probed[protocol];
				}
				var maybe_push = function(protos) {
					var proto = protos.shift();
					if (pe[proto]) {
						protocols.push(proto);
					} else {
						if (protos.length > 0) {
							maybe_push(protos);
						}
					}
				}

			// 1. Websocket
			if (info.websocket !== false) {
				maybe_push(['websocket']);
			}

			// 2. Streaming
			if (pe['xhr-streaming'] && !info.null_origin) {
				protocols.push('xhr-streaming');
			} else {
				if (pe['xdr-streaming'] && !info.cookie_needed && !info.null_origin) {
					protocols.push('xdr-streaming');
				} else {
					maybe_push(['iframe-eventsource',
						'iframe-htmlfile']);
				}
			}

			// 3. Polling
			if (pe['xhr-polling'] && !info.null_origin) {
				protocols.push('xhr-polling');
			} else {
				if (pe['xdr-polling'] && !info.cookie_needed && !info.null_origin) {
					protocols.push('xdr-polling');
				} else {
					maybe_push(['iframe-xhr-polling',
						'jsonp-polling']);
				}
			}
			return protocols;
		}
	//         [*] End of lib/utils.js


	//         [*] Including lib/dom.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	// May be used by htmlfile jsonp and transports.
	var MPrefix = '_sockjs_global';
	utils.createHook = function() {
		var window_id = 'a' + utils.random_string(8);
		if (!(MPrefix in _window)) {
			var map = {};
			_window[MPrefix] = function(window_id) {
				if (!(window_id in map)) {
					map[window_id] = {
						id: window_id,
						del: function() {delete map[window_id];}
					};
				}
				return map[window_id];
			}
		}
		return _window[MPrefix](window_id);
	};



	utils.attachMessage = function(listener) {
		utils.attachEvent('message', listener);
	};
	utils.attachEvent = function(event, listener) {
		if (typeof _window.addEventListener !== 'undefined') {
			_window.addEventListener(event, listener, false);
		} else {
					// IE quirks.
					// According to: http://stevesouders.com/misc/test-postmessage.php
					// the message gets delivered only to 'document', not 'window'.
					_document.attachEvent("on" + event, listener);
					// I get 'window' for ie8.
					_window.attachEvent("on" + event, listener);
				}
			};

			utils.detachMessage = function(listener) {
				utils.detachEvent('message', listener);
			};
			utils.detachEvent = function(event, listener) {
				if (typeof _window.addEventListener !== 'undefined') {
					_window.removeEventListener(event, listener, false);
				} else {
					_document.detachEvent("on" + event, listener);
					_window.detachEvent("on" + event, listener);
				}
			};


			var on_unload = {};
	// Things registered after beforeunload are to be called immediately.
	var after_unload = false;

	var trigger_unload_callbacks = function() {
		for(var ref in on_unload) {
			on_unload[ref]();
			delete on_unload[ref];
		};
	};

	var unload_triggered = function() {
		if(after_unload) return;
		after_unload = true;
		trigger_unload_callbacks();
	};

	// 'unload' alone is not reliable in opera within an iframe, but we
	// can't use `beforeunload` as IE fires it on javascript: links.
	utils.attachEvent('unload', unload_triggered);

	utils.unload_add = function(listener) {
		var ref = utils.random_string(8);
		on_unload[ref] = listener;
		if (after_unload) {
			utils.delay(trigger_unload_callbacks);
		}
		return ref;
	};
	utils.unload_del = function(ref) {
		if (ref in on_unload)
			delete on_unload[ref];
	};


	utils.createIframe = function (iframe_url, error_callback) {
		var iframe = _document.createElement('iframe');
		var tref, unload_ref;
		var unattach = function() {
			clearTimeout(tref);
					// Explorer had problems with that.
					try {iframe.onload = null;} catch (x) {}
					iframe.onerror = null;
				};
				var cleanup = function() {
					if (iframe) {
						unattach();
							// This timeout makes chrome fire onbeforeunload event
							// within iframe. Without the timeout it goes straight to
							// onunload.
							setTimeout(function() {
								if(iframe) {
									iframe.parentNode.removeChild(iframe);
								}
								iframe = null;
							}, 0);
							utils.unload_del(unload_ref);
						}
					};
					var onerror = function(r) {
						if (iframe) {
							cleanup();
							error_callback(r);
						}
					};
					var post = function(msg, origin) {
						try {
							// When the iframe is not loaded, IE raises an exception
							// on 'contentWindow'.
							if (iframe && iframe.contentWindow) {
								iframe.contentWindow.postMessage(msg, origin);
							}
						} catch (x) {};
					};

					iframe.src = iframe_url;
					iframe.style.display = 'none';
					iframe.style.position = 'absolute';
					iframe.onerror = function(){onerror('onerror');};
					iframe.onload = function() {
					// `onload` is triggered before scripts on the iframe are
					// executed. Give it few seconds to actually load stuff.
					clearTimeout(tref);
					tref = setTimeout(function(){onerror('onload timeout');}, 2000);
				};
				_document.body.appendChild(iframe);
				tref = setTimeout(function(){onerror('timeout');}, 15000);
				unload_ref = utils.unload_add(cleanup);
				return {
					post: post,
					cleanup: cleanup,
					loaded: unattach
				};
			};

			utils.createHtmlfile = function (iframe_url, error_callback) {
				var doc = new ActiveXObject('htmlfile');
				var tref, unload_ref;
				var iframe;
				var unattach = function() {
					clearTimeout(tref);
				};
				var cleanup = function() {
					if (doc) {
						unattach();
						utils.unload_del(unload_ref);
						iframe.parentNode.removeChild(iframe);
						iframe = doc = null;
						CollectGarbage();
					}
				};
				var onerror = function(r)  {
					if (doc) {
						cleanup();
						error_callback(r);
					}
				};
				var post = function(msg, origin) {
					try {
							// When the iframe is not loaded, IE raises an exception
							// on 'contentWindow'.
							if (iframe && iframe.contentWindow) {
								iframe.contentWindow.postMessage(msg, origin);
							}
						} catch (x) {};
					};

					doc.open();
					doc.write('<html><s' + 'cript>' +
						'document.domain="' + document.domain + '";' +
						'</s' + 'cript></html>');
					doc.close();
					doc.parentWindow[WPrefix] = _window[WPrefix];
					var c = doc.createElement('div');
					doc.body.appendChild(c);
					iframe = doc.createElement('iframe');
					c.appendChild(iframe);
					iframe.src = iframe_url;
					tref = setTimeout(function(){onerror('timeout');}, 15000);
					unload_ref = utils.unload_add(cleanup);
					return {
						post: post,
						cleanup: cleanup,
						loaded: unattach
					};
				};
	//         [*] End of lib/dom.js


	//         [*] Including lib/dom2.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var AbstractXHRObject = function(){};
	 AbstractXHRObject.prototype = new EventEmitter(['chunk', 'finish']);

	 AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
		var that = this;

		try {
			that.xhr = new XMLHttpRequest();
		} catch(x) {};

		if (!that.xhr) {
			try {
				that.xhr = new _window.ActiveXObject('Microsoft.XMLHTTP');
			} catch(x) {};
		}
		if (_window.ActiveXObject || _window.XDomainRequest) {
					// IE8 caches even POSTs
					url += ((url.indexOf('?') === -1) ? '?' : '&') + 't='+(+new Date);
				}

			// Explorer tends to keep connection open, even after the
			// tab gets closed: http://bugs.jquery.com/ticket/5280
			that.unload_ref = utils.unload_add(function(){that._cleanup(true);});
			try {
				that.xhr.open(method, url, true);
			} catch(e) {
					// IE raises an exception on wrong port.
					that.emit('finish', 0, '');
					that._cleanup();
					return;
				};

				if (!opts || !opts.no_credentials) {
					// Mozilla docs says https://developer.mozilla.org/en/XMLHttpRequest :
					// "This never affects same-site requests."
					that.xhr.withCredentials = 'true';
				}
				if (opts && opts.headers) {
					for(var key in opts.headers) {
						that.xhr.setRequestHeader(key, opts.headers[key]);
					}
				}

				that.xhr.onreadystatechange = function() {
					if (that.xhr) {
						var x = that.xhr;
						switch (x.readyState) {
							case 3:
									// IE doesn't like peeking into responseText or status
									// on Microsoft.XMLHTTP and readystate=3
									try {
										var status = x.status;
										var text = x.responseText;
									} catch (x) {};
									// IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
									if (status === 1223) status = 204;

									// IE does return readystate == 3 for 404 answers.
									if (text && text.length > 0) {
										that.emit('chunk', status, text);
									}
									break;
									case 4:
									var status = x.status;
									// IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
									if (status === 1223) status = 204;

									that.emit('finish', status, x.responseText);
									that._cleanup(false);
									break;
								}
							}
						};
						that.xhr.send(payload);
					};

					AbstractXHRObject.prototype._cleanup = function(abort) {
						var that = this;
						if (!that.xhr) return;
						utils.unload_del(that.unload_ref);

			// IE needs this field to be a function
			that.xhr.onreadystatechange = function(){};

			if (abort) {
				try {
					that.xhr.abort();
				} catch(x) {};
			}
			that.unload_ref = that.xhr = null;
		};

		AbstractXHRObject.prototype.close = function() {
			var that = this;
			that.nuke();
			that._cleanup(true);
		};

		var XHRCorsObject = utils.XHRCorsObject = function() {
			var that = this, args = arguments;
			utils.delay(function(){that._start.apply(that, args);});
		};
		XHRCorsObject.prototype = new AbstractXHRObject();

		var XHRLocalObject = utils.XHRLocalObject = function(method, url, payload) {
			var that = this;
			utils.delay(function(){
				that._start(method, url, payload, {
					no_credentials: true
				});
			});
		};
		XHRLocalObject.prototype = new AbstractXHRObject();



	// References:
	//   http://ajaxian.com/archives/100-line-ajax-wrapper
	//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx
	var XDRObject = utils.XDRObject = function(method, url, payload) {
		var that = this;
		utils.delay(function(){that._start(method, url, payload);});
	};
	XDRObject.prototype = new EventEmitter(['chunk', 'finish']);
	XDRObject.prototype._start = function(method, url, payload) {
		var that = this;
		var xdr = new XDomainRequest();
			// IE caches even POSTs
			url += ((url.indexOf('?') === -1) ? '?' : '&') + 't='+(+new Date);

			var onerror = xdr.ontimeout = xdr.onerror = function() {
				that.emit('finish', 0, '');
				that._cleanup(false);
			};
			xdr.onprogress = function() {
				that.emit('chunk', 200, xdr.responseText);
			};
			xdr.onload = function() {
				that.emit('finish', 200, xdr.responseText);
				that._cleanup(false);
			};
			that.xdr = xdr;
			that.unload_ref = utils.unload_add(function(){that._cleanup(true);});
			try {
					// Fails with AccessDenied if port number is bogus
					that.xdr.open(method, url);
					that.xdr.send(payload);
				} catch(x) {
					onerror();
				}
			};

			XDRObject.prototype._cleanup = function(abort) {
				var that = this;
				if (!that.xdr) return;
				utils.unload_del(that.unload_ref);

				that.xdr.ontimeout = that.xdr.onerror = that.xdr.onprogress =
				that.xdr.onload = null;
				if (abort) {
					try {
						that.xdr.abort();
					} catch(x) {};
				}
				that.unload_ref = that.xdr = null;
			};

			XDRObject.prototype.close = function() {
				var that = this;
				that.nuke();
				that._cleanup(true);
			};

	// 1. Is natively via XHR
	// 2. Is natively via XDR
	// 3. Nope, but postMessage is there so it should work via the Iframe.
	// 4. Nope, sorry.
	utils.isXHRCorsCapable = function() {
		if (_window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()) {
			return 1;
		}
			// XDomainRequest doesn't work if page is served from file://
			if (_window.XDomainRequest && _document.domain) {
				return 2;
			}
			if (IframeTransport.enabled()) {
				return 3;
			}
			return 4;
		};
	//         [*] End of lib/dom2.js


	//         [*] Including lib/sockjs.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var SockJS = function(url, dep_protocols_whitelist, options) {
		if (this === _window) {
					// makes `new` optional
					return new SockJS(url, dep_protocols_whitelist, options);
				}

				var that = this, protocols_whitelist;
				that._options = {devel: false, debug: false, protocols_whitelist: [],
				 info: undefined, rtt: undefined};
				 if (options) {
					utils.objectExtend(that._options, options);
				}
				that._base_url = utils.amendUrl(url);
				that._server = that._options.server || utils.random_number_string(1000);
				if (that._options.protocols_whitelist &&
					that._options.protocols_whitelist.length) {
					protocols_whitelist = that._options.protocols_whitelist;
			} else {
					// Deprecated API
					if (typeof dep_protocols_whitelist === 'string' &&
						dep_protocols_whitelist.length > 0) {
						protocols_whitelist = [dep_protocols_whitelist];
				} else if (utils.isArray(dep_protocols_whitelist)) {
					protocols_whitelist = dep_protocols_whitelist
				} else {
					protocols_whitelist = null;
				}
				if (protocols_whitelist) {
					that._debug('Deprecated API: Use "protocols_whitelist" option ' +
						'instead of supplying protocol list as a second ' +
						'parameter to SockJS constructor.');
				}
			}
			that._protocols = [];
			that.protocol = null;
			that.readyState = SockJS.CONNECTING;
			that._ir = createInfoReceiver(that._base_url);
			that._ir.onfinish = function(info, rtt) {
				that._ir = null;
				if (info) {
					if (that._options.info) {
									// Override if user supplies the option
									info = utils.objectExtend(info, that._options.info);
								}
								if (that._options.rtt) {
									rtt = that._options.rtt;
								}
								that._applyInfo(info, rtt, protocols_whitelist);
								that._didClose();
							} else {
								that._didClose(1002, 'Can\'t connect to server', true);
							}
						};
					};
	// Inheritance
	SockJS.prototype = new REventTarget();

	SockJS.version = "0.3.4";

	SockJS.CONNECTING = 0;
	SockJS.OPEN = 1;
	SockJS.CLOSING = 2;
	SockJS.CLOSED = 3;

	SockJS.prototype._debug = function() {
		if (this._options.debug)
			utils.log.apply(utils, arguments);
	};

	SockJS.prototype._dispatchOpen = function() {
		var that = this;
		if (that.readyState === SockJS.CONNECTING) {
			if (that._transport_tref) {
				clearTimeout(that._transport_tref);
				that._transport_tref = null;
			}
			that.readyState = SockJS.OPEN;
			that.dispatchEvent(new SimpleEvent("open"));
		} else {
					// The server might have been restarted, and lost track of our
					// connection.
					that._didClose(1006, "Server lost session");
				}
			};

			SockJS.prototype._dispatchMessage = function(data) {
				var that = this;
				if (that.readyState !== SockJS.OPEN)
					return;
				that.dispatchEvent(new SimpleEvent("message", {data: data}));
			};

			SockJS.prototype._dispatchHeartbeat = function(data) {
				var that = this;
				if (that.readyState !== SockJS.OPEN)
					return;
				that.dispatchEvent(new SimpleEvent('heartbeat', {}));
			};

			SockJS.prototype._didClose = function(code, reason, force) {
				var that = this;
				if (that.readyState !== SockJS.CONNECTING &&
					that.readyState !== SockJS.OPEN &&
					that.readyState !== SockJS.CLOSING)
					throw new Error('INVALID_STATE_ERR');
				if (that._ir) {
					that._ir.nuke();
					that._ir = null;
				}

				if (that._transport) {
					that._transport.doCleanup();
					that._transport = null;
				}

				var close_event = new SimpleEvent("close", {
					code: code,
					reason: reason,
					wasClean: utils.userSetCode(code)});

				if (!utils.userSetCode(code) &&
					that.readyState === SockJS.CONNECTING && !force) {
					if (that._try_next_protocol(close_event)) {
						return;
					}
					close_event = new SimpleEvent("close", {code: 2000,
						reason: "All transports failed",
						wasClean: false,
						last_event: close_event});
				}
				that.readyState = SockJS.CLOSED;

				utils.delay(function() {
				 that.dispatchEvent(close_event);
			 });
			};

			SockJS.prototype._didMessage = function(data) {
				var that = this;
				var type = data.slice(0, 1);
				switch(type) {
					case 'o':
					that._dispatchOpen();
					break;
					case 'a':
					var payload = JSON.parse(data.slice(1) || '[]');
					for(var i=0; i < payload.length; i++){
						that._dispatchMessage(payload[i]);
					}
					break;
					case 'm':
					var payload = JSON.parse(data.slice(1) || 'null');
					that._dispatchMessage(payload);
					break;
					case 'c':
					var payload = JSON.parse(data.slice(1) || '[]');
					that._didClose(payload[0], payload[1]);
					break;
					case 'h':
					that._dispatchHeartbeat();
					break;
				}
			};

			SockJS.prototype._try_next_protocol = function(close_event) {
				var that = this;
				if (that.protocol) {
					that._debug('Closed transport:', that.protocol, ''+close_event);
					that.protocol = null;
				}
				if (that._transport_tref) {
					clearTimeout(that._transport_tref);
					that._transport_tref = null;
				}

				while(1) {
					var protocol = that.protocol = that._protocols.shift();
					if (!protocol) {
						return false;
					}
					// Some protocols require access to `body`, what if were in
					// the `head`?
					if (SockJS[protocol] &&
						SockJS[protocol].need_body === true &&
						(!_document.body ||
						 (typeof _document.readyState !== 'undefined'
							&& _document.readyState !== 'complete'))) {
						that._protocols.unshift(protocol);
					that.protocol = 'waiting-for-load';
					utils.attachEvent('load', function(){
						that._try_next_protocol();
					});
					return true;
				}

				if (!SockJS[protocol] ||
					!SockJS[protocol].enabled(that._options)) {
					that._debug('Skipping transport:', protocol);
			} else {
				var roundTrips = SockJS[protocol].roundTrips || 1;
				var to = ((that._options.rto || 0) * roundTrips) || 5000;
				that._transport_tref = utils.delay(to, function() {
					if (that.readyState === SockJS.CONNECTING) {
											// I can't understand how it is possible to run
											// this timer, when the state is CLOSED, but
											// apparently in IE everythin is possible.
											that._didClose(2007, "Transport timeouted");
										}
									});

				var connid = utils.random_string(8);
				var trans_url = that._base_url + '/' + that._server + '/' + connid;
				that._debug('Opening transport:', protocol, ' url:'+trans_url,
					' RTO:'+that._options.rto);
				that._transport = new SockJS[protocol](that, trans_url,
				 that._base_url);
				return true;
			}
		}
	};

	SockJS.prototype.close = function(code, reason) {
		var that = this;
		if (code && !utils.userSetCode(code))
			throw new Error("INVALID_ACCESS_ERR");
		if(that.readyState !== SockJS.CONNECTING &&
		 that.readyState !== SockJS.OPEN) {
			return false;
	}
	that.readyState = SockJS.CLOSING;
	that._didClose(code || 1000, reason || "Normal closure");
	return true;
	};

	SockJS.prototype.send = function(data) {
		var that = this;
		if (that.readyState === SockJS.CONNECTING)
			throw new Error('INVALID_STATE_ERR');
		if (that.readyState === SockJS.OPEN) {
			that._transport.doSend(utils.quote('' + data));
		}
		return true;
	};

	SockJS.prototype._applyInfo = function(info, rtt, protocols_whitelist) {
		var that = this;
		that._options.info = info;
		that._options.rtt = rtt;
		that._options.rto = utils.countRTO(rtt);
		that._options.info.null_origin = !_document.domain;
		var probed = utils.probeProtocols();
		that._protocols = utils.detectProtocols(probed, protocols_whitelist, info);
	};
	//         [*] End of lib/sockjs.js


	//         [*] Including lib/trans-websocket.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var WebSocketTransport = SockJS.websocket = function(ri, trans_url) {
		var that = this;
		var url = trans_url + '/websocket';
		if (url.slice(0, 5) === 'https') {
			url = 'wss' + url.slice(5);
		} else {
			url = 'ws' + url.slice(4);
		}
		that.ri = ri;
		that.url = url;
		var Constructor = _window.WebSocket || _window.MozWebSocket;

		that.ws = new Constructor(that.url);
		that.ws.onmessage = function(e) {
			that.ri._didMessage(e.data);
		};
			// Firefox has an interesting bug. If a websocket connection is
			// created after onunload, it stays alive even when user
			// navigates away from the page. In such situation let's lie -
			// let's not open the ws connection at all. See:
			// https://github.com/sockjs/sockjs-client/issues/28
			// https://bugzilla.mozilla.org/show_bug.cgi?id=696085
			that.unload_ref = utils.unload_add(function(){that.ws.close()});
			that.ws.onclose = function() {
				that.ri._didMessage(utils.closeFrame(1006, "WebSocket connection broken"));
			};
		};

		WebSocketTransport.prototype.doSend = function(data) {
			this.ws.send('[' + data + ']');
		};

		WebSocketTransport.prototype.doCleanup = function() {
			var that = this;
			var ws = that.ws;
			if (ws) {
				ws.onmessage = ws.onclose = null;
				ws.close();
				utils.unload_del(that.unload_ref);
				that.unload_ref = that.ri = that.ws = null;
			}
		};

		WebSocketTransport.enabled = function() {
			return !!(_window.WebSocket || _window.MozWebSocket);
		};

	// In theory, ws should require 1 round trip. But in chrome, this is
	// not very stable over SSL. Most likely a ws connection requires a
	// separate SSL connection, in which case 2 round trips are an
	// absolute minumum.
	WebSocketTransport.roundTrips = 2;
	//         [*] End of lib/trans-websocket.js


	//         [*] Including lib/trans-sender.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var BufferedSender = function() {};
	 BufferedSender.prototype.send_constructor = function(sender) {
		var that = this;
		that.send_buffer = [];
		that.sender = sender;
	};
	BufferedSender.prototype.doSend = function(message) {
		var that = this;
		that.send_buffer.push(message);
		if (!that.send_stop) {
			that.send_schedule();
		}
	};

	// For polling transports in a situation when in the message callback,
	// new message is being send. If the sending connection was started
	// before receiving one, it is possible to saturate the network and
	// timeout due to the lack of receiving socket. To avoid that we delay
	// sending messages by some small time, in order to let receiving
	// connection be started beforehand. This is only a halfmeasure and
	// does not fix the big problem, but it does make the tests go more
	// stable on slow networks.
	BufferedSender.prototype.send_schedule_wait = function() {
		var that = this;
		var tref;
		that.send_stop = function() {
			that.send_stop = null;
			clearTimeout(tref);
		};
		tref = utils.delay(25, function() {
			that.send_stop = null;
			that.send_schedule();
		});
	};

	BufferedSender.prototype.send_schedule = function() {
		var that = this;
		if (that.send_buffer.length > 0) {
			var payload = '[' + that.send_buffer.join(',') + ']';
			that.send_stop = that.sender(that.trans_url, payload, function(success, abort_reason) {
				that.send_stop = null;
				if (success === false) {
					that.ri._didClose(1006, 'Sending error ' + abort_reason);
				} else {
					that.send_schedule_wait();
				}
			});
			that.send_buffer = [];
		}
	};

	BufferedSender.prototype.send_destructor = function() {
		var that = this;
		if (that._send_stop) {
			that._send_stop();
		}
		that._send_stop = null;
	};

	var jsonPGenericSender = function(url, payload, callback) {
		var that = this;

		if (!('_send_form' in that)) {
			var form = that._send_form = _document.createElement('form');
			var area = that._send_area = _document.createElement('textarea');
			area.name = 'd';
			form.style.display = 'none';
			form.style.position = 'absolute';
			form.method = 'POST';
			form.enctype = 'application/x-www-form-urlencoded';
			form.acceptCharset = "UTF-8";
			form.appendChild(area);
			_document.body.appendChild(form);
		}
		var form = that._send_form;
		var area = that._send_area;
		var id = 'a' + utils.random_string(8);
		form.target = id;
		form.action = url + '/jsonp_send?i=' + id;

		var iframe;
		try {
					// ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
					iframe = _document.createElement('<iframe name="'+ id +'">');
				} catch(x) {
					iframe = _document.createElement('iframe');
					iframe.name = id;
				}
				iframe.id = id;
				form.appendChild(iframe);
				iframe.style.display = 'none';

				try {
					area.value = payload;
				} catch(e) {
					utils.log('Your browser is seriously broken. Go home! ' + e.message);
				}
				form.submit();

				var completed = function(e) {
					if (!iframe.onerror) return;
					iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
					// Opera mini doesn't like if we GC iframe
					// immediately, thus this timeout.
					utils.delay(500, function() {
					 iframe.parentNode.removeChild(iframe);
					 iframe = null;
				 });
					area.value = '';
					// It is not possible to detect if the iframe succeeded or
					// failed to submit our form.
					callback(true);
				};
				iframe.onerror = iframe.onload = completed;
				iframe.onreadystatechange = function(e) {
					if (iframe.readyState == 'complete') completed();
				};
				return completed;
			};

			var createAjaxSender = function(AjaxObject) {
				return function(url, payload, callback) {
					var xo = new AjaxObject('POST', url + '/xhr_send', payload);
					xo.onfinish = function(status, text) {
						callback(status === 200 || status === 204,
						 'http status ' + status);
					};
					return function(abort_reason) {
						callback(false, abort_reason);
					};
				};
			};
	//         [*] End of lib/trans-sender.js


	//         [*] Including lib/trans-jsonp-receiver.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	// Parts derived from Socket.io:
	//    https://github.com/LearnBoost/socket.io/blob/0.6.17/lib/socket.io/transports/jsonp-polling.js
	// and jQuery-JSONP:
	//    https://code.google.com/p/jquery-jsonp/source/browse/trunk/core/jquery.jsonp.js
	var jsonPGenericReceiver = function(url, callback) {
		var tref;
		var script = _document.createElement('script');
			var script2;  // Opera synchronous load trick.
			var close_script = function(frame) {
				if (script2) {
					script2.parentNode.removeChild(script2);
					script2 = null;
				}
				if (script) {
					clearTimeout(tref);
							// Unfortunately, you can't really abort script loading of
							// the script.
							script.parentNode.removeChild(script);
							script.onreadystatechange = script.onerror =
							script.onload = script.onclick = null;
							script = null;
							callback(frame);
							callback = null;
						}
					};

			// IE9 fires 'error' event after orsc or before, in random order.
			var loaded_okay = false;
			var error_timer = null;

			script.id = 'a' + utils.random_string(8);
			script.src = url;
			script.type = 'text/javascript';
			script.charset = 'UTF-8';
			script.onerror = function(e) {
				if (!error_timer) {
							// Delay firing close_script.
							error_timer = setTimeout(function() {
								if (!loaded_okay) {
									close_script(utils.closeFrame(
										1006,
										"JSONP script loaded abnormally (onerror)"));
								}
							}, 1000);
						}
					};
					script.onload = function(e) {
						close_script(utils.closeFrame(1006, "JSONP script loaded abnormally (onload)"));
					};

					script.onreadystatechange = function(e) {
						if (/loaded|closed/.test(script.readyState)) {
							if (script && script.htmlFor && script.onclick) {
								loaded_okay = true;
								try {
											// In IE, actually execute the script.
											script.onclick();
										} catch (x) {}
									}
									if (script) {
										close_script(utils.closeFrame(1006, "JSONP script loaded abnormally (onreadystatechange)"));
									}
								}
							};
			// IE: event/htmlFor/onclick trick.
			// One can't rely on proper order for onreadystatechange. In order to
			// make sure, set a 'htmlFor' and 'event' properties, so that
			// script code will be installed as 'onclick' handler for the
			// script object. Later, onreadystatechange, manually execute this
			// code. FF and Chrome doesn't work with 'event' and 'htmlFor'
			// set. For reference see:
			//   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
			// Also, read on that about script ordering:
			//   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
			if (typeof script.async === 'undefined' && _document.attachEvent) {
					// According to mozilla docs, in recent browsers script.async defaults
					// to 'true', so we may use it to detect a good browser:
					// https://developer.mozilla.org/en/HTML/Element/script
					if (!/opera/i.test(navigator.userAgent)) {
							// Naively assume we're in IE
							try {
								script.htmlFor = script.id;
								script.event = "onclick";
							} catch (x) {}
							script.async = true;
						} else {
							// Opera, second sync script hack
							script2 = _document.createElement('script');
							script2.text = "try{var a = document.getElementById('"+script.id+"'); if(a)a.onerror();}catch(x){};";
							script.async = script2.async = false;
						}
					}
					if (typeof script.async !== 'undefined') {
						script.async = true;
					}

			// Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
			tref = setTimeout(function() {
				close_script(utils.closeFrame(1006, "JSONP script loaded abnormally (timeout)"));
			}, 35000);

			var head = _document.getElementsByTagName('head')[0];
			head.insertBefore(script, head.firstChild);
			if (script2) {
				head.insertBefore(script2, head.firstChild);
			}
			return close_script;
		};
	//         [*] End of lib/trans-jsonp-receiver.js


	//         [*] Including lib/trans-jsonp-polling.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	// The simplest and most robust transport, using the well-know cross
	// domain hack - JSONP. This transport is quite inefficient - one
	// mssage could use up to one http request. But at least it works almost
	// everywhere.
	// Known limitations:
	//   o you will get a spinning cursor
	//   o for Konqueror a dumb timer is needed to detect errors


	var JsonPTransport = SockJS['jsonp-polling'] = function(ri, trans_url) {
		utils.polluteGlobalNamespace();
		var that = this;
		that.ri = ri;
		that.trans_url = trans_url;
		that.send_constructor(jsonPGenericSender);
		that._schedule_recv();
	};

	// Inheritnace
	JsonPTransport.prototype = new BufferedSender();

	JsonPTransport.prototype._schedule_recv = function() {
		var that = this;
		var callback = function(data) {
			that._recv_stop = null;
			if (data) {
							// no data - heartbeat;
							if (!that._is_closing) {
								that.ri._didMessage(data);
							}
						}
					// The message can be a close message, and change is_closing state.
					if (!that._is_closing) {
						that._schedule_recv();
					}
				};
				that._recv_stop = jsonPReceiverWrapper(that.trans_url + '/jsonp',
				 jsonPGenericReceiver, callback);
			};

			JsonPTransport.enabled = function() {
				return true;
			};

			JsonPTransport.need_body = true;


			JsonPTransport.prototype.doCleanup = function() {
				var that = this;
				that._is_closing = true;
				if (that._recv_stop) {
					that._recv_stop();
				}
				that.ri = that._recv_stop = null;
				that.send_destructor();
			};


	// Abstract away code that handles global namespace pollution.
	var jsonPReceiverWrapper = function(url, constructReceiver, user_callback) {
		var id = 'a' + utils.random_string(6);
		var url_id = url + '?c=' + escape(WPrefix + '.' + id);

			// Unfortunately it is not possible to abort loading of the
			// script. We need to keep track of frake close frames.
			var aborting = 0;

			// Callback will be called exactly once.
			var callback = function(frame) {
				switch(aborting) {
					case 0:
							// Normal behaviour - delete hook _and_ emit message.
							delete _window[WPrefix][id];
							user_callback(frame);
							break;
							case 1:
							// Fake close frame - emit but don't delete hook.
							user_callback(frame);
							aborting = 2;
							break;
							case 2:
							// Got frame after connection was closed, delete hook, don't emit.
							delete _window[WPrefix][id];
							break;
						}
					};

					var close_script = constructReceiver(url_id, callback);
					_window[WPrefix][id] = close_script;
					var stop = function() {
						if (_window[WPrefix][id]) {
							aborting = 1;
							_window[WPrefix][id](utils.closeFrame(1000, "JSONP user aborted read"));
						}
					};
					return stop;
				};
	//         [*] End of lib/trans-jsonp-polling.js


	//         [*] Including lib/trans-xhr.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var AjaxBasedTransport = function() {};
	 AjaxBasedTransport.prototype = new BufferedSender();

	 AjaxBasedTransport.prototype.run = function(ri, trans_url,
		url_suffix, Receiver, AjaxObject) {
		var that = this;
		that.ri = ri;
		that.trans_url = trans_url;
		that.send_constructor(createAjaxSender(AjaxObject));
		that.poll = new Polling(ri, Receiver,
			trans_url + url_suffix, AjaxObject);
	};

	AjaxBasedTransport.prototype.doCleanup = function() {
		var that = this;
		if (that.poll) {
			that.poll.abort();
			that.poll = null;
		}
	};

	// xhr-streaming
	var XhrStreamingTransport = SockJS['xhr-streaming'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/xhr_streaming', XhrReceiver, utils.XHRCorsObject);
	};

	XhrStreamingTransport.prototype = new AjaxBasedTransport();

	XhrStreamingTransport.enabled = function() {
			// Support for CORS Ajax aka Ajax2? Opera 12 claims CORS but
			// doesn't do streaming.
			return (_window.XMLHttpRequest &&
				'withCredentials' in new XMLHttpRequest() &&
				(!/opera/i.test(navigator.userAgent)));
		};
	XhrStreamingTransport.roundTrips = 2; // preflight, ajax

	// Safari gets confused when a streaming ajax request is started
	// before onload. This causes the load indicator to spin indefinetely.
	XhrStreamingTransport.need_body = true;


	// According to:
	//   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
	//   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/


	// xdr-streaming
	var XdrStreamingTransport = SockJS['xdr-streaming'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/xhr_streaming', XhrReceiver, utils.XDRObject);
	};

	XdrStreamingTransport.prototype = new AjaxBasedTransport();

	XdrStreamingTransport.enabled = function() {
		return !!_window.XDomainRequest;
	};
	XdrStreamingTransport.roundTrips = 2; // preflight, ajax



	// xhr-polling
	var XhrPollingTransport = SockJS['xhr-polling'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/xhr', XhrReceiver, utils.XHRCorsObject);
	};

	XhrPollingTransport.prototype = new AjaxBasedTransport();

	XhrPollingTransport.enabled = XhrStreamingTransport.enabled;
	XhrPollingTransport.roundTrips = 2; // preflight, ajax


	// xdr-polling
	var XdrPollingTransport = SockJS['xdr-polling'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/xhr', XhrReceiver, utils.XDRObject);
	};

	XdrPollingTransport.prototype = new AjaxBasedTransport();

	XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
	XdrPollingTransport.roundTrips = 2; // preflight, ajax
	//         [*] End of lib/trans-xhr.js


	//         [*] Including lib/trans-iframe.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	// Few cool transports do work only for same-origin. In order to make
	// them working cross-domain we shall use iframe, served form the
	// remote domain. New browsers, have capabilities to communicate with
	// cross domain iframe, using postMessage(). In IE it was implemented
	// from IE 8+, but of course, IE got some details wrong:
	//    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
	//    http://stevesouders.com/misc/test-postmessage.php

	var IframeTransport = function() {};

	IframeTransport.prototype.i_constructor = function(ri, trans_url, base_url) {
		var that = this;
		that.ri = ri;
		that.origin = utils.getOrigin(base_url);
		that.base_url = base_url;
		that.trans_url = trans_url;

		var iframe_url = base_url + '/iframe.html';
		if (that.ri._options.devel) {
			iframe_url += '?t=' + (+new Date);
		}
		that.window_id = utils.random_string(8);
		iframe_url += '#' + that.window_id;

		that.iframeObj = utils.createIframe(iframe_url, function(r) {
			that.ri._didClose(1006, "Unable to load an iframe (" + r + ")");
		});

		that.onmessage_cb = utils.bind(that.onmessage, that);
		utils.attachMessage(that.onmessage_cb);
	};

	IframeTransport.prototype.doCleanup = function() {
		var that = this;
		if (that.iframeObj) {
			utils.detachMessage(that.onmessage_cb);
			try {
							// When the iframe is not loaded, IE raises an exception
							// on 'contentWindow'.
							if (that.iframeObj.iframe.contentWindow) {
								that.postMessage('c');
							}
						} catch (x) {}
						that.iframeObj.cleanup();
						that.iframeObj = null;
						that.onmessage_cb = that.iframeObj = null;
					}
				};

				IframeTransport.prototype.onmessage = function(e) {
					var that = this;
					if (e.origin !== that.origin) return;
					var window_id = e.data.slice(0, 8);
					var type = e.data.slice(8, 9);
					var data = e.data.slice(9);

					if (window_id !== that.window_id) return;

					switch(type) {
						case 's':
						that.iframeObj.loaded();
						that.postMessage('s', JSON.stringify([SockJS.version, that.protocol, that.trans_url, that.base_url]));
						break;
						case 't':
						that.ri._didMessage(data);
						break;
					}
				};

				IframeTransport.prototype.postMessage = function(type, data) {
					var that = this;
					that.iframeObj.post(that.window_id + type + (data || ''), that.origin);
				};

				IframeTransport.prototype.doSend = function (message) {
					this.postMessage('m', message);
				};

				IframeTransport.enabled = function() {
			// postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
			// huge delay, or not at all.
			var konqueror = navigator && navigator.userAgent && navigator.userAgent.indexOf('Konqueror') !== -1;
			return ((typeof _window.postMessage === 'function' ||
				typeof _window.postMessage === 'object') && (!konqueror));
		};
	//         [*] End of lib/trans-iframe.js


	//         [*] Including lib/trans-iframe-within.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var curr_window_id;

	 var postMessage = function (type, data) {
		if(parent !== _window) {
			parent.postMessage(curr_window_id + type + (data || ''), '*');
		} else {
			utils.log("Can't postMessage, no parent window.", type, data);
		}
	};

	var FacadeJS = function() {};
	FacadeJS.prototype._didClose = function (code, reason) {
		postMessage('t', utils.closeFrame(code, reason));
	};
	FacadeJS.prototype._didMessage = function (frame) {
		postMessage('t', frame);
	};
	FacadeJS.prototype._doSend = function (data) {
		this._transport.doSend(data);
	};
	FacadeJS.prototype._doCleanup = function () {
		this._transport.doCleanup();
	};

	utils.parent_origin = undefined;

	SockJS.bootstrap_iframe = function() {
		var facade;
		curr_window_id = _document.location.hash.slice(1);
		var onMessage = function(e) {
			if(e.source !== parent) return;
			if(typeof utils.parent_origin === 'undefined')
				utils.parent_origin = e.origin;
			if (e.origin !== utils.parent_origin) return;

			var window_id = e.data.slice(0, 8);
			var type = e.data.slice(8, 9);
			var data = e.data.slice(9);
			if (window_id !== curr_window_id) return;
			switch(type) {
				case 's':
				var p = JSON.parse(data);
				var version = p[0];
				var protocol = p[1];
				var trans_url = p[2];
				var base_url = p[3];
				if (version !== SockJS.version) {
					utils.log("Incompatibile SockJS! Main site uses:" +
						" \"" + version + "\", the iframe:" +
						" \"" + SockJS.version + "\".");
				}
				if (!utils.flatUrl(trans_url) || !utils.flatUrl(base_url)) {
					utils.log("Only basic urls are supported in SockJS");
					return;
				}

				if (!utils.isSameOriginUrl(trans_url) ||
					!utils.isSameOriginUrl(base_url)) {
					utils.log("Can't connect to different domain from within an " +
						"iframe. (" + JSON.stringify([_window.location.href, trans_url, base_url]) +
							")");
				return;
			}
			facade = new FacadeJS();
			facade._transport = new FacadeJS[protocol](facade, trans_url, base_url);
			break;
			case 'm':
			facade._doSend(data);
			break;
			case 'c':
			if (facade)
				facade._doCleanup();
			facade = null;
			break;
		}
	};

			// alert('test ticker');
			// facade = new FacadeJS();
			// facade._transport = new FacadeJS['w-iframe-xhr-polling'](facade, 'http://host.com:9999/ticker/12/basd');

			utils.attachMessage(onMessage);

			// Start
			postMessage('s');
		};
	//         [*] End of lib/trans-iframe-within.js


	//         [*] Including lib/info.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var InfoReceiver = function(base_url, AjaxObject) {
		var that = this;
		utils.delay(function(){that.doXhr(base_url, AjaxObject);});
	};

	InfoReceiver.prototype = new EventEmitter(['finish']);

	InfoReceiver.prototype.doXhr = function(base_url, AjaxObject) {
		var that = this;
		var t0 = (new Date()).getTime();
		var xo = new AjaxObject('GET', base_url + '/info');

		var tref = utils.delay(8000,
		 function(){xo.ontimeout();});

		xo.onfinish = function(status, text) {
			clearTimeout(tref);
			tref = null;
			if (status === 200) {
				var rtt = (new Date()).getTime() - t0;
				var info = JSON.parse(text);
				if (typeof info !== 'object') info = {};
				that.emit('finish', info, rtt);
			} else {
				that.emit('finish');
			}
		};
		xo.ontimeout = function() {
			xo.close();
			that.emit('finish');
		};
	};

	var InfoReceiverIframe = function(base_url) {
		var that = this;
		var go = function() {
			var ifr = new IframeTransport();
			ifr.protocol = 'w-iframe-info-receiver';
			var fun = function(r) {
				if (typeof r === 'string' && r.substr(0,1) === 'm') {
					var d = JSON.parse(r.substr(1));
					var info = d[0], rtt = d[1];
					that.emit('finish', info, rtt);
				} else {
					that.emit('finish');
				}
				ifr.doCleanup();
				ifr = null;
			};
			var mock_ri = {
				_options: {},
				_didClose: fun,
				_didMessage: fun
			};
			ifr.i_constructor(mock_ri, base_url, base_url);
		}
		if(!_document.body) {
			utils.attachEvent('load', go);
		} else {
			go();
		}
	};
	InfoReceiverIframe.prototype = new EventEmitter(['finish']);


	var InfoReceiverFake = function() {
			// It may not be possible to do cross domain AJAX to get the info
			// data, for example for IE7. But we want to run JSONP, so let's
			// fake the response, with rtt=2s (rto=6s).
			var that = this;
			utils.delay(function() {
				that.emit('finish', {}, 2000);
			});
		};
		InfoReceiverFake.prototype = new EventEmitter(['finish']);

		var createInfoReceiver = function(base_url) {
			if (utils.isSameOriginUrl(base_url)) {
					// If, for some reason, we have SockJS locally - there's no
					// need to start up the complex machinery. Just use ajax.
					return new InfoReceiver(base_url, utils.XHRLocalObject);
				}
				switch (utils.isXHRCorsCapable()) {
					case 1:
					// XHRLocalObject -> no_credentials=true
					return new InfoReceiver(base_url, utils.XHRLocalObject);
					case 2:
					return new InfoReceiver(base_url, utils.XDRObject);
					case 3:
					// Opera
					return new InfoReceiverIframe(base_url);
					default:
					// IE 7
					return new InfoReceiverFake();
				};
			};


			var WInfoReceiverIframe = FacadeJS['w-iframe-info-receiver'] = function(ri, _trans_url, base_url) {
				var ir = new InfoReceiver(base_url, utils.XHRLocalObject);
				ir.onfinish = function(info, rtt) {
					ri._didMessage('m'+JSON.stringify([info, rtt]));
					ri._didClose();
				}
			};
			WInfoReceiverIframe.prototype.doCleanup = function() {};
	//         [*] End of lib/info.js


	//         [*] Including lib/trans-iframe-eventsource.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var EventSourceIframeTransport = SockJS['iframe-eventsource'] = function () {
		var that = this;
		that.protocol = 'w-iframe-eventsource';
		that.i_constructor.apply(that, arguments);
	};

	EventSourceIframeTransport.prototype = new IframeTransport();

	EventSourceIframeTransport.enabled = function () {
		return ('EventSource' in _window) && IframeTransport.enabled();
	};

	EventSourceIframeTransport.need_body = true;
	EventSourceIframeTransport.roundTrips = 3; // html, javascript, eventsource


	// w-iframe-eventsource
	var EventSourceTransport = FacadeJS['w-iframe-eventsource'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/eventsource', EventSourceReceiver, utils.XHRLocalObject);
	}
	EventSourceTransport.prototype = new AjaxBasedTransport();
	//         [*] End of lib/trans-iframe-eventsource.js


	//         [*] Including lib/trans-iframe-xhr-polling.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var XhrPollingIframeTransport = SockJS['iframe-xhr-polling'] = function () {
		var that = this;
		that.protocol = 'w-iframe-xhr-polling';
		that.i_constructor.apply(that, arguments);
	};

	XhrPollingIframeTransport.prototype = new IframeTransport();

	XhrPollingIframeTransport.enabled = function () {
		return _window.XMLHttpRequest && IframeTransport.enabled();
	};

	XhrPollingIframeTransport.need_body = true;
	XhrPollingIframeTransport.roundTrips = 3; // html, javascript, xhr


	// w-iframe-xhr-polling
	var XhrPollingITransport = FacadeJS['w-iframe-xhr-polling'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/xhr', XhrReceiver, utils.XHRLocalObject);
	};

	XhrPollingITransport.prototype = new AjaxBasedTransport();
	//         [*] End of lib/trans-iframe-xhr-polling.js


	//         [*] Including lib/trans-iframe-htmlfile.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	// This transport generally works in any browser, but will cause a
	// spinning cursor to appear in any browser other than IE.
	// We may test this transport in all browsers - why not, but in
	// production it should be only run in IE.

	var HtmlFileIframeTransport = SockJS['iframe-htmlfile'] = function () {
		var that = this;
		that.protocol = 'w-iframe-htmlfile';
		that.i_constructor.apply(that, arguments);
	};

	// Inheritance.
	HtmlFileIframeTransport.prototype = new IframeTransport();

	HtmlFileIframeTransport.enabled = function() {
		return IframeTransport.enabled();
	};

	HtmlFileIframeTransport.need_body = true;
	HtmlFileIframeTransport.roundTrips = 3; // html, javascript, htmlfile


	// w-iframe-htmlfile
	var HtmlFileTransport = FacadeJS['w-iframe-htmlfile'] = function(ri, trans_url) {
		this.run(ri, trans_url, '/htmlfile', HtmlfileReceiver, utils.XHRLocalObject);
	};
	HtmlFileTransport.prototype = new AjaxBasedTransport();
	//         [*] End of lib/trans-iframe-htmlfile.js


	//         [*] Including lib/trans-polling.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var Polling = function(ri, Receiver, recv_url, AjaxObject) {
		var that = this;
		that.ri = ri;
		that.Receiver = Receiver;
		that.recv_url = recv_url;
		that.AjaxObject = AjaxObject;
		that._scheduleRecv();
	};

	Polling.prototype._scheduleRecv = function() {
		var that = this;
		var poll = that.poll = new that.Receiver(that.recv_url, that.AjaxObject);
		var msg_counter = 0;
		poll.onmessage = function(e) {
			msg_counter += 1;
			that.ri._didMessage(e.data);
		};
		poll.onclose = function(e) {
			that.poll = poll = poll.onmessage = poll.onclose = null;
			if (!that.poll_is_closing) {
				if (e.reason === 'permanent') {
					that.ri._didClose(1006, 'Polling error (' + e.reason + ')');
				} else {
					that._scheduleRecv();
				}
			}
		};
	};

	Polling.prototype.abort = function() {
		var that = this;
		that.poll_is_closing = true;
		if (that.poll) {
			that.poll.abort();
		}
	};
	//         [*] End of lib/trans-polling.js


	//         [*] Including lib/trans-receiver-eventsource.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var EventSourceReceiver = function(url) {
		var that = this;
		var es = new EventSource(url);
		es.onmessage = function(e) {
			that.dispatchEvent(new SimpleEvent('message',
			 {'data': unescape(e.data)}));
		};
		that.es_close = es.onerror = function(e, abort_reason) {
					// ES on reconnection has readyState = 0 or 1.
					// on network error it's CLOSED = 2
					var reason = abort_reason ? 'user' :
					(es.readyState !== 2 ? 'network' : 'permanent');
					that.es_close = es.onmessage = es.onerror = null;
					// EventSource reconnects automatically.
					es.close();
					es = null;
					// Safari and chrome < 15 crash if we close window before
					// waiting for ES cleanup. See:
					//   https://code.google.com/p/chromium/issues/detail?id=89155
					utils.delay(200, function() {
						that.dispatchEvent(new SimpleEvent('close', {reason: reason}));
					});
				};
			};

			EventSourceReceiver.prototype = new REventTarget();

			EventSourceReceiver.prototype.abort = function() {
				var that = this;
				if (that.es_close) {
					that.es_close({}, true);
				}
			};
	//         [*] End of lib/trans-receiver-eventsource.js


	//         [*] Including lib/trans-receiver-htmlfile.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var _is_ie_htmlfile_capable;
	 var isIeHtmlfileCapable = function() {
		if (_is_ie_htmlfile_capable === undefined) {
			if ('ActiveXObject' in _window) {
				try {
					_is_ie_htmlfile_capable = !!new ActiveXObject('htmlfile');
				} catch (x) {}
			} else {
				_is_ie_htmlfile_capable = false;
			}
		}
		return _is_ie_htmlfile_capable;
	};


	var HtmlfileReceiver = function(url) {
		var that = this;
		utils.polluteGlobalNamespace();

		that.id = 'a' + utils.random_string(6, 26);
		url += ((url.indexOf('?') === -1) ? '?' : '&') +
		'c=' + escape(WPrefix + '.' + that.id);

		var constructor = isIeHtmlfileCapable() ?
		utils.createHtmlfile : utils.createIframe;

		var iframeObj;
		_window[WPrefix][that.id] = {
			start: function () {
				iframeObj.loaded();
			},
			message: function (data) {
				that.dispatchEvent(new SimpleEvent('message', {'data': data}));
			},
			stop: function () {
				that.iframe_close({}, 'network');
			}
		};
		that.iframe_close = function(e, abort_reason) {
			iframeObj.cleanup();
			that.iframe_close = iframeObj = null;
			delete _window[WPrefix][that.id];
			that.dispatchEvent(new SimpleEvent('close', {reason: abort_reason}));
		};
		iframeObj = constructor(url, function(e) {
			that.iframe_close({}, 'permanent');
		});
	};

	HtmlfileReceiver.prototype = new REventTarget();

	HtmlfileReceiver.prototype.abort = function() {
		var that = this;
		if (that.iframe_close) {
			that.iframe_close({}, 'user');
		}
	};
	//         [*] End of lib/trans-receiver-htmlfile.js


	//         [*] Including lib/trans-receiver-xhr.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	 var XhrReceiver = function(url, AjaxObject) {
		var that = this;
		var buf_pos = 0;

		that.xo = new AjaxObject('POST', url, null);
		that.xo.onchunk = function(status, text) {
			if (status !== 200) return;
			while (1) {
				var buf = text.slice(buf_pos);
				var p = buf.indexOf('\n');
				if (p === -1) break;
				buf_pos += p+1;
				var msg = buf.slice(0, p);
				that.dispatchEvent(new SimpleEvent('message', {data: msg}));
			}
		};
		that.xo.onfinish = function(status, text) {
			that.xo.onchunk(status, text);
			that.xo = null;
			var reason = status === 200 ? 'network' : 'permanent';
			that.dispatchEvent(new SimpleEvent('close', {reason: reason}));
		}
	};

	XhrReceiver.prototype = new REventTarget();

	XhrReceiver.prototype.abort = function() {
		var that = this;
		if (that.xo) {
			that.xo.close();
			that.dispatchEvent(new SimpleEvent('close', {reason: 'user'}));
			that.xo = null;
		}
	};
	//         [*] End of lib/trans-receiver-xhr.js


	//         [*] Including lib/test-hooks.js
	/*
	 * ***** BEGIN LICENSE BLOCK *****
	 * Copyright (c) 2011-2012 VMware, Inc.
	 *
	 * For the license see COPYING.
	 * ***** END LICENSE BLOCK *****
	 */

	// For testing
	SockJS.getUtils = function(){
		return utils;
	};

	SockJS.getIframeTransport = function(){
		return IframeTransport;
	};
	//         [*] End of lib/test-hooks.js

	return SockJS;
	})();
	if ('_sockjs_onload' in window) setTimeout(_sockjs_onload, 1);

	// AMD compliance
	if (typeof define === 'function' && define.amd) {
		define('sockjs', [], function(){return SockJS;});
	}
	//     [*] End of lib/index.js

	// [*] End of lib/all.js


},{}],23:[function(require,module,exports){
	var process=require("__browserify_process");// Generated by LiveScript 1.2.0
	(function(){
		var LBase, LArray, slice$ = [].slice;
		LBase = require('./base');
		LArray = (function(superclass){
			var prototype = extend$((import$(LArray, superclass).displayName = 'LArray', LArray), superclass).prototype, constructor = LArray;
			function LArray(){
				var vals, i$, len$, val, this$ = this;
				vals = slice$.call(arguments);
				LArray.superclass.call(this);
				this._sb = new RArray;
				this._db = {};
				this._rack = hat.rack();
				this.length = new LValue(0);
				this._hist = {};
				this._historyMap = {};
				this._updateBuffer = {};
				this._sbKeys = {};
				this._dbKeys = {};
				this._sb.on('update', function(rawUpdate){
					var update, sbKey, key;
					update = {};
					for (sbKey in rawUpdate) {
						key = rawUpdate[sbKey];
						update[key] = this$._db[key];
					}
					for (sbKey in rawUpdate) {
						key = rawUpdate[sbKey];
						if (key != null) {
							this$._sbKeys[key] = sbKey;
							this$._dbKeys[sbKey] = key;
						}
					}
					this$.emit('update', update);
					for (sbKey in rawUpdate) {
						key = rawUpdate[sbKey];
						if (key != null && update[key] != null) {
							if (this$._updateBuffer[key] != null) {
								this$.emit('update', this$._sb.indexOfKey(sbKey), update[key], key, sbKey);
							} else {
								this$.length.set(this$._sb.length);
								this$.emit('insert', this$._sb.indexOfKey(sbKey), update[key], key, sbKey);
							}
							this$._updateBuffer[key] = update[key];
						} else {
							key = this$._dbKeys[sbKey];
							if (this$._updateBuffer[key] != null || this$._db[key] != null) {
								this$.length.set(this$._sb.length);
								this$.emit('remove', this$._sb.indexOfKey(sbKey), this$._updateBuffer[key] || this$._db[key], key, sbKey);
							} else {}
						}
					}
					for (sbKey in rawUpdate) {
						key = rawUpdate[sbKey];
						if (key == null) {
							key = this$._dbKeys[sbKey];
							delete this$._dbKeys[sbKey];
							delete this$._sbKeys[key];
							delete this$._updateBuffer[key];
							delete this$._hist[key];
							process.nextTick(fn$.bind(this$, key));
						}
					}
					function fn$(key){
						var ref$, ref1$;
						return ref1$ = (ref$ = this._db)[key], delete ref$[key], ref1$;
					}
				});
	this._sb.on('_update', function(update){
		return this$.localUpdate(['a', update]);
	});
	for (i$ = 0, len$ = vals.length; i$ < len$; ++i$) {
		val = vals[i$];
		this.push(val);
	}
	}
	prototype.creationArgs = function(){
		return [];
	};
	LArray.mapCreationArgs = function(fn, args){
		return [];
	};
	prototype._genId = function(){
		return this._rack();
	};
	prototype._register = function(val, key, update){
		var this$ = this;
		key == null && (key = this._genId());
		update == null && (update = true);
		if (update) {
			this.localUpdate(['d', key, val.constructor.name.toLowerCase(), val.creationArgs()]);
		}
		this._db[key] = val;
		val.on('_update', function(it){
			if (this$._db[key] === val) {
				return this$.localUpdate(['c', key, it]);
			}
		});
		return key;
	};
	prototype._setIndex = function(index, key){
		return this._sb.set(this._sb.keys[index], key);
	};
	prototype._unset = function(key){
		return this._sb.unset(this._sbKeys[key]);
	};
	prototype.push = function(val){
		var key;
		key = this._register(val);
		this._sb.push(key);
		return this;
	};
	prototype.unshift = function(val){
		var key;
		key = this._register(val);
		this._sb.unshift(key);
		return this;
	};
	prototype.get = function(index){
		return this._db[this._sb.get(this._sb.keys[index])];
	};
	prototype.pop = function(){
		var key;
		key = this._sb.pop();
		return this._db[key];
	};
	prototype.shift = function(){
		var key;
		key = this._sb.shift();
		return this._db[key];
	};
	prototype.remove = function(index){
		this._sb.unset(this._sb.keys[index]);
		return this;
	};
	prototype.forEach = function(fn){
		var i$, ref$, len$, i;
		for (i$ = 0, len$ = (ref$ = (fn$.call(this))).length; i$ < len$; ++i$) {
			i = ref$[i$];
			fn.call(this, this.get(i), i);
		}
		return this;
		function fn$(){
			var i$, to$, results$ = [];
			for (i$ = 0, to$ = this.length.get(); i$ < to$; ++i$) {
				results$.push(i$);
			}
			return results$;
		}
	};
	prototype.each = function(fn){
		return this.forEach(fn);
	};
	LArray.mapper = function(fn, subArgs){
		var db, dbKeys;
		subArgs == null && (subArgs = []);
		db = {};
		dbKeys = {};
		return ss.json(through(function(update){
			var data, childUpdate, ref$, mapper, sbKey, key, this$ = this;
			if (Array.isArray(update)) {
				data = update[0];
				switch (data[0]) {
					case 'c':
					childUpdate = data[2].slice();
					childUpdate.args = [data[1]];
					childUpdate.custom = update;
					if (Array.isArray(update.args)) {
						childUpdate.args = childUpdate.args.concat(update.args);
					}
					return (ref$ = db[data[1]]) != null ? ref$.write(JSON.stringify(childUpdate)) : void 8;
					case 'd':
					mapper = (ref$ = LBase.types[data[2]]).mapper.apply(ref$, [fn].concat(slice$.call(subArgs)));
					mapper.on('data', function(update){
						return this$.queue([['c', data[1], update], update.custom[1][1], update.custom[1][2]]);
					});
					db[data[1]] = mapper;
					return this.queue([['d', data[1], data[2], LBase.types[data[2]].mapCreationArgs(fn, data[3], data[1])], update[1], update[2]]);
					default:
					for (sbKey in data) {
						key = data[sbKey];
						if (key != null) {
							dbKeys[sbKey] = key;
						} else {
							delete db[dbKeys[sbKey]];
							delete dbKeys[sbKey];
						}
					}
					return this.queue(update);
				}
			} else {
				return this.queue(update);
			}
		}));
	};
	prototype.history = function(sources){
		var hist, key, ref$, update, val, this$ = this;
		hist = this._sb.history(sources).map(function(update){
			return this$._historyMap[update[2] + "-" + update[1]];
		});
		for (key in ref$ = this._hist) {
			update = ref$[key];
			if (!~hist.indexOf(update) && filter(update, sources)) {
				hist.push(update);
			}
		}
		for (key in ref$ = this._db) {
			val = ref$[key];
			hist = hist.concat(val.history(sources).map(fn$));
		}
		return hist.filter(Boolean).sort(order);
		function fn$(update){
			return this$._historyMap[key + "-" + update[2] + "-" + update[1]];
		}
	};
	prototype.applyUpdate = function(update){
		var data, ref$;
		data = update[0];
		switch (data[0]) {
			case 'a':
			this._historyMap[data[1][2] + "-" + data[1][1]] = update;
			return this._sb.applyUpdate(data[1]);
			case 'd':
			this._hist[data[1]] = update;
			if (this._db[data[1]] == null) {
				this._register(LBase.create.apply(LBase, [data[2]].concat(slice$.call(data[3]))), data[1], false);
			}
			this.emit('_register', data[1], this._db[data[1]]);
			return true;
			case 'c':
			this._historyMap[data[1] + "-" + data[2][2] + "-" + data[2][1]] = update;
			if (update[2] !== this.id) {
				if ((ref$ = this._db[data[1]]) != null) {
					ref$._update(data[2]);
				}
			}
			return true;
		}
	};
	return LArray;
	}(LBase));
	LBase.Array = LArray;
	LBase.register(LArray);
	module.exports = LArray;
	function extend$(sub, sup){
		function fun(){} fun.prototype = (sub.superclass = sup).prototype;
		(sub.prototype = new fun).constructor = sub;
		if (typeof sup.extended == 'function') sup.extended(sub);
		return sub;
	}
	function import$(obj, src){
		var own = {}.hasOwnProperty;
		for (var key in src) if (own.call(src, key)) obj[key] = src[key];
			return obj;
	}
	}).call(this);

},{"./base":24,"__browserify_process":17}],24:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var Scuttlebutt, utils, LBase, slice$ = [].slice;
		Scuttlebutt = require('scuttlebutt');
		utils = require('./utils');
		LBase = (function(superclass){
			var prototype = extend$((import$(LBase, superclass).displayName = 'LBase', LBase), superclass).prototype, constructor = LBase;
			LBase.types = {};
			LBase.register = function(type){
				return this.types[type.name.toLowerCase()] = type;
			};
			LBase.create = function(name){
				var args, ref$;
				args = slice$.call(arguments, 1);
				return typeof (ref$ = this.types)[name] === 'function' ? (function(func, args, ctor) {
					ctor.prototype = func.prototype;
					var child = new ctor, result = func.apply(child, args), t;
					return (t = typeof result)  == "object" || t == "function" ? result || child : child;
				})(ref$[name], args, function(){}) : void 8;
			};
			prototype.pipe = function(dest){
				this.createReadStream().pipe(dest.createWriteStream());
				return dest;
			};
			prototype.map = function(fn){
				var args, newLive, ref$;
				args = slice$.call(arguments, 1);
				newLive = (function(func, args, ctor) {
					ctor.prototype = func.prototype;
					var child = new ctor, result = func.apply(child, args), t;
					return (t = typeof result)  == "object" || t == "function" ? result || child : child;
				})(this.constructor, this.constructor.mapCreationArgs(fn, this.creationArgs()), function(){});
				this.createReadStream().pipe((ref$ = this.constructor).mapper.apply(ref$, [fn].concat(slice$.call(args)))).pipe(newLive.createWriteStream());
				return newLive;
			};
			prototype.creationArgs = utils.dutyOfSubclass('creationArgs');
			prototype.applyUpdate = utils.dutyOfSubclass('applyUpdate');
			prototype.history = utils.dutyOfSubclass('history');
			function LBase(){
				LBase.superclass.apply(this, arguments);
			}
			return LBase;
		}(Scuttlebutt));
	module.exports = LBase;
	function extend$(sub, sup){
		function fun(){} fun.prototype = (sub.superclass = sup).prototype;
		(sub.prototype = new fun).constructor = sub;
		if (typeof sup.extended == 'function') sup.extended(sub);
		return sub;
	}
	function import$(obj, src){
		var own = {}.hasOwnProperty;
		for (var key in src) if (own.call(src, key)) obj[key] = src[key];
			return obj;
	}
	}).call(this);

},{"./utils":28,"scuttlebutt":40}],25:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		module.exports = require('./base');
		require('./array');
		require('./map');
		require('./map-view');
		require('./value');
	}).call(this);

},{"./array":23,"./base":24,"./map":27,"./map-view":26,"./value":29}],26:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var LBase, LMapView;
		LBase = require('./base');
		LMapView = (function(superclass){
			var prototype = extend$((import$(LMapView, superclass).displayName = 'LMapView', LMapView), superclass).prototype, constructor = LMapView;
			function LMapView(parent, opts){
				var this$ = this;
				this.parent = parent;
				this.opts = opts != null
				? opts
				: {};
				LMapView.superclass.call(this);
				this.parent.on('_update', function(update){
					var data;
					data = update[0];
					switch (data[0]) {
						case 'c':
						if (this$._checkPrefix(data[1])) {
							return this$.applyUpdate([['c', this$._unprefix(data[1]), data[2]], update[1], update[2]]);
						}
						break;
						case 'd':
						if (this$._checkPrefix(data[1])) {
							return this$.applyUpdate([['d', this$._unprefix(data[1]), data[2], data[3]], update[1], update[2]]);
						}
					}
				});
			}
			prototype._prefix = function(key){
				if (this.opts.prefix != null) {
					key = this.opts.prefix + ":" + key;
				}
				return key;
			};
			prototype._unprefix = function(key){
				if (this.opts.prefix != null) {
					key = key.substring(this.opts.prefix.length + 1);
				}
				return key;
			};
			prototype._checkPrefix = function(key){
				if (this.opts.prefix == null) {
					return true;
				}
				return key.substring(0, this.opts.prefix.length) === this.opts.prefix;
			};
			prototype.get = function(key){
				return this.parent.get(this._prefix(key));
			};
			prototype.set = function(key, val){
				this.parent.set(this._prefix(key), val);
				return this;
			};
			prototype.applyUpdate = function(update){
				var data;
				data = update[0];
				switch (data[0]) {
					case 'c':
					return this.parent.applyUpdate([['c', this._prefix(data[1]), data[2]], update[1], update[2]]);
					case 'd':
					return this.parent.applyUpdate([['d', this._prefix(data[1]), data[2], data[3]], update[1], update[2]]);
					default:
					return false;
				}
			};
			prototype.history = function(sources){
				var this$ = this;
				return this.parent.history().filter(function(update){
					var data;
					data = update[0];
					switch (data[0]) {
						case 'c':
						case 'd':
						return this$._checkPrefix(data[1]);
						default:
						return false;
					}
				});
			};
			return LMapView;
		}(LBase));
	LBase.MapView = LMapView;
	module.exports = LMapView;
	function extend$(sub, sup){
		function fun(){} fun.prototype = (sub.superclass = sup).prototype;
		(sub.prototype = new fun).constructor = sub;
		if (typeof sup.extended == 'function') sup.extended(sub);
		return sub;
	}
	function import$(obj, src){
		var own = {}.hasOwnProperty;
		for (var key in src) if (own.call(src, key)) obj[key] = src[key];
			return obj;
	}
	}).call(this);

},{"./base":24}],27:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var filter, LBase, utils, LMap, slice$ = [].slice;
		filter = require('scuttlebutt/util').filter;
		LBase = require('./base');
		utils = require('./utils');
		LMap = (function(superclass){
			var prototype = extend$((import$(LMap, superclass).displayName = 'LMap', LMap), superclass).prototype, constructor = LMap;
			function LMap(opts){
				this.opts = opts != null
				? opts
				: {};
				LMap.superclass.call(this);
				this.db = {};
				this._hist = {};
				this._historyMap = {};
			}
			prototype._prefix = function(key){
				if (this.opts.prefix != null) {
					key = this.opts.prefix + ":" + key;
				}
				return key;
			};
			prototype._unprefix = function(key){
				if (this.opts.prefix != null) {
					key = key.substring(this.opts.prefix.length + 1);
				}
				return key;
			};
			prototype._checkPrefix = function(key){
				if (this.opts.prefix == null) {
					return true;
				}
				return key.substring(0, this.opts.prefix.length) === this.opts.prefix;
			};
			prototype._register = function(key, model, update){
				var this$ = this;
				update == null && (update = true);
				this.db[key] = model;
				model.on('_update', function(it){
					if (this$.db[key] === model) {
						return this$.localUpdate(['c', key, it]);
					}
				});
				if (update) {
					return this.localUpdate(['d', key, model.constructor.name.toLowerCase(), model.creationArgs()]);
				}
			};
			prototype.set = function(key, model){
				key = this._prefix(key);
				return this._register(key, model);
			};
			prototype.get = function(key){
				return this.db[this._prefix(key)];
			};
			prototype.applyUpdate = function(update){
				var data, ref$;
				data = update[0];
				switch (data[0]) {
					case 'c':
					if (!this._checkPrefix(data[1])) {
						return false;
					}
					this._historyMap[data[1] + "-" + data[2][2] + "-" + data[2][1]] = update;
					if ((ref$ = this.db[data[1]]) != null) {
						ref$._update(data[2]);
					}
					return true;
					case 'd':
					if (!this._checkPrefix(data[1])) {
						return false;
					}
					this._hist[data[1]] = update;
					if (data[2] === null) {
						delete this.db[data[1]];
					} else {
						if (this.db[data[1]] == null) {
							this._register(data[1], LBase.create.apply(LBase, [data[2]].concat(slice$.call(data[3]))), false);
						}
					}
					return true;
					default:
					return false;
				}
			};
			prototype.history = function(sources){
				var hist, key, ref$, update, val, this$ = this;
				hist = [];
				for (key in ref$ = this._hist) {
					update = ref$[key];
					if (!~hist.indexOf(update) && filter(update, sources)) {
						hist.push(update);
					}
				}
				for (key in ref$ = this._db) {
					val = ref$[key];
					hist = hist.concat(val.history(sources).map(fn$));
				}
				return hist.filter(Boolean).sort(utils.order);
				function fn$(update){
					return this$._historyMap[key + "-" + update[2] + "-" + update[1]];
				}
			};
			return LMap;
		}(LBase));
	LBase.Map = LMap;
	LBase.register(LMap);
	module.exports = LMap;
	function extend$(sub, sup){
		function fun(){} fun.prototype = (sub.superclass = sup).prototype;
		(sub.prototype = new fun).constructor = sub;
		if (typeof sup.extended == 'function') sup.extended(sub);
		return sub;
	}
	function import$(obj, src){
		var own = {}.hasOwnProperty;
		for (var key in src) if (own.call(src, key)) obj[key] = src[key];
			return obj;
	}
	}).call(this);

	},{"./base":24,"./utils":28,"scuttlebutt/util":44}],28:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		exports.order = function(a, b){
			return between.strord(a[1], b[1]) || between.strord(a[2], b[2]);
		};
		exports.dutyOfSubclass = function(name){
			return function(){
				throw new Error(this.constructor.name + "." + name + " must be implemented");
			};
		};
	}).call(this);

},{}],29:[function(require,module,exports){
	// Generated by LiveScript 1.2.0
	(function(){
		var LBase, RValue, LValue, slice$ = [].slice;
		LBase = require('./base');
		RValue = require('r-array');
		LValue = (function(superclass){
			var prototype = extend$((import$(LValue, superclass).displayName = 'LValue', LValue), superclass).prototype, constructor = LValue;
			function LValue(defaultVal, force){
				var this$ = this;
				force == null && (force = false);
				LValue.superclass.call(this);
				this._sb = new RValue;
				this._sb.on('update', function(data){
					return this$.emit('update', data);
				});
				this._sb.on('_update', function(update){
					return this$.emit('_update', update);
				});
				if (defaultVal != null) {
					this.set(defaultVal);
				}
			}
			prototype.creationArgs = function(){
				return [this.get()];
			};
			LValue.mapCreationArgs = function(fn, args){
				var subArgs;
				subArgs = slice$.call(arguments, 2);
				return [fn.apply(null, [args[0]].concat(slice$.call(subArgs)))];
			};
			prototype.set = function(newValue){
				if (this.get() !== newValue) {
					this._sb.set(newValue);
				}
				return this;
			};
			prototype.get = function(){
				return this._sb.get();
			};
			LValue.mapper = function(fn){
				return ss.json(through(function(update){
					var args, newUpdate;
					return this.queue(Array.isArray(update) ? (args = [update[0]], Array.isArray(update.args) && (args = args.concat(update.args)), newUpdate = [fn.apply(null, args), update[1], update[2]], newUpdate.custom = update.custom, newUpdate) : update);
				}));
			};
			prototype.history = function(sources){
				return this._sb.history(sources);
			};
			prototype.applyUpdate = function(update){
				return this._sb.applyUpdate(update);
			};
			return LValue;
		}(LBase));
	LBase.Value = LValue;
	LBase.register(LValue);
	module.exports = LValue;
	function extend$(sub, sup){
		function fun(){} fun.prototype = (sub.superclass = sup).prototype;
		(sub.prototype = new fun).constructor = sub;
		if (typeof sup.extended == 'function') sup.extended(sub);
		return sub;
	}
	function import$(obj, src){
		var own = {}.hasOwnProperty;
		for (var key in src) if (own.call(src, key)) obj[key] = src[key];
			return obj;
	}
	}).call(this);

},{"./base":24,"r-array":33}],30:[function(require,module,exports){
	var process=require("__browserify_process");// Generated by LiveScript 1.2.0
	(function(){
		var font, util, tty, levels, colors, Logger, exports, slice$ = [].slice;
		font = require('ansi-font');
		util = require('util');
		tty = require('tty');
		levels = ['debug', 'info', 'warn', 'error'];
		colors = ['green', 'green', 'yellow', 'red'];
		Logger = (function(){
			Logger.displayName = 'Logger';
			var prototype = Logger.prototype, constructor = Logger;
			function Logger(opts){
				var ref$;
				this.opts = opts != null
				? opts
				: {};
				(ref$ = this.opts).level == null && (ref$.level = 'debug');
				(ref$ = this.opts).errout == null && (ref$.errout = process.stderr);
				(ref$ = this.opts).out == null && (ref$.out = process.stdout);
				(ref$ = this.opts).colors == null && (ref$.colors = tty.isatty(this.opts.out) && tty.isatty(this.opts.errout));
				if (typeof this.opts.level === 'string') {
					this.opts.level = levels.indexOf(this.opts.level);
				}
			}
			prototype.checkLevel = function(it){
				var ok;
				ok = typeof it === 'string'
				? levels.indexOf(it) !== -1
				: typeof it === 'number' ? levels[it] != null : false;
				if (!ok) {
					throw new Error("Invalid level: " + it);
				}
			};
			prototype.logger = function(){
				return (function(func, args, ctor) {
					ctor.prototype = func.prototype;
					var child = new ctor, result = func.apply(child, args), t;
					return (t = typeof result)  == "object" || t == "function" ? result || child : child;
				})(Logger, arguments, function(){});
			};
			prototype.output = function(level, text){
				this.checkLevel(level);
				if (level === 2 || level === 3) {
					return this.opts.errout.write(text + "\n");
				} else {
					return this.opts.out.write(text + "\n");
				}
			};
			prototype.fmt = function(level){
				var parts;
				parts = slice$.call(arguments, 1);
				this.checkLevel(level);
				return font[colors[level]]("[" + levels[level] + "]") + " " + util.format.apply(util, parts);
			};
			prototype.log = function(level){
				var parts;
				parts = slice$.call(arguments, 1);
				this.checkLevel(level);
				if (typeof level === 'string') {
					level = levels.indexOf(level);
				}
				if (level >= this.opts.level) {
					this.output(level, this.fmt.apply(this, [level].concat(slice$.call(parts))));
				}
				return this;
			};
			prototype.debug = function(){
				var a;
				a = slice$.call(arguments);
				return this.log.apply(this, ['debug'].concat(slice$.call(a)));
			};
			prototype.info = function(){
				var a;
				a = slice$.call(arguments);
				return this.log.apply(this, ['info'].concat(slice$.call(a)));
			};
			prototype.warn = function(){
				var a;
				a = slice$.call(arguments);
				return this.log.apply(this, ['warn'].concat(slice$.call(a)));
			};
			prototype.error = function(){
				var a;
				a = slice$.call(arguments);
				return this.log.apply(this, ['error'].concat(slice$.call(a)));
			};
			return Logger;
		}());
	exports = module.exports = new Logger;
	}).call(this);

},{"__browserify_process":17,"ansi-font":31,"tty":12,"util":13}],31:[function(require,module,exports){
	/* vim:set ts=2 sw=2 sts=2 expandtab */
	/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
	forin: false */
	/*global define: true */

	(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

		"use strict";

		var ESC = '\u001b['

		// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
		var SGR_STYLES = {
			bold:           [ 1,  22 ],
			italic:         [ 3,  23 ],
			underline:      [ 4,  24 ],
			blink:          [ 5,  25 ],

			inverse:        [ 7,  27 ],

			frame:         [ 51, 54 ],
			encircle:      [ 52, 54 ],

			overline:       [ 53, 55 ],
			strikethrough:  [ 53, 55 ]
		}
		var SGR_COLORS = {}
		var SGR_BACKROUNDS = {}
		var COLORS = [
		'black',
		'red',
		'green',
		'yellow',
		'blue',
		'magenta',
		'cyan',
		'white'
		]

		COLORS.forEach(function(color, index) {
			SGR_COLORS[color] = [ 30 + index, 39 ]
			SGR_BACKROUNDS[color] = [ 40 + index, 49 ]
		})

		function sgr(options, id, message) {
			var params = options[id]
			if (params) message = ESC + params[0] + 'm' + message + ESC + params[1] + 'm'
				return message
		}

		exports.style = sgr.bind(null, SGR_STYLES)
		exports.color = sgr.bind(null, SGR_COLORS)
		exports.background = sgr.bind(null, SGR_BACKROUNDS)

		Object.keys(SGR_STYLES).forEach(function(name) {
			exports[name] = exports.style.bind(null, name)
		})
		Object.keys(SGR_COLORS).forEach(function(name) {
			exports[name] = exports.color.bind(null, name)
			exports['bg' + name] = exports.background.bind(null, name)
		})

		var index = 0
		while(index++ < 256) {
			SGR_COLORS[index] = ['38;5;' + index, 39]
			SGR_BACKROUNDS[index] = ['48;5;' + index, 39]
		}

	});

},{}],32:[function(require,module,exports){

	function inject (chars) {

		chars = chars ||
		'!0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~'

		chars = chars.split('').sort().join('')

		var exports = between

		exports.between   = between

		exports.randstr   = randstr
		exports.between   = between
		exports.strord    = strord

		exports.lo        = chars[0]
		exports.hi        = chars[chars.length - 1]

		exports.inject    = inject

		function randstr(l) {
			var str = ''
			while(l--) 
				str += chars[
			Math.floor(
				Math.random() * chars.length 
				)
			]
			return str
		}

	/*
		SOME EXAMPLE STRINGS, IN ORDER
	 
		0
		00001
		0001
		001
		001001
		00101
		0011
		0011001
		001100101
		00110011
		001101
		00111
		01  

		if you never make a string that ends in the lowest char,
		then it is always possible to make a string between two strings.
		this is like how decimals never end in 0. 

		example:

		between('A', 'AB') 

		... 'AA' will sort between 'A' and 'AB' but then it is impossible
		to make a string inbetween 'A' and 'AA'.
		instead, return 'AAB', then there will be space.

		*/

		function between (a, b) {

			var s = '', i = 0

			while (true) {

				var _a = chars.indexOf(a[i])
				var _b = chars.indexOf(b[i])

				if(_a == -1) _a = 0
					if(_b == -1) _b = chars.length - 1

						i++

					var c = chars[
					_a + 1 < _b 
					? Math.round((_a+_b)/2)
					: _a
					]

					s += c

					if(a < s && s < b && c != exports.lo)
						return s;
				}
			}

			function strord (a, b) {
				return (
					a == b ?  0
					: a <  b ? -1
					:           1
					)
			}

			between.strord

			return between
		}


		module.exports = inject(null)

},{}],33:[function(require,module,exports){

	var between     = require('between')
	var Scuttlebutt = require('scuttlebutt')
	var inherits    = require('util').inherits
	var filter      = require('scuttlebutt/util').filter

	inherits(RArray, Scuttlebutt)

	module.exports = RArray

	function fuzz () {
		return Math.random().toString().substring(2, 5)
	}

	var DOEMIT = true, CHANGE = {}

	function order (a, b) {
		//timestamp, then source
		return between.strord(a[1], b[1]) || between.strord(a[2], b[2])
	}

	function RArray () {
		Scuttlebutt.call(this)
		this.keys = []
		this.store = {}
		this._hist = {}
		this.length = 0
		if(arguments.length) {
			var self = this
			;[].forEach.call(arguments, function (e) {
				self.push(e)
			})
		}
	}

	var A = RArray.prototype

	A.last = function () {
		return this.keys[this.keys.length - 1]
	}

	A.first = function () {
		return this.keys[0]
	}

	A.insert = function (before, val, after) {  
		var key = between(before || between.lo, after || between.hi) + fuzz()
		this.set(key, val)
		return key
	}

	A.push = function (val) {
		var key = this.insert(this.last(), val)
	}

	A.unshift = function (val) {
		var key = this.insert(null, val, this.first())
	}

	A.indexOf = function (val) {
		for(var i in this.keys) {
			var key = this.keys[i]
			if(v === this.get(key)) return i
		}
	return null
	}

	A.indexOfKey = function (key) {
		return this.keys.indexOf(key)
	}

	A.toJSON = function () {
		var store = this.store
		var self = this
		return this.keys.map(function (key) {
			return self.get(key)
		})
	}

	A.set = function (key, val) {
		if('string' == typeof key) {
			if(val === null) return this.unset(key)
			if(null == this.store[key]) this.length ++
				this.store[key] = val
			if(!~this.keys.indexOf(key)) {
				this.keys.push(key)
				this.keys.sort()
			}
			CHANGE[key] = val
			DOEMIT && this._emit()
		}
	}

	A.get = function (key) {
		return this.store[key]
	}

	A.unset = function (key) {
		if('string' == typeof key) {
			if(null != this.store[key]) this.length --
				delete this.store[key]
			var i = this.keys.indexOf(key)
			if(!~i) return
				this.keys.splice(i, 1)    

			CHANGE[key] = null
			DOEMIT && this._emit()
		}
	}

	A.pop = function () {
		var l = this.last()
		var val = this.store[l]
		this.unset(l)
		return val
	}

	A.shift = function () {
		var f = this.first()
		var val = this.store[f]
		this.unset(f)
		return val
	}

	A._emit = function () {
		if(!DOEMIT) return
			this.localUpdate(CHANGE)
		CHANGE = {}
	}

	A.splice = function (i, d /*,...args*/) {
		var args = [].slice.call(arguments, 2)
		var j = 0, l = args.length

		DOEMIT = false

		if(d + i > this.keys.length)
			d = this.keys.length - i

		while(j < d) {
			if(j < l)
				this.set(this.keys[i+j], args[j]), j++
			else
				this.unset(this.keys[i+j]), d--
		}

		while(j < l)
			this.insert(this.keys[i+j-1], args[j], this.keys[i+j]), j++

		DOEMIT = true
		this._emit()
	}

	A.applyUpdate = function (update) {
		DOEMIT = false
		var change = update[0], old
		var apply = {}, ch = {}
		var old = {}
		for(var key in change) {
			if(!this._hist[key] || order(update, this._hist[key]) > 0)
				apply[key] = change[key]
		}
	//allow the user to see what the change is going to be.
	this.emit('preupdate', apply) 

	//apply the change...
	for(var key in apply) {
		var o = this._hist[key]
		o && (old[o[1]+':'+o[2]] = o) //ts:source
		this._hist[key] = update
		this.set(key, apply[key])
	}

	//check if old elements need to be removed.
	//may also want to keep old updates hanging around 
	//so the user can see recent history...
	for(var id in old) {
		var o = old[id][0], rm = true
		for(var key in o) {
			if(this._hist[key] === old[id]) rm = false
		}
	if(rm)
		this.emit('_remove', old[id])
	}

	DOEMIT = true
	CHANGE = {}
	this.emit('update', apply)
	return true
	}


	A.history = function (sources) {
	var h = []
	for (var key in this._hist) {
		var update = this._hist[key]
		if(!~h.indexOf(update) && filter(update, sources))
			h.push(update)
	}
	return h.sort(order)
	}

	A.forEach = function (fun) {
	return this.toJSON().forEach(fun)
	}

	A.filter = function (fun) {
	return this.toJSON().filter(fun)
	}

	A.map = function (fun) {
	return this.toJSON().map(fun)
	}

	A.reduce = function (fun, initial) {
	return this.toJSON().reduce(fun, initial)
	}

	//.length is a property, not a function.

},{"between":32,"scuttlebutt":34,"scuttlebutt/util":39,"util":13}],34:[function(require,module,exports){
	var process=require("__browserify_process");var EventEmitter = require('events').EventEmitter
	var i = require('iterate')
	var duplex = require('duplex')
	var inherits = require('util').inherits
	var serializer = require('stream-serializer')
	var u = require('./util')
	var timestamp = require('monotonic-timestamp')

	exports = 
	module.exports = Scuttlebutt

	exports.createID = u.createID
	exports.updateIsRecent = u.filter
	exports.filter = u.filter
	exports.timestamp = timestamp

	function dutyOfSubclass() {
		throw new Error('method must be implemented by subclass')
	}

	function validate (data) {
		if(!(Array.isArray(data) 
			&& 'string' === typeof data[2]
		&& '__proto__'     !== data[2] //THIS WOULD BREAK STUFF
		&& 'number' === typeof data[1]
		)) return false

			return true
	}

	var emit = EventEmitter.prototype.emit

	inherits (Scuttlebutt, EventEmitter)

	function Scuttlebutt (opts) {

		if(!(this instanceof Scuttlebutt)) return new Scuttlebutt(opts)
			var id = 'string' === typeof opts ? opts : opts && opts.id
		this.sources = {}
		this.setMaxListeners(Number.MAX_VALUE)
		//count how many other instances we are replicating to.
		this._streams = 0
		if(opts && opts.sign && opts.verify) {
			this.setId(opts.id || opts.createId())
			this._sign   = opts.sign
			this._verify = opts.verify
		} else {
			this.setId(id || u.createId())
		}
	}

	var sb = Scuttlebutt.prototype

	var emit = EventEmitter.prototype.emit

	sb.applyUpdate = dutyOfSubclass
	sb.history      = dutyOfSubclass

	sb.localUpdate = function (trx) {
		this._update([trx, timestamp(), this.id])
		return this
	}

	sb._update = function (update) {
		//validated when it comes into the stream
		var ts = update[1]
		var source = update[2]
		//if this message is old for it's source,
		//ignore it. it's out of order.
		//each node must emit it's changes in order!
		
		var latest = this.sources[source]
		if(latest && latest >= ts)
			return emit.call(this, 'old_data', update), false

		this.sources[source] = ts

		var self = this
		function didVerification (err, verified) {

			// I'm not sure how what should happen if a async verification
			// errors. if it's an key not found - that is a verification fail,
			// not a error. if it's genunie error, really you should queue and 
			// try again? or replay the message later
			// -- this should be done my the security plugin though, not scuttlebutt.

			if(err)
				return emit.call(self, 'error', err)

			if(!verified)
				return emit.call(self, 'unverified_data', update)

			// check if this message is older than
			// the value we already have.
			// do nothing if so
			// emit an 'old_data' event because i'll want to track how many
			// unnecessary messages are sent.

			if(self.applyUpdate(update))
				emit.call(self, '_update', update) //write to stream.
		}

		if(source !== this.id) {
			if(this._verify)
				this._verify(update, didVerification)
			else
				didVerification(null, true)
		} else {
			if(this._sign) {
				//could make this async easily enough.
				update[3] = this._sign(update)
			}
			didVerification(null, true)
		}

		return true
	}

	sb.createStream = function (opts) {
		var self = this
		//the sources for the remote end.
		var sources = {}, other
		var syncSent = false, syncRecv = false

		this._streams ++

		opts = opts || {}
		var d = duplex()
		d.name = opts.name
		var outer = serializer(opts && opts.wrapper)(d)
		outer.inner = d

		d.writable = opts.writable !== false
		d.readable = opts.readable !== false

		syncRecv   = !d.writable
		syncSent   = !d.readable

		var tail = opts.tail !== false //default to tail=true

		function start (data) {
			//when the digest is recieved from the other end,
			//send the history.
			//merge with the current list of sources.
			sources = data.clock
			i.each(self.history(sources), function (data) {d._data(data)})
			
			outer.emit('header', data)
			d._data('SYNC')
			//when we have sent all history
			outer.emit('syncSent')
			syncSent = true
			//when we have recieved all histoyr
			//emit 'synced' when this stream has synced.
			if(syncRecv) outer.emit('sync'), outer.emit('synced')
				if(!tail) d._end()
			}

		d
		.on('_data', function (data) {
				//if it's an array, it's an update.
				if(Array.isArray(data)) {
					if(validate(data))
						return self._update(data)
				}
				//if it's an object, it's a scuttlebut digest.
				else if('object' === typeof data && data)
					start(data)
				else if('string' === typeof data && data == 'SYNC') {
					syncRecv = true
					outer.emit('syncRecieved')
					if(syncSent) outer.emit('sync'), outer.emit('synced')
				}
		}).on('_end', function () {
			d._end()
		})
		.on('close', function () {
			self.removeListener('_update', onUpdate)
				//emit the number of streams that are remaining...
				//this will be used for memory management...
				self._streams --
				emit.call(self, 'unstream', self._streams)
			})

		if(opts && opts.tail === false) {
			outer.on('sync', function () {
				process.nextTick(function () {
					d._end()
				})
			})
		}
		function onUpdate (update) { //value, source, ts
			if(!validate(update) || !u.filter(update, sources))
				return

			d._data(update)

			//really, this should happen before emitting.
			var ts = update[1]
			var source = update[2]
			sources[source] = ts
		}

		var outgoing = { id : self.id, clock : self.sources }

		if (opts && opts.meta) outgoing.meta = opts.meta

			if(d.readable) {
				d._data(outgoing)
				if(!d.writable)
					start({clock:{}})
				if(tail)
					self.on('_update', onUpdate)
			}

			self.once('dispose', function () {
				d.end()
			})

			return outer
		}

		sb.createWriteStream = function (opts) {
			opts = opts || {}
			opts.writable = true; opts.readable = false
			return this.createStream(opts)
		}

		sb.createReadStream = function (opts) {
			opts = opts || {}
			opts.writable = false; opts.readable = true
			return this.createStream(opts)
		}

		sb.dispose = function () {
			emit.call(this, 'dispose')
		}

		sb.setId = function (id) {
			if('__proto__' === id) throw new Error('__proto__ is invalid id')
				if(id == null) throw new Error('null is not invalid id')
					this.id = id
				return this
			}

			function streamDone(stream, listener) {

				function remove () {
					stream.removeListener('end',   onDone)
					stream.removeListener('error', onDone)
					stream.removeListener('close',   onDone)
				}
				function onDone (arg) {
					remove()
					listener.call(this, arg)
				}

		//this makes emitter.removeListener(event, listener) still work
		onDone.listener = listener

		stream.on('end',   onDone)
		stream.on('error', onDone)
		stream.on('close', onDone)
	}

	//create another instance of this scuttlebutt,
	//that is in sync and attached to this instance.
	sb.clone = function () {
		var A = this
		var B = new (A.constructor)
		B.setId(A.id) //same id. think this will work...

		A._clones = (A._clones || 0) + 1

		var a = A.createStream({wrapper: 'raw'})
		var b = B.createStream({wrapper: 'raw'})

		//all updates must be sync, so make sure pause never happens.
		a.pause = b.pause = function noop(){}

		streamDone(b, function () {
			A._clones--
			emit.call(A, 'unclone', A._clones)
		})

		a.pipe(b).pipe(a)
		//resume both streams, so that the new instance is brought up to date immediately.
		a.resume()
		b.resume()

		return B
	}


},{"./util":39,"__browserify_process":17,"duplex":35,"events":8,"iterate":36,"monotonic-timestamp":37,"stream-serializer":38,"util":13}],35:[function(require,module,exports){
	var process=require("__browserify_process");var Stream = require('stream')

	module.exports = function (write, end) {
		var stream = new Stream() 
		var buffer = [], ended = false, destroyed = false, emitEnd
		stream.writable = stream.readable = true
		stream.paused = false
		stream._paused = false
		stream.buffer = buffer

		stream
		.on('pause', function () {
			stream._paused = true
		})
		.on('drain', function () {
			stream._paused = false
		})

		function destroySoon () {
			process.nextTick(stream.destroy.bind(stream))
		}

		if(write)
			stream.on('_data', write)
		if(end)
			stream.on('_end', end)

		//destroy the stream once both ends are over
		//but do it in nextTick, so that other listeners
		//on end have time to respond
		stream.once('end', function () { 
			stream.readable = false
			if(!stream.writable) {
				process.nextTick(function () {
					stream.destroy()
				})
			}
		})

		stream.once('_end', function () { 
			stream.writable = false
			if(!stream.readable)
				stream.destroy()
		})

		// this is the default write method,
		// if you overide it, you are resposible
		// for pause state.

		
		stream._data = function (data) {
			if(!stream.paused && !buffer.length)
				stream.emit('data', data)
			else 
				buffer.push(data)
			return !(stream.paused || buffer.length)
		}

		stream._end = function (data) { 
			if(data) stream._data(data)
				if(emitEnd) return
					emitEnd = true
			//destroy is handled above.
			stream.drain()
		}

		stream.write = function (data) {
			stream.emit('_data', data)
			return !stream._paused
		}

		stream.end = function () {
			stream.writable = false
			if(stream.ended) return
				stream.ended = true
			stream.emit('_end')
		}

		stream.drain = function () {
			if(!buffer.length && !emitEnd) return
			//if the stream is paused after just before emitEnd()
			//end should be buffered.
			while(!stream.paused) {
				if(buffer.length) {
					stream.emit('data', buffer.shift())
					if(buffer.length == 0) {
						stream.emit('_drain')
					}
				}
				else if(emitEnd && stream.readable) {
					stream.readable = false
					stream.emit('end')
					return
				} else {
					//if the buffer has emptied. emit drain.
					return true
				}
			}
		}
		var started = false
		stream.resume = function () {
			//this is where I need pauseRead, and pauseWrite.
			//here the reading side is unpaused,
			//but the writing side may still be paused.
			//the whole buffer might not empity at once.
			//it might pause again.
			//the stream should never emit data inbetween pause()...resume()
			//and write should return !buffer.length
			started = true
			stream.paused = false
			stream.drain() //will emit drain if buffer empties.
			return stream
		}

		stream.destroy = function () {
			if(destroyed) return
				destroyed = ended = true     
			buffer.length = 0
			stream.emit('close')
		}
		var pauseCalled = false
		stream.pause = function () {
			started = true
			stream.paused = true
			stream.emit('_pause')
			return stream
		}
		stream._pause = function () {
			if(!stream._paused) {
				stream._paused = true
				stream.emit('pause')
			}
			return this
		}
		stream.paused = true
		process.nextTick(function () {
			//unless the user manually paused
			if(started) return
				stream.resume()
		})

		return stream
	}


},{"__browserify_process":17,"stream":9}],36:[function(require,module,exports){

	//
	// adds all the fields from obj2 onto obj1
	//

	var each = exports.each = function (obj,iterator){
	 var keys = Object.keys(obj)
	 keys.forEach(function (key){
		iterator(obj[key],key,obj) 
	})
	}

	var RX = /sadf/.constructor
	function rx (iterator ){
		return iterator instanceof RX ? function (str) { 
			var m = iterator.exec(str)
			return m && (m[1] ? m[1] : m[0]) 
		} : iterator
	}

	var times = exports.times = function () {
		var args = [].slice.call(arguments)
		, iterator = rx(args.pop())
		, m = args.pop()
		, i = args.shift()
		, j = args.shift()
		, diff, dir
		, a = []

		i = 'number' === typeof i ? i : 1
		diff = j ? j - i : 1
		dir = i < m
		if(m == i)
			throw new Error('steps cannot be the same: '+m+', '+i)
		for (; dir ? i <= m : m <= i; i += diff)
			a.push(iterator(i))
		return a
	}

	var map = exports.map = function (obj, iterator){
		iterator = rx(iterator)
		if(Array.isArray(obj))
			return obj.map(iterator)
		if('number' === typeof obj)
			return times.apply(null, [].slice.call(arguments))  
		//return if null ?  
		var keys = Object.keys(obj)
		, r = {}
		keys.forEach(function (key){
			r[key] = iterator(obj[key],key,obj) 
		})
		return r
	}

	var findReturn = exports.findReturn = function (obj, iterator) {
		iterator = rx(iterator)
		if(obj == null)
			return
		var keys = Object.keys(obj)
		, l = keys.length
		for (var i = 0; i < l; i ++) {
			var key = keys[i]
			, value = obj[key]
			var r = iterator(value, key)
			if(r) return r
		}
	}

	var find = exports.find = function (obj, iterator) { 
		iterator = rx(iterator)
		return findReturn (obj, function (v, k) {
			var r = iterator(v, k)
			if(r) return v
		})
	}

	var findKey = exports.findKey = function (obj, iterator) { 
		iterator = rx(iterator)
		return findReturn (obj, function (v, k) {
			var r = iterator(v, k)
			if(r) return k
		})
	}

	var filter = exports.filter = function (obj, iterator){
		iterator = rx (iterator)

		if(Array.isArray(obj))
			return obj.filter(iterator)
		
		var keys = Object.keys(obj)
		, r = {}
		keys.forEach(function (key){
			var v
			if(iterator(v = obj[key],key,obj))
				r[key] = v
		})
		return r 
	}

	var mapKeys = exports.mapKeys = function (ary, iterator){
		var r = {}
		iterator = rx(iterator)
		each(ary, function (v,k){
			r[v] = iterator(v,k)
		})
		return r
	}


	var mapToArray = exports.mapToArray = function (ary, iterator){
		var r = []
		iterator = rx(iterator)
		each(ary, function (v,k){
			r.push(iterator(v,k))
		})
		return r
	}

	var path = exports.path = function (object, path) {

		for (var i in path) {
			if(object == null) return undefined
				var key = path[i]
			object = object[key]
		}
		return object
	}

	/*
	NOTE: naive implementation. 
	`match` must not contain circular references.
	*/

	var setPath = exports.setPath = function (object, path, value) {

		for (var i in path) {
			var key = path[i]
			if(object[key] == null) object[key] = ( 
				i + 1 == path.length ? value : {}
				)
				object = object[key]
		}
	}

	var join = exports.join = function (A, B, it) {
		each(A, function (a, ak) {
			each(B, function (b, bk) {
				it(a, b, ak, bk)
			})
		})
	}

},{}],37:[function(require,module,exports){
	// If `Date.now()` is invoked twice quickly, it's possible to get two
	// identical time stamps. To avoid generation duplications, subsequent
	// calls are manually ordered to force uniqueness.

	var _last = 0
	var _count = 1
	var adjusted = 0
	var _adjusted = 0

	module.exports =
	function timestamp() {
		/**
		Returns NOT an accurate representation of the current time.
		Since js only measures time as ms, if you call `Date.now()`
		twice quickly, it's possible to get two identical time stamps.
		This function guarantees unique but maybe inaccurate results
		on each call.
		**/
		//uncomment this wen
		var time = Date.now()
		//time = ~~ (time / 1000) 
		//^^^uncomment when testing...

		/**
		If time returned is same as in last call, adjust it by
		adding a number based on the counter. 
		Counter is incremented so that next call get's adjusted properly.
		Because floats have restricted precision, 
		may need to step past some values...
		**/
		if (_last === time)  {
			do {
				adjusted = time + ((_count++) / (_count + 999))
			} while (adjusted === _adjusted)
			_adjusted = adjusted
		}
		// If last time was different reset timer back to `1`.
		else {
			_count = 1
			adjusted = time
		}
		_adjusted = adjusted
		_last = time
		return adjusted
	}

},{}],38:[function(require,module,exports){

	var EventEmitter = require('events').EventEmitter

	exports = module.exports = function (wrapper) {

		if('function' == typeof wrapper)
			return wrapper

		return exports[wrapper] || exports.json
	}

	exports.json = function (stream) {

		var write = stream.write
		var soFar = ''

		function parse (line) {
			var js
			try {
				js = JSON.parse(line)
			//ignore lines of whitespace...
			} catch (err) { 
				return stream.emit('error', err)
				//return console.error('invalid JSON', line)
			}
			if(js !== undefined)
				write.call(stream, js)
		}

		function onData (data) {
			var lines = (soFar + data).split('\n')
			soFar = lines.pop()
			while(lines.length) {
				parse(lines.shift())
			}
		}

		stream.write = onData
		
		var end = stream.end

		stream.end = function (data) {
			if(data)
				stream.write(data)
			//if there is any left over...
			if(soFar) {
				parse(soFar)
			}
			return end.call(stream)
		}

		stream.emit = function (event, data) {

			if(event == 'data') {
				data = JSON.stringify(data) + '\n'
			}
			//since all stream events only use one argument, this is okay...
			EventEmitter.prototype.emit.call(stream, event, data)
		}

		return stream
	//  return es.pipeline(es.split(), es.parse(), stream, es.stringify())
	}

	exports.raw = function (stream) {
		return stream
	}


},{"events":8}],39:[function(require,module,exports){
	exports.createId = 
	function () {
		return [1,1,1].map(function () {
			return Math.random().toString(16).substring(2).toUpperCase()
		}).join('')
	}

	exports.filter = function (update, sources) {
		var ts = update[1]
		var source = update[2]
		return (!sources || !sources[source] || sources[source] < ts)
	}

	exports.protoIsIllegal = function (s) {
		s.emit('invalid', new Error('"__proto__" is illegal property name'))
		return null
	}

	function invalidUpdate(t) {
		t.emit('invalid', new Error('invalid update'))
	}

	exports.validUpdate = function (t, update) {
		if(!Array.isArray(update)) return invalidUpdate(t)
		if('string' !== typeof update[1] || 'number' !== typeof update[2])
			return invalidUpdate(t)
	}

	exports.sort = function (hist) {
		return hist.sort(function (a, b) {
			//sort by timestamps, then ids.
			//there should never be a pair with equal timestamps
			//and ids.
			return a[1] - b[1] || (a[2] > b[2] ? 1 : -1)
		})
	}

},{}],40:[function(require,module,exports){
	var process=require("__browserify_process");var EventEmitter = require('events').EventEmitter
	var i = require('iterate')
	var duplex = require('duplex')
	var inherits = require('util').inherits
	var serializer = require('stream-serializer')
	var u = require('./util')
	var timestamp = require('monotonic-timestamp')

	exports = 
	module.exports = Scuttlebutt

	exports.createID = u.createID
	exports.updateIsRecent = u.filter
	exports.filter = u.filter
	exports.timestamp = timestamp

	function dutyOfSubclass() {
		throw new Error('method must be implemented by subclass')
	}

	function validate (data) {
		if(!(Array.isArray(data) 
			&& 'string' === typeof data[2]
	&& '__proto__'     !== data[2] //THIS WOULD BREAK STUFF
	&& 'number' === typeof data[1]
	)) return false

			return true
	}

	inherits (Scuttlebutt, EventEmitter)

	function Scuttlebutt (opts) {

		if(!(this instanceof Scuttlebutt)) return new Scuttlebutt(opts)
			var id = 'string' === typeof opts ? opts : opts && opts.id
		this.sources = {}
		this.setMaxListeners(Number.MAX_VALUE)
		//count how many other instances we are replicating to.
		this._streams = 0
		if(opts && opts.sign && opts.verify) {
			this.setId(opts.id || opts.createId())
			this._sign   = opts.sign
			this._verify = opts.verify
		} else {
			this.setId(id || u.createId())
		}
	}

	var sb = Scuttlebutt.prototype

	var emit = EventEmitter.prototype.emit

	sb.applyUpdate = dutyOfSubclass
	sb.history      = dutyOfSubclass

	sb.localUpdate = function (trx) {
		this._update([trx, timestamp(), this.id])
		return this
	}

	sb._update = function (update) {
		//validated when it comes into the stream
		var ts = update[1]
		var source = update[2]
		//if this message is old for it's source,
		//ignore it. it's out of order.
		//each node must emit it's changes in order!
		
		var latest = this.sources[source]
		if(latest && latest >= ts)
			return emit.call(this, 'old_data', update), false

		this.sources[source] = ts

		var self = this
		function didVerification (err, verified) {

			// I'm not sure how what should happen if a async verification
			// errors. if it's an key not found - that is a verification fail,
			// not a error. if it's genunie error, really you should queue and 
			// try again? or replay the message later
			// -- this should be done my the security plugin though, not scuttlebutt.

			if(err)
				return emit.call(self, 'error', err)

			if(!verified)
				return emit.call(self, 'unverified_data', update)

			// check if this message is older than
			// the value we already have.
			// do nothing if so
			// emit an 'old_data' event because i'll want to track how many
			// unnecessary messages are sent.

			if(self.applyUpdate(update))
				emit.call(self, '_update', update) //write to stream.
		}

		if(source !== this.id) {
			if(this._verify)
				this._verify(update, didVerification)
			else
				didVerification(null, true)
		} else {
			if(this._sign) {
				//could make this async easily enough.
				update[3] = this._sign(update)
			}
			didVerification(null, true)
		}

		return true
	}

	sb.createStream = function (opts) {
		var self = this
		//the sources for the remote end.
		var sources = {}, other
		var syncSent = false, syncRecv = false

		this._streams ++

		opts = opts || {}
		var d = duplex()
		d.name = opts.name
		var outer = serializer(opts && opts.wrapper)(d)
		outer.inner = d

		d.writable = opts.writable !== false
		d.readable = opts.readable !== false

		syncRecv   = !d.writable
		syncSent   = !d.readable

		var tail = opts.tail !== false //default to tail=true

		function start (data) {
			//when the digest is recieved from the other end,
			//send the history.
			//merge with the current list of sources.
			if (!data || !data.clock) {
				d.emit('error');
				return d._end()
			}

			sources = data.clock

			i.each(self.history(sources), function (data) {d._data(data)})

			//the _update listener must be set after the history is queued.
			//otherwise there is a race between the first client message
			//and the next update (which may come in on another stream)
			//this problem will probably not be encountered until you have 
			//thousands of scuttlebutts.

			self.on('_update', onUpdate)
			
			d._data('SYNC')
			syncSent = true
			//when we have sent all history
			outer.emit('header', data)
			outer.emit('syncSent')
			//when we have recieved all histoyr
			//emit 'synced' when this stream has synced.
			if(syncRecv) outer.emit('sync'), outer.emit('synced')
				if(!tail) d._end()
			}

		d
		.on('_data', function (data) {
				//if it's an array, it's an update.
				if(Array.isArray(data)) {
					//check whether we are accepting writes.
					if(!d.writable)
						return
					if(validate(data))
						return self._update(data)
				}
				//if it's an object, it's a scuttlebut digest.
				else if('object' === typeof data && data)
					start(data)
				else if('string' === typeof data && data == 'SYNC') {
					syncRecv = true
					outer.emit('syncRecieved')
					if(syncSent) outer.emit('sync'), outer.emit('synced')
				}
		}).on('_end', function () {
			d._end()
		})
		.on('close', function () {
			self.removeListener('_update', onUpdate)
			self.removeListener('dispose', dispose)
				//emit the number of streams that are remaining...
				//this will be used for memory management...
				self._streams --
				emit.call(self, 'unstream', self._streams)
			})

		if(opts && opts.tail === false) {
			outer.on('sync', function () {
				process.nextTick(function () {
					d._end()
				})
			})
		}
		function onUpdate (update) { //value, source, ts
			if(!validate(update) || !u.filter(update, sources))
				return

			d._data(update)

			//really, this should happen before emitting.
			var ts = update[1]
			var source = update[2]
			sources[source] = ts
		}

		function dispose () {
			d.end()
		}

		var outgoing = { id : self.id, clock : self.sources }

		if (opts && opts.meta) outgoing.meta = opts.meta

			if(d.readable) {
				d._data(outgoing)
				if(!d.writable && !opts.clock)
					start({clock:{}})

			} else if (opts.sendClock) {
			//send my current clock.
			//so the other side knows what to send
			d._data(outgoing)
		}

		self.once('dispose', dispose)

		return outer
	}

	sb.createWriteStream = function (opts) {
		opts = opts || {}
		opts.writable = true; opts.readable = false
		return this.createStream(opts)
	}

	sb.createReadStream = function (opts) {
		opts = opts || {}
		opts.writable = false; opts.readable = true
		return this.createStream(opts)
	}

	sb.dispose = function () {
		emit.call(this, 'dispose')
	}

	sb.setId = function (id) {
		if('__proto__' === id) throw new Error('__proto__ is invalid id')
			if(id == null) throw new Error('null is not invalid id')
				this.id = id
			return this
		}

		function streamDone(stream, listener) {

			function remove () {
				stream.removeListener('end',   onDone)
				stream.removeListener('error', onDone)
				stream.removeListener('close',   onDone)
			}
			function onDone (arg) {
				remove()
				listener.call(this, arg)
			}

		//this makes emitter.removeListener(event, listener) still work
		onDone.listener = listener

		stream.on('end',   onDone)
		stream.on('error', onDone)
		stream.on('close', onDone)
	}

	//create another instance of this scuttlebutt,
	//that is in sync and attached to this instance.
	sb.clone = function () {
		var A = this
		var B = new (A.constructor)
		B.setId(A.id) //same id. think this will work...

		A._clones = (A._clones || 0) + 1

		var a = A.createStream({wrapper: 'raw'})
		var b = B.createStream({wrapper: 'raw'})

		//all updates must be sync, so make sure pause never happens.
		a.pause = b.pause = function noop(){}

		streamDone(b, function () {
			A._clones--
			emit.call(A, 'unclone', A._clones)
		})

		a.pipe(b).pipe(a)
		//resume both streams, so that the new instance is brought up to date immediately.
		a.resume()
		b.resume()

		return B
	}


},{"./util":44,"__browserify_process":17,"duplex":41,"events":8,"iterate":42,"monotonic-timestamp":43,"stream-serializer":45,"util":13}],41:[function(require,module,exports){
	module.exports=require(35)
},{"__browserify_process":17,"stream":9}],42:[function(require,module,exports){
	module.exports=require(36)
},{}],43:[function(require,module,exports){
	module.exports=require(37)
},{}],44:[function(require,module,exports){
	module.exports=require(39)
},{}],45:[function(require,module,exports){

	var EventEmitter = require('events').EventEmitter

	exports = module.exports = function (wrapper) {

		if('function' == typeof wrapper)
			return wrapper

		return exports[wrapper] || exports.json
	}

	exports.json = function (stream, _JSON) {
		_JSON = _JSON || JSON

		var write = stream.write
		var soFar = ''

		function parse (line) {
			var js
			try {
				js = _JSON.parse(line)
			//ignore lines of whitespace...
		} catch (err) { 
			err.line = line
			return stream.emit('error', err)
			//return console.error('invalid JSON', line)
		}
		if(js !== undefined)
			write.call(stream, js)
		}

		function onData (data) {
			var lines = (soFar + data).split('\n')
			soFar = lines.pop()
			while(lines.length) {
				parse(lines.shift())
			}
		}

		stream.write = onData
		
		var end = stream.end

		stream.end = function (data) {
			if(data)
				stream.write(data)
			//if there is any left over...
			if(soFar) {
				parse(soFar)
			}
			return end.call(stream)
		}

		stream.emit = function (event, data) {

			if(event == 'data') {
				data = _JSON.stringify(data) + '\n'
			}
			//since all stream events only use one argument, this is okay...
			EventEmitter.prototype.emit.call(stream, event, data)
		}

		return stream
	}

	exports.raw = function (stream) {
		return stream
	}


},{"events":8}],46:[function(require,module,exports){
	var process=require("__browserify_process");var Stream = require('stream')

	// through
	//
	// a stream that does nothing but re-emit the input.
	// useful for aggregating a series of changing but not ending streams into one stream)

	exports = module.exports = through
	through.through = through

	//create a readable writable stream.

	function through (write, end, opts) {
		write = write || function (data) { this.queue(data) }
		end = end || function () { this.queue(null) }

		var ended = false, destroyed = false, buffer = [], _ended = false
		var stream = new Stream()
		stream.readable = stream.writable = true
		stream.paused = false

	//  stream.autoPause   = !(opts && opts.autoPause   === false)
	stream.autoDestroy = !(opts && opts.autoDestroy === false)

	stream.write = function (data) {
		write.call(this, data)
		return !stream.paused
	}

	function drain() {
		while(buffer.length && !stream.paused) {
			var data = buffer.shift()
			if(null === data)
				return stream.emit('end')
			else
				stream.emit('data', data)
		}
	}

	stream.queue = stream.push = function (data) {
	//    console.error(ended)
	if(_ended) return stream
		if(data == null) _ended = true
			buffer.push(data)
		drain()
		return stream
	}

		//this will be registered as the first 'end' listener
		//must call destroy next tick, to make sure we're after any
		//stream piped from here.
		//this is only a problem if end is not emitted synchronously.
		//a nicer way to do this is to make sure this is the last listener for 'end'

		stream.on('end', function () {
			stream.readable = false
			if(!stream.writable && stream.autoDestroy)
				process.nextTick(function () {
					stream.destroy()
				})
		})

		function _end () {
			stream.writable = false
			end.call(stream)
			if(!stream.readable && stream.autoDestroy)
				stream.destroy()
		}

		stream.end = function (data) {
			if(ended) return
				ended = true
			if(arguments.length) stream.write(data)
			_end() // will emit or queue
		return stream
	}

	stream.destroy = function () {
		if(destroyed) return
			destroyed = true
		ended = true
		buffer.length = 0
		stream.writable = stream.readable = false
		stream.emit('close')
		return stream
	}

	stream.pause = function () {
		if(stream.paused) return
			stream.paused = true
		return stream
	}

	stream.resume = function () {
		if(stream.paused) {
			stream.paused = false
			stream.emit('resume')
		}
		drain()
			//may have become paused again,
			//as drain emits 'data'.
			if(!stream.paused)
				stream.emit('drain')
			return stream
		}
		return stream
	}


},{"__browserify_process":17,"stream":9}],47:[function(require,module,exports){
	var skelly, ldata, app, client;
	skelly = require('../');
	ldata = require('../deps/live-data');
	app = new skelly.App;
	client = skelly.connect(app);
	client.store.on('old_data', function(u){
		return console.log('discarded update:', u);
	});
	client.rawStore.on('old_data', function(u){
		return console.log('discarded update:', u);
	});
	app.store.on('old_data', function(u){
		return console.log('discarded update:', u);
	});
	window.client = client;
	window.ldata = ldata;
	window.app = app;
},{"../":19,"../deps/live-data":21}]},{},[47])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL19zaGltcy5qcyIsIi9ob21lL2NwdXAvLm5vZGVudi92ZXJzaW9ucy92MC4xMC4yMi9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vX3N0cmVhbV9kdXBsZXguanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL19zdHJlYW1fcGFzc3Rocm91Z2guanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL19zdHJlYW1fcmVhZGFibGUuanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL19zdHJlYW1fdHJhbnNmb3JtLmpzIiwiL2hvbWUvY3B1cC8ubm9kZW52L3ZlcnNpb25zL3YwLjEwLjIyL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9fc3RyZWFtX3dyaXRhYmxlLmpzIiwiL2hvbWUvY3B1cC8ubm9kZW52L3ZlcnNpb25zL3YwLjEwLjIyL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9hc3NlcnQuanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2V2ZW50cy5qcyIsIi9ob21lL2NwdXAvLm5vZGVudi92ZXJzaW9ucy92MC4xMC4yMi9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vc3RyZWFtLmpzIiwiL2hvbWUvY3B1cC8ubm9kZW52L3ZlcnNpb25zL3YwLjEwLjIyL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9zdHJpbmdfZGVjb2Rlci5qcyIsIi9ob21lL2NwdXAvLm5vZGVudi92ZXJzaW9ucy92MC4xMC4yMi9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vdGltZXJzLmpzIiwiL2hvbWUvY3B1cC8ubm9kZW52L3ZlcnNpb25zL3YwLjEwLjIyL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi90dHkuanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL3V0aWwuanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvYnVmZmVyLWJyb3dzZXJpZnkvYnVmZmVyX2llZWU3NTQuanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvYnVmZmVyLWJyb3dzZXJpZnkvaW5kZXguanMiLCIvaG9tZS9jcHVwLy5ub2RlbnYvdmVyc2lvbnMvdjAuMTAuMjIvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvYnVmZmVyLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL2hvbWUvY3B1cC8ubm9kZW52L3ZlcnNpb25zL3YwLjEwLjIyL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9hcHAuanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L2Jyb3dzZXIuanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L2NsaWVudC5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvZGVwcy9saXZlLWRhdGEuanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L2xpYnJhcnkuanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L2xpdmUtZGF0YS9hcnJheS5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbGl2ZS1kYXRhL2Jhc2UuanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L2xpdmUtZGF0YS9pbmRleC5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbGl2ZS1kYXRhL21hcC12aWV3LmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9saXZlLWRhdGEvbWFwLmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9saXZlLWRhdGEvdXRpbHMuanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L2xpdmUtZGF0YS92YWx1ZS5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbG9nLmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9ub2RlX21vZHVsZXMvYW5zaS1mb250L2luZGV4LmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9ub2RlX21vZHVsZXMvYmV0d2Vlbi9pbmRleC5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbm9kZV9tb2R1bGVzL3ItYXJyYXkvaW5kZXguanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L25vZGVfbW9kdWxlcy9yLWFycmF5L25vZGVfbW9kdWxlcy9zY3V0dGxlYnV0dC9pbmRleC5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbm9kZV9tb2R1bGVzL3ItYXJyYXkvbm9kZV9tb2R1bGVzL3NjdXR0bGVidXR0L25vZGVfbW9kdWxlcy9kdXBsZXgvaW5kZXguanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L25vZGVfbW9kdWxlcy9yLWFycmF5L25vZGVfbW9kdWxlcy9zY3V0dGxlYnV0dC9ub2RlX21vZHVsZXMvaXRlcmF0ZS9pbmRleC5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbm9kZV9tb2R1bGVzL3ItYXJyYXkvbm9kZV9tb2R1bGVzL3NjdXR0bGVidXR0L25vZGVfbW9kdWxlcy9tb25vdG9uaWMtdGltZXN0YW1wL2luZGV4LmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9ub2RlX21vZHVsZXMvci1hcnJheS9ub2RlX21vZHVsZXMvc2N1dHRsZWJ1dHQvbm9kZV9tb2R1bGVzL3N0cmVhbS1zZXJpYWxpemVyL2luZGV4LmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9ub2RlX21vZHVsZXMvci1hcnJheS9ub2RlX21vZHVsZXMvc2N1dHRsZWJ1dHQvdXRpbC5qcyIsIi9ob21lL2NwdXAvY29kZS9za2VsbHkvbm9kZV9tb2R1bGVzL3NjdXR0bGVidXR0L2luZGV4LmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS9ub2RlX21vZHVsZXMvc3RyZWFtLXNlcmlhbGl6ZXIvaW5kZXguanMiLCIvaG9tZS9jcHVwL2NvZGUvc2tlbGx5L25vZGVfbW9kdWxlcy90aHJvdWdoL2luZGV4LmpzIiwiL2hvbWUvY3B1cC9jb2RlL3NrZWxseS90ZXN0L2NsaWVudC5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Y1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcG1DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDMVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4vL1xuLy8gVGhlIHNoaW1zIGluIHRoaXMgZmlsZSBhcmUgbm90IGZ1bGx5IGltcGxlbWVudGVkIHNoaW1zIGZvciB0aGUgRVM1XG4vLyBmZWF0dXJlcywgYnV0IGRvIHdvcmsgZm9yIHRoZSBwYXJ0aWN1bGFyIHVzZWNhc2VzIHRoZXJlIGlzIGluXG4vLyB0aGUgb3RoZXIgbW9kdWxlcy5cbi8vXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBBcnJheS5pc0FycmF5IGlzIHN1cHBvcnRlZCBpbiBJRTlcbmZ1bmN0aW9uIGlzQXJyYXkoeHMpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgPyBBcnJheS5pc0FycmF5IDogaXNBcnJheTtcblxuLy8gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xuICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5maWx0ZXIgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5maWx0ZXIgPSBmdW5jdGlvbiBmaWx0ZXIoeHMsIGZuKSB7XG4gIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZm4pO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZm4oeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKHhzLCBmbiwgc2VsZikge1xuICBpZiAoeHMuZm9yRWFjaCkgcmV0dXJuIHhzLmZvckVhY2goZm4sIHNlbGYpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm4uY2FsbChzZWxmLCB4c1tpXSwgaSwgeHMpO1xuICB9XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUubWFwIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMubWFwID0gZnVuY3Rpb24gbWFwKHhzLCBmbikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGZuKTtcbiAgdmFyIG91dCA9IG5ldyBBcnJheSh4cy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZm4oeHNbaV0sIGksIHhzKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLnJlZHVjZSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLnJlZHVjZSA9IGZ1bmN0aW9uIHJlZHVjZShhcnJheSwgY2FsbGJhY2ssIG9wdF9pbml0aWFsVmFsdWUpIHtcbiAgaWYgKGFycmF5LnJlZHVjZSkgcmV0dXJuIGFycmF5LnJlZHVjZShjYWxsYmFjaywgb3B0X2luaXRpYWxWYWx1ZSk7XG4gIHZhciB2YWx1ZSwgaXNWYWx1ZVNldCA9IGZhbHNlO1xuXG4gIGlmICgyIDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHZhbHVlID0gb3B0X2luaXRpYWxWYWx1ZTtcbiAgICBpc1ZhbHVlU2V0ID0gdHJ1ZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgbCA+IGk7ICsraSkge1xuICAgIGlmIChhcnJheS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgaWYgKGlzVmFsdWVTZXQpIHtcbiAgICAgICAgdmFsdWUgPSBjYWxsYmFjayh2YWx1ZSwgYXJyYXlbaV0sIGksIGFycmF5KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGFycmF5W2ldO1xuICAgICAgICBpc1ZhbHVlU2V0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG5pZiAoJ2FiJy5zdWJzdHIoLTEpICE9PSAnYicpIHtcbiAgZXhwb3J0cy5zdWJzdHIgPSBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgLy8gZGlkIHdlIGdldCBhIG5lZ2F0aXZlIHN0YXJ0LCBjYWxjdWxhdGUgaG93IG11Y2ggaXQgaXMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmdcbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcblxuICAgIC8vIGNhbGwgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uXG4gICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbmd0aCk7XG4gIH07XG59IGVsc2Uge1xuICBleHBvcnRzLnN1YnN0ciA9IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW5ndGgpIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuZ3RoKTtcbiAgfTtcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS50cmltIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMudHJpbSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59O1xuXG4vLyBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIGZuID0gYXJncy5zaGlmdCgpO1xuICBpZiAoZm4uYmluZCkgcmV0dXJuIGZuLmJpbmQuYXBwbHkoZm4sIGFyZ3MpO1xuICB2YXIgc2VsZiA9IGFyZ3Muc2hpZnQoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBmbi5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChbQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKV0pKTtcbiAgfTtcbn07XG5cbi8vIE9iamVjdC5jcmVhdGUgaXMgc3VwcG9ydGVkIGluIElFOVxuZnVuY3Rpb24gY3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICB2YXIgb2JqZWN0O1xuICBpZiAocHJvdG90eXBlID09PSBudWxsKSB7XG4gICAgb2JqZWN0ID0geyAnX19wcm90b19fJyA6IG51bGwgfTtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHByb3RvdHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICd0eXBlb2YgcHJvdG90eXBlWycgKyAodHlwZW9mIHByb3RvdHlwZSkgKyAnXSAhPSBcXCdvYmplY3RcXCcnXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgVHlwZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIG9iamVjdCA9IG5ldyBUeXBlKCk7XG4gICAgb2JqZWN0Ll9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgfVxuICBpZiAodHlwZW9mIHByb3BlcnRpZXMgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKTtcbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuZXhwb3J0cy5jcmVhdGUgPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5jcmVhdGUgOiBjcmVhdGU7XG5cbi8vIE9iamVjdC5rZXlzIGFuZCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyBpcyBzdXBwb3J0ZWQgaW4gSUU5IGhvd2V2ZXJcbi8vIHRoZXkgZG8gc2hvdyBhIGRlc2NyaXB0aW9uIGFuZCBudW1iZXIgcHJvcGVydHkgb24gRXJyb3Igb2JqZWN0c1xuZnVuY3Rpb24gbm90T2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gKCh0eXBlb2Ygb2JqZWN0ICE9IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iamVjdCAhPSBcImZ1bmN0aW9uXCIpIHx8IG9iamVjdCA9PT0gbnVsbCk7XG59XG5cbmZ1bmN0aW9uIGtleXNTaGltKG9iamVjdCkge1xuICBpZiAobm90T2JqZWN0KG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0LmtleXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgbmFtZSBpbiBvYmplY3QpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIG5hbWUpKSB7XG4gICAgICByZXN1bHQucHVzaChuYW1lKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gZ2V0T3duUHJvcGVydHlOYW1lcyBpcyBhbG1vc3QgdGhlIHNhbWUgYXMgT2JqZWN0LmtleXMgb25lIGtleSBmZWF0dXJlXG4vLyAgaXMgdGhhdCBpdCByZXR1cm5zIGhpZGRlbiBwcm9wZXJ0aWVzLCBzaW5jZSB0aGF0IGNhbid0IGJlIGltcGxlbWVudGVkLFxuLy8gIHRoaXMgZmVhdHVyZSBnZXRzIHJlZHVjZWQgc28gaXQganVzdCBzaG93cyB0aGUgbGVuZ3RoIHByb3BlcnR5IG9uIGFycmF5c1xuZnVuY3Rpb24gcHJvcGVydHlTaGltKG9iamVjdCkge1xuICBpZiAobm90T2JqZWN0KG9iamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdFwiKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBrZXlzU2hpbShvYmplY3QpO1xuICBpZiAoZXhwb3J0cy5pc0FycmF5KG9iamVjdCkgJiYgZXhwb3J0cy5pbmRleE9mKG9iamVjdCwgJ2xlbmd0aCcpID09PSAtMSkge1xuICAgIHJlc3VsdC5wdXNoKCdsZW5ndGgnKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIga2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5rZXlzIDoga2V5c1NoaW07XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lcyA9IHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA9PT0gJ2Z1bmN0aW9uJyA/XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIDogcHJvcGVydHlTaGltO1xuXG5pZiAobmV3IEVycm9yKCkuaGFzT3duUHJvcGVydHkoJ2Rlc2NyaXB0aW9uJykpIHtcbiAgdmFyIEVSUk9SX1BST1BFUlRZX0ZJTFRFUiA9IGZ1bmN0aW9uIChvYmosIGFycmF5KSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRXJyb3JdJykge1xuICAgICAgYXJyYXkgPSBleHBvcnRzLmZpbHRlcihhcnJheSwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWUgIT09ICdkZXNjcmlwdGlvbicgJiYgbmFtZSAhPT0gJ251bWJlcicgJiYgbmFtZSAhPT0gJ21lc3NhZ2UnO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIEVSUk9SX1BST1BFUlRZX0ZJTFRFUihvYmplY3QsIGtleXMob2JqZWN0KSk7XG4gIH07XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gRVJST1JfUFJPUEVSVFlfRklMVEVSKG9iamVjdCwgZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIGV4cG9ydHMua2V5cyA9IGtleXM7XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlOYW1lcyA9IGdldE93blByb3BlcnR5TmFtZXM7XG59XG5cbi8vIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgLSBzdXBwb3J0ZWQgaW4gSUU4IGJ1dCBvbmx5IG9uIGRvbSBlbGVtZW50c1xuZnVuY3Rpb24gdmFsdWVPYmplY3QodmFsdWUsIGtleSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWVba2V5XSB9O1xufVxuXG5pZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgdHJ5IHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHsnYSc6IDF9LCAnYScpO1xuICAgIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElFOCBkb20gZWxlbWVudCBpc3N1ZSAtIHVzZSBhIHRyeSBjYXRjaCBhbmQgZGVmYXVsdCB0byB2YWx1ZU9iamVjdFxuICAgIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdmFsdWVPYmplY3QodmFsdWUsIGtleSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSBlbHNlIHtcbiAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSB2YWx1ZU9iamVjdDtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBhIGR1cGxleCBzdHJlYW0gaXMganVzdCBhIHN0cmVhbSB0aGF0IGlzIGJvdGggcmVhZGFibGUgYW5kIHdyaXRhYmxlLlxuLy8gU2luY2UgSlMgZG9lc24ndCBoYXZlIG11bHRpcGxlIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UsIHRoaXMgY2xhc3Ncbi8vIHByb3RvdHlwYWxseSBpbmhlcml0cyBmcm9tIFJlYWRhYmxlLCBhbmQgdGhlbiBwYXJhc2l0aWNhbGx5IGZyb21cbi8vIFdyaXRhYmxlLlxuXG5tb2R1bGUuZXhwb3J0cyA9IER1cGxleDtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIHNoaW1zID0gcmVxdWlyZSgnX3NoaW1zJyk7XG52YXIgdGltZXJzID0gcmVxdWlyZSgndGltZXJzJyk7XG52YXIgUmVhZGFibGUgPSByZXF1aXJlKCdfc3RyZWFtX3JlYWRhYmxlJyk7XG52YXIgV3JpdGFibGUgPSByZXF1aXJlKCdfc3RyZWFtX3dyaXRhYmxlJyk7XG5cbnV0aWwuaW5oZXJpdHMoRHVwbGV4LCBSZWFkYWJsZSk7XG5cbnNoaW1zLmZvckVhY2goc2hpbXMua2V5cyhXcml0YWJsZS5wcm90b3R5cGUpLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgaWYgKCFEdXBsZXgucHJvdG90eXBlW21ldGhvZF0pXG4gICAgRHVwbGV4LnByb3RvdHlwZVttZXRob2RdID0gV3JpdGFibGUucHJvdG90eXBlW21ldGhvZF07XG59KTtcblxuZnVuY3Rpb24gRHVwbGV4KG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIER1cGxleCkpXG4gICAgcmV0dXJuIG5ldyBEdXBsZXgob3B0aW9ucyk7XG5cbiAgUmVhZGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgV3JpdGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlYWRhYmxlID09PSBmYWxzZSlcbiAgICB0aGlzLnJlYWRhYmxlID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy53cml0YWJsZSA9PT0gZmFsc2UpXG4gICAgdGhpcy53cml0YWJsZSA9IGZhbHNlO1xuXG4gIHRoaXMuYWxsb3dIYWxmT3BlbiA9IHRydWU7XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYWxsb3dIYWxmT3BlbiA9PT0gZmFsc2UpXG4gICAgdGhpcy5hbGxvd0hhbGZPcGVuID0gZmFsc2U7XG5cbiAgdGhpcy5vbmNlKCdlbmQnLCBvbmVuZCk7XG59XG5cbi8vIHRoZSBuby1oYWxmLW9wZW4gZW5mb3JjZXJcbmZ1bmN0aW9uIG9uZW5kKCkge1xuICAvLyBpZiB3ZSBhbGxvdyBoYWxmLW9wZW4gc3RhdGUsIG9yIGlmIHRoZSB3cml0YWJsZSBzaWRlIGVuZGVkLFxuICAvLyB0aGVuIHdlJ3JlIG9rLlxuICBpZiAodGhpcy5hbGxvd0hhbGZPcGVuIHx8IHRoaXMuX3dyaXRhYmxlU3RhdGUuZW5kZWQpXG4gICAgcmV0dXJuO1xuXG4gIC8vIG5vIG1vcmUgZGF0YSBjYW4gYmUgd3JpdHRlbi5cbiAgLy8gQnV0IGFsbG93IG1vcmUgd3JpdGVzIHRvIGhhcHBlbiBpbiB0aGlzIHRpY2suXG4gIHRpbWVycy5zZXRJbW1lZGlhdGUoc2hpbXMuYmluZCh0aGlzLmVuZCwgdGhpcykpO1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIGEgcGFzc3Rocm91Z2ggc3RyZWFtLlxuLy8gYmFzaWNhbGx5IGp1c3QgdGhlIG1vc3QgbWluaW1hbCBzb3J0IG9mIFRyYW5zZm9ybSBzdHJlYW0uXG4vLyBFdmVyeSB3cml0dGVuIGNodW5rIGdldHMgb3V0cHV0IGFzLWlzLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhc3NUaHJvdWdoO1xuXG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnX3N0cmVhbV90cmFuc2Zvcm0nKTtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudXRpbC5pbmhlcml0cyhQYXNzVGhyb3VnaCwgVHJhbnNmb3JtKTtcblxuZnVuY3Rpb24gUGFzc1Rocm91Z2gob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUGFzc1Rocm91Z2gpKVxuICAgIHJldHVybiBuZXcgUGFzc1Rocm91Z2gob3B0aW9ucyk7XG5cbiAgVHJhbnNmb3JtLmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5cblBhc3NUaHJvdWdoLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjYihudWxsLCBjaHVuayk7XG59O1xuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpOy8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWRhYmxlO1xuUmVhZGFibGUuUmVhZGFibGVTdGF0ZSA9IFJlYWRhYmxlU3RhdGU7XG5cbnZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbnZhciBzaGltcyA9IHJlcXVpcmUoJ19zaGltcycpO1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbnZhciB0aW1lcnMgPSByZXF1aXJlKCd0aW1lcnMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIFN0cmluZ0RlY29kZXI7XG5cbnV0aWwuaW5oZXJpdHMoUmVhZGFibGUsIFN0cmVhbSk7XG5cbmZ1bmN0aW9uIFJlYWRhYmxlU3RhdGUob3B0aW9ucywgc3RyZWFtKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIHRoZSBwb2ludCBhdCB3aGljaCBpdCBzdG9wcyBjYWxsaW5nIF9yZWFkKCkgdG8gZmlsbCB0aGUgYnVmZmVyXG4gIC8vIE5vdGU6IDAgaXMgYSB2YWxpZCB2YWx1ZSwgbWVhbnMgXCJkb24ndCBjYWxsIF9yZWFkIHByZWVtcHRpdmVseSBldmVyXCJcbiAgdmFyIGh3bSA9IG9wdGlvbnMuaGlnaFdhdGVyTWFyaztcbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gKGh3bSB8fCBod20gPT09IDApID8gaHdtIDogMTYgKiAxMDI0O1xuXG4gIC8vIGNhc3QgdG8gaW50cy5cbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gfn50aGlzLmhpZ2hXYXRlck1hcms7XG5cbiAgdGhpcy5idWZmZXIgPSBbXTtcbiAgdGhpcy5sZW5ndGggPSAwO1xuICB0aGlzLnBpcGVzID0gbnVsbDtcbiAgdGhpcy5waXBlc0NvdW50ID0gMDtcbiAgdGhpcy5mbG93aW5nID0gZmFsc2U7XG4gIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgdGhpcy5lbmRFbWl0dGVkID0gZmFsc2U7XG4gIHRoaXMucmVhZGluZyA9IGZhbHNlO1xuXG4gIC8vIEluIHN0cmVhbXMgdGhhdCBuZXZlciBoYXZlIGFueSBkYXRhLCBhbmQgZG8gcHVzaChudWxsKSByaWdodCBhd2F5LFxuICAvLyB0aGUgY29uc3VtZXIgY2FuIG1pc3MgdGhlICdlbmQnIGV2ZW50IGlmIHRoZXkgZG8gc29tZSBJL08gYmVmb3JlXG4gIC8vIGNvbnN1bWluZyB0aGUgc3RyZWFtLiAgU28sIHdlIGRvbid0IGVtaXQoJ2VuZCcpIHVudGlsIHNvbWUgcmVhZGluZ1xuICAvLyBoYXBwZW5zLlxuICB0aGlzLmNhbGxlZFJlYWQgPSBmYWxzZTtcblxuICAvLyBhIGZsYWcgdG8gYmUgYWJsZSB0byB0ZWxsIGlmIHRoZSBvbndyaXRlIGNiIGlzIGNhbGxlZCBpbW1lZGlhdGVseSxcbiAgLy8gb3Igb24gYSBsYXRlciB0aWNrLiAgV2Ugc2V0IHRoaXMgdG8gdHJ1ZSBhdCBmaXJzdCwgYmVjdWFzZSBhbnlcbiAgLy8gYWN0aW9ucyB0aGF0IHNob3VsZG4ndCBoYXBwZW4gdW50aWwgXCJsYXRlclwiIHNob3VsZCBnZW5lcmFsbHkgYWxzb1xuICAvLyBub3QgaGFwcGVuIGJlZm9yZSB0aGUgZmlyc3Qgd3JpdGUgY2FsbC5cbiAgdGhpcy5zeW5jID0gdHJ1ZTtcblxuICAvLyB3aGVuZXZlciB3ZSByZXR1cm4gbnVsbCwgdGhlbiB3ZSBzZXQgYSBmbGFnIHRvIHNheVxuICAvLyB0aGF0IHdlJ3JlIGF3YWl0aW5nIGEgJ3JlYWRhYmxlJyBldmVudCBlbWlzc2lvbi5cbiAgdGhpcy5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5yZWFkYWJsZUxpc3RlbmluZyA9IGZhbHNlO1xuXG5cbiAgLy8gb2JqZWN0IHN0cmVhbSBmbGFnLiBVc2VkIHRvIG1ha2UgcmVhZChuKSBpZ25vcmUgbiBhbmQgdG9cbiAgLy8gbWFrZSBhbGwgdGhlIGJ1ZmZlciBtZXJnaW5nIGFuZCBsZW5ndGggY2hlY2tzIGdvIGF3YXlcbiAgdGhpcy5vYmplY3RNb2RlID0gISFvcHRpb25zLm9iamVjdE1vZGU7XG5cbiAgLy8gQ3J5cHRvIGlzIGtpbmQgb2Ygb2xkIGFuZCBjcnVzdHkuICBIaXN0b3JpY2FsbHksIGl0cyBkZWZhdWx0IHN0cmluZ1xuICAvLyBlbmNvZGluZyBpcyAnYmluYXJ5JyBzbyB3ZSBoYXZlIHRvIG1ha2UgdGhpcyBjb25maWd1cmFibGUuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgdW5pdmVyc2UgdXNlcyAndXRmOCcsIHRob3VnaC5cbiAgdGhpcy5kZWZhdWx0RW5jb2RpbmcgPSBvcHRpb25zLmRlZmF1bHRFbmNvZGluZyB8fCAndXRmOCc7XG5cbiAgLy8gd2hlbiBwaXBpbmcsIHdlIG9ubHkgY2FyZSBhYm91dCAncmVhZGFibGUnIGV2ZW50cyB0aGF0IGhhcHBlblxuICAvLyBhZnRlciByZWFkKClpbmcgYWxsIHRoZSBieXRlcyBhbmQgbm90IGdldHRpbmcgYW55IHB1c2hiYWNrLlxuICB0aGlzLnJhbk91dCA9IGZhbHNlO1xuXG4gIC8vIHRoZSBudW1iZXIgb2Ygd3JpdGVycyB0aGF0IGFyZSBhd2FpdGluZyBhIGRyYWluIGV2ZW50IGluIC5waXBlKClzXG4gIHRoaXMuYXdhaXREcmFpbiA9IDA7XG5cbiAgLy8gaWYgdHJ1ZSwgYSBtYXliZVJlYWRNb3JlIGhhcyBiZWVuIHNjaGVkdWxlZFxuICB0aGlzLnJlYWRpbmdNb3JlID0gZmFsc2U7XG5cbiAgdGhpcy5kZWNvZGVyID0gbnVsbDtcbiAgdGhpcy5lbmNvZGluZyA9IG51bGw7XG4gIGlmIChvcHRpb25zLmVuY29kaW5nKSB7XG4gICAgaWYgKCFTdHJpbmdEZWNvZGVyKVxuICAgICAgU3RyaW5nRGVjb2RlciA9IHJlcXVpcmUoJ3N0cmluZ19kZWNvZGVyJykuU3RyaW5nRGVjb2RlcjtcbiAgICB0aGlzLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcihvcHRpb25zLmVuY29kaW5nKTtcbiAgICB0aGlzLmVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBSZWFkYWJsZShvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZWFkYWJsZSkpXG4gICAgcmV0dXJuIG5ldyBSZWFkYWJsZShvcHRpb25zKTtcblxuICB0aGlzLl9yZWFkYWJsZVN0YXRlID0gbmV3IFJlYWRhYmxlU3RhdGUob3B0aW9ucywgdGhpcyk7XG5cbiAgLy8gbGVnYWN5XG4gIHRoaXMucmVhZGFibGUgPSB0cnVlO1xuXG4gIFN0cmVhbS5jYWxsKHRoaXMpO1xufVxuXG4vLyBNYW51YWxseSBzaG92ZSBzb21ldGhpbmcgaW50byB0aGUgcmVhZCgpIGJ1ZmZlci5cbi8vIFRoaXMgcmV0dXJucyB0cnVlIGlmIHRoZSBoaWdoV2F0ZXJNYXJrIGhhcyBub3QgYmVlbiBoaXQgeWV0LFxuLy8gc2ltaWxhciB0byBob3cgV3JpdGFibGUud3JpdGUoKSByZXR1cm5zIHRydWUgaWYgeW91IHNob3VsZFxuLy8gd3JpdGUoKSBzb21lIG1vcmUuXG5SZWFkYWJsZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGNodW5rLCBlbmNvZGluZykge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuXG4gIGlmICh0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnICYmICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgZW5jb2RpbmcgPSBlbmNvZGluZyB8fCBzdGF0ZS5kZWZhdWx0RW5jb2Rpbmc7XG4gICAgaWYgKGVuY29kaW5nICE9PSBzdGF0ZS5lbmNvZGluZykge1xuICAgICAgY2h1bmsgPSBuZXcgQnVmZmVyKGNodW5rLCBlbmNvZGluZyk7XG4gICAgICBlbmNvZGluZyA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGZhbHNlKTtcbn07XG5cbi8vIFVuc2hpZnQgc2hvdWxkICphbHdheXMqIGJlIHNvbWV0aGluZyBkaXJlY3RseSBvdXQgb2YgcmVhZCgpXG5SZWFkYWJsZS5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uKGNodW5rKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHJldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsIHN0YXRlLCBjaHVuaywgJycsIHRydWUpO1xufTtcblxuZnVuY3Rpb24gcmVhZGFibGVBZGRDaHVuayhzdHJlYW0sIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGFkZFRvRnJvbnQpIHtcbiAgdmFyIGVyID0gY2h1bmtJbnZhbGlkKHN0YXRlLCBjaHVuayk7XG4gIGlmIChlcikge1xuICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgfSBlbHNlIGlmIChjaHVuayA9PT0gbnVsbCB8fCBjaHVuayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhdGUucmVhZGluZyA9IGZhbHNlO1xuICAgIGlmICghc3RhdGUuZW5kZWQpXG4gICAgICBvbkVvZkNodW5rKHN0cmVhbSwgc3RhdGUpO1xuICB9IGVsc2UgaWYgKHN0YXRlLm9iamVjdE1vZGUgfHwgY2h1bmsgJiYgY2h1bmsubGVuZ3RoID4gMCkge1xuICAgIGlmIChzdGF0ZS5lbmRlZCAmJiAhYWRkVG9Gcm9udCkge1xuICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoJ3N0cmVhbS5wdXNoKCkgYWZ0ZXIgRU9GJyk7XG4gICAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmVuZEVtaXR0ZWQgJiYgYWRkVG9Gcm9udCkge1xuICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoJ3N0cmVhbS51bnNoaWZ0KCkgYWZ0ZXIgZW5kIGV2ZW50Jyk7XG4gICAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXRlLmRlY29kZXIgJiYgIWFkZFRvRnJvbnQgJiYgIWVuY29kaW5nKVxuICAgICAgICBjaHVuayA9IHN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIGJ1ZmZlciBpbmZvLlxuICAgICAgc3RhdGUubGVuZ3RoICs9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuICAgICAgaWYgKGFkZFRvRnJvbnQpIHtcbiAgICAgICAgc3RhdGUuYnVmZmVyLnVuc2hpZnQoY2h1bmspO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucmVhZGluZyA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZS5uZWVkUmVhZGFibGUpXG4gICAgICAgIGVtaXRSZWFkYWJsZShzdHJlYW0pO1xuXG4gICAgICBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cbiAgfSBlbHNlIGlmICghYWRkVG9Gcm9udCkge1xuICAgIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBuZWVkTW9yZURhdGEoc3RhdGUpO1xufVxuXG5cblxuLy8gaWYgaXQncyBwYXN0IHRoZSBoaWdoIHdhdGVyIG1hcmssIHdlIGNhbiBwdXNoIGluIHNvbWUgbW9yZS5cbi8vIEFsc28sIGlmIHdlIGhhdmUgbm8gZGF0YSB5ZXQsIHdlIGNhbiBzdGFuZCBzb21lXG4vLyBtb3JlIGJ5dGVzLiAgVGhpcyBpcyB0byB3b3JrIGFyb3VuZCBjYXNlcyB3aGVyZSBod209MCxcbi8vIHN1Y2ggYXMgdGhlIHJlcGwuICBBbHNvLCBpZiB0aGUgcHVzaCgpIHRyaWdnZXJlZCBhXG4vLyByZWFkYWJsZSBldmVudCwgYW5kIHRoZSB1c2VyIGNhbGxlZCByZWFkKGxhcmdlTnVtYmVyKSBzdWNoIHRoYXRcbi8vIG5lZWRSZWFkYWJsZSB3YXMgc2V0LCB0aGVuIHdlIG91Z2h0IHRvIHB1c2ggbW9yZSwgc28gdGhhdCBhbm90aGVyXG4vLyAncmVhZGFibGUnIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkLlxuZnVuY3Rpb24gbmVlZE1vcmVEYXRhKHN0YXRlKSB7XG4gIHJldHVybiAhc3RhdGUuZW5kZWQgJiZcbiAgICAgICAgIChzdGF0ZS5uZWVkUmVhZGFibGUgfHxcbiAgICAgICAgICBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrIHx8XG4gICAgICAgICAgc3RhdGUubGVuZ3RoID09PSAwKTtcbn1cblxuLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5SZWFkYWJsZS5wcm90b3R5cGUuc2V0RW5jb2RpbmcgPSBmdW5jdGlvbihlbmMpIHtcbiAgaWYgKCFTdHJpbmdEZWNvZGVyKVxuICAgIFN0cmluZ0RlY29kZXIgPSByZXF1aXJlKCdzdHJpbmdfZGVjb2RlcicpLlN0cmluZ0RlY29kZXI7XG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKGVuYyk7XG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuZW5jb2RpbmcgPSBlbmM7XG59O1xuXG4vLyBEb24ndCByYWlzZSB0aGUgaHdtID4gMTI4TUJcbnZhciBNQVhfSFdNID0gMHg4MDAwMDA7XG5mdW5jdGlvbiByb3VuZFVwVG9OZXh0UG93ZXJPZjIobikge1xuICBpZiAobiA+PSBNQVhfSFdNKSB7XG4gICAgbiA9IE1BWF9IV007XG4gIH0gZWxzZSB7XG4gICAgLy8gR2V0IHRoZSBuZXh0IGhpZ2hlc3QgcG93ZXIgb2YgMlxuICAgIG4tLTtcbiAgICBmb3IgKHZhciBwID0gMTsgcCA8IDMyOyBwIDw8PSAxKSBuIHw9IG4gPj4gcDtcbiAgICBuKys7XG4gIH1cbiAgcmV0dXJuIG47XG59XG5cbmZ1bmN0aW9uIGhvd011Y2hUb1JlYWQobiwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5lbmRlZClcbiAgICByZXR1cm4gMDtcblxuICBpZiAoc3RhdGUub2JqZWN0TW9kZSlcbiAgICByZXR1cm4gbiA9PT0gMCA/IDAgOiAxO1xuXG4gIGlmIChpc05hTihuKSB8fCBuID09PSBudWxsKSB7XG4gICAgLy8gb25seSBmbG93IG9uZSBidWZmZXIgYXQgYSB0aW1lXG4gICAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgc3RhdGUuYnVmZmVyLmxlbmd0aClcbiAgICAgIHJldHVybiBzdGF0ZS5idWZmZXJbMF0ubGVuZ3RoO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBzdGF0ZS5sZW5ndGg7XG4gIH1cblxuICBpZiAobiA8PSAwKVxuICAgIHJldHVybiAwO1xuXG4gIC8vIElmIHdlJ3JlIGFza2luZyBmb3IgbW9yZSB0aGFuIHRoZSB0YXJnZXQgYnVmZmVyIGxldmVsLFxuICAvLyB0aGVuIHJhaXNlIHRoZSB3YXRlciBtYXJrLiAgQnVtcCB1cCB0byB0aGUgbmV4dCBoaWdoZXN0XG4gIC8vIHBvd2VyIG9mIDIsIHRvIHByZXZlbnQgaW5jcmVhc2luZyBpdCBleGNlc3NpdmVseSBpbiB0aW55XG4gIC8vIGFtb3VudHMuXG4gIGlmIChuID4gc3RhdGUuaGlnaFdhdGVyTWFyaylcbiAgICBzdGF0ZS5oaWdoV2F0ZXJNYXJrID0gcm91bmRVcFRvTmV4dFBvd2VyT2YyKG4pO1xuXG4gIC8vIGRvbid0IGhhdmUgdGhhdCBtdWNoLiAgcmV0dXJuIG51bGwsIHVubGVzcyB3ZSd2ZSBlbmRlZC5cbiAgaWYgKG4gPiBzdGF0ZS5sZW5ndGgpIHtcbiAgICBpZiAoIXN0YXRlLmVuZGVkKSB7XG4gICAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlXG4gICAgICByZXR1cm4gc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIG47XG59XG5cbi8vIHlvdSBjYW4gb3ZlcnJpZGUgZWl0aGVyIHRoaXMgbWV0aG9kLCBvciB0aGUgYXN5bmMgX3JlYWQobikgYmVsb3cuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKG4pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgc3RhdGUuY2FsbGVkUmVhZCA9IHRydWU7XG4gIHZhciBuT3JpZyA9IG47XG5cbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuID4gMClcbiAgICBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcblxuICAvLyBpZiB3ZSdyZSBkb2luZyByZWFkKDApIHRvIHRyaWdnZXIgYSByZWFkYWJsZSBldmVudCwgYnV0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhIGJ1bmNoIG9mIGRhdGEgaW4gdGhlIGJ1ZmZlciwgdGhlbiBqdXN0IHRyaWdnZXJcbiAgLy8gdGhlICdyZWFkYWJsZScgZXZlbnQgYW5kIG1vdmUgb24uXG4gIGlmIChuID09PSAwICYmXG4gICAgICBzdGF0ZS5uZWVkUmVhZGFibGUgJiZcbiAgICAgIChzdGF0ZS5sZW5ndGggPj0gc3RhdGUuaGlnaFdhdGVyTWFyayB8fCBzdGF0ZS5lbmRlZCkpIHtcbiAgICBlbWl0UmVhZGFibGUodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBuID0gaG93TXVjaFRvUmVhZChuLCBzdGF0ZSk7XG5cbiAgLy8gaWYgd2UndmUgZW5kZWQsIGFuZCB3ZSdyZSBub3cgY2xlYXIsIHRoZW4gZmluaXNoIGl0IHVwLlxuICBpZiAobiA9PT0gMCAmJiBzdGF0ZS5lbmRlZCkge1xuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDApXG4gICAgICBlbmRSZWFkYWJsZSh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIEFsbCB0aGUgYWN0dWFsIGNodW5rIGdlbmVyYXRpb24gbG9naWMgbmVlZHMgdG8gYmVcbiAgLy8gKmJlbG93KiB0aGUgY2FsbCB0byBfcmVhZC4gIFRoZSByZWFzb24gaXMgdGhhdCBpbiBjZXJ0YWluXG4gIC8vIHN5bnRoZXRpYyBzdHJlYW0gY2FzZXMsIHN1Y2ggYXMgcGFzc3Rocm91Z2ggc3RyZWFtcywgX3JlYWRcbiAgLy8gbWF5IGJlIGEgY29tcGxldGVseSBzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hpY2ggbWF5IGNoYW5nZVxuICAvLyB0aGUgc3RhdGUgb2YgdGhlIHJlYWQgYnVmZmVyLCBwcm92aWRpbmcgZW5vdWdoIGRhdGEgd2hlblxuICAvLyBiZWZvcmUgdGhlcmUgd2FzICpub3QqIGVub3VnaC5cbiAgLy9cbiAgLy8gU28sIHRoZSBzdGVwcyBhcmU6XG4gIC8vIDEuIEZpZ3VyZSBvdXQgd2hhdCB0aGUgc3RhdGUgb2YgdGhpbmdzIHdpbGwgYmUgYWZ0ZXIgd2UgZG9cbiAgLy8gYSByZWFkIGZyb20gdGhlIGJ1ZmZlci5cbiAgLy9cbiAgLy8gMi4gSWYgdGhhdCByZXN1bHRpbmcgc3RhdGUgd2lsbCB0cmlnZ2VyIGEgX3JlYWQsIHRoZW4gY2FsbCBfcmVhZC5cbiAgLy8gTm90ZSB0aGF0IHRoaXMgbWF5IGJlIGFzeW5jaHJvbm91cywgb3Igc3luY2hyb25vdXMuICBZZXMsIGl0IGlzXG4gIC8vIGRlZXBseSB1Z2x5IHRvIHdyaXRlIEFQSXMgdGhpcyB3YXksIGJ1dCB0aGF0IHN0aWxsIGRvZXNuJ3QgbWVhblxuICAvLyB0aGF0IHRoZSBSZWFkYWJsZSBjbGFzcyBzaG91bGQgYmVoYXZlIGltcHJvcGVybHksIGFzIHN0cmVhbXMgYXJlXG4gIC8vIGRlc2lnbmVkIHRvIGJlIHN5bmMvYXN5bmMgYWdub3N0aWMuXG4gIC8vIFRha2Ugbm90ZSBpZiB0aGUgX3JlYWQgY2FsbCBpcyBzeW5jIG9yIGFzeW5jIChpZSwgaWYgdGhlIHJlYWQgY2FsbFxuICAvLyBoYXMgcmV0dXJuZWQgeWV0KSwgc28gdGhhdCB3ZSBrbm93IHdoZXRoZXIgb3Igbm90IGl0J3Mgc2FmZSB0byBlbWl0XG4gIC8vICdyZWFkYWJsZScgZXRjLlxuICAvL1xuICAvLyAzLiBBY3R1YWxseSBwdWxsIHRoZSByZXF1ZXN0ZWQgY2h1bmtzIG91dCBvZiB0aGUgYnVmZmVyIGFuZCByZXR1cm4uXG5cbiAgLy8gaWYgd2UgbmVlZCBhIHJlYWRhYmxlIGV2ZW50LCB0aGVuIHdlIG5lZWQgdG8gZG8gc29tZSByZWFkaW5nLlxuICB2YXIgZG9SZWFkID0gc3RhdGUubmVlZFJlYWRhYmxlO1xuXG4gIC8vIGlmIHdlIGN1cnJlbnRseSBoYXZlIGxlc3MgdGhhbiB0aGUgaGlnaFdhdGVyTWFyaywgdGhlbiBhbHNvIHJlYWQgc29tZVxuICBpZiAoc3RhdGUubGVuZ3RoIC0gbiA8PSBzdGF0ZS5oaWdoV2F0ZXJNYXJrKVxuICAgIGRvUmVhZCA9IHRydWU7XG5cbiAgLy8gaG93ZXZlciwgaWYgd2UndmUgZW5kZWQsIHRoZW4gdGhlcmUncyBubyBwb2ludCwgYW5kIGlmIHdlJ3JlIGFscmVhZHlcbiAgLy8gcmVhZGluZywgdGhlbiBpdCdzIHVubmVjZXNzYXJ5LlxuICBpZiAoc3RhdGUuZW5kZWQgfHwgc3RhdGUucmVhZGluZylcbiAgICBkb1JlYWQgPSBmYWxzZTtcblxuICBpZiAoZG9SZWFkKSB7XG4gICAgc3RhdGUucmVhZGluZyA9IHRydWU7XG4gICAgc3RhdGUuc3luYyA9IHRydWU7XG4gICAgLy8gaWYgdGhlIGxlbmd0aCBpcyBjdXJyZW50bHkgemVybywgdGhlbiB3ZSAqbmVlZCogYSByZWFkYWJsZSBldmVudC5cbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKVxuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAvLyBjYWxsIGludGVybmFsIHJlYWQgbWV0aG9kXG4gICAgdGhpcy5fcmVhZChzdGF0ZS5oaWdoV2F0ZXJNYXJrKTtcbiAgICBzdGF0ZS5zeW5jID0gZmFsc2U7XG4gIH1cblxuICAvLyBJZiBfcmVhZCBjYWxsZWQgaXRzIGNhbGxiYWNrIHN5bmNocm9ub3VzbHksIHRoZW4gYHJlYWRpbmdgXG4gIC8vIHdpbGwgYmUgZmFsc2UsIGFuZCB3ZSBuZWVkIHRvIHJlLWV2YWx1YXRlIGhvdyBtdWNoIGRhdGEgd2VcbiAgLy8gY2FuIHJldHVybiB0byB0aGUgdXNlci5cbiAgaWYgKGRvUmVhZCAmJiAhc3RhdGUucmVhZGluZylcbiAgICBuID0gaG93TXVjaFRvUmVhZChuT3JpZywgc3RhdGUpO1xuXG4gIHZhciByZXQ7XG4gIGlmIChuID4gMClcbiAgICByZXQgPSBmcm9tTGlzdChuLCBzdGF0ZSk7XG4gIGVsc2VcbiAgICByZXQgPSBudWxsO1xuXG4gIGlmIChyZXQgPT09IG51bGwpIHtcbiAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgIG4gPSAwO1xuICB9XG5cbiAgc3RhdGUubGVuZ3RoIC09IG47XG5cbiAgLy8gSWYgd2UgaGF2ZSBub3RoaW5nIGluIHRoZSBidWZmZXIsIHRoZW4gd2Ugd2FudCB0byBrbm93XG4gIC8vIGFzIHNvb24gYXMgd2UgKmRvKiBnZXQgc29tZXRoaW5nIGludG8gdGhlIGJ1ZmZlci5cbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiAhc3RhdGUuZW5kZWQpXG4gICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcblxuICAvLyBJZiB3ZSBoYXBwZW5lZCB0byByZWFkKCkgZXhhY3RseSB0aGUgcmVtYWluaW5nIGFtb3VudCBpbiB0aGVcbiAgLy8gYnVmZmVyLCBhbmQgdGhlIEVPRiBoYXMgYmVlbiBzZWVuIGF0IHRoaXMgcG9pbnQsIHRoZW4gbWFrZSBzdXJlXG4gIC8vIHRoYXQgd2UgZW1pdCAnZW5kJyBvbiB0aGUgdmVyeSBuZXh0IHRpY2suXG4gIGlmIChzdGF0ZS5lbmRlZCAmJiAhc3RhdGUuZW5kRW1pdHRlZCAmJiBzdGF0ZS5sZW5ndGggPT09IDApXG4gICAgZW5kUmVhZGFibGUodGhpcyk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGNodW5rSW52YWxpZChzdGF0ZSwgY2h1bmspIHtcbiAgdmFyIGVyID0gbnVsbDtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoY2h1bmspICYmXG4gICAgICAnc3RyaW5nJyAhPT0gdHlwZW9mIGNodW5rICYmXG4gICAgICBjaHVuayAhPT0gbnVsbCAmJlxuICAgICAgY2h1bmsgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgIXN0YXRlLm9iamVjdE1vZGUgJiZcbiAgICAgICFlcikge1xuICAgIGVyID0gbmV3IFR5cGVFcnJvcignSW52YWxpZCBub24tc3RyaW5nL2J1ZmZlciBjaHVuaycpO1xuICB9XG4gIHJldHVybiBlcjtcbn1cblxuXG5mdW5jdGlvbiBvbkVvZkNodW5rKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmRlY29kZXIgJiYgIXN0YXRlLmVuZGVkKSB7XG4gICAgdmFyIGNodW5rID0gc3RhdGUuZGVjb2Rlci5lbmQoKTtcbiAgICBpZiAoY2h1bmsgJiYgY2h1bmsubGVuZ3RoKSB7XG4gICAgICBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7XG4gICAgICBzdGF0ZS5sZW5ndGggKz0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG4gICAgfVxuICB9XG4gIHN0YXRlLmVuZGVkID0gdHJ1ZTtcblxuICAvLyBpZiB3ZSd2ZSBlbmRlZCBhbmQgd2UgaGF2ZSBzb21lIGRhdGEgbGVmdCwgdGhlbiBlbWl0XG4gIC8vICdyZWFkYWJsZScgbm93IHRvIG1ha2Ugc3VyZSBpdCBnZXRzIHBpY2tlZCB1cC5cbiAgaWYgKHN0YXRlLmxlbmd0aCA+IDApXG4gICAgZW1pdFJlYWRhYmxlKHN0cmVhbSk7XG4gIGVsc2VcbiAgICBlbmRSZWFkYWJsZShzdHJlYW0pO1xufVxuXG4vLyBEb24ndCBlbWl0IHJlYWRhYmxlIHJpZ2h0IGF3YXkgaW4gc3luYyBtb2RlLCBiZWNhdXNlIHRoaXMgY2FuIHRyaWdnZXJcbi8vIGFub3RoZXIgcmVhZCgpIGNhbGwgPT4gc3RhY2sgb3ZlcmZsb3cuICBUaGlzIHdheSwgaXQgbWlnaHQgdHJpZ2dlclxuLy8gYSBuZXh0VGljayByZWN1cnNpb24gd2FybmluZywgYnV0IHRoYXQncyBub3Qgc28gYmFkLlxuZnVuY3Rpb24gZW1pdFJlYWRhYmxlKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIHN0YXRlLm5lZWRSZWFkYWJsZSA9IGZhbHNlO1xuICBpZiAoc3RhdGUuZW1pdHRlZFJlYWRhYmxlKVxuICAgIHJldHVybjtcblxuICBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSB0cnVlO1xuICBpZiAoc3RhdGUuc3luYylcbiAgICB0aW1lcnMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgZW1pdFJlYWRhYmxlXyhzdHJlYW0pO1xuICAgIH0pO1xuICBlbHNlXG4gICAgZW1pdFJlYWRhYmxlXyhzdHJlYW0pO1xufVxuXG5mdW5jdGlvbiBlbWl0UmVhZGFibGVfKHN0cmVhbSkge1xuICBzdHJlYW0uZW1pdCgncmVhZGFibGUnKTtcbn1cblxuXG4vLyBhdCB0aGlzIHBvaW50LCB0aGUgdXNlciBoYXMgcHJlc3VtYWJseSBzZWVuIHRoZSAncmVhZGFibGUnIGV2ZW50LFxuLy8gYW5kIGNhbGxlZCByZWFkKCkgdG8gY29uc3VtZSBzb21lIGRhdGEuICB0aGF0IG1heSBoYXZlIHRyaWdnZXJlZFxuLy8gaW4gdHVybiBhbm90aGVyIF9yZWFkKG4pIGNhbGwsIGluIHdoaWNoIGNhc2UgcmVhZGluZyA9IHRydWUgaWZcbi8vIGl0J3MgaW4gcHJvZ3Jlc3MuXG4vLyBIb3dldmVyLCBpZiB3ZSdyZSBub3QgZW5kZWQsIG9yIHJlYWRpbmcsIGFuZCB0aGUgbGVuZ3RoIDwgaHdtLFxuLy8gdGhlbiBnbyBhaGVhZCBhbmQgdHJ5IHRvIHJlYWQgc29tZSBtb3JlIHByZWVtcHRpdmVseS5cbmZ1bmN0aW9uIG1heWJlUmVhZE1vcmUoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoIXN0YXRlLnJlYWRpbmdNb3JlKSB7XG4gICAgc3RhdGUucmVhZGluZ01vcmUgPSB0cnVlO1xuICAgIHRpbWVycy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICBtYXliZVJlYWRNb3JlXyhzdHJlYW0sIHN0YXRlKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXliZVJlYWRNb3JlXyhzdHJlYW0sIHN0YXRlKSB7XG4gIHZhciBsZW4gPSBzdGF0ZS5sZW5ndGg7XG4gIHdoaWxlICghc3RhdGUucmVhZGluZyAmJiAhc3RhdGUuZmxvd2luZyAmJiAhc3RhdGUuZW5kZWQgJiZcbiAgICAgICAgIHN0YXRlLmxlbmd0aCA8IHN0YXRlLmhpZ2hXYXRlck1hcmspIHtcbiAgICBzdHJlYW0ucmVhZCgwKTtcbiAgICBpZiAobGVuID09PSBzdGF0ZS5sZW5ndGgpXG4gICAgICAvLyBkaWRuJ3QgZ2V0IGFueSBkYXRhLCBzdG9wIHNwaW5uaW5nLlxuICAgICAgYnJlYWs7XG4gICAgZWxzZVxuICAgICAgbGVuID0gc3RhdGUubGVuZ3RoO1xuICB9XG4gIHN0YXRlLnJlYWRpbmdNb3JlID0gZmFsc2U7XG59XG5cbi8vIGFic3RyYWN0IG1ldGhvZC4gIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vIGNhbGwgY2IoZXIsIGRhdGEpIHdoZXJlIGRhdGEgaXMgPD0gbiBpbiBsZW5ndGguXG4vLyBmb3IgdmlydHVhbCAobm9uLXN0cmluZywgbm9uLWJ1ZmZlcikgc3RyZWFtcywgXCJsZW5ndGhcIiBpcyBzb21ld2hhdFxuLy8gYXJiaXRyYXJ5LCBhbmQgcGVyaGFwcyBub3QgdmVyeSBtZWFuaW5nZnVsLlxuUmVhZGFibGUucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24obikge1xuICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKSk7XG59O1xuXG5SZWFkYWJsZS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uKGRlc3QsIHBpcGVPcHRzKSB7XG4gIHZhciBzcmMgPSB0aGlzO1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuXG4gIHN3aXRjaCAoc3RhdGUucGlwZXNDb3VudCkge1xuICAgIGNhc2UgMDpcbiAgICAgIHN0YXRlLnBpcGVzID0gZGVzdDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMTpcbiAgICAgIHN0YXRlLnBpcGVzID0gW3N0YXRlLnBpcGVzLCBkZXN0XTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBzdGF0ZS5waXBlcy5wdXNoKGRlc3QpO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgc3RhdGUucGlwZXNDb3VudCArPSAxO1xuXG4gIHZhciBkb0VuZCA9ICghcGlwZU9wdHMgfHwgcGlwZU9wdHMuZW5kICE9PSBmYWxzZSkgJiZcbiAgICAgICAgICAgICAgZGVzdCAhPT0gcHJvY2Vzcy5zdGRvdXQgJiZcbiAgICAgICAgICAgICAgZGVzdCAhPT0gcHJvY2Vzcy5zdGRlcnI7XG5cbiAgdmFyIGVuZEZuID0gZG9FbmQgPyBvbmVuZCA6IGNsZWFudXA7XG4gIGlmIChzdGF0ZS5lbmRFbWl0dGVkKVxuICAgIHRpbWVycy5zZXRJbW1lZGlhdGUoZW5kRm4pO1xuICBlbHNlXG4gICAgc3JjLm9uY2UoJ2VuZCcsIGVuZEZuKTtcblxuICBkZXN0Lm9uKCd1bnBpcGUnLCBvbnVucGlwZSk7XG4gIGZ1bmN0aW9uIG9udW5waXBlKHJlYWRhYmxlKSB7XG4gICAgaWYgKHJlYWRhYmxlICE9PSBzcmMpIHJldHVybjtcbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiBvbmVuZCgpIHtcbiAgICBkZXN0LmVuZCgpO1xuICB9XG5cbiAgLy8gd2hlbiB0aGUgZGVzdCBkcmFpbnMsIGl0IHJlZHVjZXMgdGhlIGF3YWl0RHJhaW4gY291bnRlclxuICAvLyBvbiB0aGUgc291cmNlLiAgVGhpcyB3b3VsZCBiZSBtb3JlIGVsZWdhbnQgd2l0aCBhIC5vbmNlKClcbiAgLy8gaGFuZGxlciBpbiBmbG93KCksIGJ1dCBhZGRpbmcgYW5kIHJlbW92aW5nIHJlcGVhdGVkbHkgaXNcbiAgLy8gdG9vIHNsb3cuXG4gIHZhciBvbmRyYWluID0gcGlwZU9uRHJhaW4oc3JjKTtcbiAgZGVzdC5vbignZHJhaW4nLCBvbmRyYWluKTtcblxuICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgIC8vIGNsZWFudXAgZXZlbnQgaGFuZGxlcnMgb25jZSB0aGUgcGlwZSBpcyBicm9rZW5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcigndW5waXBlJywgb251bnBpcGUpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgY2xlYW51cCk7XG5cbiAgICAvLyBpZiB0aGUgcmVhZGVyIGlzIHdhaXRpbmcgZm9yIGEgZHJhaW4gZXZlbnQgZnJvbSB0aGlzXG4gICAgLy8gc3BlY2lmaWMgd3JpdGVyLCB0aGVuIGl0IHdvdWxkIGNhdXNlIGl0IHRvIG5ldmVyIHN0YXJ0XG4gICAgLy8gZmxvd2luZyBhZ2Fpbi5cbiAgICAvLyBTbywgaWYgdGhpcyBpcyBhd2FpdGluZyBhIGRyYWluLCB0aGVuIHdlIGp1c3QgY2FsbCBpdCBub3cuXG4gICAgLy8gSWYgd2UgZG9uJ3Qga25vdywgdGhlbiBhc3N1bWUgdGhhdCB3ZSBhcmUgd2FpdGluZyBmb3Igb25lLlxuICAgIGlmICghZGVzdC5fd3JpdGFibGVTdGF0ZSB8fCBkZXN0Ll93cml0YWJsZVN0YXRlLm5lZWREcmFpbilcbiAgICAgIG9uZHJhaW4oKTtcbiAgfVxuXG4gIC8vIGlmIHRoZSBkZXN0IGhhcyBhbiBlcnJvciwgdGhlbiBzdG9wIHBpcGluZyBpbnRvIGl0LlxuICAvLyBob3dldmVyLCBkb24ndCBzdXBwcmVzcyB0aGUgdGhyb3dpbmcgYmVoYXZpb3IgZm9yIHRoaXMuXG4gIC8vIGNoZWNrIGZvciBsaXN0ZW5lcnMgYmVmb3JlIGVtaXQgcmVtb3ZlcyBvbmUtdGltZSBsaXN0ZW5lcnMuXG4gIHZhciBlcnJMaXN0ZW5lcnMgPSBFRS5saXN0ZW5lckNvdW50KGRlc3QsICdlcnJvcicpO1xuICBmdW5jdGlvbiBvbmVycm9yKGVyKSB7XG4gICAgdW5waXBlKCk7XG4gICAgaWYgKGVyckxpc3RlbmVycyA9PT0gMCAmJiBFRS5saXN0ZW5lckNvdW50KGRlc3QsICdlcnJvcicpID09PSAwKVxuICAgICAgZGVzdC5lbWl0KCdlcnJvcicsIGVyKTtcbiAgfVxuICBkZXN0Lm9uY2UoJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgLy8gQm90aCBjbG9zZSBhbmQgZmluaXNoIHNob3VsZCB0cmlnZ2VyIHVucGlwZSwgYnV0IG9ubHkgb25jZS5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG4gICAgdW5waXBlKCk7XG4gIH1cbiAgZGVzdC5vbmNlKCdjbG9zZScsIG9uY2xvc2UpO1xuICBmdW5jdGlvbiBvbmZpbmlzaCgpIHtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIHVucGlwZSgpO1xuICB9XG4gIGRlc3Qub25jZSgnZmluaXNoJywgb25maW5pc2gpO1xuXG4gIGZ1bmN0aW9uIHVucGlwZSgpIHtcbiAgICBzcmMudW5waXBlKGRlc3QpO1xuICB9XG5cbiAgLy8gdGVsbCB0aGUgZGVzdCB0aGF0IGl0J3MgYmVpbmcgcGlwZWQgdG9cbiAgZGVzdC5lbWl0KCdwaXBlJywgc3JjKTtcblxuICAvLyBzdGFydCB0aGUgZmxvdyBpZiBpdCBoYXNuJ3QgYmVlbiBzdGFydGVkIGFscmVhZHkuXG4gIGlmICghc3RhdGUuZmxvd2luZykge1xuICAgIC8vIHRoZSBoYW5kbGVyIHRoYXQgd2FpdHMgZm9yIHJlYWRhYmxlIGV2ZW50cyBhZnRlciBhbGxcbiAgICAvLyB0aGUgZGF0YSBnZXRzIHN1Y2tlZCBvdXQgaW4gZmxvdy5cbiAgICAvLyBUaGlzIHdvdWxkIGJlIGVhc2llciB0byBmb2xsb3cgd2l0aCBhIC5vbmNlKCkgaGFuZGxlclxuICAgIC8vIGluIGZsb3coKSwgYnV0IHRoYXQgaXMgdG9vIHNsb3cuXG4gICAgdGhpcy5vbigncmVhZGFibGUnLCBwaXBlT25SZWFkYWJsZSk7XG5cbiAgICBzdGF0ZS5mbG93aW5nID0gdHJ1ZTtcbiAgICB0aW1lcnMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgZmxvdyhzcmMpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG5mdW5jdGlvbiBwaXBlT25EcmFpbihzcmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZXN0ID0gdGhpcztcbiAgICB2YXIgc3RhdGUgPSBzcmMuX3JlYWRhYmxlU3RhdGU7XG4gICAgc3RhdGUuYXdhaXREcmFpbi0tO1xuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluID09PSAwKVxuICAgICAgZmxvdyhzcmMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBmbG93KHNyYykge1xuICB2YXIgc3RhdGUgPSBzcmMuX3JlYWRhYmxlU3RhdGU7XG4gIHZhciBjaHVuaztcbiAgc3RhdGUuYXdhaXREcmFpbiA9IDA7XG5cbiAgZnVuY3Rpb24gd3JpdGUoZGVzdCwgaSwgbGlzdCkge1xuICAgIHZhciB3cml0dGVuID0gZGVzdC53cml0ZShjaHVuayk7XG4gICAgaWYgKGZhbHNlID09PSB3cml0dGVuKSB7XG4gICAgICBzdGF0ZS5hd2FpdERyYWluKys7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHN0YXRlLnBpcGVzQ291bnQgJiYgbnVsbCAhPT0gKGNodW5rID0gc3JjLnJlYWQoKSkpIHtcblxuICAgIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKVxuICAgICAgd3JpdGUoc3RhdGUucGlwZXMsIDAsIG51bGwpO1xuICAgIGVsc2VcbiAgICAgIHNoaW1zLmZvckVhY2goc3RhdGUucGlwZXMsIHdyaXRlKTtcblxuICAgIHNyYy5lbWl0KCdkYXRhJywgY2h1bmspO1xuXG4gICAgLy8gaWYgYW55b25lIG5lZWRzIGEgZHJhaW4sIHRoZW4gd2UgaGF2ZSB0byB3YWl0IGZvciB0aGF0LlxuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluID4gMClcbiAgICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGlmIGV2ZXJ5IGRlc3RpbmF0aW9uIHdhcyB1bnBpcGVkLCBlaXRoZXIgYmVmb3JlIGVudGVyaW5nIHRoaXNcbiAgLy8gZnVuY3Rpb24sIG9yIGluIHRoZSB3aGlsZSBsb29wLCB0aGVuIHN0b3AgZmxvd2luZy5cbiAgLy9cbiAgLy8gTkI6IFRoaXMgaXMgYSBwcmV0dHkgcmFyZSBlZGdlIGNhc2UuXG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAwKSB7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuXG4gICAgLy8gaWYgdGhlcmUgd2VyZSBkYXRhIGV2ZW50IGxpc3RlbmVycyBhZGRlZCwgdGhlbiBzd2l0Y2ggdG8gb2xkIG1vZGUuXG4gICAgaWYgKEVFLmxpc3RlbmVyQ291bnQoc3JjLCAnZGF0YScpID4gMClcbiAgICAgIGVtaXREYXRhRXZlbnRzKHNyYyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gYXQgdGhpcyBwb2ludCwgbm8gb25lIG5lZWRlZCBhIGRyYWluLCBzbyB3ZSBqdXN0IHJhbiBvdXQgb2YgZGF0YVxuICAvLyBvbiB0aGUgbmV4dCByZWFkYWJsZSBldmVudCwgc3RhcnQgaXQgb3ZlciBhZ2Fpbi5cbiAgc3RhdGUucmFuT3V0ID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcGlwZU9uUmVhZGFibGUoKSB7XG4gIGlmICh0aGlzLl9yZWFkYWJsZVN0YXRlLnJhbk91dCkge1xuICAgIHRoaXMuX3JlYWRhYmxlU3RhdGUucmFuT3V0ID0gZmFsc2U7XG4gICAgZmxvdyh0aGlzKTtcbiAgfVxufVxuXG5cblJlYWRhYmxlLnByb3RvdHlwZS51bnBpcGUgPSBmdW5jdGlvbihkZXN0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gaWYgd2UncmUgbm90IHBpcGluZyBhbnl3aGVyZSwgdGhlbiBkbyBub3RoaW5nLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMClcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBqdXN0IG9uZSBkZXN0aW5hdGlvbi4gIG1vc3QgY29tbW9uIGNhc2UuXG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKSB7XG4gICAgLy8gcGFzc2VkIGluIG9uZSwgYnV0IGl0J3Mgbm90IHRoZSByaWdodCBvbmUuXG4gICAgaWYgKGRlc3QgJiYgZGVzdCAhPT0gc3RhdGUucGlwZXMpXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmICghZGVzdClcbiAgICAgIGRlc3QgPSBzdGF0ZS5waXBlcztcblxuICAgIC8vIGdvdCBhIG1hdGNoLlxuICAgIHN0YXRlLnBpcGVzID0gbnVsbDtcbiAgICBzdGF0ZS5waXBlc0NvdW50ID0gMDtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdyZWFkYWJsZScsIHBpcGVPblJlYWRhYmxlKTtcbiAgICBzdGF0ZS5mbG93aW5nID0gZmFsc2U7XG4gICAgaWYgKGRlc3QpXG4gICAgICBkZXN0LmVtaXQoJ3VucGlwZScsIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc2xvdyBjYXNlLiBtdWx0aXBsZSBwaXBlIGRlc3RpbmF0aW9ucy5cblxuICBpZiAoIWRlc3QpIHtcbiAgICAvLyByZW1vdmUgYWxsLlxuICAgIHZhciBkZXN0cyA9IHN0YXRlLnBpcGVzO1xuICAgIHZhciBsZW4gPSBzdGF0ZS5waXBlc0NvdW50O1xuICAgIHN0YXRlLnBpcGVzID0gbnVsbDtcbiAgICBzdGF0ZS5waXBlc0NvdW50ID0gMDtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdyZWFkYWJsZScsIHBpcGVPblJlYWRhYmxlKTtcbiAgICBzdGF0ZS5mbG93aW5nID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgZGVzdHNbaV0uZW1pdCgndW5waXBlJywgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyB0cnkgdG8gZmluZCB0aGUgcmlnaHQgb25lLlxuICB2YXIgaSA9IHNoaW1zLmluZGV4T2Yoc3RhdGUucGlwZXMsIGRlc3QpO1xuICBpZiAoaSA9PT0gLTEpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgc3RhdGUucGlwZXMuc3BsaWNlKGksIDEpO1xuICBzdGF0ZS5waXBlc0NvdW50IC09IDE7XG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKVxuICAgIHN0YXRlLnBpcGVzID0gc3RhdGUucGlwZXNbMF07XG5cbiAgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIHNldCB1cCBkYXRhIGV2ZW50cyBpZiB0aGV5IGFyZSBhc2tlZCBmb3Jcbi8vIEVuc3VyZSByZWFkYWJsZSBsaXN0ZW5lcnMgZXZlbnR1YWxseSBnZXQgc29tZXRoaW5nXG5SZWFkYWJsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldiwgZm4pIHtcbiAgdmFyIHJlcyA9IFN0cmVhbS5wcm90b3R5cGUub24uY2FsbCh0aGlzLCBldiwgZm4pO1xuXG4gIGlmIChldiA9PT0gJ2RhdGEnICYmICF0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpXG4gICAgZW1pdERhdGFFdmVudHModGhpcyk7XG5cbiAgaWYgKGV2ID09PSAncmVhZGFibGUnICYmIHRoaXMucmVhZGFibGUpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICAgIGlmICghc3RhdGUucmVhZGFibGVMaXN0ZW5pbmcpIHtcbiAgICAgIHN0YXRlLnJlYWRhYmxlTGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAgIGlmICghc3RhdGUucmVhZGluZykge1xuICAgICAgICB0aGlzLnJlYWQoMCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxlbmd0aCkge1xuICAgICAgICBlbWl0UmVhZGFibGUodGhpcywgc3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuUmVhZGFibGUucHJvdG90eXBlLmFkZExpc3RlbmVyID0gUmVhZGFibGUucHJvdG90eXBlLm9uO1xuXG4vLyBwYXVzZSgpIGFuZCByZXN1bWUoKSBhcmUgcmVtbmFudHMgb2YgdGhlIGxlZ2FjeSByZWFkYWJsZSBzdHJlYW0gQVBJXG4vLyBJZiB0aGUgdXNlciB1c2VzIHRoZW0sIHRoZW4gc3dpdGNoIGludG8gb2xkIG1vZGUuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gIGVtaXREYXRhRXZlbnRzKHRoaXMpO1xuICB0aGlzLnJlYWQoMCk7XG4gIHRoaXMuZW1pdCgncmVzdW1lJyk7XG59O1xuXG5SZWFkYWJsZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgZW1pdERhdGFFdmVudHModGhpcywgdHJ1ZSk7XG4gIHRoaXMuZW1pdCgncGF1c2UnKTtcbn07XG5cbmZ1bmN0aW9uIGVtaXREYXRhRXZlbnRzKHN0cmVhbSwgc3RhcnRQYXVzZWQpIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuXG4gIGlmIChzdGF0ZS5mbG93aW5nKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9yZWFkYWJsZS1zdHJlYW0vaXNzdWVzLzE2XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc3dpdGNoIHRvIG9sZCBtb2RlIG5vdy4nKTtcbiAgfVxuXG4gIHZhciBwYXVzZWQgPSBzdGFydFBhdXNlZCB8fCBmYWxzZTtcbiAgdmFyIHJlYWRhYmxlID0gZmFsc2U7XG5cbiAgLy8gY29udmVydCB0byBhbiBvbGQtc3R5bGUgc3RyZWFtLlxuICBzdHJlYW0ucmVhZGFibGUgPSB0cnVlO1xuICBzdHJlYW0ucGlwZSA9IFN0cmVhbS5wcm90b3R5cGUucGlwZTtcbiAgc3RyZWFtLm9uID0gc3RyZWFtLmFkZExpc3RlbmVyID0gU3RyZWFtLnByb3RvdHlwZS5vbjtcblxuICBzdHJlYW0ub24oJ3JlYWRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmVhZGFibGUgPSB0cnVlO1xuXG4gICAgdmFyIGM7XG4gICAgd2hpbGUgKCFwYXVzZWQgJiYgKG51bGwgIT09IChjID0gc3RyZWFtLnJlYWQoKSkpKVxuICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBjKTtcblxuICAgIGlmIChjID09PSBudWxsKSB7XG4gICAgICByZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgc3RyZWFtLl9yZWFkYWJsZVN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBzdHJlYW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICBwYXVzZWQgPSB0cnVlO1xuICAgIHRoaXMuZW1pdCgncGF1c2UnKTtcbiAgfTtcblxuICBzdHJlYW0ucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcGF1c2VkID0gZmFsc2U7XG4gICAgaWYgKHJlYWRhYmxlKVxuICAgICAgdGltZXJzLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmVtaXQoJ3JlYWRhYmxlJyk7XG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlYWQoMCk7XG4gICAgdGhpcy5lbWl0KCdyZXN1bWUnKTtcbiAgfTtcblxuICAvLyBub3cgbWFrZSBpdCBzdGFydCwganVzdCBpbiBjYXNlIGl0IGhhZG4ndCBhbHJlYWR5LlxuICBzdHJlYW0uZW1pdCgncmVhZGFibGUnKTtcbn1cblxuLy8gd3JhcCBhbiBvbGQtc3R5bGUgc3RyZWFtIGFzIHRoZSBhc3luYyBkYXRhIHNvdXJjZS5cbi8vIFRoaXMgaXMgKm5vdCogcGFydCBvZiB0aGUgcmVhZGFibGUgc3RyZWFtIGludGVyZmFjZS5cbi8vIEl0IGlzIGFuIHVnbHkgdW5mb3J0dW5hdGUgbWVzcyBvZiBoaXN0b3J5LlxuUmVhZGFibGUucHJvdG90eXBlLndyYXAgPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIHBhdXNlZCA9IGZhbHNlO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhc3RhdGUuZW5kZWQpIHtcbiAgICAgIHZhciBjaHVuayA9IHN0YXRlLmRlY29kZXIuZW5kKCk7XG4gICAgICBpZiAoY2h1bmsgJiYgY2h1bmsubGVuZ3RoKVxuICAgICAgICBzZWxmLnB1c2goY2h1bmspO1xuICAgIH1cblxuICAgIHNlbGYucHVzaChudWxsKTtcbiAgfSk7XG5cbiAgc3RyZWFtLm9uKCdkYXRhJywgZnVuY3Rpb24oY2h1bmspIHtcbiAgICBpZiAoc3RhdGUuZGVjb2RlcilcbiAgICAgIGNodW5rID0gc3RhdGUuZGVjb2Rlci53cml0ZShjaHVuayk7XG4gICAgaWYgKCFjaHVuayB8fCAhc3RhdGUub2JqZWN0TW9kZSAmJiAhY2h1bmsubGVuZ3RoKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIHJldCA9IHNlbGYucHVzaChjaHVuayk7XG4gICAgaWYgKCFyZXQpIHtcbiAgICAgIHBhdXNlZCA9IHRydWU7XG4gICAgICBzdHJlYW0ucGF1c2UoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHByb3h5IGFsbCB0aGUgb3RoZXIgbWV0aG9kcy5cbiAgLy8gaW1wb3J0YW50IHdoZW4gd3JhcHBpbmcgZmlsdGVycyBhbmQgZHVwbGV4ZXMuXG4gIGZvciAodmFyIGkgaW4gc3RyZWFtKSB7XG4gICAgaWYgKHR5cGVvZiBzdHJlYW1baV0gPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgdHlwZW9mIHRoaXNbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzW2ldID0gZnVuY3Rpb24obWV0aG9kKSB7IHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHN0cmVhbVttZXRob2RdLmFwcGx5KHN0cmVhbSwgYXJndW1lbnRzKTtcbiAgICAgIH19KGkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHByb3h5IGNlcnRhaW4gaW1wb3J0YW50IGV2ZW50cy5cbiAgdmFyIGV2ZW50cyA9IFsnZXJyb3InLCAnY2xvc2UnLCAnZGVzdHJveScsICdwYXVzZScsICdyZXN1bWUnXTtcbiAgc2hpbXMuZm9yRWFjaChldmVudHMsIGZ1bmN0aW9uKGV2KSB7XG4gICAgc3RyZWFtLm9uKGV2LCBzaGltcy5iaW5kKHNlbGYuZW1pdCwgc2VsZiwgZXYpKTtcbiAgfSk7XG5cbiAgLy8gd2hlbiB3ZSB0cnkgdG8gY29uc3VtZSBzb21lIG1vcmUgYnl0ZXMsIHNpbXBseSB1bnBhdXNlIHRoZVxuICAvLyB1bmRlcmx5aW5nIHN0cmVhbS5cbiAgc2VsZi5fcmVhZCA9IGZ1bmN0aW9uKG4pIHtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICBwYXVzZWQgPSBmYWxzZTtcbiAgICAgIHN0cmVhbS5yZXN1bWUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5cblxuLy8gZXhwb3NlZCBmb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5LlxuUmVhZGFibGUuX2Zyb21MaXN0ID0gZnJvbUxpc3Q7XG5cbi8vIFBsdWNrIG9mZiBuIGJ5dGVzIGZyb20gYW4gYXJyYXkgb2YgYnVmZmVycy5cbi8vIExlbmd0aCBpcyB0aGUgY29tYmluZWQgbGVuZ3RocyBvZiBhbGwgdGhlIGJ1ZmZlcnMgaW4gdGhlIGxpc3QuXG5mdW5jdGlvbiBmcm9tTGlzdChuLCBzdGF0ZSkge1xuICB2YXIgbGlzdCA9IHN0YXRlLmJ1ZmZlcjtcbiAgdmFyIGxlbmd0aCA9IHN0YXRlLmxlbmd0aDtcbiAgdmFyIHN0cmluZ01vZGUgPSAhIXN0YXRlLmRlY29kZXI7XG4gIHZhciBvYmplY3RNb2RlID0gISFzdGF0ZS5vYmplY3RNb2RlO1xuICB2YXIgcmV0O1xuXG4gIC8vIG5vdGhpbmcgaW4gdGhlIGxpc3QsIGRlZmluaXRlbHkgZW1wdHkuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gbnVsbDtcblxuICBpZiAobGVuZ3RoID09PSAwKVxuICAgIHJldCA9IG51bGw7XG4gIGVsc2UgaWYgKG9iamVjdE1vZGUpXG4gICAgcmV0ID0gbGlzdC5zaGlmdCgpO1xuICBlbHNlIGlmICghbiB8fCBuID49IGxlbmd0aCkge1xuICAgIC8vIHJlYWQgaXQgYWxsLCB0cnVuY2F0ZSB0aGUgYXJyYXkuXG4gICAgaWYgKHN0cmluZ01vZGUpXG4gICAgICByZXQgPSBsaXN0LmpvaW4oJycpO1xuICAgIGVsc2VcbiAgICAgIHJldCA9IEJ1ZmZlci5jb25jYXQobGlzdCwgbGVuZ3RoKTtcbiAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gcmVhZCBqdXN0IHNvbWUgb2YgaXQuXG4gICAgaWYgKG4gPCBsaXN0WzBdLmxlbmd0aCkge1xuICAgICAgLy8ganVzdCB0YWtlIGEgcGFydCBvZiB0aGUgZmlyc3QgbGlzdCBpdGVtLlxuICAgICAgLy8gc2xpY2UgaXMgdGhlIHNhbWUgZm9yIGJ1ZmZlcnMgYW5kIHN0cmluZ3MuXG4gICAgICB2YXIgYnVmID0gbGlzdFswXTtcbiAgICAgIHJldCA9IGJ1Zi5zbGljZSgwLCBuKTtcbiAgICAgIGxpc3RbMF0gPSBidWYuc2xpY2Uobik7XG4gICAgfSBlbHNlIGlmIChuID09PSBsaXN0WzBdLmxlbmd0aCkge1xuICAgICAgLy8gZmlyc3QgbGlzdCBpcyBhIHBlcmZlY3QgbWF0Y2hcbiAgICAgIHJldCA9IGxpc3Quc2hpZnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcGxleCBjYXNlLlxuICAgICAgLy8gd2UgaGF2ZSBlbm91Z2ggdG8gY292ZXIgaXQsIGJ1dCBpdCBzcGFucyBwYXN0IHRoZSBmaXJzdCBidWZmZXIuXG4gICAgICBpZiAoc3RyaW5nTW9kZSlcbiAgICAgICAgcmV0ID0gJyc7XG4gICAgICBlbHNlXG4gICAgICAgIHJldCA9IG5ldyBCdWZmZXIobik7XG5cbiAgICAgIHZhciBjID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsICYmIGMgPCBuOyBpKyspIHtcbiAgICAgICAgdmFyIGJ1ZiA9IGxpc3RbMF07XG4gICAgICAgIHZhciBjcHkgPSBNYXRoLm1pbihuIC0gYywgYnVmLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKHN0cmluZ01vZGUpXG4gICAgICAgICAgcmV0ICs9IGJ1Zi5zbGljZSgwLCBjcHkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYnVmLmNvcHkocmV0LCBjLCAwLCBjcHkpO1xuXG4gICAgICAgIGlmIChjcHkgPCBidWYubGVuZ3RoKVxuICAgICAgICAgIGxpc3RbMF0gPSBidWYuc2xpY2UoY3B5KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcblxuICAgICAgICBjICs9IGNweTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBlbmRSZWFkYWJsZShzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuXG4gIC8vIElmIHdlIGdldCBoZXJlIGJlZm9yZSBjb25zdW1pbmcgYWxsIHRoZSBieXRlcywgdGhlbiB0aGF0IGlzIGFcbiAgLy8gYnVnIGluIG5vZGUuICBTaG91bGQgbmV2ZXIgaGFwcGVuLlxuICBpZiAoc3RhdGUubGVuZ3RoID4gMClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2VuZFJlYWRhYmxlIGNhbGxlZCBvbiBub24tZW1wdHkgc3RyZWFtJyk7XG5cbiAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkICYmIHN0YXRlLmNhbGxlZFJlYWQpIHtcbiAgICBzdGF0ZS5lbmRlZCA9IHRydWU7XG4gICAgdGltZXJzLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgIC8vIENoZWNrIHRoYXQgd2UgZGlkbid0IGdldCBvbmUgbGFzdCB1bnNoaWZ0LlxuICAgICAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkICYmIHN0YXRlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzdGF0ZS5lbmRFbWl0dGVkID0gdHJ1ZTtcbiAgICAgICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2U7XG4gICAgICAgIHN0cmVhbS5lbWl0KCdlbmQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIGEgdHJhbnNmb3JtIHN0cmVhbSBpcyBhIHJlYWRhYmxlL3dyaXRhYmxlIHN0cmVhbSB3aGVyZSB5b3UgZG9cbi8vIHNvbWV0aGluZyB3aXRoIHRoZSBkYXRhLiAgU29tZXRpbWVzIGl0J3MgY2FsbGVkIGEgXCJmaWx0ZXJcIixcbi8vIGJ1dCB0aGF0J3Mgbm90IGEgZ3JlYXQgbmFtZSBmb3IgaXQsIHNpbmNlIHRoYXQgaW1wbGllcyBhIHRoaW5nIHdoZXJlXG4vLyBzb21lIGJpdHMgcGFzcyB0aHJvdWdoLCBhbmQgb3RoZXJzIGFyZSBzaW1wbHkgaWdub3JlZC4gIChUaGF0IHdvdWxkXG4vLyBiZSBhIHZhbGlkIGV4YW1wbGUgb2YgYSB0cmFuc2Zvcm0sIG9mIGNvdXJzZS4pXG4vL1xuLy8gV2hpbGUgdGhlIG91dHB1dCBpcyBjYXVzYWxseSByZWxhdGVkIHRvIHRoZSBpbnB1dCwgaXQncyBub3QgYVxuLy8gbmVjZXNzYXJpbHkgc3ltbWV0cmljIG9yIHN5bmNocm9ub3VzIHRyYW5zZm9ybWF0aW9uLiAgRm9yIGV4YW1wbGUsXG4vLyBhIHpsaWIgc3RyZWFtIG1pZ2h0IHRha2UgbXVsdGlwbGUgcGxhaW4tdGV4dCB3cml0ZXMoKSwgYW5kIHRoZW5cbi8vIGVtaXQgYSBzaW5nbGUgY29tcHJlc3NlZCBjaHVuayBzb21lIHRpbWUgaW4gdGhlIGZ1dHVyZS5cbi8vXG4vLyBIZXJlJ3MgaG93IHRoaXMgd29ya3M6XG4vL1xuLy8gVGhlIFRyYW5zZm9ybSBzdHJlYW0gaGFzIGFsbCB0aGUgYXNwZWN0cyBvZiB0aGUgcmVhZGFibGUgYW5kIHdyaXRhYmxlXG4vLyBzdHJlYW0gY2xhc3Nlcy4gIFdoZW4geW91IHdyaXRlKGNodW5rKSwgdGhhdCBjYWxscyBfd3JpdGUoY2h1bmssY2IpXG4vLyBpbnRlcm5hbGx5LCBhbmQgcmV0dXJucyBmYWxzZSBpZiB0aGVyZSdzIGEgbG90IG9mIHBlbmRpbmcgd3JpdGVzXG4vLyBidWZmZXJlZCB1cC4gIFdoZW4geW91IGNhbGwgcmVhZCgpLCB0aGF0IGNhbGxzIF9yZWFkKG4pIHVudGlsXG4vLyB0aGVyZSdzIGVub3VnaCBwZW5kaW5nIHJlYWRhYmxlIGRhdGEgYnVmZmVyZWQgdXAuXG4vL1xuLy8gSW4gYSB0cmFuc2Zvcm0gc3RyZWFtLCB0aGUgd3JpdHRlbiBkYXRhIGlzIHBsYWNlZCBpbiBhIGJ1ZmZlci4gIFdoZW5cbi8vIF9yZWFkKG4pIGlzIGNhbGxlZCwgaXQgdHJhbnNmb3JtcyB0aGUgcXVldWVkIHVwIGRhdGEsIGNhbGxpbmcgdGhlXG4vLyBidWZmZXJlZCBfd3JpdGUgY2IncyBhcyBpdCBjb25zdW1lcyBjaHVua3MuICBJZiBjb25zdW1pbmcgYSBzaW5nbGVcbi8vIHdyaXR0ZW4gY2h1bmsgd291bGQgcmVzdWx0IGluIG11bHRpcGxlIG91dHB1dCBjaHVua3MsIHRoZW4gdGhlIGZpcnN0XG4vLyBvdXRwdXR0ZWQgYml0IGNhbGxzIHRoZSByZWFkY2IsIGFuZCBzdWJzZXF1ZW50IGNodW5rcyBqdXN0IGdvIGludG9cbi8vIHRoZSByZWFkIGJ1ZmZlciwgYW5kIHdpbGwgY2F1c2UgaXQgdG8gZW1pdCAncmVhZGFibGUnIGlmIG5lY2Vzc2FyeS5cbi8vXG4vLyBUaGlzIHdheSwgYmFjay1wcmVzc3VyZSBpcyBhY3R1YWxseSBkZXRlcm1pbmVkIGJ5IHRoZSByZWFkaW5nIHNpZGUsXG4vLyBzaW5jZSBfcmVhZCBoYXMgdG8gYmUgY2FsbGVkIHRvIHN0YXJ0IHByb2Nlc3NpbmcgYSBuZXcgY2h1bmsuICBIb3dldmVyLFxuLy8gYSBwYXRob2xvZ2ljYWwgaW5mbGF0ZSB0eXBlIG9mIHRyYW5zZm9ybSBjYW4gY2F1c2UgZXhjZXNzaXZlIGJ1ZmZlcmluZ1xuLy8gaGVyZS4gIEZvciBleGFtcGxlLCBpbWFnaW5lIGEgc3RyZWFtIHdoZXJlIGV2ZXJ5IGJ5dGUgb2YgaW5wdXQgaXNcbi8vIGludGVycHJldGVkIGFzIGFuIGludGVnZXIgZnJvbSAwLTI1NSwgYW5kIHRoZW4gcmVzdWx0cyBpbiB0aGF0IG1hbnlcbi8vIGJ5dGVzIG9mIG91dHB1dC4gIFdyaXRpbmcgdGhlIDQgYnl0ZXMge2ZmLGZmLGZmLGZmfSB3b3VsZCByZXN1bHQgaW5cbi8vIDFrYiBvZiBkYXRhIGJlaW5nIG91dHB1dC4gIEluIHRoaXMgY2FzZSwgeW91IGNvdWxkIHdyaXRlIGEgdmVyeSBzbWFsbFxuLy8gYW1vdW50IG9mIGlucHV0LCBhbmQgZW5kIHVwIHdpdGggYSB2ZXJ5IGxhcmdlIGFtb3VudCBvZiBvdXRwdXQuICBJblxuLy8gc3VjaCBhIHBhdGhvbG9naWNhbCBpbmZsYXRpbmcgbWVjaGFuaXNtLCB0aGVyZSdkIGJlIG5vIHdheSB0byB0ZWxsXG4vLyB0aGUgc3lzdGVtIHRvIHN0b3AgZG9pbmcgdGhlIHRyYW5zZm9ybS4gIEEgc2luZ2xlIDRNQiB3cml0ZSBjb3VsZFxuLy8gY2F1c2UgdGhlIHN5c3RlbSB0byBydW4gb3V0IG9mIG1lbW9yeS5cbi8vXG4vLyBIb3dldmVyLCBldmVuIGluIHN1Y2ggYSBwYXRob2xvZ2ljYWwgY2FzZSwgb25seSBhIHNpbmdsZSB3cml0dGVuIGNodW5rXG4vLyB3b3VsZCBiZSBjb25zdW1lZCwgYW5kIHRoZW4gdGhlIHJlc3Qgd291bGQgd2FpdCAodW4tdHJhbnNmb3JtZWQpIHVudGlsXG4vLyB0aGUgcmVzdWx0cyBvZiB0aGUgcHJldmlvdXMgdHJhbnNmb3JtZWQgY2h1bmsgd2VyZSBjb25zdW1lZC5cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07XG5cbnZhciBEdXBsZXggPSByZXF1aXJlKCdfc3RyZWFtX2R1cGxleCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG51dGlsLmluaGVyaXRzKFRyYW5zZm9ybSwgRHVwbGV4KTtcblxuXG5mdW5jdGlvbiBUcmFuc2Zvcm1TdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgdGhpcy5hZnRlclRyYW5zZm9ybSA9IGZ1bmN0aW9uKGVyLCBkYXRhKSB7XG4gICAgcmV0dXJuIGFmdGVyVHJhbnNmb3JtKHN0cmVhbSwgZXIsIGRhdGEpO1xuICB9O1xuXG4gIHRoaXMubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICB0aGlzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuICB0aGlzLndyaXRlY2IgPSBudWxsO1xuICB0aGlzLndyaXRlY2h1bmsgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBhZnRlclRyYW5zZm9ybShzdHJlYW0sIGVyLCBkYXRhKSB7XG4gIHZhciB0cyA9IHN0cmVhbS5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuXG4gIHZhciBjYiA9IHRzLndyaXRlY2I7XG5cbiAgaWYgKCFjYilcbiAgICByZXR1cm4gc3RyZWFtLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdubyB3cml0ZWNiIGluIFRyYW5zZm9ybSBjbGFzcycpKTtcblxuICB0cy53cml0ZWNodW5rID0gbnVsbDtcbiAgdHMud3JpdGVjYiA9IG51bGw7XG5cbiAgaWYgKGRhdGEgIT09IG51bGwgJiYgZGF0YSAhPT0gdW5kZWZpbmVkKVxuICAgIHN0cmVhbS5wdXNoKGRhdGEpO1xuXG4gIGlmIChjYilcbiAgICBjYihlcik7XG5cbiAgdmFyIHJzID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBycy5yZWFkaW5nID0gZmFsc2U7XG4gIGlmIChycy5uZWVkUmVhZGFibGUgfHwgcnMubGVuZ3RoIDwgcnMuaGlnaFdhdGVyTWFyaykge1xuICAgIHN0cmVhbS5fcmVhZChycy5oaWdoV2F0ZXJNYXJrKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIFRyYW5zZm9ybShvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBUcmFuc2Zvcm0pKVxuICAgIHJldHVybiBuZXcgVHJhbnNmb3JtKG9wdGlvbnMpO1xuXG4gIER1cGxleC5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlID0gbmV3IFRyYW5zZm9ybVN0YXRlKG9wdGlvbnMsIHRoaXMpO1xuXG4gIC8vIHdoZW4gdGhlIHdyaXRhYmxlIHNpZGUgZmluaXNoZXMsIHRoZW4gZmx1c2ggb3V0IGFueXRoaW5nIHJlbWFpbmluZy5cbiAgdmFyIHN0cmVhbSA9IHRoaXM7XG5cbiAgLy8gc3RhcnQgb3V0IGFza2luZyBmb3IgYSByZWFkYWJsZSBldmVudCBvbmNlIGRhdGEgaXMgdHJhbnNmb3JtZWQuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcblxuICAvLyB3ZSBoYXZlIGltcGxlbWVudGVkIHRoZSBfcmVhZCBtZXRob2QsIGFuZCBkb25lIHRoZSBvdGhlciB0aGluZ3NcbiAgLy8gdGhhdCBSZWFkYWJsZSB3YW50cyBiZWZvcmUgdGhlIGZpcnN0IF9yZWFkIGNhbGwsIHNvIHVuc2V0IHRoZVxuICAvLyBzeW5jIGd1YXJkIGZsYWcuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUuc3luYyA9IGZhbHNlO1xuXG4gIHRoaXMub25jZSgnZmluaXNoJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiB0aGlzLl9mbHVzaClcbiAgICAgIHRoaXMuX2ZsdXNoKGZ1bmN0aW9uKGVyKSB7XG4gICAgICAgIGRvbmUoc3RyZWFtLCBlcik7XG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICBkb25lKHN0cmVhbSk7XG4gIH0pO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcpIHtcbiAgdGhpcy5fdHJhbnNmb3JtU3RhdGUubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICByZXR1cm4gRHVwbGV4LnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGVuY29kaW5nKTtcbn07XG5cbi8vIFRoaXMgaXMgdGhlIHBhcnQgd2hlcmUgeW91IGRvIHN0dWZmIVxuLy8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBpbiBpbXBsZW1lbnRhdGlvbiBjbGFzc2VzLlxuLy8gJ2NodW5rJyBpcyBhbiBpbnB1dCBjaHVuay5cbi8vXG4vLyBDYWxsIGBwdXNoKG5ld0NodW5rKWAgdG8gcGFzcyBhbG9uZyB0cmFuc2Zvcm1lZCBvdXRwdXRcbi8vIHRvIHRoZSByZWFkYWJsZSBzaWRlLiAgWW91IG1heSBjYWxsICdwdXNoJyB6ZXJvIG9yIG1vcmUgdGltZXMuXG4vL1xuLy8gQ2FsbCBgY2IoZXJyKWAgd2hlbiB5b3UgYXJlIGRvbmUgd2l0aCB0aGlzIGNodW5rLiAgSWYgeW91IHBhc3Ncbi8vIGFuIGVycm9yLCB0aGVuIHRoYXQnbGwgcHV0IHRoZSBodXJ0IG9uIHRoZSB3aG9sZSBvcGVyYXRpb24uICBJZiB5b3Vcbi8vIG5ldmVyIGNhbGwgY2IoKSwgdGhlbiB5b3UnbGwgbmV2ZXIgZ2V0IGFub3RoZXIgY2h1bmsuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG59O1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl93cml0ZSA9IGZ1bmN0aW9uKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHRzID0gdGhpcy5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLndyaXRlY2IgPSBjYjtcbiAgdHMud3JpdGVjaHVuayA9IGNodW5rO1xuICB0cy53cml0ZWVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIGlmICghdHMudHJhbnNmb3JtaW5nKSB7XG4gICAgdmFyIHJzID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgICBpZiAodHMubmVlZFRyYW5zZm9ybSB8fFxuICAgICAgICBycy5uZWVkUmVhZGFibGUgfHxcbiAgICAgICAgcnMubGVuZ3RoIDwgcnMuaGlnaFdhdGVyTWFyaylcbiAgICAgIHRoaXMuX3JlYWQocnMuaGlnaFdhdGVyTWFyayk7XG4gIH1cbn07XG5cbi8vIERvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIGFyZ3MgYXJlIGhlcmUuXG4vLyBfdHJhbnNmb3JtIGRvZXMgYWxsIHRoZSB3b3JrLlxuLy8gVGhhdCB3ZSBnb3QgaGVyZSBtZWFucyB0aGF0IHRoZSByZWFkYWJsZSBzaWRlIHdhbnRzIG1vcmUgZGF0YS5cblRyYW5zZm9ybS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbihuKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICh0cy53cml0ZWNodW5rICYmIHRzLndyaXRlY2IgJiYgIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHRzLnRyYW5zZm9ybWluZyA9IHRydWU7XG4gICAgdGhpcy5fdHJhbnNmb3JtKHRzLndyaXRlY2h1bmssIHRzLndyaXRlZW5jb2RpbmcsIHRzLmFmdGVyVHJhbnNmb3JtKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBtYXJrIHRoYXQgd2UgbmVlZCBhIHRyYW5zZm9ybSwgc28gdGhhdCBhbnkgZGF0YSB0aGF0IGNvbWVzIGluXG4gICAgLy8gd2lsbCBnZXQgcHJvY2Vzc2VkLCBub3cgdGhhdCB3ZSd2ZSBhc2tlZCBmb3IgaXQuXG4gICAgdHMubmVlZFRyYW5zZm9ybSA9IHRydWU7XG4gIH1cbn07XG5cblxuZnVuY3Rpb24gZG9uZShzdHJlYW0sIGVyKSB7XG4gIGlmIChlcilcbiAgICByZXR1cm4gc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuXG4gIC8vIGlmIHRoZXJlJ3Mgbm90aGluZyBpbiB0aGUgd3JpdGUgYnVmZmVyLCB0aGVuIHRoYXQgbWVhbnNcbiAgLy8gdGhhdCBub3RoaW5nIG1vcmUgd2lsbCBldmVyIGJlIHByb3ZpZGVkXG4gIHZhciB3cyA9IHN0cmVhbS5fd3JpdGFibGVTdGF0ZTtcbiAgdmFyIHJzID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICB2YXIgdHMgPSBzdHJlYW0uX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICh3cy5sZW5ndGgpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsaW5nIHRyYW5zZm9ybSBkb25lIHdoZW4gd3MubGVuZ3RoICE9IDAnKTtcblxuICBpZiAodHMudHJhbnNmb3JtaW5nKVxuICAgIHRocm93IG5ldyBFcnJvcignY2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHN0aWxsIHRyYW5zZm9ybWluZycpO1xuXG4gIHJldHVybiBzdHJlYW0ucHVzaChudWxsKTtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBBIGJpdCBzaW1wbGVyIHRoYW4gcmVhZGFibGUgc3RyZWFtcy5cbi8vIEltcGxlbWVudCBhbiBhc3luYyAuX3dyaXRlKGNodW5rLCBjYiksIGFuZCBpdCdsbCBoYW5kbGUgYWxsXG4vLyB0aGUgZHJhaW4gZXZlbnQgZW1pc3Npb24gYW5kIGJ1ZmZlcmluZy5cblxubW9kdWxlLmV4cG9ydHMgPSBXcml0YWJsZTtcbldyaXRhYmxlLldyaXRhYmxlU3RhdGUgPSBXcml0YWJsZVN0YXRlO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbnZhciB0aW1lcnMgPSByZXF1aXJlKCd0aW1lcnMnKTtcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbnV0aWwuaW5oZXJpdHMoV3JpdGFibGUsIFN0cmVhbSk7XG5cbmZ1bmN0aW9uIFdyaXRlUmVxKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdGhpcy5jaHVuayA9IGNodW5rO1xuICB0aGlzLmVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIHRoaXMuY2FsbGJhY2sgPSBjYjtcbn1cblxuZnVuY3Rpb24gV3JpdGFibGVTdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgLy8gdGhlIHBvaW50IGF0IHdoaWNoIHdyaXRlKCkgc3RhcnRzIHJldHVybmluZyBmYWxzZVxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIHRoYXQgd2UgYWx3YXlzIHJldHVybiBmYWxzZSBpZlxuICAvLyB0aGUgZW50aXJlIGJ1ZmZlciBpcyBub3QgZmx1c2hlZCBpbW1lZGlhdGVseSBvbiB3cml0ZSgpXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IChod20gfHwgaHdtID09PSAwKSA/IGh3bSA6IDE2ICogMTAyNDtcblxuICAvLyBvYmplY3Qgc3RyZWFtIGZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciBvciBub3QgdGhpcyBzdHJlYW1cbiAgLy8gY29udGFpbnMgYnVmZmVycyBvciBvYmplY3RzLlxuICB0aGlzLm9iamVjdE1vZGUgPSAhIW9wdGlvbnMub2JqZWN0TW9kZTtcblxuICAvLyBjYXN0IHRvIGludHMuXG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IH5+dGhpcy5oaWdoV2F0ZXJNYXJrO1xuXG4gIHRoaXMubmVlZERyYWluID0gZmFsc2U7XG4gIC8vIGF0IHRoZSBzdGFydCBvZiBjYWxsaW5nIGVuZCgpXG4gIHRoaXMuZW5kaW5nID0gZmFsc2U7XG4gIC8vIHdoZW4gZW5kKCkgaGFzIGJlZW4gY2FsbGVkLCBhbmQgcmV0dXJuZWRcbiAgdGhpcy5lbmRlZCA9IGZhbHNlO1xuICAvLyB3aGVuICdmaW5pc2gnIGlzIGVtaXR0ZWRcbiAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xuXG4gIC8vIHNob3VsZCB3ZSBkZWNvZGUgc3RyaW5ncyBpbnRvIGJ1ZmZlcnMgYmVmb3JlIHBhc3NpbmcgdG8gX3dyaXRlP1xuICAvLyB0aGlzIGlzIGhlcmUgc28gdGhhdCBzb21lIG5vZGUtY29yZSBzdHJlYW1zIGNhbiBvcHRpbWl6ZSBzdHJpbmdcbiAgLy8gaGFuZGxpbmcgYXQgYSBsb3dlciBsZXZlbC5cbiAgdmFyIG5vRGVjb2RlID0gb3B0aW9ucy5kZWNvZGVTdHJpbmdzID09PSBmYWxzZTtcbiAgdGhpcy5kZWNvZGVTdHJpbmdzID0gIW5vRGVjb2RlO1xuXG4gIC8vIENyeXB0byBpcyBraW5kIG9mIG9sZCBhbmQgY3J1c3R5LiAgSGlzdG9yaWNhbGx5LCBpdHMgZGVmYXVsdCBzdHJpbmdcbiAgLy8gZW5jb2RpbmcgaXMgJ2JpbmFyeScgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLlxuICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gdGhlIHVuaXZlcnNlIHVzZXMgJ3V0ZjgnLCB0aG91Z2guXG4gIHRoaXMuZGVmYXVsdEVuY29kaW5nID0gb3B0aW9ucy5kZWZhdWx0RW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXG4gIC8vIG5vdCBhbiBhY3R1YWwgYnVmZmVyIHdlIGtlZXAgdHJhY2sgb2YsIGJ1dCBhIG1lYXN1cmVtZW50XG4gIC8vIG9mIGhvdyBtdWNoIHdlJ3JlIHdhaXRpbmcgdG8gZ2V0IHB1c2hlZCB0byBzb21lIHVuZGVybHlpbmdcbiAgLy8gc29ja2V0IG9yIGZpbGUuXG4gIHRoaXMubGVuZ3RoID0gMDtcblxuICAvLyBhIGZsYWcgdG8gc2VlIHdoZW4gd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHdyaXRlLlxuICB0aGlzLndyaXRpbmcgPSBmYWxzZTtcblxuICAvLyBhIGZsYWcgdG8gYmUgYWJsZSB0byB0ZWxsIGlmIHRoZSBvbndyaXRlIGNiIGlzIGNhbGxlZCBpbW1lZGlhdGVseSxcbiAgLy8gb3Igb24gYSBsYXRlciB0aWNrLiAgV2Ugc2V0IHRoaXMgdG8gdHJ1ZSBhdCBmaXJzdCwgYmVjdWFzZSBhbnlcbiAgLy8gYWN0aW9ucyB0aGF0IHNob3VsZG4ndCBoYXBwZW4gdW50aWwgXCJsYXRlclwiIHNob3VsZCBnZW5lcmFsbHkgYWxzb1xuICAvLyBub3QgaGFwcGVuIGJlZm9yZSB0aGUgZmlyc3Qgd3JpdGUgY2FsbC5cbiAgdGhpcy5zeW5jID0gdHJ1ZTtcblxuICAvLyBhIGZsYWcgdG8ga25vdyBpZiB3ZSdyZSBwcm9jZXNzaW5nIHByZXZpb3VzbHkgYnVmZmVyZWQgaXRlbXMsIHdoaWNoXG4gIC8vIG1heSBjYWxsIHRoZSBfd3JpdGUoKSBjYWxsYmFjayBpbiB0aGUgc2FtZSB0aWNrLCBzbyB0aGF0IHdlIGRvbid0XG4gIC8vIGVuZCB1cCBpbiBhbiBvdmVybGFwcGVkIG9ud3JpdGUgc2l0dWF0aW9uLlxuICB0aGlzLmJ1ZmZlclByb2Nlc3NpbmcgPSBmYWxzZTtcblxuICAvLyB0aGUgY2FsbGJhY2sgdGhhdCdzIHBhc3NlZCB0byBfd3JpdGUoY2h1bmssY2IpXG4gIHRoaXMub253cml0ZSA9IGZ1bmN0aW9uKGVyKSB7XG4gICAgb253cml0ZShzdHJlYW0sIGVyKTtcbiAgfTtcblxuICAvLyB0aGUgY2FsbGJhY2sgdGhhdCB0aGUgdXNlciBzdXBwbGllcyB0byB3cml0ZShjaHVuayxlbmNvZGluZyxjYilcbiAgdGhpcy53cml0ZWNiID0gbnVsbDtcblxuICAvLyB0aGUgYW1vdW50IHRoYXQgaXMgYmVpbmcgd3JpdHRlbiB3aGVuIF93cml0ZSBpcyBjYWxsZWQuXG4gIHRoaXMud3JpdGVsZW4gPSAwO1xuXG4gIHRoaXMuYnVmZmVyID0gW107XG59XG5cbmZ1bmN0aW9uIFdyaXRhYmxlKG9wdGlvbnMpIHtcbiAgLy8gV3JpdGFibGUgY3RvciBpcyBhcHBsaWVkIHRvIER1cGxleGVzLCB0aG91Z2ggdGhleSdyZSBub3RcbiAgLy8gaW5zdGFuY2VvZiBXcml0YWJsZSwgdGhleSdyZSBpbnN0YW5jZW9mIFJlYWRhYmxlLlxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgV3JpdGFibGUpICYmICEodGhpcyBpbnN0YW5jZW9mIFN0cmVhbS5EdXBsZXgpKVxuICAgIHJldHVybiBuZXcgV3JpdGFibGUob3B0aW9ucyk7XG5cbiAgdGhpcy5fd3JpdGFibGVTdGF0ZSA9IG5ldyBXcml0YWJsZVN0YXRlKG9wdGlvbnMsIHRoaXMpO1xuXG4gIC8vIGxlZ2FjeS5cbiAgdGhpcy53cml0YWJsZSA9IHRydWU7XG5cbiAgU3RyZWFtLmNhbGwodGhpcyk7XG59XG5cbi8vIE90aGVyd2lzZSBwZW9wbGUgY2FuIHBpcGUgV3JpdGFibGUgc3RyZWFtcywgd2hpY2ggaXMganVzdCB3cm9uZy5cbldyaXRhYmxlLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0Nhbm5vdCBwaXBlLiBOb3QgcmVhZGFibGUuJykpO1xufTtcblxuXG5mdW5jdGlvbiB3cml0ZUFmdGVyRW5kKHN0cmVhbSwgc3RhdGUsIGNiKSB7XG4gIHZhciBlciA9IG5ldyBFcnJvcignd3JpdGUgYWZ0ZXIgZW5kJyk7XG4gIC8vIFRPRE86IGRlZmVyIGVycm9yIGV2ZW50cyBjb25zaXN0ZW50bHkgZXZlcnl3aGVyZSwgbm90IGp1c3QgdGhlIGNiXG4gIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgdGltZXJzLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICBjYihlcik7XG4gIH0pO1xufVxuXG4vLyBJZiB3ZSBnZXQgc29tZXRoaW5nIHRoYXQgaXMgbm90IGEgYnVmZmVyLCBzdHJpbmcsIG51bGwsIG9yIHVuZGVmaW5lZCxcbi8vIGFuZCB3ZSdyZSBub3QgaW4gb2JqZWN0TW9kZSwgdGhlbiB0aGF0J3MgYW4gZXJyb3IuXG4vLyBPdGhlcndpc2Ugc3RyZWFtIGNodW5rcyBhcmUgYWxsIGNvbnNpZGVyZWQgdG8gYmUgb2YgbGVuZ3RoPTEsIGFuZCB0aGVcbi8vIHdhdGVybWFya3MgZGV0ZXJtaW5lIGhvdyBtYW55IG9iamVjdHMgdG8ga2VlcCBpbiB0aGUgYnVmZmVyLCByYXRoZXIgdGhhblxuLy8gaG93IG1hbnkgYnl0ZXMgb3IgY2hhcmFjdGVycy5cbmZ1bmN0aW9uIHZhbGlkQ2h1bmsoc3RyZWFtLCBzdGF0ZSwgY2h1bmssIGNiKSB7XG4gIHZhciB2YWxpZCA9IHRydWU7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGNodW5rKSAmJlxuICAgICAgJ3N0cmluZycgIT09IHR5cGVvZiBjaHVuayAmJlxuICAgICAgY2h1bmsgIT09IG51bGwgJiZcbiAgICAgIGNodW5rICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgdmFyIGVyID0gbmV3IFR5cGVFcnJvcignSW52YWxpZCBub24tc3RyaW5nL2J1ZmZlciBjaHVuaycpO1xuICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgICB0aW1lcnMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgY2IoZXIpO1xuICAgIH0pO1xuICAgIHZhbGlkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbGlkO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG4gIHZhciByZXQgPSBmYWxzZTtcblxuICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBlbmNvZGluZztcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH1cblxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKGNodW5rKSlcbiAgICBlbmNvZGluZyA9ICdidWZmZXInO1xuICBlbHNlIGlmICghZW5jb2RpbmcpXG4gICAgZW5jb2RpbmcgPSBzdGF0ZS5kZWZhdWx0RW5jb2Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJylcbiAgICBjYiA9IGZ1bmN0aW9uKCkge307XG5cbiAgaWYgKHN0YXRlLmVuZGVkKVxuICAgIHdyaXRlQWZ0ZXJFbmQodGhpcywgc3RhdGUsIGNiKTtcbiAgZWxzZSBpZiAodmFsaWRDaHVuayh0aGlzLCBzdGF0ZSwgY2h1bmssIGNiKSlcbiAgICByZXQgPSB3cml0ZU9yQnVmZmVyKHRoaXMsIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gZGVjb2RlQ2h1bmsoc3RhdGUsIGNodW5rLCBlbmNvZGluZykge1xuICBpZiAoIXN0YXRlLm9iamVjdE1vZGUgJiZcbiAgICAgIHN0YXRlLmRlY29kZVN0cmluZ3MgIT09IGZhbHNlICYmXG4gICAgICB0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnKSB7XG4gICAgY2h1bmsgPSBuZXcgQnVmZmVyKGNodW5rLCBlbmNvZGluZyk7XG4gIH1cbiAgcmV0dXJuIGNodW5rO1xufVxuXG4vLyBpZiB3ZSdyZSBhbHJlYWR5IHdyaXRpbmcgc29tZXRoaW5nLCB0aGVuIGp1c3QgcHV0IHRoaXNcbi8vIGluIHRoZSBxdWV1ZSwgYW5kIHdhaXQgb3VyIHR1cm4uICBPdGhlcndpc2UsIGNhbGwgX3dyaXRlXG4vLyBJZiB3ZSByZXR1cm4gZmFsc2UsIHRoZW4gd2UgbmVlZCBhIGRyYWluIGV2ZW50LCBzbyBzZXQgdGhhdCBmbGFnLlxuZnVuY3Rpb24gd3JpdGVPckJ1ZmZlcihzdHJlYW0sIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNodW5rID0gZGVjb2RlQ2h1bmsoc3RhdGUsIGNodW5rLCBlbmNvZGluZyk7XG4gIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICBzdGF0ZS5sZW5ndGggKz0gbGVuO1xuXG4gIHZhciByZXQgPSBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrO1xuICBzdGF0ZS5uZWVkRHJhaW4gPSAhcmV0O1xuXG4gIGlmIChzdGF0ZS53cml0aW5nKVxuICAgIHN0YXRlLmJ1ZmZlci5wdXNoKG5ldyBXcml0ZVJlcShjaHVuaywgZW5jb2RpbmcsIGNiKSk7XG4gIGVsc2VcbiAgICBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYik7XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gZG9Xcml0ZShzdHJlYW0sIHN0YXRlLCBsZW4sIGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgc3RhdGUud3JpdGVsZW4gPSBsZW47XG4gIHN0YXRlLndyaXRlY2IgPSBjYjtcbiAgc3RhdGUud3JpdGluZyA9IHRydWU7XG4gIHN0YXRlLnN5bmMgPSB0cnVlO1xuICBzdHJlYW0uX3dyaXRlKGNodW5rLCBlbmNvZGluZywgc3RhdGUub253cml0ZSk7XG4gIHN0YXRlLnN5bmMgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gb253cml0ZUVycm9yKHN0cmVhbSwgc3RhdGUsIHN5bmMsIGVyLCBjYikge1xuICBpZiAoc3luYylcbiAgICB0aW1lcnMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgY2IoZXIpO1xuICAgIH0pO1xuICBlbHNlXG4gICAgY2IoZXIpO1xuXG4gIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbn1cblxuZnVuY3Rpb24gb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKSB7XG4gIHN0YXRlLndyaXRpbmcgPSBmYWxzZTtcbiAgc3RhdGUud3JpdGVjYiA9IG51bGw7XG4gIHN0YXRlLmxlbmd0aCAtPSBzdGF0ZS53cml0ZWxlbjtcbiAgc3RhdGUud3JpdGVsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlKHN0cmVhbSwgZXIpIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl93cml0YWJsZVN0YXRlO1xuICB2YXIgc3luYyA9IHN0YXRlLnN5bmM7XG4gIHZhciBjYiA9IHN0YXRlLndyaXRlY2I7XG5cbiAgb253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKTtcblxuICBpZiAoZXIpXG4gICAgb253cml0ZUVycm9yKHN0cmVhbSwgc3RhdGUsIHN5bmMsIGVyLCBjYik7XG4gIGVsc2Uge1xuICAgIC8vIENoZWNrIGlmIHdlJ3JlIGFjdHVhbGx5IHJlYWR5IHRvIGZpbmlzaCwgYnV0IGRvbid0IGVtaXQgeWV0XG4gICAgdmFyIGZpbmlzaGVkID0gbmVlZEZpbmlzaChzdHJlYW0sIHN0YXRlKTtcblxuICAgIGlmICghZmluaXNoZWQgJiYgIXN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgJiYgc3RhdGUuYnVmZmVyLmxlbmd0aClcbiAgICAgIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpO1xuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIHRpbWVycy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZnRlcldyaXRlKHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKSB7XG4gIGlmICghZmluaXNoZWQpXG4gICAgb253cml0ZURyYWluKHN0cmVhbSwgc3RhdGUpO1xuICBjYigpO1xuICBpZiAoZmluaXNoZWQpXG4gICAgZmluaXNoTWF5YmUoc3RyZWFtLCBzdGF0ZSk7XG59XG5cbi8vIE11c3QgZm9yY2UgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIG9uIG5leHRUaWNrLCBzbyB0aGF0IHdlIGRvbid0XG4vLyBlbWl0ICdkcmFpbicgYmVmb3JlIHRoZSB3cml0ZSgpIGNvbnN1bWVyIGdldHMgdGhlICdmYWxzZScgcmV0dXJuXG4vLyB2YWx1ZSwgYW5kIGhhcyBhIGNoYW5jZSB0byBhdHRhY2ggYSAnZHJhaW4nIGxpc3RlbmVyLlxuZnVuY3Rpb24gb253cml0ZURyYWluKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5uZWVkRHJhaW4pIHtcbiAgICBzdGF0ZS5uZWVkRHJhaW4gPSBmYWxzZTtcbiAgICBzdHJlYW0uZW1pdCgnZHJhaW4nKTtcbiAgfVxufVxuXG5cbi8vIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIGluIHRoZSBidWZmZXIgd2FpdGluZywgdGhlbiBwcm9jZXNzIGl0XG5mdW5jdGlvbiBjbGVhckJ1ZmZlcihzdHJlYW0sIHN0YXRlKSB7XG4gIHN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gIGZvciAodmFyIGMgPSAwOyBjIDwgc3RhdGUuYnVmZmVyLmxlbmd0aDsgYysrKSB7XG4gICAgdmFyIGVudHJ5ID0gc3RhdGUuYnVmZmVyW2NdO1xuICAgIHZhciBjaHVuayA9IGVudHJ5LmNodW5rO1xuICAgIHZhciBlbmNvZGluZyA9IGVudHJ5LmVuY29kaW5nO1xuICAgIHZhciBjYiA9IGVudHJ5LmNhbGxiYWNrO1xuICAgIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcblxuICAgIC8vIGlmIHdlIGRpZG4ndCBjYWxsIHRoZSBvbndyaXRlIGltbWVkaWF0ZWx5LCB0aGVuXG4gICAgLy8gaXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHdhaXQgdW50aWwgaXQgZG9lcy5cbiAgICAvLyBhbHNvLCB0aGF0IG1lYW5zIHRoYXQgdGhlIGNodW5rIGFuZCBjYiBhcmUgY3VycmVudGx5XG4gICAgLy8gYmVpbmcgcHJvY2Vzc2VkLCBzbyBtb3ZlIHRoZSBidWZmZXIgY291bnRlciBwYXN0IHRoZW0uXG4gICAgaWYgKHN0YXRlLndyaXRpbmcpIHtcbiAgICAgIGMrKztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgaWYgKGMgPCBzdGF0ZS5idWZmZXIubGVuZ3RoKVxuICAgIHN0YXRlLmJ1ZmZlciA9IHN0YXRlLmJ1ZmZlci5zbGljZShjKTtcbiAgZWxzZVxuICAgIHN0YXRlLmJ1ZmZlci5sZW5ndGggPSAwO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24oY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjYihuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpKTtcbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgaWYgKHR5cGVvZiBjaHVuayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gY2h1bms7XG4gICAgY2h1bmsgPSBudWxsO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IGVuY29kaW5nO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgY2h1bmsgIT09ICd1bmRlZmluZWQnICYmIGNodW5rICE9PSBudWxsKVxuICAgIHRoaXMud3JpdGUoY2h1bmssIGVuY29kaW5nKTtcblxuICAvLyBpZ25vcmUgdW5uZWNlc3NhcnkgZW5kKCkgY2FsbHMuXG4gIGlmICghc3RhdGUuZW5kaW5nICYmICFzdGF0ZS5maW5pc2hlZClcbiAgICBlbmRXcml0YWJsZSh0aGlzLCBzdGF0ZSwgY2IpO1xufTtcblxuXG5mdW5jdGlvbiBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpIHtcbiAgcmV0dXJuIChzdGF0ZS5lbmRpbmcgJiZcbiAgICAgICAgICBzdGF0ZS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAhc3RhdGUuZmluaXNoZWQgJiZcbiAgICAgICAgICAhc3RhdGUud3JpdGluZyk7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIG5lZWQgPSBuZWVkRmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuICBpZiAobmVlZCkge1xuICAgIHN0YXRlLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICBzdHJlYW0uZW1pdCgnZmluaXNoJyk7XG4gIH1cbiAgcmV0dXJuIG5lZWQ7XG59XG5cbmZ1bmN0aW9uIGVuZFdyaXRhYmxlKHN0cmVhbSwgc3RhdGUsIGNiKSB7XG4gIHN0YXRlLmVuZGluZyA9IHRydWU7XG4gIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpO1xuICBpZiAoY2IpIHtcbiAgICBpZiAoc3RhdGUuZmluaXNoZWQpXG4gICAgICB0aW1lcnMuc2V0SW1tZWRpYXRlKGNiKTtcbiAgICBlbHNlXG4gICAgICBzdHJlYW0ub25jZSgnZmluaXNoJywgY2IpO1xuICB9XG4gIHN0YXRlLmVuZGVkID0gdHJ1ZTtcbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBVVElMSVRZXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBzaGltcyA9IHJlcXVpcmUoJ19zaGltcycpO1xudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLy8gMS4gVGhlIGFzc2VydCBtb2R1bGUgcHJvdmlkZXMgZnVuY3Rpb25zIHRoYXQgdGhyb3dcbi8vIEFzc2VydGlvbkVycm9yJ3Mgd2hlbiBwYXJ0aWN1bGFyIGNvbmRpdGlvbnMgYXJlIG5vdCBtZXQuIFRoZVxuLy8gYXNzZXJ0IG1vZHVsZSBtdXN0IGNvbmZvcm0gdG8gdGhlIGZvbGxvd2luZyBpbnRlcmZhY2UuXG5cbnZhciBhc3NlcnQgPSBtb2R1bGUuZXhwb3J0cyA9IG9rO1xuXG4vLyAyLiBUaGUgQXNzZXJ0aW9uRXJyb3IgaXMgZGVmaW5lZCBpbiBhc3NlcnQuXG4vLyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHsgbWVzc2FnZTogbWVzc2FnZSxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWQgfSlcblxuYXNzZXJ0LkFzc2VydGlvbkVycm9yID0gZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3Iob3B0aW9ucykge1xuICB0aGlzLm5hbWUgPSAnQXNzZXJ0aW9uRXJyb3InO1xuICB0aGlzLmFjdHVhbCA9IG9wdGlvbnMuYWN0dWFsO1xuICB0aGlzLmV4cGVjdGVkID0gb3B0aW9ucy5leHBlY3RlZDtcbiAgdGhpcy5vcGVyYXRvciA9IG9wdGlvbnMub3BlcmF0b3I7XG4gIHRoaXMubWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZSB8fCBnZXRNZXNzYWdlKHRoaXMpO1xufTtcblxuLy8gYXNzZXJ0LkFzc2VydGlvbkVycm9yIGluc3RhbmNlb2YgRXJyb3JcbnV0aWwuaW5oZXJpdHMoYXNzZXJ0LkFzc2VydGlvbkVycm9yLCBFcnJvcik7XG5cbmZ1bmN0aW9uIHJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuICcnICsgdmFsdWU7XG4gIH1cbiAgaWYgKHV0aWwuaXNOdW1iZXIodmFsdWUpICYmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSB8fCB1dGlsLmlzUmVnRXhwKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdHJ1bmNhdGUocywgbikge1xuICBpZiAodXRpbC5pc1N0cmluZyhzKSkge1xuICAgIHJldHVybiBzLmxlbmd0aCA8IG4gPyBzIDogcy5zbGljZSgwLCBuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlKHNlbGYpIHtcbiAgcmV0dXJuIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuYWN0dWFsLCByZXBsYWNlciksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmV4cGVjdGVkLCByZXBsYWNlciksIDEyOCk7XG59XG5cbi8vIEF0IHByZXNlbnQgb25seSB0aGUgdGhyZWUga2V5cyBtZW50aW9uZWQgYWJvdmUgYXJlIHVzZWQgYW5kXG4vLyB1bmRlcnN0b29kIGJ5IHRoZSBzcGVjLiBJbXBsZW1lbnRhdGlvbnMgb3Igc3ViIG1vZHVsZXMgY2FuIHBhc3Ncbi8vIG90aGVyIGtleXMgdG8gdGhlIEFzc2VydGlvbkVycm9yJ3MgY29uc3RydWN0b3IgLSB0aGV5IHdpbGwgYmVcbi8vIGlnbm9yZWQuXG5cbi8vIDMuIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuICBBbGwgYXNzZXJ0aW9uIG1ldGhvZHMgcHJvdmlkZVxuLy8gYm90aCB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgdG8gdGhlIGFzc2VydGlvbiBlcnJvciBmb3Jcbi8vIGRpc3BsYXkgcHVycG9zZXMuXG5cbmZ1bmN0aW9uIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IsIHN0YWNrU3RhcnRGdW5jdGlvbikge1xuICB0aHJvdyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IsXG4gICAgc3RhY2tTdGFydEZ1bmN0aW9uOiBzdGFja1N0YXJ0RnVuY3Rpb25cbiAgfSk7XG59XG5cbi8vIEVYVEVOU0lPTiEgYWxsb3dzIGZvciB3ZWxsIGJlaGF2ZWQgZXJyb3JzIGRlZmluZWQgZWxzZXdoZXJlLlxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyA0LiBQdXJlIGFzc2VydGlvbiB0ZXN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdHJ1dGh5LCBhcyBkZXRlcm1pbmVkXG4vLyBieSAhIWd1YXJkLlxuLy8gYXNzZXJ0Lm9rKGd1YXJkLCBtZXNzYWdlX29wdCk7XG4vLyBUaGlzIHN0YXRlbWVudCBpcyBlcXVpdmFsZW50IHRvIGFzc2VydC5lcXVhbCh0cnVlLCAhIWd1YXJkLFxuLy8gbWVzc2FnZV9vcHQpOy4gVG8gdGVzdCBzdHJpY3RseSBmb3IgdGhlIHZhbHVlIHRydWUsIHVzZVxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKHRydWUsIGd1YXJkLCBtZXNzYWdlX29wdCk7LlxuXG5mdW5jdGlvbiBvayh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQub2spO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIDUuIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aFxuLy8gPT0uXG4vLyBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiBlcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09JywgYXNzZXJ0LmVxdWFsKTtcbn07XG5cbi8vIDYuIFRoZSBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciB3aGV0aGVyIHR3byBvYmplY3RzIGFyZSBub3QgZXF1YWxcbi8vIHdpdGggIT0gYXNzZXJ0Lm5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT0nLCBhc3NlcnQubm90RXF1YWwpO1xuICB9XG59O1xuXG4vLyA3LiBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbi8vIGFzc2VydC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZGVlcEVxdWFsID0gZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcEVxdWFsJywgYXNzZXJ0LmRlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNCdWZmZXIoYWN0dWFsKSAmJiB1dGlsLmlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIGlmIChhY3R1YWwubGVuZ3RoICE9IGV4cGVjdGVkLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCF1dGlsLmlzT2JqZWN0KGFjdHVhbCkgJiYgIXV0aWwuaXNPYmplY3QoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiKSB7XG4gIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiKTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IHNoaW1zLmtleXMoYSksXG4gICAgICAgIGtiID0gc2hpbXMua2V5cyhiKSxcbiAgICAgICAga2V5LCBpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwRXF1YWwnLCBhc3NlcnQubm90RGVlcEVxdWFsKTtcbiAgfVxufTtcblxuLy8gOS4gVGhlIHN0cmljdCBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc3RyaWN0IGVxdWFsaXR5LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbi8vIGFzc2VydC5zdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5zdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PT0nLCBhc3NlcnQuc3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG4vLyAxMC4gVGhlIHN0cmljdCBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciBzdHJpY3QgaW5lcXVhbGl0eSwgYXNcbi8vIGRldGVybWluZWQgYnkgIT09LiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9PScsIGFzc2VydC5ub3RTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpO1xuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dzKHNob3VsZFRocm93LCBibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGFjdHVhbDtcblxuICBpZiAodXRpbC5pc1N0cmluZyhleHBlY3RlZCkpIHtcbiAgICBtZXNzYWdlID0gZXhwZWN0ZWQ7XG4gICAgZXhwZWN0ZWQgPSBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYWN0dWFsID0gZTtcbiAgfVxuXG4gIG1lc3NhZ2UgPSAoZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubmFtZSA/ICcgKCcgKyBleHBlY3RlZC5uYW1lICsgJykuJyA6ICcuJykgK1xuICAgICAgICAgICAgKG1lc3NhZ2UgPyAnICcgKyBtZXNzYWdlIDogJy4nKTtcblxuICBpZiAoc2hvdWxkVGhyb3cgJiYgIWFjdHVhbCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKCFzaG91bGRUaHJvdyAmJiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ0dvdCB1bndhbnRlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoKHNob3VsZFRocm93ICYmIGFjdHVhbCAmJiBleHBlY3RlZCAmJlxuICAgICAgIWV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fCAoIXNob3VsZFRocm93ICYmIGFjdHVhbCkpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH1cbn1cblxuLy8gMTEuIEV4cGVjdGVkIHRvIHRocm93IGFuIGVycm9yOlxuLy8gYXNzZXJ0LnRocm93cyhibG9jaywgRXJyb3Jfb3B0LCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC50aHJvd3MgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbdHJ1ZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbi8vIEVYVEVOU0lPTiEgVGhpcyBpcyBhbm5veWluZyB0byB3cml0ZSBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW2ZhbHNlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuYXNzZXJ0LmlmRXJyb3IgPSBmdW5jdGlvbihlcnIpIHsgaWYgKGVycikge3Rocm93IGVycjt9fTsiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghdXRpbC5pc051bWJlcihuKSB8fCBuIDwgMClcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAodXRpbC5pc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIHV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAodXRpbC5pc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAodXRpbC5pc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmICh1dGlsLmlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbm1vZHVsZS5leHBvcnRzID0gU3RyZWFtO1xuXG52YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxudXRpbC5pbmhlcml0cyhTdHJlYW0sIEVFKTtcblN0cmVhbS5SZWFkYWJsZSA9IHJlcXVpcmUoJ19zdHJlYW1fcmVhZGFibGUnKTtcblN0cmVhbS5Xcml0YWJsZSA9IHJlcXVpcmUoJ19zdHJlYW1fd3JpdGFibGUnKTtcblN0cmVhbS5EdXBsZXggPSByZXF1aXJlKCdfc3RyZWFtX2R1cGxleCcpO1xuU3RyZWFtLlRyYW5zZm9ybSA9IHJlcXVpcmUoJ19zdHJlYW1fdHJhbnNmb3JtJyk7XG5TdHJlYW0uUGFzc1Rocm91Z2ggPSByZXF1aXJlKCdfc3RyZWFtX3Bhc3N0aHJvdWdoJyk7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuNC54XG5TdHJlYW0uU3RyZWFtID0gU3RyZWFtO1xuXG5cblxuLy8gb2xkLXN0eWxlIHN0cmVhbXMuICBOb3RlIHRoYXQgdGhlIHBpcGUgbWV0aG9kICh0aGUgb25seSByZWxldmFudFxuLy8gcGFydCBvZiB0aGlzIGNsYXNzKSBpcyBvdmVycmlkZGVuIGluIHRoZSBSZWFkYWJsZSBjbGFzcy5cblxuZnVuY3Rpb24gU3RyZWFtKCkge1xuICBFRS5jYWxsKHRoaXMpO1xufVxuXG5TdHJlYW0ucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbihkZXN0LCBvcHRpb25zKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzO1xuXG4gIGZ1bmN0aW9uIG9uZGF0YShjaHVuaykge1xuICAgIGlmIChkZXN0LndyaXRhYmxlKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IGRlc3Qud3JpdGUoY2h1bmspICYmIHNvdXJjZS5wYXVzZSkge1xuICAgICAgICBzb3VyY2UucGF1c2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzb3VyY2Uub24oJ2RhdGEnLCBvbmRhdGEpO1xuXG4gIGZ1bmN0aW9uIG9uZHJhaW4oKSB7XG4gICAgaWYgKHNvdXJjZS5yZWFkYWJsZSAmJiBzb3VyY2UucmVzdW1lKSB7XG4gICAgICBzb3VyY2UucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdC5vbignZHJhaW4nLCBvbmRyYWluKTtcblxuICAvLyBJZiB0aGUgJ2VuZCcgb3B0aW9uIGlzIG5vdCBzdXBwbGllZCwgZGVzdC5lbmQoKSB3aWxsIGJlIGNhbGxlZCB3aGVuXG4gIC8vIHNvdXJjZSBnZXRzIHRoZSAnZW5kJyBvciAnY2xvc2UnIGV2ZW50cy4gIE9ubHkgZGVzdC5lbmQoKSBvbmNlLlxuICBpZiAoIWRlc3QuX2lzU3RkaW8gJiYgKCFvcHRpb25zIHx8IG9wdGlvbnMuZW5kICE9PSBmYWxzZSkpIHtcbiAgICBzb3VyY2Uub24oJ2VuZCcsIG9uZW5kKTtcbiAgICBzb3VyY2Uub24oJ2Nsb3NlJywgb25jbG9zZSk7XG4gIH1cblxuICB2YXIgZGlkT25FbmQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gb25lbmQoKSB7XG4gICAgaWYgKGRpZE9uRW5kKSByZXR1cm47XG4gICAgZGlkT25FbmQgPSB0cnVlO1xuXG4gICAgZGVzdC5lbmQoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBpZiAoZGlkT25FbmQpIHJldHVybjtcbiAgICBkaWRPbkVuZCA9IHRydWU7XG5cbiAgICBpZiAodHlwZW9mIGRlc3QuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykgZGVzdC5kZXN0cm95KCk7XG4gIH1cblxuICAvLyBkb24ndCBsZWF2ZSBkYW5nbGluZyBwaXBlcyB3aGVuIHRoZXJlIGFyZSBlcnJvcnMuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoZXIpIHtcbiAgICBjbGVhbnVwKCk7XG4gICAgaWYgKEVFLmxpc3RlbmVyQ291bnQodGhpcywgJ2Vycm9yJykgPT09IDApIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgc3RyZWFtIGVycm9yIGluIHBpcGUuXG4gICAgfVxuICB9XG5cbiAgc291cmNlLm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuICBkZXN0Lm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuXG4gIC8vIHJlbW92ZSBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBvbmVuZCk7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGNsZWFudXApO1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGVhbnVwKTtcblxuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xlYW51cCk7XG4gIH1cblxuICBzb3VyY2Uub24oJ2VuZCcsIGNsZWFudXApO1xuICBzb3VyY2Uub24oJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgZGVzdC5vbignY2xvc2UnLCBjbGVhbnVwKTtcblxuICBkZXN0LmVtaXQoJ3BpcGUnLCBzb3VyY2UpO1xuXG4gIC8vIEFsbG93IGZvciB1bml4LWxpa2UgdXNhZ2U6IEEucGlwZShCKS5waXBlKEMpXG4gIHJldHVybiBkZXN0O1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuXG5mdW5jdGlvbiBhc3NlcnRFbmNvZGluZyhlbmNvZGluZykge1xuICBpZiAoZW5jb2RpbmcgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKTtcbiAgfVxufVxuXG52YXIgU3RyaW5nRGVjb2RlciA9IGV4cG9ydHMuU3RyaW5nRGVjb2RlciA9IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gIHRoaXMuZW5jb2RpbmcgPSAoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1stX10vLCAnJyk7XG4gIGFzc2VydEVuY29kaW5nKGVuY29kaW5nKTtcbiAgc3dpdGNoICh0aGlzLmVuY29kaW5nKSB7XG4gICAgY2FzZSAndXRmOCc6XG4gICAgICAvLyBDRVNVLTggcmVwcmVzZW50cyBlYWNoIG9mIFN1cnJvZ2F0ZSBQYWlyIGJ5IDMtYnl0ZXNcbiAgICAgIHRoaXMuc3Vycm9nYXRlU2l6ZSA9IDM7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIC8vIFVURi0xNiByZXByZXNlbnRzIGVhY2ggb2YgU3Vycm9nYXRlIFBhaXIgYnkgMi1ieXRlc1xuICAgICAgdGhpcy5zdXJyb2dhdGVTaXplID0gMjtcbiAgICAgIHRoaXMuZGV0ZWN0SW5jb21wbGV0ZUNoYXIgPSB1dGYxNkRldGVjdEluY29tcGxldGVDaGFyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIC8vIEJhc2UtNjQgc3RvcmVzIDMgYnl0ZXMgaW4gNCBjaGFycywgYW5kIHBhZHMgdGhlIHJlbWFpbmRlci5cbiAgICAgIHRoaXMuc3Vycm9nYXRlU2l6ZSA9IDM7XG4gICAgICB0aGlzLmRldGVjdEluY29tcGxldGVDaGFyID0gYmFzZTY0RGV0ZWN0SW5jb21wbGV0ZUNoYXI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy53cml0ZSA9IHBhc3NUaHJvdWdoV3JpdGU7XG4gICAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmNoYXJCdWZmZXIgPSBuZXcgQnVmZmVyKDYpO1xuICB0aGlzLmNoYXJSZWNlaXZlZCA9IDA7XG4gIHRoaXMuY2hhckxlbmd0aCA9IDA7XG59O1xuXG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIHZhciBjaGFyU3RyID0gJyc7XG4gIHZhciBvZmZzZXQgPSAwO1xuXG4gIC8vIGlmIG91ciBsYXN0IHdyaXRlIGVuZGVkIHdpdGggYW4gaW5jb21wbGV0ZSBtdWx0aWJ5dGUgY2hhcmFjdGVyXG4gIHdoaWxlICh0aGlzLmNoYXJMZW5ndGgpIHtcbiAgICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgcmVtYWluaW5nIGJ5dGVzIHRoaXMgYnVmZmVyIGhhcyB0byBvZmZlciBmb3IgdGhpcyBjaGFyXG4gICAgdmFyIGkgPSAoYnVmZmVyLmxlbmd0aCA+PSB0aGlzLmNoYXJMZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCkgP1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhckxlbmd0aCAtIHRoaXMuY2hhclJlY2VpdmVkIDpcbiAgICAgICAgICAgICAgICBidWZmZXIubGVuZ3RoO1xuXG4gICAgLy8gYWRkIHRoZSBuZXcgYnl0ZXMgdG8gdGhlIGNoYXIgYnVmZmVyXG4gICAgYnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCB0aGlzLmNoYXJSZWNlaXZlZCwgb2Zmc2V0LCBpKTtcbiAgICB0aGlzLmNoYXJSZWNlaXZlZCArPSAoaSAtIG9mZnNldCk7XG4gICAgb2Zmc2V0ID0gaTtcblxuICAgIGlmICh0aGlzLmNoYXJSZWNlaXZlZCA8IHRoaXMuY2hhckxlbmd0aCkge1xuICAgICAgLy8gc3RpbGwgbm90IGVub3VnaCBjaGFycyBpbiB0aGlzIGJ1ZmZlcj8gd2FpdCBmb3IgbW9yZSAuLi5cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIGNoYXJhY3RlciB0aGF0IHdhcyBzcGxpdFxuICAgIGNoYXJTdHIgPSB0aGlzLmNoYXJCdWZmZXIuc2xpY2UoMCwgdGhpcy5jaGFyTGVuZ3RoKS50b1N0cmluZyh0aGlzLmVuY29kaW5nKTtcblxuICAgIC8vIGxlYWQgc3Vycm9nYXRlIChEODAwLURCRkYpIGlzIGFsc28gdGhlIGluY29tcGxldGUgY2hhcmFjdGVyXG4gICAgdmFyIGNoYXJDb2RlID0gY2hhclN0ci5jaGFyQ29kZUF0KGNoYXJTdHIubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGNoYXJDb2RlID49IDB4RDgwMCAmJiBjaGFyQ29kZSA8PSAweERCRkYpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCArPSB0aGlzLnN1cnJvZ2F0ZVNpemU7XG4gICAgICBjaGFyU3RyID0gJyc7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgdGhpcy5jaGFyUmVjZWl2ZWQgPSB0aGlzLmNoYXJMZW5ndGggPSAwO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIG1vcmUgYnl0ZXMgaW4gdGhpcyBidWZmZXIsIGp1c3QgZW1pdCBvdXIgY2hhclxuICAgIGlmIChpID09IGJ1ZmZlci5sZW5ndGgpIHJldHVybiBjaGFyU3RyO1xuXG4gICAgLy8gb3RoZXJ3aXNlIGN1dCBvZmYgdGhlIGNoYXJhY3RlcnMgZW5kIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGlzIGJ1ZmZlclxuICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShpLCBidWZmZXIubGVuZ3RoKTtcbiAgICBicmVhaztcbiAgfVxuXG4gIHZhciBsZW5JbmNvbXBsZXRlID0gdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhcihidWZmZXIpO1xuXG4gIHZhciBlbmQgPSBidWZmZXIubGVuZ3RoO1xuICBpZiAodGhpcy5jaGFyTGVuZ3RoKSB7XG4gICAgLy8gYnVmZmVyIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlciBieXRlcyB3ZSBnb3RcbiAgICBidWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIDAsIGJ1ZmZlci5sZW5ndGggLSBsZW5JbmNvbXBsZXRlLCBlbmQpO1xuICAgIHRoaXMuY2hhclJlY2VpdmVkID0gbGVuSW5jb21wbGV0ZTtcbiAgICBlbmQgLT0gbGVuSW5jb21wbGV0ZTtcbiAgfVxuXG4gIGNoYXJTdHIgKz0gYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcsIDAsIGVuZCk7XG5cbiAgdmFyIGVuZCA9IGNoYXJTdHIubGVuZ3RoIC0gMTtcbiAgdmFyIGNoYXJDb2RlID0gY2hhclN0ci5jaGFyQ29kZUF0KGVuZCk7XG4gIC8vIGxlYWQgc3Vycm9nYXRlIChEODAwLURCRkYpIGlzIGFsc28gdGhlIGluY29tcGxldGUgY2hhcmFjdGVyXG4gIGlmIChjaGFyQ29kZSA+PSAweEQ4MDAgJiYgY2hhckNvZGUgPD0gMHhEQkZGKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLnN1cnJvZ2F0ZVNpemU7XG4gICAgdGhpcy5jaGFyTGVuZ3RoICs9IHNpemU7XG4gICAgdGhpcy5jaGFyUmVjZWl2ZWQgKz0gc2l6ZTtcbiAgICB0aGlzLmNoYXJCdWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIHNpemUsIDAsIHNpemUpO1xuICAgIHRoaXMuY2hhckJ1ZmZlci53cml0ZShjaGFyU3RyLmNoYXJBdChjaGFyU3RyLmxlbmd0aCAtIDEpLCB0aGlzLmVuY29kaW5nKTtcbiAgICByZXR1cm4gY2hhclN0ci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgfVxuXG4gIC8vIG9yIGp1c3QgZW1pdCB0aGUgY2hhclN0clxuICByZXR1cm4gY2hhclN0cjtcbn07XG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmRldGVjdEluY29tcGxldGVDaGFyID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIC8vIGRldGVybWluZSBob3cgbWFueSBieXRlcyB3ZSBoYXZlIHRvIGNoZWNrIGF0IHRoZSBlbmQgb2YgdGhpcyBidWZmZXJcbiAgdmFyIGkgPSAoYnVmZmVyLmxlbmd0aCA+PSAzKSA/IDMgOiBidWZmZXIubGVuZ3RoO1xuXG4gIC8vIEZpZ3VyZSBvdXQgaWYgb25lIG9mIHRoZSBsYXN0IGkgYnl0ZXMgb2Ygb3VyIGJ1ZmZlciBhbm5vdW5jZXMgYW5cbiAgLy8gaW5jb21wbGV0ZSBjaGFyLlxuICBmb3IgKDsgaSA+IDA7IGktLSkge1xuICAgIHZhciBjID0gYnVmZmVyW2J1ZmZlci5sZW5ndGggLSBpXTtcblxuICAgIC8vIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VURi04I0Rlc2NyaXB0aW9uXG5cbiAgICAvLyAxMTBYWFhYWFxuICAgIGlmIChpID09IDEgJiYgYyA+PiA1ID09IDB4MDYpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCA9IDI7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyAxMTEwWFhYWFxuICAgIGlmIChpIDw9IDIgJiYgYyA+PiA0ID09IDB4MEUpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCA9IDM7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyAxMTExMFhYWFxuICAgIGlmIChpIDw9IDMgJiYgYyA+PiAzID09IDB4MUUpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCA9IDQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaTtcbn07XG5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICB2YXIgcmVzID0gJyc7XG4gIGlmIChidWZmZXIgJiYgYnVmZmVyLmxlbmd0aClcbiAgICByZXMgPSB0aGlzLndyaXRlKGJ1ZmZlcik7XG5cbiAgaWYgKHRoaXMuY2hhclJlY2VpdmVkKSB7XG4gICAgdmFyIGNyID0gdGhpcy5jaGFyUmVjZWl2ZWQ7XG4gICAgdmFyIGJ1ZiA9IHRoaXMuY2hhckJ1ZmZlcjtcbiAgICB2YXIgZW5jID0gdGhpcy5lbmNvZGluZztcbiAgICByZXMgKz0gYnVmLnNsaWNlKDAsIGNyKS50b1N0cmluZyhlbmMpO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn07XG5cbmZ1bmN0aW9uIHBhc3NUaHJvdWdoV3JpdGUoYnVmZmVyKSB7XG4gIHJldHVybiBidWZmZXIudG9TdHJpbmcodGhpcy5lbmNvZGluZyk7XG59XG5cbmZ1bmN0aW9uIHV0ZjE2RGV0ZWN0SW5jb21wbGV0ZUNoYXIoYnVmZmVyKSB7XG4gIHZhciBpbmNvbXBsZXRlID0gdGhpcy5jaGFyUmVjZWl2ZWQgPSBidWZmZXIubGVuZ3RoICUgMjtcbiAgdGhpcy5jaGFyTGVuZ3RoID0gaW5jb21wbGV0ZSA/IDIgOiAwO1xuICByZXR1cm4gaW5jb21wbGV0ZTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0RGV0ZWN0SW5jb21wbGV0ZUNoYXIoYnVmZmVyKSB7XG4gIHZhciBpbmNvbXBsZXRlID0gdGhpcy5jaGFyUmVjZWl2ZWQgPSBidWZmZXIubGVuZ3RoICUgMztcbiAgdGhpcy5jaGFyTGVuZ3RoID0gaW5jb21wbGV0ZSA/IDMgOiAwO1xuICByZXR1cm4gaW5jb21wbGV0ZTtcbn1cbiIsInRyeSB7XG4gICAgLy8gT2xkIElFIGJyb3dzZXJzIHRoYXQgZG8gbm90IGN1cnJ5IGFyZ3VtZW50c1xuICAgIGlmICghc2V0VGltZW91dC5jYWxsKSB7XG4gICAgICAgIHZhciBzbGljZXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG4gICAgICAgIGV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IHNsaWNlci5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIGV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbihmbikge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBzbGljZXIuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGV4cG9ydHMuc2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIGV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbDtcbiAgICB9XG4gICAgZXhwb3J0cy5jbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgZXhwb3J0cy5jbGVhckludGVydmFsID0gY2xlYXJJbnRlcnZhbDtcblxuICAgIGlmICh3aW5kb3cuc2V0SW1tZWRpYXRlKSB7XG4gICAgICBleHBvcnRzLnNldEltbWVkaWF0ZSA9IHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlID0gd2luZG93LmNsZWFySW1tZWRpYXRlO1xuICAgIH1cblxuICAgIC8vIENocm9tZSBhbmQgUGhhbnRvbUpTIHNlZW1zIHRvIGRlcGVuZCBvbiBgdGhpc2AgcHNldWRvIHZhcmlhYmxlIGJlaW5nIGFcbiAgICAvLyBgd2luZG93YCBhbmQgdGhyb3dzIGludmFsaWQgaW52b2NhdGlvbiBleGNlcHRpb24gb3RoZXJ3aXNlLiBJZiB0aGlzIGNvZGVcbiAgICAvLyBydW5zIGluIHN1Y2ggSlMgcnVudGltZSBuZXh0IGxpbmUgd2lsbCB0aHJvdyBhbmQgYGNhdGNoYCBjbGF1c2Ugd2lsbFxuICAgIC8vIGV4cG9ydGVkIHRpbWVycyBmdW5jdGlvbnMgYm91bmQgdG8gYSB3aW5kb3cuXG4gICAgZXhwb3J0cy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge30pO1xufSBjYXRjaCAoXykge1xuICAgIGZ1bmN0aW9uIGJpbmQoZiwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gZi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpIH07XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBleHBvcnRzLnNldFRpbWVvdXQgPSBiaW5kKHNldFRpbWVvdXQsIHdpbmRvdyk7XG4gICAgICBleHBvcnRzLnNldEludGVydmFsID0gYmluZChzZXRJbnRlcnZhbCwgd2luZG93KTtcbiAgICAgIGV4cG9ydHMuY2xlYXJUaW1lb3V0ID0gYmluZChjbGVhclRpbWVvdXQsIHdpbmRvdyk7XG4gICAgICBleHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBiaW5kKGNsZWFySW50ZXJ2YWwsIHdpbmRvdyk7XG4gICAgICBpZiAod2luZG93LnNldEltbWVkaWF0ZSkge1xuICAgICAgICBleHBvcnRzLnNldEltbWVkaWF0ZSA9IGJpbmQod2luZG93LnNldEltbWVkaWF0ZSwgd2luZG93KTtcbiAgICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IGJpbmQod2luZG93LmNsZWFySW1tZWRpYXRlLCB3aW5kb3cpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGV4cG9ydHMuc2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHNldEludGVydmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBleHBvcnRzLnNldEludGVydmFsID0gc2V0SW50ZXJ2YWw7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZXhwb3J0cy5jbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNsZWFySW50ZXJ2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZXhwb3J0cy5jbGVhckludGVydmFsID0gY2xlYXJJbnRlcnZhbDtcbiAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMudW5yZWYgPSBmdW5jdGlvbiB1bnJlZigpIHt9O1xuZXhwb3J0cy5yZWYgPSBmdW5jdGlvbiByZWYoKSB7fTtcblxuaWYgKCFleHBvcnRzLnNldEltbWVkaWF0ZSkge1xuICB2YXIgY3VycmVudEtleSA9IDAsIHF1ZXVlID0ge30sIGFjdGl2ZSA9IGZhbHNlO1xuXG4gIGV4cG9ydHMuc2V0SW1tZWRpYXRlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgIGZ1bmN0aW9uIGRyYWluKCkge1xuICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHF1ZXVlKSB7XG4gICAgICAgICAgaWYgKHF1ZXVlLmhhc093blByb3BlcnR5KGN1cnJlbnRLZXksIGtleSkpIHtcbiAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlW2tleV07XG4gICAgICAgICAgICBkZWxldGUgcXVldWVba2V5XTtcbiAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgIGlmIChldi5zb3VyY2UgPT09IHdpbmRvdyAmJiBldi5kYXRhID09PSAnYnJvd3NlcmlmeS10aWNrJykge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBkcmFpbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldEltbWVkaWF0ZShmbikge1xuICAgICAgICAgIHZhciBpZCA9ICsrY3VycmVudEtleTtcbiAgICAgICAgICBxdWV1ZVtpZF0gPSBmbjtcbiAgICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgnYnJvd3NlcmlmeS10aWNrJywgJyonKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldEltbWVkaWF0ZShmbikge1xuICAgICAgICAgIHZhciBpZCA9ICsrY3VycmVudEtleTtcbiAgICAgICAgICBxdWV1ZVtpZF0gPSBmbjtcbiAgICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgICAgYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZHJhaW4sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gIH0pKCk7XG5cbiAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGlkKSB7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbn1cbiIsIlxuZXhwb3J0cy5pc2F0dHkgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfTtcblxuZnVuY3Rpb24gUmVhZFN0cmVhbSgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCd0dHkuUmVhZFN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbn1cbmV4cG9ydHMuUmVhZFN0cmVhbSA9IFJlYWRTdHJlYW07XG5cbmZ1bmN0aW9uIFdyaXRlU3RyZWFtKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3R0eS5SZWFkU3RyZWFtIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xufVxuZXhwb3J0cy5Xcml0ZVN0cmVhbSA9IFdyaXRlU3RyZWFtO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBzaGltcyA9IHJlcXVpcmUoJ19zaGltcycpO1xuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIHNoaW1zLmZvckVhY2goYXJyYXksIGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBzaGltcy5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IHNoaW1zLmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG5cbiAgc2hpbXMuZm9yRWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBzaGltcy5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoc2hpbXMuaW5kZXhPZihjdHguc2VlbiwgZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IHNoaW1zLnJlZHVjZShvdXRwdXQsIGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBzaGltcy5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZztcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJiBvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJztcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5iaW5hcnlTbGljZSA9PT0gJ2Z1bmN0aW9uJ1xuICA7XG59XG5leHBvcnRzLmlzQnVmZmVyID0gaXNCdWZmZXI7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IGZ1bmN0aW9uKGN0b3IsIHN1cGVyQ3Rvcikge1xuICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgY3Rvci5wcm90b3R5cGUgPSBzaGltcy5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogY3RvcixcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IHNoaW1zLmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsImV4cG9ydHMucmVhZElFRUU3NTQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNCRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNCRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNCRSA/IDEgOiAtMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlSUVFRTc1NCA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0JFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0JFID8gLTEgOiAxLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG4iLCJ2YXIgYXNzZXJ0O1xuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXI7XG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXI7XG5CdWZmZXIucG9vbFNpemUgPSA4MTkyO1xuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwO1xuXG5mdW5jdGlvbiBzdHJpbmd0cmltKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuZnVuY3Rpb24gQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBvZmZzZXQpIHtcbiAgaWYoIWFzc2VydCkgYXNzZXJ0PSByZXF1aXJlKCdhc3NlcnQnKTtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgb2Zmc2V0KTtcbiAgfVxuICB0aGlzLnBhcmVudCA9IHRoaXM7XG4gIHRoaXMub2Zmc2V0ID0gMDtcblxuICAvLyBXb3JrLWFyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvblxuICAvLyBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5ncyB3aGlsZSBiYXNlNjQtanNcbiAgLy8gZG9lcyBub3QuLlxuICBpZiAoZW5jb2RpbmcgPT0gXCJiYXNlNjRcIiAmJiB0eXBlb2Ygc3ViamVjdCA9PSBcInN0cmluZ1wiKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdCk7XG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArIFwiPVwiOyBcbiAgICB9XG4gIH1cblxuICB2YXIgdHlwZTtcblxuICAvLyBBcmUgd2Ugc2xpY2luZz9cbiAgaWYgKHR5cGVvZiBvZmZzZXQgPT09ICdudW1iZXInKSB7XG4gICAgdGhpcy5sZW5ndGggPSBjb2VyY2UoZW5jb2RpbmcpO1xuICAgIC8vIHNsaWNpbmcgd29ya3MsIHdpdGggbGltaXRhdGlvbnMgKG5vIHBhcmVudCB0cmFja2luZy91cGRhdGUpXG4gICAgLy8gY2hlY2sgaHR0cHM6Ly9naXRodWIuY29tL3Rvb3RzL2J1ZmZlci1icm93c2VyaWZ5L2lzc3Vlcy8xOVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzW2ldID0gc3ViamVjdC5nZXQoaStvZmZzZXQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgICBzd2l0Y2ggKHR5cGUgPSB0eXBlb2Ygc3ViamVjdCkge1xuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgdGhpcy5sZW5ndGggPSBjb2VyY2Uoc3ViamVjdCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICB0aGlzLmxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ29iamVjdCc6IC8vIEFzc3VtZSBvYmplY3QgaXMgYW4gYXJyYXlcbiAgICAgICAgdGhpcy5sZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXJyYXkgb3Igc3RyaW5nLicpO1xuICAgIH1cblxuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheS5cbiAgICBpZiAoaXNBcnJheUlzaChzdWJqZWN0KSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdWJqZWN0IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgdGhpc1tpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXNbaV0gPSBzdWJqZWN0W2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBXZSBhcmUgYSBzdHJpbmdcbiAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZyk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXNbaV0gPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldChpKSB7XG4gIGlmIChpIDwgMCB8fCBpID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ29vYicpO1xuICByZXR1cm4gdGhpc1tpXTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KGksIHYpIHtcbiAgaWYgKGkgPCAwIHx8IGkgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignb29iJyk7XG4gIHJldHVybiB0aGlzW2ldID0gdjtcbn07XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChlbmNvZGluZyB8fCBcInV0ZjhcIikge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gc3RyLmxlbmd0aCAvIDI7XG5cbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGg7XG5cbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoO1xuXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpO1xuICB9XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnV0ZjhXcml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBieXRlcywgcG9zO1xuICByZXR1cm4gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCB0aGlzLCBvZmZzZXQsIGxlbmd0aCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLmFzY2lpV3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgYnl0ZXMsIHBvcztcbiAgcmV0dXJuIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIHRoaXMsIG9mZnNldCwgbGVuZ3RoKTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUuYmluYXJ5V3JpdGUgPSBCdWZmZXIucHJvdG90eXBlLmFzY2lpV3JpdGU7XG5cbkJ1ZmZlci5wcm90b3R5cGUuYmFzZTY0V3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgYnl0ZXMsIHBvcztcbiAgcmV0dXJuIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIHRoaXMsIG9mZnNldCwgbGVuZ3RoKTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUuYmFzZTY0U2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICByZXR1cm4gcmVxdWlyZShcImJhc2U2NC1qc1wiKS5mcm9tQnl0ZUFycmF5KGJ5dGVzKTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUudXRmOFNsaWNlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYnl0ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgdmFyIHJlcyA9IFwiXCI7XG4gIHZhciB0bXAgPSBcIlwiO1xuICB2YXIgaSA9IDA7XG4gIHdoaWxlIChpIDwgYnl0ZXMubGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVzW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgICB0bXAgPSBcIlwiO1xuICAgIH0gZWxzZVxuICAgICAgdG1wICs9IFwiJVwiICsgYnl0ZXNbaV0udG9TdHJpbmcoMTYpO1xuXG4gICAgaSsrO1xuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcCk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuYXNjaWlTbGljZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGJ5dGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIHZhciByZXQgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgcmV0dXJuIHJldDtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5iaW5hcnlTbGljZSA9IEJ1ZmZlci5wcm90b3R5cGUuYXNjaWlTbGljZTtcblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvdXQgPSBbXSxcbiAgICAgIGxlbiA9IHRoaXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSk7XG4gICAgaWYgKGkgPT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+Jztcbn07XG5cblxuQnVmZmVyLnByb3RvdHlwZS5oZXhTbGljZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoO1xuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDA7XG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW47XG5cbiAgdmFyIG91dCA9ICcnO1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleCh0aGlzW2ldKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufTtcblxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpO1xuICBzdGFydCA9ICtzdGFydCB8fCAwO1xuICBpZiAodHlwZW9mIGVuZCA9PSAndW5kZWZpbmVkJykgZW5kID0gdGhpcy5sZW5ndGg7XG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoK2VuZCA9PSBzdGFydCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIHRoaXMuaGV4U2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXR1cm4gdGhpcy51dGY4U2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXR1cm4gdGhpcy5hc2NpaVNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldHVybiB0aGlzLmJpbmFyeVNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldHVybiB0aGlzLmJhc2U2NFNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgICAgcmV0dXJuIHRoaXMudWNzMlNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpO1xuICB9XG59O1xuXG5cbkJ1ZmZlci5wcm90b3R5cGUuaGV4V3JpdGUgPSBmdW5jdGlvbihzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9ICtvZmZzZXQgfHwgMDtcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0O1xuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZztcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSArbGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZztcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aDtcbiAgaWYgKHN0ckxlbiAlIDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpO1xuICB9XG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMjtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpO1xuICAgIGlmIChpc05hTihieXRlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKTtcbiAgICB0aGlzW29mZnNldCArIGldID0gYnl0ZTtcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyO1xuICByZXR1cm4gaTtcbn07XG5cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoO1xuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXQ7XG4gICAgb2Zmc2V0ID0gbGVuZ3RoO1xuICAgIGxlbmd0aCA9IHN3YXA7XG4gIH1cblxuICBvZmZzZXQgPSArb2Zmc2V0IHx8IDA7XG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldDtcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmc7XG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gK2xlbmd0aDtcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmc7XG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKTtcblxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiB0aGlzLmhleFdyaXRlKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpO1xuXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0dXJuIHRoaXMudXRmOFdyaXRlKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpO1xuXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0dXJuIHRoaXMuYXNjaWlXcml0ZShzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKTtcblxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXR1cm4gdGhpcy5iaW5hcnlXcml0ZShzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKTtcblxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXR1cm4gdGhpcy5iYXNlNjRXcml0ZShzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKTtcblxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIHJldHVybiB0aGlzLnVjczJXcml0ZShzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKTtcbiAgfVxufTtcblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW47XG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXg7XG4gIGluZGV4ICs9IGxlbjtcbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleDtcbiAgcmV0dXJuIDA7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aDtcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKTtcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbik7XG4gIHJldHVybiBuZXcgQnVmZmVyKHRoaXMsIGVuZCAtIHN0YXJ0LCArc3RhcnQpO1xufTtcblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24odGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXM7XG4gIHN0YXJ0IHx8IChzdGFydCA9IDApO1xuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgaXNOYU4oZW5kKSkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoO1xuICB9XG4gIHRhcmdldF9zdGFydCB8fCAodGFyZ2V0X3N0YXJ0ID0gMCk7XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgRXJyb3IoJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0Jyk7XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMDtcbiAgaWYgKHRhcmdldC5sZW5ndGggPT0gMCB8fCBzb3VyY2UubGVuZ3RoID09IDApIHJldHVybiAwO1xuXG4gIGlmICh0YXJnZXRfc3RhcnQgPCAwIHx8IHRhcmdldF9zdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJyk7XG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHNvdXJjZS5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKTtcbiAgfVxuXG4gIGlmIChlbmQgPCAwIHx8IGVuZCA+IHNvdXJjZS5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJyk7XG4gIH1cblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aDtcbiAgfVxuXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnQ7XG4gIH1cblxuICB2YXIgdGVtcCA9IFtdO1xuICBmb3IgKHZhciBpPXN0YXJ0OyBpPGVuZDsgaSsrKSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiB0aGlzW2ldICE9PSAndW5kZWZpbmVkJywgXCJjb3B5aW5nIHVuZGVmaW5lZCBidWZmZXIgYnl0ZXMhXCIpO1xuICAgIHRlbXAucHVzaCh0aGlzW2ldKTtcbiAgfVxuXG4gIGZvciAodmFyIGk9dGFyZ2V0X3N0YXJ0OyBpPHRhcmdldF9zdGFydCt0ZW1wLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0W2ldID0gdGVtcFtpLXRhcmdldF9zdGFydF07XG4gIH1cbn07XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICB2YWx1ZSB8fCAodmFsdWUgPSAwKTtcbiAgc3RhcnQgfHwgKHN0YXJ0ID0gMCk7XG4gIGVuZCB8fCAoZW5kID0gdGhpcy5sZW5ndGgpO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApO1xuICB9XG4gIGlmICghKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHx8IGlzTmFOKHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGEgbnVtYmVyJyk7XG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIHRocm93IG5ldyBFcnJvcignZW5kIDwgc3RhcnQnKTtcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwO1xuICBpZiAodGhpcy5sZW5ndGggPT0gMCkgcmV0dXJuIDA7XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RhcnQgb3V0IG9mIGJvdW5kcycpO1xuICB9XG5cbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJyk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZTtcbiAgfVxufVxuXG4vLyBTdGF0aWMgbWV0aG9kc1xuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIoYikge1xuICByZXR1cm4gYiBpbnN0YW5jZW9mIEJ1ZmZlciB8fCBiIGluc3RhbmNlb2YgQnVmZmVyO1xufTtcblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbiBcXFxuICAgICAgbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuXCIpO1xuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMCk7XG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGJ1ZiA9IGxpc3RbaV07XG4gICAgICB0b3RhbExlbmd0aCArPSBidWYubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKTtcbiAgdmFyIHBvcyA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBidWYgPSBsaXN0W2ldO1xuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKTtcbiAgICBwb3MgKz0gYnVmLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gYnVmZmVyO1xufTtcblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICBzd2l0Y2ggKChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8vIGhlbHBlcnNcblxuZnVuY3Rpb24gY29lcmNlKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpO1xuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHxcbiAgICBmdW5jdGlvbihzdWJqZWN0KXtcbiAgICAgIHJldHVybiB7fS50b1N0cmluZy5hcHBseShzdWJqZWN0KSA9PSAnW29iamVjdCBBcnJheV0nXG4gICAgfSlcbiAgICAoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheUlzaChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIHRvSGV4KG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpO1xuICByZXR1cm4gbi50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKVxuICAgIGlmIChzdHIuY2hhckNvZGVBdChpKSA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpO1xuICAgIGVsc2Uge1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLmNoYXJBdChpKSkuc3Vic3RyKDEpLnNwbGl0KCclJyk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSk7XG4gICAgfVxuXG4gIHJldHVybiBieXRlQXJyYXk7XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyhzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrIClcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaCggc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGICk7XG5cbiAgcmV0dXJuIGJ5dGVBcnJheTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhzdHIpIHtcbiAgcmV0dXJuIHJlcXVpcmUoXCJiYXNlNjQtanNcIikudG9CeXRlQXJyYXkoc3RyKTtcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlcihzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvcywgaSA9IDA7XG4gIHdoaWxlIChpIDwgbGVuZ3RoKSB7XG4gICAgaWYgKChpK29mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrO1xuXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldO1xuICAgIGkrKztcbiAgfVxuICByZXR1cm4gaTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpOyAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vLyByZWFkL3dyaXRlIGJpdC10d2lkZGxpbmdcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhciBidWZmZXIgPSB0aGlzO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkgcmV0dXJuO1xuXG4gIHJldHVybiBidWZmZXJbb2Zmc2V0XTtcbn07XG5cbmZ1bmN0aW9uIHJlYWRVSW50MTYoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YXIgdmFsID0gMDtcblxuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkgcmV0dXJuIDA7XG5cbiAgaWYgKGlzQmlnRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmZmVyW29mZnNldF0gPDwgODtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIHZhbCB8PSBidWZmZXJbb2Zmc2V0ICsgMV07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgIGlmIChvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdmFsIHw9IGJ1ZmZlcltvZmZzZXQgKyAxXSA8PCA4O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWw7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiByZWFkVUludDMyKGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFyIHZhbCA9IDA7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgaWYgKG9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSByZXR1cm4gMDtcblxuICBpZiAoaXNCaWdFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICB2YWwgPSBidWZmZXJbb2Zmc2V0ICsgMV0gPDwgMTY7XG4gICAgaWYgKG9mZnNldCArIDIgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgdmFsIHw9IGJ1ZmZlcltvZmZzZXQgKyAyXSA8PCA4O1xuICAgIGlmIChvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aClcbiAgICAgIHZhbCB8PSBidWZmZXJbb2Zmc2V0ICsgM107XG4gICAgdmFsID0gdmFsICsgKGJ1ZmZlcltvZmZzZXRdIDw8IDI0ID4+PiAwKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICB2YWwgPSBidWZmZXJbb2Zmc2V0ICsgMl0gPDwgMTY7XG4gICAgaWYgKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgdmFsIHw9IGJ1ZmZlcltvZmZzZXQgKyAxXSA8PCA4O1xuICAgIHZhbCB8PSBidWZmZXJbb2Zmc2V0XTtcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmZmVyW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKTtcbiAgfVxuXG4gIHJldHVybiB2YWw7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5cbi8qXG4gKiBTaWduZWQgaW50ZWdlciB0eXBlcywgeWF5IHRlYW0hIEEgcmVtaW5kZXIgb24gaG93IHR3bydzIGNvbXBsZW1lbnQgYWN0dWFsbHlcbiAqIHdvcmtzLiBUaGUgZmlyc3QgYml0IGlzIHRoZSBzaWduZWQgYml0LCBpLmUuIHRlbGxzIHVzIHdoZXRoZXIgb3Igbm90IHRoZVxuICogbnVtYmVyIHNob3VsZCBiZSBwb3NpdGl2ZSBvciBuZWdhdGl2ZS4gSWYgdGhlIHR3bydzIGNvbXBsZW1lbnQgdmFsdWUgaXNcbiAqIHBvc2l0aXZlLCB0aGVuIHdlJ3JlIGRvbmUsIGFzIGl0J3MgZXF1aXZhbGVudCB0byB0aGUgdW5zaWduZWQgcmVwcmVzZW50YXRpb24uXG4gKlxuICogTm93IGlmIHRoZSBudW1iZXIgaXMgcG9zaXRpdmUsIHlvdSdyZSBwcmV0dHkgbXVjaCBkb25lLCB5b3UgY2FuIGp1c3QgbGV2ZXJhZ2VcbiAqIHRoZSB1bnNpZ25lZCB0cmFuc2xhdGlvbnMgYW5kIHJldHVybiB0aG9zZS4gVW5mb3J0dW5hdGVseSwgbmVnYXRpdmUgbnVtYmVyc1xuICogYXJlbid0IHF1aXRlIHRoYXQgc3RyYWlnaHRmb3J3YXJkLlxuICpcbiAqIEF0IGZpcnN0IGdsYW5jZSwgb25lIG1pZ2h0IGJlIGluY2xpbmVkIHRvIHVzZSB0aGUgdHJhZGl0aW9uYWwgZm9ybXVsYSB0b1xuICogdHJhbnNsYXRlIGJpbmFyeSBudW1iZXJzIGJldHdlZW4gdGhlIHBvc2l0aXZlIGFuZCBuZWdhdGl2ZSB2YWx1ZXMgaW4gdHdvJ3NcbiAqIGNvbXBsZW1lbnQuIChUaG91Z2ggaXQgZG9lc24ndCBxdWl0ZSB3b3JrIGZvciB0aGUgbW9zdCBuZWdhdGl2ZSB2YWx1ZSlcbiAqIE1haW5seTpcbiAqICAtIGludmVydCBhbGwgdGhlIGJpdHNcbiAqICAtIGFkZCBvbmUgdG8gdGhlIHJlc3VsdFxuICpcbiAqIE9mIGNvdXJzZSwgdGhpcyBkb2Vzbid0IHF1aXRlIHdvcmsgaW4gSmF2YXNjcmlwdC4gVGFrZSBmb3IgZXhhbXBsZSB0aGUgdmFsdWVcbiAqIG9mIC0xMjguIFRoaXMgY291bGQgYmUgcmVwcmVzZW50ZWQgaW4gMTYgYml0cyAoYmlnLWVuZGlhbikgYXMgMHhmZjgwLiBCdXQgb2ZcbiAqIGNvdXJzZSwgSmF2YXNjcmlwdCB3aWxsIGRvIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogPiB+MHhmZjgwXG4gKiAtNjU0MDlcbiAqXG4gKiBXaG9oIHRoZXJlLCBKYXZhc2NyaXB0LCB0aGF0J3Mgbm90IHF1aXRlIHJpZ2h0LiBCdXQgd2FpdCwgYWNjb3JkaW5nIHRvXG4gKiBKYXZhc2NyaXB0IHRoYXQncyBwZXJmZWN0bHkgY29ycmVjdC4gV2hlbiBKYXZhc2NyaXB0IGVuZHMgdXAgc2VlaW5nIHRoZVxuICogY29uc3RhbnQgMHhmZjgwLCBpdCBoYXMgbm8gbm90aW9uIHRoYXQgaXQgaXMgYWN0dWFsbHkgYSBzaWduZWQgbnVtYmVyLiBJdFxuICogYXNzdW1lcyB0aGF0IHdlJ3ZlIGlucHV0IHRoZSB1bnNpZ25lZCB2YWx1ZSAweGZmODAuIFRodXMsIHdoZW4gaXQgZG9lcyB0aGVcbiAqIGJpbmFyeSBuZWdhdGlvbiwgaXQgY2FzdHMgaXQgaW50byBhIHNpZ25lZCB2YWx1ZSwgKHBvc2l0aXZlIDB4ZmY4MCkuIFRoZW5cbiAqIHdoZW4geW91IHBlcmZvcm0gYmluYXJ5IG5lZ2F0aW9uIG9uIHRoYXQsIGl0IHR1cm5zIGl0IGludG8gYSBuZWdhdGl2ZSBudW1iZXIuXG4gKlxuICogSW5zdGVhZCwgd2UncmUgZ29pbmcgdG8gaGF2ZSB0byB1c2UgdGhlIGZvbGxvd2luZyBnZW5lcmFsIGZvcm11bGEsIHRoYXQgd29ya3NcbiAqIGluIGEgcmF0aGVyIEphdmFzY3JpcHQgZnJpZW5kbHkgd2F5LiBJJ20gZ2xhZCB3ZSBkb24ndCBzdXBwb3J0IHRoaXMga2luZCBvZlxuICogd2VpcmQgbnVtYmVyaW5nIHNjaGVtZSBpbiB0aGUga2VybmVsLlxuICpcbiAqIChCSVQtTUFYIC0gKHVuc2lnbmVkKXZhbCArIDEpICogLTFcbiAqXG4gKiBUaGUgYXN0dXRlIG9ic2VydmVyLCBtYXkgdGhpbmsgdGhhdCB0aGlzIGRvZXNuJ3QgbWFrZSBzZW5zZSBmb3IgOC1iaXQgbnVtYmVyc1xuICogKHJlYWxseSBpdCBpc24ndCBuZWNlc3NhcnkgZm9yIHRoZW0pLiBIb3dldmVyLCB3aGVuIHlvdSBnZXQgMTYtYml0IG51bWJlcnMsXG4gKiB5b3UgZG8uIExldCdzIGdvIGJhY2sgdG8gb3VyIHByaW9yIGV4YW1wbGUgYW5kIHNlZSBob3cgdGhpcyB3aWxsIGxvb2s6XG4gKlxuICogKDB4ZmZmZiAtIDB4ZmY4MCArIDEpICogLTFcbiAqICgweDAwN2YgKyAxKSAqIC0xXG4gKiAoMHgwMDgwKSAqIC0xXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhciBidWZmZXIgPSB0aGlzO1xuICB2YXIgbmVnO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkgcmV0dXJuO1xuXG4gIG5lZyA9IGJ1ZmZlcltvZmZzZXRdICYgMHg4MDtcbiAgaWYgKCFuZWcpIHtcbiAgICByZXR1cm4gKGJ1ZmZlcltvZmZzZXRdKTtcbiAgfVxuXG4gIHJldHVybiAoKDB4ZmYgLSBidWZmZXJbb2Zmc2V0XSArIDEpICogLTEpO1xufTtcblxuZnVuY3Rpb24gcmVhZEludDE2KGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFyIG5lZywgdmFsO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIHZhbCA9IHJlYWRVSW50MTYoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCk7XG4gIG5lZyA9IHZhbCAmIDB4ODAwMDtcbiAgaWYgKCFuZWcpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG5cbiAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiByZWFkSW50MzIoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YXIgbmVnLCB2YWw7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgdmFsID0gcmVhZFVJbnQzMihidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KTtcbiAgbmVnID0gdmFsICYgMHg4MDAwMDAwMDtcbiAgaWYgKCFuZWcpIHtcbiAgICByZXR1cm4gKHZhbCk7XG4gIH1cblxuICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiByZWFkRmxvYXQoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVpcmUoJy4vYnVmZmVyX2llZWU3NTQnKS5yZWFkSUVFRTc1NChidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sXG4gICAgICAyMywgNCk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHJlYWREb3VibGUoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgNyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVpcmUoJy4vYnVmZmVyX2llZWU3NTQnKS5yZWFkSUVFRTc1NChidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sXG4gICAgICA1MiwgOCk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdCBpc1xuICogbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3QgZXhjZWVkIHRoZVxuICogbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICpcbiAqICAgICAgdmFsdWUgICAgICAgICAgIFRoZSBudW1iZXIgdG8gY2hlY2sgZm9yIHZhbGlkaXR5XG4gKlxuICogICAgICBtYXggICAgICAgICAgICAgVGhlIG1heGltdW0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50KHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0Lm9rKHR5cGVvZiAodmFsdWUpID09ICdudW1iZXInLFxuICAgICAgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKTtcblxuICBhc3NlcnQub2sodmFsdWUgPj0gMCxcbiAgICAgICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpO1xuXG4gIGFzc2VydC5vayh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJyk7XG5cbiAgYXNzZXJ0Lm9rKE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jyk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhciBidWZmZXIgPSB0aGlzO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZik7XG4gIH1cblxuICBpZiAob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgIGJ1ZmZlcltvZmZzZXRdID0gdmFsdWU7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHdyaXRlVUludDE2KGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5taW4oYnVmZmVyLmxlbmd0aCAtIG9mZnNldCwgMik7IGkrKykge1xuICAgIGJ1ZmZlcltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGlzQmlnRW5kaWFuID8gMSAtIGkgOiBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChpc0JpZ0VuZGlhbiA/IDEgLSBpIDogaSkgKiA4O1xuICB9XG5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHdyaXRlVUludDMyKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZik7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGgubWluKGJ1ZmZlci5sZW5ndGggLSBvZmZzZXQsIDQpOyBpKyspIHtcbiAgICBidWZmZXJbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChpc0JpZ0VuZGlhbiA/IDMgLSBpIDogaSkgKiA4KSAmIDB4ZmY7XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cblxuLypcbiAqIFdlIG5vdyBtb3ZlIG9udG8gb3VyIGZyaWVuZHMgaW4gdGhlIHNpZ25lZCBudW1iZXIgY2F0ZWdvcnkuIFVubGlrZSB1bnNpZ25lZFxuICogbnVtYmVycywgd2UncmUgZ29pbmcgdG8gaGF2ZSB0byB3b3JyeSBhIGJpdCBtb3JlIGFib3V0IGhvdyB3ZSBwdXQgdmFsdWVzIGludG9cbiAqIGFycmF5cy4gU2luY2Ugd2UgYXJlIG9ubHkgd29ycnlpbmcgYWJvdXQgc2lnbmVkIDMyLWJpdCB2YWx1ZXMsIHdlJ3JlIGluXG4gKiBzbGlnaHRseSBiZXR0ZXIgc2hhcGUuIFVuZm9ydHVuYXRlbHksIHdlIHJlYWxseSBjYW4ndCBkbyBvdXIgZmF2b3JpdGUgYmluYXJ5XG4gKiAmIGluIHRoaXMgc3lzdGVtLiBJdCByZWFsbHkgc2VlbXMgdG8gZG8gdGhlIHdyb25nIHRoaW5nLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiA+IC0zMiAmIDB4ZmZcbiAqIDIyNFxuICpcbiAqIFdoYXQncyBoYXBwZW5pbmcgYWJvdmUgaXMgcmVhbGx5OiAweGUwICYgMHhmZiA9IDB4ZTAuIEhvd2V2ZXIsIHRoZSByZXN1bHRzIG9mXG4gKiB0aGlzIGFyZW4ndCB0cmVhdGVkIGFzIGEgc2lnbmVkIG51bWJlci4gVWx0aW1hdGVseSBhIGJhZCB0aGluZy5cbiAqXG4gKiBXaGF0IHdlJ3JlIGdvaW5nIHRvIHdhbnQgdG8gZG8gaXMgYmFzaWNhbGx5IGNyZWF0ZSB0aGUgdW5zaWduZWQgZXF1aXZhbGVudCBvZlxuICogb3VyIHJlcHJlc2VudGF0aW9uIGFuZCBwYXNzIHRoYXQgb2ZmIHRvIHRoZSB3dWludCogZnVuY3Rpb25zLiBUbyBkbyB0aGF0XG4gKiB3ZSdyZSBnb2luZyB0byBkbyB0aGUgZm9sbG93aW5nOlxuICpcbiAqICAtIGlmIHRoZSB2YWx1ZSBpcyBwb3NpdGl2ZVxuICogICAgICB3ZSBjYW4gcGFzcyBpdCBkaXJlY3RseSBvZmYgdG8gdGhlIGVxdWl2YWxlbnQgd3VpbnRcbiAqICAtIGlmIHRoZSB2YWx1ZSBpcyBuZWdhdGl2ZVxuICogICAgICB3ZSBkbyB0aGUgZm9sbG93aW5nIGNvbXB1dGF0aW9uOlxuICogICAgICAgICBtYiArIHZhbCArIDEsIHdoZXJlXG4gKiAgICAgICAgIG1iICAgaXMgdGhlIG1heGltdW0gdW5zaWduZWQgdmFsdWUgaW4gdGhhdCBieXRlIHNpemVcbiAqICAgICAgICAgdmFsICBpcyB0aGUgSmF2YXNjcmlwdCBuZWdhdGl2ZSBpbnRlZ2VyXG4gKlxuICpcbiAqIEFzIGEgY29uY3JldGUgdmFsdWUsIHRha2UgLTEyOC4gSW4gc2lnbmVkIDE2IGJpdHMgdGhpcyB3b3VsZCBiZSAweGZmODAuIElmXG4gKiB5b3UgZG8gb3V0IHRoZSBjb21wdXRhdGlvbnM6XG4gKlxuICogMHhmZmZmIC0gMTI4ICsgMVxuICogMHhmZmZmIC0gMTI3XG4gKiAweGZmODBcbiAqXG4gKiBZb3UgY2FuIHRoZW4gZW5jb2RlIHRoaXMgdmFsdWUgYXMgdGhlIHNpZ25lZCB2ZXJzaW9uLiBUaGlzIGlzIHJlYWxseSByYXRoZXJcbiAqIGhhY2t5LCBidXQgaXQgc2hvdWxkIHdvcmsgYW5kIGdldCB0aGUgam9iIGRvbmUgd2hpY2ggaXMgb3VyIGdvYWwgaGVyZS5cbiAqL1xuXG4vKlxuICogQSBzZXJpZXMgb2YgY2hlY2tzIHRvIG1ha2Ugc3VyZSB3ZSBhY3R1YWxseSBoYXZlIGEgc2lnbmVkIDMyLWJpdCBudW1iZXJcbiAqL1xuZnVuY3Rpb24gdmVyaWZzaW50KHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQub2sodHlwZW9mICh2YWx1ZSkgPT0gJ251bWJlcicsXG4gICAgICAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpO1xuXG4gIGFzc2VydC5vayh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKTtcblxuICBhc3NlcnQub2sodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpO1xuXG4gIGFzc2VydC5vayhNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpO1xufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydC5vayh0eXBlb2YgKHZhbHVlKSA9PSAnbnVtYmVyJyxcbiAgICAgICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJyk7XG5cbiAgYXNzZXJ0Lm9rKHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpO1xuXG4gIGFzc2VydC5vayh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJyk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXM7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MCk7XG4gIH1cblxuICBpZiAodmFsdWUgPj0gMCkge1xuICAgIGJ1ZmZlci53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXIud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gd3JpdGVJbnQxNihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMCk7XG4gIH1cblxuICBpZiAodmFsdWUgPj0gMCkge1xuICAgIHdyaXRlVUludDE2KGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KTtcbiAgfSBlbHNlIHtcbiAgICB3cml0ZVVJbnQxNihidWZmZXIsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpO1xuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHdyaXRlSW50MzIoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMCk7XG4gIH1cblxuICBpZiAodmFsdWUgPj0gMCkge1xuICAgIHdyaXRlVUludDMyKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KTtcbiAgfSBlbHNlIHtcbiAgICB3cml0ZVVJbnQzMihidWZmZXIsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KTtcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiB3cml0ZUZsb2F0KGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpO1xuICB9XG5cbiAgcmVxdWlyZSgnLi9idWZmZXJfaWVlZTc1NCcpLndyaXRlSUVFRTc1NChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLFxuICAgICAgMjMsIDQpO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiB3cml0ZURvdWJsZShidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDcgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpO1xuICB9XG5cbiAgcmVxdWlyZSgnLi9idWZmZXJfaWVlZTc1NCcpLndyaXRlSUVFRTc1NChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLFxuICAgICAgNTIsIDgpO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcbiIsIihmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheShiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFycjtcblx0XG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnO1xuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHRwbGFjZUhvbGRlcnMgPSBiNjQuaW5kZXhPZignPScpO1xuXHRcdHBsYWNlSG9sZGVycyA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gcGxhY2VIb2xkZXJzIDogMDtcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IFtdOy8vbmV3IFVpbnQ4QXJyYXkoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKTtcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aDtcblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDE4KSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA8PCAxMikgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAyXSkgPDwgNikgfCBsb29rdXAuaW5kZXhPZihiNjRbaSArIDNdKTtcblx0XHRcdGFyci5wdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpO1xuXHRcdFx0YXJyLnB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOCk7XG5cdFx0XHRhcnIucHVzaCh0bXAgJiAweEZGKTtcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAobG9va3VwLmluZGV4T2YoYjY0W2ldKSA8PCAyKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA+PiA0KTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAobG9va3VwLmluZGV4T2YoYjY0W2ldKSA8PCAxMCkgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAxXSkgPDwgNCkgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAyXSkgPj4gMik7XG5cdFx0XHRhcnIucHVzaCgodG1wID4+IDgpICYgMHhGRik7XG5cdFx0XHRhcnIucHVzaCh0bXAgJiAweEZGKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyO1xuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoO1xuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXTtcblx0XHR9O1xuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSk7XG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApO1xuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwW3RlbXAgPj4gMl07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbKHRlbXAgPDwgNCkgJiAweDNGXTtcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFt0ZW1wID4+IDEwXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFsodGVtcCA+PiA0KSAmIDB4M0ZdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwWyh0ZW1wIDw8IDIpICYgMHgzRl07XG5cdFx0XHRcdG91dHB1dCArPSAnPSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5O1xuXHRtb2R1bGUuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NDtcbn0oKSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYgKGV2LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBMaXZlU2NyaXB0IDEuMi4wXG4oZnVuY3Rpb24oKXtcbiAgdmFyIGxkYXRhLCBsb2csIEFwcCwgZXhwb3J0cztcbiAgbGRhdGEgPSByZXF1aXJlKCcuL2xpdmUtZGF0YScpO1xuICBsb2cgPSByZXF1aXJlKCcuL2xvZycpO1xuICBBcHAgPSAoZnVuY3Rpb24oKXtcbiAgICBBcHAuZGlzcGxheU5hbWUgPSAnQXBwJztcbiAgICB2YXIgcHJvdG90eXBlID0gQXBwLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcHA7XG4gICAgZnVuY3Rpb24gQXBwKG9wdHMpe1xuICAgICAgdmFyIHJlZiQ7XG4gICAgICB0aGlzLm9wdHMgPSBvcHRzICE9IG51bGxcbiAgICAgICAgPyBvcHRzXG4gICAgICAgIDoge307XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQXBwKSkge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShBcHAsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KTtcbiAgICAgIH1cbiAgICAgIChyZWYkID0gdGhpcy5vcHRzKS5sb2dnZXIgPT0gbnVsbCAmJiAocmVmJC5sb2dnZXIgPSBsb2cubG9nZ2VyKHtcbiAgICAgICAgbGV2ZWw6ICdkZWJ1ZydcbiAgICAgIH0pKTtcbiAgICAgIHRoaXMubG9nID0gdGhpcy5vcHRzLmxvZ2dlcjtcbiAgICAgIHRoaXMuc3RvcmUgPSBuZXcgbGRhdGEuTWFwKHtcbiAgICAgICAgcHJlZml4OiAnYXBwJ1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBBcHA7XG4gIH0oKSk7XG4gIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEFwcDtcbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgTGl2ZVNjcmlwdCAxLjIuMFxuKGZ1bmN0aW9uKCl7XG4gIHZhciB0aHJvdWdoLCBQcmltdXMsIENsaWVudCwgc2xpY2UkID0gW10uc2xpY2U7XG4gIHRocm91Z2ggPSByZXF1aXJlKCd0aHJvdWdoJyk7XG4gIFByaW11cyA9IHJlcXVpcmUoJy4vbGlicmFyeScpO1xuICBDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudCcpO1xuICBleHBvcnRzLkFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG4gIGV4cG9ydHMuQ2xpZW50ID0gQ2xpZW50O1xuICBleHBvcnRzLmNvbm5lY3QgPSBmdW5jdGlvbihhcHApe1xuICAgIHZhciBhLCBwcmltdXMsIHN0cmVhbSwgY2xpZW50O1xuICAgIGEgPSBzbGljZSQuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHByaW11cyA9IG5ldyBQcmltdXMoKTtcbiAgICBzdHJlYW0gPSB0aHJvdWdoKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgcmV0dXJuIHByaW11cy53cml0ZShkYXRhKTtcbiAgICB9KTtcbiAgICBwcmltdXMub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgIHJldHVybiBzdHJlYW0ucXVldWUoZGF0YSk7XG4gICAgfSk7XG4gICAgY2xpZW50ID0gbmV3IENsaWVudChhcHAsIHN0cmVhbSk7XG4gICAgY2xpZW50LnByaW11cyA9IHByaW11cztcbiAgICByZXR1cm4gY2xpZW50O1xuICB9O1xufSkuY2FsbCh0aGlzKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBMaXZlU2NyaXB0IDEuMi4wXG4oZnVuY3Rpb24oKXtcbiAgdmFyIGxkYXRhLCBDbGllbnQsIGV4cG9ydHM7XG4gIGxkYXRhID0gcmVxdWlyZSgnLi9saXZlLWRhdGEnKTtcbiAgQ2xpZW50ID0gKGZ1bmN0aW9uKCl7XG4gICAgQ2xpZW50LmRpc3BsYXlOYW1lID0gJ0NsaWVudCc7XG4gICAgdmFyIHByb3RvdHlwZSA9IENsaWVudC5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQ2xpZW50O1xuICAgIGZ1bmN0aW9uIENsaWVudChhcHAsIHN0cmVhbSl7XG4gICAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICAgIHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENsaWVudCkpIHtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoQ2xpZW50LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gICAgICB9XG4gICAgICB0aGlzLnJhd1N0b3JlID0gbmV3IGxkYXRhLk1hcDtcbiAgICAgIHRoaXMuc3RvcmUgPSBuZXcgbGRhdGEuTWFwVmlldyh0aGlzLnJhd1N0b3JlLCB7XG4gICAgICAgIHByZWZpeDogJ2NsaWVudCdcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zdHJlYW0ub24oJ2RhdGEnLCBmdW5jdGlvbihkKXtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKCdkYXRhOicsIGQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJhd1N0b3JlLm9uKCdfdXBkYXRlJywgZnVuY3Rpb24odSl7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZygncmF3LXN0b3JlIHVwZGF0ZWQ6JywgdSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucmF3U3RvcmUucGlwZSh0aGlzLmFwcC5zdG9yZSkucGlwZSh0aGlzLnJhd1N0b3JlKTtcbiAgICAgIHRoaXMuc3RyZWFtLnBpcGUodGhpcy5yYXdTdG9yZS5jcmVhdGVTdHJlYW0oKSkucGlwZSh0aGlzLnN0cmVhbSk7XG4gICAgfVxuICAgIHJldHVybiBDbGllbnQ7XG4gIH0oKSk7XG4gIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IENsaWVudDtcbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgTGl2ZVNjcmlwdCAxLjIuMFxuKGZ1bmN0aW9uKCl7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbGl2ZS1kYXRhJyk7XG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uIChuYW1lLCBjb250ZXh0LCBkZWZpbml0aW9uKSB7ICBjb250ZXh0W25hbWVdID0gZGVmaW5pdGlvbigpOyAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHsgICAgbW9kdWxlLmV4cG9ydHMgPSBjb250ZXh0W25hbWVdOyAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7ICAgIGRlZmluZShkZWZpbml0aW9uKTsgIH19KShcIlByaW11c1wiLCB0aGlzLCBmdW5jdGlvbiBQUklNVVMoKSB7LypnbG9iYWxzIHJlcXVpcmUsIGRlZmluZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB7fTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCkge1xuICByZXR1cm4gKHRoaXMuX2V2ZW50c1tldmVudF0gfHwgW10pLnNsaWNlKDApO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICwgaGFuZGxlciA9IGxpc3RlbmVyc1swXVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoMSA9PT0gbGVuZ3RoKSB7XG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhMSk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGExLCBhMik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGExLCBhMiwgYTMpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhMSwgYTIsIGEzLCBhNCk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGExLCBhMiwgYTMsIGE0LCBhNSk7XG4gICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goZm4pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuKSB7XG4gIHZhciBlZSA9IHRoaXM7XG5cbiAgZnVuY3Rpb24gZWplY3QoKSB7XG4gICAgZWUucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGVqZWN0KTtcbiAgICBmbi5hcHBseShlZSwgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGVqZWN0LmZuID0gZm47XG4gIHJldHVybiBlZS5vbihldmVudCwgZWplY3QpO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICghKCFmbiB8fCBsaXN0ZW5lcnNbaV0gPT09IGZuIHx8IGxpc3RlbmVyc1tpXS5mbiA9PT0gZm4pKSB7XG4gICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHRoaXMuX2V2ZW50c1tldmVudF0gPSBldmVudHM7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKGV2ZW50KSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSB7fTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29udGV4dCBhc3NlcnRpb24sIGVuc3VyZSB0aGF0IHNvbWUgb2Ygb3VyIHB1YmxpYyBQcmltdXMgbWV0aG9kcyBhcmUgY2FsbGVkXG4gKiB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHQgdG8gZW5zdXJlIHRoYXRcbiAqXG4gKiBAcGFyYW0ge1ByaW11c30gc2VsZiBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kIFRoZSBtZXRob2QgbmFtZS5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjb250ZXh0KHNlbGYsIG1ldGhvZCkge1xuICBpZiAoc2VsZiBpbnN0YW5jZW9mIFByaW11cykgcmV0dXJuO1xuXG4gIHZhciBmYWlsdXJlID0gbmV3IEVycm9yKCdQcmltdXMjJysgbWV0aG9kICsgJ1xcJ3MgY29udGV4dCBzaG91bGQgY2FsbGVkIHdpdGggYSBQcmltdXMgaW5zdGFuY2UnKTtcblxuICBpZiAoIXNlbGYubGlzdGVuZXJzKCdlcnJvcicpLmxlbmd0aCkgdGhyb3cgZmFpbHVyZTtcbiAgc2VsZi5lbWl0KCdlcnJvcicsIGZhaWx1cmUpO1xufVxuXG4vKipcbiAqIFByaW11cyBpbiBhIHJlYWwtdGltZSBsaWJyYXJ5IGFnbm9zdGljIGZyYW1ld29yayBmb3IgZXN0YWJsaXNoaW5nIHJlYWwtdGltZVxuICogY29ubmVjdGlvbnMgd2l0aCBzZXJ2ZXJzLlxuICpcbiAqIE9wdGlvbnM6XG4gKiAtIHJlY29ubmVjdCwgY29uZmlndXJhdGlvbiBmb3IgdGhlIHJlY29ubmVjdCBwcm9jZXNzLlxuICogLSBtYW51YWwsIGRvbid0IGF1dG9tYXRpY2FsbHkgY2FsbCBgLm9wZW5gIHRvIHN0YXJ0IHRoZSBjb25uZWN0aW9uLlxuICogLSB3ZWJzb2NrZXRzLCBmb3JjZSB0aGUgdXNlIG9mIFdlYlNvY2tldHMsIGV2ZW4gd2hlbiB5b3Ugc2hvdWxkIGF2b2lkIHRoZW0uXG4gKiAtIHRpbWVvdXQsIGNvbm5lY3QgdGltZW91dCwgc2VydmVyIGRpZG4ndCByZXNwb25kIGluIGEgdGltZWx5IG1hbm5lci5cbiAqIC0gcGluZywgVGhlIGhlYXJ0YmVhdCBpbnRlcnZhbCBmb3Igc2VuZGluZyBhIHBpbmcgcGFja2V0IHRvIHRoZSBzZXJ2ZXIuXG4gKiAtIHBvbmcsIFRoZSBoZWFydGJlYXQgdGltZW91dCBmb3IgcmVjZWl2aW5nIGEgcmVzcG9uc2UgdG8gdGhlIHBpbmcuXG4gKiAtIG5ldHdvcmssIFVzZSBuZXR3b3JrIGV2ZW50cyBhcyBsZWFkaW5nIG1ldGhvZCBmb3IgbmV0d29yayBjb25uZWN0aW9uIGRyb3BzLlxuICogLSBzdHJhdGVneSwgUmVjb25uZWN0aW9uIHN0cmF0ZWdpZXMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgb2YgeW91ciBzZXJ2ZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgY29uZmlndXJhdGlvbi5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBQcmltdXModXJsLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcmltdXMpKSByZXR1cm4gbmV3IFByaW11cyh1cmwsIG9wdGlvbnMpO1xuXG4gIHZhciBwcmltdXMgPSB0aGlzO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBvcHRpb25zLnRpbWVvdXQgPSArb3B0aW9ucy50aW1lb3V0IHx8IDEwZTM7ICAgLy8gQ29ubmVjdGlvbiB0aW1lb3V0IGR1cmF0aW9uLlxuICBvcHRpb25zLnJlY29ubmVjdCA9IG9wdGlvbnMucmVjb25uZWN0IHx8IHt9OyAgLy8gU3RvcmVzIHRoZSBiYWNrIG9mZiBjb25maWd1cmF0aW9uLlxuICBvcHRpb25zLnBpbmcgPSArb3B0aW9ucy5waW5nIHx8IDI1ZTM7ICAgICAgICAgLy8gSGVhcnRiZWF0IHBpbmcgaW50ZXJ2YWwuXG4gIG9wdGlvbnMucG9uZyA9ICtvcHRpb25zLnBvbmcgfHwgMTBlMzsgICAgICAgICAvLyBIZWFydGJlYXQgcG9uZyByZXNwb25zZSB0aW1lb3V0LlxuICBvcHRpb25zLnN0cmF0ZWd5ID0gb3B0aW9ucy5zdHJhdGVneSB8fCBbXTsgICAgLy8gUmVjb25uZWN0IHN0cmF0ZWdpZXMuXG5cbiAgcHJpbXVzLmJ1ZmZlciA9IFtdOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0b3JlcyBwcmVtYXR1cmUgc2VuZCBkYXRhLlxuICBwcmltdXMud3JpdGFibGUgPSB0cnVlOyAgICAgICAgICAgICAgICAgICAgICAgLy8gU2lsbHkgc3RyZWFtIGNvbXBhdGliaWxpdHkuXG4gIHByaW11cy5yZWFkYWJsZSA9IHRydWU7ICAgICAgICAgICAgICAgICAgICAgICAvLyBTaWxseSBzdHJlYW0gY29tcGF0aWJpbGl0eS5cbiAgcHJpbXVzLnVybCA9IHByaW11cy5wYXJzZSh1cmwpOyAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBVUkwgdG8gYSByZWFkYWJsZSBmb3JtYXQuXG4gIHByaW11cy5yZWFkeVN0YXRlID0gUHJpbXVzLkNMT1NFRDsgICAgICAgICAgICAvLyBUaGUgcmVhZHlTdGF0ZSBvZiB0aGUgY29ubmVjdGlvbi5cbiAgcHJpbXVzLm9wdGlvbnMgPSBvcHRpb25zOyAgICAgICAgICAgICAgICAgICAgIC8vIFJlZmVyZW5jZSB0byB0aGUgc3VwcGxpZWQgb3B0aW9ucy5cbiAgcHJpbXVzLnRpbWVycyA9IHt9OyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnRhaW5zIGFsbCBvdXIgdGltZXJzLlxuICBwcmltdXMuYXR0ZW1wdCA9IG51bGw7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ3VycmVudCBiYWNrIG9mZiBhdHRlbXB0LlxuICBwcmltdXMuc29ja2V0ID0gbnVsbDsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVmZXJlbmNlIHRvIHRoZSBpbnRlcm5hbCBjb25uZWN0aW9uLlxuICBwcmltdXMudHJhbnNmb3JtZXJzID0geyAgICAgICAgICAgICAgICAgICAgICAgLy8gTWVzc2FnZSB0cmFuc2Zvcm1lcnMuXG4gICAgb3V0Z29pbmc6IFtdLFxuICAgIGluY29taW5nOiBbXVxuICB9O1xuXG4gIC8vXG4gIC8vIFBhcnNlIHRoZSByZWNvbm5lY3Rpb24gc3RyYXRlZ3kuIEl0IGNhbiBoYXZlIHRoZSBmb2xsb3dpbmcgc3RyYXRlZ2llczpcbiAgLy9cbiAgLy8gLSB0aW1lb3V0OiBSZWNvbm5lY3Qgd2hlbiB3ZSBoYXZlIGEgbmV0d29yayB0aW1lb3V0LlxuICAvLyAtIGRpc2Nvbm5lY3Q6IFJlY29ubmVjdCB3aGVuIHdlIGhhdmUgYW4gdW5leHBlY3RlZCBkaXNjb25uZWN0LlxuICAvLyAtIG9ubGluZTogUmVjb25uZWN0IHdoZW4gd2UncmUgYmFjayBvbmxpbmUuXG4gIC8vXG4gIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIG9wdGlvbnMuc3RyYXRlZ3kpIHtcbiAgICBvcHRpb25zLnN0cmF0ZWd5ID0gb3B0aW9ucy5zdHJhdGVneS5zcGxpdCgvXFxzP1xcLFxccz8vZyk7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMuc3RyYXRlZ3kubGVuZ3RoKSB7XG4gICAgb3B0aW9ucy5zdHJhdGVneS5wdXNoKCdkaXNjb25uZWN0JywgJ29ubGluZScpO1xuXG4gICAgLy9cbiAgICAvLyBUaW1lb3V0IGJhc2VkIHJlY29ubmVjdGlvbiBzaG91bGQgb25seSBiZSBlbmFibGVkIGNvbmRpdGlvbmFsbHkuIFdoZW5cbiAgICAvLyBhdXRob3JpemF0aW9uIGlzIGVuYWJsZWQgaXQgY291bGQgdHJpZ2dlci5cbiAgICAvL1xuICAgIGlmICghdGhpcy5hdXRob3JpemF0aW9uKSBvcHRpb25zLnN0cmF0ZWd5LnB1c2goJ3RpbWVvdXQnKTtcbiAgfVxuXG4gIG9wdGlvbnMuc3RyYXRlZ3kgPSBvcHRpb25zLnN0cmF0ZWd5LmpvaW4oJywnKS50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vXG4gIC8vIE9ubHkgaW5pdGlhbGlzZSB0aGUgRXZlbnRFbWl0dGVyIGludGVyZmFjZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgcGxhaW5cbiAgLy8gYnJvd3NlciBlbnZpcm9ubWVudC4gVGhlIFN0cmVhbSBpbnRlcmZhY2UgaXMgaW5oZXJpdGVkIGRpZmZlcmVudGx5IHdoZW4gaXRcbiAgLy8gcnVucyBvbiBicm93c2VyaWZ5IGFuZCBvbiBOb2RlLmpzLlxuICAvL1xuICBpZiAoIVN0cmVhbSkgRXZlbnRFbWl0dGVyLmNhbGwocHJpbXVzKTtcblxuICAvL1xuICAvLyBGb3JjZSB0aGUgdXNlIG9mIFdlYlNvY2tldHMsIGV2ZW4gd2hlbiB3ZSd2ZSBkZXRlY3RlZCBzb21lIHBvdGVudGlhbFxuICAvLyBicm9rZW4gV2ViU29ja2V0IGltcGxlbWVudGF0aW9uLlxuICAvL1xuICBpZiAoJ3dlYnNvY2tldHMnIGluIG9wdGlvbnMpIHtcbiAgICBwcmltdXMuQVZPSURfV0VCU09DS0VUUyA9ICFvcHRpb25zLndlYnNvY2tldHM7XG4gIH1cblxuICAvL1xuICAvLyBGb3JjZSBvciBkaXNhYmxlIHRoZSB1c2Ugb2YgTkVUV09SSyBldmVudHMgYXMgbGVhZGluZyBjbGllbnQgc2lkZVxuICAvLyBkaXNjb25uZWN0aW9uIGRldGVjdGlvbi5cbiAgLy9cbiAgaWYgKCduZXR3b3JrJyBpbiBvcHRpb25zKSB7XG4gICAgcHJpbXVzLk5FVFdPUktfRVZFTlRTID0gb3B0aW9ucy5uZXR3b3JrO1xuICB9XG5cbiAgLy9cbiAgLy8gQ2hlY2sgaWYgdGhlIHVzZXIgd2FudHMgdG8gbWFudWFsbHkgaW5pdGlhbGlzZSBhIGNvbm5lY3Rpb24uIElmIHRoZXkgZG9uJ3QsXG4gIC8vIHdlIHdhbnQgdG8gZG8gaXQgYWZ0ZXIgYSByZWFsbHkgc21hbGwgdGltZW91dCBzbyB3ZSBnaXZlIHRoZSB1c2VycyBlbm91Z2hcbiAgLy8gdGltZSB0byBsaXN0ZW4gZm9yIGBlcnJvcmAgZXZlbnRzIGV0Yy5cbiAgLy9cbiAgaWYgKCFvcHRpb25zLm1hbnVhbCkgcHJpbXVzLnRpbWVycy5vcGVuID0gc2V0VGltZW91dChmdW5jdGlvbiBvcGVuKCkge1xuICAgIHByaW11cy5jbGVhclRpbWVvdXQoJ29wZW4nKS5vcGVuKCk7XG4gIH0sIDApO1xuXG4gIHByaW11cy5pbml0aWFsaXNlKG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFNpbXBsZSByZXF1aXJlIHdyYXBwZXIgdG8gbWFrZSBicm93c2VyaWZ5LCBub2RlIGFuZCByZXF1aXJlLmpzIHBsYXkgbmljZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbW9kdWxlIHRvIHJlcXVpcmUuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpbXVzLnJlcXVpcmUgPSBmdW5jdGlvbiByZXF1aXJlcyhuYW1lKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgcmVxdWlyZSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICByZXR1cm4gISgnZnVuY3Rpb24nID09PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQpXG4gICAgPyByZXF1aXJlKG5hbWUpXG4gICAgOiB1bmRlZmluZWQ7XG59O1xuXG4vL1xuLy8gSXQncyBwb3NzaWJsZSB0aGF0IHdlJ3JlIHJ1bm5pbmcgaW4gTm9kZS5qcyBvciBpbiBhIE5vZGUuanMgY29tcGF0aWJsZVxuLy8gZW52aXJvbm1lbnQgc3VjaCBhcyBicm93c2VyaWZ5LiBJbiB0aGVzZSBjYXNlcyB3ZSB3YW50IHRvIHVzZSBzb21lIGJ1aWxkIGluXG4vLyBsaWJyYXJpZXMgdG8gbWluaW1pemUgb3VyIGRlcGVuZGVuY2Ugb24gdGhlIERPTS5cbi8vXG52YXIgU3RyZWFtLCBwYXJzZTtcblxudHJ5IHtcbiAgUHJpbXVzLlN0cmVhbSA9IFN0cmVhbSA9IFByaW11cy5yZXF1aXJlKCdzdHJlYW0nKTtcbiAgcGFyc2UgPSBQcmltdXMucmVxdWlyZSgndXJsJykucGFyc2U7XG5cbiAgLy9cbiAgLy8gTm9ybWFsbHkgaW5oZXJpdGFuY2UgaXMgZG9uZSBpbiB0aGUgc2FtZSB3YXkgYXMgd2UgZG8gaW4gb3VyIGNhdGNoXG4gIC8vIHN0YXRlbWVudC4gQnV0IGR1ZSB0byBjaGFuZ2VzIHRvIHRoZSBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIGluIE5vZGUgMC4xMFxuICAvLyB0aGlzIHdpbGwgdHJpZ2dlciBhbm5veWluZyBtZW1vcnkgbGVhayB3YXJuaW5ncyBhbmQgb3RoZXIgcG90ZW50aWFsIGlzc3Vlc1xuICAvLyBvdXRsaW5lZCBpbiB0aGUgaXNzdWUgbGlua2VkIGJlbG93LlxuICAvL1xuICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvNDk3MVxuICAvL1xuICBQcmltdXMucmVxdWlyZSgndXRpbCcpLmluaGVyaXRzKFByaW11cywgU3RyZWFtKTtcbn0gY2F0Y2ggKGUpIHtcbiAgUHJpbXVzLlN0cmVhbSA9IEV2ZW50RW1pdHRlcjtcbiAgUHJpbXVzLnByb3RvdHlwZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvL1xuICAvLyBJbiB0aGUgYnJvd3NlcnMgd2UgY2FuIGxldmVyYWdlIHRoZSBET00gdG8gcGFyc2UgdGhlIFVSTCBmb3IgdXMuIEl0IHdpbGxcbiAgLy8gYXV0b21hdGljYWxseSBkZWZhdWx0IHRvIGhvc3Qgb2YgdGhlIGN1cnJlbnQgc2VydmVyIHdoZW4gd2Ugc3VwcGx5IGl0IHBhdGhcbiAgLy8gZXRjLlxuICAvL1xuICBwYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKHVybCkge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcblxuICAgIC8vXG4gICAgLy8gQnJvd3NlcnMgZG8gbm90IHBhcnNlIGF1dGhvcml6YXRpb24gaW5mb3JtYXRpb24sIHNvIHdlIG5lZWQgdG8gZXh0cmFjdFxuICAgIC8vIHRoYXQgZnJvbSB0aGUgVVJMLlxuICAgIC8vXG4gICAgaWYgKH5hLmhyZWYuaW5kZXhPZignQCcpICYmICFhLmF1dGgpIHtcbiAgICAgIGEuYXV0aCA9IGEuaHJlZi5zbGljZShhLnByb3RvY29sLmxlbmd0aCArIDIsIGEuaHJlZi5pbmRleE9mKGEucGF0aG5hbWUpKS5zcGxpdCgnQCcpWzBdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufVxuXG4vKipcbiAqIFByaW11cyByZWFkeVN0YXRlcywgdXNlZCBpbnRlcm5hbGx5IHRvIHNldCB0aGUgY29ycmVjdCByZWFkeSBzdGF0ZS5cbiAqXG4gKiBAdHlwZSB7TnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuUHJpbXVzLk9QRU5JTkcgPSAxOyAgIC8vIFdlJ3JlIG9wZW5pbmcgdGhlIGNvbm5lY3Rpb24uXG5QcmltdXMuQ0xPU0VEICA9IDI7ICAgLy8gTm8gYWN0aXZlIGNvbm5lY3Rpb24uXG5QcmltdXMuT1BFTiAgICA9IDM7ICAgLy8gVGhlIGNvbm5lY3Rpb24gaXMgb3Blbi5cblxuLyoqXG4gKiBBcmUgd2Ugd29ya2luZyB3aXRoIGEgcG90ZW50aWFsbHkgYnJva2VuIFdlYlNvY2tldHMgaW1wbGVtZW50YXRpb24/IFRoaXNcbiAqIGJvb2xlYW4gY2FuIGJlIHVzZWQgYnkgdHJhbnNmb3JtZXJzIHRvIHJlbW92ZSBgV2ViU29ja2V0c2AgZnJvbSB0aGVpclxuICogc3VwcG9ydGVkIHRyYW5zcG9ydHMuXG4gKlxuICogQHR5cGUge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpbXVzLnByb3RvdHlwZS5BVk9JRF9XRUJTT0NLRVRTID0gZmFsc2U7XG5cbi8qKlxuICogU29tZSBicm93c2VycyBzdXBwb3J0IHJlZ2lzdGVyaW5nIGVtaXR0aW5nIGBvbmxpbmVgIGFuZCBgb2ZmbGluZWAgZXZlbnRzIHdoZW5cbiAqIHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIGRyb3BwZWQgb24gdGhlIGNsaWVudC4gV2UncmUgZ29pbmcgdG8gZGV0ZWN0IGl0IGluXG4gKiBhIHNpbXBsZSBgdHJ5IHt9IGNhdGNoIChlKSB7fWAgc3RhdGVtZW50IHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gY29tcGxpY2F0ZWRcbiAqIGZlYXR1cmUgZGV0ZWN0aW9uLlxuICpcbiAqIEB0eXBlIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUuTkVUV09SS19FVkVOVFMgPSBmYWxzZTtcblByaW11cy5wcm90b3R5cGUub25saW5lID0gdHJ1ZTtcblxudHJ5IHtcbiAgaWYgKFByaW11cy5wcm90b3R5cGUuTkVUV09SS19FVkVOVFMgPSAnb25MaW5lJyBpbiBuYXZpZ2F0b3IgJiYgKHdpbmRvdy5hZGRFdmVudExpc3RlbmVyIHx8IGRvY3VtZW50LmJvZHkuYXR0YWNoRXZlbnQpKSB7XG4gICAgaWYgKCFuYXZpZ2F0b3Iub25MaW5lKSB7XG4gICAgICBQcmltdXMucHJvdG90eXBlLm9ubGluZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxufSBjYXRjaCAoZSkgeyB9XG5cbi8qKlxuICogVGhlIEFyayBjb250YWlucyBhbGwgb3VyIHBsdWdpbnMgZGVmaW5pdGlvbnMuIEl0J3MgbmFtZXNwYWNlZCBieVxuICogbmFtZSA9PiBwbHVnaW4uXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUuYXJrID0ge307XG5cbi8qKlxuICogUmV0dXJuIHRoZSBnaXZlbiBwbHVnaW4uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHBsdWdpbi5cbiAqIEByZXR1cm5zIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW11cy5wcm90b3R5cGUucGx1Z2luID0gZnVuY3Rpb24gcGx1Z2luKG5hbWUpIHtcbiAgY29udGV4dCh0aGlzLCAncGx1Z2luJyk7XG5cbiAgaWYgKG5hbWUpIHJldHVybiB0aGlzLmFya1tuYW1lXTtcblxuICB2YXIgcGx1Z2lucyA9IHt9O1xuXG4gIGZvciAobmFtZSBpbiB0aGlzLmFyaykge1xuICAgIHBsdWdpbnNbbmFtZV0gPSB0aGlzLmFya1tuYW1lXTtcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5zO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXNlIHRoZSBQcmltdXMgYW5kIHNldHVwIGFsbCBwYXJzZXJzIGFuZCBpbnRlcm5hbCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIG9yaWdpbmFsIG9wdGlvbnMgb2JqZWN0LlxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUuaW5pdGlhbGlzZSA9IGZ1bmN0aW9uIGluaXRhbGlzZShvcHRpb25zKSB7XG4gIHZhciBwcmltdXMgPSB0aGlzO1xuXG4gIHByaW11cy5vbignb3V0Z29pbmc6Om9wZW4nLCBmdW5jdGlvbiBvcGVuaW5nKCkge1xuICAgIHByaW11cy5yZWFkeVN0YXRlID0gUHJpbXVzLk9QRU5JTkc7XG4gIH0pO1xuXG4gIHByaW11cy5vbignaW5jb21pbmc6Om9wZW4nLCBmdW5jdGlvbiBvcGVuZWQoKSB7XG4gICAgaWYgKHByaW11cy5hdHRlbXB0KSBwcmltdXMuYXR0ZW1wdCA9IG51bGw7XG5cbiAgICBwcmltdXMucmVhZHlTdGF0ZSA9IFByaW11cy5PUEVOO1xuICAgIHByaW11cy5lbWl0KCdvcGVuJyk7XG4gICAgcHJpbXVzLmNsZWFyVGltZW91dCgncGluZycsICdwb25nJykuaGVhcnRiZWF0KCk7XG5cbiAgICBpZiAocHJpbXVzLmJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBwcmltdXMuYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHByaW11cy53cml0ZShwcmltdXMuYnVmZmVyW2ldKTtcbiAgICAgIH1cblxuICAgICAgcHJpbXVzLmJ1ZmZlci5sZW5ndGggPSAwO1xuICAgIH1cbiAgfSk7XG5cbiAgcHJpbXVzLm9uKCdpbmNvbWluZzo6cG9uZycsIGZ1bmN0aW9uIHBvbmcodGltZSkge1xuICAgIHByaW11cy5vbmxpbmUgPSB0cnVlO1xuICAgIHByaW11cy5jbGVhclRpbWVvdXQoJ3BvbmcnKS5oZWFydGJlYXQoKTtcbiAgfSk7XG5cbiAgcHJpbXVzLm9uKCdpbmNvbWluZzo6ZXJyb3InLCBmdW5jdGlvbiBlcnJvcihlKSB7XG4gICAgdmFyIGNvbm5lY3QgPSBwcmltdXMudGltZXJzLmNvbm5lY3Q7XG5cbiAgICAvL1xuICAgIC8vIFdlJ3JlIHN0aWxsIGRvaW5nIGEgcmVjb25uZWN0IGF0dGVtcHQsIGl0IGNvdWxkIGJlIHRoYXQgd2UgZmFpbGVkIHRvXG4gICAgLy8gY29ubmVjdCBiZWNhdXNlIHRoZSBzZXJ2ZXIgd2FzIGRvd24uIEZhaWxpbmcgY29ubmVjdCBhdHRlbXB0cyBzaG91bGRcbiAgICAvLyBhbHdheXMgZW1pdCBhbiBgZXJyb3JgIGV2ZW50IGluc3RlYWQgb2YgYSBgb3BlbmAgZXZlbnQuXG4gICAgLy9cbiAgICBpZiAocHJpbXVzLmF0dGVtcHQpIHJldHVybiBwcmltdXMucmVjb25uZWN0KCk7XG4gICAgaWYgKHByaW11cy5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoKSBwcmltdXMuZW1pdCgnZXJyb3InLCBlKTtcblxuICAgIC8vXG4gICAgLy8gV2UgcmVjZWl2ZWQgYW4gZXJyb3Igd2hpbGUgY29ubmVjdGluZywgdGhpcyBtb3N0IGxpa2VseSB0aGUgcmVzdWx0IG9mIGFuXG4gICAgLy8gdW5hdXRob3JpemVkIGFjY2VzcyB0byB0aGUgc2VydmVyLiBCdXQgdGhpcyBzb21ldGhpbmcgdGhhdCBpcyBvbmx5XG4gICAgLy8gdHJpZ2dlcmVkIGZvciBOb2RlIGJhc2VkIGNvbm5lY3Rpb25zLiBCcm93c2VycyB0cmlnZ2VyIHRoZSBlcnJvciBldmVudC5cbiAgICAvL1xuICAgIGlmIChjb25uZWN0KSB7XG4gICAgICBpZiAofnByaW11cy5vcHRpb25zLnN0cmF0ZWd5LmluZGV4T2YoJ3RpbWVvdXQnKSkgcHJpbXVzLnJlY29ubmVjdCgpO1xuICAgICAgZWxzZSBwcmltdXMuZW5kKCk7XG4gICAgfVxuICB9KTtcblxuICBwcmltdXMub24oJ2luY29taW5nOjpkYXRhJywgZnVuY3Rpb24gbWVzc2FnZShyYXcpIHtcbiAgICBwcmltdXMuZGVjb2RlcihyYXcsIGZ1bmN0aW9uIGRlY29kaW5nKGVyciwgZGF0YSkge1xuICAgICAgLy9cbiAgICAgIC8vIERvIGEgXCJzYXZlXCIgZW1pdCgnZXJyb3InKSB3aGVuIHdlIGZhaWwgdG8gcGFyc2UgYSBtZXNzYWdlLiBXZSBkb24ndFxuICAgICAgLy8gd2FudCB0byB0aHJvdyBoZXJlIGFzIGxpc3RlbmluZyB0byBlcnJvcnMgc2hvdWxkIGJlIG9wdGlvbmFsLlxuICAgICAgLy9cbiAgICAgIGlmIChlcnIpIHJldHVybiBwcmltdXMubGlzdGVuZXJzKCdlcnJvcicpLmxlbmd0aCAmJiBwcmltdXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIHNlcnZlciBpcyBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLCBmb3JjZWZ1bGx5IGRpc2Nvbm5lY3Qgc28gd2UgZG9uJ3RcbiAgICAgIC8vIHJlY29ubmVjdCBhZ2Fpbi5cbiAgICAgIC8vXG4gICAgICBpZiAoJ3ByaW11czo6c2VydmVyOjpjbG9zZScgPT09IGRhdGEpIHJldHVybiBwcmltdXMuZW5kKCk7XG5cbiAgICAgIC8vXG4gICAgICAvLyBXZSByZWNlaXZlZCBhIHBvbmcgbWVzc2FnZSBmcm9tIHRoZSBzZXJ2ZXIsIHJldHVybiB0aGUgaWQuXG4gICAgICAvL1xuICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZGF0YSAmJiBkYXRhLmluZGV4T2YoJ3ByaW11czo6cG9uZzo6JykgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHByaW11cy5lbWl0KCdpbmNvbWluZzo6cG9uZycsIGRhdGEuc2xpY2UoMTQpKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHByaW11cy50cmFuc2Zvcm1lcnMuaW5jb21pbmcubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhY2tldCA9IHsgZGF0YTogZGF0YSB9O1xuXG4gICAgICAgIGlmIChmYWxzZSA9PT0gcHJpbXVzLnRyYW5zZm9ybWVycy5pbmNvbWluZ1tpXS5jYWxsKHByaW11cywgcGFja2V0KSkge1xuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gV2hlbiBmYWxzZSBpcyByZXR1cm5lZCBieSBhbiBpbmNvbWluZyB0cmFuc2Zvcm1lciBpdCBtZWFucyB0aGF0J3NcbiAgICAgICAgICAvLyBiZWluZyBoYW5kbGVkIGJ5IHRoZSB0cmFuc2Zvcm1lciBhbmQgd2Ugc2hvdWxkIG5vdCBlbWl0IHRoZSBgZGF0YWBcbiAgICAgICAgICAvLyBldmVudC5cbiAgICAgICAgICAvL1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEgPSBwYWNrZXQuZGF0YTtcbiAgICAgIH1cblxuICAgICAgLy9cbiAgICAgIC8vIFdlIGFsd2F5cyBlbWl0IDIgYXJndW1lbnRzIGZvciB0aGUgZGF0YSBldmVudCwgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIHRoZVxuICAgICAgLy8gcGFyc2VkIGRhdGEgYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgaXMgdGhlIHJhdyBzdHJpbmcgdGhhdCB3ZSByZWNlaXZlZC5cbiAgICAgIC8vIFRoaXMgYWxsb3dzIHlvdSB0byBkbyBzb21lIHZhbGlkYXRpb24gb24gdGhlIHBhcnNlZCBkYXRhIGFuZCB0aGVuIHNhdmVcbiAgICAgIC8vIHRoZSByYXcgc3RyaW5nIGluIHlvdXIgZGF0YWJhc2Ugb3Igd2hhdCBldmVyIHNvIHlvdSBkb24ndCBoYXZlIHRoZVxuICAgICAgLy8gc3RyaW5naWZ5IG92ZXJoZWFkLlxuICAgICAgLy9cbiAgICAgIHByaW11cy5lbWl0KCdkYXRhJywgZGF0YSwgcmF3KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcHJpbXVzLm9uKCdpbmNvbWluZzo6ZW5kJywgZnVuY3Rpb24gZW5kKGludGVudGlvbmFsKSB7XG4gICAgdmFyIHJlYWR5U3RhdGUgPSBwcmltdXMucmVhZHlTdGF0ZTtcblxuICAgIC8vXG4gICAgLy8gQWx3YXlzIHNldCB0aGUgcmVhZHlTdGF0ZSB0byBjbG9zZWQsIGFuZCBpZiB3ZSdyZSBzdGlsbCBjb25uZWN0aW5nLCBjbG9zZVxuICAgIC8vIHRoZSBjb25uZWN0aW9uIHNvIHdlJ3JlIHN1cmUgdGhhdCBldmVyeXRoaW5nIGFmdGVyIHRoaXMgaWYgc3RhdGVtZW50IGJsb2NrXG4gICAgLy8gaXMgb25seSBleGVjdXRlZCBiZWNhdXNlIG91ciByZWFkeVN0YXRlIGlzIHNldCB0byBgb3BlbmAuXG4gICAgLy9cbiAgICBwcmltdXMucmVhZHlTdGF0ZSA9IFByaW11cy5DTE9TRUQ7XG4gICAgaWYgKHByaW11cy50aW1lcnMuY29ubmVjdCkgcHJpbXVzLmVuZCgpO1xuICAgIGlmIChyZWFkeVN0YXRlICE9PSBQcmltdXMuT1BFTikgcmV0dXJuO1xuXG4gICAgLy9cbiAgICAvLyBTb21lIHRyYW5zZm9ybWVycyBlbWl0IGdhcmJhZ2Ugd2hlbiB0aGV5IGNsb3NlIHRoZSBjb25uZWN0aW9uLiBMaWtlIHRoZVxuICAgIC8vIHJlYXNvbiB3aHkgaXQgY2xvc2VkIGV0Yy4gd2Ugc2hvdWxkIGV4cGxpY2l0bHkgY2hlY2sgaWYgV0Ugc2VuZCBhblxuICAgIC8vIGludGVudGlvbmFsIG1lc3NhZ2UuXG4gICAgLy9cbiAgICBpZiAoJ3ByaW11czo6c2VydmVyOjpjbG9zZScgPT09IGludGVudGlvbmFsKSB7XG4gICAgICByZXR1cm4gcHJpbXVzLmVtaXQoJ2VuZCcpO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gQWx3YXlzLCBjYWxsIHRoZSBgY2xvc2VgIGV2ZW50IGFzIGFuIGluZGljYXRpb24gb2YgY29ubmVjdGlvbiBkaXNydXB0aW9uLlxuICAgIC8vIFRoaXMgYWxzbyBlbWl0dGVkIGJ5IGBwcmltdXMjZW5kYCBzbyBmb3IgYWxsIGNhc2VzIGFib3ZlLCBpdCdzIHN0aWxsXG4gICAgLy8gZW1pdHRlZC5cbiAgICAvL1xuICAgIHByaW11cy5lbWl0KCdjbG9zZScpO1xuXG4gICAgLy9cbiAgICAvLyBUaGUgZGlzY29ubmVjdCB3YXMgdW5pbnRlbnRpb25hbCwgcHJvYmFibHkgYmVjYXVzZSB0aGUgc2VydmVyIHNodXQgZG93bi5cbiAgICAvLyBTbyB3ZSBzaG91bGQganVzdCBzdGFydCBhIHJlY29ubmVjdCBwcm9jZWR1cmUuXG4gICAgLy9cbiAgICBpZiAofnByaW11cy5vcHRpb25zLnN0cmF0ZWd5LmluZGV4T2YoJ2Rpc2Nvbm5lY3QnKSkgcHJpbXVzLnJlY29ubmVjdCgpO1xuICB9KTtcblxuICAvL1xuICAvLyBTZXR1cCB0aGUgcmVhbC10aW1lIGNsaWVudC5cbiAgLy9cbiAgcHJpbXVzLmNsaWVudCgpO1xuXG4gIC8vXG4gIC8vIFByb2Nlc3MgdGhlIHBvdGVudGlhbCBwbHVnaW5zLlxuICAvL1xuICBmb3IgKHZhciBwbHVnaW4gaW4gcHJpbXVzLmFyaykge1xuICAgIHByaW11cy5hcmtbcGx1Z2luXS5jYWxsKHByaW11cywgcHJpbXVzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vXG4gIC8vIE5PVEU6IFRoZSBmb2xsb3dpbmcgY29kZSBpcyBvbmx5IHJlcXVpcmVkIGlmIHdlJ3JlIHN1cHBvcnRpbmcgbmV0d29ya1xuICAvLyBldmVudHMgYXMgaXQgcmVxdWlyZXMgYWNjZXNzIHRvIGJyb3dzZXIgZ2xvYmFscy5cbiAgLy9cbiAgaWYgKCFwcmltdXMuTkVUV09SS19FVkVOVFMpIHJldHVybiBwcmltdXM7XG5cbiAgLyoqXG4gICAqIEhhbmRsZXIgZm9yIG9mZmxpbmUgbm90aWZpY2F0aW9ucy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBvZmZsaW5lKCkge1xuICAgICAgcHJpbXVzLm9ubGluZSA9IGZhbHNlO1xuICAgICAgcHJpbXVzLmVtaXQoJ29mZmxpbmUnKTtcbiAgICAgIHByaW11cy5lbmQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciBvbmxpbmUgbm90aWZpY2F0aW9ucy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBvbmxpbmUoKSB7XG4gICAgcHJpbXVzLm9ubGluZSA9IHRydWU7XG4gICAgcHJpbXVzLmVtaXQoJ29ubGluZScpO1xuXG4gICAgaWYgKH5wcmltdXMub3B0aW9ucy5zdHJhdGVneS5pbmRleE9mKCdvbmxpbmUnKSkgcHJpbXVzLnJlY29ubmVjdCgpO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCBvZmZsaW5lLCBmYWxzZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29ubGluZScsIG9ubGluZSwgZmFsc2UpO1xuICB9IGVsc2UgaWYgKGRvY3VtZW50LmJvZHkuYXR0YWNoRXZlbnQpe1xuICAgIGRvY3VtZW50LmJvZHkuYXR0YWNoRXZlbnQoJ29ub2ZmbGluZScsIG9mZmxpbmUpO1xuICAgIGRvY3VtZW50LmJvZHkuYXR0YWNoRXZlbnQoJ29ub25saW5lJywgb25saW5lKTtcbiAgfVxuXG4gIHJldHVybiBwcmltdXM7XG59O1xuXG4vKipcbiAqIEVzdGFibGlzaCBhIGNvbm5lY3Rpb24gd2l0aCB0aGUgc2VydmVyLiBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdlXG4gKiBhc3N1bWUgdGhhdCB3ZSBkb24ndCBoYXZlIGFueSBvcGVuIGNvbm5lY3Rpb25zLiBJZiB5b3UgZG8gY2FsbCBpdCB3aGVuIHlvdVxuICogaGF2ZSBhIGNvbm5lY3Rpb24gb3BlbiwgaXQgY291bGQgY2F1c2UgZHVwbGljYXRlIGNvbm5lY3Rpb25zLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW11cy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIG9wZW4oKSB7XG4gIGNvbnRleHQodGhpcywgJ29wZW4nKTtcblxuICAvL1xuICAvLyBPbmx5IHN0YXJ0IGEgYGNvbm5lY3Rpb24gdGltZW91dGAgcHJvY2VkdXJlIGlmIHdlJ3JlIG5vdCByZWNvbm5lY3RpbmcgYXNcbiAgLy8gdGhhdCBzaG91bGRuJ3QgY291bnQgYXMgYW4gaW5pdGlhbCBjb25uZWN0aW9uLiBUaGlzIHNob3VsZCBiZSBzdGFydGVkXG4gIC8vIGJlZm9yZSB0aGUgY29ubmVjdGlvbiBpcyBvcGVuZWQgdG8gY2FwdHVyZSBmYWlsaW5nIGNvbm5lY3Rpb25zIGFuZCBraWxsIHRoZVxuICAvLyB0aW1lb3V0LlxuICAvL1xuICBpZiAoIXRoaXMuYXR0ZW1wdCAmJiB0aGlzLm9wdGlvbnMudGltZW91dCkgdGhpcy50aW1lb3V0KCk7XG5cbiAgcmV0dXJuIHRoaXMuZW1pdCgnb3V0Z29pbmc6Om9wZW4nKTtcbn07XG5cbi8qKlxuICogU2VuZCBhIG5ldyBtZXNzYWdlLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGEgVGhlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSB3cml0dGVuLlxuICogQHJldHVybnMge0Jvb2xlYW59IEFsd2F5cyByZXR1cm5zIHRydWUuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5QcmltdXMucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUoZGF0YSkge1xuICB2YXIgcHJpbXVzID0gdGhpc1xuICAgICwgcGFja2V0O1xuXG4gIGNvbnRleHQocHJpbXVzLCAnd3JpdGUnKTtcblxuICBpZiAoUHJpbXVzLk9QRU4gPT09IHByaW11cy5yZWFkeVN0YXRlKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHByaW11cy50cmFuc2Zvcm1lcnMub3V0Z29pbmcubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhY2tldCA9IHsgZGF0YTogZGF0YSB9O1xuXG4gICAgICBpZiAoZmFsc2UgPT09IHByaW11cy50cmFuc2Zvcm1lcnMub3V0Z29pbmdbaV0uY2FsbChwcmltdXMsIHBhY2tldCkpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2hlbiBmYWxzZSBpcyByZXR1cm5lZCBieSBhbiBpbmNvbWluZyB0cmFuc2Zvcm1lciBpdCBtZWFucyB0aGF0J3NcbiAgICAgICAgLy8gYmVpbmcgaGFuZGxlZCBieSB0aGUgdHJhbnNmb3JtZXIgYW5kIHdlIHNob3VsZCBub3QgZW1pdCB0aGUgYGRhdGFgXG4gICAgICAgIC8vIGV2ZW50LlxuICAgICAgICAvL1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGRhdGEgPSBwYWNrZXQuZGF0YTtcbiAgICB9XG5cbiAgICBwcmltdXMuZW5jb2RlcihkYXRhLCBmdW5jdGlvbiBlbmNvZGVkKGVyciwgcGFja2V0KSB7XG4gICAgICAvL1xuICAgICAgLy8gRG8gYSBcInNhdmVcIiBlbWl0KCdlcnJvcicpIHdoZW4gd2UgZmFpbCB0byBwYXJzZSBhIG1lc3NhZ2UuIFdlIGRvbid0XG4gICAgICAvLyB3YW50IHRvIHRocm93IGhlcmUgYXMgbGlzdGVuaW5nIHRvIGVycm9ycyBzaG91bGQgYmUgb3B0aW9uYWwuXG4gICAgICAvL1xuICAgICAgaWYgKGVycikgcmV0dXJuIHByaW11cy5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoICYmIHByaW11cy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICBwcmltdXMuZW1pdCgnb3V0Z29pbmc6OmRhdGEnLCBwYWNrZXQpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHByaW11cy5idWZmZXIucHVzaChkYXRhKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBTZW5kIGEgbmV3IGhlYXJ0YmVhdCBvdmVyIHRoZSBjb25uZWN0aW9uIHRvIGVuc3VyZSB0aGF0IHdlJ3JlIHN0aWxsXG4gKiBjb25uZWN0ZWQgYW5kIG91ciBpbnRlcm5ldCBjb25uZWN0aW9uIGRpZG4ndCBkcm9wLiBXZSBjYW5ub3QgdXNlIHNlcnZlciBzaWRlXG4gKiBoZWFydGJlYXRzIGZvciB0aGlzIHVuZm9ydHVuYXRlbHkuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUuaGVhcnRiZWF0ID0gZnVuY3Rpb24gaGVhcnRiZWF0KCkge1xuICB2YXIgcHJpbXVzID0gdGhpcztcblxuICBpZiAoIXByaW11cy5vcHRpb25zLnBpbmcpIHJldHVybiBwcmltdXM7XG5cbiAgLyoqXG4gICAqIEV4dGVybWluYXRlIHRoZSBjb25uZWN0aW9uIGFzIHdlJ3ZlIHRpbWVkIG91dC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBwb25nKCkge1xuICAgIHByaW11cy5jbGVhclRpbWVvdXQoJ3BvbmcnKTtcblxuICAgIC8vXG4gICAgLy8gVGhlIG5ldHdvcmsgZXZlbnRzIGFscmVhZHkgY2FwdHVyZWQgdGhlIG9mZmxpbmUgZXZlbnQuXG4gICAgLy9cbiAgICBpZiAocHJpbXVzLm9ubGluZSkgcmV0dXJuO1xuXG4gICAgcHJpbXVzLm9ubGluZSA9IGZhbHNlO1xuICAgIHByaW11cy5lbWl0KCdvZmZsaW5lJyk7XG4gICAgcHJpbXVzLmVtaXQoJ2luY29taW5nOjplbmQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBzaG91bGQgc2VuZCBhIHBpbmcgbWVzc2FnZSB0byB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIHBpbmcoKSB7XG4gICAgcHJpbXVzLmNsZWFyVGltZW91dCgncGluZycpLndyaXRlKCdwcmltdXM6OnBpbmc6OicrICgrbmV3IERhdGUpKTtcbiAgICBwcmltdXMuZW1pdCgnb3V0Z29pbmc6OnBpbmcnKTtcbiAgICBwcmltdXMudGltZXJzLnBvbmcgPSBzZXRUaW1lb3V0KHBvbmcsIHByaW11cy5vcHRpb25zLnBvbmcpO1xuICB9XG5cbiAgcHJpbXVzLnRpbWVycy5waW5nID0gc2V0VGltZW91dChwaW5nLCBwcmltdXMub3B0aW9ucy5waW5nKTtcbn07XG5cbi8qKlxuICogU3RhcnQgYSBjb25uZWN0aW9uIHRpbWVvdXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIHRpbWVvdXQoKSB7XG4gIHZhciBwcmltdXMgPSB0aGlzO1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHJlZmVyZW5jZXMgdG8gdGhlIHRpbWVvdXQgbGlzdGVuZXIgYXMgd2UndmUgcmVjZWl2ZWQgYW4gZXZlbnRcbiAgICogdGhhdCBjYW4gYmUgdXNlZCB0byBkZXRlcm1pbmUgc3RhdGUuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgIHByaW11cy5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCByZW1vdmUpXG4gICAgICAgICAgLnJlbW92ZUxpc3RlbmVyKCdvcGVuJywgcmVtb3ZlKVxuICAgICAgICAgIC5yZW1vdmVMaXN0ZW5lcignZW5kJywgcmVtb3ZlKVxuICAgICAgICAgIC5jbGVhclRpbWVvdXQoJ2Nvbm5lY3QnKTtcbiAgfVxuXG4gIHByaW11cy50aW1lcnMuY29ubmVjdCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gc2V0VGltZW91dCgpIHtcbiAgICByZW1vdmUoKTsgLy8gQ2xlYW4gdXAgb2xkIHJlZmVyZW5jZXMuXG5cbiAgICBpZiAoUHJpbXVzLnJlYWR5U3RhdGUgPT09IFByaW11cy5PUEVOIHx8IHByaW11cy5hdHRlbXB0KSByZXR1cm47XG5cbiAgICBwcmltdXMuZW1pdCgndGltZW91dCcpO1xuXG4gICAgLy9cbiAgICAvLyBXZSBmYWlsZWQgdG8gY29ubmVjdCB0byB0aGUgc2VydmVyLlxuICAgIC8vXG4gICAgaWYgKH5wcmltdXMub3B0aW9ucy5zdHJhdGVneS5pbmRleE9mKCd0aW1lb3V0JykpIHByaW11cy5yZWNvbm5lY3QoKTtcbiAgICBlbHNlIHByaW11cy5lbmQoKTtcbiAgfSwgcHJpbXVzLm9wdGlvbnMudGltZW91dCk7XG5cbiAgcmV0dXJuIHByaW11cy5vbignZXJyb3InLCByZW1vdmUpXG4gICAgLm9uKCdvcGVuJywgcmVtb3ZlKVxuICAgIC5vbignZW5kJywgcmVtb3ZlKTtcbn07XG5cbi8qKlxuICogUHJvcGVybHkgY2xlYW4gdXAgYWxsIGBzZXRUaW1lb3V0YCByZWZlcmVuY2VzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSAuLmFyZ3MuLiBUaGUgbmFtZXMgb2YgdGhlIHRpbWVvdXQncyB3ZSBuZWVkIGNsZWFyLlxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gY2xlYXIoKSB7XG4gIGZvciAodmFyIGFyZ3MgPSBhcmd1bWVudHMsIGkgPSAwLCBsID0gYXJncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAodGhpcy50aW1lcnNbYXJnc1tpXV0pIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyc1thcmdzW2ldXSk7XG4gICAgZGVsZXRlIHRoaXMudGltZXJzW2FyZ3NbaV1dO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9uZW50aWFsIGJhY2sgb2ZmIGFsZ29yaXRobSBmb3IgcmV0cnkgb3BlcmF0aW9ucy4gSXQgdXNlcyBhbiByYW5kb21pemVkXG4gKiByZXRyeSBzbyB3ZSBkb24ndCBERE9TIG91ciBzZXJ2ZXIgd2hlbiBpdCBnb2VzIGRvd24gdW5kZXIgcHJlc3N1cmUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBmb3IgY29uZmlndXJpbmcgdGhlIHRpbWVvdXQuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpbXVzLnByb3RvdHlwZS5iYWNrb2ZmID0gZnVuY3Rpb24gYmFja29mZihjYWxsYmFjaywgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICB2YXIgcHJpbXVzID0gdGhpcztcblxuICAvL1xuICAvLyBCYWlsb3V0IHdoZW4gd2UgYWxyZWFkeSBoYXZlIGEgYmFja29mZiBwcm9jZXNzIHJ1bm5pbmcuIFdlIHNob3VsZG4ndCBjYWxsXG4gIC8vIHRoZSBjYWxsYmFjayB0aGVuIGFzIGl0IG1pZ2h0IGNhdXNlIGFuIHVuZXhwZWN0ZWQgYGVuZGAgZXZlbnQgYXMgYW5vdGhlclxuICAvLyByZWNvbm5lY3QgcHJvY2VzcyBpcyBhbHJlYWR5IHJ1bm5pbmcuXG4gIC8vXG4gIGlmIChvcHRzLmJhY2tvZmYpIHJldHVybiBwcmltdXM7XG5cbiAgb3B0cy5tYXhEZWxheSA9IG9wdHMubWF4RGVsYXkgfHwgSW5maW5pdHk7ICAvLyBNYXhpbXVtIGRlbGF5LlxuICBvcHRzLm1pbkRlbGF5ID0gb3B0cy5taW5EZWxheSB8fCA1MDA7ICAgICAgIC8vIE1pbmltdW0gZGVsYXkuXG4gIG9wdHMucmV0cmllcyA9IG9wdHMucmV0cmllcyB8fCAxMDsgICAgICAgICAgLy8gQW1vdW50IG9mIGFsbG93ZWQgcmV0cmllcy5cbiAgb3B0cy5hdHRlbXB0ID0gKCtvcHRzLmF0dGVtcHQgfHwgMCkgKyAxOyAgICAvLyBDdXJyZW50IGF0dGVtcHQuXG4gIG9wdHMuZmFjdG9yID0gb3B0cy5mYWN0b3IgfHwgMjsgICAgICAgICAgICAgLy8gQmFjayBvZmYgZmFjdG9yLlxuXG4gIC8vXG4gIC8vIEJhaWxvdXQgaWYgd2UgYXJlIGFib3V0IHRvIG1ha2UgdG8gbXVjaCBhdHRlbXB0cy4gUGxlYXNlIG5vdGUgdGhhdCB3ZSB1c2VcbiAgLy8gYD5gIGJlY2F1c2Ugd2UgYWxyZWFkeSBpbmNyZW1lbnRlZCB0aGUgdmFsdWUgYWJvdmUuXG4gIC8vXG4gIGlmIChvcHRzLmF0dGVtcHQgPiBvcHRzLnJldHJpZXMpIHtcbiAgICBjYWxsYmFjayhuZXcgRXJyb3IoJ1VuYWJsZSB0byByZXRyeScpLCBvcHRzKTtcbiAgICByZXR1cm4gcHJpbXVzO1xuICB9XG5cbiAgLy9cbiAgLy8gUHJldmVudCBkdXBsaWNhdGUgYmFjayBvZmYgYXR0ZW1wdHMgdXNpbmcgdGhlIHNhbWUgb3B0aW9ucyBvYmplY3QuXG4gIC8vXG4gIG9wdHMuYmFja29mZiA9IHRydWU7XG5cbiAgLy9cbiAgLy8gQ2FsY3VsYXRlIHRoZSB0aW1lb3V0LCBidXQgbWFrZSBpdCByYW5kb21seSBzbyB3ZSBkb24ndCByZXRyeSBjb25uZWN0aW9uc1xuICAvLyBhdCB0aGUgc2FtZSBpbnRlcnZhbCBhbmQgZGVmZWF0IHRoZSBwdXJwb3NlLiBUaGlzIGV4cG9uZW50aWFsIGJhY2sgb2ZmIGlzXG4gIC8vIGJhc2VkIG9uIHRoZSB3b3JrIG9mOlxuICAvL1xuICAvLyBodHRwOi8vZHRoYWluLmJsb2dzcG90Lm5sLzIwMDkvMDIvZXhwb25lbnRpYWwtYmFja29mZi1pbi1kaXN0cmlidXRlZC5odG1sXG4gIC8vXG4gIG9wdHMudGltZW91dCA9IG9wdHMuYXR0ZW1wdCAhPT0gMVxuICAgID8gTWF0aC5taW4oTWF0aC5yb3VuZChcbiAgICAgICAgKE1hdGgucmFuZG9tKCkgKyAxKSAqIG9wdHMubWluRGVsYXkgKiBNYXRoLnBvdyhvcHRzLmZhY3Rvciwgb3B0cy5hdHRlbXB0KVxuICAgICAgKSwgb3B0cy5tYXhEZWxheSlcbiAgICA6IG9wdHMubWluRGVsYXk7XG5cbiAgLy9cbiAgLy8gRW1pdCBhIGByZWNvbm5lY3RpbmdgIGV2ZW50IHdpdGggY3VycmVudCByZWNvbm5lY3Qgb3B0aW9ucy4gVGhpcyBhbGxvd3NcbiAgLy8gdGhlbSB0byB1cGRhdGUgdGhlIFVJIGFuZCBwcm92aWRlIHRoZWlyIHVzZXJzIHdpdGggZmVlZGJhY2suXG4gIC8vXG4gIHByaW11cy5lbWl0KCdyZWNvbm5lY3RpbmcnLCBvcHRzKTtcblxuICBwcmltdXMudGltZXJzLnJlY29ubmVjdCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gZGVsYXkoKSB7XG4gICAgb3B0cy5iYWNrb2ZmID0gZmFsc2U7XG4gICAgcHJpbXVzLmNsZWFyVGltZW91dCgncmVjb25uZWN0Jyk7XG5cbiAgICBjYWxsYmFjayh1bmRlZmluZWQsIG9wdHMpO1xuICB9LCBvcHRzLnRpbWVvdXQpO1xuXG4gIHJldHVybiBwcmltdXM7XG59O1xuXG4vKipcbiAqIFN0YXJ0IGEgbmV3IHJlY29ubmVjdCBwcm9jZWR1cmUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW11cy5wcm90b3R5cGUucmVjb25uZWN0ID0gZnVuY3Rpb24gcmVjb25uZWN0KCkge1xuICB2YXIgcHJpbXVzID0gdGhpcztcblxuICAvL1xuICAvLyBUcnkgdG8gcmUtdXNlIHRoZSBleGlzdGluZyBhdHRlbXB0LlxuICAvL1xuICBwcmltdXMuYXR0ZW1wdCA9IHByaW11cy5hdHRlbXB0IHx8IHByaW11cy5jbG9uZShwcmltdXMub3B0aW9ucy5yZWNvbm5lY3QpO1xuXG4gIHByaW11cy5iYWNrb2ZmKGZ1bmN0aW9uIGF0dGVtcHQoZmFpbCwgYmFja29mZikge1xuICAgIGlmIChmYWlsKSB7XG4gICAgICBwcmltdXMuYXR0ZW1wdCA9IG51bGw7XG4gICAgICByZXR1cm4gcHJpbXVzLmVtaXQoJ2VuZCcpO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gVHJ5IHRvIHJlLW9wZW4gdGhlIGNvbm5lY3Rpb24gYWdhaW4uXG4gICAgLy9cbiAgICBwcmltdXMuZW1pdCgncmVjb25uZWN0JywgYmFja29mZik7XG4gICAgcHJpbXVzLmVtaXQoJ291dGdvaW5nOjpyZWNvbm5lY3QnKTtcbiAgfSwgcHJpbXVzLmF0dGVtcHQpO1xuXG4gIHJldHVybiBwcmltdXM7XG59O1xuXG4vKipcbiAqIENsb3NlIHRoZSBjb25uZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGEgbGFzdCBwYWNrZXQgb2YgZGF0YS5cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW11cy5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gZW5kKGRhdGEpIHtcbiAgY29udGV4dCh0aGlzLCAnZW5kJyk7XG5cbiAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gUHJpbXVzLkNMT1NFRCAmJiAhdGhpcy50aW1lcnMuY29ubmVjdCkgcmV0dXJuIHRoaXM7XG4gIGlmIChkYXRhKSB0aGlzLndyaXRlKGRhdGEpO1xuXG4gIHRoaXMud3JpdGFibGUgPSBmYWxzZTtcbiAgdGhpcy5yZWFkeVN0YXRlID0gUHJpbXVzLkNMT1NFRDtcblxuICBmb3IgKHZhciB0aW1lb3V0IGluIHRoaXMudGltZXJzKSB7XG4gICAgdGhpcy5jbGVhclRpbWVvdXQodGltZW91dCk7XG4gIH1cblxuICB0aGlzLmVtaXQoJ291dGdvaW5nOjplbmQnKTtcbiAgdGhpcy5lbWl0KCdjbG9zZScpO1xuICB0aGlzLmVtaXQoJ2VuZCcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBzaGFsbG93IGNsb25lIG9mIGEgZ2l2ZW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0aGF0IG5lZWRzIHRvIGJlIGNsb25lZC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IENvcHkuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpbXVzLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICByZXR1cm4gdGhpcy5tZXJnZSh7fSwgb2JqKTtcbn07XG5cbi8qKlxuICogTWVyZ2UgZGlmZmVyZW50IG9iamVjdHMgaW4gdG8gb25lIHRhcmdldCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCBUaGUgb2JqZWN0IHdoZXJlIGV2ZXJ5dGhpbmcgc2hvdWxkIGJlIG1lcmdlZCBpbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IE9yaWdpbmFsIHRhcmdldCB3aXRoIGFsbCBtZXJnZWQgb2JqZWN0cy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5QcmltdXMucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UodGFyZ2V0KSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3MubGVuZ3RoLCBrZXksIG9iajsgaSA8IGw7IGkrKykge1xuICAgIG9iaiA9IGFyZ3NbaV07XG5cbiAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkgdGFyZ2V0W2tleV0gPSBvYmpba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgY29ubmVjdGlvbiBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybCBDb25uZWN0aW9uIFVSTC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFBhcnNlZCBjb25uZWN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUHJpbXVzLnByb3RvdHlwZS5wYXJzZSA9IHBhcnNlO1xuXG4vKipcbiAqIFBhcnNlIGEgcXVlcnkgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBxdWVyeSBUaGUgcXVlcnkgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmUgcGFyc2VkLlxuICogQHJldHVybnMge09iamVjdH0gUGFyc2VkIHF1ZXJ5IHN0cmluZy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW11cy5wcm90b3R5cGUucXVlcnlzdHJpbmcgPSBmdW5jdGlvbiBxdWVyeXN0cmluZyhxdWVyeSkge1xuICB2YXIgcGFyc2VyID0gLyhbXj0/Jl0rKT0oW14mXSopL2dcbiAgICAsIHJlc3VsdCA9IHt9XG4gICAgLCBwYXJ0O1xuXG4gIC8vXG4gIC8vIExpdHRsZSBuaWZ0eSBwYXJzaW5nIGhhY2ssIGxldmVyYWdlIHRoZSBmYWN0IHRoYXQgUmVnRXhwLmV4ZWMgaW5jcmVtZW50c1xuICAvLyB0aGUgbGFzdEluZGV4IHByb3BlcnR5IHNvIHdlIGNhbiBjb250aW51ZSBleGVjdXRpbmcgdGhpcyBsb29wIHVudGlsIHdlJ3ZlXG4gIC8vIHBhcnNlZCBhbGwgcmVzdWx0cy5cbiAgLy9cbiAgZm9yICg7IHBhcnQgPSBwYXJzZXIuZXhlYyhxdWVyeSk7IHJlc3VsdFtwYXJ0WzFdXSA9IHBhcnRbMl0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGNvbm5lY3Rpb24gVVJJLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm90b2NvbCBUaGUgcHJvdG9jb2wgdGhhdCBzaG91bGQgdXNlZCB0byBjcmF0ZSB0aGUgVVJJLlxuICogQHBhcmFtIHtCb29sZWFufSBxdWVyeXN0cmluZyBEbyB3ZSBuZWVkIHRvIGluY2x1ZGUgYSBxdWVyeSBzdHJpbmcuXG4gKiBAcmV0dXJucyB7U3RyaW5nfG9wdGlvbnN9IFRoZSBVUkwuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpbXVzLnByb3RvdHlwZS51cmkgPSBmdW5jdGlvbiB1cmkob3B0aW9ucywgcXVlcnlzdHJpbmcpIHtcbiAgdmFyIHVybCA9IHRoaXMudXJsXG4gICAgLCBzZXJ2ZXIgPSBbXTtcblxuICAvL1xuICAvLyBCYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoIFByaW11cyAxLjQuMFxuICAvLyBAVE9ETyBSZW1vdmUgbWUgZm9yIFByaW11cyAyLjBcbiAgLy9cbiAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2Ygb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7IHByb3RvY29sOiBvcHRpb25zIH07XG4gICAgaWYgKHF1ZXJ5c3RyaW5nKSBvcHRpb25zLnF1ZXJ5ID0gcXVlcnlzdHJpbmc7XG4gIH1cblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgb3B0aW9ucy5wcm90b2NvbCA9ICdwcm90b2NvbCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMucHJvdG9jb2wgOiAnaHR0cCc7XG4gIG9wdGlvbnMucXVlcnkgPSB1cmwuc2VhcmNoICYmICdxdWVyeScgaW4gb3B0aW9ucyA/ICh1cmwuc2VhcmNoLmNoYXJBdCgwKSA9PT0gJz8nID8gdXJsLnNlYXJjaC5zbGljZSgxKSA6IHVybC5zZWFyY2gpIDogZmFsc2U7XG4gIG9wdGlvbnMuc2VjdXJlID0gJ3NlY3VyZScgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc2VjdXJlIDogdXJsLnByb3RvY29sID09PSAnaHR0cHM6JztcbiAgb3B0aW9ucy5hdXRoID0gJ2F1dGgnIGluIG9wdGlvbnMgPyBvcHRpb25zLmF1dGggOiB1cmwuYXV0aDtcbiAgb3B0aW9ucy5wYXRobmFtZSA9ICdwYXRobmFtZScgaW4gb3B0aW9ucyA/IG9wdGlvbnMucGF0aG5hbWUgOiB0aGlzLnBhdGhuYW1lLnNsaWNlKDEpO1xuICBvcHRpb25zLnBvcnQgPSAncG9ydCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMucG9ydCA6IHVybC5wb3J0IHx8IChvcHRpb25zLnNlY3VyZSA/IDQ0MyA6IDgwKTtcbiAgb3B0aW9ucy5ob3N0ID0gJ2hvc3QnIGluIG9wdGlvbnMgPyBvcHRpb25zLmhvc3QgOiB1cmwuaG9zdG5hbWUgfHwgdXJsLmhvc3QucmVwbGFjZSgnOicrIHVybC5wb3J0LCAnJyk7XG5cbiAgLy9cbiAgLy8gQXV0b21hdGljYWxseSBzdWZmaXggdGhlIHByb3RvY29sIHNvIHdlIGNhbiBzdXBwbHkgYHdzYCBhbmQgYGh0dHBgIGFuZCBpdCBnZXRzXG4gIC8vIHRyYW5zZm9ybWVkIGNvcnJlY3RseS5cbiAgLy9cbiAgc2VydmVyLnB1c2gob3B0aW9ucy5zZWN1cmUgPyBvcHRpb25zLnByb3RvY29sICsnczonIDogb3B0aW9ucy5wcm90b2NvbCArJzonLCAnJyk7XG5cbiAgaWYgKG9wdGlvbnMuYXV0aCkgc2VydmVyLnB1c2gob3B0aW9ucy5hdXRoICsnQCcrIHVybC5ob3N0KTtcbiAgZWxzZSBzZXJ2ZXIucHVzaCh1cmwuaG9zdCk7XG5cbiAgLy9cbiAgLy8gUGF0aG5hbWVzIGFyZSBvcHRpb25hbCBhcyBzb21lIFRyYW5zZm9ybWVycyB3b3VsZCBqdXN0IHVzZSB0aGUgcGF0aG5hbWVcbiAgLy8gZGlyZWN0bHkuXG4gIC8vXG4gIGlmIChvcHRpb25zLnBhdGhuYW1lKSBzZXJ2ZXIucHVzaChvcHRpb25zLnBhdGhuYW1lKTtcblxuICAvL1xuICAvLyBPcHRpb25hbGx5IGFkZCBhIHNlYXJjaCBxdWVyeSwgYWdhaW4sIG5vdCBzdXBwb3J0ZWQgYnkgYWxsIFRyYW5zZm9ybWVycy5cbiAgLy8gU29ja0pTIGlzIGtub3duIHRvIHRocm93IGVycm9ycyB3aGVuIGEgcXVlcnkgc3RyaW5nIGlzIGluY2x1ZGVkLlxuICAvL1xuICBpZiAob3B0aW9ucy5xdWVyeSkgc2VydmVyLnB1c2goJz8nKyBvcHRpb25zLnF1ZXJ5KTtcblxuICBpZiAob3B0aW9ucy5vYmplY3QpIHJldHVybiBvcHRpb25zO1xuICByZXR1cm4gc2VydmVyLmpvaW4oJy8nKTtcbn07XG5cbi8qKlxuICogU2ltcGxlIGVtaXQgd3JhcHBlciB0aGF0IHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGVtaXRzIGFuIGV2ZW50IG9uY2UgaXQnc1xuICogY2FsbGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciBmb3IgdHJhbnNwb3J0cyB0byBlbWl0IHNwZWNpZmljIGV2ZW50cy4gVGhlXG4gKiBzY29wZSBvZiB0aGlzIGZ1bmN0aW9uIGlzIGxpbWl0ZWQgYXMgaXQgd2lsbCBvbmx5IGVtaXQgb25lIHNpbmdsZSBhcmd1bWVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQgdGhhdCB3ZSBzaG91bGQgZW1pdC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHBhcnNlciBBcmd1bWVudCBwYXJzZXIuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5QcmltdXMucHJvdG90eXBlLmVtaXRzID0gZnVuY3Rpb24gZW1pdHMoZXZlbnQsIHBhcnNlcikge1xuICB2YXIgcHJpbXVzID0gdGhpcztcblxuICByZXR1cm4gZnVuY3Rpb24gZW1pdChhcmcpIHtcbiAgICB2YXIgZGF0YSA9IHBhcnNlciA/IHBhcnNlci5hcHBseShwcmltdXMsIGFyZ3VtZW50cykgOiBhcmc7XG5cbiAgICAvL1xuICAgIC8vIFRpbWVvdXQgaXMgcmVxdWlyZWQgdG8gcHJldmVudCBjcmFzaGVzIG9uIFdlYlNvY2tldHMgY29ubmVjdGlvbnMgb25cbiAgICAvLyBtb2JpbGUgZGV2aWNlcy4gV2UgbmVlZCB0byBoYW5kbGUgdGhlc2UgZWRnZSBjYXNlcyBpbiBvdXIgb3duIGxpYnJhcnlcbiAgICAvLyBhcyB3ZSBjYW5ub3QgYmUgY2VydGFpbiB0aGF0IGFsbCBmcmFtZXdvcmtzIGZpeCB0aGVzZSBpc3N1ZXMuXG4gICAgLy9cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uIHRpbWVvdXQoKSB7XG4gICAgICBwcmltdXMuZW1pdCgnaW5jb21pbmc6OicrIGV2ZW50LCBkYXRhKTtcbiAgICB9LCAwKTtcbiAgfTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgbWVzc2FnZSB0cmFuc2Zvcm1lci4gVGhpcyBhbGxvd3MgeW91IHRvIGVhc2lseSBtYW5pcHVsYXRlIGluY29taW5nXG4gKiBhbmQgb3V0Z29pbmcgZGF0YSB3aGljaCBpcyBwYXJ0aWN1bGFyaXR5IGhhbmR5IGZvciBwbHVnaW5zIHRoYXQgd2FudCB0byBzZW5kXG4gKiBtZXRhIGRhdGEgdG9nZXRoZXIgd2l0aCB0aGUgbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgSW5jb21pbmcgb3Igb3V0Z29pbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgbmV3IG1lc3NhZ2UgdHJhbnNmb3JtZXIuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5QcmltdXMucHJvdG90eXBlLnRyYW5zZm9ybSA9IGZ1bmN0aW9uIHRyYW5zZm9ybSh0eXBlLCBmbikge1xuICBjb250ZXh0KHRoaXMsICd0cmFuc2Zvcm0nKTtcblxuICBpZiAoISh0eXBlIGluIHRoaXMudHJhbnNmb3JtZXJzKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRyYW5zZm9ybWVyIHR5cGUnKTtcblxuICB0aGlzLnRyYW5zZm9ybWVyc1t0eXBlXS5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEEgY3JpdGljYWwgZXJyb3IgaGFzIG9jY3VycmVkLCBpZiB3ZSBoYXZlIGFuIGBlcnJvcmAgbGlzdGVuZXIsIGVtaXQgaXQgdGhlcmUuXG4gKiBJZiBub3QsIHRocm93IGl0LCBzbyB3ZSBnZXQgYSBzdGFjayB0cmFjZSArIHByb3BlciBlcnJvciBtZXNzYWdlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciBUaGUgY3JpdGljYWwgZXJyb3IuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpbXVzLnByb3RvdHlwZS5jcml0aWNhbCA9IGZ1bmN0aW9uIGNyaXRpY2FsKGVycikge1xuICBpZiAodGhpcy5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoKSByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG5cbiAgdGhyb3cgZXJyO1xufTtcblxuLyoqXG4gKiBTeW50YXggc3VnYXIsIGFkb3B0IGEgU29ja2V0LklPIGxpa2UgQVBJLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB3ZSB3YW50IHRvIGNvbm5lY3QgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBDb25uZWN0aW9uIG9wdGlvbnMuXG4gKiBAcmV0dXJucyB7UHJpbXVzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuUHJpbXVzLmNvbm5lY3QgPSBmdW5jdGlvbiBjb25uZWN0KHVybCwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFByaW11cyh1cmwsIG9wdGlvbnMpO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgRXZlbnRFbWl0dGVyIHNvIGl0IGNhbiBiZSByZS11c2VkIGJ5IHdyYXBwaW5nIGxpYnJhcmllcyB3ZSdyZSBhbHNvXG4vLyBleHBvc2luZyB0aGUgU3RyZWFtIGludGVyZmFjZS5cbi8vXG5QcmltdXMuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gVGhlc2UgbGlicmFyaWVzIGFyZSBhdXRvbWF0aWNhbGx5IGFyZSBhdXRvbWF0aWNhbGx5IGluc2VydGVkIGF0IHRoZVxuLy8gc2VydmVyLXNpZGUgdXNpbmcgdGhlIFByaW11cyNsaWJyYXJ5IG1ldGhvZC5cbi8vXG5QcmltdXMucHJvdG90eXBlLmNsaWVudCA9IGZ1bmN0aW9uIGNsaWVudCgpIHtcbiAgdmFyIHByaW11cyA9IHRoaXNcbiAgICAsIHNvY2tldDtcblxuICAvL1xuICAvLyBTZWxlY3RzIGFuIGF2YWlsYWJsZSBFbmdpbmUuSU8gZmFjdG9yeS5cbiAgLy9cbiAgdmFyIEZhY3RvcnkgPSAoZnVuY3Rpb24gRmFjdG9yeSgpIHtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBTb2NrSlMpIHJldHVybiBTb2NrSlM7XG5cbiAgICB0cnkgeyByZXR1cm4gUHJpbXVzLnJlcXVpcmUoJ3NvY2tqcy1jbGllbnQtbm9kZScpOyB9XG4gICAgY2F0Y2ggKGUpIHt9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9KSgpO1xuXG4gIGlmICghRmFjdG9yeSkgcmV0dXJuIHByaW11cy5jcml0aWNhbChuZXcgRXJyb3IoJ01pc3NpbmcgcmVxdWlyZWQgYHNvY2tqcy1jbGllbnQtbm9kZWAgbW9kdWxlLiBQbGVhc2UgcnVuIGBucG0gaW5zdGFsbCAtLXNhdmUgc29ja2pzLWNsaWVudC1ub2RlYCcpKTtcblxuICAvL1xuICAvLyBDb25uZWN0IHRvIHRoZSBnaXZlbiBVUkwuXG4gIC8vXG4gIHByaW11cy5vbignb3V0Z29pbmc6Om9wZW4nLCBmdW5jdGlvbiBvcGVuaW5nKCkge1xuICAgIGlmIChzb2NrZXQpIHNvY2tldC5jbG9zZSgpO1xuXG4gICAgcHJpbXVzLnNvY2tldCA9IHNvY2tldCA9IG5ldyBGYWN0b3J5KHByaW11cy51cmkoeyBwcm90b2NvbDogJ2h0dHAnIH0pLCBudWxsLCB7XG4gICAgICB3ZWJzb2NrZXQ6ICFwcmltdXMuQVZPSURfV0VCU09DS0VUU1xuICAgIH0pO1xuXG4gICAgLy9cbiAgICAvLyBTZXR1cCB0aGUgRXZlbnQgaGFuZGxlcnMuXG4gICAgLy9cbiAgICBzb2NrZXQub25vcGVuID0gcHJpbXVzLmVtaXRzKCdvcGVuJyk7XG4gICAgc29ja2V0Lm9uZXJyb3IgPSBwcmltdXMuZW1pdHMoJ2Vycm9yJyk7XG4gICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGV2ZW50ID0gZSAmJiBlLmNvZGUgPT09IDEwMDIgPyAnZXJyb3InIDogJ2VuZCc7XG5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgdGltZW91dCByZXBsaWNhdGVzIHRoZSBiZWhhdmlvdXIgb2YgcHJpbXVzLmVtaXRzIHNvIHdlJ3JlIG5vdFxuICAgICAgLy8gYWZmZWN0ZWQgYnkgYW55IHRpbWluZyBidWdzLlxuICAgICAgLy9cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZW91dCgpIHtcbiAgICAgICAgcHJpbXVzLmVtaXQoJ2luY29taW5nOjonKyBldmVudCwgZSk7XG4gICAgICB9LCAwKTtcbiAgICB9O1xuICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBwcmltdXMuZW1pdHMoJ2RhdGEnLCBmdW5jdGlvbiBwYXJzZShldnQpIHtcbiAgICAgIHJldHVybiBldnQuZGF0YTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy9cbiAgLy8gV2UgbmVlZCB0byB3cml0ZSBhIG5ldyBtZXNzYWdlIHRvIHRoZSBzb2NrZXQuXG4gIC8vXG4gIHByaW11cy5vbignb3V0Z29pbmc6OmRhdGEnLCBmdW5jdGlvbiB3cml0ZShtZXNzYWdlKSB7XG4gICAgaWYgKHNvY2tldCkgc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gIH0pO1xuXG4gIC8vXG4gIC8vIEF0dGVtcHQgdG8gcmVjb25uZWN0IHRoZSBzb2NrZXQuIEl0IGFzc3VtZXMgdGhhdCB0aGUgYGNsb3NlYCBldmVudCBpc1xuICAvLyBjYWxsZWQgaWYgaXQgZmFpbGVkIHRvIGRpc2Nvbm5lY3QuXG4gIC8vXG4gIHByaW11cy5vbignb3V0Z29pbmc6OnJlY29ubmVjdCcsIGZ1bmN0aW9uIHJlY29ubmVjdCgpIHtcbiAgICBpZiAoc29ja2V0KSBwcmltdXMuZW1pdCgnb3V0Z29pbmc6OmNsb3NlJyk7XG4gICAgcHJpbXVzLmVtaXQoJ291dGdvaW5nOjpvcGVuJyk7XG4gIH0pO1xuXG4gIC8vXG4gIC8vIFdlIG5lZWQgdG8gY2xvc2UgdGhlIHNvY2tldC5cbiAgLy9cbiAgcHJpbXVzLm9uKCdvdXRnb2luZzo6ZW5kJywgZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgaWYgKHNvY2tldCkge1xuICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICBzb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgfSk7XG59O1xuUHJpbXVzLnByb3RvdHlwZS5hdXRob3JpemF0aW9uID0gZmFsc2U7XG5QcmltdXMucHJvdG90eXBlLnBhdGhuYW1lID0gXCIvcHJpbXVzXCI7XG5QcmltdXMucHJvdG90eXBlLmVuY29kZXIgPSBmdW5jdGlvbiBlbmNvZGVyKGRhdGEsIGZuKSB7XG4gIHZhciBlcnI7XG5cbiAgdHJ5IHsgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpOyB9XG4gIGNhdGNoIChlKSB7IGVyciA9IGU7IH1cblxuICBmbihlcnIsIGRhdGEpO1xufTtcblByaW11cy5wcm90b3R5cGUuZGVjb2RlciA9IGZ1bmN0aW9uIGRlY29kZXIoZGF0YSwgZm4pIHtcbiAgdmFyIGVycjtcblxuICB0cnkgeyBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTsgfVxuICBjYXRjaCAoZSkgeyBlcnIgPSBlOyB9XG5cbiAgZm4oZXJyLCBkYXRhKTtcbn07XG5QcmltdXMucHJvdG90eXBlLnZlcnNpb24gPSBcIjEuNC42XCI7XG5cbi8vXG4vLyBIYWNrIDE6IFxcdTIwMjggYW5kIFxcdTIwMjkgYXJlIGFsbG93ZWQgaW5zaWRlIHN0cmluZyBpbiBKU09OLiBCdXQgSmF2YVNjcmlwdFxuLy8gZGVmaW5lcyB0aGVtIGFzIG5ld2xpbmUgc2VwYXJhdG9ycy4gQmVjYXVzZSBubyBsaXRlcmFsIG5ld2xpbmVzIGFyZSBhbGxvd2VkXG4vLyBpbiBhIHN0cmluZyB0aGlzIGNhdXNlcyBhIFBhcnNlRXJyb3IuIFdlIHdvcmsgYXJvdW5kIHRoaXMgaXNzdWUgYnkgcmVwbGFjaW5nXG4vLyB0aGVzZSBjaGFyYWN0ZXJzIHdpdGggYSBwcm9wZXJseSBlc2NhcGVkIHZlcnNpb24gZm9yIHRob3NlIGNoYXJzLiBUaGlzIGNhblxuLy8gY2F1c2UgZXJyb3JzIHdpdGggSlNPTlAgcmVxdWVzdHMgb3IgaWYgdGhlIHN0cmluZyBpcyBqdXN0IGV2YWx1YXRlZC5cbi8vXG4vLyBUaGlzIGNvdWxkIGhhdmUgYmVlbiBzb2x2ZWQgYnkgcmVwbGFjaW5nIHRoZSBkYXRhIGR1cmluZyB0aGUgXCJvdXRnb2luZzo6ZGF0YVwiXG4vLyBldmVudC4gQnV0IGFzIGl0IGFmZmVjdHMgdGhlIEpTT04gZW5jb2RpbmcgaW4gZ2VuZXJhbCBJJ3ZlIG9wdGVkIGZvciBhIGdsb2JhbFxuLy8gcGF0Y2ggaW5zdGVhZCBzbyBhbGwgSlNPTi5zdHJpbmdpZnkgb3BlcmF0aW9ucyBhcmUgc2F2ZS5cbi8vXG5pZiAoXG4gICAgJ29iamVjdCcgPT09IHR5cGVvZiBKU09OXG4gJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIEpTT04uc3RyaW5naWZ5XG4gJiYgSlNPTi5zdHJpbmdpZnkoWydcXHUyMDI4XFx1MjAyOSddKSA9PT0gJ1tcIlxcdTIwMjhcXHUyMDI5XCJdJ1xuKSB7XG4gIEpTT04uc3RyaW5naWZ5ID0gZnVuY3Rpb24gcmVwbGFjZShzdHJpbmdpZnkpIHtcbiAgICB2YXIgdTIwMjggPSAvXFx1MjAyOC9nXG4gICAgICAsIHUyMDI5ID0gL1xcdTIwMjkvZztcblxuICAgIHJldHVybiBmdW5jdGlvbiBwYXRjaGVkKHZhbHVlLCByZXBsYWNlciwgc3BhY2VzKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gc3RyaW5naWZ5LmNhbGwodGhpcywgdmFsdWUsIHJlcGxhY2VyLCBzcGFjZXMpO1xuXG4gICAgICAvL1xuICAgICAgLy8gUmVwbGFjZSB0aGUgYmFkIGNoYXJzLlxuICAgICAgLy9cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgaWYgKH5yZXN1bHQuaW5kZXhPZignXFx1MjAyOCcpKSByZXN1bHQgPSByZXN1bHQucmVwbGFjZSh1MjAyOCwgJ1xcXFx1MjAyOCcpO1xuICAgICAgICBpZiAofnJlc3VsdC5pbmRleE9mKCdcXHUyMDI5JykpIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHUyMDI5LCAnXFxcXHUyMDI5Jyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfShKU09OLnN0cmluZ2lmeSk7XG59XG5cbmlmIChcbiAgICAgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBkb2N1bWVudFxuICAmJiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG5hdmlnYXRvclxuKSB7XG4gIC8vXG4gIC8vIEhhY2sgMjogSWYgeW91IHByZXNzIEVTQyBpbiBGaXJlRm94IGl0IHdpbGwgY2xvc2UgYWxsIGFjdGl2ZSBjb25uZWN0aW9ucy5cbiAgLy8gTm9ybWFsbHkgdGhpcyBtYWtlcyBzZW5zZSwgd2hlbiB5b3VyIHBhZ2UgaXMgc3RpbGwgbG9hZGluZy4gQnV0IHZlcnNpb25zXG4gIC8vIGJlZm9yZSBGaXJlRm94IDIyIHdpbGwgY2xvc2UgYWxsIGNvbm5lY3Rpb25zIGluY2x1ZGluZyBXZWJTb2NrZXQgY29ubmVjdGlvbnNcbiAgLy8gYWZ0ZXIgcGFnZSBsb2FkLiBPbmUgd2F5IHRvIHByZXZlbnQgdGhpcyBpcyB0byBkbyBhIGBwcmV2ZW50RGVmYXVsdCgpYCBhbmRcbiAgLy8gY2FuY2VsIHRoZSBvcGVyYXRpb24gYmVmb3JlIGl0IGJ1YmJsZXMgdXAgdG8gdGhlIGJyb3dzZXJzIGRlZmF1bHQgaGFuZGxlci5cbiAgLy8gSXQgbmVlZHMgdG8gYmUgYWRkZWQgYXMgYGtleWRvd25gIGV2ZW50LCBpZiBpdCdzIGFkZGVkIGtleXVwIGl0IHdpbGwgbm90IGJlXG4gIC8vIGFibGUgdG8gcHJldmVudCB0aGUgY29ubmVjdGlvbiBmcm9tIGJlaW5nIGNsb3NlZC5cbiAgLy9cbiAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24ga2V5ZG93bihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlICE9PSAyNyB8fCAhZS5wcmV2ZW50RGVmYXVsdCkgcmV0dXJuO1xuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy9cbiAgLy8gSGFjayAzOiBUaGlzIGlzIGEgTWFjL0FwcGxlIGJ1ZyBvbmx5LCB3aGVuIHlvdSdyZSBiZWhpbmQgYSByZXZlcnNlIHByb3h5IG9yXG4gIC8vIGhhdmUgeW91IG5ldHdvcmsgc2V0dGluZ3Mgc2V0IHRvIGBhdXRvbWF0aWMgcHJveHkgZGlzY292ZXJ5YCB0aGUgc2FmYXJpXG4gIC8vIGJyb3dzZXIgd2lsbCBjcmFzaCB3aGVuIHRoZSBXZWJTb2NrZXQgY29uc3RydWN0b3IgaXMgaW5pdGlhbGlzZWQuIFRoZXJlIGlzXG4gIC8vIG5vIHdheSB0byBkZXRlY3QgdGhlIHVzYWdlIG9mIHRoZXNlIHByb3hpZXMgYXZhaWxhYmxlIGluIEphdmFTY3JpcHQgc28gd2VcbiAgLy8gbmVlZCB0byBkbyBzb21lIG5hc3R5IGJyb3dzZXIgc25pZmZpbmcuIFRoaXMgb25seSBhZmZlY3RzIFNhZmFyaSB2ZXJzaW9uc1xuICAvLyBsb3dlciB0aGVuIDUuMS40XG4gIC8vXG4gIHZhciB1YSA9IChuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgLCBwYXJzZWQgPSB1YS5tYXRjaCgvLisoPzpydnxpdHxyYXxpZSlbXFwvOiBdKFxcZCspXFwuKFxcZCspKD86XFwuKFxcZCspKT8vKSB8fCBbXVxuICAgICwgdmVyc2lvbiA9ICtbcGFyc2VkWzFdLCBwYXJzZWRbMl1dLmpvaW4oJy4nKTtcblxuICBpZiAoXG4gICAgICAgIX51YS5pbmRleE9mKCdjaHJvbWUnKVxuICAgICYmIH51YS5pbmRleE9mKCdzYWZhcmknKVxuICAgICYmIHZlcnNpb24gPCA1MzQuNTRcbiAgKSB7XG4gICAgUHJpbXVzLnByb3RvdHlwZS5BVk9JRF9XRUJTT0NLRVRTID0gdHJ1ZTtcbiAgfVxufVxuIHJldHVybiBQcmltdXM7IH0pOy8qIFNvY2tKUyBjbGllbnQsIHZlcnNpb24gMC4zLjQsIGh0dHA6Ly9zb2NranMub3JnLCBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuKi9cblxuLy8gSlNPTjIgYnkgRG91Z2xhcyBDcm9ja2ZvcmQgKG1pbmlmaWVkKS5cbnZhciBKU09OO0pTT058fChKU09OPXt9KSxmdW5jdGlvbigpe2Z1bmN0aW9uIHN0cihhLGIpe3ZhciBjLGQsZSxmLGc9Z2FwLGgsaT1iW2FdO2kmJnR5cGVvZiBpPT1cIm9iamVjdFwiJiZ0eXBlb2YgaS50b0pTT049PVwiZnVuY3Rpb25cIiYmKGk9aS50b0pTT04oYSkpLHR5cGVvZiByZXA9PVwiZnVuY3Rpb25cIiYmKGk9cmVwLmNhbGwoYixhLGkpKTtzd2l0Y2godHlwZW9mIGkpe2Nhc2VcInN0cmluZ1wiOnJldHVybiBxdW90ZShpKTtjYXNlXCJudW1iZXJcIjpyZXR1cm4gaXNGaW5pdGUoaSk/U3RyaW5nKGkpOlwibnVsbFwiO2Nhc2VcImJvb2xlYW5cIjpjYXNlXCJudWxsXCI6cmV0dXJuIFN0cmluZyhpKTtjYXNlXCJvYmplY3RcIjppZighaSlyZXR1cm5cIm51bGxcIjtnYXArPWluZGVudCxoPVtdO2lmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkoaSk9PT1cIltvYmplY3QgQXJyYXldXCIpe2Y9aS5sZW5ndGg7Zm9yKGM9MDtjPGY7Yys9MSloW2NdPXN0cihjLGkpfHxcIm51bGxcIjtlPWgubGVuZ3RoPT09MD9cIltdXCI6Z2FwP1wiW1xcblwiK2dhcCtoLmpvaW4oXCIsXFxuXCIrZ2FwKStcIlxcblwiK2crXCJdXCI6XCJbXCIraC5qb2luKFwiLFwiKStcIl1cIixnYXA9ZztyZXR1cm4gZX1pZihyZXAmJnR5cGVvZiByZXA9PVwib2JqZWN0XCIpe2Y9cmVwLmxlbmd0aDtmb3IoYz0wO2M8ZjtjKz0xKXR5cGVvZiByZXBbY109PVwic3RyaW5nXCImJihkPXJlcFtjXSxlPXN0cihkLGkpLGUmJmgucHVzaChxdW90ZShkKSsoZ2FwP1wiOiBcIjpcIjpcIikrZSkpfWVsc2UgZm9yKGQgaW4gaSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaSxkKSYmKGU9c3RyKGQsaSksZSYmaC5wdXNoKHF1b3RlKGQpKyhnYXA/XCI6IFwiOlwiOlwiKStlKSk7ZT1oLmxlbmd0aD09PTA/XCJ7fVwiOmdhcD9cIntcXG5cIitnYXAraC5qb2luKFwiLFxcblwiK2dhcCkrXCJcXG5cIitnK1wifVwiOlwie1wiK2guam9pbihcIixcIikrXCJ9XCIsZ2FwPWc7cmV0dXJuIGV9fWZ1bmN0aW9uIHF1b3RlKGEpe2VzY2FwYWJsZS5sYXN0SW5kZXg9MDtyZXR1cm4gZXNjYXBhYmxlLnRlc3QoYSk/J1wiJythLnJlcGxhY2UoZXNjYXBhYmxlLGZ1bmN0aW9uKGEpe3ZhciBiPW1ldGFbYV07cmV0dXJuIHR5cGVvZiBiPT1cInN0cmluZ1wiP2I6XCJcXFxcdVwiKyhcIjAwMDBcIithLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCl9KSsnXCInOidcIicrYSsnXCInfWZ1bmN0aW9uIGYoYSl7cmV0dXJuIGE8MTA/XCIwXCIrYTphfVwidXNlIHN0cmljdFwiLHR5cGVvZiBEYXRlLnByb3RvdHlwZS50b0pTT04hPVwiZnVuY3Rpb25cIiYmKERhdGUucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbihhKXtyZXR1cm4gaXNGaW5pdGUodGhpcy52YWx1ZU9mKCkpP3RoaXMuZ2V0VVRDRnVsbFllYXIoKStcIi1cIitmKHRoaXMuZ2V0VVRDTW9udGgoKSsxKStcIi1cIitmKHRoaXMuZ2V0VVRDRGF0ZSgpKStcIlRcIitmKHRoaXMuZ2V0VVRDSG91cnMoKSkrXCI6XCIrZih0aGlzLmdldFVUQ01pbnV0ZXMoKSkrXCI6XCIrZih0aGlzLmdldFVUQ1NlY29uZHMoKSkrXCJaXCI6bnVsbH0sU3RyaW5nLnByb3RvdHlwZS50b0pTT049TnVtYmVyLnByb3RvdHlwZS50b0pTT049Qm9vbGVhbi5wcm90b3R5cGUudG9KU09OPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnZhbHVlT2YoKX0pO3ZhciBjeD0vW1xcdTAwMDBcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxlc2NhcGFibGU9L1tcXFxcXFxcIlxceDAwLVxceDFmXFx4N2YtXFx4OWZcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxnYXAsaW5kZW50LG1ldGE9e1wiXFxiXCI6XCJcXFxcYlwiLFwiXFx0XCI6XCJcXFxcdFwiLFwiXFxuXCI6XCJcXFxcblwiLFwiXFxmXCI6XCJcXFxcZlwiLFwiXFxyXCI6XCJcXFxcclwiLCdcIic6J1xcXFxcIicsXCJcXFxcXCI6XCJcXFxcXFxcXFwifSxyZXA7dHlwZW9mIEpTT04uc3RyaW5naWZ5IT1cImZ1bmN0aW9uXCImJihKU09OLnN0cmluZ2lmeT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ7Z2FwPVwiXCIsaW5kZW50PVwiXCI7aWYodHlwZW9mIGM9PVwibnVtYmVyXCIpZm9yKGQ9MDtkPGM7ZCs9MSlpbmRlbnQrPVwiIFwiO2Vsc2UgdHlwZW9mIGM9PVwic3RyaW5nXCImJihpbmRlbnQ9Yyk7cmVwPWI7aWYoIWJ8fHR5cGVvZiBiPT1cImZ1bmN0aW9uXCJ8fHR5cGVvZiBiPT1cIm9iamVjdFwiJiZ0eXBlb2YgYi5sZW5ndGg9PVwibnVtYmVyXCIpcmV0dXJuIHN0cihcIlwiLHtcIlwiOmF9KTt0aHJvdyBuZXcgRXJyb3IoXCJKU09OLnN0cmluZ2lmeVwiKX0pLHR5cGVvZiBKU09OLnBhcnNlIT1cImZ1bmN0aW9uXCImJihKU09OLnBhcnNlPWZ1bmN0aW9uKHRleHQscmV2aXZlcil7ZnVuY3Rpb24gd2FsayhhLGIpe3ZhciBjLGQsZT1hW2JdO2lmKGUmJnR5cGVvZiBlPT1cIm9iamVjdFwiKWZvcihjIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsYykmJihkPXdhbGsoZSxjKSxkIT09dW5kZWZpbmVkP2VbY109ZDpkZWxldGUgZVtjXSk7cmV0dXJuIHJldml2ZXIuY2FsbChhLGIsZSl9dmFyIGo7dGV4dD1TdHJpbmcodGV4dCksY3gubGFzdEluZGV4PTAsY3gudGVzdCh0ZXh0KSYmKHRleHQ9dGV4dC5yZXBsYWNlKGN4LGZ1bmN0aW9uKGEpe3JldHVyblwiXFxcXHVcIisoXCIwMDAwXCIrYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpfSkpO2lmKC9eW1xcXSw6e31cXHNdKiQvLnRlc3QodGV4dC5yZXBsYWNlKC9cXFxcKD86W1wiXFxcXFxcL2JmbnJ0XXx1WzAtOWEtZkEtRl17NH0pL2csXCJAXCIpLnJlcGxhY2UoL1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nLFwiXVwiKS5yZXBsYWNlKC8oPzpefDp8LCkoPzpcXHMqXFxbKSsvZyxcIlwiKSkpe2o9ZXZhbChcIihcIit0ZXh0K1wiKVwiKTtyZXR1cm4gdHlwZW9mIHJldml2ZXI9PVwiZnVuY3Rpb25cIj93YWxrKHtcIlwiOmp9LFwiXCIpOmp9dGhyb3cgbmV3IFN5bnRheEVycm9yKFwiSlNPTi5wYXJzZVwiKX0pfSgpXG5cblxuLy8gICAgIFsqXSBJbmNsdWRpbmcgbGliL2luZGV4LmpzXG4vLyBQdWJsaWMgb2JqZWN0XG5Tb2NrSlMgPSAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgdmFyIF9kb2N1bWVudCA9IGRvY3VtZW50O1xuICAgICAgICAgICAgICB2YXIgX3dpbmRvdyA9IHdpbmRvdztcbiAgICAgICAgICAgICAgdmFyIHV0aWxzID0ge307XG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi9yZXZlbnR0YXJnZXQuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8qIFNpbXBsaWZpZWQgaW1wbGVtZW50YXRpb24gb2YgRE9NMiBFdmVudFRhcmdldC5cbiAqICAgaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTItRXZlbnRzL2V2ZW50cy5odG1sI0V2ZW50cy1FdmVudFRhcmdldFxuICovXG52YXIgUkV2ZW50VGFyZ2V0ID0gZnVuY3Rpb24oKSB7fTtcblJFdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudFR5cGUsIGxpc3RlbmVyKSB7XG4gICAgaWYoIXRoaXMuX2xpc3RlbmVycykge1xuICAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG4gICAgfVxuICAgIGlmKCEoZXZlbnRUeXBlIGluIHRoaXMuX2xpc3RlbmVycykpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV0gPSBbXTtcbiAgICB9XG4gICAgdmFyIGFyciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuICAgIGlmKHV0aWxzLmFyckluZGV4T2YoYXJyLCBsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgIGFyci5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xufTtcblxuUkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcbiAgICBpZighKHRoaXMuX2xpc3RlbmVycyAmJiAoZXZlbnRUeXBlIGluIHRoaXMuX2xpc3RlbmVycykpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGFyciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuICAgIHZhciBpZHggPSB1dGlscy5hcnJJbmRleE9mKGFyciwgbGlzdGVuZXIpO1xuICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgIGlmKGFyci5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXSA9IGFyci5zbGljZSgwLCBpZHgpLmNvbmNhdCggYXJyLnNsaWNlKGlkeCsxKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuO1xufTtcblxuUkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHQgPSBldmVudC50eXBlO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICBpZiAodGhpc1snb24nK3RdKSB7XG4gICAgICAgIHRoaXNbJ29uJyt0XS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpc3RlbmVycyAmJiB0IGluIHRoaXMuX2xpc3RlbmVycykge1xuICAgICAgICBmb3IodmFyIGk9MDsgaSA8IHRoaXMuX2xpc3RlbmVyc1t0XS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3RdW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvcmV2ZW50dGFyZ2V0LmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi9zaW1wbGVldmVudC5qc1xuLypcbiAqICoqKioqIEJFR0lOIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyIFZNd2FyZSwgSW5jLlxuICpcbiAqIEZvciB0aGUgbGljZW5zZSBzZWUgQ09QWUlORy5cbiAqICoqKioqIEVORCBMSUNFTlNFIEJMT0NLICoqKioqXG4gKi9cblxudmFyIFNpbXBsZUV2ZW50ID0gZnVuY3Rpb24odHlwZSwgb2JqKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm9yKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaykpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdGhpc1trXSA9IG9ialtrXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNpbXBsZUV2ZW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByID0gW107XG4gICAgZm9yKHZhciBrIGluIHRoaXMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGspKSBjb250aW51ZTtcbiAgICAgICAgdmFyIHYgPSB0aGlzW2tdO1xuICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdmdW5jdGlvbicpIHYgPSAnW2Z1bmN0aW9uXSc7XG4gICAgICAgIHIucHVzaChrICsgJz0nICsgdik7XG4gICAgfVxuICAgIHJldHVybiAnU2ltcGxlRXZlbnQoJyArIHIuam9pbignLCAnKSArICcpJztcbn07XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL3NpbXBsZWV2ZW50LmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi9ldmVudGVtaXR0ZXIuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbnZhciBFdmVudEVtaXR0ZXIgPSBmdW5jdGlvbihldmVudHMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5fZXZlbnRzID0gZXZlbnRzIHx8IFtdO1xuICAgIHRoYXQuX2xpc3RlbmVycyA9IHt9O1xufTtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5fdmVyaWZ5VHlwZSh0eXBlKTtcbiAgICBpZiAodGhhdC5fbnVrZWQpIHJldHVybjtcblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAodGhhdFsnb24nK3R5cGVdKSB7XG4gICAgICAgIHRoYXRbJ29uJyt0eXBlXS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgaW4gdGhhdC5fbGlzdGVuZXJzKSB7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGF0Ll9saXN0ZW5lcnNbdHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoYXQuX2xpc3RlbmVyc1t0eXBlXVtpXS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB0aGF0Ll92ZXJpZnlUeXBlKHR5cGUpO1xuICAgIGlmICh0aGF0Ll9udWtlZCkgcmV0dXJuO1xuXG4gICAgaWYgKCEodHlwZSBpbiB0aGF0Ll9saXN0ZW5lcnMpKSB7XG4gICAgICAgIHRoYXQuX2xpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICB0aGF0Ll9saXN0ZW5lcnNbdHlwZV0ucHVzaChjYWxsYmFjayk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl92ZXJpZnlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAodXRpbHMuYXJySW5kZXhPZih0aGF0Ll9ldmVudHMsIHR5cGUpID09PSAtMSkge1xuICAgICAgICB1dGlscy5sb2coJ0V2ZW50ICcgKyBKU09OLnN0cmluZ2lmeSh0eXBlKSArXG4gICAgICAgICAgICAgICAgICAnIG5vdCBsaXN0ZWQgJyArIEpTT04uc3RyaW5naWZ5KHRoYXQuX2V2ZW50cykgK1xuICAgICAgICAgICAgICAgICAgJyBpbiAnICsgdGhhdCk7XG4gICAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5udWtlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoYXQuX251a2VkID0gdHJ1ZTtcbiAgICBmb3IodmFyIGk9MDsgaTx0aGF0Ll9ldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIHRoYXRbdGhhdC5fZXZlbnRzW2ldXTtcbiAgICB9XG4gICAgdGhhdC5fbGlzdGVuZXJzID0ge307XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi9ldmVudGVtaXR0ZXIuanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3V0aWxzLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgcmFuZG9tX3N0cmluZ19jaGFycyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlfJztcbnV0aWxzLnJhbmRvbV9zdHJpbmcgPSBmdW5jdGlvbihsZW5ndGgsIG1heCkge1xuICAgIG1heCA9IG1heCB8fCByYW5kb21fc3RyaW5nX2NoYXJzLmxlbmd0aDtcbiAgICB2YXIgaSwgcmV0ID0gW107XG4gICAgZm9yKGk9MDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJldC5wdXNoKCByYW5kb21fc3RyaW5nX2NoYXJzLnN1YnN0cihNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtYXgpLDEpICk7XG4gICAgfVxuICAgIHJldHVybiByZXQuam9pbignJyk7XG59O1xudXRpbHMucmFuZG9tX251bWJlciA9IGZ1bmN0aW9uKG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtYXgpO1xufTtcbnV0aWxzLnJhbmRvbV9udW1iZXJfc3RyaW5nID0gZnVuY3Rpb24obWF4KSB7XG4gICAgdmFyIHQgPSAoJycrKG1heCAtIDEpKS5sZW5ndGg7XG4gICAgdmFyIHAgPSBBcnJheSh0KzEpLmpvaW4oJzAnKTtcbiAgICByZXR1cm4gKHAgKyB1dGlscy5yYW5kb21fbnVtYmVyKG1heCkpLnNsaWNlKC10KTtcbn07XG5cbi8vIEFzc3VtaW5nIHRoYXQgdXJsIGxvb2tzIGxpa2U6IGh0dHA6Ly9hc2Rhc2Q6MTExL2FzZFxudXRpbHMuZ2V0T3JpZ2luID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdXJsICs9ICcvJztcbiAgICB2YXIgcGFydHMgPSB1cmwuc3BsaXQoJy8nKS5zbGljZSgwLCAzKTtcbiAgICByZXR1cm4gcGFydHMuam9pbignLycpO1xufTtcblxudXRpbHMuaXNTYW1lT3JpZ2luVXJsID0gZnVuY3Rpb24odXJsX2EsIHVybF9iKSB7XG4gICAgLy8gbG9jYXRpb24ub3JpZ2luIHdvdWxkIGRvLCBidXQgaXQncyBub3QgYWx3YXlzIGF2YWlsYWJsZS5cbiAgICBpZiAoIXVybF9iKSB1cmxfYiA9IF93aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgIHJldHVybiAodXJsX2Euc3BsaXQoJy8nKS5zbGljZSgwLDMpLmpvaW4oJy8nKVxuICAgICAgICAgICAgICAgID09PVxuICAgICAgICAgICAgdXJsX2Iuc3BsaXQoJy8nKS5zbGljZSgwLDMpLmpvaW4oJy8nKSk7XG59O1xuXG51dGlscy5nZXRQYXJlbnREb21haW4gPSBmdW5jdGlvbih1cmwpIHtcbiAgICAvLyBpcHY0IGlwIGFkZHJlc3NcbiAgICBpZiAoL15bMC05Ll0qJC8udGVzdCh1cmwpKSByZXR1cm4gdXJsO1xuICAgIC8vIGlwdjYgaXAgYWRkcmVzc1xuICAgIGlmICgvXlxcWy8udGVzdCh1cmwpKSByZXR1cm4gdXJsO1xuICAgIC8vIG5vIGRvdHNcbiAgICBpZiAoISgvWy5dLy50ZXN0KHVybCkpKSByZXR1cm4gdXJsO1xuXG4gICAgdmFyIHBhcnRzID0gdXJsLnNwbGl0KCcuJykuc2xpY2UoMSk7XG4gICAgcmV0dXJuIHBhcnRzLmpvaW4oJy4nKTtcbn07XG5cbnV0aWxzLm9iamVjdEV4dGVuZCA9IGZ1bmN0aW9uKGRzdCwgc3JjKSB7XG4gICAgZm9yKHZhciBrIGluIHNyYykge1xuICAgICAgICBpZiAoc3JjLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICBkc3Rba10gPSBzcmNba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRzdDtcbn07XG5cbnZhciBXUHJlZml4ID0gJ19qcCc7XG5cbnV0aWxzLnBvbGx1dGVHbG9iYWxOYW1lc3BhY2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIShXUHJlZml4IGluIF93aW5kb3cpKSB7XG4gICAgICAgIF93aW5kb3dbV1ByZWZpeF0gPSB7fTtcbiAgICB9XG59O1xuXG51dGlscy5jbG9zZUZyYW1lID0gZnVuY3Rpb24gKGNvZGUsIHJlYXNvbikge1xuICAgIHJldHVybiAnYycrSlNPTi5zdHJpbmdpZnkoW2NvZGUsIHJlYXNvbl0pO1xufTtcblxudXRpbHMudXNlclNldENvZGUgPSBmdW5jdGlvbiAoY29kZSkge1xuICAgIHJldHVybiBjb2RlID09PSAxMDAwIHx8IChjb2RlID49IDMwMDAgJiYgY29kZSA8PSA0OTk5KTtcbn07XG5cbi8vIFNlZTogaHR0cDovL3d3dy5lcmcuYWJkbi5hYy51ay9+Z2Vycml0L2RjY3Avbm90ZXMvY2NpZDIvcnRvX2VzdGltYXRvci9cbi8vIGFuZCBSRkMgMjk4OC5cbnV0aWxzLmNvdW50UlRPID0gZnVuY3Rpb24gKHJ0dCkge1xuICAgIHZhciBydG87XG4gICAgaWYgKHJ0dCA+IDEwMCkge1xuICAgICAgICBydG8gPSAzICogcnR0OyAvLyBydG8gPiAzMDBtc2VjXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcnRvID0gcnR0ICsgMjAwOyAvLyAyMDBtc2VjIDwgcnRvIDw9IDMwMG1zZWNcbiAgICB9XG4gICAgcmV0dXJuIHJ0bztcbn1cblxudXRpbHMubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKF93aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZyAmJiBjb25zb2xlLmxvZy5hcHBseSkge1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgIH1cbn07XG5cbnV0aWxzLmJpbmQgPSBmdW5jdGlvbihmdW4sIHRoYXQpIHtcbiAgICBpZiAoZnVuLmJpbmQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bi5iaW5kKHRoYXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG51dGlscy5mbGF0VXJsID0gZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuIHVybC5pbmRleE9mKCc/JykgPT09IC0xICYmIHVybC5pbmRleE9mKCcjJykgPT09IC0xO1xufTtcblxudXRpbHMuYW1lbmRVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgZGwgPSBfZG9jdW1lbnQubG9jYXRpb247XG4gICAgaWYgKCF1cmwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyB1cmwgZm9yIFNvY2tKUycpO1xuICAgIH1cbiAgICBpZiAoIXV0aWxzLmZsYXRVcmwodXJsKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09ubHkgYmFzaWMgdXJscyBhcmUgc3VwcG9ydGVkIGluIFNvY2tKUycpO1xuICAgIH1cblxuICAgIC8vICAnLy9hYmMnIC0tPiAnaHR0cDovL2FiYydcbiAgICBpZiAodXJsLmluZGV4T2YoJy8vJykgPT09IDApIHtcbiAgICAgICAgdXJsID0gZGwucHJvdG9jb2wgKyB1cmw7XG4gICAgfVxuICAgIC8vICcvYWJjJyAtLT4gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAvYWJjJ1xuICAgIGlmICh1cmwuaW5kZXhPZignLycpID09PSAwKSB7XG4gICAgICAgIHVybCA9IGRsLnByb3RvY29sICsgJy8vJyArIGRsLmhvc3QgKyB1cmw7XG4gICAgfVxuICAgIC8vIHN0cmlwIHRyYWlsaW5nIHNsYXNoZXNcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgvWy9dKyQvLCcnKTtcbiAgICByZXR1cm4gdXJsO1xufTtcblxuLy8gSUUgZG9lc24ndCBzdXBwb3J0IFtdLmluZGV4T2YuXG51dGlscy5hcnJJbmRleE9mID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICAgIGZvcih2YXIgaT0wOyBpIDwgYXJyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYoYXJyW2ldID09PSBvYmope1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufTtcblxudXRpbHMuYXJyU2tpcCA9IGZ1bmN0aW9uKGFyciwgb2JqKSB7XG4gICAgdmFyIGlkeCA9IHV0aWxzLmFyckluZGV4T2YoYXJyLCBvYmopO1xuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBhcnIuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZHN0ID0gYXJyLnNsaWNlKDAsIGlkeCk7XG4gICAgICAgIHJldHVybiBkc3QuY29uY2F0KGFyci5zbGljZShpZHgrMSkpO1xuICAgIH1cbn07XG5cbi8vIFZpYTogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vMTEzMzEyMi8yMTIxYzYwMWM1NTQ5MTU1NDgzZjUwYmUzZGE1MzA1ZTgzYjhjNWRmXG51dGlscy5pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB7fS50b1N0cmluZy5jYWxsKHZhbHVlKS5pbmRleE9mKCdBcnJheScpID49IDBcbn07XG5cbnV0aWxzLmRlbGF5ID0gZnVuY3Rpb24odCwgZnVuKSB7XG4gICAgaWYodHlwZW9mIHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZnVuID0gdDtcbiAgICAgICAgdCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgdCk7XG59O1xuXG5cbi8vIENoYXJzIHdvcnRoIGVzY2FwaW5nLCBhcyBkZWZpbmVkIGJ5IERvdWdsYXMgQ3JvY2tmb3JkOlxuLy8gICBodHRwczovL2dpdGh1Yi5jb20vZG91Z2xhc2Nyb2NrZm9yZC9KU09OLWpzL2Jsb2IvNDdhOTg4MmNkZGViMWU4NTI5ZTA3YWY5NzM2MjE4MDc1MzcyYjhhYy9qc29uMi5qcyNMMTk2XG52YXIganNvbl9lc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHg5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgIGpzb25fbG9va3VwID0ge1xuXCJcXHUwMDAwXCI6XCJcXFxcdTAwMDBcIixcIlxcdTAwMDFcIjpcIlxcXFx1MDAwMVwiLFwiXFx1MDAwMlwiOlwiXFxcXHUwMDAyXCIsXCJcXHUwMDAzXCI6XCJcXFxcdTAwMDNcIixcblwiXFx1MDAwNFwiOlwiXFxcXHUwMDA0XCIsXCJcXHUwMDA1XCI6XCJcXFxcdTAwMDVcIixcIlxcdTAwMDZcIjpcIlxcXFx1MDAwNlwiLFwiXFx1MDAwN1wiOlwiXFxcXHUwMDA3XCIsXG5cIlxcYlwiOlwiXFxcXGJcIixcIlxcdFwiOlwiXFxcXHRcIixcIlxcblwiOlwiXFxcXG5cIixcIlxcdTAwMGJcIjpcIlxcXFx1MDAwYlwiLFwiXFxmXCI6XCJcXFxcZlwiLFwiXFxyXCI6XCJcXFxcclwiLFxuXCJcXHUwMDBlXCI6XCJcXFxcdTAwMGVcIixcIlxcdTAwMGZcIjpcIlxcXFx1MDAwZlwiLFwiXFx1MDAxMFwiOlwiXFxcXHUwMDEwXCIsXCJcXHUwMDExXCI6XCJcXFxcdTAwMTFcIixcblwiXFx1MDAxMlwiOlwiXFxcXHUwMDEyXCIsXCJcXHUwMDEzXCI6XCJcXFxcdTAwMTNcIixcIlxcdTAwMTRcIjpcIlxcXFx1MDAxNFwiLFwiXFx1MDAxNVwiOlwiXFxcXHUwMDE1XCIsXG5cIlxcdTAwMTZcIjpcIlxcXFx1MDAxNlwiLFwiXFx1MDAxN1wiOlwiXFxcXHUwMDE3XCIsXCJcXHUwMDE4XCI6XCJcXFxcdTAwMThcIixcIlxcdTAwMTlcIjpcIlxcXFx1MDAxOVwiLFxuXCJcXHUwMDFhXCI6XCJcXFxcdTAwMWFcIixcIlxcdTAwMWJcIjpcIlxcXFx1MDAxYlwiLFwiXFx1MDAxY1wiOlwiXFxcXHUwMDFjXCIsXCJcXHUwMDFkXCI6XCJcXFxcdTAwMWRcIixcblwiXFx1MDAxZVwiOlwiXFxcXHUwMDFlXCIsXCJcXHUwMDFmXCI6XCJcXFxcdTAwMWZcIixcIlxcXCJcIjpcIlxcXFxcXFwiXCIsXCJcXFxcXCI6XCJcXFxcXFxcXFwiLFxuXCJcXHUwMDdmXCI6XCJcXFxcdTAwN2ZcIixcIlxcdTAwODBcIjpcIlxcXFx1MDA4MFwiLFwiXFx1MDA4MVwiOlwiXFxcXHUwMDgxXCIsXCJcXHUwMDgyXCI6XCJcXFxcdTAwODJcIixcblwiXFx1MDA4M1wiOlwiXFxcXHUwMDgzXCIsXCJcXHUwMDg0XCI6XCJcXFxcdTAwODRcIixcIlxcdTAwODVcIjpcIlxcXFx1MDA4NVwiLFwiXFx1MDA4NlwiOlwiXFxcXHUwMDg2XCIsXG5cIlxcdTAwODdcIjpcIlxcXFx1MDA4N1wiLFwiXFx1MDA4OFwiOlwiXFxcXHUwMDg4XCIsXCJcXHUwMDg5XCI6XCJcXFxcdTAwODlcIixcIlxcdTAwOGFcIjpcIlxcXFx1MDA4YVwiLFxuXCJcXHUwMDhiXCI6XCJcXFxcdTAwOGJcIixcIlxcdTAwOGNcIjpcIlxcXFx1MDA4Y1wiLFwiXFx1MDA4ZFwiOlwiXFxcXHUwMDhkXCIsXCJcXHUwMDhlXCI6XCJcXFxcdTAwOGVcIixcblwiXFx1MDA4ZlwiOlwiXFxcXHUwMDhmXCIsXCJcXHUwMDkwXCI6XCJcXFxcdTAwOTBcIixcIlxcdTAwOTFcIjpcIlxcXFx1MDA5MVwiLFwiXFx1MDA5MlwiOlwiXFxcXHUwMDkyXCIsXG5cIlxcdTAwOTNcIjpcIlxcXFx1MDA5M1wiLFwiXFx1MDA5NFwiOlwiXFxcXHUwMDk0XCIsXCJcXHUwMDk1XCI6XCJcXFxcdTAwOTVcIixcIlxcdTAwOTZcIjpcIlxcXFx1MDA5NlwiLFxuXCJcXHUwMDk3XCI6XCJcXFxcdTAwOTdcIixcIlxcdTAwOThcIjpcIlxcXFx1MDA5OFwiLFwiXFx1MDA5OVwiOlwiXFxcXHUwMDk5XCIsXCJcXHUwMDlhXCI6XCJcXFxcdTAwOWFcIixcblwiXFx1MDA5YlwiOlwiXFxcXHUwMDliXCIsXCJcXHUwMDljXCI6XCJcXFxcdTAwOWNcIixcIlxcdTAwOWRcIjpcIlxcXFx1MDA5ZFwiLFwiXFx1MDA5ZVwiOlwiXFxcXHUwMDllXCIsXG5cIlxcdTAwOWZcIjpcIlxcXFx1MDA5ZlwiLFwiXFx1MDBhZFwiOlwiXFxcXHUwMGFkXCIsXCJcXHUwNjAwXCI6XCJcXFxcdTA2MDBcIixcIlxcdTA2MDFcIjpcIlxcXFx1MDYwMVwiLFxuXCJcXHUwNjAyXCI6XCJcXFxcdTA2MDJcIixcIlxcdTA2MDNcIjpcIlxcXFx1MDYwM1wiLFwiXFx1MDYwNFwiOlwiXFxcXHUwNjA0XCIsXCJcXHUwNzBmXCI6XCJcXFxcdTA3MGZcIixcblwiXFx1MTdiNFwiOlwiXFxcXHUxN2I0XCIsXCJcXHUxN2I1XCI6XCJcXFxcdTE3YjVcIixcIlxcdTIwMGNcIjpcIlxcXFx1MjAwY1wiLFwiXFx1MjAwZFwiOlwiXFxcXHUyMDBkXCIsXG5cIlxcdTIwMGVcIjpcIlxcXFx1MjAwZVwiLFwiXFx1MjAwZlwiOlwiXFxcXHUyMDBmXCIsXCJcXHUyMDI4XCI6XCJcXFxcdTIwMjhcIixcIlxcdTIwMjlcIjpcIlxcXFx1MjAyOVwiLFxuXCJcXHUyMDJhXCI6XCJcXFxcdTIwMmFcIixcIlxcdTIwMmJcIjpcIlxcXFx1MjAyYlwiLFwiXFx1MjAyY1wiOlwiXFxcXHUyMDJjXCIsXCJcXHUyMDJkXCI6XCJcXFxcdTIwMmRcIixcblwiXFx1MjAyZVwiOlwiXFxcXHUyMDJlXCIsXCJcXHUyMDJmXCI6XCJcXFxcdTIwMmZcIixcIlxcdTIwNjBcIjpcIlxcXFx1MjA2MFwiLFwiXFx1MjA2MVwiOlwiXFxcXHUyMDYxXCIsXG5cIlxcdTIwNjJcIjpcIlxcXFx1MjA2MlwiLFwiXFx1MjA2M1wiOlwiXFxcXHUyMDYzXCIsXCJcXHUyMDY0XCI6XCJcXFxcdTIwNjRcIixcIlxcdTIwNjVcIjpcIlxcXFx1MjA2NVwiLFxuXCJcXHUyMDY2XCI6XCJcXFxcdTIwNjZcIixcIlxcdTIwNjdcIjpcIlxcXFx1MjA2N1wiLFwiXFx1MjA2OFwiOlwiXFxcXHUyMDY4XCIsXCJcXHUyMDY5XCI6XCJcXFxcdTIwNjlcIixcblwiXFx1MjA2YVwiOlwiXFxcXHUyMDZhXCIsXCJcXHUyMDZiXCI6XCJcXFxcdTIwNmJcIixcIlxcdTIwNmNcIjpcIlxcXFx1MjA2Y1wiLFwiXFx1MjA2ZFwiOlwiXFxcXHUyMDZkXCIsXG5cIlxcdTIwNmVcIjpcIlxcXFx1MjA2ZVwiLFwiXFx1MjA2ZlwiOlwiXFxcXHUyMDZmXCIsXCJcXHVmZWZmXCI6XCJcXFxcdWZlZmZcIixcIlxcdWZmZjBcIjpcIlxcXFx1ZmZmMFwiLFxuXCJcXHVmZmYxXCI6XCJcXFxcdWZmZjFcIixcIlxcdWZmZjJcIjpcIlxcXFx1ZmZmMlwiLFwiXFx1ZmZmM1wiOlwiXFxcXHVmZmYzXCIsXCJcXHVmZmY0XCI6XCJcXFxcdWZmZjRcIixcblwiXFx1ZmZmNVwiOlwiXFxcXHVmZmY1XCIsXCJcXHVmZmY2XCI6XCJcXFxcdWZmZjZcIixcIlxcdWZmZjdcIjpcIlxcXFx1ZmZmN1wiLFwiXFx1ZmZmOFwiOlwiXFxcXHVmZmY4XCIsXG5cIlxcdWZmZjlcIjpcIlxcXFx1ZmZmOVwiLFwiXFx1ZmZmYVwiOlwiXFxcXHVmZmZhXCIsXCJcXHVmZmZiXCI6XCJcXFxcdWZmZmJcIixcIlxcdWZmZmNcIjpcIlxcXFx1ZmZmY1wiLFxuXCJcXHVmZmZkXCI6XCJcXFxcdWZmZmRcIixcIlxcdWZmZmVcIjpcIlxcXFx1ZmZmZVwiLFwiXFx1ZmZmZlwiOlwiXFxcXHVmZmZmXCJ9O1xuXG4vLyBTb21lIGV4dHJhIGNoYXJhY3RlcnMgdGhhdCBDaHJvbWUgZ2V0cyB3cm9uZywgYW5kIHN1YnN0aXR1dGVzIHdpdGhcbi8vIHNvbWV0aGluZyBlbHNlIG9uIHRoZSB3aXJlLlxudmFyIGV4dHJhX2VzY2FwYWJsZSA9IC9bXFx4MDAtXFx4MWZcXHVkODAwLVxcdWRmZmZcXHVmZmZlXFx1ZmZmZlxcdTAzMDAtXFx1MDMzM1xcdTAzM2QtXFx1MDM0NlxcdTAzNGEtXFx1MDM0Y1xcdTAzNTAtXFx1MDM1MlxcdTAzNTctXFx1MDM1OFxcdTAzNWMtXFx1MDM2MlxcdTAzNzRcXHUwMzdlXFx1MDM4N1xcdTA1OTEtXFx1MDVhZlxcdTA1YzRcXHUwNjEwLVxcdTA2MTdcXHUwNjUzLVxcdTA2NTRcXHUwNjU3LVxcdTA2NWJcXHUwNjVkLVxcdTA2NWVcXHUwNmRmLVxcdTA2ZTJcXHUwNmViLVxcdTA2ZWNcXHUwNzMwXFx1MDczMi1cXHUwNzMzXFx1MDczNS1cXHUwNzM2XFx1MDczYVxcdTA3M2RcXHUwNzNmLVxcdTA3NDFcXHUwNzQzXFx1MDc0NVxcdTA3NDdcXHUwN2ViLVxcdTA3ZjFcXHUwOTUxXFx1MDk1OC1cXHUwOTVmXFx1MDlkYy1cXHUwOWRkXFx1MDlkZlxcdTBhMzNcXHUwYTM2XFx1MGE1OS1cXHUwYTViXFx1MGE1ZVxcdTBiNWMtXFx1MGI1ZFxcdTBlMzgtXFx1MGUzOVxcdTBmNDNcXHUwZjRkXFx1MGY1MlxcdTBmNTdcXHUwZjVjXFx1MGY2OVxcdTBmNzItXFx1MGY3NlxcdTBmNzhcXHUwZjgwLVxcdTBmODNcXHUwZjkzXFx1MGY5ZFxcdTBmYTJcXHUwZmE3XFx1MGZhY1xcdTBmYjlcXHUxOTM5LVxcdTE5M2FcXHUxYTE3XFx1MWI2YlxcdTFjZGEtXFx1MWNkYlxcdTFkYzAtXFx1MWRjZlxcdTFkZmNcXHUxZGZlXFx1MWY3MVxcdTFmNzNcXHUxZjc1XFx1MWY3N1xcdTFmNzlcXHUxZjdiXFx1MWY3ZFxcdTFmYmJcXHUxZmJlXFx1MWZjOVxcdTFmY2JcXHUxZmQzXFx1MWZkYlxcdTFmZTNcXHUxZmViXFx1MWZlZS1cXHUxZmVmXFx1MWZmOVxcdTFmZmJcXHUxZmZkXFx1MjAwMC1cXHUyMDAxXFx1MjBkMC1cXHUyMGQxXFx1MjBkNC1cXHUyMGQ3XFx1MjBlNy1cXHUyMGU5XFx1MjEyNlxcdTIxMmEtXFx1MjEyYlxcdTIzMjktXFx1MjMyYVxcdTJhZGNcXHUzMDJiLVxcdTMwMmNcXHVhYWIyLVxcdWFhYjNcXHVmOTAwLVxcdWZhMGRcXHVmYTEwXFx1ZmExMlxcdWZhMTUtXFx1ZmExZVxcdWZhMjBcXHVmYTIyXFx1ZmEyNS1cXHVmYTI2XFx1ZmEyYS1cXHVmYTJkXFx1ZmEzMC1cXHVmYTZkXFx1ZmE3MC1cXHVmYWQ5XFx1ZmIxZFxcdWZiMWZcXHVmYjJhLVxcdWZiMzZcXHVmYjM4LVxcdWZiM2NcXHVmYjNlXFx1ZmI0MC1cXHVmYjQxXFx1ZmI0My1cXHVmYjQ0XFx1ZmI0Ni1cXHVmYjRlXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgIGV4dHJhX2xvb2t1cDtcblxuLy8gSlNPTiBRdW90ZSBzdHJpbmcuIFVzZSBuYXRpdmUgaW1wbGVtZW50YXRpb24gd2hlbiBwb3NzaWJsZS5cbnZhciBKU09OUXVvdGUgPSAoSlNPTiAmJiBKU09OLnN0cmluZ2lmeSkgfHwgZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAganNvbl9lc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICBpZiAoanNvbl9lc2NhcGFibGUudGVzdChzdHJpbmcpKSB7XG4gICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKGpzb25fZXNjYXBhYmxlLCBmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4ganNvbl9sb29rdXBbYV07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gJ1wiJyArIHN0cmluZyArICdcIic7XG59O1xuXG4vLyBUaGlzIG1heSBiZSBxdWl0ZSBzbG93LCBzbyBsZXQncyBkZWxheSB1bnRpbCB1c2VyIGFjdHVhbGx5IHVzZXMgYmFkXG4vLyBjaGFyYWN0ZXJzLlxudmFyIHVucm9sbF9sb29rdXAgPSBmdW5jdGlvbihlc2NhcGFibGUpIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgdW5yb2xsZWQgPSB7fVxuICAgIHZhciBjID0gW11cbiAgICBmb3IoaT0wOyBpPDY1NTM2OyBpKyspIHtcbiAgICAgICAgYy5wdXNoKCBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpICk7XG4gICAgfVxuICAgIGVzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgIGMuam9pbignJykucmVwbGFjZShlc2NhcGFibGUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIHVucm9sbGVkWyBhIF0gPSAnXFxcXHUnICsgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0pO1xuICAgIGVzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgIHJldHVybiB1bnJvbGxlZDtcbn07XG5cbi8vIFF1b3RlIHN0cmluZywgYWxzbyB0YWtpbmcgY2FyZSBvZiB1bmljb2RlIGNoYXJhY3RlcnMgdGhhdCBicm93c2Vyc1xuLy8gb2Z0ZW4gYnJlYWsuIEVzcGVjaWFsbHksIHRha2UgY2FyZSBvZiB1bmljb2RlIHN1cnJvZ2F0ZXM6XG4vLyAgICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hcHBpbmdfb2ZfVW5pY29kZV9jaGFyYWN0ZXJzI1N1cnJvZ2F0ZXNcbnV0aWxzLnF1b3RlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIHF1b3RlZCA9IEpTT05RdW90ZShzdHJpbmcpO1xuXG4gICAgLy8gSW4gbW9zdCBjYXNlcyB0aGlzIHNob3VsZCBiZSB2ZXJ5IGZhc3QgYW5kIGdvb2QgZW5vdWdoLlxuICAgIGV4dHJhX2VzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgIGlmKCFleHRyYV9lc2NhcGFibGUudGVzdChxdW90ZWQpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWQ7XG4gICAgfVxuXG4gICAgaWYoIWV4dHJhX2xvb2t1cCkgZXh0cmFfbG9va3VwID0gdW5yb2xsX2xvb2t1cChleHRyYV9lc2NhcGFibGUpO1xuXG4gICAgcmV0dXJuIHF1b3RlZC5yZXBsYWNlKGV4dHJhX2VzY2FwYWJsZSwgZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gZXh0cmFfbG9va3VwW2FdO1xuICAgIH0pO1xufVxuXG52YXIgX2FsbF9wcm90b2NvbHMgPSBbJ3dlYnNvY2tldCcsXG4gICAgICAgICAgICAgICAgICAgICAgJ3hkci1zdHJlYW1pbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICd4aHItc3RyZWFtaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAnaWZyYW1lLWV2ZW50c291cmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAnaWZyYW1lLWh0bWxmaWxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAneGRyLXBvbGxpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICd4aHItcG9sbGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgJ2lmcmFtZS14aHItcG9sbGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgJ2pzb25wLXBvbGxpbmcnXTtcblxudXRpbHMucHJvYmVQcm90b2NvbHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcHJvYmVkID0ge307XG4gICAgZm9yKHZhciBpPTA7IGk8X2FsbF9wcm90b2NvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHByb3RvY29sID0gX2FsbF9wcm90b2NvbHNbaV07XG4gICAgICAgIC8vIFVzZXIgY2FuIGhhdmUgYSB0eXBvIGluIHByb3RvY29sIG5hbWUuXG4gICAgICAgIHByb2JlZFtwcm90b2NvbF0gPSBTb2NrSlNbcHJvdG9jb2xdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBTb2NrSlNbcHJvdG9jb2xdLmVuYWJsZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2JlZDtcbn07XG5cbnV0aWxzLmRldGVjdFByb3RvY29scyA9IGZ1bmN0aW9uKHByb2JlZCwgcHJvdG9jb2xzX3doaXRlbGlzdCwgaW5mbykge1xuICAgIHZhciBwZSA9IHt9LFxuICAgICAgICBwcm90b2NvbHMgPSBbXTtcbiAgICBpZiAoIXByb3RvY29sc193aGl0ZWxpc3QpIHByb3RvY29sc193aGl0ZWxpc3QgPSBfYWxsX3Byb3RvY29scztcbiAgICBmb3IodmFyIGk9MDsgaTxwcm90b2NvbHNfd2hpdGVsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IHByb3RvY29sc193aGl0ZWxpc3RbaV07XG4gICAgICAgIHBlW3Byb3RvY29sXSA9IHByb2JlZFtwcm90b2NvbF07XG4gICAgfVxuICAgIHZhciBtYXliZV9wdXNoID0gZnVuY3Rpb24ocHJvdG9zKSB7XG4gICAgICAgIHZhciBwcm90byA9IHByb3Rvcy5zaGlmdCgpO1xuICAgICAgICBpZiAocGVbcHJvdG9dKSB7XG4gICAgICAgICAgICBwcm90b2NvbHMucHVzaChwcm90byk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvdG9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBtYXliZV9wdXNoKHByb3Rvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAxLiBXZWJzb2NrZXRcbiAgICBpZiAoaW5mby53ZWJzb2NrZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIG1heWJlX3B1c2goWyd3ZWJzb2NrZXQnXSk7XG4gICAgfVxuXG4gICAgLy8gMi4gU3RyZWFtaW5nXG4gICAgaWYgKHBlWyd4aHItc3RyZWFtaW5nJ10gJiYgIWluZm8ubnVsbF9vcmlnaW4pIHtcbiAgICAgICAgcHJvdG9jb2xzLnB1c2goJ3hoci1zdHJlYW1pbmcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocGVbJ3hkci1zdHJlYW1pbmcnXSAmJiAhaW5mby5jb29raWVfbmVlZGVkICYmICFpbmZvLm51bGxfb3JpZ2luKSB7XG4gICAgICAgICAgICBwcm90b2NvbHMucHVzaCgneGRyLXN0cmVhbWluZycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF5YmVfcHVzaChbJ2lmcmFtZS1ldmVudHNvdXJjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaWZyYW1lLWh0bWxmaWxlJ10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gMy4gUG9sbGluZ1xuICAgIGlmIChwZVsneGhyLXBvbGxpbmcnXSAmJiAhaW5mby5udWxsX29yaWdpbikge1xuICAgICAgICBwcm90b2NvbHMucHVzaCgneGhyLXBvbGxpbmcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocGVbJ3hkci1wb2xsaW5nJ10gJiYgIWluZm8uY29va2llX25lZWRlZCAmJiAhaW5mby5udWxsX29yaWdpbikge1xuICAgICAgICAgICAgcHJvdG9jb2xzLnB1c2goJ3hkci1wb2xsaW5nJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXliZV9wdXNoKFsnaWZyYW1lLXhoci1wb2xsaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdqc29ucC1wb2xsaW5nJ10pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm90b2NvbHM7XG59XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL3V0aWxzLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi9kb20uanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8vIE1heSBiZSB1c2VkIGJ5IGh0bWxmaWxlIGpzb25wIGFuZCB0cmFuc3BvcnRzLlxudmFyIE1QcmVmaXggPSAnX3NvY2tqc19nbG9iYWwnO1xudXRpbHMuY3JlYXRlSG9vayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3aW5kb3dfaWQgPSAnYScgKyB1dGlscy5yYW5kb21fc3RyaW5nKDgpO1xuICAgIGlmICghKE1QcmVmaXggaW4gX3dpbmRvdykpIHtcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICBfd2luZG93W01QcmVmaXhdID0gZnVuY3Rpb24od2luZG93X2lkKSB7XG4gICAgICAgICAgICBpZiAoISh3aW5kb3dfaWQgaW4gbWFwKSkge1xuICAgICAgICAgICAgICAgIG1hcFt3aW5kb3dfaWRdID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogd2luZG93X2lkLFxuICAgICAgICAgICAgICAgICAgICBkZWw6IGZ1bmN0aW9uKCkge2RlbGV0ZSBtYXBbd2luZG93X2lkXTt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYXBbd2luZG93X2lkXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3dpbmRvd1tNUHJlZml4XSh3aW5kb3dfaWQpO1xufTtcblxuXG5cbnV0aWxzLmF0dGFjaE1lc3NhZ2UgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgIHV0aWxzLmF0dGFjaEV2ZW50KCdtZXNzYWdlJywgbGlzdGVuZXIpO1xufTtcbnV0aWxzLmF0dGFjaEV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBfd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIF93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJRSBxdWlya3MuXG4gICAgICAgIC8vIEFjY29yZGluZyB0bzogaHR0cDovL3N0ZXZlc291ZGVycy5jb20vbWlzYy90ZXN0LXBvc3RtZXNzYWdlLnBocFxuICAgICAgICAvLyB0aGUgbWVzc2FnZSBnZXRzIGRlbGl2ZXJlZCBvbmx5IHRvICdkb2N1bWVudCcsIG5vdCAnd2luZG93Jy5cbiAgICAgICAgX2RvY3VtZW50LmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgIC8vIEkgZ2V0ICd3aW5kb3cnIGZvciBpZTguXG4gICAgICAgIF93aW5kb3cuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnQsIGxpc3RlbmVyKTtcbiAgICB9XG59O1xuXG51dGlscy5kZXRhY2hNZXNzYWdlID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICB1dGlscy5kZXRhY2hFdmVudCgnbWVzc2FnZScsIGxpc3RlbmVyKTtcbn07XG51dGlscy5kZXRhY2hFdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgX3dpbmRvdy5hZGRFdmVudExpc3RlbmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBfd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2RvY3VtZW50LmRldGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgIF93aW5kb3cuZGV0YWNoRXZlbnQoXCJvblwiICsgZXZlbnQsIGxpc3RlbmVyKTtcbiAgICB9XG59O1xuXG5cbnZhciBvbl91bmxvYWQgPSB7fTtcbi8vIFRoaW5ncyByZWdpc3RlcmVkIGFmdGVyIGJlZm9yZXVubG9hZCBhcmUgdG8gYmUgY2FsbGVkIGltbWVkaWF0ZWx5LlxudmFyIGFmdGVyX3VubG9hZCA9IGZhbHNlO1xuXG52YXIgdHJpZ2dlcl91bmxvYWRfY2FsbGJhY2tzID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yKHZhciByZWYgaW4gb25fdW5sb2FkKSB7XG4gICAgICAgIG9uX3VubG9hZFtyZWZdKCk7XG4gICAgICAgIGRlbGV0ZSBvbl91bmxvYWRbcmVmXTtcbiAgICB9O1xufTtcblxudmFyIHVubG9hZF90cmlnZ2VyZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZihhZnRlcl91bmxvYWQpIHJldHVybjtcbiAgICBhZnRlcl91bmxvYWQgPSB0cnVlO1xuICAgIHRyaWdnZXJfdW5sb2FkX2NhbGxiYWNrcygpO1xufTtcblxuLy8gJ3VubG9hZCcgYWxvbmUgaXMgbm90IHJlbGlhYmxlIGluIG9wZXJhIHdpdGhpbiBhbiBpZnJhbWUsIGJ1dCB3ZVxuLy8gY2FuJ3QgdXNlIGBiZWZvcmV1bmxvYWRgIGFzIElFIGZpcmVzIGl0IG9uIGphdmFzY3JpcHQ6IGxpbmtzLlxudXRpbHMuYXR0YWNoRXZlbnQoJ3VubG9hZCcsIHVubG9hZF90cmlnZ2VyZWQpO1xuXG51dGlscy51bmxvYWRfYWRkID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICB2YXIgcmVmID0gdXRpbHMucmFuZG9tX3N0cmluZyg4KTtcbiAgICBvbl91bmxvYWRbcmVmXSA9IGxpc3RlbmVyO1xuICAgIGlmIChhZnRlcl91bmxvYWQpIHtcbiAgICAgICAgdXRpbHMuZGVsYXkodHJpZ2dlcl91bmxvYWRfY2FsbGJhY2tzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlZjtcbn07XG51dGlscy51bmxvYWRfZGVsID0gZnVuY3Rpb24ocmVmKSB7XG4gICAgaWYgKHJlZiBpbiBvbl91bmxvYWQpXG4gICAgICAgIGRlbGV0ZSBvbl91bmxvYWRbcmVmXTtcbn07XG5cblxudXRpbHMuY3JlYXRlSWZyYW1lID0gZnVuY3Rpb24gKGlmcmFtZV91cmwsIGVycm9yX2NhbGxiYWNrKSB7XG4gICAgdmFyIGlmcmFtZSA9IF9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICB2YXIgdHJlZiwgdW5sb2FkX3JlZjtcbiAgICB2YXIgdW5hdHRhY2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRyZWYpO1xuICAgICAgICAvLyBFeHBsb3JlciBoYWQgcHJvYmxlbXMgd2l0aCB0aGF0LlxuICAgICAgICB0cnkge2lmcmFtZS5vbmxvYWQgPSBudWxsO30gY2F0Y2ggKHgpIHt9XG4gICAgICAgIGlmcmFtZS5vbmVycm9yID0gbnVsbDtcbiAgICB9O1xuICAgIHZhciBjbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChpZnJhbWUpIHtcbiAgICAgICAgICAgIHVuYXR0YWNoKCk7XG4gICAgICAgICAgICAvLyBUaGlzIHRpbWVvdXQgbWFrZXMgY2hyb21lIGZpcmUgb25iZWZvcmV1bmxvYWQgZXZlbnRcbiAgICAgICAgICAgIC8vIHdpdGhpbiBpZnJhbWUuIFdpdGhvdXQgdGhlIHRpbWVvdXQgaXQgZ29lcyBzdHJhaWdodCB0b1xuICAgICAgICAgICAgLy8gb251bmxvYWQuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmKGlmcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZnJhbWUgPSBudWxsO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB1dGlscy51bmxvYWRfZGVsKHVubG9hZF9yZWYpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgb25lcnJvciA9IGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgaWYgKGlmcmFtZSkge1xuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgZXJyb3JfY2FsbGJhY2socik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciBwb3N0ID0gZnVuY3Rpb24obXNnLCBvcmlnaW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gdGhlIGlmcmFtZSBpcyBub3QgbG9hZGVkLCBJRSByYWlzZXMgYW4gZXhjZXB0aW9uXG4gICAgICAgICAgICAvLyBvbiAnY29udGVudFdpbmRvdycuXG4gICAgICAgICAgICBpZiAoaWZyYW1lICYmIGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgICAgaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UobXNnLCBvcmlnaW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh4KSB7fTtcbiAgICB9O1xuXG4gICAgaWZyYW1lLnNyYyA9IGlmcmFtZV91cmw7XG4gICAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWZyYW1lLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBpZnJhbWUub25lcnJvciA9IGZ1bmN0aW9uKCl7b25lcnJvcignb25lcnJvcicpO307XG4gICAgaWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBgb25sb2FkYCBpcyB0cmlnZ2VyZWQgYmVmb3JlIHNjcmlwdHMgb24gdGhlIGlmcmFtZSBhcmVcbiAgICAgICAgLy8gZXhlY3V0ZWQuIEdpdmUgaXQgZmV3IHNlY29uZHMgdG8gYWN0dWFsbHkgbG9hZCBzdHVmZi5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRyZWYpO1xuICAgICAgICB0cmVmID0gc2V0VGltZW91dChmdW5jdGlvbigpe29uZXJyb3IoJ29ubG9hZCB0aW1lb3V0Jyk7fSwgMjAwMCk7XG4gICAgfTtcbiAgICBfZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgIHRyZWYgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7b25lcnJvcigndGltZW91dCcpO30sIDE1MDAwKTtcbiAgICB1bmxvYWRfcmVmID0gdXRpbHMudW5sb2FkX2FkZChjbGVhbnVwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwb3N0OiBwb3N0LFxuICAgICAgICBjbGVhbnVwOiBjbGVhbnVwLFxuICAgICAgICBsb2FkZWQ6IHVuYXR0YWNoXG4gICAgfTtcbn07XG5cbnV0aWxzLmNyZWF0ZUh0bWxmaWxlID0gZnVuY3Rpb24gKGlmcmFtZV91cmwsIGVycm9yX2NhbGxiYWNrKSB7XG4gICAgdmFyIGRvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdodG1sZmlsZScpO1xuICAgIHZhciB0cmVmLCB1bmxvYWRfcmVmO1xuICAgIHZhciBpZnJhbWU7XG4gICAgdmFyIHVuYXR0YWNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0cmVmKTtcbiAgICB9O1xuICAgIHZhciBjbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIHVuYXR0YWNoKCk7XG4gICAgICAgICAgICB1dGlscy51bmxvYWRfZGVsKHVubG9hZF9yZWYpO1xuICAgICAgICAgICAgaWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgICAgICAgICAgIGlmcmFtZSA9IGRvYyA9IG51bGw7XG4gICAgICAgICAgICBDb2xsZWN0R2FyYmFnZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgb25lcnJvciA9IGZ1bmN0aW9uKHIpICB7XG4gICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgIGVycm9yX2NhbGxiYWNrKHIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgcG9zdCA9IGZ1bmN0aW9uKG1zZywgb3JpZ2luKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBpZnJhbWUgaXMgbm90IGxvYWRlZCwgSUUgcmFpc2VzIGFuIGV4Y2VwdGlvblxuICAgICAgICAgICAgLy8gb24gJ2NvbnRlbnRXaW5kb3cnLlxuICAgICAgICAgICAgaWYgKGlmcmFtZSAmJiBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKG1zZywgb3JpZ2luKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoeCkge307XG4gICAgfTtcblxuICAgIGRvYy5vcGVuKCk7XG4gICAgZG9jLndyaXRlKCc8aHRtbD48cycgKyAnY3JpcHQ+JyArXG4gICAgICAgICAgICAgICdkb2N1bWVudC5kb21haW49XCInICsgZG9jdW1lbnQuZG9tYWluICsgJ1wiOycgK1xuICAgICAgICAgICAgICAnPC9zJyArICdjcmlwdD48L2h0bWw+Jyk7XG4gICAgZG9jLmNsb3NlKCk7XG4gICAgZG9jLnBhcmVudFdpbmRvd1tXUHJlZml4XSA9IF93aW5kb3dbV1ByZWZpeF07XG4gICAgdmFyIGMgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQoYyk7XG4gICAgaWZyYW1lID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGMuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICBpZnJhbWUuc3JjID0gaWZyYW1lX3VybDtcbiAgICB0cmVmID0gc2V0VGltZW91dChmdW5jdGlvbigpe29uZXJyb3IoJ3RpbWVvdXQnKTt9LCAxNTAwMCk7XG4gICAgdW5sb2FkX3JlZiA9IHV0aWxzLnVubG9hZF9hZGQoY2xlYW51cCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcG9zdDogcG9zdCxcbiAgICAgICAgY2xlYW51cDogY2xlYW51cCxcbiAgICAgICAgbG9hZGVkOiB1bmF0dGFjaFxuICAgIH07XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi9kb20uanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL2RvbTIuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbnZhciBBYnN0cmFjdFhIUk9iamVjdCA9IGZ1bmN0aW9uKCl7fTtcbkFic3RyYWN0WEhST2JqZWN0LnByb3RvdHlwZSA9IG5ldyBFdmVudEVtaXR0ZXIoWydjaHVuaycsICdmaW5pc2gnXSk7XG5cbkFic3RyYWN0WEhST2JqZWN0LnByb3RvdHlwZS5fc3RhcnQgPSBmdW5jdGlvbihtZXRob2QsIHVybCwgcGF5bG9hZCwgb3B0cykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICAgIHRoYXQueGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgfSBjYXRjaCh4KSB7fTtcblxuICAgIGlmICghdGhhdC54aHIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoYXQueGhyID0gbmV3IF93aW5kb3cuQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTtcbiAgICAgICAgfSBjYXRjaCh4KSB7fTtcbiAgICB9XG4gICAgaWYgKF93aW5kb3cuQWN0aXZlWE9iamVjdCB8fCBfd2luZG93LlhEb21haW5SZXF1ZXN0KSB7XG4gICAgICAgIC8vIElFOCBjYWNoZXMgZXZlbiBQT1NUc1xuICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpID09PSAtMSkgPyAnPycgOiAnJicpICsgJ3Q9JysoK25ldyBEYXRlKTtcbiAgICB9XG5cbiAgICAvLyBFeHBsb3JlciB0ZW5kcyB0byBrZWVwIGNvbm5lY3Rpb24gb3BlbiwgZXZlbiBhZnRlciB0aGVcbiAgICAvLyB0YWIgZ2V0cyBjbG9zZWQ6IGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzUyODBcbiAgICB0aGF0LnVubG9hZF9yZWYgPSB1dGlscy51bmxvYWRfYWRkKGZ1bmN0aW9uKCl7dGhhdC5fY2xlYW51cCh0cnVlKTt9KTtcbiAgICB0cnkge1xuICAgICAgICB0aGF0Lnhoci5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgLy8gSUUgcmFpc2VzIGFuIGV4Y2VwdGlvbiBvbiB3cm9uZyBwb3J0LlxuICAgICAgICB0aGF0LmVtaXQoJ2ZpbmlzaCcsIDAsICcnKTtcbiAgICAgICAgdGhhdC5fY2xlYW51cCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIGlmICghb3B0cyB8fCAhb3B0cy5ub19jcmVkZW50aWFscykge1xuICAgICAgICAvLyBNb3ppbGxhIGRvY3Mgc2F5cyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9YTUxIdHRwUmVxdWVzdCA6XG4gICAgICAgIC8vIFwiVGhpcyBuZXZlciBhZmZlY3RzIHNhbWUtc2l0ZSByZXF1ZXN0cy5cIlxuICAgICAgICB0aGF0Lnhoci53aXRoQ3JlZGVudGlhbHMgPSAndHJ1ZSc7XG4gICAgfVxuICAgIGlmIChvcHRzICYmIG9wdHMuaGVhZGVycykge1xuICAgICAgICBmb3IodmFyIGtleSBpbiBvcHRzLmhlYWRlcnMpIHtcbiAgICAgICAgICAgIHRoYXQueGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBvcHRzLmhlYWRlcnNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGF0Lnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoYXQueGhyKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHRoYXQueGhyO1xuICAgICAgICAgICAgc3dpdGNoICh4LnJlYWR5U3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAvLyBJRSBkb2Vzbid0IGxpa2UgcGVla2luZyBpbnRvIHJlc3BvbnNlVGV4dCBvciBzdGF0dXNcbiAgICAgICAgICAgICAgICAvLyBvbiBNaWNyb3NvZnQuWE1MSFRUUCBhbmQgcmVhZHlzdGF0ZT0zXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHguc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IHgucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHt9O1xuICAgICAgICAgICAgICAgIC8vIElFIHJldHVybnMgMTIyMyBmb3IgMjA0OiBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDUwXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gMTIyMykgc3RhdHVzID0gMjA0O1xuXG4gICAgICAgICAgICAgICAgLy8gSUUgZG9lcyByZXR1cm4gcmVhZHlzdGF0ZSA9PSAzIGZvciA0MDQgYW5zd2Vycy5cbiAgICAgICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbWl0KCdjaHVuaycsIHN0YXR1cywgdGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHZhciBzdGF0dXMgPSB4LnN0YXR1cztcbiAgICAgICAgICAgICAgICAvLyBJRSByZXR1cm5zIDEyMjMgZm9yIDIwNDogaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTQ1MFxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IDEyMjMpIHN0YXR1cyA9IDIwNDtcblxuICAgICAgICAgICAgICAgIHRoYXQuZW1pdCgnZmluaXNoJywgc3RhdHVzLCB4LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgdGhhdC5fY2xlYW51cChmYWxzZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRoYXQueGhyLnNlbmQocGF5bG9hZCk7XG59O1xuXG5BYnN0cmFjdFhIUk9iamVjdC5wcm90b3R5cGUuX2NsZWFudXAgPSBmdW5jdGlvbihhYm9ydCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAoIXRoYXQueGhyKSByZXR1cm47XG4gICAgdXRpbHMudW5sb2FkX2RlbCh0aGF0LnVubG9hZF9yZWYpO1xuXG4gICAgLy8gSUUgbmVlZHMgdGhpcyBmaWVsZCB0byBiZSBhIGZ1bmN0aW9uXG4gICAgdGhhdC54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXt9O1xuXG4gICAgaWYgKGFib3J0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGF0Lnhoci5hYm9ydCgpO1xuICAgICAgICB9IGNhdGNoKHgpIHt9O1xuICAgIH1cbiAgICB0aGF0LnVubG9hZF9yZWYgPSB0aGF0LnhociA9IG51bGw7XG59O1xuXG5BYnN0cmFjdFhIUk9iamVjdC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5udWtlKCk7XG4gICAgdGhhdC5fY2xlYW51cCh0cnVlKTtcbn07XG5cbnZhciBYSFJDb3JzT2JqZWN0ID0gdXRpbHMuWEhSQ29yc09iamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICB1dGlscy5kZWxheShmdW5jdGlvbigpe3RoYXQuX3N0YXJ0LmFwcGx5KHRoYXQsIGFyZ3MpO30pO1xufTtcblhIUkNvcnNPYmplY3QucHJvdG90eXBlID0gbmV3IEFic3RyYWN0WEhST2JqZWN0KCk7XG5cbnZhciBYSFJMb2NhbE9iamVjdCA9IHV0aWxzLlhIUkxvY2FsT2JqZWN0ID0gZnVuY3Rpb24obWV0aG9kLCB1cmwsIHBheWxvYWQpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdXRpbHMuZGVsYXkoZnVuY3Rpb24oKXtcbiAgICAgICAgdGhhdC5fc3RhcnQobWV0aG9kLCB1cmwsIHBheWxvYWQsIHtcbiAgICAgICAgICAgIG5vX2NyZWRlbnRpYWxzOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblhIUkxvY2FsT2JqZWN0LnByb3RvdHlwZSA9IG5ldyBBYnN0cmFjdFhIUk9iamVjdCgpO1xuXG5cblxuLy8gUmVmZXJlbmNlczpcbi8vICAgaHR0cDovL2FqYXhpYW4uY29tL2FyY2hpdmVzLzEwMC1saW5lLWFqYXgtd3JhcHBlclxuLy8gICBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvY2MyODgwNjAodj1WUy44NSkuYXNweFxudmFyIFhEUk9iamVjdCA9IHV0aWxzLlhEUk9iamVjdCA9IGZ1bmN0aW9uKG1ldGhvZCwgdXJsLCBwYXlsb2FkKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHV0aWxzLmRlbGF5KGZ1bmN0aW9uKCl7dGhhdC5fc3RhcnQobWV0aG9kLCB1cmwsIHBheWxvYWQpO30pO1xufTtcblhEUk9iamVjdC5wcm90b3R5cGUgPSBuZXcgRXZlbnRFbWl0dGVyKFsnY2h1bmsnLCAnZmluaXNoJ10pO1xuWERST2JqZWN0LnByb3RvdHlwZS5fc3RhcnQgPSBmdW5jdGlvbihtZXRob2QsIHVybCwgcGF5bG9hZCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgeGRyID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgLy8gSUUgY2FjaGVzIGV2ZW4gUE9TVHNcbiAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpID09PSAtMSkgPyAnPycgOiAnJicpICsgJ3Q9JysoK25ldyBEYXRlKTtcblxuICAgIHZhciBvbmVycm9yID0geGRyLm9udGltZW91dCA9IHhkci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoYXQuZW1pdCgnZmluaXNoJywgMCwgJycpO1xuICAgICAgICB0aGF0Ll9jbGVhbnVwKGZhbHNlKTtcbiAgICB9O1xuICAgIHhkci5vbnByb2dyZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoYXQuZW1pdCgnY2h1bmsnLCAyMDAsIHhkci5yZXNwb25zZVRleHQpO1xuICAgIH07XG4gICAgeGRyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGF0LmVtaXQoJ2ZpbmlzaCcsIDIwMCwgeGRyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIHRoYXQuX2NsZWFudXAoZmFsc2UpO1xuICAgIH07XG4gICAgdGhhdC54ZHIgPSB4ZHI7XG4gICAgdGhhdC51bmxvYWRfcmVmID0gdXRpbHMudW5sb2FkX2FkZChmdW5jdGlvbigpe3RoYXQuX2NsZWFudXAodHJ1ZSk7fSk7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gRmFpbHMgd2l0aCBBY2Nlc3NEZW5pZWQgaWYgcG9ydCBudW1iZXIgaXMgYm9ndXNcbiAgICAgICAgdGhhdC54ZHIub3BlbihtZXRob2QsIHVybCk7XG4gICAgICAgIHRoYXQueGRyLnNlbmQocGF5bG9hZCk7XG4gICAgfSBjYXRjaCh4KSB7XG4gICAgICAgIG9uZXJyb3IoKTtcbiAgICB9XG59O1xuXG5YRFJPYmplY3QucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24oYWJvcnQpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKCF0aGF0LnhkcikgcmV0dXJuO1xuICAgIHV0aWxzLnVubG9hZF9kZWwodGhhdC51bmxvYWRfcmVmKTtcblxuICAgIHRoYXQueGRyLm9udGltZW91dCA9IHRoYXQueGRyLm9uZXJyb3IgPSB0aGF0Lnhkci5vbnByb2dyZXNzID1cbiAgICAgICAgdGhhdC54ZHIub25sb2FkID0gbnVsbDtcbiAgICBpZiAoYWJvcnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoYXQueGRyLmFib3J0KCk7XG4gICAgICAgIH0gY2F0Y2goeCkge307XG4gICAgfVxuICAgIHRoYXQudW5sb2FkX3JlZiA9IHRoYXQueGRyID0gbnVsbDtcbn07XG5cblhEUk9iamVjdC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5udWtlKCk7XG4gICAgdGhhdC5fY2xlYW51cCh0cnVlKTtcbn07XG5cbi8vIDEuIElzIG5hdGl2ZWx5IHZpYSBYSFJcbi8vIDIuIElzIG5hdGl2ZWx5IHZpYSBYRFJcbi8vIDMuIE5vcGUsIGJ1dCBwb3N0TWVzc2FnZSBpcyB0aGVyZSBzbyBpdCBzaG91bGQgd29yayB2aWEgdGhlIElmcmFtZS5cbi8vIDQuIE5vcGUsIHNvcnJ5LlxudXRpbHMuaXNYSFJDb3JzQ2FwYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChfd2luZG93LlhNTEh0dHBSZXF1ZXN0ICYmICd3aXRoQ3JlZGVudGlhbHMnIGluIG5ldyBYTUxIdHRwUmVxdWVzdCgpKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICAvLyBYRG9tYWluUmVxdWVzdCBkb2Vzbid0IHdvcmsgaWYgcGFnZSBpcyBzZXJ2ZWQgZnJvbSBmaWxlOi8vXG4gICAgaWYgKF93aW5kb3cuWERvbWFpblJlcXVlc3QgJiYgX2RvY3VtZW50LmRvbWFpbikge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG4gICAgaWYgKElmcmFtZVRyYW5zcG9ydC5lbmFibGVkKCkpIHtcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgfVxuICAgIHJldHVybiA0O1xufTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvZG9tMi5qc1xuXG5cbi8vICAgICAgICAgWypdIEluY2x1ZGluZyBsaWIvc29ja2pzLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgU29ja0pTID0gZnVuY3Rpb24odXJsLCBkZXBfcHJvdG9jb2xzX3doaXRlbGlzdCwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzID09PSBfd2luZG93KSB7XG4gICAgICAgIC8vIG1ha2VzIGBuZXdgIG9wdGlvbmFsXG4gICAgICAgIHJldHVybiBuZXcgU29ja0pTKHVybCwgZGVwX3Byb3RvY29sc193aGl0ZWxpc3QsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHZhciB0aGF0ID0gdGhpcywgcHJvdG9jb2xzX3doaXRlbGlzdDtcbiAgICB0aGF0Ll9vcHRpb25zID0ge2RldmVsOiBmYWxzZSwgZGVidWc6IGZhbHNlLCBwcm90b2NvbHNfd2hpdGVsaXN0OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgIGluZm86IHVuZGVmaW5lZCwgcnR0OiB1bmRlZmluZWR9O1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIHV0aWxzLm9iamVjdEV4dGVuZCh0aGF0Ll9vcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG4gICAgdGhhdC5fYmFzZV91cmwgPSB1dGlscy5hbWVuZFVybCh1cmwpO1xuICAgIHRoYXQuX3NlcnZlciA9IHRoYXQuX29wdGlvbnMuc2VydmVyIHx8IHV0aWxzLnJhbmRvbV9udW1iZXJfc3RyaW5nKDEwMDApO1xuICAgIGlmICh0aGF0Ll9vcHRpb25zLnByb3RvY29sc193aGl0ZWxpc3QgJiZcbiAgICAgICAgdGhhdC5fb3B0aW9ucy5wcm90b2NvbHNfd2hpdGVsaXN0Lmxlbmd0aCkge1xuICAgICAgICBwcm90b2NvbHNfd2hpdGVsaXN0ID0gdGhhdC5fb3B0aW9ucy5wcm90b2NvbHNfd2hpdGVsaXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERlcHJlY2F0ZWQgQVBJXG4gICAgICAgIGlmICh0eXBlb2YgZGVwX3Byb3RvY29sc193aGl0ZWxpc3QgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBkZXBfcHJvdG9jb2xzX3doaXRlbGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwcm90b2NvbHNfd2hpdGVsaXN0ID0gW2RlcF9wcm90b2NvbHNfd2hpdGVsaXN0XTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KGRlcF9wcm90b2NvbHNfd2hpdGVsaXN0KSkge1xuICAgICAgICAgICAgcHJvdG9jb2xzX3doaXRlbGlzdCA9IGRlcF9wcm90b2NvbHNfd2hpdGVsaXN0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm90b2NvbHNfd2hpdGVsaXN0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvdG9jb2xzX3doaXRlbGlzdCkge1xuICAgICAgICAgICAgdGhhdC5fZGVidWcoJ0RlcHJlY2F0ZWQgQVBJOiBVc2UgXCJwcm90b2NvbHNfd2hpdGVsaXN0XCIgb3B0aW9uICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2luc3RlYWQgb2Ygc3VwcGx5aW5nIHByb3RvY29sIGxpc3QgYXMgYSBzZWNvbmQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAncGFyYW1ldGVyIHRvIFNvY2tKUyBjb25zdHJ1Y3Rvci4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGF0Ll9wcm90b2NvbHMgPSBbXTtcbiAgICB0aGF0LnByb3RvY29sID0gbnVsbDtcbiAgICB0aGF0LnJlYWR5U3RhdGUgPSBTb2NrSlMuQ09OTkVDVElORztcbiAgICB0aGF0Ll9pciA9IGNyZWF0ZUluZm9SZWNlaXZlcih0aGF0Ll9iYXNlX3VybCk7XG4gICAgdGhhdC5faXIub25maW5pc2ggPSBmdW5jdGlvbihpbmZvLCBydHQpIHtcbiAgICAgICAgdGhhdC5faXIgPSBudWxsO1xuICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgaWYgKHRoYXQuX29wdGlvbnMuaW5mbykge1xuICAgICAgICAgICAgICAgIC8vIE92ZXJyaWRlIGlmIHVzZXIgc3VwcGxpZXMgdGhlIG9wdGlvblxuICAgICAgICAgICAgICAgIGluZm8gPSB1dGlscy5vYmplY3RFeHRlbmQoaW5mbywgdGhhdC5fb3B0aW9ucy5pbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0Ll9vcHRpb25zLnJ0dCkge1xuICAgICAgICAgICAgICAgIHJ0dCA9IHRoYXQuX29wdGlvbnMucnR0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5fYXBwbHlJbmZvKGluZm8sIHJ0dCwgcHJvdG9jb2xzX3doaXRlbGlzdCk7XG4gICAgICAgICAgICB0aGF0Ll9kaWRDbG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhhdC5fZGlkQ2xvc2UoMTAwMiwgJ0NhblxcJ3QgY29ubmVjdCB0byBzZXJ2ZXInLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuLy8gSW5oZXJpdGFuY2VcblNvY2tKUy5wcm90b3R5cGUgPSBuZXcgUkV2ZW50VGFyZ2V0KCk7XG5cblNvY2tKUy52ZXJzaW9uID0gXCIwLjMuNFwiO1xuXG5Tb2NrSlMuQ09OTkVDVElORyA9IDA7XG5Tb2NrSlMuT1BFTiA9IDE7XG5Tb2NrSlMuQ0xPU0lORyA9IDI7XG5Tb2NrSlMuQ0xPU0VEID0gMztcblxuU29ja0pTLnByb3RvdHlwZS5fZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fb3B0aW9ucy5kZWJ1ZylcbiAgICAgICAgdXRpbHMubG9nLmFwcGx5KHV0aWxzLCBhcmd1bWVudHMpO1xufTtcblxuU29ja0pTLnByb3RvdHlwZS5fZGlzcGF0Y2hPcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGlmICh0aGF0LnJlYWR5U3RhdGUgPT09IFNvY2tKUy5DT05ORUNUSU5HKSB7XG4gICAgICAgIGlmICh0aGF0Ll90cmFuc3BvcnRfdHJlZikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoYXQuX3RyYW5zcG9ydF90cmVmKTtcbiAgICAgICAgICAgIHRoYXQuX3RyYW5zcG9ydF90cmVmID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGF0LnJlYWR5U3RhdGUgPSBTb2NrSlMuT1BFTjtcbiAgICAgICAgdGhhdC5kaXNwYXRjaEV2ZW50KG5ldyBTaW1wbGVFdmVudChcIm9wZW5cIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBzZXJ2ZXIgbWlnaHQgaGF2ZSBiZWVuIHJlc3RhcnRlZCwgYW5kIGxvc3QgdHJhY2sgb2Ygb3VyXG4gICAgICAgIC8vIGNvbm5lY3Rpb24uXG4gICAgICAgIHRoYXQuX2RpZENsb3NlKDEwMDYsIFwiU2VydmVyIGxvc3Qgc2Vzc2lvblwiKTtcbiAgICB9XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLl9kaXNwYXRjaE1lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGlmICh0aGF0LnJlYWR5U3RhdGUgIT09IFNvY2tKUy5PUEVOKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgIHRoYXQuZGlzcGF0Y2hFdmVudChuZXcgU2ltcGxlRXZlbnQoXCJtZXNzYWdlXCIsIHtkYXRhOiBkYXRhfSkpO1xufTtcblxuU29ja0pTLnByb3RvdHlwZS5fZGlzcGF0Y2hIZWFydGJlYXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGlmICh0aGF0LnJlYWR5U3RhdGUgIT09IFNvY2tKUy5PUEVOKVxuICAgICAgICByZXR1cm47XG4gICAgdGhhdC5kaXNwYXRjaEV2ZW50KG5ldyBTaW1wbGVFdmVudCgnaGVhcnRiZWF0Jywge30pKTtcbn07XG5cblNvY2tKUy5wcm90b3R5cGUuX2RpZENsb3NlID0gZnVuY3Rpb24oY29kZSwgcmVhc29uLCBmb3JjZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAodGhhdC5yZWFkeVN0YXRlICE9PSBTb2NrSlMuQ09OTkVDVElORyAmJlxuICAgICAgICB0aGF0LnJlYWR5U3RhdGUgIT09IFNvY2tKUy5PUEVOICYmXG4gICAgICAgIHRoYXQucmVhZHlTdGF0ZSAhPT0gU29ja0pTLkNMT1NJTkcpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lOVkFMSURfU1RBVEVfRVJSJyk7XG4gICAgaWYgKHRoYXQuX2lyKSB7XG4gICAgICAgIHRoYXQuX2lyLm51a2UoKTtcbiAgICAgICAgdGhhdC5faXIgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGF0Ll90cmFuc3BvcnQpIHtcbiAgICAgICAgdGhhdC5fdHJhbnNwb3J0LmRvQ2xlYW51cCgpO1xuICAgICAgICB0aGF0Ll90cmFuc3BvcnQgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBjbG9zZV9ldmVudCA9IG5ldyBTaW1wbGVFdmVudChcImNsb3NlXCIsIHtcbiAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgcmVhc29uOiByZWFzb24sXG4gICAgICAgIHdhc0NsZWFuOiB1dGlscy51c2VyU2V0Q29kZShjb2RlKX0pO1xuXG4gICAgaWYgKCF1dGlscy51c2VyU2V0Q29kZShjb2RlKSAmJlxuICAgICAgICB0aGF0LnJlYWR5U3RhdGUgPT09IFNvY2tKUy5DT05ORUNUSU5HICYmICFmb3JjZSkge1xuICAgICAgICBpZiAodGhhdC5fdHJ5X25leHRfcHJvdG9jb2woY2xvc2VfZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2xvc2VfZXZlbnQgPSBuZXcgU2ltcGxlRXZlbnQoXCJjbG9zZVwiLCB7Y29kZTogMjAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogXCJBbGwgdHJhbnNwb3J0cyBmYWlsZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhc0NsZWFuOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZXZlbnQ6IGNsb3NlX2V2ZW50fSk7XG4gICAgfVxuICAgIHRoYXQucmVhZHlTdGF0ZSA9IFNvY2tKUy5DTE9TRUQ7XG5cbiAgICB1dGlscy5kZWxheShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICB0aGF0LmRpc3BhdGNoRXZlbnQoY2xvc2VfZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xufTtcblxuU29ja0pTLnByb3RvdHlwZS5fZGlkTWVzc2FnZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHR5cGUgPSBkYXRhLnNsaWNlKDAsIDEpO1xuICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSAnbyc6XG4gICAgICAgIHRoYXQuX2Rpc3BhdGNoT3BlbigpO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdhJzpcbiAgICAgICAgdmFyIHBheWxvYWQgPSBKU09OLnBhcnNlKGRhdGEuc2xpY2UoMSkgfHwgJ1tdJyk7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpIDwgcGF5bG9hZC5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB0aGF0Ll9kaXNwYXRjaE1lc3NhZ2UocGF5bG9hZFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbSc6XG4gICAgICAgIHZhciBwYXlsb2FkID0gSlNPTi5wYXJzZShkYXRhLnNsaWNlKDEpIHx8ICdudWxsJyk7XG4gICAgICAgIHRoYXQuX2Rpc3BhdGNoTWVzc2FnZShwYXlsb2FkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYyc6XG4gICAgICAgIHZhciBwYXlsb2FkID0gSlNPTi5wYXJzZShkYXRhLnNsaWNlKDEpIHx8ICdbXScpO1xuICAgICAgICB0aGF0Ll9kaWRDbG9zZShwYXlsb2FkWzBdLCBwYXlsb2FkWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaCc6XG4gICAgICAgIHRoYXQuX2Rpc3BhdGNoSGVhcnRiZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cblNvY2tKUy5wcm90b3R5cGUuX3RyeV9uZXh0X3Byb3RvY29sID0gZnVuY3Rpb24oY2xvc2VfZXZlbnQpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKHRoYXQucHJvdG9jb2wpIHtcbiAgICAgICAgdGhhdC5fZGVidWcoJ0Nsb3NlZCB0cmFuc3BvcnQ6JywgdGhhdC5wcm90b2NvbCwgJycrY2xvc2VfZXZlbnQpO1xuICAgICAgICB0aGF0LnByb3RvY29sID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoYXQuX3RyYW5zcG9ydF90cmVmKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGF0Ll90cmFuc3BvcnRfdHJlZik7XG4gICAgICAgIHRoYXQuX3RyYW5zcG9ydF90cmVmID0gbnVsbDtcbiAgICB9XG5cbiAgICB3aGlsZSgxKSB7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IHRoYXQucHJvdG9jb2wgPSB0aGF0Ll9wcm90b2NvbHMuc2hpZnQoKTtcbiAgICAgICAgaWYgKCFwcm90b2NvbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNvbWUgcHJvdG9jb2xzIHJlcXVpcmUgYWNjZXNzIHRvIGBib2R5YCwgd2hhdCBpZiB3ZXJlIGluXG4gICAgICAgIC8vIHRoZSBgaGVhZGA/XG4gICAgICAgIGlmIChTb2NrSlNbcHJvdG9jb2xdICYmXG4gICAgICAgICAgICBTb2NrSlNbcHJvdG9jb2xdLm5lZWRfYm9keSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgKCFfZG9jdW1lbnQuYm9keSB8fFxuICAgICAgICAgICAgICh0eXBlb2YgX2RvY3VtZW50LnJlYWR5U3RhdGUgIT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICYmIF9kb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSkpIHtcbiAgICAgICAgICAgIHRoYXQuX3Byb3RvY29scy51bnNoaWZ0KHByb3RvY29sKTtcbiAgICAgICAgICAgIHRoYXQucHJvdG9jb2wgPSAnd2FpdGluZy1mb3ItbG9hZCc7XG4gICAgICAgICAgICB1dGlscy5hdHRhY2hFdmVudCgnbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGhhdC5fdHJ5X25leHRfcHJvdG9jb2woKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIVNvY2tKU1twcm90b2NvbF0gfHxcbiAgICAgICAgICAgICAgIVNvY2tKU1twcm90b2NvbF0uZW5hYmxlZCh0aGF0Ll9vcHRpb25zKSkge1xuICAgICAgICAgICAgdGhhdC5fZGVidWcoJ1NraXBwaW5nIHRyYW5zcG9ydDonLCBwcm90b2NvbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcm91bmRUcmlwcyA9IFNvY2tKU1twcm90b2NvbF0ucm91bmRUcmlwcyB8fCAxO1xuICAgICAgICAgICAgdmFyIHRvID0gKCh0aGF0Ll9vcHRpb25zLnJ0byB8fCAwKSAqIHJvdW5kVHJpcHMpIHx8IDUwMDA7XG4gICAgICAgICAgICB0aGF0Ll90cmFuc3BvcnRfdHJlZiA9IHV0aWxzLmRlbGF5KHRvLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5yZWFkeVN0YXRlID09PSBTb2NrSlMuQ09OTkVDVElORykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJIGNhbid0IHVuZGVyc3RhbmQgaG93IGl0IGlzIHBvc3NpYmxlIHRvIHJ1blxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHRpbWVyLCB3aGVuIHRoZSBzdGF0ZSBpcyBDTE9TRUQsIGJ1dFxuICAgICAgICAgICAgICAgICAgICAvLyBhcHBhcmVudGx5IGluIElFIGV2ZXJ5dGhpbiBpcyBwb3NzaWJsZS5cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fZGlkQ2xvc2UoMjAwNywgXCJUcmFuc3BvcnQgdGltZW91dGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgY29ubmlkID0gdXRpbHMucmFuZG9tX3N0cmluZyg4KTtcbiAgICAgICAgICAgIHZhciB0cmFuc191cmwgPSB0aGF0Ll9iYXNlX3VybCArICcvJyArIHRoYXQuX3NlcnZlciArICcvJyArIGNvbm5pZDtcbiAgICAgICAgICAgIHRoYXQuX2RlYnVnKCdPcGVuaW5nIHRyYW5zcG9ydDonLCBwcm90b2NvbCwgJyB1cmw6Jyt0cmFuc191cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFJUTzonK3RoYXQuX29wdGlvbnMucnRvKTtcbiAgICAgICAgICAgIHRoYXQuX3RyYW5zcG9ydCA9IG5ldyBTb2NrSlNbcHJvdG9jb2xdKHRoYXQsIHRyYW5zX3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuX2Jhc2VfdXJsKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU29ja0pTLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGNvZGUsIHJlYXNvbikge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAoY29kZSAmJiAhdXRpbHMudXNlclNldENvZGUoY29kZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIklOVkFMSURfQUNDRVNTX0VSUlwiKTtcbiAgICBpZih0aGF0LnJlYWR5U3RhdGUgIT09IFNvY2tKUy5DT05ORUNUSU5HICYmXG4gICAgICAgdGhhdC5yZWFkeVN0YXRlICE9PSBTb2NrSlMuT1BFTikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoYXQucmVhZHlTdGF0ZSA9IFNvY2tKUy5DTE9TSU5HO1xuICAgIHRoYXQuX2RpZENsb3NlKGNvZGUgfHwgMTAwMCwgcmVhc29uIHx8IFwiTm9ybWFsIGNsb3N1cmVcIik7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGlmICh0aGF0LnJlYWR5U3RhdGUgPT09IFNvY2tKUy5DT05ORUNUSU5HKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lOVkFMSURfU1RBVEVfRVJSJyk7XG4gICAgaWYgKHRoYXQucmVhZHlTdGF0ZSA9PT0gU29ja0pTLk9QRU4pIHtcbiAgICAgICAgdGhhdC5fdHJhbnNwb3J0LmRvU2VuZCh1dGlscy5xdW90ZSgnJyArIGRhdGEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLl9hcHBseUluZm8gPSBmdW5jdGlvbihpbmZvLCBydHQsIHByb3RvY29sc193aGl0ZWxpc3QpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5fb3B0aW9ucy5pbmZvID0gaW5mbztcbiAgICB0aGF0Ll9vcHRpb25zLnJ0dCA9IHJ0dDtcbiAgICB0aGF0Ll9vcHRpb25zLnJ0byA9IHV0aWxzLmNvdW50UlRPKHJ0dCk7XG4gICAgdGhhdC5fb3B0aW9ucy5pbmZvLm51bGxfb3JpZ2luID0gIV9kb2N1bWVudC5kb21haW47XG4gICAgdmFyIHByb2JlZCA9IHV0aWxzLnByb2JlUHJvdG9jb2xzKCk7XG4gICAgdGhhdC5fcHJvdG9jb2xzID0gdXRpbHMuZGV0ZWN0UHJvdG9jb2xzKHByb2JlZCwgcHJvdG9jb2xzX3doaXRlbGlzdCwgaW5mbyk7XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi9zb2NranMuanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3RyYW5zLXdlYnNvY2tldC5qc1xuLypcbiAqICoqKioqIEJFR0lOIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyIFZNd2FyZSwgSW5jLlxuICpcbiAqIEZvciB0aGUgbGljZW5zZSBzZWUgQ09QWUlORy5cbiAqICoqKioqIEVORCBMSUNFTlNFIEJMT0NLICoqKioqXG4gKi9cblxudmFyIFdlYlNvY2tldFRyYW5zcG9ydCA9IFNvY2tKUy53ZWJzb2NrZXQgPSBmdW5jdGlvbihyaSwgdHJhbnNfdXJsKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciB1cmwgPSB0cmFuc191cmwgKyAnL3dlYnNvY2tldCc7XG4gICAgaWYgKHVybC5zbGljZSgwLCA1KSA9PT0gJ2h0dHBzJykge1xuICAgICAgICB1cmwgPSAnd3NzJyArIHVybC5zbGljZSg1KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1cmwgPSAnd3MnICsgdXJsLnNsaWNlKDQpO1xuICAgIH1cbiAgICB0aGF0LnJpID0gcmk7XG4gICAgdGhhdC51cmwgPSB1cmw7XG4gICAgdmFyIENvbnN0cnVjdG9yID0gX3dpbmRvdy5XZWJTb2NrZXQgfHwgX3dpbmRvdy5Nb3pXZWJTb2NrZXQ7XG5cbiAgICB0aGF0LndzID0gbmV3IENvbnN0cnVjdG9yKHRoYXQudXJsKTtcbiAgICB0aGF0LndzLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhhdC5yaS5fZGlkTWVzc2FnZShlLmRhdGEpO1xuICAgIH07XG4gICAgLy8gRmlyZWZveCBoYXMgYW4gaW50ZXJlc3RpbmcgYnVnLiBJZiBhIHdlYnNvY2tldCBjb25uZWN0aW9uIGlzXG4gICAgLy8gY3JlYXRlZCBhZnRlciBvbnVubG9hZCwgaXQgc3RheXMgYWxpdmUgZXZlbiB3aGVuIHVzZXJcbiAgICAvLyBuYXZpZ2F0ZXMgYXdheSBmcm9tIHRoZSBwYWdlLiBJbiBzdWNoIHNpdHVhdGlvbiBsZXQncyBsaWUgLVxuICAgIC8vIGxldCdzIG5vdCBvcGVuIHRoZSB3cyBjb25uZWN0aW9uIGF0IGFsbC4gU2VlOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NranMvc29ja2pzLWNsaWVudC9pc3N1ZXMvMjhcbiAgICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTYwODVcbiAgICB0aGF0LnVubG9hZF9yZWYgPSB1dGlscy51bmxvYWRfYWRkKGZ1bmN0aW9uKCl7dGhhdC53cy5jbG9zZSgpfSk7XG4gICAgdGhhdC53cy5vbmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoYXQucmkuX2RpZE1lc3NhZ2UodXRpbHMuY2xvc2VGcmFtZSgxMDA2LCBcIldlYlNvY2tldCBjb25uZWN0aW9uIGJyb2tlblwiKSk7XG4gICAgfTtcbn07XG5cbldlYlNvY2tldFRyYW5zcG9ydC5wcm90b3R5cGUuZG9TZW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHRoaXMud3Muc2VuZCgnWycgKyBkYXRhICsgJ10nKTtcbn07XG5cbldlYlNvY2tldFRyYW5zcG9ydC5wcm90b3R5cGUuZG9DbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciB3cyA9IHRoYXQud3M7XG4gICAgaWYgKHdzKSB7XG4gICAgICAgIHdzLm9ubWVzc2FnZSA9IHdzLm9uY2xvc2UgPSBudWxsO1xuICAgICAgICB3cy5jbG9zZSgpO1xuICAgICAgICB1dGlscy51bmxvYWRfZGVsKHRoYXQudW5sb2FkX3JlZik7XG4gICAgICAgIHRoYXQudW5sb2FkX3JlZiA9IHRoYXQucmkgPSB0aGF0LndzID0gbnVsbDtcbiAgICB9XG59O1xuXG5XZWJTb2NrZXRUcmFuc3BvcnQuZW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhIShfd2luZG93LldlYlNvY2tldCB8fCBfd2luZG93Lk1veldlYlNvY2tldCk7XG59O1xuXG4vLyBJbiB0aGVvcnksIHdzIHNob3VsZCByZXF1aXJlIDEgcm91bmQgdHJpcC4gQnV0IGluIGNocm9tZSwgdGhpcyBpc1xuLy8gbm90IHZlcnkgc3RhYmxlIG92ZXIgU1NMLiBNb3N0IGxpa2VseSBhIHdzIGNvbm5lY3Rpb24gcmVxdWlyZXMgYVxuLy8gc2VwYXJhdGUgU1NMIGNvbm5lY3Rpb24sIGluIHdoaWNoIGNhc2UgMiByb3VuZCB0cmlwcyBhcmUgYW5cbi8vIGFic29sdXRlIG1pbnVtdW0uXG5XZWJTb2NrZXRUcmFuc3BvcnQucm91bmRUcmlwcyA9IDI7XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL3RyYW5zLXdlYnNvY2tldC5qc1xuXG5cbi8vICAgICAgICAgWypdIEluY2x1ZGluZyBsaWIvdHJhbnMtc2VuZGVyLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgQnVmZmVyZWRTZW5kZXIgPSBmdW5jdGlvbigpIHt9O1xuQnVmZmVyZWRTZW5kZXIucHJvdG90eXBlLnNlbmRfY29uc3RydWN0b3IgPSBmdW5jdGlvbihzZW5kZXIpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5zZW5kX2J1ZmZlciA9IFtdO1xuICAgIHRoYXQuc2VuZGVyID0gc2VuZGVyO1xufTtcbkJ1ZmZlcmVkU2VuZGVyLnByb3RvdHlwZS5kb1NlbmQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoYXQuc2VuZF9idWZmZXIucHVzaChtZXNzYWdlKTtcbiAgICBpZiAoIXRoYXQuc2VuZF9zdG9wKSB7XG4gICAgICAgIHRoYXQuc2VuZF9zY2hlZHVsZSgpO1xuICAgIH1cbn07XG5cbi8vIEZvciBwb2xsaW5nIHRyYW5zcG9ydHMgaW4gYSBzaXR1YXRpb24gd2hlbiBpbiB0aGUgbWVzc2FnZSBjYWxsYmFjayxcbi8vIG5ldyBtZXNzYWdlIGlzIGJlaW5nIHNlbmQuIElmIHRoZSBzZW5kaW5nIGNvbm5lY3Rpb24gd2FzIHN0YXJ0ZWRcbi8vIGJlZm9yZSByZWNlaXZpbmcgb25lLCBpdCBpcyBwb3NzaWJsZSB0byBzYXR1cmF0ZSB0aGUgbmV0d29yayBhbmRcbi8vIHRpbWVvdXQgZHVlIHRvIHRoZSBsYWNrIG9mIHJlY2VpdmluZyBzb2NrZXQuIFRvIGF2b2lkIHRoYXQgd2UgZGVsYXlcbi8vIHNlbmRpbmcgbWVzc2FnZXMgYnkgc29tZSBzbWFsbCB0aW1lLCBpbiBvcmRlciB0byBsZXQgcmVjZWl2aW5nXG4vLyBjb25uZWN0aW9uIGJlIHN0YXJ0ZWQgYmVmb3JlaGFuZC4gVGhpcyBpcyBvbmx5IGEgaGFsZm1lYXN1cmUgYW5kXG4vLyBkb2VzIG5vdCBmaXggdGhlIGJpZyBwcm9ibGVtLCBidXQgaXQgZG9lcyBtYWtlIHRoZSB0ZXN0cyBnbyBtb3JlXG4vLyBzdGFibGUgb24gc2xvdyBuZXR3b3Jrcy5cbkJ1ZmZlcmVkU2VuZGVyLnByb3RvdHlwZS5zZW5kX3NjaGVkdWxlX3dhaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHRyZWY7XG4gICAgdGhhdC5zZW5kX3N0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhhdC5zZW5kX3N0b3AgPSBudWxsO1xuICAgICAgICBjbGVhclRpbWVvdXQodHJlZik7XG4gICAgfTtcbiAgICB0cmVmID0gdXRpbHMuZGVsYXkoMjUsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGF0LnNlbmRfc3RvcCA9IG51bGw7XG4gICAgICAgIHRoYXQuc2VuZF9zY2hlZHVsZSgpO1xuICAgIH0pO1xufTtcblxuQnVmZmVyZWRTZW5kZXIucHJvdG90eXBlLnNlbmRfc2NoZWR1bGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKHRoYXQuc2VuZF9idWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgcGF5bG9hZCA9ICdbJyArIHRoYXQuc2VuZF9idWZmZXIuam9pbignLCcpICsgJ10nO1xuICAgICAgICB0aGF0LnNlbmRfc3RvcCA9IHRoYXQuc2VuZGVyKHRoYXQudHJhbnNfdXJsLCBwYXlsb2FkLCBmdW5jdGlvbihzdWNjZXNzLCBhYm9ydF9yZWFzb24pIHtcbiAgICAgICAgICAgIHRoYXQuc2VuZF9zdG9wID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoYXQucmkuX2RpZENsb3NlKDEwMDYsICdTZW5kaW5nIGVycm9yICcgKyBhYm9ydF9yZWFzb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbmRfc2NoZWR1bGVfd2FpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhhdC5zZW5kX2J1ZmZlciA9IFtdO1xuICAgIH1cbn07XG5cbkJ1ZmZlcmVkU2VuZGVyLnByb3RvdHlwZS5zZW5kX2Rlc3RydWN0b3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKHRoYXQuX3NlbmRfc3RvcCkge1xuICAgICAgICB0aGF0Ll9zZW5kX3N0b3AoKTtcbiAgICB9XG4gICAgdGhhdC5fc2VuZF9zdG9wID0gbnVsbDtcbn07XG5cbnZhciBqc29uUEdlbmVyaWNTZW5kZXIgPSBmdW5jdGlvbih1cmwsIHBheWxvYWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgaWYgKCEoJ19zZW5kX2Zvcm0nIGluIHRoYXQpKSB7XG4gICAgICAgIHZhciBmb3JtID0gdGhhdC5fc2VuZF9mb3JtID0gX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgICAgICAgdmFyIGFyZWEgPSB0aGF0Ll9zZW5kX2FyZWEgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgYXJlYS5uYW1lID0gJ2QnO1xuICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGZvcm0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBmb3JtLm1ldGhvZCA9ICdQT1NUJztcbiAgICAgICAgZm9ybS5lbmN0eXBlID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc7XG4gICAgICAgIGZvcm0uYWNjZXB0Q2hhcnNldCA9IFwiVVRGLThcIjtcbiAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChhcmVhKTtcbiAgICAgICAgX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gICAgfVxuICAgIHZhciBmb3JtID0gdGhhdC5fc2VuZF9mb3JtO1xuICAgIHZhciBhcmVhID0gdGhhdC5fc2VuZF9hcmVhO1xuICAgIHZhciBpZCA9ICdhJyArIHV0aWxzLnJhbmRvbV9zdHJpbmcoOCk7XG4gICAgZm9ybS50YXJnZXQgPSBpZDtcbiAgICBmb3JtLmFjdGlvbiA9IHVybCArICcvanNvbnBfc2VuZD9pPScgKyBpZDtcblxuICAgIHZhciBpZnJhbWU7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gaWU2IGR5bmFtaWMgaWZyYW1lcyB3aXRoIHRhcmdldD1cIlwiIHN1cHBvcnQgKHRoYW5rcyBDaHJpcyBMYW1iYWNoZXIpXG4gICAgICAgIGlmcmFtZSA9IF9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCc8aWZyYW1lIG5hbWU9XCInKyBpZCArJ1wiPicpO1xuICAgIH0gY2F0Y2goeCkge1xuICAgICAgICBpZnJhbWUgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIGlmcmFtZS5uYW1lID0gaWQ7XG4gICAgfVxuICAgIGlmcmFtZS5pZCA9IGlkO1xuICAgIGZvcm0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgIHRyeSB7XG4gICAgICAgIGFyZWEudmFsdWUgPSBwYXlsb2FkO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB1dGlscy5sb2coJ1lvdXIgYnJvd3NlciBpcyBzZXJpb3VzbHkgYnJva2VuLiBHbyBob21lISAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG4gICAgZm9ybS5zdWJtaXQoKTtcblxuICAgIHZhciBjb21wbGV0ZWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghaWZyYW1lLm9uZXJyb3IpIHJldHVybjtcbiAgICAgICAgaWZyYW1lLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGlmcmFtZS5vbmVycm9yID0gaWZyYW1lLm9ubG9hZCA9IG51bGw7XG4gICAgICAgIC8vIE9wZXJhIG1pbmkgZG9lc24ndCBsaWtlIGlmIHdlIEdDIGlmcmFtZVxuICAgICAgICAvLyBpbW1lZGlhdGVseSwgdGh1cyB0aGlzIHRpbWVvdXQuXG4gICAgICAgIHV0aWxzLmRlbGF5KDUwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmcmFtZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGFyZWEudmFsdWUgPSAnJztcbiAgICAgICAgLy8gSXQgaXMgbm90IHBvc3NpYmxlIHRvIGRldGVjdCBpZiB0aGUgaWZyYW1lIHN1Y2NlZWRlZCBvclxuICAgICAgICAvLyBmYWlsZWQgdG8gc3VibWl0IG91ciBmb3JtLlxuICAgICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICB9O1xuICAgIGlmcmFtZS5vbmVycm9yID0gaWZyYW1lLm9ubG9hZCA9IGNvbXBsZXRlZDtcbiAgICBpZnJhbWUub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoaWZyYW1lLnJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJykgY29tcGxldGVkKCk7XG4gICAgfTtcbiAgICByZXR1cm4gY29tcGxldGVkO1xufTtcblxudmFyIGNyZWF0ZUFqYXhTZW5kZXIgPSBmdW5jdGlvbihBamF4T2JqZWN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgcGF5bG9hZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHhvID0gbmV3IEFqYXhPYmplY3QoJ1BPU1QnLCB1cmwgKyAnL3hocl9zZW5kJywgcGF5bG9hZCk7XG4gICAgICAgIHhvLm9uZmluaXNoID0gZnVuY3Rpb24oc3RhdHVzLCB0ZXh0KSB7XG4gICAgICAgICAgICBjYWxsYmFjayhzdGF0dXMgPT09IDIwMCB8fCBzdGF0dXMgPT09IDIwNCxcbiAgICAgICAgICAgICAgICAgICAgICdodHRwIHN0YXR1cyAnICsgc3RhdHVzKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFib3J0X3JlYXNvbikge1xuICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIGFib3J0X3JlYXNvbik7XG4gICAgICAgIH07XG4gICAgfTtcbn07XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL3RyYW5zLXNlbmRlci5qc1xuXG5cbi8vICAgICAgICAgWypdIEluY2x1ZGluZyBsaWIvdHJhbnMtanNvbnAtcmVjZWl2ZXIuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8vIFBhcnRzIGRlcml2ZWQgZnJvbSBTb2NrZXQuaW86XG4vLyAgICBodHRwczovL2dpdGh1Yi5jb20vTGVhcm5Cb29zdC9zb2NrZXQuaW8vYmxvYi8wLjYuMTcvbGliL3NvY2tldC5pby90cmFuc3BvcnRzL2pzb25wLXBvbGxpbmcuanNcbi8vIGFuZCBqUXVlcnktSlNPTlA6XG4vLyAgICBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2pxdWVyeS1qc29ucC9zb3VyY2UvYnJvd3NlL3RydW5rL2NvcmUvanF1ZXJ5Lmpzb25wLmpzXG52YXIganNvblBHZW5lcmljUmVjZWl2ZXIgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHRyZWY7XG4gICAgdmFyIHNjcmlwdCA9IF9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICB2YXIgc2NyaXB0MjsgIC8vIE9wZXJhIHN5bmNocm9ub3VzIGxvYWQgdHJpY2suXG4gICAgdmFyIGNsb3NlX3NjcmlwdCA9IGZ1bmN0aW9uKGZyYW1lKSB7XG4gICAgICAgIGlmIChzY3JpcHQyKSB7XG4gICAgICAgICAgICBzY3JpcHQyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0Mik7XG4gICAgICAgICAgICBzY3JpcHQyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NyaXB0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodHJlZik7XG4gICAgICAgICAgICAvLyBVbmZvcnR1bmF0ZWx5LCB5b3UgY2FuJ3QgcmVhbGx5IGFib3J0IHNjcmlwdCBsb2FkaW5nIG9mXG4gICAgICAgICAgICAvLyB0aGUgc2NyaXB0LlxuICAgICAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBzY3JpcHQub25lcnJvciA9XG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbmNsaWNrID0gbnVsbDtcbiAgICAgICAgICAgIHNjcmlwdCA9IG51bGw7XG4gICAgICAgICAgICBjYWxsYmFjayhmcmFtZSk7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gSUU5IGZpcmVzICdlcnJvcicgZXZlbnQgYWZ0ZXIgb3JzYyBvciBiZWZvcmUsIGluIHJhbmRvbSBvcmRlci5cbiAgICB2YXIgbG9hZGVkX29rYXkgPSBmYWxzZTtcbiAgICB2YXIgZXJyb3JfdGltZXIgPSBudWxsO1xuXG4gICAgc2NyaXB0LmlkID0gJ2EnICsgdXRpbHMucmFuZG9tX3N0cmluZyg4KTtcbiAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgc2NyaXB0LmNoYXJzZXQgPSAnVVRGLTgnO1xuICAgIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWVycm9yX3RpbWVyKSB7XG4gICAgICAgICAgICAvLyBEZWxheSBmaXJpbmcgY2xvc2Vfc2NyaXB0LlxuICAgICAgICAgICAgZXJyb3JfdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICghbG9hZGVkX29rYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2Vfc2NyaXB0KHV0aWxzLmNsb3NlRnJhbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAxMDA2LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJKU09OUCBzY3JpcHQgbG9hZGVkIGFibm9ybWFsbHkgKG9uZXJyb3IpXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2xvc2Vfc2NyaXB0KHV0aWxzLmNsb3NlRnJhbWUoMTAwNiwgXCJKU09OUCBzY3JpcHQgbG9hZGVkIGFibm9ybWFsbHkgKG9ubG9hZClcIikpO1xuICAgIH07XG5cbiAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoL2xvYWRlZHxjbG9zZWQvLnRlc3Qoc2NyaXB0LnJlYWR5U3RhdGUpKSB7XG4gICAgICAgICAgICBpZiAoc2NyaXB0ICYmIHNjcmlwdC5odG1sRm9yICYmIHNjcmlwdC5vbmNsaWNrKSB7XG4gICAgICAgICAgICAgICAgbG9hZGVkX29rYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIElFLCBhY3R1YWxseSBleGVjdXRlIHRoZSBzY3JpcHQuXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdC5vbmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JpcHQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZV9zY3JpcHQodXRpbHMuY2xvc2VGcmFtZSgxMDA2LCBcIkpTT05QIHNjcmlwdCBsb2FkZWQgYWJub3JtYWxseSAob25yZWFkeXN0YXRlY2hhbmdlKVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIElFOiBldmVudC9odG1sRm9yL29uY2xpY2sgdHJpY2suXG4gICAgLy8gT25lIGNhbid0IHJlbHkgb24gcHJvcGVyIG9yZGVyIGZvciBvbnJlYWR5c3RhdGVjaGFuZ2UuIEluIG9yZGVyIHRvXG4gICAgLy8gbWFrZSBzdXJlLCBzZXQgYSAnaHRtbEZvcicgYW5kICdldmVudCcgcHJvcGVydGllcywgc28gdGhhdFxuICAgIC8vIHNjcmlwdCBjb2RlIHdpbGwgYmUgaW5zdGFsbGVkIGFzICdvbmNsaWNrJyBoYW5kbGVyIGZvciB0aGVcbiAgICAvLyBzY3JpcHQgb2JqZWN0LiBMYXRlciwgb25yZWFkeXN0YXRlY2hhbmdlLCBtYW51YWxseSBleGVjdXRlIHRoaXNcbiAgICAvLyBjb2RlLiBGRiBhbmQgQ2hyb21lIGRvZXNuJ3Qgd29yayB3aXRoICdldmVudCcgYW5kICdodG1sRm9yJ1xuICAgIC8vIHNldC4gRm9yIHJlZmVyZW5jZSBzZWU6XG4gICAgLy8gICBodHRwOi8vamF1Ym91cmcubmV0LzIwMTAvMDcvbG9hZGluZy1zY3JpcHQtYXMtb25jbGljay1oYW5kbGVyLW9mLmh0bWxcbiAgICAvLyBBbHNvLCByZWFkIG9uIHRoYXQgYWJvdXQgc2NyaXB0IG9yZGVyaW5nOlxuICAgIC8vICAgaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0R5bmFtaWNfU2NyaXB0X0V4ZWN1dGlvbl9PcmRlclxuICAgIGlmICh0eXBlb2Ygc2NyaXB0LmFzeW5jID09PSAndW5kZWZpbmVkJyAmJiBfZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgLy8gQWNjb3JkaW5nIHRvIG1vemlsbGEgZG9jcywgaW4gcmVjZW50IGJyb3dzZXJzIHNjcmlwdC5hc3luYyBkZWZhdWx0c1xuICAgICAgICAvLyB0byAndHJ1ZScsIHNvIHdlIG1heSB1c2UgaXQgdG8gZGV0ZWN0IGEgZ29vZCBicm93c2VyOlxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9IVE1ML0VsZW1lbnQvc2NyaXB0XG4gICAgICAgIGlmICghL29wZXJhL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuICAgICAgICAgICAgLy8gTmFpdmVseSBhc3N1bWUgd2UncmUgaW4gSUVcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0Lmh0bWxGb3IgPSBzY3JpcHQuaWQ7XG4gICAgICAgICAgICAgICAgc2NyaXB0LmV2ZW50ID0gXCJvbmNsaWNrXCI7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7fVxuICAgICAgICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE9wZXJhLCBzZWNvbmQgc3luYyBzY3JpcHQgaGFja1xuICAgICAgICAgICAgc2NyaXB0MiA9IF9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIHNjcmlwdDIudGV4dCA9IFwidHJ5e3ZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1wiK3NjcmlwdC5pZCtcIicpOyBpZihhKWEub25lcnJvcigpO31jYXRjaCh4KXt9O1wiO1xuICAgICAgICAgICAgc2NyaXB0LmFzeW5jID0gc2NyaXB0Mi5hc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc2NyaXB0LmFzeW5jICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZhbGxiYWNrIG1vc3RseSBmb3IgS29ucXVlcm9yIC0gc3R1cGlkIHRpbWVyLCAzNSBzZWNvbmRzIHNoYWxsIGJlIHBsZW50eS5cbiAgICB0cmVmID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2Vfc2NyaXB0KHV0aWxzLmNsb3NlRnJhbWUoMTAwNiwgXCJKU09OUCBzY3JpcHQgbG9hZGVkIGFibm9ybWFsbHkgKHRpbWVvdXQpXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCAzNTAwMCk7XG5cbiAgICB2YXIgaGVhZCA9IF9kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgIGhlYWQuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaGVhZC5maXJzdENoaWxkKTtcbiAgICBpZiAoc2NyaXB0Mikge1xuICAgICAgICBoZWFkLmluc2VydEJlZm9yZShzY3JpcHQyLCBoZWFkLmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICByZXR1cm4gY2xvc2Vfc2NyaXB0O1xufTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvdHJhbnMtanNvbnAtcmVjZWl2ZXIuanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3RyYW5zLWpzb25wLXBvbGxpbmcuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8vIFRoZSBzaW1wbGVzdCBhbmQgbW9zdCByb2J1c3QgdHJhbnNwb3J0LCB1c2luZyB0aGUgd2VsbC1rbm93IGNyb3NzXG4vLyBkb21haW4gaGFjayAtIEpTT05QLiBUaGlzIHRyYW5zcG9ydCBpcyBxdWl0ZSBpbmVmZmljaWVudCAtIG9uZVxuLy8gbXNzYWdlIGNvdWxkIHVzZSB1cCB0byBvbmUgaHR0cCByZXF1ZXN0LiBCdXQgYXQgbGVhc3QgaXQgd29ya3MgYWxtb3N0XG4vLyBldmVyeXdoZXJlLlxuLy8gS25vd24gbGltaXRhdGlvbnM6XG4vLyAgIG8geW91IHdpbGwgZ2V0IGEgc3Bpbm5pbmcgY3Vyc29yXG4vLyAgIG8gZm9yIEtvbnF1ZXJvciBhIGR1bWIgdGltZXIgaXMgbmVlZGVkIHRvIGRldGVjdCBlcnJvcnNcblxuXG52YXIgSnNvblBUcmFuc3BvcnQgPSBTb2NrSlNbJ2pzb25wLXBvbGxpbmcnXSA9IGZ1bmN0aW9uKHJpLCB0cmFuc191cmwpIHtcbiAgICB1dGlscy5wb2xsdXRlR2xvYmFsTmFtZXNwYWNlKCk7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoYXQucmkgPSByaTtcbiAgICB0aGF0LnRyYW5zX3VybCA9IHRyYW5zX3VybDtcbiAgICB0aGF0LnNlbmRfY29uc3RydWN0b3IoanNvblBHZW5lcmljU2VuZGVyKTtcbiAgICB0aGF0Ll9zY2hlZHVsZV9yZWN2KCk7XG59O1xuXG4vLyBJbmhlcml0bmFjZVxuSnNvblBUcmFuc3BvcnQucHJvdG90eXBlID0gbmV3IEJ1ZmZlcmVkU2VuZGVyKCk7XG5cbkpzb25QVHJhbnNwb3J0LnByb3RvdHlwZS5fc2NoZWR1bGVfcmVjdiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoYXQuX3JlY3Zfc3RvcCA9IG51bGw7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAvLyBubyBkYXRhIC0gaGVhcnRiZWF0O1xuICAgICAgICAgICAgaWYgKCF0aGF0Ll9pc19jbG9zaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5yaS5fZGlkTWVzc2FnZShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUaGUgbWVzc2FnZSBjYW4gYmUgYSBjbG9zZSBtZXNzYWdlLCBhbmQgY2hhbmdlIGlzX2Nsb3Npbmcgc3RhdGUuXG4gICAgICAgIGlmICghdGhhdC5faXNfY2xvc2luZykge1xuICAgICAgICAgICAgdGhhdC5fc2NoZWR1bGVfcmVjdigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGF0Ll9yZWN2X3N0b3AgPSBqc29uUFJlY2VpdmVyV3JhcHBlcih0aGF0LnRyYW5zX3VybCArICcvanNvbnAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25QR2VuZXJpY1JlY2VpdmVyLCBjYWxsYmFjayk7XG59O1xuXG5Kc29uUFRyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5Kc29uUFRyYW5zcG9ydC5uZWVkX2JvZHkgPSB0cnVlO1xuXG5cbkpzb25QVHJhbnNwb3J0LnByb3RvdHlwZS5kb0NsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5faXNfY2xvc2luZyA9IHRydWU7XG4gICAgaWYgKHRoYXQuX3JlY3Zfc3RvcCkge1xuICAgICAgICB0aGF0Ll9yZWN2X3N0b3AoKTtcbiAgICB9XG4gICAgdGhhdC5yaSA9IHRoYXQuX3JlY3Zfc3RvcCA9IG51bGw7XG4gICAgdGhhdC5zZW5kX2Rlc3RydWN0b3IoKTtcbn07XG5cblxuLy8gQWJzdHJhY3QgYXdheSBjb2RlIHRoYXQgaGFuZGxlcyBnbG9iYWwgbmFtZXNwYWNlIHBvbGx1dGlvbi5cbnZhciBqc29uUFJlY2VpdmVyV3JhcHBlciA9IGZ1bmN0aW9uKHVybCwgY29uc3RydWN0UmVjZWl2ZXIsIHVzZXJfY2FsbGJhY2spIHtcbiAgICB2YXIgaWQgPSAnYScgKyB1dGlscy5yYW5kb21fc3RyaW5nKDYpO1xuICAgIHZhciB1cmxfaWQgPSB1cmwgKyAnP2M9JyArIGVzY2FwZShXUHJlZml4ICsgJy4nICsgaWQpO1xuXG4gICAgLy8gVW5mb3J0dW5hdGVseSBpdCBpcyBub3QgcG9zc2libGUgdG8gYWJvcnQgbG9hZGluZyBvZiB0aGVcbiAgICAvLyBzY3JpcHQuIFdlIG5lZWQgdG8ga2VlcCB0cmFjayBvZiBmcmFrZSBjbG9zZSBmcmFtZXMuXG4gICAgdmFyIGFib3J0aW5nID0gMDtcblxuICAgIC8vIENhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIGV4YWN0bHkgb25jZS5cbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihmcmFtZSkge1xuICAgICAgICBzd2l0Y2goYWJvcnRpbmcpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgLy8gTm9ybWFsIGJlaGF2aW91ciAtIGRlbGV0ZSBob29rIF9hbmRfIGVtaXQgbWVzc2FnZS5cbiAgICAgICAgICAgIGRlbGV0ZSBfd2luZG93W1dQcmVmaXhdW2lkXTtcbiAgICAgICAgICAgIHVzZXJfY2FsbGJhY2soZnJhbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIC8vIEZha2UgY2xvc2UgZnJhbWUgLSBlbWl0IGJ1dCBkb24ndCBkZWxldGUgaG9vay5cbiAgICAgICAgICAgIHVzZXJfY2FsbGJhY2soZnJhbWUpO1xuICAgICAgICAgICAgYWJvcnRpbmcgPSAyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIC8vIEdvdCBmcmFtZSBhZnRlciBjb25uZWN0aW9uIHdhcyBjbG9zZWQsIGRlbGV0ZSBob29rLCBkb24ndCBlbWl0LlxuICAgICAgICAgICAgZGVsZXRlIF93aW5kb3dbV1ByZWZpeF1baWRdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNsb3NlX3NjcmlwdCA9IGNvbnN0cnVjdFJlY2VpdmVyKHVybF9pZCwgY2FsbGJhY2spO1xuICAgIF93aW5kb3dbV1ByZWZpeF1baWRdID0gY2xvc2Vfc2NyaXB0O1xuICAgIHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfd2luZG93W1dQcmVmaXhdW2lkXSkge1xuICAgICAgICAgICAgYWJvcnRpbmcgPSAxO1xuICAgICAgICAgICAgX3dpbmRvd1tXUHJlZml4XVtpZF0odXRpbHMuY2xvc2VGcmFtZSgxMDAwLCBcIkpTT05QIHVzZXIgYWJvcnRlZCByZWFkXCIpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHN0b3A7XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi90cmFucy1qc29ucC1wb2xsaW5nLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi90cmFucy14aHIuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbnZhciBBamF4QmFzZWRUcmFuc3BvcnQgPSBmdW5jdGlvbigpIHt9O1xuQWpheEJhc2VkVHJhbnNwb3J0LnByb3RvdHlwZSA9IG5ldyBCdWZmZXJlZFNlbmRlcigpO1xuXG5BamF4QmFzZWRUcmFuc3BvcnQucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKHJpLCB0cmFuc191cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybF9zdWZmaXgsIFJlY2VpdmVyLCBBamF4T2JqZWN0KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoYXQucmkgPSByaTtcbiAgICB0aGF0LnRyYW5zX3VybCA9IHRyYW5zX3VybDtcbiAgICB0aGF0LnNlbmRfY29uc3RydWN0b3IoY3JlYXRlQWpheFNlbmRlcihBamF4T2JqZWN0KSk7XG4gICAgdGhhdC5wb2xsID0gbmV3IFBvbGxpbmcocmksIFJlY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zX3VybCArIHVybF9zdWZmaXgsIEFqYXhPYmplY3QpO1xufTtcblxuQWpheEJhc2VkVHJhbnNwb3J0LnByb3RvdHlwZS5kb0NsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKHRoYXQucG9sbCkge1xuICAgICAgICB0aGF0LnBvbGwuYWJvcnQoKTtcbiAgICAgICAgdGhhdC5wb2xsID0gbnVsbDtcbiAgICB9XG59O1xuXG4vLyB4aHItc3RyZWFtaW5nXG52YXIgWGhyU3RyZWFtaW5nVHJhbnNwb3J0ID0gU29ja0pTWyd4aHItc3RyZWFtaW5nJ10gPSBmdW5jdGlvbihyaSwgdHJhbnNfdXJsKSB7XG4gICAgdGhpcy5ydW4ocmksIHRyYW5zX3VybCwgJy94aHJfc3RyZWFtaW5nJywgWGhyUmVjZWl2ZXIsIHV0aWxzLlhIUkNvcnNPYmplY3QpO1xufTtcblxuWGhyU3RyZWFtaW5nVHJhbnNwb3J0LnByb3RvdHlwZSA9IG5ldyBBamF4QmFzZWRUcmFuc3BvcnQoKTtcblxuWGhyU3RyZWFtaW5nVHJhbnNwb3J0LmVuYWJsZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBTdXBwb3J0IGZvciBDT1JTIEFqYXggYWthIEFqYXgyPyBPcGVyYSAxMiBjbGFpbXMgQ09SUyBidXRcbiAgICAvLyBkb2Vzbid0IGRvIHN0cmVhbWluZy5cbiAgICByZXR1cm4gKF93aW5kb3cuWE1MSHR0cFJlcXVlc3QgJiZcbiAgICAgICAgICAgICd3aXRoQ3JlZGVudGlhbHMnIGluIG5ldyBYTUxIdHRwUmVxdWVzdCgpICYmXG4gICAgICAgICAgICAoIS9vcGVyYS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpKTtcbn07XG5YaHJTdHJlYW1pbmdUcmFuc3BvcnQucm91bmRUcmlwcyA9IDI7IC8vIHByZWZsaWdodCwgYWpheFxuXG4vLyBTYWZhcmkgZ2V0cyBjb25mdXNlZCB3aGVuIGEgc3RyZWFtaW5nIGFqYXggcmVxdWVzdCBpcyBzdGFydGVkXG4vLyBiZWZvcmUgb25sb2FkLiBUaGlzIGNhdXNlcyB0aGUgbG9hZCBpbmRpY2F0b3IgdG8gc3BpbiBpbmRlZmluZXRlbHkuXG5YaHJTdHJlYW1pbmdUcmFuc3BvcnQubmVlZF9ib2R5ID0gdHJ1ZTtcblxuXG4vLyBBY2NvcmRpbmcgdG86XG4vLyAgIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTY0MTUwNy9kZXRlY3QtYnJvd3Nlci1zdXBwb3J0LWZvci1jcm9zcy1kb21haW4teG1saHR0cHJlcXVlc3RzXG4vLyAgIGh0dHA6Ly9oYWNrcy5tb3ppbGxhLm9yZy8yMDA5LzA3L2Nyb3NzLXNpdGUteG1saHR0cHJlcXVlc3Qtd2l0aC1jb3JzL1xuXG5cbi8vIHhkci1zdHJlYW1pbmdcbnZhciBYZHJTdHJlYW1pbmdUcmFuc3BvcnQgPSBTb2NrSlNbJ3hkci1zdHJlYW1pbmcnXSA9IGZ1bmN0aW9uKHJpLCB0cmFuc191cmwpIHtcbiAgICB0aGlzLnJ1bihyaSwgdHJhbnNfdXJsLCAnL3hocl9zdHJlYW1pbmcnLCBYaHJSZWNlaXZlciwgdXRpbHMuWERST2JqZWN0KTtcbn07XG5cblhkclN0cmVhbWluZ1RyYW5zcG9ydC5wcm90b3R5cGUgPSBuZXcgQWpheEJhc2VkVHJhbnNwb3J0KCk7XG5cblhkclN0cmVhbWluZ1RyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICEhX3dpbmRvdy5YRG9tYWluUmVxdWVzdDtcbn07XG5YZHJTdHJlYW1pbmdUcmFuc3BvcnQucm91bmRUcmlwcyA9IDI7IC8vIHByZWZsaWdodCwgYWpheFxuXG5cblxuLy8geGhyLXBvbGxpbmdcbnZhciBYaHJQb2xsaW5nVHJhbnNwb3J0ID0gU29ja0pTWyd4aHItcG9sbGluZyddID0gZnVuY3Rpb24ocmksIHRyYW5zX3VybCkge1xuICAgIHRoaXMucnVuKHJpLCB0cmFuc191cmwsICcveGhyJywgWGhyUmVjZWl2ZXIsIHV0aWxzLlhIUkNvcnNPYmplY3QpO1xufTtcblxuWGhyUG9sbGluZ1RyYW5zcG9ydC5wcm90b3R5cGUgPSBuZXcgQWpheEJhc2VkVHJhbnNwb3J0KCk7XG5cblhoclBvbGxpbmdUcmFuc3BvcnQuZW5hYmxlZCA9IFhoclN0cmVhbWluZ1RyYW5zcG9ydC5lbmFibGVkO1xuWGhyUG9sbGluZ1RyYW5zcG9ydC5yb3VuZFRyaXBzID0gMjsgLy8gcHJlZmxpZ2h0LCBhamF4XG5cblxuLy8geGRyLXBvbGxpbmdcbnZhciBYZHJQb2xsaW5nVHJhbnNwb3J0ID0gU29ja0pTWyd4ZHItcG9sbGluZyddID0gZnVuY3Rpb24ocmksIHRyYW5zX3VybCkge1xuICAgIHRoaXMucnVuKHJpLCB0cmFuc191cmwsICcveGhyJywgWGhyUmVjZWl2ZXIsIHV0aWxzLlhEUk9iamVjdCk7XG59O1xuXG5YZHJQb2xsaW5nVHJhbnNwb3J0LnByb3RvdHlwZSA9IG5ldyBBamF4QmFzZWRUcmFuc3BvcnQoKTtcblxuWGRyUG9sbGluZ1RyYW5zcG9ydC5lbmFibGVkID0gWGRyU3RyZWFtaW5nVHJhbnNwb3J0LmVuYWJsZWQ7XG5YZHJQb2xsaW5nVHJhbnNwb3J0LnJvdW5kVHJpcHMgPSAyOyAvLyBwcmVmbGlnaHQsIGFqYXhcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvdHJhbnMteGhyLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi90cmFucy1pZnJhbWUuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8vIEZldyBjb29sIHRyYW5zcG9ydHMgZG8gd29yayBvbmx5IGZvciBzYW1lLW9yaWdpbi4gSW4gb3JkZXIgdG8gbWFrZVxuLy8gdGhlbSB3b3JraW5nIGNyb3NzLWRvbWFpbiB3ZSBzaGFsbCB1c2UgaWZyYW1lLCBzZXJ2ZWQgZm9ybSB0aGVcbi8vIHJlbW90ZSBkb21haW4uIE5ldyBicm93c2VycywgaGF2ZSBjYXBhYmlsaXRpZXMgdG8gY29tbXVuaWNhdGUgd2l0aFxuLy8gY3Jvc3MgZG9tYWluIGlmcmFtZSwgdXNpbmcgcG9zdE1lc3NhZ2UoKS4gSW4gSUUgaXQgd2FzIGltcGxlbWVudGVkXG4vLyBmcm9tIElFIDgrLCBidXQgb2YgY291cnNlLCBJRSBnb3Qgc29tZSBkZXRhaWxzIHdyb25nOlxuLy8gICAgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2NjMTk3MDE1KHY9VlMuODUpLmFzcHhcbi8vICAgIGh0dHA6Ly9zdGV2ZXNvdWRlcnMuY29tL21pc2MvdGVzdC1wb3N0bWVzc2FnZS5waHBcblxudmFyIElmcmFtZVRyYW5zcG9ydCA9IGZ1bmN0aW9uKCkge307XG5cbklmcmFtZVRyYW5zcG9ydC5wcm90b3R5cGUuaV9jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKHJpLCB0cmFuc191cmwsIGJhc2VfdXJsKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoYXQucmkgPSByaTtcbiAgICB0aGF0Lm9yaWdpbiA9IHV0aWxzLmdldE9yaWdpbihiYXNlX3VybCk7XG4gICAgdGhhdC5iYXNlX3VybCA9IGJhc2VfdXJsO1xuICAgIHRoYXQudHJhbnNfdXJsID0gdHJhbnNfdXJsO1xuXG4gICAgdmFyIGlmcmFtZV91cmwgPSBiYXNlX3VybCArICcvaWZyYW1lLmh0bWwnO1xuICAgIGlmICh0aGF0LnJpLl9vcHRpb25zLmRldmVsKSB7XG4gICAgICAgIGlmcmFtZV91cmwgKz0gJz90PScgKyAoK25ldyBEYXRlKTtcbiAgICB9XG4gICAgdGhhdC53aW5kb3dfaWQgPSB1dGlscy5yYW5kb21fc3RyaW5nKDgpO1xuICAgIGlmcmFtZV91cmwgKz0gJyMnICsgdGhhdC53aW5kb3dfaWQ7XG5cbiAgICB0aGF0LmlmcmFtZU9iaiA9IHV0aWxzLmNyZWF0ZUlmcmFtZShpZnJhbWVfdXJsLCBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucmkuX2RpZENsb3NlKDEwMDYsIFwiVW5hYmxlIHRvIGxvYWQgYW4gaWZyYW1lIChcIiArIHIgKyBcIilcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICB0aGF0Lm9ubWVzc2FnZV9jYiA9IHV0aWxzLmJpbmQodGhhdC5vbm1lc3NhZ2UsIHRoYXQpO1xuICAgIHV0aWxzLmF0dGFjaE1lc3NhZ2UodGhhdC5vbm1lc3NhZ2VfY2IpO1xufTtcblxuSWZyYW1lVHJhbnNwb3J0LnByb3RvdHlwZS5kb0NsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKHRoYXQuaWZyYW1lT2JqKSB7XG4gICAgICAgIHV0aWxzLmRldGFjaE1lc3NhZ2UodGhhdC5vbm1lc3NhZ2VfY2IpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB0aGUgaWZyYW1lIGlzIG5vdCBsb2FkZWQsIElFIHJhaXNlcyBhbiBleGNlcHRpb25cbiAgICAgICAgICAgIC8vIG9uICdjb250ZW50V2luZG93Jy5cbiAgICAgICAgICAgIGlmICh0aGF0LmlmcmFtZU9iai5pZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICAgIHRoYXQucG9zdE1lc3NhZ2UoJ2MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoeCkge31cbiAgICAgICAgdGhhdC5pZnJhbWVPYmouY2xlYW51cCgpO1xuICAgICAgICB0aGF0LmlmcmFtZU9iaiA9IG51bGw7XG4gICAgICAgIHRoYXQub25tZXNzYWdlX2NiID0gdGhhdC5pZnJhbWVPYmogPSBudWxsO1xuICAgIH1cbn07XG5cbklmcmFtZVRyYW5zcG9ydC5wcm90b3R5cGUub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAoZS5vcmlnaW4gIT09IHRoYXQub3JpZ2luKSByZXR1cm47XG4gICAgdmFyIHdpbmRvd19pZCA9IGUuZGF0YS5zbGljZSgwLCA4KTtcbiAgICB2YXIgdHlwZSA9IGUuZGF0YS5zbGljZSg4LCA5KTtcbiAgICB2YXIgZGF0YSA9IGUuZGF0YS5zbGljZSg5KTtcblxuICAgIGlmICh3aW5kb3dfaWQgIT09IHRoYXQud2luZG93X2lkKSByZXR1cm47XG5cbiAgICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgJ3MnOlxuICAgICAgICB0aGF0LmlmcmFtZU9iai5sb2FkZWQoKTtcbiAgICAgICAgdGhhdC5wb3N0TWVzc2FnZSgncycsIEpTT04uc3RyaW5naWZ5KFtTb2NrSlMudmVyc2lvbiwgdGhhdC5wcm90b2NvbCwgdGhhdC50cmFuc191cmwsIHRoYXQuYmFzZV91cmxdKSk7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3QnOlxuICAgICAgICB0aGF0LnJpLl9kaWRNZXNzYWdlKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5JZnJhbWVUcmFuc3BvcnQucHJvdG90eXBlLnBvc3RNZXNzYWdlID0gZnVuY3Rpb24odHlwZSwgZGF0YSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB0aGF0LmlmcmFtZU9iai5wb3N0KHRoYXQud2luZG93X2lkICsgdHlwZSArIChkYXRhIHx8ICcnKSwgdGhhdC5vcmlnaW4pO1xufTtcblxuSWZyYW1lVHJhbnNwb3J0LnByb3RvdHlwZS5kb1NlbmQgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIHRoaXMucG9zdE1lc3NhZ2UoJ20nLCBtZXNzYWdlKTtcbn07XG5cbklmcmFtZVRyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gcG9zdE1lc3NhZ2UgbWlzYmVoYXZlcyBpbiBrb25xdWVyb3IgNC42LjUgLSB0aGUgbWVzc2FnZXMgYXJlIGRlbGl2ZXJlZCB3aXRoXG4gICAgLy8gaHVnZSBkZWxheSwgb3Igbm90IGF0IGFsbC5cbiAgICB2YXIga29ucXVlcm9yID0gbmF2aWdhdG9yICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdLb25xdWVyb3InKSAhPT0gLTE7XG4gICAgcmV0dXJuICgodHlwZW9mIF93aW5kb3cucG9zdE1lc3NhZ2UgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgICAgIHR5cGVvZiBfd2luZG93LnBvc3RNZXNzYWdlID09PSAnb2JqZWN0JykgJiYgKCFrb25xdWVyb3IpKTtcbn07XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL3RyYW5zLWlmcmFtZS5qc1xuXG5cbi8vICAgICAgICAgWypdIEluY2x1ZGluZyBsaWIvdHJhbnMtaWZyYW1lLXdpdGhpbi5qc1xuLypcbiAqICoqKioqIEJFR0lOIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyIFZNd2FyZSwgSW5jLlxuICpcbiAqIEZvciB0aGUgbGljZW5zZSBzZWUgQ09QWUlORy5cbiAqICoqKioqIEVORCBMSUNFTlNFIEJMT0NLICoqKioqXG4gKi9cblxudmFyIGN1cnJfd2luZG93X2lkO1xuXG52YXIgcG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAodHlwZSwgZGF0YSkge1xuICAgIGlmKHBhcmVudCAhPT0gX3dpbmRvdykge1xuICAgICAgICBwYXJlbnQucG9zdE1lc3NhZ2UoY3Vycl93aW5kb3dfaWQgKyB0eXBlICsgKGRhdGEgfHwgJycpLCAnKicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHV0aWxzLmxvZyhcIkNhbid0IHBvc3RNZXNzYWdlLCBubyBwYXJlbnQgd2luZG93LlwiLCB0eXBlLCBkYXRhKTtcbiAgICB9XG59O1xuXG52YXIgRmFjYWRlSlMgPSBmdW5jdGlvbigpIHt9O1xuRmFjYWRlSlMucHJvdG90eXBlLl9kaWRDbG9zZSA9IGZ1bmN0aW9uIChjb2RlLCByZWFzb24pIHtcbiAgICBwb3N0TWVzc2FnZSgndCcsIHV0aWxzLmNsb3NlRnJhbWUoY29kZSwgcmVhc29uKSk7XG59O1xuRmFjYWRlSlMucHJvdG90eXBlLl9kaWRNZXNzYWdlID0gZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgcG9zdE1lc3NhZ2UoJ3QnLCBmcmFtZSk7XG59O1xuRmFjYWRlSlMucHJvdG90eXBlLl9kb1NlbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuX3RyYW5zcG9ydC5kb1NlbmQoZGF0YSk7XG59O1xuRmFjYWRlSlMucHJvdG90eXBlLl9kb0NsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fdHJhbnNwb3J0LmRvQ2xlYW51cCgpO1xufTtcblxudXRpbHMucGFyZW50X29yaWdpbiA9IHVuZGVmaW5lZDtcblxuU29ja0pTLmJvb3RzdHJhcF9pZnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmFjYWRlO1xuICAgIGN1cnJfd2luZG93X2lkID0gX2RvY3VtZW50LmxvY2F0aW9uLmhhc2guc2xpY2UoMSk7XG4gICAgdmFyIG9uTWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYoZS5zb3VyY2UgIT09IHBhcmVudCkgcmV0dXJuO1xuICAgICAgICBpZih0eXBlb2YgdXRpbHMucGFyZW50X29yaWdpbiA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICB1dGlscy5wYXJlbnRfb3JpZ2luID0gZS5vcmlnaW47XG4gICAgICAgIGlmIChlLm9yaWdpbiAhPT0gdXRpbHMucGFyZW50X29yaWdpbikgcmV0dXJuO1xuXG4gICAgICAgIHZhciB3aW5kb3dfaWQgPSBlLmRhdGEuc2xpY2UoMCwgOCk7XG4gICAgICAgIHZhciB0eXBlID0gZS5kYXRhLnNsaWNlKDgsIDkpO1xuICAgICAgICB2YXIgZGF0YSA9IGUuZGF0YS5zbGljZSg5KTtcbiAgICAgICAgaWYgKHdpbmRvd19pZCAhPT0gY3Vycl93aW5kb3dfaWQpIHJldHVybjtcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICB2YXIgcCA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICB2YXIgdmVyc2lvbiA9IHBbMF07XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBwWzFdO1xuICAgICAgICAgICAgdmFyIHRyYW5zX3VybCA9IHBbMl07XG4gICAgICAgICAgICB2YXIgYmFzZV91cmwgPSBwWzNdO1xuICAgICAgICAgICAgaWYgKHZlcnNpb24gIT09IFNvY2tKUy52ZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgdXRpbHMubG9nKFwiSW5jb21wYXRpYmlsZSBTb2NrSlMhIE1haW4gc2l0ZSB1c2VzOlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgXFxcIlwiICsgdmVyc2lvbiArIFwiXFxcIiwgdGhlIGlmcmFtZTpcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiIFxcXCJcIiArIFNvY2tKUy52ZXJzaW9uICsgXCJcXFwiLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdXRpbHMuZmxhdFVybCh0cmFuc191cmwpIHx8ICF1dGlscy5mbGF0VXJsKGJhc2VfdXJsKSkge1xuICAgICAgICAgICAgICAgIHV0aWxzLmxvZyhcIk9ubHkgYmFzaWMgdXJscyBhcmUgc3VwcG9ydGVkIGluIFNvY2tKU1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdXRpbHMuaXNTYW1lT3JpZ2luVXJsKHRyYW5zX3VybCkgfHxcbiAgICAgICAgICAgICAgICAhdXRpbHMuaXNTYW1lT3JpZ2luVXJsKGJhc2VfdXJsKSkge1xuICAgICAgICAgICAgICAgIHV0aWxzLmxvZyhcIkNhbid0IGNvbm5lY3QgdG8gZGlmZmVyZW50IGRvbWFpbiBmcm9tIHdpdGhpbiBhbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWZyYW1lLiAoXCIgKyBKU09OLnN0cmluZ2lmeShbX3dpbmRvdy5sb2NhdGlvbi5ocmVmLCB0cmFuc191cmwsIGJhc2VfdXJsXSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcIilcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmFjYWRlID0gbmV3IEZhY2FkZUpTKCk7XG4gICAgICAgICAgICBmYWNhZGUuX3RyYW5zcG9ydCA9IG5ldyBGYWNhZGVKU1twcm90b2NvbF0oZmFjYWRlLCB0cmFuc191cmwsIGJhc2VfdXJsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIGZhY2FkZS5fZG9TZW5kKGRhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2MnOlxuICAgICAgICAgICAgaWYgKGZhY2FkZSlcbiAgICAgICAgICAgICAgICBmYWNhZGUuX2RvQ2xlYW51cCgpO1xuICAgICAgICAgICAgZmFjYWRlID0gbnVsbDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGFsZXJ0KCd0ZXN0IHRpY2tlcicpO1xuICAgIC8vIGZhY2FkZSA9IG5ldyBGYWNhZGVKUygpO1xuICAgIC8vIGZhY2FkZS5fdHJhbnNwb3J0ID0gbmV3IEZhY2FkZUpTWyd3LWlmcmFtZS14aHItcG9sbGluZyddKGZhY2FkZSwgJ2h0dHA6Ly9ob3N0LmNvbTo5OTk5L3RpY2tlci8xMi9iYXNkJyk7XG5cbiAgICB1dGlscy5hdHRhY2hNZXNzYWdlKG9uTWVzc2FnZSk7XG5cbiAgICAvLyBTdGFydFxuICAgIHBvc3RNZXNzYWdlKCdzJyk7XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi90cmFucy1pZnJhbWUtd2l0aGluLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi9pbmZvLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgSW5mb1JlY2VpdmVyID0gZnVuY3Rpb24oYmFzZV91cmwsIEFqYXhPYmplY3QpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdXRpbHMuZGVsYXkoZnVuY3Rpb24oKXt0aGF0LmRvWGhyKGJhc2VfdXJsLCBBamF4T2JqZWN0KTt9KTtcbn07XG5cbkluZm9SZWNlaXZlci5wcm90b3R5cGUgPSBuZXcgRXZlbnRFbWl0dGVyKFsnZmluaXNoJ10pO1xuXG5JbmZvUmVjZWl2ZXIucHJvdG90eXBlLmRvWGhyID0gZnVuY3Rpb24oYmFzZV91cmwsIEFqYXhPYmplY3QpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHQwID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICB2YXIgeG8gPSBuZXcgQWpheE9iamVjdCgnR0VUJywgYmFzZV91cmwgKyAnL2luZm8nKTtcblxuICAgIHZhciB0cmVmID0gdXRpbHMuZGVsYXkoODAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCl7eG8ub250aW1lb3V0KCk7fSk7XG5cbiAgICB4by5vbmZpbmlzaCA9IGZ1bmN0aW9uKHN0YXR1cywgdGV4dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodHJlZik7XG4gICAgICAgIHRyZWYgPSBudWxsO1xuICAgICAgICBpZiAoc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHZhciBydHQgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gdDA7XG4gICAgICAgICAgICB2YXIgaW5mbyA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZm8gIT09ICdvYmplY3QnKSBpbmZvID0ge307XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ2ZpbmlzaCcsIGluZm8sIHJ0dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGF0LmVtaXQoJ2ZpbmlzaCcpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB4by5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgeG8uY2xvc2UoKTtcbiAgICAgICAgdGhhdC5lbWl0KCdmaW5pc2gnKTtcbiAgICB9O1xufTtcblxudmFyIEluZm9SZWNlaXZlcklmcmFtZSA9IGZ1bmN0aW9uKGJhc2VfdXJsKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBnbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaWZyID0gbmV3IElmcmFtZVRyYW5zcG9ydCgpO1xuICAgICAgICBpZnIucHJvdG9jb2wgPSAndy1pZnJhbWUtaW5mby1yZWNlaXZlcic7XG4gICAgICAgIHZhciBmdW4gPSBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIgPT09ICdzdHJpbmcnICYmIHIuc3Vic3RyKDAsMSkgPT09ICdtJykge1xuICAgICAgICAgICAgICAgIHZhciBkID0gSlNPTi5wYXJzZShyLnN1YnN0cigxKSk7XG4gICAgICAgICAgICAgICAgdmFyIGluZm8gPSBkWzBdLCBydHQgPSBkWzFdO1xuICAgICAgICAgICAgICAgIHRoYXQuZW1pdCgnZmluaXNoJywgaW5mbywgcnR0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbWl0KCdmaW5pc2gnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmci5kb0NsZWFudXAoKTtcbiAgICAgICAgICAgIGlmciA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBtb2NrX3JpID0ge1xuICAgICAgICAgICAgX29wdGlvbnM6IHt9LFxuICAgICAgICAgICAgX2RpZENsb3NlOiBmdW4sXG4gICAgICAgICAgICBfZGlkTWVzc2FnZTogZnVuXG4gICAgICAgIH07XG4gICAgICAgIGlmci5pX2NvbnN0cnVjdG9yKG1vY2tfcmksIGJhc2VfdXJsLCBiYXNlX3VybCk7XG4gICAgfVxuICAgIGlmKCFfZG9jdW1lbnQuYm9keSkge1xuICAgICAgICB1dGlscy5hdHRhY2hFdmVudCgnbG9hZCcsIGdvKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbn07XG5JbmZvUmVjZWl2ZXJJZnJhbWUucHJvdG90eXBlID0gbmV3IEV2ZW50RW1pdHRlcihbJ2ZpbmlzaCddKTtcblxuXG52YXIgSW5mb1JlY2VpdmVyRmFrZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEl0IG1heSBub3QgYmUgcG9zc2libGUgdG8gZG8gY3Jvc3MgZG9tYWluIEFKQVggdG8gZ2V0IHRoZSBpbmZvXG4gICAgLy8gZGF0YSwgZm9yIGV4YW1wbGUgZm9yIElFNy4gQnV0IHdlIHdhbnQgdG8gcnVuIEpTT05QLCBzbyBsZXQnc1xuICAgIC8vIGZha2UgdGhlIHJlc3BvbnNlLCB3aXRoIHJ0dD0ycyAocnRvPTZzKS5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdXRpbHMuZGVsYXkoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoYXQuZW1pdCgnZmluaXNoJywge30sIDIwMDApO1xuICAgIH0pO1xufTtcbkluZm9SZWNlaXZlckZha2UucHJvdG90eXBlID0gbmV3IEV2ZW50RW1pdHRlcihbJ2ZpbmlzaCddKTtcblxudmFyIGNyZWF0ZUluZm9SZWNlaXZlciA9IGZ1bmN0aW9uKGJhc2VfdXJsKSB7XG4gICAgaWYgKHV0aWxzLmlzU2FtZU9yaWdpblVybChiYXNlX3VybCkpIHtcbiAgICAgICAgLy8gSWYsIGZvciBzb21lIHJlYXNvbiwgd2UgaGF2ZSBTb2NrSlMgbG9jYWxseSAtIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gbmVlZCB0byBzdGFydCB1cCB0aGUgY29tcGxleCBtYWNoaW5lcnkuIEp1c3QgdXNlIGFqYXguXG4gICAgICAgIHJldHVybiBuZXcgSW5mb1JlY2VpdmVyKGJhc2VfdXJsLCB1dGlscy5YSFJMb2NhbE9iamVjdCk7XG4gICAgfVxuICAgIHN3aXRjaCAodXRpbHMuaXNYSFJDb3JzQ2FwYWJsZSgpKSB7XG4gICAgY2FzZSAxOlxuICAgICAgICAvLyBYSFJMb2NhbE9iamVjdCAtPiBub19jcmVkZW50aWFscz10cnVlXG4gICAgICAgIHJldHVybiBuZXcgSW5mb1JlY2VpdmVyKGJhc2VfdXJsLCB1dGlscy5YSFJMb2NhbE9iamVjdCk7XG4gICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gbmV3IEluZm9SZWNlaXZlcihiYXNlX3VybCwgdXRpbHMuWERST2JqZWN0KTtcbiAgICBjYXNlIDM6XG4gICAgICAgIC8vIE9wZXJhXG4gICAgICAgIHJldHVybiBuZXcgSW5mb1JlY2VpdmVySWZyYW1lKGJhc2VfdXJsKTtcbiAgICBkZWZhdWx0OlxuICAgICAgICAvLyBJRSA3XG4gICAgICAgIHJldHVybiBuZXcgSW5mb1JlY2VpdmVyRmFrZSgpO1xuICAgIH07XG59O1xuXG5cbnZhciBXSW5mb1JlY2VpdmVySWZyYW1lID0gRmFjYWRlSlNbJ3ctaWZyYW1lLWluZm8tcmVjZWl2ZXInXSA9IGZ1bmN0aW9uKHJpLCBfdHJhbnNfdXJsLCBiYXNlX3VybCkge1xuICAgIHZhciBpciA9IG5ldyBJbmZvUmVjZWl2ZXIoYmFzZV91cmwsIHV0aWxzLlhIUkxvY2FsT2JqZWN0KTtcbiAgICBpci5vbmZpbmlzaCA9IGZ1bmN0aW9uKGluZm8sIHJ0dCkge1xuICAgICAgICByaS5fZGlkTWVzc2FnZSgnbScrSlNPTi5zdHJpbmdpZnkoW2luZm8sIHJ0dF0pKTtcbiAgICAgICAgcmkuX2RpZENsb3NlKCk7XG4gICAgfVxufTtcbldJbmZvUmVjZWl2ZXJJZnJhbWUucHJvdG90eXBlLmRvQ2xlYW51cCA9IGZ1bmN0aW9uKCkge307XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL2luZm8uanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3RyYW5zLWlmcmFtZS1ldmVudHNvdXJjZS5qc1xuLypcbiAqICoqKioqIEJFR0lOIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyIFZNd2FyZSwgSW5jLlxuICpcbiAqIEZvciB0aGUgbGljZW5zZSBzZWUgQ09QWUlORy5cbiAqICoqKioqIEVORCBMSUNFTlNFIEJMT0NLICoqKioqXG4gKi9cblxudmFyIEV2ZW50U291cmNlSWZyYW1lVHJhbnNwb3J0ID0gU29ja0pTWydpZnJhbWUtZXZlbnRzb3VyY2UnXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5wcm90b2NvbCA9ICd3LWlmcmFtZS1ldmVudHNvdXJjZSc7XG4gICAgdGhhdC5pX2NvbnN0cnVjdG9yLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG59O1xuXG5FdmVudFNvdXJjZUlmcmFtZVRyYW5zcG9ydC5wcm90b3R5cGUgPSBuZXcgSWZyYW1lVHJhbnNwb3J0KCk7XG5cbkV2ZW50U291cmNlSWZyYW1lVHJhbnNwb3J0LmVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICgnRXZlbnRTb3VyY2UnIGluIF93aW5kb3cpICYmIElmcmFtZVRyYW5zcG9ydC5lbmFibGVkKCk7XG59O1xuXG5FdmVudFNvdXJjZUlmcmFtZVRyYW5zcG9ydC5uZWVkX2JvZHkgPSB0cnVlO1xuRXZlbnRTb3VyY2VJZnJhbWVUcmFuc3BvcnQucm91bmRUcmlwcyA9IDM7IC8vIGh0bWwsIGphdmFzY3JpcHQsIGV2ZW50c291cmNlXG5cblxuLy8gdy1pZnJhbWUtZXZlbnRzb3VyY2VcbnZhciBFdmVudFNvdXJjZVRyYW5zcG9ydCA9IEZhY2FkZUpTWyd3LWlmcmFtZS1ldmVudHNvdXJjZSddID0gZnVuY3Rpb24ocmksIHRyYW5zX3VybCkge1xuICAgIHRoaXMucnVuKHJpLCB0cmFuc191cmwsICcvZXZlbnRzb3VyY2UnLCBFdmVudFNvdXJjZVJlY2VpdmVyLCB1dGlscy5YSFJMb2NhbE9iamVjdCk7XG59XG5FdmVudFNvdXJjZVRyYW5zcG9ydC5wcm90b3R5cGUgPSBuZXcgQWpheEJhc2VkVHJhbnNwb3J0KCk7XG4vLyAgICAgICAgIFsqXSBFbmQgb2YgbGliL3RyYW5zLWlmcmFtZS1ldmVudHNvdXJjZS5qc1xuXG5cbi8vICAgICAgICAgWypdIEluY2x1ZGluZyBsaWIvdHJhbnMtaWZyYW1lLXhoci1wb2xsaW5nLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgWGhyUG9sbGluZ0lmcmFtZVRyYW5zcG9ydCA9IFNvY2tKU1snaWZyYW1lLXhoci1wb2xsaW5nJ10gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoYXQucHJvdG9jb2wgPSAndy1pZnJhbWUteGhyLXBvbGxpbmcnO1xuICAgIHRoYXQuaV9jb25zdHJ1Y3Rvci5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xufTtcblxuWGhyUG9sbGluZ0lmcmFtZVRyYW5zcG9ydC5wcm90b3R5cGUgPSBuZXcgSWZyYW1lVHJhbnNwb3J0KCk7XG5cblhoclBvbGxpbmdJZnJhbWVUcmFuc3BvcnQuZW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX3dpbmRvdy5YTUxIdHRwUmVxdWVzdCAmJiBJZnJhbWVUcmFuc3BvcnQuZW5hYmxlZCgpO1xufTtcblxuWGhyUG9sbGluZ0lmcmFtZVRyYW5zcG9ydC5uZWVkX2JvZHkgPSB0cnVlO1xuWGhyUG9sbGluZ0lmcmFtZVRyYW5zcG9ydC5yb3VuZFRyaXBzID0gMzsgLy8gaHRtbCwgamF2YXNjcmlwdCwgeGhyXG5cblxuLy8gdy1pZnJhbWUteGhyLXBvbGxpbmdcbnZhciBYaHJQb2xsaW5nSVRyYW5zcG9ydCA9IEZhY2FkZUpTWyd3LWlmcmFtZS14aHItcG9sbGluZyddID0gZnVuY3Rpb24ocmksIHRyYW5zX3VybCkge1xuICAgIHRoaXMucnVuKHJpLCB0cmFuc191cmwsICcveGhyJywgWGhyUmVjZWl2ZXIsIHV0aWxzLlhIUkxvY2FsT2JqZWN0KTtcbn07XG5cblhoclBvbGxpbmdJVHJhbnNwb3J0LnByb3RvdHlwZSA9IG5ldyBBamF4QmFzZWRUcmFuc3BvcnQoKTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvdHJhbnMtaWZyYW1lLXhoci1wb2xsaW5nLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi90cmFucy1pZnJhbWUtaHRtbGZpbGUuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8vIFRoaXMgdHJhbnNwb3J0IGdlbmVyYWxseSB3b3JrcyBpbiBhbnkgYnJvd3NlciwgYnV0IHdpbGwgY2F1c2UgYVxuLy8gc3Bpbm5pbmcgY3Vyc29yIHRvIGFwcGVhciBpbiBhbnkgYnJvd3NlciBvdGhlciB0aGFuIElFLlxuLy8gV2UgbWF5IHRlc3QgdGhpcyB0cmFuc3BvcnQgaW4gYWxsIGJyb3dzZXJzIC0gd2h5IG5vdCwgYnV0IGluXG4vLyBwcm9kdWN0aW9uIGl0IHNob3VsZCBiZSBvbmx5IHJ1biBpbiBJRS5cblxudmFyIEh0bWxGaWxlSWZyYW1lVHJhbnNwb3J0ID0gU29ja0pTWydpZnJhbWUtaHRtbGZpbGUnXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5wcm90b2NvbCA9ICd3LWlmcmFtZS1odG1sZmlsZSc7XG4gICAgdGhhdC5pX2NvbnN0cnVjdG9yLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG59O1xuXG4vLyBJbmhlcml0YW5jZS5cbkh0bWxGaWxlSWZyYW1lVHJhbnNwb3J0LnByb3RvdHlwZSA9IG5ldyBJZnJhbWVUcmFuc3BvcnQoKTtcblxuSHRtbEZpbGVJZnJhbWVUcmFuc3BvcnQuZW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBJZnJhbWVUcmFuc3BvcnQuZW5hYmxlZCgpO1xufTtcblxuSHRtbEZpbGVJZnJhbWVUcmFuc3BvcnQubmVlZF9ib2R5ID0gdHJ1ZTtcbkh0bWxGaWxlSWZyYW1lVHJhbnNwb3J0LnJvdW5kVHJpcHMgPSAzOyAvLyBodG1sLCBqYXZhc2NyaXB0LCBodG1sZmlsZVxuXG5cbi8vIHctaWZyYW1lLWh0bWxmaWxlXG52YXIgSHRtbEZpbGVUcmFuc3BvcnQgPSBGYWNhZGVKU1sndy1pZnJhbWUtaHRtbGZpbGUnXSA9IGZ1bmN0aW9uKHJpLCB0cmFuc191cmwpIHtcbiAgICB0aGlzLnJ1bihyaSwgdHJhbnNfdXJsLCAnL2h0bWxmaWxlJywgSHRtbGZpbGVSZWNlaXZlciwgdXRpbHMuWEhSTG9jYWxPYmplY3QpO1xufTtcbkh0bWxGaWxlVHJhbnNwb3J0LnByb3RvdHlwZSA9IG5ldyBBamF4QmFzZWRUcmFuc3BvcnQoKTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvdHJhbnMtaWZyYW1lLWh0bWxmaWxlLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi90cmFucy1wb2xsaW5nLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgUG9sbGluZyA9IGZ1bmN0aW9uKHJpLCBSZWNlaXZlciwgcmVjdl91cmwsIEFqYXhPYmplY3QpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdGhhdC5yaSA9IHJpO1xuICAgIHRoYXQuUmVjZWl2ZXIgPSBSZWNlaXZlcjtcbiAgICB0aGF0LnJlY3ZfdXJsID0gcmVjdl91cmw7XG4gICAgdGhhdC5BamF4T2JqZWN0ID0gQWpheE9iamVjdDtcbiAgICB0aGF0Ll9zY2hlZHVsZVJlY3YoKTtcbn07XG5cblBvbGxpbmcucHJvdG90eXBlLl9zY2hlZHVsZVJlY3YgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHBvbGwgPSB0aGF0LnBvbGwgPSBuZXcgdGhhdC5SZWNlaXZlcih0aGF0LnJlY3ZfdXJsLCB0aGF0LkFqYXhPYmplY3QpO1xuICAgIHZhciBtc2dfY291bnRlciA9IDA7XG4gICAgcG9sbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIG1zZ19jb3VudGVyICs9IDE7XG4gICAgICAgIHRoYXQucmkuX2RpZE1lc3NhZ2UoZS5kYXRhKTtcbiAgICB9O1xuICAgIHBvbGwub25jbG9zZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhhdC5wb2xsID0gcG9sbCA9IHBvbGwub25tZXNzYWdlID0gcG9sbC5vbmNsb3NlID0gbnVsbDtcbiAgICAgICAgaWYgKCF0aGF0LnBvbGxfaXNfY2xvc2luZykge1xuICAgICAgICAgICAgaWYgKGUucmVhc29uID09PSAncGVybWFuZW50Jykge1xuICAgICAgICAgICAgICAgIHRoYXQucmkuX2RpZENsb3NlKDEwMDYsICdQb2xsaW5nIGVycm9yICgnICsgZS5yZWFzb24gKyAnKScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0Ll9zY2hlZHVsZVJlY3YoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5Qb2xsaW5nLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB0aGF0LnBvbGxfaXNfY2xvc2luZyA9IHRydWU7XG4gICAgaWYgKHRoYXQucG9sbCkge1xuICAgICAgICB0aGF0LnBvbGwuYWJvcnQoKTtcbiAgICB9XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi90cmFucy1wb2xsaW5nLmpzXG5cblxuLy8gICAgICAgICBbKl0gSW5jbHVkaW5nIGxpYi90cmFucy1yZWNlaXZlci1ldmVudHNvdXJjZS5qc1xuLypcbiAqICoqKioqIEJFR0lOIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyIFZNd2FyZSwgSW5jLlxuICpcbiAqIEZvciB0aGUgbGljZW5zZSBzZWUgQ09QWUlORy5cbiAqICoqKioqIEVORCBMSUNFTlNFIEJMT0NLICoqKioqXG4gKi9cblxudmFyIEV2ZW50U291cmNlUmVjZWl2ZXIgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGVzID0gbmV3IEV2ZW50U291cmNlKHVybCk7XG4gICAgZXMub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGF0LmRpc3BhdGNoRXZlbnQobmV3IFNpbXBsZUV2ZW50KCdtZXNzYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7J2RhdGEnOiB1bmVzY2FwZShlLmRhdGEpfSkpO1xuICAgIH07XG4gICAgdGhhdC5lc19jbG9zZSA9IGVzLm9uZXJyb3IgPSBmdW5jdGlvbihlLCBhYm9ydF9yZWFzb24pIHtcbiAgICAgICAgLy8gRVMgb24gcmVjb25uZWN0aW9uIGhhcyByZWFkeVN0YXRlID0gMCBvciAxLlxuICAgICAgICAvLyBvbiBuZXR3b3JrIGVycm9yIGl0J3MgQ0xPU0VEID0gMlxuICAgICAgICB2YXIgcmVhc29uID0gYWJvcnRfcmVhc29uID8gJ3VzZXInIDpcbiAgICAgICAgICAgIChlcy5yZWFkeVN0YXRlICE9PSAyID8gJ25ldHdvcmsnIDogJ3Blcm1hbmVudCcpO1xuICAgICAgICB0aGF0LmVzX2Nsb3NlID0gZXMub25tZXNzYWdlID0gZXMub25lcnJvciA9IG51bGw7XG4gICAgICAgIC8vIEV2ZW50U291cmNlIHJlY29ubmVjdHMgYXV0b21hdGljYWxseS5cbiAgICAgICAgZXMuY2xvc2UoKTtcbiAgICAgICAgZXMgPSBudWxsO1xuICAgICAgICAvLyBTYWZhcmkgYW5kIGNocm9tZSA8IDE1IGNyYXNoIGlmIHdlIGNsb3NlIHdpbmRvdyBiZWZvcmVcbiAgICAgICAgLy8gd2FpdGluZyBmb3IgRVMgY2xlYW51cC4gU2VlOlxuICAgICAgICAvLyAgIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD04OTE1NVxuICAgICAgICB1dGlscy5kZWxheSgyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNwYXRjaEV2ZW50KG5ldyBTaW1wbGVFdmVudCgnY2xvc2UnLCB7cmVhc29uOiByZWFzb259KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH07XG59O1xuXG5FdmVudFNvdXJjZVJlY2VpdmVyLnByb3RvdHlwZSA9IG5ldyBSRXZlbnRUYXJnZXQoKTtcblxuRXZlbnRTb3VyY2VSZWNlaXZlci5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYgKHRoYXQuZXNfY2xvc2UpIHtcbiAgICAgICAgdGhhdC5lc19jbG9zZSh7fSwgdHJ1ZSk7XG4gICAgfVxufTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvdHJhbnMtcmVjZWl2ZXItZXZlbnRzb3VyY2UuanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3RyYW5zLXJlY2VpdmVyLWh0bWxmaWxlLmpzXG4vKlxuICogKioqKiogQkVHSU4gTElDRU5TRSBCTE9DSyAqKioqKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIgVk13YXJlLCBJbmMuXG4gKlxuICogRm9yIHRoZSBsaWNlbnNlIHNlZSBDT1BZSU5HLlxuICogKioqKiogRU5EIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqL1xuXG52YXIgX2lzX2llX2h0bWxmaWxlX2NhcGFibGU7XG52YXIgaXNJZUh0bWxmaWxlQ2FwYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChfaXNfaWVfaHRtbGZpbGVfY2FwYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICgnQWN0aXZlWE9iamVjdCcgaW4gX3dpbmRvdykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBfaXNfaWVfaHRtbGZpbGVfY2FwYWJsZSA9ICEhbmV3IEFjdGl2ZVhPYmplY3QoJ2h0bWxmaWxlJyk7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7fVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2lzX2llX2h0bWxmaWxlX2NhcGFibGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX2lzX2llX2h0bWxmaWxlX2NhcGFibGU7XG59O1xuXG5cbnZhciBIdG1sZmlsZVJlY2VpdmVyID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHV0aWxzLnBvbGx1dGVHbG9iYWxOYW1lc3BhY2UoKTtcblxuICAgIHRoYXQuaWQgPSAnYScgKyB1dGlscy5yYW5kb21fc3RyaW5nKDYsIDI2KTtcbiAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpID09PSAtMSkgPyAnPycgOiAnJicpICtcbiAgICAgICAgJ2M9JyArIGVzY2FwZShXUHJlZml4ICsgJy4nICsgdGhhdC5pZCk7XG5cbiAgICB2YXIgY29uc3RydWN0b3IgPSBpc0llSHRtbGZpbGVDYXBhYmxlKCkgP1xuICAgICAgICB1dGlscy5jcmVhdGVIdG1sZmlsZSA6IHV0aWxzLmNyZWF0ZUlmcmFtZTtcblxuICAgIHZhciBpZnJhbWVPYmo7XG4gICAgX3dpbmRvd1tXUHJlZml4XVt0aGF0LmlkXSA9IHtcbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmcmFtZU9iai5sb2FkZWQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHRoYXQuZGlzcGF0Y2hFdmVudChuZXcgU2ltcGxlRXZlbnQoJ21lc3NhZ2UnLCB7J2RhdGEnOiBkYXRhfSkpO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGF0LmlmcmFtZV9jbG9zZSh7fSwgJ25ldHdvcmsnKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhhdC5pZnJhbWVfY2xvc2UgPSBmdW5jdGlvbihlLCBhYm9ydF9yZWFzb24pIHtcbiAgICAgICAgaWZyYW1lT2JqLmNsZWFudXAoKTtcbiAgICAgICAgdGhhdC5pZnJhbWVfY2xvc2UgPSBpZnJhbWVPYmogPSBudWxsO1xuICAgICAgICBkZWxldGUgX3dpbmRvd1tXUHJlZml4XVt0aGF0LmlkXTtcbiAgICAgICAgdGhhdC5kaXNwYXRjaEV2ZW50KG5ldyBTaW1wbGVFdmVudCgnY2xvc2UnLCB7cmVhc29uOiBhYm9ydF9yZWFzb259KSk7XG4gICAgfTtcbiAgICBpZnJhbWVPYmogPSBjb25zdHJ1Y3Rvcih1cmwsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5pZnJhbWVfY2xvc2Uoe30sICdwZXJtYW5lbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbn07XG5cbkh0bWxmaWxlUmVjZWl2ZXIucHJvdG90eXBlID0gbmV3IFJFdmVudFRhcmdldCgpO1xuXG5IdG1sZmlsZVJlY2VpdmVyLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAodGhhdC5pZnJhbWVfY2xvc2UpIHtcbiAgICAgICAgdGhhdC5pZnJhbWVfY2xvc2Uoe30sICd1c2VyJyk7XG4gICAgfVxufTtcbi8vICAgICAgICAgWypdIEVuZCBvZiBsaWIvdHJhbnMtcmVjZWl2ZXItaHRtbGZpbGUuanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3RyYW5zLXJlY2VpdmVyLXhoci5qc1xuLypcbiAqICoqKioqIEJFR0lOIExJQ0VOU0UgQkxPQ0sgKioqKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyIFZNd2FyZSwgSW5jLlxuICpcbiAqIEZvciB0aGUgbGljZW5zZSBzZWUgQ09QWUlORy5cbiAqICoqKioqIEVORCBMSUNFTlNFIEJMT0NLICoqKioqXG4gKi9cblxudmFyIFhoclJlY2VpdmVyID0gZnVuY3Rpb24odXJsLCBBamF4T2JqZWN0KSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBidWZfcG9zID0gMDtcblxuICAgIHRoYXQueG8gPSBuZXcgQWpheE9iamVjdCgnUE9TVCcsIHVybCwgbnVsbCk7XG4gICAgdGhhdC54by5vbmNodW5rID0gZnVuY3Rpb24oc3RhdHVzLCB0ZXh0KSB7XG4gICAgICAgIGlmIChzdGF0dXMgIT09IDIwMCkgcmV0dXJuO1xuICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgICAgdmFyIGJ1ZiA9IHRleHQuc2xpY2UoYnVmX3Bvcyk7XG4gICAgICAgICAgICB2YXIgcCA9IGJ1Zi5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgICAgIGlmIChwID09PSAtMSkgYnJlYWs7XG4gICAgICAgICAgICBidWZfcG9zICs9IHArMTtcbiAgICAgICAgICAgIHZhciBtc2cgPSBidWYuc2xpY2UoMCwgcCk7XG4gICAgICAgICAgICB0aGF0LmRpc3BhdGNoRXZlbnQobmV3IFNpbXBsZUV2ZW50KCdtZXNzYWdlJywge2RhdGE6IG1zZ30pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhhdC54by5vbmZpbmlzaCA9IGZ1bmN0aW9uKHN0YXR1cywgdGV4dCkge1xuICAgICAgICB0aGF0LnhvLm9uY2h1bmsoc3RhdHVzLCB0ZXh0KTtcbiAgICAgICAgdGhhdC54byA9IG51bGw7XG4gICAgICAgIHZhciByZWFzb24gPSBzdGF0dXMgPT09IDIwMCA/ICduZXR3b3JrJyA6ICdwZXJtYW5lbnQnO1xuICAgICAgICB0aGF0LmRpc3BhdGNoRXZlbnQobmV3IFNpbXBsZUV2ZW50KCdjbG9zZScsIHtyZWFzb246IHJlYXNvbn0pKTtcbiAgICB9XG59O1xuXG5YaHJSZWNlaXZlci5wcm90b3R5cGUgPSBuZXcgUkV2ZW50VGFyZ2V0KCk7XG5cblhoclJlY2VpdmVyLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZiAodGhhdC54bykge1xuICAgICAgICB0aGF0LnhvLmNsb3NlKCk7XG4gICAgICAgIHRoYXQuZGlzcGF0Y2hFdmVudChuZXcgU2ltcGxlRXZlbnQoJ2Nsb3NlJywge3JlYXNvbjogJ3VzZXInfSkpO1xuICAgICAgICB0aGF0LnhvID0gbnVsbDtcbiAgICB9XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi90cmFucy1yZWNlaXZlci14aHIuanNcblxuXG4vLyAgICAgICAgIFsqXSBJbmNsdWRpbmcgbGliL3Rlc3QtaG9va3MuanNcbi8qXG4gKiAqKioqKiBCRUdJTiBMSUNFTlNFIEJMT0NLICoqKioqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiBWTXdhcmUsIEluYy5cbiAqXG4gKiBGb3IgdGhlIGxpY2Vuc2Ugc2VlIENPUFlJTkcuXG4gKiAqKioqKiBFTkQgTElDRU5TRSBCTE9DSyAqKioqKlxuICovXG5cbi8vIEZvciB0ZXN0aW5nXG5Tb2NrSlMuZ2V0VXRpbHMgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB1dGlscztcbn07XG5cblNvY2tKUy5nZXRJZnJhbWVUcmFuc3BvcnQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBJZnJhbWVUcmFuc3BvcnQ7XG59O1xuLy8gICAgICAgICBbKl0gRW5kIG9mIGxpYi90ZXN0LWhvb2tzLmpzXG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiBTb2NrSlM7XG4gICAgICAgICAgfSkoKTtcbmlmICgnX3NvY2tqc19vbmxvYWQnIGluIHdpbmRvdykgc2V0VGltZW91dChfc29ja2pzX29ubG9hZCwgMSk7XG5cbi8vIEFNRCBjb21wbGlhbmNlXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCdzb2NranMnLCBbXSwgZnVuY3Rpb24oKXtyZXR1cm4gU29ja0pTO30pO1xufVxuLy8gICAgIFsqXSBFbmQgb2YgbGliL2luZGV4LmpzXG5cbi8vIFsqXSBFbmQgb2YgbGliL2FsbC5qc1xuXG4iLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIik7Ly8gR2VuZXJhdGVkIGJ5IExpdmVTY3JpcHQgMS4yLjBcbihmdW5jdGlvbigpe1xuICB2YXIgTEJhc2UsIExBcnJheSwgc2xpY2UkID0gW10uc2xpY2U7XG4gIExCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG4gIExBcnJheSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChMQXJyYXksIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xBcnJheScsIExBcnJheSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBMQXJyYXk7XG4gICAgZnVuY3Rpb24gTEFycmF5KCl7XG4gICAgICB2YXIgdmFscywgaSQsIGxlbiQsIHZhbCwgdGhpcyQgPSB0aGlzO1xuICAgICAgdmFscyA9IHNsaWNlJC5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBMQXJyYXkuc3VwZXJjbGFzcy5jYWxsKHRoaXMpO1xuICAgICAgdGhpcy5fc2IgPSBuZXcgUkFycmF5O1xuICAgICAgdGhpcy5fZGIgPSB7fTtcbiAgICAgIHRoaXMuX3JhY2sgPSBoYXQucmFjaygpO1xuICAgICAgdGhpcy5sZW5ndGggPSBuZXcgTFZhbHVlKDApO1xuICAgICAgdGhpcy5faGlzdCA9IHt9O1xuICAgICAgdGhpcy5faGlzdG9yeU1hcCA9IHt9O1xuICAgICAgdGhpcy5fdXBkYXRlQnVmZmVyID0ge307XG4gICAgICB0aGlzLl9zYktleXMgPSB7fTtcbiAgICAgIHRoaXMuX2RiS2V5cyA9IHt9O1xuICAgICAgdGhpcy5fc2Iub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHJhd1VwZGF0ZSl7XG4gICAgICAgIHZhciB1cGRhdGUsIHNiS2V5LCBrZXk7XG4gICAgICAgIHVwZGF0ZSA9IHt9O1xuICAgICAgICBmb3IgKHNiS2V5IGluIHJhd1VwZGF0ZSkge1xuICAgICAgICAgIGtleSA9IHJhd1VwZGF0ZVtzYktleV07XG4gICAgICAgICAgdXBkYXRlW2tleV0gPSB0aGlzJC5fZGJba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHNiS2V5IGluIHJhd1VwZGF0ZSkge1xuICAgICAgICAgIGtleSA9IHJhd1VwZGF0ZVtzYktleV07XG4gICAgICAgICAgaWYgKGtleSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzJC5fc2JLZXlzW2tleV0gPSBzYktleTtcbiAgICAgICAgICAgIHRoaXMkLl9kYktleXNbc2JLZXldID0ga2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzJC5lbWl0KCd1cGRhdGUnLCB1cGRhdGUpO1xuICAgICAgICBmb3IgKHNiS2V5IGluIHJhd1VwZGF0ZSkge1xuICAgICAgICAgIGtleSA9IHJhd1VwZGF0ZVtzYktleV07XG4gICAgICAgICAgaWYgKGtleSAhPSBudWxsICYmIHVwZGF0ZVtrZXldICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzJC5fdXBkYXRlQnVmZmVyW2tleV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzJC5lbWl0KCd1cGRhdGUnLCB0aGlzJC5fc2IuaW5kZXhPZktleShzYktleSksIHVwZGF0ZVtrZXldLCBrZXksIHNiS2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMkLmxlbmd0aC5zZXQodGhpcyQuX3NiLmxlbmd0aCk7XG4gICAgICAgICAgICAgIHRoaXMkLmVtaXQoJ2luc2VydCcsIHRoaXMkLl9zYi5pbmRleE9mS2V5KHNiS2V5KSwgdXBkYXRlW2tleV0sIGtleSwgc2JLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcyQuX3VwZGF0ZUJ1ZmZlcltrZXldID0gdXBkYXRlW2tleV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleSA9IHRoaXMkLl9kYktleXNbc2JLZXldO1xuICAgICAgICAgICAgaWYgKHRoaXMkLl91cGRhdGVCdWZmZXJba2V5XSAhPSBudWxsIHx8IHRoaXMkLl9kYltrZXldICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcyQubGVuZ3RoLnNldCh0aGlzJC5fc2IubGVuZ3RoKTtcbiAgICAgICAgICAgICAgdGhpcyQuZW1pdCgncmVtb3ZlJywgdGhpcyQuX3NiLmluZGV4T2ZLZXkoc2JLZXkpLCB0aGlzJC5fdXBkYXRlQnVmZmVyW2tleV0gfHwgdGhpcyQuX2RiW2tleV0sIGtleSwgc2JLZXkpO1xuICAgICAgICAgICAgfSBlbHNlIHt9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoc2JLZXkgaW4gcmF3VXBkYXRlKSB7XG4gICAgICAgICAga2V5ID0gcmF3VXBkYXRlW3NiS2V5XTtcbiAgICAgICAgICBpZiAoa2V5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IHRoaXMkLl9kYktleXNbc2JLZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMkLl9kYktleXNbc2JLZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMkLl9zYktleXNba2V5XTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzJC5fdXBkYXRlQnVmZmVyW2tleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcyQuX2hpc3Rba2V5XTtcbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soZm4kLmJpbmQodGhpcyQsIGtleSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBmbiQoa2V5KXtcbiAgICAgICAgICB2YXIgcmVmJCwgcmVmMSQ7XG4gICAgICAgICAgcmV0dXJuIHJlZjEkID0gKHJlZiQgPSB0aGlzLl9kYilba2V5XSwgZGVsZXRlIHJlZiRba2V5XSwgcmVmMSQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2Iub24oJ191cGRhdGUnLCBmdW5jdGlvbih1cGRhdGUpe1xuICAgICAgICByZXR1cm4gdGhpcyQubG9jYWxVcGRhdGUoWydhJywgdXBkYXRlXSk7XG4gICAgICB9KTtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdmFscy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICB2YWwgPSB2YWxzW2kkXTtcbiAgICAgICAgdGhpcy5wdXNoKHZhbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHByb3RvdHlwZS5jcmVhdGlvbkFyZ3MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG4gICAgTEFycmF5Lm1hcENyZWF0aW9uQXJncyA9IGZ1bmN0aW9uKGZuLCBhcmdzKXtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5fZ2VuSWQgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuX3JhY2soKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5fcmVnaXN0ZXIgPSBmdW5jdGlvbih2YWwsIGtleSwgdXBkYXRlKXtcbiAgICAgIHZhciB0aGlzJCA9IHRoaXM7XG4gICAgICBrZXkgPT0gbnVsbCAmJiAoa2V5ID0gdGhpcy5fZ2VuSWQoKSk7XG4gICAgICB1cGRhdGUgPT0gbnVsbCAmJiAodXBkYXRlID0gdHJ1ZSk7XG4gICAgICBpZiAodXBkYXRlKSB7XG4gICAgICAgIHRoaXMubG9jYWxVcGRhdGUoWydkJywga2V5LCB2YWwuY29uc3RydWN0b3IubmFtZS50b0xvd2VyQ2FzZSgpLCB2YWwuY3JlYXRpb25BcmdzKCldKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RiW2tleV0gPSB2YWw7XG4gICAgICB2YWwub24oJ191cGRhdGUnLCBmdW5jdGlvbihpdCl7XG4gICAgICAgIGlmICh0aGlzJC5fZGJba2V5XSA9PT0gdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMkLmxvY2FsVXBkYXRlKFsnYycsIGtleSwgaXRdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH07XG4gICAgcHJvdG90eXBlLl9zZXRJbmRleCA9IGZ1bmN0aW9uKGluZGV4LCBrZXkpe1xuICAgICAgcmV0dXJuIHRoaXMuX3NiLnNldCh0aGlzLl9zYi5rZXlzW2luZGV4XSwga2V5KTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5fdW5zZXQgPSBmdW5jdGlvbihrZXkpe1xuICAgICAgcmV0dXJuIHRoaXMuX3NiLnVuc2V0KHRoaXMuX3NiS2V5c1trZXldKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24odmFsKXtcbiAgICAgIHZhciBrZXk7XG4gICAgICBrZXkgPSB0aGlzLl9yZWdpc3Rlcih2YWwpO1xuICAgICAgdGhpcy5fc2IucHVzaChrZXkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBwcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uKHZhbCl7XG4gICAgICB2YXIga2V5O1xuICAgICAga2V5ID0gdGhpcy5fcmVnaXN0ZXIodmFsKTtcbiAgICAgIHRoaXMuX3NiLnVuc2hpZnQoa2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGluZGV4KXtcbiAgICAgIHJldHVybiB0aGlzLl9kYlt0aGlzLl9zYi5nZXQodGhpcy5fc2Iua2V5c1tpbmRleF0pXTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIGtleTtcbiAgICAgIGtleSA9IHRoaXMuX3NiLnBvcCgpO1xuICAgICAgcmV0dXJuIHRoaXMuX2RiW2tleV07XG4gICAgfTtcbiAgICBwcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIGtleTtcbiAgICAgIGtleSA9IHRoaXMuX3NiLnNoaWZ0KCk7XG4gICAgICByZXR1cm4gdGhpcy5fZGJba2V5XTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihpbmRleCl7XG4gICAgICB0aGlzLl9zYi51bnNldCh0aGlzLl9zYi5rZXlzW2luZGV4XSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4pe1xuICAgICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpO1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQuY2FsbCh0aGlzKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGkgPSByZWYkW2kkXTtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCB0aGlzLmdldChpKSwgaSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGZuJCgpe1xuICAgICAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMubGVuZ3RoLmdldCgpOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICAgIH1cbiAgICB9O1xuICAgIHByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oZm4pe1xuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaChmbik7XG4gICAgfTtcbiAgICBMQXJyYXkubWFwcGVyID0gZnVuY3Rpb24oZm4sIHN1YkFyZ3Mpe1xuICAgICAgdmFyIGRiLCBkYktleXM7XG4gICAgICBzdWJBcmdzID09IG51bGwgJiYgKHN1YkFyZ3MgPSBbXSk7XG4gICAgICBkYiA9IHt9O1xuICAgICAgZGJLZXlzID0ge307XG4gICAgICByZXR1cm4gc3MuanNvbih0aHJvdWdoKGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgICAgIHZhciBkYXRhLCBjaGlsZFVwZGF0ZSwgcmVmJCwgbWFwcGVyLCBzYktleSwga2V5LCB0aGlzJCA9IHRoaXM7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHVwZGF0ZSkpIHtcbiAgICAgICAgICBkYXRhID0gdXBkYXRlWzBdO1xuICAgICAgICAgIHN3aXRjaCAoZGF0YVswXSkge1xuICAgICAgICAgIGNhc2UgJ2MnOlxuICAgICAgICAgICAgY2hpbGRVcGRhdGUgPSBkYXRhWzJdLnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZFVwZGF0ZS5hcmdzID0gW2RhdGFbMV1dO1xuICAgICAgICAgICAgY2hpbGRVcGRhdGUuY3VzdG9tID0gdXBkYXRlO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodXBkYXRlLmFyZ3MpKSB7XG4gICAgICAgICAgICAgIGNoaWxkVXBkYXRlLmFyZ3MgPSBjaGlsZFVwZGF0ZS5hcmdzLmNvbmNhdCh1cGRhdGUuYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKHJlZiQgPSBkYltkYXRhWzFdXSkgIT0gbnVsbCA/IHJlZiQud3JpdGUoSlNPTi5zdHJpbmdpZnkoY2hpbGRVcGRhdGUpKSA6IHZvaWQgODtcbiAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIG1hcHBlciA9IChyZWYkID0gTEJhc2UudHlwZXNbZGF0YVsyXV0pLm1hcHBlci5hcHBseShyZWYkLCBbZm5dLmNvbmNhdChzbGljZSQuY2FsbChzdWJBcmdzKSkpO1xuICAgICAgICAgICAgbWFwcGVyLm9uKCdkYXRhJywgZnVuY3Rpb24odXBkYXRlKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMkLnF1ZXVlKFtbJ2MnLCBkYXRhWzFdLCB1cGRhdGVdLCB1cGRhdGUuY3VzdG9tWzFdWzFdLCB1cGRhdGUuY3VzdG9tWzFdWzJdXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRiW2RhdGFbMV1dID0gbWFwcGVyO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVldWUoW1snZCcsIGRhdGFbMV0sIGRhdGFbMl0sIExCYXNlLnR5cGVzW2RhdGFbMl1dLm1hcENyZWF0aW9uQXJncyhmbiwgZGF0YVszXSwgZGF0YVsxXSldLCB1cGRhdGVbMV0sIHVwZGF0ZVsyXV0pO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBmb3IgKHNiS2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgICAga2V5ID0gZGF0YVtzYktleV07XG4gICAgICAgICAgICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRiS2V5c1tzYktleV0gPSBrZXk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGRiW2RiS2V5c1tzYktleV1dO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBkYktleXNbc2JLZXldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZSh1cGRhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZSh1cGRhdGUpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuaGlzdG9yeSA9IGZ1bmN0aW9uKHNvdXJjZXMpe1xuICAgICAgdmFyIGhpc3QsIGtleSwgcmVmJCwgdXBkYXRlLCB2YWwsIHRoaXMkID0gdGhpcztcbiAgICAgIGhpc3QgPSB0aGlzLl9zYi5oaXN0b3J5KHNvdXJjZXMpLm1hcChmdW5jdGlvbih1cGRhdGUpe1xuICAgICAgICByZXR1cm4gdGhpcyQuX2hpc3RvcnlNYXBbdXBkYXRlWzJdICsgXCItXCIgKyB1cGRhdGVbMV1dO1xuICAgICAgfSk7XG4gICAgICBmb3IgKGtleSBpbiByZWYkID0gdGhpcy5faGlzdCkge1xuICAgICAgICB1cGRhdGUgPSByZWYkW2tleV07XG4gICAgICAgIGlmICghfmhpc3QuaW5kZXhPZih1cGRhdGUpICYmIGZpbHRlcih1cGRhdGUsIHNvdXJjZXMpKSB7XG4gICAgICAgICAgaGlzdC5wdXNoKHVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAoa2V5IGluIHJlZiQgPSB0aGlzLl9kYikge1xuICAgICAgICB2YWwgPSByZWYkW2tleV07XG4gICAgICAgIGhpc3QgPSBoaXN0LmNvbmNhdCh2YWwuaGlzdG9yeShzb3VyY2VzKS5tYXAoZm4kKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGlzdC5maWx0ZXIoQm9vbGVhbikuc29ydChvcmRlcik7XG4gICAgICBmdW5jdGlvbiBmbiQodXBkYXRlKXtcbiAgICAgICAgcmV0dXJuIHRoaXMkLl9oaXN0b3J5TWFwW2tleSArIFwiLVwiICsgdXBkYXRlWzJdICsgXCItXCIgKyB1cGRhdGVbMV1dO1xuICAgICAgfVxuICAgIH07XG4gICAgcHJvdG90eXBlLmFwcGx5VXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICAgIHZhciBkYXRhLCByZWYkO1xuICAgICAgZGF0YSA9IHVwZGF0ZVswXTtcbiAgICAgIHN3aXRjaCAoZGF0YVswXSkge1xuICAgICAgY2FzZSAnYSc6XG4gICAgICAgIHRoaXMuX2hpc3RvcnlNYXBbZGF0YVsxXVsyXSArIFwiLVwiICsgZGF0YVsxXVsxXV0gPSB1cGRhdGU7XG4gICAgICAgIHJldHVybiB0aGlzLl9zYi5hcHBseVVwZGF0ZShkYXRhWzFdKTtcbiAgICAgIGNhc2UgJ2QnOlxuICAgICAgICB0aGlzLl9oaXN0W2RhdGFbMV1dID0gdXBkYXRlO1xuICAgICAgICBpZiAodGhpcy5fZGJbZGF0YVsxXV0gPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyKExCYXNlLmNyZWF0ZS5hcHBseShMQmFzZSwgW2RhdGFbMl1dLmNvbmNhdChzbGljZSQuY2FsbChkYXRhWzNdKSkpLCBkYXRhWzFdLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0KCdfcmVnaXN0ZXInLCBkYXRhWzFdLCB0aGlzLl9kYltkYXRhWzFdXSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSAnYyc6XG4gICAgICAgIHRoaXMuX2hpc3RvcnlNYXBbZGF0YVsxXSArIFwiLVwiICsgZGF0YVsyXVsyXSArIFwiLVwiICsgZGF0YVsyXVsxXV0gPSB1cGRhdGU7XG4gICAgICAgIGlmICh1cGRhdGVbMl0gIT09IHRoaXMuaWQpIHtcbiAgICAgICAgICBpZiAoKHJlZiQgPSB0aGlzLl9kYltkYXRhWzFdXSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVmJC5fdXBkYXRlKGRhdGFbMl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBMQXJyYXk7XG4gIH0oTEJhc2UpKTtcbiAgTEJhc2UuQXJyYXkgPSBMQXJyYXk7XG4gIExCYXNlLnJlZ2lzdGVyKExBcnJheSk7XG4gIG1vZHVsZS5leHBvcnRzID0gTEFycmF5O1xuICBmdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICAgIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICAgIHJldHVybiBzdWI7XG4gIH1cbiAgZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gICAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICAgIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBMaXZlU2NyaXB0IDEuMi4wXG4oZnVuY3Rpb24oKXtcbiAgdmFyIFNjdXR0bGVidXR0LCB1dGlscywgTEJhc2UsIHNsaWNlJCA9IFtdLnNsaWNlO1xuICBTY3V0dGxlYnV0dCA9IHJlcXVpcmUoJ3NjdXR0bGVidXR0Jyk7XG4gIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuICBMQmFzZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChMQmFzZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTEJhc2UnLCBMQmFzZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBMQmFzZTtcbiAgICBMQmFzZS50eXBlcyA9IHt9O1xuICAgIExCYXNlLnJlZ2lzdGVyID0gZnVuY3Rpb24odHlwZSl7XG4gICAgICByZXR1cm4gdGhpcy50eXBlc1t0eXBlLm5hbWUudG9Mb3dlckNhc2UoKV0gPSB0eXBlO1xuICAgIH07XG4gICAgTEJhc2UuY3JlYXRlID0gZnVuY3Rpb24obmFtZSl7XG4gICAgICB2YXIgYXJncywgcmVmJDtcbiAgICAgIGFyZ3MgPSBzbGljZSQuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHR5cGVvZiAocmVmJCA9IHRoaXMudHlwZXMpW25hbWVdID09PSAnZnVuY3Rpb24nID8gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShyZWYkW25hbWVdLCBhcmdzLCBmdW5jdGlvbigpe30pIDogdm9pZCA4O1xuICAgIH07XG4gICAgcHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbihkZXN0KXtcbiAgICAgIHRoaXMuY3JlYXRlUmVhZFN0cmVhbSgpLnBpcGUoZGVzdC5jcmVhdGVXcml0ZVN0cmVhbSgpKTtcbiAgICAgIHJldHVybiBkZXN0O1xuICAgIH07XG4gICAgcHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKGZuKXtcbiAgICAgIHZhciBhcmdzLCBuZXdMaXZlLCByZWYkO1xuICAgICAgYXJncyA9IHNsaWNlJC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBuZXdMaXZlID0gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KSh0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLmNvbnN0cnVjdG9yLm1hcENyZWF0aW9uQXJncyhmbiwgdGhpcy5jcmVhdGlvbkFyZ3MoKSksIGZ1bmN0aW9uKCl7fSk7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRTdHJlYW0oKS5waXBlKChyZWYkID0gdGhpcy5jb25zdHJ1Y3RvcikubWFwcGVyLmFwcGx5KHJlZiQsIFtmbl0uY29uY2F0KHNsaWNlJC5jYWxsKGFyZ3MpKSkpLnBpcGUobmV3TGl2ZS5jcmVhdGVXcml0ZVN0cmVhbSgpKTtcbiAgICAgIHJldHVybiBuZXdMaXZlO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmNyZWF0aW9uQXJncyA9IHV0aWxzLmR1dHlPZlN1YmNsYXNzKCdjcmVhdGlvbkFyZ3MnKTtcbiAgICBwcm90b3R5cGUuYXBwbHlVcGRhdGUgPSB1dGlscy5kdXR5T2ZTdWJjbGFzcygnYXBwbHlVcGRhdGUnKTtcbiAgICBwcm90b3R5cGUuaGlzdG9yeSA9IHV0aWxzLmR1dHlPZlN1YmNsYXNzKCdoaXN0b3J5Jyk7XG4gICAgZnVuY3Rpb24gTEJhc2UoKXtcbiAgICAgIExCYXNlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgcmV0dXJuIExCYXNlO1xuICB9KFNjdXR0bGVidXR0KSk7XG4gIG1vZHVsZS5leHBvcnRzID0gTEJhc2U7XG4gIGZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICAgIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAgIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gICAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gICAgcmV0dXJuIHN1YjtcbiAgfVxuICBmdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gICAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IExpdmVTY3JpcHQgMS4yLjBcbihmdW5jdGlvbigpe1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vYmFzZScpO1xuICByZXF1aXJlKCcuL2FycmF5Jyk7XG4gIHJlcXVpcmUoJy4vbWFwJyk7XG4gIHJlcXVpcmUoJy4vbWFwLXZpZXcnKTtcbiAgcmVxdWlyZSgnLi92YWx1ZScpO1xufSkuY2FsbCh0aGlzKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBMaXZlU2NyaXB0IDEuMi4wXG4oZnVuY3Rpb24oKXtcbiAgdmFyIExCYXNlLCBMTWFwVmlldztcbiAgTEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbiAgTE1hcFZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gICAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTE1hcFZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xNYXBWaWV3JywgTE1hcFZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTE1hcFZpZXc7XG4gICAgZnVuY3Rpb24gTE1hcFZpZXcocGFyZW50LCBvcHRzKXtcbiAgICAgIHZhciB0aGlzJCA9IHRoaXM7XG4gICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgIHRoaXMub3B0cyA9IG9wdHMgIT0gbnVsbFxuICAgICAgICA/IG9wdHNcbiAgICAgICAgOiB7fTtcbiAgICAgIExNYXBWaWV3LnN1cGVyY2xhc3MuY2FsbCh0aGlzKTtcbiAgICAgIHRoaXMucGFyZW50Lm9uKCdfdXBkYXRlJywgZnVuY3Rpb24odXBkYXRlKXtcbiAgICAgICAgdmFyIGRhdGE7XG4gICAgICAgIGRhdGEgPSB1cGRhdGVbMF07XG4gICAgICAgIHN3aXRjaCAoZGF0YVswXSkge1xuICAgICAgICBjYXNlICdjJzpcbiAgICAgICAgICBpZiAodGhpcyQuX2NoZWNrUHJlZml4KGRhdGFbMV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcyQuYXBwbHlVcGRhdGUoW1snYycsIHRoaXMkLl91bnByZWZpeChkYXRhWzFdKSwgZGF0YVsyXV0sIHVwZGF0ZVsxXSwgdXBkYXRlWzJdXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICBpZiAodGhpcyQuX2NoZWNrUHJlZml4KGRhdGFbMV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcyQuYXBwbHlVcGRhdGUoW1snZCcsIHRoaXMkLl91bnByZWZpeChkYXRhWzFdKSwgZGF0YVsyXSwgZGF0YVszXV0sIHVwZGF0ZVsxXSwgdXBkYXRlWzJdXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcHJvdG90eXBlLl9wcmVmaXggPSBmdW5jdGlvbihrZXkpe1xuICAgICAgaWYgKHRoaXMub3B0cy5wcmVmaXggIT0gbnVsbCkge1xuICAgICAgICBrZXkgPSB0aGlzLm9wdHMucHJlZml4ICsgXCI6XCIgKyBrZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH07XG4gICAgcHJvdG90eXBlLl91bnByZWZpeCA9IGZ1bmN0aW9uKGtleSl7XG4gICAgICBpZiAodGhpcy5vcHRzLnByZWZpeCAhPSBudWxsKSB7XG4gICAgICAgIGtleSA9IGtleS5zdWJzdHJpbmcodGhpcy5vcHRzLnByZWZpeC5sZW5ndGggKyAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuX2NoZWNrUHJlZml4ID0gZnVuY3Rpb24oa2V5KXtcbiAgICAgIGlmICh0aGlzLm9wdHMucHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5LnN1YnN0cmluZygwLCB0aGlzLm9wdHMucHJlZml4Lmxlbmd0aCkgPT09IHRoaXMub3B0cy5wcmVmaXg7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KXtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXQodGhpcy5fcHJlZml4KGtleSkpO1xuICAgIH07XG4gICAgcHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsKXtcbiAgICAgIHRoaXMucGFyZW50LnNldCh0aGlzLl9wcmVmaXgoa2V5KSwgdmFsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmFwcGx5VXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICAgIHZhciBkYXRhO1xuICAgICAgZGF0YSA9IHVwZGF0ZVswXTtcbiAgICAgIHN3aXRjaCAoZGF0YVswXSkge1xuICAgICAgY2FzZSAnYyc6XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5hcHBseVVwZGF0ZShbWydjJywgdGhpcy5fcHJlZml4KGRhdGFbMV0pLCBkYXRhWzJdXSwgdXBkYXRlWzFdLCB1cGRhdGVbMl1dKTtcbiAgICAgIGNhc2UgJ2QnOlxuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuYXBwbHlVcGRhdGUoW1snZCcsIHRoaXMuX3ByZWZpeChkYXRhWzFdKSwgZGF0YVsyXSwgZGF0YVszXV0sIHVwZGF0ZVsxXSwgdXBkYXRlWzJdXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICBwcm90b3R5cGUuaGlzdG9yeSA9IGZ1bmN0aW9uKHNvdXJjZXMpe1xuICAgICAgdmFyIHRoaXMkID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5oaXN0b3J5KCkuZmlsdGVyKGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgICAgIHZhciBkYXRhO1xuICAgICAgICBkYXRhID0gdXBkYXRlWzBdO1xuICAgICAgICBzd2l0Y2ggKGRhdGFbMF0pIHtcbiAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgIHJldHVybiB0aGlzJC5fY2hlY2tQcmVmaXgoZGF0YVsxXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBMTWFwVmlldztcbiAgfShMQmFzZSkpO1xuICBMQmFzZS5NYXBWaWV3ID0gTE1hcFZpZXc7XG4gIG1vZHVsZS5leHBvcnRzID0gTE1hcFZpZXc7XG4gIGZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICAgIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAgIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gICAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gICAgcmV0dXJuIHN1YjtcbiAgfVxuICBmdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gICAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IExpdmVTY3JpcHQgMS4yLjBcbihmdW5jdGlvbigpe1xuICB2YXIgZmlsdGVyLCBMQmFzZSwgdXRpbHMsIExNYXAsIHNsaWNlJCA9IFtdLnNsaWNlO1xuICBmaWx0ZXIgPSByZXF1aXJlKCdzY3V0dGxlYnV0dC91dGlsJykuZmlsdGVyO1xuICBMQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuICB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbiAgTE1hcCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChMTWFwLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdMTWFwJywgTE1hcCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBMTWFwO1xuICAgIGZ1bmN0aW9uIExNYXAob3B0cyl7XG4gICAgICB0aGlzLm9wdHMgPSBvcHRzICE9IG51bGxcbiAgICAgICAgPyBvcHRzXG4gICAgICAgIDoge307XG4gICAgICBMTWFwLnN1cGVyY2xhc3MuY2FsbCh0aGlzKTtcbiAgICAgIHRoaXMuZGIgPSB7fTtcbiAgICAgIHRoaXMuX2hpc3QgPSB7fTtcbiAgICAgIHRoaXMuX2hpc3RvcnlNYXAgPSB7fTtcbiAgICB9XG4gICAgcHJvdG90eXBlLl9wcmVmaXggPSBmdW5jdGlvbihrZXkpe1xuICAgICAgaWYgKHRoaXMub3B0cy5wcmVmaXggIT0gbnVsbCkge1xuICAgICAgICBrZXkgPSB0aGlzLm9wdHMucHJlZml4ICsgXCI6XCIgKyBrZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH07XG4gICAgcHJvdG90eXBlLl91bnByZWZpeCA9IGZ1bmN0aW9uKGtleSl7XG4gICAgICBpZiAodGhpcy5vcHRzLnByZWZpeCAhPSBudWxsKSB7XG4gICAgICAgIGtleSA9IGtleS5zdWJzdHJpbmcodGhpcy5vcHRzLnByZWZpeC5sZW5ndGggKyAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuX2NoZWNrUHJlZml4ID0gZnVuY3Rpb24oa2V5KXtcbiAgICAgIGlmICh0aGlzLm9wdHMucHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5LnN1YnN0cmluZygwLCB0aGlzLm9wdHMucHJlZml4Lmxlbmd0aCkgPT09IHRoaXMub3B0cy5wcmVmaXg7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuX3JlZ2lzdGVyID0gZnVuY3Rpb24oa2V5LCBtb2RlbCwgdXBkYXRlKXtcbiAgICAgIHZhciB0aGlzJCA9IHRoaXM7XG4gICAgICB1cGRhdGUgPT0gbnVsbCAmJiAodXBkYXRlID0gdHJ1ZSk7XG4gICAgICB0aGlzLmRiW2tleV0gPSBtb2RlbDtcbiAgICAgIG1vZGVsLm9uKCdfdXBkYXRlJywgZnVuY3Rpb24oaXQpe1xuICAgICAgICBpZiAodGhpcyQuZGJba2V5XSA9PT0gbW9kZWwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcyQubG9jYWxVcGRhdGUoWydjJywga2V5LCBpdF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxVcGRhdGUoWydkJywga2V5LCBtb2RlbC5jb25zdHJ1Y3Rvci5uYW1lLnRvTG93ZXJDYXNlKCksIG1vZGVsLmNyZWF0aW9uQXJncygpXSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBwcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCBtb2RlbCl7XG4gICAgICBrZXkgPSB0aGlzLl9wcmVmaXgoa2V5KTtcbiAgICAgIHJldHVybiB0aGlzLl9yZWdpc3RlcihrZXksIG1vZGVsKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpe1xuICAgICAgcmV0dXJuIHRoaXMuZGJbdGhpcy5fcHJlZml4KGtleSldO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmFwcGx5VXBkYXRlID0gZnVuY3Rpb24odXBkYXRlKXtcbiAgICAgIHZhciBkYXRhLCByZWYkO1xuICAgICAgZGF0YSA9IHVwZGF0ZVswXTtcbiAgICAgIHN3aXRjaCAoZGF0YVswXSkge1xuICAgICAgY2FzZSAnYyc6XG4gICAgICAgIGlmICghdGhpcy5fY2hlY2tQcmVmaXgoZGF0YVsxXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGlzdG9yeU1hcFtkYXRhWzFdICsgXCItXCIgKyBkYXRhWzJdWzJdICsgXCItXCIgKyBkYXRhWzJdWzFdXSA9IHVwZGF0ZTtcbiAgICAgICAgaWYgKChyZWYkID0gdGhpcy5kYltkYXRhWzFdXSkgIT0gbnVsbCkge1xuICAgICAgICAgIHJlZiQuX3VwZGF0ZShkYXRhWzJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgJ2QnOlxuICAgICAgICBpZiAoIXRoaXMuX2NoZWNrUHJlZml4KGRhdGFbMV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hpc3RbZGF0YVsxXV0gPSB1cGRhdGU7XG4gICAgICAgIGlmIChkYXRhWzJdID09PSBudWxsKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZGJbZGF0YVsxXV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuZGJbZGF0YVsxXV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXIoZGF0YVsxXSwgTEJhc2UuY3JlYXRlLmFwcGx5KExCYXNlLCBbZGF0YVsyXV0uY29uY2F0KHNsaWNlJC5jYWxsKGRhdGFbM10pKSksIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICBwcm90b3R5cGUuaGlzdG9yeSA9IGZ1bmN0aW9uKHNvdXJjZXMpe1xuICAgICAgdmFyIGhpc3QsIGtleSwgcmVmJCwgdXBkYXRlLCB2YWwsIHRoaXMkID0gdGhpcztcbiAgICAgIGhpc3QgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIHJlZiQgPSB0aGlzLl9oaXN0KSB7XG4gICAgICAgIHVwZGF0ZSA9IHJlZiRba2V5XTtcbiAgICAgICAgaWYgKCF+aGlzdC5pbmRleE9mKHVwZGF0ZSkgJiYgZmlsdGVyKHVwZGF0ZSwgc291cmNlcykpIHtcbiAgICAgICAgICBoaXN0LnB1c2godXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yIChrZXkgaW4gcmVmJCA9IHRoaXMuX2RiKSB7XG4gICAgICAgIHZhbCA9IHJlZiRba2V5XTtcbiAgICAgICAgaGlzdCA9IGhpc3QuY29uY2F0KHZhbC5oaXN0b3J5KHNvdXJjZXMpLm1hcChmbiQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoaXN0LmZpbHRlcihCb29sZWFuKS5zb3J0KHV0aWxzLm9yZGVyKTtcbiAgICAgIGZ1bmN0aW9uIGZuJCh1cGRhdGUpe1xuICAgICAgICByZXR1cm4gdGhpcyQuX2hpc3RvcnlNYXBba2V5ICsgXCItXCIgKyB1cGRhdGVbMl0gKyBcIi1cIiArIHVwZGF0ZVsxXV07XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gTE1hcDtcbiAgfShMQmFzZSkpO1xuICBMQmFzZS5NYXAgPSBMTWFwO1xuICBMQmFzZS5yZWdpc3RlcihMTWFwKTtcbiAgbW9kdWxlLmV4cG9ydHMgPSBMTWFwO1xuICBmdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICAgIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICAgIHJldHVybiBzdWI7XG4gIH1cbiAgZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gICAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICAgIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBMaXZlU2NyaXB0IDEuMi4wXG4oZnVuY3Rpb24oKXtcbiAgZXhwb3J0cy5vcmRlciA9IGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiBiZXR3ZWVuLnN0cm9yZChhWzFdLCBiWzFdKSB8fCBiZXR3ZWVuLnN0cm9yZChhWzJdLCBiWzJdKTtcbiAgfTtcbiAgZXhwb3J0cy5kdXR5T2ZTdWJjbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuY29uc3RydWN0b3IubmFtZSArIFwiLlwiICsgbmFtZSArIFwiIG11c3QgYmUgaW1wbGVtZW50ZWRcIik7XG4gICAgfTtcbiAgfTtcbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgTGl2ZVNjcmlwdCAxLjIuMFxuKGZ1bmN0aW9uKCl7XG4gIHZhciBMQmFzZSwgUlZhbHVlLCBMVmFsdWUsIHNsaWNlJCA9IFtdLnNsaWNlO1xuICBMQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuICBSVmFsdWUgPSByZXF1aXJlKCdyLWFycmF5Jyk7XG4gIExWYWx1ZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChMVmFsdWUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xWYWx1ZScsIExWYWx1ZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBMVmFsdWU7XG4gICAgZnVuY3Rpb24gTFZhbHVlKGRlZmF1bHRWYWwsIGZvcmNlKXtcbiAgICAgIHZhciB0aGlzJCA9IHRoaXM7XG4gICAgICBmb3JjZSA9PSBudWxsICYmIChmb3JjZSA9IGZhbHNlKTtcbiAgICAgIExWYWx1ZS5zdXBlcmNsYXNzLmNhbGwodGhpcyk7XG4gICAgICB0aGlzLl9zYiA9IG5ldyBSVmFsdWU7XG4gICAgICB0aGlzLl9zYi5vbigndXBkYXRlJywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHJldHVybiB0aGlzJC5lbWl0KCd1cGRhdGUnLCBkYXRhKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2Iub24oJ191cGRhdGUnLCBmdW5jdGlvbih1cGRhdGUpe1xuICAgICAgICByZXR1cm4gdGhpcyQuZW1pdCgnX3VwZGF0ZScsIHVwZGF0ZSk7XG4gICAgICB9KTtcbiAgICAgIGlmIChkZWZhdWx0VmFsICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXQoZGVmYXVsdFZhbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHByb3RvdHlwZS5jcmVhdGlvbkFyZ3MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIFt0aGlzLmdldCgpXTtcbiAgICB9O1xuICAgIExWYWx1ZS5tYXBDcmVhdGlvbkFyZ3MgPSBmdW5jdGlvbihmbiwgYXJncyl7XG4gICAgICB2YXIgc3ViQXJncztcbiAgICAgIHN1YkFyZ3MgPSBzbGljZSQuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgICAgcmV0dXJuIFtmbi5hcHBseShudWxsLCBbYXJnc1swXV0uY29uY2F0KHNsaWNlJC5jYWxsKHN1YkFyZ3MpKSldO1xuICAgIH07XG4gICAgcHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5ld1ZhbHVlKXtcbiAgICAgIGlmICh0aGlzLmdldCgpICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLl9zYi5zZXQobmV3VmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLl9zYi5nZXQoKTtcbiAgICB9O1xuICAgIExWYWx1ZS5tYXBwZXIgPSBmdW5jdGlvbihmbil7XG4gICAgICByZXR1cm4gc3MuanNvbih0aHJvdWdoKGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgICAgIHZhciBhcmdzLCBuZXdVcGRhdGU7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXVlKEFycmF5LmlzQXJyYXkodXBkYXRlKSA/IChhcmdzID0gW3VwZGF0ZVswXV0sIEFycmF5LmlzQXJyYXkodXBkYXRlLmFyZ3MpICYmIChhcmdzID0gYXJncy5jb25jYXQodXBkYXRlLmFyZ3MpKSwgbmV3VXBkYXRlID0gW2ZuLmFwcGx5KG51bGwsIGFyZ3MpLCB1cGRhdGVbMV0sIHVwZGF0ZVsyXV0sIG5ld1VwZGF0ZS5jdXN0b20gPSB1cGRhdGUuY3VzdG9tLCBuZXdVcGRhdGUpIDogdXBkYXRlKTtcbiAgICAgIH0pKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5oaXN0b3J5ID0gZnVuY3Rpb24oc291cmNlcyl7XG4gICAgICByZXR1cm4gdGhpcy5fc2IuaGlzdG9yeShzb3VyY2VzKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5hcHBseVVwZGF0ZSA9IGZ1bmN0aW9uKHVwZGF0ZSl7XG4gICAgICByZXR1cm4gdGhpcy5fc2IuYXBwbHlVcGRhdGUodXBkYXRlKTtcbiAgICB9O1xuICAgIHJldHVybiBMVmFsdWU7XG4gIH0oTEJhc2UpKTtcbiAgTEJhc2UuVmFsdWUgPSBMVmFsdWU7XG4gIExCYXNlLnJlZ2lzdGVyKExWYWx1ZSk7XG4gIG1vZHVsZS5leHBvcnRzID0gTFZhbHVlO1xuICBmdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICAgIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICAgIHJldHVybiBzdWI7XG4gIH1cbiAgZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gICAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICAgIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTsvLyBHZW5lcmF0ZWQgYnkgTGl2ZVNjcmlwdCAxLjIuMFxuKGZ1bmN0aW9uKCl7XG4gIHZhciBmb250LCB1dGlsLCB0dHksIGxldmVscywgY29sb3JzLCBMb2dnZXIsIGV4cG9ydHMsIHNsaWNlJCA9IFtdLnNsaWNlO1xuICBmb250ID0gcmVxdWlyZSgnYW5zaS1mb250Jyk7XG4gIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG4gIHR0eSA9IHJlcXVpcmUoJ3R0eScpO1xuICBsZXZlbHMgPSBbJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddO1xuICBjb2xvcnMgPSBbJ2dyZWVuJywgJ2dyZWVuJywgJ3llbGxvdycsICdyZWQnXTtcbiAgTG9nZ2VyID0gKGZ1bmN0aW9uKCl7XG4gICAgTG9nZ2VyLmRpc3BsYXlOYW1lID0gJ0xvZ2dlcic7XG4gICAgdmFyIHByb3RvdHlwZSA9IExvZ2dlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTG9nZ2VyO1xuICAgIGZ1bmN0aW9uIExvZ2dlcihvcHRzKXtcbiAgICAgIHZhciByZWYkO1xuICAgICAgdGhpcy5vcHRzID0gb3B0cyAhPSBudWxsXG4gICAgICAgID8gb3B0c1xuICAgICAgICA6IHt9O1xuICAgICAgKHJlZiQgPSB0aGlzLm9wdHMpLmxldmVsID09IG51bGwgJiYgKHJlZiQubGV2ZWwgPSAnZGVidWcnKTtcbiAgICAgIChyZWYkID0gdGhpcy5vcHRzKS5lcnJvdXQgPT0gbnVsbCAmJiAocmVmJC5lcnJvdXQgPSBwcm9jZXNzLnN0ZGVycik7XG4gICAgICAocmVmJCA9IHRoaXMub3B0cykub3V0ID09IG51bGwgJiYgKHJlZiQub3V0ID0gcHJvY2Vzcy5zdGRvdXQpO1xuICAgICAgKHJlZiQgPSB0aGlzLm9wdHMpLmNvbG9ycyA9PSBudWxsICYmIChyZWYkLmNvbG9ycyA9IHR0eS5pc2F0dHkodGhpcy5vcHRzLm91dCkgJiYgdHR5LmlzYXR0eSh0aGlzLm9wdHMuZXJyb3V0KSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0cy5sZXZlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5vcHRzLmxldmVsID0gbGV2ZWxzLmluZGV4T2YodGhpcy5vcHRzLmxldmVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcHJvdG90eXBlLmNoZWNrTGV2ZWwgPSBmdW5jdGlvbihpdCl7XG4gICAgICB2YXIgb2s7XG4gICAgICBvayA9IHR5cGVvZiBpdCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBsZXZlbHMuaW5kZXhPZihpdCkgIT09IC0xXG4gICAgICAgIDogdHlwZW9mIGl0ID09PSAnbnVtYmVyJyA/IGxldmVsc1tpdF0gIT0gbnVsbCA6IGZhbHNlO1xuICAgICAgaWYgKCFvaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxldmVsOiBcIiArIGl0KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHByb3RvdHlwZS5sb2dnZXIgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoTG9nZ2VyLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gICAgfTtcbiAgICBwcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24obGV2ZWwsIHRleHQpe1xuICAgICAgdGhpcy5jaGVja0xldmVsKGxldmVsKTtcbiAgICAgIGlmIChsZXZlbCA9PT0gMiB8fCBsZXZlbCA9PT0gMykge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRzLmVycm91dC53cml0ZSh0ZXh0ICsgXCJcXG5cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRzLm91dC53cml0ZSh0ZXh0ICsgXCJcXG5cIik7XG4gICAgICB9XG4gICAgfTtcbiAgICBwcm90b3R5cGUuZm10ID0gZnVuY3Rpb24obGV2ZWwpe1xuICAgICAgdmFyIHBhcnRzO1xuICAgICAgcGFydHMgPSBzbGljZSQuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgdGhpcy5jaGVja0xldmVsKGxldmVsKTtcbiAgICAgIHJldHVybiBmb250W2NvbG9yc1tsZXZlbF1dKFwiW1wiICsgbGV2ZWxzW2xldmVsXSArIFwiXVwiKSArIFwiIFwiICsgdXRpbC5mb3JtYXQuYXBwbHkodXRpbCwgcGFydHMpO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKGxldmVsKXtcbiAgICAgIHZhciBwYXJ0cztcbiAgICAgIHBhcnRzID0gc2xpY2UkLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHRoaXMuY2hlY2tMZXZlbChsZXZlbCk7XG4gICAgICBpZiAodHlwZW9mIGxldmVsID09PSAnc3RyaW5nJykge1xuICAgICAgICBsZXZlbCA9IGxldmVscy5pbmRleE9mKGxldmVsKTtcbiAgICAgIH1cbiAgICAgIGlmIChsZXZlbCA+PSB0aGlzLm9wdHMubGV2ZWwpIHtcbiAgICAgICAgdGhpcy5vdXRwdXQobGV2ZWwsIHRoaXMuZm10LmFwcGx5KHRoaXMsIFtsZXZlbF0uY29uY2F0KHNsaWNlJC5jYWxsKHBhcnRzKSkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBhO1xuICAgICAgYSA9IHNsaWNlJC5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2cuYXBwbHkodGhpcywgWydkZWJ1ZyddLmNvbmNhdChzbGljZSQuY2FsbChhKSkpO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIGE7XG4gICAgICBhID0gc2xpY2UkLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ2luZm8nXS5jb25jYXQoc2xpY2UkLmNhbGwoYSkpKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS53YXJuID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBhO1xuICAgICAgYSA9IHNsaWNlJC5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2cuYXBwbHkodGhpcywgWyd3YXJuJ10uY29uY2F0KHNsaWNlJC5jYWxsKGEpKSk7XG4gICAgfTtcbiAgICBwcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIGE7XG4gICAgICBhID0gc2xpY2UkLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLmxvZy5hcHBseSh0aGlzLCBbJ2Vycm9yJ10uY29uY2F0KHNsaWNlJC5jYWxsKGEpKSk7XG4gICAgfTtcbiAgICByZXR1cm4gTG9nZ2VyO1xuICB9KCkpO1xuICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBuZXcgTG9nZ2VyO1xufSkuY2FsbCh0aGlzKTtcbiIsIi8qIHZpbTpzZXQgdHM9MiBzdz0yIHN0cz0yIGV4cGFuZHRhYiAqL1xuLypqc2hpbnQgYXNpOiB0cnVlIG5ld2NhcDogdHJ1ZSB1bmRlZjogdHJ1ZSBlczU6IHRydWUgbm9kZTogdHJ1ZSBkZXZlbDogdHJ1ZVxuICAgICAgICAgZm9yaW46IGZhbHNlICovXG4vKmdsb2JhbCBkZWZpbmU6IHRydWUgKi9cblxuKHR5cGVvZiBkZWZpbmUgPT09IFwidW5kZWZpbmVkXCIgPyBmdW5jdGlvbiAoJCkgeyAkKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkgfSA6IGRlZmluZSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSwgdW5kZWZpbmVkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRVNDID0gJ1xcdTAwMWJbJ1xuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3NcbnZhciBTR1JfU1RZTEVTID0ge1xuICBib2xkOiAgICAgICAgICAgWyAxLCAgMjIgXSxcbiAgaXRhbGljOiAgICAgICAgIFsgMywgIDIzIF0sXG4gIHVuZGVybGluZTogICAgICBbIDQsICAyNCBdLFxuICBibGluazogICAgICAgICAgWyA1LCAgMjUgXSxcblxuICBpbnZlcnNlOiAgICAgICAgWyA3LCAgMjcgXSxcblxuICBmcmFtZTogICAgICAgICBbIDUxLCA1NCBdLFxuICBlbmNpcmNsZTogICAgICBbIDUyLCA1NCBdLFxuXG4gIG92ZXJsaW5lOiAgICAgICBbIDUzLCA1NSBdLFxuICBzdHJpa2V0aHJvdWdoOiAgWyA1MywgNTUgXVxufVxudmFyIFNHUl9DT0xPUlMgPSB7fVxudmFyIFNHUl9CQUNLUk9VTkRTID0ge31cbnZhciBDT0xPUlMgPSBbXG4gICdibGFjaycsXG4gICdyZWQnLFxuICAnZ3JlZW4nLFxuICAneWVsbG93JyxcbiAgJ2JsdWUnLFxuICAnbWFnZW50YScsXG4gICdjeWFuJyxcbiAgJ3doaXRlJ1xuXVxuXG5DT0xPUlMuZm9yRWFjaChmdW5jdGlvbihjb2xvciwgaW5kZXgpIHtcbiAgU0dSX0NPTE9SU1tjb2xvcl0gPSBbIDMwICsgaW5kZXgsIDM5IF1cbiAgU0dSX0JBQ0tST1VORFNbY29sb3JdID0gWyA0MCArIGluZGV4LCA0OSBdXG59KVxuXG5mdW5jdGlvbiBzZ3Iob3B0aW9ucywgaWQsIG1lc3NhZ2UpIHtcbiAgdmFyIHBhcmFtcyA9IG9wdGlvbnNbaWRdXG4gIGlmIChwYXJhbXMpIG1lc3NhZ2UgPSBFU0MgKyBwYXJhbXNbMF0gKyAnbScgKyBtZXNzYWdlICsgRVNDICsgcGFyYW1zWzFdICsgJ20nXG4gIHJldHVybiBtZXNzYWdlXG59XG5cbmV4cG9ydHMuc3R5bGUgPSBzZ3IuYmluZChudWxsLCBTR1JfU1RZTEVTKVxuZXhwb3J0cy5jb2xvciA9IHNnci5iaW5kKG51bGwsIFNHUl9DT0xPUlMpXG5leHBvcnRzLmJhY2tncm91bmQgPSBzZ3IuYmluZChudWxsLCBTR1JfQkFDS1JPVU5EUylcblxuT2JqZWN0LmtleXMoU0dSX1NUWUxFUykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gIGV4cG9ydHNbbmFtZV0gPSBleHBvcnRzLnN0eWxlLmJpbmQobnVsbCwgbmFtZSlcbn0pXG5PYmplY3Qua2V5cyhTR1JfQ09MT1JTKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgZXhwb3J0c1tuYW1lXSA9IGV4cG9ydHMuY29sb3IuYmluZChudWxsLCBuYW1lKVxuICBleHBvcnRzWydiZycgKyBuYW1lXSA9IGV4cG9ydHMuYmFja2dyb3VuZC5iaW5kKG51bGwsIG5hbWUpXG59KVxuXG52YXIgaW5kZXggPSAwXG53aGlsZShpbmRleCsrIDwgMjU2KSB7XG4gIFNHUl9DT0xPUlNbaW5kZXhdID0gWyczODs1OycgKyBpbmRleCwgMzldXG4gIFNHUl9CQUNLUk9VTkRTW2luZGV4XSA9IFsnNDg7NTsnICsgaW5kZXgsIDM5XVxufVxuXG59KTtcbiIsIlxuZnVuY3Rpb24gaW5qZWN0IChjaGFycykge1xuXG4gIGNoYXJzID0gY2hhcnMgfHxcbiAgJyEwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp+J1xuXG4gIGNoYXJzID0gY2hhcnMuc3BsaXQoJycpLnNvcnQoKS5qb2luKCcnKVxuXG4gIHZhciBleHBvcnRzID0gYmV0d2VlblxuXG4gIGV4cG9ydHMuYmV0d2VlbiAgID0gYmV0d2VlblxuXG4gIGV4cG9ydHMucmFuZHN0ciAgID0gcmFuZHN0clxuICBleHBvcnRzLmJldHdlZW4gICA9IGJldHdlZW5cbiAgZXhwb3J0cy5zdHJvcmQgICAgPSBzdHJvcmRcblxuICBleHBvcnRzLmxvICAgICAgICA9IGNoYXJzWzBdXG4gIGV4cG9ydHMuaGkgICAgICAgID0gY2hhcnNbY2hhcnMubGVuZ3RoIC0gMV1cblxuICBleHBvcnRzLmluamVjdCAgICA9IGluamVjdFxuXG4gIGZ1bmN0aW9uIHJhbmRzdHIobCkge1xuICAgIHZhciBzdHIgPSAnJ1xuICAgIHdoaWxlKGwtLSkgXG4gICAgICBzdHIgKz0gY2hhcnNbXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgTWF0aC5yYW5kb20oKSAqIGNoYXJzLmxlbmd0aCBcbiAgICAgICAgKVxuICAgICAgXVxuICAgIHJldHVybiBzdHJcbiAgfVxuXG4gIC8qXG4gICAgU09NRSBFWEFNUExFIFNUUklOR1MsIElOIE9SREVSXG4gICBcbiAgICAwXG4gICAgMDAwMDFcbiAgICAwMDAxXG4gICAgMDAxXG4gICAgMDAxMDAxXG4gICAgMDAxMDFcbiAgICAwMDExXG4gICAgMDAxMTAwMVxuICAgIDAwMTEwMDEwMVxuICAgIDAwMTEwMDExXG4gICAgMDAxMTAxXG4gICAgMDAxMTFcbiAgICAwMSAgXG5cbiAgICBpZiB5b3UgbmV2ZXIgbWFrZSBhIHN0cmluZyB0aGF0IGVuZHMgaW4gdGhlIGxvd2VzdCBjaGFyLFxuICAgIHRoZW4gaXQgaXMgYWx3YXlzIHBvc3NpYmxlIHRvIG1ha2UgYSBzdHJpbmcgYmV0d2VlbiB0d28gc3RyaW5ncy5cbiAgICB0aGlzIGlzIGxpa2UgaG93IGRlY2ltYWxzIG5ldmVyIGVuZCBpbiAwLiBcblxuICAgIGV4YW1wbGU6XG5cbiAgICBiZXR3ZWVuKCdBJywgJ0FCJykgXG5cbiAgICAuLi4gJ0FBJyB3aWxsIHNvcnQgYmV0d2VlbiAnQScgYW5kICdBQicgYnV0IHRoZW4gaXQgaXMgaW1wb3NzaWJsZVxuICAgIHRvIG1ha2UgYSBzdHJpbmcgaW5iZXR3ZWVuICdBJyBhbmQgJ0FBJy5cbiAgICBpbnN0ZWFkLCByZXR1cm4gJ0FBQicsIHRoZW4gdGhlcmUgd2lsbCBiZSBzcGFjZS5cblxuICAqL1xuXG4gIGZ1bmN0aW9uIGJldHdlZW4gKGEsIGIpIHtcblxuICAgIHZhciBzID0gJycsIGkgPSAwXG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuXG4gICAgICB2YXIgX2EgPSBjaGFycy5pbmRleE9mKGFbaV0pXG4gICAgICB2YXIgX2IgPSBjaGFycy5pbmRleE9mKGJbaV0pXG4gICAgIFxuICAgICAgaWYoX2EgPT0gLTEpIF9hID0gMFxuICAgICAgaWYoX2IgPT0gLTEpIF9iID0gY2hhcnMubGVuZ3RoIC0gMVxuXG4gICAgICBpKytcblxuICAgICAgdmFyIGMgPSBjaGFyc1tcbiAgICAgICAgICBfYSArIDEgPCBfYiBcbiAgICAgICAgPyBNYXRoLnJvdW5kKChfYStfYikvMilcbiAgICAgICAgOiBfYVxuICAgICAgXVxuXG4gICAgICBzICs9IGNcblxuICAgICAgaWYoYSA8IHMgJiYgcyA8IGIgJiYgYyAhPSBleHBvcnRzLmxvKVxuICAgICAgICByZXR1cm4gcztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdHJvcmQgKGEsIGIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgYSA9PSBiID8gIDBcbiAgICA6IGEgPCAgYiA/IC0xXG4gICAgOiAgICAgICAgICAgMVxuICAgIClcbiAgfVxuXG4gIGJldHdlZW4uc3Ryb3JkXG5cbiAgcmV0dXJuIGJldHdlZW5cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGluamVjdChudWxsKVxuIiwiXG52YXIgYmV0d2VlbiAgICAgPSByZXF1aXJlKCdiZXR3ZWVuJylcbnZhciBTY3V0dGxlYnV0dCA9IHJlcXVpcmUoJ3NjdXR0bGVidXR0JylcbnZhciBpbmhlcml0cyAgICA9IHJlcXVpcmUoJ3V0aWwnKS5pbmhlcml0c1xudmFyIGZpbHRlciAgICAgID0gcmVxdWlyZSgnc2N1dHRsZWJ1dHQvdXRpbCcpLmZpbHRlclxuXG5pbmhlcml0cyhSQXJyYXksIFNjdXR0bGVidXR0KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJBcnJheVxuXG5mdW5jdGlvbiBmdXp6ICgpIHtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiwgNSlcbn1cblxudmFyIERPRU1JVCA9IHRydWUsIENIQU5HRSA9IHt9XG5cbmZ1bmN0aW9uIG9yZGVyIChhLCBiKSB7XG4gIC8vdGltZXN0YW1wLCB0aGVuIHNvdXJjZVxuICByZXR1cm4gYmV0d2Vlbi5zdHJvcmQoYVsxXSwgYlsxXSkgfHwgYmV0d2Vlbi5zdHJvcmQoYVsyXSwgYlsyXSlcbn1cblxuZnVuY3Rpb24gUkFycmF5ICgpIHtcbiAgU2N1dHRsZWJ1dHQuY2FsbCh0aGlzKVxuICB0aGlzLmtleXMgPSBbXVxuICB0aGlzLnN0b3JlID0ge31cbiAgdGhpcy5faGlzdCA9IHt9XG4gIHRoaXMubGVuZ3RoID0gMFxuICBpZihhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgO1tdLmZvckVhY2guY2FsbChhcmd1bWVudHMsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBzZWxmLnB1c2goZSlcbiAgICB9KVxuICB9XG59XG5cbnZhciBBID0gUkFycmF5LnByb3RvdHlwZVxuXG5BLmxhc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmtleXNbdGhpcy5rZXlzLmxlbmd0aCAtIDFdXG59XG5cbkEuZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmtleXNbMF1cbn1cblxuQS5pbnNlcnQgPSBmdW5jdGlvbiAoYmVmb3JlLCB2YWwsIGFmdGVyKSB7ICBcbiAgdmFyIGtleSA9IGJldHdlZW4oYmVmb3JlIHx8IGJldHdlZW4ubG8sIGFmdGVyIHx8IGJldHdlZW4uaGkpICsgZnV6eigpXG4gIHRoaXMuc2V0KGtleSwgdmFsKVxuICByZXR1cm4ga2V5XG59XG5cbkEucHVzaCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgdmFyIGtleSA9IHRoaXMuaW5zZXJ0KHRoaXMubGFzdCgpLCB2YWwpXG59XG5cbkEudW5zaGlmdCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgdmFyIGtleSA9IHRoaXMuaW5zZXJ0KG51bGwsIHZhbCwgdGhpcy5maXJzdCgpKVxufVxuXG5BLmluZGV4T2YgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGZvcih2YXIgaSBpbiB0aGlzLmtleXMpIHtcbiAgICB2YXIga2V5ID0gdGhpcy5rZXlzW2ldXG4gICAgaWYodiA9PT0gdGhpcy5nZXQoa2V5KSkgcmV0dXJuIGlcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5BLmluZGV4T2ZLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiB0aGlzLmtleXMuaW5kZXhPZihrZXkpXG59XG5cbkEudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JlXG4gIHZhciBzZWxmID0gdGhpc1xuICByZXR1cm4gdGhpcy5rZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0KGtleSlcbiAgfSlcbn1cblxuQS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgaWYoJ3N0cmluZycgPT0gdHlwZW9mIGtleSkge1xuICAgIGlmKHZhbCA9PT0gbnVsbCkgcmV0dXJuIHRoaXMudW5zZXQoa2V5KVxuICAgIGlmKG51bGwgPT0gdGhpcy5zdG9yZVtrZXldKSB0aGlzLmxlbmd0aCArK1xuICAgIHRoaXMuc3RvcmVba2V5XSA9IHZhbFxuICAgIGlmKCF+dGhpcy5rZXlzLmluZGV4T2Yoa2V5KSkge1xuICAgICAgdGhpcy5rZXlzLnB1c2goa2V5KVxuICAgICAgdGhpcy5rZXlzLnNvcnQoKVxuICAgIH1cbiAgICBDSEFOR0Vba2V5XSA9IHZhbFxuICAgIERPRU1JVCAmJiB0aGlzLl9lbWl0KClcbiAgfVxufVxuXG5BLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuc3RvcmVba2V5XVxufVxuXG5BLnVuc2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICBpZignc3RyaW5nJyA9PSB0eXBlb2Yga2V5KSB7XG4gICAgaWYobnVsbCAhPSB0aGlzLnN0b3JlW2tleV0pIHRoaXMubGVuZ3RoIC0tXG4gICAgZGVsZXRlIHRoaXMuc3RvcmVba2V5XVxuICAgIHZhciBpID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KVxuICAgIGlmKCF+aSkgcmV0dXJuXG4gICAgdGhpcy5rZXlzLnNwbGljZShpLCAxKSAgICBcblxuICAgIENIQU5HRVtrZXldID0gbnVsbFxuICAgIERPRU1JVCAmJiB0aGlzLl9lbWl0KClcbiAgfVxufVxuXG5BLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGwgPSB0aGlzLmxhc3QoKVxuICB2YXIgdmFsID0gdGhpcy5zdG9yZVtsXVxuICB0aGlzLnVuc2V0KGwpXG4gIHJldHVybiB2YWxcbn1cblxuQS5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGYgPSB0aGlzLmZpcnN0KClcbiAgdmFyIHZhbCA9IHRoaXMuc3RvcmVbZl1cbiAgdGhpcy51bnNldChmKVxuICByZXR1cm4gdmFsXG59XG5cbkEuX2VtaXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmKCFET0VNSVQpIHJldHVyblxuICB0aGlzLmxvY2FsVXBkYXRlKENIQU5HRSlcbiAgQ0hBTkdFID0ge31cbn1cblxuQS5zcGxpY2UgPSBmdW5jdGlvbiAoaSwgZCAvKiwuLi5hcmdzKi8pIHtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMilcbiAgdmFyIGogPSAwLCBsID0gYXJncy5sZW5ndGhcblxuICBET0VNSVQgPSBmYWxzZVxuXG4gIGlmKGQgKyBpID4gdGhpcy5rZXlzLmxlbmd0aClcbiAgICBkID0gdGhpcy5rZXlzLmxlbmd0aCAtIGlcbiAgXG4gIHdoaWxlKGogPCBkKSB7XG4gICAgaWYoaiA8IGwpXG4gICAgICB0aGlzLnNldCh0aGlzLmtleXNbaStqXSwgYXJnc1tqXSksIGorK1xuICAgIGVsc2VcbiAgICAgIHRoaXMudW5zZXQodGhpcy5rZXlzW2kral0pLCBkLS1cbiAgfVxuXG4gIHdoaWxlKGogPCBsKVxuICAgIHRoaXMuaW5zZXJ0KHRoaXMua2V5c1tpK2otMV0sIGFyZ3Nbal0sIHRoaXMua2V5c1tpK2pdKSwgaisrXG5cbiAgRE9FTUlUID0gdHJ1ZVxuICB0aGlzLl9lbWl0KClcbn1cblxuQS5hcHBseVVwZGF0ZSA9IGZ1bmN0aW9uICh1cGRhdGUpIHtcbiAgRE9FTUlUID0gZmFsc2VcbiAgdmFyIGNoYW5nZSA9IHVwZGF0ZVswXSwgb2xkXG4gIHZhciBhcHBseSA9IHt9LCBjaCA9IHt9XG4gIHZhciBvbGQgPSB7fVxuICBmb3IodmFyIGtleSBpbiBjaGFuZ2UpIHtcbiAgICBpZighdGhpcy5faGlzdFtrZXldIHx8IG9yZGVyKHVwZGF0ZSwgdGhpcy5faGlzdFtrZXldKSA+IDApXG4gICAgICBhcHBseVtrZXldID0gY2hhbmdlW2tleV1cbiAgfVxuICAvL2FsbG93IHRoZSB1c2VyIHRvIHNlZSB3aGF0IHRoZSBjaGFuZ2UgaXMgZ29pbmcgdG8gYmUuXG4gIHRoaXMuZW1pdCgncHJldXBkYXRlJywgYXBwbHkpIFxuXG4gIC8vYXBwbHkgdGhlIGNoYW5nZS4uLlxuICBmb3IodmFyIGtleSBpbiBhcHBseSkge1xuICAgIHZhciBvID0gdGhpcy5faGlzdFtrZXldXG4gICAgbyAmJiAob2xkW29bMV0rJzonK29bMl1dID0gbykgLy90czpzb3VyY2VcbiAgICB0aGlzLl9oaXN0W2tleV0gPSB1cGRhdGVcbiAgICB0aGlzLnNldChrZXksIGFwcGx5W2tleV0pXG4gIH1cblxuICAvL2NoZWNrIGlmIG9sZCBlbGVtZW50cyBuZWVkIHRvIGJlIHJlbW92ZWQuXG4gIC8vbWF5IGFsc28gd2FudCB0byBrZWVwIG9sZCB1cGRhdGVzIGhhbmdpbmcgYXJvdW5kIFxuICAvL3NvIHRoZSB1c2VyIGNhbiBzZWUgcmVjZW50IGhpc3RvcnkuLi5cbiAgZm9yKHZhciBpZCBpbiBvbGQpIHtcbiAgICB2YXIgbyA9IG9sZFtpZF1bMF0sIHJtID0gdHJ1ZVxuICAgIGZvcih2YXIga2V5IGluIG8pIHtcbiAgICAgIGlmKHRoaXMuX2hpc3Rba2V5XSA9PT0gb2xkW2lkXSkgcm0gPSBmYWxzZVxuICAgIH1cbiAgICBpZihybSlcbiAgICAgIHRoaXMuZW1pdCgnX3JlbW92ZScsIG9sZFtpZF0pXG4gIH1cbiAgICBcbiAgRE9FTUlUID0gdHJ1ZVxuICBDSEFOR0UgPSB7fVxuICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGFwcGx5KVxuICByZXR1cm4gdHJ1ZVxufVxuXG5cbkEuaGlzdG9yeSA9IGZ1bmN0aW9uIChzb3VyY2VzKSB7XG4gIHZhciBoID0gW11cbiAgZm9yICh2YXIga2V5IGluIHRoaXMuX2hpc3QpIHtcbiAgICB2YXIgdXBkYXRlID0gdGhpcy5faGlzdFtrZXldXG4gICAgICBpZighfmguaW5kZXhPZih1cGRhdGUpICYmIGZpbHRlcih1cGRhdGUsIHNvdXJjZXMpKVxuICAgICAgICBoLnB1c2godXBkYXRlKVxuICB9XG4gIHJldHVybiBoLnNvcnQob3JkZXIpXG59XG5cbkEuZm9yRWFjaCA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgcmV0dXJuIHRoaXMudG9KU09OKCkuZm9yRWFjaChmdW4pXG59XG5cbkEuZmlsdGVyID0gZnVuY3Rpb24gKGZ1bikge1xuICByZXR1cm4gdGhpcy50b0pTT04oKS5maWx0ZXIoZnVuKVxufVxuXG5BLm1hcCA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgcmV0dXJuIHRoaXMudG9KU09OKCkubWFwKGZ1bilcbn1cblxuQS5yZWR1Y2UgPSBmdW5jdGlvbiAoZnVuLCBpbml0aWFsKSB7XG4gIHJldHVybiB0aGlzLnRvSlNPTigpLnJlZHVjZShmdW4sIGluaXRpYWwpXG59XG5cbi8vLmxlbmd0aCBpcyBhIHByb3BlcnR5LCBub3QgYSBmdW5jdGlvbi5cbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTt2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG52YXIgaSA9IHJlcXVpcmUoJ2l0ZXJhdGUnKVxudmFyIGR1cGxleCA9IHJlcXVpcmUoJ2R1cGxleCcpXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHNcbnZhciBzZXJpYWxpemVyID0gcmVxdWlyZSgnc3RyZWFtLXNlcmlhbGl6ZXInKVxudmFyIHUgPSByZXF1aXJlKCcuL3V0aWwnKVxudmFyIHRpbWVzdGFtcCA9IHJlcXVpcmUoJ21vbm90b25pYy10aW1lc3RhbXAnKVxuXG5leHBvcnRzID0gXG5tb2R1bGUuZXhwb3J0cyA9IFNjdXR0bGVidXR0XG5cbmV4cG9ydHMuY3JlYXRlSUQgPSB1LmNyZWF0ZUlEXG5leHBvcnRzLnVwZGF0ZUlzUmVjZW50ID0gdS5maWx0ZXJcbmV4cG9ydHMuZmlsdGVyID0gdS5maWx0ZXJcbmV4cG9ydHMudGltZXN0YW1wID0gdGltZXN0YW1wXG5cbmZ1bmN0aW9uIGR1dHlPZlN1YmNsYXNzKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ21ldGhvZCBtdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJylcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGUgKGRhdGEpIHtcbiAgaWYoIShBcnJheS5pc0FycmF5KGRhdGEpIFxuICAgICYmICdzdHJpbmcnID09PSB0eXBlb2YgZGF0YVsyXVxuICAgICYmICdfX3Byb3RvX18nICAgICAhPT0gZGF0YVsyXSAvL1RISVMgV09VTEQgQlJFQUsgU1RVRkZcbiAgICAmJiAnbnVtYmVyJyA9PT0gdHlwZW9mIGRhdGFbMV1cbiAgKSkgcmV0dXJuIGZhbHNlXG5cbiAgcmV0dXJuIHRydWVcbn1cblxudmFyIGVtaXQgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRcblxuaW5oZXJpdHMgKFNjdXR0bGVidXR0LCBFdmVudEVtaXR0ZXIpXG5cbmZ1bmN0aW9uIFNjdXR0bGVidXR0IChvcHRzKSB7XG5cbiAgaWYoISh0aGlzIGluc3RhbmNlb2YgU2N1dHRsZWJ1dHQpKSByZXR1cm4gbmV3IFNjdXR0bGVidXR0KG9wdHMpXG4gIHZhciBpZCA9ICdzdHJpbmcnID09PSB0eXBlb2Ygb3B0cyA/IG9wdHMgOiBvcHRzICYmIG9wdHMuaWRcbiAgdGhpcy5zb3VyY2VzID0ge31cbiAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMoTnVtYmVyLk1BWF9WQUxVRSlcbiAgLy9jb3VudCBob3cgbWFueSBvdGhlciBpbnN0YW5jZXMgd2UgYXJlIHJlcGxpY2F0aW5nIHRvLlxuICB0aGlzLl9zdHJlYW1zID0gMFxuICBpZihvcHRzICYmIG9wdHMuc2lnbiAmJiBvcHRzLnZlcmlmeSkge1xuICAgIHRoaXMuc2V0SWQob3B0cy5pZCB8fCBvcHRzLmNyZWF0ZUlkKCkpXG4gICAgdGhpcy5fc2lnbiAgID0gb3B0cy5zaWduXG4gICAgdGhpcy5fdmVyaWZ5ID0gb3B0cy52ZXJpZnlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnNldElkKGlkIHx8IHUuY3JlYXRlSWQoKSlcbiAgfVxufVxuXG52YXIgc2IgPSBTY3V0dGxlYnV0dC5wcm90b3R5cGVcblxudmFyIGVtaXQgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRcblxuc2IuYXBwbHlVcGRhdGUgPSBkdXR5T2ZTdWJjbGFzc1xuc2IuaGlzdG9yeSAgICAgID0gZHV0eU9mU3ViY2xhc3Ncblxuc2IubG9jYWxVcGRhdGUgPSBmdW5jdGlvbiAodHJ4KSB7XG4gIHRoaXMuX3VwZGF0ZShbdHJ4LCB0aW1lc3RhbXAoKSwgdGhpcy5pZF0pXG4gIHJldHVybiB0aGlzXG59XG5cbnNiLl91cGRhdGUgPSBmdW5jdGlvbiAodXBkYXRlKSB7XG4gIC8vdmFsaWRhdGVkIHdoZW4gaXQgY29tZXMgaW50byB0aGUgc3RyZWFtXG4gIHZhciB0cyA9IHVwZGF0ZVsxXVxuICB2YXIgc291cmNlID0gdXBkYXRlWzJdXG4gIC8vaWYgdGhpcyBtZXNzYWdlIGlzIG9sZCBmb3IgaXQncyBzb3VyY2UsXG4gIC8vaWdub3JlIGl0LiBpdCdzIG91dCBvZiBvcmRlci5cbiAgLy9lYWNoIG5vZGUgbXVzdCBlbWl0IGl0J3MgY2hhbmdlcyBpbiBvcmRlciFcbiAgXG4gIHZhciBsYXRlc3QgPSB0aGlzLnNvdXJjZXNbc291cmNlXVxuICBpZihsYXRlc3QgJiYgbGF0ZXN0ID49IHRzKVxuICAgIHJldHVybiBlbWl0LmNhbGwodGhpcywgJ29sZF9kYXRhJywgdXBkYXRlKSwgZmFsc2VcblxuICB0aGlzLnNvdXJjZXNbc291cmNlXSA9IHRzXG5cbiAgdmFyIHNlbGYgPSB0aGlzXG4gIGZ1bmN0aW9uIGRpZFZlcmlmaWNhdGlvbiAoZXJyLCB2ZXJpZmllZCkge1xuXG4gICAgLy8gSSdtIG5vdCBzdXJlIGhvdyB3aGF0IHNob3VsZCBoYXBwZW4gaWYgYSBhc3luYyB2ZXJpZmljYXRpb25cbiAgICAvLyBlcnJvcnMuIGlmIGl0J3MgYW4ga2V5IG5vdCBmb3VuZCAtIHRoYXQgaXMgYSB2ZXJpZmljYXRpb24gZmFpbCxcbiAgICAvLyBub3QgYSBlcnJvci4gaWYgaXQncyBnZW51bmllIGVycm9yLCByZWFsbHkgeW91IHNob3VsZCBxdWV1ZSBhbmQgXG4gICAgLy8gdHJ5IGFnYWluPyBvciByZXBsYXkgdGhlIG1lc3NhZ2UgbGF0ZXJcbiAgICAvLyAtLSB0aGlzIHNob3VsZCBiZSBkb25lIG15IHRoZSBzZWN1cml0eSBwbHVnaW4gdGhvdWdoLCBub3Qgc2N1dHRsZWJ1dHQuXG5cbiAgICBpZihlcnIpXG4gICAgICByZXR1cm4gZW1pdC5jYWxsKHNlbGYsICdlcnJvcicsIGVycilcblxuICAgIGlmKCF2ZXJpZmllZClcbiAgICAgIHJldHVybiBlbWl0LmNhbGwoc2VsZiwgJ3VudmVyaWZpZWRfZGF0YScsIHVwZGF0ZSlcblxuICAgIC8vIGNoZWNrIGlmIHRoaXMgbWVzc2FnZSBpcyBvbGRlciB0aGFuXG4gICAgLy8gdGhlIHZhbHVlIHdlIGFscmVhZHkgaGF2ZS5cbiAgICAvLyBkbyBub3RoaW5nIGlmIHNvXG4gICAgLy8gZW1pdCBhbiAnb2xkX2RhdGEnIGV2ZW50IGJlY2F1c2UgaSdsbCB3YW50IHRvIHRyYWNrIGhvdyBtYW55XG4gICAgLy8gdW5uZWNlc3NhcnkgbWVzc2FnZXMgYXJlIHNlbnQuXG5cbiAgICBpZihzZWxmLmFwcGx5VXBkYXRlKHVwZGF0ZSkpXG4gICAgICBlbWl0LmNhbGwoc2VsZiwgJ191cGRhdGUnLCB1cGRhdGUpIC8vd3JpdGUgdG8gc3RyZWFtLlxuICB9XG5cbiAgaWYoc291cmNlICE9PSB0aGlzLmlkKSB7XG4gICAgaWYodGhpcy5fdmVyaWZ5KVxuICAgICAgdGhpcy5fdmVyaWZ5KHVwZGF0ZSwgZGlkVmVyaWZpY2F0aW9uKVxuICAgIGVsc2VcbiAgICAgIGRpZFZlcmlmaWNhdGlvbihudWxsLCB0cnVlKVxuICB9IGVsc2Uge1xuICAgIGlmKHRoaXMuX3NpZ24pIHtcbiAgICAgIC8vY291bGQgbWFrZSB0aGlzIGFzeW5jIGVhc2lseSBlbm91Z2guXG4gICAgICB1cGRhdGVbM10gPSB0aGlzLl9zaWduKHVwZGF0ZSlcbiAgICB9XG4gICAgZGlkVmVyaWZpY2F0aW9uKG51bGwsIHRydWUpXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5zYi5jcmVhdGVTdHJlYW0gPSBmdW5jdGlvbiAob3B0cykge1xuICB2YXIgc2VsZiA9IHRoaXNcbiAgLy90aGUgc291cmNlcyBmb3IgdGhlIHJlbW90ZSBlbmQuXG4gIHZhciBzb3VyY2VzID0ge30sIG90aGVyXG4gIHZhciBzeW5jU2VudCA9IGZhbHNlLCBzeW5jUmVjdiA9IGZhbHNlXG5cbiAgdGhpcy5fc3RyZWFtcyArK1xuXG4gIG9wdHMgPSBvcHRzIHx8IHt9XG4gIHZhciBkID0gZHVwbGV4KClcbiAgZC5uYW1lID0gb3B0cy5uYW1lXG4gIHZhciBvdXRlciA9IHNlcmlhbGl6ZXIob3B0cyAmJiBvcHRzLndyYXBwZXIpKGQpXG4gIG91dGVyLmlubmVyID0gZFxuXG4gIGQud3JpdGFibGUgPSBvcHRzLndyaXRhYmxlICE9PSBmYWxzZVxuICBkLnJlYWRhYmxlID0gb3B0cy5yZWFkYWJsZSAhPT0gZmFsc2VcblxuICBzeW5jUmVjdiAgID0gIWQud3JpdGFibGVcbiAgc3luY1NlbnQgICA9ICFkLnJlYWRhYmxlXG5cbiAgdmFyIHRhaWwgPSBvcHRzLnRhaWwgIT09IGZhbHNlIC8vZGVmYXVsdCB0byB0YWlsPXRydWVcblxuICBmdW5jdGlvbiBzdGFydCAoZGF0YSkge1xuICAgIC8vd2hlbiB0aGUgZGlnZXN0IGlzIHJlY2lldmVkIGZyb20gdGhlIG90aGVyIGVuZCxcbiAgICAvL3NlbmQgdGhlIGhpc3RvcnkuXG4gICAgLy9tZXJnZSB3aXRoIHRoZSBjdXJyZW50IGxpc3Qgb2Ygc291cmNlcy5cbiAgICBzb3VyY2VzID0gZGF0YS5jbG9ja1xuICAgIGkuZWFjaChzZWxmLmhpc3Rvcnkoc291cmNlcyksIGZ1bmN0aW9uIChkYXRhKSB7ZC5fZGF0YShkYXRhKX0pXG4gICAgXG4gICAgb3V0ZXIuZW1pdCgnaGVhZGVyJywgZGF0YSlcbiAgICBkLl9kYXRhKCdTWU5DJylcbiAgICAvL3doZW4gd2UgaGF2ZSBzZW50IGFsbCBoaXN0b3J5XG4gICAgb3V0ZXIuZW1pdCgnc3luY1NlbnQnKVxuICAgIHN5bmNTZW50ID0gdHJ1ZVxuICAgIC8vd2hlbiB3ZSBoYXZlIHJlY2lldmVkIGFsbCBoaXN0b3lyXG4gICAgLy9lbWl0ICdzeW5jZWQnIHdoZW4gdGhpcyBzdHJlYW0gaGFzIHN5bmNlZC5cbiAgICBpZihzeW5jUmVjdikgb3V0ZXIuZW1pdCgnc3luYycpLCBvdXRlci5lbWl0KCdzeW5jZWQnKVxuICAgIGlmKCF0YWlsKSBkLl9lbmQoKVxuICB9XG5cbiAgZFxuICAgIC5vbignX2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgLy9pZiBpdCdzIGFuIGFycmF5LCBpdCdzIGFuIHVwZGF0ZS5cbiAgICAgIGlmKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgaWYodmFsaWRhdGUoZGF0YSkpXG4gICAgICAgICAgcmV0dXJuIHNlbGYuX3VwZGF0ZShkYXRhKVxuICAgICAgfVxuICAgICAgLy9pZiBpdCdzIGFuIG9iamVjdCwgaXQncyBhIHNjdXR0bGVidXQgZGlnZXN0LlxuICAgICAgZWxzZSBpZignb2JqZWN0JyA9PT0gdHlwZW9mIGRhdGEgJiYgZGF0YSlcbiAgICAgICAgc3RhcnQoZGF0YSlcbiAgICAgIGVsc2UgaWYoJ3N0cmluZycgPT09IHR5cGVvZiBkYXRhICYmIGRhdGEgPT0gJ1NZTkMnKSB7XG4gICAgICAgIHN5bmNSZWN2ID0gdHJ1ZVxuICAgICAgICBvdXRlci5lbWl0KCdzeW5jUmVjaWV2ZWQnKVxuICAgICAgICBpZihzeW5jU2VudCkgb3V0ZXIuZW1pdCgnc3luYycpLCBvdXRlci5lbWl0KCdzeW5jZWQnKVxuICAgICAgfVxuICAgIH0pLm9uKCdfZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgZC5fZW5kKClcbiAgICB9KVxuICAgIC5vbignY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCdfdXBkYXRlJywgb25VcGRhdGUpXG4gICAgICAvL2VtaXQgdGhlIG51bWJlciBvZiBzdHJlYW1zIHRoYXQgYXJlIHJlbWFpbmluZy4uLlxuICAgICAgLy90aGlzIHdpbGwgYmUgdXNlZCBmb3IgbWVtb3J5IG1hbmFnZW1lbnQuLi5cbiAgICAgIHNlbGYuX3N0cmVhbXMgLS1cbiAgICAgIGVtaXQuY2FsbChzZWxmLCAndW5zdHJlYW0nLCBzZWxmLl9zdHJlYW1zKVxuICAgIH0pXG5cbiAgaWYob3B0cyAmJiBvcHRzLnRhaWwgPT09IGZhbHNlKSB7XG4gICAgb3V0ZXIub24oJ3N5bmMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZC5fZW5kKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiBvblVwZGF0ZSAodXBkYXRlKSB7IC8vdmFsdWUsIHNvdXJjZSwgdHNcbiAgICBpZighdmFsaWRhdGUodXBkYXRlKSB8fCAhdS5maWx0ZXIodXBkYXRlLCBzb3VyY2VzKSlcbiAgICAgIHJldHVyblxuXG4gICAgZC5fZGF0YSh1cGRhdGUpXG5cbiAgICAvL3JlYWxseSwgdGhpcyBzaG91bGQgaGFwcGVuIGJlZm9yZSBlbWl0dGluZy5cbiAgICB2YXIgdHMgPSB1cGRhdGVbMV1cbiAgICB2YXIgc291cmNlID0gdXBkYXRlWzJdXG4gICAgc291cmNlc1tzb3VyY2VdID0gdHNcbiAgfVxuXG4gIHZhciBvdXRnb2luZyA9IHsgaWQgOiBzZWxmLmlkLCBjbG9jayA6IHNlbGYuc291cmNlcyB9XG5cbiAgaWYgKG9wdHMgJiYgb3B0cy5tZXRhKSBvdXRnb2luZy5tZXRhID0gb3B0cy5tZXRhXG5cbiAgaWYoZC5yZWFkYWJsZSkge1xuICAgIGQuX2RhdGEob3V0Z29pbmcpXG4gICAgaWYoIWQud3JpdGFibGUpXG4gICAgICBzdGFydCh7Y2xvY2s6e319KVxuICAgIGlmKHRhaWwpXG4gICAgICBzZWxmLm9uKCdfdXBkYXRlJywgb25VcGRhdGUpXG4gIH1cblxuICBzZWxmLm9uY2UoJ2Rpc3Bvc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgZC5lbmQoKVxuICB9KVxuXG4gIHJldHVybiBvdXRlclxufVxuXG5zYi5jcmVhdGVXcml0ZVN0cmVhbSA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9XG4gIG9wdHMud3JpdGFibGUgPSB0cnVlOyBvcHRzLnJlYWRhYmxlID0gZmFsc2VcbiAgcmV0dXJuIHRoaXMuY3JlYXRlU3RyZWFtKG9wdHMpXG59XG5cbnNiLmNyZWF0ZVJlYWRTdHJlYW0gPSBmdW5jdGlvbiAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLndyaXRhYmxlID0gZmFsc2U7IG9wdHMucmVhZGFibGUgPSB0cnVlXG4gIHJldHVybiB0aGlzLmNyZWF0ZVN0cmVhbShvcHRzKVxufVxuXG5zYi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICBlbWl0LmNhbGwodGhpcywgJ2Rpc3Bvc2UnKVxufVxuXG5zYi5zZXRJZCA9IGZ1bmN0aW9uIChpZCkge1xuICBpZignX19wcm90b19fJyA9PT0gaWQpIHRocm93IG5ldyBFcnJvcignX19wcm90b19fIGlzIGludmFsaWQgaWQnKVxuICBpZihpZCA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ251bGwgaXMgbm90IGludmFsaWQgaWQnKVxuICB0aGlzLmlkID0gaWRcbiAgcmV0dXJuIHRoaXNcbn1cblxuZnVuY3Rpb24gc3RyZWFtRG9uZShzdHJlYW0sIGxpc3RlbmVyKSB7XG5cbiAgZnVuY3Rpb24gcmVtb3ZlICgpIHtcbiAgICBzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsICAgb25Eb25lKVxuICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbkRvbmUpXG4gICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsICAgb25Eb25lKVxuICB9XG4gIGZ1bmN0aW9uIG9uRG9uZSAoYXJnKSB7XG4gICAgcmVtb3ZlKClcbiAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGFyZylcbiAgfVxuXG4gIC8vdGhpcyBtYWtlcyBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikgc3RpbGwgd29ya1xuICBvbkRvbmUubGlzdGVuZXIgPSBsaXN0ZW5lclxuXG4gIHN0cmVhbS5vbignZW5kJywgICBvbkRvbmUpXG4gIHN0cmVhbS5vbignZXJyb3InLCBvbkRvbmUpXG4gIHN0cmVhbS5vbignY2xvc2UnLCBvbkRvbmUpXG59XG5cbi8vY3JlYXRlIGFub3RoZXIgaW5zdGFuY2Ugb2YgdGhpcyBzY3V0dGxlYnV0dCxcbi8vdGhhdCBpcyBpbiBzeW5jIGFuZCBhdHRhY2hlZCB0byB0aGlzIGluc3RhbmNlLlxuc2IuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBBID0gdGhpc1xuICB2YXIgQiA9IG5ldyAoQS5jb25zdHJ1Y3RvcilcbiAgQi5zZXRJZChBLmlkKSAvL3NhbWUgaWQuIHRoaW5rIHRoaXMgd2lsbCB3b3JrLi4uXG5cbiAgQS5fY2xvbmVzID0gKEEuX2Nsb25lcyB8fCAwKSArIDFcblxuICB2YXIgYSA9IEEuY3JlYXRlU3RyZWFtKHt3cmFwcGVyOiAncmF3J30pXG4gIHZhciBiID0gQi5jcmVhdGVTdHJlYW0oe3dyYXBwZXI6ICdyYXcnfSlcblxuICAvL2FsbCB1cGRhdGVzIG11c3QgYmUgc3luYywgc28gbWFrZSBzdXJlIHBhdXNlIG5ldmVyIGhhcHBlbnMuXG4gIGEucGF1c2UgPSBiLnBhdXNlID0gZnVuY3Rpb24gbm9vcCgpe31cblxuICBzdHJlYW1Eb25lKGIsIGZ1bmN0aW9uICgpIHtcbiAgICBBLl9jbG9uZXMtLVxuICAgIGVtaXQuY2FsbChBLCAndW5jbG9uZScsIEEuX2Nsb25lcylcbiAgfSlcblxuICBhLnBpcGUoYikucGlwZShhKVxuICAvL3Jlc3VtZSBib3RoIHN0cmVhbXMsIHNvIHRoYXQgdGhlIG5ldyBpbnN0YW5jZSBpcyBicm91Z2h0IHVwIHRvIGRhdGUgaW1tZWRpYXRlbHkuXG4gIGEucmVzdW1lKClcbiAgYi5yZXN1bWUoKVxuXG4gIHJldHVybiBCXG59XG5cbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTt2YXIgU3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAod3JpdGUsIGVuZCkge1xuICB2YXIgc3RyZWFtID0gbmV3IFN0cmVhbSgpIFxuICB2YXIgYnVmZmVyID0gW10sIGVuZGVkID0gZmFsc2UsIGRlc3Ryb3llZCA9IGZhbHNlLCBlbWl0RW5kXG4gIHN0cmVhbS53cml0YWJsZSA9IHN0cmVhbS5yZWFkYWJsZSA9IHRydWVcbiAgc3RyZWFtLnBhdXNlZCA9IGZhbHNlXG4gIHN0cmVhbS5fcGF1c2VkID0gZmFsc2VcbiAgc3RyZWFtLmJ1ZmZlciA9IGJ1ZmZlclxuICBcbiAgc3RyZWFtXG4gICAgLm9uKCdwYXVzZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0cmVhbS5fcGF1c2VkID0gdHJ1ZVxuICAgIH0pXG4gICAgLm9uKCdkcmFpbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0cmVhbS5fcGF1c2VkID0gZmFsc2VcbiAgICB9KVxuICAgXG4gIGZ1bmN0aW9uIGRlc3Ryb3lTb29uICgpIHtcbiAgICBwcm9jZXNzLm5leHRUaWNrKHN0cmVhbS5kZXN0cm95LmJpbmQoc3RyZWFtKSlcbiAgfVxuXG4gIGlmKHdyaXRlKVxuICAgIHN0cmVhbS5vbignX2RhdGEnLCB3cml0ZSlcbiAgaWYoZW5kKVxuICAgIHN0cmVhbS5vbignX2VuZCcsIGVuZClcblxuICAvL2Rlc3Ryb3kgdGhlIHN0cmVhbSBvbmNlIGJvdGggZW5kcyBhcmUgb3ZlclxuICAvL2J1dCBkbyBpdCBpbiBuZXh0VGljaywgc28gdGhhdCBvdGhlciBsaXN0ZW5lcnNcbiAgLy9vbiBlbmQgaGF2ZSB0aW1lIHRvIHJlc3BvbmRcbiAgc3RyZWFtLm9uY2UoJ2VuZCcsIGZ1bmN0aW9uICgpIHsgXG4gICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2VcbiAgICBpZighc3RyZWFtLndyaXRhYmxlKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RyZWFtLmRlc3Ryb3koKVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG5cbiAgc3RyZWFtLm9uY2UoJ19lbmQnLCBmdW5jdGlvbiAoKSB7IFxuICAgIHN0cmVhbS53cml0YWJsZSA9IGZhbHNlXG4gICAgaWYoIXN0cmVhbS5yZWFkYWJsZSlcbiAgICAgIHN0cmVhbS5kZXN0cm95KClcbiAgfSlcblxuICAvLyB0aGlzIGlzIHRoZSBkZWZhdWx0IHdyaXRlIG1ldGhvZCxcbiAgLy8gaWYgeW91IG92ZXJpZGUgaXQsIHlvdSBhcmUgcmVzcG9zaWJsZVxuICAvLyBmb3IgcGF1c2Ugc3RhdGUuXG5cbiAgXG4gIHN0cmVhbS5fZGF0YSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYoIXN0cmVhbS5wYXVzZWQgJiYgIWJ1ZmZlci5sZW5ndGgpXG4gICAgICBzdHJlYW0uZW1pdCgnZGF0YScsIGRhdGEpXG4gICAgZWxzZSBcbiAgICAgIGJ1ZmZlci5wdXNoKGRhdGEpXG4gICAgcmV0dXJuICEoc3RyZWFtLnBhdXNlZCB8fCBidWZmZXIubGVuZ3RoKVxuICB9XG5cbiAgc3RyZWFtLl9lbmQgPSBmdW5jdGlvbiAoZGF0YSkgeyBcbiAgICBpZihkYXRhKSBzdHJlYW0uX2RhdGEoZGF0YSlcbiAgICBpZihlbWl0RW5kKSByZXR1cm5cbiAgICBlbWl0RW5kID0gdHJ1ZVxuICAgIC8vZGVzdHJveSBpcyBoYW5kbGVkIGFib3ZlLlxuICAgIHN0cmVhbS5kcmFpbigpXG4gIH1cblxuICBzdHJlYW0ud3JpdGUgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHN0cmVhbS5lbWl0KCdfZGF0YScsIGRhdGEpXG4gICAgcmV0dXJuICFzdHJlYW0uX3BhdXNlZFxuICB9XG5cbiAgc3RyZWFtLmVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzdHJlYW0ud3JpdGFibGUgPSBmYWxzZVxuICAgIGlmKHN0cmVhbS5lbmRlZCkgcmV0dXJuXG4gICAgc3RyZWFtLmVuZGVkID0gdHJ1ZVxuICAgIHN0cmVhbS5lbWl0KCdfZW5kJylcbiAgfVxuXG4gIHN0cmVhbS5kcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZighYnVmZmVyLmxlbmd0aCAmJiAhZW1pdEVuZCkgcmV0dXJuXG4gICAgLy9pZiB0aGUgc3RyZWFtIGlzIHBhdXNlZCBhZnRlciBqdXN0IGJlZm9yZSBlbWl0RW5kKClcbiAgICAvL2VuZCBzaG91bGQgYmUgYnVmZmVyZWQuXG4gICAgd2hpbGUoIXN0cmVhbS5wYXVzZWQpIHtcbiAgICAgIGlmKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBidWZmZXIuc2hpZnQoKSlcbiAgICAgICAgaWYoYnVmZmVyLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgc3RyZWFtLmVtaXQoJ19kcmFpbicpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoZW1pdEVuZCAmJiBzdHJlYW0ucmVhZGFibGUpIHtcbiAgICAgICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2VcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2VuZCcpXG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9pZiB0aGUgYnVmZmVyIGhhcyBlbXB0aWVkLiBlbWl0IGRyYWluLlxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB2YXIgc3RhcnRlZCA9IGZhbHNlXG4gIHN0cmVhbS5yZXN1bWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzIGlzIHdoZXJlIEkgbmVlZCBwYXVzZVJlYWQsIGFuZCBwYXVzZVdyaXRlLlxuICAgIC8vaGVyZSB0aGUgcmVhZGluZyBzaWRlIGlzIHVucGF1c2VkLFxuICAgIC8vYnV0IHRoZSB3cml0aW5nIHNpZGUgbWF5IHN0aWxsIGJlIHBhdXNlZC5cbiAgICAvL3RoZSB3aG9sZSBidWZmZXIgbWlnaHQgbm90IGVtcGl0eSBhdCBvbmNlLlxuICAgIC8vaXQgbWlnaHQgcGF1c2UgYWdhaW4uXG4gICAgLy90aGUgc3RyZWFtIHNob3VsZCBuZXZlciBlbWl0IGRhdGEgaW5iZXR3ZWVuIHBhdXNlKCkuLi5yZXN1bWUoKVxuICAgIC8vYW5kIHdyaXRlIHNob3VsZCByZXR1cm4gIWJ1ZmZlci5sZW5ndGhcbiAgICBzdGFydGVkID0gdHJ1ZVxuICAgIHN0cmVhbS5wYXVzZWQgPSBmYWxzZVxuICAgIHN0cmVhbS5kcmFpbigpIC8vd2lsbCBlbWl0IGRyYWluIGlmIGJ1ZmZlciBlbXB0aWVzLlxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuXG4gIHN0cmVhbS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKGRlc3Ryb3llZCkgcmV0dXJuXG4gICAgZGVzdHJveWVkID0gZW5kZWQgPSB0cnVlICAgICBcbiAgICBidWZmZXIubGVuZ3RoID0gMFxuICAgIHN0cmVhbS5lbWl0KCdjbG9zZScpXG4gIH1cbiAgdmFyIHBhdXNlQ2FsbGVkID0gZmFsc2VcbiAgc3RyZWFtLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgIHN0YXJ0ZWQgPSB0cnVlXG4gICAgc3RyZWFtLnBhdXNlZCA9IHRydWVcbiAgICBzdHJlYW0uZW1pdCgnX3BhdXNlJylcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cbiAgc3RyZWFtLl9wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZighc3RyZWFtLl9wYXVzZWQpIHtcbiAgICAgIHN0cmVhbS5fcGF1c2VkID0gdHJ1ZVxuICAgICAgc3RyZWFtLmVtaXQoJ3BhdXNlJylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBzdHJlYW0ucGF1c2VkID0gdHJ1ZVxuICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAvL3VubGVzcyB0aGUgdXNlciBtYW51YWxseSBwYXVzZWRcbiAgICBpZihzdGFydGVkKSByZXR1cm5cbiAgICBzdHJlYW0ucmVzdW1lKClcbiAgfSlcbiBcbiAgcmV0dXJuIHN0cmVhbVxufVxuXG4iLCJcbi8vXG4vLyBhZGRzIGFsbCB0aGUgZmllbGRzIGZyb20gb2JqMiBvbnRvIG9iajFcbi8vXG5cbnZhciBlYWNoID0gZXhwb3J0cy5lYWNoID0gZnVuY3Rpb24gKG9iaixpdGVyYXRvcil7XG4gdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopXG4ga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpe1xuICBpdGVyYXRvcihvYmpba2V5XSxrZXksb2JqKSBcbiB9KVxufVxuXG52YXIgUlggPSAvc2FkZi8uY29uc3RydWN0b3JcbmZ1bmN0aW9uIHJ4IChpdGVyYXRvciApe1xuICByZXR1cm4gaXRlcmF0b3IgaW5zdGFuY2VvZiBSWCA/IGZ1bmN0aW9uIChzdHIpIHsgXG4gICAgICB2YXIgbSA9IGl0ZXJhdG9yLmV4ZWMoc3RyKVxuICAgICAgcmV0dXJuIG0gJiYgKG1bMV0gPyBtWzFdIDogbVswXSkgXG4gICAgfSA6IGl0ZXJhdG9yXG59XG5cbnZhciB0aW1lcyA9IGV4cG9ydHMudGltZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgLCBpdGVyYXRvciA9IHJ4KGFyZ3MucG9wKCkpXG4gICAgLCBtID0gYXJncy5wb3AoKVxuICAgICwgaSA9IGFyZ3Muc2hpZnQoKVxuICAgICwgaiA9IGFyZ3Muc2hpZnQoKVxuICAgICwgZGlmZiwgZGlyXG4gICAgLCBhID0gW11cbiAgICBcbiAgICBpID0gJ251bWJlcicgPT09IHR5cGVvZiBpID8gaSA6IDFcbiAgICBkaWZmID0gaiA/IGogLSBpIDogMVxuICAgIGRpciA9IGkgPCBtXG4gICAgaWYobSA9PSBpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcyBjYW5ub3QgYmUgdGhlIHNhbWU6ICcrbSsnLCAnK2kpXG4gIGZvciAoOyBkaXIgPyBpIDw9IG0gOiBtIDw9IGk7IGkgKz0gZGlmZilcbiAgICBhLnB1c2goaXRlcmF0b3IoaSkpXG4gIHJldHVybiBhXG59XG5cbnZhciBtYXAgPSBleHBvcnRzLm1hcCA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yKXtcbiAgaXRlcmF0b3IgPSByeChpdGVyYXRvcilcbiAgaWYoQXJyYXkuaXNBcnJheShvYmopKVxuICAgIHJldHVybiBvYmoubWFwKGl0ZXJhdG9yKVxuICBpZignbnVtYmVyJyA9PT0gdHlwZW9mIG9iailcbiAgICByZXR1cm4gdGltZXMuYXBwbHkobnVsbCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKSAgXG4gIC8vcmV0dXJuIGlmIG51bGwgPyAgXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxuICAgICwgciA9IHt9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KXtcbiAgICByW2tleV0gPSBpdGVyYXRvcihvYmpba2V5XSxrZXksb2JqKSBcbiAgfSlcbiAgcmV0dXJuIHJcbn1cblxudmFyIGZpbmRSZXR1cm4gPSBleHBvcnRzLmZpbmRSZXR1cm4gPSBmdW5jdGlvbiAob2JqLCBpdGVyYXRvcikge1xuICBpdGVyYXRvciA9IHJ4KGl0ZXJhdG9yKVxuICBpZihvYmogPT0gbnVsbClcbiAgICByZXR1cm5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopXG4gICAgLCBsID0ga2V5cy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpICsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICwgdmFsdWUgPSBvYmpba2V5XVxuICAgIHZhciByID0gaXRlcmF0b3IodmFsdWUsIGtleSlcbiAgICBpZihyKSByZXR1cm4gclxuICB9XG59XG5cbnZhciBmaW5kID0gZXhwb3J0cy5maW5kID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IpIHsgXG4gIGl0ZXJhdG9yID0gcngoaXRlcmF0b3IpXG4gIHJldHVybiBmaW5kUmV0dXJuIChvYmosIGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgdmFyIHIgPSBpdGVyYXRvcih2LCBrKVxuICAgIGlmKHIpIHJldHVybiB2XG4gIH0pXG59XG5cbnZhciBmaW5kS2V5ID0gZXhwb3J0cy5maW5kS2V5ID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IpIHsgXG4gIGl0ZXJhdG9yID0gcngoaXRlcmF0b3IpXG4gIHJldHVybiBmaW5kUmV0dXJuIChvYmosIGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgdmFyIHIgPSBpdGVyYXRvcih2LCBrKVxuICAgIGlmKHIpIHJldHVybiBrXG4gIH0pXG59XG5cbnZhciBmaWx0ZXIgPSBleHBvcnRzLmZpbHRlciA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yKXtcbiAgaXRlcmF0b3IgPSByeCAoaXRlcmF0b3IpXG5cbiAgaWYoQXJyYXkuaXNBcnJheShvYmopKVxuICAgIHJldHVybiBvYmouZmlsdGVyKGl0ZXJhdG9yKVxuICBcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopXG4gICAgLCByID0ge31cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpe1xuICAgIHZhciB2XG4gICAgaWYoaXRlcmF0b3IodiA9IG9ialtrZXldLGtleSxvYmopKVxuICAgICAgcltrZXldID0gdlxuICB9KVxuICByZXR1cm4gciBcbn1cblxudmFyIG1hcEtleXMgPSBleHBvcnRzLm1hcEtleXMgPSBmdW5jdGlvbiAoYXJ5LCBpdGVyYXRvcil7XG4gIHZhciByID0ge31cbiAgaXRlcmF0b3IgPSByeChpdGVyYXRvcilcbiAgZWFjaChhcnksIGZ1bmN0aW9uICh2LGspe1xuICAgIHJbdl0gPSBpdGVyYXRvcih2LGspXG4gIH0pXG4gIHJldHVybiByXG59XG5cblxudmFyIG1hcFRvQXJyYXkgPSBleHBvcnRzLm1hcFRvQXJyYXkgPSBmdW5jdGlvbiAoYXJ5LCBpdGVyYXRvcil7XG4gIHZhciByID0gW11cbiAgaXRlcmF0b3IgPSByeChpdGVyYXRvcilcbiAgZWFjaChhcnksIGZ1bmN0aW9uICh2LGspe1xuICAgIHIucHVzaChpdGVyYXRvcih2LGspKVxuICB9KVxuICByZXR1cm4gclxufVxuXG52YXIgcGF0aCA9IGV4cG9ydHMucGF0aCA9IGZ1bmN0aW9uIChvYmplY3QsIHBhdGgpIHtcblxuICBmb3IgKHZhciBpIGluIHBhdGgpIHtcbiAgICBpZihvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHZhciBrZXkgPSBwYXRoW2ldXG4gICAgb2JqZWN0ID0gb2JqZWN0W2tleV1cbiAgfVxuICByZXR1cm4gb2JqZWN0XG59XG5cbi8qXG5OT1RFOiBuYWl2ZSBpbXBsZW1lbnRhdGlvbi4gXG5gbWF0Y2hgIG11c3Qgbm90IGNvbnRhaW4gY2lyY3VsYXIgcmVmZXJlbmNlcy5cbiovXG5cbnZhciBzZXRQYXRoID0gZXhwb3J0cy5zZXRQYXRoID0gZnVuY3Rpb24gKG9iamVjdCwgcGF0aCwgdmFsdWUpIHtcblxuICBmb3IgKHZhciBpIGluIHBhdGgpIHtcbiAgICB2YXIga2V5ID0gcGF0aFtpXVxuICAgIGlmKG9iamVjdFtrZXldID09IG51bGwpIG9iamVjdFtrZXldID0gKCBcbiAgICAgIGkgKyAxID09IHBhdGgubGVuZ3RoID8gdmFsdWUgOiB7fVxuICAgIClcbiAgICBvYmplY3QgPSBvYmplY3Rba2V5XVxuICB9XG59XG5cbnZhciBqb2luID0gZXhwb3J0cy5qb2luID0gZnVuY3Rpb24gKEEsIEIsIGl0KSB7XG4gIGVhY2goQSwgZnVuY3Rpb24gKGEsIGFrKSB7XG4gICAgZWFjaChCLCBmdW5jdGlvbiAoYiwgYmspIHtcbiAgICAgIGl0KGEsIGIsIGFrLCBiaylcbiAgICB9KVxuICB9KVxufVxuIiwiLy8gSWYgYERhdGUubm93KClgIGlzIGludm9rZWQgdHdpY2UgcXVpY2tseSwgaXQncyBwb3NzaWJsZSB0byBnZXQgdHdvXG4vLyBpZGVudGljYWwgdGltZSBzdGFtcHMuIFRvIGF2b2lkIGdlbmVyYXRpb24gZHVwbGljYXRpb25zLCBzdWJzZXF1ZW50XG4vLyBjYWxscyBhcmUgbWFudWFsbHkgb3JkZXJlZCB0byBmb3JjZSB1bmlxdWVuZXNzLlxuXG52YXIgX2xhc3QgPSAwXG52YXIgX2NvdW50ID0gMVxudmFyIGFkanVzdGVkID0gMFxudmFyIF9hZGp1c3RlZCA9IDBcblxubW9kdWxlLmV4cG9ydHMgPVxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICAvKipcbiAgUmV0dXJucyBOT1QgYW4gYWNjdXJhdGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGN1cnJlbnQgdGltZS5cbiAgU2luY2UganMgb25seSBtZWFzdXJlcyB0aW1lIGFzIG1zLCBpZiB5b3UgY2FsbCBgRGF0ZS5ub3coKWBcbiAgdHdpY2UgcXVpY2tseSwgaXQncyBwb3NzaWJsZSB0byBnZXQgdHdvIGlkZW50aWNhbCB0aW1lIHN0YW1wcy5cbiAgVGhpcyBmdW5jdGlvbiBndWFyYW50ZWVzIHVuaXF1ZSBidXQgbWF5YmUgaW5hY2N1cmF0ZSByZXN1bHRzXG4gIG9uIGVhY2ggY2FsbC5cbiAgKiovXG4gIC8vdW5jb21tZW50IHRoaXMgd2VuXG4gIHZhciB0aW1lID0gRGF0ZS5ub3coKVxuICAvL3RpbWUgPSB+fiAodGltZSAvIDEwMDApIFxuICAvL15eXnVuY29tbWVudCB3aGVuIHRlc3RpbmcuLi5cblxuICAvKipcbiAgSWYgdGltZSByZXR1cm5lZCBpcyBzYW1lIGFzIGluIGxhc3QgY2FsbCwgYWRqdXN0IGl0IGJ5XG4gIGFkZGluZyBhIG51bWJlciBiYXNlZCBvbiB0aGUgY291bnRlci4gXG4gIENvdW50ZXIgaXMgaW5jcmVtZW50ZWQgc28gdGhhdCBuZXh0IGNhbGwgZ2V0J3MgYWRqdXN0ZWQgcHJvcGVybHkuXG4gIEJlY2F1c2UgZmxvYXRzIGhhdmUgcmVzdHJpY3RlZCBwcmVjaXNpb24sIFxuICBtYXkgbmVlZCB0byBzdGVwIHBhc3Qgc29tZSB2YWx1ZXMuLi5cbiAgKiovXG4gIGlmIChfbGFzdCA9PT0gdGltZSkgIHtcbiAgICBkbyB7XG4gICAgICBhZGp1c3RlZCA9IHRpbWUgKyAoKF9jb3VudCsrKSAvIChfY291bnQgKyA5OTkpKVxuICAgIH0gd2hpbGUgKGFkanVzdGVkID09PSBfYWRqdXN0ZWQpXG4gICAgX2FkanVzdGVkID0gYWRqdXN0ZWRcbiAgfVxuICAvLyBJZiBsYXN0IHRpbWUgd2FzIGRpZmZlcmVudCByZXNldCB0aW1lciBiYWNrIHRvIGAxYC5cbiAgZWxzZSB7XG4gICAgX2NvdW50ID0gMVxuICAgIGFkanVzdGVkID0gdGltZVxuICB9XG4gIF9hZGp1c3RlZCA9IGFkanVzdGVkXG4gIF9sYXN0ID0gdGltZVxuICByZXR1cm4gYWRqdXN0ZWRcbn1cbiIsIlxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAod3JhcHBlcikge1xuXG4gIGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIHdyYXBwZXIpXG4gICAgcmV0dXJuIHdyYXBwZXJcbiAgXG4gIHJldHVybiBleHBvcnRzW3dyYXBwZXJdIHx8IGV4cG9ydHMuanNvblxufVxuXG5leHBvcnRzLmpzb24gPSBmdW5jdGlvbiAoc3RyZWFtKSB7XG5cbiAgdmFyIHdyaXRlID0gc3RyZWFtLndyaXRlXG4gIHZhciBzb0ZhciA9ICcnXG5cbiAgZnVuY3Rpb24gcGFyc2UgKGxpbmUpIHtcbiAgICB2YXIganNcbiAgICB0cnkge1xuICAgICAganMgPSBKU09OLnBhcnNlKGxpbmUpXG4gICAgICAvL2lnbm9yZSBsaW5lcyBvZiB3aGl0ZXNwYWNlLi4uXG4gICAgfSBjYXRjaCAoZXJyKSB7IFxuICAgICAgcmV0dXJuIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVycilcbiAgICAgIC8vcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ2ludmFsaWQgSlNPTicsIGxpbmUpXG4gICAgfVxuICAgIGlmKGpzICE9PSB1bmRlZmluZWQpXG4gICAgICB3cml0ZS5jYWxsKHN0cmVhbSwganMpXG4gIH1cblxuICBmdW5jdGlvbiBvbkRhdGEgKGRhdGEpIHtcbiAgICB2YXIgbGluZXMgPSAoc29GYXIgKyBkYXRhKS5zcGxpdCgnXFxuJylcbiAgICBzb0ZhciA9IGxpbmVzLnBvcCgpXG4gICAgd2hpbGUobGluZXMubGVuZ3RoKSB7XG4gICAgICBwYXJzZShsaW5lcy5zaGlmdCgpKVxuICAgIH1cbiAgfVxuXG4gIHN0cmVhbS53cml0ZSA9IG9uRGF0YVxuICBcbiAgdmFyIGVuZCA9IHN0cmVhbS5lbmRcblxuICBzdHJlYW0uZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZihkYXRhKVxuICAgICAgc3RyZWFtLndyaXRlKGRhdGEpXG4gICAgLy9pZiB0aGVyZSBpcyBhbnkgbGVmdCBvdmVyLi4uXG4gICAgaWYoc29GYXIpIHtcbiAgICAgIHBhcnNlKHNvRmFyKVxuICAgIH1cbiAgICByZXR1cm4gZW5kLmNhbGwoc3RyZWFtKVxuICB9XG5cbiAgc3RyZWFtLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcblxuICAgIGlmKGV2ZW50ID09ICdkYXRhJykge1xuICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpICsgJ1xcbidcbiAgICB9XG4gICAgLy9zaW5jZSBhbGwgc3RyZWFtIGV2ZW50cyBvbmx5IHVzZSBvbmUgYXJndW1lbnQsIHRoaXMgaXMgb2theS4uLlxuICAgIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdC5jYWxsKHN0cmVhbSwgZXZlbnQsIGRhdGEpXG4gIH1cblxuICByZXR1cm4gc3RyZWFtXG4vLyAgcmV0dXJuIGVzLnBpcGVsaW5lKGVzLnNwbGl0KCksIGVzLnBhcnNlKCksIHN0cmVhbSwgZXMuc3RyaW5naWZ5KCkpXG59XG5cbmV4cG9ydHMucmF3ID0gZnVuY3Rpb24gKHN0cmVhbSkge1xuICByZXR1cm4gc3RyZWFtXG59XG5cbiIsImV4cG9ydHMuY3JlYXRlSWQgPSBcbmZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFsxLDEsMV0ubWFwKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDIpLnRvVXBwZXJDYXNlKClcbiAgfSkuam9pbignJylcbn1cblxuZXhwb3J0cy5maWx0ZXIgPSBmdW5jdGlvbiAodXBkYXRlLCBzb3VyY2VzKSB7XG4gIHZhciB0cyA9IHVwZGF0ZVsxXVxuICB2YXIgc291cmNlID0gdXBkYXRlWzJdXG4gIHJldHVybiAoIXNvdXJjZXMgfHwgIXNvdXJjZXNbc291cmNlXSB8fCBzb3VyY2VzW3NvdXJjZV0gPCB0cylcbn1cblxuZXhwb3J0cy5wcm90b0lzSWxsZWdhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIHMuZW1pdCgnaW52YWxpZCcsIG5ldyBFcnJvcignXCJfX3Byb3RvX19cIiBpcyBpbGxlZ2FsIHByb3BlcnR5IG5hbWUnKSlcbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gaW52YWxpZFVwZGF0ZSh0KSB7XG4gIHQuZW1pdCgnaW52YWxpZCcsIG5ldyBFcnJvcignaW52YWxpZCB1cGRhdGUnKSlcbn1cblxuZXhwb3J0cy52YWxpZFVwZGF0ZSA9IGZ1bmN0aW9uICh0LCB1cGRhdGUpIHtcbiAgaWYoIUFycmF5LmlzQXJyYXkodXBkYXRlKSkgcmV0dXJuIGludmFsaWRVcGRhdGUodClcbiAgaWYoJ3N0cmluZycgIT09IHR5cGVvZiB1cGRhdGVbMV0gfHwgJ251bWJlcicgIT09IHR5cGVvZiB1cGRhdGVbMl0pXG4gICAgcmV0dXJuIGludmFsaWRVcGRhdGUodClcbn1cblxuZXhwb3J0cy5zb3J0ID0gZnVuY3Rpb24gKGhpc3QpIHtcbiAgcmV0dXJuIGhpc3Quc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIC8vc29ydCBieSB0aW1lc3RhbXBzLCB0aGVuIGlkcy5cbiAgICAvL3RoZXJlIHNob3VsZCBuZXZlciBiZSBhIHBhaXIgd2l0aCBlcXVhbCB0aW1lc3RhbXBzXG4gICAgLy9hbmQgaWRzLlxuICAgIHJldHVybiBhWzFdIC0gYlsxXSB8fCAoYVsyXSA+IGJbMl0gPyAxIDogLTEpXG4gIH0pXG59XG4iLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIik7dmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxudmFyIGkgPSByZXF1aXJlKCdpdGVyYXRlJylcbnZhciBkdXBsZXggPSByZXF1aXJlKCdkdXBsZXgnKVxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgndXRpbCcpLmluaGVyaXRzXG52YXIgc2VyaWFsaXplciA9IHJlcXVpcmUoJ3N0cmVhbS1zZXJpYWxpemVyJylcbnZhciB1ID0gcmVxdWlyZSgnLi91dGlsJylcbnZhciB0aW1lc3RhbXAgPSByZXF1aXJlKCdtb25vdG9uaWMtdGltZXN0YW1wJylcblxuZXhwb3J0cyA9IFxubW9kdWxlLmV4cG9ydHMgPSBTY3V0dGxlYnV0dFxuXG5leHBvcnRzLmNyZWF0ZUlEID0gdS5jcmVhdGVJRFxuZXhwb3J0cy51cGRhdGVJc1JlY2VudCA9IHUuZmlsdGVyXG5leHBvcnRzLmZpbHRlciA9IHUuZmlsdGVyXG5leHBvcnRzLnRpbWVzdGFtcCA9IHRpbWVzdGFtcFxuXG5mdW5jdGlvbiBkdXR5T2ZTdWJjbGFzcygpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdtZXRob2QgbXVzdCBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzcycpXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlIChkYXRhKSB7XG4gIGlmKCEoQXJyYXkuaXNBcnJheShkYXRhKSBcbiAgICAmJiAnc3RyaW5nJyA9PT0gdHlwZW9mIGRhdGFbMl1cbiAgICAmJiAnX19wcm90b19fJyAgICAgIT09IGRhdGFbMl0gLy9USElTIFdPVUxEIEJSRUFLIFNUVUZGXG4gICAgJiYgJ251bWJlcicgPT09IHR5cGVvZiBkYXRhWzFdXG4gICkpIHJldHVybiBmYWxzZVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmluaGVyaXRzIChTY3V0dGxlYnV0dCwgRXZlbnRFbWl0dGVyKVxuXG5mdW5jdGlvbiBTY3V0dGxlYnV0dCAob3B0cykge1xuXG4gIGlmKCEodGhpcyBpbnN0YW5jZW9mIFNjdXR0bGVidXR0KSkgcmV0dXJuIG5ldyBTY3V0dGxlYnV0dChvcHRzKVxuICB2YXIgaWQgPSAnc3RyaW5nJyA9PT0gdHlwZW9mIG9wdHMgPyBvcHRzIDogb3B0cyAmJiBvcHRzLmlkXG4gIHRoaXMuc291cmNlcyA9IHt9XG4gIHRoaXMuc2V0TWF4TGlzdGVuZXJzKE51bWJlci5NQVhfVkFMVUUpXG4gIC8vY291bnQgaG93IG1hbnkgb3RoZXIgaW5zdGFuY2VzIHdlIGFyZSByZXBsaWNhdGluZyB0by5cbiAgdGhpcy5fc3RyZWFtcyA9IDBcbiAgaWYob3B0cyAmJiBvcHRzLnNpZ24gJiYgb3B0cy52ZXJpZnkpIHtcbiAgICB0aGlzLnNldElkKG9wdHMuaWQgfHwgb3B0cy5jcmVhdGVJZCgpKVxuICAgIHRoaXMuX3NpZ24gICA9IG9wdHMuc2lnblxuICAgIHRoaXMuX3ZlcmlmeSA9IG9wdHMudmVyaWZ5XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zZXRJZChpZCB8fCB1LmNyZWF0ZUlkKCkpXG4gIH1cbn1cblxudmFyIHNiID0gU2N1dHRsZWJ1dHQucHJvdG90eXBlXG5cbnZhciBlbWl0ID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0XG5cbnNiLmFwcGx5VXBkYXRlID0gZHV0eU9mU3ViY2xhc3NcbnNiLmhpc3RvcnkgICAgICA9IGR1dHlPZlN1YmNsYXNzXG5cbnNiLmxvY2FsVXBkYXRlID0gZnVuY3Rpb24gKHRyeCkge1xuICB0aGlzLl91cGRhdGUoW3RyeCwgdGltZXN0YW1wKCksIHRoaXMuaWRdKVxuICByZXR1cm4gdGhpc1xufVxuXG5zYi5fdXBkYXRlID0gZnVuY3Rpb24gKHVwZGF0ZSkge1xuICAvL3ZhbGlkYXRlZCB3aGVuIGl0IGNvbWVzIGludG8gdGhlIHN0cmVhbVxuICB2YXIgdHMgPSB1cGRhdGVbMV1cbiAgdmFyIHNvdXJjZSA9IHVwZGF0ZVsyXVxuICAvL2lmIHRoaXMgbWVzc2FnZSBpcyBvbGQgZm9yIGl0J3Mgc291cmNlLFxuICAvL2lnbm9yZSBpdC4gaXQncyBvdXQgb2Ygb3JkZXIuXG4gIC8vZWFjaCBub2RlIG11c3QgZW1pdCBpdCdzIGNoYW5nZXMgaW4gb3JkZXIhXG4gIFxuICB2YXIgbGF0ZXN0ID0gdGhpcy5zb3VyY2VzW3NvdXJjZV1cbiAgaWYobGF0ZXN0ICYmIGxhdGVzdCA+PSB0cylcbiAgICByZXR1cm4gZW1pdC5jYWxsKHRoaXMsICdvbGRfZGF0YScsIHVwZGF0ZSksIGZhbHNlXG5cbiAgdGhpcy5zb3VyY2VzW3NvdXJjZV0gPSB0c1xuXG4gIHZhciBzZWxmID0gdGhpc1xuICBmdW5jdGlvbiBkaWRWZXJpZmljYXRpb24gKGVyciwgdmVyaWZpZWQpIHtcblxuICAgIC8vIEknbSBub3Qgc3VyZSBob3cgd2hhdCBzaG91bGQgaGFwcGVuIGlmIGEgYXN5bmMgdmVyaWZpY2F0aW9uXG4gICAgLy8gZXJyb3JzLiBpZiBpdCdzIGFuIGtleSBub3QgZm91bmQgLSB0aGF0IGlzIGEgdmVyaWZpY2F0aW9uIGZhaWwsXG4gICAgLy8gbm90IGEgZXJyb3IuIGlmIGl0J3MgZ2VudW5pZSBlcnJvciwgcmVhbGx5IHlvdSBzaG91bGQgcXVldWUgYW5kIFxuICAgIC8vIHRyeSBhZ2Fpbj8gb3IgcmVwbGF5IHRoZSBtZXNzYWdlIGxhdGVyXG4gICAgLy8gLS0gdGhpcyBzaG91bGQgYmUgZG9uZSBteSB0aGUgc2VjdXJpdHkgcGx1Z2luIHRob3VnaCwgbm90IHNjdXR0bGVidXR0LlxuXG4gICAgaWYoZXJyKVxuICAgICAgcmV0dXJuIGVtaXQuY2FsbChzZWxmLCAnZXJyb3InLCBlcnIpXG5cbiAgICBpZighdmVyaWZpZWQpXG4gICAgICByZXR1cm4gZW1pdC5jYWxsKHNlbGYsICd1bnZlcmlmaWVkX2RhdGEnLCB1cGRhdGUpXG5cbiAgICAvLyBjaGVjayBpZiB0aGlzIG1lc3NhZ2UgaXMgb2xkZXIgdGhhblxuICAgIC8vIHRoZSB2YWx1ZSB3ZSBhbHJlYWR5IGhhdmUuXG4gICAgLy8gZG8gbm90aGluZyBpZiBzb1xuICAgIC8vIGVtaXQgYW4gJ29sZF9kYXRhJyBldmVudCBiZWNhdXNlIGknbGwgd2FudCB0byB0cmFjayBob3cgbWFueVxuICAgIC8vIHVubmVjZXNzYXJ5IG1lc3NhZ2VzIGFyZSBzZW50LlxuXG4gICAgaWYoc2VsZi5hcHBseVVwZGF0ZSh1cGRhdGUpKVxuICAgICAgZW1pdC5jYWxsKHNlbGYsICdfdXBkYXRlJywgdXBkYXRlKSAvL3dyaXRlIHRvIHN0cmVhbS5cbiAgfVxuXG4gIGlmKHNvdXJjZSAhPT0gdGhpcy5pZCkge1xuICAgIGlmKHRoaXMuX3ZlcmlmeSlcbiAgICAgIHRoaXMuX3ZlcmlmeSh1cGRhdGUsIGRpZFZlcmlmaWNhdGlvbilcbiAgICBlbHNlXG4gICAgICBkaWRWZXJpZmljYXRpb24obnVsbCwgdHJ1ZSlcbiAgfSBlbHNlIHtcbiAgICBpZih0aGlzLl9zaWduKSB7XG4gICAgICAvL2NvdWxkIG1ha2UgdGhpcyBhc3luYyBlYXNpbHkgZW5vdWdoLlxuICAgICAgdXBkYXRlWzNdID0gdGhpcy5fc2lnbih1cGRhdGUpXG4gICAgfVxuICAgIGRpZFZlcmlmaWNhdGlvbihudWxsLCB0cnVlKVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuc2IuY3JlYXRlU3RyZWFtID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIC8vdGhlIHNvdXJjZXMgZm9yIHRoZSByZW1vdGUgZW5kLlxuICB2YXIgc291cmNlcyA9IHt9LCBvdGhlclxuICB2YXIgc3luY1NlbnQgPSBmYWxzZSwgc3luY1JlY3YgPSBmYWxzZVxuXG4gIHRoaXMuX3N0cmVhbXMgKytcblxuICBvcHRzID0gb3B0cyB8fCB7fVxuICB2YXIgZCA9IGR1cGxleCgpXG4gIGQubmFtZSA9IG9wdHMubmFtZVxuICB2YXIgb3V0ZXIgPSBzZXJpYWxpemVyKG9wdHMgJiYgb3B0cy53cmFwcGVyKShkKVxuICBvdXRlci5pbm5lciA9IGRcblxuICBkLndyaXRhYmxlID0gb3B0cy53cml0YWJsZSAhPT0gZmFsc2VcbiAgZC5yZWFkYWJsZSA9IG9wdHMucmVhZGFibGUgIT09IGZhbHNlXG5cbiAgc3luY1JlY3YgICA9ICFkLndyaXRhYmxlXG4gIHN5bmNTZW50ICAgPSAhZC5yZWFkYWJsZVxuXG4gIHZhciB0YWlsID0gb3B0cy50YWlsICE9PSBmYWxzZSAvL2RlZmF1bHQgdG8gdGFpbD10cnVlXG5cbiAgZnVuY3Rpb24gc3RhcnQgKGRhdGEpIHtcbiAgICAvL3doZW4gdGhlIGRpZ2VzdCBpcyByZWNpZXZlZCBmcm9tIHRoZSBvdGhlciBlbmQsXG4gICAgLy9zZW5kIHRoZSBoaXN0b3J5LlxuICAgIC8vbWVyZ2Ugd2l0aCB0aGUgY3VycmVudCBsaXN0IG9mIHNvdXJjZXMuXG4gICAgaWYgKCFkYXRhIHx8ICFkYXRhLmNsb2NrKSB7XG4gICAgICAgIGQuZW1pdCgnZXJyb3InKTtcbiAgICAgICAgcmV0dXJuIGQuX2VuZCgpXG4gICAgfVxuXG4gICAgc291cmNlcyA9IGRhdGEuY2xvY2tcblxuICAgIGkuZWFjaChzZWxmLmhpc3Rvcnkoc291cmNlcyksIGZ1bmN0aW9uIChkYXRhKSB7ZC5fZGF0YShkYXRhKX0pXG5cbiAgICAvL3RoZSBfdXBkYXRlIGxpc3RlbmVyIG11c3QgYmUgc2V0IGFmdGVyIHRoZSBoaXN0b3J5IGlzIHF1ZXVlZC5cbiAgICAvL290aGVyd2lzZSB0aGVyZSBpcyBhIHJhY2UgYmV0d2VlbiB0aGUgZmlyc3QgY2xpZW50IG1lc3NhZ2VcbiAgICAvL2FuZCB0aGUgbmV4dCB1cGRhdGUgKHdoaWNoIG1heSBjb21lIGluIG9uIGFub3RoZXIgc3RyZWFtKVxuICAgIC8vdGhpcyBwcm9ibGVtIHdpbGwgcHJvYmFibHkgbm90IGJlIGVuY291bnRlcmVkIHVudGlsIHlvdSBoYXZlIFxuICAgIC8vdGhvdXNhbmRzIG9mIHNjdXR0bGVidXR0cy5cbiAgICAgICAgXG4gICAgc2VsZi5vbignX3VwZGF0ZScsIG9uVXBkYXRlKVxuICAgIFxuICAgIGQuX2RhdGEoJ1NZTkMnKVxuICAgIHN5bmNTZW50ID0gdHJ1ZVxuICAgIC8vd2hlbiB3ZSBoYXZlIHNlbnQgYWxsIGhpc3RvcnlcbiAgICBvdXRlci5lbWl0KCdoZWFkZXInLCBkYXRhKVxuICAgIG91dGVyLmVtaXQoJ3N5bmNTZW50JylcbiAgICAvL3doZW4gd2UgaGF2ZSByZWNpZXZlZCBhbGwgaGlzdG95clxuICAgIC8vZW1pdCAnc3luY2VkJyB3aGVuIHRoaXMgc3RyZWFtIGhhcyBzeW5jZWQuXG4gICAgaWYoc3luY1JlY3YpIG91dGVyLmVtaXQoJ3N5bmMnKSwgb3V0ZXIuZW1pdCgnc3luY2VkJylcbiAgICBpZighdGFpbCkgZC5fZW5kKClcbiAgfVxuXG4gIGRcbiAgICAub24oJ19kYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIC8vaWYgaXQncyBhbiBhcnJheSwgaXQncyBhbiB1cGRhdGUuXG4gICAgICBpZihBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIC8vY2hlY2sgd2hldGhlciB3ZSBhcmUgYWNjZXB0aW5nIHdyaXRlcy5cbiAgICAgICAgaWYoIWQud3JpdGFibGUpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmKHZhbGlkYXRlKGRhdGEpKVxuICAgICAgICAgIHJldHVybiBzZWxmLl91cGRhdGUoZGF0YSlcbiAgICAgIH1cbiAgICAgIC8vaWYgaXQncyBhbiBvYmplY3QsIGl0J3MgYSBzY3V0dGxlYnV0IGRpZ2VzdC5cbiAgICAgIGVsc2UgaWYoJ29iamVjdCcgPT09IHR5cGVvZiBkYXRhICYmIGRhdGEpXG4gICAgICAgIHN0YXJ0KGRhdGEpXG4gICAgICBlbHNlIGlmKCdzdHJpbmcnID09PSB0eXBlb2YgZGF0YSAmJiBkYXRhID09ICdTWU5DJykge1xuICAgICAgICBzeW5jUmVjdiA9IHRydWVcbiAgICAgICAgb3V0ZXIuZW1pdCgnc3luY1JlY2lldmVkJylcbiAgICAgICAgaWYoc3luY1NlbnQpIG91dGVyLmVtaXQoJ3N5bmMnKSwgb3V0ZXIuZW1pdCgnc3luY2VkJylcbiAgICAgIH1cbiAgICB9KS5vbignX2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGQuX2VuZCgpXG4gICAgfSlcbiAgICAub24oJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcignX3VwZGF0ZScsIG9uVXBkYXRlKVxuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcignZGlzcG9zZScsIGRpc3Bvc2UpXG4gICAgICAvL2VtaXQgdGhlIG51bWJlciBvZiBzdHJlYW1zIHRoYXQgYXJlIHJlbWFpbmluZy4uLlxuICAgICAgLy90aGlzIHdpbGwgYmUgdXNlZCBmb3IgbWVtb3J5IG1hbmFnZW1lbnQuLi5cbiAgICAgIHNlbGYuX3N0cmVhbXMgLS1cbiAgICAgIGVtaXQuY2FsbChzZWxmLCAndW5zdHJlYW0nLCBzZWxmLl9zdHJlYW1zKVxuICAgIH0pXG5cbiAgaWYob3B0cyAmJiBvcHRzLnRhaWwgPT09IGZhbHNlKSB7XG4gICAgb3V0ZXIub24oJ3N5bmMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZC5fZW5kKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiBvblVwZGF0ZSAodXBkYXRlKSB7IC8vdmFsdWUsIHNvdXJjZSwgdHNcbiAgICBpZighdmFsaWRhdGUodXBkYXRlKSB8fCAhdS5maWx0ZXIodXBkYXRlLCBzb3VyY2VzKSlcbiAgICAgIHJldHVyblxuXG4gICAgZC5fZGF0YSh1cGRhdGUpXG5cbiAgICAvL3JlYWxseSwgdGhpcyBzaG91bGQgaGFwcGVuIGJlZm9yZSBlbWl0dGluZy5cbiAgICB2YXIgdHMgPSB1cGRhdGVbMV1cbiAgICB2YXIgc291cmNlID0gdXBkYXRlWzJdXG4gICAgc291cmNlc1tzb3VyY2VdID0gdHNcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc3Bvc2UgKCkge1xuICAgIGQuZW5kKClcbiAgfVxuXG4gIHZhciBvdXRnb2luZyA9IHsgaWQgOiBzZWxmLmlkLCBjbG9jayA6IHNlbGYuc291cmNlcyB9XG5cbiAgaWYgKG9wdHMgJiYgb3B0cy5tZXRhKSBvdXRnb2luZy5tZXRhID0gb3B0cy5tZXRhXG5cbiAgaWYoZC5yZWFkYWJsZSkge1xuICAgIGQuX2RhdGEob3V0Z29pbmcpXG4gICAgaWYoIWQud3JpdGFibGUgJiYgIW9wdHMuY2xvY2spXG4gICAgICBzdGFydCh7Y2xvY2s6e319KVxuXG4gIH0gZWxzZSBpZiAob3B0cy5zZW5kQ2xvY2spIHtcbiAgICAvL3NlbmQgbXkgY3VycmVudCBjbG9jay5cbiAgICAvL3NvIHRoZSBvdGhlciBzaWRlIGtub3dzIHdoYXQgdG8gc2VuZFxuICAgIGQuX2RhdGEob3V0Z29pbmcpXG4gIH1cblxuICBzZWxmLm9uY2UoJ2Rpc3Bvc2UnLCBkaXNwb3NlKVxuXG4gIHJldHVybiBvdXRlclxufVxuXG5zYi5jcmVhdGVXcml0ZVN0cmVhbSA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9XG4gIG9wdHMud3JpdGFibGUgPSB0cnVlOyBvcHRzLnJlYWRhYmxlID0gZmFsc2VcbiAgcmV0dXJuIHRoaXMuY3JlYXRlU3RyZWFtKG9wdHMpXG59XG5cbnNiLmNyZWF0ZVJlYWRTdHJlYW0gPSBmdW5jdGlvbiAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLndyaXRhYmxlID0gZmFsc2U7IG9wdHMucmVhZGFibGUgPSB0cnVlXG4gIHJldHVybiB0aGlzLmNyZWF0ZVN0cmVhbShvcHRzKVxufVxuXG5zYi5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICBlbWl0LmNhbGwodGhpcywgJ2Rpc3Bvc2UnKVxufVxuXG5zYi5zZXRJZCA9IGZ1bmN0aW9uIChpZCkge1xuICBpZignX19wcm90b19fJyA9PT0gaWQpIHRocm93IG5ldyBFcnJvcignX19wcm90b19fIGlzIGludmFsaWQgaWQnKVxuICBpZihpZCA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ251bGwgaXMgbm90IGludmFsaWQgaWQnKVxuICB0aGlzLmlkID0gaWRcbiAgcmV0dXJuIHRoaXNcbn1cblxuZnVuY3Rpb24gc3RyZWFtRG9uZShzdHJlYW0sIGxpc3RlbmVyKSB7XG5cbiAgZnVuY3Rpb24gcmVtb3ZlICgpIHtcbiAgICBzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsICAgb25Eb25lKVxuICAgIHN0cmVhbS5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbkRvbmUpXG4gICAgc3RyZWFtLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsICAgb25Eb25lKVxuICB9XG4gIGZ1bmN0aW9uIG9uRG9uZSAoYXJnKSB7XG4gICAgcmVtb3ZlKClcbiAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGFyZylcbiAgfVxuXG4gIC8vdGhpcyBtYWtlcyBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcikgc3RpbGwgd29ya1xuICBvbkRvbmUubGlzdGVuZXIgPSBsaXN0ZW5lclxuXG4gIHN0cmVhbS5vbignZW5kJywgICBvbkRvbmUpXG4gIHN0cmVhbS5vbignZXJyb3InLCBvbkRvbmUpXG4gIHN0cmVhbS5vbignY2xvc2UnLCBvbkRvbmUpXG59XG5cbi8vY3JlYXRlIGFub3RoZXIgaW5zdGFuY2Ugb2YgdGhpcyBzY3V0dGxlYnV0dCxcbi8vdGhhdCBpcyBpbiBzeW5jIGFuZCBhdHRhY2hlZCB0byB0aGlzIGluc3RhbmNlLlxuc2IuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBBID0gdGhpc1xuICB2YXIgQiA9IG5ldyAoQS5jb25zdHJ1Y3RvcilcbiAgQi5zZXRJZChBLmlkKSAvL3NhbWUgaWQuIHRoaW5rIHRoaXMgd2lsbCB3b3JrLi4uXG5cbiAgQS5fY2xvbmVzID0gKEEuX2Nsb25lcyB8fCAwKSArIDFcblxuICB2YXIgYSA9IEEuY3JlYXRlU3RyZWFtKHt3cmFwcGVyOiAncmF3J30pXG4gIHZhciBiID0gQi5jcmVhdGVTdHJlYW0oe3dyYXBwZXI6ICdyYXcnfSlcblxuICAvL2FsbCB1cGRhdGVzIG11c3QgYmUgc3luYywgc28gbWFrZSBzdXJlIHBhdXNlIG5ldmVyIGhhcHBlbnMuXG4gIGEucGF1c2UgPSBiLnBhdXNlID0gZnVuY3Rpb24gbm9vcCgpe31cblxuICBzdHJlYW1Eb25lKGIsIGZ1bmN0aW9uICgpIHtcbiAgICBBLl9jbG9uZXMtLVxuICAgIGVtaXQuY2FsbChBLCAndW5jbG9uZScsIEEuX2Nsb25lcylcbiAgfSlcblxuICBhLnBpcGUoYikucGlwZShhKVxuICAvL3Jlc3VtZSBib3RoIHN0cmVhbXMsIHNvIHRoYXQgdGhlIG5ldyBpbnN0YW5jZSBpcyBicm91Z2h0IHVwIHRvIGRhdGUgaW1tZWRpYXRlbHkuXG4gIGEucmVzdW1lKClcbiAgYi5yZXN1bWUoKVxuXG4gIHJldHVybiBCXG59XG5cbiIsIlxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAod3JhcHBlcikge1xuXG4gIGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIHdyYXBwZXIpXG4gICAgcmV0dXJuIHdyYXBwZXJcbiAgXG4gIHJldHVybiBleHBvcnRzW3dyYXBwZXJdIHx8IGV4cG9ydHMuanNvblxufVxuXG5leHBvcnRzLmpzb24gPSBmdW5jdGlvbiAoc3RyZWFtLCBfSlNPTikge1xuICBfSlNPTiA9IF9KU09OIHx8IEpTT05cblxuICB2YXIgd3JpdGUgPSBzdHJlYW0ud3JpdGVcbiAgdmFyIHNvRmFyID0gJydcblxuICBmdW5jdGlvbiBwYXJzZSAobGluZSkge1xuICAgIHZhciBqc1xuICAgIHRyeSB7XG4gICAgICBqcyA9IF9KU09OLnBhcnNlKGxpbmUpXG4gICAgICAvL2lnbm9yZSBsaW5lcyBvZiB3aGl0ZXNwYWNlLi4uXG4gICAgfSBjYXRjaCAoZXJyKSB7IFxuICAgICAgZXJyLmxpbmUgPSBsaW5lXG4gICAgICByZXR1cm4gc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXJyKVxuICAgICAgLy9yZXR1cm4gY29uc29sZS5lcnJvcignaW52YWxpZCBKU09OJywgbGluZSlcbiAgICB9XG4gICAgaWYoanMgIT09IHVuZGVmaW5lZClcbiAgICAgIHdyaXRlLmNhbGwoc3RyZWFtLCBqcylcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRGF0YSAoZGF0YSkge1xuICAgIHZhciBsaW5lcyA9IChzb0ZhciArIGRhdGEpLnNwbGl0KCdcXG4nKVxuICAgIHNvRmFyID0gbGluZXMucG9wKClcbiAgICB3aGlsZShsaW5lcy5sZW5ndGgpIHtcbiAgICAgIHBhcnNlKGxpbmVzLnNoaWZ0KCkpXG4gICAgfVxuICB9XG5cbiAgc3RyZWFtLndyaXRlID0gb25EYXRhXG4gIFxuICB2YXIgZW5kID0gc3RyZWFtLmVuZFxuXG4gIHN0cmVhbS5lbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmKGRhdGEpXG4gICAgICBzdHJlYW0ud3JpdGUoZGF0YSlcbiAgICAvL2lmIHRoZXJlIGlzIGFueSBsZWZ0IG92ZXIuLi5cbiAgICBpZihzb0Zhcikge1xuICAgICAgcGFyc2Uoc29GYXIpXG4gICAgfVxuICAgIHJldHVybiBlbmQuY2FsbChzdHJlYW0pXG4gIH1cblxuICBzdHJlYW0uZW1pdCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuXG4gICAgaWYoZXZlbnQgPT0gJ2RhdGEnKSB7XG4gICAgICBkYXRhID0gX0pTT04uc3RyaW5naWZ5KGRhdGEpICsgJ1xcbidcbiAgICB9XG4gICAgLy9zaW5jZSBhbGwgc3RyZWFtIGV2ZW50cyBvbmx5IHVzZSBvbmUgYXJndW1lbnQsIHRoaXMgaXMgb2theS4uLlxuICAgIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdC5jYWxsKHN0cmVhbSwgZXZlbnQsIGRhdGEpXG4gIH1cblxuICByZXR1cm4gc3RyZWFtXG59XG5cbmV4cG9ydHMucmF3ID0gZnVuY3Rpb24gKHN0cmVhbSkge1xuICByZXR1cm4gc3RyZWFtXG59XG5cbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTt2YXIgU3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJylcblxuLy8gdGhyb3VnaFxuLy9cbi8vIGEgc3RyZWFtIHRoYXQgZG9lcyBub3RoaW5nIGJ1dCByZS1lbWl0IHRoZSBpbnB1dC5cbi8vIHVzZWZ1bCBmb3IgYWdncmVnYXRpbmcgYSBzZXJpZXMgb2YgY2hhbmdpbmcgYnV0IG5vdCBlbmRpbmcgc3RyZWFtcyBpbnRvIG9uZSBzdHJlYW0pXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHRocm91Z2hcbnRocm91Z2gudGhyb3VnaCA9IHRocm91Z2hcblxuLy9jcmVhdGUgYSByZWFkYWJsZSB3cml0YWJsZSBzdHJlYW0uXG5cbmZ1bmN0aW9uIHRocm91Z2ggKHdyaXRlLCBlbmQsIG9wdHMpIHtcbiAgd3JpdGUgPSB3cml0ZSB8fCBmdW5jdGlvbiAoZGF0YSkgeyB0aGlzLnF1ZXVlKGRhdGEpIH1cbiAgZW5kID0gZW5kIHx8IGZ1bmN0aW9uICgpIHsgdGhpcy5xdWV1ZShudWxsKSB9XG5cbiAgdmFyIGVuZGVkID0gZmFsc2UsIGRlc3Ryb3llZCA9IGZhbHNlLCBidWZmZXIgPSBbXSwgX2VuZGVkID0gZmFsc2VcbiAgdmFyIHN0cmVhbSA9IG5ldyBTdHJlYW0oKVxuICBzdHJlYW0ucmVhZGFibGUgPSBzdHJlYW0ud3JpdGFibGUgPSB0cnVlXG4gIHN0cmVhbS5wYXVzZWQgPSBmYWxzZVxuXG4vLyAgc3RyZWFtLmF1dG9QYXVzZSAgID0gIShvcHRzICYmIG9wdHMuYXV0b1BhdXNlICAgPT09IGZhbHNlKVxuICBzdHJlYW0uYXV0b0Rlc3Ryb3kgPSAhKG9wdHMgJiYgb3B0cy5hdXRvRGVzdHJveSA9PT0gZmFsc2UpXG5cbiAgc3RyZWFtLndyaXRlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB3cml0ZS5jYWxsKHRoaXMsIGRhdGEpXG4gICAgcmV0dXJuICFzdHJlYW0ucGF1c2VkXG4gIH1cblxuICBmdW5jdGlvbiBkcmFpbigpIHtcbiAgICB3aGlsZShidWZmZXIubGVuZ3RoICYmICFzdHJlYW0ucGF1c2VkKSB7XG4gICAgICB2YXIgZGF0YSA9IGJ1ZmZlci5zaGlmdCgpXG4gICAgICBpZihudWxsID09PSBkYXRhKVxuICAgICAgICByZXR1cm4gc3RyZWFtLmVtaXQoJ2VuZCcpXG4gICAgICBlbHNlXG4gICAgICAgIHN0cmVhbS5lbWl0KCdkYXRhJywgZGF0YSlcbiAgICB9XG4gIH1cblxuICBzdHJlYW0ucXVldWUgPSBzdHJlYW0ucHVzaCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4vLyAgICBjb25zb2xlLmVycm9yKGVuZGVkKVxuICAgIGlmKF9lbmRlZCkgcmV0dXJuIHN0cmVhbVxuICAgIGlmKGRhdGEgPT0gbnVsbCkgX2VuZGVkID0gdHJ1ZVxuICAgIGJ1ZmZlci5wdXNoKGRhdGEpXG4gICAgZHJhaW4oKVxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuXG4gIC8vdGhpcyB3aWxsIGJlIHJlZ2lzdGVyZWQgYXMgdGhlIGZpcnN0ICdlbmQnIGxpc3RlbmVyXG4gIC8vbXVzdCBjYWxsIGRlc3Ryb3kgbmV4dCB0aWNrLCB0byBtYWtlIHN1cmUgd2UncmUgYWZ0ZXIgYW55XG4gIC8vc3RyZWFtIHBpcGVkIGZyb20gaGVyZS5cbiAgLy90aGlzIGlzIG9ubHkgYSBwcm9ibGVtIGlmIGVuZCBpcyBub3QgZW1pdHRlZCBzeW5jaHJvbm91c2x5LlxuICAvL2EgbmljZXIgd2F5IHRvIGRvIHRoaXMgaXMgdG8gbWFrZSBzdXJlIHRoaXMgaXMgdGhlIGxhc3QgbGlzdGVuZXIgZm9yICdlbmQnXG5cbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2VcbiAgICBpZighc3RyZWFtLndyaXRhYmxlICYmIHN0cmVhbS5hdXRvRGVzdHJveSlcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHJlYW0uZGVzdHJveSgpXG4gICAgICB9KVxuICB9KVxuXG4gIGZ1bmN0aW9uIF9lbmQgKCkge1xuICAgIHN0cmVhbS53cml0YWJsZSA9IGZhbHNlXG4gICAgZW5kLmNhbGwoc3RyZWFtKVxuICAgIGlmKCFzdHJlYW0ucmVhZGFibGUgJiYgc3RyZWFtLmF1dG9EZXN0cm95KVxuICAgICAgc3RyZWFtLmRlc3Ryb3koKVxuICB9XG5cbiAgc3RyZWFtLmVuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYoZW5kZWQpIHJldHVyblxuICAgIGVuZGVkID0gdHJ1ZVxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGgpIHN0cmVhbS53cml0ZShkYXRhKVxuICAgIF9lbmQoKSAvLyB3aWxsIGVtaXQgb3IgcXVldWVcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0uZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihkZXN0cm95ZWQpIHJldHVyblxuICAgIGRlc3Ryb3llZCA9IHRydWVcbiAgICBlbmRlZCA9IHRydWVcbiAgICBidWZmZXIubGVuZ3RoID0gMFxuICAgIHN0cmVhbS53cml0YWJsZSA9IHN0cmVhbS5yZWFkYWJsZSA9IGZhbHNlXG4gICAgc3RyZWFtLmVtaXQoJ2Nsb3NlJylcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0ucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoc3RyZWFtLnBhdXNlZCkgcmV0dXJuXG4gICAgc3RyZWFtLnBhdXNlZCA9IHRydWVcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0ucmVzdW1lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHN0cmVhbS5wYXVzZWQpIHtcbiAgICAgIHN0cmVhbS5wYXVzZWQgPSBmYWxzZVxuICAgICAgc3RyZWFtLmVtaXQoJ3Jlc3VtZScpXG4gICAgfVxuICAgIGRyYWluKClcbiAgICAvL21heSBoYXZlIGJlY29tZSBwYXVzZWQgYWdhaW4sXG4gICAgLy9hcyBkcmFpbiBlbWl0cyAnZGF0YScuXG4gICAgaWYoIXN0cmVhbS5wYXVzZWQpXG4gICAgICBzdHJlYW0uZW1pdCgnZHJhaW4nKVxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuICByZXR1cm4gc3RyZWFtXG59XG5cbiIsInZhciBza2VsbHksIGxkYXRhLCBhcHAsIGNsaWVudDtcbnNrZWxseSA9IHJlcXVpcmUoJy4uLycpO1xubGRhdGEgPSByZXF1aXJlKCcuLi9kZXBzL2xpdmUtZGF0YScpO1xuYXBwID0gbmV3IHNrZWxseS5BcHA7XG5jbGllbnQgPSBza2VsbHkuY29ubmVjdChhcHApO1xuY2xpZW50LnN0b3JlLm9uKCdvbGRfZGF0YScsIGZ1bmN0aW9uKHUpe1xuICByZXR1cm4gY29uc29sZS5sb2coJ2Rpc2NhcmRlZCB1cGRhdGU6JywgdSk7XG59KTtcbmNsaWVudC5yYXdTdG9yZS5vbignb2xkX2RhdGEnLCBmdW5jdGlvbih1KXtcbiAgcmV0dXJuIGNvbnNvbGUubG9nKCdkaXNjYXJkZWQgdXBkYXRlOicsIHUpO1xufSk7XG5hcHAuc3RvcmUub24oJ29sZF9kYXRhJywgZnVuY3Rpb24odSl7XG4gIHJldHVybiBjb25zb2xlLmxvZygnZGlzY2FyZGVkIHVwZGF0ZTonLCB1KTtcbn0pO1xud2luZG93LmNsaWVudCA9IGNsaWVudDtcbndpbmRvdy5sZGF0YSA9IGxkYXRhO1xud2luZG93LmFwcCA9IGFwcDsiXX0=