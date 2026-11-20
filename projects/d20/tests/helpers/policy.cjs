/* 测试辅助：固定策略跑完整一局 D20 剧情（出身 → 12 次检定 → 3 次营地 → 3 段夜航结算 → 结局）。
   策略的随机数与引擎骰子分开，各自由种子决定，因此同一种子必然复现同一局。 */
'use strict';

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const POLICIES = {
  // 均匀随机挑可用选项
  random: (views, rand) => views[Math.floor(rand() * views.length)],
  // 总挑胜率最高
  greedy: views => views.slice().sort((a, b) => b.chance - a.chance)[0],
  // 总挑胜率最低（逼出失败分支）
  risky: views => views.slice().sort((a, b) => a.chance - b.chance)[0],
  // 偏好最后一个可用选项（覆盖排在后面的选项）
  last: views => views[views.length - 1]
};

// 各档位的最低达标成绩，取自 race-tiers.csv（经 story 传入时用 options.tiers 覆盖）
const DEFAULT_TIERS = { gold: { absorbed: 48, maxCombo: 24 }, silver: { absorbed: 25, maxCombo: 2 }, bronze: { absorbed: 3, maxCombo: 2 } };

function playEpisode(Engine, story, seed, policyName = 'random', options = {}) {
  const rand = mulberry(seed ^ 0xA5A5A5A5);
  const pickChoice = POLICIES[policyName];
  const engine = new Engine(story, { seed });
  const log = { choices: [], branches: [], scenes: [], rerolls: 0, races: [], trains: [] };
  const origins = story.origins;
  const origin = options.origin || origins[Math.floor(rand() * origins.length)].id;
  let r = engine.chooseOrigin(origin);
  if (!r.ok) throw new Error(r.error);
  let guard = 0;
  while (engine.state.phase !== 'ending' && guard++ < 200) {
    const st = engine.state;
    if (st.phase === 'scene') {
      // 进入第 2–4 幕后，先结算上一段夜航（与 UI 的流程一致）
      const leg = st.act - 1;
      if (leg >= 1 && leg <= 3 && st.training >= leg && !st.races.some(x => x.id === 'night-drive-' + leg) && options.races !== false) {
        const tiers = ['bronze', 'silver', 'gold'], tier = options.tier || tiers[Math.floor(rand() * 3)];
        const { absorbed, maxCombo } = (options.tiers || DEFAULT_TIERS)[tier];
        r = engine.applyRaceResult('night-drive-' + leg, { absorbed, maxCombo, tier });
        if (!r.ok) throw new Error(r.error);
        log.races.push(tier);
        continue;
      }
      const views = engine.choices().filter(v => v.available);
      if (!views.length) throw new Error('无可用选项：' + st.sceneId);
      const view = pickChoice(views, rand);
      log.scenes.push(st.sceneId);
      r = engine.beginCheck(view.id);
      if (!r.ok) throw new Error(r.error);
      log.choices.push(view.id);
    } else if (st.phase === 'check') {
      const roll = st.pending.roll;
      if (!roll.success && !roll.critical && !st.pending.rerolled && st.fate > 0 && rand() < (options.rerollRate ?? 0.5)) {
        r = engine.reroll(); if (!r.ok) throw new Error(r.error); log.rerolls++; continue;
      }
      const id = st.pending.choiceId;
      const kind = roll.critical === 'success' ? 'criticalSuccess' : roll.critical === 'failure' ? 'criticalFailure' : roll.success ? 'success' : 'failure';
      log.branches.push(id + ':' + (roll.success ? 'success' : 'failure'));
      log.branches.push(id + '#' + kind);
      r = engine.acceptRoll(); if (!r.ok) throw new Error(r.error);
    } else if (st.phase === 'interlude') {
      const list = engine.interludeChoices();
      const pick = list[Math.floor(rand() * list.length)];
      r = engine.train(pick.id); if (!r.ok) throw new Error(r.error);
      log.trains.push(pick.id);
    } else throw new Error('未知阶段 ' + st.phase);
  }
  return { engine, log, ending: engine.state.endingId };
}

module.exports = { playEpisode, mulberry, POLICIES };
