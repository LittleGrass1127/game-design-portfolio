"""Check local HTML/Markdown links without requiring third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.values.append(value)

def valid_target(source: Path, value: str) -> bool:
    if value.startswith(("#", "data:", "mailto:", "javascript:")):
        return True
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return True
    target = (source.parent / unquote(parsed.path)).resolve()
    try:
        target.relative_to(ROOT)
    except ValueError:
        return False
    return target.exists()

def main() -> None:
    failures = []
    checked = 0
    sources = [ROOT / "index.html", ROOT / "play.html", ROOT / "README.md"]
    sources += sorted((ROOT / "demos").glob("*.html"))
    sources += sorted((ROOT / "prototypes").glob("*.html"))
    sources += sorted((ROOT / "docs").glob("*.md"))
    for source in sources:
        text = source.read_text(encoding="utf-8-sig")
        if source.suffix == ".html":
            parser = Links(); parser.feed(text); values = parser.values
        else:
            values = re.findall(r"(?<!!)\[[^]]*\]\(([^)]+)\)", text)
        for value in values:
            checked += 1
            if not valid_target(source, value):
                failures.append(f"{source.relative_to(ROOT)} -> {value}")
    if failures:
        print("\n".join(failures)); sys.exit(1)
    print(f"Checked {checked} local links in {len(sources)} files: all targets exist")

if __name__ == "__main__":
    main()
