/* jshint esversion: 6, node: true */

'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Manifest from 'asset-builder';
import del from 'del';
import runSequence from 'run-sequence';
import lazypipe from 'lazypipe';
import merge from 'merge-stream';
import webpack from 'webpack';
import browserSync from 'browser-sync';
import webpackConfig from './webpack.config.js';
import serveStatic from 'serve-static';
import preprocess from 'gulp-preprocess';

// TODO: remove gulp-load-plugins, just import them manually
var plugins = gulpLoadPlugins(),
    manifest = Manifest('./src/assets/manifest.json'),
    environment = 'development', // override for production tasks

    // load private data
    shopifyStores = require('./private.json').shopifyStores,

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

// ### Styles
// `gulp styles` - Compiles, combines, and optimizes Bower CSS and project CSS.
// By default this task will only log a warning if a precompiler error is
// raised. If the `--production` flag is set: this task will fail outright.

function styleTasks(filename){
    return lazypipe()
        .pipe(plugins.plumber)
        .pipe(function() {
            return plugins.if(environment === 'development', plugins.sourcemaps.init());
        })
        .pipe(
            preprocess,
            {
                context: {
                    NODE_ENV: 'development'
                },
                extension: 'scss'
            }
        )
        .pipe(
            plugins.sass,
            {
                outputStyle: 'expanded', // libsass doesn't support expanded yet
                precision: 10,
                includePaths: ['.'],
                errLogToConsole: true
            }
        )
        .pipe(
            plugins.concat,
            // TODO: I don't think I need this, css is processed as liquid on the shopify servers
            filename + (environment === 'production' ? '.liquid' : '')
        )
        .pipe(
            plugins.autoprefixer,
            {
                browsers: [
                    'last 2 versions',
                    'android 4',
                    'opera 12'
                ]
            }
        )
        .pipe(
            plugins.if,
            environment === 'production',
            plugins.cssnano(
            {
                safe: true
            })
        )
        .pipe(function() {
            return plugins.if(environment === 'development', plugins.sourcemaps.write('.', {
                sourceRoot: 'assets/styles/'
            }));
        })();

}

gulp.task('styles', () => {
    // create empty merged stream to add css dependencies to
    var merged = merge();

    // loop over all the css dependencies
    manifest.forEachDependency('css', (dep) => {
        merged.add(
            gulp.src(dep.globs)
                .pipe(styleTasks(dep.name))
        );
    });

    return merged
        .pipe(plugins.flatten())
        .pipe(
            gulp.dest(
                path.dist + 'assets'
            )
        );
});

// ### Scripts
// `gulp scripts` - Runs JSHint then compiles, combines, and optimizes Bower JS
// and project JS.
function jsTasks(filename){
    return lazypipe()
        .pipe(
            plugins.concat,
            // TODO: I might not need this, css is processed as liquid on the
            // shopify servers, so js might be as well.
            filename + (environment === 'production' ? '.liquid' : '')
        )
        .pipe(
            plugins.uglify,
            {
                compress: {
                    'drop_debugger': true
                }
            }
        )();
}

// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
// myDevConfig.devtool = "sourcemap";
// myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task('scripts:webpack', (callback) => {
    // run webpack to process app.js
    devCompiler.run(function(err, stats) {
        if(err) throw new plugins.util.PluginError("webpack:build-dev", err);
        plugins.util.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));

        callback();
    });
});

gulp.task('scripts:old', /*['jshint'], */ (callback) => {
    // copy over the vendor files to assets
    gulp.src(path.source + 'assets/scripts/vendor/**/*.js')
        .pipe(gulp.dest(path.dist + 'assets'));

    var merged = merge();

    // process the old shop.js files
    manifest.forEachDependency('js', function(dep) {
        merged.add(
            gulp.src(dep.globs)
                .pipe(jsTasks(dep.name))
        );
    });

    return merged
        .pipe(plugins.flatten())
        .pipe(
            gulp.dest(
                path.dist + 'assets'
            )
        );
});

gulp.task('scripts', ['jshint'], (callback) => {
    runSequence(
        ['scripts:old',
        'scripts:webpack'],
        callback
    );
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
gulp.task('fonts', () => {
    return gulp.src(globs.fonts)
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.dist + 'assets'));
        // .pipe(browserSync.stream());
});

// ### Images
// `gulp images` - Run lossless compression on all the images.
gulp.task('images', () => {
    return gulp.src(globs.images)
        .pipe(plugins.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest(`${path.dist}assets`));
        // .pipe(browserSync.stream());
});

// ### JSHint
// `gulp jshint` - Lints configuration JSON and project JS.
gulp.task('jshint', () => {
    return gulp.src([
        'bower.json', 'gulpfile.babel.js', 'private.json'
    ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.if(true, plugins.jshint.reporter('fail')));
});

// gets all file extensions
// ('./some/where/something.html.liquid') => ['html', 'liquid']
// returns null if no extension
function getExtension(path) {
    var basename = path.split('/').pop(),  // extract file name from full path ...
        // (supports `\\` and `/` separators)
        pos = basename.indexOf(".");       // get first position of `.`

    if (basename === "" || pos < 1)            // if file name is empty or ...
        return null;                             //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1).split('.');            // extract extension ignoring `.` and spliting on '.'
}

// searches array for any value in passed array
function doesArrayContainAny(haystack, needles){
    if (Array.isArray(haystack) && Array.isArray(needles)){
        return needles.some(v => haystack.indexOf(v) >= 0);
    }

    throw new Error('function doesArrayContainAny requires 2 passed arrays.');
}

// ### Shopify Theme Files
// `gulp shopify` - Copys the shopify theme files to the dist dir
var shopifyPipe = (() => {
    var liquidTagRegexes = [/\{\{[\s\S]*?\}\}/, /\{%[\s\S]*?%\}/],
        whitelist = ['liquid', 'html'],
        blacklist = ['js'];

    // test for minification
    // TODO: HTML minification is breaking the shop carousel for some reason.
    // enable minification again and troubleshoot in development.
    function shouldMinify(file){
        return false;

        // if (environment === 'development'){
        //     return false;
        // }

        // var ext = getExtension(file.path);

        // // if extension in whitelist and not in blacklist
        // if (ext !== null && doesArrayContainAny(ext, whitelist) && !doesArrayContainAny(ext, blacklist)){
        //     return true;
        // }
        // return false;
    }

    // return the lazypipe
    return lazypipe()
        .pipe(() => {
            return plugins.if(shouldMinify, plugins.htmlmin({
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                decodeEntities: true,
                ignoreCustomFragments: liquidTagRegexes,
                includeAutoGeneratedTags: false,
                minifyCSS: true,
                minifyJS: true,
                processScripts: ['text/template'],
                quoteCharacter: '"',
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            }));
        })
        .pipe(gulp.dest, path.dist);
})();

gulp.task('shopify-templates', () => {
    return gulp.src(path.source + 'shopify_theme/**/*')
        .pipe(shopifyPipe());
});


/**
 * Clean
 *
 * Deletes the build folder entirely.
 */
gulp.task('clean', () => {
    // remove everything in the dist dir except for the config.yml file
    var args = [
        path.dist + '**',
        '!' + path.dist.replace(/\/$/, ''), // need to trim the trailing slash to ignore the directory
        '!' + path.dist + 'config.yml'
    ];
    return del(args);
});

/**
 * Build
 */
gulp.task('build', (done) => {
    return runSequence(
        'styles',
        'scripts',
        ['fonts', 'images', 'templates', 'videos', 'shopify-templates'],
        done
    );
});

/**
 * Upload
 */
// gulp.task('upload', (done) => {
//     var uploadDirs = [
//         'assets',
//         'layout',
//         'config',
//         'snippets',
//         'templates',
//         'locales',
//         'sections'
//     ];

//     // exclude assets dir in development
//     if (environment === 'development'){
//         uploadDirs.shift();
//     }

//     var srcGlob = path.dist + '+(' + uploadDirs.join('|') +')/**';

//     var shop = shopifyStores[environment];

//     return gulp.src(srcGlob)
//         .pipe(plugins.shopifyUploadWithCallbacks(
//             shop.api_key,
//             shop.password,
//             shop.url,
//             shop.id,
//             // null, // theme id is optional
//             {
//                 'basePath': path.dist
//             }
//         ));
// });

/**
 * Deploy
 */
// gulp.task('deploy', (done) => {
//     runSequence(
//         'clean',
//         'build',
//         'upload',
//         done
//     );
// });

/**
 * Serve
 */
/*
 * TODO: add webpack dev server to this somehow as well.
 * https://webpack.github.io/docs/webpack-dev-server.html
 */
gulp.task('serve', () => {
    browserSync
        .create()
        .init({
            proxy: {
                target: 'https://' + shopifyStores.development.url
            },
            files: [
                'dist/assets/**',
                '!dist/assets/*.map'
            ],
            middleware: serveStatic('dist'),
            rewriteRules: [
                {
                    match: /\/\/cdn\.shopify\.com\/s\/files\/.*?\/assets/g,
                    fn: (req, res, match) => {
                        return '/assets';
                    }
                }
            ]
        });
});

/**
 * Watch
 */
gulp.task('watch', () => {
    gulp.watch([path.source + 'assets/scripts/**/*.js?(x)?(.liquid)'], ['scripts']);
    gulp.watch([path.source + 'assets/styles/**/*.scss?(.liquid)'], ['styles']);
    gulp.watch([path.source + 'assets/fonts/**/*'], ['fonts']);
    gulp.watch([path.source + 'assets/images/**/*'], ['images']);
    gulp.watch([path.source + 'assets/videos/**/*'], ['videos']);
    gulp.watch([path.source + 'assets/templates/**/*'], ['templates']);

    plugins.watch(path.source + 'shopify_theme/**/*', {base: path.source + 'shopify_theme'})
        .pipe(shopifyPipe());

    // var shop = shopifyStores[environment];

    // watch the shopify template dirs for changes and upload. Exclude assets
    // directory.
    // return plugins.watch(path.dist + '+(layout|config|snippets|templates|locales|sections)/**')
    //     .pipe(plugins.shopifyUploadWithCallbacks(
    //         shop.api_key,
    //         shop.password,
    //         shop.url,
    //         shop.id,
    //         {
    //             'basePath': path.dist
    //         }
    //     ));
});


/**
 * Main Tasks
 */

// TODO: use gulp-git to create the hotfix and release branches with the correct version numbers
// Also automate tagging the master branch when merging for deployment
// use a file that stores the current version number

// TODO: could I do a deploy of only the files that changed
// build and deploy all the theme assets to the production Shopify
// /**
//  * Deploy Production
//  */
// gulp.task('deploy-production', () => {
//     environment = 'production';
//     runSequence('deploy');
// });

// /**
//  * Deploy Staging
//  *
//  * Build and deploy all the theme assets to the staging shopify store. Uses the
//  * production settings but upload to a staging server incase there are
//  * minification bugs.
//  */
// gulp.task('deploy-staging', () => {
//     environment = 'staging';
//     runSequence('deploy');
// });

// /**
//  * Deploy Development
//  */
// gulp.task('deploy-development', () => {
//     environment = 'development';
//     runSequence('deploy');
// });

/**
 * Develop
 *
 * Run the local dev server, build the assets and watch for changes.
 */
gulp.task('develop', (done) => {
    environment = 'development';
    return runSequence(
        ['serve', 'watch'],
        done
    );
});
gulp.task('default', ['develop']);
