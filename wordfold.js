const boards = [
    {
        cells: [
            ["N", "E", "P", "C", "O"],
            ["C", "E", "T", "A", "J"],
            ["I", "G", "G", "S", "A"],
            ["L", "C", "T", "M", "E"],
            ["C", "A", "U", "S", "S"]],
        words: ["TACO", "CACTUS", "PENCIL", "EGGS", "JAMES"]
    },
    
    {
        cells: [
            ["E", "K", "O", "A", "P"],
            ["A", "W", "L", "I", "R"],
            ["N", "S", "F", "A", "T"],
            ["L", "E", "E", "R", "A"],
            ["A", "G", "G", "U", "J"]],
        words: ["TAPIR", "EAGLE", "JAGUAR", "SNAKE", "WOLF"]
    },
    {
        cells: [
            ["H", "C", "N", "A", "N"],
            ["Y", "R", "A", "A", "A"],
            ["R", "E", "A", "Y", "B"],
            ["F", "P", "P", "E", "R"],
            ["I", "G", "A", "P", "A"]],
        words: ["CHERRY", "PAPAYA", "BANANA", "PEAR", "FIG"]
    },
]



function make_cell_list() {
    let cells = [...document.getElementById("cell-holder").children];
    let cell_board = [];
    for (let i = 0; i < 25; i += 5) {
        cell_board.push(cells.slice(i, i + 5))
    }
    return cell_board;
}

function setup_game(starting_cells) {
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            CELLS[y][x].innerHTML = starting_cells[y][x];
            CELLS[y][x].classList.remove("found");
        }
    }
}

const CELLS = make_cell_list();
let selected_x = -1;
let selected_y = -1;
let backgroundIntervalId = null; // New global variable to store the interval ID
let foundWords = new Set(); // Words found in the current game
let isGameComplete = false; // Flag to ensure completion effects only run once
let currentBoardIndex = 0; // New: Tracks the current board being played
let targetWords = new Set(boards[currentBoardIndex].words); // Words to find for the current board
let isGameStarted = false; // To track if the first click has happened
let nextGameButtonAnimationId = null; // New: Animation ID for the next game button
let nextGameButton = null; // Global variable for the next game button

// Timer-related global variables
let timerIntervalId = null;
let timerAnimationId = null;
let startTime = 0;

setup_game(boards[currentBoardIndex].cells); // Use currentBoardIndex for initial setup
updateWordsDisplay();

// Initialize nextGameButton and attach event listener
nextGameButton = document.getElementById('next-game-button');
if (nextGameButton) {
    nextGameButton.addEventListener('click', handleNextGameClick);
}

// New: Create and add a reset button to the page
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset Puzzle';
resetButton.id = 'reset-button';
// Basic styling to make it visible and usable
resetButton.style.position = 'fixed';
resetButton.style.bottom = '10px';
resetButton.style.left = '10px';
resetButton.style.zIndex = '1001'; // Make sure it's on top of other elements
resetButton.style.padding = '8px 16px';
resetButton.style.cursor = 'pointer';
document.body.appendChild(resetButton);
resetButton.addEventListener('click', resetCurrentBoard);

function updateWordsDisplay() {
    const wordListHTML = boards[currentBoardIndex].words.map(word => foundWords.has(word) ? `<s>${word}</s>` : word).join(", "); // Use currentBoardIndex
    document.getElementById("words").innerHTML = "Words to spell: " + wordListHTML;
}

function move(x, y) {
    CELLS[y][x].innerHTML = CELLS[selected_y][selected_x].innerHTML + CELLS[y][x].innerHTML;
    CELLS[selected_y][selected_x].innerHTML = ""
    select(x, y);
}

function unselect(x, y) {
    CELLS[y][x].classList.remove("selected");
    selected_x = -1;
    selected_y = -1;
}

function select(x, y) {
    if (CELLS[y][x].innerHTML.length > 0) {
        playClickSound(); // Play sound on selection
        if (selected_x >= 0 && selected_y >= 0)
            CELLS[selected_y][selected_x].classList.remove("selected");
        CELLS[y][x].classList.add("selected");
        selected_y = y;
        selected_x = x;
    }
}

function is_close(a, b) {
    return Math.abs(a - b) <= 1
}

function can_move(x, y) {
    let can_move = is_close(selected_x, x) && selected_y == y || is_close(selected_y, y) && selected_x == x;

    return selected_x >= 0 && selected_y >= 0 && can_move && CELLS[y][x].innerHTML.length > 0
}

// New function to generate a random hex color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// New function to start the background color animation
function startBackgroundAnimation() {
    // Clear any existing interval to prevent multiple intervals running simultaneously
    if (backgroundIntervalId) {
        clearInterval(backgroundIntervalId);
    }
    backgroundIntervalId = setInterval(() => {
        document.body.style.backgroundColor = getRandomColor();
    }, 1000); // Change every .25 second
    console.log("Background color animation started!");
}

// New function to trigger screen spin
function triggerScreenSpin() {
    const body = document.body;
    body.classList.add('spin-active');

    // Remove the class after the animation completes (3 spins * 1 second/spin = 3 seconds)
    setTimeout(() => {
        body.classList.remove('spin-active');
    }, 3000);
}

// New function to play a sound on click
function playClickSound() {
    // Using a very short, non-intrusive sound is best for clicks
    const clickSound = new Audio('sounds/beep.mp3'); // <-- IMPORTANT: Replace with your sound file
    clickSound.play().catch(e => console.error("Error playing click sound:", e));
}

// New function to play a sound when a word is completed
function playWordCompleteSound() {
    const wordSound = new Audio('sounds/ding.mp3'); // <-- IMPORTANT: Replace with your sound file
    wordSound.play().catch(e => console.error("Error playing word complete sound:", e));
}
// New function to play cheering sound
function playCheeringSound() {
    const cheeringSound = new Audio('sounds/cheer.mp3'); // <--- IMPORTANT: Replace with your actual sound file path
    cheeringSound.play().catch(e => console.error("Error playing sound:", e));
}

// New function to trigger a confetti rain effect for 5 seconds
function triggerConfetti() {
    const duration = 20 * 1000;
    const animationEnd = Date.now() + duration;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        const defaults = { startVelocity: 30, spread: 720, ticks: 60, zIndex: 100 };

        confetti({ ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({ ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// New function to create and animate a bouncing box
function triggerBouncingBox() {
    const box = document.createElement('div');
    box.id = 'bouncing-box';
    box.innerHTML = "You Win!";
    document.body.appendChild(box);

    // Box properties (size must match CSS)
    const boxSize = 250;
    let x = Math.random() * (window.innerWidth - boxSize);
    let y = Math.random() * (window.innerHeight - boxSize);
    let dx = 5.5; // Horizontal speed
    let dy = 5.5; // Vertical speed

    function animate() {
        // Get viewport dimensions
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Check for wall collisions
        if (x + boxSize >= vw || x <= 0) {
            dx = -dx;
        }
        if (y + boxSize >= vh || y <= 0) {
            dy = -dy;
        }

        // Update position
        x += dx;
        y += dy;

        // Apply new position
        box.style.left = x + 'px';
        box.style.top = y + 'px';

        requestAnimationFrame(animate);
    }
    animate();
}

// New function to create, animate, and manage the game timer
function startTimerAndAnimation() {
    const timerBox = document.getElementById('timer-box');
    if (!timerBox) {
        console.error("Timer box element with id 'timer-box' not found in HTML!");
        return;
    }

    timerBox.classList.add('is-floating'); // Add class to enable floating via CSS

    // Reset timer state in case of a new game
    if (timerIntervalId) clearInterval(timerIntervalId);
    if (timerAnimationId) cancelAnimationFrame(timerAnimationId);
    timerBox.classList.remove('finished');

    // --- Timer Logic ---
    startTime = Date.now();
    timerIntervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        timerBox.textContent = `${minutes}:${seconds}`;
    }, 1000);

    // --- Animation Logic (adapted from triggerBouncingBox) ---
    const boxWidth = 120; // Must match CSS width
    const boxHeight = 60; // Must match CSS height
    let x = Math.random() * (window.innerWidth - boxWidth);
    let y = Math.random() * (window.innerHeight - boxHeight);
    let dx = 2; // Horizontal speed
    let dy = 2; // Vertical speed

    function animate() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (x + boxWidth >= vw || x <= 0) dx = -dx;
        if (y + boxHeight >= vh || y <= 0) dy = -dy;

        x += dx;
        y += dy;

        timerBox.style.left = x + 'px';
        timerBox.style.top = y + 'px';

        timerAnimationId = requestAnimationFrame(animate);
    }
    animate();
}

// New function to stop the timer and turn it green
function stopTimer() {
    clearInterval(timerIntervalId);
    const timerBox = document.getElementById('timer-box');
    if (timerBox) {
        timerBox.classList.add('finished');
    }
    // We let the animation continue so it keeps floating.
}
// Placeholder function for game completion check

// New functions to manage the "Next Game?" button
function handleNextGameClick() {
    hideNextGameButton(); // Hide the button immediately
    loadNextBoard(); // Load the next board
}

function showNextGameButton() {
    if (!nextGameButton) return;

    nextGameButton.style.display = 'block';
    nextGameButton.style.position = 'absolute'; // Make it absolute for dynamic positioning

    // Get button dimensions after it's displayed
    const buttonRect = nextGameButton.getBoundingClientRect();
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;

    // Initial random position
    let x = Math.random() * (window.innerWidth - buttonWidth);
    let y = Math.random() * (window.innerHeight - buttonHeight);
    let dx = 3; // Horizontal speed
    let dy = 3; // Vertical speed

    // Ensure it doesn't start off-screen
    x = Math.max(0, Math.min(x, window.innerWidth - buttonWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - buttonHeight));

    function animateButton() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Reverse direction if hitting horizontal boundaries
        if (x + buttonWidth >= vw || x <= 0) {
            dx = -dx;
        }
        // Reverse direction if hitting vertical boundaries
        if (y + buttonHeight >= vh || y <= 0) {
            dy = -dy;
        }

        x += dx;
        y += dy;

        nextGameButton.style.left = x + 'px';
        nextGameButton.style.top = y + 'px';

        nextGameButtonAnimationId = requestAnimationFrame(animateButton);
    }
    animateButton(); // Start the animation
}

function hideNextGameButton() {
    if (!nextGameButton) return;

    cancelAnimationFrame(nextGameButtonAnimationId); // Stop the animation
    nextGameButton.style.display = 'none';
    nextGameButton.style.left = ''; // Clear inline styles
    nextGameButton.style.top = '';
}

// New function to load the next game board
function loadNextBoard() {
    // Increment board index, loop back to 0 if at the end
    currentBoardIndex = (currentBoardIndex + 1) % boards.length;

    // Reset game state for the new board
    foundWords.clear(); // Clear found words from previous game
    isGameComplete = false; // Reset game completion flag
    isGameStarted = false; // Reset game started flag (timer will wait for first click)

    // Reset timer display and state
    clearInterval(timerIntervalId);
    cancelAnimationFrame(timerAnimationId);
    const timerBox = document.getElementById('timer-box');
    if (timerBox) {
        timerBox.textContent = '00:00'; // Reset display
        timerBox.classList.remove('finished', 'is-floating'); // Remove completion and floating styles
        timerBox.style.left = ''; // Clear inline position styles
        timerBox.style.top = '';  // Clear inline position styles
    }

    // Clear background animation
    clearInterval(backgroundIntervalId);
    document.body.style.backgroundColor = ''; // Reset body background

    // Remove bouncing box if it exists
    const bouncingBox = document.getElementById('bouncing-box');
    if (bouncingBox) {
        bouncingBox.remove();
    }
    hideNextGameButton(); // Ensure button is hidden when a new game starts

    // Update target words for the new board
    targetWords = new Set(boards[currentBoardIndex].words);

    // Setup the new game board and update display
    setup_game(boards[currentBoardIndex].cells);
    updateWordsDisplay();
}

// New function to reset the current game board
function resetCurrentBoard() {
    // Reset game state for the current board
    foundWords.clear();
    isGameComplete = false;
    isGameStarted = false; // Reset game started flag (timer will wait for first click)

    // Reset timer display and state
    clearInterval(timerIntervalId);
    cancelAnimationFrame(timerAnimationId);
    const timerBox = document.getElementById('timer-box');
    if (timerBox) {
        timerBox.textContent = '00:00';
        timerBox.classList.remove('finished', 'is-floating');
        timerBox.style.left = '';
        timerBox.style.top = '';
    }

    // Clear background animation and other win effects
    clearInterval(backgroundIntervalId);
    document.body.style.backgroundColor = '';

    const bouncingBox = document.getElementById('bouncing-box');
    if (bouncingBox) {
        bouncingBox.remove();
    }
    hideNextGameButton();

    // Unselect any selected cell
    if (selected_x >= 0 && selected_y >= 0) {
        unselect(selected_x, selected_y);
    }

    // Setup the game board again with the initial state for the current board
    setup_game(boards[currentBoardIndex].cells);
    updateWordsDisplay();
}

// This function needs to be fully implemented to detect when all words are spelled.
// This function now checks for spelled words, updates the UI, and returns if the game is complete.
function checkForCompletion() {
    let newlyFound = false;
    // Iterate through all cells to find spelled words
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const cellContent = CELLS[y][x].innerHTML;
            // Check if the cell content is a target word and not already found
            if (targetWords.has(cellContent) && !foundWords.has(cellContent)) {
                playWordCompleteSound(); // Play sound for finding a word
                foundWords.add(cellContent);
                CELLS[y][x].classList.add("found"); // Add a class to style the found word cell
                newlyFound = true;
            }
        }
    }

    // If a new word was found, update the display
    if (newlyFound) {
        updateWordsDisplay();
    }

    // Return true if all words have been found
    return foundWords.size === targetWords.size;
}

function on_click(x, y) {
    // Start the timer on the very first click
    if (!isGameStarted) {
        isGameStarted = true;
        startTimerAndAnimation();
    }

    if (selected_x == x && selected_y == y) {
        unselect(x, y)
    } else if (can_move(x, y)) {
        move(x, y)
        // After a move, check if the game is complete, and run effects only once
        if (!isGameComplete && checkForCompletion()) {
            isGameComplete = true; // Set flag to prevent re-triggering
            stopTimer(); // Stop the timer and turn it green
            startBackgroundAnimation();
            triggerConfetti();
            triggerScreenSpin(); // Trigger screen spin
            playCheeringSound(); // Play cheering sound
            triggerBouncingBox(); // Start the bouncing box
            showNextGameButton(); // Show the "Next Game?" button
        }
    } else {
        select(x, y)
    }
}
