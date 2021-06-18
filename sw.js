const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/pages/fallback.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap',
];

//cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name,size));
            }
        })
    })
}

self.addEventListener('install', (event) => {
    // console.log('Service worker installed');
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {
            console.log('cached!!')
            cache.addAll(assets);
        })
    )
    
})

self.addEventListener('activate', event => {
    // console.log('Service worker activated');
    event.waitUntil(
        caches.keys().then(keys =>{
            //  console.log(keys)
            return Promise.all(keys.filter(key => key !== staticCacheName && key !== dynamicCacheName)
            .map(key => caches.delete(key)))
        })
    )
});

self.addEventListener('fetch', event => {
    // console.log('fetch event: ', event);
    event.respondWith(
        caches.match(event.request)
            .then((cacheRes) => {
                return cacheRes || fetch(event.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(event.request.url,fetchRes.clone());
                        limitCacheSize(dynamicCacheName, 3);
                        return fetchRes;
                    })
                });
            }).catch(() => {
                if(event.request.url.indexOf('.html') > -1){
                    return caches.match('/pages/fallback.html')
                }
            })
    );
});