/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "challengeActions": [
    {
      "id": "steady",
      "label": "稳住风铃",
      "displayOrder": 1,
      "step": 2
    },
    {
      "id": "observe",
      "label": "观察微光",
      "displayOrder": 2,
      "step": 1
    },
    {
      "id": "sync",
      "label": "同步步伐",
      "displayOrder": 3,
      "step": 3
    }
  ],
  "flow": {
    "defaultRumor": "bridge",
    "score": {
      "initial": 12,
      "resonance": 38,
      "partnered": 72,
      "complete": 100
    },
    "progress": {
      "initial": 15,
      "resonance": 38,
      "partneredBase": 60,
      "perStep": 13,
      "complete": 100
    }
  },
  "resonances": [
    {
      "id": "wind",
      "name": "风向铃",
      "desc": "记录并回应环境中的风向"
    },
    {
      "id": "sweet",
      "name": "蜜糖纸",
      "desc": "用熟悉气味表达善意"
    },
    {
      "id": "quiet",
      "name": "放慢脚步",
      "desc": "让回声与行动逐渐同步"
    }
  ],
  "rumors": [
    {
      "id": "bridge",
      "title": "雨后桥边有微光",
      "hint": "今夜风从水面吹向旧街",
      "name": "桥边微光",
      "scene": "雨后石桥下有断续微光，风从水面吹向旧街。",
      "correctResonance": "wind",
      "spirit": "风铃精灵",
      "failHint": "风向是桥边最稳定的线索。"
    },
    {
      "id": "cafe",
      "title": "咖啡店窗台轻响",
      "hint": "桌上留下了一枚旧糖纸",
      "name": "窗台轻响",
      "scene": "午后咖啡店窗台传来三次轻响，桌上留着一枚旧糖纸。",
      "correctResonance": "sweet",
      "spirit": "糖羽精灵",
      "failHint": "精灵反复靠近糖纸。"
    },
    {
      "id": "alley",
      "title": "旧巷会重复脚步声",
      "hint": "走得越慢，回声越清楚",
      "name": "旧巷回声",
      "scene": "夜晚旧巷的墙面会重复脚步声，越放慢步子越清晰。",
      "correctResonance": "quiet",
      "spirit": "回声精灵",
      "failHint": "它会回应更慢、更安静的动作。"
    }
  ],
  "text": [
    {
      "key": "intro",
      "text": "先读环境与传闻，再选择一种共鸣方式。错误选择会返回可解释反馈。"
    },
    {
      "key": "partnerOk",
      "text": "{spirit}回应了你的选择。完成三步协作即可收录图鉴。"
    },
    {
      "key": "partnerFail",
      "text": "共鸣没有建立：{hint} 可以更换选项后重试。"
    },
    {
      "key": "challengeBroken",
      "text": "协作节奏被打断：先观察，再稳定共鸣，最后同步步伐。"
    },
    {
      "key": "challengeStep",
      "text": "协作步骤 {step}/{total} 完成。"
    },
    {
      "key": "complete",
      "text": "{spirit}已收录图鉴，并加入今晚的城市巡游。"
    },
    {
      "key": "completeToast",
      "text": "公共巡游路线已点亮一段，个人奖励已记录。"
    },
    {
      "key": "unknownSpirit",
      "text": "未知精灵"
    },
    {
      "key": "progressSearching",
      "text": "正在判断踪迹"
    },
    {
      "key": "progressChallenge",
      "text": "协作挑战 {step}/{total}"
    },
    {
      "key": "progressDone",
      "text": "已收录图鉴"
    }
  ]
};
