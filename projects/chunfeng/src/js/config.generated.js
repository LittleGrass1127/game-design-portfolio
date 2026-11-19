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
      "minTotal": 72
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
    "feedbackInitial": "选择一种花材，再点击环形落点。再次点击已种植的落点可以拔除。",
    "submitGood": "三个愿望都被看见了。个人花环已汇入公共花路，并生成装饰蓝图。",
    "submitRetry": "花环可以提交，但层次或愿望仍有提升空间。调整后再提交不会损耗花材。"
  },
  "wishes": [
    {
      "id": "colors",
      "npc": "天鹅拉",
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
