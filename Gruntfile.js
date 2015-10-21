module.exports = function(grunt) {

  grunt.initConfig({
    
    site: {
      site: {
        options: {
          site: {
            title: 'Example',
          },
          templates: 'site/templates'
        },
        src: 'site/content',
        dest: 'dest'
      }
    },
    
    connect: {
      site: {
        options: {
          port: 8000,
          base: 'dest',
          livereload: true          
        }
      }
    },
    
    jshint: {
      task: {
        src: ['tasks/site.js']
      }
    },

    watch: {
      reload: {
        files: [
          'dest/**/*'
        ],
        options: {
          livereload: true
        }
      },
      site: {
        files: ['site/**/*'],
        tasks: ['site']
      },
      task: {
        files: ['tasks/*.js']
      }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');  
  grunt.loadTasks('tasks');

  grunt.registerTask('build', ['site']);
  grunt.registerTask('default', ['jshint', 'site', 'connect', 'watch']);

};