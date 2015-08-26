
var _ = require('lodash');
var mm = require('marky-mark');
var path = require('path');
var moment = require('moment');

module.exports = function (grunt) {
  
  var name = 'site';
  
  var desc = 'The easiest way to create a website with markdown';
  
  var ERROR = {
    INVALID_TEMPLATE_DIR: 'site task must have a valid templates directory',
    INVALID_DEFAULT_TEMPLATE: 'site task must have a valid default template',
    INVALID_FILES: 'site task must be provided one valid src directory and one valid dest directory'
  };
  
  var task = function () {
    
    //= options ==============================================================//
    
    var options = this.options({
      site: {},
      templates: 'templates',
      defaultTemplate: 'default.html'
    });
    
    //= validation ===========================================================//
    
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
      typeof this.files[0].dest !== 'string' || //and one dest
      false === grunt.file.isDir(this.files[0].src[0]) //the src must be a directory
    ) {
      grunt.fail.fatal(ERROR.INVALID_FILES);
    }
    
    //= sugar ================================================================//
    
    var defaultTemplate = options.defaultTemplate;
    var templateDirectory = options.templates;
    var contentDirectory = this.files[0].src[0];
    var destinationDirectory = this.files[0].dest;
    var documents = [];
    
    //= content ==============================================================//
    
    var markdownPaths = grunt.file.expand({
      cwd: contentDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*.md');
    
    var htmlPaths = grunt.file.expand({
      cwd: contentDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*.html');
    
    var assetPaths = grunt.file.expand({
      cwd: contentDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*', '!*.html', '!*.md');
    
    var templatePaths = grunt.file.expand({
      cwd: templateDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*.html');
    
    //= templates ============================================================//
    
    var templates = {};
    
    //cache templates
    _.each(templatePaths, function (templatePath) {
      try {
        templates[templatePath] = _.template(
          grunt.file.read(
            path.join(templateDirectory, templatePath)  
          )  
        )
      } catch (err) {
        grunt.fail.fatal(err + ' in ' + templatePath);
      }
    });
    
    //cache html as templates (fully qualified to avoid name conflicts)
    _.each(htmlPaths, function (htmlPath) {
      try {
        templates[path.join(contentDirectory, htmlPath)] = _.template(
          grunt.file.read(
            path.join(contentDirectory, htmlPath)  
          )  
        );
      } catch (err) {
        grunt.fail.fatal(err + ' in ' + htmlPath);
      }
    });
    
    //= partials =============================================================//
    
    var partial = function (src) {
      try {
        return templates[src](scope);
      } catch (err) {
        grunt.fail.fatal(err + ' in ' + src);
      }
    };
    
    var scope = {
      _: _,
      path: path,
      moment: moment,
      site: options.site,
      documents: documents,
      partial: partial
    };
    
    //= datastructure ========================================================//
    
    var markdown = mm.parseFilesSync(
      //because markdownPaths are relative to the contentDirectory
      markdownPaths.map(function (relativePath) {
        return path.join(contentDirectory, relativePath);
      })
    );
    
    //extend documents with markdown
    _.each(markdown, function (doc, index) {
      var meta = doc.meta;
      delete doc.meta
      documents.push(_.extend(meta, scope, doc, {
        template: typeof meta.template === 'string' ? meta.template : defaultTemplate,
        src: markdownPaths[index],
        dest: markdownPaths[index].replace('.md', '.html'),
      }));
    });

    //extend documents with html
    _.each(htmlPaths, function (htmlPath, index) {
      documents.push(_.extend({
        //fully qualified template path to avoid name conflicts
        template: path.join(contentDirectory, htmlPath),
        src: htmlPath,
        dest: htmlPath
      }, scope));
    });
    
    //= output ===============================================================//
    
    //output documents
    _.each(documents, function (doc) {
      scope = doc;
      grunt.file.write(
        path.join(destinationDirectory, doc.dest), 
        partial(doc.template)
      );
    });
    
    //copy assets
    _.each(assetPaths, function (asset) {
      grunt.file.copy(
        path.join(contentDirectory, asset),
        path.join(destinationDirectory, asset)
      );
    });
    
  };
  
  grunt.registerMultiTask(name, desc, task);
  
}