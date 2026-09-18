import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

scripts = re.findall(r'<script[^>]*>(.*?)<\/script>', html, re.DOTALL | re.IGNORECASE)
for i, s in enumerate(scripts):
    if "member" in s.lower() or "sch" in s.lower() or "grid" in s.lower() or "list" in s.lower():
        lines = [l for l in s.splitlines() if any(k in l for k in ["url", ".do", ".json", "ajax", "post", "get", "location"])]
        if lines:
            print(f"=== Script {i} ===")
            print("\n".join(lines[:30]))
