# 团子清洁队 · 工程目录

只用“移动”一个操作的 2 分钟短局：靠近团子自动吸附，同色同级自动合成，回到中央餐车自动交付，五次四选一升级让下一圈更快。

- 在线试玩：https://littlegrass1127.github.io/game-design-portfolio/play.html?game=tuanzi
- 仓库内试玩入口：[../../play.html?game=tuanzi](../../play.html?game=tuanzi)
- 原单文件版本：[../../demos/tuanzi.html](../../demos/tuanzi.html)
- 逆推策划文档：[docs/design.md](docs/design.md)

## 怎么运行

无需构建，直接用浏览器打开 [src/index.html](src/index.html)（支持 `file://`）。

修改配置表后重新导出：

```bash
node tools/export-config.cjs          # 由 config/ 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件是否最新
```

## 目录结构

```
projects/tuanzi/
  README.md
  config/                     策划配置表
    game.json                 局时长、地图尺寸、升级阈值、角色初始属性、吸附/冲刺/交付/连送参数、结算文案
    patches.csv               6 个污渍区：位置、半径、团子数
    colors.csv                3 种团子颜色
    dango-levels.csv          7 个等级：价值 (3^L−1)/2、绘制尺寸、跟随间距
    upgrades.csv              14 项升级：图标、名称、描述、分类、权重、是否唯一
    upgrade-effects.csv       升级效果：目标字段、操作（mul/add/set）、数值
  src/
    index.html
    style.css
    js/
      config.generated.js     导出的 window.GAME_CONFIG（不要手改）
      rules.js                纯规则：价值、合成、交付、连送、升级、结算（window.TuanziRules）
      world.js                世界与实体：生成、移动、吸附、队列、相机（window.TuanziWorld）
      render.js               Canvas 绘制
      input.js                键盘 / 鼠标 / 触屏输入
      audio.js                WebAudio 音效
      main.js                 状态机与游戏循环、HUD 与弹窗
  tools/export-config.cjs     配置导出脚本
  tests/
    helpers/load.cjs          vm 沙箱加载浏览器脚本
    rules.test.cjs            配置完整性、公式、验收用例、升级效果、固定种子整局模拟
  docs/design.md              逆推策划文档
```

## 配置表说明

| 文件 | 导出 key | 说明 |
|---|---|---|
| `game.json` | `GAME_CONFIG.game` | 全局参数：`durationSec`=120、`upgradeThresholds`=[18,38,60,84,108]、`player.capacity`=7、`player.suction`=155、`cart.deliveryRadius`=122、`combo.step`=0.12 等 |
| `patches.csv` | `GAME_CONFIG.patches` | 地图上的团子分布，合计 120 个 |
| `colors.csv` | `GAME_CONFIG.colors` | 颜色数量同时决定合成检测范围 |
| `dango-levels.csv` | `GAME_CONFIG.dangoLevels` | 等级价值表，最高 7 级 |
| `upgrades.csv` | `GAME_CONFIG.upgrades` | 升级卡面与抽取权重 |
| `upgrade-effects.csv` | `GAME_CONFIG.upgradeEffects` | 升级的实际数值效果，一项升级可以有多行 |

字段含义和调参影响见 [docs/design.md](docs/design.md) 第 5 节。

## 怎么跑测试

```bash
node tests/rules.test.cjs
```

最后一行会打印 `N assertions passed`，当前是 378 条。
