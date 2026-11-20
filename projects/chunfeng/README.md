# 春风编花会

交互原型：选花材种进十六个环形落点，让三位友邻的愿望全中并达到通过线，再提交花环。

## 设计问题

色彩、株高层次和三位友邻的愿望分别指向不同花材，玩家能不能靠实时评价自己找到兼顾的方案？单种花材种满拿不到好评价；愿望全中但缺一种株高，也过不了通过线。

## 核心循环

```
选花材 → 点落点种下 / 再点拔除 → 看实时评价与愿望命中 → 种满 12 株后提交
      → 未通过：反馈指出缺哪条愿望，或分数差在哪一项 → 调整 → 再提交
      → 通过：花环锁定 → 重新布置
```

## 怎么玩

- 操作：鼠标或触屏点击。先点左侧花材，再点环上的落点；再点一次拔除。
- 目标：种满 12 株，三个愿望全中，且综合评分 ≥ 88。一轮 1–2 分钟。
- 提示：右侧愿望满足后会变色；要过通过线，低、中、高三种株高都得出现。
- 提交前随便拔除重摆，不损耗花材；通过后点「重新布置」再来一环。

## 规则与数值在哪张配置表

| 配置表 | 内容 |
| --- | --- |
| `config/flowers.csv` | 4 种花材：颜色、株高（1–3）、香型（1–3） |
| `config/attribute-levels.csv` | 株高 / 香型等级的显示名 |
| `config/wishes.csv` | 3 条友邻愿望：引用的统计量与门槛 |
| `config/scoring.json` | 落点数、最少种植数、色彩 / 层次系数、总分权重、通过条件（愿望全中 + 通过线 88） |
| `config/texts.json` | 首屏目标、三种提交反馈（通过 / 缺愿望 / 分数不够）、提示文案 |

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

实际运行结果：84 条断言全部通过。覆盖配置完整性、导出一致性、评分与提交判定的定值，以及对 12–16 株全部 3,480 种数量组合的穷举（愿望全中 2,160 种，其中 335 种被通过线挡下，可通过 1,825 种）。

另用 headless Chromium 在单文件版和拆分版上执行同一套 31 步点击，逐步比对界面状态一致，控制台无报错。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=chunfeng>
- 仓库内入口：[../../play.html?game=chunfeng](../../play.html?game=chunfeng)
- 单文件版（线上与离线包用的就是它）：[../../prototypes/chunfeng.html](../../prototypes/chunfeng.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)
