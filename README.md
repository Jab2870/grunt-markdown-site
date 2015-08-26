# grunt-site

The easiest way to create a website with grunt

## Changelog

### 0.2.0

* Change task options to accept a base site directory, required content and templates, and optional assets
* Change error messages to be site task specific by adding 'site: ' before them
* Add optionally provided assets to asset collection and copy them in the coorispinding destination

### 0.1.0

* Accept
  * A src directory (not files)
  * A dest directory (not files)
    * Options
      * A template directory
      * A default template
      * A site configuration object

* Parse
  * markdown and html files
    * passing each *.md to it's configured template (in YAML or options.defaultTemplate)
    * passing each *.md template access to it's coorisponding YAML, HTML content, and that of all other documents 
* Generate
  * dest/**/*.html
  * using lodash templates
* Copy
  * All non-markdown && non-html src/**/* files to dest/**/*