import re
import os

path = r"C:\Users\Heisenbug\.gemini\antigravity\brain\ccd4e560-892c-4c7e-b5a7-09fa363bf6d8\.system_generated\steps\163\content.md"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', content)
print("=== Filtered Links ===")
for link in set(links):
    if any(k in link.lower() for k in ["service", "data", "member", "api"]):
        print(link)

print("=== Text snippets mentioning 의원 or 인적사항 ===")
for line in content.splitlines():
    if "인적사항" in line or "국회의원" in line:
        print(line.strip()[:120])
