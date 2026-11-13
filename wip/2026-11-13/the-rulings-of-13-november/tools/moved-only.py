# Of the places places-of-a-key.py prints (three lines each: the place, its leaders before, its leaders after), those
# whose leaders are not the same on the two builds.
# python3 -I places-of-a-key.py ... | python3 -I moved-only.py
import sys

lines = [l.rstrip("\n") for l in sys.stdin]
for i in range(0, len(lines) - 2, 3):
    place, before, after = lines[i], lines[i + 1], lines[i + 2]
    if before.split("before:", 1)[-1].strip() != after.split("after:", 1)[-1].strip():
        print(place[:260]); print(before[:300]); print(after[:300])
