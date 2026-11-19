# 二十面野心 · 孙哥纪事（工程版）

一部 12–18 分钟的单机 D20 融合小游戏：4 幕合同远征 + 12 次 D20 剧情检定 + 3 次营地分工 + 3 段夜航赛车 + 5 种结局，五套玩法共用一套资源与后果。本目录是把原单文件 Demo 逆推拆分后的工程形态：规则、内容、美术、界面分文件，数值与文案抽成策划配置表。

- 在线试玩：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=d20>
- 仓库内试玩入口：[../../play.html?game=d20](../../play.html?game=d20)
- 原单文件：[../../demos/d20.html](../../demos/d20.html)
- 策划文档：[docs/design.md](docs/design.md)

## 怎么运行

不需要构建。直接用浏览器打开 `src/index.html`（file:// 即可离线运行），或在仓库根目录起任意静态服务器后访问 `projects/d20/src/index.html`。

改了 `config/` 下的配置表后，重新导出运行时配置：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 只校验是否一致
```

## 目录结构

```
projects/d20/
  README.md
  config/                      策划配置表（见下）
  docs/design.md               逆推策划文档
  src/
    index.html                 页面骨架，按顺序加载下列脚本
    style.css                  原两个 <style> 块合并
    assets/                    Phaser 默认贴图（default / missing / white），由原文件内嵌 base64 抽出
    vendor/phaser.min.js       第三方库 Phaser 3.90.0（MIT），原文件第 250 行，未改动
    js/config.generated.js     由 tools/export-config.cjs 生成的 window.GAME_CONFIG（不要手改）
    js/story.js                内容：把配置表组装成故事对象 SunD20Story
    js/rules.js                规则核心 SunD20Engine：D20 检定、改口、成败结算、成长、夜航奖励、结局、存档回放校验
    js/action-sim.js           动作模拟 SunD20ActionSim：远征（寻路、自动攻击、波次、掉落）与赛车（车流、吸收、夜雾）
    js/art-noir.js             金融 noir 场景与人物立绘（Canvas2D）
    js/art-action.js           远征 / 赛车画面（Canvas2D）
    js/main.js                 入口与界面：DOM、事件、Phaser 舞台、存档、音效
  tools/export-config.cjs      配置导出
  tests/                       node 直接运行的测试
```

`story.js`、`rules.js`、`action-sim.js` 都是纯逻辑（无 DOM），沿用原文件的 UMD 写法，可在 node / vm 里直接加载。

## 第三方库

`src/vendor/phaser.min.js` 是 **Phaser 3.90.0**（<https://phaser.io>，MIT License，Copyright (c) 2024 Richard Davey, Phaser Studio Inc.），从原单文件第 250 行原样取出，只在文件头补了一行版本 / 许可注释。游戏用它创建一块 960×540 的 Canvas 舞台，画面本身由 `art-*.js` 用 Canvas2D 绘制。

原文件里的 3 处 `data:image/png;base64` 都在 Phaser 库内：默认贴图 / 缺失贴图共用一个前缀、白色贴图一个、混合模式探测一个。前两处对应的 3 张贴图抽成了 `src/assets/phaser-*.png`，并在 `main.js` 的 `Phaser.Game` 配置里用 `images` 改为相对引用；混合模式探测图需要同源读取像素，仍留在库里。

## 配置表

| 文件 | 条目 | 用途 |
|-|-|-|
| `rules.json` | 对象 | D20 规则常量：初始种子、关系/改口范围、危机压力线、熟练加值、经验与等级阈值、暴击倍率、检定上限 |
| `stats.csv` | 4 | 四项属性（辞令/洞察/胆识/技术）：名称、提示、初始值、上下限 |
| `resources.csv` | 4 | 资源（资本/声望/压力/筹码）：初始值、上下限、引擎与界面名称 |
| `characters.csv` | 4 | 主角与 3 名同伴：外观、描述、是否参与关系值 |
| `origins.csv` | 4 | 出身履历：加成属性、熟练、初始特质 |
| `acts.csv` | 4 | 4 幕：标题、地点、简介、3 个时钟刻度 |
| `scenes.csv` | 13 | 场景节点：所属幕、说话人、正文 |
| `choices.csv` | 37 | 检定选项：所属场景、属性、DC、文案 |
| `choice-conditions.json` | 31 个选项 | 选项的解锁条件 / 情境修正 / 优势 / 劣势（嵌套条件） |
| `outcomes.csv` | 78 | 成败后果：74 条成功/失败 + 4 条专属大成功/大失败；资源与关系增量、旗标、物品、后续节点 |
| `interludes.csv` | 9 | 3 次营地 × 3 个成长选项的效果 |
| `camp-rooms.csv` | 3 | 营地槽位 → 房间（指挥室/工坊/医务室）→ 下一段赛车模组 |
| `action-cards.csv` | 4 | 四类行动卡（每次检定按属性 +1 层）的说明 |
| `build-stats.json` | 对象 | 行动卡层数与房间等级 → 远征 / 赛车属性的系数 |
| `endings.json` | 5 | 结局：判定条件（自上而下第一条满足）与正文 |
| `race.json` | 对象 | 赛车：赛道长度、车道、基础性能、吸收成长、增压、夜雾走廊、车流、评分权重 |
| `race-legs.csv` | 3 | 3 段夜航的编号与起止幕 |
| `race-tiers.csv` | 3 | 回收档位（金/银/铜）门槛与奖励、结算文案 |
| `vehicle-modules.csv` | 5 | 车辆模组性能倍率 |
| `explore-maps.json` | 4 张图 | 远征地图：边界、障碍、3 个合同节点、节点奖励 |
| `combat.json` | 对象 | 无人机波次节奏、刷新半径、受击冷却、拾取 |
| `combat-acts.csv` | 4 | 逐幕无人机数量、血量、速度、接触伤害、零件价值 |
| `meta.json` | 对象 | 标题与免责声明 |

CSV 一行一条、首行字段名；多值字段用 `|` 分隔（如 `flags`、`items`）。导出后文件名转 camelCase 作为 `GAME_CONFIG` 的 key（`race-tiers.csv` → `GAME_CONFIG.raceTiers`）。

## 测试

```bash
node tests/rules.test.cjs     # 配置完整性、公式、规则、结局、存档、与原版逐局一致、导出一致
node tests/action.test.cjs    # 构筑公式、夜雾走廊、档位、远征与赛车逐帧对照原版
node tests/simulate.test.cjs  # 1,600 局固定种子批量模拟与覆盖统计
```

测试用 `tests/helpers/load.cjs` 在 vm 沙箱加载纯逻辑脚本；`tests/helpers/original.cjs` 从 `../../demos/d20.html` 取出原版的故事、规则、动作模拟脚本作为对照组。实际结果见 [docs/design.md](docs/design.md#验证方法)。
