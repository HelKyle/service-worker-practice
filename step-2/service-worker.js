
var config = {
    version: 'service-worker-pratice-v2:1',
    staticCacheItems: [
        '/service-worker-practice/step-2/images/1.jpg',
        '/service-worker-practice/step-2/images/2.jpg',
        '/service-worker-practice/step-2/images/3.jpg',
        '/service-worker-practice/step-2/images/4.jpg',
        '/service-worker-practice/step-2/images/offline.svg',
        '/service-worker-practice/step-2/offline/',
        '/service-worker-practice/step-2/offline/index.html',
        '/service-worker-practice/step-2/index.html',
        '/service-worker-practice/step-2/'
    ],

    offlinePage: '/service-worker-practice/step-2/offline/index.html',
    offlineImage: '/service-worker-practice/step-2/images/offline.svg'
};

function addToCache(cacheKey, request, response) {
    if (response.ok) {
        // response 是 stream 对象 只能用一次
        // 复制一份 response ，一份给浏览器，一份给 Service Worker
        var copy = response.clone();
        caches.open(cacheKey).then(cache => {
            cache.put(request, copy);
        });
    }

    return response;
}

function fetchFromCache(event) {
    return caches.match(event.request).then(response => {
        if (!response) {
            throw Error(`${event.request.url} not found in cache`);
            return;
        }
        return response;
    })
}

function offlineResponse(resourceType, opts) {
    console.log('============');
    console.log(resourceType);
    if (resourceType === 'image') {
        return new Response(config.offlineImage, {
            header: {
                'Content-Type': 'image/svg'
            }
        })
    } else {
        return caches.match(config.offlinePage);
    }
}

self.addEventListener('install', (event) => {
    function onInstall() {
        return caches.open(config.version)
            .then(cache => {
                self.skipWaiting();
                return cache.addAll(config.staticCacheItems);
            })
    }
    console.log('service worker install');
    console.log(event);

    event.waitUntil(onInstall(event));
});

self.addEventListener('fetch', event => {

    console.log('service worker fetching');
    // console.log(event.request);
    if (shouldHandleFetch(event, config)) {
       onFetch(event, config);
    }

    function onFetch(event, opts) {
        var request = event.request;
        var acceptHeader = request.headers.get('Accept');
        var resourceType = 'static';
        var cacheKey;

        if (acceptHeader.indexOf('text/html') !== -1) {
          resourceType = 'content';
        } else if (acceptHeader.indexOf('image') !== -1) {
          resourceType = 'image';
        }

        cacheKey = resourceType;

        console.log('============1');
        console.log(resourceType);

        if (resourceType === 'content') {
          event.respondWith(
            fetch(request)
              .then(response => addToCache(cacheKey, request, response))
              .catch(() => fetchFromCache(event))
              .catch(() => offlineResponse(resourceType, opts))
          );
        } else {
          event.respondWith(
            fetchFromCache(event)
              .catch(() => fetch(request))
              .then(response => addToCache(cacheKey, request, response))
              .catch(() => offlineResponse(resourceType, opts))
          );
        }
    }


    function shouldHandleFetch(event, opts) {
        var request = event.request;
        var url = new URL(request.url);
        var criteria = {
                // matchesPathPattern: !!(opts.cachePathPattern.exec(url.pathname),
                isGETRequest: request.method === 'GET',
                isFromMyOrigin: url.origin === self.location.origin
        };
        var failingCriteria = Object.keys(criteria)
            .filter(criteriaKey => !criteria[criteriaKey]);
        return !failingCriteria.length;
    }
});


self.addEventListener('activate', (event) => {
    console.log('service worker install success');
    console.log(event);


    function onActivate (event, opts) {
      return caches.keys()
        .then(cacheKeys => {
          var oldCacheKeys = cacheKeys.filter(key =>
            key.indexOf(opts.version) !== 0
          );
          var deletePromises = oldCacheKeys.map(oldKey => caches.delete(oldKey));
          return Promise.all(deletePromises);
        });
    }

    onActivate(event, config);
})
