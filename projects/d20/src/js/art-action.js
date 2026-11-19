/* Original action-world artwork. Pure Canvas2D; no DOM, network, RNG or simulation writes. */
(function(root){
  'use strict';
  const P={ink:'#091b20',deep:'#10282b',jade:'#65e2c6',gold:'#edc883',paper:'#efe3c5',purple:'#b297e4',copper:'#ad7962'};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0)),mix=(a,b,t)=>a+(b-a)*t;
  const hash=n=>{let h=2166136261;for(const ch of String(n))h=Math.imul(h^ch.charCodeAt(0),16777619);h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);return((h^(h>>>16))>>>0)/4294967296;};
  function poly(c,points,fill,stroke=null,lw=1){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}}
  function line(c,points,color,w=1){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
  function ellipse(c,x,y,rx,ry,fill,stroke=null,lw=1){c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  function rect(c,x,y,w,h,fill,stroke=null,lw=1){if(fill){c.fillStyle=fill;c.fillRect(x,y,w,h);}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
  function round(c,x,y,w,h,r,fill,stroke=null,lw=1){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  function glow(c,x,y,r,color,alpha=.35){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+Math.round(clamp(alpha,0,1)*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  function text(c,str,x,y,size=12,color=P.paper,align='center'){c.font=`600 ${size}px "Microsoft YaHei",Arial,sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(String(str),x,y);}
  function sigil(c,x,y,r,color=P.gold){const p=[];for(let i=0;i<6;i++)p.push([x+Math.cos(i*Math.PI/3-Math.PI/2)*r,y+Math.sin(i*Math.PI/3-Math.PI/2)*r]);poly(c,p,null,color,1);poly(c,[p[0],p[2],p[4]],null,color,.7);poly(c,[p[1],p[3],p[5]],null,color,.7);}
  function spark(c,x,y,r,color=P.gold,angle=0){c.save();c.translate(x,y);c.rotate(angle);poly(c,[[0,-r],[r*.16,-r*.19],[r*.7,-r*.65],[r*.3,0],[r,0],[r*.2,r*.17],[r*.5,r*.7],[0,r*.3],[-r*.24,r],[-r*.28,r*.18],[-r,0],[-r*.2,-r*.1]],color);c.restore();}
  function dimensions(c,o){return {w:Math.max(80,Number(o.width)||c.canvas?.width||960),h:Math.max(80,Number(o.height)||c.canvas?.height||540)};}
  function stateOf(sim){return sim?.state||sim||{};}
  function begin(c,w,h){c.save();c.beginPath();c.rect(0,0,w,h);c.clip();}
  function frame(c,w,h){const g=c.createRadialGradient(w*.5,h*.46,Math.min(w,h)*.21,w*.5,h*.5,Math.max(w,h)*.7);g.addColorStop(0,'#00000000');g.addColorStop(1,'#03121779');c.fillStyle=g;c.fillRect(0,0,w,h);for(const [x,y,sx,sy]of [[12,12,1,1],[w-12,12,-1,1],[12,h-12,1,-1],[w-12,h-12,-1,-1]])line(c,[[x+sx*28,y],[x,y],[x,y+sy*20]],'#b28e5760',1);}
  function person(c,key,x,y,scale=1,{time=0,moving=false,heading=0,player=false}={}){
    c.save();c.translate(x,y);c.scale(scale,scale);
    const phase=moving?Math.sin(time*12):0,col=key==='counsel'?'#b7b0a0':key==='engineer'?'#627e79':key==='broker'?'#776489':'#1d5551';
    ellipse(c,0,2,14,5,'#03171999');if(player){ellipse(c,0,2,17,8,null,P.jade,1.5);ellipse(c,0,2,21,10,null,'#77e5c742',1);}
    line(c,[[-5,-11],[-5-phase*3,0]],'#091c23',7);line(c,[[5,-11],[5+phase*3,0]],'#0d2329',7);line(c,[[-8-phase*3,1],[-2-phase*3,1]],'#b5af94',1.2);line(c,[[3+phase*3,1],[9+phase*3,1]],'#b5af94',1.2);
    poly(c,[[-7,-33],[-13,-23],[-10,-8],[10,-8],[12,-25],[6,-33]],col,'#092126',1.6);
    line(c,[[-11,-27],[-15,-13+phase*2]],col,5);line(c,[[10,-26],[15,-17-phase*2]],col,5);ellipse(c,-15,-11+phase*2,2.5,3,'#d4b993');ellipse(c,15,-16-phase*2,2.5,3,'#d4b993');
    poly(c,[[-5,-33],[0,-23],[5,-33],[3,-18],[-2,-18]],P.paper);line(c,[[0,-24],[0,-12]],key==='broker'?P.purple:P.gold,2);
    ellipse(c,0,-39,8,10,'#d4b994','#0e282c',1);poly(c,[[-8,-39],[-8,-46],[-3,-51],[6,-49],[9,-43],[6,-38],[3,-44],[-4,-45],[-6,-37]],'#18282d');
    if(key==='counsel'){ellipse(c,6,-51,5,4,'#142529');line(c,[[-6,-39],[6,-39]],'#7a7d6e',1);}
    if(key==='engineer'){line(c,[[-7,-40],[6,-40]],'#6c8686',2);line(c,[[-8,-49],[-4,-54],[1,-49],[5,-53]],'#16272c',3);}
    if(key==='broker')poly(c,[[-9,-45],[-10,-32],[-6,-29],[-6,-41],[4,-46],[7,-33],[11,-34],[9,-47],[3,-51]],'#26323c');
    if(Math.abs(heading)<2.2){ellipse(c,-3,-38,1,1.2,'#233432');ellipse(c,3,-38,1,1.2,'#233432');line(c,[[-1,-33],[2,-33]],'#977a63',.8);}
    if(player)poly(c,[[-4,-59],[4,-59],[0,-54]],P.gold);c.restore();
  }
  function plant(c,x,y,r=16){ellipse(c,x+3,y+4,r,r*.5,'#051b2277');ellipse(c,x,y,r*.6,r*.36,'#806b56','#d1b681',1);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ellipse(c,x+Math.cos(a)*r*.44,y-4+Math.sin(a)*r*.3,r*.44,r*.34,['#395e52','#497564','#6e9072'][i%3]);}line(c,[[x,y-3],[x-5,y-10]],'#99b28b',1);}
  function lamp(c,x,y){ellipse(c,x,y+3,8,4,'#081b24aa');line(c,[[x,y],[x,y-44]],'#70857b',3);round(c,x-8,y-52,16,11,3,'#233d3f',P.copper,1);rect(c,x-5,y-49,10,5,P.gold);glow(c,x,y-47,40,P.gold,.26);}
  function floor(c,act,time,world){const W=world.width||960,H=world.height||540;
    rect(c,0,0,W,H,act===1?'#163840':act===2?'#23343a':act===3?'#132d35':'#48534c');
    if(act===1){
      for(let i=0;i<80;i++){const x=hash('waterx'+i)*W,y=hash('watery'+i)*H;line(c,[[x,y],[x+12+hash('waterw'+i)*38,y]],'#7bc7c21c',1);}
      poly(c,[[34,79],[925,79],[940,504],[25,504]],'#2a4141','#8e8870',2);for(let y=88;y<501;y+=19)line(c,[[34,y],[931,y]],y%3?'#64857b33':'#a3a78b3a',1);
      for(let y=88;y<500;y+=38)for(let x=42+(y%76?0:71);x<918;x+=142)line(c,[[x,y],[x,y+19]],'#0a232955',1);
      for(let i=0;i<12;i++)ellipse(c,80+i*74,60,16,3,'#b8a37835');
      // Distant moored boats remain outside the navigable quay.
      for(const x of [105,460,760]){poly(c,[[x-55,18],[x+55,18],[x+39,53],[x-35,53]],'#10252c','#74837a',1);round(c,x-30,8,58,25,6,'#637a77');rect(c,x-19,12,40,10,'#193740');line(c,[[x+3,8],[x+3,-9]],P.copper,1);}
    }else if(act===2){
      for(let y=82;y<H;y+=34)for(let x=32;x<W;x+=34)poly(c,[[x,y],[x+17,y-13],[x+34,y],[x+17,y+13]],((x+y)/34)%2<1?'#42544f':'#324843','#c4b28017',.7);
      round(c,140,200,682,160,40,'#314b48','#a48d63',2);round(c,149,209,664,142,33,null,'#d8ba7029',1);sigil(c,480,280,74,'#9f99714d');
      for(let x=68;x<930;x+=132){round(c,x-32,5,92,62,6,'#0e2933','#8d8262',2);line(c,[[x+14,5],[x+14,67]],'#746f5a',1);for(let i=0;i<5;i++)rect(c,x-20+i*17,25+hash(x+i)*15,7,30,'#c4b48225');}
      for(const x of [195,765]){glow(c,x,39,100,P.gold,.24);for(const dx of [-24,0,24]){line(c,[[x,0],[x+dx,30]],P.copper,1);ellipse(c,x+dx,33,3,5,P.gold);}ellipse(c,x,30,37,8,null,P.gold,1);}
    }else if(act===3){
      for(let x=0;x<W;x+=30)line(c,[[x,0],[x,H]],'#47808017',1);for(let y=0;y<H;y+=30)line(c,[[0,y],[W,y]],'#47808017',1);
      for(let i=0;i<11;i++){const x=45+i*84;line(c,[[x,0],[x,50],[x+18,68],[x+18,490]],i%3?'#385259':'#688474',i%3?2:3);}
      round(c,170,196,620,148,16,'#173b40','#4b928e',1);line(c,[[185,212],[775,212]],'#73d6c047',2);line(c,[[185,327],[775,327]],'#73d6c047',2);sigil(c,480,271,59,'#60dcb166');
      for(let i=0;i<8;i++){round(c,64+i*117,12,67,39,5,'#29474b','#6a827c',1);for(let j=0;j<5;j++)line(c,[[72+i*117,20+j*5],[122+i*117,20+j*5]],'#102b34',2);ellipse(c,70+i*117,55,2,2,P.jade);}
    }else{
      for(let y=70;y<H;y+=38)for(let x=20;x<W;x+=76){rect(c,x,y,74,36,(x+y)%3?'#677363':'#607162','#adad821b',1);}
      for(let i=0;i<8;i++)poly(c,[[100+i*121,0],[150+i*121,0],[510+i*110,H],[445+i*110,H]],'#ead49b19');
      round(c,211,170,538,230,55,'#42645a','#c6ac77',2);sigil(c,480,280,83,'#d3c18477');ellipse(c,480,280,95,95,null,'#c5b48133',1);
      for(let x=70;x<W;x+=135){rect(c,x-17,0,34,71,'#829383','#ccbd88',1);rect(c,x-22,59,44,12,'#4c655a','#b4b890',1);}
      glow(c,775,45,220,P.gold,.26);
    }
  }
  function obstacle(c,o,act){
    const x=Number(o.x)||0,y=Number(o.y)||0,w=Number(o.w)||30,h=Number(o.h)||30,kind=String(o.kind||'');
    ellipse(c,x+w*.53+6,y+h+3,w*.54,9,'#03191f55');
    if(/plant|hedge|tree|花|树/.test(kind)){round(c,x,y,w,h,5,'#5d6b57','#b2a47a',1);for(let py=y+10;py<y+h;py+=23)for(let px=x+12;px<x+w;px+=25)plant(c,px,py,14);return;}
    if(/table|desk|bar|桌/.test(kind)||act===2&&w<200){
      round(c,x,y,w,h,Math.min(18,h*.3),'#1c3034','#a9936e',2);round(c,x+3,y-7,w-6,h,Math.min(18,h*.3),'#b3a784','#e1c99a',1);for(let i=0;i<Math.max(1,w/65);i++){const cx=x+20+i*58;if(cx>x+w-10)break;ellipse(c,cx,y+h*.42,9,4,null,'#ded5b666',1);line(c,[[cx,y+h*.42],[cx,y+h*.42-12]],'#e0d1aa',1);ellipse(c,cx,y+h*.42-14,4,3,null,P.paper,1);}return;
    }
    if(act===3||/server|rack|机/.test(kind)){
      round(c,x,y,w,h,4,'#0d232e','#64837f',2);rect(c,x+4,y-10,w-8,Math.max(12,h-2),'#29464c','#4c756f',1);
      for(let yy=y+2;yy<y+h-14;yy+=13){rect(c,x+9,yy,w-18,8,'#122e39','#44676b',.7);for(let xx=x+14;xx<x+w-15;xx+=12)line(c,[[xx,yy+3],[xx+5,yy+3]],'#6e9189',1);ellipse(c,x+w-14,yy+4,1.7,1.7,Math.floor(yy/13)%3?P.jade:P.gold);}
      line(c,[[x+5,y-10],[x+w-5,y-10]],'#83b7a1',1.2);return;
    }
    if(act===4||/stone|bench|pillar|墙|柱/.test(kind)){
      round(c,x,y,w,h,5,'#476359','#b0b694',1.5);round(c,x+2,y-9,w-4,h,4,'#849782','#e0d0a2',1);rect(c,x+8,y+1,w-16,Math.max(3,h-18),'#768d78');line(c,[[x+7,y+h-7],[x+w-7,y+h-7]],'#c5cba7',1);return;
    }
    if(/customs|warehouse|building/.test(kind)){
      round(c,x,y,w,h,3,'#314b4d','#b9ab83',1.6);rect(c,x+3,y-12,w-6,h*.7,'#536e67','#c3ba92',1);poly(c,[[x-5,y-9],[x+w*.5,y-29],[x+w+5,y-9]],'#2c4e52','#829887',1.4);for(const px of [x+15,x+w-43]){rect(c,px,y+12,28,30,'#192f3b','#ccb882',1);line(c,[[px+14,y+12],[px+14,y+42]],'#99a991',1);rect(c,px+3,y+16,9,22,'#cebd8c55');}round(c,x+w*.43,y+h*.46,w*.2,h*.51,2,'#19333c','#aa9775',1);ellipse(c,x+w*.59,y+h*.73,1.5,1.5,P.gold);line(c,[[x+5,y+h-4],[x+w-5,y+h-4]],P.copper,2);return;
    }
    const color=['#38585d','#625764','#827356'][Math.floor(hash(o.id)*3)];
    round(c,x,y,w,h,3,'#20373c','#969576',1.5);rect(c,x+1,y-8,w-2,h-1,color,'#8fa58d',1);
    for(let xx=x+8;xx<x+w-6;xx+=13)line(c,[[xx,y-3],[xx,y+h-15]],'#142c383e',3);
    line(c,[[x+6,y+h-10],[x+w-6,y+h-10]],'#b5ae86',1.5);rect(c,x+w*.35,y+h*.28,w*.3,Math.min(17,h*.25),'#112b3588','#c3aa71',1);
  }
  function objectiveIcon(c,kind,x,y,color){
    if(/exit/.test(kind)){line(c,[[x-6,y+9],[x-6,y-9],[x+5,y-9],[x+5,y-4]],color,1.6);line(c,[[x-1,y+1],[x+10,y+1],[x+6,y-3]],color,1.6);line(c,[[x+10,y+1],[x+6,y+5]],color,1.6);}
    else if(/car|race|车/.test(kind)){round(c,x-10,y-6,20,12,4,null,color,1.8);line(c,[[x-5,y-6],[x-3,y-11],[x+5,y-11],[x+7,y-6]],color,1.5);ellipse(c,x-6,y+6,2.5,2.5,color);ellipse(c,x+6,y+6,2.5,2.5,color);}
    else if(/npc|talk|person|ally|会|对话/.test(kind)){round(c,x-9,y-8,18,13,4,null,color,1.6);poly(c,[[x-3,y+5],[x-3,y+9],[x+2,y+5]],color);for(let i=-1;i<=1;i++)ellipse(c,x+i*4,y-2,1,1,color);}
    else{poly(c,[[x-6,y-9],[x+3,y-9],[x+8,y-4],[x+8,y+9],[x-6,y+9]],null,color,1.6);line(c,[[x+2,y-9],[x+2,y-3],[x+8,y-3]],color,1);for(let i=0;i<3;i++)line(c,[[x-3,y+i*3],[x+4,y+i*3]],color,1);}
  }
  function objective(c,o,index,active,near,time,reduced,act){
    const x=Number(o.x)||0,y=Number(o.y)||0,done=!!o.completed,locked=!!o.locked,color=done?'#7a9b8e':locked?'#79888a':active?P.gold:P.purple;
    c.save();if(locked)c.globalAlpha=.52;
    if(!done&&!locked){glow(c,x,y-7,active?62:40,color,active?.17:.08);ellipse(c,x,y,active?26:20,active?12:9,null,color,active?2:1);if(active)ellipse(c,x,y,31,15,null,color+'55',1);}
    const isNpc=/npc|talk|person|ally|会|对话/.test(String(o.kind));
    if(isNpc)person(c,o.character||o.key||['counsel','broker','engineer','counsel'][act-1],x,y,.87);
    else if(/exit/.test(String(o.kind))){round(c,x-21,y-22,42,32,5,'#1f3d45',color,1.2);for(let k=0;k<3;k++)line(c,[[x-8,y-14+k*7],[x,y-19+k*7],[x+8,y-14+k*7]],color,1.5);}
    else if(/car|race|车/.test(String(o.kind)))car(c,x,y-17,50,82,'#385d69',{angle:Math.PI*.5,parked:true});
    else{poly(c,[[x-11,y-9],[x+9,y-11],[x+13,y+2],[x-9,y+4]],'#d3c8ab','#b58c5f',1);rect(c,x+4,y-6,5,5,'#ad6354');line(c,[[x-5,y-5],[x+1,y-5]],'#738681',1);}
    const lift=isNpc?64:47,bob=reduced?0:Math.sin(time*2.4+index)*2;
    round(c,x-16,y-lift-15+bob,32,30,7,active?'#2a4343':'#142f38',color,active?2:1);if(done){line(c,[[x-7,y-lift+bob],[x-1,y-lift+6+bob],[x+8,y-lift-6+bob]],color,2);}else if(locked){round(c,x-6,y-lift-1+bob,12,10,2,null,color,1.3);c.beginPath();c.arc(x,y-lift-1+bob,4,Math.PI,0);c.strokeStyle=color;c.stroke();}else objectiveIcon(c,String(o.kind),x,y-lift+bob,color);
    c.restore();
  }
  function exploreCamera(s,w,h){const world=s.world||{width:960,height:540},p=s.player||{x:480,y:300};const scale=w/h<1.25?Math.max(w/500,Math.min(h/600,1.25)):Math.min(w/world.width,h/world.height);const vw=w/scale,vh=h/scale;return{scale,x:clamp(p.x-vw/2,Math.min(0,(world.width-vw)/2),Math.max(0,world.width-vw)),y:clamp(p.y-vh*.60,Math.min(0,(world.height-vh)/2),Math.max(0,world.height-vh)),world};}
  function drone(c,e,time,reduced,hit=false){
    const x=e.x,y=e.y,r=Number(e.radius)||10,bob=reduced?0:Math.sin(time*5+hash(e.id)*6)*1.5,bodyY=y-r*.9+bob;
    ellipse(c,x,y+3,r*1.7,r*.65,'#04171d88');ellipse(c,x,y+3,r*1.2,r*.55,null,'#bb859767',.8);
    for(const side of [-1,1])for(const front of [-1,1]){const dx=side*r*1.25,dy=front*r*.65;line(c,[[x,bodyY],[x+dx,bodyY+dy]],'#b7a68a',2.5);ellipse(c,x+dx,bodyY+dy,r*.72,r*.32,'#1a2938',hit?'#fff0d3':'#927f9e',1.2);const spin=reduced?.35:time*37+front;line(c,[[x+dx-Math.cos(spin)*r*.56,bodyY+dy-Math.sin(spin)*r*.2],[x+dx+Math.cos(spin)*r*.56,bodyY+dy+Math.sin(spin)*r*.2]],'#dbc6a5',1.4);}
    poly(c,[[x-r*.82,bodyY-r*.38],[x,bodyY-r*.9],[x+r*.82,bodyY-r*.38],[x+r*.62,bodyY+r*.45],[x,bodyY+r*.76],[x-r*.62,bodyY+r*.45]],hit?'#e8cfaa':'#6b647c','#d5aa83',1.2);
    ellipse(c,x,bodyY,Math.max(3,r*.36),r*.31,'#ef8f72','#ffd4b0',1);line(c,[[x-r*.48,bodyY-r*.31],[x+r*.48,bodyY-r*.31]],'#182e39',1.5);glow(c,x,bodyY,r*2,'#ed937b',hit?.30:.12);
    if(Number(e.hp)<Number(e.maxHp)){round(c,x-13,y-r*2.6,26,4,2,'#0b202b');round(c,x-12,y-r*2.6+1,24*clamp(e.hp/e.maxHp,0,1),2,1,'#f0b28b');}
  }
  function scrap(c,p,time,reduced){const x=p.x,y=p.y,bob=reduced?0:Math.sin(time*3+hash(p.id)*8)*1.1;glow(c,x,y,22,P.gold,.13);ellipse(c,x,y+4,8,3,'#031a2588');const pts=[];for(let i=0;i<16;i++){const a=i*Math.PI/8,rad=i%2?6:8;pts.push([x+Math.cos(a)*rad,y-3+bob+Math.sin(a)*rad]);}poly(c,pts,'#d7b37a','#f5ddb0',1);ellipse(c,x,y-3+bob,3.3,3.3,'#3b6970','#e7d09a',1);}
  function combatEffects(c,s,time,reduced){
    const p=s.player||{x:480,y:300};
    for(const e of uniqueEvents(s.events)){const age=time-(Number(e.time)||0);if(age<0||age>.85)continue;const phase=reduced?.25:age/.85;
      if(e.type==='shot'&&age<.3&&Number.isFinite(e.toX)&&Number.isFinite(e.toY)){const sx=e.x+10,sy=e.y-24,tx=e.toX,ty=e.toY-9,t=reduced?.70:clamp(age/.12,0,1);c.save();c.globalAlpha=reduced?.8:Math.max(.1,1-age/.3);line(c,[[sx,sy],[tx,ty]],'#edb86d3b',7);line(c,[[sx,sy],[tx,ty]],P.jade,2.2);line(c,[[sx,sy],[tx,ty]],'#fff7d6',.8);spark(c,mix(sx,tx,t),mix(sy,ty,t),reduced?4:6,P.paper,Math.atan2(ty-sy,tx-sx));glow(c,sx,sy,23,P.gold,.25);c.restore();}
      if(e.type==='enemy-hit'&&age<.24){c.save();c.globalAlpha=reduced?.8:1-age/.24;spark(c,e.x,e.y-9,7+phase*9,'#fff1d3',hash(e.id)*5);ellipse(c,e.x,e.y-9,12,7,null,P.gold,1.2);c.restore();}
      if(e.type==='enemy-down'){c.save();c.globalAlpha=reduced?.76:1-phase;glow(c,e.x,e.y-9,34,P.gold,.3);ellipse(c,e.x,e.y-9,13+phase*26,9+phase*16,null,P.jade,1.7);for(let i=0;i<9;i++){const a=i*Math.PI*2/9+hash(e.id)*2,r=7+phase*38,dx=e.x+Math.cos(a)*r,dy=e.y-9+Math.sin(a)*r*.75;spark(c,dx,dy,i%3?3.5:5.5,i%2?P.gold:'#aab1d1',a+phase);line(c,[[dx-Math.cos(a)*6,dy-Math.sin(a)*4],[dx,dy]],P.gold,1);}c.restore();}
      if(e.type==='pickup'){c.save();c.globalAlpha=reduced?.85:1-phase;const t=reduced?.55:clamp(age/.55,0,1),x=mix(e.x,p.x,t),y=mix(e.y,p.y-20,t)-Math.sin(t*Math.PI)*24;line(c,[[e.x,e.y],[x,y]],'#ead29c77',1.4);spark(c,x,y,5,P.gold);text(c,'+'+(e.value||1),p.x+17,p.y-44-(reduced?0:phase*12),12,P.gold);c.restore();}
      if(e.type==='hurt'&&age<.5){c.save();c.globalAlpha=reduced?.65:1-age/.5;ellipse(c,p.x,p.y-13,23+phase*13,27+phase*14,null,'#f0a484',2.2);line(c,[[p.x-24,p.y-16],[p.x-30,p.y-12],[p.x-24,p.y-8]],'#ffd1a2',2);line(c,[[p.x+24,p.y-16],[p.x+30,p.y-12],[p.x+24,p.y-8]],'#ffd1a2',2);c.restore();}
    }
  }
  function drawExplore(c,sim={},options={}){
    const s=stateOf(sim),{w,h}=dimensions(c,options),act=clamp(s.act||1,1,4),time=options.reducedMotion?0:Number(options.time??s.time)||0,p=s.player||{x:480,y:400},cam=exploreCamera(s,w,h),objectives=Array.isArray(s.objectives)?s.objectives:[],obstacles=Array.isArray(s.obstacles)?s.obstacles:[],target=objectives[s.objectiveIndex||0]||objectives.find(v=>!v.completed&&!v.locked);
    begin(c,w,h);rect(c,0,0,w,h,P.ink);c.save();c.scale(cam.scale,cam.scale);c.translate(-cam.x,-cam.y);floor(c,act,time,cam.world);
    const b=s.bounds||{x:42,y:88,w:876,h:402};round(c,b.x-4,b.y-4,b.w+8,b.h+8,8,null,'#0a1f28',8);round(c,b.x-4,b.y-4,b.w+8,b.h+8,8,null,act===3?'#62948b':'#b3a279',1.5);
    for(let x=b.x+8;x<b.x+b.w;x+=73){ellipse(c,x,b.y-5,3,3,P.copper);ellipse(c,x,b.y+b.h+5,3,3,P.copper);}
    const items=obstacles.map(o=>({y:o.y+o.h,paint:()=>obstacle(c,o,act)}));
    const eventTime=Number(options.time??s.time)||0;
    for(const pickup of Array.isArray(s.pickups)?s.pickups:[])items.push({y:pickup.y,paint:()=>scrap(c,pickup,time,options.reducedMotion)});
    for(const enemy of Array.isArray(s.enemies)?s.enemies:[]){if(enemy.hp<=0)continue;const hit=uniqueEvents(s.events).some(e=>e.type==='enemy-hit'&&e.enemyId===enemy.id&&eventTime-e.time>=0&&eventTime-e.time<.18);items.push({y:enemy.y,paint:()=>drone(c,enemy,time,options.reducedMotion,hit)});}
    objectives.forEach((o,i)=>items.push({y:o.y,paint:()=>objective(c,o,i,o===target,Math.hypot(o.x-p.x,o.y-p.y)<=(o.radius||32)+(p.radius||12),time,options.reducedMotion,act)}));
    items.push({y:p.y,paint:()=>person(c,'protagonist',p.x,p.y,1.1,{time,moving:Math.hypot(p.vx||0,p.vy||0)>1,heading:Math.atan2(p.vy||0,p.vx||0),player:true})});
    for(const x of [30,930])for(const y of [134,360])items.push({y,paint:()=>act===1?lamp(c,x,y):plant(c,x,y,17)});
    items.sort((a,b)=>a.y-b.y).forEach(v=>v.paint());
    combatEffects(c,s,eventTime,options.reducedMotion);
    // Context labels are painted after actors so a nearby character cannot hide the interaction cue.
    for(const o of objectives){const near=Math.hypot(o.x-p.x,o.y-p.y)<=(o.radius||32)+(p.radius||12);if(o!==target&&!near)continue;const ready=near&&!o.completed&&!o.locked,color=o.completed?'#8fac9c':o.locked?'#899a9b':P.gold,label=(ready?'可互动 · ':'')+(o.title||'互动点'),width=Math.min(222,Math.max(64,label.length*12+20)),y=ready?Math.max(o.y,p.y)+23:o.y+17;round(c,o.x-width/2,y,width,24,5,'#0a232bfa',color+'aa',1);text(c,label,o.x,y+12,11,color);}
    if(s.target&&Number.isFinite(s.target.x)){ellipse(c,s.target.x,s.target.y,8,4,null,P.jade,1.5);line(c,[[s.target.x-12,s.target.y],[s.target.x+12,s.target.y]],P.jade,1);}
    for(const e of uniqueEvents(s.events)){const age=eventTime-e.time;if(age<0||age>1.1||!/(collect|interact|complete|reward)/.test(e.type))continue;const phase=options.reducedMotion?.3:age/1.1;c.save();c.globalAlpha=1-phase;ellipse(c,e.x,e.y-13,20+phase*32,10+phase*16,null,P.gold,2);for(let i=0;i<8;i++){const a=i*Math.PI/4;spark(c,e.x+Math.cos(a)*(12+phase*30),e.y-20+Math.sin(a)*(8+phase*21),4,P.jade,a);}c.restore();}
    if(act===1&&!options.reducedMotion){c.save();c.globalAlpha=.18;for(let i=0;i<75;i++){const rx=(hash('rx'+i)*1040+time*11)%1040-30,ry=(hash('ry'+i)*590+time*114)%590-20;line(c,[[rx,ry],[rx-4,ry+11]],'#b3e4df',.6);}c.restore();}
    c.restore();
    // The arrow points to the real target. It does not suggest a walkable path through obstacles.
    if(target&&!target.completed){const tx=(target.x-cam.x)*cam.scale,ty=(target.y-cam.y)*cam.scale;const off=tx<48||tx>w-48||ty<85||ty>h-55;if(off){const px=(p.x-cam.x)*cam.scale,py=(p.y-cam.y)*cam.scale,dx=tx-px,dy=ty-py,t=Math.min((w*.5-39)/Math.max(1,Math.abs(dx)),(h*.5-69)/Math.max(1,Math.abs(dy)),1),ax=clamp(px+dx*t,36,w-36),ay=clamp(py+dy*t,57,h-45);c.save();c.translate(ax,ay);c.rotate(Math.atan2(dy,dx));poly(c,[[13,0],[-7,-8],[-3,0],[-7,8]],P.gold,'#18333a',2);c.restore();text(c,'目标',ax,ay+23,10,P.gold);}}
    frame(c,w,h);c.restore();
  }
  function uniqueEvents(events){const seen=new Set();return(Array.isArray(events)?events:[]).filter((e,i)=>{const id=e.id??('unidentified-'+i);if(seen.has(id))return false;seen.add(id);return true;});}
  // All world positions, including the player's, share this projection. Road boundaries stay exact.
  function raceProjection(s,x,y,w=960,h=540){s=stateOf(s);const road=s.road||{left:230,right:730,top:0,bottom:540},q=(y-(road.top||0))/((road.bottom||540)-(road.top||0)),horizon=h*.265,depth=.12+.88*Math.pow(Math.max(0,q),1.10),viewWidth=Math.max(w,h*1.28),r=viewWidth*.52*depth,mid=(road.left+road.right)/2,half=(road.right-road.left)/2,follow=w/h<1.28?.82:0,anchorQ=((s.player?.y||400)-(road.top||0))/((road.bottom||540)-(road.top||0)),anchorR=viewWidth*.52*(.12+.88*Math.pow(Math.max(0,anchorQ),1.10)),center=w*.5-((s.player?.x??mid)-mid)/half*anchorR*follow;return{x:center+(x-mid)/half*r,y:horizon+(h-horizon)*Math.sign(q)*Math.pow(Math.abs(q),1.65),r,center,scale:2*r/(road.right-road.left),depth};}
  function projectedCarHeight(s,y,height,w,h){return raceProjection(s,480,y+height/2,w,h).y-raceProjection(s,480,y-height/2,w,h).y;}
  function screenToWorld(sim,x,y,w=960,h=540){const s=stateOf(sim);if(/race|racing/.test(s.mode||sim.mode||'')){const road=s.road||{left:230,right:730,top:0,bottom:540},v=(y-h*.265)/(h*.735),q=Math.sign(v)*Math.pow(Math.abs(v),1/1.65),wy=(road.top||0)+q*((road.bottom||540)-(road.top||0)),p=raceProjection(s,480,wy,w,h);return{x:(road.left+road.right)/2+(x-p.center)/p.r*(road.right-road.left)/2,y:wy};}const cam=exploreCamera(s,w,h);return{x:cam.x+x/cam.scale,y:cam.y+y/cam.scale};}
  function corridorState(sim){
    if(typeof sim?.corridor==='function')return sim.corridor();
    const s=stateOf(sim),time=Math.max(0,Number(s.time)||0),seed=Number(s.seed)>>>0;
    if(time<4)return{active:false,center:480,nextCenter:480,halfWidth:250,warning:false,safe:true,phase:0,remaining:4-time};
    const elapsed=time-4,phase=Math.floor(elapsed/7),within=elapsed%7,order=[0,3,1,4,2],lanes=[280,380,480,580,680],offset=(seed+(s.act||1)*3)%5,center=lanes[order[(phase+offset)%5]],nextCenter=lanes[order[(phase+1+offset)%5]],halfWidth=96+(s.build?.rooms?.command||0)*12;
    return{active:true,center,nextCenter,halfWidth,warning:within>=5.3,safe:Math.abs((s.player?.x??480)-center)<=halfWidth,phase:phase+1,remaining:7-within};
  }
  function bandPath(c,s,left,right,w,h){c.beginPath();for(let i=0;i<=30;i++){const p=raceProjection(s,left,i*18,w,h);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);}for(let i=30;i>=0;i--){const p=raceProjection(s,right,i*18,w,h);c.lineTo(p.x,p.y);}c.closePath();}
  function stormRoad(c,s,zone,w,h,reduced){
    if(!zone.active)return;const road=s.road||{left:230,right:730},left=Math.max(road.left,zone.center-zone.halfWidth),right=Math.min(road.right,zone.center+zone.halfWidth),t=reduced?0:Number(s.time)||0;
    for(const [a,b]of [[road.left,left],[right,road.right]]){if(b<=a)continue;c.save();bandPath(c,s,a,b,w,h);c.clip();rect(c,0,h*.265,w,h*.735,'#8e5bb24c');
      for(let i=0;i<20;i++){const wx=mix(a,b,hash('fogx'+i)),wy=(hash('fogy'+i)*600+t*14)%600,p=raceProjection(s,wx,wy,w,h);glow(c,p.x,p.y,Math.max(12,45*p.scale),'#b18bcc',.15);}
      for(let y=50;y<570;y+=48)for(let x=a-20;x<b;x+=52){const q=raceProjection(s,x,y,w,h),p=raceProjection(s,x+24,y-15,w,h);line(c,[[q.x,q.y],[p.x,p.y]],'#e0afcf3a',Math.max(1,q.scale*1.4));}c.restore();}
    bandPath(c,s,left,right,w,h);c.fillStyle='#55cfaa3a';c.fill();
    for(const x of [left,right]){const points=[];for(let y=0;y<=540;y+=18){const p=raceProjection(s,x,y,w,h);points.push([p.x,p.y]);}line(c,points,'#7ef5cf',2);line(c,points,'#bdffe74c',6);}
    for(let i=0;i<8;i++){const y=((i*73+(reduced?0:(s.distance||0)*.72))%590)-25;if(y<20||y>535)continue;const a=raceProjection(s,zone.center-15,y+7,w,h),b=raceProjection(s,zone.center,y-7,w,h),d=raceProjection(s,zone.center+15,y+7,w,h);line(c,[[a.x,a.y],[b.x,b.y],[d.x,d.y]],'#b4ffd987',Math.max(1,b.scale*1.6));}
    if(zone.warning){const nl=Math.max(road.left,zone.nextCenter-zone.halfWidth),nr=Math.min(road.right,zone.nextCenter+zone.halfWidth);c.save();bandPath(c,s,nl,nr,w,h);c.fillStyle='#ffcf7414';c.fill();c.setLineDash([8,7]);c.strokeStyle=P.gold;c.lineWidth=2;c.stroke();c.restore();
      const cur=raceProjection(s,zone.center,200,w,h),next=raceProjection(s,zone.nextCenter,200,w,h);c.save();c.setLineDash([4,5]);line(c,[[cur.x,cur.y-18],[next.x,next.y-18]],P.gold,1.5);c.restore();const sign=Math.sign(next.x-cur.x)||1;poly(c,[[next.x,next.y-18],[next.x-sign*9,next.y-23],[next.x-sign*9,next.y-13]],P.gold);
    }
  }
  function stormLabels(c,s,zone,w,h){if(!zone.active)return;const road=s.road||{left:230,right:730},label=raceProjection(s,clamp(zone.center,road.left+35,road.right-35),502,w,h),lx=clamp(label.x,70,w-70);round(c,lx-56,label.y-10,112,22,5,'#153b3df2','#88e8c3',1);text(c,'安全走廊',lx,label.y+1,12,'#bcffe4');if(zone.warning){const next=raceProjection(s,zone.nextCenter,200,w,h),nx=clamp(next.x,92,w-92),ny=next.y-42;round(c,nx-83,ny-12,166,24,5,'#38372cf8',P.gold,1);text(c,zone.remaining.toFixed(1)+'秒后 · 走廊'+(zone.nextCenter>zone.center?'右移':'左移'),nx,ny,12,P.gold);}}
  function stormErosion(c,s,zone,point,w,h,reduced){
    if(!zone.active||zone.safe)return;const r=28*point.scale,t=reduced?0:Number(s.time)||0;glow(c,point.x,point.y,r*2,'#bb8de7',.2);
    for(const side of [-1,1]){const x=point.x+side*r*.8,yy=point.y-r*.15,shift=reduced?0:Math.sin(t*5+side)*r*.08;line(c,[[x,yy-r*.6],[x+side*r*.15,yy-r*.27],[x-side*r*.06,yy+shift],[x+side*r*.1,yy+r*.29]],'#d4b7f1',1.7);ellipse(c,x,yy+r*.5,2.4,2.4,'#d3b2ed');}
    const x=clamp(point.x,78,w-78),y=point.y+r*1.22;round(c,x-65,y,130,21,5,'#2d253bee','#ba95db',1);text(c,'夜雾 · 能量侵蚀',x,y+11,11,'#ddc3f4');
  }
  function car(c,x,y,w,h,color=P.jade,{angle=0,player=false,glowPower=0,squash=0,parked=false}={}){
    c.save();c.translate(x,y);c.rotate(angle);c.scale(1+squash*.15,1-squash*.12);const W=w,H=h;
    ellipse(c,0,H*.15,W*.65,H*.49,'#00151cc0');if(glowPower)glow(c,0,H*.12,W*1.5,P.jade,glowPower*.34);
    // Tires, substantial bumper frame and tailored coupé body distinguish the vehicles from tiles.
    for(const side of [-1,1])for(const yy of [-.26,.26])round(c,side*W*.44-W*.11,yy*H-H*.12,W*.22,H*.24,W*.05,'#081821','#71817e',W*.018);
    round(c,-W*.52,-H*.46,W*1.04,H*.95,W*.23,'#112d34','#c0ab81',W*.035);
    const paint=c.createLinearGradient(-W*.5,0,W*.5,0);paint.addColorStop(0,'#173039');paint.addColorStop(.19,color);paint.addColorStop(.55,color);paint.addColorStop(1,'#193842');
    poly(c,[[-W*.37,-H*.46],[W*.37,-H*.46],[W*.47,-H*.27],[W*.46,H*.34],[W*.32,H*.46],[-W*.32,H*.46],[-W*.46,H*.34],[-W*.47,-H*.27]],paint,'#0a2029',W*.025);
    poly(c,[[-W*.28,-H*.25],[W*.28,-H*.25],[W*.34,-H*.04],[-W*.34,-H*.04]],'#0e2c3a','#94c3bb',W*.015);
    poly(c,[[-W*.29,H*.05],[W*.29,H*.05],[W*.25,H*.24],[-W*.25,H*.24]],'#11313f','#648f91',W*.015);
    round(c,-W*.28,-H*.035,W*.56,H*.14,W*.045,color,'#8eb5ac',W*.018);
    line(c,[[-W*.37,-H*.30],[-W*.32,H*.30]],'#e2e4bd75',W*.015);line(c,[[W*.37,-H*.30],[W*.32,H*.30]],'#091e3255',W*.025);
    for(const side of [-1,1]){round(c,side*W*.25-W*.12,-H*.43,W*.24,H*.045,W*.018,'#f9eed0');round(c,side*W*.28-W*.10,H*.38,W*.20,H*.038,W*.015,player?'#ffa673':'#e3a472');}
    line(c,[[-W*.41,H*.45],[W*.41,H*.45]],'#bda987',W*.055);line(c,[[-W*.41,-H*.45],[W*.41,-H*.45]],'#a9c8b5',W*.04);
    if(player){rect(c,-W*.052,-H*.43,W*.104,H*.14,'#e7d49e');rect(c,-W*.052,H*.28,W*.104,H*.105,'#e7d49e');sigil(c,0,H*.065,W*.1,'#eee1b8');line(c,[[-W*.37,H*.28],[W*.37,H*.28]],'#112c36',W*.09);line(c,[[-W*.39,H*.25],[W*.39,H*.25]],'#c3b18c',W*.028);}
    if(!parked){const beam=c.createLinearGradient(0,-H*.4,0,-H*1.13);beam.addColorStop(0,'#dceccd27');beam.addColorStop(1,'#dceccd00');for(const side of [-1,1])poly(c,[[side*W*.28-W*.1,-H*.43],[side*W*.28+W*.1,-H*.43],[side*W*.28+W*.38,-H*1.1],[side*W*.28-W*.38,-H*1.1]],beam);}
    c.restore();
  }
  function city(c,w,h,time,act){const hy=h*.265;const sky=c.createLinearGradient(0,0,0,hy);sky.addColorStop(0,act===4?'#303d54':'#122137');sky.addColorStop(.7,act===4?'#967968':'#3e4964');sky.addColorStop(1,act===4?'#e6c793':'#647b7d');rect(c,0,0,w,h,sky);glow(c,w*.76,hy*.48,w*.13,act===4?P.gold:P.purple,.23);ellipse(c,w*.76,hy*.45,w*.026,w*.026,act===4?'#f0d5a2':'#bdc6ba');
    for(let layer=0;layer<3;layer++)for(let i=0;i<36;i++){const bw=w*(.018+hash('bw'+i)*.027),bh=hy*(.13+hash('bh'+layer+i)*(.47+layer*.10)),x=(i/34)*w-bw*.3,y=hy-bh;rect(c,x,y,bw,bh,['#394a5b','#293e50','#19333f'][layer]);if(i%6===0)poly(c,[[x,y],[x+bw*.5,y-bw*.28],[x+bw,y]],'#24434c');if(layer===2)for(let row=0;row<bh/7;row++)for(let col=0;col<3;col++)if(hash(i+':'+row+':'+col)>.58)rect(c,x+4+col*bw*.25,y+5+row*7,Math.max(1,bw*.07),2,i%3?P.gold:'#79d5cd');}
    const haze=c.createLinearGradient(0,hy-20,0,hy+40);haze.addColorStop(0,'#709b9d00');haze.addColorStop(.5,'#709b9d55');haze.addColorStop(1,'#709b9d00');rect(c,0,hy-20,w,60,haze);
  }
  function roadWorld(c,s,w,h,time,reduced){const road=s.road||{left:230,right:730,top:0,bottom:540},d=Number(s.distance)||0;rect(c,0,h*.265,w,h*.735,'#142e38');
    for(let i=60;i>0;i--){const ya=(i-1)*9,yb=i*9,a=raceProjection(s,road.left,ya,w,h),b=raceProjection(s,road.right,yb,w,h),ar=a.r,br=b.r,ax=a.center,bx=b.center,stripe=Math.floor((d*.45+ya)/28)%2;
      poly(c,[[ax-ar*1.09,a.y-.5],[ax+ar*1.09,a.y-.5],[bx+br*1.09,b.y+.7],[bx-br*1.09,b.y+.7]],stripe?'#7f8177':'#bbb18b');
      poly(c,[[ax-ar,a.y-.5],[ax+ar,a.y-.5],[bx+br,b.y+.7],[bx-br,b.y+.7]],stripe?'#243d48':'#263f4a');
      for(const side of [-1,1]){poly(c,[[ax+ar*side*.967-ar*.007,a.y],[ax+ar*side*.967+ar*.007,a.y],[bx+br*side*.967+br*.007,b.y],[bx+br*side*.967-br*.007,b.y]],'#bbcaad');}
      if(Math.floor((ya+d*.65)/31)%3!==0)for(const frac of [-.6,-.2,.2,.6])poly(c,[[ax+ar*frac-ar*.006,a.y],[ax+ar*frac+ar*.006,a.y],[bx+br*frac+br*.006,b.y],[bx+br*frac-br*.006,b.y]],'#cdd2b996');
      for(const f of [-.8,-.4,0,.4,.8])poly(c,[[ax+ar*f-ar*.014,a.y],[ax+ar*f+ar*.014,a.y],[bx+br*f+br*.014,b.y],[bx+br*f-br*.014,b.y]],'#071a2429');
    }
    for(let i=0;i<16;i++){const yy=((i*47+d*.85)%640)-50;if(yy<5)continue;const p=raceProjection(s,road.left,yy,w,h);for(const side of [-1,1]){const x=p.center+side*p.r*1.12,lh=72*p.scale;line(c,[[x,p.y],[x,p.y-lh]],'#6b8b89',Math.max(1,p.scale*2.5));line(c,[[x,p.y-lh],[x-side*22*p.scale,p.y-lh-5*p.scale]],P.copper,Math.max(1,p.scale*2));ellipse(c,x-side*22*p.scale,p.y-lh-3*p.scale,8*p.scale,2.5*p.scale,P.gold);glow(c,x-side*22*p.scale,p.y-lh,29*p.scale,P.gold,.18);}}
    // Tall near-city blocks, copper rails and reflected lights frame the driving lane.
    for(let i=0;i<11;i++){const y=25+i*49,p=raceProjection(s,road.left,y,w,h);for(const side of [-1,1]){const x=p.center+side*p.r*1.25,bw=36*p.scale,bh=(70+hash(side+'block'+i)*110)*p.scale;rect(c,x-(side<0?bw:0),p.y-bh,bw,bh,'#17353f','#38575b',Math.max(.5,p.scale));for(let row=0;row<5;row++)line(c,[[x-side*bw*.18,p.y-bh+13*p.scale+row*14*p.scale],[x-side*bw*.77,p.y-bh+13*p.scale+row*14*p.scale]],i%3?P.gold+'66':P.purple+'88',Math.max(1,p.scale*2));}}
  }
  function raceEffects(c,s,events,point,w,h,time,reduced){
    const labelEvent=events.filter(e=>e.type==='absorb').reduce((best,e)=>!best||e.time>=best.time?e:best,null);
    for(const e of events){const age=time-(Number(e.time)||0);if(age<0||age>.9)continue;const p=raceProjection(s,Number(e.x)||s.player?.x||480,Number(e.y)||s.player?.y||400,w,h),phase=reduced?.27:age/.9,side=e.side===-1?-1:1,base=28*p.scale;
      if(/bump|wall/.test(e.type)){const f=1-clamp(age/.5,0,1);if(f<=0)continue;c.save();c.globalAlpha=reduced?.9:f;ellipse(c,p.x,p.y,base*(1+phase*4),base*(.65+phase*2),null,P.gold,Math.max(1,3*p.scale));for(let i=0;i<12;i++){const a=i*Math.PI/6+hash(e.id)*3,r=base*(.5+phase*4);line(c,[[p.x+Math.cos(a)*r*.65,p.y+Math.sin(a)*r*.65],[p.x+Math.cos(a)*r,p.y+Math.sin(a)*r]],i%3?P.gold:P.paper,Math.max(1,2*p.scale));}spark(c,p.x,p.y,base*.55,P.paper,phase);c.restore();}
      if(/absorb/.test(e.type)){c.save();const f=1-phase;glow(c,point.x,point.y,base*3,P.jade,.22*f);if(!reduced){const t=clamp(phase/.34,0,1),pull=clamp((phase-.3)/.7,0,1),lift=Math.sin(t*Math.PI*.5),gx=mix(p.x+side*base*1.5*lift,point.x,pull*pull),gy=mix(p.y-base*1.8*lift,point.y,pull*pull);c.globalAlpha=f;car(c,gx,gy,(e.width||34)*p.scale*(1-pull),projectedCarHeight(s,e.y||400,e.height||64,w,h)*(1-pull),e.color||P.purple,{angle:side*(lift*.8+pull*4),glowPower:.5});}
        for(const sign of [-1,1]){const cx=(p.x+point.x)*.5+sign*base*2,cy=Math.min(p.y,point.y)-base*2;c.globalAlpha=reduced?.7:f*.7;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(cx,cy,point.x,point.y);c.strokeStyle=sign<0?P.jade:P.gold;c.lineWidth=Math.max(1,2*p.scale);c.stroke();for(let i=0;i<7;i++){const t=reduced?.12+i*.13:clamp(phase*2-i*.08,0,1);if(t<=0||t>=1)continue;const x=(1-t)**2*p.x+2*(1-t)*t*cx+t*t*point.x,y=(1-t)**2*p.y+2*(1-t)*t*cy+t*t*point.y;spark(c,x,y,(i%3?2:4)*p.scale,sign<0?P.jade:P.gold,t);}}
        c.globalAlpha=reduced?.8:f;ellipse(c,point.x,point.y,base*(1.3+phase),base*(.8+phase*.5),null,P.jade,Math.max(1,2*p.scale));
        if(e.precise){glow(c,point.x,point.y,base*3.6,'#fff0bd',.28);for(let i=0;i<3;i++)ellipse(c,point.x,point.y,base*(1.3+phase+i*.28),base*(.8+phase*.5+i*.17),null,i===1?'#fffbe3':'#f6ce80',Math.max(1.5,(3-i*.5)*p.scale));for(let i=0;i<10;i++){const a=i*Math.PI/5;spark(c,point.x+Math.cos(a)*base*1.8,point.y+Math.sin(a)*base*1.08,4.5*p.scale,'#fff4ce',a);}if(e===labelEvent){const x=clamp(point.x,91,w-91),y=point.y-base*3.8;round(c,x-83,y,166,27,5,'#4c3c28ee','#fff0bd',1.4);text(c,'精准吸收'+((e.combo||s.combo)>1?' · '+(e.combo||s.combo)+' 连撞':''),x,y+14,13,'#fff2c5');}}
        else if(e===labelEvent&&(e.combo||s.combo)>1){const n=e.combo||s.combo;round(c,point.x-39,point.y-base*3.8,78,26,5,'#0c2835d9',P.gold,1);text(c,n+' 连撞',point.x,point.y-base*3.8+13,13,P.gold);}c.restore();}
    }
  }
  function drawRace(c,sim={},options={}){
    const s=stateOf(sim),{w,h}=dimensions(c,options),p=s.player||{x:480,y:400},time=Number(options.time??s.time)||0,reduced=!!options.reducedMotion,animTime=reduced?0:time,events=uniqueEvents(s.events),recent=events.filter(e=>time-e.time>=0&&time-e.time<.9),hit=recent.filter(e=>/bump|wall/.test(e.type)).sort((a,b)=>b.time-a.time)[0],age=hit?time-hit.time:10,punch=reduced?0:Math.max(0,1-age/.19),playerPoint=raceProjection(s,p.x,p.y,w,h);
    const zone=corridorState(sim);
    begin(c,w,h);city(c,w,h,animTime,Number(s.act)||1);c.save();if(punch)c.translate(Math.sin(age*87+1)*punch*Math.min(3,w*.005),Math.cos(age*62)*punch*1.5);roadWorld(c,s,w,h,animTime,reduced);stormRoad(c,s,zone,w,h,reduced);
    const traffic=(Array.isArray(s.traffic)?s.traffic:[]).filter(v=>!v.absorbed&&Number(v.y)>-55&&Number(v.y)<620),actors=traffic.map(v=>({v,player:false}));actors.push({v:p,player:true});actors.sort((a,b)=>a.v.y-b.v.y);
    for(const a of actors){const v=a.v,at=raceProjection(s,v.x,v.y,w,h),cw=(Number(v.width)||34)*at.scale,ch=projectedCarHeight(s,v.y,Number(v.height)||64,w,h);const power=a.player&&recent.some(e=>/absorb/.test(e.type))?.65:0,lean=reduced?0:clamp(v.vx||0,-240,240)*.00045+(a.player?Math.sin(age*28)*Math.exp(-age*6)*(hit?.side||1)*.1:0);car(c,at.x,at.y,cw,ch,a.player?'#62c3b5':v.color||['#b78bc6','#c2b08a','#538995','#779a7e'][Math.floor(hash(v.id)*4)],{angle:lean,player:a.player,glowPower:power,squash:a.player?punch:0});
      if(a.player){const tail=ch*.59;for(const side of [-1,1]){const flame=(s.boosting?24:5)+(reduced?0:Math.sin(time*31+side)*3);poly(c,[[at.x+side*cw*.24-cw*.065,at.y+tail*.8],[at.x+side*cw*.24+cw*.065,at.y+tail*.8],[at.x+side*cw*.24,at.y+tail+flame*at.scale]],P.jade+'99');}ellipse(c,at.x,at.y+ch*.5,cw*.56,cw*.16,null,P.gold+'aa',1);}
    }
    raceEffects(c,s,recent,playerPoint,w,h,time,reduced);
    stormErosion(c,s,zone,playerPoint,w,h,reduced);
    stormLabels(c,s,zone,w,h);
    if(!reduced&&(s.speed||0)>130){c.save();c.globalAlpha=clamp(((s.speed||0)-130)/140,0,.22);for(let i=0;i<18;i++){const side=i%2?-1:1,x=w*.5+side*w*(.34+hash(i)*.17),y=(hash('speed'+i)*h+time*210)%h;line(c,[[x,y],[x+side*12,y+22+hash('len'+i)*39]],i%3?P.jade:P.gold,1);}c.restore();}
    c.restore();frame(c,w,h);c.restore();
  }
  function draw(c,sim={},options={}){const s=stateOf(sim);return /race|racing/.test(options.mode||s.mode||sim.mode||'')?drawRace(c,sim,options):drawExplore(c,sim,options);}
  const api={draw,drawExplore,drawRace,projectRace:raceProjection,screenToWorld,exploreCamera,corridorState};root.SunD20ActionArt=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
