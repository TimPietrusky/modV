let Remote = require('./Remote');
const createFromTemplate = require('./createFromTemplate');

function loopThroughGalleryItems(callback) {
	var galleryItemNodes = document.querySelectorAll('.gallery-item');
	[].forEach.call(galleryItemNodes, callback);
}

/**
 * Get closest DOM element up the tree that contains a class, ID, or data attribute
 * @param  {Node} elem The base element
 * @param  {String} selector The class, id, data attribute, or tag to look for
 * @return {Node} Null if no match
 */
var getClosest = function (elem, selector) {

    var firstChar = selector.charAt(0);

    // Get closest match
    for ( ; elem && elem !== document; elem = elem.parentNode ) {

        // If selector is a class
        if ( firstChar === '.' ) {
            if ( elem.classList.contains( selector.substr(1) ) ) {
                return elem;
            }
        }

        // If selector is an ID
        if ( firstChar === '#' ) {
            if ( elem.id === selector.substr(1) ) {
                return elem;
            }
        } 

        // If selector is a data attribute
        if ( firstChar === '[' ) {
            if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
                return elem;
            }
        }

        // If selector is a tag
        if ( elem.tagName.toLowerCase() === selector ) {
            return elem;
        }

    }

    return false;
};

var moved = false;
var panelOpen = false;
let galleryPanel = document.querySelector('.gallery-panel');

galleryPanel.addEventListener('touchmove', function() {
	moved = true;
});

galleryPanel.addEventListener('touchstart', function(e) {
	if(!e.target.classList.contains('add-panel') && !e.target.classList.contains('show') && panelOpen) {
		galleryPanel.classList.remove('showOverflow');
		galleryPanel.style.top = 'auto';
		panelOpen = false;
	}
});

Remote.prototype.createGalleryItem = function(Module) {
	let self = this;
	let galleryPanel = document.querySelector('.gallery-panel');

	let galleryItemNode = createFromTemplate(this.templates, 'gallery-item');

	galleryItemNode.querySelector('.title').textContent = Module.name;

	let addPanelNode = galleryItemNode.querySelector('.add-panel');

	function addDocumentListener(e) {
		var foundItem = getClosest(e.target, '.gallery-item');
		if(!foundItem || !foundItem.isEqualNode(galleryItemNode)) {
			document.removeEventListener('touchstart', addDocumentListener);
			addPanelNode.classList.remove('show');
			panelOpen = false;
			galleryPanel.style.top = 'auto';
			if(!galleryPanel.contains(e.target)) galleryPanel.classList.remove('showOverflow');
		}
	}

	galleryItemNode.addEventListener('touchend', function() {
		if(moved) {
			moved = false;
			galleryPanel.classList.remove('showOverflow');
			return;
		}
		document.addEventListener('touchstart', addDocumentListener);

		loopThroughGalleryItems(function(galleryItemNode) {
			let addPanelNode = galleryItemNode.querySelector('.add-panel');
			addPanelNode.classList.remove('show');
		});

		addPanelNode.classList.toggle('show');
		galleryPanel.style.top = -galleryPanel.scrollTop + 'px';

		galleryPanel.classList.add('showOverflow');
		panelOpen = true;
	});

	addPanelNode.addEventListener('touchstart', function() {
		console.log('add module', this.parentNode.textContent.trim());
		self.createModule(this.parentNode.textContent.trim());
		document.querySelector('.active-items-list').appendChild(self.createActiveItem(this.parentNode.textContent.trim()));
	});

	return galleryItemNode;
};