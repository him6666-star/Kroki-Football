import json,sys,re
O=json.load(open('_order.json'))
for L in sys.argv[1:]:
    A=json.load(open(L+'.arr.json'));print(L,len(A),'/',len(O))
    if len(A)!=len(O):continue
    for i,(e,t) in enumerate(zip(O,A)):
        p=[]
        if e[:1].isspace()!=t[:1].isspace() or e[-1:].isspace()!=t[-1:].isspace():p.append('bosluk')
        if re.match(r'^[(),.:;·—\-]',e) and e[:1]!=t[:1] and not e.startswith('-'):p.append('bas')
        if re.search(r'[(:]\s*$',e) and e.rstrip()[-1]!=t.rstrip()[-1]:p.append('son')
        if p:print(' ',i,p,repr(e),'=>',repr(t))
