# 中国式考研：最后十二周（工程版）

十二周、四科、每周三个时段：在学习、精力、压力和生活费之间排出一份“刚刚好”的计划，最后用总分和单科线检验自己的取舍。

- 在线试玩：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=kaoyan>
- 仓库内试玩入口：[../../play.html?game=kaoyan](../../play.html?game=kaoyan)
- 单文件版本：[../../demos/kaoyan.html](../../demos/kaoyan.html)
- 逆推策划文档：[docs/design.md](docs/design.md)

本目录是从单文件 Demo 逆推整理出的工程结构：配置表、纯规则核心、界面三层分开。规则核心是原 C# 规则核心的 JS 移植；原 Unity 工程不在本仓库。

## 怎么运行

不需要构建工具。直接用浏览器打开 `src/index.html` 即可（支持 `file://`）。

改了配置表之后重新导出：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件与 config/ 一致
```

## 目录结构

```
projects/kaoyan/
  README.md
  config/                    策划配置表（改这里）
  src/
    index.html               页面骨架 + 书桌插画模板（内联 SVG）
    style.css                样式
    js/config.generated.js   由 config/ 导出的 window.GAME_CONFIG（不要手改）
    js/rules.js              规则核心：效率、预览/结算、事件、周推进、结局、存档校验（纯逻辑，无 DOM）
    js/ui.js                 界面模板：读取共享状态，返回 HTML 字符串
    js/main.js               入口：运行状态、本地存档、导入导出、点击事件
  tools/export-config.cjs    配置导出脚本
  tests/                     node 直接运行的测试
  docs/design.md             逆推策划文档
```

脚本加载顺序：`config.generated.js → rules.js → ui.js → main.js`。

## 配置表

| 文件 | 导出 key | 条目 | 用途 |
|---|---|---|---|
| `config/exam-config.json` | `examConfig` | 1 组 | 周数、时段数、默认种子、初始精力/压力/预算、每周生活费与周末恢复、资源上限、事件间隔、学习效率系数 |
| `config/subjects.csv` | `subjects` | 4 | 科目名与满分（政治/英语 100，数学/专业 150） |
| `config/backgrounds.csv` | `backgrounds` | 3 | 开局起点：名称、描述、四科初始分 |
| `config/goals.csv` | `goals` | 3 | 目标院校：总分线、四科单科线、开局页标语 |
| `config/actions.csv` | `actions` | 11 | 行动：分类（study/sprint/life）、科目、基础收益、精力/压力变化、花费、收入、图标字 |
| `config/events.csv` | `events` | 8 | 生活事件：标题、正文、图标字 |
| `config/event-options.csv` | `eventOptions` | 16 | 事件选项（每个事件 2 个）：文案、预算/精力/压力变化、四科加分 |
| `config/ui-text.json` | `uiText` | — | 阶段标题、书桌场景提示及触发阈值、压力警示线、预览补位行动 |

`rules.js` 中的 `buildExamConfig(GAME_CONFIG)` 把这些表组装成原 `exam_config.json` 的结构交给规则引擎；测试会校验组装结果与原单文件内嵌配置完全一致。

## 测试

```bash
node tests/config.test.cjs   # 配置完整性、导出一致性、与原内嵌配置一致、改表即生效
node tests/rules.test.cjs    # 效率公式、预览即结算、固定种子确定性、clamp、预算、周推进、结局、存档校验
node tests/parity.test.cjs   # 与原单文件规则脚本逐局对拍
```

每个测试末尾打印 `N assertions passed`，当前结果见 [docs/design.md](docs/design.md) 的“验证方法”。
