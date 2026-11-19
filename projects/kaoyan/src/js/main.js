/* 中国式考研 · 入口：持有运行状态、存档、渲染调度与事件绑定 */
(() => {
  'use strict';
  // 配置来自 config/ 配置表（config.generated.js），由规则核心组装为引擎结构
  const config = KaoyanRules.buildExamConfig(window.GAME_CONFIG);
  const app = document.getElementById('app'), overlayRoot = document.getElementById('overlay-root');
  const artwork = document.getElementById('desk-art').innerHTML;
  const KEY = 'china-exam-twelve-weeks-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  // 共享状态：界面模板只读，入口负责修改
  const S = { config, text: window.GAME_CONFIG.uiText, artwork,
    engine: null, plan: [], screen: 'intro', selectedBackground: 0, selectedGoal: 0, tab: 'study',
    overlay: null, saved: null, storageAvailable: true, storageError: '', sound: false, nextSeed: config.seed };
  const ui = KaoyanUI.createUI(S);
  let audioContext = null, toastTimer = null, lastFocus = null;

  function readSave() {
    try {
      const data = localStorage.getItem(KEY);
      if (!data) return;
      const envelope = JSON.parse(data);
      if (envelope.version !== 1 || !ExamEngine.validateState(config, envelope.state).valid) throw new Error('invalid-save');
      S.saved = envelope;
      S.sound = envelope.sound === true;
      S.nextSeed = ((envelope.state.seed ?? config.seed) + 1) | 0;
    } catch (error) {
      if (error.message === 'invalid-save' || error instanceof SyntaxError) S.storageError = '上次进度未能读取。可以导入备份，或开始新的十二周。';
      else { S.storageAvailable = false; S.storageError = '浏览器未允许本地保存；可以导出存档来保留进度。'; }
    }
  }
  function save() {
    if (!S.engine) return;
    S.saved = {version: 1, state: clone(S.engine.state), sound: S.sound};
    try { localStorage.setItem(KEY, JSON.stringify(S.saved)); S.storageAvailable = true; S.storageError = ''; }
    catch (_) { S.storageAvailable = false; S.storageError = '浏览器未允许本地保存；可以导出存档来保留进度。'; }
  }
  function notify(message) {
    const element = document.getElementById('toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2600);
  }
  function tone(kind = 'click') {
    if (!S.sound) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const frequencies = kind === 'success' ? [392, 494, 587] : kind === 'week' ? [330, 440] : [520];
      frequencies.forEach((hz, index) => {
        const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
        const start = audioContext.currentTime + index * .1;
        oscillator.type = 'sine'; oscillator.frequency.value = hz;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.028, start + .018);
        gain.gain.exponentialRampToValueAtTime(.001, start + .16);
        oscillator.connect(gain); gain.connect(audioContext.destination);
        oscillator.start(start); oscillator.stop(start + .19);
      });
    } catch (_) { S.sound = false; }
  }
  function startGame() {
    S.engine = new ExamEngine(config, ExamEngine.newGame(config, S.selectedBackground, S.selectedGoal, S.nextSeed));
    S.nextSeed = (S.nextSeed + 1) | 0;
    S.plan = []; S.tab = 'study'; S.screen = 'play'; S.overlay = null;
    save(); render(); window.scrollTo({top: 0, behavior: 'instant'}); tone('week');
  }
  function continueGame() {
    if (!S.saved) return;
    try {
      S.engine = new ExamEngine(config, clone(S.saved.state));
      S.selectedBackground = S.engine.state.background; S.selectedGoal = S.engine.state.goal;
      S.plan = []; S.tab = 'study'; S.screen = S.engine.state.finished ? 'ending' : 'play';
      S.overlay = S.engine.pendingEvent() ? {type: 'event'} : null;
      render(); window.scrollTo({top: 0, behavior: 'instant'});
    } catch (_) { notify('这份进度无法读取，请导入备份或开始新局。'); }
  }
  function renderOverlay() {
    if (!S.overlay) { overlayRoot.innerHTML=''; app.inert=false; document.body.style.overflow=''; return; }
    let html='',wide=false;
    if(S.overlay.type==='rules'){html=ui.rulesHTML();wide=true;}
    else if(S.overlay.type==='diary'){html=ui.diaryHTML();wide=true;}
    else if(S.overlay.type==='week')html=ui.weekHTML();
    else if(S.overlay.type==='event')html=ui.eventHTML();
    else if(S.overlay.type==='restart')html=ui.restartHTML();
    else if(S.overlay.type==='import-confirm')html=ui.importConfirmHTML();
    overlayRoot.innerHTML=`<div class="overlay-backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${({rules:'规则说明',diary:'备考日记',week:'本周结算',event:'生活事件',restart:'重新开始确认','import-confirm':'导入确认'})[S.overlay.type]}">${html}</section></div>`;
    app.inert=true;document.body.style.overflow='hidden';
    const first=overlayRoot.querySelector('button:not(:disabled)'); if(first)first.focus({preventScroll:true});
  }
  function render() {
    const focused=document.activeElement;
    const focusAction=focused?.dataset?.action, focusId=focused?.dataset?.id;
    app.innerHTML=S.screen==='intro'?ui.introHTML():S.screen==='ending'?ui.endingHTML():ui.playHTML();
    renderOverlay();
    if(!S.overlay&&focusAction){
      const candidate=[...app.querySelectorAll('[data-action]')].find(el=>el.dataset.action===focusAction&&el.dataset.id===focusId&&!el.disabled);
      candidate?.focus({preventScroll:true});
    }
  }
  function openOverlay(value) { lastFocus=document.activeElement;S.overlay=value;renderOverlay(); }
  function closeOverlay() { S.overlay=null;renderOverlay();lastFocus?.isConnected&&lastFocus.focus({preventScroll:true}); }
  function afterProgress() {
    if(S.engine.pendingEvent()){S.overlay={type:'event'};S.screen='play';}
    else {S.overlay=null;S.screen=S.engine.state.finished?'ending':'play';}
    render();
    if(S.screen==='ending'){window.scrollTo({top:0,behavior:'instant'});if(S.engine.isAdmitted()){tone('success');confetti();}}
  }
  function confetti() {
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const layer=document.createElement('div');layer.className='confetti';layer.setAttribute('aria-hidden','true');
    layer.innerHTML=Array.from({length:32},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${(i%7)*.09}s;transform:rotate(${i*31}deg)"></i>`).join('');
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),3800);
  }
  function exportSave() {
    if(!S.engine){notify('先开始这一轮备考，就能导出进度了。');return;}
    const text=JSON.stringify({version:1,state:S.engine.state,sound:S.sound},null,2);
    const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=`中国式考研_第${Math.min(S.engine.state.week,config.weeks)}周存档.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
    notify('存档已导出，可以带到另一个浏览器继续。');
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');
    if(!button||button.disabled)return;
    const action=button.dataset.action,id=button.dataset.id,index=Number(id);
    if(S.overlay&&!overlayRoot.contains(button))return;
    if(action!=='sound')tone();
    switch(action){
      case 'background':S.selectedBackground=index;render();break;
      case 'goal':S.selectedGoal=index;render();break;
      case 'start':if(S.saved)openOverlay({type:'restart',fromStart:true});else startGame();break;
      case 'continue':continueGame();break;
      case 'sound':S.sound=!S.sound;tone('week');if(S.engine)save();render();break;
      case 'tab':S.tab=id;render();break;
      case 'add':if(!S.engine||S.engine.pendingEvent()||S.engine.state.finished||S.plan.length>=config.slots)return;S.plan.push(id);render();notify(`已安排「${S.engine.action(id).name}」 · ${S.plan.length}/${config.slots} 时段`);break;
      case 'remove':S.plan.splice(index,1);render();break;
      case 'up':if(index>0){[S.plan[index-1],S.plan[index]]=[S.plan[index],S.plan[index-1]];render();}break;
      case 'down':if(index<S.plan.length-1){[S.plan[index+1],S.plan[index]]=[S.plan[index],S.plan[index+1]];render();}break;
      case 'commit':{
        if(S.plan.length!==config.slots)return;
        const result=S.engine.commit(S.plan);
        if(!result.ok){notify(result.error);return;}
        S.plan=[];save();S.overlay={type:'week',result};S.screen=S.engine.state.finished?'ending':'play';render();tone('week');break;
      }
      case 'next':afterProgress();break;
      case 'event':{
        if(!S.engine||!S.engine.pendingEvent())return;
        const eventTitle=S.engine.pendingEvent().options[index]?.text;
        const result=S.engine.chooseEvent(index);
        if(!result.ok){notify(result.error);return;}
        save();afterProgress();notify(`记下了：${eventTitle}`);break;
      }
      case 'rules':openOverlay({type:'rules'});break;
      case 'diary':if(S.engine)openOverlay({type:'diary'});break;
      case 'close':case 'cancel':closeOverlay();break;
      case 'restart':openOverlay({type:'restart',fromStart:false});break;
      case 'confirm-restart':{
        const immediate=S.overlay.fromStart;S.overlay=null;
        if(immediate)startGame();else{S.screen='intro';S.plan=[];render();window.scrollTo({top:0,behavior:'instant'});}break;
      }
      case 'export':exportSave();break;
      case 'import':document.getElementById('import-file').click();break;
      case 'confirm-import':{
        const data=S.overlay.data;
        S.engine=new ExamEngine(config,data.state);S.sound=data.sound===true;save();S.nextSeed=(S.engine.state.seed+1)|0;continueGame();notify('存档已导入。接着写下一页吧。');break;
      }
    }
  });
  document.addEventListener('keydown',event=>{
    if(!S.overlay)return;
    if(event.key==='Escape'&&['rules','diary','restart','import-confirm'].includes(S.overlay.type)){event.preventDefault();closeOverlay();return;}
    if(event.key==='Tab'){
      const elements=[...overlayRoot.querySelectorAll('button:not(:disabled),summary,input')].filter(el=>el.getClientRects().length);
      if(!elements.length)return;
      const first=elements[0],last=elements.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  document.getElementById('import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    if(file.size>2_000_000){notify('存档文件过大，请选择本游戏导出的 JSON。');return;}
    try{
      const data=JSON.parse(await file.text());
      if(data.version!==1||!ExamEngine.validateState(config,data.state).valid)throw new Error('invalid');
      openOverlay({type:'import-confirm',data});
    }catch(_){notify('这不是可用的备考存档，当前进度已保留。');}
  });
  window.__examQA=Object.freeze({snapshot:()=>clone({state:S.engine?.state||null,plan:S.plan,records:ui.records(),screen:S.screen,overlay:S.overlay?.type||null,storageAvailable:S.storageAvailable,savedState:S.saved?.state||null})});
  readSave();render();
})();
