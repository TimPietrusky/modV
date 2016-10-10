var Remote = function() {

	let client = new WebSocket('ws://192.168.0.11:3133');
	this.client = client;

	this.availableModules = {};
	this.layers = [];
	this.activeModules = [];

	this.templates = document.querySelector('.templates');

	client.sendJSON = function(data) {
		this.send(JSON.stringify(data));
	};

	client.onmessage = e => {
		var data = JSON.parse(e.data);
		if(!('type' in data)) return false;
		else {
			this.parseMessage(data);
		}
	};

};

module.exports = Remote;
window.Remote = Remote;