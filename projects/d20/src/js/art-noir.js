/* Original financial-noir scene art. Canvas only; no DOM, assets, or mutable particles. */
(function(root){
  'use strict';
  const INK='#101f20',IVORY='#e8dec5',COPPER='#ac8964',VERMILION='#aa5146';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0)),lerp=(a,b,t)=>a+(b-a)*t;
  const hash=n=>{let h=2166136261;for(const ch of String(n))h=Math.imul(h^ch.charCodeAt(0),16777619);h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);return((h^(h>>>16))>>>0)/4294967296;};
  function poly(c,p,fill,stroke=null,w=1){c.beginPath();c.moveTo(...p[0]);for(let i=1;i<p.length;i++)c.lineTo(...p[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.lineJoin='round';c.stroke();}}
  function line(c,p,color,width=1){c.beginPath();c.moveTo(...p[0]);for(let i=1;i<p.length;i++)c.lineTo(...p[i]);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
  function ellipse(c,x,y,rx,ry,fill,stroke=null,w=1){c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
  function rect(c,x,y,w,h,fill,stroke=null,lw=1){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
  function rounded(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  function glow(c,x,y,r,color,alpha=.3){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+Math.round(alpha*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  function motif(c,x,y,r,color,alpha=.35){c.save();c.globalAlpha=alpha;ellipse(c,x,y,r,r,null,color,.7);const p=[];for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}poly(c,p,null,color,.8);poly(c,[p[0],p[2],p[4]],null,color,.8);poly(c,[p[1],p[3],p[5]],null,color,.6);for(const [px,py]of p)ellipse(c,px,py,1.8,1.8,color);c.restore();}
  function skyline(c,y,width,seed,color){c.fillStyle=color;for(let i=0;i<35;i++){const x=i*width/33-20,w=12+hash(seed+'w'+i)*25,h=25+hash(seed+'h'+i)*94;c.fillRect(x,y-h,w,h);if(i%6===0){c.fillRect(x+w*.46,y-h-23,2,23);poly(c,[[x,y-h],[x+w*.52,y-h-10],[x+w,y-h]],color);}c.fillStyle='#c7b28b';c.globalAlpha=.35;for(let row=0;row<h/9;row++)for(let col=0;col<3;col++)if(hash(seed+i+':'+row+':'+col)>.64)c.fillRect(x+4+col*w*.25,y-h+6+row*9,1.8,2.5);c.globalAlpha=1;c.fillStyle=color;}}
  function papers(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(-.09);poly(c,[[-43,-23],[42,-27],[53,20],[-33,27]],'#b9b09b','#665d4e',.6);poly(c,[[-46,-29],[40,-30],[44,17],[-39,20]],'#d9cfb7','#e9dfc6',.7);line(c,[[-32,-17],[15,-18]],'#929382',1);line(c,[[-31,-11],[24,-12]],'#adab95',.8);line(c,[[-31,-5],[15,-6]],'#adab95',.8);rect(c,18,1,12,11,'#a65546');line(c,[[20,3],[28,9]],'#d29b79',.7);line(c,[[50,-14],[25,31]],'#ad8b60',3);line(c,[[49,-13],[29,24]],'#212f2c',1.3);c.restore();}
  function human(c,key,x,y,scale=1,mood='neutral',scene=false){
    if(key==='sun')key='protagonist';if(!['protagonist','counsel','engineer','broker'].includes(key))key='protagonist';
    const female=key==='counsel'||key==='broker',tense=/tense|negative|angry|hostile/.test(mood),warm=/warm|positive|friendly/.test(mood);
    const skin=key==='engineer'?'#c0b49d':key==='broker'?'#bd9c80':'#c5aa88';
    const hair=key==='broker'?'#243030':key==='counsel'?'#202b29':'#172725';
    c.save();c.translate(x,y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
    // Adult tailoring and planar faces; every design is fictional and original.
    const coat=key==='counsel'?'#b5b09c':key==='engineer'?'#4a5d58':key==='broker'?'#273a39':'#1d3833';
    const dark=key==='counsel'?'#6f7d70':key==='engineer'?'#2d403e':'#122b29';
    const suit=c.createLinearGradient(-55,0,55,95);suit.addColorStop(0,coat);suit.addColorStop(.55,dark);suit.addColorStop(1,'#0d2323');
    poly(c,[[-17,-25],[-49,-8],[-65,29],[-77,105],[72,105],[58,25],[43,-9],[16,-26]],suit,scene?'#658679':'#102522',scene?.8:1.2);
    poly(c,[[-45,-6],[-57,40],[-61,105],[-39,105],[-27,17]],dark,null);poly(c,[[38,-6],[54,44],[62,105],[42,105],[27,10]],dark,null);
    poly(c,[[-11,-32],[-12,-12],[0,4],[14,-12],[13,-33]],skin,null);
    poly(c,[[-18,-22],[-2,1],[19,-21],[20,-6],[1,43],[-20,-6]],key==='broker'?'#b69876':'#d8d1b8',null);
    if(key==='protagonist'){
      poly(c,[[-4,0],[5,0],[10,53],[0,65],[-8,52]],'#6e9280');poly(c,[[-23,-18],[-6,30],[-24,17],[-32,27],[-39,-6]],'#33564a');poly(c,[[20,-17],[7,29],[25,17],[35,26],[36,-7]],'#1a3933');
      line(c,[[-28,-6],[-16,17]],'#91a491',.7);line(c,[[24,-4],[14,18]],'#5b7969',.7);poly(c,[[27,19],[39,17],[35,27]],'#c5b899');
      rounded(c,21,45,21,3,1,'#0d2525');
    }else if(key==='counsel'){
      poly(c,[[-20,-24],[-4,4],[7,6],[21,-24],[17,0],[8,20],[-4,13],[-16,-1]],'#6b8277');
      poly(c,[[-5,3],[7,6],[1,58],[-11,53]],'#ae8565');line(c,[[-29,-11],[-20,17],[-29,24]],'#ddd3b6',1);line(c,[[26,-9],[15,18],[26,25]],'#cbc4ac',.8);ellipse(c,27,12,3,3,'#a9855a');
    }else if(key==='engineer'){
      poly(c,[[-15,-22],[0,1],[16,-22],[12,10],[-11,11]],'#84928a');line(c,[[0,10],[0,103]],'#a6ad96',1.2);rect(c,-41,27,21,24,'#354c47','#74867a',.8);line(c,[[-34,17],[-32,42]],'#bfa16f',2);line(c,[[-28,18],[-28,42]],'#a8c3b5',1.6);
      line(c,[[32,-6],[43,26]],'#6b8174',1);line(c,[[-30,-8],[-42,25]],'#8a9a85',1);
    }else{
      poly(c,[[-15,-21],[0,0],[16,-21],[14,8],[-14,8]],'#1b302f');c.beginPath();c.moveTo(-21,-11);c.quadraticCurveTo(-7,27,20,-10);c.strokeStyle='#b79760';c.lineWidth=1.4;c.stroke();ellipse(c,0,9,3.5,3.5,'#b79862');
      poly(c,[[-31,-10],[-13,18],[-24,60],[-44,86],[-37,36]],'#894f45');line(c,[[-29,0],[-22,21],[-31,51]],'#b4785c',1.2);ellipse(c,-29,11,4.5,4.5,'#b69462');
    }
    const face=[[-22,-73],[-18,-89],[1,-96],[22,-82],[25,-60],[20,-40],[6,-28],[-9,-31],[-21,-47]];
    if(key==='counsel'){ellipse(c,16,-98,18,14,hair);ellipse(c,25,-107,11,10,hair);}
    if(key==='broker'){
      c.beginPath();c.moveTo(-27,-63);c.bezierCurveTo(-43,-108,18,-125,35,-83);c.bezierCurveTo(43,-63,27,-37,38,-24);c.bezierCurveTo(15,-21,1,-35,-7,-32);c.lineTo(-33,-29);c.quadraticCurveTo(-21,-45,-27,-63);c.fillStyle=hair;c.fill();
    }
    poly(c,face,skin,null);poly(c,[[4,-92],[22,-82],[25,-60],[20,-40],[6,-28],[3,-46],[10,-58]],'#8c8974',null);
    ellipse(c,-23,-56,4,8,skin);line(c,[[-25,-59],[-21,-52]],'#947d65',.8);
    if(key==='protagonist'){
      poly(c,[[-26,-65],[-27,-85],[-19,-99],[1,-106],[22,-96],[29,-78],[22,-71],[13,-87],[-4,-88],[-18,-79],[-21,-59]],hair);
      c.beginPath();c.moveTo(-21,-89);c.quadraticCurveTo(-1,-109,24,-86);c.strokeStyle='#587266';c.lineWidth=1.2;c.stroke();line(c,[[4,-98],[18,-91]],'#778579',.8);
    }else if(key==='counsel'){
      poly(c,[[-26,-63],[-27,-83],[-17,-101],[6,-106],[26,-94],[28,-71],[19,-80],[7,-94],[-6,-93],[-18,-79],[-19,-64]],hair);
      line(c,[[-19,-92],[-7,-100],[8,-100],[21,-90]],'#768375',1);line(c,[[1,-100],[4,-91]],'#a29e86',.7);
    }else if(key==='engineer'){
      poly(c,[[-24,-60],[-30,-77],[-25,-86],[-27,-99],[-15,-96],[-8,-108],[2,-100],[13,-105],[22,-94],[28,-91],[26,-72],[17,-82],[4,-86],[-13,-84],[-20,-70]],hair);
      line(c,[[-24,-84],[-25,-70]],'#b7b7a1',2);line(c,[[20,-91],[25,-79]],'#8e9d8c',1.4);
    }else{
      c.beginPath();c.moveTo(-25,-65);c.bezierCurveTo(-28,-87,-16,-103,4,-105);c.bezierCurveTo(25,-101,29,-84,27,-64);c.quadraticCurveTo(12,-69,11,-88);c.quadraticCurveTo(-1,-77,-19,-77);c.lineTo(-20,-56);c.closePath();c.fillStyle=hair;c.fill();
      c.beginPath();c.moveTo(-20,-89);c.quadraticCurveTo(1,-111,20,-89);c.strokeStyle='#60786e';c.lineWidth=1.2;c.stroke();
      ellipse(c,-24,-44,3.2,4.6,'#d0b791');ellipse(c,22,-42,2,3,'#bba477');
    }
    // Sparse brush-like facial marks preserve a mature, illustrated likeness.
    const brow=tense?1.6:warm?-.8:0;
    line(c,[[-16,-66-brow],[-7,-67+brow]],'#33443d',1.5);line(c,[[7,-66+brow],[16,-64-brow]],'#32433b',1.4);
    line(c,[[-15,-61],[-8,-62]],'#233931',1.1);line(c,[[8,-60],[15,-60]],'#233931',1);ellipse(c,-10.5,-61,1.1,1.7,'#142922');ellipse(c,11,-60,1.1,1.5,'#142922');
    line(c,[[2,-64],[0,-50],[5,-48]],'#826f59',1);line(c,[[-2,-44],[4,-43]],'#b29777',.7);
    c.beginPath();c.moveTo(-6,-39);c.quadraticCurveTo(1,warm?-34:tense?-40:-37,10,-38);c.strokeStyle=female?'#81544a':'#665d4d';c.lineWidth=female?1.3:1;c.stroke();
    line(c,[[-3,-32],[7,-31]],'#dfc4a0',.6);
    if(key==='counsel'||key==='engineer'){
      const rim=key==='engineer'?'#536e68':'#8d8b73';rounded(c,-20,-69,18,12,4,null,rim,1.2);rounded(c,3,-68,18,12,4,null,rim,1.2);line(c,[[-2,-63],[3,-63]],rim,1.2);line(c,[[-20,-65],[-25,-67]],rim,1);
    }
    if(scene){line(c,[[-25,-83],[-23,-61],[-18,-42]],'#ccbc9470',.8);line(c,[[-51,1],[-60,31],[-71,95]],'#a1b09845',1);}
    c.restore();
  }
  function portrait(c,key,x,y,size,mood='neutral'){
    c.save();rounded(c,x,y,size,size,Math.max(3,size*.035),'#152c2a','#877456',Math.max(.8,size*.012));c.beginPath();c.rect(x+2,y+2,size-4,size-4);c.clip();
    const g=c.createLinearGradient(x,y,x+size,y+size);g.addColorStop(0,'#547b6b');g.addColorStop(.52,'#25443c');g.addColorStop(1,'#102724');c.fillStyle=g;c.fillRect(x,y,size,size);
    poly(c,[[x,y],[x+size*.56,y],[x+size*.11,y+size],[x,y+size]],'#bbaf8138');motif(c,x+size*.84,y+size*.20,size*.21,'#b8ab7e',.25);
    human(c,key,x+size*.5,y+size*.65,size/163,mood,false);
    const shade=c.createLinearGradient(0,y+size*.74,0,y+size);shade.addColorStop(0,'#09211e00');shade.addColorStop(1,'#09211eaa');c.fillStyle=shade;c.fillRect(x,y+size*.73,size,size*.27);
    c.restore();
  }
  function wharf(c,time){
    const sky=c.createLinearGradient(0,0,0,360);sky.addColorStop(0,'#0c1e25');sky.addColorStop(.6,'#284946');sky.addColorStop(1,'#58706a');c.fillStyle=sky;c.fillRect(0,0,960,540);
    glow(c,697,119,170,'#c9bc86',.1);poly(c,[[0,172],[200,137],[389,167],[516,135],[718,169],[960,112],[960,276],[0,276]],'#253f3d');
    skyline(c,275,960,'harbor','#173634');
    for(const x of [90,340,792]){line(c,[[x,269],[x,133],[x+96,99],[x+139,120]],'#172e30',5);line(c,[[x,135],[x+95,100],[x+36,145],[x,135]],'#263b3b',2);line(c,[[x+89,103],[x+91,230]],'#284341',1.3);}
    const water=c.createLinearGradient(0,271,0,540);water.addColorStop(0,'#284b46');water.addColorStop(1,'#0f2b2b');c.fillStyle=water;c.fillRect(0,271,960,269);
    for(let i=0;i<95;i++){const x=hash('wx'+i)*960,y=275+hash('wy'+i)*254,w=8+hash('ww'+i)*70;line(c,[[x,y],[x+w,y]],i%4===0?'#a5966145':'#89afa22b',i%7===0?2:1);}
    // A restrained yacht silhouette, mooring ropes and wet timber foreground.
    poly(c,[[459,329],[765,329],[734,365],[495,363]],'#0e2327','#80948a',1);poly(c,[[515,325],[551,287],[685,287],[716,325]],'#62726a');poly(c,[[548,306],[565,287],[665,287],[682,306]],'#182f30');
    rect(c,557,304,111,10,'#d1bf8a');line(c,[[507,322],[716,322]],'#c3c0a0',2);line(c,[[577,286],[577,264],[637,264],[638,286]],'#708f81',1.3);line(c,[[648,264],[648,209]],'#b9b597',1.3);poly(c,[[649,211],[669,219],[649,225]],'#925b49');
    for(let i=0;i<7;i++)ellipse(c,521+i*28,341,3.5,1.7,'#9ea78b');glow(c,610,316,108,'#d7bd79',.13);
    poly(c,[[0,442],[375,369],[564,431],[464,540],[0,540]],'#223b37');
    for(let i=0;i<12;i++){const t=i/12;line(c,[[lerp(0,375,t),lerp(442,369,t)],[lerp(30,564,t),lerp(563,431,t)]],'#536a552f',1.2);}
    for(let i=0;i<10;i++){const y=397+i*17;line(c,[[0,y+49],[480-i*2,y-43]],i%3?'#75806c19':'#bfa57825',1.1);}
    for(const [x,y]of [[72,426],[375,374],[444,449]]){rect(c,x-8,y,16,51,'#142b28');ellipse(c,x,y,13,5,'#576a56');ellipse(c,x,y+1,7,3,'#273e34');}
    c.beginPath();c.moveTo(74,431);c.quadraticCurveTo(232,467,375,381);c.quadraticCurveTo(425,416,448,456);c.strokeStyle='#77816a';c.lineWidth=2;c.stroke();
    c.save();c.globalAlpha=.26;for(let i=0;i<120;i++){const x=(hash('rainx'+i)*1100+time*21)%1100-70,y=(hash('rainy'+i)*620+time*235)%620-50;line(c,[[x,y],[x-9,y+25]],'#bac5b6',.6);}c.restore();
    // Umbrella ribs create a recognisable ally silhouette at the quay.
    c.beginPath();c.moveTo(677,340);c.quadraticCurveTo(755,230,843,337);c.quadraticCurveTo(822,326,800,341);c.quadraticCurveTo(775,324,752,342);c.quadraticCurveTo(721,326,699,343);c.closePath();c.fillStyle='#172d2c';c.fill();c.strokeStyle='#5e7568';c.lineWidth=1;c.stroke();
    line(c,[[755,284],[752,480]],'#847e61',1.5);line(c,[[755,284],[699,343]],'#425d51',.8);line(c,[[755,284],[800,341]],'#425d51',.8);
  }
  function banquet(c,time){
    const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#284344');sky.addColorStop(.55,'#4c6960');sky.addColorStop(1,'#193733');c.fillStyle=sky;c.fillRect(0,0,960,540);skyline(c,304,960,'banquet','#243e3b');
    glow(c,498,187,272,'#c1b584',.16);
    // Monumental panes and copper mullions; the room is a private glass conservatory.
    for(const x of [24,191,358,525,692,859]){
      c.beginPath();c.moveTo(x,363);c.lineTo(x,103);c.quadraticCurveTo(x+73,5,x+150,103);c.lineTo(x+150,363);c.strokeStyle='#af9d72';c.lineWidth=3;c.stroke();
      line(c,[[x+75,60],[x+75,363]],'#6d8673',1.2);line(c,[[x+4,198],[x+145,198]],'#6f8675',1.1);
      poly(c,[[x+11,114],[x+60,70],[x+115,359],[x+79,359]],'#d7d9bf0c');
    }
    for(let i=0;i<6;i++)line(c,[[0,10+i*5],[960,10+i*5]],i%2?'#1b3430':'#53614d',1);
    const floor=c.createLinearGradient(0,350,0,540);floor.addColorStop(0,'#526458');floor.addColorStop(1,'#112c27');c.fillStyle=floor;c.fillRect(0,355,960,185);
    for(let i=-3;i<8;i++)line(c,[[480+i*52,355],[480+i*155,540]],'#a4a17d18',1);for(let i=0;i<5;i++)line(c,[[0,369+i*i*8],[960,369+i*i*8]],'#9d9e7519',1);
    line(c,[[480,0],[480,103]],'#b8a477',1.3);ellipse(c,480,121,147,26,null,'#b9a774',2);ellipse(c,480,131,113,21,null,'#8a9870',1);motif(c,480,121,67,'#c6b380',.6);
    for(let i=0;i<13;i++){const a=i*Math.PI*2/13,x=480+Math.cos(a)*146,y=121+Math.sin(a)*26;line(c,[[x,y],[x,y+22+(i%3)*10]],'#aca276',.8);ellipse(c,x,y+24+(i%3)*10,2,4,'#efe0ae');glow(c,x,y+24+(i%3)*10,14,'#dec895',.16);}
    for(const [x,y]of [[330,355],[623,357],[566,346],[405,350]]){ellipse(c,x,y-39,12,17,'#253a32');poly(c,[[x-10,y-25],[x-26,y-14],[x-35,y+35],[x+38,y+35],[x+24,y-14],[x+11,y-25]],'#233930');}
    ellipse(c,485,405,251,50,'#b0aa8b','#cabd92',1.4);ellipse(c,485,418,245,42,'#203c33');ellipse(c,485,402,251,47,'#b9b498','#d5c9a5',1);
    for(const x of [303,402,554,659]){ellipse(c,x,400,19,6,'#d3c8a644','#e4d6b559',.8);line(c,[[x,397],[x,365]],'#d8d5bb',1);c.beginPath();c.moveTo(x-8,349);c.quadraticCurveTo(x-9,368,x,371);c.quadraticCurveTo(x+9,368,x+8,349);c.strokeStyle='#d6d9c0';c.lineWidth=1;c.stroke();}
    for(const x of [450,506]){rect(c,x-3,367,6,24,'#cbb78b');ellipse(c,x,366,2,4,'#ffe5b1');glow(c,x,366,34,'#e4b779',.2);}papers(c,586,408,.45);
  }
  function machine(c,time){
    const back=c.createLinearGradient(0,0,0,540);back.addColorStop(0,'#0c252c');back.addColorStop(.58,'#325851');back.addColorStop(1,'#0d282c');c.fillStyle=back;c.fillRect(0,0,960,540);
    poly(c,[[0,0],[960,0],[644,163],[313,163]],'#132f32');poly(c,[[0,540],[960,540],[625,340],[326,340]],'#203e3d');
    for(let i=0;i<8;i++){const f=i/8,y=lerp(36,159,f),left=lerp(0,325,f),right=lerp(960,637,f);line(c,[[left,y],[right,y]],'#60756a44',2);}
    for(let i=-5;i<6;i++)line(c,[[480+i*27,338],[480+i*132,540]],'#7093832b',1);for(let i=0;i<7;i++)line(c,[[0,351+i*i*5],[960,351+i*i*5]],'#71938220',1);
    for(const side of [-1,1])for(let i=0;i<4;i++){
      const s=1-i*.14,w=112*s,h=314*s,x=side<0?i*92:960-i*92-w,y=50+i*32;
      poly(c,[[x,y],[x+w,y+17*s],[x+w,y+h],[x,y+h+17*s]],'#122b2e','#5b7769',1.2);poly(c,[[x+w,y+17*s],[x+w+14*s,y+10*s],[x+w+14*s,y+h-8*s],[x+w,y+h]],'#0b2428');
      for(let row=0;row<9;row++){const yy=y+32*s+row*28*s;rect(c,x+12*s,yy,w-25*s,19*s,'#294540','#496655',.6);for(let vent=0;vent<4;vent++)line(c,[[x+19*s,yy+(4+vent*3)*s],[x+w-27*s,yy+(4+vent*3)*s]],'#0d2b2d',.8);ellipse(c,x+w-18*s,yy+7*s,1.4*s,1.4*s,(row+i)%4===0?'#c69e68':'#88b29a');}
      rect(c,x+10*s,y+8*s,w-19*s,6*s,'#607b67');
    }
    rounded(c,366,164,228,197,13,'#1e403d','#859980',1.5);motif(c,480,249,69,'#b8ad7e',.5);motif(c,480,249,49,'#6fb5a1',.65);ellipse(c,480,249,12,12,'#9ccdb4');glow(c,480,249,117,'#77bba2',.16);
    for(let i=0;i<7;i++)line(c,[[434+i*15,0],[434+i*15,111],[457+i*8,149],[457+i*8,171]],i%2?'#738371':'#314e46',i%3===0?3:1);
    for(const x of [120,840]){line(c,[[x,0],[x,29],[x+30,47],[x+30,351]],'#806c51',6);line(c,[[x-1,0],[x-1,28],[x+28,47],[x+28,349]],'#afa481',1);}
    line(c,[[474,344],[416,540]],'#6dbaa2',3);line(c,[[486,344],[544,540]],'#487e70',2);glow(c,474,426,112,'#559681',.08);
    papers(c,667,465,.62);poly(c,[[603,438],[680,414],[715,445],[637,473]],'#45675c','#7b9b83',1);poly(c,[[603,438],[594,392],[667,372],[680,414]],'#142e31','#6a9687',1);poly(c,[[607,433],[600,397],[663,381],[674,411]],'#5d968543');
  }
  function council(c,time){
    const dawn=c.createLinearGradient(0,0,0,355);dawn.addColorStop(0,'#708c88');dawn.addColorStop(.45,'#b5b29a');dawn.addColorStop(1,'#e5cba4');c.fillStyle=dawn;c.fillRect(0,0,960,540);
    ellipse(c,700,152,55,55,'#f1dfb2');glow(c,700,152,185,'#f1d7a3',.22);skyline(c,307,960,'council','#697c70');rect(c,0,311,960,44,'#b8b597');
    for(let i=0;i<14;i++)line(c,[[0,316+i*2],[960,316+i*2]],'#d1c7a119',.7);
    // Tall stone arches and empty seats represent the institution, not a throne.
    for(const x of [-25,140,305,470,635,800,965]){
      rect(c,x-12,0,25,380,'#213c36');rect(c,x+11,0,5,379,'#96a38b');
      c.beginPath();c.moveTo(x+15,335);c.lineTo(x+15,143);c.quadraticCurveTo(x+78,34,x+148,141);c.lineTo(x+148,335);c.strokeStyle='#4c6554';c.lineWidth=9;c.stroke();c.strokeStyle='#bdbea0';c.lineWidth=1.2;c.stroke();
      line(c,[[x+81,84],[x+81,340]],'#8c9c7e',1.1);
    }
    const floor=c.createLinearGradient(0,352,0,540);floor.addColorStop(0,'#6e7c65');floor.addColorStop(1,'#1c3b32');c.fillStyle=floor;c.fillRect(0,352,960,188);
    for(let i=0;i<6;i++)poly(c,[[120+i*156,353],[142+i*156,353],[15+i*145,540],[-28+i*145,540]],'#cfbc852a');
    ellipse(c,480,385,275,53,'#345247','#a4a68a',1);ellipse(c,480,376,275,48,'#82907a','#c1bea0',1);
    for(let i=0;i<7;i++){const a=Math.PI+(i+1)*Math.PI/8,x=480+Math.cos(a)*230,y=378+Math.sin(a)*55;rounded(c,x-18,y-69,36,71,5,'#263f35','#8c9576',1);rect(c,x-24,y-7,48,8,'#29483a','#7d8e6f',.7);line(c,[[x-15,y-67],[x+15,y-67]],'#b8b08a',1);}
    poly(c,[[454,348],[502,348],[515,413],[444,413]],'#24483b','#7e9578',1);poly(c,[[448,339],[507,339],[511,352],[452,353]],'#c4b895','#e0d0aa',.7);motif(c,480,380,17,'#c0ad7c',.6);
    papers(c,333,425,.70);papers(c,698,453,.80);line(c,[[0,510],[960,510]],'#afaa8135',1);
  }
  const PHI=(1+Math.sqrt(5))/2;
  const V=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]].map(v=>v.map(n=>n/Math.sqrt(1+PHI*PHI)));
  const F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  function die(c,x,y,r,value,options={}){
    const moving=options.concealed&&!options.reducedMotion,t=moving?options.time:0;
    const ax=.19+t*1.7,ay=-.18+t*2.2,az=.10+Math.sin(t*1.9)*.14;
    const rot=v=>{let [x,y,z]=v;let a=y*Math.cos(ax)-z*Math.sin(ax),b=y*Math.sin(ax)+z*Math.cos(ax);y=a;z=b;a=x*Math.cos(ay)+z*Math.sin(ay);b=-x*Math.sin(ay)+z*Math.cos(ay);x=a;z=b;a=x*Math.cos(az)-y*Math.sin(az);b=x*Math.sin(az)+y*Math.cos(az);return[a,b,z];};
    const verts=V.map(rot),proj=verts.map(v=>[v[0]*r/(1-v[2]*.21),v[1]*r/(1-v[2]*.21)]);
    const faces=F.map((inds,id)=>{const a=verts[inds[0]],b=verts[inds[1]],d=verts[inds[2]],u=b.map((v,i)=>v-a[i]),v=d.map((n,i)=>n-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);return{inds,id,n:n.map(q=>q/len),depth:(a[2]+b[2]+d[2])/3};}).filter(f=>f.n[2]>0).sort((a,b)=>a.depth-b.depth);
    const front=faces.reduce((best,f)=>!best||f.n[2]>best.n[2]?f:best,null);
    c.save();c.translate(x,y+(moving?Math.sin(t*6)*5:0));
    for(const f of faces){
      const light=clamp(.30+(-f.n[0]*.34-f.n[1]*.52+f.n[2]*.7),.15,1);
      const base=options.active===false?[21,44,41]:options.success===false?[68,48,40]:[28,69,56];
      const rgb=base.map((n,i)=>Math.round(n*.65+light*([40,68,49][i])));
      const points=f.inds.map(i=>proj[i]),gradient=c.createLinearGradient(points[0][0],points[0][1],points[2][0],points[2][1]);gradient.addColorStop(0,`rgb(${rgb.map(n=>Math.min(255,n+14)).join(',')})`);gradient.addColorStop(1,`rgb(${rgb.join(',')})`);
      poly(c,points,gradient,options.active===false?'#66745b':options.success===false?'#b78464':'#c7b582',Math.max(1,r*.017));
      const center=[points.reduce((s,p)=>s+p[0],0)/3,points.reduce((s,p)=>s+p[1],0)/3];
      poly(c,points.map(p=>[lerp(center[0],p[0],.83),lerp(center[1],p[1],.83)]),null,'#b9ba8540',.65);
      if(f===front&&!options.concealed){
        c.save();c.translate(...center);c.rotate(.04);c.font=`500 ${r*.50}px Georgia,serif`;c.textAlign='center';c.textBaseline='middle';c.shadowColor='#122923';c.shadowBlur=3;c.fillStyle=options.active===false?'#a3ac8f':IVORY;c.fillText(String(value??''),0,2);c.restore();
      }else if(f===front){motif(c,center[0],center[1],r*.13,'#b5ad7a',.40);}
    }
    for(const p of proj)ellipse(c,p[0],p[1],1.6,1.6,options.active===false?'#87947b':'#e2d4a6');
    c.restore();
  }
  function rollTable(c,roll,time,reduced){
    // The die becomes a physical object on lacquer, with paperwork at the edges.
    const shade=c.createLinearGradient(0,170,0,540);shade.addColorStop(0,'#0a201900');shade.addColorStop(.35,'#0a2019a8');shade.addColorStop(1,'#071b19f2');c.fillStyle=shade;c.fillRect(0,170,960,370);
    poly(c,[[177,375],[782,375],[960,540],[0,540]],'#15382d','#9b9b71',1);poly(c,[[207,386],[752,386],[905,529],[51,529]],'#133429','#638069',.7);
    ellipse(c,480,439,228,55,null,'#baa97b55',1.2);ellipse(c,480,439,200,45,null,'#9eab7655',.6);
    line(c,[[285,423],[480,390],[680,423],[480,483],[285,423]],'#b4a67544',.8);line(c,[[480,390],[480,483]],'#b4a67522',.7);
    const visualSuccess=roll.concealed?undefined:roll.success;
    papers(c,164,462,.65);papers(c,808,459,.64);glow(c,480,407,211,visualSuccess===false?'#b78064':'#bcb581',.14);
    const values=Array.isArray(roll.dice)&&roll.dice.length?roll.dice:[roll.kept||1],pair=values.length>1;
    for(let i=0;i<Math.min(2,values.length);i++){
      const x=pair?390+i*180:480,r=pair?85:112,y=pair?337:329,active=roll.concealed||values[i]===roll.kept;
      ellipse(c,x,438,pair?84:115,17,'#04181399');glow(c,x,425,r*.95,active?'#cab882':'#739079',active?.10:.025);
      die(c,x,y,r,values[i],{concealed:!!roll.concealed,reducedMotion:reduced,time:time+i*.61,active,success:visualSuccess});
    }
  }
  function draw(c,input={},story={},options={}){
    const state=input.state||input,scene=story.scenes&&story.scenes[state.sceneId],act=Math.round(clamp((scene&&scene.act)||state.act||1,1,4));
    const reduced=!!options.reducedMotion,time=reduced?0:Number(options.time)||0,roll=options.roll||null;
    c.save();c.beginPath();c.rect(0,0,960,540);c.clip();
    if(act===1)wharf(c,time);else if(act===2)banquet(c,time);else if(act===3)machine(c,time);else council(c,time);
    const speaker=scene&&scene.speaker,ally=['counsel','engineer','broker'].includes(speaker)?speaker:['counsel','broker','engineer','counsel'][act-1];
    const mood=(state.relations&&state.relations[ally])>=2?'warm':(state.relations&&state.relations[ally])<0?'tense':'neutral';
    // Foreground figures frame the plot object and keep the middle clear for checks.
    human(c,'protagonist',act===3?210:195,447,act===4?1.04:1.12,'neutral',true);
    human(c,ally,act===3?759:766,act===1?435:448,act===1?.93:1.04,mood,true);
    if(act===1||act===4)papers(c,237,461,.38);
    if(roll)rollTable(c,roll,time,reduced);
    const vignette=c.createRadialGradient(480,248,110,480,248,585);vignette.addColorStop(0,'#00191500');vignette.addColorStop(.65,'#00191512');vignette.addColorStop(1,'#001411bc');c.fillStyle=vignette;c.fillRect(0,0,960,540);
    c.save();c.globalAlpha=.055;for(let i=0;i<520;i++){const x=hash('grainx'+i)*960,y=hash('grainy'+i)*540;c.fillStyle=i%2?'#f0dfb7':'#000e11';c.fillRect(x,y,.6+(i%3)*.3,.6);}c.restore();
    line(c,[[18,18],[98,18]],'#b7a37a44',.7);line(c,[[18,18],[18,49]],'#b7a37a44',.7);line(c,[[942,491],[942,522],[861,522]],'#b7a37a44',.7);
    if(options.transition>0){c.globalAlpha=clamp(options.transition,0,1);c.fillStyle='#0b231f';c.fillRect(0,0,960,540);}
    c.restore();
  }
  const SunD20Art={draw,portrait};root.SunD20Art=SunD20Art;
  if(typeof module!=='undefined'&&module.exports)module.exports=SunD20Art;
})(typeof globalThis!=='undefined'?globalThis:this);
