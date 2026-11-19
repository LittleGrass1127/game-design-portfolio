# 精灵巡游季 · 交互原型工程

读传闻、判断环境，选择匹配的共鸣方式与精灵结伴，再按正确顺序完成三步协作挑战——一个只验证“传闻判断 → 共鸣选择 → 序列挑战”这条主操作链的单屏交互原型。

- 在线试玩：https://littlegrass1127.github.io/game-design-portfolio/play.html?game=jingling
- 仓库内试玩：[../../play.html?game=jingling](../../play.html?game=jingling)
- 原单文件版本：[../../prototypes/jingling.html](../../prototypes/jingling.html)
- 逆推策划文档：[docs/design.md](docs/design.md)

## 怎么运行

无构建、无依赖，直接用浏览器打开 `src/index.html` 即可（支持 `file://`）。

## 目录结构

```
jingling/
  config/                    策划配置表（改这里）
    rumors.csv               城市传闻 / 场景 / 对应精灵 / 失败提示
    resonances.csv           共鸣方式
    challenge-actions.csv    协作挑战动作（展示顺序 + 正确步骤）
    flow.json                默认传闻、共鸣进度与顶部进度数值
    text.csv                 反馈文案表
  src/
    index.html               页面骨架（选项按钮由配置生成）
    style.css                样式（原单文件内嵌 CSS 原样拆出）
    js/config.generated.js   由 tools/export-config.cjs 生成，不手改
    js/rules.js              纯规则：结伴判定、挑战序列、进度计算（无 DOM）
    js/ui/main.js            界面渲染与事件绑定
  tools/export-config.cjs    配置导出脚本
  tests/config.test.cjs      配置完整性 + 判定函数测试
  tests/helpers/load.cjs     vm 沙箱加载浏览器脚本
  docs/design.md             逆推策划文档
```

## 配置表

| 文件 | 用途 |
| --- | --- |
| `config/rumors.csv` | 3 条传闻：按钮文案、场景名与描述、正确共鸣 `correctResonance`、精灵名、失败提示 |
| `config/resonances.csv` | 3 种共鸣方式 |
| `config/challenge-actions.csv` | 3 个挑战动作：`displayOrder` 按钮排列顺序，`step` 正确执行顺序 |
| `config/flow.json` | 默认传闻；共鸣进度圆环与顶部进度条各阶段数值 |
| `config/text.csv` | 所有反馈与提示文案，支持 `{spirit}` `{hint}` `{step}` `{total}` 占位 |

修改配置后执行：

```bash
node tools/export-config.cjs          # 重新生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验生成文件与配置表一致
```

## 测试

```bash
node tests/config.test.cjs
```

覆盖：导出一致性、ID 唯一、字段齐全、传闻→共鸣引用存在且一一对应、挑战步骤连续、数值范围与单调性、结伴判定穷举、挑战序列判定。
