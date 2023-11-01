import { SudokuScreen } from "./SetSudokuScreen.js";
import { KSudokuScreen } from "./SetKSudokuScreen.js"
var sudokuInstance = null;
var ksudokuInstance = null;

document.addEventListener('DOMContentLoaded', function() {

    const processImageButton = document.getElementById('processImage');

    // eventlistener for the submit button
    processImageButton.addEventListener('click', function(event) {
        event.preventDefault();

        // displaying a spinner
        document.getElementById('overlay').classList.add("overlay")
        document.getElementById('overlay').classList.remove("invisible")
        const inputElement = document.getElementById('imageUpload');
        const selectedFile = inputElement.files[0];

        if (selectedFile) {
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
                    // processing the response.
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.type == "sudoku") {
                            const new_board = response.message;
                            displaySudokuPuzzle(new_board)
                        } else {
                            const grid = response.grid;
                            const cages = response.cages;
                            console.log(grid);
                            console.log(cages);
                            displayKSudokuPuzzle(grid, cages)
                        }
                    } else {
                        console.error('Request failed:', xhr.status);
                    }
                }
                document.getElementById('overlay').classList.add("invisible");
                document.getElementById('overlay').classList.remove("overlay");
            };
            xhr.send(formData);
        } else {
            alert('Please select an image to solve');

            // removing the spinner
            document.getElementById('overlay').classList.add("invisible");
            document.getElementById('overlay').classList.remove("overlay");
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

    function sendToBackend(puzzle) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData();
        if (puzzle == sudoku) {
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
                    if (response.message == "sudoku") {
                        window.location.href = '/PlaySudoku';
                    } else {
                        window.location.href = '/PlayKillerSudoku';
                    }
                } else {
                    console.error('Request failed:', xhr.status);
                    alert("The puzzle was incorrect");
                }
            }
        };
        xhr.send(formData); 
    }
});

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