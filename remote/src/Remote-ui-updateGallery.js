let Remote = require('./Remote');

Remote.prototype.updateGallery = function() {
	
	let availableModules = this.availableModules;
	let gallery = document.querySelector('.gallery-inner');

	gallery.innerHTML = '';

	for(let key in availableModules) {
		let Module = availableModules[key];
		let galleryItem = this.createGalleryItem(Module);
		gallery.appendChild(galleryItem);
	}
};