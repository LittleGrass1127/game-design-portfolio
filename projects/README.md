# 工程文件

7 个可玩作品的工程版本。线上与离线包使用的是 `demos/`、`prototypes/` 下的单文件 HTML；这里把它们整理成可维护的工程：代码按模块拆分，数值和内容抽成配置表，规则用 Node 测试复核。

本目录属于作品集“01 可玩作品”的工程部分；其余三类见首页：[系统与数值设计](../design/) · [拆解与策划案](../teardowns/) · [工作方法](../methods/efficiency-system.md)。返回 [README](../README.md)。

| 工程 | 是什么 | 玩多久 · 怎么操作 | 配置表 | 测试（本仓库实际运行） | 在线试玩 |
|---|---|---|---|---|---|
| [d20 · 二十面野心·孙哥纪事](d20/README.md) | 完整 Demo：检定、远征、营地、赛车共用一套资源 | 12–18 分钟 · 键盘为主 | 23 | 3 组，2,877 条断言 | [试玩](../play.html?game=d20) |
| [kaoyan · 中国式考研：最后十二周](kaoyan/README.md) | 完整 Demo：12 周时间与风险管理 | 10–15 分钟 · 鼠标 / 触屏 | 8 | 3 组，23,871 条断言 | [试玩](../play.html?game=kaoyan) |
| [tuanzi · 团子清洁队](tuanzi/README.md) | 完整 Demo：只用移动的收集、合成、交付短局 | 2 分钟 · 键盘 / 鼠标 / 触屏 | 6 | 388 条断言 | [试玩](../play.html?game=tuanzi) |
| [yedeng · 夜灯街深夜剪辑室](yedeng/README.md) | 交互原型：选素材、排顺序、试映 | 1–2 分钟 · 点击 | 4 | 102 条断言 | [试玩](../play.html?game=yedeng) |
| [chunfeng · 春风编花会](chunfeng/README.md) | 交互原型：环形布置与多目标评分 | 1–2 分钟 · 点击 | 5 | 84 条断言 | [试玩](../play.html?game=chunfeng) |
| [jiuying · 旧影回声](jiuying/README.md) | 交互原型：调曝光、分清事实与推断 | 约 1 分钟 · 点击 / 拖动 | 5 | 178 条断言 | [试玩](../play.html?game=jiuying) |
| [jingling · 精灵巡游季](jingling/README.md) | 交互原型：读环境选共鸣、顺序挑战 | 约 2 分钟 · 点击 | 5 | 124 条断言 | [试玩](../play.html?game=jingling) |

第一次看建议先玩团子清洁队：2 分钟一局，上手最快。

每个工程的 README 结构相同：一句话是什么、设计问题、核心循环、怎么玩、规则与数值在哪张配置表、怎么验证、在线试玩。

断言数大头来自穷举和固定种子批量模拟的逐步比对（例如考研的 3,993 种开局排法、孙哥的 1,600 局固定策略），不等于独立规则点数量。

## 统一结构

```
projects/<slug>/
  README.md            是什么、设计问题、核心循环、怎么玩、配置表、验证、试玩
  src/index.html       直接用浏览器打开即可运行（无需构建）
  src/style.css
  src/js/              config.generated.js（由配置表导出）+ rules.js（纯规则）+ UI / 入口
  config/              策划配置表（CSV / JSON）
  tools/export-config.cjs   配置表 -> src/js/config.generated.js
  tests/*.test.cjs     node 直接运行
  docs/design.md       策划文档：核心循环、规则、公式、配置表说明、验证方法
```

## 常用命令

```bash
cd projects/<slug>
node tools/export-config.cjs           # 改完 config/ 后重新导出
node tools/export-config.cjs --check   # 校验导出文件与配置表一致
for t in tests/*.test.cjs; do node "$t"; done
```

需要 Node.js 18+，无第三方依赖（孙哥纪事的渲染使用 `src/vendor/` 下随附的 Phaser 3，MIT 许可）。
