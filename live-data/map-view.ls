LBase = require \./base

# TODO: This is most likely unnessecary
class LMapView extends LBase
	(@parent, @opts = {}) ->
		super!
		@parent.on '_update', (update) ~>
			data = update[0]

			switch data[0]
				when \c
					if @_checkPrefix data[1]
						@emit '_update', [ [ \c, @_unprefix(data[1]), data[2] ], update[1], update[2] ]

				when \d
					if @_checkPrefix data[1]
						@emit '_update', [ [ \d, @_unprefix(data[1]), data[2], data[3]], update[1], update[2] ]

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

	get: (key) -> @parent.get @_prefix key

	set: (key, val) ->
		@parent.set @_prefix(key), val
		@

	applyUpdate: (update) ->
		data = update[0]

		switch data[0]
			when \c
				@parent.applyUpdate [ [ \c, @_prefix(data[1]), data[2] ], update[1], update[2] ]

			when \d
				@parent.applyUpdate [ [ \d, @_prefix(data[1]), data[2], data[3] ], update[1], update[2] ]

			else false

	history: (sources) ->
		@parent.history!.filter (update) ~>
			data = update[0]

			switch data[0]
				case \c, \d
					@_checkPrefix data[1]
				else
					false

LBase.MapView = LMapView

module.exports = LMapView