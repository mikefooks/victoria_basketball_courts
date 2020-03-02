import sys
from os import path
from lxml import etree


with open('garry_oak_style.qml', 'r') as data:
    raw = data.read()
    root = etree.HTML(raw)
    ranges = root.cssselect('ranges')[0]
    symbols = root.cssselect('symbols')[0]

breakpoints = [ [r.attrib['lower'], r.attrib['upper']]
                for r in ranges ]

colours = []
for symbol in symbols:
    for prop in symbol.find('layer').findall('prop'):
        if prop.attrib['k'] == 'color':
            colours.append(prop.attrib['v'])

grad_styles = list(zip(breakpoints, colours))

js_func = 'function (value) {\n'
for style in grad_styles:
    js_func += '  if ({} <= value < {}) {{\n'.format(style[0][0], style[0][1])
    js_func += '    return "rgba({})";\n'.format(style[1])
    js_func += '  }\n'
js_func += '}\n'

print(js_func)
