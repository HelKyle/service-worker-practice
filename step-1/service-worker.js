var VERSION = 'service-worker-pratice-v1';
var files = [
    '/service-worker-practice/step-1/images/1.jpg',
    '/service-worker-practice/step-1/images/2.jpg',
    '/service-worker-practice/step-1/images/3.jpg',
    '/service-worker-practice/step-1/images/4.jpg',
    '/service-worker-practice/step-1/'
]

self.addEventListener('install', (event) => {
    function onInstall() {
        return caches.open(VERSION)
            .then(cache => {
                return cache.addAll(files);
            })
    }
    console.log('service worker install');
    console.log(event);

    event.waitUntil(onInstall(event));
});

self.addEventListener('fetch', event => {
    console.log('service worker fetching');
    console.log(event.request);
});


self.addEventListener('activate', (event) => {
    console.log('service worker install success');
    console.log(event);
})
