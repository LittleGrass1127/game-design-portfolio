# 夜灯街深夜剪辑室（交互原型工程）

从七段受损录像里选五段、排好顺序再试映：主题契合、节奏连贯和信号稳定度共同决定反馈。只验证"选择 + 排序 + 试映反馈"这一条操作链。

- 在线试玩：https://littlegrass1127.github.io/game-design-portfolio/play.html?game=yedeng
- 仓库内入口：[../../play.html?game=yedeng](../../play.html?game=yedeng)
- 单文件版本：[../../prototypes/yedeng.html](../../prototypes/yedeng.html)
- 设计文档：[docs/design.md](docs/design.md)

## 运行

无构建工具。直接用浏览器打开 `src/index.html` 即可（支持 file://）。

## 目录结构

```
projects/yedeng/
  README.md
  config/                  策划配置表（改这里）
    clips.csv              素材片段
    commission.json        今晚委托与试映判定条件
    scoring.json           评分公式系数、权重、进度条
    texts.json             反馈 / 提示文案
  src/
    index.html             页面骨架（委托、素材卡、时间轴格由配置生成）
    style.css              样式（与原单文件一致）
    js/config.generated.js 由 tools/export-config.cjs 生成，不手改
    js/rules.js            纯规则：评分、试映判定、时间轴操作（window.LiufenRules）
    js/ui.js               toast / 反馈条 / 进度条 / 评分环
    js/main.js             入口：渲染与事件绑定
  tools/export-config.cjs  配置表 -> config.generated.js
  tests/config.test.cjs    配置完整性 + 评分规则测试
  tests/helpers/load.cjs   vm 沙箱加载浏览器脚本
  docs/design.md           逆推策划文档
```

## 配置表

| 文件 | 内容 |
| --- | --- |
| `config/clips.csv` | 7 段素材：id、名称、标签、情绪强度 mood（1–5）、稳定度 stable（0–100） |
| `config/commission.json` | 委托文案与目标、时间轴格数、必须的结尾素材、试映节奏阈值 |
| `config/scoring.json` | 主题 / 节奏 / 稳定三项公式系数与总分权重、进度条数值 |
| `config/texts.json` | 三种试映反馈、放映结果、提示文案（`{变量}` 占位） |

修改配置后重新导出：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验是否已同步
```

## 测试

```bash
node tests/config.test.cjs
```

检查素材 ID 唯一、字段齐全、数值范围、委托引用的结尾素材存在、权重和为 1，并对评分函数和试映判定做定值断言。
