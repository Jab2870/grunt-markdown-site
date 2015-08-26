# grunt-site

The easiest way to create a website with grunt


## Overview

### Create a website with markdown using HTML templates

<table>
<tbody>
<tr>
  <td style="text-align:left;vertical-align:top;"><pre>
<strong>template.html</strong>

&lt;DOCTYPE html&gt;<br/>&lt;html&gt;<br/>  &lt;head&gt;<br/>    &lt;title&gt;&lt;%= title %&gt;&lt;/title&gt;<br/>  &lt;/head&gt;<br/>  &lt;body&gt;<br/>    &lt;%= content %&gt;<br/>  &lt;/body&gt;<br/>&lt;/html&gt;
  </pre></td>
  <td style="text-align:left;vertical-align:top;"><pre>
<strong>post.md</strong>

---
title: Post title
template: template.html
---

# Post heading

Post content
</pre></td>
  <td style="text-align:left;vertical-align:top;"><pre>
<strong>post.html</strong>

&lt;DOCTYPE html&gt;<br/>&lt;html&gt;<br/>  &lt;head&gt;<br/>    &lt;title&gt;Post title&lt;/title&gt;<br/>  &lt;/head&gt;<br/>  &lt;body&gt;<br/>    &lt;h1&gt;Post heading&lt;/h1&gt;<br/>    &lt;p&gt;Post content&lt;/p&gt;<br/>  &lt;/body&gt;<br/>&lt;/html&gt;
  </pre></td>
</tr>
</tbody>
</table>

### Create a website with HTML using HTML templates

<table>
<tbody>
<tr>
  <td style="text-align:left;vertical-align:top;"><pre>
<strong>page.html</strong>

&lt;% partial('header.html') %&gt;<br/>&lt;main&gt;<br/>  &lt;h1&gt;Page heading&lt;/h1&gt;<br/>  &lt;p&gt;Page content&lt;/p&gt;<br/>&lt;/main&gt;<br/>&lt;% partial('footer.html') %&gt;  </pre></td>

  <td style="text-align:left;vertical-align:top;"><pre>
<strong>header.html</strong>

&lt;DOCTYPE html&gt;<br/>&lt;html&gt;<br/>  &lt;head&gt;<br/>    &lt;title&gt;&lt;%= title %&gt;<br/>  &lt;/head&gt;<br/>  &lt;body&gt;

<strong>footer.html</strong> 

  &lt;/body&gt;<br/>&lt;/html&gt;
</pre></td>
  <td style="text-align:left;vertical-align:top;"><pre>
<strong>page.html</strong>

&lt;DOCTYPE html&gt;<br/>&lt;html&gt;<br/>  &lt;head&gt;<br/>    &lt;title&gt;Page title&lt;/title&gt;<br/>  &lt;/head&gt;<br/>  &lt;body&gt;<br/>    &lt;h1&gt;Post heading&lt;/h1&gt;<br/>    &lt;p&gt;Post content&lt;/p&gt;<br/>  &lt;/body&gt;<br/>&lt;/html&gt;
  </pre></td>
</tr>
</tbody>
</table>

## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-site --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-site');
```

## Basic project setup

<table>
<tbody>
  <tr>
    <td style="text-align:left;vertical-align:top;"><pre>
<strong>Gruntfile.js</strong>

module.exports = function(grunt) {
  grunt.initConfig({
    site: {
      example: {
        options: {
          site: { _//globals_
            url: 'http://localhost:8000',
          }
        },
        src: 'site',
        dest: 'dest'
      }
    }
  });
  grunt.loadNpmTasks('grunt-site');
};
    </pre></td>
    <td style="text-align:left;vertical-align:top;"><pre>
<strong>Directory structure</strong>
    
- site _//site name_
  - content _//content directory_
    - index.md _//index page_
    - category _//category name_
      - post-name _//post name_
        - index.md _//post_
        - Image.jpg _//post asset_
      - index.md _//archive_
    - page.html _//html page_
  - assets _//assets directory_
    - images
      - image1.jpg
  - templates _//template directory_
    - default.html
    </pre></td>
  </tr>
</tbody>
</table>

## Advanced project setup

### Gruntfile.js

```js
site: {
  example: {
    options: {
      content: 'content', //required, content directory, 'content' is default
      assets: 'assets', //optional, assets directory, 'assets' is default
      templates: 'templates', //required, templates directory, 'templates' is default
      defaultTemplate: 'default.html' //required, default template, 'default.html' is default
    },
    src: 'site', //required, base directory, there is no default
    dest: 'dest' //required, destination directory, there is no default
  }
}
```

### Directory structure

<dl>
<dt>src</dt>
<dd>The src directory is the base directory which contains the content, assets, and templates directories</dd>
<dt>dest</dt>
<dd>The dest directory is the output directory of the generated website</dd>
<dt>content</dt>
<dd>The content directory contains the static structure and content of the website</dd>
<dt>assets</dt>
<dd>The assets directory is an optional directory that will be exactly copied into the dest</dd>
<dt>templates</dt>
<dd>The templates directory contains all partials used in content and other templates.</dd>
</dl>

### Creating templates

Each content document (HTML or Markdown) has access to the following data

```js
{
   _: _, //lodash utility library
  //EG: _.each, _.has, ...
  path: path, //nodejs stdlib path module
  //EG: path.join, path.normalize, ...
  moment: moment, //momentjs utility library
  //EG: moment, moment.format, moment.diff, ...
  site: options.site, //global variables configured in Gruntfile.js
  //EG: site.title, site.url, site.description, ...
  documents: documents, //all content documents
  //EG: _.each(documents, function(document) { ... });
  partial: partial, //partial function for rendering other templates
  //EG: <%= partial('header.html') %>
  src: 'path/to/file.md', //path to src file
  //EG: <%= src %>
  dest: 'path/to/dest.html', //path to dest file (relative to content directory)
  //EG: <a href="<%= site.url %>/<%= dest %>"><%= title %></a>
  content: '...', //the HTML content of the content document that coorisponds to this template
  //EG: <main><%= content %></main>, ...
  ...: ... //all YAML front matter from the document that coorisponds to this template
  //EG: <h1><%= title %></h1>, <% if (category === 'example') { %>, ...
}
```

## Contributing

I will review and potentially accept pull requests.

Here are some things I have in mind in the future

* Support other template engines
* Utility functions for templates
* Unit tests
* A gulp task equivilant 
* A standalone binary

## Changelog

### 1.0.0

* Write basic documentation

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
  * dest/\*\*/*.html
  * using lodash templates
* Copy
  * All non-markdown && non-html src/\*\*/* files to dest/\**/*