# grunt-site

The easiest way to create a website with grunt

## Overview

Using the `site` task, you can create a website using markdown from HTML templates

<table>
<thead>
<tr>
  <th style="text-align:left;vertical-align:top;">template.html</th>
  <th style="text-align:left;vertical-align:top;">post.md</th>
  <th style="text-align:left;vertical-align:top;">post.html</th>
</tr>
</thead>
<tbody>
<tr>
  <td style="text-align:left;vertical-align:top;"><pre>
&lt;DOCTYPE html&gt;<br/>&lt;html&gt;<br/>  &lt;head&gt;<br/>    &lt;title&gt;&lt;%= title %&gt;&lt;/title&gt;<br/>  &lt;/head&gt;<br/>  &lt;body&gt;<br/>    &lt;%= content %&gt;<br/>  &lt;/body&gt;<br/>&lt;/html&gt;
  </pre></td>
  <td style="text-align:left;vertical-align:top;"><pre><code>---
title: Post title
template: template.html
---
# Post heading
Post content
</code></pre></td>
  <td style="text-align:left;vertical-align:top;"><pre>
&lt;DOCTYPE html&gt;<br/>&lt;html&gt;<br/>  &lt;head&gt;<br/>    &lt;title&gt;Post title&lt;/title&gt;<br/>  &lt;/head&gt;<br/>  &lt;body&gt;<br/>    &lt;h1&gt;Post heading&lt;/h1&gt;<br/>    &lt;p&gt;Post content&lt;/p&gt;<br/>  &lt;/body&gt;<br/>&lt;/html&gt;
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
## The site task

```js
site: { //site task
  example: { //multi task name (EG: example)
    options: {
      content: 'content', //required, content directory, 'content' is default
      templates: 'templates', //required, templates directory, 'templates' is default
      defaultTemplate: 'default.html' //required, default template, 'default.html' is default
    },
    src: 'site', //required, base directory, there is no default
    dest: 'dest' //required, destination directory, there is no default
  }
}
```

Although it is possible to customize the location of your directories via the
site task options, it is recommended that you structure your grunt-site like this:

```
- dest //dest directory
- site //src directory
  - content //content directory
  - templates //templates directory
```

##### The `content` directory

All markdown and HTML documents inside the content directory will be parsed as
content and exported into the destination directory (in the same directory
structure as they are inside content) after passing through the template
provided in their front-matter (or the default template if none is provided).

All assets inside the content directory will be copied into the destination
directory (in the same directory structure as they are inside content).

##### The `templates` directory

All files inside the templates directory will be parsed and cached as templates
available via the partial function.

## Writing content

Content (inside the `content` direcotry) can be written in two formats:

* [Markdown](http://daringfireball.net/projects/markdown/) (.md) (using [marked](https://www.npmjs.com/package/marked))
* [HTML](http://www.w3.org/html/) (.html)

Both of these content types accept front-matter in two formats:

* [YAML](http://yaml.org/) (using [yaml-front-matter](https://www.npmjs.com/package/yaml-front-matter))
* [JSON](http://json.org/) (using [yaml-front-matter](https://www.npmjs.com/package/yaml-front-matter))

## Writing templates

Templates (inside the `templates` directory) are compiled using
[lodash templates](https://lodash.com/docs/#template).

Each template is provided the following scope:

```js
//each template has access to the following data from the current document
var document = {
  content: '<h1>Heading</h1><p>Content</p>' //the prased content of the document that is being rendered
  ... //all front-matter attributes are first-class citizens on the document. EG: document.title
};

//each template has access to the following api functions
var templateAPI = {
  _: _, //lodash utility library
  path: path, //nodejs stdlib path module
  moment: moment, //momenjs date and time module
  //render a template using the passed or default scope (templates are relatie to the templates directory)
  partial: function (template, scope)
  //loop only documents that exactly match the properties provided by the source parameter
  where: function (source, callback),
  //loop only documents that pass the filter function
  filter: function (predicate, callback)
};

//each template has access to the following global data structures
var globalScope = {
  site: options.site, //global attributes configured in the Gruntfile
  documents: documents, //all documents inside the content directory  
};

//each template has access to the previous three objects as it's scope while rendering
partial(template, scope [scope = _.extend(document, templateAPI, globalScope)])
```

## Contributing

I will review and potentially accept pull requests.

Here are some things I have in mind in the future

* Support other template engines
* Utility functions for templates
* Unit tests

## Changelog

See CHANGELOG.md