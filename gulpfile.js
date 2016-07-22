var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    // load private data
    private = require('./private.json'),
    // set current shop data
    shop = private.shopifyStores[private.currentShop];

gulp.task('shopify:watch', function() {
    return plugins.watch('./dist/+(assets|layout|config|snippets|templates|locales)/**')
        .pipe(plugins.shopifyUpload(
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
