# 高原｜系统 / 数值策划作品集

2027 届本科｜大连理工大学（985 / 双一流 A 类）｜系统策划 / 数值策划方向

- 飞书作品集：https://ucnwdsitb71n.feishu.cn/wiki/DkGUwAYBZiwEO0kF5wWcpXuYnHd
- GitHub Pages：https://littlegrass1127.github.io/game-design-portfolio/
- GitHub 仓库：https://github.com/LittleGrass1127/game-design-portfolio
- 高原个人作品集原版归档：https://ucnwdsitb71n.feishu.cn/wiki/IgKjwlMMlik2hQkkth0c7YisnXc

## 这个仓库放什么

这里放的是我能公开的工作：可玩 Demo、系统与数值方案、项目复盘，还有游戏经历。实习里的内部配置、UID、Depot 路径和未公开数据没有放上来。

## 3 分钟阅读路线

1. **游戏经历怎么转成判断**：看 [`docs/game-experience.md`](docs/game-experience.md)。炉石、原神、星铁、暗黑 4 等时长与成就，以及它们如何影响系统、战斗和数值判断。
2. **数值怎么落地**：看 [`docs/numeric-design.md`](docs/numeric-design.md)。从活动总消耗反推成长、怪物、技能和奖励，再用模拟、GM/Lua 和服务器日志验收。
3. **系统怎么闭环**：看 [`docs/system-design.md`](docs/system-design.md)。以活动系统和断线托管为例，拆控制流、状态、配置、异常、补偿和验收。
4. **制作人视角**：看 [`docs/product-judgment.md`](docs/product-judgment.md)。从市场、产品命题、范围成本、团队交付、商业运营到上线复盘，完整看一个玩法怎么立项和交付。
5. **系统 + 数值联合案例**：看 [docs/system-numeric-case.md](docs/system-numeric-case.md)。断线托管的状态机、90 秒回控预算，以及风迹手册的 8 币方案和 6.71% 预算内测算。
6. **效率系统**：看 [docs/efficiency-system.md](docs/efficiency-system.md)。从标准化、最小跑通、日志验收、批量扩量到工具化沉淀，含 Lua/GM/命令行和 AI 提效流程。

## 面试复盘与原创设计

- [面试复盘与原创设计｜青蛙、二合、暗黑4、原神](docs/interview-and-original-design.md)：整理飞书妙记中的原始问答、复盘后的更好回答、青蛙和二合的项目实际、暗黑4新职业“罪契使”和原神新角色“顾霜”。

## 三段实习项目

**项目定位：**《无限暖暖》是 UE 开发的换装开放世界手游；二合项目是一款面向欧美市场的卡通二合手游；《贪吃蛇大作战》是一款以吞噬成长、碰撞生存和多人竞技为核心的休闲手游。

- [二合活动｜从玩法理解到项目落地](docs/merge-project.md)：生成器、物品链、订单、棋盘空间、阶段与商业奖励的系统拆解，以及通行证、积分、剧情、图鉴和 Chess & Board 的项目实践。
- [青蛙战斗｜强数值活动的战斗与奖励闭环](docs/frog-project.md)：从成长上限反推怪物强度，279 个战斗情形、攻速改版重标、324 条合法路线验证，以及 GM/Lua 和服务器日志验收。
- [试玩广告｜把 30 秒广告做成可玩原型](docs/trial-ad.md)：围绕第一次理解、第一次反馈和“差一点赢”的结束点设计 30 秒试玩原型；3 款上线，单款累计消耗 3 万元，ROAS 7d 10%。

## 可玩 Demo

- [《二十面野心·孙哥纪事》](demos/d20.html)：4 幕、12 个目标、12 次检定、3 段赛车、5 种结局，单 HTML 离线可玩。
- [《中国式考研：最后十二周》](demos/kaoyan.html)：把时间分配和风险管理做成 12 周系统，HTML 可玩。
- [《团子清洁队》](demos/tuanzi.html)：2 分钟短局收集玩法，价值公式、14 项升级和状态边界。
- [六分街深夜剪辑室](prototypes/liufen.html)：素材选择、排序、试映和反馈。
- [春风编花会](prototypes/chunfeng.html)：花材选择、环形布置、愿望与多目标评分。
- [旧影回声](prototypes/jiuying.html)：曝光修复、事实/推断分类、核对与归档。
- [精灵巡游季](prototypes/jingling.html)：传闻选择、环境判断、共鸣与结伴挑战。

## 我关注的三件事

- **先定义做对**：接需求先对齐目标、约束、成功条件和验收人，不把“文档写完/表配完”当交付。
- **先跑最小闭环**：先做能跑通的最小版本，暴露状态、数值和体验问题，再扩内容和表现。
- **AI 扩宽，人做判断**：AI 用来生成方案、批量拉表、写测试脚本和查漏；创意、取舍和验收由自己负责。

## 工作方法

- 目标：先问为什么做、用户是谁、市场是否同质、我们凭什么做出差异。
- 设计：把玩法拆成机制、节奏、表达和商业四层，每层都写验证指标。
- 落地：配置表字段、ID、引用、状态流转、异常与补偿、前后端字段边界一起检查。
- 验收：模拟、实机、GM/Lua、服务器日志和玩家反馈互相校验，不以“请求发出”代替“结果到账”。
- 复盘：按目标、机制、数值、信息、验证五层拆问题，下一版先改判断标准，再调参数。




