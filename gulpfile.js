// Gulp plugin setup
var gulp = require('gulp'),
    // Watches single files
    watch = require('gulp-watch'),
    gulpShopify = require('gulp-shopify-upload'),
    // load private data
    private = require('./private.json'),
    // set current shop data
    shop = private.shopifyStores[private.currentShop];

gulp.task('shopify:watch', function() {
    return watch('./dist/+(assets|layout|config|snippets|templates|locales)/**')
        .pipe(gulpShopify(
            shop.api_key,
            shop.password,
            shop.url,
            null, // theme id is optional
            {
                'basePath': 'dist/'
            }
        ));
});

// Default gulp action when gulp is run
gulp.task('default', [
    'shopify:watch'
]);
