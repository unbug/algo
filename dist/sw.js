function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}var CACHE_VERSION="2019-05-04T02:59:16.595Z",CURRENT_CACHES={prefetch:"prefetch-cache-v"+CACHE_VERSION},INCLUDED=["fonts.googleapis.com","fonts.gstatic.com","github.com","github.io","user-images.githubusercontent.com"],CACHE_ONLY=[],NETWORK_ONLY=[],EXCLUDED=[];function matchLocation(a,b){return b.find(function(b){return-1!==a.indexOf(b)})}self.addEventListener("install",function(a){self.skipWaiting();var b=Date.now(),c=["./","css/app.ac02266e.css","css/app.css","css/lib.45a8e145.css","css/lib.css","images/example.8d5f5e68.png","images/example.png","js/app.2bda3160.js","js/app.js","js/lib.1c0d1df0.js","js/lib.js","mocks/algo.json","css/themes/default/assets/images/flags.png","css/themes/default/assets/fonts/brand-icons.eot","css/themes/default/assets/fonts/brand-icons.svg","css/themes/default/assets/fonts/brand-icons.ttf","css/themes/default/assets/fonts/brand-icons.woff","css/themes/default/assets/fonts/brand-icons.woff2","css/themes/default/assets/fonts/icons.eot","css/themes/default/assets/fonts/icons.otf","css/themes/default/assets/fonts/icons.svg","css/themes/default/assets/fonts/icons.ttf","css/themes/default/assets/fonts/icons.woff","css/themes/default/assets/fonts/icons.woff2","css/themes/default/assets/fonts/outline-icons.eot","css/themes/default/assets/fonts/outline-icons.svg","css/themes/default/assets/fonts/outline-icons.ttf","css/themes/default/assets/fonts/outline-icons.woff","css/themes/default/assets/fonts/outline-icons.woff2"];console.log("Handling install event. Resources to prefetch:",c),a.waitUntil(caches.open(CURRENT_CACHES.prefetch).then(function(a){var d=c.map(function(c){var d=new URL(c,location.href);d.search+=(d.search?"&":"?")+"cache-bust="+b;var e=new Request(d,{mode:"no-cors"});return fetch(e).then(function(b){if(400<=b.status)throw new Error("request for "+c+" failed with status "+b.statusText);return a.put(c,b)})["catch"](function(a){console.error("Not caching "+c+" due to "+a)})});return Promise.all(d).then(function(){console.log("Pre-fetching complete.")})})["catch"](function(a){console.error("Pre-fetching failed:",a)}))}),self.addEventListener("activate",function(a){var b=Object.keys(CURRENT_CACHES).map(function(a){return CURRENT_CACHES[a]});a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(-1===b.indexOf(a))return console.log("Deleting out of date cache:",a),caches["delete"](a)}))}))}),self.addEventListener("fetch",function(a){console.log("Handling fetch event for",a.request.url);var b=new URL(a.request.url);"navigate"===a.request.mode?(console.log("request mode:",a.request.mode),a.respondWith(_asyncToGenerator(regeneratorRuntime.mark(function c(){var d,e,f;return regeneratorRuntime.wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return d=b,d.search="",e=fetch(d),f=e.then(function(a){return a.clone()}),a.waitUntil(_asyncToGenerator(regeneratorRuntime.mark(function a(){var b;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,caches.open(CURRENT_CACHES.prefetch);case 2:return b=a.sent,a.t0=b,a.t1=d,a.next=7,f;case 7:return a.t2=a.sent,a.next=10,a.t0.put.call(a.t0,a.t1,a.t2);case 10:case"end":return a.stop();}},a)}))()),c.next=7,caches.match(d);case 7:if(c.t0=c.sent,c.t0){c.next=10;break}c.t0=e;case 10:return c.abrupt("return",c.t0);case 11:case"end":return c.stop();}},c)}))())):matchLocation(b.href,INCLUDED)&&!matchLocation(b.href,EXCLUDED)&&/get/i.test(a.request.method)?matchLocation(b.href,NETWORK_ONLY)?(console.log("network-falling-back-to-caches:",a.request.url),a.respondWith(caches.open(CURRENT_CACHES.prefetch).then(function(b){return fetch(a.request).then(function(c){return b.put(a.request,c.clone()),c})["catch"](function(){return b.match(a.request).then(function(a){return a})})}))):matchLocation(b.href,CACHE_ONLY)?(console.log("cache-falling-back-to-network:",a.request.url),a.respondWith(caches.open(CURRENT_CACHES.prefetch).then(function(b){return b.match(a.request).then(function(c){return c||fetch(a.request).then(function(c){return b.put(a.request,c.clone()),c})})}))):(console.log("cache-then-network:",a.request.url),a.respondWith(caches.open(CURRENT_CACHES.prefetch).then(function(b){return b.match(a.request).then(function(c){var d=fetch(a.request).then(function(c){return b.put(a.request,c.clone()),c});return c||d})}))):b.origin==location.origin&&(console.log("request origin:",b.origin),a.respondWith(caches.match(a.request).then(function(b){return b?(console.log("Found response in cache:",b),b):(console.log("No response found in cache. About to fetch from network..."),fetch(a.request).then(function(a){return console.log("Response from network is:",a),a})["catch"](function(a){throw console.error("Fetching failed:",a),a}))})))}),"storage"in navigator&&"estimate"in navigator.storage&&navigator.storage.estimate().then(function(a){console.log("Using ".concat(a.usage," out of ").concat(a.quota," bytes."))});