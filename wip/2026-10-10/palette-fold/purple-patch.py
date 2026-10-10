import re,sys,json
G='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp'
W='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/fold-wf/purple'
def rep(s,old,new,count=1):
    n=s.count(old)
    assert n==count, (old[:80],n,count)
    return s.replace(old,new)

# ---------------- zone.html ----------------
z=open(G+'/reader/zone.html',encoding='utf-8').read()
z0=z
z=rep(z,"""    --ink: #561f86; --ink-strong: #44166c; --muted: #6c359e; --faint: #845ba7;
    --shesh: #561f86; --shesh-bright: #44166c;""",
"""    /* TWO PURPLES, A REGULAR AND A DIM (the owner, 2026-10-10: "personally i
       dont see a gain from more than 2/2/2/2 and 3 linen", and "either titles
       get bold and text gets regular, or titles get regular and text gets
       dim ... id probably go regular and dim. i dont like our bold that
       much"). The regular, --argaman, is the page's own ink: titles, values,
       anything under the hand, and anything pressed, which is worn bold. The
       dim, --argaman-dim, is running text, notes, labels, and links and
       controls at rest; it reads as body text, 6.0:1 on the linen and 5.4:1
       in a word's cell. The deep title purple, the pressed purple, the faint
       label purple and the bright and pale argaman are folded into these two.
       The old names stay, pointing at the two, so no rule had to learn a new one. */
    --ink: var(--argaman); --ink-strong: var(--argaman); --muted: var(--argaman-dim); --faint: var(--argaman-dim);
    --shesh: var(--argaman); --shesh-bright: var(--argaman);""")
z=rep(z,"""       maybe bold purple would be better?"); amber until then. A purple
       deeper than the page's own ink at rest, still inside the argaman the
       color contract measures. */
    --sel: #4f1789; --sel-dim: #845ba7;""",
"""       maybe bold purple would be better?"); amber until then. Since
       2026-10-10 it is the page's own ink itself, the regular: the press is
       carried by the weight, the pressed cell's darker linen and its doubled
       gold, and not by a purple of its own. */
    --sel: var(--argaman); --sel-dim: var(--argaman-dim);""")
z=rep(z,"""    --argaman: #772ba3; --argaman-dim: #9c69b9;""","""    --argaman: #561f86; --argaman-dim: #6c359e;""")
z=rep(z,"""    --link: var(--argaman);""","""    --link: var(--argaman-dim);""")
# every argaman rule but the name's own .com is a note, a flag or a mark: the dim
head,tail=z.split('</style>',1)
lines=head.split('\n')
for i,l in enumerate(lines):
    if 'var(--argaman)' in l and '#home a.home .wm-tld' not in l and not l.strip().startswith('--') and 'calling var(--link)' not in l:
        lines[i]=l.replace('var(--argaman)','var(--argaman-dim)')
head='\n'.join(lines)
z=head+'</style>'+tail
# hovers that stepped faint -> muted now step dim -> regular
for old in [".byline-fold > summary:hover { color: var(--muted); }",
            ".receipts-fold > summary:hover { color: var(--muted); }",
            ".rail .decl-more:hover { color: var(--muted);",
            ".rail .decl-where-fold > summary:hover { color: var(--muted); }",
            ".rail .def-order .declp:hover { color: var(--muted);",
            ".rail .def-order .dfp:hover:not(:disabled) { color: var(--muted);",
            "#hud .b-q button[aria-pressed=\"true\"] .q-role { color: var(--muted); }"]:
    z=rep(z,old,old.replace('var(--muted)','var(--ink)'))
z=rep(z,"#toc a:hover { color: var(--link); }","#toc a:hover { color: var(--ink-strong); }")
# the omission block faded itself with opacity; the dim now does the dimming, at body-text contrast
z=rep(z,"border-inline-start: 3px solid var(--rule, #8b7f69); opacity: .82; }","border-inline-start: 3px solid var(--rule, #8b7f69); }")
z=rep(z,".omission .om-mark { letter-spacing: .12em; opacity: .55; }",".omission .om-mark { letter-spacing: .12em; color: var(--argaman-dim); }")
z=rep(z,".omission .om-why { font-size: .84em; opacity: .75; font-style: italic; color: var(--argaman-dim); }",".omission .om-why { font-size: .84em; font-style: italic; color: var(--argaman-dim); }")
z=rep(z,"""    /* A link is the page offering a reader somewhere to go, which is the page
       speaking, so it is argaman like the rest of our voice.""","""    /* A link is the page offering a reader somewhere to go, which is the page
       speaking, so it is argaman like the rest of our voice: at rest the dim,
       like every control at rest, and the regular under the hand.""")
open(W+'/zone-after.html','w',encoding='utf-8').write(z)

# ---------------- door CSS ----------------
d=open(W+'/door.css',encoding='utf-8').read(); d0=d
d=rep(d,"--ink:#561f86; --ink-strong:#44166c; --muted:#6c359e; --faint:#845ba7;",
       "--ink:var(--argaman); --ink-strong:var(--argaman); --muted:var(--argaman-dim); --faint:var(--argaman-dim);")
d=rep(d,"--sel:#4f1789; --sel-dim:#845ba7;","--sel:var(--argaman); --sel-dim:var(--argaman-dim);")
d=rep(d,"--shesh:#561f86; --shesh-bright:#44166c;","--shesh:var(--argaman); --shesh-bright:var(--argaman);")
d=rep(d,"--argaman:#772ba3; --argaman-dim:#9c69b9; --link:#772ba3;",
       "--argaman:#561f86; --argaman-dim:#6c359e; --link:var(--argaman-dim);\n    --sel-text:rgba(196, 146, 28, 0.3);")
L=d.split('\n')
keep=('.wordmark .wm-fire','a.titleway:hover .he','font-size:1.25rem; color:var(--argaman)')
for i,l in enumerate(L):
    if 'var(--argaman)' in l and not l.strip().startswith('--') and not any(k in l for k in keep):
        L[i]=l.replace('var(--argaman)','var(--argaman-dim)')
d='\n'.join(L)
for old in [".filing-pick .fp:hover { color:var(--muted);",".def-order .dfp:hover:not(:disabled) { color:var(--muted);",
            ".workgroup details.fold > summary:hover { color:var(--muted); }"]:
    d=rep(d,old,old.replace('var(--muted)','var(--ink)'))
d=rep(d,"::selection { background: var(--sel-dim); color: var(--ink-strong); }","::selection { background: var(--sel-text); color: inherit; }")
open(W+'/door-after.css','w',encoding='utf-8').write(d)
idx=open(G+'/index.html',encoding='utf-8').read()
open(W+'/index-after.html','w',encoding='utf-8').write(rep(idx,d0,d))
import difflib
open(W+'/zone.diff','w').write(''.join(difflib.unified_diff(z0.splitlines(True),z.splitlines(True),'a/reader/zone.html','b/reader/zone.html',n=0)))
open(W+'/door.diff','w').write(''.join(difflib.unified_diff(d0.splitlines(True),d.splitlines(True),'a/DOOR_CSS','b/DOOR_CSS',n=0)))
print('ok')
