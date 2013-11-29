font = require \ansi-font
util = require \util
tty  = require \tty

levels = [ \debug \info \warn \error ]
colors = [ \green \green \yellow \red ]

class Logger
	(@opts = {}) ->
		@opts.level ?= \debug
		@opts.errout ?= process.stderr
		@opts.out ?= process.stdout
		@opts.colors ?= tty.isatty(@opts.out) && tty.isatty(@opts.errout)

		@opts.level = levels.index-of @opts.level if typeof @opts.level == \string

	checkLevel: ->
		ok = if typeof it == \string
			levels.index-of(it) != -1
		else if typeof it == \number
			levels[it]?
		else false

		if not ok
			throw new Error("Invalid level: #{it}")

	logger: -> new Logger ...

	output: (level, text) ->
		@checkLevel level
		if level == 2 || level == 3
			@opts.errout.write "#{text}\n"
		else
			@opts.out.write "#{text}\n"

	fmt: (level, ...parts) ->
		@checkLevel level
		font[colors[level]]("[#{levels[level]}]") + " " + util.format(...parts)

	log: (level, ...parts) ->
		@checkLevel level
		level = levels.index-of level if typeof level == \string
		if level >= @opts.level
			@output level, @fmt(level, ...parts)

		@

	debug: (...a) -> @log \debug, ...a
	info: (...a) -> @log \info, ...a
	warn: (...a) -> @log \warn, ...a
	error: (...a) -> @log \error, ...a


exports = module.exports = new Logger