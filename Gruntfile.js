module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    // Private variables
    var private = grunt.file.readJSON('private.json');

    // Private variables
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shopify: {
            options: {
                api_key: private.shopify.api_key,
                password: private.shopify.password,
                url: "theia.myshopify.com",
                base: "dist"
            }
        },
        watch: {
            shopify: {
                files: ["dist/**"],
                tasks: ["shopify"]
            },
            sass: {
                files: ["src/sass/**"],
                tasks: ["sass:dist"]
            },
            concat: {
                files: ["src/checkout-master.css", "src/checkout-master.css.liquid"],
                tasks: ["concat"]
            },
            copy: {
                files: ["src/checkout-master-concat.css.liquid"],
                tasks: ["copy"]
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'src/checkout-master.css': 'src/sass/checkout-master.scss'
                }
            }
        },
        concat: {
            options: {

            },
            checkout: {
                src: ['src/checkout-master.css', 'src/checkout-master.css.liquid'],
                dest: 'src/checkout-master-concat.css.liquid'
            }
        },
        copy: {
            desktop: {
                src: 'src/checkout-master-concat.css.liquid',
                dest: 'dist/assets/checkout.css.liquid'
            },
            mobile: {
                src: 'src/checkout-master-concat.css.liquid',
                dest: 'dist/assets/checkout.mobile.css.liquid'
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['watch']);
};
