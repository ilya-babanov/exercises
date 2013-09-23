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