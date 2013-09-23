(function (app) {
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