function measureText(text) {
	var measureElement = document.createElement('div');
	measureElement.style.fontSize = '1.5em';
	measureElement.textContent = text;
	measureElement.style.display = 'inline-block';

	document.body.appendChild(measureElement);

	var width = measureElement.clientWidth;
	document.body.removeChild(measureElement);

	if(width > 150) {
		return (((width / 150) * 100) - 100);
	} else {
		return false;
	}
}

let Remote = require('./Remote');
const createFromTemplate = require('./createFromTemplate');

Remote.prototype.createActiveItem = function(moduleName) {
	let activeItemNode = createFromTemplate(this.templates, 'active-item');
	let effectBarTitleNode = activeItemNode.querySelector('.title-text');
	let iconImage = activeItemNode.querySelector('.icon-image');
	let rtCheckbox = activeItemNode.querySelector('.rt-checkbox');

	//setupCheckbox(rtCheckbox);

	const Module = this.availableModules[moduleName];

	// var textSize = measureText(Module.name);

	// if(typeof textSize !== "undefined") {
	// 	effectBarTitleNode.style.fontSize = (1.5 * (textSize/80)) + 'em';
	// }

	effectBarTitleNode.textContent = Module.name;

	iconImage.src = './images/' + Module.name.toLowerCase() + '.png';

	var title = activeItemNode.querySelector('.title');

	activeItemNode.dataset.safeName = Module.safeName;

	title.addEventListener('click', function() {

		//var effect = Module.name;


		var effectControls = document.querySelector('.' + Module.safeName + '-controls');
		//currentControls = effectControls;


		//removeHighlight();
		//hideControls();

		//setActiveEffectBar(effect);
		effectControls.classList.add('show');
		activeItemNode.classList.add('highlight');

	});

	return activeItemNode;
};