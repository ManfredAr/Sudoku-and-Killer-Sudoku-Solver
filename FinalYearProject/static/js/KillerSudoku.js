import { KSudokuScreen } from "./SetKSudokuScreen.js";

// board and solution are currently hardcoded
// but will eventually be replaced with generated puzzles.
var board = [
    ["8", "3", "7", "4", "9", "1", "6", "2", "5"],
    ["2", "4", "5", "8", "6", "7", "3", "1", "9"],
    ["6", "1", "9", "2", "5", "3", "8", "7", "4"],
    ["3", "5", "8", "6", "1", "2", "7", "9", "4"],
    ["7", "2", "4", "3", "9", "3", "1", "6", "8"],
    ["1", "9", "6", "2", "4", "8", "5", "3", "7"],
    ["9", "4", "3", "1", "7", "6", "2", "8", "5"],
    ["6", "7", "2", "5", "8", "3", "9", "4", "1"],
    ["5", "8", "-", "9", "-", "-", "7", "6", "3"]
];

var cageGroups = [["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8"],
                  ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"],
                  ["2.0", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"],
                  ["3.0", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"],
                  ["4.0", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8"],
                  ["5.0", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8"],
                  ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8"],
                  ["7.0", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6"],
                  ["8.0", "8.1", "8.2", "8.3", "8.4", "8.5", "8.6"],
                  ["7.7", "7.8", "8.7", "8.8"],
                  ["0.0"]];

var cageVal = [45,45,45,45,45,45,45,45,45,1,1];

var solution = [
    ["8", "3", "7", "4", "9", "1", "6", "2", "5"],
    ["2", "4", "5", "8", "6", "7", "3", "1", "9"],
    ["6", "1", "9", "2", "5", "3", "8", "7", "4"],
    ["3", "5", "8", "6", "1", "2", "7", "9", "4"],
    ["7", "2", "4", "3", "9", "3", "1", "6", "8"],
    ["1", "9", "6", "2", "4", "8", "5", "3", "7"],
    ["9", "4", "3", "1", "7", "6", "2", "8", "5"],
    ["6", "7", "2", "5", "8", "3", "9", "4", "1"],
    ["5", "8", "1", "9", "2", "4", "7", "6", "3"]
];

var SetScreen = null;

// on load the screen should be set up with the grid and the buttons.
window.onload = function() {
    SetScreen = new KSudokuScreen(board, solution, cageGroups, cageVal);
    SetScreen.CreateGame();

    // add event listeners for cells and buttons
    let numClass = document.getElementsByClassName("num");
    for (let i = 0; i < numClass.length; i++) {
        numClass[i].addEventListener("click", () => SetScreen.selectedNum(numClass[i]));
    }

    let tiles = document.getElementsByClassName("tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].addEventListener("click", () => SetScreen.selectedTile(tiles[i].id));
    }

    document.getElementById("enableNotes").addEventListener("click", () => SetScreen.activeNotes());
    document.getElementById("undo").addEventListener("click", () => SetScreen.lastAction());
}
