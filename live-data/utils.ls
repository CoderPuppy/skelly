between = require \between

exports.order = (a, b) ->
	# timestamp, then source
	between.strord(a[1], b[1]) || between.strord(a[2], b[2])

exports.dutyOfSubclass = (name) -> -> throw new Error("#{@constructor.name}.#{name} must be implemented")