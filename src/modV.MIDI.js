modV.prototype.MIDI = class {

	constructor() {

		this.access = null;
		this.inputs = null;
		this.outputs = null;
		this.learning = false;
		this.currentNode = null;
		this.currentModuleName = null;
		this.currentControlKey = null;
		this.reservedKey = 'modVReserved:';

		this.assignments = new Map();
	}

	getNameFromID(ID) {

		let inputs = this.inputs;
		let name = false;

		for(let input of inputs) {
			if(ID === input.id) name = input.name;
		}

		return name;
	}

	handleDevices() {
		let inputs = this.inputs;
		let outputs = this.outputs;

		this.superOutputs = {};


		for (let output of outputs.values()) {
			this.superOutputs[output.name] = output;

			// Turn all button lights off
			if (output.name === 'MIDI Mix' || output.name === 'Launch Control XL') {

				for (let i = 0; i < 128; i++) {
					//output.send([ 0x90, i, 0 ]);
				}
			}
		}

		//let buttons = [1, 4, 7, 10, 13, 16, 19, 22, 3, 6, 9, 12, 15, 18, 21, 24];

		/*buttons.forEach(function(element) {
			// Turn of lights

		}.bind(this));*/

		// loop over all available inputs and listen for any MIDI input
		for (let input of inputs.values()) {

			if(!this.assignments.get(input.id)) this.assignments.set(input.id, {});

			// each time there is a midi message call the onMIDIMessage function
			input.addEventListener('midimessage', this.handleInput.bind(this));
		}
	}

	handleInput(message) {
		let data = message.data;
		let midiChannel = parseInt(data[1]);
		let inputMap = this.assignments.get(message.currentTarget.id);
		let Control;
		let isReserved;

		let assignment = inputMap[midiChannel];

		if(this.learning) {
			inputMap[midiChannel] = this.createAssignment(this.currentNode, message.currentTarget.id, midiChannel, this.currentModuleName, this.currentControlKey);

			this.currentControlKey = null;
			this.currentModuleName = null;

			this.currentNode = null;
			this.learning = false;
		}

		if(assignment) {
			let moduleName = assignment.moduleName;
			let controlKey = assignment.controlKey;

			isReserved = controlKey.indexOf('modVReserved:');

			if(isReserved > -1) {
				Control = modV.activeModules[moduleName].info.internalControls[controlKey.substring(this.reservedKey.length)];
			} else {
				Control = modV.activeModules[moduleName].info.controls[controlKey];
			}

			var midiNode = document.querySelector("*[data-midichannel='" + data[1] + "'][data-midideviceid='" + message.currentTarget.id + "']");

			if(midiNode && Control) {

				modV.isControl(Control, {

					range: () => {
						let calculatedValue = Math.map(parseInt(data[2]), 0, 127, parseFloat(midiNode.min), parseFloat(midiNode.max));

						if(parseInt(Control.node.value) === calculatedValue) return;

						if(isReserved < 0) Control.writeValue(calculatedValue);
						else {
							modV.activeModules[moduleName].info[controlKey.substring(this.reservedKey.length)] = calculatedValue;
							Control.node.value = calculatedValue;
						}
					},

					checkbox: () => {

						if(parseInt(data[2]) > 63) {

							if(isReserved < 0) {
								Control.writeValue(!Control.node.checked);
							} else {
								Control.node.checked = !Control.node.checked;

								modV.activeModules[moduleName].info[controlKey.substring(this.reservedKey.length)] = !Control.node.checked;
							}

							// Light up button
							if (Control.node.checked) {
								this.superOutputs[message.currentTarget.name].send([ 0x90, data[1], 0x7f ]);

							// Shut down button
							} else {
								this.superOutputs[message.currentTarget.name].send([ 0x90, data[1], 0x00 ]);
							}
						}
					},

					select: () => {
						let node = Control.node;
						let calculatedIndex = Math.floor(Math.map(parseInt(data[2]), 0, 127, 0, node.length-1));

						if(parseInt(Control.node.selectedIndex) === calculatedIndex) return;

						if(isReserved < 0) Control.writeValue(calculatedIndex);
						else {
							Control.node.selectedIndex = calculatedIndex;
							let selectValue = Control.node.options[calculatedIndex].value;

							modV.activeModules[moduleName].info[controlKey.substring(this.reservedKey.length)] = selectValue;
						}
					},

					button: () => {
						if(parseInt(data[2]) > 63) {
							Control.push();
						} else {
							Control.release();
						}
					}
				});
			}
		}
	}

	importAssignments(assignments) {

		assignments.forEach((channels, deviceID)  => {

			if(!this.assignments.get(deviceID)) this.assignments.set(deviceID, {});
			let inputMap = this.assignments.get(deviceID);

			forIn(channels, (channel, assignment) => {
				let moduleName = assignment.moduleName;
				let controlKey = assignment.controlKey;

				let isReserved = controlKey.indexOf('modVReserved:');
				let Control;

				if(isReserved > -1) {
					Control = modV.activeModules[moduleName].info.internalControls[controlKey.substring(this.reservedKey.length)];
				} else {
					Control = modV.activeModules[moduleName].info.controls[controlKey];
				}

				let inputNode = Control.node;

				inputMap[channel] = this.createAssignment(inputNode, deviceID, channel, moduleName, controlKey);
			});

		});
	}

	createAssignment(node, id, channel, name, controlKey) {
		let inputNode = node;

		inputNode.dataset.midichannel = channel;
		inputNode.dataset.midideviceid = id;

		return {
			controlKey: controlKey,
			moduleName: name
		};
	}

	start() {

		// request MIDI access
		if (navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess({
				sysex: false
			}).then((access) => {

				this.access = access;
				this.inputs = access.inputs;
				this.outputs = access.outputs;

				this.handleDevices();

				access.addEventListener('statechange', () => {
					// TODO: Why does this has to be removed when I send an event back to the device itself?
					//this.handleDevices();
				});

			}, (error) => {
				console.error('MIDI access was refused. Please check your MIDI permissions', error);
			});
		} else {
			console.error('No MIDI support in your browser.');
		}

	}

};
