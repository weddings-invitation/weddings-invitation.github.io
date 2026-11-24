(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var DPR=Math.min(window.devicePixelRatio||1,2.5);

var ART={pet1:'assets/art/pet1.webp',pet2:'assets/art/pet2.webp',pet3:'assets/art/pet3.webp'};

/* ================= typed names ================= */
$$('.ty').forEach(function(el){
  var t=el.getAttribute('data-type'),s=el.getAttribute('data-s')+'s';el.style.setProperty('--s',s);
  el.setAttribute('aria-label',t);
  for(var i=0;i<t.length;i++){var sp=document.createElement('span');sp.style.setProperty('--i',i);sp.style.setProperty('--s',s);sp.textContent=t[i]===' '?' ':t[i];sp.setAttribute('aria-hidden','true');el.appendChild(sp)}
});

/* ================= audio ================= */
var audio=new Audio(),ac=null,gain=null,wantPlay=false,musBtn=$('#mus');
audio.loop=true;audio.preload='none';
function fadeTo(v,secs){
  if(gain&&ac){var t=ac.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(v,t+secs)}
  else{var from=audio.volume,t0=performance.now();(function st(n){var k=Math.min(1,(n-t0)/(secs*1000));try{audio.volume=from+(v-from)*k}catch(e){}if(k<1)requestAnimationFrame(st)})(t0)}
}
function startMusic(){
  try{
    if(!ac){var AC=window.AudioContext||window.webkitAudioContext;if(AC){ac=new AC();var src=ac.createMediaElementSource(audio);gain=ac.createGain();gain.gain.value=0;src.connect(gain);gain.connect(ac.destination)}}
    if(ac&&ac.state==='suspended')ac.resume();
  }catch(e){ac=null;gain=null}
  if(!gain){try{audio.volume=0}catch(e){}}
  var p=audio.play();if(p&&p.catch)p.catch(function(){setPlayUI(false)});
  wantPlay=true;setPlayUI(true);fadeTo(.55,3.2);
}
function setPlayUI(on){musBtn.classList.toggle('play',on)}
musBtn.addEventListener('click',function(){
  if(wantPlay){wantPlay=false;fadeTo(0,.35);setTimeout(function(){if(!wantPlay)audio.pause()},380);setPlayUI(false)}
  else{if(ac&&ac.state==='suspended')ac.resume();audio.play().catch(function(){});wantPlay=true;setPlayUI(true);fadeTo(.55,1.2)}
});
document.addEventListener('visibilitychange',function(){
  if(document.hidden){if(wantPlay)audio.pause()}else if(wantPlay){audio.play().catch(function(){})}
});

/* ================= FX canvas (petals + confetti) ================= */
var FX=(function(){
  var cv=$('#fx'),cx=cv.getContext('2d'),P=[],run=false,last=0,W=0,H=0,sc=Math.min(DPR,1.5),imgs=[];
  function size(){W=innerWidth;H=innerHeight;cv.width=W*sc;cv.height=H*sc}
  addEventListener('resize',size);
  function sprites(){if(!imgs.length)['pet1','pet2','pet3'].forEach(function(k){var i=new Image();i.src=ART[k];imgs.push(i)})}
  function add(o){P.push(o);if(!run){run=true;cv.style.display='block';size();last=performance.now();requestAnimationFrame(loop)}}
  function petals(n,spread){sprites();for(var i=0;i<n;i++){add({t:'p',x:Math.random()*W,y:-30-Math.random()*H*(spread||.6),vx:(Math.random()-.5)*30,vy:55+Math.random()*70,r:Math.random()*6.28,vr:(Math.random()-.5)*3,ph:Math.random()*6,s:.45+Math.random()*.6,im:imgs[(Math.random()*3)|0],a:1,life:9})}}
  function burst(x,y){sprites();var cols=['#d9b45b','#f0dc9c','#6e1f2f','#e9a3b0','#ffffff','#f5a31a'],i,a,v;
    for(i=0;i<70;i++){a=Math.random()*6.28;v=140+Math.random()*320;add({t:'c',x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-160,r:Math.random()*6,vr:(Math.random()-.5)*14,w:5+Math.random()*5,h:3+Math.random()*4,c:cols[(Math.random()*cols.length)|0],g:520,a:1,life:2.6})}
    for(i=0;i<26;i++){a=Math.random()*6.28;v=90+Math.random()*220;add({t:'p',x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,r:Math.random()*6,vr:(Math.random()-.5)*5,ph:0,s:.5+Math.random()*.5,im:imgs[(Math.random()*3)|0],a:1,life:4,g:140,drag:1})}}
  function loop(n){
    var dt=Math.min(.05,(n-last)/1000);last=n;cx.setTransform(sc,0,0,sc,0,0);cx.clearRect(0,0,W,H);
    for(var i=P.length-1;i>=0;i--){var p=P[i];p.life-=dt;
      if(p.t==='c'){p.vy+=p.g*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.a=Math.min(1,p.life/.8)}
      else if(p.drag){p.vy+=p.g*dt;p.vx*=.97;p.vy*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.a=Math.min(1,p.life/1.2)}
      else{p.ph+=dt*1.6;p.x+=(p.vx+Math.sin(p.ph)*34)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>H+30)p.life=0}
      if(p.life<=0){P.splice(i,1);continue}
      cx.globalAlpha=p.a;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);
      if(p.t==='c'){cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*2)+.2))}
      else{var s=p.s*.9;cx.scale(s,s*(.55+.45*Math.abs(Math.cos(p.r))));cx.drawImage(p.im,-15,-20,30,40)}
      cx.restore();
    }
    cx.globalAlpha=1;
    if(P.length)requestAnimationFrame(loop);else{run=false;cv.style.display='none'}
  }
  return {petals:petals,burst:burst};
})();

/* ================= parallax / swing ================= */
var sy=window.pageYOffset||0,lastY=sy,vel=0,sw=0,swv=0,pRun=false,frs=$$('.fr'),strs=$$('.str');
function ptick(){
  var dy=sy-lastY;lastY=sy;vel=vel*.75+dy*.25;
  swv+=-sw*.055-vel*.11;swv*=.93;sw+=swv;if(sw>26)sw=26;if(sw<-26)sw=-26;
  for(var i=0;i<strs.length;i++){strs[i].style.transform='rotate('+(sw*(1+((i%3)*.18))*(i%2?-1:1)*.9).toFixed(2)+'deg)'}
  for(i=0;i<frs.length;i++){var f=frs[i],ph=+f.getAttribute('data-ph');f.style.transform='translate3d('+(Math.sin(sy/520+ph)*12).toFixed(1)+'px,'+(Math.sin(sy/410+ph*1.3)*26).toFixed(1)+'px,0) rotate('+(Math.sin(sy/700+ph)*14).toFixed(1)+'deg)'}
  if(Math.abs(sw)>.04||Math.abs(swv)>.01||Math.abs(vel)>.05||dy!==0)requestAnimationFrame(ptick);else pRun=false;
}
addEventListener('scroll',function(){sy=window.pageYOffset;if(!pRun){pRun=true;requestAnimationFrame(ptick)}},{passive:true});
ptick();
var rlb=$('#rlb'),rlf=$('#rlf');
function par(x,y){rlb.style.transform='translate3d('+(x*-10).toFixed(1)+'px,'+(y*-8).toFixed(1)+'px,0)';rlf.style.transform='translate3d('+(x*28).toFixed(1)+'px,'+(y*22).toFixed(1)+'px,0)'}
$('#intro').addEventListener('pointermove',function(e){par((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2)},{passive:true});
$('#intro').addEventListener('touchmove',function(e){var t=e.touches[0];if(t)par((t.clientX/innerWidth-.5)*2,(t.clientY/innerHeight-.5)*2)},{passive:true});
if(window.DeviceOrientationEvent){addEventListener('deviceorientation',function(e){if(e.gamma==null)return;par(Math.max(-1,Math.min(1,e.gamma/30)),Math.max(-1,Math.min(1,((e.beta||0)-45)/30)))},{passive:true})}

/* ================= opening sequence ================= */
var opened=false,book=$('#book');
function openBook(){
  if(opened)return;opened=true;
  $('#hint').classList.remove('on');
  startMusic();
  book.classList.add('open');
  setTimeout(function(){
    var bw=book.offsetWidth,z=Math.min(innerWidth*.98/bw,(innerHeight*.9)/(bw*1.48))*1.0;z=Math.max(z,1.5);
    $('#scene').style.transform='scale('+z.toFixed(3)+')';
    FX.petals(34,.5);
  },1250);
  setTimeout(function(){
    document.documentElement.classList.add('started');document.body.classList.add('started');
    $('#intro').classList.add('gone');
    document.documentElement.classList.remove('locked');
    window.scrollTo(0,0);
  },2350);
  setTimeout(function(){$('#intro').style.display='none'},3400);
}
$('#intro').addEventListener('click',openBook);
$('#book').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')openBook()});

/* ================= observers ================= */
function setupObservers(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('paused',!e.isIntersecting)})},{rootMargin:'120px'});
  $$('.sec').forEach(function(s){io.observe(s)});
  var rv=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var t=e.target;t.classList.add('in');rv.unobserve(t);setTimeout(function(){t.classList.add('done')},1300+(parseFloat(getComputedStyle(t).transitionDelay)||0)*1000)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  $$('.rv').forEach(function(r){rv.observe(r)});
  var rcv=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$('#recep').classList.add('inv-v');rcv.disconnect()}})},{threshold:.35});
  rcv.observe($('#rc'));
}
/* sparkles */
(function(){var h='',seed=7,i;function r(){seed=(seed*9301+49297)%233280;return seed/233280}
  for(i=0;i<14;i++)h+='<i class="spk" data-sp style="left:'+(6+r()*88).toFixed(1)+'%;top:'+(4+r()*92).toFixed(1)+'%;animation-delay:'+(r()*3).toFixed(2)+'s;width:'+(9+r()*12).toFixed(0)+'px;height:'+(9+r()*12).toFixed(0)+'px"></i>';
  $('#spk').innerHTML=h})();

/* ================= pull-to-reveal scroll ================= */
(function(){
  var PH=340,h=0,ppr=$('#ppr'),roll=$('#rollx'),tas=$('#tas'),pw=$('#pw'),isOpen=false,drag=false,y0=0,h0=0,moved=0,anim=0;
  function set(v){h=Math.max(0,Math.min(PH,v));ppr.style.clipPath='inset(0 0 '+(PH-h)+'px 0)';roll.style.transform='translate3d(0,'+h+'px,0)';tas.style.transform='translate3d(0,'+h+'px,0)'}
  function go(to,done){cancelAnimationFrame(anim);var from=h,t0=performance.now(),d=Math.abs(to-from)*3.2+250;(function st(n){var k=Math.min(1,(n-t0)/d),e=1-Math.pow(1-k,3);set(from+(to-from)*e);if(k<1)anim=requestAnimationFrame(st);else if(done)done()})(t0)}
  function reveal(){if(isOpen)return;isOpen=true;pw.classList.add('opened');go(PH,function(){var r=ppr.getBoundingClientRect();FX.burst(r.left+r.width/2,r.top+r.height*.5);FX.petals(26,.4)})}
  function close(){isOpen=false;go(0)}
  tas.addEventListener('pointerdown',function(e){drag=true;moved=0;y0=e.clientY;h0=h;cancelAnimationFrame(anim);try{tas.setPointerCapture(e.pointerId)}catch(_){}pw.classList.add('opened');e.preventDefault()});
  tas.addEventListener('pointermove',function(e){if(!drag)return;var dy=e.clientY-y0;moved=Math.max(moved,Math.abs(dy));set(h0+dy)});
  function up(){if(!drag)return;drag=false;
    if(moved<6){if(isOpen)close();else reveal()}
    else if(h>PH*.38){if(!isOpen){reveal()}else go(PH)}
    else{if(isOpen)close();else{go(0);pw.classList.remove('opened')}}}
  tas.addEventListener('pointerup',up);tas.addEventListener('pointercancel',up);
  set(0);
  var tgt=new Date('2027-02-27T19:00:00+05:30').getTime(),cd=$('#cd');
  function pad(n){return n<10?'0'+n:''+n}
  function tick(){var d=tgt-Date.now();if(d<0)d=0;var s=Math.floor(d/1000);cd.innerHTML=Math.floor(s/86400)+' days<em>·</em>'+pad(Math.floor(s%86400/3600))+' hrs<em>·</em>'+pad(Math.floor(s%3600/60))+' min<em>·</em>'+pad(s%60)+' sec'}
  tick();setInterval(tick,1000);
  var det='Haldi & Mehendi: Fri 26 Feb 2027, Baraat & Pheras: Sun 28 Feb 2027 3-4 AM. Guest Arrival 7 PM on Sat 27 Feb. Contact +91 97194 25452';
  $('#cal').href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('Rajat weds Tanu - Wedding')+'&dates=20270227T133000Z/20270227T173000Z&details='+encodeURIComponent(det)+'&location='+encodeURIComponent('Jatin Farm House, Haldaur - Nehtaur Rd, Haldaur Rural, Uttar Pradesh 246726');
})();

/* ================= 3D carousels ================= */
function carousel(root,dotsEl){
  var cards=$$('.card',root),n=cards.length,pos=0,cur=0,W=270,drag=false,x0=0,y0=0,p0=0,id=null,decided=false,anim=0,lastX=0,lastT=0,v=0,dots=[];
  for(var i=0;i<n;i++){var d=document.createElement('i');dotsEl.appendChild(d);dots.push(d)}
  function measure(){W=cards[0].offsetWidth||270}
  function draw(){
    for(var i=0;i<n;i++){var d=i-pos;d-=n*Math.round(d/n);var a=Math.abs(d),c=cards[i];
      c.style.transform='translate3d('+(d*W*.76).toFixed(1)+'px,0,'+(-a*140).toFixed(1)+'px) rotateY('+Math.max(-55,Math.min(55,-d*34)).toFixed(1)+'deg) scale('+(1-Math.min(a,1.6)*.09).toFixed(3)+')';
      c.style.opacity=a>1.55?0:(1-Math.min(a,1.5)*.3).toFixed(2);c.style.zIndex=Math.round(100-a*10);
      var s=a>.45;if(s!==c._s){c._s=s;c.classList.toggle('side',s)}
    }
    var k=((Math.round(pos)%n)+n)%n;for(i=0;i<n;i++)dots[i].classList.toggle('on',i===k);
  }
  function go(to){cancelAnimationFrame(anim);var from=pos,t0=performance.now(),dur=420;cur=to;(function st(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);pos=from+(to-from)*e;draw();if(k<1)anim=requestAnimationFrame(st)})(t0)}
  root.addEventListener('pointerdown',function(e){measure();drag=true;decided=false;x0=lastX=e.clientX;y0=e.clientY;p0=pos;id=e.pointerId;lastT=performance.now();v=0;cancelAnimationFrame(anim)});
  root.addEventListener('pointermove',function(e){
    if(!drag)return;var dx=e.clientX-x0,dy=e.clientY-y0;
    if(!decided){if(Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)){decided=true;try{root.setPointerCapture(id)}catch(_){}}else if(Math.abs(dy)>9){drag=false;return}else return}
    var now=performance.now();v=(e.clientX-lastX)/Math.max(1,now-lastT);lastX=e.clientX;lastT=now;
    pos=p0-dx/(W*.76);if(pos>p0+1)pos=p0+1;if(pos<p0-1)pos=p0-1;draw();
  });
  function end(e){if(!drag)return;drag=false;
    if(!decided){ // tap on side card
      var r=root.getBoundingClientRect(),rel=(e.clientX-(r.left+r.width/2))/W;if(rel>.6)go(Math.round(pos)+1);else if(rel<-.6)go(Math.round(pos)-1);return}
    var base=Math.round(p0),dl=pos-p0;
    if(dl>.16||v<-.35)go(base+1);else if(dl<-.16||v>.35)go(base-1);else go(base);
  }
  root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
  addEventListener('resize',function(){measure();draw()});
  measure();draw();
}
carousel($('#car1'),$('#dots1'));carousel($('#car2'),$('#dots2'));

/* ================= buttons ================= */
var toastT;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},2200)}
$('#copy').addEventListener('click',function(){
  var a='Jatin Farm House, Haldaur - Nehtaur Rd, Haldaur Rural, Uttar Pradesh 246726';
  function fb(){try{var ta=document.createElement('textarea');ta.value=a;ta.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,999);var ok=document.execCommand('copy');document.body.removeChild(ta);toast(ok?'Address copied':'Press and hold the address to copy')}catch(e){toast('Press and hold the address to copy')}}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(a).then(function(){toast('Address copied')},fb)}else fb();
});

/* ================= boot / loader ================= */
(function(){
  document.documentElement.classList.add('locked');
  var lb=$('#lb'),loader=$('#loader'),fin=false,n=0;
  var crit=$$('#intro img,#p1 img,#frs img,#strs img');
  var total=crit.length+1;
  function tick(){n++;lb.style.width=Math.min(100,n/total*100)+'%'}
  function wait(p,ms){return Promise.race([p,new Promise(function(r){setTimeout(r,ms)})])}
  function loadImg(im){
    var p=(im.decode?im.decode():new Promise(function(r){im.onload=r;im.onerror=r}));
    return p.catch(function(){}).then(tick);
  }
  var fonts=(document.fonts&&document.fonts.load)?Promise.all([document.fonts.load('600 20px "Playfair Display"'),document.fonts.load('500 14px Montserrat')]).catch(function(){}):Promise.resolve();
  function done(){
    if(fin)return;fin=true;lb.style.width='100%';
    setupObservers();
    loader.classList.add('gone');setTimeout(function(){loader.style.display='none'},700);
    setTimeout(function(){$('#hint').classList.add('on')},350);
    audio.preload='auto';audio.src='assets/music.mp3';audio.load();
  }
  wait(Promise.all(crit.map(loadImg).concat([wait(fonts,1200).then(tick)])),4500).then(done);
  setTimeout(done,6000);
})();
})();
