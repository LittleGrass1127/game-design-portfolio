/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "clips": [
    {
      "id": "breakfast",
      "name": "街角早餐",
      "tag": "温暖",
      "mood": 2,
      "stable": 94
    },
    {
      "id": "blooper",
      "name": "故障笑场",
      "tag": "轻松",
      "mood": 3,
      "stable": 68
    },
    {
      "id": "neon",
      "name": "雨夜霓虹",
      "tag": "都市",
      "mood": 4,
      "stable": 86
    },
    {
      "id": "noodles",
      "name": "拉面夜话",
      "tag": "温暖",
      "mood": 3,
      "stable": 91
    },
    {
      "id": "chase",
      "name": "隧道追逐",
      "tag": "行动",
      "mood": 5,
      "stable": 82
    },
    {
      "id": "portrait",
      "name": "片尾合影",
      "tag": "温暖结尾",
      "mood": 2,
      "stable": 98
    },
    {
      "id": "cat",
      "name": "花猫巡街",
      "tag": "轻松",
      "mood": 3,
      "stable": 89
    }
  ],
  "commission": {
    "id": "joint-premiere",
    "title": "夜灯街联合首映",
    "panelTag": "居民联映",
    "brief": "街坊优先，希望在热闹之后以温暖的片尾结束。",
    "objectives": [
      "选择五段不同素材",
      "控制相邻片段的情绪跳跃",
      "必须保留一段温暖结尾"
    ],
    "timelineSize": 5,
    "requiredEndingClip": "portrait",
    "previewFlowThreshold": 70
  },
  "scoring": {
    "theme": {
      "tagIncludes": [
        "温暖"
      ],
      "tagEquals": [
        "轻松"
      ],
      "perThemeClip": 24,
      "endingTag": "温暖结尾",
      "endingBonus": 28,
      "max": 100
    },
    "flow": {
      "base": 100,
      "jumpPenalty": 15,
      "lengthPenalty": 12,
      "min": 20
    },
    "weights": {
      "theme": 0.42,
      "flow": 0.38,
      "stable": 0.2
    },
    "progress": {
      "perClip": 11,
      "previewed": 76,
      "finished": 100
    }
  },
  "texts": {
    "progressLabel": "时间轴 {count}/{size}",
    "progressDone": "首映完成",
    "cardLabel": "{tag} · 稳定度{stable}",
    "slotIndex": "片段 {index}",
    "slotEmpty": "点击右侧素材加入",
    "feedbackInitial": "先选满五段素材。试映会指出问题类型，但不会直接给出标准答案。",
    "toastTimelineFull": "时间轴已经有五段素材，先移除一段。",
    "preview": {
      "ending": "试映反馈：结尾情绪没有收住。街坊更期待一段能回到夜灯街日常的片尾。",
      "flow": "试映反馈：中段情绪跳跃较大。尝试让相邻片段的情绪强度更接近。",
      "good": "试映反馈：主题清楚、节奏完整。居民留言：像把这一晚真正留在了街区。"
    },
    "premiereFeedback": "正式放映完成，口碑 {score}。第五晚留言与自由混剪入口已解锁。",
    "toastPremiere": "主线奖励已领取，重复放映只刷新评价。"
  }
};
