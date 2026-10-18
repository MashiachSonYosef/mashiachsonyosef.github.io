# 06_git_md5.py - md5 every git blob whose size equals some R2 object's size; match (md5,size) to R2 keys.
# Read only: git cat-file --batch on the shared object store (via the ghp worktree).
import subprocess, hashlib, collections, json, sys
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O=S+'/meta/copies/out'
G=S+'/ghp'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
r2=collections.defaultdict(list)
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); r2[(m,int(sz))].append(k)
cand=[l.strip() for l in open(O+'/git-blob-candidates.txt') if l.strip()]
p=subprocess.Popen(['git','-C',G,'cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE)
import threading
def feed():
    for s in cand: p.stdin.write((s+'\n').encode())
    p.stdin.close()
threading.Thread(target=feed,daemon=True).start()
out=open(O+'/git-blob-md5.tsv','w')
n=0
for s in cand:
    hdr=p.stdout.readline().decode().split()
    sha,t,sz=hdr[0],hdr[1],int(hdr[2])
    h=hashlib.md5(); left=sz
    while left>0:
        chunk=p.stdout.read(min(left,1<<20)); h.update(chunk); left-=len(chunk)
    p.stdout.read(1)
    out.write('%s\t%d\t%s\n'%(sha,sz,h.hexdigest())); n+=1
    if n%20000==0: print(n,file=sys.stderr,flush=True)
out.close(); p.wait()
print('hashed',n)
