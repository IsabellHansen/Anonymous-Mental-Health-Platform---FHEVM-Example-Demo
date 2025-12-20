# Encrypted Workflows

## Overview

Encrypted workflows demonstrate complex operations involving multiple encrypted values, state transitions, and multi-party interactions while maintaining complete privacy.

## Session Management Workflow

### Starting an Encrypted Session

```solidity
/// @notice Start a counseling session
function startCounselingSession(
    uint8 _sessionType,
    uint8 _severityLevel
) external onlyRegisteredPatient sessionLimitNotExceeded {
    // Validate inputs
    require(_sessionType <= 3, "Invalid session type");
    require(_severityLevel <= 10, "Severity must be 0-10");

    // Encrypt session parameters
    euint8 sessionType = FHE.asEuint8(_sessionType);
    euint8 severity = FHE.asEuint8(_severityLevel);

    // Create session record
    uint256 sessionId = nextSessionId++;
    sessions[sessionId] = CounselingSession({
        patient: msg.sender,
        sessionType: sessionType,
        severityLevel: severity,
        startTime: block.timestamp,
        completed: false
    });

    // Grant permissions
    FHE.allowThis(sessionType);
    FHE.allowThis(severity);
    FHE.allow(sessionType, msg.sender);
    FHE.allow(severity, msg.sender);

    sessionCountByPatient[msg.sender]++;
    totalSessions++;

    emit SessionStarted(sessionId, msg.sender, block.timestamp);
}
```

### Completing a Session

```solidity
/// @notice Complete a counseling session
function completeSession(
    uint256 _sessionId,
    uint8 _improvementScore
) external {
    CounselingSession storage session = sessions[_sessionId];

    require(session.patient != address(0), "Session not found");
    require(
        msg.sender == session.patient || msg.sender == authorized_counselor,
        "Not authorized"
    );
    require(!session.completed, "Already completed");
    require(_improvementScore <= 10, "Score must be 0-10");

    // Encrypt improvement score
    euint8 score = FHE.asEuint8(_improvementScore);

    // Update session
    session.completed = true;
    session.improvementScore = score;
    session.completionTime = block.timestamp;

    // Grant permissions
    FHE.allowThis(score);
    FHE.allow(score, session.patient);
    FHE.allow(score, msg.sender);

    emit SessionCompleted(_sessionId, block.timestamp);
}
```

### Session State Transitions

```
CREATED → IN_PROGRESS → COMPLETED
  ↓            ↓            ↓
  ├─ Encrypted params set
  ├─ Permissions granted
  ├─ Patient/Counselor assigned
  └─ Outcome recorded (encrypted)
```

## Therapy Plan Workflow

### Creating a Therapy Plan

```solidity
/// @notice Create encrypted therapy plan
function createTherapyPlan(
    address _patient,
    uint8 _maxSessions,
    uint256 _duration
) external onlyCounselor patientExists(_patient) {
    require(_maxSessions > 0, "Sessions must be > 0");
    require(_duration > 0, "Duration must be > 0");

    // Encrypt therapy parameters
    euint8 maxSessions = FHE.asEuint8(_maxSessions);

    // Create plan
    therapyPlans[_patient] = TherapyPlan({
        maxSessions: maxSessions,
        createdAt: block.timestamp,
        createdBy: msg.sender,
        planActive: true
    });

    // Dual permissions: Patient + Counselor
    FHE.allowThis(maxSessions);
    FHE.allow(maxSessions, _patient);      // Patient sees plan
    FHE.allow(maxSessions, msg.sender);     // Counselor manages

    emit TherapyPlanCreated(_patient, msg.sender);
}
```

### Tracking Plan Progress

```solidity
/// @notice Record session completion under therapy plan
function recordSessionUnderPlan(
    address _patient,
    uint256 _sessionId
) external onlyCounselor {
    TherapyPlan storage plan = therapyPlans[_patient];
    require(plan.planActive, "No active plan");

    CounselingSession storage session = sessions[_sessionId];
    require(session.patient == _patient, "Session mismatch");
    require(session.completed, "Session not completed");

    // Increment encrypted counter
    euint8 newCount = FHE.asEuint8(
        patientSessionsCompleted[_patient] + 1
    );

    patientSessionsCompleted[_patient] = newCount;

    FHE.allowThis(newCount);
    FHE.allow(newCount, _patient);
    FHE.allow(newCount, msg.sender);

    emit SessionRecordedUnderPlan(_patient, _sessionId);
}
```

## Multi-Party Workflow

### Patient → Counselor → Doctor

```solidity
/// @notice Escalate case to doctor
function escalateCase(address _patient, string calldata _reason)
    external
    onlyCounselor
{
    PatientProfile storage profile = patientProfiles[_patient];
    require(profile.isActive, "Patient not registered");

    // Grant doctor access
    address doctor = assigned_doctor[_patient];
    require(doctor != address(0), "No doctor assigned");

    // Doctor gains access to encrypted profile
    FHE.allow(profile.anxietyLevel, doctor);
    FHE.allow(profile.depressionLevel, doctor);
    FHE.allow(profile.stressLevel, doctor);

    // Log escalation (without exposing values)
    emit CaseEscalated(_patient, msg.sender, doctor, block.timestamp);
}
```

## Complex State Transitions

### Complete Patient Journey

```solidity
/**
 * @notice Complete workflow: Registration → Plan → Sessions → Review
 *
 * Demonstrates:
 * - Multiple state changes
 * - Permission grant/revocation
 * - Encrypted computations
 * - Multi-party coordination
 */
function completePatientJourney(
    uint8 _initialAnxiety,
    uint8 _initialDepression,
    uint8 _initialStress,
    uint8 _planSessions,
    uint8 _finalImprovement
) external {
    // Step 1: Patient Registration
    registerPatient(_initialAnxiety, _initialDepression, _initialStress);

    // Step 2: Counselor creates therapy plan
    // (assuming msg.sender is authorized)
    // createTherapyPlan(msg.sender, _planSessions, 30 days);

    // Step 3: Patient completes sessions
    // Sessions recorded with encrypted improvement scores

    // Step 4: Review final outcome
    // All data remains encrypted except events
}
```

## Event Logging for Encrypted Workflows

### Audit Trail Without Exposure

```solidity
event PatientRegistered(address indexed patient, uint256 timestamp);
event SessionStarted(uint256 indexed sessionId, address indexed patient, uint256 timestamp);
event SessionCompleted(uint256 indexed sessionId, uint256 timestamp);
event TherapyPlanCreated(address indexed patient, address indexed counselor);
event MentalHealthUpdated(address indexed patient, uint256 timestamp);
event CaseEscalated(
    address indexed patient,
    address indexed counselor,
    address indexed doctor,
    uint256 timestamp
);

// ✅ Events show actions, not encrypted values
// ❌ Never include actual health metrics in events
```

## Workflow Patterns

### Pattern 1: Create → Verify → Execute

```solidity
// Create encrypted record
euint8 value = FHE.asEuint8(input);
FHE.allowThis(value);
FHE.allow(value, user);

// Verify conditions
_checkThresholds(plaintext);

// Execute state change
state.value = value;
```

### Pattern 2: Grant → Execute → Revoke

```solidity
// Temporarily grant access
FHE.allow(sensitive, temporaryUser);

// Execute privileged operation
_performPrivilegedOperation(sensitive);

// Access ends (no revocation, just don't grant again)
```

### Pattern 3: Encrypt → Store → Retrieve → Decrypt

```solidity
// User submits plaintext
function submitData(uint8 input) external {
    // Encrypt
    euint8 encrypted = FHE.asEuint8(input);

    // Store
    userStorage[msg.sender] = encrypted;

    // Grant permissions
    FHE.allowThis(encrypted);
    FHE.allow(encrypted, msg.sender);
}

// User retrieves encrypted data
function retrieveData(address user) external view returns (euint8) {
    return userStorage[user];
}

// User decrypts client-side
// const decrypted = await fhevm.decrypt(contractAddress, encrypted);
```

## Performance Considerations

### Gas Optimization in Workflows

```solidity
// ✅ Efficient: Group related encryptions
euint8 value1 = FHE.asEuint8(input1);
euint8 value2 = FHE.asEuint8(input2);
FHE.allowThis(value1);
FHE.allowThis(value2);

// ❌ Inefficient: Separate operations
euint8 value1 = FHE.asEuint8(input1);
FHE.allowThis(value1);
euint8 value2 = FHE.asEuint8(input2);
FHE.allowThis(value2);
```

### Type Selection for Workflows

```solidity
// Use appropriate types for workflow data
euint8 healthMetrics;      // 0-10
euint16 sessionCount;      // 0-1000
euint32 treatmentDuration; // Seconds
euint64 financial;         // Large amounts
```

## Workflow Testing Strategy

### Test All Transitions

```typescript
it("Should complete full workflow", async function () {
    // 1. Register
    await registerPatient(7, 5, 6);

    // 2. Create therapy plan
    await createTherapyPlan(patient.address, 10, 2592000); // 30 days

    // 3. Start session
    await startSession(1, 8);

    // 4. Complete session
    await completeSession(1, 8);

    // 5. Verify final state
    expect(sessionStats.totalCompleted).to.equal(1);
});
```

## Key Takeaways

### Workflow Best Practices ✅

- ✅ Validate inputs before encrypting
- ✅ Grant permissions at critical points
- ✅ Use consistent state transitions
- ✅ Log actions without exposing values
- ✅ Handle errors gracefully

### Workflow Patterns ✅

- ✅ Create → Verify → Execute
- ✅ Grant → Execute → Complete
- ✅ Encrypt → Store → Retrieve → Decrypt

### Privacy in Workflows ✅

- ✅ Encrypted data throughout
- ✅ Selective access per role
- ✅ Audit trail of actions
- ✅ No plaintext in events

## Next Steps

- Study [Security](security.md) for validation in workflows
- Explore [Healthcare Use Cases](healthcare-use-cases.md) for real-world patterns
- Review test cases for workflow examples

---

[← Back to Summary](SUMMARY.md) | [Next: Security →](security.md)
