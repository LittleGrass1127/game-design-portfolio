<div align="center">

# 🎮 高原｜游戏策划作品集

**系统策划 / 数值策划 · 先玩，再看怎么想的**

[![在线作品站](https://img.shields.io/badge/▶_在线作品站-d6ef72?style=for-the-badge&labelColor=0f1621)](https://littlegrass1127.github.io/game-design-portfolio/)
[![游戏大厅](https://img.shields.io/badge/🎲_可玩游戏大厅-86bfff?style=for-the-badge&labelColor=0f1621)](https://littlegrass1127.github.io/game-design-portfolio/play.html)
[![飞书作品集](https://img.shields.io/badge/📘_飞书作品集-ff9b86?style=for-the-badge&labelColor=0f1621)](https://ucnwdsitb71n.feishu.cn/wiki/DkGUwAYBZiwEO0kF5wWcpXuYnHd)

`3 个完整 Demo` · `4 个交互原型` · `7 个工程` · `1,600 局策略测试` · `241 条规则断言`

</div>

---

每个作品只回答三件事：**要解决什么设计问题、做了哪些取舍、用什么方式验证。** 能玩的先玩，想看过程再读文档。

## 🕹️ 可玩 Demo

| 作品 | 设计问题 | 做法 | 验证 |
|---|---|---|---|
| 🎲 [二十面野心·孙哥纪事](play.html?game=d20) | 五套玩法怎样共用一套资源和后果，而不是拼成五个小游戏？ | 4 幕、12 次 D20 检定、3 段赛车、5 种结局；前段成败改变后段起点 | 1,600 局固定策略测试，37/37 选项、74/74 成败分支覆盖 |
| 📚 [中国式考研：最后十二周](play.html?game=kaoyan) | 12 周、4 科、3 时段、11 种行动，玩家怎样看懂自己的取舍？ | 行动预览与实际结算共用同一套规则；C# 规则核心 + HTML 试玩版 | 241 条规则断言、288 个事件场景通过（Unity 导出包运行验收未完成） |
| 🧹 [团子清洁队](play.html?game=tuanzi) | 只有“移动”一个操作，能否撑起收集、合成、交付的短局循环？ | 自动吸附与合成；价值按 (3^L−1)/2 增长；2 分钟、120 个团子、14 项升级 | 13 条验收用例 |

另有 4 个交互原型：六分街深夜剪辑室、春风编花会、旧影回声、精灵巡游季，每个只保留一个核心操作和规则反馈。

统一入口：[可玩游戏大厅](play.html)。[下载完整离线包](downloads/playable-games.zip)，解压后双击 `play.html`；也可以单独打开任意游戏 HTML。

## 🛠️ 工程文件

每个作品都拆成可维护的工程：`src/`（直接打开 `src/index.html` 运行，无需构建）、`config/`（策划配置表 CSV / JSON）、`tests/`（`node` 直接运行）、`docs/design.md`（逆推的策划文档）。总览见 [projects/README.md](projects/README.md)。

| 工程 | 配置表 | 测试 | 文档 |
|---|---|---|---|
| [d20](projects/d20/README.md) | 幕 / 场景 / 37 个选项 / 78 条后果 / 5 结局 / 赛车与远征等 23 张 | 3 组 2,752 条断言（含 1,600 局固定种子模拟：37/37 选项、74/74 分支） | [design.md](projects/d20/docs/design.md) |
| [kaoyan](projects/kaoyan/README.md) | 基础参数、4 科、起点、目标线、11 种行动、事件与选项等 8 张 | 3 组 23,871 条断言（预览即结算穷举、与单文件版对拍） | [design.md](projects/kaoyan/docs/design.md) |
| [tuanzi](projects/tuanzi/README.md) | 局内参数、污渍区、团子等级价值、14 项升级与效果等 6 张 | 378 条断言（公式、升级逐项、可自动化验收用例、固定种子整局） | [design.md](projects/tuanzi/docs/design.md) |
| [liufen](projects/liufen/README.md) · [chunfeng](projects/chunfeng/README.md) · [jiuying](projects/jiuying/README.md) · [jingling](projects/jingling/README.md) | 每个原型 4–5 张：素材 / 花材 / 线索 / 传闻、评分系数、文案 | 配置完整性 + 判定函数，86 / 64 / 118 / 115 条断言 | 各自 `docs/design.md` |

断言数大头来自穷举和批量模拟的逐步比对，不等于独立规则点数量。

## 🧩 系统与数值方案 · 设计过程

- [青蛙战斗｜攻速改版后的数值重标](docs/frog-project.md)：统一乘系数会让吸血、灼烧、护盾各自失衡；按机制分别重标，用情形矩阵和路线模拟找风险，并写清模拟结论的边界。
- [二合活动｜把棋盘空间当作核心资源](docs/merge-project.md)：从空间压力出发，把订单、棋子权重、玩家分层和奖励节奏放进同一个系统。
- [试玩广告｜30 秒里的五个节点](docs/trial-ad.md)：入场理解、第一次成功、难度变化、接近失败、结束回看；每轮迭代只改一个变量。
- [断线托管 + 风迹手册｜状态机与代币方案对比](docs/system-numeric-case.md)：90 秒回控预算；两套代币方案对比（静态测算）。

## 📚 早期作品与拆解

从旧飞书作品集整理，索引见 [works/README.md](works/README.md)。

- [炉石传说｜游戏拆解案](works/hearthstone-teardown.md)
- [二合活动拆解](works/merge-teardown.md)
- [农场物语｜策划案](works/farm-story/design.md) · [需求文档](works/farm-story/requirements.md)（参考经典农场游戏的复刻练习）
- [战斗养成｜数值表](works/combat-growth/README.md)
- [游戏分析：卡牌、抽卡、SLG、回合数值](works/game-analysis.md)
- [试玩广告视频与 AI 生成图](works/trial-ad-video.md)（视频在飞书查看）
- [面试复盘与原创设计](docs/interview-and-original-design.md)
- [游戏经历与用户理解](docs/game-experience.md)

## 🧭 工作方法

- [活动数值设计与验证方法](docs/numeric-design.md)
- [系统规则、状态与异常处理](docs/system-design.md)
- [效率系统：AI、Lua 与测试工具](docs/efficiency-system.md)
- [立项、范围与交付复盘](docs/product-judgment.md)

## 🔒 公开说明

模拟、配置检查、项目内测试和线上数据分别标注。公开仓库不含内部配置字段、ID、Depot 路径与未公开玩法，不把团队成果或模拟结果写成个人线上实绩。
