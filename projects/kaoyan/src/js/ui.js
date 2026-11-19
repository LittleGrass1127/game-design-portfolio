/* 中国式考研 · 界面模板（只读共享状态 S，返回 HTML 字符串；事件绑定在 main.js） */
(function (root) {
  'use strict';
  const CN = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];
  function createUI(S) {
    const config = S.config, text = S.text, artwork = S.artwork;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const f = value => Number(value).toFixed(1).replace(/\.0$/, '');
  const signed = value => (value > 0 ? '+' : '') + f(value);
  const btn = (action, label, cls = 'text-btn', id = '', extra = '') => `<button type="button" class="${cls}" data-action="${action}"${id !== '' ? ` data-id="${esc(id)}"` : ''} ${extra}>${label}</button>`;
  // 规则说明里用到的数值，全部由配置推出
  function rulesNumbers() {
    const e = config.efficiency, sprint = config.actions.find(a => a.category === 'sprint');
    const groups = [];
    config.caps.forEach((cap, i) => { const g = groups.find(x => x.cap === cap); if (g) g.names.push(config.subjectNames[i]); else groups.push({cap, names: [config.subjectNames[i]]}); });
    const eventWeeks = [];
    for (let w = config.eventEveryWeeks; w <= config.weeks; w += config.eventEveryWeeks) eventWeeks.push(w);
    return { energyFull: Math.round((1 - e.base) / e.energySlope), sprintCost: sprint ? sprint.cost : 0,
      caps: groups.map(g => g.names.join('、') + '满分' + g.cap).join('，'), eventWeeks };
  }
  function records() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    if (!engine) return [];
    return (engine.state.journal || []).filter(item => item.type === 'week').map(item => {
      const event = engine.state.journal.find(e => e.type === 'event' && e.week === item.week);
      return {...item, event, final: event ? event.after : item.after};
    });
  }
  function preview() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    if (!engine || engine.state.finished || engine.pendingEvent()) return null;
    return engine.preview([...plan, ...Array(Math.max(0, config.slots - plan.length)).fill(text.previewFiller)]);
  }
  function subjectShortfall() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const state = engine.state, goal = engine.goal();
    const deficits = state.scores.map((score, i) => ({i, difference: goal.minimums[i] - score, ratio: score / goal.minimums[i]})).filter(item => item.difference > 0).sort((a, b) => a.ratio - b.ratio);
    if (deficits.length) return `先补一补${config.subjectNames[deficits[0].i]}，距单科线还差 ${f(deficits[0].difference)} 分。`;
    return engine.total(state) < goal.total ? `单科都过线了，总分还差 ${f(goal.total - engine.total(state))} 分。` : '总分与单科均已达线。稳住节奏，照顾好自己。';
  }
  function header(intro = false) {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    return `<header class="site-header"><div class="brand"><span class="brand-mark" aria-hidden="true">研</span><div><strong>中国式考研</strong><small>THE LAST TWELVE WEEKS</small></div></div>${intro ? '<span class="header-note">把日子过好，把理想写近一点。</span>' : ''}<nav class="nav" aria-label="游戏菜单">${btn('sound', sound ? '♪ 音效开' : '♪ 音效关', 'text-btn', '', `aria-pressed="${sound}"`)}${!intro ? btn('diary', '日记') : ''}${btn('rules', '规则')}${!intro ? btn('restart', '重开', 'text-btn nav-reset') : ''}</nav></header>`;
  }
  function introHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    return `<div class="wrap">${header(true)}<main class="reveal"><section class="intro-hero"><div class="intro-copy"><div class="eyebrow">生活模拟 · 最后十二周</div><h1 class="serif">人生不是<br>一张<em>满分卷。</em></h1><p>距离考试，还有十二周。<br>学习、生活、预算和压力，都放上了同一张桌子。<br>这一次，试着为自己排一份刚刚好的计划。</p><div class="intro-steps"><span><b>01</b>安排时间</span><span><b>02</b>照顾自己</span><span><b>03</b>走进考场</span></div></div><div class="hero-art">${artwork}<p class="art-caption">灯还亮着，故事由你来写。</p></div></section><section class="setup" aria-label="选择背景和目标"><div><div class="setup-title"><span>01</span> 从怎样的起点出发？</div><div class="choices">${config.backgrounds.map((b,i) => btn('background', `<strong>${esc(b.name)}</strong><p>${esc(b.description)}</p><div class="mini">政治 ${b.scores[0]} · 英语 ${b.scores[1]}<br>数学 ${b.scores[2]} · 专业 ${b.scores[3]}</div>`, `choice ${selectedBackground === i ? 'selected' : ''}`, i, `aria-pressed="${selectedBackground === i}"`)).join('')}</div></div><div><div class="setup-title"><span>02</span> 为自己定一个目标。</div><div class="choices">${config.goals.map((g,i) => btn('goal', `<strong>${esc(g.name)}</strong><span class="target-score">${g.total}<small>总分目标</small></span><p>${esc(g.tagline)}</p><div class="mini">单科线 ${g.minimums.join(' / ')}</div>`, `choice ${selectedGoal === i ? 'selected' : ''}`, i, `aria-pressed="${selectedGoal === i}"`)).join('')}</div></div></section><section class="start-bar"><div><p>每周三个时段 · 单局约 10–15 分钟</p><p>院校与分数线均为游戏设定，四科顺序：政治 / 英语 / 数学 / 专业。</p></div><div class="start-actions">${saved ? btn('continue', `继续上次${saved.state.finished ? ' · 查看成绩' : ` · 第${saved.state.week}周`}`, 'secondary') : btn('import', '导入存档', 'text-btn')}${btn('start', `开始这十二周 <span aria-hidden="true">↗</span>`, 'primary')}</div></section>${storageError ? `<div class="save-fallback">${esc(storageError)}</div>` : ''}</main><footer class="footer">从今天的一个小决定，走向自己的答案。</footer></div>`;
  }
  function scoresHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const state = engine.state, goal = engine.goal();
    return `<aside class="sidebar"><section class="panel scores-panel"><div class="panel-label">我的目标<span>ADMISSION</span></div><div class="admission-heading"><span class="target-badge" aria-hidden="true">研</span><div><strong>${esc(goal.name)}</strong><small>${esc(config.backgrounds[state.background].name)}</small></div></div><div class="total-score"><strong data-value="total">${f(engine.total(state))}</strong><span>/ ${goal.total} 目标</span></div><div class="subject-list">${config.subjectNames.map((name,i) => `<div class="subject-row"><div class="subject-title"><span>${name}</span><b class="${state.scores[i] < goal.minimums[i] ? 'behind' : ''}">${f(state.scores[i])}<small> / ${goal.minimums[i]}</small></b></div><div class="bar" role="meter" aria-label="${name}成绩，单科线${goal.minimums[i]}" aria-valuemin="0" aria-valuemax="${config.caps[i]}" aria-valuenow="${f(state.scores[i])}"><span class="fill" style="width:${state.scores[i]/config.caps[i]*100}%"></span><i class="marker" style="left:${goal.minimums[i]/config.caps[i]*100}%"></i></div></div>`).join('')}</div><p class="shortfall">${subjectShortfall()}</p></section><section class="panel status-panel" aria-label="精力压力和预算"><div class="status-item"><div class="status-line"><span>精力</span><b>${f(state.energy)} <small>/ 100</small></b></div><div class="bar"><span class="fill" style="width:${state.energy}%"></span></div></div><div class="status-item stress"><div class="status-line"><span>压力</span><b class="${state.stress>text.stressWarn?'red':''}">${f(state.stress)} <small>/ 100</small></b></div><div class="bar"><span class="fill" style="width:${state.stress}%"></span></div></div><div class="cash-line"><span>生活预算<small>每周生活费 ¥${config.weeklyExpense}</small></span><b class="${state.money<0?'red':''}" data-value="money">¥${state.money}</b></div><div class="efficiency"><span>当前学习效率</span><b>${f(ExamEngine.rounded(engine.efficiency(state)*100))}%</b></div></section></aside>`;
  }
  function workspaceHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const state = engine.state;
    // 书桌提示：按 ui-text.json 中 scenes 的顺序匹配第一条
    const hit = text.scenes.find(x => x.when === 'stressAbove' ? state.stress > x.value : x.when === 'energyBelow' ? state.energy < x.value : x.when === 'weekAbove' ? state.week > x.value : true);
    const scene = [hit.title, hit.note];
    const shown = config.actions.filter(action => action.category === tab);
    return `<section class="workspace"><div class="desk-scene"><div class="scene-note"><div class="eyebrow">你的备考书桌</div><h2>${scene[0]}</h2><p>${scene[1]}</p></div>${artwork}</div><section class="panel actions-panel"><div class="section-head"><div><h2>这一周，把时间给……</h2><p>点击行动，放进右侧计划。</p></div><span class="muted" aria-hidden="true">＋</span></div><div class="tabs" role="tablist" aria-label="行动类型">${[['study','日常自习'],['sprint','冲刺训练'],['life','生活与恢复']].map(([id,name]) => btn('tab', name, `tab ${tab===id?'active':''}`, id, `role="tab" aria-selected="${tab===id}" aria-controls="action-list"`)).join('')}</div><div class="action-list" id="action-list" role="tabpanel">${shown.map(action => {
      const badge = esc(action.badge);
      const gain = action.subject >= 0 ? `基础 +${action.gain} 分${action.cost ? ` · ¥${action.cost}` : ' · 免费'}` : action.income ? `生活预算 +${action.income}` : `精力 ${signed(action.energy)} · 压力 ${signed(action.stress)}`;
      const cost = action.subject >= 0 || action.income ? `精力 ${signed(action.energy)} / 压力 ${signed(action.stress)}` : '留点空白，后面的学习会更从容';
      return btn('add', `<div class="action-head"><span class="action-symbol" aria-hidden="true">${badge}</span><strong>${esc(action.name)}</strong></div><span class="add-sign" aria-hidden="true">＋</span><p class="gain">${gain}</p><p class="cost">${cost}</p>`, `action-card ${tab}`, action.id, `${plan.length>=config.slots?'disabled':''} title="${esc(action.description)}" aria-label="加入${esc(action.name)}"`);
    }).join('')}</div><p class="action-tip">${tab==='life' ? '先恢复，再学习。<b>安排的先后顺序</b>也会影响这一周的收获。' : tab==='sprint' ? '冲刺增长更快，也更消耗身心和预算。<b>留一个恢复时段</b>，可能更划算。' : '卡片显示基础收益。实际涨分取决于行动前的状态，<b>右侧预览</b>会帮你算清楚。'}</p></section></section>`;
  }
  function planHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const p = preview();
    return `<section class="panel plan-panel" aria-label="本周计划"><div class="section-head"><h2>本周计划</h2><span class="plan-count">${plan.length} <small>/ ${config.slots}</small></span></div><ol class="slots">${Array.from({length:config.slots},(_,i) => {
      const action = plan[i] && engine.action(plan[i]);
      return `<li class="slot ${action?'filled':'empty'}"><span class="slot-no">0${i+1}</span>${action ? `<div class="slot-content"><strong>${esc(action.name)}</strong><small>${action.subject>=0?`${config.subjectNames[action.subject]}学习 · ${action.cost?'付费冲刺':'免费自习'}`:action.income>0?'安顿生活，也是向前':'给自己充点电'}</small></div><div class="slot-controls">${btn('up','↑','icon-btn',i,`aria-label="上移时段${i+1}" ${i===0?'disabled':''}`)}${btn('down','↓','icon-btn',i,`aria-label="下移时段${i+1}" ${i===plan.length-1?'disabled':''}`)}${btn('remove','×','icon-btn delete',i,`aria-label="删除时段${i+1}"`)}</div>` : '<span class="slot-content">给这一格，安排一点什么。</span>'}</li>`;
    }).join('')}</ol><div class="preview"><div class="preview-label"><h3>${plan.length===config.slots?'本周结算预览':'空位补休息后的预览'}</h3><span>不会提前消耗资源</span></div>${p?.valid ? `<div class="preview-total"><div><strong>${f(engine.total(p.after))}</strong><small>预计总分</small></div><b>${signed(ExamEngine.rounded(engine.total(p.after)-engine.total(engine.state)))} 分</b></div><div class="preview-subjects">${config.subjectNames.map((name,i) => `<span>${name}<b>${signed(ExamEngine.rounded(p.after.scores[i]-engine.state.scores[i]))}</b></span>`).join('')}</div><div class="preview-resources">周末精力 ${f(p.after.energy)} · 压力 ${f(p.after.stress)} · 预算 <span class="${p.after.money<0?'red':''}">¥${p.after.money}</span><br>已计生活费与周末恢复，未计生活事件。</div><details class="plan-details"><summary>看看每个时段的收益</summary>${p.steps.map((step,i) => `<p>${i+1}. ${esc(step.name)}<br>${step.subject>=0 ? `${config.subjectNames[step.subject]} +${f(step.gain)}，学习效率 ${f(ExamEngine.rounded(step.efficiency*100))}%` : `精力 ${f(step.after.energy)}，压力 ${f(step.after.stress)}`}</p>`).join('')}</details>` : `<div class="preview-error">${esc(p?.error || '先处理生活事件，再安排下一周。')}</div>`}</div>${btn('commit', `${engine.state.week===config.weeks?'确认安排，迎接考试':'确认安排，度过这一周'} <span aria-hidden="true">→</span>`, 'primary commit-btn', '', `${plan.length!==config.slots || !p?.valid?'disabled':''}`)}<p class="commit-note">${plan.length!==config.slots?'排满三个时段后，就可以出发了。':'确认后自动保存；这一周将不能撤回。'}</p></section>`;
  }
  function playHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const state = engine.state;
    const phase = (text.phases.find(x => state.week <= x.maxWeek) || text.phases[text.phases.length - 1]).text;
    return `<div class="wrap">${header()}<main><section class="week-top"><div class="week-info"><h1>第 <b>${state.week}</b> 周 <span>/ ${config.weeks}</span></h1><span>${phase}</span></div><div class="week-track" aria-label="已经完成${state.week-1}周">${Array.from({length:config.weeks},(_,i)=>`<i class="${i<state.week-1?'done':i===state.week-1?'current':''}"></i>`).join('')}</div></section>${!storageAvailable?`<div class="save-fallback">${esc(storageError)} ${btn('export','导出存档','text-btn')}</div>`:''}<div class="game-grid">${scoresHTML()}${workspaceHTML()}${planHTML()}</div><div class="game-bottom"><span class="storage-state">${storageAvailable?'已自动保存确认后的进度 · 未确认计划不保存':'进度仅保留在本次打开期间'}</span><span>一次决定，三个时段。一周一周，慢慢来。</span></div></main></div>`;
  }
  function reflectionHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const state=engine.state, goal=engine.goal();
    const short = config.subjectNames.map((name,i)=>({name,gap:goal.minimums[i]-state.scores[i]})).filter(item=>item.gap>0);
    const allPlans = records().flatMap(record=>record.plan);
    const isLife=id=>engine.action(id).category==='life';
    const restCount=allPlans.filter(id=>isLife(id)&&!engine.action(id).income).length, jobCount=allPlans.filter(id=>engine.action(id).income>0).length;
    let text = engine.isAdmitted() ? '你同时照顾了总分和单科线。这份安排，带你走到了想去的地方。' : short.length ? `这次还差在${short.map(item=>`${item.name} ${f(item.gap)} 分`).join('、')}。下一轮，可以更早把时段分给这些短板。` : `四科都过线了，总分还差 ${f(goal.total-engine.total(state))} 分。可以比较行动顺序，把恢复后的好状态留给收益更高的学习。`;
    return `<div class="reflection"><h3>写在这一轮之后</h3><p>${text}</p><p>你留了 ${restCount} 个时段休息或散步，做了 ${jobCount} 次兼职。${state.money<0?`还留下 ¥${-state.money} 生活欠款，下次记得为生活留一点预算。`:`最终留下 ¥${state.money}。这些取舍，也都是你走过的路。`}</p></div>`;
  }
  function endingHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const state=engine.state,goal=engine.goal(),passed=engine.isAdmitted();
    return `<div class="wrap">${header()}<main class="ending reveal"><div class="ending-head"><div class="eyebrow">最后一笔，写给自己</div><h1>${passed?'我们，真的走到了。':'这一程，也没有白走。'}</h1><p>十二周，三十六个时段。这是你交给自己的答卷。</p></div><section class="ending-paper"><div class="ending-score"><div class="panel-label" style="justify-content:center">${esc(goal.name)} · 考试成绩单</div><strong data-value="final-total">${f(engine.total(state))}</strong><p>目标总分 ${goal.total} / 满分 ${config.caps.reduce((a,b)=>a+b,0)}</p><div class="stamp ${passed?'':'failed'}">${passed?'如愿录取':'尚未达线'}</div></div><div class="ending-subjects">${config.subjectNames.map((name,i)=>`<div><span>${name}</span><strong>${f(state.scores[i])}</strong><small class="${state.scores[i]<goal.minimums[i]?'red':''}">${state.scores[i]>=goal.minimums[i]?'✓ 已达线':'差 '+f(goal.minimums[i]-state.scores[i])+' 分'} · 线${goal.minimums[i]}</small></div>`).join('')}</div>${reflectionHTML()}<div class="ending-buttons">${btn('diary','回看这十二周','secondary')}${btn('restart','再写一种可能 →','primary')}</div></section><p class="ending-quote">考试结束了，生活还在继续。${passed?'去看看，那个曾经想去的地方。':'先吃顿好饭，再决定下一步。'}</p></main><footer class="footer">本游戏的院校、分数与录取条件均为虚构。</footer></div>`;
  }
  function rulesHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    return `<div class="modal-top"><div><div class="eyebrow">不必先读懂全部公式</div><h2>先记住这几件小事。</h2></div>${btn('close','×','modal-close','','aria-label="关闭规则"')}</div><div class="rule-grid"><section class="rule-card"><h3>01 / 先安排，再确认</h3><p>每周 ${config.slots} 个时段，共 ${config.weeks} 周。同一行动可以重复。箭头调整顺序，× 移除。确认之前可以随时修改。</p></section><section class="rule-card"><h3>02 / 恢复也会带来收获</h3><p>学习按行动开始前的状态算收益。精力低于${rulesNumbers().energyFull}、压力高于${config.efficiency.stressThreshold}时效率下降；先休息再学习，可能比一直学收获更多。</p></section><section class="rule-card"><h3>03 / 生活也需要预算</h3><p>冲刺每次花费 ¥${rulesNumbers().sprintCost}。每周生活费 ¥${config.weeklyExpense}，周末精力 ${signed(config.weeklyEnergy)}、压力 ${signed(config.weeklyStress)}。兼职可以支付同周后面的冲刺。欠款时仍能自习、休息或兼职。</p></section><section class="rule-card"><h3>04 / 总分与单科都要过线</h3><p>${rulesNumbers().caps}。积累的成绩就是最后的考试成绩，不会临时掷骰子决定录取。</p></section><section class="rule-card"><h3>05 / 计划外，也有生活</h3><p>第${rulesNumbers().eventWeeks.join('、')}周结算后有一个二选一事件。每局${CN[Math.min(rulesNumbers().eventWeeks.length, config.events.length)]}个，不重复。效果直接显示，钱不够的付费选项不能选择。</p></section><section class="rule-card"><h3>06 / 随时回来，接着走</h3><p>新局、确认计划和处理事件后自动保存。未确认的计划不会保存。可以在日记中导出、导入存档，换浏览器时也能继续。</p></section></div><details class="rule-formula"><summary>想看清楚：学习效率怎样计算？</summary><p>精力系数 = min(1, ${config.efficiency.base} + ${config.efficiency.energySlope} × 精力)<br>压力系数 = 1 − max(0, 压力 − ${config.efficiency.stressThreshold}) × ${config.efficiency.stressSlope}<br>实际涨分 = 基础收益 × 精力系数 × 压力系数<br>涨分四舍五入到一位小数，成绩不超过科目满分。先计算涨分，再改变状态。</p></details><div class="modal-actions">${btn('close','知道了，试着安排一下','primary')}</div>`;
  }
  function chartHTML(items) {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    if (!items.length) return '';
    const initial=config.backgrounds[engine.state.background].scores.reduce((a,b)=>a+b,0);
    const values=[initial,...items.map(record=>engine.total(record.final))];
    const max=Math.max(engine.goal().total+20,...values)+10;
    const coords=values.map((value,i)=>[24+i*(570/Math.max(12,values.length-1)),115-(value/(max||1))*98]);
    const line=coords.map(point=>point.join(',')).join(' ');
    const targetY=115-(engine.goal().total/max)*98;
    return `<div class="chart"><svg viewBox="0 0 650 138" role="img" aria-label="总分从${initial}增长到${f(values.at(-1))}"><path d="M24 ${targetY}H594" stroke="#c6a574" stroke-dasharray="4 5" fill="none"/><text x="602" y="${targetY+3}" font-size="10" fill="#ae8b58">${engine.goal().total}</text><polygon points="${coords[0][0]},115 ${line} ${coords.at(-1)[0]},115" fill="#d8e2ca"/><polyline points="${line}" fill="none" stroke="#739365" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${coords.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="3" fill="#70905f"/><text x="${x}" y="133" fill="#93a185" text-anchor="middle" font-size="9">${i===0?'开局':i+'周'}</text>`).join('')}</svg></div>`;
  }
  function diaryHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const items=records();
    return `<div class="modal-top"><div><div class="eyebrow">那些认真生活过的日子</div><h2>我的备考日记</h2></div>${btn('close','×','modal-close','','aria-label="关闭日记"')}</div>${items.length?chartHTML(items):'<p class="empty-diary">第一页还空着。<br>从确认这一周的计划开始吧。</p>'}<div class="diary-list">${[...items].reverse().map(record=>`<article class="diary-entry"><h3><span>第 ${record.week} 周</span><span>${f(engine.total(record.final))} 分 · ¥${record.final.money}</span></h3><p>${record.plan.map(id=>esc(engine.action(id).name)).join(' → ')}</p><p>${config.subjectNames.map((name,i)=>`${name} ${signed(ExamEngine.rounded(record.final.scores[i]-record.before.scores[i]))}`).join(' · ')}</p>${record.event?`<p>生活插曲 / ${esc(record.event.title)}<br>你的选择：${esc(record.event.text)}（${esc(record.event.description)}）</p>`:''}</article>`).join('')}</div><div class="import-zone"><p>${storageAvailable?'已自动保存本机进度。导出一份备份，也可以在另一个浏览器继续。':'本地保存不可用，请导出存档保留本轮进度。'}未确认的计划不在存档中。</p>${btn('export','导出存档','secondary')}${btn('import','导入存档','secondary')}${btn('restart','重新开始','text-btn')}</div>`;
  }
  function weekHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const result=overlay.result, currentWeek=result.before.week;
    return `<div class="eyebrow">第 ${currentWeek} 周 · 小小的收获</div><h2 style="margin-top:9px">又认真地，过了一周。</h2><div class="week-result"><div><span>本周总分</span><strong style="display:block">${f(engine.total(result.after))}</strong></div><span>积累了 <b style="font-size:22px;font-weight:400">${signed(ExamEngine.rounded(engine.total(result.after)-engine.total(result.before)))}</b> 分</span></div><div class="result-actions">${result.steps.map((step,i)=>`<div class="result-step"><span>0${i+1}</span><div><strong>${esc(step.name)}</strong><small>${step.subject>=0?`学习效率 ${f(ExamEngine.rounded(step.efficiency*100))}%`:step.name.includes('兼职')?'把生活安顿好。':'暂停一下，是为了继续向前。'}</small></div><b>${step.subject>=0?'+'+f(step.gain):'✓'}</b></div>`).join('')}</div><p class="result-note">生活费已记账 ¥${config.weeklyExpense}。周末精力 ${f(result.after.energy)}，压力 ${f(result.after.stress)}，剩余预算 ¥${result.after.money}。${result.after.money<0?'免费自习和兼职仍可继续安排。':''}</p><div class="modal-actions">${btn('next',engine.pendingEvent()?'这一周，还有一件小事 →':engine.state.finished?'带着这些，走进考场 →':'收好这一页，继续向前 →','primary')}</div>`;
  }
  function eventHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    const event=engine.pendingEvent();
        return `<div class="event-label">第 ${engine.state.week} 周 / 计划之外的生活</div><div class="event-illustration" aria-hidden="true">${esc(event.symbol || '记')}</div><h2>${esc(event.title)}</h2><p class="event-body">${esc(event.body)}</p><div class="event-choices">${event.options.map((option,i)=>btn('event',`<strong>${esc(option.text)} <span aria-hidden="true" style="float:right;color:#a8b298">↗</span></strong><p>${esc(option.description)}</p>${!engine.canChoose(i)?'<small>预算不足，可以选择另一种安排。</small>':''}`,'event-choice',i,engine.canChoose(i)?'':'disabled')).join('')}</div>`;
  }
  function restartHTML() {
    const {engine, plan, tab, selectedBackground, selectedGoal, saved, storageError, storageAvailable, sound, overlay} = S;
    return `<div class="modal-top"><h2>再写一种可能？</h2></div><p class="muted">${overlay.fromStart?'开始新的十二周，会替换本机上一次的进度。':'会先回到起点，让你重新选择背景与目标。确认开始新局后，才会替换本机旧进度。'}</p><p class="muted" style="font-size:12px;margin-top:10px">想保留这一轮，可以先去日记里导出存档。</p><div class="modal-actions">${btn('cancel','先继续这一轮','secondary')}${btn('confirm-restart',overlay.fromStart?'确认开始新局':'回到起点','primary')}</div>`;
  }
  function importConfirmHTML() {
    const {overlay} = S;
    return `<div class="modal-top"><h2>继续这份备考进度？</h2></div><p class="muted">${esc(config.backgrounds[overlay.data.state.background].name)} · ${esc(config.goals[overlay.data.state.goal].name)}<br>${overlay.data.state.finished?'已完成十二周':'第 '+overlay.data.state.week+' 周'}，总分 ${f(overlay.data.state.scores.reduce((a,b)=>a+b,0))}。导入后会替换本机已保存的进度。</p><div class="modal-actions">${btn('cancel','保留当前进度','secondary')}${btn('confirm-import','确认导入','primary')}</div>`;
  }
    return { esc, f, signed, btn, records, preview, introHTML, playHTML, endingHTML, rulesHTML, diaryHTML, weekHTML, eventHTML, restartHTML, importConfirmHTML };
  }
  root.KaoyanUI = { createUI };
})(window);
