# MediGuardian Backend API

A production-grade Node.js and Express backend with MongoDB (Mongoose) powering the MediGuardian smart medication management system and automated IoT dispenser (ESP32).

## Table of Contents
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
- [API Endpoints & Documentation](#api-endpoints--documentation)
  - [1. User Medication Schedule for Today](#1-get-apiusersuseridmedicationstoday)
  - [2. ESP32 BLE Sync Matrix](#2-get-apiusersuseridsync-matrix)
  - [3. Dose Taken Status Update](#3-patch-apimedicationsmedicationidstatus)
  - [4. Silo Assignment (Create Medication)](#4-post-apimedications)
- [ESP32 BLE Hardware Consumption Guide](#esp32-ble-hardware-consumption-guide)

---

## Architecture & Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Strict schema rules with regex time validation (`HH:mm`) and enum silo restrictions (`1-4`)
- **Optimization**: Zero-overhead JSON array serialization for BLE transmission

---

## Project Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── models/
│   │   ├── User.js               # Patient & caregiver model
│   │   └── Medication.js         # Medication, silo & time schema
│   ├── services/
│   │   ├── medicationService.js  # Schedule & status business logic
│   │   └── syncMatrixService.js  # Minutes-from-midnight conversion & matrix sorting
│   ├── controllers/
│   │   ├── medicationController.js # HTTP request handlers
│   │   └── userController.js     # User profile handlers
│   ├── middleware/
│   │   ├── validateRequest.js    # Payload & ObjectId validation
│   │   └── errorHandler.js       # Centralized error handler
│   ├── routes/
│   │   ├── medicationRoutes.js   # /api/medications routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   └── index.js              # Combined API router
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # HTTP listener & process signals
│   └── seed.js                   # Demo data seeder
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/mediguardian
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data (Optional)
```bash
npm run seed
```

### 4. Start Server
```bash
# Development with auto-restart
npm run dev

# Production
npm start
```

---

## API Endpoints & Documentation

### 1. `GET /api/users/:userId/medications/today`
Retrieves all medications scheduled for the requested user for today, ordered chronologically.

**Sample Request**:
```http
GET /api/users/65f1234567890123456789ab/medications/today HTTP/1.1
Host: localhost:5000
```

**Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f123456789012345678901",
      "userId": "65f1234567890123456789ab",
      "medicineName": "Atorvastatin (Lipitor)",
      "dosage": 1,
      "siloId": 1,
      "scheduledTime": "08:00",
      "taken": true,
      "takenAt": "2026-09-21T08:05:00.000Z",
      "notes": "Take with morning glass of water",
      "createdAt": "2026-09-21T06:00:00.000Z",
      "updatedAt": "2026-09-21T08:05:00.000Z"
    },
    {
      "_id": "65f123456789012345678902",
      "userId": "65f1234567890123456789ab",
      "medicineName": "Metformin HCl",
      "dosage": 2,
      "siloId": 2,
      "scheduledTime": "12:30",
      "taken": false,
      "takenAt": null,
      "notes": "Take with lunch meal",
      "createdAt": "2026-09-21T06:00:00.000Z",
      "updatedAt": "2026-09-21T06:00:00.000Z"
    },
    {
      "_id": "65f123456789012345678903",
      "userId": "65f1234567890123456789ab",
      "medicineName": "Lisinopril",
      "dosage": 1,
      "siloId": 3,
      "scheduledTime": "18:00",
      "taken": false,
      "takenAt": null,
      "notes": "Blood pressure maintenance",
      "createdAt": "2026-09-21T06:00:00.000Z",
      "updatedAt": "2026-09-21T06:00:00.000Z"
    }
  ]
}
```

---

### 2. `GET /api/users/:userId/sync-matrix`
Returns an ultra-lean JSON matrix representation for the ESP32 BLE dispenser:
`[[siloId, timeInMinutesFromMidnight, doseCount]]`

**Design Principles**:
- No string keys, object wrappers, or MongoDB IDs to save BLE packet bandwidth.
- Sorted strictly in chronological order.
- Time converted to minutes: `08:00` $\rightarrow 480$, `12:30` $\rightarrow 750$, `18:00` $\rightarrow 1080$.

**Sample Request**:
```http
GET /api/users/65f1234567890123456789ab/sync-matrix HTTP/1.1
Host: localhost:5000
```

**Sample Response (`200 OK`)**:
```json
[
  [1, 480, 1],
  [2, 750, 2],
  [3, 1080, 1]
]
```

---

### 3. `PATCH /api/medications/:medicationId/status`
Updates the dose taken state. Used by both the mobile/web frontend and the ESP32 (via an HTTP gateway or mobile bridge).

**Sample Request**:
```http
PATCH /api/medications/65f123456789012345678902/status HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "taken": true
}
```

**Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Dose status updated to TAKEN",
  "data": {
    "_id": "65f123456789012345678902",
    "userId": "65f1234567890123456789ab",
    "medicineName": "Metformin HCl",
    "dosage": 2,
    "siloId": 2,
    "scheduledTime": "12:30",
    "taken": true,
    "takenAt": "2026-09-21T12:32:15.120Z",
    "updatedAt": "2026-09-21T12:32:15.120Z"
  }
}
```

---

### 4. `POST /api/medications`
Adds a new medication schedule assigned to a specific silo (1–4).

**Sample Request**:
```http
POST /api/medications HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "userId": "65f1234567890123456789ab",
  "medicineName": "Melatonin",
  "dosage": 1,
  "siloId": 4,
  "scheduledTime": "21:30",
  "notes": "Take before sleeping"
}
```

---

## ESP32 BLE Hardware Consumption Guide

### How the ESP32 Consumes `/sync-matrix`
The ESP32 microcontroller typically receives this matrix via Bluetooth Low Energy (BLE) from a caregiver's smartphone or a BLE gateway.

#### C++ Data Structure on ESP32:
```cpp
#pragma pack(push, 1)
struct ScheduleItem {
  uint8_t siloId;       // Silo 1 - 4
  uint16_t minuteOfDay; // 0 - 1439 (minutes from midnight)
  uint8_t doseCount;    // Number of pills to dispense
};
#pragma pack(pop)

// Maximum 16 scheduled doses per day
ScheduleItem dailySchedule[16];
uint8_t scheduleCount = 0;
```

#### Arduino / ESP32 Deserialization Routine:
```cpp
#include <ArduinoJson.h>

void parseSyncMatrix(const char* jsonPayload) {
  // Allocate static JSON document to prevent heap fragmentation
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, jsonPayload);
  
  if (err) {
    Serial.printf("[BLE] Deserialization failed: %s\n", err.c_str());
    return;
  }
  
  JsonArray array = doc.as<JsonArray>();
  scheduleCount = 0;
  
  for (JsonArray item : array) {
    if (scheduleCount >= 16) break;
    
    dailySchedule[scheduleCount].siloId = item[0].as<uint8_t>();
    dailySchedule[scheduleCount].minuteOfDay = item[1].as<uint16_t>();
    dailySchedule[scheduleCount].doseCount = item[2].as<uint8_t>();
    
    Serial.printf("[Schedule #%d] Silo: %d, Time: %02d:%02d (%d min), Dose: %d\n",
      scheduleCount + 1,
      dailySchedule[scheduleCount].siloId,
      dailySchedule[scheduleCount].minuteOfDay / 60,
      dailySchedule[scheduleCount].minuteOfDay % 60,
      dailySchedule[scheduleCount].minuteOfDay,
      dailySchedule[scheduleCount].doseCount
    );
    
    scheduleCount++;
  }
  
  Serial.printf("[BLE] Successfully synchronized %d schedule items.\n", scheduleCount);
}
```
