# Compile Scrabble dictionary to optimized JS structure + definitions

from collections import defaultdict
import re

groups = defaultdict(list)
defs = {}

with open("CSW24.txt", encoding="utf-8") as f:
    for line in f:
        line=line.strip()
        if not line:
            continue

        parts=line.split(" ",1)
        word=parts[0].lower()

        if not word.isalpha():
            continue

        groups[len(word)].append(word)

        # ambil arti
        if len(parts)>1:
            meaning=parts[1]

            # hapus tag [n] [v] dll
            meaning=re.sub(r"\[[^\]]+\]","",meaning).strip()

            defs[word]=meaning

# sort untuk binary search
for k in groups:
    groups[k]=sorted(set(groups[k]))

# tulis JS
with open("dict.js","w",encoding="utf-8") as out:
    out.write("window.DICT={\n")
    for length in sorted(groups):
        out.write(f"{length}:[")
        out.write(",".join(f'"{w}"' for w in groups[length]))
        out.write("],\n")
    out.write("};\n\n")

    out.write("window.DEF={\n")
    for w,m in defs.items():
        m=m.replace('"','\\"')
        out.write(f'"{w}":"{m}",\n')
    out.write("};")

print("DONE")
print("Total words:",sum(len(v) for v in groups.values()))
print("Definitions:",len(defs))
