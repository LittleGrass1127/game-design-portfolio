"""Build the self-contained offline playable portfolio using only the stdlib."""
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
GAMES = (
    "demos/d20.html", "demos/kaoyan.html", "demos/tuanzi.html",
    "prototypes/yedeng.html", "prototypes/chunfeng.html",
    "prototypes/jiuying.html", "prototypes/jingling.html",
)
README = """高原｜可玩游戏大厅（离线版）

开始游玩：
1. 完整解压本 ZIP，不要直接在压缩包预览窗口运行。
2. 双击 play.html，用 Chrome 或 Edge 打开。
3. 从左侧选择游戏。所有素材、样式和脚本均随文件提供，无需联网。

也可以直接进入 demos 或 prototypes 文件夹，双击任意游戏的 HTML。
每个游戏都是独立单文件，可单独复制到其他电脑运行。

包含：3 个完整 Demo、4 个交互原型。
建议：电脑端 Chrome / Edge；团子清洁队支持键盘和触控。
"""

def main() -> None:
    output = ROOT / "downloads" / "playable-games.zip"
    output.parent.mkdir(parents=True, exist_ok=True)
    files = [ROOT / "play.html", *(ROOT / game for game in GAMES)]
    for file in files:
        if not file.is_file():
            raise FileNotFoundError(file)
        text = file.read_text(encoding="utf-8-sig")
        if re.search(r"<script[^>]+src=['\"](?!data:)", text) or re.search(r"<(?:iframe|img|audio|video|source)[^>]+src=['\"](?!data:|#)", text):
            raise RuntimeError(f"External runtime dependency found: {file}")
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for file in files:
            archive.write(file, file.relative_to(ROOT).as_posix())
        archive.writestr("请先阅读.txt", README)
    with ZipFile(output) as archive:
        bad = archive.testzip()
        if bad:
            raise RuntimeError(f"Corrupt ZIP entry: {bad}")
        print(f"Built {output} with {len(archive.namelist())} entries ({output.stat().st_size} bytes)")

if __name__ == "__main__":
    main()

