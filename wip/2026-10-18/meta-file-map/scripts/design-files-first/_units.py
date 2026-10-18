# census unit rule (copied from meta/census/scripts/census.py)
EDB_SUBS = {'pby-wave', 'h1-canon', 'tanakh-editions'}
def unit_of(k):
    p = k.split('/')
    if len(p) == 1: return k
    top = p[0]
    if top in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging'):
        return top + '/(own files)' if len(p) == 2 else top + '/' + p[1] + '/'
    if top == 'editions-built-v1':
        return 'editions-built-v1/' + p[1] + '/' if p[1] in EDB_SUBS else 'editions-built-v1/[4,031 work folders]/'
    if top == 'cold':
        return 'cold/' + p[1] if len(p) == 2 else 'cold/' + p[1] + '/'
    if top in ('serving-lane', 'serving-lane-handoffs', 'retired'):
        return top + '/' + p[1] + '/'
    if top == 'mishkan':
        return 'mishkan/' + p[1] + '/' + p[2] + '/'
    return top + '/'

