
var _ = require('lodash');
var path = require('path');
var marked = require('marked');
var frontMatter = require('yaml-front-matter');
var moment = require('moment');

module.exports = function (grunt) {

  var name = 'site';

  var desc = 'The easiest way to create a website with grunt';

  var ERROR = {
    INVALID_FILES: 'site: invalid src or dest directory',
    INVALID_CONTENT_DIR: 'site: invalid content directory',
    INVALID_TEMPLATE_DIR: 'site: invalid templates directory',
    INVALID_DEFAULT_TEMPLATE: 'site: invalid default template',
  };

  var task = function () {

    //= options ==============================================================//

    var options = this.options({
      site: {},
      content: 'content',
      templates: 'templates',
      defaultTemplate: 'default.html'
    });

    var site = options.site;

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

    //require a valid default template
    if (false === grunt.file.isFile(templateDirectory, options.defaultTemplate)) {
      grunt.fail.fatal(ERROR.INVALID_DEFAULT_TEMPLATE);
    }

    var defaultTemplate = options.defaultTemplate;

    //= paths ================================================================//

    var documentPaths = grunt.file.expand({
      cwd: contentDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*.md');

    var templatePaths = grunt.file.expand({
      cwd: templateDirectory,
      filter: 'isFile',
      matchBase: true
    }, '*');

    //= documents ============================================================//

    var documents = [];

    _.each(documentPaths, function (documentPath) {
      try {
        var document = frontMatter.loadFront(
          grunt.file.read(
            path.join(contentDirectory, documentPath)
          ), 'content'
        );
        //if the document is a markdown document
        if (documentPath.split('.').pop() === 'md') {
          //convert the markdown content into html content
          document.content = marked(document.content);
        }
        //set document src so that we can reference it while debugging
        document.src = documentPath;
        //set the document's exported destination based on the documentPath
        //note that .html files will just remain .html files.
        document.dest = documentPath.replace('.md', '.html');
        //set template to default template if none is provided
        document.template = document.template || defaultTemplate;
        documents.push(document);
      } catch (err) {
        grunt.fail.fatal(err + ' in ' + documentPath);
      }
    });

    //= templates ============================================================//

    var templates = {};

    _.each(templatePaths, function (templatePath) {
      try {
        templates[templatePath] = _.template(
          grunt.file.read(
            path.join(templateDirectory, templatePath)
          )
        );
      } catch (err) {
        grunt.fail.fatal(err + ' in ' + templatePath);
      }
    });

    //= partials =============================================================//

    var partial = function (template, _scope) {
      try {
        return templates[template](_scope || scope.scope);
      } catch (err) {
        grunt.fail.fatal(err + ' in ' + template + ' from ' + scope.document.src);
      }
    };

    var scope = {
      _: _,
      path: path,
      moment: moment,
      site: site,
      documents: documents,
      partial: partial
    };

    //= output ===============================================================//

    _.each(documents, function (document) {
      scope.document = document;
      scope.scope = _.extend({}, document, scope);
      grunt.file.write(
        path.join(destDirectory, document.dest),
        partial(document.template, _.extend({}, document, scope))
      );
    });

  };

  grunt.registerMultiTask(name, desc, task);

};
