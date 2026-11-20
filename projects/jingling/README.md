# 精灵巡游季

交互原型：读传闻里的环境线索，选对共鸣方式与精灵结伴，再按顺序完成三步协作，把三只精灵都收进图鉴。

## 设计问题

把“收服 / 结伴”从数值门槛改成“读环境 → 选对方式”的判断题之后，玩家能不能从传闻文本里自己推出答案？选错时的反馈够不够解释原因，并允许马上重试？

## 核心循环

```
选传闻 → 读场景描述 → 选共鸣方式 → 尝试结伴
      ├ 错：给出这条传闻的专属提示，换选项重试
      └ 对：精灵现身 → 按“观察 → 稳定 → 同步”完成三步协作 → 收录图鉴（n/3）
      → 换一条传闻 → 三只集齐
```

## 怎么玩

- 操作：鼠标或触屏点击。左侧选传闻，右侧选共鸣方式，中间点「尝试结伴」；结伴后按顺序点三个协作按钮。
- 目标：收录三只精灵。全部完成约 2 分钟。
- 提示：每条传闻的副标题里藏着关键环境词；协作按钮的排列顺序不是正确顺序，按错会清空重来。
- 切换传闻不会丢掉已收录的精灵。

## 规则与数值在哪张配置表

| 配置表 | 内容 |
| --- | --- |
| `config/rumors.csv` | 3 条传闻：标题、环境提示、场景描述、正确共鸣、精灵名、失败提示 |
| `config/resonances.csv` | 3 种共鸣方式（与传闻一一对应） |
| `config/challenge-actions.csv` | 协作挑战的 3 个动作：按钮排列顺序与正确顺序 |
| `config/flow.json` | 默认传闻、圆环与进度条各阶段数值 |
| `config/text.csv` | 首屏目标、结伴 / 挑战 / 收录反馈、进度标签 |

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

实际运行结果：124 条断言全部通过。覆盖配置完整性、导出一致性、3 × 3 结伴组合穷举（只有一一对应的组合成功）、挑战顺序判定、图鉴进度。

另用 headless Chromium 在单文件版和拆分版上执行同一组 24 步操作（含三只精灵全部收录），逐步比对界面状态一致，控制台无报错。

## 在线试玩

- 在线：<https://littlegrass1127.github.io/game-design-portfolio/play.html?game=jingling>
- 仓库内入口：[../../play.html?game=jingling](../../play.html?game=jingling)
- 单文件版（线上与离线包用的就是它）：[../../prototypes/jingling.html](../../prototypes/jingling.html)
- 拆分版：直接用浏览器打开 [src/index.html](src/index.html)，无需构建，支持 `file://`
- 策划文档：[docs/design.md](docs/design.md)
