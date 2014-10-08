LBase  = require \./base
RValue = require \r-value

class LValue extends LBase
	(defaultVal, val = true) ->
		super!
		@_sb = new RValue
		@_sb.on 'update', (data) ~> @emit 'update', data
		@_sb.on '_update', (update) ~> @emit '_update', update

		# TODO: Fix this
		if defaultVal?
			if val
				# @defaultVal = null
				@set defaultVal
			else
				@_update defaultVal

	creationArgs: -> [@_sb._history[@_sb._history.length - 1], false]
	@mapCreationArgs = (fn, args, ...subArgs) -> [ [ fn(args[0][0], ...subArgs), args[0][1], args[0][2] ], args[1] ]

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