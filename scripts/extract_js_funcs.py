import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Find javascript functions related to search or list
matches = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{([^}]*)\}', html)
for fn_name, fn_body in matches:
    if any(k in fn_name.lower() for k in ["search", "list", "member", "sch", "page", "ajax"]):
        print(f"Function: {fn_name}")
        print(fn_body.strip()[:300])
        print("-" * 40)
