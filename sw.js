// Crescendo Snake — offline/install service worker.
// Network-first so new pushes land immediately; cache fallback for offline play.
const CACHE='crescendo-v1';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon-512.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // never cache leaderboard traffic — always live
  if(e.request.url.includes('firestore.googleapis.com'))return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const cl=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cl)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html')))
  );
});
