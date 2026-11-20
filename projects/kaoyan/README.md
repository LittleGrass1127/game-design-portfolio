# 中国式考研：最后十二周

十二周、四科、每周三个时段：在学习、精力、压力和生活费之间排出一份“刚刚好”的计划，最后用总分和单科线检验取舍。

## 设计问题

备考题材最常见的做法是“点学习就涨分”，玩家很快发现最优解就是一直学。这里想回答的是：玩家怎样看懂自己的取舍？做法是让学习收益受精力和压力影响，并且预览按真实规则先执行一遍，确认前就能看到确切结果。

## 核心循环

```
看成绩与状态 → 按顺序排三个时段 → 预览真实收益 → 确认执行
   → （偶数周）二选一生活事件 → 周报与目标差距 → 下一周
十二周后：四科成绩与总分 → 是否录取 → 复盘 → 再来一局
```

## 怎么玩

- 操作：鼠标或触屏点击。点行动卡排进本周计划（可上下调序、移除），看右侧预览，再点确认。
- 目标：十二周后总分达到目标线，且四科都过单科线。单局 10–15 分钟。
- 提示：精力低于 60 或压力高于 35 时学习效率下降，休息是给后面的学习“充效率”；冲刺涨分快但花钱、更累。
- 首屏可以“直接开始”，也可以先换起点和目标；进度自动保存，可导出 / 导入存档。

## 规则与数值在哪张配置表

| 配置表 | 内容 |
| --- | --- |
| `config/exam-config.json` | 周数 12、时段 3、初始精力 75 / 压力 20 / 预算 950、每周生活费 60 与周末恢复、学习效率公式系数 |
| `config/subjects.csv` | 4 科名称与满分（政治 / 英语 100，数学 / 专业 150） |
| `config/backgrounds.csv` | 3 种起点的四科初始分 |
| `config/goals.csv` | 3 个目标院校的总分线（320 / 365 / 400）与单科线 |
| `config/actions.csv` | 11 种行动：分类、科目、基础收益、精力 / 压力变化、花费、收入 |
| `config/events.csv` | 8 个生活事件 |
| `config/event-options.csv` | 16 个事件选项的效果 |
| `config/ui-text.json` | 阶段标题、书桌提示及触发阈值、压力警示线 |

公式见 [docs/design.md](docs/design.md) 第 4 节。

改了 `config/` 之后重新导出，再跑测试：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件与配置表一致
```

## 怎么验证

```bash
node tests/config.test.cjs   # 配置完整性、导出一致性
node tests/rules.test.cjs    # 效率公式、预览即结算、确定性、预算、结局、存档校验
node tests/parity.test.cjs   # 与单文件版规则逐局对拍
```

实际运行结果：139 + 19,078 + 4,654 = 23,871 条断言全部通过。其中“预览即结算”穷举了 3 种起点 × 11³ = 3,993 种开局排法；对拍 90 局随机整局逐步一致。断言数大头来自穷举和逐步比对，不等于独立规则点数量。

另用 headless Chromium 以同一串操作驱动单文件版与拆分版走完十二周，109 个界面快照的 DOM 完全一致，无脚本错误。

规则核心最初用 C# 写成（241 条规则断言、288 个事件场景通过，Unity 导出包运行验收未完成），本目录是它的 JS 移植，C# / Unity 工程不在本仓库。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=kaoyan>
- 仓库内入口：[../../play.html?game=kaoyan](../../play.html?game=kaoyan)
- 单文件版（线上与离线包用的就是它）：[../../demos/kaoyan.html](../../demos/kaoyan.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)

## 目录

```
config/                 策划配置表
src/index.html          页面骨架 + 书桌插画模板
src/js/rules.js         规则核心：效率、预览 / 结算、事件、周推进、结局、存档校验
src/js/ui.js            界面模板               src/js/main.js   运行状态、存档、事件绑定
tools/export-config.cjs 配置导出
tests/                  3 组测试
```
