# require \primus/parsers/json

# Primus = require \primus
through = require \through
# TODO: THIS IS A HACK TO GET STARTED
Primus  = require \./library
Client  = require \./client

exports.App = require \./app
exports.Client = Client

exports.connect = (app, ...a) ->
	primus = new Primus()

	stream = through (data) ->
		primus.write data

	primus.on \data, (data) ->
		stream.queue data

	client = new Client(app, stream)
	client.primus = primus
	client