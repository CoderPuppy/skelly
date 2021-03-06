// Generated by LiveScript 1.2.0
(function(){
  var LBase, RValue, LValue, slice$ = [].slice;
  LBase = require('./base');
  RValue = require('r-value');
  LValue = (function(superclass){
    var prototype = extend$((import$(LValue, superclass).displayName = 'LValue', LValue), superclass).prototype, constructor = LValue;
    function LValue(defaultVal, val){
      var this$ = this;
      val == null && (val = true);
      LValue.superclass.call(this);
      this._sb = new RValue;
      this._sb.on('update', function(data){
        return this$.emit('update', data);
      });
      this._sb.on('_update', function(update){
        return this$.emit('_update', update);
      });
      if (defaultVal != null) {
        if (val) {
          this.set(defaultVal);
        } else {
          this._update(defaultVal);
        }
      }
    }
    prototype.creationArgs = function(){
      return [this._sb._history[this._sb._history.length - 1], false];
    };
    LValue.mapCreationArgs = function(fn, args){
      var subArgs;
      subArgs = slice$.call(arguments, 2);
      return [[fn.apply(null, [args[0][0]].concat(slice$.call(subArgs))), args[0][1], args[0][2]], args[1]];
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
