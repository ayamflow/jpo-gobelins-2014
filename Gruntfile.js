module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 9732,
                    open: true,
                    keepalive: true
                }
            }
        },
        concat: {
            options: {
            separator: ';',
            },
            dist: {
                src: ['src/**/*.js', 'lib/**/*.js'],
                dest: 'dist/jpo2014.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['connect']);
    grunt.registerTask('build', ['concat']);
};
