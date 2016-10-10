let Remote = require('./Remote');

Remote.prototype.addAvailableModule = function(Module) {
	if(Array.isArray(Module)) {

		Module.forEach(Module => {
			this.availableModules[Module.name] = Module;
		});

	} else {

		this.availableModules[Module.name] = Module;

	}
};