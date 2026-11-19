/* 入口与界面：DOM 渲染、事件绑定、Phaser 舞台、存档与音效。规则全部委托给 SunD20Engine / SunD20ActionSim。 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const CFG = window.GAME_CONFIG;
  const STORY = window.SunD20Story, Engine = window.SunD20Engine, Art = window.SunD20Art;
  const ActionSim = window.SunD20ActionSim, ActionArt = window.SunD20ActionArt;
  const SAVE_KEY = 'twenty-sided-ambition-save-v1', ACTION_KEY = 'twenty-sided-ambition-action-v2', PREF_KEY = 'twenty-sided-ambition-prefs-v1', TUTORIAL_KEY = 'twenty-sided-ambition-tutorial-v3';
  // 界面文案与分类：来自配置表
  const CARD_KEYS=CFG.actionCards.map(c=>c.id), ROOM_KEYS=CFG.campRooms.slice().sort((x,y)=>x.slot-y.slot).map(r=>r.id), MODULE_KEYS=CFG.campRooms.slice().sort((x,y)=>x.slot-y.slot).map(r=>r.module);
  const cardNames=Object.fromEntries(CFG.actionCards.map(c=>[c.id,c.title]));
  const cardEffects=Object.fromEntries(CFG.actionCards.map(c=>[c.id,c.uiEffect]));
  const roomNames=Object.fromEntries(CFG.campRooms.map(r=>[r.id,r.title]));
  const roomEffects=Object.fromEntries(CFG.campRooms.map(r=>[r.id,r.uiEffect]));
  const moduleEffects=Object.fromEntries(CFG.vehicleModules.filter(m=>m.effect).map(m=>[m.id,m.effect]));
  const labels = Object.fromEntries([...CFG.stats.map(x=>[x.id,x.label]),...CFG.resources.map(x=>[x.id,x.uiLabel]),...CFG.characters.filter(c=>c.ally).map(c=>[c.id,c.name])]);
  const statHints = Object.fromEntries(CFG.stats.map(x=>[x.id,x.hint]));
  const clocks = CFG.acts.map(a=>[a.clock1,a.clock2,a.clock3]);
  const tierRows = Object.fromEntries(CFG.raceTiers.map(t=>[t.tier,t]));
  const PRESSURE_MAX = CFG.resources.find(r=>r.id==='pressure').max, CHECKS_PER_RUN = CFG.rules.checksPerRun;
  let prefs = { sound:false, motion:true }, engine = null, action = null, game = null, scene = null, texture = null;
  let activeRoll = null, rollStarted = 0, rollFrame = 0, rollShown = false, paused = false, worldTime = 0;
  let audio = null, lastTone = 0, toastTimer = 0, saveAvailable = false, dialogueOpen = false, raceResultShown = false, lastActionSave = 0, seenEventSerial = 0;
  const held = { up:false, down:false, left:false, right:false, boost:false, brake:false };
  try { const raw = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); if (raw && typeof raw === 'object' && !Array.isArray(raw)) prefs = { ...prefs, ...raw }; } catch (_) {}
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !localStorageSafeHas(PREF_KEY)) prefs.motion = false;

  function localStorageSafeHas(key) { try { return localStorage.getItem(key) != null; } catch (_) { return false; } }
  function seed() { return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0; }
  function array(v) { return Array.isArray(v) ? v : v == null ? [] : [v]; }
  function clear(node) { node.replaceChildren(); }
  function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; }
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (_) {} }
  function save() {
    if (!engine) return;
    try { localStorage.setItem(SAVE_KEY, engine.serialize()); if(action)localStorage.setItem(ACTION_KEY,action.serialize()); saveAvailable = true; $('saveMark').textContent = '已保存'; }
    catch (_) { $('saveMark').textContent = '无法保存'; }
  }
  function removeSave() { try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(ACTION_KEY); } catch (_) {} saveAvailable = false; }
  function loadSaved() {
    try {
      const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null;
      const restored = Engine.restore(STORY, raw); saveAvailable = true; return restored;
    } catch (_) { removeSave(); return null; }
  }
  function actionSeed(mode, act) { return (engine.state.seed ^ Math.imul(act + (mode === 'race' ? 17 : 3), 0x9e3779b9)) >>> 0; }
  function deriveBuild(){
    const build={cards:{rhetoric:0,insight:0,nerve:0,craft:0},rooms:{command:0,workshop:0,infirmary:0}};
    if(!engine)return build;
    for(const entry of engine.state.history){const skill=STORY.scenes[entry.sceneId]?.choices.find(choice=>choice.id===entry.choiceId)?.skill;if(CARD_KEYS.includes(skill))build.cards[skill]++;}
    engine.state.journal.filter(entry=>entry.type==='train').forEach((entry,index)=>{const slot=(STORY.interludes[index+1]||[]).findIndex(reward=>reward.id===entry.id);if(slot>=0&&slot<3)build.rooms[ROOM_KEYS[slot]]++;});
    return build;
  }
  function moduleForLeg(leg){const entry=engine.state.journal.filter(item=>item.type==='train')[leg-1],slot=(STORY.interludes[leg]||[]).findIndex(reward=>reward.id===entry?.id);return MODULE_KEYS[slot]||'turbo'}
  function syncActionBuild(){if(action&&engine){const result=action.syncBuild(deriveBuild());if(!result.ok)throw new Error(result.error)}}
  function actProgress(act) { return Math.min(3, engine.state.history.filter(entry => STORY.scenes[entry.sceneId]?.act === act).length); }
  function pendingRaceId(){const leg=engine?.state.act-1;return engine&&engine.state.phase==='scene'&&leg>=1&&leg<=CFG.raceLegs.length&&engine.state.training>=leg&&!engine.state.races?.some(entry=>entry.id===legId(leg))?legId(leg):null}
  function legId(leg){return CFG.raceLegs.find(l=>l.leg===leg)?.id}
  function legOf(id){return CFG.raceLegs.find(l=>l.id===id)?.leg}
  function compatibleAction(candidate) {
    if (!candidate || !engine) return false;
    if(candidate.state.seed!==actionSeed(candidate.state.mode,candidate.state.act))return false;
    const pendingRace=pendingRaceId();
    if(pendingRace)return candidate.state.mode==='race'&&candidate.state.id===pendingRace;
    return candidate.state.mode === 'explore' && candidate.state.act === engine.state.act;
  }
  function restoreAction() {
    try { const raw=localStorage.getItem(ACTION_KEY); if(!raw)return null; const candidate=ActionSim.restore(raw);candidate.setPaused(false);if(!compatibleAction(candidate))return null;if(!candidate.syncBuild(deriveBuild()).ok)return null;if(candidate.state.mode==='explore'){const synced=candidate.syncExploreProgress(actProgress(candidate.state.act));if(!synced.ok)return null;}return candidate; }
    catch (_) { try{localStorage.removeItem(ACTION_KEY)}catch(__){} return null; }
  }
  function freshExplore(act=engine.state.act) {
    return new ActionSim({mode:'explore',act,seed:actionSeed('explore',act),exploreProgress:actProgress(act),build:deriveBuild()});
  }
  function freshRace(leg) { return new ActionSim({mode:'race',act:leg,id:legId(leg),seed:actionSeed('race',leg),module:moduleForLeg(leg),build:deriveBuild()}); }
  function ensureAction() {
    const restored=restoreAction(); if(restored){action=restored;return;}
    const pendingRace=pendingRaceId();action=pendingRace?freshRace(legOf(pendingRace)):freshExplore(engine.state.act);
    save();
  }
  function toast(text) { if (!text) return; $('toast').textContent = text; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2200); }
  function unlockAudio() { if (!prefs.sound) return; try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume().catch(() => {}); } catch (_) {} }
  function tone(freq, duration=.12, type='sine', volume=.035) {
    if (!prefs.sound) return; unlockAudio(); if (!audio || audio.state !== 'running') return;
    const now = audio.currentTime; if (now-lastTone<.035) return; lastTone=now;
    const osc=audio.createOscillator(), gain=audio.createGain(); osc.type=type; osc.frequency.setValueAtTime(freq,now); osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.72),now+duration); gain.gain.setValueAtTime(volume,now); gain.gain.exponentialRampToValueAtTime(.0001,now+duration); osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(now+duration+.02);
  }
  function applyPrefs() {
    document.documentElement.classList.toggle('reduced-motion', !prefs.motion);
    $('motionBtn').setAttribute('aria-pressed', String(!prefs.motion)); $('motionBtn').title = prefs.motion ? '减少动态' : '恢复动态';
    $('soundBtn').setAttribute('aria-pressed', String(prefs.sound)); $('soundBtn').title = prefs.sound ? '关闭音效' : '开启音效';
  }
  function originBonus(origin) {
    const bonus = origin.bonuses?.stats || {};
    const stat = Object.keys(bonus)[0];
    return stat ? labels[stat]+' +'+bonus[stat]+' · 熟练' : '独特履历';
  }
  function renderOrigins() {
    clear($('originCards'));
    STORY.origins.forEach((origin,index) => {
      const button=el('button','origin-card'); button.dataset.index=String(index+1).padStart(2,'0'); button.dataset.origin=origin.id;
      const title=el('b','',origin.title), desc=el('p','',origin.description), bonus=el('span','origin-bonus',originBonus(origin)); button.append(title,desc,bonus);
      button.addEventListener('click',()=>startNew(origin.id)); $('originCards').append(button);
    });
    const restored=loadSaved(); $('continueBtn').hidden=!restored; $('continueBtn').onclick=()=>{ engine=loadSaved();action=null;if(engine)enterGame(true); };
  }
  function startNew(originId) {
    unlockAudio(); engine=new Engine(STORY,{seed:seed()}); const result=engine.chooseOrigin(originId);
    if(!result.ok){toast(result.error);return;} action=freshExplore(1); save(); tone(392,.22,'triangle',.045); enterGame(false);
  }
  function enterGame(resume) {
    if(!engine)return; $('intro').hidden=true; $('game').hidden=false; paused=false; $('menuLayer').hidden=true;
    if(!action)ensureAction();
    bootPhaser(); requestAnimationFrame(()=>{ if(game&&game.scale)game.scale.refresh(); });
    renderAll(); syncActionPresentation();
    if(engine.state.phase==='check'&&engine.state.pending){dialogueOpen=true;$('narrativePanel').hidden=false;renderStory();if(action?.state.mode==='explore'&&action.canInteract&&action.canInteract())action.interact();restoreRoll();syncActionPresentation();}
    else if(engine.state.phase==='interlude') showInterlude();
    else if(engine.state.phase==='ending') showEnding();
    else if(action?.state.mode==='race'&&action.state.phase==='completed') showRaceResult();
    else if(action?.state.mode==='race'&&action.state.time===0) showRaceBrief();
    else if(!resume&&!localStorageSafeHas(TUTORIAL_KEY)){paused=true;$('onboardingLayer').hidden=false;}
    if(resume)toast('已回到上次离开的桌边');
  }
  function showIntro() {
    $('confirmLayer').hidden=true; $('menuLayer').hidden=true; $('rollLayer').hidden=true; $('interludeLayer').hidden=true; $('endingLayer').hidden=true; $('onboardingLayer').hidden=true; $('raceBriefLayer').hidden=true; $('raceResultLayer').hidden=true; closeDialogue();
    $('game').hidden=true; $('intro').hidden=false; paused=true; clearHeld(); renderOrigins();
  }
  function clearHeld(){for(const key of Object.keys(held))held[key]=false}
  function currentAct() { return STORY.acts.find(a=>a.id===engine?.state.act || a.id===String(engine?.state.act)) || STORY.acts[(engine?.state.act||1)-1] || {}; }
  function clock() { const act=Math.max(1,engine.state.act)-1, within=engine.state.sceneIndex%3; return (clocks[act]||clocks[3])[within]||'06:51'; }
  function formatChance(value) { return Math.round(value*100)+'%'; }
  function modeText(mode) { return mode==='advantage'?'优势':mode==='disadvantage'?'劣势':'普通'; }
  function makeChoice(view,index) {
    const button=el('button','choice-card'); button.disabled=!view.available; button.dataset.choice=view.id;
    const n=el('span','choice-index',index+1); const copy=el('span','choice-copy');
    copy.append(el('b','',view.label),el('p','',view.available?(view.intent||''):(view.reason||'条件不足')));
    if(view.available) copy.append(el('small','choice-formula',view.formula+' · '+view.reason));
    const meta=el('span','choice-meta'); meta.append(el('strong','',labels[view.skill]+' · DC '+view.dc),el('span','',view.available?modeText(view.mode)+' / '+formatChance(view.chance):'未解锁'));
    button.append(n,copy,meta); if(view.available)button.addEventListener('click',()=>beginCheck(view.id)); return button;
  }
  function renderStory() {
    const story=engine.currentScene(); if(!story)return;
    $('sceneKicker').textContent=story.kicker||'未命名片段'; $('sceneCount').textContent=String(engine.state.sceneIndex+1).padStart(2,'0')+' / '+CHECKS_PER_RUN; $('sceneTitle').textContent=story.title;
    $('speaker').hidden=!story.speaker; $('speaker').textContent=story.speaker?(STORY.characters?.[story.speaker]?.name||story.speaker):'';
    clear($('sceneBody')); array(story.body).forEach(text=>$('sceneBody').append(el('p','',text)));
    clear($('choiceList')); engine.choices().forEach((view,index)=>$('choiceList').append(makeChoice(view,index)));
    $('historyCount').textContent=engine.state.history.length;
  }
  function actionSnapshot(){return action?{...action.snapshot(),dialogueOpen,paused}:null}
  function actionBlocked(){return paused||dialogueOpen||!$('rollLayer').hidden||!$('interludeLayer').hidden||!$('endingLayer').hidden||!$('onboardingLayer').hidden||!$('raceBriefLayer').hidden||!$('raceResultLayer').hidden||!$('menuLayer').hidden||!$('confirmLayer').hidden}
  function interactionLabel(goal){return /ally|talk|npc/.test(goal?.kind||'')?'交谈':/exit|car/.test(goal?.kind||'')?'进入':'调查'}
  function syncActionPresentation(){
    if(!action||!engine||$('game').hidden)return; const s=action.state,isRace=s.mode==='race',stage=$('sceneStage');
    stage.classList.toggle('race-mode',isRace);stage.classList.toggle('dialogue-open',dialogueOpen);
    $('actionHud').hidden=isRace;$('expeditionHud').hidden=isRace;$('raceHud').hidden=!isRace;$('raceTelemetry').hidden=!isRace;$('boostBtn').hidden=!isRace;$('touchInteractBtn').hidden=isRace;
    if(isRace){
      $('modeLabel').textContent='城市夜航';$('speedText').textContent=Math.round(s.speed||0);$('absorbedText').textContent=s.absorbed||0;$('comboText').textContent='×'+Math.max(1,s.combo||0);$('growthText').textContent='合流车体 LV '+(1+(s.growth||0));$('raceProgressFill').style.width=Math.max(0,Math.min(100,(s.distance||0)/Math.max(1,s.length||1)*100))+'%';
      const corridor=action.corridor(),safety=s.time>0?s.safeTime/s.time:1;
      $('moduleText').textContent=action.module().title;$('precisionText').textContent=s.precisionHits;$('stormSafetyText').textContent=Math.round(safety*100)+'%';
      $('stormStatus').textContent=!corridor.active?'夜雾将在 '+corridor.remaining.toFixed(1)+' 秒后合拢':(corridor.safe?'安全走廊':'夜雾耗能')+' · '+(corridor.warning?'即将换道 ':'换道倒计时 ')+corridor.remaining.toFixed(1)+' 秒';
      $('stormStatus').dataset.safe=String(corridor.safe);$('worldHint').textContent='A / D 转向 · W / S 调整车位 · Shift 增压 · 回收车辆强化，驶入亮区节省能量';$('interactBtn').hidden=true;
    }else{
      const goal=s.objectives?.[s.objectiveIndex],story=engine.currentScene();$('modeLabel').textContent='合同远征 · '+(currentAct().location||currentAct().title||'现场');$('objectiveTitle').textContent=goal?(goal.title+(story?' · '+story.title:'')):'本幕合同已完成';$('objectiveProgress').textContent=goal?'合同节点 '+(s.objectiveIndex+1)+' / 3':'准备赛车回收';
      $('healthText').textContent=Math.ceil(s.health)+' / '+s.maxHealth;$('scrapText').textContent=s.scrap;$('enemyCountText').textContent=s.enemies.length;$('waveText').textContent=s.wave+' / '+s.waveTotal;
      $('combatStatus').textContent=s.combatCleared?'本区已清场 · 收集剩余零件':'自动攻击附近敌人 · 清场收集零件';
      for(const key of CARD_KEYS)$('card-'+key).textContent=s.build.cards[key];
      const ready=Boolean(engine.state.phase==='scene'&&action.canInteract&&action.canInteract()&&!dialogueOpen);$('interactBtn').hidden=!ready;if(ready)$('interactBtn').querySelector('span').textContent=interactionLabel(goal);$('worldHint').textContent=ready?'合同已在手边 · 按 E 检定并获得行动卡':s.target?'沿亮线前往合同 · 自动攻击持续进行':'WASD 移动 / 点击寻路 · 自动攻击 · 靠近合同按 E（无需等待清场）';
    }
  }
  function openDialogue(){
    if(!action||action.state.mode!=='explore'||engine.state.phase!=='scene'||dialogueOpen||!action.canInteract())return;
    const ready=action.interact();if(!ready.ok){toast(ready.error);return;}dialogueOpen=true;$('narrativePanel').hidden=false;renderStory();syncActionPresentation();save();tone(352,.13,'triangle',.035);
  }
  function closeDialogue(){dialogueOpen=false;const panel=$('narrativePanel');if(panel)panel.hidden=true;const stage=$('sceneStage');if(stage)stage.classList.remove('dialogue-open');if(action&&action.setPaused)action.setPaused(false);syncActionPresentation()}
  function finishExploreObjective(){
    if(!action||action.state.mode!=='explore')return null;let result=action.completeObjective?action.completeObjective():null;
    if((!result||!result.ok)&&action.syncExploreProgress){const synced=action.syncExploreProgress(actProgress(action.state.act));if(synced.ok)result=synced;}
    save();return result;
  }
  function processActionEvents(){
    if(!action)return;const s=action.state;if(s.eventSerial<=seenEventSerial)return;const fresh=(s.events||[]).filter(event=>{const n=Number(String(event.id).split('-').pop());return n>seenEventSerial});
    fresh.forEach(event=>{
      if(event.type==='absorb')tone(270+Math.min(7,event.combo||1)*35,.09,'square',.028);
      else if(event.type==='wall')tone(92,.07,'sawtooth',.018);
      else if(event.type==='shot')tone(660,.04,'triangle',.012);
      else if(event.type==='enemy-hit')tone(210,.04,'sine',.009);
      else if(event.type==='enemy-down')tone(390,.09,'triangle',.02);
      else if(event.type==='hurt')tone(105,.12,'sawtooth',.015);
      else if(event.type==='pickup')tone(790,.06,'sine',.018);
    });
    const notice=fresh.findLast(event=>['pickup','hurt','enemy-down','enemy-hit','shot','wave'].includes(event.type));
    if(notice){const messages={shot:'自动攻击已开火', 'enemy-hit':'命中威胁目标', 'enemy-down':'威胁解除 · 地面掉落零件',hurt:'耐久受损 · 移动拉开距离',pickup:'已回收零件 +'+(notice.value||0),wave:'第 '+notice.wave+' 波威胁抵达'};$('combatEvent').textContent=messages[notice.type];$('combatEvent').dataset.event=notice.type;}
    seenEventSerial=s.eventSerial;
  }
  function updateAction(delta){
    if(!action||!engine||actionBlocked())return;const result=action.step(Math.min(50,delta)/1000,{...held});if(!result.ok){clearHeld();toast(result.error);return;}processActionEvents();syncActionPresentation();
    if(action.state.mode==='race'&&action.state.phase==='completed'&&!raceResultShown)showRaceResult();
    if(action.state.time-lastActionSave>1.2){lastActionSave=action.state.time;save();}
  }
  function showRaceBrief(){paused=true;clearHeld();raceResultShown=false;$('raceBriefLayer').hidden=false;$('raceModulePreview').textContent=action.module().title;$('raceModuleEffect').textContent=moduleEffects[action.state.module]||'';$('raceBuildPreview').textContent='行动卡 '+Object.values(action.state.build.cards).reduce((a,b)=>a+b,0)+' 层 · 营地 '+Object.values(action.state.build.rooms).reduce((a,b)=>a+b,0)+' 级';syncActionPresentation()}
  function startRace(){if(!action||action.state.mode!=='race')return;$('raceBriefLayer').hidden=true;paused=false;clearHeld();tone(180,.28,'sawtooth',.03);syncActionPresentation();save()}
  function showRaceResult(){
    if(!action||action.state.mode!=='race'||!action.state.result)return;paused=true;clearHeld();raceResultShown=true;const r=action.state.result,tier=tierRows[r.tier]?.label||'回收完成';$('raceResultKicker').textContent=tier;$('raceResultTitle').textContent=tierRows[r.tier]?.resultTitle||'带着回收物，平安抵达';clear($('raceResultStats'));[['吸收车辆',r.absorbed],['精准回收',r.precisionHits],['安全率',Math.round(r.safety*100)+'%'],['最高连撞','×'+r.maxCombo],['回收评分',r.score],['车辆模组',action.module().title]].forEach(([name,value])=>{const d=el('div');d.append(el('b','',value),el('span','',name));$('raceResultStats').append(d)});$('raceRewardText').textContent=tierRows[r.tier]?.rewardText||'';$('raceResultLayer').hidden=false;syncActionPresentation();save();tone(523,.35,'triangle',.04);
  }
  function continueJourney(){
    if(!action?.state.result)return;const r=action.state.result,already=engine.state.races?.some(entry=>entry.id===r.id),settled=already?{ok:true,stateDelta:{resources:{},fate:0}}:engine.applyRaceResult(r.id,{absorbed:r.absorbed,maxCombo:r.maxCombo,tier:r.tier});if(!settled.ok){toast(settled.error);return;}action=freshExplore(engine.state.act);seenEventSerial=0;lastActionSave=0;raceResultShown=false;$('raceResultLayer').hidden=true;paused=false;save();renderAll();syncActionPresentation();pulseDelta(settled.stateDelta);toast('已抵达'+(currentAct().title||'下一幕'));
  }
  function renderHud() {
    const state=engine.state, act=currentAct(); $('actKicker').textContent=act.kicker||'ACT '+toRoman(state.act); $('actTitle').textContent=act.title||'夜航会';
    $('clockAct').textContent='第'+['零','一','二','三','四'][state.act]+'幕'; $('clockText').textContent=clock(); $('levelText').textContent='LV '+state.level;
    for(const key of ['capital','reputation','leverage'])$(key+'Text').textContent=state.resources[key];
    $('pressureText').textContent=state.resources.pressure+' / '+PRESSURE_MAX; $('fateText').textContent=state.fate;
    $('saveMark').textContent=saveAvailable?'已保存':'本局暂存'; renderParty();
  }
  function toRoman(n){return ['0','I','II','III','IV'][n]||String(n)}
  function characterName(key){return STORY.characters?.[key]?.name||labels[key]||key}
  function renderParty() {
    clear($('partyStrip'));
    ['counsel','engineer','broker'].forEach(key=>{
      const relation=engine.state.relations[key], withdrew=Boolean(engine.state.flags[key+'_withdrew']), card=el('div','party-member'+(withdrew||relation<=-2?' absent':'')), canvas=document.createElement('canvas'); canvas.width=100;canvas.height=100;
      const copy=el('div');copy.append(el('b','',characterName(key)),el('span','',withdrew?'退出支持':relation<=-2?'明确疏离':relation>=3?'愿意替你下注':relation>=1?'暂时站在你这边':relation<0?'保留意见':'尚在观察'));
      card.append(canvas,copy,el('i','',relation>0?'+'+relation:String(relation))); $('partyStrip').append(card);
      if(Art){const ctx=canvas.getContext('2d');Art.portrait(ctx,key,50,55,82,relation<0?'wary':'neutral');}
    });
  }
  function renderAll(){ if(!engine)return; renderHud(); if(engine.state.phase==='scene')renderStory(); renderSheet(); renderHistory(); syncActionPresentation(); }
  function beginCheck(id) {
    if(paused||!dialogueOpen)return; unlockAudio(); const result=engine.beginCheck(id); if(!result.ok){toast(result.error);return;} save(); startRoll(result); tone(146,.15,'triangle',.04);
  }
  function startRoll(result,restored=false) {
    activeRoll={roll:result.roll,choice:result.choice}; rollShown=false; rollStarted=performance.now(); $('rollLayer').hidden=false; $('rollResult').hidden=true; $('acceptBtn').disabled=true; $('rerollBtn').hidden=true;
    $('rollSkill').textContent=labels[result.choice.skill]||result.choice.skill; $('rollTitle').textContent=result.choice.label; $('rollIntent').textContent=result.choice.intent||result.choice.reason||'';
    $('rollDc').textContent=result.roll.dc; $('rollTotal').textContent='?'; $('rollFormula').textContent=result.roll.formula||result.choice.formula||'D20 检定';
    $('dieB').hidden=result.roll.dice.length<2; $('diceHost').className='dice-host rolling'; $('dieA').querySelector('span').textContent='?'; $('dieB').querySelector('span').textContent='?';
    if(restored||!prefs.motion) revealRoll(); else animateRoll();
  }
  function animateRoll(now=performance.now()) {
    if(rollShown||!activeRoll)return; const elapsed=now-rollStarted;
    $('dieA').querySelector('span').textContent=1+Math.floor((elapsed/41)%20); $('dieB').querySelector('span').textContent=1+Math.floor((elapsed/57+7)%20);
    if(elapsed>=1050)revealRoll(); else rollFrame=requestAnimationFrame(animateRoll);
  }
  function rawOutcome(choice,roll){return roll.critical==='success'&&choice.criticalSuccess?{...choice.success,...choice.criticalSuccess}:roll.critical==='failure'&&choice.criticalFailure?{...choice.failure,...choice.criticalFailure}:roll.success?choice.success:choice.failure}
  function revealRoll() {
    if(!activeRoll||rollShown)return; rollShown=true; cancelAnimationFrame(rollFrame); const {roll,choice}=activeRoll;
    $('dieA').querySelector('span').textContent=roll.dice[0]; if(roll.dice[1]!=null)$('dieB').querySelector('span').textContent=roll.dice[1]; $('rollTotal').textContent=roll.total;
    $('diceHost').className='dice-host '+(roll.success?'success':'failure'); $('rollResult').hidden=false;
    const outcome=rawOutcome(choice,roll)||{};
    $('resultKicker').textContent=roll.critical==='success'?'大成功 · 自然 20':roll.critical==='failure'?'大失败 · 自然 1':roll.success?'检定成功':'检定失败';
    $('resultTitle').textContent=roll.success?'局面向你倾斜。':'代价先一步落座。'; $('resultText').textContent=outcome.text||'桌边的人记住了这个结果。';
    const canReroll=!roll.success&&!roll.critical&&!engine.state.pending.rerolled&&engine.state.fate>0; $('rerollBtn').hidden=!canReroll; $('acceptBtn').disabled=false;
    tone(roll.success?523:116,roll.success?.28:.38,roll.success?'triangle':'sawtooth',roll.success?.045:.025);
  }
  function restoreRoll(){const pending=engine.state.pending,scene=engine.currentScene(),choice=scene.choices.find(c=>c.id===pending.choiceId);const view=engine._view?engine._view(choice):{...choice,formula:pending.roll.formula};startRoll({roll:pending.roll,choice:view},true)}
  function reroll() {
    if(!rollShown)return; const result=engine.reroll(); if(!result.ok){toast(result.error);return;} save(); renderHud(); startRoll(result); tone(210,.18,'triangle',.05);
  }
  function acceptRoll() {
    if(!rollShown)return; const result=engine.acceptRoll(); if(!result.ok){toast(result.error);return;}syncActionBuild();finishExploreObjective();save();$('rollLayer').hidden=true;activeRoll=null;rollShown=false;tone(330,.12,'sine',.03);closeDialogue();renderAll();
    if(result.nextType==='interlude')showInterlude();else if(result.nextType==='ending')showEnding();else pulseDelta(result.stateDelta);
  }
  function pulseDelta(delta){const pieces=[];for(const[k,v]of Object.entries(delta?.resources||{}))pieces.push(labels[k]+' '+(v>0?'+':'')+v);if(pieces.length)toast(pieces.join(' · '))}
  function showInterlude() {
    closeDialogue();renderAll();$('interludeLayer').hidden=false;$('interludeLevel').textContent=engine.state.level;renderStatBars($('statBars'));clear($('trainingCards'));
    engine.interludeChoices().forEach((reward,index)=>{
      const room=ROOM_KEYS[index],module=MODULE_KEYS[index],button=el('button','training-card');button.dataset.room=room;button.dataset.module=module;const icon=el('span');icon.append(el('i','',['Ⅰ','Ⅱ','Ⅲ'][index]));const copy=el('div');copy.append(el('b','',roomNames[room]+'升级 · '+reward.title),el('p','',reward.description),el('p','room-effect',roomEffects[room]),el('p','module-effect','下段装配 '+ActionSim.MODULES[module].title+'：'+moduleEffects[module]));button.append(icon,copy,el('small','',String(index+1).padStart(2,'0')));button.addEventListener('click',()=>train(reward.id));$('trainingCards').append(button);
    });
  }
  function train(id){const leg=engine.state.interludeAfter,result=engine.train(id);if(!result.ok){toast(result.error);return;}action=freshRace(leg);seenEventSerial=0;lastActionSave=0;save();$('interludeLayer').hidden=true;tone(698,.35,'triangle',.04);renderAll();toast('成长：'+result.reward.title);showRaceBrief()}
  function renderStatBars(target){clear(target);for(const key of ['rhetoric','insight','nerve','craft']){const row=el('div','stat-row');row.append(el('span','',labels[key]));const bar=el('i');for(let i=0;i<8;i++)bar.append(el('span',i<engine.state.stats[key]?'on':''));row.append(bar,el('b','',engine.state.stats[key]));target.append(row)}}
  function renderSheet() {
    if(!engine)return; const origin=STORY.origins.find(o=>o.id===engine.state.originId);$('originName').textContent=origin?.title||'未选择履历';$('sheetLevel').textContent='LV '+engine.state.level;
    clear($('sheetStats'));for(const key of ['rhetoric','insight','nerve','craft']){const card=el('div','sheet-stat');card.append(el('span','',labels[key]),el('b','',engine.state.stats[key]),el('small','',statHints[key]));$('sheetStats').append(card)}
    clear($('traitsList'));const trained=engine.state.trained.map(k=>'熟练：'+labels[k]);[...trained,...engine.state.traits].forEach(t=>$('traitsList').append(el('span','',t)));if(!$('traitsList').children.length)$('traitsList').append(el('span','','尚无特质'));
    clear($('relationsList'));for(const key of ['counsel','engineer','broker']){const rel=engine.state.relations[key],row=el('div','relation-row');row.append(el('span','',characterName(key)));const track=el('div','relation-track'),fill=el('i');fill.style.width=Math.max(0,(rel+2)/6*100)+'%';track.append(fill);row.append(track,el('b','',rel>0?'+'+rel:String(rel)));$('relationsList').append(row)}
    clear($('itemsList'));(engine.state.items.length?engine.state.items:['邀请函']).forEach(t=>$('itemsList').append(el('span','',t)));
    const build=deriveBuild();clear($('buildCards'));clear($('buildRooms'));
    for(const key of CARD_KEYS){const row=el('div','build-row');row.dataset.card=key;row.append(el('b','',cardNames[key]+' ×'+build.cards[key]),el('p','',cardEffects[key]));$('buildCards').append(row)}
    for(const key of ROOM_KEYS){const row=el('div','build-row');row.dataset.room=key;row.append(el('b','',roomNames[key]+' LV '+build.rooms[key]),el('p','',roomEffects[key]));$('buildRooms').append(row)}
  }
  function renderHistory() {
    if(!engine)return; clear($('historyList'));if(!engine.state.history.length){$('historyList').append(el('p','', '第一枚骰子还没有落下。'));return;}
    engine.state.history.slice().reverse().forEach((entry,index)=>{const sceneData=STORY.scenes[entry.sceneId],choice=sceneData?.choices.find(c=>c.id===entry.choiceId),item=el('article','history-entry');item.append(el('small','',sceneData?.title||'一段会谈'),el('b','',(entry.roll.success?'成功':'失败')+' · '+(labels[choice?.skill]||'检定')+' '+entry.roll.total+'/'+entry.roll.dc),el('p','',entry.text||choice?.label||''));$('historyList').append(item)});
  }
  function showEnding() {
    const ending=engine.ending(); if(!ending)return;removeSave();$('endingKicker').textContent=ending.kicker||'黎明之后';$('endingTitle').textContent=ending.title;clear($('endingBody'));array(ending.body||ending.description).forEach(p=>$('endingBody').append(el('p','',p)));
    clear($('endingStats'));const successes=engine.state.history.filter(h=>h.roll.success).length;[['通过检定',successes+'/'+engine.state.completedChecks],['最终等级','LV '+engine.state.level],['声誉',engine.state.resources.reputation],['压力',engine.state.resources.pressure+'/'+PRESSURE_MAX]].forEach(([name,val])=>{const d=el('div');d.append(el('b','',val),el('span','',name));$('endingStats').append(d)});$('endingLayer').hidden=false;tone(392,.55,'triangle',.04);
  }
  function openSheet(){renderSheet();$('sheetDrawer').hidden=false;paused=true}
  function closeSheet(){$('sheetDrawer').hidden=true;paused=false}
  function openHistory(){renderHistory();$('historyDrawer').hidden=false;paused=true}
  function closeHistory(){$('historyDrawer').hidden=true;paused=false}
  function openMenu(){if(!$('rollLayer').hidden||!$('interludeLayer').hidden||!$('endingLayer').hidden||!$('onboardingLayer').hidden||!$('raceBriefLayer').hidden||!$('raceResultLayer').hidden)return;paused=true;clearHeld();$('menuLayer').hidden=false;$('resumeBtn').focus()}
  function closeMenu(){$('menuLayer').hidden=true;paused=false}
  function requestHome(){paused=true;$('menuLayer').hidden=true;$('confirmLayer').hidden=false}
  function closeConfirm(){$('confirmLayer').hidden=true;paused=false}
  function bootPhaser() {
    if(game)return;if(!window.Phaser||!Art||!ActionSim||!ActionArt)throw new Error('动作场景组件未能加载。');
    class ChronicleScene extends Phaser.Scene{constructor(){super('chronicle')}create(){scene=this;texture=this.textures.createCanvas('chronicle-scene',960,540);this.add.image(0,0,'chronicle-scene').setOrigin(0);drawWorld()}update(_,delta){if(!actionBlocked())worldTime+=Math.min(delta,50)/1000;updateAction(delta);drawWorld()}}
    game=new Phaser.Game({type:Phaser.CANVAS,images:{default:'assets/phaser-default.png',missing:'assets/phaser-missing.png',white:'assets/phaser-white.png'},parent:'phaserStage',width:960,height:540,banner:false,backgroundColor:'#0b1714',render:{antialias:true},audio:{noAudio:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:960,height:540},scene:[ChronicleScene],input:{keyboard:false}});
  }
  function drawWorld(){if(!texture||!engine)return;const ctx=texture.context;if(action)ActionArt.draw(ctx,action,{width:960,height:540,time:worldTime,reducedMotion:!prefs.motion});else Art.draw(ctx,engine.state,STORY,{time:worldTime,reducedMotion:!prefs.motion,roll:null,transition:0});texture.refresh()}
  function newChronicle(){$('endingLayer').hidden=true;$('menuLayer').hidden=true;$('confirmLayer').hidden=true;$('raceResultLayer').hidden=true;closeDialogue();engine=null;action=null;removeSave();showIntro()}
  function chooseByKey(index){if(paused)return;if(!$('interludeLayer').hidden){const b=$('trainingCards').children[index];if(b)b.click();return}if(dialogueOpen&&engine?.state.phase==='scene'&&$('rollLayer').hidden&&$('confirmLayer').hidden&&$('endingLayer').hidden){const b=$('choiceList').children[index];if(b&&!b.disabled)b.click()}}

  $('rerollBtn').addEventListener('click',reroll);$('acceptBtn').addEventListener('click',acceptRoll);$('sheetBtn').addEventListener('click',openSheet);$('historyBtn').addEventListener('click',openHistory);
  document.querySelectorAll('[data-close-drawer]').forEach(b=>b.addEventListener('click',closeSheet));document.querySelectorAll('[data-close-history]').forEach(b=>b.addEventListener('click',closeHistory));
  $('menuBtn').addEventListener('click',openMenu);$('resumeBtn').addEventListener('click',closeMenu);$('restartBtn').addEventListener('click',()=>{removeSave();engine=null;action=null;$('menuLayer').hidden=true;showIntro()});$('homeBtn').addEventListener('click',requestHome);$('brandBtn').addEventListener('click',requestHome);$('confirmHomeBtn').addEventListener('click',showIntro);$('cancelHomeBtn').addEventListener('click',closeConfirm);
  $('newGameBtn').addEventListener('click',newChronicle);$('reviewBtn').addEventListener('click',()=>{openHistory();});
  $('motionBtn').addEventListener('click',()=>{prefs.motion=!prefs.motion;applyPrefs();savePrefs();});$('soundBtn').addEventListener('click',()=>{prefs.sound=!prefs.sound;applyPrefs();savePrefs();unlockAudio();tone(440,.15);});
  $('interactBtn').addEventListener('click',openDialogue);$('touchInteractBtn').addEventListener('click',openDialogue);$('leaveDialogueBtn').addEventListener('click',closeDialogue);
  $('beginExploreBtn').addEventListener('click',()=>{try{localStorage.setItem(TUTORIAL_KEY,'seen')}catch(_){}$('onboardingLayer').hidden=true;paused=false;syncActionPresentation();});$('startRaceBtn').addEventListener('click',startRace);$('continueJourneyBtn').addEventListener('click',continueJourney);
  const movementKeys={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right',shift:'boost',' ':'boost'};
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.altKey||event.metaKey||event.repeat)return;
    const moveKey=movementKeys[event.key.toLowerCase()];if(moveKey&&engine&&$('game').hidden===false&&!actionBlocked()){held[moveKey]=true;event.preventDefault();return}
    if(event.key.toLowerCase()==='e'&&engine&&$('game').hidden===false&&!actionBlocked()){event.preventDefault();openDialogue();return}
    if(/^[123]$/.test(event.key)){event.preventDefault();chooseByKey(Number(event.key)-1);return}
    if(event.key.toLowerCase()==='r'&&!$('rollLayer').hidden&&!$('rerollBtn').hidden){event.preventDefault();reroll();return}
    if(event.key==='Enter'&&!$('rollLayer').hidden&&!$('acceptBtn').disabled){event.preventDefault();acceptRoll();return}
    if(event.key.toLowerCase()==='c'&&$('game').hidden===false&&$('rollLayer').hidden){event.preventDefault();$('sheetDrawer').hidden?openSheet():closeSheet();return}
    if(event.key==='Escape'){
      event.preventDefault();if(!$('sheetDrawer').hidden)closeSheet();else if(!$('historyDrawer').hidden)closeHistory();else if(!$('confirmLayer').hidden)closeConfirm();else if(!$('menuLayer').hidden)closeMenu();else if(dialogueOpen&&$('rollLayer').hidden)closeDialogue();else openMenu();
    }
  });
  document.addEventListener('keyup',event=>{const moveKey=movementKeys[event.key.toLowerCase()];if(moveKey){held[moveKey]=false;event.preventDefault()}});
  document.querySelectorAll('[data-control]').forEach(button=>{const key=button.dataset.control;const down=event=>{if(actionBlocked())return;held[key]=true;event.preventDefault();if(button.setPointerCapture&&event.pointerId!=null)try{button.setPointerCapture(event.pointerId)}catch(_){};};const up=event=>{held[key]=false;if(event)event.preventDefault();};button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',up);});
  $('phaserStage').addEventListener('pointerdown',event=>{if(!action||actionBlocked())return;const rect=$('phaserStage').getBoundingClientRect();if(!rect.width||!rect.height)return;const sx=(event.clientX-rect.left)/rect.width*960,sy=(event.clientY-rect.top)/rect.height*540,point=ActionArt.screenToWorld?ActionArt.screenToWorld(action,sx,sy,960,540):{x:sx,y:sy};const moved=action.moveTo(point.x,point.y);if(moved.ok){syncActionPresentation();save()}event.preventDefault()});
  window.addEventListener('blur',clearHeld);document.addEventListener('visibilitychange',()=>{clearHeld();if(document.hidden&&engine&&$('game').hidden===false&&!paused)openMenu()});
  window.addEventListener('error',event=>{if(!game&&$('game').hidden===false){$('bootError').hidden=false;$('bootErrorText').textContent=(event.message||'未知错误')+' 请重新打开完整 HTML 文件。'}});
  window.SunD20App={get engine(){return engine},get action(){return action},get game(){return game},startNew,enterGame,beginCheck,revealRoll,reroll,acceptRoll,train,openDialogue,closeDialogue,startRace,continueJourney,actionSnapshot,renderAll,openMenu,closeMenu,newChronicle,loadSaved};
  try{if(!STORY||!Engine||!Art||!ActionSim||!ActionArt)throw new Error('故事、规则或动作场景组件缺失。');applyPrefs();renderOrigins()}catch(error){$('bootError').hidden=false;$('bootErrorText').textContent=error.message;console.error(error)}
})();
