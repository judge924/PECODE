import urllib.request
import urllib.parse
import json
import re

url = "https://open.assembly.go.kr/portal/assm/search/searchAssmMemberSch.do"

data = urllib.parse.urlencode({
    "page": 1,
    "rows": 350,
    "unitCd": "100022"
}).encode("utf-8")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
}

req = urllib.request.Request(url, data=data, headers=headers)

with urllib.request.urlopen(req) as resp:
    res_json = json.loads(resp.read().decode("utf-8"))

raw_list = res_json.get("data", [])
print(f"Fetched {len(raw_list)} members from Open Assembly.")

# Save raw json for backup
with open(r"c:\Users\Heisenbug\Documents\poliorg\src\data\raw_assembly_299.json", "w", encoding="utf-8") as f:
    json.dump(raw_list, f, ensure_ascii=False, indent=2)

print("Saved raw_assembly_299.json")
