import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

idx = 0
while True:
    pos = html.find("btnMbSearch", idx)
    if pos == -1:
        break
    print("Found at pos", pos)
    print(html[max(0, pos-200):min(len(html), pos+800)])
    print("=" * 60)
    idx = pos + 11
