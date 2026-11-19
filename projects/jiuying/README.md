# 旧影回声 · 交互原型工程

调整曝光修复底片，把线索区分为“事实”和“推断”，核对通过后归档照片——一个只验证“观察 → 分类 → 核对”这条主操作链的单屏交互原型。

- 在线试玩：https://littlegrass1127.github.io/game-design-portfolio/play.html?game=jiuying
- 仓库内试玩：[../../play.html?game=jiuying](../../play.html?game=jiuying)
- 原单文件版本：[../../prototypes/jiuying.html](../../prototypes/jiuying.html)
- 逆推策划文档：[docs/design.md](docs/design.md)

## 怎么运行

无构建、无依赖，直接用浏览器打开 `src/index.html` 即可（支持 `file://`）。

## 目录结构

```
jiuying/
  config/                    策划配置表（改这里）
    evidence.csv             线索卡片
    evidence-types.csv       分类槽位（事实 / 推断）
    exposure.json            曝光滑条与可识别区间
    progress.json            各阶段进度值
    text.csv                 反馈文案表
  src/
    index.html               页面骨架（线索卡片由配置生成）
    style.css                样式（原单文件内嵌 CSS 原样拆出）
    js/config.generated.js   由 tools/export-config.cjs 生成，不手改
    js/rules.js              纯规则：曝光区间、核对判定、进度阶段（无 DOM）
    js/ui/main.js            界面渲染与事件绑定
  tools/export-config.cjs    配置导出脚本
  tests/config.test.cjs      配置完整性 + 判定函数测试
  tests/helpers/load.cjs     vm 沙箱加载浏览器脚本
  docs/design.md             逆推策划文档
```

## 配置表

| 文件 | 用途 |
| --- | --- |
| `config/evidence.csv` | 4 条线索：卡片标题/说明、放入槽位后的显示名、正确分类 `type` |
| `config/evidence-types.csv` | 2 个分类槽：槽位与按钮 DOM id、空槽占位文案 |
| `config/exposure.json` | 滑条范围、初始值、可识别区间 `[readableMin, readableMax]`、灯箱亮度系数 |
| `config/progress.json` | 初始 / 可识别 / 已分类 / 已核对 / 已归档 五个阶段的进度值 |
| `config/text.csv` | 所有反馈与提示文案，支持 `{step}` 占位 |

修改配置后执行：

```bash
node tools/export-config.cjs          # 重新生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验生成文件与配置表一致
```

## 测试

```bash
node tests/config.test.cjs
```

覆盖：导出一致性、ID 唯一、字段齐全、类型引用存在、曝光区间与进度阶段的范围/单调性、核对规则穷举、进度阶段判定。
