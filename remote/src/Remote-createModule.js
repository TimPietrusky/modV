let Remote = require('./Remote');

Remote.prototype.createModule = function(moduleName) {
	var client = this.client;
	var ModuleDetails = this.availableModules[moduleName];

	console.log(ModuleDetails);

	client.sendJSON({
		type: 'addModule',
		payload: {
			name: moduleName,
			layerIndex: 0
		}
	});
};