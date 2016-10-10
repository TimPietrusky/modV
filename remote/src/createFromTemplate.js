module.exports = function(templates, domId) {
	var template = templates.querySelector('#' + domId);
	var templateNode = document.importNode(template.content, true);

	var temp = document.createElement('div');
	temp.id = 'temp';
	temp.style.display = 'none';

	document.body.appendChild(temp);
	temp.appendChild(templateNode);

	// Pull back initialised node from DOM
	templateNode = document.querySelector('#temp > *');

	document.body.removeChild(temp);
	return templateNode;
};