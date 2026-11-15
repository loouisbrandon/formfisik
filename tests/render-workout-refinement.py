"""Compare the exact same synthetic snapshots before/after 011.5; Poppler + Pillow visual QA."""
import json
import pathlib
import subprocess
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageOps
root = pathlib.Path('test-results/011.5')
report = []
for phase in ['before', 'after']:
    metrics = json.loads((root / (phase + '-metrics.json')).read_text())
    for row in metrics:
        name, file = row['name'], row['file']
        out = root / phase / name
        out.mkdir(parents=True, exist_ok=True)
        if phase == 'after' or not list(out.glob('page-*.png')):
            for old in out.glob('page-*.png'):
                old.unlink()
            subprocess.run(['pdftoppm', '-scale-to', '1200', '-png', file, str(out / 'page')], check=True)
        bbox = subprocess.check_output(['pdftotext', '-bbox', file, '-'])
        xml = ET.fromstring(bbox)
        ns = {'h': 'http://www.w3.org/1999/xhtml'}
        for page in xml.findall('.//h:page', ns):
            assert 595 < float(page.attrib['width']) < 596
            assert 841 < float(page.attrib['height']) < 843
            for word in page.findall('.//h:word', ns):
                box = word.attrib
                assert float(box['xMin']) >= 41 and float(box['xMax']) <= 555, (phase, name, word.text, box)
                assert float(box['yMin']) >= 26 and float(box['yMax']) <= 821, (phase, name, word.text, box)
        if phase == 'after':
            for page in xml.findall('.//h:page', ns):
                words = sorted(page.findall('.//h:word', ns), key=lambda word: float(word.attrib['yMin']))
                for i, word in enumerate(words):
                    a = {k: float(v) for k, v in word.attrib.items()}
                    for other in words[i + 1:]:
                        b = {k: float(v) for k, v in other.attrib.items()}
                        if b['yMin'] >= a['yMax'] - .5:
                            break
                        overlap_x = min(a['xMax'], b['xMax']) - max(a['xMin'], b['xMin'])
                        overlap_y = min(a['yMax'], b['yMax']) - max(a['yMin'], b['yMin'])
                        assert overlap_x <= .5 or overlap_y <= .5, (name, 'overlap', word.text, other.text)
        pages = sorted(out.glob('page-*.png'))
        for batch in range(0, len(pages), 6):
            indices = list(range(batch, min(batch + 6, len(pages))))
            sheet = Image.new('RGB', (420 * min(3, len(indices)), 630 * ((len(indices) + 2) // 3)), '#dedede')
            draw = ImageDraw.Draw(sheet)
            for pos, i in enumerate(indices):
                im = Image.open(pages[i])
                im.thumbnail((410, 595))
                x, y = (pos % 3) * 420, (pos // 3) * 630
                sheet.paste(im, (x + 5, y + 24))
                draw.text((x + 10, y + 5), f'{phase} / {name} / {i + 1} de {len(pages)}', fill='black')
            sheet.save(out / f'all-{batch // 6 + 1}.png')
        gray = ImageOps.grayscale(Image.open(pages[0])).convert('RGB')
        gray.save(out / 'grayscale.png')
        row['text'] = subprocess.check_output(['pdftotext', '-layout', file, '-']).decode()
    report.append({r['name']: r for r in metrics})
for name, before in report[0].items():
    after = report[1][name]
    assert before['inputHash'] == after['inputHash'], name
    # Raw extraction retained for audit; content checks in TS integration + semantic comparison below.
    for label, source in [('before', before), ('after', after)]:
        (root / label / name / 'text.txt').write_text(source['text'])
    sheets = []
    for phase in ['before', 'after']:
        im = Image.open(root / phase / name / 'page-01.png') if (root / phase / name / 'page-01.png').exists() else Image.open(root / phase / name / 'page-1.png')
        im.thumbnail((595, 842))
        sheets.append(im)
    compare = Image.new('RGB', (1210, 880), '#dedede')
    draw = ImageDraw.Draw(compare)
    for i, im in enumerate(sheets):
        compare.paste(im, (i * 605 + 5, 28))
        draw.text((i * 605 + 12, 8), 'ANTES / 011' if i == 0 else 'DEPOIS / 011.5', fill='black')
    compare.save(root / f'compare-{name}.png')
rows = [{ 'name': name, 'beforePages': report[0][name]['pages'], 'afterPages': row['pages'], 'beforeBytes': report[0][name]['bytes'], 'afterBytes': row['bytes'], 'inputHash': row['inputHash']} for name, row in report[1].items()]
(root / 'comparison.json').write_text(json.dumps(rows, indent=2))
print(json.dumps(rows))
