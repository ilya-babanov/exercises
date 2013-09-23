var app = {};(function (app) {
    /**
     * Create simple image gallery in given container
     * @param container container for gallery
     * @param imgArray array of image's urls
     * @param clipWidth image width in gallery
     * @param clipHeight image height in gallery
     * @param imgMargin margin for image
     * @param optionsHeight
     * @constructor
     */
    function ImageManager(container, imgArray, clipWidth, clipHeight, imgMargin, optionsHeight) {
        this.root = container;
        this.images = [];
        this.imgLocation = '../images/';
        this.clipWidth = clipWidth || 170;
        this.clipHeight = clipHeight || 150;
        this.imgMargin = imgMargin || 4;
        this.optionsHeight = optionsHeight || 15;

        createGallery(imgArray, this);
    }
    ImageManager.prototype.increaseImgContainer = function (img) {
        img.container.style.zIndex = 1;
        img.container.style.overflow = 'visible';
        img.transitionContainer.style.width = img.realWidth + 'px';
        img.transitionContainer.style.height = img.realHeight + 'px';
    };
    ImageManager.prototype.reduceImgContainer = function (img) {
        img.container.style.zIndex = 0;
        img.container.style.overflow = 'hidden';
        img.transitionContainer.style.width = this.clipWidth + 'px';
        img.transitionContainer.style.height = this.clipHeight + 'px';
    };

    function createGallery(imgArray, self) {
        for (var i = 0, len = imgArray.length; i < len; i++) {
            var image = new Image();
            image.src = self.imgLocation+imgArray[i];

            image.onload = (function () {
                var loadedImage = image,
                    imgContainer = document.createElement('div'),
                    transitionContainer = document.createElement('div'),
                    optionsContainer = document.createElement('div');
                imgContainer.className = 'imgContainer';
                optionsContainer.className = 'imgOptions';
                transitionContainer.className = 'transitionContainer interactive';
                imgContainer.style.width = imgContainer.style.maxWidth
                    = transitionContainer.style.width = self.clipWidth + 'px';
                imgContainer.style.height = imgContainer.style.maxHeight
                    = transitionContainer.style.height = self.clipHeight + 'px';
                optionsContainer.style.height = self.optionsHeight + 'px';
                imgContainer.appendChild(transitionContainer);

                return function () {
                    loadedImage.style.margin = self.imgMargin + 'px';
                    optionsContainer.innerHTML = 'width: ' + loadedImage.width
                        + '  height: ' + loadedImage.height;
                    transitionContainer.appendChild(loadedImage);
                    transitionContainer.appendChild(optionsContainer);
                    self.root.appendChild(imgContainer);
                    var newImage = {
                        container: imgContainer,
                        transitionContainer: transitionContainer,
                        image: loadedImage,
                        realWidth: loadedImage.width + self.imgMargin*2,
                        realHeight: loadedImage.height + self.imgMargin*2 + self.optionsHeight
                    };

                    self.images.push(newImage);
                    imgContainer.addEventListener('mouseover', function () {
                        self.increaseImgContainer(newImage);
                    });
                    imgContainer.addEventListener('mouseout', function () {
                        self.reduceImgContainer(newImage);
                    });
                }
            })();
        }
    }

    app.ImageManager = ImageManager;

})(app);
(function (app) {
    /**
     * Creates object that can find and select any text in HTML element appropriate to input's "data-reference" attribute
     * (The seagull manager flies in, makes a lot of noise, craps on everything then flies off again leaving a big mess behind)
     * @param input Html input element
     * @constructor
     */
    function SeagullManager(input) {
        if (input) this.root = document.getElementById(input.getAttribute('data-reference'));
        if (!this.root) {
            throw new Error('Input should have "data-reference" attribute with id of existing HTMLElement!');
        }
        this.input = input;
        this.nodes = [];
        this.ranges = [];
        this.inputListener = null;
        this.searchTimeout = 200;

        findAllTextNodes(this.root, this.nodes);
        this.startListenInput();
    }

    SeagullManager.prototype.startListenInput = function () {
        if (this.inputListener === null) {
            var searchTimeoutId,
                self = this;

            this.inputListener = function () {
                var searchText = self.input.value;
                clearTimeout(searchTimeoutId);
                searchTimeoutId = setTimeout(function () {
                    self.search(searchText);
                }, self.searchTimeout);
            };

            this.input.addEventListener('keyup', this.inputListener);
        }
    };

    SeagullManager.prototype.stopListenInput = function () {
        this.input.removeEventListener('keyup', this.inputListener);
        this.inputListener = null;
    };

    SeagullManager.prototype.search = function(text) {
        this.clearSelections();
        if (!text) return;
        var screenRegExp = /([\.\*\/\^\$\[\]\(\)\{\}\+\?\|\\])/g,
            result = [],
            textLength = text.length,
            regExp = new RegExp(text.replace(screenRegExp, '\\$1'), 'g');

        this.nodes.forEach(function (node, index) {
            while (node && (result = regExp.exec(node.data)) !== null) {
                var startIndex = regExp.lastIndex - textLength,
                    range = document.createRange(),
                    surroundContainer = document.createElement('span');
                surroundContainer.className = 'surround';
                range.setStart(node, startIndex);
                range.setEnd(node, regExp.lastIndex);
                range.surroundContents(surroundContainer);
                node = surroundContainer.nextSibling;
                regExp.lastIndex = 1;
                this.ranges.push({item: range, nodeIndex: index});
            }
        }, this);
    };

    SeagullManager.prototype.clearSelections = function() {
        this.ranges.forEach(function (range) {
            var rangeItem = range.item,
                text = rangeItem.cloneContents().firstChild.firstChild;//DocumentFragment -> span.surround -> textNode
            rangeItem.commonAncestorContainer.normalize();
            rangeItem.extractContents();
            rangeItem.insertNode((text));
            rangeItem.commonAncestorContainer.normalize();
            this.nodes[range.nodeIndex] =
                rangeItem.commonAncestorContainer.childNodes[rangeItem.startOffset]
                || findFirstTextNode(rangeItem.commonAncestorContainer);
            rangeItem.detach();
        }, this);
        this.ranges = [];
    };

    function findAllTextNodes(element, resultArray) {
        if (element.hasChildNodes()) {
            var elements = element.childNodes,
                child;
            for (var i = 0, len = elements.length; i < len; i++ ) {
                child = elements[i];
                if (child.nodeType === 3) {
                    resultArray.push(child);
                } else if (child.hasChildNodes()) {
                    findAllTextNodes(child, resultArray);
                }
            }
        } else if (element.nodeType === 3) {
            resultArray.push(element);
        }
    }

    function findFirstTextNode(element) {
        if (element.nodeType === 3 && element.data) {
            return element;
        } else if (element.hasChildNodes()) {
            element.normalize();
            for (var i = 0, len = element.childNodes.length; i < len; i++) {
                var childTextNode = findFirstTextNode(element.childNodes[i]);
                if (childTextNode && childTextNode.data) {
                    return childTextNode;
                }
            }
        }
        return null;
    }

    app.SearchManager = SeagullManager;
})(app);
(function () {
    var searchManager1 = new app.SearchManager(document.getElementById('search1')),
        searchManager2 = new app.SearchManager(document.getElementById('search2')),
        imagesUris = [
            'img_1.jpg',
            'img_2.jpg',
            'img_3.jpg',
            'img_4.jpg',
            'img_5.jpg',
            'img_6.jpg',
            'img_7.jpg',
            'img_8.jpg',
        ],
        imageManager = new app.ImageManager(document.getElementById('imagesContainer'), imagesUris);
})();


