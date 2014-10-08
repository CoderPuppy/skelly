{filter} = require \scuttlebutt/util
LBase    = require \./base
utils    = require \./utils

class LMap extends LBase
	(@opts = {}) ->
		super!
		@db = {}
		@_hist       = {}
		@_history-map = {}

	_prefix: (key) ->
		key = "#{@opts.prefix}:#{key}" if @opts.prefix?
		key

	# This assumes that the key is prefixed
	_unprefix: (key) ->
		if @opts.prefix?
			key = key.substring @opts.prefix.length + 1

		key

	_checkPrefix: (key) ->
		return true unless @opts.prefix?
		key.substring(0, @opts.prefix.length) == @opts.prefix

	_register: (key, model, update = true) ->
		@db[key] = model

		model.on \_update, ~>
			if @db[key] == model
				@local-update [ 'c', key, it ]

		if update
			@local-update [ 'd', key, LBase.from(model) ]

	set: (key, model) ->
		key = @_prefix key
		@_register key, model

	get: (key) -> @db[@_prefix(key)]

	applyUpdate: (update) ->
		data = update[0]

		switch data[0]
			# Child updates
			when 'c'
				return false unless @_checkPrefix data[1]

				@_history-map["#{data[1]}-#{data[2][2]}-#{data[2][1]}"] = update

				@db[data[1]]?._update(data[2])

				true

			# Adding or removing models
			when 'd'
				return false unless @_checkPrefix data[1]

				@_hist[data[1]] = update

				unless update[2] == @id
					if data[2]?
						unless @db[data[1]]? and LBase.type(@db[data[1]]) == data[2][0]
							@_register data[1], LBase.create(...data[2]), false
					else
						delete @db[data[1]]

				true

			else false

	history: (sources) ->
		hist = []

		for key, update of @_hist
			if !~hist.indexOf(update) && filter(update, sources)
				hist.push update

		for key, val of @db
			console.log 'key:', key, 'hist: ', val.history({}), 'val:', val
			hist = hist.concat val.history({}).map((update) ~> @_history-map["#{key}-#{update[2]}-#{update[1]}"]).filter(-> filter(it, sources))

		console.log hist

		hist.filter(Boolean).sort utils.order

LBase.Map = LMap
LBase.register LMap

module.exports = LMap