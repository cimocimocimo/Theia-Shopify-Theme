'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

var plugins =  gulpLoadPlugins(),
    // load private data
    privateData = require('./private.json'),
    // set current shop data
    shop = privateData.shopifyStores[privateData.currentShop];

gulp.task('shopify:watch', () => {
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
