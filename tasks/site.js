
var _ = require('lodash');
var mm = require('marky-mark');
var path = require('path');
var moment = require('moment');

module.exports = function (grunt) {
  
  var name = 'site';
  
  var desc = 'The easiest way to create a website with grunt';
  
  var ERROR = {
    INVALID_FILES: 'site: invalid src or dest directory',
    INVALID_CONTENT_DIR: 'site: invalid content directory',
    INVALID_TEMPLATE_DIR: 'site: invalid templates directory',
    INVALID_ASSETS_DIR: 'site: invalid assets directory',
    INVALID_DEFAULT_TEMPLATE: 'site: invalid default template',
  };
  
  var task = function () {
    
    //= options ==============================================================//
    
    var options = this.options({
      site: {},
      content: 'content',
      assets: 'assets',
      templates: 'templates',
      defaultTemplate: 'default.html'
    });
    
    //= validation ===========================================================//
    
    //require one valid src and one valid dest dir as a string
    if (
      this.files.length !== 1 || //one files entry
      this.files[0].src.length !== 1 || //with one src
      typeof this.files[0].dest !== 'string' || //and one dest
      false === grunt.file.isDir(this.files[0].src[0]) //the src must be a directory
    ) {
      grunt.fail.fatal(ERROR.INVALID_FILES);
    }
    
    var baseDirectory = this.files[0].src[0];
    var destDirectory = this.files[0].dest;
    
    //require valid content directory
    if (false === grunt.file.isDir(path.join(baseDirectory, options.content))) {
      grunt.fail.fatal(ERROR.INVALID_CONTENT_DIR);
    }
    
    var contentDirectory = path.join(baseDirectory, options.content);
    
    //require valid templates directory
    if (false === grunt.file.isDir(path.join(baseDirectory, options.templates))) {
      grunt.fail.fatal(ERROR.INVALID_TEMPLATE_DIR);
    }
    
    var templateDirectory = path.join(baseDirectory, options.templates);
    
    //optionally require valid assets directory
    if (options.assets && false === grunt.file.isDir(path.join(baseDirectory, options.assets))) {
      grunt.fail.fatal(ERROR.INVALID_ASSETS_DIR);
    }
    
    var assetsDirectory = options.assets ? path.join(baseDirectory, options.assets) : false;
    
    //require a valid default template
    if (false === grunt.file.isFile(templateDirectory, options.defaultTemplate)) {
      grunt.fail.fatal(ERROR.INVALID_DEFAULT_TEMPLATE);  
    }
    
    var defaultTemplate = options.defaultTemplate;
    
    //= content ==============================================================//
    
    var documents = [];
    
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
    
    var contentAssetsPaths = grunt.file.expand({
      cwd: contentDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*', '!*.html', '!*.md');
    
    var assetsPaths = assetsDirectory ? grunt.file.expand({
      cwd: baseDirectory,
      filter: 'isFile'
    }, path.join(options.assets, '**/*')) : [];
    
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
        path.join(destDirectory, doc.dest), 
        partial(doc.template)
      );
    });
    
    //copy content assets
    _.each(contentAssetsPaths, function (asset) {
      grunt.file.copy(
        path.join(contentDirectory, asset),
        path.join(destDirectory, asset)
      );
    });
    
    //copy asset directory assets
    _.each(assetsPaths, function (asset) {
      grunt.file.copy(
        path.join(baseDirectory, asset),
        path.join(destDirectory, options.assets, asset)
      );
    });
    
  };
  
  grunt.registerMultiTask(name, desc, task);
  
}