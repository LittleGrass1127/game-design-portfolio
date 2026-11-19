# 工程文件

7 个可玩作品的工程版本。线上与离线包使用的是 `demos/`、`prototypes/` 下的单文件 HTML；这里把它们逆向整理成可维护的工程：代码按模块拆分，数值和内容抽成配置表，规则用 Node 测试复核。

| 工程 | 类型 | 配置表 | 测试（本仓库实际运行） | 在线试玩 |
|---|---|---|---|---|
| [d20 · 二十面野心·孙哥纪事](d20/README.md) | 完整 Demo | 23 | 3 组，2,752 条断言 | [试玩](../play.html?game=d20) |
| [kaoyan · 中国式考研：最后十二周](kaoyan/README.md) | 完整 Demo | 8 | 3 组，23,871 条断言 | [试玩](../play.html?game=kaoyan) |
| [tuanzi · 团子清洁队](tuanzi/README.md) | 完整 Demo | 6 | 378 条断言 | [试玩](../play.html?game=tuanzi) |
| [liufen · 六分街深夜剪辑室](liufen/README.md) | 交互原型 | 4 | 86 条断言 | [试玩](../play.html?game=liufen) |
| [chunfeng · 春风编花会](chunfeng/README.md) | 交互原型 | 5 | 64 条断言 | [试玩](../play.html?game=chunfeng) |
| [jiuying · 旧影回声](jiuying/README.md) | 交互原型 | 5 | 118 条断言 | [试玩](../play.html?game=jiuying) |
| [jingling · 精灵巡游季](jingling/README.md) | 交互原型 | 5 | 115 条断言 | [试玩](../play.html?game=jingling) |

断言数大头来自穷举和固定种子批量模拟的逐步比对（例如考研的 3,993 种开局排法、孙哥的 1,600 局固定策略），不等于独立规则点数量。

## 统一结构

```
projects/<slug>/
  README.md            运行方式、目录、配置表说明
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
