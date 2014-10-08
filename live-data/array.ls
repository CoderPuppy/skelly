LBase   = require \./base
between = require \between

LValue = require \./value
{order, filter} = require \scuttlebutt/util

class LArray extends LBase
	(...vals) ->
		super!

		@db   = {}
		@keys = []

		@_buffer = {}

		@length = new LValue(0)

		@_hist       = {} # Key => The update that defined the key
		@_historyMap = {} # Key for unmapped update => Mapped update

		for val in vals then @push val

	creationArgs: -> []
	@mapCreationArgs = (fn, args) -> []

	_register: (key, val, emit = true) ->
		@db[key] = val

		if emit
			@local-update [ \d, key, LBase.from(val) ]

		val.on \_update, (update) ~>
			if @db[key] == val
				@local-update [ \c, key, update ]

		key

	_unset: (key) -> @local-update [ \d, key ]

	first-key: -> @keys[0]
	last-key: -> @keys[@keys.length - 1]
	insert: (before = between.lo, val, after = between.hi) ->
		@_register between(before, after), val

	first: -> @db[@first-key]
	last: -> @db[@last-key]

	push: (val) ->
		@insert(@last-key!, val)
		@

	unshift: (val) ->
		@insert(null, val, @first-key!)
		@

	get: (index) -> @db[@keys[index]]

	pop: ->
		key = @last-key!
		val = @db[key]
		@_unset key
		val

	shift: ->
		key = @first-key!
		val = @db[key]
		@_unset key
		val

	remove: (index) ->
		key = @keys[index]
		val = @db[key]
		@_unset key
		val
	
	forEach: (fn) ->
		for i in [0 til @length.get!]
			fn.call(@, @get(i), i)

		@

	each: (fn) -> @forEach(fn)

	@mapper = (fn) -> null

	# Scuttlebutt Implementation
	history: (sources) ->
		hist = []

		for key, update of @_hist
			if !~hist.index-of(update) && filter(update, sources)
				hist.push update

		for key, val of @db
			hist = hist.concat val.history(sources).map((update) ~> @_historyMap["#{key}-#{update[2]}-#{update[1]}"])

		hist.filter(Boolean).sort order

	applyUpdate: (update) ->
		data = update[0]

		switch data[0]
			# DB
			when 'd'
				@_hist[data[1]] = update

				if data[2]?
					unless @db[data[1]]? and LBase.type(@db[data[1]]) == data[2][0]
						@_register data[1], LBase.create(...data[2]), false

				@keys.push data[1] unless @keys.index-of(data[1]) != -1
				@keys.sort!

				switch
				| @_buffer[data[1]]? and  data[2]? => @emit \update, @keys.index-of(data[1]), @db[data[1]], data[1]
				| @_buffer[data[1]]? and !data[2]? => @emit \delete, @keys.index-of(data[1]), @db[data[1]], data[1]
				| _                                => @emit \insert, @keys.index-of(data[1]), @db[data[1]], data[1]

				if !data[2]?
					delete @db[data[1]]
					@keys.slice @keys.index-of(data[1]), 1
					@keys.sort!

				@_buffer[data[1]] = true

				true
			# Child updates
			when 'c'
				@_history-map["#{data[1]}-#{data[2][2]}-#{data[2][1]}"] = update

				if update[2] != @id
					@db[data[1]]?._update(data[2])

				true

LBase.Array = LArray
LBase.register LArray

module.exports = LArray