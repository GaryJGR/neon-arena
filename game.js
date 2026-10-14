// World coordinates stay fixed while the canvas scales with the page.
const canvas = document.querySelector('#arena');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const ui = Object.fromEntries(['time','health','kills','dash','overlay','overlay-title','overlay-copy','overlay-kicker','start','pause','best'].map(id=>[id,document.getElementById(id)]));
const keys = new Set();
const pointer = {x:W/2+100,y:H/2,down:false};
let state='ready', player, enemies=[], bullets=[], particles=[], elapsed=0, kills=0, spawnClock=0, lastTime=0, shake=0;
let best=0;
try { best=Number(localStorage.getItem('neon-arena-best'))||0; } catch {}
ui.best.textContent=best ? `BEST: ${best} ELIMINATIONS` : 'BEST: —';
function reset(){
 player={x:W/2,y:H/2,r:13,hp:100,speed:245,fire:0,dashCooldown:0,dashTime:0,dx:1,dy:0,invulnerable:0};
 enemies=[];bullets=[];particles=[];elapsed=0;kills=0;spawnClock=0;shake=0;pointer.down=false;keys.clear();
 state='playing';ui.overlay.classList.add('hidden');ui.pause.textContent='PAUSE / P';updateHUD();
}
function showOverlay(title,copy,label){ui['overlay-title'].textContent=title;ui['overlay-copy'].textContent=copy;ui.start.innerHTML=`${label} <span>↗</span>`;ui.overlay.classList.remove('hidden');}
function togglePause(){if(state==='playing'){state='paused';pointer.down=false;keys.clear();showOverlay('Take a breath.','Your run is paused. The arena will wait.','RESUME');ui.pause.textContent='RESUME / P';}else if(state==='paused'){state='playing';ui.overlay.classList.add('hidden');ui.pause.textContent='PAUSE / P';}}
function finish(won){state=won?'won':'lost';pointer.down=false;if(kills>best){best=kills;try{localStorage.setItem('neon-arena-best',String(best));}catch{}ui.best.textContent=`BEST: ${best} ELIMINATIONS`;}showOverlay(won?'Protocol complete.':'Signal lost.',`${kills} eliminations · ${elapsed.toFixed(1)} seconds survived. ${won?'You outlasted the swarm.':'Keep moving. Dash through the crowd.'}`,'PLAY AGAIN');}
function burst(x,y,color,n=14){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*190;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.3+Math.random()*0.3,max:0.6,color});}}
function spawn(){const side=Math.floor(Math.random()*4);let x,y;if(side===0){x=-25;y=Math.random()*H;}else if(side===1){x=W+25;y=Math.random()*H;}else if(side===2){x=Math.random()*W;y=-25;}else{x=Math.random()*W;y=H+25;}const fast=elapsed>15&&Math.random()<0.3;enemies.push({x,y,r:fast?11:16,hp:fast?1:2,speed:fast?135+elapsed:65+elapsed*0.9,color:fast?'#ffcd70':'#ff6888'});}
function killEnemy(e){e.dead=true;kills++;burst(e.x,e.y,e.color);}
function update(dt){
 elapsed=Math.min(60,elapsed+dt);player.fire=Math.max(0,player.fire-dt);player.invulnerable=Math.max(0,player.invulnerable-dt);player.dashCooldown=Math.max(0,player.dashCooldown-dt);player.dashTime=Math.max(0,player.dashTime-dt);shake=Math.max(0,shake-dt*30);
 let mx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),my=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const length=Math.hypot(mx,my);if(length){mx/=length;my/=length;}
 if(keys.has(' ')&&player.dashCooldown<=0){const a=Math.atan2(pointer.y-player.y,pointer.x-player.x);player.dx=length?mx:Math.cos(a);player.dy=length?my:Math.sin(a);player.dashTime=0.18;player.dashCooldown=2.4;burst(player.x,player.y,'#71f5cd',8);}
 const dashing=player.dashTime>0;player.x+=(dashing?player.dx*850:mx*player.speed)*dt;player.y+=(dashing?player.dy*850:my*player.speed)*dt;player.x=Math.max(player.r,Math.min(W-player.r,player.x));player.y=Math.max(player.r,Math.min(H-player.r,player.y));
 if(pointer.down&&player.fire<=0){const a=Math.atan2(pointer.y-player.y,pointer.x-player.x);bullets.push({x:player.x+Math.cos(a)*20,y:player.y+Math.sin(a)*20,vx:Math.cos(a)*680,vy:Math.sin(a)*680,r:4,life:1.8});player.fire=0.12;}
 spawnClock-=dt;while(spawnClock<=0){spawn();spawnClock+=Math.max(0.16,0.85-elapsed*0.011);}
 for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;}
 for(const e of enemies){const dx=player.x-e.x,dy=player.y-e.y,len=Math.hypot(dx,dy)||1;e.x+=dx/len*e.speed*dt;e.y+=dy/len*e.speed*dt;
  for(const b of bullets){if(b.life>0&&Math.hypot(b.x-e.x,b.y-e.y)<b.r+e.r){b.life=0;e.hp--;burst(b.x,b.y,e.color,4);if(e.hp<=0){killEnemy(e);break;}}}
  if(!e.dead&&Math.hypot(player.x-e.x,player.y-e.y)<player.r+e.r){if(dashing){killEnemy(e);}else if(player.invulnerable<=0){player.hp=Math.max(0,player.hp-20);player.invulnerable=0.8;shake=7;burst(player.x,player.y,'#ffffff',10);}}
 }
 bullets=bullets.filter(b=>b.life>0&&b.x>-20&&b.x<W+20&&b.y>-20&&b.y<H+20);enemies=enemies.filter(e=>!e.dead);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);updateHUD();if(player.hp<=0)finish(false);else if(elapsed>=60)finish(true);
}
function updateHUD(){ui.time.textContent=(60-elapsed).toFixed(1);ui.health.textContent=`${player.hp}%`;ui.health.style.color=player.hp<=40?'#ff6888':'#edf5ff';ui.kills.textContent=kills;ui.dash.textContent=player.dashCooldown>0?`${player.dashCooldown.toFixed(1)}s`:'READY';}
function draw(){ctx.fillStyle='#0a1220';ctx.fillRect(0,0,W,H);ctx.save();if(shake){ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake);}ctx.strokeStyle='#17283b';ctx.lineWidth=1;for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.strokeStyle='#2e5a65';ctx.strokeRect(8,8,W-16,H-16);
 for(const e of enemies){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(player.y-e.y,player.x-e.x));ctx.fillStyle=e.color;ctx.shadowColor=e.color;ctx.shadowBlur=12;ctx.fillRect(-e.r,-e.r,e.r*2,e.r*2);ctx.shadowBlur=0;ctx.fillStyle='#182031';ctx.fillRect(1,-5,8,10);ctx.restore();}
 ctx.fillStyle='#a9fff0';ctx.shadowColor='#71f5cd';ctx.shadowBlur=10;for(const b of bullets){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;
 if(player){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(Math.atan2(pointer.y-player.y,pointer.x-player.x));ctx.globalAlpha=player.invulnerable>0?0.5+Math.sin(performance.now()/40)*0.3:1;ctx.fillStyle=player.dashTime>0?'#fff':'#71f5cd';ctx.shadowColor='#71f5cd';ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(-12,-12);ctx.lineTo(-7,0);ctx.lineTo(-12,12);ctx.closePath();ctx.fill();ctx.restore();}
 if(state==='playing'){ctx.strokeStyle='#71f5cd';ctx.beginPath();ctx.arc(pointer.x,pointer.y,9,0,Math.PI*2);ctx.moveTo(pointer.x-14,pointer.y);ctx.lineTo(pointer.x-5,pointer.y);ctx.moveTo(pointer.x+5,pointer.y);ctx.lineTo(pointer.x+14,pointer.y);ctx.stroke();}ctx.restore();}
// Fixed simulation steps avoid tunnelling when a browser frame arrives late.
let accumulator=0;const STEP=1/120;
function frame(t){const dt=lastTime?Math.min((t-lastTime)/1000,0.1):0;lastTime=t;if(state==='playing'){accumulator+=dt;while(accumulator>=STEP&&state==='playing'){update(STEP);accumulator-=STEP;}}else accumulator=0;draw();requestAnimationFrame(frame);}
ui.start.addEventListener('click',()=>state==='paused'?togglePause():reset());ui.pause.addEventListener('click',togglePause);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if((k==='p'||k==='escape')&&!e.repeat)togglePause();else keys.add(k);});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)*W/r.width;pointer.y=(e.clientY-r.top)*H/r.height;});canvas.addEventListener('pointerdown',e=>{if(e.button===0&&state==='playing')pointer.down=true;});window.addEventListener('pointerup',()=>pointer.down=false);window.addEventListener('blur',()=>{keys.clear();pointer.down=false;if(state==='playing')togglePause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
requestAnimationFrame(frame);
