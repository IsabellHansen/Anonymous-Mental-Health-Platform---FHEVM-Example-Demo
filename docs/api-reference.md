# API Reference

## Contract Interface

### Patient Registration

#### registerPatient

```solidity
function registerPatient(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external
```

**Purpose:** Register a new patient with encrypted mental health levels.

**Parameters:**
- `_anxietyLevel` (uint8): Anxiety level 0-10
- `_depressionLevel` (uint8): Depression level 0-10
- `_stressLevel` (uint8): Stress level 0-10

**Requirements:**
- Caller must not be already registered
- All levels must be ≤ 10

**Returns:** None

**Events:**
- `PatientRegistered(address indexed patient, uint256 timestamp)`
- `EmergencyAlert(address indexed patient, uint256 timestamp)` (if thresholds exceeded)

**Example:**
```typescript
const tx = await contract.registerPatient(7, 5, 6);
await tx.wait();
```

---

### Mental Health Updates

#### updateMentalHealthLevels

```solidity
function updateMentalHealthLevels(
    uint8 _anxietyLevel,
    uint8 _depressionLevel,
    uint8 _stressLevel
) external onlyRegisteredPatient
```

**Purpose:** Update patient's mental health metrics.

**Parameters:**
- `_anxietyLevel` (uint8): New anxiety level 0-10
- `_depressionLevel` (uint8): New depression level 0-10
- `_stressLevel` (uint8): New stress level 0-10

**Requirements:**
- Caller must be registered patient
- All levels must be ≤ 10

**Events:**
- `MentalHealthUpdated(address indexed patient, uint256 timestamp)`

**Example:**
```typescript
const tx = await contract.updateMentalHealthLevels(8, 6, 7);
await tx.wait();
```

---

### Session Management

#### startCounselingSession

```solidity
function startCounselingSession(
    uint8 _sessionType,
    uint8 _severityLevel
) external onlyRegisteredPatient sessionLimitNotExceeded
```

**Purpose:** Start a new counseling session.

**Parameters:**
- `_sessionType` (uint8): Session type (0-3)
  - 0: Individual therapy
  - 1: Crisis intervention
  - 2: Follow-up
  - 3: Assessment
- `_severityLevel` (uint8): Severity indicator 0-10

**Requirements:**
- Caller must be registered
- Session slots must be available
- Minimum break time between sessions

**Returns:** None

**Events:**
- `SessionStarted(uint256 indexed sessionId, address indexed patient, uint256 timestamp)`

**Example:**
```typescript
const tx = await contract.startCounselingSession(0, 8);
await tx.wait();
```

---

#### completeSession

```solidity
function completeSession(
    uint256 _sessionId,
    uint8 _improvementScore
) external
```

**Purpose:** Mark a session as completed with improvement score.

**Parameters:**
- `_sessionId` (uint256): ID of session to complete
- `_improvementScore` (uint8): Patient's improvement (0-10)

**Requirements:**
- Session must exist and not be completed
- Caller must be patient or assigned counselor
- Improvement score must be ≤ 10

**Events:**
- `SessionCompleted(uint256 indexed sessionId, uint256 timestamp)`

**Example:**
```typescript
const tx = await contract.completeSession(1, 8);
await tx.wait();
```

---

### Therapy Plans

#### createTherapyPlan

```solidity
function createTherapyPlan(
    address _patient,
    uint8 _maxSessions,
    uint256 _duration
) external onlyCounselor
```

**Purpose:** Create encrypted therapy plan for patient.

**Parameters:**
- `_patient` (address): Patient address
- `_maxSessions` (uint8): Maximum sessions in plan
- `_duration` (uint256): Plan duration in seconds

**Requirements:**
- Caller must be authorized counselor
- Patient must be registered
- Max sessions must be > 0

**Events:**
- `TherapyPlanCreated(address indexed patient, address indexed counselor)`

**Example:**
```typescript
const tx = await contract.createTherapyPlan(
    patientAddress,
    12,
    2592000  // 30 days
);
await tx.wait();
```

---

### View Functions

#### isPatientRegistered

```solidity
function isPatientRegistered(address _patient)
    external
    view
    returns (bool)
```

**Purpose:** Check if patient is registered.

**Parameters:**
- `_patient` (address): Patient address to check

**Returns:**
- `bool`: True if patient is registered

**Example:**
```typescript
const isRegistered = await contract.isPatientRegistered(patientAddress);
console.log(`Patient registered: ${isRegistered}`);
```

---

#### getPatientProfile

```solidity
function patientProfiles(address _patient)
    external
    view
    returns (PatientProfile memory)
```

**Purpose:** Get patient's profile (encrypted data).

**Parameters:**
- `_patient` (address): Patient address

**Returns:**
- `PatientProfile`: Encrypted profile data
  - `anxietyLevel` (euint8)
  - `depressionLevel` (euint8)
  - `stressLevel` (euint8)
  - `isActive` (bool)
  - `registrationTime` (uint256)

**Requirements:**
- Caller must be the patient or their assigned counselor

**Example:**
```typescript
const profile = await contract.patientProfiles(patientAddress);
// Client-side decryption
const anxiety = await fhevm.decrypt(contractAddress, profile.anxietyLevel);
```

---

#### getSessionStats

```solidity
function getSessionStats()
    external
    view
    returns (uint16 totalSessions, uint256 totalCompleted, uint256 totalImprovement)
```

**Purpose:** Get global session statistics.

**Returns:**
- `totalSessions` (uint16): Total sessions created
- `totalCompleted` (uint256): Total completed sessions
- `totalImprovement` (uint256): Sum of improvement scores

**Example:**
```typescript
const stats = await contract.getSessionStats();
console.log(`Total sessions: ${stats.totalSessions}`);
```

---

#### getSessionInfo

```solidity
function getSessionInfo(uint256 _sessionId)
    external
    view
    returns (CounselingSession memory)
```

**Purpose:** Get session details.

**Parameters:**
- `_sessionId` (uint256): Session ID

**Returns:**
- `CounselingSession`: Session information
  - `patient` (address)
  - `sessionType` (euint8)
  - `severityLevel` (euint8)
  - `startTime` (uint256)
  - `completed` (bool)
  - `completionTime` (uint256)

**Example:**
```typescript
const session = await contract.getSessionInfo(1);
const type = await fhevm.decrypt(contractAddress, session.sessionType);
```

---

#### getTherapyPlanStatus

```solidity
function getTherapyPlanStatus(address _patient)
    external
    view
    returns (bool planActive, uint256 createdAt)
```

**Purpose:** Check therapy plan status.

**Parameters:**
- `_patient` (address): Patient address

**Returns:**
- `planActive` (bool): Whether plan is active
- `createdAt` (uint256): Plan creation timestamp

**Example:**
```typescript
const { planActive } = await contract.getTherapyPlanStatus(patientAddress);
console.log(`Plan active: ${planActive}`);
```

---

#### getPatientSessionCount

```solidity
function getPatientSessionCount(address _patient)
    external
    view
    returns (uint256)
```

**Purpose:** Get number of sessions for a patient.

**Parameters:**
- `_patient` (address): Patient address

**Returns:**
- `uint256`: Number of sessions

**Example:**
```typescript
const count = await contract.getPatientSessionCount(patientAddress);
console.log(`Patient sessions: ${count}`);
```

---

## Events

### PatientRegistered

```solidity
event PatientRegistered(address indexed patient, uint256 timestamp);
```

Emitted when a patient registers.

---

### MentalHealthUpdated

```solidity
event MentalHealthUpdated(address indexed patient, uint256 timestamp);
```

Emitted when patient updates health levels.

---

### SessionStarted

```solidity
event SessionStarted(
    uint256 indexed sessionId,
    address indexed patient,
    uint256 timestamp
);
```

Emitted when a session starts.

---

### SessionCompleted

```solidity
event SessionCompleted(uint256 indexed sessionId, uint256 timestamp);
```

Emitted when a session completes.

---

### TherapyPlanCreated

```solidity
event TherapyPlanCreated(
    address indexed patient,
    address indexed counselor
);
```

Emitted when a therapy plan is created.

---

### EmergencyAlert

```solidity
event EmergencyAlert(address indexed patient, uint256 timestamp);
```

Emitted when emergency thresholds are exceeded.

---

### CounselorNotification

```solidity
event CounselorNotification(
    address indexed counselor,
    address indexed patient,
    string message,
    uint256 timestamp
);
```

Emitted when counselor needs notification.

---

## Data Structures

### PatientProfile

```solidity
struct PatientProfile {
    euint8 anxietyLevel;
    euint8 depressionLevel;
    euint8 stressLevel;
    bool isActive;
    uint256 registrationTime;
}
```

---

### CounselingSession

```solidity
struct CounselingSession {
    address patient;
    euint8 sessionType;
    euint8 severityLevel;
    uint256 startTime;
    bool completed;
    uint256 completionTime;
}
```

---

### TherapyPlan

```solidity
struct TherapyPlan {
    euint8 maxSessions;
    uint256 createdAt;
    address createdBy;
    bool planActive;
}
```

---

## Modifiers

### onlyRegisteredPatient

Restricts function to registered patients.

```solidity
modifier onlyRegisteredPatient() {
    require(isPatientRegistered(msg.sender), "Patient not registered");
    _;
}
```

---

### onlyCounselor

Restricts function to authorized counselors.

```solidity
modifier onlyCounselor() {
    require(isCounselor(msg.sender), "Not authorized counselor");
    _;
}
```

---

### sessionLimitNotExceeded

Ensures session limit not exceeded.

```solidity
modifier sessionLimitNotExceeded() {
    require(totalSessions < MAX_CONCURRENT_SESSIONS, "No session slots available");
    _;
}
```

---

## Constants

```solidity
uint8 public constant MAX_HEALTH_LEVEL = 10;
uint256 public constant SESSION_BREAK_PERIOD = 1 hours;
uint256 public constant MAX_CONCURRENT_SESSIONS = 100;
```

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Patient not registered" | Caller not registered | Call `registerPatient()` first |
| "Already registered" | Patient already exists | Use different address |
| "Levels must be 0-10" | Input out of range | Validate input range |
| "No session slots available" | Session limit reached | Wait for sessions to complete |
| "Not authorized" | Insufficient permissions | Check role/assignment |
| "Session not found" | Invalid session ID | Verify session exists |
| "Already completed" | Session already done | Use different session |

---

## Integration Examples

### Basic Usage

```typescript
// 1. Register patient
await contract.registerPatient(7, 5, 6);

// 2. Check registration
const isRegistered = await contract.isPatientRegistered(patientAddress);

// 3. Get encrypted profile
const profile = await contract.patientProfiles(patientAddress);

// 4. Decrypt client-side
const anxiety = await fhevm.decrypt(contractAddress, profile.anxietyLevel);

// 5. Update metrics
await contract.updateMentalHealthLevels(8, 6, 7);
```

### Session Management

```typescript
// 1. Start session
const tx1 = await contract.startCounselingSession(0, 8);
const receipt1 = await tx1.wait();

// 2. Complete session
const tx2 = await contract.completeSession(1, 8);
const receipt2 = await tx2.wait();

// 3. Get stats
const stats = await contract.getSessionStats();
```

### Event Monitoring

```typescript
// Monitor emergency alerts
contract.on("EmergencyAlert", (patient, timestamp) => {
    console.log(`Emergency for ${patient}`);
});

// Monitor session completions
contract.on("SessionCompleted", (sessionId, timestamp) => {
    console.log(`Session ${sessionId} completed`);
});
```

---

## Next Steps

- Review [Contract Functions](contract-functions.md) for detailed implementations
- Study [Testing Guide](testing-guide.md) for usage examples
- Check Zama FHEVM documentation for encryption API

---

[← Back to Summary](SUMMARY.md)
