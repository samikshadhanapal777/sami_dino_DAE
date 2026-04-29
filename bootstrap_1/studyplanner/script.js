// =============================================
//   STUDYPLANNER — script.js
// =============================================

const API_BASE  = window.location.origin + '/studyplanner/api';
const AUTH_BASE = window.location.origin + '/studyplanner/auth.php';

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
//   TASK LIST (loaded from DB via PHP)
// =============================================
async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/tasks.php?type=tasks`, {
            credentials: 'include'
        });
        const data = await res.json();
        renderTasks(data);
        const incomplete = data.filter(t => !t.done).length;
        updateTaskCount(incomplete);
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
    if (!tasks || tasks.length === 0) {
        list.innerHTML = '<li class="task-item" style="color:var(--muted);font-size:0.9rem">No tasks yet — add one on the Tasks page!</li>';
        return;
    }
    list.innerHTML = tasks.slice(0,5).map(t => `
        <li class="task-item">
            <input type="checkbox" id="t${t.id}" ${t.done ? 'checked' : ''}
                   onchange="toggleTask(${t.id}, this.checked)">
            <label for="t${t.id}" style="${t.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${escHtml(t.title)}</label>
        </li>
    `).join('');
}

async function toggleTask(id, done) {
    try {
        await fetch(`${API_BASE}/tasks.php`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, done: done ? 1 : 0 })
        });
        // Reload to update task count
        loadTasks();
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
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: name, date, type: 'exam' })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Test "${name}" added for ${date}!`);
            closeModal();
            loadTasks();
            loadNextExam();
        }
    } catch (e) {
        alert(`Test "${name}" added for ${date}! (Demo mode)`);
        closeModal();
    }
}


// =============================================
//   NEXT EXAM (from DB)
// =============================================
async function loadNextExam() {
    try {
        const res = await fetch(`${API_BASE}/tasks.php?type=next_exam`, {
            credentials: 'include'
        });
        const data = await res.json();
        if (data.title) {
            document.getElementById("nextExamName").textContent = data.title;
            document.getElementById("nextExamDate").textContent = formatDate(data.due_date || data.date);
        } else {
            document.getElementById("nextExamName").textContent = "None upcoming";
            document.getElementById("nextExamDate").textContent = "";
        }
    } catch (e) { /* uses HTML default */ }
}


// =============================================
//   WEEKLY CALENDAR (visual — shows current week)
// =============================================
function renderWeekCalendar() {
    const body = document.getElementById("weekBody");
    if (!body) return;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    // Start from Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    // Update header with actual dates
    const headerSpans = document.querySelectorAll('.week-header span');
    headerSpans.forEach((span, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        span.textContent = days[i] + ' ' + d.getDate();
        if (d.toDateString() === today.toDateString()) {
            span.style.color = 'var(--blue)';
            span.style.fontWeight = '900';
        }
    });

    // Fetch tasks to show on calendar
    fetch(`${API_BASE}/tasks.php?type=tasks`, { credentials: 'include' })
        .then(r => r.json())
        .then(tasks => {
            body.innerHTML = '';
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const isToday = d.toDateString() === today.toDateString();

                const cell = document.createElement('div');
                cell.className = 'week-cell' + (isToday ? ' today-cell' : '');

                const dayTasks = tasks.filter(t => t.due_date === dateStr);
                dayTasks.forEach(t => {
                    const ev = document.createElement('div');
                    ev.className = 'week-event ' + (t.type === 'exam' ? 'ev-red' : 'ev-blue');
                    ev.title = t.title;
                    ev.textContent = t.title.length > 14 ? t.title.slice(0,14) + '…' : t.title;
                    cell.appendChild(ev);
                });

                body.appendChild(cell);
            }
        })
        .catch(() => {
            // Demo events if not logged in
            const demoEvents = [
                { col: 0, label: "Biology Study", cls: "ev-green" },
                { col: 2, label: "History Notes", cls: "ev-blue" },
                { col: 4, label: "Math Exam",     cls: "ev-red" },
            ];
            body.innerHTML = '';
            for (let i = 0; i < 7; i++) {
                const cell = document.createElement('div');
                cell.className = 'week-cell';
                demoEvents.filter(e => e.col === i).forEach(ev => {
                    cell.innerHTML += `<div class="week-event ${ev.cls}">${ev.label}</div>`;
                });
                body.appendChild(cell);
            }
        });
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
function formatDate(d) {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
// =============================================
async function signOut() {
    if (!confirm("Sign out?")) return;
    try {
        const res = await fetch(`${AUTH_BASE}?action=signout`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        await res.json();
    } catch(e) {}
    localStorage.removeItem('sp_user');
    localStorage.setItem('sp_first_visit', '0');
    window.location.replace('login.html');
}


// =============================================
//   INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    loadNextExam();
    renderWeekCalendar();
});
