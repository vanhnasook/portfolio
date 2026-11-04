import * as THREE from 'three';
const canvas=document.getElementById('bg'),toggle=document.getElementById('bgToggle');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){}
if(renderer){
document.documentElement.classList.add('bg3d');
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setClearColor(0xf5f1ea);
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xf5f1ea,22,84);
const camera=new THREE.PerspectiveCamera(55,1,.1,220);
const small=innerWidth<760;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

/* ---------- Dot landscape ---------- */
const CX=small?90:170,CZ=small?130:210,SX=small?46:72,Z0=16,SZ=120;
const n=CX*CZ,pos=new Float32Array(n*3),rnd=new Float32Array(n);
for(let j=0,k=0;j<CZ;j++)for(let i=0;i<CX;i++,k++){pos[k*3]=(i/(CX-1)-.5)*SX;pos[k*3+2]=Z0-j/(CZ-1)*SZ;rnd[k]=Math.random();}
const geo=new THREE.BufferGeometry();
geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
geo.setAttribute('aRand',new THREE.BufferAttribute(rnd,1));
const shocks=[0,1,2,3].map(()=>new THREE.Vector4(0,0,-99,0));
const U={uTime:{value:0},uMouse:{value:new THREE.Vector2(0,-6)},uHover:{value:0},uShock:{value:shocks},uPx:{value:renderer.getPixelRatio()},uAmp:{value:1}};
scene.add(new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
vertexShader:`uniform float uTime,uHover,uPx,uAmp;uniform vec2 uMouse;uniform vec4 uShock[4];
attribute float aRand;varying float vH;varying float vFog;varying float vR;
void main(){vec3 p=position;float t=uTime;
float h=(sin(p.x*.28+t*.55)*.55+cos(p.z*.36+t*.42)*.45+sin((p.x-p.z)*.16+t*.3)*.7)*uAmp;
float md=distance(p.xz,uMouse);
h+=uHover*(1.8*exp(-md*md*.05)+.35*sin(md*1.6-t*4.)*exp(-md*.16));
for(int i=0;i<4;i++){float age=t-uShock[i].z;if(age>0.&&age<4.){float d=distance(p.xz,uShock[i].xy);h+=uShock[i].w*2.2*exp(-pow(d-age*10.,2.)*.3)*exp(-age*1.1);}}
p.y=h-2.2;vH=h;vR=aRand;
vec4 mv=modelViewMatrix*vec4(p,1.);
gl_PointSize=min((1.4+aRand*1.6+max(h,0.)*.6)*uPx*(24./-mv.z),4.*uPx);
vFog=smoothstep(80.,5.,-mv.z);
gl_Position=projectionMatrix*mv;}`,
fragmentShader:`varying float vH;varying float vFog;varying float vR;
void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;
vec3 col=mix(vec3(.62,.58,.54),vec3(.76,.25,.05),smoothstep(-.4,2.4,vH));
gl_FragColor=vec4(col,smoothstep(.5,.12,d)*vFog*(.3+vR*.28)*(1.+max(vH-1.,0.)*.35));}`})));

/* ---------- Landmark helpers ---------- */
const mat=(c,o)=>{const m=new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o});m.userData.base=o;return m;};
const edges=(g,m)=>new THREE.LineSegments(new THREE.EdgesGeometry(g,1),m);
const box=(w,h,d,x,y,z,m)=>{const e=edges(new THREE.BoxGeometry(w,h,d),m);e.position.set(x,y,z);return e;};
const lathe=(pts,seg,m,phi=0)=>edges(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg,phi),m);
const segs=(arr,m)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));return new THREE.LineSegments(g,m);};

/* ---------- Patuxay (victory gate) ---------- */
const pInk=mat(0x1c1917,.5),pAcc=mat(0xc2410c,.62);
const patuxay=new THREE.Group();
for(const sx of[-1,1])for(const sz of[-1,1])patuxay.add(box(4,9,4,sx*5,4.5,sz*5,pInk));
patuxay.add(box(14,3,14,0,10.5,0,pInk));
patuxay.add(box(14.8,.4,14.8,0,12.2,0,pInk));
patuxay.add(box(11,1.6,11,0,13.2,0,pInk));
const archArr=[];
const curve=(w,rise,face,N=14)=>{for(const side of[-1,1])for(let i=0;i<N;i++){for(const t of[i/N,(i+1)/N]){const x=side*(w-w*t),y=6.6+rise*Math.sin(t*Math.PI/2);const c=Math.cos(face),s=Math.sin(face);archArr.push(x*c+7.02*s,y,-x*s+7.02*c);}}};
for(let f=0;f<4;f++){const a=f*Math.PI/2;curve(3,2.3,a);curve(2.2,1.5,a);}
for(let f=0;f<4;f++){const a=f*Math.PI/2,c=Math.cos(a),s=Math.sin(a);for(const x of[-3,3])archArr.push(x*c+7.02*s,0,-x*s+7.02*c,x*c+7.02*s,6.6,-x*s+7.02*c);}
patuxay.add(segs(archArr,pAcc));
const tier=[[2.6,0],[2.6,1.1],[2,1.3],[2.1,2.3],[1.6,2.5],[1.7,3.4],[1.2,3.6],[1.3,4.4],[.8,4.6],[.6,5.8],[.3,7],[.08,8],[0,8.4]];
const ct=lathe(tier,4,pAcc,Math.PI/4);ct.position.y=14;patuxay.add(ct);
for(const sx of[-1,1])for(const sz of[-1,1]){const t=lathe(tier.map(([r,y])=>[r*.5,y*.58]),4,pInk,Math.PI/4);t.position.set(sx*4.2,14,sz*4.2);patuxay.add(t);}
patuxay.scale.setScalar(.85);patuxay.position.set(0,-2.6,-28);scene.add(patuxay);

/* ---------- Pha That Luang (golden stupa) ---------- */
const gMain=mat(0xb7791f,.66),gSoft=mat(0xb7791f,.4);
const thatLuang=new THREE.Group();
thatLuang.add(box(18,1.2,18,0,.6,0,gSoft));
thatLuang.add(box(14,1.2,14,0,1.8,0,gSoft));
thatLuang.add(box(10.5,1,10.5,0,2.9,0,gMain));
const mini=[[.45,0],[.45,.35],[.55,.5],[.35,.9],[.25,1.3],[.12,1.9],[0,2.3]];
for(let k=0;k<28;k++){const side=Math.floor(k/7),a=-6.3+(k%7)*1.8,H=6.3;const p=[[a,-H],[H,a],[-a,H],[-H,-a]][side];const m=lathe(mini,6,gSoft);m.position.set(p[0],2.4,p[1]);thatLuang.add(m);}
const stupa=[[4.6,0],[4.6,.5],[4,.7],[4,1.3],[4.4,1.5],[3.6,2.4],[2.6,3],[2.2,3.2],[2.2,3.8],[1.7,4.2],[1.4,5.5],[1,7],[.7,8.5],[.45,10],[.25,11.2],[.08,12.2],[0,12.6]];
const st=lathe(stupa,12,gMain);st.position.y=3.4;thatLuang.add(st);
for(const sx of[-1,1])for(const sz of[-1,1]){const m=lathe(mini.map(([r,y])=>[r*1.6,y*1.7]),8,gMain);m.position.set(sx*4.6,3.4,sz*4.6);thatLuang.add(m);}
thatLuang.scale.setScalar(.9);thatLuang.position.set(0,-2.6,-92);scene.add(thatLuang);

const landmarks=[
 {g:patuxay,mats:[pInk,pAcc],center:new THREE.Vector3(0,6,-28),top:new THREE.Vector3(0,16.8,-28),el:document.getElementById('lmPatuxay'),glow:0},
 {g:thatLuang,mats:[gMain,gSoft],center:new THREE.Vector3(0,4,-92),top:new THREE.Vector3(0,12.4,-92),el:document.getElementById('lmThatLuang'),glow:0}];

/* ---------- Sky lanterns (khom loy) ---------- */
const LN=small?60:120,lp=new Float32Array(LN*3),lv=new Float32Array(LN),lph=new Float32Array(LN),lsz=new Float32Array(LN);
let camZ=15,li=0;
const spawn=(i,x,y,z,v)=>{lp[i*3]=x;lp[i*3+1]=y;lp[i*3+2]=z;lv[i]=v??(.45+Math.random()*.6);};
for(let i=0;i<LN;i++){spawn(i,(Math.random()-.5)*50,-3+Math.random()*22,camZ-8-Math.random()*60);lph[i]=Math.random()*6.28;lsz[i]=.7+Math.random()*.6;}
const lgeo=new THREE.BufferGeometry();
lgeo.setAttribute('position',new THREE.BufferAttribute(lp,3));
lgeo.setAttribute('aPh',new THREE.BufferAttribute(lph,1));
lgeo.setAttribute('aSz',new THREE.BufferAttribute(lsz,1));
scene.add(new THREE.Points(lgeo,new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,
vertexShader:`uniform float uTime,uPx;attribute float aPh,aSz;varying float vF;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float z=-mv.z;
gl_PointSize=min(aSz*uPx*90./z,24.*uPx);
vF=(.78+.22*sin(uTime*6.+aPh*3.)*sin(uTime*2.7+aPh))*smoothstep(85.,12.,z)*smoothstep(1.5,5.,z);
gl_Position=projectionMatrix*mv;}`,
fragmentShader:`varying float vF;
void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;
float core=smoothstep(.2,0.,d),halo=smoothstep(.5,0.,d)*.4;
gl_FragColor=vec4(mix(vec3(.84,.3,.05),vec3(1.,.8,.45),core),(core+halo)*vF);}`})));

/* ---------- Interaction ---------- */
const ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),2.2),hit=new THREE.Vector3(),tmp=new THREE.Vector3(),m2=new THREE.Vector2();
let hoverT=0,mx=0,my=0,tmx=0,tmy=0,lastMove=-9,si=0,t=0,last=performance.now(),running=false,scrollP=0,sp=0,hasHit=false;
const point=(x,y)=>{ndc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(ndc,camera);if(!ray.ray.intersectPlane(plane,hit)||hit.distanceTo(camera.position)>70)ray.ray.at(30,hit);hasHit=true;return hit;};
const shock=(x,z,s=1)=>{shocks[si].set(x,z,t,s);si=(si+1)%4;};
addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5;point(e.clientX,e.clientY);hoverT=1;lastMove=t;},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{hoverT=0;});
addEventListener('pointerdown',e=>{
  if(e.target.closest('a,button,input,select,textarea,label,#stage,.lb'))return;
  const h=point(e.clientX,e.clientY);shock(h.x,h.z,1);
  for(let k=0;k<6;k++){const i=(li++)%LN;spawn(i,h.x+(Math.random()-.5)*2.5,Math.min(h.y,0)-1+Math.random(),h.z+(Math.random()-.5)*2.5,.9+Math.random()*.7);}
  if(!running)frame(performance.now());
},{passive:true});
const onScroll=()=>{scrollP=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1);if(!running){sp=scrollP;frame(performance.now());}};
addEventListener('scroll',onScroll,{passive:true});
const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<1?72:55;camera.updateProjectionMatrix();if(!running)frame(performance.now());};
addEventListener('resize',resize);

let nextAmbient=3;
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(running){t+=dt;sp+=(scrollP-sp)*.07;}
  U.uTime.value=t;
  if(t-lastMove>2.5)hoverT=0;
  U.uHover.value+=(hoverT-U.uHover.value)*.05;
  if(hasHit)U.uMouse.value.lerp(m2.set(hit.x,hit.z),.12);
  mx+=(tmx-mx)*.05;my+=(tmy-my)*.05;
  // Scroll journey: approach Patuxay, fly through the arch, arrive at That Luang
  const p=sp,arch=Math.exp(-(((p-.56)/.17)**2));
  camZ=15-77*p;
  const cy=4.5-2.7*arch+1.2*sstep(.6,1,p);
  camera.position.set(mx*2.2*(1-arch),cy-my*(1-arch),camZ);
  camera.lookAt(mx*.8*(1-arch),cy-1.6+.9*sstep(.7,1,p),camZ-25);
  U.uAmp.value=1.15-Math.sin(p*Math.PI)*.3;
  if(running&&t>nextAmbient){shock((Math.random()-.5)*28,camZ-10-Math.random()*30,.5);nextAmbient=t+5+Math.random()*4;}
  // Lanterns rise and drift
  for(let i=0;i<LN;i++){
    if(running){lp[i*3+1]+=lv[i]*dt;lp[i*3]+=Math.sin(t*.6+lph[i])*dt*.3;}
    if(lp[i*3+1]>20||lp[i*3+2]>camZ+1)spawn(i,(Math.random()-.5)*50,-3,camZ-8-Math.random()*55);
  }
  lgeo.attributes.position.needsUpdate=true;
  // Landmarks: glow when the cursor is near, fade when the camera is very close, labels follow
  for(const L of landmarks){
    const dist=camera.position.distanceTo(L.center);
    tmp.copy(L.center).project(camera);
    const md=Math.hypot(tmp.x-tmx*2,tmp.y+tmy*2);
    const target=hoverT&&tmp.z<1&&md<.4?1:0;
    L.glow+=(target-L.glow)*.08;
    const near=clamp((dist-5)/12,.12,1);
    for(const m of L.mats)m.opacity=Math.min(1,m.userData.base*(1+L.glow*.7)*near);
    if(running)L.g.rotation.y=Math.sin(t*.12)*.06+mx*.08;
    tmp.copy(L.top).project(camera);
    const vis=tmp.z<1&&Math.abs(tmp.x)<1.1&&tmp.y<.7&&dist>12&&dist<80;
    L.el.style.opacity=vis?String(clamp((80-dist)/30,0,1)*(.55+L.glow*.45)):'0';
    if(vis)L.el.style.transform='translate('+((tmp.x+1)/2*innerWidth)+'px,'+((1-tmp.y)/2*innerHeight)+'px)';
    L.el.classList.toggle('on',L.glow>.5);
  }
  renderer.render(scene,camera);
}
const label=()=>{const s=running?'Pause motion':'Play motion';toggle.querySelector('span').textContent=window.__t?window.__t(s):s;};
addEventListener('langchange',()=>{label();onScroll();});
const setRun=on=>{running=on;last=performance.now();renderer.setAnimationLoop(on?frame:null);toggle.setAttribute('aria-pressed',String(!on));label();if(!on){sp=scrollP;frame(performance.now());}};
toggle.hidden=false;toggle.onclick=()=>setRun(!running);
const hint=document.getElementById('bgHint');hint.hidden=false;
const hideHint=()=>{hint.classList.add('gone');removeEventListener('scroll',hideHint);};
addEventListener('scroll',hideHint,{passive:true});setTimeout(hideHint,9000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)renderer.setAnimationLoop(null);else if(!document.hidden&&running){last=performance.now();renderer.setAnimationLoop(frame);}});
onScroll();sp=scrollP;resize();setRun(!reduce);
}

