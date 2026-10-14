import re
from pathlib import Path

# Find every .tsx file under app/
files = list(Path("app").rglob("*.tsx"))
pattern = re.compile(r"inputProps=\{\{([^{}]+)\}\}")

total = 0
for f in files:
    text = f.read_text(encoding="utf-8")
    new_text, count = pattern.subn(
        r"slotProps={{ htmlInput: {\1} }}",
        text,
    )
    if count:
        f.write_text(new_text, encoding="utf-8")
        print(f"  Fixed {count} occurrence(s) in {f}")
        total += count

print(f"\nTotal: {total} inputProps -> slotProps.htmlInput migrations.")