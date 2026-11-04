import * as THREE from 'three';
const stage=document.getElementById('stage'),canvas=stage.querySelector('canvas');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){stage.classList.add('nogl');}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xf5f1ea,11,18);
const camera=new THREE.PerspectiveCamera(32,1,0.1,100);
camera.position.set(0,0.6,10.8);
const group=new THREE.Group();scene.add(group);
const R=3,W=1.5,H=1.875;
const items=[...document.querySelectorAll('.card[data-featured]')].map(c=>({src:c.querySelector("img").src,el:c}));
const N=items.length,meshes=[],loader=new THREE.TextureLoader();
let loaded=0;
items.forEach((it,i)=>{
  const geo=new THREE.PlaneGeometry(W,H,24,1),pos=geo.attributes.position;
  for(let k=0;k<pos.count;k++){const x=pos.getX(k),th=x/R;pos.setX(k,Math.sin(th)*R);pos.setZ(k,Math.cos(th)*R-R);}
  geo.computeVertexNormals();
  const mat=new THREE.MeshBasicMaterial({color:0xddd5c9,side:THREE.DoubleSide});
  loader.load(it.src,t=>{
    t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const ar=t.image.width/t.image.height,pa=W/H;
    if(ar>pa){t.repeat.set(pa/ar,1);t.offset.set((1-pa/ar)/2,0);}else{t.repeat.set(1,ar/pa);t.offset.set(0,(1-ar/pa)/2);}
    mat.map=t;mat.color.set(0xffffff);mat.needsUpdate=true;
    if(++loaded===1)stage.classList.add('ready');
  });
  const mesh=new THREE.Mesh(geo,mat);mesh.position.z=R;mesh.userData=it;
  const pivot=new THREE.Group();pivot.rotation.y=i/N*Math.PI*2;pivot.add(mesh);group.add(pivot);meshes.push(mesh);
});
const ring=(r,y,c,t)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,200),new THREE.MeshBasicMaterial({color:c}));m.rotation.x=Math.PI/2;m.position.y=y;group.add(m);};
ring(R+.35,-H/2-.25,0xc2410c,.012);ring(R+.35,H/2+.25,0x1c1917,.006);
const dustGeo=new THREE.BufferGeometry(),pts=new Float32Array(500*3);
for(let i=0;i<pts.length;i+=3){pts[i]=(Math.random()-.5)*14;pts[i+1]=(Math.random()-.5)*7;pts[i+2]=(Math.random()-.5)*10;}
dustGeo.setAttribute('position',new THREE.BufferAttribute(pts,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc2410c,size:.04,transparent:true,opacity:.45}));scene.add(dust);

let rot=0,auto=reduce?0:.0028,vel=auto,drag=false,lastX=0,moved=0,tx=0,ty=0,mx=0,my=0,hovered=null;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),tmp=new THREE.Vector3(),sv=new THREE.Vector3();
const pick=e=>{const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObjects(meshes)[0];return h&&h.object.getWorldPosition(tmp).z>-.5?h.object:null;};
const front=()=>meshes.reduce((a,m)=>m.getWorldPosition(tmp).z>a.z?{m,z:tmp.z}:a,{m:null,z:-1e9}).m;
stage.addEventListener('pointerdown',e=>{drag=true;moved=0;lastX=e.clientX;stage.setPointerCapture(e.pointerId);stage.classList.add('drag');});
stage.addEventListener('pointermove',e=>{
  const r=stage.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;
  if(drag){const dx=e.clientX-lastX;lastX=e.clientX;moved+=Math.abs(dx);rot+=dx*.006;vel=dx*.004;}
  else if(e.pointerType==='mouse'){hovered=pick(e);stage.classList.toggle('over',!!hovered);}
});
stage.addEventListener('pointerup',e=>{if(!drag)return;drag=false;stage.classList.remove('drag');if(moved<6){const m=pick(e);if(m)m.userData.el.click();}});
stage.addEventListener('pointercancel',()=>{drag=false;stage.classList.remove('drag');});
stage.addEventListener('pointerleave',()=>{if(!drag){hovered=null;tx=ty=0;stage.classList.remove('over');}});
stage.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'){vel=-.06;e.preventDefault();}
  else if(e.key==='ArrowRight'){vel=.06;e.preventDefault();}
  else if(e.key==='Enter'||e.key===' '){const m=front();if(m){e.preventDefault();m.userData.el.click();}}
});
const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=w/h<1.25?10.8*1.25/(w/h):10.8;camera.updateProjectionMatrix();};
new ResizeObserver(resize).observe(stage);resize();
function tick(){
  if(!drag){vel+=(auto-vel)*.035;rot+=vel;}
  group.rotation.y=rot;
  mx+=(tx-mx)*.06;my+=(ty-my)*.06;
  group.rotation.x=.14+my*.3;group.rotation.z=-mx*.08;
  camera.position.x=mx*1.4;camera.lookAt(0,0,0);
  group.position.y=Math.min(scrollY/innerHeight,1)*1.4;
  for(const m of meshes){const s=m===hovered?1.07:1;m.scale.lerp(sv.set(s,s,1),.15);}
  dust.rotation.y+=reduce?0:.0007;
  renderer.render(scene,camera);
}
new IntersectionObserver(([e])=>renderer.setAnimationLoop(e.isIntersecting?tick:null)).observe(stage);
}

