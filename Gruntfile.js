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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['site']);

};