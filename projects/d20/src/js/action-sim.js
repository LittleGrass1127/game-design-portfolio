/* 实时玩法模拟：合同远征（移动、寻路、自动攻击、波次、掉落）与夜航赛车（车流、吸收成长、夜雾走廊、评分）。
   纯逻辑、固定种子可复现，无 DOM。 */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const CFG = root.GAME_CONFIG;
  if (!CFG) throw new Error('缺少 GAME_CONFIG，请先加载 config.generated.js');
  const RC = CFG.race, CB = CFG.combat, BS = CFG.buildStats, EM = CFG.exploreMaps;
  // 画面几何（与渲染投影绑定，保留在代码里）
  const W = 960, H = 540, SCALE = 3.2, ANCHOR = 400;
  const BOUNDS = clone(EM.bounds);
  const ROAD = clone(RC.road);
  const LANES = RC.lanes.slice();
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const approach = (n, goal, amount) => n < goal ? Math.min(goal, n + amount) : Math.max(goal, n - amount);
  const good = extra => ({ ok: true, ...extra });
  const bad = error => ({ ok: false, error });
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  // 四幕远征地图：explore-maps.json
  const MAPS = clone(EM.maps);
  const OBJECTIVE_REWARDS = EM.objectiveRewards;
  // 逐幕无人机数值：combat-acts.csv；赛段长度：race-legs.csv
  const actCombat = act => CFG.combatActs.find(r => r.act === act);
  const trackLength = act => RC.track.lengthBase + act * RC.track.lengthPerAct;
  const MAX_LEG = CFG.raceLegs.length;
  // 档位判定：race-tiers.csv 自上而下第一条满足的档位（and=两项都达标，or=任一达标）
  function tierFor(absorbed, maxCombo) {
    for (const t of CFG.raceTiers) {
      const a = absorbed >= t.absorbedMin, c = maxCombo >= t.comboMin;
      if (t.logic === 'and' ? a && c : a || c) return t.tier;
    }
    return CFG.raceTiers[CFG.raceTiers.length - 1].tier;
  }
  function tierDelta(tier) {
    const row = CFG.raceTiers.find(t => t.tier === tier), out = {};
    for (const k of ['leverage', 'reputation', 'pressure']) if (row[k] != null) out[k] = row[k];
    return out;
  }
  function freeze(value) { Object.values(value).forEach(v => { if (v && typeof v === 'object') freeze(v); }); return Object.freeze(value); }
  freeze(MAPS);
  // 车辆模组：vehicle-modules.csv（effect 列只给界面用）
  const MODULES = Object.fromEntries(CFG.vehicleModules.map(m => [m.id, { id: m.id, title: m.title, speed: m.speed, acceleration: m.acceleration, handling: m.handling, drain: m.drain, regen: m.regen, comboWindow: m.comboWindow, hitbox: m.hitbox, zoneDrain: m.zoneDrain }]));
  freeze(MODULES);
  // 行动卡与营地房间：action-cards.csv / camp-rooms.csv
  const BUILD_RULES = freeze({
    cards: Object.fromEntries(CFG.actionCards.map(c => [c.id, { title: c.title, description: c.description }])),
    rooms: Object.fromEntries(CFG.campRooms.map(r => [r.id, { title: r.title, description: r.description }])),
    maxCards: BS.maxCards, maxRooms: BS.maxRooms
  });
  const emptyBuild = () => ({ cards: Object.fromEntries(CFG.actionCards.map(c => [c.id, 0])), rooms: Object.fromEntries(CFG.campRooms.map(r => [r.id, 0])) });
  function validBuild(build) {
    if (!build || typeof build !== 'object' || Array.isArray(build) || Object.keys(build).sort().join() !== 'cards,rooms') return false;
    for (const [key, cap] of [['cards', BS.maxCards], ['rooms', BS.maxRooms]]) {
      const values = build[key], expected = Object.keys(BUILD_RULES[key]);
      if (!values || typeof values !== 'object' || Array.isArray(values) || Object.keys(values).sort().join() !== expected.sort().join()) return false;
      if (Object.values(values).some(value => !Number.isInteger(value) || value < 0 || value > cap) || Object.values(values).reduce((sum, value) => sum + value, 0) > cap) return false;
    }
    return true;
  }
  // 构筑 -> 实时属性（系数见 build-stats.json）
  function buildStats(build) {
    const c = build.cards, r = build.rooms, k = BS;
    return { moveSpeed: k.moveSpeed.base * (1 + c.nerve * k.moveSpeed.perNerve), damage: k.damage.base * (1 + r.workshop * k.damage.perWorkshop), attackInterval: k.attackInterval.base / (1 + c.craft * k.attackInterval.perCraft),
      attackRange: k.attackRange.base + r.command * k.attackRange.perCommand, attackTargets: Math.min(k.attackTargets.max, k.attackTargets.base + c.rhetoric * k.attackTargets.perRhetoric), spreadRadius: k.spreadRadius.base + c.rhetoric * k.spreadRadius.perRhetoric,
      pickupRange: k.pickupRange.base + c.insight * k.pickupRange.perInsight, raceHitbox: k.raceHitbox.base + c.insight * k.raceHitbox.perInsight, raceSpeed: k.raceSpeed.base + c.nerve * k.raceSpeed.perNerve,
      raceRegen: c.craft * k.raceRegen.perCraft, hitRefill: k.hitRefill.base + r.workshop * k.hitRefill.perWorkshop, hitKick: k.hitKick.base + r.workshop * k.hitKick.perWorkshop,
      maxHealth: k.maxHealth.base + r.infirmary * k.maxHealth.perInfirmary, repair: r.infirmary * k.repair.perInfirmary, stormResistance: 1 / (1 + r.infirmary * k.stormResistance.perInfirmary), corridorBonus: r.command * k.corridorBonus.perCommand };
  }
  // 速度上限的理论最大值（最快模组 × 满卡胆识 × 满成长 × 上限倍率），用于存档校验
  const SPEED_CEILING_MAX = RC.base.speed * Math.max(...CFG.vehicleModules.map(m => m.speed)) * (BS.raceSpeed.base + BS.maxCards * BS.raceSpeed.perNerve) * (1 + RC.growth.max * RC.growth.speed) * RC.speedCeilingMultiplier;
  function combatDefaults() { return { enemies: [], pickups: [], health: BS.maxHealth.base, maxHealth: BS.maxHealth.base, kills: 0, scrap: 0, scrapGenerated: 0, wave: 0, waveTotal: CB.waves, enemiesSpawned: 0, combatTime: 0, attackTimer: 0, hurtTimer: 0, combatCleared: false }; }
  function moduleSpec(id) { return MODULES[id] || null; }
  function applyModuleStats(s) {
    const spec = moduleSpec(s.module) || MODULES.balanced, build = buildStats(s.build);
    s.baseSpeed = RC.base.speed * spec.speed * build.raceSpeed;
    s.maxSpeed = s.baseSpeed * (1 + s.growth * RC.growth.speed);
    s.acceleration = RC.base.acceleration * spec.acceleration * (1 + s.growth * RC.growth.acceleration);
    s.handling = RC.base.handling * spec.handling * (1 + s.growth * RC.growth.handling);
    s.speedCeiling = Math.max(s.speedCeiling || 0, s.maxSpeed * RC.speedCeilingMultiplier);
  }
  // 夜雾安全走廊：开局 startDelay 秒后合拢，每 phaseDuration 秒按 laneOrder 换道
  function corridorFor(state) {
    const K = RC.corridor, time = Math.max(0, Number(state?.time) || 0), seed = Number(state?.seed) >>> 0;
    if (time < K.startDelay) return { active: false, center: 480, nextCenter: 480, halfWidth: K.openHalfWidth, warning: false, safe: true, phase: 0, remaining: K.startDelay - time };
    const elapsed = time - K.startDelay, duration = K.phaseDuration, phase = Math.floor(elapsed / duration), within = elapsed % duration;
    const order = K.laneOrder, offset = (seed + (state?.act || 1) * K.actOffset) % order.length;
    const center = LANES[order[(phase + offset) % order.length]], nextCenter = LANES[order[(phase + 1 + offset) % order.length]];
    const halfWidth = K.baseHalfWidth + (state?.build?.rooms?.command || 0) * BS.corridorBonus.perCommand, warning = within >= duration - K.warningLead;
    return { active: true, center, nextCenter, halfWidth, warning, safe: Math.abs((state?.player?.x ?? 480) - center) <= halfWidth, phase: phase + 1, remaining: duration - within };
  }
  function scoreFor(state) {
    const progress = clamp((Number(state?.distance) || 0) / Math.max(1, Number(state?.length) || 1), 0, 1);
    const w = RC.score;
    return Math.round(progress * w.progress + (Number(state?.absorbed) || 0) * w.absorbed + (Number(state?.maxCombo) || 0) * w.maxCombo + (Number(state?.precisionHits) || 0) * w.precisionHit + (Number(state?.safeTime) || 0) * w.safeSecond);
  }
  function raceMetrics(s) { return { module: s.module, score: scoreFor(s), precisionHits: s.precisionHits, safeTime: s.safeTime, dangerTime: s.dangerTime, safety: s.time > 0 ? s.safeTime / s.time : 1 }; }
  function migrateState(state) {
    const s = clone(state);
    if (s?.version !== 1) return s;
    s.module ??= 'balanced'; s.safeTime ??= s.mode === 'race' ? s.time : 0; s.dangerTime ??= 0; s.precisionHits ??= 0;
    s.build = emptyBuild(); Object.assign(s, combatDefaults()); s.speedCeiling = s.maxSpeed * RC.speedCeilingMultiplier;
    s.version = 2;
    if (s.result) {
      delete s.result.rank; delete s.result.standings; Object.assign(s.result, raceMetrics(s));
      for (const reward of s.rewards || []) if (reward.id === s.result.id) { delete reward.rank; delete reward.standings; Object.assign(reward, raceMetrics(s)); }
    }
    return s;
  }
  function blocked(point, obstacles, radius = 12) {
    if (point.x < BOUNDS.x + radius || point.x > BOUNDS.x + BOUNDS.w - radius || point.y < BOUNDS.y + radius || point.y > BOUNDS.y + BOUNDS.h - radius) return true;
    return obstacles.some(rect => Math.hypot(point.x - clamp(point.x, rect.x, rect.x + rect.w), point.y - clamp(point.y, rect.y, rect.y + rect.h)) < radius - 1e-6);
  }
  function contact(a, b, halfW, halfH) {
    let begin = 0, end = 1;
    for (const [start, finish, size] of [[b.x0 - a.x0, b.x1 - a.x1, halfW], [b.y0 - a.y0, b.y1 - a.y1, halfH]]) {
      const speed = finish - start;
      if (Math.abs(speed) < 1e-10) { if (Math.abs(start) > size) return null; continue; }
      const f = (-size - start) / speed, g = (size - start) / speed;
      begin = Math.max(begin, Math.min(f, g)); end = Math.min(end, Math.max(f, g));
      if (begin > end) return null;
    }
    return begin;
  }
  class SunD20ActionSim {
    constructor(options = {}) {
      if (options.state !== undefined) {
        const candidate = migrateState(options.state);
        const checked = SunD20ActionSim.validate(candidate);
        if (!checked.valid) throw new Error(checked.error);
        this.state = candidate; return;
      }
      const mode = options.mode || 'explore', act = options.act ?? 1, seed = options.seed ?? CFG.rules.defaultSeed, module = mode === 'race' ? (options.module || 'balanced') : 'balanced';
      const build = options.build === undefined ? emptyBuild() : options.build;
      if (!['explore', 'race'].includes(mode) || !Number.isInteger(act) || act < 1 || act > 4 || !Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) throw new Error('实时玩法参数无效。');
      if (!moduleSpec(module)) throw new Error('车辆模组无效。');
      if (!validBuild(build)) throw new Error('卡组或据点层数无效。');
      const id = options.id || (mode === 'race' ? CFG.raceLegs[Math.min(MAX_LEG, act) - 1].id : 'explore-' + act);
      if (typeof id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(id)) throw new Error('实时玩法编号无效。');
      this.state = { version: 2, id, seed, rngState: seed, mode, act, startAct: act, theme: MAPS[act - 1].theme, build: clone(build), ...combatDefaults(),
        phase: 'playing', paused: false, time: 0, world: { width: W, height: H }, bounds: clone(BOUNDS), road: clone(ROAD),
        player: { x: 480, y: 400, vx: 0, vy: 0, radius: mode === 'race' ? 18 : 12, width: 36, height: 64 },
        target: null, path: [], obstacles: [], objectives: [], objectiveIndex: 0, pendingObjective: null, actComplete: false, completedActs: [], finished: false,
        events: [], eventSerial: 0, rewards: [], rewardTotals: { capital: 0, reputation: 0, leverage: 0, pressure: 0 },
        traffic: [], trafficGenerated: 0, distance: 0, speed: 0, length: trackLength(act), timeLimit: RC.track.timeLimit,
        module, baseSpeed: RC.base.speed, maxSpeed: RC.base.speed, acceleration: RC.base.acceleration, handling: RC.base.handling, energy: RC.base.energy, boosting: false, safeTime: 0, dangerTime: 0,
        absorbed: 0, precisionHits: 0, growth: 0, combo: 0, maxCombo: 0, lastHitTime: -1, lastWallTime: -1, result: null };
      applyModuleStats(this.state);
      this.state.maxHealth = buildStats(build).maxHealth; this.state.health = this.state.maxHealth;
      if (mode === 'explore') {
        this._map(act);
        if (options.exploreProgress !== undefined && !this.syncExploreProgress(options.exploreProgress).ok) throw new Error('探索进度无效。');
      } else this._traffic();
    }
    get player() { return this.state.player; }
    get mode() { return this.state.mode; }
    get events() { return this.state.events; }
    module() { return clone(moduleSpec(this.state.module)); }
    buildStats() { return clone(buildStats(this.state.build)); }
    corridor() { return clone(corridorFor(this.state)); }
    score() { return scoreFor(this.state); }
    syncBuild(build) {
      if (!validBuild(build)) return bad('卡组最多12层，据点最多3层，且每层必须是非负整数。');
      const s = this.state, previousMax = s.maxHealth;
      s.build = clone(build); applyModuleStats(s); s.maxHealth = buildStats(s.build).maxHealth;
      s.health = clamp(s.health + Math.max(0, s.maxHealth - previousMax), 1, s.maxHealth);
      return good({ build: clone(s.build), stats: this.buildStats() });
    }
    _random() {
      const state = this.state; state.rngState = (state.rngState + 0x6D2B79F5) >>> 0;
      let t = state.rngState; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    _event(type, x, y, extra = {}) {
      const s = this.state;
      const event = { id: 'action-' + s.seed + '-' + (++s.eventSerial), type, x, y, time: s.time, ...extra };
      s.events.push(event); if (s.events.length > 64) s.events.shift(); return event;
    }
    _map(act) {
      const s = this.state, map = MAPS[act - 1]; s.act = act; s.theme = map.theme;
      Object.assign(s, combatDefaults()); s.maxHealth = buildStats(s.build).maxHealth; s.health = s.maxHealth;
      s.player.x = map.start.x; s.player.y = map.start.y; s.player.vx = 0; s.player.vy = 0;
      s.obstacles = map.obstacles.map((ob, i) => ({ id: 'obstacle-' + act + '-' + i, ...clone(ob) }));
      const deltas = clone(OBJECTIVE_REWARDS);
      s.objectives = map.objectives.map((goal, i) => ({ id: 'act-' + act + '-objective-' + i, ...clone(goal), radius: EM.objectiveRadius, locked: i > 0, completed: false, reward: deltas[i] }));
      s.objectiveIndex = 0; s.pendingObjective = null; s.actComplete = false; s.phase = 'playing'; s.finished = false; s.target = null; s.path = [];
    }
    syncExploreProgress(count) {
      const s = this.state;
      if (s.mode !== 'explore' || !Number.isInteger(count) || count < 0 || count > 3) return bad('探索进度无效。');
      s.objectiveIndex = count; s.pendingObjective = null;
      s.objectives.forEach((goal, i) => { goal.completed = i < count; goal.locked = i > count; });
      s.actComplete = count === 3; s.phase = s.actComplete ? 'completed' : 'playing'; s.finished = s.actComplete && s.act === 4;
      s.completedActs = s.completedActs.filter(act => act !== s.act); if (s.actComplete) s.completedActs.push(s.act);
      s.target = null; s.path = []; s.player.vx = 0; s.player.vy = 0;
      return good({ objectiveIndex: count, actComplete: s.actComplete });
    }
    setPaused(value) { if (typeof value !== 'boolean') return bad('暂停状态无效。'); this.state.paused = value; return good({ paused: value }); }
    setModule(id) {
      const s = this.state;
      if (s.mode !== 'race' || s.phase !== 'playing' || s.time !== 0 || s.absorbed !== 0 || s.paused || !moduleSpec(id) || ['balanced', 'undecided'].includes(id)) return bad('只能在点火前选择一项车辆模组。');
      s.module = id; applyModuleStats(s); return good({ module: clone(moduleSpec(id)) });
    }
    setAct(act) {
      const s = this.state;
      if (s.mode !== 'explore' || !s.actComplete || s.paused || !Number.isInteger(act) || act !== s.act + 1 || act > 4) return bad('完成当前区域的三个目标后，才能进入下一幕。');
      this._map(act); this._event('act', s.player.x, s.player.y, { act }); return good({ act });
    }
    _pathTo(target) {
      const s = this.state, cell = 22, cols = 44, rows = 25;
      const point = id => ({ x: (id % cols) * cell + 11, y: Math.floor(id / cols) * cell + 11 });
      const usable = id => id >= 0 && id < cols * rows && !blocked(point(id), s.obstacles, 16);
      const nearest = goal => {
        let best = -1, gap = Infinity;
        for (let id = 0; id < cols * rows; id++) if (usable(id)) { const d = distance(point(id), goal); if (d < gap) { gap = d; best = id; } }
        return best;
      };
      const start = nearest(s.player), end = nearest(target); if (start < 0 || end < 0) return null;
      const open = new Set([start]), from = new Map(), costs = new Map([[start, 0]]), closed = new Set();
      while (open.size) {
        let current = -1, score = Infinity;
        for (const id of open) { const f = costs.get(id) + distance(point(id), point(end)); if (f < score || (f === score && id < current)) { score = f; current = id; } }
        if (current === end) {
          const route = []; let node = end; while (node !== start) { route.unshift(point(node)); node = from.get(node); }
          route.push(clone(target)); return route;
        }
        open.delete(current); closed.add(current);
        const cx = current % cols, cy = Math.floor(current / cols);
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          const nx = cx + dx, ny = cy + dy, id = ny * cols + nx;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || closed.has(id) || !usable(id)) continue;
          if (dx && dy && (!usable(cy * cols + nx) || !usable(ny * cols + cx))) continue;
          const cost = costs.get(current) + cell * Math.hypot(dx, dy);
          if (cost < (costs.get(id) ?? Infinity)) { costs.set(id, cost); from.set(id, current); open.add(id); }
        }
      }
      return null;
    }
    moveTo(x, y) {
      const s = this.state;
      if (!finite(x) || !finite(y) || s.paused || s.phase !== 'playing') return bad('现在不能移动到这个位置。');
      if (s.mode === 'race') { s.target = { x: clamp(x, ROAD.left + 18, ROAD.right - 18), y: clamp(y, 140, 462) }; return good({ target: clone(s.target) }); }
      const target = { x, y }; if (blocked(target, s.obstacles, s.player.radius)) return bad('这里被障碍挡住了。');
      const route = this._pathTo(target); if (!route) return bad('这里暂时没有可通行的路径。');
      s.target = target; s.path = route; return good({ target: clone(target) });
    }
    canInteract() {
      const s = this.state, goal = s.objectives[s.objectiveIndex];
      return Boolean(s.mode === 'explore' && s.phase === 'playing' && !s.paused && goal && !goal.locked && !goal.completed && distance(s.player, goal) <= goal.radius + s.player.radius);
    }
    _reward(id, delta, extra = {}) {
      const s = this.state; if (s.rewards.some(r => r.id === id)) return null;
      const reward = { id, mode: s.mode, act: s.act, delta: clone(delta), claimed: false, ...extra };
      s.rewards.push(reward); for (const [key, value] of Object.entries(delta)) s.rewardTotals[key] = (s.rewardTotals[key] || 0) + value;
      return reward;
    }
    interact(id) {
      const s = this.state, goal = s.objectives[s.objectiveIndex];
      if (!this.canInteract() || (id !== undefined && id !== goal.id)) return bad('请先靠近当前亮起的目标。');
      s.pendingObjective = goal.id; s.target = null; s.path = []; s.player.vx = 0; s.player.vy = 0;
      return good({ ready: true, target: clone(goal), objective: clone(goal) });
    }
    completeObjective(id) {
      const s = this.state, goal = s.objectives[s.objectiveIndex];
      if (s.mode !== 'explore' || s.phase !== 'playing' || !goal || s.pendingObjective !== goal.id || (id !== undefined && id !== goal.id)) return bad('请先开启当前目标，并接受对话结果。');
      s.pendingObjective = null;
      goal.completed = true; s.objectiveIndex++;
      const reward = this._reward('explore-' + s.seed + '-' + goal.id, goal.reward, { source: goal.id });
      this._event('interact', goal.x, goal.y, { objectiveId: goal.id, title: goal.title });
      s.target = null; s.path = []; s.player.vx = 0; s.player.vy = 0;
      if (s.objectiveIndex === 3) {
        s.actComplete = true; s.completedActs.push(s.act); s.phase = 'completed'; s.finished = s.act === 4;
        this._event('explore-complete', goal.x, goal.y, { act: s.act });
      } else s.objectives[s.objectiveIndex].locked = false;
      return good({ objective: clone(goal), reward: clone(reward), actComplete: s.actComplete, completed: s.finished, nextObjective: clone(s.objectives[s.objectiveIndex] || null) });
    }
    claimRewards() {
      const s = this.state, rewards = s.rewards.filter(r => !r.claimed);
      if (!rewards.length) return bad('没有尚未领取的奖励。');
      const total = {}; for (const reward of rewards) { reward.claimed = true; for (const [key, value] of Object.entries(reward.delta)) total[key] = (total[key] || 0) + value; }
      return good({ rewards: clone(rewards), total, ...(s.mode === 'race' && s.result ? clone(s.result) : {}) });
    }
    _traffic() {
      const s = this.state;
      s.traffic = s.traffic.filter(car => !car.absorbed && car.y < 675 && car.y > -430);
      if (s.finished || s.phase !== 'playing') return;
      const T = RC.traffic;
      while (s.traffic.length < T.maxOnRoad && s.trafficGenerated < T.total) {
        const lead = (ANCHOR - s.player.y) / SCALE;
        const gaps = [32, ...s.traffic.map(c => c.distance - s.distance - lead).filter(g => g > 32 && g < 148), 148].sort((a, b) => a - b);
        let lo = gaps[0], hi = gaps[1]; for (let i = 1; i < gaps.length - 1; i++) if (gaps[i + 1] - gaps[i] > hi - lo) { lo = gaps[i]; hi = gaps[i + 1]; }
        const gap = (lo + hi) / 2 + (this._random() - 0.5) * Math.min(8, (hi - lo) * 0.25);
        const serial = ++s.trafficGenerated, lane = (serial + Math.floor(this._random() * 3)) % LANES.length;
        const distanceAt = s.distance + lead + gap, speed = T.speedMin + this._random() * T.speedJitter;
        s.traffic.push({ id: 'car-' + s.seed + '-' + serial, x: LANES[lane], y: ANCHOR - (distanceAt - s.distance) * SCALE, vx: 0, vy: 0,
          distance: distanceAt, speed, lane, width: 34, height: 62, absorbed: false, color: T.colors[serial % T.colors.length],
          spawnTime: s.time, spawnDistance: distanceAt, nextLaneTime: s.time + T.laneChangeFirst[0] + this._random() * T.laneChangeFirst[1] });
      }
    }
    _explore(dt, axes) {
      const s = this.state, p = s.player, stats = buildStats(s.build);
      let x = axes.x, y = axes.y;
      if (x || y) { s.target = null; s.path = []; }
      else if (s.path.length) {
        while (s.path.length > 1 && distance(p, s.path[0]) < 15) s.path.shift();
        const node = s.path[0], gap = distance(p, node);
        if (gap < 5 && s.path.length === 1) { s.path = []; s.target = null; p.vx = 0; p.vy = 0; }
        else { x = (node.x - p.x) / Math.max(gap, 1); y = (node.y - p.y) / Math.max(gap, 1); }
      }
      p.vx = approach(p.vx, x * stats.moveSpeed, dt * 1050); p.vy = approach(p.vy, y * stats.moveSpeed, dt * 1050);
      const slices = Math.max(1, Math.ceil(Math.max(Math.abs(p.vx), Math.abs(p.vy)) * dt / 5));
      for (let i = 0; i < slices; i++) {
        const nextX = { x: p.x + p.vx * dt / slices, y: p.y };
        if (!blocked(nextX, s.obstacles, p.radius)) p.x = nextX.x; else p.vx = 0;
        const nextY = { x: p.x, y: p.y + p.vy * dt / slices };
        if (!blocked(nextY, s.obstacles, p.radius)) p.y = nextY.y; else p.vy = 0;
      }
      this._combat(dt, stats);
    }
    _dropPoint(point) {
      const s = this.state;
      if (!blocked(point, s.obstacles, 14)) return { x: point.x, y: point.y };
      let best = { x: s.player.x, y: s.player.y }, gap = distance(point, best);
      for (let y = 104; y <= 472; y += 16) for (let x = 58; x <= 902; x += 16) {
        const p = { x, y }, d = distance(point, p);
        if (d < gap && !blocked(p, s.obstacles, 14)) { best = p; gap = d; }
      }
      return best;
    }
    _spawnWave() {
      const s = this.state, A = actCombat(s.act); s.wave++;
      for (let i = 0; i < A.enemiesPerWave; i++) {
        let pos = null, bestGap = -1;
        for (let attempt = 0; attempt < 10; attempt++) {
          const angle = this._random() * Math.PI * 2, radius = CB.spawnRadius[0] + this._random() * CB.spawnRadius[1];
          const candidate = { x: clamp(s.player.x + Math.cos(angle) * radius, 56, 904), y: clamp(s.player.y + Math.sin(angle) * radius, 102, 476) }, gap = distance(s.player, candidate);
          if (gap > bestGap) { pos = candidate; bestGap = gap; } if (gap >= CB.spawnMinGap) break;
        }
        const serial = ++s.enemiesSpawned, hp = A.enemyHp;
        s.enemies.push({ id: 'drone-' + s.seed + '-' + s.act + '-' + serial, ...pos, vx: 0, vy: 0, radius: CB.enemyRadius, hp, maxHp: hp, speed: A.enemySpeedMin + this._random() * A.enemySpeedJitter, wave: s.wave });
      }
      this._event('wave', s.player.x, s.player.y, { wave: s.wave, total: s.waveTotal });
    }
    _combat(dt, stats) {
      const s = this.state, p = s.player, A = actCombat(s.act);
      s.combatTime += dt; s.attackTimer = Math.max(0, s.attackTimer - dt); s.hurtTimer = Math.max(0, s.hurtTimer - dt);
      s.health = Math.min(s.maxHealth, s.health + stats.repair * dt);
      while (s.wave < CB.waves && s.combatTime >= CB.firstWaveAt + s.wave * CB.waveInterval) this._spawnWave();
      for (const enemy of s.enemies) {
        const gap = distance(enemy, p), reach = Math.min(gap, enemy.speed * dt);
        enemy.vx = gap > 0 ? (p.x - enemy.x) / gap * enemy.speed : 0; enemy.vy = gap > 0 ? (p.y - enemy.y) / gap * enemy.speed : 0;
        if (gap > 0) { enemy.x += (p.x - enemy.x) / gap * reach; enemy.y += (p.y - enemy.y) / gap * reach; }
        if (distance(enemy, p) < p.radius + enemy.radius + 3 && s.hurtTimer === 0) {
          const damage = Math.min(s.health - 1, A.contactDamage); s.health -= damage; s.hurtTimer = CB.hurtCooldown;
          this._event('hurt', p.x, p.y, { enemyId: enemy.id, value: damage, health: s.health });
        }
      }
      if (s.attackTimer === 0) {
        const nearby = s.enemies.filter(enemy => distance(enemy, p) <= stats.attackRange).sort((a, b) => distance(a, p) - distance(b, p) || a.id.localeCompare(b.id));
        if (nearby.length) {
          const targets = [nearby[0], ...nearby.slice(1).filter(enemy => distance(enemy, nearby[0]) <= stats.spreadRadius)].slice(0, stats.attackTargets);
          s.attackTimer = stats.attackInterval;
          for (const enemy of targets) {
            const damage = Math.min(enemy.hp, stats.damage); enemy.hp -= damage;
            this._event('shot', p.x, p.y, { toX: enemy.x, toY: enemy.y, enemyId: enemy.id, damage });
            this._event('enemy-hit', enemy.x, enemy.y, { enemyId: enemy.id, value: damage, hp: enemy.hp });
            if (enemy.hp <= 0) {
              const value = A.scrapValue, point = this._dropPoint(enemy); s.kills++; s.scrapGenerated += value;
              s.pickups.push({ id: 'scrap-' + enemy.id, ...point, radius: CB.pickupRadius, value });
              this._event('enemy-down', enemy.x, enemy.y, { enemyId: enemy.id, value });
            }
          }
          s.enemies = s.enemies.filter(enemy => enemy.hp > 0);
        }
      }
      s.pickups = s.pickups.filter(pickup => {
        const gap = distance(pickup, p);
        if (gap > stats.pickupRange) return true;
        if (gap <= p.radius + pickup.radius + CB.pickupPullSpeed * dt) {
          s.scrap += pickup.value; this._event('pickup', pickup.x, pickup.y, { pickupId: pickup.id, value: pickup.value }); return false;
        }
        pickup.x += (p.x - pickup.x) / gap * CB.pickupPullSpeed * dt; pickup.y += (p.y - pickup.y) / gap * CB.pickupPullSpeed * dt; return true;
      });
      s.combatCleared = s.wave === CB.waves && s.enemies.length === 0;
    }
    _race(dt, axes, input) {
      const s = this.state, p = s.player, before = { x0: p.x, y0: p.y }, previousDistance = s.distance;
      if (s.module === 'undecided') return;
      let x = axes.x, y = axes.y;
      if (x || y) s.target = null;
      else if (s.target) { x = clamp((s.target.x - p.x) / 65, -1, 1); y = clamp((s.target.y - p.y) / 65, -1, 1); if (distance(p, s.target) < 5) s.target = null; }
      const spec = moduleSpec(s.module) || MODULES.balanced, build = buildStats(s.build), boost = Boolean(input.boost) && s.energy > RC.boost.minEnergy && !input.brake;
      s.boosting = boost;
      const targetSpeed = s.maxSpeed * (boost ? RC.boost.speedMultiplier : 1);
      s.speed = input.brake ? Math.max(0, s.speed - RC.brakeDecel * dt) : Math.max(s.speed, approach(s.speed, targetSpeed, s.acceleration * dt * (boost ? RC.boost.accelMultiplier : 1)));
      p.vx = approach(p.vx, x * s.handling, dt * 1000); p.vy = approach(p.vy, y * RC.base.verticalSpeed, dt * 900);
      p.x += p.vx * dt; p.y += p.vy * dt;
      let wallSide = 0;
      if (p.x < ROAD.left + 18) { p.x = ROAD.left + 18; p.vx = Math.abs(p.vx) * 0.64; wallSide = 1; }
      if (p.x > ROAD.right - 18) { p.x = ROAD.right - 18; p.vx = -Math.abs(p.vx) * 0.64; wallSide = -1; }
      if (p.y < 140) { p.y = 140; p.vy = Math.abs(p.vy) * 0.35; }
      if (p.y > 462) { p.y = 462; p.vy = -Math.abs(p.vy) * 0.35; }
      const corridor = corridorFor(s);
      if (corridor.safe) s.safeTime += dt; else s.dangerTime += dt;
      s.energy = clamp(s.energy + (boost ? -spec.drain : spec.regen + build.raceRegen) * dt - (corridor.safe ? 0 : RC.corridor.drainPerSecond * spec.zoneDrain * build.stormResistance) * dt, 0, RC.base.energy);
      if (wallSide && s.time - s.lastWallTime >= 0.25) { s.lastWallTime = s.time; this._event('wall', p.x, p.y, { side: wallSide, combo: s.combo }); }
      s.distance += s.speed / 3.6 * dt;
      const playerMotion = { ...before, x1: p.x, y1: p.y };
      const contacts = [];
      for (const car of s.traffic) {
        const previous = { x0: car.x, y0: car.y };
        if (s.time >= car.nextLaneTime) {
          car.nextLaneTime = s.time + RC.traffic.laneChangeEvery[0] + this._random() * RC.traffic.laneChangeEvery[1];
          const next = clamp(car.lane + (this._random() > 0.5 ? 1 : -1), 0, 4);
          if (!s.traffic.some(other => other !== car && Math.abs(other.distance - car.distance) < 24 && Math.abs(other.x - LANES[next]) < 50)) car.lane = next;
        }
        car.vx = approach(car.vx, clamp((LANES[car.lane] - car.x) * 2, -65, 65), dt * 170);
        car.x += car.vx * dt; car.distance += car.speed / 3.6 * dt;
        car.y = ANCHOR - (car.distance - s.distance) * SCALE; car.vy = (car.y - previous.y0) / dt;
        const fraction = contact(playerMotion, { ...previous, x1: car.x, y1: car.y }, (p.width + car.width) * 0.46 * spec.hitbox * build.raceHitbox, (p.height + car.height) * 0.43);
        const finishFraction = s.distance >= s.length ? (s.length - previousDistance) / Math.max(1e-9, s.distance - previousDistance) : Infinity;
        if (fraction !== null && fraction < finishFraction) contacts.push({ car, fraction, previous });
      }
      if (build.attackTargets > 1 && contacts.length) {
        const queued = new Set(contacts.map(hit => hit.car.id));
        for (const first of [...contacts]) {
          const near = s.traffic.filter(car => !queued.has(car.id) && !car.absorbed && distance(car, first.car) <= build.spreadRadius).sort((a, b) => distance(a, first.car) - distance(b, first.car) || a.id.localeCompare(b.id));
          for (const car of near.slice(0, build.attackTargets - 1)) {
            queued.add(car.id); contacts.push({ car, fraction: first.fraction, previous: { x0: car.x, y0: car.y }, spread: true });
          }
        }
      }
      contacts.sort((a, b) => a.fraction - b.fraction || a.car.id.localeCompare(b.car.id));
      for (const hit of contacts) {
        if (hit.car.absorbed || s.absorbed >= RC.traffic.total) continue;
        const car = hit.car; car.absorbed = true; s.absorbed++; s.growth = Math.min(RC.growth.max, s.absorbed); applyModuleStats(s);
        s.speed = Math.max(s.speed, Math.min(s.speed + build.hitKick, s.maxSpeed * RC.speedCeilingMultiplier)); s.energy = Math.min(RC.base.energy, s.energy + build.hitRefill);
        s.combo = s.lastHitTime >= 0 && s.time - s.lastHitTime <= spec.comboWindow ? s.combo + 1 : 1; s.lastHitTime = s.time; s.maxCombo = Math.max(s.maxCombo, s.combo);
        const hitX = hit.previous.x0 + (car.x - hit.previous.x0) * hit.fraction, hitY = hit.previous.y0 + (car.y - hit.previous.y0) * hit.fraction;
        const playerX = before.x0 + (p.x - before.x0) * hit.fraction, playerY = before.y0 + (p.y - before.y0) * hit.fraction;
        const side = Math.sign(playerX - hitX) || (s.absorbed % 2 ? -1 : 1), precise = Boolean(!hit.spread && s.boosting && Math.abs(playerX - hitX) >= RC.precision.minOffset);
        if (precise) { s.precisionHits++; s.energy = Math.min(RC.base.energy, s.energy + RC.precision.energy); }
        p.vx = clamp(p.vx + side * RC.bumpImpulse, -350, 350);
        const extra = { side, combo: s.combo, precise, spread: Boolean(hit.spread), trafficId: car.id, color: car.color, width: car.width, height: car.height, value: build.hitRefill + (precise ? RC.precision.energy : 0) };
        this._event('absorb', hitX, hitY, extra); this._event('bump', playerX, playerY, extra);
      }
      if (s.lastHitTime >= 0 && s.time - s.lastHitTime > spec.comboWindow) s.combo = 0;
      if (s.distance >= s.length || s.time >= s.timeLimit) {
        const finished = s.distance >= s.length; s.distance = Math.min(s.distance, s.length); s.finished = true; s.phase = 'completed'; s.boosting = false;
        const tier = tierFor(s.absorbed, s.maxCombo);
        s.result = { id: s.id, finished, time: s.time, distance: s.distance, absorbed: s.absorbed, growth: s.growth, maxCombo: s.maxCombo, tier, ...raceMetrics(s) };
        if (finished) this._reward(s.id, tierDelta(tier), clone(s.result));
        this._event('finish', p.x, p.y, { finished, tier });
      } else this._traffic();
    }
    step(dt, input = {}) {
      const s = this.state;
      if (!finite(dt) || dt < 0 || !input || typeof input !== 'object' || Array.isArray(input)) return bad('帧输入无效。');
      if (s.paused || s.phase !== 'playing' || dt === 0) return good({ advanced: false });
      if (s.mode === 'race' && s.module === 'undecided') return bad('点火前需要先装配一项车辆模组。');
      if ((input.x !== undefined && !finite(input.x)) || (input.y !== undefined && !finite(input.y))) return bad('移动方向无效。');
      if (input.target !== undefined && (!input.target || typeof input.target !== 'object' || !finite(input.target.x) || !finite(input.target.y))) return bad('目标位置无效。');
      if (input.target && (!s.target || distance(s.target, input.target) > 1)) { const moved = this.moveTo(input.target.x, input.target.y); if (!moved.ok) return moved; }
      let x = clamp(input.x ?? ((input.right || input.d ? 1 : 0) - (input.left || input.a ? 1 : 0)), -1, 1);
      let y = clamp(input.y ?? ((input.down || input.s ? 1 : 0) - (input.up || input.w ? 1 : 0)), -1, 1);
      if (s.mode === 'explore' && Math.hypot(x, y) > 1) { const n = Math.hypot(x, y); x /= n; y /= n; }
      dt = Math.min(0.05, dt, s.mode === 'race' ? s.timeLimit - s.time : 0.05); s.time += dt;
      s.events = s.events.filter(e => s.time - e.time <= 1.4);
      if (s.mode === 'explore') this._explore(dt, { x, y }); else this._race(dt, { x, y }, input);
      return good({ advanced: true, completed: s.phase === 'completed' });
    }
    serialize() { return JSON.stringify(this.state); }
    snapshot() { return clone(this.state); }
    static validate(state) {
      try {
        const encoded = JSON.stringify(state);
        if (!encoded || encoded.length > 180000 || /"(?:__proto__|constructor|prototype)"\s*:/.test(encoded)) throw new Error('存档结构无效。');
        const s = migrateState(state);
        if (s.version !== 2 || !['explore', 'race'].includes(s.mode) || !Number.isInteger(s.seed) || s.seed < 0 || s.seed > 0xFFFFFFFF || !Number.isInteger(s.rngState) || s.rngState < 0 || s.rngState > 0xFFFFFFFF) throw new Error('存档版本或随机状态无效。');
        if (!Number.isInteger(s.act) || s.act < 1 || s.act > 4 || !Number.isInteger(s.startAct) || s.startAct < 1 || s.startAct > s.act || !['playing', 'completed'].includes(s.phase) || typeof s.paused !== 'boolean') throw new Error('存档进度无效。');
        if (typeof s.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(s.id) || s.theme !== MAPS[s.act - 1].theme || typeof s.finished !== 'boolean' || typeof s.actComplete !== 'boolean' || typeof s.boosting !== 'boolean' || !moduleSpec(s.module)) throw new Error('玩法标识无效。');
        if (!validBuild(s.build)) throw new Error('卡组或据点无效。');
        const spec = moduleSpec(s.module), build = buildStats(s.build);
        if (s.length !== trackLength(s.startAct) || s.timeLimit !== RC.track.timeLimit || s.baseSpeed !== RC.base.speed * spec.speed * build.raceSpeed || s.maxSpeed !== s.baseSpeed * (1 + s.growth * RC.growth.speed) || s.acceleration !== RC.base.acceleration * spec.acceleration * (1 + s.growth * RC.growth.acceleration) || s.handling !== RC.base.handling * spec.handling * (1 + s.growth * RC.growth.handling)) throw new Error('基础规则或成长属性无效。');
        if (JSON.stringify(s.world) !== JSON.stringify({ width: W, height: H }) || JSON.stringify(s.bounds) !== JSON.stringify(BOUNDS) || JSON.stringify(s.road) !== JSON.stringify(ROAD)) throw new Error('场景边界不匹配。');
        for (const key of ['time', 'distance', 'speed', 'energy', 'safeTime', 'dangerTime', 'absorbed', 'precisionHits', 'growth', 'combo', 'maxCombo', 'trafficGenerated', 'eventSerial']) if (!finite(s[key]) || s[key] < 0) throw new Error('数值字段无效。');
        if (s.energy > RC.base.energy || !Number.isInteger(s.absorbed) || s.absorbed > RC.traffic.total || s.growth !== Math.min(s.absorbed, RC.growth.max) || s.trafficGenerated > RC.traffic.total || s.combo > s.maxCombo || s.maxCombo > s.absorbed || s.precisionHits > s.absorbed || s.distance > s.length || s.time > 100000) throw new Error('成长或进度超出上限。');
        if (['absorbed', 'precisionHits', 'growth', 'combo', 'maxCombo', 'trafficGenerated', 'eventSerial'].some(key => !Number.isSafeInteger(s[key])) || s.absorbed > s.trafficGenerated || !finite(s.speedCeiling) || s.speedCeiling < s.maxSpeed * RC.speedCeilingMultiplier - 1e-8 || s.speedCeiling > SPEED_CEILING_MAX + 1e-8 || s.speed > s.speedCeiling + 1e-8) throw new Error('统计字段无效。');
        for (const key of ['lastHitTime', 'lastWallTime']) if (!finite(s[key]) || s[key] < -1 || s[key] > s.time) throw new Error('接触计时无效。');
        for (const key of ['x', 'y', 'vx', 'vy', 'radius', 'width', 'height']) if (!finite(s.player?.[key])) throw new Error('角色位置无效。');
        if (s.player.radius !== (s.mode === 'race' ? 18 : 12) || s.player.width !== 36 || s.player.height !== 64 || Math.abs(s.player.vx) > 350 || Math.abs(s.player.vy) > (s.mode === 'race' ? 195 : 250)) throw new Error('角色形状或速度无效。');
        if (s.target !== null && (!finite(s.target?.x) || !finite(s.target?.y))) throw new Error('导航目标无效。');
        if (!Array.isArray(s.events) || s.events.length > 64 || !Array.isArray(s.traffic) || s.traffic.length > RC.traffic.maxOnRoad || !Array.isArray(s.rewards) || s.rewards.length > 12 || !Array.isArray(s.path) || s.path.length > 1200) throw new Error('集合长度无效。');
        if (!Array.isArray(s.completedActs) || s.completedActs.length > 4 || new Set(s.completedActs).size !== s.completedActs.length || s.completedActs.some(act => !Number.isInteger(act) || act < s.startAct || act > s.act)) throw new Error('已完成区域无效。');
        for (const array of [s.events, s.traffic, s.rewards]) if (new Set(array.map(e => e.id)).size !== array.length) throw new Error('存档包含重复编号。');
        for (const event of s.events) if (!finite(event.x) || !finite(event.y) || !finite(event.time) || event.time < 0 || event.time > s.time || typeof event.id !== 'string' || !['act', 'interact', 'explore-complete', 'wall', 'absorb', 'bump', 'finish', 'wave', 'shot', 'enemy-hit', 'enemy-down', 'hurt', 'pickup'].includes(event.type)) throw new Error('特效事件无效。');
        if (!finite(s.health) || s.health < 1 || s.health > s.maxHealth || s.maxHealth !== build.maxHealth || !finite(s.combatTime) || s.combatTime < 0 || s.combatTime > s.time + 1e-8 || !finite(s.attackTimer) || s.attackTimer < 0 || s.attackTimer > BS.attackInterval.base + 1e-6 || !finite(s.hurtTimer) || s.hurtTimer < 0 || s.hurtTimer > CB.hurtCooldown + 1e-6 || typeof s.combatCleared !== 'boolean') throw new Error('战斗计时或耐久无效。');
        if (!Array.isArray(s.enemies) || !Array.isArray(s.pickups) || s.enemies.length > 24 || s.pickups.length > 24 || s.waveTotal !== CB.waves || ['wave', 'kills', 'scrap', 'scrapGenerated', 'enemiesSpawned'].some(key => !Number.isInteger(s[key]) || s[key] < 0) || s.wave > CB.waves || s.enemiesSpawned > 24 || s.kills > s.enemiesSpawned || s.scrap > s.scrapGenerated || s.scrapGenerated > 72) throw new Error('无人机或零件统计无效。');
        const A = actCombat(s.act);
        if (s.enemies.length + s.kills !== s.enemiesSpawned || s.enemiesSpawned !== s.wave * A.enemiesPerWave || s.scrapGenerated !== s.kills * A.scrapValue || s.pickups.reduce((sum, pickup) => sum + pickup.value, s.scrap) !== s.scrapGenerated || s.combatCleared !== (s.wave === CB.waves && s.enemies.length === 0)) throw new Error('无人机与掉落账目不一致。');
        for (const list of [s.enemies, s.pickups]) if (new Set(list.map(item => item.id)).size !== list.length) throw new Error('战斗对象编号重复。');
        for (const enemy of s.enemies) {
          const prefix = 'drone-' + s.seed + '-' + s.act + '-', serial = Number(String(enemy.id).replace(prefix, ''));
          if (!Number.isInteger(serial) || serial < 1 || serial > s.enemiesSpawned || enemy.id !== prefix + serial || !['x', 'y', 'vx', 'vy', 'hp', 'maxHp', 'speed'].every(key => finite(enemy[key])) || enemy.radius !== CB.enemyRadius || enemy.maxHp !== A.enemyHp || enemy.hp <= 0 || enemy.hp > enemy.maxHp || enemy.speed < A.enemySpeedMin || enemy.speed > A.enemySpeedMin + A.enemySpeedJitter || enemy.wave !== Math.ceil(serial / A.enemiesPerWave) || enemy.x < BOUNDS.x || enemy.x > BOUNDS.x + BOUNDS.w || enemy.y < BOUNDS.y || enemy.y > BOUNDS.y + BOUNDS.h) throw new Error('无人机数据无效。');
        }
        for (const pickup of s.pickups) {
          const prefix = 'scrap-drone-' + s.seed + '-' + s.act + '-', serial = Number(String(pickup.id).replace(prefix, ''));
          if (!Number.isInteger(serial) || serial < 1 || serial > s.enemiesSpawned || pickup.id !== prefix + serial || s.enemies.some(enemy => 'scrap-' + enemy.id === pickup.id) || !finite(pickup.x) || !finite(pickup.y) || pickup.radius !== CB.pickupRadius || pickup.value !== A.scrapValue || pickup.x < BOUNDS.x || pickup.x > BOUNDS.x + BOUNDS.w || pickup.y < BOUNDS.y || pickup.y > BOUNDS.y + BOUNDS.h) throw new Error('零件掉落无效。');
        }
        const totals = { capital: 0, reputation: 0, leverage: 0, pressure: 0 };
        for (const reward of s.rewards) { if (typeof reward.claimed !== 'boolean' || !reward.delta) throw new Error('奖励记录无效。'); for (const [key, value] of Object.entries(reward.delta)) { if (!(key in totals) || !finite(value) || Math.abs(value) > 5) throw new Error('奖励值无效。'); totals[key] += value; } }
        if (JSON.stringify(totals) !== JSON.stringify(s.rewardTotals)) throw new Error('累计奖励不匹配。');
        if (s.mode === 'explore') {
          const map = MAPS[s.act - 1], expected = map.obstacles.map((ob, i) => ({ id: 'obstacle-' + s.act + '-' + i, ...clone(ob) }));
          if (JSON.stringify(s.obstacles) !== JSON.stringify(expected) || blocked(s.player, s.obstacles, 12) || !Array.isArray(s.objectives) || s.objectives.length !== 3 || !Number.isInteger(s.objectiveIndex) || s.objectiveIndex < 0 || s.objectiveIndex > 3) throw new Error('探索地图无效。');
          const deltas = OBJECTIVE_REWARDS;
          for (let i = 0; i < 3; i++) {
            const expectedGoal = { id: 'act-' + s.act + '-objective-' + i, ...clone(map.objectives[i]), radius: EM.objectiveRadius, locked: i > s.objectiveIndex, completed: i < s.objectiveIndex, reward: deltas[i] };
            if (JSON.stringify(s.objectives[i]) !== JSON.stringify(expectedGoal)) throw new Error('目标顺序或奖励无效。');
          }
          if (s.actComplete !== (s.objectiveIndex === 3) || s.phase !== (s.actComplete ? 'completed' : 'playing')) throw new Error('区域完成状态无效。');
          if (s.finished !== (s.actComplete && s.act === 4) || s.completedActs.includes(s.act) !== s.actComplete || s.traffic.length || s.distance || s.speed || s.absorbed || s.precisionHits || s.safeTime || s.dangerTime || s.module !== 'balanced' || s.result !== null) throw new Error('探索状态包含比赛数据。');
          if (s.pendingObjective !== null && s.pendingObjective !== s.objectives[s.objectiveIndex]?.id) throw new Error('待提交目标无效。');
          if (s.target && blocked(s.target, s.obstacles, 12)) throw new Error('探索导航目标不可达。');
          for (const node of s.path) if (!finite(node.x) || !finite(node.y) || blocked(node, s.obstacles, 12)) throw new Error('导航路径无效。');
          for (const reward of s.rewards) {
            const match = String(reward.source).match(/^act-([1-4])-objective-([0-2])$/);
            if (!match || reward.id !== 'explore-' + s.seed + '-' + reward.source || reward.mode !== 'explore' || reward.act !== Number(match[1]) || reward.act < s.startAct || reward.act > s.act || JSON.stringify(reward.delta) !== JSON.stringify(deltas[Number(match[2])])) throw new Error('探索奖励无效。');
          }
        } else {
          if (s.enemies.length || s.pickups.length || s.combatTime || s.wave || s.kills || s.scrap || s.enemiesSpawned || s.attackTimer || s.hurtTimer || s.combatCleared) throw new Error('赛车存档包含探索战斗。');
          if (s.player.x < ROAD.left + 18 - 0.01 || s.player.x > ROAD.right - 18 + 0.01 || s.player.y < 140 || s.player.y > 462 || s.time > s.timeLimit + 0.01 || Math.abs(s.safeTime + s.dangerTime - s.time) > 1e-7) throw new Error('赛车属性无效。');
          if (s.act !== s.startAct || s.finished !== (s.phase === 'completed') || s.actComplete || s.objectives.length || s.obstacles.length || s.path.length || s.completedActs.length || s.objectiveIndex !== 0 || s.pendingObjective !== null) throw new Error('比赛流程无效。');
          if (s.target && (s.target.x < ROAD.left + 18 || s.target.x > ROAD.right - 18 || s.target.y < 140 || s.target.y > 462)) throw new Error('赛车导航目标无效。');
          for (const car of s.traffic) {
            if (!['x', 'y', 'vx', 'vy', 'distance', 'speed', 'spawnTime', 'spawnDistance', 'nextLaneTime'].every(key => finite(car[key])) || car.distance < 0 || car.spawnTime < 0 || car.spawnTime > s.time || car.spawnDistance > car.distance || car.nextLaneTime < 0 || car.speed < RC.traffic.speedMin || car.speed > RC.traffic.speedMin + RC.traffic.speedJitter || !Number.isInteger(car.lane) || car.lane < 0 || car.lane > 4 || car.width !== 34 || car.height !== 62 || typeof car.absorbed !== 'boolean') throw new Error('车流数据无效。');
            const serial = Number(String(car.id).replace('car-' + s.seed + '-', ''));
            if (!Number.isInteger(serial) || serial < 1 || serial > s.trafficGenerated || car.id !== 'car-' + s.seed + '-' + serial) throw new Error('车流编号无效。');
          }
          if (s.phase === 'completed') {
            const tier = tierFor(s.absorbed, s.maxCombo);
            if (!s.result || s.result.id !== s.id || s.result.finished !== (s.distance === s.length) || s.result.time !== s.time || s.result.distance !== s.distance || s.result.absorbed !== s.absorbed || s.result.growth !== s.growth || s.result.maxCombo !== s.maxCombo || s.result.tier !== tier || (!s.result.finished && s.time !== s.timeLimit)) throw new Error('比赛结果无效。');
            if (Object.entries(raceMetrics(s)).some(([key, value]) => s.result[key] !== value) || 'rank' in s.result || 'standings' in s.result) throw new Error('单机赛事统计无效。');
            const delta = tierDelta(tier);
            if (s.rewards.length !== (s.result.finished ? 1 : 0)) throw new Error('比赛奖励数量无效。');
            for (const reward of s.rewards) if (reward.id !== s.id || reward.mode !== 'race' || reward.act !== s.act || JSON.stringify(reward.delta) !== JSON.stringify(delta) || Object.keys(s.result).some(key => reward[key] !== s.result[key])) throw new Error('比赛奖励无效。');
          } else if (s.result !== null || s.rewards.length || s.time >= s.timeLimit || s.distance >= s.length) throw new Error('比赛结束状态无效。');
        }
        return { valid: true, ok: true, error: null };
      } catch (error) { return { valid: false, ok: false, error: error instanceof Error ? error.message : '存档无效。' }; }
    }
    static restore(json) { if (typeof json !== 'string' || json.length > 180000) throw new Error('存档文本无效。'); let state; try { state = JSON.parse(json); } catch (_) { throw new Error('存档不是有效JSON。'); } return new SunD20ActionSim({ state }); }
  }
  SunD20ActionSim.MAPS = MAPS;
  SunD20ActionSim.MODULES = MODULES;
  SunD20ActionSim.BUILD_RULES = BUILD_RULES;
  SunD20ActionSim.corridorFor = state => clone(corridorFor(state));
  SunD20ActionSim.scoreFor = state => scoreFor(state);
  SunD20ActionSim.tierFor = tierFor;
  SunD20ActionSim.buildStatsFor = build => clone(buildStats(build));
  root.SunD20ActionSim = SunD20ActionSim;
  if (typeof module !== 'undefined' && module.exports) module.exports = SunD20ActionSim;
})(typeof globalThis !== 'undefined' ? globalThis : this);
