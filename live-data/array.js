// Generated by LiveScript 1.2.0
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
