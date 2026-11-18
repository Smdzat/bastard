"""Import only public legal content, never the existing site's layout or scripts."""
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'br', 'hr', 'img', 'meta', 'link', 'input', 'wbr'}:
            self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break
    def handle_data(self, value):
        self.stack[-1].children.append(value)

def text(node):
    if isinstance(node, str): return node
    if node.attrs.get('class') == 'icon': return ''
    return ''.join(text(child) for child in node.children)

def walk(node):
    if isinstance(node, str): return
    yield node
    for child in node.children: yield from walk(child)

def render(node):
    if isinstance(node, str): return html.escape(node)
    if node.tag in {'script', 'style'} or node.attrs.get('class') == 'icon': return ''
    content = ''.join(render(c) for c in node.children)
    allowed = {'div', 'p', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'strong', 'b', 'em', 'br', 'a'}
    if node.tag not in allowed: return content
    attrs = ''
    if node.tag == 'a':
        href = node.attrs.get('href', '')
        if href.startswith(('https://', 'mailto:', '#')):
            attrs = ' href="' + html.escape(href, quote=True) + '"'
    if node.tag == 'br': return '<br />'
    return '<' + node.tag + attrs + '>' + content + '</' + node.tag + '>'

result = {}
for slug, title in [('datenschutz', 'Datenschutz'), ('impressum', 'Impressum'), ('nutzungsbedingungen', 'Nutzungsbedingungen')]:
    source = 'https://erledo.at/' + slug + '.html'
    parser = Parser()
    parser.feed(urlopen(source, timeout=30).read().decode('utf-8'))
    cards = [n for n in walk(parser.root) if 'legal-card' in n.attrs.get('class', '').split()]
    sections = []
    for i, card in enumerate(cards):
        heading = next((n for n in walk(card) if n.tag == 'h2'), None)
        if not heading: continue
        heading_text = re.sub(r'^[^\wÄÖÜäöü]+', '', re.sub(r'\s+', ' ', text(heading)).strip())
        body = ''.join(render(n) for n in card.children if n is not heading)
        sections.append({'id': card.attrs.get('id', 'abschnitt-' + str(i+1)), 'title': heading_text, 'html': body.strip()})
    if not sections: raise RuntimeError('No legal sections found: ' + source)
    result[slug] = {'title': title, 'source': source, 'sourceDate': 'Juli 2026', 'sections': sections}

output = Path(__file__).resolve().parents[1] / 'src/data/legal.json'
output.parent.mkdir(exist_ok=True)
output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print('Imported legal content:', ', '.join(f'{key}: {len(value["sections"])} sections' for key,value in result.items()))
