# 春风编花会（交互原型工程）

选择花材、种进十六个环形落点，在色彩、高低层次和三位友邻的愿望之间找兼顾方案。只验证"选材 + 空间布置 + 多目标评分"这一条操作链。

- 在线试玩：https://littlegrass1127.github.io/game-design-portfolio/play.html?game=chunfeng
- 仓库内入口：[../../play.html?game=chunfeng](../../play.html?game=chunfeng)
- 原单文件版本：[../../prototypes/chunfeng.html](../../prototypes/chunfeng.html)
- 设计文档：[docs/design.md](docs/design.md)

## 运行

无构建工具。直接用浏览器打开 `src/index.html` 即可（支持 file://）。

## 目录结构

```
projects/chunfeng/
  README.md
  config/                    策划配置表（改这里）
    flowers.csv              花材
    attribute-levels.csv     株高 / 香型等级的显示名
    wishes.csv               友邻愿望（统计量 + 门槛）
    scoring.json             花坛尺寸、评分系数、权重、提交通过线
    texts.json               文案
  src/
    index.html               页面骨架（花材卡、愿望、落点由配置生成）
    style.css                样式（与原单文件一致）
    js/config.generated.js   由 tools/export-config.cjs 生成，不手改
    js/rules.js              纯规则：统计、评分、愿望、提交判定（window.ChunfengRules）
    js/ui.js                 toast / 反馈条 / 进度条 / 评分环
    js/main.js               入口：渲染与事件绑定
  tools/export-config.cjs    配置表 -> config.generated.js
  tests/config.test.cjs      配置完整性 + 评分规则测试
  tests/helpers/load.cjs     vm 沙箱加载浏览器脚本
  docs/design.md             逆推策划文档
```

## 配置表

| 文件 | 内容 |
| --- | --- |
| `config/flowers.csv` | 4 种花材：id、名称、颜色、株高等级、香型等级 |
| `config/attribute-levels.csv` | 株高 1–3 → 低/中/高株，香型 1–3 → 淡/清/浓香 |
| `config/wishes.csv` | 3 条愿望：NPC、文案、引用的统计量 `stat`、门槛 `min` |
| `config/scoring.json` | 落点数 16、最少种植 12、色彩/层次系数、总分权重、通过线 72 |
| `config/texts.json` | 风向提示、提交反馈、进度标签 |

修改配置后重新导出：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验是否已同步
```

## 测试

```bash
node tests/config.test.cjs
```

检查花材 / 愿望 ID 唯一、字段齐全、等级与统计量引用存在、愿望可达成、满分恰为 100，并对评分函数和提交判定做定值断言。
