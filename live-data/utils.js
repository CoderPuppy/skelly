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
