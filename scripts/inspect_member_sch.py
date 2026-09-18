import urllib.request
import re
import json

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print("Page length:", len(html))
        
        # Look for ajax urls or form action
        ajax_calls = re.findall(r'(\/portal\/[a-zA-Z0-9_\/]+\.do|\/portal\/[a-zA-Z0-9_\/]+\.json)', html)
        print("AJAX / Action URLs:", set(ajax_calls))
        
        # Look for script variables or member list
        scripts = re.findall(r'<script[^>]*>(.*?)<\/script>', html, re.DOTALL)
        for i, s in enumerate(scripts):
            if "member" in s.lower() or "list" in s.lower() or "search" in s.lower():
                print(f"--- Script {i} ---")
                lines = [l.strip() for l in s.splitlines() if any(k in l.lower() for k in ["url", "data", "ajax", "member", "post"])]
                print("\n".join(lines[:20]))
except Exception as e:
    print("Error:", e)
