let time = 25 * 60; // default 25 minutes
let timerInterval;
let isRunning = false; // track if timer is running

let quotes = [
    "You got this 💪",
    "Stay focused 🚀",
    "One step at a time",
    "Keep going!",
    "Success is built daily"
];

// Start or resume the timer
function startTimer() {
    if (isRunning) return; // prevent multiple intervals
    isRunning = true;

    timerInterval = setInterval(function () {
        time--;

        let minutes = Math.floor(time / 60);
        let seconds = time % 60;

        document.getElementById("timer").textContent =
            minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

        if (time <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            alert("Time's up! Take a break 😊");
        }
    }, 1000);

    showQuotes();
}

// Stop/pause the timer
function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

// Reset the timer
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;

    // Check if user has entered a custom time
    const userInput = parseInt(document.getElementById("customTime").value);
    if (!isNaN(userInput) && userInput > 0) {
        time = userInput * 60; // convert minutes to seconds
    } else {
        time = 25 * 60; // default
    }

    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    document.getElementById("timer").textContent =
        minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

// Show random quotes every 10 minutes
function showQuotes() {
    setInterval(function () {
        let random = Math.floor(Math.random() * quotes.length);
        document.getElementById("quote").textContent = quotes[random];
    }, 600000); // 10 minutes
}