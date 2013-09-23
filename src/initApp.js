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


