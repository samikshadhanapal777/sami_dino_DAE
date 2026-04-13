# 📚 StudyPlanner — Setup Guide

A full Study Planner with a dashboard UI + PHP + MySQL (MAMP) backend.

---

## 📁 YOUR FILE STRUCTURE

```
studyplanner/               ← Put this INSIDE your MAMP htdocs folder
├── index.html              ← Main dashboard
├── tasks.html              ← Tasks & exams page
├── styles.css              ← All styling
├── script.js               ← All JS logic + API calls
├── db.php                  ← Database connection
├── api/
│   └── tasks.php           ← PHP API (GET/POST/PATCH tasks)
└── studyplanner_setup.sql  ← Run this in phpMyAdmin first!
```

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1 — Start MAMP

1. Open the **MAMP** application
2. Click **"Start Servers"** (Apache + MySQL should turn green)
3. Click **"Open WebStart page"** to confirm it's running

---

### STEP 2 — Copy files to htdocs

Place your entire `studyplanner` folder inside MAMP's `htdocs`:

**Mac:**
```
/Applications/MAMP/htdocs/studyplanner/
```

**Windows:**
```
C:\MAMP\htdocs\studyplanner\
```

---

### STEP 3 — Create the Database in phpMyAdmin

1. Go to: **http://localhost:8888/phpMyAdmin** (Mac)
   Or: **http://localhost/phpMyAdmin** (Windows)

2. Log in with:
   - Username: `root`
   - Password: `root`

3. Click the **SQL** tab at the top

4. **Copy and paste** the entire contents of `studyplanner_setup.sql`

5. Click **Go** — this creates:
   - The `studyplanner` database
   - The `tasks` table
   - The `schedule` table
   - The `users` table
   - Sample demo data

---

### STEP 4 — Configure db.php

Open `db.php` and check these settings:

```php
define('DB_PORT', '8889');   // Mac MAMP = 8889
                              // Windows MAMP = 3306
define('DB_USER', 'root');
define('DB_PASS', 'root');
```

**Mac users:** Port is usually `8889` for MySQL
**Windows users:** Port is usually `3306` for MySQL

---

### STEP 5 — Configure script.js

Open `script.js` and change line 8:

```javascript
// Mac MAMP:
const API_BASE = 'http://localhost:8888/studyplanner/api';

// Windows MAMP:
const API_BASE = 'http://localhost/studyplanner/api';
```

---

### STEP 6 — Open in browser

**Mac:** http://localhost:8888/studyplanner/index.html
**Windows:** http://localhost/studyplanner/index.html

---

## ✅ WHAT WORKS

| Feature | Works Without DB | Works With DB |
|---------|-----------------|---------------|
| Timer | ✅ Yes | ✅ Yes |
| Demo tasks (hardcoded) | ✅ Yes | — |
| Tasks from database | ❌ | ✅ Yes |
| Add new task/exam | Demo only | ✅ Saved to DB |
| Check off tasks | Demo only | ✅ Saved to DB |
| Today's schedule | Demo data | ✅ From DB |
| Next exam display | Demo data | ✅ From DB |

> **Note:** The app works in "demo mode" even without MAMP running — it shows hardcoded sample data. Once MAMP is connected, all data comes from and saves to MySQL.

---

## 🔧 COMMON ISSUES

**"Database connection failed"**
→ Check that MAMP is running
→ Check the port number in `db.php`
→ Make sure you ran the SQL setup file

**Page shows but no tasks load**
→ Check `API_BASE` URL in `script.js`
→ Open browser DevTools → Network tab → look for red errors

**phpMyAdmin won't open**
→ Make sure Apache is running (green in MAMP)
→ Try: http://localhost:8888/ first

---

## 📌 PORTS QUICK REFERENCE

| System | Apache | MySQL |
|--------|--------|-------|
| Mac MAMP | 8888 | 8889 |
| Windows MAMP | 80 (http://localhost/) | 3306 |

---

## 🔜 NEXT STEPS (Future Features)

- `login.html` — Login page with PHP session
- `calendar.html` — Full monthly calendar view
- `subjects.html` — Subject tracker with grades
- Study session logging + statistics
