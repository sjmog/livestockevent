# Foundation Base Boilerplate [![Build Status](https://travis-ci.org/toddmotto/fireshell.png)](https://travis-ci.org/toddmotto/fireshell)

Based on the Fireshell boilerplate framework, but augmented with Zurb Foundation. Variables are now in the src/scss/vendor/foundation/_variables.scss file, and overrides are in the src/scss file itself.

Any conflicting normalizers have been commented out of the import.

##I want to run a dynamic website (e.g. using PHP)

The Gruntfile will compile your SCSS files to a single CSS one (saving on HTTP requests). It'll also minify and concat stuff, so you're ready for production.
The build-in Grunt server doesn't play nice with PHP files, so you'll have to link your existing local server (MAMP, XAMP etc.) into the app/ directory to get going.
If you're using static files, you can rename index.php to index.html, and use the built-in Fireshell .command scripts.

##What's next?

I'll be working on getting LiveReload going with dynamic servers (at current it's injected into the HTML, so this isn't a big fix). After that, I'll work on more generally integrating this frontend boilerplate with the Laravel 4 framework and some sort of CMS. Any help would be much appreciated:

Fork it.
Change it.
Checkout.
Pull request.

Boom.

##Fireshell docs

Fiercely quick front-end boilerplate and workflows.

The opinionated FireShell framework. Built for the modern developer. For teams and the individual, encouraging a better workflow. JavaScript task running, build processes, autominification and file concatenation, wrapped with an enhanced HTML5 boilerplated framework.

* Source: [github.com/toddmotto/fireshell](http://github.com/toddmotto/fireshell)
* Homepage: [getfireshell.com](http://getfireshell.com)
* Twitter: [@getfireshell](http://twitter.com/getfireshell)

## Jump start

Get started with FireShell:

1. Download the latest stable release from
   [getfireshell.com](http://getfireshell.com).
2. Clone the git repo — `git clone
   https://github.com/toddmotto/fireshell.git`

## Documentation

View the developer documentation on FireShell for further reading and learning.

## Features

Here are some of the main features of FireShell:

* HTML5 framework, WAI-ARIA roles and HTML5 semantics
* Baseline HTML5 features, DNS prefetching, responsive meta
* Encourages one-file CSS/JS in the view (HTML) for performance
* Includes jQuery CDN and relative fallback
* Includes Modernizr and HTML5 Shiv
* Google Universal Analytics snippet
* Open source workflow with Grunt.js running on Node.js
* A grunt.command file for double-click command-line execution
* Automatic Grunt dependency installation, directory relocation and grunt tasks
* Dynamically appended copyright for JS/CSS
* Livereloading the browser and file injection upon changes
* Annotated Gruntfile.js for extending
* Built-in build script for auto-minification of CSS and JavaScript files for production
* Pre-setup Sass/SCSS files and folders for baseline project structure and imports
* Includes .editorconfig for consistent coding styles in IDEs
* Standard .gitignore to ignore minified files and standard ignorables such as .DS_Store
* JSHint .jshintrc file for configuring JavaScript linting
* No superfluous code comments
* Extremely lightweight footprint

## Scaffolding

````
├── app
│   ├── css
│   ├── fonts
│   ├── img
│   ├── js
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── js
│   │   └── scripts.js
│   └── scss
│       ├── mixins
│       ├── modules
│       ├── partials
│       ├── vendor
│       └── style.scss
├── docs
├── grunt-build.command
├── grunt-dev.command
├── package.json
├── README.md
├── .editorconfig
├── .gitignore
├── .jshintrc
└── .travis.yml
````

## License

Copyright (c) FireShell

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
