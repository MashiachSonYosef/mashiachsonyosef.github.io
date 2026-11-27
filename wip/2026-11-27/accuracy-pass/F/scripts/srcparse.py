import re, html
FN=re.compile(r'<sup[^>]*class="footnote-marker"[^>]*>.*?</sup>\s*<i[^>]*class="footnote"[^>]*>(.*?)</i>', re.S)
WS='   \n\t'
def chars(v, keep_bar=True):
    """the verse as a list of (char, attrs) with whitespace and footnotes removed; attrs = tuple of enclosing tag/class names"""
    s=FN.sub('',v); out=[]; stack=[]; pos=0
    for m in re.finditer(r'<[^>]+>|&nbsp;|&thinsp;|&amp;|&lt;|&gt;|&quot;',s):
        for ch in s[pos:m.start()]: out.append((ch,tuple(stack)))
        pos=m.end(); t=m.group(0)
        if t in('&nbsp;','&thinsp;'): out.append((' ',tuple(stack)))
        elif t[0]=='&': out.append((html.unescape(t),tuple(stack)))
        elif t.startswith('</'):
            if stack: stack.pop()
        elif re.match(r'<br',t): out.append((' ',tuple(stack)))
        else:
            mm=re.match(r'<(\w+)(?:\s+class="([^"]*)")?',t); stack.append(mm.group(2) or mm.group(1))
    for ch in s[pos:]: out.append((ch,tuple(stack)))
    return [(c,a) for c,a in out if c not in WS and (keep_bar or c!='׀')]
