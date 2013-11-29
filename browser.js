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