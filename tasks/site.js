
var _ = require('lodash');
var path = require('path');
var marked = require('marked');
var frontMatter = require('yaml-front-matter');

module.exports = function (grunt) {

  /** task name */
  var name = 'site';

  /** task description */
  var desc = 'The easiest way to create a website with grunt';

  /** task callback */
  var task = function () {

    //grunt task options
    var options = this.options({
      site: {},
      extend: {},
      marked: {},
      templates: 'templates',
      defaultTemplate: 'default.html'
    });

    //is the site option valid?
    if (false === _.isObject(options.site)) {
      grunt.fail.fatal('site: invalid site option');
    } else {
      grunt.verbose.ok('site: valid site option');
    }

    //is the extend option valid?
    if (false === _.isObject(options.extend)) {
      grunt.fail.fatal('site: invalid extend option');
    } else {
      grunt.verbose.ok('site: valid extend option');
    }

    //is the marked option valid?
    if (false === _.isObject(options.marked)) {
      grunt.fail.fatal('site: invalid marked option');
    } else {
      grunt.verbose.ok('site: valid marked option');
    }

    //setting marked options
    marked.setOptions(options.marked);

    //is the files entry valid?
    if (
      false === _.isArray(this.files) || //is there a files array?
      1 !== this.files.length //is the files array valid?
    ) {
      grunt.fail.fatal('site: invalid files entry');
    } else {
      grunt.verbose.ok('site: valid files entry');
    }

    if ( //is the src directory valid?
      false === _.isArray(this.files[0].src) || //is there a src array?
      1 !== this.files[0].src.length || //is there one src entry?
      true !== grunt.file.isDir(this.files[0].src[0]) //is the src entry valid?
    ) {
      grunt.fail.fatal('site: invalid src directory');
    } else {
      grunt.verbose.ok('site: valid src directory');
    }

    var srcDir = this.files[0].src[0];

    if (//is the dest directory valid?
      true !== _.isString(this.files[0].dest) //is there one dest entry?
    ) {
      grunt.fail.fatal('site: invalid dest directory');
    } else {
      grunt.verbose.ok('site: valid dest directory');
    }

    var destDir = this.files[0].dest;

    //is the templates dir valid?
    if (false === grunt.file.isDir(options.templates)) {
      grunt.fail.fatal('site: invalid template directory');
    } else {
      grunt.verbose.ok('site: valid template directory');
    }

    var templateDir = options.templates;

    //is the default template valid?
    if (false === grunt.file.isFile(path.join(templateDir, options.defaultTemplate))) {
      grunt.fail.fatal('site: invalid default template');
    } else {
      grunt.verbose.ok('site: valid default template');
    }

    var defaultTemplate = options.defaultTemplate;

    //expand src documents
    var docPaths = grunt.file.expand({
      cwd: srcDir,
      filter: 'isFile',
      matchBase: true
    }, '*.md');

    grunt.verbose.ok('site: ' + docPaths.length + ' document paths expanded');

    //expand template dir if set
    var templatePaths = grunt.file.expand({
      cwd: templateDir,
      filter: 'isFile',
      matchBase: true
    }, '*');

    grunt.verbose.ok('site: ' + templatePaths.length + ' template paths expanded');

    var docs = [];

    var loadDoc = function(src) {
      try {
        //parse frontmatter and load content into doc.content
        var doc = frontMatter.loadFront(
          grunt.file.read(path.join(srcDir, src)),
          'content'
        );
        //parse content with marked
        doc.content = marked(doc.content);
        doc.src = src;
        doc.dest = src.replace('.md', '.html');
        doc.template = doc.template || defaultTemplate;
        docs.push(doc);
        grunt.verbose.ok('site: ' + src + ' document loaded');
      } catch (err) {
        grunt.fail.warn('site: ' + err + ' in ' + src);
      }
    };

    var templates = {};

    var loadTemplate = function (src) {
      if (false === _.has(templates, src)) {
        try { //try to load template (compile with lodash)
          templates[src] = _.template(grunt.file.read(path.join(templateDir, src)));
          grunt.verbose.ok('site: ' + src + ' template loaded');
        } catch (err) {
          grunt.fail.warn('site: ' + err + ' in ' + src);
        }
      }
    };

    /**
     * Render a template (document or inline)
     * @param {String} template - key inside templates collection
     * @param {Object} _scope - optional custom scope for template
     */
    var partial = function (template, _scope) {
      var partialScope = _.extend({}, scope, _scope || {});
      try {
        return templates[template](partialScope);
      } catch (err) {
        grunt.fail.warn(err + ' in ' + template + ' from ' + partialScope.doc.src);
      }
    };

    var scope = {
      _: _,
      path: path,
      site: options.site,
      docs: docs,
      partial: partial
    };

    //is the extending scope valid?
    if (false === _.isObject(options.extend)) {
      grunt.fail.fatal('site: error extending scope');
    } else {
      _.extend(scope, options.extend);
      grunt.verbose.ok('site: successfully extended scope');
    }

    var exportDoc = function (doc) {
      if (typeof doc.title === 'undefined' || doc.exclude === true) return;
      try {
        scope.doc = doc;
        grunt.file.write(
          path.join(destDir, doc.dest),
          partial(doc.template, doc)
        );
        grunt.verbose.ok('site: ' + doc.src + ' document exported');
      } catch (err) {
        grunt.fail.warn(err, + ' in ' + doc.src);
      }
    };

    _.each(docPaths, loadDoc);
    grunt.verbose.ok('site: finished loading documents.');
    _.each(templatePaths, loadTemplate);
    grunt.verbose.ok('site: finished loading templates.');
    _.each(docs, exportDoc);
    grunt.verbose.ok('site: finished exporting documents.');

  };

  grunt.registerMultiTask(name, desc, task);

};
