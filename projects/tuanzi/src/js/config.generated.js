/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "colors": [
    {
      "type": 0,
      "hex": "#f47f9e",
      "name": "草莓粉"
    },
    {
      "type": 1,
      "hex": "#73d7e8",
      "name": "汽水蓝"
    },
    {
      "type": 2,
      "hex": "#ffd45f",
      "name": "柠檬黄"
    }
  ],
  "dangoLevels": [
    {
      "level": 1,
      "value": 1,
      "drawSize": 21,
      "followGap": 43
    },
    {
      "level": 2,
      "value": 4,
      "drawSize": 27,
      "followGap": 48
    },
    {
      "level": 3,
      "value": 13,
      "drawSize": 33,
      "followGap": 53
    },
    {
      "level": 4,
      "value": 40,
      "drawSize": 39,
      "followGap": 58
    },
    {
      "level": 5,
      "value": 121,
      "drawSize": 42,
      "followGap": 60
    },
    {
      "level": 6,
      "value": 364,
      "drawSize": 45,
      "followGap": 62
    },
    {
      "level": 7,
      "value": 1093,
      "drawSize": 48,
      "followGap": 64
    }
  ],
  "game": {
    "view": {
      "w": 1280,
      "h": 720
    },
    "world": {
      "w": 1880,
      "h": 1160
    },
    "durationSec": 120,
    "upgradeThresholds": [
      18,
      38,
      60,
      84,
      108
    ],
    "upgradeChoiceCount": 4,
    "upgradeNoneLeft": 999,
    "maxDangoLevel": 7,
    "player": {
      "spawnOffsetY": 145,
      "r": 24,
      "speed": 245,
      "suction": 155,
      "pullPower": 1,
      "capacity": 7,
      "value": 1,
      "highLevelBonus": 1,
      "comboWindow": 8,
      "mergeNeed": 3,
      "mergeCoin": 0,
      "emptyBoost": 1,
      "rainbowEvery": 0,
      "dashCooldown": 4.2,
      "bobSpeed": 9,
      "bounds": {
        "minX": 45,
        "insetRight": 45,
        "minY": 55,
        "insetBottom": 45
      }
    },
    "dash": {
      "duration": 0.26,
      "speedMultiplier": 2.15
    },
    "mote": {
      "sizeMin": 13,
      "sizeMax": 18,
      "phaseMax": 8,
      "phaseSpeed": 3
    },
    "suction": {
      "pullBase": 420,
      "pullPerDistance": 5,
      "damping": 0.025,
      "contactPadding": 4
    },
    "cargoFollow": {
      "pullFactor": 18,
      "damping": 0.015
    },
    "cart": {
      "deliveryRadius": 122
    },
    "combo": {
      "step": 0.12,
      "maxLayer": 5,
      "showAt": 2
    },
    "highLevelBonusMinLevel": 2,
    "timeBonusPerSecond": 1,
    "camera": {
      "smoothBase": 0.001
    },
    "pointerArriveDist": 18,
    "maxFrameDt": 0.033,
    "hud": {
      "dangerSeconds": 15
    },
    "decorations": {
      "count": 34,
      "treeRatio": 0.58
    },
    "endTiers": [
      {
        "minClean": 100,
        "title": "甜点街重新亮起来了",
        "stamp": "闪亮"
      },
      {
        "minClean": 75,
        "title": "再跑一圈就能闪闪发亮",
        "stamp": "清爽"
      },
      {
        "minClean": 0,
        "title": "今天也收拾了不少团子",
        "stamp": "加油"
      }
    ],
    "bestScoreKey": "dango-cleanup-best"
  },
  "patches": [
    {
      "id": 0,
      "x": 340,
      "y": 280,
      "r": 180,
      "motes": 20
    },
    {
      "id": 1,
      "x": 930,
      "y": 245,
      "r": 165,
      "motes": 20
    },
    {
      "id": 2,
      "x": 1510,
      "y": 310,
      "r": 190,
      "motes": 20
    },
    {
      "id": 3,
      "x": 420,
      "y": 860,
      "r": 185,
      "motes": 20
    },
    {
      "id": 4,
      "x": 1030,
      "y": 820,
      "r": 200,
      "motes": 20
    },
    {
      "id": 5,
      "x": 1580,
      "y": 850,
      "r": 170,
      "motes": 20
    }
  ],
  "upgradeEffects": [
    {
      "upgradeId": "magnet",
      "target": "player.suction",
      "op": "mul",
      "value": 1.32
    },
    {
      "upgradeId": "skates",
      "target": "player.speed",
      "op": "mul",
      "value": 1.22
    },
    {
      "upgradeId": "basket",
      "target": "player.capacity",
      "op": "add",
      "value": 4
    },
    {
      "upgradeId": "sign",
      "target": "player.value",
      "op": "mul",
      "value": 1.3
    },
    {
      "upgradeId": "rainbow",
      "target": "player.rainbowEvery",
      "op": "set",
      "value": 5
    },
    {
      "upgradeId": "dash",
      "target": "player.dashCd",
      "op": "set",
      "value": 0
    },
    {
      "upgradeId": "dash",
      "target": "player.dashCooldown",
      "op": "set",
      "value": 2
    },
    {
      "upgradeId": "vacuum",
      "target": "player.pullPower",
      "op": "mul",
      "value": 1.55
    },
    {
      "upgradeId": "cart",
      "target": "cart.deliveryRadius",
      "op": "add",
      "value": 55
    },
    {
      "upgradeId": "receipt",
      "target": "player.comboWindow",
      "op": "add",
      "value": 5
    },
    {
      "upgradeId": "clock",
      "target": "time",
      "op": "add",
      "value": 18
    },
    {
      "upgradeId": "skewer",
      "target": "player.highLevelBonus",
      "op": "mul",
      "value": 1.4
    },
    {
      "upgradeId": "packer",
      "target": "player.mergeNeed",
      "op": "set",
      "value": 2
    },
    {
      "upgradeId": "sticker",
      "target": "player.mergeCoin",
      "op": "set",
      "value": 3
    },
    {
      "upgradeId": "sneakers",
      "target": "player.emptyBoost",
      "op": "set",
      "value": 1.35
    }
  ],
  "upgrades": [
    {
      "id": "magnet",
      "icon": "🧲",
      "name": "大号磁铁",
      "desc": "吸取范围扩大 32%",
      "category": "效率",
      "weight": 1,
      "unique": true
    },
    {
      "id": "skates",
      "icon": "🛼",
      "name": "果冻轮滑",
      "desc": "移动速度提高 22%",
      "category": "效率",
      "weight": 1,
      "unique": true
    },
    {
      "id": "basket",
      "icon": "🧺",
      "name": "伸缩篮筐",
      "desc": "可以多带 4 只团子",
      "category": "容量",
      "weight": 1,
      "unique": true
    },
    {
      "id": "sign",
      "icon": "🍓",
      "name": "草莓招牌",
      "desc": "每次交付收入提高 30%",
      "category": "价值",
      "weight": 1,
      "unique": true
    },
    {
      "id": "rainbow",
      "icon": "🌈",
      "name": "彩虹糖纸",
      "desc": "每第 5 只团子自动变成同色",
      "category": "合成",
      "weight": 1,
      "unique": true
    },
    {
      "id": "dash",
      "icon": "⚡",
      "name": "汽水冲刺",
      "desc": "空格冲刺，冷却缩短为 2 秒",
      "category": "移动",
      "weight": 1,
      "unique": true
    },
    {
      "id": "vacuum",
      "icon": "🌀",
      "name": "双倍吸管",
      "desc": "团子飞向你的速度提高 55%",
      "category": "效率",
      "weight": 1,
      "unique": true
    },
    {
      "id": "cart",
      "icon": "🚚",
      "name": "移动餐车",
      "desc": "交付范围扩大 55 米",
      "category": "交付",
      "weight": 1,
      "unique": true
    },
    {
      "id": "receipt",
      "icon": "🧾",
      "name": "保温小票",
      "desc": "连送保留时间增加 5 秒",
      "category": "交付",
      "weight": 1,
      "unique": true
    },
    {
      "id": "clock",
      "icon": "⏰",
      "name": "加班闹钟",
      "desc": "本局立刻增加 18 秒",
      "category": "时间",
      "weight": 1,
      "unique": true
    },
    {
      "id": "skewer",
      "icon": "🍡",
      "name": "金色竹签",
      "desc": "2 级以上团子价值提高 40%",
      "category": "价值",
      "weight": 1,
      "unique": true
    },
    {
      "id": "packer",
      "icon": "🎁",
      "name": "二合打包机",
      "desc": "两只同级同色团子即可合成",
      "category": "规则",
      "weight": 1,
      "unique": true
    },
    {
      "id": "sticker",
      "icon": "⭐",
      "name": "合成贴纸",
      "desc": "每次合成立刻获得 3 金币",
      "category": "价值",
      "weight": 1,
      "unique": true
    },
    {
      "id": "sneakers",
      "icon": "👟",
      "name": "空篮快跑",
      "desc": "没有携带团子时速度提高 35%",
      "category": "移动",
      "weight": 1,
      "unique": true
    }
  ]
};
