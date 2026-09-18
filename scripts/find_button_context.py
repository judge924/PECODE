import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Find the button and its surrounding context
pos = 0
while True:
    idx = html.find("<button", pos)
    if idx == -1:
        break
    end_idx = html.find("</button>", idx) + 9
    print(html[idx-100:end_idx+100])
    print("=" * 60)
    pos = end_idx
