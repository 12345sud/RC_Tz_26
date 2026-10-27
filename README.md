# 🕹️ RC ARCADE (Air Hockey) - Tournament Web Portal
**Robotics Club, National Institute of Technology Warangal (NITW) • Technozion**

A Next.js web application built for the **Arcade (Air Hockey)** event. It features real-time RFID tap integration, dynamic student database lookup, live digital scorekeeping, and an instant leaderboard.

---

## 🌟 Key Features

1. **Section 1: Live Scorecard (Left)**
   - Autonomous **ROBOT** vs **PLAYER** (Student) arena.
   - Student name automatically fetched from the database when selected from the waiting list.
   - Manual point controls: `+` and `-` buttons with big retro digital LED displays.
   - `RESET` button to reset match scores to 0.
   - `SAVE SCORE` button: records match outcome, fires victory confetti, updates leaderboard, and advances the queue.

2. **Section 2: Arcade Leaderboard (Middle)**
   - Top banner displaying **TOTAL PLAYERS PLAYED** (synced with every saved match).
   - Ranked **Top 10 High Scores** table with custom Gold, Silver, and Bronze badges.
   - Detailed breakdown showing Player Score vs Robot Score and Match Result (WON / LOST / DRAW).

3. **Section 3: Waiting List Queue (Right)**
   - Scrollable FIFO list displaying roll numbers in real-time as students register.
   - Clicking **ANY roll number** queries the database and immediately displays the student's name on the Scorecard.
   - **`+ MANUAL REGISTRATION`** button: opens an registration modal (designed for students without RFID cards) with auto-lookup and name prefilling.

4. **Embedded Hardware RFID Integration**
   - Live REST API endpoint for ESP32, Arduino, Raspberry Pi, or RFID scanners.
   - Microcontroller posts student roll numbers -> Server auto-matches student name and queues them into the Waiting List.
   - Built-in **RFID Hardware Simulator** in the UI to test card taps with 1 click.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **💡 Zero-Friction Ready Out-of-the-Box:**  
> The system has a built-in data fallback engine! Even before you configure MongoDB Atlas, the application automatically loads and indexes all **9,934 student contacts** directly from `contacts_mql.js`. All lookups, manual registrations, RFID taps, and leaderboards work immediately!

---

## 📡 Embedded Team RFID API Documentation

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **HTTP Method** | `POST` | Must be POST |
| **Endpoint URL** | `http://<server-ip>:3000/api/arcade/scan` | Live endpoint |
| **Fallback URL** | `http://<server-ip>:3000/api/rfid/scan` | Works identically as an alias |
| **Header: Content-Type** | `application/json` | Required |
| **Header: x-api-key** | `rc_arcade_rfid_2026` | Default secret authentication key |

### Request Payload Format (JSON)
```json
{
  "rollNumber": "23CEB0B10"
}
```
*(The endpoint also accepts `rollNo`, `roll_number`, or `rfid`)*

### Example cURL Request
```bash
curl -X POST "http://localhost:3000/api/arcade/scan" \
  -H "Content-Type: application/json" \
  -H "x-api-key: rc_arcade_rfid_2026" \
  -d '{"rollNumber": "23CEB0B10"}'
```

### ESP32 / Arduino C++ Snippet
```cpp
#include <HTTPClient.h>

void onRfidCardScanned(String rollNo) {
  HTTPClient http;
  http.begin("http://192.168.1.100:3000/api/arcade/scan"); // Replace with host IP
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", "rc_arcade_rfid_2026");
  
  String payload = "{\"rollNumber\":\"" + rollNo + "\"}";
  int responseCode = http.POST(payload);
  
  if (responseCode > 0) {
    Serial.println("Queued: " + http.getString());
  } else {
    Serial.printf("Error: %d\n", responseCode);
  }
  http.end();
}
```

---

## 🍃 MongoDB Setup & Seeding Guide

Follow these 5 simple steps to set up your free MongoDB database and import `contacts_mql.js`:

### Step 1: Create a Free MongoDB Atlas Account
1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and click **Try Free**.
2. Sign up with Google or Email.

### Step 2: Create a Free Shared Cluster
1. Choose the **M0 Free** tier (Free forever, 512MB storage).
2. Select your closest AWS or Google Cloud region (e.g., `Mumbai / ap-south-1`).
3. Click **Create Deployment**.

### Step 3: Set Database Username & Password
1. In the **Security Quickstart** prompt, create a database username (e.g. `arcade_admin`) and a password.
2. Under **IP Access List**, click **Add My Current IP Address** (or select `0.0.0.0/0` to allow access from anywhere during the event).

### Step 4: Copy the Connection String
1. Click **Database** in the left sidebar, then click **Connect** next to your cluster.
2. Select **Drivers** (Node.js).
3. Copy the URI string from Atlas:
   ```text
   mongodb+srv://<username>:<password>@<cluster-url>/<db_name>?retryWrites=true&w=majority
   ```
4. Open `.env.local` in this project directory and paste your connection string:
   ```env
   MONGODB_URI="your_mongodb_connection_string_here"
   ```

### Step 5: Seed the 9,934 Contacts into MongoDB
Run the automated seed script:
```bash
npm run seed
```
The script will:
- Connect to your MongoDB cluster
- Parse all 9,934 student records from `contacts_mql.js`
- Create unique indexes on `rollNumber`
- Bulk-insert all contacts in batches
- Initialize `waiting_list` and `leaderboard` collections
