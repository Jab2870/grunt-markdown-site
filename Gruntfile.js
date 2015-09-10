module.exports = function(grunt) {

  grunt.initConfig({
    site: {
      example: {
        options: {
          site: {
            url: 'http://localhost:8000',
            title: 'Example'
          }
        },
        src: 'site',
        dest: 'dest'
      }
    },
    connect: {
      example: {
        options: {
          port: 8000,
          base: 'dest',
          keepalive: true
        }
      }
    },
    jshint: {
      task: {
        options: {},
        src: ['tasks/site.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  
  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['site']);

};