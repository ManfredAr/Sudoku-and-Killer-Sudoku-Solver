import time
from killerSudokuSolver3 import KillerSudokuSolver3
from KillerSudoku import KillerSudoku

grid = [[0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]]

cages = {
    1 : {14 : [(0,0),(0,1),(1,1),(2,1)]},
    2 : {25 : [(0,2), (0,3), (0,4), (1,4)]},
    3 : {13 : [(0,5),(1,5),(1,6)]},
    4 : {12 : [(0,6), (0,7),(1,7)]},
    5 : {11 : [(0,8),(1,8)]},
    6 : {24 : [(1,0), (2,0), (3,0)]},
    7 : {18 : [(1,2), (1,3), (2,2), (2,3)]},
    8 : {4 : [(2,4),(3,4)]},
    9 : {29 : [(2,5),(3,5),(4,4),(4,5),(5,5),(6,5)]},
    10 : {24 : [(2,6),(3,6),(3,7),(3,8)]},
    11 : {8 : [(2,7),(2,8)]},
    12 : {32 : [(3,1),(3,2),(4,0),(4,1),(5,1),(5,2)]},
    13 : {22 : [(3,3),(4,2),(4,3),(5,3)]},
    14 : {10 : [(4,6),(4,7),(4,8)]},
    15 : {7 : [(5,0),(6,0),(7,0)]},
    16 : {11 : [(5,4),(6,4)]},
    17 : {28 : [(5,6),(5,7),(5,8),(6,6)]},
    18 : {20 : [(6,1),(7,1),(8,1),(8,0)]},
    19 : {26 : [(6,2),(6,3),(7,2),(7,3)]},
    20 : {6 : [(6,7),(6,8)]},
    21 : {20 : [(8,2),(7,4),(8,3),(8,4)]},
    22 : {16 : [(7,5), (7,6),(8,5)]},
    23 : {20 : [(7,7), (8,6),(8,7)]},
    24 : {5 : [(7,8), (8,8)]},
}

a = KillerSudokuSolver3(KillerSudoku(grid, cages))
#a.setupHeap()
#print(a.queue.pq)

start = time.time()
print(a.solver())
end = time.time()
print(end - start)
