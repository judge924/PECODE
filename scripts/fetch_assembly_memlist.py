import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.assembly.go.kr/portal/na/member/memList.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})

try:
    with urllib.request.urlopen(req, context=ctx) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print("Length:", len(html))
        
        # Save to file to inspect easily
        with open(r"c:\Users\Heisenbug\Documents\poliorg\scripts\assembly_memList.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("Saved to assembly_memList.html")
        
        # Let's check for member patterns
        # Look for member names
        matches = re.findall(r'<div[^>]*class=[\'"][^\'"]*name[^\'"]*[\'"][^>]*>(.*?)<\/div>', html, re.DOTALL | re.IGNORECASE)
        print("Name divs:", len(matches), [re.sub(r'<[^>]+>', '', m).strip() for m in matches[:10]])
        
        # Look for links to member details
        mem_links = re.findall(r'href=[\'"]([^\'"]*memView\.do[^\'"]*)[\'"]', html)
        print("memView links:", len(mem_links), mem_links[:5])
except Exception as e:
    print("Error:", e)
