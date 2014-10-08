skelly = require \..

server = skelly.server(static: __dirname + '/public')

server.on \client, (client) ->
	client.store.on \old_data, (u) -> console.log 'discarded update:', u
	client.rawStore.on \old_data, (u) -> console.log 'discarded update:', u
	
server.app.store.on \old_data, (u) -> console.log 'discarded update:', u

server.listen 3200