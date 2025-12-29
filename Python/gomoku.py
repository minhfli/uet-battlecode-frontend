import random
import json

def random_bot(board, player=0, size=50):
    """
    Random Caro bot with locality constraint:
    only choose empty cells within distance <= 1
    from any occupied cell.

    Args:
        board (list[list[int]]): 50x50 board
                                 0 = empty, 1 = X, 2 = O
        player (int): Player number (unused)
        size (int): Board size
    Returns:
        tuple[int, int] or None
    """

    candidate_cells = set()
    has_piece = False

    for i in range(size):
        for j in range(size):
            if board[i][j] != 0:
                has_piece = True
                # xét các ô lân cận
                for dx in (-1, 0, 1 ):
                    for dy in (-1, 0, 1):
                        ni, nj = i + dx, j + dy
                        if 0 <= ni < size and 0 <= nj < size:
                            if board[ni][nj] == 0:
                                candidate_cells.add((ni, nj))

    # Nếu đã có quân trên bàn → chọn trong vùng lân cận
    if candidate_cells:
        return random.choice(list(candidate_cells))

    # Fallback: bàn trống (hoặc không có nước hợp lệ)
    if not has_piece:
        empty_cells = [
            (i, j)
            for i in range(size)
            for j in range(size)
            if board[i][j] == 0
        ]
        return ((size+1)//2, (size+1)//2) if empty_cells else None

    return None

def check_win(board, size=50, condition=5):
    """
    Check if there is a winner on the board.

    Args:
        board (list[list[int]]): 50x50 board
                                 0 = empty, 1 = X, 2 = O
        size (int): Size of the board (default is 50)
    Returns:
        int: 0 = no winner, 1 = X wins, 2 = O wins
    """
    directions = [(1, 0), (0, 1), (1, 1), (1, -1)]  # down, right, down-right, down-left

    for i in range(size):
        for j in range(size):
            if board[i][j] != 0:
                player = board[i][j]
                for d in directions:
                    count = 1
                    for step in range(1, 5):
                        ni, nj = i + d[0] * step, j + d[1] * step
                        if 0 <= ni < size and 0 <= nj < size and board[ni][nj] == player:
                            count += 1
                        else:
                            break
                    if count >= condition:
                        return player
    return 0

BOARD_SIZE = 40
CONDITION = 5
""" example game record
{
  "board_size": 50,
  "win_condition": 5,
  "winner": 1,
  "moves": [
    { "turn": 1, "player": 1, "row": 12, "col": 20 },
    { "turn": 2, "player": 2, "row": 13, "col": 21 }
  ]
}
"""
if __name__ == "__main__":
    # Example usage
    board = [[0 for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
    move_history = []
    winner = 0
    turn = 0
    while check_win(board, size=BOARD_SIZE, condition=CONDITION) == 0:
        # -----------------------------------------------------------
        turn += 1
        moveX = random_bot(board, player=1, size=BOARD_SIZE)
        if moveX is None:
            print("Draw!")
            break
        row, col = moveX
        board[row][col] = 1  # X's turn
        move_history.append({"turn": turn, "player": 1, "row": row, "col": col})
        if check_win(board, size=BOARD_SIZE, condition=CONDITION) != 0:
            print("X wins!")
            winner = 1
            break
        # -----------------------------------------------------------
        turn += 1
        moveO = random_bot(board, player=2, size=BOARD_SIZE)
        if moveO is None:
            print("Draw!")
            break
        row, col = moveO
        board[row][col] = 2  # O's turn
        move_history.append({"turn": turn, "player": 2, "row": row, "col": col})
        if check_win(board, size=BOARD_SIZE, condition=CONDITION) != 0:
            print("O wins!")
            winner = 2
            break
    
    game_record = {
        "p1": "Alice's random_bot",
        "p2": "Bob's random_bot",
        "board_size": BOARD_SIZE,
        "win_condition": CONDITION,
        "winner": winner,
        "moves": move_history
    }
    # Save game record to a JSON file
    with open("game_record.json", "w") as f:
        json.dump(game_record, f, indent=4)
