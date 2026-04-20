// =============================================
//   STUDYPLANNER — script.js
//   All frontend logic + API calls to PHP backend
// =============================================

// ---- CONFIG: Change this to your MAMP localhost path ----
const API_BASE = 'http://localhost:8888/studyplanner/api';
// On Windows MAMP it's usually: http://localhost/studyplanner/api
// On Mac MAMP it's usually:     http://localhost:8888/studyplanner/api

// =============================================
//   TIMER
// =============================================
let time = 0;
let timerInterval;
let isRunning = false;

function startTimer() {
    const customInput = document.getElementById("customTime").value;
    if (time === 0 && customInput > 0) {
        time = customInput * 60;
    }
    if (isRunning) return;
    isRunning = true;

    timerInterval = setInterval(() => {
        time--;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        document.getElementById("timer").textContent =
            String(minutes).padStart(2,'0') + ":" + String(seconds).padStart(2,'0');

        if (time <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            setStatus("Time's up! Great work! 🎉");
        } else if (time < 60) {
            setStatus("Almost done! Keep pushing! 💪");
        } else {
            setStatus("Keep going! You're doing great! 🔥");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    setStatus("Timer paused.");
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    time = 0;
    document.getElementById("timer").textContent = "00:00";
    setStatus("Timer reset.");
}

function setStatus(msg) {
    document.getElementById("status").textContent = msg;
}


// =============================================
//   TODAY'S SCHEDULE (loaded from DB via PHP)
// =============================================
async function loadSchedule() {
    try {
        const res = await fetch(`${API_BASE}/tasks.php?type=schedule`);
        const data = await res.json();
        const list = document.getElementById("scheduleList");
        if (!list) return;

        if (data.length === 0) {
            list.innerHTML = '<p style="color:var(--muted);font-size:0.9rem">No sessions scheduled today.</p>';
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="schedule-item">
                <span class="sched-time">${formatTime(item.time)}</span>
                <div>
                    <div class="sched-title">${escHtml(item.title)}</div>
                    <div class="sched-sub">${escHtml(item.subtitle || '')}</div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        loadScheduleDemo();
    }
}

function loadScheduleDemo() {
    const list = document.getElementById("scheduleList");
    if (!list) return;
    const demo = [
        { time: "10:00 AM", title: "Biology Revision", subtitle: "Chapter 5 Review" },
        { time: "11:30 AM", title: "Math Practice",    subtitle: "Algebra Exercises" },
        { time: "1:00 PM",  title: "History Notes",    subtitle: "WWII Summary" },
        { time: "2:30 PM",  title: "English Essay",    subtitle: "Outline & Draft" },
    ];
    list.innerHTML = demo.map(item => `
        <div class="schedule-item">
            <span class="sched-time">${item.time}</span>
            <div>
                <div class="sched-title">${item.title}</div>
                <div class="sched-sub">${item.subtitle}</div>
            </div>
        </div>
    `).join('');
}


// =============================================
//   TASK LIST (loaded from DB via PHP)
// =============================================
async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/tasks.php?type=tasks`);
        const data = await res.json();
        renderTasks(data);
        updateTaskCount(data.length);
    } catch (e) {
        renderTasks([
            { id: 1, title: "Read Chapter 5 - Biology", done: 0 },
            { id: 2, title: "Complete Algebra Worksheet", done: 0 },
            { id: 3, title: "Research WWII Events", done: 0 },
        ]);
    }
}

function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    if (!list) return;
    list.innerHTML = tasks.slice(0,5).map(t => `
        <li class="task-item">
            <input type="checkbox" id="t${t.id}" ${t.done ? 'checked' : ''}
                   onchange="toggleTask(${t.id}, this.checked)">
            <label for="t${t.id}">${escHtml(t.title)}</label>
        </li>
    `).join('');
}

async function toggleTask(id, done) {
    try {
        await fetch(`${API_BASE}/tasks.php`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, done: done ? 1 : 0 })
        });
    } catch (e) { /* offline demo */ }
}

function updateTaskCount(n) {
    const el = document.getElementById("taskCount");
    if (el) el.textContent = n;
}


// =============================================
//   ADD TEST (modal)
// =============================================
function openModal() {
    document.getElementById("addTestModal").style.display = "flex";
}
function closeModal() {
    document.getElementById("addTestModal").style.display = "none";
}

async function addTest() {
    const name = document.getElementById("testName").value.trim();
    const date = document.getElementById("testDate").value;

    if (!name || !date) {
        alert("Please fill in both fields!");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/tasks.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: name, date, type: 'exam' })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ Test "${name}" added for ${date}!`);
            closeModal();
            loadTasks();
            loadNextExam();
        }
    } catch (e) {
        alert(`✅ Test "${name}" added for ${date}! (Demo mode)`);
        closeModal();
    }
}


// =============================================
//   NEXT EXAM (from DB)
// =============================================
async function loadNextExam() {
    try {
        const res = await fetch(`${API_BASE}/tasks.php?type=next_exam`);
        const data = await res.json();
        if (data.title) {
            document.getElementById("nextExamName").textContent = data.title;
            document.getElementById("nextExamDate").textContent = formatDate(data.date);
        }
    } catch (e) { /* uses HTML default */ }
}


// =============================================
//   WEEKLY CALENDAR (visual only)
// =============================================
function renderWeekCalendar() {
    const body = document.getElementById("weekBody");
    if (!body) return;

    const events = [
        { col: 0, label: "Biology Study", time: "11:00 AM", cls: "ev-green" },
        { col: 1, label: "Math Practice", time: "1:00 PM",  cls: "ev-orange" },
        { col: 2, label: "History Notes", time: "1:00 PM",  cls: "ev-blue" },
        { col: 3, label: "English Essay", time: "1:00 PM",  cls: "ev-red" },
        { col: 5, label: "Physics Lab",   time: "3:00 PM",  cls: "ev-purple" },
    ];

    const cells = Array.from({length: 7}, (_, i) => {
        const cell = document.createElement('div');
        cell.className = 'week-cell';
        events.filter(e => e.col === i).forEach(ev => {
            cell.innerHTML += `
                <div class="week-event ${ev.cls}">
                    ${ev.label}<br>
                    <span class="ev-time">${ev.time}</span>
                </div>`;
        });
        return cell;
    });

    cells.forEach(c => body.appendChild(c));

    const freeBar = document.createElement('div');
    freeBar.className = 'free-time-bar';
    freeBar.textContent = 'Free Time';
    body.parentElement.appendChild(freeBar);
}


// =============================================
//   ROTATING QUOTES
// =============================================
const quotes = [
    "Stay focused &<br>achieve your goals!",
    "Small progress is<br>still progress! 📈",
    "Discipline beats<br>motivation every time.",
    "You got this!<br>Keep pushing! 💪",
    "One step at a time<br>leads to the top. 🏆"
];
let quoteIdx = 0;

function rotateQuote() {
    quoteIdx = (quoteIdx + 1) % quotes.length;
    const el = document.getElementById("heroQuote");
    if (el) el.innerHTML = quotes[quoteIdx];
}

setInterval(rotateQuote, 5000);


// =============================================
//   HELPERS
// =============================================
function formatTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

// =============================================
//   SIGN OUT
//   Clears the session (sp_user) but keeps the
//   account saved so "Welcome back" works next time
// =============================================
function signOut() {
    if (confirm("Sign out?")) {
        localStorage.removeItem('sp_user');        // clear session
        localStorage.setItem('sp_first_visit', '0'); // next login = "Welcome back"
        window.location.href = 'login.html';
    }
}


// =============================================
//   INIT — runs when page loads
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    loadSchedule();
    loadTasks();
    loadNextExam();
    renderWeekCalendar();
});
