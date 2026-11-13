# 高原｜系统 / 数值策划作品集

2027 届本科｜大连理工大学（985 / 双一流 A 类）｜系统策划 / 数值策划方向

- 飞书作品集：https://ucnwdsitb71n.feishu.cn/wiki/DkGUwAYBZiwEO0kF5wWcpXuYnHd
- GitHub Pages：https://littlegrass1127.github.io/game-design-portfolio/
- GitHub 仓库：https://github.com/LittleGrass1127/game-design-portfolio

## 这个仓库放什么

这里只放可以公开查看的内容：可玩 Demo、系统/数值方法说明、产品判断和项目复盘。实习项目的内部配置、UID、Depot 路径、未公开内容和原始数据不在仓库中。

## 3 分钟阅读路线

1. **数值怎么落地**：看 [`docs/numeric-design.md`](docs/numeric-design.md)。从活动总消耗反推成长、怪物、技能和奖励，再用模拟、GM/Lua 和服务器日志验收。
2. **系统怎么闭环**：看 [`docs/system-design.md`](docs/system-design.md)。以活动系统和断线托管为例，拆控制流、状态、配置、异常、补偿和验收。
3. **玩法怎么判断**：看 [`docs/product-judgment.md`](docs/product-judgment.md)。先回答为什么做、为什么是我们、为什么不抄、怎么验证，再谈功能和排期。

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
