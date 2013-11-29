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
