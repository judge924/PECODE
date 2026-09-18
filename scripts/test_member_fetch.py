import urllib.request
import urllib.parse
import json

url = "https://open.assembly.go.kr/portal/assm/search/searchAssmMemberSch.do"

# Parameters: statusCd="", page=1, rows=350
data = urllib.parse.urlencode({
    "page": 1,
    "rows": 350,
    "unitCd": "100022" # 22대 국회 코드 or blank
}).encode("utf-8")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
}

req = urllib.request.Request(url, data=data, headers=headers)

try:
    with urllib.request.urlopen(req) as resp:
        res_json = json.loads(resp.read().decode("utf-8"))
        print("Keys in response:", res_json.keys())
        # print sample item
        items = res_json.get("data", []) or res_json.get("rows", []) or res_json.get("result", [])
        print("Items count:", len(items))
        if items:
            print("First item sample:")
            print(json.dumps(items[0], ensure_ascii=False, indent=2))
        else:
            print("Raw response:", res_json)
except Exception as e:
    print("Error:", e)
