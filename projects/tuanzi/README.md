# 团子清洁队

只用“移动”一个操作的 2 分钟短局：靠近团子自动吸附，同色同级自动合成，回到中央餐车自动交付，五次四选一升级让下一圈更快。

## 设计问题

如果玩家只有“移动”一个操作，能不能撑起收集 → 合成 → 交付 → 成长的完整短局循环？做法是把吸附、合成、交付都做成“靠近即触发”的规则，玩家只做路线决策：去哪片污渍、什么时候回餐车、要不要多走几步凑合成。

## 核心循环

```
移动 → 团子进入吸附圈被拉近 → 进背包 → 同色同级凑够 3 只自动合成（可连锁）
     → 回中央餐车自动交付换金币，连送 +1
     → 清理数到达节点 → 四选一升级 → 下一圈更快
     → 120 秒到或 120 只清空 → 结算 → 再来一局
```

## 怎么玩

- 操作：WASD / 方向键移动，或点击、拖动画面移动；空格或左下角「冲刺」按钮冲刺；升级时按 1–4 或点击选择；回车开始 / 再来一局。
- 目标：两分钟内把 120 只团子全部送回中央餐车，金币越多越好。不会失败。
- 提示：背包默认装 7 只，满了要回餐车；8 秒内连续交付有连送加成；提前清空有时间奖励。
- 支持键盘、鼠标和触屏；竖屏可玩，横屏或电脑上画面更大。

## 规则与数值在哪张配置表

| 配置表 | 内容 |
| --- | --- |
| `config/game.json` | 局时长 120 s、地图与视口尺寸、升级阈值 [18, 38, 60, 84, 108]、角色初始属性（容量 7、吸附半径 155 等）、冲刺、吸附、交付半径、连送步长 0.12、结算档位、界面缩放基准 |
| `config/patches.csv` | 6 个污渍区的位置、半径、团子数（合计 120） |
| `config/colors.csv` | 3 种团子颜色（数量同时决定合成检测范围） |
| `config/dango-levels.csv` | 7 个等级的价值 (3^L−1)/2、绘制尺寸、跟随间距 |
| `config/upgrades.csv` | 14 项升级的卡面、分类、抽取权重 |
| `config/upgrade-effects.csv` | 升级的实际数值效果（目标字段、mul / add / set、数值） |

公式和字段说明见 [docs/design.md](docs/design.md) 第 4–5 节。

改了 `config/` 之后重新导出，再跑测试：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件与配置表一致
```

## 怎么验证

```bash
node tests/rules.test.cjs
```

实际运行结果：388 条断言全部通过。覆盖配置完整性、导出一致性、价值与连送公式、14 项升级逐项效果、13 条玩法验收用例中可自动化的部分，以及固定种子整局模拟（seed 42：清空 120 只、5 次升级、354 金币）。

另用 headless Chromium 在五种视口（含竖屏、横屏触屏和 1600×900）走完“开始 → 移动 → 冲刺 → 交付 → 升级 → 结算 → 重开”，卡片都完整落在舞台内，控制台无报错。验收用例对照表见 [docs/design.md](docs/design.md) 第 7.2 节。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=tuanzi>
- 仓库内入口：[../../play.html?game=tuanzi](../../play.html?game=tuanzi)
- 单文件版（线上与离线包用的就是它）：[../../demos/tuanzi.html](../../demos/tuanzi.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)

## 目录

```
config/                 策划配置表
src/index.html          页面骨架
src/js/rules.js         纯规则：价值、合成、交付、连送、升级、结算
src/js/world.js         世界与实体：生成、移动、吸附、队列、相机
src/js/render.js        Canvas 绘制        src/js/input.js   键盘 / 鼠标 / 触屏
src/js/audio.js         WebAudio 音效      src/js/main.js    状态机、循环、HUD 与弹窗
tools/export-config.cjs 配置导出
tests/rules.test.cjs    规则测试
```
