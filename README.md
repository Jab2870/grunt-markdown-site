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

All markdown documents inside the content directory will be parsed as
content and exported into the destination directory (in the same directory
structure as they are inside content) after passing through the template
provided in their front-matter (or the default template if none is provided).

##### The `templates` directory

All files inside the templates directory will be parsed and cached as templates
available via the partial function.

## Writing templates

Templates (inside the `templates` directory) are compiled using
[lodash templates](https://lodash.com/docs/#template).

Each template is provided the following scope:

```js
//All templates and partials have access to the following properties as globals and via the scope object
var scope = {
  _: _, //lodash utility library
  path: path, //nodejs stdlib path module
  moment: moment, //momenjs date and time module
  partial: function (template, scope)  //render a template using the passed or default scope (templates are relative to the templates directory)
  scope: scope, //reference to self
  //... : ... //All yaml-front-matter properties will be available here EG: title
  content: '...', //the HTML content of the document that is currently being rendered,
  document: document, //the currently rendering document (including all yaml-front-matter and the content property)
  documents: documents, //all site documents: in the same format as document. This is ideal for creating archives, navs, lists, etc
};
```

## Changelog

See CHANGELOG.md
