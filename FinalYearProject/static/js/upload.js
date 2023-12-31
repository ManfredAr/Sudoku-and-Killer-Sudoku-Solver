import { SudokuScreen } from "./SetSudokuScreen.js";
import { KSudokuScreen } from "./SetKSudokuScreen.js"

var sudokuInstance = null;
var ksudokuInstance = null;

document.addEventListener('DOMContentLoaded', function() {

    // eventlistener for the submit button
    document.getElementById('processImage').addEventListener('click', function(event) {
        event.preventDefault();

        // displaying a spinner
        document.getElementById('overlay').classList.add("overlay")
        document.getElementById('overlay').classList.remove("invisible")
        document.getElementById('cover').classList.add("disable");

        const inputElement = document.getElementById('imageUpload');
        const selectedFile = inputElement.files[0];
        let s = document.getElementById("sudoku");
        let ks = document.getElementById("ksudoku")
        // takes an image and sends it to the machine vision processing code.
        if (selectedFile && (s.checked == true || ks.checked == true)) {
            console.log(selectedFile)
            const formData = new FormData();
            formData.append('image', selectedFile);
            
            // checking which puzzle was selected.
            const sudokuRadio = document.getElementById('sudoku');
            if (sudokuRadio.checked) {
                formData.append('type', "sudoku");
            } else {
                formData.append('type', "Ksudoku");
            }

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // creating an HTTP response
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/Upload/uploadImage/');
            xhr.setRequestHeader('X-CSRFToken', csrfToken);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    // directing data to the correct machine vision code (sudoku or kiler sudoku).
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.type == "sudoku") {
                            const new_board = response.message;
                            displaySudokuPuzzle(new_board)
                        } else {
                            const grid = response.grid;
                            const cages = response.cages;
                            displayKSudokuPuzzle(grid, cages)
                        }
                    } else {
                        console.error('Request failed:', xhr.status);
                    }
                }
                // removing the spinner
                document.getElementById('overlay').classList.add("invisible");
                document.getElementById('overlay').classList.remove("overlay");
                document.getElementById('cover').classList.remove("disable");
            };
            xhr.send(formData);
        } else {
            alert('Please select a puzzle type and an image to process!');

            // removing the spinner
            document.getElementById('overlay').classList.add("invisible");
            document.getElementById('overlay').classList.remove("overlay");
            document.getElementById('cover').classList.remove("disable");
        }
    });

    document.getElementById("set").addEventListener('click', function(event) {
        event.preventDefault();
        sendToBackend("sudoku");
    });


    document.getElementById("set1").addEventListener('click', function(event) {
        event.preventDefault();
        sendToBackend("ksudoku");
    });

    // when a user is happy with the puzzle they can set it. 
    // this function sends the puzzle to the backend for solving
    // and redirects the user to the relevant screen to play the puzzle.
    function sendToBackend(puzzle) {

        // displaying spinner
        document.getElementById('overlay').classList.add("overlay")
        document.getElementById('overlay').classList.remove("invisible")
        document.getElementById('cover').classList.add("disable");

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData();
        if (puzzle == "sudoku") {
            formData.append('puzzle', JSON.stringify(sudokuInstance.board));
        } else {
            formData.append('puzzle', JSON.stringify(ksudokuInstance.board));
            formData.append('cages', JSON.stringify(ksudokuInstance.groups));
        }

        // creating an HTTP response
        const xhr = new XMLHttpRequest();
        if (puzzle == "sudoku") {
            xhr.open('POST', '/Upload/loadSudoku/');
        } else {
            xhr.open('POST', '/Upload/loadKSudoku/');
        }
        xhr.setRequestHeader('X-CSRFToken', csrfToken);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // processing the response.
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    // redirecting the user to the sudoku or killer sudoku screen
                    if (response.message == "sudoku") {
                        window.location.href = '/PlaySudoku';
                    } else {
                        window.location.href = '/PlayKillerSudoku';
                    }
                } else {
                    // incorrect puzzle displays and alert.
                    document.getElementById('overlay').classList.add("invisible");
                    document.getElementById('overlay').classList.remove("overlay");
                    document.getElementById('cover').classList.remove("disable");
                    console.error('Request failed:', xhr.status);
                    alert("The puzzle was incorrect");
                }
            }
        };
        xhr.send(formData); 
    }
});

// uses the setSudokuScreen class to allow the user to interact with the puzzle 
function displaySudokuPuzzle(puzzle) {
    sudokuInstance = new SudokuScreen(puzzle, [-1]);
    sudokuInstance.CreateGame();
    document.getElementById("type").classList.toggle("invisible");
    document.getElementById("sudokuDiv").classList.toggle("invisible");

    // add event listeners for cells and buttons
    let numClass = document.getElementsByClassName("num");
    for (let i = 0; i < numClass.length; i++) {
        numClass[i].addEventListener("click", () => sudokuInstance.selectedNum(numClass[i]));
    }

    let tiles = document.getElementsByClassName("tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].addEventListener("click", () => sudokuInstance.selectedTile(tiles[i].id));
    }
}

// uses the setKSudokuScreen class to allow the user to interact with the puzzle 
function displayKSudokuPuzzle(puzzle, cages) {
    ksudokuInstance = new KSudokuScreen(puzzle, [], cages);
    ksudokuInstance.CreateGame();
    document.getElementById("type").classList.toggle("invisible");
    document.getElementById("ksudokuDiv").classList.toggle("invisible");

    // add event listeners for cells and buttons
    let numClass = document.getElementsByClassName("num");
    for (let i = 0; i < numClass.length; i++) {
        numClass[i].addEventListener("click", () => ksudokuInstance.changeCageSum(numClass[i]));
    }

    let tiles = document.getElementsByClassName("tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].addEventListener("click", () => ksudokuInstance.selectedTile(tiles[i].id));
    }
}
