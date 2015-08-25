
var _ = require('lodash')

module.exports = function (grunt) {
  
  var name = 'site';
  
  var desc = 'The easiest way to create a website with markdown';
  
  var ERROR = {
    INVALID_TEMPLATE_DIR: 'site task must have a valid templates directory',
    INVALID_DEFAULT_TEMPLATE: 'site task must have a valid default template',
    INVALID_FILES: 'site task must be provided one valid src directory and one valid dest directory',
  };
  
  var task = function () {
    
    //get options
    var options = this.options({
      templates: '.',
      defaultTemplate: 'default.html'
    });
    
    //require a valid templates directory
    if (false === grunt.file.isDir(options.templates)) {
      grunt.fail.fatal(ERROR.INVALID_TEMPLATE_DIR);
    }
    
    //require a valid default template
    if (false === grunt.file.isFile(options.templates, options.defaultTemplate)) {
      grunt.fail.fatal(ERROR.INVALID_DEFAULT_TEMPLATE);  
    }
    
    //require one valid src and one valid dest dir as a string
    if (
      this.files.length !== 1 || //one files entry
      this.files[0].src.length !== 1 || //with one src
      false === _.isString(this.files[0].dest) || //and one dest
      false === grunt.file.isDir(this.files[0].src[0]) //the src must be a directory
    ) {
      grunt.fail.fatal(ERROR.INVALID_FILES);
    }
    
    console.log('success!');
  
  };
  
  grunt.registerMultiTask(name, desc, task);
  
}