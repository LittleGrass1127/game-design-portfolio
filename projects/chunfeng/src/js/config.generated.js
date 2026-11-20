/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "attributeLevels": [
    {
      "attr": "height",
      "level": 1,
      "label": "低株"
    },
    {
      "attr": "height",
      "level": 2,
      "label": "中株"
    },
    {
      "attr": "height",
      "level": 3,
      "label": "高株"
    },
    {
      "attr": "scent",
      "level": 1,
      "label": "淡香"
    },
    {
      "attr": "scent",
      "level": 2,
      "label": "清香"
    },
    {
      "attr": "scent",
      "level": 3,
      "label": "浓香"
    }
  ],
  "flowers": [
    {
      "id": "bell",
      "name": "星铃花",
      "color": "蓝",
      "height": 2,
      "scent": 2
    },
    {
      "id": "sun",
      "name": "日光菊",
      "color": "黄",
      "height": 3,
      "scent": 1
    },
    {
      "id": "wind",
      "name": "风语草",
      "color": "绿",
      "height": 1,
      "scent": 3
    },
    {
      "id": "rose",
      "name": "霞光蔷薇",
      "color": "粉",
      "height": 2,
      "scent": 3
    }
  ],
  "scoring": {
    "ring": {
      "slotCount": 16,
      "minPlanted": 12,
      "radiusPercent": 48,
      "defaultFlower": "bell"
    },
    "stats": {
      "lowHeight": 1,
      "fragrantScentMin": 3
    },
    "harmony": {
      "perColor": 21,
      "perPlanted": 2,
      "plantedCap": 12,
      "max": 100
    },
    "layers": {
      "perHeight": 25,
      "lowBonus": 20,
      "lowBonusMin": 2,
      "max": 100
    },
    "weights": {
      "harmony": 0.42,
      "layers": 0.36,
      "wishes": 22
    },
    "pass": {
      "requireAllWishes": true,
      "minTotal": 88
    },
    "progress": {
      "plantedSpan": 82,
      "submitted": 100
    }
  },
  "texts": {
    "cardLabel": "{color}色 · {height} · {scent}",
    "windTitle": "今日风向",
    "windText": "西南风 2 级。低株花材更容易保留香气层。",
    "wishLine": "{npc}：{text}",
    "slotAria": "花环落点 {index}",
    "progressLabel": "已种植 {used}/{min}",
    "progressDone": "花环已提交",
    "feedbackInitial": "目标：种满 {min} 株，让三位友邻的愿望全中，并且综合评分不低于 {pass}。先点左侧花材，再点环形落点；再点一次可以拔除。",
    "submitGood": "三个愿望都被看见了，综合评分 {score}。个人花环已汇入公共花路。点「重新布置」可以再编一环。",
    "playHint": "目标：种满 {min} 株，三个愿望全中且综合评分 ≥ {pass}。先点左侧花材，再点落点；再点一次拔除。",
    "submitMissing": "还有愿望没有满足：{missing}。调整后再提交，不会损耗花材。",
    "missingItem": "{npc}（{text}）",
    "submitLowScore": "三个愿望都满足了，但综合评分 {score}，还没到 {pass}：高低层次只有 {layers}，试着让低、中、高三种株高都出现。",
    "toastLocked": "花环已提交。点「重新布置」可以再编一环。"
  },
  "wishes": [
    {
      "id": "colors",
      "npc": "阿柳",
      "text": "想看到至少三种颜色",
      "stat": "colors",
      "min": 3
    },
    {
      "id": "low",
      "npc": "团团",
      "text": "保留两株低矮香花",
      "stat": "low",
      "min": 2
    },
    {
      "id": "fragrant",
      "npc": "米米",
      "text": "希望闻到两处浓香",
      "stat": "fragrant",
      "min": 2
    }
  ]
};
