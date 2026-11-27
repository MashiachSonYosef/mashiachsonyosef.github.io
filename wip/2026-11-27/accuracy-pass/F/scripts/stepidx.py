import re, collections
BK={'Gen':'genesis','Exo':'exodus','Lev':'leviticus','Num':'numbers','Deu':'deuteronomy','Jos':'joshua','Jdg':'judges','Rut':'ruth','1Sa':'i-samuel','2Sa':'ii-samuel','1Ki':'i-kings','2Ki':'ii-kings','1Ch':'i-chronicles','2Ch':'ii-chronicles','Ezr':'ezra','Neh':'nehemiah','Est':'esther','Job':'job','Psa':'psalms','Pro':'proverbs','Ecc':'ecclesiastes','Sng':'song-of-songs','Isa':'isaiah','Jer':'jeremiah','Lam':'lamentations','Ezk':'ezekiel','Dan':'daniel','Hos':'hosea','Jol':'joel','Amo':'amos','Oba':'obadiah','Jon':'jonah','Mic':'micah','Nam':'nahum','Hab':'habakkuk','Zep':'zephaniah','Hag':'haggai','Zec':'zechariah','Mal':'malachi'}
FILES=['TAHOT_Gen-Deu','TAHOT_Jos-Est','TAHOT_Job-Sng','TAHOT_Isa-Mal']
def load(W):
    """book -> hebrew ref 'c:v' -> list of rows dict(n, type, heb, en, tags, var_meaning, var_spelling, raw)"""
    idx=collections.defaultdict(lambda: collections.defaultdict(list))
    for fn in FILES:
        for line in open(f'{W}/dl-step/{fn}.txt',encoding='utf8'):
            m=re.match(r'^([1-3A-Za-z]{2,4})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(\S+)\t',line)
            if not m: continue
            f=line.rstrip('\n').split('\t')
            c,v=(m.group(4),m.group(5)) if m.group(4) else (m.group(2),m.group(3))
            idx[BK[m.group(1)]][f'{int(c)}:{int(v)}'].append(dict(ref=f[0],n=m.group(6),type=m.group(7),heb=f[1],en=f[3] if len(f)>3 else '',tags=f[4] if len(f)>4 else '',gram=f[5] if len(f)>5 else '',varm=f[6] if len(f)>6 else '',vars=f[7] if len(f)>7 else ''))
    return idx
LET=lambda s: ''.join(c for c in s if 'א'<=c<='ת')
