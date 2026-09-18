import urllib.request

url = "https://open.assembly.go.kr/js/portal/assm/search/memberSch.js"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8", errors="ignore")
        print("JS file size:", len(content))
        with open(r"c:\Users\Heisenbug\Documents\poliorg\scripts\memberSch.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("Saved to memberSch.js")
        
        # Look for url patterns
        import re
        urls = re.findall(r'[\'"](\/[a-zA-Z0-9_\/]+\.do|\/[a-zA-Z0-9_\/]+\.json)[\'"]', content)
        print("URLs in memberSch.js:", set(urls))
except Exception as e:
    print("Error:", e)
