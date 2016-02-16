module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    // Private variables
    var private = grunt.file.readJSON('private.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // development settings
        shopify: {
            options: {
                api_key: private.shopifyDevelop.api_key,
                password: private.shopifyDevelop.password,
                url: "theia2.myshopify.com",
                base: "dist"
            }
        },
        // production settings
        // commented out since using two sets of options doesn't work with shopify theme
        // shopify: {
        //     options: {
        //         api_key: private.shopifyProduction.api_key,
        //         password: private.shopifyProduction.password,
        //         url: "theia.myshopify.com",
        //         base: "dist"
        //     }
        // },
        watch: {
            shopify: {
                files: ["dist/**"],
                tasks: ["shopify"]
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['watch']);
};
