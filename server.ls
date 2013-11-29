{EventEmitter} = require \events
ecstatic       = require \ecstatic
connect        = require \connect
Client         = require \./client
Primus         = require \primus
debug          = require(\debug)(\skelly:server)
http           = require \http
util           = require \util
App            = require \./app
log            = require \./log

class Server extends EventEmitter
	(opts = {}) ->
		fn = (req, res) ->
			fn.mw(req, res)

		(->
			@opts = opts
			@opts.transport ?= \sockjs
			# TODO: Find the root of the project
			# Finding where this was required from could work
			# except for node.ls packaging it in
			# @opts.static ?= root + '/public'
			@opts.primus ?= {}
			@opts.primus.transformer ?= @opts.transport
			@opts.ecstatic ?= {}
			@opts.ecstatic.root ?= @opts.static

			@app = new App
			@mw  = connect()

			@mw.use ecstatic(@opts.ecstatic)
		).call fn

		for k, v of Server::
			fn[k] = v

		return fn

	http-server: ->
		unless @server?
			@server = http.createServer @
			@primus = new Primus(@server, @opts.primus)
			@primus.on 'connection', (spark) ~>
				@emit 'client', new Client(@app, spark)

		@server

	listen: (port = 3000, address = '0.0.0.0') ->
		debug 'Attempting to listen on: %s:%s', address, port
		@http-server!.listen port, address, ~>
			address = @http-server!.address!
			@app.log.info 'Server listening on %s:%s', address?.address, address?.port
			@emit 'listening', address
		@

exports = module.exports = -> new Server ...

exports.Server = Server