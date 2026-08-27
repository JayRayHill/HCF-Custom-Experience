#!/usr/bin/env python3
"""Split the single-file prototype into the portable source the theme needs.

prototype/hcf-builder.html is one 300KB file because an artifact has to be:
CSS, markup, behaviour, catalogue and six base64 photographs in one document.
None of that survives contact with a Shopify theme, so this carves it into the
four layers a section actually wants, and writes a preview that reassembles
them so the split can be tested rather than trusted.

Run:  python3 tools/split.py     (rerun after any prototype change)
"""
import re, base64, json, os, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'prototype/hcf-builder.html')
OUT  = os.path.join(ROOT, 'handoff')
os.makedirs(os.path.join(OUT, 'images'), exist_ok=True)

src = open(SRC).read()

m_css = re.search(r'<style>\n(.*?)\n</style>', src, re.S)
m_js  = re.search(r'<script>\n(.*?)\n</script>', src, re.S)
assert m_css and m_js, 'the prototype no longer has one <style> and one <script>'
css, js = m_css.group(1), m_js.group(1)
markup = src[m_css.end():m_js.start()].strip('\n')
assert markup.startswith('<div class="announce">')

# --- photographs become files -------------------------------------------------
m_img = re.search(r'  var IMAGES = \{\n(.*?)\n  \};\n', js, re.S)
assert m_img
images = {}
for pid, b64 in re.findall(r'(\w+):\s*"data:image/jpeg;base64,([A-Za-z0-9+/=]+)"', m_img.group(1)):
    open(os.path.join(OUT, 'images/%s.jpg' % pid), 'wb').write(base64.b64decode(b64))
    images[pid] = 'images/%s.jpg' % pid
assert len(images) == 6, images
js = js[:m_img.start()] + '''  /* The prototype inlined six base64 photographs here because an artifact's CSP
     blocks remote hosts. On the theme they are product images: the section
     prints their CDN URLs and this reads them. Keys are product ids. */
  var IMAGES = window.HCF_QUOTE_IMAGES || {};
''' + js[m_img.end():]

# --- catalogue becomes data ---------------------------------------------------
def carve(name):
    m = re.search(r'\n  var %s = \[\n(.*?)\n  \];\n' % name, js, re.S)
    assert m, name
    return m.group(0)

prod_src, qs_src = carve('PRODUCTS'), carve('QS')
probe = tempfile.NamedTemporaryFile('w', suffix='.mjs', delete=False)
probe.write(prod_src.replace('var PRODUCTS', 'const PRODUCTS') +
            qs_src.replace('var QS', 'const QS') +
            '\nconsole.log(JSON.stringify({products:PRODUCTS,questions:QS},null,2));\n')
probe.close()
run = subprocess.run(['/opt/node22/bin/node', probe.name], capture_output=True, text=True)
assert run.returncode == 0, run.stderr
os.unlink(probe.name)
catalogue = run.stdout
open(os.path.join(OUT, 'catalogue.json'), 'w').write(catalogue)

js = js.replace(prod_src, '''
  /* Catalogue, not code. The theme prints this from the quote_family
     metaobjects in exactly this shape; handoff/catalogue.json is the same data
     as a file, and the fallback if nothing is printed.

     `per` is on the SIZE, not the family, because it changes mid-range. A size
     is [label, artWidth, artHeight, unitsPerCase]. */
  var DATA = window.HCF_QUOTE_DATA || {};
  var PRODUCTS = DATA.products || [];
''', 1).replace(qs_src, '\n  var QS = DATA.questions || [];\n', 1)
assert 'var PRODUCTS = DATA.products' in js and 'var QS = DATA.questions' in js

open(os.path.join(OUT, 'quote-builder.css'),  'w').write(css + '\n')
open(os.path.join(OUT, 'quote-builder.js'),   'w').write(js + '\n')
open(os.path.join(OUT, 'quote-builder.html'), 'w').write(markup + '\n')

# --- a preview that puts the four back together, so the split is testable -----
boot = ('<script>\n'
        '/* Stand-in for what the Liquid section prints. Two globals, nothing else. */\n'
        'window.HCF_QUOTE_DATA = ' + catalogue.strip() + ';\n'
        'window.HCF_QUOTE_IMAGES = ' + json.dumps(images, indent=2) + ';\n'
        '</script>')
preview = '\n'.join([
    '<!doctype html>', '<html lang="en">', '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>HCF Custom Quote Builder</title>',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,700;1,900&display=swap">',
    '<link rel="stylesheet" href="quote-builder.css">',
    '</head>', '<body>', '', boot, '', markup, '',
    '<script src="quote-builder.js"></script>', '</body>', '</html>', ''])
open(os.path.join(OUT, 'preview.html'), 'w').write(preview)

print('handoff/quote-builder.css   %6d' % len(css))
print('handoff/quote-builder.html  %6d' % len(markup))
print('handoff/quote-builder.js    %6d' % len(js))
print('handoff/catalogue.json      %6d' % len(catalogue))
print('handoff/images/             %d files' % len(images))
print('handoff/preview.html        %6d' % len(preview))
