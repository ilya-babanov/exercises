module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            options: {
                banner: 'var app = {};'
            },
            js: {
                src: ['src/js/**/*.js', 'src/initApp.js'],
                dest: 'build/scripts.js'
            }
        },
        autoprefixer: {
            concat: {
                src: ['src/reset.css','src/css/**/*.css'],
                dest: 'build/styles.css'
            }
        },
        uglify: {
            build: {
                src: 'build/scripts.js',
                dest: 'build/scripts.min.js'
            }
        },
        cssmin: {
            build: {
                src: 'build/styles.css',
                dest: 'build/styles.min.css'
            }
        },
        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'build/index.html': 'src/index.html'
                }
            }
        },
        watch: {
            js: {
                files: '<%= concat.js.src %>',
                tasks: ['concat:js', 'uglify:build']
            },
            css: {
                files: '<%= autoprefixer.concat.src %>',
                tasks: ['autoprefixer:concat', 'cssmin:build']
            },
            html: {
                files: 'src/index.html',
                tasks: 'htmlmin:build'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.registerTask('default', ['concat', 'autoprefixer', 'uglify', 'cssmin']);
};