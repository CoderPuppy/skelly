ldata = require \../live-data

find-el = (el) ->
	old-el = null
	while el != old-el
		old-el = el

		el = el.el if el.el?
		el = el._el if el._el?
		el = el.node if el.node?
		el = el._node if el._node?

	el

children = (el, fn) ->
	el = find-el el

	arr = new ldata.Array
	els = {}

	for child in el.childNodes
		el.removeChild child

	arr.on 'insert', (i, val, key) ->
		els[key] = find-el fn(val)
		el.insert-before els[key], els[arr.keys[i + 1]]

	arr.on 'delete', (i, val, key) ->
		el.remove-child els[key]

	arr

text-content = (el) ->
	el = find-el el

	val = new ldata.Value

	val.on 'update', -> el.text-content = it

	val

value = (el) ->
	el = find-el el

	val = new ldata.Value
	
	apply-dom = (d) ->
		# if typeof d == 'string' and d.length > 0 and el.value != d
		el.value = d

	apply-model = ->
		val.set el.value

	val.on 'update', apply-dom

	if el.value
		apply-model

	el.add-event-listener 'input', apply-model
	el.add-event-listener 'keyup', apply-model

	val


exports.text-content = text-content
exports.children     = children
exports.find-el      = find-el
exports.value        = value