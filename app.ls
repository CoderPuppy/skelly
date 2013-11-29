ldata = require \./live-data
log   = require \./log

class App
	(@opts = {}) ->
		return new App ... unless @ instanceof App

		@opts.logger ?= log.logger level: \debug
		@log = @opts.logger

		@store = new ldata.Map prefix: \app

exports = module.exports = App