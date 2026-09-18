import urllib.request
import re
from html.parser import HTMLParser

url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Let's inspect member cards or list items
cards = re.findall(r'<li[^>]*class=[\'"][^\'"]*member[^\'"]*[\'"][^>]*>(.*?)<\/li>', html, re.DOTALL | re.IGNORECASE)
print("Member li cards found:", len(cards))

if not cards:
    # Look for member links or names
    items = re.findall(r'(\/portal\/assm\/search\/memberSchPage\.do\?[^\'"]+)', html)
    print("Member detail links found:", len(items))
    
    # search for img with alt or title
    imgs = re.findall(r'<img[^>]+alt=[\'"]([^\'"]+)[\'"][^>]*>', html)
    print("Images with alt:", len(imgs))
    member_imgs = [img for img in imgs if any(k in img for k in ["의원", "사진", "의원실"])]
    print("Member images:", len(member_imgs), member_imgs[:10])

    # Let's search for table or list of names
    pattern = re.findall(r'<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>', html, re.DOTALL)
    print("dt/dd pairs:", len(pattern))
    for dt, dd in pattern[:10]:
        print("DT:", re.sub(r'<[^>]+>', '', dt).strip(), "DD:", re.sub(r'<[^>]+>', '', dd).strip())
