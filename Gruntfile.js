module.exports = function(grunt) {

  grunt.initConfig({
    site: {
      example: {
        options: {
          site: {
            url: 'http://localhost:8000'
          },
          templates: 'example/templates',
          defaultTemplate: 'post.html',
        },
        src: 'example/content',
        dest: 'dest'
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['site']);

};