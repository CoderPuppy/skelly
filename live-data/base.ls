Scuttlebutt = require \scuttlebutt
utils       = require \./utils

# name should be the lowercased name of the class
class LBase extends Scuttlebutt
	@types = {}
	@register = (type) ->
		@types[type.name.toLowerCase!] = type

	@create = (name, ...args) ->
		new @types[name]?(...args)

	@from = (val) ~>
		[ @type(val), ...val.creation-args! ]

	@type = (val) ~>
		val.constructor.name.to-lower-case!

	pipe: (dest) ->
		@createReadStream!.pipe(dest.createWriteStream!)
		dest

	map: (fn, ...args) ->
		newLive = new @constructor(...@constructor.mapCreationArgs(fn, @creationArgs!))

		@createReadStream!.pipe(@constructor.mapper(fn, ...args)).pipe(newLive.createWriteStream!)

		newLive

	clone: ->
		@@create(...@@from(@))

	# What args to pass to the constructor when initially replicating it
	creationArgs: utils.dutyOfSubclass 'creationArgs'
	# Map the creation args
	# @mapCreationArgs = utils.dutyOfSubclass '@mapCreationArgs'

	# It must keep the custom property of any object that comes through
	# Returns: A through stream that takes json and transforms it
	# @mapper = utils.dutyOfSubclass '@mapper'	

	# Scuttlebutt Stuff
	applyUpdate: utils.dutyOfSubclass 'applyUpdate'
	history: utils.dutyOfSubclass 'history'

module.exports = LBase