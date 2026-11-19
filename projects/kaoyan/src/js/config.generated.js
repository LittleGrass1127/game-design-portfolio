/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "actions": [
    {
      "id": "study0",
      "category": "study",
      "name": "政治自习",
      "subject": 0,
      "gain": 7,
      "energy": -14,
      "stress": 9,
      "cost": 0,
      "income": 0,
      "badge": "政",
      "description": "梳理知识框架。基础 +7 分，实际收益受当前效率影响。"
    },
    {
      "id": "study1",
      "category": "study",
      "name": "英语自习",
      "subject": 1,
      "gain": 7,
      "energy": -14,
      "stress": 9,
      "cost": 0,
      "income": 0,
      "badge": "英",
      "description": "阅读与词汇复盘。基础 +7 分，实际收益受当前效率影响。"
    },
    {
      "id": "study2",
      "category": "study",
      "name": "数学自习",
      "subject": 2,
      "gain": 10,
      "energy": -14,
      "stress": 9,
      "cost": 0,
      "income": 0,
      "badge": "数",
      "description": "把错题重新做一遍。基础 +10 分，实际收益受当前效率影响。"
    },
    {
      "id": "study3",
      "category": "study",
      "name": "专业自习",
      "subject": 3,
      "gain": 10,
      "energy": -14,
      "stress": 9,
      "cost": 0,
      "income": 0,
      "badge": "专",
      "description": "整理学科重点。基础 +10 分，实际收益受当前效率影响。"
    },
    {
      "id": "sprint0",
      "category": "sprint",
      "name": "政治冲刺",
      "subject": 0,
      "gain": 10.15,
      "energy": -24,
      "stress": 15,
      "cost": 25,
      "income": 0,
      "badge": "政",
      "description": "限时训练与讲评。基础 +10.15 分，花费25，精力-24、压力+15。"
    },
    {
      "id": "sprint1",
      "category": "sprint",
      "name": "英语冲刺",
      "subject": 1,
      "gain": 10.15,
      "energy": -24,
      "stress": 15,
      "cost": 25,
      "income": 0,
      "badge": "英",
      "description": "限时训练与讲评。基础 +10.15 分，花费25，精力-24、压力+15。"
    },
    {
      "id": "sprint2",
      "category": "sprint",
      "name": "数学冲刺",
      "subject": 2,
      "gain": 14.5,
      "energy": -24,
      "stress": 15,
      "cost": 25,
      "income": 0,
      "badge": "数",
      "description": "限时训练与讲评。基础 +14.5 分，花费25，精力-24、压力+15。"
    },
    {
      "id": "sprint3",
      "category": "sprint",
      "name": "专业冲刺",
      "subject": 3,
      "gain": 14.5,
      "energy": -24,
      "stress": 15,
      "cost": 25,
      "income": 0,
      "badge": "专",
      "description": "限时训练与讲评。基础 +14.5 分，花费25，精力-24、压力+15。"
    },
    {
      "id": "rest",
      "category": "life",
      "name": "好好睡一觉",
      "subject": -1,
      "gain": 0,
      "energy": 34,
      "stress": -18,
      "cost": 0,
      "income": 0,
      "badge": "眠",
      "description": "精力+34，压力-18。不涨分，但会改善后续学习效率。"
    },
    {
      "id": "walk",
      "category": "life",
      "name": "操场散步",
      "subject": -1,
      "gain": 0,
      "energy": 18,
      "stress": -30,
      "cost": 0,
      "income": 0,
      "badge": "风",
      "description": "精力+18，压力-30。暂时放下题目，让自己喘口气。"
    },
    {
      "id": "job",
      "category": "life",
      "name": "接一单兼职",
      "subject": -1,
      "gain": 0,
      "energy": -10,
      "stress": 5,
      "cost": 0,
      "income": 200,
      "badge": "余",
      "description": "预算+200，精力-10，压力+5。先把生活安顿好。"
    }
  ],
  "backgrounds": [
    {
      "index": 0,
      "name": "稳步起跑",
      "description": "底子均衡，先找回自己的学习节奏。",
      "politics": 30,
      "english": 35,
      "math": 50,
      "major": 55
    },
    {
      "index": 1,
      "name": "数理优势",
      "description": "数学起点高，但英语不能再拖到最后。",
      "politics": 25,
      "english": 25,
      "math": 70,
      "major": 50
    },
    {
      "index": 2,
      "name": "跨专业备考",
      "description": "英语基础好，专业课需要更多时间。",
      "politics": 40,
      "english": 50,
      "math": 50,
      "major": 30
    }
  ],
  "eventOptions": [
    {
      "event": 0,
      "option": 0,
      "text": "坦诚聊聊最近的压力",
      "description": "压力-16，精力+6",
      "money": 0,
      "energy": 6,
      "stress": -16,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 0,
      "option": 1,
      "text": "聊完顺手整理学习计划",
      "description": "政治+2，专业+2，压力+6",
      "money": 0,
      "energy": 0,
      "stress": 6,
      "politics": 2,
      "english": 0,
      "math": 0,
      "major": 2
    },
    {
      "event": 1,
      "option": 0,
      "text": "出去吹吹风",
      "description": "预算-60，精力+12，压力-16",
      "money": -60,
      "energy": 12,
      "stress": -16,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 1,
      "option": 1,
      "text": "留在自习室补两道题",
      "description": "数学+3，精力-8，压力+5",
      "money": 0,
      "energy": -8,
      "stress": 5,
      "politics": 0,
      "english": 0,
      "math": 3,
      "major": 0
    },
    {
      "event": 2,
      "option": 0,
      "text": "请前辈吃饭并集中请教",
      "description": "预算-80，专业+4，压力-4",
      "money": -80,
      "energy": 0,
      "stress": -4,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 4
    },
    {
      "event": 2,
      "option": 1,
      "text": "独自整理重点",
      "description": "专业+2，精力-6",
      "money": 0,
      "energy": -6,
      "stress": 0,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 2
    },
    {
      "event": 3,
      "option": 0,
      "text": "接下加单",
      "description": "预算+150，精力-18，压力+8",
      "money": 150,
      "energy": -18,
      "stress": 8,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 3,
      "option": 1,
      "text": "婉拒，按时休息",
      "description": "精力+10，压力-8",
      "money": 0,
      "energy": 10,
      "stress": -8,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 4,
      "option": 0,
      "text": "加入讨论，讲懂一道题",
      "description": "数学+3，政治+1，精力-10",
      "money": 0,
      "energy": -10,
      "stress": 0,
      "politics": 1,
      "english": 0,
      "math": 3,
      "major": 0
    },
    {
      "event": 4,
      "option": 1,
      "text": "独自完成阅读训练",
      "description": "英语+2，压力-8",
      "money": 0,
      "energy": 0,
      "stress": -8,
      "politics": 0,
      "english": 2,
      "math": 0,
      "major": 0
    },
    {
      "event": 5,
      "option": 0,
      "text": "关掉手机，整理今天的收获",
      "description": "压力-18，精力+4",
      "money": 0,
      "energy": 4,
      "stress": -18,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 5,
      "option": 1,
      "text": "挑选一条方法做小范围尝试",
      "description": "英语+2，专业+2，压力+8",
      "money": 0,
      "energy": 0,
      "stress": 8,
      "politics": 0,
      "english": 2,
      "math": 0,
      "major": 2
    },
    {
      "event": 6,
      "option": 0,
      "text": "换一盏顺手的新台灯",
      "description": "预算-100，精力+12，压力-10",
      "money": -100,
      "energy": 12,
      "stress": -10,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 6,
      "option": 1,
      "text": "借用备用灯，把钱留给生活",
      "description": "压力+6，专业+1",
      "money": 0,
      "energy": 0,
      "stress": 6,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 1
    },
    {
      "event": 7,
      "option": 0,
      "text": "记下值得被肯定的努力",
      "description": "精力+8，压力-15",
      "money": 0,
      "energy": 8,
      "stress": -15,
      "politics": 0,
      "english": 0,
      "math": 0,
      "major": 0
    },
    {
      "event": 7,
      "option": 1,
      "text": "把还没懂的概念再讲一遍",
      "description": "政治+2，英语+2，精力-6",
      "money": 0,
      "energy": -6,
      "stress": 0,
      "politics": 2,
      "english": 2,
      "math": 0,
      "major": 0
    }
  ],
  "events": [
    {
      "index": 0,
      "symbol": "信",
      "title": "家里的电话",
      "body": "晚自习结束，家里问起最近的情况。你看着桌上的错题本，决定怎么回答。"
    },
    {
      "index": 1,
      "symbol": "风",
      "title": "室友的周末邀请",
      "body": "室友问你要不要一起去江边走走。周末的空白，也可以是计划的一部分。"
    },
    {
      "index": 2,
      "symbol": "书",
      "title": "一份前辈的旧笔记",
      "body": "前辈留下了一本专业课笔记。你可以请对方讲解，也可以自己慢慢消化。"
    },
    {
      "index": 3,
      "symbol": "余",
      "title": "兼职临时加单",
      "body": "合作过的店主想请你帮一个小忙。收入足够覆盖几周生活费，但今晚会晚一些睡。"
    },
    {
      "index": 4,
      "symbol": "伴",
      "title": "图书馆的互助小组",
      "body": "同桌准备交换错题讲解。你可以加入讨论，也可以按自己的节奏完成阅读。"
    },
    {
      "index": 5,
      "symbol": "望",
      "title": "屏幕里的上岸经验",
      "body": "刷到一串高分经验帖，你开始怀疑自己的进度。比较很容易，回到自己的计划却需要一点勇气。"
    },
    {
      "index": 6,
      "symbol": "灯",
      "title": "坏掉的台灯",
      "body": "台灯开始闪烁。新台灯要花一笔钱，也可以先借用舍友的，稍微调整学习地点。"
    },
    {
      "index": 7,
      "symbol": "愿",
      "title": "给未来的自己写封信",
      "body": "一路走到这里，你已经有很多具体的改变。你想在信里记下什么？"
    }
  ],
  "examConfig": {
    "_comment": "基础参数：来自原 Unity 工程 exam_config.json；efficiency 为学习效率公式系数（原规则脚本中的常量）",
    "weeks": 12,
    "slots": 3,
    "seed": 2027,
    "initialEnergy": 75,
    "initialStress": 20,
    "initialMoney": 950,
    "weeklyExpense": 60,
    "weeklyEnergy": 12,
    "weeklyStress": -5,
    "resourceMax": 100,
    "eventEveryWeeks": 2,
    "efficiency": {
      "base": 0.55,
      "energySlope": 0.0075,
      "stressThreshold": 35,
      "stressSlope": 0.005
    }
  },
  "goals": [
    {
      "index": 0,
      "name": "青川大学",
      "description": "稳妥上岸 · 总分320，四科都要过线。",
      "tagline": "稳稳地向前走",
      "total": 320,
      "min_politics": 40,
      "min_english": 40,
      "min_math": 60,
      "min_major": 60
    },
    {
      "index": 1,
      "name": "南岭理工",
      "description": "认真争取 · 总分365，兼顾优势和短板。",
      "tagline": "值得认真争取",
      "total": 365,
      "min_politics": 50,
      "min_english": 50,
      "min_math": 75,
      "min_major": 75
    },
    {
      "index": 2,
      "name": "海城研究院",
      "description": "向上挑战 · 总分400，更考验计划与状态。",
      "tagline": "给自己一次挑战",
      "total": 400,
      "min_politics": 60,
      "min_english": 60,
      "min_math": 90,
      "min_major": 90
    }
  ],
  "subjects": [
    {
      "index": 0,
      "key": "politics",
      "name": "政治",
      "cap": 100
    },
    {
      "index": 1,
      "key": "english",
      "name": "英语",
      "cap": 100
    },
    {
      "index": 2,
      "key": "math",
      "name": "数学",
      "cap": 150
    },
    {
      "index": 3,
      "key": "major",
      "name": "专业",
      "cap": 150
    }
  ],
  "uiText": {
    "_comment": "界面文案与阈值：阶段标题、书桌场景提示（按优先级从上到下匹配）、压力警示线；previewFiller 为计划未排满时预览用来补位的行动 id",
    "previewFiller": "rest",
    "stressWarn": 70,
    "phases": [
      {
        "maxWeek": 4,
        "text": "先把基础搭起来"
      },
      {
        "maxWeek": 8,
        "text": "找到自己的节奏"
      },
      {
        "maxWeek": 99,
        "text": "冲刺，也要留点余地"
      }
    ],
    "scenes": [
      {
        "when": "stressAbove",
        "value": 65,
        "title": "慢一点，<br>也没关系。",
        "note": "脑子打结的时候，<br>先去操场走走吧。"
      },
      {
        "when": "energyBelow",
        "value": 35,
        "title": "灯可以晚点亮，<br>你需要先睡好。",
        "note": "恢复不是落后，<br>是给下一次学习留力气。"
      },
      {
        "when": "weekAbove",
        "value": 8,
        "title": "一步一步，<br>走到这里了。",
        "note": "不必和所有人比较，<br>看看自己的计划。"
      },
      {
        "when": "always",
        "value": 0,
        "title": "今天，也在<br>向前一点点。",
        "note": "把难题拆开，<br>把日子慢慢过。"
      }
    ]
  }
};
