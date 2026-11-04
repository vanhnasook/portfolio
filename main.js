const nav=document.querySelector('.nav'),menu=document.getElementById('menu'),burger=document.querySelector('.burger');
addEventListener('scroll',()=>nav.classList.toggle('s',scrollY>10),{passive:true});
burger.onclick=()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)};menu.querySelectorAll('a').forEach(a=>a.onclick=()=>{menu.classList.remove('open');burger.setAttribute('aria-expanded',false)});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal,.skills').forEach(el=>io.observe(el));
const links=[...menu.querySelectorAll('a')];const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('act',l.hash==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});document.querySelectorAll('main section[id]').forEach(s=>so.observe(s));
const artwork=[...document.querySelectorAll('.card')];
const categoryButtons=[...document.querySelectorAll('.filters button')];
const pageSize=6, workPrev=document.getElementById('workPrev'),workNext=document.getElementById('workNext');
let selectedCategory='featured',workPage=0;
const categoryItems=()=>artwork.filter(c=>selectedCategory==='all'||(selectedCategory==='featured'?c.hasAttribute('data-pick'):c.dataset.cat===selectedCategory));
function renderWork(){
  const t=s=>window.__t?window.__t(s):s,items=categoryItems(),pages=Math.max(1,Math.ceil(items.length/pageSize));
  workPage=Math.min(workPage,pages-1);
  const visible=items.slice(workPage*pageSize,(workPage+1)*pageSize);
  artwork.forEach(c=>{c.hidden=!visible.includes(c);c.classList.toggle('hide',c.hidden);});
  categoryButtons.forEach(b=>{const selected=b.dataset.f===selectedCategory;b.classList.toggle('on',selected);b.setAttribute('aria-pressed',String(selected));b.querySelector('small').textContent=artwork.filter(c=>b.dataset.f==='all'||(b.dataset.f==='featured'?c.hasAttribute('data-pick'):c.dataset.cat===b.dataset.f)).length;});
  document.getElementById('workCount').textContent=(workPage*pageSize+1)+'–'+Math.min((workPage+1)*pageSize,items.length)+' / '+items.length;
  document.getElementById('workPage').textContent=t('Page')+' '+(workPage+1)+' / '+pages;
  workPrev.textContent='← '+t('Previous');workNext.textContent=t('Next')+' →';
  workPrev.disabled=workPage===0;workNext.disabled=workPage===pages-1;
  document.querySelector('.gallery-pager').hidden=pages===1;
}
categoryButtons.forEach(b=>b.onclick=()=>{selectedCategory=b.dataset.f;workPage=0;renderWork();});
function turnPage(dir){workPage+=dir;renderWork();document.getElementById('artworkGrid').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
workPrev.onclick=()=>turnPage(-1);workNext.onclick=()=>turnPage(1);
addEventListener('langchange',renderWork);renderWork();
const lb=document.getElementById('lb'),lbi=lb.querySelector('img'),lbp=lb.querySelector('p'),prev=lb.querySelector('.lb-prev'),next=lb.querySelector('.lb-next');let last,active,sequence=[],imageIndex=0,oldOverflow='';
const renderImage=()=>{active=sequence[imageIndex];lbi.src=active.dataset.img;lbi.alt=active.dataset.title;lbp.textContent=active.dataset.title+' — '+active.dataset.sub;document.getElementById('lbCount').textContent=(imageIndex+1)+' / '+sequence.length;prev.hidden=next.hidden=sequence.length<2;};
document.querySelectorAll('[data-img]').forEach(b=>b.onclick=()=>{last=b;sequence=b.classList.contains('card')?categoryItems():[...document.querySelectorAll('.cert')];if(!sequence.includes(b))sequence=artwork;imageIndex=sequence.indexOf(b);renderImage();oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';lb.hidden=false;lb.querySelector('.x').focus();});
const step=dir=>{imageIndex=(imageIndex+dir+sequence.length)%sequence.length;renderImage();};prev.onclick=()=>step(-1);next.onclick=()=>step(1);
addEventListener('langchange',()=>{if(!lb.hidden&&active)renderImage();});
const close=()=>{lb.hidden=true;document.body.style.overflow=oldOverflow;last&&last.focus({preventScroll:true});};lb.querySelector('.x').onclick=close;lb.onclick=e=>{if(e.target===lb)close();};
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}else if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='Tab'){const buttons=[...lb.querySelectorAll('button')].filter(b=>!b.hidden);const first=buttons[0],end=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}}});
const qs=[...document.querySelectorAll('.qs blockquote')],dots=[...document.querySelectorAll('.dots button')];let qi=0,t;const show=i=>{qi=i;qs.forEach((q,j)=>q.classList.toggle('on',j===i));dots.forEach((d,j)=>d.classList.toggle('on',j===i))};
const auto=()=>{clearInterval(t);t=setInterval(()=>show((qi+1)%qs.length),7000)};dots.forEach((d,i)=>d.onclick=()=>{show(i);auto()});auto();
const sel=document.querySelector('#cform select'),map={'Video Editing':'Video editing','Graphic Design':'Graphic design','Brand Identity':'Brand identity','AI & Creative Workflow':'AI / workflow'};document.querySelectorAll('[data-type]').forEach(a=>a.addEventListener('click',()=>{sel.value=map[a.dataset.type]}));
document.getElementById('cform').onsubmit=e=>{e.preventDefault();const t=s=>window.__t?window.__t(s):s;const f=new FormData(e.target);const type=t(f.get('type'));const body=t('Name')+': '+f.get('name')+'\n'+t('Email')+': '+f.get('email')+'\n'+t('Project type')+': '+type+'\n\n'+f.get('message');location.href='mailto:vanhnasook@gmail.com?subject='+encodeURIComponent(t('Project enquiry')+' — '+type)+'&body='+encodeURIComponent(body)};

/* 3D tilt + headline parallax */
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('.card,.vcard,.cert,.svc article').forEach(el=>{
    el.classList.add('tilt');
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.classList.add('hovering');el.style.transform='perspective(900px) rotateX('+((.5-y)*9)+'deg) rotateY('+((x-.5)*11)+'deg)';el.style.setProperty('--gx',x*100+'%');el.style.setProperty('--gy',y*100+'%');});
    el.addEventListener('pointerleave',()=>{el.classList.remove('hovering');el.style.transform='';});
  });
  const h=document.getElementById('heroTitle'),hero=document.querySelector('.hero');
  hero.addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;h.style.transform='perspective(1200px) rotateY('+(x*8)+'deg) rotateX('+(-y*6)+'deg)';});
  hero.addEventListener('pointerleave',()=>{h.style.transform='';});
}

