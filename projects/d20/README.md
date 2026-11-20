# 二十面野心 · 孙哥纪事

12–18 分钟的单机 D20 融合短局：4 幕合同远征、12 次 D20 剧情检定、3 次营地分工、3 段夜航赛车、5 种结局。

## 设计问题

D20 剧情检定、动作远征、牌组构筑、营地经营、赛车回收这五套玩法，能不能在一个短局里共用同一套资源与后果，而不是拼成五个各算各的小游戏？做法是让一次选择同时驱动多套系统：每次检定给对应属性的行动卡 +1 层，卡层直接改远征和赛车属性；每次营地选择 = 一项成长 + 一个房间升级 + 下一段赛车的车辆模组；赛车档位再结算回剧情资源。

## 核心循环

```
选出身 → [第 N 幕] 合同远征：移动 + 自动攻击 + 拾取零件
       → 靠近合同节点按 E → D20 检定（看胜率 → 掷骰 → 可改口重掷 → 接受）
       → 每幕 3 次检定后回营地：三选一成长 = 房间升级 + 下段车辆模组
       → 夜航赛车：撞上前车即回收，按吸收数与连撞评金 / 银 / 铜
       → [第 N+1 幕] …… 第 4 幕结束按整夜状态判定结局 → 再来一局
```

## 怎么玩

- 操作：WASD / 方向键移动（也可点击地面寻路），靠近合同按 E；对话里点选项或按 1–3；检定面板按 Enter 接受、R 改口重掷；赛车 A / D 转向、W / S 调车位、Shift 增压；C 人物面板，Esc 菜单。触屏有方向键和互动 / 增压按钮。
- 目标：一夜走完 4 处现场、12 次检定，走向 5 种结局之一。失败只留下代价，不会卡关。
- 提示：检定前能看到胜率；不必清完敌人再检定；赛车里主动撞车才有金 / 银档，不操作也能抵达但只拿铜档。
- 进度自动保存，结局后可直接开新局。建议电脑端游玩。

## 规则与数值在哪张配置表

共 23 张，常改的几张：

| 配置表 | 内容 |
| --- | --- |
| `config/rules.json` | D20 规则常量：熟练加值、经验与等级阈值、暴击倍率、改口范围、危机压力线 |
| `config/stats.csv` `resources.csv` `origins.csv` | 4 项属性、4 种资源、4 种出身 |
| `config/scenes.csv` `choices.csv` `outcomes.csv` | 13 个场景、37 个检定选项（属性与 DC）、78 条成败后果 |
| `config/choice-conditions.json` | 31 个选项的解锁条件、情境修正、优势 / 劣势 |
| `config/interludes.csv` `camp-rooms.csv` | 3 次营地 × 3 个成长选项；槽位 → 房间 → 车辆模组 |
| `config/build-stats.json` | 行动卡层数与房间等级 → 远征 / 赛车属性的系数 |
| `config/race.json` `race-tiers.csv` `vehicle-modules.csv` | 赛车物理与夜雾走廊、金 / 银 / 铜档门槛与奖励、模组倍率 |
| `config/explore-maps.json` `combat.json` `combat-acts.csv` | 远征地图、无人机波次与逐幕强度 |
| `config/endings.json` | 5 个结局的判定条件与正文 |

全部表的字段说明、公式和调参记录见 [docs/design.md](docs/design.md) 第 3–5 节。

改了 `config/` 之后重新导出，再跑测试：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件与配置表一致
```

## 怎么验证

```bash
node tests/rules.test.cjs     # 配置完整性、公式、规则、结局、存档、与单文件版逐局一致
node tests/action.test.cjs    # 构筑公式、夜雾走廊、档位、远征与赛车逐帧对照单文件版
node tests/simulate.test.cjs  # 1,600 局固定种子批量模拟与覆盖统计
```

实际运行结果：876 + 394 + 1,607 = 2,877 条断言全部通过。

- 批量模拟：4 种固定策略 × 400 个种子 = 1,600 局，场景 13/13、选项 37/37、成败分支 74/74 全部触发，每局恰好 12 次检定，五种结局都可达，没有一局卡死。
- 赛车档位：3 种固定驾驶方式各 36 场的金 / 银 / 铜分布——不操作 0 / 1 / 35，只跟安全走廊 0 / 30 / 6，追最近的车 31 / 5 / 0。

另用 headless Chromium 在单文件版和拆分版各自动走完一整局，控制台无报错。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=d20>
- 仓库内入口：[../../play.html?game=d20](../../play.html?game=d20)
- 单文件版（线上与离线包用的就是它）：[../../demos/d20.html](../../demos/d20.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)

## 目录与第三方库

```
config/                 23 张策划配置表
src/index.html          页面骨架
src/js/story.js         把配置表组装成故事对象
src/js/rules.js         规则核心：检定、改口、成败结算、成长、夜航奖励、结局、存档回放校验
src/js/action-sim.js    动作模拟：远征与赛车
src/js/art-noir.js      场景与人物立绘       src/js/art-action.js   远征 / 赛车画面
src/js/main.js          界面、事件、存档、音效
src/vendor/phaser.min.js  Phaser 3.90.0
tools/export-config.cjs 配置导出
tests/                  3 组测试
```

`src/vendor/phaser.min.js` 是 **Phaser 3.90.0**（<https://phaser.io>，MIT License，Copyright (c) 2024 Richard Davey, Phaser Studio Inc.），未改动，只在文件头补了一行版本 / 许可注释。游戏用它创建一块 960×540 的 Canvas 舞台，画面由 `art-*.js` 用 Canvas2D 绘制。
