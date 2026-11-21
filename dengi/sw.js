const V='dengi-v4';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(f);return c.put(f,r)})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function page(req,c){
  const key='./';
  const net=fetch(req.url,{cache:'no-cache'}).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r});
  try{const r=await Promise.race([net,new Promise(res=>setTimeout(res,2500,null))]);if(r&&r.ok)return r}catch(err){}
  return (await c.match(key))||net;
}
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    if(e.request.mode==='navigate'||u.pathname.endsWith('/index.html'))return page(e.request,c);
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(u.href,{cache:'no-cache'}).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
