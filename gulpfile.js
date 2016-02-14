// Gulp plugin setup
var gulp = require('gulp');
// Watches single files
var watch = require('gulp-watch');
var gulpShopify = require('gulp-shopify-upload');

// load private data
var private = require('./private.json');

gulp.task('shopify:watch', function() {
    return watch('./dist/+(assets|layout|config|snippets|templates|locales)/**')
        .pipe(gulpShopify(
            private.shopifyDevelop.api_key,
            private.shopifyDevelop.password,
            'theia2.myshopify.com',
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
