let Remote = require('./Remote');

Remote.prototype.parseMessage = function(message) {
	let client = this.client;
	let type = message.type;
	console.log(type);

	if(type.indexOf('current') > -1) {
		this.layers = message.payload.layers;
		this.addAvailableModule(message.payload.registeredModules);
		this.updateGallery();
		return;
	}
			
	if(type.indexOf('update.') > -1) {
		type = type.replace('update.', '');

		if(type === 'addRegistered') {
			this.addAvailableModule(message.payload);
			this.updateGallery();
			return;
		}
	}
	
	if(type.indexOf('hello') > -1) {
		client.sendJSON({
			type: 'declare',
			payload: {
				type: 'remote'
			}
		});
		return;
	}

};