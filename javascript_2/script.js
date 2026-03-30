// ---------------- TIMER ----------------
let time = 0;
let timerInterval;
let isRunning = false;

function startTimer() {
    let customInput = document.getElementById("customTime").value;

    // if user entered a time AND timer is 0, set it
    if (time === 0 && customInput > 0) {
        time = customInput * 60;
    }

    if (isRunning) return;

    isRunning = true;

    timerInterval = setInterval(function () {
        time--;

        let minutes = Math.floor(time / 60);
        let seconds = time % 60;

        document.getElementById("timer").textContent =
            minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

        // ELSE IF statement requirement
        if (time <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            document.getElementById("status").textContent = "Time's up!";
        } else if (time < 60) {
            document.getElementById("status").textContent = "Almost done!";
        } else {
            document.getElementById("status").textContent = "Keep going!";
        }

    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    time = 0;

    document.getElementById("timer").textContent = "00:00";
    document.getElementById("status").textContent = "Timer reset!";
}


// ---------------- TEST PLANNER ----------------
function addTest() {
    let name = document.getElementById("testName").value;
    let date = document.getElementById("testDate").value;

    if (name === "" || date === "") {
        document.getElementById("status").textContent = "Enter test details!";
        return;
    }

    document.getElementById("status").textContent =
        "Test added: " + name + " on " + date;
}


// ---------------- QUOTES ----------------
let quotes = [
    "Stay focused.",
    "You got this.",
    "Small progress is still progress.",
    "Discipline beats motivation.",
    "Keep pushing forward."
];

// TAG NAME requirement
let quoteElement = document.getElementsByTagName("p")[0];

function showQuote() {
    let randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = quotes[randomIndex];
}

// change quote every 5 seconds
setInterval(showQuote, 5000);


// ---------------- MUSIC CONTROL ----------------
let music = document.getElementById("music");

// CLASS NAME requirement (you will add class later if needed)
function toggleMusic() {
    if (music.paused) {
        music.play();
    } else {
        music.pause();
    }
}


// ---------------- ADD ATTRIBUTE + CSS CHANGE ----------------

// Add a new attribute dynamically
document.getElementById("timer").setAttribute("data-active", "true");

// Change CSS using JavaScript
document.getElementById("timer").style.color = "lightgreen";
document.getElementById("timer").style.fontWeight = "bold";