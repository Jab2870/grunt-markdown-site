# grunt-markdown-site

The easiest way to create a website with markdown

## Roadmap

### 1.0.0

* Accept
  * A src directory (not files)
  * A dest directory (not files)
    * Options
      * A template directory
      * A default template

* Parse
  * src/**/*.md
    * passing each *.md to it's configured template (in YAML or options.defaultTemplate)
    * passing each *.md template access to it's coorisponding *.md YAML, HTML content, and that of all other documents 
* Generate
  * dest/**/*.html
  * using underscore templates
* Copy
  * All non-markdown src/**/* files to dest/**/*