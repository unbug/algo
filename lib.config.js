'use strict';

// lib js
exports.js = [
  './node_modules/react/umd/react.production.min.js',
  './node_modules/react-dom/umd/react-dom.production.min.js',
  './node_modules/d3/dist/d3.min.js',
  './node_modules/nprogress/nprogress.js',
  './node_modules/smoothscroll-polyfill/dist/smoothscroll.js', // http://iamdustan.com/smoothscroll/
];

// lib css
exports.css = [
  './node_modules/semantic-ui-css/semantic.min.css',
  './node_modules/nprogress/nprogress.css',
  './node_modules/animate.css/animate.min.css'
];

// extra files
exports.extra = [{
  'css/themes': './node_modules/semantic-ui-css/themes/**'
}];

// configs for service worker, get request only, not in "included" url won't be cached
exports.serviceWorker = {
  included: [ // cache then network, url must start with it's host
    '"fonts.googleapis.com"',
    '"fonts.gstatic.com"',
    '"github.hulu.com"',
  ],
  networkOnly: [ // network falling back to cache, url|path|etc must included in "included"
  ],
  cacheOnly: [ // cache fallback to network, url|path|etc must included in "included"
  ],
  excluded: [ // won't be cache, url|path|etc must included in "included"
  ]
}
