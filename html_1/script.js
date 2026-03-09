document.addEventListener("DOMContentLoaded", function() {

    const startButton = document.getElementById("startButton");

    startButton.addEventListener("click", function() {
        alert("The maze awaits...");
        console.log("Game Started");
    });

});

let remainingHealth = 5;
let startGameButton = document.getElementById("startButton");
var lives = 3;
let rocketSpeed = 1000;
let damage = 5 * 1;
console.log(damage);
let playerHealth = 100;
playerHealth = playerHealth - 10;
let playerScore = 0;
let level = 1;

function nextLevel() {
    level++;
    playerScore += 200;

    console.log("Level:", level);
    console.log("Score:", playerScore);
}
let score = 150;

if (score >= 200) {
    console.log("Level Up!");
} else {
    console.log("Keep playing!");
}
let score = 220;
let hasFuel = true;
let gameOver = false;

if (score >= 200 && hasFuel && !gameOver) {
    console.log("You can enter the next level!");
}
let level = 2;

// console output
console.log("You reached level " + level);

// screen output
document.getElementById("levelText").textContent = "You reached level " + level;