var _ = require('lodash');
var path = require('path');
var exec = require('child_process').execSync;
//var marked = require('marked');
//var pandoc = require('node-pandoc');
//var pandoc = require('../modifiedModules/node-pandoc/');
var frontMatter = require('yaml-front-matter');

module.exports = function (grunt) {

	/** task name */
	var name = 'site';

	/** task description */
	var desc = 'The easiest way to create a website with grunt and pandoc';

	/** task callback */
	var task = function () {

		//grunt task options
		var options = this.options({
			//This is an object of site-wide of properties that will be part of the scope in the templates
			site: {},
			extend: {},
			marked: {},
			pandoc: '-f markdown -t html5',
			templates: 'templates',
			defaultTemplate: 'default',
			extention: 'html',
			path: "directory", //Options are path or directory.
			autoArchives: true //weather or not to automatically generate archive pages
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
		//if (false === _.isObject(options.marked)) {
		//	grunt.fail.fatal('site: invalid marked option');
		//} else {
		//	grunt.verbose.ok('site: valid marked option');
		//}

		// Checks that the pandoc string is a string and doesn't try to specify an output file
		if (false === _.isString(options.pandoc)) {
			grunt.fail.fatal('site: invalid pandoc option');
		} else if ( -1 !== options.pandoc.indexOf("-o") ){
			grunt.fail.fatal('site: you can\'t give an output file as on option to pandoc when using it with site generator');
		} else {
			grunt.verbose.ok('site: valid pandoc option');
		}

		//is the path variable valid
		// Directory:	The file blog/post1.md will produce the url blog/post1/
		// Path:		The file blog/post1.md will produce the url blog/post1.html
		//
		// There is curretly no error checking here. There is the potential for errors with a directory like the following
		//
		// -
		// |- blog.md
		// |- blog/
		// |    |- index.md
		//
		// In this example, both files will try to write to the file /blog/index.html
		// For this reason, it is recomended that you don't give files the same name as a directory in the same parent directory
		if (false === _.isString(options.path)) {
			grunt.fail.fatal('site: invalid path option');
		} else {
			var validOptions = ['path','directory'];
			if( -1 === validOptions.indexOf(options.path.toLowerCase()) ){
				grunt.fail.fatal('site: invalid path option. Valid options are "directory" and "path" ');
			} else {
				grunt.verbose.ok('site: valid pandoc option');
			}
		}

		var pathStyle = options.path.toLowerCase();



		//setting marked options
		//marked.setOptions(options.marked);

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
		if (false === grunt.file.isFile(path.join(templateDir, options.defaultTemplate + "." + options.extention ))) {
			grunt.fail.fatal('site: invalid default template');
		} else {
			grunt.verbose.ok('site: valid default template');
		}

		var defaultTemplate = options.defaultTemplate + "." + options.extention;

		//expand src documents
		var docPaths = grunt.file.expand({
			cwd: srcDir,
			filter: 'isFile',
			matchBase: true
		}, '*.md');
		/* I will want to add more file extentions here eventually!!!! */

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
				var pandocOutput;
				//parse frontmatter and load content into doc.content
				/* frontMatter is used to parse the yaml block at the begining and adds the contents after the yaml block to the object with a key: 'content' */
				var doc = frontMatter.loadFront(
					grunt.file.read(path.join(srcDir, src)),
					'content'
				);
				//parse content with marked
				//doc.content = marked(doc.content);
				var command = "pandoc " + options.pandoc;
				doc.content = exec(command, {input: doc.content}).toString();

				doc.src = src;
				if( 'path' === pathStyle ){
					doc.dest = src.replace('.md', '.' + options.extention);
				} else { // The only other option is directory
					if ( /index\.md$/.test(src) ){
						//If the file is index.md, the file will be index.html in the same folder
						doc.dest = src.replace('.md', '.' + options.extention);
					} else {
						//If the file isn't index.md, the resultant file should be index.html in a folder with the name of the file
						doc.dest = src.replace('.md', '/index.' + options.extention );
					}
				}
				doc.url = "/" + doc.dest.replace('index.' + options.extention,'');
				doc.template = doc.template || defaultTemplate;
				docs.push(doc);
				grunt.verbose.ok('site: ' + src + ' document loaded');
			} catch (err) {
				grunt.fail.warn('site: ' + err + ' in ' + src);
			}
		};
		
		/** 
		 * This function takes each doc and assembels a hierarchy
		 *
		 * Because the docs array feeding this function is sorted, parent pages are guarenteed to be fed into this function before child pages
		 */
		var createHierarchy = function(){
			docs = _.sortBy(docs,function(d){ return d.url.split("/").length; }); //Sort docs so the higher pages come first
			if ( "/" !== docs[0].url ){
				grunt.fail.fatal("You don't have a homepage. Create an index.md in the root of the content folder");
			}
			for (var i = 1; i < docs.length; i++){ // intentionally missing the first (homepage)
				var doc = docs[i];
				var parts = doc.url.split("/");
				var parentDoc = docs[0];
				while( "" === parts[parts.length - 1] ){
					parts.pop();
				}
				while( "" === parts[0] ){
					parts.shift();
				}
				for (var j = 0; j < parts.length; j++){
					parentDoc.childPages = parentDoc.childPages || {};
					if(parts.length - 1 === j){
						// This is the end of the path. This should be a new file
						if ( undefined !== parentDoc.childPages[parts[j]]){
							// If it isn't a new file
							grunt.fail.fatal("There are two files that are trying to be put in " + doc.url);
						}
						parentDoc.childPages[parts[j]] = doc;
						doc.parentPage = parentDoc;
					} else {
						if ( undefined === parentDoc.childPages[parts[j]]){
							//If there is a new page that isn't at the end
							parentDoc.childPages[parts[j]] = {
								type: "archive",
								title: "Archive: " + parts[j],
								childPages: {},
								parentPage: parentDoc,
								url: parentDoc.url + parts[j] + "/",
								dest: parentDoc.url + parts[j] + "/index.html",
								template: defaultTemplate,
								content: "",
								exclude: !options.autoArchives

							};
							docs.splice(i,0,parentDoc.childPages[parts[j]]);

						} else {
							parentDoc = parentDoc.childPages[parts[j]];
						}
					}
				}
				
			}
		};

		var templates = {};

		var loadTemplate = function (src) {
			if (false === _.has(templates, src)) {
				try { //try to load template (compile with lodash)
					var re = new RegExp("\." + options.extention + "$");
					var key = src.replace(re,"");
					templates[key] = _.template(grunt.file.read(path.join(templateDir, src)));
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
				var re = new RegExp("\." + options.extention + "$");
				template = template.replace(re,"");
				if( undefined === templates[template] ){
					grunt.verbose.ok( "Template '" + template + "' not found, using the default: '" + defaultTemplate + "' instead");
					template = defaultTemplate.replace(re,"");
				}
				return templates[template](partialScope);
			} catch (err) {
				if (typeof templates[template] === 'undefined') {
					grunt.fail.warn('site: missing "' + template + '" template in ' + partialScope.doc.src);
				} else {
					grunt.fail.warn('site: ' + err + ' in ' + template + ' from ' + partialScope.doc.src);
				}
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
				grunt.fail.warn('site: ' + err, + ' in ' + doc.src);
			}
		};

		_.each(docPaths, loadDoc);
		grunt.verbose.ok('site: finished loading documents.');
		createHierarchy();
		grunt.verbose.ok('site: finished creating hierarchy.');
		_.each(templatePaths, loadTemplate);
		grunt.verbose.ok('site: finished loading templates.');
		_.each(docs, exportDoc);
		grunt.verbose.ok('site: finished exporting documents.');

	};

	grunt.registerMultiTask(name, desc, task);

};
