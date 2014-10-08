binders = require \../live-binders
skelly  = require \../
ldata   = require \../deps/live-data

domready = require \domready

app = new skelly.App
client = skelly.connect app # defaults are cool

# client.store.on \old_data, (u) -> console.log 'discarded update:', u
# client.rawStore.on \old_data, (u) -> console.log 'discarded update:', u
# app.store.on \old_data, (u) -> console.log 'discarded update:', u

window.arr = arr = new ldata.Array
app.store.set 'arr', arr

arr.push(new ldata.Value('test'))

domready ->
	arr.pipe(binders.children(document.body, (val) ->
		el = document.createElement 'div'
		val.pipe binders.text-content(el)
		el
	))

window.client = client
window.ldata  = ldata
window.app    = app