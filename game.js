const c=document.getElementById('game'),ctx=c.getContext('2d');
let W,H,dpr,started=false, last=0, speed=0, x=0, miles=0, money=500, roadOffset=0, spawn=0;
let traffic=[];
const keys={left:false,right:false,gas:false,brake:false};
function resize(){dpr=devicePixelRatio||1;W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)} addEventListener('resize',resize);resize();
function bind(id,key){let b=document.getElementById(id);['pointerdown','touchstart'].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();keys[key]=true},{passive:false}));['pointerup','pointercancel','pointerleave','touchend'].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();keys[key]=false},{passive:false}))}
bind('left','left');bind('right','right');bind('gas','gas');bind('brake','brake');
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=true;if(['ArrowRight','d','D'].includes(e.key))keys.right=true;if(['ArrowUp','w','W'].includes(e.key))keys.gas=true;if(['ArrowDown','s','S'].includes(e.key))keys.brake=true});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false;if(['ArrowUp','w','W'].includes(e.key))keys.gas=false;if(['ArrowDown','s','S'].includes(e.key))keys.brake=false});
function road(){return {l:W*.24,r:W*.76}}
function spawnCar(){let r=road(), lanes=4, lane=Math.floor(Math.random()*lanes); traffic.push({lane,y:-120,spd:35+Math.random()*45,color:['#e74c3c','#f1c40f','#9b59b6','#ecf0f1','#2ecc71'][Math.floor(Math.random()*5)]})}
function show(t){let m=document.getElementById('message');m.textContent=t;m.style.opacity=1;clearTimeout(show.t);show.t=setTimeout(()=>m.style.opacity=0,1000)}
function drawCar(px,py,color,scale=1,player=false){
 ctx.save();ctx.translate(px,py);ctx.scale(scale,scale);
 ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,30,26,10,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=color;ctx.roundRect(-20,-38,40,76,9);ctx.fill();
 ctx.fillStyle='#111b';ctx.roundRect(-14,-23,28,25,6);ctx.fill();
 ctx.fillStyle='#bfefff';ctx.roundRect(-12,-20,24,12,4);ctx.fill();
 ctx.fillStyle=player?'#ffffff':'#ffec99';ctx.fillRect(-16,-34,7,4);ctx.fillRect(9,-34,7,4);
 ctx.restore()
}
function frame(t){
 let dt=Math.min(.033,(t-last)/1000||.016);last=t;
 if(started){
   let target=keys.gas?120:keys.brake?20:65;
   speed += (target-speed)*dt*1.8; speed=Math.max(0,Math.min(135,speed));
   if(keys.left)x-=dt*(1.5+speed/60);if(keys.right)x+=dt*(1.5+speed/60);x=Math.max(-.42,Math.min(.42,x));
   roadOffset=(roadOffset+speed*dt*7)%80;
   miles+=speed*dt/3600; money+=speed*dt*.04;
   spawn-=dt;if(spawn<=0){spawnCar();spawn=.7+Math.random()*1.1}
   traffic.forEach(v=>v.y+=(speed-v.spd)*dt*4+70*dt);
   traffic=traffic.filter(v=>v.y<H+150);
   const r=road(), laneW=(r.r-r.l)/4, px=r.l+laneW*(.5+x*2);
   for(const v of traffic){let vx=r.l+laneW*(v.lane+.5);if(Math.abs(vx-px)<38&&Math.abs(v.y-(H-145))<62){show('TRAFFIC!');speed*=.45;money=Math.max(0,money-10);v.y-=80}}
   document.getElementById('speed').textContent=Math.round(speed);
   document.getElementById('miles').textContent=miles.toFixed(1);
   document.getElementById('money').textContent=Math.floor(money);
 }
 draw();
 requestAnimationFrame(frame)
}
function draw(){
 ctx.clearRect(0,0,W,H);
 let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#172b43');g.addColorStop(.42,'#5f9a67');g.addColorStop(1,'#26382b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 let r=road();ctx.fillStyle='#30343a';ctx.fillRect(r.l,0,r.r-r.l,H);
 ctx.fillStyle='#e5e0c8';ctx.fillRect(r.l+6,0,5,H);ctx.fillRect(r.r-11,0,5,H);
 let laneW=(r.r-r.l)/4;ctx.strokeStyle='#b8bcc0';ctx.lineWidth=3;ctx.setLineDash([35,35]);ctx.lineDashOffset=-roadOffset;
 for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(r.l+laneW*i,0);ctx.lineTo(r.l+laneW*i,H);ctx.stroke()}ctx.setLineDash([]);
 // scenery
 for(let y=-80+(roadOffset%80);y<H;y+=80){for(let s=0;s<2;s++){let side=s?1:-1, bx=s?(r.r+40+((y*7)%70)):(r.l-40-((y*5)%70));ctx.fillStyle='#183f28';ctx.beginPath();ctx.arc(bx,y,15,0,7);ctx.fill();ctx.fillStyle='#5b3b24';ctx.fillRect(bx-3,y+10,6,18)}}
 traffic.forEach(v=>{let vx=r.l+laneW*(v.lane+.5);drawCar(vx,v.y,v.color,.78)});
 let px=r.l+laneW*(1.5+x*2);drawCar(px,H-145,'#168dc0',1,true);
}
document.getElementById('play').onclick=()=>{started=true;document.getElementById('menu').classList.add('hidden');show('WELCOME TO THE HIGHWAY')};
requestAnimationFrame(frame);
