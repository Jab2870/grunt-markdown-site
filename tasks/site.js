
module.exports = function (grunt) {
  
  var name = 'site';
  
  var desc = 'The easiest way to create a website with markdown';
  
  var task = function () {
    
    console.log(this.files[0].src, this.files[0].dest, this.options());
    
  };
  
  grunt.registerMultiTask(name, desc, task);
  
}