#!/usr/bin/env python3
"""Build the static site with a self-contained Nordic application shell.
Run after editing source JSON/JS/CSS: python3 scripts/build-nordic-site.py --output-dir _site
Publishing runs this automatically so inline data never becomes a separate source of truth.
"""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ('data', 'points', 'stays', 'experiences', 'attractions', 'dining', 'hikes', 'flight-monitor')

def build(output):
    output = output.resolve()
    if output == ROOT or ROOT.is_relative_to(output):
        raise ValueError('Output must be a separate build directory')
    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(ROOT, output, ignore=shutil.ignore_patterns('.git', '.github', '__pycache__', '_site', 'node_modules'))
    payload = {name: json.loads((ROOT / 'nordic-v2' / (name + '.json')).read_text()) for name in FILES}
    packed = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c')
    app = (ROOT / 'nordic-v2/app.js').read_text()
    digest = hashlib.sha256((packed + app).encode()).hexdigest()[:12]
    html = (ROOT / 'nordic/index.html').read_text()
    html = html.replace('<html lang="zh-CN">', f'<html lang="zh-CN" data-itinerary-build="{digest}">')
    # All itinerary text and prices arrive with the document, with no route-time fetch.
    html = re.sub(r'<link rel="preload" as="fetch"[^>]+>', '', html)
    html, count = re.subn(r'<script src="\.\./nordic-v2/app\.js[^\"]*" defer></script>', '', html)
    assert count == 1, 'App script tag changed; update builder'
    for href, source in [('leaflet.css', ROOT / 'nordic/leaflet.css'),
                         ('../nordic-v2/style.css', ROOT / 'nordic-v2/style.css'),
                         ('layout.css', ROOT / 'nordic/layout.css')]:
        pattern = r'<link rel="stylesheet" href="' + re.escape(href) + r'(?:\?[^\"]*)?">'
        css = source.read_text()
        html, count = re.subn(pattern, lambda _: '<style>' + css + '</style>', html)
        assert count == 1, source
    html, count = re.subn(r'<script src="packing\.js[^\"]*" defer></script>', '', html)
    assert count == 1, 'Packing script tag changed; update builder'
    packing = (ROOT / 'nordic/packing.js').read_text().replace('</script', r'<\/script')
    app = app.replace('</script', r'<\/script')
    html = html.replace('</body>', '<script id="itinerary-bootstrap" type="application/json">' + packed + '</script><script>' + packing + '</script><script>' + app + '</script></body>')
    (output / 'nordic/index.html').write_text(html)
    (output / '.nojekyll').touch()
    print(f'Built Nordic shell: {len(html.encode()):,} bytes, build {digest}')
    for name in FILES:
        print(f'  {name}: source matched')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, default=ROOT / '_site')
    build(parser.parse_args().output_dir)
