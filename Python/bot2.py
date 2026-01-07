import sys
import random

# =============================
# CONFIG
# =============================
BOARD_SIZE = 30

# =============================
# READ INPUT
# =============================
board = [list(sys.stdin.readline().strip()) for _ in range(BOARD_SIZE)]
my_symbol = sys.stdin.readline().strip()

# =============================
# HELPER
# =============================
def inside(r, c):
    return 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE

# =============================
# COLLECT EXISTING MOVES
# =============================
occupied = [
    (r, c)
    for r in range(BOARD_SIZE)
    for c in range(BOARD_SIZE)
    if board[r][c] != "."
]

empty = [
    (r, c)
    for r in range(BOARD_SIZE)
    for c in range(BOARD_SIZE)
    if board[r][c] == "."
]

# =============================
# COLLECT NEAR CANDIDATES
# =============================
candidates = set()

# radius = 1 or 2 đều ổn
RADIUS = 1

for r, c in occupied:
    for dr in range(-RADIUS, RADIUS + 1):
        for dc in range(-RADIUS, RADIUS + 1):
            rr, cc = r + dr, c + dc
            if inside(rr, cc) and board[rr][cc] == ".":
                candidates.add((rr, cc))

# =============================
# FALLBACK: NEAR CENTER
# =============================
if not candidates:
    center = BOARD_SIZE // 2
    for r, c in empty:
        if abs(r - center) <= 2 and abs(c - center) <= 2:
            candidates.add((r, c))

# =============================
# FINAL CHOICE
# =============================
if candidates:
    r, c = random.choice(list(candidates))
else:
    r, c = random.choice(empty)

print(r, c)
