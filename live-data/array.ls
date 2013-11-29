LBase = require \./base

class LArray extends LBase
	(...vals) ->
		super!

		@_sb   = new RArray
		@_db   = {}
		@_rack = hat.rack!

		@length = new LValue(0)

		@_hist       = {} # Key => The update that defined the key
		@_historyMap = {} # Key for unmapped update => Mapped update

		@_updateBuffer = {}
		@_sbKeys       = {}
		@_dbKeys       = {}

		@_sb.on 'update', (rawUpdate) ~>
			update = {}

			for sbKey, key of rawUpdate
				update[key] = @_db[key]

			for sbKey, key of rawUpdate
				if key?
					@_sbKeys[key] = sbKey
					@_dbKeys[sbKey] = key

			@emit 'update', update

			for sbKey, key of rawUpdate
				if key? and update[key]? # Update or insert
					if @_updateBuffer[key]?
						@emit 'update', @_sb.indexOfKey(sbKey), update[key], key, sbKey
					else
						@length.set @_sb.length

						@emit 'insert', @_sb.indexOfKey(sbKey), update[key], key, sbKey

					@_updateBuffer[key] = update[key]
				else # Delete
					key = @_dbKeys[sbKey]

					if @_updateBuffer[key]? || @_db[key]?
						@length.set @_sb.length

						@emit 'remove', @_sb.indexOfKey(sbKey), @_updateBuffer[key] || @_db[key], key, sbKey
					else

			for sbKey, key of rawUpdate
				if !key?
					key = @_dbKeys[sbKey]
					delete @_dbKeys[sbKey]
					delete @_sbKeys[key]
					delete @_updateBuffer[key]
					delete @_hist[key]
					process.nextTick(((key) -> delete @_db[key]).bind @, key)

			return

		@_sb.on '_update', (update) ~>
			@localUpdate [ 'a', update ]

		for val in vals then @push val

	creationArgs: -> []
	@mapCreationArgs = (fn, args) -> []

	# Internal Functions
	_genId: -> @_rack!
	_register: (val, key = @_genId!, update = true) ->
		if update
			@localUpdate [ 'd', key, val.constructor.name.toLowerCase!, val.creationArgs! ]
		@_db[key] = val
		# I can't think of a way to remove this when the key is removed from the database
		# that doesn't include having an object storing all of them
		val.on '_update', ~>
			if @_db[key] == val
				@localUpdate [ 'c', key, it ]
		key
	_setIndex: (index, key) ->
		@_sb.set @_sb.keys[index], key
	_unset: (key) ->
		@_sb.unset @_sbKeys[key]

	push: (val) ->
		key = @_register val
		@_sb.push key
		@

	unshift: (val) ->
		key = @_register val
		@_sb.unshift key
		@

	# TODO: This shouldn't be this complicated
	get: (index) ->
		@_db[@_sb.get @_sb.keys[index]]

	pop: ->
		key = @_sb.pop!
		@_db[key]

	shift: ->
		key = @_sb.shift!
		@_db[key]

	remove: (index) ->
		@_sb.unset @_sb.keys[index]
		@
	
	forEach: (fn) ->
		for i in [0 til @length.get!]
			fn.call(@, @get(i), i)

		@

	each: (fn) -> @forEach(fn)

	# TODO: Figure out how to implement indexOf

	@mapper = (fn, subArgs = []) ->
		db     = {}
		dbKeys = {}

		ss.json through (update) ->
			if Array.isArray update
				data = update[0]

				switch data[0]
					when 'c'
						# [ 'c', key, childData ]
						childUpdate = data[2].slice!
						childUpdate.args = [ data[1] ]
						childUpdate.custom = update

						if Array.isArray(update.args)
							childUpdate.args = childUpdate.args.concat(update.args)
						db[data[1]]?.write JSON.stringify(childUpdate)
					when 'd'
						mapper = LBase.types[data[2]].mapper(fn, ...subArgs)
						mapper.on 'data', (update) ~>
							@queue [ [ 'c', data[1], update ], update.custom[1][1], update.custom[1][2] ]

						db[data[1]] = mapper

						@queue [ [ 'd', data[1], data[2], LBase.types[data[2]].mapCreationArgs(fn, data[3], data[1]) ], update[1], update[2] ]
					else
						for sbKey, key of data
							if key?
								dbKeys[sbKey] = key
							else
								delete db[dbKeys[sbKey]]
								delete dbKeys[sbKey]

						@queue update
			else
				@queue update

	# Scuttlebutt Implementation
	history: (sources) ->
		hist = @_sb.history(sources).map (update) ~> @_historyMap["#{update[2]}-#{update[1]}"]

		for key, update of @_hist
			if !~hist.indexOf(update) && filter(update, sources)
				hist.push update

		for key, val of @_db
			hist = hist.concat val.history(sources).map((update) ~> @_historyMap["#{key}-#{update[2]}-#{update[1]}"])

		hist.filter(Boolean).sort order

	applyUpdate: (update) ->
		data = update[0]

		switch data[0]
			# Array
			when 'a'
				@_historyMap["#{data[1][2]}-#{data[1][1]}"] = update
				@_sb.applyUpdate(data[1])
			# DB
			when 'd'
				@_hist[data[1]] = update

				if !@_db[data[1]]?
					@_register LBase.create(data[2], ...data[3]), data[1], false

				@emit '_register', data[1], @_db[data[1]]

				true
			# Child updates
			when 'c'
				@_historyMap["#{data[1]}-#{data[2][2]}-#{data[2][1]}"] = update

				if update[2] != @id
					@_db[data[1]]?._update(data[2])

				true

LBase.Array = LArray
LBase.register LArray

module.exports = LArray