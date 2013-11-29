ldata = require \./live-data

class Client
	(@app, @stream) ->
		return new Client ... unless @ instanceof Client

		@raw-store = new ldata.Map
		@store = new ldata.MapView @raw-store, prefix: \client

		@stream.on 'data', (d) -> console.log 'data:', d
		@raw-store.on '_update', (u) -> console.log 'raw-store updated:', u

		@raw-store.pipe(@app.store).pipe(@raw-store)
		@stream.pipe(@raw-store.createStream()).pipe(@stream)

exports = module.exports = Client