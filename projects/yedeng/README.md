# 夜灯街深夜剪辑室

交互原型：从七段受损录像里选五段、排好顺序，试映通过后正式放映。

## 设计问题

单看每段素材的分数挑高分，能不能得到好片子？这里的答案是不能：顺序（相邻片段的情绪跳跃）和结尾选择同样算分，试映只告诉玩家问题出在“结尾”还是“节奏”，不给标准答案。

## 核心循环

```
读委托 → 点素材加入时间轴（最多 5 段）→ 试映 → 读反馈（结尾 / 节奏 / 通过）
      → 调整顺序或换素材 → 再试映 → 正式放映 → 再剪一版
```

## 怎么玩

- 操作：鼠标或触屏点击。点右侧素材加入时间轴，点时间轴片段移除；片段按加入顺序排列。
- 目标：选满五段，让试映通过，再正式放映。一轮 1–2 分钟。
- 提示：素材卡上的“情绪”数字决定节奏分，相邻片段差得越小越连贯；委托要求以“片尾合影”收尾。
- 放映后点「再剪一版」重来，也可以直接接着改。

## 规则与数值在哪张配置表

| 配置表 | 内容 |
| --- | --- |
| `config/clips.csv` | 7 段素材：标签、情绪强度 mood（1–5）、稳定度 stable（0–100） |
| `config/commission.json` | 委托文案与目标、时间轴格数、要求的结尾素材、试映的节奏阈值（70） |
| `config/scoring.json` | 主题 / 节奏 / 稳定三项的公式系数与总分权重（0.42 / 0.38 / 0.2）、进度条 |
| `config/texts.json` | 首屏目标、三种试映反馈、两种放映反馈、提示文案 |

公式与调参记录见 [docs/design.md](docs/design.md) 第 3 节。

改了 `config/` 之后重新导出，再跑测试：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件与配置表一致
```

## 怎么验证

```bash
node tests/config.test.cjs
```

实际运行结果：102 条断言全部通过。覆盖配置完整性、导出一致性、评分与试映判定的定值，以及对全部 2,520 种排列的穷举（通过 24 种，最高分只出现在通过方案里）。

另用 headless Chromium 在单文件版和拆分版上执行同一套 24 步点击，逐步比对界面状态一致，控制台无报错。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=yedeng>
- 仓库内入口：[../../play.html?game=yedeng](../../play.html?game=yedeng)
- 单文件版（线上与离线包用的就是它）：[../../prototypes/yedeng.html](../../prototypes/yedeng.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)
