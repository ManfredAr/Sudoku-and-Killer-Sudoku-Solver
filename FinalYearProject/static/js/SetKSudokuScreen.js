import { Notes } from "./notes.js";
import { Stack } from "./stack.js";

class KSudokuScreen {

    constructor(grid, solution, group) {
        this.board = grid;
        this.solution = solution;
        this.groups = group;
        this.notes = new Notes();
        this.myStack = new Stack();
        this.takingNotes = false;
        this.sel_row = 0;
        this.sel_col = 0;
        this.prev_row = 0;
        this.prev_col = 0;
    }

    CreateGame() {
        // create the possible numbers to be used as buttons .
        // the 10th is not a number its a delete number button.
        for (let i = 0; i <= 10; i++) {
            // 1-9 button
            if (i != 10) {
                let number = document.createElement("div");
                number.id = i;
                number.innerText = i;
                number.className = "num";
                number.classList.add("number");
                document.getElementsByClassName("values")[0].appendChild(number);
            } else {
                // delete button
                let number = document.createElement("div");
                number.id = "x"
                number.innerText = "x";
                number.className = "num";
                number.classList.add("number");
                document.getElementsByClassName("values")[0].appendChild(number);
            }
        }
        
        // Creates the 9x9 grid
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                console.log("we're here");
                let tile = document.createElement("div");
                tile.id = row.toString() + "." + col.toString();
                tile.className = "tile";

                // adding vertical rows for the 3x3 mini boxes
                if (row == 2 || row == 5) {
                    tile.classList.add("horizontal");
                }
    
                // adding horizontal times for the mini boxes
                if (col == 2 || col == 5) {
                    tile.classList.add("vertical");
                }
    
                //tile.addEventListener("click", this.selectedTile);
                tile.classList.add("cell");
                document.getElementById("grid1").append(tile);

                let cage = document.createElement("div");
                cage.id = "c" + row.toString() + "." + col.toString();
                cage.className = "cage";
                cage.classList.add("cage");
                if (this.board[row][col] != "-" && this.board[row][col] != "0") {
                    cage.innerText = this.board[row][col];
                }
                tile.appendChild(cage);
                if (this.board[row][col] == "-" || this.board[row][col] == "0") {
                    this.notes.addKNotes(row, col);
                }
            }
        }

        // the grid is initially set up with a cage around every cell.
        // After this check which cels are in the same group and remove the borders between them.

        let count = 0;
        for (const group in this.groups) {
            const dict = this.groups[group];
            const CageSum = Object.keys(dict)[0]; 
            const values = Object.values(dict)[0];
            let sum = document.createElement("div");
            sum.innerText = CageSum;
            sum.classList.add("sumsquare");
            document.getElementById(values[0][0] + "." + values[0][1]).appendChild(sum);
            count += 1;
            for (let i = 0; i < values.length; i++) {
                document.getElementById(values[0][0] + "." + values[0][1]).setAttribute("cageNum", group);
                for (let j = i+1; j < values.length; j++) {

                    // removes left and right borders.
                    if (values[i][0] === values[j][0]) {
                        if (values[i][1] < values[j][1]) {
                            document.getElementById("c" + values[i][0] + "." + values[i][1]).classList.add("removeRight");
                            document.getElementById("c" + values[j][0] + "." + values[j][1]).classList.add("removeLeft");
                            document.getElementById(values[i][0] + "." + values[i][1]).classList.add("removeRightPadding");
                            document.getElementById(values[j][0] + "." + values[j][1]).classList.add("removeLeftPadding");
                        } else {
                            document.getElementById("c" + values[i][0] + "." + values[i][1]).classList.add("removeLeft");
                            document.getElementById("c" + values[j][0] + "." + values[j][1]).classList.add("removeRight");
                            document.getElementById(values[i][0] + "." + values[i][1]).classList.add("removeLeftPadding");
                            document.getElementById(values[j][0] + "." + values[j][1]).classList.add("removeRightPadding");                       
                        }
                    }

                    // removes top and bottom borders.
                    if (values[i][1] === values[j][1]) {
                        document.getElementById("c" + values[i][0] + "." + values[i][1]).classList.add("removeBottom");
                        document.getElementById("c" + values[j][0] + "." + values[j][1]).classList.add("removeTop");
                        document.getElementById(values[i][0] + "." + values[i][1]).classList.add("removeBottomPadding");
                        document.getElementById(values[j][0] + "." + values[j][1]).classList.add("removeTopPadding");
                    }
                }
            }
        }
    }

    
    // toggles the notes button
    activeNotes(event) {
        document.getElementById("enableNotes").classList.toggle("activeButton");
        if (this.takingNotes) {
            this.takingNotes = false;
        } else {
            this.takingNotes= true;
        }
    }

    // Used to revert the last action that was taken.
    lastAction(event) {
        let action = this.myStack.getLastAction();
        if (action != null) {
            // retrieves information about the last action
            // Such as the row and column that was changed. 
            let row = parseInt(action[1]);
            let col = parseInt(action[2]);
            let element = document.getElementById("c" + row + "." + col);

            // check if the user made a guess in the last action.
            if (action[0] == "guess") {
                // if a guess was made when the cell only contained notes 
                // then remove the guess and add back the notes 
                let prev = parseInt(action[3])
                if (prev == "switch") {
                    this.board[row][col] = 0;
                    element.innerText = "";
                    this.notes.addKNotes(row, col);
                } else {
                    // if a guess was already made then simply put in the previous guess.
                    if (!prev) {
                        element.innerText = "";
                        this.notes.addKNotes(row, col);
                        this.board[row][col] = "";
                    } else {
                        element.innerText = prev;
                        this.board[row][col] = prev;
                        if (this.solution[row][col] == this.board[row][col]) {
                            element.classList.remove("incorrectGuess");
                        } else {
                            element.classList.add("incorrectGuess");
                        }
                    }  
                } 
            } else if (action[0] == "note") {
                // If the last action was to add a not.
                let prev = parseInt(action[3]);
                let noteCell = document.getElementById(row + "." + col + "." + prev);
                // Since notes can only be added if the cell didn't contain a guess
                // just add back the note or remove it. 
                if (this.notes.getNote(row, col, prev) == prev) {
                    noteCell.innerText = "";
                    this.notes.removeNote(row, col, prev);
                } else {
                    noteCell.innerText = action[3];
                    this.notes.setNote(row, col, prev);
                }
            } else {
                // if the user clears the notes in a cell then get back the 
                // last notes they had and re build the notes.
                let array = action[3];
                this.notes.addCellNotes(row, col, array);
                this.notes.addKNotes(row, col);
            }
        }
    }

    // updating the currently selected square to the select number
    selectedNum(element) {
        console.log("hi");
        console.log("c" + this.sel_row + "." + this.sel_col);
        if (!this.takingNotes) {
            let tile = document.getElementById("c" + this.sel_row + "." + this.sel_col);
            let children = tile.childElementCount;
            
            if (children == 9) {
                tile.innerHTML = "";
            }

            let curText = parseInt(tile.innerText);

            // if selected num was "x" then simply empty the selected square
            if (element.innerText == "x") {
                this.board[this.sel_row][this.sel_col] = 0;
                tile.innerText = "";
                if (children == 9) {
                    let prevNotes = [];
                    for (let i = 1; i <= 9; i++) {
                        prevNotes.push(this.notes.getNote(this.sel_row, this.sel_col, i));
                    }
                    this.myStack.clearNotes(this.sel_row, this.sel_col, prevNotes);
                    this.notes.clearNotes(this.sel_row, this.sel_col);
                } else {
                    this.myStack.insertGuess(this.sel_row, this.sel_col, curText, "");
                }
                this.notes.addKNotes(this.sel_row, this.sel_col);
                // if user deletes a guess then the notes subcells should be baught back.
            } else {
                if (children == 9) {
                    this.myStack.insertGuess(this.sel_row, this.sel_col, "switch", parseInt(element.innerText));
                } else {
                    this.myStack.insertGuess(this.sel_row, this.sel_col, curText, parseInt(element.innerText));
                }
                console.log(this.sel_row, this.sel_col, this.element);
                this.board[parseInt(this.sel_row)][parseInt(this.sel_col)] = parseInt(element.innerText);
                tile.innerText = element.innerText;
                if (element.innerText != this.solution[this.sel_row][this.sel_col]) {
                    tile.classList.add("incorrectGuess");
                } else {
                    tile.classList.remove("incorrectGuess");
                }
            }
        } else {
            // If a cell already contains a guess then notes cannot be added.
            if (document.getElementById("c" + this.sel_row + "." + this.sel_col).childElementCount == 9) {
                document.getElementById("c" + this.sel_row + "." + this.sel_col).classList.remove("incorrectGuess"); 
                let idx = element.innerText;
                if (idx != "x") {
                    let noteTile = document.getElementById(this.sel_row + "." + this.sel_col + "." + parseInt(idx));
                    //console.log(sel_row + "." + sel_col + "." + parseInt(idx));
                    if (noteTile.innerText === idx) {
                        noteTile.innerText = "";
                        this.notes.removeNote(this.sel_row, this.sel_col, idx - 0)
                        this.myStack.insertNotes(this.sel_row, this.sel_col, idx, parseInt(element.innerText), "");
                    } else {
                        console.log(this.sel_row, this.sel_col, idx - 0);
                        noteTile.innerText = idx;
                        this.notes.setNote(this.sel_row, this.sel_col, idx - 0);
                        this.myStack.insertNotes(this.sel_row, this.sel_col, idx, "", parseInt(element.innerText));
                    }
                }
            }
            //console.log("cell: ", this.notes.getCellNotes(this.sel_row, this.sel_col));
        }
        this.myStack.displayStack();

        this.isComplete();
    }

    isComplete() {
        for (let a = 0; a < 9; a++) {
            for (let b = 0; b < 9; b++) {
                if (this.board[a][b] != this.solution[a][b]) {
                    return;
                }
            }
        }

        // removes buttons as puzzle is completed.
        document.getElementsByClassName("buttons")[0].style.display = "none";   
        document.getElementsByClassName("values")[0].style.display = "none";
        document.getElementById("complete").style.display = "block";

    }

    // displays the answer for a cell
    giveHint() {
        document.getElementById("c" + this.sel_row + "." + this.sel_col).innerText = this.solution[this.sel_row][this.sel_col];
        this.board[this.sel_row][this.sel_col] = this.solution[this.sel_row][this.sel_col]
        this.isComplete();
    }

    // keeping track of the current and previous selected square
    selectedTile(id) {
        //console.log(id);
        let coordinates = id.split(".");
        this.prev_row = this.sel_row;
        this.prev_col = this.sel_col;
        this.sel_row = parseInt(coordinates[0]);
        this.sel_col = parseInt(coordinates[1]);
        // removing the color from previous square
        let prevtile = document.getElementById("c" + this.prev_row + "." + this.prev_col);
        prevtile.classList.remove("selected-tile");

        // adding color for new selected square
        let tile = document.getElementById("c" + this.sel_row + "." + this.sel_col);

        // highlights all the cells which has the same number and the cell the user clicked on.
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                let all = document.getElementById("c" + row + "." + col);
                if (all.childNodes.length == 1 && all.innerText === tile.innerText && all.innerText != "") {
                    all.classList.add("selectedSquare");
                } else {
                    all.classList.remove("selectedSquare");
                }
            }
        }
        tile.classList.add("selected-tile");
    }

    // changes the sum of the cage 
    changeCageSum(id) {
        let tile = document.getElementById(this.sel_row + "." + this.sel_col);
        let sumElement = tile.querySelector(".sumsquare");
        let num = id.id;
        let cage = this.groups[parseInt(tile.getAttribute("cagenum"))];
        const values = Object.values(cage)[0];
        if (sumElement != null) {
            if (num < 10) {
                sumElement.innerText += num;
                const newval = sumElement.innerText;
                this.groups[parseInt(tile.getAttribute("cagenum"))] = {[newval]: values };
            } else {
                sumElement.innerText = "";
                this.groups[parseInt(tile.getAttribute("cagenum"))] = {0: values };
            }
        }
    }

    autoComplete() {
        console.log(this.solution)
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                document.getElementById("c" + i + "." + j).innerText = this.solution[i][j];
                this.board[i][j] = this.solution[i][j]
            }
        }
        this.isComplete();
    }
}
export { KSudokuScreen };