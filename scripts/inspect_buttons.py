import urllib.request
import re

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Find buttons or links with onclick or search
buttons = re.findall(r'<button[^>]*>(.*?)<\/button>', html, re.DOTALL | re.IGNORECASE)
for b in buttons:
    print("Button:", b.strip())

onclicks = re.findall(r'onclick=[\'"]([^\'"]+)[\'"]', html, re.IGNORECASE)
for oc in set(onclicks):
    print("Onclick:", oc)
