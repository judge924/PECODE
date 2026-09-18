import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

js_files = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', html, re.IGNORECASE)
for js in js_files:
    print(js)
