/* Poster page: options panel, buy link and 3D view (three.js r128 + OrbitControls). */
(function(){
const {C,TITLE,BODY,POSTERS,SIZES,FRAMES,art,ready:fontsReady}=Berns;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const poster=POSTERS.find(p=>p.id===document.body.dataset.poster)||POSTERS[0];
const state={poster,size:SIZES[1],frame:FRAMES[2],mode:'room'};

/* ---------- Options panel + buy link ---------- */
function optButtons(el,list,key,swatch){
  el.innerHTML='';list.forEach(o=>{const b=document.createElement('button');b.type='button';b.className='opt-btn';b.id=key+'-'+o.id;
    b.innerHTML=(swatch?`<span class="sw" style="background:${o.sw}"></span>`:'')+o.label;
    b.addEventListener('click',()=>{state[key]=o;syncPanel();rebuild(key==='size')});el.appendChild(b)});
}
function syncPanel(){
  const p=state.poster;
  document.getElementById('p-ed').textContent='No. '+p.no+' · Edition of 50';
  const total=state.size.price+(state.frame.id==='none'?0:state.size.frame);
  document.getElementById('p-price').textContent='£'+total;
  document.querySelectorAll('#o-size .opt-btn').forEach(b=>b.setAttribute('aria-pressed',b.id==='size-'+state.size.id));
  document.querySelectorAll('#o-frame .opt-btn').forEach(b=>b.setAttribute('aria-pressed',b.id==='frame-'+state.frame.id));
  const key=[p.id,state.size.id,state.frame.id].join(':');
  const link=(window.BERNS_LINKS||{})[key];
  const buy=document.getElementById('buy'),note=document.getElementById('buy-note');
  if(link){buy.href=link;buy.textContent='Buy now';note.textContent='Secure checkout with Stripe.'}
  else{
    const subject=encodeURIComponent('Poster: '+p.name+', '+state.size.label+', '+state.frame.label.toLowerCase());
    buy.href='mailto:info@bernsds.com?subject='+subject;buy.textContent='Enquire to buy';note.textContent='Checkout opens soon. Email me and I will sort it.';
  }
}
optButtons(document.getElementById('o-size'),SIZES,'size');
optButtons(document.getElementById('o-frame'),FRAMES,'frame',true);

/* ---------- 3D ---------- */
let renderer,scene,camera,controls,group,room=[],running=false,ready=false;
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
function grainTex(base,line){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,256,256);
  for(let i=0;i<140;i++){x.strokeStyle=line;x.globalAlpha=Math.random()*.18;x.lineWidth=Math.random()*1.6+.3;const y=Math.random()*256;x.beginPath();x.moveTo(0,y);
    for(let k=0;k<=8;k++)x.lineTo(k*32,y+Math.sin(k*.9+i)*2.2);x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t}
function labelTex(p){const c=document.createElement('canvas');c.width=600;c.height=320;const x=c.getContext('2d');x.fillStyle='#FFFFFF';x.fillRect(0,0,600,320);
  x.fillStyle=C.ink;x.font=`900 64px ${TITLE}`;try{x.fontStretch='expanded'}catch(e){}x.fillText('BERNS',36,96);try{x.fontStretch='normal'}catch(e){}
  x.font=`700 22px ${BODY}`;x.fillText('SIGNED AND NUMBERED BY HAND',36,160);x.fillText(p.name.toUpperCase(),36,200);
  x.fillStyle=C.blue;x.fillRect(36,232,48,4);x.fillStyle=C.ink;x.font=`700 40px ${BODY}`;x.fillText('12 / 50',36,290);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}

function init3D(){
  if(ready)return true; if(!window.THREE||!THREE.OrbitControls){document.getElementById('stage-msg').hidden=false;return false}
  const stage=document.getElementById('stage');
  try{renderer=new THREE.WebGLRenderer({antialias:true})}catch(e){document.getElementById('stage-msg').hidden=false;return false}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  stage.prepend(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color(C.paper);
  camera=new THREE.PerspectiveCamera(32,1,.05,60);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minDistance=.7;controls.maxDistance=5;
  scene.add(new THREE.HemisphereLight(0xffffff,0xd6d2c8,.75));
  const sun=new THREE.DirectionalLight(0xffffff,.75);sun.position.set(1.6,3.2,2.4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.5,far:8});sun.shadow.bias=-.0004;sun.shadow.radius=4;scene.add(sun);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(10,5),new THREE.MeshStandardMaterial({color:lin('#EDEAE3'),roughness:1}));wall.position.set(0,2.5,-.035);wall.receiveShadow=true;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(10,8),new THREE.MeshStandardMaterial({color:lin(C.stone),roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.z=3.5;floor.receiveShadow=true;
  const bench=new THREE.Mesh(new THREE.BoxGeometry(1.5,.42,.38),new THREE.MeshStandardMaterial({color:lin(C.ink),roughness:.7}));bench.position.set(0,.21,.2);bench.castShadow=bench.receiveShadow=true;
  room=[wall,floor,bench];room.forEach(m=>scene.add(m));
  new ResizeObserver(resize).observe(stage);resize();
  ready=true;rebuild(true);return true;
}
function resize(){if(!renderer)return;const s=document.getElementById('stage');const w=s.clientWidth,h=s.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}

function rebuild(resetCam){
  if(!ready)return;
  if(group){scene.remove(group);group.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  group=new THREE.Group();
  const [pwm,phm]=state.size.mm,pw=pwm/1000,ph=phm/1000;
  const tex=new THREE.CanvasTexture(art(state.poster));tex.encoding=THREE.sRGBEncoding;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const posterMat=new THREE.MeshStandardMaterial({map:tex,roughness:.85});
  const f=state.frame;let H;
  if(f.id==='none'){
    const sheet=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,.0015),[0,0,0,0,posterMat,0].map(m=>m||new THREE.MeshStandardMaterial({color:lin('#FBFAF7'),roughness:.9})));
    sheet.castShadow=true;group.add(sheet);H=ph;group.userData.depth=.002;
  }else{
    const m=pw<.35?.05:.065,fw=.024,fd=.032,W=pw+2*m+2*fw;H=ph+2*m+2*fw;
    const wood=new THREE.MeshStandardMaterial({color:0xffffff,map:grainTex(f.col,f.grain),roughness:.62});
    const bar=(w,h,x,y,rot)=>{const g=new THREE.BoxGeometry(w,h,fd);const b=new THREE.Mesh(g,wood);b.position.set(x,y,0);b.castShadow=true;b.receiveShadow=true;if(rot){b.material=wood.clone();b.material.map=wood.map.clone();b.material.map.rotation=Math.PI/2;b.material.map.needsUpdate=true}group.add(b)};
    bar(W,fw,0,H/2-fw/2);bar(W,fw,0,-H/2+fw/2);bar(fw,H-2*fw,-W/2+fw/2,0,true);bar(fw,H-2*fw,W/2-fw/2,0,true);
    const back=new THREE.Mesh(new THREE.BoxGeometry(W-2*fw,H-2*fw,.004),new THREE.MeshStandardMaterial({color:lin('#B79A73'),roughness:1}));back.position.z=-fd/2+.002;group.add(back);
    const mount=new THREE.Mesh(new THREE.PlaneGeometry(W-2*fw,H-2*fw),new THREE.MeshStandardMaterial({color:lin('#FBFAF7'),roughness:.95}));mount.position.z=-fd/2+.0045;mount.receiveShadow=true;group.add(mount);
    const art3=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),posterMat);art3.position.z=-fd/2+.005;group.add(art3);
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(W-2*fw,H-2*fw),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.07,roughness:.05,metalness:.2,depthWrite:false}));glass.position.z=fd/2-.003;group.add(glass);
    const lbl=new THREE.Mesh(new THREE.PlaneGeometry(.15,.08),new THREE.MeshStandardMaterial({map:labelTex(state.poster),roughness:.9}));lbl.rotation.y=Math.PI;lbl.position.set(0,-H/2+.12,-fd/2-.0005);group.add(lbl);
    const wireM=new THREE.MeshStandardMaterial({color:lin('#8A8A8A'),metalness:.8,roughness:.4});
    const wire=new THREE.Mesh(new THREE.CylinderGeometry(.0012,.0012,W*.62,8),wireM);wire.rotation.z=Math.PI/2;wire.position.set(0,H/2-.12,-fd/2-.004);group.add(wire);
    group.userData.depth=fd;
  }
  group.position.set(0,Math.max(1.45,.42+.18+H/2),group.userData.depth/2-.03+.001);
  scene.add(group);
  group.scale.setScalar(reduce?1:.94);group.userData.t0=performance.now();
  if(resetCam)resetView();
  applyMode();
}
function resetView(){
  if(!group)return;const c=group.position.clone();
  const dist=state.mode==='room'?2.9:1.6+state.size.mm[1]/1000;
  controls.target.copy(c);
  camera.position.set(c.x+(state.mode==='room'?.55:.9),c.y+.08,c.z+dist);controls.update();
}
function applyMode(){
  const free=state.mode==='free';room.forEach(m=>m.visible=!free);
  controls.minAzimuthAngle=free?-Infinity:-1.05;controls.maxAzimuthAngle=free?Infinity:1.05;
  controls.minPolarAngle=free?.15:.95;controls.maxPolarAngle=free?Math.PI-.15:1.72;
  controls.autoRotate=free&&!reduce;controls.autoRotateSpeed=1.4;
  if(group)group.position.z=free?0:group.userData.depth/2-.03+.001;
}
function setMode(m){state.mode=m;document.getElementById('v-room').setAttribute('aria-pressed',m==='room');document.getElementById('v-free').setAttribute('aria-pressed',m==='free');applyMode();resetView()}
document.getElementById('v-room').addEventListener('click',()=>setMode('room'));
document.getElementById('v-free').addEventListener('click',()=>setMode('free'));
document.getElementById('v-reset').addEventListener('click',resetView);
function loop(){if(!running)return;requestAnimationFrame(loop);
  if(group&&group.scale.x<1){const k=Math.min(1,(performance.now()-group.userData.t0)/240);const e=1-Math.pow(1-k,3);group.scale.setScalar(.94+.06*e)}
  controls.update();renderer.render(scene,camera)}

syncPanel();
fontsReady.then(()=>{if(init3D()){resize();if(!running){running=true;loop()}}});
})();
