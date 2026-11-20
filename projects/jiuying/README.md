# 旧影回声

交互原型：把底片调到可识别的曝光，再分清哪条线索是事实、哪条是推断，核对通过后收录照片。

## 设计问题

在“修复照片”的调查玩法里，能不能让玩家自己分清“可直接核验的事实”和“需要关系判断的推断”，并且出错时知道错在哪一步？

## 核心循环

```
调曝光到可识别区间（出现日期与编号）→ 选线索 → 归为事实 / 归为推断
      → 核对：未通过时提示是曝光不对，还是有线索放错了栏 → 调整 → 再核对
      → 收录照片 → 重新开始
```

## 怎么玩

- 操作：鼠标或触屏。拖动曝光滑条；点右侧线索选中，再点「归为事实」或「归为推断」。
- 目标：事实、推断各放对一条，核对通过后收录照片。一轮约 1 分钟。
- 提示：能直接查到记录的是事实，需要靠关系去猜的是推断；四条线索里有一条干扰项。
- 每一步都能无成本回退；收录后点「重新开始」。

## 规则与数值在哪张配置表

| 配置表 | 内容 |
| --- | --- |
| `config/evidence.csv` | 4 条线索：标题、细节、正确分类（fact / inference） |
| `config/evidence-types.csv` | 两个分类槽与归类按钮的绑定、空槽占位文案 |
| `config/exposure.json` | 曝光滑条范围（10–100）、初始值（30）、可识别区间（52–76）、灯箱亮度系数 |
| `config/progress.json` | 进度条五个阶段的数值 |
| `config/text.csv` | 首屏目标、曝光三段反馈、两种核对失败原因、收录文案 |

规则细节见 [docs/design.md](docs/design.md) 第 3–4 节。

改了 `config/` 之后重新导出，再跑测试：

```bash
node tools/export-config.cjs          # 生成 src/js/config.generated.js
node tools/export-config.cjs --check  # 校验导出文件与配置表一致
```

## 怎么验证

```bash
node tests/config.test.cjs
```

实际运行结果：178 条断言全部通过。覆盖配置完整性、导出一致性、曝光分区边界、核对规则在 3 个曝光值 × 16 种归类组合上的穷举、失败原因判定、同一线索不能占两栏。

另用 headless Chromium 在单文件版和拆分版上执行同一组 24 步操作，逐步比对界面状态一致，控制台无报错。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=jiuying>
- 仓库内入口：[../../play.html?game=jiuying](../../play.html?game=jiuying)
- 单文件版（线上与离线包用的就是它）：[../../prototypes/jiuying.html](../../prototypes/jiuying.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)
