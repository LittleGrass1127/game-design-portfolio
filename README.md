<div align="center">

# 🎮 高原｜游戏策划作品集

**系统策划 / 数值策划 · 拆解、设计与可玩作品**

[![在线作品站](https://img.shields.io/badge/▶_在线作品站-d6ef72?style=for-the-badge&labelColor=0f1621)](https://littlegrass1127.github.io/game-design-portfolio/)
[![游戏大厅](https://img.shields.io/badge/🎲_可玩游戏大厅-86bfff?style=for-the-badge&labelColor=0f1621)](https://littlegrass1127.github.io/game-design-portfolio/play.html)
[![飞书作品集](https://img.shields.io/badge/📘_飞书作品集-ff9b86?style=for-the-badge&labelColor=0f1621)](https://ucnwdsitb71n.feishu.cn/wiki/DkGUwAYBZiwEO0kF5wWcpXuYnHd)

`3 个完整 Demo` · `4 个交互原型` · `7 个工程` · `1,600 局策略测试` · `241 条规则断言`

</div>

---

每个作品只回答三件事：**要解决什么设计问题、做了哪些取舍、用什么方式验证。** 从拆解开始，到系统与数值设计，再到可以直接试玩的作品。

## 01 · 📚 拆解与策划案

- [炉石传说｜游戏拆解案](teardowns/hearthstone.md)
- [二合活动拆解｜逃离房间](teardowns/merge-teardown.md)
- [农场物语｜策划案](teardowns/farm-story/design.md) · [需求文档](teardowns/farm-story/requirements.md)（参考经典农场游戏的复刻练习）
- [游戏分析与用户理解](teardowns/game-analysis.md)：卡牌平衡、抽卡经济、SLG 对比、回合制行动经济

## 02 · 🧩 系统与数值设计

- [青蛙战斗｜攻速改版后的数值重标](design/frog-battle.md)：从活动总消耗反推成长与怪物强度；统一乘系数会让吸血、灼烧、护盾各自失衡，按机制分别重标，用情形矩阵和路线模拟找风险。
- [二合活动｜把棋盘空间当作核心资源](design/merge-event.md)：从空间压力出发，把订单、棋子权重、玩家分层和奖励节奏放进同一个系统。
- [试玩广告｜30 秒里的五个节点](design/playable-ad.md)：入场理解、第一次成功、难度变化、接近失败、结束回看；附多投放位适配录屏说明。
- [断线托管 + 风迹手册｜状态机与代币方案对比](design/disconnect-and-wind-guide.md)：90 秒回控预算；两套代币方案对比（静态测算）。
- [战斗养成｜数值表](design/combat-growth/README.md)：技能表与商店奖励表，线性属性 + 非线性攻击间隔、按玩家反推怪物。

## 03 · 🕹️ 可玩作品

| 作品 | 设计问题 | 做法 | 验证 |
|---|---|---|---|
| 🎲 [二十面野心·孙哥纪事](play.html?game=d20) | 五套玩法怎样共用一套资源和后果，而不是拼成五个小游戏？ | 4 幕、12 次 D20 检定、3 段赛车、5 种结局；前段成败改变后段起点 | 1,600 局固定策略测试，37/37 选项、74/74 成败分支覆盖 |
| 📚 [中国式考研：最后十二周](play.html?game=kaoyan) | 12 周、4 科、3 时段、11 种行动，玩家怎样看懂自己的取舍？ | 行动预览与实际结算共用同一套规则；C# 规则核心 + HTML 试玩版 | 241 条规则断言、288 个事件场景通过（Unity 导出包运行验收未完成） |
| 🧹 [团子清洁队](play.html?game=tuanzi) | 只有“移动”一个操作，能否撑起收集、合成、交付的短局循环？ | 自动吸附与合成；价值按 (3^L−1)/2 增长；2 分钟、120 个团子、14 项升级 | 13 条验收用例 |

| 作品 | 玩多久 | 怎么操作 |
|---|---|---|
| 二十面野心·孙哥纪事 | 12–18 分钟 | 键盘为主：WASD 移动，E 检定，赛车 A / D 转向、Shift 增压 |
| 中国式考研：最后十二周 | 10–15 分钟 | 鼠标 / 触屏：每周点三个行动，看预览再确认 |
| 团子清洁队（推荐先玩） | 2 分钟 | 键盘 / 鼠标 / 触屏：只需要移动 |
| 4 个交互原型 | 各 1–2 分钟 | 点击 |

4 个原创交互原型，每个只保留一个核心操作和规则反馈：[夜灯街深夜剪辑室](play.html?game=yedeng) · [春风编花会](play.html?game=chunfeng) · [旧影回声](play.html?game=jiuying) · [精灵巡游季](play.html?game=jingling)。

统一入口：[可玩游戏大厅](play.html)。[下载完整离线包](downloads/playable-games.zip)，解压后双击 `play.html`；也可以单独打开任意游戏 HTML。

### 🛠️ 工程文件

每个作品都拆成可维护的工程：`src/`（直接打开 `src/index.html` 运行，无需构建）、`config/`（策划配置表 CSV / JSON）、`tests/`（`node` 直接运行）、`docs/design.md`（策划文档）。总览见 [projects/README.md](projects/README.md)。

| 工程 | 配置表 | 测试 | 文档 |
|---|---|---|---|
| [d20](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/d20) | 幕 / 场景 / 37 个选项 / 78 条后果 / 5 结局 / 赛车与远征等 23 张 | 3 组 2,877 条断言（含 1,600 局固定种子模拟：37/37 选项、74/74 分支） | [design.md](projects/d20/docs/design.md) |
| [kaoyan](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/kaoyan) | 基础参数、4 科、起点、目标线、11 种行动、事件与选项等 8 张 | 3 组 23,871 条断言（预览即结算穷举、与单文件版对拍） | [design.md](projects/kaoyan/docs/design.md) |
| [tuanzi](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/tuanzi) | 局内参数、污渍区、团子等级价值、14 项升级与效果等 6 张 | 388 条断言（公式、升级逐项、可自动化验收用例、固定种子整局） | [design.md](projects/tuanzi/docs/design.md) |
| [yedeng](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/yedeng) · [chunfeng](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/chunfeng) · [jiuying](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/jiuying) · [jingling](https://github.com/LittleGrass1127/game-design-portfolio/tree/main/projects/jingling) | 每个原型 4–5 张：素材 / 花材 / 线索 / 传闻、评分系数、文案 | 配置完整性 + 判定函数，102 / 84 / 178 / 124 条断言 | 各自 `docs/design.md` |

断言数大头来自穷举和批量模拟的逐步比对，不等于独立规则点数量。

## 04 · 🧭 工作方法

- [效率系统｜AI、Lua、命令行](methods/efficiency-system.md)：标准化 → 最小跑通 → 日志验收 → 批量扩量 → 工具化沉淀；附配置检查与四层验收清单。

## 🔒 公开说明

模拟、配置检查、项目内测试和线上数据分别标注。公开仓库不含内部配置字段、ID、Depot 路径与未公开玩法，不把团队成果或模拟结果写成个人线上实绩。
