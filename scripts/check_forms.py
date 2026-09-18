import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

forms = re.findall(r'<form[^>]*>(.*?)<\/form>', html, re.DOTALL | re.IGNORECASE)
print("Forms found:", len(forms))
for i, f in enumerate(forms):
    action = re.search(r'action=[\'"]([^\'"]*)[\'"]', f, re.IGNORECASE)
    method = re.search(r'method=[\'"]([^\'"]*)[\'"]', f, re.IGNORECASE)
    name = re.search(r'name=[\'"]([^\'"]*)[\'"]', f, re.IGNORECASE)
    print(f"Form {i}: action={action.group(1) if action else 'None'}, method={method.group(1) if method else 'None'}, name={name.group(1) if name else 'None'}")
    inputs = re.findall(r'<input[^>]*name=[\'"]([^\'"]*)[\'"][^>]*>', f, re.IGNORECASE)
    print("  Inputs:", inputs)
