'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Manifest from 'asset-builder';
import del from 'del';
import runSequence from 'run-sequence';

var plugins = gulpLoadPlugins(),
    manifest = Manifest('./src/assets/manifest.json'),
    
    // load private data
    privateData = require('./private.json'),
    
    // set current shop data
    shop = privateData.shopifyStores[privateData.currentShop],
    
    // `path` - Paths to base asset directories. With trailing slashes.
    // - `path.source` - Path to the source files. Default: `assets/`
    // - `path.dist` - Path to the build directory. Default: `dist/`
    path = manifest.paths,

    // `config` - Store arbitrary configuration values here.
    config = manifest.config || {},

    // `globs` - These ultimately end up in their respective `gulp.src`.
    // - `globs.js` - Array of asset-builder JS dependency objects. Example:
    //   ```
    //   {type: 'js', name: 'main.js', globs: []}
    //   ```
    // - `globs.css` - Array of asset-builder CSS dependency objects. Example:
    //   ```
    //   {type: 'css', name: 'main.css', globs: []}
    //   ```
    // - `globs.fonts` - Array of font path globs.
    // - `globs.images` - Array of image path globs.
    // - `globs.bower` - Array of all the main Bower files.
    globs = manifest.globs,

    // `project` - paths to first-party assets.
    // - `project.js` - Array of first-party JS assets.
    // - `project.css` - Array of first-party CSS assets.
    project = manifest.getProjectGlobs();


gulp.task('shopify:watch', () => {
    return plugins.watch('./dist/+(assets|layout|config|snippets|templates|locales)/**')
        .pipe(plugins.shopifyUpload(
            shop.api_key,
            shop.password,
            shop.url,
            null, // theme id is optional
            {
                'basePath': path.dist
            }
        ));
});

// ### Styles
// `gulp styles` - Compiles, combines, and optimizes Bower CSS and project CSS.
// By default this task will only log a warning if a precompiler error is
// raised. If the `--production` flag is set: this task will fail outright.
gulp.task('styles', () => {
    return gulp.src(path.source + 'assets/styles/**.*')
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.dist + 'assets'));
});

// ### Scripts
// `gulp scripts` - Runs JSHint then compiles, combines, and optimizes Bower JS
// and project JS.
gulp.task('scripts', ['jshint'], () => {
    return gulp.src(path.source + 'assets/scripts/**.*')
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.dist + 'assets'));
});

// ### Templates
// `gulp templates`
gulp.task('templates', () => {
    return gulp.src(path.source + 'assets/templates/**.*')
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.dist + 'assets'));
});

// ### Videos
// `gulp videos`
// and project JS.
gulp.task('videos', () => {
    return gulp.src(path.source + 'assets/videos/**.*')
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.dist + 'assets'));
});

// ### Fonts
// `gulp fonts` - Grabs all the fonts and outputs them in a flattened directory
// structure. See: https://github.com/armed/gulp-flatten
gulp.task('fonts', function() {
    return gulp.src(globs.fonts)
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.dist + 'assets'))
        // .pipe(browserSync.stream());
});

// ### Images
// `gulp images` - Run lossless compression on all the images.
gulp.task('images', function() {
    return gulp.src(globs.images)
        .pipe(plugins.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest(`${path.dist}assets`))
        // .pipe(browserSync.stream());
});

// ### Shopify Theme Files
// `gulp shopify` - Copys the shopify theme files to the dist dir
gulp.task('shopify', () => {
    return gulp.src(path.source + 'shopify_theme/**/*')
        .pipe(gulp.dest(path.dist));
});

// ### JSHint
// `gulp jshint` - Lints configuration JSON and project JS.
gulp.task('jshint', function() {
    return;

    return gulp.src([
        'bower.json', 'gulpfile.babel.js', 'private.json'
    ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.if(true, plugins.jshint.reporter('fail')));
    
    // return gulp.src([
    //     'bower.json', 'gulpfile.babel.js', 'private.json'
    // ].concat(project.js))
    //     .pipe(jshint())
    //     .pipe(jshint.reporter('jshint-stylish'))
    //     .pipe(gulpif(enabled.failJSHint, jshint.reporter('fail')));
});

// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', () => {
    del([path.dist]);
});

// ### Build
// `gulp build` - Run all the build tasks but don't clean up beforehand.
// Generally you should be running `gulp` instead of `gulp build`.
gulp.task('build', function(callback) {
    runSequence('styles',
                'scripts',
                ['fonts', 'images', 'templates', 'videos', 'shopify'],
                callback);
});

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
