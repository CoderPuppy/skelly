LBase  = require \./base
RValue = require \r-value

class LValue extends LBase
	(defaultVal, force = false) ->
		super!
		@_sb = new RValue
		@_sb.on 'update', (data) ~> @emit 'update', data
		@_sb.on '_update', (update) ~> @emit '_update', update

		# TODO: Fix this
		if defaultVal? # and force
			# @defaultVal = null
			@set defaultVal

	creationArgs: -> [@get!]
	@mapCreationArgs = (fn, args, ...subArgs) -> [ fn(args[0], ...subArgs) ]

	set: (newValue) ->
		if @get! != newValue
			@_sb.set newValue
		@

	get: -> @_sb.get!

	@mapper = (fn) ->
		ss.json through (update) ->
			@queue if Array.isArray(update)
				args = [ update[0] ]

				if Array.isArray(update.args)
					args = args.concat(update.args)

				newUpdate = [ fn(...args), update[1], update[2] ]
				newUpdate.custom = update.custom
				newUpdate
			else
				update

	history: (sources) -> @_sb.history(sources)
	applyUpdate: (update) -> @_sb.applyUpdate(update)

LBase.Value = LValue
LBase.register LValue

module.exports = LValue